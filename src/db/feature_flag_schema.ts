export const FEATURE_FLAG_SCHEMA = `
  CREATE TABLE IF NOT EXISTS platform_feature_flags (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_enabled INTEGER DEFAULT 0,
    circuit_breaker_active INTEGER DEFAULT 0,
    target_tenants TEXT DEFAULT '["ALL"]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
