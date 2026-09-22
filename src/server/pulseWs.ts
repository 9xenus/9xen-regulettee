import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';

let wss: InstanceType<typeof WebSocketServer> | null = null;
const path = '/ws/pulse';

export function attachPulseWebSocket(httpServer: HttpServer) {
  if (wss) return wss;
  wss = new WebSocketServer({ server: httpServer, path });
  const clients = new Set<WebSocket>();

  const send = (ws: WebSocket, evt: any) => {
    if (ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ ...evt, timestamp: new Date().toISOString() })); } catch { /* drop */ }
    }
  };

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    send(ws, { type: 'CONNECTED', title: 'WS Pulse connected', message: 'Realtime sovereign WebSocket stream established', source: 'ws' });
    const hb = setInterval(() => send(ws, { type: 'HEARTBEAT', title: 'Platform pulse', message: 'Sovereign compliance engine operational', source: 'ws' }), 15000);
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg?.type === 'SUBSCRIBE') clients.forEach(c => send(c, { type: 'SUBSCRIBED', title: msg.channel || 'global', message: `Subscribed to channel ${msg.channel || 'global'}`, source: 'ws' }));
        if (msg?.type === 'PING') send(ws, { type: 'PONG', title: 'Pong', message: '', source: 'ws' });
      } catch { /* ignore */ }
    });
    ws.on('close', () => {
      clients.delete(ws);
      clearInterval(hb);
    });
  });

  wss.on('error', (err) => console.error('[PULSE_WS] error:', err?.message));
  console.log(`[PULSE_WS] Realtime WebSocket attached at ${path}`);
  return wss;
}

export function broadcastPulseWs(evt: any) {
  if (!wss) return;
  for (const c of wss.clients) {
    if (c.readyState === WebSocket.OPEN) {
      try { c.send(JSON.stringify({ ...evt, timestamp: new Date().toISOString() })); } catch { /* drop */ }
    }
  }
}

export function pulseWsHealth() {
  return {
    attached: !!wss,
    path,
    clients: wss ? wss.clients.size : 0,
  };
}