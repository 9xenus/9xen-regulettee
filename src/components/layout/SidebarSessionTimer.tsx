import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, RefreshCcw, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';

interface SidebarSessionTimerProps {
  isSidebarOpen: boolean;
}

const STORAGE_KEY = '9xen-regulettee_last_activity';

export const SidebarSessionTimer: React.FC<SidebarSessionTimerProps> = ({ isSidebarOpen }) => {
  const notificationCtx = useNotification();
  const showToast = notificationCtx?.showToast;

  // Read configured idle timeout minutes from environment variable VITE_IDLE_TIMEOUT_MINUTES (default to 15 as in .env.example)
  const envTimeout = typeof import.meta !== 'undefined' && (import.meta as any).env
    ? Number((import.meta as any).env.VITE_IDLE_TIMEOUT_MINUTES)
    : 15;
  const timeoutMinutes = (!isNaN(envTimeout) && envTimeout > 0) ? envTimeout : 15;
  const totalTimeoutMs = timeoutMinutes * 60 * 1000;

  const [remainingSec, setRemainingSec] = useState<number>(timeoutMinutes * 60);
  const [isExtendedSuccess, setIsExtendedSuccess] = useState<boolean>(false);
  const lastActivityRef = useRef<number>(Date.now());
  const lastEventTriggeredRef = useRef<number>(0);

  // Helper to touch / extend session
  const resetActivityTimer = useCallback((showNotification = false) => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
      // Dispatch custom storage event for multi-tab sync
      window.dispatchEvent(new CustomEvent('session-activity-reset', { detail: now }));
    } catch (e) {
      // Ignore storage errors
    }
    
    setRemainingSec(timeoutMinutes * 60);

    if (showNotification) {
      setIsExtendedSuccess(true);
      setTimeout(() => setIsExtendedSuccess(false), 2000);
      if (showToast) {
        showToast(`Session timer extended. Active for ${timeoutMinutes} minutes.`, 'success');
      }
    }
  }, [timeoutMinutes, showToast]);

  // Handle user activity auto-reset (throttled to avoid performance hits)
  useEffect(() => {
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle user activity auto-resets to every 3 seconds
      if (now - lastEventTriggeredRef.current > 3000) {
        lastEventTriggeredRef.current = now;
        lastActivityRef.current = now;
        try {
          localStorage.setItem(STORAGE_KEY, now.toString());
        } catch (e) {}
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Listen for storage / cross-tab updates
    const handleStorage = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent && e.key === STORAGE_KEY && e.newValue) {
        const val = parseInt(e.newValue, 10);
        if (!isNaN(val) && val > lastActivityRef.current) {
          lastActivityRef.current = val;
        }
      } else if (e instanceof CustomEvent && e.type === 'session-activity-reset') {
        if (typeof e.detail === 'number' && e.detail > lastActivityRef.current) {
          lastActivityRef.current = e.detail;
        }
      }
    };

    window.addEventListener('storage', handleStorage as EventListener);
    window.addEventListener('session-activity-reset', handleStorage as EventListener);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      window.removeEventListener('storage', handleStorage as EventListener);
      window.removeEventListener('session-activity-reset', handleStorage as EventListener);
    };
  }, []);

  // Interval check every second
  useEffect(() => {
    const interval = setInterval(() => {
      let storedTime = 0;
      try {
        const str = localStorage.getItem(STORAGE_KEY);
        if (str) {
          const parsed = parseInt(str, 10);
          if (!isNaN(parsed)) storedTime = parsed;
        }
      } catch (e) {}

      const effectiveLastActivity = Math.max(lastActivityRef.current, storedTime);
      const elapsedMs = Math.max(0, Date.now() - effectiveLastActivity);
      const remainingMs = Math.max(0, totalTimeoutMs - elapsedMs);
      const remSec = Math.floor(remainingMs / 1000);

      setRemainingSec(remSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [totalTimeoutMs]);

  // Format time MM:SS
  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const percentage = Math.max(0, Math.min(100, (remainingSec / (timeoutMinutes * 60)) * 100));

  // Determine urgency levels:
  // Critical: <= 60s
  // Warning: <= 180s (3 minutes)
  // Normal: > 180s
  const isCritical = remainingSec <= 60;
  const isWarning = remainingSec <= 180;

  if (!isSidebarOpen) {
    // Collapsed Sidebar View
    return (
      <div 
        className="my-2 px-2 flex justify-center cursor-pointer group"
        onClick={() => resetActivityTimer(true)}
        title={`Session Expiry: ${formattedTime} remaining (${timeoutMinutes}m idle limit). Click to extend session.`}
      >
        <div className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
          isCritical 
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse shadow-lg shadow-rose-950/50' 
            : isWarning
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse shadow-md shadow-amber-950/30'
              : 'bg-slate-900/80 border-slate-800/80 text-slate-400 group-hover:border-slate-700 group-hover:text-emerald-400'
        }`}>
          <Clock className={`w-4 h-4 ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`} />
          <span className="text-[10px] font-mono font-bold mt-1">
            {mins}m
          </span>
        </div>
      </div>
    );
  }

  // Expanded Sidebar View
  return (
    <div className="mx-3 my-2.5">
      <div className={`p-2.5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
        isCritical
          ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-rose-500/60 shadow-lg shadow-rose-950/50'
          : isWarning
            ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-amber-500/50 shadow-md shadow-amber-950/30'
            : 'bg-slate-900/90 border-slate-800/90 shadow-sm'
      }`}>
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-lg border shrink-0 ${
              isCritical
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : isWarning
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {isCritical ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : isWarning ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 truncate">
                  Session Expiry
                </span>
                <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {timeoutMinutes}m
                </span>
              </div>
              
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className={`text-xs font-mono font-extrabold tracking-tight ${
                  isCritical 
                    ? 'text-rose-400 animate-pulse' 
                    : isWarning 
                      ? 'text-amber-300' 
                      : 'text-emerald-400'
                }`}>
                  {formattedTime}
                </span>

                {isCritical ? (
                  <span className="text-[9px] font-semibold text-rose-300 truncate">
                    Expiring Soon!
                  </span>
                ) : isWarning ? (
                  <span className="text-[9px] font-semibold text-amber-300 truncate">
                    Idle Alert
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-400 truncate">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Extend Session Button */}
          <button
            onClick={() => resetActivityTimer(true)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
              isExtendedSuccess
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : isCritical
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-sm animate-bounce'
                  : isWarning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/80 hover:text-white'
            }`}
            title="Click to extend active session timer"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isExtendedSuccess ? 'animate-spin' : ''}`} />
            <span className="text-[10px] hidden sm:inline">
              {isExtendedSuccess ? 'Extended' : 'Extend'}
            </span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950/80 rounded-full h-1 mt-2 overflow-hidden border border-slate-800/80">
          <motion.div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical
                ? 'bg-rose-500 shadow-xs shadow-rose-500'
                : isWarning
                  ? 'bg-amber-400 shadow-xs shadow-amber-400'
                  : 'bg-emerald-400 shadow-xs shadow-emerald-400'
            }`}
            style={{ width: `${percentage}%` }}
            initial={false}
            animate={{ width: `${percentage}%` }}
          />
        </div>

        {/* Dynamic Warning Alert Bar when session is expiring */}
        <AnimatePresence>
          {isWarning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px]"
            >
              <span className={isCritical ? 'text-rose-300 font-bold' : 'text-amber-300 font-medium'}>
                {isCritical ? '⚠️ Session ending imminently' : '⚡ Inactivity detected'}
              </span>
              <button
                onClick={() => resetActivityTimer(true)}
                className="underline hover:no-underline font-semibold text-slate-200 cursor-pointer"
              >
                Click to keep logged in
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
