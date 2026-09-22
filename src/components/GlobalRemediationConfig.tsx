import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  ShieldCheck, 
  GitBranch, 
  AlertOctagon, 
  Zap, 
  Server, 
  Globe, 
  Save, 
  CheckCircle2,
  BellRing,
  Lock,
  Cpu,
  Database,
  EyeOff,
  Crosshair,
  WifiOff,
  RefreshCw
} from 'lucide-react';

export const GlobalRemediationConfig: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Remediation Settings State
  const [autoFixCritical, setAutoFixCritical] = useState(false);
  const [autoFixHigh, setAutoFixHigh] = useState(true);
  const [autoFixMedium, setAutoFixMedium] = useState(true);
  const [autoFixLow, setAutoFixLow] = useState(true);

  const [enforcementMode, setEnforcementMode] = useState('BLOCK_BUILD');
  const [fallbackAction, setFallbackAction] = useState('QUARANTINE_SERVICE');
  const [escalationTime, setEscalationTime] = useState('24');

  // Policy Scopes
  const [scopeGdpr, setScopeGdpr] = useState(true);
  const [scopeAiAct, setScopeAiAct] = useState(true);
  const [scopeNis2, setScopeNis2] = useState(true);
  const [scopeDora, setScopeDora] = useState(true);
  
  // Framework specific automations
  const [aiActRollback, setAiActRollback] = useState(true);
  const [gdprDataPurge, setGdprDataPurge] = useState(false);
  const [nis2Isolation, setNis2Isolation] = useState(true);
  const [doraFailover, setDoraFailover] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex justify-between items-center bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
            <Settings className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Platform Remediation & Fix Logic
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure global automated remediation, policy enforcement actions, and fallback resolution strategies.
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-900/20"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : showSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Applying...' : showSuccess ? 'Config Saved' : 'Apply Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Core Automated Patching Rules */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
            <GitBranch className="w-4 h-4 text-indigo-500 mr-2" />
            Core Auto-Fix Matrix
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Determine which violation severities are allowed to be automatically patched by the compliance engine during runtime or CI/CD pipelines.
          </p>
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 border border-rose-100 bg-rose-50/50 rounded-lg cursor-pointer hover:bg-rose-50 transition-colors">
              <div className="flex items-center space-x-3">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-slate-800">Critical Violations</span>
              </div>
              <input 
                type="checkbox" 
                checked={autoFixCritical}
                onChange={(e) => setAutoFixCritical(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 border border-amber-100 bg-amber-50/50 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors">
              <div className="flex items-center space-x-3">
                <AlertOctagon className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-800">High-Risk Violations</span>
              </div>
              <input 
                type="checkbox" 
                checked={autoFixHigh}
                onChange={(e) => setAutoFixHigh(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 border border-blue-100 bg-blue-50/50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-slate-800">Medium Severity</span>
              </div>
              <input 
                type="checkbox" 
                checked={autoFixMedium}
                onChange={(e) => setAutoFixMedium(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 border border-emerald-100 bg-emerald-50/50 rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-slate-800">Low Severity / Warnings</span>
              </div>
              <input 
                type="checkbox" 
                checked={autoFixLow}
                onChange={(e) => setAutoFixLow(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Framework Specific Automations */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 xl:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-indigo-500 mr-2" />
            Framework-Specific Remediation Logic
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Advanced remediation strategies mapped to specific regulatory frameworks. These actions are triggered automatically when violations bypass soft limits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">EU AI Act (Chapter III)</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={aiActRollback} onChange={() => setAiActRollback(!aiActRollback)} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-2">Automated Model Rollback</p>
              <p className="text-[10px] text-slate-500 mt-1">If inference telemetry detects bias exceeding 0.05 index, auto-rollback to the last verified compliant model checkpoint.</p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Database className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">GDPR (Article 5 & 17)</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={gdprDataPurge} onChange={() => setGdprDataPurge(!gdprDataPurge)} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-2">Auto-Purge Expired Retention</p>
              <p className="text-[10px] text-slate-500 mt-1">Automatically execute hard-deletions on PII records that surpass the 36-month retention policy without active consent renewals.</p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">NIS2 Directive</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={nis2Isolation} onChange={() => setNis2Isolation(!nis2Isolation)} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-2">Critical Node Isolation</p>
              <p className="text-[10px] text-slate-500 mt-1">If an active breach indicator is confirmed, automatically isolate the network segment from the main compliance ledger.</p>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">DORA</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={doraFailover} onChange={() => setDoraFailover(!doraFailover)} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-2">Resilience Hot-Failover</p>
              <p className="text-[10px] text-slate-500 mt-1">If the primary regulatory reporting node experiences &gt;500ms latency, automatically failover to the EU-Central-1 replica.</p>
            </div>
          </div>
        </div>

        {/* General Enforcement & Escalation */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 xl:col-span-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-indigo-500 mr-2" />
            General Enforcement & Escalation Matrix
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Unresolved Critical Action</label>
              <select 
                value={enforcementMode}
                onChange={(e) => setEnforcementMode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BLOCK_BUILD">Block Build / Pipeline (Strict)</option>
                <option value="WARN_ONLY">Warn Only (Audit Logged)</option>
                <option value="AUTO_QUARANTINE">Auto-Quarantine Branch (Moderate)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Dictates what happens when an auto-fix fails or is disabled for critical issues during the CI/CD pipeline.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Runtime Remediation Fallback</label>
              <select 
                value={fallbackAction}
                onChange={(e) => setFallbackAction(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="QUARANTINE_SERVICE">Quarantine Running Service</option>
                <option value="THROTTLE_API">Throttle Associated APIs</option>
                <option value="SHUTDOWN_NODE">Graceful Node Shutdown</option>
                <option value="LOG_AND_NOTIFY">Log & Notify DPO Only</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">The fallback behavior applied to production workloads if a compliance violation is detected at runtime.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Mandatory Escalation SLA (Hours)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={escalationTime}
                  onChange={(e) => setEscalationTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs font-medium">
                  Hours
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Time limit before unresolved compliance warnings escalate to the relevant Regulator Data Protection Authority.</p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
