import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Activity, RefreshCw, CheckCircle2, 
  AlertTriangle, FileCheck2, Terminal, Database, ArrowRight, Key
} from 'lucide-react';
import EvidenceVaultAuditorEngine, { VaultAuditLogEntry } from '../services/evidenceVaultAuditor';

export const EvidenceVaultAuditorWidget: React.FC = () => {
  const [locale, setLocale] = useState<'en' | 'bn'>('en');
  const [logs, setLogs] = useState<VaultAuditLogEntry[]>(EvidenceVaultAuditorEngine.getAuditLedger());
  const [integrityStatus, setIntegrityStatus] = useState(EvidenceVaultAuditorEngine.verifyLedgerIntegrity());
  const [simulating, setSimulating] = useState(false);

  const handleSimulateOperation = (op: 'INSERT' | 'SELECT' | 'UPDATE' | 'DELETE') => {
    setSimulating(true);
    setTimeout(() => {
      EvidenceVaultAuditorEngine.interceptOperation(
        op,
        'vault_sovereign_eu_01',
        `rec_${Math.random().toString(36).substring(2, 8)}`,
        op === 'DELETE' ? 'auditor_officer_alpha' : 'system_agent_007',
        { action: op, targetTable: 'evidence_records', confidence: 0.99 }
      );
      setLogs(EvidenceVaultAuditorEngine.getAuditLedger());
      setIntegrityStatus(EvidenceVaultAuditorEngine.verifyLedgerIntegrity());
      setSimulating(false);
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {locale === 'bn' ? 'এভিডেন্স ভল্ট অডিটর ও সাইন্ড লেজার' : 'Evidence Vault Middleware Auditor & Signed Ledger'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                integrityStatus.valid 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {integrityStatus.valid ? (locale === 'bn' ? 'চেইন ভ্যালিড (SHA-256)' : 'Chain Verified (SHA-256)') : 'Chain Compromised'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'bn' ? 'রেগুলেটর ড্যাশবোর্ডের জন্য রিয়েল-টাইম ডাটাবেজ অপারেশন ইন্টারসেপ্টর ও ক্রিপ্টোগ্রাফিক লেজার' : 'Real-time database operation interceptor & cryptographic ledger for regulator oversight'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {locale === 'en' ? 'বাংলা' : 'English'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleSimulateOperation('INSERT')}
              disabled={simulating}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              + {locale === 'bn' ? 'ইনসার্ট' : 'Insert'}
            </button>
            <button
              onClick={() => handleSimulateOperation('UPDATE')}
              disabled={simulating}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              ~ {locale === 'bn' ? 'আপডেট' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <span>{locale === 'bn' ? 'সাইন্ড অডিট লেজার এন্ট্রি' : 'Signed Cryptographic Audit Entries'} ({logs.length})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">HMAC-SHA256 Signed</span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[380px] overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    log.operation === 'INSERT' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    log.operation === 'UPDATE' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                    log.operation === 'DELETE' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                    'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {log.operation}
                  </span>
                  <span className="text-xs font-mono text-slate-900 dark:text-white font-semibold">
                    {log.recordId}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    [{log.vaultId}]
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
                  <span>Actor: <strong className="text-slate-700 dark:text-slate-300">{log.actorId}</strong></span>
                  <span>•</span>
                  <span>Sig: <span className="text-indigo-600 dark:text-indigo-400">{log.signature.substring(0, 16)}...</span></span>
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-end justify-between w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvidenceVaultAuditorWidget;
