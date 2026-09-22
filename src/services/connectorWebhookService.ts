/**
 * Real-time Third-Party Connector Webhook Ingestion Engine
 * Handles inbound security triggers from AWS S3, Cloudflare, and GitHub
 * Automatically maps events to Sovereign Compliance Findings & Remediation pipeline
 */

import crypto from 'node:crypto';
import { RemediationService } from '../server/remediationService.js';
import { dispatchWebhookEvent } from '../server/integrationsService.js';

export interface ThirdPartyWebhookPayload {
  source: 'AWS_S3' | 'CLOUDFLARE' | 'GITHUB';
  eventType: string;
  timestamp: string;
  data: any;
  signature?: string;
}

export interface IngestionResult {
  success: boolean;
  incidentId: string;
  source: string;
  status: 'REMEDIATION_INGESTED' | 'POLICY_VIOLATION_RECORDED' | 'BLOCKED_BY_FIREWALL';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  remediationTitle: string;
  details: string;
}

export class ConnectorWebhookService {
  private static instance: ConnectorWebhookService;

  private constructor() {}

  public static getInstance(): ConnectorWebhookService {
    if (!ConnectorWebhookService.instance) {
      ConnectorWebhookService.instance = new ConnectorWebhookService();
    }
    return ConnectorWebhookService.instance;
  }

  public handleAwsS3Trigger(body: any): IngestionResult {
    const bucket = body.bucket || body.Records?.[0]?.s3?.bucket?.name || 'sovereign-production-vault';
    const objectKey = body.key || body.Records?.[0]?.s3?.object?.key || 'data/export.csv';
    const isPublic = body.isPublic || body.acl?.includes('public') || false;
    const isUnencrypted = body.unencrypted || (body.encryption === 'NONE') || false;

    const incidentId = `AWS-S3-EVT-${Date.now().toString().slice(-6)}`;
    const severity = isPublic ? 'CRITICAL' : isUnencrypted ? 'HIGH' : 'MEDIUM';
    const title = isPublic
      ? `Public S3 Bucket ACL Exposure Detected: ${bucket}`
      : `Unencrypted S3 Object Upload: ${objectKey}`;

    // Push into remediation queue
    RemediationService.ingestScanFindings([{
      company_id: 'comp-101',
      title,
      category: 'ACCESS_CONTROL',
      severity: (severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH') as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      issue: `Real-time AWS CloudTrail / S3 Event Notification received for bucket [${bucket}], key [${objectKey}]. Security violation: ${isPublic ? 'Public read access enabled' : 'Server-side encryption (KMS) missing'}.`,
      statute: 'GDPR Art. 32 & NIS2 Art. 21',
      recommended_fix: `1. Enforce AWS S3 Block Public Access\n2. Apply SSE-KMS Customer-Managed Key (CMK) encryption policy\n3. Audit access logs for unauthorized reads under GDPR Art 32.`,
      code_snippet: `aws s3api put-bucket-encryption --bucket ${bucket} --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}}]}'`,
      auto_fixable: true
    }]);

    dispatchWebhookEvent('connector.s3.violation', { incidentId, bucket, objectKey, severity, title });

    return {
      success: true,
      incidentId,
      source: 'AWS_S3',
      status: 'REMEDIATION_INGESTED',
      severity,
      remediationTitle: title,
      details: `Enforced remediation ingest for AWS S3 bucket: ${bucket}`
    };
  }

  public handleCloudflareTrigger(body: any): IngestionResult {
    const zone = body.zone || '9xen.eu';
    const attackType = body.attackType || body.rule_name || 'WAF Rate Limit Exceeded & DDoS Spike';
    const clientIp = body.clientIp || body.ip || '198.51.100.42';
    const incidentId = `CF-WAF-EVT-${Date.now().toString().slice(-6)}`;

    const title = `Cloudflare Edge WAF Violation: ${attackType} on ${zone}`;

    RemediationService.ingestScanFindings([{
      company_id: 'comp-101',
      title,
      category: 'SECURITY_HEADERS',
      severity: 'HIGH',
      issue: `Cloudflare Logpush / Webhook notification triggered. Host: ${zone}, Source IP: ${clientIp}. Pattern flagged under NIS2 Art. 21 cyber risk-management measures.`,
      statute: 'NIS2 Art. 21 & ISO 27001 A.12',
      recommended_fix: `1. Blacklist offending IP/ASN at edge\n2. Update Cloudflare Managed Ruleset to strict block\n3. File automated NIS2 cyber incident log.`,
      code_snippet: `cf-cli waf rule create --zone ${zone} --action block --ip ${clientIp}`,
      auto_fixable: true
    }]);

    dispatchWebhookEvent('connector.cloudflare.waf', { incidentId, zone, clientIp, title });

    return {
      success: true,
      incidentId,
      source: 'CLOUDFLARE',
      status: 'REMEDIATION_INGESTED',
      severity: 'HIGH',
      remediationTitle: title,
      details: `Edge threat ingested and remediation rule generated for ${zone}`
    };
  }

  public handleGitHubTrigger(body: any): IngestionResult {
    const repository = body.repository?.full_name || body.repo || 'sovereign-core/compliance-engine';
    const alert = body.alert || body.security_advisory || {};
    const packageInfo = alert.package?.name || body.dependency || 'jsonwebtoken';
    const cve = alert.cve_id || body.cve || 'CVE-2026-4412';
    const incidentId = `GH-SEC-EVT-${Date.now().toString().slice(-6)}`;

    const title = `GitHub Dependabot/CodeQL Vulnerability: ${packageInfo} (${cve}) in ${repository}`;

    RemediationService.ingestScanFindings([{
      company_id: 'comp-101',
      title,
      category: 'VENDOR_RISK',
      severity: 'CRITICAL',
      issue: `GitHub security alert webhook received. Repository: ${repository}, Vulnerable Dependency: ${packageInfo}, Advisory ID: ${cve}. High probability of remote exploitation violating DORA Article 9.`,
      statute: 'DORA Art. 9 & NIS2 Art. 21',
      recommended_fix: `1. Bump dependency ${packageInfo} to patched version\n2. Execute regression test suite in sandbox\n3. Push automated security patch commit.`,
      code_snippet: `npm update ${packageInfo} --depth 2 && npm audit fix`,
      auto_fixable: false
    }]);

    dispatchWebhookEvent('connector.github.advisory', { incidentId, repository, packageInfo, cve, title });

    return {
      success: true,
      incidentId,
      source: 'GITHUB',
      status: 'REMEDIATION_INGESTED',
      severity: 'CRITICAL',
      remediationTitle: title,
      details: `Vulnerability alert dispatched to remediation queue for repository: ${repository}`
    };
  }
}

export const connectorWebhookService = ConnectorWebhookService.getInstance();
