import React, { useState } from "react";
import { ShieldAlert, Zap, Lock, Eye, Play, CheckCircle } from "lucide-react";

export const AutomatedEnforcementEngine: React.FC<any> = ({ className = "" }) => {
  const [executionMode, setExecutionMode] = useState("AUTO_BLOCK");
  const [activeRules, setActiveRules] = useState([
    { id: "RULE-101", name: "GDPR Cross-Border PII Leak Intercept", triggerCount: 142, status: "ACTIVE" },
    { id: "RULE-102", name: "AI Act High-Risk Unregistered Model Block", triggerCount: 19, status: "ACTIVE" },
    { id: "RULE-103", name: "DORA Critical Provider Failover Enforce", triggerCount: 3, status: "ACTIVE" }
  ]);
  const [executing, setExecuting] = useState(false);

  const handleTestTrigger = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setActiveRules((prev) =>
        prev.map((r, i) => i === 0 ? { ...r, triggerCount: r.triggerCount + 1 } : r)
      );
    }, 1000);
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Automated Policy Enforcement Engine</h3>
            <p className="text-xs text-slate-400">Zero-trust real-time traffic interception and regulatory enforcement</p>
          </div>
        </div>

        <button
          onClick={handleTestTrigger}
          disabled={executing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow-md shadow-amber-600/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {executing ? "Intercepting..." : "Simulate Intercept"}
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Enforcement Strategy Mode:</span>
        </div>
        <select
          value={executionMode}
          onChange={(e) => setExecutionMode(e.target.value)}
          className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-semibold focus:outline-none"
        >
          <option value="AUTO_BLOCK">Automated Hard Block & Quarantine</option>
          <option value="SOFT_QUARANTINE">Soft Quarantine with Alert</option>
          <option value="SHADOW_AUDIT">Shadow Mode (Log Only)</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Policy Rules</div>
        {activeRules.map((rule) => (
          <div key={rule.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">{rule.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{rule.id}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-amber-400">{rule.triggerCount} Intercepts</div>
              <div className="text-[10px] text-emerald-400 font-semibold">{rule.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomatedEnforcementEngine;
