import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ActionableMitigationProps {
  severityScore: number; // 0 to 10
  vulnerabilityDescription: string;
}

export const ActionableMitigation: React.FC<ActionableMitigationProps> = ({
  severityScore,
  vulnerabilityDescription
}) => {
  const [mitigated, setMitigated] = useState(false);

  const getSeverityBadge = (score: number) => {
    if (score >= 7) return { label: 'CRITICAL EXPOSURE', bg: 'bg-rose-500 text-white' };
    if (score >= 4) return { label: 'HIGH EXPOSURE', bg: 'bg-amber-500 text-white' };
    return { label: 'LOW EXPOSURE', bg: 'bg-emerald-500 text-white' };
  };

  const badge = getSeverityBadge(severityScore);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Automated Risk Mitigation Recommendation</h4>
            <p className="text-[11px] text-slate-400">EU DPA Enforcement Countermeasure Engine</p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold ${badge.bg}`}>
          {badge.label} ({severityScore.toFixed(1)}/10)
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
        {vulnerabilityDescription}
      </p>

      <div className="space-y-2 text-xs">
        <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">Recommended Playbook Actions:</span>
        <div className="space-y-1.5">
          <div className="p-2 bg-slate-800/80 rounded-lg flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Enforce AES-256-GCM zero-trust field encryption on PII tables
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Auto-Deployable</span>
          </div>

          <div className="p-2 bg-slate-800/80 rounded-lg flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Update GDPR Art. 30 Records of Processing Activities (ROPA)
            </span>
            <span className="text-[10px] font-mono text-indigo-400 font-bold">PDF Ready</span>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        {mitigated ? (
          <div className="px-4 py-2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Mitigation Safeguards Applied
          </div>
        ) : (
          <button
            onClick={() => setMitigated(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4" /> Trigger Auto-Remediation Playbook
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionableMitigation;
