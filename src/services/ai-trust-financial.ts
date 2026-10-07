/**
 * ADAPTIVE TRUST SCORE + FINANCIAL RISK MODEL (pure functions, no I/O)
 *
 * Trust score: transparent weighted blend of independent signals (findings, red-team success rate, drift/fairness,
 * human-oversight coverage, governance status). Only signals that EXIST are used; the score carries a `confidence`
 * (share of total weight that was available) and below 40% it refuses to rate. Stale signals lose weight.
 * Weights are expert-chosen, NOT learned or validated against incidents.
 *
 * Financial model: FAIR-style Monte-Carlo. Each distinct finding rule is one loss scenario with an annual event
 * probability and a loss magnitude (incident response + downtime + regulatory penalty × realisation). EVERY
 * default below is an ILLUSTRATIVE assumption to be replaced with the organisation's own data; the output is a
 * structured estimate, not an actuarial prediction.
 */
import { seededRng } from './ai-monitoring';
import { penaltyExposure, type EntityProfile, type PostureFinding, type Sev } from './ai-posture-scoring';

// ── Trust score ──────────────────────────────────────────────────────────────

export interface TrustInputs {
  openFindings: Sev[] | null;                                   // findings in this system's files
  redTeam: { attackSuccessRatePct: number; ageDays: number } | null;
  drift: { status: 'STABLE' | 'WARN' | 'DRIFT' | 'INSUFFICIENT_DATA'; ageDays: number } | null;
  fairness: { verdict: 'PASS' | 'REVIEW' | 'FAIL' | 'INSUFFICIENT_DATA'; ageDays: number } | null;
  oversight: { required: number; reviewed: number } | null;
  governance: { classConfirmed: boolean; highRisk: boolean } | null;
}

export interface TrustComponent { name: string; weight: number; effectiveWeight: number; score: number | null; basis: string }
export type TrustTier = 'TRUSTED' | 'WATCH' | 'RESTRICTED' | 'UNTRUSTED' | 'INSUFFICIENT_DATA';
export interface TrustResult {
  score: number | null; confidence: number; tier: TrustTier; components: TrustComponent[];
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'UNKNOWN'; smoothed: number | null;
  recommendedPolicy: string; caveat: string;
}

const W = { findings: 0.30, redTeam: 0.20, monitoring: 0.20, oversight: 0.15, governance: 0.15 };
const FIND_DEDUCT: Record<Sev, number> = { CRITICAL: 25, HIGH: 12, MEDIUM: 4, LOW: 1 };
const freshness = (days: number) => (days > 90 ? 0.25 : days > 30 ? 0.5 : 1);

export function computeTrust(i: TrustInputs, history: number[] = []): TrustResult {
  const comps: TrustComponent[] = [];
  const add = (name: string, weight: number, score: number | null, basis: string, fresh = 1) => comps.push({ name, weight, effectiveWeight: score === null ? 0 : weight * fresh, score, basis });

  add('findings', W.findings, i.openFindings ? Math.max(0, 100 - i.openFindings.reduce((s, v) => s + FIND_DEDUCT[v], 0)) : null,
    i.openFindings ? `${i.openFindings.length} open finding(s) in this system's files` : 'no scan data linked to this system');
  add('red-team', W.redTeam, i.redTeam ? Math.max(0, 100 - i.redTeam.attackSuccessRatePct * 2) : null,
    i.redTeam ? `attack success rate ${i.redTeam.attackSuccessRatePct}% (${i.redTeam.ageDays}d ago)` : 'no prompt-injection test on record', i.redTeam ? freshness(i.redTeam.ageDays) : 1);

  // Monitoring: the WORST of drift and fairness, using whichever exist.
  const mon: number[] = []; const monBasis: string[] = []; let monAge = 0;
  if (i.drift && i.drift.status !== 'INSUFFICIENT_DATA') { mon.push(i.drift.status === 'STABLE' ? 100 : i.drift.status === 'WARN' ? 60 : 20); monBasis.push(`drift ${i.drift.status}`); monAge = Math.max(monAge, i.drift.ageDays); }
  if (i.fairness && i.fairness.verdict !== 'INSUFFICIENT_DATA') { mon.push(i.fairness.verdict === 'PASS' ? 100 : i.fairness.verdict === 'REVIEW' ? 55 : 15); monBasis.push(`fairness ${i.fairness.verdict}`); monAge = Math.max(monAge, i.fairness.ageDays); }
  add('monitoring', W.monitoring, mon.length ? Math.min(...mon) : null, mon.length ? monBasis.join(', ') : 'no drift/fairness monitoring on record', mon.length ? freshness(monAge) : 1);

  add('oversight', W.oversight, i.oversight && i.oversight.required > 0 ? Math.round(100 * Math.min(1, i.oversight.reviewed / i.oversight.required)) : null,
    i.oversight && i.oversight.required > 0 ? `${i.oversight.reviewed}/${i.oversight.required} decisions needing review were reviewed` : 'no decisions required human review');
  add('governance', W.governance, i.governance ? (i.governance.classConfirmed ? 100 : i.governance.highRisk ? 40 : 70) : null,
    i.governance ? (i.governance.classConfirmed ? 'risk class confirmed by a compliance officer' : i.governance.highRisk ? 'high-risk class NOT yet confirmed by a human' : 'low-risk class, unreviewed') : 'asset not in inventory');

  const totalW = Object.values(W).reduce((a, b) => a + b, 0);
  const availW = comps.reduce((s, c) => s + (c.score === null ? 0 : c.weight), 0);
  const effW = comps.reduce((s, c) => s + c.effectiveWeight, 0);
  const confidence = parseFloat((availW / totalW).toFixed(2));
  const score = effW > 0 ? Math.round(comps.reduce((s, c) => s + (c.score === null ? 0 : c.score * c.effectiveWeight), 0) / effW) : null;

  const tier: TrustTier = score === null || confidence < 0.4 ? 'INSUFFICIENT_DATA' : score >= 80 ? 'TRUSTED' : score >= 60 ? 'WATCH' : score >= 40 ? 'RESTRICTED' : 'UNTRUSTED';
  const alpha = 0.3; const prev = history.length ? history.reduce((s, v, k) => (k === 0 ? v : alpha * v + (1 - alpha) * s), history[0]) : null;
  const smoothed = score === null ? null : prev === null ? score : parseFloat((alpha * score + (1 - alpha) * prev).toFixed(1));
  const recent = history.slice(-3);
  const trend: TrustResult['trend'] = score === null || !recent.length ? 'UNKNOWN' : score - recent.reduce((a, b) => a + b, 0) / recent.length > 5 ? 'IMPROVING' : score - recent.reduce((a, b) => a + b, 0) / recent.length < -5 ? 'DECLINING' : 'STABLE';

  const recommendedPolicy =
    tier === 'TRUSTED' ? 'Normal operation: read-only actions automatic, data-changing actions per standard approval policy.'
    : tier === 'WATCH' ? 'Keep current policy; schedule the missing evidence (tests / monitoring) and re-score.'
    : tier === 'RESTRICTED' ? 'Tighten the gateway: require human approval for every data-changing tool call and flag ambiguous prompt-injection signals.'
    : tier === 'UNTRUSTED' ? 'Default-deny tools for this system, route all outputs through review, and consider the kill switch until findings are remediated.'
    : 'Not enough evidence to rate. Run a scan, a prompt-injection test and enable drift/fairness monitoring first.';
  return { score, confidence, tier, components: comps, trend, smoothed, recommendedPolicy,
    caveat: 'Weights are expert-set, not learned or validated against real incidents. Treat the tier as a prompt for review, not a measurement of safety.' };
}

// ── Financial risk (Monte-Carlo) ─────────────────────────────────────────────

type Tri = [number, number, number];                         // min, mode, max
export interface FinAssumptions {
  annualEventProbability: Record<Sev, number>;
  exposedCategoryMultiplier: number;
  incidentResponseEur: Tri;
  downtimeFractionOfTurnover: Tri;
  regulatoryRealisation: Tri;                                // share of the statutory ceiling actually imposed, given an event
  recordsAtRisk: number;                                     // 0 = unknown → excluded
  costPerRecordEur: Tri;
  residualRiskAfterFix: number;
}

export const DEFAULT_FIN_ASSUMPTIONS: FinAssumptions = {
  annualEventProbability: { CRITICAL: 0.20, HIGH: 0.08, MEDIUM: 0.02, LOW: 0.004 },
  exposedCategoryMultiplier: 1.25,
  incidentResponseEur: [20_000, 120_000, 600_000],
  downtimeFractionOfTurnover: [0, 0.001, 0.01],
  regulatoryRealisation: [0, 0.01, 0.15],
  recordsAtRisk: 0,
  costPerRecordEur: [20, 100, 300],
  residualRiskAfterFix: 0.15
};

export interface LossScenario { id: string; title: string; severity: Sev; category: string; penaltyCeilingEur: number }

const EXPOSED = new Set(['SECRETS_EXPOSURE', 'INFRA_SECURITY', 'PROMPT_SECURITY', 'OUTPUT_HANDLING', 'AGENT_SAFETY', 'TRANSPORT_SECURITY']);
const DATA_CATS = new Set(['SECRETS_EXPOSURE', 'DATA_GOVERNANCE', 'INFRA_SECURITY', 'PROMPT_SECURITY']);
const triMean = (t: Tri) => (t[0] + t[1] + t[2]) / 3;
function triSample(t: Tri, u: number): number {
  const [a, c, b] = t; if (b === a) return a;
  const f = (c - a) / (b - a);
  return u < f ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c));
}

export function scenariosFromFindings(findings: PostureFinding[], entity: EntityProfile): LossScenario[] {
  const byRule = new Map<string, LossScenario>();
  const rank: Record<Sev, number> = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
  for (const f of findings) {
    const key = `${f.category}:${f.title.replace(/\s*\(.*$/, '')}`;           // one scenario per distinct issue, not per hit
    const ceiling = Math.max(0, ...penaltyExposure([f], entity).lines.map(l => l.exposureEur ?? 0));
    const cur = byRule.get(key);
    if (!cur || rank[f.severity] > rank[cur.severity]) byRule.set(key, { id: key, title: f.title, severity: f.severity, category: f.category, penaltyCeilingEur: ceiling });
  }
  return Array.from(byRule.values());
}

function scenarioParams(s: LossScenario, a: FinAssumptions) {
  const p = Math.min(0.9, a.annualEventProbability[s.severity] * (EXPOSED.has(s.category) ? a.exposedCategoryMultiplier : 1));
  return { p };
}

function meanMagnitude(s: LossScenario, a: FinAssumptions, turnover: number): number {
  return triMean(a.incidentResponseEur) + triMean(a.downtimeFractionOfTurnover) * turnover + triMean(a.regulatoryRealisation) * s.penaltyCeilingEur
    + (DATA_CATS.has(s.category) && a.recordsAtRisk > 0 ? a.recordsAtRisk * triMean(a.costPerRecordEur) : 0);
}

export interface FinancialRiskResult {
  trials: number; seed: number; scenarios: number;
  expectedAnnualLossEur: number; analyticExpectedLossEur: number; medianEur: number; p90Eur: number; p95Eur: number; p99Eur: number;
  probabilityOfAnyEvent: number;
  perScenario: { id: string; title: string; severity: Sev; annualProbability: number; expectedLossEur: number; share: number }[];
  mitigations: { category: string; scenarios: number; expectedLossReductionEur: number }[];
  assumptions: FinAssumptions; warnings: string[]; disclaimer: string;
}

export function simulateFinancialRisk(scenarios: LossScenario[], entity: EntityProfile, opts: { assumptions?: Partial<FinAssumptions>; trials?: number; seed?: number } = {}): FinancialRiskResult {
  const a: FinAssumptions = { ...DEFAULT_FIN_ASSUMPTIONS, ...(opts.assumptions || {}), annualEventProbability: { ...DEFAULT_FIN_ASSUMPTIONS.annualEventProbability, ...(opts.assumptions?.annualEventProbability || {}) } };
  const trials = Math.min(100_000, Math.max(1_000, opts.trials ?? 20_000)); const seed = opts.seed ?? 1; const rng = seededRng(seed);
  const T = Math.max(0, entity.annualTurnoverEur);

  const params = scenarios.map(s => ({ s, ...scenarioParams(s, a) }));
  const losses = new Float64Array(trials); let anyEvent = 0;
  for (let t = 0; t < trials; t++) {
    let total = 0; let hit = false;
    for (const { s, p } of params) {
      if (rng() >= p) continue;
      hit = true;
      total += triSample(a.incidentResponseEur, rng()) + triSample(a.downtimeFractionOfTurnover, rng()) * T + triSample(a.regulatoryRealisation, rng()) * s.penaltyCeilingEur
        + (DATA_CATS.has(s.category) && a.recordsAtRisk > 0 ? a.recordsAtRisk * triSample(a.costPerRecordEur, rng()) : 0);
    }
    losses[t] = total; if (hit) anyEvent++;
  }
  const sorted = Array.from(losses).sort((x, y) => x - y);
  const q = (pp: number) => sorted[Math.min(trials - 1, Math.floor(pp * trials))];
  const mean = sorted.reduce((x, y) => x + y, 0) / trials;

  const per = params.map(({ s, p }) => ({ id: s.id, title: s.title, severity: s.severity, annualProbability: parseFloat(p.toFixed(3)), expectedLossEur: Math.round(p * meanMagnitude(s, a, T)), share: 0 }));
  const analytic = per.reduce((x, y) => x + y.expectedLossEur, 0);
  per.forEach(r => { r.share = analytic > 0 ? parseFloat((r.expectedLossEur / analytic).toFixed(3)) : 0; });
  per.sort((x, y) => y.expectedLossEur - x.expectedLossEur);

  const byCat = new Map<string, { n: number; red: number }>();
  for (const { s, p } of params) { const c = byCat.get(s.category) || { n: 0, red: 0 }; c.n++; c.red += p * meanMagnitude(s, a, T) * (1 - a.residualRiskAfterFix); byCat.set(s.category, c); }

  const warnings = [
    'Every probability and magnitude is an ILLUSTRATIVE default unless you supplied your own — replace them with your incident history and loss data.',
    'Scenarios are treated as independent; correlated failures (one root cause, several findings) would raise tail losses.',
    ...(a.recordsAtRisk === 0 ? ['recordsAtRisk is 0, so data-breach per-record costs are excluded; set it to include them.'] : []),
    ...(T === 0 ? ['annualTurnoverEur is 0, so downtime loss and turnover-based penalty tiers are zero.'] : [])
  ];
  return {
    trials, seed, scenarios: scenarios.length,
    expectedAnnualLossEur: Math.round(mean), analyticExpectedLossEur: analytic, medianEur: Math.round(q(0.5)), p90Eur: Math.round(q(0.9)), p95Eur: Math.round(q(0.95)), p99Eur: Math.round(q(0.99)),
    probabilityOfAnyEvent: parseFloat((anyEvent / trials).toFixed(3)),
    perScenario: per.slice(0, 15),
    mitigations: Array.from(byCat.entries()).map(([category, v]) => ({ category, scenarios: v.n, expectedLossReductionEur: Math.round(v.red) })).sort((x, y) => y.expectedLossReductionEur - x.expectedLossReductionEur),
    assumptions: a, warnings,
    disclaimer: 'A structured estimate under stated assumptions — not an actuarial prediction, insurance quote or legal advice.'
  };
}
