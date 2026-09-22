import path from 'path';
import { RegionalDatabaseRouter } from '../services/regional-db-router';

class MockConnection {
  all(sql: string, ...args: any[]) {
    const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
    if (cb) cb(null, []);
  }
  run(sql: string, ...args: any[]) {
    const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
    if (cb) cb(null);
  }
}

class MockDatabase {
  constructor(public dbPath?: string) {}
  connect() {
    return new MockConnection();
  }
  all(sql: string, ...args: any[]) {
    const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
    if (cb) cb(null, []);
  }
  run(sql: string, ...args: any[]) {
    const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
    if (cb) cb(null);
  }
}

let duckdbModule: any = null;
try {
  duckdbModule = require('duckdb');
} catch (e) {
  console.warn('[DUCKDB] Native duckdb module unavailable, using in-memory mock fallback.');
}

function createDatabaseInstance(dbPath: string): any {
  if (duckdbModule) {
    try {
      return new duckdbModule.Database(dbPath);
    } catch (e) {
      console.warn('[DUCKDB] Failed to instantiate native DuckDB instance, using mock:', e);
    }
  }
  return new MockDatabase(dbPath);
}

const analyticsDbPath = path.join(process.cwd(), 'analytics.duckdb');

export let globalDb: any = null;
let globalConnection: any = null;
let isInitializing = false;
let isReady = false;
let initPromise: Promise<void> | null = null;

export const getDuckDb = (regionCode?: string): any => {
  if (regionCode) {
    try {
      const dbPath = path.join(process.cwd(), `compliance_analytics_${RegionalDatabaseRouter.getCanonicalRegion(regionCode).toLowerCase()}.duckdb`);
      return createDatabaseInstance(dbPath);
    } catch (e) {
      console.warn(`[DUCKDB] Failed to open regional DuckDB, falling back to :memory:`, e);
      return createDatabaseInstance(':memory:');
    }
  }
  if (!globalDb) {
    try {
      if (process.env.DUCKDB_IN_MEMORY === 'true' || process.env.NODE_ENV !== 'production') {
        globalDb = createDatabaseInstance(':memory:');
      } else {
        globalDb = createDatabaseInstance(analyticsDbPath);
      }
    } catch (e) {
      console.warn(`[DUCKDB] Failed to open global DuckDB (${analyticsDbPath}), falling back to :memory:`, e);
      globalDb = createDatabaseInstance(':memory:');
    }
  }
  return globalDb;
};

export const getConnection = (regionCode?: string): Promise<any> => {
  if (regionCode) {
    try {
      return Promise.resolve(RegionalDatabaseRouter.getDuckDb(regionCode));
    } catch (e) {
      console.warn(`[DUCKDB] Failed to get regional connection, falling back to in-memory:`, e);
      const memDb = createDatabaseInstance(':memory:');
      return Promise.resolve(memDb.connect());
    }
  }
  
  return new Promise((resolve, reject) => {
    if (globalConnection) {
      try {
        globalConnection.all('SELECT 1', (err: any) => {
          if (err) {
            console.warn('[DUCKDB] Cached connection invalid, reconnecting...', err.message);
            globalConnection = null;
            reconnect();
          } else {
            resolve(globalConnection!);
          }
        });
        return;
      } catch (e) {
        globalConnection = null;
      }
    }

    function reconnect() {
      try {
        const activeDb = getDuckDb();
        globalConnection = activeDb.connect();
        resolve(globalConnection);
      } catch (err) {
        console.warn('[DUCKDB] Connection failed, falling back to in-memory database:', err);
        try {
          globalDb = createDatabaseInstance(':memory:');
          globalConnection = globalDb.connect();
          resolve(globalConnection);
        } catch (memErr) {
          reject(memErr);
        }
      }
    }

    reconnect();
  });
};

export const initDuckDb = () => {
  if (initPromise) return initPromise;

  initPromise = new Promise<void>((resolve, reject) => {
    isInitializing = true;
    getConnection()
      .then((conn) => {
        conn.all(`
          CREATE TABLE IF NOT EXISTS compliance_audit_analytics (
            id VARCHAR PRIMARY KEY,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tenant_id VARCHAR,
            actor_id VARCHAR,
            service_module VARCHAR,
            action_type VARCHAR,
            status VARCHAR,
            severity VARCHAR,
            target_resource VARCHAR,
            ip_address VARCHAR,
            user_agent VARCHAR,
            payload_diff VARCHAR,
            crypto_hash VARCHAR,
            ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `, (err3: any) => {
          if (err3) {
            console.warn('[DUCKDB] Failed to create table, falling back to in-memory', err3);
            try {
              globalDb = createDatabaseInstance(':memory:');
              globalConnection = globalDb.connect();
              globalConnection.all(`
                CREATE TABLE IF NOT EXISTS compliance_audit_analytics (
                  id VARCHAR PRIMARY KEY,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  tenant_id VARCHAR,
                  actor_id VARCHAR,
                  service_module VARCHAR,
                  action_type VARCHAR,
                  status VARCHAR,
                  severity VARCHAR,
                  target_resource VARCHAR,
                  ip_address VARCHAR,
                  user_agent VARCHAR,
                  payload_diff VARCHAR,
                  crypto_hash VARCHAR,
                  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
              `, () => {
                isInitializing = false;
                isReady = true;
                resolve();
              });
            } catch (memErr) {
              isInitializing = false;
              isReady = true;
              resolve();
            }
            return;
          }
          isReady = true;
          isInitializing = false;
          resolve();
        });
      })
      .catch((e) => {
        console.warn('[DUCKDB] Failed to connect for init, falling back to in-memory', e);
        try {
          globalDb = createDatabaseInstance(':memory:');
          globalConnection = globalDb.connect();
          globalConnection.all(`
            CREATE TABLE IF NOT EXISTS compliance_audit_analytics (
              id VARCHAR PRIMARY KEY,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              tenant_id VARCHAR,
              actor_id VARCHAR,
              service_module VARCHAR,
              action_type VARCHAR,
              status VARCHAR,
              severity VARCHAR,
              target_resource VARCHAR,
              ip_address VARCHAR,
              user_agent VARCHAR,
              payload_diff VARCHAR,
              crypto_hash VARCHAR,
              ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `, () => {
            isInitializing = false;
            isReady = true;
            resolve();
          });
        } catch (memErr) {
          isInitializing = false;
          initPromise = null;
          resolve(); // Resolve anyway to avoid crashing the server
        }
      });
  });

  return initPromise;
};

export const queryAnalytics = async (sql: string, params: any[] = []): Promise<any[]> => {
  console.log(`[AUDIT] DuckDB: ${sql}`);
  if (sql.includes('${')) {
    console.error(`[SECURITY_VIOLATION] Potential SQL injection detected in DuckDB: ${sql}`);
  }

  if (!isReady && !isInitializing) {
    await initDuckDb();
  } else if (isInitializing && initPromise) {
    await initPromise;
  }

  try {
    const conn = await getConnection();
    return new Promise((resolve, reject) => {
      try {
        const callback = (err: any, res: any) => {
          if (err) {
            console.warn('[DUCKDB] Query error, resolving empty array to avoid crash:', err);
            resolve([]);
          } else {
            resolve(res || []);
          }
        };

        if (params && params.length > 0) {
          conn.all(sql, ...params, callback);
        } else {
          conn.all(sql, callback);
        }
      } catch (e) {
        console.warn('[DUCKDB] Execution error, resolving empty array:', e);
        resolve([]);
      }
    });
  } catch (err) {
    console.warn('[DUCKDB] Failed to get connection for query, resolving empty array:', err);
    return [];
  }
};
