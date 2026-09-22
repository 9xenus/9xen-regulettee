import React, { useEffect, useState, useCallback } from 'react';
import {
  Radio, Package, FileLock2, Fingerprint, Scale, RefreshCw, Send, CheckCircle2, XCircle,
  Server, ShieldCheck, Activity, Landmark, AlertTriangle, Loader2, Cpu, Webhook, Zap, Wallet, Gauge,
} from 'lucide-react';

const API = '/api/v1/saas-admin/deeptech';

type TabId = 'health' | 'pulse' | 'packs' | 'seals' | 'identity' | 'lawyer' | 'ai' | 'delivery';

const stat = (label: string, value: any, icon: any, color: string) => {
  const Icon = icon;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
      <Icon className={`w-4 h-4 ${color} shrink-0`} />
    <div className="min-w-0">
      <div className="text-lg font-bold text-white leading-none truncate">{value ?? '–'}</div>
      <div className="text-[9px] font-mono text-slate-400 uppercase mt-0.5 tracking-wide truncate">{label}</div>
    </div>
  </div>
  );
};

export const DeepTechMissionControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('health');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [health, setHealth] = useState<any>(null);
  const [pulse, setPulse] = useState<any>(null);
  const [packs, setPacks] = useState<any>(null);
  const [seals, setSeals] = useState<any>(null);
  const [identity, setIdentity] = useState<any>(null);
  const [lawyer, setLawyer] = useState<any>(null);
  const [ai, setAi] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);

  const [bcType, setBcType] = useState('ADMIN_BROADCAST');
  const [bcTitle, setBcTitle] = useState('');
  const [bcMsg, setBcMsg] = useState('');
  const [bcSeverity, setBcSeverity] = useState('INFO');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [h, p, pk, s, i, l, aiD, dlv] = await Promise.all(
        ['/health', '/pulse/status', '/packs', '/seals', '/identity/devices', '/lawyer', '/ai/telemetry', '/delivery/overview'].map(path =>
          fetch(`${API}${path}`).then(r => r.json()).catch(() => null))
      );
      if (h?.success) setHealth(h);
      if (p?.success) setPulse(p);
      if (pk?.success) setPacks(pk);
      if (s?.success) setSeals(s);
      if (i?.success) setIdentity(i);
      if (l?.success) setLawyer(l);
      if (aiD?.success) setAi(aiD);
      if (dlv?.success) setDelivery(dlv);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const broadcast = async () => {
    if (!bcMsg.trim()) return;
    setStatus('');
    try {
      const r = await fetch(`${API}/pulse/broadcast`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: bcType, title: bcTitle || 'Admin broadcast', message: bcMsg, severity: bcSeverity, source: 'super-admin' })
      });
      const d = await r.json();
      setStatus(d.success ? `Broadcast pushed (sse+ws): ${d.event.title}` : d.error);
      if (d.success) { setBcMsg(''); fetchAll(); }
    } catch (e: any) { setStatus(e.message || 'Broadcast failed.'); }
  };

  const verifySeal = async (id: string) => {
    setStatus('');
    try {
      const r = await fetch(`${API}/seals/${id}/verify`, { method: 'POST' });
      const d = await r.json();
      setStatus(d.message || d.error);
      fetchAll();
    } catch (e: any) { setStatus(e.message || 'Verify failed.'); }
  };

  const retryDelivery = async (id: number) => {
    setStatus('');
    try {
      const r = await fetch(`${API}/delivery/retry/${id}`, { method: 'POST' });
      const d = await r.json();
      setStatus(d.message || d.error);
      fetchAll();
    } catch (e: any) { setStatus(e.message || 'Retry failed.'); }
  };

  const tabs = [
    { id: 'health' as TabId, label: 'Platform Health', icon: Server },
    { id: 'pulse' as TabId, label: 'Realtime Pulse', icon: Radio },
    { id: 'packs' as TabId, label: 'Sector Packs & Frameworks', icon: Package },
    { id: 'seals' as TabId, label: 'Forensic Seal Registry', icon: FileLock2 },
    { id: 'identity' as TabId, label: 'Identity Devices', icon: Fingerprint },
    { id: 'lawyer' as TabId, label: 'Counsel & Consultations', icon: Scale },
    { id: 'ai' as TabId, label: 'AI Co-Pilot Metering', icon: Cpu },
    { id: 'delivery' as TabId, label: 'Delivery & Webhook Center', icon: Webhook },
  ];

  const sevColor = (s: string) => s === 'ERROR' ? 'bg-red-500' : s === 'WARN' || s === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500';
  const badge = (txt: string, good: boolean) => (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${good ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>{txt}</span>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="ml-auto flex items-center gap-2">
          {status && <span className="text-[11px] font-mono text-slate-400">{status}</span>}
          <button onClick={fetchAll} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer" title="Refresh All Telemetry">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${activeTab === t.id ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: PLATFORM HEALTH */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stat('Forensic Seals', health?.modules?.forensicSeals, FileLock2, 'text-violet-400')}
            {stat('Tampered', health?.modules?.tamperedSeals, AlertTriangle, health?.modules?.tamperedSeals > 0 ? 'text-red-400' : 'text-emerald-400')}
            {stat('Identity Devices', health?.modules?.identityDevices, Fingerprint, 'text-indigo-400')}
            {stat('Pulse Events', health?.modules?.pulseEvents, Radio, 'text-cyan-400')}
            {stat('Frameworks', health?.modules?.frameworks, Landmark, 'text-emerald-400')}
            {stat('Tenants', health?.modules?.tenants, Server, 'text-slate-300')}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-violet-400" /> Deep-Tech System Integrity</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400">Evidence Integrity Score</span>
                  <span className="text-sm font-bold text-white">{health?.computed?.evidenceIntegrityPct ?? '–'}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full transition-all" style={{ width: `${health?.computed?.evidenceIntegrityPct ?? 0}%` }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400">Realtime Transport</span>
                  <span className="text-xs">{badge(health?.computed?.realtimeTransport ?? 'UNKNOWN', health?.computed?.realtimeTransport === 'LIVE')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400">WS Endpoint</span>
                  <span className="text-xs font-mono text-violet-300">{health?.transport?.ws?.attached ? `${health.transport.ws.path}` : 'not attached'}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Sovereign Protection Status</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-[9px] font-mono uppercase text-slate-400">Sealed / Verified</div>
                  <div className="text-xl font-bold text-emerald-400">{seals?.summary?.byStatus?.VERIFIED ?? 0}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-[9px] font-mono uppercase text-slate-400">Sealed / Pending</div>
                  <div className="text-xl font-bold text-amber-400">{seals?.summary?.byStatus?.SEALED ?? 0}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-[9px] font-mono uppercase text-slate-400">Bound Devices</div>
                  <div className="text-xl font-bold text-indigo-400">{identity?.summary?.byStatus?.VERIFIED ?? 0}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-[9px] font-mono uppercase text-slate-400">Counsel Verified</div>
                  <div className="text-xl font-bold text-violet-400">{lawyer?.summary?.verified ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REALTIME PULSE */}
      {activeTab === 'pulse' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-3"><Send className="w-4 h-4 text-cyan-400" /> Platform-Wide Broadcast</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
              <select value={bcType} onChange={e => setBcType(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none">
                {['ADMIN_BROADCAST', 'REGULATOR_UPDATE', 'SEVERITY_ALERT', 'MAINTENANCE', 'SECURITY_NOTICE'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={bcSeverity} onChange={e => setBcSeverity(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none">
                {['INFO', 'WARN', 'ERROR'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input value={bcTitle} onChange={e => setBcTitle(e.target.value)} placeholder="Title (e.g. EU AI Act alignment)" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none" />
              <input value={bcMsg} onChange={e => setBcMsg(e.target.value)} placeholder="Message → pushed to all SSE+WS clients" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none" />
            </div>
            <button onClick={broadcast} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Radio className="w-3.5 h-3.5" /> Broadcast Now
            </button>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> Recent Platform Events</span>
              <span className="text-[10px] font-mono text-slate-400">SSE+WS · {pulse?.summary?.totalEvents ?? 0} events</span>
            </div>
            <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-800/60">
              {(pulse?.events ?? []).map((e: any, i: number) => (
                <div key={i} className="px-4 py-2.5 flex items-start gap-3">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${sevColor(e.severity)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">{e.title} <span className="text-[9px] font-mono text-slate-500 ml-1">{e.type}</span></div>
                    {e.message && <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{e.message}</div>}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 shrink-0">{e.timestamp}</span>
                </div>
              ))}
              {(pulse?.events ?? []).length === 0 && <div className="p-8 text-center text-xs text-slate-500">No pulse events yet.</div>}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SECTOR PACKS & FRAMEWORKS */}
      {activeTab === 'packs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stat('Frameworks', packs?.summary?.frameworks, Landmark, 'text-emerald-400')}
            {stat('Framework Modules', packs?.summary?.frameworkModules, Package, 'text-violet-400')}
            {stat('Pack Activations', packs?.summary?.activated, Server, 'text-indigo-400')}
            {stat('Total Activations', packs?.summary?.totalActivations, Scale, 'text-cyan-400')}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white">Framework Registry & Tenant Enablement</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="px-4 py-2.5">Code</th><th className="px-4 py-2.5">Framework</th><th className="px-4 py-2.5">Version</th><th className="px-4 py-2.5">Active</th><th className="px-4 py-2.5">Tenant Activations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(packs?.packs ?? []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-violet-300 font-bold">{p.code}</td>
                      <td className="px-4 py-2.5 text-white">{p.name}</td>
                      <td className="px-4 py-2.5 text-slate-400">{p.version}</td>
                      <td className="px-4 py-2.5">{p.isActive ? badge('LIVE', true) : badge('OFF', false)}</td>
                      <td className="px-4 py-2.5 text-slate-300">
                        {p.activations.length}
                        <div className="text-[9px] text-slate-500 mt-0.5">{p.activations.map((a: any) => a.tenantName || a.tenantId).join(', ')}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FORENSIC SEAL REGISTRY */}
      {activeTab === 'seals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stat('Total Seals', seals?.summary?.totalSeals, FileLock2, 'text-violet-400')}
            {stat('Verified', seals?.summary?.byStatus?.VERIFIED, CheckCircle2, 'text-emerald-400')}
            {stat('Pending', seals?.summary?.byStatus?.SEALED, Activity, 'text-amber-400')}
            {stat('Tampered', seals?.summary?.byStatus?.TAMPERED, XCircle, 'text-red-400')}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white">Evidence Vault (platform-wide)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="px-4 py-2.5">Seal</th><th className="px-4 py-2.5">Tenant</th><th className="px-4 py-2.5">Evidence</th><th className="px-4 py-2.5">Chain Ref</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(seals?.seals ?? []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-violet-300 font-bold">{s.id}</td>
                      <td className="px-4 py-2.5 text-slate-300">{s.tenantId}</td>
                      <td className="px-4 py-2.5 text-white max-w-[180px] truncate">{s.documentName}</td>
                      <td className="px-4 py-2.5 text-slate-500 truncate max-w-[100px]">{s.chainRef}</td>
                      <td className="px-4 py-2.5">{s.status === 'VERIFIED' ? badge('INTACT', true) : s.status === 'TAMPERED' ? badge('TAMPERED', false) : badge(s.status, true)}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => verifySeal(s.id)} className="px-2.5 py-1.5 bg-slate-800 hover:bg-violet-600 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors">Verify</button>
                      </td>
                    </tr>
                  ))}
                  {(seals?.seals ?? []).length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No forensic seals minted yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: IDENTITY DEVICES */}
      {activeTab === 'identity' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stat('Total Devices', identity?.summary?.totalDevices, Fingerprint, 'text-indigo-400')}
            {stat('Verified', identity?.summary?.byStatus?.VERIFIED, CheckCircle2, 'text-emerald-400')}
            {stat('Pending', identity?.summary?.byStatus?.PENDING, Activity, 'text-amber-400')}
            {stat('Failed', identity?.summary?.byStatus?.FAILED, XCircle, 'text-red-400')}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white">TOTP Attestation Devices</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="px-4 py-2.5">Device ID</th><th className="px-4 py-2.5">Tenant</th><th className="px-4 py-2.5">Alias</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Last Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(identity?.devices ?? []).map((d: any) => (
                    <tr key={d.deviceId} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-indigo-300 font-bold">{d.deviceId}</td>
                      <td className="px-4 py-2.5 text-slate-300">{d.tenantId}</td>
                      <td className="px-4 py-2.5 text-white">{d.alias}</td>
                      <td className="px-4 py-2.5">{d.status === 'VERIFIED' ? badge(d.status, true) : d.status === 'FAILED' ? badge(d.status, false) : badge(d.status, true)}</td>
                      <td className="px-4 py-2.5 text-slate-400">{d.lastVerifiedAt || '—'}</td>
                    </tr>
                  ))}
                  {(identity?.devices ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No identity devices attested yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: COUNSEL & CONSULTATIONS */}
      {activeTab === 'lawyer' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stat('Professionals', lawyer?.summary?.professionals, Scale, 'text-violet-400')}
            {stat('Verified', lawyer?.summary?.verified, CheckCircle2, 'text-emerald-400')}
            {stat('Consultations', lawyer?.summary?.consultations, Activity, 'text-cyan-400')}
            {stat('Directives', lawyer?.summary?.directives, Landmark, 'text-amber-400')}
            {stat('Opinion Letters', lawyer?.summary?.opinions, FileLock2, 'text-indigo-400')}
            {stat('Invoices', lawyer?.summary?.invoices, Server, 'text-slate-300')}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-2">Professionals</div>
              {(lawyer?.professionals ?? []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-white truncate">{p.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${p.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>{p.status}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-2">Consultations (SLA {lawyer?.summary?.avgSlaPercent}%)</div>
              {(lawyer?.consultations ?? []).map((c: any) => (
                <div key={c.id} className="py-1.5 text-xs border-b border-slate-800/40 last:border-0">
                  <div className="text-white truncate">{c.professional} <span className="text-slate-500">· {c.sessionType}</span></div>
                  <div className="text-[10px] text-slate-500 uppercase">{c.status} · {c.scheduledAt}</div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-2">Directives & Opinions</div>
              {(lawyer?.directives ?? []).slice(0, 4).map((d: any) => (
                <div key={d.id} className="py-1.5 text-xs flex justify-between">
                  <span className="text-white truncate">{d.title}</span><span className="text-slate-500 text-[10px] uppercase">{d.status}</span>
                </div>
              ))}
              {(lawyer?.opinions ?? []).slice(0, 3).map((o: any) => (
                <div key={o.id} className="py-1.5 text-xs flex justify-between">
                  <span className="text-indigo-300 truncate">{o.reference}</span><span className="text-slate-500 text-[10px] uppercase">{o.clientName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: AI CO-PILOT METERING */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stat('AI Calls', ai?.total?.c, Cpu, 'text-violet-400')}
            {stat('Est. Spend', `$${(ai?.total?.usd ?? 0).toFixed(4)}`, Wallet, 'text-emerald-400')}
            {stat('Tokens In', ai?.total?.tok_in ?? 0, Zap, 'text-cyan-400')}
            {stat('Tokens Out', ai?.total?.tok_out ?? 0, Activity, 'text-indigo-400')}
            {stat('Avg Latency', `${ai?.total?.lat ?? 0}ms`, Gauge, 'text-amber-400')}
            {stat('Gemini Key', process.env.GEMINI_API_KEY ? 'SET' : 'N/A', ShieldCheck, process.env.GEMINI_API_KEY ? 'text-emerald-400' : 'text-slate-400')}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-white mb-3">Per-Provider Breakdown</div>
              {(ai?.byProvider ?? []).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0 text-xs">
                  <span className="text-slate-300 font-mono">{p.provider} <span className="text-slate-500">· {p.model}</span></span>
                  <span className="text-slate-400">{p.calls} calls · ${Number(p.usd).toFixed(4)}</span>
                </div>
              ))}
              {(ai?.byProvider ?? []).length === 0 && <div className="p-6 text-center text-xs text-slate-500">No AI usage recorded yet.</div>}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-white mb-3">Top Tenants by AI Spend</div>
              {(ai?.byTenant ?? []).slice(0, 8).map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0 text-xs">
                  <span className="text-violet-300 font-mono">{t.tenant_id}</span>
                  <span className="text-slate-400">{t.calls} calls · ${Number(t.usd).toFixed(4)}</span>
                </div>
              ))}
              {(ai?.byTenant ?? []).length === 0 && <div className="p-6 text-center text-xs text-slate-500">No tenant spend yet.</div>}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white">Daily Call Volume (last 14d)</div>
            <div className="p-4 flex items-end gap-1.5 h-28">
              {(ai?.daily ?? []).map((d: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <span className="text-[9px] font-mono text-slate-500">{d.calls}</span>
                  <div className="w-full bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t transition-all" style={{ height: `${Math.min(100, (d.calls / Math.max(1, Math.max(...(ai.daily ?? []).map((x: any) => x.calls)))) * 64)}px` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DELIVERY & WEBHOOK CENTER */}
      {activeTab === 'delivery' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stat('Delivery Events', delivery?.total, Send, 'text-cyan-400')}
            {stat('Delivered', delivery?.statusTotals?.find((s: any) => s.status === 'SENT')?.n ?? 0, CheckCircle2, 'text-emerald-400')}
            {stat('Failed', delivery?.failures, XCircle, 'text-red-400')}
            {stat('Health', `${delivery?.deliveryHealthPct ?? 100}%`, Activity, (delivery?.deliveryHealthPct ?? 100) >= 90 ? 'text-emerald-400' : 'text-red-400')}
            {stat('WS Transport', delivery?.transport?.ws?.attached ? 'LIVE' : 'N/A', Radio, 'text-violet-400')}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white">Delivery Queue & Retry</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="px-4 py-2.5">#</th><th className="px-4 py-2.5">Channel</th><th className="px-4 py-2.5">Event</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Attempts</th><th className="px-4 py-2.5">Created</th><th className="px-4 py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(delivery?.recent ?? []).map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-slate-500">{d.id}</td>
                      <td className="px-4 py-2.5 text-cyan-300 font-bold">{d.channel}</td>
                      <td className="px-4 py-2.5 text-white max-w-[200px] truncate">{d.event_type}</td>
                      <td className="px-4 py-2.5">{d.status === 'SENT' ? badge('SENT', true) : d.status === 'FAILED' ? badge('FAILED', false) : badge(d.status, true)}</td>
                      <td className="px-4 py-2.5 text-slate-400">{d.attempt}</td>
                      <td className="px-4 py-2.5 text-slate-500">{d.created_at}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => retryDelivery(d.id)} disabled={d.status === 'SENT'}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-bold text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors">
                          Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(delivery?.recent ?? []).length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No delivery telemetry yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};