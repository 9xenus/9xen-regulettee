import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export interface TenantWorkspaceItem {
  id: string;
  name: string;
  region: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'SUSPENDED' | 'GLOBAL' | string;
  tier: string;
  phase?: string;
  activeActs?: string[];
  complianceHealth?: number;
  riskScore?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dpoContact?: string;
  lastSync?: string;
}

const DEFAULT_TENANTS: TenantWorkspaceItem[] = [
  {
    id: "org_1",
    name: "Acme Corporation Europe",
    region: "EU-CENTRAL-1",
    status: "ACTIVE",
    tier: "Enterprise",
    phase: "Production Phase 3",
    activeActs: ["GDPR", "DORA", "NIS2", "EU_AI_ACT"],
    complianceHealth: 98,
    riskScore: "LOW",
    dpoContact: "dpo@acme.eu",
    lastSync: "Just now"
  },
  {
    id: "org_2",
    name: "Stark Industries GmbH",
    region: "EU-WEST-1",
    status: "ACTIVE",
    tier: "Pro",
    phase: "Production",
    activeActs: ["GDPR", "NIS2"],
    complianceHealth: 92,
    riskScore: "MEDIUM",
    dpoContact: "privacy@stark.de",
    lastSync: "2 mins ago"
  },
  {
    id: "org_3",
    name: "Global Finance Corp",
    region: "EU-CENTRAL-1",
    status: "SUSPENDED",
    tier: "Enterprise",
    phase: "Audit Underway",
    activeActs: ["DORA", "MICA"],
    complianceHealth: 64,
    riskScore: "HIGH",
    dpoContact: "compliance@globalfinance.com",
    lastSync: "15 mins ago"
  },
  {
    id: "org_4",
    name: "Beta Innovations B.V.",
    region: "EU-CENTRAL-1",
    status: "ONBOARDING",
    tier: "Pro",
    phase: "Phase 1 - Data Mapping",
    activeActs: ["GDPR", "EU_AI_ACT"],
    complianceHealth: 85,
    riskScore: "MEDIUM",
    dpoContact: "dpo@betainnovations.nl",
    lastSync: "1 hour ago"
  },
  {
    id: "tenant_1",
    name: "Acme Financial EU",
    region: "EU-CENTRAL-1",
    status: "ACTIVE",
    tier: "Enterprise",
    phase: "Production",
    activeActs: ["GDPR", "DORA", "NIS2"],
    complianceHealth: 96,
    riskScore: "LOW",
    dpoContact: "legal@acmefin.eu",
    lastSync: "5 mins ago"
  },
  {
    id: "tenant_2",
    name: "Global Health Systems",
    region: "EU-WEST-1",
    status: "ACTIVE",
    tier: "Pro",
    phase: "Production",
    activeActs: ["GDPR", "EHDS", "NIS2"],
    complianceHealth: 94,
    riskScore: "LOW",
    dpoContact: "privacy@globalhealth.eu",
    lastSync: "8 mins ago"
  },
  {
    id: "tenant_3",
    name: "TechStartup AI Labs",
    region: "EU-CENTRAL-1",
    status: "ACTIVE",
    tier: "Basic",
    phase: "Production",
    activeActs: ["GDPR", "EU_AI_ACT"],
    complianceHealth: 90,
    riskScore: "LOW",
    dpoContact: "founders@techstartup.ai",
    lastSync: "12 mins ago"
  },
  {
    id: "org_global",
    name: "9Xen Regulettee Sovereign HQ Enclave",
    region: "GLOBAL-HQ",
    status: "GLOBAL",
    tier: "Sovereign Admin",
    phase: "Master HQ Enclave",
    activeActs: ["ALL_FRAMEWORKS"],
    complianceHealth: 100,
    riskScore: "LOW",
    dpoContact: "sovereign-admin@regulettee.eu",
    lastSync: "Realtime Stream"
  }
];

interface TenantContextType {
  tenants: TenantWorkspaceItem[];
  activeTenant: TenantWorkspaceItem;
  switchTenant: (tenantId: string) => TenantWorkspaceItem | undefined;
  addTenant: (tenant: TenantWorkspaceItem) => void;
  updateTenantStatus: (tenantId: string, status: string) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const STORAGE_TENANT_LIST_KEY = 'platform_tenants_list';
const STORAGE_ACTIVE_TENANT_KEY = 'active_tenant_workspace';

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<TenantWorkspaceItem[]>(() => {
    try {
      const savedList = localStorage.getItem(STORAGE_TENANT_LIST_KEY);
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge defaults with saved list to ensure full fidelity
          const combined = [...parsed, ...DEFAULT_TENANTS];
          const uniqueMap = new Map<string, TenantWorkspaceItem>();
          combined.forEach(t => {
            if (!uniqueMap.has(t.id)) {
              uniqueMap.set(t.id, t);
            }
          });
          return Array.from(uniqueMap.values());
        }
      }
    } catch (e) {
      console.error('[TenantContext] Failed to load tenant list from storage:', e);
    }
    return DEFAULT_TENANTS;
  });

  const [activeTenant, setActiveTenant] = useState<TenantWorkspaceItem>(() => {
    try {
      const savedActive = localStorage.getItem(STORAGE_ACTIVE_TENANT_KEY);
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        if (parsed && parsed.id) {
          // Match with latest list if possible
          const found = tenants.find(t => t.id === parsed.id);
          if (found) return found;
          return parsed;
        }
      }
    } catch (e) {
      console.error('[TenantContext] Failed to load active tenant from storage:', e);
    }
    return DEFAULT_TENANTS[0];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync list to localStorage when tenants change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TENANT_LIST_KEY, JSON.stringify(tenants));
    } catch (e) {
      console.error('[TenantContext] Error saving tenant list:', e);
    }
  }, [tenants]);

  // Sync activeTenant to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_TENANT_KEY, JSON.stringify(activeTenant));
    } catch (e) {
      console.error('[TenantContext] Error saving active tenant:', e);
    }
  }, [activeTenant]);

  const switchTenant = (tenantId: string): TenantWorkspaceItem | undefined => {
    const target = tenants.find(t => t.id === tenantId);
    if (!target) {
      console.warn(`[TenantContext] Target tenant ${tenantId} not found.`);
      return undefined;
    }

    setIsLoading(true);
    setActiveTenant(target);

    try {
      localStorage.setItem(STORAGE_ACTIVE_TENANT_KEY, JSON.stringify(target));
      
      // Dispatch custom browser event so components can re-fetch or adjust tenant-scoped data
      window.dispatchEvent(new CustomEvent('tenant-workspace-changed', {
        detail: {
          tenant: target,
          previousTenantId: activeTenant.id,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (e) {
      console.error('[TenantContext] Failed to switch tenant workspace:', e);
    } finally {
      setIsLoading(false);
    }

    return target;
  };

  const addTenant = (newTenant: TenantWorkspaceItem) => {
    setTenants(prev => {
      const exists = prev.some(t => t.id === newTenant.id);
      if (exists) {
        return prev.map(t => t.id === newTenant.id ? { ...t, ...newTenant } : t);
      }
      return [newTenant, ...prev];
    });
  };

  const updateTenantStatus = (tenantId: string, status: string) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status } : t));
    if (activeTenant.id === tenantId) {
      setActiveTenant(prev => ({ ...prev, status }));
    }
  };

  const value = useMemo(() => ({
    tenants,
    activeTenant,
    switchTenant,
    addTenant,
    updateTenantStatus,
    isLoading
  }), [tenants, activeTenant, isLoading]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
