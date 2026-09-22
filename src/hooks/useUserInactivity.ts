import { useEffect, useState, useRef, useCallback } from 'react';

interface UseUserInactivityProps {
  onTimeout: () => void;
  timeoutMs?: number; // default 15 minutes
  warningMs?: number; // default 14 minutes
  enabled?: boolean;
}

const DEFAULT_TIMEOUT_MINS = Number(typeof import.meta !== 'undefined' && (import.meta as any)?.env ? (import.meta as any).env.VITE_IDLE_TIMEOUT_MINUTES : 30) || 30;
const DEFAULT_WARNING_MINS = Number(typeof import.meta !== 'undefined' && (import.meta as any)?.env ? (import.meta as any).env.VITE_IDLE_WARNING_MINUTES : 28) || 28;

export function useUserInactivity({
  onTimeout,
  timeoutMs = DEFAULT_TIMEOUT_MINS * 60 * 1000,
  warningMs = DEFAULT_WARNING_MINS * 60 * 1000,
  enabled = true,
}: UseUserInactivityProps) {
  const [isWarning, setIsWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const mountTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const onTimeoutRef = useRef(onTimeout);
  const STORAGE_KEY = '9xen-regulettee_last_activity';

  // Always keep onTimeoutRef updated to avoid stale closures or unnecessary effect re-subscriptions
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch (e) {
      // Ignore storage errors
    }
    setIsWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsWarning(false);
      setCountdown(0);
      return;
    }

    // Initialize mount time and activity timestamp on mount / enable
    const now = Date.now();
    mountTimeRef.current = now;
    resetTimer();

    // Sync from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const parsed = parseInt(e.newValue, 10);
        if (!isNaN(parsed) && parsed > lastActivityRef.current) {
          lastActivityRef.current = parsed;
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const checkInterval = setInterval(() => {
      // Get stored activity from localStorage
      let storedTime = 0;
      try {
        const storedStr = localStorage.getItem(STORAGE_KEY);
        if (storedStr) {
          storedTime = parseInt(storedStr, 10);
          if (isNaN(storedTime)) storedTime = 0;
        }
      } catch (e) {
        storedTime = 0;
      }

      // Ensure effective last activity is AT LEAST mount time and AT LEAST last local activity
      const effectiveLastActivity = Math.max(
        mountTimeRef.current,
        lastActivityRef.current,
        storedTime
      );
      
      const elapsed = Date.now() - effectiveLastActivity;

      if (elapsed >= timeoutMs) {
        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        }
        setIsWarning(false);
      } else if (elapsed >= warningMs) {
        setIsWarning(true);
        setCountdown(Math.ceil((timeoutMs - elapsed) / 1000));
      } else {
        setIsWarning(false);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInterval);
    };
  }, [timeoutMs, warningMs, enabled, resetTimer]);

  return {
    isWarning,
    countdown,
    resetTimer,
  };
}

