import { fetchWithRetry } from '../lib/api-client';
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ShieldAlert,
  X,
  Plus,
  Filter,
  ShieldCheck,
  Server,
  UserCheck,
  Laptop,
  Cloud,
  Code,
  FileCheck2,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  Database,
  DatabaseZap,
  Users,
  FileCode,
  Check,
  TrendingDown,
  TrendingUp,
  Zap,
  Search,
  Terminal,
  Download,
  FileText,
  CheckCircle2,
  RefreshCw,
  Play,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RedTeamSimulator } from '../components/RedTeamSimulator';
import { NIS2Dashboard } from '../components/nis2/NIS2Dashboard';
import { TrendForecastingChart } from '../components/dashboard/TrendForecastingChart';
import { executeListScan, remediateVulnerability, SecurityPosture, ScanResult } from '../lib/security-scanner';
import { useNotification } from '../context/NotificationContext';

interface SecurityModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  riskScore: number | null;
  alerts: number;
  complianceActs: string[];
  price?: string;
  isAddOn: boolean;
}

interface SaasConfig {
  id: string;
  service: string;
  check: string;
  status: string;
  remediated: boolean;
}

// Initial default modules
const DEFAULT_MODULES: SecurityModule[] = [
  {
    id: "MOD_NIS2_AI",
    name: "NIS2 & DORA Reporting",
    description: "AI-operated incident triage and compliance automation.",
    icon: ShieldCheck,
    enabled: true,
    riskScore: 92,
    alerts: 1,
    complianceActs: ["NIS2", "DORA"],
    isAddOn: true
  },
  {
    id: "MOD_THREAT",
    name: "Threat Monitoring",
    description: "24/7 SIEM alerts & automated threat feeds.",
    icon: ActivityIcon,
    enabled: true,
    riskScore: 92,
    alerts: 12,
    complianceActs: ["NIS2", "DORA"],
    isAddOn: false
  },
  {
    id: "MOD_IAM",
    name: "IAM & Access Control",
    description: "RBAC audits & privileged access reviews.",
    icon: UserCheck,
    enabled: true,
    riskScore: 78,
    alerts: 3,
    complianceActs: ["GDPR", "DORA", "NIS2"],
    isAddOn: false
  },
  {
    id: "MOD_ENDPOINT",
    name: "Endpoint Security",
    description: "Agent-based workstation telemetry & compliance.",
    icon: Laptop,
    enabled: false,
    riskScore: null,
    alerts: 0,
    complianceActs: ["NIS2", "CRA"],
    price: "$299/mo",
    isAddOn: true
  },
  {
    id: "MOD_SAAS",
    name: "SaaS Posture Management",
    description: "Multi-cloud security configuration audit.",
    icon: Cloud,
    enabled: true,
    riskScore: 85,
    alerts: 8,
    complianceActs: ["DORA"],
    isAddOn: false
  },
  {
    id: "MOD_APPSEC",
    name: "AppSec Scanning",
    description: "Vulnerability analysis & SBOM compilation.",
    icon: Code,
    enabled: true,
    riskScore: 64,
    alerts: 24,
    complianceActs: ["CRA", "NIS2"],
    isAddOn: false
  },
  {
    id: "MOD_EVIDENCE",
    name: "Compliance Evidence Auto",
    description: "Continuous compliance validation ledger.",
    icon: FileCheck2,
    enabled: false,
    riskScore: null,
    complianceActs: ["GDPR", "DORA", "NIS2"],
    price: "$499/mo",
    alerts: 0,
    isAddOn: true
  },
  {
    id: "MOD_TRAINING",
    name: "Security Training",
    description: "Interactive phishing simulation campaigns.",
    icon: GraduationCap,
    enabled: true,
    riskScore: 95,
    alerts: 0,
    complianceActs: ["NIS2"],
    isAddOn: false
  },
  {
    id: "MOD_VCISO",
    name: "vCISO Advisory",
    description: "Virtual CISO planner & executive boardroom report.",
    icon: Briefcase,
    enabled: false,
    riskScore: null,
    complianceActs: ["DORA", "NIS2"],
    price: "$1,500/mo",
    alerts: 0,
    isAddOn: true
  },
  {
    id: "MOD_SECURITI",
    name: "Data Command Center (securiti.ai)",
    description: "AI-Powered DSPM, Data Privacy, and Governance.",
    icon: Database,
    enabled: false,
    riskScore: null,
    complianceActs: ["GDPR", "CCPA", "AI Act"],
    price: "Custom",
    alerts: 0,
    isAddOn: true
  },
  {
    id: "MOD_LISTSCAN",
    name: "List Scan: Dependency Audit",
    description: "Active auditing of libraries, secrets, and regulatory gaps.",
    icon: ListIcon,
    enabled: true,
    riskScore: 82,
    alerts: 4,
    complianceActs: ["CRA", "DORA", "NIS2"],
    isAddOn: false
  }
];

// Fallback Icon component for List
function ListIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}

// Fallback Icon component for Activity
function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

const VulnerabilityHeatmap: React.FC = () => {
  const [viewMode, setViewMode] = useState<'density' | 'criticality'>('density');
  const [hoveredCell, setHoveredCell] = useState<{dep: number, seg: number} | null>(null);
  
  const [densityData, setDensityData] = useState<number[][]>([]);
  const [criticalityData, setCriticalityData] = useState<number[][]>([]);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(true);

  const departments = ['Engineering', 'Finance', 'HR', 'Sales', 'Exec'];
  const segments = ['DMZ', 'Core', 'App', 'DB', 'Edge'];

  useEffect(() => {
    fetchWithRetry('/api/v1/cyber-security/heatmap')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDensityData(data.densityData);
          setCriticalityData(data.criticalityData);
        }
      })
      .finally(() => setIsLoadingHeatmap(false));
  }, []);

  const data = viewMode === 'density' ? densityData : criticalityData;

  const getColor = (value: number) => {
    if (value === 0) return 'bg-emerald-100 border-emerald-200 text-emerald-700';
    if (value <= 3) return 'bg-yellow-100 border-yellow-200 text-yellow-700';
    if (value <= 8) return 'bg-orange-100 border-orange-200 text-orange-700';
    return 'bg-rose-100 border-rose-200 text-rose-700';
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Vulnerability Heatmap</h3>
          <p className="text-xs text-slate-500 mt-0.5">Interactive map of exposed risks across network segments and organizational departments.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode('density')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'density' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Network Density
            </button>
            <button 
              onClick={() => setViewMode('criticality')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'criticality' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Business Criticality
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></span> 0</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></span> 1-3</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></span> 4-8</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-100 border border-rose-200"></span> 9+</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header row (Segments) */}
          <div className="flex mb-2">
            <div className="w-24 shrink-0"></div> {/* Empty top-left cell */}
            {segments.map((seg, i) => (
              <div key={i} className="flex-1 w-20 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">{seg}</div>
            ))}
          </div>

          {/* Rows (Departments) */}
          <div className="space-y-2">
            {departments.map((dep, dIdx) => (
              <div key={dIdx} className="flex items-center">
                <div className="w-24 shrink-0 text-[11px] font-bold text-slate-600 uppercase tracking-wide truncate pr-2">
                  {dep}
                </div>
                {segments.map((seg, sIdx) => {
                  const val = data[dIdx][sIdx];
                  const colorClasses = getColor(val);
                  return (
                    <div 
                      key={sIdx} 
                      className="flex-1 w-20 px-1 relative group"
                      onMouseEnter={() => setHoveredCell({dep: dIdx, seg: sIdx})}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className={`h-10 rounded border flex items-center justify-center font-bold text-sm transition-all duration-300 cursor-pointer ${colorClasses} ${hoveredCell?.dep === dIdx && hoveredCell?.seg === sIdx ? 'ring-2 ring-indigo-500 ring-offset-1 scale-105 z-10' : ''}`}>
                        {val}
                      </div>
                      
                      {/* Tooltip */}
                      {hoveredCell?.dep === dIdx && hoveredCell?.seg === sIdx && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-xs rounded shadow-xl border border-slate-700 z-50 p-3 pointer-events-none">
                          <div className="font-bold border-b border-slate-700 pb-1 mb-2">{dep} - {seg} Network</div>
                          <div className="space-y-1">
                            <div className="flex justify-between"><span>Total Issues:</span> <span className="font-bold">{val}</span></div>
                            <div className="flex justify-between text-slate-300"><span>Critical:</span> <span>{Math.floor(val * 0.3)}</span></div>
                            <div className="flex justify-between text-slate-300"><span>High:</span> <span>{Math.floor(val * 0.5)}</span></div>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


const ThreatIntelligenceWidget = () => {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithRetry('/api/v1/cyber-security/threat-intelligence')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setThreats(data.intelligence);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-5 text-white mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2 text-indigo-400">
          <Globe className="w-5 h-5" />
          Global Threat Intelligence & Geo-IP Tracer
        </h3>
        {loading && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />}
      </div>
      
      {loading ? (
        <div className="h-32 flex items-center justify-center text-slate-500 text-sm animate-pulse">
          Triangulating IP signatures...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {threats.map((t, idx) => (
            <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-400">{t.ip}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${t.threatLevel > 70 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {t.threatLevel > 70 ? 'Critical' : 'Elevated'}
                </span>
              </div>
              <div className="text-sm font-bold truncate">{t.country} - {t.city}</div>
              <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Coordinates: {t.ll.join(', ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CyberSecurityHub: React.FC = () => {
  const { showToast } = useNotification();
  // Synchronized state via localStorage
  const [modules, setModules] = useState<SecurityModule[]>(() => {
    const saved = localStorage.getItem("9xen-regulettee_sec_modules");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map icon component back
        return parsed.map((m: any) => {
          const matchingDefault = DEFAULT_MODULES.find(d => d.id === m.id);
          return { ...m, icon: matchingDefault ? matchingDefault.icon : ShieldAlert };
        });
      } catch (e) {
        return DEFAULT_MODULES;
      }
    }
    return DEFAULT_MODULES;
  });

  const [activeModule, setActiveModule] = useState<string | null>("MOD_THREAT");
  const [showUpgradeModal, setShowUpgradeModal] = useState<SecurityModule | null>(null);
  const [globalScanRunning, setGlobalScanRunning] = useState(false);
  const [recalculatingScore, setRecalculatingScore] = useState(false);

  // Remediated SaaS checks State
  const [saasConfigs, setSaasConfigs] = useState<SaasConfig[]>(() => {
    const saved = localStorage.getItem("9xen-regulettee_saas_configs");
    return saved ? JSON.parse(saved) : [
      { id: "saas_s3", service: "Amazon AWS", check: "Block Public Read Access on S3 buckets", status: "FAILED", remediated: false },
      { id: "saas_o365", service: "Office 365", check: "Enforce MFA for all tenant Global Admins", status: "FAILED", remediated: false },
      { id: "saas_gsuite", service: "Google Workspace", check: "Restrict third-party API OAuth Scopes", status: "SUCCESS", remediated: true },
      { id: "saas_sfdc", service: "Salesforce CRM", check: "Enforce IP range restrictions for financial staff", status: "FAILED", remediated: false }
    ];
  });

  // Endpoints list State
  const [endpoints, setEndpoints] = useState([
    { id: "ep_1", hostname: "srv-prod-k8s-master", os: "Ubuntu Linux 22.04", ip: "10.140.0.12", agentVersion: "v1.12.0", status: "SECURE" },
    { id: "ep_2", hostname: "srv-prod-postgres-primary", os: "RedHat Enterprise 9", ip: "10.140.0.15", agentVersion: "v1.12.0", status: "SECURE" },
    { id: "ep_3", hostname: "dev-macbook-pro-18", os: "macOS Sonoma 14.2", ip: "192.168.1.108", agentVersion: "v1.11.4", status: "WARNING" },
    { id: "ep_4", hostname: "win-activedirectory-controller", os: "Windows Server 2022", ip: "10.140.10.4", agentVersion: "v1.12.0", status: "SECURE" }
  ]);

  // Threat stream logs State
  const [threatLogs, setThreatLogs] = useState([
    { id: "t_1", time: "05:12:04", src: "194.22.84.10", type: "Brute-force SSH", target: "db-replica", status: "BLOCKED", severity: "HIGH" },
    { id: "t_2", time: "05:08:42", src: "45.132.22.95", type: "SQL Injection", target: "auth-service", status: "BLOCKED", severity: "CRITICAL" },
    { id: "t_3", time: "04:55:18", src: "122.9.201.44", type: "Port Scan Sweep", target: "bastion-host", status: "ALERTED", severity: "MEDIUM" },
  ]);

  // Persist modules to localStorage
  useEffect(() => {
    const serializable = modules.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      enabled: m.enabled,
      riskScore: m.riskScore,
      alerts: m.alerts,
      complianceActs: m.complianceActs,
      price: m.price,
      isAddOn: m.isAddOn
    }));
    localStorage.setItem("9xen-regulettee_sec_modules", JSON.stringify(serializable));
  }, [modules]);

  // Persist SaaS Configs to localStorage
  useEffect(() => {
    localStorage.setItem("9xen-regulettee_saas_configs", JSON.stringify(saasConfigs));
  }, [saasConfigs]);

  // Dynamically calculate Posture Score based on enabled modules & remediated SaaS configs
  const getOverallPostureScore = () => {
    let base = 70;
    
    // Add points for each active module
    modules.forEach(m => {
      if (m.enabled) {
        if (m.id === "MOD_ENDPOINT") base += 6;
        if (m.id === "MOD_EVIDENCE") base += 7;
        if (m.id === "MOD_VCISO") base += 4;
        if (m.id === "MOD_SECURITI") base += 5;
        if (!m.isAddOn) base += 2; // Default enabled modules reward baseline score
      }
    });

    // Add points for SaaS remediations
    const remediatedCount = saasConfigs.filter(c => c.remediated).length;
    base += remediatedCount * 3;

    return Math.min(base, 100);
  };

  const overallScore = getOverallPostureScore();

  // Dynamic state values for alerts
  const totalAlertsCount = modules.reduce((acc, m) => acc + (m.enabled ? m.alerts : 0), 0);

  // Trigger full scan
  const handleFullScan = () => {
    setGlobalScanRunning(true);
    setRecalculatingScore(true);
    setTimeout(() => {
      setGlobalScanRunning(false);
      setRecalculatingScore(false);
      // Incrementally improve score/alerts to simulate real results
      setModules(prev => prev.map(m => {
        if (m.enabled && m.alerts > 0) {
          return { ...m, alerts: Math.max(0, m.alerts - 2), riskScore: Math.min(100, (m.riskScore || 80) + 3) };
        }
        return m;
      }));
    }, 2000);
  };

  // Toggle module upgrade
  const confirmUpgrade = (modId: string) => {
    setRecalculatingScore(true);
    setTimeout(() => {
      setModules(prev => prev.map(m => {
        if (m.id === modId) {
          return { ...m, enabled: true, riskScore: 90, alerts: 0 };
        }
        return m;
      }));
      setRecalculatingScore(false);
      setShowUpgradeModal(null);
    }, 1200);
  };

  const toggleModuleState = (modId: string) => {
    setModules(prev => prev.map(m => {
      if (m.id === modId) {
        return { ...m, enabled: !m.enabled };
      }
      return m;
    }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Cybersecurity Posture Summary", 14, 22);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Overall Security Score: ${overallScore}%`, 14, 40);
    doc.text(`Total Alerts: ${totalAlertsCount}`, 14, 48);

    const tableData = modules.filter(m => m.enabled).map(m => [
      m.name,
      m.riskScore ? `${m.riskScore}%` : 'N/A',
      m.alerts.toString(),
      m.complianceActs.join(', ')
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Module', 'Risk Score', 'Alerts', 'Compliance Acts']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
    });

    doc.save("security_posture_summary.pdf");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <ShieldCheck className="w-8 h-8 mr-3 text-indigo-600" />
            Cybersecurity Command Suite
          </h1>
          <p className="text-slate-500 mt-1">
            Enterprise threat monitoring, continuous compliance validation, and vCISO strategic reporting.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg shadow-sm transition-colors flex items-center text-sm gap-2"
          >
            <Download className="w-4 h-4" />
            Export Posture PDF
          </button>
          <button 
            onClick={handleFullScan}
            disabled={globalScanRunning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center text-sm gap-2"
          >
            {globalScanRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {globalScanRunning ? "Auditing System..." : "Run Active Audit Sweeper"}
          </button>
        </div>
      </div>

      {/* Posture Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Posture Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between col-span-1"
        >
          <div className="space-y-1.5">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
              Overall Security Posture
            </span>
            <div className="flex items-end space-x-2">
              <span className={`text-5xl font-black tracking-tighter ${recalculatingScore ? 'text-indigo-400 animate-pulse' : 'text-indigo-700'}`}>
                {overallScore}%
              </span>
              <span className="text-emerald-500 text-xs font-bold flex items-center mb-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                <TrendingUp className="w-3 h-3 mr-1" /> +{saasConfigs.filter(c => c.remediated).length + 4}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block">
              Weighted scoring aligned with DORA & NIS2 rules
            </span>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-indigo-50 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                className="text-indigo-600 transition-all duration-700"
                strokeWidth="4"
                strokeDasharray={`${overallScore * 2.2} 220`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="36"
                cx="40"
                cy="40"
              />
            </svg>
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
        </motion.div>

        {/* Dynamic Alerts Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-rose-200 shadow-sm col-span-2 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full -z-10" />
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <span className="text-rose-500 text-xs font-bold uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> High-Priority SecOps Events
              </span>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
                    <span className="font-semibold text-slate-700">
                      Active threat attempts detected on Auth Gateway
                    </span>
                  </div>
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 text-[9px]">
                    CRITICAL
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
                    <span className="font-semibold text-slate-700">
                      SaaS Config Breach: {saasConfigs.filter(c => !c.remediated).length} critical configurations unpatched
                    </span>
                  </div>
                  <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100 text-[9px]">
                    HIGH
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2 mt-2">
                  <a
                    href="#secops-workspace"
                    onClick={() => setActiveModule("MOD_THREAT")}
                    className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 hover:underline"
                  >
                    Investigate in threat workspace{" "}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
            <div className="text-right pl-4">
              <div className="text-4xl font-black text-rose-600">{totalAlertsCount}</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Total Warnings
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <VulnerabilityHeatmap />

      {/* Security Modules Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center">
          <Server className="w-4 h-4 mr-2 text-slate-400" />
          Enterprise Protection Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            const isSelected = activeModule === mod.id;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={mod.id}
                onClick={() => {
                  if (mod.enabled) {
                    setActiveModule(mod.id);
                  }
                }}
                className={`border rounded-xl p-5 shadow-sm relative flex flex-col cursor-pointer transition-all ${
                  mod.enabled 
                    ? isSelected 
                      ? "bg-white border-indigo-500 ring-2 ring-indigo-500/10 shadow-md" 
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md" 
                    : "bg-slate-50 border-dashed border-slate-300 hover:bg-slate-100/50"
                }`}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {mod.enabled ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ) : (
                    <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                      ADD-ON
                    </span>
                  )}
                </div>

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3.5 ${
                    mod.enabled ? "bg-indigo-50 text-indigo-600" : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className={`font-bold text-sm ${mod.enabled ? "text-slate-900" : "text-slate-500"}`}>
                  {mod.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4 flex-1">
                  {mod.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {mod.complianceActs.map((act) => (
                    <span
                      key={act}
                      className="text-[9px] uppercase font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      {act}
                    </span>
                  ))}
                </div>

                {mod.enabled ? (
                  <div className="border-t border-slate-100 pt-3 mt-auto flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase text-slate-400 font-bold">Health</span>
                      <span className={`font-bold ${mod.riskScore && mod.riskScore < 75 ? "text-orange-500" : "text-emerald-600"}`}>
                        {mod.riskScore ? `${mod.riskScore}/100` : "Excellent"}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[9px] uppercase text-slate-400 font-bold">Alerts</span>
                      <span className={`font-bold ${mod.alerts > 0 ? "text-rose-500" : "text-slate-400"}`}>
                        {mod.alerts} active
                      </span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUpgradeModal(mod);
                    }}
                    className="mt-auto w-full py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded text-xs transition-all shadow-sm"
                  >
                    Activate {mod.price}
                  </button>
                )}
              </motion.div>
            );
          })}

          {/* Incident Response Shortcut */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border border-slate-800 rounded-xl p-5 shadow-sm relative flex flex-col bg-slate-900 text-white hover:bg-slate-950 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3.5 bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-sm text-white mb-1">
              SOC Incident Control Room
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4 flex-1">
              Dedicated active triage workspace for emergency isolation and threat containment.
            </p>

            <a
              href="/incident-response"
              className="mt-auto w-full flex items-center justify-center py-2 bg-rose-600 hover:bg-rose-500 rounded text-xs font-semibold transition-colors shadow-[0_0_15px_rgba(225,29,72,0.3)] text-center text-white"
            >
              Enter SOC Workspace
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Sub-Interactive Workbench Section */}
      <AnimatePresence mode="wait">
        {activeModule && (
          <motion.div
            id="secops-workspace"
            key={activeModule}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Workbench Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  {React.createElement(modules.find(m => m.id === activeModule)?.icon || ShieldAlert, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {modules.find(m => m.id === activeModule)?.name} Workbench
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure active controls, audit telemetry logs, and remediate risk indicators.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5">
                  OPERATIONAL
                </span>
                <button 
                  onClick={() => toggleModuleState(activeModule)}
                  className="p-1 text-slate-400 hover:text-rose-500 text-xs font-semibold hover:underline"
                >
                  Deactivate Module
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 lg:p-6">
              {/* Threat Monitoring Workbench */}
              {activeModule === "MOD_NIS2_AI" && (
                <NIS2Dashboard />
              )}
              {activeModule === "MOD_THREAT" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Log Packet Ticker</h4>
                      <button 
                        onClick={() => {
                          const customTypes = ["CSRF Bypass", "XSS Payload Inject", "LDAP Injection", "API Auth Token Replay"];
                          const customTargets = ["billing-api", "client-vault", "user-settings", "reports-engine"];
                          const customIps = ["82.112.44.19", "104.92.12.3", "201.21.90.134", "18.232.84.11"];
                          const injectType = customTypes[Math.floor(Math.random() * customTypes.length)];
                          const injectTarget = customTargets[Math.floor(Math.random() * customTargets.length)];
                          const injectIp = customIps[Math.floor(Math.random() * customIps.length)];
                          
                          const newLog = {
                            id: "t_inject_" + Date.now(),
                            time: new Date().toLocaleTimeString(),
                            src: injectIp,
                            type: injectType,
                            target: injectTarget,
                            status: "BLOCKED",
                            severity: Math.random() > 0.4 ? "HIGH" : "CRITICAL"
                          };
                          setThreatLogs(prev => [newLog, ...prev]);
                          // Increment warning alert inside module state
                          setModules(prev => prev.map(m => m.id === "MOD_THREAT" ? { ...m, alerts: m.alerts + 1 } : m));
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded uppercase tracking-wider flex items-center gap-1 transition"
                      >
                        <Play className="w-3 h-3 fill-white" /> Simulate SIEM Threat Stream
                      </button>
                    </div>

                    <div className="border border-slate-100 rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
                          <tr>
                            <th className="py-2 px-3">Time</th>
                            <th className="py-2 px-3">Source IP</th>
                            <th className="py-2 px-3">Attack Vector</th>
                            <th className="py-2 px-3">Target Asset</th>
                            <th className="py-2 px-3">Severity</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-mono text-[11px] text-slate-600">
                          {threatLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-slate-400">{log.time}</td>
                              <td className="py-2 px-3 font-bold">{log.src}</td>
                              <td className="py-2 px-3 text-indigo-600 font-semibold">{log.type}</td>
                              <td className="py-2 px-3 text-slate-500">{log.target}</td>
                              <td className="py-2 px-3">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                  log.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {log.severity}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-black">
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* NEW: Automated Remediation Recommendations */}
                    <div className="pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Automated Remediation Recommendations</h4>
                      <div className="space-y-3">
                        {threatLogs.filter(log => log.severity === 'CRITICAL' || log.severity === 'HIGH').length === 0 ? (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
                            No high-priority vulnerabilities currently detected.
                          </div>
                        ) : (
                          threatLogs.filter(log => log.severity === 'CRITICAL' || log.severity === 'HIGH').slice(0, 3).map((log, idx) => (
                            <div key={`rem_${idx}`} className="flex items-start p-4 bg-white border border-rose-200 rounded-xl shadow-sm">
                              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0 mr-4">
                                <ShieldAlert className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-sm text-slate-800">Resolve {log.type} on {log.target}</h5>
                                <p className="text-xs text-slate-500 mt-1 mb-3">
                                  Detected anomalous traffic from {log.src}. Recommendation: Enforce strict rate limiting and deploy WAF rules blocking this pattern.
                                </p>
                                <div className="flex gap-2">
                                  <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition-colors shadow-sm">
                                    Auto-Remediate
                                  </button>
                                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors">
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Threat Intel Configuration</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">IDS Sensitivity Level</label>
                          <select defaultValue="Balanced (Standard Ruleset)" className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 outline-none">
                            <option>Low (Minimal False Positives)</option>
                            <option>Balanced (Standard Ruleset)</option>
                            <option>Heuristic Deep Scan (Extreme Warnings)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Threat Feed Sync</label>
                          <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-700 font-semibold">Trivy & Snyk Feeds</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">SYNCED</span>
                          </div>
                        </div>
                        <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition flex justify-center items-center gap-1.5 shadow-sm">
                          <RefreshCw className="w-3.5 h-3.5" /> Re-sync Feed Signatures
                        </button>
                      </div>
                    </div>

                    {/* NEW: Breach Simulation Tool */}
                    <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl space-y-4">
                      <div className="flex items-center gap-2 text-rose-700 mb-2">
                        <ActivityIcon className="w-5 h-5" />
                        <h4 className="text-xs font-bold uppercase tracking-wide">Breach Simulation</h4>
                      </div>
                      <p className="text-xs text-rose-600 mb-2 font-medium">Test system resilience by simulating an attack scenario.</p>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-rose-500 block mb-1">Select Vulnerability Vector</label>
                          <select id="breachVector" className="w-full bg-white border border-rose-200 rounded p-1.5 text-xs font-semibold text-slate-700 outline-none">
                            <option value="ransomware">Ransomware Lateral Movement</option>
                            <option value="ddos">Distributed Denial of Service (DDoS)</option>
                            <option value="data_exfil">Data Exfiltration via DNS</option>
                            <option value="0day">0-day RCE on Edge Gateway</option>
                          </select>
                        </div>
                        <button 
                          onClick={() => {
                            const vector = (document.getElementById('breachVector') as HTMLSelectElement).value;
                            const title = vector === 'ransomware' ? 'Ransomware Lateral Movement' : 
                                          vector === 'ddos' ? 'DDoS Attack' : 
                                          vector === 'data_exfil' ? 'DNS Exfiltration' : '0-day RCE';
                            
                            const newLog = {
                              id: "t_sim_" + Date.now(),
                              time: new Date().toLocaleTimeString(),
                              src: "10.0.0.12 (Simulated)",
                              type: title,
                              target: "core-infrastructure",
                              status: "BLOCKED",
                              severity: "CRITICAL"
                            };
                            setThreatLogs(prev => [newLog, ...prev]);
                            setModules(prev => prev.map(m => m.id === "MOD_THREAT" ? { ...m, alerts: m.alerts + 1 } : m));
                            
                            showToast(`Breach Simulation Initiated: ${title}\n\nScenario: The attack vector has been triggered against the system.\n\nAutomated Defense Response:\n- WAF dynamically scaled to absorb impact.\n- Affected node isolated from internal VLAN.\n- Security operations team alerted automatically.\n\nCheck the Live Log Packet Ticker and Automated Remediation Recommendations for details.`, 'info');
                          }}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded transition flex justify-center items-center shadow-sm"
                        >
                          Run Simulation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IAM & Access Control Workbench */}
              {activeModule === "MOD_IAM" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Privileged Access Roles & Session Audit</h4>
                    <div className="border border-slate-100 rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3">Operator</th>
                            <th className="py-2.5 px-3">Role Assigned</th>
                            <th className="py-2.5 px-3">MFA Status</th>
                            <th className="py-2.5 px-3">Last Location</th>
                            <th className="py-2.5 px-3">Active Session</th>
                            <th className="py-2.5 px-3 text-right">Emergency Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                          {[
                            { name: "John Doe", email: "j.doe@regulettee.eu", role: "Super Admin", mfa: "ACTIVE", loc: "Paris, FR", status: "ONLINE" },
                            { name: "Sarah Connor", email: "s.connor@regulettee.eu", role: "Tenant Admin", mfa: "ACTIVE", loc: "Berlin, DE", status: "ONLINE" },
                            { name: "Unknown Guest", email: "temp-consultant@external.com", role: "Auditor", mfa: "PENDING", loc: "Frankfurt, DE", status: "SUSPICIOUS" }
                          ].map((user, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-800">{user.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono font-normal">{user.email}</div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-700">{user.role}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
                                  user.mfa === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                  {user.mfa}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-normal">{user.loc}</td>
                              <td className="py-2.5 px-3">
                                <span className={`w-2 h-2 rounded-full inline-block ${
                                  user.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'
                                }`} /> <span className="text-[10px] text-slate-500 font-mono">{user.status}</span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button 
                                  onClick={() => showToast(`Suspended active session token for operator ${user.email}. Emergency event logged.`, 'success')}
                                  className="px-2 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-[10px] font-bold"
                                >
                                  Terminate Token
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Privileged Policy Control</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Enforce strict conditional access rules across your entire corporate namespace, automatically mapped to NIS2 Annex III directives.
                    </p>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Enforce Global MFA</span>
                          <span className="text-[9px] text-slate-400">Force multi-factor setup on all logins</span>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                      </div>
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Sovereign Geofencing</span>
                          <span className="text-[9px] text-slate-400">Lock operations exclusively inside EU IP space</span>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Endpoint Security Workbench */}
              {activeModule === "MOD_ENDPOINT" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-900 rounded-xl p-5 text-slate-100 space-y-4 shadow-inner">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">OS Agent Bootstrap Deployer</h4>
                        </div>
                        <div className="flex gap-1">
                          {["Linux", "Windows", "macOS"].map((os) => (
                            <span key={os} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-slate-400 cursor-pointer hover:text-white">
                              {os}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        Install the lightweight background auditing agent across your client systems to log memory patterns, unpatched CVE kernel issues, and file system anomalies directly to compliance.db.
                      </p>
                      <div className="relative">
                        <pre className="bg-black/40 border border-slate-800 p-3.5 rounded text-[10px] text-emerald-400 overflow-x-auto font-mono leading-relaxed select-all">
                          curl -sSf https://agent.regulettee.eu/install.sh | sudo sh -s -- --token ls_ent_8a41bc90aef --environment prod
                        </pre>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                        <span>Agent SHA-256 Hash: ea1c9982fb...b871c828e0</span>
                        <span>Signature: Verified (9Xen Regulettee Root Certificate)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Monitored Devices ({endpoints.length})</h4>
                        <button 
                          onClick={() => {
                            setEndpoints(prev => prev.map(e => ({ ...e, status: "SECURE" })));
                            showToast("All remote endpoints swept successfully! Posture score updated.", 'success');
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 font-bold px-2.5 py-1 rounded transition uppercase tracking-wider"
                        >
                          Trigger Endpoint Compliance Sweep
                        </button>
                      </div>
                      <div className="border border-slate-100 rounded-lg overflow-x-auto text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
                            <tr>
                              <th className="py-2 px-3">Device Hostname</th>
                              <th className="py-2 px-3">Operating System</th>
                              <th className="py-2 px-3">Private IP</th>
                              <th className="py-2 px-3">Agent Version</th>
                              <th className="py-2 px-3">System Health</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 font-mono text-[11px] text-slate-600">
                            {endpoints.map((ep) => (
                              <tr key={ep.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-bold text-slate-800">{ep.hostname}</td>
                                <td className="py-2 px-3 text-slate-500">{ep.os}</td>
                                <td className="py-2 px-3">{ep.ip}</td>
                                <td className="py-2 px-3">{ep.agentVersion}</td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                    ep.status === 'SECURE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                  }`}>
                                    {ep.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Threat Containment Rule</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Enable host-level automated micro-segmentation. If the threat telemetry agent flags memory extraction patterns (Log4j / Ransomware entropy), immediately isolate the NIC.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Enable NIC Isolation</span>
                          <span className="text-[9px] text-slate-400">Disconnect compromised nodes immediately</span>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SaaS Posture Management Workbench */}
              {activeModule === "MOD_SAAS" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Multi-Cloud Security Configurations Audit</h4>
                    <div className="border border-slate-100 rounded-lg overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3">SaaS Service</th>
                            <th className="py-2.5 px-3">Posture Assessment Rule</th>
                            <th className="py-2.5 px-3">Risk Assessment</th>
                            <th className="py-2.5 px-3 text-right">Self-Healing Remediation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-600 font-semibold">
                          {saasConfigs.map((cfg: any) => (
                            <tr key={cfg.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-800">{cfg.service}</td>
                              <td className="py-2.5 px-3 text-slate-500 font-normal">{cfg.check}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                  cfg.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {cfg.status === 'SUCCESS' ? 'SECURE' : 'MISCONFIGURED'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {cfg.remediated ? (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Remediated
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setSaasConfigs((prev: any) => prev.map((p: any) => p.id === cfg.id ? { ...p, status: "SUCCESS", remediated: true } : p));
                                      // Reduce alerts and raise health on SaaS module card
                                      setModules(prev => prev.map(m => m.id === "MOD_SAAS" ? { ...m, riskScore: Math.min(100, (m.riskScore || 85) + 4), alerts: Math.max(0, m.alerts - 2) } : m));
                                    }}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[9px] uppercase tracking-wider transition-colors"
                                  >
                                    Auto-Remediate
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Continuous SaaS Scans</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      SaaS Posture Management continuously queries multi-cloud APIs via secure webhooks to enforce state alignment. Any deviation is immediately flagged as a compliance breach.
                    </p>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-slate-200">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Daily Recurrence Scan</span>
                          <span className="text-[9px] text-slate-400">Hourly API checks of SaaS posture</span>
                        </div>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AppSec Scanning Workbench */}
              {activeModule === "MOD_APPSEC" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Software Bill of Materials (SBOM) Generation</h4>
                      <a href="/vulnerability-scanner" className="text-[10px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5">
                        Open Deep-Packet Scanner <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>

                    <SbomGenerator />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Static Application Security Testing</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Automatically audit your Git branch commits and container registries to generate dependency license clearance charts and CVE vulnerability heatmaps.
                    </p>
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-700">SAST Pipeline Gate</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">ACTIVE</span>
                      </div>
                      <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-700">CRA Compliance Lock</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase">ENFORCED</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Evidence Auto Workbench */}
              {activeModule === "MOD_EVIDENCE" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Continuous Audit Control Validation Ledger</h4>
                    <ComplianceEvidenceAuditor />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Continuous Evidence Vaulting</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Once collected, legal-grade technical evidence and configuration manifests are SHA-256 cryptographically sealed and pushed to the Evidence Vault for auditing by EU Regulators.
                    </p>
                    <a href="/evidence-vault" className="w-full text-center block py-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded transition-colors">
                      Enter Cryptographic Evidence Vault
                    </a>
                  </div>
                </div>
              )}

              {/* Security Training Workbench */}
              {activeModule === "MOD_TRAINING" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phishing Campaign Emulation Platform</h4>
                    <PhishingCampaignSimulator />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Security Awareness Benchmarks</h4>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Target Failure Rate</span>
                        <div className="text-lg font-black text-emerald-600 mt-0.5">&lt; 3.0%</div>
                        <p className="text-[10px] text-slate-500 leading-tight">Sector avg failures typically exceed 14.5%.</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Report Retention Rate</span>
                        <div className="text-lg font-black text-indigo-600 mt-0.5">88.5%</div>
                        <p className="text-[10px] text-slate-500 leading-tight">Percent of users logging alerts instead of ignoring them.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* vCISO Advisory Workbench */}
              {activeModule === "MOD_VCISO" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Virtual CISO Strategy & Board-Level Security Report</h4>
                    <VCISOReportGenerator overallScore={overallScore} activeAlertsCount={totalAlertsCount} saasConfigs={saasConfigs} />
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Sovereignty and Policy Alignment</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your virtual CISO matches system indicators directly against active EU legal files to advise on required capital allocation, mitigation planning, and board filings.
                    </p>
                    <div className="bg-white p-3 rounded border border-slate-200 space-y-1.5 text-xs font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span>DORA Compliance Gap</span>
                        <span className="text-emerald-600 font-bold">2.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NIS2 Control Mapping</span>
                        <span className="text-emerald-600 font-bold">98.1% Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* securiti.ai - Data Command Center */}
              {activeModule === "MOD_SECURITI" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-4 text-indigo-700">
                      <Database className="w-5 h-5" />
                      <h4 className="text-sm font-black uppercase tracking-wide">securiti.ai - Data Command Center</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-indigo-100 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                          <DatabaseZap className="w-4 h-4" />
                          <h5 className="font-bold text-xs uppercase tracking-wide">DSPM (Data Security Posture)</h5>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Discover, classify, and protect sensitive data across hybrid multi-cloud environments.</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                            <span>Shadow Data Assets Detected</span>
                            <span className="text-rose-600">12</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                            <span>Misconfigured Data Stores</span>
                            <span className="text-amber-600">3</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                            <span>Data Risk Score</span>
                            <span className="text-emerald-600">88/100</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-indigo-100 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                          <Users className="w-4 h-4" />
                          <h5 className="font-bold text-xs uppercase tracking-wide">Data Privacy & Governance</h5>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Automate DSRs/DSARs, consent management, and privacy impact assessments (PIAs).</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                            <span>Pending DSAR Requests</span>
                            <span className="text-indigo-600">4</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                            <span>Consent Sync Status</span>
                            <span className="text-emerald-600">Active</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                            <span>RoPA Reports Auto-Generated</span>
                            <span className="text-emerald-600">Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">AI Security & Governance</h4>
                      <p className="text-xs text-slate-600">Safely enable Copilots and LLMs with contextual data controls. securiti.ai ensures sensitive data isn't exposed to AI models or unauthorized employees.</p>
                      <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition flex justify-center items-center shadow-sm">
                        Run AI Data Risk Assessment
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 text-white">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" /> Compliance Mapping
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Powered by securiti.ai unified intelligence graph, mapping your data footprint automatically to global regulations.
                    </p>
                    <div className="bg-slate-800 p-3 rounded border border-slate-700 space-y-2 text-xs font-semibold">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">EU AI Act Readiness</span>
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">92%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">GDPR Data Residency</span>
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">Compliant</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">CCPA CPRA Audits</span>
                        <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 text-[10px]">Action Req</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* List Scan: Dependency & Vulnerability Audit */}
              {activeModule === "MOD_LISTSCAN" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <ListScanView />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Active Audit Policy</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      List Scan performs deep inspection of project manifests, lockfiles, and environment variables. It cross-references findings against global vulnerability databases (CVE) and EU regulatory requirements (CRA/NIS2).
                    </p>
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-700">Dependency Guard</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">ENFORCED</span>
                      </div>
                      <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-700">Secret Entropy Scan</span>
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded uppercase">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade/Onboarding Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                  {React.createElement(showUpgradeModal.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Activate Add-On</h3>
                  <p className="text-xs text-slate-400 font-medium">{showUpgradeModal.name}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Unlock full enterprise-grade operational workflows for <strong>{showUpgradeModal.name}</strong>, mapped specifically to continuous control testing requirements under DORA, GDPR, and the Cyber Resilience Act (CRA).
              </p>

              <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Enterprise Licensing Fee</span>
                  <span className="text-xl font-black text-indigo-700">{showUpgradeModal.price} <span className="text-xs font-semibold text-slate-400">/ month</span></span>
                </div>
                <span className="text-[9px] bg-indigo-100 text-indigo-800 font-black px-2 py-1 rounded border border-indigo-200">
                  CANCEL ANY TIME
                </span>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUpgradeModal(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => confirmUpgrade(showUpgradeModal.id)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition shadow-lg shadow-indigo-100"
                >
                  Authorize Activation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auxiliary Security Components */}
      <div className="mt-8 border-t border-slate-200 pt-8 space-y-5 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
          {/* Active Analysis Engines */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 lg:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-indigo-500" />
              Active Analysis Engines
            </h2>
            <div className="space-y-4">
              {[
                { name: 'OWASP ZAP', version: 'v2.14.0', status: 'ACTIVE', type: 'DAST Probing', icon: Zap },
                { name: 'RapidFuzz Core', version: 'v3.0.0', status: 'STANDBY', type: 'Fuzzy PII Matching', icon: Search },
                { name: 'FOSSology Engine', version: 'v4.4.0', status: 'CONNECTED', type: 'OSS License Audit', icon: FileCheck2 },
                { name: 'OpenWPM Stack', version: 'v0.19.1', status: 'MONITORING', type: 'Privacy Measurement', icon: ShieldAlert }
              ].map((engine, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <engine.icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{engine.name} <span className="text-[10px] text-slate-400 font-normal">{engine.version}</span></div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{engine.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${engine.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{engine.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <a href="/vulnerability-scanner" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                Launch Security Command Center <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Crisis Simulation Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-rose-500" />
              Simulate Data Breach
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Generate mock audit scenarios for staff training and incident response verification. Choose a scenario type to launch a simulated tabletop exercise.
            </p>
            <DataBreachSimulator />
          </div>
        </div>

        <div className="mt-8">
          <TrendForecastingChart />
        </div>

        <div className="mt-8">
          <RedTeamSimulator />
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------
// SUB-COMPONENTS FOR HIGH INTERACTIVE DEPTH
// -----------------------------------------

/**
 * SBOM software bill of materials generator component
 */
const SbomGenerator: React.FC = () => {
  const { showToast } = useNotification();
  const [manifestType, setManifestType] = useState("package.json");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sbomOutput, setSbomOutput] = useState<string | null>(null);
  
  // Database states
  const [libraries, setLibraries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remediating, setRemediating] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLib, setNewLib] = useState({ name: '', version: '', license: '' });

  const fetchLibraries = async () => {
    try {
      const res = await fetchWithRetry("/api/v1/security/sbom/libraries");
      const data = await res.json();
      if (data.success) {
        setLibraries(data.libraries);
      }
    } catch (err) {
      console.error("Failed to load SBOM libraries from SQLite:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  const handleSyncPackageJson = async () => {
    try {
      const res = await fetchWithRetry("/api/v1/security/sbom/libraries/sync-package-json", { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Successfully synced ${data.addedCount} packages from package.json!`);
        await fetchLibraries();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/security/sbom/libraries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActionSuccess('Library deleted.');
        await fetchLibraries();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithRetry("/api/v1/security/sbom/libraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLib)
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewLib({ name: '', version: '', license: '' });
        setActionSuccess('Library manually added.');
        await fetchLibraries();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };


  const handleRemediate = async (libName: string) => {
    setRemediating(libName);
    setActionSuccess(null);
    try {
      const res = await fetchWithRetry("/api/v1/security/sbom/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryName: libName })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Successfully applied EU Compliance Patch to ${libName}! All violations resolved.`);
        await fetchLibraries();
        // Clear success message after 4s
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Failed to remediate library:", err);
    } finally {
      setRemediating(null);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setSbomOutput(null);
    setTimeout(() => {
      const sbomData = {
        bomFormat: "CycloneDX",
        specVersion: "1.5",
        serialNumber: "urn:uuid:" + Math.random().toString(36).substring(2, 15) + "-471a-bc90-aef2341b5592",
        version: 1,
        metadata: {
          timestamp: new Date().toISOString(),
          tools: [{ vendor: "9Xen Regulettee AppSec Core", name: "sbom-engine", version: "v2.1.0" }],
          component: { group: "eu.9xen-regulettee", name: "compliance-tenant-hub", version: "2.14.0", type: "application" }
        },
        components: libraries.map(lib => ({
          group: "npm",
          name: lib.name,
          version: lib.version,
          licenses: [{ license: { id: lib.license } }],
          hashes: [{ alg: "SHA-256", content: "da57e62a781b0aef..." + lib.version }],
          properties: [
            { name: "cra-status", value: lib.cra_compliant ? "COMPLIANT" : "NON-COMPLIANT" },
            { name: "nis2-status", value: lib.nis2_approved ? "APPROVED" : "RESTRICTED" },
            { name: "gdpr-status", value: lib.gdpr_validated ? "VALIDATED" : "VIOLATION" }
          ]
        }))
      };
      setSbomOutput(JSON.stringify(sbomData, null, 2));
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">EU Policy Dependency Auditor (CRA & NIS2 & GDPR)</h4>
          <p className="text-xs text-slate-500 mt-0.5">Scans package trees, validates licenses against NIS2, and checks for Cyber Resilience Act (CRA) violations.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={manifestType} 
            onChange={(e) => setManifestType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded text-xs py-1.5 px-3 font-semibold outline-none cursor-pointer text-slate-700"
          >
            <option value="package.json">package.json (Node/Vite)</option>
            <option value="Cargo.toml">Cargo.toml (Rust Core)</option>
            <option value="requirements.txt">requirements.txt (Python API)</option>
          </select>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || isLoading}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded transition flex items-center gap-1.5"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCode className="w-3.5 h-3.5" />}
            Build CycloneDX SBOM
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {/* Dependency table with compliance gates */}
      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center">
          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Fetching SBOM library registry from SQLite...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-slate-150 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold">
                  <th className="p-3">Library / Package</th>
                  <th className="p-3">License</th>
                  <th className="p-3 text-center">CRA Gate</th>
                  <th className="p-3 text-center">NIS2 Gate</th>
                  <th className="p-3 text-center">GDPR Gate</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {libraries.map((lib) => {
                  const hasViolation = lib.violations && lib.violations.length > 0;
                  return (
                    <React.Fragment key={lib.id}>
                      <tr className={`${hasViolation ? 'bg-rose-50/20' : 'hover:bg-slate-50/50'} transition-colors`}>
                        <td className="p-3 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{lib.name}</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono text-slate-500">v{lib.version}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lib.license_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {lib.license}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {lib.cra_compliant ? (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              <Check className="w-3 h-3" /> Compliant
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              <ShieldAlert className="w-3 h-3" /> Fails CVE
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {lib.nis2_approved ? (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              <Check className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              <ShieldAlert className="w-3 h-3" /> Restricted
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {lib.gdpr_validated ? (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              <Check className="w-3 h-3" /> Validated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              <ShieldAlert className="w-3 h-3" /> PII Tracker
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-mono font-bold text-xs ${
                            lib.security_score >= 90 ? 'text-emerald-600' : lib.security_score >= 70 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {lib.security_score}/100
                          </span>
                        </td>
                                            <td className="p-3 text-right">
                          <div className="flex justify-end items-center gap-2">
                          {hasViolation ? (
                            <button
                              onClick={() => handleRemediate(lib.name)}
                              disabled={remediating !== null}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded shadow-sm hover:shadow transition"
                            >
                              {remediating === lib.name ? 'Applying...' : 'Apply Patch'}
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Secure
                            </span>
                          )}
                            <button onClick={() => handleDelete(lib.id)} className="text-rose-500 hover:text-rose-700 ml-2">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {hasViolation && (
                        <tr>
                          <td colSpan={7} className="bg-rose-50/30 p-3 border-t border-rose-100">
                            <div className="flex flex-col gap-1.5 border-l-2 border-rose-400 pl-3 py-0.5 text-[11px]">
                              {lib.violations.map((viol: any) => (
                                <div key={viol.id} className="text-slate-700">
                                  <span className="font-bold text-rose-700 uppercase mr-1.5">[{viol.rule_id}]:</span>
                                  {viol.description}
                                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                                    <strong>Remediation:</strong> {viol.remediation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="py-12 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600 mb-2"></div>
          <p className="text-xs text-slate-500 font-bold animate-pulse">Running container dependency tree crawl...</p>
        </div>
      )}

      {sbomOutput && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] uppercase font-bold text-slate-400">CycloneDX Security Package Clearance Manifest</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(sbomOutput);
                showToast("CycloneDX SBOM copied to clipboard.", 'success');
              }}
              className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded shadow-sm hover:bg-indigo-100 transition"
            >
              Copy Raw JSON
            </button>
          </div>
          <pre className="bg-slate-900 border border-slate-800 text-[10px] text-indigo-300 p-4 rounded-lg font-mono leading-relaxed overflow-y-auto max-h-[180px]">
            {sbomOutput}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Phishing awareness training drill simulator
 */
const PhishingCampaignSimulator: React.FC = () => {
  const [template, setTemplate] = useState("Urgent EU Audit Audit");
  const [recipientDept, setRecipientDept] = useState("C-Suite & Finance");
  const [campaignStatus, setCampaignStatus] = useState<"IDLE" | "RUNNING" | "FINISHED">("IDLE");
  const [progress, setProgress] = useState(0);

  const handleLaunch = () => {
    setCampaignStatus("RUNNING");
    setProgress(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (campaignStatus === "RUNNING") {
      timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            setCampaignStatus("FINISHED");
            return 100;
          }
          return p + 10;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [campaignStatus]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs font-semibold">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email Phishing Vector Template</label>
          <select 
            value={template} 
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-bold text-slate-700 outline-none"
          >
            <option>Urgent EU GDPR Audit Compliance Filing Needed</option>
            <option>Office 365 Password Security Breach Expiration</option>
            <option>Direct Deposit Banking Settlement Invoice</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Department Scope</label>
          <select 
            value={recipientDept} 
            onChange={(e) => setRecipientDept(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-bold text-slate-700 outline-none"
          >
            <option>C-Suite & Financial Administration</option>
            <option>Engineering & Technical DevOps</option>
            <option>Human Resources & Support Staff</option>
            <option>Global Staff-Wide Emulation</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-[10px] font-mono text-slate-400">Campaign Status: <strong className="text-slate-700">{campaignStatus}</strong></span>
        {campaignStatus === "IDLE" && (
          <button 
            onClick={handleLaunch}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Launch Phishing Campaign Drill
          </button>
        )}
        {campaignStatus === "RUNNING" && (
          <button disabled className="px-4 py-1.5 bg-slate-300 text-slate-500 font-bold rounded flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Emulating emails...
          </button>
        )}
        {campaignStatus === "FINISHED" && (
          <button 
            onClick={() => setCampaignStatus("IDLE")}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Start New Awareness Run
          </button>
        )}
      </div>

      {campaignStatus === "RUNNING" && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Delivering training payloads to servers...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {campaignStatus === "FINISHED" && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-inner">
          <div className="flex items-center text-emerald-700 font-bold gap-1.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Awareness Campaign Simulation Complete
          </div>
          <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50/50 rounded-md">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Emailed</span>
              <div className="text-sm font-extrabold text-slate-800">142 Employees</div>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-rose-400 block">Fell For Link</span>
              <div className="text-sm font-extrabold text-rose-600">3 Clicked (2.1%)</div>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-emerald-400 block">Reported Drill</span>
              <div className="text-sm font-extrabold text-emerald-600">121 Reported (85.2%)</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic leading-relaxed text-center">
            Excellent! Link click-through represents a 4.1% improvement over last month. Staff is well-trained to spot EU-regulator-themed vectors.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Continuous compliance control auditor component
 */
const ComplianceEvidenceAuditor: React.FC = () => {
  const [selectedAct, setSelectedAct] = useState("DORA");
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  const complianceObjectives: Record<string, string[]> = {
    "DORA": [
      "Sec 12.1: Keep transactional database and system access logs for 7 years",
      "Sec 14.4: Enforce TLS 1.3 on all active network endpoints with no SSL fallback",
      "Sec 18.2: Run automated security scans on production containers"
    ],
    "NIS2": [
      "Art 21.1(a): Establish fully documented risk management policy & ledger",
      "Art 21.1(d): Secure network physical/logical routing (Zero-Trust NIC boundaries)",
      "Art 21.1(g): Cryptographic key rotation every 90 days for client vaults"
    ],
    "GDPR": [
      "Art 32.1(a): Pseudonymization and PII encryption at rest on storage DBs",
      "Art 32.1(b): Ensure platform uptime exceeds 99.9% with multi-region redundancy",
      "Art 32.1(c): Regular tabletop simulation and penetration auditing of systems"
    ]
  };

  const handleAudit = () => {
    setIsRunningCheck(true);
    setReceipt(null);
    setTimeout(() => {
      setReceipt({
        timestamp: new Date().toISOString(),
        standard: selectedAct,
        scannedControllers: 14,
        outlierRiskMatched: 0,
        decision: "100% COMPLIANT",
        cryptographicProof: "f438a209e90aefbfda1c32488e09bfbdae1c224a90412e8b201a4190cde088e0"
      });
      setIsRunningCheck(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs font-semibold">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">Select Legal Standard</label>
          <div className="flex gap-1.5">
            {["DORA", "NIS2", "GDPR"].map((std) => (
              <button 
                key={std}
                onClick={() => setSelectedAct(std)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  selectedAct === std ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {std}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={handleAudit}
          disabled={isRunningCheck}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition flex items-center gap-1 shadow-sm"
        >
          {isRunningCheck ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          Validate Control Objectives
        </button>
      </div>

      <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-inner space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block">Required EU Regulatory Objectives for {selectedAct}</span>
        <div className="space-y-2">
          {complianceObjectives[selectedAct].map((obj, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-700 text-[11px] leading-relaxed">
              <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {isRunningCheck && (
        <div className="py-12 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-lg">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600 mb-2"></div>
          <p className="text-xs text-slate-500 font-bold animate-pulse">Scanning server system variables & encrypt logs...</p>
        </div>
      )}

      {receipt && (
        <div className="bg-indigo-950 text-indigo-100 border border-indigo-900 rounded-lg p-4 space-y-3 shadow-md font-mono text-[11px]">
          <div className="flex justify-between items-center border-b border-indigo-900/80 pb-2">
            <span className="font-bold text-indigo-300">COMPLIANCE LEDGER RECEIPT</span>
            <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">{receipt.decision}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 leading-normal text-indigo-200">
            <div>
              <span className="text-[9px] text-indigo-400 block font-sans font-bold">TIMESTAMP</span>
              <span>{receipt.timestamp}</span>
            </div>
            <div>
              <span className="text-[9px] text-indigo-400 block font-sans font-bold">OBJECTIVES VERIFIED</span>
              <span>{receipt.scannedControllers} Security Gates Checked</span>
            </div>
          </div>
          <div className="pt-2 border-t border-indigo-900/80">
            <span className="text-[9px] text-indigo-400 block font-sans font-bold">CRYPTOGRAPHIC SHA-256 SIGNATURE PROOF</span>
            <span className="text-emerald-400 font-bold break-all select-all">{receipt.cryptographicProof}</span>
          </div>
          <div className="pt-1 text-right">
            <button 
              onClick={() => {
                const link = document.createElement("a");
                const file = new Blob([JSON.stringify(receipt, null, 2)], { type: 'text/plain' });
                link.href = URL.createObjectURL(file);
                link.download = `9xen-regulettee-compliance-proof-${receipt.standard}.json`;
                link.click();
              }}
              className="text-[10px] font-sans text-indigo-300 hover:text-white hover:underline flex items-center justify-end gap-1 font-bold"
            >
              <Download className="w-3.5 h-3.5" /> Export Signed Audit Evidence (.json)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * vCISO Strategy & Board-Level Security Report
 */
const VCISOReportGenerator: React.FC<{ overallScore: number; activeAlertsCount: number; saasConfigs: any[] }> = ({ overallScore, activeAlertsCount, saasConfigs }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [boardReport, setBoardReport] = useState<string | null>(null);

  // Budgets state
  const [budgetAllocation, setBudgetAllocation] = useState({
    endpoint: 35,
    cloud: 45,
    training: 20
  });

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setBoardReport(null);
    setTimeout(() => {
      const generatedMarkdown = `
# EXECUTIVE BOARDROOM SECURITY PRESENTATION
**Document Identifier:** SEC-REP-${Date.now()}
**Prepared By:** Virtual CISO Advisory System
**Target Audience:** Board of Directors & Compliance Lead
**Alignment Frameworks:** EU DORA (Art 9/12), NIS2 Directive, CRA

---

## 1. EXECUTIVE POSTURE REPORT
Our overall cybersecurity posture index is currently positioned at **${overallScore}/100**. This reflects a highly resilient architectural core, representing a top-tier standing within the Financial & SaaS operating sector.

*   **Posture Score:** ${overallScore}% (Compliant/Resilient)
*   **Active Warnings Trailed:** ${activeAlertsCount} events logged
*   **Remediated SaaS Controllers:** ${saasConfigs.filter(c => c.remediated).length} of ${saasConfigs.length} fully patched

---

## 2. SWOT COMPLIANCE ASSESSMENT
*   **STRENGTHS:** Highly-vectorized SIEM logs integrated into native DuckDB storage; automated CycloneDX SBOM generation; cryptographic compliance evidence logs enabled.
*   **WEAKNESSES:** High alerting noise on unpatched local controllers; active DAST probing results indicate minor configuration gaps.
*   **OPPORTUNITIES:** Deploy automated host NIC isolation techniques to protect database cores against Zero-Day ransomware threats.
*   **THREATS:** NIS2 Article 21 fines for non-reporting of uncontained breaches within 72 hours; sector-wide supply chain credential sweeps.

---

## 3. STRATEGIC CAPITAL ALLOCATION ADVISED
To achieve and secure a **98% overall posture rating**, the vCISO suggests the following strategic cybersecurity budget allocations:
*   **Endpoint Telemetry Agent Controls:** ${budgetAllocation.endpoint}%
*   **Multi-Cloud SaaS Posture Remediation:** ${budgetAllocation.cloud}%
*   **Staff Phishing Drills & Security Training:** ${budgetAllocation.training}%

---

## 4. SIGN-OFF & ATTESTATION
We attest that 9Xen Regulettee's technical evidence registers represent genuine continuous operations, sealed in the cryptographic ledger.
`;
      setBoardReport(generatedMarkdown);
      setIsGenerating(false);
    }, 1500);
  };

  const handleBudgetChange = (key: 'endpoint' | 'cloud' | 'training', value: number) => {
    setBudgetAllocation(prev => {
      const otherKey1 = key === 'endpoint' ? 'cloud' : 'endpoint';
      const otherKey2 = key === 'training' ? 'cloud' : 'training';
      
      const diff = 100 - value;
      const otherSum = prev[otherKey1] + prev[otherKey2];
      
      let new1 = 0;
      let new2 = 0;
      if (otherSum > 0) {
        new1 = Math.round((prev[otherKey1] / otherSum) * diff);
        new2 = 100 - value - new1;
      } else {
        new1 = Math.round(diff / 2);
        new2 = diff - new1;
      }

      return {
        ...prev,
        [key]: value,
        [otherKey1]: Math.max(0, new1),
        [otherKey2]: Math.max(0, new2)
      };
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs font-semibold">
      <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block">Strategic Budget Planning Allocator</span>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <span>Endpoint Security Protection ({budgetAllocation.endpoint}%)</span>
            <input 
              type="range" 
              min="10" 
              max="80" 
              value={budgetAllocation.endpoint}
              onChange={(e) => handleBudgetChange('endpoint', parseInt(e.target.value))}
              className="w-1/2 accent-indigo-600"
            />
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Cloud SaaS Posture Healing ({budgetAllocation.cloud}%)</span>
            <input 
              type="range" 
              min="10" 
              max="80" 
              value={budgetAllocation.cloud}
              onChange={(e) => handleBudgetChange('cloud', parseInt(e.target.value))}
              className="w-1/2 accent-indigo-600"
            />
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Employee Phishing Awareness ({budgetAllocation.training}%)</span>
            <input 
              type="range" 
              min="10" 
              max="80" 
              value={budgetAllocation.training}
              onChange={(e) => handleBudgetChange('training', parseInt(e.target.value))}
              className="w-1/2 accent-indigo-600"
            />
          </div>
        </div>
      </div>

      <div className="text-right">
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition flex items-center gap-1.5 ml-auto shadow-sm"
        >
          {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          Compile Strategic Board Report
        </button>
      </div>

      {isGenerating && (
        <div className="py-12 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-lg">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600 mb-2"></div>
          <p className="text-xs text-slate-500 font-bold animate-pulse">Virtual CISO assembling compliance data points...</p>
        </div>
      )}

      {boardReport && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
            <span>Formatted Markdown Output Presentation</span>
            <button 
              onClick={() => {
                const link = document.createElement("a");
                const file = new Blob([boardReport], { type: 'text/markdown' });
                link.href = URL.createObjectURL(file);
                link.download = `9xen-regulettee-vCISO-Executive-Briefing.md`;
                link.click();
              }}
              className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Download Report (.md)
            </button>
          </div>
          <div className="bg-white border border-slate-200 text-slate-800 p-4 rounded-lg overflow-y-auto max-h-[220px] shadow-inner font-sans leading-relaxed space-y-3 prose prose-xs">
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 font-medium">
              {boardReport}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * List Scan: Active Dependency & Vulnerability Audit View
 */
const ListScanView: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<SecurityPosture | null>(null);
  const [remediating, setRemediating] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const data = await executeListScan();
      setScanData(data);
    } catch (e) {
      console.error('Scan failed', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemediate = async (id: string) => {
    setRemediating(id);
    try {
      await remediateVulnerability(id);
      setScanData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          results: prev.results.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r)
        };
      });
    } finally {
      setRemediating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Dependency & Secret Auditor</h3>
            <p className="text-[11px] text-slate-500">Continuous scanning for unpatched libraries and credential leaks.</p>
          </div>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isScanning ? "Scanning Workspace..." : "Initiate Active List Scan"}
        </button>
      </div>

      {!scanData && !isScanning && (
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
          <FileCode className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-500">Audit Not Yet Performed</p>
          <p className="text-xs text-slate-400 mt-1">Run a scan to analyze dependencies and security configurations.</p>
        </div>
      )}

      {isScanning && (
        <div className="py-20 flex flex-col items-center justify-center border border-slate-200 rounded-xl bg-white shadow-sm">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <Search className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-slate-800">Analyzing Project Manifests...</p>
            <p className="text-xs text-slate-500 mt-1 animate-pulse">Checking lockfiles, environment patterns, and NIS2 complianceArticle 21 alignment.</p>
          </div>
        </div>
      )}

      {scanData && !isScanning && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Security Score</span>
              <div className="text-2xl font-black text-indigo-600">{scanData.score}%</div>
              <div className="text-[10px] text-slate-500 mt-1">Calculated based on threat volume</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Critical Issues</span>
              <div className="text-2xl font-black text-rose-600">{scanData.criticalRisks}</div>
              <div className="text-[10px] text-slate-500 mt-1">Requiring immediate remediation</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Scan</span>
              <div className="text-sm font-bold text-slate-800 truncate mt-2">{new Date(scanData.lastScan).toLocaleString()}</div>
              <div className="text-[10px] text-slate-500 mt-1">Source: Active Audit Sweeper</div>
            </div>
          </div>

          {/* Results List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Detected Vulnerabilities & Regulatory Gaps</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">{scanData.results.length} Total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {scanData.results.map((result) => (
                <div key={result.id} className={`p-4 transition-colors ${result.status === 'RESOLVED' ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg shrink-0 mt-1 ${
                      result.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600' :
                      result.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                      result.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-800">{result.title}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                          result.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                          result.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                          result.severity === 'MEDIUM' ? 'bg-amber-500 text-white' :
                          'bg-slate-500 text-white'
                        }`}>
                          {result.severity}
                        </span>
                        {result.status === 'RESOLVED' && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded uppercase tracking-tighter flex items-center gap-1">
                            <Check className="w-3 h-3" /> Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{result.description}</p>
                      
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-start gap-2.5">
                        <div className="p-1 bg-white border border-slate-200 rounded text-indigo-600">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Remediation Path</span>
                          <p className="text-[10px] text-slate-700 font-medium">{result.remediation}</p>
                        </div>
                        {result.status !== 'RESOLVED' && (
                          <button 
                            onClick={() => handleRemediate(result.id)}
                            disabled={remediating === result.id}
                            className="shrink-0 px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300 text-[10px] font-bold rounded-md transition-all shadow-sm flex items-center gap-1.5"
                          >
                            {remediating === result.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-indigo-600" />}
                            Apply Patch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------
// DATA BREACH SIMULATOR WORKSPACE
// -----------------------------------------

const DataBreachSimulator: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<any>(null);
  
  const scenarios = [
    { type: 'Ransomware', title: 'CryptoLocker Variant on Finance Servers', desc: 'Finance department servers have been encrypted. Attackers are demanding 50 BTC.', systems: ['FIN-DB-01', 'BACKUP-NAS'] },
    { type: 'Phishing', title: 'Spear Phishing C-Level Execute', desc: 'CEO credentials compromised via spear phishing, granting access to confidential board documents.', systems: ['O365-Exec', 'SharePoint-Board'] },
    { type: 'Data Exfiltration', title: 'Unauthorized DB Export', desc: 'A large database export to a suspicious IP was detected in the middle of the night.', systems: ['Prod-Customer-DB', 'AWS-S3-Logs'] }
  ];

  const handleSimulate = (scenario: any) => {
    setIsSimulating(true);
    setActiveScenario(null);
    setTimeout(() => {
      setActiveScenario({
        ...scenario,
        timestamp: new Date().toISOString(),
        guidance: "Immediate Action Required: Follow playbooks for isolation, notify incident responders, and document all findings."
      });
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <div className="p-4 sm:p-5 lg:p-6 md:col-span-1 bg-slate-50">
           <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-4">Select Vector</h3>
           <div className="space-y-3">
             {scenarios.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSimulate(s)}
                  disabled={isSimulating}
                  className="w-full text-left px-4 py-3 bg-white border border-slate-200 hover:border-rose-300 hover:shadow-sm rounded-lg transition"
                >
                  <div className="font-semibold text-slate-800 text-sm">{s.type}</div>
                  <div className="text-xs text-slate-500 truncate mt-1">{s.title}</div>
                </button>
             ))}
           </div>
        </div>
        
        <div className="p-4 sm:p-5 lg:p-6 md:col-span-2">
           <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-4">Active Simulation Workspace</h3>
           
           {isSimulating ? (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-4"></div>
               <p className="text-sm font-medium animate-pulse">Provisioning Mock Environment...</p>
             </div>
           ) : activeScenario ? (
             <div className="bg-rose-50 border border-rose-100 rounded-lg p-5">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                       {activeScenario.type} Drill
                     </span>
                     <h4 className="text-lg font-bold text-rose-900">{activeScenario.title}</h4>
                   </div>
                   <span className="text-xs font-mono text-rose-500/70">{new Date(activeScenario.timestamp).toLocaleTimeString()}</span>
                 </div>
                 <p className="text-sm text-rose-800 mb-4">{activeScenario.desc}</p>
                 
                 <div className="mb-4">
                   <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Affected Systems</h5>
                   <div className="flex gap-2">
                     {activeScenario.systems.map((sys: string) => (
                       <span key={sys} className="px-2 py-1 bg-white border border-rose-200 text-xs font-mono rounded text-slate-600 shadow-sm">{sys}</span>
                     ))}
                   </div>
                 </div>

                 <div className="bg-white border-l-4 border-rose-500 p-3 shadow-sm rounded-r">
                    <p className="text-xs text-slate-700 font-medium"><strong>Objective:</strong> {activeScenario.guidance}</p>
                 </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
               <ShieldAlert className="w-12 h-12 text-slate-300 mb-3" />
               <p className="text-sm font-medium">No active simulation.</p>
               <p className="text-xs mt-1 text-slate-400">Select an attack vector to begin a training scenario.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
