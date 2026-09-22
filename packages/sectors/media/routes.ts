import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();
  router.post('/moderation/due-diligence', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'media', useCase: 'dsa', inputs: { body: req.body || {} } },
      'Evaluate content moderation due diligence obligations under EU DSA Article 16.'
    );
    res.json({ success: true, sector: 'media', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.post('/ads/avms-eligibility', async (req: any, res: any) => {
    const result = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'media', useCase: 'avms', inputs: { body: req.body || {} } },
      'Check advertising/sponsorship eligibility under AVMS Directive compliance rules.'
    );
    res.json({ success: true, sector: 'media', score: result.result.score || 0, flags: result.result.flags || [], explanation: result.explanation });
  });
  router.get('/healthcheck', (_req: any, res: any) => {
    res.json({ success: true, module: 'Media, Streaming & Digital Services', framework: 'DSA 2022/2065 / AVMS 2018/1808 / GDPR media' });
  });
  return router;
};