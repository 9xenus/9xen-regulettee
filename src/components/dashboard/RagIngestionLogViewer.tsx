import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Clock, Database, ServerCrash, ExternalLink } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface RagLog {
  id: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';
  message: string;
  details?: any;
}

export const RagIngestionLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<RagLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useNotification();
  const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/rag-logs');
      if (res.ok) {
        const data = await res.json();
        const newLogs = data.logs || [];
        setLogs(newLogs);
        setError(null);
        
        if (newLogs.length > 0) {
          const latestLog = newLogs[0];
          if (latestLog.status === 'FAILURE' && latestLog.id !== lastNotifiedId) {
            showToast(`Law scraping attempt failed: ${latestLog.message}`, 'error');
            setLastNotifiedId(latestLog.id);
          } else if (latestLog.status === 'SUCCESS' && latestLog.id !== lastNotifiedId) {
            setLastNotifiedId(latestLog.id);
          }
        }
      } else {
        setError('Failed to load logs');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleManualTrigger = async (regionId: string) => {
    if (triggering) return;
    setTriggering(true);
    try {
      await fetch(`/api/v1/rag-logs/trigger/${regionId}`, { method: 'POST' });
      await fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Global RAG Ingestion</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time legislative synchronization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <div className="relative group">
            <button
              disabled={triggering}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {triggering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Force Sync
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {['eur-lex', 'usa-ecfr', 'aus-fed', 'apac-hub'].map(region => (
                <button
                  key={region}
                  onClick={() => handleManualTrigger(region)}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 first:rounded-t-xl last:rounded-b-xl border-b last:border-0 border-slate-100"
                >
                  Sync {region.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-0 overflow-y-auto max-h-[400px]">
        {error ? (
          <div className="p-5 sm:p-6 lg:p-8 text-center text-rose-500 flex flex-col items-center justify-center">
            <ServerCrash className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-5 sm:p-6 lg:p-8 text-center text-slate-500">
            <p className="text-sm">No ingestion logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className="pt-1">
                  {log.status === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {log.status === 'FAILURE' && <XCircle className="w-5 h-5 text-rose-500" />}
                  {log.status === 'IN_PROGRESS' && <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {log.status === 'SUCCESS' ? 'Sync Completed' : log.status === 'FAILURE' ? 'Sync Failed' : 'Syncing...'}
                    </p>
                    <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">{log.message}</p>
                  
                  {log.details && (
                    <div className="bg-slate-100 rounded-md p-2 text-xs font-mono text-slate-600 overflow-x-auto">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
