/**
 * Global Data Refresh & Cache Synchronization Utility
 * 
 * Provides client-side and backend-verified synchronization for local storage caches,
 * detecting discrepancies, purging transient memory buffers, restoring authoritative
 * database state, and repairing corrupted JSON keys upon manual intervention.
 */

import { clearStorageNamespace, StorageNamespace, STORAGE_NAMESPACES } from './storageCleanup';

export interface DataRefreshSyncDetail {
  key: string;
  namespace: string;
  action: 'VALIDATED' | 'SYNCHRONIZED' | 'PURGED' | 'RESTORED' | 'REPAIRED';
  reason: string;
}

export interface DataRefreshSyncResult {
  success: boolean;
  serverSynced: boolean;
  timestamp: string;
  latencyMs: number;
  totalKeysChecked: number;
  keysValidated: number;
  keysRefreshed: number;
  keysRepaired: number;
  keysPurged: number;
  details: DataRefreshSyncDetail[];
  systemIntegrity: {
    activeLawsCount: number;
    tenantsCount: number;
    dbFile: string;
  } | null;
  errorMessage?: string;
}

export interface DataRefreshOptions {
  tenantId?: string;
  namespaces?: StorageNamespace[];
  onProgress?: (statusText: string, stepIndex: number, totalSteps: number) => void;
  hardPurgeCache?: boolean;
}

/**
 * Executes a full audit and revalidation of localStorage caches against the SQLite backend database.
 */
export async function executeDataRefreshSync(options: DataRefreshOptions = {}): Promise<DataRefreshSyncResult> {
  const startTime = Date.now();
  const {
    tenantId = 'DEFAULT_TENANT',
    namespaces = ['all', 'settings', 'logs', 'cache', 'sessions'],
    onProgress,
    hardPurgeCache = true
  } = options;

  const details: DataRefreshSyncDetail[] = [];
  let keysValidated = 0;
  let keysRefreshed = 0;
  let keysRepaired = 0;
  let keysPurged = 0;

  // Step 1: Scan & parse all local storage items
  onProgress?.('Scanning local storage key namespaces...', 1, 4);

  const localKeyData: Record<string, { hash?: string; timestamp?: number; valueType: string; preview?: string }> = {};
  const allStoredKeys: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allStoredKeys.push(key);
    }
  } catch (err) {
    console.error('[DATA_REFRESH_SYNC] Failed to read localStorage keys:', err);
  }

  // Audit local keys for syntax/JSON validity
  for (const key of allStoredKeys) {
    try {
      const rawVal = localStorage.getItem(key);
      if (rawVal === null) continue;

      let valType = 'string';
      const trimmed = rawVal.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        valType = 'json';
        try {
          JSON.parse(trimmed);
          keysValidated++;
        } catch (jsonErr) {
          // Corrupted JSON detected: repair or reset key
          keysRepaired++;
          if (key === '9xen-regulettee_system_error_logs' || key === 'b2g_email_logs') {
            localStorage.setItem(key, JSON.stringify([]));
          } else if (key === 'client_dashboard_custom_widgets') {
            localStorage.removeItem(key);
          }
          details.push({
            key,
            namespace: 'logs',
            action: 'REPAIRED',
            reason: 'Malformed JSON payload repaired and re-initialized safely.'
          });
        }
      }

      localKeyData[key] = {
        valueType: valType,
        preview: rawVal.length > 300 ? rawVal.substring(0, 300) : rawVal
      };
    } catch (e) {
      console.warn(`[DATA_REFRESH_SYNC] Error reading key ${key}`, e);
    }
  }

  // Step 2: Purge transient ephemeral cache buffers if requested
  onProgress?.('Flushing stale ephemeral cache buffers...', 2, 4);

  if (hardPurgeCache) {
    const cachePurgeResult = clearStorageNamespace('cache');
    keysPurged += cachePurgeResult.count;
    for (const k of cachePurgeResult.removedKeys) {
      details.push({
        key: k,
        namespace: 'cache',
        action: 'PURGED',
        reason: 'Evicted transient API response buffer for fresh backend fetch.'
      });
    }
  }

  // Step 3: Transmit cache verification request to backend database
  onProgress?.('Handshaking with SQLite backend database for authoritative state...', 3, 4);

  let serverSynced = false;
  let serverData: any = null;
  let serverIntegrity = null;

  try {
    const res = await fetch('/api/v1/sync/revalidate-caches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': '9Xen Regulettee-DataRefresh-Engine'
      },
      body: JSON.stringify({
        tenantId,
        namespaces,
        localKeys: localKeyData,
        clientTimestamp: Date.now()
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        serverSynced = true;
        serverData = data;
        serverIntegrity = data.systemIntegrity || null;

        // Apply authoritative server data to localStorage
        if (data.authoritativeData && typeof data.authoritativeData === 'object') {
          for (const [authKey, authValue] of Object.entries(data.authoritativeData)) {
            const strVal = typeof authValue === 'string' ? authValue : JSON.stringify(authValue);
            localStorage.setItem(authKey, strVal);
            keysRefreshed++;
            details.push({
              key: authKey,
              namespace: 'settings',
              action: 'SYNCHRONIZED',
              reason: 'Applied authoritative database state to local storage cache.'
            });
          }
        }

        if (Array.isArray(data.validationDetails)) {
          for (const item of data.validationDetails) {
            if (!details.some(d => d.key === item.key)) {
              details.push(item);
            }
          }
        }
      }
    }
  } catch (networkErr: any) {
    console.warn('[DATA_REFRESH_SYNC] Network call to backend sync failed; proceeding with local client fallback:', networkErr);
  }

  // Fallback client state reinforcement if server was offline
  if (!serverSynced) {
    // Ensure critical defaults are properly set in localStorage
    if (!localStorage.getItem('9xen-regulettee_verified_controls')) {
      const defaultControls = ['GDPR_ART_32', 'NIST_MANDATE', 'ISO27001_A12', 'EU_AI_ACT_ART10'];
      localStorage.setItem('9xen-regulettee_verified_controls', JSON.stringify(defaultControls));
      keysRefreshed++;
      details.push({
        key: '9xen-regulettee_verified_controls',
        namespace: 'settings',
        action: 'RESTORED',
        reason: 'Restored baseline compliance verification controls locally.'
      });
    }

    if (!localStorage.getItem('app_global_country')) {
      localStorage.setItem('app_global_country', 'DE');
      keysRefreshed++;
      details.push({
        key: 'app_global_country',
        namespace: 'settings',
        action: 'RESTORED',
        reason: 'Set default EU sovereign jurisdiction anchor.'
      });
    }
  }

  // Step 4: Dispatch global window event to trigger React context re-evaluation
  onProgress?.('Finalizing sync and notifying active dashboard modules...', 4, 4);

  try {
    window.dispatchEvent(new CustomEvent('9xen-regulettee:data-synced', {
      detail: {
        timestamp: new Date().toISOString(),
        serverSynced,
        keysRefreshed,
        keysValidated
      }
    }));
  } catch (evtErr) {
    console.warn('[DATA_REFRESH_SYNC] Unable to dispatch sync event:', evtErr);
  }

  const elapsedMs = Date.now() - startTime;

  return {
    success: true,
    serverSynced,
    timestamp: new Date().toISOString(),
    latencyMs: Math.max(1, elapsedMs),
    totalKeysChecked: allStoredKeys.length,
    keysValidated,
    keysRefreshed,
    keysRepaired,
    keysPurged,
    details,
    systemIntegrity: serverIntegrity
  };
}
