import React, { useState } from "react";
import { Activity, ShieldCheck, Cpu, AlertTriangle, FileText, Download, CheckCircle2, CreditCard } from "lucide-react";

export const ClientDashboard: React.FC<any> = ({ className = "" }) => {
  const [tenantName] = useState("Acme Corporation Europe SA");

  return (
    <div className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {tenantName}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Tier 1 Sovereign Enclave
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Sovereign Compliance Command & Telemetry Center</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Readiness Score</div>
            <div className="text-xl font-bold font-mono text-emerald-400">98.4%</div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">GDPR Compliance</div>
          <div className="text-base font-mono font-bold text-emerald-400">99.2%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">EU AI Act Enclave</div>
          <div className="text-base font-mono font-bold text-indigo-400">96.0%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">DORA ICT Resilience</div>
          <div className="text-base font-mono font-bold text-cyan-400">100.0%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Active Intercepts</div>
          <div className="text-base font-mono font-bold text-amber-400">0 Alerts</div>
        </div>
      </div>

      {/* Subscription Summary */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Family Defense Plus Plan</div>
            <div className="text-xs text-emerald-400">Active - Renews October 1, 2026</div>
          </div>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
          Manage Subscription
        </button>
      </div>
    </div>
  );
};

export default ClientDashboard;
