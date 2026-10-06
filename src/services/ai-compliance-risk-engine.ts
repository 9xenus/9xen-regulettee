import { v4 as uuidv4 } from 'uuid';
import { LexDB } from './LexDB';
import {
  insertAiRiskAuditRun,
  insertAiRiskFinding,
  listAiRiskAuditRuns,
  getAiRiskAuditRun,
  listAiRiskFindings,
  getAiRiskFinding,
  updateAiRiskFindingFixStatus,
  listAiRiskFixations,
  getAiRiskFixation,
  getAiRiskAuditSummary,
  type AiRiskAuditRunRow,
  type AiRiskFindingRow,
  type AiRiskFixationRow
} from '../db/ai-risk-repository';

export type AiRiskLevel = 'UNACCEPTABLE' | 'HIGH' | 'SPECIFIC_TRANSPARENCY' | 'MINIMAL';

export interface AiSystemProfile {
  id: string;
  name: string;
  version: string;
  modelFamily: string; // e.g., "Gemini 2.5", "Llama 3.3", "Custom Fine-tuned BERT"
  purpose: string;
  targetDomain: 'HR_RECRUITMENT' | 'FINANCIAL_CREDIT' | 'HEALTHCARE_TRIAGE' | 'CUSTOMER_SUPPORT' | 'BIOMETRIC_ID' | 'CRITICAL_INFRASTRUCTURE' | 'CONTENT_GENERATION' | 'LEGAL_ASSISTANCE';
  deploymentType: 'INTERNAL_TOOL' | 'PUBLIC_API' | 'EMBEDDED_AGENT' | 'AUTOMATED_DECISION_ENGINE';
  hasHumanInTheLoop: boolean;
  collectsPii: boolean;
  usesExternalRag: boolean;
  trainingDataProvenanceKnown: boolean;
  systemPrompt?: string;
  confidenceThreshold?: number;
}

export interface AiRiskFinding {
  id: string;
  ruleCode: string;
  framework: 'EU_AI_ACT' | 'NIST_AI_RMF' | 'ISO_42001' | 'OWASP_LLM_TOP10';
  articleRef: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'PROHIBITED_PRACTICE' | 'DATA_GOVERNANCE' | 'HUMAN_OVERSIGHT' | 'PROMPT_SECURITY' | 'BIAS_FAIRNESS' | 'TRANSPARENCY' | 'ACCURACY_ROBUSTNESS';
  penaltyExposureEur: number;
  fixAvailable: boolean;
  fixationType: 'GUARDRAIL_MIDDLEWARE' | 'SYSTEM_PROMPT_HARDENING' | 'PII_SCRUBBER' | 'HITL_APPROVAL_GATE' | 'RAG_GROUNDING_VERIFIER' | 'OUTPUT_WATERMARKING';
  suggestedAction: string;
}

export interface AiComplianceAssessmentReport {
  assessmentId: string;
  timestamp: string;
  systemProfile: AiSystemProfile;
  overallRiskLevel: AiRiskLevel;
  complianceScore: number; // 0 - 100 (100 is fully compliant)
  totalPotentialFineEur: number;
  criticalViolationsCount: number;
  highViolationsCount: number;
  findings: AiRiskFinding[];
  frameworkCoverage: {
    euAiActScore: number;
    nistAiRmfScore: number;
    iso42001Score: number;
    owaspLlmScore: number;
  };
  executiveSummary: string;
}

export class AiComplianceRiskEngine {
  /**
   * Conducts a comprehensive AI compliance & risk audit against EU AI Act, NIST AI RMF, ISO 42001, and OWASP.
   */
  public static async assessAiSystem(
    profile: AiSystemProfile,
    tenantId: string = 'default-tenant'
  ): Promise<AiComplianceAssessmentReport> {
    const findings: AiRiskFinding[] = [];

    // 1. Check for EU AI Act Article 5 Prohibited Practices
    if (profile.targetDomain === 'BIOMETRIC_ID' && profile.deploymentType === 'PUBLIC_API') {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART5-01',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 5(1)(d)',
        title: 'Real-time Remote Biometric Identification in Publicly Accessible Spaces',
        description: 'Real-time remote biometric identification systems in publicly accessible spaces for law enforcement/public deployment are strictly prohibited unless narrow exceptions apply.',
        severity: 'CRITICAL',
        category: 'PROHIBITED_PRACTICE',
        penaltyExposureEur: 35000000,
        fixAvailable: true,
        fixationType: 'HITL_APPROVAL_GATE',
        suggestedAction: 'Enforce synchronous judicial/administrative authorization gate and convert to post-event biometric verification mode with strict audit seals.'
      });
    }

    // 2. Check for High-Risk Categorization (EU AI Act Annex III & Article 6)
    const isHighRiskDomain = ['HR_RECRUITMENT', 'FINANCIAL_CREDIT', 'HEALTHCARE_TRIAGE', 'CRITICAL_INFRASTRUCTURE'].includes(profile.targetDomain);
    
    if (isHighRiskDomain) {
      // Human Oversight (Article 14)
      if (!profile.hasHumanInTheLoop) {
        findings.push({
          id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
          ruleCode: 'EUAIA-ART14-01',
          framework: 'EU_AI_ACT',
          articleRef: 'Article 14',
          title: 'Missing Human Oversight Mechanism (HITL / HOTL)',
          description: 'High-risk AI systems must be designed to enable natural persons to oversee their operation, understand outputs, and override decisions.',
          severity: 'HIGH',
          category: 'HUMAN_OVERSIGHT',
          penaltyExposureEur: 15000000,
          fixAvailable: true,
          fixationType: 'HITL_APPROVAL_GATE',
          suggestedAction: 'Inject 9Xen Regulettee HITL decision-gate middleware that pauses autonomous execution when inference confidence falls below calibrated thresholds.'
        });
      }

      // Data Governance & Bias (Article 10)
      if (!profile.trainingDataProvenanceKnown) {
        findings.push({
          id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
          ruleCode: 'EUAIA-ART10-02',
          framework: 'EU_AI_ACT',
          articleRef: 'Article 10(2)',
          title: 'Unverified Training & Validation Data Governance',
          description: 'High-risk AI models require proven data governance practices regarding training dataset origin, statistical representation, and mitigation of discriminatory biases.',
          severity: 'HIGH',
          category: 'BIAS_FAIRNESS',
          penaltyExposureEur: 15000000,
          fixAvailable: true,
          fixationType: 'GUARDRAIL_MIDDLEWARE',
          suggestedAction: 'Deploy synthetic demographic parity testing and attach verified cryptographic data lineage cards.'
        });
      }

      // Logging & Record Keeping (Article 12)
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART12-01',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 12',
        title: 'Continuous Operational Logging & Traceability Required',
        description: 'Automatic recording of events (logs) over the lifecycle of high-risk AI systems must be maintained in an immutable, tamper-evident audit store.',
        severity: 'MEDIUM',
        category: 'ACCURACY_ROBUSTNESS',
        penaltyExposureEur: 7500000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Activate 9Xen Regulettee EventDB immutable ledger streaming for all prompt-completion pairs and decision telemetry.'
      });
    }

    // 3. OWASP Top 10 for LLMs & Prompt Security
    if (profile.deploymentType === 'PUBLIC_API' || profile.deploymentType === 'EMBEDDED_AGENT') {
      const prompt = profile.systemPrompt || '';
      const hasDefensiveDelimiters = prompt.includes('###') || prompt.includes('<<<') || prompt.includes('GUARDRAIL');
      
      if (!hasDefensiveDelimiters) {
        findings.push({
          id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
          ruleCode: 'OWASP-LLM-01',
          framework: 'OWASP_LLM_TOP10',
          articleRef: 'OWASP LLM01:2025',
          title: 'Vulnerability to Direct & Indirect Prompt Injection',
          description: 'The model system instructions lack robust structural demarcation and boundary tokens, leaving the engine vulnerable to user-controlled prompt escape and jailbreaks.',
          severity: 'HIGH',
          category: 'PROMPT_SECURITY',
          penaltyExposureEur: 5000000,
          fixAvailable: true,
          fixationType: 'SYSTEM_PROMPT_HARDENING',
          suggestedAction: 'Apply 9Xen Regulettee Zero-Trust Prompt Envelope with XML/Markdown boundary isolation and anti-jailbreak directives.'
        });
      }

      // Sensitive Data Disclosure (OWASP LLM02 & GDPR Art 5)
      if (profile.collectsPii) {
        findings.push({
          id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
          ruleCode: 'OWASP-LLM-02',
          framework: 'OWASP_LLM_TOP10',
          articleRef: 'OWASP LLM02 / GDPR Art 5',
          title: 'Unscrubbed PII & Sensitive Information Leakage in Inference Context',
          description: 'Inference payloads ingest personal identifiers without prior tokenization or redaction filters, risking accidental memorization or downstream data leaks.',
          severity: 'HIGH',
          category: 'DATA_GOVERNANCE',
          penaltyExposureEur: 20000000,
          fixAvailable: true,
          fixationType: 'PII_SCRUBBER',
          suggestedAction: 'Inject bidirectional Regex/Named-Entity PII Scrubber into the prompt preprocessing and completion stream pipeline.'
        });
      }

      // RAG and Vector Poisoning (OWASP LLM08)
      if (profile.usesExternalRag) {
        findings.push({
          id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
          ruleCode: 'OWASP-LLM-08',
          framework: 'OWASP_LLM_TOP10',
          articleRef: 'OWASP LLM08:2025',
          title: 'Unverified RAG Retrieval Grounding & Vector Integrity',
          description: 'External retrieval augmented generation (RAG) contexts are ingested without cosine-distance anomaly checks or hallucination grounding filters.',
          severity: 'MEDIUM',
          category: 'ACCURACY_ROBUSTNESS',
          penaltyExposureEur: 3000000,
          fixAvailable: true,
          fixationType: 'RAG_GROUNDING_VERIFIER',
          suggestedAction: 'Enable automated ChromaDB citation grounding check with minimum semantic relevance cutoff >= 0.78.'
        });
      }
    }

    // 3b. EU AI Act Article 5 — Prohibited Practices (expanded)
    if (profile.targetDomain === 'CONTENT_GENERATION' && profile.deploymentType === 'PUBLIC_API') {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART5-02',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 5(1)(a)',
        title: 'Subliminal or Manipulative AI-Generated Content',
        description: 'Publicly deployed generative systems must not deploy subliminal techniques that distort behaviour or materially mislead natural persons.',
        severity: 'CRITICAL',
        category: 'PROHIBITED_PRACTICE',
        penaltyExposureEur: 35000000,
        fixAvailable: true,
        fixationType: 'OUTPUT_WATERMARKING',
        suggestedAction: 'Apply mandatory AI-content watermarking and disclosure labels to all generated output.'
      });
    }

    if (profile.targetDomain === 'CUSTOMER_SUPPORT' && profile.deploymentType === 'PUBLIC_API') {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART5-03',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 5(1)(b)',
        title: 'Exploitation of Vulnerabilities via AI Interaction',
        description: 'AI systems must not exploit vulnerabilities of specific groups (age, disability, social/economic situation) to materially distort behaviour.',
        severity: 'CRITICAL',
        category: 'PROHIBITED_PRACTICE',
        penaltyExposureEur: 35000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Deploy vulnerability-exploitation guardrail with demographic-impact parity testing.'
      });
    }

    if (profile.targetDomain === 'HR_RECRUITMENT' && profile.deploymentType === 'PUBLIC_API') {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART5-04',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 5(1)(c)',
        title: 'Social Scoring of Natural Persons',
        description: 'AI systems that evaluate or classify natural persons based on social behaviour or personality traits over time, leading to detrimental or disproportionate treatment, are prohibited.',
        severity: 'CRITICAL',
        category: 'PROHIBITED_PRACTICE',
        penaltyExposureEur: 35000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Remove longitudinal social-scoring features; restrict to single-decision support with human oversight.'
      });
    }

    if (profile.targetDomain === 'CRITICAL_INFRASTRUCTURE') {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART5-05',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 5(1)(e)',
        title: 'Emotion Recognition in Workplace or Educational Settings',
        description: 'Emotion recognition systems in workplaces and educational institutions are prohibited except for safety or medical purposes.',
        severity: 'CRITICAL',
        category: 'PROHIBITED_PRACTICE',
        penaltyExposureEur: 35000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Disable emotion-recognition inference paths in workplace and education deployment contexts.'
      });
    }

    // 3c. EU AI Act Article 13 — Transparency to Deployers
    if (isHighRiskDomain) {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART13-01',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 13',
        title: 'Insufficient Transparency Instructions for Deployers',
        description: 'High-risk AI systems must be accompanied by instructions for use informing deployers of capabilities, limitations, and human-oversight measures.',
        severity: 'MEDIUM',
        category: 'TRANSPARENCY',
        penaltyExposureEur: 7500000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Generate Annex IV technical dossier and deployer instruction pack with calibrated confidence thresholds.'
      });
    }

    // 3d. EU AI Act Article 15 — Cybersecurity & Robustness
    if (profile.deploymentType === 'PUBLIC_API' || profile.deploymentType === 'EMBEDDED_AGENT') {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART15-01',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 15',
        title: 'Inadequate Cybersecurity & Technical Robustness',
        description: 'AI systems must be resilient against attempts to alter use, outputs, or performance by malicious third parties, including adversarial manipulation and data poisoning.',
        severity: 'HIGH',
        category: 'ACCURACY_ROBUSTNESS',
        penaltyExposureEur: 15000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Enable adversarial input filtering, rate-limiting, and model-output integrity verification.'
      });
    }

    // 3e. EU AI Act Article 17 — Quality Management System
    if (isHighRiskDomain) {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART17-01',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 17',
        title: 'Missing Quality Management System (QMS)',
        description: 'Providers of high-risk AI systems must establish a documented quality management system covering data governance, risk management, post-market monitoring, and incident reporting.',
        severity: 'MEDIUM',
        category: 'DATA_GOVERNANCE',
        penaltyExposureEur: 7500000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Implement QMS with documented risk-management file, post-market monitoring plan, and incident-response procedure.'
      });
    }

    // 3f. EU AI Act Article 50 — Transparency Obligations
    if (profile.deploymentType === 'PUBLIC_API' || profile.targetDomain === 'CONTENT_GENERATION') {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART50-01',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 50',
        title: 'Missing End-User AI Transparency Disclosure',
        description: 'Providers must ensure AI systems intended to interact with natural persons are designed to inform persons that they are interacting with an AI system.',
        severity: 'MEDIUM',
        category: 'TRANSPARENCY',
        penaltyExposureEur: 7500000,
        fixAvailable: true,
        fixationType: 'OUTPUT_WATERMARKING',
        suggestedAction: 'Inject AI-interaction disclosure notice and content-provenance watermark into all user-facing outputs.'
      });
    }

    // 3g. EU AI Act Article 52 — GPAI Model Obligations
    if (profile.modelFamily && /gpt|claude|gemini|llama|mistral|gpa/i.test(profile.modelFamily)) {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART52-01',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 52',
        title: 'GPAI Model Obligations Not Verified',
        description: 'Providers of general-purpose AI models must provide technical documentation, comply with Union copyright law, and publish a sufficiently detailed summary of training content.',
        severity: 'MEDIUM',
        category: 'TRANSPARENCY',
        penaltyExposureEur: 7500000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Attach GPAI technical documentation, copyright-compliance attestation, and training-content summary.'
      });
    }

    // 3h. EU AI Act Article 86 — Right to Explanation
    if (isHighRiskDomain && profile.deploymentType === 'AUTOMATED_DECISION_ENGINE') {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'EUAIA-ART86-01',
        framework: 'EU_AI_ACT',
        articleRef: 'Article 86',
        title: 'No Meaningful Right-to-Explanation Mechanism',
        description: 'Deployers of high-risk AI systems producing legal or similarly significant effects must provide meaningful information on the logic involved and the envisaged consequences.',
        severity: 'HIGH',
        category: 'HUMAN_OVERSIGHT',
        penaltyExposureEur: 15000000,
        fixAvailable: true,
        fixationType: 'HITL_APPROVAL_GATE',
        suggestedAction: 'Implement decision-explanation endpoint returning feature-attribution and confidence rationale to affected persons.'
      });
    }

    // 3i. NIST AI RMF — Govern / Map / Measure / Manage
    if (isHighRiskDomain) {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'NIST-GOV-01',
        framework: 'NIST_AI_RMF',
        articleRef: 'NIST AI RMF 1.0 — Govern',
        title: 'AI Risk Governance & Accountability Structure Missing',
        description: 'Organizations must establish AI risk-management policies, procedures, and roles with clear accountability for AI system outcomes.',
        severity: 'MEDIUM',
        category: 'DATA_GOVERNANCE',
        penaltyExposureEur: 5000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Establish AI governance board, risk-acceptance workflow, and named accountable executive per AI system.'
      });

      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'NIST-MAP-01',
        framework: 'NIST_AI_RMF',
        articleRef: 'NIST AI RMF 1.0 — Map',
        title: 'AI Context & Intended-Use Mapping Incomplete',
        description: 'The intended use, context of use, and potential impacts on individuals, communities, and society must be documented and continuously updated.',
        severity: 'LOW',
        category: 'TRANSPARENCY',
        penaltyExposureEur: 2500000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Maintain living context-of-use register with stakeholder impact assessment per deployment.'
      });

      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'NIST-MEASURE-01',
        framework: 'NIST_AI_RMF',
        articleRef: 'NIST AI RMF 1.0 — Measure',
        title: 'AI Risk Measurement & Evaluation Gaps',
        description: 'Quantitative and qualitative measurement of AI risks (accuracy, reliability, safety, security, privacy) must be performed with documented methodologies.',
        severity: 'MEDIUM',
        category: 'ACCURACY_ROBUSTNESS',
        penaltyExposureEur: 5000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Deploy continuous evaluation harness with benchmark suites for accuracy, robustness, and fairness.'
      });

      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'NIST-MANAGE-01',
        framework: 'NIST_AI_RMF',
        articleRef: 'NIST AI RMF 1.0 — Manage',
        title: 'AI Risk Response & Incident Management Not Established',
        description: 'Risks must be prioritized and managed with documented response plans, incident reporting, and post-incident learning loops.',
        severity: 'MEDIUM',
        category: 'ACCURACY_ROBUSTNESS',
        penaltyExposureEur: 5000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Implement AI incident-response playbook with severity tiers, escalation paths, and post-mortem review.'
      });
    }

    // 3j. ISO/IEC 42001 — AI Management System
    if (isHighRiskDomain) {
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'ISO42001-01',
        framework: 'ISO_42001',
        articleRef: 'ISO/IEC 42001:2023 — Clause 6',
        title: 'AI Management System (AIMS) Not Certified',
        description: 'Organizations deploying high-risk AI should operate a documented AI management system aligned to ISO/IEC 42001 with internal audit and management review.',
        severity: 'LOW',
        category: 'DATA_GOVERNANCE',
        penaltyExposureEur: 2500000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Establish AIMS with documented AI policy, objectives, risk register, and internal audit schedule.'
      });
    }

    // 3k. OWASP Top 10 for LLMs — expanded coverage
    if (profile.deploymentType === 'PUBLIC_API' || profile.deploymentType === 'EMBEDDED_AGENT') {
      // LLM03: Training Data Poisoning
      if (!profile.trainingDataProvenanceKnown) {
        findings.push({
          id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
          ruleCode: 'OWASP-LLM-03',
          framework: 'OWASP_LLM_TOP10',
          articleRef: 'OWASP LLM03:2025',
          title: 'Training Data Poisoning & Supply-Chain Contamination',
          description: 'Untrusted or unverified training corpora may embed backdoors, biases, or adversarial triggers that compromise model behaviour.',
          severity: 'HIGH',
          category: 'ACCURACY_ROBUSTNESS',
          penaltyExposureEur: 10000000,
          fixAvailable: true,
          fixationType: 'GUARDRAIL_MIDDLEWARE',
          suggestedAction: 'Apply dataset provenance verification, deduplication, and adversarial-example screening to training pipelines.'
        });
      }

      // LLM04: Model Denial of Service
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'OWASP-LLM-04',
        framework: 'OWASP_LLM_TOP10',
        articleRef: 'OWASP LLM04:2025',
        title: 'Model Denial-of-Service via Resource Exhaustion',
        description: 'Publicly exposed inference endpoints are vulnerable to resource-exhaustion attacks through unbounded input length, recursive prompts, or high-volume requests.',
        severity: 'MEDIUM',
        category: 'ACCURACY_ROBUSTNESS',
        penaltyExposureEur: 5000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Enforce input token limits, per-tenant rate limits, and compute-budget circuit breakers.'
      });

      // LLM05: Supply Chain Vulnerabilities
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'OWASP-LLM-05',
        framework: 'OWASP_LLM_TOP10',
        articleRef: 'OWASP LLM05:2025',
        title: 'LLM Supply-Chain & Plugin Vulnerabilities',
        description: 'Third-party models, plugins, and data pipelines introduce supply-chain risk including poisoned weights, malicious plugins, and compromised APIs.',
        severity: 'MEDIUM',
        category: 'PROMPT_SECURITY',
        penaltyExposureEur: 5000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Maintain SBOM for all model and plugin dependencies; verify signatures and provenance of third-party components.'
      });

      // LLM06: Sensitive Information Disclosure
      if (profile.collectsPii) {
        findings.push({
          id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
          ruleCode: 'OWASP-LLM-06',
          framework: 'OWASP_LLM_TOP10',
          articleRef: 'OWASP LLM06:2025',
          title: 'Sensitive Information Disclosure in Model Outputs',
          description: 'Models may inadvertently reveal PII, credentials, or confidential training data in generated responses.',
          severity: 'HIGH',
          category: 'PROMPT_SECURITY',
          penaltyExposureEur: 10000000,
          fixAvailable: true,
          fixationType: 'PII_SCRUBBER',
          suggestedAction: 'Deploy output-side PII and credential scrubber with post-generation redaction and audit logging.'
        });
      }

      // LLM07: Insecure Plugin Design
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'OWASP-LLM-07',
        framework: 'OWASP_LLM_TOP10',
        articleRef: 'OWASP LLM07:2025',
        title: 'Insecure Plugin / Tool-Use Design',
        description: 'LLM plugins and tool-use integrations may execute untrusted input, exfiltrate data, or escalate privileges without adequate sandboxing.',
        severity: 'MEDIUM',
        category: 'PROMPT_SECURITY',
        penaltyExposureEur: 5000000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Sandbox all plugin execution, enforce least-privilege tool permissions, and validate tool inputs against strict schemas.'
      });

      // LLM09: Misinformation & Hallucination
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'OWASP-LLM-09',
        framework: 'OWASP_LLM_TOP10',
        articleRef: 'OWASP LLM09:2025',
        title: 'Misinformation & Unverified Hallucination Risk',
        description: 'Models may generate plausible but false or unverified claims, particularly in high-stakes domains such as legal, medical, and financial advice.',
        severity: 'MEDIUM',
        category: 'ACCURACY_ROBUSTNESS',
        penaltyExposureEur: 5000000,
        fixAvailable: true,
        fixationType: 'RAG_GROUNDING_VERIFIER',
        suggestedAction: 'Enable citation-grounded generation with confidence scoring and unverified-claim fallback notices.'
      });

      // LLM10: Unbounded Consumption
      findings.push({
        id: `RISK-${uuidv4().substring(0, 8).toUpperCase()}`,
        ruleCode: 'OWASP-LLM-10',
        framework: 'OWASP_LLM_TOP10',
        articleRef: 'OWASP LLM10:2025',
        title: 'Unbounded Consumption & Cost Exhaustion',
        description: 'Uncontrolled agentic loops, recursive tool calls, or unbounded context windows can exhaust compute budgets and degrade service availability.',
        severity: 'LOW',
        category: 'ACCURACY_ROBUSTNESS',
        penaltyExposureEur: 2500000,
        fixAvailable: true,
        fixationType: 'GUARDRAIL_MIDDLEWARE',
        suggestedAction: 'Impose max-iteration, max-token, and max-cost limits on all agentic and recursive inference paths.'
      });
    }

    // 4. Calculate Risk Category & Compliance Scores
    let overallRiskLevel: AiRiskLevel = 'MINIMAL';
    if (findings.some(f => f.category === 'PROHIBITED_PRACTICE')) {
      overallRiskLevel = 'UNACCEPTABLE';
    } else if (isHighRiskDomain || findings.some(f => f.severity === 'HIGH' || f.severity === 'CRITICAL')) {
      overallRiskLevel = 'HIGH';
    } else if (profile.deploymentType === 'PUBLIC_API' || profile.targetDomain === 'CONTENT_GENERATION') {
      overallRiskLevel = 'SPECIFIC_TRANSPARENCY';
    }

    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;
    const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;

    // Score out of 100
    const deductions = (criticalCount * 35) + (highCount * 18) + (mediumCount * 7);
    const complianceScore = Math.max(12, Math.min(100, 100 - deductions));

    const totalPotentialFineEur = findings.reduce((sum, f) => sum + f.penaltyExposureEur, 0);

    const report: AiComplianceAssessmentReport = {
      assessmentId: `AIA-${uuidv4().substring(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      systemProfile: profile,
      overallRiskLevel,
      complianceScore,
      totalPotentialFineEur,
      criticalViolationsCount: criticalCount,
      highViolationsCount: highCount,
      findings,
      frameworkCoverage: {
        euAiActScore: Math.max(20, complianceScore - (isHighRiskDomain && !profile.hasHumanInTheLoop ? 20 : 0)),
        nistAiRmfScore: Math.max(30, complianceScore + 5),
        iso42001Score: Math.max(25, complianceScore - (profile.trainingDataProvenanceKnown ? 0 : 15)),
        owaspLlmScore: Math.max(20, complianceScore - (profile.collectsPii ? 12 : 0))
      },
      executiveSummary: `The AI workload '${profile.name}' (Model: ${profile.modelFamily}) has been evaluated across 4 global regulatory frameworks. Classified under risk tier [${overallRiskLevel}], with ${findings.length} actionable compliance findings and €${(totalPotentialFineEur / 1000000).toFixed(1)}M statutory fine exposure. Automated remediation patches are available for ${findings.filter(f => f.fixAvailable).length} findings.`
    };

    // Persist the assessment run and its findings to the AI risk audit store
    try {
      const lowCount = findings.filter(f => f.severity === 'LOW').length;

      insertAiRiskAuditRun({
        id: report.assessmentId,
        tenantId,
        title: `AI Risk Assessment: ${profile.name} (${profile.id})`,
        auditType: 'AUTOMATED_RISK_ASSESSMENT',
        status: 'COMPLETED',
        overallRiskScore: report.complianceScore,
        criticalFindingsCount: criticalCount,
        highFindingsCount: highCount,
        mediumFindingsCount: mediumCount,
        lowFindingsCount: lowCount,
        complianceRating: report.overallRiskLevel,
        modelsScanned: {
          id: profile.id,
          name: profile.name,
          version: profile.version,
          modelFamily: profile.modelFamily,
          riskClass: report.overallRiskLevel,
          deploymentType: profile.deploymentType
        },
        frameworksEvaluated: ['EU AI Act (Regulation 2024/1689)', 'NIST AI RMF 1.0', 'ISO/IEC 42001', 'OWASP Top 10 for LLM Applications'],
        maxPenaltyExposureEur: report.totalPotentialFineEur,
        auditSummary: report.executiveSummary
      });

      for (const finding of findings) {
        insertAiRiskFinding({
          id: finding.id,
          auditId: report.assessmentId,
          tenantId,
          title: finding.title,
          modelTarget: profile.id,
          framework: finding.framework,
          articleReference: finding.articleRef,
          severity: finding.severity,
          category: finding.category,
          description: finding.description,
          affectedCodeOrPrompt: finding.suggestedAction,
          penaltyExposureEur: finding.penaltyExposureEur,
          fixStatus: 'OPEN',
          fixProposal: finding.suggestedAction,
          appliedFixId: null
        });
      }
    } catch (e) {
      console.warn('[AI_RISK_ENGINE] Persistence warning:', e);
    }

    // Log assessment in immutable event store
    try {
      await LexDB.recordAuditEvent({
        tenant_id: tenantId,
        actor_id: 'AI_RISK_ENGINE',
        module: 'AI_COMPLIANCE_AUDITOR',
        action: 'AI_RISK_ASSESSMENT_EXECUTED',
        status: criticalCount > 0 ? 'FAILURE' : 'SUCCESS',
        severity: criticalCount > 0 ? 'CRITICAL' : (highCount > 0 ? 'WARNING' : 'INFO'),
        target: profile.name,
        payload: {
          assessmentId: report.assessmentId,
          complianceScore: report.complianceScore,
          overallRiskLevel: report.overallRiskLevel,
          findingsCount: findings.length
        }
      });
    } catch (e) {
      console.warn('[AI_RISK_ENGINE] Audit log record warning:', e);
    }

    return report;
  }

  // ── Query API ──────────────────────────────────────────────────────────────

  public static listAudits(tenantId?: string, limit = 50): AiRiskAuditRunRow[] {
    return listAiRiskAuditRuns(tenantId, limit);
  }

  public static getAudit(id: string): AiRiskAuditRunRow | undefined {
    return getAiRiskAuditRun(id);
  }

  public static listFindings(auditId?: string, tenantId?: string, limit = 200): AiRiskFindingRow[] {
    return listAiRiskFindings(auditId, tenantId, limit);
  }

  public static getFinding(id: string): AiRiskFindingRow | undefined {
    return getAiRiskFinding(id);
  }

  public static listFixations(tenantId?: string, limit = 100): AiRiskFixationRow[] {
    return listAiRiskFixations(tenantId, limit);
  }

  public static getFixation(id: string): AiRiskFixationRow | undefined {
    return getAiRiskFixation(id);
  }

  public static markFindingFixed(findingId: string, appliedFixId: string): void {
    updateAiRiskFindingFixStatus(findingId, 'FIXED', appliedFixId);
  }

  public static getAuditSummary(tenantId?: string) {
    return getAiRiskAuditSummary(tenantId);
  }
}
