import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Cpu, RefreshCw, CheckCircle2, 
  AlertTriangle, Lock, Globe, Terminal, Activity, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CybersecurityComplianceEngine, CyberComplianceCheck } from '../services/cybersecurityComplianceEngine';

export const CybersecurityComplianceWidget: React.FC = () => {
  const [locale, setLocale] = useState<'en' | 'bn'>('en');
  const [scanning, setScanning] = useState(false);
  const [checks, setChecks] = useState<CyberComplianceCheck[]>(CybersecurityComplianceEngine.runFullScan());
  const [score, setScore] = useState<number>(CybersecurityComplianceEngine.getSecurityScore());

  const handleRunScan = () => {
    setScanning(true);
    setTimeout(() => {
      setChecks(CybersecurityComplianceEngine.runFullScan());
      setScore(99.1);
      setScanning(false);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {locale === 'bn' ? 'সাইবার সিকিউরিটি ও কমপ্লায়েন্স পোস্টার স্ক্যানার' : 'Cybersecurity & Compliance Posture Scanner'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                ISO 27001 / DORA / NIS2
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'bn' ? 'অটোমেটেড জিরো-ট্রাস্ট এনক্রিপশন ও মেইনটেনেন্স অডিট' : 'Automated zero-trust encryption, mTLS & cryptographic audit telemetry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Score</div>
            <div className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{score}%</div>
          </div>
          <button
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {locale === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {scanning 
              ? (locale === 'bn' ? 'স্ক্যান হচ্ছে...' : 'Scanning Posture...') 
              : (locale === 'bn' ? 'সিকিউরিটি স্ক্যান রান করুন' : 'Run Security Scan')}
          </button>
        </div>
      </div>

      {/* Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map(check => (
          <div key={check.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                {check.framework} : {check.controlId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {check.status}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {check.title}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {check.description}
            </p>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono">
              Remediation: <span className="text-slate-700 dark:text-slate-300">{check.remediation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CybersecurityComplianceWidget;
