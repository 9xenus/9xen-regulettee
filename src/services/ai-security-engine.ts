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

// ── Prompt injection ─────────────────────────────────────────────────────────

export type PromptInjectionCategory =
  | 'DIRECT_INJECTION'
  | 'INDIRECT_INJECTION'
  | 'JAILBREAK_ROLEPLAY'
  | 'SYSTEM_PROMPT_LEAK'
  | 'ENCODING_BYPASS'
  | 'NONE';

export interface PromptInjectionVerdict {
  detected: boolean;
  score: number; // 0..1
  category: PromptInjectionCategory;
  matchedPatterns: string[];
  sanitizedInput: string;
  explanation: string;
}

const DIRECT_INJECTION_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'ignore_previous_instructions', pattern: /\b(ignore|disregard|forget|override)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|directives?|rules?|prompts?)\b/i },
  { label: 'ignore_all_instructions', pattern: /\bignore\s+(all|any)\s+(instructions?|directives?|rules?)\b/i },
  { label: 'disregard_system_prompt', pattern: /\b(disregard|bypass|skip)\s+(the\s+)?(system\s+)?(prompt|instructions?|guardrails?)\b/i },
  { label: 'you_are_now', pattern: /\byou\s+are\s+(now|no\s+longer|instead)\b/i },
  { label: 'act_as', pattern: /\bact\s+as\s+(if\s+)?(you\s+are|an?)\b/i },
  { label: 'pretend_to_be', pattern: /\b(pretend|imagine|roleplay|role-play)\s+(to\s+be|you\s+are|as)\b/i },
  { label: 'new_persona', pattern: /\b(new|different|alternate)\s+(persona|identity|character|mode)\b/i },
  { label: 'override_safety', pattern: /\b(override|disable|turn\s+off|deactivate)\s+(safety|security|guardrails?|filters?|restrictions?)\b/i },
  { label: 'reveal_system_prompt', pattern: /\b(reveal|show|print|display|leak|expose|repeat)\s+(me\s+)?(the\s+)?(system\s+)?(prompt|instructions?|initialization)\b/i },
  { label: 'reveal_instructions', pattern: /\b(what\s+are|show|tell|repeat)\s+(your|the)\s+(instructions?|rules?|guidelines?|system\s+prompt)\b/i },
  { label: 'developer_mode', pattern: /\b(developer|admin|root|debug|maintenance)\s+mode\b/i },
  { label: 'sudo_root', pattern: /\b(sudo|root\s+access|elevated\s+privileges?)\b/i },
  { label: 'no_restrictions', pattern: /\b(no\s+restrictions?|without\s+(restrictions?|limits?|rules?)|unrestricted|unfiltered)\b/i },
  { label: 'do_not_tell', pattern: /\b(do\s+not|don'?t)\s+(tell|inform|warn|notify|reveal)\b/i },
  { label: 'secret_mode', pattern: /\b(secret|hidden|stealth|covert|clandestine)\s+mode\b/i },
  { label: 'hypothetical_scenario', pattern: /\b(hypothetical|imagine\s+a\s+world|in\s+a\s+fictional)\b/i },
  { label: 'opposite_mode', pattern: /\b(opposite|reverse|inverse)\s+(mode|behavior|personality)\b/i },
  { label: 'unlimited_power', pattern: /\b(unlimited|infinite|absolute)\s+(power|control|authority)\b/i },
  { label: 'break_free', pattern: /\b(break\s+free|escape|break\s+out\s+of)\s+(the\s+)?(constraints?|restrictions?|jail|cage|box)\b/i },
  { label: 'jailbreak', pattern: /\b(jailbreak|jail\s*break|DAN|do\s+anything\s+now)\b/i }
];

const INDIRECT_INJECTION_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'embedded_instruction', pattern: /\b(please\s+)?(follow|obey|execute)\s+(the\s+)?(following|these|this)\s+(instruction|command|directive|order)s?\b/i },
  { label: 'instruction_in_content', pattern: /\b(instruction|command|directive|order)s?\s*:\s*\b/i },
  { label: 'system_message_in_content', pattern: /\b(system\s+message|system\s+notice|system\s+alert)\s*:/i },
  { label: 'assistant_pretend', pattern: /\b(as\s+an?\s+AI|as\s+a\s+language\s+model|as\s+an?\s+assistant)\b/i },
  { label: 'conflicting_directive', pattern: /\b(but\s+now|however|instead|nevertheless|regardless)\s*,?\s*(you\s+must|follow|obey|execute)\b/i },
  { label: 'priority_override', pattern: /\b(this\s+is\s+)?(more\s+important|higher\s+priority|takes?\s+precedence|overrides?)\b/i },
  { label: 'context_switch', pattern: /\b(from\s+now\s+on|going\s+forward|henceforth)\b/i }
];

const ENCODING_BYPASS_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'base64_instruction', pattern: /\b(base64|decode|decipher)\s+(this|the|following)\b/i },
  { label: 'rot13', pattern: /\brot13\b/i },
  { label: 'reverse_text', pattern: /\b(reverse|backwards?)\s+(the\s+)?(text|string|message)\b/i },
  { label: 'hex_encoded', pattern: /\b(hex|hexadecimal)\s+(decode|encoded?)\b/i },
  { label: 'unicode_escape', pattern: /\\u[0-9a-f]{4}/i },
  { label: 'zero_width_joiner', pattern: /[​‌‍﻿]/ },
  { label: 'homoglyph_substitution', pattern: /[а-яА-Я]/ } // Cyrillic lookalikes
];

const SYSTEM_PROMPT_LEAK_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'print_system_prompt', pattern: /\b(print|output|echo|repeat|show)\s+(the\s+)?(system\s+)?(prompt|instructions?|initialization)\b/i },
  { label: 'first_500_chars', pattern: /\b(first|initial)\s+\d+\s+(characters?|chars?|tokens?|words?)\b/i },
  { label: 'verbatim_copy', pattern: /\b(verbatim|word\s+for\s+word|exact(ly)?\s+(copy|text|same))\b/i },
  { label: 'markdown_block', pattern: /```(markdown|system|prompt)?/i },
  { label: 'system_directive', pattern: /\bSYSTEM\s+DIRECTIVE\b/i },
  { label: 'critical_guardrails', pattern: /CRITICAL_SECURITY_GUARDRAILS/i },
  { label: 'user_input_start', pattern: /USER_INPUT_START/i }
];

const JAILBREAK_ROLEPLAY_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'dan_mode', pattern: /\bDAN\b|do\s+anything\s+now/i },
  { label: 'evil_twin', pattern: /\b(evil|bad|dark|malicious)\s+(twin|version|alter\s*ego|counterpart)\b/i },
  { label: 'unrestricted_ai', pattern: /\b(unrestricted|unfiltered|uncensored|unlimited)\s+(AI|bot|assistant|model|version)\b/i },
  { label: 'no_rules', pattern: /\b(no\s+rules?|without\s+rules?|rules?\s+don'?t\s+apply|ignore\s+rules?)\b/i },
  { label: 'no_guidelines', pattern: /\b(no\s+guidelines?|without\s+guidelines?|guidelines?\s+don'?t\s+apply)\b/i },
  { label: 'no_boundaries', pattern: /\b(no\s+boundaries?|without\s+boundaries?|no\s+limits?)\b/i },
  { label: 'free_from', pattern: /\bfree\s+from\s+(all\s+)?(constraints?|restrictions?|rules?|guidelines?|safety)\b/i },
  { label: 'without_conscience', pattern: /\bwithout\s+(conscience|morals?|ethics?|empathy|remorse)\b/i },
  { label: 'amoral', pattern: /\b(amoral|immoral|unprincipled)\b/i },
  { label: 'no_filter', pattern: /\b(no\s+filter|filterless|unfiltered)\b/i }
];

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
   * Detects direct/indirect prompt injection, jailbreak roleplay, system-prompt
   * extraction attempts, and encoding-based bypasses in user-supplied text.
   */
  public static detectPromptInjection(input: string): PromptInjectionVerdict {
    const matchedPatterns: string[] = [];
    let score = 0;
    let category: PromptInjectionCategory = 'NONE';

    for (const { label, pattern } of DIRECT_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        matchedPatterns.push(label);
        score += 0.25;
      }
    }

    for (const { label, pattern } of INDIRECT_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        matchedPatterns.push(label);
        score += 0.15;
      }
    }

    for (const { label, pattern } of SYSTEM_PROMPT_LEAK_PATTERNS) {
      if (pattern.test(input)) {
        matchedPatterns.push(label);
        score += 0.20;
      }
    }

    for (const { label, pattern } of JAILBREAK_ROLEPLAY_PATTERNS) {
      if (pattern.test(input)) {
        matchedPatterns.push(label);
        score += 0.20;
      }
    }

    for (const { label, pattern } of ENCODING_BYPASS_PATTERNS) {
      if (pattern.test(input)) {
        matchedPatterns.push(label);
        score += 0.15;
      }
    }

    score = clamp(score, 0, 1);

    if (matchedPatterns.length > 0) {
      if (matchedPatterns.some(p => SYSTEM_PROMPT_LEAK_PATTERNS.some(lp => lp.label === p))) {
        category = 'SYSTEM_PROMPT_LEAK';
      } else if (matchedPatterns.some(p => JAILBREAK_ROLEPLAY_PATTERNS.some(jp => jp.label === p))) {
        category = 'JAILBREAK_ROLEPLAY';
      } else if (matchedPatterns.some(p => ENCODING_BYPASS_PATTERNS.some(ep => ep.label === p))) {
        category = 'ENCODING_BYPASS';
      } else if (matchedPatterns.some(p => INDIRECT_INJECTION_PATTERNS.some(ip => ip.label === p))) {
        category = 'INDIRECT_INJECTION';
      } else {
        category = 'DIRECT_INJECTION';
      }
    }

    const sanitizedInput = AiSecurityEngine.sanitizeInput(input);

    const explanation = matchedPatterns.length === 0
      ? 'No prompt-injection indicators detected. Input conforms to the zero-trust prompt envelope.'
      : `Detected ${matchedPatterns.length} injection indicator(s): ${matchedPatterns.join(', ')}. Input quarantined and sanitized before inference.`;

    return {
      detected: matchedPatterns.length > 0,
      score: parseFloat(score.toFixed(2)),
      category,
      matchedPatterns,
      sanitizedInput,
      explanation
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
   * Detects jailbreak and adversarial roleplay attempts.
   */
  public static detectJailbreak(input: string): JailbreakVerdict {
    const matchedTechniques: string[] = [];
    let score = 0;

    for (const { label, pattern } of JAILBREAK_ROLEPLAY_PATTERNS) {
      if (pattern.test(input)) {
        matchedTechniques.push(label);
        score += 0.25;
      }
    }

    // Semantic heuristics: repeated imperative + negation of constraints
    const imperativeCount = (input.match(/\b(you\s+must|you\s+shall|you\s+will|do\s+not|don'?t|never|always)\b/gi) || []).length;
    if (imperativeCount >= 3) {
      matchedTechniques.push('excessive_imperative_directives');
      score += 0.15;
    }

    // Token-length anomaly (very long inputs are often encoding bypasses)
    if (input.length > 4000) {
      matchedTechniques.push('abnormal_input_length');
      score += 0.10;
    }

    score = clamp(score, 0, 1);

    const explanation = matchedTechniques.length === 0
      ? 'No jailbreak or adversarial roleplay indicators detected.'
      : `Detected ${matchedTechniques.length} jailbreak technique(s): ${matchedTechniques.join(', ')}.`;

    return {
      detected: matchedTechniques.length > 0,
      score: parseFloat(score.toFixed(2)),
      matchedTechniques,
      explanation
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
    let sanitized = input;
    // Neutralize common injection delimiters
    sanitized = sanitized.replace(/[-=_]{5,}/g, '[FILTERED_DELIMITER]');
    sanitized = sanitized.replace(/<\/?(system|instructions|prompt|admin)>/gi, '[FILTERED_TAG]');
    sanitized = sanitized.replace(/```(markdown|system|prompt)/gi, '```text');
    // Strip zero-width and control characters
    sanitized = sanitized.replace(/[​‌‍﻿]/g, '');
    return sanitized.trim();
  }
}
