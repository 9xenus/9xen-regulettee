import React from 'react';
import { EntityNetworkExplorer } from '../components/intel/EntityNetworkExplorer';
import { Network, ArrowLeft, ShieldAlert, Cpu } from 'lucide-react';

export const EntityNetworkExplorerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <a
              href="#dashboard"
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Central Dashboard</span>
            </a>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>National Entity Network & Graph Intelligence Explorer</span>
                <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                  Phase 1 Deliverable 5/38
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Interactive topological investigation workbench for serial operators, shell loops, risk contagion, and court dossiers.
              </p>
            </div>
          </div>
        </div>

        {/* Engine Status Indicators */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-300">Graph Store: ACTIVE</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono text-slate-400">Analytics: ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Explorer Component */}
      <EntityNetworkExplorer />
    </div>
  );
};
