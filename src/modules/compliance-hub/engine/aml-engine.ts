import { Router } from 'express';
import { dbDrivenRuleEngine } from './db-rule-engine';

export const moduleManifest = {
  name: 'AML/KYC Rules Module',
  slug: 'aml-kyc',
  category: 'AML_KYC',
  version: '1.0.0',
};

export const router = Router();

router.post('/screen', async (req, res) => {
  const facts = {
    isPep: Boolean((req.body as any)?.isPep),
    senderCountry: (req.body as any)?.senderCountry,
    transferAmount: Number((req.body as any)?.transferAmount || 0),
  };
  const result = await dbDrivenRuleEngine.evaluate(facts);
  res.json({ success: true, engine: 'aml', ...result });
});