/**
 * Phase 1: Graph Intelligence Schema (PostgreSQL / SQLite Dual Compatibility)
 * Tables:
 *  - intel_graph_sync_log: Tracks synchronization state between Postgres/SQLite and Neo4j
 *  - intel_graph_findings: Graph analytics findings (serial operators, shell companies, risk clusters, ownership cycles)
 *  - intel_entity_resolution: Entity resolution candidate pairs, matching scores, and merge decisions
 */

export const GRAPH_INTEL_SCHEMA = `
CREATE TABLE IF NOT EXISTS intel_graph_sync_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'default_tenant',
  country_id TEXT NOT NULL DEFAULT 'BD',
  entity_type TEXT NOT NULL DEFAULT 'Entity', -- Entity, Person, Identifier, Address, Violation, Website
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL, -- UPSERT_NODE, DELETE_NODE, CREATE_RELATION, DELETE_RELATION, RECONCILE
  neo4j_tx_id TEXT,
  sync_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, SYNCED, FAILED, RETRYING, SKIPPED
  diff_payload TEXT DEFAULT '{}',
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  hash_chain TEXT, -- SHA-256 audit hash linking prior entry
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intel_graph_findings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'default_tenant',
  country_id TEXT NOT NULL DEFAULT 'BD',
  finding_type TEXT NOT NULL, -- serial_operator, shell_company, cluster_risk, ownership_cycle, shared_identifier_fanout, risk_propagation
  primary_entity_id TEXT NOT NULL,
  related_entity_ids TEXT NOT NULL DEFAULT '[]', -- JSON array of entity IDs
  graph_path TEXT DEFAULT '{}', -- JSON representation of graph traverse
  community_id TEXT, -- Louvain cluster identifier
  pagerank_score REAL NOT NULL DEFAULT 0.0,
  risk_score REAL NOT NULL DEFAULT 0.85,
  confidence REAL NOT NULL DEFAULT 0.85,
  xai_explanation TEXT NOT NULL, -- Deterministic human-readable XAI explanation
  evidence_refs TEXT NOT NULL DEFAULT '[]', -- References to nre_evidence_vault hashes/IDs
  review_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, CONFIRMED, DISMISSED, ESCALATED_TO_CASE
  severity TEXT NOT NULL DEFAULT 'HIGH', -- LOW, MEDIUM, HIGH, CRITICAL
  reviewed_by TEXT,
  review_notes TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intel_entity_resolution (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'default_tenant',
  country_id TEXT NOT NULL DEFAULT 'BD',
  candidate_a_id TEXT NOT NULL,
  candidate_b_id TEXT NOT NULL,
  candidate_a_name TEXT,
  candidate_b_name TEXT,
  blocking_key TEXT NOT NULL,
  deterministic_score REAL NOT NULL DEFAULT 0.0,
  llm_similarity_score REAL NOT NULL DEFAULT 0.0,
  composite_confidence REAL NOT NULL DEFAULT 0.0,
  shared_identifiers TEXT DEFAULT '[]',
  decision TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, AUTO_MERGED, MANUALLY_MERGED, REJECTED
  decided_by TEXT,
  decision_rationale TEXT,
  decided_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_intel_sync_status ON intel_graph_sync_log(sync_status, country_id);
CREATE INDEX IF NOT EXISTS idx_intel_sync_entity ON intel_graph_sync_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_intel_findings_country ON intel_graph_findings(country_id, review_status);
CREATE INDEX IF NOT EXISTS idx_intel_findings_type ON intel_graph_findings(finding_type, severity);
CREATE INDEX IF NOT EXISTS idx_intel_findings_primary ON intel_graph_findings(primary_entity_id);
CREATE INDEX IF NOT EXISTS idx_intel_res_decision ON intel_entity_resolution(country_id, decision);
CREATE INDEX IF NOT EXISTS idx_intel_res_blocking ON intel_entity_resolution(blocking_key);
CREATE INDEX IF NOT EXISTS idx_intel_res_candidates ON intel_entity_resolution(candidate_a_id, candidate_b_id);
`;
