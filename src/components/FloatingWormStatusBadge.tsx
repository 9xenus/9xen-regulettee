import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Activity, Lock } from 'lucide-react';
import EvidenceVaultAuditorEngine from '../services/evidenceVaultAuditor';

export const FloatingWormStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<'VERIFIED' | 'VERIFYING' | 'ALERT'>('VERIFIED');
  const [lastCheck, setLastCheck] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      checkIntegrity();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const checkIntegrity = () => {
    setStatus('VERIFYING');
    setTimeout(() => {
      const result = EvidenceVaultAuditorEngine.verifyLedgerIntegrity();
      if (result.valid) {
        setStatus('VERIFIED');
      } else {
        setStatus('ALERT');
      }
      setLastCheck(new Date().toLocaleTimeString());
    }, 600);
  };

  const getBadgeStyle = () => {
    if (status === 'VERIFYING') {
      return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
    }
    if (status === 'ALERT') {
      return 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400';
    }
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
  };

  const getDotStyle = () => {
    if (status === 'VERIFYING') return 'bg-amber-500 animate-ping';
    if (status === 'ALERT') return 'bg-rose-500 animate-bounce';
    return 'bg-emerald-500 animate-pulse';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        onClick={checkIntegrity}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border backdrop-blur-md shadow-lg cursor-pointer transition-all hover:scale-105 ${getBadgeStyle()}`}
        title="Click to manually verify WORM audit integrity"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${getDotStyle()}`}></span>
        <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
          <Lock className="w-3.5 h-3.5" />
          <span>
            {status === 'VERIFYING' ? 'Verifying WORM...' : status === 'ALERT' ? 'WORM Integrity Alert' : 'WORM Hash-Chain Synced'}
          </span>
        </div>
        <span className="text-[10px] opacity-75 font-mono hidden sm:inline">({lastCheck})</span>
      </div>
    </div>
  );
};

export default FloatingWormStatusBadge;
