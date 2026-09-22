import { Request, Response, NextFunction } from 'express';

/**
 * EU Policy Compliance SaaS
 * Module: Rate-Limiting Middleware & Usage Metering
 * 
 * Purpose: Prevents API abuse, enforces subscription tiers, and ensures noisy-neighbor 
 * isolation across partitions.
 */

// Memory store for demo; use Redis in production for distributed tracking
const rateLimitWindowCache: Record<string, { count: number; resetTime: number }> = {};

export function extractTenantId(req: Request): string {
  // Extract from JWT or headers. e.g. req.user.tenantId
  return (req.headers['x-tenant-id'] as string) || 'unknown_tenant';
}

/**
 * Middleware: Enterprise Tiered Rate Limiter
 * Dynamically adjusts rate limits based on tenant subscription tier.
 */
export const tieredRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = extractTenantId(req);
  
  if (tenantId === 'unknown_tenant') {
    return res.status(403).json({ error: 'Tenant context required for rate evaluation.' });
  }

  // Look up tenant's allowed max requests per minute (RPM)
  // In a real app, fetch from SovereignCacheLayer
  let maxRpm = 5000; // Increase default for demo robustness
  if (tenantId === 'org-enterprise-vip') maxRpm = 10000;
  if (tenantId === 'org-standard-tier') maxRpm = 5000;

  const now = Date.now();
  const windowMillis = 60 * 1000; // 1 minute window
  const cacheKey = `rate_limit:${tenantId}`;

  let record = rateLimitWindowCache[cacheKey];

  if (!record || now > record.resetTime) {
    // Reset window
    record = { count: 0, resetTime: now + windowMillis };
    rateLimitWindowCache[cacheKey] = record;
  }

  record.count += 1;

  // Set standard rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRpm.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRpm - record.count).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString());

  if (record.count > maxRpm) {
    console.warn(`[RateLimiter] 🚨 Tenant ${tenantId} exceeded RPM limit! Active Drop.`);
    
    // Trigger dispatch to alert IT if required
    // dispatcher.dispatch({ priority: 'LOW', category: 'COMPLIANCE_SCORE_DROP', targetChannels: ['WEBHOOK'], rawMessage: 'RPM Exceeded' })
    
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Tenant request quota exceeded. Limit: ${maxRpm} RPM. Please retry later.`,
    });
  }

  next();
};
