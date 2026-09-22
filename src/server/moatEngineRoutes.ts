import { Router, Request, Response } from 'express';
import { moatEngineService } from '../services/moatEngineService';

export const moatEngineRouter = Router();

// 1. Regulatory Change Intelligence
moatEngineRouter.get('/regulatory-feed', (req: Request, res: Response) => {
  try {
    const feed = moatEngineService.getRegulatoryChangeIntelligence();
    res.json({ success: true, count: feed.length, data: feed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Cross-Jurisdiction Conflict Resolution
moatEngineRouter.post('/resolve-conflict', (req: Request, res: Response) => {
  try {
    const { lawA = 'NIS2 Directive Art. 21', lawB = 'US CISA Circular-04' } = req.body || {};
    const resolution = moatEngineService.resolveJurisdictionConflict(lawA, lawB);
    res.json({ success: true, data: resolution });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Generate Audit Evidence Package
moatEngineRouter.post('/generate-audit-package', (req: Request, res: Response) => {
  try {
    const { tenantId = 'TENANT-GLOBAL-SOVEREIGN' } = req.body || {};
    const pkg = moatEngineService.generateAuditGradeEvidencePackage(tenantId);
    res.json({ success: true, data: pkg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Accreditation Readiness
moatEngineRouter.get('/accreditations', (req: Request, res: Response) => {
  try {
    const accreditations = moatEngineService.getAccreditationReadiness();
    res.json({ success: true, count: accreditations.length, data: accreditations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Autonomous Remediation Actions
moatEngineRouter.get('/remediations', (req: Request, res: Response) => {
  try {
    const actions = moatEngineService.getRemediationActions();
    res.json({ success: true, count: actions.length, data: actions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Cross-Tenant Benchmark
moatEngineRouter.get('/benchmark', (req: Request, res: Response) => {
  try {
    const benchmark = moatEngineService.getCrossTenantBenchmark();
    res.json({ success: true, data: benchmark });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Data Gravity Trajectory
moatEngineRouter.get('/trajectory', (req: Request, res: Response) => {
  try {
    const trajectory = moatEngineService.getHistoricalRiskTrajectory();
    res.json({ success: true, count: trajectory.length, data: trajectory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
