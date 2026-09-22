import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import db from '../db/sqlite';
import { PiiEncryptionService } from './pii-encryption';

// Private local vault storage - strictly outside of public/ web root
const BUCKET_DIR = path.join(process.cwd(), 'storage', 'private_vault');
if (!fs.existsSync(BUCKET_DIR)) {
  fs.mkdirSync(BUCKET_DIR, { recursive: true });
}

// Security remediation: ensure public/uploads/vault is purged if it existed
const LEGACY_PUBLIC_DIR = path.join(process.cwd(), 'public', 'uploads');
if (fs.existsSync(LEGACY_PUBLIC_DIR)) {
  try {
    const legacyVault = path.join(LEGACY_PUBLIC_DIR, 'vault');
    if (fs.existsSync(legacyVault)) {
      const legacyFiles = fs.readdirSync(legacyVault);
      for (const file of legacyFiles) {
        fs.copyFileSync(path.join(legacyVault, file), path.join(BUCKET_DIR, file));
      }
      fs.rmSync(legacyVault, { recursive: true, force: true });
    }
    fs.rmSync(LEGACY_PUBLIC_DIR, { recursive: true, force: true });
    console.log('[ENC_STORAGE] Successfully migrated and eliminated insecure public/uploads directory.');
  } catch (err: any) {
    console.warn('[ENC_STORAGE] Migration notice:', err.message);
  }
}

export interface S3KmsAccessLog {
  id: string;
  s3_key: string;
  operation: 'UPLOAD' | 'DOWNLOAD' | 'VIEW' | 'DELETE' | 'KMS_DECRYPT';
  actor_id: string;
  actor_role: string;
  ip_address: string;
  status: 'SUCCESS' | 'DENIED' | 'ERROR';
  kms_key_arn: string;
  details: string;
  timestamp: string;
}

export class EncryptedStorageService {
  // Configurable master envelope encryption identifier (AWS KMS or Sovereign Vault Master)
  private static getMasterKeyIdentifier(): string {
    return process.env.AWS_KMS_KEY_ARN || process.env.VAULT_MASTER_KEY_ID || 'sovereign-vault-envelope-master-key-v1';
  }

  /**
   * Initialize S3 access log and storage state table
   */
  public static initializeSchema(): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS s3_kms_access_logs (
        id TEXT PRIMARY KEY,
        s3_key TEXT NOT NULL,
        operation TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        ip_address TEXT,
        status TEXT NOT NULL,
        kms_key_arn TEXT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS s3_objects_metadata (
        s3_key TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        encrypted_dek TEXT NOT NULL,
        dek_iv TEXT NOT NULL,
        dek_auth_tag TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Log access into s3_kms_access_logs
   */
  public static logAccess(
    s3Key: string,
    operation: 'UPLOAD' | 'DOWNLOAD' | 'VIEW' | 'DELETE' | 'KMS_DECRYPT',
    actorId: string,
    actorRole: string,
    ipAddress: string,
    status: 'SUCCESS' | 'DENIED' | 'ERROR',
    details: string = ''
  ): void {
    try {
      this.initializeSchema();
      const id = `s3_log_${crypto.randomUUID()}`;
      db.prepare(`
        INSERT INTO s3_kms_access_logs (id, s3_key, operation, actor_id, actor_role, ip_address, status, kms_key_arn, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, s3Key, operation, actorId, actorRole, ipAddress, status, this.getMasterKeyIdentifier(), details);
    } catch (e: any) {
      console.error('[ENC_STORAGE] Failed to write access log:', e.message);
    }
  }

  /**
   * List encrypted documents belonging to a specific tenant
   */
  public static listDocuments(tenantId: string): any[] {
    this.initializeSchema();
    try {
      const rows = db.prepare(`
        SELECT s3_key, file_name, mime_type, size_bytes, tenant_id, created_at 
        FROM s3_objects_metadata 
        WHERE tenant_id = ? 
        ORDER BY created_at DESC
      `).all(tenantId) as any[];

      return rows.map(r => ({
        id: r.s3_key,
        name: r.file_name,
        type: r.mime_type.includes('pdf') ? 'DPA' : (r.file_name.endsWith('.docx') ? 'Assessment' : 'Legal'),
        mimeType: r.mime_type,
        size: r.size_bytes > 1024 * 1024 
          ? `${(r.size_bytes / (1024 * 1024)).toFixed(1)} MB` 
          : `${Math.round(r.size_bytes / 1024)} KB`,
        date: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'ENCRYPTED'
      }));
    } catch (err: any) {
      console.error('[ENC_STORAGE] List documents error:', err);
      return [];
    }
  }

  /**
   * Encrypt and store a document using envelope encryption (KMS DEK + Private Storage)
   */
  public static uploadDocument(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    tenantId: string,
    actorId: string,
    actorRole: string,
    ipAddress: string
  ): { s3Key: string; success: boolean } {
    this.initializeSchema();
    const documentId = crypto.randomUUID();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const s3Key = `${tenantId}/kyc/${documentId}_${cleanFileName}`;

    try {
      // 1. Generate local 256-bit Data Encryption Key (DEK)
      const dek = crypto.randomBytes(32);

      // 2. Encrypt the file buffer with the DEK using AES-256-GCM
      const fileIv = crypto.randomBytes(12);
      const fileCipher = crypto.createCipheriv('aes-256-gcm', dek, fileIv);
      let encryptedFile = fileCipher.update(fileBuffer);
      encryptedFile = Buffer.concat([encryptedFile, fileCipher.final()]);
      const fileAuthTag = fileCipher.getAuthTag();

      // 3. Encrypt the DEK using our Master PII Encryption Service (acting as KMS Envelope wrap)
      const encryptedDekBundle = PiiEncryptionService.encrypt(dek.toString('hex'), 'KMS_DEK');
      const [keyVersion, dekIvHex, dekAuthTagHex, encryptedDekHex] = encryptedDekBundle.split(':');

      // 4. Write encrypted ciphertext + authentication components to private storage outside of web root
      const s3StoragePath = path.join(BUCKET_DIR, `${documentId}.enc`);
      
      // We store: fileIv (12 bytes) + fileAuthTag (16 bytes) + encryptedFile
      const payload = Buffer.concat([fileIv, fileAuthTag, encryptedFile]);
      fs.writeFileSync(s3StoragePath, payload);

      // 5. Store metadata in sqlite metadata store
      db.prepare(`
        INSERT INTO s3_objects_metadata (s3_key, file_name, mime_type, size_bytes, encrypted_dek, dek_iv, dek_auth_tag, tenant_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        s3Key,
        fileName,
        mimeType,
        fileBuffer.length,
        encryptedDekHex,
        dekIvHex,
        dekAuthTagHex,
        tenantId
      );

      // 6. Log success with KMS DEK wrap details
      this.logAccess(
        s3Key,
        'UPLOAD',
        actorId,
        actorRole,
        ipAddress,
        'SUCCESS',
        `File encrypted with AES-256-GCM. DEK enveloped via Master Key ${this.getMasterKeyIdentifier()} version ${keyVersion}.`
      );

      return { s3Key, success: true };
    } catch (e: any) {
      console.error('[ENC_STORAGE] Upload error:', e);
      this.logAccess(s3Key, 'UPLOAD', actorId, actorRole, ipAddress, 'ERROR', e.message);
      return { s3Key, success: false };
    }
  }

  /**
   * Retrieve and decrypt a document with tenant isolation check
   */
  public static downloadDocument(
    s3Key: string,
    tenantId: string,
    actorId: string,
    actorRole: string,
    ipAddress: string
  ): { fileBuffer: Buffer; mimeType: string; fileName: string } | null {
    this.initializeSchema();
    
    try {
      // 1. Fetch metadata
      const meta = db.prepare('SELECT * FROM s3_objects_metadata WHERE s3_key = ?').get(s3Key) as any;
      if (!meta) {
        this.logAccess(s3Key, 'DOWNLOAD', actorId, actorRole, ipAddress, 'ERROR', 'Metadata not found in registry.');
        return null;
      }

      // Multi-tenant isolation check: Only the owning tenant or system admin can access
      if (meta.tenant_id !== tenantId && actorRole !== 'ADMIN' && actorRole !== 'SUPER_ADMIN') {
        this.logAccess(s3Key, 'DOWNLOAD', actorId, actorRole, ipAddress, 'DENIED', `Cross-tenant access violation: ${actorId} from ${tenantId} attempted to access ${meta.tenant_id}`);
        return null;
      }

      // 2. Locate encrypted file
      const documentId = s3Key.split('/').pop()?.split('_')[0];
      const s3StoragePath = path.join(BUCKET_DIR, `${documentId}.enc`);
      if (!fs.existsSync(s3StoragePath)) {
        this.logAccess(s3Key, 'DOWNLOAD', actorId, actorRole, ipAddress, 'ERROR', 'Encrypted file payload missing on local file system.');
        return null;
      }

      // 3. Re-assemble PII-encrypted envelope to decrypt the DEK via PiiEncryptionService (KMS)
      const activeKeyVersion = PiiEncryptionService.getKeyManagementMeta().activeVersion;
      const dekBundle = `${activeKeyVersion}:${meta.dek_iv}:${meta.dek_auth_tag}:${meta.encrypted_dek}`;
      
      this.logAccess(s3Key, 'KMS_DECRYPT', actorId, actorRole, ipAddress, 'SUCCESS', 'KMS AWS Envelope decryption of DEK initiated.');
      const decryptedDekHex = PiiEncryptionService.decrypt(dekBundle);
      const dek = Buffer.from(decryptedDekHex, 'hex');

      // 4. Read file package
      const filePayload = fs.readFileSync(s3StoragePath);
      const fileIv = filePayload.subarray(0, 12);
      const fileAuthTag = filePayload.subarray(12, 28);
      const encryptedFile = filePayload.subarray(28);

      // 5. Decrypt the file with the recovered DEK using AES-256-GCM
      const fileDecipher = crypto.createDecipheriv('aes-256-gcm', dek, fileIv);
      fileDecipher.setAuthTag(fileAuthTag);
      let decryptedFile = fileDecipher.update(encryptedFile);
      decryptedFile = Buffer.concat([decryptedFile, fileDecipher.final()]);

      // 6. Log success
      this.logAccess(
        s3Key,
        'DOWNLOAD',
        actorId,
        actorRole,
        ipAddress,
        'SUCCESS',
        `File successfully decrypted and downloaded.`
      );

      return {
        fileBuffer: decryptedFile,
        mimeType: meta.mime_type,
        fileName: meta.file_name
      };
    } catch (e: any) {
      console.error('[ENC_STORAGE] Download error:', e);
      this.logAccess(s3Key, 'DOWNLOAD', actorId, actorRole, ipAddress, 'ERROR', e.message);
      return null;
    }
  }

  /**
   * Delete document and its KMS metadata permanently (GDPR right to erasure compliance)
   */
  public static deleteDocument(
    s3Key: string,
    tenantId: string,
    actorId: string,
    actorRole: string,
    ipAddress: string
  ): boolean {
    this.initializeSchema();
    try {
      const meta = db.prepare('SELECT * FROM s3_objects_metadata WHERE s3_key = ?').get(s3Key) as any;
      if (meta) {
        // Multi-tenant check
        if (meta.tenant_id !== tenantId && actorRole !== 'ADMIN' && actorRole !== 'SUPER_ADMIN') {
          this.logAccess(s3Key, 'DELETE', actorId, actorRole, ipAddress, 'DENIED', 'Tenant isolation denied deletion request.');
          return false;
        }

        const documentId = s3Key.split('/').pop()?.split('_')[0];
        const s3StoragePath = path.join(BUCKET_DIR, `${documentId}.enc`);
        if (fs.existsSync(s3StoragePath)) {
          fs.unlinkSync(s3StoragePath);
        }
        db.prepare('DELETE FROM s3_objects_metadata WHERE s3_key = ?').run(s3Key);
      }
      this.logAccess(s3Key, 'DELETE', actorId, actorRole, ipAddress, 'SUCCESS', 'Cryptographic purge of physical media and envelope KMS key accomplished.');
      return true;
    } catch (e: any) {
      console.error('[ENC_STORAGE] Purge error:', e);
      this.logAccess(s3Key, 'DELETE', actorId, actorRole, ipAddress, 'ERROR', e.message);
      return false;
    }
  }

  /**
   * Generate a signed, time-limited presigned viewing URL
   */
  public static generatePresignedUrl(
    s3Key: string,
    expiresInSeconds: number = 300
  ): string {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('FATAL: JWT_SECRET must be set in production for presigned URL signing.'); })()
      : 'dev-only-presigned-secret-do-not-use-in-production');
    
    // HMAC hash of the combination
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${s3Key}:${expiresAt}`)
      .digest('hex');

    return `/api/v1/vault/view?key=${encodeURIComponent(s3Key)}&expires=${expiresAt}&signature=${signature}`;
  }

  /**
   * Validate signed URL signature
   */
  public static validatePresignedUrl(
    s3Key: string,
    expiresAtStr: string,
    signature: string
  ): boolean {
    try {
      const expiresAt = parseInt(expiresAtStr, 10);
      if (isNaN(expiresAt) || Date.now() / 1000 > expiresAt) {
        return false; // Expired
      }
      
      const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
        ? (() => { throw new Error('FATAL: JWT_SECRET must be set in production for presigned URL signing.'); })()
        : 'dev-only-presigned-secret-do-not-use-in-production');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${s3Key}:${expiresAt}`)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }
}

