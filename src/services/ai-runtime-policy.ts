/**
 * AI RUNTIME POLICY ENGINE
 * Kill switch, tool classification, policy decisions, and approval workflow.
 *
 * Safe defaults (MVP):
 *   - READ_ONLY actions        → automatic ALLOW
 *   - DATA_CHANGING actions    → approval-based
 *   - FINANCIAL / PRODUCTION   → default-deny
 *
 * Kill switch scope (broadest to narrowest):
 *   Global → Tenant → Application → Model → Agent → Tool → Conversation → User
 */
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'node:crypto';

// ── Kill switch ──────────────────────────────────────────────────────────────

export type KillSwitchScope =
  | 'GLOBAL'
  | 'TENANT'
  | 'APPLICATION'
  | 'MODEL'
  | 'AGENT'
  | 'TOOL'
  | 'CONVERSATION'
  | 'USER';

export interface KillSwitchEvent {
  scope: KillSwitchScope;
  targetId: string;
  reason: string;
  triggeredBy: string;
  timestamp: string;
}

export interface KillSwitchState {
  active: boolean;
  scope: KillSwitchScope;
  targetId: string;
  reason: string;
  triggeredBy: string;
  triggeredAt: string;
}

// ── Tool classification ─────────────────────────────────────────────────────

export type ToolPermission = 'READ_ONLY' | 'DATA_CHANGING' | 'FINANCIAL' | 'PRODUCTION';
export type ToolDecision = 'ALLOW' | 'APPROVAL_REQUIRED' | 'DENY';

export interface ToolDefinition {
  name: string;
  permission: ToolPermission;
  description: string;
  allowedRoles: string[];
  resourceScopes: string[];
}

// ── Policy engine ────────────────────────────────────────────────────────────

export interface PolicyContext {
  tenantId: string;
  userId: string;
  agentId: string;
  modelId: string;
  toolName: string;
  permission: ToolPermission;
  resourceScope: string;
  args: Record<string, unknown>;
  riskScore: number;
}

export interface PolicyDecisionResult {
  decision: ToolDecision;
  reason: string;
  policyVersion: string;
  approvalWorkflowId: string | null;
  checks: { name: string; passed: boolean; detail: string }[];
}

export interface ApprovalWorkflow {
  workflowId: string;
  requestId: string;
  tenantId: string;
  userId: string;
  toolName: string;
  permission: ToolPermission;
  args: Record<string, unknown>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  requestedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  riskScore: number;
}

// ── Audit event format ───────────────────────────────────────────────────────

export interface AuditEvent {
  event_type: string;
  tenant_id: string;
  user_id: string;
  agent_id: string;
  model_version: string;
  tool: string;
  decision: string;
  policy_version: string;
  risk_score: number;
  request_hash: string;
  timestamp: string;
}

// ── Default tool registry ────────────────────────────────────────────────────

export const DEFAULT_TOOL_REGISTRY: ToolDefinition[] = [
  { name: 'web_search', permission: 'READ_ONLY', description: 'Search the web for information', allowedRoles: ['ASSISTANT', 'REASONER'], resourceScopes: ['public'] },
  { name: 'read_file', permission: 'READ_ONLY', description: 'Read a file from storage', allowedRoles: ['ASSISTANT', 'EXTRACTOR'], resourceScopes: ['tenant'] },
  { name: 'query_database', permission: 'READ_ONLY', description: 'Execute a read-only database query', allowedRoles: ['ASSISTANT', 'EXTRACTOR'], resourceScopes: ['tenant'] },
  { name: 'send_email', permission: 'DATA_CHANGING', description: 'Send an email to a recipient', allowedRoles: ['ASSISTANT'], resourceScopes: ['tenant'] },
  { name: 'create_ticket', permission: 'DATA_CHANGING', description: 'Create a support ticket', allowedRoles: ['ASSISTANT'], resourceScopes: ['tenant'] },
  { name: 'update_record', permission: 'DATA_CHANGING', description: 'Update a database record', allowedRoles: ['ASSISTANT'], resourceScopes: ['tenant'] },
  { name: 'process_payment', permission: 'FINANCIAL', description: 'Process a payment transaction', allowedRoles: ['ASSISTANT'], resourceScopes: ['tenant'] },
  { name: 'transfer_funds', permission: 'FINANCIAL', description: 'Transfer funds between accounts', allowedRoles: ['ASSISTANT'], resourceScopes: ['tenant'] },
  { name: 'deploy_model', permission: 'PRODUCTION', description: 'Deploy a model to production', allowedRoles: ['ASSISTANT'], resourceScopes: ['global'] },
  { name: 'modify_infrastructure', permission: 'PRODUCTION', description: 'Modify cloud infrastructure', allowedRoles: ['ASSISTANT'], resourceScopes: ['global'] }
];

// ── Policy engine ────────────────────────────────────────────────────────────

export class AiRuntimePolicyEngine {
  private static killSwitches: KillSwitchState[] = [];
  private static toolRegistry: ToolDefinition[] = [...DEFAULT_TOOL_REGISTRY];
  private static approvalWorkflows: ApprovalWorkflow[] = [];
  private static policyVersion = 'policy-2026.10.04';

  // ── Kill switch ────────────────────────────────────────────────────────────

  /**
   * Triggers a runtime kill switch at the specified scope.
   * Once active, all requests matching the scope are blocked.
   */
  public static triggerKillSwitch(event: KillSwitchEvent): KillSwitchState {
    // Deactivate any existing kill switch for the same scope+target
    AiRuntimePolicyEngine.killSwitches = AiRuntimePolicyEngine.killSwitches.filter(
      ks => !(ks.scope === event.scope && ks.targetId === event.targetId)
    );

    const state: KillSwitchState = {
      active: true,
      scope: event.scope,
      targetId: event.targetId,
      reason: event.reason,
      triggeredBy: event.triggeredBy,
      triggeredAt: event.timestamp
    };

    AiRuntimePolicyEngine.killSwitches.push(state);
    return state;
  }

  /**
   * Deactivates a kill switch for the given scope and target.
   */
  public static deactivateKillSwitch(scope: KillSwitchScope, targetId: string): boolean {
    const before = AiRuntimePolicyEngine.killSwitches.length;
    AiRuntimePolicyEngine.killSwitches = AiRuntimePolicyEngine.killSwitches.filter(
      ks => !(ks.scope === scope && ks.targetId === targetId)
    );
    return AiRuntimePolicyEngine.killSwitches.length < before;
  }

  /**
   * Checks whether a kill switch is active for the given context.
   * Evaluates from broadest to narrowest scope.
   */
  public static isKillSwitchActive(context: {
    tenantId: string;
    userId: string;
    agentId: string;
    modelId: string;
    toolName: string;
    conversationId?: string;
  }): KillSwitchState | null {
    const now = new Date().toISOString();

    // Check each scope level from broadest to narrowest
    const checks: { scope: KillSwitchScope; targetId: string }[] = [
      { scope: 'GLOBAL', targetId: '*' },
      { scope: 'TENANT', targetId: context.tenantId },
      { scope: 'USER', targetId: context.userId },
      { scope: 'AGENT', targetId: context.agentId },
      { scope: 'MODEL', targetId: context.modelId },
      ...(context.toolName ? [{ scope: 'TOOL' as KillSwitchScope, targetId: context.toolName }] : []),   // a plain chat has no tool: a TOOL switch must not stop it
      ...(context.conversationId ? [{ scope: 'CONVERSATION' as KillSwitchScope, targetId: context.conversationId }] : [])
    ];

    for (const check of checks) {
      const active = AiRuntimePolicyEngine.killSwitches.find(
        ks => ks.active && ks.scope === check.scope && (ks.targetId === check.targetId || ks.targetId === '*')
      );
      if (active) return { ...active, triggeredAt: now };
    }

    return null;
  }

  public static getActiveKillSwitches(): KillSwitchState[] {
    return AiRuntimePolicyEngine.killSwitches.filter(ks => ks.active);
  }

  // ── Tool classification ────────────────────────────────────────────────────

  public static classifyTool(toolName: string): ToolDefinition | undefined {
    return AiRuntimePolicyEngine.toolRegistry.find(t => t.name === toolName);
  }

  public static registerTool(tool: ToolDefinition): void {
    const existing = AiRuntimePolicyEngine.toolRegistry.findIndex(t => t.name === tool.name);
    if (existing >= 0) {
      AiRuntimePolicyEngine.toolRegistry[existing] = tool;
    } else {
      AiRuntimePolicyEngine.toolRegistry.push(tool);
    }
  }

  public static getToolRegistry(): ToolDefinition[] {
    return [...AiRuntimePolicyEngine.toolRegistry];
  }

  // ── Policy decision ────────────────────────────────────────────────────────

  /**
   * Evaluates a policy decision for a tool call request.
   * Implements the safe defaults:
   *   - READ_ONLY → ALLOW
   *   - DATA_CHANGING → APPROVAL_REQUIRED
   *   - FINANCIAL / PRODUCTION → DENY
   */
  public static evaluatePolicy(context: PolicyContext): PolicyDecisionResult {
    const checks: { name: string; passed: boolean; detail: string }[] = [];
    const tool = AiRuntimePolicyEngine.classifyTool(context.toolName);

    // Check 1: Identity & tenant validation
    const identityValid = !!(context.tenantId && context.userId && context.agentId);
    checks.push({
      name: 'identity_tenant_validation',
      passed: identityValid,
      detail: identityValid ? 'Identity and tenant context valid' : 'Missing identity or tenant context'
    });

    // Check 2: Tool classification
    const toolKnown = !!tool;
    checks.push({
      name: 'tool_classification',
      passed: toolKnown,
      detail: toolKnown ? `Tool classified as ${tool!.permission}` : `Unknown tool: ${context.toolName}`
    });

    // Check 3: Argument validation
    const argsValid = context.args && Object.keys(context.args).length > 0;
    checks.push({
      name: 'argument_validation',
      passed: argsValid,
      detail: argsValid ? 'Arguments present and non-empty' : 'Missing or empty arguments'
    });

    // Check 4: Resource scope check
    const scopeAllowed = tool ? tool.resourceScopes.includes(context.resourceScope) : false;
    checks.push({
      name: 'resource_scope_check',
      passed: scopeAllowed,
      detail: scopeAllowed ? `Resource scope ${context.resourceScope} allowed` : `Resource scope ${context.resourceScope} not permitted`
    });

    // Check 5: Risk score threshold
    const riskAcceptable = context.riskScore < 90;
    checks.push({
      name: 'risk_score_threshold',
      passed: riskAcceptable,
      detail: riskAcceptable ? `Risk score ${context.riskScore} within acceptable range` : `Risk score ${context.riskScore} exceeds threshold`
    });

    // Determine decision based on safe defaults
    let decision: ToolDecision = 'DENY';
    let reason = '';
    let approvalWorkflowId: string | null = null;

    if (!identityValid || !toolKnown || !argsValid || !scopeAllowed || !riskAcceptable) {
      decision = 'DENY';
      reason = 'One or more policy checks failed';
    } else if (tool!.permission === 'READ_ONLY') {
      decision = 'ALLOW';
      reason = 'Read-only action — automatic allow per safe defaults';
    } else if (tool!.permission === 'DATA_CHANGING') {
      decision = 'APPROVAL_REQUIRED';
      reason = 'Data-changing action — approval required per safe defaults';
      approvalWorkflowId = AiRuntimePolicyEngine.createApprovalWorkflow(context);
    } else {
      // FINANCIAL or PRODUCTION — default-deny
      decision = 'DENY';
      reason = `${tool!.permission} action — default-deny per safe defaults`;
    }

    return {
      decision,
      reason,
      policyVersion: AiRuntimePolicyEngine.policyVersion,
      approvalWorkflowId,
      checks
    };
  }

  // ── Approval workflow ──────────────────────────────────────────────────────

  private static createApprovalWorkflow(context: PolicyContext): string {
    const workflowId = `APR-${uuidv4().substring(0, 8).toUpperCase()}`;
    AiRuntimePolicyEngine.approvalWorkflows.push({
      workflowId,
      requestId: `REQ-${uuidv4().substring(0, 8).toUpperCase()}`,
      tenantId: context.tenantId,
      userId: context.userId,
      toolName: context.toolName,
      permission: context.permission,
      args: context.args,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
      riskScore: context.riskScore
    });
    return workflowId;
  }

  public static getApprovalWorkflow(workflowId: string): ApprovalWorkflow | undefined {
    return AiRuntimePolicyEngine.approvalWorkflows.find(w => w.workflowId === workflowId);
  }

  public static listApprovalWorkflows(tenantId?: string): ApprovalWorkflow[] {
    if (tenantId) {
      return AiRuntimePolicyEngine.approvalWorkflows.filter(w => w.tenantId === tenantId);
    }
    return [...AiRuntimePolicyEngine.approvalWorkflows];
  }

  public static resolveApprovalWorkflow(
    workflowId: string,
    approved: boolean,
    resolvedBy: string
  ): ApprovalWorkflow | undefined {
    const workflow = AiRuntimePolicyEngine.approvalWorkflows.find(w => w.workflowId === workflowId);
    if (!workflow) return undefined;

    workflow.status = approved ? 'APPROVED' : 'REJECTED';
    workflow.resolvedAt = new Date().toISOString();
    workflow.resolvedBy = resolvedBy;
    return workflow;
  }

  // ── Audit event ────────────────────────────────────────────────────────────

  /**
   * Creates a structured audit event for a runtime decision.
   */
  public static createAuditEvent(params: {
    eventType: string;
    tenantId: string;
    userId: string;
    agentId: string;
    modelVersion: string;
    tool: string;
    decision: string;
    riskScore: number;
    requestData: string;
  }): AuditEvent {
    return {
      event_type: params.eventType,
      tenant_id: params.tenantId,
      user_id: params.userId,
      agent_id: params.agentId,
      model_version: params.modelVersion,
      tool: params.tool,
      decision: params.decision,
      policy_version: AiRuntimePolicyEngine.policyVersion,
      risk_score: params.riskScore,
      request_hash: createHash('sha256').update(params.requestData).digest('hex').substring(0, 16),
      timestamp: new Date().toISOString()
    };
  }

  public static getPolicyVersion(): string {
    return AiRuntimePolicyEngine.policyVersion;
  }
}

// ── Repository Pattern ───────────────────────────────────────────────────────

export interface ApprovalRecordData {
  id: string;
  proposalId: string;
  tenantId: string;
  requestedBy: string;
  toolName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'EXPIRED';
  decision: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  executedAt: string | null;
  auditEventId: string | null;
  createdAt: string;
}

/**
 * Repository pattern for approval records.
 * Provides save/get/update operations with in-memory storage.
 */
export class ApprovalRecord {
  private static records: Map<string, ApprovalRecordData> = new Map();

  constructor(private data: ApprovalRecordData) {}

  save(): ApprovalRecordData {
    ApprovalRecord.records.set(this.data.id, this.data);
    return this.data;
  }

  static get(id: string): ApprovalRecordData | undefined {
    return ApprovalRecord.records.get(id);
  }

  static findByProposal(proposalId: string): ApprovalRecordData | undefined {
    for (const record of ApprovalRecord.records.values()) {
      if (record.proposalId === proposalId) return record;
    }
    return undefined;
  }

  static list(tenantId?: string): ApprovalRecordData[] {
    const all = Array.from(ApprovalRecord.records.values());
    if (tenantId) return all.filter(r => r.tenantId === tenantId);
    return all;
  }

  update(updates: Partial<ApprovalRecordData>): ApprovalRecordData {
    this.data = { ...this.data, ...updates };
    ApprovalRecord.records.set(this.data.id, this.data);
    return this.data;
  }

  toJSON(): ApprovalRecordData {
    return { ...this.data };
  }
}

// ── Dual Approval ────────────────────────────────────────────────────────────

export interface ApprovalVote {
  approverId: string;
  decision: 'approve' | 'reject';
  comment: string;
  timestamp: string;
}

export interface Proposal {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tool: string;
  tenantId: string;
  requestedBy: string;
}

/**
 * Determines whether a proposal requires dual approval.
 * Critical risk or sensitive tools (transfer_money, delete_customer) require it.
 */
export function requiresDualApproval(proposal: Proposal): boolean {
  return (
    proposal.riskLevel === 'CRITICAL' ||
    proposal.tool === 'transfer_money' ||
    proposal.tool === 'delete_customer'
  );
}

/**
 * Tracks votes for dual approval.
 * The same person cannot approve twice.
 * Requires >= 2 unique approvers with "approve" decision.
 */
export class DualApprovalState {
  private votes: ApprovalVote[] = [];

  addVote(approverId: string, decision: 'approve' | 'reject', comment: string = ''): { added: boolean; reason: string } {
    // Segregation of duties: same person cannot vote twice
    const existing = this.votes.find(v => v.approverId === approverId);
    if (existing) {
      return { added: false, reason: `Approver ${approverId} has already voted. Segregation of duties violation.` };
    }

    this.votes.push({
      approverId,
      decision,
      comment,
      timestamp: new Date().toISOString()
    });

    return { added: true, reason: 'Vote recorded' };
  }

  approved(): boolean {
    const approved = this.votes.filter(v => v.decision === 'approve');
    const uniqueApprovers = new Set(approved.map(v => v.approverId));
    return uniqueApprovers.size >= 2;
  }

  rejected(): boolean {
    const rejected = this.votes.filter(v => v.decision === 'reject');
    return rejected.length >= 2;
  }

  getVotes(): ApprovalVote[] {
    return [...this.votes];
  }

  getUniqueApproverCount(): number {
    return new Set(this.votes.filter(v => v.decision === 'approve').map(v => v.approverId)).size;
  }
}

// ── Secure Approval API ──────────────────────────────────────────────────────

export interface AuthContext {
  userId: string;
  tenantId: string;
  roles: string[];
  authMethod: 'JWT' | 'SSO' | 'IAM';
  tokenExpiry: string;
}

export interface ApprovalProposal {
  proposalId: string;
  tenantId: string;
  requestedBy: string;
  toolName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  args: Record<string, unknown>;
  description: string;
}

export interface ApprovalDecision {
  decision: 'APPROVED' | 'REJECTED' | 'NEEDS_DUAL_APPROVAL';
  reason: string;
  approverId: string;
  requiresDualApproval: boolean;
  dualApprovalState: DualApprovalState | null;
  auditEventId: string;
}

/**
 * Secure Approval API with authentication, policy enforcement,
 * execution, and audit logging.
 */
export class SecureApprovalAPI {
  private static authContexts: Map<string, AuthContext> = new Map();
  private static proposals: Map<string, ApprovalProposal> = new Map();
  private static dualApprovalStates: Map<string, DualApprovalState> = new Map();

  /**
   * DISABLED. This used to accept any string as a "token" and return an admin context, which let anyone approve
   * anything (and two arbitrary strings defeated segregation of duties). Identity must come from a VERIFIED session:
   * use SecureApprovalAPI.contextFromSession(req.user) behind the platform's requireAuth middleware.
   */
  static authenticateContext(_token: string, _authMethod: 'JWT' | 'SSO' | 'IAM' = 'JWT'): AuthContext {
    throw new Error('authenticateContext is disabled: build the approver context from a verified session (contextFromSession)');
  }

  /** Approver roles recognised by the policy, mapped from platform session roles. Unmapped roles get no approval rights. */
  private static readonly SESSION_ROLE_MAP: Record<string, string[]> = {
    SUPER_ADMIN: ['admin'], ADMIN: ['admin'], COMPLIANCE_OFFICER: ['compliance_officer'], TENANT_OWNER: ['manager']
  };

  /** Builds the approver context from an already-verified session (tenant, user and role are NOT caller-supplied). */
  static contextFromSession(user: { userId: string; tenantId: string; role: string }, expiresAt?: string): AuthContext {
    return {
      userId: user.userId,
      tenantId: user.tenantId,
      roles: SecureApprovalAPI.SESSION_ROLE_MAP[user.role] ?? [String(user.role || 'none').toLowerCase()],
      authMethod: 'JWT',
      tokenExpiry: expiresAt ?? new Date(Date.now() + 3600_000).toISOString()
    };
  }

  private static hasApprovalRole(ctx: AuthContext): boolean {
    return ctx.roles.some(r => ['manager', 'admin', 'compliance_officer'].includes(r));
  }

  /**
   * Decides a proposal AND records the outcome on its approval record. Only a final APPROVED changes the record;
   * a rejected approver (conflict of interest, wrong tenant, missing role) does not reject the proposal itself.
   */
  static decide(proposalId: string, authContext: AuthContext): ApprovalDecision | null {
    const proposal = SecureApprovalAPI.proposals.get(proposalId);
    if (!proposal) return null;
    const record = ApprovalRecord.findByProposal(proposalId);
    if (record && record.status !== 'PENDING') {
      return {
        decision: 'REJECTED', reason: `Proposal is already ${record.status}; it cannot be decided again`, approverId: authContext.userId,
        requiresDualApproval: false, dualApprovalState: null, auditEventId: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`
      };
    }
    const decision = SecureApprovalAPI.enforcePolicy(proposal, authContext);
    if (decision.decision === 'APPROVED' && record) {
      new ApprovalRecord(record).update({ status: 'APPROVED', decision: decision.reason, decidedBy: authContext.userId, decidedAt: new Date().toISOString(), auditEventId: decision.auditEventId });
    }
    return decision;
  }

  /**
   * Enforces policy on a proposal and returns the decision.
   */
  static enforcePolicy(proposal: ApprovalProposal, authContext: AuthContext): ApprovalDecision {
    const requiresDual = requiresDualApproval({
      riskLevel: proposal.riskLevel,
      tool: proposal.toolName,
      tenantId: proposal.tenantId,
      requestedBy: proposal.requestedBy
    });

    // Check for conflict of interest: requester cannot approve their own proposal
    if (proposal.requestedBy === authContext.userId) {
      return {
        decision: 'REJECTED',
        reason: 'Conflict of interest: requester cannot approve their own proposal',
        approverId: authContext.userId,
        requiresDualApproval: requiresDual,
        dualApprovalState: null,
        auditEventId: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`
      };
    }

    // Check tenant isolation
    if (proposal.tenantId !== authContext.tenantId) {
      return {
        decision: 'REJECTED',
        reason: 'Tenant isolation violation: cross-tenant approval not permitted',
        approverId: authContext.userId,
        requiresDualApproval: requiresDual,
        dualApprovalState: null,
        auditEventId: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`
      };
    }

    // Check role-based access
    const hasApprovalRole = authContext.roles.some(r => ['manager', 'admin', 'compliance_officer'].includes(r));
    if (!hasApprovalRole) {
      return {
        decision: 'REJECTED',
        reason: 'Insufficient role: approver must have manager, admin, or compliance_officer role',
        approverId: authContext.userId,
        requiresDualApproval: requiresDual,
        dualApprovalState: null,
        auditEventId: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`
      };
    }

    if (requiresDual) {
      let state = SecureApprovalAPI.dualApprovalStates.get(proposal.proposalId);
      if (!state) {
        state = new DualApprovalState();
        SecureApprovalAPI.dualApprovalStates.set(proposal.proposalId, state);
      }

      const result = state.addVote(authContext.userId, 'approve');
      if (!result.added) {
        return {
          decision: 'REJECTED',
          reason: result.reason,
          approverId: authContext.userId,
          requiresDualApproval: true,
          dualApprovalState: state,
          auditEventId: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`
        };
      }

      if (state.approved()) {
        return {
          decision: 'APPROVED',
          reason: `Dual approval granted by ${state.getUniqueApproverCount()} unique approvers`,
          approverId: authContext.userId,
          requiresDualApproval: true,
          dualApprovalState: state,
          auditEventId: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`
        };
      }

      return {
        decision: 'NEEDS_DUAL_APPROVAL',
        reason: `Awaiting additional approvals (${state.getUniqueApproverCount()}/2)`,
        approverId: authContext.userId,
        requiresDualApproval: true,
        dualApprovalState: state,
        auditEventId: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`
      };
    }

    // Single approval for non-critical proposals
    return {
      decision: 'APPROVED',
      reason: 'Single approval sufficient for non-critical proposal',
      approverId: authContext.userId,
      requiresDualApproval: false,
      dualApprovalState: null,
      auditEventId: `EVT-${uuidv4().substring(0, 8).toUpperCase()}`
    };
  }

  /**
   * Executes an approved proposal.
   */
  static executeProposal(proposalId: string, authContext: AuthContext): { success: boolean; message: string; auditEventId: string } {
    const proposal = SecureApprovalAPI.proposals.get(proposalId);
    if (!proposal) {
      return { success: false, message: 'Proposal not found', auditEventId: '' };
    }

    if (proposal.tenantId !== authContext.tenantId) {
      return { success: false, message: 'Tenant isolation violation: cross-tenant execution not permitted', auditEventId: '' };
    }
    if (!SecureApprovalAPI.hasApprovalRole(authContext)) {
      return { success: false, message: 'Insufficient role: executor must have manager, admin, or compliance_officer role', auditEventId: '' };
    }

    const record = ApprovalRecord.findByProposal(proposalId);
    if (!record || record.status !== 'APPROVED') {
      return { success: false, message: 'Proposal not approved', auditEventId: '' };
    }

    // Execute the approved action
    const auditEventId = `EVT-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Update the record
    const approvalRecord = new ApprovalRecord(record);
    approvalRecord.update({
      status: 'EXECUTED',
      executedAt: new Date().toISOString(),
      auditEventId
    });

    return {
      success: true,
      message: `Proposal ${proposalId} executed successfully`,
      auditEventId
    };
  }

  /**
   * Creates an audit event for an approval action.
   */
  static auditEvent(params: {
    eventType: string;
    tenantId: string;
    userId: string;
    agentId: string;
    modelVersion: string;
    tool: string;
    decision: string;
    riskScore: number;
    requestData: string;
  }): AuditEvent {
    return AiRuntimePolicyEngine.createAuditEvent(params);
  }

  /**
   * Submits a new proposal for approval.
   */
  static submitProposal(proposal: ApprovalProposal): ApprovalRecord {
    if (SecureApprovalAPI.proposals.has(proposal.proposalId)) throw new Error(`Proposal ${proposal.proposalId} already exists`);
    SecureApprovalAPI.proposals.set(proposal.proposalId, proposal);

    const record = new ApprovalRecord({
      id: `REC-${uuidv4().substring(0, 8).toUpperCase()}`,
      proposalId: proposal.proposalId,
      tenantId: proposal.tenantId,
      requestedBy: proposal.requestedBy,
      toolName: proposal.toolName,
      riskLevel: proposal.riskLevel,
      status: 'PENDING',
      decision: null,
      decidedBy: null,
      decidedAt: null,
      executedAt: null,
      auditEventId: null,
      createdAt: new Date().toISOString()
    });

    return record.save() ? record : record;
  }

  static getProposal(proposalId: string): ApprovalProposal | undefined {
    return SecureApprovalAPI.proposals.get(proposalId);
  }

  static listProposals(tenantId?: string): ApprovalProposal[] {
    const all = Array.from(SecureApprovalAPI.proposals.values());
    if (tenantId) return all.filter(p => p.tenantId === tenantId);
    return all;
  }

  static getDualApprovalState(proposalId: string): DualApprovalState | undefined {
    return SecureApprovalAPI.dualApprovalStates.get(proposalId);
  }
}
