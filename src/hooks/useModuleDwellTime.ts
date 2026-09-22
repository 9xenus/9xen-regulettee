import { fetchWithRetry } from '../lib/api-client';
import { useEffect, useRef } from 'react';

export function useModuleDwellTime(moduleId: string, moduleName: string, userId: string = 'user_demo') {
  const startTimeRef = useRef<number>(Date.now());

  const reportDwellTime = (durationSeconds: number) => {
    if (durationSeconds <= 0) return;
    
    const payload = {
      moduleId,
      moduleName,
      userId,
      dwellTimeSeconds: durationSeconds
    };

    fetchWithRetry('/api/v1/reporting/analytics/dwell-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((err) => console.error('[useModuleDwellTime] Failed to log dwell time:', err));
  };

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Report and reset every 30 seconds to avoid losing data on browser exit
    const interval = setInterval(() => {
      const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (elapsedSeconds >= 10) {
        reportDwellTime(elapsedSeconds);
        startTimeRef.current = Date.now(); // reset anchor
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (elapsedSeconds > 0) {
          reportDwellTime(elapsedSeconds);
        }
      } else {
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (elapsedSeconds > 0) {
        reportDwellTime(elapsedSeconds);
      }
    };
  }, [moduleId, moduleName, userId]);
}
