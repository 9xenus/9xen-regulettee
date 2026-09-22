import React, { useState, useEffect } from 'react';
import { 
  Check, CreditCard, Layers, Plus, Edit3, ShieldCheck, Zap, ArrowRight, Settings, Sparkles, Building2
} from 'lucide-react';
import { subscriptionBillingEngine, PlanTier } from '../services/SubscriptionBillingEngine';

interface PricingProps {
  onManagePlans?: () => void;
  currentPlanId?: string;
  onSelectPlan?: (planId: string) => void;
  showAdminControls?: boolean;
}

export const Pricing: React.FC<PricingProps> = ({
  onManagePlans,
  currentPlanId = 'plan_pro',
  onSelectPlan,
  showAdminControls = true
}) => {
  const [plans, setPlans] = useState<PlanTier[]>([]);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

  const loadPlans = () => {
    try {
      const fetched = subscriptionBillingEngine.getAllPlans();
      setPlans(fetched);
    } catch (err) {
      console.error('Failed to load pricing plans:', err);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Cycle Toggle Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Transparent Subscription Pricing
          </div>
          <h2 className="text-xl font-black text-white">SaaS Platform Subscription Tiers</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Choose the ideal throughput capacity, e-KYC verification allowance, and compliance monitoring tier for your enterprise.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Monthly / Annual Toggle */}
          <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl text-xs font-bold border border-slate-700">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 bg-emerald-400 text-slate-950 text-[9px] font-black rounded-full uppercase">Save 20%</span>
            </button>
          </div>

          {/* Super Admin Plan Management Shortcut */}
          {showAdminControls && onManagePlans && (
            <button
              onClick={onManagePlans}
              className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
            >
              <Settings className="w-4 h-4 text-indigo-400" /> Manage Tier Schemas
            </button>
          )}
        </div>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isEnterprise = plan.isCustomEnterprisePlan || plan.id.includes('enterprise');
          const isPro = plan.id.includes('pro');

          const basePrice = billingCycle === 'ANNUAL' ? Math.round(plan.basePriceUsd * 0.8) : plan.basePriceUsd;

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'border-indigo-600 bg-white dark:bg-slate-900 ring-2 ring-indigo-600/30 shadow-lg'
                  : isPro
                  ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-md'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 shadow-xs'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-6 px-3 py-0.5 bg-indigo-600 text-white font-black text-[10px] rounded-full uppercase tracking-wider shadow-sm">
                  Active Subscription
                </span>
              )}

              {isPro && !isCurrent && (
                <span className="absolute -top-3 right-6 px-3 py-0.5 bg-indigo-500/20 border border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{plan.displayName}</h3>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold">
                      {plan.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isEnterprise
                      ? 'Custom sovereign throughput & dedicated replication'
                      : isPro
                      ? 'High volume automated KYC & AML for fast-growing FinTechs'
                      : 'Essential starter tier for initial regulatory onboarding'}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">${basePrice}</span>
                  <span className="text-xs text-slate-500 font-bold">
                    USD / {billingCycle === 'ANNUAL' ? 'month (billed annually)' : 'month'}
                  </span>
                </div>

                {/* Quota Highlights */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs font-mono">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>e-KYC Calls Included:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{plan.quotas.includedKycCalls.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>AI AML Screening:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{plan.quotas.includedAmlCalls.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>e-KYC Overage Rate:</span>
                    <span>${plan.quotas.overageKycRateUsd}/call</span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                  <div className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">Included Capabilities</div>
                  
                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${plan.features.enableKycVerification ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className={plan.features.enableKycVerification ? 'font-medium' : 'line-through text-slate-400'}>
                      e-KYC Verification API
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${plan.features.enableAmlMonitoring ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className={plan.features.enableAmlMonitoring ? 'font-medium' : 'line-through text-slate-400'}>
                      Real-Time AI AML Monitoring
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${plan.features.enablePrivacyEngine ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className={plan.features.enablePrivacyEngine ? 'font-medium' : 'line-through text-slate-400'}>
                      Automated Privacy Audit Engine
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${plan.features.enableSlaGuarantee ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className={plan.features.enableSlaGuarantee ? 'font-medium' : 'line-through text-slate-400'}>
                      99.99% Uptime SLA Guarantee
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className={`w-4 h-4 ${plan.features.enableDedicatedReplica ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className={plan.features.enableDedicatedReplica ? 'font-medium' : 'line-through text-slate-400'}>
                      Dedicated Database Replica
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => onSelectPlan && onSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : isPro || isEnterprise
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                  }`}
                >
                  {isCurrent ? (
                    <span>Current Active Plan</span>
                  ) : (
                    <>
                      <span>Select {plan.displayName}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
