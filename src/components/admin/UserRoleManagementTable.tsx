import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Sliders,
  RotateCcw,
  Check,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  Settings,
  Building,
  Globe,
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  UserX,
  Activity,
  UserPlus
} from 'lucide-react';
import { useAuth, ManagedUser, PermissionDefinition, AVAILABLE_PERMISSIONS } from '../../context/AuthContext';

const ROLE_DEFINITIONS: Record<string, { label: string; color: string; badgeBg: string; border: string; desc: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/60',
    desc: 'Unrestricted sovereign root access across all clusters, tenants, and cryptography engines'
  },
  ADMIN: {
    label: 'Platform Admin',
    color: 'text-indigo-700 dark:text-indigo-300',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    desc: 'Full administrative controls, tenancy management, telemetry and policy configuration'
  },
  COMPLIANCE_OFFICER: {
    label: 'Compliance Lead',
    color: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    desc: 'Statutory policy definitions, violation monitoring, zk-proof validation and audit reports'
  },
  EU_REGULATOR: {
    label: 'EU Regulator',
    color: 'text-blue-700 dark:text-blue-300',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800/60',
    desc: 'Official oversight, B2G reporting gateway access, statutory enforcement notices'
  },
  REGULATOR: {
    label: 'Regulator Officer',
    color: 'text-sky-700 dark:text-sky-300',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-800/60',
    desc: 'Regulatory inquiry review, statutory reports, and inspection telemetry'
  },
  LAWYER: {
    label: 'Legal Counsel',
    color: 'text-purple-700 dark:text-purple-300',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800/60',
    desc: 'Contract management, forensic evidence vault, case law intelligence & legal filings'
  },
  LEGAL_CONSULTANT: {
    label: 'Legal Consultant',
    color: 'text-violet-700 dark:text-violet-300',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-200 dark:border-violet-800/60',
    desc: 'Advisory legal dossiers and compliance evidence review'
  },
  TENANT_OWNER: {
    label: 'Tenant Owner',
    color: 'text-teal-700 dark:text-teal-300',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-200 dark:border-teal-800/60',
    desc: 'Enterprise tenant governance, billing allocation, team seats and sovereignty settings'
  },
  CLIENT: {
    label: 'Enterprise Client',
    color: 'text-slate-700 dark:text-slate-300',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-300 dark:border-slate-700',
    desc: 'Client compliance workspace, task checklist execution, and document uploads'
  },
  AUDITOR: {
    label: 'Security Auditor',
    color: 'text-cyan-700 dark:text-cyan-300',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-200 dark:border-cyan-800/60',
    desc: 'Read-only telemetry streams, evidence ledger inspection, and certification exports'
  }
};

// High-frequency direct permission toggles to show directly inside the table row
const QUICK_TOGGLE_PERMISSIONS: { key: string; label: string; shortLabel: string; icon: string }[] = [
  { key: 'read:admin', label: 'Admin Telemetry', shortLabel: 'Admin', icon: 'Shield' },
  { key: 'manage:users', label: 'User Admin', shortLabel: 'Users', icon: 'Users' },
  { key: 'manage:policies', label: 'Policy Engine', shortLabel: 'Policy', icon: 'FileText' },
  { key: 'verify:proofs', label: 'zk-Proofs', shortLabel: 'Proofs', icon: 'Key' },
  { key: 'view:violations', label: 'Violation Stream', shortLabel: 'Alerts', icon: 'ShieldAlert' },
  { key: 'view:b2g_center', label: 'B2G Gateway', shortLabel: 'B2G', icon: 'Globe' },
  { key: 'view:vault', label: 'HSM Vault', shortLabel: 'Vault', icon: 'Lock' },
  { key: 'billing:manage', label: 'Billing Control', shortLabel: 'Billing', icon: 'Settings' }
];

export const UserRoleManagementTable: React.FC = () => {
  const {
    role: activeUserRole,
    user: activeUser,
    managedUsers,
    rolePermissions,
    availablePermissions,
    updateUserRole,
    toggleUserPermission,
    updateUserPermissions,
    resetUserPermissions,
    updateUserStatus,
    toggleRolePermission,
    updateRolePermissions,
    resetRolePermissions,
    getUserEffectivePermissions,
    refreshManagedUsers,
  } = useAuth();

  // State controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedPermissionFilter, setSelectedPermissionFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'users' | 'role_matrix' | 'access_simulation'>('users');
  const [inspectingUser, setInspectingUser] = useState<ManagedUser | null>(null);
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Access Simulator State
  const [simUserId, setSimUserId] = useState<string>('');
  const [simPermissionKey, setSimPermissionKey] = useState<string>('manage:policies');

  const isSuperAdmin = activeUserRole === 'SUPER_ADMIN' || activeUserRole === 'ADMIN';

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return managedUsers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.tenantName && u.tenantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRoleFilter === 'ALL' || u.role.toUpperCase() === selectedRoleFilter.toUpperCase();
      const matchesStatus = selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter;

      let matchesPermission = true;
      if (selectedPermissionFilter !== 'ALL') {
        const effective = getUserEffectivePermissions(u);
        matchesPermission = effective.includes('*') || effective.includes(selectedPermissionFilter);
      }

      return matchesSearch && matchesRole && matchesStatus && matchesPermission;
    });
  }, [managedUsers, searchQuery, selectedRoleFilter, selectedStatusFilter, selectedPermissionFilter, getUserEffectivePermissions]);

  // Statistics
  const stats = useMemo(() => {
    const total = managedUsers.length;
    const active = managedUsers.filter((u) => u.status === 'ACTIVE').length;
    const superAdmins = managedUsers.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length;
    const complianceAndRegs = managedUsers.filter((u) =>
      ['COMPLIANCE_OFFICER', 'EU_REGULATOR', 'REGULATOR', 'AUDITOR'].includes(u.role)
    ).length;
    const withCustomOverrides = managedUsers.filter((u) => (u.customPermissions && u.customPermissions.length > 0) || (u.revokedPermissions && u.revokedPermissions.length > 0)).length;

    return { total, active, superAdmins, complianceAndRegs, withCustomOverrides };
  }, [managedUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshManagedUsers();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Check if a permission is active for a given user
  const isPermissionActiveForUser = (user: ManagedUser, permKey: string): { active: boolean; source: 'WILDCARD' | 'CUSTOM_GRANT' | 'ROLE_INHERITED' | 'REVOKED' | 'INACTIVE' } => {
    if (user.role === 'SUPER_ADMIN') {
      return { active: true, source: 'WILDCARD' };
    }

    if (user.revokedPermissions?.includes(permKey)) {
      return { active: false, source: 'REVOKED' };
    }

    if (user.customPermissions?.includes(permKey)) {
      return { active: true, source: 'CUSTOM_GRANT' };
    }

    const rolePerms = rolePermissions[user.role] || [];
    if (rolePerms.includes('*')) {
      return { active: true, source: 'WILDCARD' };
    }

    if (rolePerms.includes(permKey)) {
      return { active: true, source: 'ROLE_INHERITED' };
    }

    return { active: false, source: 'INACTIVE' };
  };

  return (
    <div id="user-role-management-interface" className="space-y-6">
      {/* Top Banner & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                User Roles & Permissions Control Center
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Granular RBAC matrix, direct permission toggling, and role-override governance
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            id="refresh-users-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              id="tab-user-directory"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Table</span>
            </button>
            <button
              id="tab-role-matrix"
              onClick={() => setActiveTab('role_matrix')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'role_matrix'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Role Matrix</span>
            </button>
            <button
              id="tab-access-sim"
              onClick={() => setActiveTab('access_simulation')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'access_simulation'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Auth Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Permission Status Indicator */}
      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Read-Only Administrative Mode:</span> You are currently viewing user roles with role{' '}
            <span className="font-mono font-bold uppercase">{activeUserRole}</span>. Live modifications are restricted to{' '}
            <span className="font-mono font-bold">SUPER_ADMIN</span> and <span className="font-mono font-bold">ADMIN</span> accounts.
          </div>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Managed Users</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">({stats.active} Active)</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Admin & SuperAdmins</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.superAdmins}</span>
            <span className="text-xs text-slate-400">Root Authority</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Compliance & Oversight</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.complianceAndRegs}</span>
            <span className="text-xs text-slate-400">Auditors / B2G</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Custom Overrides</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.withCustomOverrides}</span>
            <span className="text-xs text-purple-600 dark:text-purple-400">Explicit Grants</span>
          </div>
        </div>
      </div>

      {/* TAB 1: USERS DIRECTORY & INTERACTIVE ROLE MANAGEMENT TABLE */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-users-input"
                type="text"
                placeholder="Search user, email, tenant, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Role:</span>
                <select
                  id="filter-role-select"
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Roles</option>
                  {Object.keys(ROLE_DEFINITIONS).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_DEFINITIONS[r].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                <select
                  id="filter-status-select"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING_KYC">Pending KYC</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="QUARANTINED">Quarantined</option>
                </select>
              </div>

              {/* Permission Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Has Perm:</span>
                <select
                  id="filter-permission-select"
                  value={selectedPermissionFilter}
                  onChange={(e) => setSelectedPermissionFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">Any Permission</option>
                  {availablePermissions.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label} ({p.key})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table id="user-roles-table" className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    <th className="py-3.5 px-4">User & Identity</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Direct Permission Toggles</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredUsers.map((u) => {
                    const roleInfo = ROLE_DEFINITIONS[u.role] || {
                      label: u.role,
                      color: 'text-slate-700 dark:text-slate-300',
                      badgeBg: 'bg-slate-100 dark:bg-slate-800',
                      border: 'border-slate-300 dark:border-slate-700',
                      desc: ''
                    };
                    const effectivePerms = getUserEffectivePermissions(u);
                    const isWildcard = effectivePerms.includes('*') || u.role === 'SUPER_ADMIN';
                    const hasOverrides = (u.customPermissions && u.customPermissions.length > 0) || (u.revokedPermissions && u.revokedPermissions.length > 0);

                    return (
                      <tr
                        key={u.id}
                        id={`user-row-${u.id}`}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* 1. User & Identity */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-semibold text-xs shadow-sm flex-shrink-0">
                              {u.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white truncate">
                                  {u.name}
                                </span>
                                {activeUser && (activeUser.id === u.id || activeUser.email === u.email) && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {u.email}
                              </div>
                              {u.tenantName && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                  <Building className="w-3 h-3" />
                                  <span className="truncate">{u.tenantName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Role Selector Dropdown */}
                        <td className="py-4 px-4">
                          <div className="space-y-1.5">
                            <div className="relative inline-block">
                              <select
                                id={`role-select-${u.id}`}
                                disabled={!isSuperAdmin}
                                value={u.role}
                                onChange={(e) => updateUserRole(u.id, e.target.value)}
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${roleInfo.badgeBg} ${roleInfo.color} ${roleInfo.border} ${
                                  !isSuperAdmin ? 'opacity-90 cursor-not-allowed' : 'hover:brightness-95'
                                }`}
                              >
                                {Object.keys(ROLE_DEFINITIONS).map((r) => (
                                  <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                    {ROLE_DEFINITIONS[r].label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>

                            {/* Overrides Badge */}
                            {hasOverrides && (
                              <div className="flex items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>Custom Overrides</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Direct Permission Toggles */}
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            {isWildcard ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Full Root Wildcard (*) - All Permissions Granted</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 max-w-lg">
                                {QUICK_TOGGLE_PERMISSIONS.map((p) => {
                                  const status = isPermissionActiveForUser(u, p.key);
                                  const isActive = status.active;

                                  return (
                                    <button
                                      key={p.key}
                                      id={`toggle-perm-${u.id}-${p.key.replace(':', '-')}`}
                                      disabled={!isSuperAdmin}
                                      onClick={() => toggleUserPermission(u.id, p.key)}
                                      title={`${p.label} (${p.key}): ${
                                        isActive ? 'Active (' + status.source + ')' : 'Inactive'
                                      }. Click to toggle.`}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                                        isActive
                                          ? status.source === 'CUSTOM_GRANT'
                                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700 shadow-xs'
                                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                          : status.source === 'REVOKED'
                                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 line-through border border-rose-200 dark:border-rose-900 opacity-60'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 opacity-50 hover:opacity-100'
                                      } ${!isSuperAdmin ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                    >
                                      {isActive ? (
                                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                                      ) : (
                                        <X className="w-2.5 h-2.5 text-slate-400" />
                                      )}
                                      <span>{p.shortLabel}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                              <span>
                                {isWildcard ? 'All 25+' : effectivePerms.length} Active Permissions
                              </span>
                              <span>•</span>
                              <button
                                id={`open-matrix-btn-${u.id}`}
                                onClick={() => setInspectingUser(u)}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-0.5"
                              >
                                <span>Granular Matrix ({availablePermissions.length})</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 4. Account Status */}
                        <td className="py-4 px-4 text-center">
                          <select
                            id={`status-select-${u.id}`}
                            disabled={!isSuperAdmin}
                            value={u.status}
                            onChange={(e) => updateUserStatus(u.id, e.target.value as any)}
                            className={`text-[11px] font-semibold px-2 py-1 rounded-md border appearance-none text-center cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : u.status === 'PENDING_KYC'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            } ${!isSuperAdmin ? 'cursor-not-allowed' : ''}`}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING_KYC">Pending KYC</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="QUARANTINED">Quarantined</option>
                          </select>
                        </td>

                        {/* 5. Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`inspect-user-btn-${u.id}`}
                              onClick={() => setInspectingUser(u)}
                              title="Inspect Full Permissions Matrix"
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </button>

                            {hasOverrides && (
                              <button
                                id={`reset-overrides-btn-${u.id}`}
                                disabled={!isSuperAdmin}
                                onClick={() => resetUserPermissions(u.id)}
                                title="Reset User to Role Defaults"
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-medium">No users matched your filter criteria.</p>
                        <p className="text-xs text-slate-400 mt-1">Try broadening your search or resetting filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL ROLE PERMISSIONS MATRIX */}
      {activeTab === 'role_matrix' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Global Role Permission Archetypes
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Configure the base permission bundles automatically inherited by users assigned to each role.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  id="reset-all-roles-btn"
                  onClick={() => resetRolePermissions()}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Roles to Sovereign Defaults</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(ROLE_DEFINITIONS).map((roleKey) => {
                const role = ROLE_DEFINITIONS[roleKey];
                const perms = rolePermissions[roleKey] || [];
                const isSuper = roleKey === 'SUPER_ADMIN';

                return (
                  <div
                    key={roleKey}
                    id={`role-card-${roleKey}`}
                    className="p-5 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${role.badgeBg} ${role.color} ${role.border}`}>
                            {role.label}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">({roleKey})</span>
                        </div>

                        {isSuper ? (
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Wildcard (*)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {perms.length} Permissions
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{role.desc}</p>

                      <div className="space-y-1.5 mb-4">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Active Base Permissions:
                        </div>
                        {isSuper ? (
                          <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/60">
                            Unrestricted sovereign root bypass enabled across all microservices and database schemas.
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {perms.map((p) => (
                              <span
                                key={p}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono"
                              >
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                                <span>{p}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isSuper && isSuperAdmin && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <button
                          id={`reset-role-btn-${roleKey}`}
                          onClick={() => resetRolePermissions(roleKey)}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Default</span>
                        </button>

                        <div className="text-xs text-slate-400">
                          {managedUsers.filter((u) => u.role === roleKey).length} users assigned
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTHENTICATION & ACCESS SIMULATOR */}
      {activeTab === 'access_simulation' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Live RBAC Authorization Simulator
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Test and verify whether a specific user is authorized to perform an administrative action or view a sovereign component.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Select Target User:
                  </label>
                  <select
                    id="sim-user-select"
                    value={simUserId}
                    onChange={(e) => setSimUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Select a user...</option>
                    {managedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — [{u.role}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    Select Required Permission:
                  </label>
                  <select
                    id="sim-perm-select"
                    value={simPermissionKey}
                    onChange={(e) => setSimPermissionKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {availablePermissions.map((p) => (
                      <option key={p.key} value={p.key}>
                        [{p.category}] {p.label} ({p.key})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Simulation Result */}
              <div>
                {(() => {
                  const targetUser = managedUsers.find((u) => u.id === simUserId);
                  if (!targetUser) {
                    return (
                      <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-slate-400 text-sm">
                        Select a user to simulate access decision in real time.
                      </div>
                    );
                  }

                  const effective = getUserEffectivePermissions(targetUser);
                  const isAllowed = effective.includes('*') || effective.includes(simPermissionKey);
                  const status = isPermissionActiveForUser(targetUser, simPermissionKey);

                  return (
                    <div
                      id="sim-result-box"
                      className={`p-6 rounded-xl border flex flex-col justify-between ${
                        isAllowed
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          {isAllowed ? (
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                              <XCircle className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div
                              className={`text-lg font-bold ${
                                isAllowed
                                  ? 'text-emerald-800 dark:text-emerald-200'
                                  : 'text-rose-800 dark:text-rose-200'
                              }`}
                            >
                              {isAllowed ? 'ACCESS GRANTED (200 OK)' : 'ACCESS DENIED (403 FORBIDDEN)'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Resolution Source: <span className="font-mono font-bold">{status.source}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-4 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                          <div>
                            <span className="font-semibold">Subject:</span> {targetUser.name} ({targetUser.email})
                          </div>
                          <div>
                            <span className="font-semibold">Active Role:</span> {targetUser.role}
                          </div>
                          <div>
                            <span className="font-semibold">Evaluated Permission:</span>{' '}
                            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-indigo-600 dark:text-indigo-400">
                              {simPermissionKey}
                            </code>
                          </div>
                          <div>
                            <span className="font-semibold">Total Effective Perms:</span> {effective.includes('*') ? 'All (*)' : effective.length}
                          </div>
                        </div>
                      </div>

                      {isSuperAdmin && (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                          <button
                            id="toggle-sim-perm-btn"
                            onClick={() => toggleUserPermission(targetUser.id, simPermissionKey)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            {isAllowed ? 'Revoke This Permission' : 'Grant This Permission'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRANULAR PERMISSIONS MATRIX MODAL / DRAWER */}
      <AnimatePresence>
        {inspectingUser && (
          <div
            id="granular-matrix-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {inspectingUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{inspectingUser.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-medium text-slate-600 dark:text-slate-300">
                        {inspectingUser.role}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {inspectingUser.email} • ID: <span className="font-mono">{inspectingUser.id}</span>
                    </p>
                  </div>
                </div>

                <button
                  id="close-matrix-modal-btn"
                  onClick={() => setInspectingUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filters */}
              <div className="px-6 py-3 bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['ALL', 'ADMIN', 'COMPLIANCE', 'LEGAL', 'CLIENT', 'AUDIT', 'SECURITY'].map((cat) => (
                    <button
                      key={cat}
                      id={`filter-cat-${cat}`}
                      onClick={() => setMatrixCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        matrixCategoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {isSuperAdmin && (
                  <button
                    id="modal-reset-user-perms"
                    onClick={() => {
                      resetUserPermissions(inspectingUser.id);
                      setInspectingUser({ ...inspectingUser, customPermissions: [], revokedPermissions: [] });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Overrides</span>
                  </button>
                )}
              </div>

              {/* Matrix Scrollable List */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1">
                {availablePermissions
                  .filter((p) => matrixCategoryFilter === 'ALL' || p.category === matrixCategoryFilter)
                  .map((perm) => {
                    const status = isPermissionActiveForUser(inspectingUser, perm.key);
                    const isActive = status.active;

                    return (
                      <div
                        key={perm.key}
                        id={`perm-row-${perm.key.replace(':', '-')}`}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                          isActive
                            ? status.source === 'CUSTOM_GRANT'
                              ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
                              : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                            : status.source === 'REVOKED'
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                              {perm.label}
                            </span>
                            <code className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono">
                              {perm.key}
                            </code>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                status.source === 'WILDCARD'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                                  : status.source === 'CUSTOM_GRANT'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                                  : status.source === 'ROLE_INHERITED'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                  : status.source === 'REVOKED'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              }`}
                            >
                              {status.source}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{perm.description}</p>
                        </div>

                        {/* Interactive Toggle Switch */}
                        <div>
                          <button
                            id={`modal-toggle-${perm.key.replace(':', '-')}`}
                            disabled={!isSuperAdmin || inspectingUser.role === 'SUPER_ADMIN'}
                            onClick={async () => {
                              await toggleUserPermission(inspectingUser.id, perm.key);
                              // Sync state in inspecting modal
                              const currentManaged = managedUsers.find((u) => u.id === inspectingUser.id);
                              if (currentManaged) {
                                setInspectingUser({ ...currentManaged });
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                              isActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                            } ${!isSuperAdmin || inspectingUser.role === 'SUPER_ADMIN' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Total Active: <span className="font-semibold text-slate-900 dark:text-white">{getUserEffectivePermissions(inspectingUser).includes('*') ? 'All (*)' : getUserEffectivePermissions(inspectingUser).length}</span>
                </div>
                <button
                  id="modal-done-btn"
                  onClick={() => setInspectingUser(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
