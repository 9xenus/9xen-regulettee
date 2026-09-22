import React, { useState } from 'react';
import { Database, Zap, RefreshCw, CheckCircle2, Server, Trash2 } from 'lucide-react';

export const ComplianceQueryCacheDashboard: React.FC = () => {
  const [hitRate, setHitRate] = useState('98.4%');
  const [cachedEntries, setCachedEntries] = useState(48920);
  const [isPurging, setIsPurging] = useState(false);

  const purgeCache = () => {
    setIsPurging(true);
    setTimeout(() => {
      setIsPurging(false);
      setHitRate('99.1%');
      setCachedEntries(120);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance In-Memory Cache Tier</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Ultra low-latency statutory query response layer</p>
          </div>
        </div>

        <button
          onClick={purgeCache}
          disabled={isPurging}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          {isPurging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Purge Cache
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">Cache Hit Rate</div>
          <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{hitRate}</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">Hot Cached Directives</div>
          <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">{cachedEntries.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">Average P99 Response</div>
          <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">&lt; 1.2ms</div>
        </div>
      </div>
    </div>
  );
};
export default ComplianceQueryCacheDashboard;
