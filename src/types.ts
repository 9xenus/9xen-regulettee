export interface KeyRotationLog {
  id: string;
  timestamp: string;
  actor: string;
  type: 'manual' | 'automated';
}

export interface Threat {
  id: string;
  name: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  category: "Low" | "Medium" | "High" | "Critical";
}

export interface Tenant {
  id: string;
  name: string;
  region: string;
  status: string;
  tier: string;
  phase: string;
}

export interface Breach {
  id: string;
  tenantId: string;
  tenantName: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Mitigated' | 'Resolved';
  date: string;
  description: string;
  impactedUsers: number;
}

export interface RegulatorBreach {
  id: string;
  country: string;
  lat: number;
  lng: number;
  severity: number;
  article: string;
  sector: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface TenantFrameworkActivation {
  tenantId: string;
  frameworkId: string;
  activatedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface DpoCertification {
  id: string;
  name: string;
  email: string;
  cert_body: string;
  cert_name: string;
  cert_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'ACTIVE' | 'WARNING' | 'EXPIRED';
  daysRemaining?: number;
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  category: 'GDPR' | 'EU AI Act' | 'Data Residency' | 'Policy Change' | 'General';
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  read: boolean;
  link?: string;
  url?: string;
}

// --- Enforcement Cascade Types ---

export type ExecutionMode = 'AUTO' | 'MANUAL' | 'CONDITIONAL';
export type ProfileStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type ActorRole = 
  | 'regulator_drafter' 
  | 'regulator_approver' 
  | 'auditor' 
  | 'lawyer'
  | 'legal_consultant'
  | 'system';

export interface EnforcementTriggerConfig {
  riskThreshold: number;
  violationTypes: string[];
  minOccurrences?: number;
  lookbackPeriodDays?: number;
  customLogic?: string;
}

export interface ApprovalPolicyConfig {
  requiredApprovers: number;
  approverRoles: ActorRole[];
  slaHours: number;
  allowSelfApproval: boolean;
  escalationPath?: string[];
}

export interface LegalBasisConfig {
  regulation: string;
  article: string;
  recital?: string;
  jurisdictionRef: string;
}

export interface EnforcementLevelTemplate {
  id: string;
  key: string;
  label: string;
  description?: string;
  defaultMode: ExecutionMode;
  technicalAction: string;
  legalBasisFields: string[];
  triggerFields: string[];
  approvalFields: string[];
  auditFields: string[];
  isActive: boolean;
}

export interface PressureNodeTemplate {
  id: string;
  key: string;
  label: string;
  description?: string;
  triggerFields: string[];
  channels: string[];
  isActive: boolean;
}

export interface JurisdictionProfile {
  id: string;
  tenantId: string;
  countryCode: string;
  regulationCode: string;
  name: string;
  status: ProfileStatus;
  version: number;
  parentVersionId?: string;
  publishedAt?: string;
  createdById: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JurisdictionLevelSetting {
  id: string;
  profileId: string;
  levelTemplateId: string;
  enabled: boolean;
  executionMode: ExecutionMode;
  legalBasis: LegalBasisConfig;
  triggerConditions: EnforcementTriggerConfig;
  scopeLimits: Record<string, any>;
  approvalPolicy: ApprovalPolicyConfig;
  escalationRules: Record<string, any>;
  emergencyStop: boolean;
}

export interface ApprovalRequest {
  id: string;
  profileId: string;
  requestedById: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  decisionReason?: string;
  versionSnapshot: any;
}

export interface ExecutionEvent {
  id: string;
  profileId: string;
  levelKey: string;
  mode: ExecutionMode;
  status: string;
  caseRef?: string;
  executedAt: string;
  payload: any;
}

export interface AuditEvent {
  id: string;
  tenantId: string;
  profileId?: string;
  actorId?: string;
  actorRole: ActorRole;
  action: string;
  resourceType: string;
  resourceId: string;
  before?: any;
  after?: any;
  metadata?: any;
  createdAt: string;
}

export type AuditStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface AuditChecklistItem {
  id: string;
  label: string;
  description?: string;
  status: AuditStatus;
  category: string;
  updatedAt: string;
  assignee?: string;
}

export type UIUsageAuditCategory = 'DOCUMENT' | 'POLICY' | 'RISK' | 'AUTH' | 'SYSTEM' | 'GENERAL' | 'COMPLIANCE' | 'SECURITY';

export interface UIUsageAuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: UIUsageAuditCategory;
  metadata?: Record<string, any>;
  userId?: string;
  userEmail?: string;
  role?: string;
}

// --- PDF Customization Types ---

export interface PDFAnnotation {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  bold?: boolean;
}

export interface RedactionMask {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}
