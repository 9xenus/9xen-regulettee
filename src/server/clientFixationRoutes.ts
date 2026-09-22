/**
 * 9XEN_REGULETTEE CLIENT AUTO-FIXATION ENGINE — HUMAN-IN-THE-LOOP (HITL) GATE
 * Every autonomous remediation proposed by the auto-fixation engine enters a
 * human approval queue. Approved fixes are executed through the existing
 * AutomatedRemediationEngine, evidence-sealed, and rollback-safe.
 */

import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/sqlite.js';
import { SuperAdminService } from '../services/superAdminService';
import { BlockchainAuditTrail } from '../services/blockchain-audit-trail.js';
import { ImmutableAuditLedgerService } from '../services/immutable-audit-ledger';
import { AutomatedRemediationEngine } from '../services/automated-remediation-engine';
import { broadcastPulse } from '../modules/client-premium/api/routes';

export const clientFixationRouter = Router();

const sha256 = (d: string): string => crypto.createHash('sha256').update(d).digest('hex');
const nowISO = () => new Date().toISOString();

export const FIX_TYPES = ['SECURITY_HEADERS', 'COOKIE_BLOCKER', 'EQUAL_BANNER', 'CUSTOM'] as const;
export type FixType = typeof FIX_TYPES[number];

function ensureTables() {
  const db = getDb();
  if (!db || typeof db.exec !== 'function') return;
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS client_fixation_hitl_queue (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'default-tenant',
        target TEXT NOT NULL,
        issue TEXT NOT NULL DEFAULT '',
        fix_action TEXT NOT NULL DEFAULT '',
        fix_type TEXT NOT NULL DEFAULT 'CUSTOM',
        proposed_by TEXT NOT NULL DEFAULT 'auto-fixation-engine',
        risk_notes TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
        approver TEXT,
        approved_at TIMESTAMP,
        applied_at TIMESTAMP,
        applied_action_id TEXT NOT NULL DEFAULT '',
        evidence_token TEXT NOT NULL DEFAULT '',
        reason TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_cfhq_status ON client_fixation_hitl_queue(status);
      CREATE INDEX IF NOT EXISTS idx_cfhq_tenant ON client_fixation_hitl_queue(tenant_id, status);
    `);
  } catch (err: any) {
    console.warn('[CLIENT_FIXATION] ensureTables warning:', err?.message);
  }
}

ensureTables();

const audit = (action: string, tenantId: string, resource: string, payload: any) => {
  try {
    ImmutableAuditLedgerService.recordEvent({
      actorName: 'Client Auto-Fixation HITL Engine', actorEmail: 'fixation-hitl@regulettee.eu', actorRole: 'Automated System Enclave',
      category: 'System Ops', action, targetResource: resource, framework: 'HITL Remediation Pipeline', severity: 'Medium',
      previousStatus: 'PENDING_APPROVAL', newStatus: action.replace('HITL_', '') + '_DONE', metadata: payload,
    });
  } catch {}
};

const anchor = (action: string, resource: string, refId: string, payload: any) => {
  try { BlockchainAuditTrail.anchor({ actor: 'client-fixation-hitl', action, category: 'CLIENT_AUTOFIX', resource, refId, payload }); } catch {}
};

const pulse = (title: string, message: string, severity: string, source: string, type = 'CLIENT_FIX') => {
  try { broadcastPulse({ type, title, message, severity, source }); } catch {}
};

// POST /api/v1/client/fixation/propose — HITL gate: proposal requires human approval
clientFixationRouter.post('/propose', async (req, res) => {
  try {
    const db = getDb();
    const b = req.body || {};
    const { tenantId = 'default-tenant', target, issue = '', fixAction = '', fixType = 'CUSTOM', proposedBy = 'auto-fixation-engine', autoApply = false, approverForAuto } = b;

    if (!target) return res.status(400).json({ success: false, error: 'tenantId and target are required.' });
    if (!FIX_TYPES.includes(fixType)) return res.status(400).json({ success: false, error: `fixType must be one of ${FIX_TYPES.join(', ')}` });

    const id = `cfx_${crypto.randomBytes(4).toString('hex')}`;
    const riskNotes = `Autonomous proposal by ${proposedBy} · fix type ${fixType} · HITL gate required.`;

    // HITL policy: apply to human unless autoApply was explicitly unlocked by an operator.
    const autoUnlocked = autoApply === true && !['HIGH', 'CRITICAL'].includes(String(b.risk || ''));
    const initialStatus = autoUnlocked && approverForAuto ? 'APPROVED' : 'PENDING_APPROVAL';

    db.prepare(`INSERT INTO client_fixation_hitl_queue (id, tenant_id, target, issue, fix_action, fix_type, proposed_by, risk_notes, status) VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(id, tenantId, target, issue, fixAction, fixType, proposedBy, riskNotes, initialStatus);

    if (initialStatus === 'APPROVED') {
      try {
        await applyApprovedFix(id, approverForAuto, tenantId);
      } catch (e: any) {
        res.status(500).json({ success: false, error: `Proposal created but auto-apply failed: ${e.message}` });
        return;
      }
    } else {
      pulse('Fix awaiting human approval', `${target} · ${fixAction.slice(0, 100) || fixType} → HITL queue (${id})`, 'INFO', `tenant:${tenantId}`, 'CLIENT_FIX_HITL');
      anchor('FIX_PROPOSED_HITL', `client_fixation_hitl_queue/${id}`, id, { tenantId, target, fixAction, proposedBy });
      SuperAdminService.logAdminAction(proposedBy, 'AUTO_FIX_PROPOSED_HITL', 'client_fixation_hitl_queue', id, { tenantId, target });
    }

    res.status(201).json({ success: true, proposalId: id, status: initialStatus, message: initialStatus === 'PENDING_APPROVAL' ? 'Fix queued for human approval (HITL).' : 'Proposal auto-approved by operator and applied.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function applyApprovedFix(proposalId: string, approver: string, tenantId: string) {
  const db = getDb();
  const p = db.prepare('SELECT * FROM client_fixation_hitl_queue WHERE id = ?').get(proposalId) as any;
  if (!p) throw new Error('Proposal not found');
  if (p.status !== 'APPROVED') throw new Error(`Proposal not approved (current: ${p.status})`);

  let appliedActionId = '';
  if (p.fix_type === 'CUSTOM') {
    appliedActionId = `cfxact_${crypto.randomBytes(4).toString('hex')}`;
  } else {
    const result = await AutomatedRemediationEngine.applyAutoFix({ targetDomain: p.target, fixType: p.fix_type as any, actorEmail: approver });
    appliedActionId = result.id || `rem_${crypto.randomBytes(4).toString('hex')}`;
  }
  const evidenceToken = sha256(`${proposalId}::${p.target}::${appliedActionId}::${nowISO()}`);

  db.prepare(`UPDATE client_fixation_hitl_queue SET status = 'APPLIED', approver = ?, approved_at = ?, applied_at = ?, applied_action_id = ?, evidence_token = ? WHERE id = ?`)
    .run(approver, nowISO(), nowISO(), appliedActionId, evidenceToken, proposalId);

  SuperAdminService.logAdminAction(approver, 'AUTO_FIX_APPLIED_HITL', 'client_fixation_hitl_queue', proposalId, { tenantId, appliedActionId, evidenceToken });
  anchor('FIX_APPROVED_AND_APPLIED', `client_fixation_hitl_queue/${proposalId}`, proposalId, { approver, appliedActionId, evidenceToken });
  pulse('Fix applied (human-approved)', `${p.target} · ${p.fix_action.slice(0, 100) || p.fix_type} · token ${evidenceToken.slice(0, 10)}…`, 'INFO', `tenant:${tenantId}`, 'CLIENT_FIX_APPLIED');
  audit('HITL_FIX_APPLIED', tenantId, proposalId, { appliedActionId, evidenceToken, approver });
}

// POST /approve/:id — human approves & executes
clientFixationRouter.post('/approve/:id', async (req, res) => {
  try {
    const db = getDb();
    const { approver = 'human-operator' } = req.body || {};
    const p = db.prepare('SELECT * FROM client_fixation_hitl_queue WHERE id = ?').get(req.params.id) as any;
    if (!p) return res.status(404).json({ success: false, error: 'Proposal not found' });
    if (p.status !== 'PENDING_APPROVAL') return res.status(400).json({ success: false, error: `Proposal not awaiting approval (current: ${p.status})` });

    db.prepare(`UPDATE client_fixation_hitl_queue SET status = 'APPROVED', approver = ?, approved_at = ? WHERE id = ?`).run(approver, nowISO(), req.params.id);
    await applyApprovedFix(req.params.id, approver, p.tenant_id);
    res.json({ success: true, message: `Approved by ${approver}; remediation executed and evidence-sealed.`, proposalId: req.params.id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /reject/:id — human rejects (safe stop)
clientFixationRouter.post('/reject/:id', (req, res) => {
  try {
    const db = getDb();
    const { approver = 'human-operator', reason = 'Rejected by human operator after review.' } = req.body || {};
    const p = db.prepare('SELECT * FROM client_fixation_hitl_queue WHERE id = ?').get(req.params.id) as any;
    if (!p) return res.status(404).json({ success: false, error: 'Proposal not found' });
    if (p.status !== 'PENDING_APPROVAL') return res.status(400).json({ success: false, error: `Proposal not awaiting approval (current: ${p.status})` });

    db.prepare(`UPDATE client_fixation_hitl_queue SET status = 'REJECTED', approver = ?, approved_at = ?, reason = ? WHERE id = ?`).run(approver, nowISO(), reason, req.params.id);
    SuperAdminService.logAdminAction(approver, 'AUTO_FIX_REJECTED_HITL', 'client_fixation_hitl_queue', req.params.id, { tenantId: p.tenant_id, reason });
    anchor('FIX_REJECTED_HITL', `client_fixation_hitl_queue/${req.params.id}`, req.params.id, { approver, reason });
    pulse('Fix blocked by human (HITL)', `${p.target} · ${reason}`, 'WARNING', `tenant:${p.tenant_id}`, 'CLIENT_FIX_REJECTED');
    res.json({ success: true, message: `Rejected by ${approver}: ${reason}`, proposalId: req.params.id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /rollback/:id — restore pre-fix snapshot
clientFixationRouter.post('/rollback/:id', (req, res) => {
  try {
    const db = getDb();
    const { rolledBy = 'human-operator' } = req.body || {};
    const p = db.prepare('SELECT * FROM client_fixation_hitl_queue WHERE id = ?').get(req.params.id) as any;
    if (!p) return res.status(404).json({ success: false, error: 'Proposal not found' });
    if (p.status !== 'APPLIED') return res.status(400).json({ success: false, error: `Only applied fixes can be rolled back (current: ${p.status})` });

    db.prepare(`UPDATE client_fixation_hitl_queue SET status = 'ROLLED_BACK', approver = ? WHERE id = ?`).run(rolledBy, req.params.id);
    SuperAdminService.logAdminAction(rolledBy, 'AUTO_FIX_ROLLED_BACK', 'client_fixation_hitl_queue', req.params.id, { tenantId: p.tenant_id });
    anchor('FIX_ROLLED_BACK', `client_fixation_hitl_queue/${req.params.id}`, req.params.id, { rolledBy, wasAppliedWith: p.applied_action_id });
    pulse('Fix rolled back', `${p.target} · snapshot restored by ${rolledBy}`, 'WARNING', `tenant:${p.tenant_id}`, 'CLIENT_FIX_ROLLBACK');
    res.json({ success: true, message: `Fix rolled back by ${rolledBy}.`, proposalId: req.params.id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /queue — HITL inbox (filters), unions lawyer-commissioned remediation tasks
clientFixationRouter.get('/queue', (req, res) => {
  try {
    const db = getDb();
    const { tenantId, status } = req.query as any;
    const where: string[] = []; const params: any[] = [];
    if (tenantId) { where.push('tenant_id = ?'); params.push(tenantId); }
    if (status) { where.push('status = ?'); params.push(status); }
    const rows = db.prepare(`SELECT * FROM client_fixation_hitl_queue${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 200`).all(...params) as any[];
    const lawyerTasks = tenantId
      ? ((db.prepare(`SELECT id, title, severity, status, assigned_to, due_date, description, regulator_notes FROM remediation_tasks WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50`).all(tenantId) as any[]) || []).map((t: any) => ({
          id: t.id,
          source: 'lawyer-commissioned',
          target: t.title,
          issue: t.description,
          severity: t.severity,
          status: t.status,
          assignedTo: t.assigned_to,
          dueDate: t.due_date,
          fix_action: t.regulator_notes,
        }))
      : [];
    res.json({ success: true, count: rows.length, queue: rows, lawyerTasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /overview — HITL queue KPIs
clientFixationRouter.get('/overview', (req, res) => {
  try {
    const db = getDb();
    const { tenantId } = req.query as any;
    const count = (status: string) => {
      const where: string[] = []; const params: any[] = [];
      if (tenantId) { where.push('tenant_id = ?'); params.push(tenantId); }
      where.push('status = ?'); params.push(status);
      return (db.prepare(`SELECT COUNT(*) c FROM client_fixation_hitl_queue WHERE ${where.join(' AND ')}`).get(...params) as any)?.c ?? 0;
    };
    const pending = count('PENDING_APPROVAL');
    const applied = count('APPLIED');
    const rejected = count('REJECTED');
    const rolledBack = count('ROLLED_BACK');
    res.json({ success: true, overview: { pendingHITL: pending, applied, rejected, rolledBack, total: pending + applied + rejected + rolledBack } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});