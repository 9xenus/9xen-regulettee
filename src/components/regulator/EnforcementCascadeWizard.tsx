import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Settings,
  Globe,
  Database,
  Lock,
  Search,
  Users,
  Gavel,
  FileBadge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { validateEnforcementLevel } from '../../utils/enforcementValidation';
import { ActorRole, EnforcementLevelTemplate } from '../../types';

export const EnforcementCascadeWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [levels, setLevels] = useState<EnforcementLevelTemplate[]>([]);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/v1/enforcement/templates');
        const data = await res.json();
        setLevels(data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleLevelToggle = (id: string) => {
    const template = levels.find(l => l.id === id);
    setConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id]?.enabled,
        mode: prev[id]?.mode || template?.defaultMode || 'MANUAL',
        levelTemplateId: id,
        legalBasis: prev[id]?.legalBasis || { regulation: 'GDPR', article: '', jurisdictionRef: 'EU' },
        triggerConditions: prev[id]?.triggerConditions || { riskThreshold: 75, violationTypes: ['DATA_BREACH'] },
        approvalPolicy: prev[id]?.approvalPolicy || { requiredApprovers: 1, approverRoles: ['regulator_approver'] as ActorRole[], slaHours: 24, allowSelfApproval: false }
      }
    }));
    setErrors([]);
  };

  const handleModeChange = (id: string, mode: 'AUTO' | 'MANUAL' | 'CONDITIONAL') => {
    setConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        mode
      }
    }));
  };

  const handleFieldChange = (id: string, section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [section]: {
          ...prev[id][section],
          [field]: value
        }
      }
    }));
    setErrors([]);
  };

  const validateStep = () => {
    if (currentStep >= levels.length) return true;
    const currentLevelId = levels[currentStep].id;
    const levelConfig = config[currentLevelId];

    if (!levelConfig || !levelConfig.enabled) return true;

    const validationErrors = validateEnforcementLevel(levelConfig);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const levelSettings = Object.values(config);
      const res = await fetch('/api/v1/enforcement/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'system',
          countryCode: 'EU',
          regulationCode: 'GDPR',
          name: 'EU Standard GDPR Enforcement Cascade',
          status: 'DRAFT',
          levelSettings: levelSettings.map(s => ({
            ...s,
            executionMode: s.mode
          }))
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const next = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, levels.length));
      setErrors([]);
    }
  };
  const prev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-5 sm:p-6 lg:p-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Scale className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-black tracking-tight">Jurisdictional Publishing Wizard</h2>
        </div>
        <p className="text-slate-400 text-sm">8-Level Jurisdiction Specific Enforcement Profile Wizard</p>
        
        {/* Progress Bar */}
        <div className="mt-8 flex items-center space-x-2">
          {levels.map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= currentStep ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {currentStep < levels.length ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Database className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Level {currentStep + 1}: {levels[currentStep].label}</h3>
                  <p className="text-slate-500 mt-1">{levels[currentStep].description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8">
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={config[levels[currentStep].id]?.enabled || false}
                      onChange={() => handleLevelToggle(levels[currentStep].id)}
                      className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-slate-700">Enable this Enforcement Level</span>
                  </label>

                  {config[levels[currentStep].id]?.enabled && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Execution Mode</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['AUTO', 'MANUAL', 'CONDITIONAL'].map((m) => (
                          <button
                            key={m}
                            onClick={() => handleModeChange(levels[currentStep].id, m as any)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg border text-left transition-all ${
                              config[levels[currentStep].id]?.mode === m 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()} Mode
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Legal Basis (Article Ref)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. GDPR Art 83(4)"
                      value={config[levels[currentStep].id]?.legalBasis?.article || ''}
                      onChange={(e) => handleFieldChange(levels[currentStep].id, 'legalBasis', 'article', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Trigger Threshold (Risk Score)</label>
                    <input 
                      type="number" 
                      placeholder="75"
                      value={config[levels[currentStep].id]?.triggerConditions?.riskThreshold || ''}
                      onChange={(e) => handleFieldChange(levels[currentStep].id, 'triggerConditions', 'riskThreshold', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {errors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-rose-50 border border-rose-100 rounded-xl p-4 mt-4"
                >
                  <div className="flex items-center space-x-2 text-rose-600 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-bold text-sm">Configuration Errors</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-rose-500 space-y-1">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Profile Ready</h3>
              <p className="text-slate-500 mt-2">The jurisdiction enforcement profile is ready for simulation and approval.</p>
              
              {saveSuccess && (
                <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 animate-bounce">
                  Configuration Saved Successfully
                </div>
              )}

              <div className="mt-8 flex justify-center space-x-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Gavel className="w-4 h-4" />
                      <span>Publish Draft Profile</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-between pt-8 border-t border-slate-100">
          <button 
            onClick={prev}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 text-slate-500 font-bold hover:text-slate-900 disabled:opacity-30"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          {currentStep < levels.length && (
            <button 
              onClick={next}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 flex items-center space-x-2 transition-all shadow-lg shadow-slate-900/10"
            >
              <span>{currentStep === levels.length - 1 ? 'Review Final Profile' : 'Next Level'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
