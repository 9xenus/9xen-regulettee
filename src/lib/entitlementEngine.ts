// Entitlement Engine - Backend Service Logic & Shared Types

// Database Schema (Logical Representation)
export interface ModuleMaster {
  module_key: string;
  name: string;
  description: string;
  category: string;
  default_status: string;
  base_price: number;
}

export interface TenantEntitlement extends ModuleMaster {
  status: "ACTIVE" | "EXPIRED" | "LOCKED" | "DISABLED";
  valid_until?: string;
  custom_limits?: string;
  price: number;
}

// Legacy types for compatibility
export interface ActCardResponse {
  actId: string;
  name: string;
  status: "enabled" | "disabled" | "upgrade" | "skip";
  enabled: boolean;
  price: number;
  planInclusion: "included" | "add-on";
  lastCheckedDate: string;
  applicabilityScore: number;
  skipReason?: string;
}

export const REGULATION_ACTS = [
  { id: "GDPR", name: "GDPR", type: "Core Privacy", price: 0 },
  { id: "AI_ACT", name: "EU AI Act", type: "Technology", price: 299 },
];

export const MOCK_TENANTS = [
  { id: "org_1", name: "Acme Corporation Europe", tier: "Pro", industry: "Technology" },
  { id: "tenant_1", name: "Acme Financial EU", plan: "enterprise", industry: "Finance" },
];

export class EntitlementEngineService {
  private apiUrl = '/api/v1/entitlements';
  public basePrices = { basic: 99, pro: 499, enterprise: 1999 };

  public async getModulesMaster(): Promise<ModuleMaster[]> {
    try {
      const res = await fetch(`${this.apiUrl}/modules`);
      const data = await res.json();
      return data.modules || [];
    } catch (err) {
      console.error('Failed to fetch modules master:', err);
      return [];
    }
  }

  public async getTenantEntitlements(tenantId: string): Promise<TenantEntitlement[]> {
    try {
      const res = await fetch(`${this.apiUrl}/tenant/${tenantId}`);
      const data = await res.json();
      return data.entitlements || [];
    } catch (err) {
      console.error('Failed to fetch tenant entitlements:', err);
      return [];
    }
  }

  public async getPlans(): Promise<any[]> {
    try {
      const res = await fetch(`${this.apiUrl}/plans`);
      const data = await res.json();
      return data.plans || [];
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      return [];
    }
  }

  public async applyPlan(tenantId: string, planKey: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiUrl}/tenant/${tenantId}/apply-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_key: planKey })
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Failed to apply plan:', err);
      return false;
    }
  }

  public async toggleTenantModule(tenantId: string, moduleKey: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiUrl}/tenant/${tenantId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_key: moduleKey, status })
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Failed to toggle tenant module:', err);
      return false;
    }
  }

  public async getActiveModules(tenantId: string): Promise<string[]> {
    const entitlements = await this.getTenantEntitlements(tenantId);
    return entitlements
      .filter(e => e.status === 'ACTIVE')
      .map(e => e.module_key);
  }

  // Legacy sync methods for compatibility (returning mock/empty data to prevent crashes)
  public getTenantRegulations(tenantId: string): ActCardResponse[] {
    return [];
  }

  public calculateMonthlyCost(tenantId: string): number {
    return 0;
  }

  public setFeatureToggle(tenantId: string, actId: string, enabled: boolean) {
    // No-op for legacy
  }

  public getMasterRegulations() {
    return REGULATION_ACTS;
  }

  public updateTenantEntitlement(tenantId: string, actId: string, updates: any) {
    // No-op
  }
}

export const entitlementService = new EntitlementEngineService();
