import React, { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export const ComplianceRiskDashboard: React.FC<any> = ({ className = "" }) => {
  const [riskItems, setRiskItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/compliance/risk-dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRiskItems(data.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Sovereign Compliance Risk Heatmap</h3>
          <p className="text-xs text-slate-400">Continuous risk quantification across regulatory frameworks</p>
        </div>
      </div>

      <div className="space-y-2">
        {riskItems.map((item) => (
          <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{item.framework}</div>
              <div className="text-[10px] text-slate-400 font-mono">{item.id} • {item.label}</div>
            </div>

            <div className="text-right">
              <div className="text-sm font-mono font-bold text-emerald-400">{item.riskScore}/100</div>
              <div className="text-[10px] text-emerald-400 font-bold">{item.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceRiskDashboard;
