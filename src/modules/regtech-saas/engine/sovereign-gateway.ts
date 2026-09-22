import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';
import { getPublicEndpoints } from '../../../config/publicUrlConfig';
const db = {
  prepare: (query: string) => getDb().prepare(query),
  transaction: (fn: any) => getDb().transaction(fn),
  exec: (sql: string) => getDb().exec(sql)
};

export interface DataClassification {
  contains_pii: boolean;
  contains_financial: boolean;
  contains_health: boolean;
  contains_government: boolean;
  sensitivity_level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'HIGHLY_REGULATED';
  detected_entities: string[];
}

export interface ResidencyRoutingDecision {
  targetRegion: string;
  endpointUrl: string;
  endpointType: 'managed' | 'client_sandbox';
  enforcement: 'strict' | 'soft';
  complianceBasis: string;
  dataClassification: DataClassification;
  isViolationAttempt: boolean;
  violationDetails?: string;
  requestId: string;
}

export interface ResidencyPolicy {
  id: string;
  org_id: string;
  data_category: 'pii' | 'financial' | 'health' | 'government' | 'default';
  allowed_region: string;
  enforcement: 'strict' | 'soft';
  active: number;
}

/**
 * Classifies data sensitivity and regulatory category
 */
export function classifyData(payloadText: string): DataClassification {
  const text = payloadText || '';
  const detectedEntities: string[] = [];

  // PII detection
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasSSN = /\b\d{3}-\d{2}-\d{4}\b/.test(text);
  if (hasEmail) detectedEntities.push('Email Address');
  if (hasPhone) detectedEntities.push('Phone Number');
  if (hasSSN) detectedEntities.push('National ID/SSN');
  const contains_pii = hasEmail || hasPhone || hasSSN;

  // Financial detection
  const hasCard = /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/.test(text);
  const hasIban = /[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}/.test(text);
  const hasFinancialTerms = /\b(bank account|routing number|transaction amount|credit balance|wire transfer|swift code)\b/i.test(text);
  if (hasCard) detectedEntities.push('Payment Card Number');
  if (hasIban) detectedEntities.push('IBAN Identifier');
  if (hasFinancialTerms) detectedEntities.push('Banking Transaction Terms');
  const contains_financial = hasCard || hasIban || hasFinancialTerms;

  // Health / PHI detection
  const hasHealthTerms = /\b(patient diagnosis|icd-10|prescription|medical history|blood pressure|dosage|clinical trial|treatment plan|pathology)\b/i.test(text);
  if (hasHealthTerms) detectedEntities.push('Protected Health Information (PHI)');
  const contains_health = hasHealthTerms;

  // Government / Classified detection
  const hasGovTerms = /\b(security clearance|classified|official secret act|top secret|ministry of defense|statutory notice)\b/i.test(text);
  if (hasGovTerms) detectedEntities.push('Sovereign/Government Classified');
  const contains_government = hasGovTerms;

  let sensitivity_level: DataClassification['sensitivity_level'] = 'PUBLIC';
  if (contains_government || (contains_health && contains_pii)) {
    sensitivity_level = 'HIGHLY_REGULATED';
  } else if (contains_financial || contains_health || contains_pii) {
    sensitivity_level = 'CONFIDENTIAL';
  } else if (text.length > 50) {
    sensitivity_level = 'INTERNAL';
  }

  return {
    contains_pii,
    contains_financial,
    contains_health,
    contains_government,
    sensitivity_level,
    detected_entities: detectedEntities
  };
}

/**
 * MODULE 3: Sovereign Data Gateway & Regional Router
 * Evaluates residency requirements and routes requests to the legally mandated regional inference node.
 */
export async function routeRequest(
  orgId: string,
  requestPayload: string,
  explicitRegionPreference?: string
): Promise<ResidencyRoutingDecision> {
  const requestId = `res_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const classification = classifyData(requestPayload);

  // 1. Fetch active Residency Policies for Organization
  let policies: ResidencyPolicy[] = [];
  try {
    policies = db.prepare(`
      SELECT * FROM regtech_residency_policies 
      WHERE org_id = ? AND active = 1
    `).all(orgId) as ResidencyPolicy[];
  } catch (err) {
    console.warn('[SOVEREIGN_GATEWAY] Policy load notice:', err);
  }

  // 2. Fetch Org default country
  let orgCountry = 'EU';
  try {
    const org = db.prepare(`SELECT country_code FROM regtech_organizations WHERE id = ?`).get(orgId) as any;
    if (org?.country_code) orgCountry = org.country_code;
  } catch {}

  // Match policy category
  let matchedPolicy: ResidencyPolicy | undefined;
  if (classification.contains_government) {
    matchedPolicy = policies.find(p => p.data_category === 'government');
  } else if (classification.contains_health) {
    matchedPolicy = policies.find(p => p.data_category === 'health');
  } else if (classification.contains_financial) {
    matchedPolicy = policies.find(p => p.data_category === 'financial');
  } else if (classification.contains_pii) {
    matchedPolicy = policies.find(p => p.data_category === 'pii');
  }

  if (!matchedPolicy) {
    matchedPolicy = policies.find(p => p.data_category === 'default');
  }

  let targetRegion = 'eu-central-1';
  let enforcement: 'strict' | 'soft' = 'strict';
  let complianceBasis = 'Default Sovereign Regional Route';

  if (matchedPolicy) {
    targetRegion = matchedPolicy.allowed_region;
    enforcement = matchedPolicy.enforcement;
    complianceBasis = `Org Policy: ${matchedPolicy.data_category.toUpperCase()} bound to [${matchedPolicy.allowed_region}]`;
  } else if (orgCountry === 'BD') {
    targetRegion = 'bd-local';
    complianceBasis = 'Global Region Bank & ICT Act Sovereign Enclave';
  } else if (orgCountry === 'DE' || orgCountry === 'EU') {
    targetRegion = 'eu-central-1';
    complianceBasis = 'EU GDPR Chapter V Sovereign Enclave (Frankfurt)';
  } else if (orgCountry === 'IN') {
    targetRegion = 'ap-south-1';
    complianceBasis = 'India DPDP Act Sovereign Cloud (Mumbai)';
  } else {
    targetRegion = explicitRegionPreference || 'eu-central-1';
    complianceBasis = 'Standard Regional Inference Proxy';
  }

  // Check if cross-border transfer violation occurred
  let isViolationAttempt = false;
  let violationDetails: string | undefined = undefined;
  if (explicitRegionPreference && explicitRegionPreference !== targetRegion && enforcement === 'strict' && classification.sensitivity_level === 'HIGHLY_REGULATED') {
    isViolationAttempt = true;
    violationDetails = `Blocked attempt to egress ${classification.sensitivity_level} data to unauthorized region '${explicitRegionPreference}'. Enforcing '${targetRegion}'.`;
  }

  // Resolve endpoint URL
  let endpointUrl = `https://${targetRegion}.inference.${getPublicEndpoints().baseDomain}/v1`;
  let endpointType: 'managed' | 'client_sandbox' = 'managed';

  try {
    const endpointRec = db.prepare(`
      SELECT * FROM regtech_regional_endpoints WHERE region = ?
    `).get(targetRegion) as any;
    if (endpointRec) {
      endpointUrl = endpointRec.endpoint_url;
      endpointType = endpointRec.endpoint_type;
    }
  } catch {}

  // 3. Write Tamper-Evident Hash-Chained Audit Record
  logResidencyAudit(orgId, requestId, classification, targetRegion, complianceBasis);

  return {
    targetRegion,
    endpointUrl,
    endpointType,
    enforcement,
    complianceBasis,
    dataClassification: classification,
    isViolationAttempt,
    violationDetails,
    requestId
  };
}

/**
 * Appends entry to tamper-evident hash-chained residency audit ledger
 */
export function logResidencyAudit(
  orgId: string,
  requestId: string,
  classification: DataClassification,
  targetRegion: string,
  complianceBasis: string
) {
  setImmediate(() => {
    try {
      // Get previous entry's hash
      const prevEntry = db.prepare(`
        SELECT hash_chain FROM regtech_residency_audit_logs 
        WHERE org_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(orgId) as any;

      const prevHash = prevEntry?.hash_chain || 'GENESIS_SOVEREIGN_ROOT_00000000000000000000';
      const entryPayload = `${prevHash}|${orgId}|${requestId}|${targetRegion}|${JSON.stringify(classification)}|${Date.now()}`;
      const hashChain = crypto.createHash('sha256').update(entryPayload).digest('hex');

      const logId = `reslog_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      db.prepare(`
        INSERT INTO regtech_residency_audit_logs 
        (id, org_id, request_id, data_classification, target_region, compliance_basis, hash_chain)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        orgId,
        requestId,
        JSON.stringify(classification),
        targetRegion,
        complianceBasis,
        hashChain
      );
    } catch (err) {
      console.error('[SOVEREIGN_GATEWAY] Audit log write error:', err);
    }
  });
}
