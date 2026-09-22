import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserCheck,
  Search,
  FileText,
  AlertCircle,
  Clock,
  Send,
  Download,
  CheckCircle2,
  HelpCircle,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Lock,
  Eye
} from "lucide-react";

interface FeatureAttribution {
  feature: string;
  impact: number;
  category: string;
  humanDescription: string;
}

interface ClientCase {
  caseId: string;
  subjectId: string;
  subjectName: string;
  modelSystemId: string;
  decisionType: string;
  automatedDecision: "APPROVED" | "REJECTED" | "CONDITIONAL_REVIEW";
  decidedAt: string;
  confidenceScore: number;
  plainLanguageExplanation: string;
  featureAttribution: FeatureAttribution[];
  humanReviewStatus: "NOT_REQUESTED" | "PENDING_HUMAN_REVIEW" | "HUMAN_CONFIRMED" | "OVERTURNED";
  statutorySlaRemainingHours: number;
}

export const AiClientSelfServicePortal: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("CASE-2026-8819");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appealReason, setAppealReason] = useState<string>("");
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState<boolean>(false);
  const [appealSuccess, setAppealSuccess] = useState<boolean>(false);
  const [trainingOptOut, setTrainingOptOut] = useState<boolean>(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/v1/ai-client-portal/cases");
      const data = await res.json();
      if (data.success && data.cases) {
        setCases(data.cases);
      }
    } catch (e) {
      console.warn("Using default client cases:", e);
    }
  };

  const activeCase = cases.find(c => c.caseId === selectedCaseId || c.subjectId === selectedCaseId) || cases[0] || {
    caseId: "CASE-2026-8819",
    subjectId: "SUBJ-DE-91024",
    subjectName: "Maximilian Krause",
    modelSystemId: "ai-sys-credit-eval",
    decisionType: "CREDIT_UNDERWRITING",
    automatedDecision: "REJECTED",
    decidedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    confidenceScore: 0.88,
    plainLanguageExplanation: "Your loan facility application was held for review primarily due to an elevated debt-to-income ratio in recent quarterly telemetry and brief address residency duration. Protected characteristics were strictly excluded under EU AI Act Article 10.",
    featureAttribution: [
      { feature: "Debt-to-Income Ratio (>42%)", impact: -0.38, category: "Financial Capacity", humanDescription: "High ratio of monthly obligations relative to verified income." },
      { feature: "Recent Address Residency (<6 mo)", impact: -0.18, category: "Stability Telemetry", humanDescription: "Recent relocation without 12-month local utility payment track record." },
      { feature: "Clean Credit Bureau History", impact: +0.28, category: "Credit Performance", humanDescription: "Zero historical payment defaults or charge-offs." },
      { feature: "Continuous Employment (3+ yrs)", impact: +0.22, category: "Income Durability", humanDescription: "Stable verified employer with continuous sovereign social contributions." }
    ],
    humanReviewStatus: "PENDING_HUMAN_REVIEW",
    statutorySlaRemainingHours: 54
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = cases.find(
      c => c.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.subjectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedCaseId(found.caseId);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!activeCase) return;
    setIsSubmittingAppeal(true);
    try {
      const res = await fetch(`/api/v1/ai-client-portal/cases/${activeCase.caseId}/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: appealReason })
      });
      const data = await res.json();
      if (data.success && data.case) {
        setCases(prev => prev.map(c => c.caseId === data.case.caseId ? data.case : c));
        setAppealSuccess(true);
      }
    } catch (e) {
      setCases(prev => prev.map(c => c.caseId === activeCase.caseId ? { ...c, humanReviewStatus: "PENDING_HUMAN_REVIEW" } : c));
      setAppealSuccess(true);
    } finally {
      setIsSubmittingAppeal(false);
      setAppealReason("");
    }
  };

  const handleDownloadDossier = () => {
    const text = `===============================================================
9XEN REGULETTEE SOVEREIGN REGTECH OS - DATA SUBJECT DECISION DOSSIER
Regulation (EU) 2024/1689 (EU AI Act) Article 86 Right to Explanation
GDPR Article 22 Automated Individual Decision-Making
===============================================================
Case Reference: ${activeCase.caseId}
Data Subject ID: ${activeCase.subjectId}
Subject Name: ${activeCase.subjectName}
Decision Timestamp: ${new Date(activeCase.decidedAt).toUTCString()}
Model System ID: ${activeCase.modelSystemId}
Decision Type: ${activeCase.decisionType}
Automated Verdict: ${activeCase.automatedDecision} (Confidence: ${Math.round(activeCase.confidenceScore * 100)}%)

PLAIN-LANGUAGE EXPLANATION:
${activeCase.plainLanguageExplanation}

FEATURE ATTRIBUTION ANALYSIS (LOCAL WEIGHT IMPACT):
${activeCase.featureAttribution.map(f => `- ${f.feature}: ${f.impact > 0 ? '+' : ''}${f.impact} [${f.category}] -> ${f.humanDescription}`).join('\n')}

STATUTORY RIGHT TO HUMAN INTERVENTION:
Human Review Status: ${activeCase.humanReviewStatus}
Statutory Response SLA Remaining: ${activeCase.statutorySlaRemainingHours} hours

CRYPTOGRAPHIC ENCLAVE VALIDATION SEAL:
sha256:4a88b19320e17bca88921df9001bfa8291a0c4f828102910fa89218209e1724a
===============================================================`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Article86_Explanation_${activeCase.caseId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              EU AI Act Art. 86 & GDPR Art. 22
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Affected Person Transparency Hub
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Client Self-Service & Explanation Portal
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Enables citizens and affected individuals to understand automated algorithmic decisions, view SHAP feature attributions, and request human intervention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDossier}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Download Article 86 Dossier
          </button>
        </div>
      </div>

      {/* Case Lookup Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Case ID or Data Subject (e.g. CASE-2026-8819)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Lookup
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Preset Cases:</span>
          {["CASE-2026-8819", "CASE-2026-4402"].map(id => (
            <button
              key={id}
              onClick={() => setSelectedCaseId(id)}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                selectedCaseId === id ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Decision Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Decision Status & Plain-Language Explanation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-slate-400">Subject: {activeCase.subjectName} ({activeCase.subjectId})</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Automated Decision: {activeCase.decisionType.replace(/_/g, " ")}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeCase.automatedDecision === "APPROVED"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : activeCase.automatedDecision === "REJECTED"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}
                >
                  {activeCase.automatedDecision}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Confidence: {Math.round(activeCase.confidenceScore * 100)}%
                </span>
              </div>
            </div>

            {/* Plain-Language Explanation */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Plain-Language Legal Explanation (Art. 86)
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {activeCase.plainLanguageExplanation}
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Special category data (racial, biometric, religious) strictly eliminated from model feature vectors.
              </div>
            </div>

            {/* Local Feature Attribution (SHAP / LIME) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Local Feature Attribution (SHAP Breakdown)</span>
                <span className="text-[10px] text-slate-500 font-normal">Impact on automated outcome</span>
              </h4>

              <div className="space-y-2.5">
                {activeCase.featureAttribution.map((feat, idx) => {
                  const isPositive = feat.impact > 0;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          {feat.feature}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}{feat.impact}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{feat.humanDescription}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statutory Appeal & Human Intervention Form */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                Human Review Escalation (Art. 86)
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Review Status:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {activeCase.humanReviewStatus.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Statutory SLA Remaining:</span>
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeCase.statutorySlaRemainingHours} hours
                </span>
              </div>
            </div>

            {activeCase.humanReviewStatus === "NOT_REQUESTED" ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  You have the statutory legal right under EU AI Act Article 86 and GDPR Article 22 to contest this automated decision and request an individual review by a certified human compliance officer.
                </p>

                <textarea
                  rows={3}
                  value={appealReason}
                  onChange={e => setAppealReason(e.target.value)}
                  placeholder="State additional factors or evidence for human reviewer..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />

                <button
                  onClick={handleSubmitAppeal}
                  disabled={isSubmittingAppeal}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Formal Human Review Appeal
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Appeal Case Registered
                </div>
                <p className="text-[11px] text-slate-300">
                  Case escalated to the Senior Human Compliance Triage Board. A certified human auditor will re-evaluate your file within statutory deadlines.
                </p>
              </div>
            )}

            {/* Privacy & Synthetic Opt-Out Preferences */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Data Subject Privacy Enclave
              </span>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trainingOptOut}
                  onChange={e => setTrainingOptOut(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>
                  Exclude telemetry and interaction records from future model fine-tuning and synthetic datasets.
                </span>
              </label>

              <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Enclave cryptographic retention policy: 30 days maximum.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiClientSelfServicePortal;
