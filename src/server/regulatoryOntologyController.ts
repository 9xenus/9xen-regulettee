import { Router } from 'express';
import { getDb } from '../db/sqlite.js';
import { queryPg, queryPgOne } from '../db/postgres.js';
import crypto from 'crypto';
import { requireAuth, requireAuthRoles } from '../middleware/auth.js';

export const regulatoryOntologyRouter = Router();

const WRITE_ROLES = ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'LEGAL_ANALYST'];

// GET /api/v1/regulatory/ontology/obligations - Search & filter structured obligations
regulatoryOntologyRouter.get('/obligations', requireAuth, async (req, res) => {
  const { regulation, industry, status, companySize } = req.query;

  try {
    if (process.env.DATABASE_URL) {
      let sql = `SELECT * FROM regulatory_obligations WHERE 1=1`;
      const params: any[] = [];
      let paramIdx = 1;

      if (regulation) {
        sql += ` AND source_regulation = $${paramIdx++}`;
        params.push(regulation);
      }
      if (status) {
        sql += ` AND status = $${paramIdx++}`;
        params.push(status);
      }
      if (companySize) {
        sql += ` AND (company_size_tier = 'ALL' OR company_size_tier = $${paramIdx++})`;
        params.push(companySize);
      }

      sql += ` ORDER BY updated_at DESC`;
      const rows = await queryPg(sql, params);

      const formatted = rows.map((r: any) => ({
        ...r,
        applicable_industries: typeof r.applicable_industries === 'string' ? JSON.parse(r.applicable_industries) : r.applicable_industries,
        evidence_required: typeof r.evidence_required === 'string' ? JSON.parse(r.evidence_required) : r.evidence_required
      })).filter((r: any) => {
        if (!industry) return true;
        return Array.isArray(r.applicable_industries) && r.applicable_industries.includes(industry);
      });

      return res.json({ success: true, count: formatted.length, data: formatted });
    } else {
      const db = getDb();
      let sql = `SELECT * FROM regulatory_obligations WHERE 1=1`;
      const params: any[] = [];

      if (regulation) {
        sql += ` AND source_regulation = ?`;
        params.push(regulation);
      }
      if (status) {
        sql += ` AND status = ?`;
        params.push(status);
      }
      if (companySize) {
        sql += ` AND (company_size_tier = 'ALL' OR company_size_tier = ?)`;
        params.push(companySize);
      }

      sql += ` ORDER BY updated_at DESC`;
      const rows = db.prepare(sql).all(...params) as any[];

      const formatted = rows.map(r => ({
        ...r,
        applicable_industries: JSON.parse(r.applicable_industries || '[]'),
        evidence_required: JSON.parse(r.evidence_required || '[]')
      })).filter(r => {
        if (!industry) return true;
        return Array.isArray(r.applicable_industries) && r.applicable_industries.includes(industry);
      });

      return res.json({ success: true, count: formatted.length, data: formatted });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/regulatory/ontology/obligations/:id - Get obligation detail with regulator interpretations & history
regulatoryOntologyRouter.get('/obligations/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    if (process.env.DATABASE_URL) {
      const obligation = await queryPgOne(`SELECT * FROM regulatory_obligations WHERE obligation_id = $1`, [id]);
      if (!obligation) return res.status(404).json({ success: false, error: 'Obligation not found' });

      const interpretations = await queryPg(`SELECT * FROM regulator_interpretations WHERE obligation_id = $1`, [id]);
      const history = await queryPg(`SELECT * FROM obligation_version_history WHERE obligation_id = $1 ORDER BY changed_at DESC`, [id]);

      return res.json({
        success: true,
        data: {
          ...obligation,
          applicable_industries: typeof obligation.applicable_industries === 'string' ? JSON.parse(obligation.applicable_industries) : obligation.applicable_industries,
          evidence_required: typeof obligation.evidence_required === 'string' ? JSON.parse(obligation.evidence_required) : obligation.evidence_required,
          interpretations,
          history
        }
      });
    } else {
      const db = getDb();
      const obligation = db.prepare(`SELECT * FROM regulatory_obligations WHERE obligation_id = ?`).get(id) as any;
      if (!obligation) return res.status(404).json({ success: false, error: 'Obligation not found' });

      const interpretations = db.prepare(`SELECT * FROM regulator_interpretations WHERE obligation_id = ?`).all(id);
      const history = db.prepare(`SELECT * FROM obligation_version_history WHERE obligation_id = ? ORDER BY changed_at DESC`).all(id);

      return res.json({
        success: true,
        data: {
          ...obligation,
          applicable_industries: JSON.parse(obligation.applicable_industries || '[]'),
          evidence_required: JSON.parse(obligation.evidence_required || '[]'),
          interpretations,
          history
        }
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/regulatory/ontology/obligations - Create/Draft an obligation
regulatoryOntologyRouter.post('/obligations', requireAuthRoles(WRITE_ROLES), async (req, res) => {
  const {
    source_regulation, article_ref, title, description,
    applicable_industries, company_size_tier, evidence_required, penalty_range, effective_date
  } = req.body;

  if (!source_regulation || !article_ref || !title || !description) {
    return res.status(400).json({ success: false, error: 'Missing required obligation fields' });
  }

  const obligation_id = `obl_${source_regulation.toLowerCase().replace(/[^a-z0-9]/g, '')}_${article_ref.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;
  const now = new Date().toISOString();

  try {
    if (process.env.DATABASE_URL) {
      await queryPg(`
        INSERT INTO regulatory_obligations (
          obligation_id, source_regulation, article_ref, title, description,
          applicable_industries, company_size_tier, evidence_required, penalty_range,
          effective_date, version, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'v1.0', 'AI_EXTRACTED', $11, $11)
      `, [
        obligation_id, source_regulation, article_ref, title, description,
        JSON.stringify(applicable_industries || []), company_size_tier || 'ALL',
        JSON.stringify(evidence_required || []), penalty_range || 'Subject to statutory maximums',
        effective_date || now.split('T')[0], now
      ]);
    } else {
      getDb().prepare(`
        INSERT INTO regulatory_obligations (
          obligation_id, source_regulation, article_ref, title, description,
          applicable_industries, company_size_tier, evidence_required, penalty_range,
          effective_date, version, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'v1.0', 'AI_EXTRACTED', ?, ?)
      `).run(
        obligation_id, source_regulation, article_ref, title, description,
        JSON.stringify(applicable_industries || []), company_size_tier || 'ALL',
        JSON.stringify(evidence_required || []), penalty_range || 'Subject to statutory maximums',
        effective_date || now.split('T')[0], now, now
      );
    }

    res.json({ success: true, obligation_id, message: 'New obligation extracted/drafted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/regulatory/ontology/verify - Human Expert Review Workflow
regulatoryOntologyRouter.post('/verify', requireAuthRoles(WRITE_ROLES), async (req, res) => {
  const { obligation_id, reviewer_name, notes, approved_title, approved_description, new_version } = req.body;

  if (!obligation_id || !reviewer_name) {
    return res.status(400).json({ success: false, error: 'obligation_id and reviewer_name are required' });
  }

  const now = new Date().toISOString();
  const version = new_version || 'v1.1';

  try {
    let existing: any;
    if (process.env.DATABASE_URL) {
      existing = await queryPgOne(`SELECT * FROM regulatory_obligations WHERE obligation_id = $1`, [obligation_id]);
    } else {
      existing = getDb().prepare(`SELECT * FROM regulatory_obligations WHERE obligation_id = ?`).get(obligation_id);
    }

    if (!existing) return res.status(404).json({ success: false, error: 'Obligation not found' });

    const updatedTitle = approved_title || existing.title;
    const updatedDesc = approved_description || existing.description;

    if (process.env.DATABASE_URL) {
      await queryPg(`
        UPDATE regulatory_obligations SET
          title = $1, description = $2, version = $3, status = 'HUMAN_VERIFIED',
          verified_by = $4, verified_at = $5, verification_notes = $6, updated_at = $5
        WHERE obligation_id = $7
      `, [updatedTitle, updatedDesc, version, reviewer_name, now, notes || 'Verified by legal counsel.', obligation_id]);

      await queryPg(`
        INSERT INTO obligation_version_history (
          history_id, obligation_id, version_number, changed_at, changed_by, change_type, change_summary, previous_text, new_text
        ) VALUES ($1, $2, $3, $4, $5, 'HUMAN_VERIFICATION', $6, $7, $8)
      `, [
        `hist_${Date.now()}`, obligation_id, version, now, reviewer_name,
        notes || 'Expert verification completed', existing.description, updatedDesc
      ]);
    } else {
      const db = getDb();
      db.prepare(`
        UPDATE regulatory_obligations SET
          title = ?, description = ?, version = ?, status = 'HUMAN_VERIFIED',
          verified_by = ?, verified_at = ?, verification_notes = ?, updated_at = ?
        WHERE obligation_id = ?
      `).run(updatedTitle, updatedDesc, version, reviewer_name, now, notes || 'Verified by legal counsel.', now, obligation_id);

      db.prepare(`
        INSERT INTO obligation_version_history (
          history_id, obligation_id, version_number, changed_at, changed_by, change_type, change_summary, previous_text, new_text
        ) VALUES (?, ?, ?, ?, ?, 'HUMAN_VERIFICATION', ?, ?, ?)
      `).run(
        `hist_${Date.now()}`, obligation_id, version, now, reviewer_name,
        notes || 'Expert verification completed', existing.description, updatedDesc
      );
    }

    res.json({
      success: true,
      obligation_id,
      status: 'HUMAN_VERIFIED',
      verified_by: reviewer_name,
      verified_at: now,
      version
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/regulatory/ontology/history - Versioned Change History as a Product Feature
regulatoryOntologyRouter.get('/history', requireAuth, async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      const rows = await queryPg(`
        SELECT h.*, o.title as obligation_title, o.source_regulation, o.article_ref
        FROM obligation_version_history h
        JOIN regulatory_obligations o ON h.obligation_id = o.obligation_id
        ORDER BY h.changed_at DESC
        LIMIT 50
      `);
      return res.json({ success: true, count: rows.length, data: rows });
    } else {
      const db = getDb();
      const rows = db.prepare(`
        SELECT h.*, o.title as obligation_title, o.source_regulation, o.article_ref
        FROM obligation_version_history h
        JOIN regulatory_obligations o ON h.obligation_id = o.obligation_id
        ORDER BY h.changed_at DESC
        LIMIT 50
      `).all();
      return res.json({ success: true, count: rows.length, data: rows });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/regulatory/ontology/interpretations - Add/Update country regulator guidance
regulatoryOntologyRouter.post('/interpretations', requireAuthRoles(WRITE_ROLES), async (req, res) => {
  const {
    obligation_id, regulator_code, jurisdiction, regulator_name,
    guidance_title, guidance_summary, stricter_than_eu_baseline,
    local_enforcement_trend, citation_url, reviewer_name
  } = req.body;

  if (!obligation_id || !regulator_code || !guidance_title || !guidance_summary) {
    return res.status(400).json({ success: false, error: 'Missing required interpretation fields' });
  }

  const interpretation_id = `interp_${regulator_code.toLowerCase()}_${obligation_id}_${Date.now()}`;
  const now = new Date().toISOString();

  try {
    if (process.env.DATABASE_URL) {
      await queryPg(`
        INSERT INTO regulator_interpretations (
          interpretation_id, obligation_id, regulator_code, jurisdiction, regulator_name,
          guidance_title, guidance_summary, stricter_than_eu_baseline, local_enforcement_trend,
          citation_url, verified_by, verified_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $12)
      `, [
        interpretation_id, obligation_id, regulator_code, jurisdiction || 'EU', regulator_name || regulator_code,
        guidance_title, guidance_summary, stricter_than_eu_baseline ? 1 : 0,
        local_enforcement_trend || null, citation_url || null, reviewer_name || 'Legal Analyst', now
      ]);
    } else {
      getDb().prepare(`
        INSERT INTO regulator_interpretations (
          interpretation_id, obligation_id, regulator_code, jurisdiction, regulator_name,
          guidance_title, guidance_summary, stricter_than_eu_baseline, local_enforcement_trend,
          citation_url, verified_by, verified_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        interpretation_id, obligation_id, regulator_code, jurisdiction || 'EU', regulator_name || regulator_code,
        guidance_title, guidance_summary, stricter_than_eu_baseline ? 1 : 0,
        local_enforcement_trend || null, citation_url || null, reviewer_name || 'Legal Analyst', now, now, now
      );
    }

    res.json({ success: true, interpretation_id, message: 'Regulator interpretation added.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default regulatoryOntologyRouter;
