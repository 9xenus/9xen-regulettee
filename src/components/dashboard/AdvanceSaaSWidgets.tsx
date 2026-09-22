import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Activity, Zap, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock,
  ShieldCheck, FileText, Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', apiCalls: 4000, activeUsers: 2400 },
  { name: 'Tue', apiCalls: 3000, activeUsers: 1398 },
  { name: 'Wed', apiCalls: 2000, activeUsers: 9800 },
  { name: 'Thu', apiCalls: 2780, activeUsers: 3908 },
  { name: 'Fri', apiCalls: 1890, activeUsers: 4800 },
  { name: 'Sat', apiCalls: 2390, activeUsers: 3800 },
  { name: 'Sun', apiCalls: 3490, activeUsers: 4300 },
];

const metrics = [
  {
    id: 1,
    name: 'Active API Calls',
    value: '24.5K',
    change: '+12.5%',
    trend: 'up',
    icon: Zap,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    id: 2,
    name: 'Daily Active Users',
    value: '8,249',
    change: '+4.1%',
    trend: 'up',
    icon: Users,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    id: 3,
    name: 'Compliance Drift Risk',
    value: '1.2%',
    change: '-0.4%',
    trend: 'down',
    icon: ShieldCheck,
    color: 'text-teal-600 bg-teal-50 border-teal-100',
    iconColor: 'text-teal-600'
  },
  {
    id: 4,
    name: 'Est. Monthly Cost',
    value: '€1,240',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-rose-600 bg-rose-50 border-rose-100',
    iconColor: 'text-rose-600'
  }
];

const activities = [
  { id: 1, action: 'Policy Auto-Patched', target: 'EU AI Act Ruleset', time: '10 mins ago', icon: FileText, color: 'text-indigo-500 bg-indigo-50' },
  { id: 2, action: 'Data Sovereign Sync', target: 'Frankfurt Enclave', time: '1 hour ago', icon: Globe, color: 'text-teal-500 bg-teal-50' },
  { id: 3, action: 'User Consent Revoked', target: 'Client ID: 8991X', time: '2 hours ago', icon: Users, color: 'text-rose-500 bg-rose-50' },
  { id: 4, action: 'Background Audit', target: 'NIS2 Compliance', time: '5 hours ago', icon: Activity, color: 'text-emerald-500 bg-emerald-50' },
];

export const AdvanceSaaSWidgets: React.FC<{ role?: 'client' | 'lawyer' | 'regulator' }> = ({ role = 'client' }) => {
  return (
    <div className="space-y-6 mb-8">
      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl ${item.color} border transition-transform group-hover:scale-110`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                item.trend === 'up' && item.name !== 'Compliance Drift Risk' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                item.trend === 'down' && item.name === 'Compliance Drift Risk' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                'text-rose-700 bg-rose-50 border border-rose-100'
              }`}>
                {item.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {item.change}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{item.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Telemetry Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Platform Telemetry</h3>
              <p className="text-xs text-slate-500 mt-1">API Requests vs Active Users over the last 7 days</p>
            </div>
            <select className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="apiCalls" name="API Calls" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorApi)" />
                <Area type="monotone" dataKey="activeUsers" name="Active Users" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Live Activity Feed</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          
          <div className="space-y-5 flex-1">
            {activities.map((activity, idx) => (
              <div key={activity.id} className="relative flex gap-4">
                {idx !== activities.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-[-20px] w-px bg-slate-200"></div>
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.color} border border-white shadow-sm`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="pt-1 flex-1">
                  <p className="text-xs font-bold text-slate-900">{activity.action}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{activity.target}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors border border-slate-200 cursor-pointer">
            View Complete Ledger
          </button>
        </motion.div>
      </div>
    </div>
  );
};
