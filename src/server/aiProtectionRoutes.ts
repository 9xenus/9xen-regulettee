/**
 * AI PROTECTION ROUTES — /api/v1/ai-risk-audit, /api/v1/ai-security, /api/v1/ai-runtime
 *
 * Authentication is declared HERE (requireAuth on every router) instead of relying on the order in which
 * server.ts happens to mount a global middleware.
 *
 * Authorization model
 *   tenant      always the session's tenant. Only ADMIN / SUPER_ADMIN may act on another tenant (tenantId param).
 *               List endpoints are always tenant-scoped; by-id endpoints return 404 for another tenant's rows.
 *   read/analyse  any authenticated user (own tenant only).
 *   change state  COMPLIANCE_ROLES (admin, super admin, compliance officer, tenant owner): deploy a fix patch,
 *               resolve an approval workflow, decide/execute a proposal, tenant-level kill switch.
 *   GLOBAL state  ADMIN / SUPER_ADMIN only: gateway policy (one policy shared by all tenants), tool registry, global and
 *               non-tenant-scoped kill switches (their target ids are not tenant-namespaced, so a tenant could otherwise
 *               stop another tenant's agent by guessing an id).
 *   identity    approver/requester/actor ids come from the verified session, never from the request body.
 *               (The gateway's `userId` is the calling application's END-USER id and stays caller-supplied.)
 */
import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { tenantOf, fail, ADMIN_ROLES, COMPLIANCE_ROLES } from './aiEstateRoutes.js';
import { LexDB } from '../services/LexDB.js';
import { AiComplianceRiskEngine } from '../services/ai-compliance-risk-engine.js';
import { AiFixationEngine } from '../services/ai-fixation-engine.js';
import { AiSecurityEngine } from '../services/ai-security-engine.js';
import { AiRuntimeGatewayEngine } from '../services/ai-runtime-gateway.js';
import { AiRuntimePolicyEngine, SecureApprovalAPI, ApprovalRecord, type KillSwitchScope } from '../services/ai-runtime-policy.js';
import { getAiRiskFinding } from '../db/ai-risk-repository.js';

export const aiRiskAuditRouter = Router();
export const aiSecurityRouter = Router();
export const aiRuntimeRouter = Router();
for (const r of [aiRiskAuditRouter, aiSecurityRouter, aiRuntimeRouter]) r.use(requireAuth);

const isAdmin = (req: AuthenticatedRequest) => !!req.user && ADMIN_ROLES.includes(req.user.role);
const isCompliance = (req: AuthenticatedRequest) => !!req.user && COMPLIANCE_ROLES.includes(req.user.role);
const actor = (req: AuthenticatedRequest) => req.user?.email || req.user?.userId || 'unknown';
const requireCompliance = (req: AuthenticatedRequest, res: Response, what: string): boolean =>
  isCompliance(req) ? true : (fail(res, 403, `Only an admin, compliance officer or tenant owner can ${what}`), false);
const requireAdmin = (req: AuthenticatedRequest, res: Response, what: string): boolean =>
  isAdmin(req) ? true : (fail(res, 403, `Only an administrator can ${what}`), false);

async function audit(req: AuthenticatedRequest, action: string, target: string, severity: 'INFO' | 'WARNING' | 'CRITICAL', payload: unknown) {
  try { await LexDB.recordAuditEvent({ tenant_id: tenantOf(req), actor_id: actor(req), module: 'AI_PROTECTION', action, status: 'SUCCESS', severity, target, payload }); } catch { /* best-effort */ }
}
const ownsRow = (req: AuthenticatedRequest, row: { tenant_id: string } | undefined | null) => !!row && row.tenant_id === tenantOf(req);
const MAX_TEXT = 200_000;
const lim = (v: unknown, dflt: number, max: number) => Math.min(Math.max(parseInt(String(v), 10) || dflt, 1), max);

// ═════════════════════════════ /ai-risk-audit ═════════════════════════════

aiRiskAuditRouter.post('/assess-profile', async (req: AuthenticatedRequest, res) => {
  try {
    const { profile } = req.body || {};
    if (!profile || !profile.id) return fail(res, 400, 'profile object with id is required');
    const report = await AiComplianceRiskEngine.assessAiSystem(profile, tenantOf(req));
    res.json({ success: true, report });
  } catch (err: any) { fail(res, 500, err.message); }
});

aiRiskAuditRouter.post('/generate-patch', (req: AuthenticatedRequest, res) => {
  try {
    const { finding, systemName = 'Production AI System' } = req.body || {};
    if (!finding) return fail(res, 400, 'finding object is required');
    res.json({ success: true, patch: AiFixationEngine.generateFixForFinding(finding, String(systemName).slice(0, 120)) });
  } catch (err: any) { fail(res, 500, err.message); }
});

aiRiskAuditRouter.post('/deploy-patch', async (req: AuthenticatedRequest, res) => {
  try {
    if (!requireCompliance(req, res, 'deploy a fix patch')) return;
    const { patch } = req.body || {};
    if (!patch || typeof patch.findingId !== 'string') return fail(res, 400, 'patch object with findingId is required');
    const tenantId = tenantOf(req);
    // The finding a patch closes must belong to the caller's tenant (otherwise it could mark another tenant's finding FIXED).
    if (!ownsRow(req, getAiRiskFinding(patch.findingId))) return fail(res, 404, 'Finding not found');
    const result = await AiFixationEngine.applyFix(patch, tenantId);
    void audit(req, 'AI_FIX_DEPLOYED', patch.findingId, 'INFO', { fixationId: result.fixationId, by: actor(req) });
    res.json({ success: result.success, result });
  } catch (err: any) { fail(res, 500, err.message); }
});

aiRiskAuditRouter.get('/audits', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, audits: AiComplianceRiskEngine.listAudits(tenantOf(req), lim(req.query.limit, 50, 200)) });
});
aiRiskAuditRouter.get('/audits/:id', (req: AuthenticatedRequest, res) => {
  const audit = AiComplianceRiskEngine.getAudit(req.params.id);
  if (!ownsRow(req, audit)) return fail(res, 404, 'Audit not found');
  res.json({ success: true, audit });
});
aiRiskAuditRouter.get('/findings', (req: AuthenticatedRequest, res) => {
  const tenantId = tenantOf(req); const auditId = typeof req.query.auditId === 'string' ? req.query.auditId : undefined;
  if (auditId && !ownsRow(req, AiComplianceRiskEngine.getAudit(auditId))) return res.json({ success: true, findings: [] });
  const rows = AiComplianceRiskEngine.listFindings(auditId, tenantId, lim(req.query.limit, 200, 500)).filter(f => f.tenant_id === tenantId);
  res.json({ success: true, findings: rows });
});
aiRiskAuditRouter.get('/findings/:id', (req: AuthenticatedRequest, res) => {
  const finding = AiComplianceRiskEngine.getFinding(req.params.id);
  if (!ownsRow(req, finding)) return fail(res, 404, 'Finding not found');
  res.json({ success: true, finding });
});
aiRiskAuditRouter.get('/fixations', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, fixations: AiComplianceRiskEngine.listFixations(tenantOf(req), lim(req.query.limit, 100, 300)) });
});
aiRiskAuditRouter.get('/fixations/:id', (req: AuthenticatedRequest, res) => {
  const fixation = AiComplianceRiskEngine.getFixation(req.params.id);
  if (!ownsRow(req, fixation)) return fail(res, 404, 'Fixation not found');
  res.json({ success: true, fixation });
});
aiRiskAuditRouter.get('/summary', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, summary: AiComplianceRiskEngine.getAuditSummary(tenantOf(req)) });
});

// ═════════════════════════════ /ai-security ═════════════════════════════

const textField = (req: AuthenticatedRequest, res: Response, key: string): string | null => {
  const v = (req.body || {})[key] ?? '';
  if (typeof v !== 'string') { fail(res, 400, `${key} must be a string`); return null; }
  if (v.length > MAX_TEXT) { fail(res, 413, `${key} is limited to ${MAX_TEXT} characters`); return null; }
  return v;
};
aiSecurityRouter.post('/prompt-injection', (req: AuthenticatedRequest, res) => {
  const input = textField(req, res, 'input'); if (input === null) return;
  res.json({ success: true, verdict: AiSecurityEngine.detectPromptInjection(input) });
});
aiSecurityRouter.post('/pii-scrub', (req: AuthenticatedRequest, res) => {
  const text = textField(req, res, 'text'); if (text === null) return;
  res.json({ success: true, result: AiSecurityEngine.scrubPii(text) });
});
aiSecurityRouter.post('/jailbreak-detect', (req: AuthenticatedRequest, res) => {
  const input = textField(req, res, 'input'); if (input === null) return;
  res.json({ success: true, verdict: AiSecurityEngine.detectJailbreak(input) });
});
aiSecurityRouter.post('/posture', (req: AuthenticatedRequest, res) => {
  const { profile } = req.body || {};
  if (!profile || !profile.id) return fail(res, 400, 'profile object with id is required');
  res.json({ success: true, report: AiSecurityEngine.assessSecurityPosture(profile, tenantOf(req)) });
});

// ═════════════════════════════ /ai-runtime ═════════════════════════════

aiRuntimeRouter.post('/chat', async (req: AuthenticatedRequest, res) => {
  try {
    const body = req.body || {};
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 200) return fail(res, 400, 'messages must be an array of 1..200 messages');
    if (body.messages.reduce((n: number, m: any) => n + String(m?.content ?? '').length, 0) > 500_000) return fail(res, 413, 'messages are limited to 500000 characters in total');
    // Tenant comes from the session. `userId` is the calling application's end-user id; default to the session user.
    const result = await AiRuntimeGatewayEngine.processRequest({ ...body, tenantId: tenantOf(req), userId: typeof body.userId === 'string' && body.userId ? body.userId.slice(0, 120) : req.user!.userId });
    res.json({ success: true, result });
  } catch (err: any) { fail(res, 500, err.message); }
});

// gateway policy is ONE object shared by every tenant → read for all, write for administrators
aiRuntimeRouter.get('/policy', (_req, res) => { res.json({ success: true, policy: AiRuntimeGatewayEngine.getPolicyConfig() }); });
aiRuntimeRouter.put('/policy', (req: AuthenticatedRequest, res) => {
  if (!requireAdmin(req, res, 'change the shared gateway policy')) return;
  const policy = AiRuntimeGatewayEngine.updatePolicyConfig(req.body || {});
  void audit(req, 'AI_GATEWAY_POLICY_UPDATED', 'gateway-policy', 'WARNING', { changed: Object.keys(req.body || {}), by: actor(req) });
  res.json({ success: true, policy });
});
aiRuntimeRouter.post('/policy/reset', (req: AuthenticatedRequest, res) => {
  if (!requireAdmin(req, res, 'reset the shared gateway policy')) return;
  const policy = AiRuntimeGatewayEngine.resetPolicyConfig();
  void audit(req, 'AI_GATEWAY_POLICY_RESET', 'gateway-policy', 'WARNING', { by: actor(req) });
  res.json({ success: true, policy });
});

// kill switch
const SCOPES: KillSwitchScope[] = ['GLOBAL', 'TENANT', 'APPLICATION', 'MODEL', 'AGENT', 'TOOL', 'CONVERSATION', 'USER'];
function killSwitchAllowed(req: AuthenticatedRequest, res: Response, scope: unknown, targetId: unknown): { scope: KillSwitchScope; targetId: string } | null {
  if (!SCOPES.includes(scope as KillSwitchScope) || typeof targetId !== 'string' || !/^[\w.:@*-]{1,120}$/.test(targetId)) { fail(res, 400, `scope must be one of ${SCOPES.join(', ')} and targetId a short identifier`); return null; }
  if (!requireCompliance(req, res, 'operate a kill switch')) return null;
  if (!isAdmin(req)) {
    // A tenant-level actor can only stop their OWN tenant. Other scopes' target ids are global, so they are admin-only.
    if (scope !== 'TENANT' || targetId !== req.user!.tenantId) { fail(res, 403, `Only an administrator can operate a ${scope} kill switch; you can operate TENANT kill switch for your own tenant (${req.user!.tenantId})`); return null; }
  }
  return { scope: scope as KillSwitchScope, targetId };
}
aiRuntimeRouter.get('/killswitch', (req: AuthenticatedRequest, res) => {
  const all = AiRuntimePolicyEngine.getActiveKillSwitches();
  const t = req.user!.tenantId;
  res.json({ success: true, killSwitches: isAdmin(req) ? all : all.filter(k => k.scope === 'GLOBAL' || (k.scope === 'TENANT' && k.targetId === t)) });
});
aiRuntimeRouter.post('/killswitch', (req: AuthenticatedRequest, res) => {
  const k = killSwitchAllowed(req, res, req.body?.scope, req.body?.targetId); if (!k) return;
  const state = AiRuntimePolicyEngine.triggerKillSwitch({ ...k, reason: String(req.body?.reason || 'Manual kill switch activation').slice(0, 300), triggeredBy: actor(req), timestamp: new Date().toISOString() });
  void audit(req, 'AI_KILL_SWITCH_ACTIVATED', `${k.scope}:${k.targetId}`, 'CRITICAL', { reason: state.reason, by: actor(req) });
  res.json({ success: true, state });
});
aiRuntimeRouter.post('/killswitch/deactivate', (req: AuthenticatedRequest, res) => {
  const k = killSwitchAllowed(req, res, req.body?.scope, req.body?.targetId); if (!k) return;
  const deactivated = AiRuntimePolicyEngine.deactivateKillSwitch(k.scope, k.targetId);
  void audit(req, 'AI_KILL_SWITCH_DEACTIVATED', `${k.scope}:${k.targetId}`, 'WARNING', { by: actor(req), deactivated });
  res.json({ success: true, deactivated });
});

// tool registry — shared by all tenants (registering a tool as READ_ONLY would weaken policy for everyone)
const PERMISSIONS = ['READ_ONLY', 'DATA_CHANGING', 'FINANCIAL', 'PRODUCTION'];
aiRuntimeRouter.get('/tools', (_req, res) => { res.json({ success: true, tools: AiRuntimePolicyEngine.getToolRegistry() }); });
aiRuntimeRouter.post('/tools', (req: AuthenticatedRequest, res) => {
  if (!requireAdmin(req, res, 'change the shared tool registry')) return;
  const t = req.body;
  if (!t || typeof t.name !== 'string' || !/^[\w.-]{1,80}$/.test(t.name) || !PERMISSIONS.includes(t.permission)) return fail(res, 400, `tool needs a name and a permission (${PERMISSIONS.join(', ')})`);
  AiRuntimePolicyEngine.registerTool({ name: t.name, permission: t.permission, description: String(t.description || '').slice(0, 300), allowedRoles: Array.isArray(t.allowedRoles) ? t.allowedRoles.map(String).slice(0, 20) : [], resourceScopes: Array.isArray(t.resourceScopes) ? t.resourceScopes.map(String).slice(0, 20) : [] });
  void audit(req, 'AI_TOOL_REGISTERED', t.name, 'WARNING', { permission: t.permission, by: actor(req) });
  res.json({ success: true, tools: AiRuntimePolicyEngine.getToolRegistry() });
});

aiRuntimeRouter.post('/policy/evaluate', (req: AuthenticatedRequest, res) => {
  const ctx = req.body || {};
  if (!ctx.toolName || typeof ctx.toolName !== 'string') return fail(res, 400, 'toolName is required');
  res.json({ success: true, result: AiRuntimePolicyEngine.evaluatePolicy({ ...ctx, tenantId: tenantOf(req), userId: typeof ctx.userId === 'string' && ctx.userId ? ctx.userId : req.user!.userId }) });
});

// approval workflows (created by the gateway when a tool needs approval)
aiRuntimeRouter.get('/approvals', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, approvals: AiRuntimePolicyEngine.listApprovalWorkflows(tenantOf(req)) });
});

// NOTE: the literal /approvals/proposals… and /approvals/records routes MUST be registered before /approvals/:workflowId.
// ── secure approval API: dual approval + segregation of duties, identities from the verified session ──
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
aiRuntimeRouter.post('/approvals/proposals', (req: AuthenticatedRequest, res) => {
  const { proposalId, toolName, riskLevel, args, description } = req.body || {};
  if (typeof proposalId !== 'string' || !/^[\w.:-]{1,80}$/.test(proposalId) || typeof toolName !== 'string' || !toolName || !RISK_LEVELS.includes(riskLevel)) {
    return fail(res, 400, `proposalId, toolName and riskLevel (${RISK_LEVELS.join('|')}) are required`);
  }
  try {
    // tenant and requester are the session's — a caller cannot file a proposal "as" someone else or in another tenant
    const record = SecureApprovalAPI.submitProposal({ proposalId, tenantId: req.user!.tenantId, requestedBy: req.user!.userId, toolName: toolName.slice(0, 80), riskLevel, args: args && typeof args === 'object' ? args : {}, description: String(description || '').slice(0, 500) });
    void audit(req, 'AI_APPROVAL_PROPOSED', proposalId, 'INFO', { toolName, riskLevel });
    res.status(201).json({ success: true, record: record.toJSON() });
  } catch (e: any) { fail(res, 409, e.message); }
});
const ownProposal = (req: AuthenticatedRequest, id: string) => { const p = SecureApprovalAPI.getProposal(id); return p && p.tenantId === tenantOf(req) ? p : undefined; };
aiRuntimeRouter.get('/approvals/proposals', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, proposals: SecureApprovalAPI.listProposals(tenantOf(req)) });
});
aiRuntimeRouter.get('/approvals/proposals/:proposalId', (req: AuthenticatedRequest, res) => {
  const proposal = ownProposal(req, req.params.proposalId);
  return proposal ? res.json({ success: true, proposal }) : fail(res, 404, 'Proposal not found');
});
aiRuntimeRouter.post('/approvals/proposals/:proposalId/decision', (req: AuthenticatedRequest, res) => {
  if (!requireCompliance(req, res, 'approve a proposal')) return;
  if (!ownProposal(req, req.params.proposalId)) return fail(res, 404, 'Proposal not found');
  const decision = SecureApprovalAPI.decide(req.params.proposalId, SecureApprovalAPI.contextFromSession(req.user!));
  if (!decision) return fail(res, 404, 'Proposal not found');
  void audit(req, 'AI_APPROVAL_DECISION', req.params.proposalId, decision.decision === 'APPROVED' ? 'INFO' : 'WARNING', { decision: decision.decision, reason: decision.reason, approver: actor(req) });
  res.json({ success: true, decision });
});
aiRuntimeRouter.post('/approvals/proposals/:proposalId/execute', (req: AuthenticatedRequest, res) => {
  if (!requireCompliance(req, res, 'execute an approved proposal')) return;
  if (!ownProposal(req, req.params.proposalId)) return fail(res, 404, 'Proposal not found');
  const result = SecureApprovalAPI.executeProposal(req.params.proposalId, SecureApprovalAPI.contextFromSession(req.user!));
  void audit(req, 'AI_APPROVAL_EXECUTED', req.params.proposalId, result.success ? 'INFO' : 'WARNING', { success: result.success, by: actor(req) });
  res.json({ success: result.success, result });
});
aiRuntimeRouter.get('/approvals/records', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, records: ApprovalRecord.list(tenantOf(req)) });
});
aiRuntimeRouter.get('/approvals/dual/:proposalId', (req: AuthenticatedRequest, res) => {
  if (!ownProposal(req, req.params.proposalId)) return fail(res, 404, 'Dual approval state not found');
  const state = SecureApprovalAPI.getDualApprovalState(req.params.proposalId);
  if (!state) return fail(res, 404, 'Dual approval state not found');
  res.json({ success: true, state: { votes: state.getVotes(), uniqueApproverCount: state.getUniqueApproverCount(), approved: state.approved() } });
});

aiRuntimeRouter.get('/approvals/:workflowId', (req: AuthenticatedRequest, res) => {
  const workflow = AiRuntimePolicyEngine.getApprovalWorkflow(req.params.workflowId);
  if (!workflow || workflow.tenantId !== tenantOf(req)) return fail(res, 404, 'Approval workflow not found');
  res.json({ success: true, workflow });
});
aiRuntimeRouter.post('/approvals/:workflowId/resolve', (req: AuthenticatedRequest, res) => {
  if (!requireCompliance(req, res, 'resolve an approval workflow')) return;
  const { approved } = req.body || {};
  if (typeof approved !== 'boolean') return fail(res, 400, 'approved (boolean) is required');
  const wf = AiRuntimePolicyEngine.getApprovalWorkflow(req.params.workflowId);
  if (!wf || wf.tenantId !== tenantOf(req)) return fail(res, 404, 'Approval workflow not found');
  if (wf.status !== 'PENDING') return fail(res, 409, `Workflow is already ${wf.status}`);
  if (wf.userId === req.user!.userId) return fail(res, 403, 'Segregation of duties: you cannot resolve a workflow you triggered');
  const workflow = AiRuntimePolicyEngine.resolveApprovalWorkflow(req.params.workflowId, approved, actor(req));   // resolver = verified session, not body
  void audit(req, 'AI_WORKFLOW_RESOLVED', req.params.workflowId, 'INFO', { approved, by: actor(req) });
  res.json({ success: true, workflow });
});
