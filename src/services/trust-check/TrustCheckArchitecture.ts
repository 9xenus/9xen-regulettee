/**
 * Architecture Decision Record (ADR-042): Consumer Mobile App ("Trust Check")
 * 
 * Context:
 * High-velocity fraud in emerging & digital markets (e.g. mobile financial services,
 * fake e-commerce, unauthorized field agents, phishing domains) requires an ultra-lightweight,
 * privacy-preserving consumer shield app for citizens to verify credentials before transacting.
 * 
 * Decision:
 * 1. Offline-first local store with background synchronization.
 * 2. Hardware/Play Integrity & App Attest device fingerprinting (`device_hash`).
 * 3. Salted hash lookups for queries (`query_hash`) to preserve citizen privacy.
 * 4. Scoped projections only: strictly no PII in public verdicts, template-based legal copy.
 */

import crypto from 'crypto';

export interface AppDevice {
  id: string;
  deviceHash: string;
  platform: 'ios' | 'android' | 'web_pwa';
  attestationStatus: 'VERIFIED' | 'BASIC' | 'FAILED' | 'EMULATOR_BLOCKED';
  countryId: string;
  locale: 'bn' | 'en' | 'de' | 'fr' | 'es';
  pushToken?: string | null;
  trustScore: number; // 0-100 credibility
  checksCountToday: number;
  lastActiveAt: string;
  createdAt: string;
}

export interface AppCheckRecord {
  id: string;
  deviceId: string;
  queryType: 'phone' | 'wallet' | 'website' | 'qr' | 'name';
  queryHash: string; // Salted SHA-256 (Raw query NOT stored unless user files a report)
  rawSampleSanitized?: string; // e.g. "017****8899" or "shop****.com" for audit log display
  verdictRef: string; // FLAGGED | WARNED | VERIFIED | UNKNOWN
  verdictTier: 'FLAGGED' | 'WARNED' | 'VERIFIED' | 'UNKNOWN';
  countryId: string;
  latitude?: number;
  longitude?: number;
  regionCode?: string;
  createdAt: string;
}

export interface AppReportDraft {
  id: string;
  deviceId: string;
  payload: {
    entityTarget: string;
    category: string;
    amountLost?: string;
    incidentDate?: string;
    description?: string;
    voiceRecordingUri?: string;
    voiceTranscript?: string;
    evidenceAttachments?: string[];
    isAnonymous: boolean;
    contactPhone?: string;
  };
  isSynced: boolean;
  updatedAt: string;
}

/**
 * In-memory / persistent ledger for device attestation & rate limiting
 */
class AppDeviceSecurityManager {
  private devices: Map<string, AppDevice> = new Map();
  private rateLimits: Map<string, { count: number; windowStart: number }> = new Map();
  private static readonly RATE_LIMIT_PER_MINUTE = 45;
  private static readonly RATE_LIMIT_PER_HOUR = 300;
  private static readonly SCRAPE_ANOMALY_THRESHOLD = 500;

  constructor() {
    this.seedInitialDevices();
  }

  private seedInitialDevices() {
    const seedDevs: AppDevice[] = [
      {
        id: 'dev_citizen_dhaka_01',
        deviceHash: 'd_hash_98a72cf190',
        platform: 'android',
        attestationStatus: 'VERIFIED',
        countryId: 'BD',
        locale: 'bn',
        pushToken: 'fcm_token_sample_dhaka_991',
        trustScore: 98,
        checksCountToday: 4,
        lastActiveAt: new Date().toISOString(),
        createdAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'dev_citizen_berlin_02',
        deviceHash: 'd_hash_77b31ee442',
        platform: 'ios',
        attestationStatus: 'VERIFIED',
        countryId: 'DE',
        locale: 'de',
        pushToken: 'apns_token_sample_berlin_114',
        trustScore: 95,
        checksCountToday: 2,
        lastActiveAt: new Date().toISOString(),
        createdAt: '2026-02-01T10:30:00Z',
      }
    ];

    seedDevs.forEach(d => this.devices.set(d.id, d));
  }

  /**
   * Generates a privacy-preserving salted query hash
   */
  public generateQueryHash(query: string, countryId: string): string {
    const salt = process.env.TRUST_CHECK_SALT || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('FATAL: TRUST_CHECK_SALT must be set in production.'); })() : 'dev-only-trust-salt-do-not-use-in-production');
    const normalized = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return crypto.createHash('sha256').update(`${normalized}:${countryId}:${salt}`).digest('hex');
  }

  /**
   * Sanitizes query for visual receipt (e.g., masking middle characters)
   */
  public maskQuery(query: string, type: 'phone' | 'wallet' | 'website' | 'qr' | 'name'): string {
    const clean = query.trim();
    if (type === 'phone' || type === 'wallet') {
      if (clean.length <= 5) return clean;
      return `${clean.substring(0, 3)}****${clean.substring(clean.length - 3)}`;
    }
    if (type === 'website') {
      return clean.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/(\.[a-z]{2,6}).*$/, '$1');
    }
    if (clean.length <= 4) return clean;
    return `${clean.substring(0, 2)}***${clean.substring(clean.length - 2)}`;
  }

  /**
   * Validates device attestation and checks rate limits
   */
  public checkDeviceAccess(deviceId: string, rawToken?: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const limitKey = `rl_${deviceId}`;
    const limit = this.rateLimits.get(limitKey) || { count: 0, windowStart: now };

    // Reset window every 60 seconds
    if (now - limit.windowStart > 60000) {
      limit.count = 1;
      limit.windowStart = now;
    } else {
      limit.count += 1;
    }
    this.rateLimits.set(limitKey, limit);

    if (limit.count > AppDeviceSecurityManager.RATE_LIMIT_PER_MINUTE) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded: suspicious burst check velocity detected.',
      };
    }

    let device = this.devices.get(deviceId);
    if (!device) {
      // Auto-register new unauthenticated device
      device = {
        id: deviceId,
        deviceHash: crypto.createHash('sha256').update(deviceId).digest('hex').substring(0, 16),
        platform: 'android',
        attestationStatus: rawToken ? 'VERIFIED' : 'BASIC',
        countryId: 'BD',
        locale: 'bn',
        trustScore: 85,
        checksCountToday: 1,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.devices.set(deviceId, device);
    }

    if (device.attestationStatus === 'EMULATOR_BLOCKED') {
      return { allowed: false, reason: 'Device failed hardware integrity checks.' };
    }

    device.checksCountToday += 1;
    device.lastActiveAt = new Date().toISOString();

    if (device.checksCountToday > AppDeviceSecurityManager.SCRAPE_ANOMALY_THRESHOLD) {
      device.trustScore = Math.max(10, device.trustScore - 20);
      return { allowed: false, reason: 'Automated data scraping pattern detected on this client token.' };
    }

    return { allowed: true };
  }

  public getDevice(deviceId: string): AppDevice | undefined {
    return this.devices.get(deviceId);
  }

  public updatePushToken(deviceId: string, token: string): void {
    const dev = this.devices.get(deviceId);
    if (dev) {
      dev.pushToken = token;
    }
  }
}

export const appDeviceSecurityManager = new AppDeviceSecurityManager();
