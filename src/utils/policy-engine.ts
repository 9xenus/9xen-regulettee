import { logger } from './logger';

// Open Policy Agent (OPA) Evaluation Logic
// In a full production env, this would call out to an OPA sidecar or Rego engine.
// Here we implement the evaluator pattern using Rego-like declarative logic.

export interface PolicyContext {
  user: {
    id: string;
    role: string;
    tenantId: string;
  };
  resource: string;
  action: string;
}

export const evaluatePolicy = async (context: PolicyContext): Promise<boolean> => {
  const { user, resource, action } = context;

  logger.info(`Evaluating policy for ${user.id} on ${resource}:${action}`);

  // Declarative Policy Mapping (Rego Style)
  const policies: Record<string, string[]> = {
    'TENANT_OWNER': ['tenant:read', 'tenant:write', 'user:manage', 'compliance:audit'],
    'EU_REGULATOR': ['compliance:read', 'audit:read', 'report:generate'],
    'COMPLIANCE_OFFICER': ['compliance:read', 'compliance:write', 'audit:read'],
  };

  const allowedActions = policies[user.role] || [];

  if (allowedActions.includes('*')) return true;
  
  const isAllowed = allowedActions.includes(`${resource}:${action}`);
  
  if (!isAllowed) {
    logger.warn(`Policy Denied: User ${user.id} (${user.role}) attempted ${action} on ${resource}`);
  }

  return isAllowed;
};
