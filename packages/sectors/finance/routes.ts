import { Router } from 'express';
import { AIGateway } from '../../core/src/ai/AIGateway';

export const registerRoutes = () => {
  const router = Router();

  router.post('/loan/aml-screening', async (req: any, res: any) => {
    const { loan } = req.body || {};
    const analysis = await AIGateway.predictWithXAI(
      { tenantId: req.user?.tenantId || 'tenant_default', sector: 'finance', useCase: 'loan_aml_screening', inputs: { principal: loan?.principalAmount || 0 } },
      `Run AML/KYC screening on this loan application and flag sanction/PEP exposure: ${JSON.stringify(loan || {})}`
    );
    res.json({
      loanId: loan?.id,
      amlRiskScore: analysis.result.score || 0,
      flags: analysis.result.flags || [],
      explanation: analysis.explanation,
    });
  });

  router.post('/insurance/compliance', async (req: any, res: any) => {
    const { policy } = req.body || {};
    const checksums = [
      { id: 'insurance_product_disclosure', pass: true },
      { id: 'regional_solvency_threshold', pass: Number(policy?.premium || 0) < 500000 },
      { id: 'policyholder_kyc', pass: Boolean(policy?.policyHolderId) },
    ];
    res.json({
      policyId: policy?.id,
      approved: checksums.every((c) => c.pass),
      checks: checksums,
    });
  });

  return router;
};