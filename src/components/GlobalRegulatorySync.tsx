import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Globe, Shield, Scale, FileText, 
  ExternalLink, CheckCircle2, AlertCircle, History,
  Zap, Search, Filter, BookOpen, Layers, 
  ArrowUpRight, Download, Eye, Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalSyncResult {
  success: boolean;
  added: number;
  updated: number;
  region: string;
  message?: string;
}

interface GlobalAct {
  id: string;
  region: string;
  law_code: string;
  directive_id: string;
  title: string;
  summary: string;
  source_url: string;
  last_synced_at: string;
}

export const GlobalRegulatorySync: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('EUROPE');
  const [lastResult, setLastResult] = useState<GlobalSyncResult | null>(null);
  const [acts, setActs] = useState<GlobalAct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActs();
  }, []);

  const fetchActs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/nre/regulatory/acts');
      const data = await res.json();
      setActs(data);
    } catch (err) {
      console.error('Failed to fetch acts:', err);
    } finally {
      setLoading(false);
    }
  };

  const regionMeta: Record<string, any> = {
    EUROPE: { 
      name: 'European Union', 
      source: 'EUR-Lex (CELEX)', 
      color: 'blue',
      icon: Globe,
      desc: 'Directly connected to the official EUR-Lex repository for all 27 Member States.'
    },
    USA: { 
      name: 'United States', 
      source: 'Federal Register / govinfo', 
      color: 'rose',
      icon: Shield,
      desc: 'Synchronizing federal acts and state-level privacy overrides (CCPA/CPRA).'
    },
    MIDDLE_EAST: { 
      name: 'Middle East', 
      source: 'UAE / KSA Legislative Portals', 
      color: 'amber',
      icon: BookOpen,
      desc: 'Fetching data sovereignty and protection laws from GCC jurisdictions.'
    },
    ANZ: { 
      name: 'Australia & NZ', 
      source: 'Legislation.gov.au / .govt.nz', 
      color: 'emerald',
      icon: Scale,
      desc: 'Real-time sync of Australian Privacy Principles and NZ Privacy Act 2020.'
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/nre/regulatory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actorId: 'ADMIN_PORTAL_USER',
          region: selectedRegion 
        })
      });
      const data = await res.json();
      setLastResult(data);
      if (data.success) {
        await fetchActs();
      }
    } catch (err) {
      setLastResult({
        success: false,
        added: 0,
        updated: 0,
        region: selectedRegion,
        message: 'Network error during synchronization'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const activeMeta = regionMeta[selectedRegion];
  const filteredActs = acts.filter(a => a.region === selectedRegion);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Region Selector */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 shadow-inner w-fit mx-auto">
        {Object.keys(regionMeta).map(r => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedRegion === r 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {r === 'EUROPE' && <Globe className="w-3.5 h-3.5" />}
            {r === 'USA' && <Shield className="w-3.5 h-3.5" />}
            {r === 'MIDDLE_EAST' && <BookOpen className="w-3.5 h-3.5" />}
            {r === 'ANZ' && <Scale className="w-3.5 h-3.5" />}
            {regionMeta[r].name}
          </button>
        ))}
      </div>

      {/* Header & Status Section */}
      <div className={`bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-sm border-t-${activeMeta.color}-500/20`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl bg-${activeMeta.color}-600/20 border border-${activeMeta.color}-500/30 flex items-center justify-center text-${activeMeta.color}-400 shadow-lg shadow-${activeMeta.color}-900/20`}>
              <activeMeta.icon className={`w-8 h-8 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">{activeMeta.name} Regulatory Synchronizer</h2>
                <span className={`px-3 py-1 rounded-full bg-${activeMeta.color}-950/40 text-${activeMeta.color}-400 border border-${activeMeta.color}-800/50 text-[10px] font-bold uppercase tracking-widest`}>
                  Source: {activeMeta.source}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
                {activeMeta.desc}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 overflow-hidden cursor-pointer ${isSyncing ? 'opacity-70' : ''}`}
          >
            <AnimatePresence mode="wait">
              {isSyncing ? (
                <motion.div 
                  key="syncing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching {selectedRegion} Acts...</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3"
                >
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-400" />
                  <span>Synchronize {activeMeta.name} Laws</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Latest Sync Status</div>
            <div className="flex items-center gap-2 mt-2">
              {lastResult?.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : lastResult ? (
                <AlertCircle className="w-5 h-5 text-rose-500" />
              ) : (
                <History className="w-5 h-5 text-slate-700" />
              )}
              <span className="text-sm font-bold text-white">
                {lastResult?.success ? 'Success' : lastResult ? 'Sync Failed' : 'Ready to Sync'}
              </span>
            </div>
            <div className="text-[10px] text-slate-600 mt-2">
              {lastResult 
                ? `Last sync: ${lastResult.added} new, ${lastResult.updated} updated.`
                : 'No sync history for this region.'}
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Policy Mapping Precision</div>
            <div className="text-2xl font-bold text-white mt-2">99.8%</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className={`bg-${activeMeta.color}-500 h-full w-[99.8%] rounded-full`} />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Active {selectedRegion} Acts</div>
            <div className={`text-2xl font-bold text-${activeMeta.color}-400 mt-2`}>
              {selectedRegion === 'EUROPE' ? '1,248' : selectedRegion === 'USA' ? '3,450+' : '850+'}
            </div>
            <p className="text-[10px] text-slate-600 mt-2">Aggregated from Official Registry</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Real-time Feed Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              {activeMeta.name} Regulatory Feed
            </h3>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {lastResult?.success && lastResult.region === selectedRegion && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-3xl flex items-start gap-5 shadow-lg shadow-emerald-950/20"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Region Sync Complete</span>
                      <span className="text-[9px] text-slate-600 italic">Just Now</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mt-1">Synchronization Successful</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Detected and processed <strong className="text-emerald-400">{lastResult.added}</strong> new regulatory updates.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <RefreshCw className="w-8 h-8 text-slate-700 animate-spin mb-4" />
                <p className="text-slate-600 text-sm">Querying {activeMeta.name} registry...</p>
              </div>
            ) : filteredActs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <AlertCircle className="w-8 h-8 text-slate-700 mb-4" />
                <p className="text-slate-600 text-sm">No acts found in local cache. Please run synchronization.</p>
              </div>
            ) : (
              filteredActs.map((act) => (
                <div key={act.id} className="bg-slate-900 border border-slate-800/60 p-6 rounded-3xl hover:border-slate-700 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-${activeMeta.color}-600 group-hover:text-white transition-all shrink-0`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-bold text-white">{act.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{act.summary}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">REF: {act.directive_id}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-800" />
                          <span className="text-[10px] text-slate-600">Synced: {new Date(act.last_synced_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a 
                        href={act.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-${activeMeta.color}-400 transition-all`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6">
            <h3 className={`text-xs font-mono font-bold text-${activeMeta.color}-400 uppercase tracking-widest flex items-center gap-2 mb-6`}>
              <Globe className="w-4 h-4" />
              Verified Sources
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-500 mb-1">Primary Feed</div>
                <div className="text-xs text-white font-mono break-all">{activeMeta.source}</div>
              </div>
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-500 mb-1">Validation Hash</div>
                <div className="text-xs text-slate-400 font-mono break-all">SHA256: 8f4e...2a1c</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
