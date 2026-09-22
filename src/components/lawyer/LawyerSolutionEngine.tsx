import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, CheckCircle2, FileText, CreditCard, ShieldAlert } from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

export const LawyerSolutionEngine: React.FC<{ clients: any[] }> = ({ clients }) => {
  const [sol, setSol] = useState({ clientId: clients[0]?.id || '', country: '', industry: 'General', charge: true, fee: '1500' });
  const [solActs, setSolActs] = useState<string[]>([]);
  const [actsCatalog, setActsCatalog] = useState<{ regions: any[]; countries: any[] }>({ regions: [], countries: [] });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [notify, setNotify] = useState<string | null>(null);
  const [solutionsHistory, setSolutionsHistory] = useState<any[]>([]);

  const show = (m: string) => { setNotify(m); setTimeout(() => setNotify(null), 4000); };

  useEffect(() => {
    fetchWithRetry('/api/v1/jurisdiction/acts').then(r => r.json()).then(d => { if (d.success) setActsCatalog(d); }).catch(() => {});
    fetchWithRetry('/api/v1/lawyer/solutions').then(r => r.json()).then(d => { if (d.success) setSolutionsHistory(d.solutions || []); }).catch(() => {});
  }, []);

  useEffect(() => { setSol(prev => ({ ...prev, clientId: clients[0]?.id || prev.clientId })); }, [clients]);

  const toggleSolAct = (a: string) => setSolActs(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const selActs = [...new Set([
    ...(actsCatalog.regions || []).flatMap((r: any) => r.acts || []),
    ...(actsCatalog.countries || []).flatMap((c: any) => c.acts || []),
  ])];

  const generateSolution = async () => {
    if (!sol.clientId) { show('Select a client for the solution.'); return; }
    setGenerating(true);
    setGenerated(null);
    try {
      const client = clients.find(c => c.id === sol.clientId) || { name: 'Client' };
      const res = await fetchWithRetry('/api/v1/lawyer/solutions/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: sol.clientId,
          clientName: client.name,
          country: sol.country || client.country || 'DE',
          industry: sol.industry,
          acts: solActs.length ? solActs : undefined,
          charge: sol.charge,
          fee: Number(sol.fee || 1500),
          lawyerName: 'Lead Partner (OIDC)',
        }),
      });
      const d = await res.json();
      if (d.success) {
        setGenerated(d);
        setSolutionsHistory(prev => [d.solution, ...prev]);
        show(d.message || 'Solution provisioned + auto-integrated.');
      } else show(d.error || 'Solution generation failed.');
    } catch { show('Solution engine unreachable.'); } finally { setGenerating(false); }
  };

  return (
    <div className="space-y-4">
      {notify && (
        <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 bg-slate-900 dark:bg-slate-800 border-slate-800 text-emerald-300`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notify}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><Sparkles className="w-5 h-5 text-amber-500" /> Regulatory & Compliance Solution Engine</h3>
          <p className="text-xs text-slate-500 mb-4">Prescribe law/act solutions based on the client's auto-detected cross-border jurisdiction. Compliance tasks are auto-dispatched to the client dashboard, directives issued, and optional invoices generated.</p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select value={sol.clientId} onChange={e => setSol({ ...sol, clientId: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="">Select client…</option>
                {(clients || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={sol.country} onChange={e => setSol({ ...sol, country: e.target.value })} placeholder="Country override (defaults to client region)" className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase col-span-2" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Industry</label>
              <select value={sol.industry} onChange={e => setSol({ ...sol, industry: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                {['General', 'FinTech', 'HealthTech', 'AI/ML', 'Telecom', 'Cloud', 'E-Commerce', 'Gaming'].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Target Acts (empty = auto-detect all applicable)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto">
                {selActs.slice(0, 40).map(a => {
                  const active = solActs.includes(a);
                  return (
                    <button key={a} onClick={() => toggleSolAct(a)}
                      className={`text-left px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-wider transition-all ${active ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'}`}>
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={sol.charge} onChange={e => setSol({ ...sol, charge: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                Auto-generate billable invoice
              </label>
              <input value={sol.fee} onChange={e => setSol({ ...sol, fee: e.target.value })} className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg text-sm" placeholder="Fee/act EUR" />
            </div>

            <button onClick={generateSolution} disabled={generating || !sol.clientId}
              className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <Sparkles className="w-4 h-4" /> {generating ? 'Provisioning Solution & Auto-Integrating…' : 'Generate Law/Act Solution & Auto-Integrate'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-emerald-600" /> Provisioned Solution Docket</h3>
          {generated ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm"><CheckCircle2 className="w-4 h-4" /> {generated.solution.region} · {generated.solution.country}</div>
                <div className="text-xs text-emerald-700/80 mt-1">{generated.solution.title}</div>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">{generated.solution.summary}</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-indigo-50 rounded-lg"><div className="text-lg font-black text-indigo-700">{generated.solution.appliedActs?.length || 0}</div><div className="text-[9px] font-bold uppercase text-indigo-500">Acts</div></div>
                <div className="p-2 bg-emerald-50 rounded-lg"><div className="text-lg font-black text-emerald-700">{(generated.solution.tasks || []).length}</div><div className="text-[9px] font-bold uppercase text-emerald-500">Tasks Auto-Sent</div></div>
                <div className="p-2 bg-amber-50 rounded-lg"><div className="text-lg font-black text-amber-700">{generated.solution.invoiceId ? 'Yes' : '—'}</div><div className="text-[9px] font-bold uppercase text-amber-500">Invoice</div></div>
              </div>
              <div className="space-y-2">
                {(generated.solution.provisions || []).map((p: any) => (
                  <div key={p.act} className="p-3 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-indigo-600 tracking-wider">{p.act}</span>
                      <span className="text-[10px] font-bold text-slate-600">{p.title}</span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
                      <div><span className="text-[9px] font-bold uppercase text-slate-400">Obligations</span>
                        <ul className="text-[10px] text-slate-600">{p.obligations.slice(0, 2).map((o: string, i: number) => <li key={i}>◦ {o}</li>)}</ul>
                      </div>
                      <div><span className="text-[9px] font-bold uppercase text-slate-400">Counsel Steps</span>
                        <ul className="text-[10px] text-slate-600">{p.steps.slice(0, 2).map((o: string, i: number) => <li key={i}>› {o}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">Generated docket will appear here with the full act-by-act solution.</div>
          )}
        </div>
      </div>

      {solutionsHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><ShieldAlert className="w-4 h-4 text-rose-500" /> Recent Provisioned Solutions</h3>
          <div className="space-y-2">
            {solutionsHistory.slice(0, 10).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-800">{s.client_name} · {s.region}</div>
                  <div className="text-[10px] text-slate-400">{s.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-indigo-600">{(s.appliedActs || []).length} acts</span>
                  {s.invoice_id && <CreditCard className="w-3.5 h-3.5 text-amber-500" />}
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-slate-100 text-slate-600">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerSolutionEngine;