import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Send,
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWithRetry } from '../../lib/api-client';

interface WebhookDestination {
  id: string;
  tenant_id: string;
  platform: string;
  name: string;
  endpoint_url: string;
  is_active: number;
  created_at: string;
}

interface WebhookLog {
  id: string;
  destination_id: string;
  destination_name: string;
  event_type: string;
  status: string;
  status_code: number;
  created_at: string;
}

export const WebhookForwardingPanel: React.FC = () => {
  const [destinations, setDestinations] = useState<WebhookDestination[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: 'Critical Log Forwarder',
    endpoint_url: '',
    platform: 'generic_webhook'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'destinations' | 'history'>('destinations');

  const tenantId = 'default'; // Assuming default tenant for now

  const fetchData = async () => {
    setLoading(true);
    try {
      const [destRes, logsRes] = await Promise.all([
        fetchWithRetry(`/api/v1/webhooks/destinations/${tenantId}`),
        fetchWithRetry(`/api/v1/webhooks/logs/${tenantId}`)
      ]);
      
      const destData = await destRes.json();
      const logsData = await logsRes.json();
      
      if (destData.success) setDestinations(destData.destinations);
      if (logsData.success) setLogs(logsData.logs);
    } catch (err) {
      console.error('Failed to fetch webhook data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhook.endpoint_url) return;
    
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetchWithRetry('/api/v1/webhooks/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWebhook,
          tenant_id: tenantId,
          // We mark this as a specialized forwarder by name or platform if needed
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess('Webhook destination added successfully.');
        setIsAdding(false);
        setNewWebhook({ name: 'Critical Log Forwarder', endpoint_url: '', platform: 'generic_webhook' });
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to save webhook.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this webhook destination?')) return;
    
    try {
      const res = await fetchWithRetry(`/api/v1/webhooks/destinations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDestinations(destinations.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleTest = async (id: string) => {
    try {
      const res = await fetchWithRetry('/api/v1/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id: id })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Test successful! Status: ${data.status_code}`);
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Test failed.');
      }
    } catch (err) {
      setError('Test delivery failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Webhook className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-left">Critical Log Forwarding</h3>
            <p className="text-sm text-slate-500 text-left">Automatically forward 'Critical' severity logs to external endpoints.</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Webhook</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
          >
            <form onSubmit={handleAddWebhook} className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Friendly Name</label>
                  <input 
                    type="text" 
                    value={newWebhook.name}
                    onChange={e => setNewWebhook({...newWebhook, name: e.target.value})}
                    placeholder="e.g. Slack Operations Channel"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destination Type</label>
                  <select 
                    value={newWebhook.platform}
                    onChange={e => setNewWebhook({...newWebhook, platform: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white outline-none"
                  >
                    <option value="generic_webhook">Generic Webhook (JSON POST)</option>
                    <option value="slack">Slack Incoming Webhook</option>
                    <option value="teams">Microsoft Teams Webhook</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Webhook URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="url" 
                    value={newWebhook.endpoint_url}
                    onChange={e => setNewWebhook({...newWebhook, endpoint_url: e.target.value})}
                    placeholder="https://hooks.slack.com/services/..."
                    className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center">
                  <ShieldAlert className="w-3 h-3 mr-1" /> All data is signed with an HMAC-SHA256 signature for endpoint verification.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-bold disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Register Destination
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-900">Configuration Error</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-left">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Success</p>
            <p className="text-xs text-emerald-700 mt-0.5">{success}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'destinations' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            Configured Destinations ({destinations.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            Delivery History
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'destinations' ? (
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-sm">Loading integration endpoints...</p>
                </div>
              ) : destinations.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                  <Webhook className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No webhook destinations configured.</p>
                  <p className="text-xs mt-1">Add a URL to start receiving real-time 'Critical' log alerts.</p>
                </div>
              ) : (
                destinations.map(dest => (
                  <div key={dest.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-start space-x-4 text-left min-w-0">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                        <Activity className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{dest.name}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{dest.platform}</span>
                          <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{dest.endpoint_url}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button 
                        onClick={() => handleTest(dest.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Send Test Payload"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dest.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Destination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Destination</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Event Type</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic">No delivery history recorded.</td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-mono text-[10px] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{log.destination_name}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">{log.event_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 font-bold text-[11px] ${log.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{log.status_code || '--'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-2xl p-6 text-white text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold">Auto-Triage Engine Forwarding</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              When the 9Xen auto-triage engine detects a log entry with **Critical** severity, it will automatically bundle the diagnostic report and remediation advice into a signed JSON payload and dispatch it to all active webhook destinations registered here.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" /> Average latency: &lt; 200ms
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <ExternalLink className="w-3.5 h-3.5" /> <a href="#" className="underline hover:text-white transition-colors">Developer Documentation</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
