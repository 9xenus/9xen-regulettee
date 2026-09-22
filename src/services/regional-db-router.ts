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
import fs from 'fs';
import { SCHEMA, INDEXES } from '../db/schema';

let duckdb: any = null;
let duckdbAvailable = false;
try {
  duckdb = require('duckdb');
  duckdbAvailable = true;
} catch (e) {
  console.warn('[REGIONAL_DB] Native duckdb module unavailable, using graceful fallback.');
}

let kuzu: any = null;
let kuzuAvailable = false;
try {
  kuzu = require('kuzu');
  kuzuAvailable = true;
} catch (e) {
  console.warn('[REGIONAL_DB] Native kuzu module unavailable, using graceful fallback.');
}

export class RegionalDatabaseRouter {
  private static sqliteConnections = new Map<string, any>();
  private static duckdbDatabases = new Map<string, any>();
  private static duckdbConnections = new Map<string, any>();
  private static kuzuDatabases = new Map<string, any>();
  private static kuzuConnections = new Map<string, any>();
  private static routingOverrides = new Map<string, string>();

  /**
   * Initializes the router by loading existing overrides from the database.
   */
  public static async initialize(db: any): Promise<void> {
    try {
      const tenants = db.prepare('SELECT tenant_id, organization_metadata FROM tenant_settings').all() as any[];
      tenants.forEach(t => {
        if (t.organization_metadata) {
          const meta = JSON.parse(t.organization_metadata);
          if (meta.routing_override) {
            this.setRoutingOverride(t.tenant_id, meta.routing_override);
          }
        }
      });
      console.log(`[REGIONAL_DB] Router initialized with ${this.routingOverrides.size} overrides.`);
    } catch (error) {
      console.error('[REGIONAL_DB] Failed to initialize overrides:', error);
    }
  }

  /**
   * Registers a manual routing override for a specific tenant.
   */
  public static setRoutingOverride(tenantId: string, regionCode: string): void {
    this.routingOverrides.set(tenantId, this.getCanonicalRegion(regionCode));
    console.log(`[REGIONAL_DB] Registered routing override: Tenant ${tenantId} -> Region ${regionCode}`);
  }

  /**
   * Resolves the canonical region for a transaction, accounting for overrides.
   */
  public static resolveRegion(regionCode: string, tenantId?: string): string {
    if (tenantId && this.routingOverrides.has(tenantId)) {
      return this.routingOverrides.get(tenantId)!;
    }
    return this.getCanonicalRegion(regionCode);
  }

  /**
   * Translates an input region string (e.g., 'sg', 'APAC', 'us-east-1') into a canonical region code:
   * EU, USA, LATAM, AUSTRALIA, APAC, or GLOBAL
   */
  public static getCanonicalRegion(regionCode: string): string {
    const r = (regionCode || 'GLOBAL').trim().toUpperCase();
    if (['EU', 'EEA', 'EU-CENTRAL-1', 'EU-WEST-1'].includes(r)) return 'EU';
    if (['US', 'USA', 'CA', 'US-EAST-1', 'US-WEST-2', 'CA-CENTRAL-1'].includes(r)) return 'USA';
    if (['BR', 'LATAM', 'SA', 'SA-EAST-1', 'BRAZIL'].includes(r)) return 'LATAM';
    if (['AU', 'AUSTRALIA', 'AP-SOUTHEAST-2', 'SYDNEY'].includes(r)) return 'AUSTRALIA';
    if (['SG', 'APAC', 'JP', 'IN', 'AP-SOUTHEAST-1', 'SINGAPORE'].includes(r)) return 'APAC';
    if (['ZA', 'AFRICA', 'NG', 'KE', 'MA', 'EG'].includes(r)) return 'AFRICA';
    if (['SA', 'ME', 'MIDDLE_EAST', 'UAE', 'QA', 'IL'].includes(r)) return 'MIDDLE_EAST';
    return 'GLOBAL';
  }

  /**
   * Returns an active better-sqlite3 database connection for the given region shard.
   * Alias for getSqliteDb for backward compatibility.
   */
  public static getDbForRegion(regionCode: string, tenantId?: string): any {
    return this.getSqliteDb(regionCode, tenantId);
  }

  /**
   * Returns an active better-sqlite3 database connection for the given region shard.
   */
  public static getSqliteDb(regionCode: string, tenantId?: string): any {
    const key = this.resolveRegion(regionCode, tenantId);

    if (this.sqliteConnections.has(key)) {
      return this.sqliteConnections.get(key);
    }

    const dbFilename = `compliance_${key.toLowerCase()}.db`;
    const dbPath = path.join(process.cwd(), dbFilename);
    const isNew = !fs.existsSync(dbPath);

    console.log(`[REGIONAL_DB] Routing SQLite transaction to regional shard: ${dbFilename} (${key})`);
    
    const db = new Database(dbPath);
    
    // If new, initialize localized schema for this regional shard
    if (isNew) {
      db.exec(SCHEMA);
      try {
        db.exec(INDEXES);
      } catch (e) {
        console.error(`[REGIONAL_DB] Index creation error for ${key}:`, e);
      }
    }

    this.sqliteConnections.set(key, db);
    return db;
  }

  /**
   * Returns a DuckDB connection for the regional analytics shard.
   */
  public static getDuckDb(regionCode: string, tenantId?: string): any {
    const key = this.resolveRegion(regionCode, tenantId);
    
    const existingConn = this.duckdbConnections.get(key);
    if (existingConn) {
      return existingConn;
    }

    if (!duckdbAvailable || !duckdb) {
      const mockConn = {
        all: (sql: string, ...args: any[]) => {
          const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
          if (cb) cb(null, []);
        },
        run: (sql: string, ...args: any[]) => {
          const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
          if (cb) cb(null);
        }
      };
      this.duckdbConnections.set(key, mockConn);
      return mockConn;
    }

    try {
      const dbFilename = `compliance_analytics_${key.toLowerCase()}.duckdb`;
      const dbPath = path.join(process.cwd(), dbFilename);
      
      console.log(`[REGIONAL_DB] Routing DuckDB analytics to regional shard: ${dbPath} (${key})`);
      
      const db = new duckdb.Database(dbPath);
      const conn = db.connect();
      
      this.duckdbDatabases.set(key, db);
      this.duckdbConnections.set(key, conn);
      return conn;
    } catch (e) {
      console.warn(`[REGIONAL_DB] Failed to create DuckDB for region ${key}, falling back to :memory:`, e);
      try {
        const memDb = new duckdb.Database(':memory:');
        const conn = memDb.connect();
        return conn;
      } catch (memErr) {
        const mockConn = {
          all: (sql: string, ...args: any[]) => {
            const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
            if (cb) cb(null, []);
          },
          run: (sql: string, ...args: any[]) => {
            const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
            if (cb) cb(null);
          }
        };
        return mockConn;
      }
    }
  }

  /**
   * Returns a Kuzu graph database connection for the regional graph shard.
   */
  public static getKuzuDb(regionCode: string, tenantId?: string): any {
    const key = this.resolveRegion(regionCode, tenantId);
    
    if (this.kuzuConnections.has(key)) {
      return this.kuzuConnections.get(key);
    }

    if (!kuzuAvailable || !kuzu) {
      const mockConn = {
        query: async (q: string, p: any) => ({ all: async () => [], get: async () => null }),
        prepare: async () => ({}),
        execute: async () => ({ all: async () => [], get: async () => null })
      };
      this.kuzuConnections.set(key, mockConn);
      return mockConn;
    }

    try {
      const dbDir = path.join(process.cwd(), `kuzu_graph_${key.toLowerCase()}`);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      console.log(`[REGIONAL_DB] Routing Kuzu graph data to regional shard: ${dbDir} (${key})`);
      
      const db = new kuzu.Database(dbDir);
      const conn = new kuzu.Connection(db);
      
      this.kuzuDatabases.set(key, db);
      this.kuzuConnections.set(key, conn);
      return conn;
    } catch (err) {
      console.warn(`[REGIONAL_DB] Failed to create Kuzu DB for region ${key}, using fallback:`, err);
      const mockConn = {
        query: async (q: string, p: any) => ({ all: async () => [], get: async () => null }),
        prepare: async () => ({}),
        execute: async () => ({ all: async () => [], get: async () => null })
      };
      this.kuzuConnections.set(key, mockConn);
      return mockConn;
    }
  }

  /**
   * Returns a pseudo-collection path for regional vector data (Chroma emulation).
   */
  public static getChromaPath(regionCode: string, collectionName: string): string {
    const key = this.getCanonicalRegion(regionCode);
    const dir = path.join(process.cwd(), `chroma_vector_${key.toLowerCase()}`, collectionName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  /**
   * Closes all active regional database connections.
   */
  public static closeAll(): void {
    for (const [key, conn] of this.sqliteConnections.entries()) {
      try { conn.close(); } catch (e) { console.error(`Error closing SQLite for ${key}:`, e); }
    }
    for (const [key, conn] of this.kuzuConnections.entries()) {
      try { /* Kuzu handles cleanup */ } catch (e) { console.error(`Error closing Kuzu for ${key}:`, e); }
    }
    this.sqliteConnections.clear();
    this.duckdbConnections.clear();
    this.kuzuConnections.clear();
  }
}
