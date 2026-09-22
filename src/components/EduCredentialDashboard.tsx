import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  UserCheck,
  FileBadge
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const verifications = [
  {
    id: 'VER-2026-EDU-01',
    candidate: 'Arif Rahman',
    institution: 'University of Dhaka',
    degree: 'BSc Computer Science',
    verificationType: 'Transcript Audit',
    status: 'VERIFIED',
    score: 100,
    date: '2026-09-06'
  },
  {
    id: 'VER-2026-EDU-02',
    candidate: 'Sultana Ahmed',
    institution: 'London School of Economics',
    degree: 'MSc Finance',
    verificationType: 'Degree Validation',
    status: 'FLAGGED',
    score: 45,
    flag: 'Institutional records mismatch (Dates)',
    date: '2026-09-05'
  },
  {
    id: 'VER-2026-EDU-03',
    candidate: 'James Wilson',
    institution: 'Stanford University',
    degree: 'MBA',
    verificationType: 'Professional Cert',
    status: 'PENDING_REGISTRAR',
    score: 0,
    date: '2026-09-04'
  },
  {
    id: 'VER-2026-EDU-04',
    candidate: 'Nia Sharma',
    institution: 'IIT Delhi',
    degree: 'B.Tech Mechanical',
    verificationType: 'Transcript Audit',
    status: 'FORGERY_DETECTED',
    score: 0,
    flag: 'AI Pattern Match: Template Forgery',
    date: '2026-09-03'
  }
];

const statusData = [
  { name: 'Verified', value: 850, color: '#10b981' },
  { name: 'Flagged', value: 120, color: '#f59e0b' },
  { name: 'Forgery', value: 34, color: '#f43f5e' },
];

export default function EduCredentialDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    if (status === 'VERIFIED') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
    if (status === 'FORGERY_DETECTED') return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200';
    if (status === 'FLAGGED') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Credential Verification Engine (EduTech)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Blockchain-backed diploma verification and AI-driven forgery detection for global institutions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Verification Integrity</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">{item.value} candidates</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Verification Requests</h3>
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Candidate & Institution</th>
                  <th className="px-6 py-4">Analysis</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(v.status)}`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{v.candidate}</div>
                      <div className="text-gray-500 text-xs">{v.institution}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-rose-500 font-medium">{v.flag}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
