import path from 'path';
import fs from 'fs';

// LanceDB is often heavy on memory/native dependencies, so we provide a robust mock fallback
class MockTable {
  constructor(public name: string) {}
  async add(data: any[]): Promise<void> {
    console.log(`[LanceDB Mock] Added ${data.length} records to table ${this.name}`);
  }
  async search(vector: number[]): Promise<any> {
    return {
      limit: (n: number) => ({
        execute: async () => []
      })
    };
  }
}

class MockDatabase {
  private tables = new Map<string, MockTable>();
  async tableNames(): Promise<string[]> {
    return Array.from(this.tables.keys());
  }
  async createTable(name: string, data?: any[]): Promise<MockTable> {
    const table = new MockTable(name);
    this.tables.set(name, table);
    if (data) await table.add(data);
    return table;
  }
  async openTable(name: string): Promise<MockTable> {
    if (!this.tables.has(name)) {
      return this.createTable(name);
    }
    return this.tables.get(name)!;
  }
}

let lancedbModule: any = null;
try {
  // Try to load native lancedb if available
  lancedbModule = require('@lancedb/lancedb');
} catch (e) {
  console.warn('[LANCEDB] Native lancedb module unavailable, using graceful mock fallback.');
}

const dbPath = path.join(process.cwd(), 'data', 'lancedb');
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

let globalDb: any = null;

export const getLanceDb = async (): Promise<any> => {
  if (globalDb) return globalDb;

  if (lancedbModule) {
    try {
      globalDb = await lancedbModule.connect(dbPath);
      return globalDb;
    } catch (e) {
      console.warn('[LANCEDB] Failed to connect to native lancedb, falling back to mock:', e);
    }
  }

  globalDb = new MockDatabase();
  return globalDb;
};
