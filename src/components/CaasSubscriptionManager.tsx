import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react';

export const CaasSubscriptionManager: React.FC = () => {
  const [currentTier, setCurrentTier] = useState<'STANDARD' | 'ENTERPRISE' | 'SOVEREIGN'>('SOVEREIGN');

  const tiers = [
    { id: 'STANDARD', name: 'Standard RegTech', price: '€1,299/mo', features: ['GDPR Art. 30 ROPA', 'Standard TLS 1.3', 'Email Alert Digest'] },
    { id: 'ENTERPRISE', name: 'Enterprise CaaS', price: '€4,900/mo', features: ['EU AI Act Annex IV', 'DORA Multi-Cloud Resilience', '24/7 CSIRT Conduits', 'Post-Quantum TLS'] },
    { id: 'SOVEREIGN', name: 'Sovereign Enclave', price: '€9,500/mo', features: ['Hardware SEV-SNP Isolation', 'ML-KEM-768 Zero-Egress', 'B2G Direct Regulator Portal', 'Custom Gazette Ingestion'] },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance-as-a-Service (CaaS) Tier</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Active enterprise subscription and entitlement controls</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
          Tier: {currentTier}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {tiers.map((t) => (
          <div
            key={t.id}
            onClick={() => setCurrentTier(t.id as any)}
            className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
              currentTier === t.id
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                {currentTier === t.id && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-1">{t.price}</div>
              <div className="space-y-1 mt-3">
                {t.features.map((f, i) => (
                  <div key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`w-full py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                currentTier === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
              }`}
            >
              {currentTier === t.id ? 'Active Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CaasSubscriptionManager;
