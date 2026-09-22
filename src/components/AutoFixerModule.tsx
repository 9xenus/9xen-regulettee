import React, { useState } from 'react';
import { Wrench, CheckCircle2, RefreshCw, Sparkles, ArrowRight, ShieldCheck, UserCheck, XCircle, Undo2, Lock, Clock, BadgeCheck, Scale } from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

interface LawyerTask {
  id: string;
  source: 'lawyer-commissioned';
  target: string;
  issue: string;
  severity?: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
  fix_action?: string;
}

interface AutoFixTask {
  id: string;
  target: string;
  issue: string;
  fixAction: string;
  fixType?: string;
  status: 'PENDING' | 'PROPOSED' | 'EXECUTING' | 'REMEDIATED';
  proposalId?: string;
}

interface HITLProposal {
  id: string;
  tenant_id: string;
  target: string;
  issue: string;
  fix_action: string;
  fix_type: string;
  proposed_by: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'APPLIED' | 'REJECTED' | 'ROLLED_BACK';
  approver?: string;
  approved_at?: string;
  applied_at?: string;
  applied_action_id?: string;
  evidence_token?: string;
  reason?: string;
  created_at?: string;
}

const INITIAL_TASKS: AutoFixTask[] = [
  { id: 'fix-1', target: 'Cookie Consent Directive', issue: 'Missing Spanish AEPD banner update', fixAction: 'Auto-inject BOE 2026 consent schema', fixType: 'COOKIE_BLOCKER', status: 'PENDING' },
  { id: 'fix-2', target: 'TLS 1.3 Ingress', issue: 'Legacy cipher suite CBC allowed', fixAction: 'Enforce ML-KEM + AES-256-GCM only', fixType: 'SECURITY_HEADERS', status: 'PENDING' },
  { id: 'fix-3', target: 'Postgres S3 Backup', issue: 'Lifecycle transition missing immutability flag', fixAction: 'Arm AWS S3 Object Lock (WORM)', fixType: 'CUSTOM', status: 'PENDING' },
];

const statusMeta: Record<HITLProposal['status'], { label: string; cls: string }> = {
  PENDING_APPROVAL: { label: 'Awaiting Human Approval', cls: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400' },
  APPROVED: { label: 'Approved · Executing', cls: 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400' },
  APPLIED: { label: 'Applied · Evidence-Sealed', cls: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' },
  REJECTED: { label: 'Rejected by Human', cls: 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400' },
  ROLLED_BACK: { label: 'Rolled Back', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' },
};

export const AutoFixerModule: React.FC<{ tenantId?: string }> = ({ tenantId = 'default-tenant' }) => {
  const [tasks, setTasks] = useState<AutoFixTask[]>(INITIAL_TASKS);
  const [queue, setQueue] = useState<HITLProposal[]>([]);
  const [lawyerTasks, setLawyerTasks] = useState<LawyerTask[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [proposing, setProposing] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoadingQueue(true);
    try {
      const r = await fetchWithRetry(`/api/v1/client/fixation/queue?tenantId=${encodeURIComponent(tenantId)}`);
      const data = await r.json();
      if (data?.success) setQueue((data.queue || []) as HITLProposal[]);
      if (data?.lawyerTasks) setLawyerTasks(data.lawyerTasks as LawyerTask[]);
    } catch { /* keep stale queue */ } finally {
      setLoadingQueue(false);
    }
  };

  React.useEffect(() => {
    loadQueue();
    const iv = setInterval(loadQueue, 15000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const proposeFix = async (task: AutoFixTask) => {
    setProposing(task.id);
    try {
      const r = await fetchWithRetry('/api/v1/client/fixation/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, target: task.target, issue: task.issue, fixAction: task.fixAction, fixType: task.fixType || 'CUSTOM', proposedBy: 'auto-fixation-engine' }),
      });
      const data = await r.json();
      if (data?.success) {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'PROPOSED', proposalId: data.proposalId } : t));
        loadQueue();
      }
    } finally {
      setProposing(null);
    }
  };

  const approveFix = async (p: HITLProposal) => {
    setActingOn(p.id);
    try {
      const r = await fetchWithRetry(`/api/v1/client/fixation/approve/${p.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver: 'demonstration.superadmin@regulettee.eu' }),
      });
      await r.json();
      loadQueue();
    } finally {
      setActingOn(null);
    }
  };

  const rejectFix = async (p: HITLProposal) => {
    const reason = window.prompt('Reject reason (Human-in-the-Loop review):', 'Reviewed — patch conflicts with existing BCP, not deploying.');
    if (reason === null) return;
    setActingOn(p.id);
    try {
      const r = await fetchWithRetry(`/api/v1/client/fixation/reject/${p.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver: 'demonstration.superadmin@regulettee.eu', reason }),
      });
      await r.json();
      loadQueue();
    } finally {
      setActingOn(null);
    }
  };

  const rollbackFix = async (p: HITLProposal) => {
    setActingOn(p.id);
    try {
      const r = await fetchWithRetry(`/api/v1/client/fixation/rollback/${p.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolledBy: 'demonstration.superadmin@regulettee.eu' }),
      });
      await r.json();
      loadQueue();
    } finally {
      setActingOn(null);
    }
  };

  const pendingCount = queue.filter(q => q.status === 'PENDING_APPROVAL').length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Autonomous Remediation Auto-Fixer</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Proposals now gated through Human-in-the-Loop (HITL) approval</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Clock className="w-3 h-3" /> {pendingCount} HITL
            </span>
          )}
          <button onClick={loadQueue} className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
            <RefreshCw className={`w-3 h-3 inline mr-1 ${loadingQueue ? 'animate-spin' : ''}`} />REFRESH
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white">{task.target}</div>
              <div className="text-slate-500 text-[11px]">{task.issue}</div>
              <div className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">→ {task.fixAction}</div>
            </div>

            {task.status === 'PENDING' && (
              <button
                onClick={() => proposeFix(task)}
                disabled={proposing === task.id}
                className="px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
              >
                {proposing === task.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                {proposing === task.id ? 'Proposing...' : 'Propose Fix (HITL)'}
              </button>
            )}
            {task.status === 'PROPOSED' && (
              <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-2 py-1 rounded shrink-0 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Queue #{task.proposalId?.replace('cfx_', '').slice(0, 6)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">Human-in-the-Loop Approval Queue</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{queue.length} proposals</span>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-5 text-[11px] text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No autonomous fixes in flight. Propose a patch above — it will wait for human sign-off (HITL).
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((p) => (
              <div key={p.id} className="p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">{p.target}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${statusMeta[p.status]?.cls}`}>{statusMeta[p.status]?.label}</span>
                    <span className="text-[9px] font-mono text-slate-400">{p.id}</span>
                  </div>
                  {p.issue && <div className="text-slate-500 text-[11px]">{p.issue}</div>}
                  <div className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">→ {p.fix_action || p.fix_type}</div>
                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" />{p.proposed_by}</span>
                    {p.approver && <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-emerald-500" />{p.approver}</span>}
                    {p.evidence_token && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />evidence {p.evidence_token.slice(0, 14)}…
                      </span>
                    )}
                    {p.reason && <span className="italic text-rose-500">“{p.reason}”</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {p.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => approveFix(p)}
                        disabled={actingOn === p.id}
                        className="px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      >
                        {actingOn === p.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => rejectFix(p)}
                        disabled={actingOn === p.id}
                        className="px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {p.status === 'APPLIED' && (
                    <button
                      onClick={() => rollbackFix(p)}
                      disabled={actingOn === p.id}
                      className="px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 bg-slate-700 hover:bg-slate-800 text-white cursor-pointer"
                    >
                      {actingOn === p.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                      Rollback
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">Lawyer-Commissioned Remediation</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{lawyerTasks.length} ordered</span>
        </div>

        {lawyerTasks.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-slate-400 font-bold border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No counsel-issued remediation tasks. Engage a lawyer via the Legal Counsel hub to provision one.
          </div>
        ) : (
          <div className="space-y-2">
            {lawyerTasks.map((t) => (
              <div key={t.id} className="p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">{t.target}</span>
                    {t.severity && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${t.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}>{t.severity}</span>
                    )}
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t.status}</span>
                  </div>
                  {t.issue && <div className="text-slate-500 text-[11px] line-clamp-2">{t.issue}</div>}
                  <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono text-slate-500">
                    {t.assignedTo && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{t.assignedTo}</span>}
                    {t.dueDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(t.dueDate).toLocaleDateString()}</span>}
                    {t.fix_action && <span className="italic text-indigo-500">“{t.fix_action}”</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        No patch reaches production without human approval — every decision is anchored to the Blockchain Audit Trail & Immutable Ledger.
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
};
export default AutoFixerModule;