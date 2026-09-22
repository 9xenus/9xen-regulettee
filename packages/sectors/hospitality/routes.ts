import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/transfer/check', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'hospitality', useCase: 'transfer', inputs: { body: req.body || {} } },
      'Validate TCP adequacy for guest data transfer.'
    );
    res.json({ success: true, sector: 'hospitality', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Hospitality & Travel', framework: 'GDPR guest / Accommodation law / Transfer' });
  });
  return router;
};
