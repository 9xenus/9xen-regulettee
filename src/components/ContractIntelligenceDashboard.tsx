import React, { useState } from 'react';
import { 
  ShieldAlert, 
  FileText, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Scale, 
  Search, 
  Filter,
  AlertTriangle,
  FileCheck2
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const contractData = [
  {
    id: 'CTR-2026-901',
    title: 'Vendor SLA - TechCorp',
    type: 'Service Level Agreement',
    riskScore: 88,
    status: 'HIGH_RISK',
    date: '2026-09-06',
    flaggedClauses: [
      { name: 'Liability Cap', issue: 'Exceeds 2x contract value (Global Region statutory limit standard).' },
      { name: 'Governing Law', issue: 'Specified as Delaware, USA instead of Global Region.' }
    ]
  },
  {
    id: 'CTR-2026-902',
    title: 'NDA - Beta Innovations',
    type: 'Non-Disclosure Agreement',
    riskScore: 12,
    status: 'COMPLIANT',
    date: '2026-09-05',
    flaggedClauses: []
  },
  {
    id: 'CTR-2026-903',
    title: 'Commercial Lease - Plot 4A',
    type: 'Lease Agreement',
    riskScore: 45,
    status: 'NEEDS_REVIEW',
    date: '2026-09-04',
    flaggedClauses: [
      { name: 'Termination Clause', issue: 'Missing standard 30-day notice period.' }
    ]
  },
  {
    id: 'CTR-2026-904',
    title: 'Employment Auth - Senior Exec',
    type: 'Employment Contract',
    riskScore: 76,
    status: 'HIGH_RISK',
    date: '2026-09-03',
    flaggedClauses: [
      { name: 'Non-Compete', issue: 'Non-compete duration exceeds BLA 2006 reasonable limits (5 years).' },
      { name: 'Gratuity', issue: 'Gratuity calculation deviates from statutory formula.' }
    ]
  }
];

const riskRadarData = [
  { subject: 'Liability Caps', A: 85, fullMark: 100 },
  { subject: 'Governing Law', A: 65, fullMark: 100 },
  { subject: 'Termination', A: 40, fullMark: 100 },
  { subject: 'IP Rights', A: 30, fullMark: 100 },
  { subject: 'Data Privacy', A: 90, fullMark: 100 },
  { subject: 'Force Majeure', A: 20, fullMark: 100 },
];

const volumeData = [
  { name: 'Mon', compliant: 12, flagged: 4 },
  { name: 'Tue', compliant: 19, flagged: 2 },
  { name: 'Wed', compliant: 15, flagged: 7 },
  { name: 'Thu', compliant: 22, flagged: 3 },
  { name: 'Fri', compliant: 18, flagged: 5 },
];

export default function ContractIntelligenceDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    if (status === 'COMPLIANT') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    if (status === 'HIGH_RISK') return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLIANT') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'HIGH_RISK') return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Contract Intelligence (Legal)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            AI-driven clause extraction, redlining, and compliance verification against local corporate laws.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload Contract
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contracts Scanned (MTD)</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">1,204</span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            +18% processing speed
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">High Risk Deviations</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">42</span>
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            Requires legal review
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Review Time Saved</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">2.4 hrs</span>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            Per complex agreement
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Clause Accuracy (XAI)</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">98.2%</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            Based on manual overrides
          </span>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Clause Risk Taxonomy</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Aggregate risk by clause category.</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskRadarData}>
                <PolarGrid stroke="#374151" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Risk Level" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#f9fafb' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Processing Volume & Flags</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#f9fafb' }}
                  cursor={{ fill: '#374151', opacity: 0.1 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="compliant" name="Compliant" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} maxBarSize={40} />
                <Bar dataKey="flagged" name="Flagged" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Contract Ledger */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent AI Clause Analyses</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search contracts..." 
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
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Contract Title & Type</th>
                <th className="px-6 py-4 font-medium">AI Identified Risks</th>
                <th className="px-6 py-4 font-medium text-center">Risk Score</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {contractData.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(contract.status)}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusBadge(contract.status)}`}>
                        {contract.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{contract.title}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{contract.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    {contract.flaggedClauses.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {contract.flaggedClauses.map((clause, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">{clause.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{clause.issue}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">No deviations detected.</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {contract.riskScore}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">/100</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center justify-end gap-1 w-full">
                      View Redlines <ChevronRight className="w-4 h-4" />
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
