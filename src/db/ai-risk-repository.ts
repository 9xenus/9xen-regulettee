/**
 * AI RISK AUDIT REPOSITORY
 * Persistence layer for the AI risk assessment, findings, and fixation tables
 * defined in `ai_risk_audit_schema.ts`.
 *
 * All functions are synchronous (better-sqlite3) and tenant-scoped where the
 * schema supports it.
 */
import { getDb } from './sqlite';

// ── Row shapes (mirror the schema) ──────────────────────────────────────────

export interface AiRiskAuditRunRow {
  id: string;
  tenant_id: string;
  title: string;
  audit_type: string;
  status: string;
  overall_risk_score: number;
  critical_findings_count: number;
  high_findings_count: number;
  medium_findings_count: number;
  low_findings_count: number;
  compliance_rating: string;
  models_scanned: string;
  frameworks_evaluated: string;
  max_penalty_exposure_eur: number;
  audit_summary: string | null;
  created_at: string;
  completed_at: string;
}

export interface AiRiskFindingRow {
  id: string;
  audit_id: string;
  tenant_id: string;
  title: string;
  model_target: string;
  framework: string;
  article_reference: string;
  severity: string;
  category: string;
  description: string;
  affected_code_or_prompt: string | null;
  penalty_exposure_eur: number;
  fix_status: string;
  fix_proposal: string | null;
  applied_fix_id: string | null;
  created_at: string;
}

export interface AiRiskFixationRow {
  id: string;
  finding_id: string;
  tenant_id: string;
  strategy: string;
  original_code: string;
  patched_code: string;
  fixation_notes: string | null;
  verification_status: string;
  verification_score: number;
  audit_signature: string;
  applied_by: string;
  applied_at: string;
}

// ── Audit runs ───────────────────────────────────────────────────────────────

export interface NewAuditRun {
  id: string;
  tenantId: string;
  title: string;
  auditType: string;
  status: string;
  overallRiskScore: number;
  criticalFindingsCount: number;
  highFindingsCount: number;
  mediumFindingsCount: number;
  lowFindingsCount: number;
  complianceRating: string;
  modelsScanned: unknown;
  frameworksEvaluated: unknown;
  maxPenaltyExposureEur: number;
  auditSummary: string | null;
}

export function insertAiRiskAuditRun(run: NewAuditRun): void {
  getDb().prepare(`
    INSERT INTO ai_risk_audit_runs (
      id, tenant_id, title, audit_type, status, overall_risk_score,
      critical_findings_count, high_findings_count, medium_findings_count, low_findings_count,
      compliance_rating, models_scanned, frameworks_evaluated, max_penalty_exposure_eur,
      audit_summary, created_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    run.id,
    run.tenantId,
    run.title,
    run.auditType,
    run.status,
    run.overallRiskScore,
    run.criticalFindingsCount,
    run.highFindingsCount,
    run.mediumFindingsCount,
    run.lowFindingsCount,
    run.complianceRating,
    JSON.stringify(run.modelsScanned),
    JSON.stringify(run.frameworksEvaluated),
    run.maxPenaltyExposureEur,
    run.auditSummary
  );
}

export function listAiRiskAuditRuns(tenantId?: string, limit = 50): AiRiskAuditRunRow[] {
  const db = getDb();
  if (tenantId) {
    return db.prepare(
      'SELECT * FROM ai_risk_audit_runs WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?'
    ).all(tenantId, limit) as AiRiskAuditRunRow[];
  }
  return db.prepare(
    'SELECT * FROM ai_risk_audit_runs ORDER BY created_at DESC LIMIT ?'
  ).all(limit) as AiRiskAuditRunRow[];
}

export function getAiRiskAuditRun(id: string): AiRiskAuditRunRow | undefined {
  return getDb().prepare('SELECT * FROM ai_risk_audit_runs WHERE id = ?').get(id) as
    | AiRiskAuditRunRow
    | undefined;
}

export function countAiRiskAuditRuns(tenantId?: string): number {
  const db = getDb();
  if (tenantId) {
    return (db.prepare('SELECT count(*) as c FROM ai_risk_audit_runs WHERE tenant_id = ?').get(tenantId) as { c: number }).c;
  }
  return (db.prepare('SELECT count(*) as c FROM ai_risk_audit_runs').get() as { c: number }).c;
}

// ── Findings ─────────────────────────────────────────────────────────────────

export interface NewFinding {
  id: string;
  auditId: string;
  tenantId: string;
  title: string;
  modelTarget: string;
  framework: string;
  articleReference: string;
  severity: string;
  category: string;
  description: string;
  affectedCodeOrPrompt: string | null;
  penaltyExposureEur: number;
  fixStatus: string;
  fixProposal: string | null;
  appliedFixId: string | null;
}

export function insertAiRiskFinding(finding: NewFinding): void {
  getDb().prepare(`
    INSERT INTO ai_risk_findings (
      id, audit_id, tenant_id, title, model_target, framework, article_reference,
      severity, category, description, affected_code_or_prompt, penalty_exposure_eur,
      fix_status, fix_proposal, applied_fix_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    finding.id,
    finding.auditId,
    finding.tenantId,
    finding.title,
    finding.modelTarget,
    finding.framework,
    finding.articleReference,
    finding.severity,
    finding.category,
    finding.description,
    finding.affectedCodeOrPrompt,
    finding.penaltyExposureEur,
    finding.fixStatus,
    finding.fixProposal,
    finding.appliedFixId
  );
}

export function listAiRiskFindings(auditId?: string, tenantId?: string, limit = 200): AiRiskFindingRow[] {
  const db = getDb();
  if (auditId) {
    return db.prepare(
      'SELECT * FROM ai_risk_findings WHERE audit_id = ? ORDER BY created_at DESC LIMIT ?'
    ).all(auditId, limit) as AiRiskFindingRow[];
  }
  if (tenantId) {
    return db.prepare(
      'SELECT * FROM ai_risk_findings WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?'
    ).all(tenantId, limit) as AiRiskFindingRow[];
  }
  return db.prepare(
    'SELECT * FROM ai_risk_findings ORDER BY created_at DESC LIMIT ?'
  ).all(limit) as AiRiskFindingRow[];
}

export function getAiRiskFinding(id: string): AiRiskFindingRow | undefined {
  return getDb().prepare('SELECT * FROM ai_risk_findings WHERE id = ?').get(id) as
    | AiRiskFindingRow
    | undefined;
}

export function updateAiRiskFindingFixStatus(
  findingId: string,
  fixStatus: string,
  appliedFixId: string | null
): void {
  getDb().prepare(
    'UPDATE ai_risk_findings SET fix_status = ?, applied_fix_id = ? WHERE id = ?'
  ).run(fixStatus, appliedFixId, findingId);
}

// ── Fixations ────────────────────────────────────────────────────────────────

export interface NewFixation {
  id: string;
  findingId: string;
  tenantId: string;
  strategy: string;
  originalCode: string;
  patchedCode: string;
  fixationNotes: string | null;
  verificationStatus: string;
  verificationScore: number;
  auditSignature: string;
  appliedBy: string;
}

export function insertAiRiskFixation(fixation: NewFixation): void {
  getDb().prepare(`
    INSERT INTO ai_risk_fixations (
      id, finding_id, tenant_id, strategy, original_code, patched_code,
      fixation_notes, verification_status, verification_score, audit_signature, applied_by, applied_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    fixation.id,
    fixation.findingId,
    fixation.tenantId,
    fixation.strategy,
    fixation.originalCode,
    fixation.patchedCode,
    fixation.fixationNotes,
    fixation.verificationStatus,
    fixation.verificationScore,
    fixation.auditSignature,
    fixation.appliedBy
  );
}

export function listAiRiskFixations(tenantId?: string, limit = 100): AiRiskFixationRow[] {
  const db = getDb();
  if (tenantId) {
    return db.prepare(
      'SELECT * FROM ai_risk_fixations WHERE tenant_id = ? ORDER BY applied_at DESC LIMIT ?'
    ).all(tenantId, limit) as AiRiskFixationRow[];
  }
  return db.prepare(
    'SELECT * FROM ai_risk_fixations ORDER BY applied_at DESC LIMIT ?'
  ).all(limit) as AiRiskFixationRow[];
}

export function getAiRiskFixation(id: string): AiRiskFixationRow | undefined {
  return getDb().prepare('SELECT * FROM ai_risk_fixations WHERE id = ?').get(id) as
    | AiRiskFixationRow
    | undefined;
}

// ── Aggregations ─────────────────────────────────────────────────────────────

export interface AiRiskAuditSummary {
  totalAudits: number;
  totalFindings: number;
  openFindings: number;
  appliedFixations: number;
  criticalFindings: number;
  highFindings: number;
  averageRiskScore: number;
  totalPenaltyExposureEur: number;
}

export function getAiRiskAuditSummary(tenantId?: string): AiRiskAuditSummary {
  const db = getDb();
  const tenantClause = tenantId ? 'WHERE tenant_id = ?' : '';
  const params = tenantId ? [tenantId] : [];

  const audits = (db.prepare(
    `SELECT count(*) as c, COALESCE(avg(overall_risk_score), 0) as avg_score, COALESCE(sum(max_penalty_exposure_eur), 0) as total_penalty FROM ai_risk_audit_runs ${tenantClause}`
  ).get(...params)) as { c: number; avg_score: number; total_penalty: number };

  const findings = (db.prepare(
    `SELECT count(*) as c,
            COALESCE(sum(CASE WHEN fix_status = 'OPEN' THEN 1 ELSE 0 END), 0) as open,
            COALESCE(sum(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END), 0) as critical,
            COALESCE(sum(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END), 0) as high
     FROM ai_risk_findings ${tenantClause}`
  ).get(...params)) as { c: number; open: number; critical: number; high: number };

  const fixations = (db.prepare(
    `SELECT count(*) as c FROM ai_risk_fixations ${tenantClause}`
  ).get(...params)) as { c: number };

  return {
    totalAudits: audits.c,
    totalFindings: findings.c,
    openFindings: findings.open,
    appliedFixations: fixations.c,
    criticalFindings: findings.critical,
    highFindings: findings.high,
    averageRiskScore: Math.round(audits.avg_score),
    totalPenaltyExposureEur: audits.total_penalty
  };
}

// ── Shadow IT / Shadow AI assets ─────────────────────────────────────────────

export interface ShadowItAssetRow {
  id: string;
  tenant_id: string;
  entity_id: string;
  identifier: string;
  name: string;
  category: string;
  verdict: string;
  risk_score: number;
  severity: string;
  users: number;
  sources: string;
  trains_on_data: string;
  data_residency: string;
  risk_factors: string;
  recommended_fixes: string;
  status: string;
  fix_proposal_id: string | null;
  first_seen: string | null;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertShadowAsset {
  id: string;
  tenantId: string;
  entityId: string;
  identifier: string;
  name: string;
  category: string;
  verdict: string;
  riskScore: number;
  severity: string;
  users: number;
  sources: unknown;
  trainsOnData: string;
  dataResidency: string;
  riskFactors: unknown;
  recommendedFixes: unknown;
  firstSeen: string | null;
  lastSeen: string | null;
}

/**
 * Inserts or refreshes an asset. A re-detection never resets workflow state:
 * status / fix_proposal_id are preserved so approved or remediated assets don't reappear as new.
 */
export function upsertShadowItAsset(a: UpsertShadowAsset): void {
  getDb().prepare(`
    INSERT INTO shadow_it_assets (
      id, tenant_id, entity_id, identifier, name, category, verdict, risk_score, severity, users,
      sources, trains_on_data, data_residency, risk_factors, recommended_fixes, status, first_seen, last_seen
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (tenant_id, entity_id, identifier) DO UPDATE SET
      name = excluded.name, category = excluded.category, verdict = excluded.verdict,
      risk_score = excluded.risk_score, severity = excluded.severity, users = excluded.users,
      sources = excluded.sources, trains_on_data = excluded.trains_on_data, data_residency = excluded.data_residency,
      risk_factors = excluded.risk_factors, recommended_fixes = excluded.recommended_fixes,
      last_seen = COALESCE(excluded.last_seen, shadow_it_assets.last_seen),
      updated_at = datetime('now')
  `).run(
    a.id, a.tenantId, a.entityId, a.identifier, a.name, a.category, a.verdict, a.riskScore, a.severity, a.users,
    JSON.stringify(a.sources), a.trainsOnData, a.dataResidency, JSON.stringify(a.riskFactors), JSON.stringify(a.recommendedFixes),
    a.verdict === 'SANCTIONED' ? 'SANCTIONED' : 'DETECTED', a.firstSeen, a.lastSeen
  );
}

export function listShadowItAssets(tenantId: string, entityId?: string): ShadowItAssetRow[] {
  const db = getDb();
  if (entityId) {
    return db.prepare('SELECT * FROM shadow_it_assets WHERE tenant_id = ? AND entity_id = ? ORDER BY risk_score DESC').all(tenantId, entityId) as ShadowItAssetRow[];
  }
  return db.prepare('SELECT * FROM shadow_it_assets WHERE tenant_id = ? ORDER BY risk_score DESC').all(tenantId) as ShadowItAssetRow[];
}

export function getShadowItAsset(id: string, tenantId: string): ShadowItAssetRow | undefined {
  return getDb().prepare('SELECT * FROM shadow_it_assets WHERE id = ? AND tenant_id = ?').get(id, tenantId) as ShadowItAssetRow | undefined;
}

export function updateShadowItAssetStatus(id: string, tenantId: string, status: string, fixProposalId?: string | null): boolean {
  const r = getDb().prepare(
    `UPDATE shadow_it_assets SET status = ?, fix_proposal_id = COALESCE(?, fix_proposal_id), updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`
  ).run(status, fixProposalId ?? null, id, tenantId);
  return r.changes > 0;
}

export function getShadowItSummary(tenantId: string, entityId?: string) {
  const rows = listShadowItAssets(tenantId, entityId).filter(r => r.verdict !== 'SANCTIONED');
  const by = (f: (r: ShadowItAssetRow) => boolean) => rows.filter(f).length;
  return {
    unsanctioned: rows.length,
    shadowAi: by(r => r.verdict === 'SHADOW_AI' || r.verdict === 'UNCATALOGUED_AI'),
    shadowIt: by(r => r.verdict === 'SHADOW_IT'),
    critical: by(r => r.severity === 'CRITICAL'),
    high: by(r => r.severity === 'HIGH'),
    open: by(r => r.status === 'DETECTED'),
    fixProposed: by(r => r.status === 'FIX_PROPOSED'),
    remediated: by(r => r.status === 'REMEDIATED'),
    accepted: by(r => r.status === 'ACCEPTED'),
    averageRisk: rows.length ? Math.round(rows.reduce((s, r) => s + r.risk_score, 0) / rows.length) : 0
  };
}

// ── AI asset inventory ───────────────────────────────────────────────────────

export interface AiAssetRow {
  id: string; tenant_id: string; entity_id: string; type: string; name: string; vendor: string | null; region: string | null;
  sanctioned: number | null; risk_class: string; annex_area: string | null; confidence: number; requires_review: number;
  signals: string; obligations: string; rationale: string | null; locations: string; status: string;
  risk_class_confirmed: string | null; confirmed_by: string | null; confirmed_at: string | null; first_seen: string; last_seen: string;
}

export interface UpsertAiAsset {
  id: string; tenantId: string; entityId: string; type: string; name: string; vendor: string | null; region: string | null;
  sanctioned: boolean | null; riskClass: string; annexArea: string | null; confidence: number; requiresReview: boolean;
  signals: unknown; obligations: unknown; rationale: string; locations: unknown;
}

/** Re-discovery refreshes the heuristic classification but never overwrites a human-confirmed class or status. */
export function upsertAiAsset(a: UpsertAiAsset): void {
  getDb().prepare(`
    INSERT INTO ai_assets (id, tenant_id, entity_id, type, name, vendor, region, sanctioned, risk_class, annex_area, confidence,
      requires_review, signals, obligations, rationale, locations)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (tenant_id, entity_id, id) DO UPDATE SET
      vendor = excluded.vendor, region = excluded.region, sanctioned = excluded.sanctioned,
      risk_class = excluded.risk_class, annex_area = excluded.annex_area, confidence = excluded.confidence,
      requires_review = CASE WHEN ai_assets.risk_class_confirmed IS NOT NULL THEN 0 ELSE excluded.requires_review END,
      signals = excluded.signals, obligations = excluded.obligations, rationale = excluded.rationale,
      locations = excluded.locations, last_seen = datetime('now')
  `).run(a.id, a.tenantId, a.entityId, a.type, a.name, a.vendor, a.region, a.sanctioned === null ? null : a.sanctioned ? 1 : 0,
    a.riskClass, a.annexArea, a.confidence, a.requiresReview ? 1 : 0, JSON.stringify(a.signals), JSON.stringify(a.obligations),
    a.rationale, JSON.stringify(a.locations));
}

export function listAiAssets(tenantId: string, entityId?: string): AiAssetRow[] {
  const db = getDb();
  return (entityId
    ? db.prepare('SELECT * FROM ai_assets WHERE tenant_id = ? AND entity_id = ? ORDER BY last_seen DESC').all(tenantId, entityId)
    : db.prepare('SELECT * FROM ai_assets WHERE tenant_id = ? ORDER BY last_seen DESC').all(tenantId)) as AiAssetRow[];
}

export function getAiAsset(tenantId: string, entityId: string, id: string): AiAssetRow | undefined {
  return getDb().prepare('SELECT * FROM ai_assets WHERE tenant_id = ? AND entity_id = ? AND id = ?').get(tenantId, entityId, id) as AiAssetRow | undefined;
}

export function confirmAiAssetClass(tenantId: string, entityId: string, id: string, riskClass: string, by: string): boolean {
  return getDb().prepare(
    `UPDATE ai_assets SET risk_class_confirmed = ?, confirmed_by = ?, confirmed_at = datetime('now'), status = 'CONFIRMED', requires_review = 0
     WHERE tenant_id = ? AND entity_id = ? AND id = ?`
  ).run(riskClass, by, tenantId, entityId, id).changes > 0;
}

// ── Evidence bundles ─────────────────────────────────────────────────────────

export interface EvidenceRow {
  id: string; tenant_id: string; scan_id: string; merkle_root: string; previous_hash: string | null; bundle_hash: string;
  signature: string; leaf_count: number; leaves_json: string; key_source: string; sealed_at: string;
}

export function insertEvidenceBundle(e: {
  id: string; tenantId: string; scanId: string; merkleRoot: string; previousHash: string | null; bundleHash: string; signature: string;
  leafCount: number; sealedAt: string; keySource: string; leaves: { id: string; hash: string }[];
}): void {
  getDb().prepare(`
    INSERT INTO ai_estate_evidence (id, tenant_id, scan_id, merkle_root, previous_hash, bundle_hash, signature, leaf_count, leaves_json, key_source, sealed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(e.id, e.tenantId, e.scanId, e.merkleRoot, e.previousHash, e.bundleHash, e.signature, e.leafCount, JSON.stringify(e.leaves), e.keySource, e.sealedAt);
}

export function getEvidenceBundle(scanId: string, tenantId: string): EvidenceRow | undefined {
  return getDb().prepare('SELECT * FROM ai_estate_evidence WHERE scan_id = ? AND tenant_id = ?').get(scanId, tenantId) as EvidenceRow | undefined;
}

export function latestEvidenceBundle(tenantId: string): EvidenceRow | undefined {
  return getDb().prepare('SELECT * FROM ai_estate_evidence WHERE tenant_id = ? ORDER BY sealed_at DESC, rowid DESC LIMIT 1').get(tenantId) as EvidenceRow | undefined;
}

export function getEvidenceByHash(tenantId: string, hash: string): EvidenceRow | undefined {
  return getDb().prepare('SELECT * FROM ai_estate_evidence WHERE tenant_id = ? AND bundle_hash = ?').get(tenantId, hash) as EvidenceRow | undefined;
}

export function listEstateScans(tenantId: string, limit = 30): AiRiskAuditRunRow[] {
  return getDb().prepare(
    `SELECT * FROM ai_risk_audit_runs WHERE tenant_id = ? AND audit_type IN ('ESTATE_SCAN','PROMPT_INJECTION_TEST','MODEL_MONITOR') ORDER BY created_at DESC LIMIT ?`
  ).all(tenantId, limit) as AiRiskAuditRunRow[];
}


// ── Monitoring (baselines + runs) ────────────────────────────────────────────

export function upsertMonitorBaseline(b: { id: string; tenantId: string; entityId: string; systemId: string; data: unknown; sampleCount: number }): void {
  getDb().prepare(`INSERT INTO ai_monitor_baselines (id, tenant_id, entity_id, system_id, data_json, sample_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (tenant_id, entity_id, system_id) DO UPDATE SET data_json = excluded.data_json, sample_count = excluded.sample_count, created_at = excluded.created_at`)
    .run(b.id, b.tenantId, b.entityId, b.systemId, JSON.stringify(b.data), b.sampleCount, new Date().toISOString());
}
export function getMonitorBaseline(tenantId: string, entityId: string, systemId: string): { data: unknown; sample_count: number; created_at: string } | undefined {
  const row = getDb().prepare('SELECT data_json, sample_count, created_at FROM ai_monitor_baselines WHERE tenant_id = ? AND entity_id = ? AND system_id = ?').get(tenantId, entityId, systemId) as { data_json: string; sample_count: number; created_at: string } | undefined;
  return row ? { data: JSON.parse(row.data_json), sample_count: row.sample_count, created_at: row.created_at } : undefined;
}
export function insertMonitorRun(r: { id: string; tenantId: string; entityId: string; systemId: string; kind: string; status: string; result: unknown }): void {
  getDb().prepare('INSERT INTO ai_monitor_runs (id, tenant_id, entity_id, system_id, kind, status, result_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(r.id, r.tenantId, r.entityId, r.systemId, r.kind, r.status, JSON.stringify(r.result), new Date().toISOString());
}
export interface MonitorRunRow { id: string; tenant_id: string; entity_id: string; system_id: string; kind: string; status: string; result_json: string; created_at: string }
export function listMonitorRuns(tenantId: string, entityId?: string, systemId?: string, kind?: string, limit = 50): MonitorRunRow[] {
  const where = ['tenant_id = ?']; const args: unknown[] = [tenantId];
  if (entityId) { where.push('entity_id = ?'); args.push(entityId); }
  if (systemId) { where.push('system_id = ?'); args.push(systemId); }
  if (kind) { where.push('kind = ?'); args.push(kind); }
  return getDb().prepare(`SELECT * FROM ai_monitor_runs WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ?`).all(...args, limit) as MonitorRunRow[];
}

// ── Decision traces ──────────────────────────────────────────────────────────

export interface TraceRow {
  id: string; tenant_id: string; system_id: string; seq: number; prev_hash: string | null; trace_hash: string; input_hash: string; output_hash: string;
  model_id: string; policy_version: string; status: string; risk_score: number; decisions_json: string; tool_calls_json: string; needs_review: number;
  review_json: string | null; created_at: string;
}
export function lastTrace(tenantId: string, systemId: string): { seq: number; trace_hash: string } | undefined {
  return getDb().prepare('SELECT seq, trace_hash FROM ai_decision_traces WHERE tenant_id = ? AND system_id = ? ORDER BY seq DESC LIMIT 1').get(tenantId, systemId) as { seq: number; trace_hash: string } | undefined;
}
export function insertTraceRow(t: TraceRow): void {
  getDb().prepare(`INSERT INTO ai_decision_traces (id, tenant_id, system_id, seq, prev_hash, trace_hash, input_hash, output_hash, model_id, policy_version, status, risk_score, decisions_json, tool_calls_json, needs_review, review_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(t.id, t.tenant_id, t.system_id, t.seq, t.prev_hash, t.trace_hash, t.input_hash, t.output_hash, t.model_id, t.policy_version, t.status, t.risk_score, t.decisions_json, t.tool_calls_json, t.needs_review, t.review_json, t.created_at);
}
export function listTraceRows(tenantId: string, systemId: string, limit = 50, offset = 0, newestFirst = true): TraceRow[] {
  return getDb().prepare(`SELECT * FROM ai_decision_traces WHERE tenant_id = ? AND system_id = ? ORDER BY seq ${newestFirst ? 'DESC' : 'ASC'} LIMIT ? OFFSET ?`).all(tenantId, systemId, limit, offset) as TraceRow[];
}
export function getTraceRow(tenantId: string, id: string): TraceRow | undefined {
  return getDb().prepare('SELECT * FROM ai_decision_traces WHERE tenant_id = ? AND id = ?').get(tenantId, id) as TraceRow | undefined;
}
export function setTraceReview(tenantId: string, id: string, review: unknown): boolean {
  return getDb().prepare('UPDATE ai_decision_traces SET review_json = ? WHERE tenant_id = ? AND id = ? AND review_json IS NULL').run(JSON.stringify(review), tenantId, id).changes > 0;
}
export function listTraceSystems(tenantId: string): { system_id: string; n: number; needs_review: number; reviewed: number; last_at: string }[] {
  return getDb().prepare(`SELECT system_id, COUNT(*) n, SUM(needs_review) needs_review, SUM(CASE WHEN review_json IS NOT NULL THEN 1 ELSE 0 END) reviewed, MAX(created_at) last_at
    FROM ai_decision_traces WHERE tenant_id = ? GROUP BY system_id ORDER BY last_at DESC`).all(tenantId) as { system_id: string; n: number; needs_review: number; reviewed: number; last_at: string }[];
}
export function oversightCounts(tenantId: string, systemId: string): { required: number; reviewed: number } {
  const r = getDb().prepare(`SELECT COALESCE(SUM(needs_review),0) required, COALESCE(SUM(CASE WHEN needs_review = 1 AND review_json IS NOT NULL THEN 1 ELSE 0 END),0) reviewed FROM ai_decision_traces WHERE tenant_id = ? AND system_id = ?`).get(tenantId, systemId) as { required: number; reviewed: number };
  return r;
}

// ── Provenance ───────────────────────────────────────────────────────────────

export interface ManifestRow { id: string; tenant_id: string; system_id: string; content_hash: string; minhash: string | null; model: string; label: string; signature: string; key_source: string; created_at: string }
export function insertManifestRow(m: ManifestRow): void {
  getDb().prepare(`INSERT INTO ai_provenance_manifests (id, tenant_id, system_id, content_hash, minhash, model, label, signature, key_source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(m.id, m.tenant_id, m.system_id, m.content_hash, m.minhash, m.model, m.label, m.signature, m.key_source, m.created_at);
}
export function getManifestByHash(tenantId: string, hash: string): ManifestRow | undefined {
  return getDb().prepare('SELECT * FROM ai_provenance_manifests WHERE tenant_id = ? AND content_hash = ?').get(tenantId, hash) as ManifestRow | undefined;
}
export function listManifests(tenantId: string, limit = 5000): ManifestRow[] {
  return getDb().prepare('SELECT * FROM ai_provenance_manifests WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?').all(tenantId, limit) as ManifestRow[];
}

// ── Trust history ────────────────────────────────────────────────────────────

export function insertTrustHistory(h: { id: string; tenantId: string; entityId: string; systemId: string; score: number | null; confidence: number; tier: string; components: unknown }): void {
  getDb().prepare('INSERT INTO ai_trust_history (id, tenant_id, entity_id, system_id, score, confidence, tier, components_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(h.id, h.tenantId, h.entityId, h.systemId, h.score, h.confidence, h.tier, JSON.stringify(h.components), new Date().toISOString());
}
export function listTrustHistory(tenantId: string, entityId: string, systemId: string, limit = 30): { score: number | null; confidence: number; tier: string; created_at: string }[] {
  return getDb().prepare('SELECT score, confidence, tier, created_at FROM ai_trust_history WHERE tenant_id = ? AND entity_id = ? AND system_id = ? ORDER BY created_at DESC LIMIT ?').all(tenantId, entityId, systemId, limit) as { score: number | null; confidence: number; tier: string; created_at: string }[];
}

// ── Canary rollouts ──────────────────────────────────────────────────────────

export interface CanaryRow { id: string; tenant_id: string; name: string; status: string; state_json: string; created_by: string; created_at: string; updated_at: string }
export function upsertCanaryRow(c: { id: string; tenantId: string; name: string; status: string; state: unknown; createdBy: string; createdAt: string }): void {
  getDb().prepare(`INSERT INTO ai_canary_rollouts (id, tenant_id, name, status, state_json, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET status = excluded.status, state_json = excluded.state_json, updated_at = excluded.updated_at`)
    .run(c.id, c.tenantId, c.name, c.status, JSON.stringify(c.state), c.createdBy, c.createdAt, new Date().toISOString());
}
export function getCanaryRow(id: string): CanaryRow | undefined { return getDb().prepare('SELECT * FROM ai_canary_rollouts WHERE id = ?').get(id) as CanaryRow | undefined; }
export function listCanaryRows(tenantId: string): CanaryRow[] { return getDb().prepare('SELECT * FROM ai_canary_rollouts WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50').all(tenantId) as CanaryRow[]; }
export function activeCanaryRow(tenantId: string): CanaryRow | undefined { return getDb().prepare("SELECT * FROM ai_canary_rollouts WHERE tenant_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1").get(tenantId) as CanaryRow | undefined; }

// ── Helpers for trust inputs ─────────────────────────────────────────────────

export function latestRunOfType(tenantId: string, auditType: string, entityId: string): AiRiskAuditRunRow | undefined {
  return getDb().prepare(`SELECT * FROM ai_risk_audit_runs WHERE tenant_id = ? AND audit_type = ? AND models_scanned LIKE ? ORDER BY created_at DESC LIMIT 1`)
    .get(tenantId, auditType, `%"entityId":${JSON.stringify(entityId)}%`) as AiRiskAuditRunRow | undefined;
}
