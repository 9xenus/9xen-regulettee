import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  ShieldAlert, 
  FileText, 
  Plus, 
  ChevronRight, 
  MoreVertical, 
  Users, 
  Lock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Department {
  id: string;
  name: string;
  riskOwner: string;
  memberCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'AUDITING' | 'RESTRICTED';
}

export const InternalGovernance: React.FC = () => {
  const [departments] = useState<Department[]>([
    { id: '1', name: 'Global Marketing', riskOwner: 'Sarah Jenkins', memberCount: 42, riskLevel: 'MEDIUM', status: 'ACTIVE' },
    { id: '2', name: 'R&D Lab (Alpha)', riskOwner: 'Dr. Victor Strauss', memberCount: 12, riskLevel: 'CRITICAL', status: 'AUDITING' },
    { id: '3', name: 'Human Resources', riskOwner: 'Maria Lopez', memberCount: 8, riskLevel: 'HIGH', status: 'ACTIVE' },
    { id: '4', name: 'Public Relations', riskOwner: 'James Bond', memberCount: 15, riskLevel: 'LOW', status: 'ACTIVE' },
  ]);

  const [activeSubTab, setActiveSubTab] = useState<'hierarchy' | 'policies'>('hierarchy');

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sovereign Tenant Governance</h2>
          <p className="text-slate-500 text-sm mt-1">Manage internal organizational boundaries and supplementary compliance guidelines.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('hierarchy')}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              activeSubTab === 'hierarchy' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Hierarchy
          </button>
          <button 
            onClick={() => setActiveSubTab('policies')}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              activeSubTab === 'policies' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Policy Overrides
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'hierarchy' && (
          <motion.div 
            key="hierarchy"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Internal Depts', value: departments.length, icon: Network, color: 'indigo' },
                { label: 'Risk Owners', value: 4, icon: ShieldAlert, color: 'rose' },
                { label: 'Total Members', value: 77, icon: Users, color: 'blue' },
                { label: 'Internal Policies', value: 12, icon: FileText, color: 'emerald' },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <div className={`w-8 h-8 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-3`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Departmental Risk Mapping</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 transition-colors uppercase tracking-widest">
                  <Plus className="w-3 h-3" /> Add Department
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {departments.map((dept) => (
                  <div key={dept.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        dept.riskLevel === 'CRITICAL' ? "bg-rose-50 border-rose-100 text-rose-600" :
                        dept.riskLevel === 'HIGH' ? "bg-amber-50 border-amber-100 text-amber-600" :
                        "bg-slate-50 border-slate-100 text-slate-600"
                      )}>
                        <Network className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-medium text-slate-500">Owner: {dept.riskOwner}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[10px] font-medium text-slate-500">{dept.memberCount} personnel</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                          dept.riskLevel === 'CRITICAL' ? "bg-rose-50 border-rose-100 text-rose-600" :
                          dept.riskLevel === 'HIGH' ? "bg-amber-50 border-amber-100 text-amber-600" :
                          "bg-emerald-50 border-emerald-100 text-emerald-600"
                        )}>
                          {dept.riskLevel} RISK
                        </span>
                        <div className="text-[9px] text-slate-400 mt-1 font-bold">Last Audit: 2d ago</div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'policies' && (
          <motion.div 
            key="policies"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-6 bg-indigo-900 border border-indigo-800 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <Scale className="w-5 h-5 text-indigo-300" />
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Sovereign Supplement Engine</span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">Internal Policy Overrides</h3>
                  <p className="text-indigo-200/60 text-xs mt-2 max-w-lg">
                    Create organization-specific guidelines that supplement master EU directives. These rules apply only within your tenant and are logged as "Sovereign Deviations."
                  </p>
                </div>
                <button className="px-6 py-3 bg-white text-indigo-900 font-black text-[10px] rounded-xl hover:bg-indigo-50 transition-all shadow-lg uppercase tracking-widest whitespace-nowrap">
                  Draft New Supplement
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  title: 'Internal Data Retention Policy', 
                  desc: 'Override master 10-year rule to 7-year purging for marketing logs.', 
                  status: 'ACTIVE',
                  impact: 'MODERATE'
                },
                { 
                  title: 'BYOD Security Protocol', 
                  desc: 'Require hardware key verification for all personal device enclave access.', 
                  status: 'ENFORCED',
                  impact: 'HIGH'
                },
              ].map((policy) => (
                <div key={policy.title} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      <Lock className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100">
                      {policy.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{policy.title}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{policy.desc}</p>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Impact: {policy.impact}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
