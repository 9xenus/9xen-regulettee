import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Activity, RefreshCw, CheckCircle2, AlertTriangle, Terminal, Key } from 'lucide-react';

export interface CyberSecuritySuiteProps {
  tenantId?: any;
  [key: string]: any;
}

export const CyberSecuritySuite: React.FC<CyberSecuritySuiteProps> = () => {
  const [pqcActive, setPqcActive] = useState(true);
  const [eBpfActive, setEBpfActive] = useState(true);
  const [threatStatus, setThreatStatus] = useState<any>(null);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const res = await fetch('/api/dashboard/threat-scan');
        const data = await res.json();
        setThreatStatus(data);
      } catch (e) { console.error(e); }
    };
    fetchThreats();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cybersecurity & Zero-Trust Defense Suite</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {threatStatus ? `Threats: ${threatStatus.activeThreats} | Status: ${threatStatus.systemStatus}` : 'Loading...'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
          ARMED (Post-Quantum)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ML-KEM-768 Hybrid TLS
            </div>
            <input
              type="checkbox"
              checked={pqcActive}
              onChange={() => setPqcActive(!pqcActive)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-slate-500">Post-Quantum Key Encapsulation protecting against 'harvest now, decrypt later' threats.</p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              eBPF Kernel Anomaly Filter
            </div>
            <input
              type="checkbox"
              checked={eBpfActive}
              onChange={() => setEBpfActive(!eBpfActive)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-slate-500">Kernel-level process inspection blocking zero-day privilege escalations in micro-enclaves.</p>
        </div>
      </div>
    </div>
  );
};
export default CyberSecuritySuite;
