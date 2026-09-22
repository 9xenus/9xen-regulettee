/**
 * Storage Namespace Cleanup Utility
 * Provides granular storage clearing mechanisms for Sessions, Settings/Preferences,
 * Diagnostic Logs, Query Cache, and Total Hard Reset.
 */

import { decryptData, isEncrypted } from '../lib/cryptoUtils';

export interface StorageSavingsResult {
  currentSizeKb: number;
  currentLogCount: number;
  projections: {
    daysTightened: number; // e.g. 1, 3, 5
    newDays: number;       // new retention days
    projectedSizeKb: number;
    savingsKb: number;
    savingsPercentage: number;
    estimatedMonthlySavingsMb: number; // simulated busy-tenant 30-day extrapolation
  }[];
}

export async function calculateStorageSavingsProjection(currentRetentionDays: number): Promise<StorageSavingsResult> {
  const result: StorageSavingsResult = {
    currentSizeKb: 0,
    currentLogCount: 0,
    projections: []
  };

  try {
    const rawLogs = localStorage.getItem('9xen-regulettee_system_error_logs');
    let logs: any[] = [];
    
    if (rawLogs) {
      if (isEncrypted(rawLogs)) {
        try {
          const decrypted = await decryptData(rawLogs);
          logs = JSON.parse(decrypted);
        } catch {
          // Fallback if decryption fails
        }
      } else {
        try {
          logs = JSON.parse(rawLogs);
        } catch {
          // Fallback if parsing fails
        }
      }
      
      const rawSizeInBytes = new Blob([rawLogs]).size || rawLogs.length;
      result.currentSizeKb = Math.round((rawSizeInBytes / 1024) * 10) / 10;
    }
    
    result.currentLogCount = logs.length;

    // Extrapolate a busy production tenant daily error generation rate
    // (e.g., 250 errors/day, average 1.2 KB per log = ~300 KB / day)
    const DAILY_VOLUME_KB = 300; 

    const tiers = [1, 3, 5];
    for (const t of tiers) {
      const newDays = Math.max(1, currentRetentionDays - t);
      const cutoff = Date.now() - newDays * 24 * 60 * 60 * 1000;
      
      // Filter current logs
      const filtered = logs.filter((log: any) => {
        const logTime = log.timestamp ? new Date(log.timestamp).getTime() : Date.now();
        return logTime > cutoff;
      });

      const serialized = JSON.stringify(filtered);
      const projectedSizeInBytes = new Blob([serialized]).size || serialized.length;
      const projectedSizeKb = Math.round((projectedSizeInBytes / 1024) * 10) / 10;

      const savingsKb = Math.max(0, result.currentSizeKb - projectedSizeKb);
      const savingsPercentage = result.currentSizeKb > 0 
        ? Math.round((savingsKb / result.currentSizeKb) * 100) 
        : Math.round((t / currentRetentionDays) * 100);

      // EXTENDED BUSINESS VALUE: Estimated Monthly Savings in MB on busy server nodes
      // (daily savings * 30 days)
      const dailySavingsKb = t * (DAILY_VOLUME_KB / currentRetentionDays);
      const estimatedMonthlySavingsMb = Math.round(((dailySavingsKb * 30) / 1024) * 10) / 10;

      result.projections.push({
        daysTightened: t,
        newDays,
        projectedSizeKb: Math.round(projectedSizeKb * 10) / 10,
        savingsKb: Math.round(savingsKb * 10) / 10,
        savingsPercentage: Math.min(100, Math.max(0, savingsPercentage)),
        estimatedMonthlySavingsMb
      });
    }
  } catch (err) {
    console.warn('Error calculating storage savings projection:', err);
  }

  return result;
}

export type StorageNamespace = 'sessions' | 'settings' | 'logs' | 'cache' | 'all';

export interface StorageNamespaceInfo {
  id: StorageNamespace;
  actionKey: string;
  name: string;
  shortLabel: string;
  description: string;
  badge: string;
  badgeColor: string;
  iconName?: string;
  keysPattern: string[];
}

export const STORAGE_NAMESPACES: Record<StorageNamespace, StorageNamespaceInfo> = {
  sessions: {
    id: 'sessions',
    actionKey: 'clear_sessions',
    name: 'User & Auth Sessions',
    shortLabel: 'Clear Sessions',
    description: 'Clears active authentication tokens, logged-in session data, and user roles.',
    badge: 'Auth',
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    keysPattern: [
      'sovereign_sessions',
      'sovereign_registered_users',
      'user_token',
      'session_token',
      'auth_token',
      '9xen-regulettee_session',
      'sovereign_auth',
      'last_active_timestamp',
      'active_role',
      'active_tenant',
      'current_user'
    ]
  },
  settings: {
    id: 'settings',
    actionKey: 'clear_settings',
    name: 'Preferences & UI Settings',
    shortLabel: 'Clear Settings',
    description: 'Resets regional overrides, UI language, custom dashboard widgets, and feature flags.',
    badge: 'Settings',
    badgeColor: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50',
    keysPattern: [
      'app_global_country',
      'app_ui_language',
      'auto_translation_locked',
      '9xen-regulettee_user_region_override',
      '9xen-regulettee_verified_controls',
      'client_dashboard_custom_widgets',
      'b2g_advanced_config',
      'policy_tier',
      'sovereign_plan_',
      'entitlement_overrides_'
    ]
  },
  logs: {
    id: 'logs',
    actionKey: 'clear_logs',
    name: 'System & Error Logs',
    shortLabel: 'Clear Logs',
    description: 'Purges captured error logs, network latency history, and diagnostic telemetry.',
    badge: 'Diagnostics',
    badgeColor: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50',
    keysPattern: [
      '9xen-regulettee_system_error_logs',
      '9xen-regulettee_network_latency_logs',
      'b2g_email_logs',
      '9xen-regulettee_audit_logs',
      'audit_logs',
      'console_logs',
      'telemetry_cache'
    ]
  },
  cache: {
    id: 'cache',
    actionKey: 'clear_cache',
    name: 'API & Query Cache',
    shortLabel: 'Clear Cache',
    description: 'Flushes transient query cache, offline data buffers, and temporary UI states.',
    badge: 'Cache',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
    keysPattern: [
      'cache_',
      'api_cache_',
      'offline_queue',
      'temp_',
      'sw_'
    ]
  },
  all: {
    id: 'all',
    actionKey: 'clear_all',
    name: 'Total Storage Reset (Hard Clear)',
    shortLabel: 'Total Clear (All)',
    description: 'Completely purges all localStorage and sessionStorage keys for a clean slate.',
    badge: 'Hard Reset',
    badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700/50',
    keysPattern: []
  }
};

/**
 * Executes granular storage clearing for the requested namespace.
 * Returns the list of deleted keys and total count.
 */
export function clearStorageNamespace(namespace: StorageNamespace): { removedKeys: string[]; count: number } {
  const removedKeys: string[] = [];

  try {
    if (namespace === 'all') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) removedKeys.push(key);
      }
      localStorage.clear();
      sessionStorage.clear();
      return { removedKeys, count: removedKeys.length };
    }

    const info = STORAGE_NAMESPACES[namespace];
    if (!info) return { removedKeys: [], count: 0 };

    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    for (const key of allKeys) {
      let match = false;

      for (const pattern of info.keysPattern) {
        if (key === pattern || key.startsWith(pattern) || key.includes(pattern)) {
          match = true;
          break;
        }
      }

      if (match) {
        localStorage.removeItem(key);
        removedKeys.push(key);
      }
    }

    // Sessions namespace also clears sessionStorage tokens
    if (namespace === 'sessions') {
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Unable to clear sessionStorage', e);
      }
    }
  } catch (err) {
    console.error(`Error clearing storage namespace '${namespace}':`, err);
  }

  return { removedKeys, count: removedKeys.length };
}
