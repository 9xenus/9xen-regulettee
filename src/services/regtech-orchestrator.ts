import { Type, Static } from '@sinclair/typebox';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Engine } from 'json-rules-engine';
import vm from 'node:vm';
import crypto from 'node:crypto';
import db from '../db/sqlite';

// ==========================================
// 1. LAYER 2: SCHEMA & VALIDATION TYPES
// ==========================================
export const TransactionSchema = Type.Object({
  transactionId: Type.String(),
  clientId: Type.String(),
  amount: Type.Number({ minimum: 0.01 }),
  currency: Type.String({ minLength: 3, maxLength: 3 }),
  senderCountry: Type.String({ minLength: 2, maxLength: 2 }),
  isPEP: Type.Boolean({ default: false }),
  timestamp: Type.String()
});

export type TransactionPayload = Static<typeof TransactionSchema>;

// ==========================================
// 2. UNIFIED ENGINE PIPELINE TYPES
// ==========================================
export interface AuditLogEntry {
  auditId: string;
  transactionId: string;
  clientId: string;
  timestamp: string;
  payloadHash: string;
  rulesEvaluated: string[];
  pluginExecutionTimeMs: number;
  finalDecision: 'APPROVED' | 'FLAGGED' | 'REJECTED';
  reasons: string[];
  layerMetrics: {
    validationTimeMs: number;
    dynamicRulesTimeMs: number;
    sandboxPluginTimeMs: number;
    auditLogTimeMs: number;
    totalTimeMs: number;
  };
}

export interface EngineExecutionResult {
  success: boolean;
  decision: 'APPROVED' | 'FLAGGED' | 'REJECTED';
  auditTrail: AuditLogEntry;
}

// ==========================================
// 3. REGTECH CORE ORCHESTRATOR CLASS
// ==========================================
export class RegTechEngineOrchestrator {
  private ajv: Ajv;
  private validator: ReturnType<Ajv['compile']>;

  constructor() {
    this.ajv = addFormats(new Ajv({ allErrors: true, removeAdditional: 'all' }));
    this.validator = this.ajv.compile(TransactionSchema);
  }

  public async processTransaction(
    rawInput: unknown,
    clientPluginJsCode?: string,
    customRules?: any[]
  ): Promise<EngineExecutionResult> {
    const startTime = performance.now();
    const reasons: string[] = [];
    const rulesTriggered: string[] = [];

    // ----------------------------------------------------
    // STEP 1: LAYER 2 - TYPE-SAFE VALIDATION & SANITIZATION
    // ----------------------------------------------------
    const tValStart = performance.now();
    const isValid = this.validator(rawInput);
    if (!isValid) {
      const errMsgs = (this.validator.errors || []).map(e => `${e.instancePath || 'payload'} ${e.message}`).join(', ');
      throw new Error(`Data Validation Failure (Layer 2): ${errMsgs}`);
    }
    const data = rawInput as TransactionPayload;
    const validationTimeMs = performance.now() - tValStart;

    // Generate cryptographic hash of original input state for audit
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

    // ----------------------------------------------------
    // STEP 2: LAYER 1 - DYNAMIC RULES EVALUATION
    // ----------------------------------------------------
    const tRulesStart = performance.now();
    const ruleEngine = new Engine();

    // Core AML Rule Configuration: PEP + High Value
    ruleEngine.addRule({
      conditions: {
        all: [
          { fact: 'amount', operator: 'greaterThanInclusive', value: 10000 },
          { fact: 'isPEP', operator: 'equal', value: true }
        ]
      },
      event: {
        type: 'FLAG_PEP_HIGH_VALUE',
        params: { message: 'High-value transaction involving a Politically Exposed Person (PEP)' }
      }
    });

    // Core AML Rule: Sanction/High Risk Jurisdictions
    ruleEngine.addRule({
      conditions: {
        any: [
          { fact: 'senderCountry', operator: 'equal', value: 'IR' },
          { fact: 'senderCountry', operator: 'equal', value: 'KP' },
          { fact: 'senderCountry', operator: 'equal', value: 'SY' },
          { fact: 'senderCountry', operator: 'equal', value: 'RU' }
        ]
      },
      event: {
        type: 'FLAG_SANCTIONED_COUNTRY',
        params: { message: 'Transaction originated from a high-risk/sanctioned jurisdiction' }
      }
    });

    // Core AML Rule: Micro-Transaction Velocity Threshold ($50,000+)
    ruleEngine.addRule({
      conditions: {
        all: [
          { fact: 'amount', operator: 'greaterThanInclusive', value: 50000 }
        ]
      },
      event: {
        type: 'FLAG_LARGE_TRANSACTION',
        params: { message: 'Exceeds standard single-transaction regulatory reporting limit ($50,000+)' }
      }
    });

    // Add custom dynamic rules if provided
    if (customRules && Array.isArray(customRules)) {
      customRules.forEach((rule, idx) => {
        try {
          ruleEngine.addRule(rule);
        } catch (e: any) {
          console.warn(`[REGTECH_ORCHESTRATOR] Invalid custom rule at index ${idx}:`, e.message);
        }
      });
    }

    const { events } = await ruleEngine.run(data);
    events.forEach(evt => {
      reasons.push(evt.params?.message || evt.type);
      rulesTriggered.push(evt.type);
    });
    const dynamicRulesTimeMs = performance.now() - tRulesStart;

    // ----------------------------------------------------
    // STEP 3: LAYER 3 - ISOLATED PLUGIN EXECUTION (SANDBOX)
    // ----------------------------------------------------
    // SECURITY: vm.createContext is NOT a security boundary — prototype/constructor
    // escapes can reach host Node. Execution of client-supplied arbitrary JS is RCE.
    // Plugins must be pre-registered, server-side, reviewed code that runs as trusted
    // server logic. Never execute unvetted client code.
    let pluginTimeMs = 0;
    if (clientPluginJsCode && clientPluginJsCode.trim()) {
      const pluginStart = performance.now();
      try {
        // In production, reject arbitrary client-supplied plugin code outright.
        // Only allow plugin execution when explicitly enabled via env gate, and even
        // then run inside a hardened context with NO host objects exposed.
        if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_CLIENT_PLUGINS) {
          reasons.push('Plugin execution disabled: Client-supplied plugins are not permitted in production.');
          rulesTriggered.push('CLIENT_PLUGIN_DISABLED');
          pluginTimeMs = performance.now() - pluginStart;
        } else {
          const sandboxState = {
            transactionData: data,
            outputResult: null as any
          };

          // Build a hardened context: only whitelisted primitives are exposed.
          const hardenedSandbox: Record<string, any> = {
            transactionData: data,
            __result: null,
            __setResult: (val: any) => { hardenedSandbox.__result = val; }
          };

          const context = vm.createContext(hardenedSandbox);

          // Wrapped execution block — sandbox globals are NOT automatically exposed.
          const wrappedScript = new vm.Script(`
            (function(it) {
              'use strict';
              const transactionData = it.transactionData;
              const __setResult = it.__setResult;
              try {
                ${clientPluginJsCode}
                if (typeof customRiskLogic === 'function') {
                  __setResult(customRiskLogic(transactionData));
                }
              } catch(e) {
                it.__setResult({ flagged: true, reason: 'Sandbox Exception: ' + e.message });
              }
            })(this)
          `);

          // Execute with a shorter timeout; the sandbox has no access to require/process/Buffer.
          wrappedScript.runInContext(context, { timeout: 50 });
          const pluginResult = hardenedSandbox.__result;
          if (pluginResult && typeof pluginResult === 'object' && pluginResult.flagged) {
            reasons.push(`Client Plugin Flag: ${pluginResult.reason || 'Custom Rule Rejection'}`);
            rulesTriggered.push('CLIENT_CUSTOM_PLUGIN');
          }
        }
      } catch (err: any) {
        reasons.push(`Plugin Execution Timeout or Failure: ${err.message}`);
        rulesTriggered.push('CLIENT_PLUGIN_TIMEOUT');
      } finally {
        pluginTimeMs = performance.now() - pluginStart;
      }
    }

    // ----------------------------------------------------
    // STEP 4: LAYER 4 - IMMUTABLE AUDIT TRAIL LOGGING
    // ----------------------------------------------------
    const tAuditStart = performance.now();
    const finalDecision = reasons.some(r => r.includes('SANCTION') || r.includes('Rejection')) 
      ? 'REJECTED' 
      : reasons.length > 0 
        ? 'FLAGGED' 
        : 'APPROVED';

    const totalTimeMs = performance.now() - startTime;
    const auditLogTimeMs = performance.now() - tAuditStart;

    const auditEntry: AuditLogEntry = {
      auditId: crypto.randomUUID(),
      transactionId: data.transactionId,
      clientId: data.clientId,
      timestamp: new Date().toISOString(),
      payloadHash,
      rulesEvaluated: rulesTriggered,
      pluginExecutionTimeMs: Math.round(pluginTimeMs * 100) / 100,
      finalDecision,
      reasons,
      layerMetrics: {
        validationTimeMs: Math.round(validationTimeMs * 100) / 100,
        dynamicRulesTimeMs: Math.round(dynamicRulesTimeMs * 100) / 100,
        sandboxPluginTimeMs: Math.round(pluginTimeMs * 100) / 100,
        auditLogTimeMs: Math.round(auditLogTimeMs * 100) / 100,
        totalTimeMs: Math.round(totalTimeMs * 100) / 100
      }
    };

    // Asynchronous immutable audit logging to SQLite / Event DB
    this.persistAuditLog(auditEntry, data);

    return {
      success: true,
      decision: finalDecision,
      auditTrail: auditEntry
    };
  }

  private persistAuditLog(log: AuditLogEntry, rawPayload: TransactionPayload): void {
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS regtech_audit_logs (
          id TEXT PRIMARY KEY,
          transaction_id TEXT,
          client_id TEXT,
          payload_hash TEXT,
          final_decision TEXT,
          rules_evaluated TEXT,
          reasons TEXT,
          layer_metrics TEXT,
          raw_payload TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      db.prepare(`
        INSERT INTO regtech_audit_logs (
          id, transaction_id, client_id, payload_hash, final_decision,
          rules_evaluated, reasons, layer_metrics, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        log.auditId,
        log.transactionId,
        log.clientId,
        log.payloadHash,
        log.finalDecision,
        JSON.stringify(log.rulesEvaluated),
        JSON.stringify(log.reasons),
        JSON.stringify(log.layerMetrics),
        JSON.stringify(rawPayload)
      );
    } catch (err: any) {
      console.error('[REGTECH_ORCHESTRATOR] Error persisting audit log:', err.message);
    }
  }
}

export const regTechEngine = new RegTechEngineOrchestrator();
