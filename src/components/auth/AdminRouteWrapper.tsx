import React from 'react';
import { 
  ProtectedRoute, 
  ProtectedRouteProps, 
  ADMIN_ALLOWED_ROLES 
} from '../ProtectedRoute';

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
 * Higher-Order Component / Route Wrapper that restricts access to the Admin Dashboard
 * exclusively to users with 'SUPER_ADMIN' or 'COMPLIANCE_OFFICER' role.
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

export const AdminDashboardRoute = AdminRouteWrapper;
export const AdminRoute = AdminRouteWrapper;
export default AdminRouteWrapper;
