import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useJurisdiction } from './JurisdictionContext';
import { 
  RegionKey, 
  RegionalFramework, 
  DetectedUserRegion, 
  REGIONAL_FRAMEWORKS, 
  detectUserRegion, 
  calculateRegionalStatutoryLiability 
} from '../services/regionalComplianceRulesEngine';

interface RegionalComplianceContextType {
  activeRegion: RegionKey;
  detectedRegion: DetectedUserRegion;
  framework: RegionalFramework;
  allRegions: Array<{
    key: RegionKey;
    displayName: string;
    flag: string;
    currency: string;
    currencySymbol: string;
    dataCenter: string;
    actCount: number;
    ruleCount: number;
  }>;
  setActiveRegion: (region: RegionKey) => void;
  resetToDetectedRegion: () => void;
  isOverridden: boolean;
  checkedControls: Record<string, boolean>;
  toggleControlCheck: (controlId: string) => void;
  simulateLiability: (revenueEur?: number, records?: number, severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => ReturnType<typeof calculateRegionalStatutoryLiability>;
  complianceScore: number;
}

const RegionalComplianceContext = createContext<RegionalComplianceContextType | undefined>(undefined);

export const RegionalComplianceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const { country, setCountry } = useJurisdiction();

  // Run intelligent detection on mount or when user metadata / global country changes
  const detected = useMemo(() => {
    return detectUserRegion(user, session);
  }, [user, session]);

  const [activeRegion, setActiveRegionState] = useState<RegionKey>(() => {
    const saved = localStorage.getItem('9xen-regulettee_user_region_override');
    if (saved && REGIONAL_FRAMEWORKS[saved as RegionKey]) {
      return saved as RegionKey;
    }
    return detected.regionKey;
  });

  // Track checked controls in local storage
  const [checkedControls, setCheckedControls] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('9xen-regulettee_verified_controls');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keep state synced if detection changes and no explicit override is set
  useEffect(() => {
    const savedOverride = localStorage.getItem('9xen-regulettee_user_region_override');
    if (!savedOverride) {
      setActiveRegionState(detected.regionKey);
    }
  }, [detected.regionKey]);

  const setActiveRegion = useCallback((region: RegionKey) => {
    setActiveRegionState(region);
    localStorage.setItem('9xen-regulettee_user_region_override', region);

    // Synchronize global country code in JurisdictionContext if relevant
    if (region === 'KSA' && country !== 'SA') setCountry('SA');
    else if (region === 'UAE' && country !== 'AE') setCountry('AE');
    else if (region === 'USA' && country !== 'US-CA') setCountry('US-CA');
    else if (region === 'CANADA' && country !== 'CA') setCountry('CA');
    else if (region === 'AFRICA' && country !== 'ZA') setCountry('ZA');
    else if (region === 'EU' && country !== 'EU') setCountry('EU');
  }, [country, setCountry]);

  const resetToDetectedRegion = useCallback(() => {
    localStorage.removeItem('9xen-regulettee_user_region_override');
    setActiveRegionState(detected.regionKey);
  }, [detected.regionKey]);

  const isOverridden = useMemo(() => {
    return activeRegion !== detected.regionKey;
  }, [activeRegion, detected.regionKey]);

  const framework = useMemo(() => {
    return REGIONAL_FRAMEWORKS[activeRegion] || REGIONAL_FRAMEWORKS.EU;
  }, [activeRegion]);

  const allRegions = useMemo(() => {
    return (Object.keys(REGIONAL_FRAMEWORKS) as RegionKey[]).map(key => {
      const f = REGIONAL_FRAMEWORKS[key];
      const ruleCount = f.acts.reduce((acc, a) => acc + (a.rules ? a.rules.length : 0), 0);
      return {
        key,
        displayName: f.displayName,
        flag: f.primaryFlag,
        currency: f.currency,
        currencySymbol: f.currencySymbol,
        dataCenter: f.sovereignDataCenter,
        actCount: f.acts.length,
        ruleCount
      };
    });
  }, []);

  const toggleControlCheck = useCallback((controlId: string) => {
    setCheckedControls(prev => {
      const next = { ...prev, [controlId]: !prev[controlId] };
      localStorage.setItem('9xen-regulettee_verified_controls', JSON.stringify(next));
      return next;
    });
  }, []);

  const simulateLiability = useCallback((
    revenueEur: number = 50000000, 
    records: number = 50000, 
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
  ) => {
    return calculateRegionalStatutoryLiability(activeRegion, revenueEur, records, severity);
  }, [activeRegion]);

  // Compute live compliance readiness score for active region
  const complianceScore = useMemo(() => {
    const totalRules = framework.acts.reduce((acc, a) => acc + (a.rules ? a.rules.length : 0), 0);
    if (totalRules === 0) return 92;
    
    let checkedCount = 0;
    framework.acts.forEach(a => {
      a.rules.forEach(r => {
        if (checkedControls[r.ruleId]) {
          checkedCount++;
        }
      });
    });

    const baseline = 75; // baseline technical score
    const dynamic = Math.round((checkedCount / totalRules) * 25);
    return Math.min(100, baseline + dynamic);
  }, [framework, checkedControls]);

  return (
    <RegionalComplianceContext.Provider
      value={{
        activeRegion,
        detectedRegion: detected,
        framework,
        allRegions,
        setActiveRegion,
        resetToDetectedRegion,
        isOverridden,
        checkedControls,
        toggleControlCheck,
        simulateLiability,
        complianceScore
      }}
    >
      {children}
    </RegionalComplianceContext.Provider>
  );
};

export const useRegionalCompliance = () => {
  const context = useContext(RegionalComplianceContext);
  if (!context) {
    throw new Error('useRegionalCompliance must be used within a RegionalComplianceProvider');
  }
  return context;
};
