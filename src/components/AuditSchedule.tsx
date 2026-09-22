import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AuditSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState([
    { title: 'EU AI Act Conformity Assessment', frequency: 'Monthly', assignedTo: 'Lead AI DPO', nextDate: '2026-10-01' },
    { title: 'DORA Comprehensive ICT Resilience Stress Test', frequency: 'Quarterly', assignedTo: 'Chief SecOps', nextDate: '2026-11-15' },
    { title: 'GDPR Article 30 ROPA Review', frequency: 'Bi-Weekly', assignedTo: 'Statutory DPO', nextDate: '2026-09-15' },
  ]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Audit Calendar</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Scheduled external regulatory review sessions</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
          {schedules.length} Active Audits
        </span>
      </div>

      <div className="space-y-2">
        {schedules.map((s, idx) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{s.title}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{s.frequency}</span>
                <span>• Assigned: {s.assignedTo}</span>
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold">
              {s.nextDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AuditSchedule;
