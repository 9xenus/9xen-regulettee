import React from 'react';
import { StatutoryGazetteWatchdog } from '../components/compliance/StatutoryGazetteWatchdog';
import { Scale, Globe, Zap } from 'lucide-react';

export const StatutoryGazetteWatchdogPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>GLOBAL REGULATORY INTELLIGENCE</span>
            <span>/</span>
            <span className="text-slate-500">OFFICIAL GAZETTE CRAWLER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-emerald-600" />
            Statutory Gazette Watchdog & Legal Diff Visualizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time automated tracking of state gazettes, legal amendments, line-by-line statutory diffs, and executable sovereign enclave rule patches.
          </p>
        </div>
      </div>

      <StatutoryGazetteWatchdog />
    </div>
  );
};

export default StatutoryGazetteWatchdogPage;
