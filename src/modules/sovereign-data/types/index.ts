export interface CloudProvider {
  id: string;
  name: string;
  region: string;
  jurisdiction: string;
  complianceCertifications: string[];
}

export interface DataFlow {
  id: string;
  sourceRegion: string;
  destinationRegion: string;
  dataClassification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  encryptionStatus: 'Unencrypted' | 'Encrypted_In_Transit' | 'Encrypted_At_Rest' | 'E2EE';
}

export interface KeyManager {
  id: string;
  type: 'HSM' | 'Cloud_KMS' | 'OnPrem_KMS';
  provider: string;
  location: string;
  rotationPolicy: string;
}

export interface Evidence {
  id: string;
  evidenceType: 'AuditLog' | 'Attestation' | 'ComplianceReport';
  timestamp: Date;
  hash: string;
  verificationStatus: 'Pending' | 'Verified' | 'Failed';
}

export interface GraphRelationships {
  hosts: { providerId: string; dataFlowId: string; since: Date }[];
  secures: { keyManagerId: string; dataFlowId: string; keyAlgorithm: string }[];
  attestsTo: { evidenceId: string; targetId: string }[];
}
