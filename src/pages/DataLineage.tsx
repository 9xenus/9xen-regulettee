import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Network, 
  Database, 
  ArrowRight, 
  Search, 
  Filter, 
  ShieldCheck, 
  Activity, 
  Layers, 
  FileJson,
  Plus,
  Zap,
  Target,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { DataLineageGraph } from '../components/DataLineageGraph';

interface DataNode {
  id: string;
  name: string;
  type: 'Source' | 'Transformation' | 'Sink';
  status: 'ACTIVE' | 'AUDITED' | 'RISK';
  description: string;
  owner: string;
}

export const DataLineage: React.FC = () => {
  const [nodes] = useState<DataNode[]>([
    { id: '1', name: 'User_Registration_DB', type: 'Source', status: 'ACTIVE', description: 'Primary relational store for auth data.', owner: 'Core_Dev_Team' },
    { id: '2', name: 'PII_Masking_Service', type: 'Transformation', status: 'AUDITED', description: 'AES-256 field-level encryption service.', owner: 'Security_Ops' },
    { id: '3', name: 'Compliance_Vault_v1', type: 'Sink', status: 'ACTIVE', description: 'DORA-compliant immutable record store.', owner: 'Privacy_Officer' },
    { id: '4', name: 'Legacy_Logs_Export', type: 'Sink', status: 'RISK', description: 'Unencrypted backup exported to S3.', owner: 'System_Arch' }
  ]);

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-8 h-8 text-indigo-600" />
            Data Lineage & Governance
          </h1>
          <p className="text-slate-500 text-sm mt-1 italic">
            Integrated <strong>Apache Atlas</strong> metadata management and flow visualization.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm">
            <FileJson className="w-3.5 h-3.5" />
            Export Atlas Manifest
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200">
            <Plus className="w-3.5 h-3.5" />
            New Entity
          </button>
        </div>
      </div>

      {/* Visual Lineage Map (Real-time) */}
      <div className="rounded-[2rem] overflow-hidden shadow-2xl">
        <DataLineageGraph />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-indigo-500" />
              Metadata Catalog
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search entities..." 
                className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {nodes.map((node) => (
              <div key={node.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${node.status === 'RISK' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {node.type === 'Source' ? <Database className="w-5 h-5" /> : node.type === 'Transformation' ? <Zap className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{node.name}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${node.status === 'RISK' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                        {node.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{node.description}</div>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold mb-4 italic flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Policy as Code (OPA)
            </h3>
            <p className="text-indigo-100 text-xs leading-relaxed mb-6">
              Lineage flows are dynamically restricted based on <strong>Open Policy Agent</strong> rules. Data never leaves jurisdictions without cryptographic proof.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-indigo-200 uppercase tracking-widest">Enforcement Score</span>
                <span>98.4%</span>
              </div>
              <div className="w-full h-1 bg-indigo-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '98.4%' }}
                  className="h-full bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4" />
              Compliance Insight
            </h3>
            <p className="text-[11px] text-slate-600 leading-normal italic">
              "Apache Atlas provides a common metadata framework for the entire Hadoop ecosystem, which we've extended here for modern cross-border CaaS operations."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
