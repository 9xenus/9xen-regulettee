import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getCoverageConfigs, toggleRegionActive, bulkToggleRegions } from '../lib/coverage-store';
import { RegionalConfig, Region } from '../lib/types';
import { JurisdictionMapWidget } from './JurisdictionMapWidget';
import { GlobalJurisdictionWorldMap } from './admin/GlobalJurisdictionWorldMap';
import { JurisdictionComparisonSplitView } from './admin/JurisdictionComparisonSplitView';

export function JurisdictionDashboard() {
  const [configs, setConfigs] = useState<RegionalConfig[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);

  useEffect(() => {
    setConfigs(getCoverageConfigs());
  }, []);

  const handleToggle = (region: Region) => {
    toggleRegionActive(region);
    setConfigs(getCoverageConfigs());
  };

  const toggleSelectRegion = (region: Region) => {
    setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  };

  const handleBulkToggle = (active: boolean) => {
    bulkToggleRegions(selectedRegions, active);
    setConfigs(getCoverageConfigs());
    setSelectedRegions([]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <GlobalJurisdictionWorldMap />
      <JurisdictionMapWidget />
      
      <div className="p-4 sm:p-5 lg:p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Detailed Coverage Settings
          </h2>
          
          {selectedRegions.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => handleBulkToggle(true)} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Bulk Enable</button>
              <button onClick={() => handleBulkToggle(false)} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Bulk Disable</button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((config) => (
            <div key={config.region} className="p-4 border rounded-md flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selectedRegions.includes(config.region)} onChange={() => toggleSelectRegion(config.region)} />
                {config.active ? <ShieldCheck className="w-6 h-6 text-green-600" /> : <ShieldAlert className="w-6 h-6 text-gray-400" />}
                <div>
                  <p className="font-medium text-gray-900">{config.region}</p>
                  <p className="text-xs text-gray-500">Last updated: {config.lastUpdated}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(config.region)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  config.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {config.active ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <JurisdictionComparisonSplitView />
      </div>
    </div>
  );
}
