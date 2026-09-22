export const COMPLIANCE_MARKETPLACE_SCHEMA = `
CREATE TABLE IF NOT EXISTS mkt_professionals (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL, -- LAWYER, AUDITOR, COMPLIANCE_CONSULTANT, TRAINER, CERTIFICATION_BODY, FORENSIC_ACCOUNTANT
  country_id TEXT NOT NULL,
  credentials_json TEXT NOT NULL DEFAULT '{}', -- encrypted refs, bar reg no, license
  verification_status TEXT DEFAULT 'PROVISIONAL', -- APPLIED, VERIFIED, REJECTED, SUSPENDED
  tier TEXT DEFAULT 'PROVISIONAL', -- PROVISIONAL, VERIFIED, ELITE, SUSPENDED
  specialties_json TEXT DEFAULT '[]', -- sector & law-area codes from nre taxonomy
  languages_json TEXT DEFAULT '["en"]',
  capacity_per_week INTEGER DEFAULT 5,
  hourly_rate REAL DEFAULT 150.0,
  currency TEXT DEFAULT 'USD',
  rating_avg REAL DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  verified_outcomes_count INTEGER DEFAULT 0,
  success_rate_pct REAL DEFAULT 100.0,
  badge_zk_ref TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mkt_verification_events (
  id TEXT PRIMARY KEY,
  professional_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- NID_VERIFIED, BAR_COUNCIL_CHECKED, PI_INSURANCE_VERIFIED, BADGE_ISSUED, ANNUAL_RENEWAL
  evidence_ref TEXT,
  verified_by TEXT NOT NULL,
  prev_hash TEXT,
  current_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mkt_packages (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- APPEAL_RESPONSE, REDEMPTION_APP, LICENSE_RENEWAL, PRE_AUDIT_READINESS
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  scope_json TEXT DEFAULT '[]',
  base_price REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  estimated_days INTEGER DEFAULT 7
);

CREATE TABLE IF NOT EXISTS mkt_referrals (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  entity_id TEXT,
  trigger_type TEXT NOT NULL, -- UNFIXABLE_VIOLATION, APPEAL_DEADLINE, REDEMPTION_PREP, LICENSE_RENEWAL, GET_HELP_CLICK
  trigger_ref TEXT,
  need_json TEXT DEFAULT '{}',
  matched_professionals_json TEXT DEFAULT '[]',
  status TEXT DEFAULT 'OFFERED', -- OFFERED, ACCEPTED, EXPIRED, DECLINED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mkt_engagements (
  id TEXT PRIMARY KEY,
  referral_id TEXT,
  professional_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  package_code TEXT,
  scope_json TEXT DEFAULT '{}',
  milestones_json TEXT DEFAULT '[]',
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  commission_pct REAL DEFAULT 18.0, -- 15-20% per country pack
  status TEXT DEFAULT 'ESCROW_FUNDED', -- ESCROW_FUNDED, IN_PROGRESS, MILESTONE_REVIEW, COMPLETED, DISPUTED, CANCELLED
  outcome_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mkt_escrow (
  id TEXT PRIMARY KEY,
  engagement_id TEXT UNIQUE NOT NULL,
  funded_amount REAL NOT NULL,
  released_amount REAL DEFAULT 0,
  held_amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'HELD', -- HELD, PARTIALLY_RELEASED, RELEASED, DISPUTED, REFUNDED
  ledger_refs_json TEXT DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mkt_payouts (
  id TEXT PRIMARY KEY,
  professional_id TEXT NOT NULL,
  engagement_id TEXT NOT NULL,
  gross_amount REAL NOT NULL,
  commission_amount REAL NOT NULL,
  net_payout REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'PAID', -- PENDING, PROCESSING, PAID, FAILED
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mkt_disputes (
  id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL,
  raised_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_json TEXT DEFAULT '{}',
  resolution_json TEXT,
  mediator_id TEXT,
  status TEXT DEFAULT 'OPEN', -- OPEN, UNDER_MEDIATION, RESOLVED
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mkt_prof_country ON mkt_professionals(country_id);
CREATE INDEX IF NOT EXISTS idx_mkt_prof_type ON mkt_professionals(type);
CREATE INDEX IF NOT EXISTS idx_mkt_engagements_tenant ON mkt_engagements(tenant_id);
`;
