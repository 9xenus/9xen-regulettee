/**
 * GLOBAL AI REGULATION SCANNER
 * Comprehensive registry of AI regulations, frameworks, and standards
 * across all major jurisdictions worldwide.
 *
 * Covers: EU, US, UK, China, Singapore, Canada, Brazil, Japan, South Korea,
 * India, Australia, UAE, Saudi Arabia, OECD, UNESCO, ISO/IEC, NIST.
 */
import { v4 as uuidv4 } from 'uuid';

export interface AiRegulation {
  id: string;
  jurisdiction: string;
  region: string;
  name: string;
  shortName: string;
  status: 'ENFORCED' | 'PROPOSED' | 'CONSULTATION' | 'GUIDANCE';
  effectiveDate: string;
  penaltyMax: string;
  penaltyMaxEur: number;
  appliesTo: string[];
  keyRequirements: string[];
  riskCategories: string[];
  articles: { ref: string; title: string; summary: string }[];
  lastUpdated: string;
}

export interface RegulationScanResult {
  scanId: string;
  timestamp: string;
  systemProfile: unknown;
  applicableRegulations: AiRegulation[];
  totalApplicable: number;
  byJurisdiction: Record<string, number>;
  byStatus: Record<string, number>;
  combinedPenaltyExposureEur: number;
  complianceGaps: { regulation: string; gap: string; severity: string }[];
  executiveSummary: string;
}

// ── Global regulation registry ───────────────────────────────────────────────

export const GLOBAL_AI_REGULATIONS: AiRegulation[] = [
  {
    id: 'EU-AI-ACT',
    jurisdiction: 'European Union',
    region: 'Europe',
    name: 'EU AI Act (Regulation 2024/1689)',
    shortName: 'EU AI Act',
    status: 'ENFORCED',
    effectiveDate: '2024-08-01',
    penaltyMax: '€35M or 7% global turnover',
    penaltyMaxEur: 35000000,
    appliesTo: ['providers', 'deployers', 'importers', 'distributors'],
    keyRequirements: ['Risk classification', 'Prohibited practices ban', 'High-risk conformity', 'GPAI obligations', 'Transparency', 'Human oversight', 'Data governance', 'Logging'],
    riskCategories: ['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL'],
    articles: [
      { ref: 'Article 5', title: 'Prohibited Practices', summary: 'Bans subliminal manipulation, exploitation of vulnerabilities, social scoring, real-time biometric ID in public spaces, emotion recognition in workplace/education.' },
      { ref: 'Article 6', title: 'High-Risk Classification', summary: 'Annex III systems are high-risk: employment, education, credit, law enforcement, migration, critical infrastructure.' },
      { ref: 'Article 9', title: 'Risk Management', summary: 'Continuous risk management system for high-risk AI throughout lifecycle.' },
      { ref: 'Article 10', title: 'Data Governance', summary: 'Training/validation/test data must be relevant, representative, unbiased, error-free.' },
      { ref: 'Article 12', title: 'Record Keeping', summary: 'Automatic logging of events over lifecycle, tamper-evident.' },
      { ref: 'Article 13', title: 'Transparency', summary: 'Instructions for use, capabilities/limitations disclosure to deployers.' },
      { ref: 'Article 14', title: 'Human Oversight', summary: 'Natural persons can oversee, understand, override decisions.' },
      { ref: 'Article 15', title: 'Accuracy & Cybersecurity', summary: 'Resilience against adversarial manipulation, data poisoning.' },
      { ref: 'Article 17', title: 'Quality Management', summary: 'Documented QMS for high-risk providers.' },
      { ref: 'Article 26', title: 'Provider Obligations', summary: 'Providers of high-risk systems must register, maintain technical documentation.' },
      { ref: 'Article 50', title: 'Transparency Obligations', summary: 'Inform persons interacting with AI, disclose AI-generated content.' },
      { ref: 'Article 52', title: 'GPAI Obligations', summary: 'Technical documentation, copyright compliance, training content summary.' },
      { ref: 'Article 86', title: 'Right to Explanation', summary: 'Meaningful explanation of high-risk decisions producing legal effects.' }
    ],
    lastUpdated: '2026-10-01'
  },
  {
    id: 'US-EO14110',
    jurisdiction: 'United States',
    region: 'North America',
    name: 'Executive Order 14110 on AI',
    shortName: 'US EO 14110',
    status: 'ENFORCED',
    effectiveDate: '2023-10-30',
    penaltyMax: 'N/A (executive)',
    penaltyMaxEur: 0,
    appliesTo: ['federal agencies', 'AI developers', 'critical infrastructure'],
    keyRequirements: ['Safety testing', 'Reporting', 'Civil rights protection', 'Privacy'],
    riskCategories: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Section 4', title: 'AI Safety & Security', summary: 'Developers must report safety test results for powerful models.' },
      { ref: 'Section 8', title: 'Civil Rights', summary: 'Prevent AI-driven discrimination in federal programs.' }
    ],
    lastUpdated: '2026-09-15'
  },
  {
    id: 'US-NIST-AI-RMF',
    jurisdiction: 'United States',
    region: 'North America',
    name: 'NIST AI Risk Management Framework 1.0',
    shortName: 'NIST AI RMF',
    status: 'GUIDANCE',
    effectiveDate: '2023-01-26',
    penaltyMax: 'N/A (voluntary)',
    penaltyMaxEur: 0,
    appliesTo: ['all organizations'],
    keyRequirements: ['Govern', 'Map', 'Measure', 'Manage'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Govern', title: 'AI Risk Governance', summary: 'Policies, procedures, roles, accountability for AI risk management.' },
      { ref: 'Map', title: 'AI Context Mapping', summary: 'Intended use, context, impacts on individuals and society.' },
      { ref: 'Measure', title: 'AI Risk Measurement', summary: 'Quantitative/qualitative measurement of AI risks.' },
      { ref: 'Manage', title: 'AI Risk Response', summary: 'Prioritize and manage risks with documented response plans.' }
    ],
    lastUpdated: '2026-08-01'
  },
  {
    id: 'UK-AI-FRAMEWORK',
    jurisdiction: 'United Kingdom',
    region: 'Europe',
    name: 'UK Pro-Innovation AI Framework',
    shortName: 'UK AI Framework',
    status: 'GUIDANCE',
    effectiveDate: '2023-03-29',
    penaltyMax: 'N/A (sectoral)',
    penaltyMaxEur: 0,
    appliesTo: ['all organizations'],
    keyRequirements: ['Safety', 'Transparency', 'Fairness', 'Accountability', 'Contestability'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Principle 1', title: 'Safety & Security', summary: 'AI systems should function in a secure and safe way.' },
      { ref: 'Principle 2', title: 'Transparency', summary: 'AI systems should be transparent and explainable.' },
      { ref: 'Principle 3', title: 'Fairness', summary: 'AI systems should not discriminate.' },
      { ref: 'Principle 4', title: 'Accountability', summary: 'Clear accountability for AI outcomes.' },
      { ref: 'Principle 5', title: 'Contestability', summary: 'Ability to contest AI decisions.' }
    ],
    lastUpdated: '2026-07-01'
  },
  {
    id: 'CN-AI-REGULATIONS',
    jurisdiction: 'China',
    region: 'Asia-Pacific',
    name: 'China AI Regulations (Algorithmic Recommendation, Deep Synthesis, Generative AI)',
    shortName: 'CN AI Regs',
    status: 'ENFORCED',
    effectiveDate: '2023-08-15',
    penaltyMax: '¥10M / business suspension',
    penaltyMaxEur: 1300000,
    appliesTo: ['algorithm providers', 'generative AI services', 'deep synthesis'],
    keyRequirements: ['Algorithm filing', 'Content labeling', 'Data security', 'User protection', 'Ethics review'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Art. 4', title: 'Algorithmic Recommendation', summary: 'Providers must file algorithms, offer opt-out, protect user rights.' },
      { ref: 'Art. 12', title: 'Deep Synthesis', summary: 'Deepfakes must be labeled, consent required for likeness/voice.' },
      { ref: 'Art. 17', title: 'Generative AI', summary: 'Content must align with socialist core values, no disinformation.' }
    ],
    lastUpdated: '2026-09-01'
  },
  {
    id: 'SG-AI-GOVERNANCE',
    jurisdiction: 'Singapore',
    region: 'Asia-Pacific',
    name: 'Singapore Model AI Governance Framework',
    shortName: 'SG AI Framework',
    status: 'GUIDANCE',
    effectiveDate: '2020-01-21',
    penaltyMax: 'N/A (voluntary)',
    penaltyMaxEur: 0,
    appliesTo: ['all organizations'],
    keyRequirements: ['Accountability', 'Transparency', 'Fairness', 'Human oversight'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Principle 1', title: 'Accountability', summary: 'AI decision-making should be accountable.' },
      { ref: 'Principle 2', title: 'Transparency', summary: 'AI systems should be transparent.' },
      { ref: 'Principle 3', title: 'Fairness', summary: 'AI should be fair and unbiased.' }
    ],
    lastUpdated: '2026-06-01'
  },
  {
    id: 'CA-AIDA',
    jurisdiction: 'Canada',
    region: 'North America',
    name: 'Artificial Intelligence and Data Act (AIDA)',
    shortName: 'CA AIDA',
    status: 'PROPOSED',
    effectiveDate: 'TBD',
    penaltyMax: 'CAD 10M or 5% revenue',
    penaltyMaxEur: 6800000,
    appliesTo: ['AI system providers', 'deployers'],
    keyRequirements: ['Risk assessment', 'Mitigation measures', 'Monitoring', 'Transparency'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Part 1', title: 'High-Impact Systems', summary: 'Providers must assess and mitigate risks of high-impact AI systems.' }
    ],
    lastUpdated: '2026-05-01'
  },
  {
    id: 'BR-AI-BILL',
    jurisdiction: 'Brazil',
    region: 'South America',
    name: 'Brazil AI Bill (PL 2338/2023)',
    shortName: 'BR AI Bill',
    status: 'PROPOSED',
    effectiveDate: 'TBD',
    penaltyMax: 'R$50M or 2% revenue',
    penaltyMaxEur: 8500000,
    appliesTo: ['AI system providers', 'deployers'],
    keyRequirements: ['Risk classification', 'Transparency', 'Human oversight', 'Non-discrimination'],
    riskCategories: ['UNACCEPTABLE', 'HIGH', 'LOW'],
    articles: [
      { ref: 'Art. 14', title: 'Risk Classification', summary: 'AI systems classified as high-risk require conformity assessment.' },
      { ref: 'Art. 18', title: 'Transparency', summary: 'Users must be informed of AI interaction.' }
    ],
    lastUpdated: '2026-04-01'
  },
  {
    id: 'JP-AI-GUIDELINES',
    jurisdiction: 'Japan',
    region: 'Asia-Pacific',
    name: 'AI Guidelines for Business',
    shortName: 'JP AI Guidelines',
    status: 'GUIDANCE',
    effectiveDate: '2024-04-19',
    penaltyMax: 'N/A (voluntary)',
    penaltyMaxEur: 0,
    appliesTo: ['businesses using AI'],
    keyRequirements: ['Risk assessment', 'Human oversight', 'Transparency', 'Security'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Principle 1', title: 'Human-Centric', summary: 'AI should enhance human capabilities, not replace human judgment.' },
      { ref: 'Principle 2', title: 'Safety', summary: 'AI systems should be safe and secure.' }
    ],
    lastUpdated: '2026-03-01'
  },
  {
    id: 'KR-AI-BASIC-ACT',
    jurisdiction: 'South Korea',
    region: 'Asia-Pacific',
    name: 'AI Basic Act',
    shortName: 'KR AI Act',
    status: 'ENFORCED',
    effectiveDate: '2025-01-22',
    penaltyMax: 'KRW 30M',
    penaltyMaxEur: 20000,
    appliesTo: ['high-impact AI providers', 'generative AI providers'],
    keyRequirements: ['Transparency', 'Safety', 'Human oversight', 'Impact assessment'],
    riskCategories: ['HIGH', 'LOW'],
    articles: [
      { ref: 'Art. 17', title: 'High-Impact AI', summary: 'Providers must conduct impact assessments, ensure transparency.' },
      { ref: 'Art. 28', title: 'Generative AI', summary: 'Must disclose AI-generated content.' }
    ],
    lastUpdated: '2026-02-01'
  },
  {
    id: 'IN-AI-REGULATION',
    jurisdiction: 'India',
    region: 'Asia-Pacific',
    name: 'India AI Regulation (Digital India Act / AI Advisory)',
    shortName: 'IN AI Reg',
    status: 'CONSULTATION',
    effectiveDate: 'TBD',
    penaltyMax: 'TBD',
    penaltyMaxEur: 0,
    appliesTo: ['intermediaries', 'AI platforms'],
    keyRequirements: ['Due diligence', 'Transparency', 'Grievance redressal'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Advisory', title: 'AI Platform Advisory', summary: 'Platforms must label AI-generated content, obtain consent for deepfakes.' }
    ],
    lastUpdated: '2026-01-01'
  },
  {
    id: 'AU-AI-GUARDRAILS',
    jurisdiction: 'Australia',
    region: 'Asia-Pacific',
    name: 'Australia AI Guardrails Proposal',
    shortName: 'AU AI Guardrails',
    status: 'CONSULTATION',
    effectiveDate: 'TBD',
    penaltyMax: 'TBD',
    penaltyMaxEur: 0,
    appliesTo: ['high-risk AI deployers'],
    keyRequirements: ['Accountability', 'Transparency', 'Human oversight', 'Testing'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Guardrail 1', title: 'Accountability', summary: 'Organizations must be accountable for AI outcomes.' }
    ],
    lastUpdated: '2026-01-15'
  },
  {
    id: 'OECD-AI-PRINCIPLES',
    jurisdiction: 'OECD',
    region: 'International',
    name: 'OECD AI Principles',
    shortName: 'OECD AI',
    status: 'GUIDANCE',
    effectiveDate: '2019-05-22',
    penaltyMax: 'N/A (voluntary)',
    penaltyMaxEur: 0,
    appliesTo: ['all member states'],
    keyRequirements: ['Human-centered values', 'Transparency', 'Robustness', 'Accountability'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Value 1', title: 'Inclusive Growth', summary: 'AI should benefit people and planet.' },
      { ref: 'Value 2', title: 'Human Rights', summary: 'AI should respect human rights and democratic values.' },
      { ref: 'Value 3', title: 'Transparency', summary: 'AI systems should be transparent and explainable.' },
      { ref: 'Value 4', title: 'Robustness', summary: 'AI systems should be safe and secure.' },
      { ref: 'Value 5', title: 'Accountability', summary: 'Organizations must be accountable for AI outcomes.' }
    ],
    lastUpdated: '2026-01-01'
  },
  {
    id: 'UNESCO-AI-ETHICS',
    jurisdiction: 'UNESCO',
    region: 'International',
    name: 'UNESCO Recommendation on AI Ethics',
    shortName: 'UNESCO AI',
    status: 'GUIDANCE',
    effectiveDate: '2021-11-23',
    penaltyMax: 'N/A (voluntary)',
    penaltyMaxEur: 0,
    appliesTo: ['all member states'],
    keyRequirements: ['Human rights', 'Human dignity', 'Non-discrimination', 'Transparency'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Art. 1', title: 'Human Rights', summary: 'AI must not violate human rights.' },
      { ref: 'Art. 2', title: 'Human Dignity', summary: 'AI must respect human dignity.' }
    ],
    lastUpdated: '2026-01-01'
  },
  {
    id: 'ISO-IEC-42001',
    jurisdiction: 'International',
    region: 'International',
    name: 'ISO/IEC 42001:2023 — AI Management System',
    shortName: 'ISO 42001',
    status: 'GUIDANCE',
    effectiveDate: '2023-12-15',
    penaltyMax: 'N/A (certification)',
    penaltyMaxEur: 0,
    appliesTo: ['all organizations'],
    keyRequirements: ['AIMS', 'Risk management', 'Continuous improvement', 'Internal audit'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Clause 4', title: 'Context', summary: 'Understand organizational context and AI system scope.' },
      { ref: 'Clause 6', title: 'Risk Management', summary: 'AI risk assessment and treatment.' },
      { ref: 'Clause 8', title: 'Operation', summary: 'Implement and control AI processes.' },
      { ref: 'Clause 9', title: 'Performance Evaluation', summary: 'Monitor, measure, analyze AI performance.' },
      { ref: 'Clause 10', title: 'Improvement', summary: 'Continual improvement of AIMS.' }
    ],
    lastUpdated: '2026-01-01'
  },
  {
    id: 'ISO-IEC-23894',
    jurisdiction: 'International',
    region: 'International',
    name: 'ISO/IEC 23894 — AI Risk Management',
    shortName: 'ISO 23894',
    status: 'GUIDANCE',
    effectiveDate: '2023-12-15',
    penaltyMax: 'N/A (voluntary)',
    penaltyMaxEur: 0,
    appliesTo: ['all organizations'],
    keyRequirements: ['Risk assessment', 'Risk treatment', 'Monitoring'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Clause 5', title: 'Risk Assessment', summary: 'Identify, analyze, evaluate AI risks.' }
    ],
    lastUpdated: '2026-01-01'
  },
  {
    id: 'UAE-AI-REGULATION',
    jurisdiction: 'United Arab Emirates',
    region: 'Middle East',
    name: 'UAE AI Governance Framework',
    shortName: 'UAE AI',
    status: 'GUIDANCE',
    effectiveDate: '2023-01-01',
    penaltyMax: 'N/A (voluntary)',
    penaltyMaxEur: 0,
    appliesTo: ['government entities', 'AI companies'],
    keyRequirements: ['Ethics', 'Transparency', 'Human oversight', 'Safety'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Principle 1', title: 'Ethics', summary: 'AI should be ethical and responsible.' }
    ],
    lastUpdated: '2026-01-01'
  },
  {
    id: 'SA-AI-REGULATION',
    jurisdiction: 'Saudi Arabia',
    region: 'Middle East',
    name: 'Saudi AI Governance Principles',
    shortName: 'SA AI',
    status: 'GUIDANCE',
    effectiveDate: '2023-01-01',
    penaltyMax: 'N/A (voluntary)',
    penaltyMaxEur: 0,
    appliesTo: ['all organizations'],
    keyRequirements: ['Fairness', 'Transparency', 'Accountability', 'Safety'],
    riskCategories: ['HIGH', 'MEDIUM', 'LOW'],
    articles: [
      { ref: 'Principle 1', title: 'Fairness', summary: 'AI should be fair and non-discriminatory.' }
    ],
    lastUpdated: '2026-01-01'
  }
];

// ── Scanner engine ───────────────────────────────────────────────────────────

export class AiGlobalRegulationScanner {

  /**
   * Scans a system profile against all global AI regulations and returns
   * applicable regulations, compliance gaps, and combined penalty exposure.
   */
  public static scanSystem(profile: {
    id: string;
    name: string;
    targetDomain: string;
    deploymentType: string;
    collectsPii: boolean;
    usesExternalRag: boolean;
    trainingDataProvenanceKnown: boolean;
    hasHumanInTheLoop: boolean;
    modelFamily?: string;
  }): RegulationScanResult {
    const applicable: AiRegulation[] = [];
    const complianceGaps: { regulation: string; gap: string; severity: string }[] = [];

    for (const reg of GLOBAL_AI_REGULATIONS) {
      let isApplicable = false;

      // Domain-based applicability
      if (profile.targetDomain === 'HR_RECRUITMENT' && ['EU-AI-ACT', 'US-EO14110', 'CN-AI-REGULATIONS', 'BR-AI-BILL'].includes(reg.id)) {
        isApplicable = true;
      }
      if (profile.targetDomain === 'FINANCIAL_CREDIT' && ['EU-AI-ACT', 'US-EO14110', 'SG-AI-GOVERNANCE'].includes(reg.id)) {
        isApplicable = true;
      }
      if (profile.targetDomain === 'BIOMETRIC_ID' && ['EU-AI-ACT', 'CN-AI-REGULATIONS'].includes(reg.id)) {
        isApplicable = true;
      }
      if (profile.deploymentType === 'PUBLIC_API' && ['EU-AI-ACT', 'CN-AI-REGULATIONS', 'KR-AI-BASIC-ACT', 'IN-AI-REGULATION'].includes(reg.id)) {
        isApplicable = true;
      }
      if (profile.collectsPii && ['EU-AI-ACT', 'US-EO14110', 'SG-AI-GOVERNANCE', 'OECD-AI-PRINCIPLES'].includes(reg.id)) {
        isApplicable = true;
      }
      if (profile.usesExternalRag && ['EU-AI-ACT', 'ISO-IEC-42001'].includes(reg.id)) {
        isApplicable = true;
      }
      if (['NIST-AI-RMF', 'UK-AI-FRAMEWORK', 'OECD-AI-PRINCIPLES', 'UNESCO-AI-ETHICS', 'ISO-IEC-42001', 'ISO-IEC-23894', 'UAE-AI-REGULATION', 'SA-AI-REGULATION', 'JP-AI-GUIDELINES', 'AU-AI-GUARDRAILS'].includes(reg.id)) {
        isApplicable = true; // Horizontal frameworks apply to all
      }

      if (isApplicable) {
        applicable.push(reg);

        // Check for compliance gaps
        if (!profile.hasHumanInTheLoop && reg.id === 'EU-AI-ACT') {
          complianceGaps.push({ regulation: reg.shortName, gap: 'Missing human oversight (Article 14)', severity: 'HIGH' });
        }
        if (!profile.trainingDataProvenanceKnown && reg.id === 'EU-AI-ACT') {
          complianceGaps.push({ regulation: reg.shortName, gap: 'Unknown training data provenance (Article 10)', severity: 'HIGH' });
        }
        if (profile.collectsPii && reg.id === 'EU-AI-ACT') {
          complianceGaps.push({ regulation: reg.shortName, gap: 'PII processing without scrubber (Article 10)', severity: 'MEDIUM' });
        }
        if (profile.deploymentType === 'PUBLIC_API' && reg.id === 'CN-AI-REGULATIONS') {
          complianceGaps.push({ regulation: reg.shortName, gap: 'Public AI service requires algorithm filing', severity: 'HIGH' });
        }
        if (profile.deploymentType === 'PUBLIC_API' && reg.id === 'KR-AI-BASIC-ACT') {
          complianceGaps.push({ regulation: reg.shortName, gap: 'Generative AI content disclosure required', severity: 'MEDIUM' });
        }
      }
    }

    const byJurisdiction: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let combinedPenalty = 0;

    for (const reg of applicable) {
      byJurisdiction[reg.jurisdiction] = (byJurisdiction[reg.jurisdiction] || 0) + 1;
      byStatus[reg.status] = (byStatus[reg.status] || 0) + 1;
      combinedPenalty += reg.penaltyMaxEur;
    }

    return {
      scanId: `SCAN-${uuidv4().substring(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      systemProfile: profile,
      applicableRegulations: applicable,
      totalApplicable: applicable.length,
      byJurisdiction,
      byStatus,
      combinedPenaltyExposureEur: combinedPenalty,
      complianceGaps,
      executiveSummary: `System '${profile.name}' scanned against ${GLOBAL_AI_REGULATIONS.length} global AI regulations. ${applicable.length} regulations applicable across ${Object.keys(byJurisdiction).length} jurisdictions. ${complianceGaps.length} compliance gaps identified. Combined penalty exposure: €${combinedPenalty.toLocaleString()}.`
    };
  }

  /**
   * Returns all regulations for a specific jurisdiction.
   */
  public static getRegulationsByJurisdiction(jurisdiction: string): AiRegulation[] {
    return GLOBAL_AI_REGULATIONS.filter(r => r.jurisdiction.toLowerCase().includes(jurisdiction.toLowerCase()));
  }

  /**
   * Returns all regulations by status.
   */
  public static getRegulationsByStatus(status: AiRegulation['status']): AiRegulation[] {
    return GLOBAL_AI_REGULATIONS.filter(r => r.status === status);
  }

  /**
   * Returns the full regulation registry.
   */
  public static getAllRegulations(): AiRegulation[] {
    return [...GLOBAL_AI_REGULATIONS];
  }
}
