import React, { useState } from 'react';
import {
  Server,
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
  Database,
  FileText,
  Sparkles,
  RefreshCw,
  Layers,
  Award,
  Check,
  HardDrive,
  Activity,
  FileCheck
} from 'lucide-react';
import { generatePdfExport } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';

interface DrNodeItem {
  id: string;
  clusterName: string;
  primaryRegion: string;
  secondaryEnclave: string;
  replicationLagMs: number;
  backupVaultStatus: 'Air-Gapped & Immutable' | 'Syncing' | 'Verification Outstanding';
  failoverStatus: 'Standby Ready' | 'Active Failover Test' | 'Sync Lag Alert';
  pqcEnvelopeProtected: boolean;
  lastBackupHash: string;
}

const INITIAL_DR_NODES: DrNodeItem[] = [
  {
    id: 'DR-NODE-01',
    clusterName: 'Primary Cloud Spanner PostgreSQL Database',
    primaryRegion: 'Frankfurt (EU-CENTRAL-1)',
    secondaryEnclave: 'Dublin (EU-WEST-1 Vault)',
    replicationLagMs: 12,
    backupVaultStatus: 'Air-Gapped & Immutable',
    failoverStatus: 'Standby Ready',
    pqcEnvelopeProtected: true,
    lastBackupHash: '0x9a8f...4e12'
  },
  {
    id: 'DR-NODE-02',
    clusterName: 'Audit Ledger System Event Vault',
    primaryRegion: 'Frankfurt (EU-CENTRAL-1)',
    secondaryEnclave: 'Paris (EU-WEST-3 Enclave)',
    replicationLagMs: 8,
    backupVaultStatus: 'Air-Gapped & Immutable',
    failoverStatus: 'Standby Ready',
    pqcEnvelopeProtected: true,
    lastBackupHash: '0x3c12...89bf'
  },
  {
    id: 'DR-NODE-03',
    clusterName: 'Sovereign HSM Key Custody Replica',
    primaryRegion: 'Frankfurt HSM',
    secondaryEnclave: 'Zurich Swiss Vault',
    replicationLagMs: 45,
    backupVaultStatus: 'Air-Gapped & Immutable',
    failoverStatus: 'Standby Ready',
    pqcEnvelopeProtected: true,
    lastBackupHash: '0xfe77...11aa'
  },
  {
    id: 'DR-NODE-04',
    clusterName: 'Analytics Cold Storage Archive',
    primaryRegion: 'Frankfurt (EU-CENTRAL-1)',
    secondaryEnclave: 'Amsterdam Enclave',
    replicationLagMs: 820, // High lag!
    backupVaultStatus: 'Verification Outstanding',
    failoverStatus: 'Sync Lag Alert',
    pqcEnvelopeProtected: false,
    lastBackupHash: '0x12bb...99cc'
  }
];

export const DrTracking: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'failover_sim' | 'backups' | 'node_list'>('overview');
  const [nodes, setNodes] = useState<DrNodeItem[]>(INITIAL_DR_NODES);
  const [searchTerm, setSearchTerm] = useState('');

  // Failover simulator state
  const [targetNode, setTargetNode] = useState('DR-NODE-01');
  const [isExecutingFailover, setIsExecutingFailover] = useState(false);
  const [failoverReport, setFailoverReport] = useState<any>(null);

  const filteredNodes = nodes.filter(
    (n) =>
      n.clusterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.primaryRegion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const standbyReadyCount = nodes.filter((n) => n.failoverStatus === 'Standby Ready').length;

  const handleExecuteFailover = () => {
    setIsExecutingFailover(true);
    setFailoverReport(null);

    setTimeout(() => {
      setIsExecutingFailover(false);
      const selected = nodes.find((n) => n.id === targetNode) || nodes[0];
      setFailoverReport({
        nodeId: selected.id,
        clusterName: selected.clusterName,
        failoverRegion: selected.secondaryEnclave,
        switchoverTimeMs: 140,
        dataLossSeconds: 0,
        pqcVerified: true,
        status: 'SUCCESS - ENCLAVE ACTIVE'
      });
      showToast('Disaster Recovery Region Failover executed with ZERO data loss!', 'success');
    }, 1200);
  };

  const handleExportPDF = () => {
    const headers = ['Node ID', 'Cluster Name', 'Primary Region', 'Secondary Enclave', 'Replication Lag', 'Backup Status', 'Failover Status', 'PQC Enforced'];
    const rows = filteredNodes.map((n) => [
      n.id,
      n.clusterName,
      n.primaryRegion,
      n.secondaryEnclave,
      `${n.replicationLagMs}ms`,
      n.backupVaultStatus,
      n.failoverStatus,
      n.pqcEnvelopeProtected ? 'Yes' : 'No'
    ]);
    generatePdfExport('EuroPrivacy Disaster Recovery (DR) & Replication Audit Ledger', headers, rows, 'dr-tracking-report');
    showToast('DR Tracking PDF report exported successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">
            <Server className="w-4 h-4" />
            DORA Article 11 & ISO 27031 Disaster Recovery
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Disaster Recovery (DR) Tracking</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Monitor real-time database replication latency, execute automated multi-region enclave failovers, and verify immutable air-gapped backups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export DR Ledger
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Replicated Clusters</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{nodes.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">Multi-Region Active/Standby</span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Server className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standby Ready</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{standbyReadyCount} / {nodes.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((standbyReadyCount / nodes.length) * 100)}% Pass Rate</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Sync Latency</p>
            <p className="text-2xl font-black text-slate-900 mt-1">16 <span className="text-xs text-slate-400 font-normal">ms</span></p>
            <span className="text-[11px] text-emerald-600 font-semibold">Near-Instant Replication</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Immutable Backups</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              {nodes.filter((n) => n.backupVaultStatus === 'Air-Gapped & Immutable').length} / {nodes.length}
            </p>
            <span className="text-[11px] text-indigo-600 font-semibold">Ransomware Protected</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            <HardDrive className="w-6 h-6" />
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
          Overview & DORA Article 11
        </button>
        <button
          onClick={() => setActiveTab('failover_sim')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'failover_sim' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Live Failover Switchover Simulator
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'backups' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4 text-emerald-600" />
          Air-Gapped Backup Vault
        </button>
        <button
          onClick={() => setActiveTab('node_list')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'node_list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          Replication Cluster Roster ({filteredNodes.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                DORA ARTICLE 11 DISASTER RECOVERY ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">Continuous Replication Stream</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sovereign Data Center Failover Engine</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Execute automated failovers between primary European enclaves (Frankfurt) and secondary DR locations (Dublin, Paris, Zurich) with zero downtime and post-quantum encryption envelope protection.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Zap className="w-4 h-4" />
                Sub-Second Latency Offset
              </div>
              <p className="text-xs text-slate-500">
                Continuous WAL (Write-Ahead Logging) streaming across dedicated European fiber rings maintains sub-20ms lag.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <HardDrive className="w-4 h-4" />
                Air-Gapped Ransomware Vault
              </div>
              <p className="text-xs text-slate-500">
                Immutable WORM (Write Once Read Many) storage prevents ransomware encryptions from corrupting recovery snapshots.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Server className="w-4 h-4" />
                Automated Rollback Test
              </div>
              <p className="text-xs text-slate-500">
                Validate seamless failback to primary cluster following incident resolution without data divergence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FAILOVER SIMULATOR */}
      {activeTab === 'failover_sim' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Primary-to-Secondary Failover Switchover
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Target Database Cluster</label>
                <select
                  value={targetNode}
                  onChange={(e) => setTargetNode(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-bold"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.clusterName} ({n.id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExecuteFailover}
                disabled={isExecutingFailover}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExecutingFailover ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                {isExecutingFailover ? 'Executing Region Switchover...' : 'Initiate Automated Failover'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Failover Switchover Results
            </h3>

            {!failoverReport ? (
              <div className="p-16 text-center text-slate-400 space-y-2">
                <Server className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">Ready for Failover Simulation</p>
                <p className="text-xs">Select a cluster on the left to test region failover to secondary enclave.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-900 uppercase">Target: {failoverReport.clusterName}</span>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded">
                      {failoverReport.status}
                    </span>
                  </div>
                  <p className="text-emerald-800">Switchover Duration: <span className="font-bold">{failoverReport.switchoverTimeMs} ms</span></p>
                  <p className="text-emerald-800">New Primary Enclave: <span className="font-bold">{failoverReport.failoverRegion}</span></p>
                  <p className="text-emerald-800">PQC Key Envelope Verified: <span className="font-bold">✓ Active</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP VAULT */}
      {activeTab === 'backups' && (
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-600" />
            Immutable Air-Gapped Backup Vault Ledger
          </h3>
          <p className="text-xs text-slate-500">
            Verify SHA-256 cryptographic hashes and point-in-time recovery points across sovereign cloud vaults.
          </p>

          <div className="divide-y divide-slate-100">
            {nodes.map((n) => (
              <div key={n.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{n.clusterName}</span>
                  <p className="text-slate-500">Hash: {n.lastBackupHash} | {n.secondaryEnclave}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold rounded-full">
                  {n.backupVaultStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROSTER */}
      {activeTab === 'node_list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 sm:p-5 lg:p-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search DR clusters by name, region, or ID..."
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
                  <th className="p-3">Cluster Name</th>
                  <th className="p-3">Primary Region</th>
                  <th className="p-3">Secondary Enclave</th>
                  <th className="p-3">Sync Lag</th>
                  <th className="p-3">Backup Vault</th>
                  <th className="p-3">Failover Status</th>
                  <th className="p-3">PQC Enforced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNodes.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">{n.id}</td>
                    <td className="p-3 font-bold text-slate-900">{n.clusterName}</td>
                    <td className="p-3 text-slate-600">{n.primaryRegion}</td>
                    <td className="p-3 text-slate-600">{n.secondaryEnclave}</td>
                    <td className="p-3 font-mono font-bold">{n.replicationLagMs}ms</td>
                    <td className="p-3 font-semibold text-slate-700">{n.backupVaultStatus}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          n.failoverStatus === 'Standby Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {n.failoverStatus}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{n.pqcEnvelopeProtected ? '✓ Kyber-768' : 'Standard'}</td>
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
