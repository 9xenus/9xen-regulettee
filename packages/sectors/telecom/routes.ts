import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/eprivacy/retention', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'telecom', useCase: 'retention', inputs: { body: req.body || {} } },
      'Verify data retention window is EU-compliant.'
    );
    res.json({ success: true, sector: 'telecom', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Telecom & Media', framework: 'ePrivacy / GDPR metadata / EECC' });
  });
  return router;
};
