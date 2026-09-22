import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Zap, RefreshCw, CheckCircle2, AlertTriangle, 
  Cpu, ArrowRight, Layers, Lock, Globe, Terminal, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UpgradeModule {
  id: string;
  nameEn: string;
  nameBn: string;
  status: 'OPTIMIZED' | 'UPGRADING' | 'QUEUED';
  aiConfidence: string;
  impact: string;
}

export const AutonomousRegTechUpgradeSuite: React.FC = () => {
  const [locale, setLocale] = useState<'en' | 'bn'>('en');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [modules, setModules] = useState<UpgradeModule[]>([
    { id: 'mod-1', nameEn: 'AI Autonomous Policy Alignment (EU AI Act & NIS2)', nameBn: 'এআই অটোনমাস পলিসি অ্যালাইনমেন্ট (ইইউ এআই অ্যাক্ট ও এনআইএস২)', status: 'OPTIMIZED', aiConfidence: '99.4%', impact: 'Zero Drift' },
    { id: 'mod-2', nameEn: 'Cross-Border DSR Auto-Routing Shards', nameBn: 'ক্রস-বর্ডার ডিএসআর অটো-রাউটিং শার্ডস', status: 'OPTIMIZED', aiConfidence: '98.9%', impact: 'Sub-30ms Routing' },
    { id: 'mod-3', nameEn: 'FastAPI Zero-Downtime Migration Engine', nameBn: 'ফাস্টএপিআই জিরো-ডাউনটাইম মাইগ্রেশন ইঞ্জিন', status: 'OPTIMIZED', aiConfidence: '100%', impact: 'Async FastAPI v3' },
    { id: 'mod-4', nameEn: 'Quantum-Resistant PII Encryption Vault', nameBn: 'কোয়ান্টাম-রেজিস্ট্যান্ট পিআইআই এনক্রিপশন ভল্ট', status: 'OPTIMIZED', aiConfidence: '99.8%', impact: 'AES-256 / Kyber' }
  ]);

  const [upgradeLogs, setUpgradeLogs] = useState<string[]>([
    '[2026-09-10 03:47:00 UTC] Autonomous RegTech Upgrade Suite active.',
    '[VERIFIED] All 4 sovereignty shards and FastAPI endpoints operating at peak efficiency.'
  ]);

  const triggerAutonomousUpgrade = () => {
    setIsUpgrading(true);
    setModules(prev => prev.map(m => ({ ...m, status: 'UPGRADING' })));
    setUpgradeLogs(prev => [`[${new Date().toISOString()}] Initiating Autonomous AI Remediation & Shard Optimization...`, ...prev]);

    setTimeout(() => {
      setModules(prev => prev.map(m => ({ ...m, status: 'OPTIMIZED', aiConfidence: `${(99 + Math.random() * 0.9).toFixed(1)}%` })));
      setIsUpgrading(false);
      setUpgradeLogs(prev => [
        `[${new Date().toISOString()}] Autonomous upgrade completed successfully across all regions.`,
        ...prev
      ]);
    }, 1600);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-2xl text-purple-600 dark:text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {locale === 'bn' ? 'অটোনমাস রেগটেক এআই আপগ্রেড স্যুট' : 'Autonomous RegTech AI Copilot & Remediation Suite'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                AI Copilot v4.2
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'bn' ? 'স্বয়ংক্রিয় কমপ্লায়েন্স রিমিডিয়েশন এবং জিরো-ট্রাস্ট পলিসি অপ্টিমাইজেশন' : 'Automated compliance remediation, policy alignment & zero-trust optimization'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {locale === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button
            onClick={triggerAutonomousUpgrade}
            disabled={isUpgrading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isUpgrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isUpgrading 
              ? (locale === 'bn' ? 'আপগ্রেড চলছে...' : 'Optimizing Shards...') 
              : (locale === 'bn' ? 'অটোনমাস এআই আপগ্রেড রান করুন' : 'Run Autonomous AI Upgrade')}
          </button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map(mod => (
          <div key={mod.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400">
                <Cpu className="w-4 h-4" />
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                mod.status === 'OPTIMIZED'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 animate-pulse'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {mod.status}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
              {locale === 'bn' ? mod.nameBn : mod.nameEn}
            </h4>
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">AI Confidence: <strong className="text-purple-600 dark:text-purple-400 font-mono">{mod.aiConfidence}</strong></span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{mod.impact}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-purple-500" />
            {locale === 'bn' ? 'এআই কোপাইলট রিয়েল-টাইম লগ' : 'AI Copilot Real-Time Remediation Stream'}
          </span>
          <span className="text-[10px] font-mono text-slate-400">Autonomous Core v4.2</span>
        </div>
        <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs space-y-1.5 max-h-40 overflow-y-auto border border-slate-800 shadow-inner">
          {upgradeLogs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-purple-400 shrink-0">&gt;</span>
              <span className={log.includes('VERIFIED') || log.includes('successfully') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutonomousRegTechUpgradeSuite;
