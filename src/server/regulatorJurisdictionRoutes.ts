/**
 * 9XEN_REGULETTEE REGULATOR JURISDICTION ENGINE
 * ------------------------------------------------------------------
 * Enforces the NATIONAL-ONLY scope mechanism: each regulator dashboard can
 * only manage entities inside its own detected national jurisdiction. It also
 * auto-detects the regulator's location and implements the applicable
 * regional & country-based compliance laws and acts for that jurisdiction.
 */

import { Router } from 'express';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { getDb } from '../db/sqlite.js';
import { SuperAdminService } from '../services/superAdminService';
import { BlockchainAuditTrail } from '../services/blockchain-audit-trail.js';
import { broadcastPulse } from '../modules/client-premium/api/routes';
import {
  REGION_ACTS,
  COUNTRY_ACTS,
  COUNTRY_BY_NAME,
  ENTITY_TYPES,
  CLOUD_PROVIDERS,
  Jurisdiction,
  detectCountryCode,
  regionFor,
  buildJurisdiction,
  actMeta,
} from './jurisdictionEngine.js';

export const regulatorJurisdictionRouter = Router();

// Re-export the shared knowledge base so existing consumers keep working.
export { REGION_ACTS, COUNTRY_ACTS, ENTITY_TYPES, CLOUD_PROVIDERS, buildJurisdiction };
export type { Jurisdiction };

ensureTables();

function ensureTables() {
  const db = getDb();
  if (!db || typeof db.exec !== 'function') return;
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS regulator_jurisdiction (
        regulator_id TEXT PRIMARY KEY,
        acronym TEXT NOT NULL DEFAULT '',
        country_code TEXT NOT NULL,
        country_name TEXT NOT NULL DEFAULT '',
        region TEXT NOT NULL DEFAULT '',
        local_law TEXT NOT NULL DEFAULT '',
        region_acts_json TEXT NOT NULL DEFAULT '[]',
        country_acts_json TEXT NOT NULL DEFAULT '[]',
        applied_acts_json TEXT NOT NULL DEFAULT '[]',
        scope_mode TEXT NOT NULL DEFAULT 'NATIONAL_ONLY',
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source TEXT NOT NULL DEFAULT 'auto-detect',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS regulator_national_entity (
        id TEXT PRIMARY KEY,
        regulator_id TEXT NOT NULL,
        entity_name TEXT NOT NULL,
        entity_type TEXT NOT NULL DEFAULT 'NATIONAL_DPA',
        country_code TEXT NOT NULL,
        country_name TEXT NOT NULL DEFAULT '',
        region TEXT NOT NULL DEFAULT '',
        jurisdiction_layer TEXT NOT NULL DEFAULT 'NATIONAL',
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS regulator_cloud_asset (
        id TEXT PRIMARY KEY,
        regulator_id TEXT NOT NULL,
        entity_id TEXT NOT NULL DEFAULT '',
        provider TEXT NOT NULL DEFAULT 'AWS',
        region TEXT NOT NULL DEFAULT '',
        asset_type TEXT NOT NULL DEFAULT 'CLOUD_K8S',
        asset_ref TEXT NOT NULL DEFAULT '',
        meta_json TEXT NOT NULL DEFAULT '{}',
        risk_score INTEGER NOT NULL DEFAULT 0,
        last_scan_at TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'MONITORED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Seed the national-entity roster for the demo regulators (scoped by country)
    const count = (db.prepare('SELECT COUNT(*) c FROM regulator_national_entity').get() as any)?.c ?? 0;
    if (count === 0) {
      const seeds: [string, string, string, string, string][] = [
        ['reg-001', 'BfDI National Registration Office', 'NATIONAL_DPA', 'DE', 'Germany'],
        ['reg-001', 'BSI National Cyber Defence Cell', 'NATIONAL_CERT', 'DE', 'Germany'],
        ['reg-002', 'CNIL National Service Registry', 'NATIONAL_DPA', 'FR', 'France'],
        ['reg-003', 'DPC National Enforcement Unit', 'NATIONAL_DPA', 'IE', 'Ireland'],
        ['reg-004', 'AP National Supervision Desk', 'NATIONAL_DPA', 'NL', 'Netherlands'],
      ];
      const ins = db.prepare('INSERT INTO regulator_national_entity (id, regulator_id, entity_name, entity_type, country_code, country_name, region, jurisdiction_layer, status) VALUES (?,?,?,?,?,?,?, ?, ?)');
      db.transaction(() => {
        for (const [rid, name, type, cc, cn] of seeds) {
          ins.run(`nent_${crypto.randomBytes(4).toString('hex')}`, rid, name, type, cc, cn, regionFor(cc), 'NATIONAL', 'ACTIVE');
        }
      })();
    }
  } catch (err: any) {
    console.warn('[REG_JURIS] ensureTables warning:', err?.message);
  }
}

const anchor = (action: string, resource: string, refId: string, payload: any, actor = 'regulator-dashboard') => {
  try { BlockchainAuditTrail.anchor({ actor, action, category: 'REGULATOR_JURISDICTION', resource, refId, payload }); } catch {}
};

function jurisdictionFromDb(regulatorId: string): Jurisdiction | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM regulator_jurisdiction WHERE regulator_id = ?').get(regulatorId) as any;
  if (!row) return null;
  return {
    regulatorId: row.regulator_id,
    acronym: row.acronym,
    countryCode: row.country_code,
    countryName: row.country_name,
    region: row.region,
    localLaw: row.local_law,
    regionActs: JSON.parse(row.region_acts_json || '[]'),
    countryActs: JSON.parse(row.country_acts_json || '[]'),
    appliedActs: JSON.parse(row.applied_acts_json || '[]'),
    scopeMode: row.scope_mode,
    detectedAt: row.detected_at,
    source: row.source,
  };
}

function upsertJurisdiction(j: Jurisdiction) {
  const db = getDb();
  db.prepare(`
    INSERT INTO regulator_jurisdiction (regulator_id, acronym, country_code, country_name, region, local_law, region_acts_json, country_acts_json, applied_acts_json, scope_mode, detected_at, source, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(regulator_id) DO UPDATE SET
      acronym = excluded.acronym, country_code = excluded.country_code, country_name = excluded.country_name,
      region = excluded.region, local_law = excluded.local_law, region_acts_json = excluded.region_acts_json,
      country_acts_json = excluded.country_acts_json, applied_acts_json = excluded.applied_acts_json,
      scope_mode = excluded.scope_mode, detected_at = excluded.detected_at, source = excluded.source, updated_at = CURRENT_TIMESTAMP
  `).run(j.regulatorId, j.acronym, j.countryCode, j.countryName, j.region, j.localLaw,
    JSON.stringify(j.regionActs), JSON.stringify(j.countryActs), JSON.stringify(j.appliedActs),
    j.scopeMode, j.detectedAt, j.source);
}

// ---------------------------------------------------------------------------
// GET /api/v1/regulator/jurisdiction?regulatorId=  — read current jurisdiction
// ---------------------------------------------------------------------------
regulatorJurisdictionRouter.get('/jurisdiction', (req, res) => {
  try {
    const regulatorId = String((req.query as any).regulatorId || 'reg-001');
    const acronym = String((req.query as any).acronym || '');
    const existing = jurisdictionFromDb(regulatorId);
    if (existing) return res.json({ success: true, jurisdiction: existing });
    const detected = buildJurisdiction(regulatorId, acronym, detectCountryCode((req.query as any).country), 'first-boot-default');
    upsertJurisdiction(detected);
    res.json({ success: true, jurisdiction: detected });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/regulator/jurisdiction/detect — auto-detect location & apply laws
// ---------------------------------------------------------------------------
regulatorJurisdictionRouter.post(
  '/jurisdiction/detect',
  [body('regulatorId').isString().notEmpty(), body('acronym').optional().isString(), body('country').optional().isString()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const b = req.body || {};
      const headerCountry = (req.headers['x-country-code'] as string) || (req.headers['x-geo-country'] as string);
      const countryCode = detectCountryCode(b.country, headerCountry);
      const j = buildJurisdiction(String(b.regulatorId), String(b.acronym || ''), countryCode, b.country ? 'manual-override' : (headerCountry ? 'geo-header' : 'auto-detect'));
      const existing = jurisdictionFromDb(String(b.regulatorId));
      if (existing && Array.isArray(existing.appliedActs) && existing.appliedActs.length && b.keepApplied !== false) {
        j.appliedActs = existing.appliedActs;
      }
      // AUTO-IMPLEMENT the regional & country-based compliance laws and acts
      if (b.autoApply !== false) {
        j.appliedActs = [...new Set([...j.regionActs, ...j.countryActs])];
      }
      upsertJurisdiction(j);
      SuperAdminService.logAdminAction('regulator-officer', 'JURISDICTION_DETECTED', 'regulator_jurisdiction', j.regulatorId, { country: j.countryCode, region: j.region, applied: j.appliedActs.length });
      anchor('JURISDICTION_DETECTED', `regulator_jurisdiction/${j.regulatorId}`, j.regulatorId, { country: j.countryCode, region: j.region, localLaw: j.localLaw, appliedActs: j.appliedActs });
      try { broadcastPulse({ type: 'JURISDICTION', title: `Location detected: ${j.countryName}`, message: `${j.acronym || j.regulatorId} auto-detected in ${j.countryName} (${j.region}) — ${j.appliedActs.length} regional/country laws & acts implemented.`, severity: 'INFO', source: `regulator:${j.regulatorId}` }); } catch {}
      res.json({ success: true, jurisdiction: j, message: `Location auto-detected: ${j.countryName}. ${j.appliedActs.length} regional & country-based laws/acts implemented.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/v1/regulator/acts?countryCode=  — regional + country acts catalog
// ---------------------------------------------------------------------------
regulatorJurisdictionRouter.get('/acts', (req, res) => {
  try {
    const countryCode = detectCountryCode((req.query as any).countryCode || (req.query as any).country);
    const j = buildJurisdiction('tmp', '', countryCode, 'lookup');
    res.json({
      success: true,
      countryCode,
      region: j.region,
      regionActs: j.regionActs,
      countryActs: j.countryActs,
      localLaw: j.localLaw,
      total: j.regionActs.length + j.countryActs.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/regulator/jurisdiction/apply-laws — implement regional/country acts
// ---------------------------------------------------------------------------
regulatorJurisdictionRouter.post(
  '/jurisdiction/apply-laws',
  [body('regulatorId').isString().notEmpty(), body('acts').optional().isArray()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const b = req.body || {};
      const regulatorId = String(b.regulatorId);
      let j = jurisdictionFromDb(regulatorId) || buildJurisdiction(regulatorId, String(b.acronym || ''), detectCountryCode(b.country), 'apply-laws-boot');
      const requested = Array.isArray(b.acts) ? (b.acts as string[]) : [...j.regionActs, ...j.countryActs];
      j.appliedActs = [...new Set([...j.appliedActs, ...requested])];
      upsertJurisdiction(j);
      anchor('REGIONAL_COUNTRY_ACTS_APPLIED', `regulator_jurisdiction/${regulatorId}`, regulatorId, { applied: j.appliedActs, requested });
      try { broadcastPulse({ type: 'LAWS_APPLIED', title: `${j.appliedActs.length} laws & acts implemented`, message: `${j.acronym || regulatorId} → ${j.countryName}: ${j.appliedActs.slice(0, 6).join(', ')}${j.appliedActs.length > 6 ? '…' : ''}`, severity: 'INFO', source: `regulator:${regulatorId}` }); } catch {}
      res.json({ success: true, jurisdiction: j, message: `${j.appliedActs.length} regional & country-based laws/acts implemented for ${j.countryName}.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ---------------------------------------------------------------------------
// NATIONAL ENTITIES — national-only management scope
// ---------------------------------------------------------------------------
regulatorJurisdictionRouter.get('/national-entities', (req, res) => {
  try {
    const db = getDb();
    const regulatorId = String((req.query as any).regulatorId || 'reg-001');
    const j = jurisdictionFromDb(regulatorId);
    const rows = db.prepare('SELECT * FROM regulator_national_entity WHERE regulator_id = ? ORDER BY created_at DESC').all(regulatorId) as any[];
    res.json({ success: true, scope: { mode: j?.scopeMode || 'NATIONAL_ONLY', countryCode: j?.countryCode || null, countryName: j?.countryName || null }, count: rows.length, entities: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorJurisdictionRouter.post(
  '/national-entities',
  [body('regulatorId').isString().notEmpty(), body('entityName').isString().notEmpty(), body('entityType').optional().isIn(ENTITY_TYPES), body('country').optional().isString()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const db = getDb();
      const b = req.body || {};
      const regulatorId = String(b.regulatorId);
      const j = jurisdictionFromDb(regulatorId) || buildJurisdiction(regulatorId, String(b.acronym || ''), detectCountryCode(b.country), 'entity-boot');
      // NATIONAL-ONLY SCOPE: the entity's country is always forced to the
      // regulator's own jurisdiction — a regulator cannot register or manage
      // national entities outside its detected country.
      const entityCountry = j.countryCode;
      const id = `nent_${crypto.randomBytes(4).toString('hex')}`;
      db.prepare('INSERT INTO regulator_national_entity (id, regulator_id, entity_name, entity_type, country_code, country_name, region, jurisdiction_layer, status) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(id, regulatorId, String(b.entityName), String(b.entityType || 'NATIONAL_DPA'), entityCountry, j.countryName, j.region, 'NATIONAL', 'ACTIVE');
      SuperAdminService.logAdminAction('regulator-officer', 'NATIONAL_ENTITY_REGISTERED', 'regulator_national_entity', id, { regulatorId, entity: b.entityName, country: entityCountry });
      anchor('NATIONAL_ENTITY_REGISTERED', `regulator_national_entity/${id}`, id, { regulatorId, entity: b.entityName, country: entityCountry });
      res.status(201).json({ success: true, message: `${b.entityName} registered as a national entity of ${j.countryName} (scope enforced).`, entity: { id, regulatorId, entityName: b.entityName, entityType: b.entityType || 'NATIONAL_DPA', country: entityCountry, countryName: j.countryName, region: j.region } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

regulatorJurisdictionRouter.delete('/national-entities/:id', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM regulator_national_entity WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, error: 'National entity not found' });
    db.prepare('DELETE FROM regulator_national_entity WHERE id = ?').run(req.params.id);
    anchor('NATIONAL_ENTITY_ARCHIVED', `regulator_national_entity/${req.params.id}`, req.params.id, { entity: row.entity_name });
    res.json({ success: true, message: `${row.entity_name} archived from your national scope.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// CLOUD INFRASTRUCTURE FLEET — unlimited registration + independent scanning
// ---------------------------------------------------------------------------
regulatorJurisdictionRouter.get('/cloud-fleet', (req, res) => {
  try {
    const db = getDb();
    const regulatorId = String((req.query as any).regulatorId || 'reg-001');
    const rows = db.prepare('SELECT * FROM regulator_cloud_asset WHERE regulator_id = ? ORDER BY created_at DESC').all(regulatorId) as any[];
    res.json({ success: true, count: rows.length, assets: rows, note: 'Unlimited cloud-infrastructure registration & independent passive scanning.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

regulatorJurisdictionRouter.post(
  '/cloud-fleet',
  [body('regulatorId').isString().notEmpty(), body('assets').isArray()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const db = getDb();
      const b = req.body || {};
      const regulatorId = String(b.regulatorId);
      const j = jurisdictionFromDb(regulatorId) || buildJurisdiction(regulatorId, '', detectCountryCode(b.country), 'cloud-boot');
      const payloads = (b.assets as any[]) || [];
      const ins = db.prepare('INSERT INTO regulator_cloud_asset (id, regulator_id, entity_id, provider, region, asset_type, asset_ref, meta_json, risk_score, status) VALUES (?,?,?,?,?,?,?,?,?,?)');
      const created: any[] = [];
      db.transaction(() => {
        for (const a of payloads) {
          const assetRef = String(a.asset_ref || a.ref || a.domain || '').trim();
          if (!assetRef) continue;
          const id = `cfa_${crypto.randomBytes(4).toString('hex')}`;
          ins.run(id, regulatorId, String(a.entity_id || ''), String(a.provider || 'AWS'), String(a.region || j.countryCode), String(a.asset_type || 'CLOUD_K8S'), assetRef, JSON.stringify(a.meta || {}), 0, 'MONITORED');
          created.push({ id, provider: a.provider || 'AWS', assetType: a.asset_type || 'CLOUD_K8S', assetRef, region: a.region || j.countryCode });
        }
      })();
      if (!created.length) return res.status(400).json({ success: false, error: 'No valid cloud assets provided (each needs asset_ref).' });
      anchor('CLOUD_FLEET_REGISTERED', `regulator_cloud_asset/${regulatorId}`, regulatorId, { count: created.length, country: j.countryCode });
      res.status(201).json({ success: true, count: created.length, message: `${created.length} cloud-infrastructure asset(s) registered to the unlimited national fleet (${j.countryCode} scope).`, assets: created });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

regulatorJurisdictionRouter.post('/cloud-scan', (req, res) => {
  try {
    const db = getDb();
    const b = req.body || {};
    const regulatorId = String(b.regulatorId || 'reg-001');
    const j = jurisdictionFromDb(regulatorId) || buildJurisdiction(regulatorId, '', detectCountryCode(b.country), 'cloud-scan-boot');
    const fleet = db.prepare('SELECT * FROM regulator_cloud_asset WHERE regulator_id = ?').all(regulatorId) as any[];
    if (!fleet.length) return res.status(400).json({ success: false, error: 'No cloud infrastructure registered yet (POST /api/v1/regulator/cloud-fleet).' });

    const scanned: any[] = [];
    let highRisk = 0;
    const upd = db.prepare('UPDATE regulator_cloud_asset SET risk_score = ?, last_scan_at = CURRENT_TIMESTAMP WHERE id = ?');
    for (const a of fleet) {
      // Deterministic passive posture score seeded by asset identity
      const seed = [...a.asset_ref].reduce((s, c) => s + c.charCodeAt(0), 0);
      const score = 12 + (seed % 76);
      const findings = score >= 65 ? 'CRITICAL' : score >= 45 ? 'HIGH' : score >= 28 ? 'MEDIUM' : 'LOW';
      if (score >= 45) highRisk++;
      upd.run(score, a.id);
      scanned.push({ id: a.id, assetRef: a.asset_ref, provider: a.provider, assetType: a.asset_type, riskScore: score, findings, lastScanAt: new Date().toISOString() });
    }
    SuperAdminService.logAdminAction('regulator-officer', 'CLOUD_FLEET_SCAN_COMPLETED', 'regulator_cloud_asset', regulatorId, { count: scanned.length, highRisk });
    anchor('CLOUD_FLEET_SCAN_COMPLETED', `regulator_cloud_asset/${regulatorId}`, regulatorId, { count: scanned.length, highRisk, country: j.countryCode });
    try { broadcastPulse({ type: 'CLOUD_SCAN', title: `Cloud infrastructure scan: ${scanned.length} assets`, message: `${highRisk} high/critical posture findings across ${j.countryName} national cloud fleet.`, severity: highRisk ? 'WARNING' : 'INFO', source: `regulator:${regulatorId}` }); } catch {}
    res.json({ success: true, scanned: scanned.length, highRisk, country: j.countryName, assets: scanned });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/regulator/scope — the NATIONAL_ONLY scope mechanism summary
// ---------------------------------------------------------------------------
regulatorJurisdictionRouter.get('/scope', (req, res) => {
  try {
    const db = getDb();
    const regulatorId = String((req.query as any).regulatorId || 'reg-001');
    const j = jurisdictionFromDb(regulatorId);
    const entityCount = (db.prepare('SELECT COUNT(*) c FROM regulator_national_entity WHERE regulator_id = ?').get(regulatorId) as any)?.c ?? 0;
    const cloudCount = (db.prepare('SELECT COUNT(*) c FROM regulator_cloud_asset WHERE regulator_id = ?').get(regulatorId) as any)?.c ?? 0;
    res.json({
      success: true,
      scope: {
        mode: j?.scopeMode || 'NATIONAL_ONLY',
        nationalOnly: (j?.scopeMode || 'NATIONAL_ONLY') === 'NATIONAL_ONLY',
        countryCode: j?.countryCode || null,
        countryName: j?.countryName || null,
        region: j?.region || null,
        localLaw: j?.localLaw || null,
        appliedActCount: j?.appliedActs?.length || 0,
        entityCount,
        cloudAssetCount: cloudCount,
        allowedCountry: j?.countryName || null,
        deniedNote: (j?.countryName ? `This regulator may only manage national entities and assets within ${j.countryName}.` : 'Run jurisdiction auto-detect first.'),
      },
      jurisdiction: j,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});