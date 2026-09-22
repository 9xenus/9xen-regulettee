import React from 'react';
import { SovereigntyMap } from '../components/SovereigntyMap';
import { GlobalJurisdictionWorldMap } from '../components/admin/GlobalJurisdictionWorldMap';
import { Globe } from 'lucide-react';

export const SovereigntyDashboard: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-8 h-8 text-indigo-500" />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sovereignty Dashboard</h1>
      </div>
      <GlobalJurisdictionWorldMap />
      <SovereigntyMap />
    </div>
  );
};
