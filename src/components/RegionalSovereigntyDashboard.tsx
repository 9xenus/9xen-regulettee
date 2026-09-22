import React, { useState } from 'react';
import { Globe, MapPin, Shield, Zap, Lock, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeoLocationService, RegionalJurisdiction } from '../services/geolocation-service';
import { CrossBorderRiskAnalyzer, DataTransferSpec } from '../services/cross-border-risk-analyzer';

export const RegionalSovereigntyDashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionalJurisdiction>('EU');
  const [transferTarget, setTransferTarget] = useState<RegionalJurisdiction>('MENA_KSA');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const regions: { id: RegionalJurisdiction; name: string; status: string; node: string }[] = [
    { id: 'EU', name: 'European Union (GDPR)', status: 'Operational', node: 'eu-west-1-sovereign' },
    { id: 'MENA_KSA', name: 'Saudi Arabia (PDPL)', status: 'Operational', node: 'me-south-1-ksa' },
    { id: 'MENA_UAE', name: 'UAE (Data Law)', status: 'Staging', node: 'me-central-1-uae' },
    { id: 'APAC_IN', name: 'India (DPDP)', status: 'Operational', node: 'ap-south-1-india' },
    { id: 'APAC_SG', name: 'Singapore (PDPA)', status: 'Operational', node: 'ap-southeast-1-sg' },
    { id: 'USA_CA', name: 'USA California (CCPA)', status: 'Operational', node: 'us-west-1-standard' }
  ];

  const analysisResult = CrossBorderRiskAnalyzer.assessTransfer({
    sourceJurisdiction: selectedRegion,
    targetJurisdiction: transferTarget,
    dataTypes: ['Personal', 'Sensitive'],
    volume: 'HIGH',
    purpose: 'Analytics & Reporting'
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Global Sovereignty & Expansion</h2>
          <p className="text-slate-400 text-sm">Managing cross-border data flows and regional sovereign cloud nodes.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg">Active Regions</button>
          <button className="px-4 py-2 text-slate-400 text-xs font-bold hover:text-slate-200 transition-colors">Marketplace</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Region Selector & Status */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4" /> Regional Footprint
            </h3>
            <div className="space-y-2">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                    selectedRegion === region.id
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${region.status === 'Operational' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                    <span className="text-xs font-bold">{region.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedRegion === region.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="Sovereign Control" /> Node Infrastructure
            </h3>
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Active Node</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Encrypted</span>
              </div>
              <p className="text-sm font-bold text-slate-200 font-mono">{regions.find(r => r.id === selectedRegion)?.node}</p>
              <div className="flex gap-1.5">
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                <div className="h-1 flex-1 bg-slate-700 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400">Node health is excellent. 99.99% sovereign uptime recorded in the last 30 days.</p>
            </div>
          </div>
        </div>

        {/* Cross-Border Risk Analyzer */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Cross-Border Risk Mapping
              </h3>
              <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Automated Assessment
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Source Jurisdiction</label>
                  <select 
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value as RegionalJurisdiction)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="flex justify-center">
                  <div className="p-2 bg-slate-800 rounded-full border border-slate-700">
                    <ChevronRight className="w-4 h-4 text-slate-500 rotate-90 md:rotate-0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Target Jurisdiction</label>
                  <select 
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value as RegionalJurisdiction)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative aspect-square max-w-[240px] mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="stroke-slate-800 fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className={`fill-none transition-all duration-1000 ${
                      analysisResult.status === 'CRITICAL' ? 'stroke-red-500' : analysisResult.status === 'WARNING' ? 'stroke-amber-500' : 'stroke-emerald-500'
                    }`}
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * analysisResult.riskScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
                  <span className="text-4xl font-black text-white">{analysisResult.riskScore}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Score</span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedRegion}-${transferTarget}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-5 rounded-2xl border ${
                  analysisResult.status === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : analysisResult.status === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    analysisResult.status === 'CRITICAL' ? 'bg-red-500/10' : analysisResult.status === 'WARNING' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      analysisResult.status === 'CRITICAL' ? 'text-red-400' : analysisResult.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                    }`} />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Legal Impact Assessment</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        analysisResult.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : analysisResult.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {analysisResult.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Mandatory Safeguards</span>
                        <ul className="space-y-1.5">
                          {analysisResult.requiredSafeguards.map((s, i) => (
                            <li key={i} className="text-[11px] text-slate-300 flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-indigo-500" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Remediation Steps</span>
                        <ul className="space-y-1.5">
                          {analysisResult.remediationSteps.map((s, i) => (
                            <li key={i} className="text-[11px] text-slate-300 flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-amber-500" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Download Full TIA
              </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
                Authorize Transfer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
