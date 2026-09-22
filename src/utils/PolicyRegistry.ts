export interface CompliancePolicy {
  id: string;
  name: string;
  category: 'Legal & Governance' | 'Operational Risk' | 'Data Governance' | 'Ethics & Sustainability';
  description: string;
  associatedModules: string[];
  protocol: string;
  status: 'active' | 'monitoring' | 'pending';
}

export class PolicyRegistry {
  private policies: Map<string, CompliancePolicy>;

  constructor() {
    this.policies = new Map();
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies() {
    const defaultPolicies: CompliancePolicy[] = [
      // Legal & Governance
      {
        id: 'EPRIVACY',
        name: 'ePrivacy Directive (Cookie Law)',
        category: 'Legal & Governance',
        description: 'Regulates cookie injection, management, and user consent for tracking.',
        associatedModules: ['Cookie Management', 'User Onboarding'],
        protocol: 'Consent_Management_Protocol',
        status: 'active'
      },
      {
        id: 'UNCITRAL',
        name: 'UNCITRAL Model Law on Electronic Signatures',
        category: 'Legal & Governance',
        description: 'International standards for electronic signatures and authentication.',
        associatedModules: ['User Onboarding', 'Contract Execution'],
        protocol: 'eSignature_Verification_Protocol',
        status: 'active'
      },
      
      // Operational Risk
      {
        id: 'BASEL_III_IV',
        name: 'Basel III / IV',
        category: 'Operational Risk',
        description: 'Capital requirements and risk management standards for banking and fintech.',
        associatedModules: ['Data Logging', 'Reporting', 'TreasurySettlement'],
        protocol: 'Risk_Capital_Audit_Protocol',
        status: 'active'
      },
      {
        id: 'AML_CTF',
        name: 'AML / CTF',
        category: 'Operational Risk',
        description: 'Anti-Money Laundering & Counter-Terrorist Financing regulations.',
        associatedModules: ['Sanction Checking', 'User Onboarding', 'Transaction Monitoring'],
        protocol: 'KYC_AML_Sanction_Protocol',
        status: 'active'
      },

      // Data Governance
      {
        id: 'GDPR',
        name: 'GDPR',
        category: 'Data Governance',
        description: 'General Data Protection Regulation for EU data privacy.',
        associatedModules: ['Data Masking', 'EvidenceVault'],
        protocol: 'PII_Masking_Protocol',
        status: 'active'
      },
      {
        id: 'DMA',
        name: 'Digital Markets Act (DMA)',
        category: 'Data Governance',
        description: 'Ensures fair competition and data portability for large platform gatekeepers.',
        associatedModules: ['Data Portability', 'Integration API'],
        protocol: 'Interoperability_Protocol',
        status: 'monitoring'
      },
      {
        id: 'DATA_ACT_EU',
        name: 'Data Act (EU)',
        category: 'Data Governance',
        description: 'Regulates data sharing for connected devices and industrial IoT data.',
        associatedModules: ['IoT Data Access', 'Device Management'],
        protocol: 'Device_Data_Access_Protocol',
        status: 'pending'
      },

      // Ethics & Sustainability
      {
        id: 'CSRD',
        name: 'Corporate Sustainability Reporting Directive',
        category: 'Ethics & Sustainability',
        description: 'Requires reporting on carbon footprint and social impact.',
        associatedModules: ['Reporting', 'AuditLedger'],
        protocol: 'Sustainability_Audit_Protocol',
        status: 'monitoring'
      },
      {
        id: 'EU_AI_ACT',
        name: 'EU AI Act',
        category: 'Ethics & Sustainability',
        description: 'Ethical AI compliance, bias testing, and risk-level categorization for AI systems.',
        associatedModules: ['AI Output/Decision', 'Algorithmic Auditing'],
        protocol: 'AI_Bias_Testing_Protocol',
        status: 'active'
      },
      
      // Resilience
      {
        id: 'DORA',
        name: 'Digital Operational Resilience Act',
        category: 'Operational Risk',
        description: 'Ensures financial sector operational resilience against cyber threats.',
        associatedModules: ['System Resilience Check', 'IncidentResponse'],
        protocol: 'Resilience_Check_Protocol',
        status: 'active'
      },
      {
        id: 'CRA',
        name: 'Cyber Resilience Act',
        category: 'Operational Risk',
        description: 'Security requirements for hardware and software products.',
        associatedModules: ['Autofix/Patching', 'Vulnerability Scanner'],
        protocol: 'Vulnerability_Patching_Protocol',
        status: 'active'
      },
      {
        id: 'EIDAS',
        name: 'eIDAS (electronic Identification, Authentication and Trust Services)',
        category: 'Legal & Governance',
        description: 'Regulates digital signatures, virtual identity, and electronic trust services in the EU.',
        associatedModules: ['User Onboarding', 'Signature Verification', 'EUDI Wallet Support'],
        protocol: 'eIDAS_Trust_Protocol',
        status: 'active'
      },
      {
        id: 'EHDS',
        name: 'European Health Data Space (EHDS)',
        category: 'Data Governance',
        description: 'Ensures secure health data exchange, medical privacy, and strict PHI protection.',
        associatedModules: ['Data Masking', 'Medical Record Audit', 'Microsoft Presidio'],
        protocol: 'Health_Data_Privacy_Protocol',
        status: 'monitoring'
      },
      {
        id: 'NIS2',
        name: 'NIS2 Directive',
        category: 'Operational Risk',
        description: 'Cybersecurity requirements across critical sectors, expanding EU resilience guidelines.',
        associatedModules: ['Threat Monitoring', 'IncidentResponse', 'Cyber Security Guard'],
        protocol: 'Cyber_Resilience_Protocol',
        status: 'active'
      },
      {
        id: 'DSA',
        name: 'Digital Services Act (DSA)',
        category: 'Data Governance',
        description: 'Regulates online intermediaries and social/e-commerce platforms to prevent illegal content.',
        associatedModules: ['Content Moderation', 'Threat Detection', 'Web Crawler'],
        protocol: 'Content_Moderation_Protocol',
        status: 'active'
      },
      {
        id: 'MICA',
        name: 'Markets in Crypto-Assets (MICA)',
        category: 'Operational Risk',
        description: 'Regulatory framework for crypto-asset issuers, exchanges, and forensic transaction screening.',
        associatedModules: ['Transaction Monitoring', 'Crypto Forensic Service', 'Wash Trading Search'],
        protocol: 'Crypto_Asset_Regulatory_Protocol',
        status: 'active'
      },
      {
        id: 'PSD3',
        name: 'Payment Services Directive 3 (PSD3)',
        category: 'Operational Risk',
        description: 'Standard for open banking, payment security, customer authentication, and fintech transactions.',
        associatedModules: ['Payment Gateways', 'Fintech Analytics', 'Stripe Billing'],
        protocol: 'PSD3_Payment_Protocol',
        status: 'pending'
      },
      {
        id: 'CSDDD',
        name: 'Corporate Sustainability Due Diligence Directive (CSDDD)',
        category: 'Ethics & Sustainability',
        description: 'Mandates large corporate supply chains to identify and prevent negative environmental/social impacts.',
        associatedModules: ['Supply Chain Audit', 'Sustainability Scorecard'],
        protocol: 'CSDDD_Supply_Chain_Protocol',
        status: 'pending'
      }
    ];

    defaultPolicies.forEach(policy => this.policies.set(policy.id, policy));
  }

  public getAllPolicies(): CompliancePolicy[] {
    return Array.from(this.policies.values());
  }

  public getPolicyById(id: string): CompliancePolicy | undefined {
    return this.policies.get(id);
  }

  public getPoliciesByModule(moduleName: string): CompliancePolicy[] {
    return Array.from(this.policies.values()).filter(p => 
      p.associatedModules.includes(moduleName)
    );
  }

  public getProtocolMapping(): Record<string, string> {
    const mapping: Record<string, string> = {};
    for (const [id, policy] of this.policies.entries()) {
      mapping[id] = policy.protocol;
    }
    return mapping;
  }

  public getPoliciesByCategory(category: CompliancePolicy['category']): CompliancePolicy[] {
    return Array.from(this.policies.values()).filter(p => p.category === category);
  }

  /**
   * Exports the entire policy mapping as a structured configuration object
   * suitable for syncing with backend microservices or other automated pipelines.
   */
  public exportAsJsonConfig(): { version: string; exportedAt: string; policies: Record<string, CompliancePolicy> } {
    const policyMap: Record<string, CompliancePolicy> = {};
    for (const [id, policy] of this.policies.entries()) {
      policyMap[id] = { ...policy };
    }
    return {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      policies: policyMap
    };
  }

  /**
   * Exports the entire policy configuration as a JSON string.
   * @param pretty Whether to format the JSON string with indentation.
   */
  public exportAsJsonString(pretty: boolean = false): string {
    return JSON.stringify(this.exportAsJsonConfig(), null, pretty ? 2 : 0);
  }
}

// Export a singleton instance for global use in the app
export const globalPolicyRegistry = new PolicyRegistry();
