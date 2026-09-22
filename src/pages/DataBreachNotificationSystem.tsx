import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, FileText, Send, CheckCircle2, ShieldAlert, Globe, Calendar, Users, ChevronRight, Download, Play, Activity, Scale, Coins, History, UserCheck, Percent, HelpCircle, TrendingUp, Lock, Mail, Phone, KeyRound, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';
import { useJurisdiction } from '../context/JurisdictionContext';
import { DataBreachAnalyticsChart } from '../components/DataBreachAnalyticsChart';
import { MOCK_TENANTS } from '../lib/entitlementEngine';
import { BreachSimulationRunner } from '../components/BreachSimulationRunner';
import { calculateGdprFine } from '../utils/gdprFineCalculator';
import { messageEncryptionService, SendGatewayResult } from '../services/MessageEncryptionService';

type Jurisdiction = 'GDPR' | 'CCPA' | 'HIPAA' | 'PIPEDA' | 'Not Sure';

interface BreachForm {
  discoveryDate: string;
  incidentDate: string;
  dataTypes: string[];
  recordsImpacted: string;
  description: string;
  containmentStatus: string;
  jurisdiction: Jurisdiction;
  geographicOrigin: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const getTenantContactInfo = (tenantId: string) => {
  switch (tenantId) {
    case 'tenant_1':
      return {
        organizationName: 'Acme Financial EU',
        contactName: 'Sarah Jenkins (Chief Compliance Officer)',
        contactEmail: 'compliance@acmefinancial.eu',
        contactPhone: '+49 89 2019382'
      };
    case 'tenant_2':
      return {
        organizationName: 'Global Health Systems',
        contactName: 'Dr. Michael Cho (Data Protection Officer)',
        contactEmail: 'dpo@globalhealth.org',
        contactPhone: '+353 1 496 0123'
      };
    case 'tenant_3':
      return {
        organizationName: 'TechStartup AI',
        contactName: 'Alex Mercer (CTO & Security Lead)',
        contactEmail: 'security@techstartup.ai',
        contactPhone: '+46 8 123 45 67'
      };
    default:
      return {
        organizationName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: ''
      };
  }
};

export const DataBreachNotificationSystem: React.FC = () => {
  const { showToast } = useNotification();
  const { jurisdiction } = useJurisdiction();
  const [activeTab, setActiveTab] = useState<'wizard' | 'simulation'>('wizard');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState('tenant_1');

  // PGP Message Encryption Service State
  const [encryptedPgpArmored, setEncryptedPgpArmored] = useState<string | null>(null);
  const [gatewayDispatchResult, setGatewayDispatchResult] = useState<SendGatewayResult | null>(null);
  const [isPgpEncrypting, setIsPgpEncrypting] = useState(false);

  // GDPR Article 83 Fine Calculator Parameters
  const [gdprIntentional, setGdprIntentional] = useState(false);
  const [gdprMitigationMeasures, setGdprMitigationMeasures] = useState<'none' | 'partial' | 'extensive'>('partial');
  const [gdprPreviousInfringements, setGdprPreviousInfringements] = useState(false);
  const [gdprCooperationLevel, setGdprCooperationLevel] = useState<'minimal' | 'cooperative' | 'proactive'>('cooperative');
  const [gdprReportingMethod, setGdprReportingMethod] = useState<'self_reported' | 'authority_discovered'>('self_reported');
  const [gdprAnnualTurnoverEur, setGdprAnnualTurnoverEur] = useState<number>(50000000); // Default €50M

  const initialContact = getTenantContactInfo('tenant_1');

  const [form, setForm] = useState<BreachForm>({
    discoveryDate: '',
    incidentDate: '',
    dataTypes: [],
    recordsImpacted: '',
    description: '',
    containmentStatus: 'investigating',
    jurisdiction: 'GDPR',
    geographicOrigin: 'detect',
    organizationName: initialContact.organizationName,
    contactName: initialContact.contactName,
    contactEmail: initialContact.contactEmail,
    contactPhone: initialContact.contactPhone,
  });

  const [hasManuallySetJurisdiction, setHasManuallySetJurisdiction] = useState(false);
  const [suggestionSource, setSuggestionSource] = useState<'nlp' | 'manual_origin' | null>(null);

  const applyTenantAutoFill = (tenantId: string = selectedTenantId) => {
    const contact = getTenantContactInfo(tenantId);
    setForm(prev => ({
      ...prev,
      organizationName: contact.organizationName,
      contactName: contact.contactName,
      contactEmail: contact.contactEmail,
      contactPhone: contact.contactPhone
    }));
    const tenantName = MOCK_TENANTS.find(t => t.id === tenantId)?.name || 'Tenant';
    showToast(`Common reporting fields auto-filled for ${tenantName}.`, 'success');
  };

  const detectJurisdictionFromText = (text: string): Jurisdiction | null => {
    const lower = text.toLowerCase();
    
    // HIPAA Keywords
    if (/\b(patient|patients|health|healthcare|medical|hospital|clinic|phi|hipaa|doctor|prescription|records|hhs|clinical|medication)\b/i.test(lower)) {
      return 'HIPAA';
    }
    
    // PIPEDA Keywords
    if (/\b(canada|canadian|pipeda|ontario|quebec|vancouver|toronto|ottawa|alberta|aida|loi 25)\b/i.test(lower)) {
      return 'PIPEDA';
    }
    
    // CCPA Keywords
    if (/\b(california|californian|ccpa|cpra|ab 2930|los angeles|san francisco|sacramento|silicon valley|cppa)\b/i.test(lower)) {
      return 'CCPA';
    }
    
    // GDPR Keywords
    if (/\b(eu|european|gdpr|germany|france|paris|berlin|london|uk|ireland|brussels|netherlands|citizen|citizens|passport|schengen)\b/i.test(lower)) {
      return 'GDPR';
    }
    
    return null;
  };

  // Sync with global jurisdiction switcher
  useEffect(() => {
    if (jurisdiction && !hasManuallySetJurisdiction) {
      if (form.geographicOrigin === 'detect' && !detectJurisdictionFromText(form.description)) {
        setForm(prev => ({
          ...prev,
          jurisdiction: jurisdiction as Jurisdiction
        }));
      }
    }
  }, [jurisdiction]);

  // Suggest jurisdiction based on geographical origin / NLP scan of description
  useEffect(() => {
    if (hasManuallySetJurisdiction) return;

    if (form.geographicOrigin && form.geographicOrigin !== 'detect') {
      let matchedJurisdiction: Jurisdiction = 'Not Sure';
      if (form.geographicOrigin === 'EU') matchedJurisdiction = 'GDPR';
      else if (form.geographicOrigin === 'US-CA') matchedJurisdiction = 'CCPA';
      else if (form.geographicOrigin === 'US-Healthcare') matchedJurisdiction = 'HIPAA';
      else if (form.geographicOrigin === 'CA') matchedJurisdiction = 'PIPEDA';
      else if (form.geographicOrigin === 'Other') matchedJurisdiction = 'Not Sure';

      if (form.jurisdiction !== matchedJurisdiction) {
        setForm(prev => ({ ...prev, jurisdiction: matchedJurisdiction }));
        setSuggestionSource('manual_origin');
        showToast(`Jurisdiction suggested as ${matchedJurisdiction} based on selected geographic origin.`, 'success');
      }
    } else if (form.geographicOrigin === 'detect' && form.description) {
      const detected = detectJurisdictionFromText(form.description);
      if (detected && form.jurisdiction !== detected) {
        setForm(prev => ({ ...prev, jurisdiction: detected }));
        setSuggestionSource('nlp');
        showToast(`NLP detected origin context: suggesting ${detected} framework.`, 'success');
      } else if (!detected && suggestionSource === 'nlp') {
        setSuggestionSource(null);
      }
    } else if (form.geographicOrigin === 'detect' && !form.description && suggestionSource) {
      setSuggestionSource(null);
    }
  }, [form.geographicOrigin, form.description, hasManuallySetJurisdiction]);

  const availableDataTypes = [
    'Personally Identifiable Information (PII)',
    'Financial Data',
    'Protected Health Information (PHI)',
    'Authentication Credentials',
    'Intellectual Property',
    'Other'
  ];

  const handleToggleDataType = (type: string) => {
    setForm(prev => {
      const exists = prev.dataTypes.includes(type);
      return {
        ...prev,
        dataTypes: exists 
          ? prev.dataTypes.filter(t => t !== type)
          : [...prev.dataTypes, type]
      };
    });
  };

  const calculateDeadline = () => {
    if (!form.discoveryDate) return null;
    const discovery = new Date(form.discoveryDate);
    
    switch (form.jurisdiction) {
      case 'GDPR':
        discovery.setHours(discovery.getHours() + 72);
        return { time: '72 Hours', date: discovery.toLocaleString(), critical: true };
      case 'HIPAA':
        discovery.setDate(discovery.getDate() + 60);
        return { time: '60 Days', date: discovery.toLocaleString(), critical: false };
      case 'CCPA':
        discovery.setDate(discovery.getDate() + 30); // Varies, but often considered 30 days for cure or immediate for egregious
        return { time: '30 Days (Recommended)', date: discovery.toLocaleString(), critical: false };
      case 'PIPEDA':
        // As soon as feasible
        discovery.setDate(discovery.getDate() + 14);
        return { time: 'As soon as feasible (Est. 14 Days)', date: discovery.toLocaleString(), critical: false };
      default:
        return { time: 'Unknown', date: 'TBD', critical: false };
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const deadline = calculateDeadline();
      
      let gdprSection = '';
      if (form.jurisdiction === 'GDPR') {
        const fineResult = calculateGdprFine({
          recordsImpacted: form.recordsImpacted || 'Unknown',
          dataTypes: form.dataTypes,
          containmentStatus: form.containmentStatus,
          intentional: gdprIntentional,
          mitigationMeasures: gdprMitigationMeasures,
          previousInfringements: gdprPreviousInfringements,
          cooperationLevel: gdprCooperationLevel,
          reportingMethod: gdprReportingMethod,
          annualTurnoverEur: gdprAnnualTurnoverEur
        });

        gdprSection = `
6. POTENTIAL ADMINISTRATIVE PENALTIES (GDPR ARTICLE 83 ESTIMATE)
-----------------------------------------------------------------
Infringement Classification: ${fineResult.tier}
Assessed Gravity / Severity Score: ${fineResult.gravityScore} / 100
Organization Global Annual Turnover: €${gdprAnnualTurnoverEur.toLocaleString()}
Statutory Liability Limit (Fine Cap): €${fineResult.legalMaxCap.toLocaleString()} ${fineResult.turnoverCapUsed ? '(Percentage of global turnover applied)' : '(Standard statutory flat cap applied)'}

Estimated Baseline Fine Range: €${fineResult.baseFineLow.toLocaleString()} - €${fineResult.baseFineHigh.toLocaleString()}
Adjusted Fine Range (Post-Mitigation): €${fineResult.adjustedFineLow.toLocaleString()} - €${fineResult.adjustedFineHigh.toLocaleString()}

Evaluated Parameters & Impact:
${fineResult.adjustments.map(adj => `- ${adj.factor}: ${adj.percentageChange >= 0 ? '+' : ''}${(adj.percentageChange * 100).toFixed(0)}% (Est. Impact: ${adj.impactEur >= 0 ? '+' : ''}€${adj.impactEur.toLocaleString()})`).join('\n')}

Supervisory Authority Citation References:
${fineResult.articleReferences.map(ref => `- ${ref}`).join('\n')}
        `.trim();
      }

      const report = `
REGULATORY DATA BREACH NOTIFICATION
===================================
Jurisdiction: ${form.jurisdiction}
Reference ID: INC-${Math.floor(Math.random() * 1000000)}
Date Generated: ${new Date().toISOString()}

1. ORGANIZATION & CONTACT DETAILS
---------------------------------
Organization Name: ${form.organizationName || 'Not specified'}
Contact Person: ${form.contactName || 'Not specified'}
Email Address: ${form.contactEmail || 'Not specified'}
Telephone: ${form.contactPhone || 'Not specified'}

2. INCIDENT TIMELINE
--------------------
Date of Incident: ${form.incidentDate || 'Not specified'}
Date of Discovery: ${form.discoveryDate || 'Not specified'}
Reporting Deadline: ${deadline?.date || 'Not calculated'}

3. BREACH DETAILS
-----------------
Nature of the Breach:
${form.description || 'No description provided.'}

Categories of Data Affected:
${form.dataTypes.length > 0 ? form.dataTypes.map(t => '- ' + t).join('\n') : 'Not specified'}

Estimated Number of Records/Data Subjects:
${form.recordsImpacted || 'Unknown'}

4. CONTAINMENT & MITIGATION
---------------------------
Current Status: ${form.containmentStatus.toUpperCase()}

5. NEXT STEPS & DECLARATION
---------------------------
This document serves as an initial notification as required under ${form.jurisdiction} regulations.
A designated Data Protection Officer (DPO) will follow up with a comprehensive forensic report.

${gdprSection ? '\n' + gdprSection : ''}
      `.trim();
      
      setGeneratedReport(report);
      setIsGenerating(false);
      setStep(3);
      showToast('Regulatory notification drafted successfully.', 'success');
    }, 2000);
  };

  const handleDownload = () => {
    if (!generatedReport) return;
    const element = document.createElement('a');
    const file = new Blob([generatedReport], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Breach_Notification_${form.jurisdiction}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const deadlineInfo = calculateDeadline();

  const gdprFineResult = React.useMemo(() => {
    if (form.jurisdiction !== 'GDPR') return null;
    return calculateGdprFine({
      recordsImpacted: form.recordsImpacted || 'Unknown',
      dataTypes: form.dataTypes,
      containmentStatus: form.containmentStatus,
      intentional: gdprIntentional,
      mitigationMeasures: gdprMitigationMeasures,
      previousInfringements: gdprPreviousInfringements,
      cooperationLevel: gdprCooperationLevel,
      reportingMethod: gdprReportingMethod,
      annualTurnoverEur: gdprAnnualTurnoverEur
    });
  }, [
    form.jurisdiction,
    form.recordsImpacted,
    form.dataTypes,
    form.containmentStatus,
    gdprIntentional,
    gdprMitigationMeasures,
    gdprPreviousInfringements,
    gdprCooperationLevel,
    gdprReportingMethod,
    gdprAnnualTurnoverEur
  ]);

  return (
    <div className="max-w-5xl mx-auto py-5 sm:py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
            Data Breach Notification System
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Initiate reporting workflows, leverage automated tenant metadata integration, or simulate active crisis responses.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start md:self-auto shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'wizard'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Reporting Wizard
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-500" /> Response Simulator
          </button>
        </div>
      </div>

      {activeTab === 'simulation' ? (
        <BreachSimulationRunner />
      ) : (
        <>
          {/* Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 rounded-full z-0 transition-all duration-500"
            style={{ width: `${(step - 1) * 50}%` }}
          ></div>
          
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${
                step >= s 
                  ? 'bg-indigo-600 border-indigo-100 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-400'
              } transition-colors duration-300`}
            >
              {s < step ? <CheckCircle2 className="w-5 h-5 text-white" /> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          <span className={step >= 1 ? 'text-indigo-700' : ''}>Incident Details</span>
          <span className={step >= 2 ? 'text-indigo-700 text-center' : 'text-center'}>Jurisdiction & Impact</span>
          <span className={step >= 3 ? 'text-indigo-700 text-right' : 'text-right'}>Review & Generate</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-8"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Step 1: Incident Timeline & Details</h2>
                <p className="text-sm text-slate-500">Provide the foundational details of the security incident.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Date of Incident (Approximate)
                  </label>
                  <input 
                    type="datetime-local" 
                    value={form.incidentDate}
                    onChange={e => setForm({...form, incidentDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Date of Discovery <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="datetime-local" 
                    value={form.discoveryDate}
                    onChange={e => setForm({...form, discoveryDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                    required
                  />
                  <p className="text-[11px] text-slate-500">Regulatory clocks start ticking from this exact moment.</p>
                </div>
              </div>

              {/* Tenant Context Auto-Fill Card */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Tenant Context Integration
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Select a tenant workspace to auto-fill registration and reporting contact data.</p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <select
                      value={selectedTenantId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        setSelectedTenantId(nextId);
                        applyTenantAutoFill(nextId);
                      }}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {MOCK_TENANTS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.industry})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => applyTenantAutoFill(selectedTenantId)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      <span>⚡</span> Re-Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Organization and Contact Fields */}
              <div className="p-4 sm:p-5 lg:p-6 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4 sm:space-y-6">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Organization & Incident Reporting Contact Info
                </h3>
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Organization Name</label>
                    <input 
                      type="text" 
                      value={form.organizationName}
                      onChange={e => setForm({...form, organizationName: e.target.value})}
                      placeholder="e.g. Acme Financial"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Contact Person (DPO / CISO)</label>
                    <input 
                      type="text" 
                      value={form.contactName}
                      onChange={e => setForm({...form, contactName: e.target.value})}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Contact Email Address</label>
                    <input 
                      type="email" 
                      value={form.contactEmail}
                      onChange={e => setForm({...form, contactEmail: e.target.value})}
                      placeholder="e.g. compliance@acme.eu"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Contact Phone Number</label>
                    <input 
                      type="tel" 
                      value={form.contactPhone}
                      onChange={e => setForm({...form, contactPhone: e.target.value})}
                      placeholder="e.g. +49 89 2019382"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  Geographical Origin of Affected Data / Subjects
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'detect', label: '✨ Auto-Detect', desc: 'Scan description text' },
                    { id: 'EU', label: '🇪🇺 European Union', desc: 'Suggests GDPR' },
                    { id: 'US-CA', label: '🇺🇸 California', desc: 'Suggests CCPA' },
                    { id: 'US-Healthcare', label: '🏥 US Healthcare', desc: 'Suggests HIPAA' },
                    { id: 'CA', label: '🇨🇦 Canada', desc: 'Suggests PIPEDA' },
                    { id: 'Other', label: '🌐 Other Region', desc: 'No suggestion' },
                  ].map((origin) => (
                    <button
                      key={origin.id}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, geographicOrigin: origin.id }));
                        if (origin.id !== 'detect') {
                          setSuggestionSource('manual_origin');
                        } else {
                          setSuggestionSource(null);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        form.geographicOrigin === origin.id
                          ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-800">{origin.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{origin.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Incident Description</label>
                  {suggestionSource === 'nlp' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold animate-pulse border border-emerald-200">
                      ✨ NLP Detected: {form.jurisdiction} Suggested
                    </span>
                  )}
                  {suggestionSource === 'manual_origin' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                      🌍 Origin Override: {form.jurisdiction} Selected
                    </span>
                  )}
                </div>
                <textarea 
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Provide a factual summary of what happened. Try typing 'patient medical records leak' or 'users in California' to test NLP auto-detection..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow resize-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Containment Status</label>
                <div className="flex flex-wrap gap-3">
                  {['investigating', 'contained', 'eradicated', 'recovering'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setForm({...form, containmentStatus: status})}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize border transition-all ${
                        form.containmentStatus === status 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.discoveryDate}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-8"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Step 2: Jurisdiction & Data Impact</h2>
                <p className="text-sm text-slate-500">Identify the scope of the breach to determine reporting requirements.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      Primary Jurisdiction / Framework
                    </label>
                    <select 
                      value={form.jurisdiction}
                      onChange={e => {
                        setForm({...form, jurisdiction: e.target.value as Jurisdiction});
                        setHasManuallySetJurisdiction(true);
                        setSuggestionSource(null);
                        showToast(`Jurisdiction manually updated to ${e.target.value}.`, 'info');
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-700"
                    >
                      <option value="GDPR">GDPR (European Union)</option>
                      <option value="CCPA">CCPA / CPRA (California)</option>
                      <option value="HIPAA">HIPAA (US Healthcare)</option>
                      <option value="PIPEDA">PIPEDA (Canada)</option>
                      <option value="Not Sure">Not Sure / Multiple</option>
                    </select>

                    {suggestionSource && (
                      <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs font-semibold text-indigo-800">
                        <span className="flex items-center gap-2">
                          <span className="text-sm">✨</span>
                          Suggested based on incident origin context ({form.jurisdiction}).
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setHasManuallySetJurisdiction(true);
                            setSuggestionSource(null);
                            showToast(`System suggested jurisdiction locked in.`, 'success');
                          }}
                          className="text-[10px] uppercase font-black hover:underline cursor-pointer bg-indigo-100 px-2.5 py-1 rounded-md text-indigo-700"
                        >
                          Lock In
                        </button>
                      </div>
                    )}

                    {hasManuallySetJurisdiction && (
                      <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between text-xs font-semibold text-amber-800">
                        <span className="flex items-center gap-2">
                          <span className="text-sm">⚠️</span>
                          Using manual choice (autosuggestion bypassed).
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setHasManuallySetJurisdiction(false);
                            setSuggestionSource(null);
                            // It will re-calculate on next effect run
                            showToast(`Restored auto-suggestion from geographic context.`, 'info');
                          }}
                          className="text-[10px] uppercase font-black hover:underline cursor-pointer bg-amber-100 px-2.5 py-1 rounded-md text-amber-700"
                        >
                          Reset Auto
                        </button>
                      </div>
                    )}
                  </div>

                  {deadlineInfo && (
                    <div className={`p-4 rounded-xl border ${deadlineInfo.critical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-start gap-3">
                        <Clock className={`w-5 h-5 shrink-0 mt-0.5 ${deadlineInfo.critical ? 'text-rose-600' : 'text-amber-600'}`} />
                        <div>
                          <h4 className={`text-sm font-bold ${deadlineInfo.critical ? 'text-rose-900' : 'text-amber-900'}`}>
                            Regulatory Deadline
                          </h4>
                          <p className={`text-xs mt-1 ${deadlineInfo.critical ? 'text-rose-700' : 'text-amber-700'}`}>
                            Based on {form.jurisdiction}, you have <strong>{deadlineInfo.time}</strong> from discovery to notify authorities.
                          </p>
                          <p className={`text-xs font-mono mt-2 py-1 px-2 rounded bg-white/60 inline-block ${deadlineInfo.critical ? 'text-rose-800' : 'text-amber-800'}`}>
                            Target: {deadlineInfo.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      Estimated Records Impacted
                    </label>
                    <select 
                      value={form.recordsImpacted}
                      onChange={e => setForm({...form, recordsImpacted: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select an estimate...</option>
                      <option value="1 - 500">1 - 500</option>
                      <option value="501 - 10,000">501 - 10,000</option>
                      <option value="10,001 - 100,000">10,001 - 100,000</option>
                      <option value="100,000+">100,000+</option>
                      <option value="Unknown">Unknown at this time</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Types of Data Compromised
                  </label>
                  <div className="space-y-2">
                    {availableDataTypes.map(type => (
                      <label 
                        key={type}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          form.dataTypes.includes(type)
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={form.dataTypes.includes(type)}
                          onChange={() => handleToggleDataType(type)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-medium ${form.dataTypes.includes(type) ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* GDPR Administrative Fine Estimator Section */}
              {form.jurisdiction === 'GDPR' && gdprFineResult && (
                <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Scale className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">GDPR Administrative Fine Estimator (Article 83)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Simulate potential financial penalty exposure based on European Data Protection Board (EDPB) guidelines ('fine-gdpr-83').
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                    {/* Left: Administrative Parameters (3 cols) */}
                    <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200">
                        <span>1. Statutory Liability Parameters</span>
                      </h4>

                      {/* Intentional vs Negligent */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Intentionality of Infringement (Art 83(2)(b))</span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${gdprIntentional ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            {gdprIntentional ? 'Intentional Surcharge' : 'Negligent Discount'}
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setGdprIntentional(false)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              !gdprIntentional
                                ? 'bg-white border-green-300 text-green-700 shadow-sm ring-1 ring-green-400/20'
                                : 'bg-slate-100/50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Accidental / Negligent
                          </button>
                          <button
                            type="button"
                            onClick={() => setGdprIntentional(true)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              gdprIntentional
                                ? 'bg-white border-amber-300 text-amber-700 shadow-sm ring-1 ring-amber-400/20'
                                : 'bg-slate-100/50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Intentional / Surcharge
                          </button>
                        </div>
                      </div>

                      {/* Mitigation Actions */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Voluntary Mitigation Effort (Art 83(2)(c))</span>
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-200 text-slate-800">
                            Active Status: {form.containmentStatus}
                          </span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'none', label: 'None / Minimal' },
                            { value: 'partial', label: 'Partial Measures' },
                            { value: 'extensive', label: 'Extensive Remedies' }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setGdprMitigationMeasures(opt.value as any)}
                              className={`py-2 px-1.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                                gdprMitigationMeasures === opt.value
                                  ? 'bg-white border-indigo-300 text-indigo-700 shadow-sm ring-1 ring-indigo-400/20'
                                  : 'bg-slate-100/50 border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Cooperation Level */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">
                            Supervisory Cooperation (Art 83(2)(f))
                          </label>
                          <select
                            value={gdprCooperationLevel}
                            onChange={(e) => setGdprCooperationLevel(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="minimal">Minimal / Standard Obligations Only</option>
                            <option value="cooperative">Cooperative / Active Interaction</option>
                            <option value="proactive">Proactive / Full Disclosure</option>
                          </select>
                        </div>

                        {/* Reporting Method */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700">
                            Discovery / Reporting Trigger (Art 83(2)(h))
                          </label>
                          <select
                            value={gdprReportingMethod}
                            onChange={(e) => setGdprReportingMethod(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="self_reported">Voluntary Self-Notification (-25%)</option>
                            <option value="authority_discovered">Authority Audit / Third-Party Leak (+15%)</option>
                          </select>
                        </div>
                      </div>

                      {/* Prior History & Turnover */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Previous Infringements */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block">
                            Non-Compliance History (Art 83(2)(e))
                          </label>
                          <label className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            gdprPreviousInfringements ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
                          }`}>
                            <input
                              type="checkbox"
                              checked={gdprPreviousInfringements}
                              onChange={(e) => setGdprPreviousInfringements(e.target.checked)}
                              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                            />
                            <span className="text-xs font-semibold text-slate-700 select-none">
                              Has Prior Formal Infringements
                            </span>
                          </label>
                        </div>

                        {/* Annual Global Turnover Input */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 flex justify-between">
                            <span>Annual Global Turnover (EUR)</span>
                            <span className="text-[10px] text-indigo-600 font-bold font-mono">Art 83 caps based</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">€</span>
                            <input
                              type="number"
                              min="1"
                              value={gdprAnnualTurnoverEur}
                              onChange={(e) => setGdprAnnualTurnoverEur(Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preset Turnover Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 self-center">Presets:</span>
                        {[
                          { label: '€5M (SME)', value: 5000000 },
                          { label: '€20M (Mid)', value: 20000000 },
                          { label: '€50M (Corp)', value: 50000000 },
                          { label: '€500M (Global)', value: 500000000 }
                        ].map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setGdprAnnualTurnoverEur(preset.value)}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              gdprAnnualTurnoverEur === preset.value
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right: Fine Estimate output & citations (2 cols) */}
                    <div className="lg:col-span-2 bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between border border-slate-800">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold font-mono tracking-wider text-indigo-400 uppercase">
                            EDPB Penalty Estimator
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            gdprFineResult.tier.includes('83(5)') ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                          }`}>
                            {gdprFineResult.tier.includes('83(5)') ? 'Art 83(5) Tier' : 'Art 83(4) Tier'}
                          </span>
                        </div>

                        {/* Gravity Score */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span>Assessed Gravity Score:</span>
                            <span className="font-mono text-slate-200">{gdprFineResult.gravityScore} / 100</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                gdprFineResult.gravityScore > 65
                                  ? 'bg-rose-500'
                                  : gdprFineResult.gravityScore > 35
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${gdprFineResult.gravityScore}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Range box */}
                        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4.5 text-center relative overflow-hidden">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                            Estimated Penalty Range
                          </span>
                          <div className="text-xl md:text-2xl font-black text-rose-400 tracking-tight font-mono">
                            €{gdprFineResult.adjustedFineLow.toLocaleString()} - €{gdprFineResult.adjustedFineHigh.toLocaleString()}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal mt-2.5 font-sans">
                            Estimated administrative penalties in accordance with Article 83. Includes liability caps and mitigation adjustments.
                          </p>
                        </div>

                        {/* Statutory Maximum Cap Details */}
                        <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs font-sans">
                          <div className="flex justify-between text-slate-400 font-medium font-sans">
                            <span>Liability Cap Limit:</span>
                            <span className="font-bold text-slate-200 font-mono">
                              €{gdprFineResult.legalMaxCap.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            {gdprFineResult.turnoverCapUsed
                              ? `Applied global turnover ceiling limit (${gdprFineResult.tier.includes('83(5)') ? '4%' : '2%'} of €${gdprAnnualTurnoverEur.toLocaleString()}) which exceeds standard statutory floor.`
                              : `Applied standard European statutory flat cap limit (€${gdprFineResult.tier.includes('83(5)') ? '20' : '10'}M) as the global turnover percentage was lower.`
                            }
                          </p>
                        </div>

                        {/* Active Adjustments Breakdown */}
                        <div className="space-y-1.5 border-t border-slate-800 pt-3 font-sans">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Active Adjustment Elements
                          </span>
                          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            {gdprFineResult.adjustments.map((adj, i) => (
                              <div key={i} className="flex justify-between items-start text-[10.5px] leading-tight">
                                <span className="text-slate-400 max-w-[70%] font-sans">{adj.factor}</span>
                                <span className={`font-mono font-bold ${adj.percentageChange >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {adj.percentageChange >= 0 ? '+' : ''}{(adj.percentageChange * 100).toFixed(0)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Citations list footer */}
                      <div className="pt-4 mt-4 border-t border-slate-800 text-[10px] text-slate-500 italic space-y-1 font-mono">
                        <span className="font-bold text-slate-400 not-italic uppercase block tracking-wider mb-1 font-sans">
                          EDPB Article Citations
                        </span>
                        {gdprFineResult.articleReferences.map((ref, idx) => (
                          <p key={idx} className="leading-snug">
                            • {ref}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || form.dataTypes.length === 0}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>Generating Draft...</>
                  ) : (
                    <>Generate Notification <FileText className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6"
            >
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Notification Drafted Successfully</h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                  Your preliminary breach notification for <strong>{form.jurisdiction}</strong> compliance has been generated. Please review carefully before official submission.
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 relative overflow-hidden group">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={handleDownload}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm flex items-center gap-2 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" /> Download .txt
                  </button>
                </div>
                <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-96 custom-scrollbar pr-4">
                  {generatedReport}
                </pre>
              </div>

              <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 text-sm">
                <Send className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Next Step:</strong> Provide this generated draft to your legal counsel or Data Protection Officer (DPO) for final review and submission to the respective supervisory authority.
                </p>
              </div>

              {/* MessageEncryptionService PGP Gateway Dispatch Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 text-white space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        MessageEncryptionService (PGP Gateway Integration)
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded font-bold">
                          AES-256 / RSA-4096
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Encrypt notification payload prior to dispatching over SMTP email or SMS gateways to ensure strict confidentiality.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    disabled={isPgpEncrypting}
                    onClick={async () => {
                      setIsPgpEncrypting(true);
                      try {
                        const result = await messageEncryptionService.sendEncryptedSmtpAlert(
                          {
                            host: 'smtp.sovereign-alert.eu',
                            port: 587,
                            useTls: true,
                            senderAddress: 'compliance-alerts@regulettee-caas.eu',
                            pgpMimeMode: 'ARMORED_TEXT'
                          },
                          {
                            id: `INC-${Date.now()}`,
                            alertType: 'COMPLIANCE_BREACH',
                            severity: 'CRITICAL',
                            title: `Data Breach Alert - ${form.jurisdiction}`,
                            body: generatedReport || '',
                            confidentialData: {
                              recordsImpacted: form.recordsImpacted,
                              dataTypes: form.dataTypes,
                              organization: form.organizationName
                            },
                            timestamp: new Date().toISOString(),
                            recipient: form.contactEmail || 'dpo@enterprise-client.eu'
                          }
                        );
                        setGatewayDispatchResult(result);
                        const encResult = await messageEncryptionService.encryptNotificationPayload({
                          id: `INC-${Date.now()}`,
                          alertType: 'COMPLIANCE_BREACH',
                          severity: 'CRITICAL',
                          title: `Data Breach Alert - ${form.jurisdiction}`,
                          body: generatedReport || '',
                          confidentialData: {
                            recordsImpacted: form.recordsImpacted,
                            dataTypes: form.dataTypes
                          },
                          timestamp: new Date().toISOString(),
                          recipient: form.contactEmail || 'dpo@enterprise-client.eu'
                        });
                        setEncryptedPgpArmored(encResult.armoredEncryptedPayload);
                        showToast('Notification encrypted & dispatched via PGP/SMTP gateway!', 'success');
                      } catch (err: any) {
                        showToast('PGP encryption failed: ' + err.message, 'error');
                      } finally {
                        setIsPgpEncrypting(false);
                      }
                    }}
                    className="p-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl flex items-center justify-between text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          PGP-Encrypt & Dispatch via SMTP Gateway
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Sends armored PGP payload to {form.contactEmail || 'DPO address'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    disabled={isPgpEncrypting}
                    onClick={async () => {
                      setIsPgpEncrypting(true);
                      try {
                        const result = await messageEncryptionService.sendEncryptedSmsAlert(
                          {
                            providerUrl: 'https://sms-gateway.sovereign.eu/v1/send',
                            accountSid: 'AC_SOVEREIGN_SMS',
                            senderPhone: '+4915100000000',
                            compactArmoredMode: true
                          },
                          {
                            id: `INC-${Date.now()}`,
                            alertType: 'COMPLIANCE_BREACH',
                            severity: 'CRITICAL',
                            title: `CRITICAL BREACH: ${form.jurisdiction}`,
                            body: generatedReport || '',
                            confidentialData: { recordsImpacted: form.recordsImpacted },
                            timestamp: new Date().toISOString(),
                            recipient: form.contactPhone || '+49892019382'
                          }
                        );
                        setGatewayDispatchResult(result);
                        showToast('PGP confidential SMS alert transmitted successfully!', 'success');
                      } catch (err: any) {
                        showToast('PGP SMS dispatch failed: ' + err.message, 'error');
                      } finally {
                        setIsPgpEncrypting(false);
                      }
                    }}
                    className="p-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl flex items-center justify-between text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          PGP-Encrypt & Dispatch via SMS Gateway
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Compact encrypted token to {form.contactPhone || 'DPO phone'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {gatewayDispatchResult && (
                  <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Gateway Transmission Confirmed
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        TX: {gatewayDispatchResult.transactionId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono bg-slate-900 p-2.5 rounded border border-slate-800 overflow-x-auto">
                      {gatewayDispatchResult.gatewayResponse}
                    </div>
                  </div>
                )}

                {encryptedPgpArmored && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 font-mono">
                        PGP Armored Message Preview
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">
                        -----BEGIN PGP MESSAGE-----
                      </span>
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                      {encryptedPgpArmored}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-6 border-t border-slate-100">
                 <button
                  onClick={() => {
                    setStep(1);
                    setGeneratedReport(null);
                  }}
                  className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Start New Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )}
</div>
  );
};
