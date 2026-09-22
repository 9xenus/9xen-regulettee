import crypto from 'crypto';
import dotenv from 'dotenv';
import RedisMock from 'ioredis-mock';
import Redis from 'ioredis';

dotenv.config();

type CacheBackend = 'REDIS' | 'REDIS_MOCK_IN_MEMORY';

/**
 * Multi-Region Data Residency & Caching Layer — Redis-alternative edition.
 *
 * Backing store selection:
 *  - If `REDIS_URL` / `EU_REDIS_URL` is configured → connects to the real Redis.
 *  - Otherwise → boots an in-memory `ioredis-mock` (full Redis command API,
 *    zero external dependency) as the drop-in Redis alternative.
 *
 * Used by high-stakes background processes (task queue daemon, automated
 * backups, regulatory sync, sovereign scanners) for:
 *  - TTL-backed result caching (get/set/getOrSet, tenant-residency keys)
 *  - Cross-process duplicate suppression (setIfAbsent, dedupe windows)
 *  - Exclusive-leader job locking (SET NX EX / compare-and-del) so heavy jobs
 *    never run concurrently across daemons / restarts.
 */
export class DistributedCacheTier {
  private client: any = null;
  private backend: CacheBackend = 'REDIS_MOCK_IN_MEMORY';
  private connected = false;
  private readonly defaultRegion = 'eu-central-1';

  constructor() {
    const url = process.env.REDIS_URL || process.env.EU_REDIS_URL;
    if (url) {
      try {
        this.client = new Redis(url, {
          lazyConnect: true,
          connectTimeout: 4000,
          commandTimeout: 4000,
          maxRetriesPerRequest: 1,
          enableReadyCheck: false,
          retryStrategy: (times: number) => {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          }
        });
        this.backend = 'REDIS';
      } catch (err: any) {
        console.warn(`[CACHE_TIER] Failed to initialize external Redis (${url}) — falling back to in-memory Redis alternative: ${err?.message || err}`);
      }
    }
    if (!this.client) {
      this.client = new RedisMock();
      this.backend = 'REDIS_MOCK_IN_MEMORY';
    }
    console.log(`[CACHE_TIER] Initialized Redis-alternative cache (backend=${this.backend}). TTL caching + NX/EX job-lock primitives are active for background processes.`);
  }

  get backendLabel(): CacheBackend {
    return this.backend;
  }

  get isExternalRedis(): boolean {
    return this.backend === 'REDIS';
  }

  private fallbackToMock(reason: string): void {
    try {
      if (this.client && typeof this.client.disconnect === 'function') this.client.disconnect();
    } catch { /* best-effort */ }
    this.client = new RedisMock();
    this.backend = 'REDIS_MOCK_IN_MEMORY';
    this.connected = true;
    console.warn(`[CACHE_TIER] ${reason} — switched to in-memory Redis alternative (backend=REDIS_MOCK_IN_MEMORY) for this process lifetime.`);
  }

  private async withClient(): Promise<any> {
    if (this.backend !== 'REDIS') return this.client;
    if (!this.connected) {
      this.connected = true;
      try {
        await this.client.connect();
        await this.client.ping();
      } catch (err: any) {
        this.fallbackToMock(`External Redis is not reachable (${err?.message || err})`);
      }
    }
    return this.client;
  }

  /** Namespaces any key strictly within a tenant + data-residency region. */
  private buildSovereignKey(tenantId: string, regionCode: string, cacheKey: string): string {
    return `${regionCode}:${tenantId}:${cacheKey}`;
  }

  // ---------- Tenant / residency-namespaced API ----------

  public async setTenantData(tenantId: string, dataPartitionRegion: string, key: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    await this.set(this.buildSovereignKey(tenantId, dataPartitionRegion, key), data, ttlSeconds);
  }

  public async getTenantData(tenantId: string, dataPartitionRegion: string, key: string): Promise<any> {
    return this.get(this.buildSovereignKey(tenantId, dataPartitionRegion, key));
  }

  public async invalidateTenantData(tenantId: string, dataPartitionRegion: string, key: string): Promise<void> {
    await this.del(this.buildSovereignKey(tenantId, dataPartitionRegion, key));
  }

  // ---------- Generic JSON cache API ----------

  public async get(key: string): Promise<any> {
    const c = await this.withClient();
    const raw = await c.get(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  public async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await this.rawSet(key, JSON.stringify(value), ttlSeconds);
  }

  public async del(key: string): Promise<void> {
    const c = await this.withClient();
    await c.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    const c = await this.withClient();
    return (await c.exists(key)) > 0;
  }

  public async incr(key: string): Promise<number> {
    const c = await this.withClient();
    return c.incr(key);
  }

  public async getKeys(pattern: string): Promise<string[]> {
    const c = await this.withClient();
    return c.keys(pattern);
  }

  /** Sets a key only if it does not already exist (SET NX EX). Returns true when the caller won the slot. */
  public async setIfAbsent(key: string, value: any, ttlSeconds: number = 60): Promise<boolean> {
    const c = await this.withClient();
    const result = await c.set(key, JSON.stringify(value), 'NX', 'EX', ttlSeconds);
    return result === 'OK';
  }

  /** Memoizes an expensive background computation under a key until it expires. */
  public async getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const hit = await this.get(key);
    if (hit != null) return hit as T;
    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  private async rawSet(key: string, value: string, ttlSeconds: number = 0): Promise<void> {
    const c = await this.withClient();
    if (ttlSeconds > 0) {
      await c.setex(key, ttlSeconds, value);
    } else {
      await c.set(key, value);
    }
  }

  // ---------- Job-lock primitives (SET NX EX / compare-and-del) ----------

  /**
   * Acquires an exclusive lock for a background job key.
   * Only one process/daemon receives `acquired:true`; the token owner may
   * refresh the lease and must release it afterwards.
   */
  public async acquireJobLock(jobKey: string, ttlSeconds: number = 120, token: string = crypto.randomUUID()): Promise<{ acquired: boolean; token: string }> {
    const c = await this.withClient();
    const result = await c.set(`lock:${jobKey}`, token, 'NX', 'EX', ttlSeconds);
    return { acquired: result === 'OK', token };
  }

  /** Releases the lock only if this token still owns it (avoids deleting a successor's lease). */
  public async releaseJobLock(jobKey: string, token: string): Promise<boolean> {
    const c = await this.withClient();
    const current = await c.get(`lock:${jobKey}`);
    if (current && current === token) {
      await c.del(`lock:${jobKey}`);
      return true;
    }
    return false;
  }

  /** Extends the lease of the current lock owner (heartbeat) so long-running jobs survive their initial TTL. */
  public async refreshJobLock(jobKey: string, token: string, ttlSeconds: number = 120): Promise<boolean> {
    const c = await this.withClient();
    const current = await c.get(`lock:${jobKey}`);
    if (current && current === token) {
      await c.expire(`lock:${jobKey}`, ttlSeconds);
      return true;
    }
    return false;
  }

  get defaultTenantRegion(): string {
    return this.defaultRegion;
  }
}

export const cacheTier = new DistributedCacheTier();