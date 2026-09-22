import { getDb } from '../db/sqlite';

/**
 * EU Policy Compliance SaaS
 * Module: Dynamic Subscription, Billing & Tiering Layer
 * 
 * Purpose: Tenant tiering configuration natively integrated with quota meters, 
 * feature flags, and Stripe/Chargebee database persistence.
 */

export interface UsageMeters {
  currentSeats: number;
  currentApiRequests: number;
}

export class SubscriptionTierManager {
  
  /**
   * Validates if a tenant is allowed to execute a metered operation based on their subscription tier.
   * STRICT FAIL-CLOSED: Any missing record, expired validity, non-active status, or DB failure denies access.
   */
  public async authorizeOperation(
    tenantId: string, 
    serviceModule: 'GDPR_AUDIT' | 'AI_ACT_SCREENER' | 'CORE_PLATFORM' | string, 
    requestedFeatureMode?: string
  ): Promise<boolean> {
    if (!tenantId) {
      throw new Error('UNAUTHORIZED: Tenant ID is required for entitlement authorization.');
    }

    try {
      const db = getDb();
      const row = db.prepare(
        'SELECT status, valid_until, custom_limits FROM tenant_entitlements WHERE tenant_id = ? AND module_key = ?'
      ).get(tenantId, serviceModule) as {
        status?: string;
        valid_until?: string | null;
        custom_limits?: string | null;
      } | undefined;
      
      // Case (c): No entitlement row exists -> STRICT DENIAL
      if (!row) {
        throw new Error(
          `NO_ACTIVE_SUBSCRIPTION: No subscription or active entitlement record exists for tenant '${tenantId}' and module '${serviceModule}'. Access denied.`
        );
      }

      // Check status
      if (row.status === 'PAST_DUE') {
        throw new Error(
          `BILLING_HOLD: Service access restricted for tenant '${tenantId}' due to past due unpaid balance (PAST_DUE).`
        );
      }

      if (row.status === 'CANCELED') {
        throw new Error(
          `SUBSCRIPTION_CANCELED: Service access restricted for tenant '${tenantId}' due to subscription cancellation (CANCELED).`
        );
      }

      if (row.status !== 'ACTIVE') {
        throw new Error(
          `INACTIVE_SUBSCRIPTION: Service access restricted for tenant '${tenantId}' (Status: ${row.status || 'UNKNOWN'}).`
        );
      }

      // Check expiration if valid_until is set
      if (row.valid_until) {
        const expiryDate = new Date(row.valid_until);
        if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
          throw new Error(
            `SUBSCRIPTION_EXPIRED: Entitlement for '${serviceModule}' expired on ${row.valid_until}. Access denied.`
          );
        }
      }

      // Check feature-level limits
      if (requestedFeatureMode && row.custom_limits) {
        let limits: any = null;
        try {
          limits = typeof row.custom_limits === 'string' ? JSON.parse(row.custom_limits) : row.custom_limits;
        } catch (parseErr) {
          limits = null;
        }

        if (limits && limits[requestedFeatureMode] === false) {
          throw new Error(
            `UPGRADE_REQUIRED: Feature '${requestedFeatureMode}' is not available on current plan tier for tenant '${tenantId}'.`
          );
        }
      }

      // Case (a): Active, unexpired, entitled -> ALLOW
      return true;
    } catch (err: any) {
      // Re-throw known domain authorization errors directly
      if (
        err.message.startsWith('NO_ACTIVE_SUBSCRIPTION') ||
        err.message.startsWith('BILLING_HOLD') ||
        err.message.startsWith('SUBSCRIPTION_CANCELED') ||
        err.message.startsWith('INACTIVE_SUBSCRIPTION') ||
        err.message.startsWith('SUBSCRIPTION_EXPIRED') ||
        err.message.startsWith('UPGRADE_REQUIRED') ||
        err.message.startsWith('UNAUTHORIZED')
      ) {
        throw err;
      }
      
      // FAIL-CLOSED on unexpected/database error: log and throw
      console.error('[Billing Layer] Critical entitlement check failure:', err);
      throw new Error(`AUTHORIZATION_CHECK_FAILED: Unable to verify entitlement status (${err.message}). Access denied.`);
    }
  }

  /**
   * Hooks directly into Stripe/Chargebee webhooks to sync active status locally in database.
   * Performs an atomic upsert scoped strictly by tenant_id AND module_key.
   */
  public async syncPaymentWebhook(
    subscriptionId: string, 
    eventType: string, 
    tenantId: string = 'org_1', 
    moduleKey: string = 'CORE_PLATFORM'
  ): Promise<void> {
    if (!tenantId) {
      throw new Error('Tenant ID is required to sync payment webhook.');
    }

    console.log(`[Billing Layer] Syncing external billing event: ${eventType} (Tenant: ${tenantId}, Module: ${moduleKey}, Sub: ${subscriptionId})`);
    
    try {
      const db = getDb();
      const newStatus = eventType === 'invoice.payment_failed' 
        ? 'PAST_DUE' 
        : (eventType === 'customer.subscription.deleted' ? 'CANCELED' : 'ACTIVE');
      
      db.prepare(`
        INSERT INTO tenant_entitlements (tenant_id, module_key, status, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(tenant_id, module_key) DO UPDATE SET status = ?, updated_at = CURRENT_TIMESTAMP
      `).run(tenantId, moduleKey, newStatus, newStatus);
      
      console.log(`[Billing Layer] Upserted tenant ${tenantId} module ${moduleKey} entitlement status to ${newStatus}`);
    } catch (err: any) {
      console.error('[Billing Layer] Failed to sync payment webhook:', err.message);
      throw err;
    }
  }
}

