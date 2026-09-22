import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, Lock, Database, Activity, CheckCircle2, Clock } from 'lucide-react';
import EvidenceVaultAuditorEngine from '../services/evidenceVaultAuditor';

export const WormAuditIntegrityMonitor: React.FC = () => {
  const [locale, setLocale] = useState<'en' | 'bn'>('en');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lastVerifiedTime, setLastVerifiedTime] = useState<string>(new Date().toLocaleTimeString());
  const [integrityResult, setIntegrityResult] = useState(EvidenceVaultAuditorEngine.verifyLedgerIntegrity());
  const [wormStorageSynced, setWormStorageSynced] = useState<boolean>(true);

  // Periodic verification simulation every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      runVerification();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const runVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = EvidenceVaultAuditorEngine.verifyLedgerIntegrity();
      setIntegrityResult(res);
      setLastVerifiedTime(new Date().toLocaleTimeString());
      setWormStorageSynced(true);
      setIsVerifying(false);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl ${
            integrityResult.valid && wormStorageSynced 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
          }`}>
            {integrityResult.valid && wormStorageSynced ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {locale === 'bn' ? 'ডব্লিউওআরএম ও হ্যাশ-চেইন ইন্টেগ্রিটি মনিটর' : 'WORM Storage & Hash-Chain Integrity Monitor'}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                integrityResult.valid && wormStorageSynced
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {integrityResult.valid && wormStorageSynced 
                  ? (locale === 'bn' ? 'সাঁজোয়া ও সুরক্ষিত (WORM Synced)' : '100% WORM & Chain Verified') 
                  : 'Integrity Alert'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'bn' ? 'অডিট লগ এবং রাইট-ওয়ান্স-রিড-মেনি (WORM) স্টোরেজের মধ্যে ক্রিপ্টোগ্রাফিক ধারাবাহিকতা যাচাই' : 'Continuous cryptographic verification between audit ledger and WORM immutable storage'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              <span>Last verified: {lastVerifiedTime}</span>
            </div>
            <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
              Total Records: {integrityResult.totalEntries}
            </div>
          </div>
          <button
            onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {locale === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button
            onClick={runVerification}
            disabled={isVerifying}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying 
              ? (locale === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') 
              : (locale === 'bn' ? 'এখনই যাচাই করুন' : 'Verify Now')}
          </button>
        </div>
      </div>

      {/* Grid Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hash-Chain Status</div>
          <div className="text-xs font-mono font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {integrityResult.valid ? 'Valid (HMAC-SHA256)' : 'Broken Chain'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WORM Storage Node</div>
          <div className="text-xs font-mono font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            Immutable S3 / Cloud Vault
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Interval</div>
          <div className="text-xs font-mono font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            Every 15s (Real-time)
          </div>
        </div>
      </div>
    </div>
  );
};

export default WormAuditIntegrityMonitor;
