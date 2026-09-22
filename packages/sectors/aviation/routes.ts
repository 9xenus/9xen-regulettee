import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/easa/occurrence', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'aviation', useCase: 'easa', inputs: { body: req.body || {} } },
      'Validate mandatory safety occurrence report.'
    );
    res.json({ success: true, sector: 'aviation', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Aviation & Aerospace', framework: 'ICAO / EASA / EU PNR' });
  });
  return router;
};
