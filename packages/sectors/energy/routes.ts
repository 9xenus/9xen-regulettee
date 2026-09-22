import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/esg/emissions', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'energy', useCase: 'esg', inputs: { body: req.body || {} } },
      'Validate GHG scope disclosures against ESRS.'
    );
    res.json({ success: true, sector: 'energy', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Energy & Utilities', framework: 'CSRD/ESRS / SFDR / NIS2' });
  });
  return router;
};
