import React, { useState } from "react";
import { Award, Copy, Check, ShieldCheck, Download, Sparkles } from "lucide-react";

export const BadgeGenerator: React.FC<any> = ({ className = "" }) => {
  const [badgeType, setBadgeType] = useState("GDPR_VERIFIED");
  const [copied, setCopied] = useState(false);

  const embedCode = `<a href="https://regulettee.eu/verify/org_1" target="_blank" rel="noopener">
  <img src="https://img.shields.io/badge/9Xen_Regulettee-${badgeType}-emerald?style=for-the-badge&logo=shield" alt="9Xen Verified Compliance Badge" />
</a>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Sovereign Compliance Badge Generator</h3>
          <p className="text-xs text-slate-400">Generate embeddable real-time verified trust seals for your customer web portals</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Badge Verification Seal</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "GDPR_VERIFIED", label: "GDPR Article 30 Certified" },
              { id: "EU_AI_ACT_HIGH_RISK", label: "EU AI Act Compliant" },
              { id: "DORA_ICT_RESILIENT", label: "DORA ICT Certified" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBadgeType(b.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  badgeType === b.id
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Badge Preview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-md bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2 shadow-sm">
              <ShieldCheck className="w-4 h-4" /> 9Xen Regulettee | {badgeType}
            </div>
            <span className="text-[10px] text-slate-400">Verified by Cryptographic Ledger</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied HTML!" : "Copy HTML"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeGenerator;
