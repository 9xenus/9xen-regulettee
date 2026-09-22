import React, { useState, useEffect } from 'react';
import { Users, Clock, Shield, Key, Plus, Trash2, Loader2, AlertCircle, Calendar, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Delegation {
  id: string;
  user_email: string;
  scopes: string;
  expires_at: string;
  status: string;
  granted_by: string;
}

export const DelegatedPermissions: React.FC = () => {
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDelegation, setNewDelegation] = useState({
    email: '',
    duration: '24', // hours
    scope: 'VIEW_ONLY'
  });

  useEffect(() => {
    fetchDelegations();
  }, []);

  const fetchDelegations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/advanced-settings/delegations/default');
      const data = await res.json();
      setDelegations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const expires_at = new Date(Date.now() + parseInt(newDelegation.duration) * 60 * 60 * 1000).toISOString();
    
    try {
      await fetch('/api/v1/advanced-settings/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'default',
          user_email: newDelegation.email,
          scopes: [newDelegation.scope],
          expires_at,
          granted_by: 'admin@regulettee.eu'
        })
      });
      setShowAddForm(false);
      fetchDelegations();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Delegated, Expiring Permissions</h2>
          <p className="text-slate-500 text-xs mt-1">Grant temporary, auto-expiring settings access for external auditors or contractors.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus className="w-3.5 h-3.5" />
          Issue Temp Access
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreate} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auditor Email</label>
                  <input
                    type="email"
                    required
                    value={newDelegation.email}
                    onChange={e => setNewDelegation({ ...newDelegation, email: e.target.value })}
                    placeholder="auditor@firm.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Duration</label>
                  <select
                    value={newDelegation.duration}
                    onChange={e => setNewDelegation({ ...newDelegation, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                  >
                    <option value="1">1 Hour (Quick Review)</option>
                    <option value="24">24 Hours (Full Audit)</option>
                    <option value="168">7 Days (Consultancy)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scope / Level</label>
                  <select
                    value={newDelegation.scope}
                    onChange={e => setNewDelegation({ ...newDelegation, scope: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                  >
                    <option value="VIEW_ONLY">View Only (Audit)</option>
                    <option value="EDITOR">Editor (Integration Fixes)</option>
                    <option value="ADMIN_MIGRATION">Full Migration Access</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                >
                  Grant Temporary Keys
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scopes</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires In</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Auditing Active Permissions...</p>
                  </div>
                </td>
              </tr>
            ) : delegations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Shield className="w-8 h-8 opacity-20" />
                    <p className="text-[10px] font-bold uppercase">No active delegated sessions</p>
                  </div>
                </td>
              </tr>
            ) : (
              delegations.map((d) => {
                const expiresDate = new Date(d.expires_at);
                const timeLeft = expiresDate.getTime() - Date.now();
                const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
                const minsLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));

                return (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{d.user_email}</p>
                          <p className="text-[9px] text-slate-400 font-medium">Granted by {d.granted_by}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(d.scopes).map((s: string) => (
                          <span key={s} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase border border-indigo-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-black font-mono text-amber-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{hoursLeft}h {minsLeft}m</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">{d.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
