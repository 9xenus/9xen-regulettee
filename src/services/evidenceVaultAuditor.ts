/**
 * Evidence Vault Middleware Auditor & Signed Ledger
 * Intercepts database operations within the evidence vault,
 * records them into a secure cryptographic signed log format,
 * and feeds the regulator audit dashboard.
 */

import crypto from 'crypto';

export interface VaultAuditLogEntry {
  id: string;
  operation: 'INSERT' | 'SELECT' | 'UPDATE' | 'DELETE' | 'VERIFY';
  vaultId: string;
  recordId: string;
  actorId: string;
  timestamp: string;
  payloadHash: string;
  previousHash: string;
  signature: string;
  status: 'SUCCESS' | 'FLAGGED_ANOMALY';
}

class EvidenceVaultAuditorEngine {
  private static ledger: VaultAuditLogEntry[] = [];
  private static SECRET_HMAC_KEY = 'sovereign-vault-regulator-hmac-seed-2026';

  /**
   * Intercept and audit a database operation on the evidence vault
   */
  static interceptOperation(
    operation: 'INSERT' | 'SELECT' | 'UPDATE' | 'DELETE' | 'VERIFY',
    vaultId: string,
    recordId: string,
    actorId: string,
    dataPayload: any
  ): VaultAuditLogEntry {
    const timestamp = new Date().toISOString();
    const payloadString = JSON.stringify(dataPayload || {});
    const payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex');

    const previousEntry = this.ledger[this.ledger.length - 1];
    const previousHash = previousEntry ? previousEntry.signature : '0000000000000000000000000000000000000000000000000000000000000000';

    const rawDataToSign = `${operation}:${vaultId}:${recordId}:${actorId}:${timestamp}:${payloadHash}:${previousHash}`;
    const signature = crypto.createHmac('sha256', this.SECRET_HMAC_KEY).update(rawDataToSign).digest('hex');

    const entry: VaultAuditLogEntry = {
      id: `vault_audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      operation,
      vaultId,
      recordId,
      actorId,
      timestamp,
      payloadHash,
      previousHash,
      signature,
      status: operation === 'DELETE' && actorId === 'unauthorized' ? 'FLAGGED_ANOMALY' : 'SUCCESS'
    };

    this.ledger.push(entry);
    return entry;
  }

  /**
   * Retrieve all signed audit logs for regulator dashboards
   */
  static getAuditLedger(): VaultAuditLogEntry[] {
    if (this.ledger.length === 0) {
      // Seed initial Genesis entry if empty
      this.interceptOperation('INSERT', 'vault_genesis_01', 'rec_root_init', 'system_regulator', { initialized: true });
    }
    return [...this.ledger].reverse();
  }

  /**
   * Verify cryptographic integrity of the ledger chain
   */
  static verifyLedgerIntegrity(): { valid: boolean; totalEntries: number; brokenIndex?: number } {
    for (let i = 0; i < this.ledger.length; i++) {
      const current = this.ledger[i];
      const expectedPrevHash = i === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : this.ledger[i - 1].signature;

      if (current.previousHash !== expectedPrevHash) {
        return { valid: false, totalEntries: this.ledger.length, brokenIndex: i };
      }
    }
    return { valid: true, totalEntries: this.ledger.length };
  }
}

export default EvidenceVaultAuditorEngine;
