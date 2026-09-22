import React from 'react';
import { CreditCard, Download, CheckCircle2, FileText } from 'lucide-react';

interface Invoice {
  id: string;
  period: string;
  amount: string;
  status: 'PAID' | 'PROCESSING';
  date: string;
}

export interface InvoiceHistoryProps {
  userEmail?: any;
  [key: string]: any;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = () => {
  const invoices: Invoice[] = [
    { id: 'INV-2026-09', period: 'Sep 2026', amount: '€4,900.00', status: 'PAID', date: '2026-09-01' },
    { id: 'INV-2026-08', period: 'Aug 2026', amount: '€4,900.00', status: 'PAID', date: '2026-08-01' },
    { id: 'INV-2026-07', period: 'Jul 2026', amount: '€4,900.00', status: 'PAID', date: '2026-07-01' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">SaaS Billing & Invoices</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Enterprise CaaS Subscription Ledger</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
          Enterprise Tier
        </span>
      </div>

      <div className="space-y-2">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {inv.id} ({inv.period})
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Billed on {inv.date}</div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-slate-900 dark:text-white">{inv.amount}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                {inv.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default InvoiceHistory;
