import crypto from 'crypto';

/**
 * EU Policy Compliance SaaS
 * Module: Real-Time Notification & Alerting Dispatcher
 * 
 * Purpose: A centralized, multi-channel notification router supporting priority 
 * queues (SMTP, Slack, WebSockets) with an ingrained PII-scrubbing privacy guard.
 */

export type AlertPriority = 'CRITICAL' | 'HIGH' | 'LOW';
export type Channel = 'EMAIL' | 'SLACK' | 'WEBSOCKET' | 'WEBHOOK';

export interface AlertPayload {
  tenantId: string;
  priority: AlertPriority;
  category: 'DRIFT_DETECTED' | 'MALWARE_QUARANTINE' | 'COMPLIANCE_SCORE_DROP';
  rawMessage: string;
  metadata: Record<string, any>;
  targetChannels: Channel[];
}

export class NotificationDispatcher {
  
  // Basic Regex for PII Scrubbing (Emails, EU Phone numbers, IP Addresses, basic EU IBANs)
  private readonly PII_REGEX_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,               // Emails
    /\b(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}\b/g,                 // FR Phones (Example)
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,                           // IPv4
    /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g                                  // IBAN
  ];

  /**
   * Middleware: Privacy Guard PII Scrubber
   * Redacts sensitive data before transiting non-sovereign channels (e.g. Slack).
   */
  private scrubPII(text: string): string {
    let sanitizedText = text;
    this.PII_REGEX_PATTERNS.forEach(pattern => {
      sanitizedText = sanitizedText.replace(pattern, '[REDACTED_PII]');
    });
    return sanitizedText;
  }

  /**
   * Dispatches an alert to the requested channels. Validates routing priorities.
   */
  public async dispatch(alert: AlertPayload): Promise<void> {
    console.log(`[Dispatcher] Routing ${alert.priority} alert for Tenant ${alert.tenantId}`);

    // If channel is external/third-party, scrub PII unconditionally.
    const requiresScrubbing = alert.targetChannels.some(c => c === 'SLACK' || c === 'EMAIL');
    const safeMessage = requiresScrubbing ? this.scrubPII(alert.rawMessage) : alert.rawMessage;

    const dispatchPromises = alert.targetChannels.map(channel => {
      switch (channel) {
        case 'EMAIL':
          return this.sendEmail(alert.tenantId, safeMessage, alert.priority);
        case 'SLACK':
          return this.sendSlackWebhook(alert.tenantId, safeMessage, alert.priority);
        case 'WEBSOCKET':
          return this.pushToWebSocketClient(alert.tenantId, alert.rawMessage); // Internal socket, PII safe
        case 'WEBHOOK':
          return this.triggerEnterpriseWebhook(alert.tenantId, safeMessage);
        default:
          return Promise.resolve();
      }
    });

    try {
      await Promise.allSettled(dispatchPromises);
    } catch (error) {
      console.error('[Dispatcher] Routing failure encountered.', error);
    }
  }

  private async sendEmail(tenantId: string, message: string, priority: AlertPriority) {
    // SendGrid/AWS SES implementation hook
    console.log(`[SMTP] Sending ${priority} email to tenant IT contacts: ${message}`);
  }

  private async sendSlackWebhook(tenantId: string, safeMessage: string, priority: AlertPriority) {
    // Slack incoming webhook hook implementation
    const color = priority === 'CRITICAL' ? '#ff0000' : '#ffa500';
    console.log(`[Slack] Posting to tenant Slack integration. Color ${color}. Msg: ${safeMessage}`);
  }

  private async pushToWebSocketClient(tenantId: string, message: string) {
    // In-memory or Redis PubSub WebSocket broadcast
    // pubsub.publish(`tenant:${tenantId}:alerts`, JSON.stringify({ message }));
    console.log(`[WebSocket] Pushing raw alert to connected SIEM clients for ${tenantId}.`);
  }

  private async triggerEnterpriseWebhook(tenantId: string, safeMessage: string) {
    // IT Department SIEM hook
    const payload = JSON.stringify({ event: 'COMPLIANCE_ALERT', data: safeMessage });
    const signingSecret = process.env.WEBHOOK_SIGNING_SECRET || 'dev_secret';
    const signature = crypto.createHmac('sha256', signingSecret).update(payload).digest('hex');
    
    console.log(`[Webhook] Firing webhook for ${tenantId} with X-Hub-Signature: ${signature}`);
  }
}
