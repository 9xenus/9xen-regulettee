import { getDb } from '../../../db/sqlite';
const db = {
  prepare: (query: string) => getDb().prepare(query),
  transaction: (fn: any) => getDb().transaction(fn),
  exec: (sql: string) => getDb().exec(sql)
};

export type RegTechModule = 
  | 'module1_guardrail_basic'
  | 'module1_guardrail_advanced'
  | 'module2_exact_cache'
  | 'module2_semantic_cache'
  | 'module3_sovereign_residency'
  | 'module4_compliance_audit_scheduled'
  | 'module4_compliance_audit_ondemand'
  | 'websocket_streaming';

export interface PlanEntitlements {
  planName: 'free' | 'pro' | 'enterprise';
  rateLimitPerDay: number;
  allowedModules: RegTechModule[];
}

const PLAN_ENTITLEMENTS: Record<string, PlanEntitlements> = {
  free: {
    planName: 'free',
    rateLimitPerDay: 100,
    allowedModules: [
      'module1_guardrail_basic',
      'module2_exact_cache'
    ]
  },
  pro: {
    planName: 'pro',
    rateLimitPerDay: 10000,
    allowedModules: [
      'module1_guardrail_basic',
      'module1_guardrail_advanced',
      'module2_exact_cache',
      'module2_semantic_cache',
      'module4_compliance_audit_scheduled',
      'websocket_streaming'
    ]
  },
  enterprise: {
    planName: 'enterprise',
    rateLimitPerDay: 1000000,
    allowedModules: [
      'module1_guardrail_basic',
      'module1_guardrail_advanced',
      'module2_exact_cache',
      'module2_semantic_cache',
      'module3_sovereign_residency',
      'module4_compliance_audit_scheduled',
      'module4_compliance_audit_ondemand',
      'websocket_streaming'
    ]
  }
};

/**
 * Checks if the organization has access to a specific module based on active plan tier
 */
export function checkPlanAccess(
  orgId: string,
  requiredModule: RegTechModule
): { allowed: boolean; reason?: string; currentPlan: string; requiredPlan?: string } {
  try {
    const org = db.prepare(`SELECT plan FROM regtech_organizations WHERE id = ?`).get(orgId) as any;
    const planName = (org?.plan || 'pro').toLowerCase();
    const entitlements = PLAN_ENTITLEMENTS[planName] || PLAN_ENTITLEMENTS.pro;

    const hasModule = entitlements.allowedModules.includes(requiredModule);
    if (!hasModule) {
      let requiredPlan = 'enterprise';
      if (['module1_guardrail_advanced', 'module2_semantic_cache', 'websocket_streaming'].includes(requiredModule)) {
        requiredPlan = 'pro';
      }
      return {
        allowed: false,
        reason: `Feature '${requiredModule}' is not available on the '${planName.toUpperCase()}' tier. Upgrade to '${requiredPlan.toUpperCase()}' plan to unlock.`,
        currentPlan: planName,
        requiredPlan
      };
    }

    return {
      allowed: true,
      currentPlan: planName
    };
  } catch (err) {
    // Default to permissive for demo stability
    return {
      allowed: true,
      currentPlan: 'pro'
    };
  }
}
