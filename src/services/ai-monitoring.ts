/**
 * MODEL / BEHAVIOUR DRIFT + BIAS / FAIRNESS MONITORING (pure functions, no I/O)
 *
 * Drift:  bias-corrected PSI (population stability index) + two-sample Kolmogorov–Smirnov for numeric features,
 *         PSI + Jensen–Shannon divergence for categorical ones. Behaviour drift is measured on features extracted
 *         from model responses (length, refusal rate, PII-hit rate, tool-call rate, injection-signal rate).
 * Fairness: selection-rate parity (4/5ths indicator), significance tests, and — when ground-truth labels exist —
 *         equal-opportunity / equalised-odds gaps.
 *
 * LIMITS (also returned to callers): small samples are reported as INSUFFICIENT_DATA rather than guessed;
 * thresholds are conventions, not legal tests; fairness definitions can conflict and "passing" one is not a
 * finding of non-discrimination.
 */

// ── Seeded RNG (reproducible tests / simulations) ────────────────────────────

export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normalSample(rng: () => number, mean = 0, sd = 1): number {
  const u = Math.max(rng(), 1e-12); const v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ── Drift ────────────────────────────────────────────────────────────────────

export type DriftStatus = 'STABLE' | 'WARN' | 'DRIFT' | 'INSUFFICIENT_DATA';
export type FeatureSet = Record<string, (number | string)[]>;

export interface FeatureDrift {
  feature: string; type: 'numeric' | 'categorical'; nRef: number; nCur: number;
  psi: number | null;            // bias-corrected, never negative
  ksD: number | null; ksP: number | null;
  js: number | null;
  meanShiftSd: number | null;    // (mean_cur − mean_ref) / sd_ref
  status: DriftStatus; reason: string;
}

export const MIN_SAMPLES = 30;
const EPS = 1e-4;

function quantileEdges(ref: number[], bins: number): number[] {
  const s = ref.slice().sort((a, b) => a - b);
  const edges: number[] = [];
  for (let i = 1; i < bins; i++) {
    const q = s[Math.min(s.length - 1, Math.floor((i * s.length) / bins))];
    if (!edges.length || q > edges[edges.length - 1]) edges.push(q);
  }
  return edges;
}

function binCounts(arr: number[], edges: number[]): number[] {
  const c = new Array(edges.length + 1).fill(0);
  for (const v of arr) { let k = 0; while (k < edges.length && v > edges[k]) k++; c[k]++; }
  return c;
}

/** PSI with the small-sample upward bias subtracted: E[PSI | no drift] ≈ (B−1)(1/nRef + 1/nCur). */
export function psiFromCounts(refC: number[], curC: number[]): number {
  const nR = refC.reduce((a, b) => a + b, 0); const nC = curC.reduce((a, b) => a + b, 0);
  let psi = 0;
  for (let i = 0; i < refC.length; i++) {
    const p = Math.max(refC[i] / nR, EPS); const q = Math.max(curC[i] / nC, EPS);
    psi += (q - p) * Math.log(q / p);
  }
  const bias = (refC.length - 1) * (1 / nR + 1 / nC);
  return Math.max(0, psi - bias);
}

export function psiNumeric(ref: number[], cur: number[], bins = 10): number {
  const b = Math.max(3, Math.min(bins, Math.floor(Math.min(ref.length, cur.length) / 10)));
  const edges = quantileEdges(ref, b);
  return psiFromCounts(binCounts(ref, edges), binCounts(cur, edges));
}

/** Two-sample KS statistic with the asymptotic p-value. */
export function ksTwoSample(a: number[], b: number[]): { D: number; p: number } {
  const x = a.slice().sort((p, q) => p - q); const y = b.slice().sort((p, q) => p - q);
  let i = 0; let j = 0; let D = 0;
  while (i < x.length && j < y.length) {
    const v = Math.min(x[i], y[j]);
    while (i < x.length && x[i] <= v) i++;
    while (j < y.length && y[j] <= v) j++;
    D = Math.max(D, Math.abs(i / x.length - j / y.length));
  }
  const ne = (x.length * y.length) / (x.length + y.length);
  const lambda = (Math.sqrt(ne) + 0.12 + 0.11 / Math.sqrt(ne)) * D;
  return { D, p: ksProb(lambda) };
}

function ksProb(lambda: number): number {
  const a2 = -2 * lambda * lambda; let fac = 2; let sum = 0; let prev = 0;
  for (let j = 1; j <= 100; j++) {
    const term = fac * Math.exp(a2 * j * j);
    sum += term;
    if (Math.abs(term) <= 0.001 * prev || Math.abs(term) <= 1e-8 * Math.abs(sum)) return Math.min(1, Math.max(0, sum));
    fac = -fac; prev = Math.abs(term);
  }
  return 1; // did not converge: lambda ≈ 0, i.e. no evidence of difference
}

// ── special functions (chi-square survival, inverse normal) ──
function gammaLn(x: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x; const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5); let ser = 1.000000000190015;
  for (const cj of c) ser += cj / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}
function gammaP(a: number, x: number): number {            // regularised lower incomplete gamma
  if (x <= 0) return 0;
  if (x < a + 1) { let ap = a; let del = 1 / a; let sum = del; for (let n = 0; n < 200; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; } return sum * Math.exp(-x + a * Math.log(x) - gammaLn(a)); }
  let b = x + 1 - a; let c = 1 / 1e-30; let d = 1 / b; let h = d;
  for (let i = 1; i <= 200; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30; c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-12) break; }
  return 1 - Math.exp(-x + a * Math.log(x) - gammaLn(a)) * h;
}
export function chiSquareSf(x: number, df: number): number { return df <= 0 ? 1 : Math.min(1, Math.max(0, 1 - gammaP(df / 2, x / 2))); }

/** Inverse standard-normal CDF (Acklam). */
export function normInv(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - lo) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5; const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

function mean(a: number[]): number { return a.reduce((s, v) => s + v, 0) / a.length; }
function sd(a: number[]): number { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, a.length - 1)); }

export function jensenShannon(p: Map<string, number>, q: Map<string, number>): number {
  const keys = new Set([...p.keys(), ...q.keys()]); let js = 0;
  for (const k of keys) {
    const a = p.get(k) ?? 0; const b = q.get(k) ?? 0; const m = (a + b) / 2;
    if (a > 0) js += 0.5 * a * Math.log2(a / m);
    if (b > 0) js += 0.5 * b * Math.log2(b / m);
  }
  return js; // 0..1
}

function freq(arr: (number | string)[]): Map<string, number> {
  const m = new Map<string, number>(); for (const v of arr) m.set(String(v), (m.get(String(v)) || 0) + 1);
  const n = arr.length; for (const [k, v] of m) m.set(k, v / n); return m;
}

/**
 * A flag needs BOTH a practical effect size (PSI) and statistical corroboration (KS / chi-square p-value). This keeps
 * small-sample PSI noise and tiny-but-significant shifts at large n from raising alarms.
 */
export function classifyDrift(psi: number | null, p: number | null): { status: DriftStatus; reason: string } {
  if (psi === null) return { status: 'INSUFFICIENT_DATA', reason: 'not enough data' };
  const pp = p ?? 0;                                   // no test available → rely on PSI alone
  const tag = `PSI ${psi.toFixed(3)}${p !== null ? `, p=${p < 0.001 ? p.toExponential(1) : p.toFixed(3)}` : ''}`;
  if ((psi >= 0.25 && pp < 0.01) || (pp < 1e-4 && psi >= 0.1)) return { status: 'DRIFT', reason: tag };
  if ((pp < 0.01 && psi >= 0.05) || (psi >= 0.1 && pp < 0.05)) return { status: 'WARN', reason: tag };
  return { status: 'STABLE', reason: tag };
}

export function analyzeDrift(reference: FeatureSet, current: FeatureSet): { features: FeatureDrift[]; overall: DriftStatus; limits: string } {
  const out: FeatureDrift[] = [];
  for (const feature of Object.keys(reference)) {
    const ref = reference[feature]; const cur = current[feature];
    if (!cur) continue;
    const numeric = ref.every(v => typeof v === 'number' && Number.isFinite(v)) && cur.every(v => typeof v === 'number' && Number.isFinite(v));
    const base = { feature, nRef: ref.length, nCur: cur.length };
    if (ref.length < MIN_SAMPLES || cur.length < MIN_SAMPLES) {
      out.push({ ...base, type: numeric ? 'numeric' : 'categorical', psi: null, ksD: null, ksP: null, js: null, meanShiftSd: null, status: 'INSUFFICIENT_DATA', reason: `need ≥ ${MIN_SAMPLES} samples in both windows` });
      continue;
    }
    if (numeric) {
      const r = ref as number[]; const c = cur as number[];
      const psi = psiNumeric(r, c); const ks = ksTwoSample(r, c); const s = sd(r);
      const { status, reason } = classifyDrift(psi, ks.p);
      out.push({ ...base, type: 'numeric', psi, ksD: ks.D, ksP: ks.p, js: null, meanShiftSd: s > 0 ? (mean(c) - mean(r)) / s : null, status, reason });
    } else {
      const fr = freq(ref); const fc = freq(cur);
      const keys = Array.from(new Set([...fr.keys(), ...fc.keys()]));
      const nR = ref.length; const nC = cur.length;
      const psi = psiFromCounts(keys.map(k => Math.round((fr.get(k) ?? 0) * nR)), keys.map(k => Math.round((fc.get(k) ?? 0) * nC)));
      const js = jensenShannon(fr, fc);
      // chi-square test of homogeneity on the pooled table
      let chi = 0; const tot = nR + nC;
      for (const k of keys) { const o1 = (fr.get(k) ?? 0) * nR; const o2 = (fc.get(k) ?? 0) * nC; const e1 = ((o1 + o2) * nR) / tot; const e2 = ((o1 + o2) * nC) / tot; if (e1 > 0) chi += (o1 - e1) ** 2 / e1; if (e2 > 0) chi += (o2 - e2) ** 2 / e2; }
      const chiP = chiSquareSf(chi, keys.length - 1);
      const { status, reason } = classifyDrift(psi, chiP);
      out.push({ ...base, type: 'categorical', psi, ksD: null, ksP: chiP, js, meanShiftSd: null, status, reason: `${reason}, JS ${js.toFixed(3)}` });
    }
  }
  const rank: Record<DriftStatus, number> = { STABLE: 0, INSUFFICIENT_DATA: 0, WARN: 1, DRIFT: 2 };
  const overall = out.reduce<DriftStatus>((w, f) => (rank[f.status] > rank[w] ? f.status : w), out.length && out.every(f => f.status === 'INSUFFICIENT_DATA') ? 'INSUFFICIENT_DATA' : 'STABLE');
  return { features: out, overall, limits: 'PSI is bias-corrected for sample size; thresholds (0.10 warn / 0.25 drift) are industry conventions. Drift shows the data changed, not that the model got worse — confirm with outcome metrics.' };
}

// ── Behaviour features from model responses ──────────────────────────────────

const REFUSAL = /(i\s+(?:can(?:'|no)t|cannot|won't|am\s+unable|am\s+not\s+able)|sorry,?\s+(?:but\s+)?i|unable\s+to\s+(?:comply|help)|against\s+my\s+(?:guidelines|policy)|i\s+must\s+decline)/i;

export interface ResponseRecord { text: string; toolCalls?: number; inputInjectionScore?: number }

export function behaviourFeatures(records: ResponseRecord[]): FeatureSet {
  return {
    response_length: records.map(r => r.text.length),
    refusal: records.map(r => (REFUSAL.test(r.text) ? 1 : 0)),
    contains_email: records.map(r => (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(r.text) ? 1 : 0)),
    contains_url: records.map(r => (/https?:\/\//i.test(r.text) ? 1 : 0)),
    tool_calls: records.map(r => r.toolCalls ?? 0),
    ...(records.some(r => r.inputInjectionScore !== undefined) ? { input_injection_score: records.map(r => r.inputInjectionScore ?? 0) } : {})
  };
}

// ── Fairness ─────────────────────────────────────────────────────────────────

export interface DecisionRecord { group: string; outcome: 0 | 1; label?: 0 | 1 }

export interface GroupStats {
  group: string; n: number; favourable: number; rate: number; ci95: [number, number];
  tpr?: number | null; fpr?: number | null; included: boolean;
}
export interface GroupComparison {
  group: string; reference: string; disparateImpact: number; diCi95: [number, number]; parityDifference: number; z: number; p: number;
  adverseImpactIndicator: boolean; significant: boolean; confidentlyBelow80: boolean;
}
export interface FairnessReport {
  verdict: 'PASS' | 'REVIEW' | 'FAIL' | 'INSUFFICIENT_DATA';
  referenceGroup: string | null; groups: GroupStats[]; comparisons: GroupComparison[];
  equalOpportunityGap: number | null; equalisedOddsGap: number | null; reasons: string[]; limits: string;
}

function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (n === 0) return [0, 1];
  const p = k / n; const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d; const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

/** Standard-normal CDF (Abramowitz–Stegun 7.1.26). */
export function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

function twoPropP(k1: number, n1: number, k2: number, n2: number): { z: number; p: number } {
  const p1 = k1 / n1; const p2 = k2 / n2; const pp = (k1 + k2) / (n1 + n2);
  const se = Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2));
  if (se === 0) return { z: 0, p: 1 };
  const z = (p1 - p2) / se;
  return { z, p: 2 * (1 - normCdf(Math.abs(z))) };
}

export function analyzeFairness(records: DecisionRecord[], opts: { minGroup?: number; referenceGroup?: string } = {}): FairnessReport {
  const minGroup = opts.minGroup ?? MIN_SAMPLES;
  const limits = 'The 4/5ths rule is a US employment-selection heuristic, not an EU legal threshold. Fairness definitions (parity, equal opportunity, calibration) can conflict; satisfying one is not a finding of non-discrimination. Groups below the minimum size are excluded from the verdict.';
  const by = new Map<string, DecisionRecord[]>();
  for (const r of records) { if (!r.group) continue; (by.get(r.group) || by.set(r.group, []).get(r.group)!).push(r); }

  const groups: GroupStats[] = Array.from(by.entries()).map(([group, rs]) => {
    const k = rs.filter(r => r.outcome === 1).length;
    const labelled = rs.filter(r => r.label !== undefined);
    const pos = labelled.filter(r => r.label === 1); const neg = labelled.filter(r => r.label === 0);
    return {
      group, n: rs.length, favourable: k, rate: k / rs.length, ci95: wilson(k, rs.length), included: rs.length >= minGroup,
      tpr: pos.length >= 10 ? pos.filter(r => r.outcome === 1).length / pos.length : null,
      fpr: neg.length >= 10 ? neg.filter(r => r.outcome === 1).length / neg.length : null
    };
  }).sort((a, b) => b.rate - a.rate);

  const eligible = groups.filter(g => g.included);
  if (eligible.length < 2) return { verdict: 'INSUFFICIENT_DATA', referenceGroup: null, groups, comparisons: [], equalOpportunityGap: null, equalisedOddsGap: null, reasons: [`need at least 2 groups with ≥ ${minGroup} decisions`], limits };

  const ref = (opts.referenceGroup && eligible.find(g => g.group === opts.referenceGroup)) || eligible[0];
  const m = eligible.length - 1;
  const alpha = 0.05 / m;                                         // Bonferroni across comparisons with the reference
  const zCrit = normInv(1 - alpha / 2);

  // Omnibus chi-square across ALL eligible groups gates "significant" (the reference is the observed maximum, so
  // pairwise tests against it alone would over-flag under the null).
  const totK = eligible.reduce((x, g) => x + g.favourable, 0); const totN = eligible.reduce((x, g) => x + g.n, 0); const pAll = totK / totN;
  let chi = 0;
  for (const g of eligible) { const e1 = g.n * pAll; const e0 = g.n * (1 - pAll); if (e1 > 0) chi += (g.favourable - e1) ** 2 / e1; if (e0 > 0) chi += ((g.n - g.favourable) - e0) ** 2 / e0; }
  const omnibusP = pAll > 0 && pAll < 1 ? chiSquareSf(chi, eligible.length - 1) : 1;

  const comparisons: GroupComparison[] = eligible.filter(g => g !== ref).map(g => {
    const { z, p } = twoPropP(g.favourable, g.n, ref.favourable, ref.n);
    const di = ref.rate > 0 ? g.rate / ref.rate : 1;
    // CI for the ratio via the delta method on log(DI): is it CONFIDENTLY below 0.8?
    let ci: [number, number] = [0, Infinity];
    if (g.favourable > 0 && ref.favourable > 0) {
      const se = Math.sqrt((1 - g.rate) / (g.n * g.rate) + (1 - ref.rate) / (ref.n * ref.rate));
      ci = [di * Math.exp(-zCrit * se), di * Math.exp(zCrit * se)];
    }
    return { group: g.group, reference: ref.group, disparateImpact: di, diCi95: ci, parityDifference: g.rate - ref.rate, z, p, adverseImpactIndicator: di < 0.8, significant: omnibusP < 0.05 && p < alpha, confidentlyBelow80: ci[1] < 0.8 };
  });

  const tprs = eligible.map(g => g.tpr).filter((v): v is number => typeof v === 'number');
  const fprs = eligible.map(g => g.fpr).filter((v): v is number => typeof v === 'number');
  const eo = tprs.length >= 2 ? Math.max(...tprs) - Math.min(...tprs) : null;
  const eod = eo === null && fprs.length < 2 ? null : Math.max(eo ?? 0, fprs.length >= 2 ? Math.max(...fprs) - Math.min(...fprs) : 0);

  const reasons: string[] = []; const notes: string[] = []; let verdict: FairnessReport['verdict'] = 'PASS';
  for (const c of comparisons) {
    if (c.confidentlyBelow80) { verdict = 'FAIL'; reasons.push(`${c.group}: selection rate is ${(c.disparateImpact * 100).toFixed(0)}% of ${c.reference}'s and the 95% interval (${(c.diCi95[0] * 100).toFixed(0)}–${(c.diCi95[1] * 100).toFixed(0)}%) lies entirely below 80%`); }
    else if (c.adverseImpactIndicator && omnibusP < 0.05) { if (verdict !== 'FAIL') verdict = 'REVIEW'; reasons.push(`${c.group}: ratio ${(c.disparateImpact * 100).toFixed(0)}% is below 80% and groups differ more than chance would usually allow (omnibus p=${omnibusP.toFixed(3)}), but the interval (${(c.diCi95[0] * 100).toFixed(0)}–${(c.diCi95[1] * 100).toFixed(0)}%) includes 80% — collect more data`); }
    else if (c.adverseImpactIndicator) { notes.push(`${c.group}: ratio ${(c.disparateImpact * 100).toFixed(0)}% is below 80% but is within what sampling noise alone commonly produces (omnibus p=${omnibusP.toFixed(2)}).`); }
    else if (c.significant) { if (verdict !== 'FAIL') verdict = 'REVIEW'; reasons.push(`${c.group}: statistically significant difference (p=${c.p.toExponential(1)}) though the ratio (${(c.disparateImpact * 100).toFixed(0)}%) is above 80%`); }
  }
  if (eod !== null && eod > 0.1) { if (verdict === 'PASS') verdict = 'REVIEW'; reasons.push(`error-rate gap across groups is ${(eod * 100).toFixed(0)} percentage points (equalised-odds heuristic 10)`); }
  if (!reasons.length) reasons.push(notes.length ? 'No confirmed disparity.' : 'No group fell below the 4/5ths indicator or differed significantly from the reference group.');
  reasons.push(...notes);
  if (eligible.some(g => g.n < 100)) reasons.push(`Low statistical power: at least one group has fewer than 100 decisions, so a real disparity can go undetected (a PASS here is weak evidence).`);
  return { verdict, referenceGroup: ref.group, groups, comparisons, equalOpportunityGap: eo, equalisedOddsGap: eod, reasons, limits };
}
