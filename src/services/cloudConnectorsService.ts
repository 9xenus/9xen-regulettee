/**
 * Cloud & Infrastructure Webhook Orchestrator Service
 * Connects AWS S3 bucket audit events, Cloudflare zero-trust edge alerts,
 * and GitHub Dependabot / secret leak security triggers directly into compliance posture.
 */

export interface InfrastructureConnector {
  id: string;
  provider: 'AWS_S3' | 'CLOUDFLARE' | 'GITHUB';
  name: string;
  endpointUrl: string;
  secretHash: string;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
  lastPingAt: string;
  totalEventsProcessed: number;
  threatsIntercepted: number;
}

export interface IngestedWebhookEvent {
  id: string;
  connectorId: string;
  provider: 'AWS_S3' | 'CLOUDFLARE' | 'GITHUB';
  eventType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  summary: string;
  rawPayloadSample: any;
  remediationTriggered: boolean;
  receivedAt: string;
}

export class CloudConnectorsService {
  private static instance: CloudConnectorsService;
  private connectors: InfrastructureConnector[] = [];
  private eventLogs: IngestedWebhookEvent[] = [];

  private constructor() {
    this.seedInitialConnectors();
  }

  public static getInstance(): CloudConnectorsService {
    if (!CloudConnectorsService.instance) {
      CloudConnectorsService.instance = new CloudConnectorsService();
    }
    return CloudConnectorsService.instance;
  }

  private seedInitialConnectors() {
    this.connectors = [
      {
        id: 'CONN-AWS-S3',
        provider: 'AWS_S3',
        name: 'AWS S3 CloudTrail Bucket Access & Public Policy Monitor',
        endpointUrl: '/api/v1/connectors/webhooks/aws-s3',
        secretHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        status: 'ACTIVE',
        lastPingAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        totalEventsProcessed: 1420,
        threatsIntercepted: 18
      },
      {
        id: 'CONN-CF-ZERO-TRUST',
        provider: 'CLOUDFLARE',
        name: 'Cloudflare Zero-Trust & WAF Security Event Ingress',
        endpointUrl: '/api/v1/connectors/webhooks/cloudflare',
        secretHash: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        status: 'ACTIVE',
        lastPingAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        totalEventsProcessed: 9840,
        threatsIntercepted: 142
      },
      {
        id: 'CONN-GH-SECURITY',
        provider: 'GITHUB',
        name: 'GitHub Dependabot & Secret Scanning Webhook',
        endpointUrl: '/api/v1/connectors/webhooks/github',
        secretHash: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        status: 'ACTIVE',
        lastPingAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        totalEventsProcessed: 430,
        threatsIntercepted: 6
      }
    ];

    this.eventLogs = [
      {
        id: 'EVT-CF-901',
        connectorId: 'CONN-CF-ZERO-TRUST',
        provider: 'CLOUDFLARE',
        eventType: 'waf.block.sql_injection',
        severity: 'HIGH',
        summary: 'Cloudflare WAF blocked SQL Injection probe against /api/v1/regulatory/query',
        rawPayloadSample: { clientIP: '198.51.100.44', ruleId: '100001_OWASP_CRS', action: 'block' },
        remediationTriggered: true,
        receivedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      },
      {
        id: 'EVT-AWS-404',
        connectorId: 'CONN-AWS-S3',
        provider: 'AWS_S3',
        eventType: 's3.PutBucketPolicy.public_access_blocked',
        severity: 'MEDIUM',
        summary: 'AWS S3 Block Public Access verified on bucket: regtech-audit-evidence-vault',
        rawPayloadSample: { bucket: 'regtech-audit-evidence-vault', blockPublicAcls: true, status: 'ENFORCED' },
        remediationTriggered: false,
        receivedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString()
      },
      {
        id: 'EVT-GH-102',
        connectorId: 'CONN-GH-SECURITY',
        provider: 'GITHUB',
        eventType: 'secret_scanning.alert_resolved',
        severity: 'INFO',
        summary: 'GitHub Secret Scanning: Key rotation confirmed for test credentials',
        rawPayloadSample: { secretType: 'google_genai_key_mock', resolution: 'revoked' },
        remediationTriggered: true,
        receivedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      }
    ];
  }

  public getConnectors(): InfrastructureConnector[] {
    return this.connectors;
  }

  public getRecentEvents(): IngestedWebhookEvent[] {
    return this.eventLogs;
  }

  public ingestWebhook(provider: 'AWS_S3' | 'CLOUDFLARE' | 'GITHUB', payload: any): IngestedWebhookEvent {
    const connector = this.connectors.find(c => c.provider === provider) || this.connectors[0];
    const newEvent: IngestedWebhookEvent = {
      id: `EVT-${provider.substring(0, 2)}-${Date.now()}`,
      connectorId: connector.id,
      provider,
      eventType: payload.event || payload.action || 'telemetry.alert',
      severity: payload.severity || 'MEDIUM',
      summary: payload.summary || `Ingested realtime security alert from ${provider}`,
      rawPayloadSample: payload,
      remediationTriggered: true,
      receivedAt: new Date().toISOString()
    };

    connector.totalEventsProcessed += 1;
    connector.lastPingAt = newEvent.receivedAt;
    if (newEvent.severity === 'HIGH' || newEvent.severity === 'CRITICAL') {
      connector.threatsIntercepted += 1;
    }

    this.eventLogs.unshift(newEvent);
    if (this.eventLogs.length > 50) this.eventLogs.pop();

    return newEvent;
  }
}

export const cloudConnectorsService = CloudConnectorsService.getInstance();
