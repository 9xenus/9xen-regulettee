import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map, Shield, Grid, Search, Sliders, Activity, Server, Database, 
  BrainCircuit, Users, Edit, Globe, Scale, RefreshCw, Cpu, CheckCircle2,
  Lock, ArrowRight, FileCheck2, AlertTriangle, Layers, Award, Compass
} from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';
import { useRegionalCompliance } from '../context/RegionalComplianceContext';
import { 
  RegionKey, 
  REGIONAL_FRAMEWORKS 
} from '../services/regionalComplianceRulesEngine';
import { RegionalWorldMap } from '../components/regional/RegionalWorldMap';
import { RegionalLiabilitySimulator } from '../components/regional/RegionalLiabilitySimulator';
import { RegionalActInspector } from '../components/regional/RegionalActInspector';
import { RegionalTelemetryScanners } from '../components/regional/RegionalTelemetryScanners';
import { DataResidencyManager } from '../components/DataResidencyManager';
import { RegionalPolicyActs } from '../components/RegionalPolicyActs';
import { RegulatoryRadarWidget } from '../components/dashboard/RegulatoryRadarWidget';

export const RegionAwareDashboard = () => {
  const { showToast } = useNotification();
  const { 
    activeRegion, 
    setActiveRegion, 
    detectedRegion, 
    resetToDetectedRegion, 
    isOverridden,
    framework,
    allRegions,
    checkedControls,
    toggleControlCheck,
    complianceScore
  } = useRegionalCompliance();

  const [activeTab, setActiveTab] = useState<'overview' | 'regulatory-radar' | 'acts-authorities' | 'data-residency' | 'liability-simulator' | 'telemetry-scanners' | 'profiles'>('overview');
  const [regions, setRegions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [shards, setShards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShards = async () => {
    try {
      const r = await fetchWithRetry('/api/v1/regulatory/regional-shards');
      const d = await r.json();
      if (d.success) setShards(d.shards);
    } catch (e) {
      console.error('Failed to load regional shards:', e);
    }
  };

  useEffect(() => {
    const fetchJson = async (url: string) => {
      try {
        const r = await fetchWithRetry(url);
        if (!r.ok) {
          throw new Error(`HTTP ${r.status} ${r.statusText}`);
        }
        const contentType = r.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but received '${contentType || 'unknown'}'`);
        }
        return await r.json();
      } catch (err: any) {
        console.error(`Error loading ${url}:`, err);
        return [];
      }
    };

    Promise.all([
      fetchJson('/api/v1/engine/regions'),
      fetchJson('/api/v1/engine/profiles'),
      fetchJson('/api/v1/engine/industries'),
      fetchWithRetry('/api/v1/regulatory/regional-shards').then(res => res.json().catch(() => ({ shards: [] })))
    ]).then(([rData, pData, iData, sData]) => {
      setRegions(rData || []);
      setProfiles(pData || []);
      setIndustries(iData || []);
      setShards(sData?.shards || []);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load multi-region config', err);
      setLoading(false);
    });
  }, []);

  const getRegionCode = (id: number) => regions.find(r => r.id === id)?.code || 'Global';
  const getIndustryName = (id: number) => industries.find(i => i.id === id)?.name || 'Generic';

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12">
      {/* Top Banner & Jurisdiction State */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Cross-Border RegTech Engine
              </span>
              {isOverridden ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  Manual Jurisdiction Override Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Detected ({detectedRegion.detectionSource})
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 mt-2">
              <span>{framework.primaryFlag}</span>
              <span>{framework.displayName} Regional Compliance Dashboard</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Multi-jurisdiction statutory enforcement, hardware enclaves, regional policy acts, and physical database sharding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isOverridden && (
              <button
                onClick={resetToDetectedRegion}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset to Auto-Detected ({detectedRegion.regionKey})
              </button>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] font-mono text-slate-400 block">Sovereign Data Center</span>
              <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                {framework.sovereignDataCenter}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Regional Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Statutory Acts</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{framework.acts.length} Acts</span>
            <span className="text-[10px] text-indigo-600 font-medium">
              {framework.acts.map(a => a.shortCode).join(', ')}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Enforced Rules</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">
              {framework.acts.reduce((acc, a) => acc + a.rules.length, 0)} Rules
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Zero-Trust Verified</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Breach Notice SLA</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{framework.defaultBreachWindowHours} Hours</span>
            <span className="text-[10px] text-amber-600 font-medium">Mandatory Filing Window</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Audit Readiness</span>
            <span className="text-xl font-black text-indigo-700 mt-0.5 block">{complianceScore}%</span>
            <span className="text-[10px] text-slate-500 font-medium">Verified Controls Ratio</span>
          </div>
        </div>

        {/* Global Region Switcher Pills */}
        <div className="pt-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2">
            Switch Active Regional Jurisdiction:
          </span>
          <div className="flex flex-wrap gap-2">
            {allRegions.map((r) => {
              const isSelected = r.key === activeRegion;
              return (
                <button
                  key={r.key}
                  onClick={() => setActiveRegion(r.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/30'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{r.flag}</span>
                  <span>{r.displayName}</span>
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {r.currency}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto bg-white px-4 py-1 rounded-xl shadow-xs">
        {[
          { id: 'overview', label: 'Region Overview & Enclaves', icon: Globe },
          { id: 'regulatory-radar', label: 'Regulatory Radar & Deadlines', icon: Compass },
          { id: 'acts-authorities', label: 'Statutory Acts & Authorities', icon: Scale },
          { id: 'data-residency', label: 'Data Residency & Shards', icon: Database },
          { id: 'liability-simulator', label: 'Statutory Liability Simulator', icon: Shield },
          { id: 'telemetry-scanners', label: 'Live Node Telemetry', icon: Activity },
          { id: 'profiles', label: 'Industry Profiles', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-bold text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
          <span className="text-sm font-medium">Synchronizing multi-region sovereign nodes and SQLite shards...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB: REGULATORY RADAR */}
          {activeTab === 'regulatory-radar' && (
            <motion.div
              key="regulatory-radar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <RegulatoryRadarWidget defaultRegion={activeRegion} />
            </motion.div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Interactive World Map & Enclave Nodes */}
              <RegionalWorldMap 
                activeRegion={activeRegion}
                onSelectRegion={(reg) => setActiveRegion(reg)}
              />

              {/* Hybrid Storage & Live Pipeline Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Storage Architecture */}
                  <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        Hybrid Sovereign Storage & Cryptographic Architecture
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        Zero-Knowledge Validated
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-slate-600" /> SQLite Core Shard
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Local physical database sharding dedicated to {framework.displayName} transactional records.
                        </p>
                      </div>

                      <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <BrainCircuit className="w-4 h-4 text-indigo-600" /> KuzuDB Knowledge Graph
                        </div>
                        <p className="text-[11px] text-indigo-700/80 leading-relaxed">
                          Entity relationships, statutory cross-references, and extraterritorial jurisdiction mappings.
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <Search className="w-4 h-4 text-emerald-600" /> ChromaDB Vector Store
                        </div>
                        <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                          Semantic RAG retrieval for regulatory case-law, EDPB binding decisions, and precedent audits.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Pipeline Engine */}
                  <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      Live Cross-Border Pipeline & Enforcement Engine
                    </h3>
                    <div className="relative pt-2 pb-1">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                      <div className="flex justify-between relative z-10">
                        {[
                          { title: '1. Ingest', sub: 'TLS 1.3 / Kyber-768' },
                          { title: '2. Normalize', sub: 'Identity PII Token' },
                          { title: '3. Sanctions', sub: 'EU/OFAC/UN Lists' },
                          { title: '4. Residency', sub: 'Transfer Impact Test' },
                          { title: '5. Zero-Trust', sub: 'Policy Enforced' }
                        ].map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-4 border-white">
                              {idx + 1}
                            </div>
                            <div className="text-xs font-bold text-slate-800 mt-2 text-center">{step.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono text-center">{step.sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Supported Regions List & Fast Switch */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        All Global Jurisdictions ({allRegions.length})
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        100% Online
                      </span>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {allRegions.map((r) => {
                        const isCurrent = r.key === activeRegion;
                        return (
                          <div
                            key={r.key}
                            onClick={() => setActiveRegion(r.key)}
                            className={`flex justify-between items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{r.flag}</span>
                              <div>
                                <span className={`text-xs font-bold block ${isCurrent ? 'text-indigo-900' : 'text-slate-800'}`}>
                                  {r.displayName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {r.actCount} Acts • {r.ruleCount} Rules
                                </span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold font-mono rounded">
                              {r.currency}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ACTS & AUTHORITIES */}
          {activeTab === 'acts-authorities' && (
            <motion.div
              key="acts-authorities"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <RegionalActInspector 
                activeRegion={activeRegion}
                checkedControls={checkedControls}
                onToggleControl={toggleControlCheck}
              />
            </motion.div>
          )}

          {/* TAB 3: DATA RESIDENCY & SHARDS */}
          {activeTab === 'data-residency' && (
            <motion.div
              key="data-residency"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Physical Sovereign DB Shards */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-base font-bold text-slate-900">Physical Sovereign SQLite Shards</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Isolated physical SQLite database files allocated per jurisdiction to ensure zero cross-contamination.
                    </p>
                  </div>

                  <button 
                    onClick={fetchShards}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-xs font-bold text-indigo-600 transition shadow-xs flex items-center gap-1.5 self-start cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Shard Status
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-white border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5 font-bold text-slate-700">Region Shard</th>
                        <th className="px-6 py-3.5 font-bold text-slate-700">Database File</th>
                        <th className="px-6 py-3.5 font-bold text-slate-700">Storage Size</th>
                        <th className="px-6 py-3.5 font-bold text-slate-700">Record Count</th>
                        <th className="px-6 py-3.5 font-bold text-slate-700">Sovereign Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shards.map((sh, idx) => {
                        const isCurrentActive = sh.region?.toUpperCase().includes(activeRegion);
                        return (
                          <tr key={idx} className={`hover:bg-slate-50 transition ${isCurrentActive ? 'bg-indigo-50/40' : ''}`}>
                            <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                              {isCurrentActive && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                              <span>{sh.region}</span>
                            </td>
                            <td className="px-6 py-3.5 font-mono text-slate-600">{sh.dbFile}</td>
                            <td className="px-6 py-3.5 text-slate-700 font-semibold">{sh.active ? `${sh.sizeKb} KB` : 'On-Demand'}</td>
                            <td className="px-6 py-3.5 font-mono text-slate-900 font-bold">{sh.recordsStored}</td>
                            <td className="px-6 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sh.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sh.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {sh.active ? 'ACTIVE & SHARDED' : 'STANDBY'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {shards.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                            Loading sovereign database shards...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Residency Manager */}
              <DataResidencyManager 
                profileType={profiles[0]?.profile_type || "EU_GDPR_PROFILE"} 
                currentRegion={activeRegion} 
                onPolicyUpdate={(region, override) => showToast(`Updated policy for ${region} to ${override}`, 'info')} 
              />
            </motion.div>
          )}

          {/* TAB 4: LIABILITY SIMULATOR */}
          {activeTab === 'liability-simulator' && (
            <motion.div
              key="liability-simulator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <RegionalLiabilitySimulator activeRegion={activeRegion} />
            </motion.div>
          )}

          {/* TAB 5: TELEMETRY SCANNERS */}
          {activeTab === 'telemetry-scanners' && (
            <motion.div
              key="telemetry-scanners"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <RegionalTelemetryScanners 
                activeRegion={activeRegion}
                shards={shards}
                onRefreshShards={fetchShards}
              />
            </motion.div>
          )}

          {/* TAB 6: INDUSTRY PROFILES */}
          {activeTab === 'profiles' && (
            <motion.div
              key="profiles"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Industry Sector Profile Configurations</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sector-specific mandatory controls (e.g. DORA for FinTech, HIPAA for HealthTech, EU AI Act for AI Labs).
                  </p>
                </div>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-white border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold text-slate-700">Profile Type</th>
                      <th className="px-6 py-3.5 font-bold text-slate-700">Region Binding</th>
                      <th className="px-6 py-3.5 font-bold text-slate-700">Industry Pack</th>
                      <th className="px-6 py-3.5 font-bold text-slate-700 text-right">Mandatory Checks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profiles.map((p: any, i: number) => {
                      const checks = p.mandatory_checks ? JSON.parse(p.mandatory_checks) : [];
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-3.5 text-indigo-700 font-bold font-mono">{p.profile_type}</td>
                          <td className="px-6 py-3.5 text-slate-600">
                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold">
                              {getRegionCode(p.region_id)}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-slate-700 font-medium">{getIndustryName(p.industry_id)}</td>
                          <td className="px-6 py-3.5 text-slate-600 text-right">
                            <div className="flex gap-1 justify-end">
                              {checks.map((c: string) => (
                                <span key={c} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {profiles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-6 text-center text-slate-500">No industry profiles found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
