import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

export const ComplianceIntegrityDashboard: React.FC = () => {
  const [status, setStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetchWithRetry('/api/v1/compliance/integrity');
        const data = await res.json();
        setStatus(data.status || []);
      } catch (err) {
        console.error('Failed to fetch compliance integrity status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">Compliance Library Integrity Dashboard</h3>
        <p className="text-sm text-slate-500 mt-1">Runtime status of essential compliance libraries.</p>
      </div>
      <div className="p-6">
        <table className="w-full text-left">
          <thead className="text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3">Library</th>
              <th className="p-3">Version</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {status.map((lib: any) => (
              <tr key={lib.name}>
                <td className="p-3 font-mono text-sm">{lib.name}</td>
                <td className="p-3 text-sm">{lib.version || 'N/A'}</td>
                <td className="p-3">
                  {lib.installed ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">
                      <CheckCircle className="w-4 h-4" /> Installed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded">
                      <XCircle className="w-4 h-4" /> Missing
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
