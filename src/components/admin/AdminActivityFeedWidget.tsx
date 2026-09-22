import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  User, 
  Tag, 
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuditLogger } from '../../hooks/useAuditLogger';
import { UIUsageAuditLog, UIUsageAuditCategory } from '../../types';

interface AdminActivityFeedWidgetProps {
  maxHeight?: string;
  isCompact?: boolean;
  onClose?: () => void;
}

export const AdminActivityFeedWidget: React.FC<AdminActivityFeedWidgetProps> = ({
  maxHeight = 'h-[600px]',
  isCompact = false,
  onClose
}) => {
  const { getLogs, clearLogs, logAction } = useAuditLogger();
  const [logs, setLogs] = useState<UIUsageAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Load logs initially
  const loadLogs = () => {
    const fetched = getLogs();
    setLogs(fetched);
  };

  useEffect(() => {
    loadLogs();
  }, []); // Run once on mount

  // Listen to real-time audit log events
  useEffect(() => {
    const handleLogUpdated = (e: Event) => {
      if (isLive) {
        loadLogs();
      }
    };

    window.addEventListener('9xen-regulettee_audit_log_updated', handleLogUpdated);
    return () => {
      window.removeEventListener('9xen-regulettee_audit_log_updated', handleLogUpdated);
    };
  }, [isLive]);

  // Simulate an admin action or compliance adjustment for testing real-time feed
  const handleSimulateAction = () => {
    const actions = [
      { action: 'Revoked API Key for Enterprise Tenant #9841', category: 'SECURITY' as UIUsageAuditCategory, meta: { keyId: 'key_live_9981', reason: 'Security Rotation' } },
      { action: 'Updated GDPR Data Retention Policy to 30 days', category: 'COMPLIANCE' as UIUsageAuditCategory, meta: { policyId: 'pol_eu_02', region: 'EU-Central' } },
      { action: 'Executed AI Compliance Risk Re-scan', category: 'RISK' as UIUsageAuditCategory, meta: { modelsScanned: 14, violationsFound: 0 } },
      { action: 'Approved Admin Invite for Compliance Officer', category: 'AUTH' as UIUsageAuditCategory, meta: { invitedEmail: 'auditor@9xen-regulettee.org' } },
      { action: 'Triggered Emergency Killswitch for EU-West Gateway', category: 'SYSTEM' as UIUsageAuditCategory, meta: { severity: 'CRITICAL', node: 'fra-node-03' } }
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    logAction(randomAction.action, randomAction.category, randomAction.meta);
  };

  // Format relative time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 15) return 'Just now';
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Category badge styling
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'SECURITY':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/50';
      case 'COMPLIANCE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50';
      case 'POLICY':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/50';
      case 'RISK':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50';
      case 'SYSTEM':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900/50';
      case 'AUTH':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/50';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  // Filtered logs
  const filteredLogs = logs.filter(log => {
    const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.role && log.role.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden ${maxHeight}`}>
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Real-Time Admin Activity Feed</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isLive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isLive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                {isLive ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Critical administrative actions & compliance adjustments</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLive(!isLive)}
            title={isLive ? 'Pause Live Stream' : 'Resume Live Stream'}
            className={`p-2 rounded-xl text-xs font-semibold transition-all ${
              isLive 
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLive ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </button>
          <button
            onClick={handleSimulateAction}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Simulate Action
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      {!isCompact && (
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-2 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions, emails, roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'SECURITY', 'COMPLIANCE', 'POLICY', 'RISK', 'SYSTEM', 'AUTH'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Logs Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/20">
        {filteredLogs.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 sm:p-5 lg:p-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No activity logs found</p>
            <p className="text-[11px] text-slate-400 mt-1">Actions performed in the admin panel or compliance suite will appear here instantly.</p>
            <button
              onClick={handleSimulateAction}
              className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
            >
              Trigger Test Activity
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5">
                      {log.category === 'SECURITY' ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                      ) : log.category === 'COMPLIANCE' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Terminal className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getCategoryBadge(log.category)}`}>
                          {log.category}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(log.timestamp)}</span>
                        </span>
                        {log.userEmail && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{log.userEmail} ({log.role || 'Admin'})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center text-[10px] font-semibold"
                    >
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  )}
                </div>

                {/* Expanded Metadata */}
                <AnimatePresence>
                  {isExpanded && log.metadata && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg font-mono text-slate-600 dark:text-slate-300 overflow-x-auto"
                    >
                      <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Widget Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredLogs.length} of {logs.length} activity records</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold text-xs flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Clear Feed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
