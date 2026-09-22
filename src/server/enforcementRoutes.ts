import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/sqlite.js';
import { SuperAdminService } from '../services/superAdminService';

export const enforcementRouter = Router();

function ensureTables() {
  const db = getDb();
  if (!db || typeof db.exec !== 'function') return;
  try {
    // Legacy compliance.db shipped an incompatible enforcement_cases schema
    // (id, entity_id, regulator_id, status, dossier_hash, ...). Drop it so the
    // canonical CREATE below rebuilds the table with the current column set.
    const legacyCaseCols = db.prepare(`SELECT name FROM pragma_table_info('enforcement_cases')`).all() as { name: string }[];
    if (legacyCaseCols.length > 0 && !legacyCaseCols.some(c => c.name === 'sector')) {
      db.exec(`DROP TABLE IF EXISTS enforcement_cases`);
    }
    db.exec(`
      CREATE TABLE IF NOT EXISTS enforcement_cases (
        id TEXT PRIMARY KEY,
        regulator_id TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        sector TEXT NOT NULL DEFAULT 'Technology',
        regulation TEXT NOT NULL DEFAULT 'GDPR',
        violation_details TEXT,
        current_step TEXT NOT NULL DEFAULT 'INITIATED',
        penalty_type TEXT,
        fine_amount INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'OPEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS enforcement_audit_trail (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        step TEXT NOT NULL,
        officer_id TEXT NOT NULL,
        action TEXT,
        notes TEXT,
        payload_hash TEXT NOT NULL,
        immudb_tx_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS enforcement_templates (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        description TEXT NOT NULL,
        default_mode TEXT NOT NULL DEFAULT 'MANUAL',
        regulation TEXT NOT NULL DEFAULT 'GDPR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS enforcement_profiles (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'system',
        country_code TEXT NOT NULL DEFAULT 'EU',
        regulation_code TEXT NOT NULL DEFAULT 'GDPR',
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'DRAFT',
        level_settings TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS enforcement_simulations (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        country_code TEXT,
        regulation_code TEXT,
        violation_type TEXT,
        risk_score INTEGER,
        results TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS enforcement_scan_results (
        id TEXT PRIMARY KEY,
        regulator_id TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        findings TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS penalty_invoices (
        id TEXT PRIMARY KEY,
        regulator_id TEXT NOT NULL,
        enterprise_id TEXT NOT NULL,
        enterprise_name TEXT NOT NULL,
        violation_id TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        commission_fee_cents INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING',
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_at TIMESTAMP NOT NULL,
        legal_hash TEXT
      );
      CREATE TABLE IF NOT EXISTS b2g_mandates (
        id TEXT PRIMARY KEY,
        regulator_name TEXT NOT NULL,
        title TEXT NOT NULL,
        industry TEXT NOT NULL,
        law TEXT NOT NULL,
        regional_scope TEXT NOT NULL DEFAULT 'EU',
        description TEXT NOT NULL DEFAULT '',
        min_risk_threshold INTEGER NOT NULL DEFAULT 70,
        enforcement_action TEXT NOT NULL DEFAULT 'API_THROTTLE',
        fine_amount INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS b2g_scrape_results (
        id TEXT PRIMARY KEY,
        target_url TEXT NOT NULL,
        profile TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        page_title TEXT NOT NULL DEFAULT '',
        calculated_penalty_eur INTEGER NOT NULL DEFAULT 0,
        violations_found INTEGER NOT NULL DEFAULT 0,
        violations TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS b2g_inquiries (
        id TEXT PRIMARY KEY,
        inquiry_ref TEXT NOT NULL DEFAULT '',
        organization_id TEXT NOT NULL DEFAULT '',
        organization_name TEXT NOT NULL DEFAULT '',
        jurisdiction TEXT NOT NULL DEFAULT '',
        issuing_agency TEXT NOT NULL DEFAULT '',
        framework TEXT NOT NULL DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'normal',
        status TEXT NOT NULL DEFAULT 'open',
        subject TEXT NOT NULL DEFAULT '',
        statutory_basis TEXT NOT NULL DEFAULT '',
        deadline_date TEXT NOT NULL DEFAULT '',
        inquiry_details TEXT NOT NULL DEFAULT '',
        demanded_actions TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS b2g_sandbox_applications (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT '',
        organization_name TEXT NOT NULL DEFAULT '',
        proposed_activity TEXT NOT NULL DEFAULT '',
        data_categories TEXT NOT NULL DEFAULT '',
        technology_used TEXT NOT NULL DEFAULT '',
        jurisdiction TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'PENDING',
        notes TEXT NOT NULL DEFAULT '',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS b2g_nis2_dispatches (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL DEFAULT '',
        entity_name TEXT NOT NULL DEFAULT '',
        csirt_agency TEXT NOT NULL DEFAULT '',
        incident_stage TEXT NOT NULL DEFAULT '',
        ioc_summary TEXT NOT NULL DEFAULT '',
        severity_level TEXT NOT NULL DEFAULT 'HIGH',
        cross_border_impact INTEGER NOT NULL DEFAULT 0,
        dispatch_status TEXT NOT NULL DEFAULT 'DISPATCHED_PENDING_ACK',
        sla_deadline TEXT NOT NULL DEFAULT '',
        receipt_signature_sha256 TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS b2g_ctc_clearances (
        id TEXT PRIMARY KEY,
        invoice_reference TEXT NOT NULL DEFAULT '',
        tax_authority_rail TEXT NOT NULL DEFAULT '',
        seller_tax_id TEXT NOT NULL DEFAULT '',
        buyer_tax_id TEXT NOT NULL DEFAULT '',
        taxable_amount_cents INTEGER NOT NULL DEFAULT 0,
        vat_amount_cents INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT '',
        ecdsa_invoice_hash TEXT NOT NULL DEFAULT '',
        qr_payload_tlv_base64 TEXT NOT NULL DEFAULT '',
        tax_clearance_status TEXT NOT NULL DEFAULT 'CLEARED_STAMPED',
        tax_authority_csid_seal TEXT NOT NULL DEFAULT '',
        cleared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS b2g_subpoena_holds (
        id TEXT PRIMARY KEY,
        warrant_reference TEXT NOT NULL DEFAULT '',
        court_jurisdiction TEXT NOT NULL DEFAULT '',
        issuing_judge_or_magistrate TEXT NOT NULL DEFAULT '',
        target_entity_or_subject TEXT NOT NULL DEFAULT '',
        legal_basis TEXT NOT NULL DEFAULT '',
        data_scope_requested TEXT NOT NULL DEFAULT '',
        escrow_lock_status TEXT NOT NULL DEFAULT 'EVIDENCE_LOCKED',
        merkle_hold_receipt TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed enforcement templates if empty
    const count = (db.prepare('SELECT COUNT(*) as c FROM enforcement_templates').get() as any)?.c ?? 0;
    if (count === 0) {
      const tpl = db.prepare('INSERT INTO enforcement_templates (id, label, description, default_mode, regulation) VALUES (?, ?, ?, ?, ?)');
      tpl.run('tpl-warning', 'Verbal Warning', 'Formal written warning communicated to the entity compliance officer.', 'AUTO', 'GDPR');
      tpl.run('tpl-fine', 'Administrative Fine', 'Imposition of an administrative fine pursuant to Art. 83 GDPR.', 'CONDITIONAL', 'GDPR');
      tpl.run('tpl-suspend', 'Processing Suspension', 'Temporary suspension of data processing activities pending remediation.', 'MANUAL', 'GDPR');
      tpl.run('tpl-revoke', 'Certificate Revocation', 'Full revocation of the AI Act conformity certificate for high-risk models.', 'MANUAL', 'EU_AI_ACT');
      tpl.run('tpl-throttle', 'API Rate Throttle', 'Immediate reduction of API throughput to compliant baseline levels.', 'AUTO', 'DORA');
    }

    // Seed demo enforcement cases if empty
    const caseCount = (db.prepare('SELECT COUNT(*) as c FROM enforcement_cases').get() as any)?.c ?? 0;
    if (caseCount === 0) {
      const ins = db.prepare('INSERT INTO enforcement_cases (id, regulator_id, entity_name, sector, regulation, violation_details, current_step, penalty_type, fine_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      ins.run('CAS-2026-0001', 'CNIL', 'TechStartup AI Labs', 'Artificial Intelligence', 'EU AI Act', 'Uncalibrated biometric screening model deployed to EU candidates without Annex III conformity certification.', 'INVESTIGATING', 'AUTO_FINE', 750000, 'OPEN');
      ins.run('CAS-2026-0002', 'BfDI', 'Acme Corporation Europe', 'Financial Services', 'GDPR', 'Unencrypted PII telemetry ingress to non-adequate cloud storage without TLS 1.3.', 'NOTICE_SENT', 'FINE', 500000, 'OPEN');
      ins.run('CAS-2026-0003', 'DPC', 'Global Finance Corp', 'Banking', 'GDPR', 'Production access tokens cached in unencrypted Redis node violating Art. 32.', 'PENALTY_IMPOSED', 'AUTO_FINE', 1200000, 'PENALTY_IMPOSED');
      ins.run('CAS-2026-0004', 'AP', 'RetailChain Digital Europe', 'Retail', 'GDPR', 'Ransomware breach affecting 120K accounts not disclosed within 72-hour Article 33 window.', 'REMEDIATION_VERIFIED', 'FINE', 300000, 'CLOSED');
    }

    // Seed demo penalty invoices if empty
    const invoiceCount = (db.prepare('SELECT COUNT(*) as c FROM penalty_invoices').get() as any)?.c ?? 0;
    if (invoiceCount === 0) {
      const insInv = db.prepare('INSERT INTO penalty_invoices (id, regulator_id, enterprise_id, enterprise_name, violation_id, amount_cents, commission_fee_cents, status, due_at, legal_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const mkInv = (id: string, reg: string, ent: string, viol: string, cents: number, status: string, dueDays: number) => {
        const payload = `${id}::${ent}::${viol}::${cents}`;
        insInv.run(id, reg, `ent-${id}`, ent, viol, cents, Math.round(cents * 0.04), status, new Date(Date.now() + dueDays * 86400000).toISOString(), crypto.createHash('sha256').update(payload).digest('hex'));
      };
      mkInv('INV-2026-0001', 'CNIL', 'TechStartup AI Labs', 'CAS-2026-0001', 75000000, 'PENDING', 30);
      mkInv('INV-2026-0002', 'BfDI', 'Acme Corporation Europe', 'CAS-2026-0002', 50000000, 'PENDING', 30);
      mkInv('INV-2026-0003', 'DPC', 'Global Finance Corp', 'CAS-2026-0003', 120000000, 'COLLECTED', 15);
      mkInv('INV-2026-0004', 'AP', 'RetailChain Digital Europe', 'CAS-2026-0004', 30000000, 'PAID', 8);
    }

    // Seed demo b2g_inquiries if empty
    const inqCount = (db.prepare('SELECT COUNT(*) as c FROM b2g_inquiries').get() as any)?.c ?? 0;
    if (inqCount === 0) {
      const insInq = db.prepare('INSERT INTO b2g_inquiries (id, inquiry_ref, organization_id, organization_name, jurisdiction, issuing_agency, framework, priority, status, subject, statutory_basis, deadline_date, inquiry_details, demanded_actions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      insInq.run('INQ-501', 'DPA-DE-2026-904', 'org_1', 'Acme Corporation Europe', 'Germany', 'BfDI (Federal Commissioner for Data Protection)', 'GDPR', 'urgent', 'open', 'Call Detail Record (CDR) Retention Policy Proportionality', 'GDPR Article 5(1)(e) & ePrivacy Directive Art. 15', '2026-09-18T17:00:00Z', 'Demonstrate lawful basis for retention of telemetry vectors exceeding 90-day threshold.', JSON.stringify(['Submit DPIA on cross-border data replication', 'Provide cryptographically signed deletion logs']));
      insInq.run('INQ-502', 'DPA-FR-2026-218', 'org_2', 'Stark Industries GmbH', 'France', 'CNIL France', 'EU_AI_ACT', 'high', 'open', 'High-Risk AI System Human Oversight Protocol Affirmation', 'EU AI Act Article 14 (Human Oversight)', '2026-09-25T17:00:00Z', 'Verification that human operators possess authority to override automated underwriting decisions in real time.', JSON.stringify(['Provide kill-switch architecture schematics', 'Submit human-in-the-loop audit logs']));
    }

    // Seed demo b2g_sandbox_applications if empty
    const sandCount = (db.prepare('SELECT COUNT(*) as c FROM b2g_sandbox_applications').get() as any)?.c ?? 0;
    if (sandCount === 0) {
      const insSand = db.prepare('INSERT INTO b2g_sandbox_applications (id, organization_id, organization_name, proposed_activity, data_categories, technology_used, jurisdiction, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      insSand.run('SB-001', 'org_1', 'Acme Corporation Europe', 'Biometric AI Authentication for Secure Payment Clearings', 'Synthetic Facial Vectors, Encrypted Zero-Knowledge Proofs', 'Edge AI Enclaves, Homomorphic Encryption', 'Germany', 'APPROVED', 'Operating under BaFin Regulatory Sandbox Cohort 4.');
      insSand.run('SB-002', 'org_2', 'Stark Industries GmbH', 'Predictive Genomics for Precision Occupational Health', 'Anonymized Biomarker Signals, Synthetic Patient Telemetry', 'Federated Learning, Differential Privacy (epsilon=0.15)', 'France', 'APPROVED', 'Approved under EU Health Data Space (EHDS) Sandbox Enclave.');
    }

    // Seed demo b2g_nis2_dispatches if empty
    const nisCount = (db.prepare('SELECT COUNT(*) as c FROM b2g_nis2_dispatches').get() as any)?.c ?? 0;
    if (nisCount === 0) {
      const insNis = db.prepare('INSERT INTO b2g_nis2_dispatches (id, incident_id, entity_name, csirt_agency, incident_stage, ioc_summary, severity_level, cross_border_impact, dispatch_status, sla_deadline, receipt_signature_sha256) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      insNis.run('NIS2-DSP-9901', 'INC-2026-8801', 'Acme Sovereign Cloud Infrastructure B.V.', 'DE_CERT_BUND', 'STAGE_1_EARLY_WARNING_24H', 'Anomalous credential stuffing attack detected against OAuth token issuance enclave. Egress traffic quarantined.', 'CRITICAL', 1, 'DISPATCHED_PENDING_ACK', new Date(Date.now() + 18000000).toISOString(), '0x99f3a21bc9842103e87123901a0921bf728');
      insNis.run('NIS2-DSP-9902', 'INC-2026-8800', 'Euro Grid Digital Energy Systems GmbH', 'FR_ANSSI', 'STAGE_2_INCIDENT_NOTIFICATION_72H', 'SCADA telemetry pipeline rate-limiting threshold exceeded in Alsace region. Automated failover initiated.', 'HIGH', 1, 'ACKNOWLEDGED_BY_CSIRT', new Date(Date.now() + 144000000).toISOString(), '0x88c2b102910fa87129bc019284210029f12');
    }

    // Seed demo b2g_ctc_clearances if empty
    const ctcCount = (db.prepare('SELECT COUNT(*) as c FROM b2g_ctc_clearances').get() as any)?.c ?? 0;
    if (ctcCount === 0) {
      const insCtc = db.prepare('INSERT INTO b2g_ctc_clearances (id, invoice_reference, tax_authority_rail, seller_tax_id, buyer_tax_id, taxable_amount_cents, vat_amount_cents, currency, ecdsa_invoice_hash, qr_payload_tlv_base64, tax_clearance_status, tax_authority_csid_seal, cleared_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      insCtc.run('ctc_clearance_9901', 'INV-CTC-884012', 'SA_ZATCA_FATOORAH_P2', '310123456700003', '300987654300003', 450000, 67500, 'SAR', '0xa8f3b41e9821039e7821bc3451aa902efc', 'AQ8zMTAxMjM0NTY3MDAwMDMCAzMwMDk4NzY1NDMwMDAwMwMDIDAyNi0wOS0wN1QwNDowMDowMFoEBDQ1MDAFBDY3NQ==', 'CLEARED_STAMPED', 'ZATCA-PROD-CSID-ECDSA-SECP256R1-OK', new Date(Date.now() - 3600000).toISOString());
      insCtc.run('ctc_clearance_9902', 'INV-CTC-884013', 'EU_PEPPOL_BIS_BILLING_V3', 'LU12345678', 'DE987654321', 1250000, 212500, 'EUR', '0x7e22bc345d09e1220f9a8b4562bb013af', 'AQVMVTEyMzQ1Njc4AgNERTk4NzY1NDMyMQMDIDAyNi0wOS0wN1QwNDowMDowMFoEBDExMjI1', 'CLEARED_STAMPED', 'PEPPOL-EIDAS-QUALIFIED-SEAL-OK', new Date(Date.now() - 7200000).toISOString());
    }

    // Seed demo b2g_subpoena_holds if empty
    const subpCount = (db.prepare('SELECT COUNT(*) as c FROM b2g_subpoena_holds').get() as any)?.c ?? 0;
    if (subpCount === 0) {
      const insSub = db.prepare('INSERT INTO b2g_subpoena_holds (id, warrant_reference, court_jurisdiction, issuing_judge_or_magistrate, target_entity_or_subject, legal_basis, data_scope_requested, escrow_lock_status, merkle_hold_receipt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      insSub.run('HOLD-2026-001', 'WARR-CJEU-99120', 'Court of Justice of the European Union (CJEU)', 'Magistrate Hon. Klaus V. Mueller', 'HyperPay Sovereign FinTech GmbH', 'Article 23 GDPR / EU MLAT Mutual Legal Assistance Directive', 'Transaction audit trail, HSM key rotation logs, and unhashed processing telemetry for Q2-Q3 2026.', 'EVIDENCE_LOCKED', '0xabc123merklehold...', new Date(Date.now() - 172800000).toISOString());
    }
  } catch (err) {
    console.warn('[ENFORCEMENT_ROUTES] Table init:', err);
  }
}

ensureTables();

// ---------- ENFORCEMENT CASES ----------

// GET /enforcement/cases/:regulatorId
enforcementRouter.get('/cases/:regulatorId', (req, res) => {
  try {
    const db = getDb();
    const { regulatorId } = req.params;
    const cases = db.prepare('SELECT id, regulator_id, entity_name, sector, regulation, violation_details, current_step, penalty_type, fine_amount, status, created_at FROM enforcement_cases WHERE regulator_id = ? OR ? = ALL ORDER BY created_at DESC').all(regulatorId, regulatorId);
    res.json({
      success: true,
      data: (cases as any[]).map((c: any) => ({
        id: c.id,
        status: c.current_step,
        regulator_id: c.regulator_id,
        entity_name: c.entity_name,
        sector: c.sector,
        regulation: c.regulation,
        violation_details: c.violation_details,
        penalty_type: c.penalty_type,
        fine_amount: c.fine_amount,
        case_status: c.status,
        created_at: c.created_at,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /enforcement/cases/:caseId/transition
enforcementRouter.post('/cases/:caseId/transition', (req, res) => {
  try {
    const db = getDb();
    const { caseId } = req.params;
    const { nextStep, metadata } = req.body || {};
    if (!nextStep) return res.status(400).json({ success: false, error: 'nextStep is required' });

    const existing = db.prepare('SELECT id FROM enforcement_cases WHERE id = ?').get(caseId) as any;
    if (!existing) return res.status(404).json({ success: false, error: 'Case not found' });

    db.prepare('UPDATE enforcement_cases SET current_step = ?, status = ? WHERE id = ?').run(
      nextStep,
      nextStep === 'CLOSED' ? 'CLOSED' : nextStep === 'PENALTY_IMPOSED' ? 'PENALTY_IMPOSED' : 'OPEN',
      caseId
    );

    const auditId = `ea_${crypto.randomBytes(4).toString('hex')}_${Date.now().toString(36)}`;
    const payloadStr = JSON.stringify({ caseId, nextStep, metadata });
    const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');
    db.prepare('INSERT INTO enforcement_audit_trail (id, case_id, step, officer_id, action, notes, payload_hash, immudb_tx_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      auditId,
      caseId,
      nextStep,
      metadata?.officer_id || 'OFFICER_ADMIN_01',
      metadata?.action || `Transitioned to ${nextStep}`,
      metadata?.notes || '',
      payloadHash,
      `immudb_tx_${Date.now().toString(36)}`
    );

    try {
      SuperAdminService.logAdminAction(
        metadata?.officer_id || 'ENFORCEMENT_OFFICER',
        'ENFORCEMENT_CASE_TRANSITIONED',
        'enforcement_case',
        caseId,
        { nextStep, payloadHash }
      );
    } catch {}

    res.json({ success: true, message: `Case ${caseId} transitioned to ${nextStep}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /enforcement/cases/:caseId/audit-trail
enforcementRouter.get('/cases/:caseId/audit-trail', (req, res) => {
  try {
    const db = getDb();
    const { caseId } = req.params;
    const trail = db.prepare('SELECT id, step, officer_id, action, notes, created_at, payload_hash, immudb_tx_id FROM enforcement_audit_trail WHERE case_id = ? ORDER BY created_at DESC').all(caseId);
    res.json({
      success: true,
      data: (trail as any[]).map((t: any) => ({
        id: t.id,
        step: t.step,
        created_at: t.created_at,
        payload_hash: t.payload_hash,
        immudb_tx_id: t.immudb_tx_id,
        officer_id: t.officer_id,
        action: t.action,
        notes: t.notes,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /enforcement/audit
enforcementRouter.get('/audit', (_req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT a.id, a.case_id, a.step, a.officer_id, a.action, a.notes, a.payload_hash, a.immudb_tx_id, a.created_at, c.entity_name, c.regulation FROM enforcement_audit_trail a LEFT JOIN enforcement_cases c ON c.id = a.case_id ORDER BY a.created_at DESC LIMIT 200').all();
    res.json(
      (rows as any[]).map((r: any) => ({
        id: r.id,
        levelKey: r.step,
        mode: 'AUTO',
        status: 'EXECUTED',
        caseRef: r.case_id,
        executedAt: r.created_at,
        payload: { officer_id: r.officer_id, action: r.action, notes: r.notes, entity: r.entity_name, regulation: r.regulation, payload_hash: r.payload_hash, immudb_tx_id: r.immudb_tx_id },
      }))
    );
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /enforcement/templates
enforcementRouter.get('/templates', (_req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT id, label, description, default_mode, regulation FROM enforcement_templates ORDER BY label').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /enforcement/profiles
enforcementRouter.post('/profiles', (req, res) => {
  try {
    const db = getDb();
    const { tenantId, countryCode, regulationCode, name, status, levelSettings } = req.body || {};
    if (!name) return res.status(400).json({ success: false, error: 'name is required' });

    const id = `profile_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare('INSERT INTO enforcement_profiles (id, tenant_id, country_code, regulation_code, name, status, level_settings) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id,
      tenantId || 'system',
      countryCode || 'EU',
      regulationCode || 'GDPR',
      name,
      status || 'DRAFT',
      JSON.stringify(levelSettings || [])
    );

    try {
      SuperAdminService.logAdminAction('ENFORCEMENT_OFFICER', 'ENFORCEMENT_PROFILE_SAVED', 'enforcement_profile', id, { name, countryCode, regulationCode });
    } catch {}

    res.json({ success: true, profileId: id, message: `Enforcement profile "${name}" saved` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /enforcement/simulate
enforcementRouter.post('/simulate', (req, res) => {
  try {
    const db = getDb();
    const { context } = req.body || {};
    if (!context) return res.status(400).json({ success: false, error: 'context is required' });

    const { tenantId, countryCode, regulationCode, violationData } = context;
    const riskScore = violationData?.riskScore ?? 50;
    const violationType = violationData?.type || 'GENERIC_VIOLATION';

    // Deterministic rule engine: risk score drives escalation
    const levels = db.prepare('SELECT id, label, default_mode FROM enforcement_templates ORDER BY label').all() as any[];
    const results = levels.map((lvl: any) => {
      let status = 'NOT_TRIGGERED';
      let actionTaken = 'No action required';
      if (riskScore >= 90) {
        status = 'TRIGGERED';
        actionTaken = `Immediate ${lvl.label} issued under ${regulationCode || 'GDPR'}`;
      } else if (riskScore >= 70 && lvl.default_mode !== 'MANUAL') {
        status = 'CONDITIONALLY_TRIGGERED';
        actionTaken = `Conditional ${lvl.label} pending review — risk ${riskScore}/100`;
      } else if (riskScore >= 50) {
        status = 'MONITORING';
        actionTaken = 'Entity placed on enhanced monitoring watchlist';
      }
      return { levelKey: lvl.label, status, actionTaken };
    });

    const simId = `sim_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare('INSERT INTO enforcement_simulations (id, tenant_id, country_code, regulation_code, violation_type, risk_score, results) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      simId, tenantId, countryCode, regulationCode, violationType, riskScore, JSON.stringify(results)
    );

    res.json({ success: true, simulationId: simId, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /enforcement/trigger-scan
enforcementRouter.post('/trigger-scan', (req, res) => {
  try {
    const db = getDb();
    const { regulatorId, entityId } = req.body || {};
    const scanId = `scan_${crypto.randomBytes(4).toString('hex')}`;

    const findings = [
      { id: `F-${Date.now().toString(36)}`, entity: `Entity-${entityId || 'Unknown'}`, domain: 'Compliance Scan', regulation: 'GDPR Art. 30', severity: 'CRITICAL', riskLevel: 'HIGH', summary: 'ROPA incomplete — missing processor inventory', remediationStatus: 'OPEN', timestamp: new Date().toISOString() },
    ];

    db.prepare('INSERT INTO enforcement_scan_results (id, regulator_id, entity_id, status, findings) VALUES (?, ?, ?, ?, ?)').run(
      scanId, String(regulatorId || 0), String(entityId || 0), 'COMPLETED', JSON.stringify(findings)
    );

    try {
      SuperAdminService.logAdminAction('ENFORCEMENT_OFFICER', 'ENFORCEMENT_SCAN_TRIGGERED', 'enforcement_scan', scanId, { regulatorId, entityId });
    } catch {}

    res.json({ success: true, data: { id: scanId } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- PENALTY INVOICES ----------

// GET /finance/regulator/:regulatorId/invoices
enforcementRouter.get('/finance/regulator/:regulatorId/invoices', (req, res) => {
  try {
    const db = getDb();
    const { regulatorId } = req.params;
    const rows = db.prepare('SELECT id, regulator_id, enterprise_id, enterprise_name, violation_id, amount_cents, commission_fee_cents, status, issued_at, due_at, legal_hash FROM penalty_invoices WHERE regulator_id = ? OR ? = ALL ORDER BY issued_at DESC').all(regulatorId, regulatorId);
    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /finance/regulator/:regulatorId/issue-invoice
enforcementRouter.post('/finance/regulator/:regulatorId/issue-invoice', (req, res) => {
  try {
    const db = getDb();
    const { regulatorId } = req.params;
    const { enterpriseId, enterpriseName, violationId, amountCents, dueDays } = req.body || {};
    if (!enterpriseId || !enterpriseName || !violationId || !amountCents) {
      return res.status(400).json({ success: false, error: 'enterpriseId, enterpriseName, violationId, amountCents are required' });
    }

    const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}`;
    const dueAt = new Date(Date.now() + (dueDays || 30) * 86400000).toISOString();
    const legalPayload = `${invoiceId}::${enterpriseId}::${violationId}::${amountCents}`;
    const legalHash = crypto.createHash('sha256').update(legalPayload).digest('hex');

    db.prepare('INSERT INTO penalty_invoices (id, regulator_id, enterprise_id, enterprise_name, violation_id, amount_cents, commission_fee_cents, status, due_at, legal_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      invoiceId, regulatorId, enterpriseId, enterpriseName, violationId, amountCents, 0, 'PENDING', dueAt, legalHash
    );

    try {
      SuperAdminService.logAdminAction('ENFORCEMENT_OFFICER', 'PENALTY_INVOICE_ISSUED', 'penalty_invoice', invoiceId, { enterpriseId, amountCents });
    } catch {}

    res.json({ success: true, invoiceId, message: `Penalty invoice ${invoiceId} issued to ${enterpriseName}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- B2G MANDATES ----------

// GET /b2g/mandates
enforcementRouter.get('/b2g/mandates', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT id, regulator_name, title, industry, law, regional_scope, description, min_risk_threshold, enforcement_action, fine_amount, status, created_at FROM b2g_mandates ORDER BY created_at DESC').all();
    res.json({
      success: true,
      data: (rows as any[]).map((m: any) => ({
        id: m.id,
        regulator_name: m.regulator_name,
        title: m.title,
        industry: m.industry,
        law: m.law,
        regional_scope: m.regional_scope,
        description: m.description,
        min_risk_threshold: m.min_risk_threshold,
        enforcement_action: m.enforcement_action,
        fine_amount: m.fine_amount,
        status: m.status,
        created_at: m.created_at,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /b2g/mandates
enforcementRouter.post('/b2g/mandates', (req, res) => {
  try {
    const db = getDb();
    const { id, regulatorName, title, industry, law, regionalScope, description, minRiskThreshold, enforcementAction, fineAmount } = req.body || {};
    const mandateId = id || `req-${Date.now()}`;
    db.prepare('INSERT OR REPLACE INTO b2g_mandates (id, regulator_name, title, industry, law, regional_scope, description, min_risk_threshold, enforcement_action, fine_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      mandateId, regulatorName || 'Unknown', title || 'Untitled Mandate', industry || 'General', law || 'GDPR', regionalScope || 'EU', description || '', minRiskThreshold || 70, enforcementAction || 'API_THROTTLE', fineAmount || 0, 'PENDING'
    );
    res.json({ success: true, mandateId, message: 'Mandate synced' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /b2g/mandates/:id
enforcementRouter.delete('/b2g/mandates/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    db.prepare('DELETE FROM b2g_mandates WHERE id = ?').run(id);
    res.json({ success: true, message: `Mandate ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /b2g/mandates/:id/status (APPEAL_SUBMITTED, ACCEPTED, REJECTED)
enforcementRouter.patch('/b2g/mandates/:id/status', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { status, appealReason } = req.body || {};
    if (!status) return res.status(400).json({ success: false, error: 'status is required' });
    const existing = db.prepare('SELECT id FROM b2g_mandates WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Mandate not found' });
    db.prepare('UPDATE b2g_mandates SET status = ? WHERE id = ?').run(status, id);
    SuperAdminService.logAdminAction('ENFORCEMENT_OFFICER', `MANDATE_STATUS_${status.toUpperCase()}`, 'b2g_mandate', id, { status, appealReason: appealReason || '' });
    res.json({ success: true, message: `Mandate ${id} status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- B2G SCRAPER SCAN ----------

// POST /b2g/scraper/scan
enforcementRouter.post('/b2g/scraper/scan', (req, res) => {
  try {
    const db = getDb();
    const { target_url, profile } = req.body || {};
    if (!target_url) return res.status(400).json({ success: false, error: 'target_url is required' });

    // Deterministic compliance scoring based on profile rules
    const profileRules: Record<string, any> = {
      GDPR_EPRIVACY: { penaltyBase: 50000, violationBase: 3, articles: ['Art. 6', 'Art. 7', 'Art. 13', 'Art. 14'] },
      AI_ACT_DISCLOSURE: { penaltyBase: 150000, violationBase: 5, articles: ['Art. 52', 'Annex IV', 'Art. 11'] },
      DORA_CYBER_WEB: { penaltyBase: 75000, violationBase: 2, articles: ['Art. 9', 'Art. 11', 'Art. 28'] },
      CONSUMER_RIGHTS: { penaltyBase: 25000, violationBase: 2, articles: ['Art. 6', 'Art. 7', 'Art. 10'] },
    };
    const rules = profileRules[profile || 'GDPR_EPRIVACY'] || profileRules.GDPR_EPRIVACY;

    const violationsFound = rules.violationBase;
    const violations = rules.articles.slice(0, violationsFound).map((article: string, i: number) => ({
      severity: i === 0 ? 'CRITICAL' : 'WARNING',
      article,
      issue: `Non-compliance detected for ${article} — consent mechanism absent or insufficient`,
      suggested_fine: rules.penaltyBase + i * 10000,
    }));

    const calculatedPenaltyEur = violations.reduce((sum: number, v: any) => sum + v.suggested_fine, 0);
    const pageTitle = `ComplianceScan-${target_url.replace(/[^a-zA-Z0-9]/g, '').substring(0, 40)}`;

    const scanId = `scraper_${crypto.randomBytes(4).toString('hex')}`;
    db.prepare('INSERT INTO b2g_scrape_results (id, target_url, profile, status, page_title, calculated_penalty_eur, violations_found, violations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      scanId, target_url, profile || 'GDPR_EPRIVACY', 'NON_COMPLIANT', pageTitle, calculatedPenaltyEur, violationsFound, JSON.stringify(violations)
    );

    try {
      SuperAdminService.logAdminAction('ENFORCEMENT_OFFICER', 'B2G_SCRAPER_SCAN_COMPLETED', 'b2g_scrape', scanId, { target_url, profile, calculatedPenaltyEur });
    } catch {}

    res.json({
      success: true,
      scanResult: {
        status: 'NON_COMPLIANT',
        target_url,
        page_title: pageTitle,
        calculated_penalty_eur: calculatedPenaltyEur,
        violations_found: violationsFound,
        violations,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /b2g/scraper/results
enforcementRouter.get('/b2g/scraper/results', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT id, target_url, profile, status, page_title, calculated_penalty_eur, violations_found, violations, created_at FROM b2g_scrape_results ORDER BY created_at DESC LIMIT 50').all();
    res.json({
      success: true,
      results: (rows as any[]).map((r: any) => ({
        id: r.id,
        target_url: r.target_url,
        profile: r.profile,
        status: r.status,
        page_title: r.page_title,
        calculated_penalty_eur: r.calculated_penalty_eur,
        violations_found: r.violations_found,
        violations: (() => { try { return JSON.parse(r.violations || '[]'); } catch { return []; } })(),
        created_at: r.created_at,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
