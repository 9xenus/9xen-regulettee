import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  Users, 
  Server, 
  Globe, 
  AlertOctagon, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare, 
  Zap, 
  Terminal,
  RefreshCcw,
  Bell
} from 'lucide-react';

const activeIncidents = [
  { 
    id: 'INC-2026-0823', 
    title: 'Regional Database Latency - EU-West', 
    severity: 'High', 
    status: 'Investigating', 
    started: '14 mins ago', 
    assigned: 'Infrastructure Team' 
  },
  { 
    id: 'INC-2026-0822', 
    title: 'Regulatory Scraper Delay (ESMA)', 
    severity: 'Medium', 
    status: 'Identified', 
    started: '42 mins ago', 
    assigned: 'Compliance Ops' 
  },
];

const maintenanceSchedule = [
  { id: 'MNT-001', service: 'Quantum Secure Vault', date: 'Aug 25, 02:00 UTC', type: 'Core Update' },
  { id: 'MNT-002', service: 'Stripe SEPA Gateway', date: 'Aug 26, 04:00 UTC', type: 'API Rotation' },
];

export const PlatformIncidentCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Platform Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'System Uptime', value: '99.998%', icon: Activity, color: 'text-emerald-500', trend: '+0.001%' },
          { label: 'Active Sessions', value: '14,208', icon: Users, color: 'text-indigo-500', trend: 'Live' },
          { label: 'Mean Time to Repair', value: '14.2 min', icon: Clock, color: 'text-slate-500', trend: '-2.4 min' },
          { label: 'Global Latency', value: '42ms', icon: Globe, color: 'text-emerald-500', trend: 'Optimized' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className={`text-[10px] font-bold uppercase ${stat.trend === 'Live' ? 'text-indigo-500' : 'text-emerald-500'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Incidents</h3>
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                View History <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                  <div className={`p-2 rounded-xl ${incident.severity === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-800">{incident.title}</h4>
                      <span className="text-[10px] font-black text-slate-400 font-mono">{incident.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <span className={`px-2 py-0.5 rounded-md ${incident.severity === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                        {incident.severity}
                      </span>
                      <span>• {incident.status}</span>
                      <span>• Started {incident.started}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">IT</div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned to: {incident.assigned}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                    Manage
                  </button>
                </div>
              ))}
              {activeIncidents.length === 0 && (
                <div className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">All Systems Nominal</h3>
                  <p className="text-sm text-slate-500">No active incidents detected in the last 24 hours.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Incident Command Ops</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><RefreshCcw className="w-4 h-4 text-slate-400" /></button>
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><Bell className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all text-left space-y-2 group">
                <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-bold">Fast-Track Response</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execute SOP-42</div>
              </button>
              <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all text-left space-y-2 group">
                <Users className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-bold">Convene War Room</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Ops Sync</div>
              </button>
              <button className="p-4 bg-rose-600 hover:bg-rose-700 rounded-xl border border-rose-500 transition-all text-left space-y-2 group">
                <AlertOctagon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <div className="text-sm font-bold">Status Update (Public)</div>
                <div className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">StatusPage.io</div>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Ops */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Maintenance Window
            </h3>
            <div className="space-y-4">
              {maintenanceSchedule.map((mnt) => (
                <div key={mnt.id} className="relative pl-4 border-l-2 border-indigo-200 space-y-1">
                  <div className="text-xs font-black text-slate-800">{mnt.service}</div>
                  <div className="text-[10px] font-bold text-indigo-600">{mnt.date}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mnt.type}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Schedule Maintenance
            </button>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-black text-emerald-900 leading-tight">All Systems Online</div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">No Degradation</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800">
                <span>Core API</span>
                <span>Operational</span>
              </div>
              <div className="w-full h-1 bg-emerald-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
