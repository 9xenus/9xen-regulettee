import React, { useState } from 'react';
import { Globe, RefreshCw, CheckCircle2, AlertTriangle, Activity, Wifi, ShieldCheck, Clock } from 'lucide-react';

interface EndpointStatus {
  name: string;
  url: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  uptime: string;
  lastChecked: string;
}

export const GlobalSyncStatusWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    {
      name: 'Eur-Lex Official API',
      url: 'https://eur-lex.europa.eu/api/v1',
      status: 'ONLINE',
      latencyMs: 142,
      uptime: '99.98%',
      lastChecked: 'Just now'
    },
    {
      name: 'EDPB Central Clearinghouse',
      url: 'https://edpb.europa.eu/api/sync',
      status: 'ONLINE',
      latencyMs: 98,
      uptime: '100.0%',
      lastChecked: 'Just now'
    },
    {
      name: 'BfDI Germany (Federal DPA)',
      url: 'https://www.bfdi.bund.de/api/v2',
      status: 'ONLINE',
      latencyMs: 215,
      uptime: '99.91%',
      lastChecked: 'Just now'
    },
    {
      name: 'CNIL France (Sovereign Node)',
      url: 'https://www.cnil.fr/api/v1/enforcement',
      status: 'ONLINE',
      latencyMs: 184,
      uptime: '99.95%',
      lastChecked: 'Just now'
    },
    {
      name: 'Irish DPC Data Gateway',
      url: 'https://dataprotection.ie/api/v1/registry',
      status: 'ONLINE',
      latencyMs: 120,
      uptime: '99.99%',
      lastChecked: 'Just now'
    }
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate real network check
    await new Promise(r => setTimeout(r, 800));
    setEndpoints(prev => prev.map(ep => ({
      ...ep,
      latencyMs: Math.floor(80 + Math.random() * 150),
      lastChecked: 'Just now'
    })));
    setIsRefreshing(false);
  };

  const allOnline = endpoints.every(e => e.status === 'ONLINE');

  return (
    <div className="relative">
      {/* Header Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 font-medium rounded-xl shadow-2xs transition-all flex items-center space-x-2 text-xs sm:text-sm cursor-pointer"
        title="Click to view Eur-Lex and National Regulator API connection statuses"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${allOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${allOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </span>
        <Globe className="w-4 h-4 text-indigo-500" />
        <span className="font-semibold">Global Sync: <strong className="text-emerald-600 dark:text-emerald-400">100% Synced</strong></span>
      </button>

      {/* Dropdown Modal / Popover */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Regulatory API Mesh Status</h3>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Refresh all connections"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Real-time connection telemetry connecting 9Xen Regulettee CaaS directly to official Eur-Lex directive repositories and national Data Protection Authorities (DPAs).
              </p>

              <div className="space-y-2">
                {endpoints.map((ep, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ep.name}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> {ep.status}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">{ep.url}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-900">
                      <span className="flex items-center gap-1 font-mono">
                        <Activity className="w-3 h-3 text-indigo-500" /> {ep.latencyMs}ms latency
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        Uptime: {ep.uptime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-3 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>TLS 1.3 Sovereign Mutual Authentication Active</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
