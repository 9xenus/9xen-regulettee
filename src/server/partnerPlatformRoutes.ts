import { Router, Request, Response, NextFunction } from 'express';
import { PartnerPlatformService } from '../services/partnerPlatformService';
import { getDb } from '../db/sqlite';

export const partnerPlatformRouter = Router();

// Middleware: Authenticate partner from X-Client-Id / X-Client-Secret headers or Authorization Bearer
const authenticatePartnerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientId = (req.headers['x-client-id'] as string) || (req.query.client_id as string);
  const clientSecret = (req.headers['x-client-secret'] as string) || (req.query.client_secret as string);

  // Never allow unauthenticated access in production
  if (!clientId || !clientSecret) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ success: false, error: 'Missing partner credentials (x-client-id / x-client-secret headers required)' });
    }
    // In development only: allow a clearly-marked demo partner when DEV_AUTH_BYPASS is enabled
    if (!process.env.DEV_AUTH_BYPASS) {
      return res.status(401).json({ success: false, error: 'Missing partner credentials (x-client-id / x-client-secret headers required)' });
    }
    (req as any).partner = {
      id: 'prt_demo_psp',
      name: 'bKash Merchant Gateway (Demo)',
      type: 'psp',
      tier: 'actuator',
      scopes: ['INTEL_STATUS', 'INTEL_SCORE', 'SIGNAL_FRAUD', 'SIGNAL_PRODUCT', 'INTEL_WATCHLIST', 'ACTION_EXECUTE']
    };
    return next();
  }

  const auth = PartnerPlatformService.authenticatePartner(clientId, clientSecret);
  if (!auth.authenticated || !auth.partner) {
    return res.status(401).json({ success: false, error: auth.error || 'Unauthorized partner request' });
  }

  (req as any).partner = {
    ...auth.partner,
    scopes: auth.scopes || []
  };
  next();
};

// Scope-checking guard generator
const requireScope = (scope: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const partner = (req as any).partner;
    if (!partner || !partner.scopes || !partner.scopes.includes(scope)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Partner missing required data scope '${scope}'. Current tier: ${partner?.tier || 'basic'}`
      });
    }
    next();
  };
};

// 1. Partner Authentication Token / Scope Verification
partnerPlatformRouter.post('/auth/token', (req, res) => {
  const { client_id, client_secret } = req.body;
  if (!client_id || !client_secret) {
    return res.status(400).json({ success: false, error: 'client_id and client_secret are required' });
  }

  const auth = PartnerPlatformService.authenticatePartner(client_id, client_secret);
  if (!auth.authenticated) {
    return res.status(401).json({ success: false, error: auth.error });
  }

  res.json({
    success: true,
    partner_id: auth.partner?.id,
    partner_name: auth.partner?.name,
    tier: auth.partner?.tier,
    scopes: auth.scopes,
    token_type: 'Bearer',
    expires_in: 86400
  });
});

// 2. Inbound Signal Ingestion (POST /prt/v1/signals)
partnerPlatformRouter.post('/signals', authenticatePartnerMiddleware, requireScope('SIGNAL_FRAUD'), (req, res) => {
  const partner = (req as any).partner;
  const { entity_ref, entity_id, signal_type, description, evidence_summary, affected_users_estimate } = req.body;

  if (!signal_type || !description) {
    return res.status(400).json({ success: false, error: 'signal_type and description are required' });
  }

  const result = PartnerPlatformService.ingestSignal(partner.id, {
    entity_ref,
    entity_id,
    signal_type,
    description,
    evidence_summary,
    affected_users_estimate
  });

  res.json({
    success: true,
    ...result
  });
});

// 3. Outbound Scoped Trust & Status Query (GET /prt/v1/entities/:id/status)
partnerPlatformRouter.get('/entities/:id/status', authenticatePartnerMiddleware, requireScope('INTEL_STATUS'), (req, res) => {
  const partner = (req as any).partner;
  const entityId = req.params.id;

  const statusData = PartnerPlatformService.queryEntityStatus(entityId, partner.tier);
  res.json({
    success: true,
    data: statusData
  });
});

// 4. Batch Entity Status Check (POST /prt/v1/entities/batch-check)
partnerPlatformRouter.post('/entities/batch-check', authenticatePartnerMiddleware, requireScope('INTEL_STATUS'), (req, res) => {
  const partner = (req as any).partner;
  const { entity_ids } = req.body;

  if (!Array.isArray(entity_ids) || entity_ids.length === 0) {
    return res.status(400).json({ success: false, error: 'entity_ids array required (max 100)' });
  }

  const cappedList = entity_ids.slice(0, 100);
  const results = cappedList.map(id => PartnerPlatformService.queryEntityStatus(id, partner.tier));

  res.json({
    success: true,
    count: results.length,
    results
  });
});

// 5. Blind Salted Watchlist Match (POST /prt/v1/watchlist/match)
partnerPlatformRouter.post('/watchlist/match', authenticatePartnerMiddleware, requireScope('INTEL_WATCHLIST'), (req, res) => {
  const partner = (req as any).partner;
  const { salted_hashes, country_code } = req.body;

  if (!Array.isArray(salted_hashes) || salted_hashes.length === 0) {
    return res.status(400).json({ success: false, error: 'salted_hashes array required' });
  }

  const matchResults = PartnerPlatformService.matchBlindWatchlist(partner.id, salted_hashes, country_code || 'BD');
  res.json({
    success: true,
    ...matchResults
  });
});

// 6. Actuator Enforcement Execution (POST /prt/v1/actuator/execute)
partnerPlatformRouter.post('/actuator/execute', authenticatePartnerMiddleware, requireScope('ACTION_EXECUTE'), (req, res) => {
  const partner = (req as any).partner;
  const { order_ref, action_type, target_identifier, reason, reversal_endpoint } = req.body;

  if (!order_ref || !action_type || !target_identifier) {
    return res.status(400).json({ success: false, error: 'order_ref, action_type, and target_identifier required' });
  }

  const receipt = PartnerPlatformService.executeActuatorAction(partner.id, {
    order_ref,
    action_type,
    target_identifier,
    reason: reason || 'Statutory Enforcement Hold',
    reversal_endpoint
  });

  res.json({
    success: true,
    ...receipt
  });
});

// 7. Partner Portal Metrics & Reciprocity Score (GET /prt/v1/portal/metrics)
partnerPlatformRouter.get('/portal/metrics', (req, res) => {
  const db = getDb();
  try {
    let partners: any[] = [];
    let stats: any[] = [];
    let signals: any[] = [];

    try {
      partners = db.prepare('SELECT * FROM prt_partners ORDER BY created_at DESC').all();
      stats = db.prepare('SELECT * FROM prt_contribution_stats ORDER BY signals_sent DESC').all();
      signals = db.prepare('SELECT * FROM prt_signals ORDER BY created_at DESC LIMIT 25').all();
    } catch {
      partners = [];
      stats = [];
      signals = [];
    }

    res.json({
      success: true,
      partnerCount: partners.length,
      partners: partners.map((p: any) => ({
        ...p,
        country_scope: JSON.parse(p.country_scope_json || '[]'),
        agreement_refs: JSON.parse(p.agreement_refs_json || '[]'),
        purpose_declarations: JSON.parse(p.purpose_declarations_json || '[]')
      })),
      stats,
      recentSignals: signals.map((s: any) => ({
        ...s,
        raw_payload: JSON.parse(s.raw_payload_json || '{}'),
        normalized: JSON.parse(s.normalized_json || '{}'),
        triage: JSON.parse(s.triage_json || '{}')
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Self-Service Partner Onboarding
partnerPlatformRouter.post('/portal/onboard', (req, res) => {
  const { name, type, country_scope, tier, purpose_declarations } = req.body;
  if (!name || !type) {
    return res.status(400).json({ success: false, error: 'name and type are required' });
  }

  const result = PartnerPlatformService.onboardPartner({
    name,
    type,
    country_scope,
    tier,
    purpose_declarations
  });

  res.json({
    success: true,
    ...result
  });
});
