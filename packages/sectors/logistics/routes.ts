import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/cargo/security-scan', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'logistics', useCase: 'cargo', inputs: { body: req.body || {} } },
      'Screen a cargo consignment for AEO/CTPAT security clearance gaps.'
    );
    res.json({ success: true, sector: 'logistics', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Logistics & Freight Forwarding', framework: 'AEO / CTPAT / IMDG / EU Customs Code' });
  });
  return router;
};