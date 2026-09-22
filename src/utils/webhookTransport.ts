let TransportClass: any;
if (typeof window === 'undefined') {
  try {
    if (typeof require !== 'undefined') {
      TransportClass = require('winston-transport');
    }
  } catch {}
}

if (!TransportClass) {
  TransportClass = class MockTransport {
    constructor(opts?: any) {}
    log(info: any, callback: () => void) { callback(); }
    emit(event: string, ...args: any[]) {}
    on() { return this; }
  };
}

import { autoTriageSingleLog } from './logAnalyzer';
import { dispatchWebhook } from '../api/webhooks-integration';

export class WebhookForwardingTransport extends TransportClass {
  constructor(opts?: any) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    if (typeof window !== 'undefined') {
      callback();
      return;
    }
    setImmediate(() => {
      (this as any).emit('logged', info);
    });

    // We only care about errors that might be critical
    if (info.level === 'error') {
      try {
        const triage = autoTriageSingleLog({
          id: info.id || `log_${Date.now()}`,
          timestamp: info.timestamp || new Date().toISOString(),
          level: 'error',
          message: info.message,
          status: info.status || 'NEW',
          retryCount: info.retryCount || 0
        });

        if (triage.severity === 'Critical') {
          // Forward to webhooks
          // We use 'default' tenant for system logs if not specified
          const tenantId = info.tenantId || 'default';
          dispatchWebhook(tenantId, 'CRITICAL_SYSTEM_LOG', {
            severity: triage.severity,
            category: triage.category,
            message: info.message,
            timestamp: info.timestamp,
            recommendation: triage.recommendedAction,
            meta: info.meta
          });
        }
      } catch (err) {
        // Avoid infinite loop if dispatchWebhook logs an error
        console.error('[WebhookForwardingTransport] Failed to triage or dispatch log:', err);
      }
    }

    callback();
  }
}
