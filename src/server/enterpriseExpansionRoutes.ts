import { Router, Request, Response } from 'express';
import { expandedFrameworksService } from '../services/expandedFrameworksService';
import { cloudConnectorsService } from '../services/cloudConnectorsService';
import { legalContractDraftingService } from '../services/legalContractDraftingService';
import { copilotAndDossierService } from '../services/copilotAndDossierService';

export const enterpriseExpansionRouter = Router();

// ==========================================
// 1. Expanded Regulatory Frameworks Routes
// ==========================================
enterpriseExpansionRouter.get('/frameworks', (req: Request, res: Response) => {
  try {
    const list = expandedFrameworksService.getExpandedFrameworks();
    res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseExpansionRouter.get('/frameworks/:code/alignment', (req: Request, res: Response) => {
  try {
    const result = expandedFrameworksService.assessJurisdictionAlignment(req.params.code);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. Cloud Connectors & Webhooks Routes
// ==========================================
enterpriseExpansionRouter.get('/connectors', (req: Request, res: Response) => {
  try {
    const connectors = cloudConnectorsService.getConnectors();
    res.json({ success: true, count: connectors.length, data: connectors });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseExpansionRouter.get('/connectors/events', (req: Request, res: Response) => {
  try {
    const events = cloudConnectorsService.getRecentEvents();
    res.json({ success: true, count: events.length, data: events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ingress webhook endpoint for AWS S3
enterpriseExpansionRouter.post('/webhooks/aws-s3', (req: Request, res: Response) => {
  try {
    const event = cloudConnectorsService.ingestWebhook('AWS_S3', req.body || { event: 's3.BucketPolicyUpdated' });
    res.json({ success: true, received: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ingress webhook endpoint for Cloudflare
enterpriseExpansionRouter.post('/webhooks/cloudflare', (req: Request, res: Response) => {
  try {
    const event = cloudConnectorsService.ingestWebhook('CLOUDFLARE', req.body || { event: 'waf.security_alert' });
    res.json({ success: true, received: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ingress webhook endpoint for GitHub
enterpriseExpansionRouter.post('/webhooks/github', (req: Request, res: Response) => {
  try {
    const event = cloudConnectorsService.ingestWebhook('GITHUB', req.body || { event: 'dependabot_alert' });
    res.json({ success: true, received: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. Automated Legal Contract Drafting Routes
// ==========================================
enterpriseExpansionRouter.get('/contracts/templates', (req: Request, res: Response) => {
  try {
    const templates = legalContractDraftingService.getAvailableTemplates();
    res.json({ success: true, data: templates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseExpansionRouter.post('/contracts/draft', (req: Request, res: Response) => {
  try {
    const draftRequest = req.body || {
      contractType: 'GLOBAL_DPA',
      controllerEntity: 'Apex Global Financial Services Ltd',
      processorEntity: 'Regulettee Sovereign CaaS Enclave',
      applicableJurisdictions: ['Singapore', 'Switzerland', 'Australia', 'EU'],
      governingLaw: 'Singapore International Arbitration Centre (SIAC)',
      pqcSignatureEnabled: true,
      dataCategories: ['Customer Identifiers', 'Encrypted Telemetry', 'KYC Attributes'],
      securityMeasures: ['AES-256-GCM', 'NIST-Kyber-1024 PQC', 'Zero-Cross-Border-Leaking']
    };

    const generated = legalContractDraftingService.generateContract(draftRequest);
    res.json({ success: true, data: generated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. AI Compliance Copilot & Executive Dossier Routes
// ==========================================
enterpriseExpansionRouter.post('/copilot/chat', async (req: Request, res: Response) => {
  try {
    const { message = '' } = req.body || {};
    const response = await copilotAndDossierService.queryCopilot(message);
    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

enterpriseExpansionRouter.post('/dossier/generate', async (req: Request, res: Response) => {
  try {
    const { tenantId = 'TENANT-SOVEREIGN-GLOBAL', targetAuditor = 'BIG_4_AUDITOR' } = req.body || {};
    const dossier = copilotAndDossierService.generateExecutiveDossier(tenantId, targetAuditor);
    res.json({ success: true, data: dossier });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

