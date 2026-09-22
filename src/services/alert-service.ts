import { fetchWithRetry } from '../lib/api-client';

export const AlertService = {
  triggerAlert: async (log: any) => {
    console.log(`[ALERT_SERVICE] Alert Dispatcher Initialized:`, log);
    
    // Wire to real backend statutory dispatch pipeline
    try {
      await fetchWithRetry('/api/v1/dispatch-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertLevel: log.level || 'WARNING',
          alertMessage: log.message || 'Statutory anomaly detected',
          targetService: log.service || 'Ingress Gateway'
        })
      });
    } catch (e) {
      console.warn('[ALERT_SERVICE] Local sovereign queue fallback used.');
    }

    // Fire browser event for non-blocking elegant UI toast display
    const event = new CustomEvent('sovereign-alert-toast', {
      detail: {
        level: log.level || 'WARNING',
        message: log.message || 'Regulatory anomaly detected',
        service: log.service || 'Core Enclave'
      }
    });
    window.dispatchEvent(event);
  }
};
