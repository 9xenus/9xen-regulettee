import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/aml/property', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'realestate', useCase: 'aml', inputs: { body: req.body || {} } },
      'Screen high-value property transaction buyer.'
    );
    res.json({ success: true, sector: 'realestate', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Real Estate & PropTech', framework: 'AML/KYC / GDPR tenant / EU MCD' });
  });
  return router;
};
