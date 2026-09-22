import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, Radar, AlertTriangle, Target, Gavel, Sparkles, Lock, Loader2, UserCheck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { fetchWithRetry } from '../../lib/api-client';

interface Violation {
  id: string;
  run_id: string;
  entity_id: string;
  entity_name: string;
  target: string;
  profile: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  evidence: string;
  compliance_ref: string;
  violation_code: string;
  auto_fixable: number;
  fix_confidence: number;
  escalation_level: number;
  estimated_fine_eur: number;
  triage_status: string;
  fix_status: string;
  created_at?: string;
}

interface EnforcementCase {
  id: string;
  violation_id: string;
  case_id: string;
  notice_ref: string;
  entity_name: string;
  fine_amount_eur: number;
  regulator_id: string;
  rule: string;
  enforcement_mode: string;
  approved_by?: string;
  status: string;
  created_at?: string;
}

const severityCls = (s: string) =>
  s === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
  : s === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
  : s === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';

export const NationalCyberCommandView: React.FC = () => {
  const { showToast } = useNotification();
  const [overview, setOverview] = useState<any>({});
  const [violations, setViolations] = useState<Violation[]>([]);
  const [enforcement, setEnforcement] = useState<EnforcementCase[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [o, v, e] = await Promise.all([
        fetchWithRetry('/api/v1/national-cyber/overview'),
        fetchWithRetry('/api/v1/national-cyber/violations'),
        fetchWithRetry('/api/v1/national-cyber/enforcement'),
      ]);
      const od = await o.json();
      const vd = await v.json();
      const ed = await e.json();
      if (od?.overview) setOverview(od.overview);
      if (vd?.violations) setViolations(vd.violations);
      if (ed?.enforcement) setEnforcement(ed.enforcement);
    } catch (e: any) {
      showToast(`Load failed: ${e?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runDetection = async (target: string, profile: string) => {
    setRunning(`${target}|${profile}`);
    try {
      const r = await fetchWithRetry('/api/v1/national-cyber/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, profile, entityName: target.split('.')[0] }),
      });
      const data = await r.json();
      if (data?.success) {
        showToast(`Detection run ${data.runId} — ${data.riskScore}/100 risk score, ${data.violations?.length} violations.`, 'success');
        load();
      } else showToast(data?.error || 'Detection failed.', 'error');
    } catch (e: any) { showToast(`Detection error: ${e?.message}`, 'error'); }
    finally { setRunning(null); }
  };

  const proposeFix = async (v: Violation) => {
    setActing(`propose:${v.id}`);
    try {
      const r = await fetchWithRetry(`/api/v1/national-cyber/fixation/propose/${v.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedBy: 'national-cyber-engine', policy: 'HITL_REQUIRED' }),
      });
      const data = await r.json();
      if (data?.success) showToast(`Proposal ${data.proposalId} queued (${data.status}). HITL gate engaged.`, 'success');
      else showToast(data?.error || 'Propose failed.', 'error');
      load();
    } catch (e: any) { showToast(`Propose error: ${e?.message}`, 'error'); }
    finally { setActing(null); }
  };

  const enforce = async (v: Violation, mode: 'AUTO' | 'HITL') => {
    setActing(`enforce:${v.id}`);
    try {
      const approvedBy = mode === 'AUTO' && (v.severity === 'CRITICAL' || v.severity === 'HIGH') ? null : 'saad.controltower@regulettee.eu';
      const r = await fetchWithRetry(`/api/v1/national-cyber/enforce/${v.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulatorId: 'EU-CYBER', approvedBy, mode }),
      });
      const data = await r.json();
      if (data?.success) showToast(`Enforcement case ${data.caseId} opened · notice ${data.noticeRef} · fine €${Number(data.fine || 0).toLocaleString()} · mode ${data.mode}.`, 'success');
      else showToast(data?.error || 'Enforcement failed.', data?.requiresHITL ? 'warning' : 'error');
      load();
    } catch (e: any) { showToast(`Enforcement error: ${e?.message}`, 'error'); }
    finally { setActing(null); }
  };

  const trigger = [{ key: 'NIS2_CORE', label: 'NIS2 Core (cybersecurity)', target: 'gov-portal.sovcorp.eu' },
                   { key: 'DORA_OUTAGE', label: 'DORA financial resilience', target: 'bank-fintech.eu' },
                   { key: 'GDPR_DPIA', label: 'GDPR DPIA sweep', target: 'retail-datahub.eu' }];

  return (
    <div className="space-y-4">
      {/* Header + KPIs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-950/60 border border-violet-800 rounded-xl text-violet-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">National Cyber Defence — Auto Violation Detection & Enforcement
                <span className="text-[9px] font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded uppercase">sovereign b2g</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">NIS2 / DORA / GDPR / EU AI Act detection sweeps, auto-fixation HITL gate, and penalty enforcement escalation against regulated entities.</p>
            </div>
          </div>
          <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { label: 'Detection Runs', value: overview.detectionRuns ?? 0, icon: Radar, cls: 'text-indigo-400' },
            { label: 'Open Violations', value: overview.openViolations ?? 0, icon: AlertTriangle, cls: 'text-amber-400' },
            { label: 'Fixed', value: overview.fixedViolations ?? 0, icon: ShieldCheck, cls: 'text-emerald-400' },
            { label: 'HITL Pending', value: overview.pendingHITL ?? 0, icon: Lock, cls: 'text-rose-400' },
            { label: 'Enforcement Cases', value: overview.enforcementCases ?? 0, icon: Gavel, cls: 'text-orange-400' },
            { label: 'Est. Fines', value: `€${Number(overview.estEnforcedFinesEur ?? 0).toLocaleString()}`, icon: Target, cls: 'text-cyan-400' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800/60 rounded-xl p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.cls}`} />
              <div className="text-base font-black font-mono text-white">{s.value}</div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Run detection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2"><Radar className="w-4 h-4 text-indigo-400" /> Trigger National Detection Sweep</h4>
        <div className="flex flex-wrap gap-2">
          {trigger.map(t => (
            <button
              key={t.key}
              onClick={() => runDetection(t.target, t.key)}
              disabled={running !== null}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {running === `${t.target}|${t.key}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Violations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-white mb-3">Detected Violations — {violations.length}</h4>
        <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
          {violations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl">No violations yet — trigger a detection sweep above.</div>
          ) : violations.map(v => (
            <div key={v.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-100">{v.title}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${severityCls(v.severity)}`}>{v.severity}</span>
                <span className="text-[9px] font-mono text-slate-500">{v.violation_code}</span>
                <span className="text-[9px] font-mono text-slate-500">{v.profile} · {v.target}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${v.fix_status === 'FIXED' ? 'bg-emerald-500/20 text-emerald-300' : v.fix_status === 'PENDING_APPROVAL' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>{v.fix_status || 'NONE'}</span>
                <span className="text-[9px] font-mono text-rose-300">€{Number(v.estimated_fine_eur).toLocaleString()}</span>
              </div>
              <div className="text-slate-400 mt-1 line-clamp-2">{v.description}</div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">{v.compliance_ref} · conf {Math.round(Number(v.fix_confidence) * 100)}% · L{v.escalation_level}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {v.fix_status === 'NONE' && (
                  <button onClick={() => proposeFix(v)} disabled={acting !== null} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                    {acting === `propose:${v.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    Propose Fix (HITL)
                  </button>
                )}
                {v.fix_status === 'PENDING_APPROVAL' && (
                  <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Awaiting human approval — manage in Fixation HITL tab</span>
                )}
                <button onClick={() => enforce(v, 'HITL')} disabled={acting !== null} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {acting === `enforce:${v.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gavel className="w-3.5 h-3.5" />}
                  Escalate & Enforce
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enforcement cases */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-white mb-3">B2G Enforcement Docket — {enforcement.length}</h4>
        {enforcement.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl">No enforcement cases yet.</div>
        ) : (
          <div className="space-y-2">
            {enforcement.map(c => (
              <div key={c.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-100 flex items-center gap-2">{c.entity_name} <span className="text-[9px] font-mono text-slate-500">{c.case_id}</span></div>
                  <div className="text-slate-400 font-mono text-[10px]">notice {c.notice_ref} · {c.rule} · {c.enforcement_mode} mode{ c.approved_by ? ` · approved by ${c.approved_by}` : ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black font-mono text-rose-300">€{Number(c.fine_amount_eur).toLocaleString()}</div>
                  <div className="text-[9px] font-mono text-slate-500">{c.status} · {c.regulator_id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default NationalCyberCommandView;