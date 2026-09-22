export const PARTNER_PLATFORM_SCHEMA = `
CREATE TABLE IF NOT EXISTS prt_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- bank, psp, marketplace, telecom, delivery, ad_platform, insurance, ngo, registry
  country_scope_json TEXT NOT NULL DEFAULT '["BD"]',
  tier TEXT NOT NULL DEFAULT 'basic', -- basic, verified, actuator, strategic
  status TEXT NOT NULL DEFAULT 'sandbox', -- applied, verified, sandbox, active, suspended, terminated
  agreement_refs_json TEXT DEFAULT '[]',
  purpose_declarations_json TEXT DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prt_credentials (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  client_id_hash TEXT UNIQUE NOT NULL,
  client_secret_hash TEXT NOT NULL,
  key_ref TEXT, -- Vault key identifier
  mtls_cert_ref TEXT,
  scopes_json TEXT NOT NULL DEFAULT '["INTEL_STATUS","INTEL_SCORE"]',
  status TEXT DEFAULT 'active', -- active, rotated, revoked
  last_rotated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prt_scope_grants (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  data_class TEXT NOT NULL, -- SIGNAL_FRAUD, SIGNAL_PRODUCT, INTEL_WATCHLIST, INTEL_SCORE, INTEL_STATUS, ACTION_EXECUTE, WEBHOOK_EVENTS
  country_id TEXT NOT NULL,
  direction TEXT NOT NULL, -- send, receive, execute
  limits_json TEXT DEFAULT '{"rate_limit_per_minute": 1000, "monthly_quota": 50000}',
  legal_ref TEXT,
  approved_by TEXT,
  approved_by_2 TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prt_signals (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  entity_id TEXT,
  signal_type TEXT NOT NULL, -- merchant_fraud, chargeback_pattern, illegal_product, fake_reviews, phishing_hosting, scam_comms, other
  raw_payload_json TEXT NOT NULL,
  normalized_json TEXT NOT NULL,
  evidence_ref TEXT,
  triage_json TEXT DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'received', -- received, triaged, linked, merged, dismissed, under_review
  linked_violation_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prt_contribution_stats (
  id TEXT PRIMARY KEY,
  partner_id TEXT UNIQUE NOT NULL,
  period TEXT NOT NULL, -- e.g. 2026-09
  signals_sent INTEGER DEFAULT 0,
  confirmed_count INTEGER DEFAULT 0,
  confirmed_pct REAL DEFAULT 0.0,
  quality_score REAL DEFAULT 1.0,
  reciprocity_tier TEXT DEFAULT 'basic',
  tier_impact_json TEXT DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prt_webhook_endpoints (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  url TEXT NOT NULL,
  event_types_json TEXT NOT NULL DEFAULT '["entity.status_changed","entity.watchlist_added","entity.redeemed"]',
  secret_hash TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  failure_count INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prt_webhook_deliveries (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  endpoint_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  signature TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DELIVERED', -- PENDING, DELIVERED, RETRYING, FAILED
  attempts INTEGER DEFAULT 1,
  http_status INTEGER DEFAULT 200,
  response_snippet TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prt_credentials_client ON prt_credentials(client_id_hash);
CREATE INDEX IF NOT EXISTS idx_prt_signals_partner ON prt_signals(partner_id);
CREATE INDEX IF NOT EXISTS idx_prt_signals_status ON prt_signals(status);
CREATE INDEX IF NOT EXISTS idx_prt_scope_partner ON prt_scope_grants(partner_id);
`;
