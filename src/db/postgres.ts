let Pool: any = null;

// Load pg lazily. On the server we can lazily require when DATABASE_URL is configured.
function loadPgPoolClass(): any {
  if (Pool) return Pool;
  if (typeof window === 'undefined' && process.env.DATABASE_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pg = require('pg');
      Pool = pg.default?.Pool || pg.Pool;
    } catch (e) {
      console.error('[PostgreSQL]: pg client not installed. Install the "pg" package or unset DATABASE_URL.');
      Pool = null;
    }
  }
  return Pool;
}

let pool: any = null;
let poolInitAttempted = false;

export function getPgPool(): any {
  if (typeof window !== 'undefined') return null;
  if (!pool && !poolInitAttempted && process.env.DATABASE_URL) {
    poolInitAttempted = true;
    const PoolClass = loadPgPoolClass();
    if (PoolClass) {
      try {
        pool = new PoolClass({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
        pool.on('error', (err: any) => {
          console.error('[PostgreSQL Pool Error]:', err);
        });
      } catch (e) {
        console.error('Failed to initialize PostgreSQL pool:', e);
        pool = null;
      }
    }
  }
  return pool;
}

export async function queryPg<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getPgPool();
  if (!p) {
    if (process.env.DATABASE_URL) {
      console.error('[PostgreSQL]: DATABASE_URL is set but no pool could be initialized. Is the "pg" package installed? Returning empty result set.');
    }
    return [];
  }
  try {
    const res = await p.query(sql, params);
    return res.rows as T[];
  } catch (err) {
    console.error('[PostgreSQL Query Error]:', err, 'SQL:', sql);
    throw err;
  }
}

export async function queryPgOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryPg<T>(sql, params);
  return rows[0] || null;
}

export async function initPgDb(): Promise<boolean> {
  const p = getPgPool();
  if (!p) {
    console.log('[PostgreSQL]: DATABASE_URL not configured. Skipping PostgreSQL schema initialization.');
    return false;
  }

  try {
    console.log('[PostgreSQL]: Initializing database schema...');
    
    // 1. Tenants table
    await p.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        organization_metadata JSONB DEFAULT '{}',
        appearance_metadata JSONB DEFAULT '{}',
        compliance_config JSONB DEFAULT '{}',
        status VARCHAR(32) DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. CaaS Addons table
    await p.query(`
      CREATE TABLE IF NOT EXISTS caas_addons (
        id VARCHAR(64) PRIMARY KEY,
        category VARCHAR(128) NOT NULL,
        name VARCHAR(255) NOT NULL,
        act_id VARCHAR(64),
        description TEXT,
        price VARCHAR(64),
        score INTEGER DEFAULT 95,
        color_class VARCHAR(255),
        icon VARCHAR(64),
        is_active_globally BOOLEAN DEFAULT TRUE,
        endpoint_url TEXT,
        api_key TEXT,
        config_schema JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. CaaS Operations table
    await p.query(`
      CREATE TABLE IF NOT EXISTS caas_operations (
        id VARCHAR(64) PRIMARY KEY,
        tenant_id VARCHAR(64) NOT NULL,
        operation_type VARCHAR(128) NOT NULL,
        status VARCHAR(64) NOT NULL,
        result_summary TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // 4. Audit Trail / Events table
    await p.query(`
      CREATE TABLE IF NOT EXISTS audit_trail_events (
        id VARCHAR(64) PRIMARY KEY,
        category VARCHAR(64) NOT NULL,
        severity VARCHAR(32) NOT NULL,
        action VARCHAR(255) NOT NULL,
        actor VARCHAR(128) NOT NULL,
        details JSONB DEFAULT '{}',
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Regions table
    await p.query(`
      CREATE TABLE IF NOT EXISTS regions (
        code VARCHAR(32) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sovereign_node VARCHAR(128),
        compliance_tier VARCHAR(64) DEFAULT 'TIER_1',
        data_residency_rules JSONB DEFAULT '{}'
      );
    `);

    // 6. Compliance Profiles table
    await p.query(`
      CREATE TABLE IF NOT EXISTS compliance_profiles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        risk_level VARCHAR(32) DEFAULT 'HIGH',
        config JSONB DEFAULT '{}'
      );
    `);

    // 7. Industries table
    await p.query(`
      CREATE TABLE IF NOT EXISTS industries (
        code VARCHAR(32) PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);

    // 8. Free & Integration Scans
    await p.query(`
      CREATE TABLE IF NOT EXISTS scan_results (
        scan_id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        region VARCHAR(32),
        industry VARCHAR(32),
        compliance_profile VARCHAR(64),
        risk_score INTEGER,
        decision_status VARCHAR(64),
        reason_codes JSONB,
        flags JSONB,
        required_actions JSONB,
        provider_metadata JSONB,
        audit_id VARCHAR(64),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. DORA ICT Third-Party Vendors Register (DORA Art. 28)
    await p.query(`
      CREATE TABLE IF NOT EXISTS dora_vendor_register (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(128) NOT NULL,
        criticality VARCHAR(64) NOT NULL,
        risk_score INTEGER DEFAULT 0,
        sub_processor_chain JSONB DEFAULT '[]',
        dora_compliant BOOLEAN DEFAULT TRUE,
        contractual_exit_plan VARCHAR(255),
        certifications JSONB DEFAULT '{}',
        extraterritorial_exposure VARCHAR(128),
        hosting_region VARCHAR(128),
        scc_module VARCHAR(64),
        remediation_plan TEXT,
        last_audit_scan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Immutable Merkle Tree Compliance Ledger
    await p.query(`
      CREATE TABLE IF NOT EXISTS merkle_compliance_ledger (
        index_id SERIAL PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        event_hash VARCHAR(128) NOT NULL,
        parent_hash VARCHAR(128),
        block_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        signature_algorithm VARCHAR(64) DEFAULT 'DILITHIUM_5',
        zkp_proof JSONB DEFAULT '{}'
      );
    `);

    // 11. DSAR Zero-Knowledge Verified Requests
    await p.query(`
      CREATE TABLE IF NOT EXISTS dsar_zkp_requests (
        id VARCHAR(64) PRIMARY KEY,
        subject_name VARCHAR(255) NOT NULL,
        subject_email VARCHAR(255) NOT NULL,
        request_type VARCHAR(64) NOT NULL,
        status VARCHAR(64) NOT NULL,
        identity_verified BOOLEAN DEFAULT FALSE,
        zkp_proof_hash VARCHAR(128),
        discovered_databases JSONB DEFAULT '[]',
        sla_deadline TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. EU AI Act Technical Dossiers (Annex IV)
    await p.query(`
      CREATE TABLE IF NOT EXISTS ai_act_annex_iv_dossiers (
        id VARCHAR(64) PRIMARY KEY,
        system_id VARCHAR(64) NOT NULL,
        system_name VARCHAR(255) NOT NULL,
        risk_classification VARCHAR(64) NOT NULL,
        annex_iv_json JSONB NOT NULL,
        ce_marking_certified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Cleanup demo test records if SEED_DEMO_DATA is not true
    if (process.env.SEED_DEMO_DATA !== 'true') {
      try {
        await p.query("DELETE FROM tenants WHERE id IN ('org_1', 'org_2')");
        await p.query("DELETE FROM scan_results WHERE scan_id IN ('scan_1', 'scan_2', 'scan_3', 'scan_4')");
      } catch {}
    }

    // Seed default tenants ONLY if explicitly requested via SEED_DEMO_DATA=true (default: off)
    const tenantCheck = await p.query('SELECT COUNT(*) FROM tenants');
    if (parseInt(tenantCheck.rows[0].count, 10) === 0 && process.env.SEED_DEMO_DATA === 'true') {
      await p.query(`
        INSERT INTO tenants (id, name, status) VALUES
        ('org_1', 'Acme Corporation Europe', 'ACTIVE'),
        ('org_2', 'Fintech Global Payments', 'ACTIVE');
      `);
    }

    // Seed default CaaS Addons if empty
    const addonCheck = await p.query('SELECT COUNT(*) FROM caas_addons');
    if (parseInt(addonCheck.rows[0].count, 10) === 0) {
      await p.query(`
        INSERT INTO caas_addons (id, category, name, act_id, description, price, score, color_class, icon, is_active_globally) VALUES
        ('gdpr-compliance', 'Data Protection & Privacy', 'GDPR Compliance Add-On', 'GDPR', 'Article 30 Record of Processing Activities, Article 32 Security Controls, Automated DSAR Processing', '$799/mo', 96, 'bg-emerald-50/70 border-emerald-200/50 text-emerald-700', 'ShieldCheck', TRUE),
        ('ai-act-auditor', 'Public Sector & Govtech', 'EU AI Act Risk Classification & Audit', 'EU_AI_ACT', 'High-risk system categorization, post-market monitoring enclaves, and transparency logging', '$1,299/mo', 94, 'bg-indigo-50/70 border-indigo-200/50 text-indigo-700', 'Brain', TRUE),
        ('dora-resilience', 'Financial Services', 'DORA Digital Operational Resilience', 'DORA', 'ICT risk management frameworks, third-party provider concentration auditing, and incident reporting', '$999/mo', 98, 'bg-sky-50/70 border-sky-200/50 text-sky-700', 'Server', TRUE);
      `);
    }

    // Seed regions if empty
    const regionCheck = await p.query('SELECT COUNT(*) FROM regions');
    if (parseInt(regionCheck.rows[0].count, 10) === 0) {
      await p.query(`
        INSERT INTO regions (code, name, sovereign_node, compliance_tier) VALUES
        ('EU', 'European Union', 'node-fra-01', 'TIER_1'),
        ('US', 'United States', 'node-iad-01', 'TIER_1'),
        ('SG', 'Singapore / APAC', 'node-sin-01', 'TIER_1');
      `);
    }

    console.log('[PostgreSQL]: Database initialized successfully.');
    return true;
  } catch (err) {
    console.error('[PostgreSQL Initialization Failed]:', err);
    return false;
  }
}
