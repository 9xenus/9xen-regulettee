export interface ComplianceChecklist {
  id: string;
  industry: string;
  category: string;
  description: string;
}

export const REGTECH_COMPLIANCE_CHECKLISTS: ComplianceChecklist[] = [
  { id: 'chk_ai_1', industry: 'AI_Tech', category: 'model_behavior', description: 'Technical documentation on training data bias mitigation strategies under EU AI Act.' },
  { id: 'chk_ai_2', industry: 'AI_Tech', category: 'privacy', description: 'Human-in-the-loop oversight mechanism for high-risk AI systems.' },
  { id: 'chk_health_1', industry: 'Healthcare', category: 'data_security', description: 'End-to-end encryption for HL7/FHIR health data interchange and HIPAA compliance.' },
  { id: 'chk_health_2', industry: 'Healthcare', category: 'privacy', description: 'Explicit patient consent for secondary diagnostic data usage.' },
  { id: 'chk_log_1', industry: 'Logistics', category: 'data_security', description: 'Geolocation truncation to 3 decimal places for driver privacy.' },
  { id: 'chk_log_2', industry: 'Logistics', category: 'legal_risk', description: 'Verification of tier-1 vendor data residency compliance.' },
  { id: 'chk_gov_1', industry: 'GovTech', category: 'data_security', description: 'Sovereign enclave access restricted to authorized personnel only.' },
  { id: 'chk_gov_2', industry: 'GovTech', category: 'legal_risk', description: 'Mandatory MFA for all national data portal administrative gateways.' },
  { id: 'chk_fin_1', industry: 'FINTECH', category: 'audit_trail', description: 'DORA resilience testing and real-time transaction monitoring compliance.' }
];
