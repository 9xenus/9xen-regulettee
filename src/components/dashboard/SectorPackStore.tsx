import React, { useEffect, useState, useCallback } from 'react';
import {
  Package, Boxes, Cpu, Route, CheckCircle2, XCircle, RefreshCw, ShieldCheck, Star,
  ToggleLeft, ToggleRight, Search, Grid, List,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const API = '/api/v1/compliance-hub/sector-packs';

export const SectorPackStore: React.FC<{ tenantId?: string }> = ({ tenantId }) => {
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [busy, setBusy] = useState<string | null>(null);
  const { showToast } = useNotification();

  const tid = tenantId || 'org_1';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/store?tenantId=${tid}`);
      const d = await r.json();
      if (d.success) setPacks(d.data);
      else showToast(`Failed to load packs: ${d.error || ''}`, 'error');
    } catch { showToast('Pack store unavailable.', 'error'); } finally { setLoading(false); }
  }, [tid]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (pack: any) => {
    setBusy(pack.id);
    try {
      const r = await fetch(`${API}/${pack.id}/${pack.enabled ? 'disable' : 'enable'}-for-tenant`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tid })
      });
      const d = await r.json();
      if (d.success) {
        showToast(`${pack.name} ${pack.enabled ? 'disabled' : 'enabled'} for this tenant.`, 'success');
        await load();
      } else showToast(d.error || 'Toggle failed.', 'error');
    } catch { showToast('Toggle request failed.', 'error'); } finally { setBusy(null); }
  };

  const filtered = packs.filter(p => (p.name + ' ' + p.category + ' ' + p.framework + ' ' + p.endpoints.join(' ')).toLowerCase().includes(query.toLowerCase()));

  const categoryColor = (c: string) => {
    const map: Record<string, string> = {
      finance: 'bg-indigo-500', health: 'bg-emerald-500', gov: 'bg-sky-500', cyber: 'bg-violet-500',
      retail: 'bg-amber-500', logistics: 'bg-cyan-500', legal: 'bg-rose-500', energy: 'bg-orange-500',
      media: 'bg-pink-500', food: 'bg-lime-500', mining: 'bg-yellow-600', export: 'bg-teal-500',
      auto: 'bg-blue-600', insurance: 'bg-fuchsia-500', telecom: 'bg-purple-500', edu: 'bg-green-600',
    };
    return map[c] || 'bg-slate-500';
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Package className="w-4 h-4 text-indigo-600" /> Sector Pack Store
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-full">
            {packs.filter(p => p.enabled).length}/{packs.length} enabled
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search packs, frameworks, endpoints…"
              className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none w-56" />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg cursor-pointer ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-400'}`}><Grid className="w-3.5 h-3.5" /></button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-lg cursor-pointer ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-400'}`}><List className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={load} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-xs text-slate-400">Loading sector packs…</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-9 h-9 rounded-xl ${p.enabled ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-slate-100 dark:bg-slate-800'} flex items-center justify-center shrink-0`}>
                    {p.enabled ? <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" /> : <Boxes className="w-4.5 h-4.5 text-slate-400" />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.id}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${categoryColor(p.category)}`}>{p.category}</span>
              </div>

              {/* Score badge */}
              <div className="flex items-center gap-2 text-[11px]">
                {p.score?.overall ? (
                  <span className={`px-2 py-0.5 rounded-lg font-bold ${p.score.overall >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' : p.score.overall >= 60 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300' : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300'}`}>
                    {p.score.overall}/100 · {p.score.grade}
                  </span>
                ) : <span className="text-slate-400">Not scored</span>}
                <Star className={`w-3.5 h-3.5 ${p.enabled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold text-slate-500"><Cpu className="w-3 h-3 inline mr-0.5" />{p.moduleCount} modules</span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold text-slate-500"><ShieldCheck className="w-3 h-3 inline mr-0.5" />{p.modelCount} models</span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold text-slate-500"><Route className="w-3 h-3 inline mr-0.5" />{p.endpoints?.length} endpoints</span>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold text-slate-500">v{p.version}</span>
              </div>

              {/* Framework */}
              <div className="text-[10px] text-slate-500 truncate">Framework: <span className="font-mono text-slate-600 dark:text-slate-300">{p.framework}</span></div>

              {/* Endpoints preview */}
              <div className="text-[9px] font-mono text-slate-400 truncate">{p.endpoints?.join(', ')}</div>

              {/* Toggle */}
              <button onClick={() => toggle(p)} disabled={busy === p.id}
                className={`mt-auto w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 ${p.enabled ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                {busy === p.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : p.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {p.enabled ? 'Disable for Tenant' : 'Enable for Tenant'}
              </button>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full p-10 text-center text-xs text-slate-400">No packs match your search.</div>}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wide">
              <tr>
                <th className="px-4 py-3">Pack</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Modules</th><th className="px-4 py-3">Framework</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.id}</div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white ${categoryColor(p.category)}`}>{p.category}</span></td>
                  <td className="px-4 py-3 text-slate-500">{p.moduleCount}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{p.framework}</td>
                  <td className="px-4 py-3">{p.score?.overall ? <span className="font-bold text-slate-700 dark:text-slate-200">{p.score.overall} · {p.score.grade}</span> : <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3">{p.enabled
                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-[9px] font-bold"><CheckCircle2 className="w-3 h-3" /> ENABLED</span>
                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 font-mono text-[9px] font-bold"><XCircle className="w-3 h-3" /> DISABLED</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggle(p)} disabled={busy === p.id}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50 ${p.enabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                      {busy === p.id ? '…' : p.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};