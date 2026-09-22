import React from 'react';
import { RegulatoryRadarWidget } from '../components/dashboard/RegulatoryRadarWidget';
import { Compass, Globe, ArrowLeft } from 'lucide-react';
import { useRegionalCompliance } from '../context/RegionalComplianceContext';

export const RegulatoryRadarPage: React.FC = () => {
  const { activeRegion } = useRegionalCompliance();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 text-left">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>GLOBAL SOVEREIGN REGTECH</span>
            <span>/</span>
            <span className="text-slate-500">RADAR & AUDIT STATUS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-indigo-600" />
            Regulatory Radar & Compliance Deadlines
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time visual monitoring of upcoming statutory compliance deadlines, active supervisory audits, and extraterritorial enforcement actions.
          </p>
        </div>
      </div>

      {/* Main Widget */}
      <RegulatoryRadarWidget defaultRegion={activeRegion} />
    </div>
  );
};
