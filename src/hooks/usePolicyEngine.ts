import { useState, useEffect } from 'react';

const TIER_POLICIES: Record<string, string[]> = {
    'ecommerce': ['GDPR', 'PCI-DSS'],
    'fintech': ['GDPR', 'SOC2', 'DORA'],
    'healthtech': ['GDPR', 'HIPAA', 'EHDS'],
    'enterprise_ai': ['GDPR', 'SOC2', 'EU-AI-ACT', 'DORA']
};

const STORAGE_KEY = 'tenant_subscription_tier';

export const usePolicyEngine = () => {
    const [tier, setTier] = useState(() => localStorage.getItem(STORAGE_KEY) || 'fintech');

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                setTier(e.newValue || 'fintech');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const isPolicyEnabled = (policyCode: string): boolean => {
        const allowed = TIER_POLICIES[tier] || [];
        return allowed.includes(policyCode);
    };

    return { tier, isPolicyEnabled };
};
