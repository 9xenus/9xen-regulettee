import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { Shield, Activity, Clock, AlertTriangle } from 'lucide-react';

const mockData = [
  { month: 'Jan', incidents: 4, recoveryTime: 4.2, severityScore: 65 },
  { month: 'Feb', incidents: 3, recoveryTime: 3.8, severityScore: 50 },
  { month: 'Mar', incidents: 5, recoveryTime: 4.5, severityScore: 70 },
  { month: 'Apr', incidents: 2, recoveryTime: 2.1, severityScore: 40 },
  { month: 'May', incidents: 6, recoveryTime: 5.0, severityScore: 85 },
  { month: 'Jun', incidents: 1, recoveryTime: 1.5, severityScore: 20 },
  { month: 'Jul', incidents: 2, recoveryTime: 1.8, severityScore: 30 },
  { month: 'Aug', incidents: 3, recoveryTime: 2.5, severityScore: 45 },
  { month: 'Sep', incidents: 2, recoveryTime: 1.9, severityScore: 35 },
  { month: 'Oct', incidents: 4, recoveryTime: 3.2, severityScore: 55 },
  { month: 'Nov', incidents: 2, recoveryTime: 2.0, severityScore: 38 },
  { month: 'Dec', incidents: 1, recoveryTime: 1.2, severityScore: 15 },
];

export function DoraOperationalResilienceChart() {
  const [activeTab, setActiveTab] = useState<'overview' | 'recovery'>('overview');

  const averageRecovery = (mockData.reduce((acc, curr) => acc + curr.recoveryTime, 0) / mockData.length).toFixed(1);
  const totalIncidents = mockData.reduce((acc, curr) => acc + curr.incidents, 0);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            DORA Operational Resilience
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ICT Incident Frequency & Mean Time to Recover (MTTR) Trends
          </p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mt-4 md:mt-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Incident Overview
          </button>
          <button
            onClick={() => setActiveTab('recovery')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'recovery'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Recovery Trends
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total ICT Incidents (YTD)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalIncidents}</h3>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average MTTR (Hours)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{averageRecovery}</h3>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">DORA Posture Score</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">92%</h3>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full">
        {activeTab === 'overview' ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mockData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis dataKey="month" stroke="#6b7280" className="text-xs" tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="#6b7280" className="text-xs" tickLine={false} axisLine={false} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" className="text-xs" tickLine={false} axisLine={false} dx={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: 'transparent' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
              
              <Bar yAxisId="left" dataKey="incidents" name="ICT Incidents" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line yAxisId="right" type="monotone" dataKey="severityScore" name="Impact Severity" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mockData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis dataKey="month" stroke="#6b7280" className="text-xs" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#6b7280" className="text-xs" tickLine={false} axisLine={false} dx={-10} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
              
              <Area type="monotone" dataKey="recoveryTime" name="MTTR (Hours)" fill="#818cf8" stroke="#4f46e5" fillOpacity={0.2} strokeWidth={2} />
              <Line type="monotone" dataKey="recoveryTime" name="Recovery Target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} data={mockData.map(d => ({ ...d, recoveryTime: 2.5 }))} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
