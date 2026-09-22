import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/aml/screen', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'gaming', useCase: 'aml', inputs: { body: req.body || {} } },
      'Screen betting patterns for AML structuring.'
    );
    res.json({ success: true, sector: 'gaming', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Gaming & Gambling', framework: 'AML / Age gating / Responsible gaming' });
  });
  return router;
};
