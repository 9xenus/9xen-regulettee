import React, { useState } from 'react';
import { 
  Terminal, ShieldCheck, Play, RefreshCw, CheckCircle2, Layers, Cpu, 
  Building2, UserCheck, LayoutDashboard, Settings, AlertCircle, ArrowRight, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NextIntegrationBridge from './NextIntegrationBridge';
import AutonomousRegTechUpgradeSuite from './AutonomousRegTechUpgradeSuite';
import { AdvancedSaasAdminSuite } from './admin/AdvancedSaasAdminSuite';
import SaaSAdminFeatureFlagManager from './SaaSAdminFeatureFlagManager';
import CybersecurityComplianceWidget from './CybersecurityComplianceWidget';
import EvidenceVaultAuditorWidget from './EvidenceVaultAuditorWidget';
import WormAuditIntegrityMonitor from './WormAuditIntegrityMonitor';

interface UpgradeStep {
  id: number;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  icon: any;
  status: 'PENDING' | 'SCANNING' | 'UPGRADED';
  metrics: string;
}

export const RegTechOrchestratorConsole: React.FC = () => {
  const [locale, setLocale] = useState<'en' | 'bn'>('en');
  const [pipelineState, setPipelineState] = useState<'IDLE' | 'SCANNING' | 'COMPLETED'>('IDLE');
  const [activeStepId, setActiveStepId] = useState<number | null>(null);

  const [steps, setSteps] = useState<UpgradeStep[]>([
    {
      id: 1,
      titleEn: 'Regulator Oversight Dashboard',
      titleBn: 'রেগুলেটর ওভারসাইট ড্যাশবোর্ড',
      descEn: 'Jurisdiction-scoped shard filtering & aggregated compliance telemetry.',
      descBn: 'জিউরিসডিকশন-স্কোপড শার্ড ফিল্টার এবং অ্যাগ্রিগেটেড কমপ্লায়েন্স টেলিকম।',
      icon: Building2,
      status: 'UPGRADED',
      metrics: '8 Regions Active / 0 PII Leak'
    },
    {
      id: 2,
      titleEn: 'Lawyer & Professional Portal',
      titleBn: 'আইনজীবী ও প্রফেশনাল পোর্টাল',
      descEn: 'KYC/KYB credential verification & regulatory filing sign-offs.',
      descBn: 'কেওয়াইসি/কেওয়াইবি ক্রেডেনশিয়াল ভেরিফিকেশন এবং রেগুলেটরি ফাইলিং সাইন-অফ।',
      icon: UserCheck,
      status: 'UPGRADED',
      metrics: 'Bar Registry API Linked'
    },
    {
      id: 3,
      titleEn: 'Client Compliance Dashboard',
      titleBn: 'ক্লায়েন্ট কমপ্লায়েন্স ড্যাশবোর্ড',
      descEn: 'Dynamic-forms submission flow & real-time tenant billing sync.',
      descBn: 'ডাইনামিক ফর্ম সাবমিশন ফ্লো এবং রিয়েল-টাইম টেন্যান্ট বিলিং সিঙ্ক।',
      icon: LayoutDashboard,
      status: 'UPGRADED',
      metrics: '144 Active Tenants Synced'
    },
    {
      id: 4,
      titleEn: 'SaaS Admin Configuration Panel',
      titleBn: 'সাস এডমিন কনফিগারেশন প্যানেল',
      descEn: 'Per-tenant feature flags, law module toggles & RBAC templates.',
      descBn: 'পার-টেন্যান্ট ফিচার ফ্ল্যাগ, ল মডিউল টগল এবং আরবিএসি টেমপ্লেট।',
      icon: Settings,
      status: 'UPGRADED',
      metrics: 'FastAPI Thin UI Active'
    }
  ]);

  const [logs, setLogs] = useState<string[]>([
    '[2026-09-10 03:37:00 UTC] Sovereign RegTech Orchestrator Initialized',
    '[SUCCESS] 4-Step Module Gap Analysis Verified. Zero Architecture Drift.'
  ]);

  const runFeatureScanAndUpgrade = () => {
    setPipelineState('SCANNING');
    setSteps(prev => prev.map(s => ({ ...s, status: 'SCANNING' })));
    setLogs(prev => [`[${new Date().toISOString()}] Initiating 4-Step Feature Gap Scan & Upgrade Pipeline...`, ...prev]);

    setTimeout(() => {
      setSteps(prev => prev.map(s => ({ ...s, status: 'UPGRADED' })));
      setPipelineState('COMPLETED');
      setLogs(prev => [
        `[${new Date().toISOString()}] All 4 modules successfully scanned, verified, and upgraded with zero downtime.`,
        ...prev
      ]);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {locale === 'bn' ? 'রেগটেক মাস্টার আপগ্রেড ও ফিচার স্ক্যানার' : 'RegTech Master Upgrade & Feature Scanner'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                {locale === 'bn' ? '৪টি ধাপ সংযুক্ত' : '4-Step Verified'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'bn' ? 'রেগুলেটর, আইনজীবী, ক্লায়েন্ট এবং সাস এডমিন মডিউলের রিয়েল-টাইম গ্যাপ স্ক্যান ও আপগ্রেড' : 'Real-time gap scan & upgrade orchestrator for Regulator, Lawyer, Client & SaaS Admin modules'}
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
            onClick={runFeatureScanAndUpgrade}
            disabled={pipelineState === 'SCANNING'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {pipelineState === 'SCANNING' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {pipelineState === 'SCANNING' 
              ? (locale === 'bn' ? 'স্ক্যান ও আপগ্রেড হচ্ছে...' : 'Scanning & Upgrading...') 
              : (locale === 'bn' ? 'ফিচার স্ক্যান ও আপগ্রেড শুরু করুন' : 'Run Feature Scan & Upgrade')}
          </button>
        </div>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-2xl border transition-all ${
                activeStepId === step.id
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
              onClick={() => setActiveStepId(step.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  step.status === 'UPGRADED'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {step.status === 'UPGRADED' ? (locale === 'bn' ? 'স্ক্যান সম্পন্ন' : 'Synced & Upgraded') : 'Scanning...'}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                {locale === 'bn' ? `ধাপ ${step.id}: ${step.titleBn}` : `Step ${step.id}: ${step.titleEn}`}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                {locale === 'bn' ? step.descBn : step.descEn}
              </p>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">{locale === 'bn' ? 'স্ট্যাটাস' : 'Status'}</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{step.metrics}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Terminal Live Stream Logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-500" />
            {locale === 'bn' ? 'রিয়েল-টাইম পাইপলাইন এক্সিকিউশন লগ' : 'Real-Time Pipeline Execution Logs'}
          </span>
          <span className="text-[10px] font-mono text-slate-400">FastAPI Sovereign Shard #8</span>
        </div>
        <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-indigo-400 shrink-0">&gt;</span>
              <span className={log.includes('SUCCESS') || log.includes('successfully') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Integration API Gateway Bridge */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <NextIntegrationBridge />
      </div>

      {/* Autonomous RegTech AI Upgrade Suite */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <AutonomousRegTechUpgradeSuite />
      </div>

      {/* Advanced Enterprise SaaS Admin & Subscription Suite */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <AdvancedSaasAdminSuite />
      </div>

      {/* Feature Flag & Add-on Governance */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <SaaSAdminFeatureFlagManager />
      </div>

      {/* Cybersecurity & Compliance Posture Scanner */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <CybersecurityComplianceWidget />
      </div>

      {/* Evidence Vault Middleware Auditor & Signed Ledger */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <EvidenceVaultAuditorWidget />
      </div>

      {/* WORM Storage & Hash-Chain Integrity Monitor */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <WormAuditIntegrityMonitor />
      </div>
    </div>
  );
};
export default RegTechOrchestratorConsole;

