import React, { useState } from 'react';
import { 
  Terminal, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Cpu, 
  Database,
  ShieldCheck
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  targetService: string;
  status: 'ACTIVE' | 'PAUSED' | 'RUNNING';
  lastRun: string;
  nextRun: string;
  successRate: string;
}

const mockJobs: CronJob[] = [
  {
    id: 'CRON-EURLEX-01',
    name: 'EUR-Lex Official Gazette Vector Embedding Sync',
    schedule: '0 */4 * * * (Every 4 Hours)',
    targetService: 'ChromaDB / LanceDB Sovereign Embedding Tier',
    status: 'ACTIVE',
    lastRun: '18 mins ago',
    nextRun: 'In 3h 42m',
    successRate: '99.8%'
  },
  {
    id: 'CRON-EDPB-02',
    name: 'EDPB Binding Decision RSS Scraper & Analyzer',
    schedule: '0 0 * * * (Daily Midnight CET)',
    targetService: 'LangGraph B2G Regulatory State Engine',
    status: 'ACTIVE',
    lastRun: '8 hours ago',
    nextRun: 'In 16 hours',
    successRate: '100%'
  },
  {
    id: 'CRON-DSR-03',
    name: 'Autonomous 72h DSR SLA Expiration Alert Watcher',
    schedule: '*/15 * * * * (Every 15 Minutes)',
    targetService: 'Sovereign Notification Dispatcher',
    status: 'ACTIVE',
    lastRun: '4 mins ago',
    nextRun: 'In 11 mins',
    successRate: '100%'
  }
];

export const SuperAdminRagCronConfigurator: React.FC = () => {
  const { showToast } = useNotification();
  const [jobs, setJobs] = useState<CronJob[]>(mockJobs);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  const handleTriggerNow = (id: string) => {
    setRunningJobId(id);
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, lastRun: 'Just now' } : j));
      setRunningJobId(null);
      showToast(`Triggered manual execution for ${id}. Vector index synchronized.`, 'success');
    }, 900);
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-950/80 border border-purple-700/60 rounded-xl text-purple-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Autonomous RAG &amp; Regulatory Cron Orchestrator</h3>
            <p className="text-xs text-slate-400">Configure background ingest cron pipelines, vector database recalculation, and continuous compliance scraping.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-purple-950 border border-purple-800 text-purple-300 rounded-xl text-xs font-mono font-bold">
          SuperAdmin Kernel v5.0
        </span>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400">{job.id}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold font-mono">
                  {job.status}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Success Rate: {job.successRate}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{job.name}</h4>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                <span>Schedule: <strong className="text-slate-200 font-mono">{job.schedule}</strong></span>
                <span>Target: <strong className="text-indigo-400 font-mono">{job.targetService}</strong></span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Last Run: {job.lastRun} &bull; Next Run: {job.nextRun}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-center">
              <button
                type="button"
                disabled={runningJobId === job.id}
                onClick={() => handleTriggerNow(job.id)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {runningJobId === job.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Trigger Ingest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminRagCronConfigurator;
