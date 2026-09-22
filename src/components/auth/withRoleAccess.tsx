import React from 'react';
import { 
  ProtectedRoute, 
  ProtectedRouteProps, 
  ADMIN_ALLOWED_ROLES 
} from '../ProtectedRoute';

/**
 * Generic Higher-Order Component (HOC) restricting access to specified roles.
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
 * Specialized Higher-Order Component restricting access to the Admin Dashboard
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

export default withRoleAccess;
