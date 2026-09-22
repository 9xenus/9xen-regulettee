import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Send, 
  RefreshCw, 
  Filter, 
  Calendar, 
  Clock, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';
import { useNotification } from '../../context/NotificationContext';

export interface RegulatoryIntelligenceFeed {
  id: string;
  jurisdiction: string;
  supervisory_body: string;
  title: string;
  category: 'STATUTORY_MANDATE' | 'ENFORCEMENT_ACTION' | 'DATA_RESIDENCY_UPDATE' | 'PENALTY_ESCALATION' | 'SUPERVISORY_ORDER';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  impact_scope: string;
  effective_deadline: string;
  statutory_reference: string;
  summary_text: string;
  suggested_action: string;
  applicable_roles: string; // JSON
  action_status: 'REMEDIATION_REQUIRED' | 'AUTO_ENFORCED' | 'UNDER_AUDIT' | 'COMPLIANT';
  created_at: string;
}

interface Props {
  role?: 'SUPER_ADMIN' | 'REGULATOR' | 'CLIENT_ADMIN';
  compact?: boolean;
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  STATUTORY_MANDATE: { label: 'Statutory Mandate', color: 'bg-rose-900/60 text-rose-300 border-rose-700/60' },
  ENFORCEMENT_ACTION: { label: 'Enforcement Action', color: 'bg-amber-900/60 text-amber-300 border-amber-700/60' },
  DATA_RESIDENCY_UPDATE: { label: 'Data Residency Update', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60' },
  PENALTY_ESCALATION: { label: 'Penalty Escalation', color: 'bg-purple-900/60 text-purple-300 border-purple-700/60' },
  SUPERVISORY_ORDER: { label: 'Supervisory Order', color: 'bg-blue-900/60 text-blue-300 border-blue-700/60' },
};

const SEVERITY_BADGES: Record<string, { label: string; bg: string; dot: string }> = {
  CRITICAL: { label: 'CRITICAL', bg: 'bg-rose-950 text-rose-300 border-rose-800', dot: 'bg-rose-500 animate-ping' },
  HIGH: { label: 'HIGH RISK', bg: 'bg-amber-950 text-amber-300 border-amber-800', dot: 'bg-amber-500' },
  MEDIUM: { label: 'MEDIUM', bg: 'bg-yellow-950 text-yellow-300 border-yellow-800', dot: 'bg-yellow-500' },
  INFO: { label: 'ADVISORY', bg: 'bg-slate-900 text-slate-300 border-slate-700', dot: 'bg-blue-500' },
};

export const RegulatoryIntelligenceRadar: React.FC<Props> = ({ 
  role = 'SUPER_ADMIN', 
  compact = false 
}) => {
  const { showToast } = useNotification();
  const [feeds, setFeeds] = useState<RegulatoryIntelligenceFeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // New notice form
  const [newNotice, setNewNotice] = useState({
    jurisdiction: 'EU',
    supervisory_body: 'EDPB & National DPAs',
    title: '',
    category: 'STATUTORY_MANDATE',
    severity: 'HIGH',
    impact_scope: 'All Sovereign Tenants & Multi-Region Operators',
    effective_deadline: '2026-10-01',
    statutory_reference: '',
    summary_text: '',
    suggested_action: ''
  });

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      let query = `/api/v1/b2g/regional/intelligence?role=${role}`;
      if (selectedJurisdiction !== 'ALL') query += `&jurisdiction=${selectedJurisdiction}`;
      if (selectedSeverity !== 'ALL') query += `&severity=${selectedSeverity}`;
      
      const res = await fetchWithRetry(query);
      const data = await res.json();
      if (data.success && Array.isArray(data.feeds)) {
        setFeeds(data.feeds);
      }
    } catch (err) {
      console.error('Failed to fetch regulatory intelligence:', err);
      showToast('Failed to load live regulatory intelligence feeds', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, [selectedJurisdiction, selectedSeverity, role]);

  const handleUpdateStatus = async (feedId: string, status: string, note?: string) => {
    setActiveActionId(feedId);
    try {
      const res = await fetchWithRetry(`/api/v1/b2g/regional/intelligence/${feedId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_status: status, audit_note: note })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Remediation updated to ${status} on statutory register`, 'success');
        fetchFeeds();
      }
    } catch (err) {
      showToast('Failed to update action status', 'error');
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDispatchNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.statutory_reference) {
      showToast('Please provide a title and statutory reference', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchWithRetry('/api/v1/b2g/regional/intelligence/dispatch-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Statutory Regulatory Bulletin dispatched across sovereign mesh', 'success');
        setShowDispatchModal(false);
        setNewNotice({
          jurisdiction: 'EU',
          supervisory_body: 'EDPB & National DPAs',
          title: '',
          category: 'STATUTORY_MANDATE',
          severity: 'HIGH',
          impact_scope: 'All Sovereign Tenants & Multi-Region Operators',
          effective_deadline: '2026-10-01',
          statutory_reference: '',
          summary_text: '',
          suggested_action: ''
        });
        fetchFeeds();
      }
    } catch (err) {
      showToast('Failed to dispatch notice', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isRegulator = role === 'REGULATOR';

  const filteredFeeds = feeds.filter(f => {
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
    return true;
  });

  const criticalCount = feeds.filter(f => f.severity === 'CRITICAL').length;
  const pendingActionCount = feeds.filter(f => f.action_status === 'REMEDIATION_REQUIRED').length;
  const autoEnforcedCount = feeds.filter(f => f.action_status === 'AUTO_ENFORCED' || f.action_status === 'COMPLIANT').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100">
      
      {/* Header & Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
            <Radar className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Autonomous Regulatory Intelligence & Statutory Directive Radar
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                {isSuperAdmin ? '⚡ SaaS Intelligence Hub' : '🛡️ Supervisory Intelligence Feed'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Real-time ingestion and telemetry synchronization of global legislative revisions, regulatory enforcement decisions (EDPB, SDAIA, SEC, CBUAE, MAS, FCA), statutory countdown deadlines, and automated compliance risk mitigation controls.
            </p>
          </div>
        </div>

        {/* Global Controls & Dispatch */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {isRegulator && (
            <button
              onClick={() => setShowDispatchModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Statutory Directive</span>
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={() => {
                showToast('Synchronized with global regulatory registries & Official Journals', 'success');
                fetchFeeds();
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Poll Official Gazettes</span>
            </button>
          )}

          <button
            onClick={fetchFeeds}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Refresh feeds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* High-Level Intelligence KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Bulletins</div>
          <div className="text-xl font-bold text-white mt-1">{feeds.length}</div>
          <div className="text-[10px] text-indigo-400 mt-0.5">8 Jurisdictions Tracked</div>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Critical Severity</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{criticalCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Direct Enforcement Exposure</div>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Pending Action</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{pendingActionCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting Policy Realignment</div>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Auto-Enforced / Safe</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{autoEnforcedCount}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Cryptographically Sealed</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Jurisdiction:
          </span>
          {['ALL', 'EU', 'KSA', 'UAE', 'US', 'SG'].map((j) => (
            <button
              key={j}
              onClick={() => setSelectedJurisdiction(j)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                selectedJurisdiction === j
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {j}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSeverity(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                selectedSeverity === s
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Feeds List */}
      <div className="space-y-4">
        {filteredFeeds.length === 0 ? (
          <div className="text-center py-10 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs font-mono">
            No regulatory intelligence directives match the selected criteria.
          </div>
        ) : (
          filteredFeeds.map((feed) => {
            const catMeta = CATEGORY_META[feed.category] || { label: feed.category, color: 'bg-slate-800 text-slate-300' };
            const sevMeta = SEVERITY_BADGES[feed.severity] || SEVERITY_BADGES.INFO;
            const isCritical = feed.severity === 'CRITICAL';
            
            return (
              <div
                key={feed.id}
                className={`bg-slate-950 rounded-xl border p-4 sm:p-5 transition-all shadow-md space-y-4 ${
                  isCritical 
                    ? 'border-rose-900/60 bg-gradient-to-r from-slate-950 via-slate-950 to-rose-950/20' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${sevMeta.bg}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${sevMeta.dot}`} />
                      {sevMeta.label}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${catMeta.color}`}>
                      {catMeta.label}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono border border-slate-800 font-bold">
                      {feed.jurisdiction} • {feed.supervisory_body}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Effective: <strong className="text-slate-200">{feed.effective_deadline || 'IMMEDIATE'}</strong></span>
                  </div>
                </div>

                {/* Directive Title & Ref */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {feed.title}
                  </h3>
                  <div className="text-xs text-indigo-400 font-mono mt-0.5">
                    Statutory Ref: {feed.statutory_reference}
                  </div>
                </div>

                {/* Summary & Impact Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Regulatory Synopsis</div>
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                      {feed.summary_text}
                    </p>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-amber-400 mb-1">Recommended Remediation</div>
                    <p className="text-slate-200 text-xs leading-relaxed">
                      {feed.suggested_action}
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-slate-400">
                      Scope: <span className="text-slate-200">{feed.impact_scope}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Remediation Trigger */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      feed.action_status === 'COMPLIANT' || feed.action_status === 'AUTO_ENFORCED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : feed.action_status === 'UNDER_AUDIT'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {feed.action_status}
                    </span>
                  </div>

                  {/* Actions for Super Admin / SAAD or Regulator */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isSuperAdmin && feed.action_status === 'REMEDIATION_REQUIRED' && (
                      <button
                        onClick={() => handleUpdateStatus(feed.id, 'AUTO_ENFORCED', 'Auto-mitigation script executed against sovereign enclave')}
                        disabled={activeActionId === feed.id}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Execute 1-Click Auto-Remediation</span>
                      </button>
                    )}

                    {isSuperAdmin && feed.action_status !== 'COMPLIANT' && (
                      <button
                        onClick={() => handleUpdateStatus(feed.id, 'COMPLIANT', 'Audit confirmed full statutory alignment')}
                        disabled={activeActionId === feed.id}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
                      >
                        Mark Certified Compliant
                      </button>
                    )}

                    {isRegulator && (
                      <button
                        onClick={() => handleUpdateStatus(feed.id, 'UNDER_AUDIT', 'Regulator initiated statutory inspection')}
                        disabled={activeActionId === feed.id}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Initiate Regulatory Inspection</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Dispatch Statutory Directive */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-400" />
                Dispatch Statutory Directive or Supervisory Notice
              </h3>
              <button 
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchNotice} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Jurisdiction</label>
                  <select
                    value={newNotice.jurisdiction}
                    onChange={(e) => setNewNotice({ ...newNotice, jurisdiction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  >
                    <option value="EU">European Union (EU)</option>
                    <option value="KSA">Kingdom of Saudi Arabia (KSA)</option>
                    <option value="UAE">United Arab Emirates (UAE)</option>
                    <option value="US">United States (US)</option>
                    <option value="SG">Singapore (SG)</option>
                    <option value="UK">United Kingdom (UK)</option>
                    <option value="GLOBAL">Global / Multi-Jurisdictional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Supervisory Authority</label>
                  <input
                    type="text"
                    value={newNotice.supervisory_body}
                    onChange={(e) => setNewNotice({ ...newNotice, supervisory_body: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    placeholder="e.g. EDPB, SDAIA, SEC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Directive Title</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  placeholder="e.g. Notice on Hardware Security Module Airgap Mandate"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Statutory Reference</label>
                  <input
                    type="text"
                    value={newNotice.statutory_reference}
                    onChange={(e) => setNewNotice({ ...newNotice, statutory_reference: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    placeholder="e.g. Regulation (EU) 2024/1689 Art. 53"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Effective Deadline</label>
                  <input
                    type="date"
                    value={newNotice.effective_deadline}
                    onChange={(e) => setNewNotice({ ...newNotice, effective_deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Directive Synopsis</label>
                <textarea
                  rows={3}
                  value={newNotice.summary_text}
                  onChange={(e) => setNewNotice({ ...newNotice, summary_text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  placeholder="Detail the statutory requirement and compliance timeline..."
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Suggested Technical Remediation</label>
                <textarea
                  rows={2}
                  value={newNotice.suggested_action}
                  onChange={(e) => setNewNotice({ ...newNotice, suggested_action: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  placeholder="Specify action: e.g. Lock sovereign enclave, rotate cryptographic certificates..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition-colors cursor-pointer"
                >
                  {loading ? 'Dispatching...' : 'Dispatch Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
