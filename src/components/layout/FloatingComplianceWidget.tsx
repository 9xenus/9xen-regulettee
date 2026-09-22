import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sliders, 
  Sparkles,
  Zap
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

interface ModuleScore {
  id: string;
  name: string;
  code: string;
  score: number;
  active: boolean;
  category: string;
  status: 'COMPLIANT' | 'WARNING' | 'CRITICAL';
}

interface FloatingComplianceWidgetProps {
  onNavigate?: (path: string) => void;
  activeContextName?: string;
}

const DEFAULT_MODULES: ModuleScore[] = [
  { id: 'gdpr', name: 'GDPR Data Protection', code: 'ART-6/7', score: 99, active: true, category: 'Privacy & Data', status: 'COMPLIANT' },
  { id: 'ai_act', name: 'EU AI Act Governance', code: 'RISK-TIER-1', score: 95, active: true, category: 'AI Regulation', status: 'COMPLIANT' },
  { id: 'nis2', name: 'NIS2 Cybersecurity', code: 'DIRECTIVE-EU', score: 98, active: true, category: 'Infrastructure', status: 'COMPLIANT' },
  { id: 'dora', name: 'DORA Digital Resilience', code: 'FIN-RES-2025', score: 100, active: true, category: 'Financial & Resilience', status: 'COMPLIANT' },
  { id: 'eprivacy', name: 'ePrivacy Tracker Shield', code: 'COOKIE-LAW', score: 92, active: true, category: 'Web & Tracking', status: 'COMPLIANT' },
  { id: 'aml_kyc', name: 'AML / KYC Verification', code: 'FIN-AML-5', score: 94, active: false, category: 'Financial', status: 'COMPLIANT' },
  { id: 'hipaa', name: 'HealthTech HIPAA Shield', code: 'HDS-EU-US', score: 88, active: false, category: 'Health Data', status: 'WARNING' },
];

export const FloatingComplianceWidget: React.FC<FloatingComplianceWidgetProps> = ({
  onNavigate,
  activeContextName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modules, setModules] = useState<ModuleScore[]>(DEFAULT_MODULES);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('Just now');
  const [tenantName, setTenantName] = useState<string>(activeContextName || 'Acme Corporation Europe');

  // Fetch initial health from server if available
  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const res = await fetchWithRetry('/api/v1/tenants/health');
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            if (json.tenantName) setTenantName(json.tenantName);
            // If activeModules returned from backend, sync active state
            if (Array.isArray(json.activeModules) && json.activeModules.length > 0) {
              const activeSet = new Set(json.activeModules);
              setModules(prev =>
                prev.map(m => ({
                  ...m,
                  active: activeSet.has(m.id) || m.active
                }))
              );
            }
          }
        }
      } catch (err) {
        // Fallback silently
      }
    };
    fetchHealth();
    return () => { isMounted = false; };
  }, []);

  // Calculate dynamic overall score from active modules
  const activeModules = modules.filter(m => m.active);
  const overallScore = activeModules.length > 0
    ? Math.round(activeModules.reduce((sum, m) => sum + m.score, 0) / activeModules.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', bgLight: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-800' };
    if (score >= 75) return { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', bgLight: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800' };
    return { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', bgLight: 'bg-rose-50', badge: 'bg-rose-100 text-rose-800' };
  };

  const scoreTheme = getScoreColor(overallScore);

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const handleScanNow = async () => {
    setIsScanning(true);
    await new Promise(r => setTimeout(r, 1200));
    // Introduce slight variance to simulate live recalculation
    setModules(prev => prev.map(m => ({
      ...m,
      score: m.active ? Math.min(100, Math.max(80, m.score + (Math.random() > 0.5 ? 1 : -1))) : m.score
    })));
    setLastScanned(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setIsScanning(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-88 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl text-slate-800"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      Compliance Score Center
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[210px]" title={tenantName}>
                      {tenantName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Minimize Widget"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Score Display Card */}
              <div className="mt-4 p-3.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Overall Compliance Score
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black tracking-tight text-white">
                      {overallScore}%
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreTheme.badge}`}>
                      {overallScore >= 90 ? 'Tier 1 Compliant' : overallScore >= 75 ? 'Optimal' : 'Action Required'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Calculated from {activeModules.length} active regulatory modules
                  </div>
                </div>

                {/* Circular Progress Gauge Representation */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-700/50"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={scoreTheme.text}
                      strokeDasharray={`${overallScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-white">{overallScore}%</span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3.5 max-h-[380px] overflow-y-auto">
              {/* Module Toggles & Individual Scores */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    Active Regulatory Modules ({activeModules.length}/{modules.length})
                  </span>
                  <button
                    onClick={handleScanNow}
                    disabled={isScanning}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                    Recalculate
                  </button>
                </div>

                <div className="space-y-1.5">
                  {modules.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        m.active
                          ? 'bg-slate-50 border-slate-200 shadow-2xs'
                          : 'bg-slate-100/50 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleModule(m.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            m.active ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-transparent hover:bg-slate-400'
                          }`}
                          title={m.active ? 'Disable module in score calculation' : 'Enable module in score calculation'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span className="truncate">{m.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded shrink-0">
                              {m.code}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{m.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {m.active ? (
                          <span className={`text-xs font-mono font-black ${
                            m.score >= 90 ? 'text-emerald-600' : m.score >= 75 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {m.score}%
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Inactive</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Footer Actions */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  Scanned: {lastScanned}
                </span>

                <div className="flex items-center gap-1.5">
                  {onNavigate && (
                    <>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('compliance-scanner');
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Scanner
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('compliance-hub');
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        Compliance Hub
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md font-medium z-40 ${
            overallScore < 75 
              ? 'bg-rose-950/90 border-rose-500/50 text-white hover:bg-rose-900/90 ring-4 ring-rose-500/20' 
              : 'bg-slate-900/90 border-slate-700/80 text-white hover:bg-slate-800/95 ring-4 ring-slate-900/10'
          }`}
          title="Open Compliance Health Center"
          id="floating-compliance-score-widget"
        >
          {/* Animated Shield Dot */}
          <div className="relative flex items-center justify-center shrink-0">
            <span className={`w-2 h-2 rounded-full ${overallScore >= 90 ? 'bg-emerald-400' : overallScore >= 75 ? 'bg-amber-400' : 'bg-rose-400'}`} />
            <span className={`absolute w-4 h-4 rounded-full opacity-60 animate-ping ${overallScore >= 90 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          </div>

          <ShieldCheck className={`w-4 h-4 shrink-0 ${overallScore >= 90 ? 'text-emerald-400' : overallScore >= 75 ? 'text-amber-400' : 'text-rose-400'}`} />

          <div className="flex flex-col items-start leading-none gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest hidden sm:block">
                Health Score
              </span>
              <span className={`px-1.5 py-0.5 rounded-full font-mono text-[9px] font-black ${scoreTheme.badge}`}>
                {overallScore}%
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-700/50 mx-0.5 hidden md:block"></div>

          <span className="text-[10px] text-indigo-300 font-bold bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/60 hidden md:flex items-center gap-1">
            <Sliders className="w-2.5 h-2.5" />
            {activeModules.length} Modules
          </span>


          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-1 opacity-70" />
        </button>
      )}
    </div>
  );
};

export default FloatingComplianceWidget;
