import React from 'react';
import { Globe, ShieldCheck, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const JurisdictionMapWidget: React.FC = () => {
  const jurisdictions = [
    { code: 'EU', name: 'European Union', framework: 'GDPR + EU AI Act', status: 'ACTIVE', coverage: '100%' },
    { code: 'DE', name: 'Germany', framework: 'BDSG / TTDSG', status: 'ACTIVE', coverage: '100%' },
    { code: 'FR', name: 'France', framework: 'CNIL Guidelines', status: 'ACTIVE', coverage: '100%' },
    { code: 'US-CA', name: 'California, USA', framework: 'CCPA / CPRA', status: 'ACTIVE', coverage: '98%' },
    { code: 'UK', name: 'United Kingdom', framework: 'UK GDPR / DPA 2018', status: 'ACTIVE', coverage: '100%' },
    { code: 'BR', name: 'Brazil', framework: 'LGPD', status: 'MONITORED', coverage: '85%' },
    { code: 'JP', name: 'Japan', framework: 'APPI', status: 'MONITORED', coverage: '90%' },
  ];

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Regional Jurisdictions</h3>
            <p className="text-xs text-slate-500">Live regulatory framework synchronizers</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
          7 Jurisdictions Synced
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {jurisdictions.map(item => (
          <div key={item.code} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 font-mono rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {item.code}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">{item.framework}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                {item.coverage}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JurisdictionMapWidget;
