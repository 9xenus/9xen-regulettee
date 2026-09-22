import React from 'react';
import { PartnerPlatformPortal } from '../components/partner/PartnerPlatformPortal';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const PartnerPlatformDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.location.hash = 'dashboard';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Return to Main Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                Institutional Integration Hub
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <span>Partner Platform Control Center</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gateway Status: <strong>LIVE (0.0.0.0:3000/api/v1/prt)</strong></span>
        </div>
      </div>

      {/* Main Portal Body */}
      <PartnerPlatformPortal />
    </div>
  );
};
