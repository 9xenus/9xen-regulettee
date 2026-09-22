import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Globe, Shield, RefreshCw } from 'lucide-react';

// Mock mapping of regions/countries to feature flags
const REGIONAL_FEATURE_MAPPING: Record<string, string[]> = {
  'EU': ['GDPR_COMPLIANCE', 'EU_AI_ACT', 'DORA_RESILIENCE'],
  'USA': ['CCPA_CPRA', 'HIPAA_COMPLIANCE', 'SEC_CYBER'],
  'ASIA': ['SG_PDPA', 'INDIA_DPDP'],
  'LATIN_AMERICA': ['BR_LGPD'],
  'UK': ['UK_GDPR', 'UK_FINANCIAL_CONDUCT']
};

export const RegionalFeatureToggleManager: React.FC = () => {
  const [regions, setRegions] = useState<Record<string, boolean>>({
    'EU': true,
    'USA': true,
    'ASIA': false,
    'LATIN_AMERICA': false,
    'UK': true
  });

  const toggleRegion = (region: string) => {
    setRegions(prev => ({ ...prev, [region]: !prev[region] }));
    // Here we would call an API to update the backend feature flag config
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          Multi-Region Regulatory Control
        </h3>
        <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800">
          <RefreshCw className="w-3 h-3" /> Sync Policy Acts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(regions).map(region => (
          <div key={region} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <span className="font-semibold text-sm">{region}</span>
            <button onClick={() => toggleRegion(region)}>
              {regions[region] ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          Auto-Enabled Features (Based on Regions)
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(regions)
            .filter(([_, enabled]) => enabled)
            .flatMap(([region, _]) => REGIONAL_FEATURE_MAPPING[region] || [])
            .map((flag, i) => (
              <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px] font-mono font-bold">
                {flag}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};
