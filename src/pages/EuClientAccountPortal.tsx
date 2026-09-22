import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  UserPlus, 
  Users,
  FileText,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ChevronRight,
  Save,
  Globe,
  Network,
  Layers,
  Zap,
  Check,
  Search,
  SlidersHorizontal,
  Sparkles,
  Download,
  Clock,
  KeyRound,
  Shield,
  Scale,
  Cpu,
  Truck,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { VerificationDetailsModal } from '../components/layout/VerificationDetailsModal';

import { EuCompliancePortalConfigurator } from '../components/EuCompliancePortalConfigurator';
import { IntegrationsScanHub } from '../components/IntegrationsScanHub';

type TabId = 'registration' | 'subscriptions' | 'management' | 'clients' | 'policies' | 'integrations' | 'billing' | 'verification' | 'configuration';

interface AIModule {
  id: string;
  name: string;
  category: string;
  description: string;
  priceMonthly: number;
  active: boolean;
  isTrial?: boolean;
  trialDaysLeft?: number;
  quotaUsed: number;
  quotaLimit: number;
  assignedLead: string;
  icon: React.FC<any>;
}

export const EuClientAccountPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('subscriptions');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscription state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'business' | 'sovereign'>('business');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchModule, setSearchModule] = useState<string>('');

  const { user, session } = useAuth();
  const verificationStatus = user?.user_metadata?.verificationStatus || 'Pending';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  // AI Modules registry list
  const [modules, setModules] = useState<AIModule[]>([
    {
      id: 'contract-compliance',
      name: 'Contract & DPA Legal Audit',
      category: 'Legal & Contracts',
      description: 'Automated GDPR Art 28 DPA clause scanner and EU cross-border vendor contract risk detection.',
      priceMonthly: 199,
      active: true,
      quotaUsed: 840,
      quotaLimit: 1000,
      assignedLead: 'Alice Smith (Legal Lead)',
      icon: Scale
    },
    {
      id: 'procurement-csddd',
      name: 'Procurement & CSDDD Due Diligence',
      category: 'Supply Chain & Procurement',
      description: 'Tier-1 & Tier-2 supply chain ESG, human rights, and sanction directory verification.',
      priceMonthly: 249,
      active: true,
      quotaUsed: 42,
      quotaLimit: 50,
      assignedLead: 'Bob Johnson (Procurement)',
      icon: Network
    },
    {
      id: 'vendor-nis2',
      name: 'Vendor & NIS2 Supply Chain Risk',
      category: 'Cybersecurity & Resilience',
      description: 'Continuous NIS2 essential & important entity third-party cyber risk scoring.',
      priceMonthly: 179,
      active: true,
      quotaUsed: 18,
      quotaLimit: 25,
      assignedLead: 'Bob Johnson (CISO)',
      icon: Shield
    },
    {
      id: 'asset-compliance',
      name: 'Sovereign KMS Asset Compliance',
      category: 'Assets & Operations',
      description: 'FIPS 140-3 HSM root key enclave management and hardware data lifecycle tracking.',
      priceMonthly: 299,
      active: true,
      isTrial: true,
      trialDaysLeft: 11,
      quotaUsed: 120,
      quotaLimit: 500,
      assignedLead: 'SecOps Team',
      icon: HardDrive
    },
    {
      id: 'fleet-compliance',
      name: 'Fleet EV & Logistics Telematics',
      category: 'Assets & Operations',
      description: 'Real-time CO2 emissions monitoring, battery health, and EU driver shift compliance.',
      priceMonthly: 149,
      active: false,
      quotaUsed: 0,
      quotaLimit: 100,
      assignedLead: 'Fleet Manager',
      icon: Truck
    },
    {
      id: 'esg-compliance',
      name: 'ESG CSRD Green Data Ledger',
      category: 'Supply Chain & Procurement',
      description: 'Scope 1, 2, 3 carbon footprint calculation and EU CSRD audit report generator.',
      priceMonthly: 189,
      active: true,
      quotaUsed: 15,
      quotaLimit: 30,
      assignedLead: 'Sustainability Team',
      icon: Globe
    },
    {
      id: 'ai-governance',
      name: 'EU AI Act Governance & Model Lineage',
      category: 'AI & Innovation',
      description: 'High-risk AI system risk assessment, training data lineage, and biometric compliance.',
      priceMonthly: 349,
      active: true,
      quotaUsed: 6,
      quotaLimit: 10,
      assignedLead: 'AI Risk Officer',
      icon: Cpu
    },
    {
      id: 'internal-audit',
      name: 'Internal Audit Management (ISO 19011)',
      category: 'Audit & Quality',
      description: 'ISO 19011 audit planning, non-conformity logging, and automated auditor evidence trails.',
      priceMonthly: 129,
      active: true,
      quotaUsed: 3,
      quotaLimit: 10,
      assignedLead: 'Alice Smith (Internal Auditor)',
      icon: FileCheck2
    },
    {
      id: 'capa-management',
      name: 'CAPA Corrective Action Tracker',
      category: 'Audit & Quality',
      description: 'Automated 15-day SLA escalation workflow for audit findings and regulatory deviations.',
      priceMonthly: 99,
      active: true,
      quotaUsed: 8,
      quotaLimit: 20,
      assignedLead: 'Compliance Manager',
      icon: AlertTriangle
    },
    {
      id: 'bcp-dr-tracking',
      name: 'BCP & DORA Disaster Recovery',
      category: 'Cybersecurity & Resilience',
      description: 'DORA digital operational resilience drills, RTO/RPO sync tracking, and failover tests.',
      priceMonthly: 219,
      active: false,
      quotaUsed: 0,
      quotaLimit: 12,
      assignedLead: 'IT Operations',
      icon: Zap
    }
  ]);

  const toggleModuleState = (id: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.active;
        showToast(nextState 
          ? `Activated module [${m.name}]! Added to active subscription.` 
          : `Deactivated module [${m.name}]. Changes will apply next billing cycle.`
        );
        return { ...m, active: nextState, isTrial: false };
      }
      return m;
    }));
  };

  const startModuleTrial = (id: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === id) {
        showToast(`Started 14-Day Free Trial for [${m.name}]!`);
        return { ...m, active: true, isTrial: true, trialDaysLeft: 14 };
      }
      return m;
    }));
  };

  const basePlanPrices = {
    starter: billingCycle === 'annual' ? 249 : 299,
    business: billingCycle === 'annual' ? 799 : 999,
    sovereign: billingCycle === 'annual' ? 1999 : 2499
  };

  const activeModulesCost = modules
    .filter(m => m.active && !m.isTrial)
    .reduce((acc, curr) => acc + curr.priceMonthly, 0);

  const totalMonthlyCost = basePlanPrices[selectedPlan] + (billingCycle === 'annual' ? activeModulesCost * 0.8 : activeModulesCost);

  const filteredModules = modules.filter(m => {
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    const matchesSearch = m.name.toLowerCase().includes(searchModule.toLowerCase()) || m.description.toLowerCase().includes(searchModule.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const tabs: { id: TabId; label: string; icon: React.FC<any> }[] = [
    { id: 'subscriptions', label: 'AI Modules & Subscriptions', icon: Layers },
    { id: 'registration', label: 'Registration & Profile', icon: UserPlus },
    { id: 'management', label: 'Team Management', icon: Building2 },
    { id: 'clients', label: 'EU Clients', icon: Users },
    { id: 'policies', label: 'Policies & CMS', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Network },
    { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'verification', label: 'KYC & Verification', icon: ShieldCheck },
    { id: 'configuration', label: 'EU Configuration', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Notification Toast */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            EU Client Subscription & AI Module Manager
          </h1>
          <p className="text-slate-500 mt-2 max-w-3xl">
            Easily manage your enterprise base plan, activate specialized AI compliance modules according to your business needs, track quota usage, and assign team leads.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-xs font-semibold text-indigo-900">
          <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Active Plan: <strong className="uppercase">{selectedPlan}</strong> ({modules.filter(m => m.active).length} Modules Active)</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Quick Summary Widget */}
          <div className="mt-6 p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Investment</div>
            <div className="text-2xl font-extrabold text-indigo-400">
              €{Math.round(totalMonthlyCost).toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ mo</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Includes Base {selectedPlan.toUpperCase()} Plan + {modules.filter(m => m.active && !m.isTrial).length} Add-on Modules.
            </div>
            {billingCycle === 'annual' && (
              <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                20% Annual Discount Applied
              </span>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-4 sm:space-y-6">

          {/* 1. TAB: AI MODULES & SUBSCRIPTION MANAGEMENT */}
          {activeTab === 'subscriptions' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-8">
              
              {/* STEP 1: BASE PLAN SELECTION & BILLING TOGGLE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      1. Select Base Platform Tier
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Choose the base infrastructure scale for your organization.</p>
                  </div>

                  {/* Monthly / Annual Toggle */}
                  <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Monthly Billing
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>Annual (Save 20%)</span>
                      <span className="px-1 py-0.2 bg-emerald-400 text-slate-950 text-[9px] font-extrabold rounded">SAVE</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Starter */}
                  <div 
                    onClick={() => {
                      setSelectedPlan('starter');
                      showToast('Switched to Starter Plan!');
                    }}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'starter' ? 'border-indigo-600 bg-indigo-50/40 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    {selectedPlan === 'starter' && (
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white p-1 rounded-full"><Check className="w-3.5 h-3.5" /></span>
                    )}
                    <h4 className="text-base font-bold text-slate-900">Starter Business</h4>
                    <p className="text-xs text-slate-500 mt-1">Ideal for SME compliance teams</p>
                    <div className="my-4">
                      <span className="text-2xl font-extrabold text-slate-900">€{basePlanPrices.starter}</span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 border-t border-slate-100 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 3 Active AI Modules</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 5 User Seats</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Standard API Rate Limits</li>
                    </ul>
                  </div>

                  {/* Business Pro */}
                  <div 
                    onClick={() => {
                      setSelectedPlan('business');
                      showToast('Switched to Business Pro Plan!');
                    }}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'business' ? 'border-indigo-600 bg-indigo-50/40 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <span className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      MOST POPULAR
                    </span>
                    {selectedPlan === 'business' && (
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white p-1 rounded-full"><Check className="w-3.5 h-3.5" /></span>
                    )}
                    <h4 className="text-base font-bold text-slate-900">Business Pro</h4>
                    <p className="text-xs text-slate-500 mt-1">For growing multi-regional firms</p>
                    <div className="my-4">
                      <span className="text-2xl font-extrabold text-slate-900">€{basePlanPrices.business}</span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 border-t border-slate-100 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Up to 10 Active AI Modules</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 25 User Seats & Role RBAC</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 24/7 Regulatory SLA Support</li>
                    </ul>
                  </div>

                  {/* Sovereign Enterprise */}
                  <div 
                    onClick={() => {
                      setSelectedPlan('sovereign');
                      showToast('Switched to Sovereign Enterprise Plan!');
                    }}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'sovereign' ? 'border-indigo-600 bg-indigo-50/40 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    {selectedPlan === 'sovereign' && (
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white p-1 rounded-full"><Check className="w-3.5 h-3.5" /></span>
                    )}
                    <h4 className="text-base font-bold text-slate-900">Sovereign Enterprise</h4>
                    <p className="text-xs text-slate-500 mt-1">Dedicated HSM enclave & full suites</p>
                    <div className="my-4">
                      <span className="text-2xl font-extrabold text-slate-900">€{basePlanPrices.sovereign}</span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 border-t border-slate-100 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited AI Modules</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Dedicated HSM Enclave</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited Seats & Custom Roles</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* STEP 2: BUSINESS USE-CASE FILTER & AI MODULES MARKETPLACE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-600" />
                      2. Business AI Modules & Add-on Subscriptions
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Toggle modules on or off according to your operational needs.</p>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder="Search AI modules..."
                      value={searchModule}
                      onChange={(e) => setSearchModule(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Category Filters Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    'all',
                    'Legal & Contracts',
                    'Supply Chain & Procurement',
                    'Cybersecurity & Resilience',
                    'Assets & Operations',
                    'Audit & Quality',
                    'AI & Innovation'
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        categoryFilter === cat 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Business Categories' : cat}
                    </button>
                  ))}
                </div>

                {/* Grid of AI Modules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredModules.map((m) => {
                    const IconComponent = m.icon;
                    return (
                      <div 
                        key={m.id}
                        className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                          m.active 
                            ? 'border-indigo-200 bg-indigo-50/20 shadow-xs' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2.5 rounded-lg ${m.active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                                  {m.category}
                                </span>
                              </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                              onClick={() => toggleModuleState(m.id)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                m.active ? 'bg-indigo-600' : 'bg-slate-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  m.active ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>

                          {/* Quota / Usage meter if active */}
                          {m.active && (
                            <div className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                                <span>Monthly Usage Quota</span>
                                <span className="font-mono text-indigo-600">{m.quotaUsed} / {m.quotaLimit} Actions</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-600 rounded-full"
                                  style={{ width: `${Math.min(100, (m.quotaUsed / m.quotaLimit) * 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer bar of card */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-extrabold text-slate-900">€{m.priceMonthly}</span>
                            <span className="text-[10px] text-slate-500"> / mo</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {m.isTrial ? (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {m.trialDaysLeft} Days Trial Left
                              </span>
                            ) : m.active ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" /> Subscribed
                              </span>
                            ) : (
                              <button
                                onClick={() => startModuleTrial(m.id)}
                                className="text-[10px] bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-md transition-colors"
                              >
                                Try 14 Days Free
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: SUMMARY & CHECKOUT / UPDATE ACKNOWLEDGMENT */}
              <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                      Subscription Confirmation & Invoice Summary
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Changes are applied immediately. Instant audit receipt provided for accounting.</p>
                  </div>
                  <button 
                    onClick={() => {
                      showToast('Subscription updated successfully! Receipt downloaded.');
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
                  >
                    <Save className="w-4 h-4" /> Save & Update Subscription
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 uppercase text-[9px] block">Base Infrastructure Plan</span>
                    <span className="text-white font-bold text-sm uppercase">{selectedPlan} Tier</span>
                    <span className="text-indigo-400 block mt-1">€{basePlanPrices[selectedPlan]} / mo</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 uppercase text-[9px] block">Active AI Modules ({modules.filter(m => m.active).length})</span>
                    <span className="text-white font-bold text-sm">€{Math.round(activeModulesCost)} / mo</span>
                    <span className="text-slate-400 block mt-1">{modules.filter(m => m.isTrial).length} Module in Free Trial</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 uppercase text-[9px] block">Total Monthly Equivalent</span>
                    <span className="text-emerald-400 font-extrabold text-base">€{Math.round(totalMonthlyCost).toLocaleString()} / mo</span>
                    <span className="text-slate-400 block mt-1">{billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB: REGISTRATION & PROFILE */}
          {activeTab === 'registration' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-indigo-600" />
                      Organization Registration & Profile
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Legal entity profile, EU establishment data, DPO designation, and onboarding verification status.
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                    user?.email ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <Shield className="w-3.5 h-3.5" />
                    {user?.email ? 'Registration Verified' : 'Awaiting Verification'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-5 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Legal Entity
                    </span>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700">Registered Legal Name (EU)</span>
                      <input
                        type="text"
                        defaultValue={user?.user_metadata?.orgName || 'Acme Corporation Europe'}
                        className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700">Company Registration / LEI</span>
                      <input
                        type="text"
                        defaultValue="EU-LEI-213800WAVMEZ5H4YKX77"
                        className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700">VAT Number (EU)</span>
                      <input
                        type="text"
                        defaultValue="LU 26375245"
                        className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700">Registered Seat Jurisdiction</span>
                      <select className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none">
                        <option>Luxembourg (EU)</option>
                        <option>Germany (EU)</option>
                        <option>France (EU)</option>
                        <option>Ireland (EU)</option>
                        <option>Netherlands (EU)</option>
                      </select>
                    </label>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" /> Account & DPO Contact
                    </span>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700">Primary Admin Email</span>
                      <input
                        type="email"
                        defaultValue={user?.email || 'admin@acme-europe.eu'}
                        className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700">Designated Data Protection Officer</span>
                      <input
                        type="text"
                        defaultValue="Dr. Claudia Mertens (DPO, Reg. BER-DPO-0042)"
                        className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold text-slate-700">Authorized Representative (Art. 27 GDPR)</span>
                      <input
                        type="text"
                        defaultValue="Axiom Legal EU Ltd — Frankfurt Office"
                        className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-600">KYC / Beneficial Ownership submission on file</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-600">EU-Unit 2.0 adequacy status verified by DPA</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    Supporting incorporation docs uploaded: 3 of 3 required
                  </div>
                  <button
                    onClick={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); setSaveSuccess(true); showToast('Registration profile updated successfully!'); }, 700); }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saveSuccess ? 'Profile Saved' : 'Save Registration Profile'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 uppercase text-[9px] block">Onboarding Stage</span>
                  <span className="text-white font-bold text-sm">
                    {user?.email ? '4 / 4 Completed' : '3 / 4 In Progress'}
                  </span>
                  <span className="text-indigo-400 block mt-1">{user?.email ? 'EU DPA Review Passed' : 'Awaiting Legal Doc Review'}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 uppercase text-[9px] block">Sector Registration</span>
                  <span className="text-white font-bold text-sm">FinTech / Digital Finance</span>
                  <span className="text-slate-400 block mt-1">(Sector addon modules pre-selected)</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-slate-500 uppercase text-[9px] block">Sovereign Data Residency</span>
                  <span className="text-emerald-400 font-extrabold text-sm">EU Frankfurt Node</span>
                  <span className="text-slate-400 block mt-1">DPF certified · eu-central-1</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'management' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Team & Account Management
                  </h3>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    + Invite Member
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Name</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Alice Smith', email: 'alice@acme.eu', role: 'Account Owner', status: 'Active', initials: 'AS' },
                        { name: 'Bob Johnson', email: 'bob@acme.eu', role: 'Billing Admin', status: 'Active', initials: 'BJ' },
                        { name: 'Charlie Davis', email: 'charlie@acme.eu', role: 'DPO', status: 'Pending', initials: 'CD' },
                      ].map((user, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                                {user.initials}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 text-sm">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 font-medium">{user.role}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                              user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 shadow-sm'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    EU Clients & Projects
                  </h3>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    + Add New Client
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-2 text-slate-500 font-medium">Client Name</th>
                        <th className="py-2 text-slate-500 font-medium">Location</th>
                        <th className="py-2 text-slate-500 font-medium">Status</th>
                        <th className="py-2 text-slate-500 font-medium">Project ID</th>
                        <th className="py-2 text-right text-slate-500 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Swiss Alp Logistics', loc: 'Zurich, CH', status: 'Compliant', id: 'PRJ-8821' },
                        { name: 'Berlin Tech Solutions', loc: 'Berlin, DE', status: 'Audit Pending', id: 'PRJ-9012' },
                        { name: 'Paris Retail Group', loc: 'Paris, FR', status: 'Compliant', id: 'PRJ-4432' },
                        { name: 'Madrid Finance S.A.', loc: 'Madrid, ES', status: 'Warning', id: 'PRJ-1122' },
                        { name: 'Dublin Data Systems', loc: 'Dublin, IE', status: 'Compliant', id: 'PRJ-5566' }
                      ].map((client) => (
                        <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3">
                            <span className="font-semibold text-slate-900">{client.name}</span>
                          </td>
                          <td className="py-3 text-slate-600">{client.loc}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                              client.status === 'Compliant' ? 'bg-emerald-100 text-emerald-700' :
                              client.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-xs text-slate-500">{client.id}</td>
                          <td className="py-3 text-right">
                            <button className="text-indigo-600 font-medium hover:underline">Manage</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-indigo-900 rounded-xl p-4 sm:p-5 lg:p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-lg font-bold mb-2">Cross-Border Compliance Engine</h4>
                  <p className="text-indigo-100 text-sm max-w-xl">
                    Our sovereign EU node ensures all data transit between your clients remains within the 
                    EEA jurisdiction. Automatically apply local data residency rules based on client location.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-sm font-bold transition-colors">
                    Review Inter-EU Transit Rules
                  </button>
                </div>
                <Globe className="absolute -bottom-10 -right-10 w-48 h-48 text-indigo-800 opacity-50" />
              </div>
            </motion.div>
          )}

          {activeTab === 'policies' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <EuCompliancePortalConfigurator />
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <IntegrationsScanHub />
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Billing & Subscription
                </h3>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Current Plan</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">Enterprise Sovereign EU</p>
                    <p className="text-sm text-slate-600 mt-1">€4,500 / month • Renews on Dec 1, 2026</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                    Manage Plan
                  </button>
                </div>

                <h4 className="font-semibold text-slate-900 mb-4">Payment Methods</h4>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-600">VISA</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Visa ending in 4242</p>
                      <p className="text-xs text-slate-500">Expires 12/28</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Primary</span>
                </div>

                <h4 className="font-semibold text-slate-900 mb-4">Invoice History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-2 text-slate-500 font-medium">Date</th>
                        <th className="py-2 text-slate-500 font-medium">Amount</th>
                        <th className="py-2 text-slate-500 font-medium">Status</th>
                        <th className="py-2 text-right text-slate-500 font-medium">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 text-slate-900">Nov 1, 2026</td>
                        <td className="py-3 text-slate-900">€4,500.00</td>
                        <td className="py-3"><span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium">Paid</span></td>
                        <td className="py-3 text-right"><button className="text-indigo-600 font-medium">Download PDF</button></td>
                      </tr>
                      <tr>
                        <td className="py-3 text-slate-900">Oct 1, 2026</td>
                        <td className="py-3 text-slate-900">€4,500.00</td>
                        <td className="py-3"><span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium">Paid</span></td>
                        <td className="py-3 text-right"><button className="text-indigo-600 font-medium">Download PDF</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'verification' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      Account Verification (KYB/KYC)
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Regulatory requirements mandate verified business identities under eIDAS v2.</p>
                  </div>
                  {verificationStatus === 'Verified' ? (
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shrink-0 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" /> Verify Now
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Certificate of Incorporation</p>
                        <p className="text-xs text-slate-500">{verificationStatus === 'Verified' ? 'Verified via National Registry Ledger' : 'Awaiting authentication verification'}</p>
                      </div>
                    </div>
                    {verificationStatus === 'Verified' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Pending</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Director Identity Proof (KYC)</p>
                        <p className="text-xs text-slate-500">{verificationStatus === 'Verified' ? 'Verified via eIDAS Qualified Cryptographic Signature' : 'Awaiting EUDI Wallet handshake'}</p>
                      </div>
                    </div>
                    {verificationStatus === 'Verified' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Pending</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 border border-dashed border-slate-300 rounded-lg bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">UBO Declaration (Optional update)</p>
                        <p className="text-xs text-slate-500">Required only if ownership structure changed</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <UploadCloud className="w-4 h-4" /> Upload
                    </button>
                  </div>
                </div>
              </div>

              {isModalOpen && (
                <VerificationDetailsModal 
                  isOpen={isModalOpen} 
                  onClose={() => setIsModalOpen(false)} 
                  session={session}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'configuration' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  EU Data Residency & Configuration
                </h3>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Primary Data Sovereign Region</label>
                    <p className="text-xs text-slate-500 mb-3">All tenant data will be strictly pinned to this region per GDPR Art 44-50.</p>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
                      <option>EU-Central (Frankfurt)</option>
                      <option>EU-West (Paris)</option>
                      <option>EU-North (Stockholm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Default Compliance Frameworks</label>
                    <p className="text-xs text-slate-500 mb-3">Enable modules active globally for this account.</p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                        <span className="text-sm text-slate-700 font-medium">GDPR (General Data Protection Regulation)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                        <span className="text-sm text-slate-700 font-medium">EU AI Act Readiness</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                        <span className="text-sm text-slate-700 font-medium">DORA (Digital Operational Resilience Act)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                        <span className="text-sm text-slate-700 font-medium">NIS2 Directive</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700">
                    <Save className="w-4 h-4" /> Save Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
