import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Network, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Server,
  Activity
} from 'lucide-react';
import { complianceVectorOrchestrator, SyncMetrics } from '../../services/compliance-vectorization-orchestrator';

export const VectorSyncIndicator: React.FC = () => {
  const [metrics, setMetrics] = useState<SyncMetrics>(() => complianceVectorOrchestrator.getMetrics());
  const [isOpen, setIsOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial metrics fetch
    setMetrics(complianceVectorOrchestrator.getMetrics());

    // Listen for custom vector sync events from orchestrator
    const handleMetricsUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as SyncMetrics;
      if (detail) {
        setMetrics(detail);
      } else {
        setMetrics(complianceVectorOrchestrator.getMetrics());
      }
    };

    window.addEventListener('vector-sync-metrics', handleMetricsUpdate);

    // Periodic polling as fallback
    const interval = setInterval(() => {
      setMetrics(complianceVectorOrchestrator.getMetrics());
    }, 3000);

    return () => {
      window.removeEventListener('vector-sync-metrics', handleMetricsUpdate);
      clearInterval(interval);
    };
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await complianceVectorOrchestrator.syncPendingComplianceLogs();
      setMetrics(complianceVectorOrchestrator.getMetrics());
    } catch (err) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleSimulateEnforcementEvent = async () => {
    try {
      await complianceVectorOrchestrator.enqueueEnforcementEvent({
        tenantId: 'tenant-demo-' + Math.floor(Math.random() * 900 + 100),
        countryCode: 'DE',
        regulationCode: 'EU_GDPR_ART_32',
        caseRef: `CAS-${Math.floor(Math.random() * 8999 + 1000)}`,
        levelKey: 'LVL_SUSPEND_PROCESSING',
        actionTaken: 'Simulated automated data transfer restriction & vectorization audit',
        status: 'EXECUTED',
        riskScore: Math.floor(Math.random() * 40 + 60),
        violationData: {
          reason: 'Cross-border unencrypted dataset transfer detected during automated compliance scan',
          impactedRecords: Math.floor(Math.random() * 5000 + 1000),
        }
      });
      // Immediately run sync
      await complianceVectorOrchestrator.syncPendingComplianceLogs();
      setMetrics(complianceVectorOrchestrator.getMetrics());
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  const isSyncing = metrics.status === 'SYNCING' || isManualSyncing;
  const isError = metrics.status === 'ERROR';

  return (
    <div className="hidden md:block relative" ref={containerRef} id="vector-sync-indicator-container">
      {/* Topbar Visual Badge Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
          isSyncing
            ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 ring-2 ring-cyan-400/20'
            : isError
            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
            : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
        }`}
        title="Vector & Graph DB Synchronization Pipeline Status"
        id="vector-sync-badge-btn"
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-spin" />
        ) : isError ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}

        <span className="font-mono text-[11px] font-bold tracking-tight hidden sm:inline-block">
          {isSyncing
            ? `Vectorizing${metrics.queueSize > 0 ? ` (${metrics.queueSize})` : '...'}`
            : isError
            ? 'Sync Warning'
            : 'Vector Sync'}
        </span>

        <span className="hidden xl:inline-block text-[10px] opacity-75 border-l border-emerald-300 dark:border-emerald-700 pl-1.5 font-sans">
          Pg ➔ Chroma/Kùzu
        </span>
      </button>

      {/* Popover / Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-lg text-cyan-600 dark:text-cyan-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Vectorization Sync Service
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  PostgreSQL ➔ ChromaDB & Kùzu Graph Engine
                </p>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
              isSyncing 
                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' 
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
            }`}>
              {metrics.status}
            </span>
          </div>

          {/* Real-time Data Pipeline Schematic */}
          <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3 text-indigo-500" /> PostgreSQL
              </span>
              <ArrowRight className={`w-3.5 h-3.5 ${isSyncing ? 'text-cyan-500 animate-pulse' : 'text-slate-400'}`} />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-500" /> Vectorizer
              </span>
              <ArrowRight className={`w-3.5 h-3.5 ${isSyncing ? 'text-cyan-500 animate-pulse' : 'text-slate-400'}`} />
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-500" /> Chroma & Kùzu
              </span>
            </div>

            {/* Progress bar animation */}
            <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  isSyncing 
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 w-full animate-pulse' 
                    : 'bg-emerald-500 w-full'
                }`}
              />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Vectorized Documents</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
                {metrics.chromaDocumentCount.toLocaleString()}
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> ChromaDB Collection
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Graph Lineage Nodes</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
                {metrics.kuzuNodeCount.toLocaleString()}
              </span>
              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 mt-0.5">
                <Network className="w-2.5 h-2.5" /> Kùzu Lineage Graph
              </span>
            </div>
          </div>

          {/* Queue & Last Sync Info */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>Pending Queue: <strong className="font-mono text-slate-800 dark:text-slate-200">{metrics.queueSize} items</strong></span>
            <span>
              Last Sync:{' '}
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                {metrics.lastSyncTimestamp ? new Date(metrics.lastSyncTimestamp).toLocaleTimeString() : 'Active'}
              </strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Force Sync Now'}
            </button>

            <button
              onClick={handleSimulateEnforcementEvent}
              disabled={isSyncing}
              className="flex items-center justify-center gap-1 py-1.5 px-3 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              title="Enqueue a test compliance enforcement log to test live vectorization"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Simulate Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
