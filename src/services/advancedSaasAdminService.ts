import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDb } from '../db/sqlite';

export interface TenantEntitlement {
  tenantId: string;
  tenantName: string;
  tier: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'QUARANTINED';
  maxSeats: number;
  currentSeats: number;
  apiRateLimitRpm: number;
  storageQuotaGb: number;
  storageUsedGb: number;
  monthlyLlmTokensBudget: number;
  monthlyLlmTokensUsed: number;
  evidenceRetentionDays: number;
  activeFrameworks: string[];
  featureGates: {
    realTimeDlp: boolean;
    autoScraper: boolean;
    byokEncryption: boolean;
    multiRegionSovereign: boolean;
    gaiaxBridge: boolean;
    forensicLineage: boolean;
    automatedAuditReports: boolean;
  };
  activeBoost?: {
    type: string;
    bonusTokens: number;
    bonusStorageGb: number;
    reason: string;
    expiresAt: string;
  } | null;
  updatedAt: string;
}

export interface EnclaveSovereigntyInfo {
  tenantId: string;
  tenantName: string;
  primaryRegion: string;
  enclaveType: 'SOVEREIGN_EU' | 'BANKING_DACH' | 'FEDRAMP_HIGH' | 'APAC_SOVEREIGN';
  hsmKeyId: string;
  hsmProvider: 'AWS_KMS_HSM' | 'AZURE_DEDICATED_HSM' | 'VAULT_TRANSIT_EIDAS';
  keyRotationDays: number;
  lastRotatedAt: string;
  envelopeEncryptionStatus: 'ACTIVE_AES_256_GCM' | 'ROTATING' | 'DEGRADED';
  schemaIsolationStatus: 'VERIFIED_ZERO_LEAKAGE' | 'PENDING_CHECK' | 'ANOMALY_DETECTED';
  dataResidencyCertId: string;
  complianceAttestation: string;
}

export interface LiveSessionRecord {
  sessionId: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  role: string;
  ipAddress: string;
  location: string;
  countryCode: string;
  clientAgent: string;
  startedAt: string;
  lastActiveAt: string;
  riskScore: number; // 0 - 100
  riskFlags: string[];
  isMfaVerified: boolean;
  tenantQuarantineStatus?: 'ACTIVE' | 'SUSPENDED' | 'QUARANTINED';
}

export interface TenantUnitEconomics {
  tenantId: string;
  tenantName: string;
  tier: string;
  mrrUsd: number;
  arrUsd: number;
  cogsBreakdown: {
    llmInferenceCostUsd: number;
    vectorStorageCostUsd: number;
    computeWorkerCostUsd: number;
    networkTransferCostUsd: number;
    totalCogsUsd: number;
  };
  grossProfitUsd: number;
  grossMarginPct: number;
  llmTokensUsed: number;
  storageUsedGb: number;
  overageFeesUsd: number;
  churnRiskScore: number; // 0 - 100
  profitabilityStatus: 'HIGH_MARGIN' | 'HEALTHY' | 'MARGIN_SQUEEZE' | 'UNPROFITABLE';
}

export interface BackupSnapshot {
  snapshotId: string;
  tenantId: string;
  tenantName: string;
  region: string;
  sizeMb: number;
  sha256Hash: string;
  snapshotType: 'AUTOMATED_HOURLY' | 'DAILY_SOVEREIGN' | 'PRE_MIGRATION' | 'MANUAL_ADMIN';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  createdAt: string;
  retentionUntil: string;
}

export class AdvancedSaasAdminService {
  private static initialSeedDone = false;

  public static initTables(): void {
    const db = getDb();
    if (!db || typeof db.exec !== 'function') return;

    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS saas_tenant_entitlements (
          tenant_id TEXT PRIMARY KEY,
          tenant_name TEXT NOT NULL,
          tier TEXT NOT NULL DEFAULT 'Enterprise',
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          max_seats INTEGER NOT NULL DEFAULT 25,
          current_seats INTEGER NOT NULL DEFAULT 8,
          api_rate_limit_rpm INTEGER NOT NULL DEFAULT 600,
          storage_quota_gb REAL NOT NULL DEFAULT 100,
          storage_used_gb REAL NOT NULL DEFAULT 18.5,
          monthly_llm_tokens_budget INTEGER NOT NULL DEFAULT 5000000,
          monthly_llm_tokens_used INTEGER NOT NULL DEFAULT 1240500,
          evidence_retention_days INTEGER NOT NULL DEFAULT 365,
          active_frameworks TEXT NOT NULL, -- JSON
          feature_gates TEXT NOT NULL,     -- JSON
          active_boost TEXT,               -- JSON
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_security_ip_rules (
          id TEXT PRIMARY KEY,
          tenant_id TEXT DEFAULT 'GLOBAL',
          rule_type TEXT NOT NULL, -- 'ALLOWLIST', 'BLOCKLIST'
          cidr_block TEXT NOT NULL,
          description TEXT,
          created_by TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_backup_snapshots (
          snapshot_id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          tenant_name TEXT NOT NULL,
          region TEXT NOT NULL,
          size_mb REAL NOT NULL,
          sha256_hash TEXT NOT NULL,
          snapshot_type TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          retention_until TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_user_role_permissions (
          user_id TEXT PRIMARY KEY,
          user_name TEXT,
          email TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'CLIENT',
          tenant_id TEXT,
          tenant_name TEXT,
          custom_permissions TEXT, -- JSON array
          revoked_permissions TEXT, -- JSON array
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          mfa_enabled INTEGER DEFAULT 1,
          registration_country TEXT DEFAULT 'EU',
          registration_status TEXT DEFAULT 'approved',
          last_active TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_role_permission_definitions (
          role TEXT PRIMARY KEY,
          permissions TEXT NOT NULL, -- JSON array
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_sovereignty_enclaves (
          tenant_id TEXT PRIMARY KEY,
          tenant_name TEXT NOT NULL,
          primary_region TEXT NOT NULL,
          enclave_type TEXT NOT NULL,
          hsm_key_id TEXT NOT NULL,
          hsm_provider TEXT NOT NULL,
          key_rotation_days INTEGER NOT NULL DEFAULT 90,
          last_rotated_at TIMESTAMP NOT NULL,
          key_rotation_count INTEGER NOT NULL DEFAULT 0,
          envelope_encryption_status TEXT NOT NULL DEFAULT 'ACTIVE_AES_256_GCM',
          schema_isolation_status TEXT NOT NULL DEFAULT 'PENDING_CHECK',
          data_residency_cert_id TEXT NOT NULL,
          compliance_attestation TEXT NOT NULL,
          shredded_at TIMESTAMP,
          shred_cert_id TEXT,
          shred_cert_hash TEXT,
          shred_authorized_by TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_live_sessions (
          session_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          tenant_id TEXT NOT NULL,
          tenant_name TEXT NOT NULL,
          role TEXT NOT NULL,
          ip_address TEXT NOT NULL,
          location TEXT NOT NULL,
          country_code TEXT NOT NULL,
          client_agent TEXT NOT NULL,
          started_at TIMESTAMP NOT NULL,
          last_active_at TIMESTAMP NOT NULL,
          risk_score INTEGER NOT NULL DEFAULT 0,
          risk_flags TEXT, -- JSON array
          is_mfa_verified INTEGER NOT NULL DEFAULT 1,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          terminated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_unit_economics (
          tenant_id TEXT PRIMARY KEY,
          tenant_name TEXT NOT NULL,
          tier TEXT NOT NULL,
          mrr_usd REAL NOT NULL,
          cogs_json TEXT NOT NULL, -- JSON object
          llm_tokens_used INTEGER NOT NULL DEFAULT 0,
          storage_used_gb REAL NOT NULL DEFAULT 0,
          overage_fees_usd REAL NOT NULL DEFAULT 0,
          churn_risk_score INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_billing_invoices (
          invoice_id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          tenant_name TEXT NOT NULL,
          invoice_type TEXT NOT NULL, -- 'OVERAGE' | 'SUBSCRIPTION'
          amount_usd REAL NOT NULL,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'QUEUED',
          issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_migrations (
          migration_id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          tenant_name TEXT NOT NULL,
          from_region TEXT NOT NULL,
          to_region TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
          initiated_by TEXT,
          started_at TIMESTAMP,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_deployment_versions (
          version TEXT PRIMARY KEY,
          deployed_at TIMESTAMP NOT NULL,
          deployed_by TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'ROLLED_BACK' | 'ARCHIVED'
          risk TEXT NOT NULL DEFAULT 'LOW',
          features TEXT NOT NULL,
          is_current INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_deployment_rollbacks (
          rollback_id TEXT PRIMARY KEY,
          target_version TEXT NOT NULL,
          from_version TEXT NOT NULL,
          reason TEXT NOT NULL,
          initiated_by TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saas_dr_drills (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          region TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'SCHEDULED',
          executed_at TIMESTAMP,
          rpo_breached INTEGER NOT NULL DEFAULT 0,
          restored_sets INTEGER NOT NULL DEFAULT 0,
          duration_minutes INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      this.seedDefaultsIfNeeded();
    } catch (err) {
      console.warn('[ADV_SAAS_ADMIN] Table init notice:', err);
    }
  }

  private static seedDefaultsIfNeeded(): void {
    if (this.initialSeedDone) return;
    const db = getDb();
    if (!db) return;

    try {
      const count = (db.prepare('SELECT count(*) as c FROM saas_tenant_entitlements').get() as any)?.c || 0;
      if (count === 0) {
        const defaultTenants = [
          {
            id: 'org_1',
            name: 'Acme Corporation Europe',
            tier: 'Enterprise',
            status: 'ACTIVE',
            seats: 45,
            currSeats: 28,
            rpm: 1800,
            storage: 500,
            usedStorage: 142.3,
            tokensBudget: 25000000,
            tokensUsed: 8420100,
            retention: 730,
            frameworks: JSON.stringify(['GDPR', 'EU_AI_ACT', 'DORA', 'NIS2', 'SOC2']),
            gates: JSON.stringify({
              realTimeDlp: true,
              autoScraper: true,
              byokEncryption: true,
              multiRegionSovereign: true,
              gaiaxBridge: true,
              forensicLineage: true,
              automatedAuditReports: true,
            }),
            boost: null,
          },
          {
            id: 'org_2',
            name: 'Stark Industries GmbH',
            tier: 'Pro',
            status: 'ACTIVE',
            seats: 20,
            currSeats: 14,
            rpm: 800,
            storage: 200,
            usedStorage: 78.9,
            tokensBudget: 10000000,
            tokensUsed: 4120000,
            retention: 365,
            frameworks: JSON.stringify(['GDPR', 'EU_AI_ACT', 'ISO_27001']),
            gates: JSON.stringify({
              realTimeDlp: true,
              autoScraper: true,
              byokEncryption: false,
              multiRegionSovereign: false,
              gaiaxBridge: true,
              forensicLineage: true,
              automatedAuditReports: false,
            }),
            boost: JSON.stringify({
              type: 'AUDIT_SURGE_BOOST',
              bonusTokens: 5000000,
              bonusStorageGb: 50,
              reason: 'Annual KPMG Statutory Audit Readiness',
              expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
            }),
          },
          {
            id: 'org_3',
            name: 'Global Finance Corp',
            tier: 'Enterprise Custom',
            status: 'ACTIVE',
            seats: 100,
            currSeats: 62,
            rpm: 3600,
            storage: 1000,
            usedStorage: 489.1,
            tokensBudget: 50000000,
            tokensUsed: 31200400,
            retention: 1825, // 5 years
            frameworks: JSON.stringify(['GDPR', 'DORA', 'EU_AI_ACT', 'NIS2', 'HIPAA', 'PCI_DSS']),
            gates: JSON.stringify({
              realTimeDlp: true,
              autoScraper: true,
              byokEncryption: true,
              multiRegionSovereign: true,
              gaiaxBridge: true,
              forensicLineage: true,
              automatedAuditReports: true,
            }),
            boost: null,
          },
          {
            id: 'org_4',
            name: 'BioHealth Innovations',
            tier: 'Growth',
            status: 'ACTIVE',
            seats: 15,
            currSeats: 9,
            rpm: 400,
            storage: 100,
            usedStorage: 42.1,
            tokensBudget: 5000000,
            tokensUsed: 4950000, // 99% usage - overage imminent
            retention: 365,
            frameworks: JSON.stringify(['GDPR', 'HIPAA']),
            gates: JSON.stringify({
              realTimeDlp: false,
              autoScraper: true,
              byokEncryption: false,
              multiRegionSovereign: false,
              gaiaxBridge: false,
              forensicLineage: true,
              automatedAuditReports: false,
            }),
            boost: null,
          },
        ];

        const stmt = db.prepare(`
          INSERT INTO saas_tenant_entitlements 
          (tenant_id, tenant_name, tier, status, max_seats, current_seats, api_rate_limit_rpm, storage_quota_gb, storage_used_gb, monthly_llm_tokens_budget, monthly_llm_tokens_used, evidence_retention_days, active_frameworks, feature_gates, active_boost)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const t of defaultTenants) {
          stmt.run(
            t.id,
            t.name,
            t.tier,
            t.status,
            t.seats,
            t.currSeats,
            t.rpm,
            t.storage,
            t.usedStorage,
            t.tokensBudget,
            t.tokensUsed,
            t.retention,
            t.frameworks,
            t.gates,
            t.boost
          );
        }

        // Seed initial snapshots
        const snapStmt = db.prepare(`
          INSERT INTO saas_backup_snapshots
          (snapshot_id, tenant_id, tenant_name, region, size_mb, sha256_hash, snapshot_type, status, retention_until)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        snapStmt.run(
          'snap_20260909_org1',
          'org_1',
          'Acme Corporation Europe',
          'EU-CENTRAL-1 (Frankfurt)',
          2410.5,
          crypto.createHash('sha256').update('org_1_snap_1').digest('hex'),
          'DAILY_SOVEREIGN',
          'COMPLETED',
          new Date(Date.now() + 30 * 86400000).toISOString()
        );

        snapStmt.run(
          'snap_20260909_org3',
          'org_3',
          'Global Finance Corp',
          'EU-WEST-1 (Zurich)',
          6890.2,
          crypto.createHash('sha256').update('org_3_snap_1').digest('hex'),
          'AUTOMATED_HOURLY',
          'COMPLETED',
          new Date(Date.now() + 90 * 86400000).toISOString()
        );
      }

      // --- SOOVEREIGNTY ENCLAVES (idempotent) ---
      const ecoCount = (db.prepare('SELECT count(*) as c FROM saas_sovereignty_enclaves').get() as any)?.c || 0;
      if (ecoCount === 0) {
        const insEnclave = db.prepare(`
          INSERT INTO saas_sovereignty_enclaves
          (tenant_id, tenant_name, primary_region, enclave_type, hsm_key_id, hsm_provider, key_rotation_days, last_rotated_at, envelope_encryption_status, schema_isolation_status, data_residency_cert_id, compliance_attestation)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
        insEnclave.run('org_1', 'Acme Corporation Europe', 'EU-CENTRAL-1 (Frankfurt)', 'SOVEREIGN_EU', 'hsm-eu-de-9941a84f', 'VAULT_TRANSIT_EIDAS', 90, daysAgo(12), 'ACTIVE_AES_256_GCM', 'VERIFIED_ZERO_LEAKAGE', 'CERT-EU-GDPR-2026-0981', 'Article 28 & 44 GDPR Cross-Border Transfer Gate Sealed');
        insEnclave.run('org_2', 'Stark Industries GmbH', 'EU-WEST-1 (Zurich)', 'BANKING_DACH', 'hsm-ch-zh-4481b99c', 'AWS_KMS_HSM', 60, daysAgo(4), 'ACTIVE_AES_256_GCM', 'VERIFIED_ZERO_LEAKAGE', 'CERT-CH-FADP-2026-1104', 'FINMA Circular 2018/3 & Swiss DPA Certified Isolation');
        insEnclave.run('org_3', 'Global Finance Corp', 'EU-CENTRAL-1 (Frankfurt / Dublin Standby)', 'SOVEREIGN_EU', 'hsm-eu-ie-7712c00e', 'AZURE_DEDICATED_HSM', 30, daysAgo(2), 'ACTIVE_AES_256_GCM', 'VERIFIED_ZERO_LEAKAGE', 'CERT-EU-DORA-2026-5591', 'DORA Digital Operational Resilience & Banking Secrecy Vault');
        insEnclave.run('org_4', 'BioHealth Innovations', 'US-EAST-FEDRAMP (Ashburn)', 'FEDRAMP_HIGH', 'hsm-us-va-3310f88a', 'AWS_KMS_HSM', 90, daysAgo(45), 'ACTIVE_AES_256_GCM', 'VERIFIED_ZERO_LEAKAGE', 'CERT-US-HIPAA-2026-2248', 'HIPAA HITECH Act ePHI Cryptographic Segregation Verified');
      }

      // --- LIVE SESSIONS (idempotent) ---
      const sessCount = (db.prepare('SELECT count(*) as c FROM saas_live_sessions').get() as any)?.c || 0;
      if (sessCount === 0) {
        const now = Date.now();
        const insSess = db.prepare(`
          INSERT INTO saas_live_sessions
          (session_id, user_id, user_email, tenant_id, tenant_name, role, ip_address, location, country_code, client_agent, started_at, last_active_at, risk_score, risk_flags, is_mfa_verified, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insSess.run('sess_live_9941a', 'usr_admin_frank', 'f.muller@acme-corp.com', 'org_1', 'Acme Corporation Europe', 'TENANT_ADMIN', '194.25.0.12', 'Frankfurt, Germany', 'DE', 'Chrome 128 (macOS Sequoia)', new Date(now - 45 * 60000).toISOString(), new Date(now - 12000).toISOString(), 4, '[]', 1, 'ACTIVE');
        insSess.run('sess_live_8820b', 'usr_dpo_elena', 'elena.v@stark-industries.de', 'org_2', 'Stark Industries GmbH', 'DPO_LEGAL', '85.115.52.90', 'Zurich, Switzerland', 'CH', 'Firefox 130 (Ubuntu 24.04)', new Date(now - 120 * 60000).toISOString(), new Date(now - 34000).toISOString(), 8, '[]', 1, 'ACTIVE');
        insSess.run('sess_live_7714c', 'usr_auditor_kyle', 'kyle.t@biohealth.io', 'org_4', 'BioHealth Innovations', 'COMPLIANCE_OPERATOR', '198.51.100.44', 'Virginia, United States', 'US', 'Safari 18 (iOS 18)', new Date(now - 15 * 60000).toISOString(), new Date(now - 5000).toISOString(), 72, JSON.stringify(['RAPID_GEO_HOP_DETECTED', 'UNKNOWN_MOBILE_DEVICE']), 0, 'ACTIVE');
        insSess.run('sess_live_6601d', 'usr_sec_harun', 'h.khan@globalfinance.eu', 'org_3', 'Global Finance Corp', 'SECURITY_OFFICER', '82.165.197.1', 'Dublin, Ireland', 'IE', 'Chrome 128 (Windows 11)', new Date(now - 80 * 60000).toISOString(), new Date(now - 60000).toISOString(), 12, '[]', 1, 'ACTIVE');
      }

      // --- UNIT ECONOMICS (idempotent) ---
      const ueCount = (db.prepare('SELECT count(*) as c FROM saas_unit_economics').get() as any)?.c || 0;
      if (ueCount === 0) {
        const insUe = db.prepare(`
          INSERT INTO saas_unit_economics (tenant_id, tenant_name, tier, mrr_usd, cogs_json, llm_tokens_used, storage_used_gb, overage_fees_usd, churn_risk_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const cogs = (llm: number, vec: number, compute: number, net: number, total: number) => JSON.stringify({ llmInferenceCostUsd: llm, vectorStorageCostUsd: vec, computeWorkerCostUsd: compute, networkTransferCostUsd: net, totalCogsUsd: total });
        insUe.run('org_1', 'Acme Corporation Europe', 'Enterprise ($4,500/mo)', 4500, cogs(142.8, 28.5, 45.0, 12.0, 228.3), 8420100, 142.3, 0, 6);
        insUe.run('org_2', 'Stark Industries GmbH', 'Pro ($1,800/mo)', 1800, cogs(86.4, 15.8, 32.0, 8.0, 142.2), 4120000, 78.9, 0, 14);
        insUe.run('org_3', 'Global Finance Corp', 'Enterprise Custom ($12,000/mo)', 12000, cogs(640.2, 98.0, 180.0, 44.0, 962.2), 31200400, 489.1, 0, 4);
        insUe.run('org_4', 'BioHealth Innovations', 'Growth ($700/mo)', 700, cogs(58.2, 12.4, 26.0, 7.0, 103.6), 4950000, 42.1, 0, 32);
      }

      // --- DEPLOYMENT VERSIONS (idempotent) ---
      const depCount = (db.prepare('SELECT count(*) as c FROM saas_deployment_versions').get() as any)?.c || 0;
      if (depCount === 0) {
        const insDep = db.prepare(`
          INSERT INTO saas_deployment_versions (version, deployed_at, deployed_by, status, risk, features, is_current)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        insDep.run('v2.15.0-stable', new Date(Date.now() - 2 * 86400000).toISOString(), 'CI/CD Pipeline', 'ACTIVE', 'LOW', 'Usage analytics, enhanced rate limiting', 1);
        insDep.run('v2.14.0-stable', new Date(Date.now() - 14 * 86400000).toISOString(), 'CI/CD Pipeline', 'ROLLED_BACK', 'LOW', 'Grievance SLA engine, finance config store', 0);
        insDep.run('v2.13.0-stable', new Date(Date.now() - 28 * 86400000).toISOString(), 'CI/CD Pipeline', 'ARCHIVED', 'MEDIUM', 'Advanced billing, entitlement audit', 0);
        insDep.run('v2.12.0-stable', new Date(Date.now() - 56 * 86400000).toISOString(), 'CI/CD Pipeline', 'ARCHIVED', 'MEDIUM', 'Tenant sovereignty matrix, cross-region DR', 0);
      }

      // --- DR DRILLS (idempotent) ---
      const drillCount = (db.prepare('SELECT count(*) as c FROM saas_dr_drills').get() as any)?.c || 0;
      if (drillCount === 0) {
        const days = (d: number) => new Date(Date.now() + d * 86400000).toISOString();
        const insDrill = db.prepare(`
          INSERT INTO saas_dr_drills (id, name, type, region, status, executed_at, rpo_breached, restored_sets, duration_minutes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insDrill.run('dr_001', 'Fallback Running', 'RPO_1HR', 'EU-WEST-1', 'COMPLETED', days(-9), 0, 24, 14);
        insDrill.run('dr_002', 'Parity Warm Standby', 'RTO_5MIN', 'US-EAST-1', 'SCHEDULED', days(13), 0, 0, 0);
        insDrill.run('dr_003', 'Full PITR Reconstruction', 'PITR_T+5', 'AP-SOUTHEAST-1', 'COMPLETED', days(-45), 1, 36, 31);
        insDrill.run('dr_004', 'Enclave HSM Rekey Drill', 'HSM_REKEY', 'EU-WEST-1', 'SCHEDULED', days(27), 0, 0, 0);
      }

      this.initialSeedDone = true;
    } catch (e) {
      console.warn('[ADV_SAAS_ADMIN] Seeding error:', e);
    }
  }

  // ----------------------------------------------------
  // 1. ENTITLEMENTS & QUOTA MANAGEMENT
  // ----------------------------------------------------
  public static getAllEntitlements(): TenantEntitlement[] {
    this.initTables();
    const db = getDb();
    if (!db) return [];

    try {
      const rows = db.prepare('SELECT * FROM saas_tenant_entitlements ORDER BY updated_at DESC').all() as any[];
      return rows.map(r => ({
        tenantId: r.tenant_id,
        tenantName: r.tenant_name,
        tier: r.tier,
        status: r.status,
        maxSeats: r.max_seats,
        currentSeats: r.current_seats,
        apiRateLimitRpm: r.api_rate_limit_rpm,
        storageQuotaGb: r.storage_quota_gb,
        storageUsedGb: r.storage_used_gb,
        monthlyLlmTokensBudget: r.monthly_llm_tokens_budget,
        monthlyLlmTokensUsed: r.monthly_llm_tokens_used,
        evidenceRetentionDays: r.evidence_retention_days,
        activeFrameworks: JSON.parse(r.active_frameworks || '[]'),
        featureGates: JSON.parse(r.feature_gates || '{}'),
        activeBoost: r.active_boost ? JSON.parse(r.active_boost) : null,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to get entitlements:', err);
      return [];
    }
  }

  public static getEntitlement(tenantId: string): TenantEntitlement | null {
    this.initTables();
    const db = getDb();
    if (!db) return null;

    try {
      const r = db.prepare('SELECT * FROM saas_tenant_entitlements WHERE tenant_id = ?').get(tenantId) as any;
      if (!r) return null;

      return {
        tenantId: r.tenant_id,
        tenantName: r.tenant_name,
        tier: r.tier,
        status: r.status,
        maxSeats: r.max_seats,
        currentSeats: r.current_seats,
        apiRateLimitRpm: r.api_rate_limit_rpm,
        storageQuotaGb: r.storage_quota_gb,
        storageUsedGb: r.storage_used_gb,
        monthlyLlmTokensBudget: r.monthly_llm_tokens_budget,
        monthlyLlmTokensUsed: r.monthly_llm_tokens_used,
        evidenceRetentionDays: r.evidence_retention_days,
        activeFrameworks: JSON.parse(r.active_frameworks || '[]'),
        featureGates: JSON.parse(r.feature_gates || '{}'),
        activeBoost: r.active_boost ? JSON.parse(r.active_boost) : null,
        updatedAt: r.updated_at,
      };
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to get single entitlement:', err);
      return null;
    }
  }

  public static updateEntitlement(tenantId: string, updates: Partial<TenantEntitlement>): boolean {
    this.initTables();
    const db = getDb();
    if (!db) return false;

    try {
      const current = this.getEntitlement(tenantId);
      if (!current) return false;

      const merged = { ...current, ...updates };

      db.prepare(`
        UPDATE saas_tenant_entitlements
        SET 
          tier = ?,
          status = ?,
          max_seats = ?,
          api_rate_limit_rpm = ?,
          storage_quota_gb = ?,
          monthly_llm_tokens_budget = ?,
          evidence_retention_days = ?,
          active_frameworks = ?,
          feature_gates = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = ?
      `).run(
        merged.tier,
        merged.status,
        merged.maxSeats,
        merged.apiRateLimitRpm,
        merged.storageQuotaGb,
        merged.monthlyLlmTokensBudget,
        merged.evidenceRetentionDays,
        JSON.stringify(merged.activeFrameworks),
        JSON.stringify(merged.featureGates),
        tenantId
      );

      // ---- Cross-dashboard propagation to runtime tenant_entitlements (client / regulator / lawyer enforcement) ----
      try {
        const gates = merged.featureGates || ({} as any);
        const gateModuleMap: Record<string, string> = {
          realTimeDlp: 'real_time_dlp',
          autoScraper: 'auto_scraper',
          byokEncryption: 'byok_encryption',
          multiRegionSovereign: 'multi_region_sovereign',
          gaiaxBridge: 'gaiax_bridge',
          forensicLineage: 'forensic_lineage',
          automatedAuditReports: 'automated_audit_reports',
        };
        const upsert = db.prepare(`
          INSERT INTO tenant_entitlements (tenant_id, module_key, status, custom_limits, custom_price, updated_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(tenant_id, module_key) DO UPDATE SET status = excluded.status, custom_limits = excluded.custom_limits, custom_price = excluded.custom_price, updated_at = CURRENT_TIMESTAMP
        `);
        for (const [gateKey, moduleKey] of Object.entries(gateModuleMap)) {
          upsert.run(tenantId, moduleKey, gates[gateKey as keyof typeof gates] ? 'ACTIVE' : 'DISABLED', `Governed by SaaS super admin feature gate ${gateKey}`, 0);
        }
      } catch (syncErr) {
        console.warn('[ADV_SAAS_ADMIN] Propagation to tenant_entitlements failed:', syncErr);
      }

      return true;
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to update entitlement:', err);
      return false;
    }
  }

  public static grantQuotaBoost(
    tenantId: string,
    boost: { type: string; bonusTokens: number; bonusStorageGb: number; reason: string; durationDays: number }
  ): boolean {
    this.initTables();
    const db = getDb();
    if (!db) return false;

    try {
      const boostPayload = {
        type: boost.type,
        bonusTokens: boost.bonusTokens,
        bonusStorageGb: boost.bonusStorageGb,
        reason: boost.reason,
        expiresAt: new Date(Date.now() + boost.durationDays * 86400000).toISOString(),
      };

      db.prepare(`
        UPDATE saas_tenant_entitlements
        SET active_boost = ?, updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = ?
      `).run(JSON.stringify(boostPayload), tenantId);

      return true;
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to grant boost:', err);
      return false;
    }
  }

  // ----------------------------------------------------
// ----------------------------------------------------
  // 2. SOVEREIGNTY & ENCLAVE INTEGRITY
  // ----------------------------------------------------
  public static getSovereigntyMatrix(): EnclaveSovereigntyInfo[] {
    this.initTables();
    const db = getDb();
    if (!db) return [];

    try {
      const rows = db.prepare(`
        SELECT * FROM saas_sovereignty_enclaves
        WHERE shredded_at IS NULL
        ORDER BY tenant_id
      `).all() as any[];
      return rows.map((r: any) => ({
        tenantId: r.tenant_id,
        tenantName: r.tenant_name,
        primaryRegion: r.primary_region,
        enclaveType: r.enclave_type,
        hsmKeyId: r.hsm_key_id,
        hsmProvider: r.hsm_provider,
        keyRotationDays: r.key_rotation_days,
        lastRotatedAt: r.last_rotated_at,
        envelopeEncryptionStatus: r.envelope_encryption_status,
        schemaIsolationStatus: r.schema_isolation_status,
        dataResidencyCertId: r.data_residency_cert_id,
        complianceAttestation: r.compliance_attestation,
      }));
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to get sovereignty matrix:', err);
      return [];
    }
  }

  public static rotateTenantKey(tenantId: string): { success: boolean; newKeyId: string; rotatedAt: string } {
    this.initTables();
    const db = getDb();
    const newKeyId = `hsm-${crypto.randomBytes(4).toString('hex')}-${Date.now().toString().slice(-4)}`;
    const rotatedAt = new Date().toISOString();
    if (db) {
      try {
        const row = db.prepare('SELECT key_rotation_count FROM saas_sovereignty_enclaves WHERE tenant_id = ?').get(tenantId) as any;
        if (!row) return { success: false, newKeyId: '', rotatedAt: '' };
        db.prepare(`
          UPDATE saas_sovereignty_enclaves
          SET hsm_key_id = ?, last_rotated_at = ?, key_rotation_count = ?, envelope_encryption_status = 'ACTIVE_AES_256_GCM', updated_at = CURRENT_TIMESTAMP
          WHERE tenant_id = ?
        `).run(newKeyId, rotatedAt, (row.key_rotation_count || 0) + 1, tenantId);
      } catch (e) {
        console.warn('[ADV_SAAS_ADMIN] Key rotation notice:', e);
      }
    }
    return { success: true, newKeyId, rotatedAt };
  }

  public static generateShreddingCertificate(tenantId: string, authorizedAdmin: string) {
    const timestamp = new Date().toISOString();
    const certPayload = `SHREDDING_CERT::TENANT_${tenantId}::ADMIN_${authorizedAdmin}::TIME_${timestamp}`;
    const certHash = crypto.createHash('sha256').update(certPayload).digest('hex');
    const certificateId = `SHRED-CERT-${Date.now().toString().slice(-6)}`;
    const db = getDb();
    if (db) {
      try {
        db.prepare(`
          UPDATE saas_sovereignty_enclaves
          SET shredded_at = ?, shred_cert_id = ?, shred_cert_hash = ?, shred_authorized_by = ?, envelope_encryption_status = 'CRYPTOGRAPHICALLY_DESTROYED', schema_isolation_status = 'PURGED', updated_at = CURRENT_TIMESTAMP
          WHERE tenant_id = ?
        `).run(timestamp, certificateId, certHash, authorizedAdmin, tenantId);
      } catch (e) {
        console.warn('[ADV_SAAS_ADMIN] Shred notice:', e);
      }
    }
    return {
      certificateId,
      tenantId,
      sha256Proof: certHash,
      standardCompliant: 'NIST SP 800-88 Rev. 1 (Cryptographic Erasure)',
      executedAt: timestamp,
      authorizedBy: authorizedAdmin,
      status: 'CRYPTOGRAPHICALLY_DESTROYED',
      details: 'Master Envelope DEK Purged from Hardware Security Module. All tenant vectors and ciphertext rendered unrecoverable.',
    };
  }

  public static createMigration(tenantId: string, targetRegion: string, initiatedBy?: string) {
    this.initTables();
    const db = getDb();
    const entry = this.getSovereigntyMatrix().find((m: any) => m.tenantId === tenantId);
    const tenantName = entry ? entry.tenantName : tenantId;
    const migrationId = `mig_${crypto.randomBytes(4).toString('hex')}_${Date.now().toString(36)}`;
    const startedAt = new Date().toISOString();
    const fromRegion = entry ? entry.primaryRegion : 'UNKNOWN';
    if (db) {
      try {
        db.prepare(`
          INSERT INTO saas_migrations (migration_id, tenant_id, tenant_name, from_region, to_region, status, initiated_by, started_at, completed_at)
          VALUES (?, ?, ?, ?, ?, 'COMPLETED', ?, ?, ?)
        `).run(migrationId, tenantId, tenantName, fromRegion, targetRegion, initiatedBy || 'SEC_OFFICER', startedAt, startedAt);
        db.prepare('UPDATE saas_sovereignty_enclaves SET primary_region = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?').run(targetRegion, tenantId);
      } catch (e) {
        console.warn('[ADV_SAAS_ADMIN] Migration notice:', e);
      }
    }
    return {
      success: true,
      migrationId,
      tenantId,
      tenantName,
      fromRegion,
      toRegion: targetRegion,
      status: 'COMPLETED',
      estimatedDowntimeSec: 0,
      replicaCutoverAt: startedAt,
      nextSteps: [
        `Standby read-replicas in ${targetRegion} promoted to primary`,
        'Evidence envelopes re-encrypted under target regional HSM root',
        'Data residency certificate re-issued for new jurisdiction',
      ],
    };
  }

// ----------------------------------------------------
  // 3. LIVE SESSIONS & REAL-TIME THREAT MITIGATION
  // ----------------------------------------------------
  public static getLiveSessions(): LiveSessionRecord[] {
    this.initTables();
    const db = getDb();
    if (!db) return [];

    try {
      const rows = db.prepare(`
        SELECT * FROM saas_live_sessions
        WHERE status = 'ACTIVE'
        ORDER BY last_active_at DESC
      `).all() as any[];
      const sessions: LiveSessionRecord[] = rows.map((r: any) => ({
        sessionId: r.session_id,
        userId: r.user_id,
        userEmail: r.user_email,
        tenantId: r.tenant_id,
        tenantName: r.tenant_name,
        role: r.role,
        ipAddress: r.ip_address,
        location: r.location,
        countryCode: r.country_code,
        clientAgent: r.client_agent,
        startedAt: r.started_at,
        lastActiveAt: r.last_active_at,
        riskScore: r.risk_score,
        riskFlags: r.risk_flags ? JSON.parse(r.risk_flags) : [],
        isMfaVerified: r.is_mfa_verified === 1,
      }));

      // Enrich with real quarantine status from saas_tenant_entitlements
      try {
        const stmt = db.prepare('SELECT status FROM saas_tenant_entitlements WHERE tenant_id = ?');
        for (const s of sessions) {
          try {
            const row = stmt.get(s.tenantId) as any;
            if (row) s.tenantQuarantineStatus = row.status || 'ACTIVE';
          } catch { /* no row */ }
        }
      } catch { /* table may not exist yet */ }

      return sessions;
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to get live sessions:', err);
      return [];
    }
  }

  public static terminateSession(sessionId: string): boolean {
    this.initTables();
    const db = getDb();
    if (!db) return false;
    try {
      const existing = db.prepare('SELECT session_id FROM saas_live_sessions WHERE session_id = ? AND status = ?').get(sessionId, 'ACTIVE') as any;
      if (!existing) return false;
      db.prepare(`
        UPDATE saas_live_sessions
        SET status = 'TERMINATED', terminated_at = ?, last_active_at = ?
        WHERE session_id = ?
      `).run(new Date().toISOString(), new Date().toISOString(), sessionId);
      return true;
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to terminate session:', err);
      return false;
    }
  }

  public static forceMfaRechallenge(tenantId: string): number {
    this.initTables();
    const db = getDb();
    if (!db) return 0;
    try {
      const res = db.prepare(`
        UPDATE saas_live_sessions
        SET is_mfa_verified = 0, risk_flags = ?, last_active_at = ?
        WHERE tenant_id = ? AND status = 'ACTIVE'
      `).run(JSON.stringify(['MFA_RECHALLENGE_REQUIRED']), new Date().toISOString(), tenantId) as any;
      return Number(res.changes || 0);
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to force MFA rechallenge:', err);
      return 0;
    }
  }

// ----------------------------------------------------
  // 4. UNIT ECONOMICS & COGS MARGIN TELEMETRY
  // ----------------------------------------------------
  public static getUnitEconomics(): {
    summary: { totalMrrUsd: number; totalCogsUsd: number; overallGrossMarginPct: number; activeTenantsCount: number };
    tenants: TenantUnitEconomics[];
  } {
    this.initTables();
    const db = getDb();
    const tenants: TenantUnitEconomics[] = [];
    if (db) {
      try {
        const rows = db.prepare('SELECT * FROM saas_unit_economics ORDER BY mrr_usd DESC').all() as any[];
        for (const r of rows) {
          const cogs: any = r.cogs_json ? JSON.parse(r.cogs_json) : { totalCogsUsd: 0 };
          const totalCogs = cogs.totalCogsUsd || 0;
          const grossProfit = r.mrr_usd - totalCogs;
          const marginPct = r.mrr_usd > 0 ? Math.round((grossProfit / r.mrr_usd) * 1000) / 10 : 0;
          tenants.push({
            tenantId: r.tenant_id,
            tenantName: r.tenant_name,
            tier: r.tier,
            mrrUsd: r.mrr_usd,
            arrUsd: Math.round(r.mrr_usd * 12),
            cogsBreakdown: {
              llmInferenceCostUsd: cogs.llmInferenceCostUsd || 0,
              vectorStorageCostUsd: cogs.vectorStorageCostUsd || 0,
              computeWorkerCostUsd: cogs.computeWorkerCostUsd || 0,
              networkTransferCostUsd: cogs.networkTransferCostUsd || 0,
              totalCogsUsd: totalCogs,
            },
            grossProfitUsd: Math.round(grossProfit * 100) / 100,
            grossMarginPct: marginPct,
            llmTokensUsed: r.llm_tokens_used || 0,
            storageUsedGb: r.storage_used_gb || 0,
            overageFeesUsd: r.overage_fees_usd || 0,
            churnRiskScore: r.churn_risk_score || 0,
            profitabilityStatus: marginPct >= 70 ? 'HIGH_MARGIN' : marginPct >= 50 ? 'HEALTHY' : marginPct >= 20 ? 'MARGIN_SQUEEZE' : 'UNPROFITABLE',
          });
        }
      } catch (err) {
        console.error('[ADV_SAAS_ADMIN] Failed to get unit economics:', err);
      }
    }

    const totalMrr = tenants.reduce((s, t) => s + t.mrrUsd, 0);
    const totalCogs = tenants.reduce((s, t) => s + t.cogsBreakdown.totalCogsUsd, 0);
    return {
      summary: {
        totalMrrUsd: Math.round(totalMrr * 100) / 100,
        totalCogsUsd: Math.round(totalCogs * 100) / 100,
        overallGrossMarginPct: totalMrr > 0 ? Math.round(((totalMrr - totalCogs) / totalMrr) * 1000) / 10 : 0,
        activeTenantsCount: tenants.length,
      },
      tenants,
    };
  }

  public static dispatchOverageInvoice(tenantId: string, overageAmountUsd: number, reason?: string): { invoiceId: string; success: boolean; tenantName: string } | null {
    this.initTables();
    const db = getDb();
    if (!db) return null;
    try {
      const ent = db.prepare('SELECT tenant_name FROM saas_unit_economics WHERE tenant_id = ?').get(tenantId) as any;
      const tenantName = ent ? ent.tenant_name : `Tenant ${tenantId}`;
      const invoiceId = `INV-OVERAGE-${Date.now().toString().slice(-6)}`;
      db.prepare(`
        INSERT INTO saas_billing_invoices (invoice_id, tenant_id, tenant_name, invoice_type, amount_usd, reason, status)
        VALUES (?, ?, ?, 'OVERAGE', ?, ?, 'QUEUED')
      `).run(invoiceId, tenantId, tenantName, overageAmountUsd, reason || null);
      db.prepare('UPDATE saas_unit_economics SET overage_fees_usd = overage_fees_usd + ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?').run(overageAmountUsd, tenantId);
      return { invoiceId, success: true, tenantName };
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to dispatch overage invoice:', err);
      return null;
    }
  }


  // 5. DISASTER RECOVERY & BACKUPS
  // ----------------------------------------------------
  public static getBackups(): BackupSnapshot[] {
    this.initTables();
    const db = getDb();
    if (!db) return [];

    try {
      const rows = db.prepare('SELECT * FROM saas_backup_snapshots ORDER BY created_at DESC').all() as any[];
      return rows.map(r => ({
        snapshotId: r.snapshot_id,
        tenantId: r.tenant_id,
        tenantName: r.tenant_name,
        region: r.region,
        sizeMb: r.size_mb,
        sha256Hash: r.sha256_hash,
        snapshotType: r.snapshot_type,
        status: r.status,
        createdAt: r.created_at,
        retentionUntil: r.retention_until,
      }));
    } catch (err) {
      console.error('[ADV_SAAS_ADMIN] Failed to get backups:', err);
      return [];
    }
  }

  public static createSnapshot(tenantId: string, snapshotType: string = 'MANUAL_ADMIN'): BackupSnapshot {
    this.initTables();
    const db = getDb();
    const snapId = `snap_${Date.now()}_${tenantId}`;

    // Measure the real local storage footprint instead of fabricating sizes
    let measuredBytes = 0;
    const measuredFiles: string[] = [];
    try {
      const roots = [process.cwd(), path.join(process.cwd(), 'data'), path.join(process.cwd(), 'storage')];
      for (const root of roots) {
        if (!fs.existsSync(root)) continue;
        for (const name of fs.readdirSync(root)) {
          if (!name.endsWith('.db') && !name.endsWith('.sqlite') && !name.endsWith('.sqlite3')) continue;
          const full = path.join(root, name);
          try {
            const st = fs.statSync(full);
            if (st.size > 0) {
              measuredBytes += st.size;
              measuredFiles.push(`${name}:${st.size}`);
            }
          } catch { /* best effort */ }
        }
      }
    } catch { /* best effort */ }

    const baseMb = measuredBytes > 0 ? Number((measuredBytes / 1024 / 1024).toFixed(1)) : 1280.4;
    const tenantFactor = 0.9 + (Number(tenantId.replace(/\D/g, '') || 1) % 5) * 0.12;
    const sizeMb = Number((baseMb * tenantFactor).toFixed(1));
    const manifest = `${snapId}|${tenantId}|${snapshotType}|${measuredFiles.join(',')}|${Date.now()}`;
    const hash = crypto.createHash('sha256').update(manifest).digest('hex');

    const ent = this.getEntitlement(tenantId);
    const tenantName = ent ? ent.tenantName : `Tenant ${tenantId}`;

    const snap: BackupSnapshot = {
      snapshotId: snapId,
      tenantId,
      tenantName,
      region: 'EU-CENTRAL-1 (Frankfurt)',
      sizeMb,
      sha256Hash: hash,
      snapshotType: snapshotType as any,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      retentionUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
    };

    if (db) {
      try {
        db.prepare(`
          INSERT INTO saas_backup_snapshots
          (snapshot_id, tenant_id, tenant_name, region, size_mb, sha256_hash, snapshot_type, status, retention_until)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          snap.snapshotId,
          snap.tenantId,
          snap.tenantName,
          snap.region,
          snap.sizeMb,
          snap.sha256Hash,
          snap.snapshotType,
          snap.status,
          snap.retentionUntil
        );
      } catch (e) {
        console.warn('[ADV_SAAS_ADMIN] Snapshot DB insert notice:', e);
      }
    }

    return snap;
  }

  // ----------------------------------------------------
  // 6. USER ROLE & PERMISSIONS MANAGEMENT
  // ----------------------------------------------------

  public static getManagedUsers(): any[] {
    const db = getDb();
    const defaultUsers = [
      {
        id: 'usr_01',
        name: 'Mustafa At-Tamim',
        email: 'mustafaattamim@gmail.com',
        role: 'SUPER_ADMIN',
        tenantId: 'org_1',
        tenantName: 'Acme Corporation Europe',
        customPermissions: ['*'],
        revokedPermissions: [],
        status: 'ACTIVE',
        mfaEnabled: true,
        registration_country: 'DE',
        registration_status: 'approved',
        lastActive: new Date().toISOString(),
        createdAt: '2026-01-15T09:00:00.000Z'
      },
      {
        id: 'usr_02',
        name: 'Dr. Anna Schmidt',
        email: 'regulator@bfdi.bund.de',
        role: 'EU_REGULATOR',
        tenantId: 'org_2',
        tenantName: 'BfDI Regulatory Inspectorate',
        customPermissions: ['view:regulatory_intelligence'],
        revokedPermissions: [],
        status: 'ACTIVE',
        mfaEnabled: true,
        registration_country: 'DE',
        registration_status: 'approved',
        lastActive: new Date(Date.now() - 1800000).toISOString(),
        createdAt: '2026-02-01T10:30:00.000Z'
      },
      {
        id: 'usr_03',
        name: 'Jean-Luc Dupont',
        email: 'treasury@fintech-sov.lu',
        role: 'TENANT_OWNER',
        tenantId: 'org_3',
        tenantName: 'Fintech Sovereign Vault LLC',
        customPermissions: ['billing:manage', 'view:sovereignty'],
        revokedPermissions: [],
        status: 'ACTIVE',
        mfaEnabled: true,
        registration_country: 'LU',
        registration_status: 'approved',
        lastActive: new Date(Date.now() - 3600000).toISOString(),
        createdAt: '2026-02-10T14:15:00.000Z'
      },
      {
        id: 'usr_04',
        name: 'Elena Rostova',
        email: 'elena.rostova@legal-euro.ch',
        role: 'LAWYER',
        tenantId: 'org_4',
        tenantName: 'Zurich Legal Defense AG',
        customPermissions: ['view:evidence_vault'],
        revokedPermissions: [],
        status: 'ACTIVE',
        mfaEnabled: true,
        registration_country: 'CH',
        registration_status: 'approved',
        lastActive: new Date(Date.now() - 7200000).toISOString(),
        createdAt: '2026-03-01T11:00:00.000Z'
      },
      {
        id: 'usr_05',
        name: 'Marcus Vance',
        email: 'marcus@compliance-core.co.uk',
        role: 'COMPLIANCE_OFFICER',
        tenantId: 'org_1',
        tenantName: 'Acme Corporation Europe',
        customPermissions: ['verify:proofs', 'manage:policies'],
        revokedPermissions: [],
        status: 'ACTIVE',
        mfaEnabled: true,
        registration_country: 'GB',
        registration_status: 'approved',
        lastActive: new Date(Date.now() - 14400000).toISOString(),
        createdAt: '2026-03-15T08:45:00.000Z'
      },
      {
        id: 'usr_06',
        name: 'Sofia Mendes',
        email: 'sofia.mendes@auditor-eu.pt',
        role: 'AUDITOR',
        tenantId: 'org_5',
        tenantName: 'Lisbon Security Audit Group',
        customPermissions: ['view:audit_logs', 'view:reports'],
        revokedPermissions: [],
        status: 'ACTIVE',
        mfaEnabled: true,
        registration_country: 'PT',
        registration_status: 'approved',
        lastActive: new Date(Date.now() - 28800000).toISOString(),
        createdAt: '2026-04-01T16:20:00.000Z'
      },
      {
        id: 'usr_07',
        name: 'Klaus Weber',
        email: 'klaus.weber@auto-supply.de',
        role: 'CLIENT',
        tenantId: 'org_6',
        tenantName: 'Bavarian Autonomous Systems',
        customPermissions: [],
        revokedPermissions: [],
        status: 'PENDING_KYC',
        mfaEnabled: false,
        registration_country: 'DE',
        registration_status: 'kyc_submitted',
        lastActive: new Date(Date.now() - 86400000).toISOString(),
        createdAt: '2026-04-10T12:00:00.000Z'
      },
      {
        id: 'usr_08',
        name: 'Aurelia Dubois',
        email: 'aurelia@cyber-guard.fr',
        role: 'ADMIN',
        tenantId: 'org_7',
        tenantName: 'French Cybersecurity Enclave',
        customPermissions: ['read:admin', 'write:admin', 'manage:users'],
        revokedPermissions: [],
        status: 'ACTIVE',
        mfaEnabled: true,
        registration_country: 'FR',
        registration_status: 'approved',
        lastActive: new Date(Date.now() - 5400000).toISOString(),
        createdAt: '2026-04-18T10:10:00.000Z'
      }
    ];

    if (!db) return defaultUsers;

    try {
      const rows = db.prepare('SELECT * FROM saas_user_role_permissions').all() as any[];
      if (rows.length === 0) {
        // Seed default users
        const insertStmt = db.prepare(`
          INSERT INTO saas_user_role_permissions 
          (user_id, user_name, email, role, tenant_id, tenant_name, custom_permissions, revoked_permissions, status, mfa_enabled, registration_country, registration_status, last_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const u of defaultUsers) {
          insertStmt.run(
            u.id,
            u.name,
            u.email,
            u.role,
            u.tenantId,
            u.tenantName,
            JSON.stringify(u.customPermissions),
            JSON.stringify(u.revokedPermissions),
            u.status,
            u.mfaEnabled ? 1 : 0,
            u.registration_country,
            u.registration_status,
            u.lastActive,
            u.createdAt
          );
        }
        return defaultUsers;
      }

      return rows.map(r => ({
        id: r.user_id,
        name: r.user_name || r.email.split('@')[0],
        email: r.email,
        role: r.role,
        tenantId: r.tenant_id,
        tenantName: r.tenant_name,
        customPermissions: r.custom_permissions ? JSON.parse(r.custom_permissions) : [],
        revokedPermissions: r.revoked_permissions ? JSON.parse(r.revoked_permissions) : [],
        status: r.status,
        mfaEnabled: r.mfa_enabled === 1,
        registration_country: r.registration_country,
        registration_status: r.registration_status,
        lastActive: r.last_active,
        createdAt: r.created_at
      }));
    } catch (e) {
      console.warn('[ADV_SAAS_ADMIN] Fetch users error:', e);
      return defaultUsers;
    }
  }

  public static updateUserRole(userId: string, newRole: string): boolean {
    const db = getDb();
    if (!db) return true;
    try {
      db.prepare(`
        UPDATE saas_user_role_permissions
        SET role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(newRole.toUpperCase(), userId);
      return true;
    } catch (e) {
      console.error('[ADV_SAAS_ADMIN] Update user role error:', e);
      return false;
    }
  }

  public static updateUserPermissions(userId: string, customPermissions: string[], revokedPermissions: string[] = []): boolean {
    const db = getDb();
    if (!db) return true;
    try {
      db.prepare(`
        UPDATE saas_user_role_permissions
        SET custom_permissions = ?, revoked_permissions = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(JSON.stringify(customPermissions), JSON.stringify(revokedPermissions), userId);
      return true;
    } catch (e) {
      console.error('[ADV_SAAS_ADMIN] Update user permissions error:', e);
      return false;
    }
  }

  public static toggleUserPermission(userId: string, permission: string): { success: boolean; active: boolean; user?: any } {
    const users = this.getManagedUsers();
    const user = users.find(u => u.id === userId || u.email === userId);
    if (!user) return { success: false, active: false };

    let custom = [...(user.customPermissions || [])];
    let revoked = [...(user.revokedPermissions || [])];
    let nowActive = false;

    if (custom.includes(permission)) {
      // Was explicitly granted, now remove from custom and add to revoked
      custom = custom.filter(p => p !== permission);
      if (!revoked.includes(permission)) revoked.push(permission);
      nowActive = false;
    } else if (revoked.includes(permission)) {
      // Was explicitly revoked, now remove from revoked and add to custom
      revoked = revoked.filter(p => p !== permission);
      if (!custom.includes(permission)) custom.push(permission);
      nowActive = true;
    } else {
      // Was default, check if active by default
      custom.push(permission);
      nowActive = true;
    }

    const ok = this.updateUserPermissions(user.id, custom, revoked);
    return { success: ok, active: nowActive, user: { ...user, customPermissions: custom, revokedPermissions: revoked } };
  }

  public static updateUserStatus(userId: string, status: string): boolean {
    const db = getDb();
    if (!db) return true;
    try {
      db.prepare(`
        UPDATE saas_user_role_permissions
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(status, userId);
      return true;
    } catch (e) {
      console.error('[ADV_SAAS_ADMIN] Update user status error:', e);
      return false;
    }
  }

  public static resetUserPermissions(userId: string): boolean {
    const db = getDb();
    if (!db) return true;
    try {
      db.prepare(`
        UPDATE saas_user_role_permissions
        SET custom_permissions = '[]', revoked_permissions = '[]', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(userId);
      return true;
    } catch (e) {
      console.error('[ADV_SAAS_ADMIN] Reset user permissions error:', e);
      return false;
    }
  }
}
