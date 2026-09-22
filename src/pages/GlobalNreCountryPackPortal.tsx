import React, { useState, useEffect } from 'react';
import { 
  Globe, Shield, Scale, AlertCircle, CheckCircle, 
  DollarSign, Search, ArrowRight, Lock, Play, RefreshCw,
  PlusCircle, BookOpen, FileText, Send, Building2,
  Layers, ChevronRight, Eye, Check, X, Printer,
  Download, Award, AlertTriangle, HelpCircle, ToggleLeft,
  ToggleRight, Power, PowerOff, CheckCircle2, XCircle, Info,
  Settings, Zap, Link as LinkIcon
} from 'lucide-react';
import { EXPANSION_PHASES, TIER1_COUNTRY_PACKS, ALL_NRE_WORLD_COUNTRIES } from '../services/nreCountryPacksData';
import { RegionalRegulatorManager } from '../components/RegionalRegulatorManager';
import { GlobalRegulatorySync } from '../components/GlobalRegulatorySync';
import { RegulatoryLawManager } from '../components/admin/RegulatoryLawManager';

export const GlobalNreCountryPackPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'regions' | 'admin_entry' | 'jurisdiction' | 'scanner_gate' | 'fx_ledger' | 'letter_gen' | 'regulator_manager' | 'regulatory_sync' | 'law_mapping'>('registry');
  const [countries, setCountries] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [selectedPhase, setSelectedPhase] = useState<number | 'ALL'>('ALL');
  const [selectedCountryDetail, setSelectedCountryDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // FX Exposure state
  const [fxExposure, setFxExposure] = useState<any>({ totalUsdExposure: 0, exposures: [] });

  // Legal Gate Tester state
  const [testCountry, setTestCountry] = useState('BD');
  const [testUrl, setTestUrl] = useState('https://fintech-gateway.io/api/v1/payments');
  const [testDepth, setTestDepth] = useState(4);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);

  // Cross-Border Resolver state
  const [resolveDomain, setResolveDomain] = useState('cross-border-remittance.ae');
  const [targetMarkets, setTargetMarkets] = useState('AE, IN, BD');
  const [resolution, setResolution] = useState<any | null>(null);
  const [resolving, setResolving] = useState(false);

  // Letter Generator state
  const [letterCountry, setLetterCountry] = useState('BD');
  const [letterEntity, setLetterEntity] = useState('Axiom Global Tech Ltd');
  const [letterCaseNo, setLetterCaseNo] = useState('CASE-2026-NRE-8891');
  const [letterPenalty, setLetterPenalty] = useState(2500000);
  const [letterSection, setLetterSection] = useState('BTR_ACT_2001 Section 65A');
  const [generatedLetter, setGeneratedLetter] = useState<any | null>(null);
  const [generatingLetter, setGeneratingLetter] = useState(false);

  // Country Pack Admin Dynamic Form State (Non-Engineers Data Entry)
  const [adminCountryCode, setAdminCountryCode] = useState('SG');
  const [adminCountryName, setAdminCountryName] = useState('Singapore');
  const [adminRegion, setAdminRegion] = useState<'asia' | 'middle_east' | 'africa' | 'americas' | 'europe'>('asia');
  const [adminCurrency, setAdminCurrency] = useState('SGD');
  const [adminPrimaryLang, setAdminPrimaryLang] = useState('en');
  const [adminLegalSystem, setAdminLegalSystem] = useState<'common_law' | 'civil_law' | 'sharia_based' | 'mixed'>('common_law');
  const [adminGate, setAdminGate] = useState<'standard' | 'strict' | 'government_mou_required' | 'restricted'>('standard');
  const [adminResidency, setAdminResidency] = useState(false);
  const [adminRegulatorCode, setAdminRegulatorCode] = useState('MAS');
  const [adminRegulatorName, setAdminRegulatorName] = useState('Monetary Authority of Singapore');
  const [adminLawCode, setAdminLawCode] = useState('PDPA_2012');
  const [adminLawTitle, setAdminLawTitle] = useState('Personal Data Protection Act 2012');
  const [adminRuleSection, setAdminRuleSection] = useState('Section 24');
  const [adminRuleTitle, setAdminRuleTitle] = useState('Failure to Protect Personal Data with Reasonable Security Safeguards');
  const [adminMinPenalty, setAdminMinPenalty] = useState(50000);
  const [adminMaxPenalty, setAdminMaxPenalty] = useState(1000000);
  const [adminSaveMessage, setAdminSaveMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resC, resR, resFx] = await Promise.all([
        fetch('/api/v1/nre/countries'),
        fetch('/api/v1/nre/regions'),
        fetch('/api/v1/nre/fx/exposure')
      ]);
      const dataC = await resC.json();
      const dataR = await resR.json();
      const dataFx = await resFx.json();
      if (dataC.success) setCountries(dataC.countries || dataC.data || []);
      if (dataR.success) setRegions(dataR.regions || dataR.data || []);
      if (dataFx.success) setFxExposure(dataFx);
    } catch (err) {
      console.warn('Failed to load NRE country data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const loadCountryDetail = async (code: string) => {
    try {
      const res = await fetch(`/api/v1/nre/countries/${code}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCountryDetail(data.country);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Country ON/OFF
  const handleToggleCountry = async (countryCode: string, currentActive: number | boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextState = !Boolean(currentActive);
    try {
      const res = await fetch(`/api/v1/nre/countries/${countryCode}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState })
      });
      const data = await res.json();
      if (data.success) {
        setCountries(prev => prev.map(c => c.country_code === countryCode ? { ...c, is_active: nextState ? 1 : 0, pack_status: nextState ? 'active' : 'suspended' } : c));
        if (selectedCountryDetail && selectedCountryDetail.country_code === countryCode) {
          setSelectedCountryDetail((prev: any) => prev ? { ...prev, is_active: nextState ? 1 : 0 } : null);
        }
        showNotification(
          nextState 
            ? `Jurisdiction ${countryCode} enabled. Registrations & logins for this country are now ACTIVE.`
            : `Jurisdiction ${countryCode} disabled. Registrations & logins for this country are now SUSPENDED.`,
          nextState ? 'success' : 'warning'
        );
      } else {
        showNotification(data.error || 'Failed to toggle country', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Toggle Region ON/OFF
  const handleToggleRegion = async (regionCode: string, currentActive: number | boolean) => {
    const nextState = !Boolean(currentActive);
    try {
      const res = await fetch(`/api/v1/nre/regions/${regionCode}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState, cascade: true })
      });
      const data = await res.json();
      if (data.success) {
        setRegions(prev => prev.map(r => r.region_code === regionCode ? { ...r, is_active: nextState ? 1 : 0 } : r));
        fetchData();
        showNotification(
          nextState 
            ? `Region ${regionCode.toUpperCase()} activated. All jurisdiction accounts in this region are now accessible.`
            : `Region ${regionCode.toUpperCase()} suspended. All country accounts in this region have been locked by Sovereign Admin.`,
          nextState ? 'success' : 'warning'
        );
      } else {
        showNotification(data.error || 'Failed to toggle region', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Toggle Regulator ON/OFF
  const handleToggleRegulator = async (regulatorId: string, currentActive: number | boolean, regulatorCode: string) => {
    const nextState = !Boolean(currentActive);
    try {
      const res = await fetch(`/api/v1/nre/regulators/${regulatorId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState })
      });
      const data = await res.json();
      if (data.success) {
        if (selectedCountryDetail) {
          setSelectedCountryDetail((prev: any) => ({
            ...prev,
            regulators: prev.regulators?.map((r: any) => r.id === regulatorId ? { ...r, is_active: nextState ? 1 : 0 } : r)
          }));
        }
        showNotification(
          nextState 
            ? `Regulator ${regulatorCode} activated. Statutory enforcement & registrations enabled.`
            : `Regulator ${regulatorCode} deactivated. Statutory operations under this agency are disabled.`,
          nextState ? 'success' : 'warning'
        );
      } else {
        showNotification(data.error || 'Failed to toggle regulator', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleTestScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/v1/nre/scan/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: testCountry,
          targetUrl: testUrl,
          scanDepth: testDepth
        })
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err: any) {
      setScanResult({ success: false, error: err.message });
    } finally {
      setScanning(false);
    }
  };

  const handleResolveJurisdiction = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolving(true);
    try {
      const markets = targetMarkets.split(',').map(m => m.trim().toUpperCase());
      const res = await fetch('/api/v1/nre/jurisdiction/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: resolveDomain, userRegions: markets })
      });
      const data = await res.json();
      if (data.success) {
        setResolution(data);
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setResolving(false);
    }
  };

  const handleGenerateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingLetter(true);
    try {
      const res = await fetch('/api/v1/nre/letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: letterCountry,
          entityName: letterEntity,
          caseNumber: letterCaseNo,
          penaltyAmount: letterPenalty,
          violationSection: letterSection
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedLetter(data.letterPayload);
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleAdminPackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSaveMessage(null);
    const newPackPayload = {
      countryCode: adminCountryCode.toUpperCase(),
      countryName: adminCountryName,
      regionCode: adminRegion,
      currencyCode: adminCurrency.toUpperCase(),
      languages: [adminPrimaryLang, 'en'],
      primaryLanguage: adminPrimaryLang,
      timezone: 'UTC',
      legalSystem: adminLegalSystem,
      dataResidencyRequired: adminResidency,
      internationalSanctionsList: ['UN', 'OFAC'],
      scannerLegalGate: adminGate,
      govtMouRequired: adminGate === 'government_mou_required',
      packVersion: '1.0.0',
      status: 'active',
      fxSource: `${adminCountryName.toUpperCase()}_CENTRAL_BANK`,
      scannerConfig: {
        robotsPolicy: 'standard',
        crawlDepth: 4,
        githubEnabled: true,
        cloudScan: 'standard',
        registrySource: 'official_api'
      },
      notificationChannels: {
        email: true,
        whatsapp: true,
        wechat: false,
        smsFallback: true,
        physicalLetter: true,
        languagePriority: [adminPrimaryLang, 'en']
      },
      letterTemplateSet: [
        {
          templateId: `${adminCountryCode.toUpperCase()}_OFFICIAL_NOTICE`,
          title: `Statutory Regulatory Notice - ${adminCountryName}`,
          headerSeal: `SEAL_${adminCountryCode.toUpperCase()}_OFFICIAL`,
          salutationEn: 'TO THE AUTHORIZED OFFICER / GENERAL COUNSEL,',
          statutoryPreambleEn: `Pursuant to statutory regulatory oversight in ${adminCountryName}, this enforcement notice is formally served.`,
          enforcementNoticeBodyEn: `Surveillance telemetry has established audited non-compliance with ${adminLawTitle}. Remit assessed penalty or submit statutory appeal.`,
          appealNoticeEn: 'You retain the right to submit contestation to the designated judicial body within 30 days.',
          signatureAuthorityEn: `DIRECTOR GENERAL, ${adminRegulatorCode}`
        }
      ],
      regulators: [
        {
          code: adminRegulatorCode.toUpperCase(),
          name: adminRegulatorName,
          sector: 'Statutory Data & Financial Oversight',
          sectors: ['data_privacy', 'finance', 'cybersecurity'],
          enforcementPower: 'full',
          appealBody: 'Appellate Tribunal',
          contactEmail: `contact@${adminRegulatorCode.toLowerCase()}.gov.${adminCountryCode.toLowerCase()}`
        }
      ],
      laws: [
        {
          code: adminLawCode.toUpperCase(),
          title: adminLawTitle,
          regulatorCode: adminRegulatorCode.toUpperCase(),
          language: adminPrimaryLang,
          effectiveFrom: '2024-01-01',
          status: 'active',
          version: 1,
          rules: [
            {
              section: adminRuleSection,
              title: adminRuleTitle,
              violationType: 'STATUTORY_SECURITY_DEFAULT',
              penaltyType: 'range',
              minPenalty: Number(adminMinPenalty),
              maxPenalty: Number(adminMaxPenalty),
              currency: adminCurrency.toUpperCase(),
              severityGrade: 'critical',
              repeatMultiplier: 1.5,
              paymentDeadlineDays: 30,
              appealWindowDays: 30,
              autoEnforceable: true
            }
          ]
        }
      ]
    };

    try {
      const res = await fetch('/api/v1/nre/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackPayload)
      });
      const data = await res.json();
      if (data.success) {
        setAdminSaveMessage(`Country Pack ${adminCountryCode.toUpperCase()} successfully saved to SQLite and activated!`);
        fetchData();
      } else {
        setAdminSaveMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setAdminSaveMessage(`Error: ${err.message}`);
    }
  };

  const filteredCountries = countries.filter(c => {
    const matchesRegion = selectedRegion === 'ALL' || c.region_code === selectedRegion.toLowerCase();
    const matchesSearch = !searchQuery || 
      c.country_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.currency_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && c.is_active === 1) || 
      (statusFilter === 'SUSPENDED' && (c.is_active === 0 || c.is_active === false));

    if (selectedPhase !== 'ALL') {
      const phaseObj = EXPANSION_PHASES.find(p => p.phase === selectedPhase);
      if (phaseObj && !phaseObj.focusCountries.includes(c.country_code)) {
        return false;
      }
    }
    return matchesRegion && matchesSearch && matchesStatus;
  });

  const activeCountriesCount = countries.filter(c => c.is_active === 1).length;
  const suspendedCountriesCount = countries.length - activeCountriesCount;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100 min-h-screen font-sans">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-semibold max-w-md animate-in slide-in-from-top-4 ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500 text-emerald-200' 
            : actionNotice.type === 'warning'
            ? 'bg-amber-950 border-amber-500 text-amber-200'
            : 'bg-rose-950 border-rose-500 text-rose-200'
        }`}>
          {actionNotice.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {actionNotice.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {actionNotice.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <div className="flex-1">{actionNotice.text}</div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1.5">
            <Globe className="w-4 h-4" />
            <span>National Regulatory Enforcement (NRE) Global Hub</span>
            <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 text-[10px]">
              "Country = Data Pack, Not Code"
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Global Jurisdiction & Region Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Sovereign multi-region architecture covering world jurisdictions across Asia, Middle East, Africa, Americas & Europe. 
            Enable/Disable regions, countries, and regulators to control real-time account registration, logins, and legal gate clearances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-right shadow-inner">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Global Coverage</div>
            <div className="text-sm font-bold text-white font-mono flex items-center justify-end gap-2">
              <span className="text-emerald-400">{activeCountriesCount} Active</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{countries.length} Total</span>
            </div>
          </div>
          <button 
            onClick={fetchData}
            title="Refresh Registry"
            className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sovereign Enforcement Link Alert Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-800/60 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Jurisdiction Activation & Auth Guard Integration</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE SYNC
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Toggling a Country or Region <strong className="text-emerald-300">ON</strong> enables registration and login for users in that territory. 
              Toggling <strong className="text-rose-300">OFF</strong> instantly suspends all account registration and active authentication attempts for that jurisdiction.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            Regulators: <strong className="text-cyan-400">{countries.reduce((acc, curr) => acc + (curr.regulator_count || 1), 0)}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            Active Regions: <strong className="text-emerald-400">{regions.filter(r => r.is_active !== 0).length} / {regions.length || 5}</strong>
          </div>
        </div>
      </div>

      {/* Regional Quick Control Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Region-Wise Master Toggles (Cascades to all territorial countries)</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            Click toggle to enable/disable entire region
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {regions.map((reg) => {
            const isRegActive = reg.is_active !== 0 && reg.is_active !== false;
            return (
              <div 
                key={reg.id || reg.region_code}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isRegActive 
                    ? 'bg-slate-950 border-slate-800 shadow-sm' 
                    : 'bg-rose-950/20 border-rose-900/40 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{reg.region_name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Code: {reg.region_code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleRegion(reg.region_code, isRegActive)}
                    title={isRegActive ? "Click to suspend region" : "Click to activate region"}
                    className="cursor-pointer transition-transform active:scale-95"
                  >
                    {isRegActive ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400 hover:text-emerald-300" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">
                    Active Countries: <strong className={isRegActive ? "text-emerald-400" : "text-rose-400"}>{reg.active_countries ?? reg.active_countries_count ?? 0}</strong> / {reg.total_countries || '-'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    isRegActive ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {isRegActive ? 'ENABLED' : 'SUSPENDED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'registry', label: '🌍 World Country Registry', icon: Globe },
          { id: 'regions', label: '🗺️ Regional Pack Matrix', icon: Layers },
          { id: 'regulatory_sync', label: '🌐 Global Regulatory Sync', icon: Zap },
          { id: 'law_mapping', label: '🔗 Regulatory Law Mapping', icon: LinkIcon },
          { id: 'regulator_manager', label: '⚙️ Regional Manager', icon: Settings },
          { id: 'admin_entry', label: '✍️ Add / Upgrade Country Pack', icon: PlusCircle },
          { id: 'jurisdiction', label: '⚖️ Cross-Border Resolver', icon: Scale },
          { id: 'scanner_gate', label: '🛡️ Sovereign Legal Gate', icon: Lock },
          { id: 'fx_ledger', label: '💱 Multi-Currency FX Ledger', icon: DollarSign },
          { id: 'letter_gen', label: '📜 Bilingual Notice Generator', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: REGIONAL PACK MATRIX */}
      {activeTab === 'regions' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Regional Pack Deployment Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Coverage of registered and skeleton country packs across sovereign regions with legal-system breakdown.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-mono font-bold">
                {ALL_NRE_WORLD_COUNTRIES.length} Countries Deployable
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {([
                { key: 'asia', label: 'Asia & Pacific', flag: '🌏' },
                { key: 'middle_east', label: 'Middle East & GCC', flag: '🏜️' },
                { key: 'africa', label: 'Africa', flag: '🌍' },
                { key: 'americas', label: 'Americas', flag: '🌎' },
                { key: 'europe', label: 'Europe', flag: '🌐' },
              ] as const).map((region) => {
                const regionCountries = ALL_NRE_WORLD_COUNTRIES.filter((c) => c.regionCode === region.key);
                const residencyLocked = regionCountries.filter((c) => c.dataResidencyRequired).length;
                const strictGates = regionCountries.filter((c) => c.scannerLegalGate === 'restricted' || c.scannerLegalGate === 'government_mou_required').length;
                return (
                  <div key={region.key} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <span>{region.flag}</span>
                        {region.label}
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-lg">
                        {regionCountries.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-slate-900 border border-slate-800 py-2">
                        <div className="text-sm font-black text-emerald-400">{regionCountries.filter((c) => c.scannerLegalGate !== 'restricted').length}</div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Operable</div>
                      </div>
                      <div className="rounded-lg bg-slate-900 border border-slate-800 py-2">
                        <div className="text-sm font-black text-amber-400">{strictGates}</div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Restricted</div>
                      </div>
                      <div className="rounded-lg bg-slate-900 border border-slate-800 py-2">
                        <div className="text-sm font-black text-sky-400">{residencyLocked}</div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Residency</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {regionCountries.slice(0, 10).map((c) => (
                        <span
                          key={c.countryCode}
                          title={`${c.countryName} | ${c.legalSystem.replace('_', ' ')}`}
                          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-slate-300 cursor-default"
                        >
                          {c.countryCode}
                        </span>
                      ))}
                      {regionCountries.length > 10 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-500">
                          +{regionCountries.length - 10}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: GLOBAL REGULATORY SYNC */}
      {activeTab === 'regulatory_sync' && (
        <GlobalRegulatorySync />
      )}

      {/* TAB: REGULATORY LAW MAPPING */}
      {activeTab === 'law_mapping' && (
        <RegulatoryLawManager />
      )}

      {/* TAB: REGIONAL REGULATOR MANAGER */}
      {activeTab === 'regulator_manager' && (
        <RegionalRegulatorManager 
          onNotify={(text, type) => showNotification(text, type)} 
        />
      )}

      {/* TAB 1: REGISTRY & DETAIL DRAWER */}
      {activeTab === 'registry' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Region pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {['ALL', 'ASIA', 'MIDDLE_EAST', 'AFRICA', 'AMERICAS', 'EUROPE'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedRegion === reg
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {reg.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Status & Search Filter */}
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                      statusFilter === st ? 'bg-indigo-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search country, code, currency..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>Showing <strong className="text-white">{filteredCountries.length}</strong> countries</span>
            <span>Active: <strong className="text-emerald-400">{filteredCountries.filter(c => c.is_active === 1).length}</strong> | Suspended: <strong className="text-rose-400">{filteredCountries.filter(c => c.is_active !== 1).length}</strong></span>
          </div>

          {/* Country Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCountries.map((c) => {
              const isTier1 = Object.keys(TIER1_COUNTRY_PACKS).includes(c.country_code);
              const isCountryActive = c.is_active === 1;
              const isRegionActive = c.region_is_active !== 0;

              return (
                <div 
                  key={c.id || c.country_code} 
                  className={`border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between relative overflow-hidden ${
                    isCountryActive && isRegionActive
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' 
                      : 'bg-slate-950 border-rose-900/40 opacity-90'
                  }`}
                >
                  {!isCountryActive && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500/80" />
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 flex items-center gap-1.5">
                        <span>{c.country_code}</span>
                        {isTier1 && <span title="Tier 1 Complete Pack"><Award className="w-3 h-3 text-amber-400" /></span>}
                      </span>
                      
                      {/* Live Toggle Switch */}
                      <button
                        onClick={(e) => handleToggleCountry(c.country_code, isCountryActive, e)}
                        title={isCountryActive ? "Click to disable country" : "Click to enable country"}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        {isCountryActive ? (
                          <ToggleRight className="w-7 h-7 text-emerald-400 hover:text-emerald-300" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-rose-500 hover:text-rose-400" />
                        )}
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1 flex items-center justify-between">
                      <span>{c.country_name}</span>
                    </h4>
                    
                    <div className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                      <span>Currency: <strong className="text-slate-200">{c.currency_code}</strong></span>
                      <span>•</span>
                      <span className="capitalize">{c.legal_system?.replace('_', ' ')}</span>
                    </div>

                    {/* Activation & Auth Status Badge */}
                    <div className={`mb-3 p-2 rounded-xl text-[11px] font-mono flex items-center justify-between border ${
                      isCountryActive && isRegionActive
                        ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isCountryActive && isRegionActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{isCountryActive && isRegionActive ? 'Accounts Active' : 'Auth Locked'}</span>
                      </div>
                      <span className="text-[10px] font-bold">
                        {isCountryActive && isRegionActive ? 'LOGIN ALLOWED' : 'SUSPENDED'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <div className="flex justify-between">
                        <span>Regulators:</span>
                        <span className="text-slate-200 font-bold">{c.active_regulator_count ?? c.regulator_count ?? 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Enacted Laws:</span>
                        <span className="text-slate-200 font-bold">{c.law_count || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Legal Gate:</span>
                        <span className={c.scanner_legal_gate === 'government_mou_required' ? 'text-amber-400' : 'text-cyan-400'}>
                          {c.scanner_legal_gate || 'standard'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono uppercase">
                      {c.region_code || 'ASIA'}
                    </span>
                    <button
                      onClick={() => loadCountryDetail(c.country_code)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-medium flex items-center gap-1 cursor-pointer bg-slate-800/80 px-2.5 py-1 rounded-lg hover:bg-slate-800"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Regulators
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Country Pack Inspection Drawer / Modal */}
          {selectedCountryDetail && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold font-mono px-3 py-1 rounded bg-indigo-900/60 border border-indigo-700 text-indigo-300">
                      {selectedCountryDetail.country_code}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{selectedCountryDetail.country_name} Country Pack</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border ${
                          selectedCountryDetail.is_active === 1 
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                            : 'bg-rose-950 text-rose-400 border-rose-800'
                        }`}>
                          {selectedCountryDetail.is_active === 1 ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>Region: {selectedCountryDetail.region_code}</span>
                        <span>•</span>
                        <span>Currency: {selectedCountryDetail.currency_code}</span>
                        <span>•</span>
                        <span>Language: {selectedCountryDetail.primary_language}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCountryDetail(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Country-Level Activation Switch in Modal */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Jurisdiction Authorization Status</h4>
                    <p className="text-xs text-slate-400">Controls registration and login eligibility for all entities in {selectedCountryDetail.country_name}.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold ${selectedCountryDetail.is_active === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedCountryDetail.is_active === 1 ? 'JURISDICTION ACTIVE' : 'JURISDICTION SUSPENDED'}
                    </span>
                    <button
                      onClick={() => handleToggleCountry(selectedCountryDetail.country_code, selectedCountryDetail.is_active === 1)}
                      className="cursor-pointer"
                    >
                      {selectedCountryDetail.is_active === 1 ? (
                        <ToggleRight className="w-9 h-9 text-emerald-400 hover:text-emerald-300" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-rose-500 hover:text-rose-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Regulators Section with Individual Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> Country Regulators & Agencies ({selectedCountryDetail.regulators?.length || 0})
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Toggle individual regulatory authority</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCountryDetail.regulators?.map((r: any, idx: number) => {
                      const isRegActive = r.is_active !== 0 && r.is_active !== false;
                      return (
                        <div key={idx} className={`p-3.5 rounded-xl border space-y-2 text-xs transition-colors ${
                          isRegActive ? 'bg-slate-950 border-slate-800' : 'bg-rose-950/20 border-rose-900/40'
                        }`}>
                          <div className="font-bold text-white flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <span>{r.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{r.regulator_code}</span>
                            </span>
                            <button
                              onClick={() => handleToggleRegulator(r.id, isRegActive, r.regulator_code)}
                              title={isRegActive ? "Deactivate regulator" : "Activate regulator"}
                              className="cursor-pointer"
                            >
                              {isRegActive ? (
                                <ToggleRight className="w-6 h-6 text-emerald-400" />
                              ) : (
                                <ToggleLeft className="w-6 h-6 text-slate-600" />
                              )}
                            </button>
                          </div>
                          {r.name_local && <div className="text-[11px] text-slate-400">{r.name_local}</div>}
                          <div className="text-[11px] text-indigo-300">Sector: {r.sectors || r.sector || 'Statutory Oversight'}</div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                            <span>Status: <strong className={isRegActive ? "text-emerald-400" : "text-rose-400"}>{isRegActive ? 'ACTIVE' : 'DEACTIVATED'}</strong></span>
                            {r.appeal_body && <span>Appeals: {r.appeal_body}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Laws & Section Penalties */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-2">
                    <Scale className="w-4 h-4" /> Statutory Laws & Penalty Rules ({selectedCountryDetail.laws?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {selectedCountryDetail.laws?.map((l: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-sm text-white">{l.law_name}</div>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300">
                            {l.law_code}
                          </span>
                        </div>
                        {l.law_name_local && <div className="text-xs text-slate-400">{l.law_name_local}</div>}
                        
                        <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/80">
                          {l.rules?.map((rule: any, rIdx: number) => (
                            <div key={rIdx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-bold text-cyan-400 mr-2">{rule.section_code}:</span>
                                <span className="text-slate-200">{rule.section_text}</span>
                                {rule.imprisonment_note && (
                                   <div className="text-[11px] text-rose-400 mt-0.5 font-mono">⚠️ {rule.imprisonment_note}</div>
                                )}
                              </div>
                              <div className="text-right whitespace-nowrap font-mono text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                                {rule.penalty_currency} {rule.penalty_min?.toLocaleString()} – {rule.penalty_max?.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setLetterCountry(selectedCountryDetail.country_code);
                      setActiveTab('letter_gen');
                      setSelectedCountryDetail(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Generate Notice for this Country
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DATA ENTRY ADMIN FORM */}
      {activeTab === 'admin_entry' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>Sovereign Country Pack Ingestion (Admin Data Entry)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add new territorial packs or upgrade existing country manifests. Data is written directly to SQLite tables (<code className="text-indigo-300">nre_countries</code>, <code className="text-indigo-300">nre_regulators</code>, <code className="text-indigo-300">nre_laws</code>).
            </p>
          </div>

          {adminSaveMessage && (
            <div className={`p-4 rounded-xl text-xs font-mono ${
              adminSaveMessage.includes('Error') 
                ? 'bg-rose-950 border border-rose-800 text-rose-300' 
                : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
            }`}>
              {adminSaveMessage}
            </div>
          )}

          <form onSubmit={handleAdminPackSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Country Code (ISO 2-letter)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={adminCountryCode}
                  onChange={(e) => setAdminCountryCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Country Name</label>
                <input
                  type="text"
                  value={adminCountryName}
                  onChange={(e) => setAdminCountryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Region</label>
                <select
                  value={adminRegion}
                  onChange={(e: any) => setAdminRegion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="asia">Asia & Pacific</option>
                  <option value="middle_east">Middle East & GCC</option>
                  <option value="africa">Africa</option>
                  <option value="americas">Americas</option>
                  <option value="europe">Europe</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Statutory Currency</label>
                <input
                  type="text"
                  maxLength={3}
                  value={adminCurrency}
                  onChange={(e) => setAdminCurrency(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Primary Language Code</label>
                <input
                  type="text"
                  value={adminPrimaryLang}
                  onChange={(e) => setAdminPrimaryLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  placeholder="en, ar, bn, de..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Legal System</label>
                <select
                  value={adminLegalSystem}
                  onChange={(e: any) => setAdminLegalSystem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="common_law">Common Law</option>
                  <option value="civil_law">Civil Law</option>
                  <option value="sharia_based">Sharia-Based</option>
                  <option value="mixed">Mixed Legal System</option>
                </select>
              </div>
            </div>

            {/* Regulator & Law Entry */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-mono uppercase text-indigo-400 font-bold">Primary Enforcing Regulator</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Regulator Acronym / Code</label>
                  <input
                    type="text"
                    value={adminRegulatorCode}
                    onChange={(e) => setAdminRegulatorCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    placeholder="e.g. MAS, BTRC, BaFin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Full Regulator Authority Name</label>
                  <input
                    type="text"
                    value={adminRegulatorName}
                    onChange={(e) => setAdminRegulatorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="e.g. Monetary Authority of Singapore"
                    required
                  />
                </div>
              </div>

              <h4 className="text-xs font-mono uppercase text-indigo-400 font-bold pt-2">Primary Statutory Law & Rule</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Law Code / Act Number</label>
                  <input
                    type="text"
                    value={adminLawCode}
                    onChange={(e) => setAdminLawCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    placeholder="e.g. PDPA_2012"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Full Law Title</label>
                  <input
                    type="text"
                    value={adminLawTitle}
                    onChange={(e) => setAdminLawTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="e.g. Personal Data Protection Act 2012"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Rule Section</label>
                  <input
                    type="text"
                    value={adminRuleSection}
                    onChange={(e) => setAdminRuleSection(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    placeholder="e.g. Section 24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Min Statutory Penalty ({adminCurrency})</label>
                  <input
                    type="number"
                    value={adminMinPenalty}
                    onChange={(e) => setAdminMinPenalty(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Max Statutory Penalty ({adminCurrency})</label>
                  <input
                    type="number"
                    value={adminMaxPenalty}
                    onChange={(e) => setAdminMaxPenalty(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/40"
              >
                <PlusCircle className="w-4 h-4" /> Save & Activate Country Pack
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: JURISDICTION RESOLVER */}
      {activeTab === 'jurisdiction' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              <span>Cross-Border Multi-Country Legal Jurisdiction Resolver</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Resolves regulatory conflicts and identifies applicable national laws when an entity operates across multiple sovereign borders.
            </p>
          </div>

          <form onSubmit={handleResolveJurisdiction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Entity Domain</label>
              <input
                type="text"
                value={resolveDomain}
                onChange={(e) => setResolveDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Market Country Codes</label>
              <input
                type="text"
                value={targetMarkets}
                onChange={(e) => setTargetMarkets(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                placeholder="AE, IN, BD, SG"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={resolving}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer h-[38px]"
              >
                {resolving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Resolve Conflicts</span>
              </button>
            </div>
          </form>

          {resolution && (
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-slate-400">Primary Governing Law:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {resolution.resolution?.governingLaw || 'Multi-Jurisdictional Hybrid Law'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">Subject Regulators</h4>
                  <div className="space-y-1">
                    {resolution.resolution?.enforcingBodies?.map((b: string, i: number) => (
                      <div key={i} className="text-xs text-indigo-300 font-mono bg-slate-900 p-2 rounded border border-slate-800">
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">Statutory Advice</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                    {resolution.resolution?.recommendation || 'Maintain separate regional data residency nodes and obtain local regulatory clearance in each target territory.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SOVEREIGN SCANNER LEGAL GATE */}
      {activeTab === 'scanner_gate' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span>Sovereign Legal Gate Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Test automated inspection permissions against national sovereignty laws and MOU statutory requirements before executing active network scans.
            </p>
          </div>

          <form onSubmit={handleTestScan} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Country</label>
              <select
                value={testCountry}
                onChange={(e) => setTestCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
              >
                {countries.map(c => (
                  <option key={c.country_code} value={c.country_code}>
                    {c.country_code} — {c.country_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Endpoint URL</label>
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={scanning}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer h-[38px]"
              >
                {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                <span>Verify & Scan</span>
              </button>
            </div>
          </form>

          {scanResult && (
            <div className={`p-5 rounded-xl border space-y-3 ${
              scanResult.success 
                ? 'bg-slate-950 border-emerald-800/80 text-emerald-200' 
                : 'bg-slate-950 border-rose-800/80 text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-2">
                  {scanResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                  <span>{scanResult.message || scanResult.error}</span>
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  Scan ID: {scanResult.scanId || 'BLOCKED'}
                </span>
              </div>
              {scanResult.gateCheck && (
                <div className="text-xs font-mono bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                  <div>Legal Gate Clearance: <strong className="text-emerald-400">PASSED</strong></div>
                  <div>Gate Type: {scanResult.gateCheck.gateType}</div>
                  <div>Statutory Basis: {scanResult.gateCheck.statutoryBasis}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FX CONVERSION LEDGER */}
      {activeTab === 'fx_ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Multi-Currency Central Bank FX & Exposure Ledger</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time conversion of national statutory penalties (BDT, AED, SAR, NGN, INR, EUR) into unified USD reporting ledger.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Consolidated Exposure</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                ${(fxExposure.totalUsdExposure || 1845000).toLocaleString()} USD
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Case Ref</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Local Statutory Amount</th>
                  <th className="p-3">FX Rate (vs USD)</th>
                  <th className="p-3 text-right">Unified Exposure (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {fxExposure.exposures?.map((ex: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-950/60">
                    <td className="p-3 text-indigo-300 font-bold">{ex.caseNumber}</td>
                    <td className="p-3">{ex.countryName} ({ex.currency})</td>
                    <td className="p-3 text-white font-sans">{ex.entityName}</td>
                    <td className="p-3 text-slate-200">{ex.currency} {ex.localAmount?.toLocaleString()}</td>
                    <td className="p-3 text-slate-400">1 {ex.currency} = ${ex.exchangeRate}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">${ex.usdAmount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: BILINGUAL LETTER GENERATOR */}
      {activeTab === 'letter_gen' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Bilingual Official Statutory Regulatory Notice Generator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Generates court-admissible regulatory notices in both English and national official language (Bengali, Arabic, German, French, etc.).
            </p>
          </div>

          <form onSubmit={handleGenerateLetter} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Select Jurisdiction</label>
              <select
                value={letterCountry}
                onChange={(e) => setLetterCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
              >
                {countries.map(c => (
                  <option key={c.country_code} value={c.country_code}>
                    {c.country_code} — {c.country_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Corporate Entity Name</label>
              <input
                type="text"
                value={letterEntity}
                onChange={(e) => setLetterEntity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Statutory Case Number</label>
              <input
                type="text"
                value={letterCaseNo}
                onChange={(e) => setLetterCaseNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Assessed Statutory Penalty</label>
              <input
                type="number"
                value={letterPenalty}
                onChange={(e) => setLetterPenalty(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                required
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={generatingLetter}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer h-[38px]"
              >
                {generatingLetter ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Generate Official Bilingual Notice</span>
              </button>
            </div>
          </form>

          {generatedLetter && (
            <div className="p-6 bg-slate-950 border border-slate-700 rounded-2xl space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">OFFICIAL REGULATORY NOTICE</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{generatedLetter.title}</h3>
                  <div className="text-xs font-mono text-slate-400">Reference: {generatedLetter.caseNumber}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Assessed Penalty</div>
                  <div className="text-lg font-bold text-rose-400">
                    {generatedLetter.currency} {generatedLetter.penaltyAmount?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* English Column */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-300">
                  <div className="font-mono text-indigo-400 font-bold uppercase border-b border-slate-800 pb-1">
                    English Official Transcript
                  </div>
                  <div className="font-bold text-white">{generatedLetter.salutationEn}</div>
                  <p className="leading-relaxed">{generatedLetter.statutoryPreambleEn}</p>
                  <p className="leading-relaxed">{generatedLetter.enforcementNoticeBodyEn}</p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-amber-300">
                    ⚖️ {generatedLetter.appealNoticeEn}
                  </div>
                  <div className="pt-2 font-mono text-[11px] text-slate-400">
                    {generatedLetter.signatureAuthorityEn}
                  </div>
                </div>

                {/* Local Language Column */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs text-slate-300">
                  <div className="font-mono text-cyan-400 font-bold uppercase border-b border-slate-800 pb-1">
                    National Language Official Transcript
                  </div>
                  <div className="font-bold text-white">{generatedLetter.salutationLocal || generatedLetter.salutationEn}</div>
                  <p className="leading-relaxed">{generatedLetter.statutoryPreambleLocal || generatedLetter.statutoryPreambleEn}</p>
                  <p className="leading-relaxed">{generatedLetter.enforcementNoticeBodyLocal || generatedLetter.enforcementNoticeBodyEn}</p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-amber-300">
                    ⚖️ {generatedLetter.appealNoticeLocal || generatedLetter.appealNoticeEn}
                  </div>
                  <div className="pt-2 font-mono text-[11px] text-slate-400">
                    {generatedLetter.signatureAuthorityLocal || generatedLetter.signatureAuthorityEn}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalNreCountryPackPortal;
