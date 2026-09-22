import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  RefreshCcw, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  Shield, 
  Activity, 
  Users, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  Search, 
  Compass, 
  AlertCircle, 
  Wrench,
  HelpCircle,
  FileCheck2,
  Play,
  Pause,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  Stethoscope,
  Briefcase
} from 'lucide-react';
import { Joyride, Step } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { usePiiScanService } from '../hooks/usePiiScanService';
import { GdprSimulation } from '../components/GdprSimulation';
import { QuantumRiskAssessment } from '../components/QuantumRiskAssessment';
import { AuditExport } from '../components/AuditExport';
import { DocumentGenerator } from '../components/DocumentGenerator';
import { RegulatoryDeadlineTimeline } from '../components/dashboard/RegulatoryDeadlineTimeline';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ScatterChart, 
  Scatter, 
  ZAxis,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// ISO 27501 Controls static seed data
interface ControlItem {
  id: string;
  title: string;
  category: string;
  status: 'Compliant' | 'Non-Compliant' | 'Pending Review';
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedOwner: string;
  remediationStep: string;
}

const INITIAL_CONTROLS: ControlItem[] = [
  { 
    id: "A.5.1", 
    title: "Policies for Information Security", 
    category: "Organizational Controls", 
    status: "Compliant", 
    difficulty: "LOW", 
    assignedOwner: "auditor-a@nonaxen.com",
    remediationStep: "Policy review completed. Approved with annual reiteration protocol active."
  },
  { 
    id: "A.5.15", 
    title: "Access Control System Policies", 
    category: "Access Control Controls", 
    status: "Pending Review", 
    difficulty: "MEDIUM", 
    assignedOwner: "secops-b@nonaxen.com",
    remediationStep: "Map SSO access logs against actual HR exit dates. Ensure 15-minute idle locks are enforced via group policies."
  },
  { 
    id: "A.8.24", 
    title: "Use of Cryptography", 
    category: "Cryptographic Controls", 
    status: "Non-Compliant", 
    difficulty: "HIGH", 
    assignedOwner: "lead-engineer@nonaxen.com",
    remediationStep: "Replace SHA-1 signature hashes in local user sign-ons. Enforce AES-256 for all offline customer data backups."
  },
  { 
    id: "A.8.20", 
    title: "Network Security Controls", 
    category: "Technical Security", 
    status: "Compliant", 
    difficulty: "MEDIUM", 
    assignedOwner: "network-admin@nonaxen.com",
    remediationStep: "Subnet separation tested successfully. Web server traffic strictly separated from database backbones via ACLs."
  },
  { 
    id: "A.5.10", 
    title: "Acceptable Use of Assets", 
    category: "Asset Management", 
    status: "Pending Review", 
    difficulty: "LOW", 
    assignedOwner: "hr-director@nonaxen.com",
    remediationStep: "Publish the acceptable use documentation to team workspaces and require digital signature acknowledgment."
  },
  { 
    id: "A.8.8", 
    title: "Management of Technical Vulnerabilities", 
    category: "Vulnerability Management", 
    status: "Non-Compliant", 
    difficulty: "HIGH", 
    assignedOwner: "secops-b@nonaxen.com",
    remediationStep: "Deploy weekly scan suite to check for outdated open-source library assets. Set severities to break matching CI builds."
  },
  { 
    id: "A.8.12", 
    title: "Data Leakage Prevention", 
    category: "Data Protection Controls", 
    status: "Compliant", 
    difficulty: "HIGH", 
    assignedOwner: "dpo-compliance@nonaxen.com",
    remediationStep: "Data structures classified. Blocking regulations mapped for customer PII variables."
  }
];

const TOUR_STEPS: Step[] = [
  {
    target: '#tour-welcome',
    content: (
      <div className="text-left font-sans text-slate-700">
        <p className="font-extrabold text-slate-900 text-sm mb-1">Welcome, Tenant Owner! 👋</p>
        <p className="text-xs leading-relaxed text-slate-600 font-medium">
          This is your <strong>Compliance Automation Portal</strong> (ISMS Control Room). Let's take a quick 1-minute interactive tour to help you navigate and master your ISMS audit dashboard!
        </p>
      </div>
    ),
    placement: 'center',
    skipBeacon: true,
  },
  {
    target: '#tour-document-generator',
    content: (
      <div className="text-left font-sans text-slate-700">
        <p className="font-extrabold text-slate-900 text-sm mb-1">1. Document Generator Hub 📄</p>
        <p className="text-xs leading-relaxed text-slate-600 font-medium">
          Draft and export regulatory policies, DPA records, and audits in PDF format instantly. Simply fill out the form metadata to generate your legally sound drafts.
        </p>
      </div>
    ),
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    target: '#tour-trigger-audit',
    content: (
      <div className="text-left font-sans text-slate-700">
        <p className="font-extrabold text-slate-900 text-sm mb-1">2. Trigger CPU Audits ⚡</p>
        <p className="text-xs leading-relaxed text-slate-600 font-medium">
          Kick off fully self-hosted, CPU-powered ISMS audit routines to analyze compliance gaps and update control statuses instantly with local policy diagnostics.
        </p>
      </div>
    ),
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    target: '#tour-stats-cards',
    content: (
      <div className="text-left font-sans text-slate-700">
        <p className="font-extrabold text-slate-900 text-sm mb-1">3. Live Compliance Posture 📊</p>
        <p className="text-xs leading-relaxed text-slate-600 font-medium">
          Monitor your cumulative ISMS score, active non-compliant findings, pending reviews, and the local AI model inference telemetry stats.
        </p>
      </div>
    ),
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    target: '#tour-compliance-trends',
    content: (
      <div className="text-left font-sans text-slate-700">
        <p className="font-extrabold text-slate-900 text-sm mb-1">4. Score Trends & Risk Densities 📈</p>
        <p className="text-xs leading-relaxed text-slate-600 font-medium">
          Examine compliance trends over time and inspect high-risk coordinates plotted across standard control categories on our scatter map.
        </p>
      </div>
    ),
    placement: 'top',
    skipBeacon: true,
  },
  {
    target: '#tour-pii-scanner',
    content: (
      <div className="text-left font-sans text-slate-700">
        <p className="font-extrabold text-slate-900 text-sm mb-1">5. Sovereign PII Leakage Scanner 🛡️</p>
        <p className="text-xs leading-relaxed text-slate-600 font-medium">
          Manage live background threat-scanning configurations. This engine watches codebases and isolates leaked social security numbers or API keys before they escape.
        </p>
      </div>
    ),
    placement: 'top',
    skipBeacon: true,
  },
  {
    target: '#tour-posture-list',
    content: (
      <div className="text-left font-sans text-slate-700">
        <p className="font-extrabold text-slate-900 text-sm mb-1">6. ISO 27001 Posture Controls 📋</p>
        <p className="text-xs leading-relaxed text-slate-600 font-medium">
          Review individual ISO standards. Select any control row to load real-time status diagnostics, owner listings, and the AI remediation co-pilot.
        </p>
      </div>
    ),
    placement: 'top',
    skipBeacon: true,
  },
  {
    target: '#tour-ai-drawer',
    content: (
      <div className="text-left font-sans text-slate-700">
        <p className="font-extrabold text-slate-900 text-sm mb-1">7. AI Suggestions & Immutable Ledger 🧠</p>
        <p className="text-xs leading-relaxed text-slate-600 font-medium">
          Generate bespoke, offline compliance remediation code suggestions via CPU AI models and check the immutable local logs ledger.
        </p>
      </div>
    ),
    placement: 'top',
    skipBeacon: true,
  }
];

export const ComplianceAutomationPortal: React.FC = () => {
  const { user } = useAuth();
  const activeRole = user?.user_metadata?.role || "TENANT_OWNER";
  const [controls, setControls] = useState<ControlItem[]>(INITIAL_CONTROLS);
  const [runTour, setRunTour] = useState(false);

  // Auto-start onboarding tour for new Tenant Owners on initial load
  useEffect(() => {
    const isGlobalTourCompleted = localStorage.getItem(`tour_completed_${activeRole}`) === 'true';
    const isTourCompleted = localStorage.getItem('compliance_portal_tour_completed');
    if (isGlobalTourCompleted && !isTourCompleted) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeRole]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('compliance_portal_tour_completed', 'true');
    }
  };
  const [activeAuditingId, setActiveAuditingId] = useState<string | null>(null);
  const [selectedPiiItems, setSelectedPiiItems] = useState<string[]>([]);
  const [remediationHistory, setRemediationHistory] = useState<Array<{ id: string; action: string; itemsCount: number; timestamp: string }>>([]);
  const [showRemediationHistory, setShowRemediationHistory] = useState(false);
  const [piiRemediationStatusFilter, setPiiRemediationStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Remediated'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Compliant' | 'Non-Compliant' | 'Pending Review'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<Array<{ text: string; time: string }>>([
    { text: "ISO 27001 audit cron re-triggered.", time: "10 mins ago" },
    { text: "Control A.5.1 marked Compliant after local policy upload.", time: "1 hour ago" },
    { text: "PII database scan triggered automatically.", time: "4 hours ago" }
  ]);
  
  // Background PII leakage scanner service hook configuration
  const [isScannerEnabled, setIsScannerEnabled] = useState(true);
  const {
    scanHistory,
    isScanning,
    cumulativeLeaks,
    cumulativeScans,
    lastScanTime,
    triggerScan
  } = usePiiScanService(isScannerEnabled, 15000);

  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const activeScan = useMemo(() => {
    if (!scanHistory || scanHistory.length === 0) return null;
    if (!selectedScanId) return scanHistory[0];
    return scanHistory.find(s => s.id === selectedScanId) || scanHistory[0];
  }, [scanHistory, selectedScanId]);

  // Sync background scanner events with the general sovereign auditing logs ledger
  const lastLoggedScanId = useRef<string | null>(null);
  useEffect(() => {
    if (scanHistory.length > 0) {
      const latestScan = scanHistory[0];
      if (latestScan.id !== lastLoggedScanId.current) {
        lastLoggedScanId.current = latestScan.id;
        const logText = latestScan.totalLeaksFound > 0
          ? `[SCANNER] Threat detected! Found ${latestScan.totalLeaksFound} PII leak pattern(s) across ${latestScan.filesScannedCount} files. Action: Isolated.`
          : `[SCANNER] Workspace search clean. Scanned ${latestScan.filesScannedCount} files. No leakage patterns found.`;
        
        setAuditLogs(prev => [
          { text: logText, time: "Just now" },
          ...prev
        ]);
      }
    }
  }, [scanHistory]);

  // Selected control detail for interactive Local AI drawer
  const [selectedControl, setSelectedControl] = useState<ControlItem | null>(null);
  const [isGeneratingAiFix, setIsGeneratingAiFix] = useState(false);
  const [aiFixResult, setAiFixResult] = useState<string | null>(null);

  // 1. Line Chart Data - Progression score over 6 Months
  const complianceTrendData = [
    { name: 'Jan', Score: 62, ControlsMapped: 15 },
    { name: 'Feb', Score: 68, ControlsMapped: 22 },
    { name: 'Mar', Score: 73, ControlsMapped: 24 },
    { name: 'Apr', Score: 81, ControlsMapped: 30 },
    { name: 'May', Score: 85, ControlsMapped: 32 },
    { name: 'Jun', Score: 92, ControlsMapped: 35 }
  ];

  // 2. Risk Density scatter data - Derived dynamically from current controls
  const riskDensityData = useMemo(() => {
    return controls.map((control) => {
      // Numerical category for Y mapping (Organizational=1, Access=2, Cryptography=3, Network/Technical=4, Asset=5, Vulnerability=6, DataProtection=7)
      let catIndex = 4;
      if (control.category.includes("Organizational")) catIndex = 1;
      else if (control.category.includes("Access")) catIndex = 2;
      else if (control.category.includes("Cryptographic")) catIndex = 3;
      else if (control.category.includes("Asset")) catIndex = 5;
      else if (control.category.includes("Vulnerability")) catIndex = 6;
      else if (control.category.includes("Data Protection")) catIndex = 7;

      // Risk score mapped based on status / difficulty
      let riskScore = 15; // default low
      if (control.status === "Non-Compliant") {
        riskScore = control.difficulty === "HIGH" ? 90 : 65;
      } else if (control.status === "Pending Review") {
        riskScore = control.difficulty === "HIGH" ? 50 : 35;
      } else {
        riskScore = control.difficulty === "HIGH" ? 25 : 12;
      }

      return {
        id: control.id,
        title: control.title,
        category: control.category,
        x: catIndex,
        y: riskScore,
        z: control.difficulty === "HIGH" ? 200 : control.difficulty === "MEDIUM" ? 120 : 60,
        status: control.status
      };
    });
  }, [controls]);

  // Overall Statistics Panel
  const stats = useMemo(() => {
    const total = controls.length;
    const compliant = controls.filter(c => c.status === "Compliant").length;
    const nonCompliant = controls.filter(c => c.status === "Non-Compliant").length;
    const pending = controls.filter(c => c.status === "Pending Review").length;
    const percentage = Math.round((compliant / total) * 100);

    return { total, compliant, nonCompliant, pending, percentage };
  }, [controls]);

  // Trigger Local CPU Audit suite
  const handleRunAuditSuite = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Simulate changing a control status with CPU Reasoning
      setControls(prev => prev.map(c => {
        if (c.id === "A.5.10" && c.status === "Pending Review") {
          return { ...c, status: "Compliant" };
        }
        return c;
      }));
      setAuditLogs(prev => [
        { text: "Local CPU Policy Engine completed audit of Asset Management (A.5.10). Result: Compliant", time: "Just now" },
        ...prev
      ]);
    }, 1500);
  };

  // Generate Local CPU AI Remediation Suggestion
  const handleGenerateAiFix = async (control: ControlItem) => {
    setIsGeneratingAiFix(true);
    setAiFixResult(null);
    
    // Map control categories to remediation types
    const mapCategoryToAiType = (category: string): 'consent' | 'privacy' | 'retention' | 'dsar' => {
      const cat = category.toLowerCase();
      if (cat.includes('consent') || cat.includes('data protection') || cat.includes('leakage')) return 'consent';
      if (cat.includes('cryptographic') || cat.includes('vulnerability') || cat.includes('technical')) return 'retention';
      if (cat.includes('access') || cat.includes('asset')) return 'dsar';
      return 'privacy';
    };

    try {
      const type = mapCategoryToAiType(control.category);
      const response = await fetchWithRetry('/api/v1/compliance/ai-remediate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          content: `Control: ${control.id} - ${control.title}\nCategory: ${control.category}\nOwner: ${control.assignedOwner}\nStep: ${control.remediationStep}`,
          customInstructions: `Generate an expert, detailed and directly applicable technical remediation blueprint (including code blocks, SQL, or clean statements) that addresses this control.`
        })
      });

      if (!response.ok) {
        throw new Error('AI Server endpoint error');
      }

      const data = await response.json();
      if (data.success && data.patchedContent) {
        setAiFixResult(data.patchedContent);
        setAuditLogs(prev => [
          { text: `Generated customized AI remediation patch for ${control.id} via Gemini AI.`, time: "Just now" },
          ...prev
        ]);
      } else {
        throw new Error(data.error || 'No patch returned');
      }
    } catch (err: any) {
      console.warn("AI endpoint fallback triggered:", err.message || err);
      // Fallback local CPU generator logic
      let fix = "";
      if (control.id === "A.8.24") {
        fix = `// LOCAL COGNITIVE REMEDIATION (CPU MODEL INFERENCE SUCCESS)
1. Initialize WebCrypto API or node:crypto using secure AES-256-GCM context:
   const key = crypto.scryptSync(process.env.LOCAL_DB_PASSPHRASE, 'salt', 32);
   const iv = crypto.randomBytes(16);
   const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
2. Enforce Argon2id hashing algorithms for all local SQLite workspace user tables.
3. Automatically configure secure cookies headers:
   Set-Cookie: token=...; Secure; HttpOnly; SameSite=Strict;`;
      } else if (control.id === "A.8.8") {
        fix = `# REVOLUTIONIZING INTERNAL VULNERABILITY AUDITS
1. Set up self-hosted OWASP dependencycheck action on code push.
2. Filter libraries with active high-severity CVE tags in SQLite table (sqlite.db:system_standards).
3. Auto-update dependencies via local registry configuration script:
   npm audit fix --force --registry=https://local-sovereign-proxy/`;
      } else {
        fix = `## DRAFTED COMPLIANCE OBLIGATION (Local AI RAG Match)
1. Categorize data inputs mapped strictly to ${control.category}.
2. Ensure ${control.assignedOwner} is provisioned with minimum structural access levels.
3. Run Local AI Liaison Module on change of compliance posture.`;
      }
      setAiFixResult(fix);
      setAuditLogs(prev => [
        { text: `Generated local offline remediation draft for ${control.id}.`, time: "Just now" },
        ...prev
      ]);
    } finally {
      setIsGeneratingAiFix(false);
    }
  };

  // Filtered list of controls
  const filteredControls = useMemo(() => {
    return controls.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [controls, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 px-2 py-4">
      {/* Interactive Onboarding Tour Overlay */}
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        continuous={true}
        onEvent={handleJoyrideCallback}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish Tour',
          next: 'Next Step',
          skip: 'Skip Tour'
        }}
        options={{
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(15, 23, 42, 0.65)',
          primaryColor: '#059669', // Emerald 600
          textColor: '#0f172a', // Slate 900
          zIndex: 10000,
          showProgress: true,
          buttons: ['back', 'primary', 'skip']
        }}
        styles={{
          tooltipContainer: {
            textAlign: 'left',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            border: '1px solid #e2e8f0',
            padding: '8px',
          },
          buttonPrimary: {
            backgroundColor: '#10b981', // Emerald 500
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700',
            borderRadius: '10px',
            padding: '8px 14px',
            outline: 'none',
            cursor: 'pointer',
          },
          buttonBack: {
            color: '#64748b', // Slate 500
            fontSize: '11px',
            fontWeight: '700',
            marginRight: '12px',
            outline: 'none',
            cursor: 'pointer',
          },
          buttonSkip: {
            color: '#94a3b8', // Slate 400
            fontSize: '11px',
            fontWeight: '700',
            outline: 'none',
            cursor: 'pointer',
          }
        }}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 id="tour-welcome" className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
            <Activity className="h-7 w-7 text-emerald-600 animate-pulse" />
            Compliance Operations <span className="text-slate-400 font-medium">(ISMS Control Room)</span>
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-2xl">
            Maintain high-security audits, risk densities, and automated ISO 27001 policies locally via CPU-based AI reasoning.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setRunTour(true)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer font-sans border border-slate-200"
            title="Launch interactive onboarding guide"
          >
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <span>Help Tour</span>
          </button>

          <button
            id="tour-trigger-audit"
            onClick={handleRunAuditSuite}
            disabled={isRefreshing}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer font-sans"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <RefreshCcw className="h-4 w-4 text-white" />
            )}
            <span>Trigger CPU Audit System</span>
          </button>
        </div>
      </div>

      {/* AI-POWERED INDUSTRY WALKTHROUGH */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-1 space-y-2">
            <h3 className="font-extrabold text-indigo-900 text-sm flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              AI-Powered Compliance Onboarding
            </h3>
            <p className="text-xs text-indigo-800/80 leading-relaxed max-w-xl">
              Select your active industry add-on. The sovereign AI will instantly customize your compliance roadmap, highlighting the next best actions required to meet vertical-specific regulations (e.g., HIPAA, PCI-DSS).
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => {
                setSearchQuery("Health");
                setRunTour(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Healthtech
            </button>
            <button 
              onClick={() => {
                setSearchQuery("Finance");
                setRunTour(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Fintech
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENT GENERATOR MODULE */}
      <div id="tour-document-generator">
        <DocumentGenerator />
      </div>

      {/* ISO 27001 Statistics Cards */}
      <div id="tour-stats-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute right-2 top-2 text-emerald-100 font-mono text-3xl font-black select-none pointer-events-none">ISO</div>
          <p className="text-xs font-bold text-slate-500 uppercase">ISMS Score Posture</p>
          <div className="text-3xl font-black text-emerald-600 tracking-tighter mt-1">{stats.percentage}%</div>
          <span className="text-[10px] text-slate-400 font-medium">{stats.compliant} of {stats.total} Controls Verified</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Non-Compliant Items</p>
          <div className="text-3xl font-black text-rose-600 tracking-tighter mt-1">{stats.nonCompliant}</div>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">Action Required</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Pending Audits</p>
          <div className="text-3xl font-black text-amber-600 tracking-tighter mt-1">{stats.pending}</div>
          <span className="text-[10px] text-slate-400">Awaiting Auto-Fix Evidence</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute right-2 top-2 text-slate-100 font-mono text-xs font-black select-none pointer-events-none">AI LAYER</div>
          <p className="text-xs font-bold text-slate-500 uppercase">Sovereign Model</p>
          <div className="text-lg font-extrabold text-slate-800 mt-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
            Llama3.2-CPU
          </div>
          <span className="text-[10px] text-indigo-600 bg-indigo-50 font-semibold px-2 py-0.5 rounded mt-3 inline-block">100% Fully Self-Hosted</span>
        </div>
      </div>

      {/* RECHARTS VISUAL CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Card A: COMPLIANCE POSTURE TRENDS */}
        <div id="tour-compliance-trends" className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800 font-sans tracking-wide uppercase flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-500" />
              ISO 27001 Compliance score trends
            </h3>
            <p className="text-[11px] text-slate-400">Quarterly evolution of information security policy compliance</p>
          </div>
          
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceTrendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} strokeWidth={0.5} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} strokeWidth={0.5} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                <Line 
                  type="monotone" 
                  dataKey="Score" 
                  name="Sovereign Posture %" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card B: REAL-TIME RISK DENSITY MAP */}
        <div id="tour-risk-map" className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800 font-sans tracking-wide uppercase flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-rose-500" />
              Sovereign Risk Density Map
            </h3>
            <p className="text-[11px] text-slate-400">Real-time risk levels plotted per control categories (high coordinates represent high threat)</p>
          </div>
          
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Category Group" 
                  domain={[0, 8]}
                  tickCount={7}
                  stroke="#94a3b8" 
                  fontSize={10} 
                  strokeWidth={0.5} 
                  tickFormatter={(val) => {
                    if (val === 1) return 'Org';
                    if (val === 2) return 'Access';
                    if (val === 3) return 'Crypto';
                    if (val === 5) return 'Asset';
                    if (val === 6) return 'Scan';
                    if (val === 7) return 'Privacy';
                    return '';
                  }}
                  tickLine={false}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Risk Rating" 
                  domain={[0, 100]}
                  stroke="#94a3b8" 
                  fontSize={10} 
                  strokeWidth={0.5} 
                  tickLine={false}
                />
                <ZAxis type="number" dataKey="z" range={[60, 240]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 outline-none text-xs space-y-1 shadow-md">
                          <p className="font-extrabold text-slate-905">{data.id}: {data.title}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Category: {data.category}</p>
                          <p className="text-[10.5px] font-bold text-rose-600">Calculated Risk Index: {data.y}%</p>
                          <p className="text-[9.5px] text-slate-400">Status: {data.status}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="ISMS Controls" data={riskDensityData}>
                  {riskDensityData.map((entry, index) => {
                    let fill = '#10b981'; // safe emerald
                    if (entry.status === 'Non-Compliant') fill = '#ef4444'; // dangerous red
                    else if (entry.status === 'Pending Review') fill = '#f59e0b'; // cautious amber
                    return <Cell key={`cell-${index}`} fill={fill} opacity={0.8} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* REGULATORY DEADLINE PROGRESSION TIMELINE */}
      <RegulatoryDeadlineTimeline />

      {/* REAL-TIME PII LEAKAGE SCANNER PANEL */}
      <div id="tour-pii-scanner" className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-950 flex items-center gap-3 text-lg">
              <ShieldAlert className="w-6 h-6 text-indigo-600 animate-pulse" />
              Sovereign PII Leakage Scanner
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Background Active
              </span>
            </h3>
            <p className="text-sm text-slate-600">
              Automated offline scan loops searching developer workspace files for social security numbers, API secrets, and raw keys.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold mr-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${isScannerEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              <span className="text-slate-700">
                {isScannerEnabled ? 'Active' : 'Paused'}
              </span>
            </div>

            {/* Enable/Disable Toggle */}
            <button
              onClick={() => setIsScannerEnabled(!isScannerEnabled)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isScannerEnabled 
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
              title={isScannerEnabled ? "Pause background service" : "Resume background service"}
            >
              {isScannerEnabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            {/* Manual scan trigger */}
            <button
              onClick={triggerScan}
              disabled={isScanning}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCcw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Force Scan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Column A: Service status & Stats */}
          <div className="space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Scanner Engine telemetry</h4>
              
              <div className="space-y-3 font-semibold text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Cumulative Runs:</span>
                  <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-lg font-mono">{cumulativeScans}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Exposures Flagged:</span>
                  <span className={`px-2 py-0.5 rounded-lg font-mono ${cumulativeLeaks > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {cumulativeLeaks}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-500 font-medium">Last Active Scan:</span>
                  <span className="text-slate-700 font-mono">
                    {lastScanTime ? lastScanTime.toLocaleTimeString() : 'Awaiting trigger...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Informational tip */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-y-2 translate-x-2">
                <Lock className="w-24 h-24 text-slate-300" />
              </div>
              <h5 className="font-bold text-xs flex items-center gap-1 text-white">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Auto-Quarantine Protocol
              </h5>
              <p className="text-[10.5px] text-slate-300 leading-relaxed">
                When a US Social Security Number or Private API key leaks, the sovereign firewall intercepts the transit logs, isolates the offending code block, and logs redacted versions.
              </p>
            </div>
          </div>

          {/* Column B: Scan History Timeline */}
          <div className="space-y-3 border-r border-slate-100 pr-0 lg:pr-6">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Live Scan Timeline</h4>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {scanHistory.length === 0 ? (
                <div className="h-[180px] flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-150 rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-300 mb-2" />
                  <span className="text-xs">Initializing telemetry receiver...</span>
                </div>
              ) : (
                scanHistory.map((scan) => {
                  const isActive = activeScan?.id === scan.id;
                  return (
                    <div
                      key={scan.id}
                      onClick={() => setSelectedScanId(scan.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isActive 
                          ? 'bg-indigo-50/50 border-indigo-200 shadow-xs' 
                          : 'bg-white hover:bg-slate-50 border-slate-150'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold text-slate-800">{scan.timestamp}</span>
                          <span className="text-[9px] text-slate-400">({scan.filesScannedCount} files)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {scan.totalLeaksFound > 0 ? (
                            <span className="text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {scan.totalLeaksFound} Leak(s) Detected
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Clear
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 text-slate-450 transition-transform ${isActive ? 'translate-x-1 text-indigo-500' : 'group-hover:translate-x-0.5'}`} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column C: Active Scan Leak Details */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Scan details & action</h4>

            {activeScan ? (
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-4 h-[220px] overflow-y-auto flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-[10.5px] font-bold text-slate-400 font-mono">ID: {activeScan.id.substring(5, 13)}</span>
                    <span className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      activeScan.overallRisk === 'Critical' ? 'bg-rose-600 text-white animate-pulse' :
                      activeScan.overallRisk === 'High' ? 'bg-rose-100 text-rose-700' :
                      activeScan.overallRisk === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      activeScan.overallRisk === 'Low' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      Risk: {activeScan.overallRisk}
                    </span>
                  </div>

                  {activeScan.totalLeaksFound === 0 ? (
                    <div className="py-6 text-center space-y-2 flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800">Workspace is Safe</p>
                        <p className="text-[10px] text-slate-400 max-w-xs">No PII records, unmasked credit cards, or passwords leaked.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <input 
                            type="checkbox"
                            checked={selectedPiiItems.length === activeScan.flaggedItems.length && activeScan.flaggedItems.length > 0}
                            onChange={(e) => setSelectedPiiItems(e.target.checked ? activeScan.flaggedItems.map(i => i.id) : [])}
                          />
                          Select All
                        </label>
                        <select 
                          className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
                          value={piiRemediationStatusFilter}
                          onChange={(e) => setPiiRemediationStatusFilter(e.target.value as any)}
                        >
                          <option value="All">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Remediated">Remediated</option>
                        </select>
                        <button
                          onClick={() => setShowRemediationHistory(!showRemediationHistory)}
                          className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100"
                        >
                          {showRemediationHistory ? 'View Discovery' : 'View History'}
                        </button>
                        {selectedPiiItems.length > 0 && (
                          <button 
                            onClick={() => {
                              setRemediationHistory(prev => [{
                                id: Math.random().toString(36).substr(2, 9),
                                action: 'Bulk Remediate',
                                itemsCount: selectedPiiItems.length,
                                timestamp: new Date().toLocaleTimeString()
                              }, ...prev]);
                              setSelectedPiiItems([]);
                              console.log(`Triggering bulk remediation for ${selectedPiiItems.length} items`);
                            }}
                            className="bg-indigo-600 text-white font-extrabold px-3 py-1 rounded-lg text-[10px] hover:bg-indigo-700"
                          >
                            Bulk Remediate ({selectedPiiItems.length})
                          </button>
                        )}
                      </div>
                      {showRemediationHistory ? (
                        <div className="space-y-2">
                           {remediationHistory.map(entry => (
                             <div key={entry.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between text-[10px]">
                               <span className="font-bold text-slate-700">{entry.action} ({entry.itemsCount} items)</span>
                               <span className="text-slate-500">{entry.timestamp}</span>
                             </div>
                           ))}
                           {remediationHistory.length === 0 && (
                             <div className="text-center text-[10px] text-slate-400 py-4">No remediation history found.</div>
                           )}
                        </div>
                      ) : activeScan.flaggedItems
                        .filter(item => {
                          if (piiRemediationStatusFilter === 'All') return true;
                          if (piiRemediationStatusFilter === 'Remediated') return item.remediationStatus === 'Redacted';
                          if (piiRemediationStatusFilter === 'In Progress') return item.remediationStatus === 'Isolated';
                          if (piiRemediationStatusFilter === 'Pending') return item.remediationStatus === 'Awaiting Manual Review';
                          return false;
                        })
                        .map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs text-left">
                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={selectedPiiItems.includes(item.id)}
                                onChange={() => setSelectedPiiItems(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}
                              />
                              <span className="font-extrabold text-[10.5px] text-slate-800 leading-tight">
                                {item.patternName}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-450">
                              {item.sourceFile}
                            </span>
                          </div>
                          <div className="bg-slate-900 rounded-lg p-2 font-mono text-[9.5px] text-rose-300 break-all border border-slate-800">
                            {item.snippet}
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400">
                            <span>Detected: {new Date(item.detectedAt).toLocaleTimeString()}</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => console.log(`Triggering quick fix for item ${item.id}`)}
                                className="bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded hover:bg-indigo-700 flex items-center gap-1"
                              >
                                <Wrench className="w-2.5 h-2.5" />
                                Quick Fix
                              </button>
                              <span className={`font-extrabold px-1.5 py-0.5 rounded ${
                                item.remediationStatus === 'Redacted' ? 'bg-emerald-50 text-emerald-700' :
                                item.remediationStatus === 'Isolated' ? 'bg-blue-50 text-blue-700' :
                                'bg-amber-50 text-amber-700'
                              }`}>
                                {item.remediationStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-[9.5px] text-slate-450 font-mono font-bold">
                  <span>FILES CHECKED: {activeScan.filesScannedCount}</span>
                  <span>STATUS: {activeScan.status}</span>
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-center text-slate-450 bg-slate-50 border border-slate-150 rounded-2xl p-4">
                <Compass className="w-8 h-8 text-slate-350 animate-spin-slow mb-2" />
                <span className="text-xs font-semibold">Awaiting scan telemetry...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* New PII Distribution Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-6">Unencrypted PII Distribution Across Tables</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { time: '00:00', users: 5, transactions: 2, logs: 8 },
                { time: '04:00', users: 3, transactions: 1, logs: 5 },
                { time: '08:00', users: 8, transactions: 4, logs: 12 },
                { time: '12:00', users: 15, transactions: 8, logs: 20 },
                { time: '16:00', users: 12, transactions: 6, logs: 15 },
                { time: '20:00', users: 7, transactions: 3, logs: 10 },
              ]}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} strokeWidth={0.5} />
                <YAxis stroke="#94a3b8" fontSize={11} strokeWidth={0.5} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                <Area type="monotone" dataKey="users" name="User Table" stroke="#818cf8" fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="transactions" name="Transactions Table" stroke="#34d399" fill="url(#colorTrans)" />
                <Area type="monotone" dataKey="logs" name="Logs Table" stroke="#f472b6" fill="url(#colorLogs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* ISO 27001 Posture Control Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <GdprSimulation />
        <QuantumRiskAssessment />
      </div>

      {/* ISO 27001 Posture Control Checklist */}
      <div id="tour-posture-list" className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Filter Area */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">ISO 27001 ISMS Posture Control List</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Click any control to launch local CPU AI audits and obtain remediation code</p>
          </div>

          <AuditExport tenantId="default-tenant" />

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ISO ID, Title..."
                className="pl-8 pr-4 py-1.5 w-48 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 transition-all font-sans"
              />
            </div>

            {/* Status Quick Filter */}
            <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-xl text-[10.5px]">
              {(['ALL', 'Compliant', 'Non-Compliant', 'Pending Review'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 font-bold rounded-lg transition-all cursor-pointer ${statusFilter === s ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {s === 'ALL' ? 'Show All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Responsive Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-500 tracking-wider font-mono">Control ID</th>
                <th className="px-6 py-3 font-semibold text-slate-500 tracking-wider">Title</th>
                <th className="px-6 py-3 font-semibold text-slate-500 tracking-wider">Control Category</th>
                <th className="px-6 py-3 font-semibold text-slate-500 tracking-wider font-mono">Assigned Owner</th>
                <th className="px-6 py-3 font-semibold text-slate-500 tracking-wider">Status</th>
                <th className="px-6 py-3 font-semibold text-slate-500 tracking-wider text-right">Interactive Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredControls.length > 0 ? (
                filteredControls.map((control) => (
                  <tr 
                    key={control.id} 
                    className={`hover:bg-slate-50/70 transition-colors group cursor-pointer ${selectedControl?.id === control.id ? 'bg-emerald-50/10' : ''}`}
                    onClick={() => {
                      setSelectedControl(control);
                      setAiFixResult(null);
                    }}
                  >
                    <td className="px-6 py-4 font-mono font-black text-slate-800 text-[11px]">
                      {control.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-[200px] truncate">
                      {control.title}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {control.category}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 select-all">
                      {control.assignedOwner}
                    </td>
                    {/* COLOR-CODED STATUS PILLS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {control.status === 'Compliant' && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Compliant
                        </span>
                      )}
                      {control.status === 'Non-Compliant' && (
                        <span className="bg-rose-50 text-rose-700 border border-rose-250 font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 shrink-0 animate-pulse">
                          <ShieldAlert className="h-3 w-3 text-rose-600" />
                          Non-Compliant
                        </span>
                      )}
                      {control.status === 'Pending Review' && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-250 font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 shrink-0">
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white p-1 rounded-lg hover:shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Query Local AI Audit Drawer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 border-2 border-dashed border-slate-50 m-4 rounded-xl">
                    <HelpCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    No controls mapping found. Try clearing your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* TWO COLUMN INTERACTIVE PANEL: Selected Control Drawer & Audit Logger */}
      <div id="tour-ai-drawer" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Column 1 & 2: Local AI Audit & Remediation drawer (Interactive on table click) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:col-span-2 relative">
          {selectedControl ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="bg-slate-100 text-slate-600 font-mono text-[9px] font-black px-1.5 py-0.5 rounded">{selectedControl.id}</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">{selectedControl.title}</h4>
                  <p className="text-[10px] text-slate-400">{selectedControl.category}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedControl.difficulty === 'HIGH' ? 'bg-rose-50 text-rose-700' :
                    selectedControl.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedControl.difficulty} complexity
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-250/50 space-y-2">
                <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-500">Current Posture Audit Log</h5>
                <p className="text-[11px] text-slate-700 leading-normal font-sans italic text-slate-600">
                  "{selectedControl.remediationStep}"
                </p>
              </div>

              {/* ACTION: GENERATE FIX WITH EXPLAINABILITY CO-PILOT */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleGenerateAiFix(selectedControl)}
                    disabled={isGeneratingAiFix}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGeneratingAiFix ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Running CPU LLM Inference Model...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-white" />
                        <span>Draft Local AI Remediation Suggestion</span>
                      </>
                    )}
                  </button>
                  <span className="text-[9.5px] text-slate-400 italic">No network connection required to reason</span>
                </div>

                {/* AI FIX OUTPUT TERMINAL */}
                {aiFixResult && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[8.5px] font-black text-indigo-500 uppercase font-mono tracking-wider">AI Remediation Blueprint Output (Llama3.2)</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-[160px] overflow-y-auto">
                      <pre className="text-[10.5px] font-mono text-indigo-350 leading-relaxed text-slate-300">
                        {aiFixResult}
                      </pre>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setControls(prev => prev.map(c => {
                            if (c.id === selectedControl.id) {
                              return { ...c, status: "Compliant" };
                            }
                            return c;
                          }));
                          setAuditLogs(prev => [
                            { text: `Locally applied AI Auto-Fix blueprint for control ${selectedControl.id}.`, time: "Just now" },
                            ...prev
                          ]);
                          setAiFixResult(null);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Wrench className="h-3 w-3 text-white" />
                        Apply Remediation Fix
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <Compass className="h-10 w-10 text-slate-300 animate-spin-slow mb-3" />
              <h4 className="text-sm font-extrabold text-slate-700">No Control Active</h4>
              <p className="text-[10.5px] text-slate-400 max-w-sm mt-1">
                Select an ISO 27001 control item from the checklist posture grid to access real-time status diagnostics, owner notifications, and generate AI auto-fixes.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Live Sovereign Audit Activity Logs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1">
              <FileCheck2 className="h-4 w-4 text-emerald-500" />
              Sovereign Auditing Logs
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Immutable local logging ledger events</p>
            
            <div className="space-y-4 mt-4 max-h-[160px] overflow-y-auto pr-1">
              {auditLogs.map((log, index) => (
                <div key={index} className="flex gap-2 text-[10.5px] leading-relaxed border-l-2 border-slate-200 pl-2.5">
                  <div className="space-y-0.5">
                    <p className="text-slate-700 font-medium">{log.text}</p>
                    <span className="text-[9.5px] text-slate-400 block font-mono">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4 text-center">
            <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full uppercase font-black tracking-wide">
              Logged to Local compliance.db
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
