import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Building2, 
  RefreshCw, 
  Download,
  ShieldCheck
} from 'lucide-react';

export const TreasurySettlement: React.FC = () => {
  const [balance] = useState(4820000);
  const [disbursed] = useState(3150000);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">EU Treasury &amp; Statutory Settlement Ledger</h3>
            <p className="text-xs text-slate-400">Disbursement of administrative fines to national authorities and CaaS ecosystem partners.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono">
          SEPA Instant / TARGET2
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Escrow Balance in Custody</div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">€{balance.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 mt-2">100% backed in European Central Bank accounts</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Total Statutory Disbursed (YTD)</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">€{disbursed.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-2">Across 27 Member State treasuries</div>
        </div>
      </div>
    </div>
  );
};

export default TreasurySettlement;
