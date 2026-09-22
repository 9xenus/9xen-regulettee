import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, ShoppingBag, Receipt, Plus, Trash2, Briefcase, FileText, CheckCircle2,
  Link2, Euro,
} from 'lucide-react';
import { fetchWithRetry } from '../../lib/api-client';

type Tab = 'clients' | 'services' | 'invoices';

export const LawyerPracticeSuite: React.FC = () => {
  const [tab, setTab] = useState<Tab>('clients');
  const [notify, setNotify] = useState<string | null>(null);
  const show = (m: string) => { setNotify(m); setTimeout(() => setNotify(null), 4000); };

  const [clients, setClients] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any>(null);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    try {
      const res = await fetchWithRetry('/api/v1/lawyer/clients');
      const d = await res.json();
      if (d.success) { setClients(d.clients || []); setCandidates(d.candidates || []); }
    } catch { /* offline */ }
  }, []);

  const loadServices = useCallback(async () => {
    try {
      const res = await fetchWithRetry('/api/v1/lawyer/services');
      const d = await res.json();
      if (d.success) setServices(d.services || []);
    } catch { /* offline */ }
  }, []);

  const loadInvoices = useCallback(async (clientId?: string) => {
    try {
      const q = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
      const res = await fetchWithRetry(`/api/v1/lawyer/invoices${q}`);
      const d = await res.json();
      if (d.success) setInvoices(d.invoices || []);
    } catch { /* offline */ }
  }, []);

  const loadLedger = useCallback(async (clientId: string) => {
    setActiveClientId(clientId);
    try {
      const res = await fetchWithRetry(`/api/v1/lawyer/clients/${clientId}/ledger`);
      const d = await res.json();
      if (d.success) setLedger(d);
    } catch { /* offline */ }
  }, []);

  useEffect(() => { loadClients(); loadServices(); loadInvoices(); }, [loadClients, loadServices, loadInvoices]);

  const [newClient, setNewClient] = useState({ name: '', industry: '', country: 'DE', email: '' });
  const linkClient = async () => {
    if (!newClient.name.trim()) return;
    try {
      const res = await fetchWithRetry('/api/v1/lawyer/clients', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClient.name, industry: newClient.industry, country: newClient.country, email: newClient.email, lawyerId: 'LAW-100' }),
      });
      const d = await res.json();
      if (d.success) { show(`Client '${d.client.name}' linked · jurisdiction ${d.client.country} auto-indexed.`); setNewClient({ name: '', industry: '', country: 'DE', email: '' }); loadClients(); }
      else show(d.error || 'Failed to link client.');
    } catch { show('Unable to reach client service.'); }
  };

  const unlinkClient = async (id: string) => {
    try { await fetchWithRetry(`/api/v1/lawyer/clients/${id}`, { method: 'DELETE' }); show('Client unlinked.'); loadClients(); if (activeClientId === id) setLedger(null); } catch { }
  };

  // Services
  const [newService, setNewService] = useState({ title: '', category: 'COMPLIANCE', description: '', price: '', currency: 'EUR', jurisdictions: 'EU' });
  const createService = async () => {
    if (!newService.title.trim()) return;
    try {
      const res = await fetchWithRetry('/api/v1/lawyer/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newService, price: Number(newService.price || 0), jurisdictions: newService.jurisdictions.split(',').map((s: string) => s.trim()).filter(Boolean) }),
      });
      const d = await res.json();
      if (d.success) { show(`Service '${d.service.title}' added to catalog.`); setNewService({ title: '', category: 'COMPLIANCE', description: '', price: '', currency: 'EUR', jurisdictions: 'EU' }); loadServices(); }
    } catch { show('Failed to create service.'); }
  };

  const deleteService = async (id: string) => {
    try { await fetchWithRetry(`/api/v1/lawyer/services/${id}`, { method: 'DELETE' }); loadServices(); show('Service removed.'); } catch { }
  };

  const assignService = async (clientId: string, serviceId: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/lawyer/clients/${clientId}/services`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId }),
      });
      const d = await res.json();
      if (d.success) { show('Service assigned to client.'); loadLedger(clientId); } else show(d.error || 'Assign failed.');
    } catch { }
  };

  const unassignService = async (clientId: string, assignmentId: string) => {
    try { await fetchWithRetry(`/api/v1/lawyer/clients/${clientId}/services/${assignmentId}`, { method: 'DELETE' }); loadLedger(clientId); show('Service unassigned.'); } catch { }
  };

  // Invoices
  const [newInvoice, setNewInvoice] = useState({ clientId: '', matter: '', amount: '', currency: 'EUR', dueInDays: 30 });
  const createInvoice = async () => {
    if (!newInvoice.clientId || !newInvoice.matter.trim()) { show('Select a client and enter the matter.'); return; }
    try {
      const due = new Date(Date.now() + Number(newInvoice.dueInDays || 30) * 86400000).toISOString();
      const client = clients.find(c => c.id === newInvoice.clientId) || { name: 'Client' };
      const res = await fetchWithRetry('/api/v1/lawyer/invoices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: newInvoice.clientId, clientName: client.name, matter: newInvoice.matter, amount: Number(newInvoice.amount || 0), currency: newInvoice.currency, dueDate: due, status: 'SENT' }),
      });
      const d = await res.json();
      if (d.success) { show(`Invoice ${d.invoice.invoice_number} issued to ${client.name}.`); setNewInvoice({ clientId: '', matter: '', amount: '', currency: 'EUR', dueInDays: 30 }); loadInvoices(); if (activeClientId) loadLedger(activeClientId); }
    } catch { show('Failed to create invoice.'); }
  };

  const setInvoiceStatus = async (id: string, status: string) => {
    try {
      const res = await fetchWithRetry(`/api/v1/lawyer/invoices/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) { show(`Invoice marked ${status}.`); loadInvoices(); if (activeClientId) loadLedger(activeClientId); }
    } catch { }
  };

  const badge = (s: string) => {
    const map: Record<string, string> = { DRAFT: 'bg-slate-100 text-slate-600', SENT: 'bg-amber-100 text-amber-700', PAID: 'bg-emerald-100 text-emerald-700', OVERDUE: 'bg-rose-100 text-rose-700', CANCELLED: 'bg-slate-100 text-slate-500', OPEN: 'bg-rose-100 text-rose-700', ASSIGNED: 'bg-indigo-100 text-indigo-700' };
    return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${map[s] || 'bg-slate-100 text-slate-600'}`}>{s}</span>;
  };

  const stat = (label: string, value: string, sub: string, color: string, Icon: any, c1: string) => (
    <div className={`p-4 bg-white rounded-xl border border-slate-200 border-l-4 ${c1}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="text-xl font-black text-slate-900 mt-1">{value}</div>
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );

  const totalOpen = invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED').reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

  return (
    <div className="space-y-4">
      {notify && (
        <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 bg-slate-900 dark:bg-slate-800 border-slate-800 text-emerald-300`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notify}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stat('Linked Clients', String(clients.length), `${candidates.length} platform candidates`, 'text-indigo-600', Users, 'border-l-indigo-400')}
        {stat('Service Catalog', String(services.length), 'assignable to clients', 'text-emerald-600', ShoppingBag, 'border-l-emerald-400')}
        {stat('Invoices', String(invoices.filter(i => i.status !== 'CANCELLED').length), `${invoices.filter(i => i.status !== 'PAID').length} receivable`, 'text-amber-600', Receipt, 'border-l-amber-400')}
        {stat('Open Receivables', totalOpen.toLocaleString() + ' EUR', 'across client matters', 'text-rose-600', Euro, 'border-l-rose-400')}
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          { id: 'clients', label: 'Clients & Ledgers', icon: Users },
          { id: 'services', label: 'Service Catalog', icon: ShoppingBag },
          { id: 'invoices', label: 'Invoice Desk', icon: Receipt },
        ] as { id: Tab; label: string; icon: any }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${tab === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <t.icon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ================= CLIENTS + LEDGER ================= */}
      {tab === 'clients' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-600" /> Manage Clients</h3>
              <span className="text-[10px] font-bold uppercase text-slate-400">{clients.length} linked</span>
            </div>
            <div className="space-y-2 mb-4">
              {clients.map(c => (
                <div key={c.id} className={`p-3 rounded-xl border transition-all ${activeClientId === c.id && ledger?.client?.id === c.id ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-sm font-bold text-slate-800">{c.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{c.id} · {c.industry || 'Unclassified'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase">{c.country || 'DE'} · {c.region || 'EU'}</span>
                      <button onClick={() => loadLedger(c.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Open ledger"><FileText className="w-4 h-4" /></button>
                      <button onClick={() => unlinkClient(c.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {clients.length === 0 && <div className="p-5 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">No clients linked yet.</div>}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Link New Client (auto-detect cross-border jurisdiction)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="Client name" className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
                <input value={newClient.industry} onChange={e => setNewClient({ ...newClient, industry: e.target.value })} placeholder="Industry e.g. FinTech" className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
                <input value={newClient.country} onChange={e => setNewClient({ ...newClient, country: e.target.value })} placeholder="Country code e.g. FR" className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm font-mono uppercase" />
                <input value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} placeholder="Email (optional)" className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
              </div>
              <button onClick={linkClient} className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> Link & Index Client</button>
            </div>

            {candidates.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform Tenants (linkable)</h4>
                <div className="max-h-52 overflow-y-auto space-y-1.5">
                  {candidates.filter((c: any) => !c.linked).slice(0, 10).map((c: any) => (
                    <button key={c.id} onClick={() => { setNewClient({ name: c.name, industry: c.industry, country: c.country || 'DE', email: '' }); }}
                      className="w-full text-left p-2 flex items-center justify-between rounded-lg border border-slate-100 hover:border-indigo-200 bg-white">
                      <span className="text-xs font-bold text-slate-700">{c.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{c.id} · {c.country}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-emerald-600" /> Client Ledger
              <span className="text-xs font-bold text-indigo-600">{ledger?.client ? ledger.client.name : ''}</span>
            </h3>
            {!ledger ? (
              <div className="p-6 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Select a client to open its compliance ledger — assigned services, invoices, law/act solutions and auto-dispatched tasks.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-indigo-50 rounded-lg"><div className="text-lg font-black text-indigo-700">{(ledger.services || []).length}</div><div className="text-[9px] font-bold uppercase text-indigo-500">Services</div></div>
                  <div className="p-2 bg-amber-50 rounded-lg"><div className="text-lg font-black text-amber-700">{(ledger.invoices || []).length}</div><div className="text-[9px] font-bold uppercase text-amber-500">Invoices</div></div>
                  <div className="p-2 bg-emerald-50 rounded-lg"><div className="text-lg font-black text-emerald-700">{(ledger.solutions || []).length}</div><div className="text-[9px] font-bold uppercase text-emerald-500">Solutions</div></div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Assigned Services</h4>
                  <div className="space-y-1.5">
                    {(ledger.services || []).map((s: any) => (
                      <div key={s.assignment_id} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg">
                        <div>
                          <div className="text-xs font-bold text-slate-800">{s.title}</div>
                          <div className="text-[10px] text-slate-400">{s.category} · {(s.jurisdictions || []).join(', ')}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-700">{s.price_snapshot.toLocaleString()} EUR</span>
                          {badge('ASSIGNED')}
                          <button onClick={() => unassignService(ledger?.client?.id, s.assignment_id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                    {!ledger.services?.length && <div className="text-[11px] text-slate-400">No services assigned.</div>}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Invoices</h4>
                  <div className="space-y-1.5">
                    {(ledger.invoices || []).map((i: any) => (
                      <div key={i.id} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg">
                        <div>
                          <div className="text-xs font-bold text-slate-800">{i.invoice_number}</div>
                          <div className="text-[10px] text-slate-400">{i.matter}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-700">{Number(i.amount || 0).toLocaleString()} {i.currency}</span>
                          {badge(i.status)}
                        </div>
                      </div>
                    ))}
                    {!ledger.invoices?.length && <div className="text-[11px] text-slate-400">No invoices issued.</div>}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Auto-Dispatched Compliance Tasks (Client Dashboard)</h4>
                  <div className="space-y-1.5">
                    {(ledger.tasks || []).map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg">
                        <div className="text-xs font-bold text-slate-700">{t.title}</div>
                        {badge(t.severity === 'CRITICAL' ? 'OPEN' : 'OPEN')}
                      </div>
                    ))}
                    {!ledger.tasks?.length && <div className="text-[11px] text-slate-400">No auto-dispatched tasks yet. Use the Law/Act Solution Engine.</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ================= SERVICES ================= */}
      {tab === 'services' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><ShoppingBag className="w-4 h-4 text-emerald-600" /> Manage Service Catalog</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {services.map(s => (
                <div key={s.id} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-emerald-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{s.title}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{s.category} · {(s.jurisdictions || []).join(' / ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{Number(s.price || 0).toLocaleString()} {s.currency}</span>
                      <button onClick={() => deleteService(s.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{s.description}</p>
                  {s.delivery_note && <div className="text-[10px] text-slate-400 mt-1 italic">{s.delivery_note}</div>}
                </div>
              ))}
            </div>
            {services.length === 0 && <div className="p-5 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">No services in catalog.</div>}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Service to Catalog</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })} placeholder="Service title" className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
              <input value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })} placeholder="Category (e.g. CROSS_BORDER)" className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
              <input value={newService.jurisdictions} onChange={e => setNewService({ ...newService, jurisdictions: e.target.value })} placeholder="Jurisdictions (comma) e.g. EU,DE,US" className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
              <textarea value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} placeholder="Description" rows={2} className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm md:col-span-2" />
              <div className="flex gap-2">
                <input value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} placeholder="Price" className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
                <select value={newService.currency} onChange={e => setNewService({ ...newService, currency: e.target.value })} className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm">
                  <option>EUR</option><option>USD</option><option>GBP</option>
                </select>
              </div>
            </div>
            <button onClick={createService} className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Service</button>
          </div>
        </motion.div>
      )}

      {/* ================= INVOICES ================= */}
      {tab === 'invoices' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Receipt className="w-4 h-4 text-amber-600" /> Invoice Client</h3>
            <div className="space-y-2">
              <select value={newInvoice.clientId} onChange={e => setNewInvoice({ ...newInvoice, clientId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={newInvoice.matter} onChange={e => setNewInvoice({ ...newInvoice, matter: e.target.value })} placeholder="Matter e.g. EU AI Act conformity advisory" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <div className="flex gap-2">
                <input value={newInvoice.amount} onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })} placeholder="Amount" className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                <select value={newInvoice.currency} onChange={e => setNewInvoice({ ...newInvoice, currency: e.target.value })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                  <option>EUR</option><option>USD</option><option>GBP</option>
                </select>
                <input type="number" value={newInvoice.dueInDays} onChange={e => setNewInvoice({ ...newInvoice, dueInDays: Number(e.target.value) })} placeholder="Due in days" className="w-28 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <button onClick={createInvoice} className="w-full py-2.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> Issue Invoice</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Receipt className="w-4 h-4 text-amber-600" /> Invoice Desk</h3>
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {invoices.map(i => (
                <div key={i.id} className="p-3 border border-slate-200 rounded-xl bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-2">{i.invoice_number}<span className="text-slate-300">·</span>{i.client_name}</div>
                      <div className="text-[10px] text-slate-400">{i.matter}</div>
                    </div>
                    <span className="text-sm font-black text-slate-800">{Number(i.amount || 0).toLocaleString()} {i.currency}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>{badge(i.status)}</div>
                    <div className="flex gap-1.5">
                      {i.status !== 'PAID' && i.status !== 'CANCELLED' && (
                        <>
                          <button onClick={() => setInvoiceStatus(i.id, i.status === 'DRAFT' ? 'SENT' : 'PAID')} className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded">Mark {i.status === 'DRAFT' ? 'Sent' : 'Paid'}</button>
                          <button onClick={() => setInvoiceStatus(i.id, 'CANCELLED')} className="px-2 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded">Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                  {(i.line_items || []).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
                      {(i.line_items || []).map((l: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[10px] text-slate-500">
                          <span className="font-semibold">{l.title}</span>
                          <span>{Number(l.amount || 0).toLocaleString()} {i.currency}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {invoices.length === 0 && <div className="p-5 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">No invoices yet.</div>}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LawyerPracticeSuite;