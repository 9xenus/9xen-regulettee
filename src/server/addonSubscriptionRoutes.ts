/**
 * 9XEN_REGULETTEE CLIENT ADD-ON SUBSCRIPTIONS & SECTOR-WIDE PACKAGES
 * Real DB-backed add-on subscription lifecycle (subscribe / upgrade / cancel /
 * save-config) plus a sector-wide compliance package catalog covering every
 * major operating sector (e-commerce, banking, healthcare, telecom, logistics,
 * govtech, edtech, gaming, insurance, AI software).
 */

import { Router } from 'express';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { getDb } from '../db/sqlite.js';
import { SuperAdminService } from '../services/superAdminService';
import { BlockchainAuditTrail } from '../services/blockchain-audit-trail.js';
import { broadcastPulse } from '../modules/client-premium/api/routes';

export const addonSubscriptionRouter = Router();

export const ADDON_TIERS = ['STARTER', 'PRO', 'ENTERPRISE'] as const;
export type AddonTier = typeof ADDON_TIERS[number];

export interface AddonDef {
  id: string;
  name: string;
  category: string;
  actId: string;
  desc: string;
  icon: string;
  score: number;
  colorClass: string;
  tiers: Record<AddonTier, number>;
  features: string[];
}

// ---- Sector-wide package catalog -------------------------------------------------
export interface SectorPackage {
  sector: string;
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  description: string;
  regulators: string[];
  includes: string[];
  tiers: Record<AddonTier, number>;
}

export const SECTOR_PACKAGES: SectorPackage[] = [
  {
    sector: 'RETAIL_ECOMMERCE', id: 'pkg-ecommerce', name: 'EU E-Commerce Compliance Suite', icon: 'ShoppingCart', colorClass: 'from-indigo-500 to-blue-600',
    description: 'Omnibus pricing transparency, geoblocking bans, DSA online-marketplace traceability, consumer rights & dark-pattern scanning.',
    regulators: ['DSA', 'Omnibus Directive', 'GDPR', 'UTP Directive'],
    includes: ['Omnibus price-drop authenticity', 'Geo-blocking ban enforcement', 'DSA trader traceability (KYS)', 'Unfair Commercial Practices (dark patterns) AI scanner', 'Online warranty & return rights automation', 'Cookie & consent storefront rules'],
    tiers: { STARTER: 499, PRO: 899, ENTERPRISE: 1799 },
  },
  {
    sector: 'BANKING_FINTECH', id: 'pkg-banking', name: 'Banking & Fintech Regulatory Suite', icon: 'Landmark', colorClass: 'from-sky-500 to-cyan-600',
    description: 'DORA ICT resilience, PSD2/PSD3 payment integrity, AML/CTF watchlisting, and prudential reporting alignment.',
    regulators: ['DORA', 'PSD3', 'AMLD6', 'EBA Guidelines'],
    includes: ['DORA ICT risk & concentration auditing', 'PSD3 strong customer authentication', 'AML/CTF SAR automation & watchlists', 'IBAN/name-check migration readiness', 'Outsourcing register (DORA Art. 28)', 'Basel/Payment incident 24h reporting'],
    tiers: { STARTER: 799, PRO: 1499, ENTERPRISE: 2999 },
  },
  {
    sector: 'HEALTHCARE', id: 'pkg-healthcare', name: 'Healthcare & Life Sciences Suite', icon: 'HeartPulse', colorClass: 'from-rose-500 to-pink-600',
    description: 'HIPAA/FHIR security, MDR/EU IVDR conformity, GDPR health data minimization, and clinical-AI oversight.',
    regulators: ['HIPAA', 'MDR', 'EU AI Act', 'GDPR Health'],
    includes: ['FHIR/HL7 end-to-end encryption controls', 'MDR (EU) 2017/745 conformity evidence', 'Clinical AI HITL oversight gates', 'Patient consent lifecycle (GDPR Art. 9)', 'Data protection impact statement vault', 'Device vigilance & incident reporting'],
    tiers: { STARTER: 699, PRO: 1299, ENTERPRISE: 2499 },
  },
  {
    sector: 'TELECOM_MEDIA', id: 'pkg-telecom', name: 'Telecom & Media RegTech Suite', icon: 'Radio', colorClass: 'from-violet-500 to-purple-600',
    description: 'EU Electronic Communications Code, DMA sector obligations, NIS2 telecom operator security, and digital services oversight.',
    regulators: ['ECC', 'NIS2', 'DMA', 'AVMSD'],
    includes: ['ECC consumer protection & universal service', 'NIS2 telecom essential-entity duties', 'DMA gatekeeper interoperability checks', 'Five-eyes sovereignty & lawful interception audit', 'Emergency 112 routing readiness', 'In-app purchase & AVMSD ad transparency'],
    tiers: { STARTER: 649, PRO: 1199, ENTERPRISE: 2199 },
  },
  {
    sector: 'LOGISTICS_SUPPLY_CHAIN', id: 'pkg-logistics', name: 'Logistics & Supply Chain Suite', icon: 'Truck', colorClass: 'from-amber-500 to-orange-600',
    description: 'Supply-chain due diligence (CSDDD), IOT geolocation privacy, customs/sanction screening, and ESG reporting alignment.',
    regulators: ['CSDDD', 'NIS2', 'GDPR IoT', 'ESRS'],
    includes: ['CSDDD tier-1 vendor due diligence', 'Sanctions & export-control screening', 'IoT geolocation truncation (privacy-by-design)', 'EU deforestation & CBAM data flows', 'ESRS E1-S climate reporting hooks', 'Shipper incident & reroute SLA audit'],
    tiers: { STARTER: 549, PRO: 999, ENTERPRISE: 1899 },
  },
  {
    sector: 'GOVTECH', id: 'pkg-govtech', name: 'GovTech & Public Sector Suite', icon: 'Building2', colorClass: 'from-slate-600 to-slate-900',
    description: 'Sovereign cloud, G2B/G2C protocol, open data (DGA) compliance, and public procurement integrity.',
    regulators: ['DGA', 'Sovereign Cloud', 'G2B Protocol', 'OIOS ISO-27001'],
    includes: ['Sovereign enclave residency attestation', 'G2B portal MFA & audit controls', 'Open data interoperability (DGA Art. 9)', 'Procurement integrity hash-chaining', 'Digital-policy impact assessment', 'Zero-trust IAM for civil services'],
    tiers: { STARTER: 599, PRO: 1099, ENTERPRISE: 2099 },
  },
  {
    sector: 'EDTECH', id: 'pkg-edtech', name: 'EdTech Shield Suite', icon: 'GraduationCap', colorClass: 'from-emerald-500 to-teal-600',
    description: 'GDPR Art. 40 codes for education data, child-appropriate design (K-OK), algorithmic grading bias audit, and export privacy.',
    regulators: ['GDPR', 'AI Act Art. 50', 'COPPA-style', 'FERPA-style'],
    includes: ['Children\'s data processing justification', 'Algorithmic grading bias guardrails', 'Proctoring biometric consent engine', 'Ed-data cross-border transfer checks', 'Learning analytics minimization', 'Home/school data sharing contracts'],
    tiers: { STARTER: 349, PRO: 649, ENTERPRISE: 1249 },
  },
  {
    sector: 'GAMING', id: 'pkg-gaming', name: 'Gaming & Entertainment Suite', icon: 'Gamepad2', colorClass: 'from-fuchsia-500 to-purple-600',
    description: 'Loot-box odds disclosure, underage monetization bans, AVMSD advertising transparency, and player data residency.',
    regulators: ['AVMSD', 'GDPR', 'Belgium Loot-Box law', 'UK Online Safety Act'],
    includes: ['Loot-box probability disclosure', 'Underage payment hard gating', 'Online advertising transparency labels', 'Player data minimization & portability', 'Super-addictive mechanics review', 'Age-verification as-a-service'],
    tiers: { STARTER: 399, PRO: 749, ENTERPRISE: 1399 },
  },
  {
    sector: 'INSURANCE', id: 'pkg-insurance', name: 'Insurance & DORA Suite', icon: 'Shield', colorClass: 'from-blue-500 to-indigo-600',
    description: 'IDD product governance, Solvency II operational risk, DORA reporting, and policy automation fairness.',
    regulators: ['IDD', 'Solvency II', 'DORA', 'EIOPA'],
    includes: ['IDD product oversight & governance', 'Solvency II operational risk mapping', 'DORA incident & threat-led testing', 'Automated underwriting fairness audit', 'Cross-border policyholder disputes', 'POG periodic review automation'],
    tiers: { STARTER: 649, PRO: 1199, ENTERPRISE: 2299 },
  },
  {
    sector: 'AI_SOFTWARE', id: 'pkg-ai-software', name: 'AI Software & LLM Operator Suite', icon: 'BrainCircuit', colorClass: 'from-cyan-500 to-teal-600',
    description: 'EU AI Act conformity (high-risk GPAI), model-card evidence vault, watermarking, and HITL decisioning gates.',
    regulators: ['EU AI Act', 'AI Liability Directive', 'Copyright Directive 2019/790', 'DORA (AI ICT)'],
    includes: ['High-risk & GPAI risk classification', 'Model card + training-data evidence vault', 'Synthetic content watermarking', 'HITL decision-gate middleware', 'Regulatory sandbox participation', 'AI system change-notice (Art. 43)'],
    tiers: { STARTER: 499, PRO: 899, ENTERPRISE: 1799 },
  },
];

// ---- Add-on catalog (client add-ons) ------------------------------------------------
export const ADDON_CATALOG: AddonDef[] = [
  {
    id: 'ecommerce-eu', name: 'EU eCommerce Compliance', category: 'Retail & Commerce', actId: 'DSA', icon: 'ShoppingCart', score: 84,
    colorClass: 'bg-indigo-50/70 border-indigo-200/50 text-indigo-700',
    desc: 'Omnibus pricing, geo-blocking bans, DSA marketplace traceability, consumer rights and dark-pattern AI scanning.',
    tiers: { STARTER: 499, PRO: 899, ENTERPRISE: 1799 },
    features: ['Omnibus price-drop authenticity', 'Geo-blocking ban enforcement', 'DSA trader traceability (KYS)', 'Dark-pattern AI scanner', 'Online warranty & return automation', 'Consent storefront rules'],
  },
  {
    id: 'gdpr-compliance', name: 'GDPR Compliance Add-On', category: 'Data Protection & Privacy', actId: 'GDPR', icon: 'ShieldCheck', score: 96,
    colorClass: 'bg-emerald-50/70 border-emerald-200/50 text-emerald-700',
    desc: 'Article 30 RoPA, Article 32 security controls, automated DSAR processing and consent management.',
    tiers: { STARTER: 499, PRO: 799, ENTERPRISE: 1499 },
    features: ['RoPA (Art. 30) automation', 'DSAR 30-day SLA engine', 'Consent lifecycle manager', 'Article 32 security controls', 'DPO register & breach notify (Art. 33)', 'Cross-border SCC transfer maps'],
  },
  {
    id: 'ai-act-auditor', name: 'EU AI Act Risk Classification & Audit', category: 'Public Sector & Govtech', actId: 'EU_AI_ACT', icon: 'Brain', score: 94,
    colorClass: 'bg-indigo-50/70 border-indigo-200/50 text-indigo-700',
    desc: 'High-risk system categorization, post-market monitoring enclaves and transparency logging.',
    tiers: { STARTER: 699, PRO: 1299, ENTERPRISE: 2499 },
    features: ['High-risk classification engine', 'Model documentation vault', 'Post-market monitoring enclave', 'Transparency (Art. 50) logging', 'HITL oversight gates', 'Conformity assessment kits'],
  },
  {
    id: 'dora-resilience', name: 'DORA Digital Operational Resilience', category: 'Financial Services', actId: 'DORA', icon: 'Server', score: 98,
    colorClass: 'bg-sky-50/70 border-sky-200/50 text-sky-700',
    desc: 'ICT risk management frameworks, third-party concentration auditing and incident reporting.',
    tiers: { STARTER: 799, PRO: 1499, ENTERPRISE: 2999 },
    features: ['ICT risk management (Art. 5-9)', 'Third-party concentration register', 'Incident 24h reporting (Art. 21)', 'Digital operational resilience tests', 'Threat-led penetration testing (TLPT)', 'Exit-strategy continuity plans'],
  },
  {
    id: 'edtech-shield', name: 'EdTech Shield', category: 'Enterprise Compliance', actId: 'GDPR_EDU', icon: 'GraduationCap', score: 90,
    colorClass: 'bg-emerald-50/70 border-emerald-200/50 text-emerald-700',
    desc: 'Child-data protection, algorithmic grading bias and proctoring biometric consent.',
    tiers: { STARTER: 349, PRO: 649, ENTERPRISE: 1249 },
    features: ['Children data justification engine', 'Grading bias guardrails', 'Proctoring biometric consent', 'Learning analytics minimization', 'Ed-data transfer checks'],
  },
  {
    id: 'govtech-eu', name: 'EU GovTech Public Portal', category: 'Public Sector & Govtech', actId: 'G2B', icon: 'Building2', score: 92,
    colorClass: 'bg-slate-50/70 border-slate-300/50 text-slate-700',
    desc: 'Sovereign enclave residency, G2B portal MFA and procurement integrity hash-chaining.',
    tiers: { STARTER: 599, PRO: 1099, ENTERPRISE: 2099 },
    features: ['Sovereign enclave attestation', 'G2B portal MFA controls', 'Open data interoperability', 'Procurement integrity hash-chaining', 'Zero-trust civil IAM'],
  },
  {
    id: 'gaming-entertainment', name: 'Gaming & Entertainment Safety', category: 'Media & Entertainment', actId: 'AVMSD', icon: 'Gamepad2', score: 87,
    colorClass: 'bg-fuchsia-50/70 border-fuchsia-200/50 text-fuchsia-700',
    desc: 'Loot-box odds disclosure, underage monetization gating and AVMSD ad transparency.',
    tiers: { STARTER: 399, PRO: 749, ENTERPRISE: 1399 },
    features: ['Loot-box probability disclosure', 'Underage payment hard gating', 'Advertising transparency labels', 'Player data minimization', 'Age-verification as-a-service'],
  },
  {
    id: 'logistics-supply-chain', name: 'Logistics & Supply Chain RegTech', category: 'Supply Chain', actId: 'CSDDD', icon: 'Truck', score: 88,
    colorClass: 'bg-amber-50/70 border-amber-200/50 text-amber-700',
    desc: 'CSDDD vendor due diligence, sanctions screening and IoT geolocation privacy.',
    tiers: { STARTER: 549, PRO: 999, ENTERPRISE: 1899 },
    features: ['CSDDD tier-1 due diligence', 'Sanctions & export screening', 'IoT geolocation truncation', 'CBAM data flows', 'ESRS climate reporting hooks'],
  },
  {
    id: 'healthtech', name: 'Healthcare & Life Sciences', category: 'Healthcare & Life Sciences', actId: 'HIPAA', icon: 'HeartPulse', score: 91,
    colorClass: 'bg-rose-50/70 border-rose-200/50 text-rose-700',
    desc: 'FHIR encryption, MDR conformity evidence and clinical-AI human oversight.',
    tiers: { STARTER: 699, PRO: 1299, ENTERPRISE: 2499 },
    features: ['FHIR/HL7 e2e encryption', 'MDR conformity evidence', 'Clinical AI HITL gates', 'Patient consent lifecycle', 'Vigilance incident reporting'],
  },
  {
    id: 'ccpa-optout', name: 'California CCPA/CPRA Opt-Out & GPC', category: 'Data Protection & Privacy', actId: 'CCPA', icon: 'UserX', score: 89,
    colorClass: 'bg-cyan-50/70 border-cyan-200/50 text-cyan-700',
    desc: 'Global Privacy Control signal handling, Do Not Sell/Share enforcement and CPRA sensitive-information minimization.',
    tiers: { STARTER: 349, PRO: 649, ENTERPRISE: 1249 },
    features: ['GPC opt-out signal interception', 'Do Not Sell/Share consumers registry', 'CPRA sensitive data minimization', 'Service-provider contract fingerprinting', 'Sales 3X quarterly disclosure file'],
  },
  {
    id: 'whistleblower', name: 'EU Whistleblower Directive (2023/2751)', category: 'Corporate Governance', actId: 'WHISTLE_BLOWER', icon: 'Megaphone', score: 90,
    colorClass: 'bg-orange-50/70 border-orange-200/50 text-orange-700',
    desc: 'Confidential internal reporting channel, retaliation safeguards and 3-month handling SLAs under Directive 2023/2751.',
    tiers: { STARTER: 249, PRO: 449, ENTERPRISE: 849 },
    features: ['Anonymous confidential channel', 'Retaliation safeguard case file', '3-month acknowledgement & handling SLA', 'Roles (legal entity + group) mapping', 'Protected reporting retention 5-year'],
  },
  {
    id: 'csrd-esg', name: 'CSRD & ESRS ESG Reporting Suite', category: 'Enterprise IT', actId: 'CSRD', icon: 'Leaf', score: 86,
    colorClass: 'bg-lime-50/70 border-lime-200/50 text-lime-700',
    desc: 'CSRD double-materiality workspace, ESRS datapoint taxonomy wiring and limited-assurance evidence packs.',
    tiers: { STARTER: 599, PRO: 1099, ENTERPRISE: 2099 },
    features: ['Double-materiality assessment', 'ESRS 12-topic datapoint taxonomy', 'Assurance evidence packing', 'Value-chain boundary mapping', 'GHG Scope 1-3 data collection'],
  },
  {
    id: 'nis2-vigilance', name: 'NIS2 Essential-Entity Resilience', category: 'Cybersecurity', actId: 'NIS2', icon: 'Radar', score: 93,
    colorClass: 'bg-violet-50/70 border-violet-200/50 text-violet-700',
    desc: 'Essential/important entity duties, 24h early-warning notifications and certified incident response drills.',
    tiers: { STARTER: 499, PRO: 899, ENTERPRISE: 1799 },
    features: ['Essential/important entity classifier', '24h early-warning (Art. 21) drafting', 'ICS/OT asset discovery', 'TLP incident-sharing feed', 'Cross-border response drill sandbox'],
  },
  {
    id: 'eprivacy-consent', name: 'ePrivacy Directive Tracking Audits', category: 'Data Protection & Privacy', actId: 'EPRIVACY', icon: 'Cookie', score: 88,
    colorClass: 'bg-teal-50/70 border-teal-200/50 text-teal-700',
    desc: 'Cookie-wall legality, consent-storage tamper-proof logging and 6-month tracking audit cadence.',
    tiers: { STARTER: 299, PRO: 549, ENTERPRISE: 1049 },
    features: ['Cookie-wall legality review', 'Tamper-proof consent storage', 'IAB TCF string validator', '6-month tracking audit cadence', 'Legitimate-interest justification vault'],
  },
];

export const SECTOR_LIST = SECTOR_PACKAGES.map((p) => p.sector);

ensureTables();

function ensureTables() {
  const db = getDb();
  if (!db || typeof db.exec !== 'function') return;
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS client_addon_subscriptions (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        addon_id TEXT NOT NULL,
        tier TEXT NOT NULL DEFAULT 'STARTER',
        price_monthly REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_reason TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, addon_id)
      );
      CREATE TABLE IF NOT EXISTS sector_packages (
        id TEXT PRIMARY KEY,
        sector TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price_starter REAL NOT NULL DEFAULT 0,
        price_pro REAL NOT NULL DEFAULT 0,
        price_enterprise REAL NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS addon_config (
        tenant_id TEXT NOT NULL,
        addon_id TEXT NOT NULL,
        config_values TEXT NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tenant_id, addon_id)
      );
    `);
    const pkgCount = (db.prepare('SELECT COUNT(*) c FROM sector_packages').get() as any)?.c ?? 0;
    if (pkgCount === 0) {
      db.transaction(() => {
        for (const p of SECTOR_PACKAGES) {
          db.prepare('INSERT INTO sector_packages (id, sector, name, price_starter, price_pro, price_enterprise, enabled) VALUES (?,?,?,?,?,?,?)')
            .run(p.id, p.sector, p.name, p.tiers.STARTER, p.tiers.PRO, p.tiers.ENTERPRISE, 1);
        }
      })();
    }
  } catch (err: any) {
    console.warn('[ADDON_SUB] ensureTables warning:', err?.message);
  }
}

const anchor = (action: string, resource: string, refId: string, payload: any) => {
  try { BlockchainAuditTrail.anchor({ actor: 'client-billing', action, category: 'ADDON_SUBSCRIPTION', resource, refId, payload }); } catch {}
};

const periodEnd = (months: number) => { const d = new Date(); d.setMonth(d.getMonth() + months); return d.toISOString(); };

const subRow = (db: any, tenantId: string) => {
  const rows = (db.prepare('SELECT addon_id, tier, price_monthly, status, subscribed_at, current_period_end FROM client_addon_subscriptions WHERE tenant_id = ?').all(tenantId) || []) as any[];
  const map: Record<string, any> = {};
  for (const r of rows) map[r.addon_id] = { tier: r.tier, priceMonthly: r.price_monthly, status: r.status, subscribedAt: r.subscribed_at, periodEnd: r.current_period_end };
  return map;
};

// GET /api/v1/addons/catalog — addon catalog + tenant subscription state + sector packages
addonSubscriptionRouter.get('/catalog', (req, res) => {
  try {
    const db = getDb();
    const tenantId = String((req.query as any).tenantId || 'default-tenant');
    const subs = subRow(db, tenantId);
    const addons = ADDON_CATALOG.map((a) => ({
      ...a,
      price: `$${a.tiers.PRO}/mo`,
      subscriptionStatus: subs[a.id]?.status === 'active' ? 'active' : 'available',
      activeTier: subs[a.id]?.tier || null,
      activePriceMonthly: subs[a.id]?.priceMonthly ?? null,
      periodEnd: subs[a.id]?.periodEnd ?? null,
      isActiveGlobally: true,
      configSchema: [],
    }));
    res.json({ success: true, addons, sectorPackages: SECTOR_PACKAGES });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/addons/sector-packages
addonSubscriptionRouter.get('/sector-packages', (req, res) => {
  try {
    res.json({ success: true, sectorPackages: SECTOR_PACKAGES, sectors: SECTOR_LIST });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/addons/subscriptions
addonSubscriptionRouter.get('/subscriptions', (req, res) => {
  try {
    const db = getDb();
    const tenantId = String((req.query as any).tenantId || 'default-tenant');
    const rows = db.prepare('SELECT * FROM client_addon_subscriptions WHERE tenant_id = ? ORDER BY subscribed_at DESC').all(tenantId) as any[];
    res.json({ success: true, count: rows.length, subscriptions: rows, activeMonthlyTotal: rows.filter((r) => r.status === 'active').reduce((s, r) => s + Number(r.price_monthly || 0), 0) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/addons/subscribe — subscribe new add-on (or renew)
addonSubscriptionRouter.post(
  '/subscribe',
  [body('addonId').isString().notEmpty(), body('tenantId').isString().notEmpty(), body('tier').optional().isIn(ADDON_TIERS)],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const db = getDb();
      const b = req.body || {};
      const addon = ADDON_CATALOG.find((a) => a.id === b.addonId);
      if (!addon) return res.status(404).json({ success: false, error: `Add-on '${b.addonId}' not found in catalog.` });
      const tier = (b.tier || 'STARTER') as AddonTier;
      const price = addon.tiers[tier] || addon.tiers.STARTER;
      const periodEndM = String(b.periodMonths || '1').match(/^\d+$/g) ? Number(b.periodMonths) : 1;
      db.prepare(`
        INSERT INTO client_addon_subscriptions (id, tenant_id, addon_id, tier, price_monthly, status, subscribed_at, current_period_end, updated_at)
        VALUES (?,?,?,?,?, 'active', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(tenant_id, addon_id) DO UPDATE SET
          tier = excluded.tier, price_monthly = excluded.price_monthly, status = 'active',
          cancel_reason = '', subscribed_at = CURRENT_TIMESTAMP, current_period_end = excluded.current_period_end, updated_at = CURRENT_TIMESTAMP
      `).run(`sub_${crypto.randomBytes(4).toString('hex')}`, b.tenantId, addon.id, tier, price, periodEnd(periodEndM));
      SuperAdminService.logAdminAction('client-subscription', 'ADDON_SUBSCRIBED', 'client_addon_subscriptions', addon.id, { tenantId: b.tenantId, tier, priceMonthly: price });
      anchor('ADDON_SUBSCRIBED', `client_addon_subscriptions/${b.tenantId}/${addon.id}`, addon.id, { tenantId: b.tenantId, tier, priceMonthly: price });
      try { broadcastPulse({ type: 'ADDON_SUB', title: `Add-on subscribed: ${addon.name}`, message: `${addon.name} (${tier}) activated for ${b.tenantId}.`, severity: 'INFO', source: `tenant:${b.tenantId}` }); } catch {}
      res.status(201).json({ success: true, message: `${addon.name} (${tier}) subscribed at $${price}/mo.`, addonId: addon.id, tier, priceMonthly: price });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/v1/addons/upgrade — tier upgrade (client add-on subscription upgrade)
addonSubscriptionRouter.post(
  '/upgrade',
  [body('addonId').isString().notEmpty(), body('tenantId').isString().notEmpty(), body('tier').isIn(ADDON_TIERS)],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const db = getDb();
      const b = req.body || {};
      const addon = ADDON_CATALOG.find((a) => a.id === b.addonId);
      if (!addon) return res.status(404).json({ success: false, error: 'Add-on not found in catalog.' });
      const existing = db.prepare('SELECT * FROM client_addon_subscriptions WHERE tenant_id = ? AND addon_id = ?').get(b.tenantId, addon.id) as any;
      if (!existing) {
        return subscribeNow(db, b.tenantId, addon, b.tier as AddonTier, res);
      }
      if (existing.status !== 'active') {
        // re-activate as upgrade
        db.prepare(`UPDATE client_addon_subscriptions SET tier = ?, price_monthly = ?, status = 'active', cancel_reason = '', current_period_end = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND addon_id = ?`)
          .run(b.tier, addon.tiers[b.tier as AddonTier], periodEnd(1), b.tenantId, addon.id);
      } else {
        db.prepare(`UPDATE client_addon_subscriptions SET tier = ?, price_monthly = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND addon_id = ?`)
          .run(b.tier, addon.tiers[b.tier as AddonTier], b.tenantId, addon.id);
      }
      SuperAdminService.logAdminAction('client-subscription', 'ADDON_UPGRADED', 'client_addon_subscriptions', addon.id, { tenantId: b.tenantId, tier: b.tier });
      anchor('ADDON_UPGRADED', `client_addon_subscriptions/${b.tenantId}/${addon.id}`, addon.id, { tenantId: b.tenantId, fromTier: existing.tier, toTier: b.tier });
      res.json({ success: true, message: `${addon.name} upgraded to ${b.tier} ($${addon.tiers[b.tier as AddonTier]}/mo).`, addonId: addon.id, tier: b.tier });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

function subscribeNow(db: any, tenantId: string, addon: AddonDef, tier: AddonTier, res: any) {
  db.prepare(`INSERT INTO client_addon_subscriptions (id, tenant_id, addon_id, tier, price_monthly, status, subscribed_at, current_period_end, updated_at)
              VALUES (?,?,?,?,?, 'active', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)`)
    .run(`sub_${crypto.randomBytes(4).toString('hex')}`, tenantId, addon.id, tier, addon.tiers[tier], periodEnd(1));
  res.status(201).json({ success: true, message: `${addon.name} (${tier}) subscribed at $${addon.tiers[tier]}/mo.`, addonId: addon.id, tier });
}

// POST /api/v1/addons/cancel — cancel add-on subscription
addonSubscriptionRouter.post(
  '/cancel',
  [body('addonId').isString().notEmpty(), body('tenantId').isString().notEmpty(), body('reason').optional().isString()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const db = getDb();
      const b = req.body || {};
      const addon = ADDON_CATALOG.find((a) => a.id === b.addonId);
      db.prepare(`UPDATE client_addon_subscriptions SET status = 'canceled', cancel_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND addon_id = ?`)
        .run(b.reason || 'Canceled by tenant admin', b.tenantId, b.addonId);
      const name = addon?.name || b.addonId;
      anchor('ADDON_CANCELED', `client_addon_subscriptions/${b.tenantId}/${b.addonId}`, b.addonId, { tenantId: b.tenantId, reason: b.reason });
      res.json({ success: true, message: `${name} subscription canceled.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// POST /api/v1/addons/save-config — per-tenant add-on configuration vault
addonSubscriptionRouter.post(
  '/save-config',
  [body('addonId').isString().notEmpty(), body('tenantId').isString().notEmpty(), body('configValues').isObject()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const db = getDb();
      const b = req.body || {};
      db.prepare(`INSERT INTO addon_config (tenant_id, addon_id, config_values, updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP)
                  ON CONFLICT(tenant_id, addon_id) DO UPDATE SET config_values = excluded.config_values, updated_at = CURRENT_TIMESTAMP`)
        .run(b.tenantId, b.addonId, JSON.stringify(b.configValues));
      anchor('ADDON_CONFIG_SAVED', `addon_config/${b.tenantId}/${b.addonId}`, b.addonId, { tenantId: b.tenantId, keys: Object.keys(b.configValues) });
      res.json({ success: true, message: 'Configuration committed to sovereign vault.', addonId: b.addonId });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);