import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';
import { extractUserFromRequest } from '../middleware/auth.js';

export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'COMPLIANCE_OFFICER' | 'AUDITOR' | 'LAWYER' | 'TENANT_USER' | 'REGULATOR' | 'PUBLIC';

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId?: string;
      tenantContext?: string;
    }
  }
}

/**
 * RBAC middleware that verifies whether the caller's role matches any allowed role.
 * User identity MUST come from a verified session token — never from client-supplied headers.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // In production or authenticated contexts, read role from the verified session only
    const verified = extractUserFromRequest(req);

    const userRole = (verified?.role || req.user?.role || '').toUpperCase() as UserRole;
    const tenantId = verified?.tenantId || req.user?.tenantId || '';
    const userId = verified?.userId || req.user?.userId || '';

    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Valid authentication token required for this statutory operation'
      });
    }

    req.user = {
      userId,
      tenantId,
      role: userRole
    };

    if (!allowedRoles.includes(userRole) && !allowedRoles.includes('PUBLIC') && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      logger.warn('RBAC authorization denied', {
        requestId: req.requestId,
        tenantId,
        path: req.originalUrl,
        method: req.method,
        meta: { requiredRoles: allowedRoles, providedRole: userRole }
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient privileges for this statutory operation',
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}