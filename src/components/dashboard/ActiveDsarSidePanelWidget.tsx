import React, { useState } from 'react';
import { UserCheck, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface DsarRequest {
  id: string;
  subject: string;
  type: 'ERASURE' | 'EXPORT' | 'RECTIFICATION';
  daysLeft: number;
  status: 'PENDING_VERIFICATION' | 'PROCESSING' | 'COMPLETED';
}

export const ActiveDsarSidePanelWidget: React.FC = () => {
  const [requests, setRequests] = useState<DsarRequest[]>([
    { id: 'DSAR-8901', subject: 'm.schmidt@berlin.de', type: 'ERASURE', daysLeft: 24, status: 'PROCESSING' },
    { id: 'DSAR-8902', subject: 'c.dupont@paris.fr', type: 'EXPORT', daysLeft: 28, status: 'PENDING_VERIFICATION' },
    { id: 'DSAR-8903', subject: 'a.rossi@milano.it', type: 'RECTIFICATION', daysLeft: 19, status: 'PROCESSING' },
  ]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active DSAR Pipeline</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">GDPR Art. 15-22 Subject Rights SLA</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
          {requests.length} Open
        </span>
      </div>

      <div className="space-y-2">
        {requests.map((req) => (
          <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{req.id}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{req.type}</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{req.subject}</div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">{req.daysLeft}d left</div>
              <div className="text-[10px] text-slate-400">30d SLA</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ActiveDsarSidePanelWidget;
