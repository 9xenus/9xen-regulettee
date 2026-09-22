
export const RBAC_SCHEMA = `
-- 1. Roles table
CREATE TABLE IF NOT EXISTS rbac_roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Permissions table (Verbs)
CREATE TABLE IF NOT EXISTS rbac_permissions (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE, -- e.g., 'GOV_COMPLIANCE'
    action TEXT NOT NULL, -- 'READ', 'WRITE', 'EXECUTE', 'ADMIN'
    description TEXT,
    UNIQUE(key, action)
);

-- 3. Role-Permission mapping
CREATE TABLE IF NOT EXISTS rbac_role_permissions (
    role_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id),
    FOREIGN KEY (permission_id) REFERENCES rbac_permissions(id)
);

-- 4. User-Role mapping (Tenant-aware)
CREATE TABLE IF NOT EXISTS rbac_user_roles (
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    PRIMARY KEY (user_id, role_id, tenant_id),
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
`;
