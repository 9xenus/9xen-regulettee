import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  AlertTriangle, 
  TrendingDown, 
  ShieldCheck, 
  ChevronRight,
  FileCheck2,
  Users,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';

const taxFilings = [
  {
    id: 'TAX-2026-F9042',
    entity: 'Global Textiles Ltd.',
    sector: 'Manufacturing',
    declaredRevenue: '$1,450,000,000',
    estimatedRevenue: '$2,100,000,000',
    evasionProb: 92,
    status: 'HIGH_RISK',
    flags: ['Under-invoicing of exports', 'Shell company transfer pricing'],
    date: '2026-09-06'
  },
  {
    id: 'TAX-2026-F9045',
    entity: 'Apex Tech Solutions',
    sector: 'IT Services',
    declaredRevenue: '$120,500,000',
    estimatedRevenue: '$125,000,000',
    evasionProb: 12,
    status: 'CLEARED',
    flags: [],
    date: '2026-09-05'
  },
  {
    id: 'TAX-2026-F9051',
    entity: 'Mega Builders Corp',
    sector: 'Real Estate',
    declaredRevenue: '$850,000,000',
    estimatedRevenue: '$1,200,000,000',
    evasionProb: 75,
    status: 'NEEDS_REVIEW',
    flags: ['Cash transaction anomalies (unreported)'],
    date: '2026-09-04'
  },
  {
    id: 'TAX-2026-F9060',
    entity: 'Prime Importers syndicate',
    sector: 'Wholesale Trade',
    declaredRevenue: '$320,000,000',
    estimatedRevenue: '$890,000,000',
    evasionProb: 98,
    status: 'CRITICAL',
    flags: ['TBML connection identified', 'Phantom shipments'],
    date: '2026-09-02'
  }
];

const taxTrendData = [
  { name: 'Q1', recovered: 420, flagged_value: 850 },
  { name: 'Q2', recovered: 550, flagged_value: 920 },
  { name: 'Q3', recovered: 890, flagged_value: 1200 },
  { name: 'Q4', recovered: 1200, flagged_value: 1500 },
];

export default function TaxAnomalyDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    if (status === 'CLEARED') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
    if (status === 'CRITICAL') return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200';
    if (status === 'HIGH_RISK') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200';
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Tax Evasion Intelligence (GovTech)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            AI-driven reconciliation of declared revenue vs. predictive behavioral estimates.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filings Processed</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <FileCheck2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">142,504</span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
            FY 2025-2026
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">High-Risk Entities</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">4,210</span>
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-2">
            2.9% evasion probability &gt; 80%
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax Gap Identified</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">$8.4B</span>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-2">
            Declared vs AI Estimated
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Recovered</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">$2.1B</span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
            Post-Audit Actions
          </span>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Tax Gap vs Recovery (Millions USD)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={taxTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#f9fafb' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="flagged_value" name="Identified Tax Gap" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFlagged)" />
              <Area type="monotone" dataKey="recovered" name="Revenue Recovered" stroke="#10b981" fillOpacity={1} fill="url(#colorRecovered)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tax Filings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">High-Risk Tax Filings</h3>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search entity or ID..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 font-medium">Status / Probability</th>
                <th className="px-6 py-4 font-medium">Entity Info</th>
                <th className="px-6 py-4 font-medium">Revenue Gap (Declared vs AI Est.)</th>
                <th className="px-6 py-4 font-medium">Detected Patterns</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {taxFilings.map((filing) => (
                <tr key={filing.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border w-fit ${getStatusBadge(filing.status)}`}>
                        {filing.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        Evasion Prob: <span className={filing.evasionProb > 75 ? 'text-rose-500' : 'text-emerald-500'}>{filing.evasionProb}%</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{filing.entity}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{filing.sector}</div>
                    <div className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">{filing.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white flex flex-col gap-1">
                      <span className="text-rose-600 dark:text-rose-400 text-xs line-through">Decl: {filing.declaredRevenue}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Est: {filing.estimatedRevenue}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {filing.flags.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {filing.flags.map((flag, idx) => (
                          <span key={idx} className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            {flag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">Within standard deviation.</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center justify-end gap-1 w-full">
                      Audit Case <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
