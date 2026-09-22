import React from 'react';
import { Share2, ArrowRight, ShieldCheck, Database, Server, Lock } from 'lucide-react';

export const DataLineageGraph: React.FC = () => {
  const nodes = [
    { name: 'Client Ingress API', type: 'TLS 1.3 ML-KEM Ingress', icon: Server },
    { name: 'Zero-Knowledge Enclave', type: 'PII Redaction & Art. 9 Isolation', icon: Lock },
    { name: 'Sovereign Postgres Vault', type: 'AES-256-GCM + WORM Audit', icon: Database },
    { name: 'B2G / Regulatory Gateway', type: 'National CSIRT / DPA Conduit', icon: ShieldCheck },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Data Lineage Graph</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">End-to-end data provenance & cryptographic transit pipeline</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
          Provenance Validated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          return (
            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-900 dark:text-white truncate">{node.name}</div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">{node.type}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DataLineageGraph;
