import React from 'react';
import { Globe, ShieldCheck, MapPin, Layers } from 'lucide-react';

interface RegionalHub {
  country: string;
  flag: string;
  recordsStored: string;
  enclaveType: string;
  status: 'OPTIMAL';
}

export const PiiRegionalHeatmap: React.FC = () => {
  const hubs: RegionalHub[] = [
    { country: 'Germany (Frankfurt eu-central-1)', flag: '🇩🇪', recordsStored: '18,400', enclaveType: 'AMD SEV-SNP Enclave', status: 'OPTIMAL' },
    { country: 'France (Paris eu-west-3)', flag: '🇫🇷', recordsStored: '14,200', enclaveType: 'Intel SGX Secure Vault', status: 'OPTIMAL' },
    { country: 'Ireland (Dublin eu-west-1)', flag: '🇮🇪', recordsStored: '12,300', enclaveType: 'AWS Nitro Enclave', status: 'OPTIMAL' },
    { country: 'Sweden (Stockholm eu-north-1)', flag: '🇸🇪', recordsStored: '9,800', enclaveType: 'Nitro Zero-Egress Node', status: 'OPTIMAL' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sovereign PII Residency & Geo-Fencing Map</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">100% EU Data Residency — Zero third-country egress</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
          EU Sovereignty Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {hubs.map((hub, idx) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <span className="text-base">{hub.flag}</span>
                {hub.country}
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{hub.recordsStored}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>{hub.enclaveType}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{hub.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PiiRegionalHeatmap;
