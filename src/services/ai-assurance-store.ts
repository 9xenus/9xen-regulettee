/**
 * ASSURANCE STORE — database-backed glue for decision traces, provenance and trust inputs.
 * The statistics / hashing / matching logic is in the pure modules; this file only persists and gathers.
 */
import crypto from 'node:crypto';
import {
  lastTrace, insertTraceRow, listTraceRows, getTraceRow, setTraceReview, oversightCounts,
  insertManifestRow, getManifestByHash, listManifests, listMonitorRuns, latestRunOfType, listAiRiskFindings,
  type TraceRow, type AiAssetRow
} from '../db/ai-risk-repository';
import { getDb } from '../db/sqlite';
import {
  traceHash, digest, riskFromDecisions, verifyChain, explainDecision, contentHash, minhash, encodeMinhash, canonicalManifest, matchProvenance, embedSnippets, DISCLOSURE_LABEL,
  type TraceCore, type TraceDecision, type ManifestCore
} from './ai-trace-provenance';
import { signPayload, verifyPayload } from './ai-evidence-bundle';
import type { TrustInputs } from './ai-trust-financial';
import type { Sev } from './ai-posture-scoring';

// ── Decision traces ──────────────────────────────────────────────────────────

const coreFromRow = (r: TraceRow): TraceCore => ({
  traceId: r.id, tenantId: r.tenant_id, systemId: r.system_id, seq: r.seq, prevHash: r.prev_hash, inputHash: r.input_hash, outputHash: r.output_hash,
  modelId: r.model_id, policyVersion: r.policy_version, status: r.status, riskScore: r.risk_score,
  decisions: JSON.parse(r.decisions_json) as TraceDecision[], toolCalls: JSON.parse(r.tool_calls_json) as string[], createdAt: r.created_at
});

export class AiTraceStore {
  /** Appends a trace to the (tenant, system) hash chain. Stores digests of input/output, never the raw text. */
  static record(i: { tenantId: string; systemId: string; inputText: string; outputText: string; modelId: string; policyVersion: string; status: string; decisions: TraceDecision[]; toolCalls: string[] }): TraceCore {
    const db = getDb();
    return db.transaction(() => {
      const last = lastTrace(i.tenantId, i.systemId);
      const core: TraceCore = {
        traceId: `TRC-${crypto.randomBytes(5).toString('hex').toUpperCase()}`, tenantId: i.tenantId, systemId: i.systemId, seq: (last?.seq ?? 0) + 1, prevHash: last?.trace_hash ?? null,
        inputHash: digest(i.inputText), outputHash: digest(i.outputText), modelId: i.modelId, policyVersion: i.policyVersion, status: i.status,
        riskScore: riskFromDecisions(i.decisions), decisions: i.decisions.slice(0, 40), toolCalls: i.toolCalls.slice(0, 20), createdAt: new Date().toISOString()
      };
      insertTraceRow({
        id: core.traceId, tenant_id: core.tenantId, system_id: core.systemId, seq: core.seq, prev_hash: core.prevHash, trace_hash: traceHash(core), input_hash: core.inputHash, output_hash: core.outputHash,
        model_id: core.modelId, policy_version: core.policyVersion, status: core.status, risk_score: core.riskScore, decisions_json: JSON.stringify(core.decisions), tool_calls_json: JSON.stringify(core.toolCalls),
        needs_review: core.status === 'FLAGGED' || core.toolCalls.length > 0 ? 1 : 0, review_json: null, created_at: core.createdAt
      });
      return core;
    })();
  }

  static verify(tenantId: string, systemId: string) {
    const rows = listTraceRows(tenantId, systemId, 100000, 0, false);
    return verifyChain(rows.map(r => ({ core: coreFromRow(r), storedHash: r.trace_hash })));
  }

  static get(tenantId: string, id: string) {
    const r = getTraceRow(tenantId, id);
    if (!r) return null;
    const review = r.review_json ? (JSON.parse(r.review_json) as { reviewer: string; decision: string; at: string; note?: string }) : null;
    const core = coreFromRow(r);
    return { trace: { ...core, traceHash: r.trace_hash, needsReview: !!r.needs_review, review }, explanation: explainDecision(core, review) };
  }

  static list(tenantId: string, systemId: string, limit: number, offset: number) {
    return listTraceRows(tenantId, systemId, limit, offset).map(r => ({
      traceId: r.id, seq: r.seq, status: r.status, riskScore: r.risk_score, modelId: r.model_id, createdAt: r.created_at, needsReview: !!r.needs_review, reviewed: !!r.review_json,
      toolCalls: JSON.parse(r.tool_calls_json) as string[], topFactor: (JSON.parse(r.decisions_json) as TraceDecision[]).find(d => d.action !== 'ALLOW')?.rule ?? null
    }));
  }

  static review(tenantId: string, id: string, reviewer: string, decision: string, note?: string): boolean {
    return setTraceReview(tenantId, id, { reviewer, decision, note: note?.slice(0, 500), at: new Date().toISOString() });
  }
}

// ── Provenance ───────────────────────────────────────────────────────────────

const manifestCore = (m: { id: string; tenant_id: string; system_id: string; content_hash: string; minhash: string | null; model: string; label: string; created_at: string }): ManifestCore =>
  ({ manifestId: m.id, tenantId: m.tenant_id, systemId: m.system_id, contentHash: m.content_hash, minhash: m.minhash, model: m.model, label: m.label, createdAt: m.created_at });

export class AiProvenanceStore {
  static mark(tenantId: string, text: string, systemId: string, model: string) {
    const ch = contentHash(text);
    const existing = getManifestByHash(tenantId, ch);
    if (existing) return { manifestId: existing.id, createdAt: existing.created_at, alreadyRegistered: true, ...embedSnippets(existing.id) };
    const mh = minhash(text);
    const core: ManifestCore = { manifestId: `PRV-${crypto.randomBytes(5).toString('hex').toUpperCase()}`, tenantId, systemId, contentHash: ch, minhash: mh ? encodeMinhash(mh) : null, model, label: DISCLOSURE_LABEL, createdAt: new Date().toISOString() };
    const { signature, keySource } = signPayload(canonicalManifest(core));
    insertManifestRow({ id: core.manifestId, tenant_id: tenantId, system_id: systemId, content_hash: ch, minhash: core.minhash, model, label: core.label, signature, key_source: keySource, created_at: core.createdAt });
    return { manifestId: core.manifestId, createdAt: core.createdAt, alreadyRegistered: false, similarityIndexed: !!mh, signatureKeySource: keySource, ...embedSnippets(core.manifestId) };
  }

  static verify(tenantId: string, text: string) {
    const rows = listManifests(tenantId);
    return matchProvenance(text, rows.map(m => ({ core: manifestCore(m), signatureValid: verifyPayload(canonicalManifest(manifestCore(m)), m.signature) })));
  }
}

// ── Trust inputs ─────────────────────────────────────────────────────────────

const ageDays = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z').getTime()) / 86_400_000));

export function gatherTrustInputs(tenantId: string, entityId: string, asset: AiAssetRow): TrustInputs {
  const locations = JSON.parse(asset.locations || '[]') as { path: string }[];
  const paths = new Set(locations.map(l => l.path));
  const entityHasScan = !!latestRunOfType(tenantId, 'ESTATE_SCAN', entityId);
  let openFindings: Sev[] | null = null;
  if (paths.size && entityHasScan) {
    openFindings = listAiRiskFindings(undefined, tenantId, 5000)
      .filter(f => f.model_target.startsWith(`${entityId}:`) && f.fix_status !== 'FIXED' && paths.has((f.affected_code_or_prompt || '').split('|')[0].trim().replace(/:\d+$/, '')))
      .map(f => f.severity as Sev);
  }
  const pit = latestRunOfType(tenantId, 'PROMPT_INJECTION_TEST', entityId);
  const drift = listMonitorRuns(tenantId, entityId, asset.id, 'DRIFT', 1)[0];
  const fair = listMonitorRuns(tenantId, entityId, asset.id, 'FAIRNESS', 1)[0];
  const ov = oversightCounts(tenantId, asset.id);
  const eff = asset.risk_class_confirmed || asset.risk_class;
  return {
    openFindings,
    redTeam: pit ? { attackSuccessRatePct: Math.max(0, 100 - pit.overall_risk_score), ageDays: ageDays(pit.created_at) } : null,
    drift: drift ? { status: drift.status as 'STABLE' | 'WARN' | 'DRIFT' | 'INSUFFICIENT_DATA', ageDays: ageDays(drift.created_at) } : null,
    fairness: fair ? { verdict: fair.status as 'PASS' | 'REVIEW' | 'FAIL' | 'INSUFFICIENT_DATA', ageDays: ageDays(fair.created_at) } : null,
    oversight: ov.required > 0 ? ov : null,
    governance: { classConfirmed: !!asset.risk_class_confirmed, highRisk: eff === 'HIGH_RISK_ANNEX_III' || eff === 'UNACCEPTABLE_PROHIBITED' }
  };
}
