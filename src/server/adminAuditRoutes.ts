import { Router } from 'express';
import { getDb } from '../db/sqlite.js';
import { requireAuthRoles } from '../middleware/auth.js';

export const adminAuditRouter = Router();

// Scope the guard to this router's own admin paths. This router is mounted at the
// express root ("/"), so an unscoped `.use(requireAuthRoles(...))` here walled off
// the ENTIRE remaining express surface (SSO handshake, /api/auth/verify, enterprise
// routes…) behind admin auth, returning 401 "Valid authentication token required."
// for every anonymous request.
adminAuditRouter.use('/api/v1/admin', requireAuthRoles(['ADMIN', 'SUPER_ADMIN']));

adminAuditRouter.get('/api/v1/admin/system-audit-logs', (req, res) => {
  const db = getDb();
  try {
    const { action, search, limit = '200' } = req.query;
    let query = 'SELECT id, admin_id as actor, action, resource as target, payload_diff as details, timestamp as time FROM admin_audit_trail';
    const params: any[] = [];
    const conditions: string[] = [];

    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }
    
    if (search) {
      conditions.push('(action LIKE ? OR admin_id LIKE ? OR resource LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit as string, 10));

    const logs = db.prepare(query).all(...params) as any[];

    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});