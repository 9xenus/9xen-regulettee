import type { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from './rateLimiterService.js';

export interface RateLimitMiddlewareOptions {
  policyOverride?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimitReached?: (req: Request, res: Response, options: any) => void;
}

/**
 * Helper to extract client IP address accurately.
 * SECURITY: req.socket.remoteAddress is the canonical source.
 * x-forwarded-for is only read when trust proxy is configured (Express req.ip).
 * Never trust arbitrary client-provided headers for rate limiting.
 */
export function extractClientIp(req: Request): string {
  // Use Express's req.ip which respects 'trust proxy' setting
  const ip = req.ip;
  if (ip && ip !== '127.0.0.1' && ip !== '::1' && ip !== '::ffff:127.0.0.1') {
    return ip;
  }
  // Fallback to raw socket address (TCP-level, cannot be spoofed by client)
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Universal Centralized Rate Limiter Middleware
 * Evaluates the request against the resolved policy and sets standard RFC rate-limit headers.
 */
export function centralizedRateLimiter(options?: RateLimitMiddlewareOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (options?.skip && options.skip(req)) {
      return next();
    }

    const ip = options?.keyGenerator ? options.keyGenerator(req) : extractClientIp(req);
    const path = req.originalUrl || req.url || req.path;
    const method = req.method;
    const tenantId = (req.headers['x-tenant-id'] as string) || (req.query?.tenantId as string) || undefined;
    const userId = (req.headers['x-user-id'] as string) || undefined;
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const result = RateLimiterService.checkRateLimit({
      ip,
      path,
      method,
      tenantId,
      userId,
      userAgent,
      policyOverride: options?.policyOverride
    });

    // Set standard RateLimit & Security headers on response
    if (result.headers) {
      for (const [headerKey, headerVal] of Object.entries(result.headers)) {
        if (headerVal !== undefined) {
          res.setHeader(headerKey, String(headerVal));
        }
      }
    }

    if (!result.allowed) {
      if (options?.onLimitReached) {
        return options.onLimitReached(req, res, result);
      }

      return res.status(result.statusCode).json({
        success: false,
        error: result.errorMessage,
        rateLimit: {
          jailed: result.jailed || false,
          retryAfterSeconds: result.retryAfterSeconds || 60,
          policy: result.headers['X-RateLimit-Policy'],
          tier: result.headers['X-RateLimit-Tier'],
          reason: result.reason
        }
      });
    }

    next();
  };
}

/**
 * Preset Middleware for Administrative & SuperAdmin endpoints
 * Strict anti-brute-force rate limiting
 */
export const adminRateLimiter = centralizedRateLimiter({
  policyOverride: 'admin'
});

/**
 * Preset Middleware for Auth, Login, MFA, and Token endpoints
 * Anti-credential-stuffing rate limiting
 */
export const authRateLimiter = centralizedRateLimiter({
  policyOverride: 'auth'
});

/**
 * Preset Middleware for Sensitive Cryptographic & Financial endpoints
 */
export const sensitiveOpsRateLimiter = centralizedRateLimiter({
  policyOverride: 'sensitive'
});

/**
 * Preset Middleware for Tenant API endpoints
 */
export const tenantApiRateLimiter = centralizedRateLimiter({
  policyOverride: 'tenant_api'
});

/**
 * Preset Global Baseline API Rate Limiter
 */
export const globalApiRateLimiter = centralizedRateLimiter({
  policyOverride: 'global'
});
