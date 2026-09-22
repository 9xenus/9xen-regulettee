import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  FileText,
  Clock,
  UserCheck,
  Send,
  Download,
  Database,
  Building2,
  Scale,
  ShieldAlert,
  Coins,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCw,
  FileCode,
  PenTool,
  Bookmark,
  Sparkles,
  User,
  Layers,
  ChevronRight,
  Printer,
  ChevronDown,
  Info
} from 'lucide-react';
import { ExportPdfDialog } from './ExportPdfDialog';
import { ViolationSurveillanceTrend } from './ViolationSurveillanceTrend';

// ==========================================
// DATA TYPE SCHEMAS
// ==========================================

export interface Violation {
  id: string;
  violationId: string;
  targetSubsidiary: string;
  country: 'DE' | 'FR' | 'ES' | 'IE' | 'NL' | 'EE';
  countryLaw: string;
  exposureMatrix: string;
  severity: 'Critical' | 'High' | 'Minor';
  framework: 'EU AI Act High-Risk' | 'GDPR Article 32' | 'EU Data Act' | 'CBAM Weight log';
  estimatedFine: number;
  fineStatus: 'Enforced' | 'Pending SLA' | 'Auto-Exempted' | 'Escrow Sealed';
  fineInvoiceRef?: string;
  autoBillingTrigger: boolean;
  assignedTeam: 'Local DPO' | 'Internal IT Auditing' | 'Third-Party Attorney' | 'Chief Compliance Officer';
  slaSecondsRemaining: number;
  slaMaxSeconds: number;
  description: string;
}

export function EuViolationSurveillanceHub() {
  // ==========================================
  // PANEL 1: QUERY & FACET FILTER STATES
  // ==========================================
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('All EU');
  const [selectedFramework, setSelectedFramework] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedSlaStatus, setSelectedSlaStatus] = useState<string>('All');

  // Multi-selection row checklists for Panel 2 Ledger
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set(['V-8821']));

  // ==========================================
  // INITIAL MOCK STATE FOR REVOLVING VIOLATIONS
  // ==========================================
  const [violations, setViolations] = useState<Violation[]>([
    {
      id: 'v1',
      violationId: 'V-8821',
      targetSubsidiary: 'Berlin FinTech Node (GmbH)',
      country: 'DE',
      countryLaw: 'Germany BDSG Sec 26',
      exposureMatrix: 'AI Bias in Loan Scoring Model - High Risk',
      severity: 'Critical',
      framework: 'EU AI Act High-Risk',
      estimatedFine: 450000,
      fineStatus: 'Enforced',
      fineInvoiceRef: '#INV-9901',
      autoBillingTrigger: true,
      assignedTeam: 'Chief Compliance Officer',
      slaSecondsRemaining: 15165, // 04h 12m 45s
      slaMaxSeconds: 86400, // 24 hours
      description: 'Discriminatory features matching postal codes in German states detected within the live neural networks module causing rejection spikes.'
    },
    {
      id: 'v2',
      violationId: 'V-8822',
      targetSubsidiary: 'Paris Logistics Center (SAS)',
      country: 'FR',
      countryLaw: 'France ESG Taxonomy / CBAM',
      exposureMatrix: 'CBAM Weight Log Mismatch',
      severity: 'High',
      framework: 'CBAM Weight log',
      estimatedFine: 120000,
      fineStatus: 'Pending SLA',
      autoBillingTrigger: false,
      assignedTeam: 'Internal IT Auditing',
      slaSecondsRemaining: 34210, // ~9.5 hrs
      slaMaxSeconds: 86400,
      description: 'Discrepancy of carbon intensity records on imports. Native telemetry failed to match local French Customs carbon weight ledger filings.'
    },
    {
      id: 'v3',
      violationId: 'V-8823',
      targetSubsidiary: 'Madrid South Hub (SL)',
      country: 'ES',
      countryLaw: 'Spain LOPDGDD Art 74 bis',
      exposureMatrix: 'Unsanctioned Generative Model Refinement',
      severity: 'High',
      framework: 'EU AI Act High-Risk',
      estimatedFine: 280000,
      fineStatus: 'Pending SLA',
      autoBillingTrigger: true,
      assignedTeam: 'Third-Party Attorney',
      slaSecondsRemaining: 5540, // ~1.5 hrs
      slaMaxSeconds: 43200, // 12 hours
      description: 'Bypassing explicit customer opt-out of neural net weights reinforcement. Model logs show recursive training cycles using Spanish enterprise data.'
    },
    {
      id: 'v4',
      violationId: 'V-8824',
      targetSubsidiary: 'Dublin Edge Server Node (Ltd)',
      country: 'IE',
      countryLaw: 'Irish Data Protection Act Sec 109',
      exposureMatrix: 'Egress Proxy Pipeline Leakage',
      severity: 'Critical',
      framework: 'GDPR Article 32',
      estimatedFine: 850000,
      fineStatus: 'Enforced',
      fineInvoiceRef: '#INV-8821',
      autoBillingTrigger: true,
      assignedTeam: 'Local DPO',
      slaSecondsRemaining: 0, // Breached
      slaMaxSeconds: 86400,
      description: 'Outbound user telemetry routed through unsecured public proxies without valid cryptographic signatures. Direct infraction of compliance mandates.'
    },
    {
      id: 'v5',
      violationId: 'V-8825',
      targetSubsidiary: 'Tallinn Government Vault Cloud',
      country: 'EE',
      countryLaw: 'Estonian IKS § 42',
      exposureMatrix: 'X-Road ASI Envelope Handshake Error',
      severity: 'Minor',
      framework: 'EU Data Act',
      estimatedFine: 45000,
      fineStatus: 'Escrow Sealed',
      autoBillingTrigger: false,
      assignedTeam: 'Internal IT Auditing',
      slaSecondsRemaining: 78900,
      slaMaxSeconds: 172800, // 48 hours
      description: 'Missing cryptographic signing wrapper on Baltic regional records. Reverted to fall-back tunnel without State X-Road ledger authorization.'
    },
    {
      id: 'v6',
      violationId: 'v-8826',
      targetSubsidiary: 'Amsterdam Core Ledger Hub (BV)',
      country: 'NL',
      countryLaw: 'Dutch UAVG Supplementary Regs',
      exposureMatrix: 'Citizen Re-identifiability Risk',
      severity: 'High',
      framework: 'GDPR Article 32',
      estimatedFine: 320000,
      fineStatus: 'Pending SLA',
      autoBillingTrigger: false,
      assignedTeam: 'Local DPO',
      slaSecondsRemaining: 21900, // 6 hrs
      slaMaxSeconds: 86400,
      description: 'Aggregation matrices permit direct extraction of medical client postal and credit scores. Dutch AP authority raised security override ticket.'
    }
  ]);

  // ==========================================
  // PANEL 3: LIVE REPORT EDITOR DOCUMENT STATE
  // ==========================================
  const [docTitle, setDocTitle] = useState<string>('EU Regulatory Breach Report & Mitigation Directive Framework (Draft V1.4)');
  const [docContent, setDocContent] = useState<string>(
    `# EU REGULATORY COMPLIANCE ENFORCEMENT RECORD
REF ID: REG-VIOL-2026-X11
DATE OF INQUEST: June 13, 2026
ISSUING AUTHORITY: Central Euro-Zone Compliance Surveillance

## 1. ABSTRACT & BACKGROUND OF VIOLATION
This active enforcement decree registers a statutory structural breach regarding algorithmic processing in critical European nodes. Under statutory oversight clauses, telemetry systems monitored an operational drift exceeding baseline safety standards.

## 2. EVIDENCE AND EXPOSURE MATRIX (GERMANY / FRANCE FOCUS)
- **Berlin FinTech Node:** Discovered an unmitigated demographic gradient biasing loan score outputs under BDSG Section 26.
- **Paris Logistics Center:** Verified carbon-weight reporting metrics mismatched local customs registries (CBAM-2026).

## 3. AUTONOMOUS PENALTY ALLOCATION SUMMARY
Pursuant to Title VIII of the EU Artificial Intelligence Regulation and GDPR principles of data hygiene:
1. Automated invoice #INV-9901 has been dispatched for €450,000.
2. Mandatory localized remedial task lists must be delegated to state-authorized DPOs within the statutory 24-Hour SLA threshold.

---
*Verified End-To-End Encrypted Secure Handshake Document Server.*`
  );
  const [isDocCertified, setIsDocCertified] = useState<boolean>(true);
  const [signeeName, setSigneeName] = useState<string>('Legal-Director-Admin-01');
  const [certifiedSuccessMessage, setCertifiedSuccessMessage] = useState<string>('');
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // ==========================================
  // DYNAMIC TICKING TIMER SIMULATION (SLA COUNTER)
  // ==========================================
  useEffect(() => {
    const timer = setInterval(() => {
      setViolations((prevViolations) =>
        prevViolations.map((v) => {
          if (v.slaSecondsRemaining > 0) {
            return {
              ...v,
              slaSecondsRemaining: Math.max(0, v.slaSecondsRemaining - 1),
            };
          }
          return v;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Helper for Countdown Clocks
  const formatSlaClock = (sec: number) => {
    if (sec <= 0) return 'BREACHED / SLA EXPIRED';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  // ==========================================
  // FACET FILTERED VIOLATIONS LIST
  // ==========================================
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      // 1. Omni Search (Case, Subsidiary, Country, Law, Exposure)
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        v.violationId.toLowerCase().includes(query) ||
        v.targetSubsidiary.toLowerCase().includes(query) ||
        v.countryLaw.toLowerCase().includes(query) ||
        v.exposureMatrix.toLowerCase().includes(query) ||
        v.framework.toLowerCase().includes(query);

      // 2. Jurisdiction Filter
      const matchesJurisdiction =
        selectedJurisdiction === 'All EU' ||
        (selectedJurisdiction === 'Germany' && v.country === 'DE') ||
        (selectedJurisdiction === 'France' && v.country === 'FR') ||
        (selectedJurisdiction === 'Spain' && v.country === 'ES') ||
        (selectedJurisdiction === 'Ireland' && v.country === 'IE') ||
        (selectedJurisdiction === 'Estonia' && v.country === 'EE') ||
        (selectedJurisdiction === 'Netherlands' && v.country === 'NL');

      // 3. Framework Filter
      const matchesFramework =
        selectedFramework === 'All' || v.framework === selectedFramework;

      // 4. Severity Filter
      const matchesSeverity =
        selectedSeverity === 'All' || v.severity === selectedSeverity;

      // 5. SLA Status Filter
      const matchesSla =
        selectedSlaStatus === 'All' ||
        (selectedSlaStatus === 'Breached' && v.slaSecondsRemaining === 0) ||
        (selectedSlaStatus === 'Pending' && v.slaSecondsRemaining > 0);

      return matchesSearch && matchesJurisdiction && matchesFramework && matchesSeverity && matchesSla;
    });
  }, [violations, searchTerm, selectedJurisdiction, selectedFramework, selectedSeverity, selectedSlaStatus]);

  // Dynamic counter metrics based on current violations state
  const metrics = useMemo(() => {
    const totalCount = violations.length;
    const criticalCount = violations.filter(v => v.severity === 'Critical').length;
    const breachedSlaCount = violations.filter(v => v.slaSecondsRemaining === 0).length;
    const totalEnforcedFineValue = violations
      .filter(v => v.fineStatus === 'Enforced' || v.fineStatus === 'Escrow Sealed')
      .reduce((sum, v) => sum + v.estimatedFine, 0);

    return { totalCount, criticalCount, breachedSlaCount, totalEnforcedFineValue };
  }, [violations]);

  // Toggle selection checklist row
  const toggleRowSelected = (violationId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(violationId)) {
        next.delete(violationId);
      } else {
        next.add(violationId);
      }
      return next;
    });
  };

  // Toggle all row checklist
  const toggleAllRows = () => {
    if (selectedRowIds.size === filteredViolations.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredViolations.map(f => f.violationId)));
    }
  };

  // Toggle Auto Billing Switch
  const toggleAutoBillingForViolation = (id: string) => {
    setViolations(prev =>
      prev.map(v => (v.id === id ? { ...v, autoBillingTrigger: !v.autoBillingTrigger } : v))
    );
  };

  // Trigger fine status adjustment manually
  const triggerManualFineIssuance = (id: string) => {
    setViolations(prev =>
      prev.map(v => {
        if (v.id === id) {
          return {
            ...v,
            fineStatus: 'Enforced',
            fineInvoiceRef: `#INV-${Math.floor(1000 + Math.random() * 9000)}`
          };
        }
        return v;
      })
    );
  };

  // Change Task Assignment Dropdown
  const changeTeamAssignment = (id: string, newTeam: any) => {
    setViolations(prev =>
      prev.map(v => (v.id === id ? { ...v, assignedTeam: newTeam } : v))
    );
  };

  // Reset demo states
  const handleResetDemoData = () => {
    setSearchTerm('');
    setSelectedJurisdiction('All EU');
    setSelectedFramework('All');
    setSelectedSeverity('All');
    setSelectedSlaStatus('All');
    setSelectedRowIds(new Set(['V-8821']));
  };

  // Inject Regulatory Paragraph to document
  const handleInjectParagraph = (type: 'AI_ACT' | 'GDPR_FINE' | 'MITIGATION') => {
    let textToInject = '';
    if (type === 'AI_ACT') {
      textToInject = `\n\n### APPENDIX CR-2: STATUTORY COMPLIANCE STATEMENT WITH EU AI ACT TITLE VIII\nThe system operates autonomous testing mechanisms validated matching bias quotients. Bias variance must remain within delta-0.03 intervals before weights model exposure can clear sovereign gate protocols.`;
    } else if (type === 'GDPR_FINE') {
      textToInject = `\n\n### SECTION 4.1: FINE STRUCTURE (DEVIANT MITIGATION THRESHOLDS)\nAny entity registered with an audit deficit in cross-border citizen routing is subject to a flat penalty capped at €45,000 or up to 4% global turnover under GDPR structural governance standards.`;
    } else {
      const text = `\n\n### ACTION ROADMAP FOR LOCAL DPO COGNIZANCE\nDPO is instructed to clear egress cache, generate cryptographic TLS checksums, and publish ASI Envelope transaction certificates to state registers within 4 hours.`;
      textToInject = text;
    }

    setDocContent(prev => prev + textToInject);
  };

  const executeDocumentCertification = () => {
    if (!signeeName.trim()) return;
    setCertifiedSuccessMessage('Processing signature chain...');
    setTimeout(() => {
      setCertifiedSuccessMessage(`Document SHA-256 seal synthesized successfully. Registered into Blockchain Escrow Ledger under verification hash: 0x93FA..C821 by signee [${signeeName}]`);
    }, 1200);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans border-t-4 border-[#D63031]" id="eu_violation_surveillance_panel">

      {/* FLOATING TOAST MESSAGE PANEL */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed top-24 right-6 z-[9999] max-w-sm w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="bg-slate-900 border border-slate-700/80 text-white rounded-2xl shadow-2xl p-4 flex gap-3 items-start backdrop-blur-md"
            >
              <div className="p-1.5 bg-rose-500/10 rounded-xl text-rose-400 shrink-0">
                <ShieldAlert className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 text-slate-200 text-xs font-mono">
                <div className="font-extrabold text-rose-500 mb-0.5">SURVEILLANCE ALERTER</div>
                <div className="leading-relaxed text-slate-300">{toastMessage}</div>
              </div>
              <button 
                onClick={() => setToastMessage(null)} 
                className="text-slate-550 hover:text-white font-mono text-[10px] select-none cursor-pointer"
              >
                [X]
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= HEADER BRANDING ================= */}
      <div className="bg-white border-b border-slate-200 py-4 sm:py-6 px-4 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#D63031]/10 text-[#D63031] text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> EU Surveillance Engine Live
              </span>
              <span className="text-[10px] text-slate-500 font-mono">REGULATOR PORTAL REF: SURV-2026</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 font-display">
              Violation Surveillance & Penalty Desk
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time monitoring arrays, dynamic markdown legal workspace, and autonomous multi-country breach financial settlement nodes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetDemoData}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <RotateCw className="h-3.5 w-3.5" /> Reset Matrix States
            </button>
            <div className="bg-slate-900 text-white py-1.5 px-3 rounded-lg text-xs font-mono flex items-center gap-2 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Sync: SECURE_TLS_1.3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 sm:space-y-6">

        {/* Dynamic Metric Counter Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="violations_counters">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase">SURVEILLANCE WORKSPACE</span>
              <div className="text-2xl font-black text-slate-900">42 Active</div>
              <p className="text-[10px] text-[#D63031] font-semibold flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D63031] inline-block animate-ping" />
                Across Euro-Zone Hubs
              </p>
            </div>
            <div className="p-3 bg-rose-50 text-[#D63031] rounded-xl">
              <Scale className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase">CRITICAL SYSTEM RISKS</span>
              <div className="text-2xl font-black text-[#D63031]">{metrics.criticalCount} Flagged</div>
              <p className="text-[10px] text-slate-400 font-medium">Requires immediate intervention</p>
            </div>
            <div className="p-3 bg-[#D63031]/10 text-[#D63031] rounded-xl animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase">SLA ESCALATION WARNING</span>
              <div className="text-2xl font-black text-[#E17055]">{metrics.breachedSlaCount} Expired</div>
              <p className="text-[10px] text-[#E17055] font-bold">In infraction transition</p>
            </div>
            <div className="p-3 bg-[#E17055]/10 text-[#E17055] rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase">PENALTY DISPATCH ACCUMULATOR</span>
              <div className="text-2xl font-black text-[#6C5CE7]">
                €{(metrics.totalEnforcedFineValue / 1000).toFixed(0)}k
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold">Sealed Escrow Settlement</p>
            </div>
            <div className="p-3 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-xl">
              <Coins className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 30-Day Violation Surveillance Temporal Analytics & Trend Line Chart */}
        <ViolationSurveillanceTrend />


        {/* ================= PANEL 1: ADVANCED VIOLATION FACETED-SEARCH & REAL-TIME SEARCH ================= */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5" id="panel_faceted_surveillance_command">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <h2 className="text-xs font-black tracking-widest text-[#D63031] uppercase font-mono flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4" /> Command Module Filter Desk
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Refine regulatory parameters across multiple jurisdictions and statutes in real-time.
              </p>
            </div>
            
            <div className="bg-[#D63031]/10 text-[#D63031] px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono border border-[#D63031]/20">
              ⚡ Live Matched Count: <span className="underline">{filteredViolations.length}</span>
            </div>
          </div>

          {/* Search bar & Dropdowns row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-5">
            
            {/* Global Search box */}
            <div className="lg:col-span-4 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search active breaches by Member State, Entity, Article, or System ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D63031] focus:border-transparent transition-all outline-none"
              />
            </div>

            {/* Jurisdiction Select */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Jurisdiction</label>
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-[#D63031] outline-none"
              >
                <option value="All EU">All EU Member States</option>
                <option value="Germany">DE // Germany</option>
                <option value="France">FR // France</option>
                <option value="Spain">ES // Spain</option>
                <option value="Ireland">IE // Ireland</option>
                <option value="Estonia">EE // Estonia</option>
                <option value="Netherlands">NL // Netherlands</option>
              </select>
            </div>

            {/* Framework Select */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Statutory Framework</label>
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-[#D63031] outline-none"
              >
                <option value="All">All Frameworks</option>
                <option value="EU AI Act High-Risk">EU AI Act High-Risk</option>
                <option value="GDPR Article 32">GDPR Article 32</option>
                <option value="EU Data Act">EU Data Act</option>
                <option value="CBAM Weight log">CBAM Weight Log</option>
              </select>
            </div>

            {/* Severity Select */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Severity Band</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-[#D63031] outline-none"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical (Immediate Block)</option>
                <option value="High">High Exposure</option>
                <option value="Minor">Minor Deficiency</option>
              </select>
            </div>

            {/* SLA Select */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">SLA Threshold</label>
              <select
                value={selectedSlaStatus}
                onChange={(e) => setSelectedSlaStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-[#D63031] outline-none"
              >
                <option value="All">Any Tracker Status</option>
                <option value="Pending">Pending Active / Ticking</option>
                <option value="Breached">Breached SLA</option>
              </select>
            </div>

          </div>

          {/* Pill tokens visualizer */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono">Faceted Pill Tokens Applied:</span>
            
            <div className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all">
              <span>Jurisdiction: {selectedJurisdiction}</span>
              {selectedJurisdiction !== 'All EU' && (
                <button onClick={() => setSelectedJurisdiction('All EU')} className="hover:text-rose-500 font-black">×</button>
              )}
            </div>

            <div className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all">
              <span>Framework: {selectedFramework}</span>
              {selectedFramework !== 'All' && (
                <button onClick={() => setSelectedFramework('All')} className="hover:text-rose-500 font-black">×</button>
              )}
            </div>

            <div className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all">
              <span>Severity: {selectedSeverity}</span>
              {selectedSeverity !== 'All' && (
                <button onClick={() => setSelectedSeverity('All')} className="hover:text-rose-500 font-black">×</button>
              )}
            </div>

            <div className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all">
              <span>SLA Link: {selectedSlaStatus}</span>
              {selectedSlaStatus !== 'All' && (
                <button onClick={() => setSelectedSlaStatus('All')} className="hover:text-rose-500 font-black">×</button>
              )}
            </div>

            {/* Clear Filters Button only if any filtered active */}
            {(selectedJurisdiction !== 'All EU' || selectedFramework !== 'All' || selectedSeverity !== 'All' || selectedSlaStatus !== 'All' || searchTerm) && (
              <button
                onClick={handleResetDemoData}
                className="text-[10px] text-[#D63031] font-bold hover:underline ml-1"
              >
                Clear Search & Queries
              </button>
            )}
          </div>
        </section>


        {/* ================= PANEL 2: INTERACTIVE VIOLATION LEDGER WITH AUTONOMOUS PENALTY TRIGGERS ================= */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="panel_violation_ledger">
          
          <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#D63031]">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 bg-[#D63031] text-white text-[9px] font-black font-mono rounded">
                  REGULATORY LEDGER
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Statutory fine ruleset: Title VIII AI Act compliant</span>
              </div>
              <h3 className="text-sm font-black font-mono uppercase text-slate-100 tracking-wider mt-1 flex items-center gap-1.5">
                <Database className="h-4.5 w-4.5 text-[#E17055]" />
                Interactive Breach Register & Autonomous Penalties
              </h3>
            </div>

            <div className="flex gap-2">
              <button
                className="px-3.5 py-1.5 bg-[#6C5CE7] hover:bg-[#5b4ec2] text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow"
                onClick={() => {
                  if (selectedRowIds.size === 0) {
                    showToast('Select at least one active infraction row to trigger bulk audit certification sequence.');
                    return;
                  }
                  showToast(`Dispatched high-priority escrow payment order for Cases: ${Array.from(selectedRowIds).join(', ')}. Initializing sovereign gate handshake.`);
                }}
              >
                <Coins className="h-3.5 w-3.5" /> Dispatch Bulk Penalties ({selectedRowIds.size})
              </button>
              
              <button
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer text-slate-300"
                onClick={() => {
                  showToast('Exporting audit trail history records into secure JSON format...');
                }}
              >
                <Download className="h-3.5 w-3.5 inline-block mr-1" /> Export Selected Ledger
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-secondary/10 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={toggleAllRows}
                      checked={filteredViolations.length > 0 && selectedRowIds.size === filteredViolations.length}
                      className="rounded text-[#D63031] focus:ring-[#D63031]"
                    />
                  </th>
                  <th className="p-4 font-black">Violation ID</th>
                  <th className="p-4">Target Subsidiary & Node</th>
                  <th className="p-4">Regulatory Law Link</th>
                  <th className="p-4">Exposure Matrix & Bias Risk</th>
                  <th className="p-4 text-center">Automated Fine Allocation</th>
                  <th className="p-4">Risk Actions / Bilateral Triggers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <AnimatePresence initial={false}>
                  {filteredViolations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-5 sm:p-6 lg:p-8 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <XCircle className="h-10 w-10 text-slate-300 mx-auto" />
                          <p className="font-bold">No active anomalies matched search filters.</p>
                          <button
                            onClick={handleResetDemoData}
                            className="text-xs text-[#D63031] hover:underline"
                          >
                            Reset filters desk to view standard presets
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredViolations.map((v) => {
                      const isSelected = selectedRowIds.has(v.violationId);
                      
                      return (
                        <motion.tr
                          key={v.id}
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 1, backgroundColor: isSelected ? 'rgba(214, 48, 49, 0.02)' : '#ffffff' }}
                          className={`hover:bg-slate-50 transition-colors ${isSelected ? 'border-l-4 border-l-[#D63031]' : ''}`}
                        >
                          {/* Checked Checkbox selection */}
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleRowSelected(v.violationId)}
                              className="rounded text-[#D63031] focus:ring-[#D63031] cursor-pointer"
                            />
                          </td>

                          {/* ID Case reference */}
                          <td className="p-4 font-mono font-black text-slate-950">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                              {v.violationId}
                            </div>
                          </td>

                          {/* Corporate Node */}
                          <td className="p-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                              {v.targetSubsidiary}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono font-medium flex items-center gap-1.5 mt-0.5">
                              <span>Sovereign ID: [EU-{v.country}-{v.id.toUpperCase()}]</span>
                            </div>
                          </td>

                          {/* Country Law Citation */}
                          <td className="p-4 font-mono text-[11px]">
                            <span className="font-semibold text-slate-800">{v.countryLaw}</span>
                            <span className="block text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">
                              Gate: {v.framework}
                            </span>
                          </td>

                          {/* Exposure Summary detail */}
                          <td className="p-4 max-w-[280px]">
                            <div className="font-semibold text-slate-900 flex items-start gap-1.5">
                              <span className={`p-0.5 shrink-0 rounded text-[9px] font-black font-mono ${
                                v.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                v.severity === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {v.severity}
                              </span>
                              <span className="text-[11px] leading-tight text-slate-700">{v.exposureMatrix}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 italic truncate" title={v.description}>
                              {v.description}
                            </p>
                          </td>

                          {/* Automated Fine Allocation progress/state */}
                          <td className="p-4">
                            {v.fineStatus === 'Enforced' ? (
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-rose-600 font-bold">Enforced Penalty Issued</span>
                                  <span className="text-slate-500 font-semibold">{v.fineInvoiceRef}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                                  <div className="bg-gradient-to-r from-[#D63031] to-[#E17055] h-full rounded-full w-full" />
                                </div>
                                <div className="text-[10px] font-semibold text-slate-800 font-mono">
                                  €{v.estimatedFine.toLocaleString()} via Invoice Gateway
                                </div>
                              </div>
                            ) : v.fineStatus === 'Escrow Sealed' ? (
                              <div className="bg-emerald-50 border border-emerald-100 rounded p-2 text-center">
                                <div className="text-[10px] text-emerald-800 font-extrabold flex items-center justify-center gap-1 font-mono">
                                  <CheckCircle className="h-3 w-3" /> ESCROW SETTLED
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                  Amount €{v.estimatedFine.toLocaleString()} Cleared
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5 text-center p-1.5 bg-amber-50/50 border border-amber-100 rounded-lg">
                                <div className="text-[10px] text-amber-900 font-extrabold uppercase font-mono">
                                  ⏳ Awaiting SLA Dispatch
                                </div>
                                <div className="text-[9.5px] text-slate-600 font-medium">
                                  Accrued Penalty: €{v.estimatedFine.toLocaleString()}
                                </div>
                                <button
                                  onClick={() => triggerManualFineIssuance(v.id)}
                                  className="mt-1 px-2.5 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded hover:bg-[#D63031] transition-all cursor-pointer inline-block"
                                >
                                  Trigger Invoice Now
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Toggles and status actions */}
                          <td className="p-4">
                            <div className="space-y-2">
                              {/* Toggle switch for auto billing */}
                              <div className="flex items-center justify-between gap-2.5">
                                <span className="text-[9.5px] font-mono font-medium text-slate-500">
                                  Auto-Billing Loop
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={v.autoBillingTrigger}
                                    onChange={() => toggleAutoBillingForViolation(v.id)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#6C5CE7]" />
                                </label>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setDocTitle(`EU Enforcement Directive V1.4 - Case Reference [${v.violationId}]`);
                                    setDocContent(`# OFFICIAL BREACH MANDATE RE: ${v.violationId}
CASE JURISDICTION: ${v.countryLaw}
ENTITY EXPOSURE: ${v.targetSubsidiary}
SEVERITY LEVEL: ${v.severity.toUpperCase()}

Pursuant to direct statutory telemetry monitoring, the platform records unmitigated anomalies under the EU standard directives. This protocol enforces:

1. Immediate cessation of algorithmic loan evaluation (Biased factors identified).
2. Local delegation of physical pipeline audits under strict SLA parameters.
3. Allocation of certified penalty limits matching systemic breach history.

Authority Stamp:
[Sovereign Escrow Desk Registry]`);
                                    document.getElementById('panel_report_editor_cms')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="w-full text-center py-1 bg-slate-100 hover:bg-[#6C5CE7] hover:text-white rounded text-[10px] font-bold text-slate-700 transition-all cursor-pointer"
                                >
                                  Load in CMS Editor
                                </button>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 font-mono">
            <div>
              Showing <span className="font-bold text-slate-800">{filteredViolations.length}</span> of {violations.length} breach vectors detected.
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <span>Escrow API Sync Handshake: 100% Validated</span>
            </div>
          </div>
        </section>


        {/* ================= PANEL 3: LIVE REPORT EDITOR, DYNAMIC MARKDOWN CMS & EXPORT CENTER ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6" id="panel_report_editor_cms">
          
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            {/* Header tab */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-[#6C5CE7]/10 p-1.5 rounded-lg text-[#6C5CE7]">
                  <PenTool className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 font-mono">
                    Interactive Legal Document Interface
                  </h3>
                  <div className="text-[10px] text-slate-500 font-sans">
                    Multi-page IDE workspace with live AI regulatory clauses injection.
                  </div>
                </div>
              </div>
              <span className="p-1 px-2.5 bg-slate-900 text-slate-350 text-[10px] font-mono rounded">
                Draft Status: v1.4
              </span>
            </div>

            {/* Title editor */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/20">
              <label className="text-[9px] font-bold uppercase text-slate-400 block font-mono">DOCUMENT OUTLINE HEADER</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-transparent border-none text-slate-900 font-black text-sm p-0 focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Split Screen Editor (Left side of Panel 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-150 h-[380px]">
              
              {/* Left Column: Direct manual text edit pane */}
              <div className="p-4 flex flex-col justify-between h-full bg-slate-50/5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full animate-ping" />
                    Plain Markdown Workspace
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">UTF-8 Localized Draft</span>
                </div>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full flex-1 p-3 bg-slate-55 border border-slate-200 rounded-xl font-mono text-[11px] leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-[#6C5CE7] overflow-y-auto resize-none scrollbar-thin"
                  placeholder="Draft compliance report text here..."
                />
                <div className="text-[9px] text-slate-400 font-mono mt-1.5">
                  *Edit directly. Markdown parser renders standard bold, quote block headers.
                </div>
              </div>

              {/* Right Column: Dynamic Preview Output */}
              <div className="p-4 flex flex-col bg-slate-50/40 overflow-y-auto max-h-[380px]">
                <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-1">
                  <span className="text-[10px] font-black tracking-wider uppercase text-[#6C5CE7] font-mono flex items-center gap-1">
                    <FileText className="h-3 w-3" /> WYSIWYG PREVIEW RUNTIME
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Passed Parser Check
                  </span>
                </div>

                {/* Simulated Parser Rendered Doc Content */}
                <div className="text-xs text-slate-700 space-y-3 prose leading-relaxed font-sans max-h-full overflow-y-auto pr-1">
                  <div className="border-l-4 border-[#6C5CE7] pl-3 py-1 bg-slate-50 mb-4 rounded-r">
                    <h2 className="font-extrabold text-[#1B3A4B] text-[13px] tracking-tight">{docTitle}</h2>
                    <p className="text-[10px] text-slate-400 italic">SYSTEM ENFORCEMENT TEMPLATE DESK</p>
                  </div>

                  {docContent.split('\n\n').map((para, idx) => {
                    if (para.startsWith('# ')) {
                      return <h2 key={idx} className="font-black text-slate-900 tracking-tight text-sm uppercase pt-1 border-b border-slate-100">{para.replace('# ', '')}</h2>;
                    }
                    if (para.startsWith('## ')) {
                      return <h3 key={idx} className="font-extrabold text-[#1B3A4B] text-xs font-mono uppercase text-slate-800 pt-1.5">{para.replace('## ', '')}</h3>;
                    }
                    if (para.startsWith('### ')) {
                      return <h4 key={idx} className="font-bold text-[#D63031] text-[11px] font-mono pt-1">{para.replace('### ', '')}</h4>;
                    }
                    if (para.startsWith('- ') || para.startsWith('* ')) {
                      return (
                        <ul key={idx} className="list-disc pl-4 space-y-1 text-slate-700">
                          {para.split('\n').map((li, lIndex) => (
                            <li key={lIndex} className="text-[11.5px]">{li.replace(/^(\-\s|\*\s)/, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx} className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">{para}</p>;
                  })}
                </div>
              </div>

            </div>

            {/* Quick action paragraph injector widget */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-2.5 items-center justify-between">
              <div className="flex gap-2.5 items-center">
                <span className="text-[10px] font-black text-slate-500 font-mono flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#E17055]" /> INJECT CLAUSE:
                </span>
                <button
                  onClick={() => handleInjectParagraph('AI_ACT')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 ring-1 ring-slate-200 text-slate-700 font-bold text-[10px] rounded transition-all cursor-pointer"
                >
                  + Append AI Act Art 85
                </button>
                <button
                  onClick={() => handleInjectParagraph('GDPR_FINE')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 ring-1 ring-slate-200 text-slate-705 font-bold text-[10px] rounded transition-all cursor-pointer"
                >
                  + Append GDPR 4% Threshold
                </button>
                <button
                  onClick={() => handleInjectParagraph('MITIGATION')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 ring-1 ring-slate-200 text-slate-700 font-bold text-[10px] rounded transition-all cursor-pointer"
                >
                  + Append DPO Action Plan
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Words: {docContent.split(/\s+/).filter(Boolean).length} // Chars: {docContent.length}
              </div>
            </div>
          </div>


          {/* Right Technical Actions Panel (Right side of Panel 3) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="p-1 bg-[#6C5CE7]/10 text-[#6C5CE7] text-[9px] font-black font-mono rounded tracking-widest uppercase">
                  Technical Action Desk
                </span>
                <h3 className="text-xs font-black text-slate-800 uppercase mt-2">
                  Document Certification & Export
                </h3>
                <p className="text-[10.5px] text-slate-400">
                  Seal legislative summaries, deploy cryptographic hashes, and export across active channels.
                </p>
              </div>

              {/* Certification Checklist */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-3">
                <span className="text-[10px] font-mono font-black text-slate-500 block uppercase tracking-wide">
                  Sealed Escrow Verification
                </span>
                
                <div className="space-y-2">
                  <label className="flex items-start gap-2 text-[11px] text-slate-600 font-medium cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={isDocCertified}
                      onChange={(e) => setIsDocCertified(e.target.checked)}
                      className="rounded text-[#6C5CE7] focus:ring-[#6C5CE7] mt-0.5" 
                    />
                    <div>
                      <span className="font-bold text-slate-800">Verify local jurisdiction signatures</span>
                      <p className="text-[9px] text-slate-400">Certifies that DPO authorities read and verified demographic bias outputs.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 text-[11px] text-slate-600 font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={true}
                      className="rounded text-[#6C5CE7] focus:ring-[#6C5CE7] mt-0.5" 
                    />
                    <div>
                      <span className="font-bold text-slate-800">Seal outbound encryption keys</span>
                      <p className="text-[9px] text-slate-400">Denotes envelope file to be bundled with AES-256 standard and RSA-4096 handshake indicators.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase font-mono mb-1">
                    System Authorization Signature
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={signeeName}
                      onChange={(e) => setSigneeName(e.target.value)}
                      placeholder="e.g. Legal-Officer-IE"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded font-mono text-[#6C5CE7] font-black focus:ring-1 focus:ring-[#6C5CE7]"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-slate-300">🔑 SECURE</span>
                  </div>
                </div>

                <button
                  onClick={executeDocumentCertification}
                  disabled={!isDocCertified || !signeeName}
                  className="w-full bg-[#6C5CE7] hover:bg-[#5b4ec2] disabled:opacity-40 text-white font-black py-2 rounded-lg text-xs font-mono tracking-wide transition-all shadow-md cursor-pointer uppercase flex items-center justify-center gap-1"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Seal & Deploystandard Sign
                </button>
              </div>

              {/* Dynamic notification of output results */}
              <AnimatePresence>
                {certifiedSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-mono leading-relaxed relative"
                  >
                    <button
                      onClick={() => setCertifiedSuccessMessage('')}
                      className="absolute top-1.5 right-2 hover:text-slate-900 font-bold"
                    >
                      ✕
                    </button>
                    {certifiedSuccessMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export Multi-Format Targets */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-mono font-black text-slate-500 block uppercase">
                Secure Distribution Nodes
              </span>

              <button
                onClick={() => setIsPdfDialogOpen(true)}
                className="w-full py-2 bg-slate-900 hover:bg-[#D63031] text-white text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="h-3.5 w-3.5" /> Export PDF (Certified Copy)
              </button>

              <button
                onClick={() => {
                  const dataToExport = {
                    title: docTitle,
                    content: docContent,
                    timestamp: new Date().toISOString(),
                    sealedHash: '0x93FA00122BC821BBAEECA11902093',
                    authority: 'EU_CENTRAL_SURVEILLANCE'
                  };
                  showToast(`Dispatched JSON Ledger for Regulator API sync. payload:\n${JSON.stringify(dataToExport, null, 2)}`);
                }}
                className="w-full py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCode className="h-3.5 w-3.5 text-slate-500" /> Sync JSON Payload (Regulator API)
              </button>

              <button
                onClick={() => {
                  showToast('Pushing certified draft directly into Sovereign Escrow Vault. Status changed to [Escrow Sealed].');
                }}
                className="w-full py-2 bg-slate-50 hover:bg-[#6C5CE7]/15 hover:text-[#6C5CE7] text-slate-600 border border-slate-200 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Push to Escrow Settlement Desk
              </button>
            </div>

          </div>
        </section>


        {/* ================= PANEL 4: REMEDIATION TASK ASSIGNMENT HUB & REAL-TIME SLA COUNTDOWN MATRIX ================= */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="panel_remediation_taskboard">
          
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="p-1 px-2.5 bg-[#6C5CE7]/10 text-[#6C5CE7] text-[10px] font-black font-mono rounded tracking-wider uppercase">
                Active Operations Taskboard
              </span>
              <h3 className="text-sm font-black text-slate-800 uppercase mt-1.5 flex items-center gap-1.5">
                <User className="h-4.5 w-4.5 text-[#6C5CE7]" />
                Remediation Assignment Hub & Real-time SLA Matrix
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white p-2 border border-slate-200 rounded-xl">
              <Clock className="h-4 w-4 text-[#E17055] animate-spin" />
              <span>SLA Baseline Threshold: <b className="text-slate-800">24 Hour Escapement</b></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-150">
            
            {/* Operational SLA Countdown List (Left side of Panel 4) */}
            <div className="lg:col-span-7 p-5">
              <div className="flex justify-between items-center mb-3.5">
                <h4 className="text-[11px] font-black uppercase text-slate-400 font-mono tracking-wide">
                  Decentralized SLA countdown telemetry
                </h4>
                <span className="text-[10px] bg-rose-50 text-rose-650 px-2 py-0.5 rounded font-bold font-mono">
                  LIVE REAL-TIME RELAY
                </span>
              </div>

              {/* Ticking Items Stack */}
              <div className="space-y-3.5">
                {violations.slice(0, 4).map((item) => {
                  const pct = Math.max(0, (item.slaSecondsRemaining / item.slaMaxSeconds) * 100);
                  const isCritical = item.slaSecondsRemaining < 10000;
                  const isBreached = item.slaSecondsRemaining === 0;

                  return (
                    <div 
                      key={item.id} 
                      className={`p-3.5 rounded-xl border transition-all ${
                        isBreached ? 'bg-rose-50/10 border-rose-200 shadow-inner' :
                        isCritical ? 'bg-amber-50/30 border-amber-200' :
                        'bg-slate-50/40 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800 text-xs">{item.violationId}</span>
                            <span className="text-slate-400 font-mono text-[9.5px]">[{item.countryLaw}]</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium block truncate max-w-[200px]" title={item.targetSubsidiary}>
                            {item.targetSubsidiary}
                          </span>
                        </div>

                        {/* Ticking Clock widget representation */}
                        <div className="text-right">
                          <span className={`text-[11px] font-mono font-black ${
                            isBreached ? 'text-[#D63031] bg-rose-100/60 px-2 py-0.5 rounded border border-rose-200' :
                            isCritical ? 'text-[#E17055] font-bold animate-pulse' :
                            'text-slate-700'
                          }`}>
                            {formatSlaClock(item.slaSecondsRemaining)}
                          </span>
                          <span className="block text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-mono">
                            {isBreached ? 'EXPIRED EXPOSURE PENALTY' : 'REMAINING UNTIL ACCRUEMENT'}
                          </span>
                        </div>
                      </div>

                      {/* Custom bar visual indicators */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isBreached ? 'bg-[#D63031]' :
                            isCritical ? 'bg-gradient-to-r from-[#E17055] to-[#D63031]' :
                            'bg-[#6C5CE7]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Initiated Exposure Matrix</span>
                        <span>SLA Threshold Level: {(item.slaMaxSeconds / 3650).toFixed(0)} Hrs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Assigned Team Selector Control Hub (Right side of Panel 4) */}
            <div className="lg:col-span-5 p-5 bg-slate-50/20 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-150">
                  <div className="flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-[#6C5CE7]" />
                    <span className="text-xs font-black uppercase text-slate-700 font-mono">
                      Remediation Route desk
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Synced Gate</span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Route active breaches to local authorities or localized corporate departments instantly. Click "Synchronize Routes" to propagate the updated liability ledger parameters globally.
                </p>

                {/* Team Assignment Select Block */}
                <div className="space-y-3 pt-2">
                  <span className="text-[9.5px] font-mono font-black text-slate-400 block uppercase tracking-wide">
                    Operational assignment registers
                  </span>

                  {violations.slice(0, 3).map((item) => {
                    return (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-250 flex justify-between items-center gap-3">
                        <div className="space-y-0.5 truncate">
                          <span className="text-[10.5px] font-black text-slate-900 block font-mono">
                            {item.violationId} // {item.country} Node
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                            {item.exposureMatrix}
                          </span>
                        </div>

                        {/* Interactive Manager selector */}
                        <select
                          value={item.assignedTeam}
                          onChange={(e) => changeTeamAssignment(item.id, e.target.value as any)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-[10.5px] font-bold rounded-lg text-slate-700 focus:ring-1 focus:ring-[#6C5CE7] outline-none"
                        >
                          <option value="Local DPO">👩‍💻 Local DPO</option>
                          <option value="Internal IT Auditing">🔬 IT Auditing Team</option>
                          <option value="Third-Party Attorney">⚖️ Third-Party Law</option>
                          <option value="Chief Compliance Officer">💼 Chief Compliance Officer</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sync Actions */}
              <div className="mt-5 pt-3.5 border-t border-slate-200">
                <button
                  onClick={() => {
                    showToast('Synchronizing assigned remediation teams with local active nodes over perfect TLS 1.3 tunnels...');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-[#6C5CE7] text-white text-xs font-black rounded-xl tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-mono"
                >
                  <Send className="h-4 w-4" /> Synchronize Operational Routes
                </button>
              </div>

            </div>

          </div>

          <div className="p-4 bg-slate-900/5 text-slate-500 font-mono text-[9px] border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-1.5">
            <span>Security Signature: [CERT-092-DPO]</span>
            <span>Est. Response Escalation Target Rate: 99.4% Across All Hubs</span>
          </div>
        </section>

      </div>

      <ExportPdfDialog 
        isOpen={isPdfDialogOpen} 
        onClose={() => setIsPdfDialogOpen(false)} 
        title="Export PDF (Certified Copy)"
        onExport={() => {
          showToast(`Downloading localized regulatory package directly. Content includes Title and Breach Evidence reports. Sealed Hash: 0x93FA..C821.`);
        }}
      />
    </div>
  );
}
