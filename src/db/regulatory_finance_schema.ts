/**
 * B2G Regulatory Finance & Settlement Schema
 * Handles Revenue Sharing, Commission Engines, and Multi-Tier Invoicing.
 */

export const REGULATORY_FINANCE_SCHEMA = `
-- 1. SaaS Platform Billing Configuration for Regulators
CREATE TABLE IF NOT EXISTS regulator_billing_configs (
    id TEXT PRIMARY KEY,
    regulator_id INTEGER NOT NULL UNIQUE,
    base_monthly_fee_cents INTEGER NOT NULL DEFAULT 500000, -- e.g. $5000.00
    commission_rate_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- e.g. 10%
    currency TEXT DEFAULT 'USD',
    billing_day_of_month INTEGER DEFAULT 1,
    auto_invoice_enabled BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regulator_id) REFERENCES governments(id) ON DELETE CASCADE
);

-- 2. Subscription Tracking for Regulators (SaaS Fee)
CREATE TABLE IF NOT EXISTS regulator_subscriptions (
    id TEXT PRIMARY KEY,
    regulator_id INTEGER NOT NULL,
    plan_key TEXT NOT NULL, -- e.g. 'SOVEREIGN_STARTER', 'NATIONAL_CORE', 'CONTINENTAL_MAX'
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'CANCELLED'
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    last_billed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regulator_id) REFERENCES governments(id) ON DELETE CASCADE
);

-- 3. Revenue Settlement: Tracking Penalty Collections and Platform Share
CREATE TABLE IF NOT EXISTS penalty_collections (
    id TEXT PRIMARY KEY,
    penalty_id INTEGER NOT NULL,
    regulator_id INTEGER NOT NULL,
    amount_collected_cents INTEGER NOT NULL,
    platform_commission_amount_cents INTEGER NOT NULL, -- Calculated based on config at time of collection
    commission_rate_snapshot DECIMAL(5,2) NOT NULL, -- The rate used for this specific collection
    transaction_ref TEXT, -- External wire transfer ref or gateway ID
    payment_method TEXT NOT NULL, -- 'WIRE', 'GATEWAY', 'TREASURY'
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_to_platform BOOLEAN DEFAULT 0, -- Whether this commission has been invoiced to the regulator
    platform_invoice_id TEXT, -- Link to the platform_invoices table
    FOREIGN KEY (penalty_id) REFERENCES fines(id) ON DELETE CASCADE,
    FOREIGN KEY (regulator_id) REFERENCES governments(id) ON DELETE CASCADE
);

-- 4. Official e-Receipts for Entities (Enterprises)
CREATE TABLE IF NOT EXISTS penalty_receipts (
    id TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL UNIQUE,
    receipt_number TEXT NOT NULL UNIQUE, -- e.g. 'RCPT-2026-BD-001'
    immutable_tx_hash TEXT NOT NULL UNIQUE, -- SHA-256 Hash
    qr_verification_code TEXT NOT NULL UNIQUE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT,
    FOREIGN KEY (collection_id) REFERENCES penalty_collections(id) ON DELETE CASCADE
);

-- 5. B2G Invoices (Platform to Regulator)
CREATE TABLE IF NOT EXISTS platform_invoices (
    id TEXT PRIMARY KEY,
    regulator_id INTEGER NOT NULL,
    billing_period_label TEXT NOT NULL, -- e.g. 'August 2026'
    base_fee_cents INTEGER NOT NULL,
    total_commission_cents INTEGER NOT NULL,
    grand_total_cents INTEGER NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'ISSUED', 'PAID', 'OVERDUE'
    issued_at TIMESTAMP,
    paid_at TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regulator_id) REFERENCES governments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reg_billing_regulator ON regulator_billing_configs(regulator_id);
CREATE INDEX IF NOT EXISTS idx_penalty_coll_regulator ON penalty_collections(regulator_id);
CREATE INDEX IF NOT EXISTS idx_penalty_coll_penalty ON penalty_collections(penalty_id);
CREATE INDEX IF NOT EXISTS idx_platform_inv_regulator ON platform_invoices(regulator_id);
`;
