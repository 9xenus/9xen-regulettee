import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Cpu,
  Database,
  CloudLightning,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Play,
  RefreshCw,
  Sliders,
  Zap,
  ArrowUpRight,
  Check,
  XCircle,
  FileText,
  HelpCircle,
  Server,
  Globe,
  Award,
  Sparkles,
  TrendingDown,
  BarChart3,
  Clock,
  Calendar,
  Bell,
  Mail,
  QrCode,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DISCOVERED_RECORDS, DiscoveredRecord } from "../data/infrastructureData";
import { HardwareAssetQrScanner } from "../components/compliance/HardwareAssetQrScanner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface ViolationItem {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  region: string;
  act: string;
  actTitle: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  rootCause: string;
  penaltyCalculation: string;
  requiredPackage: string;
  packageName: string;
  isSubscribed: boolean;
  status: "OPEN" | "FIXED" | "PENDING_UPGRADE";
}

export const ClientAssetScannerHub: React.FC = () => {
  // Client admin scanner state
  const [scanMode, setScanMode] = useState<"standard" | "deep">("standard");
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>("all");
  const [selectedActFilter, setSelectedActFilter] = useState<string>("all");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>("all");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [activeStepMessage, setActiveStepMessage] = useState<string>("Ready to scan connected digital assets & cloud infrastructure.");
  
  // Simulated violations state based on discovered infrastructure
  const [violations, setViolations] = useState<ViolationItem[]>([
    {
      id: "v_1",
      assetId: "rec_1",
      assetName: "PostgreSQL User Enclave",
      assetType: "Database / PII Storage",
      region: "EU-West (Ireland)",
      act: "GDPR Art. 32",
      actTitle: "General Data Protection Regulation (EU) 2016/679 - Security of Processing",
      severity: "Critical",
      rootCause: "Unencrypted plaintext PII columns detected in active user profile records without column-level envelope keys.",
      penaltyCalculation: "€20,000,000 or up to 4% of annual global turnover (whichever is higher) under GDPR Article 83(4).",
      requiredPackage: "automated-enforcement",
      packageName: "Automated Enforcement & Remediation Engine",
      isSubscribed: true,
      status: "OPEN"
    },
    {
      id: "v_2",
      assetId: "rec_2",
      assetName: "GitLab CI/CD Variables",
      assetType: "Secret & API Key Vault",
      region: "EU-West (Ireland)",
      act: "NIS2 Directive",
      actTitle: "Directive (EU) 2022/2555 on Measures for High Common Level of Cybersecurity",
      severity: "Critical",
      rootCause: "Hardcoded private SSH credentials and live bearer API tokens exposed in container build log artifacts.",
      penaltyCalculation: "Up to €10,000,000 or at least 2% of total worldwide annual turnover under NIS2 Article 34.",
      requiredPackage: "enterprise-security",
      packageName: "Enterprise Sovereign Shield & Key Guard",
      isSubscribed: false,
      status: "OPEN"
    },
    {
      id: "v_3",
      assetId: "rec_4",
      assetName: "S3 Health Records Bucket",
      assetType: "Cloud Object Storage (PHI)",
      region: "EU-Central (Frankfurt)",
      act: "EU Health Data Space (EHDS)",
      actTitle: "European Health Data Space Regulation (EU) 2025/327 - Secondary Use Safeguards",
      severity: "High",
      rootCause: "Clinical trial diagnostics bucket missing mandatory European Health Data Space zero-trust cryptographic shredding policy.",
      penaltyCalculation: "€15,000,000 or 3.5% of annual turnover under EHDS Enforcement Provisions.",
      requiredPackage: "healthtech-addon",
      packageName: "Healthtech Shield & Clinical Compliance",
      isSubscribed: false,
      status: "OPEN"
    },
    {
      id: "v_4",
      assetId: "rec_3",
      assetName: "Redis Transaction Cache",
      assetType: "Cache & PCI Gateway",
      region: "EU-West (Ireland)",
      act: "DORA Article 9",
      actTitle: "Digital Operational Resilience Act (EU) 2022/2554 - ICT Risk Management",
      severity: "High",
      rootCause: "CVV transaction buffer caching enabled in non-isolated ephemeral Redis node without hardware security module backing.",
      penaltyCalculation: "Periodic penalty payments up to 5% of average daily worldwide turnover under DORA Article 32.",
      requiredPackage: "dora-addon",
      packageName: "DORA Financial Resilience & ICT Shield",
      isSubscribed: true,
      status: "OPEN"
    },
    {
      id: "v_5",
      assetId: "rec_7",
      assetName: "AI LLM Inference Gateway",
      assetType: "Generative AI Engine",
      region: "EU-Central (Frankfurt)",
      act: "EU AI Act Art. 10",
      actTitle: "Artificial Intelligence Act (EU) 2024/1689 - High-Risk AI Data Governance",
      severity: "Critical",
      rootCause: "High-risk biometric categorization model trained on unverified scraped datasets lacking bias mitigation audits.",
      penaltyCalculation: "€35,000,000 or 7% of global annual turnover under AI Act Article 99.",
      requiredPackage: "ai-act",
      packageName: "EU AI Act Compliance & Model Governance",
      isSubscribed: false,
      status: "OPEN"
    }
  ]);

  // Upgrade Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedViolationForUpgrade, setSelectedViolationForUpgrade] = useState<ViolationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Remediation Log State
  const [remediationLogs, setRemediationLogs] = useState<Array<{
    id: string;
    assetName: string;
    act: string;
    timestamp: string;
    riskDelta: number;
    patchType: string;
  }>>([
    {
      id: "log_1",
      assetName: "PostgreSQL User Enclave",
      act: "GDPR Art. 32",
      timestamp: "Today, 06:14 AM",
      riskDelta: -28,
      patchType: "Column-Level Envelope Encryption Patch"
    },
    {
      id: "log_2",
      assetName: "Redis Transaction Cache",
      act: "DORA Art. 9",
      timestamp: "Yesterday, 11:42 PM",
      riskDelta: -19,
      patchType: "CVV Isolation & HSM Guard"
    }
  ]);

  // Task Scheduler State for Off-Peak Auto-Fixes
  const [scheduledTasks, setScheduledTasks] = useState<Array<{
    id: string;
    violationId: string;
    assetName: string;
    act: string;
    scheduleTime: string;
    status: "PENDING" | "EXECUTED";
  }>>([
    {
      id: "sch_1",
      violationId: "v_3",
      assetName: "S3 Health Records Bucket",
      act: "EU Health Data Space (EHDS)",
      scheduleTime: "Today at 02:00 AM (Off-Peak Maintenance Window)",
      status: "PENDING"
    }
  ]);
  const [schedulerModalOpen, setSchedulerModalOpen] = useState(false);
  const [selectedViolationForSchedule, setSelectedViolationForSchedule] = useState<ViolationItem | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("02:00 AM (Off-Peak)");

  // Notification Toggles for Critical Violations
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(true);
  const [inAppAlertsEnabled, setInAppAlertsEnabled] = useState<boolean>(true);
  const [qrScannerModalOpen, setQrScannerModalOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleScheduleOffPeakFix = (violation: ViolationItem) => {
    if (!violation.isSubscribed) {
      setSelectedViolationForUpgrade(violation);
      setUpgradeModalOpen(true);
      return;
    }
    setSelectedViolationForSchedule(violation);
    setSchedulerModalOpen(true);
  };

  const confirmOffPeakSchedule = () => {
    if (!selectedViolationForSchedule) return;
    const newTask = {
      id: `sch_${Date.now()}`,
      violationId: selectedViolationForSchedule.id,
      assetName: selectedViolationForSchedule.assetName,
      act: selectedViolationForSchedule.act,
      scheduleTime: selectedTimeSlot,
      status: "PENDING" as const
    };
    setScheduledTasks(prev => [newTask, ...prev]);
    setSchedulerModalOpen(false);
    showToast(`Successfully queued off-peak auto-fix for ${selectedViolationForSchedule.assetName} at ${selectedTimeSlot}.`);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setScanProgress(10);
    setActiveStepMessage("Connecting to AWS / GCP / Kubernetes Cloud Infrastructure endpoints...");

    setTimeout(() => {
      setScanProgress(35);
      setActiveStepMessage("Ingesting digital asset telemetry and metadata maps...");
    }, 800);

    setTimeout(() => {
      setScanProgress(70);
      setActiveStepMessage(`Executing ${scanMode === 'deep' ? 'Deep Multi-Vector Forensic & Kernel' : 'Standard'} check against 14 EU Lex & Regulatory Acts...`);
    }, 1600);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setActiveStepMessage("Scan completed successfully. Updated violation matrices and penalty projections.");
      showToast("Infrastructure Compliance Scan completed across all connected assets.");
    }, 2500);
  };

  const handleAutoFix = (violation: ViolationItem) => {
    if (!violation.isSubscribed) {
      setSelectedViolationForUpgrade(violation);
      setUpgradeModalOpen(true);
      return;
    }

    // Execute fix if subscribed
    setViolations(prev =>
      prev.map(v => (v.id === violation.id ? { ...v, status: "FIXED" } : v))
    );

    const newLog = {
      id: `log_${Date.now()}`,
      assetName: violation.assetName,
      act: violation.act,
      timestamp: "Just now",
      riskDelta: violation.severity === "Critical" ? -35 : -20,
      patchType: `Automated ${violation.act} Compliance & Hardening Patch`
    };
    setRemediationLogs(prev => [newLog, ...prev]);

    showToast(`Successfully applied automated remediation patch for ${violation.assetName} (${violation.act}).`);
  };

  const handleSimulateSubscriptionUpgrade = (violationId: string) => {
    const violation = violations.find(v => v.id === violationId);
    setViolations(prev =>
      prev.map(v => (v.id === violationId ? { ...v, isSubscribed: true, status: "FIXED" } : v))
    );
    if (violation) {
      const newLog = {
        id: `log_${Date.now()}`,
        assetName: violation.assetName,
        act: violation.act,
        timestamp: "Just now",
        riskDelta: -30,
        patchType: `Instant Package Upgrade & ${violation.act} Auto-Fix`
      };
      setRemediationLogs(prev => [newLog, ...prev]);
    }
    setUpgradeModalOpen(false);
    showToast("Package successfully activated! Automated remediation executed successfully.");
  };

  const filteredViolations = violations.filter(v => {
    if (selectedAssetFilter !== "all" && v.assetId !== selectedAssetFilter) return false;
    if (selectedActFilter !== "all" && !v.act.toLowerCase().includes(selectedActFilter.toLowerCase())) return false;
    if (selectedSeverityFilter !== "all" && v.severity.toLowerCase() !== selectedSeverityFilter.toLowerCase()) return false;
    return true;
  });

  const openCount = violations.filter(v => v.status === "OPEN").length;
  const fixedCount = violations.filter(v => v.status === "FIXED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Client Admin Exclusive • Connected Infrastructure & EU Lex Scanner</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-indigo-400 shrink-0" />
            Connected Asset & EU Lex Compliance Hub
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Continuously scan connected cloud infrastructure and digital assets against all EU statutory law acts. Inspect root causes, evaluate fine exposure, and trigger automated remediation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setQrScannerModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-cyan-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 animate-pulse" />
            <span>Scan Hardware QR Tag</span>
          </button>

          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scanning Assets...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Infrastructure Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan Configuration & Mode Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Scan Depth Mode
          </label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setScanMode("standard")}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all ${
                scanMode === "standard"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setScanMode("deep")}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all ${
                scanMode === "deep"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Deep Scan
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Filter by Connected Asset
          </label>
          <select
            value={selectedAssetFilter}
            onChange={(e) => setSelectedAssetFilter(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Connected Assets ({DISCOVERED_RECORDS.length})</option>
            {DISCOVERED_RECORDS.map((rec) => (
              <option key={rec.id} value={rec.id}>
                {rec.source} ({rec.businessUnitLabel})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Filter by EU Regulation Act
          </label>
          <select
            value={selectedActFilter}
            onChange={(e) => setSelectedActFilter(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statutory Acts</option>
            <option value="gdpr">GDPR (General Data Protection)</option>
            <option value="ai act">EU AI Act (Artificial Intelligence)</option>
            <option value="dora">DORA (Digital Operational Resilience)</option>
            <option value="nis2">NIS2 (Cybersecurity Directive)</option>
            <option value="ehds">EHDS (Health Data Space)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Filter by Severity Level
          </label>
          <select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical Severity</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Violations Found</div>
            <div className="text-lg font-black text-rose-600">{openCount} Open / {fixedCount} Fixed</div>
          </div>
        </div>
      </div>

      {/* Violations Over Time Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Violations & Auto-Fix Remediation Trend (Over Time)
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing the reduction in compliance gaps and active statutory risks following auto-fix executions.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-600">Open Violations ({openCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600">Fixed / Remediated ({fixedCount})</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { week: "Week 1", openViolations: 16, fixedRemediated: 2 },
                { week: "Week 2", openViolations: 12, fixedRemediated: 6 },
                { week: "Week 3", openViolations: 8, fixedRemediated: 10 },
                { week: "Current", openViolations: openCount, fixedRemediated: fixedCount },
              ]}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="openViolations" name="Open Violations" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOpen)" />
              <Area type="monotone" dataKey="fixedRemediated" name="Remediated" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorFixed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scanning Progress Bar Active State */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              {activeStepMessage}
            </span>
            <span>{scanProgress}%</span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Violations & Remediation Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">
            Discovered Statutory Violations & Auto-Fix Recommendations ({filteredViolations.length})
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
            Scope: Client Infrastructure & Connected Assets
          </span>
        </div>

        <div className="space-y-4">
          {filteredViolations.map((v) => {
            const isFixed = v.status === "FIXED";
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs transition-all ${
                  isFixed ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                      isFixed
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : v.severity === "Critical"
                        ? "bg-rose-100 text-rose-700 border-rose-200"
                        : "bg-amber-100 text-amber-700 border-amber-200"
                    }`}>
                      {isFixed ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                          {v.act}
                        </span>
                        <span 
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-help ${
                            v.severity === "Critical"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                          title={`Classification Criteria: Triggered under ${v.act} statutory enforcement rules. Severity: ${v.severity}. Root Cause: ${v.rootCause}. Penalty Exposure: ${v.penaltyCalculation}`}
                        >
                          {v.severity} Severity (Hover for Criteria)
                        </span>
                        {isFixed && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                            Auto-Fixed & Remediated
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {v.assetName} <span className="text-xs font-normal text-slate-500">({v.assetType})</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {v.actTitle} • <span className="font-mono text-slate-500">{v.region}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end lg:self-center flex-wrap">
                    {!isFixed ? (
                      <>
                        <button
                          onClick={() => handleScheduleOffPeakFix(v)}
                          className="px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                          title="Schedule off-peak auto-fix execution"
                        >
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          Schedule Off-Peak
                        </button>
                        <button
                          onClick={() => handleAutoFix(v)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                            v.isSubscribed
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                              : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          {v.isSubscribed ? "Trigger Auto-Fix Patch" : "Auto-Fix (Upgrade Required)"}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                        <Check className="w-4 h-4" />
                        Remediation Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Root Cause & Penalty Calculation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Root Cause Analysis
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {v.rootCause}
                    </p>
                  </div>

                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
                    <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Potential Statutory Penalty Exposure
                    </div>
                    <p className="text-xs text-rose-900 font-bold leading-relaxed">
                      {v.penaltyCalculation}
                    </p>
                  </div>
                </div>

                {/* Subscription / Package Coverage Note */}
                {!v.isSubscribed && !isFixed && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Auto-fix requires subscription to <strong className="font-bold">{v.packageName}</strong>.
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedViolationForUpgrade(v);
                        setUpgradeModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer shrink-0"
                    >
                      View Package & Subscribe &rarr;
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Subscription Upgrade Modal */}
      {upgradeModalOpen && selectedViolationForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-4 sm:p-5 lg:p-6 shadow-2xl space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Subscription Required for Auto-Fix</h3>
                  <p className="text-xs text-slate-500">Unlock automated one-click remediation & compliance patching</p>
                </div>
              </div>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
                <div className="text-indigo-900 font-bold text-sm">
                  {selectedViolationForUpgrade.packageName}
                </div>
                <p className="text-indigo-700 leading-relaxed">
                  Your current tenant plan does not include automated remediation coverage for <strong className="font-semibold">{selectedViolationForUpgrade.act}</strong> on <span className="font-mono">{selectedViolationForUpgrade.assetName}</span>.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-indigo-200 font-bold text-indigo-900 text-sm">
                  <span>Upgrade Price:</span>
                  <span className="text-indigo-600">€499.00 / month</span>
                </div>
              </div>

              <p className="text-slate-500">
                Subscribing immediately unlocks instant auto-fixing for this vulnerability, continuous monitoring, and automated regulatory audit reports.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSimulateSubscriptionUpgrade(selectedViolationForUpgrade.id)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Subscribe & Execute Auto-Fix Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Off-Peak Task Scheduler Modal */}
      {schedulerModalOpen && selectedViolationForSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-4 sm:p-5 lg:p-6 shadow-2xl space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Schedule Off-Peak Auto-Fix</h3>
                  <p className="text-xs text-slate-500">Queue remediation during low traffic maintenance window</p>
                </div>
              </div>
              <button
                onClick={() => setSchedulerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedViolationForSchedule.assetName}
                </div>
                <div className="text-slate-500">
                  Act: <span className="font-semibold text-slate-700">{selectedViolationForSchedule.act}</span> ({selectedViolationForSchedule.severity} Severity)
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">Select Off-Peak Maintenance Window</label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Today at 02:00 AM (EU-West Low Traffic)">Today at 02:00 AM (EU-West Low Traffic)</option>
                  <option value="Tonight at 03:30 AM (Global Maintenance Window)">Tonight at 03:30 AM (Global Maintenance Window)</option>
                  <option value="Tomorrow at 01:00 AM (Scheduled Cron Job)">Tomorrow at 01:00 AM (Scheduled Cron Job)</option>
                  <option value="Weekend Maintenance Window (Saturday 00:00 UTC)">Weekend Maintenance Window (Saturday 00:00 UTC)</option>
                </select>
              </div>

              <p className="text-slate-500 leading-relaxed">
                Scheduling off-peak ensures zero service disruption for high-throughput cloud clusters while automatically applying compliance patches.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSchedulerModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmOffPeakSchedule}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Confirm & Queue Off-Peak Task
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Scheduled Task Queue Summary Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Queued Off-Peak Remediation Tasks ({scheduledTasks.length})
            </h3>
            <p className="text-xs text-slate-500">
              Active automated maintenance cron jobs scheduled for low-impact deployment across connected infrastructure.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {scheduledTasks.map((t) => (
            <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.assetName} <span className="font-normal text-slate-500">({t.act})</span></div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-0.5">Scheduled for: {t.scheduleTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                  {t.status}
                </span>
                <button
                  onClick={() => {
                    setScheduledTasks(prev => prev.filter(x => x.id !== t.id));
                    showToast("Cancelled scheduled remediation task.");
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 cursor-pointer"
                >
                  Cancel Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Remediation Log & Risk Delta Sidebar / Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              Executed Remediation Log & Risk Delta Tracker ({remediationLogs.length})
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of all automated fixes applied, timestamps, patch signatures, and the corresponding reduction in risk score delta.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full self-start md:self-auto">
            Total Risk Score Improved: {remediationLogs.reduce((acc, l) => acc + l.riskDelta, 0)} pts
          </span>
        </div>

        <div className="space-y-3">
          {remediationLogs.map((log) => (
            <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{log.assetName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded">{log.act}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {log.patchType} • <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Risk Score Delta</div>
                  <div className="text-sm font-black text-emerald-600 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {log.riskDelta} Points
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Compliance Violation Alert Settings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Critical Compliance Violation Alert Settings
            </h3>
            <p className="text-xs text-slate-500">
              Configure automated notifications dispatched immediately whenever a Critical-level violation is detected during an active scan.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full self-start md:self-auto">
            Client Admin Policy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Email Dispatch Alerts</div>
                <div className="text-[11px] text-slate-500">Send instant email notifications to client admins on critical findings</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                onChange={() => {
                  setEmailAlertsEnabled(!emailAlertsEnabled);
                  showToast(emailAlertsEnabled ? "Email alerts disabled for critical violations." : "Email alerts enabled for critical violations.");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">In-App Dashboard Alerts</div>
                <div className="text-[11px] text-slate-500">Display high-priority warning banners in the client dashboard inbox</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inAppAlertsEnabled}
                onChange={() => {
                  setInAppAlertsEnabled(!inAppAlertsEnabled);
                  showToast(inAppAlertsEnabled ? "In-app alerts disabled." : "In-app alerts enabled for critical violations.");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Hardware Asset QR Scanner Modal */}
      {qrScannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <HardwareAssetQrScanner
            isModal={true}
            initialAssetId="AST-HW-901"
            onClose={() => setQrScannerModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
export default ClientAssetScannerHub;
