
export const RULE_ENGINE_SCHEMA = `
CREATE TABLE IF NOT EXISTS dynamic_rulesets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    industry_vertical TEXT,
    price TEXT,
    price_type TEXT,
    numeric_price_eur INTEGER,
    region TEXT,
    description TEXT,
    law_act_name TEXT,
    legal_citation TEXT,
    jurisdiction TEXT,
    enforcing_authority TEXT,
    statutory_directives TEXT,
    max_statutory_fine TEXT,
    critical_features_json TEXT, -- JSON object
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dynamic_rules (
    id TEXT PRIMARY KEY,
    ruleset_id TEXT NOT NULL,
    rule_code TEXT NOT NULL,
    title TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    category TEXT,
    trigger_type TEXT,
    condition_expression TEXT,
    description TEXT,
    enforcement_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ruleset_id) REFERENCES dynamic_rulesets(id) ON DELETE CASCADE
);
`;
