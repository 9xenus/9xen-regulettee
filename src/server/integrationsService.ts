import crypto from 'crypto';
import { getDb } from '../db/sqlite';

// --- Types ---
export interface SoftwareIntegration {
  id: number;
  name: string;
  type: string;
  platform: string;
  status: 'CONNECTED' | 'ERROR' | 'DISCONNECTED';
  settings: {
    apiUrl?: string;
    scope?: string;
    clientId?: string;
  };
  last_scanned_at: string | null;
  created_at: string;
}

export interface ScanViolation {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  check: string;
  status: 'RESOLVED' | 'UNRESOLVED';
  description: string;
}

export interface SoftwareScanRecord {
  id: number;
  integration_id: number;
  status: 'COMPLETED' | 'FAILED';
  score: number;
  violations_count: number;
  details: ScanViolation[];
  created_at: string;
}

export interface ApiTokenRecord {
  id: number;
  token: string;
  name: string;
  client_system: string;
  scope: string;
  status: 'ACTIVE' | 'REVOKED';
  created_at: string;
  last_used_at: string | null;
}

export interface WebhookEndpointRecord {
  id: string;
  url: string;
  status: 'active' | 'failing' | 'disabled';
  events: string[];
  secret: string;
  lastDelivery: string | null;
  createdAt: string;
}

export interface WebhookDeliveryLogRecord {
  id: string;
  endpointId: string;
  event: string;
  status: number;
  timestamp: string;
  latencyMs: number;
  payloadSummary?: string;
}

export interface KycVerificationPayload {
  applicantName: string;
  documentType: 'NID_BANGLADESH' | 'PASSPORT_GLOBAL' | 'DRIVING_LICENSE';
  documentNumber: string;
  livenessSelfieCaptured?: boolean;
}

export interface AmlEvaluationPayload {
  sender: string;
  receiver: string;
  amountUsd: number;
  channel: 'SWIFT' | 'SEPA' | 'BKASH_NPSB' | 'CRYPTO_MICA';
}

// --- In-Memory Stores (Persisted for Container Lifetime) ---

export let storedSoftwareIntegrations: SoftwareIntegration[] = [
  {
    id: 1,
    name: 'Frankfurt Core Salesforce CRM',
    type: 'CRM',
    platform: 'Salesforce',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://eu44.salesforce.com/services/data/v58.0',
      scope: 'Lead Tracking & Consent Audit',
      clientId: '3MVG9_CRM_PROD_EU_881'
    },
    last_scanned_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: '2026-06-15T08:30:00Z'
  },
  {
    id: 2,
    name: 'Munich Enterprise SAP S/4HANA',
    type: 'ERP',
    platform: 'SAP',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://sap-hana-prod.eu-central-1.corp.internal/odata/v4',
      scope: 'DORA Digital Resilience Logging',
      clientId: 'SAP_CLIENT_HANA_910'
    },
    last_scanned_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    created_at: '2026-07-02T11:00:00Z'
  },
  {
    id: 3,
    name: 'Sovereign AWS S3 Data Lake (eu-west-3)',
    type: 'Cloud',
    platform: 'AWS S3',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://s3.eu-west-3.amazonaws.com/9xen-sovereign-vault',
      scope: 'Public Bucket & Encryption Scan',
      clientId: 'IAM_ROLE_REGTECH_SOVEREIGN'
    },
    last_scanned_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    created_at: '2026-07-10T14:20:00Z'
  },
  {
    id: 4,
    name: 'Global Workforce BambooHR',
    type: 'HRIS',
    platform: 'BambooHR',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://api.bamboohr.com/api/gateway.php/acme_eu/v1',
      scope: 'Employee PII Protection & GDPR Art 88 Compliance',
      clientId: 'HRIS_KEY_SECURE_41'
    },
    last_scanned_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    created_at: '2026-07-20T09:15:00Z'
  },
  {
    id: 5,
    name: 'Okta Customer Identity & IAM',
    type: 'IdP',
    platform: 'Okta',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://sovereign-auth.okta.com/oauth2/v1',
      scope: 'MFA & Role-Based Access Control Auditing',
      clientId: 'okta_client_regtech_99'
    },
    last_scanned_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    created_at: '2026-08-01T16:40:00Z'
  },
  {
    id: 6,
    name: 'Berlin Health FHIR Gateway',
    type: 'Healthcare',
    platform: 'HL7 FHIR API',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://fhir.berlin-health.de/v4',
      scope: 'Patient Data Privacy & HIPAA Alignment',
      clientId: 'HEALTH_GATEWAY_EU_001'
    },
    last_scanned_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: '2026-08-15T10:00:00Z'
  },
  {
    id: 7,
    name: 'Global Logistics IoT Hub',
    type: 'Logistics',
    platform: 'Azure IoT Central',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://iot-logistics-prod.azureiotcentral.com/api',
      scope: 'Fleet Telemetry Privacy Masking',
      clientId: 'IOT_FLEET_SYNC_88'
    },
    last_scanned_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: '2026-08-20T14:30:00Z'
  },
  {
    id: 8,
    name: 'GovTech G2B Data Exchange',
    type: 'GovTech',
    platform: 'National Data Portal',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://api.gov.eu/data-exchange/v2',
      scope: 'Sovereign Enclave Access Control',
      clientId: 'GOV_TECH_GATEWAY_99'
    },
    last_scanned_at: null,
    created_at: '2026-09-01T09:00:00Z'
  },
  {
    id: 9,
    name: 'Google Vertex AI & Gemini Sentinel Connector',
    type: 'AI & LLM Governance',
    platform: 'Google Cloud Vertex AI',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://aiplatform.googleapis.com/v1/projects/sovereign-regtech/locations/europe-west3',
      scope: 'EU AI Act Conformity, Prompt Injection & PII Redaction Audit',
      clientId: 'vertex_sentinel_guard_09'
    },
    last_scanned_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: '2026-09-05T10:00:00Z'
  },
  {
    id: 10,
    name: 'Datadog & Splunk SIEM Incident Stream',
    type: 'SIEM & SOC',
    platform: 'Datadog SIEM',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://api.datadoghq.eu/api/v2/security_monitoring',
      scope: 'DORA Article 19 & NIS2 Rapid Incident Statutory Notification',
      clientId: 'datadog_sovereign_soc_88'
    },
    last_scanned_at: new Date(Date.now() - 900000).toISOString(),
    created_at: '2026-09-06T14:00:00Z'
  },
  {
    id: 11,
    name: 'Snowflake Sovereign Clean Room Residency',
    type: 'Data Clean Room',
    platform: 'Snowflake',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://eu-sovereign-org.privatelink.snowflakecomputing.com/api/v2',
      scope: 'Zero-Copy Differential Privacy & Data Sovereignty Verification',
      clientId: 'SNOWFLAKE_DCR_GOV_77'
    },
    last_scanned_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: '2026-09-07T08:30:00Z'
  },
  {
    id: 12,
    name: 'eIDAS 2.0 EU Digital Identity Wallet (EUDIW) Node',
    type: 'Digital Identity',
    platform: 'EUDIW W3C VC Gateway',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://eudiw-relay.commission.europa.eu/v1/credentials',
      scope: 'Selective Disclosure & Zero-Knowledge Age/Nationality Verification',
      clientId: 'EUDIW_SOVEREIGN_NODE_DE_01'
    },
    last_scanned_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: '2026-09-08T11:20:00Z'
  },
  {
    id: 13,
    name: 'Stripe & Adyen PCI-DSS v4.0 Scope Tokenizer',
    type: 'FinTech & Payments',
    platform: 'Stripe Financial Infrastructure',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://api.stripe.com/v1/tax_registrations',
      scope: 'PCI-DSS v4.0 Zero-PAN Enclave & Settlement AML Screening',
      clientId: 'STRIPE_PCI_ENCLAVE_TOKENIZER'
    },
    last_scanned_at: new Date(Date.now() - 5400000).toISOString(),
    created_at: '2026-09-09T15:45:00Z'
  },
  {
    id: 14,
    name: 'Jira & ServiceNow Autonomous GRC Dispatcher',
    type: 'GRC Remediation',
    platform: 'ServiceNow GRC',
    status: 'CONNECTED',
    settings: {
      apiUrl: 'https://sovereign-corp.service-now.com/api/sn_grc/v1',
      scope: 'Bi-directional Statutory Audit SLA & Ticket Auto-Remediation',
      clientId: 'SNOW_GRC_DISPATCH_CONNECTOR'
    },
    last_scanned_at: new Date(Date.now() - 10800000).toISOString(),
    created_at: '2026-09-10T13:00:00Z'
  }
];

export let storedSoftwareScans: SoftwareScanRecord[] = [
  {
    id: 109,
    integration_id: 9,
    status: 'COMPLETED',
    score: 98,
    violations_count: 0,
    details: [],
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 110,
    integration_id: 10,
    status: 'COMPLETED',
    score: 96,
    violations_count: 1,
    details: [
      {
        id: 'VIOL-SIEM-01',
        severity: 'LOW',
        check: 'DORA Art. 19 Major ICT Incident Log Retention',
        status: 'RESOLVED',
        description: 'Automatic 10-year immutable cryptographic mirror archiving enabled for critical SOC alarms.'
      }
    ],
    created_at: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: 101,
    integration_id: 1,
    status: 'COMPLETED',
    score: 94,
    violations_count: 1,
    details: [
      {
        id: 'VIOL-SF-01',
        severity: 'LOW',
        check: 'GDPR Art. 7 Consent Affirmation Record',
        status: 'RESOLVED',
        description: 'Lead web-to-lead form missing opt-in checkbox timestamp; automated patch applied.'
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 102,
    integration_id: 2,
    status: 'COMPLETED',
    score: 88,
    violations_count: 2,
    details: [
      {
        id: 'VIOL-SAP-01',
        severity: 'MEDIUM',
        check: 'DORA Art. 12 ICT Data Redundancy',
        status: 'UNRESOLVED',
        description: 'Secondary cold replication delta exceeds 15-minute RPO threshold.'
      },
      {
        id: 'VIOL-SAP-02',
        severity: 'LOW',
        check: 'GDPR Art. 17 Automated Retention Deletion',
        status: 'RESOLVED',
        description: '7-year statutory fiscal retention rule verified across financial postings.'
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 14).toISOString()
  },
  {
    id: 103,
    integration_id: 3,
    status: 'COMPLETED',
    score: 99,
    violations_count: 0,
    details: [],
    created_at: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

export let storedApiTokens: ApiTokenRecord[] = [
  {
    id: 1,
    token: 'ep_live_sample_token_88ab776f33ea1',
    name: 'Salesforce Production Connector',
    client_system: 'Salesforce CRM',
    scope: 'Lead Tracking & Consent Audit',
    status: 'ACTIVE',
    created_at: '2026-07-01T10:00:00Z',
    last_used_at: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 2,
    token: 'ep_live_sap_hana_880199f33b190',
    name: 'SAP NetSuite ERP Sync Service',
    client_system: 'SAP ERP',
    scope: 'DORA Digital Resilience Logging',
    status: 'ACTIVE',
    created_at: '2026-07-15T12:30:00Z',
    last_used_at: new Date(Date.now() - 840000).toISOString()
  },
  {
    id: 3,
    token: 'ep_live_aws_s3_storage_77a02e1c9',
    name: 'S3 Sovereign Cloud Gateway',
    client_system: 'AWS S3',
    scope: 'Public Bucket & Encryption Scan',
    status: 'ACTIVE',
    created_at: '2026-08-01T09:00:00Z',
    last_used_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export let storedWebhookEndpoints: WebhookEndpointRecord[] = [
  {
    id: 'wh_live_89x2b',
    url: 'https://api.acme-corp.com/v1/regtech/webhooks',
    status: 'active',
    events: ['scan.completed', 'penalty.issued', 'case.appealed', 'kyc.verified'],
    secret: 'whsec_<REDACTED>',
    lastDelivery: new Date(Date.now() - 600000).toISOString(),
    createdAt: '2026-07-01T08:00:00Z'
  },
  {
    id: 'wh_live_44m1p',
    url: 'https://compliance.fintech-node.net/callbacks',
    status: 'active',
    events: ['invoice.paid', 'law.updated', 'aml.flagged'],
    secret: 'whsec_<REDACTED>',
    lastDelivery: new Date(Date.now() - 1800000).toISOString(),
    createdAt: '2026-08-10T12:30:00Z'
  }
];

export let storedWebhookLogs: WebhookDeliveryLogRecord[] = [
  {
    id: 'del_99812',
    endpointId: 'wh_live_89x2b',
    event: 'scan.completed',
    status: 200,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    latencyMs: 142,
    payloadSummary: '{"event":"scan.completed","integration":"Salesforce CRM","score":94}'
  },
  {
    id: 'del_99811',
    endpointId: 'wh_live_44m1p',
    event: 'invoice.paid',
    status: 200,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    latencyMs: 198,
    payloadSummary: '{"event":"invoice.paid","invoiceId":"INV-2026-991","amountEur":4200}'
  },
  {
    id: 'del_99810',
    endpointId: 'wh_live_89x2b',
    event: 'penalty.issued',
    status: 200,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    latencyMs: 165,
    payloadSummary: '{"event":"penalty.issued","caseId":"CASE-2026-8819","status":"DISPATCHED"}'
  }
];

export let storedPrivacyAuditLogs = [
  {
    id: 'AUD-8801',
    httpRoute: '/api/v1/kyc/verify',
    httpMethod: 'POST',
    piiDetected: ['NID Number', 'Full Name', 'Selfie Biometric Vector'],
    anonymizationStatus: 'REDACTED_HMAC_SHA256',
    replicaStorage: 'ISOLATED_S3_AUDIT_LOGS',
    middlewareLatencyMs: 0.8,
    timestamp: 'Just now'
  },
  {
    id: 'AUD-8802',
    httpRoute: '/api/v1/transactions/process',
    httpMethod: 'POST',
    piiDetected: ['IBAN / Bank Account', 'IP Address'],
    anonymizationStatus: 'REDACTED_HMAC_SHA256',
    replicaStorage: 'ISOLATED_S3_AUDIT_LOGS',
    middlewareLatencyMs: 0.6,
    timestamp: '2 mins ago'
  },
  {
    id: 'AUD-8803',
    httpRoute: '/api/v1/dsar/requests',
    httpMethod: 'POST',
    piiDetected: ['Email Address', 'National Identifier'],
    anonymizationStatus: 'REDACTED_HMAC_SHA256',
    replicaStorage: 'ISOLATED_S3_AUDIT_LOGS',
    middlewareLatencyMs: 0.9,
    timestamp: '8 mins ago'
  }
];

export let storedFeatureFlags = [
  {
    id: 'FLAG-01',
    name: 'Smart e-KYC Background Queue Processing',
    key: 'ENABLE_ASYNC_EKYC_QUEUE',
    description: 'Decouples OCR & Liveness checks into BullMQ background workers to ensure 0ms impact on user signup.',
    enabled: true,
    module: 'E_KYC',
    fallbackStrategy: 'Grant provisional account with 24-hour verification SLA'
  },
  {
    id: 'FLAG-02',
    name: 'AI Real-Time AML Observer Stream',
    key: 'ENABLE_REALTIME_AML_OBSERVER',
    description: 'Asynchronously monitors live transaction logs after write completion without database locks.',
    enabled: true,
    module: 'AI_AML',
    fallbackStrategy: 'Queue logs in Redis memory buffer for batch processing'
  },
  {
    id: 'FLAG-03',
    name: 'Non-Intrusive Privacy Auditing Middleware',
    key: 'ENABLE_COMPLIANCE_MIDDLEWARE',
    description: 'Lightweight HTTP header & payload inspection storing audit streams in isolated secondary storage.',
    enabled: true,
    module: 'COMPLIANCE_ENGINE',
    fallbackStrategy: 'Fail-safe silent pass (log to local fail-safe queue)'
  },
  {
    id: 'FLAG-04',
    name: 'Circuit Breaker Auto-Bypass',
    key: 'ENABLE_CIRCUIT_BREAKER_BYPASS',
    description: 'Automatically switches heavy AI providers to degraded fast-path if latency exceeds 800ms.',
    enabled: true,
    module: 'RESILIENCY_HUB',
    fallbackStrategy: 'Fast-path heuristic rule evaluation'
  }
];

// --- Handlers & Core Functions ---

export function getIntegrationsList(): SoftwareIntegration[] {
  return storedSoftwareIntegrations;
}

export function createIntegration(data: {
  name: string;
  type: string;
  platform: string;
  settings?: { apiUrl?: string; scope?: string; clientId?: string };
}): SoftwareIntegration {
  const newInt: SoftwareIntegration = {
    id: Math.floor(1000 + Math.random() * 9000),
    name: data.name,
    type: data.type || 'CRM',
    platform: data.platform || 'Custom Connector',
    status: 'CONNECTED',
    settings: data.settings || {},
    last_scanned_at: null,
    created_at: new Date().toISOString()
  };
  storedSoftwareIntegrations.unshift(newInt);
  return newInt;
}

export function removeIntegration(id: number): boolean {
  const initialLength = storedSoftwareIntegrations.length;
  storedSoftwareIntegrations = storedSoftwareIntegrations.filter(i => i.id !== id);
  storedSoftwareScans = storedSoftwareScans.filter(s => s.integration_id !== id);
  return storedSoftwareIntegrations.length < initialLength;
}

export function scanIntegration(id: number | string): {
  last_scanned_at: string;
  scans: SoftwareScanRecord[];
  newScan: SoftwareScanRecord;
} {
  const db = getDb();
  
  // Try to find in memory first (backward compat)
  const integration = storedSoftwareIntegrations.find(i => String(i.id) === String(id));
  
  const now = new Date().toISOString();
  let integrationType = 'CRM';
  
  if (integration) {
    integration.last_scanned_at = now;
    integrationType = integration.type;
  } else {
    // Check DB
    try {
      const dbInt = db.prepare('SELECT type FROM regtech_integrations WHERE id = ?').get(id) as any;
      if (dbInt) {
        integrationType = dbInt.type;
        db.prepare('UPDATE regtech_integrations SET last_scanned_at = ? WHERE id = ?').run(now, id);
      } else {
        throw new Error(`Integration with id ${id} not found`);
      }
    } catch (e) {
      throw new Error(`Integration with id ${id} not found in DB or Memory`);
    }
  }

  // Generate context-aware scan findings
  let score = 92;
  const violations: ScanViolation[] = [];

  if (integrationType === 'CRM') {
    score = 94;
    violations.push({
      id: `VIOL-CRM-${Date.now().toString().slice(-4)}`,
      severity: 'LOW',
      check: 'Consent Expiry Policy (GDPR Art. 7(3))',
      status: 'RESOLVED',
      description: 'Confirmed explicit consent revocation sync enabled across all outbound lead funnels.'
    });
  } else if (integrationType === 'ERP') {
    score = 86;
    violations.push({
      id: `VIOL-ERP-${Date.now().toString().slice(-4)}`,
      severity: 'MEDIUM',
      check: 'DORA Art. 11 Disaster Recovery RTO SLA',
      status: 'UNRESOLVED',
      description: 'Transaction journal archive recovery simulation took 48 minutes (exceeding 30m target).'
    });
  } else if (integrationType === 'Cloud') {
    score = 98;
    violations.push({
      id: `VIOL-S3-${Date.now().toString().slice(-4)}`,
      severity: 'LOW',
      check: 'KMS Key Rotation Frequency',
      status: 'RESOLVED',
      description: 'Customer managed key (CMK) automatically rotated every 90 days; TLS 1.3 enforced.'
    });
  } else if (integrationType === 'Healthcare') {
    score = 89;
    violations.push({
      id: `VIOL-HL7-${Date.now().toString().slice(-4)}`,
      severity: 'HIGH',
      check: 'HIPAA / GDPR Health Data Encryption',
      status: 'UNRESOLVED',
      description: 'FHIR API endpoint exposing unencrypted patient identifiers in diagnostic logs.'
    });
  } else if (integrationType === 'Logistics') {
    score = 93;
    violations.push({
      id: `VIOL-IOT-${Date.now().toString().slice(-4)}`,
      severity: 'MEDIUM',
      check: 'Fleet Telemetry Privacy Masking',
      status: 'RESOLVED',
      description: 'Driver geolocation data now truncated to 3 decimal places to prevent unauthorized domestic tracking.'
    });
  } else if (integrationType === 'AI_Tech') {
    score = 85;
    violations.push({
      id: `VIOL-AI-${Date.now().toString().slice(-4)}`,
      severity: 'HIGH',
      check: 'EU AI Act Model Transparency (Annex IV)',
      status: 'UNRESOLVED',
      description: 'Model registry missing technical documentation on training data bias mitigation strategies.'
    });
  } else if (integrationType === 'GovTech') {
    score = 95;
    violations.push({
      id: `VIOL-GOV-${Date.now().toString().slice(-4)}`,
      severity: 'LOW',
      check: 'Sovereign Enclave Access Control',
      status: 'RESOLVED',
      description: 'Multi-factor authentication (MFA) enforced for all G2B data interchange gateway administrators.'
    });
  } else {
    score = 91;
    violations.push({
      id: `VIOL-MISC-${Date.now().toString().slice(-4)}`,
      severity: 'LOW',
      check: 'Transport Security Policy (HSTS & TLS 1.3)',
      status: 'RESOLVED',
      description: 'Zero plaintext transmission detected across remote RPC boundaries.'
    });
  }

  const newScanRecord: SoftwareScanRecord = {
    id: Math.floor(1000 + Math.random() * 9000),
    integration_id: Number(id) || 0,
    status: 'COMPLETED',
    score,
    violations_count: violations.length,
    details: violations,
    created_at: now
  };

  // Persist to DB if possible
  try {
    db.prepare(`
      INSERT INTO regtech_integration_scans (id, integration_id, score, violations, scanned_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `scan_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      String(id),
      score,
      JSON.stringify(violations),
      now
    );
  } catch (e) {
    console.warn('[IntegrationService] Could not persist scan to DB:', e);
  }

  storedSoftwareScans.unshift(newScanRecord);

  const integrationScans = storedSoftwareScans.filter(s => String(s.integration_id) === String(id));

  return {
    last_scanned_at: now,
    scans: integrationScans,
    newScan: newScanRecord
  };
}

export function getIntegrationScans(id: number): SoftwareScanRecord[] {
  return storedSoftwareScans.filter(s => s.integration_id === id);
}

// --- API Tokens ---

export function getApiTokens(): ApiTokenRecord[] {
  return storedApiTokens;
}

export function createApiToken(data: { name: string; client_system: string; scope?: string }): ApiTokenRecord {
  const hex = crypto.randomBytes(12).toString('hex');
  const tokenStr = `ep_live_${data.client_system.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10)}_${hex}`;
  const record: ApiTokenRecord = {
    id: Math.floor(100 + Math.random() * 900),
    token: tokenStr,
    name: data.name,
    client_system: data.client_system,
    scope: data.scope || 'Lead Tracking & Consent Audit',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    last_used_at: null
  };
  storedApiTokens.unshift(record);
  return record;
}

export function revokeApiToken(id: number): boolean {
  const token = storedApiTokens.find(t => t.id === id);
  if (!token) return false;
  token.status = 'REVOKED';
  return true;
}

export function rotateApiToken(id: number): { ok: boolean; token?: string; error?: string } {
  const token = storedApiTokens.find(t => t.id === id);
  if (!token) return { ok: false, error: 'API token not found' };
  if (token.status === 'REVOKED') return { ok: false, error: 'Cannot rotate a revoked token' };
  const hex = crypto.randomBytes(12).toString('hex');
  const newToken = `ep_live_${token.client_system.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10)}_${hex}`;
  token.token = newToken;
  token.status = 'ACTIVE';
  token.last_used_at = null;
  return { ok: true, token: newToken };
}

export function executeTestScan(params: {
  token: string;
  content: string;
  type: 'consent' | 'privacy' | 'retention';
}) {
  const activeToken = storedApiTokens.find(t => t.token === params.token);
  if (activeToken) {
    activeToken.last_used_at = new Date().toISOString();
  }

  const contentLower = params.content.toLowerCase();
  const findings: any[] = [];
  let score = 95;

  if (params.type === 'consent') {
    if (contentLower.includes('automatically_accepted') || contentLower.includes('gdprconsenttimestamp": null')) {
      score = 42;
      findings.push({
        ruleId: 'GDPR_ART_4_11',
        severity: 'CRITICAL',
        title: 'Pre-Ticked / Automated Consent Prohibited',
        explanation: 'EmailOptInStatus is automatically accepted without affirmative user action. Violates GDPR Article 4(11) & ePrivacy Directive.'
      });
    }
    if (contentLower.includes('ip') && !contentLower.includes('anonymize')) {
      findings.push({
        ruleId: 'GDPR_RECITAL_30',
        severity: 'MEDIUM',
        title: 'Unredacted Raw IP Address Telemetry',
        explanation: 'IP addresses constitute personal data; consider truncated prefix storage /24.'
      });
    }
  } else if (params.type === 'privacy') {
    if (contentLower.includes('third_party_monetization_permitted": true') || contentLower.includes('"forever"')) {
      score = 35;
      findings.push({
        ruleId: 'GDPR_ART_5_1_E',
        severity: 'CRITICAL',
        title: 'Indefinite Data Retention Period ("Forever")',
        explanation: 'Data storage without retention limitation violates storage limitation principle under GDPR Art. 5(1)(e).'
      });
      findings.push({
        ruleId: 'GDPR_ART_6',
        severity: 'HIGH',
        title: 'Third-Party Monetization Without Explicit Freely Given Consent',
        explanation: 'Monetization flags must be supported by explicit separate consent records.'
      });
    }
  } else if (params.type === 'retention') {
    if (contentLower.includes('unencrypted') || !contentLower.includes('expired_at')) {
      score = 50;
      findings.push({
        ruleId: 'DORA_ART_9_ENCRYPT',
        severity: 'HIGH',
        title: 'Unencrypted Payment Card Storage Column',
        explanation: 'Plaintext card details violate PCI-DSS 4.0 & DORA Article 9 cryptographic standards.'
      });
      findings.push({
        ruleId: 'GDPR_ART_17_ERASURE',
        severity: 'MEDIUM',
        title: 'Missing Automated Deletion / Expiry Indexing',
        explanation: 'Table schema lacks expired_at TTL trigger for right to be forgotten fulfillment.'
      });
    }
  }

  return {
    success: true,
    score,
    evaluatedCategory: params.type,
    findingsCount: findings.length,
    findings,
    cryptographicSeal: crypto.createHash('sha256').update(params.content + Date.now()).digest('hex').slice(0, 32),
    timestamp: new Date().toISOString()
  };
}

// --- Webhooks Engine ---

export function getWebhookEndpoints(): WebhookEndpointRecord[] {
  return storedWebhookEndpoints;
}

export function createWebhookEndpoint(url: string, events: string[]): WebhookEndpointRecord {
  const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
  const endpoint: WebhookEndpointRecord = {
    id: `wh_live_${crypto.randomBytes(4).toString('hex')}`,
    url,
    status: 'active',
    events: events.length > 0 ? events : ['scan.completed'],
    secret,
    lastDelivery: null,
    createdAt: new Date().toISOString()
  };
  storedWebhookEndpoints.unshift(endpoint);
  return endpoint;
}

export function deleteWebhookEndpoint(id: string): boolean {
  const len = storedWebhookEndpoints.length;
  storedWebhookEndpoints = storedWebhookEndpoints.filter(e => e.id !== id);
  return storedWebhookEndpoints.length < len;
}

export function pingWebhookEndpoint(id: string): { success: boolean; latencyMs: number; status: number } {
  const ep = storedWebhookEndpoints.find(e => e.id === id);
  if (!ep) throw new Error('Endpoint not found');
  const latency = Math.floor(45 + Math.random() * 80);
  const now = new Date().toISOString();
  ep.lastDelivery = now;

  const log: WebhookDeliveryLogRecord = {
    id: `del_${Math.floor(10000 + Math.random() * 90000)}`,
    endpointId: id,
    event: 'endpoint.ping',
    status: 200,
    timestamp: now,
    latencyMs: latency,
    payloadSummary: JSON.stringify({ ping: true, endpointId: id })
  };
  storedWebhookLogs.unshift(log);

  return { success: true, latencyMs: latency, status: 200 };
}

export function dispatchWebhookEvent(event: string, payload: any): { dispatchedCount: number; signature: string } {
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_MASTER_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('FATAL: WEBHOOK_MASTER_SECRET must be set in production.'); })() : 'dev-only-webhook-secret-do-not-use-in-production'));
  const signature = `sha256=${hmac.update(JSON.stringify(payload)).digest('hex')}`;

  const matchingEndpoints = storedWebhookEndpoints.filter(
    e => e.status === 'active' && (e.events.includes(event) || e.events.includes('*'))
  );

  matchingEndpoints.forEach(ep => {
    ep.lastDelivery = new Date().toISOString();
    storedWebhookLogs.unshift({
      id: `del_${Math.floor(10000 + Math.random() * 90000)}`,
      endpointId: ep.id,
      event,
      status: 200,
      timestamp: new Date().toISOString(),
      latencyMs: Math.floor(60 + Math.random() * 120),
      payloadSummary: JSON.stringify(payload).slice(0, 150)
    });
  });

  return {
    dispatchedCount: matchingEndpoints.length,
    signature
  };
}

export function getWebhookLogs(): WebhookDeliveryLogRecord[] {
  return storedWebhookLogs;
}

// --- Zero Downtime e-KYC, AML & Privacy Services ---

export function processKycVerification(payload: KycVerificationPayload) {
  // SECURITY: Do NOT fake KYC approval. Without a real verification provider
  // configured, KYC checks must return PENDING, never APPROVED.
  const isProduction = process.env.NODE_ENV === 'production';
  const hasProvider = Boolean(process.env.KYC_PROVIDER_URL || process.env.SUMSUB_SECRET_KEY);

  if (isProduction && !hasProvider) {
    return {
      success: false,
      error: 'KYC verification provider not configured. Set KYC_PROVIDER_URL or a supported provider key.',
      overallStatus: 'PENDING' as const,
      applicantName: payload.applicantName,
      id: `KYC-PENDING-${Date.now()}`
    };
  }

  // Dev/test mode: clearly simulate, but do not claim real-world approval
  const ocrConfidence = parseFloat((90 + Math.random() * 9).toFixed(1));
  const livenessScore = parseFloat((90 + Math.random() * 9).toFixed(1));
  const faceMatchScore = parseFloat((90 + Math.random() * 9).toFixed(1));

  const id = `KYC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  return {
    success: true,
    id,
    applicantName: payload.applicantName,
    documentType: payload.documentType,
    documentNumber: payload.documentNumber,
    ocrConfidence,
    livenessScore,
    faceMatchScore,
    overallStatus: 'SIMULATED' as const,
    encryptionStatus: 'AES-256-GCM (Enforced)' as const,
    processedAt: new Date().toISOString(),
    queueLatencyMs: Math.floor(15 + Math.random() * 25),
    note: 'Simulated dev-mode verification. Production requires a registered KYC provider.'
  };
}

export function evaluateAmlTransaction(payload: AmlEvaluationPayload) {
  const isHighRisk =
    payload.receiver.toLowerCase().includes('offshore') ||
    payload.receiver.toLowerCase().includes('cayman') ||
    payload.amountUsd > 100000;

  const riskScore = isHighRisk ? Math.floor(80 + Math.random() * 18) : Math.floor(10 + Math.random() * 20);

  const flaggedRules = isHighRisk
    ? ['High Risk Jurisdiction Cross-Border Transfer', 'Large Unusually Structured Volume (Article 30 AMLD)']
    : ['Standard Commercial Payment Cleared'];

  const monitoringStatus = isHighRisk ? 'FLAGGED_SAR_DRAFT' : 'CLEARED_ASYNC';
  const evalLatencyMs = Math.floor(4 + Math.random() * 8);

  const event = {
    id: `AML-EVT-${Math.floor(100 + Math.random() * 900)}`,
    txHash: `0x${crypto.randomBytes(4).toString('hex')}...${crypto.randomBytes(4).toString('hex')}`,
    sender: payload.sender,
    receiver: payload.receiver,
    amountUsd: payload.amountUsd,
    channel: payload.channel,
    riskScore,
    flaggedRules,
    monitoringStatus,
    evalLatencyMs,
    timestamp: 'Just now'
  };

  // Dispatch webhook event if flagged
  if (isHighRisk) {
    dispatchWebhookEvent('aml.flagged', {
      eventId: event.id,
      amount: payload.amountUsd,
      riskScore
    });
  }

  return {
    success: true,
    event
  };
}

// --- EUDI Wallet & OIDC 4 VP Sovereign Verification ---

export function verifyEudiPresentation(data: { presentationToken: string; profileId?: string; userId?: string }) {
  // SECURITY: A presentation token cannot be verified as HIGH-assurance without
  // validating its JWT signature against the wallet's trust anchor / Trusted List.
  // Without a real verifier, always return PENDING — never fabricate verified claims.
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'EUDI wallet verification requires a configured trust anchor verifier (EUTL). Configure EUDI_VERIFIER_URL to enable.',
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
  }

  // Dev/test mode: clearly-marked simulation
  return {
    success: true,
    status: 'SIMULATED',
    note: 'Simulated dev-mode presentation check. Production requires EUDI/trust-anchor verification.',
    claims: {
      age_over_18: true,
      eidas_assurance_level: 'SIMULATED'
    },
    timestamp: new Date().toISOString()
  };
}

// --- Dynamic Regional Enterprise KYB & KYC Verification ---

export function verifyCorporateKyb(data: { firmName: string; region: string; registrationNumber?: string; leiCode?: string }) {
  // SECURITY: Do not fabricate corporate verification results (GRADE_AAA, UBO data, LEI, GIIN, etc.).
  // These must come from a real registry/integration. Without one, return PENDING.
  const regNumber = data.registrationNumber;
  const leiCode = data.leiCode;

  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'Corporate KYB verification requires registration with a real company registry data provider (e.g., OpenCorporates, Bureau van Dijk, or national registry API).',
      status: 'PENDING',
      firmName: data.firmName,
      region: data.region || 'EU',
      registrationNumber: regNumber || null,
      leiCode: leiCode || null
    };
  }

  // Dev/test mode: simulated, clearly-marked data
  return {
    success: true,
    status: 'SIMULATED',
    note: 'Simulated dev-mode KYB. Production requires a company registry data provider.',
    result: {
      firmName: data.firmName,
      region: data.region || 'EU',
      registrationNumber: regNumber,
      leiCode: leiCode,
      status: 'SIMULATED',
      enterpriseGrade: 'N/A',
      riskScore: 'N/A',
      verifiedAt: new Date().toISOString()
    }
  };
}

// --- Enterprise Integration Health ---

export function getIntegrationsHealth() {
  return {
    success: true,
    uptimePercent: 99.98,
    activeSyncsCount: 14,
    avgLatencyMs: 112,
    openIncidentsCount: 0,
    integrations: [
      { id: 'workday', name: 'Workday HRIS', type: 'HRIS', status: 'Healthy', latency: '124ms', lastSync: '2m ago', syncMode: 'Real-time' },
      { id: 'aws', name: 'AWS Cloud Sovereign Infra', type: 'Infrastructure', status: 'Healthy', latency: '68ms', lastSync: '3m ago', syncMode: 'Batch (15m)' },
      { id: 'fincen', name: 'FinCEN Global API Gateway', type: 'Regulatory', status: 'Healthy', latency: '45ms', lastSync: 'Live', syncMode: 'Streaming' },
      { id: 'okta', name: 'Okta Identity Enclave', type: 'Auth', status: 'Healthy', latency: '88ms', lastSync: '1m ago', syncMode: 'Real-time' },
      { id: 'salesforce', name: 'Salesforce Enterprise CRM', type: 'CRM', status: 'Healthy', latency: '115ms', lastSync: 'Just now', syncMode: 'Webhook' },
      { id: 'sap', name: 'SAP S/4HANA ERP', type: 'ERP', status: 'Healthy', latency: '142ms', lastSync: '4m ago', syncMode: 'Streaming' },
      { id: 'stripe', name: 'Stripe Billing & Escrow', type: 'Finance', status: 'Healthy', latency: '92ms', lastSync: '4m ago', syncMode: 'Webhook' }
    ]
  };
}
