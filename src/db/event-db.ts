let Database: any;
if (typeof window === 'undefined') {
  try {
    if (typeof require !== 'undefined') {
      Database = require('better-sqlite3');
    }
  } catch {}
  if (!Database) {
    import('better-sqlite3').then(sqlite => {
      Database = sqlite.default || sqlite;
    }).catch(() => {});
  }
}
import path from 'path';
import { ComplianceAnalyticsService } from '../services/compliance-analytics';

/**
 * EU Policy Compliance SaaS
 * Module: Event Store / Audit Ledger DB
 * 
 * Purpose: Dedicated high-throughput storage for system events, audit logs, 
 * and immutable ledger records. Isolated from the main relational DB for performance.
 */

let db: any = null;

function getEventDbInstance() {
  if (typeof window !== 'undefined') {
    return {
      exec: () => {},
      prepare: () => ({
        all: () => [],
        get: () => ({ c: 0 }),
        run: () => ({}),
      }),
    };
  }
  if (!db) {
    if (!Database && typeof require !== 'undefined') {
      try {
        Database = require('better-sqlite3');
      } catch {}
    }
    if (Database) {
      const dbPath = path.join(process.cwd(), 'events.db');
      db = new Database(dbPath, { verbose: console.log });
      db.exec(`
        CREATE TABLE IF NOT EXISTS system_events (
          id TEXT PRIMARY KEY,
          tenant_id TEXT,
          actor_id TEXT,
          impersonator_id TEXT,
          service_module TEXT,
          action_type TEXT,
          status TEXT,
          severity TEXT,
          target_resource TEXT,
          ip_address TEXT,
          user_agent TEXT,
          payload_diff TEXT,
          crypto_hash TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      return {
        exec: () => {},
        prepare: () => ({
          all: () => [],
          get: () => ({ c: 0 }),
          run: () => ({}),
        }),
      };
    }
  }
  return db;
}

const wrappedDb: any = new Proxy({}, {
  get(_target, prop) {
    const inst = getEventDbInstance();
    if (prop === 'prepare') {
      return function(source: string) {
        console.log(`[AUDIT] EventDB: ${source}`);
        if (source.includes('${')) {
          console.error(`[SECURITY_VIOLATION] Potential SQL injection detected in EventDB: ${source}`);
        }
        return inst.prepare ? inst.prepare(source) : { all: () => [], get: () => ({ c: 0 }), run: () => ({}) };
      };
    }
    const val = inst[prop];
    return typeof val === 'function' ? val.bind(inst) : val;
  }
});

// Initialization is handled in getEventDbInstance lazily.
export const initEventDb = () => {
  // Empty, for backward compatibility if called elsewhere
};

export const logEvent = (event: any) => {
  const stmt = wrappedDb.prepare(`
    INSERT INTO system_events (
      id, tenant_id, actor_id, impersonator_id, service_module, 
      action_type, status, severity, target_resource, 
      ip_address, user_agent, payload_diff, crypto_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const runResult = stmt.run(
    event.id,
    event.tenantId || null,
    event.actorId || null,
    event.impersonatorId || null,
    event.serviceModule || null,
    event.actionType,
    event.status || 'SUCCESS',
    event.severity || 'INFO',
    event.targetResource || null,
    event.ipAddress || null,
    event.userAgent || null,
    event.payloadDiff ? JSON.stringify(event.payloadDiff) : null,
    event.cryptoHash
  );

  // Replicate asynchronously to DuckDB Analytical Engine for immediate high-performance querying
  try {
    ComplianceAnalyticsService.storeAuditLog({
      id: event.id,
      timestamp: new Date().toISOString(),
      tenant_id: event.tenantId || 'N/A',
      actor_id: event.actorId || 'SYSTEM',
      service_module: event.serviceModule || 'sys_root',
      action_type: event.actionType,
      status: event.status || 'SUCCESS',
      severity: event.severity || 'INFO',
      target_resource: event.targetResource || 'N/A',
      ip_address: event.ipAddress || '127.0.0.1',
      user_agent: event.userAgent || 'NodeJS/Agent',
      payload_diff: event.payloadDiff || '{}',
      crypto_hash: event.cryptoHash
    }).catch(err => {
      console.error('[DUCKDB_SYNC] Failed async sync to analytical store:', err.message);
    });
  } catch (e: any) {
    console.error('[DUCKDB_SYNC] Failed to initiate async sync to analytical store:', e.message);
  }

  return runResult;
};

export const getEvents = (limit: number = 100, offset: number = 0, tenantId?: string) => {
  if (tenantId) {
    return wrappedDb.prepare(`
      SELECT * FROM system_events 
      WHERE tenant_id = ?
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `).all(tenantId, limit, offset);
  }

  return wrappedDb.prepare(`
    SELECT * FROM system_events 
    ORDER BY timestamp DESC 
    LIMIT ? OFFSET ?
  `).all(limit, offset);
};

export default wrappedDb;
