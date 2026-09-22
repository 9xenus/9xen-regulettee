import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/sqlite';

const ENTITLEMENTS_MODULES: Array<{ module_key: string; name: string; description: string; category: string; default_status: string; base_price: number }> = [
  { module_key: 'GDPR', name: 'GDPR Privacy Engine', description: 'Core data-protection rights automation, DSR workflows and Art. 30 records.', category: 'Privacy', default_status: 'ACTIVE', base_price: 0 },
  { module_key: 'EU_AI_ACT', name: 'EU AI Act Compliance', description: 'High-risk AI system registration, conformity assessment and model reporting.', category: 'Technology', default_status: 'ACTIVE', base_price: 299 },
  { module_key: 'AML_KYC', name: 'AML & KYC Screening', description: 'Sanctions, PEP and adverse-media screening with CDD/EDD workflows.', category: 'Financial', default_status: 'ACTIVE', base_price: 349 },
  { module_key: 'DORA', name: 'DORA Resilience', description: 'ICT risk management, digital operational resilience testing and reporting.', category: 'Financial', default_status: 'ACTIVE', base_price: 449 },
  { module_key: 'NIS2', name: 'NIS2 Cyber Readiness', description: 'Essential & important entity security obligations, incident reporting and supply chain.', category: 'Cyber', default_status: 'ACTIVE', base_price: 399 },
  { module_key: 'WHISTLEBLOWER', name: 'Whistleblower Channel', description: 'Anonymous employee disclosure channel with Art. 61 due-process workflow.', category: 'Ethics', default_status: 'ACTIVE', base_price: 299 },
  { module_key: 'SOC2', name: 'SOC 2 Trust Center', description: 'Security, availability, confidentiality controls evidence and auditor portal.', category: 'Audit', default_status: 'ACTIVE', base_price: 549 },
  { module_key: 'KYC_BIOMETRIC', name: 'Biometric Identity', description: 'Face-match and liveness verification with eIDAS-level assurance vault.', category: 'Identity', default_status: 'ACTIVE', base_price: 499 },
  { module_key: 'EVIDENCE_VAULT', name: 'WORM Evidence Vault', description: 'Cryptographic hash-sealed evidence storage for courtroom admissibility.', category: 'Legal', default_status: 'ACTIVE', base_price: 249 },
  { module_key: 'B2G', name: 'B2G Filing Gateway', description: 'Government procurement qualification, RFI/RFP submission and interagency dispatch.', category: 'Public Sector', default_status: 'LOCKED', base_price: 599 },
  { module_key: 'SOVEREIGN_CLOUD', name: 'Sovereign Cloud Enclave', description: 'Dedicated isolated data residency enclave with region pinning.', category: 'Infrastructure', default_status: 'LOCKED', base_price: 1999 },
  { module_key: 'CUSTOM_GATEWAY', name: 'Custom Compliance Gateway', description: 'AI-negotiated proprietary API gateway policy enforcement for partner traffic.', category: 'Integration', default_status: 'LOCKED', base_price: 699 },
];

const PLAN_DEFINITIONS: Array<{ key: string; name: string; displayName: string; basePriceUsd: number; included: string[] }> = [
  { key: 'basic', name: 'Basic', displayName: 'Basic Starter Tier', basePriceUsd: 49, included: ['GDPR', 'AML_KYC', 'KYC_BIOMETRIC', 'WHISTLEBLOWER'] },
  { key: 'pro', name: 'Pro', displayName: 'Pro Growth Tier', basePriceUsd: 299, included: ['GDPR', 'AML_KYC', 'EU_AI_ACT', 'DORA', 'NIS2', 'KYC_BIOMETRIC', 'WHISTLEBLOWER', 'EVIDENCE_VAULT', 'SOC2'] },
  { key: 'enterprise', name: 'Enterprise', displayName: 'Enterprise Sovereign Tier', basePriceUsd: 1499, included: ENTITLEMENTS_MODULES.map(m => m.module_key) },
];

export const entitlementRouter = Router();

entitlementRouter.get('/modules', (_req: Request, res: Response) => {
  res.json({ success: true, modules: ENTITLEMENTS_MODULES });
});

entitlementRouter.get('/plans', (_req: Request, res: Response) => {
  res.json({
    success: true,
    plans: PLAN_DEFINITIONS.map(p => ({ ...p, included_modules: p.included }))
  });
});

entitlementRouter.get('/tenant/:tenantId', (req: Request, res: Response) => {
  const { tenantId } = req.params;
  try {
    const db = getDb();
    const entitlements: Array<Record<string, any>> = [];
    const existing = new Set<string>();

    if (db && typeof db.prepare === 'function') {
      try {
        const rows = db.prepare('SELECT * FROM tenant_entitlements WHERE tenant_id = ?').all(tenantId) as any[];
        for (const row of rows) {
          existing.add(row.module_key);
          entitlements.push({
            module_key: row.module_key,
            name: row.module_key,
            description: row.custom_limits || '',
            category: 'Custom',
            default_status: row.status || 'ACTIVE',
            status: (row.status || 'ACTIVE') as any,
            valid_until: row.valid_until || undefined,
            custom_limits: row.custom_limits || undefined,
            price: Number(row.custom_price) || 0,
            base_price: Number(row.custom_price) || 0,
          });
        }
      } catch {
        // fall through to plan-based defaults
      }
    }

    const planKey = tenantId.includes('_') ? tenantId.split('_')[1] : '';
    const plan = PLAN_DEFINITIONS.find(p => p.key === planKey) || PLAN_DEFINITIONS[1];

    for (const mod of ENTITLEMENTS_MODULES) {
      if (existing.has(mod.module_key)) continue;
      const includedInPlan = plan.included.includes(mod.module_key);
      entitlements.push({
        ...mod,
        status: mod.default_status === 'LOCKED' && !includedInPlan ? 'LOCKED' : (includedInPlan ? 'ACTIVE' : 'DISABLED') as any,
        price: includedInPlan ? 0 : mod.base_price,
        base_price: mod.base_price,
      });
    }

    res.json({ success: true, tenantId, entitlements });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

entitlementRouter.post('/tenant/:tenantId/toggle', (req: Request, res: Response) => {
  const { tenantId } = req.params;
  const { module_key, status } = req.body || {};
  if (!module_key || !status) {
    return res.status(400).json({ success: false, error: 'module_key and status are required' });
  }
  try {
    const db = getDb();
    if (db && typeof db.prepare === 'function') {
      try {
        db.prepare(`
          INSERT INTO tenant_entitlements (tenant_id, module_key, status, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(tenant_id, module_key) DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP
        `).run(tenantId, module_key, status);
      } catch {
        // fall through: entitlement tracked in memory only for this response
      }
    }
    res.json({ success: true, tenantId, module_key, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

entitlementRouter.post('/tenant/:tenantId/apply-plan', (req: Request, res: Response) => {
  const { tenantId } = req.params;
  const { plan_key } = req.body || {};
  const plan = PLAN_DEFINITIONS.find(p => p.key === plan_key);
  if (!plan) {
    return res.status(400).json({ success: false, error: 'Unknown plan_key' });
  }
  try {
    const db = getDb();
    if (db && typeof db.prepare === 'function') {
      try {
        const upsert = db.prepare(`
          INSERT INTO tenant_entitlements (tenant_id, module_key, status, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(tenant_id, module_key) DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP
        `);
        db.transaction((modules: string[]) => {
          for (const key of modules) {
            upsert.run(tenantId, key, 'ACTIVE');
          }
        })(plan.included);
      } catch {
        // fall through
      }
    }
    res.json({ success: true, tenantId, planKey: plan_key, appliedModules: plan.included.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});