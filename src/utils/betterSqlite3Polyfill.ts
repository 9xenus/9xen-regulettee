/**
 * Browser-safe stub for better-sqlite3
 */

export class DatabaseStub {
  constructor(filename?: string, options?: any) {}
  prepare(sql: string) {
    return {
      run: (...params: any[]) => ({ changes: 0, lastInsertRowid: 0 }),
      get: (...params: any[]) => null,
      all: (...params: any[]) => [],
    };
  }
  exec(sql: string) {}
  pragma(pragma: string) {}
  close() {}
}

export default DatabaseStub;
