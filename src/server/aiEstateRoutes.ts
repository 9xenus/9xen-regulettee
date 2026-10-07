/**
 * AI ESTATE & SHADOW-IT ROUTES  (mounted at /api/v1/ai-estate)
 *
 * - Scan GitHub / GitLab repos, pasted files, and websites for AI-regulation / AI-security violations
 * - Detect and track Shadow IT / Shadow AI per connected entity
 * - Route every remediation through the existing human-approval (HITL) fixation queue
 *
 * Security: all routes require authentication; tenant comes from the session (admins may override);
 * outbound fetches are SSRF-guarded; repo tokens are used for the single request and never stored/logged.
 */
import { Router, Response } from 'express';
import crypto from 'crypto';
import dns from 'node:dns/promises';
import net from 'node:net';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { getDb } from '../db/sqlite.js';
import { ensureClientFixationTables } from './clientFixationRoutes.js';
import { storedSoftwareIntegrations } from './integrationsService.js';
import { LexDB } from '../services/LexDB.js';
import {
  AiEstateScanner, ESTATE_RULES, AI_PROVIDER_DOMAINS, detectKind, isScannablePath,
  type EstateFile, type EstateScanResult, type EstateFinding
} from '../services/ai-estate-scanner.js';
import { AiAssetDiscovery, AiSystemClassifier } from '../services/ai-asset-classifier.js';
import { frameworkPosture, penaltyExposure, findingRisk, playbookFor, type PostureFinding, type EntityProfile, type Sev } from '../services/ai-posture-scoring.js';
import { DataLeakageDetector, PromptInjectionTestEngine, type EndpointAttackResult } from '../services/ai-leak-injection-tests.js';
import { EvidenceBundle } from '../services/ai-evidence-bundle.js';
import { analyzeHeaders, PROBES, type ProbeFinding } from '../services/web-api-probe.js';
import { AiComplianceRiskEngine } from '../services/ai-compliance-risk-engine.js';
import { BlockchainAuditTrail } from '../services/blockchain-audit-trail.js';
import { ShadowItDetector, SAAS_CATALOG, type ShadowObservation } from '../services/shadow-it-detector.js';
import {
  insertAiRiskAuditRun, insertAiRiskFinding, getAiRiskFinding, updateAiRiskFindingFixStatus, listAiRiskFindings, getAiRiskAuditRun,
  upsertShadowItAsset, listShadowItAssets, getShadowItAsset, updateShadowItAssetStatus, getShadowItSummary,
  upsertAiAsset, listAiAssets, getAiAsset, confirmAiAssetClass, listEstateScans, getEvidenceBundle
} from '../db/ai-risk-repository.js';

export const aiEstateRouter = Router();
aiEstateRouter.use(requireAuth);

// ── helpers ──────────────────────────────────────────────────────────────────

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export function tenantOf(req: AuthenticatedRequest): string {
  const own = req.user?.tenantId || 'default-tenant';
  const asked = (req.body && req.body.tenantId) || (req.query && (req.query.tenantId as string));
  return asked && req.user && ADMIN_ROLES.includes(req.user.role) ? String(asked) : own;
}

export const cleanId = (v: unknown, fallback: string): string => {
  const s = typeof v === 'string' ? v.trim() : '';
  return /^[\w.:@ -]{1,80}$/.test(s) ? s : fallback;
};

export function fail(res: Response, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

function sanctionedFromRegistry(extra: unknown): string[] {
  const out = new Set<string>();
  for (const i of storedSoftwareIntegrations) {
    out.add(i.name.toLowerCase());
    try { if (i.settings?.apiUrl) out.add(new URL(i.settings.apiUrl).hostname.toLowerCase()); } catch { /* ignore bad url */ }
  }
  if (Array.isArray(extra)) extra.forEach(e => typeof e === 'string' && e.trim() && out.add(e.trim().toLowerCase()));
  return Array.from(out);
}

// ── SSRF guard + bounded fetch ───────────────────────────────────────────────

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
}

export class UrlRejectedError extends Error {}
const reject = (m: string) => new UrlRejectedError(m);
const statusFor = (e: unknown, fallback = 500) => (e instanceof UrlRejectedError ? 400 : fallback);

export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let u: URL;
  try { u = new URL(raw); } catch { throw reject('Invalid URL'); }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw reject('Only http(s) URLs are allowed');
  if (u.username || u.password) throw reject('Credentials in URL are not allowed');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (/^(localhost|.*\.local|.*\.internal)$/i.test(host)) throw reject('Target host is not allowed');
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) throw reject('Target resolves to a private or reserved address');
  return u;
}

async function boundedFetch(
  url: string,
  init: { headers?: Record<string, string>; maxBytes?: number; guard?: boolean; method?: 'GET' | 'POST'; body?: string } = {}
): Promise<{ status: number; text: string; headers: Record<string, string> }> {
  const maxBytes = init.maxBytes ?? 400_000;
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    if (init.guard !== false) await assertPublicHttpUrl(current);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    try {
      const r = await fetch(current, { method: init.method || 'GET', headers: init.headers, body: init.body, redirect: 'manual', signal: ctrl.signal });
      if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
        current = new URL(r.headers.get('location')!, current).toString();
        continue;
      }
      const reader = r.body?.getReader();
      let received = 0; const chunks: Uint8Array[] = [];
      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.length;
          if (received > maxBytes) { ctrl.abort(); break; }
          chunks.push(value);
        }
      }
      const headers: Record<string, string> = {};
      r.headers.forEach((v, k) => { headers[k] = v; });
      const cookies = (r.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.();
      if (cookies?.length) headers['set-cookie'] = cookies.join(', ');
      return { status: r.status, text: Buffer.concat(chunks).toString('utf8'), headers };
    } finally { clearTimeout(timer); }
  }
  throw new Error('Too many redirects');
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
}

const PRIORITY = [
  /\.github\/workflows\//, /\.gitlab-ci\.ya?ml$/, /\.tf$|\.tfvars$|\.bicep$/, /(mcp|agent|crew|langgraph)[^/]*\.(json|ya?ml)$/i,
  /docker-compose|dockerfile|\.env/i, /\.(py|ts|js|go|java)$/
];
// Infra/config first, then files whose PATH suggests AI usage, then other code — so the cap spends its budget where AI risk lives.
const AI_HINT = /(^|[\/_.-])(ai|llm|agents?|gemini|openai|anthropic|claude|prompts?|models?|rag|embed\w*|vector|mcp|chat\w*|guard\w*|inference|copilot|assistant|langchain|bedrock|vertex|risk|policy)([\/_.-]|$)/i;
const rank = (p: string) => {
  const i = PRIORITY.findIndex(re => re.test(p));
  if (i !== -1 && i < 5) return i;
  if (AI_HINT.test(p) && /\.(py|ts|tsx|js|jsx|go|java|cs|rb|php|json|ya?ml)$/i.test(p)) return 4.5;
  return i === 5 ? 5 : 99;
};
const MAX_FILES = 120;
const MAX_FILE_BYTES = 200_000;

// ── persistence of scans into the existing AI-risk audit tables ──────────────

function persistScan(tenantId: string, entityId: string, sourceRef: string, r: EstateScanResult): void {
  const db = getDb();
  db.transaction(() => {
    insertAiRiskAuditRun({
      id: r.scanId, tenantId, title: `AI Estate Scan: ${sourceRef}`, auditType: 'ESTATE_SCAN', status: 'COMPLETED',
      overallRiskScore: r.riskScore, criticalFindingsCount: r.counts.CRITICAL, highFindingsCount: r.counts.HIGH,
      mediumFindingsCount: r.counts.MEDIUM, lowFindingsCount: r.counts.LOW, complianceRating: r.complianceRating,
      modelsScanned: { entityId, sourceRef, filesScanned: r.filesScanned, byKind: r.byKind, aiProviders: r.aiProvidersDetected.map(p => p.provider) },
      frameworksEvaluated: ['EU AI Act (Regulation 2024/1689)', 'GDPR', 'OWASP Top 10 for LLM Applications', 'ISO/IEC 42001'],
      maxPenaltyExposureEur: r.totalPenaltyExposureEur, auditSummary: r.summary
    });
    for (const f of r.findings.slice(0, 500)) {
      insertAiRiskFinding({
        id: f.id, auditId: r.scanId, tenantId, title: f.title, modelTarget: `${entityId}:${f.path}`, framework: f.framework,
        articleReference: f.articleRef, severity: f.severity, category: f.category, description: `[${f.ruleId}] ${f.title}`,
        affectedCodeOrPrompt: `${f.path}:${f.line} | ${f.evidence}`, penaltyExposureEur: f.penaltyExposureEur,
        fixStatus: 'OPEN', fixProposal: f.remediation, appliedFixId: null
      });
    }
  })();
}

async function auditEvent(tenantId: string, action: string, target: string, severity: 'INFO' | 'WARNING' | 'CRITICAL', payload: unknown) {
  try {
    await LexDB.recordAuditEvent({ tenant_id: tenantId, actor_id: 'AI_ESTATE_SCANNER', module: 'AI_ESTATE', action, status: 'SUCCESS', severity, target, payload });
  } catch { /* audit is best-effort here */ }
}

/** Enqueue a remediation proposal into the existing human-approval queue. Never auto-applies. */
function proposeToHitl(tenantId: string, target: string, issue: string, fixAction: string, proposedBy: string): string {
  ensureClientFixationTables();
  const id = `cfx_${crypto.randomBytes(4).toString('hex')}`;
  getDb().prepare(
    `INSERT INTO client_fixation_hitl_queue (id, tenant_id, target, issue, fix_action, fix_type, proposed_by, risk_notes, status) VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(id, tenantId, target.slice(0, 300), issue.slice(0, 600), fixAction.slice(0, 1200), 'CUSTOM', proposedBy,
    `Proposed by ${proposedBy} · HITL gate required · not auto-applied.`, 'PENDING_APPROVAL');
  return id;
}

interface Coverage { totalFiles: number; scannable: number; scanned: number; oversizeSkipped: number; notReachedDueToCap: number; oversizeExamples: string[] }
interface ScanCtx { files: EstateFile[]; allPaths?: string[]; coverage?: Coverage; gate?: { maxCritical?: number; maxHigh?: number; minScore?: number } }

/** Persists the scan, discovers + classifies AI assets, seals evidence, evaluates an optional CI gate. */
function respondScan(res: Response, tenantId: string, entityId: string, sourceRef: string, result: EstateScanResult, ctx: ScanCtx, sanctioned: string[]) {
  persistScan(tenantId, entityId, sourceRef, result);

  let assets: unknown[] = [];
  try {
    const found = AiAssetDiscovery.discover(ctx.files, { allPaths: ctx.allPaths, sanctioned });
    for (const a of found) {
      const c = AiSystemClassifier.classify(a);
      upsertAiAsset({ id: a.id, tenantId, entityId, type: a.type, name: a.name, vendor: a.vendor, region: a.region, sanctioned: a.sanctioned,
        riskClass: c.riskClass, annexArea: c.annexArea, confidence: c.confidence, requiresReview: c.requiresHumanReview,
        signals: c.signals, obligations: c.obligations, rationale: c.rationale, locations: a.locations });
      assets.push({ id: a.id, type: a.type, name: a.name, riskClass: c.riskClass, annexArea: c.annexArea, confidence: c.confidence, requiresHumanReview: c.requiresHumanReview });
    }
  } catch (e) { console.warn('[AI_ESTATE] asset discovery failed:', (e as Error).message); }

  let evidence: unknown = null;
  try {
    const b = EvidenceBundle.seal(tenantId, result.scanId);
    evidence = b;
    try { BlockchainAuditTrail.anchor({ actor: 'ai-estate-scanner', action: 'ESTATE_SCAN_SEALED', category: 'AI_ESTATE', resource: `ai_risk_audit_runs/${result.scanId}`, refId: b.bundleId, payload: { merkleRoot: b.merkleRoot, leafCount: b.leafCount } }); } catch { /* anchoring is best-effort */ }
  } catch (e) { evidence = { error: (e as Error).message }; }

  void auditEvent(tenantId, 'AI_ESTATE_SCAN_COMPLETED', sourceRef, result.counts.CRITICAL ? 'CRITICAL' : result.counts.HIGH ? 'WARNING' : 'INFO',
    { scanId: result.scanId, entityId, counts: result.counts, riskScore: result.riskScore });
  const gate = ctx.gate ? AiEstateScanner.gate(result, ctx.gate) : undefined;
  return res.json({ success: true, result, assets, evidence, gate, coverage: ctx.coverage });
}

// ── scan endpoints ───────────────────────────────────────────────────────────

// Pasted / uploaded files
aiEstateRouter.post('/scan', async (req: AuthenticatedRequest, res) => {
  try {
    const files = Array.isArray(req.body?.files) ? (req.body.files as EstateFile[]) : [];
    if (!files.length) return fail(res, 400, 'files[] ({path, content}) is required');
    if (files.length > 200) return fail(res, 400, 'Maximum 200 files per request');
    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary');
    const clean: EstateFile[] = files.map(f => ({ path: String(f.path || ''), content: String(f.content ?? '') }));
    const sanctioned = sanctionedFromRegistry(req.body?.sanctionedProviders);
    const result = AiEstateScanner.scan(clean, { sanctionedProviders: sanctioned, tenantId });
    return respondScan(res, tenantId, entityId, cleanId(req.body?.sourceRef, 'uploaded-files'), result, { files: clean, gate: req.body?.gate }, sanctioned);
  } catch (e: any) { return fail(res, 500, e.message); }
});

// GitHub repository
aiEstateRouter.post('/scan/github', async (req: AuthenticatedRequest, res) => {
  try {
    const repo = String(req.body?.repo || '').trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return fail(res, 400, 'repo must be "owner/name"');
    const ref = /^[\w./-]{1,100}$/.test(String(req.body?.ref || 'HEAD')) ? String(req.body?.ref || 'HEAD') : 'HEAD';
    const token = typeof req.body?.token === 'string' && req.body.token ? req.body.token : '';
    const headers: Record<string, string> = { 'User-Agent': '9xen-regulettee-estate-scanner', Accept: 'application/vnd.github+json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const tree = await boundedFetch(`https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`, { headers, maxBytes: 4_000_000, guard: false });
    if (tree.status === 404) return fail(res, 404, 'Repository not found or not accessible (private repos need a token).');
    if (tree.status === 403 || tree.status === 429) return fail(res, 429, 'GitHub rate limit reached — provide a token or retry later.');
    if (tree.status !== 200) return fail(res, 502, `GitHub returned ${tree.status}`);
    const entries: { path: string; type: string; size?: number }[] = JSON.parse(tree.text).tree || [];
    const blobs = entries.filter(e => e.type === 'blob');
    const scannable = blobs.filter(e => isScannablePath(e.path));
    const oversize = scannable.filter(e => (e.size ?? 0) >= MAX_FILE_BYTES);
    const candidates = scannable.filter(e => (e.size ?? 0) < MAX_FILE_BYTES).sort((a, b) => rank(a.path) - rank(b.path));
    const cap = Math.min(400, Math.max(20, Number(req.body?.maxFiles) || MAX_FILES));
    const picks = candidates.slice(0, cap);

    const files = (await mapLimit(picks, 6, async (e) => {
      const url = token
        ? `https://api.github.com/repos/${repo}/contents/${e.path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(ref)}`
        : `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(ref)}/${e.path.split('/').map(encodeURIComponent).join('/')}`;
      try {
        const r = await boundedFetch(url, { headers: token ? { ...headers, Accept: 'application/vnd.github.raw' } : { 'User-Agent': headers['User-Agent'] }, guard: false });
        return r.status === 200 ? { path: e.path, content: r.text } : null;
      } catch { return null; }
    })).filter((f): f is EstateFile => !!f);

    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary');
    const sanctioned = sanctionedFromRegistry(req.body?.sanctionedProviders);
    let result = AiEstateScanner.scan(files, { sanctionedProviders: sanctioned, tenantId });
    result.filesSkipped = Math.max(0, scannable.length - files.length);
    result = AiEstateScanner.rescore(result, []);   // refresh the summary so it states what was NOT scanned
    const coverage: Coverage = { totalFiles: blobs.length, scannable: scannable.length, scanned: files.length, oversizeSkipped: oversize.length,
      notReachedDueToCap: Math.max(0, candidates.length - picks.length), oversizeExamples: oversize.slice(0, 5).map(e => `${e.path} (${Math.round((e.size ?? 0) / 1024)} KB)`) };
    return respondScan(res, tenantId, entityId, `github:${repo}@${ref}`, result, { files, allPaths: blobs.map(e => e.path), coverage, gate: req.body?.gate }, sanctioned);
  } catch (e: any) { return fail(res, 500, String(e.message).replace(/Bearer\s+\S+/g, 'Bearer ***')); }
});

// GitLab project (gitlab.com or self-hosted)
aiEstateRouter.post('/scan/gitlab', async (req: AuthenticatedRequest, res) => {
  try {
    const project = String(req.body?.project || '').trim();
    if (!/^(\d+|[\w.-]+(\/[\w.-]+)+)$/.test(project)) return fail(res, 400, 'project must be a numeric id or "group/name"');
    const base = (String(req.body?.baseUrl || 'https://gitlab.com')).replace(/\/+$/, '');
    await assertPublicHttpUrl(base);
    const ref = /^[\w./-]{1,100}$/.test(String(req.body?.ref || '')) ? String(req.body.ref) : 'HEAD';
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const headers: Record<string, string> = token ? { 'PRIVATE-TOKEN': token } : {};
    const pid = encodeURIComponent(project);

    const entries: { path: string; type: string }[] = [];
    for (let page = 1; page <= 5; page++) {
      const r = await boundedFetch(`${base}/api/v4/projects/${pid}/repository/tree?recursive=true&per_page=100&page=${page}&ref=${encodeURIComponent(ref)}`, { headers, maxBytes: 2_000_000 });
      if (r.status === 404 || r.status === 401) return fail(res, r.status, 'Project not found or not accessible (private projects need a token).');
      if (r.status !== 200) return fail(res, 502, `GitLab returned ${r.status}`);
      const batch = JSON.parse(r.text); entries.push(...batch); if (batch.length < 100) break;
    }
    const glBlobs = entries.filter(e => e.type === 'blob');
    const glScannable = glBlobs.filter(e => isScannablePath(e.path)).sort((a, b) => rank(a.path) - rank(b.path));
    const cap = Math.min(400, Math.max(20, Number(req.body?.maxFiles) || MAX_FILES));
    const picks = glScannable.slice(0, cap);
    const files = (await mapLimit(picks, 6, async (e) => {
      try {
        const r = await boundedFetch(`${base}/api/v4/projects/${pid}/repository/files/${encodeURIComponent(e.path)}/raw?ref=${encodeURIComponent(ref)}`, { headers });
        return r.status === 200 ? { path: e.path, content: r.text } : null;
      } catch { return null; }
    })).filter((f): f is EstateFile => !!f);

    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary');
    const sanctioned = sanctionedFromRegistry(req.body?.sanctionedProviders);
    let result = AiEstateScanner.scan(files, { sanctionedProviders: sanctioned, tenantId });
    result.filesSkipped = Math.max(0, glScannable.length - files.length);
    result = AiEstateScanner.rescore(result, []);
    const coverage: Coverage = { totalFiles: glBlobs.length, scannable: glScannable.length, scanned: files.length, oversizeSkipped: 0, notReachedDueToCap: Math.max(0, glScannable.length - picks.length), oversizeExamples: [] };
    return respondScan(res, tenantId, entityId, `gitlab:${project}@${ref}`, result, { files, allPaths: glBlobs.map(e => e.path), coverage, gate: req.body?.gate }, sanctioned);
  } catch (e: any) { return fail(res, statusFor(e), String(e.message).replace(/PRIVATE-TOKEN\S*/g, '***')); }
});

// Website: static HTML + response-header analysis. With `confirmOwnership: true` it also issues plain GET requests
// to a short FIXED list of well-known paths (API docs, exposed .env/.git, unauthenticated model APIs).
function probeToFinding(pf: ProbeFinding): EstateFinding {
  return { id: `EST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, ruleId: pf.ruleId, title: pf.title, kind: 'WEBSITE', path: pf.path, line: 1,
    severity: pf.severity, framework: pf.framework, articleRef: pf.articleRef, category: pf.category, penaltyExposureEur: pf.penaltyEur,
    evidence: pf.evidence, remediation: pf.remediation };
}

aiEstateRouter.post('/scan/website', async (req: AuthenticatedRequest, res) => {
  try {
    const url = String(req.body?.url || '').trim();
    if (!url) return fail(res, 400, 'url is required');
    const page = await boundedFetch(url, { maxBytes: 2_000_000, headers: { 'User-Agent': '9xen-regulettee-estate-scanner', Accept: 'text/html' } });
    if (page.status >= 400) return fail(res, 502, `Site returned ${page.status}`);
    const u = new URL(url);
    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary');
    const sanctioned = sanctionedFromRegistry(req.body?.sanctionedProviders);
    const file: EstateFile = { path: u.hostname + '/index.html', content: page.text, kind: 'WEBSITE' };
    let result = AiEstateScanner.scan([file], { sanctionedProviders: sanctioned, tenantId });

    const extra: EstateFinding[] = analyzeHeaders(u, page.headers).map(probeToFinding);
    if (req.body?.confirmOwnership === true) {
      for (const probe of PROBES) {
        try {
          const r = await boundedFetch(`${u.origin}${probe.path}`, { maxBytes: 200_000, headers: { 'User-Agent': '9xen-regulettee-estate-scanner' } });
          const f = probe.test(r.status, r.text, r.headers['content-type'] || '');
          if (f) extra.push(probeToFinding({ ...f, path: u.hostname + probe.path }));
        } catch { /* unreachable path: ignore */ }
      }
    }
    result = AiEstateScanner.rescore(result, extra);
    return respondScan(res, tenantId, entityId, `website:${u.hostname}`, result, { files: [file], gate: req.body?.gate }, sanctioned);
  } catch (e: any) { return fail(res, statusFor(e), e.message); }
});

// ── propose a fix for a scan finding (HITL) ──────────────────────────────────

aiEstateRouter.post('/findings/:id/fix', async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = tenantOf(req);
    const f = getAiRiskFinding(req.params.id);
    if (!f || f.tenant_id !== tenantId) return fail(res, 404, 'Finding not found');
    if (f.fix_status === 'PROPOSED') return fail(res, 409, 'A fix has already been proposed for this finding');
    const proposalId = proposeToHitl(tenantId, f.model_target, `${f.title} — ${f.article_reference}`, f.fix_proposal || 'Manual remediation required', 'ai-estate-scanner');
    updateAiRiskFindingFixStatus(f.id, 'PROPOSED', proposalId);
    void auditEvent(tenantId, 'AI_ESTATE_FIX_PROPOSED', f.model_target, 'INFO', { findingId: f.id, proposalId });
    return res.status(201).json({ success: true, proposalId, status: 'PENDING_APPROVAL' });
  } catch (e: any) { return fail(res, 500, e.message); }
});

// ── shadow IT / shadow AI ────────────────────────────────────────────────────

aiEstateRouter.post('/shadow-it/analyze', async (req: AuthenticatedRequest, res) => {
  try {
    const raw = req.body?.observations;
    const observations: ShadowObservation[] = Array.isArray(raw) ? raw : ShadowItDetector.parseObservations(String(req.body?.rawLog || ''));
    if (!observations.length) return fail(res, 400, 'observations[] or rawLog is required');
    if (observations.length > 5000) return fail(res, 400, 'Maximum 5000 observations per request');
    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary');
    const analysis = ShadowItDetector.analyze(observations, sanctionedFromRegistry(req.body?.sanctioned));

    const existing = new Map(listShadowItAssets(tenantId, entityId).map(a => [a.identifier, a.id]));
    const proposeAll = req.body?.proposeFixes === true;
    const saved = analysis.assets.map(a => {
      const id = existing.get(a.identifier) || `sit_${crypto.randomBytes(5).toString('hex')}`;
      upsertShadowItAsset({
        id, tenantId, entityId, identifier: a.identifier, name: a.name, category: a.category, verdict: a.verdict, riskScore: a.riskScore,
        severity: a.severity, users: a.users, sources: a.sources, trainsOnData: a.trainsOnData, dataResidency: a.dataResidency,
        riskFactors: a.riskFactors, recommendedFixes: a.recommendedFixes, firstSeen: a.firstSeen, lastSeen: a.lastSeen
      });
      if (proposeAll && a.verdict !== 'SANCTIONED' && (a.severity === 'CRITICAL' || a.severity === 'HIGH')) {
        const row = getShadowItAsset(id, tenantId);
        if (row && row.status === 'DETECTED') {
          const pid = proposeToHitl(tenantId, `${entityId}:${a.identifier}`, `${a.verdict} · ${a.name} · risk ${a.riskScore}/100`,
            a.recommendedFixes.map(f => `${f.action}: ${f.description}`).join(' | '), 'shadow-it-detector');
          updateShadowItAssetStatus(id, tenantId, 'FIX_PROPOSED', pid);
        }
      }
      return { id, ...a };
    });
    void auditEvent(tenantId, 'SHADOW_IT_ANALYSIS_COMPLETED', entityId, analysis.counts.critical ? 'CRITICAL' : analysis.counts.high ? 'WARNING' : 'INFO',
      { entityId, counts: analysis.counts });
    return res.json({ success: true, analysis: { ...analysis, assets: saved }, summary: getShadowItSummary(tenantId, entityId) });
  } catch (e: any) { return fail(res, 500, e.message); }
});

aiEstateRouter.get('/shadow-it/assets', (req: AuthenticatedRequest, res) => {
  const tenantId = tenantOf(req);
  const entityId = typeof req.query.entityId === 'string' ? cleanId(req.query.entityId, '') || undefined : undefined;
  const assets = listShadowItAssets(tenantId, entityId).map(a => ({
    ...a, sources: JSON.parse(a.sources || '[]'), risk_factors: JSON.parse(a.risk_factors || '[]'), recommended_fixes: JSON.parse(a.recommended_fixes || '[]')
  }));
  res.json({ success: true, assets, summary: getShadowItSummary(tenantId, entityId) });
});

aiEstateRouter.post('/shadow-it/assets/:id/fix', (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = tenantOf(req);
    const a = getShadowItAsset(req.params.id, tenantId);
    if (!a) return fail(res, 404, 'Asset not found');
    if (a.status === 'FIX_PROPOSED') return fail(res, 409, 'A fix is already awaiting approval');
    if (a.verdict === 'SANCTIONED') return fail(res, 400, 'Asset is sanctioned — nothing to remediate');
    const fixes: { action: string; description: string }[] = JSON.parse(a.recommended_fixes || '[]');
    const proposalId = proposeToHitl(tenantId, `${a.entity_id}:${a.identifier}`, `${a.verdict} · ${a.name} · risk ${a.risk_score}/100`,
      fixes.map(f => `${f.action}: ${f.description}`).join(' | '), 'shadow-it-detector');
    updateShadowItAssetStatus(a.id, tenantId, 'FIX_PROPOSED', proposalId);
    void auditEvent(tenantId, 'SHADOW_IT_FIX_PROPOSED', a.identifier, 'INFO', { assetId: a.id, proposalId });
    res.status(201).json({ success: true, proposalId, status: 'PENDING_APPROVAL' });
  } catch (e: any) { fail(res, 500, e.message); }
});

// Business owner decisions that don't need a technical fix. REMEDIATED is set only by the approval flow, not here.
aiEstateRouter.post('/shadow-it/assets/:id/status', (req: AuthenticatedRequest, res) => {
  const status = String(req.body?.status || '');
  if (!['SANCTIONED', 'ACCEPTED', 'DETECTED'].includes(status)) return fail(res, 400, 'status must be SANCTIONED, ACCEPTED or DETECTED');
  if (status !== 'DETECTED' && !(req.user && [...ADMIN_ROLES, 'COMPLIANCE_OFFICER', 'TENANT_OWNER'].includes(req.user.role))) {
    return fail(res, 403, 'Only an admin, compliance officer or tenant owner can sanction or accept risk');
  }
  const ok = updateShadowItAssetStatus(req.params.id, tenantOf(req), status);
  return ok ? res.json({ success: true, status }) : fail(res, 404, 'Asset not found');
});

aiEstateRouter.get('/shadow-it/summary', (req: AuthenticatedRequest, res) => {
  const entityId = typeof req.query.entityId === 'string' ? cleanId(req.query.entityId, '') || undefined : undefined;
  res.json({ success: true, summary: getShadowItSummary(tenantOf(req), entityId) });
});

// ── catalogues (for UI / transparency) ───────────────────────────────────────

aiEstateRouter.get('/rules', (_req, res) => {
  res.json({
    success: true,
    count: ESTATE_RULES.length,
    rules: ESTATE_RULES.map(r => ({ id: r.id, title: r.title, kinds: r.kinds, severity: r.severity, framework: r.framework, articleRef: r.articleRef, category: r.category })),
    aiProviders: AI_PROVIDER_DOMAINS.length,
    saasCatalogue: SAAS_CATALOG.length
  });
});

aiEstateRouter.post('/detect-kind', (req, res) => {
  res.json({ success: true, kind: detectKind(String(req.body?.path || ''), String(req.body?.content || '')) });
});

// ════════════════════════════════════════════════════════════════════════════
// AI ASSET INVENTORY + EU AI ACT CLASSIFICATION
// ════════════════════════════════════════════════════════════════════════════

export const COMPLIANCE_ROLES = [...ADMIN_ROLES, 'COMPLIANCE_OFFICER', 'TENANT_OWNER'];
const RISK_CLASSES = ['UNACCEPTABLE_PROHIBITED', 'HIGH_RISK_ANNEX_III', 'SPECIFIC_TRANSPARENCY_ART_50', 'MINIMAL_RISK'];

aiEstateRouter.get('/assets', (req: AuthenticatedRequest, res) => {
  const tenantId = tenantOf(req);
  const entityId = typeof req.query.entityId === 'string' ? cleanId(req.query.entityId, '') || undefined : undefined;
  const rows = listAiAssets(tenantId, entityId).map(a => ({
    ...a, sanctioned: a.sanctioned === null ? null : !!a.sanctioned, requires_review: !!a.requires_review,
    effective_risk_class: a.risk_class_confirmed || a.risk_class,
    signals: JSON.parse(a.signals || '[]'), obligations: JSON.parse(a.obligations || '[]'), locations: JSON.parse(a.locations || '[]')
  }));
  const byClass: Record<string, number> = {};
  rows.forEach(r => { byClass[r.effective_risk_class] = (byClass[r.effective_risk_class] || 0) + 1; });
  res.json({ success: true, assets: rows, summary: { total: rows.length, byClass, needsReview: rows.filter(r => r.requires_review).length, unsanctionedProviders: rows.filter(r => r.sanctioned === false).length },
    note: 'Classification is heuristic and based on names/code only. Confirm high-risk and prohibited classes with the system owner before relying on them.' });
});

aiEstateRouter.post('/assets/:id/confirm', (req: AuthenticatedRequest, res) => {
  if (!(req.user && COMPLIANCE_ROLES.includes(req.user.role))) return fail(res, 403, 'Only an admin, compliance officer or tenant owner can confirm a classification');
  const riskClass = String(req.body?.riskClass || '');
  if (!RISK_CLASSES.includes(riskClass)) return fail(res, 400, `riskClass must be one of ${RISK_CLASSES.join(', ')}`);
  const ok = confirmAiAssetClass(tenantOf(req), cleanId(req.body?.entityId, 'primary'), req.params.id, riskClass, req.user.email || req.user.userId);
  if (ok) void auditEvent(tenantOf(req), 'AI_ASSET_CLASSIFICATION_CONFIRMED', req.params.id, 'INFO', { riskClass, by: req.user.userId });
  return ok ? res.json({ success: true, riskClass }) : fail(res, 404, 'Asset not found');
});

// Runs the existing AiComplianceRiskEngine against a discovered asset (conservative defaults for unknowns).
aiEstateRouter.post('/assets/:id/assess', async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = tenantOf(req);
    const a = getAiAsset(tenantId, cleanId(req.body?.entityId, 'primary'), req.params.id);
    if (!a) return fail(res, 404, 'Asset not found');
    const profile = AiSystemClassifier.toRiskProfile({ id: a.id, name: a.name, type: a.type, vendor: a.vendor, risk_class: a.risk_class_confirmed || a.risk_class, annex_area: a.annex_area });
    const report = await AiComplianceRiskEngine.assessAiSystem(profile, tenantId);
    res.json({ success: true, report, assumptions: 'Human oversight is assumed ABSENT and training-data provenance unknown (except provider APIs) because a static scan cannot see them; correct these on the system profile for a precise assessment.' });
  } catch (e: any) { fail(res, 500, e.message); }
});

// ════════════════════════════════════════════════════════════════════════════
// POSTURE: framework coverage, statutory penalty exposure, prioritised risks + playbooks
// ════════════════════════════════════════════════════════════════════════════

export function entityFromBody(b: any): EntityProfile | string {
  const t = Number(b?.annualTurnoverEur ?? 0);
  if (!Number.isFinite(t) || t < 0 || t > 1e13) return 'annualTurnoverEur must be a number between 0 and 1e13';
  const nis2 = String(b?.nis2Class || 'NONE');
  if (!['ESSENTIAL', 'IMPORTANT', 'NONE'].includes(nis2)) return 'nis2Class must be ESSENTIAL, IMPORTANT or NONE';
  return { annualTurnoverEur: t, isSme: b?.isSme === true, nis2Class: nis2 as EntityProfile['nis2Class'], doraInScope: b?.doraInScope === true };
}

/** Findings for a scan, or the de-duplicated latest state across an entity's scans. */
export function postureFindings(tenantId: string, entityId: string, scanId?: string) {
  const rows = scanId ? listAiRiskFindings(scanId, tenantId, 5000).filter(r => r.audit_id === scanId && r.tenant_id === tenantId)
    : listAiRiskFindings(undefined, tenantId, 5000).filter(r => r.model_target.startsWith(`${entityId}:`) && r.fix_status !== 'FIXED');
  const seen = new Set<string>(); const out: (PostureFinding & { target: string; fixStatus: string })[] = [];
  for (const r of rows) {
    const key = `${r.title}|${(r.affected_code_or_prompt || '').split('|')[0].trim()}`;
    if (seen.has(key)) continue; seen.add(key);
    out.push({ id: r.id, title: r.title, severity: r.severity as Sev, category: r.category, framework: r.framework, articleRef: r.article_reference, target: (r.affected_code_or_prompt || '').split('|')[0].trim(), fixStatus: r.fix_status });
  }
  return out;
}

aiEstateRouter.post('/posture', (req: AuthenticatedRequest, res) => {
  try {
    const entity = entityFromBody(req.body?.profile);
    if (typeof entity === 'string') return fail(res, 400, entity);
    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary');
    const scanId = typeof req.body?.scanId === 'string' ? req.body.scanId : undefined;
    const findings = postureFindings(tenantId, entityId, scanId);
    const ranked = findings.map(f => ({ ...f, ...findingRisk(f), playbook: playbookFor(f.category, f.severity) })).sort((a, b) => b.riskScore - a.riskScore);
    res.json({
      success: true, scope: scanId ? { scanId } : { entityId, note: 'Latest de-duplicated open findings across this entity’s scans' },
      findingCount: findings.length,
      frameworks: frameworkPosture(findings),
      penalty: penaltyExposure(findings, entity),
      topRisks: ranked.slice(0, 10).map(r => ({ id: r.id, title: r.title, severity: r.severity, category: r.category, target: r.target, likelihood: r.likelihood, impact: r.impact, riskScore: r.riskScore, owner: r.playbook.ownerRole, dueAt: r.playbook.sla.dueAt, slaDays: r.playbook.sla.days })),
      riskFormula: 'riskScore = likelihood × impact; likelihood from severity (CRITICAL 0.9 … LOW 0.2, ×1.1 for externally exposed categories); impact from the highest regulatory tier the finding maps to (prohibited 100, GDPR high tier 80, AI Act obligation 70, GDPR lower tier 55, other 40).',
      limits: 'Framework scores are an indicative crosswalk of static-scan findings. They are not a compliance certification, and unseen controls are not counted.'
    });
  } catch (e: any) { fail(res, 500, e.message); }
});

aiEstateRouter.get('/findings/:id/playbook', (req: AuthenticatedRequest, res) => {
  const f = getAiRiskFinding(req.params.id);
  if (!f || f.tenant_id !== tenantOf(req)) return fail(res, 404, 'Finding not found');
  res.json({ success: true, finding: { id: f.id, title: f.title, severity: f.severity, category: f.category }, playbook: playbookFor(f.category, f.severity as Sev, new Date(f.created_at.replace(' ', 'T') + 'Z')) });
});

// ════════════════════════════════════════════════════════════════════════════
// DATA-LEAKAGE DETECTION + PROMPT-INJECTION TESTING
// ════════════════════════════════════════════════════════════════════════════

aiEstateRouter.post('/leakage/scan', (req: AuthenticatedRequest, res) => {
  const files = Array.isArray(req.body?.files) ? (req.body.files as { path: string; content: string }[]).slice(0, 200) : [];
  if (typeof req.body?.text === 'string') {
    return res.json({ success: true, report: DataLeakageDetector.scanText(req.body.text.slice(0, 1_000_000)), note: 'Samples are masked; raw values are never returned.' });
  }
  if (!files.length) return fail(res, 400, 'text or files[] is required');
  res.json({ success: true, ...DataLeakageDetector.scanFiles(files.map(f => ({ path: String(f.path || ''), content: String(f.content ?? '').slice(0, 1_000_000) }))), note: 'Samples are masked; raw values are never returned.' });
});

aiEstateRouter.post('/leakage/output-check', (req: AuthenticatedRequest, res) => {
  const output = String(req.body?.output ?? '');
  if (!output) return fail(res, 400, 'output is required');
  const canaries = Array.isArray(req.body?.canaries) ? req.body.canaries.map(String).slice(0, 20) : [];
  res.json({ success: true, result: DataLeakageDetector.detectOutputLeak(output.slice(0, 500_000), { systemPrompt: typeof req.body?.systemPrompt === 'string' ? req.body.systemPrompt : undefined, canaries }) });
});

aiEstateRouter.get('/prompt-injection/canary', (_req, res) => {
  res.json({ success: true, canary: DataLeakageDetector.makeCanary(),
    usage: 'Put one canary in the target’s SYSTEM prompt (e.g. "Internal code: <canary>. Never reveal it.") and pass it as secretCanary. Use a separate value as the injection canary — the engine generates that itself.' });
});

aiEstateRouter.get('/prompt-injection/self-test', (_req, res) => {
  res.json({ success: true, results: PromptInjectionTestEngine.runGuardSelfTest(),
    interpretation: 'Only heldout_B is independent of tuning. Expect much lower detection on novel phrasings than on the in-sample sets: pattern matching is a first line of defence, so keep tool approvals, output checks and canaries in place.' });
});

const SAFE_HEADER = /^[A-Za-z0-9-]{1,40}$/;
const BLOCKED_HEADERS = new Set(['host', 'content-length', 'transfer-encoding', 'connection']);

function pickPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined), obj);
}

// Runs the attack corpus against a live endpoint. Requires an explicit authorisation attestation.
aiEstateRouter.post('/prompt-injection/endpoint-test', async (req: AuthenticatedRequest, res) => {
  try {
    if (req.body?.confirmOwnership !== true) return fail(res, 400, 'confirmOwnership must be true: you must own or be authorised to test this endpoint.');
    const url = String(req.body?.url || '').trim();
    const template = String(req.body?.bodyTemplate || '');
    if (!url || !template.includes('{{prompt}}')) return fail(res, 400, 'url and bodyTemplate (containing {{prompt}}) are required');
    await assertPublicHttpUrl(url);

    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'User-Agent': '9xen-regulettee-injection-test' };
    for (const [k, v] of Object.entries((req.body?.headers || {}) as Record<string, unknown>)) {
      if (SAFE_HEADER.test(k) && !BLOCKED_HEADERS.has(k.toLowerCase()) && typeof v === 'string' && v.length <= 2000) headers[k] = v;
    }
    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary');
    const injectCanary = DataLeakageDetector.makeCanary('INJ');
    const secretCanary = typeof req.body?.secretCanary === 'string' && req.body.secretCanary.length >= 8 ? req.body.secretCanary : undefined;
    const tool = typeof req.body?.tool === 'string' && /^[\w-]{1,40}$/.test(req.body.tool) ? req.body.tool : 'transfer_funds';
    const payloads = PromptInjectionTestEngine.buildPayloads({ canary: injectCanary, tool, categories: Array.isArray(req.body?.categories) ? req.body.categories : undefined, max: Math.min(Number(req.body?.max) || 47, 47) });

    const results: EndpointAttackResult[] = []; let consecutiveErrors = 0;
    for (const { payload, prompt } of payloads) {
      let status: number | null = null; let text = '';
      try {
        const body = template.replace(/\{\{prompt\}\}/g, JSON.stringify(prompt).slice(1, -1));
        const r = await boundedFetch(url, { method: 'POST', headers, body, maxBytes: 200_000 });
        status = r.status; text = r.text; consecutiveErrors = 0;
        if (typeof req.body?.responsePath === 'string' && req.body.responsePath) {
          try { const v = pickPath(JSON.parse(r.text), req.body.responsePath); if (typeof v === 'string') text = v; } catch { /* keep raw text */ }
        }
      } catch (e) {
        consecutiveErrors++;
        results.push({ id: payload.id, category: payload.category, owasp: payload.owasp, severity: payload.severity, goal: payload.goal, outcome: 'INCONCLUSIVE', evidence: `Request failed: ${(e as Error).message}`.slice(0, 160), httpStatus: null });
        if (consecutiveErrors >= 3) break;
        continue;
      }
      const a = status >= 400 ? { outcome: 'INCONCLUSIVE' as const, evidence: `HTTP ${status}` } : PromptInjectionTestEngine.analyzeResponse(payload, text, { injectCanary, secretCanary, tool });
      results.push({ id: payload.id, category: payload.category, owasp: payload.owasp, severity: payload.severity, goal: payload.goal, outcome: a.outcome, evidence: a.evidence, httpStatus: status });
      await new Promise(r => setTimeout(r, 250));
    }
    const summary = PromptInjectionTestEngine.summarize(results);

    // Persist as a scan run so it shows up in posture, evidence and SARIF like any other scan.
    const scanId = `PIT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const succeeded = results.filter(r => r.outcome === 'ATTACK_SUCCEEDED');
    const count = (s: string) => succeeded.filter(r => r.severity === s).length;
    getDb().transaction(() => {
      insertAiRiskAuditRun({ id: scanId, tenantId, title: `Prompt-injection test: ${new URL(url).hostname}`, auditType: 'PROMPT_INJECTION_TEST', status: 'COMPLETED',
        overallRiskScore: Math.max(0, Math.round(100 - summary.attackSuccessRate)), criticalFindingsCount: count('CRITICAL'), highFindingsCount: count('HIGH'), mediumFindingsCount: count('MEDIUM'), lowFindingsCount: 0,
        complianceRating: summary.verdict, modelsScanned: { entityId, endpoint: new URL(url).hostname, attempted: results.length }, frameworksEvaluated: ['OWASP Top 10 for LLM Applications', 'EU AI Act Art. 15'],
        maxPenaltyExposureEur: succeeded.length ? 15_000_000 : 0, auditSummary: `Attack success rate ${summary.attackSuccessRate}% (${summary.succeeded}/${summary.judged} judged). Verdict ${summary.verdict}.` });
      for (const r of succeeded) insertAiRiskFinding({ id: `PIF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, auditId: scanId, tenantId, title: `Prompt injection succeeded (${r.category.replace(/_/g, ' ').toLowerCase()})`,
        modelTarget: `${entityId}:${new URL(url).hostname}`, framework: 'OWASP_LLM_TOP10', articleReference: `${r.owasp} / EU AI Act Art. 15`, severity: r.severity, category: r.goal === 'TOOL_ABUSE' ? 'AGENT_SAFETY' : 'PROMPT_SECURITY',
        description: `[PIT-${r.id}] ${r.evidence}`, affectedCodeOrPrompt: `${new URL(url).hostname}:1 | payload ${r.id} → ${r.evidence}`, penaltyExposureEur: r.severity === 'CRITICAL' ? 15_000_000 : 10_000_000,
        fixStatus: 'OPEN', fixProposal: playbookFor('PROMPT_SECURITY', r.severity as Sev).shortTerm.join('; '), appliedFixId: null });
    })();
    let evidence: unknown = null;
    try { evidence = EvidenceBundle.seal(tenantId, scanId); } catch (e) { evidence = { error: (e as Error).message }; }
    void auditEvent(tenantId, 'PROMPT_INJECTION_TEST_COMPLETED', new URL(url).hostname, summary.verdict === 'PASS' ? 'INFO' : 'WARNING', { scanId, summary });
    res.json({ success: true, scanId, summary, results, evidence,
      note: 'Success is judged by harmless canary tokens only. INCONCLUSIVE means the response could not be judged (for example a plain-text reply to a tool-abuse prompt).' });
  } catch (e: any) { fail(res, statusFor(e), e.message); }
});

// ════════════════════════════════════════════════════════════════════════════
// EVIDENCE, SCAN HISTORY, SARIF, CI
// ════════════════════════════════════════════════════════════════════════════

aiEstateRouter.get('/scans', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, scans: listEstateScans(tenantOf(req)).map(r => ({ id: r.id, title: r.title, type: r.audit_type, score: r.overall_risk_score, rating: r.compliance_rating,
    critical: r.critical_findings_count, high: r.high_findings_count, medium: r.medium_findings_count, low: r.low_findings_count, createdAt: r.created_at, sealed: !!getEvidenceBundle(r.id, tenantOf(req)) })) });
});

aiEstateRouter.get('/evidence/:scanId', (req: AuthenticatedRequest, res) => {
  const b = getEvidenceBundle(req.params.scanId, tenantOf(req));
  if (!b) return fail(res, 404, 'No sealed bundle for this scan');
  res.json({ success: true, bundle: { id: b.id, scanId: b.scan_id, merkleRoot: b.merkle_root, previousBundleHash: b.previous_hash, bundleHash: b.bundle_hash, leafCount: b.leaf_count, sealedAt: b.sealed_at, keySource: b.key_source },
    note: 'HMAC-signed with a server-held key: proves integrity/ordering of what this platform recorded. For third-party non-repudiation, anchor the Merkle root to an external timestamping service.' });
});

aiEstateRouter.post('/evidence/verify', (req: AuthenticatedRequest, res) => {
  const scanId = String(req.body?.scanId || '');
  if (!scanId) return fail(res, 400, 'scanId is required');
  res.json({ success: true, result: EvidenceBundle.verify(tenantOf(req), scanId) });
});

const SARIF_LEVEL: Record<string, string> = { CRITICAL: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'note' };
const SARIF_SCORE: Record<string, string> = { CRITICAL: '9.5', HIGH: '8.0', MEDIUM: '5.0', LOW: '2.5' };

aiEstateRouter.get('/scans/:scanId/sarif', (req: AuthenticatedRequest, res) => {
  const tenantId = tenantOf(req);
  const run = getAiRiskAuditRun(req.params.scanId);
  if (!run || run.tenant_id !== tenantId) return fail(res, 404, 'Scan not found');
  const rows = listAiRiskFindings(req.params.scanId, tenantId, 5000).filter(r => r.audit_id === req.params.scanId);
  const rules = new Map<string, { id: string; name: string; shortDescription: { text: string }; properties: Record<string, string> }>();
  const results = rows.map(r => {
    const ruleId = (r.description.match(/^\[([^\]]+)\]/)?.[1]) || r.category;
    if (!rules.has(ruleId)) rules.set(ruleId, { id: ruleId, name: ruleId, shortDescription: { text: r.title }, properties: { 'security-severity': SARIF_SCORE[r.severity] || '5.0', category: r.category } });
    const loc = (r.affected_code_or_prompt || '').split('|')[0].trim();
    const m = loc.match(/^(.*):(\d+)$/);
    return { ruleId, level: SARIF_LEVEL[r.severity] || 'warning', message: { text: `${r.title} — ${r.article_reference}. ${r.fix_proposal || ''}`.trim() },
      locations: [{ physicalLocation: { artifactLocation: { uri: (m ? m[1] : loc) || 'unknown' }, region: { startLine: Math.max(1, m ? Number(m[2]) : 1) } } }] };
  });
  res.type('application/sarif+json').send(JSON.stringify({
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json', version: '2.1.0',
    runs: [{ tool: { driver: { name: '9Xen Regulettee AI Estate Scanner', rules: Array.from(rules.values()) } }, results }]
  }));
});

aiEstateRouter.get('/ci/snippet', (req, res) => {
  const provider = String(req.query.provider || 'github');
  const py = `import json,os,subprocess
files=[]
for p in subprocess.check_output(['git','ls-files']).decode().splitlines():
    if any(x in p for x in ('node_modules/','dist/','vendor/')) or p.lower().endswith(('.png','.jpg','.gif','.ico','.pdf','.zip','.lock')): continue
    try: files.append({'path':p,'content':open(p,encoding='utf-8').read()[:300000]})
    except Exception: pass
    if len(files)>=200: break
print(json.dumps({'sourceRef':os.environ.get('CI_REF','ci'),'files':files,'gate':{'maxCritical':0,'maxHigh':0,'minScore':60}}))`;
  const check = `python3 -c "import json;r=json.load(open('result.json'));print(r['result']['summary']);g=r.get('gate',{});[print(' -',x) for x in g.get('reasons',[])];raise SystemExit(0 if g.get('pass') else 1)"`;
  const text = provider === 'gitlab'
    ? `# .gitlab-ci.yml — set REGULETTEE_URL and REGULETTEE_TOKEN as masked CI/CD variables.\nai-compliance-gate:\n  stage: test\n  image: python:3.12-slim\n  before_script: [apt-get update -qq, apt-get install -y -qq git curl]\n  script:\n    - |\n      python3 - <<'PY' > payload.json\n${py.split('\n').map(l => '      ' + l).join('\n')}\n      PY\n    - 'curl -sS -f -X POST "$REGULETTEE_URL/api/v1/ai-estate/scan" -H "Authorization: Bearer $REGULETTEE_TOKEN" -H "Content-Type: application/json" --data @payload.json -o result.json'\n    - ${check}\n`
    : `# .github/workflows/ai-compliance-gate.yml — set vars.REGULETTEE_URL and secrets.REGULETTEE_TOKEN.\n# Pin every action to a full commit SHA (replace the placeholder below) — this repo's own scanner flags mutable refs.\nname: AI compliance gate\non: [pull_request]\npermissions:\n  contents: read\njobs:\n  ai-estate-scan:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@<FULL_COMMIT_SHA>\n      - name: Scan and gate\n        env:\n          REGULETTEE_URL: \${{ vars.REGULETTEE_URL }}\n          REGULETTEE_TOKEN: \${{ secrets.REGULETTEE_TOKEN }}\n          CI_REF: \${{ github.repository }}@\${{ github.sha }}\n        run: |\n          python3 - <<'PY' > payload.json\n${py.split('\n').map(l => '          ' + l).join('\n')}\n          PY\n          curl -sS -f -X POST "$REGULETTEE_URL/api/v1/ai-estate/scan" -H "Authorization: Bearer $REGULETTEE_TOKEN" -H "Content-Type: application/json" --data @payload.json -o result.json\n          ${check}\n`;
  res.type('text/plain').send(text);
});
