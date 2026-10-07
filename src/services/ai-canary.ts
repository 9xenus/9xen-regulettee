/**
 * CANARY MANAGER — stages a runtime-gateway POLICY change on a slice of real traffic, compares cohorts, and
 * auto-advances / holds / rolls back. Promotion to 100% needs a human approval. See ai-canary-core for the rules.
 */
import crypto from 'node:crypto';
import { getCanaryRow, upsertCanaryRow, activeCanaryRow, listCanaryRows } from '../db/ai-risk-repository';
import {
  cohortFor, emptyCounters, evaluateCanary, STAGE_PCT, DEFAULT_THRESHOLDS,
  type CohortCounters, type CanaryThresholds, type CanaryStage, type CanaryEvaluation
} from './ai-canary-core';

export type PolicyPatch = Record<string, unknown>;
export interface CanaryRollout {
  id: string; tenantId: string; name: string; patch: PolicyPatch; stage: CanaryStage; status: 'ACTIVE' | 'PROMOTED' | 'ROLLED_BACK';
  thresholds: CanaryThresholds; control: CohortCounters; canary: CohortCounters;
  history: { at: string; event: string; detail: string }[]; createdBy: string; createdAt: string; lastEvaluation?: CanaryEvaluation;
}

const ALLOWED: Record<string, (v: unknown) => boolean> = {
  maxTokensPerRequest: v => typeof v === 'number' && v > 0 && v <= 200_000, maxTokensPerMinute: v => typeof v === 'number' && v > 0 && v <= 5_000_000,
  allowedClassifications: v => Array.isArray(v) && v.every(x => ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].includes(String(x))),
  requireGrounding: v => typeof v === 'boolean', requireOutputValidation: v => typeof v === 'boolean',
  piiAction: v => ['ALLOW', 'REDACT', 'BLOCK', 'FLAG'].includes(String(v)), promptInjectionAction: v => ['ALLOW', 'BLOCK', 'FLAG'].includes(String(v)),
  jailbreakAction: v => ['ALLOW', 'BLOCK', 'FLAG'].includes(String(v)), secretDetectionAction: v => ['ALLOW', 'BLOCK', 'FLAG'].includes(String(v)),
  systemPromptEnforcement: v => typeof v === 'boolean', tokenBudgetEnforcement: v => typeof v === 'boolean'
};

export function validatePatch(patch: unknown): { ok: boolean; patch?: PolicyPatch; error?: string } {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ok: false, error: 'patch must be an object of policy fields' };
  const out: PolicyPatch = {};
  for (const [k, v] of Object.entries(patch as PolicyPatch)) {
    if (k === 'auditAllRequests') return { ok: false, error: 'auditAllRequests cannot be changed by a canary: audit logging must stay on' };
    if (!ALLOWED[k]) return { ok: false, error: `unknown or non-canary-able policy field "${k}"` };
    if (!ALLOWED[k](v)) return { ok: false, error: `invalid value for "${k}"` };
    out[k] = v;
  }
  return Object.keys(out).length ? { ok: true, patch: out } : { ok: false, error: 'patch is empty' };
}

const cache = new Map<string, CanaryRollout>();
const recent = new Map<string, Map<string, { cohort: 'canary' | 'control'; blocked: boolean; marked: boolean; labelled?: boolean }>>();
let promoter: ((patch: PolicyPatch) => void) | null = null;

function hydrate(row: { id: string; tenant_id: string; name: string; status: string; state_json: string; created_by: string; created_at: string }): CanaryRollout {
  const st = JSON.parse(row.state_json) as Omit<CanaryRollout, 'id' | 'tenantId' | 'name' | 'status' | 'createdBy' | 'createdAt'>;
  return { ...st, id: row.id, tenantId: row.tenant_id, name: row.name, status: row.status as CanaryRollout['status'], createdBy: row.created_by, createdAt: row.created_at };
}
function persist(r: CanaryRollout): void {
  const { id, tenantId, name, status, createdBy, createdAt, ...state } = r;
  upsertCanaryRow({ id, tenantId, name, status, state, createdBy, createdAt });
}
const load = (id: string): CanaryRollout | undefined => { if (cache.has(id)) return cache.get(id); const row = getCanaryRow(id); if (!row) return undefined; const r = hydrate(row); cache.set(id, r); return r; };
const note = (r: CanaryRollout, event: string, detail: string) => { r.history.push({ at: new Date().toISOString(), event, detail }); if (r.history.length > 100) r.history.shift(); };

export class CanaryManager {
  /** The gateway registers how to apply a promoted patch (avoids a circular import). */
  static setPromoter(fn: (patch: PolicyPatch) => void) { promoter = fn; }

  static create(tenantId: string, name: string, patch: PolicyPatch, createdBy: string, thresholds?: Partial<CanaryThresholds>): CanaryRollout {
    if (CanaryManager.active(tenantId)) throw new Error('Another canary is already active for this tenant; promote or roll it back first');
    const r: CanaryRollout = {
      id: `CNY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, tenantId, name: name.slice(0, 80), patch, stage: 'CANARY_5', status: 'ACTIVE',
      thresholds: { ...DEFAULT_THRESHOLDS, ...(thresholds || {}) }, control: emptyCounters(), canary: emptyCounters(), history: [], createdBy, createdAt: new Date().toISOString()
    };
    note(r, 'CREATED', `Policy patch ${JSON.stringify(patch)} staged at 5% traffic`);
    cache.set(r.id, r); persist(r); return r;
  }

  static active(tenantId: string): CanaryRollout | undefined {
    for (const r of cache.values()) if (r.tenantId === tenantId && r.status === 'ACTIVE') return r;
    const row = activeCanaryRow(tenantId);
    return row ? load(row.id) : undefined;
  }

  static assign(tenantId: string, userId: string, sessionId: string): { rolloutId: string; cohort: 'canary' | 'control'; patch: PolicyPatch } | null {
    const r = CanaryManager.active(tenantId);
    if (!r || r.stage === 'ROLLED_BACK' || r.stage === 'FULL') return null;
    return { rolloutId: r.id, cohort: cohortFor(r.id, tenantId, userId, sessionId, STAGE_PCT[r.stage]), patch: r.patch };
  }

  static record(rolloutId: string, cohort: 'canary' | 'control', o: { requestId: string; status: string; latencyMs: number; error: boolean }): void {
    const r = load(rolloutId); if (!r || r.status !== 'ACTIVE') return;
    const c = cohort === 'canary' ? r.canary : r.control;
    c.n++; if (o.status === 'BLOCKED') c.blocked++; if (o.status === 'FLAGGED') c.flagged++; if (o.error) c.errors++;
    c.latencies.push(o.latencyMs); if (c.latencies.length > 500) c.latencies.shift();
    let map = recent.get(rolloutId); if (!map) { map = new Map(); recent.set(rolloutId, map); }
    map.set(o.requestId, { cohort, blocked: o.status === 'BLOCKED', marked: false }); if (map.size > 3000) map.delete(map.keys().next().value as string);
    if ((r.canary.n + r.control.n) % 25 === 0) CanaryManager.tick(rolloutId);
  }

  /** Reviewer feedback: marks a BLOCKED request as a false positive (the only way FP is ever counted). */
  static feedback(rolloutId: string, requestId: string, falsePositive: boolean): { ok: boolean; error?: string } {
    const r = load(rolloutId); if (!r) return { ok: false, error: 'rollout not found' };
    const rec = recent.get(rolloutId)?.get(requestId);
    if (!rec) return { ok: false, error: 'request not found in the recent window (only the latest 3,000 requests are retained for labelling)' };
    if (!rec.blocked) return { ok: false, error: 'only blocked requests can be labelled as false positives' };
    const ctr = rec.cohort === 'canary' ? r.canary : r.control;
    if (!rec.labelled) { ctr.labelled = (ctr.labelled ?? 0) + 1; rec.labelled = true; }
    if (falsePositive && !rec.marked) { (rec.cohort === 'canary' ? r.canary : r.control).fp++; rec.marked = true; }
    if (!falsePositive && rec.marked) { (rec.cohort === 'canary' ? r.canary : r.control).fp--; rec.marked = false; }
    CanaryManager.tick(rolloutId);
    return { ok: true };
  }

  static tick(id: string): CanaryRollout | undefined {
    const r = load(id); if (!r || r.status !== 'ACTIVE') return r;
    const e = evaluateCanary(r.stage, r.control, r.canary, r.thresholds); r.lastEvaluation = e;
    if (e.action === 'ROLLBACK') { r.stage = 'ROLLED_BACK'; r.status = 'ROLLED_BACK'; note(r, 'AUTO_ROLLBACK', e.reasons.join('; ')); }
    else if (e.action === 'ADVANCE' && e.nextStage) { note(r, 'ADVANCED', `${r.stage} → ${e.nextStage}: ${e.reasons[0]}`); r.stage = e.nextStage; r.control = emptyCounters(); r.canary = emptyCounters(); recent.delete(id); }
    else if (e.action === 'AWAIT_APPROVAL' && r.stage !== 'AWAITING_FULL_APPROVAL') { r.stage = 'AWAITING_FULL_APPROVAL'; note(r, 'AWAITING_APPROVAL', e.reasons[0]); }
    persist(r); return r;
  }

  static approveFull(id: string, approver: string): CanaryRollout {
    const r = load(id); if (!r) throw new Error('rollout not found');
    if (r.stage !== 'AWAITING_FULL_APPROVAL') throw new Error(`rollout is at ${r.stage}; it can only be promoted after passing 50% health checks`);
    if (!promoter) throw new Error('gateway promoter not registered');
    promoter(r.patch); r.stage = 'FULL'; r.status = 'PROMOTED'; note(r, 'PROMOTED', `Approved by ${approver}; policy patch applied to 100% of traffic`);
    persist(r); return r;
  }

  static rollback(id: string, by: string, reason: string): CanaryRollout {
    const r = load(id); if (!r) throw new Error('rollout not found');
    if (r.status !== 'ACTIVE') throw new Error(`rollout is already ${r.status}`);
    r.stage = 'ROLLED_BACK'; r.status = 'ROLLED_BACK'; note(r, 'MANUAL_ROLLBACK', `${by}: ${reason.slice(0, 200)}`); persist(r); return r;
  }

  static get(id: string) { return load(id); }
  static list(tenantId: string): CanaryRollout[] { return listCanaryRows(tenantId).map(row => load(row.id)!).filter(Boolean); }
}
