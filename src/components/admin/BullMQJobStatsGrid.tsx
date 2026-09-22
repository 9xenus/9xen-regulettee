import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  RotateCw,
  RefreshCw,
  Play,
  Server,
  Zap,
  Cpu,
  Radio,
  FileText,
  Brain,
  ShieldCheck,
  ChevronRight,
  Database,
  ArrowUpRight,
  XCircle,
  TrendingUp,
  AlertOctagon
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

export interface TaskJob {
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
  recentJobs: TaskJob[];
  systemLoad: {
    daemonActive: boolean;
    uptimeSeconds: number;
    workerEngine: 'BullMQ_Distributed' | 'Local_DB_Daemon';
  };
}

export const BullMQJobStatsGrid: React.FC = () => {
  const [metrics, setMetrics] = useState<TaskQueueMetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<string>('ALL');

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
      console.error('[BullMQJobStatsGrid] Failed to fetch metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMetrics, autoRefresh]);

  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/v1/admin/task-queue/retry/${encodeURIComponent(jobId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice({
          message: `Job [${jobId}] was successfully re-queued for immediate execution.`,
          type: 'success'
        });
        await fetchMetrics(true);
      } else {
        setActionNotice({
          message: data.message || `Failed to retry job [${jobId}].`,
          type: 'error'
        });
      }
    } catch (err: any) {
      setActionNotice({
        message: err.message || `Error retrying job [${jobId}].`,
        type: 'error'
      });
    } finally {
      setRetryingJobId(null);
    }
  };

  const handleRetryAllFailed = async () => {
    setRetryingAll(true);
    setActionNotice(null);
    try {
      const res = await fetch('/api/v1/admin/task-queue/retry-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice({
          message: data.retriedCount > 0 
            ? `Successfully re-enqueued ${data.retriedCount} failed tasks for execution!`
            : 'No failed tasks currently pending in the queue.',
          type: 'success'
        });
        await fetchMetrics(true);
      } else {
        setActionNotice({
          message: data.message || 'Failed to retry all failed tasks.',
          type: 'error'
        });
      }
    } catch (err: any) {
      setActionNotice({
        message: err.message || 'Error triggering batch retry.',
        type: 'error'
      });
    } finally {
      setRetryingAll(false);
    }
  };

  const handleSimulateTask = async (taskType: string, simulateFailure = false) => {
    setActionNotice(null);
    try {
      const payload: Record<string, any> = {
        triggeredBy: 'BullMQ_Admin_Grid',
        timestamp: new Date().toISOString(),
        ...(simulateFailure ? { simulateError: true, errorReason: 'Network timeout during statutory token validation' } : {})
      };

      const res = await fetch('/api/v1/admin/task-queue/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          priority: simulateFailure ? 'CRITICAL' : 'HIGH',
          tenantId: 'tenant-enterprise-root',
          payload
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice({
          message: `Dispatched [${taskType}] job (${data.job?.jobId || 'ID-Generated'}).`,
          type: 'success'
        });
        await fetchMetrics(true);
      }
    } catch (err: any) {
      setActionNotice({ message: err.message || 'Error dispatching task.', type: 'error' });
    }
  };

  const activeCount = metrics?.totalActive ?? 0;
  const delayedCount = metrics?.totalDelayed ?? 0;
  const failedCount = metrics?.totalFailed ?? 0;
  const completedCount = metrics?.totalCompleted ?? 0;
  const queuedCount = metrics?.totalQueued ?? 0;
  const totalJobsTracked = activeCount + delayedCount + failedCount + completedCount + queuedCount;
  const successRate = totalJobsTracked > 0 ? Math.round((completedCount / (totalJobsTracked - queuedCount || 1)) * 100) : 100;

  const queues = metrics?.queues || [
    { queueName: 'pdf-generation', active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, retrying: 0, concurrency: 4, workerStatus: 'IDLE' },
    { queueName: 'ai-evaluation', active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, retrying: 0, concurrency: 6, workerStatus: 'IDLE' },
    { queueName: 'document-parsing', active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, retrying: 0, concurrency: 5, workerStatus: 'IDLE' },
    { queueName: 'compliance-default', active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, retrying: 0, concurrency: 3, workerStatus: 'IDLE' }
  ];

  const failedJobs = (metrics?.recentJobs || []).filter(j => j.status === 'FAILED');
  const allRecentJobs = (metrics?.recentJobs || []).filter(j => {
    if (selectedQueueFilter === 'ALL') return true;
    if (selectedQueueFilter === 'FAILED') return j.status === 'FAILED';
    if (selectedQueueFilter === 'ACTIVE') return j.status === 'PROCESSING' || j.status === 'RETRYING';
    if (selectedQueueFilter === 'DELAYED') return j.status === 'QUEUED';
    return true;
  });

  return (
    <div id="bullmq-job-stats-grid-container" className="space-y-6">
      {/* Top Banner / Reactive Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-white tracking-tight">BullMQ Reactive Job Statistics</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                  metrics?.isRedisConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${metrics?.isRedisConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  {metrics?.isRedisConnected ? 'BULLMQ CLUSTER CONNECTED' : 'DAEMON ENGINE ACTIVE'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Success Rate: <strong className="text-emerald-400">{successRate}%</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time reactive grid for BullMQ active, delayed, and failed job execution with manual failover & retry controls.
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="btn-toggle-auto-refresh"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                autoRefresh
                  ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title="Toggle automatic 5s reactive polling"
            >
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
              {autoRefresh ? 'Live Stream ON' : 'Live Stream Paused'}
            </button>

            {failedCount > 0 && (
              <button
                id="btn-retry-all-failed-tasks"
                onClick={handleRetryAllFailed}
                disabled={retryingAll}
                className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50 animate-bounce"
              >
                <RotateCw className={`w-3.5 h-3.5 ${retryingAll ? 'animate-spin' : ''}`} />
                {retryingAll ? 'Retrying All...' : `Retry All Failed (${failedCount})`}
              </button>
            )}

            <button
              id="btn-refresh-grid-stats"
              onClick={() => fetchMetrics(false)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Action Notice */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
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
                className="text-slate-400 hover:text-slate-200 text-xs font-mono ml-3 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-Time Primary Stat Grid: ACTIVE, DELAYED, FAILED, QUEUED, COMPLETED */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {/* Active Jobs Card */}
          <div className="bg-slate-950/70 border border-indigo-900/50 hover:border-indigo-500/60 rounded-2xl p-4.5 transition-all group flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
            <div>
              <div className="flex items-center justify-between text-indigo-400 mb-2">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Active Jobs</span>
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-300 font-mono tracking-tight">{activeCount}</span>
                <span className="text-[10px] text-indigo-400 font-mono">running</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Concurrency Pool</span>
              <span className="text-indigo-300 font-bold">18 Workers</span>
            </div>
          </div>

          {/* Delayed Jobs Card */}
          <div className="bg-slate-950/70 border border-amber-900/50 hover:border-amber-500/60 rounded-2xl p-4.5 transition-all group flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
            <div>
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Delayed Jobs</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-300 font-mono tracking-tight">{delayedCount}</span>
                <span className="text-[10px] text-amber-400 font-mono">backoff queue</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Backoff Mode</span>
              <span className="text-amber-300 font-bold">Exponential</span>
            </div>
          </div>

          {/* Failed Jobs Card (With Instant Action) */}
          <div className={`bg-slate-950/70 border transition-all group flex flex-col justify-between relative overflow-hidden shadow-lg rounded-2xl p-4.5 ${
            failedCount > 0 ? 'border-rose-700/80 ring-1 ring-rose-500/40' : 'border-rose-900/50 hover:border-rose-500/60'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
            <div>
              <div className="flex items-center justify-between text-rose-400 mb-2">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Failed Jobs</span>
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-300 font-mono tracking-tight">{failedCount}</span>
                <span className="text-[10px] text-rose-400 font-mono">needs action</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Retry Policy</span>
              {failedCount > 0 ? (
                <button
                  onClick={handleRetryAllFailed}
                  disabled={retryingAll}
                  className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                >
                  Retry All
                </button>
              ) : (
                <span className="text-emerald-400">Zero Faults</span>
              )}
            </div>
          </div>

          {/* Queued (Waiting) Card */}
          <div className="bg-slate-950/70 border border-sky-900/50 hover:border-sky-500/60 rounded-2xl p-4.5 transition-all group flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
            <div>
              <div className="flex items-center justify-between text-sky-400 mb-2">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Queued (Waiting)</span>
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-sky-300 font-mono tracking-tight">{queuedCount}</span>
                <span className="text-[10px] text-sky-400 font-mono">pending execution</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Priority Sorting</span>
              <span className="text-sky-300 font-bold">Active</span>
            </div>
          </div>

          {/* Completed Jobs Card */}
          <div className="bg-slate-950/70 border border-emerald-900/50 hover:border-emerald-500/60 rounded-2xl p-4.5 transition-all group flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
            <div>
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Completed Jobs</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-300 font-mono tracking-tight">{completedCount}</span>
                <span className="text-[10px] text-emerald-400 font-mono">verified</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Throughput</span>
              <span className="text-emerald-300 font-bold">100% Valid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reactive Multi-Queue Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {queues.map(q => {
          const isPdf = q.queueName.includes('pdf');
          const isAi = q.queueName.includes('ai');
          const isDoc = q.queueName.includes('doc');
          const Icon = isPdf ? FileText : isAi ? Brain : isDoc ? ShieldCheck : Server;
          const label = isPdf ? 'PDF Report Generation' : isAi ? 'AI & Policy Drift Engine' : isDoc ? 'Document Vault OCR' : 'Compliance Telemetry';
          const taskCode = isPdf ? 'PDF_GEN' : isAi ? 'AI_EVAL' : isDoc ? 'DOC_PARSE' : 'DEFAULT';

          return (
            <div
              key={q.queueName}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-4.5 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{label}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{q.queueName}</span>
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

                {/* Queue Stats Matrix */}
                <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center font-mono mt-3">
                  <div>
                    <div className="text-[9px] text-indigo-400 font-semibold uppercase">Act</div>
                    <div className="text-xs font-bold text-indigo-200">{q.active}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-sky-400 font-semibold uppercase">Wait</div>
                    <div className="text-xs font-bold text-sky-200">{q.waiting}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-amber-400 font-semibold uppercase">Dly</div>
                    <div className="text-xs font-bold text-amber-200">{q.delayed}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-rose-400 font-semibold uppercase">Fail</div>
                    <div className={`text-xs font-bold ${q.failed > 0 ? 'text-rose-400 font-black' : 'text-slate-400'}`}>{q.failed}</div>
                  </div>
                </div>
              </div>

              {/* Queue Controls */}
              <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/60">
                <span className="text-slate-500 font-mono">Concurrency: <strong className="text-slate-300">{q.concurrency}x</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateTask(taskCode, false)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                    title="Dispatch test payload into queue"
                  >
                    <Play className="w-3 h-3 fill-indigo-400" />
                    Dispatch
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Failed Jobs Manual Retry Enclave (Highlight when failures occur) */}
      {failedJobs.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-300">Failed Jobs Awaiting Manual Retry ({failedJobs.length})</h4>
                <p className="text-xs text-rose-400/80">These background jobs exhausted their automated backoff attempts and require administrator manual intervention.</p>
              </div>
            </div>
            <button
              onClick={handleRetryAllFailed}
              disabled={retryingAll}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${retryingAll ? 'animate-spin' : ''}`} />
              Retry All ({failedJobs.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {failedJobs.map(job => (
              <div
                key={job.id}
                className="bg-slate-900/90 border border-rose-900/60 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-200">{job.taskType}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      FAILED ({job.attempts}/{job.maxAttempts})
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate" title={job.id}>{job.id}</div>
                  <div className="mt-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/40 font-mono line-clamp-2" title={job.errorMessage || 'Unknown failure'}>
                    {job.errorMessage || 'Failure during execution lifecycle.'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(job.updatedAt || job.createdAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => handleRetryJob(job.id)}
                    disabled={retryingJobId === job.id}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={`w-3 h-3 ${retryingJobId === job.id ? 'animate-spin' : ''}`} />
                    {retryingJobId === job.id ? 'Retrying...' : 'Retry Job'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Job Stream & Activity Ledger */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">Live Job Execution Stream & Trace History</h4>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            {['ALL', 'ACTIVE', 'FAILED', 'DELAYED'].map(f => (
              <button
                key={f}
                onClick={() => setSelectedQueueFilter(f)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedQueueFilter === f
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
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Task Type & Job ID</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Payload & Outcome</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {allRecentJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No active or historical background tasks found for the selected filter.
                  </td>
                </tr>
              ) : (
                allRecentJobs.map(job => {
                  const getStatusBadge = (st: string) => {
                    if (st === 'COMPLETED') {
                      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> COMPLETED</span>;
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

                  return (
                    <tr key={job.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{job.taskType}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]" title={job.id}>{job.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={job.priority === 'CRITICAL' ? 'text-rose-400 font-bold' : job.priority === 'HIGH' ? 'text-amber-400' : 'text-slate-400'}>
                          {job.priority}
                        </span>
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
                            ✓ {job.resultPayload.reportId || (job.resultPayload.extractedEntities?.length ? `${job.resultPayload.extractedEntities.length} entities` : 'Outcome persisted')}
                          </span>
                        ) : (
                          <span className="text-slate-500 truncate block" title={JSON.stringify(job.payload)}>
                            {JSON.stringify(job.payload)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {job.status === 'FAILED' ? (
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            disabled={retryingJobId === job.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                          >
                            <RotateCw className={`w-3 h-3 ${retryingJobId === job.id ? 'animate-spin' : ''}`} />
                            {retryingJobId === job.id ? 'Retrying...' : 'Retry'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono">—</span>
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

export default BullMQJobStatsGrid;
