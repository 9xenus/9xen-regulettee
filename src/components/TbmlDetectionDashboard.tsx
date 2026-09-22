import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  AlertTriangle, 
  Activity, 
  DollarSign, 
  ShieldAlert, 
  Search, 
  Filter,
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

// --- MOCK DATA ---
const riskTrendData = [
  { date: '09/01', volume: 120, flagged: 4, benchmarkVariance: 2.1 },
  { date: '09/02', volume: 132, flagged: 5, benchmarkVariance: 3.4 },
  { date: '09/03', volume: 101, flagged: 2, benchmarkVariance: 1.2 },
  { date: '09/04', volume: 154, flagged: 12, benchmarkVariance: 14.5 }, // Anomaly spike
  { date: '09/05', volume: 140, flagged: 6, benchmarkVariance: 4.0 },
  { date: '09/06', volume: 165, flagged: 8, benchmarkVariance: 5.2 },
  { date: '09/07', volume: 125, flagged: 3, benchmarkVariance: 2.8 },
];

const riskDistribution = [
  { name: 'Low Risk', value: 68, color: '#10b981' }, // emerald-500
  { name: 'Medium Risk', value: 22, color: '#f59e0b' }, // amber-500
  { name: 'High Risk', value: 8, color: '#f43f5e' }, // rose-500
  { name: 'Critical (TBML)', value: 2, color: '#7f1d1d' }, // red-900
];

const recentAlerts = [
  {
    id: 'TXN-8829-A',
    entity: 'Apex Global Textiles Ltd.',
    hsCode: '6204.62 (Cotton Trousers)',
    declaredValue: '$450,000',
    benchmarkValue: '$310,000',
    variance: '+45.1%',
    riskScore: 94,
    flag: 'Over-Invoicing (Capital Flight Risk)',
    status: 'INVESTIGATING',
  },
  {
    id: 'TXN-8830-B',
    entity: 'Bengal Agro Exports',
    hsCode: '0306.17 (Frozen Shrimp)',
    declaredValue: '$85,000',
    benchmarkValue: '$140,000',
    variance: '-39.2%',
    riskScore: 88,
    flag: 'Under-Invoicing (Tax Evasion Risk)',
    status: 'NEW',
  },
  {
    id: 'TXN-8831-C',
    entity: 'Delta Machinery Impex',
    hsCode: '8452.29 (Sewing Machines)',
    declaredValue: '$210,000',
    benchmarkValue: '$205,000',
    variance: '+2.4%',
    riskScore: 12,
    flag: 'Standard Variance',
    status: 'CLEARED',
  },
  {
    id: 'TXN-8832-D',
    entity: 'Global Scrap Metals',
    hsCode: '7204.49 (Ferrous Waste)',
    declaredValue: '$620,000',
    benchmarkValue: '$410,000',
    variance: '+51.2%',
    riskScore: 97,
    flag: 'Phantom Shipment Suspected',
    status: 'FROZEN',
  },
];

export default function TbmlDetectionDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    if (score >= 75) return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    if (score >= 50) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'INVESTIGATING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'FROZEN': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'CLEARED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            TBML Detection Engine
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Trade-Based Money Laundering AI anomaly detection and price benchmarking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Export Audit Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Run Batch Scan
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Analyzed Volume (24h)</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">$142.5M</span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            ↑ 12% vs last week
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Anomalies Flagged</span>
            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">24</span>
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            4 Critical Requires Review
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Value at Risk</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">$4.2M</span>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            High variance detected
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Confidence Index</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">96.4%</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            Based on HS Code mappings
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Price Variance & Anomaly Detection</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVariance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area yAxisId="left" type="monotone" dataKey="benchmarkVariance" name="Avg % Variance vs Benchmark" stroke="#f43f5e" fillOpacity={1} fill="url(#colorVariance)" />
                <Line yAxisId="right" type="monotone" dataKey="flagged" name="Transactions Flagged" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Risk Distribution</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Categorization of last 1,000 transactions.</p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#f9fafb' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent High-Risk Anomalies</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search entities or TXN IDs..." 
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
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Entity & Cargo (HS Code)</th>
                <th className="px-6 py-4 font-medium">Declared vs Benchmark</th>
                <th className="px-6 py-4 font-medium text-center">AI Risk Score</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-gray-200">{alert.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{alert.entity}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">{alert.hsCode}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Declared:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{alert.declaredValue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Benchmark:</span>
                        <span className="text-gray-900 dark:text-gray-300">{alert.benchmarkValue}</span>
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${alert.variance.startsWith('+') ? 'text-rose-500' : 'text-indigo-500'}`}>
                        Variance: {alert.variance}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreBadge(alert.riskScore)}`}>
                      {alert.riskScore} / 100
                    </span>
                    <div className="text-[10px] text-gray-500 mt-1 uppercase font-semibold">{alert.flag}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${getStatusBadge(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center justify-end gap-1 w-full">
                      Review <ChevronRight className="w-4 h-4" />
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
