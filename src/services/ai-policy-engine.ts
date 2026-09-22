import { LexDB } from './LexDB';
import crypto from 'crypto';

// ==========================================
// TYPES & INTERFACES (EU AI Act Policy Engine)
// ==========================================

export interface PolicyViolation {
  id: string;
  filePath: string;
  lineNumber: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  articleMapping: string;
  issue: string;
  evidence: string;
  isAutoFixable: boolean;
  fixSuggestion: string; // Patch/Code replacement suggestion
  verificationStatus: 'unverified' | 'passed' | 'failed';
}

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  jobId: string;
  action: 'SCAN' | 'AUTO_FIX' | 'VERIFY';
  timestamp: string;
  violationId?: string;
  filePath: string;
  severity: string;
  articleMapping: string;
  patchApplied: boolean;
  verificationResult: 'PASSED' | 'FAILED' | 'PENDING';
  evidenceTrail: string;
}

export interface PolicyEngineJob {
  jobId: string;
  tenantId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  findings: PolicyViolation[];
  createdAt: string;
  completedAt?: string;
}

// In-memory job repository for async jobs
const activeJobs = new Map<string, PolicyEngineJob>();

// ==========================================
// CORE POLICY ENGINE MODULES
// ==========================================

export class PolicyEngineService {

  /**
   * 1. SCANNER: scans code/configuration for EU AI Act or common compliance violations
   */
  public static scanCodeContent(
    tenantId: string,
    filePath: string,
    codeContent: string,
    laws: string[] = ['AI_ACT', 'GDPR', 'PDPA', 'CCPA', 'HIPAA', 'LGPD', 'CDR', 'APRA', 'CYBERSECURITY', 'FEAT', 'COPPA']
  ): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    const lines = codeContent.split('\n');
    const activeLaws = new Set(laws.map(l => l.toUpperCase()));

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Rule A: Prohibited Practice - Social Scoring (EU AI Act Article 5)
      if (activeLaws.has('AI_ACT') && (line.includes('socialScoring') || line.includes('social_scoring') || line.includes('calculateSocialScore'))) {
        violations.push({
          id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          filePath,
          lineNumber: lineNum,
          severity: 'CRITICAL',
          articleMapping: 'EU AI Act Article 5(1)(c) - Prohibited Social Scoring',
          issue: 'Prohibited algorithmic social scoring system detected.',
          evidence: `Found reference: "${line.trim()}"`,
          isAutoFixable: false,
          fixSuggestion: '// WARNING: AI system evaluating social credit is prohibited. Completely deprecate this module.',
          verificationStatus: 'unverified'
        });
      }

      // Rule B: Prohibited Practice - Real-time Biometric Auth in public spaces (EU AI Act Article 5)
      if (activeLaws.has('AI_ACT') && (line.includes('realtimeBiometricAuth') || line.includes('realTimeBiometricAuthentication'))) {
        violations.push({
          id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          filePath,
          lineNumber: lineNum,
          severity: 'CRITICAL',
          articleMapping: 'EU AI Act Article 5(1)(h) - Real-time Remote Biometric Identification',
          issue: 'Prohibited real-time biometric tracking/matching system.',
          evidence: `Found reference: "${line.trim()}"`,
          isAutoFixable: false,
          fixSuggestion: '// WARNING: Real-time biometric matching in public spaces is illegal. Revert to asynchronous post-event approval.',
          verificationStatus: 'unverified'
        });
      }

      // Rule C: High-Risk System - Credit Scoring / Loan Bias (EU AI Act Article 6 / Annex III)
      if (activeLaws.has('AI_ACT') && (line.includes('creditScoringModel') || line.includes('calculateCreditRisk') || line.includes('evaluateLoanRisk'))) {
        // Check if there is bias mitigation or logging enabled on adjacent lines
        const surroundingText = lines.slice(Math.max(0, index - 5), Math.min(lines.length, index + 6)).join('\n');
        const hasBiasMitigation = surroundingText.includes('mitigateBias') || surroundingText.includes('biasTest') || surroundingText.includes('demographicParity');

        if (!hasBiasMitigation) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'EU AI Act Annex III(5)(b) - High-Risk Credit Scoring Bias Safeguards',
            issue: 'High-risk automated scoring system missing explicit algorithmic bias and fairness metrics.',
            evidence: `High-risk risk scoring function "${line.trim()}" lacks active bias checking.`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied
const biasMetrics = performDemographicParityCheck(dataset);
if (biasMetrics.disparateImpactRatio < 0.8) {
  throw new Error("Safety Guard triggered: Detected high racial or gender demographic skew in loan assignments.");
}`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule D: Logging requirement for High-Risk systems (EU AI Act Article 12)
      if (activeLaws.has('AI_ACT') && (line.includes('highRiskModelInference') || line.includes('runInference'))) {
        const surroundingText = lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 4)).join('\n');
        const hasLogging = surroundingText.includes('logInferenceDecision') || surroundingText.includes('transparencyLedger') || surroundingText.includes('auditTrail');

        if (!hasLogging) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'EU AI Act Article 12 - Traceability Logging',
            issue: 'High-risk AI engine executing decisions without transaction traceability or inference audit logs.',
            evidence: `Found unlogged inference routine: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied
await logInferenceDecision({
  moduleId: "CRITICAL_DECISION_ENGINE",
  modelIdentifier: "local-llm-1.5",
  deterministicSafetyScore: 0.98,
  decisionOutcome: "APPROVED"
});`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule E: Human Oversight (EU AI Act Article 14)
      if (activeLaws.has('AI_ACT') && (line.includes('approveDirectPayout') || line.includes('finalAutomatedApproval'))) {
        const surroundingText = lines.slice(Math.max(0, index - 4), Math.min(lines.length, index + 5)).join('\n');
        const hasHumanOverride = surroundingText.includes('humanInTheLoop') || surroundingText.includes('manualOverrideEnabled') || surroundingText.includes('triggerManualReview');

        if (!hasHumanOverride) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'EU AI Act Article 14 - Human Oversight Control',
            issue: 'Critical automated outcome executed without human-in-the-loop validation or manual override fallback.',
            evidence: `No manual review triggers associated with automated dispatcher: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied
if (modelConfidence < 0.92) {
  return triggerManualReview(payoutPayload);
}`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule F: GDPR - Unencrypted PII Storage (Article 32)
      if (activeLaws.has('GDPR') && line.includes('localStorage.setItem') && (line.includes('email') || line.includes('token') || line.includes('phone'))) {
        violations.push({
          id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          filePath,
          lineNumber: lineNum,
          severity: 'HIGH',
          articleMapping: 'GDPR Article 32 - Security of Processing',
          issue: 'Sensitive PII or authentication tokens stored in unencrypted browser LocalStorage.',
          evidence: `Insecure storage call: "${line.trim()}"`,
          isAutoFixable: true,
          fixSuggestion: `// Patchwork AutoFix Applied: Encrypting PII before storage
const encryptedPii = PiiEncryptionService.encryptField(plainValue);
localStorage.setItem(key, encryptedPii);`,
          verificationStatus: 'unverified'
        });
      }

      // Rule G: GDPR - Missing Consent Check for Analytics (Article 7)
      if (activeLaws.has('GDPR') && (line.includes('trackEvent') || line.includes('gtag(') || line.includes('fbq('))) {
        const surroundingText = lines.slice(Math.max(0, index - 5), Math.min(lines.length, index + 2)).join('\n');
        if (!surroundingText.includes('hasConsent') && !surroundingText.includes('checkConsent')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'MEDIUM',
            articleMapping: 'GDPR Article 7 - Conditions for Consent',
            issue: 'Analytics tracking triggered without verifying explicit user consent status.',
            evidence: `Unprotected tracking call: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: Consent Guard
if (ComplianceManager.hasUserConsent('analytics')) {
  ${line.trim()}
}`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule H: Cybersecurity - SQL Injection Risk (OWASP A03:2021)
      if (activeLaws.has('CYBERSECURITY') && line.includes('db.prepare') && line.includes('${')) {
        violations.push({
          id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          filePath,
          lineNumber: lineNum,
          severity: 'CRITICAL',
          articleMapping: 'Cybersecurity Best Practice - SQL Injection Prevention',
          issue: 'Potential SQL Injection vulnerability via string interpolation in database query.',
          evidence: `Vulnerable query: "${line.trim()}"`,
          isAutoFixable: true,
          fixSuggestion: `// Patchwork AutoFix Applied: Parameterized Query
db.prepare('SELECT * FROM users WHERE id = ?').get(id);`,
          verificationStatus: 'unverified'
        });
      }

      // Rule I: Singapore PDPA - Explicit Consent for Marketing/Contact Lists
      if (activeLaws.has('PDPA') && (line.includes('processContactList') || (line.includes('marketing') && line.includes('contactList')))) {
        const surroundingText = lines.slice(Math.max(0, index - 5), Math.min(lines.length, index + 3)).join('\n');
        if (!surroundingText.includes('pdpaConsent') && !surroundingText.includes('hasPdpaConsent')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'Singapore PDPA Article 12/20 - Explicit Consent for Personal Data Processing',
            issue: 'Personal contact list or marketing collection triggered without explicit PDPA consent verification.',
            evidence: `Unconsented processing function: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: PDPA Consent Verification
if (!ConsentManager.hasPdpaConsent(userId, 'marketing')) {
  throw new Error("PDPA Violation: Explicit consent not provided for processing contact lists.");
}`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule J: MAS FEAT Principle - AI Fairness & Explainability
      if (activeLaws.has('FEAT') && (line.includes('creditScoringModel') || line.includes('evaluateFinancialScore'))) {
        const surroundingText = lines.slice(Math.max(0, index - 4), Math.min(lines.length, index + 5)).join('\n');
        if (!surroundingText.includes('explainFeatOutcome') && !surroundingText.includes('featExplainability')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'MAS FEAT Principle - Fairness, Ethics, Accountability, and Transparency',
            issue: 'Financial evaluation/scoring algorithm missing explicit MAS FEAT explainability trails.',
            evidence: `Unexplained evaluation routine: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: MAS FEAT transparency validation
const explanation = await explainFeatOutcome(inferenceDecision);
logFeatAuditTrail({ decision: inferenceDecision, explanation });`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule K: CCPA Opt-Out Right (California Consumer Privacy Act)
      if (activeLaws.has('CCPA') && (line.includes('captureUserLead') || (line.includes('leads') && line.includes('tracking')))) {
        const surroundingText = lines.slice(Math.max(0, index - 4), Math.min(lines.length, index + 3)).join('\n');
        if (!surroundingText.includes('ccpaOptOut') && !surroundingText.includes('ccpa_opt_out')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'CCPA Section 1798.120 - Do Not Sell/Share Opt-Out Right',
            issue: 'Personal data lead capture executed without verifying CCPA Do-Not-Sell opt-out status.',
            evidence: `Lead collection query: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: CCPA Opt-Out Shield
if (ccpaUserPreferences.hasOptedOut()) {
  throw new Error("CCPA Enforcement: User has opted out of personal data selling.");
}`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule L: COPPA Children's Privacy (Under 13 Age Gate)
      if (activeLaws.has('COPPA') && (line.includes('collectChildProfile') || line.includes('children_profiles'))) {
        const surroundingText = lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 4)).join('\n');
        if (!surroundingText.includes('verifyParentalConsent') && !surroundingText.includes('parentalConsentCheck')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'CRITICAL',
            articleMapping: 'COPPA 16 CFR Part 312 - Verifiable Parental Consent',
            issue: 'Child personal profile collected without verifiable COPPA parental consent verification.',
            evidence: `Unverified child collection routine: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: COPPA Parental Consent Safeguard
if (userAge < 13 && !parentalConsentCheck(parentEmail)) {
  throw new Error("COPPA Violation: Verifiable parental consent is mandatory for users under 13.");
}`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule M: HIPAA Security Rule (Health Information Encryption)
      if (activeLaws.has('HIPAA') && (line.includes('patientHealthRecord') || line.includes('medicalScan') || line.includes('bloodPressure'))) {
        const surroundingText = lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 4)).join('\n');
        if (!surroundingText.includes('encryptField') && !surroundingText.includes('transmitSecurePhi')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'CRITICAL',
            articleMapping: 'HIPAA Security Rule 45 CFR § 164.312 - Transmission Security',
            issue: 'Protected Health Information (PHI) stored or logged without end-to-end transport encryption.',
            evidence: `Unencrypted PHI processing: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: HIPAA PHI payload encryption
const securePhi = PiiEncryptionService.encryptField(JSON.stringify(patientHealthRecord));
transmitSecurePhi(securePhi);`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule N: Brazil LGPD (Lei Geral de Proteção de Dados)
      if (activeLaws.has('LGPD') && (line.includes('processBiometrics') || line.includes('biometric_vault'))) {
        const surroundingText = lines.slice(Math.max(0, index - 4), Math.min(lines.length, index + 4)).join('\n');
        if (!surroundingText.includes('lgpdConsent') && !surroundingText.includes('lgpd_consent')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'Brazil LGPD Article 5/11 - Consent for Sensitive Data Processing',
            issue: 'Sensitive biometric or personal data captured without explicit LGPD consent verification.',
            evidence: `Biometric capture call: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: LGPD Consent Guard
if (!lgpdConsent.isConsentGiven(userId, 'sensitive_processing')) {
  throw new Error("LGPD Violation: Valid consent required to process sensitive/biometric records.");
}`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule O: Australia APRA CPS 234 - Data Sovereignty
      if (activeLaws.has('APRA') && (line.includes('replicateCustomerCloud') || line.includes('cloudStorage.upload'))) {
        const surroundingText = lines.slice(Math.max(0, index - 5), Math.min(lines.length, index + 5)).join('\n');
        if (!surroundingText.includes('isAustraliaDataSovereign') && !surroundingText.includes('cps234SovereigntyCheck')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'Australia APRA CPS 234 - Information Security Sovereignty Control',
            issue: 'Australian customer data mirrored or uploaded without sovereign data localization validations.',
            evidence: `Sovereignty-blind upload routine: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: Australia Sovereignty Router
if (userRegion === 'AU' && !isAustraliaDataSovereign(storageNode)) {
  throw new Error("APRA CPS 234 Violation: Australian citizen data must remain on sovereign Australian nodes.");
}`,
            verificationStatus: 'unverified'
          });
        }
      }

      // Rule P: Australia Consumer Data Right (CDR Consent)
      if (activeLaws.has('CDR') && (line.includes('processCDRTransfers') || line.includes('shared_cdr_data'))) {
        const surroundingText = lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 4)).join('\n');
        if (!surroundingText.includes('cdrConsentVerified') && !surroundingText.includes('cdrConsent')) {
          violations.push({
            id: `VIOL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            filePath,
            lineNumber: lineNum,
            severity: 'HIGH',
            articleMapping: 'Australia CDR Rule 4.11 - Verifiable Consent for Consumer Data Sharing',
            issue: 'CDR financial/banking information shared without active verifiable consent check.',
            evidence: `CDR sharing routine: "${line.trim()}"`,
            isAutoFixable: true,
            fixSuggestion: `// Patchwork AutoFix Applied: CDR Verifiable Consent
if (!cdrConsentVerified(clientId, dataSharingDuration)) {
  throw new Error("CDR Violation: Unverified consent or duration limit exceeded for CDR financial data sharing.");
}`,
            verificationStatus: 'unverified'
          });
        }
      }
    });

    return violations;
  }

  /**
   * 2. FIXER (Patchwork AutoFix): Applies patch suggestions to fix policy violations
   */
  public static applyAutoPatch(
    codeContent: string,
    violation: PolicyViolation
  ): { patchedCode: string; patchApplied: boolean } {
    if (!violation.isAutoFixable) {
      return { patchedCode: codeContent, patchApplied: false };
    }

    const lines = codeContent.split('\n');
    const targetIdx = violation.lineNumber - 1;

    if (targetIdx < 0 || targetIdx >= lines.length) {
      return { patchedCode: codeContent, patchApplied: false };
    }

    // Insert the patch fix suggestion right below or inline with the target line
    const targetLine = lines[targetIdx];
    lines[targetIdx] = `${targetLine}\n${violation.fixSuggestion}`;

    return {
      patchedCode: lines.join('\n'),
      patchApplied: true
    };
  }

  /**
   * 3. VERIFIER: Re-scans patched content and verifies if violation has been resolved
   */
  public static verifyPatchResolution(
    tenantId: string,
    filePath: string,
    patchedCode: string,
    originalViolation: PolicyViolation
  ): { isResolved: boolean; verificationLog: string } {
    const reFindings = this.scanCodeContent(tenantId, filePath, patchedCode);
    
    // Check if the original violation article mapping is still violated at the same severity
    const stillViolated = reFindings.some(
      v => v.articleMapping === originalViolation.articleMapping
    );

    return {
      isResolved: !stillViolated,
      verificationLog: !stillViolated 
        ? `Verification Passed: Patch correctly mitigated "${originalViolation.articleMapping}". Re-scan returned 0 matching vulnerabilities.` 
        : `Verification Failed: Pattern matching still flagged security violations after inserting the mitigation snippet.`
    };
  }

  /**
   * 4. AUDIT LOGGER: Logs audit evidence and transactions to the multi-database fabric
   */
  public static async writeAuditEvidence(
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
  ): Promise<string> {
    const id = `AUD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const fullEntry: AuditLogEntry = { ...entry, id, timestamp };

    // Use LexDB for a synchronized, auditable write
    await LexDB.synchronizedWrite({
      sql: `
        INSERT INTO audit_events (id, scan_id, action, input_data, output_data)
        VALUES (?, ?, ?, ?, ?)
      `,
      sqlParams: [
        id,
        entry.jobId,
        entry.action,
        JSON.stringify({ filePath: entry.filePath, severity: entry.severity }),
        JSON.stringify(fullEntry)
      ],
      audit: {
        tenant_id: entry.tenantId,
        actor_id: 'POLICY_ENGINE',
        module: 'POLICY_ENGINE',
        action: entry.action,
        status: 'SUCCESS',
        severity: entry.severity as any || 'INFO',
        target: entry.filePath,
        payload: fullEntry
      },
      vector: {
        domain: 'compliance_audit_logs',
        text: `Audit Event ${id}: ${entry.action} on ${entry.filePath}. Mapping: ${entry.articleMapping}. Finding: ${entry.evidenceTrail}`,
        metadata: { ...fullEntry }
      }
    });

    return id;
  }

  // ==========================================
  // ASYNC JOB FLOW ORCHESTRATOR
  // ==========================================

  public static createAsyncJob(tenantId: string): string {
    const jobId = `JOB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    activeJobs.set(jobId, {
      jobId,
      tenantId,
      status: 'PENDING',
      findings: [],
      createdAt: new Date().toISOString()
    });
    return jobId;
  }

  public static getJobStatus(jobId: string): PolicyEngineJob | null {
    return activeJobs.get(jobId) || null;
  }

  public static async runCodeScanJob(
    jobId: string,
    filePath: string,
    codeContent: string
  ): Promise<PolicyEngineJob> {
    const job = activeJobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    job.status = 'RUNNING';
    activeJobs.set(jobId, job);

    // Simulate standard async compliance analysis pipeline delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const findings = this.scanCodeContent(job.tenantId, filePath, codeContent);
      job.findings = findings;
      job.status = 'COMPLETED';
      job.completedAt = new Date().toISOString();
      activeJobs.set(jobId, job);

      // Log the scan execution audit log
      findings.forEach(v => {
        this.writeAuditEvidence({
          tenantId: job.tenantId,
          jobId,
          action: 'SCAN',
          violationId: v.id,
          filePath: v.filePath,
          severity: v.severity,
          articleMapping: v.articleMapping,
          patchApplied: false,
          verificationResult: 'PENDING',
          evidenceTrail: v.evidence
        });
      });

      return job;
    } catch (e: any) {
      job.status = 'FAILED';
      job.completedAt = new Date().toISOString();
      activeJobs.set(jobId, job);
      throw e;
    }
  }
}
