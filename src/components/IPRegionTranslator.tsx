import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Terminal, 
  MapPin, 
  Activity, 
  Cpu, 
  Check, 
  HelpCircle,
  AlertTriangle,
  Compass,
  ArrowRight
} from 'lucide-react';

export const IPRegionTranslator: React.FC = () => {
  const {
    language,
    setLanguage,
    detectedIP,
    detectedGeo,
    isAutoDetecting,
    isAutoTranslationLocked,
    toggleAutoTranslationLock,
    runIPDetection,
    simulateIPLogin,
    detectionLogs
  } = useLanguage();

  const [customIP, setCustomIP] = useState('');
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  const mockPredefinedIPs = [
    { ip: "185.120.44.10", country: "Saudi Arabia", code: "SA", flag: "🇸🇦", lang: "Arabic (ar)" },
    { ip: "203.0.113.195", country: "Germany", code: "DE", flag: "🇩🇪", lang: "German (de)" },
    { ip: "194.254.12.5", country: "France", code: "FR", flag: "🇫🇷", lang: "French (fr)" },
    { ip: "82.158.42.100", country: "Spain", code: "ES", flag: "🇪🇸", lang: "Spanish (es)" },
    { ip: "2.234.19.44", country: "Italy", code: "IT", flag: "🇮🇹", lang: "Italian (it)" },
    { ip: "8.8.8.8", country: "United States", code: "US", flag: "🇺🇸", lang: "English (en)" }
  ];

  const handleCustomIPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIP.trim()) return;
    
    // Quick validation of IP structure
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(customIP.trim())) {
      setSimulationStatus("Invalid IPv4 address format.");
      setTimeout(() => setSimulationStatus(null), 3000);
      return;
    }

    setSimulationStatus("Resolving custom IP...");
    await simulateIPLogin(customIP.trim());
    setSimulationStatus("Successfully simulated custom IP region switch!");
    setCustomIP('');
    setTimeout(() => setSimulationStatus(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 dark:bg-slate-900/40 p-1 rounded-xl" id="ip-region-translator">
      {/* Geolocation & Translate Status Panel */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Globe className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Sovereign IP translation engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatic geo-detection and website localized translation mappings
              </p>
            </div>
          </div>

          <button
            onClick={runIPDetection}
            disabled={isAutoDetecting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isAutoDetecting ? 'animate-spin' : ''}`} />
            Scan IP
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-lg p-3 border border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Client IP
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Compass className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100">
                {detectedIP || 'Resolving IP...'}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-lg p-3 border border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Sovereign Jurisdiction
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base">
                {detectedGeo?.countryCode ? mockPredefinedIPs.find(p => p.code === detectedGeo.countryCode)?.flag || '🌍' : '🌍'}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {detectedGeo ? `${detectedGeo.cityName}, ${detectedGeo.countryName}` : 'Analyzing residency...'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-lg p-3 border border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Autonomous Telecom Node
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block mt-1 truncate">
              {detectedGeo?.isp || 'Resolving ISP provider...'}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-lg p-3 border border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Mapped UI Language
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mt-1">
              {language.toUpperCase()} {language === 'ar' ? '(RTL Layout Active)' : '(LTR Layout Active)'}
            </span>
          </div>
        </div>

        {/* Lock Switch */}
        <div className="bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              {isAutoTranslationLocked ? (
                <>
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                  IP Localization Mode: LOCKED
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5 text-emerald-500" />
                  IP Localization Mode: ADAPTIVE
                </>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              {isAutoTranslationLocked 
                ? "The system will persist your manual selection. It will not switch languages based on network hops or logins." 
                : "The website will automatically switch languages and flip layout directions to match the region where you log in."}
            </p>
          </div>

          <button
            onClick={toggleAutoTranslationLock}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
              isAutoTranslationLocked 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isAutoTranslationLocked ? 'Enable Auto-Adapt' : 'Lock Layout Choice'}
          </button>
        </div>

        {/* Translation Sandbox Simulator */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Network Login Simulation Sandbox
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulate a secure client logging in from multiple worldwide nodes to instantly see how the platform translates and configures:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {mockPredefinedIPs.map((node) => {
              const isCurrent = detectedIP === node.ip;
              return (
                <button
                  key={node.ip}
                  onClick={() => simulateIPLogin(node.ip)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                    isCurrent 
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:border-slate-800/80'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>{node.flag}</span>
                      <span className="truncate">{node.country}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate font-mono">
                      {node.ip}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="p-0.5 bg-indigo-600 rounded-full text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom IP Entry Form */}
          <form onSubmit={handleCustomIPSubmit} className="flex gap-2 pt-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter custom IPv4 to simulate (e.g. 194.254.12.5)..."
                value={customIP}
                onChange={(e) => setCustomIP(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {simulationStatus && (
                <span className="absolute right-3 top-2.5 text-[10px] text-indigo-600 dark:text-indigo-400 animate-pulse">
                  {simulationStatus}
                </span>
              )}
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              Simulate IP
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Translation & Geolocated Operations Audit logs */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full max-h-[480px]">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Terminal className="h-4.5 w-4.5 text-slate-500" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              IP localization audit log
            </h4>
            <p className="text-[10px] text-slate-400">
              Sovereign translation events matching regional policies
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          <AnimatePresence initial={false}>
            {detectionLogs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
                <p className="text-xs text-slate-400 mt-2">No translation activity recorded yet.</p>
              </div>
            ) : (
              detectionLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2.5 rounded-lg text-[11px] leading-relaxed flex items-start gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/40"
                >
                  <span className="text-[9px] font-semibold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1 py-0.5 rounded font-mono shrink-0">
                    {log.time}
                  </span>
                  <div className="flex-1 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold block mb-0.5 text-[10px]">
                      {log.type === 'success' && '🟢 LOCALIZATION_RESOLVED'}
                      {log.type === 'info' && '🔵 LOCALIZATION_INFO'}
                      {log.type === 'warning' && '🟡 LOCALIZATION_WARN'}
                    </span>
                    {log.msg}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
