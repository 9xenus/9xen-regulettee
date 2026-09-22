import React, { useState } from 'react';
import { FileText, ShieldCheck, Download, Search, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface AuditRecord {
  id: string;
  framework: string;
  scope: string;
  findings: number;
  complianceRatio: string;
  auditor: string;
  date: string;
}

export const ComplianceAuditDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const audits: AuditRecord[] = [
    { id: 'AUD-2026-0901', framework: 'EU AI Act', scope: 'High-Risk Models & Training Lineage', findings: 0, complianceRatio: '100%', auditor: 'Autonomous Enclave Watchdog', date: '2026-09-04' },
    { id: 'AUD-2026-0889', framework: 'DORA', scope: 'ICT Multi-Cloud Resiliency & RTO Benchmark', findings: 0, complianceRatio: '100%', auditor: 'Resilience Test Harness', date: '2026-09-02' },
    { id: 'AUD-2026-0870', framework: 'GDPR Art. 30', scope: 'ROPA Biometric Enclave Registry', findings: 0, complianceRatio: '100%', auditor: 'Statutory DPO Validator', date: '2026-08-28' },
    { id: 'AUD-2026-0855', framework: 'NIS2 Art. 21', scope: 'CSIRT Early Incident Conduit & Webhooks', findings: 0, complianceRatio: '100%', auditor: 'Cybersecurity Inspection Node', date: '2026-08-20' },
  ];

  const filteredAudits = audits.filter(a =>
    a.framework.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Audit Records Ledger</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Cryptographically verifiable regulatory audit trail</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-400">
              <th className="py-2.5 px-3">Audit ID & Date</th>
              <th className="py-2.5 px-3">Framework</th>
              <th className="py-2.5 px-3">Scope</th>
              <th className="py-2.5 px-3">Auditor</th>
              <th className="py-2.5 px-3 text-right">Conformance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredAudits.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <td className="py-2.5 px-3">
                  <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{a.id}</div>
                  <div className="text-[10px] text-slate-400">{a.date}</div>
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{a.framework}</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{a.scope}</td>
                <td className="py-2.5 px-3 text-slate-500">{a.auditor}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    {a.complianceRatio}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ComplianceAuditDashboard;
