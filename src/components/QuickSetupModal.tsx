import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, ShieldCheck, ShoppingCart, Webhook, 
  ChevronRight, ChevronLeft, Check, X, 
  Sparkles, Rocket, AlertCircle, Info,
  Settings2, Loader2, PartyPopper
} from 'lucide-react';

interface AddonOption {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  category: string;
  defaultConfig: Record<string, any>;
  schema: any[];
}

const QUICK_SETUP_ADDONS: AddonOption[] = [
  {
    id: 'gdpr-compliance',
    name: 'GDPR Compliance Core',
    icon: ShieldCheck,
    category: 'Data Privacy',
    description: 'Essential Article 30/32 orchestration and automated DSAR intake.',
    defaultConfig: {
      dpo_email: 'compliance@company.eu',
      dsar_auto_response: true,
      retention_days: 365
    },
    schema: [
      { key: 'dpo_email', label: 'DPO Contact Email', type: 'text', placeholder: 'dpo@company.eu' },
      { key: 'dsar_auto_response', label: 'Auto-DSAR Intake', type: 'boolean' },
      { key: 'retention_days', label: 'PII Retention (Days)', type: 'number' }
    ]
  },
  {
    id: 'ecommerce-eu',
    name: 'EU E-Commerce Suite',
    icon: ShoppingCart,
    category: 'Retail',
    description: 'Consumer rights, geoblocking, and Omnibus pricing compliance.',
    defaultConfig: {
      enable_geoblocking_check: true,
      minimum_refund_period_days: 14
    },
    schema: [
      { key: 'enable_geoblocking_check', label: 'Enforce Geoblocking', type: 'boolean' },
      { key: 'minimum_refund_period_days', label: 'Refund Window (Days)', type: 'number' }
    ]
  },
  {
    id: 'remediation_api',
    name: 'Remediation Webhooks',
    icon: Webhook,
    category: 'Automation',
    description: 'Automated endpoint PII remediation and policy drift alerts.',
    defaultConfig: {
      enable_auto_purge: true
    },
    schema: [
      { key: 'enable_auto_purge', label: 'Auto-Purge Non-Compliant Data', type: 'boolean' }
    ]
  }
];

interface QuickSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onComplete: (activatedIds: string[]) => void;
}

export const QuickSetupModal: React.FC<QuickSetupModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  onComplete
}) => {
  const [step, setStep] = useState(0); // 0: Select, 1: Configure, 2: Progress, 3: Success
  const [selectedIds, setSelectedIds] = useState<string[]>(QUICK_SETUP_ADDONS.map(a => a.id));
  const [configs, setConfigs] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    QUICK_SETUP_ADDONS.forEach(a => {
      initial[a.id] = { ...a.defaultConfig };
    });
    return initial;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectedAddons = useMemo(() => 
    QUICK_SETUP_ADDONS.filter(a => selectedIds.includes(a.id)),
  [selectedIds]);

  const handleToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfigChange = (addonId: string, key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [addonId]: {
        ...prev[addonId],
        [key]: value
      }
    }));
  };

  const runOnboarding = async () => {
    setIsProcessing(true);
    setStep(2);
    
    const totalSteps = selectedIds.length * 2; // Activate + Config for each
    let currentStep = 0;

    try {
      for (const id of selectedIds) {
        // 1. Activate
        currentStep++;
        setProgress(Math.round((currentStep / totalSteps) * 100));
        await new Promise(r => setTimeout(r, 600)); // Simulate API delay
        
        // Mock API call to activate
        await fetch(`/api/v1/caas/tenants/${tenantId}/subscriptions/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' })
        });

        // 2. Configure
        currentStep++;
        setProgress(Math.round((currentStep / totalSteps) * 100));
        await new Promise(r => setTimeout(r, 400));
        
        // Mock API call to config
        await fetch(`/api/v1/caas/tenants/${tenantId}/subscriptions/${id}/config`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ configValues: configs[id] })
        });
      }

      setStep(3);
      onComplete(selectedIds);
    } catch (error) {
      console.error("Quick setup failed", error);
      setStep(0);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sovereign Quick Setup</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accelerated Marketplace Onboarding</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 lg:p-8 min-h-[400px] flex flex-col">
            {step === 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
                  <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                  <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                    We've identified the most critical compliance modules often missed during initial setup. Select the enclaves you wish to activate instantly.
                  </p>
                </div>

                <div className="grid gap-4">
                  {QUICK_SETUP_ADDONS.map((addon) => {
                    const isSelected = selectedIds.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => handleToggle(addon.id)}
                        className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100' 
                            : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-5 text-left">
                          <div className={`p-4 rounded-2xl transition-colors ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}>
                            <addon.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{addon.category}</div>
                            <h4 className="font-black text-slate-900">{addon.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">{addon.description}</p>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'
                        }`}>
                          {isSelected && <Check className="w-5 h-5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5 sm:space-y-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Configuration Tuning</h3>
                  <span className="text-[10px] font-bold text-slate-500">{selectedAddons.length} Modules to Configure</span>
                </div>

                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedAddons.map((addon) => (
                    <div key={addon.id} className="space-y-4 p-4 sm:p-5 lg:p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <addon.icon className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-black text-slate-900 text-sm">{addon.name}</h4>
                      </div>
                      
                      <div className="grid gap-4">
                        {addon.schema.map((field: any) => (
                          <div key={field.key} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                              {field.label}
                            </label>
                            
                            {field.type === 'text' && (
                              <input
                                type="text"
                                value={configs[addon.id][field.key]}
                                onChange={(e) => handleConfigChange(addon.id, field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                              />
                            )}

                            {field.type === 'number' && (
                              <input
                                type="number"
                                value={configs[addon.id][field.key]}
                                onChange={(e) => handleConfigChange(addon.id, field.key, Number(e.target.value))}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                              />
                            )}

                            {field.type === 'boolean' && (
                              <button
                                onClick={() => handleConfigChange(addon.id, field.key, !configs[addon.id][field.key])}
                                className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
                                  configs[addon.id][field.key] 
                                    ? 'bg-emerald-50 border-emerald-500/30 text-emerald-700' 
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                              >
                                <span className="text-xs font-bold">{configs[addon.id][field.key] ? 'Enabled' : 'Disabled'}</span>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  configs[addon.id][field.key] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                                }`}>
                                  {configs[addon.id][field.key] && <Check className="w-3.5 h-3.5" />}
                                </div>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-5 sm:space-y-8">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-4 border-indigo-100 border-t-indigo-600"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-indigo-600 animate-bounce" />
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Provisioning Enclaves</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-[280px]">
                    Activating selected modules and pushing cryptographically signed configurations...
                  </p>
                </div>

                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    <span>Deploying Pipeline</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center py-5 sm:py-8 space-y-5 sm:space-y-8"
              >
                <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-200">
                  <PartyPopper className="w-12 h-12 text-white" />
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Onboarding Complete!</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-md">
                    Your sovereign workspace has been successfully updated. All selected compliance modules are now active and enforcing policies across your tenant.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-4 sm:p-5 lg:p-6 w-full border border-slate-100 flex flex-wrap gap-3 justify-center">
                  {selectedAddons.map(a => (
                    <div key={a.id} className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <a.icon className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700">{a.name}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Footer Buttons */}
            <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100">
              {step < 2 ? (
                <>
                  <button
                    onClick={step === 0 ? onClose : () => setStep(0)}
                    className="px-6 py-3.5 text-xs font-black text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 group"
                  >
                    {step === 0 ? (
                      'SKIP FOR NOW'
                    ) : (
                      <>
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        BACK
                      </>
                    )}
                  </button>
                  <button
                    onClick={step === 0 ? () => setStep(1) : runOnboarding}
                    disabled={selectedIds.length === 0}
                    className="px-8 py-3.5 bg-slate-950 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center gap-2 group"
                  >
                    {step === 0 ? (
                      <>
                        CONTINUE TO CONFIG
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        FINALIZE & ACTIVATE
                        <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </>
              ) : step === 3 ? (
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
                >
                  RETURN TO DASHBOARD
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
