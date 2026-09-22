
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Search, 
  UserPlus,
  RefreshCw,
  Info,
  ShieldCheck,
  Zap,
  MoreVertical,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserPermission {
  key: string;
  action: string;
}

export const RBACManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'roles' | 'assignments'>('roles');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/v1/rbac-admin/roles');
      const data = await res.json();
      setRoles(data);
    } catch (e) {
      console.error('Failed to fetch roles', e);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setLoading(true);
    await fetch('/api/v1/rbac-admin/seed', { method: 'POST' });
    await fetchRoles();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-900 text-white rounded-xl shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">RBAC & Permissions</h2>
              <p className="text-gray-500 mt-1">Manage platform-wide roles and modular access control.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={seedData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center transition-all"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Sync Schema
            </button>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black shadow-lg transition-all flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex p-1 bg-gray-100 rounded-xl mb-8 w-fit">
          <button 
            onClick={() => setActiveView('roles')}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-lg transition-all",
              activeView === 'roles' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Role Definitions
          </button>
          <button 
            onClick={() => setActiveView('assignments')}
            className={cn(
              "px-6 py-2 text-sm font-bold rounded-lg transition-all",
              activeView === 'assignments' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            User Assignments
          </button>
        </div>

        {activeView === 'roles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-start space-x-5">
                  <div className={cn(
                    "p-4 rounded-2xl",
                    role.name === 'PLATFORM_ADMIN' ? "bg-red-50 text-red-600" :
                    role.name === 'COMPLIANCE_OFFICER' ? "bg-blue-50 text-blue-600" :
                    role.name === 'SECURITY_LEAD' ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">{role.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{role.description}</p>
                    
                    <div className="mt-6 flex items-center space-x-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center mt-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> System Role
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inheritance</span>
                        <span className="text-xs font-bold text-gray-900 mt-1">Immutable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search users by ID or Email..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Role
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Tenant Scope</th>
                    <th className="px-6 py-4">Assigned Role</th>
                    <th className="px-6 py-4">Last Modified</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { id: '1', user: 'admin_user', tenant: '9Xen Regulettee Global', role: 'PLATFORM_ADMIN', date: '2h ago' },
                    { id: '2', user: 'compliance_lead', tenant: '9Xen Regulettee EU', role: 'COMPLIANCE_OFFICER', date: '1d ago' },
                    { id: '3', user: 'security_auditor', tenant: '9Xen Regulettee APAC', role: 'AUDITOR', date: '4h ago' },
                  ].map((row) => (
                    <tr key={row.id} className="group hover:bg-gray-50/50 transition-all">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {row.user[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{row.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 font-medium">{row.tenant}</td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-black uppercase tracking-wider px-2 py-1 bg-gray-100 rounded">
                          {row.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-400 font-medium">{row.date}</td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-12 p-8 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-6">
          <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 tracking-tight">Active Enforcement Monitoring</h4>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              RBAC enforcement is currently active on **Enterprise SaaS** and **Financial Forecasting** modules. 
              The Auditor role has been automatically provisioned with read-only sovereign locks.
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border border-blue-200 text-[10px] font-black uppercase text-blue-600">
                <Activity className="w-3 h-3" />
                <span>42 Blocked Access Attempts (24h)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
