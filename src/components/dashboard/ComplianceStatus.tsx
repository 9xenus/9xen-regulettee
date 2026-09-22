import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, Activity, Lock, Server } from 'lucide-react';

export const ComplianceStatus: React.FC = () => {
  const telemetryItems = [
    { label: 'Sovereign Enclave Status', value: 'ONLINE & ISOLATED', status: 'HEALTHY', icon: Lock },
    { label: 'Post-Quantum Key Exchange', value: 'ML-KEM-768 ACTIVE', status: 'HEALTHY', icon: ShieldCheck },
    { label: 'Statutory Gazette Poller', value: 'SYNCED (2m ago)', status: 'HEALTHY', icon: Activity },
    { label: 'WORM Immutable Audit Log', value: 'BLOCK #8,941,029', status: 'HEALTHY', icon: Server },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Engine Health</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
          99.99% Uptime SLA
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {telemetryItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/50 flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono uppercase text-slate-400 truncate">{item.label}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.value}</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ComplianceStatus;
