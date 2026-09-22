import React, { useState } from "react";
import { Cpu, ShieldCheck, Activity, Radio, Sparkles, CheckCircle2 } from "lucide-react";

export const AutonomousComplianceCenter: React.FC<any> = ({ className = "" }) => {
  const [agentStatus, setAgentStatus] = useState("ACTIVE_MONITORING");
  const [eventsCount, setEventsCount] = useState(14890);

  const toggleAgent = () => {
    setAgentStatus((prev) => (prev === "ACTIVE_MONITORING" ? "PAUSED" : "ACTIVE_MONITORING"));
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Autonomous Compliance Orchestrator
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Live Enclave
              </span>
            </h3>
            <p className="text-xs text-slate-400">Continuous AI agent evaluating multi-jurisdiction compliance</p>
          </div>
        </div>

        <button
          onClick={toggleAgent}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            agentStatus === "ACTIVE_MONITORING"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          {agentStatus === "ACTIVE_MONITORING" ? "Agent Active" : "Resume Agent"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] text-slate-400">Monitored Inbound Stream</div>
          <div className="text-lg font-mono font-bold text-white mt-0.5">{eventsCount.toLocaleString()} req/s</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] text-slate-400">Autopilot Enforcement</div>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">0.02ms Latency</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] text-slate-400">Model Verification</div>
          <div className="text-lg font-mono font-bold text-indigo-400 mt-0.5">Kyber-1024 HSM</div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousComplianceCenter;
