import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Map as MapIcon, 
  ShieldAlert, 
  Activity, 
  Database,
  ChevronRight,
  TrendingUp,
  Droplets,
  RefreshCw,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Radar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithRetry } from '../lib/api-client';

const subsidyData = [
  { region: 'Dhaka', allocated: 45, utilized: 42 },
  { region: 'Sylhet', allocated: 38, utilized: 12 },
  { region: 'Rajshahi', allocated: 52, utilized: 48 },
  { region: 'Chattogram', allocated: 60, utilized: 58 },
  { region: 'Khulna', allocated: 35, utilized: 31 },
];

export default function AgriSubsidiesDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'satellite'>('overview');
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);

  useEffect(() => {
    loadAgriData();
  }, []);

  const loadAgriData = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/agri/audit');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setAnomalies(data.anomalies);
      }
    } catch (e) {
      console.warn('Agri API fail', e);
    }
  };

  const handleRunAudit = async () => {
    setIsScanning(true);
    // Simulate satellite scan delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    await loadAgriData();
    setIsScanning(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
              Horizon 3 • South Asia Sovereignty Pack
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Agri-Subsidies Audit & Fraud Detection
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-2xl text-sm">
            Detecting ghost-farmers, duplicate allocations, and land-use mismatches via high-resolution satellite reconciliation and cross-agency identity verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAudit}
            disabled={isScanning}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
            {isScanning ? 'Syncing Satellite Data...' : 'Run Ground-Truth Audit'}
          </button>
          <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 pb-px">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: Activity },
          { id: 'anomalies', label: 'Anomaly Feed', icon: AlertTriangle },
          { id: 'satellite', label: 'Satellite Analysis', icon: MapIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all relative ${
              activeTab === tab.id 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="agri-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.duplicateIdFlagCount || 0}
                </span>
                <span className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-tight">Duplicate Subsidy IDs Flagged</span>
                <div className="mt-2 text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">+4.2% from last cycle</div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ৳ {(stats?.ghostFarmerFundReclaim / 1000000).toFixed(0) || 450}M
                </span>
                <span className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-tight">Funds Reclaimed (Ghost Farmers)</span>
                <div className="mt-2 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Automated recovery enabled</div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.satelliteGroundTruthScore || 94}%
                </span>
                <span className="text-xs text-gray-500 uppercase font-bold mt-1 tracking-tight">Satellite Ground-Truth Score</span>
                <div className="mt-2 text-[10px] text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">Sentinel-2 High-Res Sync</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Regional Allocation vs Utilization
                </h3>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subsidyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                      <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', border: '1px solid #374151' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '20px' }} />
                      <Bar dataKey="allocated" name="Allocated (৳ Cr)" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="utilized" name="Utilized (৳ Cr)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-widest">Recent Red Flags</h3>
                  <div className="space-y-3">
                    {anomalies.slice(0, 3).map((anomaly) => (
                      <div key={anomaly.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 flex gap-3">
                        <div className={`mt-0.5 ${anomaly.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-gray-900 dark:text-white">{anomaly.type}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{anomaly.notes}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('anomalies')}
                    className="w-full mt-4 py-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                  >
                    View All Anomalies
                  </button>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-xl text-white shadow-lg shadow-emerald-600/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Status</span>
                  </div>
                  <div className="text-lg font-bold">Audit Cycle v2.4</div>
                  <div className="text-xs opacity-90 mt-1">Satellite ground-truth confirms 92% of fertilizer subsidies reached verified land parcels.</div>
                  <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all">
                    Generate Final Report
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'anomalies' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Active Audit Anomalies</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search anomalies..." 
                    className="pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400">
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/30 text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4">Anomaly ID</th>
                    <th className="px-6 py-4">Region</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {anomalies.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{item.region}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-[10px] font-bold">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 
                          item.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'INVESTIGATING' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                          {item.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'satellite' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden h-[500px]">
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                {/* Mock Map Background */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i2345!3i1567!2m3!1e0!2sm!3i634234567!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1f2!24m8!2m3!5m2!1141!2i376!4m1!2i3138!7e81!15m3!1m2!1s0x0%3A0x0!2sDhaka!4m2!1d90.4125!2d23.8103')] bg-cover" />
                
                <div className="relative flex flex-col items-center text-center p-8">
                  <Radar className="w-16 h-16 text-emerald-500 mb-4 animate-pulse" />
                  <h4 className="text-lg font-bold text-white">Live Satellite Ground-Truth Visualizer</h4>
                  <p className="text-sm text-gray-400 mt-2 max-w-md">Overlaying Sentinel-2 normalized difference vegetation index (NDVI) data with subsidy claim boundaries.</p>
                  <div className="mt-6 flex gap-3">
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">Enable Thermal Layer</button>
                    <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/20">Analyze Crop Health</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-widest">Parcel Verification Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">Total Parcels Scanned</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">14,205</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">Verified Land Use</span>
                    <span className="text-sm font-bold text-emerald-500">12,890</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">Mismatched Parcels</span>
                    <span className="text-sm font-bold text-rose-500">1,315</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-400 mb-2">Satellite Resolution Status</div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Ultra High Res</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-widest">Reconciliation Tools</h3>
                <div className="space-y-2">
                  <button className="w-full py-2.5 px-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 flex items-center justify-between transition-all">
                    Automated Fund Recovery
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button className="w-full py-2.5 px-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 flex items-center justify-between transition-all">
                    Agency Cross-Reference
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
