export const MARKETPLACE_SCHEMA = `
CREATE TABLE IF NOT EXISTS marketplace_apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    developer TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_extended_profile (
    id TEXT PRIMARY KEY,
    organization_id TEXT UNIQUE NOT NULL,
    legal_structure TEXT,
    founded_year INTEGER,
    employee_count_range TEXT,
    annual_revenue_range TEXT,
    headquarters_address TEXT,
    website_url TEXT,
    company_description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    industry_tags TEXT DEFAULT '[]',
    stock_exchange_listed INTEGER DEFAULT 0,
    stock_ticker TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personnel_profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    headline TEXT,
    bio TEXT,
    nationality TEXT,
    profile_photo_url TEXT,
    profile_visibility TEXT DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_governing_body (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    personnel_profile_id TEXT NOT NULL,
    position_title TEXT,
    governing_body_type TEXT,
    is_authorized_signatory INTEGER DEFAULT 0,
    appointed_date TEXT,
    departed_date TEXT,
    is_current INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS governing_body_change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id TEXT NOT NULL,
    personnel_profile_id TEXT,
    action TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personnel_experience_history (
    id TEXT PRIMARY KEY,
    personnel_profile_id TEXT NOT NULL,
    title TEXT,
    company_name TEXT,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personnel_education (
    id TEXT PRIMARY KEY,
    personnel_profile_id TEXT NOT NULL,
    degree TEXT,
    institution TEXT,
    start_year INTEGER,
    end_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personnel_certifications (
    id TEXT PRIMARY KEY,
    personnel_profile_id TEXT NOT NULL,
    name TEXT,
    issuing_organization TEXT,
    issue_date TEXT,
    credential_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personnel_skills (
    id TEXT PRIMARY KEY,
    personnel_profile_id TEXT NOT NULL,
    skill_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personnel_social_links (
    id TEXT PRIMARY KEY,
    personnel_profile_id TEXT NOT NULL,
    platform TEXT,
    profile_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_transaction_readiness (
    id TEXT PRIMARY KEY,
    organization_id TEXT UNIQUE NOT NULL,
    open_to_investment INTEGER DEFAULT 0,
    open_to_acquisition_offers INTEGER DEFAULT 0,
    open_to_merger INTEGER DEFAULT 0,
    seeking_investment_amount_range TEXT,
    valuation_range TEXT,
    visibility_level TEXT DEFAULT 'anonymous',
    requires_nda_before_details INTEGER DEFAULT 1,
    authorized_by_personnel_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    transaction_readiness_id TEXT,
    listing_status TEXT DEFAULT 'draft',
    headline TEXT,
    teaser_description TEXT,
    anonymized_industry_tag TEXT,
    reviewed_by TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ma_interest_expressions (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    target_organization_id TEXT,
    interested_investor_id TEXT,
    interest_type TEXT,
    initial_message TEXT,
    status TEXT DEFAULT 'pending_target_response',
    nda_agreement_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nda_agreements (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    investor_id TEXT NOT NULL,
    status TEXT DEFAULT 'requested',
    signed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deal_rooms (
    id TEXT PRIMARY KEY,
    interest_expression_id TEXT,
    listing_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investor_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    investor_type TEXT,
    firm_name TEXT,
    kyc_verification_status TEXT DEFAULT 'pending',
    kyc_verified_at TIMESTAMP,
    kyc_verified_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketplace_reports (
    id TEXT PRIMARY KEY,
    listing_id TEXT,
    reporter_user_id TEXT,
    reason TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS org_role_assignments (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    org_role TEXT NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS org_role_permissions (
    id TEXT PRIMARY KEY,
    org_role TEXT NOT NULL,
    permission_key TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS org_ip_allowlist (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

