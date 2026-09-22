import React, { useEffect, useState, useCallback } from 'react';
import { Users, UserPlus, ShieldCheck, Award, Search, RefreshCw, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface Professional {
  id: string;
  name: string;
  email?: string;
  professionalType?: string;
  firm?: string;
  jurisdiction?: string;
  specialization?: string;
  barLicense?: string;
  licensingAuthority?: string;
  yearsOfPractice?: number;
  status: string;
  createdAt?: string;
}

const API = '/api/v1/lawyer';

export const LawyerConsultantManager: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', professionalType: 'lawyer', firm: '', jurisdiction: '', specialization: '', barLicense: '', yearsOfPractice: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/professionals`);
      const data = await res.json();
      setProfessionals(data.success ? data.professionals : []);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/professionals`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, yearsOfPractice: Number(form.yearsOfPractice) || 0 })
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ name: '', email: '', professionalType: 'lawyer', firm: '', jurisdiction: '', specialization: '', barLicense: '', yearsOfPractice: '' });
        setNotice(`Registered ${form.name}.`);
        load();
      } else setNotice(`Error: ${data.error || 'Unknown error'}`);
    } catch { setNotice('Error contacting API.'); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { status: patchStatus } = await (await fetch(`${API}/professionals/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    })).json();
    if (patchStatus) { }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(`Remove professional ${id}?`)) return;
    const res = await fetch(`${API}/professionals/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { setNotice(`Removed ${id}.`); load(); }
    else setNotice(`Error: ${data.error || 'Unknown error'}`);
  };

  const filtered = search
    ? professionals.filter(p => [p.name, p.jurisdiction, p.specialization, p.firm].join(' ').toLowerCase().includes(search.toLowerCase()))
    : professionals;

  const stats = {
    total: professionals.length,
    verified: professionals.filter(p => p.status === 'VERIFIED_PARTNER').length,
    pending: professionals.filter(p => p.status === 'PENDING_REVIEW').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Verified Lawyer & DPO Legal Consultants
          </h3>
          <p className="text-xs text-slate-500">Manage external privacy attorneys and DPO consultants on retainer</p>
          <div className="flex gap-2 mt-2 text-[11px]">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">{stats.total} total</span>
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-mono">{stats.verified} verified</span>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded font-mono">{stats.pending} pending</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roster…"
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 ring-indigo-500/40" />
          </div>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowForm(v => !v)} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
            <UserPlus className="w-4 h-4" /> Add Partner Attorney
          </button>
        </div>
      </div>

      {notice && <div className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 p-2 rounded-lg">{notice}</div>}

      {showForm && (
        <form onSubmit={submit} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(['name', 'email', 'firm', 'jurisdiction', 'specialization', 'barLicense'] as const).map(f => (
            <div key={f} className="text-xs">
              <label className="text-slate-500 font-semibold uppercase tracking-wide">{f.replace(/([A-Z])/g, ' $1')}</label>
              <input value={form[f] as string} onChange={e => setForm({ ...form, [f]: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
            </div>
          ))}
          <div className="text-xs">
            <label className="text-slate-500 font-semibold uppercase tracking-wide">Type</label>
            <select value={form.professionalType} onChange={e => setForm({ ...form, professionalType: e.target.value })}
              className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
              <option value="lawyer">Lawyer</option><option value="consultant">Consultant</option>
              <option value="auditor">Auditor</option><option value="dpo">DPO</option>
            </select>
          </div>
          <div className="text-xs">
            <label className="text-slate-500 font-semibold uppercase tracking-wide">Years of Practice</label>
            <input value={form.yearsOfPractice} onChange={e => setForm({ ...form, yearsOfPractice: e.target.value })} type="number"
              className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer">Register Professional</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading roster…</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">ID & Name</th>
                <th className="p-3.5">Type / Firm</th>
                <th className="p-3.5">Jurisdiction</th>
                <th className="p-3.5">Specialization</th>
                <th className="p-3.5">Bar License</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map(law => (
                <tr key={law.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{law.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{law.id} · {law.yearsOfPractice || 0}y</div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">{law.professionalType || 'lawyer'} · <span className="text-slate-500">{law.firm}</span></td>
                  <td className="p-3.5 font-medium">{law.jurisdiction}</td>
                  <td className="p-3.5 font-mono text-[11px]">{law.specialization}</td>
                  <td className="p-3.5 font-mono text-[10px] text-slate-500">{law.barLicense} <div className="text-slate-400">{law.licensingAuthority}</div></td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${law.status === 'VERIFIED_PARTNER' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : law.status === 'PENDING_REVIEW' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'}`}>
                      {law.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1">
                      <button title="Verify" onClick={() => updateStatus(law.id, 'VERIFIED_PARTNER')} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 cursor-pointer"><ShieldCheck className="w-3.5 h-3.5" /></button>
                      <button title="Reject" onClick={() => updateStatus(law.id, 'REJECTED')} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500 cursor-pointer"><XCircle className="w-3.5 h-3.5" /></button>
                      <button title="Remove" onClick={() => remove(law.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400">No professionals match your filter.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-[10px] text-slate-400 flex items-center gap-1"><Award className="w-3 h-3" /> Roster synced with registered KYC lawyer/consultant profiles via the lawyer-ops API.</p>
    </div>
  );
};

export default LawyerConsultantManager;