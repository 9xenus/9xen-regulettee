import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Zap, Plus, Trash2, Cpu } from 'lucide-react';
import { getActsByRegion, updateActStatus, bulkUpdateActs } from '../lib/policy-store';
import { Region, PolicyAct } from '../lib/types';
import { motion, AnimatePresence } from 'motion/react';
import { PolicyActEngineModule } from './PolicyActEngineModule';

interface RegionalPolicyActsProps {
  initialRegion?: Region;
}

export const RegionalPolicyActs: React.FC<RegionalPolicyActsProps> = ({ initialRegion = 'EU' }) => {
  const [region, setRegion] = useState<Region>(initialRegion);
  const [acts, setActs] = useState<PolicyAct[]>([]);
  const [isAutoImplementing, setIsAutoImplementing] = useState(false);
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');

  const [autoStatus, setAutoStatus] = useState<string | null>(null);

  useEffect(() => {
    setActs(getActsByRegion(region));
    setAutoStatus(null);
  }, [region]);

  const handleToggle = (actId: string, enabled: boolean) => {
    updateActStatus(region, actId, { enabled: !enabled });
    setActs(getActsByRegion(region));
  };

  const handleAutoImplement = () => {
    setIsAutoImplementing(true);
    setAutoStatus('Analyzing regional requirements...');
    
    setTimeout(() => {
      const allIds = acts.map(a => a.id);
      bulkUpdateActs(region, allIds, true);
      
      setActs(getActsByRegion(region));
      setIsAutoImplementing(false);
      setAutoStatus(`Success: Optimized ${allIds.length} policy acts for ${region}.`);
      
      setTimeout(() => setAutoStatus(null), 5000);
    }, 1500);
  };

  const handleAutoRemove = () => {
    if (!confirm(`Are you sure you want to disable ALL policy acts for ${region}?`)) return;
    
    setIsAutoImplementing(true);
    setAutoStatus(`Removing all implementations for ${region}...`);
    
    setTimeout(() => {
      const allIds = acts.map(a => a.id);
      bulkUpdateActs(region, allIds, false);
      
      setActs(getActsByRegion(region));
      setIsAutoImplementing(false);
      setAutoStatus(`Success: Removed all policy acts for ${region}.`);
      
      setTimeout(() => setAutoStatus(null), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Regional Policy Act Engine</h3>
            <p className="text-sm text-slate-500">Manage and automate regulatory acts for {region}.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {autoStatus && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  autoStatus.includes('Success') ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {autoStatus}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex bg-slate-100 rounded-lg p-1 mr-2 border border-slate-200">
            <button 
              onClick={() => setViewMode('basic')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'basic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Basic
            </button>
            <button 
              onClick={() => setViewMode('advanced')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'advanced' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Advanced Engine
            </button>
          </div>

          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value as Region)}
            className="text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 font-medium"
          >
            <option value="EU">EU</option>
            <option value="USA">USA</option>
            <option value="AUSTRALIA">AUSTRALIA</option>
            <option value="NEW_ZEALAND">NEW_ZEALAND</option>
            <option value="APAC">APAC</option>
          </select>

          <button 
            onClick={handleAutoImplement}
            disabled={isAutoImplementing}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              isAutoImplementing 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
            }`}
          >
            <Zap className={`w-4 h-4 ${isAutoImplementing ? 'animate-pulse' : ''}`} />
            {isAutoImplementing ? 'Processing...' : 'Auto Implement'}
          </button>

          <button 
            onClick={handleAutoRemove}
            disabled={isAutoImplementing}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              isAutoImplementing 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isAutoImplementing ? '...' : 'Auto Remove'}
          </button>
        </div>
      </div>

      {viewMode === 'advanced' ? (
        <PolicyActEngineModule initialGeography={region} onToggle={() => setActs(getActsByRegion(region))} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {acts.map((act) => (
              <motion.div 
                key={act.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-xl border transition-all ${
                  act.enabled 
                    ? 'bg-white border-indigo-200 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 grayscale opacity-75'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${act.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      act.status === 'Up-to-date' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {act.status}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                      <input 
                        type="checkbox" 
                        checked={act.enabled} 
                        onChange={() => handleToggle(act.id, act.enabled)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 mb-1">{act.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-slate-500">v{act.version}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">Synced: {act.lastSynced}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Impact Score</span>
                    <span className="text-sm font-black text-indigo-600">{act.impactScore}</span>
                  </div>
                  <button className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all hover:bg-indigo-50/30 group">
            <div className="p-3 bg-slate-50 rounded-full group-hover:bg-indigo-100 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold">Add Custom Act</span>
          </button>
        </div>
      )}
    </div>
  );
};
