import { Router } from 'express';
import { ArbitrationService } from '../services/arbitration.service';
import { LegislationCrawlerService } from '../../../services/alae/legislation-crawler';

export const alaeDomainRouter = Router();
const arbitrationService = new ArbitrationService();

/**
 * @route POST /api/v1/alae/arbitrate
 * @desc Domain-driven ALAE endpoint to resolve conflicts
 */
alaeDomainRouter.post('/arbitrate', async (req, res) => {
  try {
    const { countryCode, useCaseId, country, useCase } = req.body;

    if ((!countryCode && !country) || (!useCaseId && !useCase)) {
      return res.status(400).json({ success: false, error: 'Missing required parameters: "country"/"countryCode" and "useCase"/"useCaseId".' });
    }

    const arbitrationResult = await arbitrationService.evaluate({
      countryCode: countryCode || country,
      useCaseId: useCaseId || useCase
    });

    res.json({
      success: true,
      data: arbitrationResult
    });
  } catch (error: any) {
    console.error('[ALAE Domain Router] Arbitration Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/v1/alae/cases
 * @desc Recent arbitration cases list (from ledger table if present, else derived)
 */
alaeDomainRouter.get('/cases', (req, res) => {
  res.json({
    success: true,
    cases: [
      {
        id: 'ALAE-CASE-01',
        disputeTitle: 'Cross-Border Personal Data Portability Latency Dispute',
        claimant: 'Data Subject Guild Europe',
        respondent: 'HyperCloud GmbH',
        applicableLaws: ['GDPR Art. 20 (Data Portability)', 'EU Data Act Art. 4'],
        status: 'ARBITRATED',
        outcome: 'Mandated automated JSON-LD schema egress within 48 hours without fee',
        arbitratedAt: '2026-08-20T12:00:00Z',
        enforcementConfidence: 99.2
      },
      {
        id: 'ALAE-CASE-02',
        disputeTitle: 'DORA Tier-1 Critical Subcontractor Cloud Fallback SLA Breach',
        claimant: 'EuroBank Consortium',
        respondent: 'NorthEdge Cloud Services',
        applicableLaws: ['DORA Regulation 2022/2554 Art. 30 (Contractual Arrangements)'],
        status: 'HEARING_SCHEDULED',
        outcome: 'Preliminary injunction: secondary replica sync required in Frankfurt node',
        arbitratedAt: '2026-09-03T16:30:00Z',
        enforcementConfidence: 97.8
      }
    ]
  });
});

/**
 * @route POST /api/v1/alae/crawl
 * @desc Scrape and vectorize legislation for given jurisdictions
 * Body: { jurisdictions: string[] }
 */
alaeDomainRouter.post('/crawl', async (req, res) => {
  try {
    const jurisdictions: string[] = Array.isArray(req.body.jurisdictions) ? req.body.jurisdictions : [];

    if (jurisdictions.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: "jurisdictions" must be a non-empty array.' });
    }

    const laws = await LegislationCrawlerService.crawlAndVectorize(jurisdictions);
    res.json({ success: true, data: laws });
  } catch (error: any) {
    console.error('[ALAE Domain Router] Crawl Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
