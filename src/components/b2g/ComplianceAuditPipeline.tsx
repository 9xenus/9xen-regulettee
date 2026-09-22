import React, { useState, useEffect } from 'react';
import {
  Play, RefreshCw, FileSearch, Activity, ShieldCheck, CheckCircle2, XCircle, Cpu, Bug,
  FileText, Loader2, Search, TrendingDown, UserCheck, ScrollText,
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

const API = '/api/v1/compliance-hub/audit/pipeline';

type Finding = {
  id: string;
  run_id: string;
  rule_code: string;
  rule_title: string;
  severity: string;
  risk_level: string;
  root_cause: string;
  possible_loss_eur: number;
  suggested_fix: string;
  hitl_status: string;
  applied_at: string | null;
  created_at: string;
};

const STAGES = [
  { id: 0, label: 'Scan / Evaluate Rules', icon: Search },
  { id: 1, label: 'Detect Violations', icon: Bug },
  { id: 2, label: 'Root Cause Analysis', icon: TrendingDown },
  { id: 3, label: 'Possible Loss', icon: FileText },
  { id: 4, label: 'Auto-Remediation (HITL)', icon: UserCheck },
  { id: 5, label: 'Audit Report', icon: ScrollText },
];

export const ComplianceAuditPipeline: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [openRun, setOpenRun] = useState<any>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [viewReport, setViewReport] = useState(false);

  // form
  const [tenantId, setTenantId] = useState('comp_1789644063886_77m0hw');
  const [scope, setScope] = useState('FULL_SCOPE');
  const [turnover, setTurnover] = useState('120000000');

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry(`${API}/runs`);
      const d = await res.json();
      if (d.success) setRuns(d.runs || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchRuns(); }, []);

  const runAudit = async () => {
    setRunning(true);
    setStatus('Running compliance rule scan → detection → RCA → loss → HITL remediation…');
    setViewReport(false);
    setOpenRun(null);
    try {
      const res = await fetchWithRetry(`${API}/run`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId, scope, annualTurnoverEur: parseInt(turnover, 10) || 120000000,
          facts: { event: 'AUDIT_SCAN', scope, tenantId, annualTurnoverEur: parseInt(turnover, 10) || 120000000 }
        })
      });
      const d = await res.json();
      if (d.success) {
        setOpenRun(d.run);
        setFindings(d.findings || []);
        setStatus(`Audit pipeline complete — ${d.run.totalFindings} findings · €${Number(d.run.totalLossEur).toLocaleString()} possible loss · report ${d.run.reportHash.slice(0, 12)}…`);
        await fetchRuns();
        setViewReport(true);
      } else { setStatus(d.error || 'Audit pipeline failed.'); }
    } catch (e: any) { setStatus(e.message || 'Audit pipeline failed.'); } finally { setRunning(false); }
  };

  const loadRun = async (id: string) => {
    try {
      const res = await fetchWithRetry(`${API}/runs/${id}`);
      const d = await res.json();
      if (d.success) { setOpenRun(d.run); setFindings(d.findings || []); setViewReport(false); }
    } catch (e) { /* ignore */ }
  };

  const hitl = async (id: string, approve: boolean) => {
    try {
      const res = await fetchWithRetry(`${API}/findings/${id}/${approve ? 'approve' : 'reject'}`, { method: 'POST' });
      const d = await res.json();
      setStatus(d.message || d.error);
      if (d.success && openRun) await loadRun(openRun.id);
    } catch (e: any) { setStatus(e.message || 'HITL action failed.'); }
  };

  const sevBadge = (s: string) => (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-white ${s === 'CRITICAL' ? 'bg-red-600' : s === 'HIGH' ? 'bg-orange-600' : s === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'}`}>{s}</span>
  );
  const statusBadge = (s: string) => (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${s === 'APPROVED' ? 'bg-emerald-950 text-emerald-300' : s === 'REJECTED' ? 'bg-red-950 text-red-300' : 'bg-amber-950 text-amber-300'}`}>{s}</span>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">Compliance Rule Audit Pipeline</h3>
            <p className="text-sm text-slate-400">Rule scan → detect → root cause → possible loss → suggested auto-remediation (HITL) → sealed audit report.</p>
          </div>
        </div>
        <button onClick={fetchRuns} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>

      {/* Pipeline stepper */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/50 rounded-xl p-3 border border-slate-700/70">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const active = openRun && i < (viewReport ? STAGES.length : Math.min(STAGES.length, findings.find(f => f.hitl_status === 'PENDING') ? 4 : 4));
          return (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold font-mono ${active ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : i === 0 && !openRun ? 'bg-slate-800 text-slate-300 border-slate-600' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                <Icon className="w-3 h-3" />{s.label}
              </div>
              {i < STAGES.length - 1 && <span className="text-slate-600 text-[10px]">→</span>}
            </React.Fragment>
          );
        })}
      </div>

      {status && <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-800 rounded-lg px-3 py-2">{status}</div>}

      {/* Form */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Tenant</label>
          <select value={tenantId} onChange={e => setTenantId(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none">
            <option value="comp_1789644063886_77m0hw">Test Client Ltd (real tenant)</option>
            <option value="org_1">org_1 (platform)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Scope</label>
          <input value={scope} onChange={e => setScope(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Annual Turnover (EUR)</label>
          <input value={turnover} onChange={e => setTurnover(e.target.value)} type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
        </div>
        <div className="sm:col-span-3">
          <button onClick={runAudit} disabled={running} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run Compliance Audit Pipeline
          </button>
        </div>
      </div>

      {/* Run summary */}
      {openRun && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-white flex items-center gap-2"><Cpu className="w-4 h-4 text-emerald-400" />{openRun.id} <span className="text-slate-500">· {openRun.tenant_id} · {openRun.scope}</span></div>
            <div className="flex gap-1.5">
              <button onClick={() => setViewReport(!viewReport)} className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg cursor-pointer flex items-center gap-1 transition-colors"><ScrollText className="w-3 h-3" />{viewReport ? 'Back to Findings' : 'View Audit Report'}</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Findings</div><div className="text-lg font-bold text-amber-400">{openRun.total_findings}</div></div>
            <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Possible Loss</div><div className="text-lg font-bold text-red-400">€{Number(openRun.total_loss_eur).toLocaleString()}</div></div>
            <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Applied</div><div className="text-lg font-bold text-emerald-400">{openRun.remediations_applied}</div></div>
            <div className="bg-slate-900 rounded-lg p-2.5 text-center"><div className="text-[9px] font-mono uppercase text-slate-500">Report Seal</div><div className="text-[10px] font-mono text-emerald-400 truncate">{openRun.report_hash?.slice(0, 14) || '—'}…</div></div>
          </div>
        </div>
      )}

      {/* Findings / Report body */}
      {openRun && !viewReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><FileSearch className="w-4 h-4 text-cyan-400" /> Findings — Root Cause · Loss · HITL Remediation</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="px-4 py-2.5">Rule</th><th className="px-4 py-2.5">Severity</th><th className="px-4 py-2.5">Root Cause</th><th className="px-4 py-2.5">Loss</th><th className="px-4 py-2.5">Suggested Fix</th><th className="px-4 py-2.5">HITL</th><th className="px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {findings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/30 align-top">
                    <td className="px-4 py-2.5 max-w-[220px]">
                      <div className="text-violet-300 font-bold">{f.rule_code}</div>
                      <div className="text-[10px] text-slate-500">{f.rule_title}</div>
                    </td>
                    <td className="px-4 py-2.5">{sevBadge(f.severity)}</td>
                    <td className="px-4 py-2.5 text-slate-400 max-w-[260px] text-[11px]">{f.root_cause}</td>
                    <td className="px-4 py-2.5 text-red-300 font-bold whitespace-nowrap">€{Number(f.possible_loss_eur).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-emerald-300 max-w-[240px] text-[11px]">{f.suggested_fix}</td>
                    <td className="px-4 py-2.5">{statusBadge(f.hitl_status)}</td>
                    <td className="px-4 py-2.5">
                      {f.hitl_status === 'PENDING' ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => hitl(f.id, true)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white rounded-lg cursor-pointer flex items-center gap-1 transition-colors"><CheckCircle2 className="w-3 h-3" />Approve & Apply</button>
                          <button onClick={() => hitl(f.id, false)} className="px-2.5 py-1 bg-slate-700 hover:bg-red-600 text-[10px] font-bold text-slate-200 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"><XCircle className="w-3 h-3" />Reject</button>
                        </div>
                      ) : <span className="text-slate-600 text-[10px]">{f.applied_at || '—'}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit report */}
      {openRun && viewReport && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Sealed Audit Report <span className="ml-auto text-[10px] font-mono text-emerald-400">SHA-256 {openRun.report_hash?.slice(0, 16) || ''}…</span></div>
          <pre className="p-4 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">{openRun.report_content}</pre>
        </div>
      )}

      {/* History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Audit Pipeline History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="px-4 py-2.5">Run</th><th className="px-4 py-2.5">Tenant</th><th className="px-4 py-2.5">Scope</th><th className="px-4 py-2.5">Findings</th><th className="px-4 py-2.5">Loss</th><th className="px-4 py-2.5">Applied</th><th className="px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 cursor-pointer" onClick={() => loadRun(r.id)}>
                  <td className="px-4 py-2.5 text-emerald-300 font-bold">{r.id}</td>
                  <td className="px-4 py-2.5 text-white">{r.tenant_id}</td>
                  <td className="px-4 py-2.5 text-slate-400">{r.scope}</td>
                  <td className="px-4 py-2.5 text-slate-300">{r.total_findings}</td>
                  <td className="px-4 py-2.5 text-red-300 font-bold">€{Number(r.total_loss_eur).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-emerald-400">{r.remediations_applied}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-[10px]">{r.created_at}</td>
                </tr>
              ))}
              {runs.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No audit runs yet — launch one above.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};