import { encryptData, decryptData, isEncrypted } from '../lib/cryptoUtils';

/**
 * Automated Background Log Retention Worker / Daemon
 * 
 * Automatically enforces a 7-day retention policy (and localStorage capacity limits)
 * on local browser logs upon application initialization and background execution cycles,
 * whether or not the Error Drawer or System Health Log views are active.
 */

export interface LogRetentionResult {
  timestamp: string;
  autoPurgeEnabled: boolean;
  totalStorageSizeBytes: number;
  totalStorageSizeFormatted: string;
  totalLogsPurged: number;
  bytesFreed: number;
  bytesFreedFormatted: string;
  auditedKeysCount: number;
  purgedKeys: Array<{
    key: string;
    beforeCount: number;
    afterCount: number;
    purgedCount: number;
    beforeSizeBytes: number;
    afterSizeBytes: number;
  }>;
  retentionWindowDays: number;
  status: 'OPTIMAL' | 'CLEANED' | 'WARNING_QUOTA_HIGH' | 'DISABLED';
}

export interface StorageMetrics {
  totalLocalStorageBytes: number;
  totalLocalStorageFormatted: string;
  estimatedQuotaBytes: number; // Standard browser limit ~5MB
  usagePercentage: number;
  logKeysCount: number;
  logKeysTotalBytes: number;
  logKeysFormatted: string;
  logKeysStats: Array<{
    key: string;
    sizeBytes: number;
    sizeFormatted: string;
    itemCount: number;
  }>;
}

// Known localStorage log keys monitored by 9Xen Regulettee
export const KNOWN_LOG_KEYS = [
  '9xen-regulettee_system_error_logs',
  '9xen-regulettee_system_audit_logs',
  '9xen-regulettee_network_latency_logs',
  'eu_compliance_audit_logs',
  'b2g_email_logs',
  'admin_mfa_session_logs',
  'telemetry_cache',
  'console_logs',
];

// Preference and status keys in localStorage
export const AUTO_PURGE_PREF_KEY = '9xen-regulettee_auto_purge_logs_7d';
export const RETENTION_DAYS_KEY = '9xen-regulettee_retention_days';
export const LAST_PURGE_TIMESTAMP_KEY = '9xen-regulettee_last_log_purge_timestamp';

// Capacity limits per log key to prevent quota overflow
export const MAX_KEY_LOG_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5MB max per log array

/**
 * Format raw byte count into human-readable string (B, KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Discover all log-related keys in localStorage
 */
export function discoverLogKeys(): string[] {
  const discovered = new Set<string>(KNOWN_LOG_KEYS);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('log') || key.includes('telemetry') || key.includes('audit'))) {
        discovered.add(key);
      }
    }
  } catch (err) {
    console.warn('[LogRetentionWorker] Error discovering localStorage keys:', err);
  }
  return Array.from(discovered);
}

/**
 * Calculate detailed localStorage storage metrics and footprint
 */
export function getLogStorageMetrics(): StorageMetrics {
  let totalLocalStorageBytes = 0;
  let logKeysTotalBytes = 0;
  const logKeysStats: StorageMetrics['logKeysStats'] = [];
  const logKeys = discoverLogKeys();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const keyBytes = (key.length + value.length) * 2; // UTF-16 ~2 bytes per char
        totalLocalStorageBytes += keyBytes;

        if (logKeys.includes(key) || key.includes('log') || key.includes('audit')) {
          logKeysTotalBytes += keyBytes;
          let itemCount = 0;
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) itemCount = parsed.length;
          } catch {
            itemCount = 1;
          }
          logKeysStats.push({
            key,
            sizeBytes: keyBytes,
            sizeFormatted: formatBytes(keyBytes),
            itemCount,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[LogRetentionWorker] Error calculating storage metrics:', err);
  }

  const estimatedQuotaBytes = 5 * 1024 * 1024; // Standard ~5MB browser localStorage limit
  const usagePercentage = Math.min(100, (totalLocalStorageBytes / estimatedQuotaBytes) * 100);

  return {
    totalLocalStorageBytes,
    totalLocalStorageFormatted: formatBytes(totalLocalStorageBytes),
    estimatedQuotaBytes,
    usagePercentage: parseFloat(usagePercentage.toFixed(1)),
    logKeysCount: logKeysStats.length,
    logKeysTotalBytes,
    logKeysFormatted: formatBytes(logKeysTotalBytes),
    logKeysStats,
  };
}

/**
 * Core Enforcer: Enforces the 7-day retention policy and storage capacity limits across all local log keys
 */
export async function enforceLogRetention(maxDays = 7, force = false): Promise<LogRetentionResult> {
  const savedPref = localStorage.getItem(AUTO_PURGE_PREF_KEY);
  const autoPurgeEnabled = savedPref !== null ? savedPref === 'true' : true;

  if (!autoPurgeEnabled && !force) {
    const metrics = getLogStorageMetrics();
    return {
      timestamp: new Date().toISOString(),
      autoPurgeEnabled: false,
      totalStorageSizeBytes: metrics.totalLocalStorageBytes,
      totalStorageSizeFormatted: metrics.totalLocalStorageFormatted,
      totalLogsPurged: 0,
      bytesFreed: 0,
      bytesFreedFormatted: '0 B',
      auditedKeysCount: 0,
      purgedKeys: [],
      retentionWindowDays: maxDays,
      status: 'DISABLED',
    };
  }

  const cutoffTime = Date.now() - (maxDays * 24 * 60 * 60 * 1000);
  const logKeys = discoverLogKeys();
  let totalLogsPurged = 0;
  let totalBytesFreed = 0;
  const purgedKeys: LogRetentionResult['purgedKeys'] = [];

  for (const key of logKeys) {
    try {
      const rawValue = localStorage.getItem(key);
      if (!rawValue) continue;

      const beforeSizeBytes = (key.length + rawValue.length) * 2;
      let logs: any[];
      try {
        if (isEncrypted(rawValue)) {
          const decrypted = await decryptData(rawValue);
          logs = JSON.parse(decrypted);
        } else {
          logs = JSON.parse(rawValue);
        }
        if (!Array.isArray(logs)) continue;
      } catch {
        // Not a JSON array log store
        continue;
      }

      const beforeCount = logs.length;

      // Filter logs by timestamp
      let validLogs = logs.filter((logItem: any) => {
        if (!logItem || typeof logItem !== 'object') return true;
        const timeVal = logItem.timestamp || logItem.created_at || logItem.time || logItem.sent_at || logItem.date;
        if (!timeVal) return true; // Retain logs missing timestamps to prevent data loss
        const itemTime = new Date(timeVal).getTime();
        return isNaN(itemTime) || itemTime >= cutoffTime;
      });

      // Capacity enforcement: if size exceeds MAX_KEY_LOG_SIZE_BYTES, slice down to most recent 50 logs
      let serialized = JSON.stringify(validLogs);
      
      // If the original was encrypted, or if it's a key that MUST be encrypted (like system error logs), re-encrypt
      const wasEncrypted = isEncrypted(rawValue);
      const mustEncrypt = key === '9xen-regulettee_system_error_logs';
      let outputValue = (wasEncrypted || mustEncrypt) ? await encryptData(serialized) : serialized;
      let afterSizeBytes = (key.length + outputValue.length) * 2;

      if (afterSizeBytes > MAX_KEY_LOG_SIZE_BYTES && validLogs.length > 50) {
        validLogs = validLogs.slice(0, 50);
        serialized = JSON.stringify(validLogs);
        outputValue = wasEncrypted ? await encryptData(serialized) : serialized;
        afterSizeBytes = (key.length + outputValue.length) * 2;
      }

      const afterCount = validLogs.length;
      const purgedCount = beforeCount - afterCount;
      const bytesFreed = Math.max(0, beforeSizeBytes - afterSizeBytes);

      if (purgedCount > 0 || bytesFreed > 0) {
        localStorage.setItem(key, outputValue);
        totalLogsPurged += purgedCount;
        totalBytesFreed += bytesFreed;

        purgedKeys.push({
          key,
          beforeCount,
          afterCount,
          purgedCount,
          beforeSizeBytes,
          afterSizeBytes,
        });
      }
    } catch (err) {
      console.error(`[LogRetentionWorker] Error processing log key '${key}':`, err);
    }
  }

  // Update last purge timestamp
  localStorage.setItem(LAST_PURGE_TIMESTAMP_KEY, new Date().toISOString());

  const currentMetrics = getLogStorageMetrics();
  const status: LogRetentionResult['status'] = 
    currentMetrics.usagePercentage > 80 ? 'WARNING_QUOTA_HIGH' :
    totalLogsPurged > 0 ? 'CLEANED' : 'OPTIMAL';

  const result: LogRetentionResult = {
    timestamp: new Date().toISOString(),
    autoPurgeEnabled,
    totalStorageSizeBytes: currentMetrics.totalLocalStorageBytes,
    totalStorageSizeFormatted: currentMetrics.totalLocalStorageFormatted,
    totalLogsPurged,
    bytesFreed: totalBytesFreed,
    bytesFreedFormatted: formatBytes(totalBytesFreed),
    auditedKeysCount: logKeys.length,
    purgedKeys,
    retentionWindowDays: maxDays,
    status,
  };

  // Dispatch custom event for reactive UI listeners across the application
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('9xen-regulettee_log_retention_enforced', { detail: result }));
  }

  return result;
}

let isWorkerInitialized = false;
let checkIntervalTimer: any = null;

/**
 * Initializes the background log retention daemon on application startup.
 */
export function initLogRetentionWorker(): void {
  if (isWorkerInitialized) return;
  isWorkerInitialized = true;

  console.log('[LogRetentionWorker] Background log retention daemon active.');

  const runRetentionSweep = async () => {
    try {
      const savedDays = localStorage.getItem(RETENTION_DAYS_KEY);
      const maxDays = savedDays ? parseInt(savedDays, 10) : 7;
      const result = await enforceLogRetention(maxDays, false);
      if (result.totalLogsPurged > 0) {
        console.log(`[LogRetentionWorker] Background retention sweep complete: Purged ${result.totalLogsPurged} stale log(s) (${result.bytesFreedFormatted} freed, window: ${maxDays}d).`);
      }
    } catch (err) {
      console.warn('[LogRetentionWorker] Retention sweep failed:', err);
    }
  };

  // Non-blocking initialization via requestIdleCallback or setTimeout
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runRetentionSweep, { timeout: 3000 });
  } else {
    setTimeout(runRetentionSweep, 800);
  }

  // Background interval check every 30 minutes
  if (typeof window !== 'undefined') {
    if (checkIntervalTimer) clearInterval(checkIntervalTimer);
    checkIntervalTimer = setInterval(runRetentionSweep, 30 * 60 * 1000);

    // Run check on tab refocus
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        runRetentionSweep();
      }
    });
  }
}

// Auto-initialize background retention daemon upon module import
if (typeof window !== 'undefined') {
  initLogRetentionWorker();
}
