import React from 'react';
import { Award, ShieldCheck, CheckCircle2, FileCheck } from 'lucide-react';

export const DpoReadinessBadge: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-700/50 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
            <Award className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Certified EU DPO Readiness
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-[11px] text-indigo-200">Article 37-39 GDPR Statutory Officer Compliance</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
          PASSED (100%)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-800/60 text-center">
        <div className="p-2 bg-white/5 rounded-lg">
          <div className="text-[10px] font-mono text-indigo-300">ROPA Registry</div>
          <div className="text-xs font-bold text-white">Art. 30 Validated</div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">
          <div className="text-[10px] font-mono text-indigo-300">DPIA Audits</div>
          <div className="text-xs font-bold text-white">Art. 35 Certified</div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">
          <div className="text-[10px] font-mono text-indigo-300">DPA Conduit</div>
          <div className="text-xs font-bold text-white">CNIL / BfDI Sync</div>
        </div>
      </div>
    </div>
  );
};
export default DpoReadinessBadge;
