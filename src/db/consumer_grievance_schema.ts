export const CONSUMER_GRIEVANCE_SCHEMA = `
CREATE TABLE IF NOT EXISTS grv_reports (
  id TEXT PRIMARY KEY,
  ref_code TEXT UNIQUE NOT NULL, -- e.g. GRV-BD-2026-98124
  country_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'WEB_WIDGET', -- WEB_WIDGET, WHATSAPP, SMS, PORTAL_INTERNAL, PARTNER_API, FACEBOOK_MESSENGER, INSTAGRAM_DM
  entity_name TEXT NOT NULL,
  entity_id TEXT, -- nullable fuzzy-matched entity
  raw_category TEXT NOT NULL,
  normalized_category TEXT NOT NULL,
  description_encrypted TEXT NOT NULL,
  amount_range TEXT,
  incident_date TEXT,
  evidence_ids_json TEXT DEFAULT '[]',
  others_affected TEXT,
  complainant_ref TEXT, -- encrypted identity vault ref, NEVER plaintext PII
  anonymity_mode TEXT DEFAULT 'anonymous', -- anonymous, identified
  status TEXT DEFAULT 'received', -- received, triaged, merged, assigned, under_review, resolved, rejected, referred_out
  credibility_score REAL DEFAULT 0.8,
  triage_json TEXT DEFAULT '{}',
  assigned_authority_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grv_report_evidence (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_ref TEXT NOT NULL,
  hash TEXT NOT NULL,
  notarized INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grv_clusters (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  pattern_summary TEXT NOT NULL,
  report_ids_json TEXT NOT NULL DEFAULT '[]',
  severity_max INTEGER DEFAULT 3, -- 1 to 5
  status TEXT DEFAULT 'ACTIVE',
  linked_violation_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grv_outcomes (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  outcome TEXT NOT NULL, -- REMEDIATED_BY_ENTERPRISE, MERGED_TO_VIOLATION, DISMISSED, REFERRED_OUT
  authority_id TEXT,
  enterprise_remediation_json TEXT,
  complainant_confirmed INTEGER DEFAULT 0,
  resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grv_complainant_reputation (
  id TEXT PRIMARY KEY,
  complainant_ref TEXT UNIQUE NOT NULL,
  reports_filed INTEGER DEFAULT 1,
  reports_validated INTEGER DEFAULT 0,
  false_report_flags INTEGER DEFAULT 0,
  credibility_score REAL DEFAULT 1.0,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, SHADOW_THROTTLED, SUSPENDED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grv_reports_ref ON grv_reports(ref_code);
CREATE INDEX IF NOT EXISTS idx_grv_reports_country ON grv_reports(country_id);
CREATE INDEX IF NOT EXISTS idx_grv_reports_status ON grv_reports(status);
CREATE INDEX IF NOT EXISTS idx_grv_clusters_entity ON grv_clusters(entity_name);
`;
