import React, { useState } from 'react';
import {
  Building2,
  Server,
  Activity,
  ShieldCheck,
  RefreshCw,
  Zap,
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Terminal,
  Database,
  Users,
  Settings,
  Send,
  Sliders,
  Share2
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export interface ConnectorItem {
  id: string;
  name: string;
  provider: 'Salesforce' | 'SAP' | 'Splunk' | 'Datadog' | 'Okta' | 'Oracle';
  category: 'CRM_COMPLIANCE' | 'ERP_AUDIT' | 'SIEM_STREAM' | 'IAM_SCIM';
  status: 'HEALTHY' | 'SYNCING' | 'WARNING' | 'DISABLED';
  endpoint: string;
  lastSync: string;
  recordsProcessed: number;
  latencyMs: number;
  features: string[];
}

export const ErpSiemIntegrationWidget: React.FC = () => {
  const { showToast } = useNotification();
  const [selectedConnector, setSelectedConnector] = useState<string>('salesforce');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [redactPii, setRedactPii] = useState<boolean>(true);
  const [enableCefFormat, setEnableCefFormat] = useState<boolean>(true);

  const [connectors, setConnectors] = useState<ConnectorItem[]>([
    {
      id: 'salesforce',
      name: 'Salesforce CRM Compliance Sync',
      provider: 'Salesforce',
      category: 'CRM_COMPLIANCE',
      status: 'HEALTHY',
      endpoint: 'https://sovereign-org.my.salesforce.com/services/data/v58.0/sobjects/',
      lastSync: '2 mins ago',
      recordsProcessed: 14250,
      latencyMs: 124,
      features: ['GDPR Art. 17 Deletion Hook', 'Consent Ledger Sync', 'Contact Anonymization']
    },
    {
      id: 'sap',
      name: 'SAP S/4HANA ERP Audit Bridge',
      provider: 'SAP',
      category: 'ERP_AUDIT',
      status: 'HEALTHY',
      endpoint: 'sap-prod.sovereign-node.eu-central-1.internal:8000/sap/bc/srt/rfc/',
      lastSync: '10 mins ago',
      recordsProcessed: 89400,
      latencyMs: 210,
      features: ['Vendor Sanctions Screening', 'GL Audit Trail Verification', 'Tax Invoice Validation']
    },
    {
      id: 'splunk',
      name: 'Splunk & Datadog SIEM Streamer',
      provider: 'Splunk',
      category: 'SIEM_STREAM',
      status: 'HEALTHY',
      endpoint: 'https://hec.splunk.internal:8088/services/collector/raw',
      lastSync: 'Real-Time (Streaming)',
      recordsProcessed: 1845200,
      latencyMs: 18,
      features: ['CEF/Syslog Formatted Logs', 'HMAC-SHA256 Signatures', 'TLS 1.3 Strict Tunnel']
    },
    {
      id: 'okta',
      name: 'Okta & SCIM 2.0 User Provisioning',
      provider: 'Okta',
      category: 'IAM_SCIM',
      status: 'HEALTHY',
      endpoint: 'https://sovereign-org.okta.com/scim/v2/',
      lastSync: '1 hour ago',
      recordsProcessed: 420,
      latencyMs: 85,
      features: ['Automated Role Provisioning', 'Zero-Trust Deprovisioning', 'Group Membership Sync']
    }
  ]);

  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [Splunk HEC] Streamed 1,240 CEF audit events securely over TLS 1.3`,
    `[${new Date().toLocaleTimeString()}] [Salesforce Sync] GDPR Art. 17 right-to-be-forgotten hook verified for 3 records`,
    `[${new Date().toLocaleTimeString()}] [SAP RFC] Financial ledger audit batch #4912 synchronized successfully`
  ]);

  const handleTestConnection = async (id: string) => {
    setIsTesting(true);
    const conn = connectors.find(c => c.id === id);
    showToast(`Testing connectivity to ${conn?.name || 'endpoint'}...`, 'info');

    setTimeout(() => {
      setIsTesting(false);
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [PING TEST SUCCESS] Endpoint: ${conn?.endpoint} (Latency: ${Math.floor(20 + Math.random() * 80)}ms, TLS Certificate Valid)`,
        ...prev
      ]);
      showToast(`Connected successfully to ${conn?.name}! All SSL handshakes verified.`, 'success');
    }, 1200);
  };

  const handleManualSync = async (id: string) => {
    setIsSyncing(true);
    const conn = connectors.find(c => c.id === id);

    setTimeout(() => {
      setIsSyncing(false);
      setConnectors(prev =>
        prev.map(c => (c.id === id ? { ...c, lastSync: 'Just now', recordsProcessed: c.recordsProcessed + 150 } : c))
      );
      setLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [MANUAL SYNC COMPLETED] ${conn?.name}: Processed +150 records in 480ms. Redaction: ${redactPii ? 'ENABLED' : 'DISABLED'}`,
        ...prev
      ]);
      showToast(`Manual synchronization complete for ${conn?.name}!`, 'success');
    }, 1500);
  };

  const activeConnectorObj = connectors.find(c => c.id === selectedConnector) || connectors[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-wider uppercase mb-1">
              <Building2 className="w-4 h-4" />
              <span>Enterprise ERP, CRM & SIEM Connector Suite</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sovereign Enterprise ERP & SIEM Forwarders
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Seamlessly bridge sovereign compliance events with Salesforce, SAP S/4HANA, Splunk, Datadog, and Okta SCIM 2.0 without exposing confidential database credentials or unencrypted PII.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              4 Connectors Active
            </span>
          </div>
        </div>

        {/* Connector Grid Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {connectors.map(conn => {
            const isSelected = conn.id === selectedConnector;
            return (
              <button
                key={conn.id}
                onClick={() => setSelectedConnector(conn.id)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-100 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {conn.provider}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="text-xs font-bold truncate mb-1">{conn.name}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{conn.recordsProcessed.toLocaleString()} records</span>
                  <span>{conn.latencyMs}ms</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Connector Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Configuration & Controls */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeConnectorObj.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate max-w-md">
                  {activeConnectorObj.endpoint}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestConnection(activeConnectorObj.id)}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{isTesting ? 'Testing...' : 'Ping Test'}</span>
              </button>

              <button
                onClick={() => handleManualSync(activeConnectorObj.id)}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          {/* Active Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Automated Connector Features & Hooks
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeConnectorObj.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Masking Rules */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-500" />
              Sovereign Field Redaction & Encoding
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">HMAC PII Hashing</span>
                  <span className="text-[10px] text-slate-500 block">Hash emails & NIDs prior to egress</span>
                </div>
                <input
                  type="checkbox"
                  checked={redactPii}
                  onChange={e => setRedactPii(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">CEF/Syslog Syntax</span>
                  <span className="text-[10px] text-slate-500 block">Format for ArcSight / Splunk SIEM</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableCefFormat}
                  onChange={e => setEnableCefFormat(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Telemetry Stream Console */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-inner flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                <Terminal className="w-4 h-4" />
                <span>Egress Telemetry Console</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">TLS 1.3 Active</span>
            </div>

            <div className="space-y-2 font-mono text-[11px] max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-900/90 border border-slate-800 text-slate-300 leading-relaxed break-all">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Encoding: UTF-8 / JSON / CEF</span>
            <span>Signature: HMAC-SHA256 Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
