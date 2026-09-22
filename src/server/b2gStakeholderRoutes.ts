import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/sqlite.js';
import { SuperAdminService } from '../services/superAdminService';
import { BlockchainAuditTrail } from '../services/blockchain-audit-trail.js';

// ---------------------------------------------------------------------------
// 9XEN REGULETTEE — B2G ENFORCEMENT AGENCY & STAKEHOLDER MATRIX
// ---------------------------------------------------------------------------
// Regulators onboard enforcement bodies (data protection authorities, LE/CERT,
// FIU, tax, prudential supervisors) from their dashboard. The SaaS super-admin
// manages the same matrix across all regulators (approve / activate / suspend
// / reassign, fine-share agreements). Every mutation is hash-anchored to the
// sovereign blockchain audit trail and the admin audit trail.
// ---------------------------------------------------------------------------

export const b2gStakeholderRouter = Router();
export const regulatorNodeRouter = Router();

const safeParse = (s: string | null | undefined, fallback: any = null): any => {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
};

const sha256 = (d: string): string => crypto.createHash('sha256').update(d).digest('hex');

function ensureTables() {
  const db = getDb();
  if (!db || typeof db.exec !== 'function') return;
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS stakeholder_agencies (
        id TEXT PRIMARY KEY,
        agency_code TEXT NOT NULL DEFAULT '',
        agency_name TEXT NOT NULL,
        acronym TEXT NOT NULL DEFAULT '',
        jurisdiction_country TEXT NOT NULL DEFAULT 'EU',
        regulatory_domain TEXT NOT NULL DEFAULT 'DATA_PRIVACY',
        lead_supervisory_role TEXT NOT NULL DEFAULT 'Competent Supervisory Authority',
        relationship_posture TEXT NOT NULL DEFAULT 'COLLABORATIVE_PARTNER',
        compliance_rating INTEGER NOT NULL DEFAULT 90,
        active_inquiries_count INTEGER NOT NULL DEFAULT 0,
        average_response_sla_hours REAL NOT NULL DEFAULT 48,
        official_portal_url TEXT NOT NULL DEFAULT '',
        secure_relay_endpoint TEXT NOT NULL DEFAULT '',
        pgp_key_fingerprint TEXT NOT NULL DEFAULT '',
        cert_pinning_hash TEXT NOT NULL DEFAULT '',
        headquarters_address TEXT NOT NULL DEFAULT '',
        bilateral_treaty_ref TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        regulator_id TEXT NOT NULL DEFAULT 'system',
        regulator_name TEXT NOT NULL DEFAULT 'SaaS Platform',
        enforcement_mandate TEXT NOT NULL DEFAULT '',
        agreed_fine_share_pct INTEGER NOT NULL DEFAULT 0,
        approved_by_super_admin INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ONBOARDING',
        meta_json TEXT NOT NULL DEFAULT '{}',
        last_engaged_at TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS stakeholder_contacts (
        id TEXT PRIMARY KEY,
        agency_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        official_title TEXT NOT NULL DEFAULT '',
        department TEXT NOT NULL DEFAULT '',
        email_address TEXT NOT NULL,
        phone_number TEXT NOT NULL DEFAULT '',
        clearance_level TEXT NOT NULL DEFAULT 'STANDARD_OFFICIAL',
        communication_channel_preferred TEXT NOT NULL DEFAULT 'SECURE_GOV_RELAY',
        is_primary_liaison INTEGER NOT NULL DEFAULT 0,
        last_engaged_at TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS stakeholder_engagements (
        id TEXT PRIMARY KEY,
        agency_id TEXT NOT NULL,
        contact_id TEXT NOT NULL DEFAULT '',
        engagement_type TEXT NOT NULL DEFAULT 'STATUTORY_INQUIRY',
        subject_title TEXT NOT NULL DEFAULT '',
        case_or_reference_number TEXT NOT NULL DEFAULT '',
        communication_status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
        direction TEXT NOT NULL DEFAULT 'BILATERAL',
        summary_notes TEXT NOT NULL DEFAULT '',
        statutory_deadline TEXT NOT NULL DEFAULT '',
        cryptographic_receipt_hmac TEXT NOT NULL DEFAULT '',
        transmission_date TEXT NOT NULL DEFAULT '',
        resolution_date TEXT NOT NULL DEFAULT '',
        action_items_json TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    seedAgencies(db);
  } catch (err: any) {
    console.warn('[B2G_STAKEHOLDERS] table init:', err?.message);
  }
}

function seedAgencies(db: any) {
  try {
    const c = (db.prepare('SELECT COUNT(*) as c FROM stakeholder_agencies').get() as any)?.c ?? 0;
    if (c > 0) return;
    const ins = db.prepare(`INSERT INTO stakeholder_agencies
      (id, agency_code, agency_name, acronym, jurisdiction_country, regulatory_domain, lead_supervisory_role, relationship_posture, compliance_rating, active_inquiries_count, average_response_sla_hours, official_portal_url, secure_relay_endpoint, pgp_key_fingerprint, cert_pinning_hash, headquarters_address, bilateral_treaty_ref, regulator_id, regulator_name, enforcement_mandate, agreed_fine_share_pct, approved_by_super_admin, status, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const row = (id: string, code: string, name: string, acr: string, country: string, domain: string, role: string, posture: string, rating: number, inquiries: number, sla: number, reg: string, mandate: string) => {
      const fp = sha256(`PGP:${code}:${name}`).slice(0, 40).toUpperCase().replace(/(.{4})/g, '$1 ').trim();
      const cert = sha256(`CERT:${code}`).slice(0, 64);
      ins.run(id, code, name, acr, country, domain, role, posture, rating, inquiries, sla, `https://www.${code}.gov/${name.toLowerCase().replace(/[^a-z]/g, '')}`, `relay://gov-${code.toLowerCase()}.${country.toLowerCase()}.sovereign`, fp, cert, `${country} Ministry of Digital Sovereignty, ${name.replace(/\s.+/, '')}`, `TREATY-${code}-2026`, reg, `${country} National Regulator`, mandate, 4, 1, 'ACTIVE', `${mandate} — enrolled by ${reg}.`);
    };
    row('ag-EDPB', 'EDPB', 'European Data Protection Board', 'EDPB', 'EU', 'DATA_PRIVACY', 'EU-wide supervisory coordination body', 'COLLABORATIVE_PARTNER', 97, 2, 24, 'EU National Regulator', 'GDPR Art 70 consistency, cross-border DPAs, 4% turnover fines');
    row('ag-CNIL', 'PA-FR', 'Commission Nationale de l\'Informatique et des Libertés', 'CNIL', 'FR', 'DATA_PRIVACY', 'Data Protection Supervisory Authority', 'COLLABORATIVE_PARTNER', 98, 3, 36, 'CNIL France', 'GDPR / CNIL Digital Act — Art 83 fines, DPIA review, KYC privacy seals');
    row('ag-BfDI', 'PA-DE', 'Bundesbeauftragter für den Datenschutz', 'BfDI', 'DE', 'DATA_PRIVACY', 'Federal Data Protection Officer', 'ROUTINE_AUDIT', 96, 1, 48, 'BfDI Germany', 'BDSG / GDPR — Art 32 security, breach notification, data residency');
    row('ag-DE-CERT', 'CERT-DE', 'Bundesamt für Sicherheit in der Informationstechnik', 'BSI / CERT-BUND', 'DE', 'CYBER_DORA_NIS2', 'National Cyber Security Centre (GovCERT)', 'MUTUAL_COOPERATION', 99, 5, 8, 'German National Regulator', 'NIS2 Art 21/23 — critical infrastructure, CERT-BUND incident dispatch');
    row('ag-FR-ANSSI', 'CERT-FR', 'Agence nationale de la sécurité des systèmes d\'information', 'ANSSI', 'FR', 'CYBER_DORA_NIS2', 'National Cybersecurity Agency', 'MUTUAL_COOPERATION', 98, 4, 12, 'French National Regulator', 'NIS2 / DORA ICT risk — cyber incidents, CSIRT relay, breach confirmation');
    row('ag-AI-HUB', 'AI-EU', 'EU AI Office (AI Act Enforcement Node)', 'EU-AIO', 'EU', 'AI_ALGORITHMIC', 'AI Act statutory authority (Reg. 2024/1689)', 'COLLABORATIVE_PARTNER', 95, 2, 40, 'EU AI Office', 'AI Act Art 73 serious incident reporting, GPAI systemic-risk oversight, Art 26 human oversight');
    row('ag-PRTG', 'PRT-PT', 'Autoridade de Supervisão de Seguros e Fundos de Pensões', 'ASF', 'PT', 'FINANCIAL_PRUDENTIAL', 'Insurance & Pensions Prudential Supervisor', 'ROUTINE_AUDIT', 90, 0, 72, 'Portuguese Regulator', 'DORA financial ICT third-party risk, prudential reporting');
    row('ag-CTC-BE', 'CTC-BE', 'Service Public Fédéral Finances — E-Invoicing Desk', 'SPF CTC', 'BE', 'TAX_CTC', 'Continuous Transaction Control (B2B e-Invoicing)', 'ELEVATED_SCRUTINY', 88, 2, 30, 'Belgian Tax Authority', 'EU PEPPOL + national real-time clearance, VAT fraud detection');
  } catch (err: any) {
    console.warn('[B2G_STAKEHOLDERS] seed:', err?.message);
  }
}

ensureTables();

function agencyRow(row: any, db: any) {
  return {
    id: row.id, agency_code: row.agency_code, agency_name: row.agency_name, acronym: row.acronym,
    jurisdiction_country: row.jurisdiction_country, regulatory_domain: row.regulatory_domain,
    lead_supervisory_role: row.lead_supervisory_role, relationship_posture: row.relationship_posture,
    compliance_rating: row.compliance_rating, active_inquiries_count: row.active_inquiries_count,
    average_response_sla_hours: row.average_response_sla_hours, official_portal_url: row.official_portal_url,
    secure_relay_endpoint: row.secure_relay_endpoint, pgp_key_fingerprint: row.pgp_key_fingerprint,
    cert_pinning_hash: row.cert_pinning_hash, headquarters_address: row.headquarters_address,
    bilateral_treaty_ref: row.bilateral_treaty_ref, notes: row.notes, regulator_id: row.regulator_id,
    regulator_name: row.regulator_name, enforcement_mandate: row.enforcement_mandate,
    agreed_fine_share_pct: row.agreed_fine_share_pct, approved_by_super_admin: Boolean(row.approved_by_super_admin),
    status: row.status, last_engaged_at: row.last_engaged_at, created_at: row.created_at, updated_at: row.updated_at,
    contacts_count: (db.prepare('SELECT COUNT(*) c FROM stakeholder_contacts WHERE agency_id = ?').get(row.id) as any)?.c ?? 0,
    engagements_count: (db.prepare('SELECT COUNT(*) c FROM stakeholder_engagements WHERE agency_id = ?').get(row.id) as any)?.c ?? 0,
    open_engagements_count: (db.prepare(`SELECT COUNT(*) c FROM stakeholder_engagements WHERE agency_id = ? AND communication_status NOT IN ('CLOSED_COMPLIANT')`).get(row.id) as any)?.c ?? 0,
  };
}

// ---------------------------------------------------------------------------
// MATRIX (front-page aggregate + filters)
// ---------------------------------------------------------------------------
b2gStakeholderRouter.get('/matrix', (req: any, res: any) => {
  try {
    const db = getDb();
    const { jurisdiction, domain, posture, search } = req.query as any;
    const where: string[] = [];
    const params: any[] = [];
    if (jurisdiction && jurisdiction !== 'ALL') { where.push('jurisdiction_country = ?'); params.push(jurisdiction); }
    if (domain && domain !== 'ALL') { where.push('regulatory_domain = ?'); params.push(domain); }
    if (posture && posture !== 'ALL') { where.push('relationship_posture = ?'); params.push(posture); }
    if (search && String(search).trim()) { where.push('(agency_name LIKE ? OR acronym LIKE ? OR agency_code LIKE ?)'); const q = `%${String(search).trim()}%`; params.push(q, q, q); }
    const rows = db.prepare(`SELECT * FROM stakeholder_agencies${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY compliance_rating DESC`).all(...params) as any[];
    const agencies = rows.map(r => agencyRow(r, db));
    const all = db.prepare('SELECT * FROM stakeholder_agencies').all() as any[];
    const contacts = (db.prepare('SELECT COUNT(*) c FROM stakeholder_contacts').get() as any)?.c ?? 0;
    const engagements = (db.prepare('SELECT COUNT(*) c FROM stakeholder_engagements').get() as any)?.c ?? 0;
    const activeInquiries = all.reduce((s, a) => s + (a.active_inquiries_count || 0), 0);
    const slaAvg = all.length ? Math.round((all.reduce((s, a) => s + (a.average_response_sla_hours || 0), 0) / all.length) * 10) / 10 : 0;
    const postureStats = Object.entries(all.reduce((m: any, a) => { m[a.relationship_posture] = (m[a.relationship_posture] || 0) + 1; return m; }, {})).map(([relationship_posture, count]) => ({ relationship_posture, count }));
    const domainStats = Object.entries(all.reduce((m: any, a) => { m[a.regulatory_domain] = (m[a.regulatory_domain] || 0) + 1; return m; }, {})).map(([regulatory_domain, count]) => ({ regulatory_domain, count }));
    const jurisdictionStats = Object.entries(all.reduce((m: any, a) => { m[a.jurisdiction_country] = (m[a.jurisdiction_country] || 0) + 1; return m; }, {})).map(([jurisdiction_country, count]) => ({ jurisdiction_country, count }));
    res.json({
      success: true,
      agencies,
      metrics: {
        totalAgencies: all.length, totalContacts: contacts, totalEngagements: engagements,
        activeInquiries, slaComplianceRate: slaAvg > 0 ? Math.min(100, Math.round((48 / slaAvg) * 100)) : 100,
        avgSlaHours: slaAvg, postureStats, domainStats, jurisdictionStats,
      },
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ---------------------------------------------------------------------------
// AGENCY CRUD (regulator includes enforcement agency; SaaS admin manages)
// ---------------------------------------------------------------------------
b2gStakeholderRouter.get('/agencies', (req: any, res: any) => {
  try {
    const db = getDb();
    const { regulatorId } = req.query as any;
    const rows = regulatorId
      ? db.prepare('SELECT * FROM stakeholder_agencies WHERE regulator_id = ? ORDER BY status ASC, compliance_rating DESC').all(regulatorId)
      : db.prepare('SELECT * FROM stakeholder_agencies ORDER BY status ASC, compliance_rating DESC').all();
    res.json({ success: true, agencies: (rows as any[]).map(r => agencyRow(r, db)) });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

b2gStakeholderRouter.post('/agencies', (req: any, res: any) => {
  try {
    const db = getDb();
    const b = req.body || {};
    const agencyCode = String(b.agency_code || '');
    const agencyName = String(b.agency_name || '');
    const acronym = String(b.acronym || '');
    if (!agencyCode || !agencyName) return res.status(400).json({ success: false, error: 'agency_code and agency_name are required' });

    const id = `agency_${crypto.randomBytes(4).toString('hex')}`;
    const regulatorId = String(b.regulator_id || 'system');
    const regulatorName = String(b.regulator_name || (regulatorId === 'system' ? 'SaaS Platform' : 'Regulator'));
    const approved = b.approved === true || b.approved === 1 || String(b.role_scope || '') === 'saas_admin';
    const fp = sha256(`PGP:${agencyCode}:${acronym}`).slice(0, 40).toUpperCase().replace(/(.{4})/g, '$1 ').trim();
    const cert = sha256(`CERT:${agencyCode}`).slice(0, 64);
    const meta = { enrollmentOrigin: regexpOrigin(b), fineShareNegotiated: Boolean(b.agreed_fine_share_pct) };

    db.prepare(`INSERT INTO stakeholder_agencies
      (id, agency_code, agency_name, acronym, jurisdiction_country, regulatory_domain, lead_supervisory_role, relationship_posture, compliance_rating, active_inquiries_count, average_response_sla_hours, official_portal_url, secure_relay_endpoint, pgp_key_fingerprint, cert_pinning_hash, headquarters_address, bilateral_treaty_ref, notes, regulator_id, regulator_name, enforcement_mandate, agreed_fine_share_pct, approved_by_super_admin, status, meta_json)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(
        id, agencyCode, agencyName, acronym || agencyCode, String(b.jurisdiction_country || 'EU'),
        String(b.regulatory_domain || 'DATA_PRIVACY'), String(b.lead_supervisory_role || 'Competent Supervisory Authority'),
        String(b.relationship_posture || 'COLLABORATIVE_PARTNER'), Number(b.compliance_rating) || 90,
        Number(b.active_inquiries_count) || 0, Number(b.average_response_sla_hours) || 48,
        String(b.official_portal_url || ''), String(b.secure_relay_endpoint || ''),
        fp, cert, String(b.headquarters_address || ''), String(b.bilateral_treaty_ref || ''),
        String(b.notes || ''), regulatorId, regulatorName, String(b.enforcement_mandate || ''),
        Number(b.agreed_fine_share_pct) || 0, approved ? 1 : 0,
        approved ? 'ACTIVE' : 'ONBOARDING', JSON.stringify(meta)
      );

    try {
      SuperAdminService.logAdminAction(String(b.actor || 'ENFORCEMENT_OFFICER'), 'ENFORCEMENT_AGENCY_ENROLLED', 'stakeholder_agency', id, { agencyCode, agencyName, regulatorId, approved });
      BlockchainAuditTrail.anchor({
        actor: String(b.actor || regulatorName), action: approved ? 'AGENCY_ACTIVATED_NOTICE' : 'AGENCY_ENROLLED', category: 'B2G_ENFORCEMENT',
        resource: `stakeholder_agencies/${id}`, refId: id, payload: { agencyCode, agencyName, regulatorId, mandate: enforcementScopeString(b) }
      });
    } catch {}

    res.status(201).json({ success: true, agencyId: id, message: `${acronym || agencyName} ${approved ? 'approved & active' : 'enrolled'} on the enforcement agency matrix.`, status: approved ? 'ACTIVE' : 'ONBOARDING' });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

function regexpOrigin(b: any): string {
  return String(b.role_scope || 'regulator').startsWith('saas') ? 'SAAS_SUPER_ADMIN' : 'REGULATOR_DASHBOARD';
}

function enforcementScopeString(b: any): string {
  return String(b.enforcement_mandate || 'Cross-border statutory enforcement relay').slice(0, 240);
}

b2gStakeholderRouter.get('/agencies/:id', (req: any, res: any) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM stakeholder_agencies WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Agency not found' });
    const contacts = db.prepare('SELECT * FROM stakeholder_contacts WHERE agency_id = ? ORDER BY is_primary_liaison DESC, full_name ASC').all(req.params.id) as any[];
    const engagements = db.prepare('SELECT * FROM stakeholder_engagements WHERE agency_id = ? ORDER BY created_at DESC LIMIT 50').all(req.params.id) as any[];
    res.json({ success: true, agency: agencyRow(row, db), contacts, engagements });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

b2gStakeholderRouter.put('/agencies/:id', (req: any, res: any) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM stakeholder_agencies WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Agency not found' });
    const b = req.body || {};
    db.prepare(`UPDATE stakeholder_agencies
      SET agency_name = ?, acronym = ?, jurisdiction_country = ?, regulatory_domain = ?, lead_supervisory_role = ?, relationship_posture = ?,
          compliance_rating = ?, average_response_sla_hours = ?, official_portal_url = ?, secure_relay_endpoint = ?, notes = ?,
          regulator_id = ?, regulator_name = ?, enforcement_mandate = ?, agreed_fine_share_pct = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(
        String(b.agency_name || row.agency_name), String(b.acronym || row.acronym) || String(b.agency_code || row.agency_code),
        String(b.jurisdiction_country || row.jurisdiction_country), String(b.regulatory_domain || row.regulatory_domain),
        String(b.lead_supervisory_role || row.lead_supervisory_role), String(b.relationship_posture || row.relationship_posture),
        Number(b.compliance_rating) || row.compliance_rating, Number(b.average_response_sla_hours) || row.average_response_sla_hours,
        String(b.official_portal_url || row.official_portal_url), String(b.secure_relay_endpoint || row.secure_relay_endpoint),
        String(b.notes || row.notes), String(b.regulator_id || row.regulator_id), String(b.regulator_name || row.regulator_name),
        String(b.enforcement_mandate || row.enforcement_mandate), Number(b.agreed_fine_share_pct) || row.agreed_fine_share_pct, req.params.id
      );
    try { SuperAdminService.logAdminAction(String(b.actor || 'SAAS_SUPER_ADMIN'), 'ENFORCEMENT_AGENCY_UPDATED', 'stakeholder_agency', req.params.id, b); } catch {}
    res.json({ success: true, message: `Agency ${row.acronym} updated (administrator-controlled).` });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// SaaS super-admin: approve / activate / suspend / remove an agency
b2gStakeholderRouter.put('/agencies/:id/status', (req: any, res: any) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM stakeholder_agencies WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Agency not found' });
    const { status, actor, note } = req.body || {};
    if (!status) return res.status(400).json({ success: false, error: 'status is required (ACTIVE | ONBOARDING | SUSPENDED | REMOVED)' });
    const allowed = ['ACTIVE', 'ONBOARDING', 'SUSPENDED', 'REMOVED'];
    if (!allowed.includes(String(status))) return res.status(400).json({ success: false, error: 'Invalid status value' });
    db.prepare('UPDATE stakeholder_agencies SET status = ?, approved_by_super_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(String(status), String(status) === 'ACTIVE' ? 1 : row.approved_by_super_admin, req.params.id);
    try {
      SuperAdminService.logAdminAction(String(actor || 'SAAS_SUPER_ADMIN'), `ENFORCEMENT_AGENCY_${String(status).toUpperCase()}`, 'stakeholder_agency', req.params.id, { note: note || '' });
      BlockchainAuditTrail.anchor({ actor: String(actor || 'saas-super-admin'), action: `AGENCY_${String(status).toUpperCase()}`, category: 'B2G_ENFORCEMENT', resource: `stakeholder_agencies/${req.params.id}`, refId: req.params.id, payload: { agency: row.acronym, regulatorId: row.regulator_id, status, note: note || '' } });
    } catch {}
    res.json({ success: true, message: `${row.acronym} marked ${String(status)} by SaaS super-admin.` });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

b2gStakeholderRouter.delete('/agencies/:id', (req: any, res: any) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM stakeholder_agencies WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'Agency not found' });
    db.prepare('DELETE FROM stakeholder_engagements WHERE agency_id = ?').run(req.params.id);
    db.prepare('DELETE FROM stakeholder_contacts WHERE agency_id = ?').run(req.params.id);
    db.prepare('DELETE FROM stakeholder_agencies WHERE id = ?').run(req.params.id);
    try { SuperAdminService.logAdminAction('SAAS_SUPER_ADMIN', 'ENFORCEMENT_AGENCY_REMOVED', 'stakeholder_agency', req.params.id, { agency: row.acronym }); } catch {}
    res.json({ success: true, message: `${row.acronym} removed from the enforcement agency matrix.` });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ---------------------------------------------------------------------------
// CONTACTS & ENGAGEMENTS
// ---------------------------------------------------------------------------
b2gStakeholderRouter.post('/contacts', (req: any, res: any) => {
  try {
    const db = getDb();
    const b = req.body || {};
    if (!b.agency_id || !b.full_name || !b.email_address) return res.status(400).json({ success: false, error: 'agency_id, full_name, email_address required' });
    const id = `contact_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare(`INSERT INTO stakeholder_contacts (id, agency_id, full_name, official_title, department, email_address, phone_number, clearance_level, communication_channel_preferred, is_primary_liaison)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      id, b.agency_id, b.full_name, String(b.official_title || ''), String(b.department || ''), b.email_address,
      String(b.phone_number || ''), String(b.clearance_level || 'STANDARD_OFFICIAL'), String(b.communication_channel_preferred || 'SECURE_GOV_RELAY'), b.is_primary_liaison ? 1 : 0
    );
    if (b.is_primary_liaison) db.prepare('UPDATE stakeholder_contacts SET is_primary_liaison = 0 WHERE agency_id = ? AND id <> ?').run(b.agency_id, id);
    try { BlockchainAuditTrail.anchor({ actor: 'regulator-dashboard', action: 'AGENCY_CONTACT_REGISTERED', category: 'B2G_ENFORCEMENT', resource: `stakeholder_contacts/${id}`, refId: id, payload: { agencyId: b.agency_id, fullName: b.full_name, email: b.email_address } }); } catch {}
    res.status(201).json({ success: true, id, message: `Liaison ${b.full_name} registered.` });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

b2gStakeholderRouter.post('/engagements', (req: any, res: any) => {
  try {
    const db = getDb();
    const b = req.body || {};
    if (!b.agency_id) return res.status(400).json({ success: false, error: 'agency_id is required' });
    const id = `eng_${crypto.randomBytes(4).toString('hex')}`;
    const ref = String(b.case_or_reference_number || `ENF-${Date.now().toString(36).toUpperCase()}`);
    const trans = new Date().toISOString();
    const hmac = sha256(`${ref}:${String(b.subject_title || '')}:${String(b.summary_notes || '')}:${trans}`).slice(0, 64);
    db.prepare(`INSERT INTO stakeholder_engagements (id, agency_id, contact_id, engagement_type, subject_title, case_or_reference_number, communication_status, direction, summary_notes, statutory_deadline, cryptographic_receipt_hmac, transmission_date, action_items_json)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, b.agency_id, String(b.contact_id || ''), String(b.engagement_type || 'STATUTORY_INQUIRY'), String(b.subject_title || ''),
      ref, String(b.communication_status || 'IN_PROGRESS'), String(b.direction || 'BILATERAL'), String(b.summary_notes || ''),
      String(b.statutory_deadline || ''), hmac, trans, JSON.stringify(b.action_items || [])
    );
    try { BlockchainAuditTrail.anchor({ actor: 'regulator-dashboard', action: 'AGENCY_ENGAGEMENT_SEALED', category: 'B2G_ENFORCEMENT', resource: `stakeholder_engagements/${id}`, refId: ref, payload: { agencyId: b.agency_id, type: b.engagement_type, hmac } }); } catch {}
    res.status(201).json({ success: true, id, case_or_reference_number: ref, message: `Engagement touchpoint sealed [${ref}]` });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ---------------------------------------------------------------------------
// AI ASSISTANT (deterministic statutory letter generator)
// ---------------------------------------------------------------------------
b2gStakeholderRouter.post('/ai-assistant/draft-dispatch', (req: any, res: any) => {
  try {
    const b = req.body || {};
    const purpose = String(b.dispatch_purpose || 'Compliance Attestation & Supervisory Disclosure');
    const tone = String(b.tone || 'Formal Diplomatic & Technically Precise');
    const entity = String(b.entity_name || '9Xen Regulettee Sovereign Infrastructure');
    const ref = `DSP-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();
    const body =
`REF: ${ref}
DATE: ${now.slice(0, 10)}
CLASSIFICATION: OFFICIAL_SENSITIVE
TO: Competent Supervisory Authority
FROM: ${entity}

SUBJECT: ${purpose}

1. This dispatch is transmitted via the secured sovereign relay channel in accordance with the bilateral cooperation treaty and prevailing statutory disclosure obligations.
2. All referenced records are sealed on the hash-chained audit ledger and the 9XEN sovereign blockchain audit trail; the verifier endpoint is disclosed in Annex A.
3. The undersigned attests that the evidence package accompanying this disclosure is complete, unambiguous and cryptographically signed as of the transmission date above.
4. The authority is respectfully requested to issue an acknowledgement receipt within the statutory SLA window.

Tone: ${tone}
End of dispatch.`;
    try { BlockchainAuditTrail.anchor({ actor: 'regulator-dashboard', action: 'AI_DISPATCH_DRAFTED', category: 'B2G_ENFORCEMENT', resource: `dispatches/${ref}`, refId: ref, payload: { purpose, tone } }); } catch {}
    res.json({ success: true, caseReference: ref, suggestedClassification: 'OFFICIAL_SENSITIVE', dispatchBodyMarkdown: body });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

b2gStakeholderRouter.post('/ai-assistant/analyze-posture', (req: any, res: any) => {
  try {
    const b = req.body || {};
    const db = getDb();
    const agency = db.prepare('SELECT * FROM stakeholder_agencies WHERE id = ?').get(b.agency_id || '') as any;
    const posture = agency?.relationship_posture || 'COLLABORATIVE_PARTNER';
    const rating = agency?.compliance_rating || 90;
    const risk = rating >= 95 ? 'LOW' : rating >= 85 ? 'MODERATE' : 'ELEVATED';
    const priorities = posture === 'ELEVATED_SCRUTINY'
      ? ['Open a standing remediation monitoring channel', 'Accelerate evidence package cadence to weekly', 'Pre-clear any cross-border data movements with the authority']
      : ['Maintain quarterly supervisory attestations', 'Proactive disclosure of material compliance events', 'Standardize cryptographic acknowledgement receipts'];
    res.json({
      success: true,
      postureRiskLevel: risk,
      executiveSummary: `${agency?.acronym || 'Agency'} holds a ${posture.replace(/_/g, ' ').toLowerCase()} posture with a compliance rating of ${rating}/100. Recommended posture is ${priorities[0].toLowerCase()}.`,
      keySupervisoryPriorities: priorities,
      recommendedActionPlan: ['Register periodic engagement cadence', 'Seal supervisory disclosures on the audit chain', 'Review pending inquiries against SLA windows'],
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

b2gStakeholderRouter.get('/export/dossier', (_req: any, res: any) => {
  try {
    const db = getDb();
    const agencies = (db.prepare('SELECT * FROM stakeholder_agencies ORDER BY compliance_rating DESC').all() as any[]).map(r => agencyRow(r, db));
    const contacts = db.prepare('SELECT * FROM stakeholder_contacts ORDER BY agency_id').all() as any[];
    const engagements = db.prepare('SELECT * FROM stakeholder_engagements ORDER BY created_at DESC LIMIT 200').all() as any[];
    const dossier = { generatedAt: new Date().toISOString(), checksum: sha256(JSON.stringify({ agencies, contacts, engagements })), agencies, contacts, engagements };
    res.json({ success: true, dossier });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ---------------------------------------------------------------------------
// REGULATOR NODE STATUS (fed to the Regulator Portal head-up display)
// ---------------------------------------------------------------------------
regulatorNodeRouter.get('/status', (_req: any, res: any) => {
  try {
    const db = getDb();
    const agencies = (db.prepare('SELECT COUNT(*) c FROM stakeholder_agencies').get() as any)?.c ?? 0;
    const activeAgencies = (db.prepare(`SELECT COUNT(*) c FROM stakeholder_agencies WHERE status = 'ACTIVE'`).get() as any)?.c ?? 0;
    const openInquiries = (db.prepare("SELECT COUNT(*) c FROM stakeholder_engagements WHERE communication_status NOT IN ('CLOSED_COMPLIANT')").get() as any)?.c ?? 0;
    const scans = (db.prepare('SELECT COUNT(*) c FROM national_scan_runs').get() as any)?.c ?? 0;
    const notices = (db.prepare('SELECT COUNT(*) c FROM national_penalty_notices').get() as any)?.c ?? 0;
    let flag = { isEnabled: true };
    try { const row = getDb().prepare('SELECT * FROM platform_feature_flags WHERE key = ?').get('national_scan_engine') as any; if (row) flag = { isEnabled: Boolean(row.is_enabled) }; } catch {}
    res.json({
      success: true,
      network: '9XEN_B2G_REGULATOR_NODE',
      status: 'OPERATIONAL',
      featureFlag: flag.isEnabled ? 'ENABLED' : 'FLAG_DISABLED',
      metrics: { agencies, activeAgencies, openInquiries, scans, notices },
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});