import React, { useState, useEffect } from 'react';
import { 
  FileText, Send, CheckCircle2, AlertCircle, Loader2, Download, 
  Search, Filter, Plus, ShieldCheck, Printer, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface PenaltyInvoice {
  id: string;
  regulator_id: number;
  enterprise_id: string;
  enterprise_name: string;
  violation_id: string;
  amount_cents: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issued_at: string;
  due_at: string;
  legal_hash?: string;
  commission_fee_cents: number;
}

export const RegulatorPenaltyInvoiceManager: React.FC<{ regulatorId: number }> = ({ regulatorId }) => {
  const { showToast } = useNotification();
  const [invoices, setInvoices] = useState<PenaltyInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);
  const [search, setSearch] = useState('');
  
  // New Invoice Form State
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    enterprise_id: '',
    enterprise_name: '',
    violation_id: '',
    amount_eur: 0,
    due_days: 30
  });

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/finance/regulator/${regulatorId}/invoices`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [regulatorId]);

  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    try {
      const res = await fetch(`/api/v1/finance/regulator/${regulatorId}/issue-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enterpriseId: newInvoiceData.enterprise_id,
          enterpriseName: newInvoiceData.enterprise_name,
          violationId: newInvoiceData.violation_id,
          amountCents: newInvoiceData.amount_eur * 100,
          dueDays: newInvoiceData.due_days
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewInvoice(false);
        fetchInvoices();
        showToast('Penalty Invoice issued successfully with immutable legal hash.', 'success');
      }
    } catch (err) {
      console.error('Failed to issue invoice:', err);
    } finally {
      setIsIssuing(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.enterprise_name.toLowerCase().includes(search.toLowerCase()) ||
    inv.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalCommission = invoices.reduce((sum, inv) => sum + (inv.commission_fee_cents || 0), 0) / 100;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Regulatory Penalty & Commission Treasury
          </h2>
          <p className="text-sm text-slate-500">Manage penalties and track regulator commission revenue.</p>
        </div>
        <button 
          onClick={() => setShowNewInvoice(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all border-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Issue New Penalty
        </button>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Collection</div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            €{(invoices.filter(i => i.status === 'PENDING').reduce((acc, i) => acc + i.amount_cents, 0) / 100).toLocaleString()}
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">Total Commission</div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            €{totalCommission.toLocaleString()}
          </div>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-xs">
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-widest mb-1">Overdue Penalty</div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            €{(invoices.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount_cents, 0) / 100).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by enterprise or invoice ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Enterprise</th>
                <th className="px-6 py-4">Violation Ref</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                    <span className="text-slate-400 font-medium">Synchronizing with legal financial ledger...</span>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No penalty invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{inv.id.substring(0, 12)}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">{inv.enterprise_name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{inv.violation_id}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-slate-900">
                      €{(inv.amount_cents / 100).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                        inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500">
                      {new Date(inv.due_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border-0 bg-transparent cursor-pointer" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 transition-colors border-0 bg-transparent cursor-pointer" title="Legal Audit Trail">
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {showNewInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  Official Penalty Issuance
                </h3>
                <button onClick={() => setShowNewInvoice(false)} className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleIssueInvoice} className="p-5 sm:p-6 lg:p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise ID</label>
                    <input 
                      type="text" 
                      required
                      value={newInvoiceData.enterprise_id}
                      onChange={e => setNewInvoiceData(prev => ({...prev, enterprise_id: e.target.value}))}
                      placeholder="org_..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise Name</label>
                    <input 
                      type="text" 
                      required
                      value={newInvoiceData.enterprise_name}
                      onChange={e => setNewInvoiceData(prev => ({...prev, enterprise_name: e.target.value}))}
                      placeholder="Tech Corp Ltd."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Violation Reference ID</label>
                  <input 
                    type="text" 
                    required
                    value={newInvoiceData.violation_id}
                    onChange={e => setNewInvoiceData(prev => ({...prev, violation_id: e.target.value}))}
                    placeholder="VIO-2026-..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Penalty Amount (EUR)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={newInvoiceData.amount_eur}
                      onChange={e => setNewInvoiceData(prev => ({...prev, amount_eur: Number(e.target.value)}))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Due Days</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={newInvoiceData.due_days}
                      onChange={e => setNewInvoiceData(prev => ({...prev, due_days: Number(e.target.value)}))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="pt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    By issuing this penalty, an immutable financial entry will be created in the Sovereign Ledger. 
                    A SHA-256 legal hash will be generated to ensure non-repudiation of this fine.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowNewInvoice(false)}
                    className="flex-1 px-4 sm:px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all border-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isIssuing}
                    className="flex-[2] px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all border-0 cursor-pointer disabled:opacity-50"
                  >
                    {isIssuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Confirm & Issue Penalty
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
