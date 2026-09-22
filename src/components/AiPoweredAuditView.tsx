import React, { useState } from "react";
import { Brain, AlertTriangle, CheckCircle, Shield, FileText, Sparkles, RefreshCw } from "lucide-react";

export const AiPoweredAuditView: React.FC<any> = ({ className = "" }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [findings] = useState([
    {
      id: "AUD-801",
      framework: "EU AI Act (Annex IV)",
      issue: "Post-market monitoring enclaves missing continuous telemetry pipeline",
      risk: "HIGH",
      confidence: "98.4%",
      recommendation: "Inject automated telemetry webhook with Kyber-1024 lattice signature."
    },
    {
      id: "AUD-802",
      framework: "GDPR (Article 30)",
      issue: "Cross-border data flow detected without explicit Article 46 SCC safeguards",
      risk: "CRITICAL",
      confidence: "99.1%",
      recommendation: "Enforce strict local sovereign routing or attach verified EU SCC metadata."
    },
    {
      id: "AUD-803",
      framework: "DORA (ICT Resilience)",
      issue: "Secondary data center failover test exceeded 15-minute SLA benchmark",
      risk: "MEDIUM",
      confidence: "94.2%",
      recommendation: "Optimize automated container replication routes to Frankfurt node."
    }
  ]);

  const handleRunAudit = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI-Powered Audit & Compliance Diagnostic
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini 2.5
              </span>
            </h3>
            <p className="text-xs text-slate-400">Autonomous deep neural inspection across regulatory frameworks</p>
          </div>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={analyzing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? "animate-spin" : ""}`} />
          {analyzing ? "Analyzing..." : "Re-Run AI Audit"}
        </button>
      </div>

      <div className="space-y-3">
        {findings.map((finding) => (
          <div key={finding.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">{finding.id}</span>
                <span className="text-xs font-semibold text-purple-300">{finding.framework}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                finding.risk === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                finding.risk === "HIGH" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-sky-500/10 text-sky-400 border border-sky-500/20"
              }`}>
                {finding.risk} RISK
              </span>
            </div>

            <p className="text-xs font-medium text-slate-200">{finding.issue}</p>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60 text-[11px] text-slate-300 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-purple-300">AI Recommendation (Confidence: {finding.confidence}): </span>
                {finding.recommendation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiPoweredAuditView;
