import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Send, UserCheck, Handshake, ShieldAlert, Euro, AlertTriangle, CheckCircle2, Star, Loader2 } from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

export const LawyerClientSignalsSuite: React.FC<{ onOpenSolution?: (clientId: string, name: string) => void }> = ({ onOpenSolution }) => {
  const [platformClients, setPlatformClients] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [regulators, setRegulators] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [notify, setNotify] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const show = (m: string) => { setNotify(m); setTimeout(() => setNotify(null), 4000); };

  const loadAll = useCallback(async () => {
    try {
      const [pc, req, reg, linked] = await Promise.all([
        fetchWithRetry('/api/v1/lawyer/platform/clients'),
        fetchWithRetry('/api/v1/lawyer/case-requests'),
        fetchWithRetry('/api/v1/lawyer/regulators'),
        fetchWithRetry('/api/v1/lawyer/clients'),
      ]);
      const a = await pc.json(); const b = await req.json(); const c = await reg.json(); const d = await linked.json();
      if (a.success) setPlatformClients(a.clients || []);
      if (b.success) setRequests(b.requests || []);
      if (c.success) { setRegulators(c.regulators || []); setConnections(c.connections || []); }
      if (d.success) setLinkedIds((d.clients || []).map((x: any) => x.id));
    } catch { /* offline */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const requestCase = async (clientId: string, clientName: string) => {
    const client = platformClients.find(c => c.id === clientId);
    const reason = `Request to handle compliance case for ${clientName} — current posture ${client?.score ?? 'n/a'}/100${client?.grade ? ` (${client.grade})` : ''} with ${client?.violations || 0} open violation(s) and ${client?.openFines || 0} unpaid fine(s).`;
    try {
      const res = await fetchWithRetry(`/api/v1/lawyer/clients/${clientId}/case-request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientName, lawyerName: 'Lead Partner (OIDC)', reason }),
      });
      const dt = await res.json();
      if (dt.success) { show(`Case-handling request dispatched to ${clientName}.`); loadAll(); } else show(dt.error || 'Request failed.');
    } catch { show('Unable to send case request.'); }
  };

  const connectRegulator = async (regId: string, countryCode: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/lawyer/regulators/${regId}/connect`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ countryCode }),
      });
      const dt = await res.json();
      if (dt.success) { show(dt.message || 'Regulator liaison connected.'); loadAll(); }
    } catch { show('Unable to connect to regulator.'); }
  };

  const scoreColor = (s: number | null) => {
    if (s == null) return 'text-slate-400';
    if (s >= 85) return 'text-emerald-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-4">
      {notify && (
        <div className="p-3 rounded-xl text-xs font-mono flex items-center gap-2 bg-slate-900 dark:bg-slate-800 border-slate-800 text-emerald-300 border">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notify}
        </div>
      )}

      {loading && (
        <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading platform client signals…</div>
      )}

      {/* ============ PLATFORM CLIENT POSTURE BOARD ============ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-600" /> Platform Clients · Compliance Posture Board</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{platformClients.length} companies</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {platformClients.map(c => (
            <div key={c.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 dark:text-white truncate">{c.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{c.industry} · {c.country}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${linkedIds.includes(c.id) ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{linkedIds.includes(c.id) ? 'Client' : 'Platform'}</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className={`text-3xl font-black ${scoreColor(c.score)}`}>{c.score ?? '—'}</div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Compliance Score</div>
                  <div className="text-sm font-black text-slate-700 dark:text-slate-300">{c.grade ? `Grade ${c.grade}` : 'Unrated'}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="p-2 bg-rose-50 rounded-lg"><div className="text-sm font-black text-rose-700">{c.violations}</div><div className="text-[9px] font-bold uppercase text-rose-500">Violations</div></div>
                <div className="p-2 bg-amber-50 rounded-lg"><div className="text-sm font-black text-amber-700">{c.openFines}</div><div className="text-[9px] font-bold uppercase text-amber-500">Fines</div></div>
                <div className="p-2 bg-slate-50 rounded-lg"><div className="text-sm font-black text-slate-700">{c.openTasks}</div><div className="text-[9px] font-bold uppercase text-slate-500">Tasks</div></div>
              </div>
              <div className="mt-2 space-y-1">
                {c.criticalViolations > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600"><AlertTriangle className="w-3 h-3" /> {c.criticalViolations} critical findings</div>
                )}
                {Number(c.penaltyTotalEur) > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600"><Euro className="w-3 h-3" /> {Number(c.penaltyTotalEur).toLocaleString()} penalty exposure</div>
                )}
                {Number(c.estLossEur) > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><ShieldAlert className="w-3 h-3" /> Est. loss {Number(c.estLossEur).toLocaleString()} EUR</div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => requestCase(c.id, c.name)} className="flex-1 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-1.5"><Send className="w-3 h-3" /> Request to Handle Case</button>
                {onOpenSolution && (
                  <button onClick={() => onOpenSolution(c.id, c.name)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1.5"><Star className="w-3 h-3" /> Solution</button>
                )}
              </div>
            </div>
          ))}
          {platformClients.length === 0 && !loading && (
            <div className="col-span-full p-6 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200">No platform clients with compliance signals found.</div>
          )}
        </div>
      </motion.div>

      {/* ============ CASE HANDLING REQUESTS ============ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4"><UserCheck className="w-5 h-5 text-emerald-600" /> Case Handling Requests</h3>
        <div className="space-y-2">
          {requests.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">{r.client_name}</div>
                <div className="text-[10px] text-slate-400 max-w-xl truncate">{r.reason}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{r.status}</span>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {requests.length === 0 && <div className="p-4 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">No case-handling requests sent yet.</div>}
        </div>
      </motion.div>

      {/* ============ REGULATOR CONNECT ============ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4"><Handshake className="w-5 h-5 text-sky-600" /> Regulator Liaison Connect</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {regulators.map(r => {
            const connected = connections.some(c => c.regulator_id === r.id);
            return (
              <div key={r.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-800 dark:text-white">{r.countryName} Competent Authority</div>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{connected ? 'Connected' : 'Available'}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{r.id} · {r.region} · {r.localLaw || '—'}</div>
                {(r.acts || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(r.acts || []).slice(0, 5).map((a: string) => <span key={a} className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded">{a}</span>)}
                  </div>
                )}
                <button onClick={() => connectRegulator(r.id, r.countryCode)} disabled={connected}
                  className={`w-full mt-3 py-2 text-[10px] font-bold rounded-lg ${connected ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700'} flex items-center justify-center gap-1.5`}>
                  {connected ? <CheckCircle2 className="w-3 h-3" /> : <Handshake className="w-3 h-3" />} {connected ? 'Liaison Active' : 'Connect Formal Liaison'}
                </button>
              </div>
            );
          })}
          {regulators.length === 0 && !loading && <div className="col-span-full p-4 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">Regulator directory empty.</div>}
        </div>
        {connections.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Active Liaison Channels</h4>
            <div className="space-y-1.5">
              {connections.map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-sky-50 text-sky-800">
                  <span className="font-bold">{c.regulator_name}</span>
                  <span className="font-mono text-[10px]">{c.country_code} · {c.channel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LawyerClientSignalsSuite;