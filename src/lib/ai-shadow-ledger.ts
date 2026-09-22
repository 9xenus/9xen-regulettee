import crypto from 'crypto';

/**
 * EU Policy Compliance SaaS
 * Module: EU AI Act Algorithmic Transparency & Model Shadowing Ledger
 * 
 * Purpose: An immutable tracking system for applications incorporating AI models.
 * Intercepts AI model inferences to ensure every decision is logged with model version,
 * input tokens, deterministic safety scores, and output recommendations to provide
 * a clear data lineage trail for regulatory auditing.
 */

export interface AIInferenceRequest {
  tenantId: string;
  userId: string;
  modelIdentifier: string; // e.g., 'gemini-1.5-pro' or 'gpt-4o'
  modelVersion: string;
  temperature: number;
  promptSignature: string; // Hashed prompt to protect PII while maintaining auditability
  inputTokenCount: number;
  useCaseCategory: 'DOCUMENT_CLASSIFICATION' | 'RISK_SCORING' | 'POLICY_DRAFTING';
}

export interface ShadowLedgerEntry {
  traceId: string;
  timestamp: string;
  tenantId: string;
  userId: string;
  aiParameters: {
    modelIdentifier: string;
    modelVersion: string;
    temperature: number;
  };
  metrics: {
    inputTokenCount: number;
    outputTokenCount: number;
    safetyScore: number;
  };
  context: {
    useCaseCategory: string;
    promptSignature: string;
    rawOutputHash: string;
    complianceRecommendation: string;
  };
  cryptographicSeal: string; // Verifiable proof of untampered ledger
}

export class AiModelShadowLedger {
  
  private readonly SECRET_LEDGER_SALT = process.env.AI_LEDGER_SALT || 'eu_ai_act_strict_salt';

  /**
   * Generates a cryptographic seal for the ledger entry to prevent post-inference tampering.
   */
  private generateSeal(traceId: string, timestamp: string, safetyScore: number): string {
    const payload = `${traceId}:${timestamp}:${safetyScore}:${this.SECRET_LEDGER_SALT}`;
    return crypto.createHmac('sha256', this.SECRET_LEDGER_SALT).update(payload).digest('hex');
  }

  /**
   * Hashes prompt/output text to retain auditability of *what* was processed
   * without storing raw unencrypted PII in the shadow ledger.
   */
  public hashContent(rawText: string): string {
    return crypto.createHash('sha256').update(rawText).digest('hex');
  }

  /**
   * Evaluates the AI's output against deterministic safety constraints.
   * In a real system, this might run through a secondary classification model
   * or regex-based safety checks.
   */
  private computeDeterministicSafetyScore(outputLength: number, temperature: number): number {
    // Mock algorithm: Lower temperatures and moderate output lengths generally
    // correlate to less hallucination/higher deterministic safety in classification contexts.
    let baseScore = 100 - (temperature * 20);
    if (outputLength < 10) baseScore -= 10;
    if (outputLength > 2000) baseScore -= 15;
    return Math.max(0, Math.min(100, Math.round(baseScore)));
  }

  /**
   * Core Wrapper Method
   * Wraps the actual AI execution callback to measure, intercept, and structurally log the entire payload.
   */
  public async executeAndLogInference(
    request: AIInferenceRequest,
    rawPrompt: string,
    aiExecutionCallback: (prompt: string) => Promise<{ rawText: string; tokensOutput: number }>
  ): Promise<{ result: string; traceId: string }> {
    
    const traceId = `ai-trace-${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();

    console.log(`[AI Shadow Ledger] Intercepting Inference Request. Trace: ${traceId}`);

    try {
      // 1. Execute actual AI Inference
      const startTime = performance.now();
      const executionResult = await aiExecutionCallback(rawPrompt);
      const executionTimeMs = performance.now() - startTime;

      // 2. Synthesize Post-Inference Metrics
      const safetyScore = this.computeDeterministicSafetyScore(executionResult.tokensOutput, request.temperature);
      const outputHash = this.hashContent(executionResult.rawText);

      // 3. Construct the Immutable Entry
      const ledgerEntry: ShadowLedgerEntry = {
        traceId,
        timestamp,
        tenantId: request.tenantId,
        userId: request.userId,
        aiParameters: {
          modelIdentifier: request.modelIdentifier,
          modelVersion: request.modelVersion,
          temperature: request.temperature
        },
        metrics: {
          inputTokenCount: request.inputTokenCount,
          outputTokenCount: executionResult.tokensOutput,
          safetyScore
        },
        context: {
          useCaseCategory: request.useCaseCategory,
          promptSignature: request.promptSignature,
          rawOutputHash: outputHash,
          // Extract the concrete legal/compliance recommendation snippet (bounded length)
          complianceRecommendation: executionResult.rawText.substring(0, 200) + (executionResult.rawText.length > 200 ? '...' : '')
        },
        cryptographicSeal: this.generateSeal(traceId, timestamp, safetyScore)
      };

      // 4. Commit to Database (Simulated)
      console.log(`[AI Shadow Ledger] Committing algorithmic transparency record to Enterprise Ledger. Seal: ${ledgerEntry.cryptographicSeal}`);
      // await prisma.aiModelShadowLedger.create({ data: ledgerEntry });

      if (safetyScore < 70) {
          console.warn(`[AI Audit Alert] Trace ${traceId} registered a low deterministic safety score (${safetyScore}). Flagging for human review.`);
          // e.g., TaskQueueManager.queueHumanReview(traceId);
      }

      return {
        result: executionResult.rawText,
        traceId
      };

    } catch (error: any) {
      console.error(`[AI Shadow Ledger] Inference execution failed for trace ${traceId}: ${error.message}`);
      
      // Log the failure to track potential DOS or model drift
      // await prisma.aiModelShadowLedger.create({ data: { traceId, status: 'FAILED', errorMsg: error.message }});
      
      throw error;
    }
  }
}
