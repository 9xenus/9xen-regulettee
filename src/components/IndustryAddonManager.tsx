import React, { useState, useEffect } from 'react';
import { Factory, HeartPulse, GraduationCap, CreditCard, Zap, Key, CheckCircle2, AlertCircle, Globe, ShieldCheck, Activity } from 'lucide-react';

interface IndustryAddon {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  price: string;
  status: 'active' | 'inactive' | 'trial';
  apiKey?: string;
  usage: number;
}

const INITIAL_ADDONS: IndustryAddon[] = [
  {
    id: 'health',
    name: 'Healthtech (HIPAA/GDPR-H)',
    icon: HeartPulse,
    description: 'Extended medical data handling and healthcare-specific regulatory routing.',
    price: '$899/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'finance',
    name: 'Fintech (DORA/PCI-DSS)',
    icon: CreditCard,
    description: 'Financial grade security audit trails and digital operational resilience.',
    price: '$1,299/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'edtech',
    name: 'Edtech (COPPA/FERPA)',
    icon: GraduationCap,
    description: 'Student data privacy protection and educational institution compliance.',
    price: '$499/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'manufacturing',
    name: 'Industrial (Product Safety)',
    icon: Factory,
    description: 'Supply chain transparency and regional industrial safety standards.',
    price: '$749/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'govtech',
    name: 'GovTech (B2G/Sovereign)',
    icon: Globe,
    description: 'B2G reporting protocols, sovereign data residency, and public sector encryption standards.',
    price: '$1,499/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'ecommerce',
    name: 'E-commerce (DMA/DSA)',
    icon: Zap,
    description: 'Digital Markets Act compliance, automated dark pattern detection, and cart consent ledger.',
    price: '$399/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'logistics',
    name: 'Logistics (LSC/ESG)',
    icon: Factory,
    description: 'Cross-border supply chain transparency and ESG carbon footprint tracking.',
    price: '$649/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'sar_automation',
    name: 'DSAR Automated Workflow',
    icon: ShieldCheck,
    description: 'Fully automated Subject Access Request retrieval, redaction, and delivery system.',
    price: '$1,199/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'consent_analytics',
    name: 'Smart Consent Analytics',
    icon: Activity,
    description: 'AI-driven A/B testing for consent banners and deep engagement telemetry.',
    price: '$299/mo',
    status: 'inactive',
    usage: 0
  },
  {
    id: 'transfer_enclave',
    name: 'Cross-Border Transfer Enclave',
    icon: Key,
    description: 'Secure TEE-based data processing for cross-border PII transfers with automated adequacy checks.',
    price: '$2,499/mo',
    status: 'inactive',
    usage: 0
  }
];


const IndustryAddonManager: React.FC = () => {
  const [addons, setAddons] = useState<IndustryAddon[]>(() => {
    const saved = localStorage.getItem('industry_addons');
    if (!saved) return INITIAL_ADDONS;
    
    try {
      const parsed = JSON.parse(saved);
      // Merge saved state with initial config to restore icon references
      return INITIAL_ADDONS.map(initial => {
        const savedAddon = parsed.find((p: any) => p.id === initial.id);
        if (savedAddon) {
          return {
            ...initial,
            status: savedAddon.status,
            apiKey: savedAddon.apiKey,
            usage: savedAddon.usage
          };
        }
        return initial;
      });
    } catch (e) {
      console.error("Failed to parse industry addons", e);
      return INITIAL_ADDONS;
    }
  });

  const [loading, setLoading] = useState<string | null>(null);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('industry_addons', JSON.stringify(addons));
  }, [addons]);

  const toggleSubscription = (id: string, isTrial = false) => {
    setLoading(id);
    setTimeout(() => {
      setAddons(prev => prev.map(addon => {
        if (addon.id === id) {
          const isActivating = addon.status === 'inactive' || addon.status === 'trial';
          const newStatus = isTrial ? 'trial' : (addon.status === 'active' ? 'inactive' : 'active');
          return {
            ...addon,
            status: newStatus,
            apiKey: newStatus !== 'inactive' ? `lx_live_${Math.random().toString(36).substring(7)}` : undefined
          };
        }
        return addon;
      }));
      setLoading(null);
      setShowSubscriptionPopup(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-4 sm:p-5 lg:p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 opacity-90" />
            <h2 className="text-2xl font-bold">CaaS Enterprise Marketplace</h2>
          </div>
          <p className="text-indigo-100 max-w-xl">
            Scale your compliance operations with industry-specific vertical modules. 
            All industry add-ons are managed via dedicated APIs for seamless integration.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-5 sm:p-6 lg:p-8 opacity-10">
          <Globe className="w-32 h-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {addons.map((addon) => {
          const Icon = addon.icon;
          const isActive = addon.status === 'active';

          return (
            <div
              key={addon.id}
              
              className={`bg-white rounded-xl border p-4 sm:p-5 lg:p-6 transition-all ${
                isActive ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Subscription</div>
                  <div className={`text-lg font-black ${isActive ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {addon.price}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{addon.name}</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {addon.description}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => isActive ? toggleSubscription(addon.id) : setShowSubscriptionPopup(addon.id)}
                  disabled={!!loading}
                  className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    isActive 
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
                      : addon.status === 'trial'
                      ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                  }`}
                >
                  {loading === addon.id ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : isActive ? (
                    'Cancel Subscription'
                  ) : addon.status === 'trial' ? (
                    'Upgrade to Full Access'
                  ) : (
                    'Activate Module'
                  )}
                </button>

                <React.Fragment>
                  {(isActive || addon.status === 'trial') && (
                    <div
                      
                      
                      
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-slate-900 rounded-lg text-slate-300">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                          <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                            <Key className="w-3 h-3" /> API Integration
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> LIVE
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">LIVE API KEY</label>
                            <div className="bg-slate-800 p-2 rounded font-mono text-xs text-indigo-300 border border-slate-700 break-all">
                              {addon.apiKey}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] text-slate-500 font-bold">ENDPOINT</div>
                            <div className="text-[10px] text-slate-400 font-mono">api.caas-enterprise.io/v1/{addon.id}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>

                {!isActive && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
                    <AlertCircle className="w-3 h-3" />
                    <span>Requires Enterprise Tier. Subscription is per-tenant.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showSubscriptionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div
            
            
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
          >
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Unlock Module</h3>
                </div>
                <button
                  onClick={() => setShowSubscriptionPopup(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Zap className="w-5 h-5 rotate-45 opacity-0" /> {/* Just spacing/hidden close if we want, or real close button */}
                  &times;
                </button>
              </div>

              <p className="text-slate-600 text-sm mb-6">
                This industry-specific compliance module requires a dedicated subscription. You can activate it now or try a limited trial.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => toggleSubscription(showSubscriptionPopup, false)}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  Purchase Subscription
                </button>
                <button
                  onClick={() => toggleSubscription(showSubscriptionPopup, true)}
                  className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200 transition"
                >
                  <AlertCircle className="w-4 h-4" />
                  Try Industry Module (14 Days)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustryAddonManager;
