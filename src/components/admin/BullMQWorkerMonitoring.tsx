import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Activity,
  Cpu,
  RefreshCw,
  Play,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Server,
  Zap,
  RotateCw,
  FileText,
  Brain,
  ShieldCheck,
  Radio,
  Sliders,
  ChevronRight,
  Database,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

export interface QueueMetricSummary {
  queueName: string;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  waiting: number;
  retrying: number;
  concurrency: number;
  workerStatus: 'RUNNING' | 'IDLE' | 'OFFLINE';
}

export interface TaskJobSummary {
  id: string;
  tenantId: string;
  taskType: string;
  payload: any;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  attempts: number;
  maxAttempts: number;
  errorMessage?: string | null;
  resultPayload?: any | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface TaskQueueMetricsResponse {
  isRedisConnected: boolean;
  redisHost: string;
  totalActive: number;
  totalDelayed: number;
  totalFailed: number;
  totalCompleted: number;
  totalQueued: number;
  queues: QueueMetricSummary[];
  recentJobs: TaskJobSummary[];
  systemLoad: {
    daemonActive: boolean;
    uptimeSeconds: number;
    workerEngine: 'BullMQ_Distributed' | 'Local_DB_Daemon';
  };
}

export const BullMQWorkerMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<TaskQueueMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggeringTask, setTriggeringTask] = useState<string | null>(null);
  const [processingBatch, setProcessingBatch] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterQueue, setFilterQueue] = useState<string>('ALL');

  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState<boolean>(false);

  const fetchMetrics = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetchWithRetry('/api/v1/admin/task-queue/metrics');
      if (res.ok) {
        const data = await res.json();
        if (data?.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err: any) {
      console.error('[BullMQWorkerMonitoring] Failed to fetch task queue metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh metrics every 6 seconds
    const interval = setInterval(() => {
      fetchMetrics(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const handleTriggerTask = async (taskType: string, priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' = 'HIGH') => {
    setTriggeringTask(taskType);
    setActionNotice(null);
    try {
      const payload: Record<string, any> = {
        triggeredBy: 'Admin_Monitoring_Console',
        timestamp: new Date().toISOString()
      };

      if (taskType === 'PDF_GEN') {
        payload.templateId = 'EU_AI_ACT_AUDIT_REPORT';
        payload.documentTitle = 'Statutory Compliance Audit Dossier';
        payload.variables = { classification: 'High-Risk AI System', complianceScore: 94 };
      } else if (taskType === 'AI_EVAL') {
        payload.frameworkRuleId = 'NIS2-RISK-ASSESSMENT-01';
        payload.promptType = 'POLICY_DRIFT_ANALYSIS';
        payload.contextData = { framework: 'NIS2_DIRECTIVE', driftScoreThreshold: 0.15 };
      } else if (taskType === 'DOC_PARSE') {
        payload.documentId = `DOC-REG-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.s3Path = 'vault://sovereign-tenant/contracts/legal-annex-2026.pdf';
      }

      const res = await fetch('/api/v1/admin/task-queue/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          priority,
          tenantId: 'tenant-enterprise-root',
          payload
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice({
          message: `Enqueued [${taskType}] job (${data.job?.jobId || 'ID-Generated'}) with ${priority} priority.`,
          type: 'success'
        });
        await fetchMetrics(true);
      } else {
        setActionNotice({ message: data.message || 'Failed to dispatch task.', type: 'error' });
      }
    } catch (err: any) {
      setActionNotice({ message: err.message || 'Error triggering background job.', type: 'error' });
    } finally {
      setTriggeringTask(null);
    }
  };

  const handleProcessBatch = async () => {
    setProcessingBatch(true);
    setActionNotice(null);
    try {
      const res = await fetch('/api/v1/admin/task-queue/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice({
          message: `Processed batch of ${data.processedCount} queued task(s) successfully.`,
          type: 'success'
        });
        await fetchMetrics(true);
      }
    } catch (err: any) {
      setActionNotice({ message: err.message || 'Failed to run worker daemon step.', type: 'error' });
    } finally {
      setProcessingBatch(false);
    }
  };

  const totalActive = metrics?.totalActive || 0;
  const totalDelayed = metrics?.totalDelayed || 0;
  const totalFailed = metrics?.totalFailed || 0;
  const totalCompleted = metrics?.totalCompleted || 0;
  const totalQueued = metrics?.totalQueued || 0;

  const queues = metrics?.queues || [
    { queueName: 'pdf-generation', active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, retrying: 0, concurrency: 4, workerStatus: 'IDLE' },
    { queueName: 'ai-evaluation', active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, retrying: 0, concurrency: 6, workerStatus: 'IDLE' },
    { queueName: 'document-parsing', active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, retrying: 0, concurrency: 5, workerStatus: 'IDLE' },
    { queueName: 'compliance-default', active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, retrying: 0, concurrency: 3, workerStatus: 'IDLE' }
  ];

  const filteredJobs = (metrics?.recentJobs || []).filter(job => {
    if (filterQueue === 'ALL') return true;
    if (filterQueue === 'PDF_GEN') return job.taskType.includes('PDF');
    if (filterQueue === 'AI_EVAL') return job.taskType.includes('AI') || job.taskType.includes('POLICY');
    if (filterQueue === 'DOC_PARSE') return job.taskType.includes('DOC') || job.taskType.includes('DOCUMENT');
    return true;
  });

  return (
    <div id="bullmq-worker-admin-panel" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 text-white shadow-2xl space-y-6">
      {/* Header & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold tracking-tight text-white">BullMQ Worker & Task Queue Monitor</h3>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
                metrics?.isRedisConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${metrics?.isRedisConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {metrics?.isRedisConnected ? 'REDIS CLUSTER LIVE' : 'SQLITE DAEMON FALLBACK'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time telemetry of distributed BullMQ worker pools, concurrency thresholds, and task lifecycle queues.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-process-batch"
            onClick={handleProcessBatch}
            disabled={processingBatch}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            title="Execute pending queue batch through worker daemons"
          >
            <RotateCw className={`w-3.5 h-3.5 ${processingBatch ? 'animate-spin text-indigo-400' : ''}`} />
            {processingBatch ? 'Running Daemons...' : 'Run Daemon Step'}
          </button>
          <button
            id="btn-refresh-task-metrics"
            onClick={() => fetchMetrics(false)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
              actionNotice.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono ml-4"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric KPI Cards (Active, Delayed, Failed, Completed, Queued) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Active Jobs */}
        <div className="bg-slate-950/60 border border-indigo-900/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Active Jobs</span>
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-indigo-300 font-mono">
              {totalActive}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">in execution</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Workers Concurrency</span>
            <span className="font-mono text-slate-300">18 threads</span>
          </div>
        </div>

        {/* Delayed Jobs */}
        <div className="bg-slate-950/60 border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Delayed Jobs</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-amber-300 font-mono">
              {totalDelayed}
            </span>
            <span className="text-[10px] text-amber-400 font-mono">scheduled</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Backoff Policy</span>
            <span className="font-mono text-slate-300">Exponential</span>
          </div>
        </div>

        {/* Failed Jobs */}
        <div className="bg-slate-950/60 border border-rose-900/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Failed Jobs</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-rose-300 font-mono">
              {totalFailed}
            </span>
            <span className="text-[10px] text-rose-400 font-mono">unresolved</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Max Retry Cap</span>
            <span className="font-mono text-slate-300">3 - 4 attempts</span>
          </div>
        </div>

        {/* Queued / Waiting */}
        <div className="bg-slate-950/60 border border-sky-900/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Queued (Waiting)</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-sky-300 font-mono">
              {totalQueued}
            </span>
            <span className="text-[10px] text-sky-400 font-mono">in pipeline</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Dispatch Strategy</span>
            <span className="font-mono text-slate-300">Priority Ranked</span>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-slate-950/60 border border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-emerald-300 font-mono">
              {totalCompleted}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">successful</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Result Archival</span>
            <span className="font-mono text-slate-300">24h TTL</span>
          </div>
        </div>
      </div>

      {/* Distributed Worker Pools Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Dedicated Worker Queues ({queues.length} channels)
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            Engine: {metrics?.systemLoad.workerEngine || 'BullMQ_Distributed'} • Uptime: {metrics?.systemLoad.uptimeSeconds ? `${Math.floor(metrics.systemLoad.uptimeSeconds / 60)}m` : '0m'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {queues.map(q => {
            const getQueueMeta = (name: string) => {
              if (name === 'pdf-generation') {
                return {
                  label: 'PDF Generation',
                  desc: 'RoPA & statutory audit dossiers',
                  icon: FileText,
                  badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
                  taskKey: 'PDF_GEN'
                };
              }
              if (name === 'ai-evaluation') {
                return {
                  label: 'AI & Drift Evaluation',
                  desc: 'NIS2 & EU AI Act policy audits',
                  icon: Brain,
                  badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                  taskKey: 'AI_EVAL'
                };
              }
              if (name === 'document-parsing') {
                return {
                  label: 'Document Parsing',
                  desc: 'OCR & SHA-256 vault tamper check',
                  icon: ShieldCheck,
                  badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                  taskKey: 'DOC_PARSE'
                };
              }
              return {
                label: 'Default Compliance',
                desc: 'Telemetry & webhook events',
                icon: Server,
                badgeColor: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
                taskKey: 'DEFAULT'
              };
            };

            const meta = getQueueMeta(q.queueName);
            const Icon = meta.icon;

            return (
              <div
                key={q.queueName}
                className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                        <Icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{meta.label}</div>
                        <div className="text-[10px] font-mono text-slate-500">{q.queueName}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      q.workerStatus === 'RUNNING' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {q.workerStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{meta.desc}</p>
                </div>

                {/* Queue Micro Metrics */}
                <div className="grid grid-cols-4 gap-1.5 py-2.5 px-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-center font-mono">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Act</div>
                    <div className="text-xs font-bold text-indigo-300">{q.active}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Wait</div>
                    <div className="text-xs font-bold text-sky-300">{q.waiting}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Dly</div>
                    <div className="text-xs font-bold text-amber-300">{q.delayed}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Fail</div>
                    <div className="text-xs font-bold text-rose-400">{q.failed}</div>
                  </div>
                </div>

                {/* Concurrency and Action */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500 font-mono">Concurrency: <strong className="text-slate-300">{q.concurrency}</strong></span>
                  {meta.taskKey !== 'DEFAULT' && (
                    <button
                      onClick={() => handleTriggerTask(meta.taskKey)}
                      disabled={triggeringTask === meta.taskKey}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium text-[11px] cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-indigo-400" />
                      {triggeringTask === meta.taskKey ? 'Dispatching...' : 'Dispatch Test'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Queue Execution Log & Filter Header */}
      <div className="pt-2 border-t border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            Recent Queue Execution Ledger (Live Dual-Tier Auditing)
          </h4>

          {/* Queue Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            {['ALL', 'PDF_GEN', 'AI_EVAL', 'DOC_PARSE'].map(f => (
              <button
                key={f}
                onClick={() => setFilterQueue(f)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterQueue === f
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/50 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Job ID / Type</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Created / Executed</th>
                <th className="py-3 px-4">Payload & Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    No active or historical queue jobs recorded for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => {
                  const getStatusBadge = (st: string) => {
                    if (st === 'COMPLETED') {
                      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><Check className="w-3 h-3" /> COMPLETED</span>;
                    }
                    if (st === 'PROCESSING') {
                      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"><RotateCw className="w-3 h-3 animate-spin" /> PROCESSING</span>;
                    }
                    if (st === 'QUEUED') {
                      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30"><Clock className="w-3 h-3" /> QUEUED</span>;
                    }
                    if (st === 'RETRYING') {
                      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30"><RotateCw className="w-3 h-3" /> RETRYING</span>;
                    }
                    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30"><AlertTriangle className="w-3 h-3" /> FAILED</span>;
                  };

                  const getPriorityBadge = (p: string) => {
                    if (p === 'CRITICAL') return <span className="text-rose-400 font-bold">CRITICAL</span>;
                    if (p === 'HIGH') return <span className="text-amber-400 font-semibold">HIGH</span>;
                    if (p === 'NORMAL') return <span className="text-slate-300">NORMAL</span>;
                    return <span className="text-slate-500">LOW</span>;
                  };

                  return (
                    <tr key={job.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{job.taskType}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={job.id}>{job.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(job.priority)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {job.attempts} / {job.maxAttempts}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <div>{new Date(job.createdAt).toLocaleTimeString()}</div>
                        <div className="text-[10px] text-slate-600">{new Date(job.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {job.errorMessage ? (
                          <span className="text-rose-400 truncate block" title={job.errorMessage}>
                            Error: {job.errorMessage}
                          </span>
                        ) : job.resultPayload ? (
                          <span className="text-emerald-400/90 truncate block" title={JSON.stringify(job.resultPayload)}>
                            ✓ {job.resultPayload.extractedEntities?.length ? `${job.resultPayload.extractedEntities.length} entities parsed` : job.resultPayload.reportId || 'Result generated'}
                          </span>
                        ) : (
                          <span className="text-slate-500 truncate block" title={JSON.stringify(job.payload)}>
                            {JSON.stringify(job.payload)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default BullMQWorkerMonitoring;
