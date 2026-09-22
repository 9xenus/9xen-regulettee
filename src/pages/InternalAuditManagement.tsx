import React, { useState } from 'react';
import {
  FileText,
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
  BookOpen,
  Sparkles,
  RefreshCw,
  Layers,
  Award,
  Check,
  Calendar,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { generatePdfExport, generateSignedPdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';

interface AuditEngagementItem {
  id: string;
  title: string;
  standard: 'ISO 27001:2022' | 'SOC 2 Type II' | 'GDPR Art 30' | 'DORA Regulation' | 'EU CSDDD';
  leadAuditor: string;
  scope: string;
  scheduledQuarter: 'Q1 2026' | 'Q2 2026' | 'Q3 2026' | 'Q4 2026';
  fieldworkStatus: 'Planning' | 'Fieldwork Active' | 'Draft Report' | 'Final Signed';
  findingsCount: number;
  digitalSignature: string;
}

const INITIAL_AUDITS: AuditEngagementItem[] = [
  {
    id: 'AUD-2026-01',
    title: 'ISO 27001 Annex A.8 Cryptographic Key Lifecycle Audit',
    standard: 'ISO 27001:2022',
    leadAuditor: 'Dr. Elena Rostova (Lead ISO Auditor)',
    scope: 'Frankfurt & Dublin HSM enclaves, PQC key rotation policies, and key custodianship.',
    scheduledQuarter: 'Q2 2026',
    fieldworkStatus: 'Final Signed',
    findingsCount: 1,
    digitalSignature: 'SIG-AUD-8891-ISO'
  },
  {
    id: 'AUD-2026-02',
    title: 'DORA Article 11 ICT Third-Party Resilience Examination',
    standard: 'DORA Regulation',
    leadAuditor: 'Marcus Vance (CISA)',
    scope: 'Top 10 Tier-1 cloud vendors, SLA breach notifications, and disaster failover logs.',
    scheduledQuarter: 'Q3 2026',
    fieldworkStatus: 'Fieldwork Active',
    findingsCount: 3,
    digitalSignature: 'PENDING_FIELDWORK'
  },
  {
    id: 'AUD-2026-03',
    title: 'GDPR Article 30 Records of Processing Activities (ROPA)',
    standard: 'GDPR Art 30',
    leadAuditor: 'Sophia Al-Mansoor (EU DPO Certification)',
    scope: 'Data subjects consent flows, cross-border adequacy checks, and data minimization.',
    scheduledQuarter: 'Q1 2026',
    fieldworkStatus: 'Final Signed',
    findingsCount: 0,
    digitalSignature: 'SIG-AUD-1042-GDPR'
  },
  {
    id: 'AUD-2026-04',
    title: 'EU CSDDD Scope 3 Supplier Labor & Human Rights Review',
    standard: 'EU CSDDD',
    leadAuditor: 'Jean-Luc Picard (CSRD Compliance Specialist)',
    scope: 'Offshore hardware manufacturing partners, conflict minerals, and ESG accounting.',
    scheduledQuarter: 'Q4 2026',
    fieldworkStatus: 'Planning',
    findingsCount: 0,
    digitalSignature: 'NOT_STARTED'
  }
];

const WORKPAPERS = [
  { id: 'WP-27001-01', control: 'ISMS Access Control (Annex A.5.15)', engagement: 'ISO 27001:2022 Crypto Lifecycle', sampleSize: 40, exceptions: 0, rating: 'Effective', reviewer: 'Dr. Elena Rostova' },
  { id: 'WP-27001-02', control: 'PQC Key Rotation Policy', engagement: 'ISO 27001:2022 Crypto Lifecycle', sampleSize: 25, exceptions: 1, rating: 'Needs Improvement', reviewer: 'Dr. Elena Rostova' },
  { id: 'WP-DORA-01', control: 'ICT Third-Party SLA Breach Notifications', engagement: 'DORA Art. 11 Resilience', sampleSize: 35, exceptions: 2, rating: 'Ineffective', reviewer: 'Marcus Vance' },
  { id: 'WP-DORA-02', control: 'Disaster Failover Log Verification', engagement: 'DORA Art. 11 Resilience', sampleSize: 12, exceptions: 0, rating: 'Effective', reviewer: 'Marcus Vance' },
  { id: 'WP-GDPR-01', control: 'Record of Processing Activities (ROPA)', engagement: 'GDPR Art. 30 ROPA', sampleSize: 50, exceptions: 0, rating: 'Effective', reviewer: 'Sophia Al-Mansoor' },
  { id: 'WP-GDPR-02', control: 'Retention & Erasure Schedules', engagement: 'GDPR Art. 30 ROPA', sampleSize: 20, exceptions: 0, rating: 'Effective', reviewer: 'Sophia Al-Mansoor' },
];

export const InternalAuditManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'report_gen' | 'workpapers' | 'audit_universe'>('overview');
  const [audits, setAudits] = useState<AuditEngagementItem[]>(INITIAL_AUDITS);
  const [searchTerm, setSearchTerm] = useState('');

  // Report Generator state
  const [selectedAuditId, setSelectedAuditId] = useState('AUD-2026-01');
  const [reportTitle, setReportTitle] = useState('INDEPENDENT INTERNAL AUDIT OPINION');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [signedReportText, setSignedReportText] = useState<string | null>(null);

  const filteredAudits = audits.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.leadAuditor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedAudits = audits.filter((a) => a.fieldworkStatus === 'Final Signed').length;

  const handleGenerateSignedReport = () => {
    setIsGeneratingReport(true);
    setSignedReportText(null);

    setTimeout(() => {
      setIsGeneratingReport(false);
      const target = audits.find((a) => a.id === selectedAuditId) || audits[0];
      const reportContent = `OFFICIAL INTERNAL AUDIT REPORT & INDEPENDENT OPINION
Issued pursuant to ISO 19011 & IIA Professional Standards

ENGAGEMENT ID: ${target.id}
AUDIT TITLE: ${target.title}
GOVERNING STANDARD: ${target.standard}
LEAD AUDITOR: ${target.leadAuditor}
AUDIT SCOPE: ${target.scope}

EXECUTIVE OPINION SUMMARY:
Based on testing performed during ${target.scheduledQuarter}, the control environment is determined to be SATISFACTORY WITH MINOR REMEDIATION.

FINDINGS IDENTIFIED: ${target.findingsCount} Defect(s) logged and automatically linked to CAPA Management Module.

CRYPTOGRAPHIC NON-REPUDIATION SIGNATURE:
Digital Signature Hash: ${target.digitalSignature}
Audit Vault Proof: 0x7c99...e412 (Timestamped on Sovereign Audit Ledger)
Date Signed: ${new Date().toLocaleDateString()}`;

      setSignedReportText(reportContent);
      showToast('Digitally signed Internal Audit Report generated.', 'success');
    }, 1200);
  };

  const handleExportPDF = () => {
    const headers = ['Audit ID', 'Title', 'Standard', 'Lead Auditor', 'Quarter', 'Status', 'Findings', 'Digital Signature'];
    const rows = filteredAudits.map((a) => [
      a.id,
      a.title,
      a.standard,
      a.leadAuditor,
      a.scheduledQuarter,
      a.fieldworkStatus,
      a.findingsCount,
      a.digitalSignature
    ]);
    generatePdfExport('EuroPrivacy ISO 19011 Internal Audit Universe & Engagement Ledger', headers, rows, 'internal-audit-report');
    showToast('Internal Audit PDF report exported successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <BookOpen className="w-4 h-4" />
            ISO 19011 & IIA Professional Internal Audit Framework
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Internal Audit Management</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Manage the annual audit universe, conduct fieldwork control testing, generate digitally signed audit reports, and push findings directly to CAPA remediation.
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Audit Universe</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{audits.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">100% Risk-Based Coverage</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Final Signed Reports</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completedAudits} / {audits.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((completedAudits / audits.length) * 100)}% Execution Rate</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identified Defect Findings</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {audits.reduce((acc, a) => acc + a.findingsCount, 0)}
            </p>
            <span className="text-[11px] text-amber-600 font-semibold">Linked to CAPA Module</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Auditor Pool</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">3 <span className="text-xs text-slate-400 font-normal">Certified</span></p>
            <span className="text-[11px] text-indigo-600 font-semibold">ISO & CISA Credentials</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
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
          Overview & ISO 19011 Framework
        </button>
        <button
          onClick={() => setActiveTab('report_gen')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'report_gen' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Digitally Signed Audit Report Generator
        </button>
        <button
          onClick={() => setActiveTab('audit_universe')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'audit_universe' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Annual Audit Universe ({filteredAudits.length})
        </button>
        <button
          onClick={() => setActiveTab('workpapers')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'workpapers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4 text-amber-600" />
          Control Testing Workpapers
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO 19011 & IIA AUDIT STANDARDS ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">Independent Assurance Portal</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sovereign Internal Audit Governance</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Provide independent, objective assurance to executive board members, regulators, and external auditors regarding the adequacy and effectiveness of internal controls across all compliance domains.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                Risk-Based Audit Universe
              </div>
              <p className="text-xs text-slate-500">
                Prioritize audit engagements based on underlying system criticality, regulatory exposure, and past incident history.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <FileCheck className="w-4 h-4" />
                Control Workpaper Testing
              </div>
              <p className="text-xs text-slate-500">
                Document sample testing evidence, control effectiveness ratings, and auditor workpapers in a tamper-proof ledger.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Award className="w-4 h-4" />
                Non-Repudiation Digital Signatures
              </div>
              <p className="text-xs text-slate-500">
                Cryptographically sign audit reports using lead auditor credentials to prevent retroactive tampering or unauthorized modification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORT GENERATOR */}
      {activeTab === 'report_gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Digital Audit Opinion & Report Signer
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Engagement to Sign</label>
                <select
                  value={selectedAuditId}
                  onChange={(e) => setSelectedAuditId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-bold"
                >
                  {audits.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateSignedReport}
                disabled={isGeneratingReport}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                {isGeneratingReport ? 'Cryptographically Signing Report...' : 'Generate & Digitally Sign Audit Opinion'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Signed Internal Audit Opinion Document
            </h3>

            {!signedReportText ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <FileText className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">Ready for Internal Audit Sign-Off</p>
                <p className="text-xs">Select an engagement on the left to issue a cryptographically signed audit report.</p>
              </div>
            ) : (
              <textarea
                rows={13}
                readOnly
                value={signedReportText}
                className="w-full p-4 border border-slate-200 rounded-xl font-mono text-xs bg-slate-50 text-slate-800 focus:outline-none"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WORKPAPERS */}
      {activeTab === 'workpapers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-600" />
                Control Sample Testing & Workpaper Repository
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sampling matrices, evidence trails, and control effectiveness ratings stored in the tamper-proof audit ledger.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              {WORKPAPERS.filter((w) => w.rating === 'Effective').length}/{WORKPAPERS.length} Controls Effective
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase">Effective Controls</span>
              <p className="text-3xl font-black text-emerald-900">{WORKPAPERS.filter((w) => w.rating === 'Effective').length}</p>
              <p className="text-xs text-emerald-700">Sufficient evidence obtained; no material defect.</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase">Needs Improvement</span>
              <p className="text-3xl font-black text-amber-900">{WORKPAPERS.filter((w) => w.rating === 'Needs Improvement').length}</p>
              <p className="text-xs text-amber-700">Gaps identified; remediation owner assigned.</p>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-rose-800 uppercase">Ineffective</span>
              <p className="text-3xl font-black text-rose-900">{WORKPAPERS.filter((w) => w.rating === 'Ineffective').length}</p>
              <p className="text-xs text-rose-700">Material weakness escalated to audit committee.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3">Workpaper ID</th>
                  <th className="p-3">Control Tested</th>
                  <th className="p-3">Engagement</th>
                  <th className="p-3">Sample Size</th>
                  <th className="p-3">Exceptions</th>
                  <th className="p-3">Effectiveness Rating</th>
                  <th className="p-3">Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {WORKPAPERS.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{w.id}</td>
                    <td className="p-3 font-bold text-slate-900">{w.control}</td>
                    <td className="p-3 text-slate-600">{w.engagement}</td>
                    <td className="p-3 font-bold text-slate-800">{w.sampleSize}</td>
                    <td className="p-3 font-bold">{w.exceptions > 0 ? <span className="text-rose-600">{w.exceptions}</span> : <span className="text-emerald-600">0</span>}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.rating === 'Effective'
                            ? 'bg-emerald-100 text-emerald-700'
                            : w.rating === 'Needs Improvement'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {w.rating}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{w.reviewer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-slate-800">All workpapers are block-anchored and reviewed by the lead auditor before final report signing.</p>
              <p className="text-[11px] text-slate-500">Evidence acknowledged via digital signature SIG-AUD-WP ledger per ISO 19011 §6.4.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT UNIVERSE */}
      {activeTab === 'audit_universe' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search audit universe by title, lead auditor, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Engagement Title</th>
                  <th className="p-3">Standard</th>
                  <th className="p-3">Lead Auditor</th>
                  <th className="p-3">Quarter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Findings</th>
                  <th className="p-3">Digital Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAudits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{a.id}</td>
                    <td className="p-3 font-bold text-slate-900">{a.title}</td>
                    <td className="p-3 text-slate-600">{a.standard}</td>
                    <td className="p-3 text-slate-600">{a.leadAuditor}</td>
                    <td className="p-3 font-bold text-slate-800">{a.scheduledQuarter}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.fieldworkStatus === 'Final Signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {a.fieldworkStatus}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{a.findingsCount} Defect(s)</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">{a.digitalSignature}</td>
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
