import { Router, type Request, type Response } from 'express';
import { RateLimiterService } from './rateLimiterService.js';

export const rateLimitingRouter = Router();

rateLimitingRouter.get('/status', (_req: Request, res: Response) => {
  try {
    const metrics = RateLimiterService.getMetrics();
    res.json({ ...metrics, success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

rateLimitingRouter.get('/audit-logs', (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const data = RateLimiterService.getAuditLogs(limit);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

rateLimitingRouter.put('/policies/:policyId', (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    const ok = RateLimiterService.updatePolicy(policyId, req.body || {});
    if (!ok) return res.status(404).json({ success: false, error: `Policy '${policyId}' not found` });
    res.json({ success: true, updated: true, policyId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

rateLimitingRouter.post('/jail', (req: Request, res: Response) => {
  try {
    const { ip, reason = 'Manual quarantine by security operator', durationMinutes = 60 } = req.body || {};
    if (!ip) return res.status(400).json({ success: false, error: 'ip is required' });
    const ok = RateLimiterService.jailIp(String(ip), String(reason), Number(durationMinutes) || 60, true);
    res.json({ success: true, message: ok ? `IP ${ip} quarantined successfully.` : `IP ${ip} is already quarantined.`, jailed: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

rateLimitingRouter.post('/unjail', (req: Request, res: Response) => {
  try {
    const { ip } = req.body || {};
    if (!ip) return res.status(400).json({ success: false, error: 'ip is required' });
    const ok = RateLimiterService.unjailIp(String(ip));
    res.json({ success: true, message: ok ? `IP ${ip} released from quarantine.` : `IP ${ip} was not quarantined.`, unjailed: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

rateLimitingRouter.post('/whitelist', (req: Request, res: Response) => {
  try {
    const { ip, description = 'Trusted network node' } = req.body || {};
    if (!ip) return res.status(400).json({ success: false, error: 'ip is required' });
    const ok = RateLimiterService.whitelistIp(String(ip), String(description));
    res.json({ success: true, message: ok ? `IP ${ip} whitelisted successfully.` : `IP ${ip} was already whitelisted.`, whitelisted: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

rateLimitingRouter.delete('/whitelist/:ip', (req: Request, res: Response) => {
  try {
    const ok = RateLimiterService.removeWhitelistIp(String(req.params.ip));
    res.json({ success: true, message: ok ? `IP ${req.params.ip} removed from whitelist.` : `IP ${req.params.ip} was not whitelisted.`, removed: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

rateLimitingRouter.post('/simulate-attack', (req: Request, res: Response) => {
  try {
    const { targetPath = '/api/v1/saas-admin/entitlements', simulatedIp, attackCount = 10 } = req.body || {};
    if (!simulatedIp) return res.status(400).json({ success: false, error: 'simulatedIp is required' });
    const data = RateLimiterService.simulateBruteForceAttack(String(targetPath), String(simulatedIp), Number(attackCount) || 10);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

rateLimitingRouter.post('/reset-metrics', (_req: Request, res: Response) => {
  try {
    RateLimiterService.resetMetrics();
    res.json({ success: true, message: 'Rate-limiting counters reset successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});