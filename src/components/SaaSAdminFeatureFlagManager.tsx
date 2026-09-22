import React, { useState, useEffect } from 'react';
import { ToggleRight, AlertTriangle, Shield, CheckCircle2, Zap, Settings, Globe, Users, Building } from 'lucide-react';
import { FeatureFlagEngine, FeatureFlagItem } from '../utils/featureFlagEngine';
import { useTenant } from '../context/TenantContext';

export const SaaSAdminFeatureFlagManager: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlagItem[]>([]);
  const [locale, setLocale] = useState<'en' | 'bn'>('en');
  
  // Use tenant context
  const { tenants, activeTenant, switchTenant } = useTenant();
  const [selectedTenantId, setSelectedTenantId] = useState<string>('ALL');

  useEffect(() => {
    // Initial local load for speed, then fetch from backend
    setFlags(FeatureFlagEngine.getFeatureFlags());
    FeatureFlagEngine.fetchFeatureFlagsAsync().then(setFlags);
  }, []);

  const handleToggleFlag = async (key: string) => {
    const flag = flags.find(f => f.key === key);
    if (!flag) return;

    if (selectedTenantId === 'ALL') {
      const updated = await FeatureFlagEngine.updateFlagAsync(key, { isEnabled: !flag.isEnabled });
      setFlags(updated);
    } else {
      let newTargets = [...flag.targetTenants];
      if (newTargets.includes('ALL')) {
        newTargets = newTargets.filter(t => t !== 'ALL' && t !== selectedTenantId);
      } else if (newTargets.includes(selectedTenantId)) {
        newTargets = newTargets.filter(t => t !== selectedTenantId);
      } else {
        newTargets.push(selectedTenantId);
      }
      const updated = await FeatureFlagEngine.updateFlagAsync(key, { 
        targetTenants: newTargets,
        isEnabled: newTargets.length > 0
      });
      setFlags(updated);
    }
  };

  const handleToggleCircuitBreaker = async (key: string) => {
    const flag = flags.find(f => f.key === key);
    if (!flag) return;
    const updated = await FeatureFlagEngine.updateFlagAsync(key, { circuitBreakerActive: !flag.circuitBreakerActive });
    setFlags(updated);
  };

  const handleFullPlatformUpgrade = async () => {
    // Escalate all flags globally
    let finalFlags = flags;
    for (const flag of flags) {
      finalFlags = await FeatureFlagEngine.updateFlagAsync(flag.key, {
        isEnabled: true,
        circuitBreakerActive: false,
        targetTenants: ['ALL']
      });
    }
    setFlags(finalFlags);
  };

  // Check if a flag is active for the currently selected view
  const isFlagActiveForSelection = (flag: FeatureFlagItem) => {
    if (selectedTenantId === 'ALL') {
      return flag.isEnabled; // Global state
    }
    return flag.targetTenants.includes('ALL') || flag.targetTenants.includes(selectedTenantId);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <ToggleRight className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {locale === 'bn' ? 'ফিচার ফ্ল্যাগ ও অ্যাড-অন গভর্ন্যান্স' : 'Feature Flag & Add-on Governance'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                Admin-Service Integration
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'bn' ? 'গ্লোবাল, রিজিওনাল এবং টেন্যান্ট-ভিত্তিক ফিচার টগল ও সার্কিট ব্রেকার ম্যানেজমেন্ট' : 'Global, Regional, and Per-Tenant Add-on Toggle & Circuit Breaker Management'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFullPlatformUpgrade}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            {locale === 'bn' ? 'ফুল প্ল্যাটফর্ম আপগ্রেড' : 'Full Platform Upgrade'}
          </button>
          <button
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {locale === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <Building className="w-4 h-4 text-indigo-500" />
          <span>Configuration Scope:</span>
        </div>
        <select 
          value={selectedTenantId} 
          onChange={(e) => setSelectedTenantId(e.target.value)}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
        >
          <option value="ALL">Global Default (All Tenants)</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id}>{t.name} (ID: {t.id})</option>
          ))}
        </select>
        {selectedTenantId !== 'ALL' && (
           <span className="text-[10px] font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded uppercase">Per-Tenant Override Mode</span>
        )}
      </div>

      <div className="space-y-4">
        {flags.map((flag) => {
          const isActive = isFlagActiveForSelection(flag);
          
          return (
          <div key={flag.key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                  {flag.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{flag.name}</h4>
                {flag.circuitBreakerActive && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    CIRCUIT BREAKER ENGAGED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {flag.description}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Target: {flag.targetTenants.includes('ALL') ? 'Global' : (flag.targetTenants.length > 0 ? flag.targetTenants.join(', ') : 'None')}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Scope: {flag.targetTenants.includes('ALL') ? 'Global' : 'Per-Tenant'}
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Key: {flag.key}
                </div>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-3 min-w-[140px]">
              <label className="flex items-center justify-between w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mr-3">
                  {locale === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={isActive}
                    onChange={() => handleToggleFlag(flag.key)}
                  />
                  <div className={`w-9 h-5 rounded-full peer transition-all 
                    ${isActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'} 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 
                    ${isActive ? 'after:translate-x-full after:border-white' : ''}`}></div>
                </div>
              </label>
              {selectedTenantId === 'ALL' && (
                <button
                  onClick={() => handleToggleCircuitBreaker(flag.key)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    flag.circuitBreakerActive 
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  {flag.circuitBreakerActive ? 'Reset Breaker' : 'Trip Breaker'}
                </button>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default SaaSAdminFeatureFlagManager;
