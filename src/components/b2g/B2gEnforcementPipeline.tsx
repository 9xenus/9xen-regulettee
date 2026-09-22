import React, { useState, useEffect } from 'react';
import {
  Play, RefreshCw, Globe, FileText, Send, AlertTriangle, Landmark, CheckCircle2, Wallet,
  ShieldCheck, Gavel, Activity, Building2, ArrowRight, Loader2, Banknote, Fingerprint,
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

const API = '/api/v1/b2g/pipeline';

const STAGES: { id: string; label: string; icon: any }[] = [
  { id: 'SCANNING', label: 'Scan', icon: Globe },
  { id: 'DETECT', label: 'Detect Violations', icon: Gavel },
  { id: 'PENALTY_CALC', label: 'Calculate Penalty', icon: Banknote },
  { id: 'REPORT', label: 'Send Report', icon: FileText },
  { id: 'NOTIFY', label: 'Enforce Notice', icon: Send },
  { id: 'WARNING_BILL', label: 'Warning → Pay Bill', icon: AlertTriangle },
];

type Run = {
  id: string;
  status?: string;
  country: string;
  regulator: string;
  company: string;
  companyId: string;
  target: string;
  profile: string;
  scanScore: number;
  violationsFound: number;
  calculatedPenaltyEur: number;
  annualTurnoverEur: number;
  reportHash: string;
  invoiceId: string;
  noticeHash: string;
  dueAt?: string;
  stages: string[];
  violations: { severity: string; article: string; issue: string; fineEur: number }[];
};

export const B2gEnforcementPipeline: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [activeRun, setActiveRun] = useState<Run | null>(null);

  // form
  const [target, setTarget] = useState('gov-portal.sovcorp.eu');
  const [country, setCountry] = useState('DE');
  const [profile, setProfile] = useState('GDPR_EPRIVACY');
  const [companyName, setCompanyName] = useState('Acme Sovereign AG');
  const [companyId, setCompanyId] = useState('comp-101');
  const [turnover, setTurnover] = useState('120000000');
  const [ceoName, setCeoName] = useState('Alexandra Weber');
  const [ceoEmail, setCeoEmail] = useState('ceo@acme-sov.eu');

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry(`${API}/runs`);
      const d = await res.json();
      if (d.success) setRuns(d.runs || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchRuns(); }, []);

  const runPipeline = async () => {
    setRunning(true);
    setStatus('Launching B2G national enforcement pipeline…');
    try {
      const res = await fetchWithRetry(`${API}/run`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, country, profile, companyName, companyId, annualTurnoverEur: parseInt(turnover, 10) || 120000000, ceoName, ceoEmail, regulatorName: `${country} Bundesnetzagentur` })
      });
      const d = await res.json();
      if (d.success) {
        setActiveRun(d.run);
        setStatus(`Pipeline completed — ${d.run.stages.length} stages executed · €${d.run.calculatedPenaltyEur.toLocaleString()} penalty · bill ${d.run.invoiceId}`);
        await fetchRuns();
      } else { setStatus(d.error || 'Pipeline failed.'); }
    } catch (e: any) { setStatus(e.message || 'Pipeline failed.'); } finally { setRunning(false); }
  };

  const markPaid = async (id: string) => {
    try {
      const res = await fetchWithRetry(`${API}/runs/${id}/pay`, { method: 'POST' });
      const d = await res.json();
      setStatus(d.message || d.error);
      if (d.success) { setActiveRun((prev: any) => prev ? { ...prev, status: 'PAID' } : prev); await fetchRuns(); }
    } catch (e: any) { setStatus(e.message || 'Pay failed.'); }
  };

  const sevColor = (s: string) => s === 'CRITICAL' ? 'bg-red-500' : s === 'HIGH' ? 'bg-orange-500' : s === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500';

  const stageIndex = (run: Run) => run.stages?.length ?? 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20"><Landmark className="w-6 h-6" /></div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">B2G National Enforcement Pipeline</h3>
            <p className="text-sm text-slate-400">Scan → Detect → Penalty → Report → Enforce notice → Warning to pay bill. Statutory fine formulas per country with turnover caps.</p>
          </div>
        </div>
        <button onClick={fetchRuns} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>

      {status && <div className="text-[11px] font-mono text-amber-300 bg-amber-950/30 border border-amber-800 rounded-lg px-3 py-2">{status}</div>}

      {/* Launch form */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Scan Target</label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input value={target} onChange={e => setTarget(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Country</label>
          <select value={country} onChange={e => setCountry(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none">
            {['DE', 'FR', 'IT', 'ES', 'NL', 'EU'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Compliance Profile</label>
          <select value={profile} onChange={e => setProfile(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none">
            {['GDPR_EPRIVACY', 'NIS2_CORE', 'DORA_CYBER_WEB', 'AI_ACT_DISCLOSURE', 'CONSUMER_RIGHTS'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Annual Turnover (EUR)</label>
          <input value={turnover} onChange={e => setTurnover(e.target.value)} type="number" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Company</label>
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Business Authority Contact (CEO)</label>
          <input value={ceoName} onChange={e => setCeoName(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">Authority Email</label>
          <input value={ceoEmail} onChange={e => setCeoEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" />
        </div>
        <div className="flex items-end">
          <button onClick={runPipeline} disabled={running} className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run Pipeline
          </button>
        </div>
      </div>

      {/* Pipeline stepper (latest run) */}
      {activeRun && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/70">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-white flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-400" />{activeRun.company} <span className="text-slate-500">· {activeRun.country}</span></div>
            {activeRun.status === 'PAID' ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">BILL PAID</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold">PENALTY DUE €{activeRun.calculatedPenaltyEur.toLocaleString()}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const done = i < stageIndex(activeRun);
              return (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold font-mono ${done ? (i === STAGES.length - 1 ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800') : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {done ? <CheckCircle2 className="w-3 h-3" /> : <Icon className="w-3 h-3" />}{s.label}
                  </div>
                  {i < STAGES.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 rounded-lg p-2.5 text-center">
              <div className="text-[9px] font-mono uppercase text-slate-500">Risk Score</div>
              <div className="text-lg font-bold text-red-400">{activeRun.scanScore}/100</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-2.5 text-center">
              <div className="text-[9px] font-mono uppercase text-slate-500">Violations</div>
              <div className="text-lg font-bold text-amber-400">{activeRun.violationsFound}</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-2.5 text-center">
              <div className="text-[9px] font-mono uppercase text-slate-500">Penalty (EUR)</div>
              <div className="text-lg font-bold text-white">€{activeRun.calculatedPenaltyEur.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-2.5 text-center">
              <div className="text-[9px] font-mono uppercase text-slate-500">Report Seal</div>
              <div className="text-[10px] font-mono text-emerald-400 truncate">{activeRun.reportHash?.slice(0, 12) || '—'}…</div>
            </div>
          </div>
          {activeRun.violations?.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {activeRun.violations.map((v, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sevColor(v.severity)}`} />
                  <span className="font-mono text-slate-300">{v.article}</span>
                  <span className="text-slate-500 flex-1 truncate">{v.issue}</span>
                  <span className="text-amber-300 font-bold">€{v.fineEur.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1"><Send className="w-3 h-3 text-cyan-400" />Notice seal {activeRun.noticeHash?.slice(0, 10)}…</span>
            <span className="flex items-center gap-1"><Banknote className="w-3 h-3 text-emerald-400" />Invoice {activeRun.invoiceId} · due {activeRun.dueAt}</span>
          </div>
          {activeRun.status !== 'PAID' && (
            <button onClick={() => markPaid(activeRun.id)} className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors">
              <Wallet className="w-3.5 h-3.5" /> Mark Penalty Bill Paid
            </button>
          )}
        </div>
      )}

      {/* History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-amber-400" /> Pipeline Run History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="px-4 py-2.5">Run</th><th className="px-4 py-2.5">Company</th><th className="px-4 py-2.5">Country</th><th className="px-4 py-2.5">Score</th><th className="px-4 py-2.5">Violations</th><th className="px-4 py-2.5">Penalty</th><th className="px-4 py-2.5">Bill</th><th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-2.5 text-amber-300 font-bold">{r.id}</td>
                  <td className="px-4 py-2.5 text-white">{r.company_name}</td>
                  <td className="px-4 py-2.5 text-slate-400">{r.country}</td>
                  <td className="px-4 py-2.5 text-slate-300">{r.scan_score}/100</td>
                  <td className="px-4 py-2.5 text-slate-400">{r.violations_found}</td>
                  <td className="px-4 py-2.5 text-amber-300 font-bold">€{Number(r.calculated_penalty_eur).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-emerald-300">{r.invoice_id}</td>
                  <td className="px-4 py-2.5">{r.status === 'PAID' ? <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-bold">PAID</span> : <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[9px] font-bold">DUE</span>}</td>
                </tr>
              ))}
              {runs.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">No pipeline runs yet — launch one above.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};