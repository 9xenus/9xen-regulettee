/**
 * 9XEN_REGULETTEE — ENTERPRISE SSO PROVISIONER (SaaS Admin)
 * CRUD over enterprise_sso_configs + AI risk-scored AI-SSO login launcher.
 * Returns a ready-to-run SSO login payload the front-end can post or render.
 * Mounted at /api/v1/saas-admin/sso behind requireAuthRoles(['ADMIN','SUPER_ADMIN']).
 */
import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/sqlite.js';
import { requireAuthRoles } from '../middleware/auth.js';

export const ssoProvisionerRouter = Router();
ssoProvisionerRouter.use(requireAuthRoles(['ADMIN', 'SUPER_ADMIN']));

const nowISO = () => new Date().toISOString();

// AI SSO risk verdict — deterministic device/context heuristics
export function aiSsoRisk(context: { ip?: string; userAgent?: string; hour?: number } = {}) {
  const ua = (context.userAgent || '').toLowerCase();
  const isAutomation = /headless|phantomjs|selenium|puppeteer| curl\//i.test(ua);
  const isKnownBrowser = /chrome|firefox|safari|edg|opera|mobile/i.test(ua);
  const hour = context.hour ?? new Date().getHours();
  const nightLogon = hour >= 23 || hour < 5;
  const score = (isAutomation ? 55 : 0) + (!isKnownBrowser ? 18 : 0) + (nightLogon ? 9 : 0);
  const verdict = score >= 55 ? 'STEP_UP' : score >= 20 ? 'VERIFY' : 'ALLOW';
  return { score, verdict, signals: { automation: isAutomation, knownAgent: isKnownBrowser, nightLogon, sourceIp: context.ip || 'internal' }, evaluatedAt: nowISO() };
}

// GET / — list all enterprise SSO configs
ssoProvisionerRouter.get('/', (_req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT id, tenant_id, idp_entity_id, idp_sso_url, sp_entity_id, sp_acs_url, is_active, created_at FROM enterprise_sso_configs ORDER BY created_at DESC').all() as any[];
    res.json({ success: true, configs: rows, count: rows.length });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /:tenantId — single config + AI SSO readiness
ssoProvisionerRouter.get('/:tenantId', (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM enterprise_sso_configs WHERE tenant_id = ?').get(req.params.tenantId) as any;
    if (!row) return res.status(404).json({ success: false, error: 'No SSO config for tenant' });
    res.json({ success: true, config: { ...row, riskModel: aiSsoRisk() } });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// POST / — create or upsert config
ssoProvisionerRouter.post('/', (req, res) => {
  try {
    const db = getDb();
    const b = req.body || {};
    const tenantId = String(b.tenantId || '').trim();
    if (!tenantId || !b.idpSsoUrl) return res.status(400).json({ success: false, error: 'tenantId and idpSsoUrl are required.' });
    const existing = db.prepare('SELECT id FROM enterprise_sso_configs WHERE tenant_id = ?').get(tenantId) as any;
    const spEntityId = b.spEntityId || 'https://sovereignty-compliance.9xen.eu/sp/metadata';
    const acsUrl = b.spAcsUrl || 'http://localhost:3000/api/auth/sso/callback';
    if (existing) {
      db.prepare(`UPDATE enterprise_sso_configs SET idp_entity_id = ?, idp_sso_url = ?, idp_x509_cert = ?, sp_entity_id = ?, sp_acs_url = ?, is_active = ? WHERE tenant_id = ?`)
        .run(b.idpEntityId || tenantId, b.idpSsoUrl, b.idpX509Cert || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0G6zX2...', spEntityId, acsUrl, b.isActive === false || b.isActive === 0 ? 0 : 1, tenantId);
      return res.json({ success: true, message: `SSO config for ${tenantId} updated.` });
    }
    db.prepare(`INSERT INTO enterprise_sso_configs (id, tenant_id, idp_entity_id, idp_sso_url, idp_x509_cert, sp_entity_id, sp_acs_url, is_active) VALUES (?,?,?,?,?,?,?,?)`)
      .run(`sso_${crypto.randomBytes(3).toString('hex')}`, tenantId, b.idpEntityId || tenantId, b.idpSsoUrl, b.idpX509Cert || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0G6zX2...', spEntityId, acsUrl, b.isActive === false || b.isActive === 0 ? 0 : 1);
    res.status(201).json({ success: true, message: `SSO config provisioned for ${tenantId}.` });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// DELETE /:tenantId
ssoProvisionerRouter.delete('/:tenantId', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM enterprise_sso_configs WHERE tenant_id = ?').run(req.params.tenantId);
    res.json({ success: true, message: 'SSO config removed.' });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// POST /:tenantId/toggle — enable/disable
ssoProvisionerRouter.post('/:tenantId/toggle', (req, res) => {
  try {
    const db = getDb();
    const b = req.body || {};
    const active = b.isActive === true || b.isActive === 1 ? 1 : 0;
    db.prepare('UPDATE enterprise_sso_configs SET is_active = ? WHERE tenant_id = ?').run(active, req.params.tenantId);
    res.json({ success: true, message: `SSO ${active ? 'enabled' : 'disabled'} for ${req.params.tenantId}.` });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// GET /:tenantId/login — AI-SSO login launcher for a service section
ssoProvisionerRouter.get('/:tenantId/login', async (req, res) => {
  try {
    const db = getDb();
    const tenantId = req.params.tenantId;
    const service = String(req.query.service || 'enterprise-services');
    const cfg = db.prepare('SELECT * FROM enterprise_sso_configs WHERE tenant_id = ? AND is_active = 1').get(tenantId) as any;
    if (!cfg) return res.status(404).json({ success: false, error: `No active SSO for tenant ${tenantId}` });
    const risk = aiSsoRisk({ ip: (req.headers['x-forwarded-for'] as string) || req.ip, userAgent: req.headers['user-agent'] });
    const requestId = `_saml_${Math.random().toString(36).substring(2, 15)}`;
    const issueInstant = nowISO();
    const authnRequestXml = `<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="${requestId}" Version="2.0" IssueInstant="${issueInstant}" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" AssertionConsumerServiceURL="${cfg.sp_acs_url}"><saml:Issuer>${cfg.sp_entity_id}</saml:Issuer><samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/></samlp:AuthnRequest>`;
    const encodedRequest = Buffer.from(authnRequestXml).toString('base64');
    const relayState = `relay|${tenantId}|${service}|${Date.now()}`;
    res.json({
      success: true,
      tenantId, service,
      ssoTargetUrl: cfg.idp_sso_url,
      samlRequest: encodedRequest,
      relayState,
      aiRisk: risk,
      postActionFormHtml: `<form id="saml-redirect-form" method="POST" action="${cfg.idp_sso_url}"><input type="hidden" name="SAMLRequest" value="${encodedRequest}" /><input type="hidden" name="RelayState" value="${relayState}" /><script>document.getElementById("saml-redirect-form").submit();</script></form>`,
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

export default ssoProvisionerRouter;