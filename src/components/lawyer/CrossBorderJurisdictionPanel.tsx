import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Globe2, MapPin, ShieldCheck, Sparkles, ChevronRight, RefreshCw, Landmark, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

const ACT_INFO: Record<string, { title: string; obligations: string[] }> = {
  GDPR: { title: 'General Data Protection Regulation', obligations: ['Data minimization', 'Lawful processing basis', 'DSAR handling (Art.15–22)', 'DPIA for high-risk processing'] },
  EU_AI_ACT: { title: 'EU AI Act', obligations: ['High-risk registration', 'Art.50 transparency', 'Bias & robustness monitoring'] },
  DSA: { title: 'Digital Services Act', obligations: ['Systemic risk assessment', 'Transparency reporting', 'Notice-and-action'] },
  DMA: { title: 'Digital Markets Act', obligations: ['Gatekeeper compliance', 'Fair-ranking', 'No self-preferencing'] },
  DORA: { title: 'Digital Operational Resilience Act', obligations: ['ICT risk management', '24h major-incident reporting', 'Resilience testing'] },
  NIS2: { title: 'NIS2 Directive', obligations: ['Entity classification', 'Risk-management measures', 'CSIRT notification'] },
  CSRD: { title: 'CSRD & ESG Reporting', obligations: ['ESRS-aligned reporting', 'Double materiality', 'Assurance'] },
  CCPA: { title: 'California Consumer Privacy Act', obligations: ['Opt-out of sale/sharing', 'Right to delete', 'Service-provider contracts'] },
  LGPD: { title: 'Brazilian LGPD', obligations: ['Legal basis (Art.7)', 'DPO appointment', 'ANPD breach notification'] },
  DPDP: { title: 'India DPDP Act 2023', obligations: ['Consent-manager flows', 'Fiduciary obligations', 'Breach reporting'] },
  PIPEDA: { title: 'Canada PIPEDA / Quebec 25', obligations: ['Meaningful consent', 'Privacy-by-default', 'Transfer safeguards'] },
  UK_GDPR: { title: 'UK GDPR + DPA 2018', obligations: ['ICO accountability', 'Transfer safeguards', 'DPO liaison'] },
};

const fallback = (code: string) => code.replace(/_/g, ' ');

export const CrossBorderJurisdictionPanel: React.FC<{
  ownerType?: string;
  ownerId?: string;
  title?: string;
  showSolutions?: boolean;
}> = ({ ownerType = 'client', ownerId = 'org_1', title = 'Cross-Border Jurisdiction & Compliance Acts', showSolutions = true }) => {
  const [country, setCountry] = useState('');
  const [regionActs, setRegionActs] = useState<string[]>([]);
  const [countryActs, setCountryActs] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [applied, setApplied] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000); };

  const guessCountry = () => {
    try {
      const lang = navigator.language || '';
      const cc = (lang.split('-')[1] || '').toUpperCase();
      if (cc && cc.length === 2) return cc;
    } catch { /* noop */ }
    return 'DE';
  };

  const loadCatalog = async () => {
    try {
      const res = await fetchWithRetry('/api/v1/jurisdiction/acts');
      const d = await res.json();
      if (d.success) {
        setRegions(d.regions || []);
        setCountries(d.countries || []);
      }
    } catch { /* offline */ }
  };

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetchWithRetry(`/api/v1/jurisdiction/${ownerType}/${ownerId}`);
      const d = await res.json();
      if (d.success && d.jurisdiction) {
        setProfile(d.jurisdiction);
        setCountry((d.jurisdiction.countryCode) || guessCountry());
        setRegionActs(d.jurisdiction.regionActs || []);
        setCountryActs(d.jurisdiction.countryActs || []);
        setApplied(d.jurisdiction.appliedActs || []);
      } else {
        resolve();
      }
    } catch { resolve(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerType, ownerId]);

  useEffect(() => {
    loadCatalog();
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!showSolutions || !ownerId) return;
    fetchWithRetry(`/api/v1/lawyer/clients/${ownerId}/solutions`).then(r => r.json()).then(d => {
      if (d.success) setSolutions(d.solutions || []);
    }).catch(() => {});
  }, [ownerId, showSolutions, profile?.detectedAt]);

  const resolve = async (preset?: string) => {
    setLoading(true);
    try {
      const cc = preset || country || guessCountry();
      const res = await fetchWithRetry('/api/v1/jurisdiction/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerType, ownerId, country: cc }),
      });
      const d = await res.json();
      if (d.success && d.jurisdiction) {
        setProfile(d.jurisdiction);
        setCountry(d.jurisdiction.countryCode);
        setRegionActs(d.jurisdiction.regionActs || []);
        setCountryActs(d.jurisdiction.countryActs || []);
        setApplied(d.jurisdiction.appliedActs || []);
        notify(`Location auto-detected → ${d.jurisdiction.countryName} (${d.jurisdiction.region}). ${(d.jurisdiction.appliedActs || []).length} applicable acts mapped.`);
      } else {
        notify(d.error || 'Unable to resolve jurisdiction.');
      }
    } catch {
      notify('Unable to reach jurisdiction engine.');
    } finally {
      setLoading(false);
    }
  };

  const toggleApplied = (act: string) => {
    setApplied(prev => prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetchWithRetry('/api/v1/jurisdiction/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerType, ownerId, country, source: 'manual-save' }),
      });
      const d = await res.json();
      if (d.success) {
        notify('Jurisdiction profile committed. Acts auto-applied across your compliance ledger.');
      }
    } catch {
      notify('Save failed — jurisdiction engine unreachable.');
    } finally {
      setSaving(false);
    }
  };

  const allActs = [...new Set([...regionActs, ...countryActs])];
  const appliedSet = new Set(applied);

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 border ${toast.startsWith('Unable') || toast.includes('failed') ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-900 text-emerald-300 border-slate-800'}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {toast}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Globe2 className="w-5 h-5 text-indigo-600" /> {title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Auto-detects your operating region and implements the applicable regional + national compliance laws & acts.
            </p>
          </div>
          <button onClick={() => resolve()} disabled={loading} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Auto-Detect
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> Operating Country</div>
            <div className="flex gap-2">
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. DE, FR, US, SG"
              />
              <button onClick={() => resolve()} className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100" title="Resolve">OK</button>
            </div>
            {profile && (
              <div className="mt-2 text-xs font-semibold text-slate-700">
                {profile.countryName} · <span className="text-indigo-600">{profile.region}</span>
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1"><Landmark className="w-3.5 h-3.5 text-indigo-500" /> Local Law Basis</div>
            <div className="text-sm font-bold text-slate-800 line-clamp-2">{profile?.localLaw || 'GDPR (supranational default)'}</div>
            <div className="text-[10px] text-slate-400 mt-1">Auto-imported with region acts</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Applicable Acts</div>
            <div className="text-2xl font-black text-slate-800">{allActs.length}</div>
            <div className="text-[10px] text-slate-400 mt-1">{applied.length} applied · {regionActs.length} regional · {countryActs.length} national</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Auto-Implemented Law / Act Stack</h4>
            <button onClick={saveProfile} disabled={saving} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50">
              {saving ? 'Committing...' : 'Commit to My Compliance Ledger'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {allActs.map((act) => {
              const info = ACT_INFO[act] || { title: fallback(act), obligations: ['Maintain compliant processing records', 'Respond to authority inquiries promptly'] };
              const active = appliedSet.has(act);
              return (
                <button
                  key={act}
                  onClick={() => toggleApplied(act)}
                  className={`text-left p-3 rounded-xl border transition-all ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black tracking-wider">{act}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{active ? 'Applied' : 'Mapped'}</span>
                  </div>
                  <div className={`text-xs font-bold mt-0.5 ${active ? 'text-white' : 'text-slate-800'}`}>{info.title}</div>
                  <ul className={`mt-1.5 text-[10px] space-y-0.5 ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {info.obligations.slice(0, 3).map((o, i) => <li key={i} className="flex items-start gap-1"><ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />{o}</li>)}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showSolutions && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Partner Counsel Solutions (Auto-Integrated)</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{solutions.length} docket{solutions.length === 1 ? '' : 's'}</span>
          </div>
          {solutions.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No counsel solutions provisioned yet. Your lawyer/consultant can generate law/act solutions that appear here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {solutions.map((s: any) => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-800">{s.title}</div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${s.status === 'PROVISIONED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{s.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(s.appliedActs || []).map((a: string) => <span key={a} className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">{a}</span>)}
                  </div>
                  {(s.directives || []).length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> {s.directives.length} compliance task(s) auto-dispatched to this dashboard
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CrossBorderJurisdictionPanel;