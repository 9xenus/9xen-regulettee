import React, { useState } from "react";
import { Sliders, Plus, Save, Trash2, Zap, ShieldCheck } from "lucide-react";

export interface CustomAddonPayload {
  id?: string;
  name: string;
  category: string;
  actId?: string;
  lawActName?: string;
  description?: string;
  price?: string;
  priceType?: string;
  numericPriceEur?: number;
  slug?: string;
  jurisdiction?: string;
  region?: string;
  industryVertical?: string;
  legalCitation?: string;
  enforcingAuthority?: string;
  statutoryDirectives?: string;
  maxStatutoryFine?: string;
  criticalFeatures?: any;
  endpointUrl?: string;
  apiKey?: string;
  rules?: any[];
  [key: string]: any;
}

export const SaaSAddonRuleEngineBuilder: React.FC<any> = ({ className = "" }) => {
  const [rules, setRules] = useState([
    { id: "R1", condition: "HTTP_HEADER.contains('x-pii-exposure')", action: "BLOCK_AND_LOG", threshold: "STRICT" },
    { id: "R2", condition: "AI_MODEL_INFERENCE_RISK > 0.8", action: "QUARANTINE_ENCLAVE", threshold: "HIGH" }
  ]);

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">SaaS Add-On Rule Engine Builder</h3>
          <p className="text-xs text-slate-400">Visual rule builder for automated regulatory policy enforcement</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {rules.map((r, i) => (
          <div key={r.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400">Rule 0{i + 1}: IF {r.condition}</div>
              <div className="text-xs font-semibold text-emerald-400 mt-0.5">THEN EXECUTE: {r.action}</div>
            </div>
            <button
              onClick={() => setRules(rules.filter((item) => item.id !== r.id))}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaaSAddonRuleEngineBuilder;
