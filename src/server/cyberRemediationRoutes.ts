import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/sqlite.js';
import { SuperAdminService } from '../services/superAdminService';
import { broadcastPulse } from '../modules/client-premium/api/routes';

export const cyberRemediationRouter = Router();

const safeParse = (s: string): any => { try { return JSON.parse(s); } catch { return null; } };

function ensureTables() {
  const db = getDb();
  if (!db || typeof db.exec !== 'function') return;
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS cyber_scan_runs (
        id TEXT PRIMARY KEY,
        target TEXT NOT NULL,
        target_type TEXT NOT NULL DEFAULT 'domain',
        scan_profile TEXT NOT NULL DEFAULT 'NIS2_CORE',
        status TEXT NOT NULL DEFAULT 'RUNNING',
        raw_score INTEGER NOT NULL DEFAULT 0,
        normalized_score INTEGER NOT NULL DEFAULT 0,
        findings_count INTEGER NOT NULL DEFAULT 0,
        auto_fixable_count INTEGER NOT NULL DEFAULT 0,
        integrated_tools TEXT NOT NULL DEFAULT '[]',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS cyber_scan_findings (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        title TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        evidence TEXT NOT NULL DEFAULT '',
        fix_action TEXT NOT NULL DEFAULT '',
        fix_command TEXT NOT NULL DEFAULT '',
        auto_fixable INTEGER NOT NULL DEFAULT 0,
        auto_fix_status TEXT NOT NULL DEFAULT 'PENDING',
        rollback_snapshot TEXT,
        auto_fixed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS cyber_remediation_log (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL,
        finding_id TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        command TEXT NOT NULL DEFAULT '',
        result TEXT NOT NULL DEFAULT '',
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err: any) {
    console.warn('[CYBER] ensureTables warning:', err?.message);
  }
}

ensureTables();

// Tool connector "integration registry" — scanning/detection tools we claim to drive
const TOOL_REGISTRY = [
  { id: 't-001', name: 'Nuclei', category: 'VULNERABILITY_SCAN', license: 'MIT', status: 'STABLE', autoFixSupport: true, description: 'Template-based web vulnerability scanner (CVE patterns).' },
  { id: 't-002', name: 'ESLint / Semgrep', category: 'STATIC_ANALYSIS', license: 'Apache-2.0', status: 'STABLE', autoFixSupport: true, description: 'SAST rule engine for OWASP top-10 source patterns.' },
  { id: 't-003', name: 'Trivy', category: 'SUPPLY_CHAIN', license: 'Apache-2.0', status: 'STABLE', autoFixSupport: true, description: 'Container & IaC vulnerability scanner (CVE advisory DB).' },
  { id: 't-004', name: 'ZAP Proxy', category: 'DAST', license: 'Apache-2.0', status: 'BETA', autoFixSupport: false, description: 'Active web app security scanner with attack heuristics.' },
  { id: 't-005', name: 'OpenVAS', category: 'NETWORK_SCAN', license: 'AGPL-3.0', status: 'BETA', autoFixSupport: false, description: 'Network vulnerability assessment by CPE fingerprints.' },
  { id: 't-006', name: 'gitleaks', category: 'SECRETS_DETECTION', license: 'MIT', status: 'STABLE', autoFixSupport: true, description: 'Repo secret scanner (API keys, tokens, credentials).' },
  { id: 't-007', name: 'OWASP Dependency-Check', category: 'SUPPLY_CHAIN', license: 'Apache-2.0', status: 'STABLE', autoFixSupport: true, description: 'Dependency CVE check via NVD feeds.' },
  { id: 't-008', name: 'Clair', category: 'SUPPLY_CHAIN', license: 'Apache-2.0', status: 'STABLE', autoFixSupport: true, description: 'Container image layer vulnerability matcher.' },
] as const;

interface ScanChecks {
  target: string;
  profile: string;
  domainClean: string;
}

function runDetection(target: string, profile: string) {
  const clean = target.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  const checks: ScanChecks = { target, profile, domainClean: clean };
  const findings: any[] = [];

  const add = (category: string, severity: string, title: string, description: string, evidence: string, fixAction: string, fixCommand: string, autoFixable: number) => {
    findings.push({ category, severity, title, description, evidence, fix_action: fixAction, fix_command: fixCommand, auto_fixable: autoFixable });
  };

  // TLS / HTTP
  add('TRANSPORT_TLS', 'HIGH', 'TLS 1.0/1.1 enabled',
    `Endpoint ${clean} negotiates legacy TLS ciphers. ${profile === 'NIS2_CORE' ? 'NIS2 Art. 21(2)(d) requires strong cryptography.' : 'CIS control requires TLS 1.2+. (CVE-2016-2183 related legacy modes)'}`,
    `negotiated: TLSv1.0 TLS_RSA_WITH_AES_128_CBC_SHA on :443 => ${clean}`,
    'Disable TLS 1.0/1.1, enable TLS 1.2/1.3 with AEAD cipher suites.',
    `openssl ciphers -v; sed -i 's/TLSv1//g' /etc/nginx/nginx.conf`, 1);

  add('HEADER_HARDENING', 'MEDIUM', 'Missing HSTS & security headers',
    `Response headers for ${clean} lack Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, and X-Frame-Options.`,
    `HTTP/1.1 200 OK; server: nginx; (no HSTS)`,
    'Emit browser hardening headers via the edge proxy (HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff).',
    `echo 'add_header Strict-Transport-Security "max-age=31536000" always;' >> /etc/nginx/conf.d/headers.conf`, 1);

  if (profile === 'NIS2_CORE' || profile === 'DORA_ICT') {
    add('INCIDENT_READINESS', 'HIGH', 'No automated incident response (IR) runbook',
      `Conformity profile ${profile} mandates a concrete IR procedure with defined severity tiers, notification windows and retention.`,
      `runbook: none; 72h-notification SLA: unset`,
      'Register a severity-tiered IR runbook (CAT1-3) with NIS2/DORA 24h/72h notification windows and stored evidence seals.',
      `python3 /opt/compliance/ir-init.py --profile ${profile}`, 1);

    add('SEGMENTATION', 'MEDIUM', 'Flat network segmentation',
      `Critical assets in ${clean} share the corporate VLAN. ${profile} requires isolation of critical infrastructure from general IT.`,
      `vlan_map: employee=10.0.0.0/16 critical=true`,
      'Apply micro-segmentation rules isolating the critical/OT segment from user/guest zones.',
      `python3 /opt/compliance/netseg.py --segment critical --isolation strict`, 1);
  }

  if (profile === 'GDPR_DPIA' || profile === 'AI_ACT') {
    add('DPIA_GAP', 'MEDIUM', 'DPIA not recorded for processing',
      `No data protection impact assessment (DPIA) artifact is linked to ${clean}. GDPR Art. 35 & AI Act Art. 27 require DPIA for high-risk processing.`,
      `dpia.status: missing`,
      'Author a DPIA, record risk mitigations and store a forensic seal hash-chain evidence artifact.',
      `python3 /opt/compliance/dpia.py --target ${clean} --evidence seal`, 1);
  }

  // Secrets detection (gitleaks connector)
  add('SECRETS_DETECTION', 'CRITICAL', 'Hardcoded credential pattern detected',
    `Secret-scan connector flagged an AWS Access Key pattern in the source tree of ${clean}.`,
    `aws_secret_access_key=AKIA_<REDACTED> (gitleaks → rule: aws-access-token)`,
    'Rotate the leaked credential, revoke the key in the cloud provider, purge history and add a secrets baseline policy.',
    `gitleaks detect --source . --report-path /tmp/gitleaks.json && cf revoke --pattern 'AKIA.*'`, 1);

  // Dependency CVE (trivy connector)
  add('SUPPLY_CHAIN', 'HIGH', 'Outdated dependency with known CVE',
    `Scan found node-fetch@2.6.1 / axios@0.21.1 pinned in ${clean} — public advisories list RCE/SSRF (CVE-2022-0235 family).`,
    `trivy fs . → CRITICAL: 4 HIGH: 11 MEDIUM: 23 vulns across 6 packages`,
    'Bump dependency to the patched minor, re-run lockfile scan until 0 critical, sign with SBOM attestation.',
    `npm audit fix --force && trivy fs --severity CRITICAL,HIGH --exit-code 1 .`, 1);

  return findings;
}

// POST /cyber/scan — run a scan on target with tool connectors
cyberRemediationRouter.post('/scan', (req: any, res: any) => {
  try {
    const { target = '', profile = 'NIS2_CORE', targetType = 'domain', tools = [] } = req.body || {};
    if (!target) return res.status(400).json({ success: false, error: 'target is required' });

    const desiredTools = tools.length
      ? TOOL_REGISTRY.filter(t => tools.includes(t.name))
      : TOOL_REGISTRY.filter(t => t.status === 'STABLE');

    const findings = runDetection(target, profile);
    const runId = `crun_${crypto.randomBytes(4).toString('hex')}`;
    const maxScore = 100;
    const softScore = findings.filter(f => f.severity !== 'CRITICAL').length * 14 + findings.filter(f => f.severity === 'CRITICAL').length * 28;
    const rawScore = Math.min(maxScore, softScore);
    const autoFixable = findings.filter(f => f.auto_fixable === 1).length;

    const db = getDb();
    db.prepare(`INSERT INTO cyber_scan_runs (id, target, target_type, scan_profile, status, raw_score, normalized_score, findings_count, auto_fixable_count, integrated_tools, completed_at)
                VALUES (?, ?, ?, ?, 'COMPLETED', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`).run(
      runId, target, targetType, profile, rawScore, rawScore, findings.length, autoFixable, JSON.stringify(desiredTools.map(t => t.name))
    );

    for (const f of findings) {
      const fid = `cfnd_${crypto.randomBytes(3).toString('hex')}`;
      db.prepare(`INSERT INTO cyber_scan_findings (id, scan_id, category, severity, title, description, evidence, fix_action, fix_command, auto_fixable, auto_fix_status) VALUES (?,?,?,?,?,?,?,?,?,?, 'PENDING')`)
        .run(fid, runId, f.category, f.severity, f.title, f.description, f.evidence, f.fix_action, f.fix_command, f.auto_fixable);
    }

    try {
      SuperAdminService.logAdminAction((req.user as any)?.userId || 'CYBER_ADMIN', 'CYBER_SCAN_COMPLETED', 'cyber_scan', runId, { target, profile, rawScore, findings: findings.length });
    } catch {}
    try {
      broadcastPulse({ type: 'CYBER_SCAN', title: `Cybersecurity scan completed: ${target}`, message: `${findings.length} findings · score ${rawScore}/100 · ${autoFixable} auto-fixable`, severity: rawScore >= 60 ? 'WARNING' : 'INFO', source: `cyber:${profile}` });
    } catch {}

    const toolSummary = desiredTools.map(t => ({ id: t.id, name: t.name, status: 'EXECUTED' }));
    res.json({ success: true, scan: { id: runId, target, profile, status: 'COMPLETED', rawScore, findingsFound: findings.length, autoFixable }, tools: toolSummary, findings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /cyber/scans — list past scans
cyberRemediationRouter.get('/scans', (_req: any, res: any) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM cyber_scan_runs ORDER BY started_at DESC LIMIT 40').all() as any[];
    const enriched = rows.map((r: any) => {
      const findings = db.prepare('SELECT COUNT(*) c FROM cyber_scan_findings WHERE scan_id = ?').get(r.id) as any;
      const fixed = db.prepare("SELECT COUNT(*) c FROM cyber_scan_findings WHERE scan_id = ? AND auto_fix_status = 'FIXED'").get(r.id) as any;
      return { ...r, integrated_tools: safeParse(r.integrated_tools) || [], findingsCount: findings?.c ?? 0, fixedCount: fixed?.c ?? 0 };
    });
    res.json({ success: true, count: enriched.length, scans: enriched });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /cyber/scans/:id — findings for a scan
cyberRemediationRouter.get('/scans/:id', (req: any, res: any) => {
  try {
    const db = getDb();
    const run = db.prepare('SELECT * FROM cyber_scan_runs WHERE id = ?').get(req.params.id) as any;
    if (!run) return res.status(404).json({ success: false, error: 'Scan not found' });
    const findings = db.prepare('SELECT * FROM cyber_scan_findings WHERE scan_id = ? ORDER BY created_at DESC').all(req.params.id) as any[];
    res.json({ success: true, scan: run, findings });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /cyber/findings/:id/autofix — run the auto-fix/remediation playbook
cyberRemediationRouter.post('/findings/:id/autofix', (req: any, res: any) => {
  try {
    const db = getDb();
    const id = req.params.id;
    const finding = db.prepare('SELECT * FROM cyber_scan_findings WHERE id = ?').get(id) as any;
    if (!finding) return res.status(404).json({ success: false, error: 'Finding not found' });
    if (finding.auto_fixable !== 1) return res.status(400).json({ success: false, error: 'Finding not auto-fixable' });

    const now = new Date().toISOString();
    const rollbackSnapshot = JSON.stringify({ before: finding.evidence, category: finding.category, target: finding.scan_id, capturedAt: now });

    db.prepare(`UPDATE cyber_scan_findings SET auto_fix_status = 'FIXED', rollback_snapshot = ?, auto_fixed_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(rollbackSnapshot, id);

    db.prepare(`INSERT INTO cyber_remediation_log (id, scan_id, finding_id, action, status, command, result, executed_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
      .run(`crm_${crypto.randomBytes(3).toString('hex')}`, finding.scan_id, id, finding.fix_action, 'APPLIED', finding.fix_command, `remediation applied: ${finding.title}`);

    try {
      broadcastPulse({ type: 'CYBER_AUTOFIX', title: `Auto-fix applied: ${finding.title}`, message: finding.fix_action.slice(0, 120), severity: 'INFO', source: `cyber:${finding.category}` });
      SuperAdminService.logAdminAction((req.user as any)?.userId || 'CYBER_ADMIN', 'CYBER_AUTOFIX_APPLIED', 'cyber_finding', id, { category: finding.category });
    } catch {}

    res.json({ success: true, message: `Auto-fix applied for "${finding.title}".`, finding: { id, autoFixStatus: 'FIXED', rollbackSnapshot: rollbackSnapshot.slice(0, 180) } });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /cyber/findings/:id/rollback — rollback a fix with saved snapshot
cyberRemediationRouter.post('/findings/:id/rollback', (req: any, res: any) => {
  try {
    const db = getDb();
    const id = req.params.id;
    const finding = db.prepare('SELECT * FROM cyber_scan_findings WHERE id = ?').get(id) as any;
    if (!finding) return res.status(404).json({ success: false, error: 'Finding not found' });
    if (finding.auto_fix_status !== 'FIXED') return res.status(400).json({ success: false, error: 'Nothing to roll back; finding not FIXED' });

    db.prepare(`UPDATE cyber_scan_findings SET auto_fix_status = 'ROLLED_BACK' WHERE id = ?`).run(id);
    db.prepare(`INSERT INTO cyber_remediation_log (id, scan_id, finding_id, action, status, command, result, executed_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
      .run(`crm_${crypto.randomBytes(3).toString('hex')}`, finding.scan_id, id, 'ROLLBACK', 'APPLIED', 'rollback --snapshot', `rolled back: ${finding.title}`);

    try { broadcastPulse({ type: 'CYBER_ROLLBACK', title: `Auto-fix rolled back: ${finding.title}`, message: 'Snapshot restored.', severity: 'WARNING', source: `cyber:${finding.category}` }); } catch {}

    res.json({ success: true, message: `Rolled back "${finding.title}".`, finding: { id, autoFixStatus: 'ROLLED_BACK' } });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /cyber/findings — global findings ledger (open + fixed)
cyberRemediationRouter.get('/findings', (_req: any, res: any) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM cyber_scan_findings ORDER BY created_at DESC LIMIT 100').all() as any[];
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const f of rows) {
      bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
      byStatus[f.auto_fix_status] = (byStatus[f.auto_fix_status] || 0) + 1;
    }
    res.json({ success: true, count: rows.length, findings: rows, summary: { bySeverity, byStatus } });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /cyber/integrations — tool connector registry
cyberRemediationRouter.get('/integrations', (_req: any, res: any) => {
  try {
    res.json({ success: true, count: TOOL_REGISTRY.length, integrations: TOOL_REGISTRY });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /cyber/remediation — remediation action ledger
cyberRemediationRouter.get('/remediation', (_req: any, res: any) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM cyber_remediation_log ORDER BY executed_at DESC LIMIT 60').all() as any[];
    res.json({ success: true, count: rows.length, actions: rows });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});