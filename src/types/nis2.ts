export interface Nis2AuditLog {
  id: string;
  actor: 'AI_AGENT' | 'HUMAN_OFFICER' | 'HUMAN';
  agentName?: string;
  action: string;
  timestamp: string;
  explainabilityNote?: string;
}

export interface Nis2Incident {
  id: string;
  title: string;
  detectedAt: string;
  status: 'DETECTED' | 'REPORTING' | 'SUBMITTED' | 'RESOLVED';
  classification?: {
    type: string;
    isSignificant: boolean;
    confidenceScore: number;
    reasoning: string;
    doraOverlap?: boolean;
    gdprOverlap?: boolean;
  };
  riskScore?: {
    likelihood: number;
    impact: number;
    cascadingScore: number;
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  reports?: any[];
  auditLogs: Nis2AuditLog[];
}
