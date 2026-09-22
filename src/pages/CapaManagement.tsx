import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Download,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  FileText,
  Sparkles,
  RefreshCw,
  Layers,
  Award,
  Check,
  Users,
  Target,
  Sliders,
  CheckSquare,
  FileCheck
} from 'lucide-react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';

interface CapaItem {
  id: string;
  title: string;
  source: 'Internal Audit' | 'External Regulatory Finding' | 'Security Incident' | 'Whistleblower Report';
  severity: 'Critical' | 'Major' | 'Minor';
  rootCauseMethod: '5 Whys AI Analysis' | 'Ishikawa Fishbone' | 'Manual Investigation';
  rootCauseSummary: string;
  assignedOwner: string;
  dueDate: string;
  status: 'Open' | 'Under Investigation' | 'Action Pending' | 'Verification' | 'Closed';
  effectivenessVerified: boolean;
}

const INITIAL_CAPAS: CapaItem[] = [
  {
    id: 'CAPA-2026-081',
    title: 'KMS Key Rotation Schedule Exceeded 90-Day Policy',
    source: 'Internal Audit',
    severity: 'Major',
    rootCauseMethod: '5 Whys AI Analysis',
    rootCauseSummary: 'Cron trigger failed silently on secondary HSM enclave without alerting SecOps Slack channel.',
    assignedOwner: 'DevOps Security Lead',
    dueDate: '2026-08-01',
    status: 'Action Pending',
    effectivenessVerified: false
  },
  {
    id: 'CAPA-2026-082',
    title: 'Unsanctioned SaaS Workspace Access Detected in Marketing',
    source: 'Security Incident',
    severity: 'Critical',
    rootCauseMethod: '5 Whys AI Analysis',
    rootCauseSummary: 'OAuth SSO restriction policy lacked enforcement rule for non-EU email domains.',
    assignedOwner: 'IAM Team Lead',
    dueDate: '2026-07-25',
    status: 'Under Investigation',
    effectivenessVerified: false
  },
  {
    id: 'CAPA-2026-083',
    title: 'Incomplete DPA Executed with Vendor SendFast',
    source: 'External Regulatory Finding',
    severity: 'Minor',
    rootCauseMethod: 'Ishikawa Fishbone',
    rootCauseSummary: 'Legacy legal template selected prior to EU Standard Contractual Clauses (SCC) 2021 update.',
    assignedOwner: 'Compliance Officer',
    dueDate: '2026-06-15',
    status: 'Closed',
    effectivenessVerified: true
  }
];

export const CapaManagement: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'board' | 'root_cause' | 'capa_list'>('board');
  const [capas, setCapas] = useState<CapaItem[]>(INITIAL_CAPAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Root cause generator state
  const [problemDescription, setProblemDescription] = useState('Database replication latency spike in Frankfurt node causing transient unencrypted logging.');
  const [isAnalyzingRootCause, setIsAnalyzingRootCause] = useState(false);
  const [aiRootCause, setAiRootCause] = useState<any>(null);

  const filteredCapas = capas.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.assignedOwner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const openCount = capas.filter((c) => c.status !== 'Closed').length;
  const criticalCount = capas.filter((c) => c.severity === 'Critical' && c.status !== 'Closed').length;

  const handleRun5Whys = () => {
    if (!problemDescription.trim()) return;
    setIsAnalyzingRootCause(true);
    setAiRootCause(null);

    setTimeout(() => {
      setIsAnalyzingRootCause(false);
      setAiRootCause({
        problem: problemDescription,
        whys: [
          '1. Why did the latency spike? -> Database transaction log buffer overflowed.',
          '2. Why did the buffer overflow? -> Replicated network socket experienced TCP backpressure.',
          '3. Why backpressure? -> PQC key re-exchange payload size exceeded MTU threshold.',
          '4. Why MTU exceeded? -> Jumbo frames disabled on newly provisioned cloud network interface.',
          '5. ROOT CAUSE: Infrastructure Terraform script omitted `enable_jumbo_frames=true` flag for EU-CENTRAL enclave.'
        ],
        recommendedAction: 'Update Terraform template module `sovereignty-net-v2` and redeploy enclave router config.',
        preventiveControl: 'Add automated CI/CD linter rule enforcing MTU check before enclave deployment.'
      });
      showToast('AI 5-Whys Root Cause Analysis completed successfully.', 'success');
    }, 1200);
  };

  const handleExportPDF = () => {
    const headers = ['CAPA ID', 'Title', 'Source', 'Severity', 'Assigned Owner', 'Due Date', 'Status', 'Verified'];
    const rows = filteredCapas.map((c) => [
      c.id,
      c.title,
      c.source,
      c.severity,
      c.assignedOwner,
      c.dueDate,
      c.status,
      c.effectivenessVerified ? 'Yes' : 'No'
    ]);
    generatePdfExport('EuroPrivacy Corrective & Preventive Action (CAPA) Audit Ledger', headers, rows, 'capa-management-report');
    showToast('CAPA Audit PDF exported successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <Target className="w-4 h-4" />
            ISO 9001 / ISO 27001 & FDA 21 CFR PART 820 CAPA ENGINE
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Corrective & Preventive Action (CAPA)</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Track root cause investigations (5 Whys & Ishikawa Fishbone), action plan execution, effectiveness verification, and cryptographic sign-off ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CAPA Ledger
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total CAPAs Logged</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{capas.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">100% Audit Traceability</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Open CAPAs</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{openCount}</p>
            <span className="text-[11px] text-amber-600 font-semibold">Action Required</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Open Severity</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</p>
            <span className="text-[11px] text-rose-600 font-semibold">Priority SLA</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Effectiveness Verified</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {capas.filter((c) => c.effectivenessVerified).length} / {capas.length}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold">ISO Audit Ready</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm font-bold">
        <button
          onClick={() => setActiveTab('board')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'board' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          CAPA Status Lifecycle Board
        </button>
        <button
          onClick={() => setActiveTab('root_cause')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'root_cause' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          AI 5-Whys Root Cause Analyzer
        </button>
        <button
          onClick={() => setActiveTab('capa_list')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'capa_list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          CAPA Master Directory ({filteredCapas.length})
        </button>
      </div>

      {/* TAB 1: BOARD */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Open', 'Under Investigation', 'Action Pending', 'Closed'].map((status) => (
            <div key={status} className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{status}</span>
                <span className="px-2 py-0.5 bg-white text-slate-800 text-[10px] font-bold rounded-full border border-slate-200">
                  {capas.filter((c) => c.status === status).length}
                </span>
              </div>

              <div className="space-y-3">
                {capas
                  .filter((c) => c.status === status)
                  .map((c) => (
                    <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] font-bold text-slate-400">{c.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            c.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {c.severity}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{c.title}</p>
                      <p className="text-[11px] text-slate-500">Owner: {c.assignedOwner}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ROOT CAUSE */}
      {activeTab === 'root_cause' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              AI 5-Whys Root Cause Generator
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Observed Audit Defect / Incident</label>
                <textarea
                  rows={4}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleRun5Whys}
                disabled={isAnalyzingRootCause}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzingRootCause ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isAnalyzingRootCause ? 'Executing 5-Whys Analysis...' : 'Perform 5-Whys Root Cause AI Analysis'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Root Cause & Action Plan Output
            </h3>

            {!aiRootCause ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <Target className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">Ready for Root Cause Analysis</p>
                <p className="text-xs">Describe an incident on the left to generate systematic 5-Whys and preventive actions.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <p className="font-bold text-slate-900 uppercase">Systematic 5-Whys Sequence:</p>
                  {aiRootCause.whys.map((w: string, i: number) => (
                    <p key={i} className="text-slate-700 font-mono text-[11px]">{w}</p>
                  ))}
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-emerald-900">
                  <p className="font-bold uppercase">Recommended Corrective Action Plan:</p>
                  <p>{aiRootCause.recommendedAction}</p>
                  <p className="font-bold pt-1">Preventive Control Automation:</p>
                  <p>{aiRootCause.preventiveControl}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DIRECTORY */}
      {activeTab === 'capa_list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search CAPAs by title, ID, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-medium"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCapas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{c.id}</td>
                    <td className="p-3 font-bold text-slate-900">{c.title}</td>
                    <td className="p-3 text-slate-600">{c.source}</td>
                    <td className="p-3 font-semibold text-slate-700">{c.severity}</td>
                    <td className="p-3 text-slate-600">{c.assignedOwner}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{c.dueDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">{c.status}</span>
                    </td>
                    <td className="p-3 font-bold">{c.effectivenessVerified ? '✓ Yes' : 'Pending'}</td>
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
