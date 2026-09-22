import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/ccpa/optout', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'retail', useCase: 'ccpa', inputs: { body: req.body || {} } },
      'Record and honor a consumer opt-out request.'
    );
    res.json({ success: true, sector: 'retail', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Retail & E-Commerce', framework: 'GPSR / CCPA / Consumer Rights 2011/83' });
  });
  return router;
};
