import crypto from 'crypto';

export const AlertPriority = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  LOW: 'LOW'
} as const;

export type AlertPriority = typeof AlertPriority[keyof typeof AlertPriority];

export type NotificationChannel = 'EMAIL' | 'SLACK' | 'IN_APP';

export interface ComplianceAlert {
  id: string;
  tenantId: string;
  priority: AlertPriority;
  title: string;
  message: string;
  rawContextData?: Record<string, any>; // Potentially contains PII or sensitive data
  preferredChannels: NotificationChannel[];
}

export class NotificationDispatcher {
  
  /**
   * Main ingester for compliance alerts. Queues and routes them to user preferences.
   */
  public async dispatchAlert(alert: ComplianceAlert): Promise<void> {
    console.log(`[NOTIFICATION_ROUTER] Ingesting ${alert.priority} alert for Tenant ${alert.tenantId}`);

    // 1. Privacy Guard Middleware - Automatically scrub PII before sending to external channels
    const scrubbedMessage = this.privacyScrubberMiddleware(alert.message);
    const safeDataPayload = this.sanitizeContextData(alert.rawContextData);

    const safeAlertToDispatch = {
      ...alert,
      message: scrubbedMessage,
      rawContextData: safeDataPayload
    };

    // 2. Route based on requested channels
    for (const channel of alert.preferredChannels) {
      try {
        switch (channel) {
          case 'EMAIL':
            await this.sendEmailVerification(safeAlertToDispatch);
            break;
          case 'SLACK':
            await this.sendSlackWebhook(safeAlertToDispatch);
            break;
          case 'IN_APP':
            await this.pushRealtimeWebSocket(safeAlertToDispatch);
            break;
        }
      } catch (error) {
        console.error(`[NOTIFICATION_ROUTER] Failed to dispatch via ${channel}.`, error);
        // Fallback robust queue logic here
      }
    }
  }

  /**
   * Redacts Personally Identifiable Information (PII) from strings targeting external networks.
   * e.g., emails, phone numbers, or credit cards that might have slipped into a compliance failure reason.
   */
  private privacyScrubberMiddleware(rawString: string): string {
    let sanitized = rawString;
    // Basic regex scrubs for standard PII formats
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/gi;
    
    sanitized = sanitized.replace(emailRegex, '[REDACTED_EMAIL]');
    sanitized = sanitized.replace(phoneRegex, '[REDACTED_PHONE]');
    
    return sanitized;
  }

  /**
   * Strips deep objects of predefined sensitive keys to avoid leaking configuration states.
   */
  private sanitizeContextData(data?: Record<string, any>): Record<string, any> {
    if (!data) return {};
    const sanitized = { ...data };
    const forbiddenKeys = ['password', 'secret', 'token', 'apiKey', 'creditCard', 'mfaSecret'];
    
    for (const key of Object.keys(sanitized)) {
      if (forbiddenKeys.some(forbidden => key.toLowerCase().includes(forbidden))) {
        sanitized[key] = '[REDACTED_SECRET]';
      }
    }
    return sanitized;
  }

  private async sendEmailVerification(alert: ComplianceAlert) {
    // e.g., await sendGridClient.send(...)
    console.log(`[EMAIL_DISPATCH] Sent secure email. Title: ${alert.title}`);
  }

  private async sendSlackWebhook(alert: ComplianceAlert) {
    // Only send High/Critical to Slack to avoid alert fatigue
    if (alert.priority === AlertPriority.LOW) return;
    
    console.log(`[SLACK_DISPATCH] Sent Slack Webhook to security channel. Message: ${alert.message}`);
  }

  private async pushRealtimeWebSocket(alert: ComplianceAlert) {
    // In-app sockets via socket.io or Pusher. PII is allowed here since it remains inside the compliant UI boundaries.
    console.log(`[WEBSOCKET_DISPATCH] Emitted 'compliance_alert' to Tenant ${alert.tenantId} room.`);
  }
}

export const notificationDispatcher = new NotificationDispatcher();
