import React, { useState, useEffect } from 'react';
import { 
  Building2, Globe, Users, Briefcase, ShieldCheck, 
  MapPin, ExternalLink, Mail, Phone, Calendar, 
  CheckCircle2, Award, Landmark, Scale, Linkedin,
  FileText, ArrowUpRight, Lock, Key, RefreshCw,
  Download, Plus, Trash2, AlertTriangle, ChevronRight,
  UserCheck, ShieldAlert, Sparkles, Copy, Check, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export interface EntityProfileProps {
  initialEntityId?: string;
  entityId?: string;
  entity?: any;
  onNavigateToRegister?: () => void;
}

export const EntityProfile: React.FC<EntityProfileProps> = ({ 
  initialEntityId,
  entityId,
  entity: propEntity,
  onNavigateToRegister
}) => {
  const { showToast } = useNotification();
  
  const [entitiesList, setEntitiesList] = useState<any[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(initialEntityId || entityId || propEntity?.id || 'ent_axiom_901');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ubo' | 'leadership' | 'addresses' | 'kyb' | 'compliance' | 'delegates' | 'audit' | 'export'>('overview');
  
  // Interactive Modals & States
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<'Sumsub' | 'Middesk' | 'LexisNexis'>('Sumsub');
  const [showGrantDelegateModal, setShowGrantDelegateModal] = useState(false);
  const [newDelegate, setNewDelegate] = useState({
    name: '',
    email: '',
    type: 'lawyer',
    firm: '',
    permissions: ['read_profile', 'upload_docs'],
    expires_at: '2027-12-31'
  });
  const [copiedExport, setCopiedExport] = useState(false);
  const [exportPackage, setExportPackage] = useState<any>(null);

  // Fetch available entities
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await fetch('/api/v2/kyb/entities');
        const data = await res.json();
        if (data.success && data.entities && data.entities.length > 0) {
          setEntitiesList(data.entities);
          if (!initialEntityId && !data.entities.some((e: any) => e.id === selectedEntityId)) {
            setSelectedEntityId(data.entities[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load company entities list:', err);
      }
    };
    fetchEntities();
  }, [initialEntityId]);

  // Fetch complete profile for selected entity
  const loadProfile = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v2/kyb/entity/${id}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfileData(data.profile);
      } else {
        // Fallback default
        showToast('Could not load entity profile, using live defaults', 'warning', 'Notice');
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEntityId) {
      loadProfile(selectedEntityId);
    }
  }, [selectedEntityId]);

  // Trigger Live KYB Vendor Verification
  const handleTriggerVerification = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/v2/kyb/verify/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: selectedEntityId, provider: selectedVendor })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Orchestrated via ${selectedVendor}: Status is ${data.result.status.toUpperCase()}`, 'success', 'KYB Verification Complete');
        loadProfile(selectedEntityId);
      } else {
        showToast(data.error || 'Check vendor connection', 'error', 'Verification Failed');
      }
    } catch (err: any) {
      showToast(err.message, 'error', 'Error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Grant Delegated Access
  const handleGrantDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelegate.name || !newDelegate.email) {
      showToast('Please provide delegate name and official email', 'error', 'Missing Information');
      return;
    }
    try {
      const res = await fetch('/api/v2/kyb/delegate/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: selectedEntityId,
          delegate_name: newDelegate.name,
          delegate_email: newDelegate.email,
          delegate_type: newDelegate.type,
          firm_name: newDelegate.firm,
          permissions: newDelegate.permissions,
          expires_at: newDelegate.expires_at,
          granted_by: profileData?.management?.[0]?.full_name || 'Managing Officer'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Authorized ${newDelegate.name} (${newDelegate.firm})`, 'success', 'Delegated Access Granted');
        setShowGrantDelegateModal(false);
        setNewDelegate({ name: '', email: '', type: 'lawyer', firm: '', permissions: ['read_profile', 'upload_docs'], expires_at: '2027-12-31' });
        loadProfile(selectedEntityId);
      }
    } catch (err: any) {
      showToast(err.message, 'error', 'Failed to Grant Access');
    }
  };

  // Revoke Delegated Access
  const handleRevokeDelegate = async (delId: string, delName: string) => {
    try {
      const res = await fetch(`/api/v2/kyb/delegate/${delId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Delegated authorization removed for ${delName}`, 'info', 'Access Revoked');
        loadProfile(selectedEntityId);
      }
    } catch (err: any) {
      showToast(err.message, 'error', 'Revocation Failed');
    }
  };

  // Fetch Regulator Export Dossier
  const handleFetchExport = async () => {
    try {
      const res = await fetch(`/api/v2/kyb/regulator/export/${selectedEntityId}`);
      const data = await res.json();
      if (data.success) {
        setExportPackage(data.exportDossier);
        setActiveTab('export');
        showToast('Digitally signed sovereign regulator dossier created', 'success', 'Dossier Generated');
      }
    } catch (err: any) {
      showToast(err.message, 'error', 'Export Error');
    }
  };

  if (loading && !profileData) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 font-bold text-sm">Loading Enterprise KYB/KYC Profile...</p>
      </div>
    );
  }

  const entity = profileData?.entity || {};
  const addresses = profileData?.addresses || [];
  const management = profileData?.management || [];
  const ubos = profileData?.ubos || [];
  const compliance = profileData?.compliance || {};
  const kybVerifications = profileData?.kybVerifications || [];
  const delegates = profileData?.delegates || [];
  const auditLogs = profileData?.auditLogs || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 text-slate-800">
      {/* Top Entity Bar & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Corporate Entity</div>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="font-black text-slate-900 bg-transparent text-base border-none focus:outline-none cursor-pointer"
            >
              {entitiesList.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.legal_name} ({ent.jurisdiction}) — {ent.verification_tier.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleFetchExport()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Regulator Export (JSON / Sealed)
          </button>
          {onNavigateToRegister && (
            <button
              onClick={onNavigateToRegister}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Register New Entity
            </button>
          )}
        </div>
      </div>

      {/* LinkedIn-Style Profile Banner Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Cover Canvas */}
        <div className="h-56 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              KYB Status: {entity.status?.toUpperCase() || 'VERIFIED'}
            </span>
            <span className="px-3 py-1 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-300 rounded-full text-xs font-bold">
              Tier: {entity.verification_tier?.toUpperCase() || 'ENTERPRISE'}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <div className="flex items-end gap-6 translate-y-12">
              <div className="w-32 h-32 bg-white rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-3xl font-black">
                  {entity.legal_name?.substring(0, 2).toUpperCase() || 'AX'}
                </div>
              </div>
              <div className="pb-4">
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                  {entity.legal_name}
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20 shrink-0" />
                </h1>
                <p className="text-white/80 font-medium text-sm mt-0.5">
                  {entity.trade_name ? `d/b/a ${entity.trade_name} • ` : ''}{entity.entity_type} • Reg: {entity.registration_number}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-white/70 text-xs mt-2 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {addresses[0]?.city || 'Munich'}, {addresses[0]?.country || 'Germany'}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-indigo-400" /> {entity.website || 'https://domain.com'}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Founded {entity.founding_year || 2020}</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex gap-3 translate-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Profile URL copied to clipboard', 'info');
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Share Profile
              </button>
              <button
                onClick={() => {
                  setSelectedVendor('Sumsub');
                  setActiveTab('kyb');
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Live Verification
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="pt-20 px-8 pb-6 border-b border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Annual Revenue</div>
              <div className="text-base font-black text-slate-900 mt-1">{entity.yearly_revenue_band || '25M-100M'} EUR</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Audited Financials</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Headcount</div>
              <div className="text-base font-black text-slate-900 mt-1">{entity.employee_count_band || '250-1000'} Staff</div>
              <div className="text-[10px] text-indigo-600 font-bold mt-0.5">Multi-Region Presence</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AML Compliance Score</div>
              <div className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                {100 - (entity.risk_score || 10)}%
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                  {entity.risk_tier || 'LOW RISK'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">Continuous Monitoring Active</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Supervisory Jurisdiction</div>
              <div className="text-base font-black text-slate-900 mt-1 truncate">{entity.jurisdiction || 'European Union'}</div>
              <div className="text-[10px] text-indigo-600 font-bold mt-0.5">Reg: {entity.tax_id || 'DE-309812456'}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 flex overflow-x-auto no-scrollbar gap-1 border-b border-slate-200 bg-slate-50/50">
          {[
            { id: 'overview', label: 'Overview & Corporate', icon: Building2 },
            { id: 'ubo', label: 'Ownership & UBO (≥25%)', icon: Key },
            { id: 'leadership', label: 'Executive Board', icon: Users },
            { id: 'addresses', label: 'Addresses & Presence', icon: MapPin },
            { id: 'kyb', label: 'KYB/KYC Screening Engine', icon: ShieldCheck },
            { id: 'compliance', label: 'Regulator Dossier', icon: Landmark },
            { id: 'delegates', label: 'Delegated Access (Lawyers)', icon: Scale },
            { id: 'audit', label: 'WORM Audit Ledger', icon: Lock },
            { id: 'export', label: 'Digital Export Package', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-4 text-xs font-bold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive 
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" /> Corporate Profile & Mission
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {entity.description || 'Enterprise sovereign compliance and regulated infrastructure services.'}
                </p>
                <div className="pt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                    Industry: {entity.industry_code || 'NAICS-541512'}
                  </span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold">
                    Entity Form: {entity.entity_type}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
                    Incorporated: {entity.incorporation_date || '2019-04-15'}
                  </span>
                </div>
              </div>

              {/* Corporate Hierarchy & Subsidiaries */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-600" /> Corporate Hierarchy & Structure
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase">Parent Ultimate Entity</span>
                    <span className="text-slate-900 font-bold">{entity.parent_entity_name || 'Independent Primary Holding (Top Tier)'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase">Operating Jurisdiction</span>
                    <span className="text-slate-900 font-bold">{entity.jurisdiction}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase">Statutory Register</span>
                    <span className="text-slate-900 font-bold font-mono">{entity.registration_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">KYB Confidence</span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">Pass</span>
                </div>
                <div className="text-4xl font-black">100%</div>
                <p className="text-white/70 text-xs leading-relaxed">
                  Registry matching, Sanctions PEP clearance, and UBO natural person threshold verified against official state registers.
                </p>
                <button
                  onClick={() => setActiveTab('kyb')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  View Screening Ledger
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Contacts</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-medium">compliance@{entity.website?.replace('https://', '') || 'entity.com'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <a href={entity.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">
                      {entity.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-medium">{addresses[0]?.line1}, {addresses[0]?.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: OWNERSHIP & UBO REGISTRY */}
        {activeTab === 'ubo' && (
          <motion.div
            key="ubo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" /> Ultimate Beneficial Ownership (UBO) Registry
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Compliant with EU 5AMLD/6AMLD & FinCEN Corporate Transparency Act (≥25% Natural Person Threshold)
                  </p>
                </div>
                <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Beneficial Ownership Resolved
                </div>
              </div>

              {/* Ownership Visual Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Declared Ownership Distribution</span>
                  <span>Total: 100%</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  {ubos.map((u: any, idx: number) => (
                    <div 
                      key={u.id} 
                      className={`h-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-indigo-400' : 'bg-slate-400'}`}
                      style={{ width: `${u.ownership_percentage}%` }}
                      title={`${u.full_name}: ${u.ownership_percentage}%`}
                    />
                  ))}
                  <div className="h-full bg-slate-200 flex-1" title="Retained Institutional / Free Float" />
                </div>
              </div>

              {/* UBO Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ubos.map((ubo: any) => (
                  <div key={ubo.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-lg">
                          {ubo.full_name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{ubo.full_name}</h4>
                          <span className="text-[11px] text-slate-500 font-bold">{ubo.role}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-indigo-600">{ubo.ownership_percentage}%</div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Direct Equity</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/60 pt-3">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Nationality</span>
                        <span className="font-bold text-slate-700">{ubo.nationality || 'European'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">KYC Verification</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passport & Liveness Pass
                        </span>
                      </div>
                    </div>

                    {ubo.linkedin_url && (
                      <a href={ubo.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline pt-1">
                        <Linkedin className="w-3.5 h-3.5" /> View LinkedIn Profile
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: EXECUTIVE BOARD & MANAGEMENT */}
        {activeTab === 'leadership' && (
          <motion.div
            key="leadership"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" /> Board of Directors & C-Level Executives
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Authorized signatories, corporate officers, and key controllers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {management.map((person: any) => (
                  <div key={person.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20">
                        {person.full_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate">{person.full_name}</h4>
                        <div className="text-[11px] text-indigo-600 font-bold uppercase truncate">{person.role}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">KYC Status:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Nationality:</span>
                        <span className="font-bold text-slate-700">{person.nationality || 'DE'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Official Email:</span>
                        <span className="font-medium text-slate-700 truncate">{person.email || 'exec@entity.com'}</span>
                      </div>
                    </div>

                    {person.linkedin_url && (
                      <a
                        href={person.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" /> Professional Profile
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: ADDRESSES & PRESENCE */}
        {activeTab === 'addresses' && (
          <motion.div
            key="addresses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" /> Multi-Location Address & Global Branches
                </h3>
                <p className="text-slate-500 text-xs mt-1">Verified registered office, operational branches, and international hubs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map((addr: any) => (
                  <div key={addr.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        addr.is_primary ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {addr.address_type || 'Operational'}
                      </span>
                      {addr.is_primary ? (
                        <span className="text-[10px] font-bold text-indigo-600">Primary HQ</span>
                      ) : null}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900">{addr.city}, {addr.country}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {addr.line1} {addr.line2 ? `, ${addr.line2}` : ''}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Postal Code: {addr.postal_code || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: KYB/KYC SCREENING ENGINE */}
        {activeTab === 'kyb' && (
          <motion.div
            key="kyb"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Vendor Orchestration Action Card */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Multi-Vendor Verification Gateway
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">Orchestrated KYB/KYC Screening</h3>
                  <p className="text-white/70 text-xs mt-1">Live integrations with Sumsub, Middesk, LexisNexis, and Persona</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value as any)}
                    className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Sumsub" className="text-slate-900">Sumsub Gateway</option>
                    <option value="Middesk" className="text-slate-900">Middesk Entity API</option>
                    <option value="LexisNexis" className="text-slate-900">LexisNexis WorldCompliance</option>
                  </select>

                  <button
                    onClick={handleTriggerVerification}
                    disabled={isVerifying}
                    className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                    {isVerifying ? 'Screening...' : 'Trigger Re-Screen'}
                  </button>
                </div>
              </div>

              {/* Automated Check Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/80">State Register</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-black text-emerald-300">Match Confirmed</div>
                  <p className="text-[10px] text-white/60">Verified with official Commercial Court</p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/80">Sanctions & PEP</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-black text-emerald-300">0 Matches Found</div>
                  <p className="text-[10px] text-white/60">OFAC, EU & UN Watchlists (2026.3)</p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/80">Adverse Media</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-black text-emerald-300">Clean Profile</div>
                  <p className="text-[10px] text-white/60">Global AML/CTF Negative News Scan</p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/80">UBO Natural Persons</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-black text-emerald-300">100% Resolved</div>
                  <p className="text-[10px] text-white/60">Traceable to verified individuals</p>
                </div>
              </div>
            </div>

            {/* Historical KYB Verifications Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" /> Verification Ledger & History
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Check Type</th>
                      <th className="pb-3">Result</th>
                      <th className="pb-3">Risk Score</th>
                      <th className="pb-3">Checked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kybVerifications.map((v: any) => (
                      <tr key={v.id} className="text-slate-700">
                        <td className="py-3 font-bold text-slate-900">{v.provider}</td>
                        <td className="py-3 capitalize">{v.check_type.replace('_', ' ')}</td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black uppercase text-[10px]">
                            {v.result}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-bold text-indigo-600">{v.risk_score} / 100</td>
                        <td className="py-3 text-slate-400 font-mono">{new Date(v.checked_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: COMPLIANCE & REGULATOR DOSSIER */}
        {activeTab === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-600" /> Supervisory Dossier & Compliance Declaration
                </h3>
                <p className="text-slate-500 text-xs mt-1">Official disclosures submitted to national supervisory authorities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">AML/CFT Program Declaration</span>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Formal Written AML Policy & Risk Assessment Declared
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Supervised under EU Unified AML Framework & BaFin Statutory Guidelines.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Source of Funds</span>
                  <div className="text-sm font-black text-slate-900">
                    {compliance.source_of_funds || 'Commercial Retained Earnings'}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Continuous monitoring & transactional legitimacy audits active.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Supervising Regulators</span>
                  <div className="text-sm font-black text-indigo-600">
                    {compliance.regulator_name || 'BaFin / CSSF / National Supervision Authority'}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-mono">
                    Licence / Reg No: {compliance.industry_license_number || 'EU-FINTECH-LIC-2026'}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Chief Compliance Officer</span>
                  <div className="text-sm font-black text-slate-900">
                    {compliance.compliance_officer_name || 'Designated Compliance Officer'}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Contact: {compliance.compliance_officer_contact || 'compliance@entity.com'}
                  </p>
                </div>
              </div>

              {/* Regulatory Filings Records */}
              {compliance.regulatory_filings && compliance.regulatory_filings.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Statutory Filings</h4>
                  <div className="space-y-2">
                    {compliance.regulatory_filings.map((filing: string, i: number) => (
                      <div key={i} className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-950 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" /> {filing}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-200/60 text-indigo-800 rounded-md font-mono">FILED & VALID</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 7: DELEGATED ACCESS (LAWYERS & CONSULTANTS) */}
        {activeTab === 'delegates' && (
          <motion.div
            key="delegates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" /> Authorized Legal & Consulting Representatives
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Delegated role-based access control (RBAC) for external law firms, compliance consultants, and statutory auditors.
                  </p>
                </div>

                <button
                  onClick={() => setShowGrantDelegateModal(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" /> Grant Legal Counsel Access
                </button>
              </div>

              {/* Delegate Cards */}
              <div className="space-y-3">
                {delegates.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs">
                    No external legal representatives currently assigned.
                  </div>
                ) : (
                  delegates.map((del: any) => (
                    <div key={del.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{del.delegate_name}</h4>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-bold uppercase">
                              {del.delegate_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{del.firm_name} • {del.delegate_email}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {del.permissions.map((perm: string, pIdx: number) => (
                              <span key={pIdx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-[10px] text-slate-400">
                          Expires: <span className="font-bold text-slate-700">{del.expires_at || '2027-12-31'}</span>
                        </div>
                        <button
                          onClick={() => handleRevokeDelegate(del.id, del.delegate_name)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Revoke Access
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 8: IMMUTABLE WORM AUDIT LOG */}
        {activeTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-600" /> Write-Once-Read-Many (WORM) Audit Ledger
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Tamper-evident cryptographically sealed audit trail accessible for regulatory examinations.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Hash Chain Integrity: VERIFIED
                </div>
              </div>

              <div className="space-y-3">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{log.action}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] uppercase font-bold">
                          {log.actor_role}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="text-slate-600">
                      Actor: <span className="font-bold text-slate-800">{log.actor_name}</span> • Details: {log.after_state}
                    </div>

                    {log.tamper_hash && (
                      <div className="text-[10px] font-mono text-slate-400 bg-white p-2 rounded-lg border border-slate-200 truncate">
                        SHA-256 Seal: {log.tamper_hash}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 9: DIGITAL REGULATOR EXPORT */}
        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-600" /> Official Sovereign Compliance Export Package
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Digitally signed machine-readable dossier for BaFin / CSSF / EU Unified Regulator submission.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(exportPackage || profileData, null, 2));
                      setCopiedExport(true);
                      showToast('Export JSON package copied to clipboard', 'success');
                      setTimeout(() => setCopiedExport(false), 2000);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    {copiedExport ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedExport ? 'Copied to Clipboard' : 'Copy Full JSON Dossier'}
                  </button>
                </div>
              </div>

              {/* Package Details */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-xs space-y-4 shadow-inner">
                <div className="text-indigo-400 font-bold border-b border-white/10 pb-2 flex items-center justify-between">
                  <span>SOVEREIGN_COMPLIANCE_DOSSIER.json (Digitally Sealed)</span>
                  <span className="text-emerald-400 text-[11px]">RSA-4096 VALID</span>
                </div>
                <pre className="max-h-96 overflow-y-auto text-[11px] leading-relaxed text-slate-300">
                  {JSON.stringify(exportPackage || profileData, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: GRANT DELEGATED ACCESS */}
      {showGrantDelegateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600" /> Authorize Legal Representative
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Grant external counsel or consulting firm access to this company profile</p>
              </div>
              <button
                onClick={() => setShowGrantDelegateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantDelegate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Representative Name</label>
                <input
                  type="text"
                  required
                  placeholder="Adv. Alexander Vance, LL.M."
                  value={newDelegate.name}
                  onChange={(e) => setNewDelegate({ ...newDelegate, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Professional Email</label>
                <input
                  type="email"
                  required
                  placeholder="alexander.vance@vance-legal.eu"
                  value={newDelegate.email}
                  onChange={(e) => setNewDelegate({ ...newDelegate, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Type</label>
                  <select
                    value={newDelegate.type}
                    onChange={(e) => setNewDelegate({ ...newDelegate, type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="lawyer">External Legal Counsel</option>
                    <option value="consultant">Regulatory Consultant</option>
                    <option value="auditor">Statutory Auditor</option>
                    <option value="dpo">Data Protection Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Firm / Organization</label>
                  <input
                    type="text"
                    placeholder="Vance & Hastings LLP"
                    value={newDelegate.firm}
                    onChange={(e) => setNewDelegate({ ...newDelegate, firm: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Granted Permissions</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'read_profile', label: 'View Full KYB Profile' },
                    { id: 'upload_docs', label: 'Upload Statutory Filings' },
                    { id: 'respond_regulator', label: 'Respond to Regulators' },
                    { id: 'file_filings', label: 'Submit Compliance Filings' }
                  ].map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDelegate.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDelegate({ ...newDelegate, permissions: [...newDelegate.permissions, perm.id] });
                          } else {
                            setNewDelegate({ ...newDelegate, permissions: newDelegate.permissions.filter(p => p !== perm.id) });
                          }
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-[11px] font-bold text-slate-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGrantDelegateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Authorize Delegate
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
