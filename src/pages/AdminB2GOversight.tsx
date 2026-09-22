import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, 
  Box, 
  FileCheck2, 
  Search, 
  ShieldAlert, 
  Globe, 
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Database,
  Lock,
  ChevronRight,
  Filter,
  Download,
  Plus,
  Sliders,
  X,
  FileText,
  Key,
  Eye,
  Send,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { fetchWithRetry } from '../lib/api-client';
import { b2gClient } from '../lib/b2g-client';
import { useNotification } from '../context/NotificationContext';
import { B2gAdvancedEnforcementConfig } from '../components/dashboard/B2gAdvancedEnforcementConfig';
import { FilingWizardModal } from '../components/b2g/FilingWizardModal';
import { B2gFilingWizard } from '../components/b2g/B2gFilingWizard';
import { XmlParsersHub } from '../components/b2g/XmlParsersHub';
import { ProcurementQualificationEngine } from '../components/b2g/ProcurementQualificationEngine';
import { CentralBankClearingTracker } from '../components/b2g/CentralBankClearingTracker';
import { JudicialEvidenceContainer } from '../components/b2g/JudicialEvidenceContainer';
import { OssCrossBorderMechanism } from '../components/b2g/OssCrossBorderMechanism';
import { Nis2IncidentDispatchHub } from '../components/b2g/Nis2IncidentDispatchHub';
import { SovereignSubpoenaGateway } from '../components/b2g/SovereignSubpoenaGateway';
import { CtcEInvoicingGateway } from '../components/b2g/CtcEInvoicingGateway';
import { AiActPmmRelay } from '../components/b2g/AiActPmmRelay';
import { RegionalSovereignCommandGrid } from '../components/b2g/RegionalSovereignCommandGrid';
import { RegionalDataResidencyConfigManager } from '../components/b2g/RegionalDataResidencyConfigManager';
import { RegulatoryIntelligenceRadar } from '../components/b2g/RegulatoryIntelligenceRadar';
import { AdvancedMultiRegionB2gEngine } from '../components/b2g/AdvancedMultiRegionB2gEngine';
import { MultiRegionSandboxConfigPanel } from '../components/b2g/MultiRegionSandboxConfigPanel';
import { SovereignComplianceHub } from '../components/b2g/SovereignComplianceHub';
import { ComplianceDeltaAuditor } from '../components/b2g/ComplianceDeltaAuditor';
import { AgencyStakeholderMatrix } from '../components/b2g/AgencyStakeholderMatrix';
import { NationalB2gScanningEngine } from '../components/b2g/NationalB2gScanningEngine';
import { B2gFilingWorkflowTimeline } from '../components/b2g/B2gFilingWorkflowTimeline';

// Types for B2G Oversight
export interface SandboxRequest {
  id: string;
  organizationId: string;
  organizationName: string;
  proposedActivity: string;
  dataCategories: string;
  technologyUsed: string;
  jurisdiction: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'COMPLETED';
  requestedAt: string;
  notes?: string;
}

export interface RegulatoryFiling {
  id: string;
  organizationId: string;
  organizationName: string;
  filingType: string;
  title: string;
  submissionDate: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  documentUrl?: string;
  checksum?: string;
  auditor?: string;
}

export interface RegulatoryInquiry {
  id: string;
  organizationId: string;
  organizationName: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  lastUpdateAt: string;
  regulationArticle: string;
  details?: string;
}

export interface WhistleblowerReport {
  id: string;
  organizationId?: string;
  organizationName?: string;
  subject: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'INVESTIGATING' | 'ACTION_TAKEN' | 'CLOSED';
  isAnonymous: boolean;
  createdAt: string;
  encryptedHash: string;
  description?: string;
}

export interface InterAgencyRequest {
  id: string;
  requestingAgency: string;
  respondingAgency: string;
  purpose: string;
  dataRequested: string;
  status: 'PENDING' | 'AUTHORIZED' | 'DENIED' | 'COMPLETED';
  createdAt: string;
  legalBasis: string;
}

export const AdminB2GOversight: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'NATIONAL_SCANNER' | 'SOVEREIGN_HUB' | 'STAKEHOLDER_MATRIX' | 'DELTA_AUDITOR' | 'SANDBOX' | 'FILINGS' | 'FILING_TIMELINE' | 'INQUIRIES' | 'WHISTLEBLOWER' | 'AGENCIES' | 'REGIONAL_RESIDENCY' | 'REGULATORY_INTEL' | 'CONFIG' | 'ADVANCED_SUITE'>('DASHBOARD');
  const [advancedSuiteSubTab, setAdvancedSuiteSubTab] = useState<'PARSERS' | 'PROCUREMENT' | 'SETTLEMENT' | 'EVIDENCE' | 'OSS' | 'NIS2' | 'SUBPOENA' | 'CTC' | 'AI_ACT' | 'REGIONAL' | 'RESIDENCY_CONFIG' | 'INTEL_RADAR' | 'DELTA_AUDITOR'>('REGIONAL');
  
  // Data States
  const [sandboxRequests, setSandboxRequests] = useState<SandboxRequest[]>([]);
  const [filings, setFilings] = useState<RegulatoryFiling[]>([]);
  const [inquiries, setInquiries] = useState<RegulatoryInquiry[]>([]);
  const [whistleblowerReports, setWhistleblowerReports] = useState<WhistleblowerReport[]>([]);
  const [agencyRequests, setAgencyRequests] = useState<InterAgencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [sandboxSearch, setSandboxSearch] = useState('');
  const [sandboxStatusFilter, setSandboxStatusFilter] = useState<string>('ALL');
  const [filingSearch, setFilingSearch] = useState('');
  const [filingTypeFilter, setFilingTypeFilter] = useState<string>('ALL');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryPriorityFilter, setInquiryPriorityFilter] = useState<string>('ALL');
  const [whistleblowerSearch, setWhistleblowerSearch] = useState('');
  const [whistleblowerSeverityFilter, setWhistleblowerSeverityFilter] = useState<string>('ALL');

  // Modal / Drawer Selection States
  const [selectedSandbox, setSelectedSandbox] = useState<SandboxRequest | null>(null);
  const [selectedFiling, setSelectedFiling] = useState<RegulatoryFiling | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<RegulatoryInquiry | null>(null);
  const [selectedWhistleblower, setSelectedWhistleblower] = useState<WhistleblowerReport | null>(null);
  const [selectedAgencyReq, setSelectedAgencyReq] = useState<InterAgencyRequest | null>(null);

  // Creation Modals
  const [isNewSandboxOpen, setIsNewSandboxOpen] = useState(false);
  const [sandboxViewMode, setSandboxViewMode] = useState<'CONFIG' | 'APPLICATIONS'>('CONFIG');
  const [isFilingWizardOpen, setIsFilingWizardOpen] = useState(false);
  const [filingsViewMode, setFilingsViewMode] = useState<'LIST' | 'WIZARD'>('LIST');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isAddAgencyOpen, setIsAddAgencyOpen] = useState(false);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);

  // Form inputs for new inquiry
  const [newInquiryOrg, setNewInquiryOrg] = useState('');
  const [newInquirySubject, setNewInquirySubject] = useState('');
  const [newInquiryArticle, setNewInquiryArticle] = useState('GDPR Article 32');
  const [newInquiryPriority, setNewInquiryPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newInquiryDetails, setNewInquiryDetails] = useState('');

  // Form inputs for new sandbox request
  const [newSandboxOrg, setNewSandboxOrg] = useState('');
  const [newSandboxActivity, setNewSandboxActivity] = useState('');
  const [newSandboxTech, setNewSandboxTech] = useState('');
  const [newSandboxCategories, setNewSandboxCategories] = useState('');
  const [newSandboxJurisdiction, setNewSandboxJurisdiction] = useState('Germany');

  // Form inputs for new agency
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgencyCountry, setNewAgencyCountry] = useState('European Union');
  const [newAgencyContact, setNewAgencyContact] = useState('');

  // Custom Reply in Whistleblower Drawer
  const [replyMessage, setReplyMessage] = useState('');

  // Initialize simulated dataset
  useEffect(() => {
    let cancelled = false;
    const server: any = {};
    const applyServer = () => {
      if (cancelled) return;
      if (server.sandbox) setSandboxRequests(server.sandbox);
      if (server.filings) setFilings(server.filings);
      if (server.inquiries) setInquiries(server.inquiries);
    };

    const fetchJson = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    };

    fetchJson('/api/v1/b2g/sandbox/applications')
      .then((j) => {
        const rows = (j?.applications || []) as any[];
        if (!rows.length) return;
        server.sandbox = rows.map((a): SandboxRequest => ({
          id: a.id || `SB-${Date.now()}`,
          organizationId: a.organizationId || '',
          organizationName: a.organizationName || 'Verified Entity',
          proposedActivity: a.proposedActivity || 'Unnamed Activity',
          dataCategories: a.dataCategories || '',
          technologyUsed: a.technologyUsed || '',
          jurisdiction: a.jurisdiction || 'European Union',
          status: (a.status || 'PENDING') as any,
          requestedAt: a.requestedAt || new Date().toISOString(),
          notes: a.notes
        }));
        applyServer();
      })
      .catch(() => {});

    fetchJson('/api/v1/b2g/regional/filings')
      .then((j) => {
        const rows = (j?.filings || []) as any[];
        if (!rows.length) return;
        server.filings = rows.map((f): RegulatoryFiling => ({
          id: f.id || f.filing_reference || `FIL-${Date.now()}`,
          organizationId: f.submitting_entity_id || f.id || '',
          organizationName: f.submitting_entity || 'Verified Entity',
          filingType: f.filing_type || f.framework_title || 'Statutory Filing',
          title: f.framework_title || f.filing_type || 'Compliance Filing',
          submissionDate: f.created_at || new Date().toISOString(),
          status: (f.statutory_status || 'SUBMITTED') as any,
          checksum: f.cryptographic_seal,
          auditor: f.regulatory_body || f.region_code
        }));
        applyServer();
      })
      .catch(() => {});

    fetchJson('/api/v1/b2g/inquiries')
      .then((j) => {
        const rows = (j?.inquiries || []) as any[];
        if (!rows.length) return;
        server.inquiries = rows.map((i): RegulatoryInquiry => ({
          id: i.id || `INQ-${Date.now()}`,
          organizationId: i.organizationId || '',
          organizationName: i.organizationName || 'Verified Entity',
          subject: i.subject || 'Regulatory Inquiry',
          priority: (String(i.priority || 'medium').toUpperCase() as any),
          status: (String(i.status || 'open').startsWith('await') ? 'IN_PROGRESS' : String(i.status || 'open').toUpperCase()) as any,
          createdAt: i.createdAt || new Date().toISOString(),
          lastUpdateAt: i.updatedAt || i.createdAt || new Date().toISOString(),
          regulationArticle: i.statutoryBasis || i.framework || '',
          details: i.inquiryDetails || i.details
        }));
        applyServer();
      })
      .catch(() => {});

    const timer = setTimeout(() => {
      if (!server.sandbox) setSandboxRequests([
        { 
          id: 'SB-001', 
          organizationId: 'ORG-101', 
          organizationName: 'Neural Systems Ltd', 
          proposedActivity: 'Biometric AI Authentication for Retail Checkouts', 
          dataCategories: 'Facial Vectors, Biometric Signatures, Timestamped Coordinates', 
          technologyUsed: 'Edge AI, Quantized Neural Enclaves', 
          jurisdiction: 'Germany', 
          status: 'PENDING', 
          requestedAt: '2026-07-20T10:00:00Z',
          notes: 'Requires synthetic test cohort validation before production ingress.'
        },
        { 
          id: 'SB-002', 
          organizationId: 'ORG-102', 
          organizationName: 'Quantum Health Analytics', 
          proposedActivity: 'Predictive Genomics for Rare Oncology Diagnosis', 
          dataCategories: 'Genetic PII, EHR Telemetry, Histopathology Slides', 
          technologyUsed: 'Federated Learning, Differential Privacy (epsilon=0.15)', 
          jurisdiction: 'France', 
          status: 'APPROVED', 
          requestedAt: '2026-07-15T14:30:00Z',
          notes: 'Approved under EU Health Data Space Sandbox Framework.'
        },
        { 
          id: 'SB-003', 
          organizationId: 'ORG-103', 
          organizationName: 'AeroAutonomous Systems', 
          proposedActivity: 'Urban Drone Navigation & Aerial Photogrammetry', 
          dataCategories: 'Public Geolocation, Anonymized Pedestrian Video Stream', 
          technologyUsed: 'Optical Flow, On-Chip Real-Time Blur Filter', 
          jurisdiction: 'Netherlands', 
          status: 'PENDING', 
          requestedAt: '2026-08-01T09:15:00Z',
          notes: 'Evaluating Article 5 GDPR proportionality.'
        },
      ]);

      if (!server.filings) setFilings([
        { 
          id: 'FIL-101', 
          organizationId: 'ORG-201', 
          organizationName: 'Acme Financial S.A.', 
          filingType: 'Annual DORA Resilience Assessment', 
          title: 'FY2025 Tier-1 ICT Risk & Multi-Cloud Fallback Audit', 
          submissionDate: '2026-07-28T09:00:00Z', 
          status: 'UNDER_REVIEW',
          documentUrl: '/docs/filings/acme_dora_2025.jsonld',
          checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          auditor: 'PwC Sovereign Assurance'
        },
        { 
          id: 'FIL-102', 
          organizationId: 'ORG-202', 
          organizationName: 'EcoLogistics International', 
          filingType: 'EU AI Act Conformity Declaration', 
          title: 'Autonomous Dispatching & Route Optimization Model Card', 
          submissionDate: '2026-07-25T16:45:00Z', 
          status: 'ACCEPTED',
          documentUrl: '/docs/filings/ecologistics_ai_act.jsonld',
          checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          auditor: 'TÜV Rheinland Cyber'
        },
        { 
          id: 'FIL-103', 
          organizationId: 'ORG-203', 
          organizationName: 'HyperPay Europe B.V.', 
          filingType: 'NIS2 Critical Infrastructure Report', 
          title: 'Supply Chain Penetration & Sovereign HSM Key Escrow', 
          submissionDate: '2026-08-02T11:20:00Z', 
          status: 'SUBMITTED',
          documentUrl: '/docs/filings/hyperpay_nis2.jsonld',
          checksum: 'sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          auditor: 'Internal DPO Verification'
        },
      ]);

      if (!server.inquiries) setInquiries([
        { 
          id: 'INQ-501', 
          organizationId: 'ORG-301', 
          organizationName: 'Global Telecom Networks', 
          subject: 'Call Detail Record (CDR) Data Retention Policy Overreach', 
          priority: 'HIGH', 
          status: 'IN_PROGRESS', 
          createdAt: '2026-07-22T11:00:00Z', 
          lastUpdateAt: '2026-07-29T13:20:00Z',
          regulationArticle: 'ePrivacy Directive Art. 15 / GDPR Art. 5(1)(e)',
          details: 'Retention period exceeds 6 months without judicial warrant.'
        },
        { 
          id: 'INQ-502', 
          organizationId: 'ORG-302', 
          organizationName: 'EduTech Plus GmbH', 
          subject: 'Minor Parental Consent Verification Mechanism Audit', 
          priority: 'MEDIUM', 
          status: 'OPEN', 
          createdAt: '2026-07-30T08:30:00Z', 
          lastUpdateAt: '2026-07-30T08:30:00Z',
          regulationArticle: 'GDPR Article 8 (Child Consent)',
          details: 'Double opt-in verification tokens lack cryptographic timestamp proof.'
        },
        { 
          id: 'INQ-503', 
          organizationId: 'ORG-303', 
          organizationName: 'Synthetix Biosystems', 
          subject: 'Unregistered High-Risk Biological Classification AI', 
          priority: 'CRITICAL', 
          status: 'IN_PROGRESS', 
          createdAt: '2026-08-04T15:00:00Z', 
          lastUpdateAt: '2026-08-06T10:15:00Z',
          regulationArticle: 'EU AI Act Annex III (High-Risk In-Scope Systems)',
          details: 'Model deployed without CE conformity assessment or DPA registration.'
        },
      ]);

      setWhistleblowerReports([
        { 
          id: 'WB-901', 
          organizationId: 'ORG-401', 
          organizationName: 'Solaris Energy Grid S.p.A.', 
          subject: 'Third-Party Vendor Remote Access Bypass on SCADA Controller', 
          severity: 'CRITICAL', 
          status: 'INVESTIGATING', 
          isAnonymous: true, 
          createdAt: '2026-07-24T23:15:00Z',
          encryptedHash: '0x8f199b7b2d587c672bcf921d7463f848972ec6e399516c52a0a202d083bc',
          description: 'A contractor was granted unmonitored SSH tunnels directly bypassing the bastion host and multi-factor authorization gateway.'
        },
        { 
          id: 'WB-902', 
          organizationId: 'ORG-101', 
          organizationName: 'Neural Systems Ltd', 
          subject: 'Concealment of Training Set Demographic Bias Disparity', 
          severity: 'HIGH', 
          status: 'NEW', 
          isAnonymous: false, 
          createdAt: '2026-07-31T09:45:00Z',
          encryptedHash: '0x3c9902e88a6d49931b268b6cf7f8582f3ef8471c26b772c91823719b0f4',
          description: 'Internal audit reports demonstrating 28% higher false-reject rate for minority cohorts were purged from the DPO compliance register.'
        },
      ]);

      setAgencyRequests([
        { 
          id: 'AGR-701', 
          requestingAgency: 'EDPB (European Data Protection Board)', 
          respondingAgency: 'BaFin (Federal Financial Supervisory Authority)', 
          purpose: 'Cross-Border High-Frequency Trading & Algorithmic Collusion Investigation', 
          dataRequested: 'Sub-millisecond Transactional Telemetry, KYC Risk Scores', 
          status: 'AUTHORIZED', 
          createdAt: '2026-07-26T12:00:00Z',
          legalBasis: 'EU Regulation 2016/679 Art. 61 & MiFID II Article 57'
        },
        { 
          id: 'AGR-702', 
          requestingAgency: 'CNIL (France)', 
          respondingAgency: 'DPC (Ireland)', 
          purpose: 'Lead Supervisory Authority One-Stop-Shop Adjudication', 
          dataRequested: 'Profiling Behavioral Logged Consents (2024-2026)', 
          status: 'PENDING', 
          createdAt: '2026-08-05T14:40:00Z',
          legalBasis: 'GDPR Article 60 (Mutual Cooperation Procedure)'
        }
      ]);

      setLoading(false);
    }, 300);

    // Subscribe to real-time B2G API events
    const onFilingEvent = (e: any) => {
      const filing = e.detail;
      if (filing) {
        setFilings(prev => {
          const exists = prev.some(f => f.id === filing.id || f.id === filing.filingRef);
          if (exists) {
            return prev.map(f => (f.id === filing.id || f.id === filing.filingRef) ? {
              ...f,
              status: (filing.status || 'SUBMITTED').toUpperCase() as any
            } : f);
          }
          return [{
            id: filing.filingRef || filing.id || `FIL-${Date.now()}`,
            organizationId: filing.organizationId || 'ORG-AUTO',
            organizationName: filing.organizationName || 'Verified Entity',
            filingType: `${filing.framework || 'Statutory'} Filing`,
            title: filing.filingTitle || filing.summary || 'Statutory Compliance Submission',
            submissionDate: filing.submissionDate || new Date().toISOString(),
            status: 'SUBMITTED',
            documentUrl: `/docs/filings/${filing.id || 'filing'}.jsonld`,
            checksum: filing.sha256Checksum || `sha256:${Date.now()}`,
            auditor: 'B2G API Gateway Verified'
          }, ...prev];
        });
      }
    };

    const onInquiryEvent = (e: any) => {
      const inq = e.detail;
      if (inq) {
        setInquiries(prev => {
          const exists = prev.some(i => i.id === inq.id || i.id === inq.inquiryRef);
          if (exists) {
            return prev.map(i => (i.id === inq.id || i.id === inq.inquiryRef) ? {
              ...i,
              status: (inq.status || 'OPEN').toUpperCase().replace(/-/g, '_') as any,
              lastUpdateAt: new Date().toISOString()
            } : i);
          }
          return [{
            id: inq.inquiryRef || inq.id || `INQ-${Date.now()}`,
            organizationId: inq.organizationId || 'ORG-AUTO',
            organizationName: inq.organizationName || 'Entity In Scope',
            subject: inq.subject || 'Statutory Information Request',
            priority: (inq.priority || 'HIGH').toUpperCase() as any,
            status: 'OPEN',
            createdAt: inq.createdAt || new Date().toISOString(),
            lastUpdateAt: new Date().toISOString(),
            regulationArticle: inq.statutoryBasis || 'Statutory Directive',
            details: inq.inquiryDetails || 'Regulatory inquiry issued via B2G API Client.'
          }, ...prev];
        });
      }
    };

    const onWhistleblowerEvent = (e: any) => {
      const rep = e.detail;
      if (rep) {
        setWhistleblowerReports(prev => {
          const exists = prev.some(w => w.id === rep.id || w.id === rep.reportRef);
          if (exists) {
            return prev.map(w => (w.id === rep.id || w.id === rep.reportRef) ? {
              ...w,
              status: (rep.status === 'Action Taken' ? 'ACTION_TAKEN' : rep.status === 'Dismissed' ? 'CLOSED' : 'INVESTIGATING') as any
            } : w);
          }
          return [{
            id: rep.reportRef || rep.id || `WB-${Date.now()}`,
            organizationId: rep.reportedOrganizationId || 'ORG-ANON',
            organizationName: rep.reportedOrganizationName || 'Confidential Enterprise',
            subject: rep.title || rep.description || 'Protected Whistleblower Disclosure',
            severity: (rep.priority || 'HIGH').toUpperCase() as any,
            status: 'NEW',
            isAnonymous: rep.anonymous ?? true,
            createdAt: rep.timestamp || new Date().toISOString(),
            encryptedHash: rep.anonymousKey || `0x${Date.now().toString(16)}`,
            description: rep.description || 'Protected anonymous disclosure logged into sovereign vault.'
          }, ...prev];
        });
      }
    };

    window.addEventListener('b2g-filing-submitted', onFilingEvent);
    window.addEventListener('b2g-filing-updated', onFilingEvent);
    window.addEventListener('b2g-inquiry-created', onInquiryEvent);
    window.addEventListener('b2g-inquiry-responded', onInquiryEvent);
    window.addEventListener('b2g-whistleblower-submitted', onWhistleblowerEvent);
    window.addEventListener('b2g-whistleblower-updated', onWhistleblowerEvent);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener('b2g-filing-submitted', onFilingEvent);
      window.removeEventListener('b2g-filing-updated', onFilingEvent);
      window.removeEventListener('b2g-inquiry-created', onInquiryEvent);
      window.removeEventListener('b2g-inquiry-responded', onInquiryEvent);
      window.removeEventListener('b2g-whistleblower-submitted', onWhistleblowerEvent);
      window.removeEventListener('b2g-whistleblower-updated', onWhistleblowerEvent);
    };
  }, []);

  // Action handlers
  const handleSandboxStatus = (id: string, newStatus: SandboxRequest['status']) => {
    setSandboxRequests(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    showToast(`Sandbox request ${id} updated to ${newStatus}`, newStatus === 'APPROVED' ? 'success' : 'info');
    if (selectedSandbox?.id === id) {
      setSelectedSandbox(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleFilingStatus = (id: string, newStatus: RegulatoryFiling['status']) => {
    setFilings(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    b2gClient.acknowledgeFiling(id, {
      status: (newStatus === 'ACCEPTED' ? 'approved' : newStatus === 'REJECTED' ? 'rejected' : 'under_review') as any,
      decidedBy: 'EU Central Supervisory Authority'
    }).catch(err => console.warn('b2gClient acknowledge error:', err));
    showToast(`Filing ${id} status set to ${newStatus}`, 'success');
    if (selectedFiling?.id === id) {
      setSelectedFiling(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleInquiryStatus = (id: string, newStatus: RegulatoryInquiry['status']) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus, lastUpdateAt: new Date().toISOString() } : i));
    showToast(`Inquiry ${id} updated to ${newStatus}`, 'info');
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(prev => prev ? { ...prev, status: newStatus, lastUpdateAt: new Date().toISOString() } : null);
    }
  };

  const handleWhistleblowerStatus = (id: string, newStatus: WhistleblowerReport['status']) => {
    setWhistleblowerReports(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
    const wbStatusMap: Record<string, any> = {
      'INVESTIGATING': 'Under Investigation',
      'RESOLVED': 'Action Taken',
      'DISMISSED': 'Dismissed',
      'RECEIVED': 'Received'
    };
    b2gClient.updateWhistleblowerStatus(id, wbStatusMap[newStatus] || 'Under Investigation')
      .catch(err => console.warn('b2gClient whistleblower status update error:', err));
    showToast(`Disclosure ${id} marked as ${newStatus}`, 'success');
    if (selectedWhistleblower?.id === id) {
      setSelectedWhistleblower(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleExportAudit = () => {
    const auditPayload = {
      timestamp: new Date().toISOString(),
      regulatorScope: 'EU Central B2G Supervisory Authority',
      summary: {
        totalSandboxRequests: sandboxRequests.length,
        totalFilings: filings.length,
        totalInquiries: inquiries.length,
        whistleblowerFiles: whistleblowerReports.length,
        interAgencyTransfers: agencyRequests.length
      },
      sandboxRequests,
      filings,
      inquiries,
      whistleblowerReports: whistleblowerReports.map(r => ({
        id: r.id,
        severity: r.severity,
        status: r.status,
        encryptedHash: r.encryptedHash,
        createdAt: r.createdAt
      })),
      agencyRequests
    };

    const blob = new Blob([JSON.stringify(auditPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `B2G-Oversight-Audit-Ledger-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('B2G Oversight Audit Ledger exported successfully', 'success');
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiryOrg || !newInquirySubject) {
      showToast('Please fill in entity name and subject', 'error');
      return;
    }
    const newInq: RegulatoryInquiry = {
      id: `INQ-${Math.floor(600 + Math.random() * 300)}`,
      organizationId: `ORG-${Math.floor(100 + Math.random() * 800)}`,
      organizationName: newInquiryOrg,
      subject: newInquirySubject,
      priority: newInquiryPriority,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      lastUpdateAt: new Date().toISOString(),
      regulationArticle: newInquiryArticle,
      details: newInquiryDetails || 'Official regulatory inquiry initiated by Central Authority oversight officer.'
    };
    setInquiries(prev => [newInq, ...prev]);

    // Dispatch via b2gClient
    b2gClient.createInquiry({
      organizationId: newInq.organizationId,
      organizationName: newInq.organizationName,
      jurisdiction: 'EU-General',
      issuingAgency: 'EU Central Supervisory Authority',
      framework: ((newInquiryArticle || '').includes('NIS2') ? 'NIS2' : (newInquiryArticle || '').includes('DORA') ? 'DORA' : (newInquiryArticle || '').includes('AI') ? 'EU_AI_ACT' : 'GDPR') as any,
      priority: (newInquiryPriority.toLowerCase() || 'medium') as any,
      subject: newInq.subject,
      statutoryBasis: newInquiryArticle || 'Statutory Compliance Mandate',
      deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      demandedActions: ['Provide certified response', 'Attach technical compliance evidence'],
      inquiryDetails: newInq.details || ''
    }).catch(err => console.warn('b2gClient inquiry creation error:', err));

    setIsInquiryModalOpen(false);
    setNewInquiryOrg('');
    setNewInquirySubject('');
    setNewInquiryDetails('');
    showToast(`Official Inquiry ${newInq.id} dispatched to ${newInq.organizationName}`, 'success');
  };

  const handleCreateSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSandboxOrg || !newSandboxActivity) {
      showToast('Please fill in required fields', 'error');
      return;
    }
    const newSb: SandboxRequest = {
      id: `SB-${Math.floor(10 + Math.random() * 89)}`,
      organizationId: `ORG-${Math.floor(100 + Math.random() * 800)}`,
      organizationName: newSandboxOrg,
      proposedActivity: newSandboxActivity,
      dataCategories: newSandboxCategories || 'Synthetic Telemetry, Anonymized PII',
      technologyUsed: newSandboxTech || 'Autonomous Enclave / Local LLM',
      jurisdiction: newSandboxJurisdiction,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      notes: 'Submitted via B2G Regulator Oversight Center.'
    };
    setSandboxRequests(prev => [newSb, ...prev]);
    setIsNewSandboxOpen(false);
    setNewSandboxOrg('');
    setNewSandboxActivity('');
    setNewSandboxTech('');
    setNewSandboxCategories('');
    showToast(`Sandbox pre-clearance file ${newSb.id} registered`, 'success');
  };

  const handleAddAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName) return;
    const newReq: InterAgencyRequest = {
      id: `AGR-${Math.floor(800 + Math.random() * 100)}`,
      requestingAgency: newAgencyName,
      respondingAgency: 'EDPB Central Enclave',
      purpose: 'Mutual Sovereignty & Inter-Agency Coordination',
      dataRequested: 'Standard Compliance Attestation & Hash Checksums',
      status: 'AUTHORIZED',
      createdAt: new Date().toISOString(),
      legalBasis: 'EU Regulation 2016/679 Art. 61'
    };
    setAgencyRequests(prev => [newReq, ...prev]);
    setIsAddAgencyOpen(false);
    setNewAgencyName('');
    showToast(`Authorized agency partner ${newAgencyName} registered`, 'success');
  };

  const handleRotateKeys = () => {
    setIsRotatingKeys(true);
    setTimeout(() => {
      setIsRotatingKeys(false);
      showToast('Administrative PGP & HSM Enclave keys rotated across all active nodes', 'success');
    }, 1200);
  };

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedWhistleblower) return;
    showToast(`Encrypted transmission routed via Tor Bridge to Case ${selectedWhistleblower.id}`, 'success');
    setReplyMessage('');
  };

  // Filtered lists
  const filteredSandbox = useMemo(() => {
    return sandboxRequests.filter(s => {
      const matchSearch = s.organizationName.toLowerCase().includes(sandboxSearch.toLowerCase()) ||
                          s.proposedActivity.toLowerCase().includes(sandboxSearch.toLowerCase()) ||
                          s.jurisdiction.toLowerCase().includes(sandboxSearch.toLowerCase()) ||
                          s.id.toLowerCase().includes(sandboxSearch.toLowerCase());
      const matchStatus = sandboxStatusFilter === 'ALL' || s.status === sandboxStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [sandboxRequests, sandboxSearch, sandboxStatusFilter]);

  const filteredFilings = useMemo(() => {
    return filings.filter(f => {
      const matchSearch = f.organizationName.toLowerCase().includes(filingSearch.toLowerCase()) ||
                          f.title.toLowerCase().includes(filingSearch.toLowerCase()) ||
                          f.id.toLowerCase().includes(filingSearch.toLowerCase());
      const matchType = filingTypeFilter === 'ALL' || f.status === filingTypeFilter;
      return matchSearch && matchType;
    });
  }, [filings, filingSearch, filingTypeFilter]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(i => {
      const matchSearch = i.organizationName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                          i.subject.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                          i.id.toLowerCase().includes(inquirySearch.toLowerCase());
      const matchPriority = inquiryPriorityFilter === 'ALL' || i.priority === inquiryPriorityFilter;
      return matchSearch && matchPriority;
    });
  }, [inquiries, inquirySearch, inquiryPriorityFilter]);

  const filteredWhistleblower = useMemo(() => {
    return whistleblowerReports.filter(w => {
      const matchSearch = (w.organizationName || 'Anonymous').toLowerCase().includes(whistleblowerSearch.toLowerCase()) ||
                          w.subject.toLowerCase().includes(whistleblowerSearch.toLowerCase()) ||
                          w.id.toLowerCase().includes(whistleblowerSearch.toLowerCase());
      const matchSeverity = whistleblowerSeverityFilter === 'ALL' || w.severity === whistleblowerSeverityFilter;
      return matchSearch && matchSeverity;
    });
  }, [whistleblowerReports, whistleblowerSearch, whistleblowerSeverityFilter]);

  const pendingSandboxCount = sandboxRequests.filter(r => r.status === 'PENDING').length;
  const criticalReportsCount = whistleblowerReports.filter(r => r.severity === 'CRITICAL' || r.status === 'NEW').length;
  const openInquiriesCount = inquiries.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-100">
      {/* Header Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                B2G Oversight Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Enclave Active
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal max-w-2xl">
              Platform-wide regulatory surveillance, sandbox pre-clearance, protected disclosures, and inter-agency data relays.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportAudit}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export Oversight Ledger
          </button>
        </div>
      </div>

      {/* Navigation Segment Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'DASHBOARD', label: 'Executive Dashboard', icon: Activity, count: null },
          { id: 'NATIONAL_SCANNER', label: 'National B2G Scanner', icon: Globe, count: null },
          { id: 'STAKEHOLDER_MATRIX', label: 'Agency Stakeholder Matrix', icon: Building2, count: null },
          { id: 'SOVEREIGN_HUB', label: 'Sovereign B2G Hub', icon: Scale, count: null },
          { id: 'DELTA_AUDITOR', label: 'Compliance Delta Auditor', icon: FileCheck2, count: null },
          { id: 'REGIONAL_RESIDENCY', label: 'Regional Data Residency', icon: Database, count: null },
          { id: 'REGULATORY_INTEL', label: 'Regulatory Intelligence', icon: ShieldCheck, count: null },
          { id: 'SANDBOX', label: 'Multi-Region Sandbox', icon: Box, count: pendingSandboxCount },
          { id: 'FILINGS', label: 'Regulatory Filings', icon: FileCheck2, count: filings.length },
          { id: 'FILING_TIMELINE', label: 'Statutory Filing Timeline', icon: Clock, count: null },
          { id: 'INQUIRIES', label: 'Active Inquiries', icon: Search, count: openInquiriesCount },
          { id: 'WHISTLEBLOWER', label: 'Protected Disclosures', icon: ShieldAlert, count: criticalReportsCount },
          { id: 'AGENCIES', label: 'Inter-Agency Relay', icon: Globe, count: agencyRequests.length },
          { id: 'ADVANCED_SUITE', label: 'Advanced B2G Suite', icon: Sparkles, count: null },
          { id: 'CONFIG', label: 'Billing & Enforcement Rules', icon: Sliders, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs border border-slate-200/80 dark:border-slate-700/80' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  tab.id === 'WHISTLEBLOWER' 
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Views */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <>
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Sandbox Queue', value: sandboxRequests.length, note: `${pendingSandboxCount} pending review`, icon: Box, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/40', tab: 'SANDBOX' },
                  { label: 'Verified Filings', value: filings.length, note: '100% hash integrity verified', icon: FileCheck2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40', tab: 'FILINGS' },
                  { label: 'Active Inquiries', value: inquiries.length, note: `${openInquiriesCount} awaiting entity response`, icon: Search, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40', tab: 'INQUIRIES' },
                  { label: 'Protected Disclosures', value: whistleblowerReports.length, note: `${criticalReportsCount} high-severity files`, icon: ShieldAlert, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/40', tab: 'WHISTLEBLOWER' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveTab(stat.tab as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {stat.label}
                        </span>
                        <div className={`p-2 rounded-xl border ${stat.bg} ${stat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                        <span>{stat.note}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Main 2-Column Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column: Activity Chart & Recent Critical Alerts */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Activity Timeline */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-500" />
                          Regulatory Event & Request Volume
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Weekly telemetry distribution of cross-border inquiries vs formal filings.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Inquiries
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Filings
                        </span>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { day: 'Mon', inqs: 14, filings: 9 },
                          { day: 'Tue', inqs: 22, filings: 15 },
                          { day: 'Wed', inqs: 18, filings: 24 },
                          { day: 'Thu', inqs: 28, filings: 19 },
                          { day: 'Fri', inqs: 35, filings: 31 },
                          { day: 'Sat', inqs: 12, filings: 8 },
                          { day: 'Sun', inqs: 9, filings: 5 },
                        ]}>
                          <defs>
                            <linearGradient id="colorInqs" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              borderRadius: '12px', 
                              border: 'none', 
                              color: '#fff',
                              fontSize: '12px',
                              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' 
                            }}
                          />
                          <Area type="monotone" dataKey="inqs" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInqs)" name="Inquiries" />
                          <Area type="monotone" dataKey="filings" stroke="#10b981" strokeWidth={2.5} fillOpacity={0} name="Filings" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Critical Disclosures Preview */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                          Priority Protected Disclosures
                        </h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab('WHISTLEBLOWER')} 
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        All Disclosures <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {whistleblowerReports.map((report) => (
                        <div 
                          key={report.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                              report.severity === 'CRITICAL' 
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300' 
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300'
                            }`}>
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                  {report.subject}
                                </h4>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {report.id}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Entity: <strong className="text-slate-700 dark:text-slate-200">{report.organizationName || 'Cross-Platform Disclosure'}</strong> • {report.isAnonymous ? 'Anonymized Source' : 'Identified Source'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              report.status === 'NEW' 
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            }`}>
                              {report.status}
                            </span>
                            <button 
                              onClick={() => setSelectedWhistleblower(report)}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Inspect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Pending Sandboxes & Health Breakdown */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Sandbox Fast Review */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                          Pending Sandboxes
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {pendingSandboxCount} in queue
                      </span>
                    </div>

                    <div className="space-y-3">
                      {sandboxRequests.filter(r => r.status === 'PENDING').slice(0, 3).map((req) => (
                        <div key={req.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{req.organizationName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{req.jurisdiction}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {req.proposedActivity}
                          </p>
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2">
                            <button 
                              onClick={() => handleSandboxStatus(req.id, 'APPROVED')}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button 
                              onClick={() => handleSandboxStatus(req.id, 'DENIED')}
                              className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Deny
                            </button>
                            <button 
                              onClick={() => setSelectedSandbox(req)}
                              className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                              title="Inspect Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {sandboxRequests.filter(r => r.status === 'PENDING').length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">No pending sandbox requests in queue.</p>
                      )}
                    </div>
                  </div>

                  {/* Jurisdiction Sovereign Health */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                        Jurisdiction Sovereignty Index
                      </h3>
                    </div>
                    <div className="space-y-3.5">
                      {[
                        { country: 'Germany (BfDI)', score: 94, status: 'Optimal' },
                        { country: 'France (CNIL)', score: 91, status: 'Optimal' },
                        { country: 'Ireland (DPC)', score: 87, status: 'Caution' },
                        { country: 'Netherlands (AP)', score: 93, status: 'Optimal' },
                        { country: 'Italy (Garante)', score: 84, status: 'Investigation' },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.country}</span>
                            <span className={`font-bold font-mono ${item.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {item.score}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-REGION SANDBOX & PRE-CLEARANCE */}
          {activeTab === 'SANDBOX' && (
            <div className="space-y-6">
              {/* Header with Sub-View Switcher */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Box className="w-5 h-5 text-indigo-500" />
                    Multi-Region Sandbox & Regulatory Filing Pre-Clearance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Configure country-specific regulatory templates, statutory jurisdiction rules, and isolated synthetic test environments for B2G filing gateways.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setSandboxViewMode('CONFIG')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        sandboxViewMode === 'CONFIG'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Multi-Region Config Panel</span>
                    </button>
                    <button
                      onClick={() => setSandboxViewMode('APPLICATIONS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        sandboxViewMode === 'APPLICATIONS'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Applications Queue ({sandboxRequests.length})</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => setIsNewSandboxOpen(true)}
                    className="px-3.5 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Sandbox</span>
                  </button>
                </div>
              </div>

              {/* View Switcher Output */}
              {sandboxViewMode === 'CONFIG' ? (
                <MultiRegionSandboxConfigPanel />
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs space-y-4 sm:space-y-6">
                  {/* Filters & Search */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search by organization, activity, or jurisdiction..."
                        value={sandboxSearch}
                        onChange={(e) => setSandboxSearch(e.target.value)}
                        className="w-full pl-9.5 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {sandboxSearch && (
                        <button onClick={() => setSandboxSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select 
                        value={sandboxStatusFilter}
                        onChange={(e) => setSandboxStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="DENIED">Denied</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                          <th className="px-4 py-3">Applicant Entity</th>
                          <th className="px-4 py-3">Proposed Activity & Technology</th>
                          <th className="px-4 py-3">Jurisdiction</th>
                          <th className="px-4 py-3">Requested Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredSandbox.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900 dark:text-slate-100">{req.organizationName}</div>
                              <div className="text-[10px] font-mono text-slate-400">{req.id}</div>
                            </td>
                            <td className="px-4 py-3.5 max-w-sm">
                              <div className="text-slate-800 dark:text-slate-200 line-clamp-1 font-medium">{req.proposedActivity}</div>
                              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{req.technologyUsed}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                                <Globe className="w-3 h-3 text-slate-400" />
                                {req.jurisdiction}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono">
                              {new Date(req.requestedAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                req.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                                req.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse' :
                                'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => setSelectedSandbox(req)}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  title="Inspect Full Proposal"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {req.status === 'PENDING' && (
                                  <>
                                    <button 
                                      onClick={() => handleSandboxStatus(req.id, 'APPROVED')}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                                      title="Approve"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleSandboxStatus(req.id, 'DENIED')}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                      title="Deny"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredSandbox.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-5 sm:py-8 text-center text-slate-400 text-xs">
                              No sandbox applications match your search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGULATORY FILINGS */}
          {activeTab === 'FILINGS' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-500" />
                    B2G Regulatory Filings & Sovereign Wizard
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Central repository of formal conformity declarations, DORA resilience reports, and AI Act compliance dossiers.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setFilingsViewMode('LIST')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filingsViewMode === 'LIST'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Filings Repository ({filings.length})
                    </button>
                    <button
                      onClick={() => setFilingsViewMode('WIZARD')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        filingsViewMode === 'WIZARD'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      AI Filing Wizard
                    </button>
                  </div>

                  <button
                    onClick={() => setIsFilingWizardOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Quick Modal Wizard</span>
                  </button>
                </div>
              </div>

              {filingsViewMode === 'WIZARD' ? (
                <B2gFilingWizard
                  onFilingSubmitted={(newF) => {
                    setFilings([newF, ...filings]);
                    showToast('Filing submitted & sealed! Saved to repository.', 'success');
                    setFilingsViewMode('LIST');
                  }}
                />
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs space-y-4 sm:space-y-6">
                  {/* Filter controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search by entity, filing title, or reference ID..."
                        value={filingSearch}
                        onChange={(e) => setFilingSearch(e.target.value)}
                        className="w-full pl-9.5 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {filingSearch && (
                        <button onClick={() => setFilingSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select 
                        value={filingTypeFilter}
                        onChange={(e) => setFilingTypeFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid of Filing Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredFilings.map((filing) => (
                      <div 
                        key={filing.id} 
                        className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              filing.status === 'ACCEPTED' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                              filing.status === 'UNDER_REVIEW' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                              'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            }`}>
                              {filing.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                            {filing.title}
                          </h4>
                          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight mt-1">
                            {filing.filingType}
                          </p>
                          
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Entity:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{filing.organizationName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Submitted:</span>
                              <span className="font-mono text-slate-600 dark:text-slate-400">{new Date(filing.submissionDate).toLocaleDateString()}</span>
                            </div>
                            {filing.auditor && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Auditor:</span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">{filing.auditor}</span>
                              </div>
                            )}
                            {filing.checksum && (
                              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                                <span>Seal:</span>
                                <span className="truncate max-w-[130px]">{filing.checksum}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedFiling(filing)}
                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect Bundle
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVE INQUIRIES */}
          {activeTab === 'INQUIRIES' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Search className="w-5 h-5 text-amber-500" />
                    Regulatory Inquiries & Adjudication
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Formal clarification inquiries dispatched to registered entities regarding algorithmic compliance and data processing practices.
                  </p>
                </div>
                <button 
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Initiate Formal Inquiry
                </button>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search by entity name, inquiry subject, or reference code..."
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    className="w-full pl-9.5 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={inquiryPriorityFilter}
                    onChange={(e) => setInquiryPriorityFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              {/* List */}
              <div className="space-y-3">
                {filteredInquiries.map((inq) => (
                  <div 
                    key={inq.id} 
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        inq.priority === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600' :
                        inq.priority === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' :
                        'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{inq.subject}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                            {inq.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Entity: <strong className="text-slate-700 dark:text-slate-200">{inq.organizationName}</strong> • Article: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{inq.regulationArticle}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">{inq.status.replace('_', ' ')}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedInquiry(inq)}
                        className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                        Inquiry Thread
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROTECTED DISCLOSURES (WHISTLEBLOWER) */}
          {activeTab === 'WHISTLEBLOWER' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Sovereign Integrity Header Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Cryptographically Protected Whistleblower Ledger
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Zero-Knowledge verified reporting channel. Identity markers are cryptographically sealed under EU Whistleblower Directive 2019/1937.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={handleRotateKeys}
                    disabled={isRotatingKeys}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRotatingKeys ? 'animate-spin' : ''}`} />
                    {isRotatingKeys ? 'Rotating Keys...' : 'Rotate Key Enclave'}
                  </button>
                </div>
              </div>

              {/* Main Whistleblower List */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search reports by subject or entity..."
                      value={whistleblowerSearch}
                      onChange={(e) => setWhistleblowerSearch(e.target.value)}
                      className="w-full pl-9.5 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <select 
                    value={whistleblowerSeverityFilter}
                    onChange={(e) => setWhistleblowerSeverityFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {filteredWhistleblower.map((report) => (
                    <div 
                      key={report.id}
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            report.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' :
                            'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}>
                            {report.severity}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{report.subject}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                          <span>{report.id}</span>
                          <span>•</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {report.description}
                      </p>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-medium">Entity:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{report.organizationName || 'Cross-Platform Disclosure'}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs">{report.encryptedHash}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select 
                            value={report.status}
                            onChange={(e) => handleWhistleblowerStatus(report.id, e.target.value as any)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                          >
                            <option value="NEW">New</option>
                            <option value="INVESTIGATING">Investigating</option>
                            <option value="ACTION_TAKEN">Action Taken</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                          <button 
                            onClick={() => setSelectedWhistleblower(report)}
                            className="px-3 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors"
                          >
                            Secure Channel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AGENCY STAKEHOLDER MATRIX */}
          {activeTab === 'STAKEHOLDER_MATRIX' && (
            <AgencyStakeholderMatrix />
          )}

          {/* TAB 6: INTER-AGENCY RELAY */}
          {activeTab === 'AGENCIES' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-500" />
                        Inter-Agency Data Relay Logs
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Cryptographic ledger of mutual assistance data exchanges between European regulatory authorities.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {agencyRequests.map((req) => (
                      <div key={req.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                              {req.id}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{req.purpose}</h4>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                            {req.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Requesting Authority</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{req.requestingAgency}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Responding Authority</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{req.respondingAgency}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Data Transferred:</span> {req.dataRequested}
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Legal Citation: {req.legalBasis}</span>
                          <button 
                            onClick={() => setSelectedAgencyReq(req)}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            Inspect Cryptographic Proofs <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Registered Partner Authorities */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Verified Member DPAs
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: 'EDPB (European Data Protection Board)', jurisdiction: 'EU Wide', verified: true },
                      { name: 'BfDI (Federal Commissioner for Data Protection)', jurisdiction: 'Germany', verified: true },
                      { name: 'CNIL (Data Protection Authority)', jurisdiction: 'France', verified: true },
                      { name: 'DPC (Data Protection Commission)', jurisdiction: 'Ireland', verified: true },
                      { name: 'Garante per la protezione dei dati', jurisdiction: 'Italy', verified: true },
                      { name: 'AEPD (Agencia Española Protección Datos)', jurisdiction: 'Spain', verified: true },
                    ].map((auth, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{auth.name}</p>
                          <span className="text-[10px] text-slate-400">{auth.jurisdiction}</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setIsAddAgencyOpen(true)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register Authority Body
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ADVANCED B2G SUITE */}
          {activeTab === 'ADVANCED_SUITE' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setAdvancedSuiteSubTab('REGIONAL')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'REGIONAL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🌐 Regional Sovereignty Grid
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('CTC')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'CTC' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  CTC / Real-Time E-Invoicing
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('AI_ACT')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'AI_ACT' ? 'bg-cyan-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  EU AI Act PMM Relay
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('NIS2')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'NIS2' ? 'bg-rose-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  NIS2 Incident Dispatch Hub
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('SUBPOENA')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'SUBPOENA' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sovereign Subpoena Gateway
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('PARSERS')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'PARSERS' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  XBRL / SAF-T Parsers
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('PROCUREMENT')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'PROCUREMENT' ? 'bg-amber-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Procurement Qualification
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('SETTLEMENT')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'SETTLEMENT' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Central Bank Clearing
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('EVIDENCE')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'EVIDENCE' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Judicial RFC 3161
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('OSS')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'OSS' ? 'bg-rose-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  OSS Mechanism
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('DELTA_AUDITOR')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'DELTA_AUDITOR' ? 'bg-rose-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Compliance Delta Auditor
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('RESIDENCY_CONFIG')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'RESIDENCY_CONFIG' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Data Residency Config
                </button>
                <button
                  onClick={() => setAdvancedSuiteSubTab('INTEL_RADAR')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    advancedSuiteSubTab === 'INTEL_RADAR' ? 'bg-cyan-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Regulatory Intel Radar
                </button>
              </div>

              {advancedSuiteSubTab === 'REGIONAL' && <RegionalSovereignCommandGrid />}
              {advancedSuiteSubTab === 'CTC' && <CtcEInvoicingGateway />}
              {advancedSuiteSubTab === 'AI_ACT' && <AiActPmmRelay />}
              {advancedSuiteSubTab === 'NIS2' && <Nis2IncidentDispatchHub />}
              {advancedSuiteSubTab === 'SUBPOENA' && <SovereignSubpoenaGateway />}
              {advancedSuiteSubTab === 'PARSERS' && <XmlParsersHub />}
              {advancedSuiteSubTab === 'PROCUREMENT' && <ProcurementQualificationEngine />}
              {advancedSuiteSubTab === 'SETTLEMENT' && <CentralBankClearingTracker />}
              {advancedSuiteSubTab === 'EVIDENCE' && <JudicialEvidenceContainer />}
              {advancedSuiteSubTab === 'OSS' && <OssCrossBorderMechanism />}
              {advancedSuiteSubTab === 'DELTA_AUDITOR' && <ComplianceDeltaAuditor />}
              {advancedSuiteSubTab === 'RESIDENCY_CONFIG' && <RegionalDataResidencyConfigManager role="SUPER_ADMIN" />}
              {advancedSuiteSubTab === 'INTEL_RADAR' && <RegulatoryIntelligenceRadar role="SUPER_ADMIN" />}
            </div>
          )}

          {/* TAB: SOVEREIGN COMPLIANCE HUB */}
          {activeTab === 'SOVEREIGN_HUB' && (
            <div className="space-y-6">
              <SovereignComplianceHub />
            </div>
          )}

          {/* TAB: COMPLIANCE DELTA AUDITOR */}
          {activeTab === 'DELTA_AUDITOR' && (
            <div className="space-y-6">
              <ComplianceDeltaAuditor />
            </div>
          )}

          {/* TAB: REGIONAL DATA RESIDENCY CONFIG */}
          {activeTab === 'REGIONAL_RESIDENCY' && (
            <div className="space-y-6">
              <AdvancedMultiRegionB2gEngine role="SUPER_ADMIN" />
              <RegionalDataResidencyConfigManager role="SUPER_ADMIN" />
              <RegionalSovereignCommandGrid />
            </div>
          )}

          {/* TAB: REGULATORY INTELLIGENCE RADAR */}
          {activeTab === 'REGULATORY_INTEL' && (
            <div className="space-y-6">
              <RegulatoryIntelligenceRadar role="SUPER_ADMIN" />
            </div>
          )}

          {/* TAB: NATIONAL B2G SCANNER */}
          {activeTab === 'NATIONAL_SCANNER' && (
            <div className="space-y-6">
              <NationalB2gScanningEngine />
            </div>
          )}

          {/* TAB: STATUTORY FILING WORKFLOW TIMELINE */}
          {activeTab === 'FILING_TIMELINE' && (
            <div className="space-y-6">
              <B2gFilingWorkflowTimeline />
            </div>
          )}

          {/* TAB 8: POLICY & BILLING CONFIG */}
          {activeTab === 'CONFIG' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-xs space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-500" />
                  SaaS Admin Oversight Config & Automated Billing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Directly override tenant billing credentials, dispatch billing, configure webhook triggers, or simulate law violations as a SaaS administrator.
                </p>
              </div>
              <RegionalDataResidencyConfigManager role="SUPER_ADMIN" />
              <B2gAdvancedEnforcementConfig />
            </div>
          )}
        </>
      )}

      {/* INSPECTION MODAL: SANDBOX PROPOSAL */}
      <AnimatePresence>
        {selectedSandbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-xl w-full shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                    {selectedSandbox.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedSandbox.organizationName}
                  </h3>
                  <p className="text-xs text-slate-400">Jurisdiction: {selectedSandbox.jurisdiction}</p>
                </div>
                <button onClick={() => setSelectedSandbox(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Proposed Activity</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{selectedSandbox.proposedActivity}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Technology Stack</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{selectedSandbox.technologyUsed}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Data Ingestion Scope</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{selectedSandbox.dataCategories}</p>
                  </div>
                </div>

                {selectedSandbox.notes && (
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300">
                    <span className="text-[10px] uppercase font-bold block mb-0.5">Auditor Notes</span>
                    <p>{selectedSandbox.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setSelectedSandbox(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
                {selectedSandbox.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleSandboxStatus(selectedSandbox.id, 'DENIED')}
                      className="px-4 py-2 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold"
                    >
                      Deny Request
                    </button>
                    <button 
                      onClick={() => handleSandboxStatus(selectedSandbox.id, 'APPROVED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                    >
                      Grant Sandbox Pre-Clearance
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSPECTION MODAL: FILING BUNDLE */}
      <AnimatePresence>
        {selectedFiling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-xl w-full shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {selectedFiling.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedFiling.title}
                  </h3>
                  <p className="text-xs text-slate-400">Entity: {selectedFiling.organizationName}</p>
                </div>
                <button onClick={() => setSelectedFiling(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Framework / Type:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedFiling.filingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submission Date:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(selectedFiling.submissionDate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Independent Auditor:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{selectedFiling.auditor || 'Internal Sovereign Attestation'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-bold">Cryptographic Checksum</span>
                  <p className="text-emerald-400 break-all">{selectedFiling.checksum || 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleFilingStatus(selectedFiling.id, 'ACCEPTED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Accept Filing
                  </button>
                  <button 
                    onClick={() => handleFilingStatus(selectedFiling.id, 'REJECTED')}
                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold"
                  >
                    Reject Filing
                  </button>
                </div>
                <button 
                  onClick={() => {
                    showToast(`Evidence bundle ${selectedFiling.id} downloaded`, 'success');
                    setSelectedFiling(null);
                  }}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download JSON-LD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSPECTION MODAL: INQUIRY THREAD */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-xl w-full shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                    {selectedInquiry.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedInquiry.subject}
                  </h3>
                  <p className="text-xs text-slate-400">Target Entity: {selectedInquiry.organizationName}</p>
                </div>
                <button onClick={() => setSelectedInquiry(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Regulation Article:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedInquiry.regulationArticle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Priority Level:</span>
                  <span className="font-bold uppercase text-slate-800 dark:text-slate-200">{selectedInquiry.priority}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-700/50 leading-relaxed">
                  {selectedInquiry.details}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Dispatch Regulatory Note / Status Update:</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleInquiryStatus(selectedInquiry.id, 'IN_PROGRESS')}
                    className="flex-1 py-2 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold"
                  >
                    Mark In Progress
                  </button>
                  <button 
                    onClick={() => handleInquiryStatus(selectedInquiry.id, 'RESOLVED')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSPECTION MODAL: WHISTLEBLOWER SECURE CHANNEL */}
      <AnimatePresence>
        {selectedWhistleblower && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-xl w-full shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 text-rose-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Case {selectedWhistleblower.id} — Anonymous Relay
                    </h3>
                    <p className="text-xs text-slate-400">Zero-Knowledge Sealed Disclosure</p>
                  </div>
                </div>
                <button onClick={() => setSelectedWhistleblower(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported Discrepancy</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedWhistleblower.subject}</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">{selectedWhistleblower.description}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Send Anonymous PGP-Encrypted Reply:</span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Type official regulatory query to the whistleblower..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                  <button 
                    onClick={handleSendReply}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTER NEW INQUIRY */}
      <AnimatePresence>
        {isInquiryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-500" />
                  Initiate Formal Regulatory Inquiry
                </h3>
                <button onClick={() => setIsInquiryModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInquiry} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Organization / Entity</label>
                  <input 
                    type="text"
                    placeholder="e.g. Global Telecom Networks"
                    value={newInquiryOrg}
                    onChange={(e) => setNewInquiryOrg(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Inquiry Subject</label>
                  <input 
                    type="text"
                    placeholder="e.g. Inadequate data retention purge logs"
                    value={newInquirySubject}
                    onChange={(e) => setNewInquirySubject(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Regulatory Article</label>
                    <input 
                      type="text"
                      value={newInquiryArticle}
                      onChange={(e) => setNewInquiryArticle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Priority</label>
                    <select 
                      value={newInquiryPriority}
                      onChange={(e) => setNewInquiryPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Detailed Technical Request</label>
                  <textarea 
                    rows={3}
                    placeholder="Specify exact telemetry, API logs, or conformity documents requested..."
                    value={newInquiryDetails}
                    onChange={(e) => setNewInquiryDetails(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsInquiryModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Dispatch Official Inquiry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTER NEW SANDBOX */}
      <AnimatePresence>
        {isNewSandboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-500" />
                  Pre-Clear New Regulatory Sandbox
                </h3>
                <button onClick={() => setIsNewSandboxOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSandbox} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Organization Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. AeroAutonomous Systems"
                    value={newSandboxOrg}
                    onChange={(e) => setNewSandboxOrg(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Proposed Activity</label>
                  <input 
                    type="text"
                    placeholder="e.g. Synthetic data generation for medical imaging"
                    value={newSandboxActivity}
                    onChange={(e) => setNewSandboxActivity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Technology Used</label>
                    <input 
                      type="text"
                      placeholder="e.g. Diffusion Models / Enclave"
                      value={newSandboxTech}
                      onChange={(e) => setNewSandboxTech(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Jurisdiction</label>
                    <select 
                      value={newSandboxJurisdiction}
                      onChange={(e) => setNewSandboxJurisdiction(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="Germany">Germany (BfDI)</option>
                      <option value="France">France (CNIL)</option>
                      <option value="Ireland">Ireland (DPC)</option>
                      <option value="Netherlands">Netherlands (AP)</option>
                      <option value="Spain">Spain (AEPD)</option>
                      <option value="All EU">All EU Central Enclave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Data Ingestion Categories</label>
                  <input 
                    type="text"
                    placeholder="e.g. Anonymized EHR records, telemetry metadata"
                    value={newSandboxCategories}
                    onChange={(e) => setNewSandboxCategories(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsNewSandboxOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Register Sandbox
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD TRUSTED AGENCY */}
      <AnimatePresence>
        {isAddAgencyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  Register Trusted Regulatory Authority
                </h3>
                <button onClick={() => setIsAddAgencyOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAgency} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Authority Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Datatilsynet (Denmark)"
                    value={newAgencyName}
                    onChange={(e) => setNewAgencyName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Country / Jurisdiction</label>
                  <input 
                    type="text"
                    placeholder="e.g. Denmark"
                    value={newAgencyCountry}
                    onChange={(e) => setNewAgencyCountry(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsAddAgencyOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Register Authority
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FilingWizardModal
        isOpen={isFilingWizardOpen}
        onClose={() => setIsFilingWizardOpen(false)}
        onFilingSubmitted={(newF) => {
          setFilings([newF, ...filings]);
          showToast('Official filing submitted and cryptographically sealed successfully.', 'success');
        }}
      />
    </div>
  );
};
