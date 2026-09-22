import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, extractUserFromRequest } from './auth.js';

export const Role = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  EU_REGULATOR: 'EU_REGULATOR',
  REGIONAL_REGULATOR: 'REGIONAL_REGULATOR',
  TENANT_OWNER: 'TENANT_OWNER',
  TENANT_EDITOR: 'TENANT_EDITOR',
  TENANT_AUDITOR: 'TENANT_AUDITOR',
  CLIENT: 'CLIENT',
  LAWYER: 'LAWYER'
} as const;

export type Role = typeof Role[keyof typeof Role] | string;

const RoleHierarchy: Record<string, number> = {
  SUPER_ADMIN: 110,
  ADMIN: 100,
  EU_REGULATOR: 90,
  REGIONAL_REGULATOR: 80,
  TENANT_OWNER: 50,
  TENANT_EDITOR: 40,
  TENANT_AUDITOR: 30,
  CLIENT: 20,
  LAWYER: 20
};

/**
 * Middleware ensuring the authenticated user meets the minimum required role.
 * User identity MUST come from a verified session token — never from client-supplied headers.
 */
export const requireRole = (minimumRequiredRole: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // First, try to extract user from a verified token
      let user = extractUserFromRequest(req);

      // If no token and in dev mode, allow bypass (if enabled)
      if (!user) {
        // Check if this is a dev-only request (devAuthBypass would have set req.user)
        if (req.user) {
          user = req.user;
        } else if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS) {
          // Dev bypass — create mock user
          req.user = {
            userId: 'dev-user',
            role: Role.ADMIN,
            tenantId: 'org_1',
            email: 'dev@localhost'
          };
          user = req.user;
        } else {
          return res.status(401).json({ error: 'Missing Authentication Context' });
        }
      }

      req.user = user;
      req.tenantContext = user.tenantId;

      // Role Hierarchy Evaluation
      const userPower = RoleHierarchy[user.role] || 0;
      const requiredPower = RoleHierarchy[minimumRequiredRole] || 0;

      if (userPower < requiredPower) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient Policy Credentials. Higher clearance required.'
        });
      }

      // Strict Tenant Boundary Isolation
      const isGlobalActor = userPower >= (RoleHierarchy['REGIONAL_REGULATOR'] || 80);
      const targetTenantId = req.headers['x-tenant-context'] as string || user.tenantId;

      if (!isGlobalActor) {
        if (!targetTenantId) {
          return res.status(400).json({ error: 'Tenant context is mandatory for tenant API calls.' });
        }
        if (targetTenantId !== user.tenantId) {
          console.error(`[SECURITY_ALERT] Tenant isolation breach attempt! User ${user.userId} tried accessing Tenant ${targetTenantId}`);
          return res.status(403).json({
            error: 'Forbidden',
            code: 'ERR_ISOLATION_BREACH',
            message: 'Cross-tenant access violation detected. Event logged.'
          });
        }
      }

      req.tenantContext = targetTenantId || user.tenantId;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validates if the requested feature is entitled to the current active tenant
 */
export const requireEntitlement = (serviceModule: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // TODO: Query ServiceEntitlement table via database
    // const entitlement = await prisma.serviceEntitlement.findUnique(...)
    const isEntitled = true;

    if (!isEntitled) {
      return res.status(402).json({
        error: 'Payment Required / Entitlement Error',
        message: `Your organization does not have an active subscription for the ${serviceModule} module.`
      });
    }

    next();
  };
};

/**
 * Ensures that only authenticated users with specific roles can access sensitive endpoints.
 * User identity MUST come from a verified session token.
 */
export const requireRoles = (allowedRoles: (Role | string)[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // First, try to extract user from a verified token
      let user = extractUserFromRequest(req);

      // If no token and req.user was set by upstream auth middleware, use that
      if (!user && req.user) {
        user = req.user;
      } else if (!user) {
        // No valid auth found
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'ERR_UNAUTHENTICATED',
          message: 'Authentication token is required to access sensitive enforcement endpoints.'
        });
      }

      req.user = user;

      if (!user || !user.role) {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'ERR_UNAUTHENTICATED',
          message: 'Authentication token is required to access sensitive enforcement endpoints.'
        });
      }

      const userRole = user.role.toUpperCase();
      const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

      const hasAllowedRole = normalizedAllowed.includes(userRole) || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

      if (!hasAllowedRole) {
        return res.status(403).json({
          error: 'Forbidden',
          code: 'ERR_INSUFFICIENT_ROLE',
          message: `Access denied. Only authenticated ${allowedRoles.join(' or ')} roles can access sensitive enforcement endpoints.`,
          userRole: user.role,
          requiredRoles: allowedRoles
        });
      }

      req.tenantContext = user.tenantId;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Dedicated middleware for sensitive enforcement endpoints.
 */
export const requireEnforcementRole = requireRoles([
  Role.EU_REGULATOR,
  Role.ADMIN,
  Role.REGIONAL_REGULATOR
]);
