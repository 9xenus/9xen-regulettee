import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { fetchWithRetry } from '../lib/api-client';

export const useEurLexScraperAlerts = () => {
  const { showToast } = useNotification();
  const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetchWithRetry('/api/v1/rag-logs');
        if (res.ok) {
          const data = await res.json();
          const newLogs = data.logs || [];
          if (newLogs.length > 0) {
            const latestLog = newLogs[0];
            if (latestLog.status === 'FAILURE' && latestLog.id !== lastNotifiedId) {
              showToast(`Law scraping attempt failed: ${latestLog.message}`, 'error');
              setLastNotifiedId(latestLog.id);
            } else if (latestLog.status === 'SUCCESS' && latestLog.id !== lastNotifiedId) {
              setLastNotifiedId(latestLog.id);
            }
          }
        }
      } catch (err) {
        // silently ignore network errors for polling
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [lastNotifiedId, showToast]);
};
