import { getDb } from '../db/sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
  EnforcementCase,
  EnforcementAction,
  EnforcementStage,
  EnforcementSeverity,
  ActionType,
  ActionStatus,
  DeadlineType
} from '../types/enforcement';

export interface StageTransitionResult {
  success: boolean;
  previousStage: EnforcementStage;
  newStage: EnforcementStage;
  caseId: string;
  message?: string;
  error?: string;
}

export interface ActionApprovalResult {
  success: boolean;
  actionId: string;
  status: ActionStatus;
  approvalsCount: number;
  requiredApprovals: number;
  approvedBy1?: string | null;
  approvedBy2?: string | null;
  message: string;
}

const HIGH_IMPACT_ACTIONS: ActionType[] = [
  'fine',
  'license_suspension',
  'site_takedown',
  'court_referral',
];

const STAGE_ORDER: Record<EnforcementStage, number> = {
  intake: 0,
  evidence_review: 1,
  hearing: 2,
  order_issued: 3,
  appeal: 4,
  enforcement: 5,
  closed: 6,
};

export class CaseStateMachineService {
  private static instance: CaseStateMachineService;

  private constructor() {}

  public static getInstance(): CaseStateMachineService {
    if (!CaseStateMachineService.instance) {
      CaseStateMachineService.instance = new CaseStateMachineService();
    }
    return CaseStateMachineService.instance;
  }

  /**
   * Create a new regulatory enforcement case in 'intake' stage
   */
  public async createCase(params: {
    entityId: string;
    lawId: string;
    countryId?: string;
    severity?: EnforcementSeverity;
    title?: string;
    summary?: string;
    assignedOfficerId?: string;
  }): Promise<EnforcementCase> {
    const db = getDb();
    const caseId = `case_${uuidv4().substring(0, 8)}`;
    const country = params.countryId || 'BD';
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `ENF-${country.toUpperCase()}-${year}-${randomSuffix}`;
    const severity = params.severity || 'MEDIUM';

    db.prepare(`
      INSERT INTO enf_cases (
        id, case_number, entity_id, law_id, country_id, stage, severity,
        assigned_officer_id, title, summary, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'intake', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      caseId,
      caseNumber,
      params.entityId,
      params.lawId,
      country,
      severity,
      params.assignedOfficerId || null,
      params.title || `Regulatory Inquiry - ${params.entityId}`,
      params.summary || 'Automated case intake.'
    );

    // Create default intake SLA deadline (e.g., 3 days to review evidence)
    this.createSlaDeadline(caseId, 'show_cause_response', 3);

    return this.getCaseById(caseId)!;
  }

  /**
   * Get case by ID
   */
  public getCaseById(caseId: string): EnforcementCase | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM enf_cases WHERE id = ?').get(caseId);
    return (row as EnforcementCase) || null;
  }

  /**
   * Transition case to a target stage with guard validation
   */
  public async transitionStage(
    caseId: string,
    targetStage: EnforcementStage,
    officerId: string,
    reason?: string
  ): Promise<StageTransitionResult> {
    const db = getDb();
    const currentCase = this.getCaseById(caseId);

    if (!currentCase) {
      return {
        success: false,
        previousStage: 'intake',
        newStage: targetStage,
        caseId,
        error: `Case not found: ${caseId}`,
      };
    }

    const previousStage = currentCase.stage;

    // Check if same stage
    if (previousStage === targetStage) {
      return {
        success: true,
        previousStage,
        newStage: targetStage,
        caseId,
        message: 'Case is already in the target stage.',
      };
    }

    // Allow closing a case from any stage
    if (targetStage === 'closed') {
      db.prepare(`
        UPDATE enf_cases SET stage = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(caseId);

      return {
        success: true,
        previousStage,
        newStage: 'closed',
        caseId,
        message: `Case closed by ${officerId}. Reason: ${reason || 'Resolution reached'}`,
      };
    }

    // Guard 1: intake -> evidence_review
    if (targetStage === 'evidence_review') {
      if (previousStage !== 'intake') {
        return {
          success: false,
          previousStage,
          newStage: targetStage,
          caseId,
          error: `Invalid transition from ${previousStage} to evidence_review.`,
        };
      }
    }

    // Guard 2: evidence_review -> hearing (Requires at least 1 item in evidence vault)
    if (targetStage === 'hearing') {
      if (previousStage !== 'evidence_review' && previousStage !== 'appeal') {
        return {
          success: false,
          previousStage,
          newStage: targetStage,
          caseId,
          error: `Invalid transition: cannot move to hearing directly from ${previousStage}.`,
        };
      }

      const evidenceCount = db.prepare(`
        SELECT count(*) as c FROM enf_evidence_vault WHERE case_id = ?
      `).get(caseId) as { c: number };

      if (evidenceCount.c === 0) {
        return {
          success: false,
          previousStage,
          newStage: targetStage,
          caseId,
          error: 'Guard failure: Hearing cannot be scheduled without at least 1 verified evidence item in the vault.',
        };
      }

      // Create hearing scheduling SLA (e.g. 14 days)
      this.createSlaDeadline(caseId, 'hearing_schedule', 14);
    }

    // Guard 3: hearing -> order_issued (Requires approved statutory action or order)
    if (targetStage === 'order_issued') {
      if (previousStage !== 'hearing' && previousStage !== 'evidence_review') {
        return {
          success: false,
          previousStage,
          newStage: targetStage,
          caseId,
          error: `Invalid transition: cannot issue order directly from ${previousStage}.`,
        };
      }

      const approvedActions = db.prepare(`
        SELECT count(*) as c FROM enf_actions WHERE case_id = ? AND status IN ('approved', 'dispatched', 'executed')
      `).get(caseId) as { c: number };

      if (approvedActions.c === 0) {
        return {
          success: false,
          previousStage,
          newStage: targetStage,
          caseId,
          error: 'Guard failure: Order cannot be issued without at least 1 fully approved enforcement action.',
        };
      }

      // Create corrective action / fine payment SLA (30 days)
      this.createSlaDeadline(caseId, 'fine_payment', 30);
    }

    // Guard 4: order_issued -> appeal
    if (targetStage === 'appeal') {
      if (previousStage !== 'order_issued') {
        return {
          success: false,
          previousStage,
          newStage: targetStage,
          caseId,
          error: `Appeals can only be initiated against an issued order (current stage: ${previousStage}).`,
        };
      }
    }

    // Guard 5: order_issued or appeal -> enforcement
    if (targetStage === 'enforcement') {
      if (previousStage !== 'order_issued' && previousStage !== 'appeal') {
        return {
          success: false,
          previousStage,
          newStage: targetStage,
          caseId,
          error: `Cannot enter enforcement phase from ${previousStage}.`,
        };
      }
    }

    // Execute state transition
    db.prepare(`
      UPDATE enf_cases SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(targetStage, caseId);

    return {
      success: true,
      previousStage,
      newStage: targetStage,
      caseId,
      message: `Stage transitioned from ${previousStage} to ${targetStage} by ${officerId}.`,
    };
  }

  /**
   * Propose a statutory enforcement action
   */
  public async proposeAction(params: {
    caseId: string;
    actionType: ActionType;
    parameters: Record<string, any>;
    proposedBy: string;
  }): Promise<EnforcementAction> {
    const db = getDb();
    const actionId = `act_${uuidv4().substring(0, 8)}`;

    db.prepare(`
      INSERT INTO enf_actions (
        id, case_id, action_type, parameters_json, status, created_at
      ) VALUES (?, ?, ?, ?, 'pending_approval', CURRENT_TIMESTAMP)
    `).run(
      actionId,
      params.caseId,
      params.actionType,
      JSON.stringify(params.parameters)
    );

    return this.getActionById(actionId)!;
  }

  /**
   * Get action by ID
   */
  public getActionById(actionId: string): EnforcementAction | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM enf_actions WHERE id = ?').get(actionId);
    return (row as EnforcementAction) || null;
  }

  /**
   * Approve a statutory enforcement action (Dual-Signatory Rule for High Impact)
   */
  public async approveAction(
    actionId: string,
    approverId: string,
    signatureToken?: string
  ): Promise<ActionApprovalResult> {
    const db = getDb();
    const action = this.getActionById(actionId);

    if (!action) {
      return {
        success: false,
        actionId,
        status: 'draft',
        approvalsCount: 0,
        requiredApprovals: 2,
        message: 'Action not found.',
      };
    }

    if (action.status === 'approved' || action.status === 'dispatched' || action.status === 'executed') {
      return {
        success: true,
        actionId,
        status: action.status,
        approvalsCount: 2,
        requiredApprovals: 2,
        approvedBy1: action.approved_by_1,
        approvedBy2: action.approved_by_2,
        message: 'Action is already approved.',
      };
    }

    const isHighImpact = HIGH_IMPACT_ACTIONS.includes(action.action_type);
    const requiredApprovals = isHighImpact ? 2 : 1;

    // First Approval Slot
    if (!action.approved_by_1) {
      if (requiredApprovals === 1) {
        // Single approval is sufficient for standard actions (e.g., warning letter)
        db.prepare(`
          UPDATE enf_actions
          SET approved_by_1 = ?, approved_at_1 = CURRENT_TIMESTAMP, status = 'approved'
          WHERE id = ?
        `).run(approverId, actionId);

        return {
          success: true,
          actionId,
          status: 'approved',
          approvalsCount: 1,
          requiredApprovals: 1,
          approvedBy1: approverId,
          message: `Action fully approved by ${approverId}.`,
        };
      } else {
        // First signature of dual approval
        db.prepare(`
          UPDATE enf_actions
          SET approved_by_1 = ?, approved_at_1 = CURRENT_TIMESTAMP, status = 'pending_approval'
          WHERE id = ?
        `).run(approverId, actionId);

        return {
          success: true,
          actionId,
          status: 'pending_approval',
          approvalsCount: 1,
          requiredApprovals: 2,
          approvedBy1: approverId,
          message: `First signatory recorded (${approverId}). Requires 2nd independent approval.`,
        };
      }
    }

    // Second Approval Slot (High-Impact Dual Signatory)
    if (action.approved_by_1) {
      if (action.approved_by_1 === approverId) {
        return {
          success: false,
          actionId,
          status: 'pending_approval',
          approvalsCount: 1,
          requiredApprovals: 2,
          approvedBy1: action.approved_by_1,
          message: 'Dual-Signatory Rule Violation: The second approver must be a distinct authorized officer (self-approval prohibited).',
        };
      }

      // Second signatory confirmed -> Transition to 'approved'
      db.prepare(`
        UPDATE enf_actions
        SET approved_by_2 = ?, approved_at_2 = CURRENT_TIMESTAMP, status = 'approved'
        WHERE id = ?
      `).run(approverId, actionId);

      return {
        success: true,
        actionId,
        status: 'approved',
        approvalsCount: 2,
        requiredApprovals: 2,
        approvedBy1: action.approved_by_1,
        approvedBy2: approverId,
        message: `Dual-Signatory approval complete. Signed by ${action.approved_by_1} and ${approverId}.`,
      };
    }

    return {
      success: false,
      actionId,
      status: action.status,
      approvalsCount: 0,
      requiredApprovals,
      message: 'Unknown approval state.',
    };
  }

  /**
   * Reject an action back to draft or failed
   */
  public async rejectAction(actionId: string, rejectorId: string, reason: string): Promise<boolean> {
    const db = getDb();
    const res = db.prepare(`
      UPDATE enf_actions
      SET status = 'failed', approved_by_1 = NULL, approved_by_2 = NULL
      WHERE id = ?
    `).run(actionId);
    return res.changes > 0;
  }

  /**
   * Retrieve complete Case Dossier including Actions, Evidence, SLAs, and Dispatches
   */
  public async getCaseDossier(caseId: string): Promise<{
    caseRecord: EnforcementCase | null;
    actions: EnforcementAction[];
    evidence: any[];
    deadlines: any[];
    dispatches: any[];
  }> {
    const db = getDb();
    const caseRecord = this.getCaseById(caseId);
    const actions = db.prepare('SELECT * FROM enf_actions WHERE case_id = ? ORDER BY created_at ASC').all(caseId) as EnforcementAction[];
    const evidence = db.prepare('SELECT * FROM enf_evidence_vault WHERE case_id = ? ORDER BY created_at ASC').all(caseId) as any[];
    const deadlines = db.prepare('SELECT * FROM enf_sla_deadlines WHERE case_id = ? ORDER BY due_at ASC').all(caseId) as any[];

    const actionIds = actions.map(a => a.id);
    let dispatches: any[] = [];
    if (actionIds.length > 0) {
      const placeholders = actionIds.map(() => '?').join(',');
      dispatches = db.prepare(`SELECT * FROM enf_dispatches WHERE action_id IN (${placeholders}) ORDER BY created_at ASC`).all(...actionIds) as any[];
    }

    return {
      caseRecord,
      actions,
      evidence,
      deadlines,
      dispatches,
    };
  }

  /**
   * Helper to create SLA Deadline record
   */
  private createSlaDeadline(caseId: string, type: DeadlineType, daysFromNow: number) {
    const db = getDb();
    const slaId = `sla_${uuidv4().substring(0, 8)}`;
    const dueAt = new Date(Date.now() + daysFromNow * 86400000).toISOString();

    try {
      db.prepare(`
        INSERT INTO enf_sla_deadlines (
          id, case_id, deadline_type, due_at, escalation_level, status
        ) VALUES (?, ?, ?, ?, 0, 'active')
      `).run(slaId, caseId, type, dueAt);
    } catch (e: any) {
      console.warn('[CaseStateMachine] Notice creating SLA:', e.message);
    }
  }
}

export const caseStateMachine = CaseStateMachineService.getInstance();
