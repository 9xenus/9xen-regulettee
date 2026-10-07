/**
 * EVIDENCE BUNDLES — tamper-evident record of each scan.
 *
 * Each scan's findings become Merkle-tree leaves; the root is HMAC-signed and chained to the tenant's previous
 * bundle. Verifying recomputes the tree from the findings CURRENTLY in the database, so any later edit, deletion
 * or insertion is detected and reported.
 *
 * What this proves: integrity and ordering of what THIS platform recorded (HMAC with a server-held key).
 * What it does NOT prove: that the scan was complete, or third-party non-repudiation — anchor the root to an
 * external timestamping service / ledger if you need that. The key source is reported in every bundle.
 */
import crypto from 'node:crypto';
import {
  listAiRiskFindings, insertEvidenceBundle, getEvidenceBundle, latestEvidenceBundle, getEvidenceByHash, type EvidenceRow
} from '../db/ai-risk-repository';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

function signingKey(): { key: string; source: 'EVIDENCE_HMAC_KEY' | 'APP_SECRET' | 'DEV_FALLBACK' } {
  if (process.env.EVIDENCE_HMAC_KEY) return { key: process.env.EVIDENCE_HMAC_KEY, source: 'EVIDENCE_HMAC_KEY' };
  if (process.env.APP_SECRET && process.env.APP_SECRET !== 'CHANGE_ME_TO_32_CHAR_RANDOM_SECRET') return { key: process.env.APP_SECRET, source: 'APP_SECRET' };
  if (process.env.NODE_ENV === 'production') throw new Error('EVIDENCE_HMAC_KEY or APP_SECRET must be set to seal evidence in production');
  return { key: 'dev-only-evidence-key', source: 'DEV_FALLBACK' };
}

const hmac = (key: string, data: string) => crypto.createHmac('sha256', key).update(data).digest('hex');

function merkleRoot(leaves: string[]): string {
  if (!leaves.length) return sha256('EMPTY');
  let level = leaves.slice();
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) next.push(sha256(level[i] + (level[i + 1] ?? level[i])));
    level = next;
  }
  return level[0];
}

interface LeafSource { id: string; title: string; severity: string; article_reference: string; affected_code_or_prompt: string | null }
const leafHash = (f: LeafSource) => sha256(JSON.stringify([f.id, f.title, f.severity, f.article_reference, f.affected_code_or_prompt ?? '']));

export interface SealedBundle {
  bundleId: string; scanId: string; tenantId: string; merkleRoot: string; previousBundleHash: string | null; bundleHash: string;
  signature: string; leafCount: number; sealedAt: string; keySource: string;
}

export interface VerifyResult {
  valid: boolean; scanId: string; checkedAt: string; leafCount: number; keySource?: string;
  reasons: string[];
  tamper: { changed: string[]; missing: string[]; added: string[] };
}

export class EvidenceBundle {
  static seal(tenantId: string, scanId: string): SealedBundle {
    if (getEvidenceBundle(scanId, tenantId)) throw new Error('This scan has already been sealed');
    const rows = listAiRiskFindings(scanId, tenantId, 5000).filter(f => f.audit_id === scanId && f.tenant_id === tenantId).sort((a, b) => a.id.localeCompare(b.id));
    const leaves = rows.map(leafHash);
    const root = merkleRoot(leaves);
    const prev = latestEvidenceBundle(tenantId);
    const sealedAt = new Date().toISOString();
    const { key, source } = signingKey();
    const bundleHash = sha256([root, scanId, tenantId, prev?.bundle_hash ?? 'GENESIS', sealedAt].join('|'));
    const signature = hmac(key, bundleHash);
    const bundleId = `EVB-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    insertEvidenceBundle({
      id: bundleId, tenantId, scanId, merkleRoot: root, previousHash: prev?.bundle_hash ?? null, bundleHash, signature,
      leafCount: leaves.length, sealedAt, keySource: source,
      leaves: rows.map((f, i) => ({ id: f.id, hash: leaves[i] }))
    });
    return { bundleId, scanId, tenantId, merkleRoot: root, previousBundleHash: prev?.bundle_hash ?? null, bundleHash, signature, leafCount: leaves.length, sealedAt, keySource: source };
  }

  static verify(tenantId: string, scanId: string): VerifyResult {
    const checkedAt = new Date().toISOString();
    const b: EvidenceRow | undefined = getEvidenceBundle(scanId, tenantId);
    if (!b) return { valid: false, scanId, checkedAt, leafCount: 0, reasons: ['No sealed bundle exists for this scan'], tamper: { changed: [], missing: [], added: [] } };

    const stored: { id: string; hash: string }[] = JSON.parse(b.leaves_json || '[]');
    const rows = listAiRiskFindings(scanId, tenantId, 5000).filter(f => f.audit_id === scanId && f.tenant_id === tenantId).sort((a, b2) => a.id.localeCompare(b2.id));
    const now = new Map(rows.map(r => [r.id, leafHash(r)]));
    const was = new Map(stored.map(l => [l.id, l.hash]));
    const changed: string[] = []; const missing: string[] = []; const added: string[] = [];
    for (const [id, h] of was) { if (!now.has(id)) missing.push(id); else if (now.get(id) !== h) changed.push(id); }
    for (const id of now.keys()) if (!was.has(id)) added.push(id);

    const reasons: string[] = [];
    if (changed.length) reasons.push(`${changed.length} finding(s) were modified after sealing`);
    if (missing.length) reasons.push(`${missing.length} finding(s) were deleted after sealing`);
    if (added.length) reasons.push(`${added.length} finding(s) were added after sealing`);

    const recomputedRoot = merkleRoot(rows.map(leafHash));
    if (recomputedRoot !== b.merkle_root) reasons.push('Merkle root no longer matches the stored findings');

    const { key } = (() => { try { return signingKey(); } catch { return { key: '' }; } })();
    const expectedHash = sha256([b.merkle_root, scanId, tenantId, b.previous_hash ?? 'GENESIS', b.sealed_at].join('|'));
    if (expectedHash !== b.bundle_hash) reasons.push('Bundle hash does not match its recorded inputs');
    const expectedSig = key ? hmac(key, b.bundle_hash) : '';
    const sigOk = !!key && expectedSig.length === b.signature.length && crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(b.signature));
    if (!sigOk) reasons.push('Signature invalid (record altered, or the signing key has changed since sealing)');

    if (b.previous_hash) {
      const prev = getEvidenceByHash(tenantId, b.previous_hash);
      if (!prev) reasons.push('Previous bundle in the chain is missing');
    }
    return { valid: reasons.length === 0, scanId, checkedAt, leafCount: rows.length, keySource: b.key_source, reasons, tamper: { changed, missing, added } };
  }
}


/** Shared platform signing (HMAC-SHA256 with the same key source as evidence bundles). */
export function signPayload(data: string): { signature: string; keySource: string } {
  const { key, source } = signingKey();
  return { signature: hmac(key, data), keySource: source };
}
export function verifyPayload(data: string, signature: string): boolean {
  try {
    const { key } = signingKey(); const expected = hmac(key, data);
    return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch { return false; }
}
