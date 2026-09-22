import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle2, ArrowRight, Clock, Trash2, Check, X, Square, 
  CheckSquare, Sparkles, Shield, Zap, RefreshCw, Settings, Sliders, Play, Cpu, Database 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

interface Task {
  id: string;
  title: string;
  desc: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ref: string;
  deadline: string;
  status: 'pending' | 'completed';
  type: 'manual' | 'auto-fix';
  autoFixAction?: string;
  category?: string;
}

const ComplianceCountdown: React.FC<{ deadline: string }> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState<{ d?: number; h?: number; m?: number; s?: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(deadline) - +new Date();
      if (difference > 0) {
        return {
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <div className="flex items-center text-xs text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded w-fit mt-2 border border-rose-200">
        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
        DEADLINE PASSED
      </div>
    );
  }

  return (
    <div className="flex items-center text-xs text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded w-fit mt-2 border border-amber-200">
      <Clock className="w-3.5 h-3.5 mr-1.5" />
      <span className="font-mono flex space-x-1">
        {timeLeft.d !== undefined && timeLeft.d > 0 && <span>{timeLeft.d}d</span>}
        {timeLeft.h !== undefined && <span>{timeLeft.h.toString().padStart(2, '0')}h</span>}
        {timeLeft.m !== undefined && <span>{timeLeft.m.toString().padStart(2, '0')}m</span>}
        {timeLeft.s !== undefined && <span>{timeLeft.s.toString().padStart(2, '0')}s</span>}
      </span>
    </div>
  );
};

export const ActionableTasks: React.FC = () => {
  const { showToast } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Implement Multi-Region Failover Architecture',
      desc: 'A recent legislative update requires strict adherence to rule \'multi-region-failover\'. Automated geo-sharding is recommended.',
      priority: 'CRITICAL',
      ref: 'EU DORA Amendment 2026 Art 11.4',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 48 + 350000).toISOString(),
      status: 'pending',
      type: 'auto-fix',
      autoFixAction: 'Deploy Multi-Region Failover Shard (Frankfurt & Dublin)',
      category: 'Cloud Infrastructure'
    },
    {
      id: 'task-2',
      title: 'Upload Updated Data Processing Agreement (DPA)',
      desc: 'Missing valid documentation for cross-border data transfer mechanisms under GDPR Article 28.',
      priority: 'HIGH',
      ref: 'GDPR Art. 28 Update',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 12 + 150000).toISOString(),
      status: 'pending',
      type: 'manual',
      category: 'Legal & Governance'
    },
    {
      id: 'task-3',
      title: 'Sanitize Shadow API PII Leakage in Auth Header',
      desc: 'Automated scan detected unmasked user email in `/api/v1/auth` request header logs.',
      priority: 'CRITICAL',
      ref: 'EU AI Act Article 10 / GDPR Art 32',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
      status: 'pending',
      type: 'auto-fix',
      autoFixAction: 'Apply AES-256 Masking & Strip PII from Ingress Logs',
      category: 'API Security'
    },
    {
      id: 'task-4',
      title: 'Review System Access Logs & Privileged Roles',
      desc: 'Routine quarterly review of privileged access accounts and service principal keys.',
      priority: 'MEDIUM',
      ref: 'Internal Policy Sec-04',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      status: 'pending',
      type: 'manual',
      category: 'Access Control'
    }
  ]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'auto-fix' | 'manual' | 'critical'>('all');
  
  // Platform configuration settings
  const [autoEnforcementEnabled, setAutoEnforcementEnabled] = useState(true);
  const [piiMaskingLevel, setPiiMaskingLevel] = useState<'strict' | 'standard'>('strict');
  const [scanFrequency, setScanFrequency] = useState<'realtime' | 'hourly' | 'daily'>('realtime');

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    const visibleTasks = filteredTasks;
    if (selectedIds.size === visibleTasks.length && visibleTasks.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleTasks.map(t => t.id)));
    }
  };

  const handleBulkComplete = () => {
    setTasks(prev => prev.map(t => 
      selectedIds.has(t.id) ? { ...t, status: 'completed' as const } : t
    ));
    setSelectedIds(new Set());
    showToast(`Marked ${selectedIds.size} tasks as resolved.`, 'success');
  };

  const handleBulkDelete = () => {
    setTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    showToast(`Deleted selected tasks.`, 'info');
  };

  const handleAutoFix = (taskId: string, actionName?: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    showToast(`Auto-fix executed successfully: "${actionName || 'Automated Remediation'}"`, 'success');
  };

  const runAutomatedScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const newDiscoveredTask: Task = {
        id: `task-scan-${Date.now()}`,
        title: 'New Cloud Region Data Residency Drift Detected',
        desc: 'Automated scan identified 3 encrypted database nodes routing through unauthorized transit zones.',
        priority: 'HIGH',
        ref: 'GDPR Chapter V / Schrems II Compliance',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: 'pending',
        type: 'auto-fix',
        autoFixAction: 'Reroute to EU-Central-1 Sovereign Shard',
        category: 'Cloud Infrastructure'
      };
      setTasks(prev => [newDiscoveredTask, ...prev]);
      showToast('Automated compliance scan completed. 1 new vulnerability detected with auto-fix suggestion.', 'success');
    }, 1500);
  };

  const clearSelection = () => setSelectedIds(new Set());

  const filteredTasks = tasks.filter(t => {
    if (filterType === 'auto-fix') return t.type === 'auto-fix';
    if (filterType === 'manual') return t.type === 'manual';
    if (filterType === 'critical') return t.priority === 'CRITICAL';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 lg:p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Live Remediation &amp; Auto-Fix Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">• Active Policy Enforcer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Actionable Tasks &amp; Automated Fixes</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Real-time vulnerability triage following automated scanning. Execute one-click auto-fixes or assign manual legal/compliance workflows.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={runAutomatedScan}
            disabled={isScanning}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Infrastructure...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Run Automated Scan Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Platform Configuration Settings Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Automated Enforcement</h3>
            <p className="text-xs text-slate-500 mt-0.5">Apply auto-fixes immediately upon vulnerability discovery.</p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => setAutoEnforcementEnabled(!autoEnforcementEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoEnforcementEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoEnforcementEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-xs font-bold text-slate-700">{autoEnforcementEnabled ? 'Active (Auto-Mitigate)' : 'Manual Review Mode'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">PII Masking Level</h3>
            <p className="text-xs text-slate-500 mt-0.5">Column-level tokenization &amp; logging filters.</p>
            <select
              value={piiMaskingLevel}
              onChange={(e) => setPiiMaskingLevel(e.target.value as any)}
              className="mt-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-indigo-600"
            >
              <option value="strict">Strict AES-256 (Zero-Data Retention)</option>
              <option value="standard">Standard Masking (Mask Emails &amp; IDs)</option>
            </select>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Continuous Scan Frequency</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated telemetry polling interval.</p>
            <select
              value={scanFrequency}
              onChange={(e) => setScanFrequency(e.target.value as any)}
              className="mt-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-indigo-600"
            >
              <option value="realtime">Real-Time Sub-Second WebSockets</option>
              <option value="hourly">Hourly Deep Asset Crawl</option>
              <option value="daily">Daily Compliance Audit Sync</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Bulk Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterType('auto-fix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterType === 'auto-fix' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Suggested Auto-Fixes ({tasks.filter(t => t.type === 'auto-fix').length})
          </button>
          <button
            onClick={() => setFilterType('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterType === 'manual' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Manual Review ({tasks.filter(t => t.type === 'manual').length})
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterType === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
          >
            Critical Gaps ({tasks.filter(t => t.priority === 'CRITICAL').length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            onClick={toggleSelectAll}
            className="flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {selectedIds.size === filteredTasks.length && filteredTasks.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select Visible</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Sticky Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sticky top-4 z-20 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700"
          >
            <div className="flex items-center space-x-3">
              <button 
                onClick={clearSelection}
                className="p-1 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
              <span className="font-bold text-xs sm:text-sm">{selectedIds.size} tasks selected</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkComplete}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Mark Resolved</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.map((task, i) => (
          <motion.div 
            key={task.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
            className={`group p-5 sm:p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
              selectedIds.has(task.id) 
                ? 'bg-indigo-50/40 border-indigo-300 shadow-sm' 
                : 'bg-white border-slate-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-start space-x-4 flex-grow">
              <button 
                onClick={() => toggleSelect(task.id)}
                className="mt-1 flex-shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors cursor-pointer"
              >
                {selectedIds.has(task.id) ? (
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded tracking-wider ${
                    task.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    task.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {task.priority}
                  </span>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider flex items-center gap-1 ${
                    task.type === 'auto-fix' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {task.type === 'auto-fix' ? <Sparkles className="w-3 h-3 text-indigo-600" /> : <Settings className="w-3 h-3 text-slate-500" />}
                    {task.type === 'auto-fix' ? 'Suggested Auto-Fix' : 'Manual Task'}
                  </span>

                  {task.category && (
                    <span className="text-[10px] font-mono bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                      {task.category}
                    </span>
                  )}
                </div>

                <h3 className={`font-extrabold text-base tracking-tight text-slate-900 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                  {task.title}
                </h3>

                <p className={`text-xs sm:text-sm max-w-3xl ${task.status === 'completed' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {task.desc}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <span className="text-[11px] font-mono font-bold text-slate-400">Ref: {task.ref}</span>
                  {task.status !== 'completed' && <ComplianceCountdown deadline={task.deadline} />}
                  {task.status === 'completed' && (
                    <span className="flex items-center text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      RESOLVED &amp; VERIFIED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
              {task.type === 'auto-fix' && task.status !== 'completed' && (
                <button
                  onClick={() => handleAutoFix(task.id, task.autoFixAction)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Execute Auto-Fix</span>
                </button>
              )}

              <button 
                onClick={() => {
                  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
                  showToast(newStatus === 'completed' ? 'Task marked as resolved' : 'Task reopened', 'info');
                }}
                className={`px-4 py-2.5 border text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  task.status === 'completed'
                    ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{task.status === 'completed' ? 'Reopen' : 'Mark Resolved'}</span>
              </button>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-12 h-12 mb-4 text-emerald-500 opacity-80" />
            <p className="font-bold text-slate-800 text-base">No tasks match the selected filter.</p>
            <p className="text-xs text-slate-500 mt-1">Run an automated scan or check other filter categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};
