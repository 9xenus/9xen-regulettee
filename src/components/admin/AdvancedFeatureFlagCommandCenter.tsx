/**
 * Advanced Feature Flag & Circuit Breaker Command Center
 * Enables SaaS Administrators to toggle critical system capabilities, trigger emergency circuit breakers,
 * and enforce multi-tenant feature overrides in real time.
 */
import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, ShieldAlert, Cpu, Lock, Zap, CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { FeatureFlagEngine, FeatureFlagItem } from '../../utils/featureFlagEngine';

export function AdvancedFeatureFlagCommandCenter() {
  const [flags, setFlags] = useState<FeatureFlagItem[]>(FeatureFlagEngine.getFeatureFlags());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleToggle = (key: string) => {
    const updated = FeatureFlagEngine.toggleFlag(key);
    setFlags(updated);
    setSuccessMsg(`Feature flag '${key}' updated successfully.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleToggleCircuitBreaker = (key: string) => {
    const updated = FeatureFlagEngine.toggleCircuitBreaker(key);
    setFlags(updated);
    setSuccessMsg(`Circuit breaker state toggled for '${key}'.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider">
              Runtime Circuit Breakers & Flags
            </span>
            <span className="text-xs text-slate-400 font-mono">Dynamic Control Plane</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-400" />
            Critical Feature Flag & Circuit Breaker Management
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Instantly toggle high-risk operational capabilities, activate emergency circuit breakers, and enforce tenant-specific feature governance without deployments.
          </p>
        </div>

        <button
          onClick={() => setFlags(FeatureFlagEngine.getFeatureFlags())}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" /> Refresh Flags
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flags.map((flag) => {
          const isSystemKill = flag.key === 'emergency_circuit_breaker_all';
          return (
            <div 
              key={flag.key} 
              className={`rounded-2xl p-6 border flex flex-col justify-between space-y-5 transition-all shadow-lg ${
                isSystemKill 
                  ? 'bg-red-950/20 border-red-900/50 hover:border-red-600/50' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    flag.category === 'AI_SAFETY' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    flag.category === 'SOVEREIGN_ROUTING' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    flag.category === 'CRYPTOGRAPHY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    flag.category === 'B2G_COMPLIANCE' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {flag.category}
                  </span>
                  
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    flag.circuitBreakerActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    flag.isEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {flag.circuitBreakerActive ? 'CIRCUIT OPEN' : flag.isEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{flag.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{flag.description}</p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="text-slate-400">Target: <strong className="text-white">{flag.targetTenants.join(', ')}</strong></div>
                  <div className="text-slate-500 text-[10px]">Updated: {new Date(flag.updatedAt).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleToggle(flag.key)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    flag.isEnabled 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {flag.isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {flag.isEnabled ? 'Enabled' : 'Disabled'}
                </button>

                <button
                  onClick={() => handleToggleCircuitBreaker(flag.key)}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    flag.circuitBreakerActive 
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                  title="Trip Circuit Breaker"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {flag.circuitBreakerActive ? 'Trip Active' : 'Trip'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
