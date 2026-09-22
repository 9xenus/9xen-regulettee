export type Region = 'EU' | 'USA' | 'AUSTRALIA' | 'NEW_ZEALAND' | 'APAC';

export interface RegionalConfig {
  region: Region;
  active: boolean;
  lastUpdated: string;
}

export interface PolicyAct {
  id: string;
  name: string;
  version: string;
  region: Region;
  status: 'Up-to-date' | 'Update Available';
  lastSynced: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  enabled: boolean;
  impactScore: number;
  added?: string[];
  removed?: string[];
  diff?: string;
}

export interface Regulator {
  id: string;
  name: string;
  acronym: string;
  region: Region;
  jurisdiction: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  lastActive: string;
  mandatesCount: number;
  officialPortal: string;
  country?: string; // e.g. 'Germany', 'France', 'Ireland', 'Netherlands', 'Belgium', 'Italy'
  subscriptionTier?: 'Standard Regulator Enclave' | 'Sovereign Ultimate Enclave';
  subscriptionStatus?: 'Active' | 'Expired' | 'Trialing';
  apiKey?: string;
  mfaEnabled?: boolean;
  doraResilienceAudit?: 'Passed' | 'Action Needed' | 'Exempt';
  ruleSets?: string[]; // e.g. ['GDPR Art 32', 'DORA compliance', 'NIS2 Directive']
  languageOverride?: string; // e.g. 'de-DE', 'fr-FR'
  nreWorkflowToggles?: {
    dlp: boolean;
    consent: boolean;
    audit: boolean;
    encryption: boolean;
  };
}

export interface ClientTenant {
  id: string;
  name: string;
  region: Region;
  industry: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING';
  tier: 'Starter' | 'Pro' | 'Enterprise';
  complianceScore: number;
  lastAudit: string;
  healthStatus: 'Healthy' | 'Warning' | 'Critical';
  country?: string;
  dbResidencyNode?: string; // e.g. 'DE_Node_1', 'FR_Node_2', 'IE_Node_3'
  mfaEnabled?: boolean;
  activeFrameworks?: string[];
  contactEmail?: string;
  crmUrl?: string;
  githubUrl?: string;
  itAssets?: string;
  additionalLinks?: string;
}
