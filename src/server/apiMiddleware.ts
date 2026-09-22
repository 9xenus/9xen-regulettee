import type { Plugin } from 'vite';
import { randomBytes } from '../utils/cryptoPolyfill';
let Database: any;
if (typeof window === 'undefined') {
  try {
    if (typeof require !== 'undefined') {
      Database = require('better-sqlite3');
    }
  } catch {}
  if (!Database) {
    import('better-sqlite3').then(sqlite => {
      Database = sqlite.default || sqlite;
    }).catch(() => {});
  }
}
import path from 'path';
import { fetchRegulatoryIntelligence } from '../services/regulatoryIntelligenceService';
import { getAuditTrailEvents, logAuditTrailEvent } from '../services/auditTrailService';
import {
  generateRegulatoryNarrative,
  analyzeIncidentCopilot,
  storedDrafts,
  analyzeMicaTransactions,
  createMicaSAR,
  storedMicaSARs,
  storedDsarRequests,
  createDSAR,
  fulfillDSAR,
  verifyDSARIdentity,
  storedAiDossiers,
  generateAiAnnexIvDossier,
  storedClearingRecords,
  initiateCentralBankSettlement,
  simulateTiaTransfer,
  generateSccAgreement,
  executeAiRedTeamingAttack,
  storedKillswitchState,
  updateKillswitchAction,
  storedClientCases,
  requestCaseHumanReview
} from './geminiService';

import { getDb } from '../db/sqlite';

function getDatabase() {
  return getDb();
}

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

export function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'regtech-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || '';
        if (!urlStr.startsWith('/api/')) {
          return next();
        }

        const url = new URL(urlStr, 'http://localhost:3000');
        const pathname = url.pathname;
        const method = req.method?.toUpperCase() || 'GET';

        res.setHeader('Content-Type', 'application/json');

        const database = getDatabase();

        try {
          // 1. CaaS Addons endpoint (client and admin)
          if ((pathname === '/api/v1/caas/addons' || pathname === '/api/v1/admin/caas-marketplace/addons') && method === 'GET') {
            const tenantId = url.searchParams.get('tenantId') || 'org_1';
            let addons = [];
            if (database) {
              try {
                const rows = database.prepare('SELECT * FROM caas_addons').all();
                addons = rows.map((r: any) => ({
                  id: r.id,
                  category: r.category,
                  name: r.name,
                  actId: r.act_id,
                  desc: r.description,
                  price: r.price,
                  score: r.score,
                  colorClass: r.color_class,
                  icon: r.icon,
                  isActiveGlobally: Boolean(r.is_active_globally),
                  subscriptionStatus: 'active',
                  endpointUrl: r.endpoint_url,
                  apiKey: r.api_key,
                  configSchema: JSON.parse(r.config_schema || '[]'),
                  configValues: {}
                }));
              } catch (err) {
                console.error('Error querying caas_addons:', err);
              }
            }

            if (addons.length === 0) {
              addons = getDefaultAddons();
            }

            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, addons }));
          }

          // POST /api/v1/admin/caas-marketplace/addons (Create or Update)
          if (pathname === '/api/v1/admin/caas-marketplace/addons' && method === 'POST') {
            const body = await readJsonBody(req);
            const { id, category, name, act_id, actId, description, price, packageDetails, package_details, is_active_globally, isActiveGlobally, colorClass, color_class } = body;
            const finalActId = act_id || actId || 'gdpr';
            const finalPkgDetails = JSON.stringify(packageDetails || package_details || {});
            const finalColorClass = color_class || colorClass || 'bg-slate-100 text-slate-700 border-slate-200';
            const finalIsActive = (isActiveGlobally !== undefined) ? (isActiveGlobally ? 1 : 0) : ((is_active_globally !== undefined) ? (is_active_globally ? 1 : 0) : 0);

            if (database) {
              try {
                database.prepare(`
                  INSERT INTO caas_addons (id, category, name, act_id, description, price, package_details, color_class, is_active_globally)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO UPDATE SET
                    category = excluded.category,
                    name = excluded.name,
                    act_id = excluded.act_id,
                    description = excluded.description,
                    price = excluded.price,
                    package_details = excluded.package_details,
                    color_class = excluded.color_class
                `).run(id, category, name, finalActId, description, price, finalPkgDetails, finalColorClass, finalIsActive);
              } catch (err: any) {
                console.error('[SQLite CaaS Save Error]:', err);
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, addon: { id, name, category } }));
          }

          // PATCH /api/v1/admin/caas-marketplace/addons/:id/toggle (Single Toggle)
          if (pathname.startsWith('/api/v1/admin/caas-marketplace/addons/') && pathname.endsWith('/toggle') && (method === 'PATCH' || method === 'POST')) {
            const parts = pathname.split('/');
            const id = parts[parts.length - 2];
            const body = await readJsonBody(req);
            const enabled = body.enabled !== undefined ? body.enabled : body.isEnabled;
            const finalVal = enabled ? 1 : 0;

            if (database) {
              try {
                database.prepare('UPDATE caas_addons SET is_active_globally = ? WHERE id = ?').run(finalVal, id);
              } catch (err: any) {
                console.error('[SQLite CaaS Toggle Error]:', err);
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, id, isActiveGlobally: enabled }));
          }

          // PATCH/POST /api/v1/admin/caas-marketplace/addons/batch-toggle (Batch Toggle)
          if (pathname === '/api/v1/admin/caas-marketplace/addons/batch-toggle' && (method === 'PATCH' || method === 'POST')) {
            const body = await readJsonBody(req);
            const ids = Array.isArray(body.ids) ? body.ids : (Array.isArray(body.addonIds) ? body.addonIds : []);
            const enabled = body.enabled !== undefined ? body.enabled : body.isEnabled;
            const finalVal = enabled ? 1 : 0;

            if (database && ids.length > 0) {
              try {
                const stmt = database.prepare('UPDATE caas_addons SET is_active_globally = ? WHERE id = ?');
                for (const id of ids) {
                  stmt.run(finalVal, id);
                }
              } catch (err: any) {
                console.error('[SQLite CaaS Batch Toggle Error]:', err);
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, count: ids.length, isEnabled: enabled }));
          }

          // DELETE /api/v1/admin/caas-marketplace/addons/:id (Single Delete)
          if (pathname.startsWith('/api/v1/admin/caas-marketplace/addons/') && method === 'DELETE') {
            const parts = pathname.split('/');
            const id = parts[parts.length - 1];

            if (database) {
              try {
                database.prepare('DELETE FROM caas_addons WHERE id = ?').run(id);
              } catch (err: any) {
                console.error('[SQLite CaaS Delete Error]:', err);
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, id }));
          }

          // POST/DELETE /api/v1/admin/caas-marketplace/addons/batch-delete (Batch Delete)
          if (pathname === '/api/v1/admin/caas-marketplace/addons/batch-delete' && (method === 'POST' || method === 'DELETE')) {
            const body = await readJsonBody(req);
            const ids = Array.isArray(body.ids) ? body.ids : (Array.isArray(body.addonIds) ? body.addonIds : []);

            if (database && ids.length > 0) {
              try {
                const stmt = database.prepare('DELETE FROM caas_addons WHERE id = ?');
                for (const id of ids) {
                  stmt.run(id);
                }
              } catch (err: any) {
                console.error('[SQLite CaaS Batch Delete Error]:', err);
                res.statusCode = 500;
                return res.end(JSON.stringify({ success: false, error: err.message }));
              }
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, count: ids.length }));
          }

          // 2. Addon Subscription toggle
          if (pathname.startsWith('/api/v1/caas/tenants/') && pathname.includes('/subscriptions/') && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, message: 'Subscription updated' }));
          }

          // 3. Global CaaS Oversight
          if (pathname === '/api/v1/admin/global-caas-oversight') {
            let totalTenants = 1248;
            if (database) {
              try {
                const count = database.prepare('SELECT COUNT(*) as c FROM tenants').get();
                if (count?.c) totalTenants = count.c * 178; // scaled for demo display
              } catch {}
            }

            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              stats: {
                total_tenants: totalTenants.toLocaleString(),
                avg_readiness_score: 94.2,
                active_addons: 23,
                security_posture: 'OPTIMAL',
                total_scans: 18450
              },
              addonStats: [
                { status: 'ACTIVE', count: 18 },
                { status: 'TRIAL', count: 4 },
                { status: 'PENDING REVIEW', count: 1 },
                { status: 'DEPRECATED', count: 0 }
              ]
            }));
          }

          // 4. Global B2G Oversight
          if (pathname === '/api/v1/admin/global-b2g-oversight') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              inquiries: [
                { priority: 'urgent', count: 3 },
                { priority: 'standard', count: 5 }
              ],
              sandbox: [
                { count: 8 }
              ],
              filings: [
                { status: 'submitted', count: 14 },
                { status: 'approved', count: 42 }
              ]
            }));
          }

          // 5. Global CaaS Operations
          if (pathname === '/api/v1/admin/global-caas-operations') {
            let operations: any[] = [];
            if (database) {
              try {
                const rows = database.prepare('SELECT * FROM caas_operations ORDER BY started_at DESC LIMIT 20').all();
                if (rows && rows.length > 0) {
                  operations = rows.map((r: any) => ({
                    ...r,
                    tenant_name: r.tenant_id === 'org_1' ? 'Acme Europe SA' : r.tenant_id
                  }));
                }
              } catch {}
            }

            if (operations.length === 0) {
              operations = [
                {
                  id: 'op-101',
                  tenant_id: 'org_1',
                  tenant_name: 'Acme Europe SA',
                  operation_type: 'KYC_RE_VERIFICATION',
                  status: 'COMPLETED',
                  result_summary: 'Passed with 0 anomalies across 12 AML watchlists',
                  started_at: '2026-09-03 10:15:00',
                  completed_at: '2026-09-03 10:15:04'
                },
                {
                  id: 'op-102',
                  tenant_id: 'org_1',
                  tenant_name: 'Acme Europe SA',
                  operation_type: 'AI_ACT_ANNEX_IV_SCAN',
                  status: 'COMPLETED',
                  result_summary: 'Technical documentation audit certified compliant',
                  started_at: '2026-09-03 09:40:00',
                  completed_at: '2026-09-03 09:40:12'
                },
                {
                  id: 'op-103',
                  tenant_id: 'org_2',
                  tenant_name: 'Fintech Global Payments',
                  operation_type: 'DORA_ICT_STRESS_TEST',
                  status: 'IN_PROGRESS',
                  result_summary: 'Simulating sovereign failover to Frankfurt data center',
                  started_at: '2026-09-03 11:00:00',
                  completed_at: null
                }
              ];
            }

            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, operations }));
          }

          // 6. Tenants List
          if (pathname === '/api/v1/tenants' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              tenants: [
                {
                  id: "org_1",
                  name: "Acme Corporation Europe",
                  region: "EU-CENTRAL-1",
                  status: "ACTIVE",
                  tier: "Enterprise",
                  phase: "Production Phase 3",
                  complianceHealth: 98,
                  riskScore: "LOW"
                },
                {
                  id: "org_2",
                  name: "Stark Industries GmbH",
                  region: "EU-WEST-1",
                  status: "ACTIVE",
                  tier: "Pro",
                  phase: "Production",
                  complianceHealth: 92,
                  riskScore: "MEDIUM"
                },
                {
                  id: "org_3",
                  name: "Global Finance Corp",
                  region: "EU-CENTRAL-1",
                  status: "SUSPENDED",
                  tier: "Enterprise",
                  phase: "Audit Underway",
                  complianceHealth: 64,
                  riskScore: "HIGH"
                },
                {
                  id: "org_4",
                  name: "Beta Innovations B.V.",
                  region: "EU-CENTRAL-1",
                  status: "ONBOARDING",
                  tier: "Pro",
                  phase: "Phase 1 - Data Mapping",
                  complianceHealth: 85,
                  riskScore: "MEDIUM"
                }
              ]
            }));
          }

          // 6b. Tenant Health
          if (pathname === '/api/v1/tenants/health') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              tenantId: 'org_1',
              tenantName: 'Acme Corporation Europe',
              status: 'ACTIVE',
              systemIntegrity: 'OPTIMAL',
              complianceReadinessScore: 98,
              breakdown: {
                gdprReadiness: 99,
                aiActReadiness: 96,
                nis2Readiness: 98,
                doraReadiness: 100,
                quantumProtection: 'ACTIVE (Kyber-1024)',
                encryptionStatus: 'AES-256-GCM (HSM Backed)',
                piiExposureLevel: 'Zero (0 Leaks)',
                activeAlerts: 0
              },
              activeModules: ['gdpr', 'ai_act', 'nis2', 'dora'],
              lastScanTimestamp: new Date().toISOString(),
              statusBadge: {
                text: '98% Ready',
                color: 'emerald'
              }
            }));
          }

          // 7. Compliance Health
          if (pathname === '/api/v1/compliance/health') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              overallScore: 96,
              grade: 'A+',
              checksPassed: 42,
              checksTotal: 44,
              timestamp: new Date().toISOString()
            }));
          }

          if (pathname === '/api/v1/compliance/regions-countries') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              regions: [
                {
                  name: 'European Union (EU)',
                  code: 'EU',
                  countries: [
                    { name: 'Germany', country_code: 'DE', is_active: true, local_law: 'BDSG / GDPR' },
                    { name: 'France', country_code: 'FR', is_active: true, local_law: 'CNIL / GDPR' },
                    { name: 'Netherlands', country_code: 'NL', is_active: true, local_law: 'AVG / GDPR' },
                    { name: 'Ireland', country_code: 'IE', is_active: true, local_law: 'Data Protection Act / GDPR' },
                    { name: 'Spain', country_code: 'ES', is_active: true, local_law: 'LOPDGDD / GDPR' },
                    { name: 'Italy', country_code: 'IT', is_active: true, local_law: 'Codice Privacy / GDPR' }
                  ]
                },
                {
                  name: 'United States & Americas',
                  code: 'US',
                  countries: [
                    { name: 'United States (Federal / CA)', country_code: 'US', is_active: true, local_law: 'CCPA / CPRA / HIPAA' },
                    { name: 'Brazil', country_code: 'BR', is_active: true, local_law: 'LGPD' },
                    { name: 'Canada', country_code: 'CA', is_active: true, local_law: 'PIPEDA' }
                  ]
                },
                {
                  name: 'Asia Pacific & Middle East',
                  code: 'APAC',
                  countries: [
                    { name: 'Singapore', country_code: 'SG', is_active: true, local_law: 'PDPA Singapore' },
                    { name: 'United Arab Emirates', country_code: 'AE', is_active: true, local_law: 'UAE Data Protection Law' },
                    { name: 'Saudi Arabia', country_code: 'SA', is_active: true, local_law: 'PDPL Saudi Arabia' },
                    { name: 'India', country_code: 'IN', is_active: true, local_law: 'DPDP Act 2023' },
                    { name: 'Bangladesh', country_code: 'BD', is_active: true, local_law: 'Cyber Security Act / DNCRP' }
                  ]
                },
                {
                  name: 'United Kingdom & EFTA',
                  code: 'UK',
                  countries: [
                    { name: 'United Kingdom', country_code: 'GB', is_active: true, local_law: 'UK GDPR / DPA 2018' },
                    { name: 'Switzerland', country_code: 'CH', is_active: true, local_law: 'FADP / revDSG' }
                  ]
                }
              ]
            }));
          }

          if (pathname === '/api/v1/compliance/detected-laws') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              laws: [
                { code: 'EU_GDPR', name: 'General Data Protection Regulation (GDPR)', type: 'STATUTE', strictness: 'VERY_HIGH', description: 'EU General Data Protection Regulation' },
                { code: 'DE_BDSG', name: 'Federal Data Protection Act (BDSG)', type: 'NATIONAL_ACT', strictness: 'VERY_HIGH', description: 'German Federal Data Protection Act' }
              ]
            }));
          }

          // 8. Engine Regions / Profiles / Industries
          if (pathname === '/api/v1/engine/regions') {
            let regions: any[] = [];
            if (database) {
              try {
                regions = database.prepare('SELECT * FROM regions').all();
              } catch {}
            }
            res.statusCode = 200;
            return res.end(JSON.stringify(regions.length > 0 ? regions : [
              { code: 'EU', name: 'European Union', sovereign_node: 'node-fra-01', compliance_tier: 'TIER_1' },
              { code: 'US', name: 'United States', sovereign_node: 'node-iad-01', compliance_tier: 'TIER_1' },
              { code: 'SG', name: 'Singapore / APAC', sovereign_node: 'node-sin-01', compliance_tier: 'TIER_1' }
            ]));
          }

          if (pathname === '/api/v1/engine/profiles') {
            let profiles: any[] = [];
            if (database) {
              try {
                profiles = database.prepare('SELECT * FROM compliance_profiles').all();
              } catch {}
            }
            res.statusCode = 200;
            return res.end(JSON.stringify(profiles.length > 0 ? profiles : [
              { id: 'fintech-eu', name: 'EU Fintech Standard', risk_level: 'HIGH' }
            ]));
          }

          if (pathname === '/api/v1/engine/industries') {
            let industries: any[] = [];
            if (database) {
              try {
                industries = database.prepare('SELECT * FROM industries').all();
              } catch {}
            }
            res.statusCode = 200;
            return res.end(JSON.stringify(industries.length > 0 ? industries : [
              { code: 'FIN', name: 'Financial Services & Banking' }
            ]));
          }

          if (pathname === '/api/v1/regulatory/regional-shards') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              shards: [
                { id: 'shard-eu-central', region: 'EU', status: 'SYNCHRONIZED', latencyMs: 14 },
                { id: 'shard-us-east', region: 'US', status: 'SYNCHRONIZED', latencyMs: 28 }
              ]
            }));
          }

          // 9. Data Residency
          if (pathname === '/api/v1/residency/policy') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              policy: {
                defaultRegion: 'EU_CENTRAL_FRANKFURT',
                enforcementMode: 'STRICT_SOVEREIGNTY',
                crossBorderEncrypted: true
              }
            }));
          }

          if (pathname === '/api/v1/residency/audit-log') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, logs: [] }));
          }

          if (pathname === '/api/v1/residency/report') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, compliant: true, score: 99.4 }));
          }

          // 10. Audit Trail API (Recent System Changes & Enforcement Actions)
          if (pathname === '/api/v1/audit/trail' && method === 'GET') {
            const category = url.searchParams.get('category') || undefined;
            const severity = url.searchParams.get('severity') || undefined;
            const search = url.searchParams.get('search') || undefined;
            const sortOrder = (url.searchParams.get('sortOrder') as any) || 'desc';
            const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : undefined;

            const events = await getAuditTrailEvents({ category, severity, search, sortOrder, limit });
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              total: events.length,
              events,
              timestamp: new Date().toISOString()
            }));
          }

          if ((pathname === '/api/v1/audit/trail/log' || pathname === '/api/v1/audit/trail') && method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(bodyStr || '{}');
                const created = logAuditTrailEvent(parsed);
                res.statusCode = 201;
                return res.end(JSON.stringify({ success: true, event: created }));
              } catch (e: any) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, error: e?.message }));
              }
            });
            return;
          }

          // 11. Regulatory Intelligence API (Search Grounded with Google Search)
          if ((pathname === '/api/v1/regulatory/intelligence' || pathname === '/api/v1/regulatory/intelligence/latest') && method === 'GET') {
            const query = url.searchParams.get('query') || undefined;
            fetchRegulatoryIntelligence(query)
              .then(data => {
                res.statusCode = 200;
                return res.end(JSON.stringify(data));
              })
              .catch(err => {
                res.statusCode = 200;
                return res.end(JSON.stringify({
                  success: true,
                  query: query || '',
                  summary: 'Sovereign regulatory intelligence stream active.',
                  updates: [],
                  groundingSources: [],
                  searchQueries: [],
                  timestamp: new Date().toISOString(),
                  isLiveGrounded: false,
                  model: 'fallback'
                }));
              });
            return;
          }

          if (pathname === '/api/v1/regulatory/intelligence/search' && method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(bodyStr || '{}');
                const query = parsed.query || parsed.search || 'latest global compliance updates';
                fetchRegulatoryIntelligence(query)
                  .then(data => {
                    res.statusCode = 200;
                    return res.end(JSON.stringify(data));
                  })
                  .catch(err => {
                    res.statusCode = 200;
                    return res.end(JSON.stringify({
                      success: true,
                      query,
                      summary: 'Sovereign regulatory intelligence query executed.',
                      updates: [],
                      groundingSources: [],
                      searchQueries: [query],
                      timestamp: new Date().toISOString(),
                      isLiveGrounded: false,
                      model: 'fallback'
                    }));
                  });
              } catch (e: any) {
                fetchRegulatoryIntelligence()
                  .then(data => {
                    res.statusCode = 200;
                    return res.end(JSON.stringify(data));
                  });
              }
            });
            return;
          }

          // 12. Notifications Gateway Config and Testing
          if (pathname === '/api/v1/notifications/config') {
            if (method === 'GET') {
              res.statusCode = 200;
              return res.end(JSON.stringify({
                smtpHost: process.env.SMTP_HOST || 'smtp.sendgrid.net',
                smtpPort: process.env.SMTP_PORT || '587',
                smtpUser: process.env.SMTP_USER || 'apikey',
                smtpSenderEmail: process.env.SMTP_SENDER || 'noreply@regulettee.eu',
                smtpSecure: true,
                smsProvider: process.env.SMS_PROVIDER || 'TWILIO',
                smsSenderId: process.env.SMS_SENDER_ID || '9XEN_REGULETTEE',
              }));
            }
            if (method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                res.statusCode = 200;
                return res.end(JSON.stringify({
                  success: true,
                  message: 'Notification settings persisted to sovereign enclave.',
                  timestamp: new Date().toISOString()
                }));
              });
              return;
            }
          }

          if (pathname === '/api/v1/notifications/test-email' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                status: 'DISPATCHED',
                message: `Verification test email with OTP challenge dispatched to ${data.recipient || 'recipient'} via SendGrid/SMTP.`,
                messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                timestamp: new Date().toISOString()
              }));
            });
            return;
          }

          if (pathname === '/api/v1/notifications/test-sms' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                status: 'DELIVERED_CELLULAR',
                message: `Cellular OTP security code dispatched to ${data.recipient || '+352621000111'} via Twilio gateway.`,
                sid: `SM${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                timestamp: new Date().toISOString()
              }));
            });
            return;
          }

          // 13. Real-Time Server-Sent Events (SSE) Stream
          if (pathname === '/api/v1/realtime/stream' && method === 'GET') {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Sovereign Telemetry SSE Stream Online', timestamp: new Date().toISOString() })}\n\n`);

            const interval = setInterval(() => {
              const ping = {
                type: 'TELEMETRY_PING',
                status: 'HEALTHY',
                activeNodes: 12,
                complianceScore: 98.4,
                timestamp: new Date().toISOString()
              };
              res.write(`data: ${JSON.stringify(ping)}\n\n`);
            }, 10000);

            req.on('close', () => {
              clearInterval(interval);
            });
            return;
          }

          // 14. EDPB & EU AI Office Regulatory News Feed
          if (pathname === '/api/v1/compliance/news-feed' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              news: [
                {
                  id: 'EDPB-2026-08',
                  title: 'EDPB Adopts Binding Decision 02/2026 on Large Language Model Fine-Tuning under GDPR Art. 6(1)(f)',
                  source: 'European Data Protection Board',
                  date: '2026-09-02',
                  impactLevel: 'CRITICAL',
                  summary: 'Strict necessity test established for web-scraped training corpora; controllers must offer zero-friction opt-out telemetry before training commences.',
                  url: 'https://edpb.europa.eu'
                },
                {
                  id: 'AI-OFFICE-2026-14',
                  title: 'European AI Office Publishes Standardized Technical Documentation Template for General Purpose AI Models',
                  source: 'European Commission AI Office',
                  date: '2026-08-30',
                  impactLevel: 'HIGH',
                  summary: 'Harmonized technical documentation requirements under Article 53 of the EU AI Act now mandatory for foundation model providers.',
                  url: 'https://digital-strategy.ec.europa.eu'
                },
                {
                  id: 'ENISA-2026-21',
                  title: 'ENISA Issues Coordinated Vulnerability Disclosure (CVD) Directive under NIS2 Article 12',
                  source: 'EU Agency for Cybersecurity (ENISA)',
                  date: '2026-08-27',
                  impactLevel: 'MEDIUM',
                  summary: 'Designated CSIRTs across all 27 member states establish unified cryptographically sealed reporting channels.',
                  url: 'https://www.enisa.europa.eu'
                }
              ]
            }));
          }

          // 15. eIDAS Signature Module API
          if (pathname === '/api/v1/eidas/reports' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              reports: [
                { id: 'rep-1', name: 'Q2 2026 AI Algorithm Opacity Report', signatureStatus: 'UNSIGN' },
                { id: 'rep-2', name: 'June DORA Resilience State', signatureStatus: 'SIGNED', signedAt: '2026-07-04T14:22:00Z', signer: 'EU-REG-AUTH-01' },
                { id: 'rep-3', name: 'GDPR Article 28 Summary', signatureStatus: 'UNSIGN' }
              ]
            }));
          }

          if (pathname === '/api/v1/eidas/sign' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                reportId: data.id || 'rep-1',
                signatureStatus: 'SIGNED',
                signedAt: new Date().toISOString(),
                signer: 'EU-REG-AUTH-01',
                certificateHash: `SHA256-${Array.from(randomBytes(6)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`
              }));
            });
            return;
          }

          if (pathname === '/api/v1/eidas/verify' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                reportId: data.id || 'rep-1',
                signatureStatus: 'VERIFIED',
                verifiedAt: new Date().toISOString(),
                eidasLevel: 'QUALIFIED_ELECTRONIC_SIGNATURE_QES'
              }));
            });
            return;
          }

          // 16. Invoice Shell & Corporate Audit History API
          if (pathname === '/api/v1/fintech/invoice-shell/history' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              history: [
                {
                  id: 'INV-AUD-901',
                  issuerName: 'Grand Offshore Management Ltd',
                  issuerCountry: 'Cayman Islands',
                  beneficiaryName: 'Alpha Capital Partners LLC',
                  amount: 250000,
                  currency: 'USD',
                  shellProbability: 88,
                  fraudRiskScore: 92,
                  riskRating: 'CRITICAL',
                  redFlags: ['Shell Jurisdiction', 'IBAN Country Mismatch', 'Low Staff-to-Revenue Ratio'],
                  auditedAt: '2026-09-01T10:15:00Z'
                },
                {
                  id: 'INV-AUD-902',
                  issuerName: 'Lumina Digital Services GmbH',
                  issuerCountry: 'Germany',
                  beneficiaryName: 'Nordic Retail Group AS',
                  amount: 45000,
                  currency: 'EUR',
                  shellProbability: 12,
                  fraudRiskScore: 15,
                  riskRating: 'LOW',
                  redFlags: [],
                  auditedAt: '2026-09-03T14:20:00Z'
                }
              ]
            }));
          }

          if (pathname === '/api/v1/fintech/invoice-shell/insights-summary' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              summary: 'Audit of active cross-border invoice streams revealed 1 critical shell company risk profile originating from Cayman Islands routing through a Cyprus bank account. Total high-risk exposure: $250,000 USD. Automated risk flags triggered under EU AML Directive 6 Article 18.'
            }));
          }

          // 17. TAX & VAT Registry Verification
          if (pathname === '/api/v1/fintech/tax-vat/verify' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              const vat = (data.vatNumber || 'DE123456789').toUpperCase();
              const country = data.countryCode || 'DE';
              const company = data.companyName || 'Sovereign Compliance GmbH';
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                validation: {
                  companyName: company,
                  vatNumber: vat,
                  countryCode: country,
                  regulatoryConfidence: 98.6,
                  taxEntityStatus: 'ACTIVE',
                  jurisdictionName: `VIES / Federal Central Tax Office (${country})`,
                  localRate: '19.0%',
                  filingFrequency: 'Monthly Real-Time Telemetry',
                  registeredAddress: 'Willy-Brandt-Straße 1, 10557 Berlin, Germany',
                  taxAuditSummary: 'Verified valid against official European Commission VIES database and national tax registry. Entity has zero outstanding fiscal sanctions.'
                }
              }));
            });
            return;
          }

          // 18. Invoice Shell & Fraud Audit Evaluation
          if (pathname === '/api/v1/fintech/invoice-shell/audit' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              const inv = data.invoiceData || {};
              const isHighRisk = (inv.issuerCountry || '').toLowerCase().includes('cayman') || (inv.amount || 0) > 100000;
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                audit: {
                  riskRating: isHighRisk ? 'HIGH' : 'LOW',
                  shellProbability: isHighRisk ? 84 : 14,
                  fraudRiskScore: isHighRisk ? 78 : 12,
                  shellAuditFindings: isHighRisk
                    ? 'Disproportionate headcount-to-billing ratio detected. Issuer jurisdiction classified as non-cooperative under EU list of tax havens.'
                    : 'Standard operational vendor verified with active employment registry entries.',
                  invoiceFraudFindings: isHighRisk
                    ? 'Cross-border routing anomaly: Cayman entity billing US firm with settlement directed to Cyprus IBAN.'
                    : 'Settlement rails align with declared tax residency and legal domicile.',
                  forensicFlags: isHighRisk
                    ? ['Zero Physical Premises Footprint', 'Offshore Intermediary Routing', 'Nominee Director Structure Identified']
                    : ['Standard Domestic Clearing', 'Verified Commercial Registration'],
                  auditNarrative: isHighRisk
                    ? 'Invoice presents high composite risk under AMLD6 Article 18. Enhanced due diligence and source-of-funds verification required.'
                    : 'Standard invoice cleared for automated settlement under threshold limits.',
                  isRecommendedForClearance: !isHighRisk
                }
              }));
            });
            return;
          }

          // 19. OpenSanctions & PEP Screening
          if (pathname === '/api/v1/fintech/opensanctions/screen' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              const name = (data.name || '').trim();
              const isSuspicious = /vladimir|sergey|oligarch|sanction|al-sham/i.test(name);
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                match: {
                  name: name || 'Screened Subject',
                  confidence: isSuspicious ? 96.4 : 99.2,
                  riskLevel: isSuspicious ? 'CRITICAL' : 'CLEAR',
                  isPep: isSuspicious,
                  isSanctioned: isSuspicious,
                  listsMatched: isSuspicious ? ['EU Consolidated Sanctions List', 'UN Security Council 1267', 'OFAC SDN'] : [],
                  justification: isSuspicious
                    ? 'Direct identity token match across active European External Action Service and OFAC sanctions registries.'
                    : 'Zero hits across 42 global regulatory registers, interpol red notices, and designated PEP databases.',
                  biasFlag: 'None. Direct character correlation established.'
                }
              }));
            });
            return;
          }

          // 20. OpenSanctions Algorithmic Bias Assessment
          if (pathname === '/api/v1/fintech/opensanctions/bias-assess' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                report: {
                  fairnessIndex: 94.8,
                  systemBiasReport: 'Algorithmic demographic parity audit completed under EU AI Act Article 10. Phonetic distance metrics show equal false-positive distribution across all linguistic clusters.',
                  demographics: [
                    { group: 'Latin Alphabet (Western European)', falsePositiveRate: 0.04, parityScore: 98.2 },
                    { group: 'Cyrillic Transliteration', falsePositiveRate: 0.06, parityScore: 94.5 },
                    { group: 'Arabic Script Phonetics', falsePositiveRate: 0.07, parityScore: 93.1 },
                    { group: 'East Asian Romanization (Pinyin/Hepburn)', falsePositiveRate: 0.05, parityScore: 96.0 },
                    { group: 'South Asian Name Structures', falsePositiveRate: 0.06, parityScore: 94.2 }
                  ]
                }
              }));
            });
            return;
          }

          // 21. Fintech AML Checks & Identity Verification
          if (pathname === '/api/v1/fintech/aml-checks' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              checks: [
                {
                  id: 'AML-CK-801',
                  userId: 'usr_eur_9901',
                  userName: 'Marcus Vance',
                  status: 'PASSED',
                  riskScore: 12,
                  pepMatch: false,
                  sanctionsMatch: false,
                  timestamp: new Date(Date.now() - 3600000).toISOString()
                },
                {
                  id: 'AML-CK-802',
                  userId: 'usr_eur_9902',
                  userName: 'Elena Rostova',
                  status: 'PENDING_REVIEW',
                  riskScore: 68,
                  pepMatch: true,
                  sanctionsMatch: false,
                  timestamp: new Date(Date.now() - 7200000).toISOString()
                },
                {
                  id: 'AML-CK-803',
                  userId: 'usr_eur_9903',
                  userName: 'Tariq Al-Mansoor',
                  status: 'PASSED',
                  riskScore: 18,
                  pepMatch: false,
                  sanctionsMatch: false,
                  timestamp: new Date(Date.now() - 14400000).toISOString()
                }
              ]
            }));
          }

          if (pathname === '/api/v1/fintech/verify' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                result: {
                  userId: data.userId || 'usr_test_01',
                  status: 'PASSED',
                  riskScore: 14,
                  verifiedAt: new Date().toISOString()
                }
              }));
            });
            return;
          }

          // 22. Transactions & Webhook Ingestion
          if (pathname === '/api/v1/fintech/transactions' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              transactions: [
                {
                  id: 'TX-2026-9001',
                  sender: 'Nordic Logistics BV',
                  recipient: 'Alpine Cloud Systems SA',
                  amount: 74500,
                  currency: 'EUR',
                  status: 'CLEARED',
                  riskScore: 11,
                  timestamp: new Date(Date.now() - 1800000).toISOString()
                },
                {
                  id: 'TX-2026-9002',
                  sender: 'Quantum Wealth Mgmt Ltd',
                  recipient: 'Caspian Horizon Trading',
                  amount: 480000,
                  currency: 'EUR',
                  status: 'FLAGGED',
                  riskScore: 86,
                  timestamp: new Date(Date.now() - 5400000).toISOString()
                }
              ]
            }));
          }

          if (pathname === '/api/v1/fintech/transactions/webhook' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                message: 'Transaction telemetry ingested and evaluated in real-time under Sovereign Rule Engine'
              }));
            });
            return;
          }

          // 23. Rules & Cases
          if (pathname === '/api/v1/fintech/rules') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              rules: [
                { id: 'RULE-01', name: 'High-Value Cash Equivalents (>€10,000)', enabled: true, threshold: 10000 },
                { id: 'RULE-02', name: 'FATF High-Risk Jurisdiction Ingress', enabled: true, threshold: 0 },
                { id: 'RULE-03', name: 'Rapid Velocity Smurfing Detection', enabled: true, threshold: 5 }
              ]
            }));
          }

          if (pathname === '/api/v1/fintech/cases' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              cases: [
                {
                  id: 'CASE-2026-101',
                  transactionId: 'TX-2026-9002',
                  title: 'Disproportionate Cross-Border Transfer Spike',
                  status: 'UNDER_INVESTIGATION',
                  priority: 'HIGH',
                  assignedTo: 'Compliance Officer EU-04',
                  createdAt: new Date(Date.now() - 86400000).toISOString()
                }
              ]
            }));
          }

          if (pathname?.startsWith('/api/v1/fintech/cases/') && pathname?.endsWith('/action') && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                case: {
                  id: pathname.split('/')[5],
                  status: data.action === 'DISMISS' ? 'DISMISSED' : 'SAR_FILED',
                  sarDraft: {
                    fincenID: `SAR-FIU-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
                  }
                }
              }));
            });
            return;
          }

          // 24. AI ACT & POLICY ENGINE ENDPOINTS
          if (pathname === '/api/v1/policy-engine/frameworks' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              frameworks: [
                {
                  id: 'eu-ai-act',
                  name: 'EU Artificial Intelligence Act (Regulation 2024/1689)',
                  code: 'EU-AI-ACT-2024',
                  description: 'Four-tier risk classification, mandatory transparency for generative systems, and conformity assessment guidelines.',
                  articlesCount: 113,
                  complianceScore: 95.8,
                  status: 'ENFORCED'
                },
                {
                  id: 'gdpr',
                  name: 'General Data Protection Regulation (Regulation 2016/679)',
                  code: 'GDPR-2016',
                  description: 'Data sovereignty, rights of data subjects, cross-border data transfer safeguards, and DPIA requirements.',
                  articlesCount: 99,
                  complianceScore: 98.4,
                  status: 'ENFORCED'
                },
                {
                  id: 'dora',
                  name: 'Digital Operational Resilience Act (Regulation 2022/2554)',
                  code: 'DORA-2022',
                  description: 'ICT risk management frameworks, incident reporting protocols, and critical third-party vendor oversight.',
                  articlesCount: 64,
                  complianceScore: 92.1,
                  status: 'ENFORCED'
                },
                {
                  id: 'nis2',
                  name: 'NIS2 Directive (Directive 2022/2555)',
                  code: 'NIS2-2022',
                  description: 'Harmonized cybersecurity risk management and reporting obligations for essential European service operators.',
                  articlesCount: 46,
                  complianceScore: 94.0,
                  status: 'ENFORCED'
                }
              ]
            }));
          }

          if (pathname === '/api/v1/policy-engine/ai-models' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              models: [
                {
                  id: 'mdl-901',
                  name: 'Sovereign Credit Decisioning Engine v4',
                  deploymentDomain: 'Financial Services & Underwriting',
                  riskLevel: 'HIGH_RISK',
                  status: 'CONFORMITY_ASSESSED',
                  registeredAt: '2026-08-15T09:30:00Z',
                  articleReference: 'Annex III Section 5(b)'
                },
                {
                  id: 'mdl-902',
                  name: 'Cross-Border AML Transaction Anomaly Detector',
                  deploymentDomain: 'Fintech & Anti-Money Laundering',
                  riskLevel: 'MINIMAL_RISK',
                  status: 'APPROVED',
                  registeredAt: '2026-08-20T11:15:00Z',
                  articleReference: 'Article 2(2) Specific Exemptions'
                }
              ]
            }));
          }

          if (pathname === '/api/v1/policy-engine/ai-models' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                message: 'AI Model successfully registered with EU AI Office Conformity Ledger',
                model: {
                  id: `mdl-${Date.now()}`,
                  name: data.modelName || 'Custom Model',
                  deploymentDomain: data.deploymentDomain || 'General Enterprise',
                  riskLevel: data.riskLevel || 'MINIMAL_RISK',
                  registeredAt: new Date().toISOString()
                }
              }));
            });
            return;
          }

          if (pathname === '/api/v1/policy-engine/cloud-db-status' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              dbConfig: {
                provider: 'Cloud SQL PostgreSQL / Sovereign Tier',
                status: 'ONLINE',
                latencyMs: 12,
                multiRegionReplication: true,
                sslEnforced: true,
                lastBackup: new Date(Date.now() - 7200000).toISOString()
              }
            }));
          }

          if (pathname === '/api/v1/policy-engine/categorize-ai-risk' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body || '{}');
              let riskLevel = 'MINIMAL_RISK';
              let category = 'Minimal / No Risk (Article 69)';
              let article = 'Article 69 voluntary codes of conduct';
              let obligations = ['General awareness training', 'Voluntary adherence to ethical AI principles'];
              let conformityAssessment = false;
              let registration = false;

              if (data.usesSocialScoring || (data.usesBiometrics && data.deploymentDomain?.toLowerCase().includes('public'))) {
                riskLevel = 'PROHIBITED';
                category = 'Unacceptable Risk (Prohibited AI Practices)';
                article = 'EU AI Act Article 5(1)';
                obligations = ['System cannot be placed on EU single market or put into service'];
              } else if (data.autonomousDecisionMaking || data.targetsVulnerableGroups || /critical|employment|credit|law enforcement|health/i.test(data.deploymentDomain || '')) {
                riskLevel = 'HIGH_RISK';
                category = 'High-Risk AI System (Annex III)';
                article = 'EU AI Act Article 6 & Annex III';
                obligations = [
                  'Risk Management System (Article 9)',
                  'Data Governance & Bias Mitigation (Article 10)',
                  'Technical Documentation & Audit Trail (Article 11)',
                  'Automatic Logging & Traceability (Article 12)',
                  'Human Oversight Integration (Article 14)',
                  'Cybersecurity & Accuracy Robustness (Article 15)'
                ];
                conformityAssessment = true;
                registration = true;
              } else if (data.generatesSyntheticMedia) {
                riskLevel = 'SPECIFIC_TRANSPARENCY_RISK';
                category = 'Specific Transparency Risk (Article 50)';
                article = 'EU AI Act Article 50';
                obligations = ['Watermarking of synthetic media', 'Clear disclosures to end users that content is AI-generated'];
              }

              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                classification: {
                  category,
                  riskLevel,
                  euAiActArticle: article,
                  requiredObligations: obligations,
                  conformityAssessmentRequired: conformityAssessment,
                  registrationRequired: registration,
                  confidenceScore: 98.4,
                  rationale: `Evaluated against Regulation (EU) 2024/1689. Domain '${data.deploymentDomain || 'General'}' with autonomous decision making = ${!!data.autonomousDecisionMaking}.`
                }
              }));
            });
            return;
          }

          if (pathname === '/api/v1/policy-engine/export-cloud-sql' && method === 'GET') {
            res.setHeader('Content-Type', 'application/sql');
            res.setHeader('Content-Disposition', 'attachment; filename="sovereign_policy_audit.sql"');
            res.statusCode = 200;
            return res.end(`-- Sovereign Compliance Cloud SQL Ledger Export
-- Exported on ${new Date().toISOString()}
CREATE TABLE IF NOT EXISTS eu_ai_models (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  risk_level VARCHAR(64) NOT NULL,
  conformity_assessed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`);
          }

          if (pathname === '/api/v1/ai-act/audit-logs' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              logs: [
                {
                  id: 'LOG-AI-8801',
                  timestamp: new Date(Date.now() - 1800000).toISOString(),
                  model: 'Gemini Sovereign 3.8',
                  action: 'POLICY_SYNTHESIS',
                  classification: 'MINIMAL_RISK',
                  decision: 'PERMITTED',
                  latencyMs: 310,
                  user: 'mustafaattamim@gmail.com'
                },
                {
                  id: 'LOG-AI-8802',
                  timestamp: new Date(Date.now() - 5400000).toISOString(),
                  model: 'Underwriting Neural Net',
                  action: 'CREDIT_SCORE_EVAL',
                  classification: 'HIGH_RISK',
                  decision: 'HUMAN_OVERSIGHT_DISPATCHED',
                  latencyMs: 440,
                  user: 'compliance@sovereign.eu'
                }
              ]
            }));
          }

          if (pathname === '/api/v1/ai-act/scan' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const jobId = `JOB-AI-${Date.now()}`;
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                jobId,
                status: 'COMPLETED',
                violations: []
              }));
            });
            return;
          }

          if (pathname?.startsWith('/api/v1/ai-act/jobs/')) {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              status: 'COMPLETED',
              progress: 100,
              result: {
                violations: [],
                summary: 'EU AI Act code and model architecture inspection completed with 0 non-conformities.'
              }
            }));
          }

          if (pathname === '/api/v1/ai-act/fix' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Code remediated in compliance with EU AI Act Article 10 & 14 human oversight requirements.'
            }));
          }

          if (pathname === '/api/v1/ai-act/inference-log' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              logged: true,
              complianceVerified: true
            }));
          }

          // 25. CYBERSECURITY & THREAT INTELLIGENCE
          if (pathname === '/api/v1/cyber-security/heatmap' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              densityData: [
                [0, 1, 2, 3, 1],
                [0, 0, 1, 2, 1],
                [1, 2, 0, 0, 0],
                [2, 3, 4, 1, 1],
                [0, 1, 0, 0, 0]
              ],
              criticalityData: [
                [0, 2, 4, 6, 2],
                [0, 0, 1, 4, 2],
                [1, 3, 0, 0, 0],
                [3, 5, 8, 2, 1],
                [0, 2, 0, 0, 0]
              ]
            }));
          }

          if (pathname === '/api/v1/cyber-security/threat-intelligence' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              intelligence: [
                { country: 'Germany', code: 'DE', city: 'Frankfurt', ip: '194.67.210.14', threatLevel: 'LOW', blockedAttacks: 1420, protocol: 'TLS 1.3 / Kyber-768' },
                { country: 'Netherlands', code: 'NL', city: 'Amsterdam', ip: '185.220.101.5', threatLevel: 'MEDIUM', blockedAttacks: 3840, protocol: 'IPsec AES-256-GCM' },
                { country: 'France', code: 'FR', city: 'Paris', ip: '51.15.42.89', threatLevel: 'LOW', blockedAttacks: 980, protocol: 'mTLS' },
                { country: 'United States', code: 'US', city: 'Ashburn', ip: '3.218.44.110', threatLevel: 'MEDIUM', blockedAttacks: 4120, protocol: 'HTTPS / HTTP/3' },
                { country: 'Singapore', code: 'SG', city: 'Jurong', ip: '103.253.144.12', threatLevel: 'LOW', blockedAttacks: 1100, protocol: 'WireGuard' }
              ]
            }));
          }

          // 26. QUANTUM SECURITY & POST-QUANTUM CRYPTOGRAPHY (PQC)
          if (pathname === '/api/v1/quantum/scan' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              scanTime: new Date().toISOString(),
              overallVulnerabilityScore: 32,
              quantumReadinessGrade: 'B+',
              vulnerabilitiesFound: 2,
              migrationPlan: {
                targetAlgorithm: 'ML-KEM-768 (CRYSTALS-Kyber) & ML-DSA-65 (CRYSTALS-Dilithium)',
                cryptoAgilityConfig: {
                  hybridMode: true,
                  tlsCipherSuite: 'TLS_AES_256_GCM_SHA384_KYBER768',
                  rekeyIntervalHours: 24
                },
                phases: [
                  { phase: 'Assessment', status: 'COMPLETED', date: '2026-08-01' },
                  { phase: 'Hybrid PQC Implementation', status: 'IN_PROGRESS', date: '2026-09-05' },
                  { phase: 'Full Classical Cryptography Deprecation', status: 'SCHEDULED', date: '2027-01-01' }
                ]
              },
              endpointsScanned: [
                { url: 'https://api.internal.svc', status: 'HYBRID_READY', keyExchange: 'X25519Kyber768Draft00' },
                { url: 'https://client-portal.eu', status: 'QUANTUM_SAFE', keyExchange: 'ML-KEM-768' },
                { url: 'db-node-primary:5432', status: 'CLASSICAL_ONLY', keyExchange: 'ECDHE-RSA-AES256-GCM-SHA384' }
              ]
            }));
          }

          if (pathname === '/api/v1/quantum/apply' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Post-quantum cryptographic agility parameters applied across cluster routing mesh.'
            }));
          }

          if (pathname === '/api/v1/quantum-protection/policies' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              policies: [
                { id: 'POL-PQC-01', name: 'Mandatory Hybrid Kyber-768 Key Encapsulation', status: 'ACTIVE', severity: 'HIGH' },
                { id: 'POL-PQC-02', name: 'Legacy RSA-2048 Deprecation by Q1 2027', status: 'ENFORCING', severity: 'CRITICAL' },
                { id: 'POL-PQC-03', name: 'Post-Quantum Hardware Security Module (HSM) Attestation', status: 'ACTIVE', severity: 'MEDIUM' }
              ]
            }));
          }

          if (pathname === '/api/v1/quantum-protection/reports' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              reports: [
                {
                  id: 'REP-PQC-2026-01',
                  date: new Date(Date.now() - 86400000).toISOString(),
                  title: 'Enterprise Cryptographic Inventory & Harvest-Now-Decrypt-Later (HNDL) Threat Assessment',
                  status: 'PASSED',
                  riskRating: 'LOW'
                }
              ]
            }));
          }

          if (pathname === '/api/v1/quantum-protection/fetch-policies' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Synchronized latest BSI (Federal Office for Information Security) & ENISA PQC recommendations.'
            }));
          }

          if (pathname === '/api/v1/quantum-protection/scan-and-fix' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              remediatedCount: 2,
              message: 'Automated PQC cipher suite upgrade executed across 2 legacy TLS ingress proxies.'
            }));
          }

          // 26b. Gemini Regulatory Narrative & Incident Copilot
          if (pathname === '/api/v1/narrative/generate' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = body ? JSON.parse(body) : {};
                const draft = await generateRegulatoryNarrative(parsed);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, draft }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }

          if (pathname === '/api/v1/narrative/drafts' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, drafts: storedDrafts }));
          }

          if (pathname === '/api/v1/narrative/drafts' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const draft = body ? JSON.parse(body) : null;
                if (draft && draft.id) {
                  storedDrafts.unshift(draft);
                }
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, draft }));
              } catch (e: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }

          if (pathname === '/api/v1/copilot/chat' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = body ? JSON.parse(body) : { message: '' };
                const result = await analyzeIncidentCopilot(parsed);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, ...result }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }

          if (pathname === '/api/v1/copilot/containment' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              status: 'CONTAINED',
              timestamp: new Date().toISOString(),
              action: 'VLAN_ISOLATION_AND_REKEYING_COMPLETED',
              remediatedNodes: 8,
              message: 'Compromised pods isolated from egress. Ephemeral encryption keys successfully destroyed and re-seeded.'
            }));
          }

          // 28. MICA CRYPTO-FORENSICS & MARKET SURVEILLANCE
          if (pathname === '/api/v1/fintech/mica-analyze' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = body ? JSON.parse(body) : { transactions: [] };
                const result = await analyzeMicaTransactions(parsed.transactions || []);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, ...result }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }

          if (pathname === '/api/v1/fintech/mica-sar') {
            if (method === 'GET') {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, reports: storedMicaSARs }));
            }
            if (method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const parsed = body ? JSON.parse(body) : {};
                  const newReport = createMicaSAR(parsed);
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, report: newReport }));
                } catch (e: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: e.message }));
                }
              });
              return;
            }
          }

          // 29. DSAR PORTAL (DATA SUBJECT ACCESS REQUESTS)
          if (pathname === '/api/v1/dsar/requests') {
            if (method === 'GET') {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, requests: storedDsarRequests }));
            }
            if (method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const parsed = body ? JSON.parse(body) : {};
                  const created = createDSAR(parsed);
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, request: created }));
                } catch (e: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: e.message }));
                }
              });
              return;
            }
          }

          if (pathname?.startsWith('/api/v1/dsar/requests/') && pathname?.endsWith('/verify') && method === 'POST') {
            const parts = pathname.split('/');
            const reqId = parts[5];
            const updated = verifyDSARIdentity(reqId);
            res.statusCode = updated ? 200 : 404;
            return res.end(JSON.stringify({
              success: !!updated,
              request: updated,
              message: updated ? 'Identity token verified' : 'Request not found'
            }));
          }

          if (pathname?.startsWith('/api/v1/dsar/requests/') && pathname?.endsWith('/fulfill') && method === 'POST') {
            const parts = pathname.split('/');
            const reqId = parts[5];
            const fulfilled = fulfillDSAR(reqId);
            res.statusCode = fulfilled ? 200 : 404;
            return res.end(JSON.stringify({
              success: !!fulfilled,
              request: fulfilled,
              message: fulfilled ? 'DSAR fulfilled in compliance with Article 12(3)' : 'Request not found'
            }));
          }

          // 30. STATUTORY GAZETTE WATCHDOG
          if (pathname === '/api/v1/statutory/gazette-feed' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              crawledAt: new Date().toISOString(),
              gazettesActive: 4,
              feedStatus: 'ONLINE'
            }));
          }

          if (pathname === '/api/v1/statutory/apply-patch' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = body ? JSON.parse(body) : {};
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                patchId: data.id || 'patch-enclave-01',
                status: 'DEPLOYED_TO_SOVEREIGN_CLUSTER',
                enclaveChecksum: 'sha384:e29bb1a8770c8df634f59012',
                deployedAt: new Date().toISOString()
              }));
            });
            return;
          }

          // EU AI ACT ANNEX IV TECHNICAL DOSSIER BUILDER
          if (pathname === '/api/v1/ai-dossier/dossiers' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, dossiers: storedAiDossiers }));
          }

          if (pathname === '/api/v1/ai-dossier/generate' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = body ? JSON.parse(body) : {};
                const dossier = await generateAiAnnexIvDossier(data);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, dossier }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }

          // CENTRAL BANK CLEARING & B2G SETTLEMENT RAIL
          if (pathname === '/api/v1/b2g/settlement/history' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, history: storedClearingRecords }));
          }

          if (pathname === '/api/v1/b2g/settlement/initiate' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = body ? JSON.parse(body) : {};
                const record = initiateCentralBankSettlement(data);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, record }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }

          // TRANSFER IMPACT ASSESSMENT (TIA) & SCC GENERATOR
          if (pathname === '/api/v1/tia/simulate' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = body ? JSON.parse(body) : {};
              res.statusCode = 200;
              res.end(JSON.stringify(simulateTiaTransfer(data)));
            });
            return;
          }

          if (pathname === '/api/v1/tia/generate-scc' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = body ? JSON.parse(body) : {};
              res.statusCode = 200;
              res.end(JSON.stringify(generateSccAgreement(data)));
            });
            return;
          }

          // MULTI-REGION POLICY HARMONIZATION ENGINE
          if (pathname === '/api/v1/multi-region-policy/rag-search' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              query: url.searchParams.get('query') || '',
              results: [
                {
                  id: 'POL-EUR-AI-01',
                  jurisdiction: 'European Union',
                  statute: 'Regulation (EU) 2024/1689 (EU AI Act)',
                  article: 'Article 14 Human Oversight',
                  relevanceScore: 0.96,
                  snippet: 'High-risk AI systems shall be designed and developed with appropriate human-machine interface tools for natural person oversight.',
                  harmonizationStatus: 'ALIGNED'
                },
                {
                  id: 'POL-KSA-PDPL-03',
                  jurisdiction: 'Saudi Arabia',
                  statute: 'Personal Data Protection Law (Royal Decree M/19)',
                  article: 'Article 29 Cross-Border Transfer',
                  relevanceScore: 0.91,
                  snippet: 'Controllers may transfer personal data outside the Kingdom only pursuant to an adequacy agreement or where appropriate safeguards ensure equivalent protection.',
                  harmonizationStatus: 'HARMONIZED_VIA_SCC'
                }
              ]
            }));
          }

          if (pathname === '/api/v1/multi-region-policy/scan-and-match' && method === 'POST') {
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              scannedCorpusCount: 148,
              matchesFound: 12,
              conflictsDetected: 0,
              crossBorderAdequacyStatus: 'VALID_UNDER_ENCLAVE_ISOLATION',
              evaluatedAt: new Date().toISOString()
            }));
          }

          // AI RED-TEAMING ADVERSARIAL SIMULATOR
          if (pathname === '/api/v1/ai-red-team/execute' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const data = body ? JSON.parse(body) : {};
                const result = await executeAiRedTeamingAttack(data);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, result }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }

          // AI KILLSWITCH & ARTICLE 14 CONTROL PLANE
          if (pathname === '/api/v1/ai-killswitch/status' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, state: storedKillswitchState }));
          }

          if (pathname === '/api/v1/ai-killswitch/action' && method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = body ? JSON.parse(body) : {};
                const state = updateKillswitchAction(data);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, state }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: e.message }));
              }
            });
            return;
          }

          // AI CLIENT TRANSPARENCY & ARTICLE 86 PORTAL
          if (pathname === '/api/v1/ai-client-portal/cases' && method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, cases: storedClientCases }));
          }

          if (pathname.startsWith('/api/v1/ai-client-portal/cases/') && method === 'GET') {
            const caseId = pathname.replace('/api/v1/ai-client-portal/cases/', '');
            const found = storedClientCases.find(c => c.caseId === caseId || c.subjectId === caseId);
            if (!found) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ success: false, error: 'Case not found' }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, case: found }));
          }

          if (pathname.includes('/api/v1/ai-client-portal/cases/') && pathname.endsWith('/appeal') && method === 'POST') {
            const caseId = pathname.replace('/api/v1/ai-client-portal/cases/', '').replace('/appeal', '');
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = body ? JSON.parse(body) : {};
              const updated = requestCaseHumanReview(caseId, data?.reason || 'Statutory review requested under EU AI Act Art. 86');
              if (!updated) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ success: false, error: 'Case not found' }));
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, case: updated }));
            });
            return;
          }

          // 27. Fallback for all other /api/* routes
          // Return valid JSON so callers expecting JSON never receive HTML or throw parse errors
          res.statusCode = 200;
          return res.end(JSON.stringify({
            success: true,
            status: 'ok',
            data: [],
            message: `Endpoint ${pathname} handled by sovereign dev router`
          }));
        } catch (err: any) {
          console.error(`Error in apiMiddlewarePlugin handling ${pathname}:`, err);
          res.statusCode = 200;
          return res.end(JSON.stringify({
            success: true,
            status: 'fallback',
            error: err?.message,
            data: []
          }));
        }
      });
    }
  };
}

function getDefaultAddons() {
  return [
    {
      id: 'gdpr-compliance',
      category: 'Data Protection & Privacy',
      name: 'GDPR Compliance Add-On',
      actId: 'GDPR',
      desc: 'Article 30 Record of Processing Activities, Article 32 Security Controls, Automated DSAR Processing, and Consent Management',
      price: '$799/mo',
      score: 96,
      colorClass: 'bg-emerald-50/70 border-emerald-200/50 text-emerald-700 hover:bg-emerald-100/50',
      icon: 'ShieldCheck',
      isActiveGlobally: true,
      subscriptionStatus: 'active',
      configSchema: []
    },
    {
      id: 'ai-act-auditor',
      category: 'Public Sector & Govtech',
      name: 'EU AI Act Risk Classification & Audit',
      actId: 'EU_AI_ACT',
      desc: 'High-risk system categorization, post-market monitoring enclaves, and transparency logging',
      price: '$1,299/mo',
      score: 94,
      colorClass: 'bg-indigo-50/70 border-indigo-200/50 text-indigo-700 hover:bg-indigo-100/50',
      icon: 'Brain',
      isActiveGlobally: true,
      subscriptionStatus: 'active',
      configSchema: []
    },
    {
      id: 'dora-resilience',
      category: 'Financial Services',
      name: 'DORA Digital Operational Resilience',
      actId: 'DORA',
      desc: 'ICT risk management frameworks, third-party provider concentration auditing, and incident reporting',
      price: '$999/mo',
      score: 98,
      colorClass: 'bg-sky-50/70 border-sky-200/50 text-sky-700 hover:bg-sky-100/50',
      icon: 'Server',
      isActiveGlobally: true,
      subscriptionStatus: 'active',
      configSchema: []
    },
    {
      id: 'ccpa-optout',
      category: 'Data Protection & Privacy',
      name: 'California CCPA/CPRA Opt-Out & GPC',
      actId: 'CCPA',
      desc: 'Global Privacy Control signal handling, Do Not Sell/Share enforcement and CPRA sensitive-information minimization',
      price: '$649/mo',
      score: 89,
      colorClass: 'bg-cyan-50/70 border-cyan-200/50 text-cyan-700',
      icon: 'UserX',
      isActiveGlobally: true,
      subscriptionStatus: 'active',
      configSchema: []
    },
    {
      id: 'whistleblower',
      category: 'Corporate Governance',
      name: 'EU Whistleblower Directive (2023/2751)',
      actId: 'WHISTLE_BLOWER',
      desc: 'Confidential internal reporting channel, retaliation safeguards and 3-month handling SLAs under Directive 2023/2751',
      price: '$449/mo',
      score: 90,
      colorClass: 'bg-orange-50/70 border-orange-200/50 text-orange-700',
      icon: 'Megaphone',
      isActiveGlobally: true,
      subscriptionStatus: 'active',
      configSchema: []
    },
    {
      id: 'csrd-esg',
      category: 'Enterprise IT',
      name: 'CSRD & ESRS ESG Reporting Suite',
      actId: 'CSRD',
      desc: 'CSRD double-materiality workspace, ESRS datapoint taxonomy wiring and limited-assurance evidence packs',
      price: '$1,099/mo',
      score: 86,
      colorClass: 'bg-lime-50/70 border-lime-200/50 text-lime-700',
      icon: 'Leaf',
      isActiveGlobally: true,
      subscriptionStatus: 'active',
      configSchema: []
    },
    {
      id: 'nis2-vigilance',
      category: 'Cybersecurity',
      name: 'NIS2 Essential-Entity Resilience',
      actId: 'NIS2',
      desc: 'Essential/important entity duties, 24h early-warning notifications and certified incident response drills',
      price: '$899/mo',
      score: 93,
      colorClass: 'bg-violet-50/70 border-violet-200/50 text-violet-700',
      icon: 'Radar',
      isActiveGlobally: true,
      subscriptionStatus: 'active',
      configSchema: []
    },
    {
      id: 'eprivacy-consent',
      category: 'Data Protection & Privacy',
      name: 'ePrivacy Directive Tracking Audits',
      actId: 'EPRIVACY',
      desc: 'Cookie-wall legality, consent-storage tamper-proof logging and 6-month tracking audit cadence',
      price: '$549/mo',
      score: 88,
      colorClass: 'bg-teal-50/70 border-teal-200/50 text-teal-700',
      icon: 'Cookie',
      isActiveGlobally: true,
      subscriptionStatus: 'active',
      configSchema: []
    }
  ];
}
