import { cacheTier } from '../db/cache-tier';

export interface ExclusiveRunOptions {
  /** Stable identity of the high-stakes background process (e.g. "job:backup:automated"). */
  jobKey: string;
  /** Maximum lease lifetime before heartbeat refresh kicks in (ms). */
  ttlMs: number;
  /** Optional shorter dedupe window — skips re-running when the job completed within this window. */
  dedupeWindowMs?: number;
  heartbeatIntervalMs?: number;
  tag?: string;
}

export type ExclusiveRunResult<T> =
  | { status: 'completed'; result: T; skipped?: never }
  | { status: 'skipped'; reason: 'leader-running' | 'recently-completed'; result?: never; lastRunAt?: number };

const lastRunKey = (jobKey: string) => `job:last:${jobKey}`;

/**
 * Runs one instance of a high-stakes background job at a time.
 *
 * Guarantees:
 *  - Only the process that wins the NX/EX lock executes the payload.
 *  - A heartbeat refreshes the lease so long-running jobs never get preempted.
 *  - On completion the lock + last-run marker (optional dedupe window) are recorded,
 *    preventing duplicate executions across daemon restarts.
 */
export async function runExclusiveJob<T>(opts: ExclusiveRunOptions, fn: () => Promise<T>): Promise<ExclusiveRunResult<T>> {
  const ttlSec = Math.max(5, Math.ceil(opts.ttlMs / 1000));

  if (opts.dedupeWindowMs) {
    const lastRun = await cacheTier.get(lastRunKey(opts.jobKey));
    if (lastRun && typeof lastRun === 'object' && (lastRun as any).ts) {
      const ago = Date.now() - (lastRun as any).ts;
      if (ago < opts.dedupeWindowMs) {
        console.info(`[JobCoordinator] Skipped "${opts.jobKey}" ${opts.tag || ''} — completed recently (${Math.round(ago / 1000)}s ago).`);
        return { status: 'skipped', reason: 'recently-completed', lastRunAt: (lastRun as any).ts };
      }
    }
  }

  const { acquired, token } = await cacheTier.acquireJobLock(opts.jobKey, ttlSec);
  if (!acquired) {
    console.warn(`[JobCoordinator] Skipped "${opts.jobKey}" ${opts.tag || ''} — exclusive lock already held by another process.`);
    return { status: 'skipped', reason: 'leader-running' };
  }

  const heartbeatMs = opts.heartbeatIntervalMs || Math.max(1000, Math.floor(opts.ttlMs / 3));
  const heartbeat = setInterval(() => {
    cacheTier.refreshJobLock(opts.jobKey, token, ttlSec).catch(() => undefined);
  }, heartbeatMs);

  try {
    const result = await fn();
    const markerLifetimeSec = opts.dedupeWindowMs ? Math.max(10, Math.ceil(opts.dedupeWindowMs / 1000)) : ttlSec;
    await cacheTier.set(lastRunKey(opts.jobKey), { ts: Date.now(), tag: opts.tag || null }, markerLifetimeSec);
    console.info(`[JobCoordinator] Completed "${opts.jobKey}" ${opts.tag || ''}.`);
    return { status: 'completed', result };
  } finally {
    clearInterval(heartbeat);
    try {
      await cacheTier.releaseJobLock(opts.jobKey, token);
    } catch (err: any) {
      console.warn(`[JobCoordinator] Lock release failed for "${opts.jobKey}": ${err?.message || err}`);
    }
  }
}

/** Convenience memoization passthrough for heavy background computations. */
export async function memoizeHeavy<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
  return cacheTier.getOrSet(key, ttlSeconds, factory);
}

/** Records a cache heartbeat for a job key (e.g. last regulatory sync snapshot). */
export async function recordJobSnapshot(jobKey: string, snapshot: any, ttlSeconds: number = 3600): Promise<void> {
  await cacheTier.set(`job:snapshot:${jobKey}`, snapshot, ttlSeconds);
}

export async function readJobSnapshot<T = any>(jobKey: string): Promise<T | null> {
  return cacheTier.get(`job:snapshot:${jobKey}`);
}