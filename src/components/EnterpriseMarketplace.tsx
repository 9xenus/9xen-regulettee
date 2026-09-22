import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithRetry } from '../lib/api-client';
import { 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  ShoppingCart, 
  Layers, 
  Building2, 
  Globe, 
  Lock, 
  Cpu, 
  Check, 
  Plus, 
  Minus,
  Info,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { SubscriptionManager, TierConfig } from '../lib/policy-registry';
import { StripeCheckoutModal, StripeCheckoutItem } from './payment/StripeCheckoutModal';

interface EnterpriseMarketplaceProps {
  activeTiers: string[];
  onActivate: (tierIds: string[]) => Promise<void>;
  onDeactivate: (tierId: string) => Promise<void>;
}

const FAMILIES = [
  {
    id: 'finance',
    name: 'Financial & Crypto Enclave',
    desc: 'High-security frameworks for regulated financial institutions and digital asset exchanges.',
    tiers: ['aml-kyc', 'crypto_forensics'],
    icon: Zap,
    color: 'indigo'
  },
  {
    id: 'infrastructure',
    name: 'Sovereign Infrastructure',
    desc: 'Public sector, logistics, and multi-region enterprise governance solutions.',
    tiers: ['govtech', 'logistic', 'enterprise'],
    icon: Building2,
    color: 'slate'
  },
  {
    id: 'digital',
    name: 'Digital Services & Privacy Enclave',
    desc: 'Privacy-first solutions, GDPR compliance, retail, gaming, and educational institutions.',
    tiers: ['gdpr-compliance', 'ecommerce-eu', 'gaming', 'edtech'],
    icon: Globe,
    color: 'emerald'
  },
  {
    id: 'specialized',
    name: 'Specialized Tech & Remediation',
    desc: 'Cutting-edge AI compliance, healthtechEHDS, and automated remediation APIs.',
    tiers: ['enterprise_ai', 'healthtech', 'remediation_api'],
    icon: Cpu,
    color: 'violet'
  }
];

export const EnterpriseMarketplace: React.FC<EnterpriseMarketplaceProps> = ({
  activeTiers,
  onActivate,
  onDeactivate
}) => {
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedPolicyFilter, setSelectedPolicyFilter] = useState<string>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dbAddons, setDbAddons] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const loadAddons = async () => {
      try {
        const res = await fetchWithRetry("/api/v1/caas/addons");
        const data = await res.json();
        if (data.success && active) {
          setDbAddons(data.addons);
        }
      } catch (e) {
        console.error("Failed to load marketplace dynamic addons", e);
      }
    };
    loadAddons();
    return () => {
      active = false;
    };
  }, []);

  const customTiers = useMemo(() => {
    const standardIds = ['starter', 'aml-kyc', 'healthtech', 'enterprise_ai', 'ecommerce-eu', 'crypto_forensics', 'govtech', 'gaming', 'edtech', 'logistic', 'remediation_api', 'enterprise', 'gdpr-compliance'];
    return dbAddons
      .filter(addon => !standardIds.includes(addon.id))
      .map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price || '€199',
        billing: 'month',
        iconName: addon.icon || 'ShieldCheck',
        description: addon.desc || 'Custom Registered Compliance-as-a-Service addon.',
        policies: [addon.actId] as any[]
      }));
  }, [dbAddons]);

  const allFamilies = useMemo(() => {
    if (customTiers.length === 0) {
      return FAMILIES;
    }
    return [
      ...FAMILIES,
      {
        id: 'custom-caas',
        name: 'Custom Registered CaaS Services',
        desc: 'Tailored compliance frameworks registered dynamically by SaaS administrators.',
        tiers: customTiers.map(t => t.id),
        icon: Layers,
        color: 'violet'
      }
    ];
  }, [customTiers]);

  const [checkoutItem, setCheckoutItem] = useState<StripeCheckoutItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingTierIds, setPendingTierIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedTiers(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const totalPrice = useMemo(() => {
    return selectedTiers.reduce((acc, id) => {
      const tier = [...SubscriptionManager.TIER_CONFIGS, ...customTiers].find(t => t.id === id);
      if (!tier) return acc;
      const amount = parseInt(tier.price.replace(/[^0-9]/g, '')) || 0;
      return acc + amount;
    }, 0);
  }, [selectedTiers, customTiers]);

  const handleBulkActivate = () => {
    if (selectedTiers.length === 0) return;
    const selectedNames = selectedTiers.map(id => {
      const t = [...SubscriptionManager.TIER_CONFIGS, ...customTiers].find(item => item.id === id);
      return t ? t.name : id;
    });

    setPendingTierIds(selectedTiers);
    setCheckoutItem({
      id: `bundle_${selectedTiers.join('_')}`,
      name: `Compliance Marketplace Bundle (${selectedTiers.length} Enclaves)`,
      type: 'ADDON',
      priceEur: totalPrice || 99,
      period: 'month',
      description: `Includes: ${selectedNames.join(', ')}`,
      features: selectedNames,
      category: 'Marketplace Bundle'
    });
    setIsCheckoutOpen(true);
  };

  const handleSingleActivate = (tierId: string) => {
    const tier = [...SubscriptionManager.TIER_CONFIGS, ...customTiers].find(t => t.id === tierId);
    if (!tier) return;
    const priceNum = parseInt(tier.price.replace(/[^0-9]/g, '')) || 99;

    setPendingTierIds([tierId]);
    setCheckoutItem({
      id: tier.id,
      name: `${tier.name} Enclave Add-on`,
      type: 'ADDON',
      priceEur: priceNum,
      period: 'month',
      description: tier.description,
      features: tier.policies || [],
      category: 'Regulatory Add-on'
    });
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = async () => {
    if (pendingTierIds.length > 0) {
      await onActivate(pendingTierIds);
      setSelectedTiers(prev => prev.filter(id => !pendingTierIds.includes(id)));
      setPendingTierIds([]);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Marketplace Header */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-[2.5rem] p-5 sm:p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-5 sm:gap-8 items-center justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <ShoppingCart className="w-3.5 h-3.5" /> Enterprise Sovereign Marketplace
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Modular Compliance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Orchestration Engine</span>
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed font-medium">
              Scale your sovereign enclave instantly. Activate specialized regulatory modules, industry-specific compliance enclaves, and automated remediation APIs with a single cryptographic signature.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 sm:p-5 lg:p-6 rounded-3xl w-full md:w-80 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bulk Selection</span>
              <div className="text-indigo-400 font-black text-xs">{selectedTiers.length} Selected</div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-white font-bold text-sm">
                <span>Total Monthly Commit</span>
                <span>€{totalPrice}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (selectedTiers.length / 5) * 100)}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleBulkActivate}
              disabled={selectedTiers.length === 0 || isProcessing}
              className="w-full py-3.5 bg-white text-slate-950 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  ACTIVATE SELECTED BUNDLE
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Policy Mapping Matrix */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-4 sm:p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Policy-to-Module Integration Matrix</h3>
              <p className="text-xs text-slate-400 mt-0.5">Click any regulatory framework below to highlight and inspect its corresponding microservice.</p>
            </div>
          </div>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-700/60 shrink-0">
            Rule-Based Gating Engine
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6 border-b border-slate-800 pb-5">
          {['ALL', 'GDPR', 'DORA', 'AI_ACT', 'NIS2', 'CSRD', 'MICA', 'PSD3', 'EHDS', 'ePrivacy'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPolicyFilter(p)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
                selectedPolicyFilter === p
                  ? 'bg-indigo-600 text-white border-indigo-500 font-black shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...SubscriptionManager.TIER_CONFIGS, ...customTiers]
            .filter(t => selectedPolicyFilter === 'ALL' || t.policies.includes(selectedPolicyFilter as any))
            .map((tier) => {
              const isActive = activeTiers.includes(tier.id);
              const isSelected = selectedTiers.includes(tier.id);
              return (
                <div 
                  key={tier.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isActive 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                      : isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-950/60 border-slate-850 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-black text-white">{tier.name}</span>
                      <span className="text-xs font-mono font-bold text-indigo-400">{tier.price}/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tier.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tier.policies.map((pol) => (
                        <span 
                          key={pol} 
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            pol === selectedPolicyFilter 
                              ? 'bg-indigo-500 text-white font-black border border-indigo-400' 
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {pol}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    {isActive ? (
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 uppercase font-mono">
                        <Check className="w-3.5 h-3.5" /> Activated
                      </span>
                    ) : (
                      <button
                        onClick={() => onActivate([tier.id])}
                        className="text-[9px] bg-white text-slate-950 hover:bg-slate-100 px-3 py-1 rounded-lg font-black transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        SUBSCRIBE NOW
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Subscription Families */}
      <div className="space-y-12">
        {allFamilies.map((family) => (
          <div key={family.id} className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-${family.color}-500/10 border border-${family.color}-500/20 flex items-center justify-center text-${family.color}-500 shadow-lg shadow-${family.color}-500/5`}>
                <family.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{family.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{family.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {family.tiers.map((tierId) => {
                const tier = [...SubscriptionManager.TIER_CONFIGS, ...customTiers].find(t => t.id === tierId);
                if (!tier) return null;
                const isActive = activeTiers.includes(tierId);
                const isSelected = selectedTiers.includes(tierId);

                return (
                  <motion.div
                    key={tierId}
                    className={`group relative bg-white border ${isSelected ? 'border-indigo-600 ring-4 ring-indigo-500/5' : 'border-slate-200'} rounded-3xl p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-100 flex flex-col`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-slate-900 leading-tight">{tier.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{tier.id}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{tier.billing}ly lease</span>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900">{tier.price}</div>
                    </div>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 flex-1">
                      {tier.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Included Frameworks
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tier.policies.map(p => (
                          <span key={p} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 group-hover:border-indigo-100 group-hover:bg-indigo-50/50 transition-colors">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <div className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4" />
                          ALREADY ACTIVE
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleSelection(tierId)}
                            className={`p-3 rounded-2xl transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                          >
                            {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleSingleActivate(tierId)}
                            className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group/btn cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-indigo-400" />
                            <span>STRIPE CHECKOUT</span>
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Stripe Sandbox Direct Modal */}
      <StripeCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setPendingTierIds([]);
        }}
        item={checkoutItem}
        userEmail="enterprise-client@sovereign-compliance.eu"
        onSuccess={handleCheckoutSuccess}
      />

      {/* Trust Badge Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 sm:p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-xl shadow-slate-200/50">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">Sovereign Data Guarantees</h4>
            <p className="text-xs text-slate-500 font-medium max-w-sm mt-1">All marketplace services operate within physically isolated regional enclaves with full GDPR adequacy verified by national regulators.</p>
          </div>
        </div>
        <div className="flex gap-5 sm:gap-8">
          <div className="text-center">
            <div className="text-xl font-black text-slate-900">99.99%</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-slate-900">AES-256</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encryption</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-slate-900">Instant</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Provisioning</div>
          </div>
        </div>
      </div>
    </div>
  );
};
