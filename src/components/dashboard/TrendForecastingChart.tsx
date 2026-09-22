import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

const forecastData = [
  { month: 'Jan', historicalRisk: 12, forecastedRisk: null },
  { month: 'Feb', historicalRisk: 15, forecastedRisk: null },
  { month: 'Mar', historicalRisk: 18, forecastedRisk: null },
  { month: 'Apr', historicalRisk: 14, forecastedRisk: null },
  { month: 'May', historicalRisk: 22, forecastedRisk: null },
  { month: 'Jun', historicalRisk: 25, forecastedRisk: 25 },
  { month: 'Jul', historicalRisk: null, forecastedRisk: 28 },
  { month: 'Aug', historicalRisk: null, forecastedRisk: 34 },
  { month: 'Sep', historicalRisk: null, forecastedRisk: 42 },
  { month: 'Oct', historicalRisk: null, forecastedRisk: 55 },
  { month: 'Nov', historicalRisk: null, forecastedRisk: 68 },
  { month: 'Dec', historicalRisk: null, forecastedRisk: 80 },
];

export const TrendForecastingChart: React.FC = () => {
  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-500" />
            Breach Risk Forecasting
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Projected breach probability based on historical access anomalies and IAM logs.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Risk trending UP in Q3/Q4</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={forecastData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
            />
            <ReferenceLine x="Jun" stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
            <Area
              type="monotone"
              dataKey="historicalRisk"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorHistorical)"
              name="Historical Risk (%)"
            />
            <Area
              type="monotone"
              dataKey="forecastedRisk"
              stroke="#f43f5e"
              strokeWidth={3}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorForecast)"
              name="Forecasted Risk (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-500" /> Historical Data
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-500" /> AI Forecast
        </div>
      </div>
    </div>
  );
};
