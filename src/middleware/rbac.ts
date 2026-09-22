import { Request, Response, NextFunction } from 'express';
import { hasPermission, ModuleKey, PermissionAction } from '../lib/rbac-config';
import { extractUserFromRequest } from './auth.js';

export const checkPermission = (module: ModuleKey, action: PermissionAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // User identity MUST come from a verified session token — never from client-supplied headers
    const user = extractUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Valid authentication token required' });
    }

    // Super admin bypass is derived from the verified session, not from a spoofable header
    if (user.role === 'super_admin' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return next();
    }

    const authorized = hasPermission(user.userId, user.tenantId, module, action);

    if (!authorized) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions to ${action} on ${module}`
      });
    }

    next();
  };
};