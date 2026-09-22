import React, { useState } from "react";
import { Calculator, ShieldAlert, CheckCircle2 } from "lucide-react";

export const DataProcessingRiskCalculator: React.FC<any> = ({ className = "" }) => {
  const [dataVolume, setDataVolume] = useState("MEDIUM");
  const [hasSpecialCategory, setHasSpecialCategory] = useState(true);
  const [crossBorder, setCrossBorder] = useState(false);

  const calculateScore = () => {
    let base = 10;
    if (dataVolume === "HIGH") base += 35;
    if (dataVolume === "MEDIUM") base += 20;
    if (hasSpecialCategory) base += 30;
    if (crossBorder) base += 25;
    return Math.min(base, 100);
  };

  const score = calculateScore();

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">DPIA Risk Calculator</h3>
          <p className="text-xs text-slate-400">GDPR Article 35 Data Protection Impact Assessment Calculator</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Data Processing Volume</label>
          <select
            value={dataVolume}
            onChange={(e) => setDataVolume(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="LOW">Low (&lt; 1,000 Records)</option>
            <option value="MEDIUM">Medium (1,000 - 100,000 Records)</option>
            <option value="HIGH">High (&gt; 100,000 Records)</option>
          </select>
        </div>

        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
          <span className="text-xs font-medium text-slate-200">Article 9 Special Category PII (Biometric, Health, Financial)</span>
          <input
            type="checkbox"
            checked={hasSpecialCategory}
            onChange={(e) => setHasSpecialCategory(e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
          />
        </label>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div className="text-xs font-bold text-slate-300">Calculated DPIA Risk Score:</div>
        <div className={`text-base font-mono font-bold ${score > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {score}/100 {score > 50 ? '(DPIA Mandatory)' : '(Low Risk)'}
        </div>
      </div>
    </div>
  );
};

export default DataProcessingRiskCalculator;
