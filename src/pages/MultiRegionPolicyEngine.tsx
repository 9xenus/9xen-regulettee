import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Zap,
  BookOpen,
  FileText,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  Layers,
  Database,
  Sliders,
  CheckCircle2,
  CheckCircle,
  ArrowRight,
  Filter,
  Terminal,
  Sparkles,
  Download,
  Server,
  Activity,
  Cpu,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithRetry } from '../lib/api-client';
import { useAuth } from '../context/AuthContext';
import { JurisdictionComparisonSplitView } from '../components/admin/JurisdictionComparisonSplitView';

interface PolicyRule {
  ruleId: string;
  articleRef: string;
  ruleTitle: string;
  description: string;
  mandatoryControl: string;
  violationTriggers: string[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  basePenaltyEur: number;
}

interface FineTier {
  tierName: string;
  description: string;
  maxFineAmount: string;
}

interface FineStructure {
  maxStatutoryFine: string;
  penaltyCurrency: string;
  maxPercentageTurnover?: number;
  fineTiers: FineTier[];
}

interface PolicyAct {
  actId: string;
  region: string;
  regionDisplayName: string;
  countryCode?: string;
  countryName?: string;
  countryFlag: string;
  title: string;
  shortCode: string;
  effectiveYear: number;
  officialSourceUrl: string;
  lastSyncedAt: string;
  syncStatus: string;
  summary: string;
  scopeAndApplicability: string;
  finesAndPenalties: FineStructure;
  rules: PolicyRule[];
}

interface RagSearchResult {
  chunkId: string;
  actTitle: string;
  region: string;
  articleRef: string;
  text: string;
  similarityScore: number;
}

interface ViolationMatch {
  violationId: string;
  actId: string;
  actTitle: string;
  region: string;
  regionDisplayName: string;
  countryFlag: string;
  articleRef: string;
  ruleTitle: string;
  issueDescription: string;
  mandatoryControlRequired: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedPenaltyAmountEur: number;
  estimatedPenaltyFormatted: string;
  statuteCitation: string;
  evidenceForensics: string[];
}

interface MultiRegionPolicyEngineProps {
  activeRole?: string;
}

export const MultiRegionPolicyEngine: React.FC<MultiRegionPolicyEngineProps> = ({ activeRole }) => {
  const { user } = useAuth();
  const resolvedRole = (activeRole || user?.user_metadata?.role || user?.user_metadata?.accountType || 'CLIENT').toUpperCase();
  const isAdmin = resolvedRole === 'ADMIN' || resolvedRole === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'matrix' | 'sync' | 'rag_search' | 'scanner' | 'regions_countries' | 'split_view' | 'engine_status'>('split_view');
  const [regionalSetup, setRegionalSetup] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'regions_countries') {
      fetchWithRetry('/api/v1/compliance/regions-countries')
        .then(res => res.json())
        .then(data => {
           if (data && data.success && Array.isArray(data.regions)) {
             setRegionalSetup(data.regions);
           }
        })
        .catch(err => console.error('Failed to load regions-countries:', err));
    }
  }, [activeTab]);

  const toggleCountryStatus = async (code: string, currentStatus: boolean) => {
    try {
      const res = await fetchWithRetry(`/api/v1/compliance/countries/${code}/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !currentStatus }) });
      if(res.ok) {
        // refresh
        const d = await fetchWithRetry('/api/v1/compliance/regions-countries');
        const data = await d.json();
        if (data && data.success && Array.isArray(data.regions)) {
          setRegionalSetup(data.regions);
        }
      }
    } catch(err){ console.error(err); }
  };


  // Sync tab state safety fallback
  useEffect(() => {
    if (activeTab === 'sync' && !isAdmin) {
      setActiveTab('matrix');
    }
  }, [activeTab, isAdmin]);

  // Filter States
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'LIST' | 'COUNTRY_GRID'>('COUNTRY_GRID');

  // Policy Acts Data
  const [acts, setActs] = useState<PolicyAct[]>([]);
  const [groupedCountries, setGroupedCountries] = useState<any[]>([]);
  const [loadingActs, setLoadingActs] = useState<boolean>(false);
  const [selectedAct, setSelectedAct] = useState<PolicyAct | null>(null);

  // Auto Sync State
  const [syncUrl, setSyncUrl] = useState<string>('https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679');
  const [syncActId, setSyncActId] = useState<string>('EU-GDPR-2016');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);

  // RAG Search State
  const [ragQuery, setRagQuery] = useState<string>('unencrypted personal data cross border transfer penalties');
  const [ragResults, setRagResults] = useState<RagSearchResult[]>([]);
  const [isSearchingRag, setIsSearchingRag] = useState<boolean>(false);

  // Backend Engine Console State
  const [engineStatus, setEngineStatus] = useState<any | null>(null);
  const [loadingEngine, setLoadingEngine] = useState<boolean>(false);

  const fetchEngineStatus = async () => {
    setLoadingEngine(true);
    try {
      const res = await fetchWithRetry('/api/v1/engine/status');
      const data = await res.json();
      if (data.success) {
        setEngineStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch engine status:', err);
    } finally {
      setLoadingEngine(false);
    }
  };

  // Multi-Region Scanner State
  const [scanTarget, setScanTarget] = useState<string>('https://api.myclient-app.com/v1/users?http_plain=true&unencrypted=true');
  const [scanRegions, setScanRegions] = useState<string[]>(['ALL']);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanReport, setScanReport] = useState<any | null>(null);

  const regionTabs = [
    { code: 'ALL', name: 'All Regions', flag: '🌍' },
    { code: 'EU', name: 'European Union', flag: '🇪🇺' },
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'AUSTRALIA', name: 'Australia', flag: '🇦🇺' },
    { code: 'ASIA', name: 'Asia Pacific', flag: '🌏' },
    { code: 'MIDDLE_EAST', name: 'Middle East', flag: '🇸🇦' },
    { code: 'AFRICA', name: 'Africa', flag: '🇿🇦' },
    { code: 'LATIN_AMERICA', name: 'Latin America', flag: '🇧🇷' },
    { code: 'NEW_ZEALAND', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'GLOBAL', name: 'Global Standards', flag: '🌐' }
  ];

  const fetchActs = async () => {
    setLoadingActs(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedRegion !== 'ALL') queryParams.append('region', selectedRegion);
      if (selectedCountry !== 'ALL') queryParams.append('country', selectedCountry);
      if (searchQuery) queryParams.append('search', searchQuery);

      const [actsRes, countryRes] = await Promise.all([
        fetchWithRetry(`/api/v1/multi-region-policy/acts?${queryParams.toString()}`),
        fetchWithRetry(`/api/v1/multi-region-policy/acts/by-country?${queryParams.toString()}`)
      ]);

      const data = await actsRes.json();
      const countryData = await countryRes.json();

      if (data.success) {
        setActs(data.acts);
        if (data.acts.length > 0 && !selectedAct) {
          setSelectedAct(data.acts[0]);
        }
      }

      if (countryData.success) {
        setGroupedCountries(countryData.countries);
      }
    } catch (err) {
      console.error('Failed to fetch multi-region policy acts:', err);
    } finally {
      setLoadingActs(false);
    }
  };

  useEffect(() => {
    fetchActs();
  }, [selectedRegion, selectedCountry, searchQuery]);

  const handleRunSync = async () => {
    if (!syncUrl) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetchWithRetry('/api/v1/multi-region-policy/sync-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actId: syncActId, sourceUrl: syncUrl })
      });
      const data = await res.json();
      setSyncResult(data);
      fetchActs();
    } catch (err: any) {
      setSyncResult({ success: false, message: err?.message || 'Sync failed.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRagSearch = async () => {
    if (!ragQuery) return;
    setIsSearchingRag(true);
    try {
      const res = await fetchWithRetry('/api/v1/multi-region-policy/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText: ragQuery, region: selectedRegion })
      });
      const data = await res.json();
      if (data.success) {
        setRagResults(data.results);
      }
    } catch (err) {
      console.error('RAG Search failed:', err);
    } finally {
      setIsSearchingRag(false);
    }
  };

  const handleRunMultiRegionScan = async () => {
    if (!scanTarget) return;
    setIsScanning(true);
    setScanReport(null);
    try {
      const res = await fetchWithRetry('/api/v1/multi-region-policy/scan-and-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetInput: scanTarget, selectedRegions: scanRegions })
      });
      const data = await res.json();
      if (data.success) {
        setScanReport(data.report);
      }
    } catch (err) {
      console.error('Multi-region scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-5 lg:p-6 space-y-5 sm:space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-5 sm:p-6 lg:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400 shadow-inner">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  Multi-Region Law Act & Policy Sync Engine
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    RAG Vector Store Active
                  </span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Automated statutory act synchronization from global sources (EU, USA, Australia, Asia, Latin America, NZ) with fine matrix & violation match scanning.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchActs(); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loadingActs ? 'animate-spin' : ''}`} />
              Refresh Acts
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Zap className="w-4 h-4" />
              Run Multi-Region Scan
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('split_view')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'split_view'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-400" />
            Jurisdiction Split-View Comparator
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'matrix'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Law Act & Rule Matrix ({acts.length})
          </button>
          <button onClick={() => setActiveTab('regions_countries')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'regions_countries' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'}`}><Globe className="w-4 h-4" /> Regions & Registration</button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'sync'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Website Auto-Sync Engine
            </button>
          )}
          <button
            onClick={() => { setActiveTab('rag_search'); handleRagSearch(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'rag_search'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            RAG Vector Semantic Search
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'scanner'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Violation Match & Penalty Scanner
          </button>
          <button
            onClick={() => { setActiveTab('engine_status'); fetchEngineStatus(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'engine_status'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-900/60 text-emerald-400 hover:text-emerald-300 border border-emerald-900/60'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-400" />
            Backend Engine Console
          </button>
        </div>
      </div>

      {/* Region & Country Filter Bar */}
      <div className="space-y-3 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Region:</span>
            {regionTabs.map(tab => (
              <button
                key={tab.code}
                onClick={() => { setSelectedRegion(tab.code); setSelectedCountry('ALL'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedRegion === tab.code
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <span>{tab.flag}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('COUNTRY_GRID')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'COUNTRY_GRID'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Country Categories ({groupedCountries.length})
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'LIST'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              All Acts List ({acts.length})
            </button>
          </div>
        </div>

        {/* Country Chips Filter */}
        {groupedCountries.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Country:</span>
            <button
              onClick={() => setSelectedCountry('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCountry === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              🌐 All Countries
            </button>
            {groupedCountries.map((c: any) => (
              <button
                key={c.countryName}
                onClick={() => setSelectedCountry(c.countryName)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedCountry === c.countryName
                    ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{c.countryFlag}</span>
                <span>{c.countryName}</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  {c.actCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 0: SPLIT-VIEW JURISDICTION COMPARATOR */}
      {activeTab === 'split_view' && (
        <JurisdictionComparisonSplitView />
      )}

      {/* TAB 1: LAW ACT & RULE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Act List or Country Grid */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search statutory act, article, or keyword..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
              {loadingActs ? (
                <div className="p-5 sm:p-6 lg:p-8 text-center text-slate-500 text-sm">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  Loading Multi-Region Policy Acts...
                </div>
              ) : acts.length === 0 ? (
                <div className="p-5 sm:p-6 lg:p-8 text-center text-slate-500 text-sm bg-slate-900/50 rounded-xl border border-slate-800">
                  No policy acts found for the selected country & region filter.
                </div>
              ) : viewMode === 'COUNTRY_GRID' ? (
                /* CATEGORIZED BY COUNTRY VIEW */
                groupedCountries.map((cGroup: any) => (
                  <div key={cGroup.countryName} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{cGroup.countryFlag}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {cGroup.countryName}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {cGroup.regionDisplayName}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-400">{cGroup.actCount} Statutory Act{cGroup.actCount > 1 ? 's' : ''} Enforced</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {cGroup.acts.map((act: PolicyAct) => (
                        <div
                          key={act.actId}
                          onClick={() => setSelectedAct(act)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedAct?.actId === act.actId
                              ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-950/50'
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                              {act.shortCode}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {act.syncStatus}
                            </span>
                          </div>

                          <h5 className="text-xs font-semibold text-slate-100 mt-1.5 line-clamp-1">{act.title}</h5>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{act.summary}</p>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                            <span className="text-amber-400 font-medium truncate max-w-[180px]">
                              {act.finesAndPenalties?.maxStatutoryFine || 'Statutory Fine Defined'}
                            </span>
                            <span className="text-slate-400">{act.rules?.length || 0} Rules</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                /* FLAT LIST VIEW */
                acts.map(act => (
                  <div
                    key={act.actId}
                    onClick={() => setSelectedAct(act)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAct?.actId === act.actId
                        ? 'bg-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{act.countryFlag}</span>
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                            {act.shortCode}
                          </span>
                          <span className="ml-2 text-xs text-slate-400">{act.countryName || act.regionDisplayName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {act.syncStatus}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 mt-2 line-clamp-1">{act.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{act.summary}</p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
                      <span className="text-amber-400/90 font-medium flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {act.finesAndPenalties?.maxStatutoryFine ? act.finesAndPenalties.maxStatutoryFine.slice(0, 32) + '...' : 'Statutory Fine Defined'}
                      </span>
                      <span className="text-slate-500">{act.rules?.length || 0} Statutory Rules</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Act Detail View */}
          <div className="lg:col-span-7">
            {selectedAct ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
                {/* Title & Region Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{selectedAct.countryFlag}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {selectedAct.regionDisplayName} ({selectedAct.region})
                      </span>
                      <span className="text-xs text-slate-400">Effective: {selectedAct.effectiveYear}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedAct.title}</h2>
                  </div>

                  <a
                    href={selectedAct.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <span>Official Feed</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Summary & Applicability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Statutory Summary
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedAct.summary}</p>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      Scope & Applicability
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedAct.scopeAndApplicability}</p>
                  </div>
                </div>

                {/* Fines & Penalty Matrix */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      Statutory Fines & Monetary Penalty Structure
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Currency: {selectedAct.finesAndPenalties.penaltyCurrency}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200">
                    Maximum Statutory Cap: <span className="text-amber-300">{selectedAct.finesAndPenalties.maxStatutoryFine}</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {selectedAct.finesAndPenalties.fineTiers?.map((tier, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-3 rounded-lg border border-amber-500/20 text-xs">
                        <div className="font-bold text-amber-300">{tier.tierName}</div>
                        <div className="text-slate-400 mt-0.5">{tier.description}</div>
                        <div className="font-mono text-emerald-400 mt-1">Max: {tier.maxFineAmount}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Articles & Statutory Rules */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-400" />
                    Enforceable Articles & Mandatory Safeguard Rules ({selectedAct.rules.length})
                  </h3>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {selectedAct.rules.map(rule => (
                      <div key={rule.ruleId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {rule.articleRef}
                            </span>
                            <span className="text-xs font-semibold text-slate-100">{rule.ruleTitle}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rule.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            rule.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {rule.severity}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">{rule.description}</p>

                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                          <span className="font-semibold text-emerald-400">Mandatory Control: </span>
                          <span className="text-slate-300">{rule.mandatoryControl}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Triggers: {rule.violationTriggers.join(', ')}</span>
                          <span className="font-mono text-amber-400">Base Fine Est: €{rule.basePenaltyEur.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                Select a policy act from the left matrix to inspect articles, safeguards, and fine caps.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITE AUTO-SYNC ENGINE */}
      {activeTab === 'sync' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
              Automated Website Policy Act Scraper & RAG Ingestion
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Synchronize legal rules dynamically from government websites, EUR-Lex feeds, or official statutory portals into the RAG Vector Store.
            </p>
          </div>

          <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Statutory Feed / Website URL</label>
              <input
                type="text"
                value={syncUrl}
                onChange={e => setSyncUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Associate with Policy Act</label>
              <select
                value={syncActId}
                onChange={e => setSyncActId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {acts.map(act => (
                  <option key={act.actId} value={act.actId}>
                    {act.countryFlag} {act.shortCode} - {act.title} ({act.region})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scraping & Ingesting Vector Chunks into RAG Store...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Execute RAG Policy Sync & Vector Ingestion
                </>
              )}
            </button>
          </div>

          {syncResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              syncResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {syncResult.message}
              </div>
              {syncResult.chunksIngested && (
                <p>Vector chunks ingested into SQLite RAG Store: <span className="font-mono font-bold">{syncResult.chunksIngested}</span></p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RAG VECTOR SEMANTIC SEARCH */}
      {activeTab === 'rag_search' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              RAG Vector Database Semantic Explorer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Query vector chunks indexed across global region policy acts using cosine term relevance search.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={ragQuery}
              onChange={e => setRagQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRagSearch()}
              placeholder="e.g. unencrypted personal data cross border transfer penalties..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleRagSearch}
              disabled={isSearchingRag}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              {isSearchingRag ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search RAG DB
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Semantic Vector Matches ({ragResults.length})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ragResults.map(result => (
                <div key={result.chunkId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400">{result.actTitle} ({result.region})</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {(result.similarityScore * 100).toFixed(0)}% Relevance
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">{result.articleRef}</div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-3 rounded-lg border border-slate-800/80">
                    {result.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VIOLATION MATCH & PENALTY SCANNER */}
      {activeTab === 'scanner' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              Multi-Region Policy Act Violation Scanner & Fine Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Scans target website URLs, APIs, or code payloads against multi-region RAG policy rules and calculates statutory fines.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Resource / Website URL / Code Payload</label>
              <textarea
                rows={3}
                value={scanTarget}
                onChange={e => setScanTarget(e.target.value)}
                placeholder="Enter URL or code snippet to evaluate against multi-region acts..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleRunMultiRegionScan}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Multi-Region RAG Policy Audit...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Execute Multi-Region Compliance Violation Scan
                </>
              )}
            </button>
          </div>

          {/* Scan Report Output */}
          {scanReport && (
            <div className="space-y-4 sm:space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Scanned Resource</div>
                  <div className="text-sm font-semibold text-slate-200 mt-1 truncate">{scanReport.targetInput}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Violations Detected</div>
                  <div className="text-2xl font-bold text-red-400 mt-1">{scanReport.totalViolations} Acts Violated</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-400 font-medium">Total Statutory Fine Exposure</div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">{scanReport.totalEstimatedPenaltyFormatted}</div>
                </div>
              </div>

              {/* Violation Items */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Statutory Violation Breakdown</h3>

                {scanReport.violations.map((viol: ViolationMatch) => (
                  <div key={viol.violationId} className="bg-slate-950 p-5 rounded-xl border border-red-500/30 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{viol.countryFlag}</span>
                        <div>
                          <span className="text-xs font-bold text-white">{viol.actTitle} ({viol.regionDisplayName})</span>
                          <div className="text-xs text-indigo-400 font-mono mt-0.5">{viol.statuteCitation}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30">
                          {viol.estimatedPenaltyFormatted}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{viol.issueDescription}</p>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <span className="font-bold text-emerald-400">Required Safeguard: </span>
                      <span className="text-slate-200">{viol.mandatoryControlRequired}</span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 bg-slate-900/60 p-2 rounded border border-slate-800 space-y-0.5">
                      {viol.evidenceForensics.map((ev, idx) => (
                        <div key={idx}>• {ev}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BACKEND ENGINE CONSOLE & DIAGNOSTICS */}
      {activeTab === 'engine_status' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Server className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    9Xen Regulettee Full-Stack Engine Console
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ONLINE & HEALTHY
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time Node.js server runtime metrics, SQLite database status, active engine subsystems, and API response tester.
                  </p>
                </div>
              </div>

              <button
                onClick={fetchEngineStatus}
                disabled={loadingEngine}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingEngine ? 'animate-spin' : ''}`} />
                Refresh Engine Status
              </button>
            </div>

            {loadingEngine && !engineStatus ? (
              <div className="p-12 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
                <p className="text-sm font-medium">Connecting to Backend Engine Process...</p>
              </div>
            ) : engineStatus ? (
              <div className="space-y-6">
                {/* System Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Server Runtime</span>
                      <Cpu className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-lg font-bold text-white mt-2 font-mono">{engineStatus.nodeVersion}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Uptime: {Math.floor(engineStatus.uptimeSeconds / 60)}m {engineStatus.uptimeSeconds % 60}s</div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Memory RSS</span>
                      <Activity className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-lg font-bold text-indigo-300 mt-2 font-mono">{engineStatus.memory?.rssMb} MB</div>
                    <div className="text-[11px] text-slate-500 mt-1">Heap Used: {engineStatus.memory?.heapUsedMb} MB</div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>SQLite DB Records</span>
                      <HardDrive className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-lg font-bold text-amber-300 mt-2 font-mono">{engineStatus.database?.totalPolicyActs} Statutory Acts</div>
                    <div className="text-[11px] text-slate-500 mt-1">{engineStatus.database?.totalSovereignCountries} Sovereign Nations</div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Database Driver</span>
                      <Database className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-sm font-bold text-cyan-300 mt-2 truncate">{engineStatus.database?.driver}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{engineStatus.database?.supportedRegions?.length} Regions Supported</div>
                  </div>
                </div>

                {/* Subsystem Readiness Matrix */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Engine Subsystems Health Matrix
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {engineStatus.subsystems?.map((sub: any) => (
                      <div key={sub.code} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-200">{sub.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{sub.code}</div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw API Response Inspector */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      Live API Payload Inspector (`/api/v1/engine/status`)
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">Fetched: {engineStatus.timestamp}</span>
                  </div>

                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 text-xs font-mono text-emerald-400 overflow-x-auto max-h-80 leading-relaxed scrollbar-thin">
                    {JSON.stringify(engineStatus, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiRegionPolicyEngine;
