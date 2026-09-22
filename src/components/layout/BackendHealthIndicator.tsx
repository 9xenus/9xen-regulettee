import React, { useState, useEffect, useCallback } from 'react';
import { Server, RefreshCw, Activity, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface BackendHealthIndicatorProps {
  isSidebarOpen: boolean;
}

export const BackendHealthIndicator: React.FC<BackendHealthIndicatorProps> = ({ isSidebarOpen }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const checkHealth = useCallback(async () => {
    setIsRefreshing(true);
    const startTime = performance.now();
    try {
      // Check FastAPI / Node engine health via centralized apiClient
      const res = await apiClient.get<{ status?: string; success?: boolean }>('/api/health', {
        retries: 1,
        skipAuth: true,
        complianceModule: 'GENERAL'
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(elapsed);

      if (res && (res.status === 'ok' || res.success === true)) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (err) {
      // Fallback check to engine status endpoint
      try {
        const fallback = await apiClient.engine.getStatus();
        const elapsed = Math.round(performance.now() - startTime);
        setLatency(elapsed);

        if (fallback && fallback.status === 'ONLINE') {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (fallbackErr) {
        setStatus('offline');
        setLatency(null);
      }
    } finally {
      setIsRefreshing(false);
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Poll backend health every 15 seconds
    const interval = setInterval(() => {
      checkHealth();
    }, 15000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  if (!isSidebarOpen) {
    // Collapsed View
    return (
      <div
        className="my-1.5 px-2 flex justify-center cursor-pointer group"
        onClick={checkHealth}
        title={`FastAPI Backend: ${status.toUpperCase()} ${latency ? `(${latency}ms)` : ''} - Last Checked: ${lastChecked || 'Just now'}. Click to re-check.`}
      >
        <div className={`p-2 rounded-xl flex items-center justify-center transition-all border ${
          status === 'online'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-500/60'
            : status === 'offline'
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <div className="relative">
            <Server className="w-4 h-4" />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0B1120] ${
              status === 'online'
                ? 'bg-emerald-400 animate-pulse'
                : status === 'offline'
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-amber-400 animate-spin'
            }`} />
          </div>
        </div>
      </div>
    );
  }

  // Expanded View
  return (
    <div className="mx-3 my-1.5">
      <div className={`px-2.5 py-2 rounded-xl border transition-all duration-300 flex items-center justify-between gap-2 ${
        status === 'online'
          ? 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700/80'
          : status === 'offline'
            ? 'bg-rose-950/40 border-rose-500/40 shadow-sm shadow-rose-950/50'
            : 'bg-slate-900/60 border-slate-800/80'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          {/* Status Dot */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'online'
                ? 'bg-emerald-400 shadow-xs shadow-emerald-400'
                : status === 'offline'
                  ? 'bg-rose-500 shadow-xs shadow-rose-500'
                  : 'bg-amber-400'
            }`} />
            {status === 'online' && (
              <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            )}
            {status === 'offline' && (
              <span className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping opacity-75" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 truncate">
                FastAPI Backend
              </span>
              {latency !== null && status === 'online' && (
                <span className="text-[9px] font-mono text-emerald-400/90 font-medium">
                  {latency}ms
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className={`text-[11px] font-bold ${
                status === 'online'
                  ? 'text-emerald-400'
                  : status === 'offline'
                    ? 'text-rose-400'
                    : 'text-amber-400'
              }`}>
                {status === 'online' ? 'Online & Ready' : status === 'offline' ? 'Backend Offline' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={checkHealth}
          disabled={isRefreshing}
          className="p-1 text-slate-500 hover:text-slate-300 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title={`Last health check: ${lastChecked || 'Just now'}. Click to re-check.`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
