import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/records/consent', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'healthcare', useCase: 'consent', inputs: { body: req.body || {} } },
      'Evaluate consent adequacy for sensitive health data.'
    );
    res.json({ success: true, sector: 'healthcare', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Healthcare & Life Sciences', framework: 'HIPAA / GDPR Art.9 / EU MDR' });
  });
  return router;
};
