import React, { useState } from 'react';
import { ShieldCheck, UserCheck, CheckCircle2, XCircle, Clock, Search, Filter, RefreshCw, FileText } from 'lucide-react';

interface VerificationRecord {
  id: string;
  tenantName: string;
  userEmail: string;
  type: 'KYC' | 'EMAIL' | 'SMS' | '2FA_HARDWARE';
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  submittedAt: string;
  verifiedAt?: string;
  verifier: string;
}

interface SaasAdminVerificationManagerProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const SaasAdminVerificationManager: React.FC<SaasAdminVerificationManagerProps> = ({ isModal, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const [records, setRecords] = useState<VerificationRecord[]>([
    {
      id: 'VER-901',
      tenantName: 'Acme Health EU',
      userEmail: 'compliance@acmehealth.eu',
      type: 'KYC',
      status: 'VERIFIED',
      submittedAt: '2026-03-01 10:30',
      verifiedAt: '2026-03-01 11:15',
      verifier: 'Automated AI + DPO Agent'
    },
    {
      id: 'VER-902',
      tenantName: 'FinTech Dynamics',
      userEmail: 'dpo@fintechdynamics.de',
      type: '2FA_HARDWARE',
      status: 'VERIFIED',
      submittedAt: '2026-03-02 09:12',
      verifiedAt: '2026-03-02 09:14',
      verifier: 'YubiKey Hardware Auth'
    },
    {
      id: 'VER-903',
      tenantName: 'BioData Solutions',
      userEmail: 'admin@biodata.fr',
      type: 'KYC',
      status: 'PENDING',
      submittedAt: '2026-03-03 08:45',
      verifier: 'Pending SuperAdmin Review'
    },
    {
      id: 'VER-904',
      tenantName: 'Sovereign Bank NV',
      userEmail: 'sec@sovereignbank.nl',
      type: 'EMAIL',
      status: 'VERIFIED',
      submittedAt: '2026-03-02 14:20',
      verifiedAt: '2026-03-02 14:21',
      verifier: 'SMTP DKIM Auto-Validator'
    }
  ]);

  const handleApprove = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      verifier: 'SaaS Admin'
    } : r));
  };

  const handleReject = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'REJECTED',
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      verifier: 'SaaS Admin'
    } : r));
  };

  const filtered = records.filter(r => {
    const matchesSearch = r.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">SaaS Identity & KYC Verification Engine</h3>
            <p className="text-xs text-slate-400">Manage tenant compliance identity verifications, email/SMS gates & enterprise 2FA checks.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 text-xs font-mono font-bold rounded-full border border-emerald-800">
            Engine Online
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenant or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Verification Types</option>
            <option value="KYC">KYC Documents</option>
            <option value="EMAIL">Email DKIM Gate</option>
            <option value="SMS">SMS Gateway Gate</option>
            <option value="2FA_HARDWARE">Hardware Token 2FA</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Verification ID</th>
                <th className="p-3.5">Tenant & User</th>
                <th className="p-3.5">Gate Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Submitted</th>
                <th className="p-3.5">Verifier / Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-slate-900 dark:text-white">{rec.id}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{rec.tenantName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{rec.userEmail}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {rec.type}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {rec.status === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                    {rec.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                    {rec.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">{rec.submittedAt}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">{rec.verifier}</td>
                  <td className="p-3.5 text-right">
                    {rec.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(rec.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] rounded transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(rec.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] rounded transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SaasAdminVerificationManager;
