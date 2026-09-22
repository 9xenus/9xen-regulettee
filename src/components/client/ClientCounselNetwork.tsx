import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe2, Search, Send, Award, Briefcase, Calendar, ScrollText, CheckCircle2, Clock, UserCheck, ShieldCheck, Loader2, MapPin } from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

export const ClientCounselNetwork: React.FC<{ tenantId?: string; tenantName?: string }> = ({ tenantId, tenantName }) => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [nations, setNations] = useState<any[]>([]);
  const [selectedNation, setSelectedNation] = useState('All');
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [caseRequests, setCaseRequests] = useState<any[]>([]);
  const [notify, setNotify] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingFor, setRequestingFor] = useState<any | null>(null);
  const [form, setForm] = useState({ topic: '', urgency: 'Standard (48 Hours)', message: '' });

  const tid = tenantId || 'org_1';
  const show = (m: string) => { setNotify(m); setTimeout(() => setNotify(null), 4000); };

  const loadAll = useCallback(async () => {
    try {
      const [pros, nats, reqs, cases] = await Promise.all([
        fetchWithRetry('/api/v1/lawyer/professionals'),
        fetchWithRetry('/api/v1/lawyer/professionals/nations'),
        fetchWithRetry(`/api/v1/lawyer/consultations/client/${tid}`),
        fetchWithRetry(`/api/v1/lawyer/clients/${tid}/case-requests`),
      ]);
      const a = await pros.json(); const b = await nats.json(); const c = await reqs.json(); const e = await cases.json();
      if (a.success) setProfessionals(a.professionals || []);
      if (b.success) setNations(b.nations || []);
      if (c.success) setMyRequests(c.sessions || []);
      if (e.success) setCaseRequests(e.requests || []);
    } catch { /* offline */ } finally { setLoading(false); }
  }, [tid]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = selectedNation === 'All'
    ? professionals
    : professionals.filter(p => (p.nations || []).some((n: string) => n === selectedNation));

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingFor) return;
    try {
      const res = await fetchWithRetry('/api/v1/lawyer/consultations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: tid, clientName: tenantName || 'Client Workspace',
          attorneyId: requestingFor.id, attorneyName: requestingFor.name,
          country: (requestingFor.nations || [])[0] || '',
          topic: form.topic,
          message: form.message,
          status: 'PENDING',
        }),
      });
      const d = await res.json();
      if (d.success) { show(`Consultation request dispatched to ${requestingFor.name}.`); setRequestingFor(null); setForm({ topic: '', urgency: 'Standard (48 Hours)', message: '' }); loadAll(); }
      else show(d.error || 'Request failed.');
    } catch { show('Counsel network unreachable.'); }
  };

  const respondCaseRequest = async (id: string, status: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/lawyer/case-requests/${id}/respond`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) { show(`Case-handling request ${status === 'ACCEPTED' ? 'accepted — counsel added to your roster.' : 'declined.'}`); loadAll(); }
      else show(d.error || 'Response failed.');
    } catch { show('Unable to respond to request.'); }
  };

  return (
    <div className="space-y-5">
      {notify && (
        <div className="p-3 rounded-xl text-xs font-mono flex items-center gap-2 bg-slate-900 dark:bg-slate-800 border border-slate-800 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notify}
        </div>
      )}

      {loading && (
        <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading counsel network…</div>
      )}

      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">Nation-Wise Counsel & Consultation Network</h2>
              <p className="text-xs text-slate-300">Select counsel by country, review verified partner profiles, and dispatch consultation requests instantly.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-indigo-200 font-semibold">{professionals.length} Counsel</span>
            <span className="px-3 py-1.5 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-indigo-200 font-semibold">{myRequests.length} Requests Sent</span>
          </div>
        </div>
      </div>

      {/* Nation selector */}
      <div className="flex items-center flex-wrap gap-2">
        <button onClick={() => setSelectedNation('All')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedNation === 'All' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400'}`}>
          🌍 All Nations
        </button>
        {nations.map(n => (
          <button key={n.key} onClick={() => setSelectedNation(n.label)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedNation === n.label ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400'}`}>
            <MapPin className="w-3 h-3 inline mr-1" />{n.label} <span className="opacity-60">({n.count})</span>
          </button>
        ))}
        {nations.length === 0 && !loading && <span className="text-xs text-slate-400">No nation groups yet — counsel roster incoming.</span>}
      </div>

      {/* Counsel directory cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-extrabold text-sm">
                  {p.name?.split(' ').map((x: string) => x[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800 dark:text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.firm || 'Independent Practice'} · {p.yearsOfPractice}y</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${p.status === 'VERIFIED_PARTNER' ? 'bg-emerald-100 text-emerald-700' : p.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Award className="w-3.5 h-3.5 text-indigo-500" /> {p.specialization || 'General Compliance'}</div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Briefcase className="w-3.5 h-3.5 text-indigo-500" /> {p.licensingAuthority || 'Licensed Counsel'}</div>
              <div className="flex items-center gap-2 flex-wrap">
                {(p.nations || []).map((n: string) => <span key={n} className="text-[9px] font-bold px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded">{n}</span>)}
                <span className="text-[10px] text-slate-400 font-mono">{p.jurisdiction}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRequestingFor(p)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5">
                <Send className="w-3 h-3" /> Request Consultation
              </button>
              <button onClick={() => { }}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="col-span-full p-6 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200">No counsel available for this nation yet.</div>
        )}
      </div>

      {/* Case handling request inbox */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-sky-600" /> Case Handling Requests from Counsel</h3>
        <div className="space-y-2">
          {caseRequests.map(r => (
            <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-white">{r.lawyer_name || 'Counsel'} offered to handle your case</div>
                <div className="text-[10px] text-slate-400 line-clamp-2">{r.reason}</div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{r.status}</span>
                {r.status === 'PENDING' && (
                  <>
                    <button onClick={() => respondCaseRequest(r.id, 'ACCEPTED')} className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg">Accept Counsel</button>
                    <button onClick={() => respondCaseRequest(r.id, 'DECLINED')} className="px-2.5 py-1 bg-white border border-rose-200 text-rose-600 text-[10px] font-bold rounded-lg">Decline</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {caseRequests.length === 0 && !loading && <div className="p-4 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">No case-handling offers from counsel yet.</div>}
        </div>
      </div>

      {/* My consultation requests */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" /> My Consultation Requests</h3>
        <div className="space-y-2">
          {myRequests.map(r => (
            <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">{r.topic || 'Consultation request'} — {r.attorneyName || 'Counsel'}</div>
                <div className="text-[10px] text-slate-400">{r.country || 'Cross-border'} · {r.message ? <span className="italic">“{String(r.message).slice(0, 80)}{String(r.message).length > 80 ? '…' : ''}”</span> : null}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${r.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : r.status === 'ACCEPTED' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>{r.status}</span>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {myRequests.length === 0 && !loading && <div className="p-4 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">No consultation requests sent yet. Select a counsel above.</div>}
        </div>
      </div>

      {/* Request modal */}
      <AnimatePresence>
        {requestingFor && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-500" /> Request Consultation · {requestingFor.name}
                </h3>
                <button onClick={() => setRequestingFor(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
              </div>
              <form onSubmit={submitRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Consultation Topic</label>
                  <input required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    placeholder="e.g. EU AI Act high-risk registration advice"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Urgency / SLA</label>
                  <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500">
                    <option value="Standard (48 Hours)">Standard (48 Hours)</option>
                    <option value="High Priority (24 Hours)">High Priority (24 Hours)</option>
                    <option value="Urgent Incident (12 Hours)">Urgent Incident (12 Hours)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Case Context / Notes</label>
                  <textarea rows={3} placeholder="Describe your regulatory concerns, systems involved, and deadlines…"
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="pt-2 flex justify-end space-x-2">
                  <button type="button" onClick={() => setRequestingFor(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1.5">
                    <Send className="w-3 h-3" /> Dispatch Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientCounselNetwork;