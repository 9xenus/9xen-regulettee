// Database Schema for RegTech SaaS Platform (Modules 1, 2, 3, 4 + Billing & Integration)
export const REGTECH_SAAS_SCHEMA = `
  -- Organizations & Multi-tenancy
  CREATE TABLE IF NOT EXISTS regtech_organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'pro', -- 'free', 'pro', 'enterprise'
    api_key_hash TEXT UNIQUE NOT NULL,
    raw_api_key_prefix TEXT NOT NULL,
    stripe_cust_id TEXT,
    industry_type TEXT DEFAULT 'FINTECH', -- Comma-separated industries (e.g. 'FINTECH,BANKING')
    yearly_revenue TEXT,
    employee_count TEXT,
    management_board TEXT, -- JSON array
    global_presence TEXT, -- JSON array
    country_code TEXT DEFAULT 'EU',
    website_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Users inside organizations
  CREATE TABLE IF NOT EXISTS regtech_users (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'auditor'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- MODULE 1: Guardrail Rules (Post-LLM & Runtime)
  CREATE TABLE IF NOT EXISTS regtech_guardrail_rules (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- 'schema', 'regex', 'fact_check', 'confidence_threshold', 'pii_filter'
    config TEXT NOT NULL, -- JSON config
    fallback_action TEXT DEFAULT 'retry', -- 'retry', 'safe_default', 'human_review'
    fallback_payload TEXT, -- default text or template
    confidence_min REAL DEFAULT 0.85,
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- MODULE 1: Request Logs
  CREATE TABLE IF NOT EXISTS regtech_request_logs (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    input_prompt TEXT NOT NULL,
    llm_output TEXT NOT NULL,
    verdict TEXT NOT NULL, -- 'PASSED', 'FLAGGED', 'FALLBACK', 'CACHE_HIT', 'RULE_ANSWERED', 'REJECTED'
    flag_reasons TEXT, -- JSON array of reasons
    confidence_score REAL,
    latency_ms INTEGER NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    model_used TEXT DEFAULT 'gpt-4o',
    target_region TEXT DEFAULT 'eu-central-1',
    llm_call_avoided INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- Usage & Billing Records
  CREATE TABLE IF NOT EXISTS regtech_usage_records (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    period TEXT NOT NULL, -- '2026-08'
    tokens_used INTEGER NOT NULL DEFAULT 0,
    request_count INTEGER NOT NULL DEFAULT 0,
    cost REAL NOT NULL DEFAULT 0,
    llm_calls_avoided INTEGER NOT NULL DEFAULT 0,
    cost_saved_usd REAL NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE,
    UNIQUE(org_id, period)
  );

  -- MODULE 2: Edge Cache Entries (Exact hash & semantic approximation)
  CREATE TABLE IF NOT EXISTS regtech_cache_entries (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    prompt_hash TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    metadata TEXT, -- JSON
    hit_count INTEGER NOT NULL DEFAULT 0,
    ttl_expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- MODULE 2: Static FAQ & Direct Rule Answers
  CREATE TABLE IF NOT EXISTS regtech_static_rules (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- 'exact_phrase', 'regex', 'intent_match', 'keyword'
    trigger_value TEXT NOT NULL,
    static_answer TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- MODULE 2: Pre-Validation Rules
  CREATE TABLE IF NOT EXISTS regtech_prevalidation_rules (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- 'schema', 'blocklist_regex', 'pii_scrub', 'max_length'
    config TEXT NOT NULL, -- JSON config
    rejection_message TEXT DEFAULT 'Request rejected by pre-validation security rule.',
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- MODULE 3: Sovereign Data Residency Policies
  CREATE TABLE IF NOT EXISTS regtech_residency_policies (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    data_category TEXT NOT NULL, -- 'pii', 'financial', 'health', 'government', 'default'
    allowed_region TEXT NOT NULL, -- 'bd-local', 'eu-central-1', 'ap-south-1', 'us-east-1'
    enforcement TEXT NOT NULL DEFAULT 'strict', -- 'strict' (block if unavailable) | 'soft' (warn only)
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- MODULE 3: Regional Inference Endpoints & Sandboxes
  CREATE TABLE IF NOT EXISTS regtech_regional_endpoints (
    id TEXT PRIMARY KEY,
    region TEXT UNIQUE NOT NULL, -- 'bd-local', 'eu-central-1', 'ap-south-1', 'us-east-1'
    name TEXT NOT NULL,
    endpoint_type TEXT NOT NULL, -- 'managed' | 'client_sandbox'
    endpoint_url TEXT NOT NULL,
    latency_ms INTEGER DEFAULT 18,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'degraded', 'offline'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- MODULE 3: Sovereign Residency Tamper-Evident Audit Log (Hash-Chained)
  CREATE TABLE IF NOT EXISTS regtech_residency_audit_logs (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    request_id TEXT NOT NULL,
    data_classification TEXT NOT NULL, -- JSON { contains_pii, contains_financial, ... }
    target_region TEXT NOT NULL,
    compliance_basis TEXT NOT NULL,
    hash_chain TEXT NOT NULL, -- SHA-256(prev_entry + this_entry)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- MODULE 4: Compliance Checklist Items (Standard generic + specialized regulations)
  CREATE TABLE IF NOT EXISTS regtech_compliance_checklists (
    id TEXT PRIMARY KEY,
    regulation TEXT NOT NULL, -- 'EU_AI_ACT', 'GDPR', 'HIPAA', 'GENERIC_SEC', 'Global Region_BANK'
    category TEXT NOT NULL, -- 'data_security', 'privacy', 'legal_risk', 'model_behavior'
    requirement TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'HIGH', -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    active INTEGER NOT NULL DEFAULT 1
  );

  -- MODULE 4: AI Safety & Compliance Audit Reports
  CREATE TABLE IF NOT EXISTS regtech_audit_reports (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    audit_period_start DATETIME NOT NULL,
    audit_period_end DATETIME NOT NULL,
    compliance_score INTEGER NOT NULL, -- 0 to 100
    status TEXT NOT NULL, -- 'PASSED', 'PASSED_WITH_WARNINGS', 'FAILED'
    findings TEXT NOT NULL, -- JSON array of { id, severity, category, description, remediation, evidence }
    recommendations TEXT, -- JSON array of actionable suggestions
    report_pdf_url TEXT,
    report_hash TEXT NOT NULL, -- SHA-256 tamper-evident digital certificate signature
    generated_by TEXT DEFAULT 'AUTOMATED_AUDIT_ENGINE_V4',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- MODULE 4: Periodic Audit Schedules
  CREATE TABLE IF NOT EXISTS regtech_audit_schedules (
    id TEXT PRIMARY KEY,
    org_id TEXT UNIQUE NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly'
    active INTEGER NOT NULL DEFAULT 1,
    next_run_at DATETIME NOT NULL,
    last_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- Plans & Subscriptions Gating
  CREATE TABLE IF NOT EXISTS regtech_plans (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL, -- 'free', 'pro', 'enterprise'
    entitlements TEXT NOT NULL, -- JSON { module1: "full", module2: "full", module3: true, module4: "scheduled", websocket: true }
    rate_limit_per_day INTEGER NOT NULL,
    price_monthly REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS regtech_subscriptions (
    id TEXT PRIMARY KEY,
    org_id TEXT UNIQUE NOT NULL,
    plan_id TEXT NOT NULL,
    stripe_sub_id TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled'
    current_period_end DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES regtech_plans(id)
  );

  -- Webhook Configuration for Async Event Delivery
  CREATE TABLE IF NOT EXISTS regtech_webhook_configs (
    id TEXT PRIMARY KEY,
    org_id TEXT UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    secret TEXT NOT NULL,
    event_types TEXT NOT NULL, -- JSON array ["audit.report.ready", "residency.violation", "guardrail.flag_spike"]
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- Persistent Software Integrations
  CREATE TABLE IF NOT EXISTS regtech_integrations (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'CRM', 'ERP', 'Cloud', 'Healthcare', 'Logistics', 'GovTech', 'AI_Tech'
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONNECTED', -- 'CONNECTED', 'DISCONNECTED', 'ERROR'
    settings TEXT, -- JSON config
    last_scanned_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES regtech_organizations(id) ON DELETE CASCADE
  );

  -- Persistent Scan Logs
  CREATE TABLE IF NOT EXISTS regtech_integration_scans (
    id TEXT PRIMARY KEY,
    integration_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    violations TEXT, -- JSON array
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (integration_id) REFERENCES regtech_integrations(id) ON DELETE CASCADE
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_regtech_req_logs_org ON regtech_request_logs(org_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_regtech_cache_hash ON regtech_cache_entries(org_id, prompt_hash);
  CREATE INDEX IF NOT EXISTS idx_regtech_res_logs ON regtech_residency_audit_logs(org_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_regtech_audit_reports ON regtech_audit_reports(org_id, created_at);
`;
