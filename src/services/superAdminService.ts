import crypto from 'crypto';
import { getDb } from '../db/sqlite';

export type AdminRole = 
  | 'super_admin' 
  | 'platform_ops' 
  | 'support_l1' 
  | 'support_l2' 
  | 'billing_admin' 
  | 'security_analyst' 
  | 'read_only';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  mfaEnabled: boolean;
  status: string;
}

export interface BreakGlassRequest {
  id: string;
  requesterId: string;
  approverId?: string;
  reason: string;
  targetScope: string;
  status: 'PENDING' | 'APPROVED' | 'EXPIRED' | 'REVOKED' | 'REJECTED';
  expiresAt?: string;
  createdAt: string;
}

export class SuperAdminService {
  /**
   * Initializes default role permissions in the DB.
   */
  public static initDefaultPermissions(): void {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return;

    try {
      const existing = db.prepare('SELECT count(*) as c FROM admin_permissions').get() as any;
      if (existing && existing.c > 0) return;

      const perms = [
        // super_admin has all
        { role: 'super_admin', res: '*', act: '*' },
        // platform_ops
        { role: 'platform_ops', res: 'tenants', act: 'read' },
        { role: 'platform_ops', res: 'tenants', act: 'suspend' },
        { role: 'platform_ops', res: 'queues', act: 'manage' },
        { role: 'platform_ops', res: 'health', act: 'read' },
        // support_l1
        { role: 'support_l1', res: 'tickets', act: 'manage' },
        { role: 'support_l1', res: 'tenants', act: 'read' },
        // billing_admin
        { role: 'billing_admin', res: 'invoices', act: 'manage' },
        { role: 'billing_admin', res: 'refunds', act: 'request' },
        { role: 'billing_admin', res: 'plans', act: 'update' },
        // security_analyst
        { role: 'security_analyst', res: 'audit', act: 'read' },
        { role: 'security_analyst', res: 'security_events', act: 'manage' },
        { role: 'security_analyst', res: 'break_glass', act: 'approve' }
      ];

      const stmt = db.prepare(`
        INSERT INTO admin_permissions (id, role, resource, action, is_allowed)
        VALUES (?, ?, ?, ?, 1)
      `);
      for (const p of perms) {
        stmt.run(`perm_${p.role}_${p.res}_${p.act}`, p.role, p.res, p.act);
      }
    } catch (err) {
      console.warn('[SUPER_ADMIN] Permission init notice:', err);
    }
  }

  /**
   * Evaluates fine-grained permission check for an admin.
   */
  public static checkPermission(role: AdminRole, resource: string, action: string): boolean {
    if (role === 'super_admin') return true;
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return false;

    try {
      const match = db.prepare(`
        SELECT count(*) as c FROM admin_permissions 
        WHERE role = ? AND (resource = ? OR resource = '*') AND (action = ? OR action = '*') AND is_allowed = 1
      `).get(role, resource, action) as any;
      return (match?.c || 0) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Appends an immutable, hash-chained record to the admin audit trail.
   */
  public static logAdminAction(
    adminId: string,
    action: string,
    resource: string,
    targetId?: string,
    payloadDiff?: any,
    ipAddress?: string,
    impersonatorId?: string
  ): string {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') return '';

    try {
      const last = db.prepare('SELECT current_hash FROM admin_audit_trail ORDER BY timestamp DESC LIMIT 1').get() as any;
      const prevHash = last?.current_hash || 'GENESIS_HASH_ADMIN_TRAIL_0000000000000000';
      const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const timestamp = new Date().toISOString();
      const payloadStr = JSON.stringify(payloadDiff || {});

      const currentHash = crypto
        .createHash('sha256')
        .update(`${prevHash}:${adminId}:${action}:${resource}:${targetId || ''}:${payloadStr}:${timestamp}`)
        .digest('hex');

      db.prepare(`
        INSERT INTO admin_audit_trail (
          id, admin_id, impersonator_id, action, resource, target_id, payload_diff, ip_address, prev_hash, current_hash, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, adminId, impersonatorId || null, action, resource, targetId || null, payloadStr, ipAddress || '127.0.0.1', prevHash, currentHash, timestamp);

      return id;
    } catch (err) {
      console.warn('[SUPER_ADMIN] Audit log error:', err);
      return '';
    }
  }

  /**
   * Creates a break-glass elevated access request requiring distinct dual approval.
   */
  public static requestBreakGlass(requesterId: string, reason: string, targetScope: string): BreakGlassRequest {
    if (!reason || reason.trim().length < 30) {
      throw new Error('Break-glass access requires a detailed justification of at least 30 characters.');
    }

    const db = getDb();
    if (!db || typeof db.prepare !== 'function') throw new Error('Database unready');

    const id = `bg_${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_break_glass_requests (
        id, requester_id, reason, target_scope, status, security_alert_sent, created_at
      ) VALUES (?, ?, ?, ?, 'PENDING', 1, ?)
    `).run(id, requesterId, reason, targetScope, createdAt);

    this.logAdminAction(requesterId, 'BREAK_GLASS_REQUEST', 'system', id, { reason, targetScope });

    return {
      id,
      requesterId,
      reason,
      targetScope,
      status: 'PENDING',
      createdAt
    };
  }

  /**
   * Approves a break-glass request (Enforces requester !== approver).
   */
  public static approveBreakGlass(requestId: string, approverId: string): void {
    const db = getDb();
    if (!db || typeof db.prepare !== 'function') throw new Error('Database unready');

    const req = db.prepare('SELECT * FROM admin_break_glass_requests WHERE id = ?').get(requestId) as any;
    if (!req) throw new Error('Break-glass request not found');
    if (req.requester_id === approverId) {
      throw new Error('2-Person Rule Violation: Requester cannot approve their own break-glass request.');
    }

    // 2-hour hard expiry
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      UPDATE admin_break_glass_requests 
      SET status = 'APPROVED', approver_id = ?, expiresAt = ?
      WHERE id = ?
    `).run(approverId, expiresAt, requestId);

    this.logAdminAction(approverId, 'BREAK_GLASS_APPROVED', 'system', requestId, { requester: req.requester_id, expiresAt });
  }

  /**
   * Starts a strictly READ-ONLY tenant impersonation session.
   */
  public static startImpersonation(adminId: string, tenantId: string, reason: string, ticketId?: string): string {
    if (!reason || reason.trim().length < 20) {
      throw new Error('Tenant impersonation requires a documented reason of at least 20 characters.');
    }

    const db = getDb();
    if (!db || typeof db.prepare !== 'function') throw new Error('Database unready');

    const id = `imp_${Date.now()}`;
    db.prepare(`
      INSERT INTO admin_impersonations (
        id, admin_id, tenant_id, ticket_id, reason, started_at, actions_count
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)
    `).run(id, adminId, tenantId, ticketId || null, reason);

    this.logAdminAction(adminId, 'IMPERSONATION_START', 'tenant', tenantId, { reason, ticketId, mode: 'STRICT_READ_ONLY' });
    return id;
  }
}
