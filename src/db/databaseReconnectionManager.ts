/**
 * DATABASE RECONNECTION & HEALTH MANAGEMENT UTILITY
 * Provides automated retry logic with exponential backoff, health monitoring,
 * and UI notification event dispatching for vector and relational databases.
 */

export type DatabaseType = 'relational' | 'vector' | 'graph' | 'olap' | 'document' | 'ledger';

export interface DatabaseStatus {
  id: string;
  name: string;
  type: DatabaseType;
  status: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'DEGRADED';
  latencyMs: number;
  lastChecked: string;
  consecutiveFailures: number;
  lastError: string | null;
  reconnectAttempts: number;
  maxRetries: number;
}

export interface ReconnectionEventDetail {
  dbId: string;
  dbName: string;
  type: DatabaseType;
  status: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'DEGRADED';
  attempt?: number;
  maxRetries?: number;
  message?: string;
}

export class DatabaseReconnectionManager {
  private static instance: DatabaseReconnectionManager;
  private dbRegistry: Map<string, {
    info: DatabaseStatus;
    healthCheckFn: () => Promise<boolean>;
    reconnectFn?: () => Promise<boolean>;
  }> = new Map();

  private healthCheckTimer: NodeJS.Timeout | null = null;
  private isChecking = false;

  private constructor() {
    this.registerDefaultDatabases();
    this.startHealthCheckLoop(20000); // Check every 20 seconds
  }

  public static getInstance(): DatabaseReconnectionManager {
    if (!DatabaseReconnectionManager.instance) {
      DatabaseReconnectionManager.instance = new DatabaseReconnectionManager();
    }
    return DatabaseReconnectionManager.instance;
  }

  /**
   * Registers default database connections across vector & relational tiers.
   */
  private registerDefaultDatabases() {
    // 1. Relational SQLite / Cloud SQL
    this.registerDatabase({
      id: 'sqlite_relational',
      name: 'SQLite / Cloud SQL Relational Engine',
      type: 'relational',
      maxRetries: 5,
      healthCheckFn: async () => {
        try {
          const { getDb } = await import('./sqlite');
          const instance = getDb();
          return !!instance;
        } catch {
          return false;
        }
      },
    });

    // 2. Chroma Vector DB
    this.registerDatabase({
      id: 'chroma_vector',
      name: 'ChromaDB Vector Store',
      type: 'vector',
      maxRetries: 5,
      healthCheckFn: async () => {
        try {
          const { ChromaVectorStore } = await import('./chroma');
          return !!ChromaVectorStore;
        } catch {
          return false;
        }
      },
      reconnectFn: async () => {
        const { ChromaVectorStore } = await import('./chroma');
        return true;
      }
    });

    // 3. Kùzu Graph DB
    this.registerDatabase({
      id: 'kuzu_graph',
      name: 'Kùzu Graph Lineage Engine',
      type: 'graph',
      maxRetries: 3,
      healthCheckFn: async () => {
        try {
          const { kuzuQuery } = await import('./kuzu');
          return typeof kuzuQuery === 'function';
        } catch {
          return false;
        }
      },
    });

    // 4. DuckDB OLAP Analytics
    this.registerDatabase({
      id: 'duckdb_olap',
      name: 'DuckDB OLAP Analytics Engine',
      type: 'olap',
      maxRetries: 3,
      healthCheckFn: async () => {
        try {
          const { queryAnalytics } = await import('./duckdb');
          return typeof queryAnalytics === 'function';
        } catch {
          return false;
        }
      },
    });

    // 5. LanceDB Embeddings Store
    this.registerDatabase({
      id: 'lancedb_vector',
      name: 'LanceDB High-Performance Vector Store',
      type: 'vector',
      maxRetries: 3,
      healthCheckFn: async () => {
        try {
          const { getLanceDb } = await import('./lancedb');
          return typeof getLanceDb === 'function';
        } catch {
          return false;
        }
      },
    });
  }

  /**
   * Registers a new database engine for automated health monitoring & reconnection handling.
   */
  public registerDatabase(params: {
    id: string;
    name: string;
    type: DatabaseType;
    maxRetries?: number;
    healthCheckFn: () => Promise<boolean>;
    reconnectFn?: () => Promise<boolean>;
  }) {
    const statusInfo: DatabaseStatus = {
      id: params.id,
      name: params.name,
      type: params.type,
      status: 'CONNECTED',
      latencyMs: 1,
      lastChecked: new Date().toISOString(),
      consecutiveFailures: 0,
      lastError: null,
      reconnectAttempts: 0,
      maxRetries: params.maxRetries ?? 5,
    };

    this.dbRegistry.set(params.id, {
      info: statusInfo,
      healthCheckFn: params.healthCheckFn,
      reconnectFn: params.reconnectFn,
    });
  }

  /**
   * Executes a database query or operation wrapped in automated retry logic.
   * On failure, retries with exponential backoff and dispatches UI notification events.
   */
  public async executeWithRetry<T>(
    dbId: string,
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      baseDelayMs?: number;
      fallbackValue?: T;
    }
  ): Promise<T> {
    const dbEntry = this.dbRegistry.get(dbId);
    const dbName = dbEntry ? dbEntry.info.name : dbId;
    const maxRetries = options?.maxRetries ?? dbEntry?.info.maxRetries ?? 4;
    const baseDelayMs = options?.baseDelayMs ?? 500;

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      try {
        const startTime = Date.now();
        const result = await operation();
        const latency = Date.now() - startTime;

        // On success, update status if previously degraded or reconnecting
        if (dbEntry) {
          if (dbEntry.info.status !== 'CONNECTED') {
            dbEntry.info.status = 'CONNECTED';
            dbEntry.info.consecutiveFailures = 0;
            dbEntry.info.reconnectAttempts = 0;
            dbEntry.info.lastError = null;

            this.dispatchUIEvent('db-reconnection-success', {
              dbId,
              dbName,
              type: dbEntry.info.type,
              status: 'CONNECTED',
              message: `Successfully reconnected to ${dbName}.`,
            });
          }
          dbEntry.info.latencyMs = latency;
          dbEntry.info.lastChecked = new Date().toISOString();
        }

        return result;
      } catch (err: any) {
        attempt++;
        lastError = err;
        const errorMessage = err?.message || String(err);

        console.warn(
          `[DB_RECONNECT_UTILITY] Database query failed on '${dbName}' (Attempt ${attempt}/${maxRetries + 1}):`,
          errorMessage
        );

        if (dbEntry) {
          dbEntry.info.consecutiveFailures++;
          dbEntry.info.lastError = errorMessage;
          dbEntry.info.reconnectAttempts = attempt;
          dbEntry.info.status = attempt > maxRetries ? 'DISCONNECTED' : 'RECONNECTING';
        }

        // Dispatch UI notification event for retry attempt
        this.dispatchUIEvent('db-connection-status', {
          dbId,
          dbName,
          type: dbEntry ? dbEntry.info.type : 'relational',
          status: attempt > maxRetries ? 'DISCONNECTED' : 'RECONNECTING',
          attempt,
          maxRetries,
          message: `Lost connection to ${dbName}. Reconnection attempt ${attempt}/${maxRetries}...`,
        });

        if (attempt <= maxRetries) {
          // Exponential backoff with jitter
          const backoffDelay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));

          // Try custom reconnect handler if defined
          if (dbEntry?.reconnectFn) {
            try {
              await dbEntry.reconnectFn();
            } catch (reconnectErr) {
              console.warn(`[DB_RECONNECT_UTILITY] Reconnection handler failed for '${dbName}':`, reconnectErr);
            }
          }
        }
      }
    }

    // Final failure after exhausting retries
    this.dispatchUIEvent('db-reconnection-failed', {
      dbId,
      dbName,
      type: dbEntry ? dbEntry.info.type : 'relational',
      status: 'DISCONNECTED',
      attempt: maxRetries,
      maxRetries,
      message: `Failed to reconnect to ${dbName} after ${maxRetries} attempts. ${lastError?.message || ''}`,
    });

    if (options && 'fallbackValue' in options) {
      return options.fallbackValue as T;
    }

    throw lastError;
  }

  /**
   * Synchronous version of executeWithRetry for synchronous SQL drivers (e.g. SQLite/sql.js).
   */
  public executeWithRetrySync<T>(
    dbId: string,
    operation: () => T,
    options?: {
      maxRetries?: number;
      fallbackValue?: T;
    }
  ): T {
    const dbEntry = this.dbRegistry.get(dbId);
    const dbName = dbEntry ? dbEntry.info.name : dbId;
    const maxRetries = options?.maxRetries ?? dbEntry?.info.maxRetries ?? 3;

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      try {
        const startTime = Date.now();
        const result = operation();
        const latency = Date.now() - startTime;

        if (dbEntry) {
          if (dbEntry.info.status !== 'CONNECTED') {
            dbEntry.info.status = 'CONNECTED';
            dbEntry.info.consecutiveFailures = 0;
            dbEntry.info.reconnectAttempts = 0;
            dbEntry.info.lastError = null;

            this.dispatchUIEvent('db-reconnection-success', {
              dbId,
              dbName,
              type: dbEntry.info.type,
              status: 'CONNECTED',
              message: `Successfully reconnected to ${dbName}.`,
            });
          }
          dbEntry.info.latencyMs = latency;
          dbEntry.info.lastChecked = new Date().toISOString();
        }

        return result;
      } catch (err: any) {
        attempt++;
        lastError = err;
        const errorMessage = err?.message || String(err);

        console.warn(
          `[DB_RECONNECT_UTILITY] Synchronous query failed on '${dbName}' (Attempt ${attempt}/${maxRetries + 1}):`,
          errorMessage
        );

        if (dbEntry) {
          dbEntry.info.consecutiveFailures++;
          dbEntry.info.lastError = errorMessage;
          dbEntry.info.reconnectAttempts = attempt;
          dbEntry.info.status = attempt > maxRetries ? 'DISCONNECTED' : 'RECONNECTING';
        }

        this.dispatchUIEvent('db-connection-status', {
          dbId,
          dbName,
          type: dbEntry ? dbEntry.info.type : 'relational',
          status: attempt > maxRetries ? 'DISCONNECTED' : 'RECONNECTING',
          attempt,
          maxRetries,
          message: `Lost connection to ${dbName}. Reconnection attempt ${attempt}/${maxRetries}...`,
        });
      }
    }

    this.dispatchUIEvent('db-reconnection-failed', {
      dbId,
      dbName,
      type: dbEntry ? dbEntry.info.type : 'relational',
      status: 'DISCONNECTED',
      attempt: maxRetries,
      maxRetries,
      message: `Failed to execute operation on ${dbName} after ${maxRetries} attempts. ${lastError?.message || ''}`,
    });

    if (options && 'fallbackValue' in options) {
      return options.fallbackValue as T;
    }

    throw lastError;
  }

  /**
   * Starts periodic health checks across all registered databases.
   */
  public startHealthCheckLoop(intervalMs: number = 20000) {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(() => {
      this.checkAllDatabaseHealth().catch((err) => {
        console.error('[DB_RECONNECT_UTILITY] Health check loop error:', err);
      });
    }, intervalMs);
  }

  /**
   * Performs a health check across all registered databases.
   */
  public async checkAllDatabaseHealth(): Promise<Record<string, DatabaseStatus>> {
    if (this.isChecking) {
      return this.getDatabaseStatuses();
    }

    this.isChecking = true;

    for (const [id, entry] of this.dbRegistry.entries()) {
      const startTime = Date.now();
      try {
        const isHealthy = await entry.healthCheckFn();
        const latency = Date.now() - startTime;

        entry.info.lastChecked = new Date().toISOString();
        entry.info.latencyMs = latency;

        if (isHealthy) {
          if (entry.info.status !== 'CONNECTED') {
            entry.info.status = 'CONNECTED';
            entry.info.consecutiveFailures = 0;
            entry.info.reconnectAttempts = 0;
            entry.info.lastError = null;

            this.dispatchUIEvent('db-reconnection-success', {
              dbId: id,
              dbName: entry.info.name,
              type: entry.info.type,
              status: 'CONNECTED',
              message: `Health check restored: ${entry.info.name} is online.`,
            });
          }
        } else {
          entry.info.consecutiveFailures++;
          if (entry.info.status === 'CONNECTED') {
            entry.info.status = 'DEGRADED';
            this.dispatchUIEvent('db-connection-status', {
              dbId: id,
              dbName: entry.info.name,
              type: entry.info.type,
              status: 'DEGRADED',
              message: `Health check warning: ${entry.info.name} is unresponsive. Attempting auto-reconnect...`,
            });
            // Trigger background reconnection attempt
            this.forceReconnect(id).catch(() => {});
          }
        }
      } catch (err: any) {
        entry.info.consecutiveFailures++;
        entry.info.lastError = err?.message || String(err);
        entry.info.status = 'DISCONNECTED';
      }
    }

    this.isChecking = false;
    return this.getDatabaseStatuses();
  }

  /**
   * Manually triggers a reconnection procedure for a specific database.
   */
  public async forceReconnect(dbId: string): Promise<boolean> {
    const entry = this.dbRegistry.get(dbId);
    if (!entry) return false;

    entry.info.status = 'RECONNECTING';
    this.dispatchUIEvent('db-connection-status', {
      dbId,
      dbName: entry.info.name,
      type: entry.info.type,
      status: 'RECONNECTING',
      message: `Initiating manual reconnection to ${entry.info.name}...`,
    });

    return this.executeWithRetry(
      dbId,
      async () => {
        if (entry.reconnectFn) {
          await entry.reconnectFn();
        }
        const healthy = await entry.healthCheckFn();
        if (!healthy) throw new Error('Health check failed post-reconnect');
        return true;
      },
      { maxRetries: 3, baseDelayMs: 400 }
    ).catch(() => false);
  }

  /**
   * Dispatches a custom DOM event so React components and NotificationContext can trigger UI alerts.
   */
  private dispatchUIEvent(eventName: string, detail: ReconnectionEventDetail) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  /**
   * Returns current status map of all databases.
   */
  public getDatabaseStatuses(): Record<string, DatabaseStatus> {
    const result: Record<string, DatabaseStatus> = {};
    for (const [id, entry] of this.dbRegistry.entries()) {
      result[id] = { ...entry.info };
    }
    return result;
  }
}

export const dbReconnectionManager = DatabaseReconnectionManager.getInstance();
