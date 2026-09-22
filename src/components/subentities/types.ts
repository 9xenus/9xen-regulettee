export interface CloudProviderConfig {
  id: string;
  provider: 'AWS' | 'Azure' | 'GCP' | 'On-Premise';
  region: string;
  configType: 'Shared' | 'Dedicated' | 'Enclave';
  status: 'Healthy' | 'Warning' | 'Critical';
}

export interface DataNode {
  id: string;
  name: string;
  location: string;
  processingType: string;
  recordCount: number;
}

export interface InfrastructureProfile {
  serverLocations: string[];
  dataProcessingNodes: DataNode[];
  cloudProviders: CloudProviderConfig[];
  updatedAt: string;
}

export interface SubEntity {
  id: string;
  name: string;
  industry: string;
  complianceScore: number;
  status: 'Active' | 'Under Review' | 'Flagged';
  infrastructure: InfrastructureProfile;
}
