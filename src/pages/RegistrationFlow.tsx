import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Building2, UserCircle, Scale, FileText, CheckCircle2, Loader2, ArrowRight, Search, Globe, Users, ExternalLink, Filter, BadgeCheck } from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

type EntityType = 'enterprise' | 'lawyer' | 'consultant' | 'regulator' | '';

export function RegistrationFlow() {
  const [activeView, setActiveView] = useState<'flow' | 'directory'>('flow');
  const [entities, setEntities] = useState<any[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    entityType: '' as EntityType,
    name: '',
    email: '',
    password: '',
    taxId: '',
    barNumber: '',
    industries: [] as string[],
    regions: [] as string[],
  });

  const [success, setSuccess] = useState(false);

  const fetchEntities = async () => {
    setLoadingEntities(true);
    try {
      const res = await fetchWithRetry('/api/v1/auth/entities');
      const json = await res.json();
      if (json && json.data) {
        setEntities(json.data);
      }
    } catch (err) {
      console.error('Failed to load registered entities:', err);
    } finally {
      setLoadingEntities(false);
    }
  };

  useEffect(() => {
    if (activeView === 'directory') {
      fetchEntities();
    }
  }, [activeView]);

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const filteredEntities = entities.filter(ent => {
    const matchesSearch = searchQuery === '' || 
      ent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ent.tax_id && ent.tax_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ent.bar_number && ent.bar_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'ALL' || ent.entity_type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const toggleIndustry = (ind: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(ind)
        ? prev.industries.filter(i => i !== ind)
        : [...prev.industries, ind]
    }));
  };

  const toggleRegion = (reg: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(reg)
        ? prev.regions.filter(r => r !== reg)
        : [...prev.regions, reg]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/auth/register-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && (data?.success || res.status === 201)) {
        setSuccess(true);
        // After successful registration, route based on entity type:
        setTimeout(() => {
          if (formData.entityType === 'regulator') {
            window.location.hash = '#regulator-dashboard';
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'regulator-dashboard' }));
          } else if (formData.entityType === 'lawyer' || formData.entityType === 'consultant') {
            window.location.hash = '#marketplace-profile';
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'marketplace-profile' }));
          } else {
            window.location.hash = '#platform-dashboard';
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'platform-dashboard' }));
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Registration Complete</h2>
          <p className="text-slate-600 text-sm">
            Your {formData.entityType} profile has been created successfully. Redirecting you to your workspace...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Sovereign<span className="text-indigo-600">Compliance</span></h1>
            <p className="text-xs text-slate-500 font-medium">Enterprise Onboarding & Public Entity KYB Registry</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveView('flow')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'flow'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Registration
          </button>
          <button
            type="button"
            onClick={() => setActiveView('directory')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'directory'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Entities Directory ({entities.length})</span>
          </button>
        </div>
      </div>

      {activeView === 'directory' ? (
        <div className="w-full max-w-4xl space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search entities, bar #, or tax ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: 'ALL', label: 'All Entities' },
                { id: 'enterprise', label: 'Enterprises' },
                { id: 'lawyer', label: 'Legal Counsel' },
                { id: 'consultant', label: 'Consultants' },
                { id: 'regulator', label: 'Regulators' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Grid */}
          {loadingEntities ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Loading verified entities...</p>
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Entities Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No verified entities match your search criteria. You can register a new legal entity or enterprise account.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('flow')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Start Entity Registration
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntities.map((ent: any) => (
                <div key={ent.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{ent.name}</h4>
                        <p className="text-xs text-slate-500">{ent.email}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        ent.entity_type === 'lawyer'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : ent.entity_type === 'regulator'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : ent.entity_type === 'consultant'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {ent.entity_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-400 block font-medium">Status</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          {ent.status || 'PENDING'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Credential</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {ent.bar_number ? `Bar: ${ent.bar_number}` : ent.tax_id ? `Tax: ${ent.tax_id}` : 'Verified Org'}
                        </span>
                      </div>
                    </div>

                    {ent.industries && ent.industries.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ent.industries.map((ind: string) => (
                          <span key={ind} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px]">
                      Registered {new Date(ent.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => { window.location.hash = '#profile'; }}
                      className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>View Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 translate-y-2 px-12">
              <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            </div>
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex flex-col items-center gap-2 z-10 bg-slate-50 px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step >= num ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
                </div>
              </div>
            ))}
          </div>

        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Select Entity Type</h2>
                  <p className="text-slate-500 mt-2">How will you be using Sovereign Compliance?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({...formData, entityType: 'enterprise'})}
                    className={`p-6 border-2 rounded-2xl text-left transition-all ${formData.entityType === 'enterprise' ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-600/10' : 'border-slate-200 hover:border-indigo-300'}`}
                  >
                    <Building2 className={`w-8 h-8 mb-4 ${formData.entityType === 'enterprise' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <h3 className="font-bold text-slate-900 mb-1">Enterprise Client</h3>
                    <p className="text-xs text-slate-500">Manage organizational compliance, audits, and DPO workflows.</p>
                  </button>
                  
                  <button type="button" onClick={() => setFormData({...formData, entityType: 'lawyer'})}
                    className={`p-6 border-2 rounded-2xl text-left transition-all ${formData.entityType === 'lawyer' ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-600/10' : 'border-slate-200 hover:border-indigo-300'}`}
                  >
                    <Scale className={`w-8 h-8 mb-4 ${formData.entityType === 'lawyer' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <h3 className="font-bold text-slate-900 mb-1">External Legal Counsel</h3>
                    <p className="text-xs text-slate-500">Offer legal services and access client compliance profiles via delegation.</p>
                  </button>

                  <button type="button" onClick={() => setFormData({...formData, entityType: 'consultant'})}
                    className={`p-6 border-2 rounded-2xl text-left transition-all ${formData.entityType === 'consultant' ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-600/10' : 'border-slate-200 hover:border-indigo-300'}`}
                  >
                    <UserCircle className={`w-8 h-8 mb-4 ${formData.entityType === 'consultant' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <h3 className="font-bold text-slate-900 mb-1">Regulatory Consultant</h3>
                    <p className="text-xs text-slate-500">Independent auditor, compliance advisor, or external DPO.</p>
                  </button>

                  <button type="button" onClick={() => setFormData({...formData, entityType: 'regulator'})}
                    className={`p-6 border-2 rounded-2xl text-left transition-all ${formData.entityType === 'regulator' ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-600/10' : 'border-slate-200 hover:border-indigo-300'}`}
                  >
                    <ShieldCheck className={`w-8 h-8 mb-4 ${formData.entityType === 'regulator' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <h3 className="font-bold text-slate-900 mb-1">National Regulator</h3>
                    <p className="text-xs text-slate-500">Official government body (e.g. BaFin, CNIL) to access oversight tools.</p>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>
                  <p className="text-slate-500 mt-2">Set up your account credentials.</p>
                </div>
                
                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name / Organization Name</label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Work Email Address</label>
                    <input 
                      type="email" required
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Secure Password</label>
                    <input 
                      type="password" required
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Identity Verification (KYC/KYB)</h2>
                  <p className="text-slate-500 mt-2">Please provide official documentation to verify your identity.</p>
                </div>
                
                <div className="space-y-6 max-w-md mx-auto">
                  {formData.entityType === 'enterprise' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">National Tax ID / VAT Number</label>
                      <input 
                        type="text" required
                        value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {formData.entityType === 'lawyer' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Bar Association Registration Number</label>
                      <input 
                        type="text" required
                        value={formData.barNumber} onChange={e => setFormData({...formData, barNumber: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-700">Upload Registration Document</h4>
                    <p className="text-xs text-slate-500 mt-1">PDF or image file (max 10MB)</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Compliance Baseline</h2>
                  <p className="text-slate-500 mt-2">Help us customize your ontology and intelligence feeds.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Which industries do you operate in?</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Financial Services', 'Healthcare', 'Technology', 'E-Commerce', 'Public Sector'].map(ind => (
                        <button type="button" key={ind}
                          onClick={() => toggleIndustry(ind)}
                          className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                            formData.industries.includes(ind) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Which regions do you operate in?</h3>
                    <div className="flex flex-wrap gap-2">
                      {['European Union', 'United Kingdom', 'United States', 'Singapore', 'UAE'].map(reg => (
                        <button type="button" key={reg}
                          onClick={() => toggleRegion(reg)}
                          className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                            formData.regions.includes(reg) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {reg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex justify-between pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button type="button" onClick={handlePrev} className="px-6 py-2.5 text-slate-600 font-bold hover:text-slate-900">
                Back
              </button>
            ) : <div />}
            
            <button 
              type="submit" 
              disabled={step === 1 && !formData.entityType}
              className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 4 ? 'Complete Registration' : 'Continue'}
              {!loading && step < 4 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
);
}
