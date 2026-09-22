// Sovereign Webhook Dispatcher & Client SDK

export interface WebhookEndpoint {
  id: string;
  url: string;
  status: 'active' | 'failing' | 'disabled';
  events: string[];
  secret: string;
  lastDelivery: string | null;
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  endpointId: string;
  event: string;
  status: number;
  timestamp: string;
  latencyMs: number;
  payloadSummary?: string;
}

export async function fetchWebhookEndpoints(): Promise<WebhookEndpoint[]> {
  try {
    const res = await fetch('/api/v1/webhooks/endpoints');
    const data = await res.json();
    return data.success ? data.endpoints : [];
  } catch (err) {
    console.error('Failed to fetch webhook endpoints:', err);
    return [];
  }
}

export async function registerWebhookEndpoint(url: string, events: string[]): Promise<WebhookEndpoint | null> {
  try {
    const res = await fetch('/api/v1/webhooks/endpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, events })
    });
    const data = await res.json();
    return data.success ? data.endpoint : null;
  } catch (err) {
    console.error('Failed to register webhook endpoint:', err);
    return null;
  }
}

export async function deleteWebhookEndpoint(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/webhooks/endpoints/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.error('Failed to delete webhook endpoint:', err);
    return false;
  }
}

export async function pingWebhookEndpoint(id: string): Promise<{ success: boolean; latencyMs: number; status: number }> {
  try {
    const res = await fetch(`/api/v1/webhooks/endpoints/${id}/ping`, {
      method: 'POST'
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, latencyMs: 0, status: 500 };
  }
}

export async function dispatchWebhook(
  eventOrTenant: string,
  eventOrPayload?: any,
  maybePayload?: any
): Promise<{ success: boolean; dispatchedCount: number; signature?: string }> {
  let eventName = eventOrTenant;
  let payload: Record<string, any> = {};

  if (typeof eventOrPayload === 'string') {
    // Called as dispatchWebhook(tenantId, event, payload)
    eventName = eventOrPayload;
    payload = maybePayload || {};
  } else if (typeof eventOrPayload === 'object' && eventOrPayload !== null) {
    // Called as dispatchWebhook(event, payload)
    eventName = eventOrTenant;
    payload = eventOrPayload;
  }

  try {
    const res = await fetch('/api/v1/webhooks/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, payload })
    });
    const data = await res.json();
    return {
      success: true,
      dispatchedCount: data.dispatchedCount || 0,
      signature: data.signature
    };
  } catch (err) {
    console.error('Failed to dispatch webhook event:', err);
    return { success: false, dispatchedCount: 0 };
  }
}

export async function fetchWebhookLogs(): Promise<WebhookDeliveryLog[]> {
  try {
    const res = await fetch('/api/v1/webhooks/logs');
    const data = await res.json();
    return data.success ? data.logs : [];
  } catch (err) {
    console.error('Failed to fetch webhook logs:', err);
    return [];
  }
}
