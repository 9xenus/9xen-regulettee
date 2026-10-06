/**
 * AI RUNTIME PROTECTION GATEWAY
 * Unified runtime enforcement point for all LLM inference requests.
 *
 * Implements the 8-step request flow:
 *   1. User request received
 *   2. Assign model and role
 *   3. Enforce token budget
 *   4. Classify input data
 *   5. Enforce system prompt
 *   6. Tool call (if applicable)
 *   7. PII redaction, block, redact, or flag
 *   8. Write immutable audit event
 *
 * Runtime Architecture:
 *   Client → API Gateway → Agent Runtime → LLM/RAG/Tool → Output
 *                ↓ PII redaction    ↓ Grounding Check  ↓ Output Validation
 */
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'node:crypto';
import { LexDB } from './LexDB';
import { AiSecurityEngine } from './ai-security-engine';
import { AiRuntimePolicyEngine } from './ai-runtime-policy';

// ── Types ────────────────────────────────────────────────────────────────────

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
export type RuntimeAction = 'ALLOW' | 'REDACT' | 'BLOCK' | 'FLAG';
export type ModelRole = 'ASSISTANT' | 'CLASSIFIER' | 'EXTRACTOR' | 'GENERATOR' | 'REASONER';

export interface RuntimePolicy {
  maxTokensPerRequest: number;
  maxTokensPerMinute: number;
  allowedClassifications: DataClassification[];
  requireGrounding: boolean;
  requireOutputValidation: boolean;
  piiAction: RuntimeAction;
  promptInjectionAction: RuntimeAction;
  jailbreakAction: RuntimeAction;
  secretDetectionAction: RuntimeAction;
  auditAllRequests: boolean;
  systemPromptEnforcement: boolean;
  tokenBudgetEnforcement: boolean;
}

export interface GatewayRequest {
  tenantId: string;
  userId: string;
  agentId?: string;
  sessionId: string;
  messages: { role: string; content: string }[];
  dataClassification?: DataClassification;
  modelRole?: ModelRole;
  requestedModel?: string;
  toolCalls?: { name: string; arguments: Record<string, unknown> }[];
  systemPrompt?: string;
  metadata?: Record<string, unknown>;
}

export interface PolicyDecision {
  rule: string;
  action: RuntimeAction;
  reason: string;
  details?: string;
}

export interface GatewayResponse {
  requestId: string;
  status: 'ALLOWED' | 'REDACTED' | 'BLOCKED' | 'FLAGGED';
  output: string;
  model: string;
  role: ModelRole;
  policyDecisions: PolicyDecision[];
  auditEventId: string;
  latencyMs: number;
  tokensUsed: number;
  tokensRemaining: number;
  piiRedacted: number;
  secretsDetected: number;
  promptInjectionDetected: boolean;
  jailbreakDetected: boolean;
  groundingScore: number | null;
  outputValid: boolean;
  timestamp: string;
}

// ── Default policy ───────────────────────────────────────────────────────────

export const DEFAULT_RUNTIME_POLICY: RuntimePolicy = {
  maxTokensPerRequest: 8192,
  maxTokensPerMinute: 65536,
  allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
  requireGrounding: true,
  requireOutputValidation: true,
  piiAction: 'REDACT',
  promptInjectionAction: 'BLOCK',
  jailbreakAction: 'BLOCK',
  secretDetectionAction: 'BLOCK',
  auditAllRequests: true,
  systemPromptEnforcement: true,
  tokenBudgetEnforcement: true
};

// ── Token budget tracker (in-memory, per-tenant) ─────────────────────────────

const tokenBudgetStore = new Map<string, { tokens: number; resetAt: number }>();

function checkTokenBudget(tenantId: string, requestedTokens: number, policy: RuntimePolicy): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  let entry = tokenBudgetStore.get(tenantId);

  if (!entry || now >= entry.resetAt) {
    entry = { tokens: 0, resetAt: now + windowMs };
    tokenBudgetStore.set(tenantId, entry);
  }

  const remaining = Math.max(0, policy.maxTokensPerMinute - entry.tokens);
  const allowed = requestedTokens <= remaining;

  if (allowed) {
    entry.tokens += requestedTokens;
  }

  return { allowed, remaining };
}

// ── Input classification ─────────────────────────────────────────────────────

const CLASSIFICATION_KEYWORDS: Record<DataClassification, string[]> = {
  PUBLIC: ['public', 'open', 'general', 'marketing', 'blog'],
  INTERNAL: ['internal', 'employee', 'team', 'company'],
  CONFIDENTIAL: ['confidential', 'private', 'sensitive', 'proprietary', 'customer'],
  RESTRICTED: ['restricted', 'classified', 'secret', 'pii', 'phi', 'financial', 'legal', 'medical']
};

function classifyInput(text: string): DataClassification {
  const lower = text.toLowerCase();
  let best: DataClassification = 'PUBLIC';
  let bestScore = 0;

  for (const [level, keywords] of Object.entries(CLASSIFICATION_KEYWORDS) as [DataClassification, string[]][]) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = level;
    }
  }

  return best;
}

// ── Grounding check ──────────────────────────────────────────────────────────

function checkGrounding(output: string, context: string): number {
  const outputWords = output.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (outputWords.length === 0) return 1;

  const contextLower = context.toLowerCase();
  let matched = 0;
  for (const word of outputWords) {
    if (contextLower.includes(word)) matched++;
  }

  return parseFloat((matched / outputWords.length).toFixed(2));
}

// ── Output validation ────────────────────────────────────────────────────────

function validateOutput(output: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!output || output.trim().length === 0) {
    issues.push('Empty output');
  }
  if (output.length > 100_000) {
    issues.push('Output exceeds maximum length');
  }
  if (/<script|javascript:|on\w+\s*=/i.test(output)) {
    issues.push('Potential XSS in output');
  }
  if (/-----BEGIN.*PRIVATE KEY-----/.test(output)) {
    issues.push('Private key material in output');
  }

  return { valid: issues.length === 0, issues };
}

// ── Gateway engine ───────────────────────────────────────────────────────────

export class AiRuntimeGatewayEngine {
  private static policy: RuntimePolicy = { ...DEFAULT_RUNTIME_POLICY };

  public static getPolicy(): RuntimePolicy {
    return { ...AiRuntimeGatewayEngine.policy };
  }

  public static updatePolicy(partial: Partial<RuntimePolicy>): RuntimePolicy {
    AiRuntimeGatewayEngine.policy = { ...AiRuntimeGatewayEngine.policy, ...partial };
    return AiRuntimeGatewayEngine.getPolicy();
  }

  public static resetPolicy(): RuntimePolicy {
    AiRuntimeGatewayEngine.policy = { ...DEFAULT_RUNTIME_POLICY };
    return AiRuntimeGatewayEngine.getPolicy();
  }

  /**
   * Processes a request through the full 8-step runtime protection flow.
   */
  public static async processRequest(req: GatewayRequest): Promise<GatewayResponse> {
    const startTime = Date.now();
    const requestId = `REQ-${uuidv4().substring(0, 8).toUpperCase()}`;
    const policy = AiRuntimeGatewayEngine.policy;
    const decisions: PolicyDecision[] = [];

    // Step 1: User request received — validate
    if (!req.messages || req.messages.length === 0) {
      return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, 'No messages in request');
    }

    const userMessage = req.messages[req.messages.length - 1].content || '';
    const allText = req.messages.map(m => m.content).join('\n');

    // Step 2: Assign model and role
    const role: ModelRole = req.modelRole || 'ASSISTANT';
    const model = req.requestedModel || 'default-llm';

    // Step 3: Enforce token budget
    const estimatedTokens = Math.ceil(allText.length / 4);
    let tokensRemaining = policy.maxTokensPerMinute;
    if (policy.tokenBudgetEnforcement) {
      const budget = checkTokenBudget(req.tenantId, estimatedTokens, policy);
      tokensRemaining = budget.remaining;
      if (!budget.allowed) {
        decisions.push({ rule: 'TOKEN_BUDGET', action: 'BLOCK', reason: 'Token budget exceeded', details: `Requested ${estimatedTokens}, remaining ${budget.remaining}` });
        return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, 'Token budget exceeded');
      }
      decisions.push({ rule: 'TOKEN_BUDGET', action: 'ALLOW', reason: `Token budget OK (${budget.remaining} remaining)` });
    }

    // Step 4: Classify input data
    const classification: DataClassification = req.dataClassification || classifyInput(allText);
    if (!policy.allowedClassifications.includes(classification)) {
      decisions.push({ rule: 'DATA_CLASSIFICATION', action: 'BLOCK', reason: `Classification ${classification} not allowed` });
      return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, `Data classification ${classification} not permitted`);
    }
    decisions.push({ rule: 'DATA_CLASSIFICATION', action: 'ALLOW', reason: `Classification: ${classification}` });

    // Step 5: Enforce system prompt
    if (policy.systemPromptEnforcement && req.systemPrompt) {
      const hasBoundary = req.systemPrompt.includes('###') || req.systemPrompt.includes('GUARDRAIL') || req.systemPrompt.includes('USER_INPUT_START');
      if (!hasBoundary) {
        decisions.push({ rule: 'SYSTEM_PROMPT', action: 'FLAG', reason: 'System prompt lacks boundary delimiters' });
      } else {
        decisions.push({ rule: 'SYSTEM_PROMPT', action: 'ALLOW', reason: 'System prompt boundary verified' });
      }
    }

    // Status tracker (used across steps 6-7)
    let status: GatewayResponse['status'] = 'ALLOWED';

    // Step 6: Tool call validation + policy engine + kill switch
    if (req.toolCalls && req.toolCalls.length > 0) {
      for (const tool of req.toolCalls) {
        if (!tool.name || tool.name.trim().length === 0) {
          decisions.push({ rule: 'TOOL_CALL', action: 'BLOCK', reason: 'Empty tool name' });
          continue;
        }

        // Kill switch check
        const killSwitch = AiRuntimePolicyEngine.isKillSwitchActive({
          tenantId: req.tenantId,
          userId: req.userId,
          agentId: req.agentId,
          modelId: model,
          toolName: tool.name,
          conversationId: req.sessionId
        });
        if (killSwitch) {
          decisions.push({ rule: 'KILL_SWITCH', action: 'BLOCK', reason: `Kill switch active: ${killSwitch.scope} scope — ${killSwitch.reason}` });
          return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, `Kill switch active at ${killSwitch.scope} scope`);
        }

        // Policy engine evaluation
        const policyResult = AiRuntimePolicyEngine.evaluatePolicy({
          tenantId: req.tenantId,
          userId: req.userId,
          agentId: req.agentId,
          modelId: model,
          toolName: tool.name,
          permission: AiRuntimePolicyEngine.classifyTool(tool.name)?.permission || 'PRODUCTION',
          resourceScope: 'tenant',
          args: tool.arguments || {},
          riskScore: 50
        });

        if (policyResult.decision === 'DENY') {
          decisions.push({ rule: 'POLICY_ENGINE', action: 'BLOCK', reason: policyResult.reason, details: policyResult.checks.map(c => `${c.name}: ${c.passed ? 'PASS' : 'FAIL'}`).join('; ') });
        } else if (policyResult.decision === 'APPROVAL_REQUIRED') {
          decisions.push({ rule: 'POLICY_ENGINE', action: 'FLAG', reason: policyResult.reason, details: `Approval workflow: ${policyResult.approvalWorkflowId}` });
          if (status === 'ALLOWED') status = 'FLAGGED';
        } else {
          decisions.push({ rule: 'POLICY_ENGINE', action: 'ALLOW', reason: policyResult.reason });
        }
      }
      decisions.push({ rule: 'TOOL_CALL', action: 'ALLOW', reason: `${req.toolCalls.length} tool call(s) validated` });
    }

    // Step 7: Security checks — prompt injection, jailbreak, secrets, PII
    let promptInjectionDetected = false;
    let jailbreakDetected = false;
    let secretsDetected = 0;
    let piiRedacted = 0;
    let output = '';

    // 7a. Prompt injection detection
    const injectionVerdict = AiSecurityEngine.detectPromptInjection(userMessage);
    promptInjectionDetected = injectionVerdict.detected;
    if (injectionVerdict.detected) {
      if (policy.promptInjectionAction === 'BLOCK') {
        decisions.push({ rule: 'PROMPT_INJECTION', action: 'BLOCK', reason: injectionVerdict.explanation, details: `Category: ${injectionVerdict.category}` });
        return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, 'Prompt injection detected');
      } else if (policy.promptInjectionAction === 'FLAG') {
        status = 'FLAGGED';
        decisions.push({ rule: 'PROMPT_INJECTION', action: 'FLAG', reason: injectionVerdict.explanation });
      } else {
        decisions.push({ rule: 'PROMPT_INJECTION', action: 'ALLOW', reason: 'Prompt injection detected but allowed by policy' });
      }
    } else {
      decisions.push({ rule: 'PROMPT_INJECTION', action: 'ALLOW', reason: 'No prompt injection detected' });
    }

    // 7b. Jailbreak detection
    const jailbreakVerdict = AiSecurityEngine.detectJailbreak(userMessage);
    jailbreakDetected = jailbreakVerdict.detected;
    if (jailbreakVerdict.detected) {
      if (policy.jailbreakAction === 'BLOCK') {
        decisions.push({ rule: 'JAILBREAK', action: 'BLOCK', reason: jailbreakVerdict.explanation });
        return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, 'Jailbreak detected');
      } else if (policy.jailbreakAction === 'FLAG') {
        status = 'FLAGGED';
        decisions.push({ rule: 'JAILBREAK', action: 'FLAG', reason: jailbreakVerdict.explanation });
      }
    } else {
      decisions.push({ rule: 'JAILBREAK', action: 'ALLOW', reason: 'No jailbreak detected' });
    }

    // 7c. Secret detection
    const secretPatterns = [
      /sk-[a-zA-Z0-9]{20,}/g,
      /ghp_[a-zA-Z0-9]{20,}/g,
      /AKIA[0-9A-Z]{16}/g,
      /-----BEGIN.*PRIVATE KEY-----/g,
      /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g
    ];
    for (const pattern of secretPatterns) {
      const matches = allText.match(pattern);
      if (matches) secretsDetected += matches.length;
    }
    if (secretsDetected > 0) {
      if (policy.secretDetectionAction === 'BLOCK') {
        decisions.push({ rule: 'SECRET_DETECTION', action: 'BLOCK', reason: `${secretsDetected} secret(s) detected in input` });
        return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, 'Secrets detected in input');
      } else {
        status = 'FLAGGED';
        decisions.push({ rule: 'SECRET_DETECTION', action: 'FLAG', reason: `${secretsDetected} secret(s) detected` });
      }
    } else {
      decisions.push({ rule: 'SECRET_DETECTION', action: 'ALLOW', reason: 'No secrets detected' });
    }

    // 7d. PII scrubbing
    const piiResult = AiSecurityEngine.scrubPii(allText);
    piiRedacted = piiResult.redactedCount;
    if (piiResult.redactedCount > 0) {
      if (policy.piiAction === 'BLOCK') {
        decisions.push({ rule: 'PII_REDACTION', action: 'BLOCK', reason: `${piiResult.redactedCount} PII entity(ies) detected` });
        return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, 'PII detected and blocked');
      } else if (policy.piiAction === 'REDACT') {
        if (status === 'ALLOWED') status = 'REDACTED';
        decisions.push({ rule: 'PII_REDACTION', action: 'REDACT', reason: `${piiResult.redactedCount} PII entity(ies) redacted`, details: piiResult.redactedTypes.join(', ') });
      } else if (policy.piiAction === 'FLAG') {
        status = 'FLAGGED';
        decisions.push({ rule: 'PII_REDACTION', action: 'FLAG', reason: `${piiResult.redactedCount} PII entity(ies) detected` });
      }
    } else {
      decisions.push({ rule: 'PII_REDACTION', action: 'ALLOW', reason: 'No PII detected' });
    }

    // Generate output (simulated — in production this calls the actual LLM)
    output = piiResult.sanitized || allText;

    // Grounding check
    let groundingScore: number | null = null;
    if (policy.requireGrounding) {
      groundingScore = checkGrounding(output, allText);
      if (groundingScore < 0.5) {
        decisions.push({ rule: 'GROUNDING', action: 'FLAG', reason: `Low grounding score: ${groundingScore}` });
        if (status === 'ALLOWED') status = 'FLAGGED';
      } else {
        decisions.push({ rule: 'GROUNDING', action: 'ALLOW', reason: `Grounding score: ${groundingScore}` });
      }
    }

    // Output validation
    let outputValid = true;
    if (policy.requireOutputValidation) {
      const validation = validateOutput(output);
      outputValid = validation.valid;
      if (!validation.valid) {
        decisions.push({ rule: 'OUTPUT_VALIDATION', action: 'BLOCK', reason: validation.issues.join('; ') });
        return AiRuntimeGatewayEngine.blockRequest(requestId, req, startTime, decisions, 'Output validation failed');
      }
      decisions.push({ rule: 'OUTPUT_VALIDATION', action: 'ALLOW', reason: 'Output validation passed' });
    }

    // Step 8: Write immutable audit event
    const latencyMs = Date.now() - startTime;
    const auditEventId = `EVT-${uuidv4().substring(0, 8).toUpperCase()}`;

    if (policy.auditAllRequests) {
      try {
        await LexDB.recordAuditEvent({
          tenant_id: req.tenantId,
          actor_id: 'AI_RUNTIME_GATEWAY',
          module: 'RUNTIME_PROTECTION',
          action: `RUNTIME_REQUEST_${status}`,
          status: (status as GatewayResponse['status']) === 'BLOCKED' ? 'FAILURE' : 'SUCCESS',
          severity: (status as GatewayResponse['status']) === 'BLOCKED' ? 'CRITICAL' : (status === 'FLAGGED' ? 'WARNING' : 'INFO'),
          target: model,
          payload: {
            requestId,
            sessionId: req.sessionId,
            userId: req.userId,
            role,
            model,
            classification,
            status,
            policyDecisions: decisions.map(d => ({ rule: d.rule, action: d.action, reason: d.reason })),
            piiRedacted,
            secretsDetected,
            promptInjectionDetected,
            jailbreakDetected,
            groundingScore,
            outputValid,
            tokensUsed: estimatedTokens,
            tokensRemaining,
            latencyMs
          }
        });
      } catch (e) {
        console.warn('[AI_RUNTIME_GATEWAY] Audit log warning:', e);
      }
    }

    return {
      requestId,
      status,
      output,
      model,
      role,
      policyDecisions: decisions,
      auditEventId,
      latencyMs,
      tokensUsed: estimatedTokens,
      tokensRemaining,
      piiRedacted,
      secretsDetected,
      promptInjectionDetected,
      jailbreakDetected,
      groundingScore,
      outputValid,
      timestamp: new Date().toISOString()
    };
  }

  private static blockRequest(
    requestId: string,
    req: GatewayRequest,
    startTime: number,
    decisions: PolicyDecision[],
    reason: string
  ): GatewayResponse {
    const latencyMs = Date.now() - startTime;
    const auditEventId = `EVT-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Fire-and-forget audit for blocked requests
    LexDB.recordAuditEvent({
      tenant_id: req.tenantId,
      actor_id: 'AI_RUNTIME_GATEWAY',
      module: 'RUNTIME_PROTECTION',
      action: 'RUNTIME_REQUEST_BLOCKED',
      status: 'FAILURE',
      severity: 'CRITICAL',
      target: req.requestedModel || 'unknown',
      payload: {
        requestId,
        sessionId: req.sessionId,
        userId: req.userId,
        reason,
        policyDecisions: decisions.map(d => ({ rule: d.rule, action: d.action, reason: d.reason })),
        latencyMs
      }
    }).catch(() => { /* non-blocking */ });

    return {
      requestId,
      status: 'BLOCKED',
      output: '',
      model: req.requestedModel || 'unknown',
      role: req.modelRole || 'ASSISTANT',
      policyDecisions: decisions,
      auditEventId,
      latencyMs,
      tokensUsed: 0,
      tokensRemaining: 0,
      piiRedacted: 0,
      secretsDetected: 0,
      promptInjectionDetected: false,
      jailbreakDetected: false,
      groundingScore: null,
      outputValid: false,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Returns the current runtime policy configuration.
   */
  public static getPolicyConfig(): RuntimePolicy {
    return AiRuntimeGatewayEngine.getPolicy();
  }

  /**
   * Updates the runtime policy configuration.
   */
  public static updatePolicyConfig(partial: Partial<RuntimePolicy>): RuntimePolicy {
    return AiRuntimeGatewayEngine.updatePolicy(partial);
  }

  /**
   * Resets the runtime policy to defaults.
   */
  public static resetPolicyConfig(): RuntimePolicy {
    return AiRuntimeGatewayEngine.resetPolicy();
  }
}
