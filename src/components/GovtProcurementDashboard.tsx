import React, { useState } from 'react';
import { 
  Landmark, 
  Search, 
  Filter, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight,
  FileCheck2,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const tenders = [
  {
    id: 'TND-2026-9042',
    department: 'Ministry of Infrastructure',
    description: 'Highway Extension - Phase 3',
    value: '৳ 450,000,000',
    bidders: 3,
    riskScore: 88,
    status: 'HIGH_RISK',
    flags: ['Bid Rigging Pattern', 'Vendor Shell Company Match'],
    date: '2026-09-06'
  },
  {
    id: 'TND-2026-9045',
    department: 'Dept of Health Services',
    description: 'Medical Equipment Supply - District Hospitals',
    value: '৳ 120,500,000',
    bidders: 8,
    riskScore: 12,
    status: 'CLEARED',
    flags: [],
    date: '2026-09-05'
  },
  {
    id: 'TND-2026-9051',
    department: 'Ministry of Education',
    description: 'Digital Classroom Devices Procurement',
    value: '৳ 85,000,000',
    bidders: 2,
    riskScore: 65,
    status: 'NEEDS_REVIEW',
    flags: ['Price Inflated 30% above baseline'],
    date: '2026-09-04'
  },
  {
    id: 'TND-2026-9060',
    department: 'Power Development Board',
    description: 'Substation Transformer Upgrades',
    value: '৳ 320,000,000',
    bidders: 4,
    riskScore: 94,
    status: 'CRITICAL',
    flags: ['Conflict of Interest Detected', 'Historical Monopolization'],
    date: '2026-09-02'
  }
];

const riskTrendData = [
  { name: 'Jan', cleared: 120, flagged: 15 },
  { name: 'Feb', cleared: 145, flagged: 12 },
  { name: 'Mar', cleared: 130, flagged: 22 },
  { name: 'Apr', cleared: 160, flagged: 18 },
  { name: 'May', cleared: 155, flagged: 25 },
  { name: 'Jun', cleared: 180, flagged: 14 },
];

export default function GovtProcurementDashboard() {
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
            <Landmark className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            E-Procurement Audit Engine (GovTech)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Detect bid rigging, price inflation, and conflicts of interest in public tenders.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tenders Analyzed</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <FileCheck2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">8,402</span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
            FY 2025-2026
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Anomalies Detected</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">314</span>
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-2">
            3.7% of total volume
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Funds Protected</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">৳ 1.2B</span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2">
            Projected savings
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Shell Companies Flagged</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">42</span>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-2">
            Across 15 syndicates
          </span>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Tender Audit Volume & Flags</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#f9fafb' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="cleared" name="Cleared Tenders" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="flagged" name="Anomalies Flagged" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tenders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Flagged E-Procurements</h3>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tender ID or dept..." 
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
                <th className="px-6 py-4 font-medium">Status / Score</th>
                <th className="px-6 py-4 font-medium">Tender Info</th>
                <th className="px-6 py-4 font-medium">Bidders / Value</th>
                <th className="px-6 py-4 font-medium">AI Anomalies</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border w-fit ${getStatusBadge(tender.status)}`}>
                        {tender.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        Risk Score: <span className={tender.riskScore > 75 ? 'text-rose-500' : 'text-emerald-500'}>{tender.riskScore}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{tender.id}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{tender.department}</div>
                    <div className="text-gray-700 dark:text-gray-300 text-xs mt-1 truncate max-w-xs">{tender.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{tender.value}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{tender.bidders} Active Bidders</div>
                  </td>
                  <td className="px-6 py-4">
                    {tender.flags.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {tender.flags.map((flag, idx) => (
                          <span key={idx} className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {flag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">No deviations detected.</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center justify-end gap-1 w-full">
                      Investigate <ChevronRight className="w-4 h-4" />
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
