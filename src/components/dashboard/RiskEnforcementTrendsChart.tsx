import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';

const generateData = (days: number) => {
  const result = [];
  let baseEfficiency = 85;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some random walk for realism
    baseEfficiency = Math.max(60, Math.min(99, baseEfficiency + (Math.random() * 6 - 2)));
    const incidents = Math.floor(Math.random() * 25) + (i % 7 === 0 ? 15 : 0); // spikes on weekends/specific days

    result.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      incidents,
      efficiency: Math.round(baseEfficiency)
    });
  }
  return result;
};

export const RiskEnforcementTrendsChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (timeRange === '7D') setData(generateData(7));
    if (timeRange === '30D') setData(generateData(30));
    if (timeRange === '90D') setData(generateData(90));
  }, [timeRange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Risk & Enforcement Trends</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time incident frequency vs. mitigation efficiency</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
          {(['7D', '30D', '90D'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                timeRange === range 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              dy={10} 
              minTickGap={20}
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 0' }}
              labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '15px' }} 
              iconType="circle"
            />
            <Bar 
              yAxisId="left" 
              dataKey="incidents" 
              name="Incident Frequency" 
              radius={[4, 4, 0, 0]} 
              barSize={timeRange === '90D' ? 4 : timeRange === '30D' ? 8 : 20}
            >
              {
                data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.incidents > 15 ? '#ef4444' : '#f43f5e'} opacity={0.8} />
                ))
              }
            </Bar>
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="efficiency" 
              name="Mitigation Efficiency" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={timeRange === '90D' ? false : { r: 4, strokeWidth: 2, fill: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
