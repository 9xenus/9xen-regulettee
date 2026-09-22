import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, CloudFog, AlertCircle, RefreshCw } from 'lucide-react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export const AutoSaveIndicator: React.FC = () => {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');

  useEffect(() => {
    let timer: number | undefined;

    const handleStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent<AutoSaveStatus>;
      setStatus(customEvent.detail);
      
      if (timer) clearTimeout(timer);
      
      if (customEvent.detail === 'saved') {
        timer = window.setTimeout(() => setStatus('idle'), 4000);
      }
    };

    window.addEventListener('auto-save-status', handleStatusChange);
    return () => {
      window.removeEventListener('auto-save-status', handleStatusChange);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {status !== 'idle' && (
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.9, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 transition-colors ${
            status === 'saving' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
            status === 'saved' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
            status === 'error' ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' :
            'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {status === 'saving' && (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="uppercase tracking-wider">Syncing...</span>
            </>
          )}
          {status === 'saved' && (
            <>
              <CheckCircle2 className="w-3 h-3" />
              <span className="uppercase tracking-wider">Saved to SQLite</span>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="w-3 h-3" />
              <span className="uppercase tracking-wider">Sync Error</span>
            </>
          )}
          {status === 'offline' && (
            <>
              <CloudFog className="w-3 h-3" />
              <span className="uppercase tracking-wider">Offline (Local)</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
