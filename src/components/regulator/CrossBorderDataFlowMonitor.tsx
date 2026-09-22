import React, { useState } from 'react';
import { 
  Globe, 
  ArrowRightLeft, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Search, 
  Download, 
  Lock, 
  Activity, 
  RefreshCw,
  Server,
  Layers,
  Zap,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

interface DataFlowRecord {
  id: string;
  sourceRegion: string;
  destinationRegion: string;
  dataType: string;
  volume: string;
  legalBasis: string;
  status: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
  latencyMs: number;
  lastTransfer: string;
}

export const CrossBorderDataFlowMonitor: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [flows, setFlows] = useState<DataFlowRecord[]>([
    {
      id: 'FLOW-8012',
      sourceRegion: 'EU-West (Frankfurt)',
      destinationRegion: 'US-East (N. Virginia)',
      dataType: 'Customer Support Logs (PII Masked)',
      volume: '1.4 GB/hr',
      legalBasis: 'EU-US Data Privacy Framework (DPF)',
      status: 'COMPLIANT',
      latencyMs: 84,
      lastTransfer: '1 min ago'
    },
    {
      id: 'FLOW-8013',
      sourceRegion: 'EU-West (Dublin)',
      destinationRegion: 'US-West (Oregon)',
      dataType: 'Raw Biometric Authentication Tokens',
      volume: '420 MB/hr',
      legalBasis: 'Standard Contractual Clauses (SCC) - Pending TIA',
      status: 'VIOLATION',
      latencyMs: 142,
      lastTransfer: 'Just now'
    },
    {
      id: 'FLOW-8014',
      sourceRegion: 'APAC (Singapore)',
      destinationRegion: 'EU-Central (Frankfurt)',
      dataType: 'Financial Transaction Audit Ledger',
      volume: '8.2 GB/hr',
      legalBasis: 'Adequacy Decision + Sovereign Enclave Encryption',
      status: 'COMPLIANT',
      latencyMs: 198,
      lastTransfer: '3 mins ago'
    },
    {
      id: 'FLOW-8015',
      sourceRegion: 'EU-Central (Frankfurt)',
      destinationRegion: 'APAC (Tokyo)',
      dataType: 'Telemetry & Anonymized Analytics',
      volume: '3.1 GB/hr',
      legalBasis: 'Binding Corporate Rules (BCR)',
      status: 'WARNING',
      latencyMs: 220,
      lastTransfer: '5 mins ago'
    }
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const filteredFlows = flows.filter(f => {
    const matchesStatus = filterStatus === 'ALL' || f.status === filterStatus;
    const matchesSearch = 
      f.sourceRegion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.destinationRegion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.dataType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.legalBasis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Cross-Border Flows</p>
            <p className="text-xl font-bold text-slate-100 mt-1">28 Active Routes</p>
            <p className="text-xs text-slate-400 mt-1">Monitored 24/7 by Sovereign Gateway</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Compliant Egress</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">92.8%</p>
            <p className="text-xs text-emerald-500/80 mt-1">DPF & BCR Certified</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Boundary Violations</p>
            <p className="text-xl font-bold text-rose-400 mt-1">1 Critical</p>
            <p className="text-xs text-rose-400/80 mt-1">Sovereign Boundary Alert Triggered</p>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Hourly Throughput</p>
            <p className="text-xl font-bold text-amber-400 mt-1">13.1 GB/hr</p>
            <p className="text-xs text-slate-400 mt-1">Encrypted in Hardware Enclaves</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <ArrowRightLeft className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Cross-Border Sovereign Data Flow Monitor</h3>
            <p className="text-xs text-slate-400">Real-time inspection of international transfers, adequacy legal bases, and sovereign enclave egress limits.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search flows, regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 space-x-1 text-xs">
            {['ALL', 'COMPLIANT', 'WARNING', 'VIOLATION'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  filterStatus === status 
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Data Flow Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Flow ID</th>
                <th className="p-3">Source Region</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Data Category</th>
                <th className="p-3">Legal Basis</th>
                <th className="p-3">Throughput</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredFlows.map((flow) => (
                <tr key={flow.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-amber-400">{flow.id}</td>
                  <td className="p-3">
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-200">
                      {flow.sourceRegion}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-200">
                      {flow.destinationRegion}
                    </span>
                  </td>
                  <td className="p-3">{flow.dataType}</td>
                  <td className="p-3 text-slate-400">{flow.legalBasis}</td>
                  <td className="p-3 font-bold text-slate-200">{flow.volume}</td>
                  <td className="p-3">
                    {flow.status === 'COMPLIANT' && (
                      <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>COMPLIANT</span>
                      </span>
                    )}
                    {flow.status === 'WARNING' && (
                      <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>REVIEW REQ</span>
                      </span>
                    )}
                    {flow.status === 'VIOLATION' && (
                      <span className="inline-flex items-center space-x-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        <span>BOUNDARY VIOLATION</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold border border-slate-700 transition-colors">
                      Inspect Flow
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
