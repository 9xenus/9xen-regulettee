import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/consent/minors', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'education', useCase: 'consent', inputs: { body: req.body || {} } },
      'Validate age-appropriate consent machinery for minors.'
    );
    res.json({ success: true, sector: 'education', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Education & EdTech', framework: 'GDPR Art.8 / FERPA / COPPA' });
  });
  return router;
};
