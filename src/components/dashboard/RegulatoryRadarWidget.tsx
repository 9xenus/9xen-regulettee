import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe,
  Filter,
  Search,
  ChevronRight,
  Sparkles,
  Download,
  Plus,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Layers,
  Building2,
  FileText,
  Activity,
  ArrowUpRight,
  Bell,
  Scale,
  Zap,
  Check,
  CalendarPlus,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { 
  RegionKey, 
  REGIONAL_FRAMEWORKS,
  REGIONAL_LIST
} from '../../services/regionalComplianceRulesEngine';
import { useNotification } from '../../context/NotificationContext';

export interface RegulatoryEvent {
  id: string;
  regionKey: RegionKey;
  regionName: string;
  flag: string;
  statutoryAct: string;
  authority: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  daysRemaining: number;
  category: 'STATUTORY_FILING' | 'EXTERNAL_AUDIT' | 'PRIVACY_RIGHTS' | 'RESIDENCY_CHECK' | 'AI_GOVERNANCE' | 'SECURITY_ATTESTATION';
  urgency: 'CRITICAL' | 'APPROACHING' | 'SCHEDULED' | 'HORIZON';
  ringZone: 1 | 2 | 3 | 4; // 1: <14d, 2: 15-30d, 3: 31-90d, 4: 90d+
  potentialFine: string;
  assignedOfficer: string;
  controlsTotal: number;
  controlsPassed: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'AUDIT_ACTIVE' | 'PASSED' | 'OVERDUE';
  evidenceReady: boolean;
  legalArticle: string;
  radarAngleDeg: number; // For polar visualization (0-360)
}

export interface ActiveAudit {
  id: string;
  regionKey: RegionKey;
  regionName: string;
  flag: string;
  auditName: string;
  framework: string;
  regulatorBody: string;
  leadAuditor: string;
  startDate: string;
  targetSubmissionDate: string;
  currentPhase: 'EVIDENCE_COLLECTION' | 'POLICY_TESTING' | 'DPO_REVIEW' | 'SUBMISSION_READY' | 'CERTIFIED';
  progressPercent: number;
  criticalFindings: number;
  resolvedControls: number;
  totalControls: number;
  status: 'ON_TRACK' | 'ATTENTION_NEEDED' | 'BLOCKED' | 'COMPLETED';
}

const INITIAL_RADAR_EVENTS: RegulatoryEvent[] = [
  {
    id: 'rad-1',
    regionKey: 'EU',
    regionName: 'European Union',
    flag: '🇪🇺',
    statutoryAct: 'GDPR / NIS2',
    authority: 'EDPB / CNIL / BfDI',
    title: 'Art. 30 ROPA Annual Verification & Filing',
    description: 'Statutory submission of cross-border data lineage map and automated data processing records.',
    dueDate: '2026-08-25',
    daysRemaining: 7,
    category: 'STATUTORY_FILING',
    urgency: 'CRITICAL',
    ringZone: 1,
    potentialFine: 'Up to €20,000,000 or 4% Global Turnover',
    assignedOfficer: 'Dr. Elena Rostova (EU Lead DPO)',
    controlsTotal: 18,
    controlsPassed: 16,
    status: 'AUDIT_ACTIVE',
    evidenceReady: true,
    legalArticle: 'GDPR Article 30(4)',
    radarAngleDeg: 45
  },
  {
    id: 'rad-2',
    regionKey: 'KSA',
    regionName: 'Saudi Arabia',
    flag: '🇸🇦',
    statutoryAct: 'KSA PDPL / NDMO',
    authority: 'SDAIA (Saudi Data & AI Authority)',
    title: 'Sovereign PII Residency & Cross-Border Exemption Audit',
    description: 'Mandatory certification that sensitive Saudi citizen identity records reside exclusively within local SQLite sovereign clusters.',
    dueDate: '2026-08-30',
    daysRemaining: 12,
    category: 'RESIDENCY_CHECK',
    urgency: 'CRITICAL',
    ringZone: 1,
    potentialFine: 'Up to SAR 5,000,000 + Criminal Liability',
    assignedOfficer: 'Tariq Al-Mansoor (Regional Compliance Director)',
    controlsTotal: 14,
    controlsPassed: 13,
    status: 'AUDIT_ACTIVE',
    evidenceReady: true,
    legalArticle: 'PDPL Executive Regulations Art. 29',
    radarAngleDeg: 120
  },
  {
    id: 'rad-3',
    regionKey: 'USA',
    regionName: 'United States',
    flag: '🇺🇸',
    statutoryAct: 'CCPA / CPRA & SEC Cyber',
    authority: 'CPPA / FTC / SEC',
    title: 'Q3 Consumer Opt-Out & AI Profiling Re-Certification',
    description: 'Annual verification of Global Privacy Control (GPC) signal processing and automated profiling opt-out mechanisms.',
    dueDate: '2026-09-08',
    daysRemaining: 21,
    category: 'PRIVACY_RIGHTS',
    urgency: 'APPROACHING',
    ringZone: 2,
    potentialFine: '$7,500 per intentional violation',
    assignedOfficer: 'Sarah Jenkins (VP Regulatory Affairs)',
    controlsTotal: 12,
    controlsPassed: 9,
    status: 'IN_PROGRESS',
    evidenceReady: false,
    legalArticle: 'Cal. Civ. Code § 1798.135',
    radarAngleDeg: 210
  },
  {
    id: 'rad-4',
    regionKey: 'UK',
    regionName: 'United Kingdom',
    flag: '🇬🇧',
    statutoryAct: 'UK GDPR / DPA 2018',
    authority: 'Information Commissioner’s Office (ICO)',
    title: 'International Data Transfer Agreement (IDTA) Periodic Review',
    description: 'Audit of UK-US adequacy addendums and supplementary zero-trust transfer impact assessments.',
    dueDate: '2026-09-14',
    daysRemaining: 27,
    category: 'STATUTORY_FILING',
    urgency: 'APPROACHING',
    ringZone: 2,
    potentialFine: 'Up to £17.5M or 4% Global Turnover',
    assignedOfficer: 'James Thorne (Senior Legal Counsel)',
    controlsTotal: 10,
    controlsPassed: 8,
    status: 'IN_PROGRESS',
    evidenceReady: true,
    legalArticle: 'UK GDPR Art. 46 / IDTA Clause 11',
    radarAngleDeg: 290
  },
  {
    id: 'rad-5',
    regionKey: 'EU',
    regionName: 'European Union',
    flag: '🇪🇺',
    statutoryAct: 'EU AI Act',
    authority: 'European AI Office / National Competent Authorities',
    title: 'High-Risk AI Model Transparency & Technical Documentation Dossier',
    description: 'Systematic technical logging, bias testing telemetry, and post-market surveillance plan filing for generative AI nodes.',
    dueDate: '2026-10-15',
    daysRemaining: 58,
    category: 'AI_GOVERNANCE',
    urgency: 'SCHEDULED',
    ringZone: 3,
    potentialFine: 'Up to €35,000,000 or 7% Global Turnover',
    assignedOfficer: 'Dr. Marc Dubois (Chief AI Ethics Officer)',
    controlsTotal: 22,
    controlsPassed: 17,
    status: 'IN_PROGRESS',
    evidenceReady: false,
    legalArticle: 'EU AI Act Article 11 & Annex IV',
    radarAngleDeg: 15
  },
  {
    id: 'rad-6',
    regionKey: 'APAC',
    regionName: 'Singapore / APAC',
    flag: '🇸🇬',
    statutoryAct: 'Singapore PDPA / MAS TRM',
    authority: 'PDPC / Monetary Authority of Singapore',
    title: 'Technology Risk Management & Financial Data Vault Audit',
    description: 'Tri-annual cyber hygiene and cross-border payment tokenization review under MAS guidelines.',
    dueDate: '2026-10-30',
    daysRemaining: 73,
    category: 'SECURITY_ATTESTATION',
    urgency: 'SCHEDULED',
    ringZone: 3,
    potentialFine: 'Up to SGD 1,000,000 or 10% Annual Turnover',
    assignedOfficer: 'Li Wei Chen (APAC Compliance Head)',
    controlsTotal: 16,
    controlsPassed: 14,
    status: 'PENDING',
    evidenceReady: true,
    legalArticle: 'MAS TRM Notice 644 / PDPA Sec 24',
    radarAngleDeg: 165
  },
  {
    id: 'rad-7',
    regionKey: 'UAE',
    regionName: 'United Arab Emirates',
    flag: '🇦🇪',
    statutoryAct: 'UAE Fed Decree Law No. 45',
    authority: 'UAE Data Office / DIFC Commissioner',
    title: 'DIFC Annual Data Protection Officer Attestation',
    description: 'Mandatory filing of registered data controller certification and special category biometric processing logs.',
    dueDate: '2026-11-20',
    daysRemaining: 94,
    category: 'STATUTORY_FILING',
    urgency: 'HORIZON',
    ringZone: 4,
    potentialFine: 'Up to AED 3,500,000',
    assignedOfficer: 'Amira Rashid (Gulf Compliance Lead)',
    controlsTotal: 15,
    controlsPassed: 11,
    status: 'PENDING',
    evidenceReady: false,
    legalArticle: 'DIFC DP Law 2020 Art. 19',
    radarAngleDeg: 250
  },
  {
    id: 'rad-8',
    regionKey: 'SWITZERLAND',
    regionName: 'Switzerland',
    flag: '🇨🇭',
    statutoryAct: 'Swiss FADP (revDSG)',
    authority: 'FDPIC (Federal Data Protection & Information Commissioner)',
    title: 'Cross-Border Cloud Governance & Sub-Processor Audit',
    description: 'Mandatory verification of high-level sub-processor encryption controls under revised Swiss Federal Act.',
    dueDate: '2026-12-05',
    daysRemaining: 109,
    category: 'EXTERNAL_AUDIT',
    urgency: 'HORIZON',
    ringZone: 4,
    potentialFine: 'Up to CHF 250,000 (Individual Liability)',
    assignedOfficer: 'Ursula Meier (Swiss Legal Counsel)',
    controlsTotal: 12,
    controlsPassed: 10,
    status: 'PENDING',
    evidenceReady: true,
    legalArticle: 'Swiss revDSG Art. 9 & Art. 60',
    radarAngleDeg: 330
  }
];

const INITIAL_ACTIVE_AUDITS: ActiveAudit[] = [
  {
    id: 'aud-101',
    regionKey: 'EU',
    regionName: 'European Union',
    flag: '🇪🇺',
    auditName: 'Comprehensive GDPR & DORA Regulatory Examination',
    framework: 'EU GDPR / DORA Reg (EU) 2022/2554',
    regulatorBody: 'CNIL / BaFin Joint Oversight',
    leadAuditor: 'PwC Regulatory Advisory / Internal Lead Rostova',
    startDate: '2026-08-01',
    targetSubmissionDate: '2026-08-28',
    currentPhase: 'DPO_REVIEW',
    progressPercent: 88,
    criticalFindings: 0,
    resolvedControls: 32,
    totalControls: 36,
    status: 'ON_TRACK'
  },
  {
    id: 'aud-102',
    regionKey: 'KSA',
    regionName: 'Saudi Arabia',
    flag: '🇸🇦',
    auditName: 'SDAIA National Data Governance Accreditation',
    framework: 'KSA PDPL & NDMO Specifications v2.1',
    regulatorBody: 'Saudi Data & AI Authority (SDAIA)',
    leadAuditor: 'Tariq Al-Mansoor / KPMG Al Fozan',
    startDate: '2026-08-05',
    targetSubmissionDate: '2026-09-02',
    currentPhase: 'POLICY_TESTING',
    progressPercent: 72,
    criticalFindings: 1,
    resolvedControls: 21,
    totalControls: 28,
    status: 'ATTENTION_NEEDED'
  },
  {
    id: 'aud-103',
    regionKey: 'USA',
    regionName: 'United States',
    flag: '🇺🇸',
    auditName: 'SOC 2 Type II + HIPAA Hybrid Enclave Audit',
    framework: 'AICPA Trust Services / HIPAA Security Rule',
    regulatorBody: 'Independent AICPA Assessor / HHS OCR',
    leadAuditor: 'Schellman & Co. / Sarah Jenkins',
    startDate: '2026-07-15',
    targetSubmissionDate: '2026-09-15',
    currentPhase: 'EVIDENCE_COLLECTION',
    progressPercent: 64,
    criticalFindings: 0,
    resolvedControls: 44,
    totalControls: 62,
    status: 'ON_TRACK'
  },
  {
    id: 'aud-104',
    regionKey: 'APAC',
    regionName: 'Singapore / APAC',
    flag: '🇸🇬',
    auditName: 'MAS Cyber Resilience & PDPA Assurance Review',
    framework: 'MAS TRM Guidelines / SG PDPA',
    regulatorBody: 'Monetary Authority of Singapore (MAS)',
    leadAuditor: 'Deloitte Singapore / Li Wei Chen',
    startDate: '2026-08-10',
    targetSubmissionDate: '2026-09-25',
    currentPhase: 'POLICY_TESTING',
    progressPercent: 55,
    criticalFindings: 0,
    resolvedControls: 18,
    totalControls: 30,
    status: 'ON_TRACK'
  }
];

interface RegulatoryRadarWidgetProps {
  onSelectEvent?: (event: RegulatoryEvent) => void;
  className?: string;
  defaultRegion?: RegionKey | 'ALL';
}

export const RegulatoryRadarWidget: React.FC<RegulatoryRadarWidgetProps> = ({
  onSelectEvent,
  className = '',
  defaultRegion = 'ALL'
}) => {
  const { showToast } = useNotification();
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | 'ALL'>(defaultRegion);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'RADAR' | 'DEADLINES' | 'AUDITS' | 'MATRIX'>('RADAR');
  const [searchTerm, setSearchTerm] = useState('');
  const [radarScanning, setRadarScanning] = useState(true);
  const [hoveredEvent, setHoveredEvent] = useState<RegulatoryEvent | null>(null);
  const [activeModalEvent, setActiveModalEvent] = useState<RegulatoryEvent | null>(null);
  const [events, setEvents] = useState<RegulatoryEvent[]>(INITIAL_RADAR_EVENTS);
  const [activeAudits, setActiveAudits] = useState<ActiveAudit[]>(INITIAL_ACTIVE_AUDITS);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Filter events based on criteria
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchRegion = selectedRegion === 'ALL' || e.regionKey === selectedRegion;
      const matchCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchUrgency = selectedUrgency === 'ALL' || e.urgency === selectedUrgency;
      const matchSearch = searchTerm === '' || 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.statutoryAct.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.regionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.authority.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRegion && matchCategory && matchUrgency && matchSearch;
    });
  }, [events, selectedRegion, selectedCategory, selectedUrgency, searchTerm]);

  // Filter active audits
  const filteredAudits = useMemo(() => {
    return activeAudits.filter(a => {
      const matchRegion = selectedRegion === 'ALL' || a.regionKey === selectedRegion;
      const matchSearch = searchTerm === '' ||
        a.auditName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.framework.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.regulatorBody.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [activeAudits, selectedRegion, searchTerm]);

  // Counts by urgency
  const urgentCount = useMemo(() => events.filter(e => e.ringZone === 1).length, [events]);
  const nearTermCount = useMemo(() => events.filter(e => e.ringZone === 2).length, [events]);
  const activeAuditsCount = useMemo(() => activeAudits.filter(a => a.status !== 'COMPLETED').length, [activeAudits]);

  // Trigger real-time radar sweep / scan
  const triggerComplianceSweep = () => {
    setIsScanning(true);
    setScanMessage('Scanning 11 sovereign enclaves for statutory deadline changes and audit triggers...');
    
    setTimeout(() => {
      setScanMessage('Verifying zero-trust cryptographic attestations across EU, KSA, US, and APAC shards...');
    }, 1200);

    setTimeout(() => {
      setIsScanning(false);
      setScanMessage(null);
      // Auto update one control for interactive feel
      setEvents(prev => prev.map(ev => {
        if (ev.controlsPassed < ev.controlsTotal) {
          return { ...ev, controlsPassed: Math.min(ev.controlsTotal, ev.controlsPassed + 1) };
        }
        return ev;
      }));
    }, 2400);
  };

  // Export iCal .ics for Compliance Officers
  const exportICalendar = () => {
    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//9Xen Regulettee CaaS//Regulatory Radar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n";
    
    events.forEach(ev => {
      const dateParts = ev.dueDate.split('-');
      if (dateParts.length === 3) {
        const dt = `${dateParts[0]}${dateParts[1]}${dateParts[2]}`;
        icsContent += `BEGIN:VEVENT\r\nSUMMARY:[${ev.regionKey}] ${ev.title}\r\nDESCRIPTION:${ev.description}\\nStatutory Act: ${ev.statutoryAct}\\nAuthority: ${ev.authority}\\nLegal Article: ${ev.legalArticle}\\nPotential Fine: ${ev.potentialFine}\r\nDTSTART;VALUE=DATE:${dt}\r\nDTEND;VALUE=DATE:${dt}\r\nSTATUS:CONFIRMED\r\nLOCATION:${ev.regionName}\r\nCATEGORIES:COMPLIANCE,REGULATORY,${ev.category}\r\nEND:VEVENT\r\n`;
      }
    });

    icsContent += "END:VCALENDAR\r\n";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Regulatory_Radar_Deadlines_${new Date().toISOString().split('T')[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export JSON Briefing Dossier
  const exportDossier = () => {
    const dossier = {
      radarExportTimestamp: new Date().toISOString(),
      activeJurisdictionFilter: selectedRegion,
      summary: {
        totalTrackedDeadlines: events.length,
        criticalDeadlinesUnder14Days: urgentCount,
        approachingUnder30Days: nearTermCount,
        activeInFlightAudits: activeAuditsCount
      },
      regulatoryDeadlines: events,
      activeAudits: activeAudits
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossier, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `Regulatory_Radar_Executive_Briefing_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  // Mark an event as verified / completed
  const handleMarkCompleted = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'PASSED', controlsPassed: e.controlsTotal } : e));
    if (activeModalEvent && activeModalEvent.id === id) {
      setActiveModalEvent(prev => prev ? { ...prev, status: 'PASSED', controlsPassed: prev.controlsTotal } : null);
    }
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden text-left ${className}`}>
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b15_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b15_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                Cross-Border Regulatory Radar
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {activeAuditsCount} Active Statutory Audits
              </span>
              {urgentCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  {urgentCount} Critical Filings (&lt;14 Days)
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Jurisdictional Radar & Audit Intelligence</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Spatial tracking of statutory filing deadlines, active supervisory audits, and compliance milestones across 11 sovereign territories.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={triggerComplianceSweep}
              disabled={isScanning}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning Enclaves...' : 'Scan Enclaves'}
            </button>

            <button
              onClick={exportICalendar}
              title="Export all regulatory deadlines to Apple/Google/Outlook Calendar (.ics)"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-emerald-300" />
              Sync iCal (.ics)
            </button>

            <button
              onClick={exportDossier}
              title="Download JSON Regulatory Radar dossier"
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-300" />
              Export Dossier
            </button>
          </div>
        </div>

        {/* Live scanning banner if scanning */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-indigo-200"
            >
              <Activity className="w-4 h-4 animate-pulse text-indigo-400" />
              <span>{scanMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control / Navigation Strip */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
          {[
            { id: 'RADAR', label: 'Radar Spatial Map', icon: Compass, count: events.length },
            { id: 'DEADLINES', label: 'Statutory Deadlines', icon: Calendar, count: filteredEvents.length },
            { id: 'AUDITS', label: 'Active Supervisory Audits', icon: ShieldCheck, count: filteredAudits.length },
            { id: 'MATRIX', label: 'Regional Health Matrix', icon: Globe, count: 11 }
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isCurrent ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Jurisdiction & Search Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region Dropdown */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden appearance-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">🌐 All Jurisdictions ({events.length} Events)</option>
              {REGIONAL_LIST.map((r: { key: RegionKey; displayName: string; flag: string }) => (
                <option key={r.key} value={r.key}>
                  {r.flag} {r.displayName} ({r.key})
                </option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search acts, regulators, filings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: RADAR SPATIAL MAP */}
          {activeTab === 'RADAR' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Polar Radar Visualizer (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[460px] border border-slate-800 shadow-inner">
                {/* Radar grid coordinates & center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Concentric distance rings */}
                  <div className="w-[380px] h-[380px] rounded-full border border-indigo-500/20 absolute flex items-center justify-center">
                    <span className="absolute top-2 text-[9px] font-mono text-indigo-400/50 uppercase font-bold tracking-widest">
                      Ring 4: Horizon (90d+)
                    </span>
                  </div>
                  <div className="w-[280px] h-[280px] rounded-full border border-indigo-500/30 absolute flex items-center justify-center">
                    <span className="absolute top-2 text-[9px] font-mono text-indigo-300/60 uppercase font-bold tracking-widest">
                      Ring 3: Scheduled (31-90d)
                    </span>
                  </div>
                  <div className="w-[180px] h-[180px] rounded-full border border-amber-500/40 absolute flex items-center justify-center">
                    <span className="absolute top-2 text-[9px] font-mono text-amber-300/70 uppercase font-bold tracking-widest">
                      Ring 2: Active (15-30d)
                    </span>
                  </div>
                  <div className="w-[90px] h-[90px] rounded-full border border-rose-500/60 bg-rose-500/10 absolute flex items-center justify-center">
                    <span className="absolute top-1 text-[8px] font-mono text-rose-300 font-black tracking-widest">
                      &lt;14d
                    </span>
                  </div>

                  {/* Crosshair lines */}
                  <div className="w-full h-[1px] bg-indigo-500/20 absolute" />
                  <div className="h-full w-[1px] bg-indigo-500/20 absolute" />
                  <div className="w-full h-[1px] bg-indigo-500/10 absolute rotate-45" />
                  <div className="w-full h-[1px] bg-indigo-500/10 absolute -rotate-45" />
                </div>

                {/* Radar sweep beam animation */}
                {radarScanning && (
                  <div 
                    className="absolute w-[380px] h-[380px] rounded-full pointer-events-none"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(99, 102, 241, 0.25) 360deg)',
                      animation: 'radar-spin 4s linear infinite'
                    }}
                  />
                )}

                {/* Radar Blips (Events) */}
                <div className="relative w-[380px] h-[380px] flex items-center justify-center">
                  {filteredEvents.map((ev) => {
                    // Calculate radius based on ringZone
                    const ringRadii = { 1: 35, 2: 85, 3: 135, 4: 175 };
                    const radius = ringRadii[ev.ringZone];
                    const rad = (ev.radarAngleDeg * Math.PI) / 180;
                    const x = radius * Math.cos(rad);
                    const y = radius * Math.sin(rad);

                    const isHovered = hoveredEvent?.id === ev.id;
                    const urgencyColor = 
                      ev.ringZone === 1 ? 'bg-rose-500 text-rose-100 shadow-rose-500/50' :
                      ev.ringZone === 2 ? 'bg-amber-500 text-amber-100 shadow-amber-500/50' :
                      ev.ringZone === 3 ? 'bg-indigo-500 text-indigo-100 shadow-indigo-500/50' :
                      'bg-emerald-500 text-emerald-100 shadow-emerald-500/50';

                    return (
                      <div
                        key={ev.id}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                          position: 'absolute'
                        }}
                        onMouseEnter={() => setHoveredEvent(ev)}
                        onClick={() => setActiveModalEvent(ev)}
                        className="cursor-pointer group z-20"
                      >
                        {/* Blip Circle */}
                        <div className={`w-6 h-6 rounded-full ${urgencyColor} shadow-lg flex items-center justify-center text-[10px] font-black border-2 border-slate-900 transition-transform transform group-hover:scale-150 relative`}>
                          <span className="text-[10px] leading-none">{ev.flag}</span>
                          {ev.ringZone === 1 && (
                            <span className="absolute -inset-1 rounded-full border border-rose-400 animate-ping opacity-75" />
                          )}
                        </div>

                        {/* Hover Tag */}
                        <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 pointer-events-none transition-all whitespace-nowrap ${
                          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}>
                          <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xl border border-slate-700">
                            {ev.statutoryAct} ({ev.daysRemaining}d left)
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Center Sovereign Core */}
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center z-10 border-2 border-indigo-400 shadow-lg shadow-indigo-500/50">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                {/* Radar Footer Controls */}
                <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;14d Critical
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> 15-30d Active
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" /> 31-90d
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> 90d+
                    </span>
                  </div>

                  <button
                    onClick={() => setRadarScanning(!radarScanning)}
                    className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Activity className="w-3 h-3" />
                    {radarScanning ? 'Pause Sweep' : 'Resume Sweep'}
                  </button>
                </div>
              </div>

              {/* Event Inspector & Detail Card (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                {/* Active or Hovered Event Details */}
                {hoveredEvent || filteredEvents[0] ? (
                  (() => {
                    const active = hoveredEvent || filteredEvents[0];
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs h-full flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{active.flag}</span>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">
                                  {active.regionName} ({active.regionKey})
                                </span>
                                <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                                  {active.authority}
                                </span>
                              </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                              active.ringZone === 1 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              active.ringZone === 2 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            }`}>
                              {active.daysRemaining} DAYS REMAINING
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 mt-3">
                            {active.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {active.description}
                          </p>

                          <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="text-[10px] text-slate-400 font-mono block">Statutory Act</span>
                              <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                                {active.statutoryAct}
                              </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="text-[10px] text-slate-400 font-mono block">Statutory Article</span>
                              <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                                {active.legalArticle}
                              </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="text-[10px] text-slate-400 font-mono block">Due Date</span>
                              <span className="font-bold text-slate-800 text-[11px] block mt-0.5 font-mono">
                                {active.dueDate}
                              </span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="text-[10px] text-slate-400 font-mono block">Controls Passed</span>
                              <span className="font-bold text-emerald-700 text-[11px] block mt-0.5 font-mono">
                                {active.controlsPassed} / {active.controlsTotal} Controls
                              </span>
                            </div>
                          </div>

                          {/* Penalty Exposure Callout */}
                          <div className="mt-3.5 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                            <span className="text-[10px] text-rose-600 font-mono uppercase font-bold block">
                              Statutory Penalty Exposure (If Missed):
                            </span>
                            <span className="text-xs font-black text-rose-900 block mt-0.5">
                              {active.potentialFine}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setActiveModalEvent(active)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer flex-1 justify-center shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect Full Dossier
                          </button>

                          <button
                            onClick={() => handleMarkCompleted(active.id)}
                            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verify
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
                    Hover over radar blips to inspect details.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: STATUTORY DEADLINES LIST */}
          {activeTab === 'DEADLINES' && (
            <motion.div
              key="deadlines"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <div className="flex flex-wrap gap-1.5">
                  {(['ALL', 'CRITICAL', 'APPROACHING', 'SCHEDULED', 'HORIZON'] as const).map(urgency => (
                    <button
                      key={urgency}
                      onClick={() => setSelectedUrgency(urgency)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedUrgency === urgency
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {urgency === 'ALL' ? 'All Urgencies' : urgency}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredEvents.length} deadlines
                </span>
              </div>

              {/* Deadlines Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">Territory & Authority</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Filing / Statutory Milestone</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Statute & Article</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Due Date & Countdown</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Control Progress</th>
                      <th className="px-4 py-3 font-bold text-slate-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvents.map((ev) => {
                      const isComplete = ev.status === 'PASSED';
                      return (
                        <tr key={ev.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{ev.flag}</span>
                              <div>
                                <span className="font-bold text-slate-900 block">{ev.regionName}</span>
                                <span className="text-[10px] font-mono text-indigo-600">{ev.authority}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 max-w-xs">
                            <span className="font-bold text-slate-800 block text-xs">{ev.title}</span>
                            <span className="text-[11px] text-slate-500 truncate block mt-0.5">{ev.description}</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-slate-700 block">{ev.statutoryAct}</span>
                            <span className="text-[10px] font-mono text-slate-400">{ev.legalArticle}</span>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-slate-800 block">{ev.dueDate}</span>
                            <span className={`inline-flex items-center px-2 py-0.2 rounded text-[10px] font-bold font-mono mt-0.5 ${
                              isComplete ? 'bg-emerald-100 text-emerald-800' :
                              ev.ringZone === 1 ? 'bg-rose-100 text-rose-800' :
                              ev.ringZone === 2 ? 'bg-amber-100 text-amber-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {isComplete ? '✓ CERTIFIED' : `${ev.daysRemaining} days left`}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-slate-600">
                                <span>{ev.controlsPassed}/{ev.controlsTotal} Passed</span>
                                <span>{Math.round((ev.controlsPassed / ev.controlsTotal) * 100)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    ev.controlsPassed === ev.controlsTotal ? 'bg-emerald-500' : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${(ev.controlsPassed / ev.controlsTotal) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setActiveModalEvent(ev)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                View Dossier
                              </button>
                              <button
                                onClick={() => handleMarkCompleted(ev.id)}
                                title="Mark all controls as validated"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer border border-emerald-200"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredEvents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          No regulatory deadlines match your current search and filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ACTIVE SUPERVISORY AUDITS */}
          {activeTab === 'AUDITS' && (
            <motion.div
              key="audits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAudits.map((aud) => {
                  return (
                    <div
                      key={aud.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs hover:border-indigo-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{aud.flag}</span>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 leading-tight">
                              {aud.auditName}
                            </h4>
                            <span className="text-[11px] font-mono text-indigo-700 font-semibold">
                              {aud.regulatorBody}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          aud.status === 'ON_TRACK' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          aud.status === 'ATTENTION_NEEDED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {aud.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Progress Bar & Phase */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                          <span>Current Phase: {aud.currentPhase.replace('_', ' ')}</span>
                          <span className="font-mono text-indigo-600">{aud.progressPercent}% Completed</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${aud.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                          <span>Controls: {aud.resolvedControls}/{aud.totalControls} Verified</span>
                          <span>Target: {aud.targetSubmissionDate}</span>
                        </div>
                      </div>

                      {/* Detail attributes */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-mono block">Framework</span>
                          <span className="font-bold text-slate-800 text-[11px]">{aud.framework}</span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-mono block">Lead Auditor</span>
                          <span className="font-bold text-slate-800 text-[11px] truncate block">{aud.leadAuditor}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Started: {aud.startDate}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => showToast(`Generating Evidence Pack for ${aud.auditName}...`, 'info')}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Evidence Pack
                          </button>
                          <button
                            onClick={() => showToast(`Launching live audit telemetry sweep for ${aud.regulatorBody}...`, 'info')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                          >
                            Run Auto-Test
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 4: REGIONAL HEALTH MATRIX */}
          {activeTab === 'MATRIX' && (
            <motion.div
              key="matrix"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {REGIONAL_LIST.map((reg: { key: RegionKey; displayName: string; flag: string; currency: string; dataCenter: string; actCount: number; ruleCount: number }) => {
                  const regEvents = events.filter(e => e.regionKey === reg.key);
                  const regAudits = activeAudits.filter(a => a.regionKey === reg.key);
                  const framework = REGIONAL_FRAMEWORKS[reg.key];
                  const hasUrgent = regEvents.some(e => e.ringZone === 1);

                  return (
                    <div
                      key={reg.key}
                      onClick={() => {
                        setSelectedRegion(reg.key);
                        setActiveTab('RADAR');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
                        hasUrgent
                          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                          : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{reg.flag}</span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{reg.displayName}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{framework?.sovereignDataCenter}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          hasUrgent ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {hasUrgent ? 'ACTION REQ' : 'SECURE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 font-mono block">Acts</span>
                          <span className="font-black text-slate-800">{reg.actCount}</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 font-mono block">Deadlines</span>
                          <span className="font-black text-indigo-600">{regEvents.length}</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 font-mono block">Audits</span>
                          <span className="font-black text-emerald-600">{regAudits.length}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-indigo-600 font-bold">
                        <span>Inspect Region Radar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL: Full Dossier Inspector */}
      <AnimatePresence>
        {activeModalEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeModalEvent.flag}</span>
                  <div>
                    <span className="text-[11px] font-mono text-indigo-300 font-bold uppercase tracking-wider block">
                      {activeModalEvent.regionName} Statutory Dossier
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      {activeModalEvent.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalEvent(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <p className="text-slate-600 leading-relaxed text-sm">
                  {activeModalEvent.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Governing Act</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{activeModalEvent.statutoryAct}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Supervisory Regulator</span>
                    <span className="font-bold text-indigo-700 mt-0.5 block">{activeModalEvent.authority}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Statutory Article</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{activeModalEvent.legalArticle}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Filing Due Date</span>
                    <span className="font-bold text-slate-900 mt-0.5 block font-mono">{activeModalEvent.dueDate}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Days Remaining</span>
                    <span className="font-bold text-rose-700 mt-0.5 block font-mono">{activeModalEvent.daysRemaining} Days</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-mono block">Assigned Lead</span>
                    <span className="font-bold text-slate-900 mt-0.5 block truncate">{activeModalEvent.assignedOfficer}</span>
                  </div>
                </div>

                {/* Penalty Warning Card */}
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Statutory Non-Compliance Liability</span>
                  </div>
                  <p className="text-rose-700 text-xs">
                    {activeModalEvent.potentialFine}
                  </p>
                </div>

                {/* Evidence Checklist */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-800 block">Required Evidence Controls</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-slate-700">Physical SQLite Sovereign Shard Verification</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-slate-700">Kyber-768 Quantum Tunnel Encryption Telemetry</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-slate-700">Article 83 Remediation Defense Dossier</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">PENDING SIGN-OFF</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleMarkCompleted(activeModalEvent.id);
                    setActiveModalEvent(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Certify All Controls & Remediate
                </button>

                <button
                  onClick={() => setActiveModalEvent(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: radar-spin 12s linear infinite;
        }
      `}</style>
    </div>
  );
};
