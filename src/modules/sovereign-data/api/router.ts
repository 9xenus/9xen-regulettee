import { Router } from 'express';
import { SovereignDataGraphService } from '../services/graphService';

export const sovereignDataRouter = Router();
const graphService = new SovereignDataGraphService();

sovereignDataRouter.get('/providers', async (req, res) => {
  try {
    const providers = await graphService.getCloudProviders();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cloud providers' });
  }
});

sovereignDataRouter.get('/data-flows', async (req, res) => {
  try {
    const flows = await graphService.getDataFlows();
    res.json(flows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data flows' });
  }
});

sovereignDataRouter.post('/evidence/:id/verify', async (req, res) => {
  try {
    const result = await graphService.verifyEvidence(req.params.id);
    res.json({ verified: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify evidence' });
  }
});
