import React from 'react';
import { Lock, ShieldCheck, Key, Server } from 'lucide-react';

interface QuantumAuditLogProps {
  logs?: Array<{
    id?: string;
    keyId?: string;
    algorithm?: string;
    action?: string;
    node?: string;
    timestamp?: string;
    status?: string;
  }>;
}

export const QuantumAuditLog: React.FC<QuantumAuditLogProps> = ({ logs: propLogs }) => {
  const defaultLogs = [
    { id: 'Q-LOG-901', algorithm: 'ML-KEM-768', action: 'Key Encapsulation Handshake', node: 'eu-central-1', timestamp: '1 min ago' },
    { id: 'Q-LOG-900', algorithm: 'Falcon-512', action: 'Dossier Conformance Signature', node: 'eu-west-3', timestamp: '8 mins ago' },
    { id: 'Q-LOG-899', algorithm: 'ML-DSA-65', action: 'B2G Statutory Filing Seal', node: 'eu-west-1', timestamp: '24 mins ago' },
  ];

  const logs = propLogs || defaultLogs;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Post-Quantum Cryptographic Audit Ledger</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">NIST PQC algorithm execution and signature stream</p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
          FIPS 203 / 204 Compliant
        </span>
      </div>

      <div className="space-y-2">
        {logs.map((log, idx) => (
          <div key={log.id || (log as any).keyId || idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{log.id || (log as any).keyId || `LOG-${idx}`}</span>
                <span className="font-mono text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                  {log.algorithm || 'ML-KEM-768'}
                </span>
              </div>
              <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{log.action || (log as any).status || 'Cryptographic Operation'}</div>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-400">
              <div>{log.node || 'eu-central-1'}</div>
              <div>{log.timestamp || 'Just now'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default QuantumAuditLog;
