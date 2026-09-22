import React, { useEffect, useState } from 'react';
import { Fingerprint, RefreshCw, Plus, Trash2, KeyRound, ShieldCheck, Rocket, ExternalLink, CheckCircle2 } from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

interface SsoConfig {
  id: string; tenant_id: string; idp_entity_id: string; idp_sso_url: string;
  sp_entity_id: string; sp_acs_url: string; is_active: number; created_at: string;
}

const SERVICES = [
  { id: 'enterprise-services', label: 'Enterprise Services Hub' },
  { id: 'company-network', label: 'AI Company Network' },
  { id: 'verification-hub', label: 'AI Verification Hub' },
  { id: 'predictive-intelligence', label: 'Predictive Trading Intelligence' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
];

const empty = { tenant_id: "", idp_entity_id: "", idp_sso_url: "", idp_x509_cert: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0G6zX2...", sp_entity_id: "https://sovereignty-compliance.9xen.eu/sp/metadata", sp_acs_url: "http://localhost:3000/api/auth/sso/callback", is_active: 1 };

export const EnterpriseSsoProvisioner: React.FC = () => {
  const [configs, setConfigs] = useState<SsoConfig[]>([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [launch, setLaunch] = useState<{ tenantId: string; service: string; email: string; role: string }>({ tenantId: '', service: 'enterprise-services', email: 'enterprise.user@acme-corp.eu', role: 'TENANT_OWNER' });
  const [launching, setLaunching] = useState(false);

  const flash = (kind: 'ok' | 'err', text: string) => { setMsg({ kind, text }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    try {
      const r = await fetchWithRetry('/api/v1/saas-admin/sso');
      const d = await r.json();
      if (d?.success) setConfigs(d.configs || []);
    } catch (e: any) { flash('err', e.message); }
  };

  useEffect(() => { load(); }, []);

  const createOrUpdate = async () => {
    if (!form.tenant_id || !form.idp_sso_url) { flash('err', 'tenant_id and IdP SSO URL are required.'); return; }
    try {
      const r = await fetchWithRetry('/api/v1/saas-admin/sso', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      flash(d?.success ? 'ok' : 'err', d?.message || d?.error || 'Save failed');
      if (d?.success) { setForm(empty); load(); }
    } catch (e: any) { flash('err', e.message); }
  };

  const toggle = async (c: SsoConfig) => {
    try {
      const r = await fetchWithRetry(`/api/v1/saas-admin/sso/${c.tenant_id}/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: c.is_active ? 0 : 1 }) });
      const d = await r.json();
      flash(d?.success ? 'ok' : 'err', d?.message || d?.error || 'Toggle failed');
      load();
    } catch (e: any) { flash('err', e.message); }
  };

  const remove = async (c: SsoConfig) => {
    if (!window.confirm(`Remove SSO for ${c.tenant_id}?`)) return;
    try {
      const r = await fetchWithRetry(`/api/v1/saas-admin/sso/${c.tenant_id}`, { method: 'DELETE' });
      const d = await r.json();
      flash(d?.success ? 'ok' : 'err', d?.message || d?.error || 'Delete failed');
      load();
    } catch (e: any) { flash('err', e.message); }
  };

  const launchSso = async () => {
    if (!launch.tenantId) { flash('err', 'Select an SSO-enabled tenant.'); return; }
    setLaunching(true);
    try {
      const r = await fetchWithRetry(`/api/v1/saas-admin/sso/${launch.tenantId}/login?service=${launch.service}`);
      const d = await r.json();
      if (!d?.success) { flash('err', d?.message || d?.error || 'Launch failed'); return; }
      // Drive the full SAML loop via the built-in demo IdP → ACS → landing
      const formEl = document.createElement('form');
      formEl.method = 'POST';
      formEl.action = '/api/auth/sso/demo-idp/respond';
      const add = (name: string, value: string) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = name; i.value = value; formEl.appendChild(i); };
      add('SAMLRequest', d.samlRequest);
      add('RelayState', d.relayState);
      add('inResponseTo', d.relayState);
      add('userEmail', launch.email);
      add('userRole', launch.role);
      document.body.appendChild(formEl);
      formEl.submit();
    } catch (e: any) { flash('err', e.message); setLaunching(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Fingerprint className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Built-in Enterprise SSO Provisioner</h3>
            <p className="text-[11px] text-slate-500">Provision SAML 2.0 per enterprise tenant, AI risk-gated AI-SSO logins, and launch users into enterprise service sections.</p>
          </div>
        </div>
        <button onClick={load} className="text-[11px] font-mono text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> REFRESH</button>
      </div>

      {msg && <div className={`text-xs font-bold px-3 py-2 rounded-xl border ${msg.kind === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>{msg.text}</div>}

      {configs.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-400 border border-dashed border-slate-200 rounded-2xl">No SSO configs provisioned yet. Add one for an enterprise tenant below.</div>
      ) : (
        <div className="space-y-2">
          {configs.map(c => (
            <div key={c.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-900">{c.tenant_id}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${c.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{c.is_active ? 'ACTIVE' : 'DISABLED'}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                  <div>IdP: {c.idp_sso_url}</div>
                  <div>SP: {c.sp_entity_id} · ACS: {c.sp_acs_url}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a href="/api/auth/sso/metadata" target="_blank" rel="noreferrer" className="px-2.5 py-1.5 rounded-lg font-bold bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 flex items-center gap-1 cursor-pointer"><ExternalLink className="w-3.5 h-3.5" /> SP Metadata</a>
                <button onClick={() => toggle(c)} className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer ${c.is_active ? 'bg-slate-700 hover:bg-slate-800 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>{c.is_active ? 'Disable' : 'Enable'}</button>
                <button onClick={() => remove(c)} className="px-2.5 py-1.5 rounded-lg font-bold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-600" /> Provision SSO Config</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Tenant ID *</span><input value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })} placeholder="org_4" className="input" /></label>
            <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">IdP Entity ID</span><input value={form.idp_entity_id} onChange={e => setForm({ ...form, idp_entity_id: e.target.value })} className="input" /></label>
            <label className="block sm:col-span-2"><span className="text-[10px] font-bold text-slate-500 block mb-1">IdP SSO URL (SAML POST) *</span><input value={form.idp_sso_url} onChange={e => setForm({ ...form, idp_sso_url: e.target.value })} placeholder="https://idp.example.eu/auth/realms/sso/protocol/saml" className="input" /></label>
            <div className="flex items-end gap-2">
              <label className="block flex-1"><span className="text-[10px] font-bold text-slate-500 block mb-1">Enable now</span>
                <select value={form.is_active} onChange={e => setForm({ ...form, is_active: Number(e.target.value) })} className="input">
                  <option value={1}>Active</option><option value={0}>Disabled</option>
                </select>
              </label>
              <button onClick={createOrUpdate} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer"><CheckCircle2 className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 space-y-3">
          <div className="font-extrabold text-indigo-700 text-sm flex items-center gap-2"><Rocket className="w-4 h-4" /> AI-SSO Login Lab (Demo Loop)</div>
          <p className="text-xs text-slate-600">Pick an enabled tenant and a service section — the built-in IdP signs a session and lands the user inside that enterprise service.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Tenant</span>
              <select value={launch.tenantId} onChange={e => setLaunch({ ...launch, tenantId: e.target.value })} className="input">
                <option value="">— select —</option>
                {configs.map(c => <option key={c.id} value={c.tenant_id} disabled={!c.is_active}>{c.tenant_id}{c.is_active ? '' : ' (disabled)'}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Service section</span>
              <select value={launch.service} onChange={e => setLaunch({ ...launch, service: e.target.value })} className="input">
                {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">SSO identity (email)</span><input value={launch.email} onChange={e => setLaunch({ ...launch, email: e.target.value })} className="input" /></label>
            <label className="block"><span className="text-[10px] font-bold text-slate-500 block mb-1">Role</span>
              <select value={launch.role} onChange={e => setLaunch({ ...launch, role: e.target.value })} className="input">
                <option>TENANT_OWNER</option><option>COMPLIANCE_OFFICER</option><option>AUDITOR</option><option>LAWYER</option>
              </select>
            </label>
          </div>
          <button onClick={launchSso} disabled={launching || !launch.tenantId}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer ${launch.tenantId ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            <KeyRound className="w-4 h-4" /> {launching ? 'Launching…' : 'Launch AI-SSO Login'}
          </button>
          <div className="flex items-start gap-1.5 text-[10px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            AI risk gate evaluates device agent, anomaly time-of-day, and automation signals before issuing the scoped session. In production point the IdP URL at your real identity provider.
          </div>
        </div>
      </div>

      <style>{`.input{width:100%;padding:.55rem .75rem;border-radius:.75rem;border:1px solid #e2e8f0;font-size:.8125rem;color:#1e293b;background:#fff;outline:none}.input:focus{box-shadow:0 0 0 2px #c7d2fe;border-color:#818cf8}`}</style>
    </div>
  );
};

export default EnterpriseSsoProvisioner;