import React, { useState, useEffect } from 'react';
import { Globe, Settings, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Region, PolicyAct } from '../lib/types';
import { getActsByRegion, updateActStatus, bulkUpdateActs } from '../lib/policy-store';

export function RegionalAdminManager() {
  const [activeRegion, setActiveRegion] = useState<Region>('EU');
  const [policyActs, setPolicyActs] = useState<PolicyAct[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedActs, setSelectedActs] = useState<string[]>([]);

  useEffect(() => {
    setPolicyActs(getActsByRegion(activeRegion));
    setSelectedActs([]);
  }, [activeRegion]);

  const regions: Region[] = ['EU', 'USA', 'AUSTRALIA', 'NEW_ZEALAND', 'APAC'];

  const handleUpdate = async (actId: string) => {
    setIsUpdating(actId);
    await new Promise(r => setTimeout(r, 2000));
    updateActStatus(activeRegion, actId, { status: 'Up-to-date', version: 'Latest' });
    setPolicyActs(getActsByRegion(activeRegion));
    setIsUpdating(null);
  };

  const toggleSelectAct = (actId: string) => {
    setSelectedActs(prev => prev.includes(actId) ? prev.filter(id => id !== actId) : [...prev, actId]);
  };

  const handleBulkUpdate = (enabled: boolean) => {
    bulkUpdateActs(activeRegion, selectedActs, enabled);
    setPolicyActs(getActsByRegion(activeRegion));
    setSelectedActs([]);
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Regional Policy Admin
        </h2>
        <div className="flex gap-2">
          {regions.map(r => (
            <button key={r} onClick={() => setActiveRegion(r)} className={`px-3 py-1 text-xs font-medium rounded ${activeRegion === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      
      {selectedActs.length > 0 && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded flex gap-2">
          <button onClick={() => handleBulkUpdate(true)} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Enable Selected</button>
          <button onClick={() => handleBulkUpdate(false)} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Disable Selected</button>
        </div>
      )}

      <div className="space-y-3">
        {policyActs.map(act => (
          <div key={act.id} className="p-3 border rounded-md flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={selectedActs.includes(act.id)} onChange={() => toggleSelectAct(act.id)} />
              {act.enabled ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              <div>
                <p className="font-medium text-sm text-gray-900">{act.name}</p>
                <p className="text-xs text-gray-500">{act.status} - v{act.version}</p>
              </div>
            </div>
            {act.status === 'Update Available' && (
              <button onClick={() => handleUpdate(act.id)} disabled={isUpdating === act.id} className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors flex items-center gap-1">
                {isUpdating === act.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Update
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
