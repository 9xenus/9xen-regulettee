import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Terminal, Search, Filter, Copy, Check, Download, Bug, Wifi, HardDrive, Zap, ShieldCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { getLogStorageMetrics, enforceLogRetention, StorageMetrics } from '../../utils/logRetentionWorker';
import { encryptData, decryptData, isEncrypted } from '../../lib/cryptoUtils';

interface SystemErrorLog {
  id: string;
  timestamp: string;
  errorMessage: string;
  stack: string;
  activePath: string;
  retryCount: number;
  status: 'RECOVERED_AUTOMATICALLY' | 'FAILED_MAX_RETRIES' | 'MANUAL_TRIGGER';
  level?: 'Warning' | 'Error';
}

const INITIAL_MOCK_ERRORS: SystemErrorLog[] = [
  {
    id: 'err-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    errorMessage: 'Failed to fetch dynamically imported module: /src/components/RegionalRegulatorManager.tsx',
    stack: 'ChunkLoadError: Loading chunk 4 failed.\n    at lazyWithRetry (router.tsx:14:22)\n    at renderWithSuspense (react-dom.production.js:1240)',
    activePath: 'REGULATORY_OPS',
    retryCount: 1,
    status: 'RECOVERED_AUTOMATICALLY',
    level: 'Warning'
  },
  {
    id: 'err-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    errorMessage: 'TypeError: Cannot read properties of undefined (reading "complianceScore")',
    stack: 'TypeError: Cannot read properties of undefined (reading "complianceScore")\n    at TenantComplianceRiskHeatmap (TenantComplianceRiskHeatmap.tsx:88:42)\n    at renderWithHooks (react-dom.production.js:15420)',
    activePath: 'OVERVIEW',
    retryCount: 3,
    status: 'FAILED_MAX_RETRIES',
    level: 'Error'
  }
];

export const SystemHealthLogView: React.FC = () => {
  const { showToast } = useNotification();
  const [logs, setLogs] = useState<SystemErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [networkHeartbeat, setNetworkHeartbeat] = useState<{
    latencyMs: number;
    timestamp: string;
    status: string;
  }>({
    latencyMs: 12,
    timestamp: new Date().toISOString(),
    status: 'STABLE'
  });

  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics>(() => getLogStorageMetrics());

  useEffect(() => {
    const handleHeartbeat = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setNetworkHeartbeat(customEvent.detail);
      }
    };

    const handleRetentionEnforced = () => {
      setStorageMetrics(getLogStorageMetrics());
      loadLogs();
    };

    window.addEventListener('socketHeartbeatLatency', handleHeartbeat);
    window.addEventListener('9xen-regulettee_log_retention_enforced', handleRetentionEnforced);

    return () => {
      window.removeEventListener('socketHeartbeatLatency', handleHeartbeat);
      window.removeEventListener('9xen-regulettee_log_retention_enforced', handleRetentionEnforced);
    };
  }, []);

  const loadLogs = async () => {
    try {
      setStorageMetrics(getLogStorageMetrics());
      const saved = localStorage.getItem('9xen-regulettee_system_error_logs');
      if (saved) {
        let parsed = [];
        if (isEncrypted(saved)) {
          try {
            const decrypted = await decryptData(saved);
            parsed = JSON.parse(decrypted);
          } catch (decErr) {
            console.error('Failed to decrypt logs:', decErr);
            // If decryption fails, maybe it's corrupted or wrong key, fallback to empty or mock
            parsed = INITIAL_MOCK_ERRORS;
          }
        } else {
          parsed = JSON.parse(saved);
        }

        if (Array.isArray(parsed)) {
          setLogs(parsed);
          return;
        }
      }
      // If none, set initial mock or empty
      setLogs(INITIAL_MOCK_ERRORS);
      const encryptedMock = await encryptData(JSON.stringify(INITIAL_MOCK_ERRORS));
      localStorage.setItem('9xen-regulettee_system_error_logs', encryptedMock);
    } catch (e) {
      console.error('Failed to load system error logs', e);
      setLogs(INITIAL_MOCK_ERRORS);
    }
  };

  const handleRunRetentionSweep = async () => {
    // Retention sweep now handled via App.tsx logic mostly, but we can re-implement here for consistency
    const saved = localStorage.getItem('9xen-regulettee_system_error_logs');
    if (!saved) return;

    try {
      let logsList = [];
      if (isEncrypted(saved)) {
        logsList = JSON.parse(await decryptData(saved));
      } else {
        logsList = JSON.parse(saved);
      }

      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const initialCount = logsList.length;
      const filtered = logsList.filter((log: any) => new Date(log.timestamp).getTime() > cutoff);
      const purgedCount = initialCount - filtered.length;

      if (purgedCount > 0) {
        const encrypted = await encryptData(JSON.stringify(filtered));
        localStorage.setItem('9xen-regulettee_system_error_logs', encrypted);
        setLogs(filtered);
        showToast(`Retention sweep complete: Purged ${purgedCount} stale log(s).`, 'success');
      } else {
        showToast(`Audit trail compliant: All logs within retention window.`, 'info');
      }
      setStorageMetrics(getLogStorageMetrics());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(() => {
      loadLogs();
    }, 5000); // Poll for new errors
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    localStorage.removeItem('9xen-regulettee_system_error_logs');
    setLogs([]);
    showToast('System health logs cleared successfully.', 'info');
  };

  const handleExportLogs = () => {
    if (logs.length === 0) {
      showToast('No logs available to export.', 'warning');
      return;
    }

    try {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `9xen-regulettee-system-health-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('System health logs exported successfully as JSON.', 'success');
    } catch (e) {
      console.error('Failed to export logs', e);
      showToast('Critical failure during log export.', 'error');
    }
  };

  const handleEmergencySnapshot = async () => {
    setIsLoading(true);
    try {
      // Collect all 9xen-regulettee relevant local storage data
      const snapshot: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('9xen-regulettee_') || key.startsWith('sovereign_'))) {
          snapshot[key] = localStorage.getItem(key);
        }
      }

      const payload = {
        timestamp: new Date().toISOString(),
        nodeId: 'ENCLAVE-EU-CENTRAL-1-PRIMARY',
        snapshotType: 'EMERGENCY_DUMP',
        data: snapshot,
        logs: logs
      };

      // In a real app, this would be a secure fetch to a protected endpoint
      // fetch('/api/system/emergency-snapshot', { method: 'POST', ... })
      
      // Simulate backend latency
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('[EmergencySnapshot] Snapshot payload dispatched to secure endpoint:', payload);
      showToast('Emergency snapshot successfully dispatched to secure backend enclave.', 'success');
    } catch (e) {
      console.error('Snapshot failure:', e);
      showToast('Failed to perform emergency snapshot.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateError = async () => {
    try {
      const simLog: SystemErrorLog = {
        id: `err-sim-${Date.now()}`,
        timestamp: new Date().toISOString(),
        errorMessage: 'Simulated Diagnostic Exception: Sovereign Enclave Telemetry Handshake Timeout',
        stack: 'Error: Sovereign Enclave Telemetry Handshake Timeout\n    at WebSocketClient.connect (ws-client.ts:112:15)\n    at async runHealthProbe (SystemHealthLogView.tsx:85:8)',
        activePath: 'SYSTEM_HEALTH_LOG',
        retryCount: 2,
        status: 'RECOVERED_AUTOMATICALLY'
      };
      const updated = [simLog, ...logs];
      setLogs(updated);
      const encrypted = await encryptData(JSON.stringify(updated));
      localStorage.setItem('9xen-regulettee_system_error_logs', encrypted);
      showToast('Simulated error injected into system observability telemetry.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyStack = (id: string, stack: string) => {
    navigator.clipboard.writeText(stack);
    setCopiedId(id);
    showToast('Stack trace copied to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.activePath.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.stack.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalErrors = logs.length;
  const recoveredCount = logs.filter(l => l.status === 'RECOVERED_AUTOMATICALLY').length;
  const criticalCount = logs.filter(l => l.status === 'FAILED_MAX_RETRIES').length;

  const handleToggleSelectAll = () => {
    if (selectedLogIds.length === filteredLogs.length) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(filteredLogs.map(l => l.id));
    }
  };

  const handleToggleSelectLog = (id: string) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedLogIds.length === 0) return;
    const remaining = logs.filter(l => !selectedLogIds.includes(l.id));
    setLogs(remaining);
    try {
      const encrypted = await encryptData(JSON.stringify(remaining));
      localStorage.setItem('9xen-regulettee_system_error_logs', encrypted);
      setSelectedLogIds([]);
      showToast(`Successfully deleted ${selectedLogIds.length} selected error log(s).`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Metrics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">System Health & Error Telemetry Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">Track caught ErrorBoundary exceptions, stack traces, and automatic recovery attempts in real-time.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleEmergencySnapshot}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl border border-rose-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Perform Emergency Snapshot of local state to secure endpoint"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            <span>Emergency Snapshot</span>
          </button>
          <button
            onClick={handleRunRetentionSweep}
            className="px-3.5 py-2.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold rounded-xl border border-cyan-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Enforce 7-Day Retention Policy & Clear Stale Storage"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Enforce 7D Retention Sweep</span>
          </button>
          <button
            onClick={handleSimulateError}
            className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Bug className="w-4 h-4" />
            <span>Simulate Error</span>
          </button>
          <button
            onClick={loadLogs}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportLogs}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Retention Daemon Telemetry Bar */}
      <div className="bg-slate-900 border border-slate-800 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white">Background Log Retention Daemon</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                7-Day Retention Policy Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automatically enforces 7-day retention and checks localStorage size on app init & background execution cycles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="text-right">
            <span className="text-slate-400 text-[10px] block font-sans font-semibold">Local Storage Usage</span>
            <span className="font-bold text-cyan-300">{storageMetrics.logKeysFormatted} / {storageMetrics.totalLocalStorageFormatted}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[10px] block font-sans font-semibold">Tracked Stores</span>
            <span className="font-bold text-white">{storageMetrics.logKeysCount} Keys ({storageMetrics.usagePercentage}% quota)</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Logged Exceptions</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalErrors}</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-100">
            <Terminal className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Successfully Recovered</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{recoveredCount}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical Unresolved Failures</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{criticalCount}</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Socket.io RTT Latency</span>
            </div>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">{networkHeartbeat.latencyMs} <span className="text-xs font-normal text-slate-500">ms</span></span>
            <span className="text-[10px] font-mono text-slate-400">Heartbeat: {new Date(networkHeartbeat.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Wifi className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search component names, error keywords, stack traces..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="RECOVERED_AUTOMATICALLY">Recovered Automatically</option>
              <option value="FAILED_MAX_RETRIES">Critical / Failed Retries</option>
            </select>
          </div>
        </div>

        {/* Quick Component & Keyword Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Filters:</span>
          {[
            { label: 'All', query: '' },
            { label: 'RegionalRegulatorManager', query: 'RegionalRegulatorManager' },
            { label: 'TenantComplianceRiskHeatmap', query: 'TenantComplianceRiskHeatmap' },
            { label: 'EnforcementTemplateManager', query: 'EnforcementTemplateManager' },
            { label: 'REGULATORY_OPS', query: 'REGULATORY_OPS' },
            { label: 'TypeError', query: 'TypeError' },
          ].map(chip => (
            <button
              key={chip.label}
              onClick={() => setSearchQuery(chip.query)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                searchQuery === chip.query
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-bold text-rose-600 hover:underline ml-auto cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Logs Table / Card List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={filteredLogs.length > 0 && selectedLogIds.length === filteredLogs.length}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <h3 className="font-bold text-sm text-slate-900">
              Captured Exception Log Ledger ({filteredLogs.length})
              {selectedLogIds.length > 0 && <span className="ml-2 text-xs text-indigo-600">({selectedLogIds.length} selected)</span>}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {selectedLogIds.length > 0 && (
              <button
                onClick={handleBulkDeleteSelected}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedLogIds.length})</span>
              </button>
            )}
            <span className="text-[10px] font-mono text-slate-400">ErrorBoundary Active Telemetry</span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
            <h4 className="font-bold text-slate-800 text-sm">No Error Logs Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your application components are running smoothly without ErrorBoundary exceptions or unhandled runtime failures.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredLogs.map((log) => {
              const isRecovered = log.status === 'RECOVERED_AUTOMATICALLY';
              const isSelected = selectedLogIds.includes(log.id);
              return (
                <div key={log.id} className={`p-6 transition-colors space-y-3 ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/70'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectLog(log.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        isRecovered ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isRecovered ? 'Auto-Recovered' : 'Critical Failure'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${(log.level || 'Error') === 'Error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        {log.level || 'Error'}
                      </span>
                      <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        📍 Path: {log.activePath}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        🔄 Retries: {log.retryCount}/3
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      <button
                        onClick={() => handleCopyStack(log.id, log.stack)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy stack trace"
                      >
                        {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === log.id ? 'Copied' : 'Copy Stack'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-900 bg-red-50/60 border border-red-200/60 p-3 rounded-xl font-mono">
                    {log.errorMessage}
                  </div>

                  <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                    <pre className="whitespace-pre-wrap">{log.stack}</pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
