import React, { useState } from 'react';
import { 
  Zap, 
  Leaf, 
  Activity, 
  ShieldCheck, 
  Globe, 
  BarChart3, 
  AlertTriangle, 
  Database,
  ArrowUpRight,
  TrendingUp,
  Wind,
  Sun,
  Droplets,
  Factory,
  CheckCircle2,
  Lock,
  RefreshCw,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const GRID_LOAD_DATA = [
  { time: '00:00', load: 4500, carbon: 120 },
  { time: '04:00', load: 3800, carbon: 90 },
  { time: '08:00', load: 7200, carbon: 210 },
  { time: '12:00', load: 8500, carbon: 240 },
  { time: '16:00', load: 7800, carbon: 190 },
  { time: '20:00', load: 6500, carbon: 150 },
  { time: '23:59', load: 4800, carbon: 130 },
];

const EMISSIONS_BY_SOURCE = [
  { name: 'Grid Consumption', value: 45, color: '#6366f1' },
  { name: 'Fleet Logistics', value: 25, color: '#8b5cf6' },
  { name: 'Manufacturing', value: 20, color: '#ec4899' },
  { name: 'Supply Chain', value: 10, color: '#f43f5e' },
];

const ESG_SCORE_DATA = [
  { name: 'Environment', value: 92, color: '#10b981' },
  { name: 'Social', value: 88, color: '#6366f1' },
  { name: 'Governance', value: 96, color: '#8b5cf6' },
];

export default function EnergyGridSustainabilityDashboard() {
  const [activeTab, setActiveTab] = useState<'grid' | 'esg' | 'carbon'>('grid');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              Pack 3: Energy & National Infrastructure
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              Sovereign Grid v2.4
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Zap className="w-8 h-8 text-amber-500" />
            Energy Grid & Sustainability Oversight
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Real-time monitoring of grid load stability, carbon credit tokenization, and ESG compliance across national energy corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Grid Telemetry
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            <FileText className="w-4 h-4" />
            Generate ESG Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Grid Load', value: '7,420 MW', change: '+2.4%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Carbon Intensity', value: '185 gCO2/kWh', change: '-5.1%', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Renewable Mix', value: '42.8%', change: '+12%', icon: Sun, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Sustainability Score', value: '94/100', change: 'Stable', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stat.change.startsWith('+') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid Load Visualizer */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Live Grid Analytics
              </h3>
              <p className="text-xs text-slate-500">Real-time balancing of national energy supply vs demand</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Load Graph
              </button>
              <button 
                onClick={() => setActiveTab('esg')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'esg' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                ESG Scorecard
              </button>
              <button 
                onClick={() => setActiveTab('carbon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'carbon' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Carbon Intensity
              </button>
            </div>
          </div>

          <div className="flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'grid' ? (
                <AreaChart data={GRID_LOAD_DATA}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="load" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              ) : activeTab === 'esg' ? (
                <BarChart data={ESG_SCORE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={36}>
                    {ESG_SCORE_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={GRID_LOAD_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="carbon" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESG Audit Log */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Statutory ESG Audit Log
          </h3>
          <div className="space-y-4">
            {[
              { title: 'EU Taxonomy Alignment', status: 'COMPLIANT', time: '2h ago', detail: 'Verified green energy share >= 40%' },
              { title: 'Scope 3 Supply Chain', status: 'IN_REVIEW', time: '5h ago', detail: 'Cross-border logistical audit pending' },
              { title: 'Merkle Carbon Ledger', status: 'SEALED', time: '1d ago', detail: 'Block #829,102 verified by DPA' },
              { title: 'Grid Load Variance', status: 'STABLE', time: '3d ago', detail: 'No peak-hour threshold violations' },
            ].map((audit, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    audit.status === 'COMPLIANT' ? 'bg-emerald-500' : 
                    audit.status === 'IN_REVIEW' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`} />
                  <div className="w-px h-full bg-slate-100 my-1" />
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{audit.title}</span>
                    <span className="text-[9px] font-mono text-slate-400">{audit.time}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{audit.detail}</div>
                  <div className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${
                    audit.status === 'COMPLIANT' ? 'bg-emerald-50 text-emerald-700' :
                    audit.status === 'IN_REVIEW' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {audit.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-2 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition flex items-center justify-center gap-1">
            View Immutable Audit Ledger
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carbon Credit Registry */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                Carbon Credit & Tokenization
              </h3>
              <p className="text-xs text-slate-400">Blockchain-verified carbon offset registry (Sovereign Enclave)</p>
            </div>
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Active Pool: 2.8M TCO2</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { project: 'Solar Farm Alpha (ES)', credits: '145,000', price: '€82.40', type: 'SOLAR' },
              { project: 'Wind Corridor Beta (DE)', credits: '82,500', price: '€78.10', type: 'WIND' },
              { project: 'Oceanic Restoration (PT)', credits: '210,000', price: '€94.50', type: 'BLUE' },
            ].map((p, i) => (
              <div key={i} className="group bg-slate-800/40 hover:bg-slate-800 transition p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700">
                    {p.type === 'SOLAR' ? <Sun className="w-5 h-5 text-amber-400" /> : 
                     p.type === 'WIND' ? <Wind className="w-5 h-5 text-sky-400" /> : 
                     <Droplets className="w-5 h-5 text-indigo-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{p.project}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.credits} MT Certified Offsets</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-400">{p.price}</div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Current Spot</div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
            <Lock className="w-4 h-4" />
            Issue New Carbon Tokens
          </button>
        </div>

        {/* Infrastructure Compliance Health */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Factory className="w-5 h-5 text-indigo-600" />
            Industrial Infrastructure Health
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Smart Grid Efficiency</span>
                <span className="text-xs font-black text-slate-900">92.4%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '92.4%' }}
                  className="h-full bg-indigo-500" 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Renewable Penetration</span>
                <span className="text-xs font-black text-slate-900">42.8%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '42.8%' }}
                  className="h-full bg-emerald-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Critical Alerts</span>
                </div>
                <div className="text-2xl font-black text-slate-900">0</div>
                <div className="text-[10px] text-slate-500 mt-1">Grid frequency is stable (50.02Hz)</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Certifications</span>
                </div>
                <div className="text-2xl font-black text-slate-900">12</div>
                <div className="text-[10px] text-slate-500 mt-1">ISO 50001 & EU Taxonomy valid</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
