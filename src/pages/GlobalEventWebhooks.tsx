import React, { useState } from 'react';
import { 
  Webhook, Activity, CheckCircle2, XCircle, Plus, 
  Trash2, RefreshCw, Send, AlertTriangle, Search,
  Terminal, Server, Filter, FileJson, Clock, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

type WebhookEndpoint = {
  id: string;
  url: string;
  status: 'active' | 'failing' | 'disabled';
  events: string[];
  secret: string;
  lastDelivery: string | null;
  createdAt: string;
};

type DeliveryLog = {
  id: string;
  endpointId: string;
  event: string;
  status: 200 | 400 | 500;
  timestamp: string;
  latencyMs: number;
};

const MOCK_ENDPOINTS: WebhookEndpoint[] = [
  {
    id: "wh_live_89x2b",
    url: "https://api.acme-corp.com/v1/regtech/webhooks",
    status: 'active',
    events: ["scan.completed", "penalty.issued", "case.appealed"],
    secret: "whsec_<REDACTED>",
    lastDelivery: "2026-08-13T10:45:12Z",
    createdAt: "2026-07-01T08:00:00Z"
  },
  {
    id: "wh_live_44m1p",
    url: "https://compliance.fintech-node.net/callbacks",
    status: 'failing',
    events: ["invoice.paid", "law.updated"],
    secret: "whsec_<REDACTED>",
    lastDelivery: "2026-08-12T15:22:10Z",
    createdAt: "2026-08-10T12:30:00Z"
  }
];

const MOCK_LOGS: DeliveryLog[] = [
  { id: "del_99812", endpointId: "wh_live_89x2b", event: "scan.completed", status: 200, timestamp: "2026-08-13T10:45:12Z", latencyMs: 245 },
  { id: "del_99811", endpointId: "wh_live_44m1p", event: "invoice.paid", status: 500, timestamp: "2026-08-12T15:22:10Z", latencyMs: 1204 },
  { id: "del_99810", endpointId: "wh_live_89x2b", event: "penalty.issued", status: 200, timestamp: "2026-08-11T09:11:00Z", latencyMs: 189 },
];

const EVENT_CATALOG = [
  { id: 'scan.completed', desc: 'Fired when an AI deep scan completes.' },
  { id: 'scan.failed', desc: 'Fired when an AI deep scan fails.' },
  { id: 'penalty.issued', desc: 'Fired when an automated B2G penalty is issued.' },
  { id: 'case.appealed', desc: 'Fired when a formal ALAE appeal is lodged.' },
  { id: 'invoice.paid', desc: 'Fired when an escrow invoice is discharged.' },
  { id: 'law.updated', desc: 'Fired when the Sovereign AI detects a regulatory shift.' },
];

export const GlobalEventWebhooks: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'logs' | 'catalog'>('endpoints');
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(MOCK_ENDPOINTS);
  
  // New Endpoint State
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || selectedEvents.length === 0) return;

    const newEndpoint: WebhookEndpoint = {
      id: `wh_live_${Math.random().toString(36).substr(2, 5)}`,
      url: newUrl,
      status: 'active',
      events: selectedEvents,
      secret: `whsec_${Math.random().toString(36).substr(2, 10)}...`,
      lastDelivery: null,
      createdAt: new Date().toISOString()
    };

    setEndpoints([newEndpoint, ...endpoints]);
    setIsAdding(false);
    setNewUrl('');
    setSelectedEvents([]);
    showToast('Webhook endpoint provisioned successfully.', 'success');
  };

  const handlePing = (id: string) => {
    showToast(`Pinging endpoint ${id}...`, 'info');
    setTimeout(() => {
      showToast('Ping successful (HTTP 200).', 'success');
    }, 1000);
  };

  const handleDelete = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
    showToast('Endpoint deleted permanently.', 'success');
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 min-h-screen bg-slate-50">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Webhook className="w-8 h-8 text-indigo-600" />
            Global Event Webhooks
          </h1>
          <p className="text-slate-500 mt-2 max-w-3xl">
            Stream real-time compliance events, automated penalty alerts, and scanning telemetry directly into your enterprise ERP, SIEM, or custom incident response systems.
          </p>
        </div>
        {!isAdding && activeTab === 'endpoints' && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Endpoint
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
        {[
          { id: 'endpoints', label: 'Registered Endpoints', icon: Server },
          { id: 'logs', label: 'Delivery Logs', icon: Activity },
          { id: 'catalog', label: 'Event Catalog', icon: FileJson },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setIsAdding(false); }}
            className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* ENDPOINTS TAB */}
        {activeTab === 'endpoints' && (
          <motion.div key="endpoints" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            
            {isAdding ? (
              <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Configure New Endpoint</h3>
                  <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleAddEndpoint} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Payload URL</label>
                    <input 
                      type="url" 
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://api.yourdomain.com/webhooks"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subscribe to Events</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {EVENT_CATALOG.map(evt => (
                        <label 
                          key={evt.id} 
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            selectedEvents.includes(evt.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedEvents.includes(evt.id)}
                            onChange={() => toggleEvent(evt.id)}
                            className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="text-sm font-bold text-slate-900 font-mono">{evt.id}</div>
                            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{evt.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" disabled={!newUrl || selectedEvents.length === 0} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Save Endpoint
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4">
              {endpoints.map(endpoint => (
                <div key={endpoint.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        {endpoint.status === 'active' ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-bold border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Failing
                          </span>
                        )}
                        <span className="text-sm font-bold font-mono text-slate-900">{endpoint.url}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500 flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> ID: <code className="text-slate-700 font-bold">{endpoint.id}</code></span>
                        <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Last Delivery: <span className="text-slate-700 font-bold">{endpoint.lastDelivery ? new Date(endpoint.lastDelivery).toLocaleString() : 'Never'}</span></span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {endpoint.events.map(evt => (
                          <span key={evt} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handlePing(endpoint.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Send Ping">
                        <Send className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(endpoint.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Endpoint">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}

              {endpoints.length === 0 && !isAdding && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <Webhook className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900">No endpoints configured</h3>
                  <p className="text-slate-500 mt-1 mb-6">Create an endpoint to start receiving real-time events.</p>
                  <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl">Add Endpoint</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search by event or ID..." className="bg-transparent border-none focus:ring-0 text-sm w-64 text-slate-900" />
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Event Type</th>
                    <th className="px-6 py-4 font-bold">Endpoint ID</th>
                    <th className="px-6 py-4 font-bold">Latency</th>
                    <th className="px-6 py-4 font-bold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        {log.status === 200 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-md text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" /> {log.status} ERR
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 text-xs">{log.event}</td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">{log.endpointId}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{log.latencyMs}ms</td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* CATALOG TAB */}
        {activeTab === 'catalog' && (
          <motion.div key="catalog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EVENT_CATALOG.map(evt => (
                <div key={evt.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{evt.id}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{evt.desc}</p>
                  
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-[10px] text-emerald-400 font-mono">
{`{
  "id": "evt_293847293",
  "type": "${evt.id}",
  "created_at": "2026-08-13T10:00:00Z",
  "data": {
    "target_id": "...",
    "metadata": {}
  }
}`}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default GlobalEventWebhooks;
