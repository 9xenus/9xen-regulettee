export const AI_RISK_AUDIT_SCHEMA = `
CREATE TABLE IF NOT EXISTS ai_risk_audit_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  audit_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  overall_risk_score INTEGER NOT NULL DEFAULT 88,
  critical_findings_count INTEGER NOT NULL DEFAULT 0,
  high_findings_count INTEGER NOT NULL DEFAULT 0,
  medium_findings_count INTEGER NOT NULL DEFAULT 0,
  low_findings_count INTEGER NOT NULL DEFAULT 0,
  compliance_rating TEXT NOT NULL DEFAULT 'MODERATE',
  models_scanned TEXT NOT NULL,
  frameworks_evaluated TEXT NOT NULL,
  max_penalty_exposure_eur REAL NOT NULL DEFAULT 0,
  audit_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_risk_findings (
  id TEXT PRIMARY KEY,
  audit_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  model_target TEXT NOT NULL,
  framework TEXT NOT NULL,
  article_reference TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_code_or_prompt TEXT,
  penalty_exposure_eur REAL NOT NULL DEFAULT 0,
  fix_status TEXT NOT NULL DEFAULT 'OPEN',
  fix_proposal TEXT,
  applied_fix_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_id) REFERENCES ai_risk_audit_runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_risk_fixations (
  id TEXT PRIMARY KEY,
  finding_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'BALANCED',
  original_code TEXT NOT NULL,
  patched_code TEXT NOT NULL,
  fixation_notes TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PASSED',
  verification_score INTEGER NOT NULL DEFAULT 96,
  audit_signature TEXT NOT NULL,
  applied_by TEXT NOT NULL DEFAULT 'Autonomous Compliance Agent',
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (finding_id) REFERENCES ai_risk_findings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_tenant ON ai_risk_audit_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_findings_audit ON ai_risk_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_ai_findings_severity ON ai_risk_findings(severity);
CREATE INDEX IF NOT EXISTS idx_ai_findings_status ON ai_risk_findings(fix_status);
CREATE INDEX IF NOT EXISTS idx_ai_fixations_finding ON ai_risk_fixations(finding_id);
`;
