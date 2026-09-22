import { Router } from 'express';
import { dbDrivenRuleEngine } from './db-rule-engine';

export const moduleManifest = {
  name: 'GDPR Compliance Engine',
  slug: 'gdpr',
  category: 'DATA_PROTECTION',
  version: '1.0.0',
};

export const router = Router();

router.post('/evaluate', async (req, res) => {
  const facts = (req.body as any)?.facts || {};
  const result = await dbDrivenRuleEngine.evaluate(facts);
  res.json({ success: true, engine: 'gdpr', ...result });
});