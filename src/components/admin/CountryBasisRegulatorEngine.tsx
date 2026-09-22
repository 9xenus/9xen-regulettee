import React, { useState } from 'react';
import { Globe, Shield, Landmark, AlertTriangle, CheckCircle2, Search, Plus, Filter, Download, Printer, Settings, RefreshCw, FileText, ChevronRight, Lock, Unlock, Zap, Building } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { motion } from 'motion/react';

export interface RegulatorAuthority {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  regulatorName: string;
  acronym: string;
  jurisdictionScope: string[];
  enforcedFrameworks: string[];
  maxFineSeverity: string;
  apiEndpoint: string;
  syncStatus: 'CONNECTED' | 'SYNCING' | 'DEGRADED' | 'OFFLINE';
  autoEnforcementEnabled: boolean;
  dpoContactEmail: string;
  complianceCadence: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  lastAuditDate: string;
}

const INITIAL_REGULATORS: RegulatorAuthority[] = [
  {
    id: 'reg-de-1',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    regulatorName: 'Federal Financial Supervisory Authority & Data Protection',
    acronym: 'BaFin / BfDI',
    jurisdictionScope: ['Financial Services', 'Banking', 'Insurance', 'Data Privacy (GDPR)'],
    enforcedFrameworks: ['GDPR Art. 83', 'BaFin Circular 03/2020 (BA)', 'DORA', 'German AI Act Spec'],
    maxFineSeverity: '€20M or 4% Global Turnover',
    apiEndpoint: 'https://api.bafin.bund.de/v2/regulatory-feed',
    syncStatus: 'CONNECTED',
    autoEnforcementEnabled: true,
    dpoContactEmail: 'compliance-de@regulettee.eu',
    complianceCadence: 'REAL_TIME',
    lastAuditDate: '2026-08-18'
  },
  {
    id: 'reg-fr-1',
    country: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    regulatorName: 'Commission Nationale de l’Informatique et des Libertés & ACPR',
    acronym: 'CNIL / ACPR',
    jurisdictionScope: ['Data Protection', 'Prudential Supervision', 'AI Governance'],
    enforcedFrameworks: ['GDPR', 'French Data Protection Act', 'EU AI Act', 'ACPR AML/CFT'],
    maxFineSeverity: '€20M or 4% Turnover',
    apiEndpoint: 'https://api.cnil.fr/v1/enforce',
    syncStatus: 'CONNECTED',
    autoEnforcementEnabled: true,
    dpoContactEmail: 'compliance-fr@regulettee.eu',
    complianceCadence: 'REAL_TIME',
    lastAuditDate: '2026-08-19'
  },
  {
    id: 'reg-us-1',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    regulatorName: 'Securities and Exchange Commission & Federal Trade Commission',
    acronym: 'SEC / FTC',
    jurisdictionScope: ['Securities', 'Consumer Protection', 'AI Deception & Privacy'],
    enforcedFrameworks: ['CCPA/CPRA', 'SEC Cyber Disclosure Rule', 'FTC Act Section 5', 'HIPAA'],
    maxFineSeverity: '$50M+ Civil Penalties & Disgorgement',
    apiEndpoint: 'https://api.sec.gov/edgar/feed',
    syncStatus: 'CONNECTED',
    autoEnforcementEnabled: true,
    dpoContactEmail: 'compliance-us@9xen-regulettee.com',
    complianceCadence: 'HOURLY',
    lastAuditDate: '2026-08-20'
  },
  {
    id: 'reg-uk-1',
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    regulatorName: 'Financial Conduct Authority & Information Commissioner’s Office',
    acronym: 'FCA / ICO',
    jurisdictionScope: ['Financial Markets', 'Information Privacy', 'Consumer Duty'],
    enforcedFrameworks: ['UK GDPR', 'Data Protection Act 2018', 'FCA Consumer Duty', 'UK AI Whitepaper'],
    maxFineSeverity: '£17.5M or 4% Annual Turnover',
    apiEndpoint: 'https://api.fca.org.uk/regulatory/v1',
    syncStatus: 'CONNECTED',
    autoEnforcementEnabled: true,
    dpoContactEmail: 'compliance-uk@9xen-regulettee.co.uk',
    complianceCadence: 'REAL_TIME',
    lastAuditDate: '2026-08-17'
  },
  {
    id: 'reg-sg-1',
    country: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    regulatorName: 'Monetary Authority of Singapore & Personal Data Protection Commission',
    acronym: 'MAS / PDPC',
    jurisdictionScope: ['Monetary / FinTech', 'Data Privacy', 'AI Verify Governance'],
    enforcedFrameworks: ['PDPA 2012 (Rev. 2020)', 'MAS TRM Guidelines', 'Model AI Governance Framework'],
    maxFineSeverity: 'SGD $1M or 10% Annual Turnover',
    apiEndpoint: 'https://api.mas.gov.sg/regulator/feed',
    syncStatus: 'CONNECTED',
    autoEnforcementEnabled: true,
    dpoContactEmail: 'compliance-sg@9xen-regulettee.sg',
    complianceCadence: 'DAILY',
    lastAuditDate: '2026-08-15'
  },
  {
    id: 'reg-ch-1',
    country: 'Switzerland',
    countryCode: 'CH',
    flag: '🇨🇭',
    regulatorName: 'Swiss Financial Market Supervisory Authority & FDPIC',
    acronym: 'FINMA / FDPIC',
    jurisdictionScope: ['Banking / Wealth Management', 'Federal Data Protection (FADP)'],
    enforcedFrameworks: ['Revised FADP (revFADP)', 'FINMA Circulars', 'Banking Act'],
    maxFineSeverity: 'CHF 1M Criminal Fines & Liquidation',
    apiEndpoint: 'https://api.finma.ch/v1/supervision',
    syncStatus: 'DEGRADED',
    autoEnforcementEnabled: false,
    dpoContactEmail: 'compliance-ch@9xen-regulettee.ch',
    complianceCadence: 'DAILY',
    lastAuditDate: '2026-08-10'
  },
  {
    id: 'reg-jp-1',
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    regulatorName: 'Financial Services Agency & Personal Information Protection Commission',
    acronym: 'JFSA / PPC',
    jurisdictionScope: ['Financial Services', 'Cross-Border Personal Data'],
    enforcedFrameworks: ['APPI (Act on Protection of Personal Information)', 'JFSA Guidelines'],
    maxFineSeverity: '¥100M Corporate Penalties',
    apiEndpoint: 'https://api.fsa.go.jp/v1/compliance',
    syncStatus: 'CONNECTED',
    autoEnforcementEnabled: true,
    dpoContactEmail: 'compliance-jp@9xen-regulettee.jp',
    complianceCadence: 'WEEKLY',
    lastAuditDate: '2026-08-12'
  },
  {
    id: 'reg-au-1',
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    regulatorName: 'Australian Securities and Investments Commission & OAIC',
    acronym: 'ASIC / OAIC',
    jurisdictionScope: ['Corporate Markets', 'Privacy Act Compliance'],
    enforcedFrameworks: ['Privacy Act 1988 (Cth)', 'ASIC Regulatory Guides', 'CPS 234'],
    maxFineSeverity: 'AUD $50M or 3x Benefit Derived',
    apiEndpoint: 'https://api.asic.gov.au/v1/regfeed',
    syncStatus: 'CONNECTED',
    autoEnforcementEnabled: true,
    dpoContactEmail: 'compliance-au@9xen-regulettee.com.au',
    complianceCadence: 'DAILY',
    lastAuditDate: '2026-08-16'
  }
];

export const CountryBasisRegulatorEngine: React.FC = () => {
  const { showToast } = useNotification();
  const [regulators, setRegulators] = useState<RegulatorAuthority[]>(INITIAL_REGULATORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');
  const [selectedRegulator, setSelectedRegulator] = useState<RegulatorAuthority | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New regulator form state
  const [newReg, setNewReg] = useState<Partial<RegulatorAuthority>>({
    country: '',
    countryCode: 'XX',
    flag: '🌐',
    regulatorName: '',
    acronym: '',
    jurisdictionScope: ['General Compliance'],
    enforcedFrameworks: ['Local Privacy Law'],
    maxFineSeverity: '€10M / 4% Turnover',
    apiEndpoint: 'https://api.regulator.gov/v1',
    syncStatus: 'CONNECTED',
    autoEnforcementEnabled: true,
    dpoContactEmail: 'compliance@9xen-regulettee.org',
    complianceCadence: 'DAILY',
    lastAuditDate: new Date().toISOString().split('T')[0]
  });

const REGIONS: Record<string, string[]> = {
  'North America': ['US', 'CA', 'MX'],
  'Europe': ['DE', 'FR', 'GB', 'CH', 'IT', 'ES', 'NL'],
  'Asia-Pacific': ['SG', 'JP', 'AU', 'CN', 'IN'],
};

// Map country code to name for display
const COUNTRY_MAP: Record<string, string> = {
  'US': 'United States', 'CA': 'Canada', 'MX': 'Mexico',
  'DE': 'Germany', 'FR': 'France', 'GB': 'United Kingdom', 'CH': 'Switzerland', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
  'SG': 'Singapore', 'JP': 'Japan', 'AU': 'Australia', 'CN': 'China', 'IN': 'India'
};

  const filteredRegulators = regulators.filter(r => {
    const matchesSearch = 
      r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.regulatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.enforcedFrameworks.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCountry = selectedCountryFilter === 'ALL' || r.countryCode === selectedCountryFilter;
    return matchesSearch && matchesCountry;
  });

  const toggleAutoEnforcement = (id: string) => {
    setRegulators(prev => prev.map(reg => {
      if (reg.id !== id) return reg;
      const updatedState = !reg.autoEnforcementEnabled;
      showToast(`Auto-enforcement for ${reg.acronym} (${reg.country}) is now ${updatedState ? 'ENABLED' : 'DISABLED'}.`, updatedState ? 'success' : 'warning');
      return { ...reg, autoEnforcementEnabled: updatedState };
    }));
  };

  const handleSyncNow = (reg: RegulatorAuthority) => {
    showToast(`Initiating secure direct API sync with ${reg.acronym} (${reg.country})...`, 'info');
    setTimeout(() => {
      setRegulators(prev => prev.map(r => r.id === reg.id ? { ...r, syncStatus: 'CONNECTED', lastAuditDate: new Date().toISOString().split('T')[0] } : r));
      showToast(`Successfully synchronized with ${reg.acronym} compliance feed. Zero discrepancies.`, 'success');
    }, 900);
  };

  const handleSaveNewRegulator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg.country || !newReg.regulatorName || !newReg.acronym) {
      showToast('Please fill in all required fields (Country, Regulator Name, Acronym).', 'error');
      return;
    }

    const created: RegulatorAuthority = {
      id: `reg-${Date.now()}`,
      country: newReg.country || 'Unknown',
      countryCode: newReg.countryCode || 'UN',
      flag: newReg.flag || '🌐',
      regulatorName: newReg.regulatorName || '',
      acronym: newReg.acronym || '',
      jurisdictionScope: newReg.jurisdictionScope || ['General'],
      enforcedFrameworks: newReg.enforcedFrameworks || ['Standard Act'],
      maxFineSeverity: newReg.maxFineSeverity || 'Standard Penalty',
      apiEndpoint: newReg.apiEndpoint || 'https://api.regulator.int',
      syncStatus: 'CONNECTED',
      autoEnforcementEnabled: newReg.autoEnforcementEnabled ?? true,
      dpoContactEmail: newReg.dpoContactEmail || 'dpo@9xen-regulettee.org',
      complianceCadence: newReg.complianceCadence || 'DAILY',
      lastAuditDate: new Date().toISOString().split('T')[0]
    };

    setRegulators([created, ...regulators]);
    setShowAddModal(false);
    setNewReg({
      country: '',
      countryCode: 'XX',
      flag: '🌐',
      regulatorName: '',
      acronym: '',
      jurisdictionScope: ['General Compliance'],
      enforcedFrameworks: ['Local Privacy Law'],
      maxFineSeverity: '€10M / 4% Turnover',
      apiEndpoint: 'https://api.regulator.gov/v1',
      syncStatus: 'CONNECTED',
      autoEnforcementEnabled: true,
      dpoContactEmail: 'compliance@9xen-regulettee.org',
      complianceCadence: 'DAILY',
      lastAuditDate: new Date().toISOString().split('T')[0]
    });
    showToast(`Country-basis regulator authority '${created.acronym} (${created.country})' added successfully.`, 'success');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Country', 'Country Code', 'Regulator Name', 'Acronym', 'Jurisdictions', 'Enforced Frameworks', 'Max Fine Severity', 'Sync Status', 'Auto Enforcement', 'Cadence', 'Last Audit'];
    const rows = filteredRegulators.map(r => [
      r.id,
      `"${r.country}"`,
      r.countryCode,
      `"${r.regulatorName}"`,
      r.acronym,
      `"${r.jurisdictionScope.join(', ')}"`,
      `"${r.enforcedFrameworks.join(', ')}"`,
      `"${r.maxFineSeverity}"`,
      r.syncStatus,
      r.autoEnforcementEnabled ? 'ENABLED' : 'DISABLED',
      r.complianceCadence,
      r.lastAuditDate
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Country_Basis_Regulators_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Country-basis regulators enterprise CSV report downloaded successfully.', 'success');
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocked. Please allow popups to generate the PDF report.', 'error');
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Country-Basis Regulator Management Engine — Enterprise GRC Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; color: #0f172a; }
            .subtitle { font-size: 12px; color: #64748b; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 700; text-transform: uppercase; color: #334155; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: bold; }
            .connected { background: #dcfce7; color: #166534; }
            .degraded { background: #fef9c3; color: #854d0e; }
            .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>9Xen Regulettee Sovereign Enterprise GRC — Country-Basis Regulator Engine</h1>
          <div class="subtitle">Official Supervisory Authorities & Cross-Border Compliance Feed — Generated on ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Regulator & Acronym</th>
                <th>Jurisdiction Scope</th>
                <th>Enforced Frameworks</th>
                <th>Max Penalty Severity</th>
                <th>Cadence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRegulators.map(r => `
                <tr>
                  <td><strong>${r.flag} ${r.country}</strong></td>
                  <td>${r.regulatorName} (${r.acronym})</td>
                  <td>${r.jurisdictionScope.join(', ')}</td>
                  <td>${r.enforcedFrameworks.join(', ')}</td>
                  <td>${r.maxFineSeverity}</td>
                  <td>${r.complianceCadence}</td>
                  <td><span class="badge ${r.syncStatus === 'CONNECTED' ? 'connected' : 'degraded'}">${r.syncStatus}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">9Xen Regulettee CaaS Enterprise Security & Governance Engine. Confidential Supervisory Record.</div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    showToast('Enterprise regulator audit report ready for print/PDF export.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl shadow-xl text-white border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-indigo-400" /> Enterprise GRC Module
              </span>
              <span className="text-xs text-indigo-200/70 font-mono">v2.1 Sovereign Engine</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Country-Basis Regulator Management Engine</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Govern, synchronize, and auto-enforce compliance policies across global supervisory authorities (BaFin, CNIL, SEC, FCA, MAS, FINMA, etc.) on a country-by-country basis with zero-latency webhook telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 border border-indigo-500"
            >
              <Plus className="w-4 h-4" /> Add Country Regulator
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> CSV Export
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> PDF Report
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-900/50">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Jurisdictions</span>
            <span className="text-xl font-black text-white mt-1 block">8 Countries</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Supervisory Feeds</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">14 Authorities (Online)</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Auto-Enforce Shield</span>
            <span className="text-xl font-black text-indigo-400 mt-1 block">92.8% Active</span>
          </div>
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-indigo-900/40">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Compliance Cadence</span>
            <span className="text-xl font-black text-cyan-400 mt-1 block">Real-Time Sync</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search country, regulator, framework..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Filter Country:</span>
          <select
            value={selectedCountryFilter}
            onChange={(e) => setSelectedCountryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 font-semibold outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Countries ({regulators.length})</option>
            {Object.entries(REGIONS).map(([region, codes]) => (
              <optgroup key={region} label={region}>
                {codes.map(code => (
                  <option key={code} value={code}>
                    {COUNTRY_MAP[code] || code} ({code})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Regulators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRegulators.map((reg) => (
          <motion.div
            key={reg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">{reg.flag}</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{reg.country}</h3>
                    <span className="text-xs font-mono font-bold text-indigo-600">{reg.acronym}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  reg.syncStatus === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {reg.syncStatus}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium line-clamp-2 mb-4">
                {reg.regulatorName}
              </p>

              <div className="space-y-2 mb-4 text-xs font-medium border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jurisdiction Scope:</span>
                  <span className="text-slate-800 font-semibold truncate max-w-[160px]" title={reg.jurisdictionScope.join(', ')}>
                    {reg.jurisdictionScope.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Penalty Tier:</span>
                  <span className="text-rose-600 font-bold truncate max-w-[160px]" title={reg.maxFineSeverity}>
                    {reg.maxFineSeverity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sync Cadence:</span>
                  <span className="text-indigo-600 font-bold">{reg.complianceCadence}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {reg.enforcedFrameworks.map((fw, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                    {fw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reg.autoEnforcementEnabled}
                    onChange={() => toggleAutoEnforcement(reg.id)}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-[11px] font-bold text-slate-600">Auto-Enforce</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSyncNow(reg)}
                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                  title="Sync Now"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedRegulator(reg)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Inspect GRC
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRegulators.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <Landmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Country Regulators Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or country filter.</p>
        </div>
      )}

      {/* INSPECT MODAL */}
      {selectedRegulator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedRegulator.flag}</span>
                <div>
                  <h3 className="text-lg font-extrabold">{selectedRegulator.country} — {selectedRegulator.acronym}</h3>
                  <p className="text-xs text-indigo-200 font-medium">{selectedRegulator.regulatorName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegulator(null)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-400 uppercase tracking-widest block mb-1">API Webhook Endpoint</span>
                  <span className="font-mono font-bold text-slate-800 break-all">{selectedRegulator.apiEndpoint}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-400 uppercase tracking-widest block mb-1">DPO Liaison Email</span>
                  <span className="font-semibold text-indigo-600">{selectedRegulator.dpoContactEmail}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Enforced Frameworks & Regulations</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRegulator.enforcedFrameworks.map((fw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold">
                      {fw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Jurisdiction Scope</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRegulator.jurisdictionScope.map((scope, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-bold">
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-700 block">Last Sovereign Audit</span>
                  <span className="text-slate-500 font-mono">{selectedRegulator.lastAuditDate} (Cadence: {selectedRegulator.complianceCadence})</span>
                </div>
                <button
                  onClick={() => {
                    handleSyncNow(selectedRegulator);
                    setSelectedRegulator(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow transition-all"
                >
                  Force Regulatory Sync
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRegulator(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ADD REGULATOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
          >
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Add Country Regulator Authority</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveNewRegulator} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Germany"
                    value={newReg.country || ''}
                    onChange={(e) => setNewReg({ ...newReg, country: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country Code (ISO) & Flag</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="DE"
                      maxLength={2}
                      value={newReg.countryCode || ''}
                      onChange={(e) => setNewReg({ ...newReg, countryCode: e.target.value.toUpperCase() })}
                      className="w-16 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-center uppercase"
                    />
                    <input
                      type="text"
                      placeholder="🇩🇪"
                      value={newReg.flag || ''}
                      onChange={(e) => setNewReg({ ...newReg, flag: e.target.value })}
                      className="w-16 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regulator Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Federal Financial Supervisory Auth"
                    value={newReg.regulatorName || ''}
                    onChange={(e) => setNewReg({ ...newReg, regulatorName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Acronym *</label>
                  <input
                    type="text"
                    placeholder="e.g. BaFin"
                    value={newReg.acronym || ''}
                    onChange={(e) => setNewReg({ ...newReg, acronym: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Enforced Frameworks (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. GDPR, DORA, BaFin Circulars"
                  value={newReg.enforcedFrameworks?.join(', ') || ''}
                  onChange={(e) => setNewReg({ ...newReg, enforcedFrameworks: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Penalty Severity</label>
                  <input
                    type="text"
                    placeholder="e.g. €20M or 4% Turnover"
                    value={newReg.maxFineSeverity || ''}
                    onChange={(e) => setNewReg({ ...newReg, maxFineSeverity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Compliance Cadence</label>
                  <select
                    value={newReg.complianceCadence || 'DAILY'}
                    onChange={(e) => setNewReg({ ...newReg, complianceCadence: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="REAL_TIME">Real-Time WebSocket</option>
                    <option value="HOURLY">Hourly Sync</option>
                    <option value="DAILY">Daily Check</option>
                    <option value="WEEKLY">Weekly Audit</option>
                    <option value="MONTHLY">Monthly Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Secure API Webhook Endpoint</label>
                <input
                  type="url"
                  placeholder="https://api.regulator.gov/feed"
                  value={newReg.apiEndpoint || ''}
                  onChange={(e) => setNewReg({ ...newReg, apiEndpoint: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow"
                >
                  Save Regulator Authority
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
