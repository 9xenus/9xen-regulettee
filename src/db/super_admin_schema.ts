export const SUPER_ADMIN_SCHEMA = `
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'read_only', -- super_admin, platform_ops, support_l1, support_l2, billing_admin, security_analyst, read_only
  mfa_secret TEXT,
  mfa_enabled INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- active, locked, suspended
  last_login_at TIMESTAMP,
  last_login_ip TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS super_admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  is_revoked INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  is_allowed INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS admin_break_glass_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  approver_id TEXT,
  reason TEXT NOT NULL,
  target_scope TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, EXPIRED, REVOKED, REJECTED
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  security_alert_sent INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_impersonations (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  ticket_id TEXT,
  reason TEXT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  actions_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_two_person_approvals (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL, -- REFUND_GT_50K, TENANT_DELETION, SECRET_ROTATION, FULL_DATA_EXPORT
  payload_json TEXT NOT NULL,
  requester_id TEXT NOT NULL,
  approver_id TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXECUTED
  threshold_amount REAL DEFAULT 0,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_audit_trail (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  impersonator_id TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  target_id TEXT,
  payload_diff TEXT,
  ip_address TEXT,
  prev_hash TEXT NOT NULL,
  current_hash TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_security_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL
  source_ip TEXT,
  details_json TEXT,
  resolved INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_secret_rotations (
  id TEXT PRIMARY KEY,
  secret_name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  rotated_by TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_support_tickets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  priority TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
  status TEXT DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
  assigned_admin_id TEXT,
  sla_deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_super_admin_sessions_token ON super_admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_audit_timestamp ON admin_audit_trail(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_tickets_tenant ON admin_support_tickets(tenant_id);
`;
