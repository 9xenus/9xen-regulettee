import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

export const DataBreachAnalyticsChart: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">GDPR Art. 33 Breach Analytics</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">72-Hour statutory notification countdown</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
          0 Breaches in 365 Days
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">Average DPA Notification</div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">&lt; 4.2 Hours (SLA: 72h)</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">Automated CSIRT Webhooks</div>
          <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">ARMED & TESTED</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">Data Subject Notice Engine</div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">Automated Multi-Lingual</div>
        </div>
      </div>
    </div>
  );
};
export default DataBreachAnalyticsChart;
