/**
 * SDK Reference & Code Generation Templates
 * Provides ready-to-use TypeScript and Python client SDK bindings for enterprise clients.
 */

import { getPublicEndpoints } from '../../../config/publicUrlConfig.js';

const __endpoints = getPublicEndpoints();

export const TYPESCRIPT_SDK_CODE = `
import axios from 'axios';
import WebSocket from 'ws';

export interface GuardrailChatOptions {
  prompt: string;
  model?: string;
  ruleProfile?: string;
  context?: string;
  bypassCache?: boolean;
  targetRegion?: string;
}

export interface GuardrailResponse {
  status: 'PASSED' | 'FLAGGED' | 'FALLBACK' | 'REJECTED';
  output: string;
  confidenceScore: number;
  flagReasons: Array<{ type: string; severity: string; message: string }>;
  requestId: string;
  latencyMs: number;
  targetRegion: string;
  llmCallAvoided: boolean;
}

export class GuardrailClient {
  private apiKey: string;
  private baseUrl: string;
  private wsUrl: string;

  constructor(options: { apiKey: string; baseUrl?: string; wsUrl?: string }) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || '${__endpoints.apiBaseUrl}/v1';
    this.wsUrl = options.wsUrl || '${__endpoints.wsBaseUrl}';
  }

  /**
   * Synchronous / REST Guardrail Protected Request
   */
  async chat(options: GuardrailChatOptions): Promise<GuardrailResponse> {
    const response = await axios.post(
      \`\${this.baseUrl}/guardrail/chat\`,
      options,
      {
        headers: {
          Authorization: \`Bearer \${this.apiKey}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  /**
   * Real-time Streaming WebSocket Connection
   */
  chatStream(options: GuardrailChatOptions, callbacks: {
    onToken?: (delta: string) => void;
    onVerdict?: (verdict: GuardrailResponse) => void;
    onError?: (err: any) => void;
    onDone?: () => void;
  }) {
    const ws = new WebSocket(\`\${this.wsUrl}?apiKey=\${this.apiKey}\`);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'chat', ...options, stream: true }));
    });

    ws.on('message', (data: string) => {
      try {
        const event = JSON.parse(data.toString());
        if (event.type === 'token' && callbacks.onToken) callbacks.onToken(event.delta);
        if (event.type === 'verdict' && callbacks.onVerdict) callbacks.onVerdict(event);
        if (event.type === 'done' && callbacks.onDone) callbacks.onDone();
      } catch (e) {
        if (callbacks.onError) callbacks.onError(e);
      }
    });

    ws.on('error', (err) => {
      if (callbacks.onError) callbacks.onError(err);
    });

    return ws;
  }
}
`;

export const PYTHON_SDK_CODE = `
import httpx
import websockets
import json
import asyncio
from typing import Optional, Dict, Any, AsyncGenerator

class GuardrailClient:
    """
    Python SDK for 9Xen Regulettee RegTech Compliance & Sovereign Guardrail Engine.
    """
    def __init__(self, api_key: str, base_url: str = "${__endpoints.apiBaseUrl}/v1", ws_url: str = "${__endpoints.wsBaseUrl}"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.ws_url = ws_url

    def chat(self, prompt: str, model: str = "gpt-4o", rule_profile: str = "default", context: Optional[str] = None, bypass_cache: bool = False, target_region: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a synchronous validated request through Modules 1, 2, and 3.
        """
        payload = {
            "prompt": prompt,
            "model": model,
            "ruleProfile": rule_profile,
            "context": context,
            "bypassCache": bypass_cache,
            "targetRegion": target_region
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        with httpx.Client(timeout=30.0) as client:
            response = client.post(f"{self.base_url}/guardrail/chat", json=payload, headers=headers)
            response.raise_for_status()
            return response.json()

    async def chat_stream(self, prompt: str, model: str = "gpt-4o", rule_profile: str = "default") -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streams model tokens and real-time guardrail verdict over WebSocket.
        """
        uri = f"{self.ws_url}?apiKey={self.api_key}"
        async with websockets.connect(uri) as ws:
            req_payload = {
                "type": "chat",
                "prompt": prompt,
                "model": model,
                "ruleProfile": rule_profile,
                "stream": True
            }
            await ws.send(json.dumps(req_payload))
            async for message in ws:
                event = json.loads(message)
                yield event
                if event.get("type") == "done":
                    break
`;
