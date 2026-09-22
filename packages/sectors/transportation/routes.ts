import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/adr/declare', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'transportation', useCase: 'adr', inputs: { body: req.body || {} } },
      'Validate dangerous goods declarations.'
    );
    res.json({ success: true, sector: 'transportation', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Transport & Logistics', framework: 'ADR / GDPR employee / Customs' });
  });
  return router;
};
