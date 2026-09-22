import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Building2, 
  FileText, 
  RefreshCw,
  Download,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface SettlementInvoice {
  id: string;
  entityName: string;
  type: 'Administrative Fine' | 'Statutory Audit Fee' | 'CaaS Subscription';
  amount: number;
  status: 'SETTLED' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  jurisdiction: string;
}

const mockInvoices: SettlementInvoice[] = [
  {
    id: 'INV-2026-901',
    entityName: 'AeroNordic Logistics SE',
    type: 'CaaS Subscription',
    amount: 14500,
    status: 'SETTLED',
    dueDate: '2026-08-31',
    jurisdiction: 'DE (BfDI)'
  },
  {
    id: 'INV-2026-902',
    entityName: 'VoxelAI Cognitive Robotics Oy',
    type: 'Administrative Fine',
    amount: 850000,
    status: 'PENDING',
    dueDate: '2026-09-28',
    jurisdiction: 'FI (Tietosuoja)'
  },
  {
    id: 'INV-2026-903',
    entityName: 'EuroFintech Settlement Bank N.V.',
    type: 'Statutory Audit Fee',
    amount: 32000,
    status: 'SETTLED',
    dueDate: '2026-08-15',
    jurisdiction: 'NL (AP)'
  }
];

export const PaymentCollectionPortal: React.FC = () => {
  const { showToast } = useNotification();
  const [invoices, setInvoices] = useState<SettlementInvoice[]>(mockInvoices);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSettle = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'SETTLED' } : inv));
      setProcessingId(null);
      showToast(`Settlement successful via EU Central Bank / SEPA Instant Sovereign Gateway for ${id}`, 'success');
    }, 800);
  };

  const totalSettled = invoices.filter(i => i.status === 'SETTLED').reduce((acc, i) => acc + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">EU Regulatory Fine Collection &amp; Settlement Treasury</h3>
            <p className="text-xs text-slate-400">SEPA Instant, TARGET2 sovereign settlement, and statutory escrow disbursement ledger.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono">
          ECB TARGET2 Verified Gateway
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Total Treasury Recoveries</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            €{totalSettled.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Directly disbursed to Member State funds</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Pending Escrow Collections</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
            €{totalPending.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Under statutory settlement timeframe</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="text-xs font-medium text-slate-400">Audit Proof Timestamp</div>
          <div className="text-sm font-bold text-white font-mono mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            ISO 20022 Compliant
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Zero payment dispute rate</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Invoice &amp; Docket</th>
              <th className="px-4 py-3">Entity Legal Name</th>
              <th className="px-4 py-3">Collection Category</th>
              <th className="px-4 py-3">Amount (€ EUR)</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Settlement Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-white">{inv.id}</td>
                <td className="px-4 py-3 font-semibold text-slate-200">{inv.entityName}</td>
                <td className="px-4 py-3 text-slate-400">{inv.type}</td>
                <td className="px-4 py-3 font-mono font-bold text-white">€{inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-400">{inv.dueDate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    inv.status === 'SETTLED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    inv.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {inv.status === 'PENDING' ? (
                    <button
                      type="button"
                      disabled={processingId === inv.id}
                      onClick={() => handleSettle(inv.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {processingId === inv.id ? 'Settling...' : 'Settle Now'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => showToast(`Downloaded Settlement Receipt PDF for ${inv.id}`, 'info')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentCollectionPortal;
