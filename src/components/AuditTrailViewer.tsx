import React from "react";
import { ShieldCheck, History, Landmark, Lock, FileCheck2 } from "lucide-react";
import { AuditTrail } from "./AuditTrail";

export const AuditTrailViewer: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Executive Ledger Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 text-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Sovereign Audit Ledger &amp; Enforcement Trail</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Continuous Attestation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Statutory ledger recording system changes, access events, automated guardrail triggers, and regulatory enforcement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Ledger Node</span>
              <span className="text-white font-bold">node-fra-01.sovereign</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Retention</span>
              <span className="text-emerald-400 font-bold">365 Days (WORM)</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Tamper Proof</span>
              <span className="text-cyan-400 font-bold">Kyber-1024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Audit Trail Component */}
      <AuditTrail maxHeight="max-h-[640px]" />
    </div>
  );
};

export default AuditTrailViewer;
