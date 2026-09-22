import React from 'react';
import { ProtectedRoute } from '../ProtectedRoute';

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
 * Route wrapper component that restricts access to the specified roles or permissions.
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

export default RequireRole;
