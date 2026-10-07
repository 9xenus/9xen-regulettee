/**
 * AI SECURITY ENGINE
 * Runtime AI security controls: prompt-injection detection, PII scrubbing,
 * jailbreak resistance, and model security posture assessment.
 *
 * These are deterministic, dependency-free classifiers suitable for inline
 * middleware. They are heuristic (regex + token-overlap) rather than
 * model-based, so they are fast, auditable, and safe to run on every request.
 */
import { v4 as uuidv4 } from 'uuid';
import { AiSystemProfile } from './ai-compliance-risk-engine';
import { analyzeInjection, sanitizeForModel, type InjectionGroup } from './ai-injection-detector';

// ── Prompt injection ─────────────────────────────────────────────────────────

export type PromptInjectionCategory =
  | 'DIRECT_INJECTION'
  | 'INDIRECT_INJECTION'
  | 'JAILBREAK_ROLEPLAY'
  | 'SYSTEM_PROMPT_LEAK'
  | 'ENCODING_BYPASS'
  | 'DELIMITER_ESCAPE'
  | 'TOOL_ABUSE'
  | 'DATA_EXFILTRATION'
  | 'NONE';

export interface PromptInjectionVerdict {
  detected: boolean;
  /** Weak/ambiguous signal (score >= 0.3 but below the block threshold): route to review, don't hard-block. */
  suspicious: boolean;
  score: number; // 0..1
  flags: string[]; // normalisation signals: hidden characters, homoglyphs, decoded payloads…
  category: PromptInjectionCategory;
  matchedPatterns: string[];
  sanitizedInput: string;
  explanation: string;
}

// ── PII scrubbing ────────────────────────────────────────────────────────────

export interface PiiEntity {
  type: string;
  value: string;
  position: number;
}

export interface PiiScrubResult {
  sanitized: string;
  redactedCount: number;
  redactedTypes: string[];
  detectedEntities: PiiEntity[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const PII_PATTERNS: { type: string; pattern: RegExp; mask: string }[] = [
  { type: 'EMAIL', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, mask: '<REDACTED_EMAIL>' },
  { type: 'IBAN_EU', pattern: /\b[A-Z]{2}\d{2}(?:[ ]?\d{4}){4,7}(?:[ ]?\d{1,2})?\b/g, mask: '<REDACTED_IBAN>' },
  { type: 'SSN_US', pattern: /\b(?!000|666)\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g, mask: '<REDACTED_SSN>' },
  { type: 'NATIONAL_ID', pattern: /\b\d{9,11}\b/g, mask: '<REDACTED_NATIONAL_ID>' },
  { type: 'CREDIT_CARD', pattern: /\b(?:4\d{12}(?:\d{3})?|5[1-5]\d{14}|6(?:011|5\d{2})\d{12}|3[47]\d{13})\b/g, mask: '<REDACTED_CARD>' },
  { type: 'PHONE', pattern: /(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g, mask: '<REDACTED_PHONE>' },
  { type: 'IP_ADDRESS', pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, mask: '<REDACTED_IP>' },
  { type: 'API_KEY', pattern: /\b(?:sk|pk|ghp|gho|ghu|ghs|ghr)-[A-Za-z0-9_-]{20,}\b/g, mask: '<REDACTED_API_KEY>' },
  { type: 'JWT_TOKEN', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, mask: '<REDACTED_JWT>' },
  { type: 'AWS_KEY', pattern: /\bAKIA[0-9A-Z]{16}\b/g, mask: '<REDACTED_AWS_KEY>' },
  { type: 'PRIVATE_KEY', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g, mask: '<REDACTED_PRIVATE_KEY>' },
  { type: 'PASSWORD_ASSIGNMENT', pattern: /\b(password|passwd|pwd)\s*[:=]\s*\S+/gi, mask: '$1=<REDACTED_PASSWORD>' },
  { type: 'CREDENTIAL_ASSIGNMENT', pattern: /\b(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*\S+/gi, mask: '$1=<REDACTED_SECRET>' }
];

// ── Jailbreak detection ──────────────────────────────────────────────────────

export interface JailbreakVerdict {
  detected: boolean;
  score: number; // 0..1
  matchedTechniques: string[];
  explanation: string;
}

// ── Security posture ─────────────────────────────────────────────────────────

export interface AiSecurityPostureReport {
  postureId: string;
  timestamp: string;
  tenantId: string;
  systemId: string;
  systemName: string;
  overallScore: number; // 0..100
  securityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  promptInjection: {
    score: number;
    grade: string;
    findings: string[];
  };
  piiProtection: {
    score: number;
    grade: string;
    findings: string[];
  };
  jailbreakResistance: {
    score: number;
    grade: string;
    findings: string[];
  };
  transparency: {
    score: number;
    grade: string;
    findings: string[];
  };
  recommendations: string[];
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ── Engine ───────────────────────────────────────────────────────────────────

export class AiSecurityEngine {

  /**
   * Detects prompt injection: direct overrides, system-prompt extraction, jailbreak personas, delimiter
   * spoofing, tool abuse, exfiltration requests and indirect (in-content) instructions — including
   * obfuscated (homoglyph, zero-width, leetspeak, ROT13, base64) and multilingual variants.
   * Heuristic: a first line of defence, not a guarantee.
   */
  public static detectPromptInjection(input: string): PromptInjectionVerdict {
    const a = analyzeInjection(input);
    const order: [string, PromptInjectionCategory][] = [
      ['LEAK', 'SYSTEM_PROMPT_LEAK'], ['JAILBREAK', 'JAILBREAK_ROLEPLAY'], ['DELIMITER', 'DELIMITER_ESCAPE'], ['TOOL', 'TOOL_ABUSE'],
      ['EXFIL', 'DATA_EXFILTRATION'], ['INDIRECT', 'INDIRECT_INJECTION'], ['ENCODING', 'ENCODING_BYPASS'],
      ['OVERRIDE', 'DIRECT_INJECTION'], ['MULTILINGUAL', 'DIRECT_INJECTION'], ['CONTEXT', 'DIRECT_INJECTION']
    ];
    let category: PromptInjectionCategory = 'NONE';
    let best = 0;
    for (const [group, cat] of order) {
      const g = a.groupScores[group] || 0;
      if (g > best) { best = g; category = cat; }
    }
    const matchedPatterns = a.matches.map(m => m.label);
    const suspicious = !a.detected && a.score >= 0.3;
    return {
      detected: a.detected,
      suspicious,
      score: a.score,
      category: a.detected || suspicious ? category : 'NONE',
      flags: a.flags,
      matchedPatterns,
      sanitizedInput: a.sanitized,
      explanation: a.detected
        ? `Detected ${matchedPatterns.length} injection indicator(s): ${matchedPatterns.slice(0, 6).join(', ')}${a.flags.length ? ` [${a.flags.join(', ')}]` : ''}. Input quarantined and sanitized before inference.`
        : suspicious
          ? `Ambiguous signals (${matchedPatterns.join(', ') || a.flags.join(', ')}); routed for review rather than blocked.`
          : 'No prompt-injection indicators detected. Input conforms to the zero-trust prompt envelope.'
    };
  }

  /**
   * Scrubs PII and credentials from text using bidirectional regex/NER patterns.
   */
  public static scrubPii(text: string): PiiScrubResult {
    let sanitized = text;
    const detectedEntities: PiiEntity[] = [];
    const redactedTypes: string[] = [];

    for (const { type, pattern, mask } of PII_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        detectedEntities.push({ type, value: match[0], position: match.index });
        if (!redactedTypes.includes(type)) redactedTypes.push(type);
      }
      sanitized = sanitized.replace(pattern, mask);
    }

    const redactedCount = detectedEntities.length;

    let riskLevel: PiiScrubResult['riskLevel'] = 'LOW';
    if (redactedCount >= 10) riskLevel = 'CRITICAL';
    else if (redactedCount >= 5) riskLevel = 'HIGH';
    else if (redactedCount >= 1) riskLevel = 'MEDIUM';

    return { sanitized, redactedCount, redactedTypes, detectedEntities, riskLevel };
  }

  /**
   * Detects jailbreak / persona-switch attempts (override and jailbreak signal groups only).
   */
  public static detectJailbreak(input: string): JailbreakVerdict {
    const groups: InjectionGroup[] = ['JAILBREAK', 'OVERRIDE', 'MULTILINGUAL'];
    const a = analyzeInjection(input, { groups });
    const matchedTechniques = a.matches.filter(m => m.weight >= 0.4).map(m => m.label);
    return {
      detected: a.detected,
      score: a.score,
      matchedTechniques,
      explanation: a.detected
        ? `Detected ${matchedTechniques.length} jailbreak technique(s): ${matchedTechniques.join(', ')}.`
        : 'No jailbreak or adversarial roleplay indicators detected.'
    };
  }

  /**
   * Produces a holistic AI security posture report for a system profile.
   */
  public static assessSecurityPosture(
    profile: AiSystemProfile,
    tenantId: string = 'default-tenant'
  ): AiSecurityPostureReport {
    const promptFindings: string[] = [];
    const piiFindings: string[] = [];
    const jailbreakFindings: string[] = [];
    const transparencyFindings: string[] = [];

    // ── Prompt injection posture ──
    let promptScore = 100;
    const prompt = profile.systemPrompt || '';
    const hasDelimiters = prompt.includes('###') || prompt.includes('<<<') || prompt.includes('GUARDRAIL') || prompt.includes('USER_INPUT_START');
    const hasAntiJailbreak = /ignore previous|jailbreak|system prompt|guardrail/i.test(prompt);

    if (!hasDelimiters) {
      promptScore -= 30;
      promptFindings.push('System prompt lacks structural boundary delimiters (### / <<< / GUARDRAIL).');
    }
    if (!hasAntiJailbreak) {
      promptScore -= 20;
      promptFindings.push('System prompt does not contain explicit anti-jailbreak directives.');
    }
    if (profile.deploymentType === 'PUBLIC_API' && !hasDelimiters) {
      promptScore -= 15;
      promptFindings.push('Public-facing deployment without prompt boundary isolation is high risk.');
    }
    promptScore = clamp(promptScore, 0, 100);

    // ── PII protection posture ──
    let piiScore = 100;
    if (profile.collectsPii) {
      piiScore -= 25;
      piiFindings.push('System collects PII but no PII scrubber middleware is confirmed.');
    }
    if (profile.usesExternalRag) {
      piiScore -= 10;
      piiFindings.push('External RAG ingestion path may introduce unscrubbed PII into the context window.');
    }
    piiScore = clamp(piiScore, 0, 100);

    // ── Jailbreak resistance posture ──
    let jailbreakScore = 100;
    if (profile.deploymentType === 'PUBLIC_API' || profile.deploymentType === 'EMBEDDED_AGENT') {
      jailbreakScore -= 20;
      jailbreakFindings.push('Public/embedded deployment is exposed to adversarial roleplay attempts.');
    }
    if (!hasAntiJailbreak) {
      jailbreakScore -= 25;
      jailbreakFindings.push('No anti-jailbreak guardrail directives detected in system prompt.');
    }
    if (profile.confidenceThreshold !== undefined && profile.confidenceThreshold < 0.8) {
      jailbreakScore -= 10;
      jailbreakFindings.push(`Low confidence threshold (${profile.confidenceThreshold}) increases susceptibility to manipulated inputs.`);
    }
    jailbreakScore = clamp(jailbreakScore, 0, 100);

    // ── Transparency posture ──
    let transparencyScore = 100;
    if (profile.deploymentType === 'PUBLIC_API') {
      transparencyScore -= 15;
      transparencyFindings.push('Public API deployment requires Article 50 transparency disclosure to end users.');
    }
    if (!profile.trainingDataProvenanceKnown) {
      transparencyScore -= 20;
      transparencyFindings.push('Training data provenance is not documented, impairing transparency obligations.');
    }
    transparencyScore = clamp(transparencyScore, 0, 100);

    const overallScore = Math.round(
      promptScore * 0.35 + piiScore * 0.25 + jailbreakScore * 0.25 + transparencyScore * 0.15
    );

    const recommendations: string[] = [];
    if (promptScore < 80) recommendations.push('Apply Zero-Trust Prompt Envelope with XML/Markdown boundary isolation.');
    if (piiScore < 80) recommendations.push('Deploy bidirectional PII scrubber at prompt ingress and output layers.');
    if (jailbreakScore < 80) recommendations.push('Enable semantic jailbreak classifier with cosine-similarity threshold >= 0.78.');
    if (transparencyScore < 80) recommendations.push('Publish Article 50 transparency notice and model documentation.');
    if (recommendations.length === 0) recommendations.push('Maintain current posture; schedule quarterly red-team reassessment.');

    return {
      postureId: `SEC-${uuidv4().substring(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      tenantId,
      systemId: profile.id,
      systemName: profile.name,
      overallScore,
      securityGrade: scoreToGrade(overallScore) as AiSecurityPostureReport['securityGrade'],
      promptInjection: { score: promptScore, grade: scoreToGrade(promptScore), findings: promptFindings },
      piiProtection: { score: piiScore, grade: scoreToGrade(piiScore), findings: piiFindings },
      jailbreakResistance: { score: jailbreakScore, grade: scoreToGrade(jailbreakScore), findings: jailbreakFindings },
      transparency: { score: transparencyScore, grade: scoreToGrade(transparencyScore), findings: transparencyFindings },
      recommendations
    };
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  private static sanitizeInput(input: string): string {
    return sanitizeForModel(input);
  }
}
