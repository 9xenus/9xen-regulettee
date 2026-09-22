import React, { useEffect, useState } from 'react';
import { UserCheck, Building2, FileSearch, ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

type Mode = 'person' | 'company' | 'document';
type VerStatus = 'PASS' | 'REVIEW' | 'FAIL';

const RESULT_STYLE: Record<string, string> = {
  'pass': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'verified': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'review': 'bg-amber-100 text-amber-700 border-amber-200',
  'rejected': 'bg-rose-100 text-rose-700 border-rose-200',
  'fail': 'bg-rose-100 text-rose-700 border-rose-200',
};

export const EnterpriseVerificationHub: React.FC = () => {
  const [mode, setMode] = useState<Mode>('person');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const [person, setPerson] = useState({ fullName: '', country: 'DE', documentFile: '', mime: 'image/png' });
  const [company, setCompany] = useState({ entityId: '', legalName: '', registrationNumber: '', country: 'DE' });
  const [doc, setDoc] = useState({ fileName: 'Certificate_of_Incorporation.pdf', mime: 'application/pdf', entityId: '', docType: 'Certificate_of_Incorporation' });

  const loadRecent = async () => {
    try { const r = await fetchWithRetry('/api/v1/enterprise-network/verifications'); const d = await r.json(); if (d?.success) setRecent(d.verifications || []); } catch { /* ignore */ }
  };
  useEffect(() => { loadRecent(); }, []);

  const run = async () => {
    let path = ''; let body: any = {};
    if (mode === 'person') { if (!person.fullName) return; path = '/verify/person'; body = person; }
    if (mode === 'company') { if (!company.legalName && !company.entityId) return; path = '/verify/company'; body = company; }
    if (mode === 'document') { path = '/verify/document'; body = doc; }
    setBusy(true); setResult(null);
    try {
      const r = await fetchWithRetry(`/api/v1/enterprise-network${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!d?.success) { setResult({ error: d?.error || 'Verification failed' }); }
      else setResult(d);
      loadRecent();
    } catch (e: any) { setResult({ error: e.message }); } finally { setBusy(false); }
  };

  const MODES: { id: Mode; label: string; icon: any }[] = [
    { id: 'person', label: 'AI Person Verification', icon: UserCheck },
    { id: 'company', label: 'AI Company Verification', icon: Building2 },
    { id: 'document', label: 'Document Forensics', icon: FileSearch },
  ];

  const verdict = result && (result.result === 'pass' || result.verificationStatus === 'verified')
    ? 'PASS' : result && (result.result === 'fail' || result.verificationStatus === 'rejected')
      ? 'FAIL' : result && result.result === 'review' ? 'REVIEW' : result?.error ? 'FAIL' : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><ShieldCheck className="w-5 h-5" /></div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">AI Person · Company · Document Verification</h3>
          <p className="text-[11px] text-slate-500">Sanctions/PEP screening, KYB registry checks, and document forensics with AI risk scoring.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${mode === m.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
            <m.icon className="w-3.5 h-3.5" /> {m.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          {mode === 'person' && (
            <>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Subject identity</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block sm:col-span-2"><span className="text-[10px] font-bold text-slate-500 block mb-1">Full name *</span><input value={person.fullName} onChange={e => setPerson({ ...person, fullName: e.target.value })} placeholder="Klaus Behrens" className="input" /></label>
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Nationality / country</span><input value={person.country} onChange={e => setPerson({ ...person, country: e.target.value.toUpperCase() })} className="input" /></label>
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Identity document file</span><input value={person.documentFile} onChange={e => setPerson({ ...person, documentFile: e.target.value })} placeholder="passport_front.png" className="input" /></label>
              </div>
            </>
          )}
          {mode === 'company' && (
            <>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Registered company</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Legal name</span><input value={company.legalName} onChange={e => setCompany({ ...company, legalName: e.target.value })} placeholder="Rheinwerk Industrial AG" className="input" /></label>
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Registration number</span><input value={company.registrationNumber} onChange={e => setCompany({ ...company, registrationNumber: e.target.value })} placeholder="HRB 145209 B" className="input" /></label>
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Jurisdiction</span><input value={company.country} onChange={e => setCompany({ ...company, country: e.target.value.toUpperCase() })} className="input" /></label>
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Registry entity ID (optional)</span><input value={company.entityId} onChange={e => setCompany({ ...company, entityId: e.target.value })} placeholder="ent_003" className="input" /></label>
              </div>
            </>
          )}
          {mode === 'document' && (
            <>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Evidence document</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">File name *</span><input value={doc.fileName} onChange={e => setDoc({ ...doc, fileName: e.target.value })} className="input" /></label>
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">MIME type</span>
                  <select value={doc.mime} onChange={e => setDoc({ ...doc, mime: e.target.value })} className="input"><option value="application/pdf">application/pdf</option><option value="image/png">image/png</option><option value="image/jpeg">image/jpeg</option></select>
                </label>
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Doc type</span>
                  <select value={doc.docType} onChange={e => setDoc({ ...doc, docType: e.target.value })} className="input">
                    <option>Certificate_of_Incorporation</option><option>Passport</option><option>National_ID</option><option>Articles_of_Association</option><option>Bank_Statement</option>
                  </select>
                </label>
                <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Registry entity ID (optional)</span><input value={doc.entityId} onChange={e => setDoc({ ...doc, entityId: e.target.value })} placeholder="ent_002" className="input" /></label>
              </div>
            </>
          )}
          <button onClick={run} disabled={busy} className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer">
            {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} {busy ? 'Running AI checks…' : 'Run AI Verification'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">AI verdict</div>
          {!result && <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-2xl">Submit a verification to see the AI risk verdict.</div>}
          {result?.error && <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 font-bold">{result.error}</div>}
          {result && !result.error && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900">Verification</span>
                  <span className="text-[10px] font-mono text-slate-400">#{result.verificationId || result.documentId}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${verdict === 'PASS' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : verdict === 'REVIEW' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-rose-100 text-rose-700 border-rose-300'}`}>
                  {verdict || ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Risk score</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${result.riskScore > 70 ? 'bg-rose-500' : result.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, result.riskScore || 0)}%` }} />
                </div>
                <span className="text-sm font-black text-slate-800">{result.riskScore}</span>
              </div>

              {mode === 'person' && result.match && (
                <>
                  <BadgeRow label="Sanctions screening" flag={result.match.sanctionsMatch} passText="No negative match" failText="Sanctions match detected" />
                  <BadgeRow label="PEP flag" flag={result.match.pepFlag} passText="Not a PEP" failText="PEP exposure" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 mb-1">Document forensics</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <MiniStat label="Confidence" value={`${Math.round((result.match.di?.confidenceScore || result.riskScore) || 0)}%`} />
                      <MiniStat label="Authentic" value={result.match.di?.isAuthentic ? 'YES' : 'NO'} color={result.match.di?.isAuthentic ? 'text-emerald-600' : 'text-rose-600'} />
                      <MiniStat label="Format" value={result.match.di?.mime || '—'} />
                    </div>
                  </div>
                </>
              )}
              {mode === 'company' && result.checks && (
                <>
                  <BadgeRow label="Registry lookup" flag={!result.checks.registryOk} passText="Registry details valid" failText="Registry check failed" />
                  <BadgeRow label="Sanctions & watchlist" flag={result.checks.sanctionsHit} passText="No sanctions hit" failText="Sanctions hit" />
                  <BadgeRow label="Adverse media" flag={result.checks.adverseMedia} passText="No adverse media" failText="Adverse media flagged" />
                </>
              )}
              {mode === 'document' && result.forensics && (
                <>
                  <BadgeRow label="Physical authenticity" flag={!result.forensics.isAuthentic} passText="Document passes physical checks" failText="Document rejected" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 mb-1">Forensics signals</div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <MiniStat label="Confidence" value={`${Math.round(result.forensics.confidenceScore || 0)}%`} />
                      <MiniStat label="Checks" value={`${(result.forensics.checklist || []).length}`} />
                    </div>
                  </div>
                </>
              )}
              </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider mb-2"><RefreshCw className="w-3.5 h-3.5" /> Recent verification activity</div>
        <div className="space-y-1.5">
          {recent.length === 0 && <div className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-2xl">No verification activity yet.</div>}
          {recent.slice(0, 12).map(v => (
            <div key={v.id} className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500`}>{v.scope}</span>
                <span className="font-bold text-slate-800">{v.person_id || v.entity_id || v.doc_type || '—'}</span>
                <span className="text-slate-400">{v.provider || v.verified_by}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${RESULT_STYLE[v.result] || RESULT_STYLE.review}`}>{v.result}</span>
                {v.risk_score != null && <span className="text-slate-400">risk {v.risk_score}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`.input{width:100%;padding:.55rem .75rem;border-radius:.75rem;border:1px solid #e2e8f0;font-size:.8125rem;color:#1e293b;background:#fff;outline:none}.input:focus{box-shadow:0 0 0 2px #c7d2fe;border-color:#818cf8}`}</style>
    </div>
  );
};

const BadgeRow: React.FC<{ label: string; flag: boolean; passText: string; failText: string }> = ({ label, flag, passText, failText }) => (
  <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
    <span className="text-xs text-slate-600">{label}</span>
    <span className={`flex items-center gap-1.5 text-xs font-bold ${flag ? 'text-rose-600' : 'text-emerald-600'}`}>
      {flag ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
      {flag ? failText : passText}
    </span>
  </div>
);

const MiniStat: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 py-2">
    <div className={`text-sm font-black ${color || 'text-slate-800'}`}>{value}</div>
    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
  </div>
);

export default EnterpriseVerificationHub;