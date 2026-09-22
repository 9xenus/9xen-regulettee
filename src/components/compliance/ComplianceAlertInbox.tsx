import React, { useState } from 'react';
import { Bell, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Filter, ExternalLink } from 'lucide-react';

interface ComplianceAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  source: 'EU AI Act' | 'GDPR' | 'DORA' | 'NIS2';
  timestamp: string;
  status: 'UNREAD' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export const ComplianceAlertInbox: React.FC = () => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([
    {
      id: 'ALT-1049',
      severity: 'HIGH',
      title: 'EU AI Act: Model weights updated in production without Annex IV revision hash',
      source: 'EU AI Act',
      timestamp: '6 mins ago',
      status: 'UNREAD'
    },
    {
      id: 'ALT-1048',
      severity: 'CRITICAL',
      title: 'DORA: Hot-standby replica in AWS eu-west-1 exceeded 45ms latency ceiling',
      source: 'DORA',
      timestamp: '22 mins ago',
      status: 'UNREAD'
    },
    {
      id: 'ALT-1047',
      severity: 'MEDIUM',
      title: 'GDPR: Cookie consent banner policy updated in Spanish Gazette (BOE)',
      source: 'GDPR',
      timestamp: '1 hour ago',
      status: 'ACKNOWLEDGED'
    }
  ]);

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance & Regulatory Alert Inbox</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Statutory dispatch and early warning notices</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded">
          {alerts.filter(a => a.status !== 'RESOLVED').length} Active
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
              a.status === 'RESOLVED'
                ? 'opacity-60 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                  a.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                  a.severity === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                  'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                }`}>
                  {a.severity}
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{a.source}</span>
                <span className="text-[10px] text-slate-400">{a.timestamp}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {a.status !== 'RESOLVED' ? (
                <button
                  onClick={() => handleResolve(a.id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolve & Seal
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ComplianceAlertInbox;
