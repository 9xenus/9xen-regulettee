import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/vigilance/incident-classify', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'medical-devices', useCase: 'vigilance', inputs: { body: req.body || {} } },
      'Classify a medical device adverse incident per EU MDR reportability timelines.'
    );
    res.json({ success: true, sector: 'medical-devices', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Medical Devices & IVD', framework: 'EU MDR 2017/745 / IVDR 2017/746 / ISO 13485' });
  });
  return router;
};