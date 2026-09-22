import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserPlus, 
  Shield, 
  Mail, 
  Key, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal,
  UserCheck,
  Zap,
  Activity,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Personnel {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'ACTIVE' | 'PENDING' | 'LOCKED';
  lastActive: string;
  mfa: boolean;
}

export const PersonnelEnclave: React.FC = () => {
  const [users] = useState<Personnel[]>([
    { id: '1', name: 'Alexander Wright', email: 'a.wright@acme.sovereign', role: 'Compliance Lead', department: 'R&D', status: 'ACTIVE', lastActive: '2m ago', mfa: true },
    { id: '2', name: 'Elena Rodriguez', email: 'e.rod@acme.sovereign', role: 'Risk Analyst', department: 'Finance', status: 'ACTIVE', lastActive: '1h ago', mfa: true },
    { id: '3', name: 'Marcus Chen', email: 'm.chen@acme.sovereign', role: 'Security Architect', department: 'Engineering', status: 'LOCKED', lastActive: '5d ago', mfa: true },
    { id: '4', name: 'Sarah Miller', email: 's.miller@acme.sovereign', role: 'Legal Counsel', department: 'Legal', status: 'PENDING', lastActive: 'Never', mfa: false },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personnel Enclave</h2>
          <p className="text-slate-500 text-sm mt-1">Local seat management and departmental role assignments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-black transition-all shadow-lg uppercase tracking-widest">
          <UserPlus className="w-4 h-4" /> Provision New Seat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search personnel by name, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                <Filter className="w-3.5 h-3.5" /> Department
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5" /> Role
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Enclave Role</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
                            <span className="text-[10px] font-black text-indigo-600">{user.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              {user.name}
                              {user.mfa && <Fingerprint className="w-3 h-3 text-emerald-500" />}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-700">{user.role}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                          user.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700" :
                          user.status === 'PENDING' ? "bg-amber-50 text-amber-700" :
                          "bg-rose-50 text-rose-700"
                        )}>
                          {user.status}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-1 font-bold">{user.lastActive}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
              <Zap className="w-6 h-6 text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">License Enclave</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span>Enclave Seats</span>
                  <span>{users.length} / 12</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[60%] rounded-full shadow-lg shadow-indigo-500/20" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Your sovereign subscription is optimized for high-risk legal entities. Provisioning additional seats beyond 12 will trigger a "Sovereign Upscale" audit.
              </p>
              <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                Manage Quotas <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> 24h Activity Log
            </h3>
            <div className="space-y-4">
              {[
                { event: 'Seat Provisioned', user: 'Sarah Miller', time: '1h ago', icon: UserPlus },
                { event: 'Role Escalation', user: 'Alex Wright', time: '4h ago', icon: Shield },
                { event: 'Identity Locked', user: 'Marcus Chen', time: '12h ago', icon: Key },
              ].map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <log.icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-900 leading-tight">{log.event}</div>
                    <div className="text-[9px] font-bold text-slate-500 mt-0.5">{log.user} • {log.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-2 text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest text-center">
              View Detailed Personnel Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
