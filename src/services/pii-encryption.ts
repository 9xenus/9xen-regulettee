import crypto from 'crypto';
import db from '../db/sqlite';

// Master Key for encryption. MUST be provided via env in production (fail closed).
const getMasterKey = (): Buffer => {
  const envKey = process.env.MASTER_ENCRYPTION_KEY;
  if (envKey) {
    return crypto.createHash('sha256').update(envKey).digest();
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: MASTER_ENCRYPTION_KEY must be set in production for PII encryption.');
  }
  console.warn('[PII_CRYPT] No MASTER_ENCRYPTION_KEY set. Using dev-only fallback. DO NOT USE IN PRODUCTION.');
  return crypto.createHash('sha256').update('dev-only-pii-key-do-not-use-in-production').digest();
};

export interface OperationalKey {
  id: string;
  encryptedKeyValue: string;
  iv: string;
  authTag: string;
  isActive: boolean;
  createdAt: string;
  rotatedAt?: string;
}

export interface PiiRecord {
  id: string;
  dataType: string;
  encryptedValue: string;
  createdAt: string;
}

export interface RotationLog {
  id: string;
  action: string;
  triggeredBy: string;
  details: string;
  timestamp: string;
}

/**
 * PII Cryptographic Vault Service (AES-256-GCM)
 * Strictly compliant with GDPR Article 32 (Security of processing) & Article 25 (Privacy by design).
 */
export class PiiEncryptionService {
  private static masterKey: Buffer = getMasterKey();

  /**
   * Initializes the cryptographic schema in the SQLite database if it doesn't exist.
   */
  public static initializeSchema(): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS encryption_keys (
        id TEXT PRIMARY KEY,
        encrypted_key_value TEXT NOT NULL,
        iv TEXT NOT NULL,
        auth_tag TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rotated_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pii_vault (
        id TEXT PRIMARY KEY,
        data_type TEXT NOT NULL,
        encrypted_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS key_rotation_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        triggered_by TEXT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure we have at least one active key version
    const activeKey = this.getActiveKeyRecord();
    if (!activeKey) {
      this.generateNewOperationalKey('SYSTEM_INIT');
    }
  }

  /**
   * Generates a new operational key, encrypts it using the Master Key (Envelope Encryption),
   * stores it in the database, and marks it as active (retiring previous keys).
   */
  public static generateNewOperationalKey(triggeredBy: string = 'SYSTEM'): string {
    const keyVersion = `key_v_${Date.now()}`;
    const rawOpKey = crypto.randomBytes(32); // 256-bit key

    // Encrypt the operational key with the Master Key using AES-256-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);
    
    let encrypted = cipher.update(rawOpKey);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    const encryptedKeyValue = encrypted.toString('hex');
    const ivHex = iv.toString('hex');
    const authTagHex = authTag.toString('hex');

    // Store in key store and deactivate existing operational keys in a single transaction
    const rotateTx = db.transaction(() => {
      // Deactivate current active keys
      db.prepare('UPDATE encryption_keys SET is_active = 0, rotated_at = CURRENT_TIMESTAMP WHERE is_active = 1').run();

      // Insert new active operational key
      db.prepare(`
        INSERT INTO encryption_keys (id, encrypted_key_value, iv, auth_tag, is_active)
        VALUES (?, ?, ?, ?, 1)
      `).run(keyVersion, encryptedKeyValue, ivHex, authTagHex);

      // Log the event
      const logId = crypto.randomUUID();
      const details = JSON.stringify({
        newVersion: keyVersion,
        algorithm: 'AES-256-GCM',
        envelopeAlgorithm: 'AES-256-GCM (Master Key Wrapped)'
      });
      db.prepare(`
        INSERT INTO key_rotation_logs (id, action, triggered_by, details)
        VALUES (?, ?, ?, ?)
      `).run(logId, 'KEY_ROTATION_TRIGGERED', triggeredBy, details);
    });

    rotateTx();
    console.log(`[PII_CRYPT_SERVICE] Rotated to new active key version: ${keyVersion}`);
    return keyVersion;
  }

  /**
   * Retrieves the current active key record.
   */
  private static getActiveKeyRecord(): OperationalKey | null {
    try {
      const record = db.prepare('SELECT * FROM encryption_keys WHERE is_active = 1 LIMIT 1').get() as any;
      if (!record) return null;
      return {
        id: record.id,
        encryptedKeyValue: record.encrypted_key_value,
        iv: record.iv,
        authTag: record.auth_tag,
        isActive: record.is_active === 1,
        createdAt: record.created_at,
        rotatedAt: record.rotated_at || undefined
      };
    } catch {
      return null;
    }
  }

  /**
   * Retrieves a specific operational key record by ID.
   */
  private static getKeyRecordById(keyId: string): OperationalKey | null {
    try {
      const record = db.prepare('SELECT * FROM encryption_keys WHERE id = ?').get(keyId) as any;
      if (!record) return null;
      return {
        id: record.id,
        encryptedKeyValue: record.encrypted_key_value,
        iv: record.iv,
        authTag: record.auth_tag,
        isActive: record.is_active === 1,
        createdAt: record.created_at,
        rotatedAt: record.rotated_at || undefined
      };
    } catch {
      return null;
    }
  }

  /**
   * Decrypts an operational key from its enveloped representation using the Master Key.
   */
  private static decryptOperationalKey(keyRecord: OperationalKey): Buffer {
    const encryptedKey = Buffer.from(keyRecord.encryptedKeyValue, 'hex');
    const iv = Buffer.from(keyRecord.iv, 'hex');
    const authTag = Buffer.from(keyRecord.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedKey);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
  }

  /**
   * Encrypts a plaintext PII field using the current active Operational Key.
   * Format of output: `keyVersion:iv:authTag:encryptedCiphertext`
   */
  public static encrypt(plainText: string, dataType: string): string {
    this.initializeSchema();
    let activeKeyRecord = this.getActiveKeyRecord();
    if (!activeKeyRecord) {
      this.generateNewOperationalKey('SYSTEM_INIT');
      activeKeyRecord = this.getActiveKeyRecord();
    }
    if (!activeKeyRecord) {
      throw new Error('No active operational key available in the Vault key-store.');
    }

    const rawOpKey = this.decryptOperationalKey(activeKeyRecord);
    const iv = crypto.randomBytes(12); // GCM standard IV is 12 bytes
    const cipher = crypto.createCipheriv('aes-256-gcm', rawOpKey, iv);

    let encrypted = cipher.update(plainText, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    const cipherText = encrypted.toString('hex');
    const ivHex = iv.toString('hex');
    const authTagHex = authTag.toString('hex');

    // Return the bundle formatted with the key version descriptor to support graceful historic retrieval
    return `${activeKeyRecord.id}:${ivHex}:${authTagHex}:${cipherText}`;
  }

  /**
   * Decrypts a formatted ciphertext bundle. Parses the version prefix, retrieves
   * the exact historical operational key version used, decrypts the key, and decrypts the PII.
   */
  public static decrypt(cipherBundle: string): string {
    const parts = cipherBundle.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid cipher bundle format. Expected keyVersion:iv:authTag:ciphertext');
    }

    const [keyVersion, ivHex, authTagHex, cipherTextHex] = parts;
    const keyRecord = this.getKeyRecordById(keyVersion);
    if (!keyRecord) {
      throw new Error(`Cryptographic failure: Historical operational key version '${keyVersion}' has been deleted or cannot be resolved.`);
    }

    const rawOpKey = this.decryptOperationalKey(keyRecord);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const cipherText = Buffer.from(cipherTextHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', rawOpKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }

  /**
   * Stores a PII record securely. Encrypts it at rest and saves to the SQLite `pii_vault` table.
   */
  public static storePii(id: string, dataType: string, plainValue: string): void {
    const encryptedValue = this.encrypt(plainValue, dataType);
    db.prepare(`
      INSERT OR REPLACE INTO pii_vault (id, data_type, encrypted_value)
      VALUES (?, ?, ?)
    `).run(id, dataType, encryptedValue);
  }

  /**
   * Retrieves and decrypts a PII record from the database.
   */
  public static retrievePii(id: string): string | null {
    const record = db.prepare('SELECT * FROM pii_vault WHERE id = ?').get(id) as any;
    if (!record) return null;
    try {
      return this.decrypt(record.encrypted_value);
    } catch (e: any) {
      console.error(`[PII_CRYPT_SERVICE] Failed to decrypt record ${id}:`, e);
      return `[DECRYPTION_ERROR: ${e.message}]`;
    }
  }

  /**
   * Deletes a PII record (Right to be Forgotten / GDPR compliance).
   */
  public static deletePii(id: string): void {
    db.prepare('DELETE FROM pii_vault WHERE id = ?').run(id);
  }

  /**
   * Returns metadata about the keys in the system.
   */
  public static getKeyManagementMeta(): {
    activeVersion: string;
    totalKeysCount: number;
    rotationScheduleDays: number;
    masterKeyFingerprint: string;
    keys: OperationalKey[];
    logs: RotationLog[];
    recordsCount: number;
  } {
    const activeRecord = this.getActiveKeyRecord();
    const activeVersion = activeRecord ? activeRecord.id : 'unknown';

    const countRes = db.prepare('SELECT count(*) as c FROM encryption_keys').get() as { c: number };
    const keysCount = countRes ? countRes.c : 0;

    const recordsRes = db.prepare('SELECT count(*) as c FROM pii_vault').get() as { c: number };
    const recordsCount = recordsRes ? recordsRes.c : 0;

    // Generate a secure SHA-256 hash representation of the master key (fingerprint)
    const masterFingerprint = crypto.createHash('sha256').update(this.masterKey).digest('hex').substring(0, 16) + '...';

    // Retrieve all keys
    const keysList = db.prepare('SELECT * FROM encryption_keys ORDER BY created_at DESC').all() as any[];
    const keys: OperationalKey[] = keysList.map(k => ({
      id: k.id,
      encryptedKeyValue: k.encrypted_key_value.substring(0, 8) + '...',
      iv: k.iv,
      authTag: k.auth_tag,
      isActive: k.is_active === 1,
      createdAt: k.created_at,
      rotatedAt: k.rotated_at || undefined
    }));

    // Retrieve rotation logs
    const logsList = db.prepare('SELECT * FROM key_rotation_logs ORDER BY timestamp DESC LIMIT 50').all() as any[];
    const logs: RotationLog[] = logsList.map(l => ({
      id: l.id,
      action: l.action,
      triggeredBy: l.triggered_by,
      details: l.details,
      timestamp: l.timestamp
    }));

    return {
      activeVersion,
      totalKeysCount: keysCount,
      rotationScheduleDays: 90, // GDPR Enterprise Best Practice schedule
      masterKeyFingerprint: masterFingerprint,
      keys,
      logs,
      recordsCount
    };
  }

  /**
   * Background task simulator: triggers re-encryption of all database records
   * under the new active key. (Ensures retired keys can be deleted eventually).
   */
  public static reencryptAllRecords(triggeredBy: string = 'SYSTEM'): { successCount: number; failureCount: number } {
    const records = db.prepare('SELECT * FROM pii_vault').all() as any[];
    let successCount = 0;
    let failureCount = 0;

    const reencryptTx = db.transaction(() => {
      for (const record of records) {
        try {
          const decrypted = this.decrypt(record.encrypted_value);
          const newEncrypted = this.encrypt(decrypted, record.data_type);
          db.prepare('UPDATE pii_vault SET encrypted_value = ? WHERE id = ?').run(newEncrypted, record.id);
          successCount++;
        } catch {
          failureCount++;
        }
      }

      // Log the action
      const logId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO key_rotation_logs (id, action, triggered_by, details)
        VALUES (?, ?, ?, ?)
      `).run(logId, 'RE_ENCRYPTION_COMPLETE', triggeredBy, JSON.stringify({ successCount, failureCount }));
    });

    reencryptTx();
    return { successCount, failureCount };
  }
}
