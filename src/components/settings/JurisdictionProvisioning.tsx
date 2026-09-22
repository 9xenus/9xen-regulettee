import React, { useState } from 'react';
import { Globe, Shield, CheckCircle2, Loader2, AlertCircle, MapPin, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const availableJurisdictions = [
  { code: 'DE', name: 'Germany', flag: '🇩🇪', framework: 'GDPR + BDSG', latency: '4ms' },
  { code: 'FR', name: 'France', flag: '🇫🇷', framework: 'GDPR + CNIL', latency: '9ms' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', framework: 'GDPR + AP', latency: '12ms' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', framework: 'GDPR + DPC', latency: '18ms' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', framework: 'PDPA + MAS', latency: '142ms' },
  { code: 'US_CA', name: 'California (USA)', flag: '🇺🇸', framework: 'CCPA / CPRA', latency: '86ms' },
];

export const JurisdictionProvisioning: React.FC = () => {
  const [activeJurisdictions, setActiveJurisdictions] = useState(['DE']);
  const [provisioningCode, setProvisioningCode] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  const handleProvision = async (code: string) => {
    if (activeJurisdictions.includes(code)) return;
    
    setProvisioningCode(code);
    try {
      const res = await fetch('/api/v1/advanced-settings/provision-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: 'default', jurisdiction_code: code })
      });
      const data = await res.json();
      setReport(data.provisionData);
      setActiveJurisdictions(prev => [...prev, code]);
    } catch (e) {
      console.error(e);
    } finally {
      setProvisioningCode(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Jurisdiction Auto-Provisioning</h2>
          <p className="text-slate-500 text-xs mt-1">Instantly activate regional regulatory frameworks and data residency nodes for new operating regions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableJurisdictions.map((j) => {
          const isActive = activeJurisdictions.includes(j.code);
          const isProvisioning = provisioningCode === j.code;

          return (
            <div 
              key={j.code}
              className={`p-4 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-indigo-50/50 border-indigo-200' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{j.flag}</span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{j.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{j.code}</span>
                  </div>
                </div>
                {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold uppercase">Framework</span>
                  <span className="text-slate-800 font-black">{j.framework}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold uppercase">Node Latency</span>
                  <span className="text-emerald-600 font-black font-mono">{j.latency}</span>
                </div>
              </div>

              <button
                disabled={isActive || isProvisioning}
                onClick={() => handleProvision(j.code)}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isActive 
                    ? 'bg-white text-indigo-600 border border-indigo-200' 
                    : isProvisioning
                      ? 'bg-slate-100 text-slate-400 border border-slate-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-100'
                }`}
              >
                {isProvisioning ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Provisioning...
                  </>
                ) : isActive ? (
                  'Active'
                ) : (
                  <>
                    <Zap className="w-3 h-3 fill-current" />
                    Activate Jurisdiction
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Shield className="w-4 h-4" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Provisioning Report Received</h4>
              </div>
              <button 
                onClick={() => setReport(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase">Activated Modules</h5>
                <div className="flex flex-wrap gap-2">
                  {report.provisioned_modules.map((m: string) => (
                    <span key={m} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-bold border border-indigo-500/20">{m}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase">Residency Rule</h5>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{report.residency_requirement}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase">
                <CheckCircle2 className="w-3 h-3" />
                <span>9Xen Regulettee Compliance Engine has synchronized all regional parameters.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
