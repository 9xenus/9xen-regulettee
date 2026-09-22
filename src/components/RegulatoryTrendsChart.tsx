import React, { useState } from 'react';
import { 
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

const mockData90d = [
  { date: 'Day -90', violations: 45, resolved: 32, escalations: 13, resolutionTime: 14 },
  { date: 'Day -80', violations: 42, resolved: 33, escalations: 12, resolutionTime: 13 },
  { date: 'Day -70', violations: 48, resolved: 38, escalations: 15, resolutionTime: 15 },
  { date: 'Day -60', violations: 55, resolved: 44, escalations: 16, resolutionTime: 17 },
  { date: 'Day -50', violations: 51, resolved: 43, escalations: 14, resolutionTime: 16 },
  { date: 'Day -40', violations: 40, resolved: 35, escalations: 11, resolutionTime: 12 },
  { date: 'Day -30', violations: 35, resolved: 32, escalations: 9, resolutionTime: 10 },
  { date: 'Day -20', violations: 28, resolved: 26, escalations: 7, resolutionTime: 8 },
  { date: 'Day -10', violations: 20, resolved: 19, escalations: 4, resolutionTime: 5 },
  { date: 'Today', violations: 15, resolved: 15, escalations: 2, resolutionTime: 4 },
];

const mockData30d = [
  { date: 'Day -30', violations: 35, resolved: 32, escalations: 9, resolutionTime: 10 },
  { date: 'Day -25', violations: 32, resolved: 30, escalations: 8, resolutionTime: 9 },
  { date: 'Day -20', violations: 28, resolved: 26, escalations: 7, resolutionTime: 8 },
  { date: 'Day -15', violations: 24, resolved: 23, escalations: 5, resolutionTime: 7 },
  { date: 'Day -10', violations: 20, resolved: 19, escalations: 4, resolutionTime: 5 },
  { date: 'Day -5', violations: 17, resolved: 16, escalations: 3, resolutionTime: 4 },
  { date: 'Today', violations: 15, resolved: 15, escalations: 2, resolutionTime: 4 },
];

interface Props {
  onOpenFullDashboard?: () => void;
}

export const RegulatoryTrendsChart: React.FC<Props> = ({ onOpenFullDashboard }) => {
  const [period, setPeriod] = useState<'30d' | '90d'>('90d');
  const data = period === '30d' ? mockData30d : mockData90d;

  return (
    <div id="regulatory-trends-summary-chart" className="bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] rounded-md uppercase tracking-wider">
              Enforcement Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Sync</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Violation Resolutions & Escalation Trends</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Comparing Resolved Violations (Green), Escalation Frequency (Rose), and MTTR (Days)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => setPeriod('30d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                period === '30d' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                period === '90d' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              90 Days
            </button>
          </div>

          {onOpenFullDashboard && (
            <button
              onClick={onOpenFullDashboard}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Full Analytics Suite</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Pill Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolution Rate</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">96.4%</span>
          <span className="text-[10px] text-slate-500 block">+14.2% efficiency</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escalation Drop</span>
          <span className="text-base font-black text-rose-600 dark:text-rose-400">-78.5%</span>
          <span className="text-[10px] text-slate-500 block">Fewer formal sanctions</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg MTTR</span>
          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">4.2 Days</span>
          <span className="text-[10px] text-slate-500 block">vs 14-day SLA</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Automated Cures</span>
          <span className="text-base font-black text-cyan-600 dark:text-cyan-400">74%</span>
          <span className="text-[10px] text-slate-500 block">State-machine driven</span>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorResolvedOverview" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-5} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6366f1' }} dx={5} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                backgroundColor: '#0f172a',
                color: '#fff',
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                fontSize: '12px'
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="resolved" 
              name="Resolved Violations"
              stroke="#10b981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorResolvedOverview)" 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="escalations" 
              name="Escalation Frequency"
              stroke="#f43f5e" 
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="resolutionTime" 
              name="Avg Resolution Time (Days)"
              stroke="#6366f1" 
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2.5, fill: '#6366f1' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

