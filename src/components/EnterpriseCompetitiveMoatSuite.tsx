import React from 'react';
import { Award, Zap, ShieldCheck, Globe, Lock, Cpu } from 'lucide-react';

export const EnterpriseCompetitiveMoatSuite: React.FC = () => {
  const moats = [
    { title: 'Zero-Knowledge Cryptographic Enclaves', desc: 'Hardware-attested confidentiality (AMD SEV / Intel SGX) ensuring raw PII is never visible even to root hosts.', icon: Lock },
    { title: 'Post-Quantum Sovereign Encryption', desc: 'Production-ready ML-KEM-768 key encapsulation future-proofing against sovereign quantum decryption attacks.', icon: ShieldCheck },
    { title: 'Harmonized 9-in-1 Regulatory Bus', desc: 'Unified single-API interface simultaneously satisfying GDPR, EU AI Act, DORA, NIS2, and MiCA.', icon: Globe },
    { title: 'Direct CSIRT & DPA Automated Conduits', desc: 'Instant cryptographic webhook notification directly linked into European regulatory authorities.', icon: Zap }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Sovereign Competitive Moats</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Proprietary sovereign regulatory architecture</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
          Tier-1 Moat
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {moats.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{m.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{m.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default EnterpriseCompetitiveMoatSuite;
