import { v4 as uuidv4 } from 'uuid';

export interface RateLimitPolicy {
  id: string;
  name: string;
  description: string;
  windowMs: number;
  maxRequests: number;
  burstAllowance: number;
  autoJailThreshold: number; // number of violations before IP is jailed
  autoJailDurationMs: number; // jail duration (e.g., 30 mins)
  errorMessage: string;
  statusCode: number;
  enabled: boolean;
}

export interface ClientBucket {
  key: string;
  policyId: string;
  timestamps: number[];
  violationCount: number;
  lastViolationAt: number;
  jailedUntil: number | null;
  jailReason: string | null;
  totalRequestsCount: number;
  totalBlockedCount: number;
}

export interface RateLimitAuditLog {
  id: string;
  timestamp: string;
  ip: string;
  path: string;
  method: string;
  policy: string;
  reason: 'EXCEEDED_RATE_LIMIT' | 'JAILED_IP' | 'BRUTE_FORCE_SUSPECT' | 'BURST_VIOLATION' | 'MANUAL_BLACKLIST';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userAgent: string;
  tenantId?: string;
  retryAfterSeconds: number;
  blockedCountForIp: number;
}

export interface RateLimitResult {
  allowed: boolean;
  statusCode: number;
  headers: {
    'X-RateLimit-Limit': number;
    'X-RateLimit-Remaining': number;
    'X-RateLimit-Reset': number;
    'Retry-After'?: number;
    'X-RateLimit-Tier': string;
    'X-RateLimit-Policy': string;
    'X-Security-Protection': string;
  };
  reason?: string;
  errorMessage?: string;
  retryAfterSeconds?: number;
  jailed?: boolean;
}

export interface IpJailRecord {
  ip: string;
  reason: string;
  jailedAt: string;
  expiresAt: string;
  violationCount: number;
  manual: boolean;
}

export interface WhitelistRecord {
  ipOrPrefix: string;
  description: string;
  addedAt: string;
}

class CentralizedRateLimiterService {
  private policies: Map<string, RateLimitPolicy> = new Map();
  private clientBuckets: Map<string, ClientBucket> = new Map();
  private jailedIps: Map<string, IpJailRecord> = new Map();
  private whitelistedIps: Map<string, WhitelistRecord> = new Map();
  private auditLogs: RateLimitAuditLog[] = [];
  private totalInspectedRequests = 0;
  private totalBlockedRequests = 0;
  private totalBruteForceMitigations = 0;
  private startedAt = new Date().toISOString();

  constructor() {
    this.initDefaultPolicies();
    this.initDefaultWhitelist();
    this.startCleanupInterval();
  }

  private initDefaultPolicies() {
    // 1. Administrative Tier: Strict brute-force protection for control panel & credentials
    this.policies.set('admin', {
      id: 'admin',
      name: 'Administrative & SuperAdmin Control Tier',
      description: 'Strict rate limit and anti-brute-force defense protecting /api/v1/saas-admin, /api/v1/admin, and privileged routes',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 45, // 45 req / min
      burstAllowance: 15,
      autoJailThreshold: 4, // 4 violations within 10 min -> jail
      autoJailDurationMs: 30 * 60 * 1000, // 30 minutes quarantine
      errorMessage: 'Administrative API rate limit exceeded. Brute-force protection engaged. Retry in a few moments.',
      statusCode: 429,
      enabled: true,
    });

    // 2. Auth & MFA Tier: Hyper-strict defense for authentication, login, and passkeys
    this.policies.set('auth', {
      id: 'auth',
      name: 'Authentication & Credential Exchange Tier',
      description: 'Defends login, MFA verification, password resets, and session issuance against credential stuffing and password spraying',
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 15, // 15 attempts / 15 min
      burstAllowance: 5,
      autoJailThreshold: 3,
      autoJailDurationMs: 45 * 60 * 1000, // 45 minutes
      errorMessage: 'Too many authentication attempts. Your IP has been temporarily throttled for security.',
      statusCode: 429,
      enabled: true,
    });

    // 3. Sensitive Operations Tier: Vault operations, cryptographic signing, financial settlements
    this.policies.set('sensitive', {
      id: 'sensitive',
      name: 'Sensitive Cryptographic & Financial Operations',
      description: 'Protects vault file encryption, key rotation, Nexi XPay settlements, and killswitch modifications',
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 30, // 30 req / 5 min
      burstAllowance: 10,
      autoJailThreshold: 5,
      autoJailDurationMs: 20 * 60 * 1000,
      errorMessage: 'Rate limit for high-sensitivity operations exceeded. Please stagger requests.',
      statusCode: 429,
      enabled: true,
    });

    // 4. Tenant API & Integration Tier: Data ingestion, regulatory scans, and partner endpoints
    this.policies.set('tenant_api', {
      id: 'tenant_api',
      name: 'Tenant Ingestion & Scans API Tier',
      description: 'Scalable rate limiting based on SaaS tenant entitlement tiers and partner integrations',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 300, // 300 req / min default
      burstAllowance: 60,
      autoJailThreshold: 10,
      autoJailDurationMs: 15 * 60 * 1000,
      errorMessage: 'Tenant API request quota reached for the current time window. Please upgrade tier or throttle requests.',
      statusCode: 429,
      enabled: true,
    });

    // 5. Global API Baseline: General API defense for all endpoints
    this.policies.set('global', {
      id: 'global',
      name: 'Global SaaS API Baseline Protection',
      description: 'Underlying baseline protection against denial of service and API scraping for all /api/* routes',
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 800, // 800 req / 5 min
      burstAllowance: 150,
      autoJailThreshold: 15,
      autoJailDurationMs: 10 * 60 * 1000,
      errorMessage: 'Platform API traffic rate limit exceeded. Please throttle requests.',
      statusCode: 429,
      enabled: true,
    });
  }

  private initDefaultWhitelist() {
    this.whitelistedIps.set('127.0.0.1', {
      ipOrPrefix: '127.0.0.1',
      description: 'Localhost Loopback IPv4',
      addedAt: new Date().toISOString()
    });
    this.whitelistedIps.set('::1', {
      ipOrPrefix: '::1',
      description: 'Localhost Loopback IPv6',
      addedAt: new Date().toISOString()
    });
    this.whitelistedIps.set('::ffff:127.0.0.1', {
      ipOrPrefix: '::ffff:127.0.0.1',
      description: 'IPv4-mapped Localhost',
      addedAt: new Date().toISOString()
    });
  }

  private startCleanupInterval() {
    // Run cleanup every 2 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 2 * 60 * 1000);
  }

  private cleanupExpiredEntries() {
    const now = Date.now();

    // Clean expired jailees
    for (const [ip, jailRecord] of this.jailedIps.entries()) {
      if (!jailRecord.manual && new Date(jailRecord.expiresAt).getTime() <= now) {
        this.jailedIps.delete(ip);
      }
    }

    // Clean old timestamps in client buckets
    for (const [key, bucket] of this.clientBuckets.entries()) {
      const policy = this.policies.get(bucket.policyId) || this.policies.get('global')!;
      const windowStart = now - policy.windowMs;
      bucket.timestamps = bucket.timestamps.filter(ts => ts > windowStart);

      // If bucket is inactive for > 1 hour and not jailed, prune it
      if (bucket.timestamps.length === 0 && (!bucket.jailedUntil || bucket.jailedUntil <= now)) {
        if (now - bucket.lastViolationAt > 60 * 60 * 1000) {
          this.clientBuckets.delete(key);
        }
      }
    }

    // Trim audit logs to max 1000
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(0, 1000);
    }
  }

  public isIpWhitelisted(ip: string): boolean {
    const cleanIp = (ip || '').replace(/^.*:/, '');
    if (this.whitelistedIps.has(ip) || this.whitelistedIps.has(cleanIp)) {
      return true;
    }
    for (const [entryIp] of this.whitelistedIps.entries()) {
      if (ip.startsWith(entryIp) || cleanIp.startsWith(entryIp)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determine the appropriate rate limiting policy for a given request path
   */
  public resolvePolicyForPath(path: string, method = 'GET'): string {
    const p = (path || '').toLowerCase();

    // Admin & SuperAdmin routes
    if (
      p.startsWith('/api/v1/saas-admin') ||
      p.startsWith('/api/v1/admin') ||
      p.startsWith('/api/admin') ||
      p.startsWith('/api/superadmin') ||
      p.includes('/admin/') ||
      p.includes('/security/audit') ||
      p.includes('/entitlements') ||
      p.includes('/killswitch')
    ) {
      return 'admin';
    }

    // Auth & Credential routes
    if (
      p.startsWith('/api/auth') ||
      p.startsWith('/api/v1/auth') ||
      p.includes('/login') ||
      p.includes('/mfa') ||
      p.includes('/passkey') ||
      p.includes('/oidc/token') ||
      p.includes('/oauth/token')
    ) {
      return 'auth';
    }

    // Sensitive high-risk operations
    if (
      p.includes('/vault/') ||
      p.includes('/payments/nexi') ||
      p.includes('/stripe/checkout') ||
      p.includes('/central-bank-settlement') ||
      p.includes('/red-teaming') ||
      p.includes('/crypto')
    ) {
      return 'sensitive';
    }

    // Tenant high volume API routes
    if (
      p.startsWith('/api/v1/prt') ||
      p.startsWith('/api/v1/compliance') ||
      p.startsWith('/api/v1/ai-knowledge') ||
      p.startsWith('/api/v1/intel') ||
      p.startsWith('/api/v1/caas') ||
      p.startsWith('/api/v1/integrations')
    ) {
      return 'tenant_api';
    }

    return 'global';
  }

  /**
   * Core Rate Limit Evaluation Engine
   */
  public checkRateLimit(req: {
    ip: string;
    path: string;
    method?: string;
    tenantId?: string;
    userId?: string;
    userAgent?: string;
    policyOverride?: string;
  }): RateLimitResult {
    this.totalInspectedRequests++;
    const now = Date.now();
    const ip = req.ip || '127.0.0.1';
    const method = req.method || 'GET';
    const path = req.path || '/';
    const userAgent = req.userAgent || 'unknown';
    const tenantId = req.tenantId || 'global';

    // 1. Whitelist Check
    if (this.isIpWhitelisted(ip)) {
      return {
        allowed: true,
        statusCode: 200,
        headers: {
          'X-RateLimit-Limit': 999999,
          'X-RateLimit-Remaining': 999999,
          'X-RateLimit-Reset': 0,
          'X-RateLimit-Tier': 'WHITELISTED',
          'X-RateLimit-Policy': 'exempt',
          'X-Security-Protection': 'active-whitelisted'
        }
      };
    }

    // 2. Active Jail Check (Active Block)
    const activeJail = this.jailedIps.get(ip);
    if (activeJail) {
      const jailExp = new Date(activeJail.expiresAt).getTime();
      if (activeJail.manual || jailExp > now) {
        this.totalBlockedRequests++;
        this.totalBruteForceMitigations++;
        const retryAfter = Math.max(1, Math.ceil((jailExp - now) / 1000));

        this.logAudit({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          ip,
          path,
          method,
          policy: 'jail',
          reason: activeJail.manual ? 'MANUAL_BLACKLIST' : 'JAILED_IP',
          threatLevel: 'CRITICAL',
          userAgent,
          tenantId,
          retryAfterSeconds: retryAfter,
          blockedCountForIp: activeJail.violationCount
        });

        return {
          allowed: false,
          statusCode: 403,
          headers: {
            'X-RateLimit-Limit': 0,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': jailExp,
            'Retry-After': retryAfter,
            'X-RateLimit-Tier': 'QUARANTINED',
            'X-RateLimit-Policy': 'jail_enforced',
            'X-Security-Protection': 'brute-force-quarantine-active'
          },
          reason: `IP ${ip} is currently quarantined due to suspicious brute-force activity: ${activeJail.reason}`,
          errorMessage: `Access denied. Your IP address has been temporarily quarantined for excessive traffic. Please retry in ${Math.ceil(retryAfter / 60)} minutes.`,
          retryAfterSeconds: retryAfter,
          jailed: true
        };
      } else {
        // Expired auto jail
        this.jailedIps.delete(ip);
      }
    }

    // 3. Resolve and Get Policy
    const policyId = req.policyOverride || this.resolvePolicyForPath(path, method);
    const policy = this.policies.get(policyId) || this.policies.get('global')!;

    if (!policy.enabled) {
      return {
        allowed: true,
        statusCode: 200,
        headers: {
          'X-RateLimit-Limit': policy.maxRequests,
          'X-RateLimit-Remaining': policy.maxRequests,
          'X-RateLimit-Reset': 0,
          'X-RateLimit-Tier': policyId.toUpperCase(),
          'X-RateLimit-Policy': policy.name,
          'X-Security-Protection': 'disabled'
        }
      };
    }

    // 4. Retrieve or Create Bucket (Scoped by IP + Policy + TenantId)
    const bucketKey = `${ip}:${policyId}:${tenantId !== 'global' ? tenantId : ''}`;
    let bucket = this.clientBuckets.get(bucketKey);
    if (!bucket) {
      bucket = {
        key: bucketKey,
        policyId,
        timestamps: [],
        violationCount: 0,
        lastViolationAt: 0,
        jailedUntil: null,
        jailReason: null,
        totalRequestsCount: 0,
        totalBlockedCount: 0
      };
      this.clientBuckets.set(bucketKey, bucket);
    }

    bucket.totalRequestsCount++;

    // 5. Sliding Window Calculation
    const windowStart = now - policy.windowMs;
    bucket.timestamps = bucket.timestamps.filter(ts => ts > windowStart);

    const currentCount = bucket.timestamps.length;
    const remaining = Math.max(0, policy.maxRequests - currentCount - 1);
    const oldestTimestamp = bucket.timestamps[0] || now;
    const resetTimeSeconds = Math.ceil((oldestTimestamp + policy.windowMs - now) / 1000);

    // 6. Check Rate Limit Breach
    if (currentCount >= policy.maxRequests) {
      bucket.violationCount++;
      bucket.lastViolationAt = now;
      bucket.totalBlockedCount++;
      this.totalBlockedRequests++;

      const retryAfter = Math.max(1, resetTimeSeconds);

      // Check if violations exceed Auto-Jail threshold
      let threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
      if (policyId === 'admin' || policyId === 'auth') {
        threatLevel = bucket.violationCount >= 2 ? 'HIGH' : 'MEDIUM';
      }

      if (bucket.violationCount >= policy.autoJailThreshold) {
        threatLevel = 'CRITICAL';
        this.totalBruteForceMitigations++;
        const jailDuration = policy.autoJailDurationMs;
        const jailExpiresAt = new Date(now + jailDuration).toISOString();
        const reason = `Automated quarantine triggered after ${bucket.violationCount} consecutive rate limit breaches on ${policy.name} (${path})`;

        this.jailedIps.set(ip, {
          ip,
          reason,
          jailedAt: new Date().toISOString(),
          expiresAt: jailExpiresAt,
          violationCount: bucket.violationCount,
          manual: false
        });

        this.logAudit({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          ip,
          path,
          method,
          policy: policy.name,
          reason: 'BRUTE_FORCE_SUSPECT',
          threatLevel: 'CRITICAL',
          userAgent,
          tenantId,
          retryAfterSeconds: Math.ceil(jailDuration / 1000),
          blockedCountForIp: bucket.violationCount
        });

        return {
          allowed: false,
          statusCode: policy.statusCode,
          headers: {
            'X-RateLimit-Limit': policy.maxRequests,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': now + jailDuration,
            'Retry-After': Math.ceil(jailDuration / 1000),
            'X-RateLimit-Tier': policyId.toUpperCase(),
            'X-RateLimit-Policy': policy.name,
            'X-Security-Protection': 'auto-jail-quarantine-engaged'
          },
          reason: `Brute-force protection: Exceeded threshold (${bucket.violationCount}/${policy.autoJailThreshold}). IP quarantined.`,
          errorMessage: `${policy.errorMessage} Threat mitigation active. Retry in ${Math.ceil(jailDuration / 60000)} minutes.`,
          retryAfterSeconds: Math.ceil(jailDuration / 1000),
          jailed: true
        };
      }

      // Regular Rate Limit Exhaustion
      this.logAudit({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        ip,
        path,
        method,
        policy: policy.name,
        reason: 'EXCEEDED_RATE_LIMIT',
        threatLevel,
        userAgent,
        tenantId,
        retryAfterSeconds: retryAfter,
        blockedCountForIp: bucket.violationCount
      });

      return {
        allowed: false,
        statusCode: policy.statusCode,
        headers: {
          'X-RateLimit-Limit': policy.maxRequests,
          'X-RateLimit-Remaining': 0,
          'X-RateLimit-Reset': now + (retryAfter * 1000),
          'Retry-After': retryAfter,
          'X-RateLimit-Tier': policyId.toUpperCase(),
          'X-RateLimit-Policy': policy.name,
          'X-Security-Protection': 'rate-limiting-enforced'
        },
        reason: `Rate limit of ${policy.maxRequests} requests per ${policy.windowMs / 1000}s exceeded for policy ${policy.name}`,
        errorMessage: policy.errorMessage,
        retryAfterSeconds: retryAfter,
        jailed: false
      };
    }

    // 7. Request Allowed - Record Timestamp
    bucket.timestamps.push(now);

    return {
      allowed: true,
      statusCode: 200,
      headers: {
        'X-RateLimit-Limit': policy.maxRequests,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': now + (resetTimeSeconds * 1000),
        'X-RateLimit-Tier': policyId.toUpperCase(),
        'X-RateLimit-Policy': policy.name,
        'X-Security-Protection': 'active-monitoring'
      }
    };
  }

  private logAudit(entry: RateLimitAuditLog) {
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 1000) {
      this.auditLogs.pop();
    }
  }

  // ----------------------------------------------------
  // ADMIN & GOVERNANCE OPERATIONS
  // ----------------------------------------------------

  public getMetrics() {
    const activeJails = Array.from(this.jailedIps.values());
    const policiesList = Array.from(this.policies.values());
    const whitelistedList = Array.from(this.whitelistedIps.values());

    // Compute top violators
    const violatorsMap = new Map<string, { ip: string; count: number; lastSeen: string; policy: string }>();
    for (const log of this.auditLogs) {
      const existing = violatorsMap.get(log.ip);
      if (!existing) {
        violatorsMap.set(log.ip, {
          ip: log.ip,
          count: 1,
          lastSeen: log.timestamp,
          policy: log.policy
        });
      } else {
        existing.count++;
      }
    }
    const topViolatorIps = Array.from(violatorsMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalInspectedRequests: this.totalInspectedRequests,
      totalBlockedRequests: this.totalBlockedRequests,
      totalBruteForceMitigations: this.totalBruteForceMitigations,
      activeQuarantinedIpsCount: activeJails.length,
      activeTrackedBucketsCount: this.clientBuckets.size,
      whitelistedIpsCount: whitelistedList.length,
      startedAt: this.startedAt,
      systemHealth: this.totalBlockedRequests > 500 ? 'ATTACK_MITIGATION_ACTIVE' : 'HEALTHY_GUARDED',
      topViolatorIps,
      policies: policiesList,
      jailedIps: activeJails,
      whitelistedIps: whitelistedList
    };
  }

  public getAuditLogs(limit = 100): RateLimitAuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  public jailIp(ip: string, reason: string, durationMinutes = 60, manual = true): boolean {
    if (!ip) return false;
    const now = Date.now();
    const expiresAt = new Date(now + durationMinutes * 60 * 1000).toISOString();

    this.jailedIps.set(ip, {
      ip,
      reason: reason || 'Manual Administrator Quarantine',
      jailedAt: new Date().toISOString(),
      expiresAt,
      violationCount: 99,
      manual
    });

    this.logAudit({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ip,
      path: '/api/v1/saas-admin/rate-limiting/jail-ip',
      method: 'ADMIN_ACTION',
      policy: 'manual_blacklist',
      reason: 'MANUAL_BLACKLIST',
      threatLevel: 'CRITICAL',
      userAgent: 'Admin Console',
      retryAfterSeconds: durationMinutes * 60,
      blockedCountForIp: 1
    });

    return true;
  }

  public unjailIp(ip: string): boolean {
    if (!ip) return false;
    const deleted = this.jailedIps.delete(ip);

    // Also clear buckets for this IP
    for (const [key] of this.clientBuckets.entries()) {
      if (key.startsWith(`${ip}:`)) {
        this.clientBuckets.delete(key);
      }
    }

    return deleted;
  }

  public whitelistIp(ip: string, description: string): boolean {
    if (!ip) return false;
    this.whitelistedIps.set(ip, {
      ipOrPrefix: ip,
      description: description || 'Administrator Whitelist Entry',
      addedAt: new Date().toISOString()
    });
    this.unjailIp(ip);
    return true;
  }

  public removeWhitelistIp(ip: string): boolean {
    if (!ip) return false;
    return this.whitelistedIps.delete(ip);
  }

  public updatePolicy(policyId: string, updates: Partial<RateLimitPolicy>): boolean {
    const existing = this.policies.get(policyId);
    if (!existing) return false;

    this.policies.set(policyId, {
      ...existing,
      ...updates,
      id: existing.id // keep immutable
    });

    return true;
  }

  public simulateBruteForceAttack(targetPath: string, simulatedIp: string, attackCount = 10) {
    const results = [];
    for (let i = 0; i < attackCount; i++) {
      const res = this.checkRateLimit({
        ip: simulatedIp,
        path: targetPath,
        method: 'POST',
        userAgent: 'PenTest-Simulator/2.4 (Security Audit)',
        tenantId: 'simulated_org'
      });
      results.push({
        attemptNumber: i + 1,
        allowed: res.allowed,
        statusCode: res.statusCode,
        remaining: res.headers['X-RateLimit-Remaining'],
        reason: res.reason,
        jailed: res.jailed || false
      });
    }

    return {
      targetPath,
      simulatedIp,
      totalAttempts: attackCount,
      blockedAttempts: results.filter(r => !r.allowed).length,
      quarantined: results.some(r => r.jailed),
      history: results
    };
  }

  public resetMetrics() {
    this.totalInspectedRequests = 0;
    this.totalBlockedRequests = 0;
    this.totalBruteForceMitigations = 0;
    this.auditLogs = [];
    this.clientBuckets.clear();
    return true;
  }
}

// Singleton export
export const RateLimiterService = new CentralizedRateLimiterService();
