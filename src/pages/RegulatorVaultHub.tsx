import React, { useState, useEffect, useCallback } from 'react';
import {
  Vault, FileText, ShieldCheck, Plus, RefreshCw, CheckCircle2, AlertTriangle,
  Loader2, Fingerprint, ScrollText, Sparkles, Database, Archive, Trash2, Copy,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { fetchWithRetry } from '../lib/api-client';

const API = '/api/v1/regulator-vault';

const CATEGORIES = ['REGULATORY_TEXT', 'LEGAL_OPINION', 'ENFORCEMENT_GUIDANCE', 'TECHNICAL_STANDARD', 'B2G_FRAMEWORK', 'OTHER'];
const STATUS_COLORS: Record<string, string> = {
  PENDING_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  PUBLISHED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  ARCHIVED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  VERIFIED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  SEALED: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  PENDING_VERIFICATION: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

export const RegulatorVaultHub: React.FC = () => {
  const { showToast } = useNotification();
  const [tab, setTab] = useState<'documents' | 'evidence'>('documents');
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [integ, setInteg] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [pulse, setPulse] = useState('');

  const [docForm, setDocForm] = useState({ title: '', category: 'REGULATORY_TEXT', regulation_code: 'GDPR', country: 'EU', content: '', status: 'PENDING_REVIEW', auto_seal: true });
  const [evForm, setEvForm] = useState({ title: '', description: '', category: 'TECHNICAL', severity: 'MEDIUM', case_id: '', source: 'ENFORCEMENT', source_ref: '' });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [d, e] = await Promise.all([
        fetchWithRetry(`${API}/documents`),
        fetchWithRetry(`${API}/evidence`),
      ]);
      const dd = await d.json().catch(() => ({} as any));
      const ed = await e.json().catch(() => ({} as any));
      if (dd.success) setDocs(dd.documents || []);
      if (ed.success) setEvidence(ed.evidence || []);
    } catch { } finally { setLoading(false); }
  }, []);

  const loadLedger = useCallback(async () => {
    try {
      const res = await fetchWithRetry(`${API}/evidence/audit-ledger`);
      const d = await res.json().catch(() => ({} as any));
      if (d.success) { setLedger(d.ledger || []); setInteg(null); }
    } catch { }
    try {
      const res = await fetchWithRetry(`${API}/evidence/audit-ledger/integrity`);
      const d = await res.json().catch(() => ({} as any));
      if (d.success) setInteg(d.integrity || null);
    } catch { }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    if (tab === 'evidence') loadLedger();
  }, [tab, loadLedger]);

  const registerDoc = async () => {
    if (!docForm.title.trim()) { showToast('Document title is required.', 'error'); return; }
    try {
      const res = await fetchWithRetry(`${API}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(docForm) });
      const d = await res.json();
      if (d.success) { showToast(d.message, 'success'); setPulse(d.message); setDocForm({ ...docForm, title: '', content: '' }); await loadAll(); }
      else showToast(d.error || 'Registration failed.', 'error');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const vaultEvidence = async () => {
    if (!evForm.title.trim()) { showToast('Evidence title is required.', 'error'); return; }
    try {
      const res = await fetchWithRetry(`${API}/evidence`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evForm) });
      const d = await res.json();
      if (d.success) { showToast(d.message, 'success'); setPulse(d.message); setEvForm({ ...evForm, title: '', description: '', source_ref: '' }); await loadAll(); }
      else showToast(d.error || 'Vault registration failed.', 'error');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const runIngest = async () => {
    setIngesting(true);
    try {
      const res = await fetchWithRetry(`${API}/evidence/auto-ingest`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const d = await res.json();
      if (d.success) { showToast(`Auto-ingest: ${d.inserted} vaulted · ${d.skippedDupes} duplicates skipped`, 'success'); setPulse(`Auto-ingest vaulted ${d.inserted} records from enforcement + national scanning.`); await loadAll(); }
      else showToast(d.error || 'Ingest failed.', 'error');
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIngesting(false); }
  };

  const getInsight = async () => {
    setAiLoading(true);
    try {
      const res = await fetchWithRetry(`${API}/ai/insight`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ focus: 'overall' }) });
      const d = await res.json();
      if (d.success) setAiInsight(d.insight || 'No insight returned.');
      else showToast(d.error || 'Insight failed.', 'error');
    } catch (e: any) { showToast(e.message, 'error'); } finally { setAiLoading(false); }
  };

  const verifyEvidence = async (id: string) => {
    try {
      const res = await fetchWithRetry(`${API}/evidence/${id}/verify`, { method: 'POST' });
      const d = await res.json();
      showToast(d.message || d.error, d.success ? 'success' : 'error');
      await loadAll(); await loadLedger();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const sealEvidence = async (id: string) => {
    try {
      const res = await fetchWithRetry(`${API}/evidence/${id}/seal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sealedBy: 'regulator-officer' }) });
      const d = await res.json();
      showToast(d.message || d.error, d.success ? 'success' : 'error');
      await loadAll(); await loadLedger();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const changeDocStatus = async (id: string, status: string) => {
    try {
      const res = await fetchWithRetry(`${API}/documents/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const d = await res.json();
      showToast(d.message || d.error, d.success ? 'info' : 'error');
      await loadAll();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const statusChip = (s: string) => <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${STATUS_COLORS[s] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{String(s || '—').replace(/_/g, ' ')}</span>;

  const input = 'w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-400';
  const label = 'text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1 block';

  const tabs = [
    { id: 'documents' as const, label: '📚 Regulatory Documents Vault', icon: FileText },
    { id: 'evidence' as const, label: '🛡️ Secure Evidence Vault', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Vault className="w-5 h-5 text-indigo-600" /> Regulator Vault Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enterprise regulatory document registry + tamper-evident, hash-chained secure evidence vault. SHA-256 sealed at rest, RFC3161-style timestamps, audit-trailed.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { getInsight(); }} disabled={aiLoading} className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors">
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Insight
          </button>
          <button onClick={loadAll} className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-2xl p-4">
          <div className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-300 mb-1.5 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Vault Insight</div>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{aiInsight}</p>
        </div>
      )}

      {pulse && <div className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2">{pulse}</div>}

      <div className="flex border-b border-slate-200 dark:border-slate-800 font-medium text-sm overflow-x-auto no-scrollbar whitespace-nowrap pb-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap py-2.5 px-5 border-b-2 transition-colors cursor-pointer ${tab === t.id ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <span className="flex items-center gap-1.5"><Icon className="w-4 h-4" />{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-600" /> Register Regulatory Document</h3>
              <div className="space-y-3">
                <div><label className={label}>Title</label><input className={input} value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} placeholder="e.g. AI Act Transparency Guidelines v2" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={label}>Category</label>
                    <select className={input} value={docForm.category} onChange={e => setDocForm({ ...docForm, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className={label}>Regulation</label><input className={input} value={docForm.regulation_code} onChange={e => setDocForm({ ...docForm, regulation_code: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={label}>Country</label><input className={input} value={docForm.country} onChange={e => setDocForm({ ...docForm, country: e.target.value })} /></div>
                  <div><label className={label}>Initial Status</label>
                    <select className={input} value={docForm.status} onChange={e => setDocForm({ ...docForm, status: e.target.value })}>
                      {['PENDING_REVIEW', 'APPROVED', 'PUBLISHED'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className={label}>Content (markdown)</label><textarea rows={4} className={input} value={docForm.content} onChange={e => setDocForm({ ...docForm, content: e.target.value })} placeholder="Full regulatory text / instrument body…" /></div>
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={docForm.auto_seal} onChange={e => setDocForm({ ...docForm, auto_seal: e.target.checked })} className="accent-indigo-600" />
                  Auto-seal SHA-256 on registration (retention 10y)
                </label>
                <button onClick={registerDoc} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" /> Register & Seal Document
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" /> Registered Documents <span className="text-xs font-mono text-slate-400">({docs.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-50 dark:bg-slate-800/40">
                      <th className="px-4 py-2.5 font-semibold">ID</th><th className="px-4 py-2.5 font-semibold">Title</th><th className="px-4 py-2.5 font-semibold">Regulation</th><th className="px-4 py-2.5 font-semibold">Version</th><th className="px-4 py-2.5 font-semibold">Seal</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {docs.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[10px] text-indigo-600 font-bold">{d.id}</td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200 font-medium max-w-[200px] truncate">{d.title}</td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{d.regulation_code} · {d.country}</td>
                        <td className="px-4 py-2.5 text-slate-500">v{d.document_version}</td>
                        <td className="px-4 py-2.5">{d.sealing_hash ? <span className="flex items-center gap-1 text-[10px] font-mono text-teal-600"><Fingerprint className="w-3 h-3" />{String(d.sealing_hash).slice(0, 8)}…</span> : <span className="text-slate-400">—</span>}</td>
                        <td className="px-4 py-2.5">{statusChip(d.status)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <select value={d.status} onChange={e => changeDocStatus(d.id, e.target.value)} className="px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-[10px] text-slate-600 dark:text-slate-300 outline-none cursor-pointer">
                              {['PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={() => fetchWithRetry(`${API}/documents/${d.id}`, { method: 'GET' }).then(r => r.json()).then(r => showToast(JSON.stringify(r.document, null, 2).slice(0, 400), 'info')).catch(() => {})} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer" title="View"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {docs.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-mono text-xs">No regulatory documents registered yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'evidence' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Audit Trail Integrity</div>
              {integ ? (
                <div className="flex items-center gap-2">
                  {integ.valid
                    ? <><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="font-bold">LEDGER INTACT — {integ.totalEntries} entries</span></>
                    : <><AlertTriangle className="w-5 h-5 text-amber-400" /><span className="font-bold">INTEGRITY BREACH @ index {integ.brokenIndex}</span></>}
                </div>
              ) : <span className="text-sm text-slate-400">Verifying hash chain…</span>}
            </div>
            <button onClick={runIngest} disabled={ingesting} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
              {ingesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />} Auto-Ingest Enforcement + National Scan Evidence
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"><Fingerprint className="w-4 h-4 text-rose-600" /> Vault Evidence Record</h3>
                <div className="space-y-3">
                  <div><label className={label}>Title</label><input className={input} value={evForm.title} onChange={e => setEvForm({ ...evForm, title: e.target.value })} placeholder="e.g. AGV violation — contract clause scan" /></div>
                  <div><label className={label}>Description</label><textarea rows={2} className={input} value={evForm.description} onChange={e => setEvForm({ ...evForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={label}>Category</label>
                      <select className={input} value={evForm.category} onChange={e => setEvForm({ ...evForm, category: e.target.value })}>
                        {['TECHNICAL', 'B2G_VIOLATION', 'SCAN_FINDING', 'PENALTY_NOTICE', 'CONTRACTUAL', 'LEGAL', 'OTHER'].map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                    <div><label className={label}>Severity</label>
                      <select className={input} value={evForm.severity} onChange={e => setEvForm({ ...evForm, severity: e.target.value })}>
                        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={label}>Source</label>
                      <select className={input} value={evForm.source} onChange={e => setEvForm({ ...evForm, source: e.target.value })}>
                        {['ENFORCEMENT', 'NATIONAL_SCAN', 'NATIONAL_PENALTY', 'NATIONAL_WARNING', 'B2G_PIPELINE', 'MANUAL'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                    <div><label className={label}>Source Ref</label><input className={input} value={evForm.source_ref} onChange={e => setEvForm({ ...evForm, source_ref: e.target.value })} placeholder="case/scan id" /></div>
                  </div>
                  <div><label className={label}>Linked Case ID (optional)</label><input className={input} value={evForm.case_id} onChange={e => setEvForm({ ...evForm, case_id: e.target.value })} /></div>
                  <button onClick={vaultEvidence} className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Vault & Hash-Chain Evidence
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-rose-600" /> Hash-Chained Evidence <span className="text-xs font-mono text-slate-400">({evidence.length})</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-50 dark:bg-slate-800/40">
                        <th className="px-4 py-2.5 font-semibold">ID</th><th className="px-4 py-2.5 font-semibold">Title</th><th className="px-4 py-2.5 font-semibold">Source</th><th className="px-4 py-2.5 font-semibold">Severity</th><th className="px-4 py-2.5 font-semibold">Chain #</th><th className="px-4 py-2.5 font-semibold">Seal</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {evidence.map(ev => (
                        <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-[10px] text-rose-600 font-bold">{ev.id}</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200 font-medium max-w-[180px] truncate">{ev.title}</td>
                          <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{ev.source}{ev.source_ref ? `:${String(ev.source_ref).slice(0, 10)}` : ''}</td>
                          <td className="px-4 py-2.5">{statusChip(ev.severity)}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-300">#{ev.chain_position}</td>
                          <td className="px-4 py-2.5">{ev.rfc3161_token ? <span className="flex items-center gap-1 text-[10px] font-mono text-teal-600"><Fingerprint className="w-3 h-3" />{String(ev.rfc3161_token).slice(0, 8)}…</span> : <span className="text-slate-400">—</span>}</td>
                          <td className="px-4 py-2.5">{statusChip(ev.status)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button onClick={() => verifyEvidence(ev.id)} disabled={ev.verified === 1} title={ev.verified === 1 ? 'Already verified' : 'Cryptographically verify'} className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer disabled:opacity-40">
                                {ev.verified === 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              <button onClick={() => sealEvidence(ev.id)} title="Seal RFC3161" className="p-1 text-slate-400 hover:text-teal-600 cursor-pointer"><Fingerprint className="w-4 h-4" /></button>
                              <button onClick={() => fetchWithRetry(`${API}/evidence/${ev.id}`).then(r => r.json()).then(r => showToast(JSON.stringify(r.evidence, null, 2).slice(0, 400), 'info')).catch(() => {})} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer" title="Inspect"><Copy className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {evidence.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 font-mono text-xs">No evidence vaulted yet — register manually or run auto-ingest.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-slate-500" /> VaultAuditor Ledger (recent) <span className="text-xs font-mono text-slate-400">({ledger.length})</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-50 dark:bg-slate-800/40">
                        <th className="px-4 py-2.5 font-semibold">Operation</th><th className="px-4 py-2.5 font-semibold">Vault</th><th className="px-4 py-2.5 font-semibold">Record</th><th className="px-4 py-2.5 font-semibold">Actor</th><th className="px-4 py-2.5 font-semibold">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {ledger.slice(0, 12).map((l, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-2 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200">{l.operation}</td>
                          <td className="px-4 py-2 font-mono text-[10px] text-slate-500">{l.vaultId || l.resource || '—'}</td>
                          <td className="px-4 py-2 font-mono text-[10px] text-slate-500">{String(l.recordId || l.refId || '').slice(0, 24) || '—'}</td>
                          <td className="px-4 py-2 font-mono text-[10px] text-slate-500">{String(l.actorId || l.actor || '—').slice(0, 24)}</td>
                          <td className="px-4 py-2 font-mono text-[10px] text-slate-400">{String(l.timestamp || l.createdAt || '').slice(0, 19)}</td>
                        </tr>
                      ))}
                      {ledger.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-mono text-xs">Vault auditor has not recorded operations yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatorVaultHub;