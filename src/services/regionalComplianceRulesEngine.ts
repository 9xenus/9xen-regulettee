/**
 * 9XEN_REGULETTEE REGIONAL COMPLIANCE RULES & DETECTION ENGINE
 * 
 * Centralized registry of regional compliance acts, statutory laws, enforcement mechanisms,
 * breach notification windows, statutory liability formulas, and automatic user region detection.
 */

export type RegionKey = 
  | 'EU'
  | 'USA'
  | 'UK'
  | 'KSA'
  | 'UAE'
  | 'APAC'
  | 'AUSTRALIA'
  | 'CANADA'
  | 'SWITZERLAND'
  | 'LATIN_AMERICA'
  | 'AFRICA'
  | 'GLOBAL';

export interface RegionalActRule {
  ruleId: string;
  articleRef: string;
  title: string;
  description: string;
  mandatoryControl: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  basePenaltyAmount: number;
  currency: string;
  verificationChecklist: string[];
}

export interface RegionalComplianceAct {
  actId: string;
  title: string;
  shortCode: string;
  jurisdictionName: string;
  countryFlag: string;
  enactedYear: number;
  effectiveDate: string;
  supervisoryAuthority: {
    name: string;
    acronym: string;
    website: string;
    headquarters: string;
  };
  summary: string;
  scope: string;
  statutoryFineFormula: {
    maxPercentageTurnover?: number;
    fixedCapAmount?: string;
    currency: string;
    humanSummary: string;
  };
  officialUrl: string;
  keyArticles: string[];
  rules: RegionalActRule[];
}

export interface RegionalComplianceMechanism {
  id: string;
  name: string;
  category: 'DATA_TRANSFER' | 'BREACH_NOTIFICATION' | 'CONSENT_RIGHTS' | 'ENCLAVE_SOVEREIGNTY' | 'AI_GOVERNANCE' | 'AUDIT_LOGGING';
  statutoryRequirement: string;
  timeframeDeadline?: string;
  enforcementMechanism: string;
  technicalImplementation: string;
  status: 'ACTIVE' | 'ENFORCED' | 'OPTIONAL';
}

export interface RegionalFramework {
  regionKey: RegionKey;
  displayName: string;
  countries: string[];
  primaryFlag: string;
  currency: string;
  currencySymbol: string;
  eurConversionRate: number;
  sovereignDataCenter: string;
  hardwareEnclaveSupported: string;
  defaultBreachWindowHours: number;
  acts: RegionalComplianceAct[];
  mechanisms: RegionalComplianceMechanism[];
  clausesTemplates: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    statuteReference: string;
    content: string;
  }>;
}

export interface DetectedUserRegion {
  regionKey: RegionKey;
  detectionSource: 'REGISTRATION_METADATA' | 'TENANT_PROFILE' | 'SYSTEM_LOCALE' | 'USER_OVERRIDE';
  confidenceScore: number;
  registeredCountry?: string;
  registeredCity?: string;
  sovereignNode: string;
  matchedField?: string;
  timestamp: string;
}

// Complete registry of Regional Compliance Frameworks
export const REGIONAL_FRAMEWORKS: Record<RegionKey, RegionalFramework> = {
  EU: {
    regionKey: 'EU',
    displayName: 'European Union & EEA',
    countries: ['Germany', 'France', 'Ireland', 'Netherlands', 'Italy', 'Spain', 'Belgium', 'Austria', 'Sweden', 'Poland'],
    primaryFlag: '🇪🇺',
    currency: 'EUR',
    currencySymbol: '€',
    eurConversionRate: 1.0,
    sovereignDataCenter: 'EU-CENTRAL-1 (Frankfurt Sovereign Enclave)',
    hardwareEnclaveSupported: 'AMD SEV-SNP & Intel SGX Confidential Compute',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'EU-GDPR-2016',
        title: 'General Data Protection Regulation (Regulation EU 2016/679)',
        shortCode: 'EU GDPR',
        jurisdictionName: 'European Union',
        countryFlag: '🇪🇺',
        enactedYear: 2016,
        effectiveDate: '2018-05-25',
        supervisoryAuthority: {
          name: 'European Data Protection Board (EDPB) & National DPAs (CNIL, BfDI, DPC)',
          acronym: 'EDPB / CNIL / BfDI',
          website: 'https://edpb.europa.eu',
          headquarters: 'Brussels, Belgium'
        },
        summary: 'Primary EU benchmark governing the processing, storage, and cross-border transfer of personal data of EU/EEA residents.',
        scope: 'Applies to all organizations offering goods/services or monitoring data subjects within the EU/EEA regardless of company location.',
        statutoryFineFormula: {
          maxPercentageTurnover: 4.0,
          fixedCapAmount: '€20,000,000',
          currency: 'EUR',
          humanSummary: 'Up to €20,000,000 or 4% of global annual turnover, whichever is higher.'
        },
        officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679',
        keyArticles: ['Article 5 (Principles)', 'Article 6 (Lawfulness)', 'Article 25 (Data Protection by Design)', 'Article 32 (Security of Processing)', 'Article 33 (Breach Notification within 72h)', 'Article 44-49 (Cross-Border Transfers)'],
        rules: [
          {
            ruleId: 'EU-GDPR-ART-32',
            articleRef: 'Article 32',
            title: 'Technical & Organizational Safeguards (Encryption at Rest/Transit)',
            description: 'Controllers and processors must implement state-of-the-art encryption, pseudonymization, and regular vulnerability audits.',
            mandatoryControl: 'Enforce AES-256 encryption at rest, TLS 1.3 in transit, and continuous HSM key rotation.',
            severity: 'CRITICAL',
            basePenaltyAmount: 500000,
            currency: 'EUR',
            verificationChecklist: ['AES-256 DB Encryption Active', 'TLS 1.3 Strict Transport Security', 'HSM Key Isolation Verified', 'Automated Penetration Test Logged']
          },
          {
            ruleId: 'EU-GDPR-ART-33',
            articleRef: 'Article 33',
            title: '72-Hour Supervisory Breach Notification Relay',
            description: 'In the case of a personal data breach, controllers must notify competent supervisory authorities within 72 hours.',
            mandatoryControl: 'Automated telemetry webhook relay to lead DPA (CNIL, BfDI, DPC) with forensic breach dossiers.',
            severity: 'CRITICAL',
            basePenaltyAmount: 750000,
            currency: 'EUR',
            verificationChecklist: ['Lead DPA Webhook Configured', '72-Hour SLA Timer Active', 'Automated PII Impact Assessment', 'Data Subject Notification Pipeline']
          },
          {
            ruleId: 'EU-GDPR-ART-7',
            articleRef: 'Article 7 & 13',
            title: 'Unambiguous Consent & Reject-All Cookie Compliance',
            description: 'Freely given, specific, informed consent with equal-prominence Reject All button before any tracking script executes.',
            mandatoryControl: 'Zero-cookie pre-consent blocking engine with cryptographic consent audit logging.',
            severity: 'HIGH',
            basePenaltyAmount: 250000,
            currency: 'EUR',
            verificationChecklist: ['Reject All Equal Prominence', 'Pre-consent Script Execution Blocked', 'Consent Receipts Cryptographically Hashed', 'GPC Signal Handled']
          }
        ]
      },
      {
        actId: 'EU-AI-ACT-2024',
        title: 'European Union Artificial Intelligence Act (Regulation EU 2024/1689)',
        shortCode: 'EU AI Act',
        jurisdictionName: 'European Union',
        countryFlag: '🇪🇺',
        enactedYear: 2024,
        effectiveDate: '2026-08-02',
        supervisoryAuthority: {
          name: 'European AI Office & National Market Surveillance Authorities',
          acronym: 'EU AI Office',
          website: 'https://digital-strategy.ec.europa.eu/en/policies/ai-office',
          headquarters: 'Brussels, Belgium'
        },
        summary: 'Comprehensive risk-based regulatory framework classifying AI systems (Prohibited, High-Risk, GPAI, Minimal) with mandatory conformity assessments.',
        scope: 'Providers placing AI systems on the EU market, deployers located in the EU, and third-country providers whose AI outputs are used in the EU.',
        statutoryFineFormula: {
          maxPercentageTurnover: 7.0,
          fixedCapAmount: '€35,000,000',
          currency: 'EUR',
          humanSummary: 'Up to €35,000,000 or 7% of global turnover for prohibited AI practices; up to €15,000,000 or 3% for high-risk obligations.'
        },
        officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
        keyArticles: ['Article 5 (Prohibited AI Practices)', 'Article 9 (Risk Management System)', 'Article 10 (Data Governance & Bias Testing)', 'Article 14 (Human Oversight)', 'Article 71 (Penalties)'],
        rules: [
          {
            ruleId: 'EU-AI-ACT-ART-9',
            articleRef: 'Article 9',
            title: 'High-Risk AI Continuous Risk Management System',
            description: 'Continuous, iterative risk management system identifying foreseeable risks to health, safety, or fundamental rights.',
            mandatoryControl: 'Automated AI Risk Ledger with pre-deployment bias mitigation and continuous post-market monitoring.',
            severity: 'CRITICAL',
            basePenaltyAmount: 1000000,
            currency: 'EUR',
            verificationChecklist: ['Risk Assessment Matrix Registered', 'Bias & Demographic Parity Validated', 'Human-in-the-Loop Override Configured', 'EU Database Registration File Ready']
          },
          {
            ruleId: 'EU-AI-ACT-ART-14',
            articleRef: 'Article 14',
            title: 'Human Oversight & Autonomous Kill-Switch Controls',
            description: 'High-risk AI systems must be designed so that natural persons can oversee operations and intervene or stop system execution.',
            mandatoryControl: 'Hardware-level operational circuit breaker and real-time inference explainability dashboard.',
            severity: 'CRITICAL',
            basePenaltyAmount: 850000,
            currency: 'EUR',
            verificationChecklist: ['Emergency Stop API Active', 'Real-time Confidence Threshold Gates', 'Operator Intervention Audit Log', 'Model Drift Circuit Breaker']
          }
        ]
      },
      {
        actId: 'EU-DORA-2022',
        title: 'Digital Operational Resilience Act (Regulation EU 2022/2554)',
        shortCode: 'DORA',
        jurisdictionName: 'European Union',
        countryFlag: '🇪🇺',
        enactedYear: 2022,
        effectiveDate: '2025-01-17',
        supervisoryAuthority: {
          name: 'European Supervisory Authorities (EBA, EIOPA, ESMA)',
          acronym: 'ESAs / EBA',
          website: 'https://www.eba.europa.eu',
          headquarters: 'Paris / Frankfurt'
        },
        summary: 'Operational resilience framework for the financial sector and critical ICT third-party service providers.',
        scope: 'All EU banks, investment firms, insurance entities, crypto asset providers, and their critical ICT suppliers.',
        statutoryFineFormula: {
          maxPercentageTurnover: 1.0,
          fixedCapAmount: '€5,000,000 daily periodic penalty payments',
          currency: 'EUR',
          humanSummary: 'Periodic penalty payments up to 1% of average daily worldwide turnover for critical ICT providers.'
        },
        officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2554',
        keyArticles: ['Article 5 (ICT Risk Governance)', 'Article 19 (Major ICT Incident Reporting)', 'Article 28 (ICT Third-Party Risk Management)', 'Article 31 (Critical ICT Oversight)'],
        rules: [
          {
            ruleId: 'EU-DORA-ART-19',
            articleRef: 'Article 19',
            title: 'Major ICT Incident Initial Notification Within 4 Hours',
            description: 'Financial entities must submit initial notification of major ICT incidents within 4 hours of classification.',
            mandatoryControl: 'Automated resilience telemetry and European Supervisory Authority incident dispatch pipeline.',
            severity: 'CRITICAL',
            basePenaltyAmount: 600000,
            currency: 'EUR',
            verificationChecklist: ['4-Hour Initial Notice Automated', 'ICT Incident Classification Engine Active', 'Secondary Data Center Failover Tested', 'Third-Party Vendor Register Maintained']
          }
        ]
      },
      {
        actId: 'EU-NIS2-2022',
        title: 'Network and Information Systems Directive 2 (Directive EU 2022/2555)',
        shortCode: 'NIS2',
        jurisdictionName: 'European Union',
        countryFlag: '🇪🇺',
        enactedYear: 2022,
        effectiveDate: '2024-10-17',
        supervisoryAuthority: {
          name: 'National Cybersecurity Agencies (e.g. BSI, ANSSI, CCN) & ENISA',
          acronym: 'ENISA / CSIRTs',
          website: 'https://www.enisa.europa.eu',
          headquarters: 'Athens, Greece'
        },
        summary: 'Cybersecurity measures across essential and important sectors (Energy, Health, Cloud, Digital Infrastructure, SaaS).',
        scope: 'Medium and large entities operating in essential or important critical sectors across the EU.',
        statutoryFineFormula: {
          maxPercentageTurnover: 2.0,
          fixedCapAmount: '€10,000,000',
          currency: 'EUR',
          humanSummary: 'Up to €10,000,000 or 2% of total worldwide turnover for essential entities.'
        },
        officialUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2555',
        keyArticles: ['Article 21 (Cybersecurity Risk Measures)', 'Article 23 (24h Early Warning & 72h Notification)', 'Article 20 (Management Body Liability)'],
        rules: [
          {
            ruleId: 'EU-NIS2-ART-23',
            articleRef: 'Article 23',
            title: '24-Hour CSIRT Early Warning & Supply-Chain Cyber Controls',
            description: 'Submit an early warning within 24 hours of becoming aware of a significant incident to the competent CSIRT.',
            mandatoryControl: '24h CSIRT telemetry dispatcher, automated supply-chain vulnerability vetting, and MFA enforcement.',
            severity: 'CRITICAL',
            basePenaltyAmount: 650000,
            currency: 'EUR',
            verificationChecklist: ['24h Early Warning Relay Connected', 'Supply-Chain Vendor Audit Completed', 'MFA & Hardware Security Keys Enforced', 'C-Suite Executive Training Logged']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'EU-MECH-SCC',
        name: 'EU Standard Contractual Clauses (SCCs 2021/914)',
        category: 'DATA_TRANSFER',
        statutoryRequirement: 'Mandatory standard clauses with Transfer Impact Assessment (TIA) for transfers outside EU/EEA.',
        enforcementMechanism: 'Article 46 GDPR validation with automated supplementary measure verification.',
        technicalImplementation: 'Confidential compute enclaves with client-held encryption keys (KMS/HSM) preventing foreign sovereign access.',
        status: 'ENFORCED'
      },
      {
        id: 'EU-MECH-72H-BREACH',
        name: '72-Hour Supervisory Breach Protocol',
        category: 'BREACH_NOTIFICATION',
        statutoryRequirement: 'Article 33 GDPR formal report to DPA within 72 hours of incident confirmation.',
        timeframeDeadline: '72 Hours',
        enforcementMechanism: 'Automated cryptographic incident ledger with direct DPA API gateway integration.',
        technicalImplementation: 'Webhook dispatcher generating encrypted incident dossier with impacted PII categories.',
        status: 'ACTIVE'
      },
      {
        id: 'EU-MECH-SOVEREIGN-ENCLAVE',
        name: 'EU Sovereign Enclave Isolation',
        category: 'ENCLAVE_SOVEREIGNTY',
        statutoryRequirement: 'Strict data residency within EU sovereign borders with no cross-border replication without adequacy.',
        enforcementMechanism: 'Hardware-level memory encryption (AMD SEV-SNP) in Frankfurt / Dublin data centers.',
        technicalImplementation: 'Multi-region DB router pinning tenant SQLite/DuckDB files to EU nodes.',
        status: 'ENFORCED'
      }
    ],
    clausesTemplates: [
      {
        id: 'EU-SCC-MOD2',
        name: 'EU Standard Contractual Clauses - Controller to Processor (Module 2)',
        type: 'Standard Contractual Clauses',
        description: 'Commission Implementing Decision (EU) 2021/914 Module 2 terms for cross-border data processing.',
        statuteReference: 'GDPR Article 46(2)(c)',
        content: `STANDARD CONTRACTUAL CLAUSES (MODULE 2: Controller-to-Processor)\n\nSECTION I\nClause 1: Purpose and Scope\n(a) The purpose of these standard contractual clauses is to ensure compliance with the requirements of Regulation (EU) 2016/679 of the European Parliament and of the Council on the protection of natural persons with regard to the processing of personal data.\n\nSECTION II - OBLIGATIONS OF THE PARTIES\nClause 8: Data Protection Safeguards\n8.1 Instructions: The data importer shall process the personal data only on documented instructions from the data exporter.\n8.2 Purpose limitation: The data importer shall process the personal data only for the specific purpose(s) of the transfer.\n8.6 Security of processing: The data importer shall implement appropriate technical and organisational measures, including encryption at rest (AES-256) and in transit (TLS 1.3), to ensure a level of security appropriate to the risk.`
      }
    ]
  },

  USA: {
    regionKey: 'USA',
    displayName: 'United States of America',
    countries: ['United States (Federal & State Jurisdictions)'],
    primaryFlag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    eurConversionRate: 1.08,
    sovereignDataCenter: 'US-EAST-VA (FedRAMP High & State Sovereignty Enclave)',
    hardwareEnclaveSupported: 'AWS Nitro Enclaves & Intel SGX GovCloud',
    defaultBreachWindowHours: 96,
    acts: [
      {
        actId: 'USA-CCPA-CPRA',
        title: 'California Consumer Privacy Act & CPRA (Cal. Civ. Code § 1798.100)',
        shortCode: 'CCPA / CPRA',
        jurisdictionName: 'State of California, USA',
        countryFlag: '🇺🇸',
        enactedYear: 2018,
        effectiveDate: '2023-01-01',
        supervisoryAuthority: {
          name: 'California Privacy Protection Agency (CPPA) & California AG',
          acronym: 'CPPA / Cal AG',
          website: 'https://cppa.ca.gov',
          headquarters: 'Sacramento, CA'
        },
        summary: 'Comprehensive consumer privacy statute granting California consumers rights to know, delete, correct, opt-out of data sale/sharing, and limit SPI.',
        scope: 'For-profit businesses doing business in California meeting $25M revenue, 100k consumer profiles, or 50%+ revenue from data sales.',
        statutoryFineFormula: {
          fixedCapAmount: '$7,500 per intentional violation; $2,500 per unintentional violation',
          currency: 'USD',
          humanSummary: '$7,500 per intentional violation; private right of action for data breaches ($100-$750 per consumer per incident).'
        },
        officialUrl: 'https://oag.ca.gov/privacy/ccpa',
        keyArticles: ['§ 1798.100 (Notice at Collection)', '§ 1798.120 (Do Not Sell/Share)', '§ 1798.121 (Limit Sensitive Personal Info)', '§ 1798.150 (Private Right of Action for Breaches)'],
        rules: [
          {
            ruleId: 'US-CCPA-OPT-OUT',
            articleRef: '§ 1798.120',
            title: 'Do Not Sell / Share My Personal Information Link & GPC Signal',
            description: 'Businesses selling or sharing consumer info must provide clear "Do Not Sell/Share" mechanism and respect Global Privacy Control.',
            mandatoryControl: 'Persistent footer opt-out link with automated GPC header parsing and consent synchronization.',
            severity: 'CRITICAL',
            basePenaltyAmount: 350000,
            currency: 'USD',
            verificationChecklist: ['Do Not Sell/Share Link Conspicuous', 'Global Privacy Control (GPC) Honored', '12-Month Request Lookback Enabled', 'Service Provider Contracts Updated']
          },
          {
            ruleId: 'US-CCPA-SPI-LIMIT',
            articleRef: '§ 1798.121',
            title: 'Sensitive Personal Information (SPI) Usage Restriction Gate',
            description: 'Consumers have the right to limit the use of their sensitive personal information (SSN, geolocation, biometrics, financial info).',
            mandatoryControl: 'SPI tag identification and automated downstream data access restriction gate.',
            severity: 'HIGH',
            basePenaltyAmount: 250000,
            currency: 'USD',
            verificationChecklist: ['SPI Tagged in Database Schemas', 'Limit Use of SPI Mechanism Active', 'Third-Party Data Sharing Blocked for SPI', 'Annual Risk Assessment Conducted']
          }
        ]
      },
      {
        actId: 'USA-SEC-RULE-106',
        title: 'SEC Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure',
        shortCode: 'SEC Item 1.05',
        jurisdictionName: 'Federal United States',
        countryFlag: '🇺🇸',
        enactedYear: 2023,
        effectiveDate: '2023-12-18',
        supervisoryAuthority: {
          name: 'U.S. Securities and Exchange Commission',
          acronym: 'SEC',
          website: 'https://www.sec.gov',
          headquarters: 'Washington, D.C.'
        },
        summary: 'Requires public companies to disclose material cybersecurity incidents on Form 8-K within four business days of materiality determination.',
        scope: 'All U.S. public reporting companies and foreign private issuers (Form 6-K).',
        statutoryFineFormula: {
          fixedCapAmount: 'Civil enforcement fines exceeding $10,000,000+ plus securities litigation exposure',
          currency: 'USD',
          humanSummary: 'SEC enforcement actions, civil penalties, and securities fraud liability for delayed/misleading disclosures.'
        },
        officialUrl: 'https://www.sec.gov/news/press-release/2023-139',
        keyArticles: ['Item 1.05 Form 8-K (Material Incident Disclosure)', 'Item 106 Regulation S-K (Cyber Governance & Board Oversight)'],
        rules: [
          {
            ruleId: 'US-SEC-ITEM-105',
            articleRef: 'Item 1.05 Form 8-K',
            title: '4-Business-Day Material Incident Disclosure Protocol',
            description: 'Must disclose nature, scope, timing, and material impact of cybersecurity incident within 4 business days of materiality determination.',
            mandatoryControl: 'Materiality evaluation workflow with automated Form 8-K incident brief generator.',
            severity: 'CRITICAL',
            basePenaltyAmount: 1000000,
            currency: 'USD',
            verificationChecklist: ['Materiality Committee Workflow Active', '4-Day Countdown Timer Configured', 'Board Cyber Oversight Documented', 'Incident Forensic Brief Template Ready']
          }
        ]
      },
      {
        actId: 'USA-HIPAA-SECURITY',
        title: 'Health Insurance Portability and Accountability Act (HIPAA Security & Privacy Rule)',
        shortCode: 'HIPAA',
        jurisdictionName: 'Federal United States',
        countryFlag: '🇺🇸',
        enactedYear: 1996,
        effectiveDate: '2003-04-14',
        supervisoryAuthority: {
          name: 'U.S. Department of Health and Human Services (HHS) Office for Civil Rights',
          acronym: 'HHS OCR',
          website: 'https://www.hhs.gov/hipaa',
          headquarters: 'Washington, D.C.'
        },
        summary: 'National standards protecting sensitive electronic protected health information (ePHI) with technical, physical, and administrative safeguards.',
        scope: 'Covered entities (healthcare providers, health plans, healthcare clearinghouses) and Business Associates.',
        statutoryFineFormula: {
          fixedCapAmount: 'Tier 4 Willful Neglect: Up to $2,067,813 annual cap per violation category',
          currency: 'USD',
          humanSummary: 'Tiered statutory civil penalties up to $68,928 per violation, annual calendar cap of $2,067,813 per category.'
        },
        officialUrl: 'https://www.hhs.gov/hipaa/for-professionals/security/index.html',
        keyArticles: ['45 CFR § 164.312 (Technical Safeguards)', '45 CFR § 164.308 (Administrative Safeguards)', '45 CFR § 164.400 (Breach Notification Rule)'],
        rules: [
          {
            ruleId: 'US-HIPAA-SAFEGUARDS',
            articleRef: '45 CFR § 164.312',
            title: 'ePHI Encryption & Business Associate Agreement (BAA) Enforcement',
            description: 'Implement technical policies ensuring ePHI is encrypted at rest and in transit, with full audit trail of access.',
            mandatoryControl: 'BAA tracking, ePHI field-level encryption, and immutable healthcare access logs.',
            severity: 'CRITICAL',
            basePenaltyAmount: 500000,
            currency: 'USD',
            verificationChecklist: ['Signed BAA with all Subprocessors', 'ePHI Column-Level Encryption Active', 'Unique User ID & Auto-Logout Configured', 'Annual HIPAA Risk Assessment Completed']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'US-MECH-GPC',
        name: 'Global Privacy Control (GPC) Automated Opt-Out',
        category: 'CONSENT_RIGHTS',
        statutoryRequirement: 'Mandatory recognition of automated browser opt-out signals under CCPA/CPRA regulations.',
        enforcementMechanism: 'Real-time Sec-GPC HTTP request header inspection and state synchronization.',
        technicalImplementation: 'Edge-level GPC parser disabling marketing pixels and third-party script tags automatically.',
        status: 'ENFORCED'
      },
      {
        id: 'US-MECH-4DAY-SEC',
        name: 'SEC Form 8-K Material Cyber Briefing Relay',
        category: 'BREACH_NOTIFICATION',
        statutoryRequirement: 'Public company 4-day disclosure upon determination of cybersecurity incident materiality.',
        timeframeDeadline: '4 Business Days',
        enforcementMechanism: 'Formal incident review committee workflow with cryptographic materiality determination timestamping.',
        technicalImplementation: 'Automated executive incident draft generator with financial impact estimation.',
        status: 'ACTIVE'
      }
    ],
    clausesTemplates: [
      {
        id: 'US-CCPA-SERVICE-PROVIDER-ADDENDUM',
        name: 'CCPA / CPRA Service Provider Data Protection Addendum',
        type: 'Data Processing Agreement',
        description: 'Statutory contract provisions prohibiting service providers from retaining, using, or disclosing personal info.',
        statuteReference: 'Cal. Civ. Code § 1798.140(ag)',
        content: `CALIFORNIA CONSUMER PRIVACY ACT (CCPA/CPRA) SERVICE PROVIDER ADDENDUM\n\n1. Role of the Parties: The parties agree that in relation to personal information processed under the Principal Agreement, Customer is a Business and Service Provider is a Service Provider.\n\n2. Restrictions on Processing: Service Provider shall not:\n(a) Sell or share Personal Information;\n(b) Retain, use, or disclose Personal Information for any purpose other than for the business purposes specified in the Principal Agreement;\n(c) Retain, use, or disclose Personal Information outside of the direct business relationship between Service Provider and Customer;\n(d) Combine Personal Information received from Customer with personal information received from or on behalf of another person or collected from its own interaction with the consumer.\n\n3. Certification: Service Provider certifies that it understands the restrictions in Section 2 and will comply with them.`
      }
    ]
  },

  KSA: {
    regionKey: 'KSA',
    displayName: 'Kingdom of Saudi Arabia (KSA)',
    countries: ['Saudi Arabia (Kingdom of Saudi Arabia)'],
    primaryFlag: '🇸🇦',
    currency: 'SAR',
    currencySymbol: '﷼',
    eurConversionRate: 4.10,
    sovereignDataCenter: 'ME-CENTRAL-RIYADH (Sovereign Cloud Enclave - Class A)',
    hardwareEnclaveSupported: 'Aramco Cloud / STC Sovereign Enclave & Intel SGX',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'KSA-PDPL-2023',
        title: 'Saudi Arabia Personal Data Protection Law (Royal Decree M/148 & SDAIA Regulations)',
        shortCode: 'SDAIA PDPL',
        jurisdictionName: 'Kingdom of Saudi Arabia',
        countryFlag: '🇸🇦',
        enactedYear: 2021,
        effectiveDate: '2024-09-14',
        supervisoryAuthority: {
          name: 'Saudi Data and AI Authority (SDAIA) & National Data Management Office (NDMO)',
          acronym: 'SDAIA / NDMO',
          website: 'https://sdaia.gov.sa',
          headquarters: 'Riyadh, Saudi Arabia'
        },
        summary: 'Primary data protection statute in KSA emphasizing data subject consent, strict cross-border transfer controls, and national data sovereignty.',
        scope: 'All entities processing personal data within Saudi Arabia or processing data of Saudi residents outside the Kingdom.',
        statutoryFineFormula: {
          fixedCapAmount: 'Up to SAR 5,000,000 per violation; criminal penalties & doubling for repeat offenses',
          currency: 'SAR',
          humanSummary: 'Up to SAR 5,000,000 per violation, potential 2-year imprisonment for sensitive data disclosure, and fine doubling for repeat offenses.'
        },
        officialUrl: 'https://sdaia.gov.sa/en/SDAIA/about/Pages/PDPL.aspx',
        keyArticles: ['Article 5 (Legal Bases & Consent)', 'Article 18 (Data Security & Safeguards)', 'Article 24 (Breach Notification to SDAIA within 72h)', 'Article 29 (Cross-Border Data Transfers)', 'Article 35 (Penalties & Fines)'],
        rules: [
          {
            ruleId: 'KSA-PDPL-SOVEREIGN-STORAGE',
            articleRef: 'Article 29',
            title: 'Sovereign Data Storage & Cross-Border Transfer Controls',
            description: 'Personal data may only be transferred outside KSA if an adequate protection level exists and approval/exemption criteria are met.',
            mandatoryControl: 'Riyadh Sovereign Cloud data pinning and automated cross-border transfer impact logging.',
            severity: 'CRITICAL',
            basePenaltyAmount: 2000000,
            currency: 'SAR',
            verificationChecklist: ['Local Saudi Database Node Active', 'SDAIA National Registry Number Filed', 'Cross-Border Transfer Assessment Completed', 'Zero Unapproved Outbound Replication']
          },
          {
            ruleId: 'KSA-PDPL-BREACH-72H',
            articleRef: 'Article 24',
            title: '72-Hour SDAIA Incident Notification & Data Subject Alert',
            description: 'Controllers must notify SDAIA immediately (within 72 hours) upon becoming aware of any incident causing personal data leakage.',
            mandatoryControl: 'Direct SDAIA emergency webhook relay with impact forensic dossier.',
            severity: 'CRITICAL',
            basePenaltyAmount: 1500000,
            currency: 'SAR',
            verificationChecklist: ['SDAIA Emergency Dispatch Configured', '72h SLA Alert Active', 'Incident Classification Protocol Documented', 'Data Subject Notification Ready']
          }
        ]
      },
      {
        actId: 'KSA-SAMA-CSF',
        title: 'Saudi Central Bank Cyber Security Framework (SAMA CSF 2017/2023)',
        shortCode: 'SAMA CSF',
        jurisdictionName: 'Kingdom of Saudi Arabia (Financial Sector)',
        countryFlag: '🇸🇦',
        enactedYear: 2017,
        effectiveDate: '2017-05-01',
        supervisoryAuthority: {
          name: 'Saudi Central Bank',
          acronym: 'SAMA',
          website: 'https://www.sama.gov.sa',
          headquarters: 'Riyadh, Saudi Arabia'
        },
        summary: 'Mandatory cybersecurity framework for all SAMA-regulated financial institutions, FinTechs, and payment gateways in KSA.',
        scope: 'Banks, insurance companies, finance companies, credit bureaus, and FinTech entities operating in Saudi Arabia.',
        statutoryFineFormula: {
          fixedCapAmount: 'SAMA regulatory sanctions, operating license suspension, and administrative fines',
          currency: 'SAR',
          humanSummary: 'Severe SAMA regulatory enforcement, mandatory third-party audits, and license revocation.'
        },
        officialUrl: 'https://www.sama.gov.sa/en-US/CyberSecurity/Pages/CyberSecurityFramework.aspx',
        keyArticles: ['Section 3.1 (Cyber Security Governance)', 'Section 3.3 (Information Protection)', 'Section 3.4 (Cyber Security Operations & Threat Intel)'],
        rules: [
          {
            ruleId: 'KSA-SAMA-CRYPTO',
            articleRef: 'Section 3.3.4',
            title: 'Cryptographic Key Management & HSM Isolation',
            description: 'Financial transactions and authentication keys must be managed in dedicated Hardware Security Modules (HSMs).',
            mandatoryControl: 'FIPS 140-2 Level 3 HSM key isolation and dual-custody authorization.',
            severity: 'CRITICAL',
            basePenaltyAmount: 3000000,
            currency: 'SAR',
            verificationChecklist: ['HSM FIPS 140-2 Level 3 Active', 'Dual-Custody Key Ceremony Documented', 'Real-time SAMA Telemetry Logged', 'Air-gapped Backup Vault Configured']
          }
        ]
      },
      {
        actId: 'KSA-ZATCA-FATOORA',
        title: 'Zakat, Tax and Customs Authority E-Invoicing Regulation (Fatoora Phase 2 Integration)',
        shortCode: 'ZATCA Phase 2',
        jurisdictionName: 'Kingdom of Saudi Arabia',
        countryFlag: '🇸🇦',
        enactedYear: 2021,
        effectiveDate: '2023-01-01',
        supervisoryAuthority: {
          name: 'Zakat, Tax and Customs Authority',
          acronym: 'ZATCA',
          website: 'https://zatca.gov.sa',
          headquarters: 'Riyadh, Saudi Arabia'
        },
        summary: 'Mandatory Continuous Transaction Controls (CTC) e-invoicing requiring UBL 2.1 XML invoices with cryptographic stamp and ZATCA clearance API.',
        scope: 'All taxable resident persons and taxpayers subject to VAT in Saudi Arabia.',
        statutoryFineFormula: {
          fixedCapAmount: 'Up to SAR 50,000 per non-compliant invoice plus VAT penalty multipliers',
          currency: 'SAR',
          humanSummary: 'Fines up to SAR 50,000 per violation, non-deductibility of expenses, and potential tax audit flags.'
        },
        officialUrl: 'https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx',
        keyArticles: ['Article 3 (E-Invoicing Technical Specifications)', 'Article 4 (Cryptographic Stamp & Hash Chaining)', 'Article 5 (Clearance & Reporting APIs)'],
        rules: [
          {
            ruleId: 'KSA-ZATCA-CLEARANCE',
            articleRef: 'Article 4 & 5',
            title: 'ZATCA Phase 2 Real-Time Invoice Clearance & Cryptographic Stamping',
            description: 'Invoices must be generated in UBL 2.1 XML format with ECDSA secp256k1 cryptographic stamps and cleared via ZATCA API.',
            mandatoryControl: 'ZATCA CTC gateway integration with SHA-256 hash chaining and CSID certificate validation.',
            severity: 'CRITICAL',
            basePenaltyAmount: 50000,
            currency: 'SAR',
            verificationChecklist: ['ZATCA CSID Certificate Validated', 'UBL 2.1 XML Schema Validated', 'SHA-256 Previous Invoice Hash Chained', 'ZATCA Clearance Response 200 OK Logged']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'KSA-MECH-SOVEREIGN-HOSTING',
        name: 'Saudi National Cloud Hosting Mandate',
        category: 'ENCLAVE_SOVEREIGNTY',
        statutoryRequirement: 'Data residency in Kingdom of Saudi Arabia under SDAIA and NDMO governance policies.',
        enforcementMechanism: 'Class A/B Sovereign Cloud deployment in Riyadh data center nodes.',
        technicalImplementation: 'Dedicated Saudi tenant database clustering with encrypted cross-region transfer blocking.',
        status: 'ENFORCED'
      },
      {
        id: 'KSA-MECH-ZATCA-CTC',
        name: 'ZATCA Phase 2 E-Invoice Cryptographic Clearance Relay',
        category: 'AUDIT_LOGGING',
        statutoryRequirement: 'Real-time invoice clearance and reporting to ZATCA tax authority.',
        timeframeDeadline: 'Real-time (< 24h for B2C)',
        enforcementMechanism: 'ECDSA digital signatures and tamper-evident sequential hash chaining.',
        technicalImplementation: 'Automated ZATCA API client embedded in billing and transaction workflows.',
        status: 'ACTIVE'
      }
    ],
    clausesTemplates: [
      {
        id: 'KSA-SDAIA-DATA-TRANSFER-AGREEMENT',
        name: 'Saudi Arabia SDAIA Standard Personal Data Transfer Clauses',
        type: 'Cross-Border Transfer Agreement',
        description: 'Standard contractual terms complying with SDAIA Executive Regulations for personal data transfers outside KSA.',
        statuteReference: 'SDAIA PDPL Article 29 & Transfer Regulations',
        content: `SAUDI ARABIA PERSONAL DATA PROTECTION LAW (PDPL) STANDARD TRANSFER CLAUSES\n\n1. Purpose and Scope: These clauses govern the transfer of Personal Data from the Kingdom of Saudi Arabia to an entity located outside the Kingdom, in compliance with the Personal Data Protection Law (Royal Decree No. M/148) and SDAIA Executive Regulations.\n\n2. Obligations of Data Exporter:\n(a) Ensure that the transfer does not prejudice national security or vital interests of the Kingdom;\n(b) Ensure that data subjects have provided explicit consent or another lawful basis under Article 5 applies;\n(c) Maintain a formal record of all cross-border transfer assessments.\n\n3. Obligations of Data Importer:\n(a) Process data exclusively for the authorized purpose;\n(b) Apply security measures at least equivalent to the technical requirements under SDAIA regulations;\n(c) Immediately notify the Data Exporter of any government requests or data breaches within 48 hours;\n(d) Submit to audit and enforcement by competent authorities in the Kingdom of Saudi Arabia.`
      }
    ]
  },

  UAE: {
    regionKey: 'UAE',
    displayName: 'United Arab Emirates (UAE)',
    countries: ['United Arab Emirates (Federal, DIFC, ADGM)'],
    primaryFlag: '🇦🇪',
    currency: 'AED',
    currencySymbol: 'د.إ',
    eurConversionRate: 4.02,
    sovereignDataCenter: 'ME-CENTRAL-DUBAI (UAE Sovereign Cloud Enclave)',
    hardwareEnclaveSupported: 'Moro Hub / G42 Sovereign Enclaves',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'UAE-PDPL-2021',
        title: 'UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection',
        shortCode: 'UAE PDPL',
        jurisdictionName: 'United Arab Emirates (Federal)',
        countryFlag: '🇦🇪',
        enactedYear: 2021,
        effectiveDate: '2022-01-02',
        supervisoryAuthority: {
          name: 'UAE Data Office',
          acronym: 'UAE Data Office',
          website: 'https://u.ae',
          headquarters: 'Abu Dhabi / Dubai'
        },
        summary: 'Unified federal data protection law regulating collection, processing, and transfer of personal data of UAE residents.',
        scope: 'Controllers and processors inside the UAE or foreign entities processing personal data of individuals in the UAE.',
        statutoryFineFormula: {
          fixedCapAmount: 'Administrative penalties and compensation determined by UAE Cabinet Decision',
          currency: 'AED',
          humanSummary: 'Cabinet administrative fines, operational suspensions, and civil liability.'
        },
        officialUrl: 'https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws',
        keyArticles: ['Article 5 (Consent Requirements)', 'Article 13 (Information Security Controls)', 'Article 22 (Cross-Border Data Transfers)', 'Article 23 (Mandatory DPO Appointment)'],
        rules: [
          {
            ruleId: 'UAE-PDPL-SECURITY',
            articleRef: 'Article 13',
            title: 'Technical Security & Privacy by Design Controls',
            description: 'Implement appropriate technical and organizational measures to safeguard data against breach, loss, or unauthorized modification.',
            mandatoryControl: 'End-to-end encryption, strict role-based access, and automated data minimization.',
            severity: 'CRITICAL',
            basePenaltyAmount: 500000,
            currency: 'AED',
            verificationChecklist: ['Data Encryption at Rest Active', 'UAE DPO Formally Appointed', 'Data Processing Registry Maintained', 'Annual Security Audit Logged']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'UAE-MECH-DATA-OFFICE-RELAY',
        name: 'UAE Data Office Incident Dispatch Protocol',
        category: 'BREACH_NOTIFICATION',
        statutoryRequirement: 'Breach notification to UAE Data Office and impacted data subjects.',
        timeframeDeadline: 'Immediately upon confirmation',
        enforcementMechanism: 'Automated cryptographic incident ledger.',
        technicalImplementation: 'Direct API dispatch with PII impact categorization.',
        status: 'ACTIVE'
      }
    ],
    clausesTemplates: [
      {
        id: 'UAE-STANDARD-DATA-CLAUSES',
        name: 'UAE Federal Decree-Law 45 Standard Data Processing Clauses',
        type: 'Data Processing Clauses',
        description: 'Standard contract terms complying with UAE Data Office requirements.',
        statuteReference: 'UAE Federal Decree-Law 45/2021 Article 13 & 22',
        content: `UAE FEDERAL DATA PROTECTION LAW NO. 45/2021 STANDARD CLAUSES\n\n1. Scope: In accordance with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection, Processor agrees to process personal data strictly pursuant to Controller instructions.\n\n2. Security: Processor shall implement state-of-the-art encryption and administrative controls.\n\n3. Breach Notification: Processor shall notify Controller within 24 hours of any suspected or actual security breach involving UAE resident data.`
      }
    ]
  },

  UK: {
    regionKey: 'UK',
    displayName: 'United Kingdom',
    countries: ['United Kingdom (England, Scotland, Wales, Northern Ireland)'],
    primaryFlag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    eurConversionRate: 0.86,
    sovereignDataCenter: 'UK-SOUTH-LONDON (London Sovereign Enclave)',
    hardwareEnclaveSupported: 'AWS Nitro & Azure Confidential Compute UK',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'UK-GDPR-DPA-2018',
        title: 'UK General Data Protection Regulation & Data Protection Act 2018',
        shortCode: 'UK GDPR',
        jurisdictionName: 'United Kingdom',
        countryFlag: '🇬🇧',
        enactedYear: 2018,
        effectiveDate: '2021-01-01',
        supervisoryAuthority: {
          name: "Information Commissioner's Office",
          acronym: 'ICO',
          website: 'https://ico.org.uk',
          headquarters: 'Wilmslow, Cheshire, UK'
        },
        summary: 'Post-Brexit UK statutory data protection regime retained in domestic law and enforced by the ICO.',
        scope: 'Entities established in the UK or offering goods/services to individuals in the UK.',
        statutoryFineFormula: {
          maxPercentageTurnover: 4.0,
          fixedCapAmount: '£17,500,000',
          currency: 'GBP',
          humanSummary: 'Up to £17,500,000 or 4% of global annual turnover, whichever is higher.'
        },
        officialUrl: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/',
        keyArticles: ['Article 5 (Principles)', 'Article 32 (Security)', 'Article 33 (72h Notification to ICO)', 'Article 46 (UK IDTA & Addendum)'],
        rules: [
          {
            ruleId: 'UK-GDPR-ICO-NOTIFY',
            articleRef: 'Article 33',
            title: '72-Hour ICO Data Breach Notification Protocol',
            description: 'Controllers must notify the Information Commissioner within 72 hours of becoming aware of a personal data breach.',
            mandatoryControl: 'ICO-formatted incident reporting pipeline with automated severity triage.',
            severity: 'CRITICAL',
            basePenaltyAmount: 450000,
            currency: 'GBP',
            verificationChecklist: ['ICO Webhook Configured', '72h SLA Alert Active', 'Cyber Essentials Plus Validated', 'DPA 2018 Schedule 1 Exemption Logged']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'UK-MECH-IDTA',
        name: 'UK International Data Transfer Addendum (IDTA B.1.0)',
        category: 'DATA_TRANSFER',
        statutoryRequirement: 'Mandatory UK transfer mechanism for restricted international transfers under UK GDPR.',
        enforcementMechanism: 'ICO standard addendum attached to EU SCCs or standalone IDTA.',
        technicalImplementation: 'Cryptographic transfer validation engine with UK adequacy verification.',
        status: 'ENFORCED'
      }
    ],
    clausesTemplates: [
      {
        id: 'UK-IDTA-ADDENDUM',
        name: 'UK International Data Transfer Addendum to EU SCCs (Version B1.0)',
        type: 'International Data Transfer Addendum',
        description: 'Official ICO Addendum modifying EU SCCs for UK GDPR compliance.',
        statuteReference: 'Section 119A Data Protection Act 2018',
        content: `INTERNATIONAL DATA TRANSFER ADDENDUM TO THE EU COMMISSION STANDARD CONTRACTUAL CLAUSES\nVERSION B1.0, in force 21 March 2022\n\nPart 1: Tables\nTable 1: Parties - UK Data Exporter and Importer Details\nTable 2: Selected SCCs - The Approved EU SCCs are appended and modified by Part 2.\nTable 3: Appendix Information - Technical and organisational measures.\n\nPart 2: Mandatory Clauses\n1. Each Party agrees to be bound by the terms and conditions of the Approved Addendum, in exchange for the other Party also agreeing to be bound by it.\n2. In the event of any conflict between the Approved Addendum and the EU SCCs, the Approved Addendum shall prevail.`
      }
    ]
  },

  APAC: {
    regionKey: 'APAC',
    displayName: 'Asia-Pacific (Singapore, India, Japan, etc.)',
    countries: ['Singapore', 'India', 'Japan', 'Bangladesh', 'South Korea', 'Indonesia'],
    primaryFlag: '🌏',
    currency: 'SGD',
    currencySymbol: 'S$',
    eurConversionRate: 1.45,
    sovereignDataCenter: 'APAC-SG-1 (Singapore Sovereign Regional Node)',
    hardwareEnclaveSupported: 'Intel SGX & AWS Nitro Singapore Enclaves',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'ASIA-SG-PDPA-2012',
        title: 'Singapore Personal Data Protection Act 2012 (2020/2024 Amendments)',
        shortCode: 'SG PDPA',
        jurisdictionName: 'Republic of Singapore',
        countryFlag: '🇸🇬',
        enactedYear: 2012,
        effectiveDate: '2022-10-01',
        supervisoryAuthority: {
          name: 'Personal Data Protection Commission (PDPC) & IMDA',
          acronym: 'PDPC / IMDA',
          website: 'https://www.pdpc.gov.sg',
          headquarters: 'Singapore'
        },
        summary: 'Governs collection, use, disclosure and care of personal data in Singapore with mandatory breach notification to PDPC within 3 calendar days.',
        scope: 'All private sector organizations processing personal data in Singapore.',
        statutoryFineFormula: {
          maxPercentageTurnover: 10.0,
          fixedCapAmount: 'S$1,000,000',
          currency: 'SGD',
          humanSummary: 'Up to S$1,000,000 or 10% of annual turnover in Singapore (for revenue > S$10M).'
        },
        officialUrl: 'https://www.pdpc.gov.sg/Overview-of-PDPA/The-Legislation/Personal-Data-Protection-Act',
        keyArticles: ['Section 24 (Protection Obligation)', 'Section 26D (Data Breach Notification within 3 days)', 'Section 26 (Transfer Limitation Obligation)'],
        rules: [
          {
            ruleId: 'SG-PDPA-PROTECT',
            articleRef: 'Section 24',
            title: 'Reasonable Security Safeguards & MAS TRM Alignment',
            description: 'Protect personal data in possession by making reasonable security arrangements to prevent unauthorized access or disclosure.',
            mandatoryControl: 'Multi-factor authentication, row-level encryption, and continuous cyber hygiene audits.',
            severity: 'CRITICAL',
            basePenaltyAmount: 500000,
            currency: 'SGD',
            verificationChecklist: ['MFA Enforced for Admin Access', 'PDPC 3-Day Breach Alert Active', 'Data Protection Officer Registered with ACRA/PDPC', 'Cross-Border Transfer Standard Applied']
          }
        ]
      },
      {
        actId: 'ASIA-IN-DPDP-2023',
        title: 'India Digital Personal Data Protection Act 2023 (DPDP Act)',
        shortCode: 'India DPDP',
        jurisdictionName: 'Republic of India',
        countryFlag: '🇮🇳',
        enactedYear: 2023,
        effectiveDate: '2023-08-11',
        supervisoryAuthority: {
          name: 'Data Protection Board of India (DPBI)',
          acronym: 'DPBI / MeitY',
          website: 'https://www.meity.gov.in',
          headquarters: 'New Delhi, India'
        },
        summary: 'Statutory framework for digital personal data processing in India, imposing heavy penalties for failure to prevent data breaches.',
        scope: 'Processing of digital personal data in India or outside India if connected to offering goods/services in India.',
        statutoryFineFormula: {
          fixedCapAmount: 'Up to ₹250 Crore (~€28,000,000) per instance',
          currency: 'INR',
          humanSummary: 'Up to ₹250 Crore per instance of failure to observe security safeguards.'
        },
        officialUrl: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023',
        keyArticles: ['Section 8 (Data Fiduciary Obligations)', 'Section 9 (Children Personal Data)', 'Section 33 (Penalties)'],
        rules: [
          {
            ruleId: 'IN-DPDP-SEC-8',
            articleRef: 'Section 8(5)',
            title: 'Obligation to Prevent Data Breaches & Security Safeguards',
            description: 'Data Fiduciary must implement reasonable technical safeguards to prevent data breaches.',
            mandatoryControl: 'Data anonymization, HSM key management, and automated access telemetry.',
            severity: 'CRITICAL',
            basePenaltyAmount: 2500000000,
            currency: 'INR',
            verificationChecklist: ['Data Fiduciary Safeguards Active', 'Parental Consent Workflow for Minors', 'Notice in 22 Official Indian Languages', 'Automated Breach Alert to DPBI']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'APAC-MECH-PDPC-3DAY',
        name: 'Singapore PDPC 3-Calendar-Day Breach Notification Relay',
        category: 'BREACH_NOTIFICATION',
        statutoryRequirement: 'Mandatory breach notification to PDPC within 3 calendar days of assessment.',
        timeframeDeadline: '3 Calendar Days (72h)',
        enforcementMechanism: 'Direct PDPC incident filing gateway.',
        technicalImplementation: 'Automated breach threshold evaluation with impact counter.',
        status: 'ACTIVE'
      }
    ],
    clausesTemplates: [
      {
        id: 'APAC-SG-CROSS-BORDER-CONTRACT',
        name: 'Singapore PDPC Standard Cross-Border Contractual Clauses',
        type: 'Cross-Border Contract',
        description: 'Standard clauses meeting Transfer Limitation Obligation under SG PDPA.',
        statuteReference: 'SG PDPA Section 26 & Regulations',
        content: `SINGAPORE PDPA STANDARD CONTRACTUAL CLAUSES FOR CROSS-BORDER DATA TRANSFERS\n\n1. Recipient Undertaking: The Recipient undertakes to provide a standard of protection to Personal Data transferred from Singapore that is comparable to the protection under the Singapore Personal Data Protection Act 2012.\n\n2. Security Measures: Recipient shall maintain appropriate technical and administrative safeguards against unauthorized access.\n\n3. Breach Notification: Recipient shall inform the Transferor in Singapore within 24 hours of any detected personal data breach.`
      }
    ]
  },

  AUSTRALIA: {
    regionKey: 'AUSTRALIA',
    displayName: 'Australia & New Zealand',
    countries: ['Australia', 'New Zealand'],
    primaryFlag: '🇦🇺',
    currency: 'AUD',
    currencySymbol: 'A$',
    eurConversionRate: 1.65,
    sovereignDataCenter: 'AU-EAST-SYDNEY (Sydney Sovereign Enclave)',
    hardwareEnclaveSupported: 'AWS Nitro Sydney & Azure Sovereign Australia',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'AU-PRIVACY-ACT-1988',
        title: 'Australian Privacy Act 1988 & Privacy Legislation Amendment 2022',
        shortCode: 'AU Privacy Act',
        jurisdictionName: 'Commonwealth of Australia',
        countryFlag: '🇦🇺',
        enactedYear: 1988,
        effectiveDate: '2022-12-13',
        supervisoryAuthority: {
          name: 'Office of the Australian Information Commissioner',
          acronym: 'OAIC',
          website: 'https://www.oaic.gov.au',
          headquarters: 'Sydney, Australia'
        },
        summary: 'Enforces 13 Australian Privacy Principles (APPs) with massive penalty increases for serious or repeated privacy breaches.',
        scope: 'Australian government agencies and private sector organizations with annual turnover > AU$3M.',
        statutoryFineFormula: {
          maxPercentageTurnover: 30.0,
          fixedCapAmount: 'AU$50,000,000',
          currency: 'AUD',
          humanSummary: 'Up to AU$50,000,000 or 30% of adjusted turnover, whichever is greater.'
        },
        officialUrl: 'https://www.oaic.gov.au/privacy/privacy-legislation/the-privacy-act',
        keyArticles: ['APP 1 (Open & Transparent Management)', 'APP 8 (Cross-Border Disclosure)', 'APP 11 (Security of Personal Info)', 'Part IIIC (Notifiable Data Breaches Scheme)'],
        rules: [
          {
            ruleId: 'AU-APP-11-NDB',
            articleRef: 'APP 11 & Part IIIC',
            title: 'Notifiable Data Breaches (NDB) Scheme & Security Controls',
            description: 'Entities must take reasonable steps to protect personal info and notify OAIC of eligible data breaches.',
            mandatoryControl: 'Real-time eligible breach evaluation and automated OAIC statement generator.',
            severity: 'CRITICAL',
            basePenaltyAmount: 1000000,
            currency: 'AUD',
            verificationChecklist: ['OAIC NDB Pipeline Configured', 'APP 11 De-identification Active', 'APP 8 Cross-Border Adequacy Signed', 'Annual Privacy Impact Assessment Logged']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'AU-MECH-OAIC-NDB',
        name: 'OAIC Notifiable Data Breaches (NDB) Scheme Relay',
        category: 'BREACH_NOTIFICATION',
        statutoryRequirement: 'Mandatory notification of eligible data breaches to OAIC and affected individuals.',
        timeframeDeadline: 'As soon as practicable (within 30 days of assessment)',
        enforcementMechanism: 'Cryptographic breach assessment statement generation.',
        technicalImplementation: 'Direct OAIC statement submission formatting.',
        status: 'ACTIVE'
      }
    ],
    clausesTemplates: [
      {
        id: 'AU-APP8-DEED',
        name: 'Australian Privacy Principle 8 Cross-Border Transfer Deed',
        type: 'Cross-Border Deed',
        description: 'Contractual agreement ensuring overseas recipient adheres to Australian Privacy Principles.',
        statuteReference: 'Privacy Act 1988 Section 16C & APP 8.1',
        content: `AUSTRALIAN PRIVACY PRINCIPLE 8 (CROSS-BORDER DISCLOSURE) DEED\n\n1. Purpose: To establish enforceable contractual obligations on the Overseas Recipient pursuant to Australian Privacy Principle 8.1.\n\n2. Covenant: The Overseas Recipient covenants that it will not breach the Australian Privacy Principles (other than APP 1) in relation to the personal information transferred.`
      }
    ]
  },

  CANADA: {
    regionKey: 'CANADA',
    displayName: 'Canada',
    countries: ['Canada (Federal & Provincial)'],
    primaryFlag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: 'C$',
    eurConversionRate: 1.48,
    sovereignDataCenter: 'CA-CENTRAL-MONTREAL (Canada Sovereign Cloud Node)',
    hardwareEnclaveSupported: 'AWS Nitro Central & Azure Canada Enclaves',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'CA-PIPEDA-2000',
        title: 'Personal Information Protection and Electronic Documents Act (PIPEDA / Bill C-27)',
        shortCode: 'PIPEDA / CPPA',
        jurisdictionName: 'Canada',
        countryFlag: '🇨🇦',
        enactedYear: 2000,
        effectiveDate: '2018-11-01',
        supervisoryAuthority: {
          name: 'Office of the Privacy Commissioner of Canada',
          acronym: 'OPC',
          website: 'https://www.priv.gc.ca',
          headquarters: 'Gatineau, Quebec, Canada'
        },
        summary: 'Federal private-sector privacy law governing personal information handling and mandatory breach recording.',
        scope: 'Private-sector organizations across Canada that collect, use or disclose personal information in the course of commercial activities.',
        statutoryFineFormula: {
          maxPercentageTurnover: 5.0,
          fixedCapAmount: 'C$25,000,000 under Bill C-27 CPPA',
          currency: 'CAD',
          humanSummary: 'Up to C$25,000,000 or 5% of global revenue for serious violations under modernized framework.'
        },
        officialUrl: 'https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/',
        keyArticles: ['Schedule 1 Principle 7 (Safeguards)', 'Section 10.1 (Mandatory Breach Notification)', 'Bill C-27 CPPA / AIDA Artificial Intelligence and Data Act'],
        rules: [
          {
            ruleId: 'CA-PIPEDA-SAFEGUARD',
            articleRef: 'Principle 7 & Sec 10.1',
            title: 'Reasonable Safeguards & Mandatory OPC Breach Recording',
            description: 'Protect personal information by security safeguards appropriate to sensitivity; maintain mandatory breach records for 24 months.',
            mandatoryControl: 'Automated 24-month immutable breach ledger and OPC incident dispatch pipeline.',
            severity: 'CRITICAL',
            basePenaltyAmount: 500000,
            currency: 'CAD',
            verificationChecklist: ['24-Month Breach Ledger Active', 'OPC Real-Risk of Significant Harm Assessment', 'Consent Meaningful & Granular', 'AIDA AI Governance Audit Ready']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'CA-MECH-OPC-LOG',
        name: 'OPC 24-Month Mandatory Breach Log',
        category: 'AUDIT_LOGGING',
        statutoryRequirement: 'Maintain a record of every breach of security safeguards for at least 24 months.',
        enforcementMechanism: 'Immutable tamper-proof event database logging.',
        technicalImplementation: 'Encrypted DuckDB/SQLite audit log with cryptographic chaining.',
        status: 'ENFORCED'
      }
    ],
    clausesTemplates: [
      {
        id: 'CA-PIPEDA-TRANSFER-CLAUSE',
        name: 'Canada PIPEDA Cross-Border Processing Agreement',
        type: 'Data Processing Agreement',
        description: 'Clauses meeting PIPEDA Principle 7 accountability and safeguarding requirements.',
        statuteReference: 'PIPEDA Schedule 1 Clause 4.1.3',
        content: `CANADA PIPEDA DATA PROCESSING ADDENDUM\n\n1. Accountability: Processor acknowledges that Controller remains accountable for personal information transferred for processing.\n2. Comparable Protection: Processor warrants it will provide a comparable level of protection to that required under PIPEDA.`
      }
    ]
  },

  SWITZERLAND: {
    regionKey: 'SWITZERLAND',
    displayName: 'Switzerland',
    countries: ['Switzerland (Swiss Confederation)'],
    primaryFlag: '🇨🇭',
    currency: 'CHF',
    currencySymbol: 'CHF',
    eurConversionRate: 0.96,
    sovereignDataCenter: 'CH-NORTH-ZURICH (Swiss Banking & Sovereign Enclave)',
    hardwareEnclaveSupported: 'Swisscom Sovereign Enclave & Intel SGX Zurich',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'CH-REVFADP-2023',
        title: 'Swiss Federal Act on Data Protection (revFADP / nFADP 2023)',
        shortCode: 'Swiss revFADP',
        jurisdictionName: 'Switzerland',
        countryFlag: '🇨🇭',
        enactedYear: 2020,
        effectiveDate: '2023-09-01',
        supervisoryAuthority: {
          name: 'Federal Data Protection and Information Commissioner',
          acronym: 'FDPIC / EDÖB',
          website: 'https://www.edoeb.admin.ch',
          headquarters: 'Bern, Switzerland'
        },
        summary: 'Completely modernized Swiss data protection statute aligned with GDPR, featuring personal criminal liability for non-compliance.',
        scope: 'Processing of personal data of natural persons carried out in Switzerland or having effects in Switzerland.',
        statutoryFineFormula: {
          fixedCapAmount: 'Criminal fines up to CHF 250,000 against responsible natural persons (executives / DPOs)',
          currency: 'CHF',
          humanSummary: 'Criminal fines up to CHF 250,000 against responsible natural individuals, plus FDPIC administrative orders.'
        },
        officialUrl: 'https://www.fedlex.admin.ch/eli/cc/2022/491/en',
        keyArticles: ['Article 7 (Privacy by Design/Default)', 'Article 8 (Data Security)', 'Article 16 (Cross-Border Disclosure)', 'Article 24 (Breach Notification to FDPIC)', 'Article 60-66 (Criminal Sanctions)'],
        rules: [
          {
            ruleId: 'CH-FADP-CRIMINAL-DEFENSE',
            articleRef: 'Article 8 & 60',
            title: 'Technical Minimum Security Standards & Executive Liability Shield',
            description: 'Implement minimum data security standards; willful breach of professional secrecy or transfer rules incurs criminal penalties.',
            mandatoryControl: 'Swiss sovereign memory encryption and individual accountability audit logging.',
            severity: 'CRITICAL',
            basePenaltyAmount: 250000,
            currency: 'CHF',
            verificationChecklist: ['Swiss FDPIC Register Up to Date', 'Executive Duty Compliance Documented', 'Cross-Border Adequacy Verified', 'Banking Professional Secrecy Maintained']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'CH-MECH-FDPIC-RELAY',
        name: 'Swiss FDPIC Immediate Breach Notification Relay',
        category: 'BREACH_NOTIFICATION',
        statutoryRequirement: 'Notify the FDPIC as quickly as possible of any data security breach likely to lead to high risk.',
        enforcementMechanism: 'Automated FDPIC incident dossier dispatcher.',
        technicalImplementation: 'Cryptographic incident packaging with high-risk determination matrix.',
        status: 'ACTIVE'
      }
    ],
    clausesTemplates: [
      {
        id: 'CH-FADP-SWISS-ADDENDUM',
        name: 'Swiss Addendum to EU Standard Contractual Clauses',
        type: 'Swiss SCC Addendum',
        description: 'Addendum incorporating Swiss revFADP statutory references into EU SCCs.',
        statuteReference: 'Swiss revFADP Article 16(2)(d)',
        content: `SWISS ADDENDUM TO THE EU STANDARD CONTRACTUAL CLAUSES\n\n1. Reference to GDPR: References to the GDPR shall be read as references to the Swiss Federal Act on Data Protection (revFADP).\n2. Competent Authority: The competent supervisory authority is the Federal Data Protection and Information Commissioner (FDPIC).\n3. Data Subject Rights: Data subjects may bring legal actions in Switzerland.`
      }
    ]
  },

  LATIN_AMERICA: {
    regionKey: 'LATIN_AMERICA',
    displayName: 'Latin America (Brazil LGPD, Mexico, etc.)',
    countries: ['Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia'],
    primaryFlag: '🇧🇷',
    currency: 'BRL',
    currencySymbol: 'R$',
    eurConversionRate: 5.95,
    sovereignDataCenter: 'LATAM-BR-SAOPAULO (São Paulo Sovereign Node)',
    hardwareEnclaveSupported: 'AWS Nitro São Paulo & Azure Brazil South',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'LATAM-BR-LGPD-2018',
        title: 'Brazil Lei Geral de Proteção de Dados (LGPD - Law 13.709/2018)',
        shortCode: 'Brazil LGPD',
        jurisdictionName: 'Federative Republic of Brazil',
        countryFlag: '🇧🇷',
        enactedYear: 2018,
        effectiveDate: '2020-09-18',
        supervisoryAuthority: {
          name: 'Autoridade Nacional de Proteção de Dados',
          acronym: 'ANPD',
          website: 'https://www.gov.br/anpd/pt-br',
          headquarters: 'Brasília, Brazil'
        },
        summary: "Brazil's comprehensive data protection law establishing 10 legal bases for processing, mandatory DPO (Encarregado) appointment, and ANPD fine enforcement.",
        scope: 'Any data processing operation carried out in Brazil or involving individuals located in Brazil.',
        statutoryFineFormula: {
          maxPercentageTurnover: 2.0,
          fixedCapAmount: 'R$50,000,000 per violation',
          currency: 'BRL',
          humanSummary: 'Up to 2% of company turnover in Brazil, capped at R$50,000,000 per violation, plus daily compounding fines.'
        },
        officialUrl: 'https://www.gov.br/anpd/pt-br',
        keyArticles: ['Article 7 (Legal Bases)', 'Article 41 (Encarregado/DPO Appointment)', 'Article 46 (Security Standards)', 'Article 48 (Breach Notification within Reasonable Time)', 'Article 52 (Sanctions)'],
        rules: [
          {
            ruleId: 'BR-LGPD-ENCARREGADO',
            articleRef: 'Article 41 & 46',
            title: 'Encarregado (DPO) Mandatory Public Portal & Security Safeguards',
            description: 'Controllers must appoint and publicly disclose contact of the Encarregado (DPO) and adopt technical security measures.',
            mandatoryControl: 'Public Encarregado contact widget, Portuguese privacy notice, and AES-256 database protection.',
            severity: 'CRITICAL',
            basePenaltyAmount: 1000000,
            currency: 'BRL',
            verificationChecklist: ['Encarregado (DPO) Publicly Listed', 'ANPD Incident Relay Active', 'Portuguese Privacy Policy Published', 'Security Safeguards Validated']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'LATAM-MECH-ANPD-NOTIFY',
        name: 'ANPD Data Breach Notification Gateway',
        category: 'BREACH_NOTIFICATION',
        statutoryRequirement: 'Notify ANPD within reasonable time of security incident causing relevant risk.',
        timeframeDeadline: '3 Business Days (ANPD Standard)',
        enforcementMechanism: 'Direct ANPD incident report filing module.',
        technicalImplementation: 'Automated ANPD incident report generator in Portuguese.',
        status: 'ACTIVE'
      }
    ],
    clausesTemplates: [
      {
        id: 'LATAM-BR-LGPD-DPA',
        name: 'Brazil LGPD Standard Contractual Clauses (Cláusulas-Padrão Contratuais ANPD)',
        type: 'Data Processing Agreement',
        description: 'Standard contractual terms aligned with ANPD Resolution CD/ANPD No. 19/2024.',
        statuteReference: 'LGPD Article 33 & ANPD Resolution 19',
        content: `TERMO DE TRATAMENTO DE DADOS PESSOAIS - LGPD (LEI Nº 13.709/2018)\n\n1. Objeto: O presente termo disciplina o tratamento de dados pessoais realizado pelo Operador em nome do Controlador.\n2. Obrigações: O Operador compromete-se a implementar medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados.\n3. Comunicação de Incidentes: O Operador comunicará ao Controlador qualquer incidente de segurança no prazo máximo de 48 horas.`
      }
    ]
  },

  AFRICA: {
    regionKey: 'AFRICA',
    displayName: 'Africa (South Africa, Nigeria, Kenya, etc.)',
    countries: ['South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Egypt'],
    primaryFlag: '🌍',
    currency: 'ZAR',
    currencySymbol: 'R',
    eurConversionRate: 19.8,
    sovereignDataCenter: 'AFRICA-ZA-JOHANNESBURG (Johannesburg Sovereign Node)',
    hardwareEnclaveSupported: 'AWS Nitro Cape Town & Azure South Africa North',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'AFRICA-ZA-POPIA-2013',
        title: 'South Africa Protection of Personal Information Act (POPIA 2013)',
        shortCode: 'POPIA',
        jurisdictionName: 'Republic of South Africa',
        countryFlag: '🇿🇦',
        enactedYear: 2013,
        effectiveDate: '2021-07-01',
        supervisoryAuthority: {
          name: 'Information Regulator South Africa',
          acronym: 'IRSA',
          website: 'https://inforegulator.org.za',
          headquarters: 'Pretoria, South Africa'
        },
        summary: 'South Africa statutory framework with 8 conditions for lawful processing, Information Officer registration, and criminal sanctions.',
        scope: 'Public and private bodies processing personal information in South Africa.',
        statutoryFineFormula: {
          fixedCapAmount: 'Administrative fine up to R10,000,000 or up to 10 years imprisonment',
          currency: 'ZAR',
          humanSummary: 'Administrative fines up to R10,000,000 and criminal penalties up to 10 years imprisonment for severe offenses.'
        },
        officialUrl: 'https://popia.co.za/',
        keyArticles: ['Condition 7 (Security Safeguards)', 'Section 22 (Notification of Security Compromises)', 'Section 55 (Information Officer Registration)'],
        rules: [
          {
            ruleId: 'ZA-POPIA-SAFEGUARD',
            articleRef: 'Condition 7 & Section 22',
            title: 'Information Officer Registration & Incident Compromise Notification',
            description: 'Responsible party must secure integrity and confidentiality of personal information and notify Information Regulator as soon as reasonably possible.',
            mandatoryControl: 'Registered Information Officer portal, automated compromise alert, and PAIA manual maintenance.',
            severity: 'CRITICAL',
            basePenaltyAmount: 5000000,
            currency: 'ZAR',
            verificationChecklist: ['Information Officer Registered with IRSA', 'Section 22 Compromise Notice Active', 'PAIA Manual Published', 'Condition 7 Security Verified']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'AFRICA-MECH-IRSA-RELAY',
        name: 'South Africa Information Regulator Compromise Relay',
        category: 'BREACH_NOTIFICATION',
        statutoryRequirement: 'Notify Information Regulator and data subjects of security compromise as soon as reasonably possible.',
        timeframeDeadline: 'As soon as reasonably possible',
        enforcementMechanism: 'IRSA Form 1 incident filing module.',
        technicalImplementation: 'Direct IRSA submission generator.',
        status: 'ACTIVE'
      }
    ],
    clausesTemplates: [
      {
        id: 'AFRICA-ZA-OPERATOR-AGREEMENT',
        name: 'South Africa POPIA Operator Agreement (Section 21)',
        type: 'Operator Agreement',
        description: 'Statutory contract required between Responsible Party and Operator.',
        statuteReference: 'POPIA Section 21',
        content: `POPIA OPERATOR AGREEMENT (SECTION 21 MANDATE)\n\n1. Mandate: Operator shall process personal information only with knowledge or authorization of Responsible Party.\n2. Security: Operator must establish and maintain security measures referred to in Section 19 of POPIA.\n3. Notification: Operator must immediately notify Responsible Party where there are reasonable grounds to believe personal information has been accessed by unauthorized person.`
      }
    ]
  },

  GLOBAL: {
    regionKey: 'GLOBAL',
    displayName: 'Global Standards (ISO, SOC 2, NIST)',
    countries: ['International Standards (Global Cross-Border Applicability)'],
    primaryFlag: '🌐',
    currency: 'USD',
    currencySymbol: '$',
    eurConversionRate: 1.08,
    sovereignDataCenter: 'GLOBAL-MULTI-REGION (Automated Geolocation Routing)',
    hardwareEnclaveSupported: 'Multi-Cloud FIPS 140-2 Level 3 Hardware Enclaves',
    defaultBreachWindowHours: 72,
    acts: [
      {
        actId: 'GLOBAL-ISO-27001-2022',
        title: 'ISO/IEC 27001:2022 Information Security Management Systems & ISO 27701 Privacy',
        shortCode: 'ISO 27001 / 27701',
        jurisdictionName: 'International Organization for Standardization',
        countryFlag: '🌐',
        enactedYear: 2022,
        effectiveDate: '2022-10-25',
        supervisoryAuthority: {
          name: 'Accredited Certification Bodies (UKAS, DAkkS, ANAB)',
          acronym: 'ISO / IAF',
          website: 'https://www.iso.org',
          headquarters: 'Geneva, Switzerland'
        },
        summary: 'Global gold standard for Information Security Management Systems (ISMS) and Privacy Information Management Systems (PIMS).',
        scope: 'Any organization worldwide managing sensitive client data, SaaS infrastructure, or cloud platforms.',
        statutoryFineFormula: {
          fixedCapAmount: 'Loss of ISO 27001 certification, enterprise contract breach liability, and B2B vendor disqualification',
          currency: 'USD',
          humanSummary: 'Loss of accreditation, breach of enterprise MSA contractual guarantees, and vendor disqualification.'
        },
        officialUrl: 'https://www.iso.org/standard/27001',
        keyArticles: ['Control 5.10 (Acceptable Use)', 'Control 8.8 (Management of Technical Vulnerabilities)', 'Control 8.24 (Use of Cryptography)', 'Control 5.23 (Information Security for Cloud Services)'],
        rules: [
          {
            ruleId: 'GLOBAL-ISO-CONTROLS',
            articleRef: 'Annex A Controls',
            title: 'Annex A 93 Controls Continuous Verification & ISMS Audit Ledger',
            description: 'Implement, maintain, and continually improve information security controls with immutable evidence trails.',
            mandatoryControl: 'Automated evidence collection across cloud infrastructure and continuous SOC telemetry.',
            severity: 'CRITICAL',
            basePenaltyAmount: 500000,
            currency: 'USD',
            verificationChecklist: ['Statement of Applicability (SoA) Current', 'Risk Treatment Plan Documented', 'Internal Audit Conducted', 'Cryptography Policy Active']
          }
        ]
      }
    ],
    mechanisms: [
      {
        id: 'GLOBAL-MECH-ZERO-TRUST',
        name: 'Zero-Trust Architecture & Ephemeral Credential Rotation',
        category: 'ENCLAVE_SOVEREIGNTY',
        statutoryRequirement: 'Continuous verification of all access requests regardless of network location.',
        enforcementMechanism: 'mTLS mutual authentication with hardware token validation.',
        technicalImplementation: 'Short-lived cryptographic certificates and IAM role assumption.',
        status: 'ENFORCED'
      }
    ],
    clausesTemplates: [
      {
        id: 'GLOBAL-SOC2-DPA',
        name: 'Enterprise Global Data Processing Addendum (Multi-Jurisdiction)',
        type: 'Global DPA',
        description: 'Universal master data processing agreement with dynamic regional schedules.',
        statuteReference: 'ISO 27001 & SOC 2 Type II Trust Services Criteria',
        content: `GLOBAL ENTERPRISE DATA PROCESSING ADDENDUM\n\n1. Worldwide Scope: This Addendum applies to all Processing of Personal Data across all jurisdictions.\n2. Standard of Care: Provider agrees to maintain SOC 2 Type II and ISO 27001:2022 certifications throughout the term.\n3. Regional Schedules: In the event data originates from the EU, UK, Saudi Arabia, USA, or Singapore, the respective Regional Schedule shall automatically apply.`
      }
    ]
  }
};

/**
 * Intelligent User Region Detection Helper
 * Analyzes user registration metadata, tenant data, localStorage, and browser locale.
 */
export function detectUserRegion(user: any, session?: any): DetectedUserRegion {
  const timestamp = new Date().toISOString();

  // 1. Explicit user override from localStorage
  const savedOverride = localStorage.getItem('9xen-regulettee_user_region_override');
  if (savedOverride && REGIONAL_FRAMEWORKS[savedOverride as RegionKey]) {
    return {
      regionKey: savedOverride as RegionKey,
      detectionSource: 'USER_OVERRIDE',
      confidenceScore: 100,
      sovereignNode: REGIONAL_FRAMEWORKS[savedOverride as RegionKey].sovereignDataCenter,
      matchedField: 'localStorage.9xen-regulettee_user_region_override',
      timestamp
    };
  }

  // 2. User registration metadata in Supabase/AuthContext
  const meta = user?.user_metadata || {};
  const country = (meta.country || meta.organization_country || meta.jurisdiction || meta.region || '').toUpperCase().trim();

  // Map country strings to RegionKey
  if (country) {
    if (country === 'EU' || country.includes('GERMANY') || country.includes('FRANCE') || country.includes('IRELAND') || country.includes('NETHERLANDS') || country.includes('ITALY') || country.includes('SPAIN') || country.includes('EUROPE')) {
      return {
        regionKey: 'EU',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 98,
        registeredCountry: meta.country || 'European Union',
        sovereignNode: REGIONAL_FRAMEWORKS.EU.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'US' || country === 'USA' || country.includes('UNITED STATES') || country.includes('CALIFORNIA') || country.includes('AMERICA')) {
      return {
        regionKey: 'USA',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 98,
        registeredCountry: 'United States',
        sovereignNode: REGIONAL_FRAMEWORKS.USA.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'SA' || country === 'KSA' || country.includes('SAUDI') || country.includes('RIYADH')) {
      return {
        regionKey: 'KSA',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 99,
        registeredCountry: 'Kingdom of Saudi Arabia',
        sovereignNode: REGIONAL_FRAMEWORKS.KSA.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'AE' || country === 'UAE' || country.includes('EMIRATES') || country.includes('DUBAI') || country.includes('ABU DHABI')) {
      return {
        regionKey: 'UAE',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 98,
        registeredCountry: 'United Arab Emirates',
        sovereignNode: REGIONAL_FRAMEWORKS.UAE.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'UK' || country === 'GB' || country.includes('UNITED KINGDOM') || country.includes('BRITAIN') || country.includes('ENGLAND') || country.includes('LONDON')) {
      return {
        regionKey: 'UK',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 98,
        registeredCountry: 'United Kingdom',
        sovereignNode: REGIONAL_FRAMEWORKS.UK.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'SG' || country === 'IN' || country === 'JP' || country === 'APAC' || country.includes('SINGAPORE') || country.includes('INDIA') || country.includes('JAPAN') || country.includes('ASIA') || country.includes('BANGLADESH')) {
      return {
        regionKey: 'APAC',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 96,
        registeredCountry: meta.country || 'Asia-Pacific',
        sovereignNode: REGIONAL_FRAMEWORKS.APAC.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'AU' || country === 'NZ' || country.includes('AUSTRALIA') || country.includes('NEW ZEALAND') || country.includes('SYDNEY')) {
      return {
        regionKey: 'AUSTRALIA',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 97,
        registeredCountry: meta.country || 'Australia',
        sovereignNode: REGIONAL_FRAMEWORKS.AUSTRALIA.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'CA' || country.includes('CANADA') || country.includes('QUEBEC') || country.includes('ONTARIO')) {
      return {
        regionKey: 'CANADA',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 97,
        registeredCountry: 'Canada',
        sovereignNode: REGIONAL_FRAMEWORKS.CANADA.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'CH' || country.includes('SWISS') || country.includes('SWITZERLAND') || country.includes('ZURICH') || country.includes('GENEVA')) {
      return {
        regionKey: 'SWITZERLAND',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 98,
        registeredCountry: 'Switzerland',
        sovereignNode: REGIONAL_FRAMEWORKS.SWITZERLAND.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'BR' || country === 'LATAM' || country.includes('BRAZIL') || country.includes('MEXICO') || country.includes('ARGENTINA')) {
      return {
        regionKey: 'LATIN_AMERICA',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 96,
        registeredCountry: 'Brazil',
        sovereignNode: REGIONAL_FRAMEWORKS.LATIN_AMERICA.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
    if (country === 'ZA' || country === 'NG' || country === 'AFRICA' || country.includes('SOUTH AFRICA') || country.includes('NIGERIA') || country.includes('KENYA')) {
      return {
        regionKey: 'AFRICA',
        detectionSource: 'REGISTRATION_METADATA',
        confidenceScore: 95,
        registeredCountry: 'South Africa',
        sovereignNode: REGIONAL_FRAMEWORKS.AFRICA.sovereignDataCenter,
        matchedField: 'user.user_metadata.country',
        timestamp
      };
    }
  }

  // 3. Stored global country preference in JurisdictionContext
  const globalCountry = localStorage.getItem('app_global_country');
  if (globalCountry) {
    if (globalCountry === 'SA') return { regionKey: 'KSA', detectionSource: 'TENANT_PROFILE', confidenceScore: 92, registeredCountry: 'Saudi Arabia', sovereignNode: REGIONAL_FRAMEWORKS.KSA.sovereignDataCenter, matchedField: 'localStorage.app_global_country', timestamp };
    if (globalCountry === 'AE') return { regionKey: 'UAE', detectionSource: 'TENANT_PROFILE', confidenceScore: 92, registeredCountry: 'UAE', sovereignNode: REGIONAL_FRAMEWORKS.UAE.sovereignDataCenter, matchedField: 'localStorage.app_global_country', timestamp };
    if (globalCountry === 'US-CA' || globalCountry === 'US-HIPAA') return { regionKey: 'USA', detectionSource: 'TENANT_PROFILE', confidenceScore: 92, registeredCountry: 'United States', sovereignNode: REGIONAL_FRAMEWORKS.USA.sovereignDataCenter, matchedField: 'localStorage.app_global_country', timestamp };
    if (globalCountry === 'CA') return { regionKey: 'CANADA', detectionSource: 'TENANT_PROFILE', confidenceScore: 92, registeredCountry: 'Canada', sovereignNode: REGIONAL_FRAMEWORKS.CANADA.sovereignDataCenter, matchedField: 'localStorage.app_global_country', timestamp };
    if (globalCountry === 'ZA' || globalCountry === 'NG') return { regionKey: 'AFRICA', detectionSource: 'TENANT_PROFILE', confidenceScore: 90, registeredCountry: 'Africa', sovereignNode: REGIONAL_FRAMEWORKS.AFRICA.sovereignDataCenter, matchedField: 'localStorage.app_global_country', timestamp };
    if (globalCountry === 'EU') return { regionKey: 'EU', detectionSource: 'TENANT_PROFILE', confidenceScore: 92, registeredCountry: 'European Union', sovereignNode: REGIONAL_FRAMEWORKS.EU.sovereignDataCenter, matchedField: 'localStorage.app_global_country', timestamp };
  }

  // 4. System Timezone / Locale Inference
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Riyadh')) {
      return { regionKey: 'KSA', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 88, registeredCountry: 'Saudi Arabia (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.KSA.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('Dubai') || tz.includes('Abu_Dhabi') || tz.includes('Muscat')) {
      return { regionKey: 'UAE', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 88, registeredCountry: 'UAE (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.UAE.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('London')) {
      return { regionKey: 'UK', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 88, registeredCountry: 'United Kingdom (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.UK.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('Berlin') || tz.includes('Paris') || tz.includes('Rome') || tz.includes('Madrid') || tz.includes('Amsterdam') || tz.includes('Brussels') || tz.includes('Dublin')) {
      return { regionKey: 'EU', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 88, registeredCountry: 'European Union (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.EU.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago') || tz.includes('Denver')) {
      return { regionKey: 'USA', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 88, registeredCountry: 'United States (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.USA.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('Singapore') || tz.includes('Tokyo') || tz.includes('Kolkata') || tz.includes('Dhaka')) {
      return { regionKey: 'APAC', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 85, registeredCountry: 'Asia-Pacific (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.APAC.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Auckland')) {
      return { regionKey: 'AUSTRALIA', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 88, registeredCountry: 'Australia / NZ (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.AUSTRALIA.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('Zurich')) {
      return { regionKey: 'SWITZERLAND', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 90, registeredCountry: 'Switzerland (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.SWITZERLAND.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('Sao_Paulo')) {
      return { regionKey: 'LATIN_AMERICA', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 88, registeredCountry: 'Brazil (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.LATIN_AMERICA.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal')) {
      return { regionKey: 'CANADA', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 88, registeredCountry: 'Canada (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.CANADA.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
    if (tz.includes('Johannesburg') || tz.includes('Lagos') || tz.includes('Nairobi')) {
      return { regionKey: 'AFRICA', detectionSource: 'SYSTEM_LOCALE', confidenceScore: 85, registeredCountry: 'Africa (Inferred via Timezone)', sovereignNode: REGIONAL_FRAMEWORKS.AFRICA.sovereignDataCenter, matchedField: 'Intl.timeZone', timestamp };
    }
  } catch (e) {
    // ignore
  }

  // Default fallback to EU
  return {
    regionKey: 'EU',
    detectionSource: 'SYSTEM_LOCALE',
    confidenceScore: 80,
    registeredCountry: 'European Union (Default Sovereign Standard)',
    sovereignNode: REGIONAL_FRAMEWORKS.EU.sovereignDataCenter,
    matchedField: 'DEFAULT_FALLBACK',
    timestamp
  };
}

/**
 * Calculates theoretical maximum statutory liability under the specified regional framework.
 */
export function calculateRegionalStatutoryLiability(
  regionKey: RegionKey,
  annualRevenueEur: number = 50000000,
  affectedRecords: number = 50000,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
): {
  maxStatutoryFineEur: number;
  maxStatutoryFineFormatted: string;
  currency: string;
  statuteApplied: string;
  formulaDescription: string;
  severityMultiplier: number;
} {
  const framework = REGIONAL_FRAMEWORKS[regionKey] || REGIONAL_FRAMEWORKS.EU;
  const severityMultipliers = { LOW: 0.1, MEDIUM: 0.35, HIGH: 0.75, CRITICAL: 1.0 };
  const mult = severityMultipliers[severity];

  let maxStatutoryFineEur = 20000000;
  let formulaDesc = 'Standard statutory maximum formula';
  let primaryStatute = framework.acts[0]?.title || 'Regional Data Protection Law';

  switch (regionKey) {
    case 'EU':
      // 4% turnover or 20M EUR
      const turnover4pct = annualRevenueEur * 0.04;
      maxStatutoryFineEur = Math.max(20000000, turnover4pct) * mult;
      formulaDesc = `Article 83(5) GDPR: Max of €20,000,000 or 4% of €${(annualRevenueEur / 1e6).toFixed(1)}M global turnover (applied at ${(mult * 100).toFixed(0)}% severity).`;
      break;

    case 'USA':
      // CCPA statutory damages $7,500/record or intentional breach
      const ccpaFine = Math.min(25000000, affectedRecords * 7500 / framework.eurConversionRate);
      maxStatutoryFineEur = Math.max(7500000, ccpaFine) * mult;
      formulaDesc = `Cal. Civ. Code § 1798.155: $7,500 per intentional violation across ${affectedRecords.toLocaleString()} consumer records.`;
      break;

    case 'KSA':
      // SDAIA PDPL SAR 5,000,000 cap per violation (convert to EUR)
      const baseSar = 5000000;
      maxStatutoryFineEur = (baseSar / framework.eurConversionRate) * mult;
      formulaDesc = `SDAIA PDPL Article 35: Up to SAR ${(baseSar * mult).toLocaleString()} (~€${Math.round(maxStatutoryFineEur).toLocaleString()}) statutory fine.`;
      break;

    case 'UAE':
      maxStatutoryFineEur = (3000000 / framework.eurConversionRate) * mult;
      formulaDesc = `UAE Federal Law 45: Administrative penalty up to AED ${(3000000 * mult).toLocaleString()}.`;
      break;

    case 'UK':
      const ukTurnover4pct = (annualRevenueEur * 0.04);
      maxStatutoryFineEur = Math.max(17500000 / framework.eurConversionRate, ukTurnover4pct) * mult;
      formulaDesc = `UK GDPR / DPA 2018: Max of £17,500,000 or 4% global turnover.`;
      break;

    case 'APAC':
      const sgTurnover10pct = (annualRevenueEur * 0.10);
      maxStatutoryFineEur = Math.max(1000000 / framework.eurConversionRate, sgTurnover10pct) * mult;
      formulaDesc = `SG PDPA Section 26: Up to S$1,000,000 or 10% annual Singapore turnover.`;
      break;

    case 'AUSTRALIA':
      const auTurnover30pct = (annualRevenueEur * 0.30);
      maxStatutoryFineEur = Math.max(50000000 / framework.eurConversionRate, auTurnover30pct) * mult;
      formulaDesc = `Privacy Act 1988: Up to AU$50,000,000 or 30% adjusted turnover for serious breaches.`;
      break;

    case 'SWITZERLAND':
      maxStatutoryFineEur = (250000 / framework.eurConversionRate) * mult;
      formulaDesc = `Swiss revFADP Article 60: Criminal individual liability up to CHF 250,000.`;
      break;

    case 'LATIN_AMERICA':
      const brTurnover2pct = (annualRevenueEur * 0.02);
      maxStatutoryFineEur = Math.min(50000000 / framework.eurConversionRate, brTurnover2pct) * mult;
      formulaDesc = `Brazil LGPD Article 52: 2% of turnover in Brazil capped at R$50,000,000.`;
      break;

    default:
      maxStatutoryFineEur = 15000000 * mult;
      formulaDesc = 'Global standard statutory risk exposure.';
      break;
  }

  const localCurrencyAmount = Math.round(maxStatutoryFineEur * framework.eurConversionRate);

  return {
    maxStatutoryFineEur: Math.round(maxStatutoryFineEur),
    maxStatutoryFineFormatted: `${framework.currencySymbol}${localCurrencyAmount.toLocaleString()} (${framework.currency} / ~€${Math.round(maxStatutoryFineEur).toLocaleString()})`,
    currency: framework.currency,
    statuteApplied: primaryStatute,
    formulaDescription: formulaDesc,
    severityMultiplier: mult
  };
}

export const REGIONAL_LIST = (Object.keys(REGIONAL_FRAMEWORKS) as RegionKey[]).map((key) => {
  const fw = REGIONAL_FRAMEWORKS[key];
  return {
    key,
    displayName: fw.displayName,
    flag: fw.primaryFlag,
    currency: fw.currency,
    currencySymbol: fw.currencySymbol,
    dataCenter: fw.sovereignDataCenter,
    actCount: fw.acts.length,
    ruleCount: fw.acts.reduce((acc, a) => acc + a.rules.length, 0)
  };
});
