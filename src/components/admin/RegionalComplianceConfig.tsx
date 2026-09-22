import React, { useState } from 'react';
import { ShieldAlert, Globe, Save, CheckCircle2, Sliders } from 'lucide-react';

export const RegionalComplianceConfig: React.FC = () => {
  const [configs, setConfigs] = useState([
    { region: 'EU_WEST', name: 'Western Europe (Germany, France, NL)', gdprStrictness: 'MAXIMUM', aiActStatus: 'ENFORCED', dpoRequired: true },
    { region: 'EU_NORTH', name: 'Nordics & Baltics (Sweden, Finland, EE)', gdprStrictness: 'HIGH', aiActStatus: 'ENFORCED', dpoRequired: true },
    { region: 'US_WEST', name: 'North America West (California CPRA)', gdprStrictness: 'MEDIUM', aiActStatus: 'OPTIONAL', dpoRequired: false },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          Regional Compliance Rules Engine
        </h3>
        <p className="text-xs text-slate-500">Configure global regional strictness, DPO requirements & AI Act enforcement parameters</p>
      </div>

      <div className="space-y-3">
        {configs.map((cfg, idx) => (
          <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" /> {cfg.name}
              </div>
              <p className="text-slate-500 font-mono text-[11px] mt-0.5">Region Key: {cfg.region}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-mono font-bold">
                Strictness: {cfg.gdprStrictness}
              </span>
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-mono font-bold">
                AI Act: {cfg.aiActStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionalComplianceConfig;
