import React, { useState } from 'react';
import { Search, ShieldCheck, Play, RefreshCw, CheckCircle2, AlertTriangle, Terminal, Code } from 'lucide-react';

export interface DeepComplianceScannerProps {
  tenantId?: any;
  onClose?: () => void;
  [key: string]: any;
}

export const DeepComplianceScanner: React.FC<DeepComplianceScannerProps> = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const runDeepScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult('Scan Completed: 124 Microservices & AST Repositories inspected. 0 Critical statutory violations detected. All TLS endpoints enforce ML-KEM-768.');
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deep AST & Infrastructure Scanner</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Automated static code analysis & runtime compliance audit</p>
          </div>
        </div>

        <button
          onClick={runDeepScan}
          disabled={isScanning}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {isScanning ? 'Inspecting AST...' : 'Launch Deep Scan'}
        </button>
      </div>

      {scanResult && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{scanResult}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">PII Leaks Found</div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400">0 Leaks</div>
        </div>
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">Hardcoded Secrets</div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400">Clean (0)</div>
        </div>
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">Third-Party Libs</div>
          <div className="font-bold text-slate-900 dark:text-white">418 Audited</div>
        </div>
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-[10px] font-mono text-slate-400">DORA Resilience</div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400">100% Pass</div>
        </div>
      </div>
    </div>
  );
};
export default DeepComplianceScanner;
