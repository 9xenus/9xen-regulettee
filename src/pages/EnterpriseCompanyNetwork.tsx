import React, { useEffect, useState } from 'react';
import { Building2, Search, Globe2, TrendingUp, ShieldCheck, Layers, Users, Link2, ChevronDown, RefreshCw, Filter } from 'lucide-react';
import { fetchWithRetry } from '../lib/api-client';

interface Company {
  id: string; legal_name: string; trade_name: string; entity_type: string; registration_number: string;
  incorporation_country: string; jurisdiction: string; industry_code: string; website: string;
  employee_count_band: string; yearly_revenue_band: string; description: string; logo_url: string;
  founding_year: number; status: string; verification_tier: string; risk_score: number; risk_tier: string;
  aiSummary: string; insight: string; recommendedTier: string; growthSignal: number; networkSimilarity: string;
}

const TIER_STYLE: Record<string, string> = {
  'enterprise': 'bg-violet-100 text-violet-700 border-violet-200',
  'enhanced': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'standard': 'bg-sky-100 text-sky-700 border-sky-200',
  'basic': 'bg-slate-100 text-slate-600 border-slate-200',
  'verified': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'in_review': 'bg-amber-100 text-amber-700 border-amber-200',
};

const RISK_STYLE: Record<string, string> = {
  'LOW': 'text-emerald-600', 'MEDIUM': 'text-amber-600', 'HIGH': 'text-rose-600', 'CRITICAL': 'text-rose-700',
};

export const EnterpriseCompanyNetwork: React.FC<{ onNavigate?: (path: string) => void }> = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [jur, setJur] = useState("ALL");
  const [risk, setRisk] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(); if (q) qs.set('q', q); if (jur !== 'ALL') qs.set('jurisdiction', jur); if (risk !== 'ALL') qs.set('risk', risk);
      const [cr, pr] = await Promise.all([
        fetchWithRetry(`/api/v1/enterprise-network/companies${qs.toString() ? '?' + qs.toString() : ''}`),
        fetchWithRetry('/api/v1/enterprise-network/persons'),
      ]);
      const [cd, pd] = await Promise.all([cr.json(), pr.json()]);
      if (cd?.success) setCompanies(cd.companies || []);
      if (pd?.success) setPersons(pd.persons || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [q, jur, risk]);

  const openDetail = async (id: string) => {
    if (expanded === id) { setExpanded(null); setDetail(null); return; }
    setExpanded(id);
    try {
      const r = await fetchWithRetry(`/api/v1/enterprise-network/companies/${id}`);
      const d = await r.json();
      setDetail(d?.success ? d.company : null);
    } catch { setDetail(null); }
  };

  const jurs = Array.from(new Set(companies.map(c => c.jurisdiction))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Building2 className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">AI-Operated Enterprise Company Network</h3>
            <p className="text-[11px] text-slate-500">LinkedIn-style KYB company directory with live AI profiling, tiering, and cross-border network intelligence.</p>
          </div>
        </div>
        <button onClick={load} className="text-[11px] font-mono text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> REFRESH</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies by name, trade name, NACE code…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
        <select value={jur} onChange={(e) => setJur(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
          <option value="ALL">All jurisdictions</option>
          {jurs.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
        <select value={risk} onChange={(e) => setRisk(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
          <option value="ALL">All risk tiers</option><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400 flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Scanning company registry…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {companies.map(c => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-4 space-y-2.5">
                <div className="flex items-start gap-3">
                  {c.logo_url
                    ? <img src={c.logo_url} alt="" className="w-11 h-11 rounded-xl border border-slate-100 object-cover bg-slate-50" onError={(e) => {(e.target as HTMLImageElement).style.display = 'none';}} />
                    : <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Building2 className="w-5 h-5" /></div>}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 truncate">{c.legal_name}</span>
                      {c.trade_name && c.trade_name !== c.legal_name && <span className="text-[11px] text-slate-400">{c.trade_name}</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono mt-0.5">
                      <span className="bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{c.entity_type}</span>
                      <span className="bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">#{c.industry_code}</span>
                      <span className={`px-1.5 py-0.5 rounded border ${TIER_STYLE[c.verification_tier] || TIER_STYLE.basic}`}>{c.verification_tier}</span>
                      <span className={`px-1.5 py-0.5 rounded border ${TIER_STYLE[c.status] || TIER_STYLE.basic}`}>{c.status}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-black ${RISK_STYLE[c.risk_tier] || ''}`}>{c.risk_tier} · {c.risk_score}</span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" />{c.incorporation_country} ({c.jurisdiction}) · est. {c.founding_year}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.employee_count_band} emp</span>
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{c.yearly_revenue_band} rev</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{c.aiSummary}</p>

                <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 px-3 py-2 text-xs text-indigo-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">AI Insight: </span>{c.insight}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> growth {c.growthSignal}%</span>
                  <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{c.networkSimilarity}</span>
                </div>

                <button onClick={() => openDetail(c.id)} className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-100 rounded-xl py-2 cursor-pointer">
                  {expanded === c.id ? 'Hide profile' : 'Open AI company profile'} <ChevronDown className={`w-3.5 h-3.5 ${expanded === c.id ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expanded === c.id && detail && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3 text-xs">
                  <div><span className="font-black text-slate-500 text-[10px] uppercase tracking-wider">Profile / KYB</span></div>
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
                    <div><span className="text-slate-400">Registration:</span> {detail.registration_number}</div>
                    <div><span className="text-slate-400">Website:</span> {detail.website || '—'}</div>
                    <div><span className="text-slate-400">Recommended tier:</span> <span className="font-bold">{detail.recommendedTier}</span></div>
                    <div><span className="text-slate-400">Legal name:</span> {detail.legal_name}</div>
                  </div>
                  <div className="text-slate-600 leading-relaxed">{detail.description}</div>
                  <div>
                    <div className="font-black text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">Subsidiaries</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(detail.subsidiaries || []).length === 0 ? <span className="text-slate-400">None registered.</span> : detail.subsidiaries.map((s: string) => <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px]">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <div className="font-black text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">Management & UBOs ({detail.management?.length ?? 0})</div>
                    <div className="space-y-1.5">
                      {detail.management?.map((p: any) => (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{p.full_name}</span>
                            <span className="text-slate-400 ml-2">{p.role}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.is_ubo ? <span className="text-[10px] font-mono bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">UBO {p.ownership_percentage}%</span> : null}
                            <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${p.kyc_status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.kyc_status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-black text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">KYB Checks</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(detail.kybChecks || []).length === 0 ? <span className="text-slate-400">No KBY checks yet — run one from the Verification Hub.</span> : detail.kybChecks.map((k: any) => (
                        <span key={k.id} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px]"><span className="font-bold">{k.result}</span> · {k.risk_score} · {new Date(k.checked_at).toLocaleDateString()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {persons.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider mb-2"><Users className="w-3.5 h-3.5" /> Verified Management Persons</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {persons.map(p => (
              <div key={p.id} className="shrink-0 w-56 rounded-2xl border border-slate-200 bg-white p-3 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-sm">{p.full_name.split(' ').map((s: string) => s[0]).join('').slice(0, 2)}</div>
                  <div>
                    <div className="font-bold text-slate-800">{p.full_name}</div>
                    <div className="text-slate-400">{p.role}</div>
                  </div>
                </div>
                <div className="text-slate-500">{p.legal_name} · {p.jurisdiction}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${p.kyc_status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.kyc_status}</span>
                  <span className="text-[10px] font-mono text-slate-400">risk {p.risk_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1"><Filter className="w-3 h-3" /> Derived from KYB company_entities + UBO registry. AI profiling is deterministic and reviewable per profile.</div>
    </div>
  );
};

export default EnterpriseCompanyNetwork;