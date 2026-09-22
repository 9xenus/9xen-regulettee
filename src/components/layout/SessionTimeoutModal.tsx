import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  LogOut, 
  AlertTriangle, 
  ShieldCheck, 
  Lock,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const STORAGE_KEY = '9xen-regulettee_last_activity';
const WARNING_THRESHOLD_SEC = 180; // Show modal when 3 minutes remaining

export const SessionTimeoutModal: React.FC = () => {
  const { session, user, signOut } = useAuth();
  const notificationCtx = useNotification();
  const showToast = notificationCtx?.showToast;

  // Read configured idle timeout minutes from environment variable VITE_IDLE_TIMEOUT_MINUTES (default 15)
  const envTimeout = typeof import.meta !== 'undefined' && (import.meta as any).env
    ? Number((import.meta as any).env.VITE_IDLE_TIMEOUT_MINUTES)
    : 15;
  const timeoutMinutes = (!isNaN(envTimeout) && envTimeout > 0) ? envTimeout : 15;
  const totalTimeoutMs = timeoutMinutes * 60 * 1000;

  const [remainingSec, setRemainingSec] = useState<number>(timeoutMinutes * 60);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExtending, setIsExtending] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const lastEventTriggeredRef = useRef<number>(0);

  // Extend / touch session
  const extendSession = useCallback((showNotification = true) => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
      window.dispatchEvent(new CustomEvent('session-activity-reset', { detail: now }));
    } catch {
      // ignore
    }

    setRemainingSec(timeoutMinutes * 60);
    setIsOpen(false);

    if (showNotification && showToast) {
      showToast(`Session successfully extended for ${timeoutMinutes} minutes.`, 'success');
    }
  }, [timeoutMinutes, showToast]);

  // Handle user activity auto-reset (throttled)
  useEffect(() => {
    const handleUserActivity = () => {
      // Only auto-reset if modal is not currently open (if modal is open, user must explicitly click extend)
      if (isOpen) return;

      const now = Date.now();
      if (now - lastEventTriggeredRef.current > 4000) {
        lastEventTriggeredRef.current = now;
        lastActivityRef.current = now;
        try {
          localStorage.setItem(STORAGE_KEY, now.toString());
        } catch {}
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const handleStorage = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent && e.key === STORAGE_KEY && e.newValue) {
        const val = parseInt(e.newValue, 10);
        if (!isNaN(val) && val > lastActivityRef.current) {
          lastActivityRef.current = val;
          if (isOpen) setIsOpen(false);
        }
      } else if (e instanceof CustomEvent && e.type === 'session-activity-reset') {
        if (typeof e.detail === 'number' && e.detail > lastActivityRef.current) {
          lastActivityRef.current = e.detail;
          if (isOpen) setIsOpen(false);
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
  }, [isOpen]);

  // Second-by-second countdown check
  useEffect(() => {
    const interval = setInterval(() => {
      let storedTime = 0;
      try {
        const str = localStorage.getItem(STORAGE_KEY);
        if (str) {
          const parsed = parseInt(str, 10);
          if (!isNaN(parsed)) storedTime = parsed;
        }
      } catch {}

      const effectiveLastActivity = Math.max(lastActivityRef.current, storedTime);
      const elapsedMs = Math.max(0, Date.now() - effectiveLastActivity);
      const remainingMs = Math.max(0, totalTimeoutMs - elapsedMs);
      const remSec = Math.floor(remainingMs / 1000);

      setRemainingSec(remSec);

      // Trigger auto-modal if remaining time drops below warning threshold
      if (remSec <= WARNING_THRESHOLD_SEC && remSec > 0) {
        setIsOpen(true);
      } else if (remSec > WARNING_THRESHOLD_SEC && isOpen) {
        setIsOpen(false);
      }

      // If time reaches 0, perform security auto-logout
      if (remSec <= 0) {
        clearInterval(interval);
        setIsOpen(false);
        if (showToast) {
          showToast('Session expired due to inactivity. Please log in again.', 'warning');
        }
        signOut();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalTimeoutMs, isOpen, signOut, showToast]);

  if (!isOpen) return null;

  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const percentage = Math.max(0, Math.min(100, (remainingSec / WARNING_THRESHOLD_SEC) * 100));

  return (
    <AnimatePresence>
      <div 
        id="session-timeout-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-labelledby="session-timeout-title"
        >
          {/* Header Banner */}
          <div className="p-6 pb-4 bg-gradient-to-b from-rose-500/10 via-transparent to-transparent text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10 mb-3 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 
              id="session-timeout-title" 
              className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              Session Inactivity Alert
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              In compliance with <strong>Zero-Trust SOC 2 Type II</strong> and <strong>eIDAS v2</strong> data security policies, your active session will be terminated due to inactivity.
            </p>
          </div>

          {/* Countdown Clock Section */}
          <div className="px-6 py-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
                Time Remaining Before Lockout
              </span>
              <div className="text-3xl font-mono font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {formattedTime}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-3 overflow-hidden">
                <motion.div 
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                  initial={false}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2">
                <span>00:00</span>
                <span>Max Idle: {timeoutMinutes}m</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-2 space-y-2.5">
            <button
              id="session-extend-btn"
              type="button"
              onClick={() => {
                setIsExtending(true);
                extendSession(true);
                setTimeout(() => setIsExtending(false), 300);
              }}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isExtending ? 'animate-spin' : ''}`} />
              <span>Extend Active Session</span>
            </button>

            <button
              id="session-signout-btn"
              type="button"
              onClick={signOut}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Immediately</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
