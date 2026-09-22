import React, { useState } from "react";
import { Link2, CheckCircle2, RefreshCw, Layers, ShieldCheck } from "lucide-react";

export const ComplianceOpsIntegrator: React.FC<any> = ({ className = "" }) => {
  const [integrations, setIntegrations] = useState([
    { id: "INT-1", name: "AWS CloudTrail EU-Central", type: "CLOUD_AUDIT", status: "CONNECTED" },
    { id: "INT-2", name: "Datadog Security Signals", type: "SIEM_LOGS", status: "CONNECTED" },
    { id: "INT-3", name: "Jira Service Desk (DSAR Ticket Ingestion)", type: "WORKFLOW", status: "CONNECTED" }
  ]);

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Link2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">ComplianceOps Integration Enclave</h3>
          <p className="text-xs text-slate-400">Stream SIEM, CloudTrail, and ITSM signals directly into sovereign engine</p>
        </div>
      </div>

      <div className="space-y-2">
        {integrations.map((int) => (
          <div key={int.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">{int.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{int.type}</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {int.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceOpsIntegrator;
