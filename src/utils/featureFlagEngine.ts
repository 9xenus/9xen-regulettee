import { fetchWithRetry } from '../lib/api-client';

export interface FeatureFlagItem {
  key: string;
  name: string;
  category: 'AI_SAFETY' | 'SOVEREIGN_ROUTING' | 'CRYPTOGRAPHY' | 'B2G_COMPLIANCE' | 'SYSTEM';
  description: string;
  isEnabled: boolean;
  circuitBreakerActive: boolean;
  targetTenants: string[]; // 'ALL' or specific tenant IDs
  updatedAt: string;
}

export class FeatureFlagEngine {
  // Sync version for immediate local cache access
  static getFeatureFlags(): FeatureFlagItem[] {
    try {
      const stored = localStorage.getItem('9xen-regulettee_feature_flags');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  // Async version to fetch from DB
  static async fetchFeatureFlagsAsync(): Promise<FeatureFlagItem[]> {
    try {
      const res = await fetchWithRetry('/api/v1/feature-flags');
      const data = await res.json();
      if (data.success && data.flags) {
        localStorage.setItem('9xen-regulettee_feature_flags', JSON.stringify(data.flags));
        return data.flags;
      }
    } catch (err) {
      console.error('Failed to fetch feature flags from backend:', err);
    }
    return this.getFeatureFlags(); // fallback to local
  }

  static async updateFlagAsync(key: string, payload: Partial<FeatureFlagItem>): Promise<FeatureFlagItem[]> {
    try {
      await fetchWithRetry(`/api/v1/feature-flags/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Re-fetch to guarantee state consistency with DB
      return await this.fetchFeatureFlagsAsync();
    } catch (err) {
      console.error('Failed to update feature flag:', err);
      return this.getFeatureFlags();
    }
  }

  static toggleFlag(key: string): FeatureFlagItem[] {
    const flags = this.getFeatureFlags();
    const updated = flags.map(f => {
      if (f.key === key) {
        const isEnabled = !f.isEnabled;
        this.updateFlagAsync(key, { isEnabled });
        return { ...f, isEnabled, updatedAt: new Date().toISOString() };
      }
      return f;
    });
    localStorage.setItem('9xen-regulettee_feature_flags', JSON.stringify(updated));
    return updated;
  }

  static toggleCircuitBreaker(key: string): FeatureFlagItem[] {
    const flags = this.getFeatureFlags();
    const updated = flags.map(f => {
      if (f.key === key) {
        const circuitBreakerActive = !f.circuitBreakerActive;
        this.updateFlagAsync(key, { circuitBreakerActive });
        return { ...f, circuitBreakerActive, updatedAt: new Date().toISOString() };
      }
      return f;
    });
    localStorage.setItem('9xen-regulettee_feature_flags', JSON.stringify(updated));
    return updated;
  }

  static isEnabled(key: string, tenantId?: string): boolean {
    const flags = this.getFeatureFlags();
    const flag = flags.find(f => f.key === key);
    if (!flag || !flag.isEnabled) return false;
    if (flag.circuitBreakerActive) return false;
    if (flag.targetTenants.includes('ALL')) return true;
    if (tenantId && flag.targetTenants.includes(tenantId)) return true;
    return false;
  }
}
