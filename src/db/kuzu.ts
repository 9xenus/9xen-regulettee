let kuzu: any = null;
let kuzuAvailable = false;
try {
  kuzu = require('kuzu');
  kuzuAvailable = true;
} catch (e) {
  console.warn('[KUZU] Native kuzu module unavailable, using graceful mock fallback graph engine.');
}

import * as path from 'path';
import { ALAE_KUZU_SCHEMA } from '../services/alae/kuzu-schema';
import { RegionalDatabaseRouter } from '../services/regional-db-router';

const globalDbPath = path.join(process.cwd(), 'kuzu_db');
let globalDb: any = null;
let globalConn: any = null;

export const getKuzuDb = async (regionCode?: string): Promise<any> => {
  if (regionCode) {
    return RegionalDatabaseRouter.getKuzuDb(regionCode);
  }
  
  if (globalConn) return globalConn;

  if (!kuzuAvailable || !kuzu) {
    globalConn = {
      query: async (q: string, p: any) => ({ all: async () => [], get: async () => null }),
      prepare: async () => ({}),
      execute: async () => ({ all: async () => [], get: async () => null })
    };
    return globalConn;
  }

  try {
    globalDb = new kuzu.Database(globalDbPath);
    globalConn = new kuzu.Connection(globalDb);
    return globalConn;
  } catch (err) {
    console.warn('[KUZU] Failed to initialize global Kuzu DB, using fallback:', err);
    globalConn = {
      query: async (q: string, p: any) => ({ all: async () => [], get: async () => null }),
      prepare: async () => ({}),
      execute: async () => ({ all: async () => [], get: async () => null })
    };
    return globalConn;
  }
};

// Parameterized query function to prevent injection
export const kuzuQuery = async (query: string, params: Record<string, any> = {}) => {
  // Audit Logging
  console.log(`[AUDIT] KuzuDB: ${query}`);
  // Security Check for potential injection
  if (query.includes('${')) {
    console.error(`[SECURITY_VIOLATION] Potential SQL injection detected in KuzuDB: ${query}`);
  }

  try {
    const connection = await getKuzuDb();
    if (!kuzuAvailable || !connection.prepare) {
      return [];
    }
    const preparedStatement = await connection.prepare(query);
    const result = await connection.execute(preparedStatement, params);
    return result;
  } catch (err) {
    console.warn('[KUZU] Query execution warning (fallback active):', err);
    return [];
  }
};
