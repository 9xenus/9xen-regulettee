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
