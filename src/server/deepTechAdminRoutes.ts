import express from 'express';
import crypto from 'crypto';
import { getDb } from '../db/sqlite';
import { SuperAdminService } from '../services/superAdminService';
import { requireAuthRoles } from '../middleware/auth.js';
import { adminRateLimiter } from './rateLimitingMiddleware.js';
import { broadcastPulse } from '../modules/client-premium/api/routes';
import { pulseWsHealth } from './pulseWs';

export const deepTechAdminRouter = express.Router();

deepTechAdminRouter.use(requireAuthRoles(['ADMIN', 'SUPER_ADMIN']));
deepTechAdminRouter.use(adminRateLimiter);

const safeParse = (s: string) => { try { return JSON.parse(s); } catch { return {}; } };

// ----------------------------------------------------
// REALTIME PULSE — platform broadcast + live status
// ----------------------------------------------------
deepTechAdminRouter.get('/pulse/status', (_req, res) => {
  try {
    const db = getDb();
    const rows = (db.prepare('SELECT * FROM compliance_pulse_events ORDER BY id DESC LIMIT 50').all() as any[]).map(r => ({
      id: r.id, type: r.event_type, title: r.title, message: r.message, severity: r.severity,
      source: r.source, payload: safeParse(r.payload_json || '{}'), timestamp: r.created_at,
    }));
    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const e of rows) { bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1; byType[e.type] = (byType[e.type] || 0) + 1; }
    res.json({ success: true, transport: { protocol: 'sse+ws', sseClients: 0, ws: pulseWsHealth() }, summary: { totalEvents: rows.length, bySeverity, byType }, events: rows.slice(0, 25) });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

deepTechAdminRouter.post('/pulse/broadcast', (req, res) => {
  try {
    const { type, title, message, severity, source } = req.body || {};
    if (!message) return res.status(400).json({ success: false, error: 'message is required' });
    const evt = {
      type: type || 'ADMIN_BROADCAST',
      title: title || 'Platform broadcast',
      message,
      severity: severity || 'INFO',
      source: source || `super-admin:${req.user?.userId || 'unknown'}`,
    };
    broadcastPulse(evt);
    SuperAdminService.logAdminAction('SUPER_ADMIN', 'PULSE_ADMIN_BROADCAST', `Pulse broadcast: ${new Date().toISOString()} — ${title}`, evt.type);
    res.json({ success: true, message: 'Broadcast pushed to all SSE + WS pulse subscribers.', event: evt });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ----------------------------------------------------
// SECTOR PACK & FRAMEWORK OVERSIGHT (platform-wide)
// ----------------------------------------------------
deepTechAdminRouter.get('/packs', (_req, res) => {
  try {
    const db = getDb();
    const frames = (db.prepare('SELECT * FROM compliance_frameworks ORDER BY id').all() as any[]);
    const activations = (db.prepare('SELECT tf.*, t.name AS tenant_name FROM tenant_framework_activations tf LEFT JOIN tenants t ON t.id = tf.tenant_id ORDER BY tf.id DESC').all() as any[]);
    const fwById: Record<string, any> = {};
    for (const f of frames) fwById[f.id] = f;
    const packStats = new Map<string, { frameworkId: number; activations: any[] }>();
    for (const a of activations) {
      const fw = fwById[a.framework_id];
      const key = fw ? fw.code : String(a.framework_id);
      if (!packStats.has(key)) packStats.set(key, { frameworkId: a.framework_id, activations: [] });
      packStats.get(key)!.activations.push({ tenantId: a.tenant_id, tenantName: a.tenant_name, status: a.status, activatedAt: a.activated_at, config: safeParse(a.config || '{}') });
    }

    // Module registry from pack loader
    let moduleTotal = 0;
    try {
      const loaded = db.prepare("SELECT COUNT(*) c FROM compliance_modules").get() as any;
      moduleTotal = loaded?.c ?? 0;
    } catch { moduleTotal = 0; }

    res.json({
      success: true,
      summary: {
        frameworks: frames.length,
        frameworkModules: moduleTotal,
        activated: packStats.size,
        totalActivations: activations.length,
      },
      packs: frames.map(f => ({
        id: f.id, code: f.code, name: f.name, version: f.version, description: f.description, isActive: f.is_active,
        activations: ((packStats.get(f.code) || packStats.get(String(f.id)) || { activations: [] }).activations),
      })),
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ----------------------------------------------------
// FORENSIC SEAL REGISTRY (platform-wide evidence vault)
// ----------------------------------------------------
deepTechAdminRouter.get('/seals', (_req, res) => {
  try {
    const db = getDb();
    const rows = (db.prepare('SELECT * FROM client_forensic_seals ORDER BY created_at DESC LIMIT 100').all() as any[]);
    const byStatus: Record<string, number> = {};
    const byTenant: Record<string, number> = {};
    for (const r of rows) { byStatus[r.status] = (byStatus[r.status] || 0) + 1; byTenant[r.tenant_id] = (byTenant[r.tenant_id] || 0) + 1; }
    res.json({
      success: true,
      summary: { totalSeals: rows.length, byStatus, byTenant },
      seals: rows.map(r => ({ id: r.id, tenantId: r.tenant_id, documentName: r.document_name, documentHash: r.document_hash, chainRef: r.chain_ref, status: r.status, anchorTimestamp: r.anchor_timestamp, verifiedAt: r.verified_at })),
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

deepTechAdminRouter.post('/seals/:id/verify', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM client_forensic_seals WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Seal not found' });
    const recompute = crypto.createHash('sha256').update(`${row.document_hash}:${row.anchor_timestamp}`).digest('hex').slice(0, 32);
    const valid = recompute === row.chain_ref;
    db.prepare('UPDATE client_forensic_seals SET status = ?, verified_at = ? WHERE id = ?').run(valid ? 'VERIFIED' : 'TAMPERED', new Date().toISOString(), row.id);
    SuperAdminService.logAdminAction('SUPER_ADMIN', 'SEAL_VERIFIED', `Forensic seal ${row.id} verified → ${valid ? 'INTACT' : 'TAMPERED'}`, row.tenant_id);
    res.json({ success: true, validity: valid ? 'INTACT' : 'TAMPERED', message: valid ? 'Hash chain intact.' : 'Hash chain mismatch — tampered.' });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ----------------------------------------------------
// IDENTITY ATTESTATION DEVICE REGISTRY (platform-wide)
// ----------------------------------------------------
deepTechAdminRouter.get('/identity/devices', (_req, res) => {
  try {
    const db = getDb();
    const rows = (db.prepare('SELECT * FROM client_identity_devices ORDER BY created_at DESC LIMIT 100').all() as any[]);
    const byStatus: Record<string, number> = {};
    for (const r of rows) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    res.json({
      success: true,
      summary: { totalDevices: rows.length, byStatus },
      devices: rows.map(r => ({ deviceId: r.device_id, tenantId: r.tenant_id, alias: r.alias, status: r.status, lastVerifiedAt: r.last_verified_at, createdAt: r.created_at })),
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ----------------------------------------------------
// LAWYER / CONSULTANT OPS OVERSIGHT
// ----------------------------------------------------
deepTechAdminRouter.get('/lawyer', (_req, res) => {
  try {
    const db = getDb();
    const professionals = (db.prepare('SELECT * FROM lawyer_professionals').all() as any[]);
    const consultations = (db.prepare('SELECT * FROM lawyer_consultations').all() as any[]);
    const directives = (db.prepare('SELECT * FROM lawyer_directives').all() as any[]);
    const opinions = (db.prepare('SELECT * FROM lawyer_opinion_letters').all() as any[]);
    const invoices = (db.prepare('SELECT * FROM lawyer_invoices').all() as any[]);
    const avgSla = consultations.length > 0 ? (consultations.reduce((sum, c) => sum + (c.sla_score || 0), 0) / consultations.length).toFixed(1) : '0.0';
    res.json({
      success: true,
      summary: {
        professionals: professionals.length,
        verified: professionals.filter(p => p.status === 'VERIFIED').length,
        consultations: consultations.length,
        directives: directives.length,
        opinions: opinions.length,
        invoices: invoices.length,
        avgSlaPercent: avgSla,
      },
      professionals: professionals.slice(0, 10).map(p => ({ id: p.id, name: p.name, specialty: p.specialty, jurisdiction: p.jurisdiction, status: p.status, rating: p.rating })),
      consultations: consultations.slice(0, 10).map(c => ({ id: c.id, professional: c.professional_name, sessionType: c.session_type, status: c.status, scheduledAt: c.scheduled_at, slaScore: c.sla_score })),
      directives: directives.slice(0, 10).map(d => ({ id: d.id, title: d.title, status: d.status, assignee: d.assignee })),
      opinions: opinions.slice(0, 10).map(o => ({ id: o.id, reference: o.reference, clientName: o.client_name, status: o.status })),
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ----------------------------------------------------
// DEEP-TECH EFFECTIVE HEALTH AGGREGATE (platform-wide)
// ----------------------------------------------------
deepTechAdminRouter.get('/health', (_req, res) => {
  try {
    const db = getDb();
    const seals = (db.prepare('SELECT COUNT(*) c FROM client_forensic_seals').get() as any)?.c ?? 0;
    const tampered = (db.prepare("SELECT COUNT(*) c FROM client_forensic_seals WHERE status = 'TAMPERED'").get() as any)?.c ?? 0;
    const devices = (db.prepare('SELECT COUNT(*) c FROM client_identity_devices').get() as any)?.c ?? 0;
    const pulses = (db.prepare('SELECT COUNT(*) c FROM compliance_pulse_events').get() as any)?.c ?? 0;
    const frames = (db.prepare('SELECT COUNT(*) c FROM compliance_frameworks').get() as any)?.c ?? 0;
    const tenants = (db.prepare('SELECT COUNT(*) c FROM tenants').get() as any)?.c ?? 0;
    res.json({
      success: true,
      transport: { ws: pulseWsHealth() },
      modules: { forensicSeals: seals, tamperedSeals: tampered, identityDevices: devices, pulseEvents: pulses, frameworks: frames, tenants },
      computed: {
        evidenceIntegrityPct: seals ? Math.round(((seals - tampered) / seals) * 100) : 100,
        realtimeTransport: pulseWsHealth().attached ? 'LIVE' : 'DEGRADED',
      },
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});
// ----------------------------------------------------
// AI COPILOT GOVERNANCE — usage ledger, spend, metering
// ----------------------------------------------------
deepTechAdminRouter.get('/ai/telemetry', (_req, res) => {
  try {
    const db = getDb();
    const byProvider = (db.prepare('SELECT provider, model, COUNT(*) calls, SUM(tokens_in) tok_in, SUM(tokens_out) tok_out, ROUND(SUM(est_cost_usd),4) usd FROM saas_ai_usage_ledger GROUP BY provider, model ORDER BY calls DESC').all() as any[]);
    const byTenant = (db.prepare('SELECT tenant_id, COUNT(*) calls, ROUND(SUM(est_cost_usd),4) usd, MAX(created_at) last_used FROM saas_ai_usage_ledger GROUP BY tenant_id ORDER BY calls DESC').all() as any[]);
    const total = (db.prepare('SELECT COUNT(*) c, ROUND(SUM(est_cost_usd),4) usd, SUM(tokens_in) tok_in, SUM(tokens_out) tok_out, ROUND(AVG(latency_ms)) lat FROM saas_ai_usage_ledger').get() as any);
    const daily = (db.prepare("SELECT date(created_at) day, COUNT(*) calls, ROUND(SUM(est_cost_usd),4) usd FROM saas_ai_usage_ledger GROUP BY day ORDER BY day DESC LIMIT 14").all() as any[]).reverse();
    const recent = (db.prepare('SELECT id, tenant_id, provider, model, query, est_cost_usd usd, latency_ms, created_at FROM saas_ai_usage_ledger ORDER BY id DESC LIMIT 25').all() as any[]);
    res.json({ success: true, total, byProvider, byTenant, daily, recent });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ----------------------------------------------------
// GLOBAL DELIVERY / WEBHOOK CENTER — telemetry + retry
// ----------------------------------------------------
deepTechAdminRouter.get('/delivery/overview', (_req, res) => {
  try {
    const db = getDb();
    const byChannel = (db.prepare('SELECT channel, status, COUNT(*) n FROM saas_delivery_log GROUP BY channel, status ORDER BY channel').all() as any[]);
    const statusTotals = (db.prepare("SELECT status, COUNT(*) n, ROUND(AVG(latency_ms)) avg_ms FROM saas_delivery_log GROUP BY status").all() as any[]);
    const recent = (db.prepare('SELECT id, channel, event_type, status, attempt, latency_ms, error_message, created_at FROM saas_delivery_log ORDER BY id DESC LIMIT 30').all() as any[]);
    const failures = (db.prepare("SELECT COUNT(*) c FROM saas_delivery_log WHERE status = 'FAILED'").get() as any)?.c ?? 0;
    const totalDelivery = (db.prepare('SELECT COUNT(*) c FROM saas_delivery_log').get() as any)?.c ?? 0;
    res.json({
      success: true,
      total: totalDelivery, failures,
      deliveryHealthPct: totalDelivery ? Math.round(((totalDelivery - failures) / totalDelivery) * 100) : 100,
      transport: { ws: pulseWsHealth() },
      byChannel, statusTotals, recent,
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// Re-play a failed delivery (webhook retry)
deepTechAdminRouter.post('/delivery/retry/:id', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM saas_delivery_log WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Delivery log not found' });
    db.prepare("UPDATE saas_delivery_log SET status = 'RETRYING', attempt = attempt + 1 WHERE id = ?").run(row.id);
    broadcastPulse({ type: 'DELIVERY_RETRY', title: `Webhook re-delivery #${row.id}`, message: `${row.channel} → ${row.target_id || row.target_type}: ${row.event_type}`, severity: 'WARNING', source: 'saas-admin' });
    db.prepare("INSERT INTO saas_delivery_log (channel, target_type, target_id, event_type, status, attempt) VALUES (?,?,?,?,'SENT', ?)")
      .run(row.channel, row.target_type, row.target_id ?? '', row.event_type, row.attempt + 1);
    res.json({ success: true, message: `Re-delivery triggered for #${row.id} (attempt ${row.attempt + 1}).` });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});
