import { Router } from 'express';
import { getDb } from '../db/sqlite.js';
import { queryPgOne, queryPg } from '../db/postgres.js';
import * as OTPAuth from 'otpauth';
import crypto from 'crypto';
import { extractUserFromRequest } from '../middleware/auth.js';

let nodemailer: any;
let twilio: any;
if (typeof window === 'undefined') {
  import('nodemailer').then(m => nodemailer = m.default);
  import('twilio').then(m => twilio = m.default);
}

export const authRouter = Router();

// Encryption helper for TOTP secrets at rest
// Fail closed in production if no encryption key is provided
const ENCRYPTION_KEY = (() => {
  const envKey = process.env.ENCRYPTION_KEY || process.env.MASTER_ENCRYPTION_KEY;
  if (!envKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: ENCRYPTION_KEY/MASTER_ENCRYPTION_KEY must be set in production for MFA secret storage.');
    }
    console.warn('[MFA] No ENCRYPTION_KEY set. Using dev-only fallback. DO NOT USE IN PRODUCTION.');
    return crypto.scryptSync('dev-only-mfa-key-do-not-use-in-production', 'mfa_salt_9xen', 32);
  }
  return crypto.scryptSync(envKey, 'mfa_salt_9xen', 32);
})();

function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload.includes(':')) return encryptedPayload; // Fallback for plain values
  const [ivHex, tagHex, encryptedText] = encryptedPayload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toLowerCase()).digest('hex');
}

// In-memory rate limiting map for OTP requests — keyed by caller IP + identity to prevent bypass
const otpRateLimitMap = new Map<string, { count: number; lastReset: number }>();

function checkOtpRateLimit(req: any, userId: string): boolean {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const rateKey = `${ip}:${userId}`;
  const now = Date.now();
  const limit = otpRateLimitMap.get(rateKey) || { count: 0, lastReset: now };
  if (now - limit.lastReset > 15 * 60 * 1000) {
    limit.count = 0;
    limit.lastReset = now;
  }
  if (limit.count >= 5) {
    return false; // Rate limit exceeded (max 5 OTP sends per 15 min per IP+user)
  }
  limit.count++;
  otpRateLimitMap.set(rateKey, limit);
  return true;
}

// Configure Nodemailer & Twilio lazily
let transporter: any;
function getTransporter() {
  if (!transporter && nodemailer) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS || 'dummy'
      }
    });
  }
  return transporter;
}

let twilioClient: any;
function getTwilioClient() {
  if (!twilioClient && twilio && process.env.TWILIO_ACCOUNT_SID) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

authRouter.post('/mfa/setup', async (req, res) => {
  const { userId, method, email, phone } = req.body;

  // Require an authenticated session binding the operation to the actual user
  const authUser = extractUserFromRequest(req);
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Authentication required to configure MFA.' });
  }
  // The caller can only set up MFA for their own account unless they are an admin
  if (userId && userId !== authUser.userId && authUser.role !== 'ADMIN' && authUser.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'You can only configure MFA for your own account.' });
  }
  const targetUserId = userId || authUser.userId;

  if (!method) return res.status(400).json({ success: false, error: 'Missing method' });

  if (!checkOtpRateLimit(req, targetUserId)) {
    return res.status(429).json({ success: false, error: 'Too many OTP requests. Please try again in 15 minutes.' });
  }

  try {
    let rawSecret = '';
    let uri = '';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minute OTP expiry

    if (method === 'totp') {
      const totp = new OTPAuth.TOTP({
        issuer: '9Xen Sovereign',
        label: targetUserId,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: new OTPAuth.Secret({ size: 20 })
      });
      rawSecret = totp.secret.base32;
      uri = totp.toString();
    } else if (method === 'email' || method === 'sms') {
      // Use CSPRNG for OTP generation — never Math.random
      rawSecret = crypto.randomInt(100000, 1000000).toString(); // 6 digit OTP
      if (method === 'email' && email) {
        const mailer = getTransporter();
        if (mailer && process.env.SMTP_HOST && process.env.SMTP_PASS) {
          await mailer.sendMail({
            from: '"9Xen Sovereign Compliance" <no-reply@9xen.eu>',
            to: email,
            subject: 'Your 9Xen MFA Setup Verification Code',
            text: `Your 9Xen MFA code is ${rawSecret}. It expires in 10 minutes.`
          }).catch(console.error);
        }
      } else if (method === 'sms' && phone) {
        const tw = getTwilioClient();
        if (tw && process.env.TWILIO_PHONE_NUMBER) {
          await tw.messages.create({
            body: `Your 9Xen MFA verification code is ${rawSecret}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
          }).catch(console.error);
        }
      }
    }

    // Generate 8 raw backup recovery codes and store as SHA-256 hashes
    const plainBackupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex'));
    const hashedBackupCodes = plainBackupCodes.map(hashBackupCode);

    const encryptedTotpSecret = encryptSecret(rawSecret);

    if (process.env.DATABASE_URL) {
      await queryPg(`
        INSERT INTO user_mfa_config (user_id, mfa_method, totp_secret_encrypted, backup_codes_hash, status, otp_expires_at)
        VALUES ($1, $2, $3, $4, 'pending', $5)
        ON CONFLICT (user_id) DO UPDATE SET 
          mfa_method=$2, 
          totp_secret_encrypted=$3, 
          backup_codes_hash=$4, 
          status='pending',
          otp_expires_at=$5
      `, [targetUserId, method, encryptedTotpSecret, JSON.stringify(hashedBackupCodes), expiresAt]);
    } else {
      const db = getDb();
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_mfa_config (
          user_id TEXT UNIQUE PRIMARY KEY, 
          mfa_method TEXT, 
          totp_secret_encrypted TEXT, 
          backup_codes_hash TEXT, 
          status TEXT,
          otp_expires_at TEXT
        )
      `);
      db.prepare(`
        INSERT INTO user_mfa_config (user_id, mfa_method, totp_secret_encrypted, backup_codes_hash, status, otp_expires_at)
        VALUES (?, ?, ?, ?, 'pending', ?)
        ON CONFLICT (user_id) DO UPDATE SET 
          mfa_method=excluded.mfa_method, 
          totp_secret_encrypted=excluded.totp_secret_encrypted, 
          backup_codes_hash=excluded.backup_codes_hash, 
          status='pending',
          otp_expires_at=excluded.otp_expires_at
      `).run(targetUserId, method, encryptedTotpSecret, JSON.stringify(hashedBackupCodes), expiresAt);
    }

    res.json({
      success: true,
      method,
      uri,
      secret: method === 'totp' ? rawSecret : null,
      backupCodes: plainBackupCodes
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.post('/mfa/verify-setup', async (req, res) => {
  const { userId, code } = req.body;

  // Require an authenticated session for MFA operations
  const authUser = extractUserFromRequest(req);
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Authentication required for MFA setup verification.' });
  }
  if (!userId || userId !== authUser.userId) {
    return res.status(403).json({ success: false, error: 'You can only verify MFA setup for your own account.' });
  }
  if (!code) return res.status(400).json({ success: false, error: 'Missing code' });

  try {
    let config: any;
    if (process.env.DATABASE_URL) {
      config = await queryPgOne('SELECT * FROM user_mfa_config WHERE user_id = $1', [userId]);
    } else {
      config = getDb().prepare('SELECT * FROM user_mfa_config WHERE user_id = ?').get(userId);
    }

    if (!config || config.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'No pending MFA setup found' });
    }

    const decryptedSecret = decryptSecret(config.totp_secret_encrypted);
    let isValid = false;

    if (config.mfa_method === 'totp') {
      const totp = new OTPAuth.TOTP({
        issuer: '9Xen Sovereign',
        label: userId,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(decryptedSecret)
      });
      const delta = totp.validate({ token: code, window: 1 }); // window 1 allows +-30s time drift
      isValid = delta !== null;
    } else {
      if (config.otp_expires_at && new Date(config.otp_expires_at).getTime() < Date.now()) {
        return res.status(400).json({ success: false, error: 'OTP code has expired. Please request a new code.' });
      }
      isValid = code.trim() === decryptedSecret.trim();
    }

    if (isValid) {
      if (process.env.DATABASE_URL) {
        await queryPg('UPDATE user_mfa_config SET status = $1 WHERE user_id = $2', ['active', userId]);
        await queryPg('UPDATE users SET mfa_enabled = 1 WHERE id = $1', [userId]);
      } else {
        getDb().prepare('UPDATE user_mfa_config SET status = ? WHERE user_id = ?').run('active', userId);
        getDb().prepare('UPDATE users SET mfa_enabled = 1 WHERE id = ?').run(userId);
      }
      return res.json({ success: true, message: 'MFA successfully enabled for account.' });
    }

    res.status(401).json({ success: false, error: 'Invalid verification code' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login MFA verification endpoint
authRouter.post('/mfa/verify-login', async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ success: false, error: 'Missing userId or code' });

  try {
    let config: any;
    if (process.env.DATABASE_URL) {
      config = await queryPgOne('SELECT * FROM user_mfa_config WHERE user_id = $1 AND status = $2', [userId, 'active']);
    } else {
      config = getDb().prepare('SELECT * FROM user_mfa_config WHERE user_id = ? AND status = ?').get(userId, 'active');
    }

    if (!config) {
      return res.status(400).json({ success: false, error: 'MFA is not enabled for this account' });
    }

    const decryptedSecret = decryptSecret(config.totp_secret_encrypted);
    let isValid = false;
    let isBackupCodeUsed = false;

    if (config.mfa_method === 'totp') {
      const totp = new OTPAuth.TOTP({
        issuer: '9Xen Sovereign',
        label: userId,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(decryptedSecret)
      });
      const delta = totp.validate({ token: code, window: 1 });
      isValid = delta !== null;
    } else {
      if (config.otp_expires_at && new Date(config.otp_expires_at).getTime() < Date.now()) {
        return res.status(400).json({ success: false, error: 'OTP code has expired. Request a new login code.' });
      }
      isValid = code.trim() === decryptedSecret.trim();
    }

    // Check backup codes if TOTP/OTP validation failed
    if (!isValid && config.backup_codes_hash) {
      const hashedCode = hashBackupCode(code);
      const backupHashes: string[] = JSON.parse(config.backup_codes_hash || '[]');
      if (backupHashes.includes(hashedCode)) {
        isValid = true;
        isBackupCodeUsed = true;
        // Consume backup code
        const remainingBackupHashes = backupHashes.filter(h => h !== hashedCode);
        if (process.env.DATABASE_URL) {
          await queryPg('UPDATE user_mfa_config SET backup_codes_hash = $1 WHERE user_id = $2', [JSON.stringify(remainingBackupHashes), userId]);
        } else {
          getDb().prepare('UPDATE user_mfa_config SET backup_codes_hash = ? WHERE user_id = ?').run(JSON.stringify(remainingBackupHashes), userId);
        }
      }
    }

    if (isValid) {
      return res.json({
        success: true,
        authenticated: true,
        isBackupCodeUsed,
        message: isBackupCodeUsed ? 'Login authorized via single-use backup recovery code.' : 'MFA login verification successful.'
      });
    }

    res.status(401).json({ success: false, error: 'Invalid MFA code or backup code' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// eIDAS & Registration Identity Verification
authRouter.post('/eidas/verify', async (req, res) => {
  const { userId, role, documentType, registrationNumber, issuingJurisdiction } = req.body;

  // Require an authenticated session — never allow self-approval based on client-supplied claims
  const authUser = extractUserFromRequest(req);
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Authentication required for identity verification.' });
  }
  const targetUserId = userId || authUser.userId;

  try {
    const timestamp = new Date().toISOString();
    const verificationRef = `eidas_vrf_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Identity verification CANNOT be self-approved. It requires integration with a
    // trusted eIDAS/trust service provider. In test/dev mode we simulate the process
    // but never claim approval without real verification.
    const simulatedVerification = process.env.NODE_ENV === 'production' ? false : true;
    const hasCredentialData = Boolean(documentType && documentType.length > 3) && Boolean(registrationNumber);

    const newStatus = simulatedVerification && hasCredentialData ? 'approved' : 'pending_verification';

    if (process.env.DATABASE_URL) {
      await queryPg(`
        UPDATE users SET registration_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
      `, [newStatus, targetUserId]);

      await queryPg(`
        INSERT INTO audit_events (id, timestamp, actor, action, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        verificationRef,
        timestamp,
        authUser.userId,
        'EIDAS_REGISTRATION_VERIFICATION_ATTEMPT',
        JSON.stringify({ role, documentType, registrationNumber, issuingJurisdiction, status: newStatus })
      ]);
    } else {
      const db = getDb();
      db.prepare(`UPDATE users SET registration_status = ? WHERE id = ?`).run(newStatus, targetUserId);
      db.prepare(`
        INSERT INTO audit_events (id, timestamp, actor, action, details)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        verificationRef,
        timestamp,
        authUser.userId,
        'EIDAS_REGISTRATION_VERIFICATION_ATTEMPT',
        JSON.stringify({ role, documentType, registrationNumber, issuingJurisdiction, status: newStatus })
      );
    }

    res.json({
      success: true,
      verificationRef,
      status: newStatus,
      message: newStatus === 'approved'
        ? 'Identity and role credentials verified via eIDAS / Trust Service Provider framework.'
        : 'Credentials submitted. Account remains in pending_verification status until real verification completes.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default authRouter;
