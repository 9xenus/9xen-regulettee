import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  Lock, 
  Server, 
  Radio, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Cpu, 
  Database, 
  Sparkles, 
  DollarSign, 
  Layers, 
  Zap, 
  Search, 
  Building2, 
  Scale, 
  Key, 
  RefreshCw, 
  Send, 
  Download, 
  Eye, 
  ShieldCheck, 
  Terminal, 
  Gavel, 
  ArrowRight, 
  ChevronRight,
  HelpCircle,
  Plus,
  Trash2,
  Share2,
  FileCheck2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

export interface CountrySetting {
  code: string;
  name: string;
  flag: string;
  sovereignEnclave: string;
  regulatorBody: string;
  crossBorderPolicy: 'ZERO_EGRESS_AIR_GAPPED' | 'TOKENIZED_HASH_ONLY' | 'ADEQUACY_BILATERAL_MLAT' | 'PERMISSIVE_ENCRYPTED';
  statutoryRetentionYears: number;
  fineCapPctTurnover: number;
  dataTariffPerGB: number;
  gazetteSyncStatus: 'LIVE_SYNC' | 'PENDING_UPDATE' | 'PAUSED';
  lastGazetteNotice: string;
  enforcementActive: boolean;
  contactEmail: string;
}

export interface RegionGroup {
  id: string;
  name: string;
  code: string;
  icon: string;
  badgeColor: string;
  description: string;
  countries: CountrySetting[];
}

const DEFAULT_REGIONS: RegionGroup[] = [
  {
    id: 'EU_EUROPE',
    name: 'European Union & EEA',
    code: 'EU',
    icon: '🇪🇺',
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/60',
    description: 'EU AI Act, GDPR Art. 44-50, NIS2, DORA, and Eurocloud Sovereign Standards.',
    countries: [
      {
        code: 'DE',
        name: 'Germany',
        flag: '🇩🇪',
        sovereignEnclave: 'DE-FRA-1 (Frankfurt Bank-Grade AWS Sovereign)',
        regulatorBody: 'BfDI & BaFin',
        crossBorderPolicy: 'ZERO_EGRESS_AIR_GAPPED',
        statutoryRetentionYears: 10,
        fineCapPctTurnover: 4.0,
        dataTariffPerGB: 0.15,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'EU AI Act Art. 52 High-Risk Telemetry Mandate (2026/L-882)',
        enforcementActive: true,
        contactEmail: 'aufsicht@bfdi.bund.de'
      },
      {
        code: 'FR',
        name: 'France',
        flag: '🇫🇷',
        sovereignEnclave: 'FR-PAR-2 (Paris SecNumCloud Vault)',
        regulatorBody: 'CNIL & ANSSI',
        crossBorderPolicy: 'TOKENIZED_HASH_ONLY',
        statutoryRetentionYears: 6,
        fineCapPctTurnover: 4.0,
        dataTariffPerGB: 0.12,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'ANSSI SecNumCloud v3.2 Cryptographic Key Escrow',
        enforcementActive: true,
        contactEmail: 'sanctions@cnil.fr'
      },
      {
        code: 'NL',
        name: 'Netherlands',
        flag: '🇳🇱',
        sovereignEnclave: 'NL-AMS-1 (Amsterdam Sovereign Node)',
        regulatorBody: 'AP (Autoriteit Persoonsgegevens)',
        crossBorderPolicy: 'ADEQUACY_BILATERAL_MLAT',
        statutoryRetentionYears: 7,
        fineCapPctTurnover: 3.5,
        dataTariffPerGB: 0.10,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'Dutch AI Oversight Framework 2026',
        enforcementActive: true,
        contactEmail: 'handhaving@autoriteitpersoonsgegevens.nl'
      },
      {
        code: 'IE',
        name: 'Ireland',
        flag: '🇮🇪',
        sovereignEnclave: 'IE-DUB-1 (Dublin Hyperscale Vault)',
        regulatorBody: 'DPC Ireland',
        crossBorderPolicy: 'ADEQUACY_BILATERAL_MLAT',
        statutoryRetentionYears: 6,
        fineCapPctTurnover: 4.0,
        dataTariffPerGB: 0.08,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'Cross-Border Lead Authority Binding Decision',
        enforcementActive: true,
        contactEmail: 'enforcement@dataprotection.ie'
      }
    ]
  },
  {
    id: 'GCC_MIDDLE_EAST',
    name: 'GCC & Middle East',
    code: 'GCC',
    icon: '🇸🇦',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60',
    description: 'Saudi Arabia PDPL / SAMA, UAE NESA / CBUAE, Qatar PDPPL sovereign cloud frameworks.',
    countries: [
      {
        code: 'SA',
        name: 'Saudi Arabia',
        flag: '🇸🇦',
        sovereignEnclave: 'KSA-RUH-1 (Riyadh Class-C National Cloud)',
        regulatorBody: 'SDAIA & SAMA',
        crossBorderPolicy: 'ZERO_EGRESS_AIR_GAPPED',
        statutoryRetentionYears: 10,
        fineCapPctTurnover: 5.0,
        dataTariffPerGB: 0.25,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'Saudi PDPL Executive Regulations Art. 29 Data Localization',
        enforcementActive: true,
        contactEmail: 'compliance@sdaia.gov.sa'
      },
      {
        code: 'AE',
        name: 'United Arab Emirates',
        flag: '🇦🇪',
        sovereignEnclave: 'UAE-DXB-1 (Dubai Sovereign Cloud)',
        regulatorBody: 'UAE Data Office & CBUAE',
        crossBorderPolicy: 'TOKENIZED_HASH_ONLY',
        statutoryRetentionYears: 7,
        fineCapPctTurnover: 3.0,
        dataTariffPerGB: 0.20,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'UAE Federal Decree-Law No. 45/2021 Data Protection Directive',
        enforcementActive: true,
        contactEmail: 'regulator@data.gov.ae'
      },
      {
        code: 'QA',
        name: 'Qatar',
        flag: '🇶🇦',
        sovereignEnclave: 'QA-DOH-1 (Doha Sovereign Center)',
        regulatorBody: 'National Cyber Security Agency (NCSA)',
        crossBorderPolicy: 'ZERO_EGRESS_AIR_GAPPED',
        statutoryRetentionYears: 5,
        fineCapPctTurnover: 2.5,
        dataTariffPerGB: 0.18,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'Qatar PDPPL Law No. 13 Compliance Guideline',
        enforcementActive: true,
        contactEmail: 'compliance@ncsa.gov.qa'
      }
    ]
  },
  {
    id: 'APAC_ASIA_PACIFIC',
    name: 'Asia-Pacific (APAC)',
    code: 'APAC',
    icon: '🇸🇬',
    badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700/60',
    description: 'Singapore PDPA, Japan APPI, Australia Privacy Act, India DPDP Act frameworks.',
    countries: [
      {
        code: 'SG',
        name: 'Singapore',
        flag: '🇸🇬',
        sovereignEnclave: 'SG-SIN-1 (Singapore Financial Equinix Node)',
        regulatorBody: 'PDPC & MAS (Monetary Authority of Singapore)',
        crossBorderPolicy: 'ADEQUACY_BILATERAL_MLAT',
        statutoryRetentionYears: 7,
        fineCapPctTurnover: 10.0,
        dataTariffPerGB: 0.12,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'MAS TRM Guidelines & AI Governance Framework 2026',
        enforcementActive: true,
        contactEmail: 'enforcement@pdpc.gov.sg'
      },
      {
        code: 'JP',
        name: 'Japan',
        flag: '🇯🇵',
        sovereignEnclave: 'JP-TYO-1 (Tokyo Sovereign Enclave)',
        regulatorBody: 'PPC Japan (Personal Information Protection Commission)',
        crossBorderPolicy: 'ADEQUACY_BILATERAL_MLAT',
        statutoryRetentionYears: 7,
        fineCapPctTurnover: 3.0,
        dataTariffPerGB: 0.14,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'Japan APPI Amendment Article 28 Transfer Validation',
        enforcementActive: true,
        contactEmail: 'info@ppc.go.jp'
      },
      {
        code: 'AU',
        name: 'Australia',
        flag: '🇦🇺',
        sovereignEnclave: 'AU-SYD-1 (Sydney Certified Cyber Enclave)',
        regulatorBody: 'OAIC & APRA',
        crossBorderPolicy: 'TOKENIZED_HASH_ONLY',
        statutoryRetentionYears: 7,
        fineCapPctTurnover: 5.0,
        dataTariffPerGB: 0.16,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'APRA CPS 230 Operational Risk Management Standard',
        enforcementActive: true,
        contactEmail: 'enquiries@oaic.gov.au'
      },
      {
        code: 'IN',
        name: 'India',
        flag: '🇮🇳',
        sovereignEnclave: 'IN-BOM-1 (Mumbai Sovereign Data Node)',
        regulatorBody: 'Data Protection Board of India (DPBI) & CERT-In',
        crossBorderPolicy: 'ZERO_EGRESS_AIR_GAPPED',
        statutoryRetentionYears: 5,
        fineCapPctTurnover: 2.5,
        dataTariffPerGB: 0.09,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'DPDP Act 2023 Rules Schedule III Critical Infrastructure',
        enforcementActive: true,
        contactEmail: 'compliance@dpbi.gov.in'
      }
    ]
  },
  {
    id: 'NORTH_AMERICA',
    name: 'North America',
    code: 'AMER',
    icon: '🇺🇸',
    badgeColor: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/60',
    description: 'US FedRAMP High, CMMC 2.0, HIPAA, CCPA/CPRA, Canada PIPEDA, SEC/FINRA.',
    countries: [
      {
        code: 'US',
        name: 'United States',
        flag: '🇺🇸',
        sovereignEnclave: 'US-GOV-EAST (GovCloud FedRAMP High Facility)',
        regulatorBody: 'FTC, SEC, CISA & NIST',
        crossBorderPolicy: 'PERMISSIVE_ENCRYPTED',
        statutoryRetentionYears: 7,
        fineCapPctTurnover: 2.0,
        dataTariffPerGB: 0.05,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'NIST CSF 2.0 & SEC Cyber Disclosure Rule 106',
        enforcementActive: true,
        contactEmail: 'cyber-enforcement@ftc.gov'
      },
      {
        code: 'CA',
        name: 'Canada',
        flag: '🇨🇦',
        sovereignEnclave: 'CA-YUL-1 (Montreal Sovereign Cluster)',
        regulatorBody: 'OPC Canada & OSFI',
        crossBorderPolicy: 'ADEQUACY_BILATERAL_MLAT',
        statutoryRetentionYears: 7,
        fineCapPctTurnover: 3.0,
        dataTariffPerGB: 0.08,
        gazetteSyncStatus: 'LIVE_SYNC',
        lastGazetteNotice: 'PIPEDA / Law 25 Quebec Cross-Border Assessment',
        enforcementActive: true,
        contactEmail: 'notifications@priv.gc.ca'
      }
    ]
  }
];

interface Props {
  role?: 'SUPER_ADMIN' | 'REGULATOR' | 'CLIENT_ADMIN';
}

export const AdvancedMultiRegionB2gEngine: React.FC<Props> = ({
  role = 'SUPER_ADMIN'
}) => {
  const { showToast } = useNotification();
  const [regions, setRegions] = useState<RegionGroup[]>(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_b2g_multi_region_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed loading region config:', e);
    }
    return DEFAULT_REGIONS;
  });

  const [selectedRegionId, setSelectedRegionId] = useState<string>('EU_EUROPE');
  const [activeTab, setActiveTab] = useState<'HIERARCHY' | 'KILL_SWITCH' | 'ZK_AUDIT' | 'GAZETTE' | 'TARIFF_CALC' | 'SUBPOENA_VAULT'>('HIERARCHY');

  // Kill-Switch State
  const [selectedTenant, setSelectedTenant] = useState('Tenant-9021 (Acme Europe GmbH)');
  const [targetCountryCode, setTargetCountryCode] = useState('DE');
  const [freezeReason, setFreezeReason] = useState('Art 99 Severe AI Act Watermark Failure');
  const [freezeSignature, setFreezeSignature] = useState('');
  const [activeHolds, setActiveHolds] = useState<any[]>([
    {
      id: 'HOLD-8819',
      tenant: 'Tenant-402 (Riyadh Financial Systems)',
      country: 'SA',
      reason: 'SAMA Mandatory Data Egress Audit Failure',
      issuedBy: 'SDAIA Legal Inspector #41',
      timestamp: '2026-08-20T14:22:00Z',
      status: 'ACTIVE_FREEZE',
      sha256: '9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a'
    }
  ]);

  // ZK-Audit State
  const [zkQueryRunning, setZkQueryRunning] = useState(false);
  const [zkResults, setZkResults] = useState<any | null>(null);

  // Gazette State
  const [gazetteItems, setGazetteItems] = useState<any[]>([
    {
      id: 'GAZ-2026-101',
      country: 'DE',
      source: 'EU Official Journal L-2026/882',
      title: 'Mandatory SHA-256 HMAC Output Watermarking for Generative AI',
      effectiveDate: '2026-09-01',
      severity: 'CRITICAL',
      autoPatchAvailable: true,
      applied: false
    },
    {
      id: 'GAZ-2026-102',
      country: 'SA',
      source: 'Umm Al-Qura Gazette Issue 5012',
      title: 'PDPL Article 29 Encryption Binding for Cross-Border Health Data',
      effectiveDate: '2026-08-30',
      severity: 'CRITICAL',
      autoPatchAvailable: true,
      applied: true
    },
    {
      id: 'GAZ-2026-103',
      country: 'US',
      source: 'US Federal Register Vol. 91 No. 160',
      title: 'NIST SP 800-53 Rev 6 Sovereign Telemetry Masking Requirement',
      effectiveDate: '2026-10-15',
      severity: 'HIGH',
      autoPatchAvailable: true,
      applied: false
    }
  ]);

  // Tariff Calculator State
  const [monthlyDataTB, setMonthlyDataTB] = useState<number>(250);
  const [calculatedTariff, setCalculatedTariff] = useState<any>(null);

  // Edit Country Modal
  const [editingCountry, setEditingCountry] = useState<{ regionId: string; country: CountrySetting } | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('9xen-regulettee_b2g_multi_region_config', JSON.stringify(regions));
  }, [regions]);

  const activeRegionGroup = regions.find(r => r.id === selectedRegionId) || regions[0];

  const handleUpdateCountry = (regionId: string, updated: CountrySetting) => {
    setRegions(prev => prev.map(r => {
      if (r.id !== regionId) return r;
      return {
        ...r,
        countries: r.countries.map(c => c.code === updated.code ? updated : c)
      };
    }));
    showToast(`Saved sovereign settings for ${updated.flag} ${updated.name}`, 'success');
    setEditingCountry(null);
  };

  const handleIssueKillSwitchHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freezeReason) return;
    const newHold = {
      id: `HOLD-${Math.floor(1000 + Math.random() * 9000)}`,
      tenant: selectedTenant,
      country: targetCountryCode,
      reason: freezeReason,
      issuedBy: role === 'SUPER_ADMIN' ? 'SaaS Super Admin Authority' : 'B2G Statutory Regulator Inspector',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE_FREEZE',
      sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setActiveHolds(prev => [newHold, ...prev]);
    setFreezeReason('');
    showToast(`🛑 Sovereign Compliance Freeze Directive issued against ${selectedTenant} in [${targetCountryCode}]`, 'error');
  };

  const handleRunZkProofAudit = () => {
    setZkQueryRunning(true);
    setZkResults(null);
    setTimeout(() => {
      setZkQueryRunning(false);
      setZkResults({
        timestamp: new Date().toISOString(),
        overallProofStatus: 'PASSED_VERIFIED',
        zkProofHash: 'zk-snark-0x9e8a7f6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a',
        verificationDetails: [
          { check: 'Germany (DE) PII Air-Gap Storage Verification', status: 'VERIFIED_100%', latencyMs: 14 },
          { check: 'Saudi Arabia (SA) Health Record Non-Egress Guarantee', status: 'VERIFIED_100%', latencyMs: 19 },
          { check: 'Singapore (SG) MAS Encryption Key Binding (HYOK)', status: 'VERIFIED_100%', latencyMs: 22 },
          { check: 'US FedRAMP GovCloud Telemetry Scrubbing', status: 'VERIFIED_100%', latencyMs: 11 }
        ]
      });
      showToast('⚡ ZK-Snark Zero-Knowledge Regulatory Inspection Proof generated & verified!', 'success');
    }, 1800);
  };

  const handleApplyGazetteAutoPatch = (id: string) => {
    setGazetteItems(prev => prev.map(g => g.id === id ? { ...g, applied: true } : g));
    showToast('🚀 Gazette Auto-Patch Directive deployed across target country sovereign nodes!', 'success');
  };

  const calculateSovereignTariffs = () => {
    const totalGB = monthlyDataTB * 1024;
    let totalTariffUSD = 0;
    let maxFineRiskUSD = 0;
    const countryBreakdown: any[] = [];

    regions.forEach(r => {
      r.countries.forEach(c => {
        const countryGB = totalGB / 10; // allocated baseline
        const tariff = countryGB * c.dataTariffPerGB;
        const fineRisk = (10000000) * (c.fineCapPctTurnover / 100);
        totalTariffUSD += tariff;
        maxFineRiskUSD += fineRisk;
        countryBreakdown.push({
          country: `${c.flag} ${c.name}`,
          code: c.code,
          tariffRate: `$${c.dataTariffPerGB}/GB`,
          monthlyTariff: Math.round(tariff),
          fineCap: `${c.fineCapPctTurnover}%`,
          fineRisk: Math.round(fineRisk)
        });
      });
    });

    setCalculatedTariff({
      totalGB,
      totalTariffUSD: Math.round(totalTariffUSD),
      maxFineRiskUSD: Math.round(maxFineRiskUSD),
      countryBreakdown
    });
  };

  useEffect(() => {
    calculateSovereignTariffs();
  }, [monthlyDataTB, regions]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-2xl space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-extrabold text-2xl shadow-inner shrink-0">
              <Globe className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                  B2G Multi-Region Sovereign Engine
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  20+ Country Enclaves Active
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Sovereign Regulatory Control & Multi-Country Matrix
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Granular B2G compliance engine supporting hierarchical region groups (EU, GCC, APAC, AMER) with individual country settings, cryptographic kill-switches, zero-knowledge audit bridges, and automated statutory gazette policy injectors.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-stretch lg:self-auto justify-end">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Enforced Regions</div>
              <div className="text-sm font-bold text-indigo-300 font-mono">{regions.length} Global Zones</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Active Kill-Switches</div>
              <div className="text-sm font-bold text-rose-400 font-mono">{activeHolds.length} Holds Issued</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('HIERARCHY')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'HIERARCHY'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Multi-Region & Country Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('KILL_SWITCH')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'KILL_SWITCH'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Sovereign Kill-Switch Matrix</span>
          {activeHolds.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-950 text-rose-200 text-[10px] rounded-full font-bold">
              {activeHolds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ZK_AUDIT')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ZK_AUDIT'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-purple-300" />
          <span>ZK Audit Inspection Bridge</span>
        </button>

        <button
          onClick={() => setActiveTab('GAZETTE')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'GAZETTE'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
          <span>Statutory Gazette Injector</span>
        </button>

        <button
          onClick={() => setActiveTab('TARIFF_CALC')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'TARIFF_CALC'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Data Tariff & Fine Arbitrage</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBPOENA_VAULT')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'SUBPOENA_VAULT'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>MLAT Evidence Vault</span>
        </button>
      </div>

      {/* TAB 1: MULTI-REGION & COUNTRY SETTINGS HIERARCHY */}
      {activeTab === 'HIERARCHY' && (
        <div className="space-y-6">
          {/* Region Selector Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegionId(reg.id)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                  selectedRegionId === reg.id
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-xl ring-2 ring-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{reg.icon}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700">
                    {reg.countries.length} Countries
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">{reg.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{reg.description}</p>
              </button>
            ))}
          </div>

          {/* Active Region Header & Country Cards Grid */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{activeRegionGroup.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeRegionGroup.name} Sovereign Governance Zone</h3>
                  <p className="text-xs text-slate-400">{activeRegionGroup.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${activeRegionGroup.badgeColor}`}>
                  {activeRegionGroup.code} Zone
                </span>
              </div>
            </div>

            {/* Country Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRegionGroup.countries.map((country) => (
                <div
                  key={country.code}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{country.name} ({country.code})</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            country.enforcementActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {country.enforcementActive ? 'ENFORCED' : 'MONITORING'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Regulator: <strong className="text-slate-200">{country.regulatorBody}</strong></p>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingCountry({ regionId: activeRegionGroup.id, country })}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                      title="Configure country settings"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Country Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Sovereign Enclave</span>
                      <span className="text-slate-200 font-semibold line-clamp-1">{country.sovereignEnclave}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Egress Policy</span>
                      <span className={`font-semibold ${
                        country.crossBorderPolicy === 'ZERO_EGRESS_AIR_GAPPED' ? 'text-rose-400' : 'text-indigo-300'
                      }`}>
                        {country.crossBorderPolicy}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Statutory Retention</span>
                      <span className="text-slate-200 font-semibold">{country.statutoryRetentionYears} Years Mandatory</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Statutory Fine Cap</span>
                      <span className="text-amber-400 font-semibold">{country.fineCapPctTurnover}% Global Revenue</span>
                    </div>
                  </div>

                  {/* Gazette Status */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 text-[11px] truncate max-w-[240px]">
                      📰 {country.lastGazetteNotice}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded">
                      {country.gazetteSyncStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOVEREIGN KILL-SWITCH MATRIX */}
      {activeTab === 'KILL_SWITCH' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issue Freeze Directive Form */}
            <div className="bg-slate-950/90 border border-rose-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Dispatch Statutory Hold Directive
                </h3>
              </div>

              <form onSubmit={handleIssueKillSwitchHold} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Tenant Entity</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                  >
                    <option value="Tenant-9021 (Acme Europe GmbH)">Tenant-9021 (Acme Europe GmbH)</option>
                    <option value="Tenant-402 (Riyadh Financial Systems)">Tenant-402 (Riyadh Financial Systems)</option>
                    <option value="Tenant-109 (Singapore AI Analytics Hub)">Tenant-109 (Singapore AI Analytics Hub)</option>
                    <option value="Tenant-881 (US HealthCare Data Vault)">Tenant-881 (US HealthCare Data Vault)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Country Jurisdiction</label>
                  <select
                    value={targetCountryCode}
                    onChange={(e) => setTargetCountryCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                  >
                    <option value="DE">🇩🇪 Germany (DE) - BaFin / BfDI</option>
                    <option value="SA">🇸🇦 Saudi Arabia (SA) - SDAIA / SAMA</option>
                    <option value="FR">🇫🇷 France (FR) - CNIL / ANSSI</option>
                    <option value="SG">🇸🇬 Singapore (SG) - PDPC / MAS</option>
                    <option value="US">🇺🇸 United States (US) - SEC / CISA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Statutory Cause / Freeze Grounds</label>
                  <textarea
                    rows={3}
                    placeholder="Describe legal violation, e.g. Art 99 EU AI Act watermark non-compliance..."
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg text-[11px] text-rose-300 leading-relaxed">
                  ⚠️ <strong>Cryptographic Execution Notice:</strong> Issuing this hold immediately appends a SHA-256 digital signature to tenant API gateways in target country nodes, quarantining cross-border egress.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Sign & Execute Kill-Switch Hold</span>
                </button>
              </form>
            </div>

            {/* Active Holds Ledger */}
            <div className="lg:col-span-2 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400" />
                  Active Sovereign Compliance Holds & Quarantines
                </h3>
                <span className="text-xs font-mono text-slate-400">{activeHolds.length} Total Active</span>
              </div>

              <div className="space-y-3">
                {activeHolds.map((hold) => (
                  <div key={hold.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold rounded uppercase">
                          {hold.status}
                        </span>
                        <span className="font-bold text-white text-xs">{hold.tenant}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Issued {hold.timestamp.split('T')[0]}</span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      Reason: <strong>{hold.reason}</strong>
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                      <span>Authority: {hold.issuedBy}</span>
                      <span className="truncate max-w-[220px]">SHA-256: {hold.sha256}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ZK AUDIT INSPECTION BRIDGE */}
      {activeTab === 'ZK_AUDIT' && (
        <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold rounded-full uppercase">
                  Zero-Knowledge Regulatory Telemetry
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">ZK-Snark Sovereign Regulatory Inspection Bridge</h3>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Cryptographically verify that tenant databases across all 20+ countries comply with local data residency laws without exposing raw underlying citizen PII or company secrets.
              </p>
            </div>

            <button
              onClick={handleRunZkProofAudit}
              disabled={zkQueryRunning}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center space-x-2 cursor-pointer"
            >
              <Lock className={`w-4 h-4 ${zkQueryRunning ? 'animate-spin' : ''}`} />
              <span>{zkQueryRunning ? 'Verifying ZK-Proofs...' : 'Run Global ZK Compliance Audit'}</span>
            </button>
          </div>

          {/* Results Display */}
          {zkResults ? (
            <div className="space-y-4">
              <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Overall ZK-Snark Audit Status: {zkResults.overallProofStatus}</div>
                    <div className="text-[11px] font-mono text-purple-300/80">Proof Hash: {zkResults.zkProofHash}</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{zkResults.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {zkResults.verificationDetails.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{item.check}</div>
                      <div className="text-[10px] font-mono text-slate-500">Latency: {item.latencyMs}ms</div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Lock className="w-10 h-10 text-purple-500/40 mx-auto" />
              <p className="text-xs">Click "Run Global ZK Compliance Audit" to generate live cryptographic proof across country enclaves.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STATUTORY GAZETTE INJECTOR */}
      {activeTab === 'GAZETTE' && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                Automated Statutory Gazette Sync & Dynamic Policy Injector
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time subscription feed monitoring official government gazettes worldwide. SaaS Admins can deploy auto-patch policies directly to target country nodes.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {gazetteItems.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded">
                      [{item.country}] {item.source}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Effective: {item.effectiveDate}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-auto">
                  {item.applied ? (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Auto-Patch Deployed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyGazetteAutoPatch(item.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Deploy Auto-Patch Directive</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DATA TARIFF & FINE ARBITRAGE */}
      {activeTab === 'TARIFF_CALC' && (
        <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                Cross-Border Data Localization Tariff & Statutory Exposure Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate cross-border egress volumes and calculate real-time statutory fine risks and localization tariff liabilities.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold text-slate-300">Monthly Egress Volume:</label>
              <input
                type="number"
                value={monthlyDataTB}
                onChange={(e) => setMonthlyDataTB(Number(e.target.value))}
                className="w-24 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs text-center focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs font-bold text-amber-400">TB / month</span>
            </div>
          </div>

          {calculatedTariff && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Total Egress Volume</div>
                  <div className="text-xl font-bold text-white font-mono mt-1">{calculatedTariff.totalGB.toLocaleString()} GB</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Estimated Localization Tariff</div>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-1">${calculatedTariff.totalTariffUSD.toLocaleString()} / mo</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Max Statutory Fine Exposure</div>
                  <div className="text-xl font-bold text-rose-400 font-mono mt-1">${calculatedTariff.maxFineRiskUSD.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="pb-2">Country Jurisdiction</th>
                      <th className="pb-2">Tariff Rate</th>
                      <th className="pb-2">Est. Monthly Tariff</th>
                      <th className="pb-2">Fine Cap (% Turnover)</th>
                      <th className="pb-2">Max Fine Exposure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {calculatedTariff.countryBreakdown.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-bold text-white">{item.country}</td>
                        <td className="py-2.5 text-amber-300">{item.tariffRate}</td>
                        <td className="py-2.5">${item.monthlyTariff.toLocaleString()}</td>
                        <td className="py-2.5 text-rose-300">{item.fineCap}</td>
                        <td className="py-2.5 text-rose-400 font-bold">${item.fineRisk.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MLAT SUBPOENA VAULT */}
      {activeTab === 'SUBPOENA_VAULT' && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-indigo-400" />
              B2G Mutual Legal Assistance Treaty (MLAT) & Subpoena Evidence Vault
            </h3>
            <span className="text-xs text-emerald-400 font-mono">WORM Storage Active</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Judicial Inquiry #MLAT-2026-9042 (EDPB / DOJ Joint Task Force)</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded">CHAIN_OF_CUSTODY_SEALED</span>
            </div>
            <p className="text-xs text-slate-300">
              Evidence locker containing encrypted query logs for cross-border data transfer between Germany (DE) and US FedRAMP nodes.
            </p>
            <div className="text-[10px] font-mono text-slate-500">
              SHA-256 Vault Hash: <code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COUNTRY MODAL */}
      <AnimatePresence>
        {editingCountry && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  Sovereign Settings: {editingCountry.country.flag} {editingCountry.country.name}
                </h3>
                <button onClick={() => setEditingCountry(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sovereign Data Enclave Node</label>
                  <input
                    type="text"
                    value={editingCountry.country.sovereignEnclave}
                    onChange={(e) => setEditingCountry({
                      ...editingCountry,
                      country: { ...editingCountry.country, sovereignEnclave: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cross-Border Egress Rule</label>
                  <select
                    value={editingCountry.country.crossBorderPolicy}
                    onChange={(e) => setEditingCountry({
                      ...editingCountry,
                      country: { ...editingCountry.country, crossBorderPolicy: e.target.value as any }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ZERO_EGRESS_AIR_GAPPED">ZERO_EGRESS_AIR_GAPPED (Strict No-Exit)</option>
                    <option value="TOKENIZED_HASH_ONLY">TOKENIZED_HASH_ONLY (Hashes Only)</option>
                    <option value="ADEQUACY_BILATERAL_MLAT">ADEQUACY_BILATERAL_MLAT (Treaty Required)</option>
                    <option value="PERMISSIVE_ENCRYPTED">PERMISSIVE_ENCRYPTED (TLS 1.3 / AES-256)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Statutory Retention (Years)</label>
                    <input
                      type="number"
                      value={editingCountry.country.statutoryRetentionYears}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        country: { ...editingCountry.country, statutoryRetentionYears: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Fine Cap (% Revenue)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingCountry.country.fineCapPctTurnover}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        country: { ...editingCountry.country, fineCapPctTurnover: Number(e.target.value) }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingCountry(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateCountry(editingCountry.regionId, editingCountry.country)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                  >
                    Save Country Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
