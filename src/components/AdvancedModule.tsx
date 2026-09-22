import React from 'react';
import { Sliders, ShieldCheck, Zap, Lock, Cpu, Globe } from 'lucide-react';

export const AdvancedModule: React.FC = () => {
  const capabilities = [
    { title: 'Deterministic Policy Compilation', desc: 'Translates high-level statutory legal texts into executable OPA / Rego policies at sub-millisecond evaluation speed.', icon: Cpu },
    { title: 'Cross-Border Sovereign Geo-Fencing', desc: 'Hardware-verified cryptographic data residency enforcing zero egress outside specified EU member states.', icon: Globe },
    { title: 'Post-Quantum Key Rotation Daemon', desc: 'Automated 24-hour cryptographic key rotation utilizing NIST FIPS 203 ML-KEM encapsulation standards.', icon: Lock },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Advanced Sovereign Enclave Capabilities</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">High-assurance regulatory infrastructure controls</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
          Enterprise Tier
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {capabilities.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{c.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{c.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AdvancedModule;
