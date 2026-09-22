export type EnforcementStage =
  | 'intake'
  | 'evidence_review'
  | 'hearing'
  | 'order_issued'
  | 'appeal'
  | 'enforcement'
  | 'closed';

export type EnforcementSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActionType =
  | 'warning_letter'
  | 'show_cause_notice'
  | 'fine'
  | 'license_suspension'
  | 'site_takedown'
  | 'court_referral';

export type ActionStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'dispatched'
  | 'executed'
  | 'failed';

export type DeadlineType =
  | 'show_cause_response'
  | 'hearing_schedule'
  | 'fine_payment'
  | 'corrective_action';

export type DeadlineStatus = 'active' | 'met' | 'breached' | 'waived';

export type DispatchChannel = 'email' | 'portal' | 'webhook' | 'api_regulator';
export type DispatchStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export interface EnforcementCase {
  id: string;
  case_number: string;
  entity_id: string;
  law_id: string;
  country_id: string;
  stage: EnforcementStage;
  severity: EnforcementSeverity;
  assigned_officer_id?: string | null;
  title?: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface EnforcementAction {
  id: string;
  case_id: string;
  action_type: ActionType;
  parameters_json: string;
  status: ActionStatus;
  approved_by_1?: string | null;
  approved_by_2?: string | null;
  approved_at_1?: string | null;
  approved_at_2?: string | null;
  dispatched_at?: string | null;
  executed_at?: string | null;
  created_at: string;
}

export interface EnforcementEvidenceVault {
  id: string;
  case_id: string;
  file_hash_sha256: string;
  mime_type: string;
  s3_key: string;
  timestamp_utc: string;
  rfc3161_token?: string | null;
  metadata_json: string;
  created_at: string;
}

export interface EnforcementSlaDeadline {
  id: string;
  case_id: string;
  action_id?: string | null;
  deadline_type: DeadlineType;
  due_at: string;
  escalation_level: number; // 0, 1, 2, 3
  status: DeadlineStatus;
  escalated_to?: string | null;
  escalated_at?: string | null;
  created_at: string;
}

export interface EnforcementDispatch {
  id: string;
  action_id: string;
  channel: DispatchChannel;
  recipient: string;
  payload_json: string;
  status: DispatchStatus;
  delivery_proof_hash?: string | null;
  attempt_count: number;
  sent_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
}
