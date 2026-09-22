import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/lsg/supplier', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'manufacturing', useCase: 'lsg', inputs: { body: req.body || {} } },
      'Screen supplier for human-rights red flags.'
    );
    res.json({ success: true, sector: 'manufacturing', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Manufacturing & Industry 4.0', framework: 'GPSR / LkSG / Export Control' });
  });
  return router;
};
