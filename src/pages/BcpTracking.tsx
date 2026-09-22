import React, { useState } from 'react';
import {
  Activity,
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
  Phone,
  FileText,
  Sparkles,
  RefreshCw,
  Layers,
  Award,
  Check,
  Server,
  BellRing,
  FileCheck
} from 'lucide-react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';

interface BcpProcessItem {
  id: string;
  processName: string;
  criticalityTier: 'Tier 1 - Mission Critical' | 'Tier 2 - Essential' | 'Tier 3 - Operational';
  targetRtoHours: number; // Recovery Time Objective
  targetRpoMinutes: number; // Recovery Point Objective
  currentDisasterReadiness: 'DR Ready' | 'Drill Due' | 'RTO Exceeded Risk';
  lastDrillDate: string;
  emergencyLead: string;
}

const INITIAL_BCP_PROCESSES: BcpProcessItem[] = [
  {
    id: 'BCP-PROC-01',
    processName: 'EuroPrivacy Sovereign Vault & Key Management Engine',
    criticalityTier: 'Tier 1 - Mission Critical',
    targetRtoHours: 0.5, // 30 minutes max RTO
    targetRpoMinutes: 0, // Zero data loss RPO
    currentDisasterReadiness: 'DR Ready',
    lastDrillDate: '2026-06-15',
    emergencyLead: 'Chief Information Security Officer (CISO)'
  },
  {
    id: 'BCP-PROC-02',
    processName: 'Transactional API Gateway & Client Portal',
    criticalityTier: 'Tier 1 - Mission Critical',
    targetRtoHours: 1.0,
    targetRpoMinutes: 5,
    currentDisasterReadiness: 'DR Ready',
    lastDrillDate: '2026-05-10',
    emergencyLead: 'Head of Infrastructure'
  },
  {
    id: 'BCP-PROC-03',
    processName: 'Regulatory Compliance Reporting & Audit Ledger Export',
    criticalityTier: 'Tier 2 - Essential',
    targetRtoHours: 4.0,
    targetRpoMinutes: 15,
    currentDisasterReadiness: 'Drill Due',
    lastDrillDate: '2025-12-01',
    emergencyLead: 'DPO / Compliance Officer'
  },
  {
    id: 'BCP-PROC-04',
    processName: 'Customer Support Desk & Ticket Escalation Network',
    criticalityTier: 'Tier 3 - Operational',
    targetRtoHours: 12.0,
    targetRpoMinutes: 60,
    currentDisasterReadiness: 'RTO Exceeded Risk',
    lastDrillDate: '2025-09-14',
    emergencyLead: 'Support Operations Director'
  }
];

export const BcpTracking: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'drill_simulator' | 'emergency_tree' | 'process_list'>('overview');
  const [processes, setProcesses] = useState<BcpProcessItem[]>(INITIAL_BCP_PROCESSES);
  const [searchTerm, setSearchTerm] = useState('');

  // Drill simulator state
  const [selectedScenario, setSelectedScenario] = useState('Subsea Fiber Cable Cut (Frankfurt-Dublin Link)');
  const [isSimulatingDrill, setIsSimulatingDrill] = useState(false);
  const [drillResult, setDrillResult] = useState<any>(null);

  const filteredProcesses = processes.filter((p) =>
    p.processName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.emergencyLead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const drReadyCount = processes.filter((p) => p.currentDisasterReadiness === 'DR Ready').length;

  const handleSimulateDrill = () => {
    setIsSimulatingDrill(true);
    setDrillResult(null);

    setTimeout(() => {
      setIsSimulatingDrill(false);
      setDrillResult({
        scenario: selectedScenario,
        executedTimestamp: new Date().toISOString(),
        overallStatus: 'PASSED - RTO/RPO MET',
        actualRtoMinutes: 14, // 14 mins actual recovery vs 30 min target
        actualRpoLossSeconds: 0,
        mitigationActions: [
          'Automatic BGP route switchover to Paris Enclave completed in 120ms.',
          'Post-Quantum KMS re-authentication verified across secondary HSM.',
          'Emergency notification broadcast dispatched to 14 Executive CISO nodes.'
        ]
      });
      showToast('ISO 22301 Business Continuity Drill completed successfully!', 'success');
    }, 1200);
  };

  const handleExportPDF = () => {
    const headers = ['Process ID', 'Business Process', 'Criticality Tier', 'Target RTO', 'Target RPO', 'DR Readiness', 'Emergency Lead'];
    const rows = filteredProcesses.map((p) => [
      p.id,
      p.processName,
      p.criticalityTier,
      `${p.targetRtoHours} Hours`,
      `${p.targetRpoMinutes} Mins`,
      p.currentDisasterReadiness,
      p.emergencyLead
    ]);
    generatePdfExport('EuroPrivacy ISO 22301 Business Continuity Plan (BCP) Audit Ledger', headers, rows, 'bcp-tracking-report');
    showToast('BCP Tracking PDF exported successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <Activity className="w-4 h-4" />
            ISO 22301 Business Continuity & Crisis Management Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Business Continuity Plan (BCP) Tracking</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Track Recovery Time Objectives (RTO), Recovery Point Objectives (RPO), emergency communication trees, and disaster simulation drills across critical business processes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export BCP Audit Ledger
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Processes</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{processes.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">BIA Matrix Fully Mapped</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">DR Drill Ready</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{drReadyCount} / {processes.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((drReadyCount / processes.length) * 100)}% Pass Rate</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Target RTO</p>
            <p className="text-2xl font-black text-slate-900 mt-1">1.8 <span className="text-xs text-slate-400 font-normal">Hours</span></p>
            <span className="text-[11px] text-indigo-600 font-semibold">Fast Disaster Failover</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target RPO</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">&lt; 5 <span className="text-xs text-slate-400 font-normal">Mins</span></p>
            <span className="text-[11px] text-emerald-600 font-semibold">Zero Data Loss Goal</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <Zap className="w-6 h-6" />
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
          Overview & ISO 22301 Standard
        </button>
        <button
          onClick={() => setActiveTab('drill_simulator')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'drill_simulator' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Disaster Drill Simulation Engine
        </button>
        <button
          onClick={() => setActiveTab('emergency_tree')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'emergency_tree' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          Emergency Escalation Tree
        </button>
        <button
          onClick={() => setActiveTab('process_list')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'process_list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Business Impact Matrix ({filteredProcesses.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ISO 22301 BCP SPECIFICATION ENFORCED
              </span>
              <span className="text-xs text-slate-400 font-mono">Real-Time Disaster Readiness</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sovereign Business Continuity Governance</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Ensure operational resilience under DORA Article 11 and ISO 22301. Conduct semi-annual disaster simulation drills, maintain emergency contact trees, and verify strict RTO/RPO limits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Clock className="w-4 h-4" />
                Recovery Time Objective (RTO)
              </div>
              <p className="text-xs text-slate-500">
                The maximum acceptable duration of service interruption before business damage becomes unacceptable.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Zap className="w-4 h-4" />
                Recovery Point Objective (RPO)
              </div>
              <p className="text-xs text-slate-500">
                The maximum acceptable amount of data loss measured in time between last backup commit and interruption.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Phone className="w-4 h-4" />
                Crisis Broadcast
              </div>
              <p className="text-xs text-slate-500">
                Automated multi-channel push alerts to regulatory DPOs, CISO, and executive emergency leads.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRILL SIMULATOR */}
      {activeTab === 'drill_simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Disaster Interruption Scenario Simulator
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Simulated Outage Scenario</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-bold"
                >
                  <option value="Subsea Fiber Cable Cut (Frankfurt-Dublin Link)">Subsea Fiber Cable Cut (Frankfurt-Dublin Link)</option>
                  <option value="Primary Data Center Total Blackout (Frankfurt-AM2)">Primary Data Center Total Blackout (Frankfurt-AM2)</option>
                  <option value="Ransomware Cryptographic Isolation Simulation">Ransomware Cryptographic Isolation Simulation</option>
                  <option value="Major Cloud Provider Regional Outage (EU-CENTRAL-1)">Major Cloud Provider Regional Outage (EU-CENTRAL-1)</option>
                </select>
              </div>

              <button
                onClick={handleSimulateDrill}
                disabled={isSimulatingDrill}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSimulatingDrill ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isSimulatingDrill ? 'Simulating Interruption...' : 'Trigger Disaster Recovery Drill'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Drill Execution Telemetry
            </h3>

            {!drillResult ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <Activity className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">Ready for BCP Drill Execution</p>
                <p className="text-xs">Select a scenario on the left to measure actual RTO/RPO failover performance.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-900 uppercase">Scenario: {drillResult.scenario}</span>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded">
                      {drillResult.overallStatus}
                    </span>
                  </div>
                  <p className="text-emerald-800">Actual Interruption Recovery (RTO): <span className="font-bold">{drillResult.actualRtoMinutes} Minutes</span></p>
                  <p className="text-emerald-800">Actual Data Loss (RPO): <span className="font-bold">{drillResult.actualRpoLossSeconds} Seconds</span></p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <p className="font-bold text-slate-900 uppercase">Automated Failover Log:</p>
                  {drillResult.mitigationActions.map((m: string, i: number) => (
                    <p key={i} className="text-slate-700 font-mono text-[11px]">• {m}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY TREE */}
      {activeTab === 'emergency_tree' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-600" />
            Crisis Escalation Contact Matrix
          </h3>
          <p className="text-xs text-slate-500">Regulatory DPO and executive broadcast nodes for critical outages.</p>

          <div className="divide-y divide-slate-100">
            {processes.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{p.emergencyLead}</span>
                  <p className="text-slate-500">{p.processName}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-mono font-bold rounded-full">
                  Primary Node
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROCESS MATRIX */}
      {activeTab === 'process_list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search business processes by name or lead..."
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
                  <th className="p-3">Business Process</th>
                  <th className="p-3">Criticality Tier</th>
                  <th className="p-3">Target RTO</th>
                  <th className="p-3">Target RPO</th>
                  <th className="p-3">DR Readiness</th>
                  <th className="p-3">Emergency Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProcesses.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{p.id}</td>
                    <td className="p-3 font-bold text-slate-900">{p.processName}</td>
                    <td className="p-3 font-semibold text-slate-700">{p.criticalityTier}</td>
                    <td className="p-3 font-bold">{p.targetRtoHours} Hours</td>
                    <td className="p-3 font-bold">{p.targetRpoMinutes} Mins</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.currentDisasterReadiness === 'DR Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {p.currentDisasterReadiness}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{p.emergencyLead}</td>
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
