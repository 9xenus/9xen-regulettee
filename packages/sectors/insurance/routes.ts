import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/solvency/report', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'insurance', useCase: 'solvency', inputs: { body: req.body || {} } },
      'Assess capital adequacy ratio against regulator thresholds.'
    );
    res.json({ success: true, sector: 'insurance', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Insurance & Actuarial', framework: 'Solvency II / IFRS17 / IDD' });
  });
  return router;
};
