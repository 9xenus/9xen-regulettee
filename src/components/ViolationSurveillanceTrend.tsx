import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, ShieldAlert, Activity } from 'lucide-react';

interface SurveillanceDataPoint {
  month: string;
  gdprFines: number;
  aiActWarnings: number;
  dataResidencyBreaches: number;
}

const defaultData: SurveillanceDataPoint[] = [
  { month: 'Oct', gdprFines: 12, aiActWarnings: 4, dataResidencyBreaches: 2 },
  { month: 'Nov', gdprFines: 18, aiActWarnings: 7, dataResidencyBreaches: 5 },
  { month: 'Dec', gdprFines: 14, aiActWarnings: 9, dataResidencyBreaches: 3 },
  { month: 'Jan', gdprFines: 22, aiActWarnings: 15, dataResidencyBreaches: 8 },
  { month: 'Feb', gdprFines: 29, aiActWarnings: 21, dataResidencyBreaches: 12 },
  { month: 'Mar', gdprFines: 35, aiActWarnings: 28, dataResidencyBreaches: 16 },
];

export const ViolationSurveillanceTrend: React.FC<{ data?: SurveillanceDataPoint[] }> = ({ data = defaultData }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">EU Surveillance Violation Trends</h4>
            <p className="text-[11px] text-slate-500">6-Month Cross-Border Regulatory Enforcement Velocity</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-rose-500 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +28% YoY Enforcement
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gdprGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Area type="monotone" dataKey="gdprFines" name="GDPR Fines" stroke="#f43f5e" fillOpacity={1} fill="url(#gdprGrad)" />
            <Area type="monotone" dataKey="aiActWarnings" name="EU AI Act Notices" stroke="#8b5cf6" fillOpacity={1} fill="url(#aiGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-around text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">GDPR Article 83 Fines</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">EU AI Act High-Risk Audit Notices</span>
        </div>
      </div>
    </div>
  );
};

export default ViolationSurveillanceTrend;
