import { prisma } from './prisma';
import { createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import fs from 'fs';
import path from 'path';

// Note: Native databases (lancedb, kuzu, duckdb) are handled via dedicated modules in src/db/
import { getKuzuDb } from '../db/kuzu';
import { getDuckDb } from '../db/duckdb';
import { getLanceDb } from '../db/lancedb';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. RxDB Setup (Unstructured KYC/KYB payloads)
let rxdbInstance: any = null;
export const getRxDB = async (): Promise<any> => {
  if (!rxdbInstance) {
    try {
      rxdbInstance = await createRxDatabase({
        name: path.join(DATA_DIR, 'rxdb_payloads'),
        storage: getRxStorageMemory(),
        ignoreDuplicate: true
      });
      await rxdbInstance.addCollections({
        documents: {
          schema: {
            version: 0,
            primaryKey: 'id',
            type: 'object',
            properties: {
              id: { type: 'string', maxLength: 100 },
              userId: { type: 'string' },
              payload: { type: 'object' },
              timestamp: { type: 'string' }
            },
            required: ['id', 'userId', 'payload']
          }
        }
      });
    } catch (e) {
      console.warn('[RxDB] Falling back to in-memory mock store');
      const docsStore = new Map();
      rxdbInstance = {
        documents: {
          insert: async (doc: any) => docsStore.set(doc.id, doc),
          find: () => ({ exec: async () => Array.from(docsStore.values()) })
        }
      };
    }
  }
  return rxdbInstance;
};

// Unified exports for external modules
export const getLanceDB = getLanceDb;
export const getKuzuDB = getKuzuDb;
export const getDuckDB = getDuckDb;

export { prisma };
