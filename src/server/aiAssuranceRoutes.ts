/**
 * AI ASSURANCE ROUTES  (mounted at /api/v1/ai-assurance)
 *
 *  monitoring   drift (data + behaviour) and fairness, with persisted baselines/runs and findings
 *  traces       hash-chained decision traces, subject-facing explanations, human review
 *  provenance   signed registry of AI-generated content
 *  trust        adaptive trust score per AI asset
 *  financial    Monte-Carlo business-impact model (every assumption explicit)
 *  canary       staged rollout of runtime-gateway policy changes with auto-rollback
 *  redteam      adaptive attack agent against the guard
 *
 * Auth required throughout; tenant comes from the session. Monitoring stores aggregates only, never raw records.
 */
import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { getDb } from '../db/sqlite.js';
import { LexDB } from '../services/LexDB.js';
import { tenantOf, cleanId, fail, COMPLIANCE_ROLES, entityFromBody, postureFindings } from './aiEstateRoutes.js';
import {
  upsertMonitorBaseline, getMonitorBaseline, insertMonitorRun, listMonitorRuns, listTraceSystems, getAiAsset, listAiAssets,
  insertTrustHistory, listTrustHistory, insertAiRiskAuditRun, insertAiRiskFinding
} from '../db/ai-risk-repository.js';
import { analyzeDrift, analyzeFairness, behaviourFeatures, type FeatureSet, type DecisionRecord, type ResponseRecord, MIN_SAMPLES } from '../services/ai-monitoring.js';
import { AiTraceStore, AiProvenanceStore, gatherTrustInputs } from '../services/ai-assurance-store.js';
import { computeTrust, simulateFinancialRisk, scenariosFromFindings, DEFAULT_FIN_ASSUMPTIONS, type FinAssumptions } from '../services/ai-trust-financial.js';
import { CanaryManager, validatePatch } from '../services/ai-canary.js';
import { runAdaptiveRedTeam } from '../services/ai-adaptive-redteam.js';
import { ATTACK_CORPUS, renderPayload } from '../services/ai-attack-corpus.js';
import { EvidenceBundle } from '../services/ai-evidence-bundle.js';
import { playbookFor } from '../services/ai-posture-scoring.js';

export const aiAssuranceRouter = Router();
aiAssuranceRouter.use(requireAuth);

const actor = (req: AuthenticatedRequest) => req.user?.email || req.user?.userId || 'unknown';
const isCompliance = (req: AuthenticatedRequest) => !!req.user && COMPLIANCE_ROLES.includes(req.user.role);
const rid = (p: string) => `${p}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

async function audit(tenantId: string, action: string, target: string, severity: 'INFO' | 'WARNING' | 'CRITICAL', payload: unknown) {
  try { await LexDB.recordAuditEvent({ tenant_id: tenantId, actor_id: 'AI_ASSURANCE', module: 'AI_ASSURANCE', action, status: 'SUCCESS', severity, target, payload }); } catch { /* best-effort */ }
}

// ── monitoring ───────────────────────────────────────────────────────────────

function cleanFeatures(raw: unknown): FeatureSet | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'features must be an object of arrays';
  const out: FeatureSet = {}; const keys = Object.keys(raw as object);
  if (!keys.length || keys.length > 30) return 'provide between 1 and 30 features';
  for (const k of keys) {
    const arr = (raw as Record<string, unknown>)[k];
    if (!/^[\w .:-]{1,60}$/.test(k)) return `invalid feature name "${k.slice(0, 20)}"`;
    if (!Array.isArray(arr) || arr.length > 5000) return `feature "${k}" must be an array of at most 5000 values`;
    if (!arr.every(v => (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.length <= 80))) return `feature "${k}" contains non-numeric/non-short-string values`;
    out[k] = arr as (number | string)[];
  }
  return out;
}

/** A monitoring problem becomes a finding (so it flows into posture, trust, SARIF and sealed evidence). */
function persistMonitorFinding(tenantId: string, entityId: string, systemId: string, p: { category: 'MODEL_DRIFT' | 'BIAS_FAIRNESS'; severity: 'HIGH' | 'MEDIUM'; title: string; detail: string; article: string }): string {
  const scanId = rid('MON');
  getDb().transaction(() => {
    insertAiRiskAuditRun({ id: scanId, tenantId, title: `Model monitor: ${p.title}`, auditType: 'MODEL_MONITOR', status: 'COMPLETED', overallRiskScore: p.severity === 'HIGH' ? 40 : 70,
      criticalFindingsCount: 0, highFindingsCount: p.severity === 'HIGH' ? 1 : 0, mediumFindingsCount: p.severity === 'MEDIUM' ? 1 : 0, lowFindingsCount: 0, complianceRating: p.severity === 'HIGH' ? 'HIGH_RISK' : 'MODERATE',
      modelsScanned: { entityId, systemId }, frameworksEvaluated: ['EU AI Act Art. 10, 15, 72'], maxPenaltyExposureEur: 15_000_000, auditSummary: p.detail.slice(0, 500) });
    insertAiRiskFinding({ id: rid('MF'), auditId: scanId, tenantId, title: p.title, modelTarget: `${entityId}:${systemId}`, framework: 'EU_AI_ACT', articleReference: p.article, severity: p.severity, category: p.category,
      description: `[MON-${p.category}] ${p.detail.slice(0, 400)}`, affectedCodeOrPrompt: `${systemId}:1 | ${p.detail.slice(0, 160)}`, penaltyExposureEur: 15_000_000, fixStatus: 'OPEN',
      fixProposal: playbookFor(p.category, p.severity === 'HIGH' ? 'HIGH' : 'MEDIUM').shortTerm.join('; '), appliedFixId: null });
  })();
  try { EvidenceBundle.seal(tenantId, scanId); } catch { /* sealing is best-effort here */ }
  return scanId;
}

aiAssuranceRouter.post('/monitor/baseline', (req: AuthenticatedRequest, res) => {
  const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary'); const systemId = cleanId(req.body?.systemId, '');
  if (!systemId) return fail(res, 400, 'systemId is required');
  const f = cleanFeatures(req.body?.features); if (typeof f === 'string') return fail(res, 400, f);
  const n = Math.max(...Object.values(f).map(a => a.length));
  upsertMonitorBaseline({ id: rid('BSL'), tenantId, entityId, systemId, data: f, sampleCount: n });
  res.json({ success: true, systemId, features: Object.keys(f).length, samples: n, note: `Baseline stored. Drift checks need at least ${MIN_SAMPLES} samples per window.` });
});

function runDrift(req: AuthenticatedRequest, res: import('express').Response, current: FeatureSet, baselineKey: string, referenceIn: FeatureSet | undefined, saveAsBaseline: boolean, label: string) {
  const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary'); const systemId = cleanId(req.body?.systemId, '');
  const stored = getMonitorBaseline(tenantId, entityId, baselineKey);
  const reference = referenceIn ?? (stored?.data as FeatureSet | undefined);
  if (!reference) return fail(res, 400, 'No baseline for this system. Send a reference sample, or store one first (POST /monitor/baseline).');
  const result = analyzeDrift(reference, current);
  if (saveAsBaseline) upsertMonitorBaseline({ id: rid('BSL'), tenantId, entityId, systemId: baselineKey, data: current, sampleCount: Math.max(...Object.values(current).map(a => a.length)) });
  const runId = rid('MRN');
  insertMonitorRun({ id: runId, tenantId, entityId, systemId, kind: 'DRIFT', status: result.overall, result: { label, overall: result.overall, features: result.features.map(f => ({ feature: f.feature, status: f.status, psi: f.psi, ksP: f.ksP, reason: f.reason, n: [f.nRef, f.nCur] })) } });
  const flagged = result.features.filter(f => f.status === 'DRIFT' || f.status === 'WARN');
  let findingScan: string | null = null;
  if (result.overall === 'DRIFT' || result.overall === 'WARN') {
    findingScan = persistMonitorFinding(tenantId, entityId, systemId, { category: 'MODEL_DRIFT', severity: result.overall === 'DRIFT' ? 'HIGH' : 'MEDIUM',
      title: `${label} ${result.overall === 'DRIFT' ? 'drift' : 'shift'} detected in ${flagged.map(f => f.feature).slice(0, 4).join(', ')}`, detail: flagged.map(f => `${f.feature}: ${f.reason}`).join('; '), article: 'EU AI Act Art. 15, 72' });
  }
  void audit(tenantId, 'AI_DRIFT_CHECK', systemId, result.overall === 'DRIFT' ? 'WARNING' : 'INFO', { runId, overall: result.overall });
  return res.json({ success: true, runId, ...result, findingScanId: findingScan, baselineUpdated: saveAsBaseline });
}

aiAssuranceRouter.post('/monitor/drift', (req: AuthenticatedRequest, res) => {
  try {
    const systemId = cleanId(req.body?.systemId, ''); if (!systemId) return fail(res, 400, 'systemId is required');
    const cur = cleanFeatures(req.body?.current); if (typeof cur === 'string') return fail(res, 400, cur);
    let ref: FeatureSet | undefined; if (req.body?.reference !== undefined) { const r = cleanFeatures(req.body.reference); if (typeof r === 'string') return fail(res, 400, r); ref = r; }
    return runDrift(req, res, cur, systemId, ref, req.body?.saveAsBaseline === true, 'Data');
  } catch (e: any) { return fail(res, 500, e.message); }
});

aiAssuranceRouter.post('/monitor/behaviour-drift', (req: AuthenticatedRequest, res) => {
  try {
    const systemId = cleanId(req.body?.systemId, ''); if (!systemId) return fail(res, 400, 'systemId is required');
    const clean = (a: unknown): ResponseRecord[] | string => {
      if (!Array.isArray(a) || a.length > 5000) return 'responses must be an array of at most 5000 records';
      return a.map(x => ({ text: String((x as ResponseRecord)?.text ?? '').slice(0, 20000), toolCalls: Number((x as ResponseRecord)?.toolCalls) || 0, inputInjectionScore: (x as ResponseRecord)?.inputInjectionScore })) as ResponseRecord[];
    };
    const cur = clean(req.body?.current); if (typeof cur === 'string') return fail(res, 400, cur);
    let ref: FeatureSet | undefined; if (req.body?.reference !== undefined) { const r = clean(req.body.reference); if (typeof r === 'string') return fail(res, 400, r); ref = behaviourFeatures(r); }
    return runDrift(req, res, behaviourFeatures(cur), `${systemId}::behaviour`, ref, req.body?.saveAsBaseline === true, 'Behaviour');
  } catch (e: any) { return fail(res, 500, e.message); }
});

aiAssuranceRouter.post('/monitor/fairness', (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary'); const systemId = cleanId(req.body?.systemId, '');
    if (!systemId) return fail(res, 400, 'systemId is required');
    const raw = req.body?.records;
    if (!Array.isArray(raw) || raw.length < 2 || raw.length > 50_000) return fail(res, 400, 'records must be an array of 2..50000 decisions: {group, outcome (0|1), label? (0|1)}');
    const records: DecisionRecord[] = [];
    for (const r of raw) {
      if (!r || typeof r.group !== 'string' || r.group.length > 60 || (r.outcome !== 0 && r.outcome !== 1) || (r.label !== undefined && r.label !== 0 && r.label !== 1)) return fail(res, 400, 'each record needs group (string ≤ 60 chars) and outcome 0|1; label, if given, must be 0|1');
      records.push({ group: r.group, outcome: r.outcome, label: r.label });
    }
    const minGroup = Math.min(1000, Math.max(10, Number(req.body?.minGroup) || MIN_SAMPLES));
    const report = analyzeFairness(records, { minGroup, referenceGroup: typeof req.body?.referenceGroup === 'string' ? req.body.referenceGroup : undefined });
    const runId = rid('MRN');
    insertMonitorRun({ id: runId, tenantId, entityId, systemId, kind: 'FAIRNESS', status: report.verdict, result: report });   // aggregates only; raw records are never stored
    let findingScan: string | null = null;
    if (report.verdict === 'FAIL' || report.verdict === 'REVIEW') {
      findingScan = persistMonitorFinding(tenantId, entityId, systemId, { category: 'BIAS_FAIRNESS', severity: report.verdict === 'FAIL' ? 'HIGH' : 'MEDIUM',
        title: report.verdict === 'FAIL' ? 'Confirmed selection-rate disparity between groups' : 'Possible selection-rate disparity between groups', detail: report.reasons.slice(0, 3).join(' '), article: 'EU AI Act Art. 10(2)(f)-(g); GDPR Art. 5(1)(a), 22' });
    }
    void audit(tenantId, 'AI_FAIRNESS_CHECK', systemId, report.verdict === 'FAIL' ? 'WARNING' : 'INFO', { runId, verdict: report.verdict });
    res.json({ success: true, runId, report, findingScanId: findingScan, privacy: 'Only per-group aggregates were stored; the individual records were not.' });
  } catch (e: any) { fail(res, 500, e.message); }
});

aiAssuranceRouter.get('/monitor/runs', (req: AuthenticatedRequest, res) => {
  const q = (k: string) => (typeof req.query[k] === 'string' ? cleanId(req.query[k], '') || undefined : undefined);
  res.json({ success: true, runs: listMonitorRuns(tenantOf(req), q('entityId'), q('systemId'), q('kind'), 50).map(r => ({ id: r.id, systemId: r.system_id, kind: r.kind, status: r.status, createdAt: r.created_at, result: JSON.parse(r.result_json) })) });
});

// ── decision traces ──────────────────────────────────────────────────────────

aiAssuranceRouter.get('/traces/systems', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, systems: listTraceSystems(tenantOf(req)).map(s => ({ systemId: s.system_id, traces: s.n, needReview: s.needs_review, reviewed: s.reviewed, lastAt: s.last_at })) });
});

aiAssuranceRouter.get('/traces', (req: AuthenticatedRequest, res) => {
  const systemId = cleanId(req.query.systemId, ''); if (!systemId) return fail(res, 400, 'systemId is required');
  res.json({ success: true, traces: AiTraceStore.list(tenantOf(req), systemId, Math.min(200, Number(req.query.limit) || 50), Math.max(0, Number(req.query.offset) || 0)) });
});

aiAssuranceRouter.post('/traces/verify', (req: AuthenticatedRequest, res) => {
  const systemId = cleanId(req.body?.systemId, ''); if (!systemId) return fail(res, 400, 'systemId is required');
  res.json({ success: true, systemId, result: AiTraceStore.verify(tenantOf(req), systemId), note: 'Verifies the hash chain over what the gateway recorded. It proves later edits, deletions and reordering are detectable — not that the model reasoned correctly.' });
});

aiAssuranceRouter.get('/traces/:id', (req: AuthenticatedRequest, res) => {
  const t = AiTraceStore.get(tenantOf(req), req.params.id); return t ? res.json({ success: true, ...t }) : fail(res, 404, 'Trace not found');
});

aiAssuranceRouter.get('/traces/:id/explanation', (req: AuthenticatedRequest, res) => {
  const t = AiTraceStore.get(tenantOf(req), req.params.id); return t ? res.json({ success: true, traceId: req.params.id, explanation: t.explanation }) : fail(res, 404, 'Trace not found');
});

aiAssuranceRouter.post('/traces/:id/review', (req: AuthenticatedRequest, res) => {
  if (!isCompliance(req)) return fail(res, 403, 'Only an admin, compliance officer or tenant owner can record a human review');
  const decision = String(req.body?.decision || '');
  if (!['APPROVED', 'REJECTED', 'ESCALATED'].includes(decision)) return fail(res, 400, 'decision must be APPROVED, REJECTED or ESCALATED');
  const ok = AiTraceStore.review(tenantOf(req), req.params.id, actor(req), decision, typeof req.body?.note === 'string' ? req.body.note : undefined);
  if (ok) void audit(tenantOf(req), 'AI_TRACE_REVIEWED', req.params.id, 'INFO', { decision, by: actor(req) });
  return ok ? res.json({ success: true }) : fail(res, 409, 'Trace not found or already reviewed (a review cannot be overwritten)');
});

// ── provenance ───────────────────────────────────────────────────────────────

aiAssuranceRouter.post('/provenance/mark', (req: AuthenticatedRequest, res) => {
  const text = String(req.body?.text ?? ''); if (text.trim().length < 20 || text.length > 200_000) return fail(res, 400, 'text must be 20..200000 characters');
  res.status(201).json({ success: true, ...AiProvenanceStore.mark(tenantOf(req), text, cleanId(req.body?.systemId, 'default-llm'), cleanId(req.body?.model, 'unspecified')) });
});

aiAssuranceRouter.post('/provenance/verify', (req: AuthenticatedRequest, res) => {
  const text = String(req.body?.text ?? ''); if (!text.trim() || text.length > 200_000) return fail(res, 400, 'text is required (max 200000 characters)');
  res.json({ success: true, result: AiProvenanceStore.verify(tenantOf(req), text),
    limits: 'Recognises exact copies and copies with roughly up to 10% of words changed. Heavier rewriting is not recognised, and no record never means "human-written".' });
});

// ── trust + financial ────────────────────────────────────────────────────────

aiAssuranceRouter.post('/trust/compute', (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary'); const assetId = cleanId(req.body?.assetId, '');
    const asset = assetId ? getAiAsset(tenantId, entityId, assetId) : undefined; if (!asset) return fail(res, 404, 'AI asset not found for this entity');
    const history = listTrustHistory(tenantId, entityId, assetId, 12).map(h => h.score).filter((v): v is number => typeof v === 'number').reverse();
    const result = computeTrust(gatherTrustInputs(tenantId, entityId, asset), history);
    insertTrustHistory({ id: rid('TRU'), tenantId, entityId, systemId: assetId, score: result.score, confidence: result.confidence, tier: result.tier, components: result.components });
    res.json({ success: true, asset: { id: asset.id, name: asset.name }, ...result,
      howToImprove: 'Link evidence to this asset: use the asset ID as systemId for monitoring runs and as agentId when sending traffic through the gateway.' });
  } catch (e: any) { fail(res, 500, e.message); }
});

aiAssuranceRouter.get('/trust/history', (req: AuthenticatedRequest, res) => {
  const entityId = cleanId(req.query.entityId, 'primary'); const assetId = cleanId(req.query.assetId, '');
  if (!assetId) return fail(res, 400, 'assetId is required');
  res.json({ success: true, history: listTrustHistory(tenantOf(req), entityId, assetId, 50) });
});

function cleanAssumptions(raw: any): Partial<FinAssumptions> | string {
  if (raw === undefined) return {};
  if (!raw || typeof raw !== 'object') return 'assumptions must be an object';
  const out: any = {};
  const num = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
  const tri = (v: unknown, lo: number, hi: number) => Array.isArray(v) && v.length === 3 && v.every(x => num(x, lo, hi)) && v[0] <= v[1] && v[1] <= v[2];
  if (raw.annualEventProbability !== undefined) { const o: any = {}; for (const k of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) if (raw.annualEventProbability[k] !== undefined) { if (!num(raw.annualEventProbability[k], 0, 1)) return `annualEventProbability.${k} must be 0..1`; o[k] = raw.annualEventProbability[k]; } out.annualEventProbability = o; }
  if (raw.exposedCategoryMultiplier !== undefined) { if (!num(raw.exposedCategoryMultiplier, 1, 3)) return 'exposedCategoryMultiplier must be 1..3'; out.exposedCategoryMultiplier = raw.exposedCategoryMultiplier; }
  for (const [k, hi] of [['incidentResponseEur', 1e9], ['downtimeFractionOfTurnover', 1], ['regulatoryRealisation', 1], ['costPerRecordEur', 1e6]] as const) if (raw[k] !== undefined) { if (!tri(raw[k], 0, hi)) return `${k} must be [min, mode, max] with 0 ≤ min ≤ mode ≤ max ≤ ${hi}`; out[k] = raw[k]; }
  if (raw.recordsAtRisk !== undefined) { if (!num(raw.recordsAtRisk, 0, 1e9)) return 'recordsAtRisk must be 0..1e9'; out.recordsAtRisk = raw.recordsAtRisk; }
  if (raw.residualRiskAfterFix !== undefined) { if (!num(raw.residualRiskAfterFix, 0, 1)) return 'residualRiskAfterFix must be 0..1'; out.residualRiskAfterFix = raw.residualRiskAfterFix; }
  return out;
}

aiAssuranceRouter.post('/financial-risk', (req: AuthenticatedRequest, res) => {
  try {
    const entity = entityFromBody(req.body?.profile); if (typeof entity === 'string') return fail(res, 400, entity);
    const a = cleanAssumptions(req.body?.assumptions); if (typeof a === 'string') return fail(res, 400, a);
    const tenantId = tenantOf(req); const entityId = cleanId(req.body?.entityId, 'primary');
    const findings = postureFindings(tenantId, entityId, typeof req.body?.scanId === 'string' ? req.body.scanId : undefined);
    const scenarios = scenariosFromFindings(findings, entity);
    const result = simulateFinancialRisk(scenarios, entity, { assumptions: a, trials: Number(req.body?.trials) || 20000, seed: Number.isInteger(req.body?.seed) ? req.body.seed : 1 });
    res.json({ success: true, findingCount: findings.length, userSuppliedAssumptions: Object.keys(a), usingDefaultsFor: Object.keys(DEFAULT_FIN_ASSUMPTIONS).filter(k => !(k in a)), ...result });
  } catch (e: any) { fail(res, 500, e.message); }
});

aiAssuranceRouter.get('/assets-for-trust', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, assets: listAiAssets(tenantOf(req), typeof req.query.entityId === 'string' ? cleanId(req.query.entityId, '') || undefined : undefined).map(a => ({ id: a.id, entityId: a.entity_id, name: a.name, type: a.type, riskClass: a.risk_class_confirmed || a.risk_class })) });
});

// ── canary ───────────────────────────────────────────────────────────────────

const canaryView = (r: NonNullable<ReturnType<typeof CanaryManager.get>>) => ({
  id: r.id, name: r.name, status: r.status, stage: r.stage, patch: r.patch, thresholds: r.thresholds, createdBy: r.createdBy, createdAt: r.createdAt,
  counters: { control: { ...r.control, latencies: undefined, p95Samples: r.control.latencies.length }, canary: { ...r.canary, latencies: undefined, p95Samples: r.canary.latencies.length } },
  lastEvaluation: r.lastEvaluation, history: r.history.slice(-15)
});

aiAssuranceRouter.get('/canary', (req: AuthenticatedRequest, res) => { res.json({ success: true, rollouts: CanaryManager.list(tenantOf(req)).map(canaryView) }); });

aiAssuranceRouter.post('/canary', (req: AuthenticatedRequest, res) => {
  if (!isCompliance(req)) return fail(res, 403, 'Only an admin, compliance officer or tenant owner can start a policy canary');
  const v = validatePatch(req.body?.patch); if (!v.ok || !v.patch) return fail(res, 400, v.error || 'invalid patch');
  try {
    const r = CanaryManager.create(tenantOf(req), String(req.body?.name || 'Policy canary'), v.patch, actor(req), req.body?.thresholds);
    void audit(tenantOf(req), 'AI_CANARY_STARTED', r.id, 'INFO', { patch: v.patch });
    res.status(201).json({ success: true, rollout: canaryView(r), note: 'Traffic through /api/v1/ai-runtime/chat is now split deterministically by user+session. Promotion to 100% requires a human approval.' });
  } catch (e: any) { fail(res, 409, e.message); }
});

aiAssuranceRouter.get('/canary/:id', (req: AuthenticatedRequest, res) => {
  const r = CanaryManager.get(req.params.id); return r && r.tenantId === tenantOf(req) ? res.json({ success: true, rollout: canaryView(r) }) : fail(res, 404, 'Rollout not found');
});

aiAssuranceRouter.post('/canary/:id/tick', (req: AuthenticatedRequest, res) => {
  const r0 = CanaryManager.get(req.params.id); if (!r0 || r0.tenantId !== tenantOf(req)) return fail(res, 404, 'Rollout not found');
  res.json({ success: true, rollout: canaryView(CanaryManager.tick(req.params.id)!) });
});

aiAssuranceRouter.post('/canary/:id/feedback', (req: AuthenticatedRequest, res) => {
  if (!isCompliance(req)) return fail(res, 403, 'Only reviewers (admin, compliance officer, tenant owner) can label blocks');
  const r0 = CanaryManager.get(req.params.id); if (!r0 || r0.tenantId !== tenantOf(req)) return fail(res, 404, 'Rollout not found');
  const out = CanaryManager.feedback(req.params.id, String(req.body?.requestId || ''), req.body?.falsePositive !== false);
  return out.ok ? res.json({ success: true, rollout: canaryView(CanaryManager.get(req.params.id)!) }) : fail(res, 400, out.error || 'could not record feedback');
});

aiAssuranceRouter.post('/canary/:id/approve', (req: AuthenticatedRequest, res) => {
  if (!isCompliance(req)) return fail(res, 403, 'Only an admin, compliance officer or tenant owner can promote a canary to 100%');
  const r0 = CanaryManager.get(req.params.id); if (!r0 || r0.tenantId !== tenantOf(req)) return fail(res, 404, 'Rollout not found');
  try { const r = CanaryManager.approveFull(req.params.id, actor(req)); void audit(tenantOf(req), 'AI_CANARY_PROMOTED', r.id, 'INFO', { by: actor(req) }); res.json({ success: true, rollout: canaryView(r) }); }
  catch (e: any) { fail(res, 409, e.message); }
});

aiAssuranceRouter.post('/canary/:id/rollback', (req: AuthenticatedRequest, res) => {
  if (!isCompliance(req)) return fail(res, 403, 'Only an admin, compliance officer or tenant owner can roll back a canary');
  const r0 = CanaryManager.get(req.params.id); if (!r0 || r0.tenantId !== tenantOf(req)) return fail(res, 404, 'Rollout not found');
  try { const r = CanaryManager.rollback(req.params.id, actor(req), String(req.body?.reason || 'manual rollback')); void audit(tenantOf(req), 'AI_CANARY_ROLLED_BACK', r.id, 'WARNING', { by: actor(req) }); res.json({ success: true, rollout: canaryView(r) }); }
  catch (e: any) { fail(res, 409, e.message); }
});

// ── adaptive red-team ────────────────────────────────────────────────────────

aiAssuranceRouter.post('/redteam/adaptive', (req: AuthenticatedRequest, res) => {
  try {
    let seeds: string[];
    if (Array.isArray(req.body?.seeds)) {
      if (req.body.seeds.length < 1 || req.body.seeds.length > 50 || req.body.seeds.some((s: unknown) => typeof s !== 'string' || s.length > 2000)) return fail(res, 400, 'seeds must be 1..50 strings of at most 2000 characters');
      seeds = req.body.seeds;
    } else {
      const cats: string[] | undefined = Array.isArray(req.body?.categories) ? req.body.categories : undefined;
      seeds = ATTACK_CORPUS.filter(p => !cats || cats.includes(p.category)).slice(0, 47).map(p => renderPayload(p, { canary: 'CNRY-ADAPT' }));
      if (!seeds.length) return fail(res, 400, 'no seeds matched the requested categories');
    }
    const result = runAdaptiveRedTeam(seeds, { rounds: Number(req.body?.rounds) || 3, variantsPerSeed: Math.min(20, Number(req.body?.variantsPerSeed) || 10), seed: Number.isInteger(req.body?.seed) ? req.body.seed : 1, maxEvasions: Math.min(100, Number(req.body?.maxEvasions) || 30) });
    void audit(tenantOf(req), 'AI_ADAPTIVE_REDTEAM_RUN', 'guard', 'INFO', { tested: result.tested, singleOperatorRate: result.singleOperator.rate });
    res.json({ success: true, ...result });
  } catch (e: any) { fail(res, 500, e.message); }
});
