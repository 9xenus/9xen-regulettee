/**
 * Formal Migration Script: Privacy Budget & Sovereign Enclave Schema Alignment
 * Aligns local SQLite and multi-region simulated databases with backend enforcement engine requirements.
 */

import { getDb } from '../sqlite';

export interface MigrationResult {
  success: boolean;
  migrationName: string;
  tablesCreated: string[];
  indexesCreated: string[];
  executedAt: string;
  error?: string;
}

export class PrivacyBudgetMigration {
  static runMigration(regionCode?: string): MigrationResult {
    const db = getDb(regionCode);
    const tablesCreated: string[] = [];
    const indexesCreated: string[] = [];
    const timestamp = new Date().toISOString();

    if (!db || !db.exec) {
      return {
        success: false,
        migrationName: 'privacy_budget_enforcement_alignment_v1',
        tablesCreated: [],
        indexesCreated: [],
        executedAt: timestamp,
        error: 'Database instance not available or client-side mock'
      };
    }

    try {
      db.exec('BEGIN TRANSACTION;');

      // 1. Privacy Budgets Table Alignment
      db.exec(`
        CREATE TABLE IF NOT EXISTS privacy_budgets (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          cohort_id TEXT NOT NULL,
          epsilon_consumed REAL NOT NULL DEFAULT 0.0,
          budget_cap REAL NOT NULL DEFAULT 1.0,
          reset_frequency TEXT NOT NULL DEFAULT 'MONTHLY',
          last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(tenant_id, cohort_id)
        );
      `);
      tablesCreated.push('privacy_budgets');

      // 2. Privacy Query Logs Table Alignment
      db.exec(`
        CREATE TABLE IF NOT EXISTS privacy_query_logs (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          cohort_id TEXT NOT NULL,
          query_text TEXT NOT NULL,
          triggered_by TEXT NOT NULL,
          epsilon_cost REAL NOT NULL,
          execution_status TEXT NOT NULL DEFAULT 'APPROVED',
          audit_hash TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      tablesCreated.push('privacy_query_logs');

      // 3. Sovereign Enclave Logs Alignment
      db.exec(`
        CREATE TABLE IF NOT EXISTS sovereign_enclave_logs (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          source_jurisdiction TEXT NOT NULL,
          target_jurisdiction TEXT NOT NULL,
          data_type TEXT NOT NULL,
          allowed INTEGER NOT NULL DEFAULT 1,
          rule_matched TEXT NOT NULL,
          audit_hash TEXT NOT NULL,
          enclave_node TEXT,
          latency_ms INTEGER DEFAULT 5,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      tablesCreated.push('sovereign_enclave_logs');

      // 4. Create Performance and Audit Indexes
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_privacy_budgets_tenant ON privacy_budgets(tenant_id);',
        'CREATE INDEX IF NOT EXISTS idx_privacy_budgets_cohort ON privacy_budgets(cohort_id);',
        'CREATE INDEX IF NOT EXISTS idx_privacy_query_logs_tenant ON privacy_query_logs(tenant_id);',
        'CREATE INDEX IF NOT EXISTS idx_privacy_query_logs_cohort ON privacy_query_logs(cohort_id);',
        'CREATE INDEX IF NOT EXISTS idx_sovereign_enclave_logs_tenant ON sovereign_enclave_logs(tenant_id);',
        'CREATE INDEX IF NOT EXISTS idx_sovereign_enclave_logs_jurisdiction ON sovereign_enclave_logs(source_jurisdiction, target_jurisdiction);'
      ];

      for (const idxSql of indexes) {
        db.exec(idxSql);
        indexesCreated.push(idxSql.split(' ')[4]); // Extract index name
      }

      // 5. Record Migration Meta Entry
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.prepare(`
        INSERT OR REPLACE INTO schema_migrations (version, name)
        VALUES (?, ?)
      `).run('2026-09-07-privacy-budget-enforcement-v1', 'privacy_budget_enforcement_alignment');

      db.exec('COMMIT;');

      console.log('[MIGRATION] Privacy budget & enforcement schema alignment completed successfully.');
      return {
        success: true,
        migrationName: 'privacy_budget_enforcement_alignment_v1',
        tablesCreated,
        indexesCreated,
        executedAt: timestamp
      };
    } catch (err: any) {
      try {
        db.exec('ROLLBACK;');
      } catch {}
      console.error('[MIGRATION_ERROR] Failed to run privacy budget migration:', err);
      return {
        success: false,
        migrationName: 'privacy_budget_enforcement_alignment_v1',
        tablesCreated,
        indexesCreated,
        executedAt: timestamp,
        error: err.message
      };
    }
  }
}
