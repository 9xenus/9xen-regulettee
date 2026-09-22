/**
 * 9XEN_REGULETTEE REGULATORY MAPPING & POLICY ENGINE
 * Core service for multi-regulation mapping (EU AI Act, GDPR, NIS2, DORA, ePrivacy, SOC2, HIPAA, CCPA)
 * and automated AI Risk Categorization framework.
 */

import { queryDb, queryOne } from '../db/db-adapter';
import crypto from 'crypto';

export type RiskTier = 'UNACCEPTABLE_RISK' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RegulatoryFramework {
  id: string;
  code: string;
  name: string;
  jurisdiction: string;
  description: string;
  riskCategories: string[];
  primaryArticles: Array<{
    article: string;
    title: string;
    summary: string;
    mandatoryControls: string[];
  }>;
}

export interface PolicyRule {
  id: string;
  frameworkCode: string;
  category: string;
  ruleCode: string;
  title: string;
  description: string;
  conditionExpression: string;
  severity: SeverityLevel;
  autoFixable: boolean;
  remediationSuggestion: string;
  isActive: boolean;
}

export interface AiModelSpec {
  id?: string;
  tenantId?: string;
  modelName: string;
  modelVersion?: string;
  purposeDescription: string;
  deploymentDomain: 'FINANCE' | 'HEALTHCARE' | 'HR_RECRUITMENT' | 'BIOMETRICS' | 'CRITICAL_INFRASTRUCTURE' | 'CUSTOMER_SERVICE' | 'GENERAL_UTILITY';
  usesBiometrics: boolean;
  usesSocialScoring: boolean;
  autonomousDecisionMaking: boolean;
  targetsVulnerableGroups: boolean;
  generatesSyntheticMedia: boolean;
  datasetHasSensitiveData: boolean;
}

export interface AiRiskClassificationResult {
  modelName: string;
  riskTier: RiskTier;
  riskScore: number; // 0 - 100
  articleReference: string;
  legalJustification: string;
  mandatorySafeguards: string[];
  crossRegulatoryImpacts: Array<{
    framework: string;
    clause: string;
    impactDescription: string;
  }>;
  requiredActions: string[];
}

// Default Supported Regulatory Frameworks Repository
export const SUPPORTED_FRAMEWORKS: RegulatoryFramework[] = [
  {
    id: 'fw-ai-act',
    code: 'EU_AI_ACT',
    name: 'EU AI Act (Regulation EU 2024/1689)',
    jurisdiction: 'European Union / Global',
    description: 'Comprehensive legal framework for artificial intelligence risk management, transparency, and safety.',
    riskCategories: ['UNACCEPTABLE_RISK', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK'],
    primaryArticles: [
      {
        article: 'Article 5',
        title: 'Prohibited AI Practices',
        summary: 'Bans social scoring, cognitive manipulation, untargeted facial scraping, and real-time public biometric identification.',
        mandatoryControls: ['Immediate Deprecation', 'Strict Prohibition Audit', 'Zero System Deployment']
      },
      {
        article: 'Article 6 & Annex III',
        title: 'High-Risk AI Systems Classification',
        summary: 'Mandates strict risk management, high-quality training datasets, logging, and human oversight for Annex III domains.',
        mandatoryControls: ['Risk Management System (Art 9)', 'Data Governance (Art 10)', 'Technical Documentation (Art 11)', 'Human Oversight (Art 14)', 'CE Marking']
      },
      {
        article: 'Article 50',
        title: 'Transparency Obligations for Certain AI Systems',
        summary: 'Requires clear disclosures when users interact with AI or consume AI-generated synthetic content (deepfakes).',
        mandatoryControls: ['Machine-Readable Watermarking', 'AI Disclosure Banner', 'Synthetic Content Tagging']
      }
    ]
  },
  {
    id: 'fw-gdpr',
    code: 'GDPR',
    name: 'General Data Protection Regulation (EU 2016/679)',
    jurisdiction: 'European Union',
    description: 'Regulates data privacy, consent management, automated individual decision-making, and personal data transfers.',
    riskCategories: ['CRITICAL_DATA_BREACH', 'UNLAWFUL_PROCESSING', 'INADEQUATE_CONSENT', 'PRIVACY_COMPLIANT'],
    primaryArticles: [
      {
        article: 'Article 5 & 6',
        title: 'Principles & Lawfulness of Processing',
        summary: 'Data minimization, purpose limitation, and mandatory explicit legal basis for data processing.',
        mandatoryControls: ['Explicit Consent Check', 'Data Minimization Audit', 'Purpose Limitation Binding']
      },
      {
        article: 'Article 22',
        title: 'Automated Individual Decision-Making',
        summary: 'Grants individuals the right not to be subject to decisions based solely on automated processing.',
        mandatoryControls: ['Human-in-the-Loop Override', 'Explanation Engine', 'Opt-out Mechanism']
      },
      {
        article: 'Article 35',
        title: 'Data Protection Impact Assessment (DPIA)',
        summary: 'Mandatory impact assessment prior to processing high-risk sensitive data or biometric profiling.',
        mandatoryControls: ['Formal DPIA Dossier', 'DPO Review', 'Prior Consultation Protocol']
      }
    ]
  },
  {
    id: 'fw-nis2',
    code: 'NIS2',
    name: 'NIS2 Directive (EU 2022/2555)',
    jurisdiction: 'European Union',
    description: 'High common level of cybersecurity across essential and important entities in the Union.',
    riskCategories: ['SUPPLY_CHAIN_RISK', 'INCIDENT_RESPONSE_FAILURE', 'CRYPTOGRAPHIC_NONCOMPLIANCE', 'CYBER_RESILIENT'],
    primaryArticles: [
      {
        article: 'Article 21',
        title: 'Cybersecurity Risk Management Measures',
        summary: 'Requires multi-factor authentication, supply chain security, vulnerability handling, and cryptography.',
        mandatoryControls: ['MFA Enforcement', 'Software Supply Chain SBOM', 'Incident Escalation SOP', 'AES-256 / Post-Quantum Cryptography']
      },
      {
        article: 'Article 23',
        title: 'Reporting Obligations',
        summary: 'Mandates early warning within 24 hours of significant cybersecurity incident awareness.',
        mandatoryControls: ['24h CSIRT Alert Trigger', 'Automated Incident Log Stream', '72h Detailed Impact Report']
      }
    ]
  },
  {
    id: 'fw-dora',
    code: 'DORA',
    name: 'Digital Operational Resilience Act (Regulation EU 2022/2554)',
    jurisdiction: 'European Union (Financial Sector)',
    description: 'Framework to prevent and mitigate cyber threats across financial entities and third-party ICT providers.',
    riskCategories: ['ICT_THIRD_PARTY_CONCENTRATION', 'SYSTEM_DISRUPTION', 'UNAUTHORISED_DATA_ACCESS'],
    primaryArticles: [
      {
        article: 'Articles 5 - 16',
        title: 'ICT Risk Management Framework',
        summary: 'Continuous risk identification, digital resilience testing, and business continuity management.',
        mandatoryControls: ['RTO/RPO SLA Monitors', 'Threat-Led Penetration Testing (TLPT)', 'Vendor Concentration Audit']
      }
    ]
  },
  {
    id: 'fw-eprivacy',
    code: 'EPRIVACY',
    name: 'ePrivacy Directive (2002/58/EC)',
    jurisdiction: 'European Union',
    description: 'Privacy in electronic communications and cookie / tracking storage device consent.',
    riskCategories: ['ILLEGAL_COOKIE_TRACKING', 'UNCONSENTED_DIRECT_MARKETING'],
    primaryArticles: [
      {
        article: 'Article 5(3)',
        title: 'Cookie & Tracking Storage Consent',
        summary: 'Requires prior opt-in consent before setting non-essential cookies or tracking scripts.',
        mandatoryControls: ['Equal Prominence Opt-Out Banner', 'Prior Script Blocker', 'Cookie Audit Ledger']
      }
    ]
  },
  {
    id: 'fw-soc2',
    code: 'SOC2',
    name: 'SOC 2 Type II Security & Trust Principles',
    jurisdiction: 'Global / US Enterprise',
    description: 'Auditing procedure ensuring service providers securely manage customer data across 5 Trust Services Criteria.',
    riskCategories: ['SECURITY', 'AVAILABILITY', 'PROCESSING_INTEGRITY', 'CONFIDENTIALITY', 'PRIVACY'],
    primaryArticles: [
      {
        article: 'CC6.1 - CC6.8',
        title: 'Logical and Physical Access Controls',
        summary: 'Restricts logical access, enforces role-based permissions, and maintains immutable audit trails.',
        mandatoryControls: ['RBAC Identity Management', 'Continuous Security Monitoring', 'TLS 1.3 Transport Encryption']
      }
    ]
  },
  {
    id: 'fw-ksa-pdpl',
    code: 'KSA_PDPL',
    name: 'KSA Personal Data Protection Law (PDPL)',
    jurisdiction: 'Saudi Arabia',
    description: 'National framework regulating data privacy and cross-border transfers within the Kingdom.',
    riskCategories: ['LOCAL_RESIDENCY_VIOLATION', 'UNAUTHORIZED_DATA_TRANSFER', 'CONSENT_BREACH'],
    primaryArticles: [
      {
        article: 'Article 28',
        title: 'Transfer of Personal Data Outside the Kingdom',
        summary: 'Strict regulations on transferring personal data to entities outside the Kingdom, requiring specific adequacy or exemption.',
        mandatoryControls: ['Data Residency Enforcement', 'National Data Transfer Audit', 'Sovereign Cloud Storage']
      }
    ]
  },
  {
    id: 'fw-india-dpdp',
    code: 'INDIA_DPDP',
    name: 'India Digital Personal Data Protection Act (DPDP)',
    jurisdiction: 'India',
    description: 'Framework for processing digital personal data in a manner that recognizes both the right of individuals to protect their personal data and the need to process such data for lawful purposes.',
    riskCategories: ['DATA_FIDUCIARY_NEGLIGENCE', 'UNAUTHORIZED_PROCESSING', 'FAILURE_TO_NOTIFY_BREACH'],
    primaryArticles: [
      {
        article: 'Section 8',
        title: 'Obligations of Data Fiduciary',
        summary: 'Mandates technical and organizational measures to prevent personal data breach and ensure accurate processing.',
        mandatoryControls: ['Data Fiduciary Appointment', 'Consent Manager Integration', 'Regional Breach Reporting']
      }
    ]
  },
  {
    id: 'fw-uae-data-law',
    code: 'UAE_DATA_LAW',
    name: 'UAE Federal Decree-Law No. 45 of 2021 on PDPL',
    jurisdiction: 'United Arab Emirates',
    description: 'Integrated framework to ensure the confidentiality of information and protect the privacy of personal data in the UAE.',
    riskCategories: ['INADEQUATE_SECURITY_MEASURES', 'PII_LEAKAGE', 'NON_COMPLIANT_DATA_TRANSFER'],
    primaryArticles: [
      {
        article: 'Article 13',
        title: 'Security of Personal Data',
        summary: 'Obligates controllers and processors to implement appropriate technical and organizational measures for data security.',
        mandatoryControls: ['End-to-End Encryption', 'DPIA for Local Operations', 'Incident Response Plan']
      }
    ]
  },
  {
    id: 'fw-sg-pdpa',
    code: 'SG_PDPA',
    name: 'Singapore Personal Data Protection Act (PDPA)',
    jurisdiction: 'Singapore',
    description: 'Governs the collection, use, and disclosure of personal data by organizations in Singapore.',
    riskCategories: ['DO_NOT_CALL_VIOLATION', 'DATA_PROTECTION_OFFICER_ABSENCE', 'RETENTION_LIMIT_EXCEEDED'],
    primaryArticles: [
      {
        article: 'Part VI',
        title: 'Care of Personal Data',
        summary: 'Requires organizations to protect personal data and cease retention when it no longer serves a business or legal purpose.',
        mandatoryControls: ['Retention Scheduler', 'DPO Designation', 'Cross-Border Transfer Standard']
      }
    ]
  },
  {
    id: 'fw-egypt-pdpl',
    code: 'EGYPT_PDPL',
    name: 'Egypt Data Protection Law (Law No. 151 of 2020)',
    jurisdiction: 'Egypt',
    description: 'Framework for the protection of personal data processing in Egypt, establishing the Data Protection Center.',
    riskCategories: ['MARKETING_VIOLATION', 'UNAUTHORIZED_PROCESSING', 'DATA_RESIDENCY_BREACH'],
    primaryArticles: [
      {
        article: 'Article 2',
        title: 'License for Processing',
        summary: 'Mandates a license from the Data Protection Center for processing or controlling personal data.',
        mandatoryControls: ['DPC License Acquisition', 'Appoint Data Protection Officer', 'Local Data Residency']
      }
    ]
  },
  {
    id: 'fw-indonesia-pdp',
    code: 'IDN_PDP',
    name: 'Indonesia Personal Data Protection Law (Law No. 27 of 2022)',
    jurisdiction: 'Indonesia',
    description: 'Comprehensive law regulating the processing of personal data in Indonesia, with extraterritorial effect.',
    riskCategories: ['UNAUTHORIZED_COLLECTION', 'DATA_TRANSFER_NON_COMPLIANCE', 'CRIMINAL_SANCTION_RISK'],
    primaryArticles: [
      {
        article: 'Article 12',
        title: 'Rights of Data Subjects',
        summary: 'Comprehensive list of rights including access, rectification, and deletion of personal data.',
        mandatoryControls: ['DSAR Portal', 'Explicit Consent Engine', 'Administrative Sanction Shield']
      }
    ]
  },
  {
    id: 'fw-thailand-pdpa',
    code: 'THAI_PDPA',
    name: 'Thailand Personal Data Protection Act (PDPA)',
    jurisdiction: 'Thailand',
    description: 'Regulates the collection, use, or disclosure of personal data by data controllers or data processors.',
    riskCategories: ['INADEQUATE_SECURITY', 'RETENTION_VIOLATION', 'CROSS_BORDER_TRANSFER_RISK'],
    primaryArticles: [
      {
        article: 'Section 37',
        title: 'Duties of Data Controller',
        summary: 'Mandates security measures, prevents unauthorized use, and requires breach notification.',
        mandatoryControls: ['Security Standards ISO/IEC 27001', '72h Breach Notification', 'Record of Processing Activities (ROPA)']
      }
    ]
  },
  {
    id: 'fw-brazil-lgpd',
    code: 'BRAZIL_LGPD',
    name: 'Brazil Lei Geral de Proteção de Dados (LGPD)',
    jurisdiction: 'Brazil',
    description: 'Framework for the protection of personal data in Brazil, heavily influenced by GDPR.',
    riskCategories: ['UNLAWFUL_TREATMENT', 'ANPD_SANCTION', 'INADEQUATE_REPORTING'],
    primaryArticles: [
      {
        article: 'Article 46',
        title: 'Security and Good Practices',
        summary: 'Agents must adopt security, technical, and administrative measures to protect personal data.',
        mandatoryControls: ['ANPD Notification Flow', 'Privacy by Design Audit', 'Local Legal Representative']
      }
    ]
  },
  {
    id: 'fw-korea-pipa',
    code: 'KOREA_PIPA',
    name: 'South Korea Personal Information Protection Act (PIPA)',
    jurisdiction: 'South Korea',
    description: 'One of the worlds strictest data protection laws, regulating the collection and use of personal information.',
    riskCategories: ['EXCESSIVE_COLLECTION', 'CRIMINAL_PENALTY_RISK', 'TRANSFER_NON_COMPLIANCE'],
    primaryArticles: [
      {
        article: 'Article 39-3',
        title: 'Special Provisions for Providers',
        summary: 'Mandates destruction of personal information after inactivity and strict consent for profiling.',
        mandatoryControls: ['User Activity Tracker', 'One-Year Inactivity Deletion', 'Local Data Proxy']
      }
    ]
  },
  {
    id: 'fw-china-pipl',
    code: 'CHINA_PIPL',
    name: 'China Personal Information Protection Law (PIPL)',
    jurisdiction: 'China',
    description: 'Regulates personal information processing and ensures data security and sovereignty within China.',
    riskCategories: ['SOVEREIGN_DATA_EXIT', 'SOCIAL_CREDIT_IMPACT', 'LARGE_PLATFORM_OVERSIGHT'],
    primaryArticles: [
      {
        article: 'Article 38',
        title: 'Cross-Border Transfer Conditions',
        summary: 'Requires security assessment by state authorities for transferring personal information overseas.',
        mandatoryControls: ['CAC Security Assessment', 'Standard Contractual Clauses', 'Data Localization Enclave']
      }
    ]
  }
];

export class PolicyMappingEngine {

  /**
   * Initializes database schema for Regulatory Mapping & Policy Engine if missing.
   */
  public static ensureTablesExist() {
    try {
      queryDb(`
        CREATE TABLE IF NOT EXISTS regulatory_frameworks (
          id TEXT PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          jurisdiction TEXT NOT NULL,
          description TEXT,
          risk_categories TEXT,
          primary_articles TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      queryDb(`
        CREATE TABLE IF NOT EXISTS policy_rules (
          id TEXT PRIMARY KEY,
          framework_code TEXT NOT NULL,
          category TEXT NOT NULL,
          rule_code TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          condition_expression TEXT NOT NULL,
          severity TEXT NOT NULL,
          auto_fixable INTEGER DEFAULT 0,
          remediation_suggestion TEXT,
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      queryDb(`
        CREATE TABLE IF NOT EXISTS ai_models_register (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          model_name TEXT NOT NULL,
          model_version TEXT DEFAULT 'v1.0',
          purpose_description TEXT NOT NULL,
          deployment_domain TEXT NOT NULL,
          uses_biometrics INTEGER DEFAULT 0,
          uses_social_scoring INTEGER DEFAULT 0,
          autonomous_decision_making INTEGER DEFAULT 0,
          targets_vulnerable_groups INTEGER DEFAULT 0,
          generates_synthetic_media INTEGER DEFAULT 0,
          risk_tier TEXT NOT NULL,
          article_reference TEXT NOT NULL,
          compliance_score INTEGER DEFAULT 100,
          required_safeguards TEXT,
          status TEXT DEFAULT 'PENDING_REVIEW',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed default frameworks if empty
      const count = queryOne<{ c: number }>('SELECT count(*) as c FROM regulatory_frameworks');
      if (!count || count.c === 0) {
        SUPPORTED_FRAMEWORKS.forEach(fw => {
          queryDb(
            'INSERT INTO regulatory_frameworks (id, code, name, jurisdiction, description, risk_categories, primary_articles) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              fw.id,
              fw.code,
              fw.name,
              fw.jurisdiction,
              fw.description,
              JSON.stringify(fw.riskCategories),
              JSON.stringify(fw.primaryArticles)
            ]
          );
        });
      }
    } catch (err: any) {
      console.error('[POLICY MAPPING ENGINE] Table init warning:', err?.message || err);
    }
  }

  /**
   * AI Risk Categorization Algorithm (EU AI Act + Global AI Governance)
   */
  public static categorizeAiModelRisk(spec: AiModelSpec): AiRiskClassificationResult {
    let riskTier: RiskTier = 'MINIMAL_RISK';
    let riskScore = 95;
    let articleReference = 'EU AI Act Article 50 / Minimal Risk Classification';
    let legalJustification = '';
    const mandatorySafeguards: string[] = [];
    const crossRegulatoryImpacts: Array<{ framework: string; clause: string; impactDescription: string }> = [];
    const requiredActions: string[] = [];

    // Step 1: Check for UNACCEPTABLE RISK (Article 5 Prohibitions)
    if (spec.usesSocialScoring) {
      riskTier = 'UNACCEPTABLE_RISK';
      riskScore = 0;
      articleReference = 'EU AI Act Article 5(1)(c) - Prohibited Social Credit System';
      legalJustification = 'Prohibited practice: System evaluates or classifies natural persons over a period of time based on their social behavior or personality traits.';
      mandatorySafeguards.push('IMMEDIATE DECOMMISSIONING: Deploying social scoring systems in the EU triggers fines up to €35M or 7% global turnover.');
      requiredActions.push('Halt deployment immediately.', 'Notify Chief Risk Officer & DPO.', 'Remove social credit calculation modules from production.');
    } else if (spec.usesBiometrics && spec.deploymentDomain === 'BIOMETRICS') {
      riskTier = 'UNACCEPTABLE_RISK';
      riskScore = 5;
      articleReference = 'EU AI Act Article 5(1)(h) - Real-Time Public Biometric Identification';
      legalJustification = 'Prohibited practice: Real-time remote biometric identification in publicly accessible spaces for law enforcement purposes without strict judicial authorization.';
      mandatorySafeguards.push('Convert real-time biometric tracking to targeted post-event asynchronous inspection under strict judicial oversight.');
      requiredActions.push('Disable live stream facial recognition endpoint.', 'Obtain judicial warrant documentation before processing biometric vectors.');
    } else if (spec.targetsVulnerableGroups) {
      riskTier = 'UNACCEPTABLE_RISK';
      riskScore = 10;
      articleReference = 'EU AI Act Article 5(1)(b) - Exploitation of Vulnerabilities';
      legalJustification = 'Prohibited practice: Exploitation of age, disability, or specific socio-economic situation to distort human behavior.';
      mandatorySafeguards.push('Complete removal of targeted psychological or behavioral nudging logic towards minors or vulnerable groups.');
      requiredActions.push('Audit user targeting algorithms.', 'Engage independent ethics board review.');
    }
    // Step 2: Check for HIGH RISK (Annex III / Article 6)
    else if (
      spec.deploymentDomain === 'FINANCE' ||
      spec.deploymentDomain === 'HEALTHCARE' ||
      spec.deploymentDomain === 'HR_RECRUITMENT' ||
      spec.deploymentDomain === 'CRITICAL_INFRASTRUCTURE' ||
      spec.usesBiometrics ||
      spec.autonomousDecisionMaking
    ) {
      riskTier = 'HIGH_RISK';
      riskScore = 65;

      if (spec.deploymentDomain === 'FINANCE') {
        articleReference = 'EU AI Act Annex III(5)(b) - High-Risk Credit & Loan Scoring';
        legalJustification = 'AI systems used to evaluate creditworthiness or establish credit scores are categorized as High Risk.';
        crossRegulatoryImpacts.push({
          framework: 'GDPR',
          clause: 'Article 22',
          impactDescription: 'Requires explicit opt-out of automated credit decisions and right to human intervention.'
        });
        crossRegulatoryImpacts.push({
          framework: 'DORA',
          clause: 'Article 6',
          impactDescription: 'Must be integrated into financial entity ICT risk management and resilience testing.'
        });
      } else if (spec.deploymentDomain === 'HR_RECRUITMENT') {
        articleReference = 'EU AI Act Annex III(4)(a) - High-Risk HR & Worker Management';
        legalJustification = 'AI systems intended for recruitment, screening, or evaluating candidates/employees are High Risk.';
        crossRegulatoryImpacts.push({
          framework: 'GDPR',
          clause: 'Article 9',
          impactDescription: 'Processing special categories of personal data (candidate demographic profiles) requires explicit consent.'
        });
      } else if (spec.deploymentDomain === 'HEALTHCARE') {
        articleReference = 'EU AI Act Annex III(5)(a) - Emergency Dispatch & Health Triage';
        legalJustification = 'AI systems used to dispatch or establish priority in emergency health services are High Risk.';
      } else {
        articleReference = 'EU AI Act Article 6 / Annex III - Critical System Enclave';
        legalJustification = 'Autonomous decision-making or critical infrastructure management falls under High Risk compliance obligations.';
      }

      mandatorySafeguards.push(
        'Implement continuous Risk Management System (Article 9)',
        'Conduct Data Governance & Bias Mitigation Testing (Article 10)',
        'Maintain comprehensive Technical Documentation & Logging (Articles 11 & 12)',
        'Establish Human-in-the-Loop Oversight Portal (Article 14)',
        'Affix CE Marking & Register in EU Database prior to market release'
      );

      requiredActions.push(
        'Generate AI Conformity Assessment Dossier.',
        'Implement automated logging retention for minimum 6 months.',
        'Schedule bi-annual algorithmic bias audit.'
      );
    }
    // Step 3: Check for LIMITED RISK (Article 50 Transparency)
    else if (spec.generatesSyntheticMedia || spec.deploymentDomain === 'CUSTOMER_SERVICE') {
      riskTier = 'LIMITED_RISK';
      riskScore = 88;
      articleReference = 'EU AI Act Article 50 - Transparency Disclosures';
      legalJustification = 'AI systems interacting directly with humans (chatbots) or generating synthetic media (audio/video/text) require transparency labeling.';

      mandatorySafeguards.push(
        'Inform users clearly that they are interacting with an AI system (Article 50(1)).',
        'Embed machine-readable digital watermarks in generated audio/visual content (Article 50(2)).'
      );

      crossRegulatoryImpacts.push({
        framework: 'ePrivacy',
        clause: 'Article 5',
        impactDescription: 'Ensure chatbot session state and cookies have clear user consent.'
      });

      requiredActions.push(
        'Add visible "Powered by AI" disclosure banner.',
        'Enable C2PA or cryptographic watermarking on generated media outputs.'
      );
    }
    // Step 4: MINIMAL RISK
    else {
      riskTier = 'MINIMAL_RISK';
      riskScore = 98;
      articleReference = 'EU AI Act Article 95 - Voluntary Codes of Conduct';
      legalJustification = 'Minimal risk AI application (e.g. spam filter, recommendation engine). No mandatory regulatory constraints under EU AI Act.';
      mandatorySafeguards.push('Voluntary adherence to EU AI Code of Conduct and ethical guidelines.');
      requiredActions.push('Maintain standard software quality assurance testing.');
    }

    return {
      modelName: spec.modelName,
      riskTier,
      riskScore,
      articleReference,
      legalJustification,
      mandatorySafeguards,
      crossRegulatoryImpacts,
      requiredActions
    };
  }

  /**
   * Retrieves all registered frameworks.
   */
  public static getFrameworks(): RegulatoryFramework[] {
    this.ensureTablesExist();
    try {
      const rows = queryDb<any>('SELECT * FROM regulatory_frameworks');
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          code: r.code,
          name: r.name,
          jurisdiction: r.jurisdiction,
          description: r.description,
          riskCategories: typeof r.risk_categories === 'string' ? JSON.parse(r.risk_categories) : r.risk_categories || [],
          primaryArticles: typeof r.primary_articles === 'string' ? JSON.parse(r.primary_articles) : r.primary_articles || []
        }));
      }
    } catch (e) {
      // Return memory fallback
    }
    return SUPPORTED_FRAMEWORKS;
  }

  /**
   * Registers a new AI model and persists its risk classification.
   */
  public static registerAiModel(tenantId: string, spec: AiModelSpec) {
    this.ensureTablesExist();
    const evaluation = this.categorizeAiModelRisk(spec);
    const modelId = spec.id || `aimod-${crypto.randomBytes(4).toString('hex')}`;

    try {
      queryDb(
        `INSERT OR REPLACE INTO ai_models_register (
          id, tenant_id, model_name, model_version, purpose_description, deployment_domain,
          uses_biometrics, uses_social_scoring, autonomous_decision_making, targets_vulnerable_groups,
          generates_synthetic_media, risk_tier, article_reference, compliance_score, required_safeguards, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          modelId,
          tenantId,
          spec.modelName,
          spec.modelVersion || 'v1.0',
          spec.purposeDescription,
          spec.deploymentDomain,
          spec.usesBiometrics ? 1 : 0,
          spec.usesSocialScoring ? 1 : 0,
          spec.autonomousDecisionMaking ? 1 : 0,
          spec.targetsVulnerableGroups ? 1 : 0,
          spec.generatesSyntheticMedia ? 1 : 0,
          evaluation.riskTier,
          evaluation.articleReference,
          evaluation.riskScore,
          JSON.stringify(evaluation.mandatorySafeguards),
          evaluation.riskTier === 'UNACCEPTABLE_RISK' ? 'PROHIBITED' : 'APPROVED'
        ]
      );
    } catch (err: any) {
      console.error('[POLICY MAPPING ENGINE] Register AI model DB error:', err?.message || err);
    }

    return { modelId, evaluation };
  }

  /**
   * Lists AI models registered in the database.
   */
  public static listAiModels(tenantId: string = 'default-tenant') {
    this.ensureTablesExist();
    try {
      const rows = queryDb<any>('SELECT * FROM ai_models_register WHERE tenant_id = ? OR tenant_id = ? ORDER BY created_at DESC', [tenantId, 'default-tenant']);
      return rows.map(r => ({
        id: r.id,
        tenantId: r.tenant_id,
        modelName: r.model_name,
        modelVersion: r.model_version,
        purposeDescription: r.purpose_description,
        deploymentDomain: r.deployment_domain,
        usesBiometrics: Boolean(r.uses_biometrics),
        usesSocialScoring: Boolean(r.uses_social_scoring),
        autonomousDecisionMaking: Boolean(r.autonomous_decision_making),
        targetsVulnerableGroups: Boolean(r.targets_vulnerable_groups),
        generatesSyntheticMedia: Boolean(r.generates_synthetic_media),
        riskTier: r.risk_tier,
        articleReference: r.article_reference,
        complianceScore: r.compliance_score,
        requiredSafeguards: typeof r.required_safeguards === 'string' ? JSON.parse(r.required_safeguards) : r.required_safeguards || [],
        status: r.status,
        createdAt: r.created_at
      }));
    } catch (e) {
      return [];
    }
  }
}
