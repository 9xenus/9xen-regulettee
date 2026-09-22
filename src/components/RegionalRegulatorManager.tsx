import React, { useState, useEffect } from 'react';
import { 
  Building2, Globe, Shield, Scale, Settings, 
  ToggleLeft, ToggleRight, CheckCircle2, AlertTriangle, 
  Info, ChevronRight, Search, Filter, RefreshCw, 
  Layers, Lock, Workflow, FileCheck, Landmark,
  Gavel, ShieldAlert, Zap, BookOpen, ExternalLink, ArrowUpRight,
  Activity, Clock, X, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  EXPANSION_PHASES, 
  CountryPackManifest, 
  RegulatorDefinition, 
  LawDefinition 
} from '../services/nreCountryPacksData';

interface RegionalRegulatorManagerProps {
  onNotify?: (text: string, type?: 'success' | 'warning' | 'error') => void;
}

/**
 * RegionalRegulatorManager
 * Advanced administrative component for managing territory-based compliance
 * and NRE workflow configurations.
 */
export const RegionalRegulatorManager: React.FC<RegionalRegulatorManagerProps> = ({ onNotify }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('asia');
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const regions = [
    { id: 'asia', name: 'Asia Pacific', icon: Globe, color: 'text-indigo-400' },
    { id: 'middle_east', name: 'Middle East', icon: Landmark, color: 'text-amber-400' },
    { id: 'africa', name: 'Africa', icon: Shield, color: 'text-emerald-400' },
    { id: 'europe', name: 'Europe', icon: Scale, color: 'text-cyan-400' },
    { id: 'americas', name: 'Americas', icon: Building2, color: 'text-rose-400' },
  ];

  const fetchRegionalData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/nre/countries');
      const data = await res.json();
      if (data.success) {
        setCountries(data.countries || data.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch regional regulator data:', err);
      if (onNotify) onNotify('Failed to sync regional data packs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegionalData();
  }, []);

  const filteredCountries = countries.filter(c => 
    c.region_code === selectedRegion &&
    (c.country_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.country_code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleWorkflow = async (countryCode: string, field: string, currentValue: any) => {
    setUpdating(`${countryCode}-${field}`);
    try {
      const res = await fetch(`/api/v1/nre/countries/${countryCode}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue })
      });
      const data = await res.json();
      if (data.success) {
        setCountries(prev => prev.map(c => 
          c.country_code === countryCode ? { ...c, [field]: !currentValue } : c
        ));
        if (onNotify) onNotify(`Workflow configuration updated for ${countryCode}`, 'success');
      }
    } catch (err) {
      if (onNotify) onNotify('Update failed', 'error');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Visual Identity Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Regional Regulator Manager</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              Manage sovereign compliance configurations, legislative rule sets, and autonomous NRE workflow toggles for world jurisdictions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {regions.map(reg => (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedRegion === reg.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <reg.icon className={`w-3.5 h-3.5 ${selectedRegion === reg.id ? 'text-white' : reg.color}`} />
              <span className="hidden lg:inline">{reg.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Statistics & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              Intelligence Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/60">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Jurisdictions</div>
                <div className="text-2xl font-bold text-white mt-1">{filteredCountries.length}</div>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${(filteredCountries.length / (countries.length || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/60">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Compliance Score (Avg)</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">94.2%</div>
                <p className="text-[9px] text-slate-600 mt-2">Aggregated across all regional regulators</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/60">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Autonomous Enforcement</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {filteredCountries.filter(c => c.auto_enforcement).length}
                </div>
                <p className="text-[9px] text-slate-600 mt-2">Active AI decision gates enabled</p>
              </div>
            </div>

            <button 
              onClick={fetchRegionalData}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Compliance Packs
            </button>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-3xl p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-300">Statutory Notice Gating</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Regional overrides allow for strict statutory notices to be generated in local languages based on sovereign law rule sets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Jurisdiction Management Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder={`Search ${selectedRegion.toUpperCase()} jurisdictions...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all shadow-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCountries.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[2.5rem]"
                >
                  <Globe className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                  <h3 className="text-slate-300 font-bold">No Jurisdictions Identified</h3>
                  <p className="text-slate-600 text-xs mt-1">Refine your search or select a different world region.</p>
                </motion.div>
              ) : (
                filteredCountries.map((country, idx) => (
                  <motion.div 
                    layout
                    key={country.country_code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 flex flex-col"
                  >
                    <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold font-mono text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                          {country.country_code}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white tracking-tight">{country.country_name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                              {country.currency_code}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                              {country.legal_system || 'COMMON_LAW'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono border ${
                        country.is_active 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
                          : 'bg-rose-950/40 text-rose-400 border-rose-800/50'
                      }`}>
                        {country.is_active ? 'ACTIVE ENCLAVE' : 'LOCKED'}
                      </div>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                      {/* Workflow Toggles with sophisticated UI */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                          <Workflow className="w-3.5 h-3.5" />
                          Jurisdiction Workflow Toggles
                        </h5>
                        <div className="grid grid-cols-1 gap-2.5">
                          {[
                            { id: 'govt_mou_required', label: 'Government MOU Gating', icon: FileCheck, desc: 'Requires active treaty for data exchange' },
                            { id: 'strict_data_residency', label: 'Strict Sovereign Residency', icon: Lock, desc: 'All PII must remain on territory nodes' },
                            { id: 'auto_enforcement', label: 'Autonomous Enforcement', icon: Zap, desc: 'AI-driven penalty issuance without human-in-loop' },
                          ].map((toggle) => (
                            <div key={toggle.id} className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/40 rounded-2xl group/toggle transition-all hover:bg-slate-950">
                              <div className="flex items-center gap-3.5">
                                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 group-hover/toggle:text-indigo-400 group-hover/toggle:border-indigo-500/30 transition-colors">
                                  <toggle.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-slate-200 block">{toggle.label}</span>
                                  <span className="text-[9px] text-slate-600 mt-0.5 block">{toggle.desc}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleToggleWorkflow(country.country_code, toggle.id, country[toggle.id])}
                                disabled={updating === `${country.country_code}-${toggle.id}`}
                                className="cursor-pointer disabled:opacity-50 transition-transform active:scale-90"
                              >
                                {country[toggle.id] ? (
                                  <ToggleRight className="w-9 h-9 text-indigo-500" />
                                ) : (
                                  <ToggleLeft className="w-9 h-9 text-slate-800" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Legislative Status Area */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5" />
                          Sovereign Rule Integrity
                        </h5>
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-300">
                              {country.law_count || 1} Legislative Frameworks
                            </div>
                            <p className="text-[9px] text-slate-600 mt-1">Cross-referenced with statutory gazettes</p>
                          </div>
                          <button 
                            onClick={() => setSelectedCountry(country)}
                            className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-[10px] font-bold transition-all border border-indigo-500/20"
                          >
                            Manage Rule Sets
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <Building2 className="w-3 h-3" />
                        <span>Active Agencies: <strong className="text-indigo-400">{country.regulator_count || 2}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-mono text-slate-700">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Last Sync: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Advanced Rule & Regulator Configuration Modal */}
      <AnimatePresence>
        {selectedCountry && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCountry(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-700 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-indigo-600/20">
                    {selectedCountry.country_code}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-white tracking-tight">{selectedCountry.country_name}</h3>
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-900/40 text-indigo-400 border border-indigo-800 text-[10px] font-bold font-mono uppercase">
                        Sovereign Pack v2.4
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
                      <Gavel className="w-3.5 h-3.5 text-indigo-500" />
                      Managing territory-based compliance configurations and autonomous rule sets.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Statutory Agencies Grid */}
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Statutory Agencies & Enforcement Mandates
                    </h4>
                    <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Enlist New Agency
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'National Telecommunication Authority', code: 'NTA', power: 'High', sectors: 'Telecom, Digital' },
                      { name: 'Financial Supervisory Commission', code: 'FSC', power: 'Critical', sectors: 'Banking, FinTech' }
                    ].map((agency, aIdx) => (
                      <div key={aIdx} className="p-5 bg-slate-950/40 border border-slate-800 rounded-3xl group/agency hover:border-indigo-500/30 transition-all flex items-start justify-between">
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-bold text-white group-hover/agency:text-indigo-300 transition-colors">{agency.name}</h5>
                            <span className="text-[10px] font-mono text-slate-600 uppercase font-bold mt-1 block">NODE: {selectedCountry.country_code}_AG_{agency.code}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] font-bold uppercase tracking-wider">Active</span>
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-900 text-[9px] font-bold uppercase tracking-wider">{agency.power} Power</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">
                            Oversight across {agency.sectors} domains with direct enforcement capability.
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-indigo-400 transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Law Rules Engine Section */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Gavel className="w-4 h-4" />
                      Sovereign Law Rule Set Configuration
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-mono italic">Cross-referenced with SHA-256 Hash Ledger</span>
                      <button className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors border border-amber-400/20 px-3 py-1.5 rounded-xl bg-amber-400/5">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Enact Rule Update
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden">
                      <div className="p-5 bg-slate-900/80 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-500">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white tracking-tight">Sovereign Data & Privacy Governance Act</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">LEG_REF: DPGA_2026_V1</span>
                              <span className="w-1 h-1 rounded-full bg-slate-700" />
                              <span className="text-[10px] font-mono text-emerald-500 font-bold">STATUS: COMPLIANT</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500">2 Rules Loaded</span>
                          <ChevronRight className="w-4 h-4 text-slate-700" />
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        {[
                          { sec: 'Section 12.4', text: 'Non-compliant cross-border PII metadata transfer without statutory adequacy agreement.', severity: 'Critical', penalty: '10% GOR' },
                          { sec: 'Section 41.2', text: 'Failure to provide real-time autonomous audit logs to the National Cyber Intelligence Enclave.', severity: 'High', penalty: '€2.5M Fixed' }
                        ].map((rule, rIdx) => (
                          <div key={rIdx} className="group/rule flex items-start justify-between gap-6 p-5 bg-slate-900/30 border border-slate-800/40 rounded-[1.5rem] hover:bg-slate-900/60 hover:border-slate-700 transition-all">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">{rule.sec}</span>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                  rule.severity === 'Critical' ? 'bg-rose-950 text-rose-400 border border-rose-900/30' : 'bg-amber-950 text-amber-400 border border-amber-900/30'
                                } border`}>
                                  {rule.severity} Severity
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-medium">{rule.text}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-[9px] text-slate-600 block uppercase font-bold tracking-widest">Penalty Scale</span>
                                <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">{rule.penalty}</span>
                              </div>
                              <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-tighter transition-colors underline decoration-slate-800 underline-offset-4">Configure Rule Logic</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono block">Audit: Changes logged to append-only ledger</span>
                    <span className="text-[10px] font-mono text-slate-700">Committer: ADMIN_ENCLAVE_881</span>
                  </div>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => setSelectedCountry(null)}
                    className="flex-1 sm:flex-none px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={() => {
                      if (onNotify) onNotify(`Legislative configurations for ${selectedCountry.country_name} have been synchronized.`, 'success');
                      setSelectedCountry(null);
                    }}
                    className="flex-1 sm:flex-none px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-xl shadow-indigo-600/30 cursor-pointer"
                  >
                    Commit Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.8);
        }
      `}} />
    </div>
  );
};
