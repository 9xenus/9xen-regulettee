import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Shield, 
  FileText, 
  Lock, 
  ArrowRight, 
  Activity, 
  Percent,
  Wrench,
  Lightbulb,
  Sparkles,
  Play,
  Check
} from "lucide-react";

interface ComplianceHealthScoreWidgetProps {
  score?: number;
}

export const ComplianceHealthScoreWidget: React.FC<ComplianceHealthScoreWidgetProps> = ({ score = 94 }) => {
  const [selectedRegulation, setSelectedRegulation] = useState<"overall" | "gdpr" | "ccpa">("overall");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<"vulnerability" | "policy" | "privacy">("vulnerability");

  const [resolvedVulnerability, setResolvedVulnerability] = useState(false);
  const [resolvedPolicy, setResolvedPolicy] = useState(false);
  const [scheduledPrivacyAudit, setScheduledPrivacyAudit] = useState(false);

  // Dynamic scores for sub-categories scaled based on the incoming score and resolution status
  const vulnerabilityScore = resolvedVulnerability 
    ? 100 
    : Math.max(50, Math.min(99, Math.round(score * 0.97)));
  const policyScore = resolvedPolicy 
    ? 100 
    : Math.max(50, Math.min(99, Math.round(score * 1.01)));
  const privacyScore = scheduledPrivacyAudit 
    ? Math.min(100, Math.round(score * 1.02) + 2) 
    : Math.max(50, Math.min(100, Math.round(score * 1.02)));

  // Breakdown for overall, gdpr, and ccpa
  const breakdownData = {
    overall: {
      score: score,
      gdpr: Math.round(score * 1.01),
      ccpa: Math.round(score * 0.98),
      label: "Overall Compliance",
      metrics: [
        { name: "Consent Framework", score: 98, status: "passing" },
        { name: "DSAR Request Handler", score: 90, status: "passing" },
        { name: "DPA & Vendor Review", score: 92, status: "passing" },
        { name: "Right to Erasure (Art 17)", score: 96, status: "passing" },
      ],
    },
    gdpr: {
      score: Math.min(100, Math.round(score * 1.02)),
      gdpr: Math.min(100, Math.round(score * 1.02)),
      ccpa: Math.round(score * 0.95),
      label: "GDPR Compliance",
      metrics: [
        { name: "Article 30 Record of Processing", score: 95, status: "passing" },
        { name: "Article 32 Technical Measures", score: 100, status: "passing" },
        { name: "Article 33 Breach Notification", score: 90, status: "passing" },
        { name: "Article 35 DPIA Process", score: 100, status: "passing" },
      ],
    },
    ccpa: {
      score: Math.round(score * 0.98),
      gdpr: Math.round(score * 0.95),
      ccpa: Math.round(score * 0.98),
      label: "CCPA/CPRA Compliance",
      metrics: [
        { name: "Notice at Collection", score: 94, status: "passing" },
        { name: "Do Not Sell/Share Automations", score: 88, status: "warning" },
        { name: "Authorized Agent Verification", score: 92, status: "passing" },
        { name: "Right to Limit Sensitive Data", score: 94, status: "passing" },
      ],
    },
  };

  const currentData = breakdownData[selectedRegulation];
  
  // Recharts Pie Chart Data
  const chartData = [
    { name: "Compliant", value: currentData.score },
    { name: "Gap", value: 100 - currentData.score },
  ];

  // Colors: Emerald/Green for high score, Amber for medium, Rose for low.
  const getScoreColor = (val: number) => {
    if (val >= 90) return "#10b981"; // Emerald
    if (val >= 70) return "#f59e0b"; // Amber
    return "#ef4444"; // Rose
  };

  const scoreColor = getScoreColor(currentData.score);
  const COLORS = [scoreColor, "#e2e8f0"]; // Slate-200 for gap in light mode

  // Detailed modal sub-categories lists
  const modalSubCategories = {
    vulnerability: {
      title: "Vulnerability Scanner Telemetry",
      score: vulnerabilityScore,
      icon: <Shield className="w-5 h-5 text-indigo-500" />,
      description: "Continuous static container audits, active dependency CVE evaluations, and regional network boundary isolation health.",
      items: [
        { name: "Sovereign Container Image Sandbox Isolation", status: "passing", details: "All active enclaves are running validated secure root namespaces. No unauthorized privilege escalations detected." },
        { 
          name: "Infrastructure CVE Dependency Scan", 
          status: resolvedVulnerability ? "passing" : "warning", 
          details: resolvedVulnerability 
            ? "All 2 low-risk CVE package dependencies successfully patched, audited, and secured." 
            : "0 critical severity items. 2 low-risk CVE packages identified in the logging layer (audit review scheduled)." 
        },
        { name: "eIDAS / SSL Cryptographic Handshake Suite", status: "passing", details: "A+ compliance rating. Strict TLS 1.3 enforced across all endpoint integrations. Legitimate PFS enabled." },
        { name: "External Boundary Port Surveillance", status: "passing", details: "All non-essential routing ports closed. External exposure mapped and mitigated dynamically." },
      ],
    },
    policy: {
      title: "Sovereign Policy Engine Evaluation",
      score: policyScore,
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      description: "Real-time alignment with cross-border acts including GDPR, DORA resilience frameworks, NIS2 directives, and high-risk AI Act clauses.",
      items: [
        { name: "Article 30 Record of Processing", status: "passing", details: "Fully documented and cataloged processing operations. Cryptographically anchored on-chain registry." },
        { name: "Article 32 Security Controls Validation", status: "passing", details: "Access boundaries and automated tenant separation verified by automated synthetic policy queries." },
        { name: "Compliance Policy Integration & Synced Actions", status: "passing", details: "All tenants are automatically updated with regulatory changes mapped directly from the central repository." },
        { 
          name: "Security Training Acknowledgment Registry", 
          status: resolvedPolicy ? "passing" : "warning", 
          details: resolvedPolicy 
            ? "100% staff training compliance verified. Reminder notifications executed successfully." 
            : "92% staff compliance. 4 personnel remaining to acknowledge updated data handling policies before SLA limit." 
        },
      ],
    },
    privacy: {
      title: "Data Privacy & Residency Frameworks",
      score: privacyScore,
      icon: <Lock className="w-5 h-5 text-indigo-500" />,
      description: "Consent validity engines, automated Data Subject Access Requests (DSAR), and geographic residency sovereignty locks.",
      items: [
        { 
          name: "Cookie Consent & Tracker Categorization", 
          status: "passing", 
          details: scheduledPrivacyAudit 
            ? "Cookie consent state crawled and verified. 100% compliance with zero non-compliant trackers." 
            : "Compliance Banner sync active. Real-time scanning and classification of tracking cookies in active sessions." 
        },
        { name: "Automated DSAR Response Engine", status: "passing", details: "No requests exceeded the 30-day regulatory boundary. Response packaging pipeline operating normally." },
        { name: "Cross-Border Standard Contractual Clauses (SCC)", status: "passing", details: "Valid adequacy controls in place for multi-region enclaves. Authorized localization active." },
        { name: "PII Scraping & Memory Scrubbing Controls", status: "passing", details: "High-frequency runtime sweeps prevent exposure of client-level PII within temporary execution caches." },
      ],
    },
  };

  const remediationSteps = {
    vulnerability: [
      {
        id: "vuln-1",
        title: "Patch Logging Layer CVEs",
        description: "Deploy security updates for logging dependencies to patch the 2 identified low-risk CVE parameters.",
        impact: "Vulnerability Score +3%",
        isResolved: resolvedVulnerability,
        onResolve: () => setResolvedVulnerability(true),
        icon: <Wrench className="w-4 h-4 text-indigo-500" />
      },
      {
        id: "vuln-2",
        title: "Rotate SSL Private Keys",
        description: "Enforce proactive rotation of SSL handshake private enclaves in accordance with eIDAS standards.",
        impact: "Best Practice Alignment",
        isResolved: false,
        onResolve: null,
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />
      }
    ],
    policy: [
      {
        id: "policy-1",
        title: "Automate Employee Sign-off Reminders",
        description: "Trigger urgent Slack & email reminders to the 4 remaining staff members who haven't completed training.",
        impact: "Policy Score +8% (100% compliance)",
        isResolved: resolvedPolicy,
        onResolve: () => setResolvedPolicy(true),
        icon: <Wrench className="w-4 h-4 text-indigo-500" />
      },
      {
        id: "policy-2",
        title: "DORA Compliance Dry Run",
        description: "Simulate service failure scenario to test operational resilience and log findings in the Sovereign Engine.",
        impact: "Resilience Score Optimal",
        isResolved: false,
        onResolve: null,
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />
      }
    ],
    privacy: [
      {
        id: "privacy-1",
        title: "Schedule Cookie Consent Crawler Refresh",
        description: "Run active high-frequency background sweeps to categorize all dynamic tracking cookies in current sessions.",
        impact: "Proactive Verification",
        isResolved: scheduledPrivacyAudit,
        onResolve: () => setScheduledPrivacyAudit(true),
        icon: <Wrench className="w-4 h-4 text-indigo-500" />
      },
      {
        id: "privacy-2",
        title: "DSAR Automation Integrity Check",
        description: "Verify that DPO compliance logs remain uninhibited by testing with an automated synthetic consumer request.",
        impact: "Response SLAs Clear",
        isResolved: false,
        onResolve: null,
        icon: <Sparkles className="w-4 h-4 text-indigo-500" />
      }
    ]
  };

  return (
    <>
      <motion.div
        id="compliance-health-score-widget"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={(e) => {
          // If the click is inside the pill buttons, don't trigger the modal
          if ((e.target as HTMLElement).closest(".pill-btn-container")) return;
          setIsModalOpen(true);
        }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group/card relative"
      >
        {/* Click hover overlay/indicator */}
        <div className="absolute top-3 right-3 text-[10px] font-bold text-indigo-600 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-0.5 z-10">
          View Breakdown <ArrowRight className="w-3 h-3" />
        </div>

        {/* Header section matching other widgets */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
              Compliance Health Score
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">GDPR & CCPA Circular Gauge</p>
          </div>
          
          {/* Regulation selector pills */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 pill-btn-container">
            {(["overall", "gdpr", "ccpa"] as const).map((reg) => (
              <button
                id={`pill-${reg}`}
                key={reg}
                onClick={() => setSelectedRegulation(reg)}
                className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md transition cursor-pointer ${
                  selectedRegulation === reg
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 flex-grow flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Gauge area on left (or top on mobile) */}
          <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center mx-auto md:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered overall text label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={currentData.score}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-extrabold tracking-tighter"
                style={{ color: scoreColor }}
              >
                {currentData.score}%
              </motion.span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Compliant
              </span>
            </div>
          </div>

          {/* Metrics breakdown list on right */}
          <div className="flex-1 w-full space-y-3.5">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
              <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                {currentData.label} Breakdown
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}
              >
                Inspect
              </span>
            </div>

            <div className="space-y-2">
              {currentData.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2">
                    {metric.status === "passing" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-xs font-semibold text-slate-700">{metric.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{metric.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info notice at the bottom */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-normal">
              Gauge aggregates security and act criteria. Click card to view full sub-category audit breakdown.
            </p>
          </div>
          <span className="text-[10px] font-extrabold text-indigo-600 whitespace-nowrap">Details &rarr;</span>
        </div>
      </motion.div>

      {/* Sub-Category Audit Breakdown Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative max-h-[85vh]"
              id="compliance-health-score-modal"
              onClick={(e) => e.stopPropagation()} // Stop propagation from closing the modal
            >
              {/* Decorative Tech Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

              {/* Header */}
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-150 flex items-center justify-between relative bg-slate-50/55 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      Sovereign Compliance Audit Index
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Real-time aggregate scorecard across core operational modules</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Close detailed report"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-Category Navigation / Summary Cards Grid */}
              <div className="p-4 sm:p-5 lg:p-6 bg-slate-50/30 border-b border-slate-150 grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
                {(["vulnerability", "policy", "privacy"] as const).map((tab) => {
                  const data = modalSubCategories[tab];
                  const color = getScoreColor(data.score);
                  const isSelected = activeCategoryTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveCategoryTab(tab)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-28 relative overflow-hidden ${
                        isSelected
                          ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1.5 rounded-lg border ${isSelected ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-150"}`}>
                          {data.icon}
                        </div>
                        <span className="text-xl font-black tracking-tight" style={{ color }}>
                          {data.score}%
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 capitalize">
                          {tab} score
                        </h4>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${data.score}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Sub-category Checklist Details and Remediation Columns */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 z-10 grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 min-h-[300px]">
                {/* Left Column: Checklist (3/5 width on large screens) */}
                <div className="lg:col-span-3 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {modalSubCategories[activeCategoryTab].icon}
                      <h4 className="text-sm font-extrabold text-slate-800">
                        {modalSubCategories[activeCategoryTab].title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {modalSubCategories[activeCategoryTab].description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {modalSubCategories[activeCategoryTab].items.map((item, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-150 rounded-xl p-3.5 bg-white shadow-xs flex items-start gap-3 hover:border-slate-300 transition"
                      >
                        <div className="mt-0.5">
                          {item.status === "passing" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                            <span
                              className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border"
                              style={{
                                backgroundColor: item.status === "passing" ? "#ecfdf5" : "#fffbeb",
                                borderColor: item.status === "passing" ? "#d1fae5" : "#fef3c7",
                                color: item.status === "passing" ? "#065f46" : "#92400e"
                              }}
                            >
                              {item.status === "passing" ? "Verified" : "Warning"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {item.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Suggested Remediation Steps (2/5 width on large screens) */}
                <div className="lg:col-span-2 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-150 pt-6 lg:pt-0 lg:pl-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                      <h4 className="text-sm font-extrabold text-slate-800">
                        Suggested Remediation Steps
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Recommended actions to optimize compliance parameters and patch outstanding vulnerabilities.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {remediationSteps[activeCategoryTab].map((step) => (
                      <div
                        key={step.id}
                        className={`border rounded-xl p-3.5 transition flex flex-col justify-between ${
                          step.isResolved
                            ? "border-emerald-100 bg-emerald-50/20"
                            : "border-slate-200 bg-white hover:border-indigo-200"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {step.isResolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              step.icon
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-xs font-bold block ${step.isResolved ? "text-slate-600 line-through" : "text-slate-800"}`}>
                              {step.title}
                            </span>
                            <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal">
                              {step.description}
                            </p>
                            <span className="text-[9.5px] font-extrabold text-indigo-600 mt-1.5 inline-block bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                              {step.impact}
                            </span>
                          </div>
                        </div>

                        {step.onResolve && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                            <button
                              onClick={step.onResolve}
                              disabled={step.isResolved}
                              className={`text-[10.5px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                step.isResolved
                                  ? "bg-emerald-100 text-emerald-700 cursor-not-allowed border border-emerald-200"
                                  : "bg-slate-900 hover:bg-indigo-600 text-white shadow-xs"
                              }`}
                            >
                              {step.isResolved ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Remediated
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 fill-current" />
                                  Execute Remediation
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-150 bg-slate-50 flex items-center justify-between z-10">
                <span className="text-[10px] text-slate-400 font-mono">ID: SEC-SCORE-094-TLS</span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Dismiss Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

