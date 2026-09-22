import React, { useMemo, useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell as RechartsCell,
} from 'recharts';
import {
  ShieldAlert,
  Info,
  ShieldCheck,
  Cpu,
  Sparkles,
  RefreshCw,
  Terminal,
  Building2,
  Activity,
  AlertTriangle,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sliders,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useJurisdiction } from '../../context/JurisdictionContext';

// Custom Type for Compliance Risk
interface ComplianceRisk {
  id: string;
  businessUnit: string;
  category: string;
  riskName: string;
  description: string;
  likelihood: number; // 1 to 5 (Rare, Unlikely, Possible, Likely, Almost Certain)
  impact: number; // 1 to 5 (Negligible, Minor, Moderate, Major, Critical)
  status: 'active' | 'remediating' | 'mitigated';
  articleMapping: string;
  infrastructure: string;
  lastAudited: string;
}

const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const IMPACT_LABELS = ['Negligible', 'Minor', 'Moderate', 'Major', 'Critical'];

const JURISDICTIONAL_RISKS: Record<string, ComplianceRisk[]> = {
  'EU': [
    {
      id: "RSK-EU-302",
      businessUnit: "IT Operations",
      category: "Security Control",
      riskName: "Hardcoded Admin Auth Keys",
      description: "Superuser auth credentials committed to public Git repos and cached in unencrypted Redis memory stores.",
      likelihood: 4,
      impact: 5,
      status: 'active',
      articleMapping: "GDPR Article 32 (Security of Processing)",
      infrastructure: "Redis Cache Staging",
      lastAudited: "2026-06-12",
    },
    {
      id: "RSK-EU-809",
      businessUnit: "Finance",
      category: "Data Residency",
      riskName: "Cross-Border Sovereign Leak",
      description: "Retail transactions and bank account details mirrored to overseas cloud regions violating strict EU data sharding rules.",
      likelihood: 3,
      impact: 5,
      status: 'active',
      articleMapping: "GDPR Article 44 (Sovereign Transfer)",
      infrastructure: "Postgres Mirror Replica",
      lastAudited: "2026-07-01",
    },
    {
      id: "RSK-EU-441",
      businessUnit: "Human Resources",
      category: "Sensitive Data",
      riskName: "Silent Biometric Screenings",
      description: "Processing employee candidate health scans and biometric telemetry during screening without active consent checklists.",
      likelihood: 2,
      impact: 4,
      status: 'active',
      articleMapping: "GDPR Article 9 (Special Categories)",
      infrastructure: "HR Talent Greenhouse API",
      lastAudited: "2026-05-15",
    },
    {
      id: "RSK-EU-105",
      businessUnit: "Marketing",
      category: "ePrivacy Consent",
      riskName: "Intrusive Tracking Pixels",
      description: "Third-party pixels load before consent banner accepts. Interactive tracking checkboxes are pre-selected by default.",
      likelihood: 5,
      impact: 3,
      status: 'active',
      articleMapping: "ePrivacy Directive Article 5(3)",
      infrastructure: "Public Web GTM Wrapper",
      lastAudited: "2026-07-10",
    },
    {
      id: "RSK-EU-504",
      businessUnit: "Engineering (AI Labs)",
      category: "AI Safety Act",
      riskName: "Biometric Emotion Classifier",
      description: "Emotion recognition system trained on public feeds deployed in production without registering high-risk AI Act logs.",
      likelihood: 4,
      impact: 4,
      status: 'active',
      articleMapping: "EU AI Act Article 52 (Opacity Guard)",
      infrastructure: "FastAPI inference-v2 container",
      lastAudited: "2026-04-20",
    },
    {
      id: "RSK-EU-611",
      businessUnit: "Legal & Compliance",
      category: "Data Minimization",
      riskName: "Infinite Customer Session Log",
      description: "Retaining client plaintext cookies and access tokens indefinitely without auto-expire or GDPR right-to-erase triggers.",
      likelihood: 3,
      impact: 3,
      status: 'active',
      articleMapping: "GDPR Article 5(1)(e) (Storage Limit)",
      infrastructure: "Auth0 Session Log Store",
      lastAudited: "2026-03-30",
    },
    {
      id: "RSK-EU-223",
      businessUnit: "Sales / CRM",
      category: "Automated Profiling",
      riskName: "Solvency Lead Scraping",
      description: "Analyzing sales funnel leads using automated background scraping algorithms without giving opt-out notifications.",
      likelihood: 4,
      impact: 2,
      status: 'active',
      articleMapping: "GDPR Article 21 (Right to Object)",
      infrastructure: "Salesforce Lead Enriched Webhook",
      lastAudited: "2026-06-25",
    },
    {
      id: "RSK-EU-712",
      businessUnit: "Operations",
      category: "Vendor Sprawl",
      riskName: "Unvetted API SaaS Pipeline",
      description: "Client service desks forwarding raw application exception logs to unvetted operators outside EU territorial borders.",
      likelihood: 3,
      impact: 4,
      status: 'active',
      articleMapping: "GDPR Article 28 (Processor Terms)",
      infrastructure: "Zendesk Integration Router",
      lastAudited: "2026-07-05",
    }
  ],
  'US-CA': [
    {
      id: "RSK-USCA-302",
      businessUnit: "IT Operations",
      category: "Security Control",
      riskName: "Automated Deletion Request Failures",
      description: "Admins failing to dispatch cascade deletion signals across consumer history tables within CPRA's mandatory window.",
      likelihood: 4,
      impact: 4,
      status: 'active',
      articleMapping: "CCPA § 1798.105 (Right to Delete)",
      infrastructure: "Production BigQuery Sink",
      lastAudited: "2026-06-12",
    },
    {
      id: "RSK-USCA-809",
      businessUnit: "Finance",
      category: "Data Residency",
      riskName: "Notice-at-Collection Gaps",
      description: "FinTech applications collecting credit scores and transaction ledgers without presenting CCPA disclosures.",
      likelihood: 3,
      impact: 5,
      status: 'active',
      articleMapping: "CCPA § 1798.100 (Notice at Collection)",
      infrastructure: "Fintech Core Gateway",
      lastAudited: "2026-07-01",
    },
    {
      id: "RSK-USCA-441",
      businessUnit: "Human Resources",
      category: "Sensitive Data",
      riskName: "Unrestricted HR Biometric Surveillance",
      description: "Candidate onboarding screening analyzing facial micro-expressions without explicit Sensitive Personal Information consent.",
      likelihood: 2,
      impact: 4,
      status: 'active',
      articleMapping: "CCPA § 1798.140 (SPI Protections)",
      infrastructure: "Workday Onboarding S3 Bucket",
      lastAudited: "2026-05-15",
    },
    {
      id: "RSK-USCA-105",
      businessUnit: "Marketing",
      category: "ePrivacy Consent",
      riskName: "Missing DNSMP Compliance Anchor",
      description: "Consumer metrics web tracker loads cookies without presenting 'Do Not Sell or Share My Personal Info' links.",
      likelihood: 5,
      impact: 4,
      status: 'active',
      articleMapping: "CCPA § 1798.135 (Opt-Out Links)",
      infrastructure: "Marketing Segment SDK",
      lastAudited: "2026-07-10",
    },
    {
      id: "RSK-USCA-504",
      businessUnit: "Engineering (AI Labs)",
      category: "AI Safety Act",
      riskName: "Algorithmic Discrimination in Hiring",
      description: "Automated decision tools profiling applicants without conducting annual independent impact/bias evaluations.",
      likelihood: 3,
      impact: 5,
      status: 'active',
      articleMapping: "AB 2930 (Automated Decision Tools)",
      infrastructure: "HuggingFace inference pipeline",
      lastAudited: "2026-04-20",
    },
    {
      id: "RSK-USCA-611",
      businessUnit: "Legal & Compliance",
      category: "Data Minimization",
      riskName: "Unauthorized Data Broker selling logs",
      description: "Ad networks retaining consumer search telemetry indefinitely and profiling without opt-out controls.",
      likelihood: 4,
      impact: 3,
      status: 'active',
      articleMapping: "CCPA § 1798.115 (Third Party Disclosures)",
      infrastructure: "Clickstream Log Analytics",
      lastAudited: "2026-03-30",
    },
    {
      id: "RSK-USCA-223",
      businessUnit: "Sales / CRM",
      category: "Automated Profiling",
      riskName: "Pre-checked GPC Banner Override",
      description: "Website overriding client-side Global Privacy Control headers by serving pre-checked consent forms.",
      likelihood: 4,
      impact: 3,
      status: 'active',
      articleMapping: "CCPA § 1798.120 (GPC Response)",
      infrastructure: "ConsentManager Cookie Wrapper",
      lastAudited: "2026-06-25",
    },
    {
      id: "RSK-USCA-712",
      businessUnit: "Operations",
      category: "Vendor Sprawl",
      riskName: "Missing Contractor CPRA Addendum",
      description: "Unvetted backend pipeline exporting consumer log streams to cloud contractors lacking CPRA service contracts.",
      likelihood: 3,
      impact: 4,
      status: 'active',
      articleMapping: "CCPA § 1798.140 (Service Provider Terms)",
      infrastructure: "Logstash AWS S3 Forwarder",
      lastAudited: "2026-07-05",
    }
  ],
  'US-HIPAA': [
    {
      id: "RSK-HIPAA-302",
      businessUnit: "IT Operations",
      category: "Security Control",
      riskName: "Unencrypted PHI Database Backups",
      description: "Production SQL database snapshots containing Protected Health Information archived to unencrypted public storage.",
      likelihood: 3,
      impact: 5,
      status: 'active',
      articleMapping: "HIPAA Security Rule § 164.312 (Encryption)",
      infrastructure: "CloudSQL Daily Snapshot Bucket",
      lastAudited: "2026-06-12",
    },
    {
      id: "RSK-HIPAA-809",
      businessUnit: "Finance",
      category: "Data Residency",
      riskName: "Business Associate Agreement Gap",
      description: "Healthcare analytics software exporting clinical patient records without signing valid BAA agreements.",
      likelihood: 4,
      impact: 5,
      status: 'active',
      articleMapping: "HIPAA Privacy Rule § 164.502 (BAA Contracts)",
      infrastructure: "Patient Billing Portal API",
      lastAudited: "2026-07-01",
    },
    {
      id: "RSK-HIPAA-441",
      businessUnit: "Human Resources",
      category: "Sensitive Data",
      riskName: "Unauthorized Employee Medical Access",
      description: "Employee mental health claims records stored in internal directories accessible to unauthorized administrators.",
      likelihood: 2,
      impact: 4,
      status: 'active',
      articleMapping: "HIPAA Security Rule § 164.308 (Access Controls)",
      infrastructure: "BambooHR Claim Attachment Bucket",
      lastAudited: "2026-05-15",
    },
    {
      id: "RSK-HIPAA-105",
      businessUnit: "Marketing",
      category: "ePrivacy Consent",
      riskName: "Tracking Pixels on Patient Portal",
      description: "Meta Pixel loading inside secured patient portal sessions, leaking appointments and diagnosis strings to ad networks.",
      likelihood: 5,
      impact: 4,
      status: 'active',
      articleMapping: "HHS Guidance on Tracking Technologies",
      infrastructure: "Patient Portal Web Client",
      lastAudited: "2026-07-10",
    },
    {
      id: "RSK-HIPAA-504",
      businessUnit: "Engineering (AI Labs)",
      category: "AI Safety Act",
      riskName: "Smart AI Diagnostics Opacity",
      description: "Diagnostic AI screening algorithm recommending treatments without clear clinician explanation or FDA/HHS transparency checks.",
      likelihood: 4,
      impact: 4,
      status: 'active',
      articleMapping: "HHS AI Transparency & Algorithmic Bias Rules",
      infrastructure: "Clinical Diagnostics Model Hub",
      lastAudited: "2026-04-20",
    },
    {
      id: "RSK-HIPAA-611",
      businessUnit: "Legal & Compliance",
      category: "Data Minimization",
      riskName: "Delayed Data Breach Notification",
      description: "Failing to dispatch notification warnings to HHS and media within 60 days of detecting active database leak.",
      likelihood: 2,
      impact: 5,
      status: 'active',
      articleMapping: "HIPAA Breach Notification Rule § 164.404",
      infrastructure: "Legal Disclosure Pipeline",
      lastAudited: "2026-03-30",
    },
    {
      id: "RSK-HIPAA-223",
      businessUnit: "Sales / CRM",
      category: "Automated Profiling",
      riskName: "Inadvertent PHI Shared with CRM",
      description: "Syncing lead scoring webforms with active patient clinical indicators without explicit signed marketing authorizations.",
      likelihood: 3,
      impact: 3,
      status: 'active',
      articleMapping: "HIPAA Privacy Rule § 164.508 (Marketing Auth)",
      infrastructure: "HubSpot Clinical Lead Sync",
      lastAudited: "2026-06-25",
    },
    {
      id: "RSK-HIPAA-712",
      businessUnit: "Operations",
      category: "Vendor Sprawl",
      riskName: "Unvetted Off-shore Telehealth Pipelines",
      description: "Telehealth clinical video recordings forwarded to third-party offshore transcribers without HIPAA security validations.",
      likelihood: 4,
      impact: 4,
      status: 'active',
      articleMapping: "HIPAA Security Rule § 164.314 (Vendor Terms)",
      infrastructure: "Twilio WebRTC Video Processor",
      lastAudited: "2026-07-05",
    }
  ],
  'CA': [
    {
      id: "RSK-CA-302",
      businessUnit: "IT Operations",
      category: "Security Control",
      riskName: "Inadequate Safeguards for Breach Notification",
      description: "No real-time tracking registry to document security safeguards and security breaches for Commissioner reporting.",
      likelihood: 4,
      impact: 4,
      status: 'active',
      articleMapping: "PIPEDA Section 7.2 (Safeguards)",
      infrastructure: "Enterprise SIEM Syslogs",
      lastAudited: "2026-06-12",
    },
    {
      id: "RSK-CA-809",
      businessUnit: "Finance",
      category: "Data Residency",
      riskName: "Implied Consent for Premium Services",
      description: "Enrolling Canadian credit card customers into optional insurance programs via pre-selected implied consent checkboxes.",
      likelihood: 3,
      impact: 5,
      status: 'active',
      articleMapping: "PIPEDA Principle 3 (Consent Requirements)",
      infrastructure: "Stripe Recurring Billing Webhook",
      lastAudited: "2026-07-01",
    },
    {
      id: "RSK-CA-441",
      businessUnit: "Human Resources",
      category: "Sensitive Data",
      riskName: "HR Social Insurance Number Over-retention",
      description: "Archiving candidates' social insurance numbers indefinitely in permanent database records after onboarding ends.",
      likelihood: 2,
      impact: 4,
      status: 'active',
      articleMapping: "PIPEDA Principle 5 (Retention Limits)",
      infrastructure: "PostgreSQL Talent Database",
      lastAudited: "2026-05-15",
    },
    {
      id: "RSK-CA-105",
      businessUnit: "Marketing",
      category: "ePrivacy Consent",
      riskName: "Targeted Retargeting Opt-Out Missing",
      description: "Third-party cross-app behavioral tracking SDKs initialized without Canadian user consent banner choices.",
      likelihood: 5,
      impact: 3,
      status: 'active',
      articleMapping: "PIPEDA Consent for Tracking Cookies",
      infrastructure: "Facebook Conversions API Wrapper",
      lastAudited: "2026-07-10",
    },
    {
      id: "RSK-CA-504",
      businessUnit: "Engineering (AI Labs)",
      category: "AI Safety Act",
      riskName: "High-Impact AI Biases without Mitigation",
      description: "Deploying deep credit evaluation models into Canadian production regions without recording bias mitigation pipelines.",
      likelihood: 4,
      impact: 4,
      status: 'active',
      articleMapping: "Canada AIDA (Artificial Intelligence Act)",
      infrastructure: "Kubeflow Inference Instance",
      lastAudited: "2026-04-20",
    },
    {
      id: "RSK-CA-611",
      businessUnit: "Legal & Compliance",
      category: "Data Minimization",
      riskName: "Vague Cross-Border Data Pipeline Info",
      description: "Canadian customer database records mirrored globally without disclosing geographical processing nodes in policies.",
      likelihood: 3,
      impact: 3,
      status: 'active',
      articleMapping: "PIPEDA Principle 8 (Openness)",
      infrastructure: "Azure Multi-Region Cosmos DB",
      lastAudited: "2026-03-30",
    },
    {
      id: "RSK-CA-223",
      businessUnit: "Sales / CRM",
      category: "Automated Profiling",
      riskName: "Automatic Lead Gen without Opt-in",
      description: "Scraping and forwarding sales sequences to corporate emails without complying with CASL opt-in consents.",
      likelihood: 5,
      impact: 4,
      status: 'active',
      articleMapping: "Canada Anti-Spam Legislation (CASL)",
      infrastructure: "Apollo.io Outreach Pipeline",
      lastAudited: "2026-06-25",
    },
    {
      id: "RSK-CA-712",
      businessUnit: "Operations",
      category: "Vendor Sprawl",
      riskName: "Canadian Sub-processor Assessment Gap",
      description: "Outsourcing operational logistics data to a US-based partner without running formal privacy impact assessments.",
      likelihood: 3,
      impact: 4,
      status: 'active',
      articleMapping: "PIPEDA Accountability Principle",
      infrastructure: "Shopify Logistics Dispatcher",
      lastAudited: "2026-07-05",
    }
  ]
};

export const RiskAssessmentHeatmap: React.FC = () => {
  const { country, frameworkName } = useJurisdiction();
  const [risks, setRisks] = useState<ComplianceRisk[]>(() => JURISDICTIONAL_RISKS[country] || JURISDICTIONAL_RISKS.EU);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ l: number; i: number } | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'scatter'>('matrix');
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Load jurisdictional risks when selected country shifts
  useEffect(() => {
    const regionalData = JURISDICTIONAL_RISKS[country] || JURISDICTIONAL_RISKS.EU;
    setRisks(regionalData);
    if (regionalData.length > 0) {
      setSelectedRiskId(regionalData[0].id);
    }
  }, [country]);


  // Autofocus Intervention State
  const [interventionLog, setInterventionLog] = useState<string[]>([]);
  const [interventionProgress, setInterventionProgress] = useState(0);
  const [isIntervening, setIsIntervening] = useState(false);

  // Filtered Risks list
  const filteredRisks = useMemo(() => {
    return risks.filter(r => {
      const matchBU = businessUnitFilter === 'All' || r.businessUnit === businessUnitFilter;
      const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
      return matchBU && matchCat;
    });
  }, [risks, businessUnitFilter, categoryFilter]);

  // Extract unique filters
  const businessUnits = useMemo(() => ['All', ...Array.from(new Set(risks.map(r => r.businessUnit)))], [risks]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(risks.map(r => r.category)))], [risks]);

  // Calculate Metrics
  const activeCount = useMemo(() => risks.filter(r => r.status === 'active').length, [risks]);
  const mitigatingCount = useMemo(() => risks.filter(r => r.status === 'remediating').length, [risks]);
  const mitigatedCount = useMemo(() => risks.filter(r => r.status === 'mitigated').length, [risks]);
  
  const averageCompliance = useMemo(() => {
    // Score based on risk levels. Critical/High pull score down, mitigated risks pull score up.
    let totalPenalty = 0;
    risks.forEach(r => {
      if (r.status === 'active') {
        totalPenalty += r.likelihood * r.impact;
      } else if (r.status === 'remediating') {
        totalPenalty += (r.likelihood * r.impact) * 0.4;
      }
    });
    const baseScore = 100 - (totalPenalty * 1.5);
    return Math.max(12, Math.min(100, Math.round(baseScore)));
  }, [risks]);

  // Handle cell click in 5x5 grid
  const handleCellClick = (l: number, i: number) => {
    if (selectedCell && selectedCell.l === l && selectedCell.i === i) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ l, i });
      // Find the first risk matching this cell and highlight it
      const matching = filteredRisks.find(r => r.likelihood === l && r.impact === i);
      if (matching) {
        setSelectedRiskId(matching.id);
      }
    }
  };

  // Find currently selected risk item
  const selectedRisk = useMemo(() => {
    return risks.find(r => r.id === selectedRiskId) || null;
  }, [risks, selectedRiskId]);

  // Trigger immediate autofocus intervention (removes/mitigates the risk)
  const triggerAutofocusIntervention = async (risk: ComplianceRisk) => {
    if (isIntervening) return;
    setIsIntervening(true);
    setInterventionProgress(5);
    setInterventionLog([
      `[${new Date().toLocaleTimeString()}] 🚀 INITIATING AUTOFOCUS INTERVENTION SYSTEM...`,
      `[${new Date().toLocaleTimeString()}] 🎯 TARGET INFRASTRUCTURE: ${risk.infrastructure}`,
      `[${new Date().toLocaleTimeString()}] 🔍 ANALYZING COMPLIANCE DRIFT against: ${risk.articleMapping}`
    ]);

    // Update risk status to remediating
    setRisks(prev => prev.map(r => r.id === risk.id ? { ...r, status: 'remediating' } : r));

    // Simulated log steps with asynchronous timeouts
    const steps = [
      { p: 20, log: `[SYSTEM] 📡 Spawning specialized legal engine compliance agent for ${risk.businessUnit}...` },
      { p: 45, log: `[ENCRYPT] 🔐 Rotating compromised keys & establishing zero-trust vault on ${risk.infrastructure}...` },
      { p: 65, log: `[POLICIES] 🛠️ Rewriting proxy rules and applying automated headless patch schema...` },
      { p: 85, log: `[AUDIT] ✍️ Writing secure immutable SHA-256 eIDAS checksum into sqlite audit_events ledger...` },
      { p: 100, log: `[COMPLETED] 🎉 Autofocus Remediation fully verified! Risk lowered to Negligible.` }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setInterventionProgress(step.p);
      setInterventionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.log}`]);
    }

    // Update risk to mitigated and move coordinates to safe zone (1,1)
    setRisks(prev => prev.map(r => 
      r.id === risk.id 
        ? { ...r, status: 'mitigated', likelihood: 1, impact: 1, description: `[Mitigated] ${r.description}` } 
        : r
    ));

    // Also trigger the central audit API endpoint
    try {
      await fetch('/api/v1/compliance/pipeline-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: risk.businessUnit.toLowerCase().includes('finance') ? 'fintech' : 'saas',
          policy: risk.riskName,
          content: risk.description
        })
      });
    } catch (e) {
      console.warn("Audit pipeline API call omitted or offline:", e);
    }

    setIsIntervening(false);
  };

  // Recharts custom scatter formatter
  const scatterData = useMemo(() => {
    return filteredRisks.map(r => ({
      x: r.likelihood,
      y: r.impact,
      id: r.id,
      name: r.riskName,
      unit: r.businessUnit,
      score: r.likelihood * r.impact,
      status: r.status,
      raw: r
    }));
  }, [filteredRisks]);

  // Render Risk Color Cell Background dynamically based on risk level
  const getCellBgClass = (l: number, i: number) => {
    const score = l * i;
    const isMatchedByFilter = selectedCell ? (selectedCell.l === l && selectedCell.i === i) : false;
    
    let baseColor = '';
    if (score >= 16) {
      baseColor = 'bg-rose-500/15 border-rose-500/35 hover:bg-rose-500/25'; // Critical Zone
    } else if (score >= 10) {
      baseColor = 'bg-orange-500/15 border-orange-500/35 hover:bg-orange-500/25'; // High Zone
    } else if (score >= 5) {
      baseColor = 'bg-amber-500/15 border-amber-500/35 hover:bg-amber-500/25'; // Medium Zone
    } else {
      baseColor = 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20'; // Low/Safe Zone
    }

    return `${baseColor} ${isMatchedByFilter ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 border-indigo-500' : ''}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl space-y-4 sm:space-y-6 text-left">
      
      {/* 1. Header & Summary Controllers */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-4 border-b border-slate-800/80 gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-wider rounded border border-rose-500/20">
                  Autofocus Enabled
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live Matrix Engine v2.4</span>
                <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-400 text-[9px] font-bold uppercase tracking-wider rounded border border-indigo-500/20 flex items-center gap-1">
                  <span>{country === 'EU' ? '🇪🇺' : country === 'US-CA' ? '🇺🇸' : country === 'US-HIPAA' ? '🏥' : '🇨🇦'}</span>
                  <span>{frameworkName}</span>
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Tactical Compliance Risk Matrix
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous compliance control matrix mapping vulnerability likelihood against business impact. Select high-exposure items to command targeted autofocus remediations.
          </p>
        </div>

        {/* View Mode Controllers & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Business Unit Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={businessUnitFilter}
              onChange={(e) => setBusinessUnitFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs font-bold focus:outline-none pr-2 cursor-pointer"
            >
              {businessUnits.map(bu => (
                <option key={bu} value={bu} className="bg-slate-900 text-slate-300">{bu === 'All' ? 'All Units' : bu}</option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs font-bold focus:outline-none pr-2 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-300">{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setViewMode('matrix')}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tactile Grid
            </button>
            <button
              onClick={() => setViewMode('scatter')}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'scatter' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Analytical Plot
            </button>
          </div>
        </div>
      </div>

      {/* 2. Micro Dashboard Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Compliance Posture Score */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Posture</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{averageCompliance}%</span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Calculated dynamically
            </span>
          </div>
          {/* Tiny Radial Progress */}
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-indigo-400" strokeDasharray={`${averageCompliance}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-300">
              {averageCompliance}%
            </div>
          </div>
        </div>

        {/* Active Exposure Inventory */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl shrink-0">
            <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Hazards</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{activeCount} Risks</span>
            <p className="text-[9px] text-slate-400 mt-0.5">Requiring immediate audit review</p>
          </div>
        </div>

        {/* Mitigating/In-flight Operations */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl shrink-0">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">In-flight Autofix</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{mitigatingCount} Active</span>
            <p className="text-[9px] text-slate-400 mt-0.5">Sovereign agent executing hot-patch</p>
          </div>
        </div>

        {/* Completed Resolutions */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Autofixed Risks</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{mitigatedCount} Patched</span>
            <p className="text-[9px] text-slate-400 mt-0.5">Secured & logged permanently</p>
          </div>
        </div>

      </div>

      {/* 3. Main Grid layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        
        {/* Left Matrix Grid Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {viewMode === 'matrix' ? (
            <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Tactile 5x5 Likelihood / Impact Coordinates
                  </span>
                  {selectedCell && (
                    <button 
                      onClick={() => setSelectedCell(null)}
                      className="text-[10px] font-bold text-indigo-400 hover:text-white cursor-pointer"
                    >
                      Clear Selection Filters [X]
                    </button>
                  )}
                </div>

                {/* Grid Header labels */}
                <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">
                  <div>Impact / Lkl</div>
                  <div>1. Rare</div>
                  <div>2. Unlikely</div>
                  <div>3. Possible</div>
                  <div>4. Likely</div>
                  <div>5. Almost</div>
                </div>

                {/* 5x5 Rows */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((impactIndex) => {
                    return (
                      <div key={impactIndex} className="grid grid-cols-6 gap-2 items-center">
                        {/* Row Y Axis Label */}
                        <div className="text-[10px] font-bold text-slate-400 truncate pr-1">
                          {impactIndex}. {IMPACT_LABELS[impactIndex - 1]}
                        </div>

                        {/* Cell Quadrants */}
                        {[1, 2, 3, 4, 5].map((likelihoodIndex) => {
                          // Find risks mapped exactly to this cell
                          const cellRisks = filteredRisks.filter(
                            r => r.likelihood === likelihoodIndex && r.impact === impactIndex
                          );

                          return (
                            <div
                              key={likelihoodIndex}
                              onClick={() => handleCellClick(likelihoodIndex, impactIndex)}
                              className={`h-16 rounded-xl border flex flex-col justify-between p-1.5 cursor-pointer transition-all ${getCellBgClass(
                                likelihoodIndex,
                                impactIndex
                              )}`}
                            >
                              <div className="text-[8px] font-bold text-slate-500 font-mono flex justify-between">
                                <span>{likelihoodIndex},{impactIndex}</span>
                                {cellRisks.length > 0 && (
                                  <span className="px-1 bg-indigo-500/20 text-indigo-300 rounded font-bold">
                                    {cellRisks.length}
                                  </span>
                                )}
                              </div>

                              {/* Tiny horizontal labels representing active business units */}
                              <div className="flex flex-wrap gap-1 max-h-8 overflow-hidden">
                                {cellRisks.map((cr, idx) => {
                                  let statusColor = 'bg-rose-500/20 text-rose-300';
                                  if (cr.status === 'remediating') statusColor = 'bg-amber-500/30 text-amber-300 animate-pulse';
                                  if (cr.status === 'mitigated') statusColor = 'bg-emerald-500/20 text-emerald-300';

                                  return (
                                    <span 
                                      key={idx} 
                                      className={`text-[8px] font-extrabold px-1 rounded truncate tracking-tighter ${statusColor}`}
                                      style={{ maxWidth: '40px' }}
                                    >
                                      {cr.businessUnit.split(' ')[0]}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid Footer disclaimer */}
              <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-850 pt-2.5">
                <div className="flex gap-3">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-sm"></span> Low</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500/40 rounded-sm"></span> Med</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500/20 border border-orange-500/40 rounded-sm"></span> High</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500/25 border border-rose-500/40 rounded-sm"></span> Critical</span>
                </div>
                <span>*Hover or Click cells to filter active threat profiles</span>
              </div>
            </div>
          ) : (
            // Scatter Coordinate View using recharts
            <div className="flex-1 bg-slate-950 border border-slate-850 rounded-2xl p-5 h-[340px] flex flex-col justify-between">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 10 }}>
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Likelihood"
                      domain={[0.5, 5.5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(val) => LIKELIHOOD_LABELS[val - 1] || ''}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Impact"
                      domain={[0.5, 5.5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(val) => IMPACT_LABELS[val - 1] || ''}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ZAxis type="number" dataKey="score" range={[150, 450]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload.raw;
                          return (
                            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                              <span className="font-extrabold text-white block">{item.riskName}</span>
                              <div className="text-slate-400 font-medium">Unit: {item.businessUnit}</div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500">Postured:</span>
                                <span className={`font-bold ${
                                  item.likelihood * item.impact >= 16 ? 'text-rose-400' :
                                  item.likelihood * item.impact >= 10 ? 'text-orange-400' : 'text-emerald-400'
                                }`}>
                                  L{item.likelihood} x I{item.impact}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      name="Threat Vector"
                      data={scatterData}
                      onClick={(e: any) => {
                        const targetId = e?.payload?.id || e?.id;
                        if (targetId) setSelectedRiskId(targetId);
                      }}
                    >
                      {scatterData.map((entry, index) => {
                        const score = entry.score;
                        let cellColor = '#10b981'; // safe
                        if (score >= 16) cellColor = '#f43f5e'; // critical
                        else if (score >= 10) cellColor = '#f97316'; // orange
                        else if (score >= 5) cellColor = '#f59e0b'; // yellow

                        return (
                          <RechartsCell
                            key={`cell-${index}`}
                            fill={cellColor}
                            stroke={selectedRiskId === entry.id ? '#ffffff' : 'none'}
                            strokeWidth={selectedRiskId === entry.id ? 2 : 0}
                            className="cursor-pointer"
                          />
                        );
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Interactive risk catalog matching filter list */}
          <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>
                Matching Threats: <strong className="text-white">{filteredRisks.length} active anomalies</strong>
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              *Showing filtered metrics for chosen business modules
            </div>
          </div>

        </div>

        {/* Right Audit Remediation Detail Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex-1 flex flex-col justify-between space-y-4 relative overflow-hidden">
            
            {/* Top Info section */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Threat Resolution Sandbox</span>
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono">
                  {selectedRisk ? selectedRisk.id : 'None Selected'}
                </span>
              </div>

              {selectedRisk ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-base font-black text-white leading-tight flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        selectedRisk.likelihood * selectedRisk.impact >= 16 ? 'bg-rose-500 animate-ping' :
                        selectedRisk.likelihood * selectedRisk.impact >= 10 ? 'bg-orange-400' : 'bg-emerald-400'
                      }`} />
                      {selectedRisk.riskName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-bold rounded">
                        BU: {selectedRisk.businessUnit}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-indigo-300 text-[10px] font-bold rounded">
                        Cat: {selectedRisk.category}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono rounded">
                        Score: {selectedRisk.likelihood * selectedRisk.impact} (L{selectedRisk.likelihood}xI{selectedRisk.impact})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-850">
                    {selectedRisk.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-900 border border-slate-850/80 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 block">Mapping Mandate</span>
                      <span className="font-extrabold text-slate-200 block truncate" title={selectedRisk.articleMapping}>
                        {selectedRisk.articleMapping}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-900 border border-slate-850/80 rounded-xl space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 block">Asset Target</span>
                      <span className="font-extrabold text-slate-200 block truncate" title={selectedRisk.infrastructure}>
                        {selectedRisk.infrastructure}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
                  <Building2 className="w-10 h-10 text-slate-600" />
                  <p className="text-xs font-bold text-slate-400">No vulnerability selected</p>
                  <p className="text-[10px] text-slate-500 max-w-xs">Select a specific grid quadrant or threat item to start live audit simulation.</p>
                </div>
              )}
            </div>

            {/* Autofocus Console streaming terminal */}
            {selectedRisk && (
              <div className="space-y-3 pt-3 border-t border-slate-850">
                <AnimatePresence mode="wait">
                  {isIntervening || interventionLog.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {/* Interactive Console logs */}
                      <div className="bg-black border border-slate-800 rounded-xl p-3 font-mono text-[9px] text-emerald-400 h-28 overflow-y-auto space-y-1 relative">
                        <span className="absolute top-1.5 right-2 text-slate-600 flex items-center gap-1 text-[8px]">
                          <Terminal className="w-3 h-3" /> Console Logs
                        </span>
                        {interventionLog.map((log, idx) => (
                          <div key={idx} className="leading-tight">{log}</div>
                        ))}
                      </div>

                      {/* Animated Progress indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>Autofocus Progress</span>
                          <span>{interventionProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                            style={{ width: `${interventionProgress}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Main Action Controllers */}
                <div className="space-y-2">
                  {selectedRisk.status === 'active' ? (
                    <button
                      onClick={() => triggerAutofocusIntervention(selectedRisk)}
                      disabled={isIntervening}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15 cursor-pointer border-none"
                    >
                      {isIntervening ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Executing Tactical Hot-Fix...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          Trigger Immediate Autofocus Intervention
                        </>
                      )}
                    </button>
                  ) : selectedRisk.status === 'remediating' ? (
                    <button
                      disabled
                      className="w-full py-3 bg-slate-900 text-slate-500 border border-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin" /> Autonomous Agent Remediation In-Flight...
                    </button>
                  ) : (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block">Mitigation Status Secured</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Autofit completed successfully. Immutable certificate signed and logged under checksum.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* 4. Bottom Active/Threat Inventory List */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-850/80 mb-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Compliance Threat Log & Audit Trail
          </span>
          <span className="text-[10px] text-slate-500">
            Total Inventory: {risks.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="pb-2">Risk ID</th>
                <th className="pb-2">Business Unit</th>
                <th className="pb-2">Risk Category</th>
                <th className="pb-2">Identified Hazard</th>
                <th className="pb-2">Co-ordinates</th>
                <th className="pb-2">Article Mandate</th>
                <th className="pb-2">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs text-slate-300">
              {filteredRisks.map((risk) => {
                const isSelected = selectedRiskId === risk.id;
                const score = risk.likelihood * risk.impact;

                let badgeColor = '';
                if (score >= 16) badgeColor = 'bg-rose-500/15 text-rose-400 border border-rose-500/20';
                else if (score >= 10) badgeColor = 'bg-orange-500/15 text-orange-400 border border-orange-500/20';
                else if (score >= 5) badgeColor = 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
                else badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';

                return (
                  <tr
                    key={risk.id}
                    onClick={() => setSelectedRiskId(risk.id)}
                    className={`hover:bg-slate-900/50 cursor-pointer transition-all ${
                      isSelected ? 'bg-indigo-500/5 text-white font-medium' : ''
                    }`}
                  >
                    <td className="py-2.5 font-mono text-[10px] text-indigo-400 font-bold">{risk.id}</td>
                    <td className="py-2.5 font-bold">{risk.businessUnit}</td>
                    <td className="py-2.5 text-slate-400">{risk.category}</td>
                    <td className="py-2.5">
                      <div>
                        <span className="font-semibold block text-slate-200">{risk.riskName}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-xs">{risk.description}</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColor}`}>
                        L{risk.likelihood} x I{risk.impact} ({score})
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[10px] text-slate-400">{risk.articleMapping}</td>
                    <td className="py-2.5">
                      {risk.status === 'active' ? (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          Active Exposure
                        </span>
                      ) : risk.status === 'remediating' ? (
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          In-Flight Autofix
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" /> Securing
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
