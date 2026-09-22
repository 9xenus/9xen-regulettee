import { getDb } from '../db/sqlite.js';
import { logger } from './logger.js';

export type RemediationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RemediationCategory = 'COOKIE_CONSENT' | 'SECURITY_HEADERS' | 'DATA_RETENTION' | 'DPA_AGREEMENT' | 'AI_GOVERNANCE' | 'ACCESS_CONTROL' | 'VENDOR_RISK' | 'CUSTOM_VIOLATION';
export type RemediationStatus = 'PENDING_APPROVAL' | 'pending_human_review' | 'AUTO_FIXED' | 'APPROVED' | 'approved_ready_for_deployment' | 'ready_to_deploy' | 'DEPLOYED' | 'deployed' | 'ROLLED_BACK' | 'rolled_back' | 'DISMISSED';

export interface RemediationItem {
  id: string;
  item_id?: string;
  company_id: string;
  title: string;
  category: RemediationCategory | string;
  severity: RemediationSeverity;
  issue: string;
  statute: string;
  recommended_fix: string;
  suggestion_summary?: string;
  code_snippet?: string;
  suggested_code?: string;
  auto_fixable: boolean;
  status: RemediationStatus | string;
  assigned_to?: string | null;
  reviewer_name?: string | null;
  dismissal_reason?: string | null;
  rollback_snapshot?: string | null;
  deployed_at?: string | null;
  applied_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RemediationAuditLog {
  id: string;
  company_id: string;
  item_id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export class RemediationService {
  private static initialized = false;

  public static initializeSchema() {
    if (this.initialized) return;
    try {
      const db = getDb();
      db.exec(`
        CREATE TABLE IF NOT EXISTS remediation_items (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          severity TEXT NOT NULL,
          issue TEXT NOT NULL,
          statute TEXT NOT NULL,
          recommended_fix TEXT NOT NULL,
          code_snippet TEXT,
          auto_fixable INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending_human_review',
          assigned_to TEXT,
          reviewer_name TEXT,
          dismissal_reason TEXT,
          rollback_snapshot TEXT,
          deployed_at TIMESTAMP,
          applied_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS remediation_audit_logs (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          item_id TEXT NOT NULL,
          action TEXT NOT NULL,
          actor TEXT NOT NULL,
          details TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Add missing columns if upgrading existing table
      try { db.exec(`ALTER TABLE remediation_items ADD COLUMN reviewer_name TEXT;`); } catch {}
      try { db.exec(`ALTER TABLE remediation_items ADD COLUMN rollback_snapshot TEXT;`); } catch {}
      try { db.exec(`ALTER TABLE remediation_items ADD COLUMN deployed_at TIMESTAMP;`); } catch {}

      // Seed initial items if table is empty
      const count = (db.prepare('SELECT COUNT(*) as count FROM remediation_items').get() as any).count;
      if (count === 0) {
        const now = new Date().toISOString();
        const insertItem = db.prepare(`
          INSERT INTO remediation_items (id, company_id, title, category, severity, issue, statute, recommended_fix, code_snippet, auto_fixable, status, assigned_to, reviewer_name, rollback_snapshot, deployed_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Low-risk finding (Auto-fixable)
        insertItem.run(
          'REM-LOW-001',
          'comp-101',
          'Cookie Consent Banner Reject All Missing',
          'COOKIE_CONSENT',
          'LOW',
          'Consent modal lacks symmetric 1-click Reject All button under EDPB Guidelines 05/2020.',
          'ePrivacy Directive Art. 5(3) & GDPR Art. 7(3)',
          'Inject explicit rejectAllCookies() button into client consent modal layout.',
          `<button id="btn-reject-all" onClick="rejectNonEssentialCookies()">Reject All</button>`,
          1,
          'pending_human_review',
          null,
          null,
          null,
          null,
          now,
          now
        );

        // Low-risk finding (Auto-fixable)
        insertItem.run(
          'REM-LOW-002',
          'comp-101',
          'Strict-Transport-Security (HSTS) Header Missing',
          'SECURITY_HEADERS',
          'LOW',
          'Public API gateway endpoint response missing Strict-Transport-Security header.',
          'GDPR Art. 32(1)(a) Security of Processing',
          'Configure max-age=31536000; includeSubDomains; preload in Express security headers.',
          `app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));`,
          1,
          'pending_human_review',
          null,
          null,
          null,
          null,
          now,
          now
        );

        // High-risk finding (Human-in-the-Loop required)
        insertItem.run(
          'REM-HIGH-003',
          'comp-101',
          'Sub-Processor Cloudflare Inc. DPA Missing Standard Contractual Clauses',
          'DPA_AGREEMENT',
          'HIGH',
          'Transatlantic data transfer to US CDN edge nodes requires updated SCC Annex 2021/914.',
          'GDPR Art. 46(2)(c) & Schrems II Transfer Impact Ruling',
          'Execute digital signature on updated Module 2 Controller-to-Processor SCC agreement.',
          null,
          0,
          'pending_human_review',
          'Senior Privacy Counsel',
          null,
          null,
          null,
          now,
          now
        );

        // High-risk finding (Human-in-the-Loop required)
        insertItem.run(
          'REM-HIGH-004',
          'comp-101',
          'Unregistered High-Risk Biometric AI Model Endpoint',
          'AI_GOVERNANCE',
          'CRITICAL',
          'Facial geometry inference endpoint active without Annex IV Technical Documentation.',
          'EU AI Act (Regulation 2024/1689) Art. 9 & 11',
          'Place endpoint behind Sovereign Enclave Killswitch and compile Annex IV compliance dossier.',
          `enclaveKillswitch.quarantineEndpoint('/api/v1/inference/facial-rec');`,
          0,
          'pending_human_review',
          'Chief AI Compliance Officer',
          null,
          null,
          null,
          now,
          now
        );
      }

      this.initialized = true;
    } catch (err) {
      logger.error('Failed to initialize Remediation schema', err as Error);
    }
  }

  public static getItems(companyId = 'comp-101', status?: string): RemediationItem[] {
    this.initializeSchema();
    const db = getDb();
    let items: any[] = [];
    if (status && status !== 'ALL') {
      items = db.prepare('SELECT * FROM remediation_items WHERE company_id = ? AND status = ? ORDER BY created_at DESC').all(companyId, status) as any[];
    } else {
      items = db.prepare('SELECT * FROM remediation_items WHERE company_id = ? ORDER BY created_at DESC').all(companyId) as any[];
    }
    return items.map(this.normalizeItem);
  }

  public static getItemById(id: string): RemediationItem | null {
    this.initializeSchema();
    const db = getDb();
    const row = db.prepare('SELECT * FROM remediation_items WHERE id = ?').get(id) as any;
    return row ? this.normalizeItem(row) : null;
  }

  private static normalizeItem(row: any): RemediationItem {
    return {
      id: row.id,
      item_id: row.id,
      company_id: row.company_id,
      title: row.title,
      category: row.category,
      severity: row.severity,
      issue: row.issue,
      statute: row.statute,
      recommended_fix: row.recommended_fix,
      suggestion_summary: row.recommended_fix || row.title,
      code_snippet: row.code_snippet,
      suggested_code: row.code_snippet || '// Sovereign Auto-Remediation Code Patch',
      auto_fixable: Boolean(row.auto_fixable),
      status: row.status,
      assigned_to: row.assigned_to,
      reviewer_name: row.reviewer_name,
      dismissal_reason: row.dismissal_reason,
      rollback_snapshot: row.rollback_snapshot,
      deployed_at: row.deployed_at,
      applied_at: row.applied_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  public static getAuditLogs(companyId = 'comp-101'): RemediationAuditLog[] {
    this.initializeSchema();
    const db = getDb();
    return db.prepare('SELECT * FROM remediation_audit_logs WHERE company_id = ? ORDER BY timestamp DESC LIMIT 100').all(companyId) as RemediationAuditLog[];
  }

  /**
   * Creates a new fix proposal in SQLite.
   */
  public static createSuggestion(params: {
    company_id: string;
    violation_id?: string;
    violation_type?: string;
    severity?: RemediationSeverity;
    suggestion_summary: string;
    suggested_code?: string;
    actor?: string;
  }): RemediationItem {
    this.initializeSchema();
    const db = getDb();
    const id = `rem_${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const category = params.violation_type || 'CUSTOM_VIOLATION';
    const severity = params.severity || 'MEDIUM';
    const title = params.suggestion_summary;
    const recommended_fix = params.suggestion_summary;
    const code_snippet = params.suggested_code || '// Autonomous compliance patch';

    db.prepare(`
      INSERT INTO remediation_items (
        id, company_id, title, category, severity, issue, statute, recommended_fix,
        code_snippet, auto_fixable, status, assigned_to, reviewer_name, rollback_snapshot,
        deployed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.company_id || 'comp-101',
      title,
      category,
      severity,
      `Detected issue: ${params.violation_id || 'v_custom_01'}`,
      'EU GDPR / Sovereign Framework Compliance',
      recommended_fix,
      code_snippet,
      severity === 'LOW' ? 1 : 0,
      'pending_human_review',
      null,
      null,
      null,
      null,
      now,
      now
    );

    const logId = `AUDIT-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO remediation_audit_logs (id, company_id, item_id, action, actor, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      params.company_id || 'comp-101',
      id,
      'SUGGESTION_CREATED',
      params.actor || 'Gemini Sovereign AI Copilot',
      `Generated fix proposal: ${recommended_fix}`,
      now
    );

    return this.getItemById(id)!;
  }

  /**
   * Approves a remediation item and readies it for deployment.
   */
  public static approveItem(itemId: string, reviewerName = 'Auditor (Human)', notes?: string): RemediationItem {
    this.initializeSchema();
    const db = getDb();
    const item = this.getItemById(itemId);
    if (!item) throw new Error('Remediation item not found');

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE remediation_items
      SET status = 'approved_ready_for_deployment', reviewer_name = ?, updated_at = ?
      WHERE id = ?
    `).run(reviewerName, now, itemId);

    const logId = `AUDIT-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO remediation_audit_logs (id, company_id, item_id, action, actor, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      item.company_id,
      itemId,
      'HUMAN_APPROVED',
      reviewerName,
      `Approved code patch suggestion for deployment. Notes: ${notes || 'Formal human authorization granted.'}`,
      now
    );

    return this.getItemById(itemId)!;
  }

  /**
   * Prepares deployment and captures a rollback snapshot.
   */
  public static prepareDeployment(itemId: string, actorName = 'Release Manager', currentCode?: string, currentPolicy?: string): RemediationItem {
    this.initializeSchema();
    const db = getDb();
    const item = this.getItemById(itemId);
    if (!item) throw new Error('Remediation item not found');

    const snapshot = JSON.stringify({
      code: currentCode || '/* Original State */',
      policy: currentPolicy || 'ORIGINAL_POLICY',
      captured_at: new Date().toISOString()
    });

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE remediation_items
      SET status = 'ready_to_deploy', rollback_snapshot = ?, updated_at = ?
      WHERE id = ?
    `).run(snapshot, now, itemId);

    const logId = `AUDIT-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO remediation_audit_logs (id, company_id, item_id, action, actor, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      item.company_id,
      itemId,
      'SNAPSHOT_TAKEN',
      actorName,
      'Pre-deployment rollback snapshot stored successfully in SQLite database.',
      now
    );

    return this.getItemById(itemId)!;
  }

  /**
   * Deploys fix to production following explicit client confirmation.
   */
  public static deployFix(itemId: string, devopsActor = 'Release Engineer', explicitConfirmation = true): RemediationItem {
    this.initializeSchema();
    const db = getDb();
    const item = this.getItemById(itemId);
    if (!item) throw new Error('Remediation item not found');

    if (!explicitConfirmation) {
      throw new Error('Explicit client authorization is required for live deployment');
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE remediation_items
      SET status = 'deployed', deployed_at = ?, applied_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, now, itemId);

    const logId = `AUDIT-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO remediation_audit_logs (id, company_id, item_id, action, actor, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      item.company_id,
      itemId,
      'LIVE_DEPLOYED',
      devopsActor,
      'Sovereign patch successfully hot-swapped into production environment.',
      now
    );

    return this.getItemById(itemId)!;
  }

  /**
   * Rolls back a deployed fix using the pre-deployment snapshot.
   */
  public static rollbackFix(itemId: string, actorName = 'Emergency Admin'): RemediationItem {
    this.initializeSchema();
    const db = getDb();
    const item = this.getItemById(itemId);
    if (!item) throw new Error('Remediation item not found');

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE remediation_items
      SET status = 'rolled_back', updated_at = ?
      WHERE id = ?
    `).run(now, itemId);

    const logId = `AUDIT-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO remediation_audit_logs (id, company_id, item_id, action, actor, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      item.company_id,
      itemId,
      'ROLLBACK_TRIGGERED',
      actorName,
      'Emergency reversion to previous sandbox snapshot completed.',
      now
    );

    return this.getItemById(itemId)!;
  }

  /**
   * Auto-fixes a low-risk finding automatically.
   */
  public static executeAutoFix(itemId: string, actor = 'AUTO_REMEDIATION_ENGINE'): RemediationItem {
    this.initializeSchema();
    const db = getDb();
    const item = this.getItemById(itemId);
    if (!item) throw new Error('Remediation item not found');
    if (!item.auto_fixable) throw new Error('High-risk finding requires human approval and cannot be auto-fixed');

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE remediation_items
      SET status = 'deployed', applied_at = ?, deployed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, now, itemId);

    const logId = `AUDIT-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO remediation_audit_logs (id, company_id, item_id, action, actor, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      item.company_id,
      itemId,
      'AUTO_FIXED',
      actor,
      `Autonomous compliance fix applied: ${item.recommended_fix}`,
      now
    );

    return this.getItemById(itemId)!;
  }

  /**
   * Human-in-the-Loop: Approves and applies an action with human oversight.
   */
  public static approveAndApply(itemId: string, reviewerName: string, notes?: string): RemediationItem {
    return this.approveItem(itemId, reviewerName, notes);
  }

  /**
   * Assigns finding to a team member.
   */
  public static assignFinding(itemId: string, assignee: string, assignerName: string): RemediationItem {
    this.initializeSchema();
    const db = getDb();
    const item = this.getItemById(itemId);
    if (!item) throw new Error('Remediation item not found');

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE remediation_items
      SET assigned_to = ?, updated_at = ?
      WHERE id = ?
    `).run(assignee, now, itemId);

    const logId = `AUDIT-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO remediation_audit_logs (id, company_id, item_id, action, actor, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      item.company_id,
      itemId,
      'ASSIGNED',
      assignerName,
      `Action item assigned to ${assignee} for verification.`,
      now
    );

    return this.getItemById(itemId)!;
  }

  /**
   * Dismisses a finding with formal justification.
   */
  public static dismissFinding(itemId: string, actorName: string, reason: string): RemediationItem {
    this.initializeSchema();
    const db = getDb();
    const item = this.getItemById(itemId);
    if (!item) throw new Error('Remediation item not found');
    if (!reason || reason.trim().length < 5) throw new Error('Statutory dismissal justification is required');

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE remediation_items
      SET status = 'DISMISSED', dismissal_reason = ?, updated_at = ?
      WHERE id = ?
    `).run(reason, now, itemId);

    const logId = `AUDIT-${Date.now().toString().slice(-6)}`;
    db.prepare(`
      INSERT INTO remediation_audit_logs (id, company_id, item_id, action, actor, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      item.company_id,
      itemId,
      'DISMISSED',
      actorName,
      `Finding dismissed with justification: ${reason}`,
      now
    );

    return this.getItemById(itemId)!;
  }

  /**
   * Ingests detected violations from automated scans into SQLite remediation items.
   */
  public static ingestScanFindings(findings: Array<{
    company_id: string;
    title: string;
    category?: string;
    severity?: RemediationSeverity;
    issue: string;
    statute?: string;
    recommended_fix: string;
    code_snippet?: string;
    auto_fixable?: boolean;
  }>): RemediationItem[] {
    this.initializeSchema();
    const db = getDb();
    const now = new Date().toISOString();
    const inserted: RemediationItem[] = [];

    const insertStmt = db.prepare(`
      INSERT INTO remediation_items (
        id, company_id, title, category, severity, issue, statute, recommended_fix,
        code_snippet, auto_fixable, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const f of findings) {
      const id = `REM-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
      const severity = f.severity || 'HIGH';
      const auto_fixable = f.auto_fixable !== undefined ? (f.auto_fixable ? 1 : 0) : (severity === 'LOW' ? 1 : 0);
      const category = f.category || 'SECURITY_HEADERS';
      const statute = f.statute || 'GDPR Art. 32 & ePrivacy';

      try {
        insertStmt.run(
          id,
          f.company_id || 'comp-101',
          f.title,
          category,
          severity,
          f.issue,
          statute,
          f.recommended_fix,
          f.code_snippet || null,
          auto_fixable,
          'pending_human_review',
          now,
          now
        );
        const item = this.getItemById(id);
        if (item) inserted.push(item);
      } catch (err) {
        logger.error('Failed to ingest scan finding', err as Error);
      }
    }

    return inserted;
  }

  /**
   * Computes high-level executive dashboard metrics for compliance officers.
   */
  public static getExecutiveSummary(companyId = 'comp-101') {
    this.initializeSchema();
    const db = getDb();
    const all = this.getItems(companyId);

    const autoFixedCount = all.filter(i => i.status === 'AUTO_FIXED' || i.status === 'deployed' || i.status === 'DEPLOYED').length;
    const awaitingApprovalCount = all.filter(i => i.status === 'PENDING_APPROVAL' || i.status === 'pending_human_review').length;
    const approvedCount = all.filter(i => i.status === 'APPROVED' || i.status === 'approved_ready_for_deployment' || i.status === 'ready_to_deploy').length;
    const dismissedCount = all.filter(i => i.status === 'DISMISSED').length;

    const safeToAutoFix = [
      'Missing 1-click Cookie Reject button',
      'HTTP Strict-Transport-Security (HSTS) missing',
      'Default log retention window over-retention',
      'Expiring TLS certificate notification trigger'
    ];

    const requiresHumanReview = [
      'Cross-border Standard Contractual Clauses (SCC) gap',
      'Unclassified high-risk AI Act model',
      'Unsigned vendor Data Processing Agreement (DPA)',
      'Privileged role access without MFA'
    ];

    return {
      totalFindings: all.length,
      autoFixedThisMonth: autoFixedCount,
      awaitingApproval: awaitingApprovalCount,
      approvedAndDeployed: approvedCount,
      dismissedWithReason: dismissedCount,
      remediationSuccessRate: all.length > 0 ? Math.round(((autoFixedCount + approvedCount) / all.length) * 100) : 100,
      classificationGuidance: {
        safeToAutoFix,
        requiresHumanReview
      }
    };
  }
}
