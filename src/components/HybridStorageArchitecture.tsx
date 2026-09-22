import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, Server, Network, Activity, HardDrive, Cpu, Cloud, Zap, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart3, Globe, Shield, Terminal, Clock, Settings, Search, FileText } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DBStatus {
  name: string;
  type: string;
  status: 'Installed' | 'Pending' | 'Error';
  icon: React.ElementType;
  description: string;
  latency: number;
  iops: number;
  uptime: string;
}

const dbMetricsData = [
  { time: '00:00', readIOPS: 1200, writeIOPS: 450, latency: 12 },
  { time: '04:00', readIOPS: 1800, writeIOPS: 600, latency: 18 },
  { time: '08:00', readIOPS: 3200, writeIOPS: 1200, latency: 35 },
  { time: '12:00', readIOPS: 4800, writeIOPS: 1800, latency: 42 },
  { time: '16:00', readIOPS: 5200, writeIOPS: 2100, latency: 45 },
  { time: '20:00', readIOPS: 2800, writeIOPS: 900, latency: 25 },
];

const apiTrafficData = [
  { time: '00:00', requests: 4500, errors: 12 },
  { time: '04:00', requests: 5200, errors: 8 },
  { time: '08:00', requests: 12500, errors: 45 },
  { time: '12:00', requests: 18200, errors: 82 },
  { time: '16:00', requests: 21000, errors: 95 },
  { time: '20:00', requests: 8400, errors: 24 },
];

const activeQueries = [
  { id: 'q-9932', db: 'SQLite (EU)', query: 'SELECT * FROM compliance_logs WHERE...', time: '42ms', status: 'Running' },
  { id: 'q-9933', db: 'Kùzu (US)', query: 'MATCH (a:Vendor)-[r:SUPPLIES]->(b:Entity)...', time: '12ms', status: 'Completed' },
  { id: 'q-9934', db: 'LanceDB (Global)', query: 'search(embeddings, { text: "GDPR violation..." })', time: '89ms', status: 'Running' },
  { id: 'q-9935', db: 'DuckDB (UK)', query: 'SELECT region, COUNT(*) FROM analytics GROUP...', time: '155ms', status: 'Running' },
  { id: 'q-9936', db: 'SQLite (ASIA)', query: 'UPDATE regional_policies SET active = true...', time: '8ms', status: 'Completed' },
];

export const HybridStorageArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DATABASE_METRICS' | 'API_GATEWAY' | 'QUERY_LOGS'>('OVERVIEW');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch("/api/v1/ai-knowledge/sync-status");
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
      }
    } catch (e: any) {
      console.error("Error fetching sync status", e);
    }
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/v1/ai-knowledge/sync", {
        method: "POST"
      });
      if (res.ok) {
        await fetchSyncStatus();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to synchronize indexing.");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Network error during synchronization.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const databases: DBStatus[] = [
    {
      name: 'Sharded SQLite (better-sqlite3)',
      type: 'Multi-Region Relational',
      status: 'Installed',
      icon: HardDrive,
      description: 'Primary ledger sharded across 8 regions (EU, US, UK, ASIA, etc.) to enforce strict data residency and GDPR isolation.',
      latency: 4.2,
      iops: 12450,
      uptime: '99.999%'
    },
    {
      name: 'Regional Kùzu DB',
      type: 'Sharded Graph Database',
      status: 'Installed',
      icon: Network,
      description: 'Region-specific relationship mapping for sovereign supply chains and cross-border compliance tracing.',
      latency: 12.8,
      iops: 4200,
      uptime: '99.98%'
    },
    {
      name: 'Regional LanceDB',
      type: 'Sharded Vector Database',
      status: 'Installed',
      icon: Database,
      description: 'Distributed semantic search for legal documents, keeping PII embeddings strictly within their originating jurisdiction.',
      latency: 24.5,
      iops: 8900,
      uptime: '99.95%'
    },
    {
      name: 'Regional DuckDB',
      type: 'Sharded OLAP Database',
      status: 'Installed',
      icon: Activity,
      description: 'Embedded analytical engine for high-performance regulatory reporting and automated compliance dashboards per region.',
      latency: 18.2,
      iops: 15600,
      uptime: '99.99%'
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">API & Database Control Center</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Full-stack observability for hybrid storage, API gateways, and regional clusters.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className={`p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" /> Optimize Clusters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-6">
        {[
          { id: 'OVERVIEW', label: 'Architecture Overview', icon: Cloud },
          { id: 'DATABASE_METRICS', label: 'Database IOPS & Latency', icon: Database },
          { id: 'API_GATEWAY', label: 'API Gateway Traffic', icon: Zap },
          { id: 'QUERY_LOGS', label: 'Live Query Analyzer', icon: Terminal }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 animate-fade-in">
            {/* Real-time SQLite to RAG Index Sync status banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-sm">Real-Time RAG Database Synchronization</h3>
                    {syncStatus?.rag?.status === 'SYNCHRONIZED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        SYNCHRONIZED
                      </span>
                    ) : syncStatus?.rag?.status === 'OUT_OF_SYNC' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        OUT OF SYNC
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        PENDING INITIALIZATION
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl font-medium">
                    This module continuously monitors and validates that legal obligations sharded in SQLite match embeddings in the RAG search indexer (ChromaDB) to prevent hallucinated compliance evaluations.
                  </p>
                </div>
                
                <button
                  onClick={triggerSync}
                  disabled={isSyncing}
                  className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 ${
                    isSyncing 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Synchronizing Index...' : 'Force SQLite Sync'}
                </button>
              </div>

              {errorMessage && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-150 rounded-lg text-rose-800 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60">
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Embedded SQLite File</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-1 block">compliance.db</span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SQLite Active Entries</span>
                  <span className="text-xs font-mono font-bold text-indigo-600 mt-1 block">
                    {syncStatus?.sqlite?.totalRecords ?? 0} records
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ChromaDB Collection</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-1 block">regulatory_docs</span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Indexed RAG Vectors</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 mt-1 block">
                    {syncStatus?.rag?.indexedCount ?? 0} vectors
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {databases.map((db, idx) => (
                <div key={idx} className="border border-slate-200 bg-white rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 border border-indigo-100 shadow-sm rounded-lg text-indigo-600">
                        <db.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{db.name}</h3>
                        <p className="text-[11px] font-black tracking-wider uppercase text-indigo-600 mt-0.5">{db.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {db.status}
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed relative z-10">
                    {db.description}
                  </p>
                  
                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 relative z-10">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Latency</p>
                      <p className="text-sm font-black text-slate-800">{db.latency}ms</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">IOPS (Max)</p>
                      <p className="text-sm font-black text-slate-800">{db.iops.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Uptime</p>
                      <p className="text-sm font-black text-emerald-600">{db.uptime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-400" /> Global Data Sovereignty Mesh</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-xl">
                    All storage engines are currently participating in the global mesh. Data residency rules are actively routing payloads to correct jurisdictional nodes with 100% compliance.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center bg-slate-800/80 border border-slate-700 rounded-lg p-3 min-w-[100px]">
                    <div className="text-2xl font-black text-emerald-400">8</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Regions</div>
                  </div>
                  <div className="text-center bg-slate-800/80 border border-slate-700 rounded-lg p-3 min-w-[100px]">
                    <div className="text-2xl font-black text-indigo-400">142</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Edge Nodes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATABASE METRICS */}
        {activeTab === 'DATABASE_METRICS' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Cpu className="w-6 h-6" /></div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase">Avg Cluster CPU</p>
                   <p className="text-2xl font-black text-slate-900">42.8%</p>
                 </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><Activity className="w-6 h-6" /></div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase">Total Read IOPS</p>
                   <p className="text-2xl font-black text-slate-900">18.4K</p>
                 </div>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><Clock className="w-6 h-6" /></div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase">P99 Latency</p>
                   <p className="text-2xl font-black text-slate-900">45ms</p>
                 </div>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> IOPS & Latency Trend (24h)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dbMetricsData}>
                    <defs>
                      <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWrite" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="readIOPS" name="Read IOPS" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRead)" />
                    <Area yAxisId="left" type="monotone" dataKey="writeIOPS" name="Write IOPS" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWrite)" />
                    <Line yAxisId="right" type="monotone" dataKey="latency" name="Latency (ms)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: API GATEWAY */}
        {activeTab === 'API_GATEWAY' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-indigo-800 border-4 border-indigo-700 flex items-center justify-center relative">
                   <Zap className="w-8 h-8 text-indigo-300" />
                   <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-indigo-900 animate-pulse"></div>
                 </div>
                 <div>
                   <h3 className="text-xl font-black">Global API Gateway</h3>
                   <p className="text-indigo-300 text-sm">v4.2.1 • Multi-Region Edge Routing Active</p>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="bg-indigo-800/50 rounded-lg p-3 border border-indigo-700/50 text-center">
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Current RPS</p>
                    <p className="text-2xl font-black text-white">4,285</p>
                  </div>
                  <div className="bg-indigo-800/50 rounded-lg p-3 border border-indigo-700/50 text-center">
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Error Rate</p>
                    <p className="text-2xl font-black text-emerald-400">0.04%</p>
                  </div>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Ingress Traffic Volume</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={apiTrafficData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="requests" name="Total Requests" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="errors" name="Errors (4xx/5xx)" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUERY LOGS */}
        {activeTab === 'QUERY_LOGS' && (
          <div className="space-y-4 animate-fade-in">
             <div className="flex items-center justify-between mb-2">
               <h3 className="font-bold text-slate-800 flex items-center gap-2"><Search className="w-4 h-4 text-slate-500" /> Active Query Analyzer</h3>
               <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Live Stream</span>
             </div>
             
             <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
               <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                 <div className="col-span-2">Trace ID</div>
                 <div className="col-span-2">Engine</div>
                 <div className="col-span-5">Query Fragment</div>
                 <div className="col-span-1">Duration</div>
                 <div className="col-span-2">Status</div>
               </div>
               <div className="divide-y divide-slate-800/50">
                 {activeQueries.map((query, i) => (
                   <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-mono hover:bg-slate-800/30 transition-colors">
                     <div className="col-span-2 text-indigo-400">{query.id}</div>
                     <div className="col-span-2 text-emerald-400 text-xs">{query.db}</div>
                     <div className="col-span-5 text-slate-300 truncate pr-4">{query.query}</div>
                     <div className="col-span-1 text-amber-400">{query.time}</div>
                     <div className="col-span-2">
                       {query.status === 'Running' ? (
                         <span className="inline-flex items-center gap-1.5 text-sky-400 text-xs bg-sky-400/10 px-2 py-0.5 rounded-full">
                           <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span> Running
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs bg-emerald-400/10 px-2 py-0.5 rounded-full">
                           <CheckCircle2 className="w-3 h-3" /> Done
                         </span>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             <p className="text-xs text-slate-500 text-center mt-2">Showing last 5 captured queries across all data regions.</p>
          </div>
        )}
      </div>
    </div>
  );
};
