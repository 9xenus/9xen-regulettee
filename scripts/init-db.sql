-- ==============================================================================
-- 9Xen Regulettee - PostgreSQL Initialization Script
-- Executed automatically by the postgres:16 container on first boot.
-- ==============================================================================

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization_metadata JSONB DEFAULT '{}',
  appearance_metadata JSONB DEFAULT '{}',
  compliance_config JSONB DEFAULT '{}',
  status VARCHAR(32) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CaaS Addons
CREATE TABLE IF NOT EXISTS caas_addons (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  act_id VARCHAR(64),
  description TEXT,
  price VARCHAR(64),
  score INTEGER DEFAULT 95,
  color_class VARCHAR(255),
  icon VARCHAR(64),
  is_active_globally BOOLEAN DEFAULT TRUE,
  endpoint_url TEXT,
  api_key TEXT,
  config_schema JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CaaS Operations
CREATE TABLE IF NOT EXISTS caas_operations (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  operation_type VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL,
  result_summary TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Audit Trail / Events
CREATE TABLE IF NOT EXISTS audit_trail_events (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  action VARCHAR(255) NOT NULL,
  actor VARCHAR(128) NOT NULL,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Regions
CREATE TABLE IF NOT EXISTS regions (
  code VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sovereign_node VARCHAR(128),
  compliance_tier VARCHAR(64) DEFAULT 'TIER_1',
  data_residency_rules JSONB DEFAULT '{}'
);

-- Compliance Profiles
CREATE TABLE IF NOT EXISTS compliance_profiles (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  risk_level VARCHAR(32) DEFAULT 'HIGH',
  config JSONB DEFAULT '{}'
);

-- Industries
CREATE TABLE IF NOT EXISTS industries (
  code VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- DORA ICT Third-Party Vendors Register (DORA Art. 28)
CREATE TABLE IF NOT EXISTS dora_vendor_register (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(128) NOT NULL,
  criticality VARCHAR(64) NOT NULL,
  risk_score INTEGER DEFAULT 0,
  sub_processor_chain JSONB DEFAULT '[]',
  dora_compliant BOOLEAN DEFAULT TRUE,
  contractual_exit_plan VARCHAR(255),
  certifications JSONB DEFAULT '{}',
  extraterritorial_exposure VARCHAR(128),
  hosting_region VARCHAR(128),
  scc_module VARCHAR(64),
  remediation_plan TEXT,
  last_audit_scan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Immutable Merkle Tree Compliance Ledger
CREATE TABLE IF NOT EXISTS merkle_compliance_ledger (
  index_id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  event_hash VARCHAR(128) NOT NULL,
  parent_hash VARCHAR(128),
  block_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  signature_algorithm VARCHAR(64) DEFAULT 'DILITHIUM_5',
  zkp_proof JSONB DEFAULT '{}'
);

-- DSAR Zero-Knowledge Verified Requests
CREATE TABLE IF NOT EXISTS dsar_zkp_requests (
  id VARCHAR(64) PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL,
  subject_email VARCHAR(255) NOT NULL,
  request_type VARCHAR(64) NOT NULL,
  status VARCHAR(64) NOT NULL,
  identity_verified BOOLEAN DEFAULT FALSE,
  zkp_proof_hash VARCHAR(128),
  discovered_databases JSONB DEFAULT '[]',
  sla_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO regulettee_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO regulettee_admin;