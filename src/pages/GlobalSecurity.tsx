import React, { useState } from 'react';
import { ShieldCheck, Lock, Activity, Users, Settings, Plus, Edit2, ShieldAlert, Save, X, Check } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const INITIAL_ROLES = [
  { id: 'eu_regulator', name: 'EU Regulator', description: 'Read-only cross-tenant visibility restricted to compliance and audit ledger reports.', mfaRequired: false, timeout: '30 Minutes' },
  { id: 'tenant_admin', name: 'Admin', description: 'Tenant-level administrative access. Manages company users, security, and policies.', mfaRequired: true, timeout: '2 Hours' },
  { id: 'client', name: 'Client', description: 'Standard tenant user. Restricted to assigned vaults, tasks, and dashboards.', mfaRequired: false, timeout: '2 Hours' }
];

const CAPABILITIES = [
  { group: 'System & Infrastructure', items: ['System Architecture Settings', 'Global Incident Response', 'Feature Flags Control'] },
  { group: 'Tenant Management', items: ['Tenant Provisioning', 'Billing & Entitlements', 'Cross-Tenant Audit Ledger'] },
  { group: 'Security & Access', items: ['Platform MFA Enforcement', 'Role & Permission Editing', 'User Provisioning'] },
  { group: 'Compliance & Legal', items: ['EU Compliance Configurations', 'Official Reports Generation', 'Evidence Vault Write'] },
  { group: 'Operations', items: ['Actionable Tasks', 'Client Dashboard Access', 'API Key Generation'] }
];

// Mapping Role ID to Permissions (true, false, or 'read-only')
const INITIAL_PERMISSIONS_MATRIX: Record<string, Record<string, string | boolean>> = {
  eu_regulator: {
    'System Architecture Settings': false, 'Global Incident Response': false, 'Feature Flags Control': false,
    'Tenant Provisioning': false, 'Billing & Entitlements': false, 'Cross-Tenant Audit Ledger': 'read-only',
    'Platform MFA Enforcement': false, 'Role & Permission Editing': false, 'User Provisioning': false,
    'EU Compliance Configurations': 'read-only', 'Official Reports Generation': 'read-only', 'Evidence Vault Write': 'read-only',
    'Actionable Tasks': false, 'Client Dashboard Access': false, 'API Key Generation': false
  },
  tenant_admin: {
    'System Architecture Settings': false, 'Global Incident Response': false, 'Feature Flags Control': false,
    'Tenant Provisioning': false, 'Billing & Entitlements': false, 'Cross-Tenant Audit Ledger': false,
    'Platform MFA Enforcement': false, 'Role & Permission Editing': true, 'User Provisioning': true,
    'EU Compliance Configurations': true, 'Official Reports Generation': true, 'Evidence Vault Write': true,
    'Actionable Tasks': true, 'Client Dashboard Access': true, 'API Key Generation': true
  },
  client: {
    'System Architecture Settings': false, 'Global Incident Response': false, 'Feature Flags Control': false,
    'Tenant Provisioning': false, 'Billing & Entitlements': false, 'Cross-Tenant Audit Ledger': false,
    'Platform MFA Enforcement': false, 'Role & Permission Editing': false, 'User Provisioning': false,
    'EU Compliance Configurations': false, 'Official Reports Generation': false, 'Evidence Vault Write': true,
    'Actionable Tasks': true, 'Client Dashboard Access': true, 'API Key Generation': false
  }
};

export const GlobalSecurity: React.FC = () => {
  const { showToast } = useNotification();
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [activeRole, setActiveRole] = useState(roles[0].id);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS_MATRIX);
  
  const [isEditing, setIsEditing] = useState(false);
  const [draftPermissions, setDraftPermissions] = useState<Record<string, string | boolean>>({});
  
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ name: '', description: '' });

  const currentRole = roles.find(r => r.id === activeRole) || roles[0];

  const getPermissionStatus = (item: string) => {
    if (isEditing) {
        return draftPermissions[item] ?? false;
    }
    return permissions[activeRole]?.[item] ?? false;
  };

  const handleEditClick = () => {
    setDraftPermissions({ ...permissions[activeRole] });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftPermissions({});
  };

  const handleSaveEdit = () => {
    setPermissions(prev => ({
      ...prev,
      [activeRole]: { ...draftPermissions }
    }));
    setIsEditing(false);
    showToast(`Permissions updated for ${currentRole.name}`, 'success');
  };

  const cyclePermission = (item: string) => {
    if (!isEditing) return;
    
    setDraftPermissions(prev => {
        const current = prev[item] ?? false;
        let next: string | boolean = false;
        
        if (current === false) next = 'read-only';
        else if (current === 'read-only') next = true;
        else if (current === true) next = false;
        
        return { ...prev, [item]: next };
    });
  };

  const toggleMfa = () => {
    setRoles(prev => prev.map(r => 
        r.id === activeRole ? { ...r, mfaRequired: !r.mfaRequired } : r
    ));
    showToast(`MFA requirement updated for ${currentRole.name}`, 'success');
  };

  const updateTimeout = (timeout: string) => {
    setRoles(prev => prev.map(r => 
        r.id === activeRole ? { ...r, timeout } : r
    ));
    showToast(`Session timeout updated to ${timeout} for ${currentRole.name}`, 'success');
  };

  const handleCreateRole = () => {
    if (!newRoleData.name) {
      showToast('Role name is required.', 'error');
      return;
    }
    const newId = newRoleData.name.toLowerCase().replace(/\s+/g, '_');
    
    // Check for duplicates
    if (roles.some(r => r.id === newId)) {
        showToast('Role already exists.', 'error');
        return;
    }

    const newRole = {
      id: newId,
      name: newRoleData.name,
      description: newRoleData.description || 'Custom role.',
      mfaRequired: false,
      timeout: '2 Hours'
    };

    setRoles(prev => [...prev, newRole]);
    setPermissions(prev => ({
      ...prev,
      [newId]: {} // Start with empty permissions
    }));
    
    setIsCreatingRole(false);
    setNewRoleData({ name: '', description: '' });
    setActiveRole(newId);
    showToast(`Created custom role: ${newRoleData.name}`, 'success');
  };

  return (
    <div className="space-y-6 relative">
      <div className="border-b border-slate-200 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <ShieldCheck className="w-8 h-8 mr-3 text-indigo-600" />
            Global Security & RBAC
          </h1>
          <p className="text-slate-500 mt-1">Platform-wide Role-Based Access Control matrix and capability definitions.</p>
        </div>
        <button 
          onClick={() => setIsCreatingRole(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">

        <div className="md:col-span-1 space-y-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 px-2">Role Definitions</h2>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => {
                if (isEditing) handleCancelEdit();
                setActiveRole(role.id);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${
                activeRole === role.id 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-sm' 
                  : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold">{role.name}</div>
              {activeRole === role.id && (
                <div className="text-xs text-indigo-600/80 mt-1 leading-relaxed">
                  {role.description}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
            <div className={`p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 ${isEditing ? 'bg-indigo-50/50' : 'bg-slate-50'}`}>
              <div className="flex items-center">
                <ShieldAlert className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-bold text-slate-800">Capability Matrix: {currentRole?.name}</h2>
              </div>
              
              {isEditing ? (
                 <div className="flex items-center space-x-2">
                    <button onClick={handleCancelEdit} className="text-sm font-medium px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors flex items-center">
                      <X className="w-4 h-4 mr-1.5" /> Cancel
                    </button>
                    <button onClick={handleSaveEdit} className="text-sm font-medium px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
                      <Check className="w-4 h-4 mr-1.5" /> Save Changes
                    </button>
                 </div>
              ) : (
                <button onClick={handleEditClick} className="text-sm font-medium px-3 py-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors flex items-center border border-transparent hover:border-indigo-100">
                  <Edit2 className="w-4 h-4 mr-1.5" /> Modify Permissions
                </button>
              )}
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-700">Enterprise Capability</th>
                    <th className="px-6 py-4 font-bold text-slate-700 w-32 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CAPABILITIES.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      <tr className="bg-slate-50/50">
                        <td colSpan={2} className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          {group.group}
                        </td>
                      </tr>
                      {group.items.map((item, iIdx) => {
                        const status = getPermissionStatus(item);
                        return (
                          <tr key={iIdx} className={`transition ${isEditing ? 'hover:bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
                            <td className="px-6 py-3 text-slate-700 font-medium">{item}</td>
                            <td className="px-6 py-3 text-center">
                              <button 
                                disabled={!isEditing}
                                onClick={() => cyclePermission(item)}
                                className={`inline-flex px-2 py-1 rounded text-xs font-bold w-24 justify-center transition-all ${
                                    isEditing ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-indigo-300' : 'cursor-default'
                                } ${
                                    status === true ? 'bg-emerald-100 text-emerald-700' :
                                    status === false ? 'bg-slate-100 text-slate-500' :
                                    'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {status === true ? 'GRANTED' : status === false ? 'DENIED' : 'READ'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1">
              <div className="flex items-center space-x-3 mb-2">
                 <Lock className="w-5 h-5 text-indigo-600" />
                 <h3 className="font-bold text-slate-800">MFA Policy</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Enforce Multi-Factor Authentication for this role.</p>
              <div className="flex items-center space-x-3">
                 <button 
                   onClick={toggleMfa}
                   className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${currentRole.mfaRequired ? 'bg-emerald-500' : 'bg-slate-200'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${currentRole.mfaRequired ? 'translate-x-6' : 'translate-x-1'}`}></div>
                 </button>
                 <span className="text-sm font-bold text-slate-700">
                    {currentRole.mfaRequired ? 'Required' : 'Optional'}
                 </span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1">
              <div className="flex items-center space-x-3 mb-2">
                 <Activity className="w-5 h-5 text-indigo-600" />
                 <h3 className="font-bold text-slate-800">Session Timeout</h3>
              </div>
              <p className="text-sm text-slate-500 mb-3">Idle timeout before re-authentication.</p>
              <select 
                value={currentRole.timeout}
                onChange={(e) => updateTimeout(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              >
                 <option value="15 Minutes">15 Minutes</option>
                 <option value="30 Minutes">30 Minutes</option>
                 <option value="1 Hour">1 Hour</option>
                 <option value="2 Hours">2 Hours</option>
                 <option value="4 Hours">4 Hours</option>
                 <option value="8 Hours">8 Hours</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Custom Role Modal */}
      {isCreatingRole && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-extrabold text-slate-800">Create Custom Role</h2>
              <button 
                onClick={() => setIsCreatingRole(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-5 lg:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Role Name</label>
                <input 
                  type="text" 
                  value={newRoleData.name}
                  onChange={(e) => setNewRoleData({ ...newRoleData, name: e.target.value })}
                  placeholder="e.g. Regional Data Privacy Officer"
                  className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
                <textarea 
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                  placeholder="Describe the responsibilities and access level of this role..."
                  rows={3}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3 mt-auto">
              <button 
                onClick={() => setIsCreatingRole(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateRole}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center shadow-sm"
              >
                <Check className="w-4 h-4 mr-2" />
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
