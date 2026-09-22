import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertOctagon, Sliders, RefreshCw,
  Lock, Unlock, Play, UserX, CheckCircle, AlertTriangle, Filter,
  Eye, Zap, Shield, Key, ArrowUpRight, Activity, Terminal
} from 'lucide-react';

interface RateLimitPolicy {
  id: string;
  name: string;
  description: string;
  windowMs: number;
  maxRequests: number;
  burstAllowance: number;
  autoJailThreshold: number;
  autoJailDurationMs: number;
  errorMessage: string;
  statusCode: number;
  enabled: boolean;
}

interface IpJailRecord {
  ip: string;
  reason: string;
  jailedAt: string;
  expiresAt: string;
  violationCount: number;
  manual: boolean;
}

interface WhitelistRecord {
  ipOrPrefix: string;
  description: string;
  addedAt: string;
}

interface RateLimitAuditLog {
  id: string;
  timestamp: string;
  ip: string;
  path: string;
  method: string;
  policy: string;
  reason: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userAgent: string;
  tenantId?: string;
  retryAfterSeconds: number;
  blockedCountForIp: number;
}

interface RateLimitMetrics {
  totalInspectedRequests: number;
  totalBlockedRequests: number;
  totalBruteForceMitigations: number;
  activeQuarantinedIpsCount: number;
  activeTrackedBucketsCount: number;
  whitelistedIpsCount: number;
  startedAt: string;
  systemHealth: string;
  topViolatorIps: Array<{ ip: string; count: number; lastSeen: string; policy: string }>;
  policies: RateLimitPolicy[];
  jailedIps: IpJailRecord[];
  whitelistedIps: WhitelistRecord[];
}

export const RateLimitingControlCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<RateLimitMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<RateLimitAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'policies' | 'quarantine' | 'logs' | 'simulator'>('policies');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit policy state
  const [editingPolicy, setEditingPolicy] = useState<RateLimitPolicy | null>(null);

  // Manual Jail Modal
  const [jailIpInput, setJailIpInput] = useState('');
  const [jailReasonInput, setJailReasonInput] = useState('Suspicious administrative scanning / brute force');
  const [jailDurationInput, setJailDurationInput] = useState(60);
  const [showJailModal, setShowJailModal] = useState(false);

  // Whitelist Modal
  const [whitelistIpInput, setWhitelistIpInput] = useState('');
  const [whitelistDescInput, setWhitelistDescInput] = useState('Trusted Internal Sovereign Service');
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);

  // Simulator state
  const [simPath, setSimPath] = useState('/api/v1/saas-admin/entitlements');
  const [simIp, setSimIp] = useState('198.51.100.42');
  const [simCount, setSimCount] = useState(15);
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [resStatus, resLogs] = await Promise.all([
        fetch('/api/v1/saas-admin/rate-limiting/status'),
        fetch('/api/v1/saas-admin/rate-limiting/audit-logs?limit=50')
      ]);

      if (resStatus.ok) {
        const data = await resStatus.json();
        if (data.success) {
          setMetrics(data);
        }
      }

      if (resLogs.ok) {
        const logsData = await resLogs.json();
        if (logsData.success) {
          setAuditLogs(logsData.data || []);
        }
      }
    } catch (err: any) {
      showToast('Failed to load rate limiting status: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    try {
      const res = await fetch(`/api/v1/saas-admin/rate-limiting/policies/${editingPolicy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPolicy)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Policy '${editingPolicy.name}' updated.`);
        setEditingPolicy(null);
        fetchStatus();
      } else {
        showToast(data.error || 'Failed to update policy', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleJailIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jailIpInput.trim()) return;

    try {
      const res = await fetch('/api/v1/saas-admin/rate-limiting/jail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: jailIpInput.trim(),
          reason: jailReasonInput,
          durationMinutes: jailDurationInput
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setShowJailModal(false);
        setJailIpInput('');
        fetchStatus();
      } else {
        showToast(data.error || 'Failed to quarantine IP', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUnjailIp = async (ip: string) => {
    try {
      const res = await fetch('/api/v1/saas-admin/rate-limiting/unjail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchStatus();
      } else {
        showToast(data.error || 'Failed to release IP', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistIpInput.trim()) return;

    try {
      const res = await fetch('/api/v1/saas-admin/rate-limiting/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: whitelistIpInput.trim(),
          description: whitelistDescInput
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setShowWhitelistModal(false);
        setWhitelistIpInput('');
        fetchStatus();
      } else {
        showToast(data.error || 'Failed to whitelist IP', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveWhitelist = async (ip: string) => {
    try {
      const res = await fetch(`/api/v1/saas-admin/rate-limiting/whitelist/${encodeURIComponent(ip)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchStatus();
      } else {
        showToast(data.error || 'Failed to remove IP from whitelist', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRunSimulator = async () => {
    setSimRunning(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/v1/saas-admin/rate-limiting/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPath: simPath,
          simulatedIp: simIp,
          attackCount: simCount
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimResult(data.data);
        showToast(`Simulation complete: ${data.data.blockedAttempts}/${data.data.totalAttempts} attempts blocked.`);
        fetchStatus();
      } else {
        showToast(data.error || 'Simulation error', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSimRunning(false);
    }
  };

  const handleResetMetrics = async () => {
    if (!window.confirm('Are you sure you want to reset live rate-limiting counters?')) return;
    try {
      const res = await fetch('/api/v1/saas-admin/rate-limiting/reset-metrics', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Metrics reset successfully.');
        fetchStatus();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6" id="rate-limiting-control-center">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 backdrop-blur-md'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/40 backdrop-blur-md'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          {notification.message}
        </div>
      )}

      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                Centralized API Rate Limiter & Brute-Force Defense
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ACTIVE GUARD
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Multi-tier sliding window rate limiting protecting administrative endpoints, authentication, and sovereign API gateways.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleResetMetrics}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition"
          >
            Reset Counters
          </button>
          <button
            onClick={() => setShowJailModal(true)}
            className="px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            Quarantine IP
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Inspected API Calls</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {metrics?.totalInspectedRequests?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400">●</span> Real-time sliding window inspection
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Rate-Limit Breaches Throttled</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {metrics?.totalBlockedRequests?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            HTTP 429 RFC Retry-After enforced
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Brute-Force Mitigations</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {metrics?.totalBruteForceMitigations?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Credential spray & admin attack blocks
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active IP Quarantines / Jails</span>
            <UserX className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            {metrics?.activeQuarantinedIpsCount || '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics?.whitelistedIpsCount || 0} whitelisted network nodes
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('policies')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeSubTab === 'policies'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Rate Limit Policies ({metrics?.policies?.length || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('quarantine')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeSubTab === 'quarantine'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          IP Quarantine & Whitelist ({metrics?.jailedIps?.length || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeSubTab === 'logs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Security Audit Logs ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
            activeSubTab === 'simulator'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Attack & Defense Simulator
        </button>
      </div>

      {/* TAB 1: POLICIES */}
      {activeSubTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics?.policies?.map((policy) => {
              const isStrict = policy.id === 'admin' || policy.id === 'auth';
              return (
                <div
                  key={policy.id}
                  className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden ${
                    isStrict ? 'border-indigo-500/30 shadow-indigo-950/20 shadow-md' : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                        isStrict ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {policy.id} tier
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        policy.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {policy.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 mb-1">{policy.name}</h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{policy.description}</p>

                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs font-mono mb-4">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Max Limit:</span>
                        <span className="font-semibold text-slate-100">{policy.maxRequests} req / {(policy.windowMs / 1000)}s</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Burst Buffer:</span>
                        <span>+{policy.burstAllowance} req</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Auto-Jail Threshold:</span>
                        <span className="text-rose-400 font-semibold">{policy.autoJailThreshold} violations</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Jail Duration:</span>
                        <span>{policy.autoJailDurationMs / 60000} mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      HTTP {policy.statusCode}
                    </span>
                    <button
                      onClick={() => setEditingPolicy({ ...policy })}
                      className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      Configure Tier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: QUARANTINE & WHITELIST */}
      {activeSubTab === 'quarantine' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quarantined IPs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <UserX className="w-4 h-4 text-rose-400" />
                  Active Quarantined IPs (Jail)
                </h3>
                <p className="text-xs text-slate-400">Suspicious clients blocked from accessing any administrative or auth endpoints.</p>
              </div>
              <button
                onClick={() => setShowJailModal(true)}
                className="px-2.5 py-1 text-xs font-medium bg-rose-600/80 hover:bg-rose-500 text-white rounded transition"
              >
                + Jail IP
              </button>
            </div>

            {(!metrics?.jailedIps || metrics.jailedIps.length === 0) ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-lg border border-slate-800/60 text-slate-500 text-xs">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500/40" />
                No IP addresses are currently quarantined. All active traffic is adhering to limits.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {metrics.jailedIps.map((jail) => (
                  <div key={jail.ip} className="bg-slate-950 border border-rose-500/20 rounded-lg p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-300">{jail.ip}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          jail.manual ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {jail.manual ? 'MANUAL JAIL' : 'AUTO BRUTE-FORCE JAIL'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{jail.reason}</p>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Expires: {new Date(jail.expiresAt).toLocaleTimeString()} ({new Date(jail.expiresAt).toLocaleDateString()})
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnjailIp(jail.ip)}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-emerald-900/40 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 rounded transition flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" />
                      Release
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Whitelisted IP Addresses */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Whitelisted Networks & Sovereign Proxies
                </h3>
                <p className="text-xs text-slate-400">Trusted IPs exempt from rate limits and automated quarantine.</p>
              </div>
              <button
                onClick={() => setShowWhitelistModal(true)}
                className="px-2.5 py-1 text-xs font-medium bg-emerald-600/80 hover:bg-emerald-500 text-white rounded transition"
              >
                + Add Whitelist
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {metrics?.whitelistedIps?.map((w) => (
                <div key={w.ipOrPrefix} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-emerald-300">{w.ipOrPrefix}</div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{w.description}</p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Added: {new Date(w.addedAt).toLocaleString()}
                    </div>
                  </div>
                  {w.ipOrPrefix !== '127.0.0.1' && (
                    <button
                      onClick={() => handleRemoveWhitelist(w.ipOrPrefix)}
                      className="px-2 py-1 text-[11px] text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-slate-700 rounded transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Live Rate-Limiting Security Audit Trail</h3>
              <p className="text-xs text-slate-400">Chronological telemetry of every throttled request, burst violation, and brute-force lock.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Displaying {auditLogs.length} events
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-lg border border-slate-800/60">
              No violation events recorded yet. Rate limiting active in passive/enforcing mode.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-sans uppercase text-[10px]">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Threat</th>
                    <th className="pb-2">IP Address</th>
                    <th className="pb-2">Target Endpoint</th>
                    <th className="pb-2">Policy Tier</th>
                    <th className="pb-2">Reason</th>
                    <th className="pb-2">Retry-After</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          log.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          log.threatLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {log.threatLevel}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-slate-200">
                        {log.ip}
                      </td>
                      <td className="py-2.5 text-slate-300">
                        <span className="text-slate-500">{log.method}</span> {log.path}
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {log.policy}
                      </td>
                      <td className="py-2.5 text-slate-300">
                        {log.reason}
                      </td>
                      <td className="py-2.5 text-amber-400 font-semibold">
                        {log.retryAfterSeconds}s
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => {
                            setJailIpInput(log.ip);
                            setShowJailModal(true);
                          }}
                          className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded border border-slate-700"
                        >
                          Quarantine
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SIMULATOR & PEN-TEST BENCH */}
      {activeSubTab === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Anti-Brute-Force & Denial-of-Service Defense Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Execute safe synthetic penetration tests to observe how the rate-limiting middleware throttles rapid requests and engages automated IP quarantine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Endpoint</label>
              <select
                value={simPath}
                onChange={(e) => setSimPath(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="/api/v1/saas-admin/entitlements">Admin Tier: /api/v1/saas-admin/entitlements</option>
                <option value="/api/auth/login">Auth Tier: /api/auth/login</option>
                <option value="/api/v1/vault/upload-file">Sensitive Tier: /api/v1/vault/upload-file</option>
                <option value="/api/v1/prt/integrations">Tenant API Tier: /api/v1/prt/integrations</option>
                <option value="/api/v1/public/ping">Global API: /api/v1/public/ping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Simulated Attacker IP</label>
              <input
                type="text"
                value={simIp}
                onChange={(e) => setSimIp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Rapid Burst Requests ({simCount})</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={simCount}
                  onChange={(e) => setSimCount(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <button
                  onClick={handleRunSimulator}
                  disabled={simRunning}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-md transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5" />
                  {simRunning ? 'Simulating...' : 'Launch Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Simulation Output */}
          {simResult && (
            <div className="bg-slate-950 border border-indigo-500/20 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Simulation Report</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Total: {simResult.totalAttempts}</span>
                  <span className="text-rose-400 font-bold">Blocked: {simResult.blockedAttempts}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    simResult.quarantined ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {simResult.quarantined ? 'AUTO-QUARANTINED (JAIL ENGAGED)' : 'RATE-THROTTLED'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 font-mono text-[11px]">
                {simResult.history?.map((h: any) => (
                  <div
                    key={h.attemptNumber}
                    className={`p-2 rounded flex items-center justify-between border ${
                      h.allowed
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                        : h.jailed
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <span>
                      Attempt #{h.attemptNumber}: HTTP {h.statusCode}
                      {h.allowed ? ' [ALLOWED - 200 OK]' : h.jailed ? ' [QUARANTINED - 403 FORBIDDEN]' : ' [THROTTLED - 429 TOO MANY REQUESTS]'}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {h.allowed ? `Remaining: ${h.remaining}` : (h.reason || 'Rate limit exceeded')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDIT POLICY */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Tune Rate Limit Policy: {editingPolicy.name}
            </h3>

            <form onSubmit={handleUpdatePolicy} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Max Requests per Window</label>
                  <input
                    type="number"
                    value={editingPolicy.maxRequests}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, maxRequests: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    min="1"
                    max="10000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Window Size (Seconds)</label>
                  <input
                    type="number"
                    value={editingPolicy.windowMs / 1000}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, windowMs: Number(e.target.value) * 1000 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    min="5"
                    max="3600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Burst Buffer Allowance</label>
                  <input
                    type="number"
                    value={editingPolicy.burstAllowance}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, burstAllowance: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Auto-Jail Threshold (Breaches)</label>
                  <input
                    type="number"
                    value={editingPolicy.autoJailThreshold}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, autoJailThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Custom Error Message</label>
                <input
                  type="text"
                  value={editingPolicy.errorMessage}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, errorMessage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="policy-enabled-check"
                  checked={editingPolicy.enabled}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, enabled: e.target.checked })}
                  className="accent-indigo-500 rounded"
                />
                <label htmlFor="policy-enabled-check" className="text-slate-300">Policy Enabled & Enforcing</label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                >
                  Save Policy Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL JAIL */}
      {showJailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              Quarantine IP Address
            </h3>
            <p className="text-xs text-slate-400">
              Immediately block all incoming traffic from this IP address across all API endpoints.
            </p>

            <form onSubmit={handleJailIp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target IP Address</label>
                <input
                  type="text"
                  placeholder="e.g. 198.51.100.4"
                  value={jailIpInput}
                  onChange={(e) => setJailIpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Quarantine Duration (Minutes)</label>
                <input
                  type="number"
                  value={jailDurationInput}
                  onChange={(e) => setJailDurationInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  min="5"
                  max="10080"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Justification / Reason</label>
                <input
                  type="text"
                  value={jailReasonInput}
                  onChange={(e) => setJailReasonInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowJailModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded"
                >
                  Enforce Quarantine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WHITELIST */}
      {showWhitelistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Whitelist IP Address
            </h3>

            <form onSubmit={handleAddWhitelist} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">IP Address or Subnet</label>
                <input
                  type="text"
                  placeholder="e.g. 10.0.0.1"
                  value={whitelistIpInput}
                  onChange={(e) => setWhitelistIpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Identifier</label>
                <input
                  type="text"
                  value={whitelistDescInput}
                  onChange={(e) => setWhitelistDescInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWhitelistModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                >
                  Add to Whitelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
