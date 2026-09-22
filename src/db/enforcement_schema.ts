/**
 * Phase 2: Automated Enforcement Engine Schema (PostgreSQL / SQLite Dual Compatibility)
 * Tables:
 *  - enf_cases: End-to-end enforcement cases across regulatory lifecycle stages
 *  - enf_actions: Enforcement statutory actions with 2-person dual approval enforcement
 *  - enf_evidence_vault: RFC 3161 court-grade SHA-256 hash-chained evidence vault
 *  - enf_sla_deadlines: Automated legal SLA tracking and hierarchical escalations (L0-L3)
 *  - enf_dispatches: Multi-channel statutory notice dispatching with cryptographic delivery proofs
 */

export const ENFORCEMENT_ENGINE_SCHEMA = `
CREATE TABLE IF NOT EXISTS enf_cases (
  id TEXT PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  entity_id TEXT NOT NULL,
  law_id TEXT NOT NULL,
  country_id TEXT NOT NULL DEFAULT 'BD',
  stage TEXT NOT NULL DEFAULT 'intake', -- intake, evidence_review, hearing, order_issued, appeal, enforcement, closed
  severity TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
  assigned_officer_id TEXT,
  title TEXT,
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enf_actions (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- warning_letter, show_cause_notice, fine, license_suspension, site_takedown, court_referral
  parameters_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_approval, approved, dispatched, executed, failed
  approved_by_1 TEXT,
  approved_by_2 TEXT,
  approved_at_1 TIMESTAMP,
  approved_at_2 TIMESTAMP,
  dispatched_at TIMESTAMP,
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES enf_cases(id)
);

CREATE TABLE IF NOT EXISTS enf_evidence_vault (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  file_hash_sha256 TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  timestamp_utc TIMESTAMP NOT NULL,
  rfc3161_token TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES enf_cases(id)
);

CREATE TABLE IF NOT EXISTS enf_sla_deadlines (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  action_id TEXT,
  deadline_type TEXT NOT NULL, -- show_cause_response, hearing_schedule, fine_payment, corrective_action
  due_at TIMESTAMP NOT NULL,
  escalation_level INTEGER NOT NULL DEFAULT 0, -- 0: Normal, 1: First Warning, 2: Director Esc, 3: Court Referral
  status TEXT NOT NULL DEFAULT 'active', -- active, met, breached, waived
  escalated_to TEXT,
  escalated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES enf_cases(id)
);

CREATE TABLE IF NOT EXISTS enf_dispatches (
  id TEXT PRIMARY KEY,
  action_id TEXT NOT NULL,
  channel TEXT NOT NULL, -- email, portal, webhook, api_regulator
  recipient TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued', -- queued, sent, delivered, failed
  delivery_proof_hash TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (action_id) REFERENCES enf_actions(id)
);

CREATE INDEX IF NOT EXISTS idx_enf_cases_entity ON enf_cases(entity_id);
CREATE INDEX IF NOT EXISTS idx_enf_cases_stage ON enf_cases(stage);
CREATE INDEX IF NOT EXISTS idx_enf_cases_country ON enf_cases(country_id);
CREATE INDEX IF NOT EXISTS idx_enf_actions_case ON enf_actions(case_id);
CREATE INDEX IF NOT EXISTS idx_enf_actions_status ON enf_actions(status);
CREATE INDEX IF NOT EXISTS idx_enf_evidence_hash ON enf_evidence_vault(file_hash_sha256);
CREATE INDEX IF NOT EXISTS idx_enf_evidence_case ON enf_evidence_vault(case_id);
CREATE INDEX IF NOT EXISTS idx_enf_sla_case ON enf_sla_deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_enf_sla_due ON enf_sla_deadlines(due_at, status);
CREATE INDEX IF NOT EXISTS idx_enf_dispatches_action ON enf_dispatches(action_id);
CREATE INDEX IF NOT EXISTS idx_enf_dispatches_status ON enf_dispatches(status);
`;
