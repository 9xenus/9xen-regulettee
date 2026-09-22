import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  Award,
  AlertTriangle,
  TrendingUp,
  FileText,
  Users,
  Briefcase,
  ChevronLeft,
  CheckCircle2,
  Lock,
  History,
  LogIn,
  Eye,
  Edit2,
  Save,
  X,
  Fingerprint,
  Trash2,
  Download,
  RefreshCw,
  FileDown,
  ShieldAlert,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CompanyProfile: React.FC<{ 
  activeRole?: string;
  onNavigate?: (path: string) => void;
  onSwitchRole?: (role: string, tenantId?: string) => void;
}> = ({ activeRole = 'TENANT_OWNER', onNavigate, onSwitchRole }) => {
  const tenantId = localStorage.getItem('selected_admin_tenant_id') || 'org_1';
  const isRegulator = activeRole === 'EU_REGULATOR';

  // Biometric Privacy Controls state
  const [biometricTemplates, setBiometricTemplates] = useState<any[]>([]);
  const [loadingBiometrics, setLoadingBiometrics] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [privacyToast, setPrivacyToast] = useState<string | null>(null);
  const [selectedTemplateForDetails, setSelectedTemplateForDetails] = useState<any | null>(null);
  const [showConfirmErasureId, setShowConfirmErasureId] = useState<string | null>(null);

  const fetchBiometricTemplates = async () => {
    setLoadingBiometrics(true);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/biometric/enrollments');
      const data = await res.json();
      if (data && data.success && data.enrollments) {
        setBiometricTemplates(data.enrollments);
      }
    } catch (err) {
      console.error('Error fetching biometric templates:', err);
    } finally {
      setLoadingBiometrics(false);
    }
  };

  useEffect(() => {
    fetchBiometricTemplates();
  }, []);

  const handleErasureRequest = async (enrollmentId: string) => {
    setDeletingTemplateId(enrollmentId);
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/biometric/enrollment/${enrollmentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data && data.success) {
        setPrivacyToast(`GDPR Art. 17 Deletion Succeeded: Biometric template for ${data.erasedUsername} was permanently deleted.`);
        setShowConfirmErasureId(null);
        if (selectedTemplateForDetails?.enrollmentId === enrollmentId) {
          setSelectedTemplateForDetails(null);
        }
        setBiometricTemplates(prev => prev.filter(t => t.enrollmentId !== enrollmentId));
      } else {
        setPrivacyToast(`Error: ${data.error || "Could not complete erasure request"}`);
      }
    } catch (err: any) {
      console.error('Error requesting biometric erasure:', err);
      setPrivacyToast(`Network Error: ${err.message || "Failed to contact trust provider"}`);
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const handleExportTemplate = (template: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `biometric_template_${template.enrollmentId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setPrivacyToast(`Data Portability: Biometric template ${template.enrollmentId} exported successfully.`);
  };

  // Regulator Specific State
  const [regulator, setRegulator] = useState(() => {
    try {
      const saved = localStorage.getItem('regulator_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse regulator_profile_v1:', e);
    }

    const defaultRegulator = {
      agencyName: "European Artificial Intelligence Board (EAIB)",
      division: "Algorithmic Audit & Compliance Directorate",
      jurisdiction: "27 EU Member States & EEA",
      headquarters: "Brussels, Belgium",
      website: "https://eaib.europa.eu",
      contactEmail: "enforcement@eaib.europa.eu",
      contactPhone: "+32 2 299 1111",
      description: "The European Artificial Intelligence Board is established to ensure a consistent, harmonized application of the Artificial Intelligence Act (Regulation EU 2024/1689) across the European Union. In cooperation with national supervisory authorities, the Board issues guidelines, monitors frontier model training, and handles trans-border high-risk AI system enforcements.",
      leadership: [
        { name: "Hon. Commissioner Viviane Reding", role: "Head of Board Directorate", avatar: "VR" },
        { name: "Dr. Arthur Pendelton", role: "Chief Algorithmic Auditor", avatar: "AP" },
        { name: "Maître Sophie Dubois", role: "Director of Enforcement Actions", avatar: "SD" }
      ],
      activeMandates: [
        { title: "EU AI Act (Regulation EU 2024/1689)", scope: "High-risk model oversight & auditing standardizations" },
        { title: "GDPR Articles 57 & 58 Enforcement Powers", scope: "Direct cross-border processing investigations & data protection audits" },
        { title: "DORA Operational Cyber Resilience Framework", scope: "Sovereign financial entity stress tests & ICT supply-chain auditing" }
      ],
      metrics: {
        registeredEntitiesCount: 142,
        activeInvestigations: 7,
        reportsPublished: 38,
        budgetUtilization: "89.4%"
      },
      recentEnforcements: [
        { id: "enf_82", date: "2026-05-18", entity: "Global Asset Management", matter: "Cross-border AML System Audit", status: "Resolved", consequence: "Official Warning & Remediation Plan" },
        { id: "enf_79", date: "2026-06-02", entity: "Stark Industries", matter: "DORA Security Boundary Incident", status: "In Inquiry", consequence: "On-site Forensic Audit scheduled" },
        { id: "enf_75", date: "2026-06-11", entity: "Beta Innovations", matter: "Autonomous Sensor Bias Evaluation", status: "Active Investigation", consequence: "Technical file subpoena issued" }
      ]
    };

    localStorage.setItem('regulator_profile_v1', JSON.stringify(defaultRegulator));
    return defaultRegulator;
  });

  const [regulatorDraft, setRegulatorDraft] = useState({ ...regulator });

  const handleRegulatorSave = () => {
    setRegulator(regulatorDraft);
    localStorage.setItem('regulator_profile_v1', JSON.stringify(regulatorDraft));
    setIsEditing(false);
    triggerToast("Official Regulator Profile successfully updated! Changes live on official public transparency log.");
  };

  const updateRegulatorDraftField = (key: string, value: any) => {
    setRegulatorDraft((prev: any) => ({ ...prev, [key]: value }));
  };

  // LinkedIn-style Profile Switcher Views: 'tenant' or 'public'
  const [viewMode, setViewMode] = useState<'tenant' | 'public'>('tenant');
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toastTimeoutRef = useRef<any>(null);

  // SAAD / Super Admin Override Permissions & Controls
  const userRole = localStorage.getItem('user_role') || '';
  const currentRole = activeRole || userRole;
  const isSuperAdminOrSaad = currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || currentRole === 'saad_admin' || userRole === 'saad_admin';
  const [showAdminOverride, setShowAdminOverride] = useState<boolean>(() => {
    const saved = localStorage.getItem('saad_override_panel_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const canShowSaadPanel = isSuperAdminOrSaad || showAdminOverride;

  const triggerToast = (msg: string, duration = 4000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setSuccessMsg(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setSuccessMsg(null);
    }, duration);
  };

  // Dynamic state saved in localStorage for complete durable tenant persistence
  const [company, setCompany] = useState(() => {
    try {
      const saved = localStorage.getItem(`company_profile_${tenantId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(`Failed to parse company_profile_${tenantId}:`, e);
    }

    // Find custom name and status from global list if active
    let tenantsList = [];
    try {
      const rawList = localStorage.getItem('platform_tenants_list');
      if (rawList) tenantsList = JSON.parse(rawList);
    } catch (e) {
      console.error('Failed to parse platform_tenants_list in company state init:', e);
    }
    const matchedTenant = tenantsList.find((t: any) => t.id === tenantId);

    let name = matchedTenant ? matchedTenant.name : 'Acme Corporation Europe';
    let legalName = name + (name.endsWith('GmbH') || name.endsWith('Corp') ? '' : ' GmbH');
    let industry = 'Financial Technology (FinTech)';
    let founded = '2015';
    let headquarters = 'Berlin, Germany';
    let website = 'https://acme-eu.com';
    let contactEmail = 'legal@acme-eu.com';
    let contactPhone = '+49 30 1234 5678';
    let description = 'A leading provider of B2B payment solutions and blockchain-based treasury management services for enterprise clients across the European Union.';
    let overallScore = 94;

    if (tenantId === 'org_2') {
      industry = 'Advanced Defense & Clean Energy';
      founded = '2008';
      headquarters = 'Munich, Germany';
      website = 'https://stark-industries.de';
      contactEmail = 'compliance@stark-industries.gmbh';
      contactPhone = '+49 89 9876 5432';
      description = 'Global aerospace, sustainable power grid operations, and deep technology compliance for sovereign defense agencies.';
      overallScore = 88;
    } else if (tenantId === 'org_3') {
      industry = 'Investment Banking & Asset Management';
      founded = '1998';
      headquarters = 'Frankfurt, Germany';
      website = 'https://global-finance-corp.eu';
      contactEmail = 'legal@global-finance.com';
      contactPhone = '+49 69 1111 2222';
      description = 'Tier-1 international banking entity handling cross-border settlements, securities clearing, and AML regulatory audits.';
      overallScore = 72;
    } else if (tenantId === 'org_4') {
      industry = 'Autonomous IoT Sensors & Smart Logistics';
      founded = '2021';
      headquarters = 'Stuttgart, Germany';
      website = 'https://beta-innovations.io';
      contactEmail = 'info@beta-innovations.io';
      contactPhone = '+49 711 555 777';
      description = 'Early-stage smart industrial network solution connecting automatic logistics systems with DORA and EU AI Act tracking requirements.';
      overallScore = 45;
    }

    const defaultProfile = {
      id: tenantId,
      name,
      legalName,
      industry,
      founded,
      status: matchedTenant ? matchedTenant.status : 'ACTIVE',
      tier: matchedTenant ? matchedTenant.tier : 'Enterprise',
      phase: matchedTenant ? matchedTenant.phase : 'Production',
      region: matchedTenant ? matchedTenant.region : 'EU-CENTRAL-1 (Frankfurt)',
      headquarters,
      website,
      contactEmail,
      contactPhone,
      description,
      leadership: [
        { name: 'Dr. Elena Rostova', role: 'Chief Executive Officer (CEO)', avatar: 'ER' },
        { name: 'Marcus Sterling', role: 'Chief Compliance Officer (CCO)', avatar: 'MS' },
        { name: 'Julia Chen', role: 'Director of EU Operations', avatar: 'JC' }
      ],
      complianceMetrics: {
        overallScore,
        gdprReadiness: overallScore >= 90 ? 98 : 74,
        aiActCompliance: overallScore >= 90 ? 89 : 62,
        psd2Compliance: overallScore >= 90 ? 100 : 80,
        esgRating: overallScore >= 90 ? 'A+' : 'B',
        doraReadiness: overallScore >= 90 ? 91 : 68
      },
      recentAudits: [
        { date: '2025-10-14', title: 'Q3 Independent DPIA Review', status: 'Passed', findingCount: 0 },
        { date: '2025-08-22', title: 'Annual Penetration Testing', status: 'Passed with Notes', findingCount: 2 },
        { date: '2025-06-05', title: 'AI Act Algorithmic Bias Audit', status: overallScore >= 80 ? 'Passed' : 'In Progress', findingCount: overallScore >= 80 ? 0 : 3 }
      ],
      policyRate: overallScore >= 90 ? '99.8%' : '84.2%',
      activePolicies: overallScore >= 90 ? 124 : 45,
      lastBreach: 'None recorded'
    };

    localStorage.setItem(`company_profile_${tenantId}`, JSON.stringify(defaultProfile));
    return defaultProfile;
  });

  const [draft, setDraft] = useState({ ...company });

  const startEditing = () => {
    setDraft({ ...company });
    setIsEditing(true);
  };

  const updateField = (key: string, value: any) => {
    setDraft((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setCompany(draft);
    localStorage.setItem(`company_profile_${tenantId}`, JSON.stringify(draft));

    // Two-way sync back into key 'platform_tenants_list'
    const rawList = localStorage.getItem('platform_tenants_list');
    if (rawList) {
      try {
        const list = JSON.parse(rawList);
        const updatedList = list.map((t: any) => {
          if (t.id === tenantId) {
            return {
              ...t,
              name: draft.name,
              status: draft.status || t.status,
              tier: draft.tier || t.tier,
              phase: draft.phase || t.phase
            };
          }
          return t;
        });
        localStorage.setItem('platform_tenants_list', JSON.stringify(updatedList));
      } catch (e) {
        console.error('Failed to parse platform_tenants_list in handleSave:', e);
      }
    }

    setIsEditing(false);
    triggerToast("Public Trust Profile successfully updated! Changes live on public ledger API.");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAdminUpdatePackage = (newTier: string) => {
    const updatedCompany = { ...company, tier: newTier };
    setCompany(updatedCompany);
    setDraft(updatedCompany);
    localStorage.setItem(`company_profile_${tenantId}`, JSON.stringify(updatedCompany));

    const rawList = localStorage.getItem('platform_tenants_list');
    if (rawList) {
      const list = JSON.parse(rawList);
      const updatedList = list.map((t: any) => t.id === tenantId ? { ...t, tier: newTier } : t);
      localStorage.setItem('platform_tenants_list', JSON.stringify(updatedList));
    }

    fetchWithRetry(`/api/v1/tenants/${tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: newTier })
    }).catch(err => console.warn('Failed to sync tier to backend:', err));

    triggerToast(`Subscription package updated to ${newTier} across sovereign infrastructure!`);
  };

  const handleAdminUpdatePhase = (newPhase: string) => {
    const updatedCompany = { ...company, phase: newPhase };
    setCompany(updatedCompany);
    setDraft(updatedCompany);
    localStorage.setItem(`company_profile_${tenantId}`, JSON.stringify(updatedCompany));

    const rawList = localStorage.getItem('platform_tenants_list');
    if (rawList) {
      const list = JSON.parse(rawList);
      const updatedList = list.map((t: any) => t.id === tenantId ? { ...t, phase: newPhase } : t);
      localStorage.setItem('platform_tenants_list', JSON.stringify(updatedList));
    }

    fetchWithRetry(`/api/v1/tenants/${tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase: newPhase })
    }).catch(err => console.warn('Failed to sync phase to backend:', err));

    triggerToast(`Pipeline Phase transitioned to ${newPhase} successfully!`);
  };

  const handleAdminToggleStatus = () => {
    const targetStatus = company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updatedCompany = { ...company, status: targetStatus };
    setCompany(updatedCompany);
    setDraft(updatedCompany);
    localStorage.setItem(`company_profile_${tenantId}`, JSON.stringify(updatedCompany));

    const rawList = localStorage.getItem('platform_tenants_list');
    if (rawList) {
      const list = JSON.parse(rawList);
      const updatedList = list.map((t: any) => t.id === tenantId ? { ...t, status: targetStatus } : t);
      localStorage.setItem('platform_tenants_list', JSON.stringify(updatedList));
    }

    fetchWithRetry(`/api/v1/tenants/${tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus })
    }).catch(err => console.warn('Failed to sync status to backend:', err));

    triggerToast(`Tenant gateway status successfully toggled to ${targetStatus}!`);
  };

  const handleDeleteTenant = () => {
    const rawList = localStorage.getItem('platform_tenants_list');
    if (rawList) {
      const list = JSON.parse(rawList);
      const filtered = list.filter((t: any) => t.id !== tenantId);
      localStorage.setItem('platform_tenants_list', JSON.stringify(filtered));
    }
    localStorage.removeItem(`company_profile_${tenantId}`);

    fetchWithRetry(`/api/v1/tenants/${tenantId}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Failed to sync delete to backend:', err));

    setShowDeleteConfirm(false);
    triggerToast("Tenant workspace purged from platform database!");
    setTimeout(() => {
      if (onNavigate) {
        onNavigate('tenants');
      }
    }, 1200);
  };

  if (isRegulator) {
    return (
      <div className="space-y-6 pb-12">
        {/* Header / Breadcrumb */}
        <div className="flex items-center justify-between space-x-4 mb-2">
          <div className="flex items-center space-x-4">
            {onNavigate && (
              <button 
                onClick={() => onNavigate('tenants')}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sovereign Authority Profile</h1>
              <p className="text-sm text-slate-500 font-medium font-sans">Verify authority mandates, active regional divisions, and public transparency disclosures.</p>
            </div>
          </div>
        </div>

        {/* LinkedIn Mode Switch Bar for Regulator */}
        {viewMode === 'public' ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white px-4 sm:px-6 py-4 rounded-2xl flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 shadow-lg border border-slate-800 text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                <Eye className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center">
                  <span>Currently Viewing Public Authority Register</span>
                  <span className="ml-2.5 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-amber-400 bg-amber-950 border border-amber-800 rounded-full uppercase font-mono">Transparency Mode</span>
                </p>
                <p className="text-xs text-slate-300 mt-0.5">This represents the public registry ledger representation of your agency. Edit controls are hidden.</p>
              </div>
            </div>
            <button 
              onClick={() => { setViewMode('tenant'); setIsEditing(false); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 self-start md:self-center"
            >
              Switch to Controller Admin View
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 hover:border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 shadow-sm text-left transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 font-sans">Sovereign Authority Workspace Profile</p>
                <p className="text-xs text-slate-500 mt-0.5">Authorized Board Access. You can modify administrative registry disclosures, manage commissioners, and issue official gazettes.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 shrink-0 self-start sm:self-center">
              <button 
                onClick={() => { setViewMode('public'); setIsEditing(false); }}
                className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border border-blue-100"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Public Register</span>
              </button>
              <button 
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    setRegulatorDraft({ ...regulator });
                    setIsEditing(true);
                  }
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isEditing 
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100" 
                    : "bg-blue-650 hover:bg-blue-700 bg-blue-600 text-white hover:text-white"
                }`}
              >
                {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                <span>{isEditing ? "Discard Changes" : "Edit Registry Info"}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Success Alert Toast Notification */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-white border border-blue-500/30 text-slate-800 p-4 rounded-2xl shadow-2xl max-w-sm border-l-4 border-l-blue-600 text-left overflow-hidden"
            >
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">Operations Log</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-semibold">
                  {successMsg}
                </p>
              </div>
              <button
                onClick={() => setSuccessMsg(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border-0 cursor-pointer bg-transparent shrink-0 self-start"
              >
                <X className="w-4 h-4" />
              </button>
              <motion.div 
                key={successMsg || 'regulator_toast_countdown'}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute bottom-0 left-0 h-0.5 bg-blue-600"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top KPI Cards for Regulator */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Supervised Systems</span>
              <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 font-sans">{regulator.metrics.registeredEntitiesCount}</span>
              <span className="text-xs text-slate-500 mb-1 font-semibold font-sans">Registered AI Models</span>
            </div>
            <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold bg-emerald-50 w-fit px-2 py-0.5 rounded font-sans">
              <TrendingUp className="w-3 h-3 mr-1" /> +12 new this month
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Active Inquiries</span>
              <div className="p-1.5 bg-amber-50 rounded-md text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 font-sans">{regulator.metrics.activeInvestigations}</span>
              <span className="text-xs text-slate-500 mb-1 font-semibold font-sans">Formal Cases</span>
            </div>
            <div className="mt-3 flex items-center text-xs text-amber-700 font-semibold bg-amber-50 w-fit px-2 py-0.5 rounded border border-amber-100 font-sans">
              2 Urgent Priority
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Official Gazettes</span>
              <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 font-sans">{regulator.metrics.reportsPublished}</span>
              <span className="text-xs text-slate-500 mb-1 font-semibold font-sans">Audits Released</span>
            </div>
            <div className="mt-3 flex items-center text-xs text-indigo-600 font-semibold bg-indigo-50/50 w-fit px-2 py-0.5 rounded font-sans">
              Quarterly reports published
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Treasury Alignment</span>
              <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 font-sans">{regulator.metrics.budgetUtilization}</span>
              <span className="text-xs text-slate-500 mb-1 font-semibold font-sans">Operations</span>
            </div>
            <div className="mt-3 flex items-center text-xs text-slate-600 font-semibold bg-slate-50 w-fit px-2 py-0.5 rounded border border-slate-100 font-sans">
              Audit efficiency optimal
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Register card and Key Officers */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white border text-left border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
              <div className="h-28 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 relative">
                {/* Official Stamp SEC Accent */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <span className="bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[9px] uppercase font-bold px-2 py-1 rounded font-mono">
                    SOVEREIGN BOARD
                  </span>
                  <span className="bg-blue-500/20 text-blue-100 border border-blue-500/30 text-[9px] uppercase font-bold px-2 py-1 rounded font-mono">
                    EU RECOGNIZED
                  </span>
                </div>
                {/* Visual Official Seal stamp */}
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 bg-blue-900 text-white rounded-xl shadow-md border-4 border-white flex items-center justify-center font-black text-2xl tracking-tight">
                    ★EU★
                  </div>
                </div>
              </div>

              <div className="pt-14 p-4 sm:p-5 lg:p-6">
                {isEditing ? (
                  <div className="space-y-3.5 mb-2 text-left">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1 font-sans">Agency Name</label>
                      <input 
                        type="text" 
                        value={regulatorDraft.agencyName} 
                        onChange={(e) => updateRegulatorDraftField('agencyName', e.target.value)}
                        className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1 font-sans">Directorate Division</label>
                      <input 
                        type="text" 
                        value={regulatorDraft.division} 
                        onChange={(e) => updateRegulatorDraftField('division', e.target.value)}
                        className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-600 font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-slate-900 font-sans">{regulator.agencyName}</h2>
                    <p className="text-sm text-slate-500 mb-4 font-sans">{regulator.division}</p>
                  </div>
                )}

                <div className="space-y-3 mt-6 border-t border-slate-100 pt-4 text-left">
                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1 font-sans">Legal Jurisdiction</label>
                        <input 
                          type="text" 
                          value={regulatorDraft.jurisdiction} 
                          onChange={(e) => updateRegulatorDraftField('jurisdiction', e.target.value)}
                          className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1 font-sans">Headquarters</label>
                        <input 
                          type="text" 
                          value={regulatorDraft.headquarters} 
                          onChange={(e) => updateRegulatorDraftField('headquarters', e.target.value)}
                          className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1 font-sans">Official Registry Website</label>
                        <input 
                          type="text" 
                          value={regulatorDraft.website} 
                          onChange={(e) => updateRegulatorDraftField('website', e.target.value)}
                          className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1 font-sans">Enforcement / Support Email</label>
                        <input 
                          type="email" 
                          value={regulatorDraft.contactEmail} 
                          onChange={(e) => updateRegulatorDraftField('contactEmail', e.target.value)}
                          className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1 font-sans">Authority Hotline</label>
                        <input 
                          type="text" 
                          value={regulatorDraft.contactPhone} 
                          onChange={(e) => updateRegulatorDraftField('contactPhone', e.target.value)}
                          className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start text-sm text-slate-600">
                        <Briefcase className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" />
                        <span className="font-sans">Jurisdiction: <strong className="text-slate-800 font-sans">{regulator.jurisdiction}</strong></span>
                      </div>
                      <div className="flex items-start text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" />
                        <span className="font-sans">HQ: {regulator.headquarters}</span>
                      </div>
                      <div className="flex items-start text-sm text-slate-600">
                        <Globe className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" />
                        <a href={regulator.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold font-sans">{regulator.website}</a>
                      </div>
                      <div className="flex items-start text-sm text-slate-600">
                        <Mail className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" />
                        <span className="font-sans font-medium">Enquiries: {regulator.contactEmail}</span>
                      </div>
                      <div className="flex items-start text-sm text-slate-600">
                        <Phone className="w-4 h-4 mr-3 mt-0.5 text-slate-400 shrink-0" />
                        <span className="font-sans font-medium">Hotline: {regulator.contactPhone}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start text-sm text-slate-600 border-t border-slate-100 pt-3 mt-3">
                    <ShieldCheck className="w-4 h-4 mr-3 mt-0.5 text-blue-600 shrink-0" />
                    <span className="font-sans">Enclave Sovereignty: <strong className="text-slate-800 font-sans">EU-CENTRAL-1 (Auditable)</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Board Mission & Officers */}
            <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center font-sans">
                <FileText className="w-4 h-4 mr-2 text-blue-600" /> Board Mission & Charter
              </h3>
              {isEditing ? (
                <div className="mb-4">
                  <textarea 
                    value={regulatorDraft.description} 
                    onChange={(e) => updateRegulatorDraftField('description', e.target.value)}
                    rows={6}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 leading-relaxed text-slate-600"
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed mb-6 font-sans">
                  {regulator.description}
                </p>
              )}

              <h3 className="text-sm font-bold text-slate-800 mb-4 border-t border-slate-100 pt-5 flex items-center font-sans">
                <Users className="w-4 h-4 mr-2 text-blue-600" /> Executive Board Commissioners
              </h3>
              <div className="space-y-4">
                {regulator.leadership.map((leader: { name: string; role: string; avatar: string }, i: number) => (
                  <div key={i} className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                      {leader.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 font-sans">{leader.name}</h4>
                      <p className="text-xs text-slate-500 font-medium font-sans">{leader.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={handleRegulatorSave}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-750 bg-blue-600 text-white hover:text-white text-xs font-bold rounded-lg flex justify-center items-center space-x-1.5 transition-colors shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Registry</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Mandates and Active Enforcement Log */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Legal Mandates Card */}
            <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center font-sans">
                <Award className="w-5 h-5 mr-2 text-blue-600" /> Sovereign Regulatory Mandates & Authority
              </h3>
              <div className="space-y-4">
                {regulator.activeMandates.map((m: { title: string, scope: string }, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                      <h4 className="text-sm font-bold text-slate-900 font-sans">{m.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed pl-4 font-medium font-sans">
                      {m.scope}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Enforcement Ledger */}
            <div className="bg-white border text-left border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800 flex items-center font-sans">
                  <History className="w-4 h-4 mr-2 text-blue-600" /> Active Enforcements & Inquiries Ledger
                </h3>
                <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase">
                  Live Stream
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {regulator.recentEnforcements.map((enf: any, i: number) => (
                  <div key={i} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-slate-50 transition-colors gap-3 text-left">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{enf.id}</span>
                        <h4 className="text-sm font-bold text-slate-900 font-sans">{enf.entity}</h4>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold mt-1 font-sans">Matter: {enf.matter}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-sans">Consequence: <span className="font-semibold text-slate-700">{enf.consequence}</span></p>
                    </div>
                    <div className="flex flex-col items-start md:items-end shrink-0">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        enf.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        enf.status === 'In Inquiry' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {enf.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium font-sans">Logged on {enf.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Powers & Penalties Guide */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-800 text-left relative overflow-hidden shadow-md">
              <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
                <ShieldCheck className="w-48 h-48 text-white" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-400 font-mono mb-2">Notice of Supervisory Powers</h3>
              <h4 className="text-base font-bold text-white mb-2 font-sans">9Xen Regulettee Regulatory Coherence</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium font-sans">
                Under Regulation Article 64, national supervisory boards of EU Member States maintain physical and digital inspection mandates to retrieve model parameters, review training sets, verify cryptographic audit trails, or apply administrative penalties of up to €35M or 7% of global annual turnover for high-risk system breaches.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header / Breadcrumb */}
      <div className="flex items-center justify-between space-x-4 mb-2">
        <div className="flex items-center space-x-4">
          {onNavigate && (
            <button 
              onClick={() => onNavigate('tenants')}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Organization Profile</h1>
            <p className="text-sm text-slate-500">View detailed analytics, leadership, and public compliance certificates.</p>
          </div>
        </div>
      </div>

      {/* LinkedIn Mode Instruction Switch Bar */}
      {viewMode === 'public' ? (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white px-4 sm:px-6 py-4 rounded-2xl flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 shadow-lg border border-slate-800 text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
              <Eye className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center">
                <span>Currently Viewing as Public Partner</span>
                <span className="ml-2.5 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-indigo-300 bg-indigo-950 border border-indigo-800 rounded-full uppercase">LinkedIn Mode</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">This represents exactly what third-party vendors, compliance auditors, and the general public see. Editing controls are hidden.</p>
            </div>
          </div>
          <button 
            onClick={() => { setViewMode('tenant'); setIsEditing(false); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 self-start md:self-center"
          >
            Switch to Tenant Admin View
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 hover:border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 shadow-sm text-left transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Tenant Administrator Workspace Profile</p>
              <p className="text-xs text-slate-500 mt-0.5">Full administrative rights. You can edit profile metadata, publish disclosures, and preview public viewpoints.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 shrink-0 self-start sm:self-center">
            <button 
              onClick={() => { setViewMode('public'); setIsEditing(false); }}
              className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border border-indigo-100"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View public profile</span>
            </button>
            <button 
              onClick={() => {
                if (isEditing) {
                  handleCancel();
                } else {
                  startEditing();
                }
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                isEditing 
                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100" 
                  : "bg-emerald-550 hover:bg-emerald-600 bg-emerald-600 text-white hover:text-white"
              }`}
            >
              {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Discard Changes" : "Edit Profile Info"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextState = !showAdminOverride;
                setShowAdminOverride(nextState);
                localStorage.setItem('saad_override_panel_enabled', String(nextState));
                triggerToast(nextState ? "Saad / Super Admin Override Panel activated" : "Saad Override Panel hidden");
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border shadow-xs ${
                showAdminOverride 
                  ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" 
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
              title="Toggle Saad / Super Admin Governance Controls"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>{showAdminOverride ? "Saad Override: Active" : "Enable Saad Panel"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Success Alert Toast Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-white border border-emerald-500/30 text-slate-800 p-4 rounded-2xl shadow-2xl max-w-sm border-l-4 border-l-emerald-500 text-left overflow-hidden"
          >
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">Operations Log</p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-semibold">
                {successMsg}
              </p>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border-0 cursor-pointer bg-transparent shrink-0 self-start"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Elegant running countdown line */}
            <motion.div 
              key={successMsg || 'toast_countdown'}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-emerald-600"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Super Admin Sovereign Override Panel */}
      {canShowSaadPanel && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-rose-200 rounded-2xl p-5 shadow-md text-left relative overflow-hidden mb-6"
        >
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
            <ShieldCheck className="w-32 h-32 text-rose-900" />
          </div>
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center space-y-4 xl:space-y-0">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-rose-600 text-white text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full uppercase">Sovereign SuperAdmin Controller</span>
                <span className="text-[11px] font-mono font-semibold text-rose-700 bg-rose-100/50 px-1.5 py-0.2 rounded">{tenantId} override</span>
              </div>
              <h2 className="text-base font-bold text-slate-950 mt-1.5">
                Saad/System Admin Override Panel
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5 leading-relaxed">
                Super Admin workspace mode is active. You can modify the active client subscription package tier, pipeline phase metrics, suspend gateway endpoints, or delete the corporate tenant securely.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0 self-start xl:self-center">
              {/* Subscription Change package selector */}
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Subscription Package</span>
                <select 
                  value={company.tier || 'Enterprise'}
                  onChange={(e) => handleAdminUpdatePackage(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-850 px-2.5 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="Pro">Pro (Standard Acts)</option>
                  <option value="Enterprise">Enterprise (Full Acts & DPA)</option>
                  <option value="Infinite">Infinite Tier (Unlimited APIs)</option>
                </select>
              </div>

              {/* Onboarding Phase stage selector */}
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Pipeline Phase</span>
                <select 
                  value={company.phase || 'Production'}
                  onChange={(e) => handleAdminUpdatePhase(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-855 px-2.5 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="Stage 1: Sign up">Stage 1: Sign up</option>
                  <option value="Stage 2: EUDI Checks">Stage 2: EUDI Checks</option>
                  <option value="Stage 3: Integration Run">Stage 3: Integration Run</option>
                  <option value="Production">Active Production</option>
                </select>
              </div>

              {/* Active / Suspended toggle */}
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Tenant Gate Status</span>
                <button
                  type="button"
                  onClick={handleAdminToggleStatus}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-colors border shadow-sm ${
                    company.status === 'ACTIVE'
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {company.status === 'ACTIVE' ? 'Active ✓' : 'Suspended ❌'}
                </button>
              </div>

              {/* Delete / Purge button */}
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Purge Workspace</span>
                {showDeleteConfirm ? (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleDeleteTenant}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-705 font-bold text-xs px-2 py-1.5 rounded-lg border text-slate-700"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                  >
                    Purge Corporate
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left Column: Core Info & Leadership */}
        <div className="xl:col-span-1 space-y-4 sm:space-y-6">
          {/* Identity Card */}
          <div className="bg-white border text-left border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
            <div className="h-24 bg-gradient-to-r from-slate-800 to-indigo-900 relative">
               <div className="absolute -bottom-10 left-6">
                 <div className="w-20 h-20 bg-white rounded-xl shadow-md border-4 border-white flex items-center justify-center">
                   <Building2 className="w-10 h-10 text-indigo-600" />
                 </div>
               </div>
               <div className="absolute top-4 right-4 flex space-x-2">
                 <span className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 text-[10px] uppercase font-bold px-2 py-1 rounded">
                   {company.status}
                 </span>
                 <span className="bg-white/20 text-white border border-white/30 text-[10px] uppercase font-bold px-2 py-1 rounded">
                   PRO VERIFIED
                 </span>
               </div>
            </div>
            
            <div className="pt-14 p-4 sm:p-5 lg:p-6">
              {isEditing ? (
                <div className="space-y-3.5 mb-2">
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Company Display Name</label>
                    <input 
                      type="text" 
                      value={draft.name} 
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Legal Entity Name</label>
                    <input 
                      type="text" 
                      value={draft.legalName} 
                      onChange={(e) => updateField('legalName', e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-600 font-medium"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
                  <p className="text-sm text-slate-500 mb-4">{company.legalName}</p>
                </>
              )}
              
              <div className="space-y-3 mt-6">
                {isEditing ? (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Industry</label>
                      <input 
                        type="text" 
                        value={draft.industry} 
                        onChange={(e) => updateField('industry', e.target.value)}
                        className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Headquarters</label>
                      <input 
                        type="text" 
                        value={draft.headquarters} 
                        onChange={(e) => updateField('headquarters', e.target.value)}
                        className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Website</label>
                      <input 
                        type="text" 
                        value={draft.website} 
                        onChange={(e) => updateField('website', e.target.value)}
                        className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Contact Email</label>
                      <input 
                        type="email" 
                        value={draft.contactEmail} 
                        onChange={(e) => updateField('contactEmail', e.target.value)}
                        className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-400 mb-1">Contact Phone</label>
                      <input 
                        type="text" 
                        value={draft.contactPhone} 
                        onChange={(e) => updateField('contactPhone', e.target.value)}
                        className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start text-sm text-slate-600">
                      <Briefcase className="w-4 h-4 mr-3 mt-0.5 text-slate-400" />
                      <span>{company.industry} • Founded {company.founded}</span>
                    </div>
                    <div className="flex items-start text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-3 mt-0.5 text-slate-400" />
                      <span>{company.headquarters}</span>
                    </div>
                    <div className="flex items-start text-sm text-slate-600">
                      <Globe className="w-4 h-4 mr-3 mt-0.5 text-slate-400" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{company.website}</a>
                    </div>
                    <div className="flex items-start text-sm text-slate-600">
                      <Mail className="w-4 h-4 mr-3 mt-0.5 text-slate-400" />
                      <span>{company.contactEmail}</span>
                    </div>
                    <div className="flex items-start text-sm text-slate-600">
                      <Phone className="w-4 h-4 mr-3 mt-0.5 text-slate-400" />
                      <span>{company.contactPhone}</span>
                    </div>
                  </>
                )}
                <div className="flex items-start text-sm text-slate-600 border-t border-slate-100 pt-3 mt-3">
                  <ShieldCheck className="w-4 h-4 mr-3 mt-0.5 text-emerald-500" />
                  <span>Data Region: <strong className="text-slate-800">{company.region}</strong></span>
                </div>
              </div>

              {viewMode === 'tenant' && onSwitchRole && (
                 <button 
                   onClick={() => onSwitchRole('TENANT_OWNER', company.id)}
                   className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg flex justify-center items-center space-x-2 transition-colors shadow-sm"
                 >
                   <LogIn className="w-4 h-4" />
                   <span>Impersonate Client (No Password)</span>
                 </button>
              )}
            </div>
          </div>

          {/* About & Leadership */}
          <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-500" /> About Organization
            </h3>
            {isEditing ? (
              <div className="mb-4">
                <textarea 
                  value={draft.description} 
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 leading-relaxed text-slate-600"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {company.description}
              </p>
            )}

            <h3 className="text-sm font-bold text-slate-800 mb-4 border-t border-slate-100 pt-5 flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-500" /> Key Leadership
            </h3>
            <div className="space-y-4">
              {company.leadership.map((leader: { name: string; role: string; avatar: string }, i: number) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                    {leader.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{leader.name}</h4>
                    <p className="text-xs text-slate-500">{leader.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white hover:text-white text-xs font-bold rounded-lg flex justify-center items-center space-x-1.5 transition-colors shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metrics & Advanced Analytics */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Health</span>
                <div className="p-1.5 bg-emerald-50 rounded-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-slate-900">{company.complianceMetrics.overallScore}</span>
                <span className="text-sm text-slate-500 mb-1">/ 100</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" /> +2 from last quarter
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Policies</span>
                <div className="p-1.5 bg-indigo-50 rounded-md">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-slate-900">{company.activePolicies}</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-slate-600 font-medium bg-slate-50 w-fit px-2 py-0.5 rounded border border-slate-100">
                <Award className="w-3 h-3 mr-1 text-amber-500" /> {company.policyRate} Enforcement Rate
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Incidents</span>
                <div className="p-1.5 bg-slate-50 rounded-md border border-slate-100">
                  <Lock className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-slate-900">0</span>
              </div>
              <div className="mt-3 flex items-center text-xs text-slate-600 font-medium bg-slate-50 w-fit px-2 py-0.5 rounded border border-slate-100">
                 DPA Status: Clean Record
              </div>
            </div>
          </div>

          {/* Detailed Compliance Radar */}
          <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-800 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-indigo-500" /> Regulatory Alignment Matrix
                </h3>
             </div>
             
             <div className="space-y-5">
               {/* Progress Bar 1 */}
               <div>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="font-semibold text-slate-700">GDPR Readiness</span>
                   <span className="text-emerald-600 font-bold">{company.complianceMetrics.gdprReadiness}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                   <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${company.complianceMetrics.gdprReadiness}%` }}></div>
                 </div>
               </div>
               
               {/* Progress Bar 2 */}
               <div>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="font-semibold text-slate-700">AI Act Compliance</span>
                   <span className="text-amber-600 font-bold">{company.complianceMetrics.aiActCompliance}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                   <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${company.complianceMetrics.aiActCompliance}%` }}></div>
                 </div>
                 {viewMode === 'tenant' && (
                   <p className="text-xs text-amber-700 mt-1.5 flex items-center bg-amber-50 w-fit px-2 py-0.5 rounded">
                     <AlertTriangle className="w-3 h-3 mr-1" /> Pending algorithmic bias update
                   </p>
                 )}
               </div>

               {/* Progress Bar 3 */}
               <div>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="font-semibold text-slate-700">DORA (Digital Operational Resilience)</span>
                   <span className="text-indigo-600 font-bold">{company.complianceMetrics.doraReadiness}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                   <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${company.complianceMetrics.doraReadiness}%` }}></div>
                 </div>
               </div>

               {/* Additional Tags */}
               <div className="pt-4 border-t border-slate-100 flex gap-4 mt-2">
                 <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-center flex-1">
                   <div className="text-xs text-slate-500 mb-1">PSD2 Check</div>
                   <div className="text-sm font-bold text-emerald-600 flex justify-center items-center">
                     <CheckCircle2 className="w-4 h-4 mr-1" /> Satisfied
                   </div>
                 </div>
                 <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-center flex-1">
                   <div className="text-xs text-slate-500 mb-1">ESG Rating</div>
                   <div className="text-sm font-bold text-slate-800 flex justify-center items-center">
                     {company.complianceMetrics.esgRating}
                   </div>
                 </div>
               </div>
             </div>
          </div>

          {/* Audit History */}
          <div className="bg-white border text-left border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="text-sm font-bold text-slate-800 flex items-center">
                 <History className="w-4 h-4 mr-2 text-indigo-500" /> Recent Official Audits
               </h3>
               {viewMode === 'tenant' && (
                 <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                   View Full Ledger
                 </button>
               )}
            </div>
            <div className="divide-y divide-slate-100">
               {company.recentAudits.map((audit: any, i: number) => (
                 <div key={i} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                   <div>
                     <h4 className="text-sm font-semibold text-slate-900">{audit.title}</h4>
                     <p className="text-xs text-slate-500 mt-1">{audit.date}</p>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1 ${audit.status.includes('Notes') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                       {audit.status}
                     </span>
                     <span className="text-xs text-slate-500">{audit.findingCount} Findings</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Biometric Privacy Controls (Right to Erasure Compliance) */}
          <div className="bg-white border text-left border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="biometric-privacy-card">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                    Biometric Privacy Controls
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium font-sans">Compliance matrix for GDPR Art. 17 (Right to Erasure) & eIDAS 2.0</p>
                </div>
              </div>
              <button 
                id="btn-privacy-refresh"
                onClick={fetchBiometricTemplates}
                disabled={loadingBiometrics}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                title="Reload biometric templates list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingBiometrics ? "animate-spin text-indigo-600" : ""}`} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-bold text-indigo-950 font-sans">EU Citizen Right to Erasure (Article 17 GDPR)</h4>
                  <p className="text-[11px] text-indigo-900/80 leading-relaxed font-sans">
                    Under the GDPR and eIDAS v2 framework, citizens maintain physical sovereignty over their biometrics. You can view registered face templates, export keypoint telemetry for data portability (Art. 20), or request permanent, irretrievable erasure from all secure hardware enclaves and trusted registries.
                  </p>
                </div>
              </div>

              {privacyToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in animate-out fade-out" id="privacy-toast-notification">
                  <span className="font-medium font-sans">{privacyToast}</span>
                  <button 
                    id="btn-close-privacy-toast"
                    onClick={() => setPrivacyToast(null)} 
                    className="text-emerald-500 hover:text-emerald-700 font-bold px-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              {loadingBiometrics && biometricTemplates.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  Loading active biometric enclaves...
                </div>
              ) : biometricTemplates.length === 0 ? (
                <div className="py-10 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="mx-auto w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700 font-sans">No Biometric Templates Found</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal font-sans">
                      No facial biometric signatures are currently registered for this profile category on the sovereign node.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans text-left">Active Registered Templates ({biometricTemplates.length})</div>
                  
                  {biometricTemplates.map((template) => {
                    const isConfirming = showConfirmErasureId === template.enrollmentId;
                    const isDeleting = deletingTemplateId === template.enrollmentId;
                    const isInspecting = selectedTemplateForDetails?.enrollmentId === template.enrollmentId;
                    const countryFlag = template.country === "DE" ? "🇩🇪" : template.country === "FR" ? "🇫🇷" : template.country === "IT" ? "🇮🇹" : "🇪🇺";

                    return (
                      <div 
                        key={template.enrollmentId} 
                        className="border border-slate-200 rounded-xl overflow-x-auto hover:border-slate-300 transition-colors bg-white text-left"
                        id={`biometric-template-${template.enrollmentId}`}
                      >
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="text-xl select-none">{countryFlag}</span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 font-sans">{template.username}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">{template.enrollmentId} • {template.documentType}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200/50">
                              {template.securityLevel === "L3_HARDWARE_BOUND" ? "LoA High" : "LoA Substantial"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex flex-wrap gap-2 justify-between items-center text-[10px]">
                            <span className="text-slate-500 font-sans">Registered: {new Date(template.createdAt).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                              <button
                                id={`btn-inspect-${template.enrollmentId}`}
                                onClick={() => setSelectedTemplateForDetails(isInspecting ? null : template)}
                                className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer font-sans border-none"
                              >
                                {isInspecting ? "Hide Details" : "Inspect Vector Details"}
                              </button>
                              <button
                                id={`btn-export-${template.enrollmentId}`}
                                onClick={() => handleExportTemplate(template)}
                                className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-sans border-none"
                                title="Export for Data Portability (Art. 20 GDPR)"
                              >
                                <FileDown className="w-3 h-3" />
                                <span>Export JSON</span>
                              </button>
                              {!isConfirming && (
                                <button
                                  id={`btn-erasure-${template.enrollmentId}`}
                                  onClick={() => setShowConfirmErasureId(template.enrollmentId)}
                                  className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-sans border-none"
                                  title="Request Permanent Deletion (Art. 17 GDPR)"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Erase</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inspect details drawer/drawer */}
                          {isInspecting && (
                            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg text-[10px] font-mono space-y-2 border border-slate-800 overflow-hidden leading-normal">
                              <div className="text-indigo-400 font-bold border-b border-slate-800 pb-1.5 tracking-wider uppercase flex items-center justify-between">
                                <span>Sovereign Enclave Cryptography Specs</span>
                                <span className="text-[8px] bg-indigo-950 px-1.5 py-0.5 rounded text-indigo-300 font-bold">SECURE SHA256</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[9px] pb-1.5 border-b border-slate-800/50">
                                <div><span className="text-slate-400">LANDMARKS MAPPED:</span> <span className="text-white font-bold">{template.facialTemplate?.landmarksCount || 128} Point Mesh</span></div>
                                <div><span className="text-slate-400">JAWLINE SYMMETRY:</span> <span className="text-white font-bold">{(template.facialTemplate?.jawlineSymmetry * 100).toFixed(1)}%</span></div>
                                <div><span className="text-slate-400">INTERPUPILLARY INDEX:</span> <span className="text-white font-bold">{template.facialTemplate?.interpupillaryRatio}</span></div>
                                <div><span className="text-slate-400">EXPRESSION REFLECTION:</span> <span className="text-white font-bold">{template.facialTemplate?.expressionReflection}</span></div>
                              </div>
                              <div className="space-y-1">
                                <span className="text-amber-400 font-bold block">BIOMETRIC HASH VALUE:</span>
                                <span className="text-[8px] text-slate-400 block break-all font-mono bg-slate-950 p-1.5 rounded border border-slate-850">{template.vectorHash}</span>
                              </div>
                              <div className="space-y-1 pt-1">
                                <span className="text-indigo-300 font-bold block">SD-JWT CRYPTOGRAPHIC ATTRIBUTION:</span>
                                <span className="text-[8px] text-slate-400 block break-all font-mono bg-slate-950 p-1.5 rounded border border-slate-850 truncate">{template.sdJwtCredential}</span>
                              </div>
                            </div>
                          )}

                          {/* Confirmation Modal inline */}
                          {isConfirming && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3" id={`confirm-erasure-box-${template.enrollmentId}`}>
                              <div className="flex gap-2.5 items-start">
                                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                <div className="space-y-1 text-left">
                                  <h5 className="text-xs font-bold text-rose-900 font-sans">Confirm Irretrievable Biometric Erasure</h5>
                                  <p className="text-[10px] text-rose-800 leading-normal font-sans">
                                    This complies with GDPR Article 17 ("Right to be Forgotten"). Upon confirmation, the physical face template vector points will be purged from the secure trust database. Any linked EU Digital Identity wallets will lose biometrically authorized access tokens immediately.
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2.5 justify-end pt-1">
                                <button
                                  id={`btn-cancel-erasure-${template.enrollmentId}`}
                                  onClick={() => setShowConfirmErasureId(null)}
                                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold transition-colors cursor-pointer font-sans"
                                  disabled={isDeleting}
                                >
                                  Cancel
                                </button>
                                <button
                                  id={`btn-confirm-erasure-${template.enrollmentId}`}
                                  onClick={() => handleErasureRequest(template.enrollmentId)}
                                  className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm font-sans border-none"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      <span>Purging...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-3 h-3" />
                                      <span>Permanently Erase Template</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
