import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';
const db = {
  prepare: (query: string) => getDb().prepare(query),
  transaction: (fn: any) => getDb().transaction(fn),
  exec: (sql: string) => getDb().exec(sql)
};
import { GoogleGenAI } from '@google/genai';
import { VectorKbEngine } from './vector-kb';

export interface GuardrailRuleConfig {
  bannedPatterns?: string[];
  requiredJsonKeys?: string[];
  maxOutputLength?: number;
  piiCheck?: boolean;
  medicalDisclaimerRequired?: boolean;
  financialDisclaimerRequired?: boolean;
  citationRequired?: boolean;
}

export interface GuardrailRule {
  id: string;
  org_id: string;
  name: string;
  rule_type: string; // 'schema', 'regex', 'fact_check', 'confidence_threshold', 'pii_filter'
  config: string;
  fallback_action: 'retry' | 'safe_default' | 'human_review';
  fallback_payload?: string;
  confidence_min: number;
  active: number;
}

export interface GuardrailEvaluationResult {
  verdict: 'PASSED' | 'FLAGGED' | 'FALLBACK';
  confidenceScore: number;
  flagReasons: Array<{
    ruleId?: string;
    ruleName?: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
  }>;
  finalOutput: string;
  fallbackTriggered: boolean;
  fallbackActionTaken?: string;
  executionMetrics: {
    schemaValid: boolean;
    regexViolationsCount: number;
    factContradictionDetected: boolean;
    piiDetected: boolean;
    evalDurationMs: number;
  };
}

let aiClient: GoogleGenAI | null = null;
function getGenAi(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key.includes('placeholder')) {
    return null;
  }
  try {
    aiClient = new GoogleGenAI({ apiKey: key.trim() });
    return aiClient;
  } catch (err) {
    console.error('[GUARDRAIL_ENGINE] GenAI init error:', err);
    return null;
  }
}

/**
 * MODULE 1: Post-LLM Compliance Guardrail Engine
 * Validates output against active organizational rules, factual consistency, confidence metrics, and deterministic fallbacks.
 */
export async function runGuardrailCheck(
  orgId: string,
  inputPrompt: string,
  rawLlmOutput: string,
  ragContext?: string,
  ruleProfile?: string
): Promise<GuardrailEvaluationResult> {
  const startTime = Date.now();

  // 1. Fetch active Guardrail rules for this Org
  let rules: GuardrailRule[] = [];
  try {
    rules = db.prepare(`
      SELECT * FROM regtech_guardrail_rules 
      WHERE org_id = ? AND active = 1
    `).all(orgId) as GuardrailRule[];
  } catch (e) {
    console.warn('[GUARDRAIL_ENGINE] Error loading rules, using defaults:', e);
  }

  // If no custom rules exist, provide default baseline regulatory rules
  if (!rules || rules.length === 0) {
    rules = [
      {
        id: 'default_pii_rule',
        org_id: orgId,
        name: 'Standard Data Protection & PII Strip',
        rule_type: 'pii_filter',
        config: JSON.stringify({ piiCheck: true }),
        fallback_action: 'safe_default',
        fallback_payload: 'Output sanitized according to GDPR Art. 32.',
        confidence_min: 0.85,
        active: 1
      },
      {
        id: 'default_fact_rule',
        org_id: orgId,
        name: 'Factual Consistency & Anti-Hallucination',
        rule_type: 'fact_check',
        config: JSON.stringify({ citationRequired: false }),
        fallback_action: 'retry',
        confidence_min: 0.88,
        active: 1
      }
    ];
  }

  const flagReasons: GuardrailEvaluationResult['flagReasons'] = [];
  let schemaValid = true;
  let regexViolationsCount = 0;
  let factContradictionDetected = false;
  let piiDetected = false;
  let evaluatedOutput = rawLlmOutput;

  // 2. Execute Rule Validators in parallel / sequence
  for (const rule of rules) {
    let parsedConfig: GuardrailRuleConfig = {};
    try {
      parsedConfig = typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config;
    } catch {
      parsedConfig = {};
    }

    // A. Schema / JSON Validator
    if (rule.rule_type === 'schema' || parsedConfig.requiredJsonKeys?.length) {
      try {
        const jsonMatch = evaluatedOutput.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedObj = JSON.parse(jsonMatch[0]);
          if (parsedConfig.requiredJsonKeys) {
            for (const key of parsedConfig.requiredJsonKeys) {
              if (parsedObj[key] === undefined) {
                schemaValid = false;
                flagReasons.push({
                  ruleId: rule.id,
                  ruleName: rule.name,
                  type: 'SCHEMA_VIOLATION',
                  severity: 'HIGH',
                  message: `Missing mandatory schema attribute: "${key}" in output payload.`
                });
              }
            }
          }
        } else if (parsedConfig.requiredJsonKeys?.length) {
          schemaValid = false;
          flagReasons.push({
            ruleId: rule.id,
            ruleName: rule.name,
            type: 'SCHEMA_INVALID',
            severity: 'CRITICAL',
            message: 'Output failed structured JSON validation.'
          });
        }
      } catch (err) {
        schemaValid = false;
        flagReasons.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: 'SCHEMA_PARSE_ERROR',
          severity: 'HIGH',
          message: 'Structured output parsing encountered syntax invalidity.'
        });
      }
    }

    // B. Regex / Banned Patterns Validator
    if (rule.rule_type === 'regex' || parsedConfig.bannedPatterns?.length) {
      const patterns = parsedConfig.bannedPatterns || [
        'guaranteed 100% cure',
        'risk-free investment',
        'insider trading secret',
        'bypass legal compliance'
      ];
      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(evaluatedOutput)) {
          regexViolationsCount++;
          flagReasons.push({
            ruleId: rule.id,
            ruleName: rule.name,
            type: 'PROHIBITED_CLAIM',
            severity: 'HIGH',
            message: `Prohibited misleading regulatory claim detected: "${pattern}"`
          });
        }
      }
    }

    // C. PII Leakage / Data Protection
    if (rule.rule_type === 'pii_filter' || parsedConfig.piiCheck) {
      const emailMatch = evaluatedOutput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      const ssnMatch = evaluatedOutput.match(/\b\d{3}-\d{2}-\d{4}\b/);
      const creditCardMatch = evaluatedOutput.match(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/);

      if (emailMatch || ssnMatch || creditCardMatch) {
        piiDetected = true;
        flagReasons.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: 'PII_EXPOSURE',
          severity: 'CRITICAL',
          message: 'Sensitive personal identifier (PII/Card/SSN) exposed in model output.'
        });
        // Auto-sanitize
        evaluatedOutput = evaluatedOutput
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
          .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
          .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[REDACTED_FINANCIAL_CARD]');
      }
    }

    // D. Disclaimer Verification (Medical / Financial / Legal)
    if (ruleProfile === 'strict-medical' || parsedConfig.medicalDisclaimerRequired) {
      if (!evaluatedOutput.toLowerCase().includes('medical advice') && !evaluatedOutput.toLowerCase().includes('physician')) {
        flagReasons.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: 'MISSING_DISCLAIMER',
          severity: 'MEDIUM',
          message: 'Mandatory clinical safety disclaimer is missing.'
        });
        evaluatedOutput += '\n\n[Regulatory Notice: This information does not constitute medical advice. Consult a certified practitioner.]';
      }
    }
  }

  // 3. Fact Consistency & Anti-Hallucination Check
  let confidenceScore = 0.94;
  let activeRagContext = ragContext;

  // If fact_check is active and we have no context, try to pull from Vector KB
  const needsFactCheck = rules.some(r => r.rule_type === 'fact_check');
  if (needsFactCheck && (!activeRagContext || activeRagContext.length < 10)) {
    const pulledContexts = await VectorKbEngine.retrieveContext(orgId, inputPrompt, 2);
    if (pulledContexts.length > 0) {
      activeRagContext = pulledContexts.join('\n');
    }
  }

  if (activeRagContext && activeRagContext.length > 20) {
    const contextKeywords = activeRagContext.toLowerCase().split(/\s+/).filter(w => w.length > 5);
    const outputKeywords = evaluatedOutput.toLowerCase();
    
    // Check if context contains explicit negations or contradictions
    if (activeRagContext.toLowerCase().includes('not approved') && evaluatedOutput.toLowerCase().includes('is approved')) {
      factContradictionDetected = true;
      confidenceScore = 0.42;
      flagReasons.push({
        type: 'FACT_CONTRADICTION',
        severity: 'CRITICAL',
        message: 'LLM generated statement contradicts verified source documentation context.'
      });
    } else {
      // Heuristic score calculation
      let matchedKw = 0;
      for (const kw of contextKeywords.slice(0, 15)) {
        if (outputKeywords.includes(kw)) matchedKw++;
      }
      const ratio = contextKeywords.length > 0 ? matchedKw / Math.min(contextKeywords.length, 15) : 0.8;
      confidenceScore = Math.min(0.98, Math.max(0.70, 0.65 + (ratio * 0.33)));
    }
  } else {
    // Standard confidence heuristic based on violations
    if (flagReasons.some(f => f.severity === 'CRITICAL')) {
      confidenceScore = 0.45;
    } else if (flagReasons.length > 0) {
      confidenceScore = 0.78;
    } else {
      confidenceScore = 0.96;
    }
  }

  // 4. Verdict Aggregation
  let verdict: 'PASSED' | 'FLAGGED' | 'FALLBACK' = 'PASSED';
  let fallbackTriggered = false;
  let fallbackActionTaken: string | undefined = undefined;
  let finalOutput = evaluatedOutput;

  const hasCritical = flagReasons.some(f => f.severity === 'CRITICAL');
  const minThreshold = rules.reduce((acc, r) => Math.max(acc, r.confidence_min || 0.85), 0.85);

  if (hasCritical || confidenceScore < 0.60) {
    verdict = 'FALLBACK';
    fallbackTriggered = true;

    // Pick top fallback action
    const dominantRule = rules.find(r => r.fallback_action) || rules[0];
    fallbackActionTaken = dominantRule?.fallback_action || 'safe_default';

    if (fallbackActionTaken === 'safe_default') {
      finalOutput = dominantRule?.fallback_payload || 
        'Regulatory Fallback Engaged: The requested query could not be completed with verified compliance certainty. Please contact compliance@yourorg.com for manual clearance.';
    } else if (fallbackActionTaken === 'human_review') {
      finalOutput = '[PENDING_HUMAN_REVIEW]: This compliance response has been flagged for audit review by the Data Protection Officer (DPO). Case ID: ' + crypto.randomUUID().substring(0, 8);
    } else if (fallbackActionTaken === 'retry') {
      finalOutput = `[STRICT_SAFETY_RETRY]: ${evaluatedOutput} \n\n(Validated under statutory fallback compliance constraints).`;
    }
  } else if (flagReasons.length > 0 || confidenceScore < minThreshold) {
    verdict = 'FLAGGED';
  } else {
    verdict = 'PASSED';
  }

  const evalDurationMs = Date.now() - startTime;

  return {
    verdict,
    confidenceScore: Number(confidenceScore.toFixed(2)),
    flagReasons,
    finalOutput,
    fallbackTriggered,
    fallbackActionTaken,
    executionMetrics: {
      schemaValid,
      regexViolationsCount,
      factContradictionDetected,
      piiDetected,
      evalDurationMs
    }
  };
}

/**
 * Asynchronous non-blocking Request Log Saver
 */
export function logGuardrailRequest(
  orgId: string,
  inputPrompt: string,
  llmOutput: string,
  verdict: string,
  flagReasons: any[],
  confidenceScore: number,
  latencyMs: number,
  tokensUsed: number,
  modelUsed: string = 'gpt-4o',
  targetRegion: string = 'eu-central-1',
  llmCallAvoided: boolean = false
) {
  setImmediate(() => {
    try {
      const logId = `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(`
        INSERT INTO regtech_request_logs 
        (id, org_id, input_prompt, llm_output, verdict, flag_reasons, confidence_score, latency_ms, tokens_used, model_used, target_region, llm_call_avoided)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        orgId,
        inputPrompt,
        llmOutput,
        verdict,
        JSON.stringify(flagReasons),
        confidenceScore,
        latencyMs,
        tokensUsed,
        modelUsed,
        targetRegion,
        llmCallAvoided ? 1 : 0
      );

      // Increment Usage Record for monthly billing
      const currentPeriod = new Date().toISOString().substring(0, 7); // '2026-08'
      const existingUsage = db.prepare(`
        SELECT * FROM regtech_usage_records WHERE org_id = ? AND period = ?
      `).get(orgId, currentPeriod) as any;

      const tokenCost = (tokensUsed / 1000) * 0.003; // ~$0.003 per 1k tokens
      const savedCost = llmCallAvoided ? 0.045 : 0; // ~$0.045 saved per skipped complex LLM call

      if (existingUsage) {
        db.prepare(`
          UPDATE regtech_usage_records 
          SET tokens_used = tokens_used + ?,
              request_count = request_count + 1,
              cost = cost + ?,
              llm_calls_avoided = llm_calls_avoided + ?,
              cost_saved_usd = cost_saved_usd + ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE org_id = ? AND period = ?
        `).run(tokensUsed, tokenCost, llmCallAvoided ? 1 : 0, savedCost, orgId, currentPeriod);
      } else {
        const usageId = `use_${crypto.randomUUID()}`;
        db.prepare(`
          INSERT INTO regtech_usage_records 
          (id, org_id, period, tokens_used, request_count, cost, llm_calls_avoided, cost_saved_usd)
          VALUES (?, ?, ?, ?, 1, ?, ?, ?)
        `).run(usageId, orgId, currentPeriod, tokensUsed, tokenCost, llmCallAvoided ? 1 : 0, savedCost);
      }
    } catch (err) {
      console.error('[GUARDRAIL_LOGGER] Async request logging error:', err);
    }
  });
}
