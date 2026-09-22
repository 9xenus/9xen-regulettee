import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, RefreshCw, Key, Lock, Copy, Check } from 'lucide-react';

export const ProveModule: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofHash, setProofHash] = useState<string>('0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');
  const [copied, setCopied] = useState(false);

  const generateProof = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setProofHash(`0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`);
      setIsGenerating(false);
    }, 900);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proofHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero-Knowledge Statutory Proof Generator</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Cryptographic audit verification without exposing underlying PII</p>
          </div>
        </div>

        <button
          onClick={generateProof}
          disabled={isGenerating}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {isGenerating ? 'Synthesizing Proof...' : 'Mint ZK Proof'}
        </button>
      </div>

      <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">Groth16 / Snark Verifier Hash</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Hash'}
          </button>
        </div>
        <div className="font-mono text-xs text-emerald-400 break-all">{proofHash}</div>
      </div>
    </div>
  );
};
export default ProveModule;
