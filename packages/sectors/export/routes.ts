import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/sanctions/screen', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'export', useCase: 'sanctions', inputs: { body: req.body || {} } },
      'Screen a trade entity against OFAC, UN, and EU sanctions lists.'
    );
    res.json({ success: true, sector: 'export', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Export & Trade Compliance', framework: 'EAR/ITAR / OFAC / EU Dual-Use Reg 2021/821 / FCPA' });
  });
  return router;
};