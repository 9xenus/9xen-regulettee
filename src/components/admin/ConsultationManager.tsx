import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Calendar, Video, Clock, ShieldCheck, CheckCircle2, Plus, RefreshCw } from 'lucide-react';

interface Session {
  id: string;
  tenantName: string;
  attorneyName?: string;
  topic?: string;
  scheduledAt?: string;
  status: string;
  roomRef?: string;
}

const API = '/api/v1/lawyer';

const fmtDate = (iso?: string) => {
  if (!iso) return 'Not scheduled';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

export const ConsultationManager: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ tenantName: '', attorneyName: '', topic: '', scheduledAt: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/consultations`);
      const data = await res.json();
      setSessions(data.success ? data.sessions : []);
    } catch { setSessions([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/consultations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined })
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false); setForm({ tenantName: '', attorneyName: '', topic: '', scheduledAt: '' });
        setNotice(`Consultation scheduled for ${data.session.tenantName}.`);
        load();
      } else setNotice(`Error: ${data.error || 'Unknown error'}`);
    } catch { setNotice('Error contacting API.'); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API}/consultations/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    });
    load();
  };

  const pending = sessions.filter(s => s.status === 'PENDING').length;
  const confirmed = sessions.filter(s => s.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Encrypted Legal Consultation Rooms
          </h3>
          <p className="text-xs text-slate-500">Live attorney consultations for tenant DPOs and legal counsel</p>
          <div className="flex gap-2 mt-2 text-[11px]">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">{sessions.length} total</span>
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-mono">{confirmed} confirmed</span>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded font-mono">{pending} pending</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowForm(v => !v)} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /> Schedule Consultation
          </button>
        </div>
      </div>

      {notice && <div className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 p-2 rounded-lg">{notice}</div>}

      {showForm && (
        <form onSubmit={submit} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-xs"><label className="text-slate-500 font-semibold uppercase tracking-wide">Tenant</label>
            <input required value={form.tenantName} onChange={e => setForm({ ...form, tenantName: e.target.value })} className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" /></div>
          <div className="text-xs"><label className="text-slate-500 font-semibold uppercase tracking-wide">Attorney</label>
            <input value={form.attorneyName} onChange={e => setForm({ ...form, attorneyName: e.target.value })} className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" /></div>
          <div className="text-xs"><label className="text-slate-500 font-semibold uppercase tracking-wide">Topic</label>
            <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" /></div>
          <div className="text-xs"><label className="text-slate-500 font-semibold uppercase tracking-wide">Scheduled At</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" /></div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer">Create Room</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading sessions…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map(s => (
            <div key={s.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{s.id}</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{s.tenantName}</h4>
                  {s.attorneyName && <div className="text-xs text-slate-500">Attorney: {s.attorneyName}</div>}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${s.status === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : s.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {s.status}
                  </span>
                  <button onClick={() => updateStatus(s.id, 'COMPLETED')} title="Mark completed" className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {s.topic && <p className="text-xs text-slate-600 dark:text-slate-400"><strong className="text-slate-800 dark:text-slate-200">Topic:</strong> {s.topic}</p>}
              {s.roomRef && <p className="text-[10px] font-mono text-slate-400">{s.roomRef}</p>}

              <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {fmtDate(s.scheduledAt)}</span>
                <div className="flex gap-1.5">
                  {s.status === 'PENDING' && (
                    <button onClick={() => updateStatus(s.id, 'CONFIRMED')} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer">Confirm</button>
                  )}
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                    <Video className="w-3.5 h-3.5" /> Join Room
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sessions.length === 0 && <div className="p-8 text-center text-xs text-slate-400">No consultations scheduled.</div>}
        </div>
      )}
    </div>
  );
};

export default ConsultationManager;