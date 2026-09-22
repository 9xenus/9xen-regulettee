export type ComplianceRole = 'AUDITOR' | 'SYSTEM_ADMIN' | 'COMPLIANCE_OFFICER' | 'LAWYER';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'UNREAD' | 'READ' | 'ACKNOWLEDGED' | 'RESOLVED';

export type ComplianceFrameworkType = 
  | 'GDPR' 
  | 'EU_AI_ACT' 
  | 'NIS2' 
  | 'DORA' 
  | 'SOC2' 
  | 'EIDAS' 
  | 'ISO27001' 
  | 'SOVEREIGNTY';

export interface ComplianceAlert {
  id: string;
  role: ComplianceRole;
  severity: AlertSeverity;
  framework: ComplianceFrameworkType;
  statutoryReference: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  deadlineHours?: number;
  deadlineIso?: string;
  status: AlertStatus;
  isPinned?: boolean;
  actionRequired: boolean;
  remediationAction?: {
    id: string;
    label: string;
    description: string;
    targetPath?: string;
    autoRemediable?: boolean;
  };
  auditHash: string;
  tenantId?: string;
  tenantName?: string;
}

export interface RoleConfig {
  id: ComplianceRole;
  name: string;
  badgeLabel: string;
  description: string;
  statutoryFocus: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  defaultPath: string;
}
