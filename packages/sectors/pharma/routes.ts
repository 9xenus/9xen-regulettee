import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/pv/report', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'pharma', useCase: 'pv', inputs: { body: req.body || {} } },
      'Validate serious adverse reaction timeframe.'
    );
    res.json({ success: true, sector: 'pharma', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Pharmaceuticals & Clinical', framework: 'ICH GCP / EU CT Reg / Pharmacovigilance' });
  });
  return router;
};
