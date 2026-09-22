export const ENTERPRISE_SAAS_SCHEMA = `
-- 1. Multi-entity hierarchy management
CREATE TABLE IF NOT EXISTS tenant_hierarchy (
    id TEXT PRIMARY KEY,
    parent_tenant_id TEXT,
    child_tenant_id TEXT,
    inheritance_mode TEXT DEFAULT 'STRICT', -- 'STRICT', 'OVERRIDE_ALLOWED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (child_tenant_id) REFERENCES tenants(id)
);

-- 2. White-label / reseller mode
CREATE TABLE IF NOT EXISTS white_label_configs (
    tenant_id TEXT PRIMARY KEY,
    brand_name TEXT,
    logo_url TEXT,
    primary_color TEXT,
    custom_domain TEXT,
    support_email TEXT,
    reseller_enabled BOOLEAN DEFAULT 0,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 3. Org chart-aware permissions
CREATE TABLE IF NOT EXISTS hris_integrations (
    tenant_id TEXT PRIMARY KEY,
    provider TEXT, -- 'Workday', 'BambooHR', 'Gusto'
    sync_status TEXT,
    last_sync_at TIMESTAMP,
    config TEXT, -- JSON
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 4. Adaptive session policies
CREATE TABLE IF NOT EXISTS security_session_policies (
    tenant_id TEXT PRIMARY KEY,
    module_sensitivity_map TEXT, -- JSON mapping module_id to sensitivity level
    policy_rules TEXT, -- JSON mapping sensitivity level to {timeout, mfa_required, ip_allowlist}
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 5. Break-glass emergency access
CREATE TABLE IF NOT EXISTS break_glass_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    approved_by TEXT, -- Dual approval
    reason TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 6. Bring-your-own-encryption-key (BYOK)
CREATE TABLE IF NOT EXISTS byok_configs (
    tenant_id TEXT PRIMARY KEY,
    provider TEXT, -- 'AWS_KMS', 'AZURE_KV', 'GCP_KMS'
    key_arn TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    last_validated_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 7. Usage forecasting with budget alerts
CREATE TABLE IF NOT EXISTS usage_forecasts (
    tenant_id TEXT PRIMARY KEY,
    current_month_usage INTEGER,
    projected_usage INTEGER,
    budget_limit INTEGER,
    alert_threshold_percent INTEGER DEFAULT 80,
    last_calculated_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 8. Granular cost allocation
CREATE TABLE IF NOT EXISTS cost_allocations (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    usage_percentage REAL,
    allocated_cost_cents INTEGER,
    period_month DATE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 9. Notification fatigue auto-tuning
CREATE TABLE IF NOT EXISTS notification_engagement_metrics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    action_taken BOOLEAN,
    latency_seconds INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Approval chain builder
CREATE TABLE IF NOT EXISTS approval_workflow_templates (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- 'policy_change', 'new_jurisdiction'
    steps_json TEXT NOT NULL, -- JSON array of steps
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 11. Data residency per module
CREATE TABLE IF NOT EXISTS module_data_residency (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    module_key TEXT NOT NULL,
    region_code TEXT NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- 12. Integration health dashboard
CREATE TABLE IF NOT EXISTS integration_health_logs (
    id TEXT PRIMARY KEY,
    integration_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'HEALTHY', 'DEGRADED', 'FAILED'
    latency_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Sandbox/staging environment toggle
CREATE TABLE IF NOT EXISTS sandbox_environments (
    id TEXT PRIMARY KEY,
    prod_tenant_id TEXT NOT NULL,
    sandbox_tenant_id TEXT NOT NULL,
    last_sync_at TIMESTAMP,
    status TEXT DEFAULT 'ACTIVE',
    FOREIGN KEY (prod_tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (sandbox_tenant_id) REFERENCES tenants(id)
);

-- 14. AI feature governance panel
CREATE TABLE IF NOT EXISTS ai_feature_governance (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT 1,
    confidence_threshold REAL DEFAULT 0.85,
    accuracy_metrics TEXT, -- JSON
    last_evaluated_at TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
`;
