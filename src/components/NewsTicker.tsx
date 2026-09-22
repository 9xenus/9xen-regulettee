import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from "react";
import { Globe, Loader2 } from "lucide-react";

const SKIP_TYPES = new Set(['CONNECTED', 'HEARTBEAT', 'SUBSCRIBED', 'PONG', 'PING']);

const toHeadline = (p: any): string | null => {
  if (!p || !p.title) return null;
  if (SKIP_TYPES.has(p.type)) return null;
  const ts = p.timestamp ? new Date(String(p.timestamp).replace(' ', 'T')) : new Date();
  const clock = isNaN(ts.getTime()) ? '' : ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const lead = [clock, p.type && p.type !== 'CUSTOM_EVENT' ? p.type : null].filter(Boolean).join(' ');
  const body = [p.title, p.message ? `— ${p.message}` : ''].filter(Boolean).join(' ');
  return lead ? `[${lead}] ${body}` : body;
};

export const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const ingest = (frames: any[]) => {
    const lines = (frames || []).map(toHeadline).filter((h): h is string => !!h);
    if (lines.length === 0) return;
    setNews(prev => [...lines, ...prev].slice(0, 40));
    setLoading(false);
    setError(false);
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any;
    let isMounted = true;

    const fetchHttpFallback = async () => {
      try {
        const res = await fetchWithRetry("/api/v1/client-premium/realtime/history");
        const data = await res.json();
        if (isMounted && data?.success && Array.isArray(data.events)) {
          ingest(data.events);
        } else if (isMounted) {
          setLoading(false);
          setError(true);
        }
      } catch (err) {
        console.warn("HTTP News Fallback failed in NewsTicker:", err);
        if (isMounted) {
          setLoading(false);
          setError(true);
        }
      }
    };

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/pulse`;

    const connect = () => {
      if (!isMounted) return;
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMounted) return;
          console.log("WebSocket connected for compliance news");
          setError(false);
          try { ws?.send(JSON.stringify({ type: 'SUBSCRIBE', channel: 'news' })); } catch {}
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            ingest([data]);
          } catch (e) {
            console.error("Failed to parse websocket message", e);
          }
        };

        ws.onerror = () => {
          if (!isMounted) return;
          console.warn("WebSocket error in NewsTicker. Trying HTTP fallback.");
          setError(true);
          fetchHttpFallback();
        };

        ws.onclose = () => {
          if (!isMounted) return;
          reconnectTimer = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.warn("WebSocket instantiation securely caught in NewsTicker:", err);
        if (isMounted) {
          setError(true);
          fetchHttpFallback();
        }
      }
    };

    fetchHttpFallback().then(() => {
      connect();
    });

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (ws) {
        try {
          ws.close();
        } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-slate-900 text-slate-200 text-xs font-medium px-4 py-2 flex items-center rounded-lg shadow-sm w-full overflow-hidden border border-slate-800">
      <div className="flex items-center space-x-2 shrink-0 border-r border-slate-700 pr-3 mr-3 text-emerald-400">
        <Globe className="w-4 h-4" />
        <span className="uppercase tracking-wider font-bold">Global Brief</span>
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative whitespace-nowrap">
        {loading ? (
          <span className="flex items-center text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Waiting for real-time regulatory stream...
          </span>
        ) : error && news.length === 0 ? (
          <span className="text-rose-400 flex items-center space-x-2">
            <span>Live stream disconnected. Reconnecting...</span>
          </span>
        ) : news.length > 0 ? (
          <div className="inline-block animate-marquee hover:[animation-play-state:paused]">
             {news.map((headline, idx) => (
                <span key={idx} className="mr-8 inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  {headline}
                </span>
             ))}
             {news.map((headline, idx) => (
                <span key={`dup-${idx}`} className="mr-8 inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                  {headline}
                </span>
             ))}
          </div>
        ) : (
          <span className="text-slate-400">No breaking updates.</span>
        )}
      </div>
    </div>
  );
};