import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/tailings/risk-classify', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'mining', useCase: 'gistm', inputs: { body: req.body || {} } },
      'Classify tailings storage facility risk under GISTM consequence categories.'
    );
    res.json({ success: true, sector: 'mining', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Mining & Extractives', framework: 'GISTM / OECD Due Diligence / EU Conflict Minerals Reg 2017/821 / IFC EHS' });
  });
  return router;
};