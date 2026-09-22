import React, { useState } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Globe,
  DollarSign,
  FileText,
  Sparkles,
  RefreshCw,
  Scale,
  Layers,
  Award,
  Users,
  Check,
  Zap,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sliders,
  ChevronRight,
  Eye,
  FileCheck
} from 'lucide-react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';

interface SupplierItem {
  id: string;
  name: string;
  country: string;
  category: string;
  spendEur: number;
  csdddStatus: 'Compliant' | 'Pending Assessment' | 'High Risk' | 'Non-Compliant';
  sanctionCheck: 'CLEARED' | 'UNDER_REVIEW' | 'FLAGGED';
  esgScore: number;
  scope3EmissionsTons: number;
  lastAuditDate: string;
  flaggedRisks: string[];
}

const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: 'SUP-2026-101',
    name: 'Nordic Clean Power Solutions AB',
    country: 'Sweden (EU)',
    category: 'Energy & Utilities',
    spendEur: 1250000,
    csdddStatus: 'Compliant',
    sanctionCheck: 'CLEARED',
    esgScore: 94,
    scope3EmissionsTons: 120,
    lastAuditDate: '2026-05-10',
    flaggedRisks: []
  },
  {
    id: 'SUP-2026-102',
    name: 'Caspian Tech Component Logistics',
    country: 'Turkey / Multi-Region',
    category: 'Hardware & Hardware Parts',
    spendEur: 840000,
    csdddStatus: 'High Risk',
    sanctionCheck: 'UNDER_REVIEW',
    esgScore: 52,
    scope3EmissionsTons: 980,
    lastAuditDate: '2026-02-14',
    flaggedRisks: ['Conflict Minerals Declaration Incomplete', 'Third-tier Subcontractor Labor Audit Required']
  },
  {
    id: 'SUP-2026-103',
    name: 'EuroData Enclave Infrastructure GmbH',
    country: 'Germany (EU)',
    category: 'Cloud & IT Services',
    spendEur: 2100000,
    csdddStatus: 'Compliant',
    sanctionCheck: 'CLEARED',
    esgScore: 89,
    scope3EmissionsTons: 310,
    lastAuditDate: '2026-06-01',
    flaggedRisks: []
  },
  {
    id: 'SUP-2026-104',
    name: 'Sino Logistics Global Trade Corp',
    country: 'Hong Kong / APAC',
    category: 'Freight & Supply Chain',
    spendEur: 620000,
    csdddStatus: 'Pending Assessment',
    sanctionCheck: 'CLEARED',
    esgScore: 61,
    scope3EmissionsTons: 1420,
    lastAuditDate: '2025-11-20',
    flaggedRisks: ['Scope 3 Carbon Audit Outstanding']
  },
  {
    id: 'SUP-2026-105',
    name: 'Offshore Cyber Consult LLC',
    country: 'Panama',
    category: 'Consulting Services',
    spendEur: 180000,
    csdddStatus: 'Non-Compliant',
    sanctionCheck: 'FLAGGED',
    esgScore: 38,
    scope3EmissionsTons: 45,
    lastAuditDate: '2025-08-01',
    flaggedRisks: ['Ultimate Beneficial Owner (UBO) Unclear', 'Beneficial Ownership linked to sanctioned PEP list']
  }
];

export const ProcurementCompliance: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'sanctions' | 'po_inspector' | 'ledger' | 'abc_policy'>('overview');
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(INITIAL_SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sanctions Portal state
  const [sanctionsQuery, setSanctionsQuery] = useState('');
  const [sanctionsResult, setSanctionsResult] = useState<any>(null);
  const [isSearchingSanctions, setIsSearchingSanctions] = useState(false);

  // PO Inspector state
  const [poNumber, setPoNumber] = useState('PO-2026-9941');
  const [poVendor, setPoVendor] = useState('Caspian Tech Component Logistics');
  const [poAmount, setPoAmount] = useState('145000');
  const [poDescription, setPoDescription] = useState('Bulk purchase of high-density server rack cables and transceivers shipped via sea freight.');
  const [poScanResult, setPoScanResult] = useState<any>(null);
  const [isScanningPo, setIsScanningPo] = useState(false);

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.csdddStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const compliantCount = suppliers.filter(s => s.csdddStatus === 'Compliant').length;
  const highRiskCount = suppliers.filter(s => s.csdddStatus === 'High Risk' || s.csdddStatus === 'Non-Compliant').length;
  const totalSpend = suppliers.reduce((sum, s) => sum + s.spendEur, 0);

  const handleRunSanctionSearch = () => {
    if (!sanctionsQuery.trim()) return;
    setIsSearchingSanctions(true);
    setSanctionsResult(null);

    setTimeout(() => {
      setIsSearchingSanctions(false);
      const isFlagged = sanctionsQuery.toLowerCase().includes('offshore') ||
                        sanctionsQuery.toLowerCase().includes('panama') ||
                        sanctionsQuery.toLowerCase().includes('oligar') ||
                        sanctionsQuery.toLowerCase().includes('caspian');
      
      setSanctionsResult({
        query: sanctionsQuery,
        matchesFound: isFlagged ? 2 : 0,
        status: isFlagged ? 'FLAGGED_RISK' : 'CLEARED_PEACE_OF_MIND',
        listsChecked: ['EU Consolidated Sanctions List (2026)', 'UN Security Council List', 'OFAC SDN List', 'UK HMT Sanctions List'],
        details: isFlagged ? [
          { list: 'EU Consolidated Sanctions', matchType: 'Beneficial Owner Match (84%)', PEP: 'Yes', action: 'Block payment processing immediately under EU Directive 2024/1226.' },
          { list: 'OFAC SDN List', matchType: 'Secondary Affiliate Match (76%)', PEP: 'High Risk', action: 'Requires Enhanced Due Diligence (EDD) approval.' }
        ] : []
      });
      showToast(isFlagged ? 'Warning: Sanctions risk match identified!' : 'Sanctions screening completed: Cleared.', isFlagged ? 'error' : 'success');
    }, 1000);
  };

  const handleScanPo = () => {
    setIsScanningPo(true);
    setPoScanResult(null);

    setTimeout(() => {
      setIsScanningPo(false);
      setPoScanResult({
        poNumber,
        complianceScore: 74,
        csdddAligned: true,
        antiBriberyPassed: true,
        conflictMineralsRisk: 'MEDIUM',
        scope3ImpactTons: 18.4,
        findings: [
          'Supplier Caspian Tech has an active Conflict Minerals Audit pending.',
          'Spending exceeds €100k threshold - requires dual-approval by Head of Procurement under ABC Directive Section 4.',
          'Shipment route touches non-adequate transit zone (Red Sea / Suez Corridor).'
        ]
      });
      showToast('Purchase Order compliance evaluation complete.', 'info');
    }, 1100);
  };

  const handleExportPDF = () => {
    const headers = ['Supplier ID', 'Name', 'Country', 'Category', 'Annual Spend (€)', 'CSDDD Status', 'Sanction Check', 'ESG Score'];
    const rows = filteredSuppliers.map(s => [
      s.id,
      s.name,
      s.country,
      s.category,
      `€${s.spendEur.toLocaleString()}`,
      s.csdddStatus,
      s.sanctionCheck,
      `${s.esgScore}/100`
    ]);
    generatePdfExport('EuroPrivacy Procurement & Supply Chain Compliance Report', headers, rows, 'procurement-compliance-report');
    showToast('Procurement compliance PDF exported successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <ShoppingCart className="w-4 h-4" />
            EU CSDDD & Anti-Corruption Supply Chain Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Procurement Compliance Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Automate EU Corporate Sustainability Due Diligence Directive (CSDDD), global sanctions screening, PEP checks, Anti-Bribery & Corruption (ABC) controls, and Purchase Order audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Audit Ledger
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Procurement Spend</p>
            <p className="text-2xl font-black text-slate-900 mt-1">€{(totalSpend / 1000000).toFixed(2)}M</p>
            <span className="text-[11px] text-slate-500 font-medium">Across {suppliers.length} Key Suppliers</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">CSDDD Verified</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{compliantCount} / {suppliers.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((compliantCount / suppliers.length) * 100)}% Verified</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sanction & CSDDD Flags</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{highRiskCount}</p>
            <span className="text-[11px] text-rose-600 font-semibold">Action Required</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg ESG Score</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {Math.round(suppliers.reduce((a, s) => a + s.esgScore, 0) / suppliers.length)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </p>
            <span className="text-[11px] text-indigo-600 font-semibold">EU Green Claims Compliant</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Overview & CSDDD Framework
        </button>
        <button
          onClick={() => setActiveTab('sanctions')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'sanctions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-600" />
          Sanctions & PEP Screening Portal
        </button>
        <button
          onClick={() => setActiveTab('po_inspector')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'po_inspector' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          PO & Requisition AI Auditor
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ledger' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Supplier Directory ({filteredSuppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('abc_policy')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'abc_policy' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4 text-indigo-600" />
          Anti-Bribery & Corruption Policy
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                EU DIRECTIVE 2024/1760 (CSDDD) ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">Real-Time Global Sanction Feeds</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sovereign Supply Chain Governance</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Ensure end-to-end compliance with human rights, environmental due diligence, conflict minerals declarations, and anti-bribery regulations across your global procurement network.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Globe className="w-4 h-4" />
                Sanctions & PEP Screening
              </div>
              <p className="text-xs text-slate-500">
                Automated continuous cross-referencing of vendor entities, directors, and UBOs against EU, UN, OFAC, and UK HMT sanctions lists.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Scale className="w-4 h-4" />
                Anti-Bribery & Corruption (ABC)
              </div>
              <p className="text-xs text-slate-500">
                Enforce dual-authorization spending thresholds, anti-kickback policies, and audit trails under EU Whistleblower Directive 2019/1937.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Award className="w-4 h-4" />
                Scope 3 ESG Accounting
              </div>
              <p className="text-xs text-slate-500">
                Track indirect carbon emissions from purchased goods and services to comply with CSRD and EU Green Claims Directives.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANCTIONS PORTAL */}
      {activeTab === 'sanctions' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Real-Time Global Sanctions & PEP Entity Screening
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Search any company, individual, or ultimate beneficial owner (UBO) against active global sanctions databases.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={sanctionsQuery}
              onChange={(e) => setSanctionsQuery(e.target.value)}
              placeholder="Enter company name, registration number, or individual director name..."
              className="flex-1 p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleRunSanctionSearch}
              disabled={isSearchingSanctions || !sanctionsQuery.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSearchingSanctions ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isSearchingSanctions ? 'Screening Databases...' : 'Execute Sanctions Check'}
            </button>
          </div>

          {sanctionsResult && (
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Target Entity</span>
                  <p className="text-base font-black text-slate-900">{sanctionsResult.query}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sanctionsResult.status === 'FLAGGED_RISK' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {sanctionsResult.status === 'FLAGGED_RISK' ? 'SANCTIONS MATCH FOUND' : 'CLEARED - NO MATCH'}
                </span>
              </div>

              {sanctionsResult.details.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase">Identified Regulatory Match Details:</p>
                  {sanctionsResult.details.map((d: any, idx: number) => (
                    <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-bold text-rose-900">
                        <span>List: {d.list}</span>
                        <span>Match Confidence: {d.matchType}</span>
                      </div>
                      <p className="text-rose-700">Enforcement Action: {d.action}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PO INSPECTOR */}
      {activeTab === 'po_inspector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Purchase Order AI Compliance Evaluator
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">PO Number</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor / Counterparty</label>
                <input
                  type="text"
                  value={poVendor}
                  onChange={(e) => setPoVendor(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Value (€)</label>
                <input
                  type="number"
                  value={poAmount}
                  onChange={(e) => setPoAmount(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requisition Item Details</label>
                <textarea
                  rows={3}
                  value={poDescription}
                  onChange={(e) => setPoDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleScanPo}
                disabled={isScanningPo}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isScanningPo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isScanningPo ? 'Evaluating Requisition...' : 'Run Compliance Audit'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              PO Evaluation Results
            </h3>

            {!poScanResult ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">Ready for Purchase Order Inspection</p>
                <p className="text-xs">Enter requisition parameters on the left to evaluate CSDDD, ABC, and Conflict Minerals compliance.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">PO Compliance Score</p>
                    <p className="text-3xl font-black text-amber-600">{poScanResult.complianceScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                      Approval Flagged
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">Scope 3 Impact: {poScanResult.scope3ImpactTons} Tons CO2</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase">Audit Findings:</p>
                  {poScanResult.findings.map((f: string, i: number) => (
                    <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DIRECTORY */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search suppliers by name, ID, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium"
            >
              <option value="all">All CSDDD Statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="Pending Assessment">Pending Assessment</option>
              <option value="High Risk">High Risk</option>
              <option value="Non-Compliant">Non-Compliant</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Annual Spend</th>
                  <th className="p-3">CSDDD Status</th>
                  <th className="p-3">Sanctions Check</th>
                  <th className="p-3">ESG Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{s.id}</td>
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3 text-slate-600">{s.country}</td>
                    <td className="p-3 text-slate-600">{s.category}</td>
                    <td className="p-3 font-bold text-slate-900">€{s.spendEur.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.csdddStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-700' :
                        s.csdddStatus === 'High Risk' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {s.csdddStatus}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-xs">
                      <span className={s.sanctionCheck === 'CLEARED' ? 'text-emerald-600' : 'text-rose-600'}>
                        {s.sanctionCheck}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{s.esgScore} / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ANTI-BRIBERY POLICY */}
      {activeTab === 'abc_policy' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                Anti-Bribery & Corruption Policy Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dual-authorization thresholds, gift & hospitality register, and whistleblower channel governed under EU Directive 2019/1937.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Policy v3.2 ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
              <span className="text-xs font-bold text-indigo-800 uppercase">Spending Threshold</span>
              <p className="text-3xl font-black text-indigo-900">€25K</p>
              <p className="text-xs text-indigo-700">Single approval authority limit before dual sign-off is mandatory.</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase">Gift/Hospitality Cap</span>
              <p className="text-3xl font-black text-amber-900">€150</p>
              <p className="text-xs text-amber-700">Per-counterparty annual register cap; over-cap requires compliance pre-approval.</p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase">Whistleblower Channel</span>
              <p className="text-3xl font-black text-emerald-900">Anon</p>
              <p className="text-xs text-emerald-700">Encrypted confidential reporting to the independent audit committee.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { control: 'Dual Authorization on PO > €25K', owner: 'CFO + Procurement Director', evidence: '51 approvals this quarter', status: 'COMPLIANT' },
              { control: 'Gift & Hospitality Register Declarations', owner: 'All Staff', evidence: '3 declarations logged in Q3', status: 'COMPLIANT' },
              { control: 'Anti-Kickback & P2P Conflict Review', owner: 'Internal Audit', evidence: '38 purchase orders screened', status: 'COMPLIANT' },
              { control: 'Cryptocurrency / Third-Party Fee Monitoring', owner: 'Compliance Ops', evidence: 'Real-time auto-screening feed', status: 'MONITORED' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  {c.status === 'COMPLIANT'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  <div>
                    <p className="font-bold text-slate-900">{c.control}</p>
                    <p className="text-[11px] text-slate-500">Owner: {c.owner} | {c.evidence}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'COMPLIANT' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
