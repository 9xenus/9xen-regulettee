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

CREATE TABLE IF NOT EXISTS shadow_it_assets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT 'primary',
  identifier TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  verdict TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'LOW',
  users INTEGER NOT NULL DEFAULT 0,
  sources TEXT NOT NULL DEFAULT '[]',
  trains_on_data TEXT NOT NULL DEFAULT 'UNKNOWN',
  data_residency TEXT NOT NULL DEFAULT 'Unknown',
  risk_factors TEXT NOT NULL DEFAULT '[]',
  recommended_fixes TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'DETECTED',
  fix_proposal_id TEXT,
  first_seen TEXT,
  last_seen TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_id, entity_id, identifier)
);

CREATE TABLE IF NOT EXISTS ai_assets (
  id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT 'primary',
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  vendor TEXT,
  region TEXT,
  sanctioned INTEGER,
  risk_class TEXT NOT NULL DEFAULT 'MINIMAL_RISK',
  annex_area TEXT,
  confidence REAL NOT NULL DEFAULT 0,
  requires_review INTEGER NOT NULL DEFAULT 1,
  signals TEXT NOT NULL DEFAULT '[]',
  obligations TEXT NOT NULL DEFAULT '[]',
  rationale TEXT,
  locations TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'DISCOVERED',
  risk_class_confirmed TEXT,
  confirmed_by TEXT,
  confirmed_at TEXT,
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tenant_id, entity_id, id)
);

CREATE TABLE IF NOT EXISTS ai_estate_evidence (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  scan_id TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  previous_hash TEXT,
  bundle_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  leaf_count INTEGER NOT NULL DEFAULT 0,
  leaves_json TEXT NOT NULL DEFAULT '[]',
  key_source TEXT NOT NULL DEFAULT 'UNKNOWN',
  sealed_at TEXT NOT NULL,
  UNIQUE (tenant_id, scan_id)
);

CREATE TABLE IF NOT EXISTS ai_monitor_baselines (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT 'primary',
  system_id TEXT NOT NULL,
  data_json TEXT NOT NULL,
  sample_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, entity_id, system_id)
);

CREATE TABLE IF NOT EXISTS ai_monitor_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT 'primary',
  system_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_decision_traces (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  system_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  prev_hash TEXT,
  trace_hash TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  model_id TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  status TEXT NOT NULL,
  risk_score REAL NOT NULL DEFAULT 0,
  decisions_json TEXT NOT NULL DEFAULT '[]',
  tool_calls_json TEXT NOT NULL DEFAULT '[]',
  needs_review INTEGER NOT NULL DEFAULT 0,
  review_json TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, system_id, seq)
);

CREATE TABLE IF NOT EXISTS ai_provenance_manifests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  system_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  minhash TEXT,
  model TEXT NOT NULL,
  label TEXT NOT NULL,
  signature TEXT NOT NULL,
  key_source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, content_hash)
);

CREATE TABLE IF NOT EXISTS ai_trust_history (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  system_id TEXT NOT NULL,
  score REAL,
  confidence REAL NOT NULL,
  tier TEXT NOT NULL,
  components_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_canary_rollouts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  state_json TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_monitor_runs ON ai_monitor_runs(tenant_id, entity_id, system_id, kind, created_at);
CREATE INDEX IF NOT EXISTS idx_traces_system ON ai_decision_traces(tenant_id, system_id, seq);
CREATE INDEX IF NOT EXISTS idx_prov_tenant ON ai_provenance_manifests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trust_hist ON ai_trust_history(tenant_id, entity_id, system_id, created_at);
CREATE INDEX IF NOT EXISTS idx_canary_tenant ON ai_canary_rollouts(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_assets_tenant ON ai_assets(tenant_id, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_evidence_tenant ON ai_estate_evidence(tenant_id, sealed_at);
CREATE INDEX IF NOT EXISTS idx_shadow_it_tenant ON shadow_it_assets(tenant_id, entity_id);
CREATE INDEX IF NOT EXISTS idx_shadow_it_status ON shadow_it_assets(status);
CREATE INDEX IF NOT EXISTS idx_ai_audit_tenant ON ai_risk_audit_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_findings_audit ON ai_risk_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_ai_findings_severity ON ai_risk_findings(severity);
CREATE INDEX IF NOT EXISTS idx_ai_findings_status ON ai_risk_findings(fix_status);
CREATE INDEX IF NOT EXISTS idx_ai_fixations_finding ON ai_risk_fixations(finding_id);
`;
