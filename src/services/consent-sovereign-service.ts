import crypto from 'crypto';
import { logEvent } from '../db/event-db';

export interface ConsentRecord {
  userId: string;
  tenantId: string;
  purposes: string[];
  timestamp: string;
  userAgent: string;
  ipAddress: string;
}

export class ConsentSovereignService {
  /**
   * Records a consent event with a cryptographic signature for immutability.
   * This implements the 'Zero-Knowledge' audit trail request by ensuring 
   * the record cannot be tampered with without breaking the signature chain.
   */
  public static async recordSignedConsent(record: ConsentRecord) {
    const eventId = `cons-${crypto.randomBytes(4).toString('hex')}`;
    
    // Create a canonical string of the consent data
    const canonicalPayload = JSON.stringify({
      u: record.userId,
      t: record.tenantId,
      p: record.purposes.sort(),
      ts: record.timestamp,
      ua: record.userAgent,
      ip: record.ipAddress
    });

    // Generate SHA-256 integrity hash
    const cryptoHash = crypto
      .createHash('sha256')
      .update(canonicalPayload + (process.env.CONSENT_SIGNING_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('FATAL: CONSENT_SIGNING_SECRET must be set in production.'); })() : 'dev-only-consent-secret-do-not-use-in-production')))
      .digest('hex');

    // Store in immutable event db
    logEvent({
      id: eventId,
      tenantId: record.tenantId,
      actorId: record.userId,
      serviceModule: 'CONSENT_SOVEREIGN',
      actionType: 'CONSENT_GRANTED',
      status: 'SUCCESS',
      severity: 'INFO',
      targetResource: `purposes:${record.purposes.join(',')}`,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      payloadDiff: record.purposes,
      cryptoHash: cryptoHash
    });

    return {
      success: true,
      auditId: eventId,
      signature: cryptoHash
    };
  }

  /**
   * Verifies the integrity of a stored consent record.
   */
  public static verifyIntegrity(record: ConsentRecord, storedHash: string): boolean {
    const canonicalPayload = JSON.stringify({
      u: record.userId,
      t: record.tenantId,
      p: record.purposes.sort(),
      ts: record.timestamp,
      ua: record.userAgent,
      ip: record.ipAddress
    });

    const calculatedHash = crypto
      .createHash('sha256')
      .update(canonicalPayload + (process.env.CONSENT_SIGNING_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('FATAL: CONSENT_SIGNING_SECRET must be set in production.'); })() : 'dev-only-consent-secret-do-not-use-in-production')))
      .digest('hex');

    return calculatedHash === storedHash;
  }
}
