import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  Search,
  Filter,
  Download,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface AuditRecord {
  id: string;
  levelKey: string;
  mode: string;
  status: string;
  caseRef: string;
  executedAt: string;
  payload: any;
}

export const EnforcementAuditLedger: React.FC = () => {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await fetch('/api/v1/enforcement/audit');
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error('Failed to fetch audit ledger:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudit();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by case, actor or level..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Enforcement Action</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actor / Case</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Fetching Audit Records...</p>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium">No audit records found.</p>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        record.status === 'executed' ? 'bg-emerald-50' : 
                        record.status === 'pending_approval' ? 'bg-amber-50' : 'bg-slate-50'
                      }`}>
                        <FileText className={`w-4 h-4 ${
                          record.status === 'executed' ? 'text-emerald-600' : 
                          record.status === 'pending_approval' ? 'text-amber-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{record.levelKey}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{record.mode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">{record.caseRef || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black ${
                      record.status === 'executed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      record.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        record.status === 'executed' ? 'bg-emerald-500' :
                        record.status === 'pending_approval' ? 'bg-amber-500' : 'bg-slate-500'
                      }`} />
                      <span>{record.status.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{new Date(record.executedAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all text-slate-400 hover:text-slate-900">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && records.length > 0 && (
        <div className="p-4 sm:p-5 lg:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Showing {records.length} events</span>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 hover:bg-white disabled:opacity-30" disabled>
              Previous
            </button>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-white">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
