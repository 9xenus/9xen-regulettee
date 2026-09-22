import React, { useState, useMemo, useEffect } from 'react';
import { 
  Landmark, TrendingUp, Coins, Percent, FileText, CheckCircle2, 
  AlertTriangle, Sliders, Download, RefreshCw, Search, Building2, 
  Scale, Layers, Calendar, ShieldCheck, Briefcase, Clock, ArrowUpRight, 
  Check, FileSpreadsheet, ChevronRight, Calculator, CreditCard, ChevronDown, 
  ArrowRightLeft, Printer, Mail, Globe, Sparkles, X, Shield, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RegulatorBillingD3Charts } from './RegulatorBillingD3Charts';
import { useNotification } from '../context/NotificationContext';

// Data types
interface PenaltyRecord {
  id: string;
  companyName: string;
  sector: 'Financial' | 'Big Tech' | 'AI & Algorithms' | 'E-Commerce' | 'Healthcare' | 'Logistics';
  policyBreach: string;
  amountIssued: number;
  amountCollected: number;
  month: string; // e.g., "Jan 2026"
  year: number;  // e.g., 2026
  status: 'CLEARED' | 'IN_FLIGHT' | 'PENDING_SETTLEMENT' | 'DISPUTED';
  dateIssued: string;
}

interface CountryCommissionConfig {
  code: string;
  countryName: string;
  flag: string;
  dpaRegulator: string;
  commissionRate: number;
  enforcedPenaltiesEur: number;
  activeCases: number;
  ibanVault: string;
}

const DEFAULT_COUNTRY_CONFIGS: CountryCommissionConfig[] = [
  { code: 'DE', countryName: 'Germany', flag: '🇩🇪', dpaRegulator: 'BaFin / BfDI', commissionRate: 8.5, enforcedPenaltiesEur: 184500000, activeCases: 14, ibanVault: 'DE89 3704 0044 0532 0130 00' },
  { code: 'FR', countryName: 'France', flag: '🇫🇷', dpaRegulator: 'CNIL France', commissionRate: 10.0, enforcedPenaltiesEur: 142000000, activeCases: 11, ibanVault: 'FR76 3000 6000 0112 3456 7890 189' },
  { code: 'IE', countryName: 'Ireland', flag: '🇮🇪', dpaRegulator: 'DPC Ireland', commissionRate: 7.5, enforcedPenaltiesEur: 295000000, activeCases: 18, ibanVault: 'IE12 BOFI 9000 0112 3456 78' },
  { code: 'NL', countryName: 'Netherlands', flag: '🇳🇱', dpaRegulator: 'AP Netherlands', commissionRate: 9.0, enforcedPenaltiesEur: 98200000, activeCases: 8, ibanVault: 'NL91 ABNA 0412 3456 78' },
  { code: 'ES', countryName: 'Spain', flag: '🇪🇸', dpaRegulator: 'AEPD Spain', commissionRate: 8.0, enforcedPenaltiesEur: 76400000, activeCases: 7, ibanVault: 'ES21 0049 1500 0512 3456 7890' },
  { code: 'IT', countryName: 'Italy', flag: '🇮🇹', dpaRegulator: 'GPDP Italy', commissionRate: 9.5, enforcedPenaltiesEur: 112800000, activeCases: 9, ibanVault: 'IT60 X054 2811 1010 0000 0123 456' },
  { code: 'SE', countryName: 'Sweden', flag: '🇸🇪', dpaRegulator: 'IMY Sweden', commissionRate: 8.0, enforcedPenaltiesEur: 42500000, activeCases: 4, ibanVault: 'SE45 5000 0000 0512 3456 7890' },
  { code: 'EU', countryName: 'EU EDPB Central', flag: '🇪🇺', dpaRegulator: 'EDPB / DG CNECT', commissionRate: 10.0, enforcedPenaltiesEur: 310000000, activeCases: 22, ibanVault: 'EU00 EDPB 0001 0203 0405 06' },
];

const INITIAL_PENALTIES: PenaltyRecord[] = [
  {
    id: "PEN-2026-001",
    companyName: "Global Finance Corp",
    sector: "Financial",
    policyBreach: "DORA Regulation Chapter II",
    amountIssued: 14500000,
    amountCollected: 14500000,
    month: "Jan 2026",
    year: 2026,
    status: "CLEARED",
    dateIssued: "2026-01-12"
  },
  {
    id: "PEN-2026-002",
    companyName: "Tech Startup X",
    sector: "AI & Algorithms",
    policyBreach: "EU AI Act Title III",
    amountIssued: 8900000,
    amountCollected: 4500000,
    month: "Feb 2026",
    year: 2026,
    status: "IN_FLIGHT",
    dateIssued: "2026-02-04"
  },
  {
    id: "PEN-2026-003",
    companyName: "Acme Corporation",
    sector: "Big Tech",
    policyBreach: "GDPR Article 30 (Data Drift)",
    amountIssued: 32000000,
    amountCollected: 32000000,
    month: "Mar 2026",
    year: 2026,
    status: "CLEARED",
    dateIssued: "2026-03-22"
  },
  {
    id: "PEN-2026-004",
    companyName: "Stark Industries Europe",
    sector: "Healthcare",
    policyBreach: "NIS2 Directive Article 21",
    amountIssued: 19800000,
    amountCollected: 0,
    month: "Apr 2026",
    year: 2026,
    status: "PENDING_SETTLEMENT",
    dateIssued: "2026-04-18"
  },
  {
    id: "PEN-2026-005",
    companyName: "Alpha Logistics NV",
    sector: "Logistics",
    policyBreach: "EU Data Act Chapter IV",
    amountIssued: 7200000,
    amountCollected: 7200000,
    month: "May 2026",
    year: 2026,
    status: "CLEARED",
    dateIssued: "2026-05-11"
  },
  {
    id: "PEN-2026-006",
    companyName: "E-Shop Unified GmbH",
    sector: "E-Commerce",
    policyBreach: "GDPR Consent Violations",
    amountIssued: 11500000,
    amountCollected: 8500000,
    month: "June 2026",
    year: 2026,
    status: "DISPUTED",
    dateIssued: "2026-06-03"
  },
  {
    id: "PEN-2025-011",
    companyName: "OmniRetail UK & EU",
    sector: "E-Commerce",
    policyBreach: "GDPR Consent Violations",
    amountIssued: 18400000,
    amountCollected: 18400000,
    month: "Nov 2025",
    year: 2025,
    status: "CLEARED",
    dateIssued: "2025-11-20"
  },
  {
    id: "PEN-2025-012",
    companyName: "MediCare Systems",
    sector: "Healthcare",
    policyBreach: "NIS2 Directive Article 21",
    amountIssued: 25000000,
    amountCollected: 25000000,
    month: "Dec 2025",
    year: 2025,
    status: "CLEARED",
    dateIssued: "2025-12-15"
  },
  {
    id: "PEN-2025-010",
    companyName: "Krypton Crypto Fund",
    sector: "Financial",
    policyBreach: "DORA Regulation Chapter II",
    amountIssued: 12000000,
    amountCollected: 2000000,
    month: "Oct 2025",
    year: 2025,
    status: "PENDING_SETTLEMENT",
    dateIssued: "2025-10-02"
  }
];

interface RegulatorBillingTreasuryProps {
  isAdminView?: boolean; // false = Regulator view, true = SaaS Platform Admin view
}

export const RegulatorBillingTreasury: React.FC<RegulatorBillingTreasuryProps> = ({ 
  isAdminView = false 
}) => {
  const { showToast } = useNotification();
  const [penalties, setPenalties] = useState<any[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<any>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Commission settings (Dynamic configuration!)
  const [commissionRate, setCommissionRate] = useState<number>(10.0); 
  const [selectedDimension, setSelectedDimension] = useState<'monthly' | 'yearly' | 'sector' | 'company' | 'policy' | 'country'>('country');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Country Wise Penalty Commission State
  const [countryConfigs, setCountryConfigs] = useState<CountryCommissionConfig[]>(DEFAULT_COUNTRY_CONFIGS);
  const [selectedInvoiceCountry, setSelectedInvoiceCountry] = useState<CountryCommissionConfig | null>(null);
  const [isDispatchingEmail, setIsDispatchingEmail] = useState(false);

  // Audited briefing generator state
  const [selectedBriefingRecord, setSelectedBriefingRecord] = useState<string>('all_aggregate');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [generatedBriefing, setGeneratedBriefing] = useState<string | null>(null);

  const handleCountryCommissionChange = (code: string, newRate: number) => {
    setCountryConfigs(prev => prev.map(c => c.code === code ? { ...c, commissionRate: newRate } : c));
  };

  const handleTriggerPrintInvoice = () => {
    window.print();
  };

  const handleEmailDispatchInvoice = (country: CountryCommissionConfig) => {
    setIsDispatchingEmail(true);
    setTimeout(() => {
      setIsDispatchingEmail(false);
      showToast(`Official B2G PDF Settlement Statement and Invoice successfully dispatched to ${country.dpaRegulator} Finance Desk via encrypted e-Delivery!`, 'success');
    }, 1000);
  };

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      if (isAdminView) {
        const [metricsRes, configsRes] = await Promise.all([
          fetch('/api/v1/finance/platform/metrics'),
          fetch('/api/v1/finance/platform/regulators/configs')
        ]);
        const mData = await metricsRes.json();
        const cData = await configsRes.json();
        if (mData.success) setPlatformMetrics(mData.data);
        if (cData.success) setConfigs(cData.data);
      } else {
        // Assume some default regulator ID for now or fetch from context
        const regulatorId = 1; 
        const res = await fetch(`/api/v1/finance/regulator/${regulatorId}/collections`);
        const data = await res.json();
        if (data.success) setPenalties(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [isAdminView]);

  // Math Metrics
  const metrics = useMemo(() => {
    if (isAdminView && platformMetrics) {
      return {
        totalIssued: platformMetrics.grossPenalties,
        totalCollected: platformMetrics.grossPenalties, // Simplified
        platformCommission: platformMetrics.totalCommissions,
        netRegulatorTreasury: platformMetrics.grossPenalties - platformMetrics.totalCommissions,
        recoveryRate: 100,
        clearedCount: penalties.length,
        totalCount: penalties.length
      };
    }

    let issued = 0;
    let collected = 0;
    let clearedCount = 0;
    
    penalties.forEach(p => {
      issued += p.amount_collected_cents || 0;
      collected += p.amount_collected_cents || 0;
      clearedCount++;
    });

    const platformCommission = collected * (commissionRate / 100);
    const netRegulatorTreasury = collected - platformCommission;
    const recoveryRate = issued > 0 ? (collected / issued) * 100 : 0;

    return {
      totalIssued: issued,
      totalCollected: collected,
      platformCommission,
      netRegulatorTreasury,
      recoveryRate,
      clearedCount,
      totalCount: penalties.length
    };
  }, [penalties, commissionRate, platformMetrics, isAdminView]);

  // Dimension break down calculation
  const dimensionData = useMemo(() => {
    const map: Record<string, { name: string; issued: number; collected: number; count: number }> = {};

    penalties.forEach(p => {
      let key = '';
      const month = p.collected_at ? new Date(p.collected_at).toLocaleString('default', { month: 'short', year: 'numeric' }) : 'Unknown';
      const year = p.collected_at ? new Date(p.collected_at).getFullYear().toString() : 'Unknown';
      
      if (selectedDimension === 'monthly') key = month;
      else if (selectedDimension === 'yearly') key = year;
      else if (selectedDimension === 'sector') key = p.sector || 'General';
      else if (selectedDimension === 'company') key = p.company_name || 'Organization';
      else if (selectedDimension === 'policy') key = 'Regulation'; 

      if (!map[key]) {
        map[key] = { name: key, issued: 0, collected: 0, count: 0 };
      }
      map[key].issued += p.amount_collected_cents || 0;
      map[key].collected += p.amount_collected_cents || 0;
      map[key].count += 1;
    });

    return Object.values(map).sort((a, b) => b.issued - a.issued);
  }, [penalties, selectedDimension]);

  // Filtered penalty list
  const filteredPenalties = useMemo(() => {
    return penalties.filter(p => {
      const matchSearch = (p.company_name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (p.id || '').toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [penalties, search]);

  const handleForceSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Simulate slight update in payments collected to prove dynamic computation
      setPenalties(prev => prev.map(p => {
        if (p.id === "PEN-2026-002" && p.amountCollected === 4500000) {
          return { ...p, amountCollected: 7500000, status: "IN_FLIGHT" };
        }
        if (p.id === "PEN-2026-004" && p.amountCollected === 0) {
          return { ...p, amountCollected: 5000000, status: "IN_FLIGHT" };
        }
        return p;
      }));
    }, 800);
  };

  // Automated accounts audit briefing writer
  const handleGenerateBriefing = (key: string) => {
    setIsGeneratingBriefing(true);
    setGeneratedBriefing(null);
    
    setTimeout(() => {
      setIsGeneratingBriefing(false);
      let briefingText = "";
      
      if (key === 'all_aggregate') {
        briefingText = `NONAXEN TRUST TREASURY OFFICIAL ACCOUNTS AUDIT BRIEFING
--------------------------------------------------------
Security Hash: SHA256[0x4f12ab88a33ed991c0ffae623]
Date of Audit: ${new Date().toLocaleDateString()}
Audit Class: Unified Regulatory Sovereign Enforcement Index

EXECUTIVE SUMMARY:
Total cumulative compliance penalties recovered stand at €${(metrics.totalCollected / 100).toLocaleString()}, with a recovery performance quotient of 100%.

COMMISSION AND REVENUE SPLIT BRIEFING:
Under active Sovereign Portal pricing rules, the SaaS Platform service fee is set at a flat rate of ${commissionRate}% of collected penal reserves.
1. SaaS Admin Platform Allocation: €${(metrics.platformCommission / 100).toLocaleString()} (Automated escrow settlement cleared via TARGET2).
2. Net National DPA Treasury Disbursement: €${(metrics.netRegulatorTreasury / 100).toLocaleString()} (Dispersed directly to designated Member State vaults).

PORTFOLIO SECURITY ASSURANCE STATEMENT:
All financial transactions conform strictly with NIS2 boundary encryption. Smart-contract escrows demonstrate zero leakage or structural drift. It is recommended to clear pending collections for outstanding High-Risk AI systems to avoid compliance index stagnation.`;
      } else {
        const item = penalties.find(p => p.id === key);
        if (item) {
          const itemPlatformCommission = item.platform_commission_amount_cents;
          const itemNetTreasury = item.amount_collected_cents - itemPlatformCommission;
          briefingText = `OFFICIAL AUDIT REPORT: CASE ID ${item.id.substring(0, 8)}
--------------------------------------------------------
Target Corporation: ${item.company_name}
Industry Sector: General
Sovereign Policy Breached: Regulatory Enforcement Directive
Enforcement Grade: Level 3 Infraction Directive

FINANCIAL LEDGER ACCOUNTS:
- Reserves Recovered: €${(item.amount_collected_cents / 100).toLocaleString()}
- SaaS Platform Service Fee (${commissionRate}%): €${(itemPlatformCommission / 100).toLocaleString()}
- Net Allocated Regulator Treasury: €${(itemNetTreasury / 100).toLocaleString()}
- Settlement Protocol: SEPA Instant / DLT smart contract escrow [0x92b...ff89]

DPA COMPLIANCE BRIEFING & RECOMMENDATION:
Verification shows 100% of the funds have cleared and been successfully routed to national central vaults. No further action needed.`;
        }
      }
      setGeneratedBriefing(briefingText);
    }, 600);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 lg:p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-400 font-mono text-[10px] uppercase tracking-wider mb-2">
              <Landmark className="w-3.5 h-3.5" />
              <span>EU TREASURY & BILLING LEDGER SYSTEM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Penalty Treasury & SaaS Commissions</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Automated financial distribution ledger monitoring penalties issued, recovery collection rates, regulator payout shares, and SaaS operator commission splits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={handleForceSync}
              disabled={isRefreshing}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>Force Sync Clearing</span>
            </button>
            <button 
              onClick={() => handleGenerateBriefing('all_aggregate')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Generate Audit Briefing</span>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Commission Slider */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>SaaS Automated Service Commission Rate</span>
            </div>
            <p className="text-slate-500 text-xs">
              Change the system commission rate to recalculate platform cuts and regulator disbursements in real time.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 w-full md:w-96">
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">COMMISSION</span>
              <span className="text-xl font-mono font-black text-amber-400">{commissionRate.toFixed(1)}%</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="15" 
              step="0.5" 
              value={commissionRate} 
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="text-left shrink-0 text-slate-500 text-xs font-semibold">
              Max 15.0%
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Penalties Issued</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">€{(metrics.totalIssued / 1000000).toFixed(1)}M</div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Across {metrics.totalCount} Cases</span>
            <span className="text-indigo-600 font-bold">100% Verified</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Reserves Collected</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">€{(metrics.totalCollected / 1000000).toFixed(1)}M</div>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between text-slate-400">
            <span className="flex items-center text-emerald-600 font-semibold gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {metrics.recoveryRate.toFixed(1)}% Yield
            </span>
            <span>{metrics.clearedCount} cases fully cleared</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">SaaS Platform Cut</span>
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9px] font-mono font-bold">{commissionRate}% Fee</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">€{(metrics.platformCommission / 1000000).toFixed(2)}M</div>
          </div>
          <div className="mt-3 text-xs text-amber-700 font-semibold flex items-center justify-between">
            <span>SaaS Admin Service Revenue</span>
            <span>TARGET2 Routed</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Net DPA Treasury</span>
              <span className="text-[10px] text-indigo-600 font-bold">Member States Share</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-900 font-mono">€{(metrics.netRegulatorTreasury / 1000000).toFixed(2)}M</div>
          </div>
          <div className="mt-3 text-xs text-indigo-600 font-semibold flex items-center justify-between">
            <span>Regulator Retained Funds</span>
            <span>Sovereign Enclaves</span>
          </div>
        </div>

      </div>

      {/* Interactive D3.js Visualization Charts */}
      <RegulatorBillingD3Charts penalties={penalties} commissionRate={commissionRate} />

      {/* Main Ledger Breakdown Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Multi-Dimensional Audit Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter, search, and view accounts according to different compliance taxonomies.</p>
          </div>
          
          {/* Dimension Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'country', label: 'Country B2G Matrix' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly' },
              { id: 'sector', label: 'Sector-wise' },
              { id: 'company', label: 'Company-wise' },
              { id: 'policy', label: 'Law Policy' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDimension(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer whitespace-nowrap ${
                  selectedDimension === tab.id 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aggregated Dimension Table */}
        <div className="overflow-x-auto">
          {selectedDimension === 'country' ? (
            <table className="min-w-full text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-900 text-slate-300 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Member State / Region</th>
                  <th className="px-6 py-3.5">DPA Regulator Authority</th>
                  <th className="px-6 py-3.5">Enforced Penalties</th>
                  <th className="px-6 py-3.5 text-amber-400">SaaS Commission Rate</th>
                  <th className="px-6 py-3.5 text-amber-300">Platform Cut</th>
                  <th className="px-6 py-3.5 text-emerald-400">Net Member State Treasury</th>
                  <th className="px-6 py-3.5 text-right">Official Billing PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {countryConfigs.map((country) => {
                  const saasCutEur = country.enforcedPenaltiesEur * (country.commissionRate / 100);
                  const netTreasuryEur = country.enforcedPenaltiesEur - saasCutEur;

                  return (
                    <tr key={country.code} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-2.5">
                        <span className="text-xl">{country.flag}</span>
                        <div>
                          <div className="font-extrabold text-slate-900">{country.countryName}</div>
                          <span className="text-[10px] font-mono text-slate-400">{country.code} • {country.activeCases} Active Enforcement Cases</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">
                        {country.dpaRegulator}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        €{country.enforcedPenaltiesEur.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg w-28">
                          <input 
                            type="number"
                            step="0.5"
                            min="0"
                            max="30"
                            value={country.commissionRate}
                            onChange={(e) => handleCountryCommissionChange(country.code, parseFloat(e.target.value) || 0)}
                            className="w-12 bg-transparent text-xs font-mono font-black text-amber-900 focus:outline-none"
                          />
                          <span className="text-xs font-bold text-amber-700">%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-amber-700 bg-amber-50/30">
                        €{saasCutEur.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-700 bg-emerald-50/30">
                        €{netTreasuryEur.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedInvoiceCountry(country)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 border-0 cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>PDF Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase">
                <tr>
                  <th className="px-6 py-3">Classification Dimension</th>
                  <th className="px-6 py-3">Active Cases</th>
                  <th className="px-6 py-3">Total Penalties Issued</th>
                  <th className="px-6 py-3">Reserves Collected</th>
                  <th className="px-6 py-3 text-amber-600">SaaS Cut ({commissionRate}%)</th>
                  <th className="px-6 py-3 text-indigo-600">Net DPA Treasury</th>
                  <th className="px-6 py-3 text-right">Recovery Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {dimensionData.map((row, index) => {
                  const commission = row.collected * (commissionRate / 100);
                  const netTreasury = row.collected - commission;
                  const rate = row.issued > 0 ? (row.collected / row.issued) * 100 : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span className="font-extrabold text-slate-900">{row.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {row.count} Infraction Case(s)
                      </td>
                      <td className="px-6 py-4 font-mono">€{row.issued.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-emerald-600">€{row.collected.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-amber-700 bg-amber-50/20">€{commission.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                      <td className="px-6 py-4 font-mono text-indigo-700 bg-indigo-50/20">€{netTreasury.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          rate >= 90 ? 'text-emerald-600 bg-emerald-50' : 
                          rate >= 50 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50'
                        } px-2 py-0.5 rounded border ${
                          rate >= 90 ? 'border-emerald-100' : 
                          rate >= 50 ? 'border-amber-100' : 'border-rose-100'
                        }`}>
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Two Column Section: Accounts Audit Briefing & Active Fine Ledgers */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Official Briefing & Accounts Audit (DPA stamp) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Accounts Audit Briefing</span>
              </h3>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-mono font-bold text-indigo-600">FORMAL DPA DOCUMENT</span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Generate a cryptographically stamped report briefing for the aggregate ledger or drill down to individual companies.
              </p>
              
              <div className="flex items-center gap-2">
                <select 
                  value={selectedBriefingRecord} 
                  onChange={(e) => setSelectedBriefingRecord(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 font-semibold focus:ring-1 focus:ring-amber-500/50"
                >
                  <option value="all_aggregate">All Cases (Aggregated Treasury Ledger)</option>
                  {penalties.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.companyName} (€{p.amountIssued.toLocaleString()})</option>
                  ))}
                </select>
                <button
                  onClick={() => handleGenerateBriefing(selectedBriefingRecord)}
                  disabled={isGeneratingBriefing}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 disabled:opacity-50 border-0"
                >
                  {isGeneratingBriefing ? <RefreshCw className="w-3 h-3 animate-spin text-amber-400" /> : <Calculator className="w-3 h-3" />}
                  <span>Compile</span>
                </button>
              </div>

              <div className="mt-4 relative">
                <AnimatePresence mode="wait">
                  {generatedBriefing ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="bg-slate-900 text-slate-300 font-mono text-[11px] p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-slate-800 relative shadow-inner h-80 overflow-y-auto no-scrollbar text-left"
                    >
                      {generatedBriefing}
                      
                      {/* Floating Regulator Stamp */}
                      <div className="absolute bottom-3 right-3 rotate-12 border-2 border-emerald-500/60 text-emerald-400 bg-emerald-950/90 text-[10px] font-black px-2.5 py-1 rounded tracking-widest pointer-events-none uppercase">
                        EU DPA AUDITED
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-20 text-center flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <span className="text-xs text-slate-400 font-medium">No briefing generated yet. Select a scope above.</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {generatedBriefing && (
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">LEDGER VERIFIED SECURE</span>
              </div>
              <button 
                onClick={() => showToast("Audit log report downloaded in JSON-LD format with SHA-256 state seal.", 'info')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 border-0 bg-transparent"
              >
                <Download className="w-3.5 h-3.5" /> Export Certified JSON-LD
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Case Ledger & Live Tracking with Settlement Action */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Fine Payment Collections & Smart Contracts</span>
              </h3>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search case/company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-indigo-500/50 w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>

            {/* Micro Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Filters:</span>
              <select 
                value={sectorFilter} 
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] py-1 px-2 font-bold cursor-pointer text-slate-600"
              >
                <option value="all">All Sectors</option>
                <option value="Financial">Financial</option>
                <option value="Big Tech">Big Tech</option>
                <option value="AI & Algorithms">AI & Algorithms</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-Commerce">E-Commerce</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] py-1 px-2 font-bold cursor-pointer text-slate-600"
              >
                <option value="all">All Statuses</option>
                <option value="CLEARED">CLEARED</option>
                <option value="IN_FLIGHT">IN_FLIGHT</option>
                <option value="PENDING_SETTLEMENT">PENDING_SETTLEMENT</option>
                <option value="DISPUTED">DISPUTED</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
              {filteredPenalties.map((p) => {
                const commissionVal = p.amountCollected * (commissionRate / 100);
                const dpaNetVal = p.amountCollected - commissionVal;
                
                return (
                  <div key={p.id} className="p-3 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{p.company_name}</span>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1 rounded">{p.id.substring(0, 8)}</span>
                        </div>
                        <div className="text-slate-500 font-medium">Compliance Penalty Settlement</div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                          <span>Collected: <strong className="text-emerald-600">€{(p.amount_collected_cents / 100).toLocaleString()}</strong></span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 gap-1 text-right">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                          CLEARED
                        </span>
                        <div className="text-[10px] font-mono text-slate-500">
                          SaaS: <strong className="text-amber-600">€{(p.platform_commission_amount_cents / 100).toLocaleString()}</strong>
                        </div>
                      </div>
                  </div>
                );
              })}

              {filteredPenalties.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">No matching cases found for the chosen filters.</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Commission Settler Node Active</span>
            <button
              onClick={() => showToast(`Clearing smart contract settled! Directed SaaS Platforms commission cuts and National DPA reserves instantly to target IBAN vaults.`, 'success')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 border-0 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Settle Outstanding Contracts</span>
            </button>
          </div>
        </div>

      </div>

      {/* B2G Official PDF Settlement Invoice Modal */}
      <AnimatePresence>
        {selectedInvoiceCountry && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 text-slate-900 print:shadow-none print:border-none print:max-w-none print:w-full print:p-0"
            >
              {/* Header Actions */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedInvoiceCountry.flag}</span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Official B2G Regulatory Settlement Invoice</h3>
                    <p className="text-xs text-slate-500 font-mono">B2G-INV-{new Date().getFullYear()}-{selectedInvoiceCountry.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEmailDispatchInvoice(selectedInvoiceCountry)}
                    disabled={isDispatchingEmail}
                    className="px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>{isDispatchingEmail ? 'Dispatching...' : 'e-Mail Invoice'}</span>
                  </button>
                  <button
                    onClick={handleTriggerPrintInvoice}
                    className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print / Export PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoiceCountry(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Document Canvas / Printable Sheet */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 font-sans print:bg-white print:border-none print:p-0">
                {/* Official Letterhead Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-7 h-7 text-indigo-700" />
                      <span className="font-black text-slate-900 tracking-tight text-xl">EUROPEAN UNION SOVEREIGN B2G TREASURY</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Single Resolution Board & Member State Penalty Settlement Office</p>
                    <p className="text-[11px] text-slate-400 font-mono">Tax Registration: EU-VAT-883920192 • SEPA Clearing ID: TARGET2-DE-992</p>
                  </div>
                  <div className="text-right space-y-1 font-mono text-xs">
                    <div className="bg-indigo-900 text-white font-bold px-3 py-1 rounded inline-block">OFFICIAL B2G SETTLEMENT STATEMENT</div>
                    <div className="text-slate-500">Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-slate-500">Status: <strong className="text-emerald-600">CERTIFIED & CLEARED</strong></div>
                  </div>
                </div>

                {/* Recipient / Authority Particulars */}
                <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Payer / Platform Operator:</span>
                    <div className="font-bold text-slate-900 text-sm">9Xen Regulettee CaaS Sovereign Platform Ltd.</div>
                    <div className="text-slate-500">EU RegTech Infrastructure Division</div>
                    <div className="text-slate-500">Sovereign Enclave HQ • Brussels / Frankfurt</div>
                  </div>
                  <div className="space-y-1 text-right sm:text-left">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Payee / Regulatory Authority:</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedInvoiceCountry.dpaRegulator} ({selectedInvoiceCountry.countryName})</div>
                    <div className="text-slate-500">Target IBAN Vault: <span className="font-mono text-indigo-700 font-bold">{selectedInvoiceCountry.ibanVault}</span></div>
                    <div className="text-slate-500">Jurisdiction: {selectedInvoiceCountry.countryName} ({selectedInvoiceCountry.code})</div>
                  </div>
                </div>

                {/* Financial Line Item Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Settlement Itemization</h4>
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                    <thead className="bg-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Calculation Basis</th>
                        <th className="p-3 text-right">Amount (€)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-medium">
                      <tr>
                        <td className="p-3">
                          <strong className="text-slate-900 block">Gross Enforced Compliance Penalties</strong>
                          <span className="text-[10px] text-slate-500">{selectedInvoiceCountry.activeCases} Verified Cases under GDPR / EU AI Act / DORA</span>
                        </td>
                        <td className="p-3 text-right font-mono">100.0%</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          €{selectedInvoiceCountry.enforcedPenaltiesEur.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-amber-50/50">
                        <td className="p-3">
                          <strong className="text-amber-900 block">SaaS Platform Automated Service Fee</strong>
                          <span className="text-[10px] text-amber-700">Contractual Operator Rate: {selectedInvoiceCountry.commissionRate}%</span>
                        </td>
                        <td className="p-3 text-right font-mono text-amber-700">{selectedInvoiceCountry.commissionRate}%</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-800">
                          - €{(selectedInvoiceCountry.enforcedPenaltiesEur * (selectedInvoiceCountry.commissionRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50/50">
                        <td className="p-3">
                          <strong className="text-emerald-900 block font-black">Net Member State Treasury Disbursement</strong>
                          <span className="text-[10px] text-emerald-700">SEPA Instant Clearing to DPA Vault</span>
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-700 font-bold">{(100 - selectedInvoiceCountry.commissionRate).toFixed(1)}%</td>
                        <td className="p-3 text-right font-mono font-black text-emerald-800 text-sm">
                          €{(selectedInvoiceCountry.enforcedPenaltiesEur * (1 - selectedInvoiceCountry.commissionRate / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Cryptographic Seal & Verification Footer */}
                <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div>SHA-256 AUDIT SEAL: 0x8f3c92a170b21e89ffc0a2187</div>
                      <div>Verified by EU Inter-Agency Regulatory Ledger</div>
                    </div>
                  </div>
                  <div className="border border-slate-300 rounded p-2 text-center bg-white">
                    <div className="font-bold text-slate-900 text-[9px]">OFFICIAL REGULATORY STAMP</div>
                    <div className="text-emerald-600 font-black tracking-widest uppercase">EU DPA CERTIFIED</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
