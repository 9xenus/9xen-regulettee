/**
 * Phase 1: Graph Intelligence Domain Types & Database Entities
 * Prefix: intel_
 */

export type GraphNodeType = 'Entity' | 'Person' | 'Identifier' | 'Address' | 'Violation' | 'Website';

export type GraphRelationType = 
  | 'OWNED_BY' 
  | 'DIRECTOR_OF' 
  | 'SHARES_IDENTIFIER' 
  | 'LOCATED_AT' 
  | 'OPERATES' 
  | 'VIOLATED' 
  | 'SAME_AS';

export interface GraphRelationProps {
  source: string;
  confidence: number;
  evidence_ref: string;
  synced_at: string;
  weight?: number;
}

export type SyncOperation = 'UPSERT_NODE' | 'DELETE_NODE' | 'CREATE_RELATION' | 'DELETE_RELATION' | 'RECONCILE';
export type SyncStatus = 'PENDING' | 'SYNCED' | 'FAILED' | 'RETRYING' | 'SKIPPED';

export interface IntelGraphSyncLog {
  id: string;
  tenant_id: string;
  country_id: string;
  entity_type: GraphNodeType;
  entity_id: string;
  operation: SyncOperation;
  neo4j_tx_id?: string | null;
  sync_status: SyncStatus;
  diff_payload?: Record<string, any>;
  retry_count: number;
  error_message?: string | null;
  hash_chain?: string | null;
  synced_at?: string | null;
  created_at: string;
}

export type GraphFindingType = 
  | 'serial_operator' 
  | 'shell_company' 
  | 'cluster_risk' 
  | 'ownership_cycle' 
  | 'shared_identifier_fanout' 
  | 'risk_propagation';

export type FindingReviewStatus = 'PENDING_REVIEW' | 'CONFIRMED' | 'DISMISSED' | 'ESCALATED_TO_CASE';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IntelGraphFinding {
  id: string;
  tenant_id: string;
  country_id: string;
  finding_type: GraphFindingType;
  primary_entity_id: string;
  related_entity_ids: string[];
  graph_path?: {
    nodes: Array<{ id: string; label: string; type: GraphNodeType; risk_score?: number }>;
    edges: Array<{ source: string; target: string; type: GraphRelationType; confidence: number }>;
  };
  community_id?: string | null;
  pagerank_score: number;
  risk_score: number;
  confidence: number;
  xai_explanation: string;
  evidence_refs: string[];
  review_status: FindingReviewStatus;
  severity: FindingSeverity;
  reviewed_by?: string | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export type ResolutionDecision = 'PENDING' | 'AUTO_MERGED' | 'MANUALLY_MERGED' | 'REJECTED';

export interface IntelEntityResolution {
  id: string;
  tenant_id: string;
  country_id: string;
  candidate_a_id: string;
  candidate_b_id: string;
  candidate_a_name?: string | null;
  candidate_b_name?: string | null;
  blocking_key: string;
  deterministic_score: number;
  llm_similarity_score: number;
  composite_confidence: number;
  shared_identifiers: Array<{ type: string; value: string; weight: number }>;
  decision: ResolutionDecision;
  decided_by?: string | null;
  decision_rationale?: string | null;
  decided_at?: string | null;
  created_at: string;
}
