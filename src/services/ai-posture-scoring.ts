/**
 * AI POSTURE SCORING: framework crosswalk, statutory penalty exposure, per-finding risk and remediation playbooks.
 * Pure functions (no I/O) so they are cheap to test.
 *
 * IMPORTANT LIMITS (also returned to callers):
 *  - The crosswalk is INDICATIVE. A static scan sees only what it can read; a high score is not a compliance
 *    certification and a low score is not a legal finding.
 *  - Penalty figures are STATUTORY MAXIMUMS for the infringement tier, not predictions. Actual fines depend on
 *    gravity, duration, cooperation, and enforcement practice. Combined figures are an upper bound, not a sum
 *    that regulators would normally impose.
 */

export type FrameworkId = 'EU_AI_ACT' | 'GDPR' | 'DORA' | 'NIS2' | 'ISO_42001' | 'NIST_AI_RMF' | 'OWASP_LLM_TOP10';
export type Sev = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PostureFinding { id: string; title: string; severity: Sev; category: string; framework: string; articleRef: string }

export const FRAMEWORK_NAMES: Record<FrameworkId, string> = {
  EU_AI_ACT: 'EU AI Act (Reg. 2024/1689)', GDPR: 'GDPR (Reg. 2016/679)', DORA: 'DORA (Reg. 2022/2554)', NIS2: 'NIS2 (Dir. 2022/2555)',
  ISO_42001: 'ISO/IEC 42001 AI management system', NIST_AI_RMF: 'NIST AI RMF 1.0', OWASP_LLM_TOP10: 'OWASP Top 10 for LLM Applications'
};

type Controls = Partial<Record<FrameworkId, string[]>>;

/** Finding category → controls it evidences a gap in (indicative crosswalk). */
export const CATEGORY_CONTROLS: Record<string, Controls> = {
  SECRETS_EXPOSURE: { EU_AI_ACT: ['Art. 15'], GDPR: ['Art. 32'], NIS2: ['Art. 21(2)(h)', 'Art. 21(2)(i)'], DORA: ['Art. 9'], ISO_42001: ['A.7 Data'], NIST_AI_RMF: ['MANAGE 2'], OWASP_LLM_TOP10: ['LLM02'] },
  PIPELINE_SECURITY: { EU_AI_ACT: ['Art. 15'], NIS2: ['Art. 21(2)(d)', 'Art. 21(2)(e)'], DORA: ['Art. 9', 'Art. 28'], ISO_42001: ['A.10 Third parties'], NIST_AI_RMF: ['GOVERN 6'], OWASP_LLM_TOP10: ['LLM01', 'LLM03'] },
  AI_SUPPLY_CHAIN: { EU_AI_ACT: ['Art. 15'], NIS2: ['Art. 21(2)(d)'], DORA: ['Art. 28'], ISO_42001: ['A.10 Third parties'], NIST_AI_RMF: ['GOVERN 6'], OWASP_LLM_TOP10: ['LLM03'] },
  HUMAN_OVERSIGHT: { EU_AI_ACT: ['Art. 14', 'Art. 26'], GDPR: ['Art. 22'], ISO_42001: ['A.9 Use'], NIST_AI_RMF: ['GOVERN 3', 'MANAGE 4'], OWASP_LLM_TOP10: ['LLM06'] },
  PROMPT_SECURITY: { EU_AI_ACT: ['Art. 15'], NIS2: ['Art. 21(2)(e)'], ISO_42001: ['A.6 Lifecycle'], NIST_AI_RMF: ['MEASURE 2'], OWASP_LLM_TOP10: ['LLM01', 'LLM07'] },
  OUTPUT_HANDLING: { EU_AI_ACT: ['Art. 15'], NIS2: ['Art. 21(2)(e)'], DORA: ['Art. 9'], ISO_42001: ['A.6 Lifecycle'], NIST_AI_RMF: ['MEASURE 2'], OWASP_LLM_TOP10: ['LLM05'] },
  DATA_GOVERNANCE: { EU_AI_ACT: ['Art. 10'], GDPR: ['Art. 5', 'Art. 25', 'Art. 32'], ISO_42001: ['A.7 Data'], NIST_AI_RMF: ['MAP 2'], OWASP_LLM_TOP10: ['LLM02'] },
  TRANSPORT_SECURITY: { EU_AI_ACT: ['Art. 15'], GDPR: ['Art. 32'], NIS2: ['Art. 21(2)(h)', 'Art. 21(2)(j)'], DORA: ['Art. 9'], ISO_42001: ['A.6 Lifecycle'], NIST_AI_RMF: ['MANAGE 2'] },
  INFRA_SECURITY: { EU_AI_ACT: ['Art. 15'], GDPR: ['Art. 32'], NIS2: ['Art. 21(2)(e)', 'Art. 21(2)(i)'], DORA: ['Art. 9'], ISO_42001: ['A.6 Lifecycle'], NIST_AI_RMF: ['MANAGE 2'], OWASP_LLM_TOP10: ['LLM10'] },
  TRACEABILITY: { EU_AI_ACT: ['Art. 12'], GDPR: ['Art. 5(2)', 'Art. 30'], NIS2: ['Art. 21(2)(f)'], DORA: ['Art. 10'], ISO_42001: ['A.6 Lifecycle'], NIST_AI_RMF: ['MEASURE 3'] },
  TRANSPARENCY: { EU_AI_ACT: ['Art. 13', 'Art. 50'], GDPR: ['Art. 12', 'Art. 13', 'Art. 14'], ISO_42001: ['A.8 Information'], NIST_AI_RMF: ['MAP 4'] },
  PROHIBITED_PRACTICE: { EU_AI_ACT: ['Art. 5'], GDPR: ['Art. 9', 'Art. 22'], ISO_42001: ['A.5 Impact assessment'], NIST_AI_RMF: ['MAP 5'] },
  AGENT_SAFETY: { EU_AI_ACT: ['Art. 14', 'Art. 15'], NIS2: ['Art. 21(2)(i)'], ISO_42001: ['A.9 Use'], NIST_AI_RMF: ['MANAGE 4'], OWASP_LLM_TOP10: ['LLM06', 'LLM10'] },
  DATA_RESIDENCY: { GDPR: ['Art. 44–49'], DORA: ['Art. 28'], ISO_42001: ['A.10 Third parties'] },
  AI_INVENTORY: { EU_AI_ACT: ['Art. 4', 'Art. 26', 'Art. 49'], NIS2: ['Art. 21(2)(i)'], DORA: ['Art. 8'], ISO_42001: ['AI system inventory'], NIST_AI_RMF: ['GOVERN 1.6'] },
  SHADOW_AI: { EU_AI_ACT: ['Art. 25', 'Art. 26'], GDPR: ['Art. 28', 'Art. 44–49'], NIS2: ['Art. 21(2)(d)'], DORA: ['Art. 28'], ISO_42001: ['A.10 Third parties'], NIST_AI_RMF: ['GOVERN 6'] },
  POLICY_ENGINE: { EU_AI_ACT: ['Art. 9'], GDPR: ['Art. 5'] },
  MODEL_DRIFT: { EU_AI_ACT: ['Art. 15', 'Art. 72'], DORA: ['Art. 10'], ISO_42001: ['A.6 Lifecycle'], NIST_AI_RMF: ['MEASURE 2.4', 'MANAGE 4'] },
  BIAS_FAIRNESS: { EU_AI_ACT: ['Art. 10(2)(f)-(g)', 'Art. 15'], GDPR: ['Art. 5(1)(a)', 'Art. 22'], ISO_42001: ['A.7 Data', 'A.5 Impact assessment'], NIST_AI_RMF: ['MEASURE 2.11'] }
};

const DEDUCT: Record<Sev, number> = { CRITICAL: 20, HIGH: 10, MEDIUM: 4, LOW: 1 };

export interface FrameworkPosture {
  framework: FrameworkId; name: string; score: number; status: 'STRONG' | 'ADEQUATE' | 'WEAK' | 'CRITICAL';
  findings: number; controlsAffected: string[]; bySeverity: Record<Sev, number>;
}

export function frameworkPosture(findings: PostureFinding[]): FrameworkPosture[] {
  return (Object.keys(FRAMEWORK_NAMES) as FrameworkId[]).map(fw => {
    let deduction = 0; let n = 0; const controls = new Set<string>(); const bySev: Record<Sev, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const f of findings) {
      const c = CATEGORY_CONTROLS[f.category]?.[fw];
      if (!c) continue;
      n++; deduction += DEDUCT[f.severity]; bySev[f.severity]++; c.forEach(x => controls.add(x));
    }
    const score = Math.max(0, 100 - deduction);
    return { framework: fw, name: FRAMEWORK_NAMES[fw], score, status: score >= 90 ? 'STRONG' : score >= 70 ? 'ADEQUATE' : score >= 50 ? 'WEAK' : 'CRITICAL', findings: n, controlsAffected: Array.from(controls).sort(), bySeverity: bySev };
  });
}

// ── Penalty exposure (statutory maximums) ────────────────────────────────────

export interface EntityProfile {
  annualTurnoverEur: number;                 // worldwide annual turnover of the undertaking
  isSme: boolean;
  nis2Class: 'ESSENTIAL' | 'IMPORTANT' | 'NONE';
  doraInScope: boolean;
}

interface Tier { id: string; label: string; fixedEur: number; pct: number; smeLower?: boolean; basis: string }

const TIERS: Record<string, Tier> = {
  AI_ACT_PROHIBITED: { id: 'AI_ACT_PROHIBITED', label: 'EU AI Act — prohibited practices', fixedEur: 35_000_000, pct: 0.07, smeLower: true, basis: 'Art. 99(3): up to €35M or 7% of worldwide annual turnover, whichever is higher (SMEs: whichever is lower, Art. 99(6))' },
  AI_ACT_OBLIGATIONS: { id: 'AI_ACT_OBLIGATIONS', label: 'EU AI Act — operator/deployer obligations', fixedEur: 15_000_000, pct: 0.03, smeLower: true, basis: 'Art. 99(4): up to €15M or 3% of worldwide annual turnover' },
  GDPR_HIGHER: { id: 'GDPR_HIGHER', label: 'GDPR — principles, rights, transfers', fixedEur: 20_000_000, pct: 0.04, basis: 'Art. 83(5): up to €20M or 4% of worldwide annual turnover, whichever is higher' },
  GDPR_LOWER: { id: 'GDPR_LOWER', label: 'GDPR — controller/processor obligations', fixedEur: 10_000_000, pct: 0.02, basis: 'Art. 83(4): up to €10M or 2% of worldwide annual turnover, whichever is higher' },
  NIS2_ESSENTIAL: { id: 'NIS2_ESSENTIAL', label: 'NIS2 — essential entity', fixedEur: 10_000_000, pct: 0.02, basis: 'Art. 34(4): maximum of at least €10M or 2% of worldwide annual turnover (set by Member State law)' },
  NIS2_IMPORTANT: { id: 'NIS2_IMPORTANT', label: 'NIS2 — important entity', fixedEur: 7_000_000, pct: 0.014, basis: 'Art. 34(5): maximum of at least €7M or 1.4% of worldwide annual turnover (set by Member State law)' }
};

const GDPR_HIGHER_ARTS = /(Art\.?\s*(5|6|7|9|12|13|14|15|16|17|18|19|20|21|22)\b|Art\.\s*44|Ch\.\s*V)/i;

export interface PenaltyLine { framework: FrameworkId | 'DORA'; tier: string; label: string; basis: string; exposureEur: number | null; note?: string; drivers: string[] }
export interface PenaltyResult {
  lines: PenaltyLine[]; combinedUpperBoundEur: number; entity: EntityProfile; method: string; disclaimer: string;
}

export function penaltyExposure(findings: PostureFinding[], entity: EntityProfile): PenaltyResult {
  const chosen = new Map<string, { tier: Tier; drivers: Set<string> }>();
  const pick = (t: Tier, driver: string) => {
    const cur = chosen.get(t.id) || { tier: t, drivers: new Set<string>() };
    cur.drivers.add(driver); chosen.set(t.id, cur);
  };
  for (const f of findings) {
    if (f.severity === 'LOW') continue;                 // low-severity items don't set the exposure tier
    const m = CATEGORY_CONTROLS[f.category];
    if (!m) continue;
    const label = `${f.title.slice(0, 60)} [${f.severity}]`;
    if (m.EU_AI_ACT) pick(f.category === 'PROHIBITED_PRACTICE' || /Art\.\s*5\b/.test(f.articleRef) ? TIERS.AI_ACT_PROHIBITED : TIERS.AI_ACT_OBLIGATIONS, label);
    if (m.GDPR) pick(m.GDPR.some(c => GDPR_HIGHER_ARTS.test(c) || /44/.test(c)) ? TIERS.GDPR_HIGHER : TIERS.GDPR_LOWER, label);
    if (m.NIS2 && entity.nis2Class !== 'NONE') pick(entity.nis2Class === 'ESSENTIAL' ? TIERS.NIS2_ESSENTIAL : TIERS.NIS2_IMPORTANT, label);
  }

  const T = Math.max(0, entity.annualTurnoverEur || 0);
  const lines: PenaltyLine[] = [];
  // Within one regulation only the highest applicable tier is reported.
  const byReg: Record<string, { tier: Tier; drivers: Set<string> }> = {};
  for (const { tier, drivers } of chosen.values()) {
    const reg = tier.id.startsWith('AI_ACT') ? 'EU_AI_ACT' : tier.id.startsWith('GDPR') ? 'GDPR' : 'NIS2';
    const val = (t: Tier) => (t.smeLower && entity.isSme ? Math.min(t.fixedEur, t.pct * T) : Math.max(t.fixedEur, t.pct * T));
    if (!byReg[reg] || val(tier) > val(byReg[reg].tier)) byReg[reg] = { tier, drivers };
  }
  let combined = 0;
  for (const [reg, { tier, drivers }] of Object.entries(byReg)) {
    const exposure = Math.round(tier.smeLower && entity.isSme ? Math.min(tier.fixedEur, tier.pct * T) : Math.max(tier.fixedEur, tier.pct * T));
    combined += exposure;
    lines.push({ framework: reg as FrameworkId, tier: tier.id, label: tier.label, basis: tier.basis, exposureEur: exposure, drivers: Array.from(drivers).slice(0, 5) });
  }
  if (entity.doraInScope && findings.some(f => CATEGORY_CONTROLS[f.category]?.DORA)) {
    lines.push({ framework: 'DORA', tier: 'DORA_MEMBER_STATE', label: 'DORA — penalties set by Member State law', basis: 'DORA delegates sanctions to Member States; critical ICT third-party providers face periodic penalties of up to 1% of average daily worldwide turnover (Art. 35).', exposureEur: null, note: 'Not quantified: no single statutory figure applies to the financial entity.', drivers: findings.filter(f => CATEGORY_CONTROLS[f.category]?.DORA).slice(0, 3).map(f => f.title.slice(0, 60)) });
  }
  return {
    lines: lines.sort((a, b) => (b.exposureEur ?? -1) - (a.exposureEur ?? -1)), combinedUpperBoundEur: combined, entity,
    method: 'Highest applicable statutory tier per regulation, using max(fixed, % × turnover) (SME rule applied where the Act provides it). Low-severity findings are excluded from tier selection.',
    disclaimer: 'Statutory maximums, not predictions. Real fines depend on gravity, duration, intent, cooperation and enforcement practice; regulators rarely impose the maximum, and parallel proceedings are subject to proportionality and ne bis in idem. Not legal advice.'
  };
}

// ── Per-finding risk (likelihood × impact) ───────────────────────────────────

const LIKELIHOOD: Record<Sev, number> = { CRITICAL: 0.9, HIGH: 0.7, MEDIUM: 0.45, LOW: 0.2 };
const EXPOSED_CATEGORIES = new Set(['SECRETS_EXPOSURE', 'INFRA_SECURITY', 'PROMPT_SECURITY', 'OUTPUT_HANDLING', 'AGENT_SAFETY']);

export function findingRisk(f: PostureFinding): { likelihood: number; impact: number; riskScore: number } {
  let likelihood = LIKELIHOOD[f.severity];
  if (EXPOSED_CATEGORIES.has(f.category)) likelihood = Math.min(1, likelihood * 1.1);
  const m = CATEGORY_CONTROLS[f.category] || {};
  const impact = f.category === 'PROHIBITED_PRACTICE' ? 100 : m.GDPR?.some(c => GDPR_HIGHER_ARTS.test(c)) ? 80 : m.EU_AI_ACT ? 70 : m.GDPR ? 55 : 40;
  return { likelihood: parseFloat(likelihood.toFixed(2)), impact, riskScore: Math.round(likelihood * impact) };
}

// ── Remediation playbooks ────────────────────────────────────────────────────

export const SLA_DAYS: Record<Sev, number> = { CRITICAL: 1, HIGH: 7, MEDIUM: 30, LOW: 90 };

export interface Playbook {
  category: string; title: string; ownerRole: string;
  immediate: string[]; shortTerm: string[]; longTerm: string[]; verification: string[]; rollback: string; evidence: string[];
}

const PB: Record<string, Playbook> = {
  SECRETS_EXPOSURE: { category: 'SECRETS_EXPOSURE', title: 'Exposed credential', ownerRole: 'Security engineering',
    immediate: ['Revoke/rotate the exposed credential now', 'Check provider logs for use since exposure', 'Remove it from the working tree'],
    shortTerm: ['Purge from git history and invalidate forks/caches', 'Move to a secrets manager; inject at runtime'],
    longTerm: ['Enable push protection / secret scanning in CI', 'Adopt short-lived, scoped tokens'],
    verification: ['Re-scan: rule SEC-01 no longer fires', 'Old credential returns 401/403'], rollback: 'None required; rotation is non-destructive. Coordinate dependent services before revoking.', evidence: ['Rotation timestamp', 'Provider access-log review', 'Clean re-scan report'] },
  PIPELINE_SECURITY: { category: 'PIPELINE_SECURITY', title: 'CI/CD pipeline weakness', ownerRole: 'DevOps / Platform',
    immediate: ['Disable the affected workflow trigger if actively exploitable'], shortTerm: ['Split untrusted build from privileged jobs', 'Remove secrets from AI-reading steps'],
    longTerm: ['Least-privilege tokens per job', 'Required reviews on workflow files (CODEOWNERS)'], verification: ['Re-scan clean', 'Fork PR cannot reach secrets (test PR)'], rollback: 'Revert the workflow commit.', evidence: ['Workflow diff', 'Test-PR run log'] },
  AI_SUPPLY_CHAIN: { category: 'AI_SUPPLY_CHAIN', title: 'AI supply-chain risk', ownerRole: 'Platform / ML engineering',
    immediate: ['Freeze updates to the affected dependency or model'], shortTerm: ['Pin actions/models to commit SHA or digest', 'Verify checksums/signatures'],
    longTerm: ['Maintain an SBOM / ML-BOM', 'Prefer safetensors over pickle formats'], verification: ['Pins present in re-scan', 'Checksum step runs in CI'], rollback: 'Revert to previously pinned version.', evidence: ['Pinned refs', 'Checksum job output'] },
  HUMAN_OVERSIGHT: { category: 'HUMAN_OVERSIGHT', title: 'Missing human oversight', ownerRole: 'System owner + Compliance',
    immediate: ['Route affected decisions to manual review'], shortTerm: ['Add a human-approval gate and an appeal path', 'Define confidence/risk thresholds for escalation'],
    longTerm: ['Train reviewers (Art. 4 AI literacy)', 'Monitor override rates'], verification: ['Test decision is held for approval', 'Appeal flow works end-to-end'], rollback: 'Gate can be toggled off per tenant, but only with documented risk acceptance.', evidence: ['Approval-gate config', 'Sample reviewed decisions', 'Reviewer training record'] },
  PROMPT_SECURITY: { category: 'PROMPT_SECURITY', title: 'Prompt-injection exposure', ownerRole: 'Application security',
    immediate: ['Route model traffic through the runtime gateway'], shortTerm: ['Delimit and sanitise untrusted input', 'Run the prompt-injection test suite against the endpoint'],
    longTerm: ['Least-privilege tools with approval', 'Plant canaries and monitor outputs'], verification: ['Attack-success rate trend in test engine', 'Canary never appears in outputs'], rollback: 'Gateway policy can be relaxed to FLAG while tuning.', evidence: ['Test-engine report', 'Gateway policy version'] },
  OUTPUT_HANDLING: { category: 'OUTPUT_HANDLING', title: 'Unsafe use of model output', ownerRole: 'Application engineering',
    immediate: ['Disable any execution of model output'], shortTerm: ['Parse to a strict schema; validate; allow-list actions'], longTerm: ['Sandbox execution; no network/secrets'],
    verification: ['Re-scan clean', 'Malicious output test does not execute'], rollback: 'Feature-flag the execution path off.', evidence: ['Schema validator', 'Sandbox config'] },
  DATA_GOVERNANCE: { category: 'DATA_GOVERNANCE', title: 'Data-governance gap', ownerRole: 'DPO + Data engineering',
    immediate: ['Stop sending personal data to the affected AI endpoint'], shortTerm: ['Scrub/pseudonymise before inference', 'Restrict connector scope (minimisation)'],
    longTerm: ['DPIA / FRIA update', 'Data-lineage records for training data'], verification: ['No validated identifiers in sampled prompts/logs', 'Scope review signed off'], rollback: 'Re-enable flow only after DPO approval.', evidence: ['DPIA update', 'Leakage scan report'] },
  INFRA_SECURITY: { category: 'INFRA_SECURITY', title: 'Infrastructure exposure', ownerRole: 'Cloud / Infrastructure',
    immediate: ['Close public access (private endpoint / restrict CIDR)'], shortTerm: ['Front inference with an authenticating gateway', 'Enable logging and encryption'],
    longTerm: ['Policy-as-code (OPA/Checkov) in CI', 'Regular external exposure scans'], verification: ['External probe shows endpoint unreachable/authenticated', 'IaC re-scan clean'], rollback: 'Re-apply previous IaC state; test connectivity first.', evidence: ['Terraform plan/apply', 'External scan result'] },
  TRANSPORT_SECURITY: { category: 'TRANSPORT_SECURITY', title: 'Transport/web hardening', ownerRole: 'Platform / Web engineering',
    immediate: ['Enforce HTTPS'], shortTerm: ['Add HSTS, CSP, X-Content-Type-Options, Referrer-Policy', 'Secure/HttpOnly/SameSite cookies'], longTerm: ['Automated header regression tests'],
    verification: ['Header check passes'], rollback: 'Remove header; CSP can start in report-only.', evidence: ['Header scan before/after'] },
  TRACEABILITY: { category: 'TRACEABILITY', title: 'Missing logging / traceability', ownerRole: 'Platform engineering',
    immediate: ['Enable request/response metadata logging'], shortTerm: ['Hash-chain or append-only log store; retention policy'], longTerm: ['Dashboards + alerting on anomalies'],
    verification: ['Sampled inference has a log entry', 'Log integrity check passes'], rollback: 'Not applicable.', evidence: ['Log sample', 'Retention policy'] },
  TRANSPARENCY: { category: 'TRANSPARENCY', title: 'Transparency obligation', ownerRole: 'Product + Legal',
    immediate: ['Add an AI-interaction notice at first contact'], shortTerm: ['Label AI-generated content; add provenance metadata (C2PA)'], longTerm: ['Documented user-information pack'],
    verification: ['Notice visible in UI test', 'Re-scan WEB-01/WEB-02 clean'], rollback: 'Not applicable.', evidence: ['Screenshots', 'Copy approved by Legal'] },
  PROHIBITED_PRACTICE: { category: 'PROHIBITED_PRACTICE', title: 'Possible prohibited practice', ownerRole: 'Legal + Executive sponsor',
    immediate: ['Suspend the capability pending legal review'], shortTerm: ['Determine whether an Art. 5 exception applies; document'], longTerm: ['Decommission or redesign'],
    verification: ['Written legal opinion on file', 'Capability disabled in production'], rollback: 'Only restore with documented legal clearance.', evidence: ['Legal opinion', 'Disablement change record'] },
  AGENT_SAFETY: { category: 'AGENT_SAFETY', title: 'Unsafe agent configuration', ownerRole: 'AI engineering + Security',
    immediate: ['Remove wildcard/shell/financial tools from the agent'], shortTerm: ['Explicit tool allow-list; approvals for data-changing tools; default-deny financial/production', 'Set step/time/cost limits and kill switch'],
    longTerm: ['Per-agent credentials; egress allow-list', 'Continuous agent red-teaming'], verification: ['Agent config re-scan clean', 'Tool call needing approval is held'], rollback: 'Restore previous config from version control.', evidence: ['Config diff', 'Approval-workflow test'] },
  DATA_RESIDENCY: { category: 'DATA_RESIDENCY', title: 'Data-residency / transfer', ownerRole: 'DPO',
    immediate: ['Identify the personal data involved'], shortTerm: ['Move to EU region or document transfer mechanism (SCCs/adequacy) and TIA'], longTerm: ['Region guardrails in IaC policy'], verification: ['Region verified', 'Transfer record on file'], rollback: 'Migration rollback plan per workload.', evidence: ['Transfer impact assessment'] },
  SHADOW_AI: { category: 'SHADOW_AI', title: 'Unsanctioned AI service', ownerRole: 'IT governance + Procurement',
    immediate: ['Inventory affected data and users'], shortTerm: ['Vendor review, DPA/SCCs; sanction, replace or block', 'Offer an approved alternative via the gateway'], longTerm: ['Egress monitoring; SaaS discovery on a schedule'], verification: ['Service sanctioned or no longer reachable', 'Register updated'], rollback: 'Unblock with documented approval.', evidence: ['Vendor review', 'Register entry'] },
  MODEL_DRIFT: { category: 'MODEL_DRIFT', title: 'Model or behaviour drift', ownerRole: 'ML engineering + System owner',
    immediate: ['Confirm with outcome metrics whether quality actually degraded', 'Route affected decisions to human review while investigating'],
    shortTerm: ['Identify the shifted feature (data pipeline change, new user population, upstream model update)', 'Retrain / recalibrate or roll back the change'],
    longTerm: ['Schedule recurring drift checks (post-market monitoring, Art. 72)', 'Set alert thresholds and an owner per feature'],
    verification: ['Drift monitor returns STABLE on a fresh window', 'Outcome metrics back within agreed bounds'], rollback: 'Revert the model/data change that introduced the shift.', evidence: ['Monitor run history', 'Root-cause note', 'Re-validation results'] },
  BIAS_FAIRNESS: { category: 'BIAS_FAIRNESS', title: 'Possible unfair outcomes between groups', ownerRole: 'DPO + System owner + Legal',
    immediate: ['Add human review for affected decisions', 'Preserve the data and decisions for analysis'],
    shortTerm: ['Investigate causes (training data representation, proxy features, thresholds)', 'Decide a fairness criterion with Legal — criteria can conflict', 'Mitigate: rebalance data, remove proxies, or adjust thresholds per documented rationale'],
    longTerm: ['Fundamental-rights / DPIA update', 'Re-test on a schedule with sufficient group sizes'],
    verification: ['Fairness monitor shows no confirmed disparity on a fresh sample with adequate group sizes'], rollback: 'Revert threshold or data changes.', evidence: ['Fairness reports before/after', 'Documented criterion and rationale', 'DPIA/FRIA update'] },
  AI_INVENTORY: { category: 'AI_INVENTORY', title: 'AI system not in inventory', ownerRole: 'AI governance office',
    immediate: ['Name an owner'], shortTerm: ['Register purpose, risk tier, data and deployer obligations'], longTerm: ['Quarterly inventory attestation'], verification: ['Inventory entry exists with owner'], rollback: 'Not applicable.', evidence: ['Inventory record'] }
};

const GENERIC_PB: Playbook = { category: 'GENERAL', title: 'General remediation', ownerRole: 'System owner', immediate: ['Triage and assign an owner'], shortTerm: ['Apply the finding-specific remediation'], longTerm: ['Add a regression check to CI'], verification: ['Re-scan clean'], rollback: 'Revert the change.', evidence: ['Re-scan report'] };

export function playbookFor(category: string, severity: Sev, from: Date = new Date()): Playbook & { sla: { days: number; dueAt: string } } {
  const pb = PB[category] || GENERIC_PB;
  const days = SLA_DAYS[severity];
  return { ...pb, sla: { days, dueAt: new Date(from.getTime() + days * 86_400_000).toISOString() } };
}
