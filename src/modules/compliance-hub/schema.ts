export const COMPLIANCE_HUB_SCHEMA = `
CREATE TABLE IF NOT EXISTS compliance_modules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    category TEXT NOT NULL,
    jurisdiction TEXT NOT NULL DEFAULT 'GLOBAL',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('REGISTERED', 'ACTIVE', 'INACTIVE', 'DISABLED')),
    config_json TEXT DEFAULT '{}',
    entry_point TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_score_snapshots (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    framework TEXT NOT NULL,
    overall_score REAL NOT NULL,
    grade TEXT NOT NULL,
    status TEXT NOT NULL,
    breakdown_json TEXT DEFAULT '{}',
    integrity_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_report_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('JSON', 'CSV', 'PDF', 'MARKDOWN')),
    framework TEXT,
    description TEXT,
    sections_json TEXT DEFAULT '[]',
    config_json TEXT DEFAULT '{}',
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_change_acknowledgements (
    id TEXT PRIMARY KEY,
    update_ref TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    acknowledged_by TEXT,
    action_plan_notes TEXT,
    acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(update_ref, tenant_id)
);
`;

export const COMPLIANCE_HUB_SEED = `
INSERT OR IGNORE INTO compliance_frameworks (code, version, name, description, is_active) VALUES
('GDPR', 'EU-2016/679', 'General Data Protection Regulation', 'EU data protection and privacy regulation', 1),
('EU_AI_ACT', '2024/1689', 'EU AI Act', 'Horizontal regulation for AI systems in the EU', 1),
('NIS2', 'EU-2022/2555', 'NIS2 Directive', 'Network and Information Security Directive 2', 1),
('DORA', 'EU-2022/2554', 'Digital Operational Resilience Act', 'ICT risk management for financial entities', 1),
('CCPA', 'CA-2018', 'California Consumer Privacy Act', 'California privacy rights law', 1),
('SOC2', 'AICPA-2017', 'SOC 2 Trust Services Criteria', 'Service organization controls attestation', 1),
('KSA_PDPL', 'SA-2021', 'Personal Data Protection Law', 'Saudi Arabia data protection law', 1),
('AMLD6', 'EU-2018/843', 'Anti-Money Laundering Directive 6', 'EU AML/CFT framework', 1);
`;