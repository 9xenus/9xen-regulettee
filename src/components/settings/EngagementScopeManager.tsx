import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Calendar, ShieldCheck, Lock, Trash2, Plus, CheckCircle2, AlertCircle, Layers, ToggleLeft, ToggleRight, Loader2, History, Clock, User, ChevronDown, ChevronUp, Search, Filter, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../lib/utils';

interface AuditLogEntry {
  id: string;
  action: string;
  module?: string;
  performedBy: string;
  timestamp: string;
}

interface Engagement {
  id: string;
  projectName: string;
  lawyerFirm: string;
  modules: string[];
  autoRevokeDate: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  auditLogs: AuditLogEntry[];
}

export const EngagementScopeManager: React.FC = () => {
  const { showToast } = useNotification();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState('');
  const [newFirm, setNewFirm] = useState('');
  const [newDate, setNewDate] = useState('2026-12-31');
  const [selectedModules, setSelectedModules] = useState<string[]>(['GOV_AI_ACT']);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const availableModules = [
    { key: 'GOV_AI_ACT', label: 'AI Governance & Risk Audit' },
    { key: 'SEC_SOVEREIGNTY', label: 'Data Residency & Sovereignty' },
    { key: 'FIN_BILLING', label: 'Regulatory Finance & Billing' },
    { key: 'OPS_WORKFLOW', label: 'Workflow Approvals & Policy Ops' },
    { key: 'ID_KYC', label: 'Identity & KYC Assurance' }
  ];

  // Fetch engagements on mount
  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/engagements');
      const data = await res.json();
      if (data.success && data.engagements) {
        setEngagements(data.engagements);
      }
    } catch (err) {
      console.error('Error fetching engagements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModuleModal = (key: string) => {
    if (selectedModules.includes(key)) {
      setSelectedModules(selectedModules.filter(m => m !== key));
    } else {
      setSelectedModules([...selectedModules, key]);
    }
  };

  // Toggle module on an existing engagement with backend persistence
  const handleToggleEngagementModule = async (engagementId: string, moduleKey: string) => {
    const target = engagements.find(e => e.id === engagementId);
    if (!target) return;

    let updatedModules = [...target.modules];
    if (updatedModules.includes(moduleKey)) {
      updatedModules = updatedModules.filter(m => m !== moduleKey);
    } else {
      updatedModules.push(moduleKey);
    }

    // Optimistic UI update
    setEngagements(engagements.map(e => {
      if (e.id === engagementId) {
        const action = updatedModules.length > target.modules.length ? 'Module Granted' : 'Module Revoked';
        const newLog: AuditLogEntry = {
          id: `temp-${Date.now()}`,
          action,
          module: moduleKey,
          performedBy: 'System Administrator (You)',
          timestamp: new Date().toISOString()
        };
        return { ...e, modules: updatedModules, auditLogs: [newLog, ...e.auditLogs] };
      }
      return e;
    }));

    try {
      const res = await fetch(`/api/engagements/${engagementId}/modules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: updatedModules })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Updated module permissions for ${target.projectName}`, 'success');
        // Update with actual server data to get correct logs/IDs
        setEngagements(engagements.map(e => e.id === engagementId ? data.engagement : e));
      } else {
        throw new Error(data.error || 'Failed to update');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to sync module permissions to backend.', 'error');
      fetchEngagements(); // revert on failure
    }
  };

  const handleCreateEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject || !newFirm) {
      showToast('Please fill in project name and legal counsel firm.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: newProject,
          lawyerFirm: newFirm,
          modules: selectedModules,
          autoRevokeDate: newDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setEngagements([data.engagement, ...engagements]);
        setIsModalOpen(false);
        setNewProject('');
        setNewFirm('');
        setSelectedModules(['GOV_AI_ACT']);
        showToast('Project-based engagement scope successfully provisioned and persisted.', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create engagement.', 'error');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/engagements/${id}/revoke`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEngagements(engagements.map(e => e.id === id ? data.engagement : e));
        showToast('Engagement access revoked immediately and synced to backend ledger.', 'info');
      }
    } catch (err) {
      showToast('Failed to revoke engagement access.', 'error');
    }
  };

  const AccessAuditLog: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModule, setFilterModule] = useState<string>('ALL');
    const [filterAction, setFilterAction] = useState<string>('ALL');

    const filteredLogs = logs.filter(log => {
      const matchesSearch = log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (log.module && log.module.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesModule = filterModule === 'ALL' || log.module === filterModule;
      const matchesAction = filterAction === 'ALL' || log.action === filterAction;
      return matchesSearch && matchesModule && matchesAction;
    });

    const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

    return (
      <div className="mt-4 border-t border-slate-200 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Audit History (Immutable)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">{filteredLogs.length} Entries</span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input 
                type="text"
                placeholder="Search user, event, or module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-[10px] pl-7 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                <select 
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="appearance-none pl-6 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Modules</option>
                  {availableModules.map(m => <option key={m.key} value={m.key}>{m.key}</option>)}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select 
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="appearance-none px-2 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Events</option>
                  {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {filteredLogs.length > 0 ? filteredLogs.map((log) => (
            <div key={log.id} className="p-2.5 bg-white border border-slate-100 rounded-xl flex flex-col gap-1 hover:border-slate-200 transition-colors group">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  log.action.includes('Granted') ? "bg-emerald-50 text-emerald-700" : 
                  log.action.includes('Revoked') ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                )}>
                  {log.action}
                </span>
                <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1 group-hover:text-slate-500 transition-colors">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                {log.module && (
                  <span className="text-[10px] font-semibold text-slate-600">
                    Module: <span className="text-slate-900">{availableModules.find(m => m.key === log.module)?.label || log.module}</span>
                  </span>
                )}
                <span className="text-[9px] font-medium text-slate-500 flex items-center gap-1 ml-auto">
                  <User className="w-2.5 h-2.5" />
                  {log.performedBy}
                </span>
              </div>
            </div>
          )) : (
            <div className="py-10 text-center bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center gap-2">
              <Search className="w-6 h-6 text-slate-200" />
              <p className="text-[10px] font-bold text-slate-400">No matching audit logs found.</p>
              {(searchQuery || filterModule !== 'ALL' || filterAction !== 'ALL') && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterModule('ALL');
                    setFilterAction('ALL');
                  }}
                  className="text-[10px] font-black text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900">Engagement Scope & Module-Toggling Manager</h3>
          <p className="text-xs text-slate-500 mt-0.5">Define project-based access, automated revocation dates, and live module toggle switches persisting to secure backend API.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Legal Engagement
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {engagements.map((eng) => (
            <div key={eng.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{eng.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{eng.projectName}</h4>
                    <p className="text-xs text-blue-600 font-semibold">{eng.lawyerFirm}</p>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                    eng.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-600"
                  )}>
                    {eng.status}
                  </span>
                </div>

                {/* Module Toggling Switchboard */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module Permissions</span>
                    <button 
                      onClick={() => setExpandedLogId(expandedLogId === eng.id ? null : eng.id)}
                      className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <History className="w-3 h-3" />
                      {expandedLogId === eng.id ? 'Hide Audit Log' : 'View Audit Log'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 bg-white p-3 rounded-xl border border-slate-200">
                    {availableModules.map((mod) => {
                      const isEnabled = eng.modules.includes(mod.key);
                      return (
                        <div key={mod.key} className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <span className="font-medium text-slate-700">{mod.label}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleEngagementModule(eng.id, mod.key)}
                            disabled={eng.status === 'EXPIRED'}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50",
                              isEnabled ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-100 text-slate-400 border border-slate-200"
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full", isEnabled ? "bg-emerald-600 animate-pulse" : "bg-slate-300")} />
                            {isEnabled ? 'Granted' : 'Revoked'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedLogId === eng.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <AccessAuditLog logs={eng.auditLogs} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Auto-Revokes: <strong className="text-slate-800 font-mono">{eng.autoRevokeDate}</strong></span>
                </div>
                {eng.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleRevoke(eng.id)}
                    className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer"
                  >
                    Revoke Scope
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Engagement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 border border-slate-200"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Provision New Legal Engagement Scope</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateEngagement} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Project / Matter Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. GDPR Compliance Review Q3"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Law Firm / Consultant Practice</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Wilson Sonsini Privacy Team"
                  value={newFirm}
                  onChange={(e) => setNewFirm(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Automated Revocation Date</label>
                <input 
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Initial Module Permissions</label>
                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {availableModules.map(mod => (
                    <label key={mod.key} className="flex items-center gap-3 text-xs cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={selectedModules.includes(mod.key)}
                        onChange={() => handleToggleModuleModal(mod.key)}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span className="font-medium text-slate-800">{mod.label}</span>
                      <span className="ml-auto text-[10px] font-mono text-slate-400">{mod.key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Deploy Engagement Scope
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
