import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ShieldAlert, Clock, Smartphone, Globe, Info, Save } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const AdaptiveSessionSecurity: React.FC = () => {
  const { showToast } = useNotification();
  const [isSaving, setIsSaving] = useState(false);

  const [policies, setPolicies] = useState({
    sessionTimeout: 'dynamic', // dynamic, strict, relaxed
    mfaStrictness: 'module_based', // always, module_based, risk_based
    ipAdaptive: true,
    riskThreshold: 75
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Adaptive security policies synchronized across regional clusters.', 'success');
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-950 text-base">Adaptive Session Policies</h3>
            <p className="text-sm text-slate-500 mt-0.5">Automated security hardening based on module sensitivity and user risk profile.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <span className="animate-spin text-[10px]">●</span> : <Save className="w-4 h-4" />}
          {isSaving ? 'Syncing...' : 'Save Changes'}
        </button>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Policy: Session Timeout */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Intelligent Session Timeout</label>
            </div>
            <select 
              value={policies.sessionTimeout}
              onChange={(e) => setPolicies({...policies, sessionTimeout: e.target.value})}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            >
              <option value="dynamic">Adaptive (Based on Active Module)</option>
              <option value="strict">Strict (15m Global Enforced)</option>
              <option value="relaxed">Relaxed (8h Extended)</option>
            </select>
            <p className="text-[10px] text-slate-400">Adaptive mode tightens timeout to 5m for financial/regulatory modules.</p>
          </div>

          {/* Policy: MFA Strictness */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">MFA Enforcement Logic</label>
            </div>
            <select 
              value={policies.mfaStrictness}
              onChange={(e) => setPolicies({...policies, mfaStrictness: e.target.value})}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            >
              <option value="module_based">Per-Module Escalation</option>
              <option value="always">Always Require (Zero Trust)</option>
              <option value="risk_based">Risk-Based (AI Predicted)</option>
            </select>
            <p className="text-[10px] text-slate-400">Step-up authentication required for "Break-Glass" or "Admin Ledger" access.</p>
          </div>

          {/* Toggle: Adaptive IP */}
          <div className="sm:col-span-2 flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex gap-3">
              <Globe className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">Adaptive IP Allowlisting</p>
                <p className="text-xs text-slate-500">Automatically restrict access if logins occur from high-risk geofences or known VPN exits.</p>
              </div>
            </div>
            <button 
              onClick={() => setPolicies({...policies, ipAdaptive: !policies.ipAdaptive})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${policies.ipAdaptive ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${policies.ipAdaptive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-bold mb-1">Enterprise Compliance Note</p>
            Changing these policies will trigger a "Security Baseline Change" event in the Audit Ledger. Users in active sessions may be prompted to re-authenticate if strictness increases.
          </div>
        </div>
      </div>
    </div>
  );
};
