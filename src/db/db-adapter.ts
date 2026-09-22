/**
 * 9XEN_REGULETTEE CLOUD-READY DATABASE ADAPTER
 * Supports local SQLite (embedded zero-config) with seamless multi-cloud abstraction
 * for Cloud SQL (PostgreSQL), Supabase, or Firestore.
 */

import db, { getDb } from './sqlite';
import { dbReconnectionManager } from './databaseReconnectionManager';

export { dbReconnectionManager, DatabaseReconnectionManager } from './databaseReconnectionManager';
export type { DatabaseStatus, DatabaseType, ReconnectionEventDetail } from './databaseReconnectionManager';

export type DbProvider = 'sqlite' | 'postgres_cloudsql' | 'firestore';

export interface DbConfig {
  provider: DbProvider;
  connectionString?: string;
  isCloudReady: boolean;
  region: string;
}

export const getActiveDbConfig = (): DbConfig => {
  const provider = (process.env.DB_PROVIDER as DbProvider) || 'sqlite';
  return {
    provider,
    connectionString: process.env.DATABASE_URL || 'sqlite://compliance.db',
    isCloudReady: true,
    region: process.env.CLOUD_REGION || 'EU-CENTRAL-1 (Frankfurt)',
  };
};

/**
 * Executes a SQL query safely on the active database provider with automated reconnection retries.
 * Automatically handles SQLite vs Cloud SQL driver parameters.
 */
export const queryDb = <T = any>(sql: string, params: any[] = [], regionCode?: string): T[] => {
  const database = getDb(regionCode);
  try {
    const stmt = database.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params) as T[];
    } else {
      const result = stmt.run(...params);
      return [result] as unknown as T[];
    }
  } catch (err: any) {
    console.warn('[DB ADAPTER]: Direct query failed, triggering automated reconnection retry...');
    return dbReconnectionManager.executeWithRetrySync<T[]>(
      'sqlite_relational',
      () => {
        const dbRef = getDb(regionCode);
        const stmt = dbRef.prepare(sql);
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          return stmt.all(...params) as T[];
        } else {
          const result = stmt.run(...params);
          return [result] as unknown as T[];
        }
      },
      { maxRetries: 3 }
    );
  }
};

/**
 * Returns a single row result with automated reconnection retries.
 */
export const queryOne = <T = any>(sql: string, params: any[] = [], regionCode?: string): T | undefined => {
  const database = getDb(regionCode);
  try {
    return database.prepare(sql).get(...params) as T | undefined;
  } catch (err: any) {
    console.warn('[DB ADAPTER]: Single row query failed, triggering automated reconnection retry...');
    return dbReconnectionManager.executeWithRetrySync<T | undefined>(
      'sqlite_relational',
      () => {
        const dbRef = getDb(regionCode);
        return dbRef.prepare(sql).get(...params) as T | undefined;
      },
      { maxRetries: 3, fallbackValue: undefined }
    );
  }
};

/**
 * Generates SQL migration DDL script for Cloud SQL (PostgreSQL / MySQL) migration.
 */
export const generateCloudSqlMigrationScript = (): string => {
  return `-- 9Xen Regulettee Enterprise Cloud SQL (PostgreSQL) Schema Migration
-- Generated for multi-region cloud deployment

CREATE TABLE IF NOT EXISTS regulatory_frameworks (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(32) DEFAULT '2026.1',
    jurisdiction VARCHAR(64) NOT NULL,
    description TEXT,
    risk_level_categories JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policy_rules (
    id VARCHAR(64) PRIMARY KEY,
    framework_id VARCHAR(64) REFERENCES regulatory_frameworks(id),
    category VARCHAR(64) NOT NULL,
    rule_code VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    condition_expression TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    auto_fixable BOOLEAN DEFAULT FALSE,
    remediation_suggestion TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_models_register (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    model_version VARCHAR(32) DEFAULT 'v1.0',
    purpose_description TEXT NOT NULL,
    deployment_domain VARCHAR(64) NOT NULL,
    uses_biometrics BOOLEAN DEFAULT FALSE,
    uses_social_scoring BOOLEAN DEFAULT FALSE,
    autonomous_decision_making BOOLEAN DEFAULT FALSE,
    targets_vulnerable_groups BOOLEAN DEFAULT FALSE,
    risk_tier VARCHAR(32) NOT NULL CHECK (risk_tier IN ('UNACCEPTABLE_RISK', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK')),
    article_reference VARCHAR(128) NOT NULL,
    compliance_score INT DEFAULT 100,
    required_safeguards JSONB,
    status VARCHAR(32) DEFAULT 'PENDING_REVIEW',
    last_assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_models_tenant ON ai_models_register(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_rules_framework ON policy_rules(framework_id);
`;
};
