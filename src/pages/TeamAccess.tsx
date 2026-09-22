import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  X, 
  CheckCircle2, 
  FileCheck, 
  Search, 
  Filter, 
  Clock, 
  Trash2, 
  Key, 
  Settings, 
  AlertCircle, 
  Check, 
  Lock, 
  Fingerprint, 
  RefreshCcw, 
  UserX,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending' | 'Suspended';
  boundActs: string[];
  mfaEnabled: boolean;
  lastActive: string;
}

interface InvitationCode {
  id: string;
  email: string;
  role: string;
  code: string;
  expiresAt: string;
  boundActs: string[];
}

export const TeamAccess: React.FC = () => {
  const { showToast } = useNotification();
  const [showInvite, setShowInvite] = useState(false);
  const [showTokenGenerator, setShowTokenGenerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);

  // Core interactive team state
  const [team, setTeam] = useState<TeamMember[]>([
    { 
      id: 'u1', 
      name: 'Alice Smith', 
      email: 'alice@regulettee.eu', 
      role: 'Data Protection Officer', 
      status: 'Active', 
      boundActs: ['GDPR', 'EU Data Act'],
      mfaEnabled: true,
      lastActive: '5 mins ago'
    },
    { 
      id: 'u2', 
      name: 'Bob Jones', 
      email: 'bob@regulettee.eu', 
      role: 'Chief Information Security Officer', 
      status: 'Active', 
      boundActs: ['NIS2', 'CRA', 'DORA'],
      mfaEnabled: true,
      lastActive: '2 hours ago'
    },
    { 
      id: 'u3', 
      name: 'Carol White', 
      email: 'carol@regulettee.eu', 
      role: 'Auditor', 
      status: 'Pending', 
      boundActs: ['GDPR'],
      mfaEnabled: false,
      lastActive: 'Never (Invited)'
    },
    { 
      id: 'u4', 
      name: 'Dimitri Kozlov', 
      email: 'dimitri@regulettee.eu', 
      role: 'Compliance Officer', 
      status: 'Suspended', 
      boundActs: ['EU AI Act', 'NIS2'],
      mfaEnabled: true,
      lastActive: '3 days ago'
    }
  ]);

  // Invitation tracking state
  const [invitations, setInvitations] = useState<InvitationCode[]>([
    {
      id: 'inv-1',
      email: 'consultant@eulawyers.com',
      role: 'Auditor',
      code: 'LXS-9082-AUDT',
      expiresAt: 'In 23 hours',
      boundActs: ['GDPR', 'NIS2']
    }
  ]);

  // Dynamic IAM Security Logs simulation
  const [securityLogs, setSecurityLogs] = useState([
    { id: 'l1', event: 'MFA Verification Passed', user: 'alice@regulettee.eu', time: '10 mins ago', type: 'SUCCESS' },
    { id: 'l2', event: 'Sovereign Enclave Access Authorized', user: 'bob@regulettee.eu', time: '1 hour ago', type: 'SUCCESS' },
    { id: 'l3', event: 'Suspended User Attempt Blocked', user: 'dimitri@regulettee.eu', time: 'Yesterday', type: 'BLOCKED' },
    { id: 'l4', event: 'New Invitation Token Issued', user: 'System (SuperAdmin)', time: 'Yesterday', type: 'INFO' }
  ]);

  const [inviteData, setInviteData] = useState({ 
    name: '',
    email: '', 
    role: 'Compliance Officer', 
    acts: [] as string[] 
  });

  const availableActs = ['GDPR', 'EU AI Act', 'NIS2', 'EU Data Act', 'DORA', 'CRA', 'DSA', 'DMA'];

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.name) return;

    const newId = `u-${Date.now()}`;
    const newUser: TeamMember = {
      id: newId,
      name: inviteData.name,
      email: inviteData.email,
      role: inviteData.role,
      status: 'Pending',
      boundActs: inviteData.acts,
      mfaEnabled: false,
      lastActive: 'Never (Invited)'
    };

    setTeam(prev => [newUser, ...prev]);

    // Add active invitation token for client convenience
    const randomCode = `LXS-${Array.from(crypto.getRandomValues(new Uint16Array(1)))[0] % 9000 + 1000}-${inviteData.role.substring(0, 4).toUpperCase()}`;
    setInvitations(prev => [
      {
        id: `inv-${Date.now()}`,
        email: inviteData.email,
        role: inviteData.role,
        code: randomCode,
        expiresAt: 'In 72 hours',
        boundActs: inviteData.acts
      },
      ...prev
    ]);

    // Push secure compliance log
    setSecurityLogs(prev => [
      { 
        id: `l-${Date.now()}`, 
        event: `Secure Invite Dispatched to ${inviteData.email}`, 
        user: 'Active Tenant Manager', 
        time: 'Just now', 
        type: 'INFO' 
      },
      ...prev
    ]);

    setShowInvite(false);
    setInviteData({ name: '', email: '', role: 'Compliance Officer', acts: [] });
  };

  const handleRemoveMember = (id: string) => {
    const target = team.find(t => t.id === id);
    if (!target) return;

    if (confirm(`Are you sure you want to permanently revoke all access rights for ${target.name}?`)) {
      setTeam(prev => prev.filter(item => item.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);

      setSecurityLogs(prev => [
        {
          id: `l-${Date.now()}`,
          event: `Account Access REVOKED for ${target.email}`,
          user: 'Tenant Owner',
          time: 'Just now',
          type: 'REVOKE'
        },
        ...prev
      ]);
    }
  };

  const toggleStatus = (id: string, currentStatus: 'Active' | 'Pending' | 'Suspended') => {
    let nextStatus: 'Active' | 'Pending' | 'Suspended' = 'Active';
    if (currentStatus === 'Active') nextStatus = 'Suspended';
    else if (currentStatus === 'Suspended') nextStatus = 'Active';
    else if (currentStatus === 'Pending') nextStatus = 'Active';

    setTeam(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    
    // Auto-update selected view state if active
    if (selectedUser?.id === id) {
      setSelectedUser(prev => prev ? { ...prev, status: nextStatus } : null);
    }

    setSecurityLogs(prev => [
      {
        id: `l-${Date.now()}`,
        event: `State Transition to [${nextStatus.toUpperCase()}]`,
        user: team.find(t => t.id === id)?.email || 'unknown',
        time: 'Just now',
        type: 'INFO'
      },
      ...prev
    ]);
  };

  const toggleMfa = (id: string) => {
    setTeam(prev => prev.map(u => u.id === id ? { ...u, mfaEnabled: !u.mfaEnabled } : u));
    if (selectedUser?.id === id) {
      setSelectedUser(prev => prev ? { ...prev, mfaEnabled: !prev.mfaEnabled } : null);
    }

    setSecurityLogs(prev => [
      {
        id: `l-${Date.now()}`,
        event: `MFA Security Context Toggled`,
        user: team.find(t => t.id === id)?.email || 'unknown',
        time: 'Just now',
        type: 'INFO'
      },
      ...prev
    ]);
  };

  const handleRevokeInvite = (id: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
    setSecurityLogs(prev => [
      {
        id: `l-${Date.now()}`,
        event: `Invitation Access Token Revoked`,
        user: 'System',
        time: 'Just now',
        type: 'REVOKE'
      },
      ...prev
    ]);
  };

  // Perform client-side searching & filtering
  const filteredTeam = useMemo(() => {
    return team.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [team, searchQuery, roleFilter, statusFilter]);

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-8 animate-fadeIn">
      
      {/* Header section with clean premium typography and quick metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-8 h-8 text-indigo-600" />
            Workspace & Access control
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
            Manage your internal team liabilities, provision secure access roles, and assign specific 
            European Union regulatory accountability mapping across your workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowTokenGenerator(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            Temporary Token Access
          </button>
          <button 
            onClick={() => setShowInvite(true)} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Invite New Member
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 sm:gap-8">
        
        {/* Left Side: Users list and advanced filtering (Takes up 3/4 layout for full details) */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filters:</span>
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Roles</option>
                <option value="Data Protection Officer">DPO</option>
                <option value="Chief Information Security Officer">CISO</option>
                <option value="Compliance Officer">Compliance Officer</option>
                <option value="Auditor">Auditor</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Pending">Pending Invitations</option>
                <option value="Suspended">Suspended Members</option>
              </select>
            </div>
          </div>

          {/* Active Members Table View */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Workspace Team Members
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Active Seats: {team.filter(t => t.status === 'Active').length} / 10
              </span>
            </div>

            {filteredTeam.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 text-slate-400">
                  <UserX className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No matching members found</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try adjusting your search criteria or filter constraints to find specific client team members.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm divide-y divide-slate-100">
                  <thead className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-3.5">Full User Profile</th>
                      <th className="px-6 py-3.5">Standard Role</th>
                      <th className="px-6 py-3.5">Bound EU Directives</th>
                      <th className="px-6 py-3.5 text-center">MFA Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredTeam.map((member) => (
                      <tr 
                        key={member.id} 
                        onClick={() => setSelectedUser(member)}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${selectedUser?.id === member.id ? 'bg-indigo-50/30' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase shadow-sm">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{member.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200/60 rounded-lg inline-flex">
                            <Shield className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-700">{member.role}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {member.boundActs.length > 0 ? (
                              member.boundActs.map((act) => (
                                <span 
                                  key={act} 
                                  className="px-1.5 py-0.5 bg-indigo-50/60 text-indigo-700 border border-indigo-100/40 rounded text-[9px] font-bold uppercase"
                                >
                                  {act}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400 italic font-medium">None assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMfa(member.id);
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                              member.mfaEnabled 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}
                          >
                            {member.mfaEnabled ? 'Verified' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => toggleStatus(member.id, member.status)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                                member.status === 'Active' 
                                  ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50' 
                                  : member.status === 'Pending' 
                                    ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50' 
                                    : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                              }`}
                            >
                              {member.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Invitation Management Panel */}
          {invitations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Active Client Access Invitations
                </h3>
                <span className="text-[10px] font-bold text-amber-600 font-mono">{invitations.length} Pending</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">{inv.email}</span>
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase">
                          {inv.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Expires: <span className="font-bold text-slate-700">{inv.expiresAt}</span>
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 block">Invitation Access Code</span>
                        <span className="text-[11px] font-mono font-bold text-slate-800">{inv.code}</span>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(inv.code);
                          showToast('Conformity invitation code copied to clipboard!', 'success');
                        }}
                        className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded shadow-sm cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button 
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Revoke Access Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Quick Stats, Active Security Event Feeds, & User Details */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Detailed User Selection Card */}
          {selectedUser ? (
            <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-md space-y-4 animate-scaleUp">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Selected Profile</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-2 py-2">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedUser.name}</h4>
                  <p className="text-[11px] text-slate-500">{selectedUser.email}</p>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {selectedUser.role}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Security State:</span>
                  <span className={`font-bold ${
                    selectedUser.status === 'Active' ? 'text-emerald-600' : 'text-amber-500'
                  }`}>{selectedUser.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Seen active:</span>
                  <span className="text-slate-700 font-bold">{selectedUser.lastActive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authelia MFA Active:</span>
                  <span className="text-slate-700 font-bold">{selectedUser.mfaEnabled ? 'Verified' : 'Unconfigured'}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button 
                  onClick={() => toggleMfa(selectedUser.id)}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  Toggle MFA Required State
                </button>
                <button 
                  onClick={() => toggleStatus(selectedUser.id, selectedUser.status)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all border border-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-indigo-500" />
                  Cycle Account State
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-4 sm:p-5 lg:p-6 rounded-2xl text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
              <p className="text-xs font-medium leading-relaxed">
                Click on any team member in the table to display access control metrics, last active times, and toggle active credentials.
              </p>
            </div>
          )}

          {/* Real-time OIDC Keycloak & Authelia Proxy Info */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              Zero-Trust IAM Config
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              User credentials are protected using hardware keys and secure JWT claims through localized Keycloak & Authelia nodes.
            </p>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-slate-500 block uppercase">IAM Provider</span>
                  <span className="text-[10px] font-bold text-slate-300">Keycloak v24.1 (OIDC)</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase">ONLINE</span>
              </div>

              <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-slate-500 block uppercase">MFA Access Gateway</span>
                  <span className="text-[10px] font-bold text-slate-300">Authelia WebAuthn Gateway</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase">ONLINE</span>
              </div>
            </div>
          </div>

          {/* IAM Audit Logs (Highly enterprise client focused) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Workspace Identity Audit
              </h3>
              <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono uppercase">Live</span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {securityLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg flex items-start gap-2.5 transition-colors">
                  <div className={`p-1 rounded mt-0.5 ${
                    log.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                    log.type === 'BLOCKED' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Lock className="w-3 h-3" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-800 leading-normal">{log.event}</div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-medium">
                      <span>{log.user}</span>
                      <span>•</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Invite Modal Overlay */}
      <AnimatePresence>
        {showInvite && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <UserPlus className="w-4.5 h-4.5 text-indigo-600" />
                  Invite Workspace Colleague
                </h2>
                <button 
                  onClick={() => setShowInvite(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                <form onSubmit={handleInviteSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Colleague Name</label>
                      <input 
                        type="text" 
                        required 
                        value={inviteData.name} 
                        onChange={e => setInviteData({...inviteData, name: e.target.value})} 
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 bg-slate-50" 
                        placeholder="e.g. Marcus Aurelius" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Corporate Email</label>
                      <input 
                        type="email" 
                        required 
                        value={inviteData.email} 
                        onChange={e => setInviteData({...inviteData, email: e.target.value})} 
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800 bg-slate-50" 
                        placeholder="colleague@company.eu" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Assign Core Role Profile</label>
                    <select 
                      value={inviteData.role} 
                      onChange={e => setInviteData({...inviteData, role: e.target.value})} 
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all text-slate-700 bg-slate-50 cursor-pointer"
                    >
                      <option value="Compliance Officer">Compliance Officer</option>
                      <option value="Chief Information Security Officer">Chief Information Security Officer (CISO)</option>
                      <option value="Auditor">Auditor (Read-Only access)</option>
                      <option value="Data Protection Officer">Data Protection Officer (DPO)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Bind Policy Accountability Liabilities</label>
                    <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                      Select specific EU directives and rules this workspace colleague is accountable for validating inside 9Xen Regulettee.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {availableActs.map(act => (
                        <label 
                          key={act} 
                          className={`flex items-center space-x-2 text-xs text-slate-700 border rounded-xl p-2.5 cursor-pointer transition-all ${
                            inviteData.acts.includes(act) 
                              ? 'bg-indigo-50/50 border-indigo-200 text-indigo-700' 
                              : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={inviteData.acts.includes(act)}
                            onChange={(e) => {
                              if (e.target.checked) setInviteData({ ...inviteData, acts: [...inviteData.acts, act] });
                              else setInviteData({ ...inviteData, acts: inviteData.acts.filter(a => a !== act) });
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" 
                          />
                          <span className="font-bold text-[10px] uppercase tracking-wide">{act}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowInvite(false)} 
                      className="px-4 py-2 font-bold text-slate-500 hover:text-slate-800 text-xs hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 text-xs transition-all cursor-pointer"
                    >
                      Issue Identity Invite
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Temporary Token Generator Modal */}
      <AnimatePresence>
        {showTokenGenerator && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Key className="w-4.5 h-4.5 text-indigo-600" />
                  Temporary Access Tokens
                </h2>
                <button 
                  onClick={() => setShowTokenGenerator(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5 lg:p-6 space-y-4">
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Auditor Temporary Login Links</h4>
                    <p className="text-[10px] text-amber-700 leading-normal mt-1">
                      Generate high-security, cryptographically randomly bound invite keys for external legal advisors, sovereign audit boards, or regional partners.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Temporary Link Lifespan</label>
                    <select className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-slate-50 cursor-pointer">
                      <option value="1h">1 Hour (Recommended for swift verification audits)</option>
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">Target Auditor/Legal Partner email</label>
                    <input 
                      type="email" 
                      placeholder="inspector@euregulator.eu" 
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                  <button 
                    onClick={() => setShowTokenGenerator(false)} 
                    className="px-4 py-2 font-bold text-slate-500 text-xs hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    Close Panel
                  </button>
                  <button 
                    onClick={() => {
                      showToast('Cryptographic token successfully mapped! New token has been scheduled on the sovereign ledger.', 'success');
                      setShowTokenGenerator(false);
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 text-xs transition-all cursor-pointer"
                  >
                    Generate Secure Link
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
