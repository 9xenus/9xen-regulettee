export const CYBER_SECURITY_SCHEMA = `
-- Attack Surface Discovery & Vulnerability Scanning
CREATE TABLE IF NOT EXISTS cyber_asset_inventory (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    asset_type TEXT CHECK (asset_type IN ('domain','subdomain','ip_address','api_endpoint','cloud_bucket','mobile_app')),
    asset_value TEXT NOT NULL,
    discovery_method TEXT CHECK (discovery_method IN ('manual_added','auto_subdomain_enum','dns_discovery')),
    is_actively_monitored INTEGER DEFAULT 1,
    last_scanned_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cyber_vulnerability_scans (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    scan_type TEXT CHECK (scan_type IN ('vulnerability_scan','port_scan','ssl_tls_audit','api_security_test','cloud_misconfig_scan')),
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed')),
    assets_scanned INTEGER DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cyber_vulnerabilities (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES cyber_vulnerability_scans(id) ON DELETE CASCADE,
    asset_id TEXT REFERENCES cyber_asset_inventory(id),
    cve_reference TEXT,
    vulnerability_title TEXT,
    severity TEXT CHECK (severity IN ('critical','high','medium','low','informational')),
    cvss_score REAL,
    description TEXT,
    affected_component TEXT,
    evidence_snapshot_url TEXT,
    exploitability TEXT CHECK (exploitability IN ('actively_exploited','poc_available','theoretical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open','ai_remediation_proposed','fixed','accepted_risk','false_positive')),
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dark-Web Monitoring
CREATE TABLE IF NOT EXISTS cyber_darkweb_monitoring_targets (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    monitor_type TEXT CHECK (monitor_type IN ('email_domain','specific_email','brand_keyword','ip_range')),
    monitor_value TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS cyber_darkweb_exposures (
    id TEXT PRIMARY KEY,
    monitoring_target_id TEXT REFERENCES cyber_darkweb_monitoring_targets(id),
    organization_id TEXT NOT NULL,
    exposure_type TEXT CHECK (exposure_type IN ('leaked_credential','leaked_document','brand_impersonation','data_breach_mention')),
    source_description TEXT,
    affected_email_hash TEXT,
    severity TEXT CHECK (severity IN ('critical','high','medium','low')),
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new' CHECK (status IN ('new','acknowledged','password_reset_forced','resolved'))
);

-- AI Threat Detection
CREATE TABLE IF NOT EXISTS cyber_threat_alerts (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    alert_category TEXT,
    severity TEXT CHECK (severity IN ('critical','high','medium','low')),
    ai_confidence_score REAL,
    ai_generated_summary TEXT,
    raw_signal_data TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open','investigating','confirmed_threat','false_positive','resolved')),
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Posture & AI Remediation
CREATE TABLE IF NOT EXISTS cyber_security_posture_score (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    overall_score INTEGER,
    score_breakdown TEXT, -- JSON
    critical_open_vulnerabilities INTEGER,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cyber_ai_remediation_recommendations (
    id TEXT PRIMARY KEY,
    vulnerability_id TEXT REFERENCES cyber_vulnerabilities(id),
    threat_alert_id TEXT REFERENCES cyber_threat_alerts(id),
    recommendation_text TEXT NOT NULL,
    recommended_priority TEXT CHECK (recommended_priority IN ('immediate','this_week','this_month','backlog')),
    estimated_effort TEXT CHECK (estimated_effort IN ('low','medium','high')),
    auto_fixable INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
