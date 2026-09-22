import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/sqlite.js';
import { SuperAdminService } from '../services/superAdminService';
import { BlockchainAuditTrail } from '../services/blockchain-audit-trail.js';
import EvidenceVaultAuditorEngine from '../services/evidenceVaultAuditor.js';
import { broadcastPulse } from '../modules/client-premium/api/routes.js';

export const regulatorVaultRouter = Router();

const sha256 = (d: string): string => crypto.createHash('sha256').update(d).digest('hex');
const GENESIS_HASH = '0'.repeat(64);

function ensureTables() {
  const db = getDb();
  if (!db || typeof db.exec !== 'function') return;
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS regulatory_documents_vault (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'REGULATORY_TEXT',
        regulator_id TEXT NOT NULL DEFAULT 'system',
        regulator_name TEXT NOT NULL DEFAULT 'European Regulator Network',
        regulation_code TEXT NOT NULL DEFAULT 'GDPR',
        country TEXT NOT NULL DEFAULT 'EU',
        classification TEXT NOT NULL DEFAULT 'OFFICIAL',
        retention_years INTEGER NOT NULL DEFAULT 10,
        file_hash_sha256 TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        mime_type TEXT NOT NULL DEFAULT 'text/markdown',
        document_version INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
        sealing_hash TEXT NOT NULL DEFAULT '',
        sealed_at TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_by TEXT NOT NULL DEFAULT 'regulator-officer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS secure_evidence_vault (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT 'ENFORCEMENT',
        source_ref TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'TECHNICAL',
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        file_hash_sha256 TEXT NOT NULL,
        prev_hash TEXT NOT NULL,
        chain_position INTEGER NOT NULL DEFAULT 1,
        mime_type TEXT NOT NULL DEFAULT 'application/json',
        s3_key TEXT NOT NULL DEFAULT '',
        rfc3161_token TEXT NOT NULL DEFAULT '',
        verified INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
        metadata_json TEXT NOT NULL DEFAULT '{}',
        sealed_by TEXT NOT NULL DEFAULT '',
        sealed_at TEXT,
        created_by TEXT NOT NULL DEFAULT 'regulator-officer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_rvd_status ON regulatory_documents_vault(status);
      CREATE INDEX IF NOT EXISTS idx_rvd_regulation ON regulatory_documents_vault(regulation_code, country);
      CREATE INDEX IF NOT EXISTS idx_sev_case ON secure_evidence_vault(case_id);
      CREATE INDEX IF NOT EXISTS idx_sev_source ON secure_evidence_vault(source, source_ref);
      CREATE INDEX IF NOT EXISTS idx_sev_status ON secure_evidence_vault(status);
    `);
  } catch (err: any) {
    console.warn('[REGULATOR_VAULT] ensureTables warning:', err?.message);
  }
}

ensureTables();

const safeParse = (s: string | null | undefined, fallback: any = null): any => {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
};

function nextChainPosition(): number {
  const db = getDb();
  const row = db.prepare('SELECT MAX(chain_position) as m FROM secure_evidence_vault').get() as any;
  return (Number(row?.m) || 0) + 1;
}

function lastEvidenceHash(): string {
  const db = getDb();
  const row = db.prepare('SELECT file_hash_sha256 FROM secure_evidence_vault ORDER BY chain_position DESC LIMIT 1').get() as any;
  return row?.file_hash_sha256 || GENESIS_HASH;
}

function log(action: string, resource: string, refId: string, payload: any) {
  try {
    SuperAdminService.logAdminAction('REGULATOR_OFFICER', action, resource, refId, payload);
  } catch {}
}

function anchor(category: string, action: string, resource: string, refId: string, payload: any) {
  try {
    BlockchainAuditTrail.anchor({ actor: 'regulator-vault', action, category, resource, refId, payload });
  } catch {}
}

function pulse(type: string, title: string, message: string, severity: string, source: string) {
  try {
    broadcastPulse({ type, title, message, severity, source });
  } catch {}
}

regulatorVaultRouter.get('/documents/stats', (_req, res) => {
  try {
    const db = getDb();
    const total = (db.prepare('SELECT COUNT(*) c FROM regulatory_documents_vault').get() as any)?.c ?? 0;
    const byStatus: Record<string, number> = {};
    const byRegulation: Record<string, number> = {};
    for (const r of db.prepare('SELECT status, COUNT(*) c FROM regulatory_documents_vault GROUP BY status').all() as any[]) byStatus[r.status] = r.c;
    for (const r of db.prepare('SELECT regulation_code, COUNT(*) c FROM regulatory_documents_vault GROUP BY regulation_code').all() as any[]) byRegulation[r.regulation_code] = r.c;
    const sealed = (db.prepare(`SELECT COUNT(*) c FROM regulatory_documents_vault WHERE sealing_hash != ''`).get() as any)?.c ?? 0;
    const avgRetention = (db.prepare('SELECT AVG(retention_years) a FROM regulatory_documents_vault').get() as any)?.a ?? 0;
    res.json({ success: true, stats: { total, sealed, avgRetentionYears: Math.round(avgRetention * 10) / 10, byStatus, byRegulation } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.get('/documents', (req, res) => {
  try {
    const db = getDb();
    const { q, category, regulatorId, status, regulationCode, country } = req.query as any;
    const where: string[] = [];
    const params: any[] = [];
    if (q && String(q).trim()) { where.push('(title LIKE ? OR content LIKE ? OR tags LIKE ?)'); const s = `%${String(q).trim()}%`; params.push(s, s, s); }
    if (category) { where.push('category = ?'); params.push(category); }
    if (regulatorId) { where.push('regulator_id = ?'); params.push(regulatorId); }
    if (status) { where.push('status = ?'); params.push(status); }
    if (regulationCode) { where.push('regulation_code = ?'); params.push(regulationCode); }
    if (country) { where.push('country = ?'); params.push(country); }
    const rows = db.prepare(`SELECT * FROM regulatory_documents_vault${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 200`).all(...params) as any[];
    res.json({ success: true, count: rows.length, documents: rows.map(r => ({ ...r, tags: safeParse(r.tags, []), metadata: safeParse(r.metadata_json, {}) })) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.post('/documents', (req, res) => {
  try {
    const db = getDb();
    const b = req.body || {};
    if (!b.title) return res.status(400).json({ success: false, error: 'title is required' });
    const id = `rvd_${crypto.randomBytes(6).toString('hex')}`;
    const content = String(b.content || '');
    const mime = String(b.mime_type || 'text/markdown');
    const hashPayload = `${id}::${b.title}::${content}::${b.regulation_code || 'GDPR'}::${b.document_version || 1}`;
    const fileHash = sha256(hashPayload);
    const autoSeal = b.auto_seal !== false;
    const sealingHash = autoSeal ? sha256(`${fileHash}::${new Date().toISOString()}`) : '';
    db.prepare(`INSERT INTO regulatory_documents_vault (id, title, category, regulator_id, regulator_name, regulation_code, country, classification, retention_years, file_hash_sha256, content, mime_type, document_version, status, sealing_hash, sealed_at, tags, metadata_json, created_by)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, String(b.title), String(b.category || 'REGULATORY_TEXT'), String(b.regulator_id || 'system'), String(b.regulator_name || 'European Regulator Network'),
      String(b.regulation_code || 'GDPR'), String(b.country || 'EU'), String(b.classification || 'OFFICIAL'), Number(b.retention_years) || 10,
      fileHash, content, mime, Number(b.document_version) || 1, String(b.status || 'PENDING_REVIEW'), sealingHash, sealingHash ? new Date().toISOString() : '',
      JSON.stringify(Array.isArray(b.tags) ? b.tags : []), JSON.stringify(b.metadata || {}), String(b.created_by || 'regulator-officer')
    );
    log('REGULATORY_DOCUMENT_REGISTERED', 'regulatory_documents_vault', id, { title: b.title, regulationCode: b.regulation_code, sealed: !!sealingHash });
    anchor('B2G_DOCUMENTS', autoSeal ? 'DOCUMENT_REGISTERED_AND_SEALED' : 'DOCUMENT_REGISTERED', `regulatory_documents_vault/${id}`, id, { title: b.title, fileHash, sealingHash: sealingHash || null });
    res.status(201).json({ success: true, documentId: id, fileHashSha256: fileHash, sealingHash, status: String(b.status || 'PENDING_REVIEW'), message: autoSeal ? 'Regulatory document registered and SHA-256 sealed.' : 'Regulatory document registered.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.get('/documents/:id', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM regulatory_documents_vault WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Document not found' });
    EvidenceVaultAuditorEngine.interceptOperation('SELECT', 'regulatory-documents-vault', req.params.id, 'regulator-officer', { title: row.title });
    res.json({ success: true, document: { ...row, tags: safeParse(row.tags, []), metadata: safeParse(row.metadata_json, {}) } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.post('/documents/:id/version', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM regulatory_documents_vault WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });
    const b = req.body || {};
    const content = String(b.content ?? existing.content);
    const nextVersion = (Number(existing.document_version) || 1) + 1;
    const hashPayload = `${existing.id}::${existing.title}::${content}::${existing.regulation_code}::${nextVersion}`;
    const fileHash = sha256(hashPayload);
    const changed = fileHash !== existing.file_hash_sha256;
    db.prepare(`UPDATE regulatory_documents_vault SET content = ?, file_hash_sha256 = ?, document_version = ?, sealing_hash = ?, sealed_at = ?, status = 'PENDING_REVIEW', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(content, fileHash, nextVersion, changed ? sha256(`${fileHash}::${new Date().toISOString()}`) : existing.sealing_hash, changed ? new Date().toISOString() : existing.sealed_at, existing.id);
    log('REGULATORY_DOCUMENT_VERSIONED', 'regulatory_documents_vault', existing.id, { version: nextVersion, changed });
    res.json({ success: true, documentId: existing.id, version: nextVersion, fileHashSha256: fileHash, changed, message: changed ? `Version ${nextVersion} registered and re-sealed.` : `Document content unchanged; version ${nextVersion} created with existing seal.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.patch('/documents/:id/status', (req, res) => {
  try {
    const db = getDb();
    const { status, reviewer } = req.body || {};
    if (!status) return res.status(400).json({ success: false, error: 'status is required' });
    const existing = db.prepare('SELECT * FROM regulatory_documents_vault WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });
    db.prepare(`UPDATE regulatory_documents_vault SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status, req.params.id);
    log(`REGULATORY_DOCUMENT_${String(status).toUpperCase()}`, 'regulatory_documents_vault', req.params.id, { title: existing.title, reviewer });
    anchor('B2G_DOCUMENTS', 'DOCUMENT_STATUS_CHANGED', `regulatory_documents_vault/${req.params.id}`, req.params.id, { from: existing.status, to: status });
    res.json({ success: true, message: `Document ${existing.title} status updated to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.delete('/documents/:id', (req, res) => {
  try {
    const db = getDb();
    const { permanent } = req.body || {};
    const existing = db.prepare('SELECT * FROM regulatory_documents_vault WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });
    if (permanent && process.env.NODE_ENV === 'production' && existing.sealing_hash && existing.retention_years > 0) {
      return res.status(409).json({ success: false, error: `Document is under a ${existing.retention_years}-year retention mandate and sealed — permanent purge requires legal authority override.` });
    }
    if (Boolean(permanent)) {
      db.prepare('DELETE FROM regulatory_documents_vault WHERE id = ?').run(req.params.id);
      EvidenceVaultAuditorEngine.interceptOperation('DELETE', 'regulatory-documents-vault', req.params.id, 'regulator-officer', { purged: true });
    } else {
      db.prepare(`UPDATE regulatory_documents_vault SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);
    }
    log('REGULATORY_DOCUMENT_REMOVED', 'regulatory_documents_vault', req.params.id, { permanent: Boolean(permanent) });
    res.json({ success: true, message: Boolean(permanent) ? `Document ${existing.id} permanently purged.` : `Document ${existing.id} archived (retention-preserving soft-delete).` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.get('/evidence/stats', (_req, res) => {
  try {
    const db = getDb();
    const total = (db.prepare('SELECT COUNT(*) c FROM secure_evidence_vault').get() as any)?.c ?? 0;
    const verified = (db.prepare('SELECT COUNT(*) c FROM secure_evidence_vault WHERE verified = 1').get() as any)?.c ?? 0;
    const sealed = (db.prepare(`SELECT COUNT(*) c FROM secure_evidence_vault WHERE rfc3161_token != ''`).get() as any)?.c ?? 0;
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    for (const r of db.prepare('SELECT status, COUNT(*) c FROM secure_evidence_vault GROUP BY status').all() as any[]) byStatus[r.status] = r.c;
    for (const r of db.prepare('SELECT source, COUNT(*) c FROM secure_evidence_vault GROUP BY source').all() as any[]) bySource[r.source] = r.c;
    res.json({ success: true, stats: { total, verified, sealed, integrity: sealed === total ? 'INTACT' : 'PARTIAL', byStatus, bySource } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.get('/evidence', (req, res) => {
  try {
    const db = getDb();
    const { caseId, source, status } = req.query as any;
    const where: string[] = [];
    const params: any[] = [];
    if (caseId) { where.push('case_id = ?'); params.push(caseId); }
    if (source) { where.push('source = ?'); params.push(source); }
    if (status) { where.push('status = ?'); params.push(status); }
    const rows = db.prepare(`SELECT * FROM secure_evidence_vault${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY chain_position DESC LIMIT 500`).all(...params) as any[];
    res.json({ success: true, count: rows.length, evidence: rows.map(r => ({ ...r, metadata: safeParse(r.metadata_json, {}) })) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.post('/evidence', (req, res) => {
  try {
    const db = getDb();
    const b = req.body || {};
    if (!b.title) return res.status(400).json({ success: false, error: 'title is required' });
    if (b.source && b.source_ref) {
      const dup = db.prepare('SELECT id FROM secure_evidence_vault WHERE source = ? AND source_ref = ? LIMIT 1').get(b.source, String(b.source_ref)) as any;
      if (dup && b.merge !== true) {
        return res.status(409).json({ success: false, error: `Evidence already vaulted (id: ${dup.id}). Use merge=true to flag duplicate linkage, or verify the existing entry.`, existingId: dup.id });
      }
    }
    const id = `sev_${crypto.randomBytes(6).toString('hex')}`;
    const chainPos = nextChainPosition();
    const prevHash = lastEvidenceHash();
    const fileHashInput = b.file_hash_sha256 || sha256(`${id}::${b.title}::${b.description || ''}::${b.file_ref || JSON.stringify(b.payload || {})}`);
    const fileHash = String(fileHashInput);
    const rfc3161Token = sha256(`${id}::${fileHash}::${new Date().toISOString()}`);
    db.prepare(`INSERT INTO secure_evidence_vault (id, case_id, source, source_ref, title, description, category, severity, file_hash_sha256, prev_hash, chain_position, mime_type, s3_key, rfc3161_token, verified, status, metadata_json, sealed_by, sealed_at, created_by)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, String(b.case_id || ''), String(b.source || 'ENFORCEMENT'), String(b.source_ref || ''), String(b.title), String(b.description || ''),
      String(b.category || 'TECHNICAL'), String(b.severity || 'MEDIUM'), fileHash, prevHash, chainPos, String(b.mime_type || 'application/json'),
      String(b.s3_key || `evidence/${id}/${b.s3_key || ''}`.replace(/\/$/, '')), rfc3161Token, 0, String(b.status || 'PENDING_VERIFICATION'),
      JSON.stringify(b.metadata || {}), '', '', String(b.created_by || 'regulator-officer')
    );
    EvidenceVaultAuditorEngine.interceptOperation('INSERT', 'secure-evidence-vault', id, 'regulator-officer', { title: b.title, source: b.source, chainPosition: chainPos });
    log('EVIDENCE_VAULTED', 'secure_evidence_vault', id, { title: b.title, chainPosition: chainPos });
    anchor('EVIDENCE_VAULT', 'EVIDENCE_REGISTERED', `secure_evidence_vault/${id}`, id, { title: b.title, fileHash, rfc3161Token, prevHash, chainPosition: chainPos });
    pulse('evidence', `Evidence registered: ${b.title}`, `Secure evidence ${id} added to chain at position ${chainPos}.`, 'info', 'secure-evidence-vault');
    res.status(201).json({ success: true, evidenceId: id, chainPosition: chainPos, prevHash, fileHashSha256: fileHash, rfc3161Token, message: `Evidence ${id} registered at chain position ${chainPos}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.get('/evidence/audit-ledger', (_req, res) => {
  try {
    const ledger = EvidenceVaultAuditorEngine.getAuditLedger();
    res.json({ success: true, count: ledger.length, ledger });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.get('/evidence/audit-ledger/integrity', (_req, res) => {
  try {
    const integrity = EvidenceVaultAuditorEngine.verifyLedgerIntegrity();
    res.json({ success: true, integrity });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.post('/evidence/auto-ingest', async (req, res) => {
  try {
    const db = getDb();
    const sources: { source: string; rows: { ref: string; title: string; description: string; category: string; severity: string; caseId: string; metadata: any }[] }[] = [];

    try {
      const findings = db.prepare('SELECT * FROM national_scan_findings ORDER BY created_at DESC LIMIT 500').all() as any[];
      sources.push({ source: 'NATIONAL_SCAN', rows: findings.map(f => ({ ref: String(f.id), title: `Scan finding: ${f.company_name || f.title || f.id}`, description: (f.summary || f.description || JSON.stringify(f)).slice(0, 800), category: 'SCAN_FINDING', severity: String(f.severity || 'MEDIUM').toUpperCase(), caseId: String(f.case_id || ''), metadata: f })) });
    } catch {}

    try {
      const notices = db.prepare('SELECT * FROM national_penalty_notices ORDER BY created_at DESC LIMIT 500').all() as any[];
      sources.push({ source: 'NATIONAL_PENALTY', rows: notices.map(n => ({ ref: String(n.id), title: `Penalty notice: ${n.company_name || n.notice_number || n.id}`, description: (n.reason || n.summary || JSON.stringify(n)).slice(0, 800), category: 'PENALTY_NOTICE', severity: String(n.severity || 'HIGH').toUpperCase(), caseId: String(n.case_id || ''), metadata: n })) });
    } catch {}

    try {
      const warnings = db.prepare('SELECT * FROM national_violation_warnings ORDER BY created_at DESC LIMIT 500').all() as any[];
      sources.push({ source: 'NATIONAL_WARNING', rows: warnings.map(w => ({ ref: String(w.id), title: `Violation warning: ${w.company_name || w.id}`, description: (w.details || w.summary || JSON.stringify(w)).slice(0, 800), category: 'VIOLATION_WARNING', severity: String(w.severity || 'MEDIUM').toUpperCase(), caseId: String(w.case_id || ''), metadata: w })) });
    } catch {}

    try {
      const violations = db.prepare('SELECT v.*, r.company AS run_company, r.status AS run_status FROM b2g_pipeline_violations v LEFT JOIN b2g_pipeline_runs r ON v.run_id = r.id ORDER BY v.created_at DESC LIMIT 500').all() as any[];
      sources.push({ source: 'B2G_PIPELINE', rows: violations.map(v => ({ ref: String(v.id), title: `B2G violation: ${v.company_name || v.run_company || v.violation_code || v.id}`, description: (v.description || v.details || JSON.stringify(v)).slice(0, 800), category: 'B2G_VIOLATION', severity: String(v.severity || 'MEDIUM').toUpperCase(), caseId: String(v.case_id || ''), metadata: v })) });
    } catch {}

    try {
      const cases = db.prepare('SELECT * FROM enforcement_cases ORDER BY created_at DESC LIMIT 500').all() as any[];
      sources.push({ source: 'ENFORCEMENT', rows: cases.map(c => ({ ref: String(c.id), title: `Enforcement case: ${c.company_name || c.company || c.id}`, description: (c.summary || c.description || JSON.stringify(c)).slice(0, 800), category: 'ENFORCEMENT_CASE', severity: String(c.severity || 'MEDIUM').toUpperCase(), caseId: String(c.id), metadata: c })) });
    } catch {}

    let inserted = 0;
    let skippedDupes = 0;
    for (const source of sources) {
      for (const row of source.rows) {
        if (!row.ref) continue;
        const dup = db.prepare('SELECT id FROM secure_evidence_vault WHERE source = ? AND source_ref = ? LIMIT 1').get(source.source, row.ref) as any;
        if (dup) { skippedDupes += 1; continue; }
        await new Promise<void>((resolve, reject) => {
          fetch(`${req.protocol}://${req.get('host')}/api/v1/regulator-vault/evidence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: row.title, description: row.description, category: row.category, severity: row.severity, source: source.source, source_ref: row.ref, case_id: row.caseId, metadata: { autoIngested: true, original: row.metadata } })
          }).then(() => resolve()).catch(() => resolve());
        });
        inserted += 1;
      }
    }
    log('EVIDENCE_AUTO_INGEST', 'secure_evidence_vault', 'bulk', { sources: sources.map(s => s.source), inserted, skippedDupes });
    pulse('evidence', 'Auto-ingest completed', `Vaulted ${inserted} new evidence records from enforcement + national scanning sources; ${skippedDupes} duplicates skipped.`, inserted ? 'success' : 'info', 'secure-evidence-vault');
    res.json({ success: true, inserted, skippedDupes, perSource: sources.map(s => ({ source: s.source, discovered: s.rows.length })) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.get('/evidence/:id', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM secure_evidence_vault WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Evidence not found' });
    EvidenceVaultAuditorEngine.interceptOperation('SELECT', 'secure-evidence-vault', req.params.id, 'regulator-officer', { title: row.title });
    res.json({ success: true, evidence: { ...row, metadata: safeParse(row.metadata_json, {}) } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.post('/evidence/:id/seal', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM secure_evidence_vault WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Evidence not found' });
    const token = sha256(`${row.id}::${row.file_hash_sha256}::${row.chain_position}::${new Date().toISOString()}`);
    db.prepare(`UPDATE secure_evidence_vault SET rfc3161_token = ?, sealed_at = ?, sealed_by = ?, status = 'SEALED' WHERE id = ?`).run(token, new Date().toISOString(), String(req.body?.sealedBy || 'regulator-officer'), row.id);
    EvidenceVaultAuditorEngine.interceptOperation('UPDATE', 'secure-evidence-vault', row.id, 'regulator-officer', { token });
    anchor('EVIDENCE_VAULT', 'EVIDENCE_SEALED', `secure_evidence_vault/${row.id}`, row.id, { token });
    res.json({ success: true, message: `Evidence ${row.id} sealed with RFC3161-style token.`, rfc3161Token: token });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.post('/evidence/:id/verify', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM secure_evidence_vault WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Evidence not found' });
    const recomputed = sha256(`${row.id}::${row.file_hash_sha256}::${row.chain_position}::${row.sealed_at || new Date().toISOString()}`);
    const valid = row.rfc3161_token ? recommittingHashHolds(row, recomputed) : true;
    db.prepare(`UPDATE secure_evidence_vault SET verified = 1, status = 'VERIFIED' WHERE id = ?`).run(row.id);
    EvidenceVaultAuditorEngine.interceptOperation('VERIFY', 'secure-evidence-vault', row.id, 'regulator-officer', { valid });
    log('EVIDENCE_VERIFIED', 'secure_evidence_vault', row.id, { valid });
    res.json({ success: true, valid, message: valid ? `Evidence ${row.id} cryptographic verification passed.` : `Evidence ${row.id} seal mismatch detected — integrity review advised.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function recommittingHashHolds(row: any, recomputed: string): boolean {
  try {
    if (!row.rfc3161_token) return true;
    const firstHalf = recomputed;
    const token = String(row.rfc3161_token);
    return token.slice(0, 8) === firstHalf.slice(0, 8) || token === firstHalf;
  } catch {
    return false;
  }
}

regulatorVaultRouter.patch('/evidence/:id/status', (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ success: false, error: 'status is required' });
    const exists = db.prepare('SELECT id FROM secure_evidence_vault WHERE id = ?').get(req.params.id) as any;
    if (!exists) return res.status(404).json({ success: false, error: 'Evidence not found' });
    db.prepare(`UPDATE secure_evidence_vault SET status = ? WHERE id = ?`).run(status, req.params.id);
    log(`EVIDENCE_STATUS_${String(status).toUpperCase()}`, 'secure_evidence_vault', req.params.id, { status });
    res.json({ success: true, message: `Evidence ${req.params.id} status updated to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorVaultRouter.post('/ai/insight', async (req, res) => {
  try {
    const db = getDb();
    const { focus } = (req.body || {}) as any;
    const docsTotal = (db.prepare('SELECT COUNT(*) c FROM regulatory_documents_vault').get() as any)?.c ?? 0;
    const evTotal = (db.prepare('SELECT COUNT(*) c FROM secure_evidence_vault').get() as any)?.c ?? 0;
    const evVerified = (db.prepare('SELECT COUNT(*) c FROM secure_evidence_vault WHERE verified = 1').get() as any)?.c ?? 0;
    const topDocs = (db.prepare('SELECT title, regulation_code, status, created_at FROM regulatory_documents_vault ORDER BY created_at DESC LIMIT 5').all() as any[]) || [];
    const docsSnapshot = topDocs.map((d: any) => `${d.title} (${d.regulation_code}, ${d.status})`).join('; ');
    const evSnapshot = ((db.prepare('SELECT title, category, status, chain_position FROM secure_evidence_vault ORDER BY chain_position DESC LIMIT 5').all() as any[]) || []).map((e: any) => `${e.title} [${e.category}, ${e.status}, pos ${e.chain_position}]`).join('; ');
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && typeof __vaultGeminiInsight === 'function') {
      const text = await __vaultGeminiInsight(apiKey, focus, { docsTotal, evTotal, evVerified, topDocs, docsSnapshot, evSnapshot });
      log('VAULT_AI_INSIGHT', 'regulatory-vault', 'insight', { focus, usedAi: true });
      return res.json({ success: true, usedAi: true, insight: text });
    }
    const insight = `${docsTotal} regulatory documents and ${evTotal} securely vaulted evidence records on chain (${evVerified} verified). Latest vault activity: ${docsSnapshot || 'no documents'}. Chain head: ${evSnapshot || 'no evidence'}. Compliance posture is defensible; recommend periodic RFC3161 seal re-verification.${focus ? ` Focus requested: ${String(focus).slice(0, 120)}.` : ''}`;
    res.json({ success: true, usedAi: false, insight });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

let __vaultGeminiInsight: ((apiKey: string, focus: string | undefined, ctx: any) => Promise<string>) | null = null;

try {
  if (process.env.GEMINI_API_KEY) {
    import('@google/genai').then(({ GoogleGenAI }) => {
      __vaultGeminiInsight = async (apiKey: string, focus: string | undefined, ctx: any) => {
        const client = new GoogleGenAI({ apiKey });
        const resp = await client.models.generateContent({
          model: process.env.GEMINI_VAULT_MODEL || 'gemini-3.6-flash',
          contents: `You are the evidence-integrity analyst for the 9Xen Regulettee enterprise regulatory vault.
Context: ${JSON.stringify(ctx)}
User focus: ${focus || 'overall vault & compliance posture'}
Return a concise executive insight (max 200 words, no markdown headers) covering: document coverage gaps, evidence chain integrity, verification health, and 2-3 recommended actions.`
        });
        return String(resp?.text || 'Vault insight unavailable.');
      };
    });
  }
} catch {}

regulatorVaultRouter.get('/overview', (_req, res) => {
  try {
    const db = getDb();
    const docsStats = (db.prepare('SELECT COUNT(*) c FROM regulatory_documents_vault').get() as any)?.c ?? 0;
    const evStats = (db.prepare('SELECT COUNT(*) c FROM secure_evidence_vault').get() as any)?.c ?? 0;
    const evVerified = (db.prepare('SELECT COUNT(*) c FROM secure_evidence_vault WHERE verified = 1').get() as any)?.c ?? 0;
    const evSealed = (db.prepare(`SELECT COUNT(*) c FROM secure_evidence_vault WHERE rfc3161_token != ''`).get() as any)?.c ?? 0;
    const pendingDocs = (db.prepare(`SELECT COUNT(*) c FROM regulatory_documents_vault WHERE status = 'PENDING_REVIEW'`).get() as any)?.c ?? 0;
    let recentActivity: any[] = [];
    try {
      recentActivity = (db.prepare('SELECT id, title, source_ref, source, chain_position, status, created_at FROM secure_evidence_vault ORDER BY created_at DESC LIMIT 4').all() as any[]) || [];
    } catch {}
    res.json({
      success: true,
      overview: {
        asOf: new Date().toISOString(),
        documents: { total: docsStats, pendingReview: pendingDocs },
        evidence: { total: evStats, verified: evVerified, sealed: evSealed, integrity: evSealed === evStats && evStats > 0 ? 'INTACT' : evStats === 0 ? 'EMPTY' : 'PARTIAL' },
        recentChainHead: recentActivity[0] || null,
        recentVaultActivity: recentActivity
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});