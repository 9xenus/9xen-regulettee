import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Layers, Sliders } from 'lucide-react';

interface MatrixRow {
  domain: string;
  gdpr: 'PASS' | 'WARN' | 'FAIL';
  aiAct: 'PASS' | 'WARN' | 'FAIL';
  dora: 'PASS' | 'WARN' | 'FAIL';
  nis2: 'PASS' | 'WARN' | 'FAIL';
  description: string;
}

export const ComplianceMatrix: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL'>('ALL');

  const rows: MatrixRow[] = [
    { domain: 'Cryptographic Protection & Post-Quantum TLS', gdpr: 'PASS', aiAct: 'PASS', dora: 'PASS', nis2: 'PASS', description: 'ML-KEM-768 quantum safe session handshake across edge routers' },
    { domain: 'Immutable Audit Logging & Merkle Trees', gdpr: 'PASS', aiAct: 'PASS', dora: 'PASS', nis2: 'PASS', description: 'WORM-compliant SHA-256 regulatory ledger stream' },
    { domain: 'Automated DSAR & Data Minimization', gdpr: 'PASS', aiAct: 'PASS', dora: 'PASS', nis2: 'PASS', description: 'Zero-knowledge anonymization with 30-day statutory SLA guarantee' },
    { domain: 'High-Risk AI Model Bias & Lineage Telemetry', gdpr: 'PASS', aiAct: 'PASS', dora: 'PASS', nis2: 'PASS', description: 'Article 10 data validation & human-in-the-loop override controls' },
    { domain: 'Multi-Cloud ICT Failover & Resilience (RTO < 15m)', gdpr: 'PASS', aiAct: 'PASS', dora: 'PASS', nis2: 'PASS', description: 'Hot-standby cross-region replication with automated health checks' },
    { domain: 'Early Warning CSIRT 24-Hour Dispatch', gdpr: 'PASS', aiAct: 'PASS', dora: 'PASS', nis2: 'PASS', description: 'Direct webhook conduit to national competent CSIRT agencies' }
  ];

  const renderBadge = (status: 'PASS' | 'WARN' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">PASS</span>;
      case 'WARN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">REVIEW</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">FAIL</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Cross-Regulation Matrix</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Harmonized control mapping across EU directives</p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 font-bold">
          24/24 Controls Verified
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-400">
              <th className="py-2.5 px-3">Control Domain & Safeguard</th>
              <th className="py-2.5 px-3 text-center">GDPR</th>
              <th className="py-2.5 px-3 text-center">AI Act</th>
              <th className="py-2.5 px-3 text-center">DORA</th>
              <th className="py-2.5 px-3 text-center">NIS2</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{row.domain}</div>
                  <div className="text-[11px] text-slate-400">{row.description}</div>
                </td>
                <td className="py-2.5 px-3 text-center">{renderBadge(row.gdpr)}</td>
                <td className="py-2.5 px-3 text-center">{renderBadge(row.aiAct)}</td>
                <td className="py-2.5 px-3 text-center">{renderBadge(row.dora)}</td>
                <td className="py-2.5 px-3 text-center">{renderBadge(row.nis2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ComplianceMatrix;
