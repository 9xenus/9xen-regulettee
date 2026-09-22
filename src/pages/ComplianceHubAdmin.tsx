import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Zap, FileText, Bell, TrendingUp, ChevronDown, ChevronRight, CheckCircle2, XCircle, Plus, RefreshCw, BarChart3, Layers, Globe, Users, Activity, AlertTriangle, Eye, Power, PowerOff, MapPin, Building2, Scale, Search, Lock } from 'lucide-react';

const API = '/api/v1/compliance-hub';
const NRE = '/api/v1';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    INACTIVE: 'bg-gray-100 text-gray-600',
    REGISTERED: 'bg-amber-100 text-amber-800',
    DISABLED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    COMPLIANT: 'bg-emerald-100 text-emerald-800',
    AT_RISK: 'bg-amber-100 text-amber-800',
    NON_COMPLIANT: 'bg-red-100 text-red-800',
  };
  return <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const color = score >= 90 ? '#059669' : score >= 70 ? '#d97706' : '#dc2626';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${(score / 100) * 314} 314`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{grade}</span>
          <span className="text-xs text-gray-500">{score.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, badge }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean; badge?: string | number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left font-medium text-gray-800 text-sm">
        <Icon size={16} className="text-indigo-600" />
        {title}
        {badge != null && <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 px-1.5 rounded-full">{badge}</span>}
        <span className="ml-auto text-gray-400">{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
      </button>
      {open && <div className="p-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json;
}

async function nreFetch(path: string) {
  const res = await fetch(`${NRE}${path}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `NRE request failed (${res.status})`);
  return json;
}

export function ComplianceHubAdminPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);
  const [fxExposure, setFxExposure] = useState<any>(null);
  const [rulesets, setRulesets] = useState<any[]>([]);
  const [score, setScore] = useState<any>(null);
  const [changes, setChanges] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [legAlerts, setLegAlerts] = useState<any[]>([]);
  const [regulators, setRegulators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'countries' | 'rules' | 'score' | 'changes' | 'reports' | 'audit'>('overview');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryRegionFilter, setCountryRegionFilter] = useState('ALL');
  const [countryStatusFilter, setCountryStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Create Ruleset form
  const [showNewRuleset, setShowNewRuleset] = useState(false);
  const [rsName, setRsName] = useState('');
  const [rsJurisdiction, setRsJurisdiction] = useState('');
  const [rsLawAct, setRsLawAct] = useState('');
  const [rsCitation, setRsCitation] = useState('');
  const [rsAuthority, setRsAuthority] = useState('');
  const [rsRuleCode, setRsRuleCode] = useState('');
  const [rsRuleTitle, setRsRuleTitle] = useState('');
  const [rsRuleSeverity, setRsRuleSeverity] = useState('HIGH');
  const [rsRuleCond, setRsRuleCond] = useState('');
  const [rsCreating, setRsCreating] = useState(false);
  const [rsNotice, setRsNotice] = useState<string | null>(null);

  // Add Rule per ruleset
  const [addingRuleTo, setAddingRuleTo] = useState<string | null>(null);
  const [arRuleCode, setArRuleCode] = useState('');
  const [arRuleTitle, setArRuleTitle] = useState('');
  const [arSeverity, setArSeverity] = useState('HIGH');
  const [arCondition, setArCondition] = useState('');

  // Evaluate tester
  const [evalFacts, setEvalFacts] = useState('{}');
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evalEval, setEvalEval] = useState(false);

  // Register Module
  const [showNewModule, setShowNewModule] = useState(false);
  const [nmName, setNmName] = useState('');
  const [nmSlug, setNmSlug] = useState('');
  const [nmCategory, setNmCategory] = useState('');
  const [nmJurisdiction, setNmJurisdiction] = useState('');
  const [nmDesc, setNmDesc] = useState('');
  const [nmNotice, setNmNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [modRes, secRes, ruleRes, scoreRes, chgRes, tplRes, packRes, histRes, fxRes] = await Promise.all([
        apiFetch('/modules'), apiFetch('/modules/sectors'),
        apiFetch('/rules/rulesets'), apiFetch('/score'),
        apiFetch('/changes'), apiFetch('/reports/templates'), apiFetch('/sector-packs'),
        apiFetch('/score/history').catch(() => ({ data: [] })),
        nreFetch('/nre/fx/exposure').catch(() => null),
      ]);
      setModules(modRes.data); setSectors(secRes.data); setRulesets(ruleRes.data);
      setScore(scoreRes.data); setChanges(chgRes.data.changes); setTemplates(tplRes.data);
      setPacks(packRes.data || []);
      setScoreHistory(histRes.data || []);
      setFxExposure(fxRes?.data || null);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  const loadNre = useCallback(async () => {
    try {
      const [cRes, rRes, regRes] = await Promise.all([
        nreFetch('/nre/countries'), nreFetch('/nre/regions'), nreFetch('/nre/regulators')
      ]);
      const cRaw = cRes.data || cRes.countries || [];
      const rRaw = rRes.data || rRes.regions || [];
      const regRaw = regRes.data || regRes.regulators || [];
      setCountries(cRaw.map((c: any) => ({
        ...c,
        code: c.country_code || c.code,
        name: c.country_name || c.name,
        region: c.region_code || c.region_name || c.region,
        currency: c.currency_code || c.currency,
        language: c.primary_language || c.language,
        legalSystem: c.legal_system || c.legalSystem,
        active: c.is_active === undefined ? c.active : c.is_active === 1,
        regulators: c.regulator_count ?? c.active_regulator_count ?? c.regulators,
      })));
      setRegions(rRaw.map((r: any) => ({
        ...r,
        code: r.region_code || r.code,
        name: r.region_name || r.name,
        active: r.is_active === undefined ? r.active : r.is_active === 1,
        countryCount: r.total_countries ?? r.active_countries ?? r.countryCount,
      })));
      setRegulators(regRaw.map((r: any) => ({
        ...r,
        countryCode: r.country_code || r.countryCode,
        active: r.is_active === undefined ? r.active : r.is_active === 1,
      })));
    } catch (_) {}
  }, []);

  const loadAudit = useCallback(async () => {
    try {
      const [aRes, lRes] = await Promise.all([
        nreFetch('/admin/audit-trail'), nreFetch('/admin/legislative-alerts')
      ]);
      setAuditTrail((aRes.data || aRes.trail || []).map((e: any) => ({
        ...e,
        actor: e.admin_id || e.actor || e.user,
        target: e.target_id || e.resource,
        resource: e.resource || e.target_id,
        action: e.action || e.event,
        diff: e.payload_diff || e.details || null,
      })));
      setLegAlerts(lRes.data || lRes.alerts || []);
    } catch (_) {}
  }, []);

  useEffect(() => { load(); loadNre(); loadAudit(); }, [load, loadNre, loadAudit]);

  const toggleModule = async (slug: string, current: string) => {
    await apiFetch(`/modules/${slug}/${current === 'ACTIVE' ? 'deactivate' : 'activate'}`, { method: 'POST' });
    await load();
  };

  const toggleCountry = async (code: string) => {
    await nreFetch(`/nre/countries/${code}/toggle`);
    await loadNre();
  };

  const toggleRegion = async (code: string) => {
    await nreFetch(`/nre/regions/${code}/toggle`);
    await loadNre();
  };

  const toggleRegulator = async (id: string) => {
    await nreFetch(`/nre/regulators/${id}/toggle`);
    await loadNre();
  };

  const createRuleset = async () => {
    if (!rsName || !rsRuleCode || !rsRuleTitle) return;
    setRsCreating(true);
    setRsNotice(null);
    try {
      const rules = [{
        ruleCode: rsRuleCode,
        title: rsRuleTitle,
        severity: rsRuleSeverity,
        category: rsLawAct || undefined,
        triggerType: 'EVENT',
        conditionExpression: rsRuleCond ? JSON.parse(rsRuleCond) : undefined,
        description: rsRuleTitle,
      }];
      const res = await fetch(`${API}/rules/rulesets`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rsName,
          slug: rsName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          jurisdiction: rsJurisdiction,
          lawActName: rsLawAct,
          legalCitation: rsCitation,
          enforcingAuthority: rsAuthority,
          category: 'DYNAMIC',
          rules
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setRsNotice(`Created: ${json.message}`);
      setShowNewRuleset(false);
      setRsName(''); setRsJurisdiction(''); setRsLawAct(''); setRsCitation(''); setRsAuthority('');
      setRsRuleCode(''); setRsRuleTitle('');
      await load();
    } catch (err: any) {
      setRsNotice(`Error: ${err.message}`);
    } finally {
      setRsCreating(false);
    }
  };

  const addRuleTo = async (rsId: string, rulesetSlug: string) => {
    if (!arRuleCode || !arRuleTitle) return;
    try {
      const res = await fetch(`${API}/rules/rulesets/${rsId || rulesetSlug}/rules`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleCode: arRuleCode,
          title: arRuleTitle,
          severity: arSeverity,
          triggerType: 'EVENT',
          conditionExpression: arCondition ? JSON.parse(arCondition) : undefined,
          description: arRuleTitle,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setArRuleCode(''); setArRuleTitle(''); setArCondition('');
      setAddingRuleTo(null);
      await load();
    } catch (err: any) {
      alert(`Error adding rule: ${err.message}`);
    }
  };

  const runEval = async () => {
    setEvalEval(true);
    setEvalResult(null);
    try {
      let facts = {};
      try { facts = JSON.parse(evalFacts || '{}'); } catch { facts = { input: evalFacts }; }
      const res = await fetch(`${API}/rules/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facts })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setEvalResult(json);
    } catch (err: any) {
      setEvalResult({ isError: true, message: err.message });
    } finally {
      setEvalEval(false);
    }
  };

  const registerModule = async () => {
    if (!nmName || !nmSlug) return;
    setNmNotice(null);
    try {
      const res = await fetch(`${API}/modules`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: nmSlug,
          name: nmName,
          slug: nmSlug,
          version: '1.0.0',
          category: nmCategory || 'CUSTOM',
          jurisdiction: nmJurisdiction || 'GLOBAL',
          description: nmDesc,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setNmNotice(`Registered: ${json.message}`);
      setShowNewModule(false);
      setNmName(''); setNmSlug(''); setNmCategory(''); setNmJurisdiction(''); setNmDesc('');
      await load();
    } catch (err: any) {
      setNmNotice(`Error: ${err.message}`);
    }
  };

  const unacknowledgedChanges = changes.filter(c => !c.acknowledged).length;
  const activeModules = modules.filter(m => m.status === 'ACTIVE').length;
  const activeCountries = countries.filter((c: any) => c.active !== false && c.status !== 'SUSPENDED').length;
  const activeRegions = regions.filter((r: any) => r.active !== false).length;

  const filteredCountries = countries.filter((c: any) => {
    if (countrySearch) {
      const q = countrySearch.toLowerCase();
      if (!c.name?.toLowerCase().includes(q) && !c.code?.toLowerCase().includes(q)) return false;
    }
    if (countryRegionFilter !== 'ALL' && c.region !== countryRegionFilter) return false;
    if (countryStatusFilter === 'ACTIVE' && (c.active === false || c.status === 'SUSPENDED')) return false;
    if (countryStatusFilter === 'SUSPENDED' && c.active !== false && c.status !== 'SUSPENDED') return false;
    return true;
  });

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Activity },
    { id: 'modules' as const, label: 'Modules', icon: ShieldCheck },
    { id: 'countries' as const, label: 'Countries', icon: Globe },
    { id: 'rules' as const, label: 'Rules', icon: Zap },
    { id: 'score' as const, label: 'Score', icon: BarChart3 },
    { id: 'changes' as const, label: 'Changes', icon: Bell },
    { id: 'reports' as const, label: 'Reports', icon: FileText },
    { id: 'audit' as const, label: 'Audit', icon: Eye },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw className="animate-spin text-indigo-600" size={24} /><span className="ml-2 text-gray-500">Loading compliance hub...</span></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">Error: {error} <button onClick={load} className="ml-3 underline">Retry</button></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="text-indigo-600" /> Compliance Hub</h1>
        <button onClick={() => { load(); loadNre(); loadAudit(); }} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm"><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Modules', value: modules.length, sub: `${activeModules} active`, icon: ShieldCheck, color: 'indigo' },
          { label: 'Countries', value: countries.length, sub: `${activeRegions} regions`, icon: Globe, color: 'emerald' },
          { label: 'Rulesets', value: rulesets.length, sub: `${packs.length} packs`, icon: Zap, color: 'violet' },
          { label: 'Changes', value: changes.length, sub: unacknowledgedChanges > 0 ? `${unacknowledgedChanges} pending` : 'all ack\'d', icon: Bell, color: unacknowledgedChanges > 0 ? 'red' : 'emerald' },
          { label: 'Compliance', value: score ? score.overallScore.toFixed(0) : '--', sub: score?.grade || 'N/A', icon: TrendingUp, color: score && score.overallScore >= 90 ? 'emerald' : score && score.overallScore >= 70 ? 'amber' : 'red' },
        ].map(s => (
          <div key={s.label} className={`p-3 bg-${s.color}-50 border border-${s.color}-100 rounded-lg`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={`text-${s.color}-600`} />
              <span className="text-xs font-medium text-gray-500 uppercase">{s.label}</span>
            </div>
            <div className="text-xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md font-medium transition ${activeTab === tab.id ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon size={14} /> {tab.label}
            {tab.id === 'changes' && unacknowledgedChanges > 0 && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full" />}
            {tab.id === 'audit' && legAlerts.length > 0 && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1 rounded">{legAlerts.length}</span>}
          </button>
        ))}
      </div>

      {/* ======================== OVERVIEW ======================== */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {score && (
            <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-indigo-50 to-white rounded-lg border border-indigo-100">
              <ScoreGauge score={score.overallScore} grade={score.grade} />
              <div>
                <h2 className="font-semibold text-gray-800">Overall Compliance Score</h2>
                <p className="text-sm text-gray-500">{score.activeFrameworks} active framework{score.activeFrameworks !== 1 ? 's' : ''}</p>
                <StatusBadge status={score.status} />
              </div>
              <div className="ml-auto text-right text-xs text-gray-500">
                <div>Last evaluated: {new Date(score.evaluatedAt).toLocaleString()}</div>
                <div className="font-mono mt-1">{score.integrityHash?.slice(0, 24)}...</div>
              </div>
            </div>
          )}

          {/* Analytics & Live Score Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CollapsibleSection title="Score Trend (live)" icon={TrendingUp} badge={scoreHistory.length}>
              {scoreHistory.length > 1 ? (
                <div className="flex items-end gap-1 h-24">
                  {scoreHistory.slice(-20).map((h: any, i: number, arr: any[]) => {
                    const v = h.overallScore ?? h.score ?? 0;
                    const height = Math.max(4, (v / 100) * 100 - 8);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="w-full rounded-t" style={{ height, backgroundColor: v >= 90 ? '#059669' : v >= 70 ? '#d97706' : '#dc2626' }} />
                        <div className="hidden group-hover:block absolute bottom-full mb-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap">{v.toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-xs">Not enough history yet. Evaluate score on the Score tab to build a trend.</p>
              )}
              <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                <span>{scoreHistory.length ? new Date(scoreHistory[0].evaluatedAt).toLocaleDateString() : '--'}</span>
                <span>{score?.overallScore.toFixed(1)} now</span>
                <span>{scoreHistory.length ? new Date(scoreHistory[scoreHistory.length - 1].evaluatedAt).toLocaleDateString() : '--'}</span>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Framework Breakdown" icon={BarChart3} badge={score?.frameworks?.length || 0}>
              <div className="space-y-2.5">
                {score?.frameworks?.map((f: any) => (
                  <div key={f.code}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{f.code}</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-gray-500">{f.overallScore.toFixed(1)}</span>
                        <StatusBadge status={f.status} />
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${f.overallScore}%`, backgroundColor: f.overallScore >= 90 ? '#059669' : f.overallScore >= 70 ? '#d97706' : '#dc2626' }} />
                    </div>
                  </div>
                ))}
                {(!score?.frameworks || score.frameworks.length === 0) && <p className="text-gray-400 text-xs">No frameworks evaluated.</p>}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Module Status" icon={ShieldCheck} badge={modules.length}>
              <div className="flex flex-wrap gap-1.5">
                {['ACTIVE', 'INACTIVE', 'REGISTERED', 'DISABLED'].map(s => {
                  const count = modules.filter((m: any) => m.status === s).length;
                  const pct = modules.length ? Math.round((count / modules.length) * 100) : 0;
                  return (
                    <div key={s} className="flex-1 min-w-[90px] p-2 rounded bg-gray-50 border border-gray-100">
                      <div className="text-lg font-bold text-gray-800">{count}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-medium">{s}</div>
                      <div className="text-[10px] text-gray-400">{pct}%</div>
                    </div>
                  );
                })}
              </div>
              {fxExposure && (
                <div className="mt-3 p-2 rounded border border-amber-100 bg-amber-50">
                  <div className="text-[10px] text-amber-700 uppercase font-semibold">Global FX Penalty Exposure</div>
                  <div className="text-xl font-bold text-amber-800 mt-0.5">
                    ${typeof fxExposure === 'number' ? fxExposure.toLocaleString() : (fxExposure.totalExposureUsd?.toLocaleString() ?? '--')}
                  </div>
                  {typeof fxExposure === 'object' && fxExposure.countries && <div className="text-[10px] text-amber-600">{fxExposure.countries} jurisdictions flagged</div>}
                </div>
              )}
            </CollapsibleSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CollapsibleSection title="Country Distribution by Region" icon={Globe}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {regions.map((r: any) => {
                  const regionCountries = countries.filter((c: any) => c.region === r.code || c.region === r.name);
                  return (
                    <div key={r.code || r.name} className="p-2 rounded bg-gray-50 border border-gray-100">
                      <div className="text-xs font-medium text-gray-600">{r.name || r.code}</div>
                      <div className="text-lg font-bold text-gray-800">{regionCountries.length}</div>
                      <div className="text-[10px] text-gray-400">{regionCountries.filter((c: any) => c.active !== false).length} active</div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Recent Regulatory Changes" icon={Bell} defaultOpen={false}>
              {changes.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.acknowledged ? 'bg-gray-300' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 truncate">{c.regulationName || c.updateType}</div>
                    <div className="text-xs text-gray-400">{c.jurisdictionCountry} · {c.effectiveDate || 'No date'}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded uppercase">{c.updateType?.replace(/_/g, ' ')}</span>
                </div>
              ))}
              {changes.length === 0 && <p className="text-gray-400 text-xs">No changes tracked.</p>}
            </CollapsibleSection>
          </div>

          <CollapsibleSection title="Sector Packs Status" icon={Layers} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {packs.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100 text-sm">
                  <span className="font-medium text-gray-700 truncate">{p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.routeRegistered ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {p.routeRegistered ? 'live' : 'down'}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* ======================== MODULES ======================== */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <CollapsibleSection title="Sector Categories" icon={ShieldCheck} badge={sectors.length}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sectors.map(s => (
                <div key={s.category} className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <div className="text-xs text-indigo-500 uppercase tracking-wide font-semibold">{s.category.replace(/_/g, ' ')}</div>
                  <div className="text-lg font-bold text-indigo-800">{s.modules} <span className="text-xs font-normal text-indigo-500">modules</span></div>
                  <div className="text-xs text-indigo-600">{s.active} active</div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
          <CollapsibleSection title={`Sector Packs (${packs.length})`} icon={Layers} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {packs.map(p => (
                <div key={p.id} className="p-3 rounded-lg bg-white border border-gray-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-gray-800 truncate">{p.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{p.version}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded">{p.moduleCount} modules</span>
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded">{p.schemaTables} tables</span>
                    <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded">{p.modelCount} models</span>
                    {p.category && <span className="px-1.5 py-0.5 bg-fuchsia-50 text-fuchsia-700 rounded">{p.category.replace(/_/g, ' ')}</span>}
                    <span className={`px-1.5 py-0.5 rounded ${p.routeRegistered ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {p.routeRegistered ? 'routes live' : 'routes missing'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 truncate font-mono">{p.id}</div>
                  <div className="mt-1 text-xs text-gray-500 italic truncate">{p.framework}</div>
                  {p.endpoints?.length > 0 && (
                    <div className="mt-1 text-[10px] text-gray-400 font-mono truncate">{p.endpoints.slice(0, 3).join(' · ')}</div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
          <div className="flex items-center justify-between">
            <button onClick={() => setShowNewModule(!showNewModule)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus size={14} /> Register Module
            </button>
            {nmNotice && <span className={`text-xs ${nmNotice.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>{nmNotice}</span>}
          </div>
          {showNewModule && (
            <CollapsibleSection title="Register New Compliance Module" icon={Plus} defaultOpen>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={nmName} onChange={e => setNmName(e.target.value)} placeholder="Module name *" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                <input value={nmSlug} onChange={e => setNmSlug(e.target.value)} placeholder="Slug (e.g. my-module) *" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                <input value={nmCategory} onChange={e => setNmCategory(e.target.value)} placeholder="Category (e.g. FINTECH)" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                <input value={nmJurisdiction} onChange={e => setNmJurisdiction(e.target.value)} placeholder="Jurisdiction (e.g. BD)" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                <input value={nmDesc} onChange={e => setNmDesc(e.target.value)} placeholder="Description" className="px-3 py-2 text-sm border border-gray-200 rounded-md md:col-span-2 focus:outline-none focus:ring-1 focus:ring-indigo-300" />
              </div>
              <button onClick={registerModule} disabled={!nmName || !nmSlug}
                className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Register Module</button>
            </CollapsibleSection>
          )}
          <div className="space-y-2">
            {modules.map(mod => (
              <div key={mod.id} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm truncate">{mod.name}</span>
                    <span className="text-xs text-gray-400">{mod.slug}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{mod.jurisdiction} · {mod.version}</div>
                  {mod.description && <div className="text-xs text-gray-400 mt-1 line-clamp-1">{mod.description}</div>}
                </div>
                <StatusBadge status={mod.status} />
                <button onClick={() => toggleModule(mod.slug, mod.status)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border ${mod.status === 'ACTIVE' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                  {mod.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================== COUNTRIES & REGIONS ======================== */}
      {activeTab === 'countries' && (
        <div className="space-y-4">
          {/* Region Summary */}
          <CollapsibleSection title="Regions" icon={MapPin} badge={regions.length}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {regions.map((r: any) => {
                const cnt = countries.filter((c: any) => c.region === r.code || c.region === r.name).length;
                const act = countries.filter((c: any) => (c.region === r.code || c.region === r.name) && c.active !== false).length;
                return (
                  <div key={r.code || r.name} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-800">{r.name || r.code}</span>
                      <button onClick={() => toggleRegion(r.code)} className={`p-1 rounded ${r.active !== false ? 'text-emerald-600 hover:bg-emerald-100' : 'text-gray-400 hover:bg-gray-100'}`}>
                        {r.active !== false ? <Power size={12} /> : <PowerOff size={12} />}
                      </button>
                    </div>
                    <div className="text-lg font-bold text-emerald-800 mt-1">{cnt} <span className="text-xs font-normal text-emerald-500">countries</span></div>
                    <div className="text-xs text-emerald-600">{act} active</div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          {/* Country Filter */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search countries..." value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
            </div>
            <select value={countryRegionFilter} onChange={e => setCountryRegionFilter(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none">
              <option value="ALL">All Regions</option>
              {regions.map((r: any) => <option key={r.code || r.name} value={r.code || r.name}>{r.name || r.code}</option>)}
            </select>
            <select value={countryStatusFilter} onChange={e => setCountryStatusFilter(e.target.value as any)}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none">
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <span className="text-xs text-gray-400">{filteredCountries.length} results</span>
          </div>

          {/* Country List */}
          <div className="space-y-1.5">
            {filteredCountries.map((c: any) => (
              <div key={c.code} className={`flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition ${c.active === false || c.status === 'SUSPENDED' ? 'opacity-60 border-gray-100' : 'border-gray-200'}`}>
                <div className="text-xl w-8 text-center">{c.flag || '🏳️'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-800">{c.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{c.code}</span>
                    {c.region && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">{c.region}</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {c.currency && <span>Currency: {c.currency}</span>}
                    {c.language && <span> · Lang: {c.language}</span>}
                    {c.legalSystem && <span> · {c.legalSystem.replace(/_/g, ' ')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.regulators && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">{c.regulators} regulator{c.regulators !== 1 ? 's' : ''}</span>}
                  <StatusBadge status={c.active === false || c.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'} />
                  <button onClick={() => toggleCountry(c.code)}
                    className={`p-1.5 rounded-md border ${c.active !== false ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                    {c.active !== false ? <PowerOff size={12} /> : <Power size={12} />}
                  </button>
                </div>
              </div>
            ))}
            {filteredCountries.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No countries match the filter.</p>}
          </div>

          {/* Regulators */}
          {regulators.length > 0 && (
            <CollapsibleSection title={`Regulators (${regulators.length})`} icon={Building2} defaultOpen={false}>
              <div className="space-y-1.5">
                {regulators.map((reg: any) => (
                  <div key={reg.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{reg.name}</span>
                      {reg.countryCode && <span className="text-xs text-gray-400 ml-2">{reg.countryCode}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={reg.active !== false ? 'ACTIVE' : 'INACTIVE'} />
                      <button onClick={() => toggleRegulator(reg.id)} className="text-xs text-indigo-600 hover:underline">toggle</button>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}

      {/* ======================== RULES ======================== */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          {/* Create Ruleset */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNewRuleset(!showNewRuleset)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Plus size={14} /> New Ruleset
              </button>
            </div>
            {rsNotice && <span className={`text-xs ${rsNotice.startsWith('Error') ? 'text-red-600' : 'text-emerald-600'}`}>{rsNotice}</span>}
          </div>
          {showNewRuleset && (
            <CollapsibleSection title="Create Ruleset (with first rule)" icon={Plus} defaultOpen>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={rsName} onChange={e => setRsName(e.target.value)} placeholder="Ruleset name *" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                <input value={rsJurisdiction} onChange={e => setRsJurisdiction(e.target.value)} placeholder="Jurisdiction (e.g. BD, EU, US)" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                <input value={rsLawAct} onChange={e => setRsLawAct(e.target.value)} placeholder="Law / Act name (e.g. BD Data Protection Act)" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                <input value={rsCitation} onChange={e => setRsCitation(e.target.value)} placeholder="Legal citation" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                <input value={rsAuthority} onChange={e => setRsAuthority(e.target.value)} placeholder="Enforcing authority" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">First Rule</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={rsRuleCode} onChange={e => setRsRuleCode(e.target.value)} placeholder="Rule code (e.g. DP-7-day-breach) *" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                  <input value={rsRuleTitle} onChange={e => setRsRuleTitle(e.target.value)} placeholder="Rule title *" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                  <select value={rsRuleSeverity} onChange={e => setRsRuleSeverity(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md">
                    <option value="CRITICAL">CRITICAL</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
                  </select>
                  <input value={rsRuleCond} onChange={e => setRsRuleCond(e.target.value)} placeholder='Condition JSON (e.g. {"all":[{"fact":"daysSinceBreach","operator":"greaterThan","value":2}]})' className="px-3 py-2 text-sm font-mono border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                </div>
              </div>
              <button onClick={createRuleset} disabled={rsCreating || !rsName || !rsRuleCode || !rsRuleTitle}
                className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {rsCreating ? 'Creating...' : 'Create Ruleset'}
              </button>
            </CollapsibleSection>
          )}

          {/* Rule Evaluate Tester */}
          <CollapsibleSection title="Evaluate Facts Against Active Rules" icon={Zap} defaultOpen={false}>
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <textarea value={evalFacts} onChange={e => setEvalFacts(e.target.value)} rows={2} placeholder='e.g. {"daysSinceBreach":5,"transactionAmount":120000}'
                className="flex-1 w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-300" />
              <button onClick={runEval} disabled={evalEval} className="shrink-0 px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50">
                {evalEval ? 'Evaluating...' : 'Evaluate'}
              </button>
            </div>
            {evalResult && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                {evalResult.isError ? (
                  <span className="text-red-600">{evalResult.message}</span>
                ) : (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Result: {evalResult.ruleCount ?? 0} rule(s) matched of {evalResult.evaluatedRules ?? 0}</div>
                    {Array.isArray(evalResult.results) && evalResult.results.length > 0 ? (
                      <div className="space-y-1.5 mt-2">
                        {evalResult.results.map((r: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-white p-2 rounded border border-amber-200">
                            <span className="font-mono text-amber-700">{r.ruleCode}</span>
                            <span className="flex-1 text-gray-600">{r.title}</span>
                            <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded uppercase text-[10px] font-semibold">{r.severity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-600">No violations detected — {evalResult.summary || ''}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </CollapsibleSection>

          {/* Rulesets with Add-Rule */}
          {rulesets.map(rs => (
            <CollapsibleSection key={rs.id} title={`${rs.name} (${rs.rules.length} rule${rs.rules.length !== 1 ? 's' : ''})`} icon={Zap} defaultOpen={false} badge={rs.jurisdiction}>
              <div className="space-y-2 text-xs text-gray-500 mb-3">
                {rs.jurisdiction && <span>Jurisdiction: {rs.jurisdiction}</span>}
                {rs.lawActName && <span> · Law: {rs.lawActName}</span>}
                {rs.legalCitation && <span> · ({rs.legalCitation})</span>}
                {rs.enforcingAuthority && <span> · Authority: {rs.enforcingAuthority}</span>}
                {rs.maxStatutoryFine && <span> · Max Fine: {rs.maxStatutoryFine}</span>}
                <div className="flex items-center justify-between mt-1">
                  <button onClick={() => { setAddingRuleTo(addingRuleTo === rs.id ? null : rs.id); setArRuleCode(''); setArRuleTitle(''); setArCondition(''); }}
                    className="text-xs text-indigo-600 hover:underline font-medium">+ Add Rule</button>
                </div>
              </div>
              {addingRuleTo === rs.id && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={arRuleCode} onChange={e => setArRuleCode(e.target.value)} placeholder="Rule code *" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none" />
                  <input value={arRuleTitle} onChange={e => setArRuleTitle(e.target.value)} placeholder="Rule title *" className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none" />
                  <select value={arSeverity} onChange={e => setArSeverity(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-md">
                    <option value="CRITICAL">CRITICAL</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
                  </select>
                  <input value={arCondition} onChange={e => setArCondition(e.target.value)} placeholder="Condition JSON (optional)" className="px-3 py-2 text-sm font-mono border border-gray-200 rounded-md focus:outline-none" />
                  <button onClick={() => addRuleTo(rs.id, rs.slug)} disabled={!arRuleCode || !arRuleTitle}
                    className="px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 md:col-span-2">Add Rule</button>
                </div>
              )}
              <div className="space-y-1.5">
                {rs.rules.map((rule: any) => (
                  <div key={rule.id} className="p-2 bg-gray-50 rounded border border-gray-100 cursor-pointer hover:bg-gray-100" onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${rule.severity === 'CRITICAL' ? 'bg-red-500' : rule.severity === 'HIGH' ? 'bg-orange-500' : rule.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                      <span className="font-medium text-gray-700">{rule.ruleCode}</span>
                      <span className="text-gray-400 flex-1">{rule.title}</span>
                      <span className="text-gray-400">{rule.severity}</span>
                    </div>
                    {expandedRule === rule.id && rule.description && <div className="mt-1.5 ml-4 text-gray-500 leading-relaxed">{rule.description}</div>}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          ))}
          {rulesets.length === 0 && <p className="text-gray-400 text-sm">No rulesets configured.</p>}
        </div>
      )}

      {/* ======================== SCORE ======================== */}
      {activeTab === 'score' && score && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ScoreGauge score={score.overallScore} grade={score.grade} />
            <div className="text-sm text-gray-600">Last evaluated: {new Date(score.evaluatedAt).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr className="text-left text-gray-500 text-xs">
                <th className="px-4 py-2">Framework</th><th className="px-4 py-2 text-right">Score</th><th className="px-4 py-2">Grade</th><th className="px-4 py-2">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {score.frameworks.map((f: any) => (
                  <tr key={f.code} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-700">{f.framework}<span className="text-gray-400 ml-1 text-xs">({f.code})</span></td>
                    <td className="px-4 py-2 text-right font-mono">{f.overallScore.toFixed(1)}</td>
                    <td className="px-4 py-2 font-semibold">{f.grade}</td>
                    <td className="px-4 py-2"><StatusBadge status={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-400 font-mono">Integrity: {score.integrityHash?.slice(0, 32)}...</div>
        </div>
      )}

      {/* ======================== CHANGES ======================== */}
      {activeTab === 'changes' && (
        <div className="space-y-2">
          {changes.map(c => (
            <div key={c.id} className={`p-3 border rounded-lg flex items-start gap-3 ${c.acknowledged ? 'bg-white border-gray-200 opacity-70' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 text-sm">{c.regulationName || c.updateType}</span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded uppercase font-semibold">{c.updateType?.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-400">{c.jurisdictionCountry}</span>
                </div>
                {c.summary && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{c.summary}</p>}
                {c.effectiveDate && <p className="text-xs text-gray-400 mt-1">Effective: {c.effectiveDate}</p>}
              </div>
              {c.acknowledged ? (
                <CheckCircle2 size={16} className="text-gray-400 flex-shrink-0 mt-1" />
              ) : (
                <button onClick={async () => { await apiFetch('/changes/acknowledge', { method: 'POST', body: JSON.stringify({ updateId: c.id, acknowledgedBy: 'admin' }) }); await load(); }}
                  className="flex-shrink-0 px-2 py-1 text-xs bg-white border border-indigo-200 text-indigo-600 rounded hover:bg-indigo-50">Ack</button>
              )}
            </div>
          ))}
          {changes.length === 0 && <p className="text-gray-400 text-sm">No regulatory changes detected.</p>}
        </div>
      )}

      {/* ======================== REPORTS ======================== */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map(t => (
            <div key={t.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800 text-sm">{t.name}</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded uppercase font-semibold">{t.format}</span>
              </div>
              {t.description && <p className="text-xs text-gray-500 mt-1">{t.description}</p>}
              {t.framework && <p className="text-xs text-gray-400 mt-0.5">Framework: {t.framework}</p>}
              <button onClick={async () => { const res = await fetch(`${API}/reports/templates/${t.slug}/generate`); if (res.ok) { const blob = await res.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = res.headers.get('X-Report-Name') || `${t.slug}.json`; a.click(); } }}
                className="mt-2 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">Generate</button>
            </div>
          ))}
          {templates.length === 0 && <p className="text-gray-400 text-sm col-span-full">No report templates configured.</p>}
        </div>
      )}

      {/* ======================== AUDIT & ALERTS ======================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Legislative Alerts */}
          <CollapsibleSection title={`Legislative Alerts (${legAlerts.length})`} icon={AlertTriangle} badge={legAlerts.filter((a: any) => a.severity === 'HIGH' || a.severity === 'CRITICAL').length || undefined}>
            {legAlerts.length === 0 ? (
              <p className="text-gray-400 text-sm">No legislative alerts.</p>
            ) : (
              <div className="space-y-2">
                {legAlerts.map((alert: any, i: number) => (
                  <div key={alert.id || i} className={`p-3 rounded-lg border ${alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' : alert.severity === 'HIGH' ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">{alert.legislativeTitle || alert.directive || alert.title || alert.regulationName}</span>
                      {(alert.severity && alert.severity !== 'NORMAL' && alert.severity !== 'PENDING_REVIEW') && <StatusBadge status={alert.severity} />}
                      {(alert.severity === 'NORMAL' || alert.severity === 'PENDING_REVIEW') && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800">{alert.severity.replace(/_/g, ' ')}</span>}
                    </div>
                    {alert.directive && <p className="text-xs text-gray-600 mt-1 font-medium">{alert.directive}</p>}
                    {alert.boardActionRequired && <p className="text-xs text-gray-600 mt-1">{alert.boardActionRequired}</p>}
                    <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs text-gray-400">
                      {alert.regulatoryBody && <span>{alert.regulatoryBody}</span>}
                      {alert.statutoryReference && <span>Ref: {alert.statutoryReference}</span>}
                      {(alert.effectiveEnforcementDate || alert.effectiveDate) && <span>Effective: {alert.effectiveEnforcementDate || alert.effectiveDate}</span>}
                      {(alert.exposureScore != null) && <span className={`font-mono ${alert.exposureScore >= 70 ? 'text-red-600' : 'text-amber-600'}`}>Exposure: {alert.exposureScore}</span>}
                    </div>
                    {Array.isArray(alert.impactedArchitectures) && alert.impactedArchitectures.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {alert.impactedArchitectures.map((ia: any, idx: number) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">{ia.component}: {ia.complianceLevel}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Audit Trail */}
          <CollapsibleSection title={`Audit Trail (${auditTrail.length})`} icon={Eye} defaultOpen={false}>
            {auditTrail.length === 0 ? (
              <p className="text-gray-400 text-sm">No audit records.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr className="text-left text-gray-500 text-xs">
                    <th className="px-3 py-2">Time</th><th className="px-3 py-2">Actor</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Target</th><th className="px-3 py-2">Details</th><th className="px-3 py-2">Chain</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditTrail.map((entry: any, i: number) => (
                      <tr key={entry.id || i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '--'}</td>
                        <td className="px-3 py-2 text-xs font-medium text-gray-700">{entry.actor || entry.user || '--'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{entry.action || entry.event || '--'}</td>
                        <td className="px-3 py-2 text-xs text-gray-500 font-mono">{entry.target || entry.resource || '--'}</td>
                        <td className="px-3 py-2 text-xs text-gray-500 max-w-[240px]">
                          {entry.diff ? <span className="font-mono text-gray-500 block truncate" title={entry.diff}>{entry.diff.length > 60 ? entry.diff.slice(0, 60) + '…' : entry.diff}</span> : '--'}
                        </td>
                        <td className="px-3 py-2">
                          {entry.current_hash || entry.integrityHash ? (
                            <span className="font-mono text-[10px] text-emerald-600" title={`prev: ${entry.prev_hash || '—'}\ncur: ${entry.current_hash || ''}`}>
                              {String(entry.current_hash || entry.integrityHash).slice(0, 10)}…
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
