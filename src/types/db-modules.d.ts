declare module 'duckdb' {
  export class Database {
    constructor(path: string);
    connect(): Connection;
    run(sql: string, params?: any[], callback?: (err: any) => void): void;
  }
  export class Connection {
    all(sql: string, callback?: (err: any, rows?: any[]) => void): void;
    all(sql: string, params: any[], callback?: (err: any, rows?: any[]) => void): void;
    run(sql: string, ...args: any[]): void;
  }
}

declare module 'rxdb' {
  export function createRxDatabase(config: any): Promise<any>;
}

declare module 'rxdb/plugins/storage-memory' {
  export function getRxStorageMemory(): any;
}
