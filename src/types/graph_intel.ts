export type GraphFindingType = 
  | 'serial_operator'
  | 'shell_company'
  | 'cluster_risk'
  | 'circular_ownership'
  | 'shared_identifier';

export type GraphFindingStatus = 'new' | 'reviewed' | 'confirmed' | 'dismissed';

export interface IntelGraphFinding {
  id: string;
  finding_type: GraphFindingType;
  entity_ids: string[];
  country_id: string;
  confidence: number;
  explanation: string;
  evidence_refs: string[];
  status: GraphFindingStatus;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reviewed_by?: string;
  review_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

export type EntityResolutionDecision = 'pending' | 'merged' | 'rejected' | 'auto_merged';

export interface IntelEntityResolution {
  id: string;
  candidate_a_id: string;
  candidate_b_id: string;
  candidate_a_name?: string;
  candidate_b_name?: string;
  confidence: number;
  method: 'DETERMINISTIC_TIN' | 'FUZZY_NAME_PHONE' | 'EMBEDDING_MATCH' | 'LLM_ASSISTED';
  shared_identifiers: Array<{ type: string; value: string }>;
  decision: EntityResolutionDecision;
  decided_by?: string;
  decision_rationale?: string;
  decided_at?: string;
  created_at: string;
}

export interface IntelGraphSyncLog {
  id: string;
  entity_id: string;
  operation: 'UPSERT_NODE' | 'DELETE_NODE' | 'CREATE_RELATION' | 'RECONCILE';
  status: 'PENDING' | 'SYNCED' | 'FAILED' | 'RETRYING';
  error?: string;
  retry_count: number;
  synced_at?: string;
  created_at: string;
}
