import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/occurrences/notify', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'cyber', useCase: 'nis2', inputs: { body: req.body || {} } },
      'Classify a cyber incident for NIS2 Article 23 notification (significant vs major vs critical).'
    );
    res.json({ success: true, sector: 'cyber', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.post('/dora/ict-risk', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'cyber', useCase: 'dora', inputs: { body: req.body || {} } },
      'Assess ICT third-party concentration risk under DORA.'
    );
    res.json({ success: true, sector: 'cyber', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Cybersecurity & NIS2', framework: 'NIS2 2022/2555 / DORA 2022/2554 / ISO 27001' });
  });
  return router;
};