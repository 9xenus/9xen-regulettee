import React from 'react';
import { FileText, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface Breach {
  id: string;
  country: string;
  severity: number;
  article: string;
  sector: string;
}

interface RecentBreachesPanelProps {
  breaches: Breach[];
}

export const RecentBreachesPanel: React.FC<RecentBreachesPanelProps> = ({ breaches }) => {
  const recentBreaches = [...breaches].reverse().slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-indigo-600" />
        Recent Breaches
      </h3>
      <div className="space-y-3">
        {recentBreaches.map(breach => (
          <div key={breach.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
                <div className="font-bold text-slate-900 text-sm">{breach.sector} Breach</div>
                <div className="text-[10px] text-slate-500 font-mono">{breach.article} • Severity: {breach.severity}</div>
            </div>
            <button className="p-2 bg-white rounded-lg border border-slate-200 hover:border-indigo-300">
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
