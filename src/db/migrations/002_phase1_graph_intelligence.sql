-- ═══════════════════════════════════════════════════════════
-- Migration 002: Phase 1 Graph Intelligence Schema
-- Target: PostgreSQL 16
-- Prefix: intel_
-- ═══════════════════════════════════════════════════════════

-- 1. Graph Synchronization Audit Log (PostgreSQL <-> Neo4j)
CREATE TABLE IF NOT EXISTS intel_graph_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  country_id VARCHAR(8) NOT NULL DEFAULT 'BD',
  entity_type VARCHAR(32) NOT NULL, -- 'Entity', 'Person', 'Identifier', 'Address', 'Violation', 'Website'
  entity_id VARCHAR(128) NOT NULL,
  operation VARCHAR(32) NOT NULL, -- 'UPSERT_NODE', 'DELETE_NODE', 'CREATE_RELATION', 'DELETE_RELATION', 'RECONCILE'
  neo4j_tx_id VARCHAR(128),
  sync_status VARCHAR(24) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SYNCED', 'FAILED', 'RETRYING', 'SKIPPED'
  diff_payload JSONB DEFAULT '{}'::jsonb,
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  hash_chain VARCHAR(64), -- SHA-256 integrity hash linking previous sync entry
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_sync_status_country ON intel_graph_sync_log(sync_status, country_id);
CREATE INDEX IF NOT EXISTS idx_intel_sync_entity ON intel_graph_sync_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_intel_sync_created_at ON intel_graph_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intel_sync_tenant ON intel_graph_sync_log(tenant_id);

-- 2. Graph Intelligence Analytics Findings & Discovery Engine
CREATE TABLE IF NOT EXISTS intel_graph_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  country_id VARCHAR(8) NOT NULL DEFAULT 'BD',
  finding_type VARCHAR(64) NOT NULL, -- 'serial_operator', 'shell_company', 'cluster_risk', 'ownership_cycle', 'shared_identifier_fanout', 'risk_propagation'
  primary_entity_id VARCHAR(128) NOT NULL,
  related_entity_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  graph_path JSONB DEFAULT '{}'::jsonb,
  community_id VARCHAR(64),
  pagerank_score NUMERIC(8, 6) NOT NULL DEFAULT 0.000000,
  risk_score NUMERIC(5, 4) NOT NULL DEFAULT 0.8500,
  confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.8500,
  xai_explanation TEXT NOT NULL,
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  review_status VARCHAR(24) NOT NULL DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'CONFIRMED', 'DISMISSED', 'ESCALATED_TO_CASE'
  severity VARCHAR(16) NOT NULL DEFAULT 'HIGH', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  reviewed_by VARCHAR(128),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_findings_country_status ON intel_graph_findings(country_id, review_status);
CREATE INDEX IF NOT EXISTS idx_intel_findings_type_severity ON intel_graph_findings(finding_type, severity);
CREATE INDEX IF NOT EXISTS idx_intel_findings_primary_entity ON intel_graph_findings(primary_entity_id);
CREATE INDEX IF NOT EXISTS idx_intel_findings_created ON intel_graph_findings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intel_findings_tenant ON intel_graph_findings(tenant_id);

-- 3. Entity Resolution & Deduplication Pipeline
CREATE TABLE IF NOT EXISTS intel_entity_resolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  country_id VARCHAR(8) NOT NULL DEFAULT 'BD',
  candidate_a_id VARCHAR(128) NOT NULL,
  candidate_b_id VARCHAR(128) NOT NULL,
  candidate_a_name VARCHAR(256),
  candidate_b_name VARCHAR(256),
  blocking_key VARCHAR(128) NOT NULL,
  deterministic_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
  llm_similarity_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
  composite_confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
  shared_identifiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  decision VARCHAR(24) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'AUTO_MERGED', 'MANUALLY_MERGED', 'REJECTED'
  decided_by VARCHAR(128),
  decision_rationale TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_intel_resolution_candidates UNIQUE (tenant_id, candidate_a_id, candidate_b_id)
);

CREATE INDEX IF NOT EXISTS idx_intel_resolution_country_dec ON intel_entity_resolution(country_id, decision);
CREATE INDEX IF NOT EXISTS idx_intel_resolution_blocking ON intel_entity_resolution(blocking_key);
CREATE INDEX IF NOT EXISTS idx_intel_resolution_confidence ON intel_entity_resolution(composite_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_intel_resolution_tenant ON intel_entity_resolution(tenant_id);
