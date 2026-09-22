import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Swords,
  Terminal,
  Award,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Play,
  Clock,
  Sparkles,
  Server,
  Lock,
  Building2,
  Globe,
  Activity,
  Layers,
  Search,
  ShieldCheck,
  Zap,
  ChevronRight,
  TrendingUp,
  XCircle,
  Copy,
  Check,
  HelpCircle,
  Shield
} from "lucide-react";
import { fetchWithRetry } from "../lib/api-client";

interface ThreatActor {
  name: string;
  motive: string;
  tactics: string[];
}

interface RegulatoryDeadline {
  authority: string;
  deadlineHours: number;
  requirement: string;
  mandatory: boolean;
}

interface TimelineEvent {
  time: string;
  event: string;
  severity: "critical" | "high" | "medium" | "info";
}

interface PlaybookOption {
  id: string;
  title: string;
  description: string;
  isRecommended: boolean;
  riskScore: number;
  timeImpactHours: number;
}

interface PlaybookPhase {
  phaseId: string;
  phaseName: string;
  situationUpdate: string;
  evidenceArtifact: string;
  options: PlaybookOption[];
  complianceTip: string;
}

interface FinancialExposure {
  potentialFinesEuro: number;
  downtimeCostEuro: number;
  forensicCostEuro: number;
  totalEstimatedRiskEuro: number;
}

interface BreachScenario {
  scenarioId: string;
  title: string;
  codename: string;
  vector: string;
  industry: string;
  framework: string;
  severity: string;
  summary: string;
  threatActor: ThreatActor;
  affectedAssets: string[];
  regulatoryDeadlines: RegulatoryDeadline[];
  timeline: TimelineEvent[];
  telemetryLogs: string[];
  financialExposure: FinancialExposure;
  playbookPhases: PlaybookPhase[];
}

interface PhaseEvaluation {
  phaseId: string;
  phaseName: string;
  selectedOptionTitle: string;
  score: number;
  feedback: string;
  complianceVerdict: "COMPLIANT" | "PARTIAL_COMPLIANCE" | "NON_COMPLIANT";
  correctiveAction: string;
}

interface EvaluationResult {
  overallScore: number;
  rating: string;
  containmentTimeHours: number;
  regulatoryComplianceScore: number;
  gdprDeadlineMet: boolean;
  financialExposureMitigatedEuro: number;
  penaltiesRiskEuro: number;
  auditCertificateId: string;
  executiveSummary: string;
  keyStrengths: string[];
  criticalVulnerabilities: string[];
  phaseEvaluations: PhaseEvaluation[];
}

interface SimulationHistoryItem {
  id: string;
  title: string;
  vector: string;
  industry: string;
  framework: string;
  severity: string;
  readiness_score: number;
  compliance_score: number;
  certificate_id: string;
  created_at: string;
}

export function BreachSimulationTool() {
  const [activeTab, setActiveTab] = useState<"configure" | "drill" | "scorecard" | "history">("configure");

  // Configurator state
  const [vector, setVector] = useState("ransomware");
  const [industry, setIndustry] = useState("fintech");
  const [framework, setFramework] = useState("GDPR");
  const [severity, setSeverity] = useState("High");
  const [customDetails, setCustomDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Simulation Drill state
  const [scenario, setScenario] = useState<BreachScenario | null>(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [userDecisions, setUserDecisions] = useState<Record<string, { selectedOptionId: string; customActionText?: string }>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // History state
  const [history, setHistory] = useState<SimulationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  // Fetch history on load
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetchWithRetry("/api/v1/breach-simulation/history");
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch (err) {
      console.warn("Failed to load simulation history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGenerateScenario = async (overrideParams?: Partial<{ vector: string; industry: string; framework: string; severity: string }>) => {
    setIsGenerating(true);
    setEvaluation(null);
    setUserDecisions({});
    setCurrentPhaseIndex(0);

    const payload = {
      vector: overrideParams?.vector || vector,
      industry: overrideParams?.industry || industry,
      framework: overrideParams?.framework || framework,
      severity: overrideParams?.severity || severity,
      customDetails,
    };

    try {
      const res = await fetchWithRetry("/api/v1/breach-simulation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.scenario) {
        setScenario(data.scenario);
        // Pre-select recommended default options for convenience
        const initialSelections: Record<string, { selectedOptionId: string }> = {};
        data.scenario.playbookPhases?.forEach((p: PlaybookPhase) => {
          if (p.options && p.options.length > 0) {
            initialSelections[p.phaseId] = { selectedOptionId: p.options[0].id };
          }
        });
        setUserDecisions(initialSelections);
        setActiveTab("drill");
      }
    } catch (err) {
      console.error("Error generating scenario:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (phaseId: string, optionId: string) => {
    setUserDecisions((prev) => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        selectedOptionId: optionId,
      },
    }));
  };

  const handleCustomActionChange = (phaseId: string, text: string) => {
    setUserDecisions((prev) => ({
      ...prev,
      [phaseId]: {
        selectedOptionId: prev[phaseId]?.selectedOptionId || "",
        customActionText: text,
      },
    }));
  };

  const handleEvaluateSimulation = async () => {
    if (!scenario) return;
    setIsEvaluating(true);

    const formattedDecisions = Object.entries(userDecisions).map(([phaseId, val]) => ({
      phaseId,
      selectedOptionId: val.selectedOptionId,
      customActionText: val.customActionText,
    }));

    try {
      const res = await fetchWithRetry("/api/v1/breach-simulation/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          userDecisions: formattedDecisions,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        setActiveTab("scorecard");

        // Save certificate to history
        await fetchWithRetry("/api/v1/breach-simulation/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario,
            evaluation: data.evaluation,
            userDecisions: formattedDecisions,
          }),
        });

        loadHistory();
      }
    } catch (err) {
      console.error("Error evaluating scenario:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const copyCertificateId = () => {
    if (evaluation?.auditCertificateId) {
      navigator.clipboard.writeText(evaluation.auditCertificateId);
      setCopiedCert(true);
      setTimeout(() => setCopiedCert(false), 2000);
    }
  };

  const downloadReportJson = () => {
    if (!scenario || !evaluation) return;
    const reportData = {
      scenario,
      evaluation,
      userDecisions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Breach_Simulation_Report_${evaluation.auditCertificateId || "CERT"}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Engine Incident Response Simulator</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500 shrink-0" />
              Cybersecurity Breach Simulation
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Simulate realistic data breach scenarios powered by Gemini AI. Test internal playbooks against EU GDPR, NIS2, DORA, and SEC cyber disclosure deadlines to ensure audit readiness.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("configure")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "configure"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Swords className="w-4 h-4" />
              1. Configure & Launch
            </button>
            <button
              onClick={() => setActiveTab("drill")}
              disabled={!scenario}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "drill"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              <Terminal className="w-4 h-4" />
              2. Active Drill
              {scenario && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </button>
            <button
              onClick={() => setActiveTab("scorecard")}
              disabled={!evaluation}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "scorecard"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              <Award className="w-4 h-4" />
              3. Scorecard & Audit
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              Drill History ({history.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CONFIGURE & LAUNCH */}
      {activeTab === "configure" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-600" />
                Configure Breach Scenario
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize attack vectors, industry targets, and regulatory standards for AI scenario generation.
              </p>
            </div>

            {/* Attack Vector Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Attack Vector / Breach Threat Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "ransomware", label: "Ransomware Exfiltration", desc: "Data encryption & double extortion", icon: Lock },
                  { id: "api_secret_leak", label: "Unmasked API Key Leak", desc: "Exposed secrets in repos/APIs", icon: Terminal },
                  { id: "cloud_misconfig", label: "Cloud Storage Leak", desc: "Public S3/Blob data bucket", icon: Server },
                  { id: "supply_chain", label: "Supply Chain Malware", desc: "Upstream vendor package exploit", icon: Layers },
                  { id: "insider_threat", label: "Insider Data Theft", desc: "Privileged operator key misuse", icon: ShieldAlert },
                  { id: "phishing", label: "Spear-Phishing Harvest", desc: "Credential theft & MFA bypass", icon: Globe },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = vector === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVector(item.id)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "border-rose-600 bg-rose-50/50 text-rose-950 font-semibold ring-2 ring-rose-600/20"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-rose-600" : "text-slate-500"}`} />
                        <span className="font-bold text-slate-900">{item.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sector & Framework Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Target Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="fintech">Banking & Fintech</option>
                  <option value="healthcare">Healthcare & Life Sciences</option>
                  <option value="saas">SaaS & Enterprise Tech</option>
                  <option value="energy">Critical Infrastructure / Energy</option>
                  <option value="retail">E-Commerce & Retail</option>
                  <option value="gov">Government & B2G Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Primary Regulation
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="GDPR">EU GDPR (72h Notification)</option>
                  <option value="NIS2">NIS2 Cyber Directive (24h Alert)</option>
                  <option value="EU_AI_ACT">EU AI Act (Art 73 Incident)</option>
                  <option value="DORA">DORA ICT Resilience (Finance)</option>
                  <option value="HIPAA">HIPAA / HITECH (Health Data)</option>
                  <option value="SEC_CYBER">SEC Cyber Disclosure (4-Day)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Threat Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Critical">Critical (Global Data Leak)</option>
                  <option value="High">High (Regional Outage/Egress)</option>
                  <option value="Medium">Medium (Isolated System Leak)</option>
                  <option value="Low">Low (Controlled Operational Drift)</option>
                </select>
              </div>
            </div>

            {/* Custom Focus Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                5. Custom Scenario Context & Focus (Optional)
              </label>
              <textarea
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="e.g. Focus on third-party SaaS vendor API key leak involving 500,000 customer PII records stored in PostgreSQL..."
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>Powered by Gemini 3.6 Flash Server-Side Engine</span>
              </div>

              <button
                onClick={() => handleGenerateScenario()}
                disabled={isGenerating}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Generating Scenario with AI Engine...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Launch AI Breach Scenario
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Benchmark Presets */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Benchmark Scenario Presets
              </h3>
              <p className="text-xs text-slate-500">
                Instantly load standardized regulatory breach templates for team drills.
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    title: "Ransomware & Exfiltration (GDPR)",
                    desc: "LockBit group encrypts production DB and threatens public leak within 72h.",
                    params: { vector: "ransomware", industry: "fintech", framework: "GDPR", severity: "Critical" },
                    color: "border-rose-200 hover:bg-rose-50/50",
                  },
                  {
                    title: "DORA Major ICT Outage",
                    desc: "Core banking payment service disruption triggered by third-party API keys.",
                    params: { vector: "api_secret_leak", industry: "fintech", framework: "DORA", severity: "High" },
                    color: "border-amber-200 hover:bg-amber-50/50",
                  },
                  {
                    title: "NIS2 Energy Grid Ransomware",
                    desc: "Industrial SCADA network intrusion impacting regional power monitoring.",
                    params: { vector: "zero_day", industry: "energy", framework: "NIS2", severity: "Critical" },
                    color: "border-emerald-200 hover:bg-emerald-50/50",
                  },
                  {
                    title: "EU AI Act High-Risk Model Leak",
                    desc: "Unmasked training dataset containing biometric PII exfiltrated.",
                    params: { vector: "cloud_misconfig", industry: "saas", framework: "EU_AI_ACT", severity: "High" },
                    color: "border-indigo-200 hover:bg-indigo-50/50",
                  },
                ].map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setVector(preset.params.vector);
                      setIndustry(preset.params.industry);
                      setFramework(preset.params.framework);
                      setSeverity(preset.params.severity);
                      handleGenerateScenario(preset.params);
                    }}
                    className={`p-3 rounded-xl border bg-slate-50 text-left cursor-pointer transition-all ${preset.color} group`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-rose-600">
                        {preset.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{preset.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Guidance Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>EU Regulatory Audit Mandates</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                EU GDPR (Art. 32/33) and DORA require operational resilience testing and documented incident response drills. Regular simulations ensure your DPO and CISO can meet reporting deadlines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE DRILL */}
      {activeTab === "drill" && scenario && (
        <div className="space-y-4 sm:space-y-6">
          {/* Active Drill Header Card */}
          <div className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {scenario.codename}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
                    SEVERITY: {scenario.severity.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-100 text-indigo-800">
                    FRAMEWORK: {scenario.framework}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{scenario.title}</h2>
              </div>

              {/* Regulatory Clock Badge */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-3 shrink-0">
                <Clock className="w-6 h-6 text-rose-600 animate-pulse" />
                <div>
                  <span className="block text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                    {scenario.regulatoryDeadlines[0]?.authority || "Regulatory Notification Clock"}
                  </span>
                  <span className="block text-sm font-black text-rose-950 font-mono">
                    T-MINUS {scenario.regulatoryDeadlines[0]?.deadlineHours || 72}:00 HOURS
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{scenario.summary}</p>

            {/* Incident Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Threat Actor</span>
                <span className="block text-xs font-bold text-slate-900 mt-0.5">{scenario.threatActor.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Potential Fine Exposure</span>
                <span className="block text-xs font-bold text-rose-600 mt-0.5">
                  €{(scenario.financialExposure.potentialFinesEuro / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Affected Data Assets</span>
                <span className="block text-xs font-bold text-slate-900 mt-0.5">{scenario.affectedAssets.length} Critical Assets</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Playbook Phases</span>
                <span className="block text-xs font-bold text-slate-900 mt-0.5">{scenario.playbookPhases.length} Decision Gateways</span>
              </div>
            </div>
          </div>

          {/* Drill Navigation Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column: Interactive Playbook Step Engine */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Phase Step Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {scenario.playbookPhases.map((phase, idx) => {
                  const isCurrent = idx === currentPhaseIndex;
                  const isAnswered = Boolean(userDecisions[phase.phaseId]?.selectedOptionId);
                  return (
                    <button
                      key={phase.phaseId}
                      onClick={() => setCurrentPhaseIndex(idx)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border ${
                        isCurrent
                          ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                          : isAnswered
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span>Phase {idx + 1}</span>
                      {isAnswered && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Current Phase Card */}
              {scenario.playbookPhases[currentPhaseIndex] && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                        Phase {currentPhaseIndex + 1} of {scenario.playbookPhases.length}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {scenario.playbookPhases[currentPhaseIndex].phaseName}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                      Gateway {currentPhaseIndex + 1}
                    </span>
                  </div>

                  {/* Situation Update Box */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-600" />
                      Live Situation Report
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {scenario.playbookPhases[currentPhaseIndex].situationUpdate}
                    </p>
                  </div>

                  {/* Evidence Artifact / Telemetry Code Snippet */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                      Technical Evidence Artifact / Telemetry
                    </span>
                    <div className="bg-slate-950 text-slate-200 font-mono text-[11px] p-3.5 rounded-xl border border-slate-800 overflow-x-auto">
                      <code>{scenario.playbookPhases[currentPhaseIndex].evidenceArtifact}</code>
                    </div>
                  </div>

                  {/* Relevant Regulatory Tip */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-indigo-950 font-medium">
                      <strong className="font-bold">Compliance Constraint: </strong>
                      {scenario.playbookPhases[currentPhaseIndex].complianceTip}
                    </p>
                  </div>

                  {/* Playbook Options Selection */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Select Response Option / Tactical Action:
                    </label>

                    <div className="space-y-2.5">
                      {scenario.playbookPhases[currentPhaseIndex].options.map((opt) => {
                        const phaseId = scenario.playbookPhases[currentPhaseIndex].phaseId;
                        const isSelected = userDecisions[phaseId]?.selectedOptionId === opt.id;

                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleSelectOption(phaseId, opt.id)}
                            className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? "border-rose-600 bg-rose-50/40 ring-2 ring-rose-600/20 shadow-sm"
                                : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected ? "border-rose-600 bg-rose-600 text-white" : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="font-bold text-slate-900 text-xs">{opt.title}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/60 text-slate-700">
                                  + {opt.timeImpactHours}h Impact
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-600 text-[11px] leading-relaxed pl-6">{opt.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Action Override Text */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">
                      Custom Incident Response Notes / Tactical Commands (Optional)
                    </label>
                    <input
                      type="text"
                      value={userDecisions[scenario.playbookPhases[currentPhaseIndex].phaseId]?.customActionText || ""}
                      onChange={(e) =>
                        handleCustomActionChange(
                          scenario.playbookPhases[currentPhaseIndex].phaseId,
                          e.target.value
                        )
                      }
                      placeholder="e.g. Dispatched forensic team to pull RAM dump via AWS CLI script before isolating VPC route table."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Phase Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      disabled={currentPhaseIndex === 0}
                      onClick={() => setCurrentPhaseIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Previous Phase
                    </button>

                    {currentPhaseIndex < scenario.playbookPhases.length - 1 ? (
                      <button
                        onClick={() => setCurrentPhaseIndex((prev) => prev + 1)}
                        className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5"
                      >
                        Next Phase
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleEvaluateSimulation}
                        disabled={isEvaluating}
                        className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/25 flex items-center gap-2 disabled:opacity-50"
                      >
                        {isEvaluating ? (
                          <>
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            Evaluating Decisions...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4" />
                            Submit & Calculate Readiness Scorecard
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Telemetry Log Console & Impact Breakdown */}
            <div className="space-y-4 sm:space-y-6">
              {/* Telemetry Log Console */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400 font-mono">
                    <Terminal className="w-4 h-4" />
                    <span>SIEM Telemetry & Log Stream</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-2 font-mono text-[10px] text-slate-300 max-h-64 overflow-y-auto pr-1">
                  {scenario.telemetryLogs.map((log, idx) => (
                    <div key={idx} className="p-2 bg-slate-900/80 rounded border border-slate-800/80 leading-relaxed break-all">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Mandates Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Mandatory Reporting Deadlines
                </h4>

                <div className="space-y-2">
                  {scenario.regulatoryDeadlines.map((req, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{req.authority}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                          Within {req.deadlineHours} Hours
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{req.requirement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Risk Summary */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  Estimated Financial & Legal Exposure
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Potential Regulatory Fines:</span>
                    <span className="font-bold text-slate-900">
                      €{(scenario.financialExposure.potentialFinesEuro / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Estimated Downtime Loss:</span>
                    <span className="font-bold text-slate-900">
                      €{(scenario.financialExposure.downtimeCostEuro / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Forensic & Legal Response:</span>
                    <span className="font-bold text-slate-900">
                      €{(scenario.financialExposure.forensicCostEuro / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 text-rose-600 font-bold text-sm">
                    <span>Total Financial Exposure:</span>
                    <span>€{(scenario.financialExposure.totalEstimatedRiskEuro / 1000000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCORECARD & AUDIT CERTIFICATE */}
      {activeTab === "scorecard" && evaluation && scenario && (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Score & Status Hero Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 border-b border-slate-800 pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Drill Evaluation Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  Incident Response Readiness Scorecard
                </h2>
                <p className="text-xs text-slate-400">
                  Audit Certificate ID: <strong className="font-mono text-white">{evaluation.auditCertificateId}</strong>
                </p>
              </div>

              {/* Gauge Score Display */}
              <div className="flex items-center gap-4 sm:gap-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Readiness Score</span>
                  <span
                    className={`text-3xl font-black font-mono ${
                      evaluation.overallScore >= 85
                        ? "text-emerald-400"
                        : evaluation.overallScore >= 70
                        ? "text-amber-400"
                        : "text-rose-500"
                    }`}
                  >
                    {evaluation.overallScore}%
                  </span>
                </div>

                <div className="h-10 w-px bg-slate-800" />

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating Verdict</span>
                  <span className="block text-xs font-bold text-white mt-0.5">{evaluation.rating}</span>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Containment Time</span>
                <span className="block text-lg font-black text-white mt-1 font-mono">
                  {evaluation.containmentTimeHours} Hours
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Regulatory Score</span>
                <span className="block text-lg font-black text-emerald-400 mt-1 font-mono">
                  {evaluation.regulatoryComplianceScore}%
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Reporting Deadline</span>
                <span className={`block text-xs font-bold mt-2 ${evaluation.gdprDeadlineMet ? "text-emerald-400" : "text-rose-400"}`}>
                  {evaluation.gdprDeadlineMet ? "✓ MET WITHIN WINDOW" : "✗ MISSED DEADLINE"}
                </span>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Financial Risk Saved</span>
                <span className="block text-lg font-black text-emerald-400 mt-1 font-mono">
                  €{(evaluation.financialExposureMitigatedEuro / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>

            {/* Executive Debrief Memorandum */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                CISO Executive Debrief Memorandum
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{evaluation.executiveSummary}</p>
            </div>

            {/* Certificate Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={copyCertificateId}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 flex items-center gap-1.5"
                >
                  {copiedCert ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCert ? "Copied ID" : "Copy Audit ID"}
                </button>
                <button
                  onClick={downloadReportJson}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Report (JSON)
                </button>
              </div>

              <button
                onClick={() => setActiveTab("configure")}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Run New Simulation Drill
              </button>
            </div>
          </div>

          {/* Phase-by-Phase Critique Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Detailed Phase-by-Phase AI Audit Breakdown
            </h3>

            <div className="space-y-4">
              {evaluation.phaseEvaluations.map((pe, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Phase {idx + 1}</span>
                      <h4 className="text-xs font-bold text-slate-900">{pe.phaseName}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          pe.complianceVerdict === "COMPLIANT"
                            ? "bg-emerald-100 text-emerald-800"
                            : pe.complianceVerdict === "PARTIAL_COMPLIANCE"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {pe.complianceVerdict.replace("_", " ")}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-900 px-2 py-0.5 bg-white rounded border border-slate-200">
                        Score: {pe.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Decision Selected</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{pe.selectedOptionTitle}</p>
                      <p className="text-slate-600 mt-1 leading-relaxed">{pe.feedback}</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1">
                      <span className="block text-[10px] font-bold text-indigo-600 uppercase">
                        Recommended Corrective Action
                      </span>
                      <p className="text-slate-700 text-[11px] leading-relaxed">{pe.correctiveAction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Audit Readiness Certificate Component */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 lg:p-8 text-white shadow-2xl space-y-4 sm:space-y-6 relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-10">
              <Shield className="w-48 h-48 text-amber-400" />
            </div>

            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Award className="w-4 h-4" />
                <span>OFFICIAL CERTIFICATE OF COMPLIANCE READINESS</span>
              </div>
              <h3 className="text-2xl font-black tracking-wide uppercase text-amber-300">
                Incident Response Readiness Memorandum
              </h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Issued by 9Xen Regulettee CaaS AI Engine for verifying organizational incident playbook readiness under {scenario.framework}.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-y border-slate-800 py-4 relative z-10">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Certificate Number</span>
                <span className="block text-xs font-mono font-bold text-white mt-1">{evaluation.auditCertificateId}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Tested Scenario</span>
                <span className="block text-xs font-bold text-white mt-1 line-clamp-1">{scenario.codename}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Final Score</span>
                <span className="block text-xs font-mono font-bold text-emerald-400 mt-1">{evaluation.overallScore}%</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Issued Timestamp</span>
                <span className="block text-xs font-mono font-bold text-white mt-1">
                  {new Date().toISOString().split("T")[0]}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 relative z-10 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Cryptographically Signed & Archived in SQLite Audit Ledger
              </span>
              <span className="font-mono">9Xen Regulettee Sovereign CaaS v2.1</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DRILL HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                Simulation Drill History & Audit Logs
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Historical record of all team breach simulation runs and readiness scores over time.
              </p>
            </div>

            <button
              onClick={loadHistory}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoadingHistory ? "animate-spin" : ""}`} />
              Refresh Logs
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Historical Breach Drills Found</p>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                Launch a new breach simulation scenario above to build your team's incident response audit trail.
              </p>
              <button
                onClick={() => setActiveTab("configure")}
                className="mt-2 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                Launch First Drill
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[11px] font-bold uppercase">
                    <th className="p-3">Title / Scenario</th>
                    <th className="p-3">Threat Vector</th>
                    <th className="p-3">Framework</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Readiness Score</th>
                    <th className="p-3">Certificate ID</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{item.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                          {item.vector}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{item.framework}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.severity === "Critical"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-mono font-bold text-xs ${
                            item.readiness_score >= 85
                              ? "text-emerald-600"
                              : item.readiness_score >= 70
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {item.readiness_score}%
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">{item.certificate_id}</td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
