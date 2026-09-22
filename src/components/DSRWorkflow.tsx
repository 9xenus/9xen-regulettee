import React, { useState } from "react";
import { UserCheck, Shield, Clock, CheckCircle2, FileText } from "lucide-react";

export const DSRWorkflow: React.FC<any> = ({ className = "" }) => {
  const [dsrRequests, setDsrRequests] = useState([
    { id: "DSAR-901", type: "Article 17 Right to Erasure", subject: "user_8912@domain.com", status: "PROCESSING", deadline: "28 Days Remaining" },
    { id: "DSAR-902", type: "Article 15 Right of Access", subject: "client_4410@firm.de", status: "COMPLETED", deadline: "Fulfilled" }
  ]);

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Data Subject Access Request (DSAR) Portal</h3>
          <p className="text-xs text-slate-400">Automated GDPR Article 15-22 Subject Rights fulfillment workflow</p>
        </div>
      </div>

      <div className="space-y-2">
        {dsrRequests.map((dsar) => (
          <div key={dsar.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{dsar.type}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{dsar.id} • {dsar.subject}</div>
            </div>

            <div className="text-right">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                dsar.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {dsar.status}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">{dsar.deadline}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DSRWorkflow;
