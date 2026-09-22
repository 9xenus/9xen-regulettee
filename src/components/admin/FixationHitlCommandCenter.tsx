import React, { useEffect, useState } from 'react';
import { UserCheck, ShieldCheck, RefreshCw, CheckCircle2, XCircle, Undo2, Clock, Lock, Sparkles, BadgeCheck, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { fetchWithRetry } from '../../lib/api-client';

interface HitlItem {
  id: string;
  violation_id?: string;
  tenant_id?: string;
  target: string;
  title?: string;
  severity?: string;
  fix_action: string;
  fix_command?: string;
  fix_type?: string;
  profile?: string;
  entity_name?: string;
  risk_notes?: string;
  policy?: string;
  proposed_by: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'APPLIED' | 'REJECTED' | 'ROLLED_BACK';
  approver?: string;
  approved_at?: string;
  evidence_token?: string;
  reason?: string;
  created_at?: string;
}

const statusMeta: Record<HitlItem['status'], { label: string; cls: string }> = {
  PENDING_APPROVAL: { label: 'AWAITING HUMAN', cls: 'bg-amber-100 text-amber-700 border-amber-300' },
  APPROVED: { label: 'APPROVED', cls: 'bg-sky-100 text-sky-700 border-sky-300' },
  APPLIED: { label: 'APPLIED · SEALED', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  REJECTED: { label: 'REJECTED', cls: 'bg-rose-100 text-rose-700 border-rose-300' },
  ROLLED_BACK: { label: 'ROLLED BACK', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
};

export const FixationHitlCommandCenter: React.FC = () => {
  const { showToast } = useNotification();
  const [mode, setMode] = useState<'client' | 'national'>('client');
  const [clientQueue, setClientQueue] = useState<HitlItem[]>([]);
  const [nationalQueue, setNationalQueue] = useState<HitlItem[]>([]);
  const [overview, setOverview] = useState<any>({});
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const APPROVER = 'saad.controltower@regulettee.eu';

  const load = async () => {
    setLoading(true);
    try {
      const [vo, cfq, nfq] = await Promise.all([
        fetchWithRetry('/api/v1/client/fixation/overview'),
        fetchWithRetry('/api/v1/client/fixation/queue'),
        fetchWithRetry('/api/v1/national-cyber/fixation/queue'),
      ]);
      const od = await vo.json();
      const cd = await cfq.json();
      const nd = await nfq.json();
      if (od?.overview) setOverview(od.overview);
      if (cd?.queue) setClientQueue(cd.queue);
      if (nd?.queue) setNationalQueue(nd.queue);
    } catch (e: any) {
      showToast(`Load failed: ${e?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const action = async (path: string, item: HitlItem, method: 'approve' | 'reject' | 'rollback') => {
    setActingOn(item.id);
    let reason: string | undefined;
    if (method === 'reject') {
      reason = window.prompt('Reject reason (HITL review):', 'Tested in DI sandbox — blocks production config; holding for re-scan.');
      if (reason === null) { setActingOn(null); return; }
    }
    try {
      const r = await fetchWithRetry(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method === 'rollback' ? { rolledBy: APPROVER } : { approver: APPROVER, reason }),
      });
      const data = await r.json();
      if (data?.success) showToast(data.message || `Action ${method} done.`, 'success');
      else showToast(data?.error || `Action failed for ${item.id}.`, 'error');
      load();
    } catch (e: any) {
      showToast(`Action error: ${e?.message}`, 'error');
    } finally {
      setActingOn(null);
    }
  };

  const queue = mode === 'client' ? clientQueue : nationalQueue;
  const pending = queue.filter(q => q.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-4">
      {/* Header + KPIs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">Human-in-the-Loop Fixation Command Center
              <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">global queue</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Every autonomous fix (client auto-fixation & national cyber defence) must pass human approval before touching production. Evidence-sealed + hash-chained.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'HITL Pending', value: overview.pendingHITL ?? pending, cls: 'text-amber-300' },
              { label: 'Applied', value: overview.applied ?? 0, cls: 'text-emerald-300' },
              { label: 'Rejected', value: overview.rejected ?? 0, cls: 'text-rose-300' },
              { label: 'Rolled Back', value: overview.rolledBack ?? 0, cls: 'text-slate-300' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-800/60 rounded-xl px-3 py-2">
                <div className={`text-base font-black font-mono ${s.cls}`}>{s.value}</div>
                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mode switch */}
      <div className="flex gap-2">
        {([
          { key: 'client' as const, label: 'Client Auto-Fixation Engine', desc: `${overview.pendingHITL ?? clientQueue.filter(q => q.status === 'PENDING_APPROVAL').length} awaiting` },
          { key: 'national' as const, label: 'National Cyber Auto-Fixation', desc: `${nationalQueue.filter(q => q.status === 'PENDING_APPROVAL').length} awaiting` },
        ]).map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${mode === m.key ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'}`}
          >
            {m.label} <span className="opacity-70 ml-1 font-mono">· {m.desc}</span>
          </button>
        ))}
      </div>

      {/* Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            {mode === 'client' ? 'Client Fixation HITL Queue' : 'National Cyber Fixation HITL Queue'} — {queue.length} proposals
          </h4>
          <span className="text-[10px] font-mono text-slate-500">{pending} awaiting human approval</span>
        </div>

        {queue.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl">
            No fixation proposals for this pipeline. Run a detection scan or propose a fix to populate the HITL inbox.
          </div>
        ) : (
          <div className="space-y-2 max-h-[34rem] overflow-y-auto pr-1">
            {queue.map((p) => (
              <div key={p.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-100">{p.title || p.target}</span>
                  {p.severity && <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${p.severity === 'CRITICAL' || p.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{p.severity}</span>}
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${statusMeta[p.status]?.cls || ''}`}>{statusMeta[p.status]?.label || p.status}</span>
                  <span className="font-mono text-slate-500">{p.id}</span>
                  {p.profile && <span className="text-[9px] font-mono text-slate-500">{p.profile}</span>}
                </div>
                <div className="text-slate-400 mt-1">{p.fix_action}</div>
                {p.fix_command && <div className="font-mono text-[10px] text-cyan-300 mt-1">cmd: {p.fix_command}</div>}
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" />{p.proposed_by}</span>
                  {p.risk_notes && <span>{p.risk_notes}</span>}
                  {p.approver && <span className="flex items-center gap-1 text-emerald-400"><BadgeCheck className="w-3 h-3" />{p.approver}</span>}
                  {p.evidence_token && <span className="text-emerald-400">evidence {p.evidence_token.slice(0, 12)}…</span>}
                  {p.reason && <span className="italic text-rose-300">“{p.reason}”</span>}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {p.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => action(mode === 'client' ? `/api/v1/client/fixation/approve/${p.id}` : `/api/v1/national-cyber/fixation/approve/${p.id}`, p, 'approve')}
                        disabled={actingOn !== null}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {actingOn === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve & Apply
                      </button>
                      <button
                        onClick={() => action(mode === 'client' ? `/api/v1/client/fixation/reject/${p.id}` : `/api/v1/national-cyber/fixation/reject/${p.id}`, p, 'reject')}
                        disabled={actingOn !== null}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject (HITL)
                      </button>
                    </>
                  )}
                  {p.status === 'APPLIED' && (
                    <button
                      onClick={() => action(mode === 'client' ? `/api/v1/client/fixation/rollback/${p.id}` : `/api/v1/national-cyber/fixation/rollback/${p.id}`, p, 'rollback')}
                      disabled={actingOn !== null}
                      className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      Rollback Snapshot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        HITL policy: CRITICAL / HIGH severity and €1M+ fines always require human approval. Every approve/reject/rollback is written to the immutable ledger + blockchain audit trail.
      </div>
    </div>
  );
};
export default FixationHitlCommandCenter;