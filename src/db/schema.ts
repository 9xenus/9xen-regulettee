/**
 * LEXSHIELD SOVEREIGN COMPLIANCE ENGINE
 * SQLite Database Schema Definitions
 */

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS free_scans (
    ip_address TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    compliance_score INTEGER,
    summary TEXT,
    violations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration_scans (
    id TEXT PRIMARY KEY,
    integration_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    score INTEGER,
    violations_count INTEGER,
    details TEXT,
    summary TEXT,
    findings TEXT, -- JSON
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (integration_id) REFERENCES client_integrations(id)
);

CREATE TABLE IF NOT EXISTS scan_results (
    scan_id TEXT PRIMARY KEY,
    user_id TEXT,
    region TEXT,
    industry TEXT,
    compliance_profile TEXT,
    risk_score INTEGER,
    decision_status TEXT,
    reason_codes TEXT,
    flags TEXT,
    required_actions TEXT,
    provider_metadata TEXT,
    audit_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    platform TEXT,
    status TEXT,
    settings TEXT,
    last_scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    client_system TEXT,
    scope TEXT,
    status TEXT DEFAULT 'ACTIVE',
    custom_services TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

-- 1. Core Platform & Identity
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization_metadata TEXT, -- JSON
    appearance_metadata TEXT, -- JSON
    compliance_config TEXT, -- JSON
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT UNIQUE NOT NULL,
    organization_metadata TEXT, -- JSON
    appearance_metadata TEXT, -- JSON
    compliance_config TEXT, -- JSON
    admin_roles TEXT, -- JSON
    security_config TEXT, -- JSON
    integrations TEXT, -- JSON
    notifications TEXT, -- JSON
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    config_type TEXT NOT NULL, -- 'compliance', 'security', 'organization', etc.
    config_data TEXT NOT NULL, -- JSON
    changed_by TEXT,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delegated_access (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    scopes TEXT NOT NULL, -- JSON array
    expires_at TIMESTAMP NOT NULL,
    granted_by TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_rules (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    logic_blocks TEXT NOT NULL, -- JSON
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_ratings (
    id TEXT PRIMARY KEY,
    tenant_id TEXT UNIQUE NOT NULL,
    current_score INTEGER DEFAULT 100,
    current_grade TEXT DEFAULT 'A',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dashboard_checklist (
    tenant_id TEXT NOT NULL,
    id INTEGER NOT NULL,
    label TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    PRIMARY KEY (tenant_id, id)
);

-- 2. Region & Industry Frameworks
CREATE TABLE IF NOT EXISTS operating_regions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operating_countries (
    id TEXT PRIMARY KEY,
    region_id TEXT NOT NULL,
    country_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (region_id) REFERENCES operating_regions(id)
);

CREATE TABLE IF NOT EXISTS country_laws (
    id TEXT PRIMARY KEY,
    country_code TEXT NOT NULL,
    law_name TEXT NOT NULL,
    law_code TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (country_code) REFERENCES operating_countries(country_code)
);

CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    data_residency_rules TEXT -- JSON
);

CREATE TABLE IF NOT EXISTS industries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compliance_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_type TEXT NOT NULL UNIQUE,
    region_id INTEGER,
    industry_id INTEGER,
    mandatory_checks TEXT, -- JSON
    risk_thresholds TEXT, -- JSON
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (industry_id) REFERENCES industries(id)
);

-- 3. Audit & System Logs
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    framework_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    details TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id)
);

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    scan_id TEXT,
    action TEXT NOT NULL,
    input_data TEXT, -- JSON
    output_data TEXT, -- JSON
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Whistleblower & Ethics Channel
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    framework_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    details TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON compliance_audit_logs(tenant_id);

-- Lawyer workspace audit trail & SLA metrics (persisted)
CREATE TABLE IF NOT EXISTS lawyer_audit_trail (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    client TEXT,
    jurisdiction TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lawyer_sla_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_key TEXT NOT NULL,
    metric_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lawyer / Consultant partner roster (managed via LawyerConsultantManager)
CREATE TABLE IF NOT EXISTS lawyer_professionals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    professional_type TEXT DEFAULT 'lawyer',
    firm TEXT,
    jurisdiction TEXT,
    specialization TEXT,
    bar_license TEXT,
    licensing_authority TEXT,
    years_of_practice INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Encrypted legal consultation rooms (managed via ConsultationManager)
CREATE TABLE IF NOT EXISTS lawyer_consultations (
    id TEXT PRIMARY KEY,
    tenant_name TEXT NOT NULL,
    attorney_id TEXT,
    attorney_name TEXT,
    topic TEXT,
    scheduled_at TEXT,
    status TEXT DEFAULT 'PENDING',
    room_ref TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legal directives & mandates dispatched to clients
CREATE TABLE IF NOT EXISTS lawyer_directives (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT,
    title TEXT NOT NULL,
    directive_type TEXT DEFAULT 'COUNSEL_DIRECTIVE',
    jurisdiction TEXT,
    status TEXT DEFAULT 'ISSUED',
    assignee TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formal legal opinion letters
CREATE TABLE IF NOT EXISTS lawyer_opinion_letters (
    id TEXT PRIMARY KEY,
    reference TEXT,
    client_name TEXT,
    jurisdiction TEXT,
    regulation_scope TEXT,
    issue_summary TEXT,
    content TEXT,
    status TEXT DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billable invoices issued to legal clients
CREATE TABLE IF NOT EXISTS lawyer_invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT,
    client_name TEXT,
    matter TEXT,
    amount REAL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'DRAFT',
    due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Whistleblower & Ethics Channel
CREATE TABLE IF NOT EXISTS whistleblower_reports (
    id TEXT PRIMARY KEY,
    report_ref TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    anonymous_key TEXT NOT NULL,
    tenant_id TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS whistleblower_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES whistleblower_reports(id) ON DELETE CASCADE
);

-- Client Premium: realtime compliance pulse event bus
CREATE TABLE IF NOT EXISTS compliance_pulse_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    title TEXT,
    message TEXT,
    severity TEXT DEFAULT 'INFO',
    source TEXT DEFAULT 'platform',
    payload_json TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Rule Audit Pipeline: scan -> detect -> root-cause -> loss -> HITL remediation -> audit report
CREATE TABLE IF NOT EXISTS compliance_audit_runs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT 'FULL_SCOPE',
    facts_json TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'DETECTING',
    total_findings INTEGER DEFAULT 0,
    total_loss_eur INTEGER DEFAULT 0,
    report_hash TEXT,
    report_content TEXT,
    remediations_applied INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_audit_findings (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    rule_code TEXT NOT NULL,
    rule_title TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM',
    risk_level TEXT DEFAULT 'MODERATE',
    root_cause TEXT NOT NULL DEFAULT '',
    possible_loss_eur INTEGER DEFAULT 0,
    suggested_fix TEXT NOT NULL DEFAULT '',
    hitl_status TEXT NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client Premium: quantum forensic evidence seals (hash-chain + QR)
CREATE TABLE IF NOT EXISTS client_forensic_seals (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    document_name TEXT,
    document_hash TEXT NOT NULL,
    chain_ref TEXT NOT NULL,
    seal_qr TEXT,
    anchor_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'SEALED',
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client Premium: TOTP identity attestation devices
CREATE TABLE IF NOT EXISTS client_identity_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    alias TEXT,
    secret_base32 TEXT NOT NULL,
    provisioning_qr TEXT,
    status TEXT DEFAULT 'PENDING',
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_schedules (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    day_of_month INTEGER NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    last_run_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_runs (
    id TEXT PRIMARY KEY,
    schedule_id TEXT NOT NULL,
    url TEXT NOT NULL,
    run_date TEXT NOT NULL,
    compliance_score INTEGER,
    risk_score INTEGER,
    trackers_found INTEGER,
    status TEXT NOT NULL,
    resolved_issues_count INTEGER DEFAULT 0,
    FOREIGN KEY (schedule_id) REFERENCES recurring_schedules(id) ON DELETE CASCADE
);

-- SaaS Super Admin: AI copilot usage ledger (spend + metering per tenant)
CREATE TABLE IF NOT EXISTS saas_ai_usage_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT,
    query TEXT,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    est_cost_usd REAL DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ok',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant ON saas_ai_usage_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON saas_ai_usage_ledger(created_at);

-- SaaS Super Admin: webhook/delivery event telemetry
CREATE TABLE IF NOT EXISTS saas_delivery_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    event_type TEXT,
    payload_summary TEXT,
    status TEXT NOT NULL,
    attempt INTEGER DEFAULT 1,
    latency_ms INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_delivery_log_created ON saas_delivery_log(created_at);
CREATE INDEX IF NOT EXISTS idx_delivery_log_status ON saas_delivery_log(status);

-- 5. Regulatory & Law Tracking
CREATE TABLE IF NOT EXISTS legal_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    law TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    change_type TEXT NOT NULL,
    details TEXT,
    source_url TEXT,
    is_synced BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rag_configs (
    region_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cron_schedule TEXT NOT NULL,
    source_endpoint TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rag_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    details TEXT, -- JSON
    region_id TEXT,
    FOREIGN KEY (region_id) REFERENCES rag_configs(region_id)
);

-- 6. Sanctions & Compliance Screening
CREATE TABLE IF NOT EXISTS sanctions_watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    country TEXT NOT NULL,
    risk_score TEXT NOT NULL,
    citation TEXT,
    associated_orgs TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Companies & Violations
CREATE TABLE IF NOT EXISTS governments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    dpa_authority_id TEXT,
    treasury_api_credentials TEXT, -- JSON
    wallet_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS companies_extended (
    id INTEGER PRIMARY KEY,
    legal_name TEXT NOT NULL,
    trading_name TEXT,
    eic_code TEXT,
    country_code TEXT,
    global_revenue DECIMAL(18,2),
    website_url TEXT,
    blockchain_address TEXT,
    compliance_score DECIMAL(5,2),
    risk_level TEXT,
    ai_verification_status TEXT,
    FOREIGN KEY (id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS violations_extended (
    id INTEGER PRIMARY KEY,
    company_id INTEGER,
    government_id INTEGER,
    violation_type TEXT NOT NULL,
    description TEXT NOT NULL,
    personal_data_detected TEXT, -- JSON
    severity TEXT,
    ai_confidence_score DECIMAL(5,2),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (government_id) REFERENCES governments(id)
);

-- 8. Fines & Payments
CREATE TABLE IF NOT EXISTS fines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    violation_id INTEGER,
    company_id INTEGER,
    government_id INTEGER,
    fine_amount DECIMAL(18,2) NOT NULL,
    fine_type TEXT,
    revenue_percentage DECIMAL(5,2),
    max_fine_euros DECIMAL(18,2),
    currency TEXT DEFAULT 'EUR',
    smart_contract_address TEXT,
    payment_status TEXT,
    due_date TIMESTAMP NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    installment_plan_id INTEGER,
    disputed_until TIMESTAMP,
    FOREIGN KEY (violation_id) REFERENCES violations_extended(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (government_id) REFERENCES governments(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fine_id INTEGER,
    amount DECIMAL(18,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    payment_method TEXT,
    transaction_hash TEXT,
    payment_gateway_response TEXT, -- JSON
    status TEXT,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blockchain_confirmed BOOLEAN DEFAULT 0,
    FOREIGN KEY (fine_id) REFERENCES fines(id)
);

-- 9. Software & Infrastructure Compliance
CREATE TABLE IF NOT EXISTS open_source_libraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    version TEXT NOT NULL,
    license TEXT NOT NULL,
    license_status TEXT NOT NULL,
    security_score INTEGER NOT NULL,
    cve_count INTEGER NOT NULL DEFAULT 0,
    cra_compliant BOOLEAN NOT NULL DEFAULT 1,
    nis2_approved BOOLEAN NOT NULL DEFAULT 1,
    gdpr_validated BOOLEAN NOT NULL DEFAULT 1,
    source_url TEXT,
    last_scanned TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS open_source_violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    library_name TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    remediation TEXT NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (library_name) REFERENCES open_source_libraries(name) ON DELETE CASCADE
);

-- 10. OPA & Policy Orchestration
CREATE TABLE IF NOT EXISTS opa_policies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    effect TEXT NOT NULL,
    rules TEXT NOT NULL, -- JSON
    rego_code TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opa_policy_history (
    id TEXT PRIMARY KEY,
    policy_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    effect TEXT NOT NULL,
    rules TEXT NOT NULL,
    rego_code TEXT NOT NULL,
    change_summary TEXT NOT NULL,
    approved_by TEXT NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES opa_policies(id) ON DELETE CASCADE
);

-- 11. DPO & Human Resources Compliance
CREATE TABLE IF NOT EXISTS dpo_certifications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    cert_body TEXT,
    cert_name TEXT,
    cert_number TEXT,
    issue_date TEXT,
    expiry_date TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS dpo_documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    doc_type TEXT,
    uploaded_at TEXT,
    status TEXT,
    verification_log TEXT,
    file_size INTEGER
);

CREATE TABLE IF NOT EXISTS dpo_training_records (
    id TEXT PRIMARY KEY,
    dpo_id TEXT NOT NULL,
    course_name TEXT,
    cpe_hours INTEGER,
    completed_at TEXT,
    status TEXT,
    FOREIGN KEY (dpo_id) REFERENCES dpo_certifications(id) ON DELETE CASCADE
);

-- 12. Task Management
CREATE TABLE IF NOT EXISTS remediation_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    assigned_to TEXT,
    due_date TEXT,
    description TEXT,
    regulator_notes TEXT,
    tenant_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 13. System State & Analytics
CREATE TABLE IF NOT EXISTS system_settings_extended (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT, -- JSON
    category TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soc2_settings (
    tenant_id TEXT PRIMARY KEY,
    config TEXT, -- JSON
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backup_history (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL, -- SUCCESS, FAILED, INTERRUPTED
    file_path TEXT,
    encryption_status TEXT, -- AES-256-GCM, NONE
    integrity_score DECIMAL(5,2),
    details TEXT, -- JSON
    is_automated BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS module_dwell_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    user_id TEXT,
    dwell_time_seconds INTEGER NOT NULL,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    version TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    UNIQUE(code, version)
);

CREATE TABLE IF NOT EXISTS tenant_framework_activations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    framework_id INTEGER NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    config TEXT DEFAULT '{}',
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- CaaS Addon Registry Table
CREATE TABLE IF NOT EXISTS caas_addons (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    act_id TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    score INTEGER DEFAULT 85,
    color_class TEXT,
    icon TEXT,
    is_active_globally BOOLEAN DEFAULT 1,
    endpoint_url TEXT,
    api_key TEXT,
    is_staging INTEGER DEFAULT 0,
    package_details TEXT, -- JSON details about subscription packages
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant-specific CaaS Addon Subscriptions
CREATE TABLE IF NOT EXISTS tenant_caas_addons (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    addon_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'active', 'inactive', 'trial'
    api_key TEXT,
    trial_expires_at TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (addon_id) REFERENCES caas_addons(id) ON DELETE CASCADE
);

-- 14. Enforcement Cascade
CREATE TABLE IF NOT EXISTS enforcement_level_templates (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    default_mode TEXT DEFAULT 'manual',
    technical_action TEXT NOT NULL,
    legal_basis_fields TEXT, -- JSON
    trigger_fields TEXT, -- JSON
    approval_fields TEXT, -- JSON
    audit_fields TEXT, -- JSON
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pressure_node_templates (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    trigger_fields TEXT, -- JSON
    channels TEXT, -- JSON
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jurisdiction_profiles (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    country_code TEXT NOT NULL,
    regulation_code TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    parent_version_id TEXT,
    published_at TIMESTAMP,
    created_by_id TEXT NOT NULL,
    updated_by_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS jurisdiction_level_settings (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    level_template_id TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 0,
    execution_mode TEXT DEFAULT 'manual',
    legal_basis TEXT, -- JSON
    trigger_conditions TEXT, -- JSON
    scope_limits TEXT, -- JSON
    approval_policy TEXT, -- JSON
    escalation_rules TEXT, -- JSON
    emergency_stop BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES jurisdiction_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (level_template_id) REFERENCES enforcement_level_templates(id),
    UNIQUE(profile_id, level_template_id)
);

CREATE TABLE IF NOT EXISTS jurisdiction_pressure_settings (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    pressure_template_id TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 0,
    trigger_levels TEXT, -- JSON
    extra_conditions TEXT, -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES jurisdiction_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (pressure_template_id) REFERENCES pressure_node_templates(id),
    UNIQUE(profile_id, pressure_template_id)
);

CREATE TABLE IF NOT EXISTS approval_requests (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    requested_by_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP,
    decision_reason TEXT,
    version_snapshot TEXT, -- JSON
    FOREIGN KEY (profile_id) REFERENCES jurisdiction_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quantum_policy_laws (
    id TEXT PRIMARY KEY,
    celex_number TEXT UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    publication_date TEXT,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS quantum_scan_reports (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    violations_found INTEGER,
    penalties_estimated TEXT,
    auto_fixed BOOLEAN,
    report_data TEXT -- JSON
);

CREATE TABLE IF NOT EXISTS execution_events (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    level_key TEXT NOT NULL,
    mode TEXT NOT NULL,
    status TEXT NOT NULL,
    case_ref TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payload TEXT, -- JSON
    FOREIGN KEY (profile_id) REFERENCES jurisdiction_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS compliance_query_cache (
    cache_key TEXT PRIMARY KEY,
    query_normalized TEXT NOT NULL,
    query_type TEXT NOT NULL,
    category TEXT DEFAULT 'GENERAL',
    parameters_hash TEXT,
    response_data TEXT NOT NULL,
    tokens_saved INTEGER DEFAULT 0,
    hit_count INTEGER DEFAULT 1,
    latency_saved_ms INTEGER DEFAULT 1500,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_cache_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_queries INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    total_tokens_saved INTEGER DEFAULT 0,
    total_latency_saved_ms INTEGER DEFAULT 0,
    estimated_cost_saved_eur REAL DEFAULT 0.0
);
`;

export const INDEXES = `
CREATE INDEX IF NOT EXISTS idx_rag_logs_region ON rag_logs(region_id);
CREATE INDEX IF NOT EXISTS idx_rag_logs_timestamp ON rag_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_fines_payment_status ON fines(payment_status);
CREATE INDEX IF NOT EXISTS idx_fines_company ON fines(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_fine ON payments(fine_id);
CREATE INDEX IF NOT EXISTS idx_violations_company ON violations_extended(company_id);
CREATE INDEX IF NOT EXISTS idx_tenant_activations ON tenant_framework_activations(tenant_id, framework_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON compliance_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_whistleblower_tenant ON whistleblower_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cache_category ON compliance_query_cache(category);
CREATE INDEX IF NOT EXISTS idx_cache_hit_count ON compliance_query_cache(hit_count);
`;

// B2G Advanced Features Schema
export const B2G_SCHEMA = `
CREATE TABLE IF NOT EXISTS sandbox_preclearance_requests (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    proposed_activity_description TEXT NOT NULL,
    data_categories_involved TEXT, -- JSON
    novel_technology_used TEXT,
    jurisdiction_country TEXT NOT NULL,
    reviewing_regulator_id TEXT,
    status TEXT DEFAULT 'submitted', -- 'submitted','under_review','conditionally_approved','approved','rejected'
    conditions_imposed TEXT,
    valid_until DATE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enforcement_actions (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    issuing_regulator_id TEXT,
    action_type TEXT, -- 'warning','fine','license_suspension','license_revocation','corrective_order'
    fine_amount_cents INTEGER,
    fine_currency TEXT,
    violation_description TEXT,
    linked_inquiry_id TEXT,
    appeal_status TEXT, -- 'none','under_appeal','upheld','overturned'
    is_publicly_disclosed BOOLEAN DEFAULT 0,
    issued_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (linked_inquiry_id) REFERENCES regulatory_inquiries(id)
);

CREATE TABLE IF NOT EXISTS regulatory_updates (
    id TEXT PRIMARY KEY,
    jurisdiction_country TEXT NOT NULL,
    regulation_name TEXT,
    update_type TEXT, -- 'new_law','amendment','guidance_note','enforcement_priority_shift'
    summary TEXT,
    full_text_url TEXT,
    affected_industries TEXT, -- JSON
    effective_date DATE,
    published_by_regulator_id TEXT,
    source TEXT DEFAULT 'regulator_submitted', -- 'regulator_submitted','platform_monitored'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regulatory_update_acknowledgements (
    id TEXT PRIMARY KEY,
    regulatory_update_id TEXT,
    organization_id TEXT,
    acknowledged_by TEXT,
    action_plan_notes TEXT,
    acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regulatory_update_id) REFERENCES regulatory_updates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inter_agency_data_requests (
    id TEXT PRIMARY KEY,
    requesting_regulator_id TEXT,
    requesting_jurisdiction TEXT,
    target_jurisdiction TEXT,
    target_organization_id TEXT,
    legal_basis TEXT,
    request_description TEXT,
    status TEXT DEFAULT 'pending_platform_review', -- 'pending_platform_review','pending_target_regulator_consent','approved','denied'
    target_regulator_consent_id TEXT,
    platform_legal_review_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processing_activity_records (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    activity_name TEXT,
    purpose_of_processing TEXT,
    data_categories TEXT, -- JSON
    data_subject_categories TEXT, -- JSON
    legal_basis TEXT,
    recipients TEXT, -- JSON
    international_transfers BOOLEAN DEFAULT 0,
    transfer_safeguards TEXT,
    retention_period TEXT,
    security_measures_summary TEXT,
    last_reviewed_at TIMESTAMP,
    is_current BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jurisdiction_risk_summary (
    id TEXT PRIMARY KEY,
    jurisdiction_country TEXT,
    industry_type TEXT,
    total_organizations INTEGER,
    avg_risk_score REAL,
    organizations_with_critical_findings INTEGER,
    organizations_with_overdue_dsar INTEGER,
    breach_incidents_last_90_days INTEGER,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cross_jurisdiction_benchmarks (
    id TEXT PRIMARY KEY,
    jurisdiction_country TEXT,
    industry_type TEXT,
    metric_type TEXT,
    metric_value REAL,
    percentile_vs_global REAL,
    calculation_period DATE,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public_consultations (
    id TEXT PRIMARY KEY,
    published_by_regulator_id TEXT,
    jurisdiction_country TEXT,
    title TEXT,
    draft_document_url TEXT,
    consultation_opens_at DATE,
    consultation_closes_at DATE,
    status TEXT DEFAULT 'open',
    final_outcome_summary TEXT
);

CREATE TABLE IF NOT EXISTS consultation_submissions (
    id TEXT PRIMARY KEY,
    consultation_id TEXT,
    organization_id TEXT,
    submitted_by TEXT,
    submission_text TEXT,
    requests_confidentiality BOOLEAN DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES public_consultations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS business_licenses (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    issuing_regulator_id TEXT,
    license_type TEXT,
    license_number TEXT UNIQUE,
    status TEXT,
    issued_date DATE,
    expires_date DATE,
    renewal_reminder_sent BOOLEAN DEFAULT 0,
    conditions TEXT
);

CREATE TABLE IF NOT EXISTS regulator_performance_metrics (
    id TEXT PRIMARY KEY,
    regulator_user_id TEXT,
    period_month DATE,
    inquiries_received INTEGER,
    inquiries_resolved INTEGER,
    avg_resolution_days REAL,
    sla_met_percentage REAL,
    filings_acknowledged INTEGER,
    avg_filing_acknowledgement_hours REAL
);

CREATE TABLE IF NOT EXISTS mutual_recognition_agreements (
    id TEXT PRIMARY KEY,
    recognizing_jurisdiction TEXT,
    recognized_jurisdiction TEXT,
    recognized_certification_type TEXT,
    scope_limitations TEXT,
    effective_date DATE,
    status TEXT,
    established_by_regulator_id TEXT
);

CREATE TABLE IF NOT EXISTS fraud_signals (
    id TEXT PRIMARY KEY,
    entity_type TEXT,
    entity_id TEXT,
    signal_type TEXT,
    confidence_score REAL,
    auto_action_taken TEXT,
    reviewed_by TEXT,
    review_outcome TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_detection_rules (
    id TEXT PRIMARY KEY,
    rule_name TEXT,
    signal_type TEXT,
    threshold_config TEXT,
    auto_action TEXT,
    is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS b2g_file_parsers (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    filename TEXT NOT NULL,
    file_format TEXT NOT NULL,
    jurisdiction TEXT,
    parsed_data_json TEXT,
    validation_status TEXT DEFAULT 'PASSED',
    validation_errors_json TEXT,
    tax_or_fine_amount REAL DEFAULT 0,
    parsed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_procurement_qualifications (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    system_name TEXT NOT NULL,
    target_framework TEXT NOT NULL,
    score_percentage REAL DEFAULT 0,
    status TEXT DEFAULT 'QUALIFIED',
    gap_analysis_json TEXT,
    certificate_seal_hash TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATE
);

CREATE TABLE IF NOT EXISTS b2g_central_bank_clearing (
    id TEXT PRIMARY KEY,
    invoice_id TEXT,
    clearing_rail TEXT NOT NULL,
    origin_iban TEXT,
    beneficiary_iban TEXT,
    amount_cents INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    settlement_status TEXT DEFAULT 'INITIATED',
    swift_pacs_message TEXT,
    transaction_reference TEXT UNIQUE,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_judicial_evidence_containers (
    id TEXT PRIMARY KEY,
    filing_id TEXT,
    case_title TEXT NOT NULL,
    merkle_root_sha256 TEXT NOT NULL,
    tsa_timestamp_token TEXT,
    tsa_signature_asn1 TEXT,
    authority_name TEXT,
    verification_status TEXT DEFAULT 'VERIFIED',
    container_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_oss_cross_border_cases (
    id TEXT PRIMARY KEY,
    case_number TEXT UNIQUE NOT NULL,
    lead_authority_id TEXT NOT NULL,
    lead_jurisdiction TEXT NOT NULL,
    concerned_authorities_json TEXT,
    target_organization_id TEXT,
    article_basis TEXT DEFAULT 'GDPR_ART_60',
    current_stage TEXT DEFAULT 'LEAD_DESIGNATION',
    dispute_mechanism_triggered BOOLEAN DEFAULT 0,
    final_binding_decision_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_nis2_incident_dispatches (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    csirt_agency TEXT NOT NULL,
    incident_stage TEXT NOT NULL,
    ioc_summary TEXT,
    severity_level TEXT DEFAULT 'HIGH',
    cross_border_impact BOOLEAN DEFAULT 0,
    dispatch_status TEXT DEFAULT 'DISPATCHED',
    sla_deadline TIMESTAMP,
    receipt_signature_sha256 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_sovereign_subpoenas_legal_holds (
    id TEXT PRIMARY KEY,
    warrant_reference TEXT UNIQUE NOT NULL,
    court_jurisdiction TEXT NOT NULL,
    issuing_judge_or_magistrate TEXT NOT NULL,
    target_entity_or_subject TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    data_scope_requested TEXT,
    escrow_lock_status TEXT DEFAULT 'ACTIVE_HOLD',
    merkle_hold_receipt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_ctc_einvoicing_clearances (
    id TEXT PRIMARY KEY,
    invoice_reference TEXT UNIQUE NOT NULL,
    tax_authority_rail TEXT NOT NULL,
    seller_tax_id TEXT NOT NULL,
    buyer_tax_id TEXT NOT NULL,
    taxable_amount_cents INTEGER NOT NULL,
    vat_amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    ecdsa_invoice_hash TEXT NOT NULL,
    qr_payload_tlv_base64 TEXT,
    tax_clearance_status TEXT DEFAULT 'CLEARED',
    tax_authority_csid_seal TEXT,
    cleared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_ai_act_registrations_pmm (
    id TEXT PRIMARY KEY,
    system_name TEXT NOT NULL,
    annex_category TEXT NOT NULL,
    intended_purpose TEXT NOT NULL,
    risk_level TEXT DEFAULT 'HIGH_RISK',
    conformity_route TEXT NOT NULL,
    eu_db_registration_id TEXT UNIQUE,
    surveillance_status TEXT DEFAULT 'ACTIVE_MONITORING',
    model_drift_index REAL DEFAULT 0.02,
    fairness_variance REAL DEFAULT 0.01,
    incident_count INTEGER DEFAULT 0,
    market_authority TEXT NOT NULL,
    last_telemetry_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_regional_sovereignty_frameworks (
    id TEXT PRIMARY KEY,
    region_code TEXT NOT NULL,
    jurisdiction_name TEXT NOT NULL,
    primary_authority TEXT NOT NULL,
    regulations_list TEXT NOT NULL,
    data_residency_rule TEXT NOT NULL,
    enforcement_level TEXT NOT NULL,
    compliance_score_percent INTEGER DEFAULT 98,
    active_filings_count INTEGER DEFAULT 0,
    residency_zone TEXT NOT NULL,
    last_audit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_regional_statutory_filings (
    id TEXT PRIMARY KEY,
    filing_reference TEXT UNIQUE NOT NULL,
    region_code TEXT NOT NULL,
    regulatory_body TEXT NOT NULL,
    framework_title TEXT NOT NULL,
    filing_type TEXT NOT NULL,
    submitting_entity TEXT NOT NULL,
    data_residency_enclave TEXT NOT NULL,
    cryptographic_seal TEXT NOT NULL,
    statutory_status TEXT DEFAULT 'CERTIFIED_COMPLIANT',
    audit_findings TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_regional_residency_configs (
    id TEXT PRIMARY KEY,
    region_code TEXT NOT NULL,
    region_name TEXT NOT NULL,
    enclave_identifier TEXT NOT NULL,
    cross_border_rule TEXT NOT NULL,
    encryption_standard TEXT NOT NULL,
    key_management_type TEXT NOT NULL,
    telemetry_egress_policy TEXT NOT NULL,
    subpoena_shield_mode TEXT NOT NULL,
    statutory_retention_days INTEGER DEFAULT 2555,
    enforcement_active INTEGER DEFAULT 1,
    tenant_override_allowed INTEGER DEFAULT 0,
    role_access_level TEXT DEFAULT 'SUPER_ADMIN_ONLY',
    compliance_frameworks TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE_ENFORCED',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_regulatory_intelligence_feeds (
    id TEXT PRIMARY KEY,
    jurisdiction TEXT NOT NULL,
    supervisory_body TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    impact_scope TEXT NOT NULL,
    effective_deadline TEXT,
    statutory_reference TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    applicable_roles TEXT NOT NULL,
    action_status TEXT DEFAULT 'REMEDIATION_REQUIRED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_agency_stakeholders (
    id TEXT PRIMARY KEY,
    agency_code TEXT UNIQUE NOT NULL,
    agency_name TEXT NOT NULL,
    acronym TEXT NOT NULL,
    jurisdiction_country TEXT NOT NULL,
    regulatory_domain TEXT NOT NULL,
    lead_supervisory_role TEXT NOT NULL,
    relationship_posture TEXT DEFAULT 'COLLABORATIVE_PARTNER',
    compliance_rating INTEGER DEFAULT 95,
    active_inquiries_count INTEGER DEFAULT 0,
    average_response_sla_hours REAL DEFAULT 48.0,
    official_portal_url TEXT,
    secure_relay_endpoint TEXT,
    pgp_key_fingerprint TEXT,
    cert_pinning_hash TEXT,
    headquarters_address TEXT,
    bilateral_treaty_ref TEXT,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2g_regulatory_contacts (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    official_title TEXT NOT NULL,
    department TEXT NOT NULL,
    email_address TEXT NOT NULL,
    phone_number TEXT,
    clearance_level TEXT DEFAULT 'STANDARD_OFFICIAL',
    communication_channel_preferred TEXT DEFAULT 'SECURE_GOV_RELAY',
    is_primary_liaison BOOLEAN DEFAULT 0,
    last_engaged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES b2g_agency_stakeholders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS b2g_agency_engagement_history (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    contact_id TEXT,
    engagement_type TEXT NOT NULL,
    subject_title TEXT NOT NULL,
    case_or_reference_number TEXT NOT NULL,
    communication_status TEXT NOT NULL,
    direction TEXT DEFAULT 'OUTBOUND',
    summary_notes TEXT NOT NULL,
    statutory_deadline TIMESTAMP,
    cryptographic_receipt_hmac TEXT,
    transmission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolution_date TIMESTAMP,
    action_items_json TEXT,
    FOREIGN KEY (agency_id) REFERENCES b2g_agency_stakeholders(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES b2g_regulatory_contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS revenue_metrics_snapshot (
    id TEXT PRIMARY KEY,
    period_date DATE,
    mrr_cents INTEGER,
    new_mrr_cents INTEGER,
    churned_mrr_cents INTEGER,
    expansion_mrr_cents INTEGER,
    active_subscriptions_count INTEGER,
    churn_rate_percentage REAL,
    ltv_estimate_cents INTEGER,
    breakdown_by_industry TEXT,
    breakdown_by_region TEXT
);

CREATE TABLE IF NOT EXISTS automated_control_checks (
    id TEXT PRIMARY KEY,
    control_id TEXT,
    check_type TEXT,
    check_query_or_script TEXT,
    last_run_at TIMESTAMP,
    last_result TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    run_frequency TEXT DEFAULT 'daily'
);

CREATE TABLE IF NOT EXISTS control_drift_alerts (
    id TEXT PRIMARY KEY,
    automated_control_check_id TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    severity TEXT,
    resolved_at TIMESTAMP,
    FOREIGN KEY (automated_control_check_id) REFERENCES automated_control_checks(id)
);

CREATE TABLE IF NOT EXISTS regulatory_inquiries (
    id TEXT PRIMARY KEY,
    case_reference TEXT UNIQUE,
    initiated_by_regulator_id TEXT,
    target_organization_id TEXT,
    inquiry_type TEXT, -- 'routine_audit','complaint_investigation','breach_followup','licensing_review'
    priority TEXT, -- 'urgent','standard'
    status TEXT DEFAULT 'received', -- 'received','information_requested','under_review','resolved','escalated'
    response_deadline DATE,
    assigned_to TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regulatory_inquiry_evidence_requests (
    id TEXT PRIMARY KEY,
    inquiry_id TEXT,
    requested_data_description TEXT,
    linked_module TEXT,
    fulfilled BOOLEAN DEFAULT 0,
    evidence_package_url TEXT,
    fulfilled_by TEXT,
    fulfilled_at TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES regulatory_inquiries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS regulatory_inquiry_messages (
    id TEXT PRIMARY KEY,
    inquiry_id TEXT,
    sender_type TEXT, -- 'regulator','platform_compliance_team'
    sender_id TEXT,
    message_body TEXT,
    attachments TEXT, -- JSON array
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES regulatory_inquiries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS regulatory_filing_requirements (
    id TEXT PRIMARY KEY,
    jurisdiction_country TEXT NOT NULL,
    filing_type TEXT,
    frequency TEXT, -- 'monthly','quarterly','annually','on_demand'
    applicable_industry TEXT,
    template_id TEXT,
    mandatory BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS regulatory_filings (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    filing_requirement_id TEXT,
    reporting_period_start DATE,
    reporting_period_end DATE,
    status TEXT DEFAULT 'draft', -- 'draft','submitted','acknowledged','rejected','amended'
    generated_document_url TEXT,
    content_hash TEXT,
    submitted_to_regulator_id TEXT,
    submitted_at TIMESTAMP,
    acknowledgement_reference TEXT,
    acknowledged_at TIMESTAMP,
    generated_by TEXT, -- 'automated','manual_admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filing_requirement_id) REFERENCES regulatory_filing_requirements(id)
);

CREATE TABLE IF NOT EXISTS compliance_certifications (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    certification_type TEXT,
    issued_by_regulator_id TEXT,
    certificate_number TEXT UNIQUE,
    status TEXT, -- 'active','expired','revoked','suspended'
    issued_date DATE,
    expires_date DATE,
    revoked_reason TEXT,
    public_verification_code TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS government_api_integrations (
    id TEXT PRIMARY KEY,
    regulator_body_name TEXT,
    jurisdiction_country TEXT,
    integration_type TEXT, -- 'webhook_push','pull_api','sftp_batch'
    api_credential_ref TEXT,
    sync_events TEXT, -- JSON array
    is_active BOOLEAN DEFAULT 1,
    last_sync_at TIMESTAMP,
    last_sync_status TEXT
);

CREATE TABLE IF NOT EXISTS government_sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    integration_id TEXT,
    event_type TEXT,
    payload_summary TEXT, -- JSON
    delivery_status TEXT, -- 'sent','acknowledged','failed'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (integration_id) REFERENCES government_api_integrations(id)
);

CREATE TABLE IF NOT EXISTS whistleblower_reports (
    id TEXT PRIMARY KEY,
    reported_organization_id TEXT,
    report_category TEXT,
    description TEXT NOT NULL,
    evidence_attachments TEXT,
    anonymous BOOLEAN DEFAULT 1,
    reporter_contact_encrypted TEXT,
    routed_to_regulator_id TEXT,
    status TEXT DEFAULT 'received',
    linked_inquiry_id TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (linked_inquiry_id) REFERENCES regulatory_inquiries(id)
);
`;

// Consent Management Platform (CMP) Schema
export const CMP_SCHEMA = `
CREATE TABLE IF NOT EXISTS cmp_projects (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    project_name TEXT NOT NULL,
    domain TEXT,
    public_key TEXT UNIQUE NOT NULL,
    default_jurisdiction TEXT DEFAULT 'EU',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cmp_banner_configs (
    id TEXT PRIMARY KEY,
    cmp_project_id TEXT,
    jurisdiction_code TEXT,
    banner_position TEXT DEFAULT 'bottom',
    banner_theme TEXT, -- JSON config
    banner_text TEXT, -- JSON config
    button_labels TEXT, -- JSON config
    consent_model TEXT DEFAULT 'opt_in', -- 'opt_in', 'opt_out'
    is_active BOOLEAN DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cmp_project_id) REFERENCES cmp_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cmp_cookie_categories (
    id TEXT PRIMARY KEY,
    cmp_project_id TEXT,
    category_key TEXT NOT NULL,
    category_name TEXT, -- JSON i18n
    description TEXT, -- JSON i18n
    is_essential BOOLEAN DEFAULT 0,
    default_enabled BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (cmp_project_id) REFERENCES cmp_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consent_records (
    id TEXT PRIMARY KEY,
    cmp_project_id TEXT,
    visitor_id TEXT NOT NULL,
    consent_string TEXT,
    categories_accepted TEXT, -- JSON array
    categories_rejected TEXT, -- JSON array
    consent_method TEXT, -- 'banner_accept_all', 'banner_reject_all', 'preference_center'
    ip_address_hash TEXT,
    user_agent TEXT,
    page_url TEXT,
    banner_version INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cmp_project_id) REFERENCES cmp_projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consent_withdrawal_log (
    id TEXT PRIMARY KEY,
    original_consent_id TEXT,
    visitor_id TEXT,
    withdrawn_categories TEXT, -- JSON
    withdrawn_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_consent_id) REFERENCES consent_records(id)
);

CREATE TABLE IF NOT EXISTS consent_proof_exports (
    id TEXT PRIMARY KEY,
    cmp_project_id TEXT,
    visitor_id TEXT,
    date_range_start TEXT,
    date_range_end TEXT,
    export_file_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cmp_project_id) REFERENCES cmp_projects(id)
);
`;

// Payment & Subscription Extensions
export const PAYMENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    plan_code TEXT UNIQUE,
    plan_name TEXT,
    plan_type TEXT, -- 'monthly', 'yearly', 'one_time_scan'
    base_price_cents INTEGER,
    max_domains INTEGER,
    sla_hours INTEGER
);

CREATE TABLE IF NOT EXISTS addons (
    id TEXT PRIMARY KEY,
    addon_code TEXT UNIQUE,
    addon_name TEXT,
    price_cents INTEGER,
    billing_interval TEXT, -- 'one_time', 'monthly', 'yearly'
    feature_id TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    plan_id TEXT,
    status TEXT, -- 'active', 'suspended', 'cancelled'
    current_period_end TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS subscription_addons (
    id TEXT PRIMARY KEY,
    subscription_id TEXT,
    addon_code TEXT,
    price_cents INTEGER,
    attached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    subscription_id TEXT,
    amount_cents INTEGER,
    status TEXT, -- 'paid', 'unpaid'
    line_items TEXT, -- JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// SaaS Admin Panel Registration & Login
export const ADMIN_AUTH_SCHEMA = `
CREATE TABLE IF NOT EXISTS admin_invites (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    invited_email TEXT NOT NULL,
    invited_role TEXT NOT NULL,
    invited_by TEXT,
    invite_token_hash TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_mfa_config (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT UNIQUE,
    mfa_method TEXT NOT NULL,
    totp_secret_encrypted TEXT,
    backup_codes_hash TEXT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT,
    access_token_jti TEXT NOT NULL,
    refresh_token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    step_up_verified_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// User Management Extensions - Batch 2
export const USER_MGT_EXT_SCHEMA = `
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    login_result TEXT,
    ip_address_hash TEXT,
    approximate_country TEXT,
    device_fingerprint TEXT,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geo_anomaly_alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    previous_login_country TEXT,
    previous_login_at TIMESTAMP,
    new_login_country TEXT,
    new_login_at TIMESTAMP,
    time_gap_minutes INTEGER,
    flagged_as_impossible BOOLEAN,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS caas_operations (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    operation_type TEXT, -- 'scan', 'audit', 'remediation', 'proof_gen'
    status TEXT, -- 'queued', 'running', 'completed', 'failed'
    details TEXT, -- JSON details
    result_summary TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regulatory_filing_evidence (
    id TEXT PRIMARY KEY,
    filing_id TEXT,
    evidence_name TEXT,
    file_hash TEXT,
    storage_path TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filing_id) REFERENCES regulatory_filings(id)
);
`;

// Package Manager (Dynamic Plan Builder)
export const PACKAGE_MANAGER_SCHEMA = `
CREATE TABLE IF NOT EXISTS modules_master (
    module_key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    base_price NUMERIC
);

CREATE TABLE IF NOT EXISTS plan_modules (
    plan_id TEXT,
    module_key TEXT,
    UNIQUE(plan_id, module_key)
);

CREATE TABLE IF NOT EXISTS subscription_plans_master (
    plan_key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC,
    target_type TEXT DEFAULT 'CLIENT', -- 'CLIENT' | 'LAWYER'
    status TEXT DEFAULT 'ACTIVE' -- 'Active' | 'Draft' | 'Deprecated'
);

CREATE TABLE IF NOT EXISTS plan_module_mapping (
    plan_key TEXT,
    module_key TEXT,
    UNIQUE(plan_key, module_key),
    FOREIGN KEY (plan_key) REFERENCES subscription_plans_master(plan_key) ON DELETE CASCADE,
    FOREIGN KEY (module_key) REFERENCES modules_master(module_key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feature_catalog (
    id TEXT PRIMARY KEY,
    feature_key TEXT UNIQUE NOT NULL,
    feature_name TEXT NOT NULL,
    feature_category TEXT,
    value_type TEXT CHECK (value_type IN ('boolean','numeric_limit','text_config')),
    default_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_features (
    id TEXT PRIMARY KEY,
    plan_id TEXT,
    feature_id TEXT,
    enabled INTEGER DEFAULT 1,
    limit_value NUMERIC,
    config_value TEXT, -- JSON
    UNIQUE(plan_id, feature_id),
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (feature_id) REFERENCES feature_catalog(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plan_versions (
    id TEXT PRIMARY KEY,
    plan_id TEXT,
    version_number INTEGER NOT NULL,
    snapshot TEXT NOT NULL, -- JSON
    changed_by TEXT,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS custom_pricing_overrides (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    plan_id TEXT,
    override_price_cents INTEGER,
    discount_percentage NUMERIC,
    valid_from DATE,
    valid_until DATE,
    approved_by TEXT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);
`;

// Dashboard Management
export const DASHBOARD_MANAGEMENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS dashboard_widgets_catalog (
    id TEXT PRIMARY KEY,
    widget_key TEXT UNIQUE NOT NULL,
    widget_name TEXT,
    applicable_roles TEXT, -- JSON array of roles e.g. ["super_admin","org_admin","compliance_officer"]
    data_source_endpoint TEXT,
    default_config TEXT -- JSON
);

CREATE TABLE IF NOT EXISTS user_dashboard_layouts (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT,
    layout_name TEXT DEFAULT 'default',
    widgets TEXT NOT NULL, -- JSON array
    is_default INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_report_views (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    created_by TEXT,
    view_name TEXT,
    filters TEXT, -- JSON
    is_shared INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Enterprise-Grade Settings
export const ENTERPRISE_SETTINGS_SCHEMA = `
CREATE TABLE IF NOT EXISTS organization_settings (
    id TEXT PRIMARY KEY,
    organization_id TEXT UNIQUE NOT NULL,
    sso_enabled INTEGER DEFAULT 0,
    sso_provider TEXT,
    sso_metadata_url TEXT,
    sso_entity_id TEXT,
    sso_certificate TEXT,
    white_label_enabled INTEGER DEFAULT 0,
    custom_domain TEXT,
    custom_domain_verified INTEGER DEFAULT 0,
    dns_txt_challenge TEXT,
    logo_url TEXT,
    primary_color TEXT,
    custom_email_sender TEXT,
    data_residency_region TEXT,
    data_residency_enforced INTEGER DEFAULT 0,
    ip_whitelist_enabled INTEGER DEFAULT 0,
    allowed_ip_ranges TEXT, -- JSON array
    notification_channels TEXT, -- JSON
    security_alert_recipients TEXT, -- JSON array
    custom_rate_limit_per_min INTEGER,
    custom_api_quota_monthly INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id TEXT PRIMARY KEY,
    flag_key TEXT UNIQUE NOT NULL,
    description TEXT,
    rollout_type TEXT CHECK (rollout_type IN ('global','org_whitelist','percentage')),
    rollout_percentage INTEGER,
    is_enabled_globally INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS organization_feature_flags (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    flag_id TEXT,
    enabled INTEGER DEFAULT 1,
    enabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, flag_id),
    FOREIGN KEY (flag_id) REFERENCES feature_flags(id) ON DELETE CASCADE
);
`;

// Post-Subscription Compliance Engine Pipeline & 22 Add-ons
export const PIPELINE_ENGINE_SCHEMA = `
CREATE TABLE IF NOT EXISTS pipeline_usage_entitlements (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    subscription_id TEXT,
    bundled_package_id TEXT,
    entitlement_type TEXT CHECK (entitlement_type IN ('one_time_single_run','one_time_multi_run','unlimited_within_period')),
    max_pipeline_runs INTEGER DEFAULT 1,
    runs_consumed INTEGER DEFAULT 0,
    usage_window_start TIMESTAMP NOT NULL,
    usage_window_end TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','fully_consumed','revoked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pipeline_entitlement_extensions (
    id TEXT PRIMARY KEY,
    entitlement_id TEXT,
    extended_by TEXT,
    extended_days INTEGER,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entitlement_id) REFERENCES pipeline_usage_entitlements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pipeline_stage_definitions (
    id TEXT PRIMARY KEY,
    stage_key TEXT UNIQUE NOT NULL,
    stage_name TEXT,
    linked_addon_code TEXT,
    execution_mode TEXT CHECK (execution_mode IN ('sequential_required','parallel_optional','conditional')),
    depends_on_stage_key TEXT,
    estimated_duration_minutes INTEGER,
    stage_order INTEGER
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id TEXT PRIMARY KEY,
    entitlement_id TEXT,
    organization_id TEXT,
    triggered_by TEXT,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued','running','completed','partially_completed','failed','expired_mid_run')),
    total_stages INTEGER,
    stages_completed INTEGER DEFAULT 0,
    overall_risk_score INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pipeline_stage_executions (
    id TEXT PRIMARY KEY,
    pipeline_run_id TEXT,
    stage_definition_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','skipped_dependency_failed')),
    linked_scan_job_id TEXT,
    findings_count INTEGER DEFAULT 0,
    stage_result_summary TEXT, -- JSON
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (pipeline_run_id) REFERENCES pipeline_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_definition_id) REFERENCES pipeline_stage_definitions(id)
);

CREATE TABLE IF NOT EXISTS auto_fixation_rules (
    id TEXT PRIMARY KEY,
    violation_category TEXT NOT NULL,
    is_auto_fixable INTEGER DEFAULT 0,
    fix_method TEXT,
    requires_client_approval_before_apply INTEGER DEFAULT 1,
    risk_level_if_auto_applied TEXT CHECK (risk_level_if_auto_applied IN ('low','medium','high'))
);

CREATE TABLE IF NOT EXISTS auto_fixation_executions (
    id TEXT PRIMARY KEY,
    pipeline_stage_execution_id TEXT,
    finding_reference_id TEXT,
    auto_fixation_rule_id TEXT,
    status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed','pending_client_approval','applied','rejected_by_client','failed','rolled_back')),
    proposed_fix_diff TEXT,
    approved_by TEXT,
    applied_at TIMESTAMP,
    rollback_available_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auto_fixation_rollback_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auto_fixation_execution_id TEXT,
    rolled_back_by TEXT,
    reason TEXT,
    rolled_back_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auto_fixation_execution_id) REFERENCES auto_fixation_executions(id)
);

CREATE TABLE IF NOT EXISTS audit_reports (
    id TEXT PRIMARY KEY,
    pipeline_run_id TEXT,
    organization_id TEXT,
    report_type TEXT CHECK (report_type IN ('full_audit','executive_summary','regulator_submission_ready')),
    total_findings INTEGER,
    findings_auto_fixed INTEGER,
    findings_pending_manual INTEGER,
    overall_compliance_score INTEGER,
    report_file_url TEXT,
    content_hash TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    downloaded_count INTEGER DEFAULT 0
);
`;

// DSAR Portal Schema (Data Subject Access Request)
export const DSAR_PORTAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS dsar_requests (
    id TEXT PRIMARY KEY,
    cmp_project_id TEXT,
    organization_id TEXT,
    requester_email TEXT NOT NULL,
    requester_name TEXT,
    request_type TEXT CHECK (request_type IN ('access','erasure','portability','rectification','opt_out_sale','restrict_processing')),
    jurisdiction_basis TEXT,
    identity_verified INTEGER DEFAULT 0,
    identity_verification_method TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','identity_pending','verified','in_review','in_progress','fulfilled','rejected','partially_fulfilled')),
    rejection_reason TEXT,
    sla_deadline TIMESTAMP NOT NULL,
    sla_extended INTEGER DEFAULT 0,
    sla_extension_reason TEXT,
    assigned_to TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at TIMESTAMP,
    ip_address_hash TEXT
);

CREATE TABLE IF NOT EXISTS dsar_data_sources (
    id TEXT PRIMARY KEY,
    dsar_request_id TEXT,
    source_system TEXT,
    records_found INTEGER DEFAULT 0,
    data_snapshot_ref TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    FOREIGN KEY (dsar_request_id) REFERENCES dsar_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dsar_fulfillment_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dsar_request_id TEXT,
    action TEXT,
    performed_by TEXT,
    affected_table TEXT,
    affected_record_count INTEGER,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dsar_request_id) REFERENCES dsar_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dsar_export_packages (
    id TEXT PRIMARY KEY,
    dsar_request_id TEXT,
    file_url TEXT,
    file_format TEXT CHECK (file_format IN ('json','csv','pdf')),
    encrypted INTEGER DEFAULT 1,
    download_expires_at TIMESTAMP,
    downloaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dsar_request_id) REFERENCES dsar_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS erasure_rules (
    id TEXT PRIMARY KEY,
    source_table TEXT NOT NULL,
    erasure_method TEXT CHECK (erasure_method IN ('hard_delete','anonymize','pseudonymize')),
    retention_override_reason TEXT,
    cannot_delete INTEGER DEFAULT 0
);
`;

// Privacy Policy Generator Schema
export const PRIVACY_POLICY_GEN_SCHEMA = `
CREATE TABLE IF NOT EXISTS policy_questionnaires (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    business_description TEXT,
    data_categories_collected TEXT, -- JSON array
    operating_countries TEXT, -- JSON array
    has_children_under_16_users INTEGER DEFAULT 0,
    sells_data_to_third_parties INTEGER DEFAULT 0,
    uses_automated_decision_making INTEGER DEFAULT 0,
    data_retention_period_months INTEGER,
    dpo_contact_email TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legal_clause_library (
    id TEXT PRIMARY KEY,
    clause_key TEXT NOT NULL,
    jurisdiction_code TEXT NOT NULL,
    clause_template TEXT NOT NULL,
    trigger_condition TEXT, -- JSON
    display_order INTEGER,
    legal_reviewed_by TEXT,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_policies (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    cmp_project_id TEXT,
    policy_type TEXT CHECK (policy_type IN ('privacy_policy','cookie_policy','terms_of_service')),
    language_code TEXT DEFAULT 'en',
    jurisdiction_variants TEXT, -- JSON
    content_html TEXT NOT NULL,
    content_hash TEXT,
    status TEXT DEFAULT 'draft_pending_review' CHECK (status IN ('draft_pending_review','under_legal_review','approved','published','outdated','archived')),
    version INTEGER DEFAULT 1,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    published_at TIMESTAMP,
    public_url TEXT,
    outdated_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policy_version_history (
    id TEXT PRIMARY KEY,
    generated_policy_id TEXT,
    version INTEGER NOT NULL,
    content_html TEXT NOT NULL,
    content_hash TEXT,
    changed_by TEXT,
    change_summary TEXT,
    effective_from TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_policy_id) REFERENCES generated_policies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS policy_staleness_flags (
    id TEXT PRIMARY KEY,
    generated_policy_id TEXT,
    trigger_reason TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved INTEGER DEFAULT 0,
    FOREIGN KEY (generated_policy_id) REFERENCES generated_policies(id) ON DELETE CASCADE
);
`;

// Data Breach Notification Schema
export const DATA_BREACH_NOTIFICATION_SCHEMA = `
CREATE TABLE IF NOT EXISTS data_breach_incidents (
    id TEXT PRIMARY KEY,
    security_incident_id TEXT,
    organization_id TEXT,
    breach_type TEXT CHECK (breach_type IN ('confidentiality','integrity','availability')),
    personal_data_categories TEXT, -- JSON
    estimated_affected_count INTEGER,
    risk_level TEXT CHECK (risk_level IN ('low','high')),
    risk_assessment_notes TEXT,
    detected_at TIMESTAMP NOT NULL,
    notification_clock_start TIMESTAMP NOT NULL,
    regulator_notification_deadline TIMESTAMP NOT NULL,
    regulator_notified INTEGER DEFAULT 0,
    regulator_notified_at TIMESTAMP,
    regulator_notification_late INTEGER DEFAULT 0,
    late_notification_justification TEXT,
    individuals_notified INTEGER DEFAULT 0,
    individuals_notified_at TIMESTAMP,
    assessed_by TEXT,
    status TEXT DEFAULT 'assessing' CHECK (status IN ('assessing','confirmed_breach','notifying','contained','closed','false_positive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS breach_affected_data_subjects (
    id TEXT PRIMARY KEY,
    data_breach_incident_id TEXT,
    subject_identifier_hash TEXT,
    data_categories_exposed TEXT, -- JSON
    notification_sent INTEGER DEFAULT 0,
    notification_sent_at TIMESTAMP,
    notification_method TEXT CHECK (notification_method IN ('email','sms','postal','public_notice')),
    notification_bounced INTEGER DEFAULT 0,
    FOREIGN KEY (data_breach_incident_id) REFERENCES data_breach_incidents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS breach_regulator_notifications (
    id TEXT PRIMARY KEY,
    data_breach_incident_id TEXT,
    regulator_name TEXT,
    jurisdiction_code TEXT,
    submission_method TEXT,
    reference_number TEXT,
    submitted_at TIMESTAMP,
    submitted_by TEXT,
    submission_document_url TEXT,
    acknowledgement_received INTEGER DEFAULT 0,
    FOREIGN KEY (data_breach_incident_id) REFERENCES data_breach_incidents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS breach_response_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_breach_incident_id TEXT,
    action TEXT NOT NULL,
    performed_by TEXT,
    notes TEXT,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (data_breach_incident_id) REFERENCES data_breach_incidents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS breach_notification_templates (
    id TEXT PRIMARY KEY,
    template_type TEXT CHECK (template_type IN ('regulator','affected_individual')),
    jurisdiction_code TEXT,
    language_code TEXT DEFAULT 'en',
    subject_line TEXT,
    body_template TEXT,
    required_fields TEXT -- JSON
);
`;

// Support & Vendor Management Schema
export const SUPPORT_AND_VENDORS_SCHEMA = `
CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    organization_id TEXT,
    created_by TEXT,
    category TEXT CHECK (category IN ('billing','technical','scan_issue','dsar_query','compliance_question','account','other')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent','high','normal','low')),
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting_on_customer','resolved','closed')),
    related_module TEXT,
    related_record_id TEXT,
    assigned_to TEXT,
    sla_response_deadline TIMESTAMP,
    sla_breached INTEGER DEFAULT 0,
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,
    satisfaction_rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT,
    sender_type TEXT CHECK (sender_type IN ('customer','support_agent','system')),
    sender_id TEXT,
    message_body TEXT NOT NULL,
    attachments TEXT, -- JSON
    is_internal_note INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vendor_profiles (
    id TEXT PRIMARY KEY,
    vendor_name TEXT UNIQUE NOT NULL,
    vendor_type TEXT,
    website_url TEXT,
    primary_contact_email TEXT,
    data_processed_categories TEXT, -- JSON
    processing_locations TEXT, -- JSON
    onboarding_status TEXT DEFAULT 'pending_review' CHECK (onboarding_status IN ('pending_review','approved','rejected','offboarded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_dpa_agreements (
    id TEXT PRIMARY KEY,
    vendor_id TEXT,
    dpa_document_url TEXT,
    signed_date TEXT,
    effective_from TEXT,
    expires_at TEXT,
    scc_included INTEGER DEFAULT 0,
    liability_cap_defined INTEGER DEFAULT 0,
    breach_notification_clause_hours INTEGER,
    status TEXT CHECK (status IN ('draft','active','expired','terminated')),
    signed_by TEXT,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public_subprocessor_list (
    id TEXT PRIMARY KEY,
    vendor_id TEXT,
    display_name TEXT,
    purpose_description TEXT,
    is_publicly_listed INTEGER DEFAULT 1,
    listed_since TEXT,
    FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id)
);
`;

// LLM Provider Management Schema
export const LLM_MANAGEMENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS llm_providers (
    id TEXT PRIMARY KEY,
    provider_key TEXT UNIQUE NOT NULL,
    display_name TEXT,
    base_api_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS llm_provider_credentials (
    id TEXT PRIMARY KEY,
    provider_id TEXT,
    credential_label TEXT,
    credential_ref TEXT NOT NULL,
    environment TEXT DEFAULT 'production' CHECK (environment IN ('production','sandbox')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active','revoked','expired','rate_limited')),
    added_by TEXT,
    last_rotated_at TIMESTAMP,
    rotation_reminder_days INTEGER DEFAULT 90,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES llm_providers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS llm_models_catalog (
    id TEXT PRIMARY KEY,
    provider_id TEXT,
    model_name TEXT NOT NULL,
    context_window_tokens INTEGER,
    input_cost_per_1k_cents REAL,
    output_cost_per_1k_cents REAL,
    is_deprecated INTEGER DEFAULT 0,
    deprecation_date TEXT,
    replacement_model_id TEXT,
    FOREIGN KEY (provider_id) REFERENCES llm_providers(id)
);

CREATE TABLE IF NOT EXISTS llm_feature_bindings (
    id TEXT PRIMARY KEY,
    feature_key TEXT UNIQUE NOT NULL,
    primary_provider_credential_id TEXT,
    primary_model_id TEXT,
    temperature REAL DEFAULT 0.2,
    max_output_tokens INTEGER DEFAULT 2048,
    system_prompt_template TEXT,
    is_active INTEGER DEFAULT 1,
    updated_by TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_provider_credential_id) REFERENCES llm_provider_credentials(id),
    FOREIGN KEY (primary_model_id) REFERENCES llm_models_catalog(id)
);

CREATE TABLE IF NOT EXISTS llm_fallback_chains (
    id TEXT PRIMARY KEY,
    feature_binding_id TEXT,
    fallback_order INTEGER NOT NULL,
    provider_credential_id TEXT,
    model_id TEXT,
    UNIQUE(feature_binding_id, fallback_order),
    FOREIGN KEY (feature_binding_id) REFERENCES llm_feature_bindings(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_credential_id) REFERENCES llm_provider_credentials(id),
    FOREIGN KEY (model_id) REFERENCES llm_models_catalog(id)
);

CREATE TABLE IF NOT EXISTS llm_budget_limits (
    id TEXT PRIMARY KEY,
    scope_type TEXT CHECK (scope_type IN ('platform_wide','per_feature','per_organization')),
    scope_reference_id TEXT,
    monthly_budget_cents INTEGER NOT NULL,
    current_month_spent_cents INTEGER DEFAULT 0,
    alert_threshold_percentage INTEGER DEFAULT 80,
    hard_cap_enforced INTEGER DEFAULT 1,
    reset_day_of_month INTEGER DEFAULT 1,
    last_reset_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS llm_usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feature_key TEXT,
    organization_id TEXT,
    provider_credential_id TEXT,
    model_id TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_cents REAL,
    latency_ms INTEGER,
    was_fallback INTEGER DEFAULT 0,
    fallback_reason TEXT,
    request_status TEXT CHECK (request_status IN ('success','failed','budget_blocked')),
    called_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Third-Party Verification Module Toggle Schema
export const VERIFICATION_TOGGLE_SCHEMA = `
CREATE TABLE IF NOT EXISTS verification_provider_categories (
    category_key TEXT PRIMARY KEY,
    category_name TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS verification_providers (
    id TEXT PRIMARY KEY,
    category_key TEXT,
    provider_key TEXT UNIQUE NOT NULL,
    display_name TEXT,
    provider_type TEXT,
    supported_countries TEXT, -- JSON
    documentation_url TEXT,
    is_available_in_catalog INTEGER DEFAULT 1,
    FOREIGN KEY (category_key) REFERENCES verification_provider_categories(category_key)
);

CREATE TABLE IF NOT EXISTS verification_provider_credentials (
    id TEXT PRIMARY KEY,
    provider_id TEXT,
    credential_label TEXT,
    credential_ref TEXT NOT NULL,
    additional_config TEXT, -- JSON
    environment TEXT DEFAULT 'production' CHECK (environment IN ('production','sandbox')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active','revoked','expired','failing')),
    added_by TEXT,
    last_health_check_at TIMESTAMP,
    last_health_status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES verification_providers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_feature_toggles (
    id TEXT PRIMARY KEY,
    feature_key TEXT UNIQUE NOT NULL,
    feature_name TEXT,
    category_key TEXT,
    is_enabled INTEGER DEFAULT 0,
    active_provider_credential_id TEXT,
    fallback_provider_credential_id TEXT,
    applies_to_roles TEXT, -- JSON
    is_mandatory INTEGER DEFAULT 0,
    updated_by TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_key) REFERENCES verification_provider_categories(category_key),
    FOREIGN KEY (active_provider_credential_id) REFERENCES verification_provider_credentials(id),
    FOREIGN KEY (fallback_provider_credential_id) REFERENCES verification_provider_credentials(id)
);

CREATE TABLE IF NOT EXISTS verification_toggle_change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feature_key TEXT,
    old_enabled INTEGER,
    new_enabled INTEGER,
    changed_by TEXT,
    reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_dashboard_tab_catalog (
    id TEXT PRIMARY KEY,
    tab_key TEXT UNIQUE NOT NULL,
    tab_label TEXT,
    parent_nav_group TEXT DEFAULT 'security_integrations',
    required_feature_key TEXT,
    always_visible_to_super_admin INTEGER DEFAULT 1,
    FOREIGN KEY (required_feature_key) REFERENCES verification_feature_toggles(feature_key)
);

CREATE TABLE IF NOT EXISTS citizen_biometric_enrollments (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    country TEXT NOT NULL,
    document_type TEXT NOT NULL,
    enclave_key TEXT NOT NULL,
    landmarks_count INTEGER DEFAULT 68,
    jawline_symmetry REAL DEFAULT 0.98,
    sd_jwt_credential TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS biometric_audit_trails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id TEXT,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    confidence REAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Advanced Compliance Functional Modules Schema
export const COMPLIANCE_MODULES_SCHEMA = `
CREATE TABLE IF NOT EXISTS platform_regulators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    acronym TEXT NOT NULL,
    region TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    status TEXT NOT NULL,
    last_active TEXT,
    mandates_count INTEGER DEFAULT 0,
    official_portal TEXT,
    country TEXT NOT NULL,
    subscription_tier TEXT,
    subscription_status TEXT,
    api_key TEXT UNIQUE,
    mfa_enabled INTEGER DEFAULT 1,
    dora_resilience_audit TEXT,
    rule_sets TEXT,
    language_override TEXT,
    nre_dlp INTEGER DEFAULT 1,
    nre_consent INTEGER DEFAULT 1,
    nre_audit INTEGER DEFAULT 1,
    nre_encryption INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supervised_companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lei TEXT NOT NULL UNIQUE,
    jurisdiction TEXT NOT NULL,
    industry TEXT NOT NULL,
    compliance_score REAL DEFAULT 85.0,
    risk_tier TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'Compliant',
    last_audit TEXT,
    data_residency TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfer_impact_assessments (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    vendor_id TEXT,
    transfer_country TEXT,
    adequacy_status TEXT,
    scc_required INTEGER DEFAULT 1,
    risk_score INTEGER,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_review_date TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS statutory_gazette_watchdog_logs (
    id TEXT PRIMARY KEY,
    jurisdiction TEXT NOT NULL,
    gazette_source_url TEXT,
    publication_date TIMESTAMP,
    amendment_summary TEXT,
    impact_level TEXT,
    auto_patch_triggered INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gap_analysis_reports (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    framework TEXT NOT NULL,
    compliance_percentage INTEGER,
    identified_gaps TEXT, -- JSON
    remediation_plan TEXT, -- JSON
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
`;

