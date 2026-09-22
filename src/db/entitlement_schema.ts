export const ENTITLEMENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS entitlements (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    entitlement_key TEXT NOT NULL,
    value TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_entitlements (
    tenant_id TEXT NOT NULL,
    module_key TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    valid_until TIMESTAMP,
    custom_limits TEXT,
    custom_price NUMERIC,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, module_key)
);
`;
