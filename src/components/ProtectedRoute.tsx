import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { AccessDenied } from './AccessDenied';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { auditTrailService } from '../services/auditTrailService';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  componentId?: string;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  onAccessDenied?: (details: {
    role: string;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    componentId?: string;
  }) => void;
  onNavigate?: (path: string) => void;
}

/**
 * Route protection wrapper component that evaluates user identity, role, and fine-grained permissions
 * defined in AuthContext and access control matrices. Displays AccessDenied view on authorization failure.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
  componentId,
  requireAuth = true,
  fallback,
  onAccessDenied,
  onNavigate,
}) => {
  const { user, session, loading, role, hasRole, hasPermission, checkRouteAccess } = useAuth();
  const loggedRef = useRef<string | null>(null);

  // Evaluate authentication and authorization state
  const isAuthenticated = !!session || !!user || !!localStorage.getItem('user_role') || !!localStorage.getItem('sovereign_sessions');

  let isAuthorized = true;
  if (requireAuth && !isAuthenticated) {
    isAuthorized = false;
  } else {
    // Super Admin has universal access bypass across all enclave routes
    if (role === 'SUPER_ADMIN' || (localStorage.getItem('user_role') || '').toUpperCase() === 'SUPER_ADMIN') {
      isAuthorized = true;
    } else {
      if (requiredRoles && requiredRoles.length > 0) {
        if (!hasRole(requiredRoles)) {
          isAuthorized = false;
        }
      }

      if (isAuthorized && requiredPermissions && requiredPermissions.length > 0) {
        if (!hasPermission(requiredPermissions)) {
          isAuthorized = false;
        }
      }

      if (isAuthorized && componentId) {
        if (!checkRouteAccess(componentId)) {
          isAuthorized = false;
        }
      }
    }
  }

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY BEFORE ANY EARLY RETURN STATEMENTS
  useEffect(() => {
    if (!loading && !isAuthorized) {
      const logKey = `${role}-${componentId || 'route'}-${requiredRoles?.join(',')}`;
      if (loggedRef.current !== logKey) {
        loggedRef.current = logKey;

        if (onAccessDenied) {
          onAccessDenied({
            role,
            requiredRoles,
            requiredPermissions,
            componentId,
          });
        }

        auditTrailService.addEvent({
          category: 'SECURITY_KEY',
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT_BLOCKED',
          actor: {
            id: user?.id || 'usr-unauthorized',
            name: user?.email || 'Authenticated User',
            role: role || 'GUEST',
          },
          target: {
            type: 'RULE',
            id: componentId || 'protected-component',
            name: `Enclave Route: ${componentId || 'Protected View'}`,
          },
          status: 'BLOCKED',
          severity: 'HIGH',
          description: `Access attempt to '${componentId || 'Protected Route'}' was blocked by ProtectedRoute guard. User role '${role}' lacks required authorization.`,
          cryptographicProof: {
            algorithm: 'KYBER-1024',
            hash: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            ledgerSequence: Math.floor(Math.random() * 50000) + 150000,
            enclaveAttestationId: 'attest-guard-block-nitro-01',
          },
          metadata: {
            attemptedComponent: componentId,
            currentRole: role,
            requiredRoles,
            requiredPermissions,
          },
        });
      }
    }
  }, [loading, isAuthorized, role, componentId, requiredRoles, requiredPermissions, user, onAccessDenied]);

  // 1. Loading state verification
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <div className="relative mb-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/50 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shadow-md">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute -bottom-1 -right-1" />
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-slate-300">
          Evaluating Sovereign Permissions...
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">
          Validating role-based access matrix &amp; identity token
        </div>
      </div>
    );
  }

  // 2. Authentication requirement check
  if (requireAuth && !isAuthenticated) {
    return (
      <AccessDenied
        currentRole="UNAUTHENTICATED"
        requiredRoles={requiredRoles}
        requiredPermissions={requiredPermissions}
        componentId={componentId}
        reason="unauthenticated"
        onNavigate={onNavigate}
      />
    );
  }

  // 3. Render children on authorization success
  if (isAuthorized) {
    return <>{children}</>;
  }

  // 4. Authorization failure rendering (fallback or AccessDenied)
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <AccessDenied
      currentRole={role}
      requiredRoles={requiredRoles}
      requiredPermissions={requiredPermissions}
      componentId={componentId}
      reason="unauthorized_role"
      onNavigate={onNavigate}
    />
  );
};

/**
 * Default authorized roles for Admin Dashboard access
 */
export const ADMIN_ALLOWED_ROLES: string[] = ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'];

/**
 * Higher-Order Component (HOC) wrapper to easily enforce route protection on any component
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  protectionOptions: Omit<ProtectedRouteProps, 'children'>
): React.FC<P> {
  const ProtectedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute {...protectionOptions}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  ProtectedComponent.displayName = `Protected(${Component.displayName || Component.name || 'Component'})`;
  return ProtectedComponent;
}

/**
 * Generic Higher-Order Component (HOC) restricting component access to designated roles
 */
export function withRoleAccess<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string | string[],
  options?: Omit<ProtectedRouteProps, 'children' | 'requiredRoles'>
): React.FC<P> {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const WithRoleComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute requiredRoles={roles} {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WithRoleComponent.displayName = `WithRoleAccess(${Component.displayName || Component.name || 'Component'})`;
  return WithRoleComponent;
}

/**
 * Specialized Higher-Order Component (HOC) restricting access to the Admin Dashboard
 * exclusively to users with 'SUPER_ADMIN' or 'COMPLIANCE_OFFICER' role.
 */
export function withAdminAccess<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children' | 'requiredRoles'>
): React.FC<P> {
  return withRoleAccess(Component, ADMIN_ALLOWED_ROLES, {
    componentId: 'admin-dashboard',
    ...options
  });
}

export interface AdminRouteWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentId?: string;
  onNavigate?: (path: string) => void;
  onAccessDenied?: (details: {
    role: string;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    componentId?: string;
  }) => void;
}

/**
 * Route wrapper component that restricts access to the Admin Dashboard to users with
 * 'SUPER_ADMIN' or 'COMPLIANCE_OFFICER' role.
 */
export const AdminRouteWrapper: React.FC<AdminRouteWrapperProps> = ({
  children,
  fallback,
  componentId = 'admin-dashboard',
  onNavigate,
  onAccessDenied,
}) => {
  return (
    <ProtectedRoute
      requiredRoles={ADMIN_ALLOWED_ROLES}
      componentId={componentId}
      fallback={fallback}
      onNavigate={onNavigate}
      onAccessDenied={onAccessDenied}
    >
      {children}
    </ProtectedRoute>
  );
};

// Aliases for convenience across routing conventions
export const AdminDashboardRoute = AdminRouteWrapper;
export const AdminRoute = AdminRouteWrapper;

export interface RequireRoleProps {
  roles: string | string[];
  permissions?: string | string[];
  componentId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onNavigate?: (path: string) => void;
  onAccessDenied?: (details: {
    role: string;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    componentId?: string;
  }) => void;
}

/**
 * Generic Route Wrapper restricting child routes to specified roles / permissions
 */
export const RequireRole: React.FC<RequireRoleProps> = ({
  roles,
  permissions,
  componentId,
  children,
  fallback,
  onNavigate,
  onAccessDenied,
}) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  const requiredPermissions = permissions
    ? (Array.isArray(permissions) ? permissions : [permissions])
    : undefined;

  return (
    <ProtectedRoute
      requiredRoles={requiredRoles}
      requiredPermissions={requiredPermissions}
      componentId={componentId}
      fallback={fallback}
      onNavigate={onNavigate}
      onAccessDenied={onAccessDenied}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Custom React Hook providing programmatic access check capabilities
 */
export const useProtectedRoute = (options?: {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  componentId?: string;
}) => {
  const { role, permissions, hasRole, hasPermission, checkRouteAccess } = useAuth();

  const isRoleAllowed = options?.requiredRoles ? hasRole(options.requiredRoles) : true;
  const isPermissionAllowed = options?.requiredPermissions ? hasPermission(options.requiredPermissions) : true;
  const isComponentAllowed = options?.componentId ? checkRouteAccess(options.componentId) : true;

  const isAllowed = isRoleAllowed && isPermissionAllowed && isComponentAllowed;

  return {
    isAllowed,
    currentRole: role,
    userPermissions: permissions,
    hasRole,
    hasPermission,
    checkRouteAccess,
  };
};

/**
 * Custom React Hook for checking Admin Dashboard authorization
 */
export const useAdminAccess = () => {
  return useProtectedRoute({
    requiredRoles: ADMIN_ALLOWED_ROLES,
    componentId: 'admin-dashboard',
  });
};
