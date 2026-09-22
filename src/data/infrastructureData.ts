export interface PiiSampleRecord {
  field: string;
  value: string;
  status: 'exposed' | 'masked' | 'restricted';
}

export interface DiscoveredRecord {
  id: string;
  category: string;
  key: string; // Used for Pie Chart slice selection
  region: 'eu-west' | 'eu-central' | 'us-east' | 'apac';
  regionLabel: string;
  businessUnit: 'core' | 'ecommerce' | 'healthtech' | 'fintech' | 'gaming';
  businessUnitLabel: string;
  source: string;
  recordCount: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  remediation: string;
  sampleRecords: PiiSampleRecord[];
}

export const REGIONS = [
  { value: '', label: 'All Regions' },
  { value: 'eu-west', label: 'EU-West (Ireland)' },
  { value: 'eu-central', label: 'EU-Central (Frankfurt)' },
  { value: 'us-east', label: 'US-East (N. Virginia)' },
  { value: 'apac', label: 'APAC (Singapore)' },
];

export const BUSINESS_UNITS = [
  { value: '', label: 'All Business Units' },
  { value: 'core', label: 'Core Platform' },
  { value: 'ecommerce', label: 'E-Commerce Gateway' },
  { value: 'healthtech', label: 'Healthtech Portal' },
  { value: 'fintech', label: 'Fintech Service' },
  { value: 'gaming', label: 'Gaming Division' },
];

export const DISCOVERED_RECORDS: DiscoveredRecord[] = [
  // EU-West - Core Platform
  {
    id: 'rec_1',
    category: 'PII (User Identity)',
    key: 'pii',
    region: 'eu-west',
    regionLabel: 'EU-West (Ireland)',
    businessUnit: 'core',
    businessUnitLabel: 'Core Platform',
    source: 'PostgreSQL User Enclave',
    recordCount: 14200,
    severity: 'High',
    remediation: 'Implement double-envelope column encryption for email and telephone fields.',
    sampleRecords: [
      { field: 'email', value: 'dr.vandelay@vandelaylabs.com', status: 'exposed' },
      { field: 'phone', value: '+353 1 496 0123', status: 'exposed' },
      { field: 'full_name', value: 'Helena Vandelay', status: 'masked' }
    ]
  },
  {
    id: 'rec_2',
    category: 'Credentials & Keys',
    key: 'keys',
    region: 'eu-west',
    regionLabel: 'EU-West (Ireland)',
    businessUnit: 'core',
    businessUnitLabel: 'Core Platform',
    source: 'GitLab CI/CD Variables',
    recordCount: 4,
    severity: 'Critical',
    remediation: 'Rotate leaked private SSH key detected in plaintext build configuration log.',
    sampleRecords: [
      { field: 'API_KEY_SEC', value: 'sk_live_51N...8D91', status: 'exposed' },
      { field: 'SSH_PRIVATE_KEY', value: '-----BEGIN OPENSSH PRIVATE KEY-----...', status: 'exposed' }
    ]
  },
  // EU-West - E-Commerce
  {
    id: 'rec_3',
    category: 'PCI (Financial Data)',
    key: 'pci',
    region: 'eu-west',
    regionLabel: 'EU-West (Ireland)',
    businessUnit: 'ecommerce',
    businessUnitLabel: 'E-Commerce Gateway',
    source: 'Redis Transaction Cache',
    recordCount: 5800,
    severity: 'Critical',
    remediation: 'Truncate CVV buffers immediately. Disable raw payload caching in development endpoints.',
    sampleRecords: [
      { field: 'card_number', value: '4111 **** **** 9821', status: 'masked' },
      { field: 'cvv', value: '382', status: 'exposed' },
      { field: 'cardholder', value: 'Jean-Luc Picart', status: 'exposed' }
    ]
  },
  // EU-Central - Healthtech
  {
    id: 'rec_4',
    category: 'PHI (Patient Health Info)',
    key: 'phi',
    region: 'eu-central',
    regionLabel: 'EU-Central (Frankfurt)',
    businessUnit: 'healthtech',
    businessUnitLabel: 'Healthtech Portal',
    source: 'S3 Health Records Bucket',
    recordCount: 3120,
    severity: 'Critical',
    remediation: 'Anonymize clinical trial diagnostics. Enforce EHDS zero-trust credential rotation.',
    sampleRecords: [
      { field: 'patient_id', value: 'PAT-908273-X', status: 'exposed' },
      { field: 'diagnostic_code', value: 'ICD-10-CM Z71.9', status: 'exposed' },
      { field: 'consent_form', value: 'consent_signed_20250115.pdf', status: 'restricted' }
    ]
  },
  {
    id: 'rec_5',
    category: 'Sensors / Tracking',
    key: 'tracking',
    region: 'eu-central',
    regionLabel: 'EU-Central (Frankfurt)',
    businessUnit: 'healthtech',
    businessUnitLabel: 'Healthtech Portal',
    source: 'Website Analytics Tracker',
    recordCount: 18500,
    severity: 'High',
    remediation: 'Remove tracking pixel from secure patient intake form. Apply cookie-consent strict gating.',
    sampleRecords: [
      { field: 'user_fingerprint', value: 'fp_a982cbef230912ab', status: 'exposed' },
      { field: 'gps_latitude', value: '50.1109', status: 'exposed' },
      { field: 'gps_longitude', value: '8.6821', status: 'exposed' }
    ]
  },
  // US-East - Fintech
  {
    id: 'rec_6',
    category: 'PCI (Financial Data)',
    key: 'pci',
    region: 'us-east',
    regionLabel: 'US-East (N. Virginia)',
    businessUnit: 'fintech',
    businessUnitLabel: 'Fintech Service',
    source: 'DynamoDB Ledger Table',
    recordCount: 9200,
    severity: 'High',
    remediation: 'Enable AWS KMS hardware security module encryption at rest for sensitive transaction keys.',
    sampleRecords: [
      { field: 'iban_number', value: 'DE89 3704 **** **** 12', status: 'masked' },
      { field: 'routing_transit', value: '021000021', status: 'exposed' }
    ]
  },
  {
    id: 'rec_7',
    category: 'PII (User Identity)',
    key: 'pii',
    region: 'us-east',
    regionLabel: 'US-East (N. Virginia)',
    businessUnit: 'fintech',
    businessUnitLabel: 'Fintech Service',
    source: 'S3 Identity KYC Docs Bucket',
    recordCount: 450,
    severity: 'High',
    remediation: 'Apply S3 Object Lock and configure SSE-KMS customer-managed keys.',
    sampleRecords: [
      { field: 'passport_scan', value: 'passport_vandelay_us.png', status: 'restricted' },
      { field: 'ssn_last_four', value: '9821', status: 'exposed' }
    ]
  },
  // APAC - Gaming
  {
    id: 'rec_8',
    category: 'System / IP Logs',
    key: 'logs',
    region: 'apac',
    regionLabel: 'APAC (Singapore)',
    businessUnit: 'gaming',
    businessUnitLabel: 'Gaming Division',
    source: 'ElasticSearch Audit Logs',
    recordCount: 345000,
    severity: 'Medium',
    remediation: 'Purge internal debug variables containing session tokens. Set log retention to 14 days.',
    sampleRecords: [
      { field: 'ip_address', value: '182.16.89.201', status: 'exposed' },
      { field: 'session_token', value: 'sess_tok_9283abc89d7bfae', status: 'exposed' }
    ]
  },
  {
    id: 'rec_9',
    category: 'Sensors / Tracking',
    key: 'tracking',
    region: 'apac',
    regionLabel: 'APAC (Singapore)',
    businessUnit: 'gaming',
    businessUnitLabel: 'Gaming Division',
    source: 'Lootbox Telemetry Stream',
    recordCount: 88400,
    severity: 'Low',
    remediation: 'Scrub gaming device identifiers and replace with ephemeral session tokens.',
    sampleRecords: [
      { field: 'device_uuid', value: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6', status: 'exposed' },
      { field: 'age_tier', value: 'minor-under-16', status: 'exposed' }
    ]
  },
  // EU-Central - Core Platform
  {
    id: 'rec_10',
    category: 'PII (User Identity)',
    key: 'pii',
    region: 'eu-central',
    regionLabel: 'EU-Central (Frankfurt)',
    businessUnit: 'core',
    businessUnitLabel: 'Core Platform',
    source: 'ScyllaDB Consent Database',
    recordCount: 22100,
    severity: 'Medium',
    remediation: 'Configure automated cookie policy consensus synchronization with client browser.',
    sampleRecords: [
      { field: 'consent_timestamp', value: '2026-06-25T09:00:00Z', status: 'masked' },
      { field: 'marketing_opt_in', value: 'true', status: 'exposed' }
    ]
  }
];

export interface CategoryDistribution {
  category: string;
  key: string;
  value: number; // sum of records
  color: string;
  sourceCount: number;
  maxSeverity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export const CATEGORY_COLORS: Record<string, string> = {
  pii: '#6366f1', // Indigo
  pci: '#f59e0b', // Amber
  phi: '#ec4899', // Pink
  tracking: '#06b6d4', // Cyan
  keys: '#ef4444', // Red
  logs: '#8b5cf6', // Violet
};

export const getCategoryColor = (key: string): string => {
  return CATEGORY_COLORS[key] || '#94a3b8';
};
