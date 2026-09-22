import { Router, Request, Response } from 'express';
import nodeCrypto from 'node:crypto';
import { getDb } from '../db/sqlite.js';
import { requireAuth } from '../middleware/auth.js';

export const entityRegistrationRouter = Router();

// Run DB setup for entities table on module load
try {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS public_entities (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      registration_doc_url TEXT,
      tax_id TEXT,
      bar_number TEXT,
      industries TEXT,
      regions TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (err) {
  console.warn('Could not initialize public_entities table:', err);
}

entityRegistrationRouter.post('/register-entity', async (req: Request, res: Response) => {
  try {
    const {
      entityType,
      name,
      email,
      password,
      registrationDoc,
      taxId,
      barNumber,
      industries,
      regions
    } = req.body;

    if (!email || !password || !name || !entityType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = 'ent_' + nodeCrypto.randomBytes(8).toString('hex');
    const salt = nodeCrypto.randomBytes(16).toString('hex');
    const passwordHash = nodeCrypto.scryptSync(password, salt, 64).toString('hex') + ':' + salt;

    const db = getDb();
    
    // Check if email exists
    const existing = db.prepare('SELECT id FROM public_entities WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const stmt = db.prepare(`
      INSERT INTO public_entities (
        id, entity_type, name, email, password_hash, 
        registration_doc_url, tax_id, bar_number, industries, regions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      entityType,
      name,
      email,
      passwordHash,
      registrationDoc || null,
      taxId || null,
      barNumber || null,
      JSON.stringify(industries || []),
      JSON.stringify(regions || [])
    );

    res.status(201).json({
      success: true,
      data: {
        id,
        entityType,
        name,
        email,
        status: 'PENDING'
      }
    });
  } catch (err: any) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

entityRegistrationRouter.get('/entities', requireAuth, async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    const db = getDb();
    // Redact sensitive fields for non-admin callers
    const isAdmin = (req as any).user?.role === 'ADMIN' || (req as any).user?.role === 'SUPER_ADMIN';
    const baseCols = isAdmin
      ? 'id, entity_type, name, email, tax_id, bar_number, industries, regions, status, created_at'
      : 'id, entity_type, name, industries, regions, status, created_at';
    let sql = `SELECT ${baseCols} FROM public_entities WHERE 1=1`;
    const params: any[] = [];

    if (type) {
      sql += ` AND entity_type = ?`;
      params.push(type);
    }
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC`;
    const rows = db.prepare(sql).all(...params) as any[];

    const formatted = rows.map(r => ({
      ...r,
      industries: typeof r.industries === 'string' ? JSON.parse(r.industries || '[]') : r.industries,
      regions: typeof r.regions === 'string' ? JSON.parse(r.regions || '[]') : r.regions,
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err: any) {
    console.error('Failed to list entities:', err);
    res.status(500).json({ error: 'Failed to retrieve entities' });
  }
});

entityRegistrationRouter.get('/entities/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const isAdmin = (req as any).user?.role === 'ADMIN' || (req as any).user?.role === 'SUPER_ADMIN';
    const baseCols = isAdmin
      ? 'id, entity_type, name, email, tax_id, bar_number, industries, regions, status, created_at'
      : 'id, entity_type, name, industries, regions, status, created_at';
    const row = db.prepare(
      `SELECT ${baseCols} FROM public_entities WHERE id = ?`
    ).get(id) as any;

    if (!row) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    res.json({
      success: true,
      data: {
        ...row,
        industries: typeof row.industries === 'string' ? JSON.parse(row.industries || '[]') : row.industries,
        regions: typeof row.regions === 'string' ? JSON.parse(row.regions || '[]') : row.regions,
      }
    });
  } catch (err: any) {
    console.error('Failed to get entity:', err);
    res.status(500).json({ error: 'Failed to retrieve entity' });
  }
});

