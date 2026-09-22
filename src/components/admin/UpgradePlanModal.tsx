import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  X, 
  Check, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  CreditCard,
  Building2,
  ArrowRight
} from 'lucide-react';

const stripePromise = loadStripe((typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_STRIPE_PUBLISHABLE_KEY) || 'pk_test_<preview>');

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName?: string;
  currentPlanId?: string;
  onSuccess?: () => void;
}

const PLANS = [
  {
    id: 'price_starter',
    name: 'Starter Plan',
    price: '€499',
    period: 'month',
    description: 'Perfect for small to mid-sized teams establishing initial compliance guardrails.',
    features: [
      'GDPR Compliance Core',
      'Dynamic Cookie Consent Banner',
      'Standard Data Vault (10GB)',
      'Single Region Policy Mapping',
      'Email Regulatory Alerts'
    ],
    color: 'indigo',
    icon: Zap
  },
  {
    id: 'price_pro',
    name: 'Pro Enterprise',
    price: '€1,299',
    period: 'month',
    description: 'Our most popular plan for scaling organizations needing advanced surveillance & automation.',
    features: [
      'Everything in Starter',
      'EU AI Act & NIS2 Monitoring',
      'Sovereign Data Residency Locks',
      'DORA Resilience Planners',
      '100GB Secure Cloud Vault',
      'Automated DSAR Portal',
      'Dedicated compliance specialist'
    ],
    color: 'emerald',
    icon: Sparkles,
    popular: true
  },
  {
    id: 'price_sovereign',
    name: 'Sovereign Enterprise',
    price: '€4,999',
    period: 'month',
    description: 'Ultimate cyber security, sovereign cloud configurations, and quantum-safe protections.',
    features: [
      'Everything in Pro',
      'Quantum-Safe Vault & PQC encryption',
      'Sovereignty Arbitrage engine',
      'Unlimited Cloud Vault space',
      'Biometric and high-risk API audits',
      'White-glove 24/7 DPO hotline',
      'Adversarial Breach Simulations'
    ],
    color: 'purple',
    icon: ShieldCheck
  }
];

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  tenantName = 'Selected Organization',
  currentPlanId = 'price_starter',
  onSuccess
}) => {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string) => {
    setLoadingPlanId(priceId);
    try {
      const response = await fetch('/api/v1/stripe/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, priceId }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe Checkout session');
      }

      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await (stripe as any).redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          console.error('Stripe redirect error:', error);
        } else {
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error('Error initiating Stripe payment:', error);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-white"
          >
            {/* Header decor */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-purple-500" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Content */}
            <div className="p-4 sm:p-5 lg:p-6 md:p-8 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-black uppercase text-indigo-400 tracking-wider">
                  Sovereign Workspace Upgrade
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Change Compliance Tier for <span className="text-indigo-300">{tenantName}</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Unlock automated sovereign guardrails, real-time auditing dashboards, and legal defense sandboxes.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="px-6 md:px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === currentPlanId;
                const Icon = plan.icon;
                const isSelectedLoading = loadingPlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl p-5 flex flex-col justify-between border transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-slate-800/80 border-indigo-500 shadow-indigo-500/10 shadow-lg scale-102 z-10' 
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-indigo-600 border border-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-full text-white">
                        Most Popular
                      </span>
                    )}

                    {/* Top Tier Info */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`p-2 bg-slate-800 rounded-lg ${
                          plan.color === 'indigo' ? 'text-indigo-400' : plan.color === 'emerald' ? 'text-emerald-400' : 'text-purple-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-400 uppercase">
                            Current Active
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed min-h-[40px]">
                        {plan.description}
                      </p>

                      <div className="mt-4 mb-5 flex items-baseline">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                        <span className="text-slate-400 text-xs font-semibold ml-1">/{plan.period}</span>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2 border-t border-slate-800/60 pt-4 mb-6 text-xs">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Call to Action Button */}
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrent || loadingPlanId !== null}
                      className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer ${
                        isCurrent 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelectedLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrent ? (
                        'Active Tier'
                      ) : (
                        <>
                          <span>Select {plan.name.split(' ')[0]}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer trust notice */}
            <div className="px-6 md:px-8 py-4 bg-slate-950/60 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Secure payment and invoicing handled natively by Stripe.</span>
              </span>
              <span className="font-mono text-[10px]">
                Enclave Shard Sync: Active
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
