export type SubscriptionTier = 'starter' | 'aml-kyc' | 'healthtech' | 'enterprise_ai' | 'ecommerce-eu' | 'crypto_forensics' | 'govtech' | 'gaming' | 'edtech' | 'logistic' | 'remediation_api' | 'enterprise' | 'gdpr-compliance';
export type PolicyFramework = 'GDPR' | 'ePrivacy' | 'DSA' | 'DORA' | 'AML_KYC' | 'PSD3' | 'CRA' | 'EHDS' | 'NIS2' | 'AI_ACT' | 'DATA_ACT' | 'CSRD' | 'SOC2' | 'FERPA' | 'COPPA' | 'PCI_DSS' | 'HIPAA' | 'ISO27001' | 'MICA';

import { CountryCode } from '../context/JurisdictionContext';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  price: string;
  billing: string;
  iconName: string;
  description: string;
  policies: PolicyFramework[];
}

export class SubscriptionManager {
  public static readonly TIER_CONFIGS: TierConfig[] = [
    {
      id: 'gdpr-compliance',
      name: 'GDPR Compliance Add-On',
      price: '€799',
      billing: 'month',
      iconName: 'ShieldCheck',
      description: 'Complete GDPR Article 30/32 orchestration, automated DSAR handling, DPO workflow tools, and PII anonymization.',
      policies: ['GDPR', 'ePrivacy', 'CRA', 'ISO27001']
    },
    {
      id: 'ecommerce-eu',
      name: 'E-Commerce Standard',
      price: '€49',
      billing: 'month',
      iconName: 'ShoppingCart',
      description: 'Ideal for retail digital sites and customer portals.',
      policies: ['GDPR', 'ePrivacy', 'DSA', 'PCI_DSS']
    },
    {
      id: 'aml-kyc',
      name: 'Fintech Pro Standard',
      price: '€299',
      billing: 'month',
      iconName: 'Zap',
      description: 'For secure banks, payment gateways, and trading suites.',
      policies: ['GDPR', 'DORA', 'AML_KYC', 'PSD3', 'CRA', 'PCI_DSS']
    },
    {
      id: 'healthtech',
      name: 'HealthTech Secure',
      price: '€399',
      billing: 'month',
      iconName: 'Heart',
      description: 'For clinics, medical platforms, and EHDS-focused personal health record spaces.',
      policies: ['GDPR', 'EHDS', 'CRA', 'NIS2', 'HIPAA']
    },
    {
      id: 'enterprise_ai',
      name: 'Enterprise AI Horizon',
      price: '€999',
      billing: 'month',
      iconName: 'Brain',
      description: 'Built for frontier generative models and high-risk AI auditors.',
      policies: ['GDPR', 'AI_ACT', 'DATA_ACT', 'CSRD', 'SOC2']
    },
    {
      id: 'crypto_forensics',
      name: 'Crypto & Digital Asset Compliance',
      price: '€1499',
      billing: 'month',
      iconName: 'ShieldCheck',
      description: 'MICA Forex, Market Surveillance, and On-Chain Forensic investigations.',
      policies: ['GDPR', 'AML_KYC', 'MICA', 'DORA']
    },
    {
      id: 'govtech',
      name: 'Public Sector & GovTech',
      price: '€799',
      billing: 'month',
      iconName: 'Landmark',
      description: 'Compliance for government agencies and smart city infrastructures.',
      policies: ['GDPR', 'NIS2', 'ISO27001', 'CRA']
    },
    {
      id: 'gaming',
      name: 'Gaming & Entertainment',
      price: '€199',
      billing: 'month',
      iconName: 'Gamepad2',
      description: 'Global privacy and child protection rules for gaming studios.',
      policies: ['GDPR', 'COPPA', 'ePrivacy', 'DSA']
    },
    {
      id: 'edtech',
      name: 'EdTech Shield',
      price: '€149',
      billing: 'month',
      iconName: 'GraduationCap',
      description: 'Student data privacy and institutional compliance.',
      policies: ['GDPR', 'FERPA', 'COPPA', 'SOC2']
    },
    {
      id: 'logistic',
      name: 'Logistics & Supply Chain',
      price: '€349',
      billing: 'month',
      iconName: 'Truck',
      description: 'Resilience and supply chain cyber-security compliance.',
      policies: ['GDPR', 'NIS2', 'CSRD', 'ISO27001']
    },
    {
      id: 'remediation_api',
      name: 'Remediation API Service',
      price: '€199',
      billing: 'month',
      iconName: 'Webhook',
      description: 'Continuous API threat scanning, automated endpoint PII remediation, and real-time consent middleware injection.',
      policies: ['GDPR', 'SOC2', 'NIS2', 'PCI_DSS']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Sovereignty',
      price: '€1999',
      billing: 'month',
      iconName: 'Building2',
      description: 'Built for global institutions requiring maximum multi-region continuous syncs, dedicated compliance officer support, and automated enforcement.',
      policies: ['GDPR', 'NIS2', 'SOC2', 'HIPAA', 'AI_ACT', 'DORA', 'PCI_DSS']
    }
  ];

  public static getRegionalPrice(
    baseEuroPrice: number,
    country: CountryCode
  ): { currency: string; symbol: string; amount: number; formatted: string } {
    switch (country) {
      case 'US-CA':
        return {
          currency: 'USD',
          symbol: '$',
          amount: Math.round(baseEuroPrice * 1.1),
          formatted: `$${Math.round(baseEuroPrice * 1.1)}`
        };
      case 'US-HIPAA':
        return {
          currency: 'USD',
          symbol: '$',
          amount: Math.round(baseEuroPrice * 1.15),
          formatted: `$${Math.round(baseEuroPrice * 1.15)}`
        };
      case 'CA':
        return {
          currency: 'CAD',
          symbol: 'C$',
          amount: Math.round(baseEuroPrice * 1.4),
          formatted: `C$${Math.round(baseEuroPrice * 1.4)}`
        };
      case 'ZA':
      case 'NG':
      case 'AE':
      case 'SA':
        return {
          currency: 'EUR',
          symbol: '€',
          amount: baseEuroPrice,
          formatted: `€${baseEuroPrice}`
        };
      case 'EU':
      default:
        return {
          currency: 'EUR',
          symbol: '€',
          amount: baseEuroPrice,
          formatted: `€${baseEuroPrice}`
        };
    }
  }

  static getEnabledPolicies(userSubscriptionTier: SubscriptionTier | string): PolicyFramework[] {
    const tierConfig = this.TIER_CONFIGS.find(t => t.id === userSubscriptionTier.toLowerCase() as SubscriptionTier);
    if (tierConfig) {
      return tierConfig.policies;
    }
    return ['GDPR'];
  }

  static hasAccess(userSubscriptionTier: SubscriptionTier | string, policy: PolicyFramework): boolean {
    const policies = this.getEnabledPolicies(userSubscriptionTier);
    return policies.includes(policy);
  }
}
