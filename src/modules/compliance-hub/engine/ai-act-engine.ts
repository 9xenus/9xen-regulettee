import { Router } from 'express';
import { dbDrivenRuleEngine } from './db-rule-engine';

export const moduleManifest = {
  name: 'EU AI Act Governance',
  slug: 'eu-ai-act',
  category: 'AI_GOVERNANCE',
  version: '1.0.0',
};

export const router = Router();

router.post('/assess', async (req, res) => {
  const facts = {
    systemType: (req.body as any)?.systemType,
    dataGovernanceLevel: (req.body as any)?.dataGovernanceLevel,
  };
  const result = await dbDrivenRuleEngine.evaluate(facts);
  res.json({ success: true, engine: 'ai-act', ...result });
});