import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/csms/assess', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'automotive', useCase: 'csms', inputs: { body: req.body || {} } },
      'Assess vehicle cyber security management system readiness against UNECE R155/R156.'
    );
    res.json({ success: true, sector: 'automotive', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Automotive & Mobility', framework: 'UNECE WP.29 R155/R156 / Euro 7 / in-vehicle GDPR' });
  });
  return router;
};