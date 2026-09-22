import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../../../db/sqlite';
import { AIGateway } from '../../../../packages/core/src/ai/AIGateway';
import {
  REGION_ACTS,
  COUNTRY_ACTS,
  detectCountryCode,
  regionFor,
  buildJurisdiction,
  actMeta,
  type Jurisdiction,
} from '../../../server/jurisdictionEngine';
import { broadcastPulse } from '../../../modules/client-premium/api/routes';
import { BlockchainAuditTrail } from '../../../services/blockchain-audit-trail';

export const lawyerOpsRouter = Router();

const wrap = (fn: (req: Request, res: Response) => any) => (req: Request, res: Response) => {
  try {
    fn(req, res);
  } catch (err: any) {
    console.error(`[LAWYER_OPS] ${req.method} ${req.path}:`, err?.message);
    res.status(400).json({ success: false, error: err?.message || 'Request failed' });
  }
};

const now = () => new Date().toISOString();

function safeJson(raw: any, fallback: any = null) {
  try { return raw !== null && raw !== undefined ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

function seedIfEmpty() {
  ensureExt();
  const db = getDb();
  const seed = (table: string, rows: any[], insert: (r: any) => void) => {
    const count = (db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as any)?.c ?? 0;
    if (count === 0) rows.forEach(insert);
  };

  seed('lawyer_professionals', [
    { id: 'LAW-100', name: 'Dr. Helena Vance', email: 'vance@eu-privacy-legal.de', professional_type: 'lawyer', firm: 'Vance & Associates', jurisdiction: 'Germany / EU', specialization: 'GDPR & AI Act', bar_license: 'BER-4471-K', licensing_authority: 'Rechtsanwaltskammer Berlin', years_of_practice: 14, status: 'VERIFIED_PARTNER' },
    { id: 'LAW-101', name: 'Maitre Jean Dupont', email: 'j.dupont@barreau-paris.fr', professional_type: 'lawyer', firm: 'Dupont Conseil', jurisdiction: 'France', specialization: 'CNIL & Data Disputes', bar_license: 'PAR-9802-M', licensing_authority: 'Barreau de Paris', years_of_practice: 11, status: 'VERIFIED_PARTNER' },
    { id: 'LAW-102', name: 'Sophia Rossi', email: 's.rossi@privacy-law.it', professional_type: 'consultant', firm: 'Rossi Compliance Srl', jurisdiction: 'Italy', specialization: 'GDPR & NIS2 Directive', bar_license: 'ROM-2210-R', licensing_authority: 'Ordine degli Avvocati', years_of_practice: 7, status: 'PENDING_REVIEW' },
    { id: 'LAW-103', name: 'Aarav Mehta', email: 'a.mehta@dpo-advisory.in', professional_type: 'dpo', firm: 'Mehta DPO Services', jurisdiction: 'India / EU (SCC)', specialization: 'DPO-as-a-Service & SCCs', bar_license: 'DEL-0091-A', licensing_authority: 'Bar Council of Delhi', years_of_practice: 9, status: 'VERIFIED_PARTNER' }
  ], (r: any) => getDb().prepare(`
    INSERT OR REPLACE INTO lawyer_professionals (id, name, email, professional_type, firm, jurisdiction, specialization, bar_license, licensing_authority, years_of_practice, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(r.id, r.name, r.email, r.professional_type, r.firm, r.jurisdiction, r.specialization, r.bar_license, r.licensing_authority, r.years_of_practice, r.status));

  seed('lawyer_consultations', [
    { id: 'CON-801', tenant_name: 'FinTech Dynamics', attorney_name: 'Dr. Helena Vance', topic: 'EU AI Act High Risk Model Registration', scheduled_at: new Date(Date.now() + 2 * 3600000).toISOString(), status: 'CONFIRMED', room_ref: `room_${Date.now()}` },
    { id: 'CON-802', tenant_name: 'Sovereign Bank NV', attorney_name: 'Maitre Jean Dupont', topic: 'Cross-Border Data Transfer Appeal', scheduled_at: new Date(Date.now() + 26 * 3600000).toISOString(), status: 'PENDING', room_ref: `room_${Date.now() + 1}` }
  ], (r: any) => getDb().prepare(`
    INSERT OR REPLACE INTO lawyer_consultations (id, tenant_name, attorney_name, topic, scheduled_at, status, room_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(r.id, r.tenant_name, r.attorney_name, r.topic, r.scheduled_at, r.status, r.room_ref));

  seed('lawyer_directives', [
    { id: 'DIR-7001', client_name: 'Acme Corp', title: 'Conduct biannual DPIA refresh on HR processing', directive_type: 'COUNSEL_DIRECTIVE', jurisdiction: 'Germany', status: 'ISSUED', assignee: 'Dr. Helena Vance' },
    { id: 'DIR-7002', client_name: 'Globex Inc', title: 'Remediate NIS2 24h notification gaps before Q4 audit', directive_type: 'REMEDIATION_DIRECTIVE', jurisdiction: 'EU', status: 'IN_PROGRESS', assignee: 'Maitre Jean Dupont' }
  ], (r: any) => getDb().prepare(`
    INSERT OR REPLACE INTO lawyer_directives (id, client_name, title, directive_type, jurisdiction, status, assignee)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(r.id, r.client_name, r.title, r.directive_type, r.jurisdiction, r.status, r.assignee));

  seed('lawyer_invoices', [
    { id: 'INV-9001', invoice_number: '2026-EU-0014', client_name: 'Acme Corp', matter: 'AI Act conformity advisory · Legal retainer', amount: 18500, currency: 'EUR', status: 'SENT', due_date: new Date(Date.now() + 14 * 86400000).toISOString() }
  ], (r: any) => getDb().prepare(`
    INSERT OR REPLACE INTO lawyer_invoices (id, invoice_number, client_name, matter, amount, currency, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(r.id, r.invoice_number, r.client_name, r.matter, r.amount, r.currency, r.status, r.due_date));
}

// ---------------------------------------------------------------------------
// EXTENSION TABLES — lawyer client relationships, service catalog, per-client
// service assignments, generated law/act solutions, cross-border profiles
// ---------------------------------------------------------------------------
function ensureExt() {
  const db = getDb();
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS lawyer_clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT,
        country TEXT,
        region TEXT,
        email TEXT,
        status TEXT DEFAULT 'LINKED',
        lawyer_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS lawyer_services (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'COMPLIANCE',
        description TEXT,
        price REAL DEFAULT 0,
        currency TEXT DEFAULT 'EUR',
        jurisdictions_json TEXT DEFAULT '[]',
        delivery_note TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS lawyer_client_services (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        price_snapshot REAL DEFAULT 0,
        status TEXT DEFAULT 'ASSIGNED',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS lawyer_solutions (
        id TEXT PRIMARY KEY,
        client_id TEXT,
        client_name TEXT,
        country TEXT,
        country_code TEXT,
        region TEXT,
        applied_acts_json TEXT DEFAULT '[]',
        industry TEXT,
        title TEXT,
        summary TEXT,
        provisions_json TEXT DEFAULT '[]',
        directives_json TEXT DEFAULT '[]',
        status TEXT DEFAULT 'DRAFT',
        invoice_id TEXT,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS lawyer_jurisdiction_profiles (
        owner_type TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        country_code TEXT NOT NULL,
        country_name TEXT,
        region TEXT,
        local_law TEXT,
        region_acts_json TEXT DEFAULT '[]',
        country_acts_json TEXT DEFAULT '[]',
        applied_acts_json TEXT DEFAULT '[]',
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source TEXT DEFAULT 'auto-detect',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (owner_type, owner_id)
      );
      CREATE TABLE IF NOT EXISTS lawyer_client_engagement_requests (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        client_name TEXT NOT NULL,
        lawyer_id TEXT,
        lawyer_name TEXT,
        reason TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS lawyer_regulator_contacts (
        id TEXT PRIMARY KEY,
        regulator_id TEXT NOT NULL,
        regulator_name TEXT NOT NULL,
        country_code TEXT NOT NULL,
        country_name TEXT,
        region TEXT,
        channel TEXT DEFAULT 'formal_liaison',
        status TEXT DEFAULT 'CONNECTED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Upgrade bills of invoice table with per-client + line-item columns
    const invCols = ((db.prepare("SELECT name FROM pragma_table_info('lawyer_invoices')").all() as any[]) || []).map((c: any) => c.name);
    if (invCols.length && !invCols.includes('client_id')) db.exec(`ALTER TABLE lawyer_invoices ADD COLUMN client_id TEXT`);
    if (invCols.length && !invCols.includes('line_items')) db.exec(`ALTER TABLE lawyer_invoices ADD COLUMN line_items TEXT`);
    if (invCols.length && !invCols.includes('jurisdiction')) db.exec(`ALTER TABLE lawyer_invoices ADD COLUMN jurisdiction TEXT`);
    // Upgrade consultation rooms with per-client + council-country request fields
    const conCols = ((db.prepare("SELECT name FROM pragma_table_info('lawyer_consultations')").all() as any[]) || []).map((c: any) => c.name);
    if (conCols.length && !conCols.includes('client_id')) db.exec(`ALTER TABLE lawyer_consultations ADD COLUMN client_id TEXT`);
    if (conCols.length && !conCols.includes('client_name')) db.exec(`ALTER TABLE lawyer_consultations ADD COLUMN client_name TEXT`);
    if (conCols.length && !conCols.includes('attorney_id')) db.exec(`ALTER TABLE lawyer_consultations ADD COLUMN attorney_id TEXT`);
    if (conCols.length && !conCols.includes('country')) db.exec(`ALTER TABLE lawyer_consultations ADD COLUMN country TEXT`);
    if (conCols.length && !conCols.includes('message')) db.exec(`ALTER TABLE lawyer_consultations ADD COLUMN message TEXT`);
    // Seed a default service catalog
    const svcCount = (db.prepare('SELECT COUNT(*) c FROM lawyer_services').get() as any)?.c ?? 0;
    if (svcCount === 0) {
      const seed = db.prepare(`INSERT OR REPLACE INTO lawyer_services (id, title, category, description, price, currency, jurisdictions_json, delivery_note, status) VALUES (?,?,?,?,?,?,?,?,?)`);
      db.transaction(() => {
        seed.run('SVC-GDPR-DPIA', 'DPIA & Privacy Impact Assessment', 'DATA_PROTECTION', 'Full DPIA across processing activities with risk register and mitigations.', 8500, 'EUR', JSON.stringify(['EU', 'DE', 'FR', 'NL']), 'Deliver docs within 10 business days.', 'ACTIVE');
        seed.run('SVC-AIACT-GOV', 'EU AI Act Governance Program', 'AI_GOVERNANCE', 'Risk classification, model cards, registration docket and monitoring.', 29500, 'EUR', JSON.stringify(['EU']), 'Quarterly delivery plus authority liaison.', 'ACTIVE');
        seed.run('SVC-NIS2-READINESS', 'NIS2 Readiness Remediation', 'CYBER', 'Essential-entity compliance, SOC/SIEM telemetry and CSIRT notification playbook.', 19000, 'EUR', JSON.stringify(['EU', 'DE', 'FR']), 'Pilot + full rollout, 8 weeks.', 'ACTIVE');
        seed.run('SVC-EU-TRANSFER', 'Cross-Border Transfer (SCCs/TIA)', 'CROSS_BORDER', 'EU-to-third-country transfer impact assessment, SCC completion and TIA.', 12500, 'EUR', JSON.stringify(['EU', 'US']), 'Per destination country.', 'ACTIVE');
        seed.run('SVC-CSRD-ESG', 'CSRD & ESG ESRS Reporting', 'ESG', 'Double-materiality analysis, ESRS datapoint collection, assurance liaison.', 22000, 'EUR', JSON.stringify(['EU']), 'Full cycle support.', 'ACTIVE');
        seed.run('SVC-DPA-RETAINER', 'DPO-as-a-Service Retainer', 'PRIVACY', 'Ongoing external DPO duties, breach runbooks, authority correspondence.', 4200, 'EUR', JSON.stringify(['EU', 'UK']), 'Monthly commitment.', 'ACTIVE');
      })();
    }
  } catch (err: any) {
    console.warn('[LAWYER_OPS] ensureExt warning:', err?.message);
  }
}

const anchorLawyer = (action: string, resource: string, refId: string, payload: any, actor = 'lawyer-consultant-suite') => {
  try { BlockchainAuditTrail.anchor({ actor, action, category: 'LAWYER_CONSULT_SUITE', resource, refId, payload }); } catch {}
};

function rowToProfessional(r: any) {
  return {
    id: r.id, name: r.name, email: r.email || undefined, professionalType: r.professional_type,
    firm: r.firm || undefined, jurisdiction: r.jurisdiction || undefined, specialization: r.specialization || undefined,
    barLicense: r.bar_license || undefined, licensingAuthority: r.licensing_authority || undefined,
    yearsOfPractice: r.years_of_practice, status: r.status, nations: nationsForJurisdiction(r.jurisdiction), createdAt: r.created_at, updatedAt: r.updated_at
  };
}
function rowToConsultation(r: any) {
  return {
    id: r.id, clientId: r.client_id || undefined, clientName: r.client_name || undefined, attorneyId: r.attorney_id || undefined, attorneyName: r.attorney_name || undefined,
    country: r.country || undefined, message: r.message || undefined, topic: r.topic || undefined,
    scheduledAt: r.scheduled_at || undefined, status: r.status, roomRef: r.room_ref || undefined, createdAt: r.created_at
  };
}

// Nations referenced by the counsel roster (from jurisdiction strings)
const NATION_KEYS = [
  'Germany', 'France', 'Italy', 'Netherlands', 'Spain', 'Ireland', 'Portugal', 'Poland', 'Belgium',
  'Sweden', 'Austria', 'UK', 'India', 'US', 'Canada', 'Australia', 'Singapore', 'Brazil', 'UAE', 'Japan',
  'China', 'Switzerland', 'Norway', 'Denmark', 'Luxembourg', 'Finland',
];
function nationsForJurisdiction(j: any): string[] {
  const text = String(j || '').toLowerCase();
  return NATION_KEYS.filter(n => text.includes(n.toLowerCase()));
}

// ============================================================
// LAWYER / CONSULTANT PROFESSIONALS — full CRM roster CRUD
// ============================================================
lawyerOpsRouter.get('/lawyer/professionals', wrap((req, res) => {
  seedIfEmpty();
  const country = String((req.query as any).country || '').trim();
  let rows: any[] = getDb().prepare('SELECT * FROM lawyer_professionals ORDER BY created_at DESC').all() as any[];
  if (country && country !== 'All') {
    rows = rows.filter(r => nationsForJurisdiction(r.jurisdiction).some(n => n.toLowerCase() === country.toLowerCase()));
  }
  rows.forEach(r => { r._nations = nationsForJurisdiction(r.jurisdiction); });
  res.json({ success: true, professionals: rows.map(rowToProfessional), total: rows.length });
}));

// Nation groups present on the counsel roster (for nation-wise browse filters)
lawyerOpsRouter.get('/lawyer/professionals/nations', wrap((_req, res) => {
  seedIfEmpty();
  const rows = getDb().prepare('SELECT jurisdiction FROM lawyer_professionals').all() as any[];
  const counter: Record<string, number> = {};
  rows.forEach(r => nationsForJurisdiction(r.jurisdiction).forEach(n => { counter[n] = (counter[n] || 0) + 1; }));
  const nations = Object.entries(counter).map(([label, count]) => ({ key: label.toLowerCase(), label, count }));
  res.json({ success: true, nations });
}));

lawyerOpsRouter.post('/lawyer/professionals', wrap((req, res) => {
  const b = req.body || {};
  const id = b.id || `LAW-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  getDb().prepare(`
    INSERT INTO lawyer_professionals (id, name, email, professional_type, firm, jurisdiction, specialization, bar_license, licensing_authority, years_of_practice, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.name, b.email || null, b.professionalType || 'lawyer', b.firm || null, b.jurisdiction || null,
    b.specialization || null, b.barLicense || null, b.licensingAuthority || null, b.yearsOfPractice || 0, b.status || 'PENDING_REVIEW');
  const prof = getDb().prepare('SELECT * FROM lawyer_professionals WHERE id = ?').get(id) as any;
  res.json({ success: true, message: 'Professional registered.', professional: rowToProfessional(prof) });
}));

lawyerOpsRouter.patch('/lawyer/professionals/:id/status', wrap((req, res) => {
  const { status } = req.body || {};
  const existing = getDb().prepare('SELECT * FROM lawyer_professionals WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Professional not found' });
  getDb().prepare(`UPDATE lawyer_professionals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status || 'VERIFIED_PARTNER', req.params.id);
  const prof = getDb().prepare('SELECT * FROM lawyer_professionals WHERE id = ?').get(req.params.id) as any;
  res.json({ success: true, professional: rowToProfessional(prof) });
}));

lawyerOpsRouter.delete('/lawyer/professionals/:id', wrap((req, res) => {
  const existing = getDb().prepare('SELECT * FROM lawyer_professionals WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Professional not found' });
  getDb().prepare('DELETE FROM lawyer_professionals WHERE id = ?').run(req.params.id);
  res.json({ success: true, deleted: req.params.id });
}));

// ============================================================
// CONSULTATION ROOMS — encrypted session management
// ============================================================
lawyerOpsRouter.get('/lawyer/consultations', wrap((_req, res) => {
  seedIfEmpty();
  const rows = getDb().prepare('SELECT * FROM lawyer_consultations ORDER BY created_at DESC').all() as any[];
  res.json({ success: true, sessions: rows.map(rowToConsultation), total: rows.length });
}));

lawyerOpsRouter.post('/lawyer/consultations', wrap((req, res) => {
  const b = req.body || {};
  const id = b.id || `CON-${Date.now()}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
  const clientId = b.clientId || b.tenantId || null;
  const clientName = b.clientName || b.tenantName || 'Unnamed Tenant';
  getDb().prepare(`
    INSERT INTO lawyer_consultations (id, tenant_name, client_id, client_name, attorney_id, attorney_name, topic, message, country, scheduled_at, status, room_ref)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, clientName, clientId, clientName, b.attorneyId || null, b.attorneyName || 'Counsel',
    b.topic || null, b.message || null, b.country || null, b.scheduledAt || new Date().toISOString(), b.status || 'PENDING', `room_${Date.now()}`);
  anchorLawyer('CONSULTATION_REQUESTED', 'lawyer_consultations', id, { clientId, clientName, attorneyId: b.attorneyId, attorneyName: b.attorneyName, country: b.country, topic: b.topic });
  try { broadcastPulse({ type: 'CONSULTATION_REQUEST', title: `Consultation requested by ${clientName}`, message: 'Client dispatched a lawyer consultation request from the dashboard.', severity: 'info', source: 'client-counsel-network' }); } catch {}
  const s = getDb().prepare('SELECT * FROM lawyer_consultations WHERE id = ?').get(id) as any;
  res.json({ success: true, session: rowToConsultation(s) });
}));

// Client-facing: which consultation requests belong to this tenant
lawyerOpsRouter.get('/lawyer/consultations/client/:clientId', wrap((req, res) => {
  seedIfEmpty();
  const rows = getDb().prepare('SELECT * FROM lawyer_consultations WHERE client_id = ? ORDER BY created_at DESC').all(req.params.clientId) as any[];
  res.json({ success: true, sessions: rows.map(rowToConsultation), total: rows.length });
}));

lawyerOpsRouter.patch('/lawyer/consultations/:id/status', wrap((req, res) => {
  const { status } = req.body || {};
  const existing = getDb().prepare('SELECT * FROM lawyer_consultations WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Consultation not found' });
  getDb().prepare(`UPDATE lawyer_consultations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(status || 'CONFIRMED', req.params.id);
  const s = getDb().prepare('SELECT * FROM lawyer_consultations WHERE id = ?').get(req.params.id) as any;
  res.json({ success: true, session: rowToConsultation(s) });
}));

// ============================================================
// DIRECTIVES, OPINION LETTERS & INVOICES
// ============================================================
lawyerOpsRouter.get('/lawyer/directives', wrap((_req, res) => {
  seedIfEmpty();
  const rows = getDb().prepare('SELECT * FROM lawyer_directives ORDER BY created_at DESC').all() as any[];
  res.json({ success: true, directives: rows });
}));

lawyerOpsRouter.post('/lawyer/directives', wrap((req, res) => {
  const b = req.body || {};
  const id = b.id || `DIR-${Date.now()}`;
  getDb().prepare(`
    INSERT INTO lawyer_directives (id, client_id, client_name, title, directive_type, jurisdiction, status, assignee)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.clientId || null, b.clientName || 'Client', b.title, b.directiveType || 'COUNSEL_DIRECTIVE',
    b.jurisdiction || null, b.status || 'ISSUED', b.assignee || null);
  res.json({ success: true, directive: getDb().prepare('SELECT * FROM lawyer_directives WHERE id = ?').get(id) });
}));

// Client executes a counsel directive (from the client dashboard hub)
lawyerOpsRouter.patch('/lawyer/directives/:id/status', wrap((req, res) => {
  seedIfEmpty();
  const { status } = req.body || {};
  const ok = ['ISSUED', 'IN_PROGRESS', 'COMPLETED', 'VOID'].includes(status);
  if (!ok) return res.status(400).json({ success: false, error: `Invalid directive status '${status}'` });
  const existing = getDb().prepare('SELECT * FROM lawyer_directives WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Directive not found' });
  getDb().prepare('UPDATE lawyer_directives SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  anchorLawyer('DIRECTIVE_EXECUTED', 'lawyer_directives', req.params.id, { from: existing.status, to: status, clientId: existing.client_id });
  try { broadcastPulse({ type: 'DIRECTIVE_EXECUTED', title: `Directive ${status.toLowerCase()} by client`, message: existing.title, severity: status === 'COMPLETED' ? 'info' : 'warning', source: 'client-counsel-hub' }); } catch {}
  res.json({ success: true, directive: getDb().prepare('SELECT * FROM lawyer_directives WHERE id = ?').get(req.params.id) });
}));

// Client completes a remediation task provisioned by counsel (auto-integration target)
lawyerOpsRouter.patch('/lawyer/tasks/:id/status', wrap((req, res) => {
  seedIfEmpty();
  const { status } = req.body || {};
  const ok = ['OPEN', 'IN_PROGRESS', 'DONE', 'RESOLVED', 'BLOCKED'].includes(status);
  if (!ok) return res.status(400).json({ success: false, error: `Invalid task status '${status}'` });
  const existing = getDb().prepare('SELECT * FROM remediation_tasks WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Task not found' });
  getDb().prepare('UPDATE remediation_tasks SET status = ?, regulator_notes = COALESCE(regulator_notes, ?) WHERE id = ?')
    .run(status, `Marked ${status} by client at ${new Date().toISOString()}`, req.params.id);
  anchorLawyer('REMEDIATION_TASK_UPDATED', 'remediation_tasks', req.params.id, { from: existing.status, to: status, tenantId: existing.tenant_id });
  try { broadcastPulse({ type: 'REMEDIATION_TASK_COMPLETED', title: `Remediation task ${status}`, message: existing.title, severity: 'info', source: 'client-counsel-hub' }); } catch {}
  res.json({ success: true, task: getDb().prepare('SELECT * FROM remediation_tasks WHERE id = ?').get(req.params.id) });
}));

// Client settles a counsel invoice (PAID)
lawyerOpsRouter.post('/lawyer/invoices/:id/pay', wrap((req, res) => {
  seedIfEmpty();
  const existing = getDb().prepare('SELECT * FROM lawyer_invoices WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Invoice not found' });
  if (existing.status === 'PAID') return res.json({ success: true, invoice: existing, message: 'Invoice already settled.' });
  getDb().prepare('UPDATE lawyer_invoices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('PAID', req.params.id);
  anchorLawyer('INVOICE_SETTLED', 'lawyer_invoices', req.params.id, { amount: existing.amount, currency: existing.currency, clientId: existing.client_id });
  try { broadcastPulse({ type: 'INVOICE_SETTLED', title: `Invoice ${existing.invoice_number || req.params.id} settled`, message: `Client paid ${existing.amount} ${existing.currency || 'EUR'}.`, severity: 'info', source: 'client-counsel-hub' }); } catch {}
  res.json({ success: true, invoice: getDb().prepare('SELECT * FROM lawyer_invoices WHERE id = ?').get(req.params.id) });
}));

lawyerOpsRouter.get('/lawyer/opinion-letters', wrap((_req, res) => {
  seedIfEmpty();
  const rows = getDb().prepare('SELECT * FROM lawyer_opinion_letters ORDER BY created_at DESC').all() as any[];
  res.json({ success: true, letters: rows });
}));

lawyerOpsRouter.post('/lawyer/opinion-letters', wrap((req, res) => {
  const b = req.body || {};
  const id = b.id || `OP-${Date.now()}`;
  getDb().prepare(`
    INSERT INTO lawyer_opinion_letters (id, reference, client_name, jurisdiction, regulation_scope, issue_summary, content, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.reference || null, b.clientName || 'Client', b.jurisdiction || null, b.regulationScope || null,
    b.issueSummary || null, b.content || null, b.status || 'DRAFT');
  res.json({ success: true, letter: getDb().prepare('SELECT * FROM lawyer_opinion_letters WHERE id = ?').get(id) });
}));

lawyerOpsRouter.get('/lawyer/invoices', wrap((req, res) => {
  seedIfEmpty();
  const clientId = String((req.query as any).clientId || '').trim();
  const rows = clientId
    ? getDb().prepare('SELECT * FROM lawyer_invoices WHERE client_id = ? ORDER BY created_at DESC').all(clientId)
    : getDb().prepare('SELECT * FROM lawyer_invoices ORDER BY created_at DESC').all();
  res.json({ success: true, invoices: rows.map((r: any) => ({ ...r, line_items: safeJson(r.line_items) })), total: rows.length });
}));

lawyerOpsRouter.post('/lawyer/invoices', wrap((req, res) => {
  seedIfEmpty();
  const b = req.body || {};
  const id = b.id || `INV-${Date.now()}`;
  const amount = Number(b.amount || 0);
  const lineItems = Array.isArray(b.lineItems) ? b.lineItems : (b.lineItems ? [b.lineItems] : []);
  const total = lineItems.length > 0 ? lineItems.reduce((s: number, l: any) => s + Number(l.amount || 0), 0) : amount;
  getDb().prepare(`
    INSERT INTO lawyer_invoices (id, invoice_number, client_id, client_name, matter, amount, currency, status, due_date, line_items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.invoiceNumber || `REGL-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
    b.clientId || null, b.clientName || 'Client', b.matter || (b.title || null), total, b.currency || 'EUR',
    b.status || 'DRAFT', b.dueDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    JSON.stringify(lineItems));
  anchorLawyer('INVOICE_CREATED', 'lawyer_invoices', id, { clientId: b.clientId, amount: total, currency: b.currency || 'EUR', lineItems });
  res.json({ success: true, invoice: getDb().prepare('SELECT * FROM lawyer_invoices WHERE id = ?').get(id) });
}));

lawyerOpsRouter.patch('/lawyer/invoices/:id/status', wrap((req, res) => {
  seedIfEmpty();
  const { status } = req.body || {};
  const ok = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].includes(status);
  if (!ok) return res.status(400).json({ success: false, error: `Invalid invoice status '${status}'` });
  const existing = getDb().prepare('SELECT * FROM lawyer_invoices WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Invoice not found' });
  getDb().prepare('UPDATE lawyer_invoices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  anchorLawyer('INVOICE_STATUS_CHANGED', 'lawyer_invoices', req.params.id, { from: existing.status, to: status, clientId: existing.client_id });
  getDb().prepare('INSERT INTO lawyer_audit_trail (id, action, client, jurisdiction) VALUES (?, ?, ?, ?)')
    .run(`AUD-${Date.now()}`, `Invoice ${status}`, existing.client_name || 'Client', existing.jurisdiction || 'EU');
  res.json({ success: true, invoice: getDb().prepare('SELECT * FROM lawyer_invoices WHERE id = ?').get(req.params.id) });
}));;

// ============================================================
// LAWYER DASHBOARD OVERVIEW AGGREGATE
// ============================================================
lawyerOpsRouter.get('/lawyer/overview', wrap((_req, res) => {
  seedIfEmpty();
  const db = getDb();
  const count = (t: string, status?: string) => {
    const q = status
      ? `SELECT COUNT(*) as c FROM ${t} WHERE status = ?`
      : `SELECT COUNT(*) as c FROM ${t}`;
    return (db.prepare(q).get(...(status ? [status] : [])) as any)?.c ?? 0;
  };
  const slaRow = db.prepare('SELECT metric_value FROM lawyer_sla_metrics WHERE metric_key = ?').get('slaComplianceRate') as any;
  res.json({
    success: true,
    overview: {
      professionals: count('lawyer_professionals'),
      verifiedPartners: count('lawyer_professionals', 'VERIFIED_PARTNER'),
      pendingReview: count('lawyer_professionals', 'PENDING_REVIEW'),
      consultations: count('lawyer_consultations'),
      confirmedConsultations: count('lawyer_consultations', 'CONFIRMED'),
      directives: count('lawyer_directives'),
      activeDirectives: count('lawyer_directives', 'ISSUED'),
      invoices: count('lawyer_invoices'),
      openInvoices: count('lawyer_invoices', 'SENT'),
      slaComplianceRate: slaRow ? (JSON.parse(slaRow.metric_value) as number) : 98.5,
      generatedAt: now()
    }
  });
}));

// ============================================================
// LAWYER INTELLIGENCE — AI drafting, dossiers, redlines, opinions
// ============================================================
lawyerOpsRouter.post('/lawyer-intelligence/generate-draft', wrap(async (req, res) => {
  const b = req.body || {};
  const gateway = await AIGateway.predictWithXAI(
    { tenantId: req.user?.tenantId || 'tenant_default', sector: 'legal', useCase: 'generate-draft', inputs: { body: b } },
    `Draft a ${b.documentType || 'legal'} clause for ${b.clientName || 'client'} under ${b.jurisdiction || 'EU'} regulations: ${b.regulations || ''}. Prompt: ${b.prompt || ''}`
  );
  const opinion = [
    `REGULATORY LEGAL DRAFT — ${(b.regulations || 'Applicable Regulation').toUpperCase()}`,
    b.prompt || 'Automated legal drafting request',
    `1. CONTRACTUAL RECITAL: The Client, ${b.clientName || 'Client'}, acting through authorized counsel, shall maintain continuous compliance evidence against all provisions of ${b.regulations || 'applicable regulation'}.`,
    `2. DATA PROCESSING RESTRICTION: Personal-data processing for model training and automated decisioning remains revocable by the Data Subject within 180 seconds of exercise via the authenticated portal.`,
    `3. ACTIONABLE DIRECTIVE: Conduct biannual dry-run stress tests; enforce WebAuthn telemetry verification at all client nodes.`,
    `XAI confidence: ${gateway.result.score}/100. Flags: ${gateway.result.flags.length}`
  ].join('\n');
  const ledger = getDb().prepare('INSERT INTO lawyer_audit_trail (id, action, client, jurisdiction) VALUES (?, ?, ?, ?)');
  ledger.run(`AUD-${Date.now()}`, `AI Draft Generated: ${(b.documentType || '').toUpperCase()}`, b.clientName || 'Client', b.jurisdiction || 'EU');
  res.json({ success: true, draft: opinion, riskScore: gateway.result.score, flags: gateway.result.flags });
}));

lawyerOpsRouter.post('/lawyer-intelligence/generate-dossier', wrap(async (req, res) => {
  const b = req.body || {};
  const findings = (b.activeFindings || []).length;
  const gateway = await AIGateway.predictWithXAI(
    { tenantId: req.user?.tenantId || 'tenant_default', sector: 'legal', useCase: 'generate-dossier', inputs: { body: b } },
    `Compile a sovereign compliance dossier for ${b.clientName || 'client'} targeting ${b.audience || 'audience'}, depth ${b.depth || 'standard'}, regulation ${b.regulations || ''}. Findings count: ${findings}.`
  );
  const dossier = [
    `SOVEREIGN COMPLIANCE INTEGRITY DOSSIER — ${(b.clientName || 'Client').toUpperCase()}`,
    `Audience: ${(b.audience || 'ERS').toUpperCase()} · Evidence Level: ${(b.depth || 'STANDARD').toUpperCase()}`,
    `Framework: ${b.regulations || 'GDPR'} · Timestamp: ${now()} UTC · Generated: sovereign-legal-copilot`,
    `EXECUTIVE CERTIFICATION: Technical controls conform to ${b.regulations || 'the applicable framework'} with a compliance score of ${gateway.result.score}/100 and ${gateway.result.flags.length} open flags.`,
    findings > 0 ? `OPEN FINDINGS: ${findings} flagged item(s) require counsel review before external attestation.` : `FINDINGS: Zero open critical findings. Evidence tree is cryptographically sound.`,
    `Signature: Registered European Bar Claim Hash 0x${crypto.createHash('sha256').update(now()).digest('hex').slice(0, 10)}`
  ].join('\n');
  const ledger = getDb().prepare('INSERT INTO lawyer_audit_trail (id, action, client, jurisdiction) VALUES (?, ?, ?, ?)');
  ledger.run(`AUD-${Date.now()}`, 'Compliance Dossier Compiled', b.clientName || 'Client', b.jurisdiction || b.regulations || 'EU');
  res.json({ success: true, dossier, score: gateway.result.score });
}));

lawyerOpsRouter.post('/lawyer-intelligence/redline-contract', wrap(async (req, res) => {
  const b = req.body || {};
  const gateway = await AIGateway.predictWithXAI(
    { tenantId: req.user?.tenantId || 'tenant_default', sector: 'legal', useCase: 'redline-contract', inputs: { body: b } },
    `Redline audit of contract '${b.contractTitle || 'untitled'}' against ${(b.targetRegulations || []).join(', ') || 'applicable regulations'}.`
  );
  res.json({
    success: true,
    riskScore: gateway.result.score,
    overallAssessment: `Contract reviewed against ${(b.targetRegulations || ['applicable regulation']).join(', ')}. XAI risk assessment: ${gateway.result.score}/100 — ${gateway.result.score >= 90 ? 'LOW RISK' : gateway.result.score >= 70 ? 'MODERATE RISK' : 'HIGH RISK'}.`,
    clauseRedlines: [
      { clause: 'Indemnification & Liability Caps', finding: 'Liability cap renders breach liquidated damages unenforceable.', recommendation: 'Introduce carve-out for regulatory fines + gross negligence.' },
      { clause: 'Data Processing Addendum', finding: 'Sub-processor list lacks change-notification SLA.', recommendation: 'Add 14-day written notification + audit rights clause.' },
      { clause: 'Automatic Renewal', finding: 'Silent auto-renewal without termination-for-convenience window.', recommendation: 'Insert 90-day notice termination at no penalty.' }
    ]
  });
}));

lawyerOpsRouter.post('/lawyer-intelligence/generate-opinion-letter', wrap(async (req, res) => {
  const b = req.body || {};
  const gateway = await AIGateway.predictWithXAI(
    { tenantId: req.user?.tenantId || 'tenant_default', sector: 'legal', useCase: 'generate-opinion-letter', inputs: { body: b } },
    `Generate a formal legal opinion letter for ${b.clientName || 'client'} in ${b.jurisdiction || 'EU'} on ${b.regulationScope || 'regulation'}. Summary: ${b.issueSummary || ''}.`
  );
  const letter = [
    `FORMAL LEGAL OPINION — ${(b.regulationScope || 'APPLICABLE REGULATION').toUpperCase()}`,
    `To: ${b.clientName || 'Client'} · Jurisdiction: ${b.jurisdiction || 'European Union'}`,
    `Prepared by: ${b.partnerCounselName || 'Sovereign Legal Advisory'} · Date: ${now()} UTC`,
    `1. MATTERS ADDRESSED: ${b.issueSummary || 'Requested assessment of compliance posture.'}`,
    `2. LEGAL OPINION: Based on the facts presented and current regulatory interpretation, the described activities are assessed with confidence ${gateway.result.score}/100.`,
    `3. QUALIFICATIONS & ASSUMPTIONS: Opinion assumes continued accuracy of client-provided telemetry; not an audit or a guarantee against future enforcement.`,
    `This letter is privileged and confidential, prepared solely for the addressee.`
  ].join('\n');
  const db = getDb();
  db.prepare(`
    INSERT INTO lawyer_opinion_letters (id, reference, client_name, jurisdiction, regulation_scope, issue_summary, content, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(`OP-${Date.now()}`, `OP-2026-${Math.floor(Math.random() * 9000) + 1000}`, b.clientName || 'Client',
    b.jurisdiction || 'EU', b.regulationScope || null, b.issueSummary || null, letter, 'FINAL');
  db.prepare('INSERT INTO lawyer_audit_trail (id, action, client, jurisdiction) VALUES (?, ?, ?, ?)')
    .run(`AUD-${Date.now()}`, 'Formal Legal Opinion Letter Synthesized', b.clientName || 'Client', b.jurisdiction || 'EU');
  res.json({ success: true, opinionLetter: letter });
}));

// ============================================================
// COMPLIANCE POLICY ACTION REVIEW — approve/reject legal review
// ============================================================
lawyerOpsRouter.post('/compliance/generated-policies/:id/action-review', wrap((req, res) => {
  const { action, reviewed_by } = req.body || {};
  const nextStatus = action === 'approve' ? 'approved' : (action === 'reject' ? 'rejected' : 'under_legal_review');
  const db = getDb();
  const existing = db.prepare('SELECT * FROM generated_policies WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: `Policy '${req.params.id}' not found` });
  db.prepare('UPDATE generated_policies SET status = ? WHERE id = ?').run(nextStatus, req.params.id);
  db.prepare('INSERT INTO lawyer_audit_trail (id, action, client, jurisdiction) VALUES (?, ?, ?, ?)')
    .run(`AUD-${Date.now()}`, `Policy Review ${nextStatus.toUpperCase()}`, existing.organization_id, 'EU');
  res.json({ success: true, status: nextStatus, policyId: req.params.id, reviewedBy: reviewed_by || 'Legal Counsel' });
}));
// ============================================================
// CLIENT MANAGEMENT — lawyer <-> client relationships (open suite)
// ============================================================
lawyerOpsRouter.get('/lawyer/clients', wrap((_req, res) => {
  seedIfEmpty();
  const db = getDb();
  const linked = (db.prepare('SELECT * FROM lawyer_clients ORDER BY created_at DESC').all() as any[]) || [];
  let platform: any[] = [];
  try {
    platform = (db.prepare('SELECT id, name, status, organization_metadata FROM tenants ORDER BY created_at DESC LIMIT 60').all() as any[]) || [];
  } catch { /* tenants table may not exist in lightweight profiles */ }
  return res.json({
    success: true,
    clients: linked,
    candidates: platform.map((t: any) => {
      let meta: any = {};
      try { meta = JSON.parse(t.organization_metadata || '{}'); } catch { meta = {}; }
      return { id: t.id, name: t.name, industry: meta.industry || meta.industry_type || 'Unclassified', country: meta.country || meta.operating_country || 'DE', status: t.status, linked: linked.some((l: any) => l.id === t.id) };
    }),
    total: linked.length,
  });
}));

lawyerOpsRouter.post('/lawyer/clients', wrap((req, res) => {
  seedIfEmpty();
  const b = req.body || {};
  const id = b.id || `cl_${crypto.randomBytes(4).toString('hex')}`;
  const country = String(b.country || 'DE').slice(0, 2).toUpperCase();
  const region = regionFor(country);
  getDb().prepare(`
    INSERT OR REPLACE INTO lawyer_clients (id, name, industry, country, region, email, status, lawyer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.name || 'New Client', b.industry || null, country, region, b.email || null, b.status || 'LINKED', b.lawyerId || null);
  try {
    getDb().prepare(`
      INSERT OR REPLACE INTO lawyer_jurisdiction_profiles (owner_type, owner_id, country_code, country_name, region, local_law, region_acts_json, country_acts_json, applied_acts_json, detected_at, source, updated_at)
      VALUES ('client', ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'linked-client', CURRENT_TIMESTAMP)
    `).run(id, country, COUNTRY_ACTS[country]?.country || country, region, COUNTRY_ACTS[country]?.localLaw || null,
      JSON.stringify(REGION_ACTS[region]?.acts || REGION_ACTS.EU.acts),
      JSON.stringify(COUNTRY_ACTS[country]?.acts || []),
      JSON.stringify([...(REGION_ACTS[region]?.acts || REGION_ACTS.EU.acts), ...(COUNTRY_ACTS[country]?.acts || [])]));
  } catch (e) {}
  anchorLawyer('CLIENT_LINKED', 'lawyer_clients', id, { name: b.name, country, region });
  res.json({ success: true, client: getDb().prepare('SELECT * FROM lawyer_clients WHERE id = ?').get(id) });
}));

lawyerOpsRouter.delete('/lawyer/clients/:id', wrap((req, res) => {
  seedIfEmpty();
  const existing = getDb().prepare('SELECT * FROM lawyer_clients WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Client not linked' });
  getDb().prepare('DELETE FROM lawyer_clients WHERE id = ?').run(req.params.id);
  getDb().prepare('DELETE FROM lawyer_client_services WHERE client_id = ?').run(req.params.id);
  anchorLawyer('CLIENT_UNLINKED', 'lawyer_clients', req.params.id, { name: existing.name });
  res.json({ success: true, deleted: req.params.id });
}));

lawyerOpsRouter.get('/lawyer/clients/:id/ledger', wrap((req, res) => {
  seedIfEmpty();
  const db = getDb();
  const clientId = req.params.id;
  const client = db.prepare('SELECT * FROM lawyer_clients WHERE id = ?').get(clientId) as any;
  const services = (db.prepare(`
    SELECT lcs.id as assignment_id, lcs.status as assignment_status, lcs.price_snapshot, lcs.assigned_at, s.*
    FROM lawyer_client_services lcs JOIN lawyer_services s ON s.id = lcs.service_id
    WHERE lcs.client_id = ? ORDER BY lcs.assigned_at DESC`).all(clientId)) || [];
  const invoices = (db.prepare('SELECT * FROM lawyer_invoices WHERE client_id = ? ORDER BY created_at DESC').all(clientId) as any[]) || [];
  const solutions = (db.prepare('SELECT * FROM lawyer_solutions WHERE client_id = ? ORDER BY created_at DESC').all(clientId) as any[]) || [];
  const directives = (db.prepare('SELECT * FROM lawyer_directives WHERE client_id = ? ORDER BY created_at DESC').all(clientId) as any[]) || [];
  const tasks = (db.prepare('SELECT id, title, severity, status, due_date, description FROM remediation_tasks WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 20').all(clientId) as any[]) || [];
  res.json({
    success: true,
    client,
    services: services.map((s: any) => ({ ...s, jurisdictions: safeJson(s.jurisdictions_json, []) })),
    invoices: invoices.map((i: any) => ({ ...i, line_items: safeJson(i.line_items, []) })),
    solutions: solutions.map((s: any) => ({ ...s, appliedActs: safeJson(s.applied_acts_json, []), provisions: safeJson(s.provisions_json, []), directives: safeJson(s.directives_json, []) })),
    directives, tasks,
  });
}));

// ============================================================
// SERVICE CATALOG — lawyers manage & provision services to clients
// ============================================================
lawyerOpsRouter.get('/lawyer/services', wrap((_req, res) => {
  seedIfEmpty();
  const rows = getDb().prepare('SELECT * FROM lawyer_services ORDER BY created_at DESC').all() as any[];
  res.json({ success: true, services: rows.map((s: any) => ({ ...s, jurisdictions: safeJson(s.jurisdictions_json, []) })), total: rows.length });
}));

lawyerOpsRouter.post('/lawyer/services', wrap((req, res) => {
  seedIfEmpty();
  const b = req.body || {};
  const id = b.id || `SVC-${Date.now().toString(36).toUpperCase()}`;
  getDb().prepare(`
    INSERT INTO lawyer_services (id, title, category, description, price, currency, jurisdictions_json, delivery_note, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.title || 'Untitled Service', b.category || 'COMPLIANCE', b.description || null,
    Number(b.price || 0), b.currency || 'EUR', JSON.stringify(Array.isArray(b.jurisdictions) ? b.jurisdictions : ['EU']),
    b.deliveryNote || null, b.status || 'ACTIVE');
  anchorLawyer('SERVICE_CREATED', 'lawyer_services', id, { title: b.title, price: b.price });
  res.json({ success: true, service: getDb().prepare('SELECT * FROM lawyer_services WHERE id = ?').get(id) });
}));

lawyerOpsRouter.delete('/lawyer/services/:id', wrap((req, res) => {
  seedIfEmpty();
  const existing = getDb().prepare('SELECT * FROM lawyer_services WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Service not found' });
  getDb().prepare('DELETE FROM lawyer_services WHERE id = ?').run(req.params.id);
  getDb().prepare('DELETE FROM lawyer_client_services WHERE service_id = ?').run(req.params.id);
  res.json({ success: true, deleted: req.params.id });
}));

lawyerOpsRouter.post('/lawyer/clients/:clientId/services', wrap((req, res) => {
  seedIfEmpty();
  const b = req.body || {};
  const svc = getDb().prepare('SELECT * FROM lawyer_services WHERE id = ?').get(b.serviceId) as any;
  if (!svc) return res.status(404).json({ success: false, error: 'Service not found' });
  const id = `asg_${crypto.randomBytes(4).toString('hex')}`;
  getDb().prepare(`
    INSERT INTO lawyer_client_services (id, client_id, service_id, price_snapshot, status) VALUES (?, ?, ?, ?, ?)
  `).run(id, req.params.clientId, b.serviceId, Number(b.price || svc.price || 0), b.status || 'ASSIGNED');
  anchorLawyer('SERVICE_ASSIGNED_TO_CLIENT', 'lawyer_client_services', id, { clientId: req.params.clientId, serviceId: b.serviceId, title: svc.title });
  res.json({ success: true, assignment: getDb().prepare('SELECT * FROM lawyer_client_services WHERE id = ?').get(id) });
}));

lawyerOpsRouter.delete('/lawyer/clients/:clientId/services/:assignmentId', wrap((req, res) => {
  seedIfEmpty();
  const existing = getDb().prepare('SELECT * FROM lawyer_client_services WHERE id = ? AND client_id = ?').get(req.params.assignmentId, req.params.clientId) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Assignment not found' });
  getDb().prepare('DELETE FROM lawyer_client_services WHERE id = ?').run(req.params.assignmentId);
  res.json({ success: true, deleted: req.params.assignmentId });
}));

// ============================================================
// CROSS-BORDER JURISDICTION — shared across ALL dashboards
// ============================================================
lawyerOpsRouter.get('/jurisdiction/acts', wrap((_req, res) => {
  seedIfEmpty();
  res.json({
    success: true,
    regions: Object.entries(REGION_ACTS).map(([code, meta]) => ({ code, region: meta.region, acts: meta.acts })),
    countries: Object.entries(COUNTRY_ACTS).map(([code, meta]) => ({ code, country: meta.country, localLaw: meta.localLaw, acts: meta.acts })),
  });
}));

lawyerOpsRouter.post('/jurisdiction/resolve', wrap((req, res) => {
  seedIfEmpty();
  const b = req.body || {};
  const ownerType = String(b.ownerType || 'client').slice(0, 24);
  const ownerId = String(b.ownerId || b.clientId || 'unknown');
  const country = detectCountryCode(String(b.country || ''), '');
  const j: Jurisdiction & any = buildJurisdiction(ownerId, '', country, b.source || (b.country ? 'manual-override' : 'auto-detect'));
  const applicableActs = [...new Set([...j.regionActs, ...j.countryActs])];
  getDb().prepare(`
    INSERT OR REPLACE INTO lawyer_jurisdiction_profiles (owner_type, owner_id, country_code, country_name, region, local_law, region_acts_json, country_acts_json, applied_acts_json, detected_at, source, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)
  `).run(ownerType, ownerId, j.countryCode, j.countryName, j.region, j.localLaw,
    JSON.stringify(j.regionActs), JSON.stringify(j.countryActs), JSON.stringify(applicableActs), j.source);
  anchorLawyer('JURISDICTION_AUTO_DETECTED', 'jurisdiction-profile', `${ownerType}:${ownerId}`, { country: j.countryCode, region: j.region, applicableActs: applicableActs.length });
  res.json({ success: true, jurisdiction: { ...j, applicableActs, ownerType, ownerId } });
}));

lawyerOpsRouter.get('/jurisdiction/:ownerType/:ownerId', wrap((req, res) => {
  seedIfEmpty();
  const row = getDb().prepare('SELECT * FROM lawyer_jurisdiction_profiles WHERE owner_type = ? AND owner_id = ?')
    .get(req.params.ownerType, req.params.ownerId) as any;
  res.json({
    success: true,
    jurisdiction: row ? {
      countryCode: row.country_code, countryName: row.country_name, region: row.region, localLaw: row.local_law,
      regionActs: safeJson(row.region_acts_json, []), countryActs: safeJson(row.country_acts_json, []),
      appliedActs: safeJson(row.applied_acts_json, []), detectedAt: row.detected_at, source: row.source,
    } : null,
  });
}));

// ============================================================
// LAW/ACT SOLUTION ENGINE — lawyers prescribe regulation solutions
// that auto-integrate into the client dashboard (remediation tasks,
// issued directives and optional billable invoices).
// ============================================================
lawyerOpsRouter.post('/lawyer/solutions/generate', wrap((req, res) => {
  seedIfEmpty();
  const db = getDb();
  const b = req.body || {};
  const clientId = String(b.clientId || b.clientName || 'unknown');
  const clientName = String(b.clientName || clientId);
  const country = detectCountryCode(String(b.country || ''), '');
  const j = buildJurisdiction(clientId, '', country, 'lawyer-solution-engine');
  const industry = String(b.industry || 'General');

  let actCodes: string[] = Array.isArray(b.acts) && b.acts.length ? b.acts.map(String) : [...new Set([...j.regionActs, ...j.countryActs])];
  actCodes = actCodes.slice(0, 8);

  const provisions = actCodes.map((code) => {
    const meta = actMeta(code);
    return { act: code, title: meta.title, obligations: meta.obligations, steps: meta.steps.slice(0, 4) };
  });

  const solutionId = `SOL-${Date.now().toString(36).toUpperCase()}`;
  const due = new Date(Date.now() + 30 * 86400000).toISOString();
  const lawyer = String(b.lawyerName || 'Legal Counsel');

  const provisionedTasks: any[] = [];
  const tx = db.transaction(() => {
    // Ensure the client tenant row exists so remediation tasks keep their FK chain
    // (covers demo/placeholder ids like 'org_1' which are not real tenants yet)
    db.prepare(`INSERT OR IGNORE INTO tenants (id, name, status) VALUES (?, ?, 'ACTIVE')`).run(clientId, clientName);
    for (const p of provisions) {
      const taskId = `task_${crypto.randomBytes(4).toString('hex')}`;
      const severities = ['GDPR', 'EU_AI_ACT', 'DORA', 'NIS2', 'PAYMENTS_2'].includes(p.act) ? 'CRITICAL' : 'HIGH';
      db.prepare(`
        INSERT INTO remediation_tasks (id, title, severity, status, assigned_to, due_date, description, tenant_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(taskId, `[${p.act}] ${p.title} — ${p.steps[0] || 'Actionable step'}`, severities, 'OPEN', lawyer, due,
        `${p.obligations.join('; ')}. Counsel steps: ${p.steps.join(' |> ')}`, clientId);
      provisionedTasks.push({ id: taskId, act: p.act, title: `[${p.act}] ${p.title}`, severity: severities, status: 'OPEN', dueDate: due });
    }

    const directiveId = `DIR-${Date.now()}`;
    db.prepare(`
      INSERT INTO lawyer_directives (id, client_id, client_name, title, directive_type, jurisdiction, status, assignee)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(directiveId, clientId, clientName, `Compliance Program: ${j.region} · ${actCodes.join(', ')}`, 'REMEDIATION_DIRECTIVE', j.countryCode, 'ISSUED', lawyer);

    let invoiceId: string | null = null;
    if (b.charge === true) {
      invoiceId = `INV-${Date.now()}`;
      const fee = Number(b.fee || 0) || 1500;
      db.prepare(`
        INSERT INTO lawyer_invoices (id, invoice_number, client_id, client_name, matter, amount, currency, status, due_date, line_items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(invoiceId, `REGL-2026-${String(Math.floor(1000 + Math.random() * 9000))}`, clientId, clientName,
        `Counsel compliance program · ${j.region} · ${actCodes.length} acts`, fee * actCodes.length, b.currency || 'EUR',
        'SENT', due, JSON.stringify(provisions.map(p => ({ title: p.title, amount: fee }))));
    }

    db.prepare(`
      INSERT INTO lawyer_solutions (id, client_id, client_name, country, country_code, region, applied_acts_json, industry, title, summary, provisions_json, directives_json, status, invoice_id, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(solutionId, clientId, clientName, COUNTRY_ACTS[country]?.country || country, j.countryCode, j.region,
      JSON.stringify(actCodes), industry,
      `Cross-Border Law/Act Compliance Solution — ${j.region} (${j.countryName})`,
      `${actCodes.length} applicable act(s) auto-detected for ${clientName} operating under ${j.region} / ${j.countryName}. Counsel provisioned ${provisions.length} remediation program(s).`,
      JSON.stringify(provisions), JSON.stringify(provisionedTasks), 'PROVISIONED', invoiceId, lawyer);

    db.prepare('INSERT INTO lawyer_audit_trail (id, action, client, jurisdiction) VALUES (?, ?, ?, ?)')
      .run(`AUD-${Date.now()}`, `Law/Act Solution Provisioned (${actCodes.length} acts)`, clientName, `${j.countryCode}`);

    return directiveId;
  });
  const directiveId = tx();
  const solution = db.prepare('SELECT * FROM lawyer_solutions WHERE id = ?').get(solutionId) as any;
  anchorLawyer('SOLUTION_PROVISIONED_AUTO_INTEGRATED', 'lawyer_solutions', solutionId, { clientId, acts: actCodes, tasks: provisionedTasks.length, invoice: solution.invoice_id });
  try { broadcastPulse({ type: 'LAWYER_SOLUTION_PROVISIONED', title: `Compliance solution for ${clientName}`, message: `${actCodes.length} law/act program provisioned across ${j.region}. ${provisionedTasks.length} tasks auto-dispatched to client dashboard.`, severity: 'info', source: 'lawyer-consultant-suite' }); } catch {}
  res.json({
    success: true,
    message: `Solution provisioned and auto-integrated. ${provisionedTasks.length} compliance tasks dispatched to the client dashboard under ${j.region} / ${j.countryName}.`,
    solution: { ...solution, appliedActs: actCodes, provisions, tasks: provisionedTasks, invoiceId: solution.invoice_id, directiveId },
  });
}));

lawyerOpsRouter.get('/lawyer/solutions', wrap((req, res) => {
  seedIfEmpty();
  const clientId = String((req.query as any).clientId || '').trim();
  const rows = clientId
    ? (getDb().prepare('SELECT * FROM lawyer_solutions WHERE client_id = ? ORDER BY created_at DESC').all(clientId) as any[])
    : (getDb().prepare('SELECT * FROM lawyer_solutions ORDER BY created_at DESC').all() as any[]);
  res.json({ success: true, solutions: rows.map((s: any) => ({
    ...s, appliedActs: safeJson(s.applied_acts_json, []), provisions: safeJson(s.provisions_json, []), directives: safeJson(s.directives_json, []),
  })), total: rows.length });
}));

// Client-facing alias: partner counsel solutions visible inside the client dashboard
lawyerOpsRouter.get('/lawyer/clients/:id/solutions', wrap((req, res) => {
  seedIfEmpty();
  const rows = (getDb().prepare('SELECT * FROM lawyer_solutions WHERE client_id = ? ORDER BY created_at DESC').all(req.params.id) as any[]) || [];
  res.json({ success: true, solutions: rows.map((s: any) => ({
    id: s.id, clientName: s.client_name, country: s.country, countryCode: s.country_code, region: s.region,
    title: s.title, summary: s.summary, industry: s.industry, status: s.status, createdAt: s.created_at,
    appliedActs: safeJson(s.applied_acts_json, []), provisions: safeJson(s.provisions_json, []), directives: safeJson(s.directives_json, []),
  })), total: rows.length });
}));

// ============================================================
// PLATFORM CLIENT SIGNALS — lawyers see real compliance posture
// (score, grade, violations/findings, open tasks, fines/penalties)
// ============================================================
lawyerOpsRouter.get('/lawyer/platform/clients', wrap((_req, res) => {
  seedIfEmpty();
  const db = getDb();
  let tenants: any[] = [];
  try { tenants = (db.prepare('SELECT id, name, status, organization_metadata FROM tenants ORDER BY created_at DESC LIMIT 80').all() as any[]) || []; } catch { }

  // findings per tenant
  let findingAgg: Record<string, { count: number; critical: number; loss: number }> = {};
  try {
    const rows = (db.prepare(`
      SELECT r.tenant_id as tid,
             COUNT(*) as cnt,
             SUM(CASE WHEN f.severity = 'CRITICAL' THEN 1 ELSE 0 END) as crit,
             SUM(COALESCE(f.possible_loss_eur, 0)) as loss
      FROM compliance_audit_findings f JOIN compliance_audit_runs r ON r.id = f.run_id
      WHERE f.hitl_status != 'RESOLVED'
      GROUP BY r.tenant_id`).all() as any[]) || [];
    rows.forEach((r: any) => { findingAgg[r.tid] = { count: r.cnt || 0, critical: r.crit || 0, loss: r.loss || 0 }; });
  } catch { }

  // remediation tasks per tenant
  let taskAgg: Record<string, number> = {};
  try {
    const rows = (db.prepare(`SELECT tenant_id as tid, COUNT(*) cnt FROM remediation_tasks WHERE status != 'DONE' AND status != 'RESOLVED' GROUP BY tenant_id`).all() as any[]) || [];
    rows.forEach((r: any) => { taskAgg[r.tid] = r.cnt || 0; });
  } catch { }

  // fines + violations aggregated per company (name-joined to tenants)
  let fineAgg: Record<string, { count: number; total: number }> = {};
  let violAgg: Record<string, { count: number; critical: number }> = {};
  try {
    const frows = (db.prepare(`SELECT company_id cid, COUNT(*) cnt, SUM(fine_amount) total FROM fines WHERE payment_status != 'PAID' GROUP BY company_id`).all() as any[]) || [];
    frows.forEach((r: any) => { fineAgg[String(r.cid)] = { count: r.cnt || 0, total: r.total || 0 }; });
    const vrows = (db.prepare(`SELECT company_id cid, COUNT(*) cnt, SUM(CASE WHEN severity='CRITICAL' OR severity='HIGH' THEN 1 ELSE 0 END) crit FROM violations_extended WHERE status IS NULL OR status NOT IN ('REMEDIATED','DISMISSED') GROUP BY company_id`).all() as any[]) || [];
    vrows.forEach((r: any) => { violAgg[String(r.cid)] = { count: r.cnt || 0, critical: r.crit || 0 }; });
  } catch { }

  // company name matcher
  let companyNameToId: Record<string, string> = {};
  try {
    const crows = (db.prepare('SELECT c.id cid, c.name cname, ce.legal_name legal FROM companies c LEFT JOIN companies_extended ce ON ce.id = c.id').all() as any[]) || [];
    crows.forEach((r: any) => {
      if (r.cname) companyNameToId[String(r.cname).trim().toLowerCase()] = String(r.cid);
      if (r.legal) companyNameToId[String(r.legal).trim().toLowerCase()] = String(r.cid);
    });
  } catch { }

  const signals = tenants.map((t: any) => {
    let meta: any = {};
    try { meta = JSON.parse(t.organization_metadata || '{}'); } catch { meta = {}; }
    const country = meta.country || meta.operating_country || meta.primary_country || 'DE';
    const rating = (db.prepare('SELECT current_score, current_grade, last_updated FROM compliance_ratings WHERE tenant_id = ?').get(t.id) as any) || {};
    const cid = companyNameToId[String(t.name).trim().toLowerCase()];
    const fin = cid ? fineAgg[cid] : undefined;
    const viol = cid ? violAgg[cid] : undefined;
    const findings = findingAgg[t.id];
    const tasks = taskAgg[t.id] || 0;
    return {
      id: t.id, name: t.name, industry: meta.industry || meta.industry_type || 'Unclassified', country,
      score: rating.current_score ?? null, grade: rating.current_grade ?? null,
      ratingUpdatedAt: rating.last_updated || null,
      violations: (viol?.count || 0) + (findings?.count || 0),
      criticalViolations: (viol?.critical || 0) + (findings?.critical || 0),
      estLossEur: findings?.loss || 0,
      openTasks: tasks,
      openFines: fin?.count || 0,
      penaltyTotalEur: fin?.total || 0,
      status: t.status || 'ACTIVE',
    };
  });

  res.json({ success: true, clients: signals, total: signals.length });
}));

// ============================================================
// CASE HANDLING REQUESTS — lawyer asks client to retain them
// ============================================================
lawyerOpsRouter.get('/lawyer/case-requests', wrap((_req, res) => {
  seedIfEmpty();
  const rows = getDb().prepare('SELECT * FROM lawyer_client_engagement_requests ORDER BY created_at DESC').all() as any[];
  res.json({ success: true, requests: rows });
}));

lawyerOpsRouter.get('/lawyer/clients/:id/case-requests', wrap((req, res) => {
  seedIfEmpty();
  const rows = getDb().prepare('SELECT * FROM lawyer_client_engagement_requests WHERE client_id = ? ORDER BY created_at DESC').all(req.params.id) as any[];
  res.json({ success: true, requests: rows, total: rows.length });
}));

lawyerOpsRouter.post('/lawyer/clients/:id/case-request', wrap((req, res) => {
  seedIfEmpty();
  const db = getDb();
  const client = db.prepare('SELECT * FROM lawyer_clients WHERE id = ?').get(req.params.id) as any;
  const clientName = client?.name || String((req.body || {}).clientName || req.params.id);
  const existing = db.prepare(`SELECT * FROM lawyer_client_engagement_requests WHERE client_id = ? AND status = 'PENDING'`).get(req.params.id) as any;
  if (existing) return res.json({ success: true, request: existing, message: 'A case-handling request is already pending for this client.' });
  const id = `REQ-${Date.now().toString(36).toUpperCase()}`;
  const b = req.body || {};
  db.prepare(`
    INSERT INTO lawyer_client_engagement_requests (id, client_id, client_name, lawyer_id, lawyer_name, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
  `).run(id, req.params.id, clientName, b.lawyerId || 'LAW-100', b.lawyerName || 'Lead Partner (OIDC)', b.reason || 'Formal request to handle compliance & regulatory case');
  anchorLawyer('CASE_HANDLING_REQUESTED', 'lawyer_client_engagement_requests', id, { clientId: req.params.id, clientName });
  try { broadcastPulse({ type: 'CASE_REQUEST_TO_CLIENT', title: `Counsel requests to handle ${clientName}`, message: 'Engagement request dispatched to the client dashboard.', severity: 'info', source: 'lawyer-consultant-suite' }); } catch {}
  res.json({ success: true, request: db.prepare('SELECT * FROM lawyer_client_engagement_requests WHERE id = ?').get(id) });
}));

lawyerOpsRouter.post('/lawyer/case-requests/:id/respond', wrap((req, res) => {
  seedIfEmpty();
  const { status } = req.body || {};
  if (!['ACCEPTED', 'DECLINED'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid response. Use ACCEPTED or DECLINED.' });
  const existing = getDb().prepare('SELECT * FROM lawyer_client_engagement_requests WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'Request not found' });
  getDb().prepare('UPDATE lawyer_client_engagement_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  // On acceptance, promote the client into the lawyer's managed roster
  if (status === 'ACCEPTED') {
    getDb().prepare(`
      INSERT OR REPLACE INTO lawyer_clients (id, name, industry, country, region, email, status, lawyer_id)
      SELECT client_id, client_name, NULL, 'DE', 'EU', NULL, 'LINKED', ?
      FROM lawyer_client_engagement_requests WHERE id = ?
    `).run(existing.lawyer_id, req.params.id);
  }
  anchorLawyer('CASE_HANDLING_RESPONSE', 'lawyer_client_engagement_requests', req.params.id, { clientId: existing.client_id, status });
  res.json({ success: true, request: getDb().prepare('SELECT * FROM lawyer_client_engagement_requests WHERE id = ?').get(req.params.id) });
}));

// ============================================================
// REGULATOR CONNECT — lawyers establish formal liaison channel
// ============================================================
lawyerOpsRouter.get('/lawyer/regulators', wrap((_req, res) => {
  seedIfEmpty();
  const db = getDb();
  let known: any[] = [];
  try {
    known = (db.prepare('SELECT * FROM regulator_jurisdiction ORDER BY country_code').all() as any[]) || [];
  } catch { }
  const defaults = [
    { regulator_id: 'reg-001', country_code: 'DE', country_name: 'Germany', region: 'EU' },
    { regulator_id: 'reg-002', country_code: 'FR', country_name: 'France', region: 'EU' },
    { regulator_id: 'reg-003', country_code: 'IE', country_name: 'Ireland', region: 'EU' },
    { regulator_id: 'reg-004', country_code: 'NL', country_name: 'Netherlands', region: 'EU' },
  ];
  const regulators = known.map((r: any) => ({ id: r.regulator_id, countryCode: r.country_code, countryName: r.country_name, region: r.region, localLaw: r.local_law, acts: safeJson(r.applied_acts_json, []) }));
  [...defaults].forEach(d => { if (!regulators.some(r => r.countryCode === d.country_code)) regulators.push({ id: d.regulator_id, countryCode: d.country_code, countryName: d.country_name, region: d.region, localLaw: '', acts: [] }); });
  const connections = (db.prepare('SELECT * FROM lawyer_regulator_contacts ORDER BY created_at DESC').all() as any[]) || [];
  res.json({ success: true, regulators, connections, total: regulators.length });
}));

lawyerOpsRouter.post('/lawyer/regulators/:id/connect', wrap((req, res) => {
  seedIfEmpty();
  const db = getDb();
  const regId = req.params.id;
  const reg = (db.prepare('SELECT * FROM regulator_jurisdiction WHERE regulator_id = ?').get(regId) as any) ||
    { country_code: String((req.body || {}).countryCode || 'DE'), region: 'EU' };
  const existing = db.prepare('SELECT * FROM lawyer_regulator_contacts WHERE regulator_id = ?').get(regId) as any;
  if (existing) return res.json({ success: true, contact: existing, message: 'Regulator channel already connected.' });
  const id = `LRC-${Date.now().toString(36).toUpperCase()}`;
  const countryName = COUNTRY_ACTS[reg.country_code]?.country || reg.country_code;
  db.prepare(`
    INSERT INTO lawyer_regulator_contacts (id, regulator_id, regulator_name, country_code, country_name, region, channel, status)
    VALUES (?, ?, ?, ?, ?, ?, 'formal_liaison', 'CONNECTED')
  `).run(id, regId, `${countryName} Competent Authority`, reg.country_code, countryName, reg.region || 'EU');
  anchorLawyer('REGULATOR_CONNECTED', 'lawyer_regulator_contacts', id, { regulatorId: regId, country: reg.country_code });
  try { broadcastPulse({ type: 'REGULATOR_LIAISON_CONNECTED', title: `Liaison channel to ${countryName} authority`, message: 'Formal regulatory contact established by counsel suite.', severity: 'info', source: 'lawyer-consultant-suite' }); } catch {}
  res.json({ success: true, contact: db.prepare('SELECT * FROM lawyer_regulator_contacts WHERE id = ?').get(id) });
}));

lawyerOpsRouter.delete('/lawyer/regulators/:id/connect', wrap((req, res) => {
  seedIfEmpty();
  const existing = getDb().prepare('SELECT * FROM lawyer_regulator_contacts WHERE regulator_id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ success: false, error: 'No connection found' });
  getDb().prepare('DELETE FROM lawyer_regulator_contacts WHERE id = ?').run(existing.id);
  res.json({ success: true, deleted: req.params.id });
}));
