import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'crypto';
import { getDb } from '../db/sqlite';

export const grievanceSlaRouter = Router();

interface SlaCase {
  id: string;
  refCode: string;
  countryCode: string;
  jurisdictionName: string;
  entityName: string;
  rawCategory: string;
  normalizedCategory: string;
  description: string;
  severity: number;
  channel: string;
  assignedOfficer: string;
  assignedOfficerId: string;
  statutoryFramework: string;
  statutoryLimitHours: number;
  createdAt: string;
  regulatoryDeadline: string;
  status: string;
  cureNoticeDispatched: boolean;
  cureNoticeTimestamp: string | null;
}

const OFFICERS: Record<string, string> = {
  usr_ombuds_01: 'Fatima Rahman (Senior Ombudsman)',
  usr_lawyer_02: 'Lukas Schneider (Lead GDPR Counsel)',
  usr_inspector_03: 'Tanvir Hossain (Cyber Inspector)',
  usr_fca_04: 'Eleanor Vance (FCA Compliance Specialist)',
  usr_admin_01: 'Marcus Sterling (Consumer Protection Lead)'
};

const CATEGORY_SLA: Record<string, { limitHours: number; framework: string; severity: number }> = {
  'Financial Fraud': { limitHours: 48, framework: 'EU Payment Services Directive II (PSD2)', severity: 5 },
  'GDPR Privacy': { limitHours: 72, framework: 'GDPR Article 33/34 Breach Notification', severity: 4 },
  'Deceptive Ads': { limitHours: 168, framework: 'Unfair Commercial Practices Directive (2005/29/EC)', severity: 3 },
  'Health & Safety': { limitHours: 24, framework: 'EU General Product Safety Regulation (GPSR)', severity: 5 },
  'Fair Trading': { limitHours: 120, framework: 'Consumer Rights Directive (2011/83/EU)', severity: 3 }
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();

function initGrievanceTables(): void {
  const db = getDb();
  if (!db || typeof db.exec !== 'function') return;
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS grievance_sla_cases (
        id TEXT PRIMARY KEY,
        ref_code TEXT NOT NULL,
        country_code TEXT NOT NULL,
        jurisdiction_name TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        raw_category TEXT NOT NULL,
        normalized_category TEXT NOT NULL,
        description TEXT NOT NULL,
        severity INTEGER NOT NULL DEFAULT 3,
        channel TEXT NOT NULL,
        assigned_officer TEXT NOT NULL,
        assigned_officer_id TEXT NOT NULL,
        statutory_framework TEXT NOT NULL,
        statutory_limit_hours INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'TRIAGED',
        cure_notice_dispatched INTEGER NOT NULL DEFAULT 0,
        cure_notice_timestamp TIMESTAMP,
        resolution_timestamp TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS grievance_sla_history (
        month TEXT PRIMARY KEY,
        resolved INTEGER NOT NULL DEFAULT 0,
        breached INTEGER NOT NULL DEFAULT 0
      );
    `);

    const count = (db.prepare('SELECT count(*) as c FROM grievance_sla_cases').get() as any)?.c || 0;
    if (count === 0) {
      const seeds: Array<Array<string | number | boolean | null>> = [
        ['gcase_001', 'GRV-DE-2026-98124', 'DE', 'Germany (Bundesnetzagentur)', 'NeoTech Payments GmbH', 'Financial Fraud', 'Financial Fraud', 'Unauthorized recurring charges and withholding of refunds for 1,240 consumers.', 5, 'WEB_WIDGET', OFFICERS.usr_fca_04, 'usr_fca_04', CATEGORY_SLA['Financial Fraud'].framework, 48, hoursAgo(40), 'UNDER_INVESTIGATION', 0, null],
        ['gcase_002', 'GRV-FR-2026-98131', 'FR', 'France (CNIL)', 'DataVault Cloud SAS', 'GDPR Privacy', 'GDPR Privacy', 'Cross-border personal data processing without valid legal basis or DPIA.', 4, 'PARTNER_API', OFFICERS.usr_lawyer_02, 'usr_lawyer_02', CATEGORY_SLA['GDPR Privacy'].framework, 72, hoursAgo(30), 'ENTITY_CURE_PERIOD', 1, hoursAgo(10)],
        ['gcase_003', 'GRV-BD-2026-98140', 'BD', 'Bangladesh (BSTI)', 'SafeHome Electronics Ltd', 'Health & Safety', 'Health & Safety', 'Import and sale of faulty consumer electrical goods posing fire risk.', 5, 'WHATSAPP', OFFICERS.usr_inspector_03, 'usr_inspector_03', CATEGORY_SLA['Health & Safety'].framework, 24, hoursAgo(20), 'TRIAGED', 0, null],
        ['gcase_004', 'GRV-SG-2026-98152', 'SG', 'Singapore (CCCS)', 'BrightAds Media Pte Ltd', 'Deceptive Ads', 'Deceptive Ads', 'Misleading performance claims on paid social advertising campaigns.', 3, 'WEB_WIDGET', OFFICERS.usr_ombuds_01, 'usr_ombuds_01', CATEGORY_SLA['Deceptive Ads'].framework, 168, hoursAgo(100), 'UNDER_INVESTIGATION', 0, null],
        ['gcase_005', 'GRV-GB-2026-98160', 'GB', 'United Kingdom (CMA)', 'FairMart Retail Group', 'Fair Trading', 'Fair Trading', 'Trading standards breaches relating to warranty enforcement and returns.', 3, 'SMS', OFFICERS.usr_admin_01, 'usr_admin_01', CATEGORY_SLA['Fair Trading'].framework, 120, hoursAgo(90), 'ENTITY_CURE_PERIOD', 1, hoursAgo(30)],
        ['gcase_006', 'GRV-EU-2026-98171', 'EU', 'European Union (EDPB)', 'AnonymousAI Labs', 'GDPR Privacy', 'GDPR Privacy', 'Automated decision-making without human oversight or transparency disclosures.', 4, 'PARTNER_API', OFFICERS.usr_lawyer_02, 'usr_lawyer_02', CATEGORY_SLA['GDPR Privacy'].framework, 72, hoursAgo(50), 'REGULATORY_ESCALATION', 1, hoursAgo(24)]
      ];
      const i = db.prepare(`
        INSERT INTO grievance_sla_cases
        (id, ref_code, country_code, jurisdiction_name, entity_name, raw_category, normalized_category, description, severity, channel, assigned_officer, assigned_officer_id, statutory_framework, statutory_limit_hours, created_at, status, cure_notice_dispatched, cure_notice_timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of seeds) i.run(...row);
    }

    const hcount = (db.prepare('SELECT count(*) as c FROM grievance_sla_history').get() as any)?.c || 0;
    if (hcount === 0) {
      const h = db.prepare('INSERT INTO grievance_sla_history (month, resolved, breached) VALUES (?, ?, ?)');
      h.run('Apr', 121, 6);
      h.run('May', 138, 5);
      h.run('Jun', 149, 7);
      h.run('Jul', 164, 4);
    }
  } catch (err) {
    console.warn('[GRIEVANCE_SLA] Init notice:', err);
  }
}

initGrievanceTables();

function rowToCase(r: any): SlaCase {
  return {
    id: r.id,
    refCode: r.ref_code,
    countryCode: r.country_code,
    jurisdictionName: r.jurisdiction_name,
    entityName: r.entity_name,
    rawCategory: r.raw_category,
    normalizedCategory: r.normalized_category,
    description: r.description,
    severity: r.severity,
    channel: r.channel,
    assignedOfficer: r.assigned_officer,
    assignedOfficerId: r.assigned_officer_id,
    statutoryFramework: r.statutory_framework,
    statutoryLimitHours: r.statutory_limit_hours,
    createdAt: r.created_at,
    regulatoryDeadline: '',
    status: r.status,
    cureNoticeDispatched: r.cure_notice_dispatched === 1,
    cureNoticeTimestamp: r.cure_notice_timestamp,
  };
}

function computeCase(c: SlaCase) {
  const elapsed = (Date.now() - new Date(c.createdAt).getTime()) / 3600000;
  const remaining = c.statutoryLimitHours - elapsed;
  let urgency: 'CRITICAL' | 'WARNING' | 'ON_TRACK' | 'BREACHED';
  if (c.status === 'RESOLVED') urgency = 'ON_TRACK';
  else if (remaining <= 0) urgency = 'BREACHED';
  else if (remaining < 24) urgency = 'CRITICAL';
  else if (remaining <= 48) urgency = 'WARNING';
  else urgency = 'ON_TRACK';
  return {
    ...c,
    hoursElapsed: Number(elapsed.toFixed(1)),
    hoursRemaining: Number(remaining.toFixed(1)),
    urgencyStatus: urgency,
    regulatoryDeadline: new Date(new Date(c.createdAt).getTime() + c.statutoryLimitHours * 3600000).toISOString()
  };
}

function fetchAllCases(): any[] {
  const db = getDb();
  if (!db) return [];
  try {
    return (db.prepare('SELECT * FROM grievance_sla_cases ORDER BY created_at DESC').all() as any[]).map(rowToCase).map(computeCase);
  } catch (err) {
    console.warn('[GRIEVANCE_SLA] Fetch notice:', err);
    return [];
  }
}

function currentMonthLabel(): string {
  return new Date().toLocaleString('en-GB', { month: 'short' }).replace('.', '');
}

function touchCurrentMonthHistory(): void {
  const db = getDb();
  if (!db) return;
  const month = currentMonthLabel();
  const resolved = db.prepare("SELECT count(*) as c FROM grievance_sla_cases WHERE status = 'RESOLVED'").get() as any;
  const breached = db.prepare("SELECT count(*) as c FROM grievance_sla_cases WHERE status != 'RESOLVED' AND (julianday('now') - julianday(created_at)) * 24 > statutory_limit_hours").get() as any;
  const existing = db.prepare('SELECT month FROM grievance_sla_history WHERE month = ?').get(month) as any;
  if (existing) {
    db.prepare('UPDATE grievance_sla_history SET resolved = ?, breached = ?, month = month WHERE month = ?').run(Number(resolved?.c || 0), Number(breached?.c || 0), month);
  } else {
    db.prepare('INSERT INTO grievance_sla_history (month, resolved, breached) VALUES (?, ?, ?)').run(month, Number(resolved?.c || 0), Number(breached?.c || 0));
  }
}

grievanceSlaRouter.get('/overview', (_req: Request, res: Response) => {
  initGrievanceTables();
  touchCurrentMonthHistory();
  const computed = fetchAllCases();
  const critical = computed.filter(c => c.urgencyStatus === 'CRITICAL').length;
  const warning = computed.filter(c => c.urgencyStatus === 'WARNING').length;
  const breached = computed.filter(c => c.urgencyStatus === 'BREACHED').length;
  const resolved = computed.filter(c => c.status === 'RESOLVED').length;
  const onTime = computed.filter(c => c.status === 'RESOLVED' && c.urgencyStatus !== 'BREACHED').length;
  const withinSla = computed.filter(c => c.urgencyStatus !== 'BREACHED').length;

  const statusDistribution = Object.entries(
    computed.reduce<Record<string, number>>((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const categoryBreakdown = Object.entries(
    computed.reduce<Record<string, { total: number; count: number; max: number }>>((acc, c) => {
      const k = c.normalizedCategory;
      acc[k] = acc[k] || { total: 0, count: 0, max: 0 };
      acc[k].total += c.hoursElapsed;
      acc[k].count += 1;
      acc[k].max = Math.max(acc[k].max, c.statutoryLimitHours);
      return acc;
    }, {})
  ).map(([category, v]) => ({ category, avgResolutionHours: Number((v.total / v.count).toFixed(1)), maxSlaHours: v.max }));

  const db = getDb();
  const history = db ? (db.prepare('SELECT * FROM grievance_sla_history ORDER BY month ASC').all() as any[]) : [];
  const resolutionTrend = history.map((h: any) => ({ month: h.month, resolved: h.resolved, breached: h.breached }));

  const jurisdictionPerformance = Object.entries(
    computed.reduce<Record<string, { total: number; count: number; critical: number }>>((acc, c) => {
      const k = c.jurisdictionName;
      acc[k] = acc[k] || { total: 0, count: 0, critical: 0 };
      acc[k].total += c.hoursElapsed;
      acc[k].count += 1;
      if (c.urgencyStatus === 'CRITICAL' || c.urgencyStatus === 'BREACHED') acc[k].critical += 1;
      return acc;
    }, {})
  ).map(([jurisdiction, v]) => ({ jurisdiction, avgResolutionHours: Number((v.total / v.count).toFixed(1)), criticalCases: v.critical }));

  const avgResolutionHours = computed.length
    ? Number((computed.reduce((s, c) => s + c.hoursElapsed, 0) / computed.length).toFixed(1))
    : 0;

  res.json({
    success: true,
    data: {
      summary: {
        criticalUrgencyCount: critical,
        warningUrgencyCount: warning,
        breachedCount: breached,
        slaComplianceRate: computed.length ? Number(((withinSla / computed.length) * 100).toFixed(1)) : 100,
        resolvedLast30Days: resolved,
        avgResolutionHours,
        onTimeResolved: onTime
      },
      statusDistribution,
      categoryBreakdown,
      resolutionTrend,
      jurisdictionPerformance
    }
  });
});

grievanceSlaRouter.get('/cases', (_req: Request, res: Response) => {
  initGrievanceTables();
  res.json({ success: true, data: fetchAllCases() });
});

grievanceSlaRouter.post('/reassign', (req: Request, res: Response) => {
  const { caseId, newOfficerId, newOfficerName } = req.body || {};
  initGrievanceTables();
  const db = getDb();
  const found = db.prepare('SELECT * FROM grievance_sla_cases WHERE id = ?').get(caseId) as any;
  if (!found) return res.status(404).json({ success: false, error: 'Case not found' });
  const officer = newOfficerName || OFFICERS[newOfficerId] || found.assigned_officer;
  db.prepare('UPDATE grievance_sla_cases SET assigned_officer_id = ?, assigned_officer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    newOfficerId || found.assigned_officer_id,
    officer,
    caseId
  );
  const fresh = db.prepare('SELECT * FROM grievance_sla_cases WHERE id = ?').get(caseId) as any;
  const updated = computeCase(rowToCase(fresh));
  res.json({ success: true, message: `Case ${updated.refCode} reassigned to ${officer}.`, case: updated });
});

grievanceSlaRouter.post('/escalate', (req: Request, res: Response) => {
  const { caseId, escalationType, notes } = req.body || {};
  initGrievanceTables();
  const db = getDb();
  const found = db.prepare('SELECT * FROM grievance_sla_cases WHERE id = ?').get(caseId) as any;
  if (!found) return res.status(404).json({ success: false, error: 'Case not found' });
  db.prepare(
    `UPDATE grievance_sla_cases SET status = 'REGULATORY_ESCALATION', cure_notice_dispatched = 1, cure_notice_timestamp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(new Date().toISOString(), caseId);
  const docketRef = `DOC-${randomUUID().slice(0, 6).toUpperCase()}`;
  const fresh = db.prepare('SELECT * FROM grievance_sla_cases WHERE id = ?').get(caseId) as any;
  res.json({
    success: true,
    message: `Escalation [${escalationType || 'STANDARD'}] dispatched for ${fresh.ref_code}.${notes ? ' Notes recorded.' : ''}`,
    docketRef,
    case: computeCase(rowToCase(fresh))
  });
});

grievanceSlaRouter.post('/resolve', (req: Request, res: Response) => {
  const { caseId, resolutionOutcome, remediationTerms } = req.body || {};
  initGrievanceTables();
  const db = getDb();
  const found = db.prepare('SELECT * FROM grievance_sla_cases WHERE id = ?').get(caseId) as any;
  if (!found) return res.status(404).json({ success: false, error: 'Case not found' });
  db.prepare(`UPDATE grievance_sla_cases SET status = 'RESOLVED', resolution_timestamp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
    new Date().toISOString(),
    caseId
  );
  touchCurrentMonthHistory();
  const fresh = db.prepare('SELECT * FROM grievance_sla_cases WHERE id = ?').get(caseId) as any;
  res.json({
    success: true,
    message: `Case ${fresh.ref_code} resolved with outcome [${resolutionOutcome || 'REMEDIED'}].`,
    remediationTerms: remediationTerms || null,
    case: computeCase(rowToCase(fresh))
  });
});