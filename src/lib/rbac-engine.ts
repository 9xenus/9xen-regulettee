import { Request, Response, NextFunction } from 'express';

/**
 * EU Policy Compliance SaaS
 * Module: RBAC & Granular Permission Engine
 * 
 * Purpose: Policy-based access control evaluating explicit permissions before.
 * executing mutations, supporting nested hierarchical roles.
 */

export interface ActiveSessionContext {
  userId: string;
  tenantId: string;
  roleId: string;
  isSuperAdmin: boolean;
  impersonatorId?: string;
  cachedPolicies: string[]; // e.g. ['tenant:read', 'audit:trigger']
}

export class RbacPermissionEngine {
  
  /**
   * Helper to ensure the active session context matches the requested tenant partition.
   */
  public static assertTenantIsolation(session: ActiveSessionContext, targetTenantId: string): void {
    if (session.isSuperAdmin) {
      // Super Admins in masquerade mode can bypass hard isolation logic
      return; 
    }
    
    if (session.tenantId !== targetTenantId) {
      throw new Error(`CRITICAL SECURITY ISOLATION BREACH: Sandbox violation attempted.`);
    }
  }

  /**
   * Primary authorization check confirming explicit permission assignment.
   */
  public static hasPermission(session: ActiveSessionContext, requiredPolicy: string): boolean {
    if (session.isSuperAdmin) return true;
    return session.cachedPolicies.includes(requiredPolicy);
  }
}

// ----------------------------------------------------------------------------
// EXPRESS MIDDLEWARE
// ----------------------------------------------------------------------------

export function requirePolicy(policy: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // In production, context is attached via JWT parsing middleware upstream
    const sessionContext = (req as any).sessionContext as ActiveSessionContext;

    if (!sessionContext) {
      return res.status(401).json({ error: 'No active session context' });
    }

    // Extract target tenant from params or body to enforce isolation
    const targetTenantId = req.params.tenantId || req.body.tenantId;
    if (targetTenantId) {
      try {
        RbacPermissionEngine.assertTenantIsolation(sessionContext, targetTenantId);
      } catch (e: any) {
         return res.status(403).json({ error: 'Tenant isolation violation', incident: e.message });
      }
    }

    if (!RbacPermissionEngine.hasPermission(sessionContext, policy)) {
      return res.status(403).json({ error: `Forbidden: Missing required policy -> ${policy}` });
    }

    next();
  };
}
