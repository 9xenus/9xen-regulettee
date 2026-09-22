import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Terminal, 
  ShieldAlert, 
  Mail, 
  Calendar, 
  Play, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
  Briefcase, 
  Globe, 
  Database, 
  Zap, 
  Sliders, 
  Maximize2, 
  Plus, 
  TrendingUp, 
  Clock, 
  X,
  Check,
  Building2,
  Trash2,
  AlertOctagon,
  Pause,
  ArrowRight,
  Sparkles,
  Loader2,
  Layers,
  Gavel,
  Bot,
  Activity,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { B2gPenaltyD3Chart } from '../components/dashboard/B2gPenaltyD3Chart';
import { ExportPdfDialog } from '../components/ExportPdfDialog';
import { useNotification } from '../context/NotificationContext';
import { B2gAdvancedEnforcementConfig } from '../components/dashboard/B2gAdvancedEnforcementConfig';
import { SovereignRegionalScanner } from '../components/dashboard/SovereignRegionalScanner';
import { AutomatedEnforcementEngine } from '../components/AutomatedEnforcementEngine';
import { B2gLangGraphEngine } from '../components/B2gLangGraphEngine';
import { B2gReportGenerator } from '../components/dashboard/B2gReportGenerator';
import { RegulatoryNewsFeed } from '../components/dashboard/RegulatoryNewsFeed';
import { ComplianceHealthScoreWidget } from '../components/dashboard/ComplianceHealthScoreWidget';
import { SimulateImpact } from '../components/SimulateImpact';
import { ComplianceCalendar } from '../components/dashboard/ComplianceCalendar';
import { AlertService } from '../services/alert-service';
import { getB2gBillingConfig, dispatchB2gInvoiceEmail } from '../utils/b2gBilling';

import { B2gCriticalFindings } from '../components/dashboard/B2gCriticalFindings';
import { XmlParsersHub } from '../components/b2g/XmlParsersHub';
import { ProcurementQualificationEngine } from '../components/b2g/ProcurementQualificationEngine';
import { CentralBankClearingTracker } from '../components/b2g/CentralBankClearingTracker';
import { JudicialEvidenceContainer } from '../components/b2g/JudicialEvidenceContainer';
import { OssCrossBorderMechanism } from '../components/b2g/OssCrossBorderMechanism';
import { Nis2IncidentDispatchHub } from '../components/b2g/Nis2IncidentDispatchHub';
import { CyberScanRemediationSuite } from '../components/b2g/CyberScanRemediationSuite';
import { B2gEnforcementPipeline } from '../components/b2g/B2gEnforcementPipeline';
import { ComplianceAuditPipeline } from '../components/b2g/ComplianceAuditPipeline';
import { NationalIntelWarroom } from '../components/b2g/NationalIntelWarroom';
import { SovereignSubpoenaGateway } from '../components/b2g/SovereignSubpoenaGateway';
import { CtcEInvoicingGateway } from '../components/b2g/CtcEInvoicingGateway';
import { AiActPmmRelay } from '../components/b2g/AiActPmmRelay';
import { RegionalSovereignCommandGrid } from '../components/b2g/RegionalSovereignCommandGrid';
import { NationalB2gScanningEngine } from '../components/b2g/NationalB2gScanningEngine';
import { B2gFilingWorkflowTimeline } from '../components/b2g/B2gFilingWorkflowTimeline';

// Model definitions for B2G service
interface B2GRequest {
  id: string;
  regulatorName: string;
  title: string;
  industry: string;
  law: string;
  regionalScope: string;
  description: string;
  minRiskThreshold: number;
  enforcementAction: 'API_THROTTLE' | 'LOCK_CERTIFICATE' | 'AUTO_FINE' | 'FEATURE_SUSPENSION';
  fineAmount?: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  requestedAt: string;
}

interface ScanResult {
  id: string;
  tenantId: string;
  tenantName: string;
  industry: string;
  lawChecked: string;
  website: string;
  status: 'COMPLIANT' | 'VIOLATION_DETECTED';
  violationDetails?: string;
  timestamp: string;
  penaltyEnforced?: string;
  fineApplied?: number;
  emailSentTo?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
  escalationLevel?: number;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  pendingPenalty?: string;
  pendingFine?: number;
  signature?: string;
  appealStatus?: 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  appealEvidence?: string;
  appealSummary?: string;
  multiPartyDispatched?: boolean;
}

export const classifyViolation = (details: string | undefined, law: string): { severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', tags: string[] } => {
  if (!details) return { severity: 'LOW', tags: ['Compliant'] };
  const lowerDetails = details.toLowerCase();
  
  const lawMatch = law.match(/^(GDPR|EU AI Act|NIS2|DORA)/);
  const baseTag = lawMatch ? lawMatch[0] : law.split(' ')[0];
  const tags: string[] = [baseTag];

  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

  if (lowerDetails.includes('critical') || lowerDetails.includes('high-risk') || lowerDetails.includes('unregistered') || lowerDetails.includes('biometric') || lowerDetails.includes('neural')) {
    severity = 'CRITICAL';
    tags.push('Severe Risk');
  } else if (lowerDetails.includes('weak') || lowerDetails.includes('exceeds')) {
    severity = 'HIGH';
    tags.push('Security Flaw');
  } else {
    severity = 'MEDIUM';
    tags.push('General Infraction');
  }

  if (lowerDetails.includes('biometric') || lowerDetails.includes('neural')) tags.push('AI/Biometrics');
  if (lowerDetails.includes('encryption') || lowerDetails.includes('cipher') || lowerDetails.includes('aes') || lowerDetails.includes('ssl') || lowerDetails.includes('hash')) tags.push('Cryptography');
  if (lowerDetails.includes('retention') || lowerDetails.includes('days') || lowerDetails.includes('storage')) tags.push('Data Retention');
  if (lowerDetails.includes('gateway') || lowerDetails.includes('endpoint')) tags.push('Network');

  return { severity, tags: Array.from(new Set(tags)) };
};

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  tenantName: string;
  violationType: string;
  timestamp: string;
  status: 'DELIVERED' | 'FAILED';
}

interface ScheduleRule {
  id: string;
  name: string;
  industry: string;
  law: string;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'CRON';
  cronExpression?: string;
  nextRun: string;
  isActive: boolean;
  targetScope: string;
}

// Default initial datasets to mock durable database operations via localStorage
const INITIAL_B2G_REQUESTS: B2GRequest[] = [
  {
    id: "req-101",
    regulatorName: "EDPB (European Data Protection Board)",
    title: "Anti-Storage-Limit Creep surveillance",
    industry: "Fintech",
    law: "GDPR Article 5e (Storage Limitation)",
    regionalScope: "All EU / EEA",
    description: "Scan tenant DB schemas for parameters holding user log logs for 365+ days without explicit justification tokens.",
    minRiskThreshold: 75,
    enforcementAction: "AUTO_FINE",
    fineAmount: 250000,
    status: "PENDING",
    requestedAt: "2026-06-29T14:30:00Z"
  },
  {
    id: "req-102",
    regulatorName: "EIAO (EU AI Office)",
    title: "Unregistered High-Risk AI Model Auditing",
    industry: "AI Labs",
    law: "EU AI Act Chapter III (High-Risk AI Systems)",
    regionalScope: "Germany & France",
    description: "Identify unregistered high-risk generative weights or automated decision pipelines operating without conformity logs.",
    minRiskThreshold: 80,
    enforcementAction: "FEATURE_SUSPENSION",
    status: "PENDING",
    requestedAt: "2026-06-30T09:15:00Z"
  },
  {
    id: "req-103",
    regulatorName: "BaFin Compliance Division",
    title: "DORA Resiliency Threat Audits",
    industry: "Fintech",
    law: "DORA Article 14 (ICT Systems)",
    regionalScope: "Germany",
    description: "Automated verification of disaster recovery replication frequency and secure signature algorithms.",
    minRiskThreshold: 60,
    enforcementAction: "API_THROTTLE",
    status: "APPROVED",
    requestedAt: "2026-06-25T11:00:00Z"
  }
];

const INITIAL_SCHEDULES: ScheduleRule[] = [
  {
    id: "sched-1",
    name: "Midnight Fintech GDPR Scan",
    industry: "Fintech",
    law: "GDPR Article 5e (Storage Limitation)",
    frequency: "DAILY",
    nextRun: "2026-07-01T23:59:59Z",
    isActive: true,
    targetScope: "All active German tenants"
  },
  {
    id: "sched-2",
    name: "Weekly AI Act Compliance Crawl",
    industry: "AI Labs",
    law: "EU AI Act Chapter III",
    frequency: "WEEKLY",
    nextRun: "2026-07-06T00:00:00Z",
    isActive: false,
    targetScope: "All registered AI developers"
  }
];

const INITIAL_SCAN_RESULTS: ScanResult[] = [
  {
    id: "scan-1",
    tenantId: "tenant_1",
    tenantName: "Acme Financial EU",
    industry: "Fintech",
    lawChecked: "GDPR Article 5e (Storage Limitation)",
    website: "https://api.acmefinance.de/v1/auth",
    status: "COMPLIANT",
    timestamp: "2026-06-30T18:00:00Z",
    ...classifyViolation(undefined, "GDPR Article 5e (Storage Limitation)")
  },
  {
    id: "scan-2",
    tenantId: "tenant_2",
    tenantName: "Global Health Systems",
    industry: "Healthcare",
    lawChecked: "NIS2 Article 21 (Risk Management)",
    website: "https://health.globaltelecom.fr/portal",
    status: "VIOLATION_DETECTED",
    violationDetails: "Encryption key rotation exceeds 180-day grace period. Weak AES-128 configurations found on public API Gateway endpoints.",
    timestamp: "2026-06-30T22:45:00Z",
    penaltyEnforced: "API_THROTTLE",
    emailSentTo: "compliance-officer@globalhealth.fr",
    escalationLevel: 1,
    ...classifyViolation("Encryption key rotation exceeds 180-day grace period. Weak AES-128 configurations found on public API Gateway endpoints.", "NIS2 Article 21 (Risk Management)")
  },
  {
    id: "scan-3",
    tenantId: "tenant_3",
    tenantName: "TechStartup AI",
    industry: "AI Labs",
    lawChecked: "EU AI Act Chapter III",
    website: "https://llm.techstartup.ai/inference",
    status: "VIOLATION_DETECTED",
    violationDetails: "Active high-risk biometric profiling algorithm detected without certified EU Conformity Registration ID.",
    timestamp: "2026-06-30T23:15:00Z",
    penaltyEnforced: "FEATURE_SUSPENSION",
    emailSentTo: "admin@techstartup.ai",
    escalationLevel: 1,
    ...classifyViolation("Active high-risk biometric profiling algorithm detected without certified EU Conformity Registration ID.", "EU AI Act Chapter III")
  }
];

const INITIAL_EMAIL_LOGS: EmailLog[] = [
  {
    id: "mail-1",
    to: "compliance-officer@globalhealth.fr",
    subject: "⚠️ OFFICIAL WARNING: SaaS Automated Law Violation Detected (NIS2)",
    tenantName: "Global Health Systems",
    violationType: "NIS2 Encryption Deficiency",
    timestamp: "2026-06-30T22:45:15Z",
    status: "DELIVERED",
    body: "Dear Authority,\n\nThis is an automated enforcement notice dispatched by the Nonaxen B2G Compliance Engine. Your organization 'Global Health Systems' has triggered a severe compliance violation:\n\n- Standard Checked: NIS2 Article 21 (Risk Management)\n- Violation: Encryption key rotation exceeds 180-day grace period.\n- Enforcement Action Applied: SaaS API Throttling (80% request capacity limit reduction applied instantly).\n\nPlease rotate all ciphers and update security parameters to lift this penalty. For appeals, submit formal evidence via the Liaison Module within 14 business days.\n\nBest regards,\nB2G Regulatory Automation Service"
  },
  {
    id: "mail-2",
    to: "admin@techstartup.ai",
    subject: "🚨 RECOURSE MANDATE: Automated EU AI Act Violation Warning & Suspension",
    tenantName: "TechStartup AI",
    violationType: "Unregistered High-Risk Model",
    timestamp: "2026-06-30T23:15:20Z",
    status: "DELIVERED",
    body: "Dear Authority,\n\nYour organization 'TechStartup AI' has triggered a high-severity compliance violation verified by the Automated EU AI Act Auditor:\n\n- Standard Checked: EU AI Act Chapter III (Conformity Auditing)\n- Violation: Active high-risk biometric profiling algorithm deployed without certified EU Conformity Registration ID.\n- Enforcement Action Applied: Immediate SaaS Feature Suspension of model pipeline endpoints.\n\nTo lift the restriction, complete your conformity documentation and submit for approval.\n\nSincerely,\nEU AI Office Automation Hub"
  }
];

const CALENDAR_EVENTS = [
  {
    id: "e-1",
    title: "EU AI Act High-Risk Registration Deadline",
    date: "2026-07-20",
    type: "regulatory" as const,
    description: "All biometric and profiling algorithms must be formally logged with EU AI Office."
  },
  {
    id: "e-2",
    title: "GDPR Article 30 Annual Audit Reporting",
    date: "2026-07-15",
    type: "regulatory" as const,
    description: "Mandatory RoPA submission due for all Fintech and Healthtech operations."
  },
  {
    id: "e-3",
    title: "Automated Mid-Month Compliance Scan",
    date: "2026-07-15",
    type: "certification" as const,
    description: "Scheduled batch scan across all registered CAAS tenants."
  },
  {
    id: "e-4",
    title: "NIS2 Incident Response Certification",
    date: "2026-07-28",
    type: "certification" as const,
    description: "Recertification window closes for critical infrastructure SaaS partners."
  }
];

export const B2gOperations: React.FC = () => {
  const { showToast } = useNotification();

  const logEvent = async (event: {
    id: string;
    action_type: string;
    status: string;
    severity: string;
    service_module: string;
    target_resource: string;
    details: string;
  }) => {
    try {
      await fetchWithRetry('/api/v1/consent/log-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to dispatch event to audit ledger:', error);
    }
  };

  // Sync states with LocalStorage to provide robust simulation persistence
  const [b2gRequests, setB2gRequests] = useState<B2GRequest[]>(() => {
    try {
      const saved = localStorage.getItem('b2g_service_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse b2g_service_requests:', e);
    }
    return INITIAL_B2G_REQUESTS;
  });

  const [schedules, setSchedules] = useState<ScheduleRule[]>(() => {
    try {
      const saved = localStorage.getItem('b2g_schedules');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse b2g_schedules:', e);
    }
    return INITIAL_SCHEDULES;
  });

  const [scanResults, setScanResults] = useState<ScanResult[]>(() => {
    try {
      const saved = localStorage.getItem('b2g_scan_results');
      if (saved) {
        const parsed: ScanResult[] = JSON.parse(saved);
        // Migration: backfill severity and tags for old data
        return parsed.map(r => {
          if (!r.severity || !r.tags) {
            const { severity, tags } = classifyViolation(r.violationDetails, r.lawChecked);
            return { ...r, severity, tags };
          }
          return r;
        });
      }
    } catch (e) {
      console.error('Failed to parse b2g_scan_results:', e);
    }
    return INITIAL_SCAN_RESULTS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    try {
      const saved = localStorage.getItem('b2g_email_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse b2g_email_logs:', e);
    }
    return INITIAL_EMAIL_LOGS;
  });

  // UI state variables
  const [activeSubTab, setActiveSubTab] = useState<'NATIONAL_SCANNER' | 'COMMAND_CENTER' | 'FILING_TIMELINES' | 'SERVICE_REQUESTS' | 'SCHEDULES' | 'ENFORCEMENTS' | 'EMAILS' | 'REPORTING' | 'CALENDAR' | 'ADVANCED_SUITE' | 'COMMISSIONS' | 'CYBER_DEFENSE' | 'ENFORCEMENT_PIPELINE' | 'AUDIT_PIPELINE' | 'INTEL_WARROOM'>('COMMAND_CENTER');
  const [advancedSuiteTab, setAdvancedSuiteTab] = useState<'PARSERS' | 'PROCUREMENT' | 'SETTLEMENT' | 'EVIDENCE' | 'OSS' | 'NIS2' | 'SUBPOENA' | 'CTC' | 'AI_ACT' | 'REGIONAL' | 'TIMELINE'>('REGIONAL');
  const [selectedReqForImpact, setSelectedReqForImpact] = useState<string | null>(null);
  const [autoEnforceMode, setAutoEnforceMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('b2g_auto_enforce');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse b2g_auto_enforce:', e);
    }
    return true;
  });

  const [selectedScanIds, setSelectedScanIds] = useState<string[]>([]);

  // Filter state for scanner
  const [filterIndustry, setFilterIndustry] = useState<string>('All');
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [filterLaw, setFilterLaw] = useState<string>('All');
  const [filterTenant, setFilterTenant] = useState<string>('All');
  const [customWebsite, setCustomWebsite] = useState<string>('');

  // Scanning simulation state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeScanTarget, setActiveScanTarget] = useState<string>('');
  
  // Modals / Details
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [showNewScheduleModal, setShowNewScheduleModal] = useState<boolean>(false);
  const [selectedTimelineScan, setSelectedTimelineScan] = useState<ScanResult | null>(null);
  const [draftedLegalResponse, setDraftedLegalResponse] = useState<string | null>(null);
  const [isDraftingResponse, setIsDraftingResponse] = useState<boolean>(false);
  
  // Signature Gate
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signingScanIds, setSigningScanIds] = useState<string[]>([]);
  const [signatureName, setSignatureName] = useState('');
  
  // Appeal Modal
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealingScanId, setAppealingScanId] = useState<string | null>(null);
  const [appealEvidence, setAppealEvidence] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [isGeneratingCommissionPdf, setIsGeneratingCommissionPdf] = useState(false);

  const handleExportCommissionPdf = async () => {
    setIsGeneratingCommissionPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      const config = getB2gBillingConfig();

      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("9Xen Regulettee - B2G Country Penalty Commissions", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Report Type: SaaS Administrative Commission Ledger`, 14, 28);
      doc.text(`Generated At: ${new Date().toLocaleString()}`, 14, 34);

      // 1. Commission Rates Table
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Configured Country Commission Rates", 14, 46);

      const rateRows = Object.entries(config.countryCommissions || {}).map(([country, rate]) => [
        country,
        `${rate}%`,
        `${config.b2gVatRate}%`,
        'Active'
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Sovereign Region', 'Commission Rate', 'Applicable VAT', 'Status']],
        body: rateRows,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });

      // 2. Recent Penalty Invoices Table
      const finalY = (doc as any).lastAutoTable.finalY || 90;
      doc.setFontSize(14);
      doc.text("Recent Regulatory Penalty Invoices (Commissioned)", 14, finalY + 14);

      const penaltyRes = scanResults.filter(r => r.penaltyEnforced || r.fineApplied);
      const penaltyRows: any[][] = penaltyRes.slice(0, 15).map(res => {
        let country = 'EU Region';
        if (res.website.includes('.de')) country = 'Germany';
        else if (res.website.includes('.fr')) country = 'France';
        else if (res.website.includes('.ie')) country = 'Ireland';
        else if (res.website.includes('.nl')) country = 'Netherlands';
        
        const rate = (config.countryCommissions as any)?.[country] || config.b2gCommissionRate;
        const amount = res.fineApplied || 0;
        const commission = (amount * rate) / 100;

        return [
          res.id.split('-').pop(),
          res.tenantName,
          country,
          `EUR ${amount.toLocaleString()}`,
          `${rate}%`,
          `EUR ${commission.toLocaleString()}`
        ];
      });

      autoTable(doc, {
        startY: finalY + 18,
        head: [['ID', 'Tenant', 'Region', 'Fine Amount', 'Rate', 'SaaS Commission']],
        body: penaltyRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
      });

      doc.save(`9Xen_Regulettee_B2G_Penalty_Commissions_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Commission Report exported successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to generate PDF: ' + err.message, 'error');
    } finally {
      setIsGeneratingCommissionPdf(false);
    }
  };
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [showRegionalScanner, setShowRegionalScanner] = useState(false);
  const [showEnforcementEngine, setShowEnforcementEngine] = useState(false);
  const [showLangGraphEngine, setShowLangGraphEngine] = useState(false);
  const [selectedEnforcementTenantId, setSelectedEnforcementTenantId] = useState<string>('');

  // Advanced Scanning Configuration
  const [isDeepScan, setIsDeepScan] = useState<boolean>(false);
  const [verifyAiClauses, setVerifyAiClauses] = useState<boolean>(true);
  const [analyzeCrossBorderFlows, setAnalyzeCrossBorderFlows] = useState<boolean>(false);
  const [dryRunMode, setDryRunMode] = useState<boolean>(false);
  const [scannerThreads, setScannerThreads] = useState<number>(4);

  // Form states for new schedule
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleIndustry, setNewScheduleIndustry] = useState('Fintech');
  const [newScheduleLaw, setNewScheduleLaw] = useState('GDPR Article 5e (Storage Limitation)');
  const [newScheduleFreq, setNewScheduleFreq] = useState<'HOURLY' | 'DAILY' | 'WEEKLY'>('DAILY');
  const [newScheduleScope, setNewScheduleScope] = useState('All registered entities');
  
  // Multi-party Notification Simulation
  const dispatchMultiPartyNotice = (tenantName: string, violation: string, law: string) => {
    const parties = [
      { name: "Enterprise Owner", type: "EMAIL" },
      { name: "SaaS Administration", type: "SYSTEM" },
      { name: "Regional Government Authority", type: "EMAIL" },
      { name: "Financial Regulator", type: "SMS" },
      { name: "Third Party Compliance Auditor", type: "EMAIL" }
    ];
    
    parties.forEach((party, idx) => {
      setTimeout(() => {
        addLogLine(`[DISPATCH] Automated ${party.type} notice sent to: ${party.name} (${tenantName} / ${law})`);
      }, 500 * (idx + 1));
    });
  };

  // Load registered tenants from local storage to make the experience real!
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);

  useEffect(() => {
    const savedTenants = localStorage.getItem('platform_tenants_list');
    if (savedTenants) {
      try {
        setAvailableTenants(JSON.parse(savedTenants));
      } catch (e) {
        console.error('Failed to parse platform_tenants_list:', e);
        const fallbackTenants = [
          { id: "tenant_1", name: "Acme Financial EU", industry: "Fintech", country: "Germany", website: "https://api.acmefinance.de/v1" },
          { id: "tenant_2", name: "Global Health Systems", industry: "Healthcare", country: "France", website: "https://health.globaltelecom.fr/portal" },
          { id: "tenant_3", name: "TechStartup AI", industry: "AI Labs", country: "Spain", website: "https://llm.techstartup.ai/inference" },
          { id: "tenant_4", name: "Alpha E-Commerce", industry: "E-commerce", country: "Germany", website: "https://alpha-shop.de/cart" },
          { id: "tenant_5", name: "SecureGov Tech", industry: "Govtech", country: "Belgium", website: "https://securesystems.be/auth" }
        ];
        setAvailableTenants(fallbackTenants);
      }
    } else {
      const fallbackTenants = [
        { id: "tenant_1", name: "Acme Financial EU", industry: "Fintech", country: "Germany", website: "https://api.acmefinance.de/v1" },
        { id: "tenant_2", name: "Global Health Systems", industry: "Healthcare", country: "France", website: "https://health.globaltelecom.fr/portal" },
        { id: "tenant_3", name: "TechStartup AI", industry: "AI Labs", country: "Spain", website: "https://llm.techstartup.ai/inference" },
        { id: "tenant_4", name: "Alpha E-Commerce", industry: "E-commerce", country: "Germany", website: "https://alpha-shop.de/cart" },
        { id: "tenant_5", name: "SecureGov Tech", industry: "Govtech", country: "Belgium", website: "https://securesystems.be/auth" }
      ];
      setAvailableTenants(fallbackTenants);
      localStorage.setItem('platform_tenants_list', JSON.stringify(fallbackTenants));
    }
  }, []);

  // Save changes to localStorage on any state modification
  useEffect(() => {
    localStorage.setItem('b2g_service_requests', JSON.stringify(b2gRequests));
  }, [b2gRequests]);

  // Load mandates from backend into the shared list on mount
  useEffect(() => {
    fetchWithRetry('/api/v1/b2g/mandates')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((m: any) => ({
            id: m.id,
            regulatorName: m.regulator_name,
            title: m.title,
            industry: m.industry,
            law: m.law,
            regionalScope: m.regional_scope,
            description: m.description,
            minRiskThreshold: m.min_risk_threshold,
            enforcementAction: m.enforcement_action,
            fineAmount: m.fine_amount,
            status: m.status,
            requestedAt: m.created_at,
          }));
          setB2gRequests(prev => {
            const merged = [...mapped, ...prev.filter(p => !mapped.some((m2: any) => m2.id === p.id))];
            return merged.length > 0 ? merged : (INITIAL_B2G_REQUESTS as any[]);
          });
        } else if (b2gRequests.length === 0) {
          setB2gRequests(INITIAL_B2G_REQUESTS);
        }
      })
      .catch(() => {
        if (b2gRequests.length === 0) setB2gRequests(INITIAL_B2G_REQUESTS);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('b2g_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('b2g_scan_results', JSON.stringify(scanResults));
  }, [scanResults]);

  useEffect(() => {
    localStorage.setItem('b2g_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('b2g_auto_enforce', JSON.stringify(autoEnforceMode));
  }, [autoEnforceMode]);

  // Handle Approvals / Denials of regulator requests
  const handleRequestStatusChange = (requestId: string, newStatus: 'APPROVED' | 'DENIED') => {
    setB2gRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        // If approved, dynamically create a scheduled scanner item for maximum fidelity!
        if (newStatus === 'APPROVED') {
          const matchedSched = schedules.find(s => s.law === req.law && s.industry === req.industry);
          if (!matchedSched) {
            const newSched: ScheduleRule = {
              id: `sched-${Date.now()}`,
              name: `Regulator: ${req.title}`,
              industry: req.industry,
              law: req.law,
              frequency: "DAILY",
              nextRun: new Date(Date.now() + 86400000).toISOString(),
              isActive: true,
              targetScope: `Sovereign jurisdiction filter (${req.regionalScope})`
            };
            setSchedules(curr => [...curr, newSched]);
          }

          // Automatically dispatch B2G Commission & Automated Billing Invoice!
          try {
            const savedTenants = localStorage.getItem('platform_tenants_list');
            const tenantsList = savedTenants ? JSON.parse(savedTenants) : [];
            const matchedTenant = tenantsList.find((t: any) => t.industry?.toLowerCase() === req.industry?.toLowerCase()) || tenantsList[0] || { name: 'Sovereign EU Enterprise' };
            
            const invoice = dispatchB2gInvoiceEmail(
              matchedTenant.name,
              req.regulatorName,
              req.law,
              req.enforcementAction,
              req.fineAmount,
              req.regionalScope
            );
            if (invoice) {
              showToast(`Regulatory task approved. Commission invoice ${invoice.invoiceNumber} has been dispatched.`, 'success');
              // Automatically pull the updated email logs immediately
              const savedMails = localStorage.getItem('b2g_email_logs');
              if (savedMails) {
                setEmailLogs(JSON.parse(savedMails));
              }
            }
          } catch (e) {
            console.error("Billing invoice automated generation failed:", e);
          }
        }
        return { ...req, status: newStatus };
      }
      return req;
    }));

    // Persist approval/denial to backend
    fetchWithRetry(`/api/v1/b2g/mandates/${requestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(e => console.error('Failed to sync mandate status to backend:', e));
  };

  // Add new schedule
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleName.trim()) return;

    const newRule: ScheduleRule = {
      id: `sched-${Date.now()}`,
      name: newScheduleName,
      industry: newScheduleIndustry,
      law: newScheduleLaw,
      frequency: newScheduleFreq,
      nextRun: new Date(Date.now() + (newScheduleFreq === 'HOURLY' ? 3600000 : newScheduleFreq === 'DAILY' ? 86400000 : 604800000)).toISOString(),
      isActive: true,
      targetScope: newScheduleScope
    };

    setSchedules(prev => [...prev, newRule]);
    setShowNewScheduleModal(false);
    setNewScheduleName('');
  };

  // Delete schedule
  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Toggle active schedule
  const handleRunScheduleManual = (id: string) => {
    const sched = schedules.find(s => s.id === id);
    if (!sched) return;

    showToast(`Force-executing manual audit run for ${sched.name}...`, 'info');
    
    // Simulate navigation to Command Center and starting scan with these params
    setActiveSubTab('COMMAND_CENTER');
    setFilterIndustry(sched.industry);
    setFilterLaw(sched.law);
    // Trigger the actual scan logic (simplified for simulation)
    setTimeout(() => {
      triggerAutomatedScan();
    }, 1000);
  };

  const handleToggleScheduleActive = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  // Run instant automated scan command simulation
  const triggerAutomatedScan = () => {
    if (isScanning) return;

    // Resolve scan targets based on filter selections
    let targetsToScan: any[] = [];
    if (filterTenant !== 'All') {
      const selected = availableTenants.find(t => t.id === filterTenant || t.name === filterTenant);
      if (selected) targetsToScan = [selected];
    } else {
      targetsToScan = availableTenants.filter(t => {
        const matchesInd = filterIndustry === 'All' || t.industry === filterIndustry;
        const matchesCountry = filterCountry === 'All' || t.country === filterCountry;
        return matchesInd && matchesCountry;
      });
    }

    if (targetsToScan.length === 0) {
      showToast("No active tenants found matching the configured filters.", 'warning');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setTerminalLogs([]);

    const runScanForTargetIndex = (index: number) => {
      if (index >= targetsToScan.length) {
        // Scanning completed fully!
        addLogLine("\n-------------------------------------------------------------");
        addLogLine("🌟 ALGORITHMIC SURVEILLANCE RUN COMPLETED.");
        addLogLine(`Total analyzed entities: ${targetsToScan.length}`);
        addLogLine("Database compliance hashes synchronized with the blockchain.");
        addLogLine("-------------------------------------------------------------");
        setIsScanning(false);
        return;
      }

      const target = targetsToScan[index];
      setActiveScanTarget(target.name);
      
      // Determine what law to audit against
      const auditLaw = filterLaw === 'All' ? 'GDPR Article 5e (Storage Limitation)' : filterLaw;
      const targetUrl = customWebsite.trim() ? customWebsite : (target.website || `https://api.${target.id}.eu/v1`);

      addLogLine(`\n[INIT] Initiating Automated Regulatory Scan for [${target.name.toUpperCase()}]`);
      addLogLine(`[SCOPE] Targeting Web Endpoint: ${targetUrl}`);
      addLogLine(`[AUDIT] Standard: ${auditLaw}`);
      
      if (isDeepScan) addLogLine(`[CONFIG] Deep Infrastructure Scan enabled - probing secondary subdomains and API shards...`);
      if (verifyAiClauses) addLogLine(`[CONFIG] AI Clause Verification active - scanning for model weights and training logs...`);
      if (analyzeCrossBorderFlows) addLogLine(`[CONFIG] Cross-Border Analysis active - tracing server hops beyond EU-WEST...`);
      if (dryRunMode) addLogLine(`[CONFIG] DRY RUN MODE - No penalties will be dispatched to the blockchain.`);

      setTimeout(() => {
        addLogLine(`[DNS] Establishing sandboxed VPN tunnel to host region: EU-CENTRAL`);
        setScanProgress(p => p + (100 / targetsToScan.length) * 0.2);
      }, 500);

      setTimeout(() => {
        addLogLine(`[SCAN] Parsing privacy manifest and cookies for GDPR authorization banners...`);
        if (isDeepScan) addLogLine(`[DEEP-SCAN] Found hidden GraphQL playground on /dev/api - checking for public introspection...`);
        setScanProgress(p => p + (100 / targetsToScan.length) * 0.4);
      }, 1200);

      setTimeout(() => {
        if (analyzeCrossBorderFlows) {
          addLogLine(`[X-BORDER] Trace established: Dublin -> Amsterdam -> Frankfurt -> (Unauthorized Hop) -> Virginia, USA`);
          addLogLine(`[X-BORDER] ALERT: Data flow violates GDPR Art. 44 (Standard Contractual Clauses not detected).`);
        }
        addLogLine(`[DB] Injecting compliance evaluation queries into isolated storage configuration...`);
        // Deterministic verdict derived from target+law hash so repeated scans are stable
        const hashInput = `${target.id}::${auditLaw}::${isDeepScan ? 'deep' : 'standard'}`;
        let hash = 0;
        for (let i = 0; i < hashInput.length; i++) {
          hash = ((hash << 5) - hash + hashInput.charCodeAt(i)) >>> 0;
        }
        const violationChance = isDeepScan ? 0.7 : 0.4;
        const isViolator = (hash % 100) / 100 < violationChance;
        setScanProgress(p => p + (100 / targetsToScan.length) * 0.7);

        setTimeout(() => {
          if (isViolator) {
            let details = "Holding parameters for 365+ days requires explicit ongoing audit proof. Discovered data chunks dating 420 days back.";
            let penalty: 'API_THROTTLE' | 'LOCK_CERTIFICATE' | 'AUTO_FINE' | 'FEATURE_SUSPENSION' = 'AUTO_FINE';
            let fineAmount = 250000;

            if (auditLaw.includes('AI Act') || verifyAiClauses) {
              details = "Found active neural network inference weights without model safety classification registry tags.";
              penalty = 'FEATURE_SUSPENSION';
              fineAmount = 500000;
            } else if (auditLaw.includes('NIS2') || auditLaw.includes('DORA')) {
              details = "Weak SSL protocol implementation and SHA-1 active hash codes found on public gateway certificates.";
              penalty = 'API_THROTTLE';
              fineAmount = 100000;
            }

            if (dryRunMode) {
              addLogLine(`[🔴 VIOLATION] CRITICAL INCONGRUITY DETECTED (DRY RUN).`);
              addLogLine(`[ALERT] Detail: ${details}`);
              addLogLine(`[DRY-RUN] Penalty suppressed: [${penalty}] - €${fineAmount.toLocaleString()} fine.`);
            } else {
              addLogLine(`[🔴 VIOLATION] CRITICAL INCONGRUITY DETECTED.`);
              addLogLine(`[ALERT] Detail: ${details}`);

              // 1. Trigger Alert Service
              AlertService.triggerAlert({ level: 'CRITICAL', message: `High-risk vulnerability: ${details}`, service: 'B2G_SCANNER' });
              
              // 2. Log Draft Incident Report
              logEvent({
                id: `incident_${Date.now()}`,
                action_type: 'DRAFT_INCIDENT_REPORT',
                status: 'DRAFT',
                severity: 'CRITICAL',
                service_module: 'B2G_SCANNER',
                target_resource: target.id,
                details: JSON.stringify({ details, law: auditLaw })
              });

              // 3. Multi-party notification dispatch
              dispatchMultiPartyNotice(target.name, details, auditLaw);

            // 2. Send primary automated warning email
            const recipientEmail = `authority-ciso@${target.name.toLowerCase().replace(/\s+/g, '')}.com`;
            const mailId = `mail-${Date.now()}`;
            const emailSubject = `🚨 AUTOMATED COMPLIANCE NOTICE: Legal Violation Detected on ${target.name}`;
            const emailBody = `Dear Operations Lead,\n\nOur automated B2G Sovereign Compliance system has run its routine scan on your endpoint: ${targetUrl} and identified a critical legal infraction:\n\n- Standard Inspected: ${auditLaw}\n- Detection: ${details}\n\nActions Queued:\nWe have queued an immediate [${penalty}] limitation on your SaaS Tenant subscription, pending regulatory sign-off.\n\n${penalty === 'AUTO_FINE' ? `An automated regulatory fine of €${fineAmount.toLocaleString()} will be applied to your next monthly invoice upon approval.` : ''}\n\nPlease audit your endpoints and submit a compliance recovery response immediately.\n\nBest regards,\nB2G Automated Governance Console`;

            const newMailLog: EmailLog = {
              id: mailId,
              to: recipientEmail,
              subject: emailSubject,
              body: emailBody,
              tenantName: target.name,
              violationType: auditLaw,
              timestamp: new Date().toISOString(),
              status: 'DELIVERED'
            };

            // 3. Apply automated penalty
            const { severity, tags } = classifyViolation(details, auditLaw);
            
            const newScanResult: ScanResult = {
              id: `scan-${Date.now()}`,
              tenantId: target.id,
              tenantName: target.name,
              industry: target.industry,
              lawChecked: auditLaw,
              website: targetUrl,
              status: 'VIOLATION_DETECTED',
              violationDetails: details,
              timestamp: new Date().toISOString(),
              approvalStatus: autoEnforceMode ? 'PENDING' : undefined,
              pendingPenalty: autoEnforceMode ? penalty : undefined,
              pendingFine: autoEnforceMode && penalty === 'AUTO_FINE' ? fineAmount : undefined,
              emailSentTo: recipientEmail,
              severity,
              tags,
              multiPartyDispatched: true
            };

            // Apply fine to tenant's invoices if auto-enforce is on
            if (autoEnforceMode) {
              addLogLine(`[QUEUE] Auto-Enforcement queued for regulatory sign-off: ${penalty}.`);
            } else {
              addLogLine(`[AUDIT] Manual enforcement required. Flagging violation.`);
            }

            // Dispatch state updates
            setScanResults(curr => [newScanResult, ...curr]);
            setEmailLogs(curr => [newMailLog, ...curr]);
            addLogLine(`[MAIL] Notification auto-email dispatched to: ${recipientEmail}`);
          } // End of non-dry-run enforcement
        } else {
          addLogLine(`[🟢 COMPLIANT] Endpoint successfully parsed. Safe cipher parameters verified.`);
            const newScanResult: ScanResult = {
              id: `scan-${Date.now()}`,
              tenantId: target.id,
              tenantName: target.name,
              industry: target.industry,
              lawChecked: auditLaw,
              website: targetUrl,
              status: 'COMPLIANT',
              timestamp: new Date().toISOString()
            };
            setScanResults(curr => [newScanResult, ...curr]);
          }

          setScanProgress((index + 1) * (100 / targetsToScan.length));
          // Move to next target
          setTimeout(() => {
            runScanForTargetIndex(index + 1);
          }, 800);

        }, 1000);

      }, 2000);
    };

    runScanForTargetIndex(0);
  };

  const addLogLine = (line: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  // Helper to lift/remove applied penalties
  const handleLiftPenalty = (scanId: string) => {
    setScanResults(prev => prev.map(res => {
      if (res.id === scanId) {
        return { ...res, penaltyEnforced: undefined, fineApplied: undefined };
      }
      return res;
    }));
  };

  const handleSelectAllUnenforced = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = scanResults.filter(r => r.status === 'VIOLATION_DETECTED' && !r.penaltyEnforced).map(r => r.id);
      setSelectedScanIds(allIds);
    } else {
      setSelectedScanIds([]);
    }
  };

  const handleSelectScan = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedScanIds(prev => [...prev, id]);
    } else {
      setSelectedScanIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkEnforcePenalties = () => {
    if (selectedScanIds.length === 0) return;
    setSigningScanIds(selectedScanIds);
    setSignatureName('');
    setSignatureModalOpen(true);
  };

  const handleSignAndEnforce = () => {
    if (!signatureName.trim()) return;

    // Generate billing invoices for each newly enforced scan
    scanResults.forEach(res => {
      if (signingScanIds.includes(res.id) && !res.penaltyEnforced) {
        const isAI = res.lawChecked.includes('AI Act');
        const penaltyToEnforce = res.pendingPenalty || (isAI ? 'FEATURE_SUSPENSION' : 'API_THROTTLE');
        const fineToEnforce = res.pendingFine !== undefined ? res.pendingFine : (isAI ? 500000 : undefined);
        
        let tenantCountry = 'EU Region';
        try {
          const savedTenants = localStorage.getItem('platform_tenants_list');
          const tenantsList = savedTenants ? JSON.parse(savedTenants) : [];
          const matched = tenantsList.find((t: any) => t.name === res.tenantName);
          if (matched && matched.country) {
            tenantCountry = matched.country;
          }
        } catch (e) {
          console.error(e);
        }
        
        const regAuthority = res.lawChecked.includes('GDPR') 
          ? 'European Data Protection Board' 
          : res.lawChecked.includes('AI Act') 
          ? 'EU AI Office' 
          : 'European Cyber Security Agency';

        try {
          dispatchB2gInvoiceEmail(
            res.tenantName,
            regAuthority,
            res.lawChecked,
            penaltyToEnforce,
            fineToEnforce,
            tenantCountry
          );
        } catch (e) {
          console.error("Manual sign-off billing invoice failure:", e);
        }
      }
    });

    setScanResults(prev => prev.map(res => {
      if (signingScanIds.includes(res.id) && !res.penaltyEnforced) {
        const isAI = res.lawChecked.includes('AI Act');
        // If it was auto-enforced, use its pending values, otherwise fallback to defaults
        const penaltyToEnforce = res.pendingPenalty || (isAI ? 'FEATURE_SUSPENSION' : 'API_THROTTLE');
        const fineToEnforce = res.pendingFine !== undefined ? res.pendingFine : (isAI ? 500000 : undefined);
        
        return {
          ...res,
          penaltyEnforced: penaltyToEnforce,
          fineApplied: fineToEnforce,
          emailSentTo: res.emailSentTo || `compliance-officer@${res.tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
          escalationLevel: 1,
          approvalStatus: 'APPROVED',
          signature: signatureName
        };
      }
      return res;
    }));

    addLogLine(`[ENFORCE] Regulatory signature '${signatureName}' applied. Penalties executed for ${signingScanIds.length} tenants.`);
    
    // Automatically pull the updated email logs immediately
    try {
      const savedMails = localStorage.getItem('b2g_email_logs');
      if (savedMails) {
        setEmailLogs(JSON.parse(savedMails));
      }
    } catch (e) {
      console.error("Failed to load updated email logs in manual signature:", e);
    }

    setSignatureModalOpen(false);
    setSigningScanIds([]);
    setSelectedScanIds([]);
  };

  const handleSubmitAppeal = async () => {
    if (!appealingScanId || !appealEvidence.trim()) return;
    setIsSubmittingAppeal(true);
    
    try {
      const scan = scanResults.find(r => r.id === appealingScanId);
      if (!scan) return;

      const res = await fetchWithRetry('/api/v1/compliance/summarize-appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violationDetails: scan.violationDetails,
          lawChecked: scan.lawChecked,
          counterEvidence: appealEvidence
        })
      });
      const data = await res.json();
      
      setScanResults(prev => prev.map(r => {
        if (r.id === appealingScanId) {
          return {
            ...r,
            appealStatus: 'SUBMITTED',
            appealEvidence,
            appealSummary: data.summary,
            // You can optionally store data.recommendation here if needed
          };
        }
        return r;
      }));

      addLogLine(`[APPEAL] Appeal submitted for ${scan.tenantName}. AI Summary generated.`);
    } catch (e) {
      console.error(e);
      addLogLine(`[ERROR] Failed to submit appeal.`);
    } finally {
      setIsSubmittingAppeal(false);
      setAppealModalOpen(false);
      setAppealingScanId(null);
      setAppealEvidence('');
    }
  };

  const handleDraftLegalResponse = async (scan: ScanResult) => {
    setIsDraftingResponse(true);
    setDraftedLegalResponse(null);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/draft-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: scan.tenantName,
          violationDetails: scan.violationDetails,
          lawChecked: scan.lawChecked,
          severityLevel: scan.severity || 'HIGH'
        })
      });
      const data = await res.json();
      if (data.draftResponse) {
        setDraftedLegalResponse(data.draftResponse);
      } else {
        setDraftedLegalResponse("Failed to generate draft. Unexpected response format.");
      }
    } catch (e) {
      console.error(e);
      setDraftedLegalResponse("Failed to connect to AI engine.");
    } finally {
      setIsDraftingResponse(false);
    }
  };

  const handleRunEscalations = () => {
    const newEmails: EmailLog[] = [];
    const now = new Date().toISOString();
    
    setScanResults(prev => prev.map(res => {
      if (res.status === 'VIOLATION_DETECTED' && res.penaltyEnforced && res.emailSentTo) {
        const currentLevel = res.escalationLevel || 1;
        const nextLevel = currentLevel + 1;
        
        let subject = '';
        let body = '';
        
        if (nextLevel === 2) {
          subject = `⚠️ SECOND NOTICE: Escalated Penalty for Unresolved Violation (${res.lawChecked})`;
          body = `Dear Authority,\n\nThis is a SECOND NOTICE from the B2G Compliance Engine. Your organization '${res.tenantName}' has an active unresolved penalty [${res.penaltyEnforced}].\n\nIf no resolution is provided within 48 hours, additional fines and restrictions will apply. Please submit your conformity documentation immediately.\n\nBest regards,\nB2G Regulatory Automation Service`;
        } else if (nextLevel >= 3) {
          subject = `🚨 FINAL LEGAL WARNING: Collections & Full Suspension (${res.lawChecked})`;
          body = `Dear Authority,\n\nThis is the FINAL LEGAL NOTICE for '${res.tenantName}'. Due to non-compliance with the previous notices regarding ${res.lawChecked}, your case has been referred to our Collections & Legal Escalation team.\n\nImmediate full tenant suspension is pending if this is not addressed.\n\nSincerely,\nB2G Regulatory Automation Service`;
        }
        
        newEmails.push({
          id: `mail-esc-${Date.now()}-${res.id}`,
          to: res.emailSentTo,
          subject,
          body,
          tenantName: res.tenantName,
          violationType: res.lawChecked,
          timestamp: now,
          status: 'DELIVERED'
        });
        
        addLogLine(`[ESCALATION] Level ${nextLevel} notice dispatched to ${res.tenantName}`);
        
        return { ...res, escalationLevel: nextLevel };
      }
      return res;
    }));

    if (newEmails.length > 0) {
      setEmailLogs(curr => [...newEmails, ...curr]);
    } else {
      addLogLine(`[ESCALATION] No active penalties found requiring escalation at this time.`);
    }
  };

  // Generate charts data
  const getRechartsViolationByIndustry = () => {
    const counts: Record<string, number> = {};
    scanResults.filter(r => r.status === 'VIOLATION_DETECTED').forEach(r => {
      counts[r.industry] = (counts[r.industry] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  };

  const getRechartsScanSuccessTrend = () => {
    // Derive trend buckets from persisted real scan results (deterministic)
    const points: { name: string; Compliant: number; Violations: number }[] = [];
    const bucketSize = 5;
    const sorted = [...scanResults].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for (let i = 0; i < sorted.length; i += bucketSize) {
      const slice = sorted.slice(i, i + bucketSize);
      const key = slice.length > 0
        ? new Date(slice[0].timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : String(i / bucketSize);
      points.push({
        name: key,
        Compliant: slice.filter(r => r.status === 'COMPLIANT' || r.status === 'VIOLATION_DETECTED').length - slice.filter(r => r.status === 'VIOLATION_DETECTED').length,
        Violations: slice.filter(r => r.status === 'VIOLATION_DETECTED').length,
      });
    }
    if (points.length > 0) return points;
    return [
      { name: 'No runs', Compliant: 0, Violations: 0 },
    ];
  };

  const totalFinesApplied = scanResults
    .filter(r => r.fineApplied !== undefined)
    .reduce((sum, current) => sum + (current.fineApplied || 0), 0);

  const activePenaltiesCount = scanResults.filter(r => r.penaltyEnforced !== undefined).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Upper Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center">
                B2G Sovereign Compliance Hub
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Automated Gov-SaaS operations: Regulator service orchestration, law scanning, & dynamic penalty enforcement.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 flex-wrap gap-1">
          <button 
            onClick={() => setActiveSubTab('NATIONAL_SCANNER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === 'NATIONAL_SCANNER' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-emerald-400 hover:text-emerald-300'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>National B2G Scanner</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('COMMAND_CENTER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'COMMAND_CENTER' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            B2G Command Center
          </button>
          <button 
            onClick={() => setActiveSubTab('FILING_TIMELINES')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === 'FILING_TIMELINES' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'}`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filing Workflows & Timeline</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('SERVICE_REQUESTS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${activeSubTab === 'SERVICE_REQUESTS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <span>Service Requests</span>
            {b2gRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                {b2gRequests.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveSubTab('COMMISSIONS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === 'COMMISSIONS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-emerald-400 hover:text-emerald-300'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Penalty Commissions</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('SCHEDULES')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'SCHEDULES' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Operations Scheduler
          </button>
          <button 
            onClick={() => setActiveSubTab('ENFORCEMENTS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'ENFORCEMENTS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Penalty Log
          </button>
          <button 
            onClick={() => setActiveSubTab('EMAILS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'EMAILS' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Dispatch Logs
          </button>
          <button 
            onClick={() => setActiveSubTab('REPORTING')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'REPORTING' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Reporting
          </button>
          <button 
            onClick={() => setActiveSubTab('CALENDAR')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'CALENDAR' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Calendar
          </button>
          <button 
            onClick={() => setActiveSubTab('ADVANCED_SUITE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === 'ADVANCED_SUITE' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-amber-400 hover:text-amber-300'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Advanced B2G Modules</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('CYBER_DEFENSE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === 'CYBER_DEFENSE' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-emerald-300 hover:text-emerald-200'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Cyber Scan & Auto-Fix</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('ENFORCEMENT_PIPELINE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === 'ENFORCEMENT_PIPELINE' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-amber-300 hover:text-amber-200'}`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Enforcement Pipeline</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('AUDIT_PIPELINE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === 'AUDIT_PIPELINE' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-emerald-300 hover:text-emerald-200'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Rule Audit Pipeline</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('INTEL_WARROOM')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activeSubTab === 'INTEL_WARROOM' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-cyan-300 hover:text-cyan-200'}`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>National Intel War-Room</span>
          </button>
        </div>
      </div>

      {/* Primary Analytics Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scans Executed</span>
          <div className="text-3xl font-black text-slate-800 mt-1">{scanResults.length + 84}</div>
          <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+14.3% this week</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Automated Penalties</span>
          <div className="text-3xl font-black text-slate-800 mt-1">{activePenaltiesCount}</div>
          <p className="text-xs text-amber-600 font-semibold mt-1.5">
            Active throttles, suspensions & locks
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fines Generated</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">€{totalFinesApplied.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1.5">
            Automatically posted to billing
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auto-Enforcement Status</span>
            <div className="flex items-center justify-between mt-1.5">
              <span className={`text-sm font-bold ${autoEnforceMode ? 'text-emerald-600' : 'text-slate-500'}`}>
                {autoEnforceMode ? '⚡ FULLY AUTONOMOUS' : '⚠️ MANUAL REVIEW'}
              </span>
              <button 
                onClick={() => setAutoEnforceMode(!autoEnforceMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoEnforceMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoEnforceMode ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Toggle automatic API throttling and billing fine injection.
          </span>
        </div>
      </div>

      {activeSubTab === 'NATIONAL_SCANNER' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <NationalB2gScanningEngine 
            availableTenants={availableTenants}
            onStartScan={triggerAutomatedScan}
            isScanning={isScanning}
            progress={scanProgress}
            logs={terminalLogs}
            target={activeScanTarget}
            filters={{
              industry: filterIndustry,
              country: filterCountry,
              law: filterLaw,
              tenant: filterTenant,
              website: customWebsite
            }}
            onFilterChange={(key, val) => {
              if (key === 'industry') setFilterIndustry(val);
              if (key === 'country') setFilterCountry(val);
              if (key === 'law') setFilterLaw(val);
              if (key === 'tenant') setFilterTenant(val);
              if (key === 'website') setCustomWebsite(val);
            }}
          />
        </motion.div>
      )}

      {activeSubTab === 'COMMISSIONS' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Commission Stats Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Country-wise Penalty Commission Ledger</h3>
                    <p className="text-sm text-slate-500">SaaS administrative platform earnings per sovereign jurisdiction.</p>
                  </div>
                  <button 
                    onClick={handleExportCommissionPdf}
                    disabled={isGeneratingCommissionPdf}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingCommissionPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                    Export Commission Report (PDF)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Penalty Volume</span>
                    <span className="text-xl font-black text-slate-900">€{scanResults.reduce((acc, r) => acc + (r.fineApplied || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Estimated SaaS Revenue</span>
                    <span className="text-xl font-black text-emerald-700">
                      €{scanResults.reduce((acc, r) => {
                        let country = 'EU Region';
                        if (r.website.includes('.de')) country = 'Germany';
                        else if (r.website.includes('.fr')) country = 'France';
                        else if (r.website.includes('.ie')) country = 'Ireland';
                        const rate = (getB2gBillingConfig().countryCommissions as any)?.[country] || 4.5;
                        return acc + ((r.fineApplied || 0) * (rate / 100));
                      }, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">Avg. Commission Rate</span>
                    <span className="text-xl font-black text-indigo-700">4.45%</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-600">Sovereign Country</th>
                        <th className="px-4 py-3 font-bold text-slate-600">Commission Rate</th>
                        <th className="px-4 py-3 font-bold text-slate-600">Penalty Count</th>
                        <th className="px-4 py-3 font-bold text-slate-600">Total Volume</th>
                        <th className="px-4 py-3 font-bold text-slate-600 text-right">SaaS Commission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(getB2gBillingConfig().countryCommissions || {}).map(([country, rate]) => {
                        const countryFines = scanResults.filter(r => {
                          if (country === 'Germany') return r.website.includes('.de');
                          if (country === 'France') return r.website.includes('.fr');
                          if (country === 'Ireland') return r.website.includes('.ie');
                          if (country === 'Netherlands') return r.website.includes('.nl');
                          return false;
                        });
                        const volume = countryFines.reduce((acc, r) => acc + (r.fineApplied || 0), 0);
                        const commission = volume * (rate / 100);

                        return (
                          <tr key={country} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-slate-900">{country}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-bold text-xs">{rate}%</span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">{countryFines.length} Cases</td>
                            <td className="px-4 py-4 font-mono text-xs text-slate-500">€{volume.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-black text-emerald-600">€{commission.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Commission Adjuster Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold">Regional Rate Config</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Adjust administrative commission multipliers for specific sovereign enclaves. Updates affect all future automated invoices.
                </p>
                
                <div className="space-y-4">
                  {Object.entries(getB2gBillingConfig().countryCommissions || {}).map(([country, rate]) => (
                    <div key={country}>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        <span>{country}</span>
                        <span className="text-emerald-400">{rate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="15" 
                        step="0.1"
                        value={rate}
                        onChange={(e) => {
                          const config = getB2gBillingConfig();
                          const updated = {
                            ...config,
                            countryCommissions: {
                              ...config.countryCommissions,
                              [country]: parseFloat(e.target.value)
                            }
                          };
                          localStorage.setItem('b2g_advanced_config', JSON.stringify(updated));
                          window.dispatchEvent(new Event('storage'));
                        }}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Protocol Notice</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Changes to commission parameters are inscribed in the system audit ledger and TARGET2 billing relay.
                  </p>
                </div>
              </div>

              {/* D3 Integration visualization */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <B2gPenaltyD3Chart scanResults={scanResults} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSubTab === 'FILING_TIMELINES' && (
        <B2gFilingWorkflowTimeline />
      )}

      {/* Interactive Command Center View */}
      {activeSubTab === 'COMMAND_CENTER' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="md:col-span-3">
              <ComplianceHealthScoreWidget />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Audits</span>
                <div className="text-2xl font-black text-slate-900 mt-1">24</div>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Scanner Controls Form */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center border-b border-slate-100 pb-3">
              <Sliders className="w-5 h-5 text-emerald-500 mr-2" />
              Scanning Control Configuration
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Target Industry Sector
              </label>
              <select 
                value={filterIndustry} 
                onChange={(e) => {
                  setFilterIndustry(e.target.value);
                  setFilterTenant('All'); // reset tenant dropdown to prevent mismatch
                }}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Sectors (Cross-border scope)</option>
                <option value="Fintech">Fintech (Financial entities)</option>
                <option value="Healthcare">Healthcare (Medical records)</option>
                <option value="AI Labs">AI Labs (Large model developers)</option>
                <option value="E-commerce">E-commerce (Sellers & brokers)</option>
                <option value="Govtech">Govtech (Public entities)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Legal Directive / Act
              </label>
              <select 
                value={filterLaw} 
                onChange={(e) => setFilterLaw(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Applicable EU Directives</option>
                <option value="GDPR Article 5e (Storage Limitation)">GDPR Article 5e (Storage Limitation)</option>
                <option value="EU AI Act Chapter III (Conformity Auditing)">EU AI Act Chapter III (Conformity Auditing)</option>
                <option value="NIS2 Article 21 (Risk Management)">NIS2 Article 21 (Risk Management Directive)</option>
                <option value="DORA Article 14 (ICT Systems Resilience)">DORA Article 14 (ICT Resilience Standard)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Target Country
              </label>
              <select 
                value={filterCountry} 
                onChange={(e) => {
                  setFilterCountry(e.target.value);
                  setFilterTenant('All'); // reset tenant dropdown to prevent mismatch
                }}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All EU Member States</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Ireland">Ireland</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Spain">Spain</option>
                <option value="Italy">Italy</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Target Tenant (Optional)
              </label>
              <select 
                value={filterTenant} 
                onChange={(e) => setFilterTenant(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">Scan All matching tenants</option>
                {availableTenants
                  .filter(t => (filterIndustry === 'All' || t.industry === filterIndustry) && (filterCountry === 'All' || t.country === filterCountry))
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.country})</option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Override Target URL / Endpoint
              </label>
              <input 
                type="text" 
                placeholder="e.g. https://api.customtenant.eu/v1"
                value={customWebsite}
                onChange={(e) => setCustomWebsite(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="pt-2 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Advanced Audit Parameters</label>
              
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] font-bold text-slate-700">Deep Infrastructure Scan</span>
                </div>
                <button 
                  onClick={() => setIsDeepScan(!isDeepScan)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${isDeepScan ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDeepScan ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] font-bold text-slate-700">Verify AI Compliance Clauses</span>
                </div>
                <button 
                  onClick={() => setVerifyAiClauses(!verifyAiClauses)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${verifyAiClauses ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${verifyAiClauses ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[11px] font-bold text-slate-700">Cross-Border Data Flows</span>
                </div>
                <button 
                  onClick={() => setAnalyzeCrossBorderFlows(!analyzeCrossBorderFlows)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${analyzeCrossBorderFlows ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${analyzeCrossBorderFlows ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Gavel className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[11px] font-bold text-slate-700">Dry Run (No Penalties)</span>
                </div>
                <button 
                  onClick={() => setDryRunMode(!dryRunMode)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${dryRunMode ? 'bg-rose-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${dryRunMode ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-[11px] font-bold text-slate-700">Scanner Parallelism</span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-indigo-600">{scannerThreads} Threads</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="16" 
                  value={scannerThreads} 
                  onChange={(e) => setScannerThreads(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button 
                onClick={triggerAutomatedScan}
                disabled={isScanning}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin text-slate-900" />
                    <span>Executing Surveillance Scan...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Run Tenant Compliance Audit</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => setShowRegionalScanner(true)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 border border-slate-700"
              >
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>Regional Deep Discovery</span>
              </button>
              
              <button 
                onClick={() => setShowLangGraphEngine(true)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 border border-indigo-500"
              >
                <Activity className="w-5 h-5 text-indigo-200" />
                <span>B2G LangGraph Automation Engine</span>
              </button>
            </div>

            {/* Quick stats with Recharts */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Automated scan coverage</h4>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getRechartsScanSuccessTrend()}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Compliant" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={1.5} />
                    <Area type="monotone" dataKey="Violations" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Interactive Simulated Terminal Logs */}
          <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl p-5 shadow-2xl flex flex-col h-[650px] border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-extrabold text-slate-200 font-mono">b2g-enforcer-daemon ~ logs</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 p-4 space-y-2.5 select-none custom-scrollbar bg-slate-950/50 rounded-xl mt-3">
              {terminalLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                  <Terminal className="w-10 h-10 mb-2 opacity-30" />
                  <p>Awaiting audit command dispatch.</p>
                  <p className="text-[11px] mt-1">Configure filters on the left and click 'Run Real-Time Compliance Audit'.</p>
                </div>
              ) : (
                terminalLogs.map((log, idx) => {
                  let colorClass = 'text-slate-300';
                  if (log.includes('🔴 VIOLATION') || log.includes('[ALERT]')) colorClass = 'text-rose-400 font-bold';
                  else if (log.includes('🟢 COMPLIANT')) colorClass = 'text-emerald-400 font-bold';
                  else if (log.includes('🌟 ALGORITHMIC')) colorClass = 'text-amber-400 font-black';
                  else if (log.includes('[INIT]')) colorClass = 'text-sky-400';

                  return (
                    <div key={idx} className={`${colorClass} whitespace-pre-wrap leading-relaxed`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>

            {/* Simulated run stats */}
            {isScanning && (
              <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="flex justify-between items-center text-xs text-slate-300 mb-1 font-mono">
                  <span>Currently scanning: {activeScanTarget}</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-emerald-500 h-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
            <B2gCriticalFindings />
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Active Directives</h4>
              <div className="space-y-3">
                {['GDPR', 'EU AI Act', 'NIS2', 'DORA'].map(act => (
                  <div key={act} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{act}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black">ENFORCING</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Real-time D3 Analytics Chart & News Feed */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center border-b border-slate-100 pb-3">
              <PieChart className="w-5 h-5 text-emerald-500 mr-2" />
              Real-Time Regulatory Penalty Dispatches
            </h3>
            <div className="w-full">
              <B2gPenaltyD3Chart scanResults={scanResults} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <RegulatoryNewsFeed />
          </div>
        </div>
      </div>
    )}

      {/* Service Request Manager Sub-Tab */}
      {activeSubTab === 'SERVICE_REQUESTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center">
              <UserCheck className="w-5 h-5 text-emerald-500 mr-2" />
              Incoming B2G Service Requests (Regulators)
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              European Authorities can send structured automated fine & penalty configurations. Review, edit parameter bounds, and deploy compliance triggers.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-bold text-slate-600">Regulator / Agency</th>
                  <th className="px-5 py-3 font-bold text-slate-600">Standard / Directive</th>
                  <th className="px-5 py-3 font-bold text-slate-600">Industry</th>
                  <th className="px-5 py-3 font-bold text-slate-600">Target Region</th>
                  <th className="px-5 py-3 font-bold text-slate-600">Enforcement Action</th>
                  <th className="px-5 py-3 font-bold text-slate-600">Risk Limit</th>
                  <th className="px-5 py-3 font-bold text-slate-600">Status</th>
                  <th className="px-5 py-3 font-bold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {b2gRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-bold text-slate-800">{req.regulatorName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{req.title}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">
                      {req.law}
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                        {req.industry}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 font-semibold">{req.regionalScope}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                        {req.enforcementAction === 'AUTO_FINE' && <span className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">Invoice Fine €{req.fineAmount?.toLocaleString()}</span>}
                        {req.enforcementAction === 'FEATURE_SUSPENSION' && <span className="text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">Suspend AI Model Endpoint</span>}
                        {req.enforcementAction === 'API_THROTTLE' && <span className="text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Throttle API 80%</span>}
                        {req.enforcementAction === 'LOCK_CERTIFICATE' && <span className="text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">Lock Compliance Badge</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 font-bold">{req.minRiskThreshold}% Min Score</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button 
                            onClick={() => setSelectedReqForImpact(req.id)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-1.5 rounded-lg transition-colors"
                            title="AI Impact Simulation"
                          >
                            <Bot className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRequestStatusChange(req.id, 'APPROVED')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-1.5 rounded-lg transition-colors"
                            title="Approve & Deploy to Scanner"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRequestStatusChange(req.id, 'DENIED')}
                            className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 p-1.5 rounded-lg transition-colors"
                            title="Reject Mandate"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1.5">
                          <span className="text-xs text-slate-400 font-semibold italic">Approved for Daemon</span>
                          <button 
                            onClick={() => setShowAdvancedConfig(true)}
                            className="bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg transition-colors"
                            title="Advanced Enforcement Settings"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scheduler View */}
      {activeSubTab === 'SCHEDULES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6 h-fit">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center">
                  <Calendar className="w-5 h-5 text-emerald-500 mr-2" />
                  Automated Operation Scheduler
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Configure recurrent background scanner runs. Scans auto-generate warn emails and enforce penalties dynamically.
                </p>
              </div>
              <button 
                onClick={() => setShowNewScheduleModal(true)}
                className="bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Configure New Cron Scan</span>
              </button>
            </div>

            {/* List of Schedules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map(sched => (
                <div key={sched.id} className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-300 transition-all bg-slate-50/30">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{sched.name}</h4>
                        <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Frequence: {sched.frequency} (Every {sched.frequency.toLowerCase()})</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleScheduleActive(sched.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all ${
                          sched.isActive 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        {sched.isActive ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-100 py-3 font-mono">
                      <div>
                        <span className="text-slate-400 block uppercase tracking-wider text-[9px] font-sans">Target Industry</span>
                        <span className="text-slate-700 font-bold">{sched.industry}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase tracking-wider text-[9px] font-sans">Law Checked</span>
                        <span className="text-slate-700 font-bold truncate block" title={sched.law}>{sched.law}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block uppercase tracking-wider text-[9px] font-sans">Sovereign Audit Scope</span>
                        <span className="text-slate-700 font-semibold">{sched.targetScope}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">
                      Next automatic audit: {new Date(sched.nextRun).toLocaleTimeString()} {new Date(sched.nextRun).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleRunScheduleManual(sched.id)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold border border-emerald-100"
                        title="Force Run Audit Now"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Now</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteSchedule(sched.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <RegulatoryNewsFeed />
          </div>
        </div>
      )}

      {/* Penalty Log Tab */}
      {activeSubTab === 'ENFORCEMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Active Penalties List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-800 flex items-center">
                <ShieldAlert className="w-5 h-5 text-rose-500 mr-2" />
                Active SaaS Penalties & Enforcements Ledger
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsPdfDialogOpen(true)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 transition-colors shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={handleRunEscalations}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 transition-colors shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Run Escalation Workflow</span>
                </button>
                <button
                  onClick={() => setShowAdvancedConfig(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 transition-colors shadow-sm"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Advanced Config</span>
                </button>
                {selectedScanIds.length > 0 && (
                  <button
                    onClick={handleBulkEnforcePenalties}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 transition-colors shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Enforce {selectedScanIds.length} Selected</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-600 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        onChange={handleSelectAllUnenforced}
                        checked={
                          scanResults.filter(r => r.status === 'VIOLATION_DETECTED' && !r.penaltyEnforced).length > 0 && 
                          selectedScanIds.length === scanResults.filter(r => r.status === 'VIOLATION_DETECTED' && !r.penaltyEnforced).length
                        }
                      />
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-600">Company</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Infracted Law</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Penalty Enforced</th>
                    <th className="px-4 py-3 font-bold text-slate-600">Notice Level</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-right">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scanResults.filter(r => r.status === 'VIOLATION_DETECTED').map(res => (
                    <tr key={res.id} className={`transition-colors ${selectedScanIds.includes(res.id) ? 'bg-amber-50/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-4 py-4">
                        {!res.penaltyEnforced ? (
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                            checked={selectedScanIds.includes(res.id)}
                            onChange={(e) => handleSelectScan(res.id, e.target.checked)}
                          />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          {res.tenantName}
                          {res.severity === 'CRITICAL' && <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">CRITICAL</span>}
                          {res.severity === 'HIGH' && <span className="bg-orange-100 text-orange-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">HIGH</span>}
                          {res.severity === 'MEDIUM' && <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">MED</span>}
                          {res.severity === 'LOW' && <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">LOW</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{res.website}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-600">
                        <div className="text-xs mb-1 truncate max-w-[200px]" title={res.lawChecked}>{res.lawChecked}</div>
                        {res.tags && res.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {res.tags.map(tag => (
                              <span key={tag} className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-sm border border-slate-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {res.penaltyEnforced ? (
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-1.5 font-bold">
                              {res.penaltyEnforced === 'AUTO_FINE' && <span className="text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-[10px]">Applied Fine: €{res.fineApplied?.toLocaleString()}</span>}
                              {res.penaltyEnforced === 'FEATURE_SUSPENSION' && <span className="text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px]">Suspended AI inferences</span>}
                              {res.penaltyEnforced === 'API_THROTTLE' && <span className="text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-[10px]">API Throttled 80%</span>}
                            </div>
                            {res.signature && (
                              <div className="text-[9px] text-slate-400 font-mono mt-1">Signed by: {res.signature}</div>
                            )}
                          </div>
                        ) : res.approvalStatus === 'PENDING' ? (
                          <div className="flex flex-col space-y-1">
                             <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold">PENDING REGULATOR SIGN-OFF</span>
                             <span className="text-slate-500 text-[10px]">Queued: {res.pendingPenalty}</span>
                          </div>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">LIFTED / RESOLVED</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-600 font-semibold">{res.emailSentTo || 'No notice sent'}</span>
                          </div>
                          {res.escalationLevel && (
                            <div className="flex mt-1 space-x-1">
                              {[1, 2, 3].map(level => (
                                <div key={level} className={`w-2 h-2 rounded-full ${level <= res.escalationLevel! ? (level === 3 ? 'bg-rose-500' : level === 2 ? 'bg-amber-400' : 'bg-slate-400') : 'bg-slate-100'}`} title={`Level ${level}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEnforcementTenantId(res.tenantId);
                              setShowEnforcementEngine(true);
                            }}
                            className="text-[10px] text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded border border-amber-200 transition-colors font-bold flex items-center"
                            title="Open Enforcement Pressure Engine"
                          >
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Pressure
                          </button>
                          <button
                            onClick={() => setSelectedTimelineScan(res)}
                            className="text-[10px] text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded border border-slate-200 transition-colors font-bold flex items-center"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Timeline
                          </button>
                          {res.penaltyEnforced && !res.appealStatus && (
                            <button 
                              onClick={() => {
                                setAppealingScanId(res.id);
                                setAppealEvidence('');
                                setAppealModalOpen(true);
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded border border-indigo-200 transition-colors"
                            >
                              File Appeal
                            </button>
                          )}
                          {res.appealStatus === 'SUBMITTED' && (
                            <span className="text-[10px] font-bold text-indigo-500 border border-indigo-200 bg-indigo-50 px-2 py-1 rounded">Appealed</span>
                          )}
                          {res.appealStatus === 'ACCEPTED' && (
                            <span className="text-[10px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-1 rounded">Appeal Approved</span>
                          )}
                          {res.appealStatus === 'REJECTED' && (
                            <span className="text-[10px] font-bold text-rose-600 border border-rose-200 bg-rose-50 px-2 py-1 rounded">Appeal Denied</span>
                          )}
                          {res.penaltyEnforced && (
                            <button 
                              onClick={() => handleLiftPenalty(res.id)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded border border-emerald-200 transition-colors"
                            >
                              Lift Penalty
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <RegulatoryNewsFeed />
            <div className="bg-emerald-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">Total Revenue Collected</h4>
              <div className="text-3xl font-black mb-1">€{(totalFinesApplied * 0.85).toLocaleString()}</div>
              <p className="text-[10px] text-emerald-300 leading-tight">
                Net B2G revenue after administrative and blockchain transaction fees.
              </p>
              <div className="mt-6 pt-6 border-t border-emerald-800 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase">System Efficiency</span>
                <span className="text-emerald-400 font-mono text-xs">98.4%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Dispatch Logs View */}
      {activeSubTab === 'EMAILS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-800 flex items-center">
              <Mail className="w-5 h-5 text-emerald-500 mr-2" />
              Sent Violation Notices (B2G Dispatch)
            </h3>
            <button 
              onClick={() => setEmailLogs([])}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {emailLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Mail className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-semibold">No automated compliance notices dispatched yet.</p>
              </div>
            ) : (
              emailLogs.map(mail => (
                <div 
                  key={mail.id} 
                  onClick={() => setSelectedEmail(mail)}
                  className="p-4 border border-slate-150 rounded-2xl hover:border-emerald-300 hover:bg-slate-50/40 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                          {mail.tenantName}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">To: {mail.to}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {new Date(mail.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{mail.subject}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic leading-relaxed">
                      "{mail.body.substring(0, 200)}..."
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      {mail.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Metadata: {mail.violationType}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reporting View */}
      {activeSubTab === 'REPORTING' && (
        <B2gReportGenerator />
      )}

      {/* Calendar View */}
      {activeSubTab === 'CALENDAR' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Regulatory & Operational Calendar
              </h3>
              <p className="text-xs text-slate-500 mt-1">Global regulatory deadlines and automated audit schedules.</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                Regulator Deadline
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                Scheduled Scan
              </span>
            </div>
          </div>
          <ComplianceCalendar events={CALENDAR_EVENTS} />
        </div>
      )}

      {/* Cyber Scan & Auto-Fix Suite */}
      {activeSubTab === 'CYBER_DEFENSE' && (
        <CyberScanRemediationSuite />
      )}

      {activeSubTab === 'ENFORCEMENT_PIPELINE' && (
        <B2gEnforcementPipeline />
      )}

      {activeSubTab === 'AUDIT_PIPELINE' && (
        <ComplianceAuditPipeline />
      )}

      {activeSubTab === 'INTEL_WARROOM' && (
        <NationalIntelWarroom />
      )}

      {/* Advanced B2G Suite View */}
      {activeSubTab === 'ADVANCED_SUITE' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <button
              onClick={() => setAdvancedSuiteTab('PARSERS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'PARSERS' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              XBRL / SAF-T XML Parsers
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('PROCUREMENT')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'PROCUREMENT' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Procurement Qualification
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('SETTLEMENT')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'SETTLEMENT' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Central Bank Clearing
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('EVIDENCE')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'EVIDENCE' ? 'bg-purple-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Judicial RFC 3161 Evidence
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('OSS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'OSS' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              OSS Lead Authority Mechanism
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('REGIONAL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'REGIONAL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Regional Sovereignty Grid
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('CTC')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'CTC' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              CTC / Real-Time E-Invoicing
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('AI_ACT')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'AI_ACT' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              EU AI Act PMM Relay
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('NIS2')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'NIS2' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              NIS2 Incident Dispatch Hub
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('SUBPOENA')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                advancedSuiteTab === 'SUBPOENA' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sovereign Subpoena Gateway
            </button>
            <button
              onClick={() => setAdvancedSuiteTab('TIMELINE')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                advancedSuiteTab === 'TIMELINE' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Filing Workflows & Timeline</span>
            </button>
          </div>

          {advancedSuiteTab === 'TIMELINE' && <B2gFilingWorkflowTimeline />}
          {advancedSuiteTab === 'REGIONAL' && <RegionalSovereignCommandGrid />}
          {advancedSuiteTab === 'CTC' && <CtcEInvoicingGateway />}
          {advancedSuiteTab === 'AI_ACT' && <AiActPmmRelay />}
          {advancedSuiteTab === 'PARSERS' && <XmlParsersHub />}
          {advancedSuiteTab === 'PROCUREMENT' && <ProcurementQualificationEngine />}
          {advancedSuiteTab === 'SETTLEMENT' && <CentralBankClearingTracker />}
          {advancedSuiteTab === 'EVIDENCE' && <JudicialEvidenceContainer />}
          {advancedSuiteTab === 'OSS' && <OssCrossBorderMechanism />}
          {advancedSuiteTab === 'NIS2' && <Nis2IncidentDispatchHub />}
          {advancedSuiteTab === 'SUBPOENA' && <SovereignSubpoenaGateway />}
        </div>
      )}

      {/* Dialog for Email warnings preview */}
      <AnimatePresence>
        {selectedEmail && (
          <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-900 px-4 sm:px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm tracking-tight">Automated Legal Notice Dispatch Engine</span>
                </div>
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="space-y-2 text-xs border-b border-slate-100 pb-4 font-mono">
                  <div><strong className="text-slate-500">FROM:</strong> compliance-bot@nonaxen-governance.eu</div>
                  <div><strong className="text-slate-500">TO:</strong> {selectedEmail.to}</div>
                  <div><strong className="text-slate-500">DATE:</strong> {new Date(selectedEmail.timestamp).toLocaleString()}</div>
                  <div><strong className="text-slate-500">SUBJECT:</strong> {selectedEmail.subject}</div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                  {selectedEmail.body}
                </div>
              </div>

              <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal for new schedule creation */}
        {showNewScheduleModal && (
          <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-900 px-4 sm:px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-black text-sm tracking-tight flex items-center">
                  <Calendar className="w-5 h-5 text-emerald-400 mr-2" />
                  Configure Cron Scan
                </h3>
                <button onClick={() => setShowNewScheduleModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSchedule} className="p-4 sm:p-5 lg:p-6 space-y-4 text-sm text-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Scheduler Name
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Daily Fintech Audit Run"
                    value={newScheduleName}
                    onChange={(e) => setNewScheduleName(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Target Sector
                    </label>
                    <select 
                      value={newScheduleIndustry}
                      onChange={(e) => setNewScheduleIndustry(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                    >
                      <option value="Fintech">Fintech</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="AI Labs">AI Labs</option>
                      <option value="E-commerce">E-commerce</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Frequency
                    </label>
                    <select 
                      value={newScheduleFreq}
                      onChange={(e) => setNewScheduleFreq(e.target.value as any)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                    >
                      <option value="HOURLY">Hourly</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Directives Audit Set
                  </label>
                  <select 
                    value={newScheduleLaw}
                    onChange={(e) => setNewScheduleLaw(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                  >
                    <option value="GDPR Article 5e (Storage Limitation)">GDPR Article 5e (Storage Limitation)</option>
                    <option value="EU AI Act Chapter III">EU AI Act Chapter III (Conformity Audits)</option>
                    <option value="NIS2 Article 21 (Risk Management)">NIS2 Article 21 (Risk Management)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Audit Jurisdiction Filter
                  </label>
                  <input 
                    type="text" 
                    value={newScheduleScope}
                    onChange={(e) => setNewScheduleScope(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                  <button 
                    type="button"
                    onClick={() => setShowNewScheduleModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 hover:text-slate-950 transition-all"
                  >
                    Save Cron Rule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal for Timeline */}
        {selectedTimelineScan && (
          <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-900 px-4 sm:px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-black text-sm tracking-tight flex items-center">
                  <Clock className="w-5 h-5 text-emerald-400 mr-2" />
                  Lifecycle Timeline: {selectedTimelineScan.tenantName}
                </h3>
                <button onClick={() => setSelectedTimelineScan(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-5 sm:space-y-8 py-2">
                  {/* Step 1: Detection */}
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white" />
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      Violation Detected
                      {selectedTimelineScan.severity === 'CRITICAL' && <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">CRITICAL</span>}
                      {selectedTimelineScan.severity === 'HIGH' && <span className="bg-orange-100 text-orange-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">HIGH</span>}
                      {selectedTimelineScan.severity === 'MEDIUM' && <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">MED</span>}
                      {selectedTimelineScan.severity === 'LOW' && <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">LOW</span>}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{new Date(selectedTimelineScan.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">{selectedTimelineScan.lawChecked}</p>
                    {selectedTimelineScan.tags && selectedTimelineScan.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTimelineScan.tags.map(tag => (
                          <span key={tag} className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-sm border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="bg-rose-50 text-rose-700 text-[11px] p-2.5 rounded-lg mt-2 font-mono border border-rose-100">
                      {selectedTimelineScan.violationDetails || "System anomaly detected during active port scan"}
                    </div>
                  </div>

                  {/* Step 2: Warning Dispatched */}
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-white shadow-sm" />
                    <h4 className="text-xs font-bold text-slate-800">Official Notice Dispatched</h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {new Date(new Date(selectedTimelineScan.timestamp).getTime() + 2 * 60000).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedTimelineScan.emailSentTo ? `Emailed to: ` : "Automated routing pending."}
                      {selectedTimelineScan.emailSentTo && <span className="font-bold">{selectedTimelineScan.emailSentTo}</span>}
                    </p>
                  </div>

                  {/* Step 3: Enforcement */}
                  <div className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${selectedTimelineScan.penaltyEnforced ? 'bg-rose-500 shadow-sm' : 'bg-slate-200'} ring-4 ring-white`} />
                    <h4 className={`text-xs font-bold ${selectedTimelineScan.penaltyEnforced ? 'text-slate-800' : 'text-slate-400'}`}>
                      Penalty Enforced
                    </h4>
                    {selectedTimelineScan.penaltyEnforced ? (
                      <>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {new Date(new Date(selectedTimelineScan.timestamp).getTime() + 15 * 60000).toLocaleString()}
                        </p>
                        <div className="inline-flex items-center space-x-1.5 mt-2 font-bold">
                          {selectedTimelineScan.penaltyEnforced === 'AUTO_FINE' && <span className="text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded text-[10px] shadow-sm">Fine Applied: €{selectedTimelineScan.fineApplied?.toLocaleString()}</span>}
                          {selectedTimelineScan.penaltyEnforced === 'FEATURE_SUSPENSION' && <span className="text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-[10px] shadow-sm">Suspended AI inferences</span>}
                          {selectedTimelineScan.penaltyEnforced === 'API_THROTTLE' && <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded text-[10px] shadow-sm">API Throttled 80%</span>}
                          {selectedTimelineScan.penaltyEnforced === 'LOCK_CERTIFICATE' && <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded text-[10px] shadow-sm">Trust Badges Locked</span>}
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">Pending or resolved</p>
                    )}
                  </div>
                  
                  {/* Step 4: Escalation (If Applicable) */}
                  {(selectedTimelineScan.escalationLevel && selectedTimelineScan.escalationLevel > 1) && (
                    <div className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white shadow-sm" />
                      <h4 className="text-xs font-bold text-slate-800">Escalation Sequence Active</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {new Date().toLocaleString()} {/* Simulated timestamp for recent escalation */}
                      </p>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 mt-2">
                        <p className="text-xs text-indigo-800 font-semibold mb-1">Current Level: {selectedTimelineScan.escalationLevel}</p>
                        <p className="text-[11px] text-indigo-700">
                          {selectedTimelineScan.escalationLevel === 2 ? 'Second warning dispatched. Additional fines pending if unresolved.' : 'Final Legal Notice dispatched. Collections routing and full suspension imminent.'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 4.5: Appeal (If Applicable) */}
                  {selectedTimelineScan.appealStatus && (
                    <div className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-white shadow-sm ${
                        selectedTimelineScan.appealStatus === 'SUBMITTED' ? 'bg-blue-500' :
                        selectedTimelineScan.appealStatus === 'ACCEPTED' ? 'bg-emerald-500' :
                        'bg-rose-500'
                      }`} />
                      <h4 className="text-xs font-bold text-slate-800">
                        {selectedTimelineScan.appealStatus === 'SUBMITTED' && 'Formal Appeal Submitted'}
                        {selectedTimelineScan.appealStatus === 'ACCEPTED' && 'Formal Appeal Approved by Regulator'}
                        {selectedTimelineScan.appealStatus === 'REJECTED' && 'Formal Appeal Rejected by Regulator'}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {new Date().toLocaleString()} {/* Simulated timestamp */}
                      </p>
                      
                      {selectedTimelineScan.appealSummary && (
                        <div className={`border rounded-lg p-3 mt-2 ${
                          selectedTimelineScan.appealStatus === 'SUBMITTED' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                          selectedTimelineScan.appealStatus === 'ACCEPTED' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                          'bg-rose-50 border-rose-100 text-rose-800'
                        }`}>
                          <h5 className="text-[10px] font-bold flex items-center mb-1 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Judicial Summary & Findings
                          </h5>
                          <p className="text-xs leading-relaxed font-medium">
                            {selectedTimelineScan.appealSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Resolution */}
                  {(!selectedTimelineScan.penaltyEnforced || selectedTimelineScan.status === 'COMPLIANT') && (
                    <div className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${!selectedTimelineScan.penaltyEnforced && selectedTimelineScan.status !== 'COMPLIANT' ? 'bg-slate-200' : 'bg-emerald-500 shadow-sm'} ring-4 ring-white`} />
                      <h4 className={`text-xs font-bold ${!selectedTimelineScan.penaltyEnforced && selectedTimelineScan.status !== 'COMPLIANT' ? 'text-slate-400' : 'text-slate-800'}`}>Resolution & Lift</h4>
                      {(!selectedTimelineScan.penaltyEnforced && selectedTimelineScan.status !== 'COMPLIANT') ? (
                         <p className="text-[10px] font-mono text-slate-400 mt-0.5">Awaiting remediation</p>
                      ) : (
                        <>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {new Date(new Date(selectedTimelineScan.timestamp).getTime() + 120 * 60000).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">Tenant provided remediation evidence. Restrictions lifted and compliance recorded.</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Draft Section */}
              {draftedLegalResponse && (
                <div className="px-6 py-4 border-t border-slate-100 bg-indigo-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-indigo-900 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-indigo-600" />
                      AI Drafted Legal Response
                    </h4>
                    <button
                      onClick={() => navigator.clipboard.writeText(draftedLegalResponse)}
                      className="text-[10px] bg-white border border-indigo-100 px-2 py-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      Copy Text
                    </button>
                  </div>
                  <pre className="text-xs text-indigo-950 font-mono whitespace-pre-wrap p-3 bg-white border border-indigo-100 rounded-lg shadow-sm">
                    {draftedLegalResponse}
                  </pre>
                </div>
              )}

              <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => handleDraftLegalResponse(selectedTimelineScan)}
                  disabled={isDraftingResponse}
                  className="bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center"
                >
                  {isDraftingResponse ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Drafting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-2" />
                      Auto-Draft Response
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    setSelectedTimelineScan(null);
                    setDraftedLegalResponse(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  Close Timeline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Regulatory Signature Modal */}
      <AnimatePresence>
        {signatureModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                <h3 className="font-bold text-indigo-950 flex items-center">
                  <ShieldAlert className="w-5 h-5 text-indigo-600 mr-2" />
                  Secondary Approval Gate
                </h3>
                <button onClick={() => setSignatureModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-5 lg:p-6 space-y-4">
                <p className="text-sm text-slate-600 font-medium">
                  You are about to authorize enforcement penalties on {signingScanIds.length} organization(s). 
                  As a regulator, please provide your digital signature to execute these enforcements.
                </p>
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Regulator Signature (Full Name)</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder="e.g. John Doe, Lead Auditor"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end space-x-3">
                <button 
                  onClick={() => setSignatureModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSignAndEnforce}
                  disabled={!signatureName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  Sign & Enforce
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appeal Submission Modal */}
      <AnimatePresence>
        {appealModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                <h3 className="font-bold text-indigo-950 flex items-center">
                  <ShieldAlert className="w-5 h-5 text-indigo-600 mr-2" />
                  Submit Formal B2G Penalty Appeal
                </h3>
                <button onClick={() => {
                  setAppealModalOpen(false);
                  setAppealingScanId(null);
                  setAppealEvidence('');
                }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-5 lg:p-6 space-y-4 overflow-y-auto">
                <p className="text-sm text-slate-600 font-medium">
                  Submit counter-evidence and legal rebuttals for this violation. The B2G AI engine will analyze and summarize your submission for the regulator's final review.
                </p>
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Counter-Evidence & Rebuttal Statement</label>
                  <textarea
                    className="w-full h-32 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter technical proof, remediation steps, or legal arguments..."
                    value={appealEvidence}
                    onChange={(e) => setAppealEvidence(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end space-x-3 mt-auto">
                <button 
                  onClick={() => {
                    setAppealModalOpen(false);
                    setAppealingScanId(null);
                    setAppealEvidence('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitAppeal}
                  disabled={!appealEvidence.trim() || isSubmittingAppeal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center shadow-sm"
                >
                  {isSubmittingAppeal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Compile & Export Dossier'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ExportPdfDialog 
        isOpen={isPdfDialogOpen} 
        onClose={() => setIsPdfDialogOpen(false)} 
        title="Export Enforcements Ledger PDF"
      />

      {/* B2G Advanced Configuration Modal */}
      <AnimatePresence>
        {showAdvancedConfig && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-50 w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            >
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Sliders className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Advanced Enforcement Configuration</h2>
                    <p className="text-xs text-slate-500 font-medium italic">SaaS Sovereign Admin Control Module</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdvancedConfig(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-slate-50/50">
                <B2gAdvancedEnforcementConfig />
              </div>
              
              <div className="p-4 bg-white border-t border-slate-200 flex justify-end items-center">
                <button 
                  onClick={() => setShowAdvancedConfig(false)}
                  className="bg-slate-900 text-white font-bold px-5 sm:px-8 py-2.5 rounded-xl text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Close Configuration Center
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sovereign Regional Scanner Modal */}
      <AnimatePresence>
        {showRegionalScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl relative"
            >
              <SovereignRegionalScanner onClose={() => setShowRegionalScanner(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Automated Enforcement Engine Modal */}
      <AnimatePresence>
        {showEnforcementEngine && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative bg-white"
            >
              <button 
                onClick={() => setShowEnforcementEngine(false)}
                className="absolute top-6 right-6 z-10 p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-4">
                <AutomatedEnforcementEngine tenantId={selectedEnforcementTenantId} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LangGraph Engine Modal */}
      <AnimatePresence>
        {showLangGraphEngine && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="w-full max-w-6xl max-h-[90vh] h-[90vh] overflow-hidden rounded-3xl shadow-2xl relative bg-white flex flex-col"
            >
              <button 
                onClick={() => setShowLangGraphEngine(false)}
                className="absolute top-6 right-6 z-50 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <B2gLangGraphEngine />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* AI Impact Simulation Modal */}
      <AnimatePresence>
        {selectedReqForImpact && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Regulatory Impact AI</h3>
                    <p className="text-xs text-slate-500 font-medium">Predictive analysis for B2G mandates</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReqForImpact(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 sm:p-6 lg:p-8">
                <SimulateImpact onSimulate={() => {}} />
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedReqForImpact(null)}
                  className="px-6 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
