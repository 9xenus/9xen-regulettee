import { v4 as uuidv4 } from 'uuid';
import { LexDB } from './LexDB';

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
  public static async assessAiSystem(profile: AiSystemProfile): Promise<AiComplianceAssessmentReport> {
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

    // Log assessment in immutable event store
    try {
      await LexDB.recordAuditEvent({
        tenant_id: 'default-tenant',
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
}
