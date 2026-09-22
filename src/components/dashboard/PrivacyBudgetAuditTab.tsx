import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Activity, 
  Clock, 
  User, 
  Database, 
  AlertTriangle, 
  RefreshCw, 
  Search,
  Lock,
  CheckCircle2,
  XCircle,
  TrendingDown,
  X,
  FileText,
  Info,
  Key,
  Calendar,
  Filter,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrivacyAuditLog {
  id: string;
  tenantId: string;
  cohortId: string;
  queryText: string;
  triggeredBy: string;
  epsilonCost: number;
  createdAt: string;
  status?: 'ALLOWED' | 'BLOCKED';
  decisionReason?: string;
}

export const PrivacyBudgetAuditTab: React.FC = () => {
  const [logs, setLogs] = useState<PrivacyAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ALLOWED' | 'BLOCKED'>('ALL');
  const [timeRange, setTimeRange] = useState<'ALL' | 'TODAY' | '7D' | '30D'>('ALL');
  const [selectedLog, setSelectedLog] = useState<PrivacyAuditLog | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/privacy/budget-audit');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch privacy budget audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.queryText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.triggeredBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.cohortId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.decisionReason && log.decisionReason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCohort = selectedCohort === 'ALL' || log.cohortId === selectedCohort;
    const matchesStatus = statusFilter === 'ALL' || (log.status || 'ALLOWED') === statusFilter;

    let matchesTime = true;
    if (timeRange !== 'ALL') {
      const logDate = new Date(log.createdAt).getTime();
      const now = Date.now();
      const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
      if (timeRange === 'TODAY') {
        matchesTime = diffDays <= 1;
      } else if (timeRange === '7D') {
        matchesTime = diffDays <= 7;
      } else if (timeRange === '30D') {
        matchesTime = diffDays <= 30;
      }
    }

    return matchesSearch && matchesCohort && matchesStatus && matchesTime;
  });

  const totalEpsilon = logs.reduce((acc, curr) => acc + (curr.epsilonCost || 0), 0);
  const uniqueCohorts = Array.from(new Set(logs.map(l => l.cohortId)));
  const allowedCount = logs.filter(l => (l.status || 'ALLOWED') === 'ALLOWED').length;
  const blockedCount = logs.filter(l => l.status === 'BLOCKED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 relative">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Differential Privacy (ε) Accountant
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Backstop Enforced
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Privacy Budget Audit Ledger</h2>
          <p className="text-slate-300 text-xs max-w-2xl">
            Tracks cumulative epsilon ($\varepsilon$) consumption across cohorts with visual Allowed & Blocked enforcement indicators, preventing repeated query attacks and unmasked PII extraction.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total $\varepsilon$ Consumed</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalEpsilon.toFixed(2)} / 1.00</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Within sovereign safety threshold</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allowed Queries</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{allowedCount} Executed</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">DP Noise Injected & Approved</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blocked Queries</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{blockedCount} Intercepted</h3>
            <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Budget cap / PII guards</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monitored Cohorts</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{uniqueCohorts.length} Active</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Protected data partitions</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Advanced Filter and Search Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" /> Filter & Search Controls
          </h3>
          <span className="text-xs font-mono text-slate-400">Showing {filteredLogs.length} of {logs.length} records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Keyword Search</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search queries, actors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Decision Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Enforcement Decision</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({logs.length})
              </button>
              <button
                onClick={() => setStatusFilter('ALLOWED')}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALLOWED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Allowed ({allowedCount})
              </button>
              <button
                onClick={() => setStatusFilter('BLOCKED')}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === 'BLOCKED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Blocked ({blockedCount})
              </button>
            </div>
          </div>

          {/* Cohort ID Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Specific Cohort ID</label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Cohorts ({uniqueCohorts.length})</option>
              {uniqueCohorts.map(cohort => (
                <option key={cohort} value={cohort}>{cohort}</option>
              ))}
            </select>
          </div>

          {/* Timestamp Range Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Timestamp Range</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setTimeRange('ALL')}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  timeRange === 'ALL' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTimeRange('TODAY')}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  timeRange === 'TODAY' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeRange('7D')}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  timeRange === '7D' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30D')}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  timeRange === '30D' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabular List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" /> Recent Query Ledger ({filteredLogs.length})
          </h3>
          <span className="text-xs text-slate-400">Click any row to inspect full enforcement context</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading persistent budget audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">No budget audit records match the filters</p>
            <p className="text-[11px] text-slate-400 mt-1">Try resetting your search terms or decision selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-6">Enforcement Status</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Cohort ID</th>
                  <th className="py-3.5 px-6">Query Statement</th>
                  <th className="py-3.5 px-6">Triggered By (Actor)</th>
                  <th className="py-3.5 px-6 text-right">Privacy Cost ($\varepsilon$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log) => {
                  const isBlocked = log.status === 'BLOCKED';

                  return (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer group ${
                        isBlocked ? 'bg-rose-50/20 hover:bg-rose-50/50' : 'hover:bg-indigo-50/40'
                      }`}
                      title="Click to view full enforcement and query context"
                    >
                      {/* Visual Allowed / Blocked Status Indicator */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Allowed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="py-4 px-6 font-bold text-indigo-600 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg group-hover:bg-indigo-100 transition-colors font-mono">
                          {log.cohortId}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-800 font-mono text-[11px] max-w-md truncate" title={log.queryText}>
                        {log.queryText}
                      </td>

                      <td className="py-4 px-6 text-slate-700 whitespace-nowrap flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {log.triggeredBy}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold">
                        {isBlocked ? (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-mono">
                            0.00 ε (Blocked)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono">
                            +{log.epsilonCost.toFixed(2)} ε
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-Modal Drawer for Audit Log Details */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
            >
              {/* Drawer Header */}
              <div className={`px-6 py-5 text-white flex items-center justify-between ${
                selectedLog.status === 'BLOCKED' ? 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900' : 'bg-slate-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${
                    selectedLog.status === 'BLOCKED' ? 'bg-rose-500/20 text-rose-400 border-rose-400/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-400/30'
                  }`}>
                    {selectedLog.status === 'BLOCKED' ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">Privacy Enforcement Inspector</h3>
                    <p className="text-xs text-slate-400 font-mono">Record ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Decision Banner */}
                {selectedLog.status === 'BLOCKED' ? (
                  <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">Query Blocked by Guard</h4>
                        <p className="text-xs text-rose-700 font-medium">Intercepted before database execution</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white text-rose-800 font-mono font-bold text-xs rounded-lg border border-rose-200 shadow-sm shrink-0">
                      BLOCKED
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider">Query Approved & Executed</h4>
                        <p className="text-xs text-emerald-700 font-medium">Differential Privacy Noise Injected ($\varepsilon={selectedLog.epsilonCost.toFixed(2)}$)</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white text-emerald-800 font-mono font-bold text-xs rounded-lg border border-emerald-200 shadow-sm shrink-0">
                      +{selectedLog.epsilonCost.toFixed(2)} ε
                    </span>
                  </div>
                )}

                {/* Metadata Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-600" /> Target Cohort ID
                    </p>
                    <p className="text-sm font-black text-slate-900 mt-1 font-mono">{selectedLog.cohortId}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Partitioned data enclave</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" /> Triggering Actor
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1 truncate" title={selectedLog.triggeredBy}>{selectedLog.triggeredBy}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Authenticated identity</p>
                  </div>
                </div>

                {/* Full Query Context */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" /> Full Intercepted Query Context
                  </label>
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto shadow-inner border border-slate-800">
                    <code>{selectedLog.queryText}</code>
                  </div>
                </div>

                {/* Enforcement Reason Notes */}
                <div className={`p-4 rounded-2xl space-y-1.5 border ${
                  selectedLog.status === 'BLOCKED' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className={`flex items-center gap-2 font-bold text-xs ${
                    selectedLog.status === 'BLOCKED' ? 'text-rose-900' : 'text-emerald-900'
                  }`}>
                    <Info className="w-4 h-4 shrink-0" /> Decision Justification & Cryptographic Analysis
                  </div>
                  <p className={`text-xs leading-relaxed ${
                    selectedLog.status === 'BLOCKED' ? 'text-rose-800 font-medium' : 'text-emerald-800'
                  }`}>
                    {selectedLog.decisionReason || (selectedLog.status === 'BLOCKED' 
                      ? 'Query blocked to prevent privacy budget exhaustion or raw PII leakage.'
                      : 'Query met differential privacy safety criteria under Laplace noise injection.')}
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Tenant ID: {selectedLog.tenantId}</span>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

