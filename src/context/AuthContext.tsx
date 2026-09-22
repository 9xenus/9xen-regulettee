import { fetchWithRetry } from '../lib/api-client';
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { User, Session } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { useNotification } from './NotificationContext';
import { SessionTimeoutWarning } from '../components/SessionTimeoutWarning';
import { useUserInactivity } from '../hooks/useUserInactivity';
import { sessionSyncService } from '../services/sessionSync';
import { SIDEBAR_ROLE_ACCESS_MATRIX } from '../utils/accessControl';

export interface RolePermissionMap {
  [role: string]: string[];
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  tenantName?: string;
  customPermissions?: string[];
  revokedPermissions?: string[];
  status: 'ACTIVE' | 'PENDING_KYC' | 'SUSPENDED' | 'QUARANTINED';
  mfaEnabled?: boolean;
  registration_country?: string;
  registration_status?: string;
  lastActive?: string;
  createdAt?: string;
  avatarUrl?: string;
}

export interface PermissionDefinition {
  key: string;
  label: string;
  category: 'ADMIN' | 'COMPLIANCE' | 'LEGAL' | 'CLIENT' | 'AUDIT' | 'SECURITY';
  description: string;
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  // Admin & Governance
  { key: '*', label: 'SuperAdmin Wildcard (*)', category: 'ADMIN', description: 'Unrestricted root execution across all sovereign services and tenant clusters' },
  { key: 'read:admin', label: 'View Admin Telemetry', category: 'ADMIN', description: 'Access administrative dashboards, system status & cluster metrics' },
  { key: 'write:admin', label: 'Modify System Configs', category: 'ADMIN', description: 'Update system-wide variables, API configurations and security policies' },
  { key: 'manage:users', label: 'Manage Platform Users', category: 'ADMIN', description: 'Create, update, toggle permissions and suspend enterprise users' },
  { key: 'manage:roles', label: 'Manage Role Matrix', category: 'ADMIN', description: 'Define and reconfigure global RBAC permission bindings' },
  { key: 'view:admin_dashboard', label: 'Access Admin Dashboard', category: 'ADMIN', description: 'Enter administrative command centers and control towers' },
  { key: 'manage:tenants', label: 'SaaS Tenant Provisioning', category: 'ADMIN', description: 'Provision, configure quotas and migrate enterprise enclaves' },
  { key: 'billing:manage', label: 'Financial & Billing Control', category: 'ADMIN', description: 'Issue invoices, adjust pricing and manage payment gateways' },

  // Compliance & Regulatory
  { key: 'read:compliance', label: 'Read Compliance Frameworks', category: 'COMPLIANCE', description: 'Inspect GDPR, NIS2, DORA, and EU AI Act compliance trackers' },
  { key: 'write:compliance', label: 'Edit Compliance Policies', category: 'COMPLIANCE', description: 'Create and update automated compliance checks and evidence rules' },
  { key: 'view:compliance_dashboard', label: 'Compliance Dashboard', category: 'COMPLIANCE', description: 'Access live compliance scoring and compliance delta analytics' },
  { key: 'view:violations', label: 'Violation & Anomaly Stream', category: 'COMPLIANCE', description: 'Inspect detected regulatory breaches and scan alerts' },
  { key: 'manage:policies', label: 'Policy Engine Management', category: 'COMPLIANCE', description: 'Deploy and test dynamic statutory policy logic' },
  { key: 'verify:proofs', label: 'Zero-Knowledge Proof Verification', category: 'COMPLIANCE', description: 'Cryptographically verify zk-SNARK compliance attestations' },
  { key: 'enforce:policies', label: 'Statutory Enforcement', category: 'COMPLIANCE', description: 'Issue official compliance warnings, fines and corrective notices' },
  { key: 'view:b2g_center', label: 'B2G Regulator Oversight', category: 'COMPLIANCE', description: 'Access direct B2G reporting gateway and data pipelines' },
  { key: 'read:regulator', label: 'Access Regulatory Dossiers', category: 'COMPLIANCE', description: 'Review statutory disclosures and authority inquiry records' },
  { key: 'write:regulator', label: 'Submit Regulatory Filings', category: 'COMPLIANCE', description: 'Transmit official disclosures to European regulatory bodies' },
  { key: 'view:regulatory_intelligence', label: 'Regulatory Intelligence', category: 'COMPLIANCE', description: 'Access AI-assisted gazette monitoring and legislative radar' },

  // Legal & Vault
  { key: 'read:legal', label: 'Read Legal Agreements', category: 'LEGAL', description: 'View data processing agreements, NDAs and arbitration records' },
  { key: 'write:legal', label: 'Draft Legal Filings', category: 'LEGAL', description: 'Generate legal contracts and regulatory arbitration requests' },
  { key: 'view:vault', label: 'Access HSM Encrypted Vault', category: 'LEGAL', description: 'Access client evidence vaults protected by HSM key enclaves' },
  { key: 'view:lawyer_portal', label: 'Lawyer Partner Portal', category: 'LEGAL', description: 'Access partner legal dashboard, client dossiers and billings' },
  { key: 'view:legal_intelligence', label: 'Legal Case Law Radar', category: 'LEGAL', description: 'Search EU court rulings and enforcement precedent' },
  { key: 'view:evidence_vault', label: 'Forensic Evidence Ledger', category: 'LEGAL', description: 'Inspect immutable hash-chained forensic audit packages' },

  // Client & Tenancy
  { key: 'read:client', label: 'Access Client Workspace', category: 'CLIENT', description: 'Access tenant workspace, active frameworks and assigned tasks' },
  { key: 'write:client', label: 'Modify Client Data', category: 'CLIENT', description: 'Upload compliance documents, submit answers and run scans' },
  { key: 'view:client_dashboard', label: 'Client Command Center', category: 'CLIENT', description: 'Access primary enterprise dashboard and health meters' },
  { key: 'view:automation_portal', label: 'Compliance Automation Portal', category: 'CLIENT', description: 'Execute automated scanners and remediation workflows' },
  { key: 'view:sovereignty', label: 'Data Sovereignty Controls', category: 'CLIENT', description: 'Inspect cloud regions, residency proofs and encryption keys' },
  { key: 'view:tenant_settings', label: 'Tenant Organization Settings', category: 'CLIENT', description: 'Configure organization name, team seats and webhooks' },

  // Security & Audit
  { key: 'read:audit', label: 'Stream Audit Telemetry', category: 'AUDIT', description: 'Read system event streams and tamper-proof log queues' },
  { key: 'view:audit_logs', label: 'Security Audit Log Viewer', category: 'AUDIT', description: 'Inspect detailed access logs and IP forensic traces' },
  { key: 'view:reports', label: 'Generate Compliance Reports', category: 'AUDIT', description: 'Export PDF/JSON compliance certificates and audit packets' },
  { key: 'security:killswitch', label: 'Emergency Tenant Killswitch', category: 'SECURITY', description: 'Trigger immediate cryptographic data shred or session quarantine' }
];

export const INITIAL_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'usr_01',
    name: 'Mustafa At-Tamim',
    email: 'mustafaattamim@gmail.com',
    role: 'SUPER_ADMIN',
    tenantId: 'org_1',
    tenantName: 'Acme Corporation Europe',
    customPermissions: ['*'],
    revokedPermissions: [],
    status: 'ACTIVE',
    mfaEnabled: true,
    registration_country: 'DE',
    registration_status: 'approved',
    lastActive: new Date().toISOString(),
    createdAt: '2026-01-15T09:00:00.000Z'
  },
  {
    id: 'usr_02',
    name: 'Dr. Anna Schmidt',
    email: 'regulator@bfdi.bund.de',
    role: 'EU_REGULATOR',
    tenantId: 'org_2',
    tenantName: 'BfDI Regulatory Inspectorate',
    customPermissions: ['view:regulatory_intelligence'],
    revokedPermissions: [],
    status: 'ACTIVE',
    mfaEnabled: true,
    registration_country: 'DE',
    registration_status: 'approved',
    lastActive: new Date(Date.now() - 1800000).toISOString(),
    createdAt: '2026-02-01T10:30:00.000Z'
  },
  {
    id: 'usr_03',
    name: 'Jean-Luc Dupont',
    email: 'treasury@fintech-sov.lu',
    role: 'TENANT_OWNER',
    tenantId: 'org_3',
    tenantName: 'Fintech Sovereign Vault LLC',
    customPermissions: ['billing:manage', 'view:sovereignty'],
    revokedPermissions: [],
    status: 'ACTIVE',
    mfaEnabled: true,
    registration_country: 'LU',
    registration_status: 'approved',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    createdAt: '2026-02-10T14:15:00.000Z'
  },
  {
    id: 'usr_04',
    name: 'Elena Rostova',
    email: 'elena.rostova@legal-euro.ch',
    role: 'LAWYER',
    tenantId: 'org_4',
    tenantName: 'Zurich Legal Defense AG',
    customPermissions: ['view:evidence_vault'],
    revokedPermissions: [],
    status: 'ACTIVE',
    mfaEnabled: true,
    registration_country: 'CH',
    registration_status: 'approved',
    lastActive: new Date(Date.now() - 7200000).toISOString(),
    createdAt: '2026-03-01T11:00:00.000Z'
  },
  {
    id: 'usr_05',
    name: 'Marcus Vance',
    email: 'marcus@compliance-core.co.uk',
    role: 'COMPLIANCE_OFFICER',
    tenantId: 'org_1',
    tenantName: 'Acme Corporation Europe',
    customPermissions: ['verify:proofs', 'manage:policies'],
    revokedPermissions: [],
    status: 'ACTIVE',
    mfaEnabled: true,
    registration_country: 'GB',
    registration_status: 'approved',
    lastActive: new Date(Date.now() - 14400000).toISOString(),
    createdAt: '2026-03-15T08:45:00.000Z'
  },
  {
    id: 'usr_06',
    name: 'Sofia Mendes',
    email: 'sofia.mendes@auditor-eu.pt',
    role: 'AUDITOR',
    tenantId: 'org_5',
    tenantName: 'Lisbon Security Audit Group',
    customPermissions: ['view:audit_logs', 'view:reports'],
    revokedPermissions: [],
    status: 'ACTIVE',
    mfaEnabled: true,
    registration_country: 'PT',
    registration_status: 'approved',
    lastActive: new Date(Date.now() - 28800000).toISOString(),
    createdAt: '2026-04-01T16:20:00.000Z'
  },
  {
    id: 'usr_07',
    name: 'Klaus Weber',
    email: 'klaus.weber@auto-supply.de',
    role: 'CLIENT',
    tenantId: 'org_6',
    tenantName: 'Bavarian Autonomous Systems',
    customPermissions: [],
    revokedPermissions: [],
    status: 'PENDING_KYC',
    mfaEnabled: false,
    registration_country: 'DE',
    registration_status: 'kyc_submitted',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    createdAt: '2026-04-10T12:00:00.000Z'
  },
  {
    id: 'usr_08',
    name: 'Aurelia Dubois',
    email: 'aurelia@cyber-guard.fr',
    role: 'ADMIN',
    tenantId: 'org_7',
    tenantName: 'French Cybersecurity Enclave',
    customPermissions: ['read:admin', 'write:admin', 'manage:users'],
    revokedPermissions: [],
    status: 'ACTIVE',
    mfaEnabled: true,
    registration_country: 'FR',
    registration_status: 'approved',
    lastActive: new Date(Date.now() - 5400000).toISOString(),
    createdAt: '2026-04-18T10:10:00.000Z'
  }
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMap = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['*'],
  COMPLIANCE_OFFICER: [
    'read:admin',
    'read:compliance',
    'write:compliance',
    'view:admin_dashboard',
    'view:compliance_dashboard',
    'view:violations',
    'view:audit_logs',
    'view:reports',
    'view:regulatory_intelligence',
    'manage:policies',
    'verify:proofs'
  ],
  EU_REGULATOR: [
    'read:regulator',
    'write:regulator',
    'view:violations',
    'view:b2g_center',
    'view:audit_logs',
    'view:reports',
    'view:regulatory_intelligence',
    'enforce:policies'
  ],
  REGULATOR: [
    'read:regulator',
    'write:regulator',
    'view:violations',
    'view:b2g_center',
    'view:audit_logs',
    'view:reports'
  ],
  LAWYER: [
    'read:legal',
    'write:legal',
    'view:vault',
    'view:lawyer_portal',
    'view:legal_intelligence',
    'view:evidence_vault',
    'view:reports'
  ],
  LEGAL_CONSULTANT: [
    'read:legal',
    'write:legal',
    'view:vault',
    'view:lawyer_portal',
    'view:reports'
  ],
  CLIENT: [
    'read:client',
    'write:client',
    'view:client_dashboard',
    'view:automation_portal',
    'view:sovereignty',
    'view:reports'
  ],
  TENANT_OWNER: [
    'read:client',
    'write:client',
    'view:client_dashboard',
    'view:automation_portal',
    'view:sovereignty',
    'view:tenant_settings',
    'view:reports'
  ],
  TENANT: [
    'read:client',
    'view:client_dashboard',
    'view:automation_portal',
    'view:reports'
  ],
  AUDITOR: [
    'read:audit',
    'view:audit_logs',
    'view:reports',
    'view:evidence_vault',
    'verify:proofs'
  ]
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string;
  permissions: string[];
  rolePermissions: RolePermissionMap;
  managedUsers: ManagedUser[];
  availablePermissions: PermissionDefinition[];
  isDemo: boolean;
  demoExpiresAt: number | null;
  handleOAuthCallback: (token: string) => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateVerificationStatus: (status: 'Verified' | 'Pending' | 'Action Required') => void;
  setActiveRole: (newRole: string) => void;
  hasRole: (requiredRoles: string | string[]) => boolean;
  hasPermission: (requiredPermissions: string | string[]) => boolean;
  checkRouteAccess: (componentId: string) => boolean;
  updateUserRole: (userId: string, newRole: string) => Promise<boolean>;
  toggleUserPermission: (userId: string, permission: string) => Promise<boolean>;
  updateUserPermissions: (userId: string, customPermissions: string[], revokedPermissions?: string[]) => Promise<boolean>;
  resetUserPermissions: (userId: string) => Promise<boolean>;
  toggleRolePermission: (role: string, permission: string) => void;
  updateRolePermissions: (role: string, permissions: string[]) => void;
  resetRolePermissions: (role?: string) => void;
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'PENDING_KYC' | 'SUSPENDED' | 'QUARANTINED') => Promise<boolean>;
  getUserEffectivePermissions: (userOrId: ManagedUser | string) => string[];
  refreshManagedUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: 'CLIENT',
  permissions: DEFAULT_ROLE_PERMISSIONS.CLIENT,
  rolePermissions: DEFAULT_ROLE_PERMISSIONS,
  managedUsers: INITIAL_MANAGED_USERS,
  availablePermissions: AVAILABLE_PERMISSIONS,
  isDemo: false,
  demoExpiresAt: null,
  handleOAuthCallback: async () => {},
  signInWithOAuth: async () => {},
  signOut: async () => {},
  updateVerificationStatus: () => {},
  setActiveRole: () => {},
  hasRole: () => true,
  hasPermission: () => true,
  checkRouteAccess: () => true,
  updateUserRole: async () => false,
  toggleUserPermission: async () => false,
  updateUserPermissions: async () => false,
  resetUserPermissions: async () => false,
  toggleRolePermission: () => {},
  updateRolePermissions: () => {},
  resetRolePermissions: () => {},
  updateUserStatus: async () => false,
  getUserEffectivePermissions: () => ['*'],
  refreshManagedUsers: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [demoExpiresAt, setDemoExpiresAt] = useState<number | null>(null);
  const { showToast } = useNotification();

  const updateVerificationStatus = (status: 'Verified' | 'Pending' | 'Action Required') => {
    if (!session) return;
    const updatedUser: User = {
      ...session.user,
      user_metadata: {
        ...(session.user.user_metadata || {}),
        verificationStatus: status
      }
    };
    const updatedSession: Session = {
      ...session,
      user: updatedUser
    };
    setSession(updatedSession);
    setUser(updatedUser);
    localStorage.setItem("sovereign_sessions", JSON.stringify(updatedSession));
    showToast(`Identity verification status updated to ${status}.`, 'success');
  };

  const handleOAuthCallback = async (token: string) => {
    setLoading(true);
    try {
      // Production-level verification call
      const response = await fetchWithRetry('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error('Verification failed');
      const { session } = await response.json();
      
      // Update local Supabase session if it exists, or persist manually
      setSession(session);
      setUser(session.user);
      localStorage.setItem("sovereign_sessions", JSON.stringify(session));
    } catch (error) {
      console.error('OAuth Callback Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('OAuth/OIDC Sign In Error:', error);
      showToast(`Failed to initiate SSO login via ${provider}: ${error.message}`, 'error');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.setItem("sovereign_sessions", "logged_out");
      localStorage.setItem("9xen_active_route", "landing");
      setUser(null);
      setSession(null);
      setIsDemo(false);
      setDemoExpiresAt(null);
      showToast('Securely disconnected from Sovereign Cloud.', 'success');
      window.location.hash = '#landing';
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'landing' }));
    } catch (error) {
      console.error('Sign Out Error:', error);
      showToast('Failed to complete secure logout.', 'error');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
      // Check for persisted sovereign/demo session first
      const stored = localStorage.getItem("sovereign_sessions");
      if (stored && stored !== "logged_out") {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.isDemo || parsed.user)) {
            setIsDemo(!!parsed.isDemo);
            setDemoExpiresAt(parsed.demoExpiresAt || null);
            setSession(parsed);
            setUser(parsed.user);
            const savedRole = parsed.user?.user_metadata?.role || localStorage.getItem('user_role') || 'SUPER_ADMIN';
            setActiveRoleOverride(savedRole.toUpperCase());
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      if (supabaseSession) {
        setSession(supabaseSession);
        const currentUser = supabaseSession.user;
        setUser(currentUser);
        if (currentUser?.user_metadata?.role) {
          const metadataRole = currentUser.user_metadata.role.toUpperCase();
          setActiveRoleOverride(metadataRole);
          localStorage.setItem('user_role', metadataRole);
        }
        setLoading(false);
        sessionSyncService.start(() => {
          setSession(null);
          setUser(null);
          showToast('Session integrity check failed or expired. Please re-authenticate.', 'error');
        }, 30000);
      } else if (stored !== "logged_out") {
        // Default initialize sovereign administrative session if not explicitly logged out
        const savedRole = (localStorage.getItem('user_role') || 'SUPER_ADMIN').toUpperCase();
        const defaultUser: User = {
          id: 'usr_01',
          app_metadata: { provider: 'email' },
          user_metadata: {
            name: 'Mustafa At-Tamim',
            role: savedRole,
            accountType: savedRole,
            verificationStatus: 'Verified'
          },
          aud: 'authenticated',
          created_at: '2026-01-15T09:00:00.000Z',
          email: 'mustafaattamim@gmail.com'
        } as User;

        const defaultSession: Session = {
          access_token: 'sov_admin_token_default',
          token_type: 'bearer',
          expires_in: 86400,
          refresh_token: 'sov_admin_refresh_default',
          user: defaultUser,
          expires_at: Math.floor(Date.now() / 1000) + 86400
        } as Session;

        setSession(defaultSession);
        setUser(defaultUser);
        setActiveRoleOverride(savedRole);
        localStorage.setItem("sovereign_sessions", JSON.stringify(defaultSession));
        setLoading(false);
      } else {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setIsDemo(false);
        setDemoExpiresAt(null);
      }
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Sync role on auth state change (login/logout/role update)
      if (currentUser?.user_metadata?.role) {
        const metadataRole = currentUser.user_metadata.role.toUpperCase();
        setActiveRoleOverride(metadataRole);
        localStorage.setItem('user_role', metadataRole);
      }

      if (session) {
        sessionSyncService.start(() => {
          setSession(null);
          setUser(null);
          showToast('Session integrity check failed or expired. Please re-authenticate.', 'error');
        }, 30000);
      } else {
        sessionSyncService.stop();
      }
    });

    return () => {
      subscription.unsubscribe();
      sessionSyncService.stop();
    };
  }, []);

  // Demo expiration checker
  useEffect(() => {
    if (isDemo && demoExpiresAt) {
      const checkDemoExpiry = () => {
        if (Date.now() > demoExpiresAt) {
          showToast('Demo session has expired (3-day limit reached).', 'error');
          signOut();
        }
      };
      const interval = setInterval(checkDemoExpiry, 30000); // Every 30s
      checkDemoExpiry();
      return () => clearInterval(interval);
    }
  }, [isDemo, demoExpiresAt]);

  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    
    // Also intercept pushState to update current path reactively
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const getDetectedRole = () => {
    if (user?.user_metadata?.role) {
      return user.user_metadata.role;
    }
    const path = currentPath.split('?')[0].split('#')[0].replace(/^\//, '');
    
    if (path === 'regulator' || path === 'regulator-dashboard') {
      return 'EU_REGULATOR';
    }
    if (path === 'client' || path === 'client-dashboard') {
      return 'CLIENT';
    }
    return null;
  };

  const detectedRole = getDetectedRole();

  const config = React.useMemo(() => {
    switch (detectedRole) {
      case 'EU_REGULATOR':
        return {
          timeoutMs: 45 * 60 * 1000,      // 45 minutes
          warningMs: 43 * 60 * 1000,       // 43 minutes
          label: 'EU Regulator Account',
          enabled: true
        };
      case 'CLIENT':
      case 'TENANT_OWNER':
      case 'TENANT':
        return {
          timeoutMs: 30 * 60 * 1000,      // 30 minutes
          warningMs: 28 * 60 * 1000,       // 28 minutes
          label: 'Enterprise Client Session',
          enabled: true
        };
      default:
        const isAuthPage = !!session || !!detectedRole;
        return {
          timeoutMs: 30 * 60 * 1000,      // 30 minutes timeout
          warningMs: 28 * 60 * 1000,      // 28 minutes warning
          label: 'Sovereign Session',
          enabled: isAuthPage
        };
    }
  }, [detectedRole, session]);

  const monitorEnabled = config.enabled && (!!session || !!detectedRole);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const timeLeft = expiresAt - now;

      if (timeLeft <= 300) {
        // Automatically renew session expiration for active session
        const renewedSession = {
          ...session,
          expires_at: now + 86400
        };
        setSession(renewedSession);
        try {
          localStorage.setItem("sovereign_sessions", JSON.stringify(renewedSession));
        } catch (e) {
          // Ignore storage write error
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session]);

  // Idle-time Monitor using custom hook: auto log out dynamically after specified inactivity period.
  const { isWarning, countdown, resetTimer } = useUserInactivity({
    onTimeout: signOut,
    timeoutMs: config.timeoutMs,
    warningMs: config.warningMs,
    enabled: monitorEnabled,
  });

  // Active role management
  const [activeRoleOverride, setActiveRoleOverride] = useState<string | null>(() => {
    return localStorage.getItem('user_role');
  });

  // Dynamic Role Permissions Matrix
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMap>(() => {
    try {
      const saved = localStorage.getItem('saas_role_permissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ROLE_PERMISSIONS;
  });

  // Managed Platform Users with custom permissions
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    try {
      const saved = localStorage.getItem('saas_managed_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MANAGED_USERS;
  });

  // Listen to external role-changed events
  useEffect(() => {
    const handleRoleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveRoleOverride(customEvent.detail);
      }
    };
    window.addEventListener('role-changed', handleRoleChanged as EventListener);
    return () => window.removeEventListener('role-changed', handleRoleChanged as EventListener);
  }, []);

  const setActiveRole = useCallback((newRole: string) => {
    const upperRole = newRole.toUpperCase();
    setActiveRoleOverride(upperRole);
    localStorage.setItem('user_role', upperRole);

    setUser((prev) => {
      const base: User = prev || {
        id: 'usr_01',
        app_metadata: { provider: 'email' },
        user_metadata: {
          name: 'Mustafa At-Tamim',
          role: upperRole,
          accountType: upperRole,
          verificationStatus: 'Verified'
        },
        aud: 'authenticated',
        created_at: '2026-01-15T09:00:00.000Z',
        email: 'mustafaattamim@gmail.com'
      } as User;

      const updatedUser: User = {
        ...base,
        user_metadata: {
          ...(base.user_metadata || {}),
          role: upperRole,
          accountType: upperRole,
        }
      };

      const newSession: Session = {
        access_token: 'sov_admin_token_' + Date.now(),
        token_type: 'bearer',
        expires_in: 86400,
        refresh_token: 'sov_admin_refresh',
        user: updatedUser,
        expires_at: Math.floor(Date.now() / 1000) + 86400
      } as Session;

      setSession(newSession);
      localStorage.setItem("sovereign_sessions", JSON.stringify(newSession));
      return updatedUser;
    });

    window.dispatchEvent(new CustomEvent('role-changed', { detail: upperRole }));
  }, []);

  // Compute current role as a derived value to prevent stale states during renders
  const currentRole = useMemo(() => {
    if (user?.user_metadata?.role) return user.user_metadata.role.toUpperCase();
    if (user?.user_metadata?.accountType) return user.user_metadata.accountType.toUpperCase();
    if (activeRoleOverride) return activeRoleOverride.toUpperCase();
    return 'SUPER_ADMIN'; // Default fallback
  }, [activeRoleOverride, user]);

  const refreshManagedUsers = useCallback(async () => {
    try {
      const res = await fetchWithRetry('/api/v1/saas-admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setManagedUsers(data.users);
          localStorage.setItem('saas_managed_users', JSON.stringify(data.users));
        }
      }
    } catch (e) {
      // Fallback is maintained in local state
    }
  }, []);

  useEffect(() => {
    refreshManagedUsers();
  }, [refreshManagedUsers]);

  const getUserEffectivePermissions = useCallback((userOrId: ManagedUser | string): string[] => {
    const targetUser = typeof userOrId === 'string'
      ? managedUsers.find(u => u.id === userOrId || u.email === userOrId)
      : userOrId;
    
    if (!targetUser) return ['*'];
    
    const role = (targetUser.role || 'CLIENT').toUpperCase();
    if (role === 'SUPER_ADMIN') return ['*'];

    const basePerms = rolePermissions[role] || DEFAULT_ROLE_PERMISSIONS[role] || [];
    if (basePerms.includes('*')) return ['*'];

    const custom = targetUser.customPermissions || [];
    const revoked = targetUser.revokedPermissions || [];

    const set = new Set<string>([...basePerms, ...custom]);
    for (const r of revoked) {
      set.delete(r);
    }
    return Array.from(set);
  }, [managedUsers, rolePermissions]);

  const permissions = useMemo(() => {
    if (user) {
      const matched = managedUsers.find(u => u.id === user.id || u.email === user.email);
      if (matched) {
        return getUserEffectivePermissions(matched);
      }
    }
    return rolePermissions[currentRole] || DEFAULT_ROLE_PERMISSIONS[currentRole] || DEFAULT_ROLE_PERMISSIONS.CLIENT;
  }, [user, managedUsers, currentRole, rolePermissions, getUserEffectivePermissions]);

  const updateUserRole = useCallback(async (userId: string, newRole: string): Promise<boolean> => {
    const upperRole = newRole.toUpperCase();
    setManagedUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.email === userId) {
          return { ...u, role: upperRole };
        }
        return u;
      });
      localStorage.setItem('saas_managed_users', JSON.stringify(updated));
      return updated;
    });

    if (user && (user.id === userId || user.email === userId)) {
      setActiveRole(upperRole);
    }

    try {
      await fetchWithRetry(`/api/v1/saas-admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: upperRole }),
      });
    } catch (e) {}

    showToast(`User role changed to ${upperRole}. Permissions have been recalculated.`, 'success');
    return true;
  }, [user, setActiveRole, showToast]);

  const toggleUserPermission = useCallback(async (userId: string, permission: string): Promise<boolean> => {
    let isNowActive = false;
    setManagedUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.email === userId) {
          const custom = [...(u.customPermissions || [])];
          const revoked = [...(u.revokedPermissions || [])];

          if (custom.includes(permission)) {
            const newCustom = custom.filter(p => p !== permission);
            const newRevoked = revoked.includes(permission) ? revoked : [...revoked, permission];
            isNowActive = false;
            return { ...u, customPermissions: newCustom, revokedPermissions: newRevoked };
          } else if (revoked.includes(permission)) {
            const newRevoked = revoked.filter(p => p !== permission);
            const newCustom = custom.includes(permission) ? custom : [...custom, permission];
            isNowActive = true;
            return { ...u, customPermissions: newCustom, revokedPermissions: newRevoked };
          } else {
            const basePerms = rolePermissions[u.role] || DEFAULT_ROLE_PERMISSIONS[u.role] || [];
            if (basePerms.includes(permission) || basePerms.includes('*')) {
              isNowActive = false;
              return { ...u, revokedPermissions: [...revoked, permission] };
            } else {
              isNowActive = true;
              return { ...u, customPermissions: [...custom, permission] };
            }
          }
        }
        return u;
      });
      localStorage.setItem('saas_managed_users', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetchWithRetry(`/api/v1/saas-admin/users/${userId}/toggle-permission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission }),
      });
    } catch (e) {}

    showToast(`Permission "${permission}" is now ${isNowActive ? 'GRANTED' : 'REVOKED'}.`, 'info');
    return true;
  }, [rolePermissions, showToast]);

  const updateUserPermissions = useCallback(async (userId: string, customPermissions: string[], revokedPermissions: string[] = []): Promise<boolean> => {
    setManagedUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.email === userId) {
          return { ...u, customPermissions, revokedPermissions };
        }
        return u;
      });
      localStorage.setItem('saas_managed_users', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetchWithRetry(`/api/v1/saas-admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPermissions, revokedPermissions }),
      });
    } catch (e) {}

    showToast(`Permissions updated for user.`, 'success');
    return true;
  }, [showToast]);

  const resetUserPermissions = useCallback(async (userId: string): Promise<boolean> => {
    setManagedUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.email === userId) {
          return { ...u, customPermissions: [], revokedPermissions: [] };
        }
        return u;
      });
      localStorage.setItem('saas_managed_users', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetchWithRetry(`/api/v1/saas-admin/users/${userId}/reset-permissions`, {
        method: 'POST',
      });
    } catch (e) {}

    showToast(`User permissions reset to role defaults.`, 'info');
    return true;
  }, [showToast]);

  const toggleRolePermission = useCallback((role: string, permission: string) => {
    const upperRole = role.toUpperCase();
    setRolePermissions(prev => {
      const current = prev[upperRole] || DEFAULT_ROLE_PERMISSIONS[upperRole] || [];
      const updatedList = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission];
      const nextMap = { ...prev, [upperRole]: updatedList };
      localStorage.setItem('saas_role_permissions', JSON.stringify(nextMap));
      return nextMap;
    });
    showToast(`Updated default permissions for role ${upperRole}.`, 'info');
  }, [showToast]);

  const updateRolePermissions = useCallback((role: string, permissionsList: string[]) => {
    const upperRole = role.toUpperCase();
    setRolePermissions(prev => {
      const nextMap = { ...prev, [upperRole]: permissionsList };
      localStorage.setItem('saas_role_permissions', JSON.stringify(nextMap));
      return nextMap;
    });
    showToast(`Updated permissions matrix for role ${upperRole}.`, 'success');
  }, [showToast]);

  const resetRolePermissions = useCallback((role?: string) => {
    if (role) {
      const upperRole = role.toUpperCase();
      setRolePermissions(prev => {
        const nextMap = { ...prev, [upperRole]: DEFAULT_ROLE_PERMISSIONS[upperRole] || [] };
        localStorage.setItem('saas_role_permissions', JSON.stringify(nextMap));
        return nextMap;
      });
    } else {
      setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
      localStorage.setItem('saas_role_permissions', JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
    }
    showToast(role ? `Reset ${role} to default permissions.` : `Reset all roles to defaults.`, 'info');
  }, [showToast]);

  const updateUserStatus = useCallback(async (userId: string, status: 'ACTIVE' | 'PENDING_KYC' | 'SUSPENDED' | 'QUARANTINED'): Promise<boolean> => {
    setManagedUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.email === userId) {
          return { ...u, status };
        }
        return u;
      });
      localStorage.setItem('saas_managed_users', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetchWithRetry(`/api/v1/saas-admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {}

    showToast(`User account status set to ${status}.`, 'info');
    return true;
  }, [showToast]);

  const hasRole = useCallback((requiredRoles: string | string[]): boolean => {
    if (!requiredRoles) return true;
    const reqList = (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]).map(r => r.toUpperCase());
    
    // Demo mode, Super Admin & Admin bypass role checks
    if (isDemo || currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') return true;
    
    // Check direct equality or normalized equivalents
    return reqList.some(req => {
      if (req === currentRole) return true;
      if (req === 'ADMIN' && (currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN')) return true;
      if (req === 'COMPLIANCE_OFFICER' && (currentRole === 'COMPLIANCE_OFFICER' || currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN')) return true;
      if (req === 'REGULATOR' && (currentRole === 'EU_REGULATOR' || currentRole === 'REGULATOR')) return true;
      if (req === 'LAWYER' && (currentRole === 'LEGAL_CONSULTANT' || currentRole === 'LAWYER')) return true;
      if (req === 'CLIENT' && (currentRole === 'TENANT_OWNER' || currentRole === 'TENANT' || currentRole === 'CLIENT')) return true;
      return false;
    });
  }, [currentRole, isDemo]);

  const hasPermission = useCallback((requiredPermissions: string | string[]): boolean => {
    if (!requiredPermissions) return true;
    const reqList = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    
    if (isDemo || permissions.includes('*')) return true;
    
    return reqList.every(p => permissions.includes(p) || permissions.includes('*'));
  }, [permissions, isDemo]);

  const checkRouteAccess = useCallback((componentId: string): boolean => {
    if (!componentId) return true;
    
    // Demo mode, Super Admins bypass matrix restrictions
    if (isDemo || currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') return true;
    
    const allowedRoles = SIDEBAR_ROLE_ACCESS_MATRIX[componentId];
    if (!allowedRoles || allowedRoles.length === 0) {
      return true; // Unmapped components are allowed by default
    }
    
    return hasRole(allowedRoles);
  }, [currentRole, hasRole, isDemo]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role: currentRole,
        permissions,
        rolePermissions,
        managedUsers,
        availablePermissions: AVAILABLE_PERMISSIONS,
        isDemo,
        demoExpiresAt,
        handleOAuthCallback,
        signInWithOAuth,
        signOut,
        updateVerificationStatus,
        setActiveRole,
        hasRole,
        hasPermission,
        checkRouteAccess,
        updateUserRole,
        toggleUserPermission,
        updateUserPermissions,
        resetUserPermissions,
        toggleRolePermission,
        updateRolePermissions,
        resetRolePermissions,
        updateUserStatus,
        getUserEffectivePermissions,
        refreshManagedUsers,
      }}
    >
      {!loading && children}
      <AnimatePresence>
        {monitorEnabled && isWarning && (
          <SessionTimeoutWarning 
            countdown={countdown} 
            onStayLoggedIn={resetTimer} 
            roleLabel={config.label}
          />
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
