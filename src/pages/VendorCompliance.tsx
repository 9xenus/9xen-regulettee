import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Building,
  FileText,
  Sparkles,
  RefreshCw,
  Layers,
  Award,
  Check,
  Activity,
  Send,
  Calendar,
  FileCheck
} from 'lucide-react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';

interface VendorItem {
  id: string;
  name: string;
  serviceCategory: string;
  tier: 'Tier 1 - Mission Critical' | 'Tier 2 - Operational' | 'Tier 3 - Low Impact';
  soc2Status: 'Verified (Type II)' | 'Pending Review' | 'Expired';
  iso27001Status: 'Certified' | 'Not Certified';
  doraIctStatus: 'DORA Compliant' | 'Remediation Required';
  lastQuestionnaireDate: string;
  breachNoticeSlaHours: number; // NIS2 mandates 24h initial notice
  certExpiryDate: string;
}

const INITIAL_VENDORS: VendorItem[] = [
  {
    id: 'VND-2026-001',
    name: 'CloudScale Database Infrastructure',
    serviceCategory: 'Cloud Relational Database Cluster',
    tier: 'Tier 1 - Mission Critical',
    soc2Status: 'Verified (Type II)',
    iso27001Status: 'Certified',
    doraIctStatus: 'DORA Compliant',
    lastQuestionnaireDate: '2026-06-01',
    breachNoticeSlaHours: 24,
    certExpiryDate: '2027-06-01'
  },
  {
    id: 'VND-2026-002',
    name: 'SendFast Transactional Email API',
    serviceCategory: 'Customer Mail Delivery Gateway',
    tier: 'Tier 2 - Operational',
    soc2Status: 'Pending Review',
    iso27001Status: 'Certified',
    doraIctStatus: 'Remediation Required',
    lastQuestionnaireDate: '2025-11-15',
    breachNoticeSlaHours: 72, // Exceeds NIS2 24h initial notice requirement!
    certExpiryDate: '2026-09-30'
  },
  {
    id: 'VND-2026-003',
    name: 'SecureAuth Identity Provider Enclave',
    serviceCategory: 'Single Sign-On & OAuth Vault',
    tier: 'Tier 1 - Mission Critical',
    soc2Status: 'Verified (Type II)',
    iso27001Status: 'Certified',
    doraIctStatus: 'DORA Compliant',
    lastQuestionnaireDate: '2026-05-20',
    breachNoticeSlaHours: 24,
    certExpiryDate: '2027-01-15'
  },
  {
    id: 'VND-2026-004',
    name: 'Marketing Social Campaign Analytics',
    serviceCategory: 'Public Marketing Tracking',
    tier: 'Tier 3 - Low Impact',
    soc2Status: 'Expired',
    iso27001Status: 'Not Certified',
    doraIctStatus: 'Remediation Required',
    lastQuestionnaireDate: '2024-08-10',
    breachNoticeSlaHours: 120,
    certExpiryDate: '2026-04-01'
  }
];

export const VendorCompliance: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'questionnaire' | 'certs' | 'vendor_list'>('overview');
  const [vendors, setVendors] = useState<VendorItem[]>(INITIAL_VENDORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  // Questionnaire Dispatch state
  const [dispatchVendorId, setDispatchVendorId] = useState('VND-2026-002');
  const [isDispatching, setIsDispatching] = useState(false);

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || v.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const compliantCount = vendors.filter((v) => v.doraIctStatus === 'DORA Compliant').length;
  const highRiskCount = vendors.filter((v) => v.tier === 'Tier 1 - Mission Critical' && v.doraIctStatus !== 'DORA Compliant').length;

  const handleDispatchQuestionnaire = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setVendors((prev) =>
        prev.map((v) =>
          v.id === dispatchVendorId
            ? { ...v, lastQuestionnaireDate: new Date().toISOString().split('T')[0], soc2Status: 'Verified (Type II)' }
            : v
        )
      );
      showToast('Automated NIS2 & DORA Security Questionnaire dispatched to vendor.', 'success');
    }, 1100);
  };

  const handleExportPDF = () => {
    const headers = ['Vendor ID', 'Vendor Name', 'Category', 'Tier', 'SOC 2 Status', 'ISO 27001', 'DORA Status', 'Breach SLA'];
    const rows = filteredVendors.map((v) => [
      v.id,
      v.name,
      v.serviceCategory,
      v.tier,
      v.soc2Status,
      v.iso27001Status,
      v.doraIctStatus,
      `${v.breachNoticeSlaHours}h`
    ]);
    generatePdfExport('EuroPrivacy NIS2 & DORA Third-Party Vendor Risk Audit Report', headers, rows, 'vendor-compliance-report');
    showToast('Vendor Compliance PDF exported successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <Users className="w-4 h-4" />
            NIS2 Article 21 & DORA Third-Party ICT Risk Framework
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Vendor & Third-Party Compliance</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Audit third-party SaaS vendors, cloud service providers, and critical ICT suppliers against NIS2 Directive Article 21 and DORA resilience mandates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Vendor Risk Ledger
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monitored Vendors</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{vendors.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">100% Supply Chain Coverage</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">DORA ICT Compliant</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{compliantCount} / {vendors.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((compliantCount / vendors.length) * 100)}% Pass Rate</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier 1 Critical Gaps</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{highRiskCount}</p>
            <span className="text-[11px] text-rose-600 font-semibold">Immediate Audit Needed</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ISO 27001 Certified</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {vendors.filter((v) => v.iso27001Status === 'Certified').length} / {vendors.length}
            </p>
            <span className="text-[11px] text-indigo-600 font-semibold">Verified Security Baseline</span>
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
          Overview & NIS2 Framework
        </button>
        <button
          onClick={() => setActiveTab('questionnaire')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'questionnaire' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4 text-indigo-600" />
          Questionnaire Dispatch Portal
        </button>
        <button
          onClick={() => setActiveTab('certs')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'certs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-600" />
          Certificate Expiry Tracker
        </button>
        <button
          onClick={() => setActiveTab('vendor_list')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'vendor_list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Vendor Roster ({filteredVendors.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                NIS2 ARTICLE 21 & DORA REGULATION ENFORCED
              </span>
              <span className="text-xs text-slate-400 font-mono">Continuous Supply Chain Audits</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Third-Party ICT Risk & Supply Chain Defense</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Under NIS2 and DORA, financial and essential entities are legally responsible for the cybersecurity vulnerabilities of their vendor software stack. Continuously monitor certifications, breach notification SLAs, and security posture.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Clock className="w-4 h-4" />
                24-Hour Breach SLA (NIS2)
              </div>
              <p className="text-xs text-slate-500">
                Ensure contracts legally enforce a 24-hour initial incident notification SLA for any breach impacting your data.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Building className="w-4 h-4" />
                Criticality Tiering Matrix
              </div>
              <p className="text-xs text-slate-500">
                Classify vendors as Tier 1 (Mission Critical), Tier 2 (Operational), or Tier 3 (Low Impact) to focus audit resources.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Award className="w-4 h-4" />
                Certificate Validation (ISO / SOC2)
              </div>
              <p className="text-xs text-slate-500">
                Automated tracking of SOC 2 Type II audit reports and ISO 27001 certificates with automatic renewal dispatch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONNAIRE */}
      {activeTab === 'questionnaire' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              Automated NIS2 & DORA Security Questionnaire Dispatch
            </h3>
            <p className="text-xs text-slate-500 mt-1">Send standardized cybersecurity questionnaires to third-party vendors and track completion status.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Vendor</label>
                <select
                  value={dispatchVendorId}
                  onChange={(e) => setDispatchVendorId(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.tier})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDispatchQuestionnaire}
                disabled={isDispatching}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 self-end"
              >
                {isDispatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isDispatching ? 'Dispatching Assessment...' : 'Dispatch Automated Audit Questionnaire'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CERTS */}
      {activeTab === 'certs' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            Vendor Security Certificate Expiry Ledger
          </h3>
          <p className="text-xs text-slate-500">
            Track SOC 2 Type II, ISO 27001, C5, and FedRAMP expiration dates to prevent compliance gaps.
          </p>

          <div className="divide-y divide-slate-100">
            {vendors.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{v.name}</span>
                  <p className="text-slate-500">{v.serviceCategory} | {v.tier}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-700">Expires: {v.certExpiryDate}</span>
                  <p className="text-[10px] text-emerald-600 font-semibold">{v.soc2Status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROSTER */}
      {activeTab === 'vendor_list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search vendors by name, ID, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium"
            >
              <option value="all">All Criticality Tiers</option>
              <option value="Tier 1 - Mission Critical">Tier 1 - Mission Critical</option>
              <option value="Tier 2 - Operational">Tier 2 - Operational</option>
              <option value="Tier 3 - Low Impact">Tier 3 - Low Impact</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Service Category</th>
                  <th className="p-3">Criticality Tier</th>
                  <th className="p-3">SOC 2 Status</th>
                  <th className="p-3">ISO 27001</th>
                  <th className="p-3">DORA ICT Status</th>
                  <th className="p-3">Breach SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{v.id}</td>
                    <td className="p-3 font-bold text-slate-900">{v.name}</td>
                    <td className="p-3 text-slate-600">{v.serviceCategory}</td>
                    <td className="p-3 font-semibold text-slate-700">{v.tier}</td>
                    <td className="p-3 font-semibold text-slate-700">{v.soc2Status}</td>
                    <td className="p-3 font-semibold text-slate-700">{v.iso27001Status}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.doraIctStatus === 'DORA Compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {v.doraIctStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{v.breachNoticeSlaHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
