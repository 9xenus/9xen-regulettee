import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Network, 
  Search, 
  Filter, 
  Download, 
  History, 
  User, 
  Database, 
  ShieldCheck, 
  Eye, 
  Lock,
  ChevronRight,
  Fingerprint,
  FileText
} from 'lucide-react';

const lineageEvents = [
  { id: 'EV-901', user: 'Admin_Alice', action: 'Schema Update', target: 'Tenant_Alpha_DB', time: '5 mins ago', risk: 'Low' },
  { id: 'EV-902', user: 'System_Bot', action: 'Key Rotation', target: 'Quantum_Vault', time: '12 mins ago', risk: 'Low' },
  { id: 'EV-903', user: 'Unknown_IP', action: 'Failed Auth', target: 'API_Gateway', time: '18 mins ago', risk: 'High' },
  { id: 'EV-904', user: 'Admin_Bob', action: 'Data Export', target: 'EU_Regulatory_Logs', time: '1 hr ago', risk: 'Medium' },
];

export const ForensicAuditLineage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visual Graph Placeholder (using CSS for sophistication) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-500" />
                Data Lineage Graph
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Visualizing Cross-Tenant Interactions</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Admin Node
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Data Sink
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            {/* Mock Graph Visualization */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/20 flex items-center justify-center z-10 border-4 border-white"
              >
                <ShieldCheck className="w-10 h-10 text-white" />
              </motion.div>
              
              {/* Radial Nodes */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <div 
                  key={i}
                  className="absolute"
                  style={{ transform: `rotate(${deg}deg) translateX(140px)` }}
                >
                  <div className="flex flex-col items-center gap-1" style={{ transform: `rotate(-${deg}deg)` }}>
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                      {i % 2 === 0 ? <Database className="w-5 h-5 text-slate-400" /> : <User className="w-5 h-5 text-slate-400" />}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Node_{i+1}</span>
                  </div>
                </div>
              ))}

              {/* Connecting Lines (Decorative) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <circle cx="50%" cy="50%" r="140" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="50%" y1="50%" x2="50%" y2="0" stroke="#6366f1" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="0" y2="50%" stroke="#6366f1" strokeWidth="1" />
                <line x1="50%" y1="50%" x2="100%" y2="50%" stroke="#6366f1" strokeWidth="1" />
              </svg>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
               <History className="w-4 h-4" />
               Live Propagation Monitor: <span className="text-indigo-600">842 packets/sec</span>
             </div>
          </div>
        </div>

        {/* Audit Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-indigo-500" />
              Incident Forensics
            </h3>
            <div className="space-y-3">
              {lineageEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedEvent === ev.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-slate-700">{ev.action}</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      ev.risk === 'High' ? 'bg-rose-100 text-rose-600' : 
                      ev.risk === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {ev.risk}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {ev.user} • {ev.time}
                  </div>
                </button>
              ))}
            </div>
            <button className="w-full mt-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-indigo-500/20 hover:bg-slate-800 transition-colors">
              Full Forensic Audit
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-800">Tamper-Proof Ledger</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SHA-256 Validated</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              All events are cryptographically hashed and anchored to the primary blockchain ledger for immutable regulatory evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Deep Search Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search across all audit logs..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5" />
              Advanced Filters
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">
            <Download className="w-3.5 h-3.5" />
            Export Forensic Bundle
          </button>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Event ID</th>
                <th className="px-6 py-3">Actor Identity</th>
                <th className="px-6 py-3">Action Class</th>
                <th className="px-6 py-3">Resource Target</th>
                <th className="px-6 py-3">Global IP</th>
                <th className="px-6 py-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: 'AUTH-842', actor: 'user_9281', action: 'Login Success', target: 'SaaS Gateway', ip: '45.12.8.2', status: 'VERIFIED' },
                { id: 'DATA-102', actor: 'service_worker_7', action: 'Sync Commit', target: 'EU-Database', ip: 'Internal', status: 'VERIFIED' },
                { id: 'SEC-403', actor: 'anon_09x', action: 'Policy Bypass Attempt', target: 'Security Hub', ip: '108.2.1.9', status: 'BLOCKED' },
                { id: 'BILL-291', actor: 'admin_sys', action: 'Refund Issued', target: 'Stripe API', ip: '192.168.1.1', status: 'VERIFIED' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{row.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-xs font-black text-slate-700">{row.actor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">{row.action}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tighter">{row.target}</td>
                  <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{row.ip}</td>
                  <td className="px-6 py-4 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black ${
                      row.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {row.status === 'VERIFIED' ? <ShieldCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {row.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
