import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  Settings, 
  ExternalLink,
  Clock,
  Zap,
  Globe,
  Database,
  Shield,
  ArrowRight,
  MoreVertical,
  History,
  Terminal,
  Box
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const IntegrationHealth: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unhealthy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>({
    uptimePercent: 99.98,
    activeSyncsCount: 14,
    avgLatencyMs: 112,
    openIncidentsCount: 0,
    integrations: [
      { id: 'workday', name: 'Workday HRIS', type: 'HRIS', status: 'Healthy', latency: '124ms', lastSync: '2m ago', syncMode: 'Real-time' },
      { id: 'aws', name: 'AWS Cloud Infra', type: 'Infrastructure', status: 'Healthy', latency: '68ms', lastSync: '3m ago', syncMode: 'Batch (15m)' },
      { id: 'fincen', name: 'FinCEN Global API', type: 'Regulatory', status: 'Healthy', latency: '45ms', lastSync: 'Live', syncMode: 'Streaming' },
      { id: 'okta', name: 'Okta Identity', type: 'Auth', status: 'Healthy', latency: '88ms', lastSync: '1m ago', syncMode: 'Real-time' },
      { id: 'salesforce', name: 'Salesforce Enterprise CRM', type: 'CRM', status: 'Healthy', latency: '115ms', lastSync: 'Just now', syncMode: 'Webhook' },
      { id: 'sap', name: 'SAP S/4HANA ERP', type: 'ERP', status: 'Healthy', latency: '142ms', lastSync: '4m ago', syncMode: 'Streaming' },
      { id: 'stripe', name: 'Stripe Billing', type: 'Finance', status: 'Healthy', latency: '92ms', lastSync: '4m ago', syncMode: 'Webhook' },
    ]
  });

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/integrations/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHealth();
  }, []);

  const integrations = (healthData.integrations || []).filter((item: any) => {
    const matchesFilter = filter === 'all' || item.status !== 'Healthy';
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">System Uptime</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-black text-gray-900 tracking-tight">99.98%</h4>
            <span className="text-emerald-500 font-bold text-xs flex items-center mb-1">
              <Zap className="w-3 h-3 mr-0.5 fill-emerald-500" />
              SLA MET
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Active Syncs</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-black text-gray-900 tracking-tight">14</h4>
            <span className="text-gray-400 font-bold text-xs mb-1">GLOBAL</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Avg. Latency</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-black text-gray-900 tracking-tight">112ms</h4>
            <span className="text-blue-500 font-bold text-xs mb-1 flex items-center">
              <RefreshCw className="w-3 h-3 mr-0.5" />
              OPTIMAL
            </span>
          </div>
        </div>
        <div className="bg-red-900 rounded-xl p-6 text-white shadow-xl shadow-red-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="w-16 h-16" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-300">Open Incidents</p>
          <div className="flex items-end justify-between mt-4 relative z-10">
            <h4 className="text-3xl font-black text-white tracking-tight">02</h4>
            <button className="text-xs font-bold underline decoration-red-400 underline-offset-4">Triage Now</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Integration Health</h2>
            <div className="flex p-1 bg-gray-200 rounded-lg">
              <button 
                onClick={() => setFilter('all')}
                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", filter === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('unhealthy')}
                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", filter === 'unhealthy' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
              >
                Unhealthy
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Filter integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white"
              />
            </div>
            <button 
              onClick={fetchHealth}
              disabled={loading}
              className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              title="Refresh integration health"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin text-blue-600")} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200">
                <th className="px-8 py-4">System / Integration</th>
                <th className="px-8 py-4">Type</th>
                <th className="px-8 py-4">Sync Mode</th>
                <th className="px-8 py-4">Latency</th>
                <th className="px-8 py-4">Last Sync</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {integrations.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        item.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" :
                        item.status === 'Degraded' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                      )}>
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded tracking-tight">{item.type}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center text-xs text-gray-600 font-medium">
                      <Terminal className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      {item.syncMode}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-mono text-gray-600 font-medium">{item.latency}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 font-medium">{item.lastSync}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full mr-3",
                        item.status === 'Healthy' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                        item.status === 'Degraded' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : 
                        "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      )} />
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        item.status === 'Healthy' ? "text-emerald-600" :
                        item.status === 'Degraded' ? "text-amber-600" : "text-red-600"
                      )}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <History className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
            Sandbox Environment Staging
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            Spin up an isolated copy of your entire configuration to test major changes before pushing to production. 
            All connections are proxied through the compliance sandbox gateway.
          </p>
          <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-2xl mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Staging Branch</p>
                <p className="text-sm font-bold text-gray-900">staging-v4-gdpr-refresher</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-gray-900 font-bold border border-gray-200 rounded-lg hover:bg-gray-100 transition-all text-xs">
              Open Sandbox
            </button>
          </div>
          <button className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center shadow-lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Production to Sandbox
          </button>
        </div>

        <div className="bg-emerald-900 rounded-xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Shield className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-bold mb-4">Infrastructure Sovereignty</h3>
          <p className="text-sm text-emerald-100/80 leading-relaxed mb-8">
            All integrations are currently routing through sovereign-hardened egress proxies. No data is leaving the declared residency zones without explicit policy approval.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50">
              <span className="text-sm font-semibold">Proxy Latency Overhead</span>
              <span className="text-sm font-mono">+12ms</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50">
              <span className="text-sm font-semibold">Encrypted Egress Volume</span>
              <span className="text-sm font-mono">1.42 TB / 24h</span>
            </div>
          </div>
          <button className="mt-8 w-full py-3 bg-white text-emerald-900 font-bold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center shadow-md">
            View Traffic Sovereignty Audit
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
