import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Building2,
  Users,
  History,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Download,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  Lock,
  Key,
  FileText,
  FileCheck2,
  Layers,
  BarChart3,
  Cpu,
  X,
  Copy,
  Check,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithRetry } from '../../lib/api-client';
import { useNotification } from '../../context/NotificationContext';

export interface AgencyStakeholder {
  id: string;
  agency_code: string;
  agency_name: string;
  acronym: string;
  jurisdiction_country: string;
  regulatory_domain: 'DATA_PRIVACY' | 'CYBER_DORA_NIS2' | 'AI_ALGORITHMIC' | 'TAX_CTC' | 'FINANCIAL_PRUDENTIAL';
  lead_supervisory_role: string;
  relationship_posture: 'COLLABORATIVE_PARTNER' | 'MUTUAL_COOPERATION' | 'ROUTINE_AUDIT' | 'ELEVATED_SCRUTINY' | 'ACTIVE_INQUIRY';
  compliance_rating: number;
  active_inquiries_count: number;
  average_response_sla_hours: number;
  official_portal_url?: string;
  secure_relay_endpoint?: string;
  pgp_key_fingerprint?: string;
  cert_pinning_hash?: string;
  headquarters_address?: string;
  bilateral_treaty_ref?: string;
  notes?: string;
  contacts_count?: number;
  engagements_count?: number;
  open_engagements_count?: number;
  last_engaged_at?: string;
  primary_contact_name?: string;
  primary_contact_title?: string;
  primary_contact_email?: string;
}

export interface RegulatoryContact {
  id: string;
  agency_id: string;
  full_name: string;
  official_title: string;
  department: string;
  email_address: string;
  phone_number?: string;
  clearance_level: 'STANDARD_OFFICIAL' | 'EU_CONFIDENTIAL' | 'EU_SECRET' | 'TOP_SECRET_GOV';
  communication_channel_preferred: 'SECURE_GOV_RELAY' | 'PGP_ENCRYPTED_EMAIL' | 'DIPLOMATIC_COURIER' | 'OFFICIAL_PORTAL';
  is_primary_liaison: number;
  last_engaged_at?: string;
  agency_name?: string;
  acronym?: string;
  jurisdiction_country?: string;
}

export interface AgencyEngagement {
  id: string;
  agency_id: string;
  contact_id?: string;
  engagement_type: 'STATUTORY_INQUIRY' | 'FILING_SUBMISSION' | 'SUPERVISORY_AUDIT' | 'INCIDENT_NOTIFICATION' | 'POLICY_CONSULTATION';
  subject_title: string;
  case_or_reference_number: string;
  communication_status: 'DRAFTING' | 'TRANSMITTED_SEALED' | 'IN_PROGRESS' | 'PENDING_REGULATOR_RESPONSE' | 'CLOSED_COMPLIANT' | 'ESCALATED';
  direction: 'INBOUND' | 'OUTBOUND' | 'BILATERAL';
  summary_notes: string;
  statutory_deadline?: string;
  cryptographic_receipt_hmac?: string;
  transmission_date: string;
  resolution_date?: string;
  action_items_json?: string;
  agency_name?: string;
  acronym?: string;
  jurisdiction_country?: string;
  contact_name?: string;
  contact_title?: string;
  contact_email?: string;
}

export interface MatrixMetrics {
  totalAgencies: number;
  totalContacts: number;
  totalEngagements: number;
  activeInquiries: number;
  slaComplianceRate: number;
  avgSlaHours: number;
  postureStats: { relationship_posture: string; count: number }[];
  domainStats: { regulatory_domain: string; count: number }[];
  jurisdictionStats: { jurisdiction_country: string; count: number }[];
}

export const AgencyStakeholderMatrix: React.FC = () => {
  const { showToast } = useNotification();

  // Primary Data State
  const [agencies, setAgencies] = useState<AgencyStakeholder[]>([]);
  const [metrics, setMetrics] = useState<MatrixMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [postureFilter, setPostureFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE' | 'ENGAGEMENTS'>('CARDS');

  // Selected Detail Modal / Drawer
  const [selectedAgency, setSelectedAgency] = useState<AgencyStakeholder | null>(null);
  const [agencyContacts, setAgencyContacts] = useState<RegulatoryContact[]>([]);
  const [agencyEngagements, setAgencyEngagements] = useState<AgencyEngagement[]>([]);
  const [loadingAgencyDetail, setLoadingAgencyDetail] = useState<boolean>(false);

  // AI Copilot Modals
  const [isAiDispatchModalOpen, setIsAiDispatchModalOpen] = useState<boolean>(false);
  const [aiDispatchTargetAgency, setAiDispatchTargetAgency] = useState<AgencyStakeholder | null>(null);
  const [aiDispatchPurpose, setAiDispatchPurpose] = useState<string>('');
  const [aiDispatchTone, setAiDispatchTone] = useState<string>('Formal Diplomatic & Technically Precise');
  const [aiDispatchContext, setAiDispatchContext] = useState<string>('');
  const [aiDispatchResult, setAiDispatchResult] = useState<any>(null);
  const [isGeneratingAiDispatch, setIsGeneratingAiDispatch] = useState<boolean>(false);

  // AI Posture Strategy Modal
  const [isAiStrategyModalOpen, setIsAiStrategyModalOpen] = useState<boolean>(false);
  const [aiStrategyAgency, setAiStrategyAgency] = useState<AgencyStakeholder | null>(null);
  const [aiStrategyResult, setAiStrategyResult] = useState<any>(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState<boolean>(false);

  // Add Contact Modal
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState<boolean>(false);
  const [newContactAgencyId, setNewContactAgencyId] = useState<string>('');
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactTitle, setNewContactTitle] = useState<string>('');
  const [newContactDept, setNewContactDept] = useState<string>('');
  const [newContactEmail, setNewContactEmail] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactClearance, setNewContactClearance] = useState<string>('STANDARD_OFFICIAL');
  const [newContactChannel, setNewContactChannel] = useState<string>('SECURE_GOV_RELAY');
  const [newContactIsPrimary, setNewContactIsPrimary] = useState<boolean>(false);

  // Record Engagement Modal
  const [isRecordEngagementOpen, setIsRecordEngagementOpen] = useState<boolean>(false);
  const [newEngAgencyId, setNewEngAgencyId] = useState<string>('');
  const [newEngType, setNewEngType] = useState<string>('STATUTORY_INQUIRY');
  const [newEngSubject, setNewEngSubject] = useState<string>('');
  const [newEngRef, setNewEngRef] = useState<string>('');
  const [newEngStatus, setNewEngStatus] = useState<string>('IN_PROGRESS');
  const [newEngDirection, setNewEngDirection] = useState<string>('OUTBOUND');
  const [newEngSummary, setNewEngSummary] = useState<string>('');
  const [newEngDeadline, setNewEngDeadline] = useState<string>('');
  const [newEngContactId, setNewEngContactId] = useState<string>('');

  // Register New Agency Modal
  const [isRegisterAgencyOpen, setIsRegisterAgencyOpen] = useState<boolean>(false);
  const [newAgencyCode, setNewAgencyCode] = useState<string>('');
  const [newAgencyName, setNewAgencyName] = useState<string>('');
  const [newAgencyAcronym, setNewAgencyAcronym] = useState<string>('');
  const [newAgencyCountry, setNewAgencyCountry] = useState<string>('EU');
  const [newAgencyDomain, setNewAgencyDomain] = useState<string>('DATA_PRIVACY');
  const [newAgencyRole, setNewAgencyRole] = useState<string>('Competent Supervisory Authority');
  const [newAgencyPosture, setNewAgencyPosture] = useState<string>('COLLABORATIVE_PARTNER');
  const [newAgencyRating, setNewAgencyRating] = useState<number>(95);
  const [newAgencySla, setNewAgencySla] = useState<number>(48.0);
  const [newAgencyPortal, setNewAgencyPortal] = useState<string>('');
  const [newAgencyRelay, setNewAgencyRelay] = useState<string>('');

  // Copied Hash Feedback
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    showToast(`Copied ${label} to clipboard`, 'success');
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Load Matrix Data
  const loadMatrixData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (jurisdictionFilter !== 'ALL') queryParams.append('jurisdiction', jurisdictionFilter);
      if (domainFilter !== 'ALL') queryParams.append('domain', domainFilter);
      if (postureFilter !== 'ALL') queryParams.append('posture', postureFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const res = await fetchWithRetry(`/api/v1/b2g/stakeholders/matrix?${queryParams.toString()}`);
      const data = await res.json();
      if (data && data.success) {
        setAgencies(data.agencies || []);
        setMetrics(data.metrics || null);
      }
    } catch (err: any) {
      console.error('[STAKEHOLDER_MATRIX_LOAD_ERROR]', err);
      showToast('Failed to load agency stakeholder matrix', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatrixData();
  }, [jurisdictionFilter, domainFilter, postureFilter]);

  // Load Specific Agency Detail
  const handleOpenAgencyDetail = async (agency: AgencyStakeholder) => {
    setSelectedAgency(agency);
    setLoadingAgencyDetail(true);
    try {
      const res = await fetchWithRetry(`/api/v1/b2g/stakeholders/agencies/${agency.id}`);
      const data = await res.json();
      if (data && data.success) {
        setAgencyContacts(data.contacts || []);
        setAgencyEngagements(data.engagements || []);
      }
    } catch (err) {
      console.error('[AGENCY_DETAIL_LOAD_ERROR]', err);
    } finally {
      setLoadingAgencyDetail(false);
    }
  };

  // Trigger AI Dispatch Copilot
  const handleOpenAiDispatch = (agency: AgencyStakeholder) => {
    setAiDispatchTargetAgency(agency);
    setAiDispatchPurpose(`Compliance Attestation & Supervisory Disclosure [${agency.regulatory_domain}]`);
    setAiDispatchContext(`Quarterly comprehensive cryptographic audit ledger and sovereign enclave validation for ${agency.acronym}.`);
    setAiDispatchResult(null);
    setIsAiDispatchModalOpen(true);
  };

  const handleGenerateAiDispatch = async () => {
    if (!aiDispatchTargetAgency) return;
    try {
      setIsGeneratingAiDispatch(true);
      const payload = {
        agency_id: aiDispatchTargetAgency.id,
        dispatch_purpose: aiDispatchPurpose,
        tone: aiDispatchTone,
        custom_context: aiDispatchContext,
        entity_name: '9Xen Regulettee Sovereign Infrastructure & Compliance Network'
      };

      const res = await fetchWithRetry('/api/v1/b2g/stakeholders/ai-assistant/draft-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data && data.success) {
        setAiDispatchResult(data);
        showToast('AI Diplomatic Statutory Dispatch generated successfully', 'success');
      }
    } catch (err: any) {
      console.error('[AI_DISPATCH_GEN_ERROR]', err);
      showToast('Failed to generate AI dispatch', 'error');
    } finally {
      setIsGeneratingAiDispatch(false);
    }
  };

  // Trigger AI Posture Strategy
  const handleOpenAiStrategy = async (agency: AgencyStakeholder) => {
    setAiStrategyAgency(agency);
    setIsAiStrategyModalOpen(true);
    setIsLoadingStrategy(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/stakeholders/ai-assistant/analyze-posture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agency_id: agency.id })
      });
      const data = await res.json();
      if (data && data.success) {
        setAiStrategyResult(data);
      }
    } catch (err) {
      console.error('[AI_STRATEGY_ERROR]', err);
      showToast('Failed to analyze posture strategy', 'error');
    } finally {
      setIsLoadingStrategy(false);
    }
  };

  // Save New Regulatory Contact
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactAgencyId || !newContactName || !newContactTitle || !newContactEmail) {
      showToast('Please fill in all mandatory contact fields', 'error');
      return;
    }
    try {
      const res = await fetchWithRetry('/api/v1/b2g/stakeholders/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_id: newContactAgencyId,
          full_name: newContactName,
          official_title: newContactTitle,
          department: newContactDept,
          email_address: newContactEmail,
          phone_number: newContactPhone,
          clearance_level: newContactClearance,
          communication_channel_preferred: newContactChannel,
          is_primary_liaison: newContactIsPrimary
        })
      });
      const data = await res.json();

      if (data && data.success) {
        showToast('Regulatory Liaison Contact registered successfully', 'success');
        setIsAddContactModalOpen(false);
        // Reset
        setNewContactName('');
        setNewContactTitle('');
        setNewContactDept('');
        setNewContactEmail('');
        setNewContactPhone('');
        loadMatrixData();
        if (selectedAgency && selectedAgency.id === newContactAgencyId) {
          handleOpenAgencyDetail(selectedAgency);
        }
      }
    } catch (err: any) {
      showToast('Failed to create contact', 'error');
    }
  };

  // Save New Engagement Touchpoint
  const handleSaveEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEngAgencyId || !newEngSubject || !newEngType) {
      showToast('Please fill in required engagement fields', 'error');
      return;
    }
    try {
      const res = await fetchWithRetry('/api/v1/b2g/stakeholders/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_id: newEngAgencyId,
          contact_id: newEngContactId || null,
          engagement_type: newEngType,
          subject_title: newEngSubject,
          case_or_reference_number: newEngRef,
          communication_status: newEngStatus,
          direction: newEngDirection,
          summary_notes: newEngSummary,
          statutory_deadline: newEngDeadline || null,
          action_items: [
            { item: 'Statutory compliance verification filed in ledger', status: 'COMPLETED' },
            { item: 'Awaiting formal regulator acknowledgement receipt', status: 'IN_PROGRESS' }
          ]
        })
      });
      const data = await res.json();

      if (data && data.success) {
        showToast(`Engagement touchpoint sealed [${data.case_or_reference_number}]`, 'success');
        setIsRecordEngagementOpen(false);
        setNewEngSubject('');
        setNewEngRef('');
        setNewEngSummary('');
        setNewEngDeadline('');
        loadMatrixData();
        if (selectedAgency && selectedAgency.id === newEngAgencyId) {
          handleOpenAgencyDetail(selectedAgency);
        }
      }
    } catch (err: any) {
      showToast('Failed to record engagement touchpoint', 'error');
    }
  };

  // Register New Agency
  const handleRegisterAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyCode || !newAgencyName || !newAgencyAcronym) {
      showToast('Please specify Agency Code, Name, and Acronym', 'error');
      return;
    }
    try {
      const res = await fetchWithRetry('/api/v1/b2g/stakeholders/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_code: newAgencyCode,
          agency_name: newAgencyName,
          acronym: newAgencyAcronym,
          jurisdiction_country: newAgencyCountry,
          regulatory_domain: newAgencyDomain,
          lead_supervisory_role: newAgencyRole,
          relationship_posture: newAgencyPosture,
          compliance_rating: Number(newAgencyRating),
          average_response_sla_hours: Number(newAgencySla),
          official_portal_url: newAgencyPortal,
          secure_relay_endpoint: newAgencyRelay
        })
      });
      const data = await res.json();

      if (data && data.success) {
        showToast(`Regulatory body ${newAgencyAcronym} added to matrix`, 'success');
        setIsRegisterAgencyOpen(false);
        setNewAgencyCode('');
        setNewAgencyName('');
        setNewAgencyAcronym('');
        setNewAgencyPortal('');
        setNewAgencyRelay('');
        loadMatrixData();
      }
    } catch (err: any) {
      showToast('Failed to register regulatory body', 'error');
    }
  };

  // Export Comprehensive Briefing Dossier
  const handleExportDossier = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/b2g/stakeholders/export/dossier');
      const data = await res.json();
      if (data && data.success) {
        const blob = new Blob([JSON.stringify(data.dossier, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `B2G-Agency-Stakeholder-Matrix-Dossier-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Stakeholder matrix dossier exported successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to export dossier', 'error');
    }
  };

  // Helper Badge Renderers
  const getPostureBadge = (posture: string) => {
    switch (posture) {
      case 'COLLABORATIVE_PARTNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Collaborative Partner
          </span>
        );
      case 'MUTUAL_COOPERATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Globe className="w-3 h-3 text-blue-500" /> Mutual Cooperation
          </span>
        );
      case 'ROUTINE_AUDIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-500" /> Routine Audit
          </span>
        );
      case 'ELEVATED_SCRUTINY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="w-3 h-3 text-orange-500" /> Elevated Scrutiny
          </span>
        );
      case 'ACTIVE_INQUIRY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <ShieldAlert className="w-3 h-3 text-rose-500" /> Active Inquiry
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{posture}</span>;
    }
  };

  const getDomainLabel = (domain: string) => {
    switch (domain) {
      case 'DATA_PRIVACY':
        return { label: 'Data Privacy & GDPR', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' };
      case 'CYBER_DORA_NIS2':
        return { label: 'Cyber / DORA & NIS2', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800' };
      case 'AI_ALGORITHMIC':
        return { label: 'AI Act & Algorithms', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' };
      case 'TAX_CTC':
        return { label: 'Tax & Continuous Clearance', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' };
      case 'FINANCIAL_PRUDENTIAL':
        return { label: 'Prudential Financial Risk', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' };
      default:
        return { label: domain, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLOSED_COMPLIANT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Closed Compliant</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">In Progress</span>;
      case 'PENDING_REGULATOR_RESPONSE':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Pending Response</span>;
      case 'TRANSMITTED_SEALED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Sealed & Transmitted</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  // Filtered Agencies for View
  const filteredAgencies = useMemo(() => {
    return agencies.filter(a => {
      const matchSearch =
        a.agency_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.agency_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.lead_supervisory_role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [agencies, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Metric Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Agency Stakeholder Matrix
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Supervisory Relations
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal max-w-2xl">
                Real-time tracking of Business-to-Government (B2G) supervisory bodies, key regulatory contacts, engagement histories, and AI-assisted diplomatic filings.
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setRefreshing(true);
                loadMatrixData();
              }}
              disabled={refreshing}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
              title="Refresh Matrix"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            <button
              onClick={handleExportDossier}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Dossier
            </button>

            <button
              onClick={() => {
                setNewEngAgencyId(agencies[0]?.id || '');
                setIsRecordEngagementOpen(true);
              }}
              className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-all border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              Record Engagement
            </button>

            <button
              onClick={() => setIsRegisterAgencyOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Authority
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Supervisory Bodies</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">{metrics.totalAgencies}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Verified Liaisons</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">{metrics.totalContacts}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Touchpoints Sealed</span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">{metrics.totalEngagements}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Active Inquiries</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{metrics.activeInquiries}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">SLA Adherence</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{metrics.slaComplianceRate}%</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Avg Response SLA</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{metrics.avgSlaHours}h</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by agency, country, acronym, or mandate..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={jurisdictionFilter}
            onChange={(e) => setJurisdictionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Jurisdictions</option>
            <option value="EU">EU (Pan-European)</option>
            <option value="FR">France (FR)</option>
            <option value="DE">Germany (DE)</option>
            <option value="UK">United Kingdom (UK)</option>
            <option value="SA">Saudi Arabia (SA)</option>
            <option value="IT">Italy (IT)</option>
            <option value="CH">Switzerland (CH)</option>
          </select>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Domains</option>
            <option value="DATA_PRIVACY">Data Privacy / GDPR</option>
            <option value="CYBER_DORA_NIS2">Cyber / NIS2 / DORA</option>
            <option value="AI_ALGORITHMIC">AI Act & GPAI</option>
            <option value="TAX_CTC">Tax & CTC Clearance</option>
            <option value="FINANCIAL_PRUDENTIAL">Prudential Financial</option>
          </select>

          <select
            value={postureFilter}
            onChange={(e) => setPostureFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Postures</option>
            <option value="COLLABORATIVE_PARTNER">Collaborative Partner</option>
            <option value="MUTUAL_COOPERATION">Mutual Cooperation</option>
            <option value="ROUTINE_AUDIT">Routine Audit</option>
            <option value="ELEVATED_SCRUTINY">Elevated Scrutiny</option>
            <option value="ACTIVE_INQUIRY">Active Inquiry</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'CARDS'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Matrix Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Agency List / Cards View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredAgencies.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Regulatory Bodies Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or register a new supervisory authority in the matrix.
          </p>
        </div>
      ) : viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredAgencies.map((agency) => {
            const domainInfo = getDomainLabel(agency.regulatory_domain);
            return (
              <motion.div
                key={agency.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line with country flag & posture */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                        {agency.jurisdiction_country}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${domainInfo.color}`}>
                        {domainInfo.label}
                      </span>
                    </div>
                    {getPostureBadge(agency.relationship_posture)}
                  </div>

                  {/* Agency Title & Acronym */}
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {agency.agency_name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {agency.lead_supervisory_role}
                    </p>
                  </div>

                  {/* Primary Liaison Officer */}
                  <div className="p-3 my-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                      <span>Designated Liaison</span>
                      <Users className="w-3 h-3" />
                    </div>
                    {agency.primary_contact_name ? (
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{agency.primary_contact_name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{agency.primary_contact_title}</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No primary liaison assigned</p>
                    )}
                  </div>

                  {/* Mini Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Compliance</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{agency.compliance_rating}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Inquiries</span>
                      <span className={`font-bold ${agency.active_inquiries_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {agency.active_inquiries_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Avg SLA</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{agency.average_response_sla_hours}h</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenAiDispatch(agency)}
                    className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    AI Dispatch
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenAiStrategy(agency)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                      title="AI Posture Analysis"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenAgencyDetail(agency)}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      Inspect Dossier <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Matrix Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Authority / Code</th>
                  <th className="py-3.5 px-4">Jurisdiction & Domain</th>
                  <th className="py-3.5 px-4">Supervisory Posture</th>
                  <th className="py-3.5 px-4">Designated Liaison</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4 text-center">Open Touchpoints</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredAgencies.map((agency) => {
                  const domainInfo = getDomainLabel(agency.regulatory_domain);
                  return (
                    <tr key={agency.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{agency.agency_name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{agency.agency_code} ({agency.acronym})</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{agency.jurisdiction_country}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${domainInfo.color}`}>
                            {domainInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getPostureBadge(agency.relationship_posture)}
                      </td>
                      <td className="py-3.5 px-4">
                        {agency.primary_contact_name ? (
                          <div>
                            <span className="font-semibold block">{agency.primary_contact_name}</span>
                            <span className="text-[10px] text-slate-400">{agency.primary_contact_email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None assigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {agency.compliance_rating}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                          agency.active_inquiries_count > 0 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {agency.open_engagements_count || 0} active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAiDispatch(agency)}
                            className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100"
                            title="AI Diplomatic Dispatch"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAgencyDetail(agency)}
                            className="px-2.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AGENCY DETAIL MODAL / DOSSIER DRAWER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedAgency && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs font-bold">
                        {selectedAgency.agency_code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {selectedAgency.agency_name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedAgency.lead_supervisory_role} • {selectedAgency.headquarters_address || 'Official Headquarters'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAiDispatch(selectedAgency)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI Dispatch
                  </button>
                  <button
                    onClick={() => setSelectedAgency(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body with Tabs/Sections */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                {/* 1. Cryptographic Security & Treaty Infrastructure */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    Cryptographic Relay & Sovereign Treaty Protocol
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Secure Relay Endpoint</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 truncate block">
                        {selectedAgency.secure_relay_endpoint || 'Standard HTTPS Gateway'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bilateral Legal Framework</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {selectedAgency.bilateral_treaty_ref || 'Standard Administrative Procedure'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">PGP Master Fingerprint</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                          {selectedAgency.pgp_key_fingerprint || 'Not Registered'}
                        </span>
                        {selectedAgency.pgp_key_fingerprint && (
                          <button
                            onClick={() => copyToClipboard(selectedAgency.pgp_key_fingerprint || '', 'PGP Fingerprint')}
                            className="p-1 text-slate-400 hover:text-slate-700"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Public Key Pinning Hash</span>
                      <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate block">
                        {selectedAgency.cert_pinning_hash || 'SHA-256 PINNED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Key Regulatory Contacts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      Regulatory Liaison Officers ({agencyContacts.length})
                    </h4>
                    <button
                      onClick={() => {
                        setNewContactAgencyId(selectedAgency.id);
                        setIsAddContactModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                    >
                      <Plus className="w-3 h-3" /> Add Officer
                    </button>
                  </div>

                  {agencyContacts.length === 0 ? (
                    <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                      No liaison officers registered for this agency.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {agencyContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            contact.is_primary_liaison
                              ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{contact.full_name}</span>
                                {contact.is_primary_liaison === 1 && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white">
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {contact.official_title} • {contact.department}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {contact.clearance_level}
                            </span>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{contact.email_address}</span>
                            </div>
                            {contact.phone_number && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{contact.phone_number}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Engagement History Ledger */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-indigo-500" />
                      Statutory Engagement Ledger & Inquiries ({agencyEngagements.length})
                    </h4>
                    <button
                      onClick={() => {
                        setNewEngAgencyId(selectedAgency.id);
                        setIsRecordEngagementOpen(true);
                      }}
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                    >
                      <Plus className="w-3 h-3" /> Record Touchpoint
                    </button>
                  </div>

                  {agencyEngagements.length === 0 ? (
                    <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                      No statutory engagements recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {agencyEngagements.map((eng) => (
                        <div
                          key={eng.id}
                          className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {eng.case_or_reference_number}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-slate-100">{eng.subject_title}</h5>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 uppercase">
                                {eng.engagement_type}
                              </span>
                              {getStatusBadge(eng.communication_status)}
                            </div>
                          </div>

                          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                            {eng.summary_notes}
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                            <div>
                              <span>Transmitted: {new Date(eng.transmission_date).toLocaleString()}</span>
                              {eng.statutory_deadline && (
                                <span className="ml-3 text-amber-600 dark:text-amber-400 font-semibold">
                                  Deadline: {new Date(eng.statutory_deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {eng.cryptographic_receipt_hmac && (
                              <div className="flex items-center gap-1 font-mono text-[10px]">
                                <Key className="w-3 h-3 text-emerald-500" />
                                <span className="truncate max-w-[200px]">{eng.cryptographic_receipt_hmac}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Sovereign Tamper-Evident Ledger Verified</span>
                </div>
                <button
                  onClick={() => setSelectedAgency(null)}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* AI DIPLOMATIC STATUTORY DISPATCH COPILOT MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAiDispatchModalOpen && aiDispatchTargetAgency && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      AI Diplomatic Statutory Dispatch Drafter
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      To: {aiDispatchTargetAgency.agency_name} ({aiDispatchTargetAgency.acronym})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiDispatchModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Subject / Statutory Purpose
                  </label>
                  <input
                    type="text"
                    value={aiDispatchPurpose}
                    onChange={(e) => setAiDispatchPurpose(e.target.value)}
                    placeholder="e.g. Formal Response to Article 30 Audit Inquiry"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Diplomatic Tone
                    </label>
                    <select
                      value={aiDispatchTone}
                      onChange={(e) => setAiDispatchTone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="Formal Diplomatic & Technically Precise">Formal Diplomatic & Technically Precise</option>
                      <option value="Proactive Mutual Cooperation">Proactive Mutual Cooperation</option>
                      <option value="Firm Legal Defensibility & Statutory Citation">Firm Legal Defensibility & Statutory Citation</option>
                      <option value="Technical Sandbox Assurance">Technical Sandbox Assurance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Target Legal Basis
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={aiDispatchTargetAgency.bilateral_treaty_ref || 'Applicable Directives'}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Specific Technical Context & Safeguards Evidence
                  </label>
                  <textarea
                    rows={3}
                    value={aiDispatchContext}
                    onChange={(e) => setAiDispatchContext(e.target.value)}
                    placeholder="Include cryptographic evidence, zero-egress enclaves, and specific compliance telemetry..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateAiDispatch}
                    disabled={isGeneratingAiDispatch}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
                  >
                    {isGeneratingAiDispatch ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Drafting Statutory Dispatch...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Generate Legal Dispatch
                      </>
                    )}
                  </button>
                </div>

                {/* Generated AI Result Preview */}
                {aiDispatchResult && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Generated Formal Dispatch Package
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                        {aiDispatchResult.suggestedClassification || 'OFFICIAL_SENSITIVE'}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-slate-800 dark:text-slate-200">
                      {aiDispatchResult.dispatchBodyMarkdown}
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs pt-2">
                      <span className="text-slate-400 font-mono text-[10px]">
                        Ref: {aiDispatchResult.caseReference}
                      </span>
                      <button
                        onClick={() => {
                          copyToClipboard(aiDispatchResult.dispatchBodyMarkdown, 'Dispatch Letter');
                        }}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Dispatch Markdown
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* AI POSTURE STRATEGY MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAiStrategyModalOpen && aiStrategyAgency && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-xs"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Supervisory Posture & Engagement Strategy
                    </h3>
                    <p className="text-xs text-slate-500">
                      Agency: {aiStrategyAgency.agency_name} ({aiStrategyAgency.acronym})
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsAiStrategyModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {isLoadingStrategy ? (
                  <div className="p-8 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-slate-500">Analyzing supervisory patterns & regulatory risk...</p>
                  </div>
                ) : aiStrategyResult ? (
                  <>
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase text-[10px]">
                          Executive Posture Summary
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Risk: {aiStrategyResult.postureRiskLevel}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {aiStrategyResult.executiveSummary}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-wider mb-2">
                        Key Supervisory Priorities
                      </h4>
                      <ul className="space-y-1.5">
                        {aiStrategyResult.keySupervisoryPriorities?.map((p: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-wider mb-2">
                        Recommended Action Plan
                      </h4>
                      <ul className="space-y-1.5">
                        {aiStrategyResult.recommendedActionPlan?.map((p: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/40">
                <button
                  onClick={() => setIsAiStrategyModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* RECORD ENGAGEMENT TOUCHPOINT MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isRecordEngagementOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-xs"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Record B2G Engagement Touchpoint
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cryptographically sealed entry in sovereign matrix ledger
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsRecordEngagementOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveEngagement} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Target Regulatory Body *</label>
                    <select
                      value={newEngAgencyId}
                      onChange={(e) => setNewEngAgencyId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold"
                    >
                      {agencies.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.acronym} ({a.jurisdiction_country}) - {a.agency_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Engagement Type *</label>
                    <select
                      value={newEngType}
                      onChange={(e) => setNewEngType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    >
                      <option value="STATUTORY_INQUIRY">Statutory Inquiry</option>
                      <option value="FILING_SUBMISSION">Filing Submission</option>
                      <option value="SUPERVISORY_AUDIT">Supervisory Audit</option>
                      <option value="INCIDENT_NOTIFICATION">Incident Notification (24h NIS2)</option>
                      <option value="POLICY_CONSULTATION">Policy Consultation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subject / Touchpoint Title *</label>
                  <input
                    type="text"
                    required
                    value={newEngSubject}
                    onChange={(e) => setNewEngSubject(e.target.value)}
                    placeholder="e.g. Annual Certified RoPA Article 30 Electronic Dossier Transmission"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Case / Reference Code</label>
                    <input
                      type="text"
                      value={newEngRef}
                      onChange={(e) => setNewEngRef(e.target.value)}
                      placeholder="e.g. CNIL-INQ-2026-901"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={newEngStatus}
                      onChange={(e) => setNewEngStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    >
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="PENDING_REGULATOR_RESPONSE">Pending Response</option>
                      <option value="TRANSMITTED_SEALED">Transmitted & Sealed</option>
                      <option value="CLOSED_COMPLIANT">Closed Compliant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Direction</label>
                    <select
                      value={newEngDirection}
                      onChange={(e) => setNewEngDirection(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    >
                      <option value="OUTBOUND">Outbound (To Regulator)</option>
                      <option value="INBOUND">Inbound (From Regulator)</option>
                      <option value="BILATERAL">Bilateral Joint Session</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Summary Notes & Regulatory Actions</label>
                  <textarea
                    rows={3}
                    value={newEngSummary}
                    onChange={(e) => setNewEngSummary(e.target.value)}
                    placeholder="Enter formal summary of discussion, submitted documents, or regulator directives..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none resize-none"
                  />
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      HMAC-SHA256 Cryptographic Receipt Seal will be automatically generated.
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRecordEngagementOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                  >
                    Seal & Save Touchpoint
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* REGISTER NEW AUTHORITY BODY MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isRegisterAgencyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-xs"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Register Regulatory Supervisory Authority
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add new government body into the B2G Stakeholder Matrix
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsRegisterAgencyOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleRegisterAgency} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Agency Code *</label>
                    <input
                      type="text"
                      required
                      value={newAgencyCode}
                      onChange={(e) => setNewAgencyCode(e.target.value)}
                      placeholder="e.g. ES_AEPD"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Acronym *</label>
                    <input
                      type="text"
                      required
                      value={newAgencyAcronym}
                      onChange={(e) => setNewAgencyAcronym(e.target.value)}
                      placeholder="e.g. AEPD"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Jurisdiction *</label>
                    <select
                      value={newAgencyCountry}
                      onChange={(e) => setNewAgencyCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold"
                    >
                      <option value="EU">EU (Pan-European)</option>
                      <option value="FR">France (FR)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="UK">United Kingdom (UK)</option>
                      <option value="ES">Spain (ES)</option>
                      <option value="IT">Italy (IT)</option>
                      <option value="SA">Saudi Arabia (SA)</option>
                      <option value="CH">Switzerland (CH)</option>
                      <option value="NL">Netherlands (NL)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Full Official Agency Name *</label>
                  <input
                    type="text"
                    required
                    value={newAgencyName}
                    onChange={(e) => setNewAgencyName(e.target.value)}
                    placeholder="e.g. Agencia Española de Protección de Datos (AEPD)"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Regulatory Domain *</label>
                    <select
                      value={newAgencyDomain}
                      onChange={(e) => setNewAgencyDomain(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    >
                      <option value="DATA_PRIVACY">Data Privacy / GDPR</option>
                      <option value="CYBER_DORA_NIS2">Cyber / NIS2 / DORA</option>
                      <option value="AI_ALGORITHMIC">AI Act & GPAI</option>
                      <option value="TAX_CTC">Tax & Continuous Clearance</option>
                      <option value="FINANCIAL_PRUDENTIAL">Prudential Financial Risk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Relationship Posture</label>
                    <select
                      value={newAgencyPosture}
                      onChange={(e) => setNewAgencyPosture(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    >
                      <option value="COLLABORATIVE_PARTNER">Collaborative Partner</option>
                      <option value="MUTUAL_COOPERATION">Mutual Cooperation</option>
                      <option value="ROUTINE_AUDIT">Routine Audit</option>
                      <option value="ELEVATED_SCRUTINY">Elevated Scrutiny</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Official Portal URL</label>
                    <input
                      type="url"
                      value={newAgencyPortal}
                      onChange={(e) => setNewAgencyPortal(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Secure Relay Ingress Endpoint</label>
                    <input
                      type="url"
                      value={newAgencyRelay}
                      onChange={(e) => setNewAgencyRelay(e.target.value)}
                      placeholder="https://relay.gov.../v1"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterAgencyOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                  >
                    Register Authority Body
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ADD REGULATORY CONTACT OFFICER MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddContactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-xs"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Register Regulatory Contact Officer
                    </h3>
                    <p className="text-xs text-slate-500">
                      Designate official liaison with supervisory authority
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsAddContactModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveContact} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="e.g. Dr. Hélène de Saint-Amand"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Official Title *</label>
                    <input
                      type="text"
                      required
                      value={newContactTitle}
                      onChange={(e) => setNewContactTitle(e.target.value)}
                      placeholder="e.g. Directrice Adjointe des Contrôles"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={newContactDept}
                      onChange={(e) => setNewContactDept(e.target.value)}
                      placeholder="e.g. Direction de la Conformité Numérique"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      placeholder="officer@agency.gouv.fr"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Clearance Level</label>
                    <select
                      value={newContactClearance}
                      onChange={(e) => setNewContactClearance(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    >
                      <option value="STANDARD_OFFICIAL">Standard Official</option>
                      <option value="EU_CONFIDENTIAL">EU Confidential</option>
                      <option value="EU_SECRET">EU Secret</option>
                      <option value="TOP_SECRET_GOV">Top Secret Sovereign</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Preferred Channel</label>
                    <select
                      value={newContactChannel}
                      onChange={(e) => setNewContactChannel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    >
                      <option value="SECURE_GOV_RELAY">Secure Gov Relay</option>
                      <option value="PGP_ENCRYPTED_EMAIL">PGP Encrypted Email</option>
                      <option value="DIPLOMATIC_COURIER">Diplomatic Courier</option>
                      <option value="OFFICIAL_PORTAL">Official Portal</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPrimaryContact"
                    checked={newContactIsPrimary}
                    onChange={(e) => setNewContactIsPrimary(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isPrimaryContact" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    Designate as Primary Liaison Officer for this Agency
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddContactModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
