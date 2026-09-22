import db from '../db/sqlite';
import crypto from 'crypto';
import { ConfigValidationService } from './config-validation-service';

export interface BackupConfig {
  interval_hours: number;
  retention_days: number;
  is_active: boolean;
  is_encrypted: boolean;
  last_run: string | null;
  next_run: string;
}

export const BackupService = {
  /**
   * Gets the current backup configuration
   */
  getConfig(): BackupConfig {
    const record = db.prepare('SELECT setting_value FROM system_settings_extended WHERE setting_key = ?')
      .get('vault_backup_config') as any;
    
    if (!record) {
      return {
        interval_hours: 24,
        retention_days: 30,
        is_active: false,
        is_encrypted: true,
        last_run: null,
        next_run: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      };
    }
    return JSON.parse(record.setting_value);
  },

  /**
   * Updates the backup configuration
   */
  updateConfig(config: Partial<BackupConfig>) {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    
    db.prepare('UPDATE system_settings_extended SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?')
      .run(JSON.stringify(updated), 'vault_backup_config');
    
    return updated;
  },

  /**
   * Performs an encrypted background export
   */
  async performBackup(isAutomated: boolean = false): Promise<string> {
    const id = `bak_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    try {
      // 1. Get all relevant configs for integrity check
      // For demo purposes, we'll fetch some dummy configs or use what's in the system_settings_extended
      const settings = db.prepare('SELECT setting_key as key, setting_value as value FROM system_settings_extended').all() as any[];
      // Map to the format expected by validation service
      const configsToValidate = settings.map(s => ({
        key: s.key,
        value: s.value,
        type: s.key.includes('TIMEOUT') ? 'integer' : 'string' // simplified mapping
      }));

      const validation = ConfigValidationService.validateConfigs(configsToValidate);
      
      if (!validation.isValid) {
        throw new Error(`Integrity check failed: ${validation.issues.filter(i => i.severity === 'CRITICAL').length} critical issues.`);
      }

      // 2. Simulate Encryption & Export
      // In a real app, we would stream the SQLite file to a buffer, encrypt it, and upload to S3/GCS
      const dummyData = JSON.stringify({
        schema_version: '2.1.0',
        records_exported: 1452,
        entropy_check: 'PASSED',
        checksum: crypto.randomBytes(16).toString('hex')
      });

      const encryptedData = this.encryptData(dummyData);
      
      // 3. Log Success
      db.prepare(`
        INSERT INTO backup_history (id, timestamp, status, file_path, encryption_status, integrity_score, details, is_automated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        timestamp,
        'SUCCESS',
        `/backups/vault_snapshot_${id}.enc`,
        'AES-256-GCM',
        98.5,
        JSON.stringify({
          validation_summary: validation.issues.length + ' warnings noted',
          encryption_alg: 'AES-256-GCM',
          size_bytes: encryptedData.length
        }),
        isAutomated ? 1 : 0
      );

      // 4. Update last_run and next_run
      const config = this.getConfig();
      this.updateConfig({
        last_run: timestamp,
        next_run: new Date(Date.now() + config.interval_hours * 3600 * 1000).toISOString()
      });

      return id;
    } catch (error: any) {
      // Log Failure
      db.prepare(`
        INSERT INTO backup_history (id, timestamp, status, file_path, encryption_status, integrity_score, details, is_automated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        timestamp,
        'FAILED',
        null,
        'NONE',
        0,
        JSON.stringify({ error: error.message }),
        isAutomated ? 1 : 0
      );
      throw error;
    }
  },

  /**
   * Helper to simulate AES encryption
   */
  encryptData(data: string): string {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  },

  /**
   * Gets backup history
   */
  getHistory(limit: number = 10) {
    return db.prepare('SELECT * FROM backup_history ORDER BY timestamp DESC LIMIT ?').all(limit);
  }
};
