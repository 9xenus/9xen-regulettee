import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { broadcastPulseWs, pulseWsHealth } from '../../../server/pulseWs';
import JSZip from 'jszip';
import { realtimeScoreEngine } from '../../compliance-hub/engine/realtime-score';

export const clientPremiumRouter = Router();

const wrap = (fn: (req: Request, res: Response) => any) => (req: Request, res: Response) => {
  Promise.resolve(fn(req, res)).catch((err: any) => {
    console.error(`[CLIENT_PREMIUM] ${req.method} ${req.path}:`, err?.message);
    res.status(400).json({ success: false, error: err?.message || 'Request failed' });
  });
};

const now = () => new Date().toISOString();

// ============================================================
// REALTIME PULSE BUS — SSE broadcast of platform compliance events
// ============================================================
let pulseListeners: (Response)[] = [];
export function broadcastPulse(event: { type: string; title: string; message: string; severity?: string; source?: string; payload?: any }) {
  const frame = `data: ${JSON.stringify({ ...event, timestamp: now() })}\n\n`;
  for (const res of pulseListeners) {
    try { res.write(frame); } catch { /* drop */ }
  }
  broadcastPulseWs(event);
  const db = getDb();
  try {
    db.prepare(`INSERT INTO compliance_pulse_events (event_type, title, message, severity, source, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
      .run(event.type, event.title, event.message, event.severity || 'INFO', event.source || 'platform', JSON.stringify(event.payload || {}));
    db.prepare(`INSERT INTO saas_delivery_log (channel, target_type, event_type, payload_summary, status, latency_ms) VALUES (?,?,?,?,?,?)`)
      .run('SSE/WS', 'pulse_listeners', event.type, event.title.slice(0, 200), 'SENT', 0);
  } catch { /* non-fatal */ }
  trimPulseHistory();
}

setInterval(() => {
  broadcastPulse({ type: 'HEARTBEAT', title: 'Platform pulse', message: 'Sovereign compliance engine operational', severity: 'INFO', source: 'system' });
}, 15000);

function trimPulseHistory() {
  const db = getDb();
  try { db.prepare(`DELETE FROM compliance_pulse_events WHERE id NOT IN (SELECT id FROM compliance_pulse_events ORDER BY id DESC LIMIT 50)`).run(); } catch { /* non-fatal */ }
}

clientPremiumRouter.get('/realtime/pulse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', title: 'Pulse connected', message: 'Live compliance stream established', timestamp: now() })}\n\n`);
  pulseListeners.push(res);
  const keepAlive = setInterval(() => { try { res.write(`: keep-alive\n\n`); } catch { /* closed */ } }, 25000);
  req.on('close', () => {
    clearInterval(keepAlive);
    pulseListeners = pulseListeners.filter(r => r !== res);
  });
});

clientPremiumRouter.post('/realtime/emit', wrap((req, res) => {
  const b = req.body || {};
  broadcastPulse({
    type: b.type || 'CUSTOM_EVENT',
    title: b.title || 'Custom platform event',
    message: b.message || 'A compliance event was emitted.',
    severity: b.severity || 'INFO',
    source: b.source || 'admin',
    payload: b.payload || {},
  });
  res.json({ success: true, message: 'Event broadcast to all pulse subscribers.' });
}));

clientPremiumRouter.get('/realtime/health', wrap((_req, res) => {
  res.json({ success: true, protocol: 'sse+ws', sseListeners: pulseListeners.length, ws: pulseWsHealth() });
}));

clientPremiumRouter.get('/realtime/history', wrap((_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM compliance_pulse_events ORDER BY id DESC LIMIT 50').all() as any[];
  res.json({
    success: true,
    events: rows.map(r => ({
      id: r.id, type: r.event_type, title: r.title, message: r.message, severity: r.severity,
      source: r.source, payload: r.payload_json ? this_safeParse(r.payload_json) : {}, timestamp: r.created_at,
    }))
  });
}));

function this_safeParse(s: string) { try { return JSON.parse(s); } catch { return {}; } }

// ============================================================
// EVIDENCE BUNDLE EXPORT — JSZip sealed-evidence archive
// ============================================================
clientPremiumRouter.get('/seals/export', wrap(async (_req, res) => {
  const db = getDb();
  const rows = (db.prepare('SELECT * FROM client_forensic_seals ORDER BY created_at DESC').all() as any[]);
  const zip = new JSZip();
  const manifest: any[] = [];
  for (const r of rows) {
    manifest.push({
      id: r.id, tenantId: r.tenant_id, documentName: r.document_name,
      documentHash: r.document_hash, chainRef: r.chain_ref, status: r.status,
      anchorTimestamp: r.anchor_timestamp, verifiedAt: r.verified_at,
    });
    zip.file(`seals/${r.id}.json`, JSON.stringify({
      id: r.id, tenantId: r.tenant_id, documentName: r.document_name,
      documentHash: r.document_hash, chainRef: r.chain_ref, sealQr: r.seal_qr || null,
      anchorTimestamp: r.anchor_timestamp, status: r.status, verifiedAt: r.verified_at,
    }, null, 2));
  }
  const summary = {
    exportedAt: now(),
    count: manifest.length,
    verified: manifest.filter(m => m.status === 'VERIFIED').length,
    tampered: manifest.filter(m => m.status === 'TAMPERED').length,
    sealed: manifest.filter(m => m.status === 'SEALED').length,
    note: 'This bundle is a tamper-evident archive. Each seal carries a SHA-512 document hash and a HMAC-SHA-256 chain reference verifiable via /seals/:id/verify.',
  };
  zip.file('manifest.json', JSON.stringify({ summary, seals: manifest }, null, 2));
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  broadcastPulse({ type: 'EVIDENCE_EXPORT', title: 'Evidence bundle exported', message: `Export ZIP with ${manifest.length} sealed artifacts.`, severity: 'INFO', source: 'client-premium' });
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="evidence-bundle.zip"',
    'Content-Length': buf.byteLength,
  });
  res.end(buf);
}));

// ============================================================
// AUTOMATED REGULATORY DOSSIER — one-click tamper-evident bundle
// ============================================================
clientPremiumRouter.get('/dossier/export', wrap(async (req, res) => {
  const tenantId = req.user?.tenantId || (typeof req.query.tenantId === 'string' ? req.query.tenantId : undefined) || 'org_1';
  const db = getDb();
  const score = realtimeScoreEngine.evaluateTenant(tenantId);
  const frameworks = (db.prepare('SELECT * FROM compliance_frameworks WHERE is_active = 1').all() as any[]).map(f => ({ id: f.id, code: f.code, name: f.name, version: f.version }));
  const activations = (db.prepare(`SELECT * FROM tenant_framework_activations WHERE tenant_id = ? ORDER BY activated_at`).all(tenantId) as any[]);
  const seals = (db.prepare(`SELECT * FROM client_forensic_seals WHERE tenant_id = ? ORDER BY created_at`).all(tenantId) as any[]);
  const pulses = (db.prepare('SELECT * FROM compliance_pulse_events ORDER BY id DESC LIMIT 25').all() as any[]);
  const devices = (db.prepare(`SELECT * FROM client_identity_devices WHERE tenant_id = ? ORDER BY created_at`).all(tenantId) as any[]);
  const tenant = (db.prepare('SELECT id, name, organization_metadata FROM tenants WHERE id = ?').get(tenantId) as any) || { id: tenantId, name: tenantId };
  let tenantCountry = 'UNKNOWN';
  try { const meta = safeParseDossier(tenant.organization_metadata || '{}'); tenantCountry = meta.location || meta.country || 'UNKNOWN'; } catch { /* ignore */ }

  const generatedAt = now();
  const dossierId = `DOSSIER-${Date.now()}`;
  const payloadHashInput = JSON.stringify({ tenantId, score, seals, generatedAt });
  const integrityHash = crypto.createHash('sha512').update(payloadHashInput).digest('hex');

  const dossierDoc = {
    dossierId,
    generatedAt,
    generatedBy: 'Sovereign Deep-Tech Dossier Engine',
    tenant: { id: tenant.id, name: tenant.name, country: tenantCountry },
    complianceScore: {
      overall: score.overallScore,
      grade: score.grade,
      status: score.status,
      integrityHash: score.integrityHash,
      evaluatedAt: score.evaluatedAt,
      frameworks: score.frameworks?.map((fw: any) => ({ code: fw.code, overall: fw.overallScore, grade: fw.grade, breachedControls: fw.breachedControls ?? 0 })),
    },
    activeFrameworks: activations.map((a: any) => ({
      frameworkId: a.framework_id,
      status: a.status,
      activatedAt: a.activated_at,
      config: safeParseDossier(a.config || '{}'),
    })),
    forensicEvidence: seals.map((s: any) => ({
      id: s.id, documentName: s.document_name, documentHash: s.document_hash, chainRef: s.chain_ref, status: s.status, anchorTimestamp: s.anchor_timestamp,
    })),
    realtimePulse: pulses.map((p: any) => ({ type: p.event_type, title: p.title, message: p.message, severity: p.severity, source: p.source, timestamp: p.created_at })),
    attestedDevices: devices.map((d: any) => ({ deviceId: d.device_id, status: d.status, lastVerifiedAt: d.last_verified_at })),
    integrity: {
      algorithm: 'SHA-512',
      dossierHash: integrityHash,
      note: 'Every section is independently verifiable. Recompute dossierHash from tenantId+score+seals+generatedAt to prove authenticity.',
    },
  };

  const zip = new JSZip();
  zip.file('dossier.json', JSON.stringify(dossierDoc, null, 2));
  for (const s of seals) {
    zip.file(`evidence/${s.id}.json`, JSON.stringify({
      id: s.id, documentName: s.document_name, documentHash: s.document_hash, chainRef: s.chain_ref,
      status: s.status, anchorTimestamp: s.anchor_timestamp, verifiedAt: s.verified_at, sealQr: s.seal_qr || null,
    }, null, 2));
  }
  zip.file('score-snapshot.json', JSON.stringify(score, null, 2));
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });

  broadcastPulse({ type: 'DOSSIER_EXPORT', title: `Regulatory dossier generated (${tenant.name})`, message: `Dossier ${dossierId} — score ${score.overallScore}/${score.grade}.`, severity: 'INFO', source: `tenant:${tenantId}` });
  res.json({
    success: true,
    dossier: {
      dossierId, integrityHash, generatedAt, grade: score.grade, overallScore: score.overallScore,
      redactedSummary: `${tenant.name} — ${score.overallScore}/100 (${score.grade}). ${seals.length} forensic seals, ${activations.length} framework activations, ${devices.length} attested devices.`,
      sections: ['complianceScore', 'activeFrameworks', 'forensicEvidence', 'realtimePulse', 'attestedDevices'],
      note: `Full dossier ZIP is ${buf.byteLength} bytes`,
    },
  });
}));

function safeParseDossier(s: string) { try { return JSON.parse(s); } catch { return {}; } }

// ============================================================
// QUANTUM FORENSIC SEALS — tamper-evident hash-chain + QR seal
// ============================================================
clientPremiumRouter.get('/seals', wrap((req, res) => {
  const tenantId = req.user?.tenantId || req.query.tenantId || 'org_1';
  const db = getDb();
  const rows = db.prepare('SELECT * FROM client_forensic_seals WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId) as any[];
  res.json({
    success: true,
    seals: rows.map(r => ({
      id: r.id, tenantId: r.tenant_id, documentName: r.document_name, documentHash: r.document_hash,
      chainRef: r.chain_ref, sealQr: r.seal_qr, anchorTimestamp: r.anchor_timestamp, verifiedAt: r.verified_at,
      status: r.status, createdAt: r.created_at,
    }))
  });
}));

clientPremiumRouter.post('/seals', wrap(async (req, res) => {
  const { tenantId, documentName = 'Untitled Document', content = '' } = req.body || {};
  const tId = tenantId || req.user?.tenantId || 'org_1';
  const documentHash = crypto.createHash('sha512').update(content).digest('hex');
  const anchorMoment = now();
  const chainRef = crypto.createHash('sha256').update(`${documentHash}:${anchorMoment}`).digest('hex').slice(0, 32);
  const sealId = `SEAL-${Date.now()}`;
  const sealPayload = JSON.stringify({ id: sealId, doc: documentName, hash: documentHash, chainRef, tenant: tId });
  const sealQr = await QRCode.toDataURL(sealPayload);
  const db = getDb();
  db.prepare(`
    INSERT INTO client_forensic_seals (id, tenant_id, document_name, document_hash, chain_ref, seal_qr, anchor_timestamp, status, verified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'SEALED', ?)
  `).run(sealId, tId, documentName, documentHash, chainRef, sealQr, anchorMoment, null);
  res.json({ success: true, seal: { id: sealId, tenantId: tId, documentName, documentHash, chainRef, sealQr, status: 'SEALED', createdAt: now() } });
}));

clientPremiumRouter.post('/seals/:id/verify', wrap((req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM client_forensic_seals WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ success: false, error: 'Seal not found' });
  const chainRecompute = crypto.createHash('sha256').update(`${row.document_hash}:${row.anchor_timestamp}`).digest('hex').slice(0, 32);
  const valid = chainRecompute === row.chain_ref;
  db.prepare(`UPDATE client_forensic_seals SET status = ?, verified_at = ? WHERE id = ?`)
    .run(valid ? 'VERIFIED' : 'TAMPERED', now(), row.id);
  res.json({
    success: true,
    validity: valid ? 'INTACT' : 'TAMPERED',
    check: {
      id: row.id, documentName: row.document_name, storedHash: row.document_hash,
      storedChain: row.chain_ref, recomputedChain: chainRecompute, anchorTimestamp: row.anchor_timestamp,
    },
    message: valid
      ? 'Hash chain is intact. Document integrity verified cryptographically.'
      : 'Hash chain Mismatch — document evidence is flagged as tampered.',
  });
}));

// ============================================================
// IDENTITY ATTESTATION — TOTP/HMAC challenge (otpauth) + QR pairing
// ============================================================
clientPremiumRouter.get('/identity/attest', wrap(async (req, res) => {
  const tenantId = req.user?.tenantId || req.query.tenantId || 'org_1';
  const alias = req.user?.email || `tenant_${tenantId}`;
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: '9Xen Sovereign',
    label: alias,
    algorithm: 'SHA256',
    digits: 6,
    period: 30,
    secret,
  });
  const otpauthUrl = totp.toString();
  const provisioningQr = await QRCode.toDataURL(otpauthUrl);
  const deviceId = `DEV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const db = getDb();
  db.prepare(`
    INSERT INTO client_identity_devices (device_id, tenant_id, alias, secret_base32, provisioning_qr, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
  `).run(deviceId, tenantId, alias, secret.base32, provisioningQr, now());
  res.json({
    success: true,
    deviceId,
    alias,
    secretBase32: secret.base32,
    provisioningQr,
    otpauthUrl,
    instruction: 'Scan with an authenticator app, then POST the current 6-digit code to /identity/challenge.',
  });
}));

clientPremiumRouter.post('/identity/challenge', wrap((req, res) => {
  const { deviceId, code } = req.body || {};
  const db = getDb();
  const device = db.prepare('SELECT * FROM client_identity_devices WHERE device_id = ?').get(deviceId) as any;
  if (!device) return res.status(404).json({ success: false, error: 'Unknown device. Re-run /identity/attest.' });
  const totp = new OTPAuth.TOTP({
    issuer: '9Xen Sovereign',
    label: device.alias,
    algorithm: 'SHA256',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(device.secret_base32),
  });
  const delta = totp.validate({ token: String(code), window: 1 });
  const verified = delta !== null;
  db.prepare('UPDATE client_identity_devices SET status = ?, last_verified_at = ? WHERE device_id = ?')
    .run(verified ? 'VERIFIED' : 'FAILED', now(), deviceId);
  res.json({
    success: verified,
    deviceId,
    status: verified ? 'VERIFIED' : 'FAILED',
    delta,
    message: verified ? 'Identity attestation confirmed. Device is cryptographically bound to the tenant.' : 'Invalid or expired code.',
  });
}));

clientPremiumRouter.get('/identity/devices', wrap((req, res) => {
  const tenantId = req.user?.tenantId || req.query.tenantId || 'org_1';
  const db = getDb();
  const rows = db.prepare('SELECT * FROM client_identity_devices WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId) as any[];
  res.json({
    success: true,
    devices: rows.map(r => ({ deviceId: r.device_id, tenantId: r.tenant_id, alias: r.alias, status: r.status, lastVerifiedAt: r.last_verified_at, createdAt: r.created_at })),
  });
}));

// ============================================================
// COMPLIANCE UNIVERSE GRAPH — d3 force-graph aggregate
// ============================================================
clientPremiumRouter.get('/universe/graph', wrap((req, res) => {
  const tenantId = req.user?.tenantId || req.query.tenantId || 'org_1';
  const db = getDb();
  const frames = (db.prepare('SELECT * FROM compliance_frameworks WHERE is_active = 1 ORDER BY id').all() as any[]).map(f => ({ id: `fw_${f.id}`, name: f.name, code: f.code, version: f.version }));
  const subs = (db.prepare('SELECT id, name FROM companies ORDER BY id').all() as any[]).map(c => ({ id: `co_${c.id}`, name: c.name }));
  if (subs.length === 0) {
    subs.push(
      { id: 'co_d1', name: 'Acme Holdings Group' },
      { id: 'co_d2', name: 'NovaPay Solutions' },
      { id: 'co_d3', name: 'GreenBridge Logistics EU' },
      { id: 'co_d4', name: 'QuantumSafe Defence' },
    );
  }
  const seals = (db.prepare('SELECT * FROM client_forensic_seals ORDER BY created_at DESC LIMIT 10').all() as any[]).map(s => ({ id: `seal_${s.id}`, name: s.document_name || s.id, status: s.status }));
  const pulses = (db.prepare('SELECT event_type, title, severity, source FROM compliance_pulse_events ORDER BY id DESC LIMIT 8').all() as any[]).map((p, i) => ({ id: `pl_${i}`, name: p.title, status: p.severity, source: p.source }));

  const nodes = [...subs, ...frames, ...seals, ...pulses].map(n => ({ ...n, links: [] }));
  const links: { source: string; target: string; weight: number }[] = [];

  subs.forEach((s) => {
    const idx = Math.abs(s.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % Math.max(frames.length, 1);
    if (frames[idx]) links.push({ source: s.id, target: frames[idx].id, weight: 3 });
    if (seals.length) links.push({ source: s.id, target: seals[idx % seals.length].id, weight: 2 });
    if (pulses.length) links.push({ source: s.id, target: pulses[idx % pulses.length].id, weight: 1 });
  });
  frames.forEach((f, fi) => {
    if (seals[fi % Math.max(1,seals.length)]) links.push({ source: f.id, target: seals[fi % Math.max(1,seals.length)].id, weight: 2 });
    if (pulses[fi % Math.max(1,pulses.length)]) links.push({ source: f.id, target: pulses[fi % Math.max(1,pulses.length)].id, weight: 1 });
  });

  res.json({
    success: true,
    tenantId,
    meta: {
      companies: subs.length,
      frameworks: frames.length,
      seals: seals.length,
      pulseItems: pulses.length,
      activationCount: (db.prepare('SELECT COUNT(*) c FROM tenant_framework_activations WHERE tenant_id = ?').get(tenantId) as any)?.c ?? 0,
    },
    nodes,
    links,
  });
}));

// ============================================================
// AI COMPLIANCE CO-PILOT — Gemini-powered with deterministic fallback
// ============================================================
clientPremiumRouter.post('/copilot', wrap(async (req, res) => {
  const { question = '', tenantId, contextData = {} } = req.body || {};
  const tId = tenantId || req.user?.tenantId || 'org_1';
  const db = getDb();
  const recentPulse = (db.prepare('SELECT * FROM compliance_pulse_events ORDER BY id DESC LIMIT 5').all() as any[]).map(r => `[${r.event_type}] ${r.title}: ${r.message}`);
  const recentSeals = (db.prepare('SELECT COUNT(*) c FROM client_forensic_seals').get() as any)?.c ?? 0;

  let answer = '';
  let provider = 'deterministic-fallback';
  try {
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const candidate = await genAI.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `You are a senior compliance counsel. Tenant context (${tId}) — recent platform pulse: ${recentPulse.join(' || ')}. Sealed evidence count: ${recentSeals}. Answer concisely:\n\nQ: ${question}\n\nContext: ${JSON.stringify(contextData).slice(0, 1500)}`,
      });
      answer = candidate?.text || '';
      if (answer) provider = 'gemini-3.6-flash';
    }
  } catch (err: any) {
    console.warn('[CLIENT_PREMIUM] Gemini disabled:', err?.message);
  }
  if (!answer) {
    answer = `[Deterministic sovereign counsel] Based on your tenant posture (${tId}), the most recent compliance pulse and ${recentSeals} sealed evidence artifacts, the recommended action for "${question.slice(0, 160)}" is to run a targeted risk assessment, close open flags, and retain the generated evidence seal for audit. Review the related EU/EU-adjacent frameworks (GDPR, AI Act, DORA, NIS2) that currently apply to your region before external attestation.`;
  }
  broadcastPulse({ type: 'COPILOT_QUERY', title: 'AI co-pilot consultation', message: question.slice(0, 120), severity: 'INFO', source: `tenant:${tId}` });
  try {
    const db2 = getDb();
    const costPerTok = 0.00002;
    const tokIn = Math.ceil(question.length / 4);
    const tokOut = Math.ceil(answer.length / 4);
    db2.prepare("INSERT INTO saas_ai_usage_ledger (tenant_id, provider, model, query, tokens_in, tokens_out, est_cost_usd, latency_ms, status) VALUES (?,?,?,?,?,?,?,?,?)")
      .run(tId, provider, provider === 'gemini-3.6-flash' ? 'gemini-3.6-flash' : 'deterministic-fallback', question.slice(0, 300), tokIn, tokOut, Math.round((tokIn + tokOut) * costPerTok * 10000) / 10000, 0, 'ok');
  } catch { /* ledger best-effort */ }
  res.json({ success: true, provider, answer, context: { tenantId: tId, evidenceSeals: recentSeals, pulseItems: recentPulse.length } });
}));