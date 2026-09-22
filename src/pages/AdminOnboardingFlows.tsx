import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Workflow, 
  Settings, 
  Plus, 
  GripVertical, 
  CheckCircle2, 
  Trash2,
  FileCheck,
  ShieldCheck,
  CreditCard,
  Building2,
  ChevronRight,
  Database,
  Sliders,
  Scale,
  Save,
  FileText,
  UserCheck,
  ChevronUp,
  ChevronDown,
  Eye,
  RefreshCw,
  Globe,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  XCircle,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { KycDocumentPreviewModal, KycDocumentItem } from '../components/admin/KycDocumentPreviewModal';
import { fetchWithRetry } from '../lib/api-client';

const RoleBasedOnboarding: React.FC = () => {
  const { user } = useAuth();
  const role = user?.user_metadata?.role || 'CLIENT';

  const steps = {
    CLIENT: ['DPA Generation', 'Billing Configuration', 'Tenant Setup', 'Compliance Agreement Sign-off'],
    EU_REGULATOR: ['Audit Checklist Review', 'Compliance Portal Configuration', 'Regulatory Report Settings', 'Agency Access Rights'],
  };

  const roleSteps = steps[role as keyof typeof steps] || steps.CLIENT;

  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
        <UserCheck className="w-5 h-5 text-indigo-500 mr-2" />
        Onboarding Steps for {role.replace('_', ' ')}
      </h3>
      <ul className="space-y-3">
        {roleSteps.map((step, index) => (
          <li key={index} className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-4 shrink-0">
              {index + 1}
            </div>
            <span className="font-semibold text-slate-700">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface FormField {
  id: string;
  label: string;
  internalKey: string;
  type: string;
  required: boolean;
  options?: string[];
  conditionalRules?: {
    dependentOnKey: string;
    condition: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS';
    value: string;
  }[];
  reviewerRouting?: string; // e.g. 'LEGAL_DEPT', 'DPO', 'EXTERNAL_COUNSEL'
}

interface WorkflowStep {
  id: string;
  label: string;
  icon: string;
  status: string;
  required: boolean;
}

export const AdminOnboardingFlows: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FORM_BUILDER' | 'WORKFLOW' | 'VERIFICATION_CONFIG' | 'FUNNEL_ANALYTICS' | 'ROLE_SETUP' | 'KYC_DOCUMENTS'>('KYC_DOCUMENTS');
  const { showToast } = useNotification();

  // Document Inspection Modal & Queue State
  const [documentsList, setDocumentsList] = useState<KycDocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [docSearch, setDocSearch] = useState<string>('');
  const [docFilter, setDocFilter] = useState<string>('ALL');

  const fetchSubmittedDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await fetchWithRetry('/api/v1/admin/kyc/documents');
      if (response && response.ok) {
        const json = await response.json();
        if (json && json.documents) {
          setDocumentsList(json.documents);
        }
      }
    } catch (e: any) {
      console.warn('[ADMIN_ONBOARDING] Error fetching KYC documents:', e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchSubmittedDocuments();
  }, []);

  const handleOpenPreview = (docId: string) => {
    setSelectedDocId(docId);
    setIsPreviewOpen(true);
  };

  const handleStatusUpdatedInModal = (docId: string, newStatus: string) => {
    setDocumentsList(prev => prev.map(d => d.id === docId ? { 
      ...d, 
      reviewStatus: newStatus as any,
      verified: newStatus === 'approved'
    } : d));
  };

  // Funnel Analytics Mock Data
  const funnelData = [
    { stage: 'Signup Initialized', count: 450, dropoff: '0%' },
    { stage: 'EUDI Identity Proof', count: 380, dropoff: '15.5%' },
    { stage: 'Company Verification', count: 310, dropoff: '18.4%' },
    { stage: 'Compliance Sign-off', count: 285, dropoff: '8.1%' },
    { stage: 'Final Provisioning', count: 278, dropoff: '2.5%' }
  ];

  // Representative Directory Mock Data
  const [representatives, setRepresentatives] = useState([
    { id: 'rep_1', tenant: 'Acme Financial', name: 'Dr. Klaus Meyer', role: 'DPO', status: 'Verified', lastAudit: '2026-05-12' },
    { id: 'rep_2', tenant: 'Global Health', name: 'Sarah O\'Connor', role: 'Legal Rep', status: 'Pending', lastAudit: 'N/A' },
    { id: 'rep_3', tenant: 'TechStartup AI', name: 'Marc Dubois', role: 'DPO', status: 'Verified', lastAudit: '2026-06-01' }
  ]);

  // Multi-stage onboarding workflow state
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(() => {
    const saved = localStorage.getItem('onboarding_workflow_steps');
    return saved ? JSON.parse(saved) : [
      { id: 'step_1', label: 'Company Profile & Registration', icon: 'Building2', status: 'Active', required: true },
      { id: 'step_2', label: 'EUDI Identity Verification', icon: 'ShieldCheck', status: 'Active', required: true },
      { id: 'step_3', label: 'Compliance Agreements & SCCs', icon: 'FileCheck', status: 'Active', required: true },
      { id: 'step_4', label: 'Billing Configuration (Stripe)', icon: 'CreditCard', status: 'Active', required: false },
      { id: 'step_5', label: 'Automated Container Provisioning', icon: 'Database', status: 'Active', required: true }
    ];
  });
  const [activeStepId, setActiveStepId] = useState<string | null>('step_1');

  // Form Builder state
  const [formFields, setFormFields] = useState<FormField[]>(() => {
    const saved = localStorage.getItem('onboarding_form_fields');
    return saved ? JSON.parse(saved) : [
      { id: 'f_1', label: 'Legal Company Name', internalKey: 'company_legal_name', type: 'text', required: true },
      { id: 'f_2', label: 'EU VAT Number', internalKey: 'eu_vat_number', type: 'text', required: true },
      { id: 'f_3', label: 'Primary Data Protection Officer (DPO)', internalKey: 'primary_dpo', type: 'text', required: false },
      { id: 'f_4', label: 'Preferred Isolation Region', internalKey: 'isolation_region', type: 'select', required: true, options: ['EU-CENTRAL-1', 'EU-WEST-1'] }
    ];
  });
  const [activeFieldId, setActiveFieldId] = useState<string | null>('f_1');

  // Verification Configuration state
  const [verificationConfig, setVerificationConfig] = useState(() => {
    const saved = localStorage.getItem('onboarding_verification_config');
    return saved ? JSON.parse(saved) : {
      eudiEnabled: true,
      eudiMinAssurance: 'HIGH',
      eudiSignatureRequired: true,
      viesEnabled: true,
      viesBlockUnverified: false,
      sanctionsEnabled: true,
      sanctionsRiskThreshold: 75,
      sccSignatureRequired: true,
      dpoLetterRequired: true,
      regulatorHighAssuranceRequired: true,
      regulatorWhitelistRegistrySync: true,
      regulatorSignedOathRequired: true
    };
  });

  // Official Registered EU Regulators & Agency Oversight Accounts
  const [regulatorsList, setRegulatorsList] = useState([
    { id: 'reg_1', agencyName: 'BaFin (German Federal Financial Supervisory)', jurisdiction: 'Germany', domain: 'Financial Markets & AML', status: 'Whitelisted', eidasLevel: 'HIGH', registryToken: 'REG-EEA-DE19' },
    { id: 'reg_2', agencyName: 'CNIL (French Data Protection Authority)', jurisdiction: 'France', domain: 'Data Protection (GDPR)', status: 'Whitelisted', eidasLevel: 'HIGH', registryToken: 'REG-EEA-FR42' },
    { id: 'reg_3', agencyName: 'EDPB (European Data Protection Board)', jurisdiction: 'Pan-European', domain: 'GDPR / AI Act Supervision', status: 'Whitelisted', eidasLevel: 'HIGH', registryToken: 'REG-EU-1049' }
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithRetry('/api/v1/admin/regulators');
        if (!res.ok) return;
        const json = await res.json();
        const rows = Array.isArray(json) ? json : json.regulators;
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        const mapped = rows.map((r: any) => ({
          id: r.id || r.registry_id,
          agencyName: r.name || r.agencyName,
          jurisdiction: r.jurisdiction || r.country || 'EU',
          domain: r.rule_sets || r.domain || 'GDPR / AI Act Supervision',
          status: r.status === 'ACTIVE' ? 'Whitelisted' : 'Pending',
          eidasLevel: r.eidas_level || r.eidasLevel || 'HIGH',
          registryToken: r.registry_token || r.api_key ? `REG-${(r.acronym || r.id || 'REG').toUpperCase().slice(0, 6)}` : 'REG-EEA-DE19'
        }));
        setRegulatorsList(mapped);
      } catch {
        // Fall back to seeded local demo data
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const savePipeline = () => {
    localStorage.setItem('onboarding_workflow_steps', JSON.stringify(workflowSteps));
    showToast('Enterprise onboarding pipeline stages saved successfully!', 'success');
  };

  const saveFormConfig = () => {
    localStorage.setItem('onboarding_form_fields', JSON.stringify(formFields));
    showToast('Dynamic registration form fields updated and saved successfully!', 'success');
  };

  const saveVerificationConfig = () => {
    localStorage.setItem('onboarding_verification_config', JSON.stringify(verificationConfig));
    showToast('Sovereign identity and verification configuration rules applied successfully!', 'success');
  };

  const addField = () => {
    const newField = { 
      id: 'f_' + Date.now(), 
      label: 'New Field', 
      internalKey: 'new_field_' + Date.now(), 
      type: 'text', 
      required: false 
    };
    setFormFields([...formFields, newField]);
    setActiveFieldId(newField.id);
  };

  const deleteField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormFields(formFields.filter(f => f.id !== id));
    if (activeFieldId === id) setActiveFieldId(null);
  };

  const updateActiveField = (updates: any) => {
    setFormFields(formFields.map(f => f.id === activeFieldId ? { ...f, ...updates } : f));
  };

  const activeField = formFields.find(f => f.id === activeFieldId);

  const addStep = () => {
    const newStep = { 
      id: 'step_' + Date.now(), 
      label: 'New Pipeline Stage', 
      icon: 'Workflow', 
      status: 'Active', 
      required: false 
    };
    setWorkflowSteps([...workflowSteps, newStep]);
    setActiveStepId(newStep.id);
  };

  const deleteStep = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowSteps(workflowSteps.filter(s => s.id !== id));
    if (activeStepId === id) setActiveStepId(null);
  };

  const updateActiveStep = (updates: any) => {
    setWorkflowSteps(workflowSteps.map(s => s.id === activeStepId ? { ...s, ...updates } : s));
  };

  const activeStep = workflowSteps.find(s => s.id === activeStepId);

  const moveStep = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= workflowSteps.length) return;
    const newSteps = [...workflowSteps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setWorkflowSteps(newSteps);
  };

  const moveField = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formFields.length) return;
    const newFields = [...formFields];
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    setFormFields(newFields);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return Building2;
      case 'ShieldCheck': return ShieldCheck;
      case 'FileCheck': return FileCheck;
      case 'CreditCard': return CreditCard;
      case 'Database': return Database;
      case 'Users': return Users;
      default: return Workflow;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Onboarding & Tenant Pipeline</h1>
          <p className="text-slate-500 mt-1">Configure white-glove registration workflows and verification engines used by enterprise clients.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-fit">
        <button 
          onClick={() => setActiveTab('KYC_DOCUMENTS')}
          className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'KYC_DOCUMENTS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileCheck className="w-4 h-4 text-indigo-600" />
          <span>KYC Document Submissions</span>
          {documentsList.filter(d => d.reviewStatus === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
              {documentsList.filter(d => d.reviewStatus === 'pending').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('WORKFLOW')}
          className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${activeTab === 'WORKFLOW' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Registration Workflow
        </button>
        <button 
          onClick={() => setActiveTab('FORM_BUILDER')}
          className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${activeTab === 'FORM_BUILDER' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Form Builder
        </button>
        <button 
          onClick={() => setActiveTab('VERIFICATION_CONFIG')}
          className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${activeTab === 'VERIFICATION_CONFIG' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Verification Configuration
        </button>
        <button 
          onClick={() => setActiveTab('ROLE_SETUP')}
          className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${activeTab === 'ROLE_SETUP' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Role Onboarding Setup
        </button>
        <button 
          onClick={() => setActiveTab('FUNNEL_ANALYTICS')}
          className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-md transition-all ${activeTab === 'FUNNEL_ANALYTICS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Funnel & Representatives
        </button>
      </div>

      <div className="mt-6">
        {/* KYC Document Submissions & Secure Preview Queue Tab */}
        {activeTab === 'KYC_DOCUMENTS' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Submitted Docs</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{documentsList.length}</div>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Review</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {documentsList.filter(d => d.reviewStatus === 'pending').length}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">EUID BRIS Sync Rate</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Globe className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hash Integrity</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1">SHA-256</div>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Document Queue Table & Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Submitted Enterprise KYC Documents
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click 'Preview & Inspect' to securely view document contents in-app without file downloads.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Search Bar */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Search company, EUID, hash..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={fetchSubmittedDocuments}
                    disabled={loadingDocs}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                    title="Refresh List"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingDocs ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="p-3 px-5 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter Status:
                </span>
                {['ALL', 'PENDING', 'APPROVED', 'NEEDS_MORE_INFO', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setDocFilter(st)}
                    className={`px-3 py-1 rounded-md font-bold transition-colors ${
                      docFilter === st 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'ALL' ? 'All Submissions' : st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Table List */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Organization & Submitter</th>
                      <th className="px-5 py-3">Document Type</th>
                      <th className="px-5 py-3">EUID Identifier</th>
                      <th className="px-5 py-3">SHA-256 Integrity</th>
                      <th className="px-5 py-3">Review Status</th>
                      <th className="px-5 py-3 text-right">In-App Inspection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {documentsList
                      .filter(d => {
                        if (docFilter !== 'ALL' && d.reviewStatus.toUpperCase() !== docFilter) return false;
                        if (docSearch) {
                          const q = docSearch.toLowerCase();
                          return d.companyName.toLowerCase().includes(q) || 
                                 d.userEmail.toLowerCase().includes(q) ||
                                 d.euid.toLowerCase().includes(q) ||
                                 d.documentType.toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{doc.companyName}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {doc.userName} ({doc.userEmail})
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              {doc.documentType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {doc.fileName}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono text-[11px] font-bold block w-fit">
                              {doc.euid}
                            </span>
                            <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> BRIS Interconnected
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-[10px] font-mono text-slate-600 truncate max-w-[120px] block" title={doc.fileHash}>
                              {doc.fileHash}
                            </span>
                            <span className="text-[9px] text-indigo-600 font-bold block mt-0.5">
                              Integrity Verified
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            {doc.reviewStatus === 'approved' ? (
                              <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                              </span>
                            ) : doc.reviewStatus === 'needs_more_info' ? (
                              <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Action Required
                              </span>
                            ) : doc.reviewStatus === 'rejected' ? (
                              <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleOpenPreview(doc.id)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview Document</span>
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
        {activeTab === 'ROLE_SETUP' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <RoleBasedOnboarding />
          </motion.div>
        )}
        {/* Funnel Analytics & Representative Directory Tab */}
        {activeTab === 'FUNNEL_ANALYTICS' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Funnel Visualization */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <Sliders className="w-5 h-5 text-indigo-500 mr-2" />
                  Onboarding Funnel Analytics (Monthly)
                </h3>
                <div className="space-y-5">
                  {funnelData.map((stage, i) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-sm font-semibold text-slate-700">{stage.stage}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">{stage.count} Tenants</span>
                          {stage.dropoff !== '0%' && (
                            <span className="text-[10px] text-rose-500 font-bold ml-2">↓ {stage.dropoff} drop-off</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(stage.count / funnelData[0].count) * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Overall Conversion Rate</span>
                    <span className="text-2xl font-black text-slate-900">61.7%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 flex items-center justify-end">
                      <ChevronRight className="w-4 h-4 mr-1" /> Top Performer
                    </span>
                    <span className="text-sm font-semibold text-slate-700">Financial Services (78%)</span>
                  </div>
                </div>
              </div>

              {/* DPO Quick Stats */}
              <div className="bg-indigo-900 rounded-xl p-4 sm:p-5 lg:p-6 text-white shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Regulatory Readiness
                  </h3>
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-indigo-800">
                      <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Total Appointed DPOs</span>
                      <div className="text-2xl font-black mt-1">1,420</div>
                    </div>
                    <div className="pb-3 border-b border-indigo-800">
                      <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">KYB Verified Entities</span>
                      <div className="text-2xl font-black mt-1">94.2%</div>
                    </div>
                    <div>
                      <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Unverified Legal Reps</span>
                      <div className="text-2xl font-black mt-1 text-amber-400">12</div>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg text-xs transition-colors mt-6">
                  Initiate Mass Compliance Audit
                </button>
              </div>
            </div>

            {/* Representative Directory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <Users className="w-5 h-5 text-indigo-500 mr-2" />
                  Appointed Representatives & DPO Directory
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all">
                    Export Directory
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all">
                    Request Updates
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-xs font-bold text-slate-500 uppercase">
                      <th className="px-6 py-3">Tenant Organization</th>
                      <th className="px-6 py-3">Representative Name</th>
                      <th className="px-6 py-3">Mandated Role</th>
                      <th className="px-6 py-3">Verification Status</th>
                      <th className="px-6 py-3">Last Compliance Audit</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {representatives.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">{rep.tenant}</td>
                        <td className="px-6 py-4 text-slate-700">{rep.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                            {rep.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${rep.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {rep.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{rep.lastAudit}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">Audit Profile</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official EU Regulators & Agency Oversight Directory */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <Scale className="w-5 h-5 text-indigo-600 mr-2" />
                  Authorized EU Supervisory Authorities & Regulators
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all">
                    Sync EC Whitelist
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-xs font-bold text-slate-500 uppercase">
                      <th className="px-6 py-3">Supervisory Agency Name</th>
                      <th className="px-6 py-3">Member State / Region</th>
                      <th className="px-6 py-3">Supervised Domain</th>
                      <th className="px-6 py-3">eIDAS Assurance</th>
                      <th className="px-6 py-3">EC Registry ID</th>
                      <th className="px-6 py-3">Oversight Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regulatorsList.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-indigo-900">{reg.agencyName}</td>
                        <td className="px-6 py-4 text-slate-700">{reg.jurisdiction}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">
                            {reg.domain}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black text-[10px]">
                            {reg.eidasLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{reg.registryToken}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800">
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">Inspect Node</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'WORKFLOW' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
               <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                 <Workflow className="w-5 h-5 text-indigo-500 mr-2" /> 
                 Enterprise Onboarding Pipeline
               </h2>
               <p className="text-sm text-slate-500 mb-6 max-w-2xl">
                 Design the exact sequence of events that occur when a new enterprise tenant registers. Force compliance verifications, legal sign-offs, and automated infrastructure provisioning before they can access their workspace.
               </p>

               <div className="space-y-3 relative">
                 {/* Visual Line */}
                 <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200"></div>

                 <div className="space-y-3 relative z-10">
                   {workflowSteps.map((step, idx) => {
                     const IconComp = getIconComponent(step.icon);
                     return (
                       <motion.div layout key={step.id} className={`relative flex items-center bg-slate-50 border rounded-xl p-4 group transition-colors cursor-pointer ${activeStepId === step.id ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setActiveStepId(step.id)}>
                         <div className={`bg-white border-2 shadow-sm w-12 h-12 rounded-full flex justify-center items-center shrink-0 z-10 transition-colors ${activeStepId === step.id ? 'border-indigo-400' : 'border-indigo-100 group-hover:border-indigo-300'}`}>
                           <IconComp className="w-5 h-5 text-indigo-500" />
                         </div>
                         <div className="ml-4 flex-1">
                           <h3 className={`text-md font-bold ${activeStepId === step.id ? 'text-indigo-900' : 'text-slate-800'}`}>{step.label}</h3>
                           <div className="flex items-center text-xs text-slate-500 mt-1">
                              <span className="font-semibold text-slate-600 mr-2 border-r border-slate-300 pr-2">Stage {idx + 1}</span>
                              {step.required ? <span className="text-emerald-600 font-medium">Blocking Requirement</span> : <span className="text-slate-400">Optional Phase</span>}
                           </div>
                         </div>
                         <div className="flex items-center space-x-2">
                            <div className="flex flex-col space-y-0.5 mr-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                disabled={idx === 0}
                                onClick={(e) => moveStep(idx, 'up', e)}
                                className={`p-1 rounded hover:bg-slate-200 transition-colors text-slate-500 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer border-0 bg-transparent'}`}
                                title="Move Stage Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                disabled={idx === workflowSteps.length - 1}
                                onClick={(e) => moveStep(idx, 'down', e)}
                                className={`p-1 rounded hover:bg-slate-200 transition-colors text-slate-500 ${idx === workflowSteps.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer border-0 bg-transparent'}`}
                                title="Move Stage Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button onClick={(e) => deleteStep(step.id, e)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-opacity border-0 bg-transparent cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </motion.div>
                     );
                   })}
                 </div>
               </div>

               <button onClick={addStep} className="mt-6 w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex justify-center items-center">
                 <Plus className="w-5 h-5 mr-2" />
                 Add Pipeline Stage
               </button>
            </div>

            {/* Step Settings Panel */}
            <div className="w-full lg:w-1/3 bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 h-fit sticky top-6">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Stage Properties</h3>
               
               {activeStep ? (
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Stage Label</label>
                     <input 
                       type="text" 
                       value={activeStep.label} 
                       onChange={(e) => updateActiveStep({ label: e.target.value })}
                       className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Icon</label>
                     <select 
                       value={activeStep.icon}
                       onChange={(e) => updateActiveStep({ icon: e.target.value })}
                       className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     >
                       <option value="Building2">Building</option>
                       <option value="ShieldCheck">Shield Check</option>
                       <option value="FileCheck">File Check</option>
                       <option value="CreditCard">Credit Card</option>
                       <option value="Database">Database</option>
                       <option value="Users">Users</option>
                       <option value="Workflow">Workflow</option>
                     </select>
                   </div>
                   <div className="flex items-center justify-between pt-2">
                     <div>
                       <span className="block text-sm font-semibold text-slate-700">Blocking Requirement</span>
                       <span className="text-xs text-slate-500">Must complete to proceed</span>
                     </div>
                     <div 
                       className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${activeStep.required ? 'bg-emerald-500' : 'bg-slate-300'}`}
                       onClick={() => updateActiveStep({ required: !activeStep.required })}
                     >
                       <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${activeStep.required ? 'translate-x-4' : 'translate-x-0'}`}></div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-5 sm:py-8 text-slate-500 text-sm">
                   Select a stage to edit its properties
                 </div>
               )}

               <div className="mt-8 pt-6 border-t border-slate-200">
                 <button 
                   onClick={savePipeline}
                   className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
                 >
                   <Save className="w-4 h-4" />
                   Save Pipeline
                 </button>
               </div>
            </div>
          </motion.div>
        )}

        {/* Form Builder Tab */}
        {activeTab === 'FORM_BUILDER' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Builder List */}
            <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-lg font-bold text-slate-800">Registration Fields</h2>
                   <p className="text-xs text-slate-500 mt-1">Define fields for Company and Client profile forms during user onboarding.</p>
                 </div>
                 <button onClick={addField} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center transition-colors border-0 cursor-pointer">
                   <Plus className="w-4 h-4 mr-1" /> Add Field
                 </button>
               </div>

               <div className="space-y-3">
                 <div className="space-y-3">
                   {formFields.map((field, idx) => (
                                             <motion.div layout key={field.id} className={`flex items-center bg-slate-50 border rounded-lg p-3 transition-colors group cursor-pointer ${activeFieldId === field.id ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setActiveFieldId(field.id)}>
                        <div className="flex flex-col space-y-0.5 mr-3 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                           <button 
                             disabled={idx === 0}
                             onClick={(e) => moveField(idx, 'up', e)}
                             className={`p-0.5 rounded hover:bg-slate-200 transition-colors text-slate-500 ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer border-0 bg-transparent'}`}
                             title="Move Field Up"
                           >
                             <ChevronUp className="w-3.5 h-3.5" />
                           </button>
                           <button 
                             disabled={idx === formFields.length - 1}
                             onClick={(e) => moveField(idx, 'down', e)}
                             className={`p-0.5 rounded hover:bg-slate-200 transition-colors text-slate-500 ${idx === formFields.length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer border-0 bg-transparent'}`}
                             title="Move Field Down"
                           >
                             <ChevronDown className="w-3.5 h-3.5" />
                           </button>
                         </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className={`font-semibold text-sm ${activeFieldId === field.id ? 'text-indigo-900' : 'text-slate-800'}`}>{field.label}</span>
                            {field.required && <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] uppercase font-bold rounded">Required</span>}
                          </div>
                          <span className="text-xs text-slate-500 font-mono mt-1 block">type: {field.type} {field.internalKey && `| key: ${field.internalKey}`}</span>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => deleteField(field.id, e)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded border-0 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </motion.div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Field Settings / Properties */}
            <div className="w-full lg:w-1/3 bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 h-fit sticky top-6">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Field Properties</h3>
               
               {activeField ? (
                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Field Label</label>
                     <input 
                       type="text" 
                       value={activeField.label} 
                       onChange={(e) => updateActiveField({ label: e.target.value })}
                       className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" 
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Internal Data Key</label>
                     <input 
                       type="text" 
                       value={activeField.internalKey} 
                       onChange={(e) => updateActiveField({ internalKey: e.target.value })}
                       className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-sm text-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" 
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Input Type</label>
                     <select 
                       value={activeField.type}
                       onChange={(e) => updateActiveField({ type: e.target.value })}
                       className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                     >
                       <option value="text">Text (Short)</option>
                       <option value="textarea">Text (Paragraph)</option>
                       <option value="select">Dropdown Select</option>
                       <option value="file">File Upload (Encrypted)</option>
                       <option value="date">Date Picker</option>
                     </select>
                   </div>
                   {activeField.type === 'select' && (
                     <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1">Options (comma-separated)</label>
                       <input 
                         type="text" 
                         value={activeField.options ? activeField.options.join(', ') : ''} 
                         onChange={(e) => updateActiveField({ options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                         placeholder="EU-CENTRAL-1, EU-WEST-1"
                         className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" 
                       />
                     </div>
                   )}
                   <div className="flex items-center justify-between pt-2">
                     <div>
                       <span className="block text-sm font-semibold text-slate-700">Mandatory Field</span>
                       <span className="text-xs text-slate-500">Require this during initial signup</span>
                     </div>
                     <div 
                       className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${activeField.required ? 'bg-emerald-500' : 'bg-slate-300'}`}
                       onClick={() => updateActiveField({ required: !activeField.required })}
                     >
                       <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${activeField.required ? 'translate-x-4' : 'translate-x-0'}`}></div>
                     </div>
                   </div>

                   {/* Dynamic Form Conditional Rules */}
                   <div className="pt-4 border-t border-slate-200">
                     <div className="flex items-center justify-between mb-3">
                       <span className="block text-sm font-semibold text-slate-700">Conditional Visibility Rules</span>
                       <button 
                         onClick={() => {
                           const rules = activeField.conditionalRules || [];
                           updateActiveField({ conditionalRules: [...rules, { dependentOnKey: '', condition: 'EQUALS', value: '' }] });
                         }}
                         className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center bg-indigo-50 px-2 py-1 rounded"
                       >
                         <Plus className="w-3 h-3 mr-1" /> Add Rule
                       </button>
                     </div>
                     {(!activeField.conditionalRules || activeField.conditionalRules.length === 0) ? (
                       <p className="text-xs text-slate-500 italic">Always visible. Add a rule to show/hide dynamically.</p>
                     ) : (
                       <div className="space-y-3">
                         {activeField.conditionalRules.map((rule: any, i: number) => (
                           <div key={i} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-2 relative group">
                             <button 
                               onClick={() => {
                                 const updated = [...activeField.conditionalRules!];
                                 updated.splice(i, 1);
                                 updateActiveField({ conditionalRules: updated });
                               }}
                               className="absolute -top-2 -right-2 p-1 bg-white border border-rose-200 text-rose-500 rounded-full hover:bg-rose-50 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <X className="w-3 h-3" />
                             </button>
                             <div>
                               <label className="block text-[10px] font-bold text-slate-500 uppercase">Depends on Field Key</label>
                               <input 
                                 type="text" 
                                 value={rule.dependentOnKey}
                                 onChange={(e) => {
                                   const updated = [...activeField.conditionalRules!];
                                   updated[i].dependentOnKey = e.target.value;
                                   updateActiveField({ conditionalRules: updated });
                                 }}
                                 placeholder="e.g. industry_type"
                                 className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                               />
                             </div>
                             <div className="flex gap-2">
                               <div className="w-1/2">
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase">Condition</label>
                                 <select 
                                   value={rule.condition}
                                   onChange={(e) => {
                                     const updated = [...activeField.conditionalRules!];
                                     updated[i].condition = e.target.value as any;
                                     updateActiveField({ conditionalRules: updated });
                                   }}
                                   className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-600 focus:outline-none focus:border-indigo-500"
                                 >
                                   <option value="EQUALS">Equals</option>
                                   <option value="NOT_EQUALS">Not Equals</option>
                                   <option value="CONTAINS">Contains</option>
                                 </select>
                               </div>
                               <div className="w-1/2">
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase">Value</label>
                                 <input 
                                   type="text" 
                                   value={rule.value}
                                   onChange={(e) => {
                                     const updated = [...activeField.conditionalRules!];
                                     updated[i].value = e.target.value;
                                     updateActiveField({ conditionalRules: updated });
                                   }}
                                   placeholder="Expected value"
                                   className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                                 />
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>

                   {/* Reviewer Assignment Automation */}
                   <div className="pt-4 border-t border-slate-200">
                     <span className="block text-sm font-semibold text-slate-700 mb-2">Automated Reviewer Routing</span>
                     <select 
                       value={activeField.reviewerRouting || ''}
                       onChange={(e) => updateActiveField({ reviewerRouting: e.target.value })}
                       className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     >
                       <option value="">No specific routing (Default Queue)</option>
                       <option value="LEGAL_DEPT">Legal & Compliance Department</option>
                       <option value="EXTERNAL_COUNSEL">External Counsel / Lawyer Portal</option>
                       <option value="DPO">Data Protection Officer (DPO)</option>
                       <option value="CISO">Chief Information Security Officer</option>
                     </select>
                     <p className="text-[10px] text-slate-500 mt-1">If filled, this field's data triggers an automated workflow assignment.</p>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-5 sm:py-8 text-slate-500 text-sm">
                   Select a field to edit its properties
                 </div>
               )}

               <div className="mt-8 pt-6 border-t border-slate-200">
                 <button 
                   onClick={saveFormConfig}
                   className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
                 >
                   <Save className="w-4 h-4" />
                   Save Form Configuration
                 </button>
               </div>
            </div>
          </motion.div>
        )}

        {/* Verification Configuration Tab */}
        {activeTab === 'VERIFICATION_CONFIG' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="w-full lg:w-2/3 space-y-4 sm:space-y-6">
              {/* Card 1: EUDI Identity Integration */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">EU Digital Identity (EUDI) Wallet Integration</h3>
                    <p className="text-xs text-slate-500">Configure Person Identification Data (PID) extraction and validation policies.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">Enforce EUDI Verification</span>
                      <span className="text-xs text-slate-500">Require all users to verify their identity via standard EU eIDAS protocol.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.eudiEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, eudiEnabled: !verificationConfig.eudiEnabled })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.eudiEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  {verificationConfig.eudiEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pl-4 border-l-2 border-indigo-100 mt-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Minimum Level of Assurance (LoA)</label>
                        <select 
                          value={verificationConfig.eudiMinAssurance}
                          onChange={(e) => setVerificationConfig({ ...verificationConfig, eudiMinAssurance: e.target.value })}
                          className="w-full max-w-xs text-xs border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="HIGH">HIGH (FIDO2 tokens, qualified certs)</option>
                          <option value="SUBSTANTIAL">SUBSTANTIAL (Standard mobile secure element)</option>
                          <option value="LOW">LOW (Username / self-declared)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-semibold text-slate-700">Require Cryptographic Signature Validation</span>
                          <span className="text-[11px] text-slate-500">Check cryptographic proof against EU Member State trust list anchors.</span>
                        </div>
                        <div 
                          className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.eudiSignatureRequired ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          onClick={() => setVerificationConfig({ ...verificationConfig, eudiSignatureRequired: !verificationConfig.eudiSignatureRequired })}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.eudiSignatureRequired ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Card 2: Business & Commercial Registry */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">EU VAT & Commercial Registry Lookups</h3>
                    <p className="text-xs text-slate-500">Validate corporate existence through real-time EU VIES queries.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">Auto-Query EU VIES Database</span>
                      <span className="text-xs text-slate-500">Extract trade registry record and match registered company name on-the-fly.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.viesEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, viesEnabled: !verificationConfig.viesEnabled })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.viesEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">Block Unverified Registrations</span>
                      <span className="text-xs text-slate-500">Instantly halt onboarding and trigger manual audit if VAT lookup fails.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.viesBlockUnverified ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, viesBlockUnverified: !verificationConfig.viesBlockUnverified })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.viesBlockUnverified ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: AML & Sanctions List Screenings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">AML & Global Sanctions Screening</h3>
                    <p className="text-xs text-slate-500">Cross-reference registrations against watchlists to prevent high-risk onboarding.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">Enable Real-Time Watchlist Checks</span>
                      <span className="text-xs text-slate-500">Scan entities and officers against Interpol, PEP, and EU Consolidate Lists.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.sanctionsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, sanctionsEnabled: !verificationConfig.sanctionsEnabled })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.sanctionsEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  {verificationConfig.sanctionsEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pl-4 border-l-2 border-indigo-100 mt-3 pt-1">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>Auto-Hold Risk Threshold</span>
                          <span className="text-indigo-600 font-bold">{verificationConfig.sanctionsRiskThreshold}% Risk Match</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="95" 
                          value={verificationConfig.sanctionsRiskThreshold}
                          onChange={(e) => setVerificationConfig({ ...verificationConfig, sanctionsRiskThreshold: parseInt(e.target.value) })}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Onboarding holds automatically for manual administrative approval if fuzzy matching exceeds this score.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Card 4: Legal Consent Agreements */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Legal Agreements & SCC Mandates</h3>
                    <p className="text-xs text-slate-500">Set mandatory compliance agreements required before provisioning workspace.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">Standard Contractual Clauses (SCC) Sign-off</span>
                      <span className="text-xs text-slate-500">Require direct electronic signature on GDPR Art 46 data transfer clauses.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.sccSignatureRequired ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, sccSignatureRequired: !verificationConfig.sccSignatureRequired })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.sccSignatureRequired ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">Mandatory DPO Appointment Letter</span>
                      <span className="text-xs text-slate-500">Require upload of formally signed DPO appointment letter as evidence.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.dpoLetterRequired ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, dpoLetterRequired: !verificationConfig.dpoLetterRequired })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.dpoLetterRequired ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Official EU Regulator Verification Policies */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Scale className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">EU Regulator Verification Policies</h3>
                    <p className="text-xs text-slate-500">Configure rigorous validation criteria for supervising regional authorities.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">Enforce eIDAS High Assurance Seals</span>
                      <span className="text-xs text-slate-500">Require hardware-backed cryptographic signatures for regulator sessions.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.regulatorHighAssuranceRequired ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, regulatorHighAssuranceRequired: !verificationConfig.regulatorHighAssuranceRequired })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.regulatorHighAssuranceRequired ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">European EDPB Registry Database Sync</span>
                      <span className="text-xs text-slate-500">Automatically lookup and block fake or unverified regulator registry IDs on signup.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.regulatorWhitelistRegistrySync ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, regulatorWhitelistRegistrySync: !verificationConfig.regulatorWhitelistRegistrySync })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.regulatorWhitelistRegistrySync ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-semibold text-slate-700">Require Signed Oath of Office</span>
                      <span className="text-xs text-slate-500">Require official digitized signature and attestation of administrative impartiality.</span>
                    </div>
                    <div 
                      className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${verificationConfig.regulatorSignedOathRequired ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      onClick={() => setVerificationConfig({ ...verificationConfig, regulatorSignedOathRequired: !verificationConfig.regulatorSignedOathRequired })}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${verificationConfig.regulatorSignedOathRequired ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Save Panel */}
            <div className="w-full lg:w-1/3 bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5 lg:p-6 h-fit sticky top-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Verification Audit Rules</h3>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium space-y-3 shadow-sm">
                <p className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Active Sovereign Protections
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>EUDI Verification:</span>
                    <span className={verificationConfig.eudiEnabled ? "text-emerald-600 font-bold" : "text-slate-400 font-bold"}>
                      {verificationConfig.eudiEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>VIES Registry Sync:</span>
                    <span className={verificationConfig.viesEnabled ? "text-emerald-600 font-bold" : "text-slate-400 font-bold"}>
                      {verificationConfig.viesEnabled ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>AML Screening:</span>
                    <span className={verificationConfig.sanctionsEnabled ? "text-emerald-600 font-bold" : "text-slate-400 font-bold"}>
                      {verificationConfig.sanctionsEnabled ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>SCC Contract Sign:</span>
                    <span className={verificationConfig.sccSignatureRequired ? "text-emerald-600 font-bold" : "text-slate-400 font-bold"}>
                      {verificationConfig.sccSignatureRequired ? "ENFORCED" : "OPTIONAL"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                    <span>Regulator Whitelist check:</span>
                    <span className={verificationConfig.regulatorWhitelistRegistrySync ? "text-indigo-600 font-bold" : "text-slate-400 font-bold"}>
                      {verificationConfig.regulatorWhitelistRegistrySync ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Regulator eIDAS LoA:</span>
                    <span className="text-indigo-600 font-bold">HIGH</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={saveVerificationConfig}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Verification Rules
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Document Preview & Verification Modal */}
      <KycDocumentPreviewModal
        documentId={selectedDocId}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onStatusUpdated={handleStatusUpdatedInModal}
      />
    </div>
  );
};
