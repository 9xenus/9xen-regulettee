import { Router } from 'express';

export const dbIntegrationRouter = Router();

dbIntegrationRouter.get('/api/v1/db/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});
