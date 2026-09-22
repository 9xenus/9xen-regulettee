import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_ROLE_ACCESS_MATRIX } from '../../utils/accessControl';

// Define unified list of protected feature IDs and their permitted roles, backed by SIDEBAR_ROLE_ACCESS_MATRIX
export const FEATURE_ROLES_MAP: Record<string, string[]> = {
  ...SIDEBAR_ROLE_ACCESS_MATRIX,
  // Additional specific toggles
  'demo-content-manager': ['ADMIN', 'SUPER_ADMIN'],
  'quick-switch-role': ['ADMIN', 'SUPER_ADMIN'],
};

// Map route/path IDs to their matching protected feature key for unified verification
const PATH_TO_FEATURE_MAP: Record<string, string> = {
  'sudou': 'admin-hq',
  'platform-dashboard': 'platform-dashboard',
  'tenants': 'tenants',
  'onboarding': 'onboarding',
  'regional-compliance': 'regional-compliance',
  'caas-operation-center': 'caas-operation-center',
  'b2g-operations': 'b2g-operations',
  'regtech-orchestrator': 'regtech-orchestrator',
  'user-management': 'user-management',
  'lawyer-manager': 'lawyer-manager',
  'llm-config': 'llm-config',
  'verification-toggles': 'verification-toggles',
  'devops': 'devops',
  'backup-restore': 'backup-restore',
  'global-maintenance-toggle': 'global-maintenance-toggle',
  'force-tenant-logout': 'force-tenant-logout',
  'system-settings': 'system-settings',
  'admin-b2g-center': 'admin-b2g-center',
  'admin-b2g-dashboard': 'admin-b2g-dashboard',
  'admin-b2g-sandbox': 'admin-b2g-sandbox',
  'admin-b2g-filings': 'admin-b2g-filings',
  'admin-b2g-inquiries': 'admin-b2g-inquiries',
  'admin-b2g-whistleblower': 'admin-b2g-whistleblower',
  'admin-b2g-agencies': 'admin-b2g-agencies',
  'developer-api': 'developer-api',
  'event-webhooks': 'event-webhooks',
  'company-network': 'company-network',
  'enterprise-company-network': 'company-network',
  'verification-hub': 'verification-hub',
  'enterprise-verification': 'verification-hub',
  'predictive-intelligence': 'predictive-intelligence',
  'predictive-trading': 'predictive-intelligence',
  'enterprise-services': 'enterprise-services',
  'enterprise-gateway': 'enterprise-services',
  'sso': 'sso',
  'sso-landing': 'sso',
};

/**
 * Normalizes any role string into a strict uppercase role key matching our authorization maps.
 */
export const getNormalizedRole = (role?: string): string => {
  if (!role) return 'CLIENT';
  const r = role.toUpperCase();
  if (r === 'SUPER_ADMIN') return 'ADMIN';
  if (r === 'LEGAL_CONSULTANT') return 'LAWYER';
  return r;
};

/**
 * Client-side hook offering declarative capability-based checks
 */
export const useFeatureMask = (activeRole?: string) => {
  const { user } = useAuth();
  
  const role = getNormalizedRole(activeRole || user?.user_metadata?.role || user?.user_metadata?.accountType || 'CLIENT');
  const isSaaSSuperAdmin = role === 'ADMIN';

  /**
   * Evaluates if the current authenticated role can view or access a feature/component.
   */
  const hasAccess = (featureOrPathId: string): boolean => {
    // Super admins bypass all feature gating
    if (isSaaSSuperAdmin) return true;

    // Resolve feature ID from route path mapping if applicable
    const resolvedFeatureId = PATH_TO_FEATURE_MAP[featureOrPathId] || featureOrPathId;

    // If the feature is not explicitly mapped, it is public/unprotected
    if (!FEATURE_ROLES_MAP[resolvedFeatureId]) {
      return true;
    }

    const allowedRoles = FEATURE_ROLES_MAP[resolvedFeatureId];
    return allowedRoles.includes(role);
  };

  return {
    role,
    isSaaSSuperAdmin,
    hasAccess,
  };
};

interface FeatureMaskProps {
  featureId?: string;
  allowedRoles?: string[];
  activeRole?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Declarative component-level wrapper to dynamically mask unprivileged features.
 */
export const FeatureMask: React.FC<FeatureMaskProps> = ({
  featureId,
  allowedRoles,
  activeRole,
  children,
  fallback = null,
}) => {
  const { hasAccess, role } = useFeatureMask(activeRole);

  if (allowedRoles) {
    const normalizedAllowed = allowedRoles.map(r => getNormalizedRole(r));
    if (normalizedAllowed.includes(role)) {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  if (featureId && hasAccess(featureId)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Deep filters hierarchical sidebar sections to prevent unprivileged items from loading.
 */
export const maskNavigationLinks = (
  sections: any[],
  activeRole: string
): any[] => {
  const normalizedRole = getNormalizedRole(activeRole);
  const isSaaSAdmin = normalizedRole === 'ADMIN';

  const filterItem = (item: any): any | null => {
    // Check item level permission map or path map
    const featureId = PATH_TO_FEATURE_MAP[item.id] || item.id;
    if (FEATURE_ROLES_MAP[featureId]) {
      const allowedRoles = FEATURE_ROLES_MAP[featureId];
      if (!allowedRoles.includes(normalizedRole)) {
        return null;
      }
    }

    // Process nested subItems if present
    if (item.subItems) {
      const filteredSubs = item.subItems
        .map((sub: any) => filterItem(sub))
        .filter(Boolean);
      
      // If all subItems were stripped and we are a grouping parent, strip the item
      if (item.subItems.length > 0 && filteredSubs.length === 0 && !isSaaSAdmin) {
        return null;
      }
      return { ...item, subItems: filteredSubs };
    }

    return item;
  };

  return sections
    .map(section => {
      const filteredItems = section.items
        .map((item: any) => filterItem(item))
        .filter(Boolean);

      if (filteredItems.length === 0) {
        return null;
      }

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter(Boolean);
};
