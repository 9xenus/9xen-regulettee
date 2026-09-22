import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/traceability/batch', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'agriculture', useCase: 'traceability', inputs: { body: req.body || {} } },
      'Validate full batch traceability chain.'
    );
    res.json({ success: true, sector: 'agriculture', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Agriculture & Food Safety', framework: 'Food safety / EFSA / Traceability' });
  });
  return router;
};
