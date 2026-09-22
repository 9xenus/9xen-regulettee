import crypto from 'crypto';
import { logEvent } from '../db/event-db';

/**
 * EU Policy Compliance SaaS
 * Module: Audit Logging & Compliance Ledger
 * 
 * Purpose: Immutable, tamper-resistant system log tracking all administrative 
 * and compliance movements. Captures standard actions and Super Admin impersonations.
 */

export interface CreateAuditLogParams {
  tenantId?: string;
  actorId?: string;
  impersonatorId?: string;
  serviceModule?: 'GDPR_AUDIT' | 'AI_ACT_SCREENER' | 'DORA_FRAMEWORK' | 'EURLEX_SYNC' | 'GLOBAL_REGULATORY_SYNC';
  actionType: 'AUTHENTICATE' | 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPERSONATE' | 'DRIFT_DETECTED';
  status?: 'SUCCESS' | 'FAILED' | 'DENIED';
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  targetResource?: string;
  ipAddress?: string;
  userAgent?: string;
  payloadDiff: Record<string, any>;
}

export class EnterpriseAuditLedger {
  
  private readonly HASH_SALT = process.env.AUDIT_SALT || 'eu_sovereign_audit_salt';

  /**
   * Cryptographically locks the log to detect any backend manual DB manipulation.
   */
  private generateImmutableHash(payload: string): string {
    return crypto.createHmac('sha256', this.HASH_SALT).update(payload).digest('hex');
  }

  /**
   * Commits an atomic event to the immutable compliance ledger.
   */
  public async commitLog(params: CreateAuditLogParams): Promise<void> {
    const timestamp = new Date();
    
    // Convert sensitive JSON structure to a string to verify tampering
    const payloadStr = JSON.stringify(params.payloadDiff);
    
    // Hash chain combination representing the literal state of the mutation
    const signatureBase = `${params.tenantId || 'GLOBAL'}:${params.actorId || 'SYS'}:${params.actionType}:${payloadStr}:${timestamp.toISOString()}`;
    const cryptoHash = this.generateImmutableHash(signatureBase);

    // If impersonator is active, explicitly flag it for Compliance reporting
    if (params.impersonatorId) {
      console.warn(`[AUDIT LEDGER] SUPER ADMIN MASQUERADE DETECTED! Actor ${params.actorId} is impersonated by ${params.impersonatorId}.`);
    }

    console.log(`[Ledger Append] Tenant ${params.tenantId} | Action ${params.actionType} | Hash ${cryptoHash.substring(0,10)}...`);

    try {
      logEvent({
        id: crypto.randomUUID(),
        tenantId: params.tenantId,
        actorId: params.actorId,
        impersonatorId: params.impersonatorId,
        serviceModule: params.serviceModule,
        actionType: params.actionType,
        status: params.status || 'SUCCESS',
        severity: params.severity || 'INFO',
        targetResource: params.targetResource,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        payloadDiff: params.payloadDiff,
        cryptoHash
      });
    } catch (e) {
      console.error('[AUDIT LEDGER] FAILED TO COMMIT LOG:', e);
    }
  }
}
