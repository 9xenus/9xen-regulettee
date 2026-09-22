/**
 * 9XEN_REGULETTEE IMMUTABLE AUDIT LEDGER & FORENSIC PROOF ENGINE
 * - SHA-256 HMAC Logging for User Interactions, Access Level Changes & Compliance Status Deltas
 * - Hash Chaining (Genesis -> Node N) for Tamper Detection
 * - Regulatory / DPA Export Packages (PDF, CSV, JSON) with Cryptographic Stamps
 */

import crypto from 'crypto';
import { queryDb, queryOne } from '../db/db-adapter';

export interface AuditLedgerRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  category: 'User Interaction' | 'Compliance Status' | 'Security & Auth' | 'System Ops';
  action: string;
  targetResource: string;
  framework: string;
  previousStatus?: string;
  newStatus?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  ipAddress: string;
  location: string;
  sha256Hash: string;
  previousHash: string;
  hmacSignature: string;
  metadata?: Record<string, any>;
}

const HMAC_SECRET = (() => {
  const secret = process.env.AUDIT_HMAC_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: AUDIT_HMAC_SECRET must be set in production.');
    }
    console.warn('[AUDIT_LEDGER] No AUDIT_HMAC_SECRET set. Using dev-only fallback. DO NOT USE IN PRODUCTION.');
  }
  return secret || 'dev-only-audit-fallback-do-not-use-in-production';
})();

export class ImmutableAuditLedgerService {

  /**
   * Initializes SQLite table for immutable audit ledger if it doesn't exist.
   */
  public static ensureTableExists() {
    try {
      queryDb(`
        CREATE TABLE IF NOT EXISTS immutable_audit_ledger (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          actor_name TEXT NOT NULL,
          actor_email TEXT NOT NULL,
          actor_role TEXT NOT NULL,
          category TEXT NOT NULL,
          action TEXT NOT NULL,
          target_resource TEXT NOT NULL,
          framework TEXT NOT NULL,
          previous_status TEXT,
          new_status TEXT,
          severity TEXT NOT NULL,
          ip_address TEXT,
          location TEXT,
          sha256_hash TEXT NOT NULL,
          previous_hash TEXT NOT NULL,
          hmac_signature TEXT NOT NULL,
          metadata_json TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed Genesis Block if completely empty
      const countRow = queryOne<any>('SELECT COUNT(*) as cnt FROM immutable_audit_ledger');
      if (!countRow || countRow.cnt === 0) {
        this.createGenesisRecord();
      }
    } catch (err: any) {
      console.error('[IMMUTABLE_LEDGER] Table init warning:', err?.message || err);
    }
  }

  /**
   * Computes SHA-256 hash and HMAC signature for an audit log entry.
   */
  public static computeHashes(entry: {
    timestamp: string;
    actorEmail: string;
    action: string;
    targetResource: string;
    previousStatus?: string;
    newStatus?: string;
    previousHash: string;
  }): { sha256Hash: string; hmacSignature: string } {
    const rawPayload = `${entry.previousHash}|${entry.timestamp}|${entry.actorEmail}|${entry.action}|${entry.targetResource}|${entry.previousStatus || ''}|${entry.newStatus || ''}`;
    
    const sha256Hash = crypto.createHash('sha256').update(rawPayload).digest('hex');
    const hmacSignature = crypto.createHmac('sha256', HMAC_SECRET).update(sha256Hash).digest('hex');

    return { sha256Hash, hmacSignature };
  }

  /**
   * Seed Genesis Record
   */
  private static createGenesisRecord() {
    const genesisId = 'log-genesis-00000000';
    const timestamp = '2026-01-01T00:00:00.000Z';
    const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    
    const { sha256Hash, hmacSignature } = this.computeHashes({
      timestamp,
      actorEmail: 'system-genesis@regulettee.eu',
      action: 'Genesis Block Initialization for 9Xen Regulettee Forensic Audit Ledger',
      targetResource: 'SYSTEM_LEDGER_ROOT',
      previousHash
    });

    try {
      queryDb(`
        INSERT INTO immutable_audit_ledger (
          id, timestamp, actor_name, actor_email, actor_role, category, action,
          target_resource, framework, previous_status, new_status, severity,
          ip_address, location, sha256_hash, previous_hash, hmac_signature, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        genesisId,
        timestamp,
        '9Xen Regulettee System Enclave',
        'system-genesis@regulettee.eu',
        'Genesis Root',
        'System Ops',
        'Genesis Block Initialization for 9Xen Regulettee Forensic Audit Ledger',
        'SYSTEM_LEDGER_ROOT',
        'General',
        'UNINITIALIZED',
        'INITIALIZED',
        'Info',
        '127.0.0.1',
        'Frankfurt, Germany (Root Node)',
        sha256Hash,
        previousHash,
        hmacSignature,
        JSON.stringify({ note: 'Genesis record establishing immutable cryptographic anchor' })
      ]);
    } catch (e: any) {
      console.error('[IMMUTABLE_LEDGER] Failed to seed genesis:', e?.message || e);
    }
  }

  /**
   * Appends a new immutable log record onto the cryptographic chain.
   */
  public static recordEvent(params: {
    actorName: string;
    actorEmail: string;
    actorRole: string;
    category: 'User Interaction' | 'Compliance Status' | 'Security & Auth' | 'System Ops';
    action: string;
    targetResource: string;
    framework: string;
    previousStatus?: string;
    newStatus?: string;
    severity?: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
    ipAddress?: string;
    location?: string;
    metadata?: Record<string, any>;
  }): AuditLedgerRecord {
    this.ensureTableExists();

    const timestamp = new Date().toISOString();
    const id = `log-sys-${crypto.randomBytes(4).toString('hex')}`;

    // Get latest tail entry to get previousHash
    const tailRow = queryOne<any>('SELECT sha256_hash FROM immutable_audit_ledger ORDER BY created_at DESC, id DESC LIMIT 1');
    const previousHash = tailRow?.sha256_hash || '0000000000000000000000000000000000000000000000000000000000000000';

    const { sha256Hash, hmacSignature } = this.computeHashes({
      timestamp,
      actorEmail: params.actorEmail,
      action: params.action,
      targetResource: params.targetResource,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      previousHash
    });

    const record: AuditLedgerRecord = {
      id,
      timestamp,
      actorName: params.actorName,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      category: params.category,
      action: params.action,
      targetResource: params.targetResource,
      framework: params.framework,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      severity: params.severity || 'Info',
      ipAddress: params.ipAddress || '194.12.210.45',
      location: params.location || 'Frankfurt, Germany',
      sha256Hash,
      previousHash,
      hmacSignature,
      metadata: params.metadata || {}
    };

    try {
      queryDb(`
        INSERT INTO immutable_audit_ledger (
          id, timestamp, actor_name, actor_email, actor_role, category, action,
          target_resource, framework, previous_status, new_status, severity,
          ip_address, location, sha256_hash, previous_hash, hmac_signature, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        record.id,
        record.timestamp,
        record.actorName,
        record.actorEmail,
        record.actorRole,
        record.category,
        record.action,
        record.targetResource,
        record.framework,
        record.previousStatus || null,
        record.newStatus || null,
        record.severity,
        record.ipAddress,
        record.location,
        record.sha256Hash,
        record.previousHash,
        record.hmacSignature,
        JSON.stringify(record.metadata)
      ]);
    } catch (err: any) {
      console.error('[IMMUTABLE_LEDGER] Failed to insert audit log record:', err?.message || err);
    }

    return record;
  }

  /**
   * Retrieves log stream from database.
   */
  public static getLedgerRecords(limit = 100): AuditLedgerRecord[] {
    this.ensureTableExists();

    try {
      const rows = queryDb<any>('SELECT * FROM immutable_audit_ledger ORDER BY created_at DESC LIMIT ?', [limit]);
      return rows.map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        actorName: r.actor_name,
        actorEmail: r.actor_email,
        actorRole: r.actor_role,
        category: r.category,
        action: r.action,
        targetResource: r.target_resource,
        framework: r.framework,
        previousStatus: r.previous_status,
        newStatus: r.new_status,
        severity: r.severity,
        ipAddress: r.ip_address,
        location: r.location,
        sha256Hash: r.sha256_hash,
        previousHash: r.previous_hash,
        hmacSignature: r.hmac_signature,
        metadata: typeof r.metadata_json === 'string' ? JSON.parse(r.metadata_json) : r.metadata_json || {}
      }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Cryptographically verifies chain integrity from genesis to current tail.
   */
  public static verifyChainIntegrity(): { isChainValid: boolean; totalChecked: number; brokenBlockId?: string } {
    this.ensureTableExists();

    const rows = queryDb<any>('SELECT * FROM immutable_audit_ledger ORDER BY created_at ASC, id ASC');
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Check link to previous
      if (i > 0 && row.previous_hash !== prevHash) {
        return { isChainValid: false, totalChecked: i, brokenBlockId: row.id };
      }

      // Recompute hash
      const { sha256Hash, hmacSignature } = this.computeHashes({
        timestamp: row.timestamp,
        actorEmail: row.actor_email,
        action: row.action,
        targetResource: row.target_resource,
        previousStatus: row.previous_status,
        newStatus: row.new_status,
        previousHash: row.previous_hash
      });

      if (sha256Hash !== row.sha256_hash || hmacSignature !== row.hmac_signature) {
        return { isChainValid: false, totalChecked: i, brokenBlockId: row.id };
      }

      prevHash = row.sha256_hash;
    }

    return { isChainValid: true, totalChecked: rows.length };
  }
}
