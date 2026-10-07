/**
 * CANARY REMEDIATION — decision logic (pure).
 *
 * Scope: staged rollout of a RUNTIME GATEWAY POLICY CHANGE only (the one thing this platform can actually canary).
 * A deterministic hash assigns each request to the canary or control cohort; health is compared between cohorts and
 * the rollout auto-advances, holds, or rolls back. Promotion to 100% is never automatic: it needs a human approval
 * (data-changing → approval-based, consistent with the runtime policy).
 *
 * LIMIT: "false positive" can only be counted from human feedback. Unlabelled blocks are not assumed to be correct
 * or incorrect, so the false-positive guard is silent until reviewers label blocked requests.
 */
import crypto from 'node:crypto';

export interface CohortCounters { n: number; blocked: number; flagged: number; errors: number; fp: number; /** blocked requests a reviewer has labelled (either way) */ labelled?: number; latencies: number[] }
export interface CanaryThresholds { minSamples: number; minBlockedForFp: number; maxFalsePositiveRate: number; maxBlockRateIncrease: number; maxErrorRateIncrease: number; maxP95LatencyIncrease: number }
export type CanaryStage = 'CANARY_5' | 'CANARY_25' | 'CANARY_50' | 'AWAITING_FULL_APPROVAL' | 'FULL' | 'ROLLED_BACK';
export type CanaryAction = 'HOLD' | 'ADVANCE' | 'ROLLBACK' | 'AWAIT_APPROVAL';

export const DEFAULT_THRESHOLDS: CanaryThresholds = { minSamples: 200, minBlockedForFp: 20, maxFalsePositiveRate: 0.10, maxBlockRateIncrease: 0.10, maxErrorRateIncrease: 0.02, maxP95LatencyIncrease: 0.5 };
export const STAGE_PCT: Record<CanaryStage, number> = { CANARY_5: 5, CANARY_25: 25, CANARY_50: 50, AWAITING_FULL_APPROVAL: 50, FULL: 100, ROLLED_BACK: 0 };
const NEXT: Partial<Record<CanaryStage, CanaryStage>> = { CANARY_5: 'CANARY_25', CANARY_25: 'CANARY_50', CANARY_50: 'AWAITING_FULL_APPROVAL' };

export const emptyCounters = (): CohortCounters => ({ n: 0, blocked: 0, flagged: 0, errors: 0, fp: 0, labelled: 0, latencies: [] });

/** Deterministic cohort: the same user/session always lands in the same cohort for a given rollout. */
export function cohortFor(rolloutId: string, tenantId: string, userId: string, sessionId: string, trafficPct: number): 'canary' | 'control' {
  const h = crypto.createHash('sha256').update(`${rolloutId}|${tenantId}|${userId}|${sessionId}`).digest();
  const bucket = h.readUInt32BE(0) % 100;
  return bucket < trafficPct ? 'canary' : 'control';
}

const p95 = (a: number[]) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(0.95 * s.length))]; };

export interface CanaryEvaluation {
  action: CanaryAction; nextStage: CanaryStage | null; reasons: string[];
  metrics: { canaryN: number; controlN: number; canaryBlockRate: number; controlBlockRate: number; canaryFpRate: number | null; errorRateDelta: number; p95LatencyRatio: number | null };
}

export function evaluateCanary(stage: CanaryStage, control: CohortCounters, canary: CohortCounters, t: CanaryThresholds = DEFAULT_THRESHOLDS): CanaryEvaluation {
  const rate = (a: number, n: number) => (n ? a / n : 0);
  const labelled = canary.labelled ?? 0;
  // FP rate is only known from reviewer labels: unlabelled blocks are neither good nor bad.
  const fpRate = labelled >= t.minBlockedForFp ? canary.fp / labelled : null;
  const errDelta = rate(canary.errors, canary.n) - rate(control.errors, control.n);
  const pc = p95(canary.latencies); const pk = p95(control.latencies);
  const latRatio = canary.latencies.length >= 30 && control.latencies.length >= 30 && pk > 0 ? pc / pk : null;
  const metrics = { canaryN: canary.n, controlN: control.n, canaryBlockRate: rate(canary.blocked, canary.n), controlBlockRate: rate(control.blocked, control.n), canaryFpRate: fpRate, errorRateDelta: errDelta, p95LatencyRatio: latRatio };

  if (!(stage in NEXT)) return { action: 'HOLD', nextStage: null, reasons: [`stage ${stage} is not an active canary stage`], metrics };

  const reasons: string[] = [];
  // Harm checks run as soon as there is enough signal for THAT check, independent of the advance threshold.
  if (fpRate !== null && fpRate > t.maxFalsePositiveRate) reasons.push(`false-positive rate among canary blocks is ${(fpRate * 100).toFixed(0)}% (limit ${(t.maxFalsePositiveRate * 100).toFixed(0)}%) from ${canary.fp}/${canary.blocked} reviewer-labelled blocks`);
  if (canary.n >= 50 && errDelta > t.maxErrorRateIncrease * (canary.n >= t.minSamples ? 1 : 5)) reasons.push(`error rate is ${(errDelta * 100).toFixed(1)} percentage points higher in the canary cohort`);
  if (latRatio !== null && latRatio > 1 + t.maxP95LatencyIncrease) reasons.push(`p95 latency is ${((latRatio - 1) * 100).toFixed(0)}% higher in the canary cohort`);
  if (reasons.length) return { action: 'ROLLBACK', nextStage: 'ROLLED_BACK', reasons, metrics };

  if (canary.n < t.minSamples || control.n < t.minSamples) return { action: 'HOLD', nextStage: null, reasons: [`collecting data: canary ${canary.n}/${t.minSamples}, control ${control.n}/${t.minSamples} requests`], metrics };
  // A big jump in blocking with no (or too few) reviewer labels cannot be judged automatically: hold for review.
  const blockDelta = rate(canary.blocked, canary.n) - rate(control.blocked, control.n);
  if (blockDelta > t.maxBlockRateIncrease && fpRate === null) {
    return { action: 'HOLD', nextStage: null, reasons: [`canary blocks ${(blockDelta * 100).toFixed(0)} percentage points more traffic than control; label at least ${t.minBlockedForFp} blocked requests as correct or false-positive before it can advance (labelled so far: ${labelled})`], metrics };
  }
  const next = NEXT[stage]!;
  if (next === 'AWAITING_FULL_APPROVAL') return { action: 'AWAIT_APPROVAL', nextStage: next, reasons: ['healthy at 50% traffic; promotion to 100% requires a human approval'], metrics };
  return { action: 'ADVANCE', nextStage: next, reasons: [`healthy at ${STAGE_PCT[stage]}% traffic over ${canary.n} canary requests`], metrics };
}
