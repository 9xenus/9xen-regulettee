import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Play, RefreshCw, Layers } from 'lucide-react';

interface ScheduledAudit {
  id: string;
  name: string;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  nextRun: string;
  lastStatus: 'PASSED' | 'WARNING';
}

export const RecurringAuditsDashboard: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduledAudit[]>([
    { id: 'SCH-1', name: 'GDPR Article 30 ROPA Re-validation', frequency: 'DAILY', nextRun: 'in 4 hours', lastStatus: 'PASSED' },
    { id: 'SCH-2', name: 'EU AI Act Foundation Model Drift & Bias Scan', frequency: 'HOURLY', nextRun: 'in 22 mins', lastStatus: 'PASSED' },
    { id: 'SCH-3', name: 'DORA Hot-Standby Multi-Cloud Failover Heartbeat', frequency: 'HOURLY', nextRun: 'in 15 mins', lastStatus: 'PASSED' },
    { id: 'SCH-4', name: 'NIS2 Supply Chain Dependency Vulnerability Scan', frequency: 'DAILY', nextRun: 'in 12 hours', lastStatus: 'PASSED' },
  ]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Continuous & Recurring Regulatory Audits</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Automated scheduled statutory verification runs</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
          4 Scheduled Tasks Active
        </span>
      </div>

      <div className="space-y-2">
        {schedules.map((s) => (
          <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.frequency}</span>
                <span>• Next run: {s.nextRun}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {s.lastStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecurringAuditsDashboard;
