export const NRE_GLOBAL_SCHEMA = `
-- =========================================
-- GLOBAL REGION/COUNTRY FRAMEWORK (NRE)
-- =========================================

CREATE TABLE IF NOT EXISTS nre_regions (
    id                  TEXT PRIMARY KEY,
    region_code         TEXT UNIQUE NOT NULL CHECK (region_code IN ('asia','africa','middle_east','americas','europe')),
    region_name         TEXT NOT NULL,
    reporting_currency  TEXT DEFAULT 'USD',
    is_active           INTEGER DEFAULT 1,
    active_countries_count INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nre_countries (
    id                  TEXT PRIMARY KEY,
    region_id           TEXT NOT NULL,
    country_code        TEXT UNIQUE NOT NULL, -- ISO 3166-1 alpha-2 (e.g. BD, AE, NG, IN, SA, KE, ZA, US)
    country_name        TEXT NOT NULL,
    currency_code       TEXT NOT NULL,        -- BDT, AED, NGN, INR, SAR, KES, ZAR, USD
    languages           TEXT NOT NULL,        -- JSON array of languages ['bn','en']
    primary_language    TEXT NOT NULL,
    timezone            TEXT NOT NULL,
    legal_system        TEXT NOT NULL CHECK (legal_system IN ('common_law','civil_law','sharia_based','mixed')),
    data_residency_required INTEGER DEFAULT 0,
    international_sanctions_list TEXT DEFAULT '[]', -- JSON array
    scanner_legal_gate  TEXT DEFAULT 'standard' CHECK (scanner_legal_gate IN ('standard','strict','government_mou_required','restricted')),
    govt_mou_required   INTEGER DEFAULT 1,
    is_active           INTEGER DEFAULT 1,
    pack_version        TEXT DEFAULT '1.0.0',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES nre_regions(id)
);

CREATE TABLE IF NOT EXISTS nre_regulators (
    id                  TEXT PRIMARY KEY,
    country_id          TEXT NOT NULL,
    regulator_code      TEXT NOT NULL,        -- BTRC, RBI, SAMA, CBUAE, NDPC, SEC
    name                TEXT NOT NULL,
    name_local          TEXT,
    sectors             TEXT NOT NULL,        -- JSON array of sectors ['telecom','finance','data_privacy']
    enforcement_power   TEXT NOT NULL CHECK (enforcement_power IN ('full','advisory','via_court')),
    appeal_body         TEXT,
    portal_config       TEXT DEFAULT '{}',    -- JSON
    is_active           INTEGER DEFAULT 1,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES nre_countries(id)
);

CREATE TABLE IF NOT EXISTS nre_laws (
    id                  TEXT PRIMARY KEY,
    country_id          TEXT NOT NULL,
    law_code            TEXT NOT NULL,        -- 'BTR_ACT_2001', 'DPDP_2023', 'FDPL_DECREE_45_2021'
    law_name            TEXT NOT NULL,
    law_name_local      TEXT,
    regulator_id        TEXT,
    language            TEXT DEFAULT 'en',
    effective_from      TEXT,
    status              TEXT DEFAULT 'active' CHECK (status IN ('draft','active','amended','repealed')),
    version             INTEGER DEFAULT 1,
    supersedes          TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES nre_countries(id),
    FOREIGN KEY (regulator_id) REFERENCES nre_regulators(id)
);

CREATE TABLE IF NOT EXISTS nre_law_rules (
    id                  TEXT PRIMARY KEY,
    law_id              TEXT NOT NULL,
    section_code        TEXT NOT NULL,        -- 'Section 65A', 'Article 13'
    section_text        TEXT NOT NULL,        -- English description/title
    section_text_local  TEXT,                 -- Localized title/text
    violation_types     TEXT NOT NULL,        -- JSON array ['CROSS_BORDER_TRANSFER', 'UNAUTHORIZED_SPECTRUM']
    penalty_type        TEXT NOT NULL CHECK (penalty_type IN ('fixed','range','per_day','percent_revenue','fixed_plus_imprisonment')),
    penalty_min         REAL DEFAULT 0,
    penalty_max         REAL DEFAULT 0,
    penalty_currency    TEXT NOT NULL,
    daily_accrual       REAL DEFAULT 0,
    revenue_percent     REAL DEFAULT 0,
    severity_grade      TEXT NOT NULL CHECK (severity_grade IN ('minor','moderate','major','critical')),
    repeat_offense_rule TEXT DEFAULT '{}',    -- JSON {"multiplier":2,"window_months":24,"lookup_scope":"country"}
    payment_deadline_days INTEGER DEFAULT 30,
    appeal_window_days  INTEGER DEFAULT 15,
    imprisonment_note   TEXT,
    effective_from      TEXT,
    auto_enforceable    INTEGER DEFAULT 1,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (law_id) REFERENCES nre_laws(id)
);

CREATE TABLE IF NOT EXISTS nre_country_packs (
    id                  TEXT PRIMARY KEY,
    country_id          TEXT NOT NULL,
    country_code        TEXT UNIQUE NOT NULL,
    pack_version        TEXT NOT NULL,
    scanner_config      TEXT NOT NULL,        -- JSON {"robots_policy":"strict","crawl_depth":5,"github_enabled":true...}
    notification_channels TEXT NOT NULL,      -- JSON {"email":true,"whatsapp":true,"sms_fallback":true...}
    letter_template_set TEXT DEFAULT '[]',    -- JSON bilingual letter pack
    watchlist_sources   TEXT DEFAULT '[]',    -- JSON ['OFAC_SDN','UN','local_CBI']
    registry_integration TEXT DEFAULT '{}',   -- JSON trade license / TIN verification
    fx_source           TEXT,
    status              TEXT DEFAULT 'active' CHECK (status IN ('draft','pilot','active','suspended')),
    approved_by         TEXT,
    activated_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES nre_countries(id)
);

CREATE TABLE IF NOT EXISTS nre_penalty_fx_log (
    id                  TEXT PRIMARY KEY,
    penalty_id          TEXT NOT NULL,
    local_amount        REAL NOT NULL,
    local_currency      TEXT NOT NULL,
    usd_equivalent      REAL NOT NULL,
    fx_rate             REAL NOT NULL,
    fx_source           TEXT DEFAULT 'CENTRAL_BANK_OFFICIAL_RATE',
    captured_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nre_violations (
    id                  TEXT PRIMARY KEY,
    case_number         TEXT UNIQUE NOT NULL,
    country_id          TEXT NOT NULL,
    regulator_id        TEXT NOT NULL,
    law_rule_id         TEXT,
    language_used       TEXT DEFAULT 'en',
    entity_name         TEXT NOT NULL,
    entity_domain       TEXT,
    violation_details   TEXT NOT NULL,
    raw_evidence_json   TEXT DEFAULT '{}',
    evidence_hash       TEXT NOT NULL,
    xai_rationale       TEXT,
    confidence_score    REAL DEFAULT 0.85,
    status              TEXT DEFAULT 'DETECTED' CHECK (status IN ('DETECTED', 'UNDER_REVIEW', 'APPROVED', 'ISSUED', 'APPEALED', 'DISMISSED_AFTER_PAYMENT')),
    penalty_amount      REAL DEFAULT 0,
    currency            TEXT NOT NULL,
    issued_at           TIMESTAMP,
    paid_at             TIMESTAMP,
    appeal_status       TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES nre_countries(id),
    FOREIGN KEY (regulator_id) REFERENCES nre_regulators(id)
);

CREATE TABLE IF NOT EXISTS nre_scans (
    id                  TEXT PRIMARY KEY,
    country_id          TEXT NOT NULL,
    target_url          TEXT NOT NULL,
    scan_type           TEXT DEFAULT 'ROBOTS_AWARE_WEB',
    legal_basis_ref     TEXT,
    legal_gate_passed   INTEGER DEFAULT 1,
    gate_reason         TEXT,
    findings_count      INTEGER DEFAULT 0,
    status              TEXT DEFAULT 'COMPLETED',
    initiated_by        TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nre_countries_code ON nre_countries(country_code);
CREATE INDEX IF NOT EXISTS idx_nre_regulators_country ON nre_regulators(country_id);
CREATE INDEX IF NOT EXISTS idx_nre_laws_country ON nre_laws(country_id);
CREATE INDEX IF NOT EXISTS idx_nre_violations_case ON nre_violations(case_number);
CREATE INDEX IF NOT EXISTS idx_nre_violations_country ON nre_violations(country_id);
`;
