import React, { useEffect, useState } from 'react';
import { Plug, Search, Plus, Database, Layers, RefreshCw, Boxes, Radar, Zap, CheckCircle2, Wifi, WifiOff, Trash2, Pencil, Server, ExternalLink } from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

type Tab = 'browse' | 'builder' | 'discovery' | 'engines';

interface Connector {
  id: string; name: string; platform: string; transport: string; endpoint: string;
  auth_type: string; scopes: string[]; status: string; version: string; description: string;
  source: string; is_custom: number;
}

interface Engine { id: string; name: string; description: string; version: string; status: string; use_connector_id: string | null; base_url: string; last_health_check: string | null; }

const STATUS_STYLE: Record<string, string> = {
  CONNECTED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  DISCONNECTED: 'bg-slate-100 text-slate-600 border-slate-200',
  ERROR: 'bg-rose-100 text-rose-700 border-rose-200',
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  DISABLED: 'bg-slate-100 text-slate-500 border-slate-200',
  DEGRADED: 'bg-amber-100 text-amber-700 border-amber-200',
};

const emptyForm = {
  name: "", platform: "custom", transport: "HTTP", endpoint: "", auth_type: "NONE",
  scopes: "", version: "1.0.0", description: "", editId: "",
};

export const McpConnectorHub: React.FC = () => {
  const [tab, setTab] = useState<Tab>('browse');
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [discovered, setDiscovered] = useState<any[]>([]);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [overview, setOverview] = useState<any>({});
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [form, setForm] = useState(emptyForm);
  const [formBusy, setFormBusy] = useState(false);
  const [engForm, setEngForm] = useState({ name: "", description: "", version: "1.0.0", base_url: "", status: "ACTIVE", use_connector_id: "" });
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const flash = (kind: 'ok' | 'err', text: string) => { setMsg({ kind, text }); setTimeout(() => setMsg(null), 4000); };

  const loadConnectors = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set('q', q);
      if (statusFilter !== 'ALL') qs.set('status', statusFilter);
      const r = await fetchWithRetry(`/api/v1/mcp/connectors${qs.toString() ? '?' + qs.toString() : ''}`);
      const d = await r.json();
      if (d?.success) setConnectors(d.connectors || []);
    } catch (e: any) { flash('err', e.message); } finally { setLoading(false); }
  };

  const loadOverview = async () => {
    try { const r = await fetchWithRetry('/api/v1/mcp/overview'); const d = await r.json(); if (d?.success) setOverview(d.overview || {}); } catch { /* ignore */ }
  };

  const loadDiscovery = async () => {
    try { const r = await fetchWithRetry(`/api/v1/mcp/discovery${q ? '?q=' + encodeURIComponent(q) : ''}`); const d = await r.json(); if (d?.success) setDiscovered(d.discovered || []); } catch (e: any) { flash('err', e.message); }
  };

  const loadEngines = async () => {
    try { const r = await fetchWithRetry('/api/v1/mcp/engines'); const d = await r.json(); if (d?.success) setEngines(d.engines || []); } catch (e: any) { flash('err', e.message); }
  };

  useEffect(() => { loadConnectors(); loadOverview(); }, [tab, q, statusFilter]);

  const testConnector = async (id: string) => {
    setTestingId(id);
    try {
      const r = await fetchWithRetry(`/api/v1/mcp/connectors/${id}/test`, { method: 'POST' });
      const d = await r.json();
      if (d?.success) flash('ok', `Health ${d.health} · latency ${d.latencyMs}ms`);
      else flash('err', d.error || 'Test failed');
    } catch (e: any) { flash('err', e.message); } finally {
      setTestingId(null); loadConnectors();
    }
  };

  const removeConnector = async (id: string) => {
    if (!window.confirm('Remove this connector from the registry?')) return;
    try {
      const r = await fetchWithRetry(`/api/v1/mcp/connectors/${id}`, { method: 'DELETE' });
      const d = await r.json();
      flash(d?.success ? 'ok' : 'err', d?.message || d?.error || 'Delete failed');
      loadConnectors(); loadOverview();
    } catch (e: any) { flash('err', e.message); }
  };

  const importDiscovered = async (c: any) => {
    try {
      const r = await fetchWithRetry('/api/v1/mcp/discovery/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
      const d = await r.json();
      flash(d?.success ? 'ok' : 'err', d?.message || d?.error || 'Import failed');
      loadDiscovery(); loadConnectors(); loadOverview();
    } catch (e: any) { flash('err', e.message); }
  };

  const saveConnector = async () => {
    if (!form.name || !form.endpoint) { flash('err', 'Name and endpoint are required.'); return; }
    setFormBusy(true);
    try {
      const payload = { ...form, scopes: form.scopes.split(',').map(s => s.trim()).filter(Boolean) };
      const r = await fetchWithRetry(form.editId ? `/api/v1/mcp/connectors/${form.editId}` : '/api/v1/mcp/connectors', {
        method: form.editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      flash(d?.success ? 'ok' : 'err', d?.message || d?.error || 'Save failed');
      if (d?.success) { setForm(emptyForm); setTab('browse'); loadConnectors(); loadOverview(); }
    } catch (e: any) { flash('err', e.message); } finally { setFormBusy(false); }
  };

  const editConnector = (c: Connector) => {
    setForm({
      name: c.name, platform: c.platform, transport: c.transport, endpoint: c.endpoint,
      auth_type: c.auth_type, scopes: (c.scopes || []).join(', '), version: c.version,
      description: c.description, editId: c.id,
    });
    setTab('builder');
  };

  const addEngine = async () => {
    if (!engForm.name) { flash('err', 'Engine name is required.'); return; }
    try {
      const r = await fetchWithRetry('/api/v1/mcp/engines', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(engForm) });
      const d = await r.json();
      flash(d?.success ? 'ok' : 'err', d?.message || d?.error || 'Add failed');
      if (d?.success) { setEngForm({ name: "", description: "", version: "1.0.0", base_url: "", status: "ACTIVE", use_connector_id: "" }); loadEngines(); }
    } catch (e: any) { flash('err', e.message); }
  };

  const toggleEngine = async (e: Engine) => {
    try {
      const r = await fetchWithRetry(`/api/v1/mcp/engines/${e.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: e.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' }) });
      const d = await r.json();
      flash(d?.success ? 'ok' : 'err', d?.message || d?.error || 'Toggle failed');
      loadEngines();
    } catch (err: any) { flash('err', err.message); }
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'browse', label: 'Connector List', icon: Database },
    { id: 'builder', label: 'Custom Connector', icon: Pencil },
    { id: 'discovery', label: 'Discovery', icon: Radar },
    { id: 'engines', label: 'MCP Engines', icon: Layers },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Plug className="w-5 h-5" /></div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Advanced MCP Connector Hub</h3>
              <p className="text-[11px] text-slate-500">Connector registry · custom connectors · discovery · engine add/scale system</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">{overview.connected ?? 0} connected</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">{overview.pending ?? 0} pending</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">{overview.errors ?? 0} errors</span>
            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">{overview.activeEngines ?? 0}/{overview.totalEngines ?? 0} engines active</span>
          </div>
        </div>
        <button onClick={() => { setTab('browse'); loadConnectors(); loadOverview(); }} className="text-[11px] font-mono text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> REFRESH
        </button>
      </div>

      {msg && (
        <div className={`text-xs font-bold px-3 py-2 rounded-xl border ${msg.kind === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>{msg.text}</div>
      )}

      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'discovery') loadDiscovery(); if (t.id === 'engines') loadEngines(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${tab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Browse connectors by name, platform, description…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <option value="ALL">All statuses</option><option value="CONNECTED">Connected</option>
              <option value="PENDING">Pending</option><option value="DISCONNECTED">Disconnected</option><option value="ERROR">Error</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-10 text-sm text-slate-400 flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Loading registry…</div>
          ) : connectors.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              No connectors match. Add a custom connector or import from Discovery.
            </div>
          ) : (
            <div className="space-y-2">
              {connectors.map(c => (
                <div key={c.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900">{c.name}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${STATUS_STYLE[c.status] || STATUS_STYLE.DISCONNECTED}`}>{c.status}</span>
                      <span className="text-[9px] font-mono bg-indigo-50 text-indigo-600 rounded px-1.5 py-0.5">{c.transport}</span>
                      {c.is_custom ? <span className="text-[9px] font-mono bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">CUSTOM</span> : <span className="text-[9px] font-mono bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{c.platform}</span>}
                    </div>
                    <div className="text-slate-500">{c.description || 'No description'}</div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1"><Server className="w-3 h-3" />{c.endpoint}</span>
                      <span>v{c.version}</span>
                      <span>{c.auth_type}</span>
                      {c.scopes?.length ? <span>{c.scopes.join(', ')}</span> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => testConnector(c.id)} disabled={testingId === c.id}
                      className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${c.status === 'CONNECTED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-700 hover:bg-slate-800 text-white'}`}>
                      {testingId === c.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : c.status === 'CONNECTED' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />} Test
                    </button>
                    <button onClick={() => editConnector(c)} className="px-2.5 py-1.5 rounded-lg font-bold bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeConnector(c.id)} className="px-2.5 py-1.5 rounded-lg font-bold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'builder' && (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" /> {form.editId ? 'Edit Custom Connector' : 'Build Advanced Custom Connector'}
            </div>
            <Section label="Identity"><div className="grid sm:grid-cols-2 gap-3">
              <Field label="Connector name *"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></Field>
              <Field label="Platform slug"><input value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="input" /></Field>
            </div></Section>
            <Section label="Transport & Endpoint"><div className="grid sm:grid-cols-2 gap-3">
              <Field label="Transport">
                <select value={form.transport} onChange={e => setForm({ ...form, transport: e.target.value })} className="input">
                  <option>HTTP</option><option>SSE</option><option>STDIO</option>
                </select>
              </Field>
              <Field label="Endpoint URL *"><input value={form.endpoint} onChange={e => setForm({ ...form, endpoint: e.target.value })} placeholder="https://…" className="input" /></Field>
            </div></Section>
            <Section label="Security"><div className="grid sm:grid-cols-2 gap-3">
              <Field label="Auth type">
                <select value={form.auth_type} onChange={e => setForm({ ...form, auth_type: e.target.value })} className="input">
                  <option value="NONE">None</option><option value="API_KEY">API Key</option><option value="OAUTH2">OAuth 2.0</option><option value="MUTUAL_TLS">Mutual TLS</option>
                </select>
              </Field>
              <Field label="Scopes (comma-separated)"><input value={form.scopes} onChange={e => setForm({ ...form, scopes: e.target.value })} className="input" /></Field>
            </div></Section>
            <Field label="Description"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="input" /></Field>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={saveConnector} disabled={formBusy} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer">
                {formBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {form.editId ? 'Save Changes' : 'Register Connector'}
              </button>
              {form.editId && <button onClick={() => setForm(emptyForm)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold cursor-pointer">Cancel</button>}
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 text-xs space-y-3">
            <div className="font-extrabold text-indigo-700">MCP Engine Add System</div>
            <p className="text-slate-600 leading-relaxed">Register any Model Context Protocol server as a connector, then attach it to a runtime engine for orchestration, tool exposure, and health monitoring.</p>
            <ul className="space-y-1.5 text-slate-600">
              <li className="flex gap-1.5"><Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Transport auto-detection (HTTP / SSE / stdio)</li>
              <li className="flex gap-1.5"><Boxes className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Scope-scoped tool exposure per tenant</li>
              <li className="flex gap-1.5"><Wifi className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> One-click connectivity & latency probe</li>
              <li className="flex gap-1.5"><ExternalLink className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Connector → Engine binding for runtime scale</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'discovery' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); loadDiscovery(); }} placeholder="Search connector discovery catalog…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {discovered.map((c, i) => (
              <div key={`${c.name}-${i}`} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900">{c.name}</span>
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{c.transport}</span>
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{c.auth_type}</span>
                    {c.alreadyRegistered && <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 rounded px-1.5 py-0.5">REGISTERED</span>}
                  </div>
                  <p className="text-slate-500">{c.description}</p>
                  <div className="text-[10px] font-mono text-slate-400 truncate">{c.endpoint}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{(c.scopes || []).join(', ')}</span>
                  <button onClick={() => importDiscovered(c)} disabled={c.alreadyRegistered}
                    className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${c.alreadyRegistered ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    <Plug className="w-3.5 h-3.5" /> {c.alreadyRegistered ? 'Registered' : 'Import'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'engines' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-600" /> Add MCP Engine</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Engine name *"><input value={engForm.name} onChange={e => setEngForm({ ...engForm, name: e.target.value })} className="input" /></Field>
              <Field label="Version"><input value={engForm.version} onChange={e => setEngForm({ ...engForm, version: e.target.value })} className="input" /></Field>
              <Field label="Status">
                <select value={engForm.status} onChange={e => setEngForm({ ...engForm, status: e.target.value })} className="input">
                  <option>ACTIVE</option><option>DISABLED</option><option>DEGRADED</option>
                </select>
              </Field>
              <Field label="Base URL"><input value={engForm.base_url} onChange={e => setEngForm({ ...engForm, base_url: e.target.value })} className="input" /></Field>
              <Field label="Bind connector" className="lg:col-span-2">
                <select value={engForm.use_connector_id} onChange={e => setEngForm({ ...engForm, use_connector_id: e.target.value })} className="input">
                  <option value="">— none —</option>
                  {connectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description"><input value={engForm.description} onChange={e => setEngForm({ ...engForm, description: e.target.value })} className="input" /></Field>
            <button onClick={addEngine} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Engine
            </button>
          </div>

          <div className="space-y-2">
            {engines.map(eng => (
              <div key={eng.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900">{eng.name}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${STATUS_STYLE[eng.status] || STATUS_STYLE.DISABLED}`}>{eng.status}</span>
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">v{eng.version}</span>
                  </div>
                  <p className="text-slate-500">{eng.description || '—'}</p>
                  <div className="text-[10px] font-mono text-slate-400">{eng.base_url || 'no base_url'} {eng.use_connector_id ? `· bound:${eng.use_connector_id}` : ''}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">last check {eng.last_health_check ? new Date(eng.last_health_check).toLocaleString() : 'n/a'}</span>
                  <button onClick={() => toggleEngine(eng)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer ${eng.status === 'ACTIVE' ? 'bg-slate-700 hover:bg-slate-800 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                    {eng.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`.input{width:100%;padding:.55rem .75rem;border-radius:.75rem;border:1px solid #e2e8f0;font-size:.8125rem;color:#1e293b;background:#fff;outline:none}.input:focus{box-shadow:0 0 0 2px #c7d2fe;border-color:#818cf8}.input::placeholder{color:#94a3b8}`}</style>
    </div>
  );
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">{label}</div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
  <label className={`block ${className || ''}`}>
    <span className="text-[10px] font-bold text-slate-500 block mb-1">{label}</span>
    {children}
  </label>
);

export default McpConnectorHub;