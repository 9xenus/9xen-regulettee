import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const piiLeakData = [
  { day: 'Mon', leaks: 4 },
  { day: 'Tue', leaks: 2 },
  { day: 'Wed', leaks: 5 },
  { day: 'Thu', leaks: 1 },
  { day: 'Fri', leaks: 3 },
  { day: 'Sat', leaks: 0 },
  { day: 'Sun', leaks: 1 },
];

const auditResultsData = [
  { name: 'Passed', value: 85 },
  { name: 'Failed', value: 15 },
];

export const ComplianceHealthCard: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-slate-900 text-slate-100 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-800 shadow-xl">
      <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-indigo-400" />
        Compliance Health
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">PII Leakage Trends</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={piiLeakData}>
                <defs>
                  <linearGradient id="colorLeaks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="leaks" stroke="#818cf8" fillOpacity={1} fill="url(#colorLeaks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Tracker Audit Results</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditResultsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
