import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/trace/batch', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'food', useCase: 'trace', inputs: { body: req.body || {} } },
      'Validate one-step-forward/one-step-back traceability for a food batch under EC 178/2002.'
    );
    res.json({ success: true, sector: 'food', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Food & Beverage Safety', framework: 'EC 178/2002 / FSMA / HACCP / EU 1169/2011 labelling' });
  });
  return router;
};