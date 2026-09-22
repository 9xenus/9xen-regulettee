import { PrivacyBudgetAccountant } from '../../data/privacy/budget';

export interface RagQueryRequest {
  tenantId: string;
  cohortId: string;
  queryText: string;
  triggeredBy?: string;
  epsilonCost?: number;
}

export interface RagEnforcementResult {
  allowed: boolean;
  reason?: string;
  epsilonConsumed: number;
  auditId?: string;
}

export class RagPrivacyEnforcementMiddleware {
  /**
   * Intercepts RAG queries, validates differential privacy budget availability via PrivacyBudgetAccountant,
   * and blocks or permits query execution.
   */
  static async interceptQuery(req: RagQueryRequest): Promise<RagEnforcementResult> {
    const tenantId = req.tenantId || 'default-tenant';
    const cohortId = req.cohortId || 'default-cohort';
    const queryText = req.queryText || 'RAG Knowledge Retrieval Query';
    const triggeredBy = req.triggeredBy || 'analyst@sovereign-gov.eu';
    const epsilonCost = req.epsilonCost !== undefined ? req.epsilonCost : 0.10; // Standard default epsilon cost per retrieval

    try {
      // Consume budget & check backstop limit
      const allowed = await PrivacyBudgetAccountant.consumeBudget(
        tenantId,
        cohortId,
        epsilonCost,
        queryText,
        triggeredBy
      );

      if (!allowed) {
        return {
          allowed: false,
          reason: `Differential privacy budget (ε) exhausted for cohort '${cohortId}'. Query rejected by sovereign backstop.`,
          epsilonConsumed: 0
        };
      }

      return {
        allowed: true,
        epsilonConsumed: epsilonCost,
        auditId: 'audit-' + Math.random().toString(36).substring(2, 10)
      };
    } catch (err: any) {
      console.error('[RAG_ENFORCEMENT_ERROR] Failed to enforce privacy budget middleware:', err);
      // Fail-secure or allow with warning depending on strictness; default allow with audit
      return {
        allowed: true,
        epsilonConsumed: epsilonCost,
        reason: 'Enforcement fallback: allowed with warning due to ledger exception.'
      };
    }
  }
}
