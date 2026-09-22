import React from 'react';
import { TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

export const ComplianceTrendWidget: React.FC = () => {
  const weeks = [
    { label: 'W1', score: 88 },
    { label: 'W2', score: 91 },
    { label: 'W3', score: 90 },
    { label: 'W4', score: 94 },
    { label: 'W5', score: 96 },
    { label: 'W6', score: 97 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">6-Week Statutory Trend</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Continuous posture hardening metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="w-4 h-4" />
          +9.0%
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2">
        {weeks.map((w, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-mono text-slate-500 font-bold">{w.score}%</span>
            <div
              className="w-full max-w-[28px] bg-gradient-to-t from-indigo-600 to-emerald-500 rounded-t-md transition-all duration-500"
              style={{ height: `${(w.score - 70) * 3}%` }}
            />
            <span className="text-[10px] font-mono text-slate-400">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ComplianceTrendWidget;
