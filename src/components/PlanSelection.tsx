import React from 'react';
import { Check, Zap, Shield, Sparkles, Building2, Crown } from 'lucide-react';

interface PlanSelectionProps {
  currentTier: string;
  onPlanUpdated: (newTier: string) => void;
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({ currentTier, onPlanUpdated }) => {
  const plans = [
    {
      id: 'free',
      name: 'Starter Compliance',
      price: '€0',
      period: '/month',
      description: 'Basic GDPR checklist & single-region website scanning.',
      features: ['GDPR Basic Checklist', '1 Domain Scan / Mo', 'Local Storage Persistence', 'Community Support'],
      highlight: false
    },
    {
      id: 'pro',
      name: 'Pro Enterprise',
      price: '€499',
      period: '/month',
      description: 'Automated DPO workflows, NIS2 compliance & PII scanners.',
      features: ['GDPR + EU AI Act + NIS2', 'Unlimited PII Scanning', 'Real-time DPA Regulator Feed', 'Sovereign Encryption Vault'],
      highlight: true
    },
    {
      id: 'enterprise',
      name: 'Sovereign Custom',
      price: '€1,299',
      period: '/month',
      description: 'Dedicated HSM, custom B2G penalty treasury & 24/7 legal support.',
      features: ['Dedicated On-Prem or Cloud HSM', 'Custom Regulator Fine Calculator', '24/7 DPO Legal Retainer', 'Full White-label Portal'],
      highlight: false
    }
  ];

  return (
    <div className="space-y-4 my-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Select SaaS Subscription Tier</h3>
          <p className="text-xs text-slate-500">Upgrade or downgrade your compliance coverage plan instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => {
          const isCurrent = currentTier === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                plan.highlight
                  ? 'bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-500 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 right-4 px-3 py-0.5 bg-indigo-600 text-white font-mono text-[10px] font-bold rounded-full shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Recommended
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{plan.name}</h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-mono text-[10px] font-bold">
                      Current
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{plan.description}</p>

                <ul className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onPlanUpdated(plan.id)}
                disabled={isCurrent}
                className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900'
                }`}
              >
                {isCurrent ? 'Active Subscription' : `Select ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanSelection;
