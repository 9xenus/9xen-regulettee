import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

// Simulating Redis or similar mem store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Asynchronous Task Queue & Rate-Limiter Architecture
 * Prevents API abuse and enforces tenant tier quotas.
 */
export const rateLimitMiddleware = (limitPerMinute: number = 5000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extrapolate tenant identifier or default to IP if unauthenticated
    const tenantContext = (req as any).tenantContext || req.ip;
    const windowMs = 60 * 1000;
    const now = Date.now();

    let record = rateLimitStore.get(tenantContext);

    if (!record || record.resetTime < now) {
      record = { count: 1, resetTime: now + windowMs };
    } else {
      record.count++;
    }

    rateLimitStore.set(tenantContext, record);

    const remaining = Math.max(0, limitPerMinute - record.count);
    
    // Inject headers to let clients know their quotas
    res.setHeader('X-RateLimit-Limit', limitPerMinute);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > limitPerMinute) {
      // Log Rate Limit hit for SRE metrics dashboard
      console.warn(`[RATE_LIMITER] Tenant/IP ${tenantContext} exceeded rate limit of ${limitPerMinute}/min.`);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Platform API throughput limit reached. This incident has been logged. Please upgrade your Enterprise Tier or utilize background job queuing for burst workloads.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    next();
  };
};
