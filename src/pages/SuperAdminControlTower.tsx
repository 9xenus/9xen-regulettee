import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Key, 
  Clock, CheckCircle, RefreshCw, Eye, Database, Sliders, Cpu, BrainCircuit, UserCheck, ShieldCheck 
} from 'lucide-react';
import { LegislativeNotificationBanner } from '../components/LegislativeNotificationBanner';
import { AdvancedSaasAdminSuite } from '../components/admin/AdvancedSaasAdminSuite';
import { DeepTechMissionControl } from '../components/admin/DeepTechMissionControl';
import { SaasLlmGatewayView } from '../components/admin/SaasLlmGatewayView';
import { NationalCyberCommandView } from '../components/admin/NationalCyberCommandView';
import { FixationHitlCommandCenter } from '../components/admin/FixationHitlCommandCenter';
import { useNotification } from '../context/NotificationContext';
import { fetchWithRetry } from '../lib/api-client';

export const SuperAdminControlTower: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'saas_suite' | 'audit' | 'breakglass' | 'impersonate' | 'deeptech' | 'llm_gateway' | 'national_cyber' | 'hitl_fixation'>('saas_suite');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Break-glass state
  const [bgReason, setBgReason] = useState('');
  const [bgScope, setBgScope] = useState('SOVEREIGN_PRODUCTION_ENCLAVE');
  const [bgStatus, setBgStatus] = useState<string | null>(null);

  // Impersonation state
  const [impTenant, setImpTenant] = useState('tenant_financial_core');
  const [impReason, setImpReason] = useState('');
  const [impStatus, setImpStatus] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/admin/audit-trail');
      const data = res.ok ? await res.json() : null;
      if (data?.success) {
        setAuditLogs(data.data || []);
      }
    } catch (e) {
      console.warn('Failed to load admin audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleBreakGlassRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bgReason.length < 30) {
      showToast('Justification must be at least 30 characters.', 'error');
      return;
    }
    try {
      const res = await fetchWithRetry('/api/v1/admin/break-glass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: bgReason, targetScope: bgScope })
      });
      const data = await res.json();
      if (data.success) {
        setBgStatus(`Requested successfully. Request ID: ${data.data.id}. Awaiting distinct 2-person security officer approval.`);
        setBgReason('');
        showToast('Break-glass request submitted.', 'success');
        fetchAuditLogs();
      } else {
        showToast(data.error || 'Break-glass request failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error.', 'error');
    }
  };

  const handleImpersonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (impReason.length < 20) {
      showToast('Reason must be at least 20 characters.', 'error');
      return;
    }
    try {
      const res = await fetchWithRetry('/api/v1/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: impTenant, reason: impReason })
      });
      const data = await res.json();
      if (data.success) {
        setImpStatus(`Read-Only Impersonation Session Active: ${data.sessionId} (Strict 60m TTL, logged to immutable hash-chain).`);
        setImpReason('');
        showToast('Impersonation session started.', 'warning');
        fetchAuditLogs();
      } else {
        showToast(data.error || 'Impersonation failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error.', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Sovereign Platform Operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Super Admin Control Tower</h1>
          <p className="text-sm text-slate-400 mt-1">
            Fine-grained RBAC matrix, dual-approval break-glass protocol, read-only tenant impersonation, and SHA-256 hash-chained audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            MFA Enforced
          </span>
          <button 
            onClick={fetchAuditLogs}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors cursor-pointer"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Autonomous Background Worker Legislative Alert Banner */}
      <LegislativeNotificationBanner />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('saas_suite')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'saas_suite' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>SaaS Tenant Entitlements & Enclaves</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-medium font-mono transition-colors cursor-pointer ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Immutable Audit Trail
        </button>
        <button
          onClick={() => setActiveTab('breakglass')}
          className={`px-4 py-2 rounded-xl text-xs font-medium font-mono transition-colors cursor-pointer ${
            activeTab === 'breakglass' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          2-Person Break-Glass Access
        </button>
        <button
          onClick={() => setActiveTab('impersonate')}
          className={`px-4 py-2 rounded-xl text-xs font-medium font-mono transition-colors cursor-pointer ${
            activeTab === 'impersonate' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tenant Impersonation (Read-Only)
        </button>
        <button
          onClick={() => setActiveTab('deeptech')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'deeptech' ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Deep-Tech Mission Control
        </button>
        <button
          onClick={() => setActiveTab('llm_gateway')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'llm_gateway' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          LLM Provider Gateway
        </button>
        <button
          onClick={() => setActiveTab('national_cyber')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'national_cyber' ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          National Cyber Defence
        </button>
        <button
          onClick={() => setActiveTab('hitl_fixation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'hitl_fixation' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Fixation HITL Command
        </button>
      </div>

      {/* Tab 0: Advanced SaaS Suite */}
      {activeTab === 'saas_suite' && (
        <AdvancedSaasAdminSuite />
      )}

      {/* Tab 1: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Cryptographically Chained Admin Event Ledger
            </h3>
            <span className="text-xs text-slate-500 font-mono">Algorithm: SHA-256 Prev-Hash Chaining</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Admin ID</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Resource</th>
                  <th className="pb-3 font-semibold">SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                      No admin audit logs recorded yet. Action triggers will append here.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 text-indigo-400 font-semibold">{log.admin_id}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">{log.resource}</td>
                      <td className="py-3 text-emerald-400 truncate max-w-[180px]" title={log.current_hash}>
                        {log.current_hash?.substring(0, 16)}...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Break Glass */}
      {activeTab === 'breakglass' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-rose-400" />
              Emergency Elevation Request
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Initiates emergency privileged access. Strict 2-person rule: requester cannot self-approve. Access automatically revokes after 2 hours.
            </p>

            {bgStatus && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bgStatus}</span>
              </div>
            )}

            <form onSubmit={handleBreakGlassRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Scope</label>
                <select
                  value={bgScope}
                  onChange={(e) => setBgScope(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="SOVEREIGN_PRODUCTION_ENCLAVE">All Sovereign Production Enclaves</option>
                  <option value="BILLING_REFUND_GATEWAY">Billing Refund Gateway (&gt;$50k)</option>
                  <option value="TENANT_LIFECYCLE_KILLSWITCH">Tenant Emergency Kill-Switch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Documented Justification (Min 30 chars)
                </label>
                <textarea
                  value={bgReason}
                  onChange={(e) => setBgReason(e.target.value)}
                  placeholder="e.g. Critical statutory audit inspection required by Bangladesh Bank BFIU inspection team..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Submit Break-Glass Request
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Break-Glass Policy Constraints
            </h3>
            <ul className="space-y-3 text-xs text-slate-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Dual Control:</strong> Requester ID and Approver ID are verified distinct at SQL engine level.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Hard Expiry:</strong> Elevated token expires in 120 minutes with automatic revocation sweep.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong>Full Ledger Mirroring:</strong> All elevated operations write directly to the append-only SHA-256 trail.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Impersonation */}
      {activeTab === 'impersonate' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-amber-400" />
            Strict Read-Only Tenant Impersonation
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Allows Support L2 and Platform Ops to diagnose tenant configurations. All mutating HTTP methods (POST, PUT, DELETE, PATCH) are completely blocked by middleware.
          </p>

          {impStatus && (
            <div className="mb-4 p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{impStatus}</span>
            </div>
          )}

          <form onSubmit={handleImpersonation} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Target Tenant ID</label>
              <input
                type="text"
                value={impTenant}
                onChange={(e) => setImpTenant(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Support Ticket / Legal Reason (Min 20 chars)
              </label>
              <input
                type="text"
                value={impReason}
                onChange={(e) => setImpReason(e.target.value)}
                placeholder="e.g. Investigating DSAR webhook delivery failure for Ticket #8492"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              Start Read-Only Session
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Deep-Tech Mission Control */}
      {activeTab === 'deeptech' && (
        <DeepTechMissionControl />
      )}

      {/* Tab 5: LLM Provider Gateway */}
      {activeTab === 'llm_gateway' && (
        <SaasLlmGatewayView />
      )}

      {/* Tab 6: National Cyber Defence */}
      {activeTab === 'national_cyber' && (
        <NationalCyberCommandView />
      )}

      {/* Tab 7: Fixation HITL Command */}
      {activeTab === 'hitl_fixation' && (
        <FixationHitlCommandCenter />
      )}
    </div>
  );
};
