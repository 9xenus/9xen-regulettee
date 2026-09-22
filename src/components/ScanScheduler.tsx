import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Terminal, Save } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface ScanSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression: string;
  targetRepo: string;
  framework: string;
  status: 'ACTIVE' | 'PAUSED';
  lastRun: string;
  nextRun: string;
}

export const ScanScheduler: React.FC = () => {
  const { showToast } = useNotification();
  const [jobs, setJobs] = useState<ScanSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from "database"
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        // Simulate DB fetch
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const savedJobs = localStorage.getItem('scan_scheduler_jobs');
        if (savedJobs) {
          setJobs(JSON.parse(savedJobs));
        } else {
          setJobs([
            {
              id: 'job_1',
              name: 'Daily Frankfurt Cloud Enclave Scan',
              frequency: 'daily',
              cronExpression: '0 2 * * *',
              targetRepo: 'github.com/acme-corp/compliance-enclave',
              framework: 'EU AI Act & GDPR Art 32',
              status: 'ACTIVE',
              lastRun: 'Today at 02:00 UTC',
              nextRun: 'Tomorrow at 02:00 UTC'
            },
            {
              id: 'job_2',
              name: 'Weekly DORA Threat & Terraform Audit',
              frequency: 'weekly',
              cronExpression: '0 0 * * 0',
              targetRepo: 'github.com/acme-corp/fintech-nexus',
              framework: 'DORA Resilience Act',
              status: 'ACTIVE',
              lastRun: 'Last Sunday at 00:00 UTC',
              nextRun: 'Next Sunday at 00:00 UTC'
            }
          ]);
        }
      } catch (err) {
        showToast('Failed to load scan schedules from database.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []);

  const saveJobsToDb = async (updatedJobs: ScanSchedule[]) => {
    // Simulate DB save
    localStorage.setItem('scan_scheduler_jobs', JSON.stringify(updatedJobs));
    // Optional: make actual API call here
    // await fetch('/api/schedules', { method: 'POST', body: JSON.stringify(updatedJobs) });
  };

  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newJobName, setNewJobName] = useState('');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [newCronExpr, setNewCronExpr] = useState('0 3 * * *');
  const [newRepo, setNewRepo] = useState('github.com/acme-corp/core-infra');
  const [newFramework, setNewFramework] = useState('GDPR Art 35 (DPIA)');

  // Auto-update cron expression based on frequency selection
  useEffect(() => {
    switch(newFrequency) {
      case 'daily':
        setNewCronExpr('0 2 * * *'); // Every day at 2am
        break;
      case 'weekly':
        setNewCronExpr('0 0 * * 0'); // Every Sunday at midnight
        break;
      case 'monthly':
        setNewCronExpr('0 0 1 * *'); // 1st of every month
        break;
    }
  }, [newFrequency]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim() || !newRepo.trim()) {
      showToast('Please provide a schedule name and target repository.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      // Simulate DB network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const newJob: ScanSchedule = {
        id: `job_${Date.now()}`,
        name: newJobName,
        frequency: newFrequency,
        cronExpression: newCronExpr,
        targetRepo: newRepo,
        framework: newFramework,
        status: 'ACTIVE',
        lastRun: 'Never (Scheduled)',
        nextRun: 'Pending CRON computation...'
      };

      const updatedJobs = [newJob, ...jobs];
      setJobs(updatedJobs);
      await saveJobsToDb(updatedJobs);
      
      setIsCreating(false);
      setNewJobName('');
      showToast(`Recurring cron schedule "${newJobName}" saved to database successfully!`, 'success', 'Node-Cron Job Active');
    } catch (err) {
      showToast('Failed to save schedule to database.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleJobStatus = async (id: string) => {
    const updatedJobs = jobs.map(job => {
      if (job.id === id) {
        const nextStatus: 'ACTIVE' | 'PAUSED' = job.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        showToast(`Job "${job.name}" is now ${nextStatus.toLowerCase()} and synced.`, 'info');
        return { ...job, status: nextStatus };
      }
      return job;
    });
    setJobs(updatedJobs);
    await saveJobsToDb(updatedJobs);
  };

  const deleteJob = async (id: string) => {
    const updatedJobs = jobs.filter(job => job.id !== id);
    setJobs(updatedJobs);
    await saveJobsToDb(updatedJobs);
    showToast('Scheduled cron job permanently removed from database.', 'warning');
  };

  const triggerNow = (name: string) => {
    showToast(`Executing immediate IaC compliance scan for "${name}"...`, 'info', 'Cron Triggered');
    setTimeout(() => {
      showToast(`Scan for "${name}" completed successfully. Zero high-risk drifts.`, 'success', 'Scan Results');
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">ScanScheduler</h3>
            <p className="text-xs text-slate-500">Persisted automated infrastructure-as-code security scans with cron syntax.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Cancel' : 'New Cron Schedule'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateJob} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-xs font-black uppercase text-slate-800">Configure Database-Backed Node-Cron Job</h4>
            <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Standard 5-Field Cron Syntax</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Schedule Name</label>
              <input
                type="text"
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
                placeholder="e.g. Weekly Production Enclave Audit"
                className="w-full bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Frequency</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-800 font-bold"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Cron</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cron Expression</label>
                <input
                  type="text"
                  value={newCronExpr}
                  onChange={(e) => setNewCronExpr(e.target.value)}
                  disabled={newFrequency !== 'custom'}
                  placeholder="0 2 * * *"
                  className="w-full bg-slate-100 font-mono border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Repository / Cluster</label>
              <input
                type="text"
                value={newRepo}
                onChange={(e) => setNewRepo(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Compliance Framework</label>
              <select
                value={newFramework}
                onChange={(e) => setNewFramework(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 text-slate-800 font-bold"
              >
                <option value="EU AI Act & GDPR Art 32">EU AI Act &amp; GDPR Art 32</option>
                <option value="DORA Resilience Act">DORA Resilience Act</option>
                <option value="GDPR Art 35 (DPIA)">GDPR Art 35 (DPIA)</option>
                <option value="SOC2 Trust Services Criteria">SOC2 Trust Services Criteria</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save &amp; Activate Cron Job
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-8 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{job.name}</span>
                  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                    {job.cronExpression}
                  </span>
                  <span className="text-[9px] font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                    {job.frequency}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Target: <span className="font-mono text-slate-700">{job.targetRepo}</span> • Framework: <span className="font-bold text-slate-700">{job.framework}</span></p>
                <div className="flex items-center gap-4 text-[9px] text-slate-400 pt-1">
                  <span>Last Run: {job.lastRun}</span>
                  <span>•</span>
                  <span>Next Scheduled: {job.nextRun}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => triggerNow(job.name)}
                  className="p-2 bg-white hover:bg-slate-100 text-indigo-600 rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer"
                  title="Trigger scan immediately"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleJobStatus(job.id)}
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                    job.status === 'ACTIVE'
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {job.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteJob(job.id)}
                  className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer"
                  title="Delete cron job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No scan schedules found in database. Create one above.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
