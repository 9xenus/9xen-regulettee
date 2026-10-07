/**
 * DECISION TRACE + CONTENT PROVENANCE (pure logic; storage lives in the repository/store layer)
 *
 * Decision trace: a tamper-evident, hash-chained record of what the AI gateway DID with a request (which policy
 * rules fired, tools requested, human review) — stores digests, not raw prompts. The explanation describes the
 * SAFEGUARDS applied. It is NOT an explanation of the model's internal reasoning, and says so.
 *
 * Provenance: a signed manifest registry for AI-generated content that passed through the platform (the same idea
 * as C2PA manifests): exact-match by content hash, plus MinHash similarity to recognise lightly edited copies.
 * LIMITS: absence of a record does NOT mean content is human-written; text can be rewritten to evade similarity;
 * no robust watermark is claimed.
 */
import crypto from 'node:crypto';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
export const digest = (s: string) => sha256(s);

// ── Decision trace ───────────────────────────────────────────────────────────

export interface TraceDecision { rule: string; action: string; reason: string }
export interface TraceCore {
  traceId: string; tenantId: string; systemId: string; seq: number; prevHash: string | null;
  inputHash: string; outputHash: string; modelId: string; policyVersion: string;
  status: string; riskScore: number; decisions: TraceDecision[]; toolCalls: string[]; createdAt: string;
}

export function canonicalTrace(c: TraceCore): string {
  return JSON.stringify([c.traceId, c.tenantId, c.systemId, c.seq, c.prevHash, c.inputHash, c.outputHash, c.modelId, c.policyVersion, c.status, c.riskScore, c.decisions.map(d => [d.rule, d.action, d.reason]), c.toolCalls, c.createdAt]);
}
export const traceHash = (c: TraceCore) => sha256(canonicalTrace(c));

const ACTION_RISK: Record<string, number> = { BLOCK: 90, FLAG: 55, REDACT: 35, ALLOW: 0 };
export function riskFromDecisions(decisions: TraceDecision[]): number {
  return decisions.reduce((m, d) => Math.max(m, ACTION_RISK[d.action] ?? 0), 0);
}

export interface Explanation {
  summary: string;
  factors: { rule: string; effect: string; reason: string }[];
  humanOversight: string;
  yourRights: string;
  limits: string;
}

const EFFECT: Record<string, string> = { BLOCK: 'caused the request to be blocked', FLAG: 'flagged the request for human review', REDACT: 'removed sensitive data before processing', ALLOW: 'was checked and raised no concern' };
const RULE_LABEL: Record<string, string> = {
  PROMPT_INJECTION: 'prompt-injection screening', JAILBREAK: 'jailbreak screening', SECRET_DETECTION: 'credential detection', PII_REDACTION: 'personal-data protection',
  DATA_CLASSIFICATION: 'data classification', TOKEN_BUDGET: 'usage budget', POLICY_ENGINE: 'tool-use policy', KILL_SWITCH: 'emergency kill switch',
  OUTPUT_LEAK: 'output leak check', OUTPUT_VALIDATION: 'output validation', GROUNDING: 'grounding check', SYSTEM_PROMPT: 'system-prompt integrity', TOOL_CALL: 'tool-call validation'
};

export function explainDecision(core: TraceCore, review?: { reviewer: string; decision: string; at: string } | null): Explanation {
  const significant = core.decisions.filter(d => d.action !== 'ALLOW');
  const factors = (significant.length ? significant : core.decisions.slice(0, 3)).map(d => ({
    rule: d.rule, effect: EFFECT[d.action] ?? d.action.toLowerCase(), reason: `${RULE_LABEL[d.rule] ?? d.rule}: ${d.reason}`
  }));
  const status = core.status;
  const summary =
    status === 'BLOCKED' ? `The request was blocked. ${significant.filter(d => d.action === 'BLOCK').map(d => RULE_LABEL[d.rule] ?? d.rule).join(', ') || 'A safeguard'} stopped it before any response was produced.`
    : status === 'REDACTED' ? 'The request was processed after sensitive personal data was removed from it.'
    : status === 'FLAGGED' ? `The request was allowed but flagged for human review because of: ${significant.map(d => RULE_LABEL[d.rule] ?? d.rule).join(', ')}.`
    : 'No safeguard restricted this request.';
  const needsReview = status === 'FLAGGED' || status === 'BLOCKED' || core.toolCalls.length > 0;
  return {
    summary,
    factors,
    humanOversight: review ? `A human reviewer (${review.reviewer}) recorded the decision "${review.decision}" on ${review.at}.`
      : needsReview ? 'No human review has been recorded for this decision yet.' : 'Human review was not required by policy for this request.',
    yourRights: 'If an AI-assisted decision affects you, you can ask for a meaningful explanation and for human review (EU AI Act Art. 86; GDPR Art. 22). Quote this trace ID when you ask.',
    limits: 'This explains the safeguards the AI gateway applied. It does not explain the internal reasoning of the underlying model.'
  };
}

export function verifyChain(rows: { core: TraceCore; storedHash: string }[]): { valid: boolean; checked: number; firstBadSeq: number | null; reason: string | null } {
  let prev: string | null = null;
  for (const r of rows) {
    if (r.core.prevHash !== prev) return { valid: false, checked: rows.indexOf(r), firstBadSeq: r.core.seq, reason: 'chain link broken (a trace was removed, reordered or inserted)' };
    if (traceHash(r.core) !== r.storedHash) return { valid: false, checked: rows.indexOf(r), firstBadSeq: r.core.seq, reason: 'trace content does not match its recorded hash (modified after recording)' };
    prev = r.storedHash;
  }
  return { valid: true, checked: rows.length, firstBadSeq: null, reason: null };
}

// ── Provenance ───────────────────────────────────────────────────────────────

export const normalizeText = (t: string) => t.normalize('NFKC').replace(/[\u200b-\u200f\u2060\ufeff]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
export const contentHash = (t: string) => sha256(normalizeText(t));

const K = 64; const SHINGLE = 5;
const SEEDS = Array.from({ length: K }, (_, i) => (Math.imul(i + 1, 0x9E3779B1) ^ 0x85EBCA6B) >>> 0);

function fnv1a(s: string): number { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
function mix(h: number, seed: number): number { let x = (h ^ seed) >>> 0; x = Math.imul(x ^ (x >>> 16), 0x85EBCA6B); x = Math.imul(x ^ (x >>> 13), 0xC2B2AE35); return (x ^ (x >>> 16)) >>> 0; }

export function minhash(text: string): number[] | null {
  const words = normalizeText(text).split(' ').filter(Boolean);
  if (words.length < 8) return null;                                   // too short for a meaningful similarity estimate
  const sh = new Set<number>();
  for (let i = 0; i + SHINGLE <= words.length; i++) sh.add(fnv1a(words.slice(i, i + SHINGLE).join(' ')));
  const sig = new Array(K).fill(0xFFFFFFFF);
  for (const h of sh) for (let k = 0; k < K; k++) { const v = mix(h, SEEDS[k]); if (v < sig[k]) sig[k] = v; }
  return sig;
}
export const jaccardEstimate = (a: number[], b: number[]): number => { let eq = 0; for (let i = 0; i < K; i++) if (a[i] === b[i]) eq++; return eq / K; };
export const encodeMinhash = (m: number[]) => m.map(x => x.toString(36)).join(',');
export const decodeMinhash = (s: string): number[] => s.split(',').map(x => parseInt(x, 36));

export interface ManifestCore { manifestId: string; tenantId: string; systemId: string; contentHash: string; minhash: string | null; model: string; label: string; createdAt: string }
export const canonicalManifest = (m: ManifestCore) => JSON.stringify([m.manifestId, m.tenantId, m.systemId, m.contentHash, m.minhash, m.model, m.label, m.createdAt]);

export const DISCLOSURE_LABEL = 'This content was generated with the assistance of an AI system.';
export function embedSnippets(manifestId: string) {
  return {
    html: `<meta name="ai-generated" content="true"><meta name="ai-provenance-id" content="${manifestId}">`,
    visibleLabel: DISCLOSURE_LABEL,
    note: 'EU AI Act Art. 50(2) asks for machine-readable marking and Art. 50(4) for visible disclosure of deepfakes/public-interest text. Metadata can be stripped; the signed registry is what makes a claim verifiable.'
  };
}

export type ProvenanceStatus = 'VERIFIED_AI_GENERATED' | 'MODIFIED_COPY' | 'TAMPERED_RECORD' | 'NO_PROVENANCE_RECORD';
export function matchProvenance(
  text: string,
  manifests: { core: ManifestCore; signatureValid: boolean }[],
  similarityThreshold = 0.4
): { status: ProvenanceStatus; manifestId: string | null; similarity: number | null; detail: string } {
  const h = contentHash(text);
  const exact = manifests.find(m => m.core.contentHash === h);
  if (exact) return exact.signatureValid
    ? { status: 'VERIFIED_AI_GENERATED', manifestId: exact.core.manifestId, similarity: 1, detail: `Matches a signed record created ${exact.core.createdAt} by ${exact.core.model}.` }
    : { status: 'TAMPERED_RECORD', manifestId: exact.core.manifestId, similarity: 1, detail: 'A record exists but its signature does not verify (altered record or changed signing key).' };
  const mh = minhash(text);
  if (mh) {
    let best: { id: string; sim: number; ok: boolean } | null = null;
    for (const m of manifests) { if (!m.core.minhash) continue; const sim = jaccardEstimate(mh, decodeMinhash(m.core.minhash)); if (!best || sim > best.sim) best = { id: m.core.manifestId, sim, ok: m.signatureValid }; }
    if (best && best.sim >= similarityThreshold && best.ok) return { status: 'MODIFIED_COPY', manifestId: best.id, similarity: parseFloat(best.sim.toFixed(2)), detail: `Resembles a signed AI-generated record (estimated ${Math.round(best.sim * 100)}% overlap) but has been edited.` };
  }
  return { status: 'NO_PROVENANCE_RECORD', manifestId: null, similarity: null, detail: 'No matching record. This does NOT show the content is human-written — it may come from another system or have been rewritten.' };
}
