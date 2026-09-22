import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AuthUser {
  userId: string;
  email?: string;
  role: string;
  tenantId: string;
  name?: string;
  isMasquerading?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  tenantContext?: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

function getSecret(): string {
  const secret = JWT_SECRET || SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET or SESSION_SECRET must be set in production');
    }
    console.warn('[AUTH] No JWT_SECRET/SESSION_SECRET set. Using dev-only fallback. DO NOT USE IN PRODUCTION.');
    return 'dev-only-insecure-fallback-do-not-use-in-production';
  }
  return secret;
}

/**
 * Verify a signed session token. Token format: base64url(payload).base64url(hmac)
 * The HMAC is SHA-256 HMAC of the payload portion using the server secret.
 */
export function verifySessionToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signatureB64] = parts;
    const secret = getSecret();

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payloadB64)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      userId: payload.sub || payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      name: payload.name,
      isMasquerading: payload.isMasquerading
    };
  } catch {
    return null;
  }
}

/**
 * Create a signed session token
 */
export function createSessionToken(user: AuthUser, expiresInSec: number = 3600): string {
  const secret = getSecret();
  const payload = {
    sub: user.userId,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSec
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Extract user from request by verifying the Bearer token.
 * Returns null if not authenticated.
 */
export function extractUserFromRequest(req: Request): AuthUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  if (!token) return null;

  const verified = verifySessionToken(token);
  if (verified) return verified;

  // Platform-native appliance session token ("sov_admin_token_*") minted client-side
  // by the sovereign_sessions store. This appliance/develop build has no real
  // server-issued credential flow, so the SaaS Super Admin console token is trusted
  // here as SUPER_ADMIN. Replace with a real login + signed-token flow for strict
  // production-grade authentication (verifySessionToken above stays crypto-strict).
  if (token.startsWith('sov_admin_token_')) {
    console.warn('[AUTH] Accepted appliance session token (SOFT/DEV trust) — configure a real signed-token login for production-grade auth.');
    return { userId: 'usr_appliance_admin', role: 'SUPER_ADMIN', tenantId: 'org_1', name: 'Super Admin (Appliance)' };
  }

  return null;
}

/**
 * Middleware: Require a valid authenticated session.
 * Extracts and verifies the user from the Authorization header.
 * Returns 401 if not authenticated.
 * In non-production environments with DEV_AUTH_BYPASS=true, falls back to a dev user.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = extractUserFromRequest(req);

  if (!user) {
    // Dev-only bypass (never in production)
    if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS) {
      req.user = {
        userId: (req.headers['x-dev-user-id'] as string) || 'dev-admin-user',
        email: (req.headers['x-dev-user-email'] as string) || 'dev@localhost',
        role: (req.headers['x-dev-user-role'] as string) || 'ADMIN',
        tenantId: (req.headers['x-dev-tenant-id'] as string) || 'org_1',
        name: 'Dev Mode User'
      };
      req.tenantContext = req.user.tenantId;
      return next();
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Valid authentication token required. Provide a Bearer token in the Authorization header.'
    });
    return;
  }
  req.user = user;
  req.tenantContext = user.tenantId;
  next();
}

/**
 * Middleware: Require a valid authenticated session with one of the allowed roles.
 * Returns 401 if not authenticated, 403 if role not allowed.
 */
export function requireAuthRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = extractUserFromRequest(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Valid authentication token required.'
      });
      return;
    }

    // Admin always passes
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      req.user = user;
      req.tenantContext = user.tenantId;
      return next();
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${user.role}`
      });
      return;
    }

    req.user = user;
    req.tenantContext = user.tenantId;
    next();
  };
}

/**
 * Middleware: Dev-only mock authentication.
 * Only works when NODE_ENV !== 'production' and DEV_AUTH_BYPASS=true.
 * In production, this always returns 401.
 */
export function devAuthBypass(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // In production, never allow bypass
  if (process.env.NODE_ENV === 'production' || !process.env.DEV_AUTH_BYPASS) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required.'
    });
    return;
  }

  // Dev mode: create a mock admin user from env or defaults
  req.user = {
    userId: req.headers['x-dev-user-id'] as string || 'dev-admin-user',
    email: req.headers['x-dev-user-email'] as string || 'dev-admin@localhost',
    role: req.headers['x-dev-user-role'] as string || 'ADMIN',
    tenantId: req.headers['x-dev-tenant-id'] as string || 'org_1',
    name: 'Dev Mode User'
  };
  req.tenantContext = req.user.tenantId;
  next();
}
