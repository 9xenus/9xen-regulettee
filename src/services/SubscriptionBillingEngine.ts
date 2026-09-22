/**
 * SubscriptionBillingEngine.ts
 * Comprehensive Subscription, Metered Billing, API Call Metering, 
 * and Zero-Downtime Deployment Management Engine.
 * 
 * Implements Phases 1 to 4:
 * 1. Subscription & Usage Quota Schema Management
 * 2. Asynchronous Metered Usage Counter & Circuit Breaker Middleware
 * 3. Client Self-Service Usage & API Key Portal Logic
 * 4. Zero-Downtime Database Migration & Canary Rollout Controller
 */

export interface UsageQuotas {
  includedKycCalls: number;
  includedAmlCalls: number;
  includedPrivacyAudits: number;
  overageKycRateUsd: number;
  overageKycRateBdt: number;
  overageAmlRateUsd: number;
  overageAmlRateBdt: number;
}

export interface FeatureAccessFlags {
  enableKycVerification: boolean;
  enableAmlMonitoring: boolean;
  enablePrivacyEngine: boolean;
  enableCustomApiKeys: boolean;
  enableSlaGuarantee: boolean;
  enableDedicatedReplica: boolean;
}

export interface PlanTier {
  id: string;
  name: 'Basic' | 'Pro' | 'Enterprise' | 'Legacy_Pro' | string;
  displayName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  basePriceUsd: number;
  basePriceBdt: number;
  currency: 'USD' | 'EUR' | 'BDT';
  quotas: UsageQuotas;
  features: FeatureAccessFlags;
  isCustomEnterprisePlan?: boolean;
}

export interface TenantSubscription {
  tenantId: string;
  tenantName: string;
  domain: string;
  planId: string;
  status: 'ACTIVE' | 'GRACE_PERIOD' | 'PAYMENT_FAILED' | 'CANCELLED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  customPriceOverrideUsd?: number;
  customPriceOverrideBdt?: number;
  customKycOverageRateUsd?: number;
  customAmlOverageRateUsd?: number;
  paymentMethod: 'STRIPE_CREDIT_CARD' | 'BKASH_MERCHANT' | 'INVOICE_NET30';
}

export interface ApiKeyRecord {
  keyId: string;
  tenantId: string;
  keyName: string;
  keyMasked: string; // e.g., "sk_live_9f82...4a12"
  rawKeySecret?: string; // Only shown once upon creation
  keyHash: string;
  rateLimitRpm: number;
  isRevoked: boolean;
  createdAt: string;
  lastUsedAt: string;
  environment: 'PRODUCTION' | 'SANDBOX';
}

export interface UsageMeterLog {
  tenantId: string;
  billingCycleYearMonth: string; // "2026-08"
  kycCallsUsed: number;
  amlCallsUsed: number;
  privacyAuditsUsed: number;
  pendingUnsyncedBuffer: number;
  lastSyncedTimestamp: string;
}

export interface InvoiceBreakdown {
  tenantId: string;
  tenantName: string;
  billingCycle: string;
  planName: string;
  baseFeeUsd: number;
  baseFeeBdt: number;
  kycUsageCount: number;
  kycIncludedQuota: number;
  kycOverageCount: number;
  kycOverageFeeUsd: number;
  kycOverageFeeBdt: number;
  amlUsageCount: number;
  amlIncludedQuota: number;
  amlOverageCount: number;
  amlOverageFeeUsd: number;
  amlOverageFeeBdt: number;
  totalDueUsd: number;
  totalDueBdt: number;
  status: 'UNPAID_DRAFT' | 'PAID' | 'OVERDUE';
}

export interface MiddlewareResult {
  authorized: boolean;
  httpStatusCode: 200 | 401 | 402 | 429 | 503;
  tenantId?: string;
  keyName?: string;
  endpoint: string;
  remainingQuota: number;
  isOverageAllowed: boolean;
  circuitBreakerTriggered: boolean;
  errorMessage?: string;
  payload?: any;
}

export interface MigrationScript {
  version: string;
  name: string;
  sqlUp: string;
  sqlDown: string;
  appliedAt?: string;
  isZeroDowntimeSafe: boolean;
}

export interface CanaryRolloutState {
  featureKey: string;
  trafficPercentage: number; // 0 to 100
  targetTiers: string[];
  status: 'TESTING_10' | 'EXPANDING_50' | 'FULL_RELEASE_100' | 'ROLLED_BACK';
  healthScorePercent: number;
}

import nodeCrypto from 'node:crypto';

class SubscriptionBillingEngine {
  private plans: Map<string, PlanTier> = new Map();
  private subscriptions: Map<string, TenantSubscription> = new Map();
  private apiKeys: Map<string, ApiKeyRecord> = new Map();
  private usageMeters: Map<string, UsageMeterLog> = new Map(); // tenantId -> usage
  private canaryRollouts: Map<string, CanaryRolloutState> = new Map();
  private migrations: MigrationScript[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Subscription Plans (Phase 1)
    const basicPlan: PlanTier = {
      id: 'plan_basic',
      name: 'Basic',
      displayName: 'Basic Starter',
      billingCycle: 'MONTHLY',
      basePriceUsd: 49,
      basePriceBdt: 5880,
      currency: 'USD',
      quotas: {
        includedKycCalls: 500,
        includedAmlCalls: 1000,
        includedPrivacyAudits: 5000,
        overageKycRateUsd: 0.10,
        overageKycRateBdt: 12,
        overageAmlRateUsd: 0.05,
        overageAmlRateBdt: 6
      },
      features: {
        enableKycVerification: true,
        enableAmlMonitoring: false,
        enablePrivacyEngine: true,
        enableCustomApiKeys: true,
        enableSlaGuarantee: false,
        enableDedicatedReplica: false
      }
    };

    const proPlan: PlanTier = {
      id: 'plan_pro',
      name: 'Pro',
      displayName: 'Pro Growth',
      billingCycle: 'MONTHLY',
      basePriceUsd: 299,
      basePriceBdt: 35880,
      currency: 'USD',
      quotas: {
        includedKycCalls: 5000,
        includedAmlCalls: 20000,
        includedPrivacyAudits: 100000,
        overageKycRateUsd: 0.05,
        overageKycRateBdt: 6,
        overageAmlRateUsd: 0.02,
        overageAmlRateBdt: 2.5
      },
      features: {
        enableKycVerification: true,
        enableAmlMonitoring: true,
        enablePrivacyEngine: true,
        enableCustomApiKeys: true,
        enableSlaGuarantee: true,
        enableDedicatedReplica: false
      }
    };

    const enterprisePlan: PlanTier = {
      id: 'plan_enterprise',
      name: 'Enterprise',
      displayName: 'Enterprise Sovereign',
      billingCycle: 'YEARLY',
      basePriceUsd: 1499,
      basePriceBdt: 179880,
      currency: 'USD',
      quotas: {
        includedKycCalls: 50000,
        includedAmlCalls: 200000,
        includedPrivacyAudits: 1000000,
        overageKycRateUsd: 0.02,
        overageKycRateBdt: 2.5,
        overageAmlRateUsd: 0.01,
        overageAmlRateBdt: 1.2
      },
      features: {
        enableKycVerification: true,
        enableAmlMonitoring: true,
        enablePrivacyEngine: true,
        enableCustomApiKeys: true,
        enableSlaGuarantee: true,
        enableDedicatedReplica: true
      },
      isCustomEnterprisePlan: true
    };

    const legacyProPlan: PlanTier = {
      id: 'plan_legacy_pro',
      name: 'Legacy_Pro',
      displayName: 'Legacy Pro Tier (Grandfathered)',
      billingCycle: 'MONTHLY',
      basePriceUsd: 199,
      basePriceBdt: 23880,
      currency: 'USD',
      quotas: {
        includedKycCalls: 3000,
        includedAmlCalls: 10000,
        includedPrivacyAudits: 50000,
        overageKycRateUsd: 0.05,
        overageKycRateBdt: 6,
        overageAmlRateUsd: 0.02,
        overageAmlRateBdt: 2.5
      },
      features: {
        enableKycVerification: true,
        enableAmlMonitoring: true,
        enablePrivacyEngine: true,
        enableCustomApiKeys: true,
        enableSlaGuarantee: false,
        enableDedicatedReplica: false
      }
    };

    this.plans.set(basicPlan.id, basicPlan);
    this.plans.set(proPlan.id, proPlan);
    this.plans.set(enterprisePlan.id, enterprisePlan);
    this.plans.set(legacyProPlan.id, legacyProPlan);

    // 2. Seed Tenant Subscriptions
    const sub1: TenantSubscription = {
      tenantId: 'tenant_1',
      tenantName: 'Sovereign Bank Corp',
      domain: 'sovereign-bank.eu',
      planId: enterprisePlan.id,
      status: 'ACTIVE',
      currentPeriodStart: '2026-08-01',
      currentPeriodEnd: '2026-08-31',
      paymentMethod: 'INVOICE_NET30'
    };

    const sub2: TenantSubscription = {
      tenantId: 'tenant_2',
      tenantName: 'Dhaka FinTech Services',
      domain: 'dhakafin.com.bd',
      planId: proPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: '2026-08-01',
      currentPeriodEnd: '2026-08-31',
      paymentMethod: 'BKASH_MERCHANT'
    };

    const sub3: TenantSubscription = {
      tenantId: 'tenant_3',
      tenantName: 'Legacy Merchant Solutions',
      domain: 'legacy-merchant.io',
      planId: legacyProPlan.id,
      status: 'GRACE_PERIOD',
      currentPeriodStart: '2026-07-15',
      currentPeriodEnd: '2026-08-15',
      paymentMethod: 'STRIPE_CREDIT_CARD'
    };

    this.subscriptions.set(sub1.tenantId, sub1);
    this.subscriptions.set(sub2.tenantId, sub2);
    this.subscriptions.set(sub3.tenantId, sub3);

    // 3. Seed API Keys — use cryptographically secure random keys, never hardcoded production keys
    this.createApiKey('tenant_1', 'Production e-KYC Integration Key', 'PRODUCTION', `sk_live_${nodeCrypto.randomBytes(24).toString('hex')}`);
    this.createApiKey('tenant_2', 'Dhaka FinTech Core Gateway Key', 'PRODUCTION', `sk_live_${nodeCrypto.randomBytes(24).toString('hex')}`);

    // 4. Seed Usage Meters
    this.usageMeters.set('tenant_1', {
      tenantId: 'tenant_1',
      billingCycleYearMonth: '2026-08',
      kycCallsUsed: 12450,
      amlCallsUsed: 48900,
      privacyAuditsUsed: 110200,
      pendingUnsyncedBuffer: 0,
      lastSyncedTimestamp: new Date().toISOString()
    });

    this.usageMeters.set('tenant_2', {
      tenantId: 'tenant_2',
      billingCycleYearMonth: '2026-08',
      kycCallsUsed: 6200, // Exceeds 5000 Pro quota -> 1200 overage
      amlCallsUsed: 18400,
      privacyAuditsUsed: 42000,
      pendingUnsyncedBuffer: 4,
      lastSyncedTimestamp: new Date().toISOString()
    });

    // 5. Seed Canary Rollout State (Phase 4)
    this.canaryRollouts.set('ENABLE_METERED_RATE_LIMITER', {
      featureKey: 'ENABLE_METERED_RATE_LIMITER',
      trafficPercentage: 50,
      targetTiers: ['Pro', 'Enterprise'],
      status: 'EXPANDING_50',
      healthScorePercent: 99.98
    });

    // 6. Seed Non-blocking DB Migrations
    this.migrations = [
      {
        version: 'V2.1__add_tenant_subscriptions.sql',
        name: 'Create Tenant Subscriptions and Usage Quotas Tables',
        sqlUp: `CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  tenant_id VARCHAR(64) PRIMARY KEY,
  plan_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  current_period_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_period_end TIMESTAMP NOT NULL,
  custom_price_usd NUMERIC(10, 2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_sub_status ON tenant_subscriptions(status);`,
        sqlDown: `DROP TABLE IF EXISTS tenant_subscriptions;`,
        appliedAt: '2026-08-01 00:00:00',
        isZeroDowntimeSafe: true
      },
      {
        version: 'V2.2__add_api_keys_and_usage_logs.sql',
        name: 'Create API Keys Hash Registry and Usage Counter Buffer',
        sqlUp: `CREATE TABLE IF NOT EXISTS api_keys (
  key_id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  key_hash VARCHAR(128) NOT NULL UNIQUE,
  key_masked VARCHAR(32) NOT NULL,
  rate_limit_rpm INT DEFAULT 120,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);`,
        sqlDown: `DROP TABLE IF EXISTS api_keys;`,
        appliedAt: '2026-08-01 00:05:00',
        isZeroDowntimeSafe: true
      }
    ];
  }

  // --- Phase 1: Subscription & Plan Management ---

  public getAllPlans(): PlanTier[] {
    return Array.from(this.plans.values());
  }

  public getPlanById(planId: string): PlanTier | undefined {
    return this.plans.get(planId);
  }

  public createOrUpdatePlan(plan: PlanTier): PlanTier {
    this.plans.set(plan.id, plan);
    return plan;
  }

  public getTenantSubscription(tenantId: string): TenantSubscription | undefined {
    return this.subscriptions.get(tenantId);
  }

  public getAllSubscriptions(): TenantSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public updateTenantSubscription(
    tenantId: string,
    planId: string,
    status: 'ACTIVE' | 'GRACE_PERIOD' | 'PAYMENT_FAILED' | 'CANCELLED' = 'ACTIVE',
    customOverrides?: {
      customPriceOverrideUsd?: number;
      customKycOverageRateUsd?: number;
      customAmlOverageRateUsd?: number;
    }
  ): TenantSubscription {
    const existing = this.subscriptions.get(tenantId);
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan ID '${planId}' not found.`);

    const updated: TenantSubscription = {
      tenantId,
      tenantName: existing?.tenantName || `Tenant ${tenantId}`,
      domain: existing?.domain || 'company.com',
      planId,
      status,
      currentPeriodStart: new Date().toISOString().substring(0, 10),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      paymentMethod: existing?.paymentMethod || 'STRIPE_CREDIT_CARD',
      ...customOverrides
    };

    this.subscriptions.set(tenantId, updated);
    return updated;
  }

  // --- Phase 1 & 3: API Key Management ---

  public async generateSHA256(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public createApiKey(
    tenantId: string,
    keyName: string,
    environment: 'PRODUCTION' | 'SANDBOX' = 'PRODUCTION',
    customRawKey?: string
  ): { record: ApiKeyRecord; rawSecretKey: string } {
    const keyId = `KEY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const rawSecretKey = customRawKey || `sk_${environment.toLowerCase()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const keyMasked = `${rawSecretKey.substring(0, 8)}...${rawSecretKey.substring(rawSecretKey.length - 4)}`;
    
    // Hash key synchronously for mock/demo
    const keyHash = `hash_${rawSecretKey}`;

    const record: ApiKeyRecord = {
      keyId,
      tenantId,
      keyName,
      keyMasked,
      rawKeySecret: rawSecretKey,
      keyHash,
      rateLimitRpm: 120,
      isRevoked: false,
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Never',
      environment
    };

    this.apiKeys.set(keyId, record);
    return { record, rawSecretKey };
  }

  public getApiKeysForTenant(tenantId: string): ApiKeyRecord[] {
    return Array.from(this.apiKeys.values()).filter(k => k.tenantId === tenantId);
  }

  public revokeApiKey(keyId: string): boolean {
    const key = this.apiKeys.get(keyId);
    if (!key) return false;
    key.isRevoked = true;
    return true;
  }

  // --- Phase 2: Metered Billing Middleware & Circuit Breaker ---

  public async verifyAndMeterApiCall(
    rawApiKey: string,
    serviceModule: 'E_KYC' | 'AI_AML' | 'PRIVACY_ENGINE'
  ): Promise<MiddlewareResult> {
    // Find key
    const keyRecord = Array.from(this.apiKeys.values()).find(
      k => k.rawKeySecret === rawApiKey || k.keyHash === `hash_${rawApiKey}`
    );

    if (!keyRecord || keyRecord.isRevoked) {
      return {
        authorized: false,
        httpStatusCode: 401,
        endpoint: serviceModule,
        remainingQuota: 0,
        isOverageAllowed: false,
        circuitBreakerTriggered: false,
        errorMessage: 'UNAUTHORIZED_API_KEY: Invalid, missing, or revoked API key.'
      };
    }

    const tenantId = keyRecord.tenantId;
    const sub = this.subscriptions.get(tenantId);
    if (!sub) {
      return {
        authorized: false,
        httpStatusCode: 402,
        endpoint: serviceModule,
        remainingQuota: 0,
        isOverageAllowed: false,
        circuitBreakerTriggered: true,
        errorMessage: 'PAYMENT_REQUIRED: No active subscription found for tenant.'
      };
    }

    if (sub.status === 'CANCELLED' || sub.status === 'PAYMENT_FAILED') {
      return {
        authorized: false,
        httpStatusCode: 402,
        endpoint: serviceModule,
        remainingQuota: 0,
        isOverageAllowed: false,
        circuitBreakerTriggered: true,
        errorMessage: 'PAYMENT_REQUIRED: Subscription is suspended due to unpaid bill or cancellation.'
      };
    }

    const plan = this.plans.get(sub.planId);
    if (!plan) {
      return {
        authorized: false,
        httpStatusCode: 503,
        endpoint: serviceModule,
        remainingQuota: 0,
        isOverageAllowed: false,
        circuitBreakerTriggered: true,
        errorMessage: 'PLAN_NOT_FOUND: Subscribed plan schema missing.'
      };
    }

    // Check Feature Access
    if (serviceModule === 'E_KYC' && !plan.features.enableKycVerification) {
      return {
        authorized: false,
        httpStatusCode: 402,
        endpoint: serviceModule,
        remainingQuota: 0,
        isOverageAllowed: false,
        circuitBreakerTriggered: false,
        errorMessage: 'FEATURE_DISABLED: e-KYC Verification is not included in current plan. Upgrade required.'
      };
    }

    if (serviceModule === 'AI_AML' && !plan.features.enableAmlMonitoring) {
      return {
        authorized: false,
        httpStatusCode: 402,
        endpoint: serviceModule,
        remainingQuota: 0,
        isOverageAllowed: false,
        circuitBreakerTriggered: false,
        errorMessage: 'FEATURE_DISABLED: Real-Time AI AML is not included in current plan. Upgrade required.'
      };
    }

    // Usage Metering Check
    let usage = this.usageMeters.get(tenantId);
    if (!usage) {
      usage = {
        tenantId,
        billingCycleYearMonth: '2026-08',
        kycCallsUsed: 0,
        amlCallsUsed: 0,
        privacyAuditsUsed: 0,
        pendingUnsyncedBuffer: 0,
        lastSyncedTimestamp: new Date().toISOString()
      };
      this.usageMeters.set(tenantId, usage);
    }

    let quotaLimit = 0;
    let currentUsage = 0;

    if (serviceModule === 'E_KYC') {
      quotaLimit = plan.quotas.includedKycCalls;
      currentUsage = usage.kycCallsUsed;
    } else if (serviceModule === 'AI_AML') {
      quotaLimit = plan.quotas.includedAmlCalls;
      currentUsage = usage.amlCallsUsed;
    } else {
      quotaLimit = plan.quotas.includedPrivacyAudits;
      currentUsage = usage.privacyAuditsUsed;
    }

    const isExceeded = currentUsage >= quotaLimit;
    const remainingQuota = Math.max(0, quotaLimit - currentUsage);

    // If quota exceeded and plan status is GRACE_PERIOD without overage allowed -> trigger 429
    if (isExceeded && sub.status === 'GRACE_PERIOD') {
      return {
        authorized: false,
        httpStatusCode: 429,
        tenantId,
        keyName: keyRecord.keyName,
        endpoint: serviceModule,
        remainingQuota: 0,
        isOverageAllowed: false,
        circuitBreakerTriggered: true,
        errorMessage: 'QUOTA_EXCEEDED_GRACE_HOLD: Monthly quota exhausted and account in Grace Period. Please add payment method to continue.'
      };
    }

    // Increment Usage asynchronously in Redis/In-memory buffer
    if (serviceModule === 'E_KYC') usage.kycCallsUsed += 1;
    else if (serviceModule === 'AI_AML') usage.amlCallsUsed += 1;
    else usage.privacyAuditsUsed += 1;

    usage.pendingUnsyncedBuffer += 1;
    keyRecord.lastUsedAt = new Date().toISOString();

    return {
      authorized: true,
      httpStatusCode: 200,
      tenantId,
      keyName: keyRecord.keyName,
      endpoint: serviceModule,
      remainingQuota: Math.max(0, remainingQuota - 1),
      isOverageAllowed: isExceeded,
      circuitBreakerTriggered: false,
      payload: {
        status: 'SUCCESS',
        meteredAt: new Date().toISOString(),
        isOverageUnit: isExceeded
      }
    };
  }

  // --- Phase 2: Monthly Invoice & Overage Calculator ---

  public calculateInvoiceForTenant(tenantId: string): InvoiceBreakdown {
    return this.calculateMonthlyInvoice(tenantId);
  }

  public generateApiKeyForTenant(
    tenantId: string,
    keyName: string,
    environment: 'PRODUCTION' | 'SANDBOX' = 'PRODUCTION'
  ): ApiKeyRecord {
    const res = this.createApiKey(tenantId, keyName, environment);
    return res.record;
  }

  public setCustomPriceOverride(tenantId: string, customPriceOverrideUsd: number, customKycOverageRateUsd: number): TenantSubscription {
    const sub = this.subscriptions.get(tenantId);
    if (!sub) throw new Error(`Tenant '${tenantId}' not found.`);
    sub.customPriceOverrideUsd = customPriceOverrideUsd;
    sub.customKycOverageRateUsd = customKycOverageRateUsd;
    return sub;
  }

  public verifyAndMeterApiRequest(
    rawApiKey: string,
    serviceModule: 'E_KYC' | 'AI_AML' | 'PRIVACY_ENGINE'
  ): MiddlewareResult {
    const keyRecord = Array.from(this.apiKeys.values()).find(
      k => k.rawKeySecret === rawApiKey || k.keyHash === `hash_${rawApiKey}` || k.keyMasked === rawApiKey
    );

    if (!keyRecord || keyRecord.isRevoked) {
      return {
        authorized: false,
        httpStatusCode: 401,
        endpoint: serviceModule,
        remainingQuota: 0,
        isOverageAllowed: false,
        circuitBreakerTriggered: false,
        errorMessage: 'UNAUTHORIZED_API_KEY: Invalid, missing, or revoked API key.'
      };
    }

    const tenantId = keyRecord.tenantId;
    const sub = this.subscriptions.get(tenantId);
    const plan = this.plans.get(sub?.planId || 'plan_basic');
    const usage = this.usageMeters.get(tenantId) || {
      tenantId,
      billingCycleYearMonth: '2026-08',
      kycCallsUsed: 0,
      amlCallsUsed: 0,
      privacyAuditsUsed: 0,
      pendingUnsyncedBuffer: 0,
      lastSyncedTimestamp: new Date().toISOString()
    };
    this.usageMeters.set(tenantId, usage);

    if (serviceModule === 'E_KYC') usage.kycCallsUsed += 1;
    else if (serviceModule === 'AI_AML') usage.amlCallsUsed += 1;
    else usage.privacyAuditsUsed += 1;

    usage.pendingUnsyncedBuffer += 1;
    keyRecord.lastUsedAt = new Date().toISOString();

    const quotaLimit = plan ? plan.quotas.includedKycCalls : 1000;
    const remainingQuota = Math.max(0, quotaLimit - usage.kycCallsUsed);

    return {
      authorized: true,
      httpStatusCode: 200,
      tenantId,
      keyName: keyRecord.keyName,
      endpoint: serviceModule,
      remainingQuota,
      isOverageAllowed: usage.kycCallsUsed > quotaLimit,
      circuitBreakerTriggered: false,
      payload: {
        status: 'SUCCESS',
        meteredAt: new Date().toISOString()
      }
    };
  }

  public updatePlanConfig(planId: string, partial: Partial<PlanTier>): PlanTier {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error(`Plan '${planId}' not found.`);
    Object.assign(plan, partial);
    return plan;
  }

  public calculateMonthlyInvoice(tenantId: string): InvoiceBreakdown {
    const sub = this.subscriptions.get(tenantId);
    const tenantName = sub?.tenantName || tenantId;
    const plan = this.plans.get(sub?.planId || 'plan_basic') || Array.from(this.plans.values())[0];
    const usage = this.usageMeters.get(tenantId) || {
      tenantId,
      billingCycleYearMonth: '2026-08',
      kycCallsUsed: 0,
      amlCallsUsed: 0,
      privacyAuditsUsed: 0,
      pendingUnsyncedBuffer: 0,
      lastSyncedTimestamp: new Date().toISOString()
    };

    const baseFeeUsd = sub?.customPriceOverrideUsd !== undefined ? sub.customPriceOverrideUsd : plan.basePriceUsd;
    const baseFeeBdt = sub?.customPriceOverrideBdt !== undefined ? sub.customPriceOverrideBdt : plan.basePriceBdt;

    // KYC Overage
    const kycOverage = Math.max(0, usage.kycCallsUsed - plan.quotas.includedKycCalls);
    const kycRateUsd = sub?.customKycOverageRateUsd !== undefined ? sub.customKycOverageRateUsd : plan.quotas.overageKycRateUsd;
    const kycRateBdt = plan.quotas.overageKycRateBdt;
    const kycOverageFeeUsd = Number((kycOverage * kycRateUsd).toFixed(2));
    const kycOverageFeeBdt = Number((kycOverage * kycRateBdt).toFixed(2));

    // AML Overage
    const amlOverage = Math.max(0, usage.amlCallsUsed - plan.quotas.includedAmlCalls);
    const amlRateUsd = sub?.customAmlOverageRateUsd !== undefined ? sub.customAmlOverageRateUsd : plan.quotas.overageAmlRateUsd;
    const amlRateBdt = plan.quotas.overageAmlRateBdt;
    const amlOverageFeeUsd = Number((amlOverage * amlRateUsd).toFixed(2));
    const amlOverageFeeBdt = Number((amlOverage * amlRateBdt).toFixed(2));

    const totalDueUsd = Number((baseFeeUsd + kycOverageFeeUsd + amlOverageFeeUsd).toFixed(2));
    const totalDueBdt = Number((baseFeeBdt + kycOverageFeeBdt + amlOverageFeeBdt).toFixed(2));

    return {
      tenantId,
      tenantName,
      billingCycle: 'August 2026',
      planName: plan.displayName,
      baseFeeUsd,
      baseFeeBdt,
      kycUsageCount: usage.kycCallsUsed,
      kycIncludedQuota: plan.quotas.includedKycCalls,
      kycOverageCount: kycOverage,
      kycOverageFeeUsd,
      kycOverageFeeBdt,
      amlUsageCount: usage.amlCallsUsed,
      amlIncludedQuota: plan.quotas.includedAmlCalls,
      amlOverageCount: amlOverage,
      amlOverageFeeUsd,
      amlOverageFeeBdt,
      totalDueUsd,
      totalDueBdt,
      status: sub?.status === 'ACTIVE' ? 'PAID' : 'UNPAID_DRAFT'
    };
  }

  // --- Phase 2: Sync Memory Buffer to Database ---

  public flushUsageBufferToDb(): { syncedCount: number; timestamp: string } {
    let synced = 0;
    this.usageMeters.forEach(meter => {
      if (meter.pendingUnsyncedBuffer > 0) {
        synced += meter.pendingUnsyncedBuffer;
        meter.pendingUnsyncedBuffer = 0;
        meter.lastSyncedTimestamp = new Date().toISOString();
      }
    });
    return { syncedCount: synced, timestamp: new Date().toISOString() };
  }

  public getUsageMeter(tenantId: string): UsageMeterLog | undefined {
    return this.usageMeters.get(tenantId);
  }

  public grantUsageCredits(tenantId: string, kycCredits: number, amlCredits: number): UsageMeterLog {
    let usage = this.usageMeters.get(tenantId);
    if (!usage) {
      usage = {
        tenantId,
        billingCycleYearMonth: '2026-08',
        kycCallsUsed: 0,
        amlCallsUsed: 0,
        privacyAuditsUsed: 0,
        pendingUnsyncedBuffer: 0,
        lastSyncedTimestamp: new Date().toISOString()
      };
      this.usageMeters.set(tenantId, usage);
    }
    usage.kycCallsUsed = Math.max(0, usage.kycCallsUsed - kycCredits);
    usage.amlCallsUsed = Math.max(0, usage.amlCallsUsed - amlCredits);
    return usage;
  }

  public resetTenantApiKeys(tenantId: string): ApiKeyRecord[] {
    const existing = this.getApiKeysForTenant(tenantId);
    existing.forEach(k => {
      k.isRevoked = true;
    });
    const sub = this.subscriptions.get(tenantId);
    const tenantName = sub?.tenantName || tenantId;
    this.generateApiKeyForTenant(tenantId, `${tenantName} Reset Emergency Key`);
    return this.getApiKeysForTenant(tenantId);
  }

  // --- Phase 4: Zero-Downtime Deployment & Canary Rollout ---

  public getMigrations(): MigrationScript[] {
    return this.migrations;
  }

  public getCanaryRollouts(): CanaryRolloutState[] {
    return Array.from(this.canaryRollouts.values());
  }

  public updateCanaryPercentage(featureKey: string, newPercentage: number): CanaryRolloutState {
    let rollout = this.canaryRollouts.get(featureKey);
    if (!rollout) {
      rollout = {
        featureKey,
        trafficPercentage: newPercentage,
        targetTiers: ['Pro', 'Enterprise'],
        status: newPercentage >= 100 ? 'FULL_RELEASE_100' : 'EXPANDING_50',
        healthScorePercent: 99.98
      };
      this.canaryRollouts.set(featureKey, rollout);
    } else {
      rollout.trafficPercentage = newPercentage;
      if (newPercentage === 0) rollout.status = 'ROLLED_BACK';
      else if (newPercentage <= 20) rollout.status = 'TESTING_10';
      else if (newPercentage < 100) rollout.status = 'EXPANDING_50';
      else rollout.status = 'FULL_RELEASE_100';
    }
    return rollout;
  }
}

export const subscriptionBillingEngine = new SubscriptionBillingEngine();
export default subscriptionBillingEngine;
