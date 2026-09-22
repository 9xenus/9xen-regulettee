import React, { useState } from 'react';
import { PieChart as PieIcon, ShieldAlert, Database, Layers } from 'lucide-react';

interface CategorySlice {
  name: string;
  count: number;
  percentage: number;
  color: string;
  subType: string;
}

export interface DataCategoryDonutChartProps {
  data?: any[];
  onSliceClick?: (key: string) => void;
  activeCategoryKey?: string;
  [key: string]: any;
}

export const DataCategoryDonutChart: React.FC<DataCategoryDonutChartProps> = ({ onSliceClick, activeCategoryKey }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories: CategorySlice[] = [
    { name: 'Biometric / High-Risk PII', count: 14200, percentage: 32, color: 'bg-indigo-600', subType: 'Art. 9 Special Category' },
    { name: 'Financial & Banking Records', count: 18500, percentage: 41, color: 'bg-emerald-500', subType: 'DORA / PCI-DSS' },
    { name: 'Employee / HR Lineage', count: 6800, percentage: 15, color: 'bg-amber-500', subType: 'EU AI Act Rec. 34' },
    { name: 'Technical Telemetry & IP Logs', count: 5400, percentage: 12, color: 'bg-sky-500', subType: 'NIS2 Art. 21' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Processed Data Classification</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">GDPR Article 30 data volume & categorization</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
          44,900 Total Records
        </span>
      </div>

      <div className="space-y-3">
        {categories.map((c, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setActiveCategory(c.name)}
            onMouseLeave={() => setActiveCategory(null)}
            className={`p-3 rounded-xl border transition ${
              activeCategory === c.name
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
              </div>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{c.count.toLocaleString()} recs ({c.percentage}%)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className={`${c.color} h-full rounded-full transition-all duration-300`} style={{ width: `${c.percentage}%` }} />
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">{c.subType}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DataCategoryDonutChart;
