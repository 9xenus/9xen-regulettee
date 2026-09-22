import { fetchWithRetry } from './api-client';

export interface CaasDetectResponse {
  success: boolean;
  score: number;
  risk: 'Low' | 'High';
  issues: string[];
}

export interface CaasProofResponse {
  success: boolean;
  hash: string;
  merkleRoot: string;
  ledgerBlock: number;
  witnessCount: number;
}

export interface CaasQueryResponse {
  success: boolean;
  answer: string;
}

export interface CaasRetestResponse {
  success: boolean;
  result: string;
}

export interface CaasDispatchResponse {
  success: boolean;
  logs: string[];
}

export default class N9XenReguletteeCaasSdk {
  private baseUrl: string;
  private wsUrl: string;

  constructor(options?: { baseUrl?: string; wsUrl?: string }) {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
    this.baseUrl = options?.baseUrl || `${protocol}//${host}/api/v1/caas`;
    const wsProto = protocol === 'https:' ? 'wss:' : 'ws:';
    this.wsUrl = options?.wsUrl || `${wsProto}//${host}`;
  }

  /**
   * HTTP API: Retest endpoint connection status
   */
  async retest(): Promise<CaasRetestResponse> {
    const res = await fetchWithRetry(`${this.baseUrl}/retest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`CaaS API Error: HTTP ${res.status}`);
    }
    return res.json();
  }

  /**
   * HTTP API: Detect compliance issues on a sandbox URL
   */
  async detect(url: string): Promise<CaasDetectResponse> {
    const res = await fetchWithRetry(`${this.baseUrl}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) {
      throw new Error(`CaaS API Error: HTTP ${res.status}`);
    }
    return res.json();
  }

  /**
   * HTTP API: Ask regulatory policy query
   */
  async queryAi(query: string, presetKey?: string): Promise<CaasQueryResponse> {
    const res = await fetchWithRetry(`${this.baseUrl}/query-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, presetKey })
    });
    if (!res.ok) {
      throw new Error(`CaaS API Error: HTTP ${res.status}`);
    }
    return res.json();
  }

  /**
   * HTTP API: Cryptographically prove dynamic compliance proof text
   */
  async generateProof(proofText: string): Promise<CaasProofResponse> {
    const res = await fetchWithRetry(`${this.baseUrl}/generate-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proofText })
    });
    if (!res.ok) {
      throw new Error(`CaaS API Error: HTTP ${res.status}`);
    }
    return res.json();
  }

  /**
   * HTTP API: Dispatch webhook across active channels
   */
  async dispatchWebhook(channel: string, message: string): Promise<CaasDispatchResponse> {
    const res = await fetchWithRetry(`${this.baseUrl}/dispatch-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, message })
    });
    if (!res.ok) {
      throw new Error(`CaaS API Error: HTTP ${res.status}`);
    }
    return res.json();
  }

  /**
   * Dynamic Dual-Mode WebSocket client stream helper
   */
  connectWebSocket(handlers: {
    onOpen?: () => void;
    onLog?: (log: string) => void;
    onResult?: (type: string, data: any) => void;
    onError?: (err: string) => void;
    onClose?: () => void;
  }): WebSocket {
    const ws = new WebSocket(this.wsUrl);

    ws.onopen = () => {
      if (handlers.onOpen) handlers.onOpen();
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type?.endsWith('_LOG')) {
          if (handlers.onLog) handlers.onLog(payload.message);
        } else if (payload.type?.endsWith('_RESULT')) {
          if (handlers.onResult) handlers.onResult(payload.type, payload);
        } else if (payload.type === 'NEWS_UPDATE') {
          if (handlers.onResult) handlers.onResult(payload.type, payload.headlines);
        } else if (payload.type === 'ERROR') {
          if (handlers.onError) handlers.onError(payload.error);
        }
      } catch (err: any) {
        if (handlers.onError) handlers.onError(err.message);
      }
    };

    ws.onerror = () => {
      if (handlers.onError) handlers.onError('WebSocket encountered an unexpected network error.');
    };

    ws.onclose = () => {
      if (handlers.onClose) handlers.onClose();
    };

    return ws;
  }
}
