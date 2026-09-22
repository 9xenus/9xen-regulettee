export const ENTERPRISE_KYC_SCHEMA = `
-- 3.1 Core Identity (Public Users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- UUID
    tenant_id TEXT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    password_hash TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('regulator','client','lawyer_consultant', 'admin', 'super_admin', 'SUPER_ADMIN', 'ADMIN', 'TENANT_OWNER', 'CLIENT', 'user', 'EU_REGULATOR', 'LAWYER', 'COMPLIANCE_OFFICER', 'AUDITOR')),
    registration_country TEXT DEFAULT 'DE',
    registration_status TEXT DEFAULT 'draft'
        CHECK (registration_status IN (
            'draft','email_verified','phone_verified','kyc_submitted',
            'document_uploaded','eid_pending','under_review','approved','rejected','suspended'
        )),
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    mfa_enabled INTEGER DEFAULT 0,
    account_locked INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    channel TEXT CHECK (channel IN ('email','sms')),
    destination_masked TEXT,
    otp_hash TEXT NOT NULL,
    purpose TEXT CHECK (purpose IN ('registration','login_mfa','password_reset')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    ip_address_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    device_fingerprint TEXT,
    ip_address_hash TEXT,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Region-Aware Configuration
CREATE TABLE IF NOT EXISTS country_registration_requirements (
    id TEXT PRIMARY KEY,
    country_code TEXT UNIQUE NOT NULL,
    applicable_regulation TEXT,
    required_kyc_fields TEXT, -- JSONB equivalent in SQLite
    eid_verification_required INTEGER DEFAULT 0,
    regulator_email_domain_whitelist TEXT, -- JSON Array
    default_language_code TEXT DEFAULT 'en',
    otp_delivery_preference TEXT DEFAULT 'sms'
);

-- 3.3 Role-Specific KYC/KYB
CREATE TABLE IF NOT EXISTS kyc_regulator (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    government_body_name TEXT NOT NULL,
    department TEXT,
    designation TEXT,
    official_email_domain TEXT NOT NULL,
    jurisdiction_country TEXT NOT NULL,
    authorization_letter_doc_id TEXT,
    government_id_doc_id TEXT,
    mandate TEXT,
    professional_bio TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_client_company (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    company_legal_name TEXT NOT NULL,
    company_registration_number TEXT NOT NULL,
    tax_id TEXT,
    industry_type TEXT,
    incorporation_country TEXT NOT NULL,
    registered_address TEXT NOT NULL,
    ubo_declared INTEGER DEFAULT 0,
    registration_doc_id TEXT,
    tax_certificate_doc_id TEXT,
    management_board TEXT, -- JSON Array of BoardMember
    yearly_revenue TEXT,
    employee_count TEXT,
    global_presence TEXT, -- JSON Array of Branch
    professional_bio TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_client_ubo (
    id TEXT PRIMARY KEY,
    kyc_client_company_id TEXT REFERENCES kyc_client_company(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    ownership_percentage REAL,
    nationality TEXT,
    id_document_doc_id TEXT
);

CREATE TABLE IF NOT EXISTS kyc_lawyer_consultant (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    professional_type TEXT CHECK (professional_type IN ('lawyer','consultant','auditor','dpo')),
    bar_license_number TEXT,
    licensing_authority TEXT,
    licensing_jurisdiction TEXT NOT NULL,
    years_of_practice INTEGER,
    firm_name TEXT,
    professional_indemnity_insurance INTEGER DEFAULT 0,
    license_doc_id TEXT,
    specialization TEXT, -- JSON Array
    professional_bio TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_hash TEXT,
    verified INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_review_queue (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id TEXT REFERENCES admin_users(id),
    review_status TEXT DEFAULT 'pending'
        CHECK (review_status IN ('pending','in_review','approved','rejected','needs_more_info')),
    risk_score INTEGER,
    rejection_reason TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_screening_results (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    screening_type TEXT CHECK (screening_type IN ('sanctions_list','pep_check','adverse_media')),
    match_found INTEGER DEFAULT 0,
    match_details TEXT, -- JSON
    screened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eid_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    eid_provider TEXT,
    provider_reference_id TEXT,
    verification_status TEXT CHECK (verification_status IN ('pending','verified','failed','expired')),
    verified_full_name TEXT,
    verification_payload_ref TEXT,
    verified_at TIMESTAMP
);

-- 3.4 SaaS Admin
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL
        CHECK (role IN ('super_admin','org_admin','billing_admin','compliance_officer','viewer')),
    mfa_enabled INTEGER DEFAULT 0,
    account_locked INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_invites (
    id TEXT PRIMARY KEY,
    invited_email TEXT NOT NULL,
    invited_role TEXT NOT NULL,
    invited_by TEXT REFERENCES admin_users(id),
    invite_token_hash TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','revoked')),
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_mfa_config (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT UNIQUE REFERENCES admin_users(id) ON DELETE CASCADE,
    mfa_method TEXT CHECK (mfa_method IN ('totp','sms','email')),
    totp_secret_encrypted TEXT,
    backup_codes_hash TEXT, -- JSON Array
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT REFERENCES admin_users(id) ON DELETE CASCADE,
    access_token_jti TEXT NOT NULL,
    refresh_token_hash TEXT NOT NULL,
    step_up_verified_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user_id TEXT REFERENCES admin_users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    ip_address_hash TEXT,
    metadata TEXT, -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 Enterprise-Grade KYB + KYC Relational Architecture (Section 3 of Enterprise Spec)
CREATE TABLE IF NOT EXISTS company_entities (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    entity_type TEXT DEFAULT 'LLC', -- LLC, PLC, Pvt Ltd, AG, GmbH, Inc, etc.
    registration_number TEXT NOT NULL,
    tax_id TEXT,
    incorporation_date TEXT,
    incorporation_country TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    industry_code TEXT, -- NAICS / SIC / NACE
    website TEXT,
    employee_count_band TEXT DEFAULT '10-50',
    yearly_revenue_band TEXT DEFAULT '1M-10M',
    parent_entity_id TEXT,
    parent_entity_name TEXT,
    subsidiaries_json TEXT, -- JSON Array of subsidiary names
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    founding_year INTEGER DEFAULT 2020,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','in_review','pending','verified','rejected','suspended')),
    verification_tier TEXT DEFAULT 'standard' CHECK (verification_tier IN ('basic','standard','enhanced','enterprise')),
    risk_score INTEGER DEFAULT 15,
    risk_tier TEXT DEFAULT 'LOW' CHECK (risk_tier IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_addresses (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES company_entities(id) ON DELETE CASCADE,
    address_type TEXT NOT NULL DEFAULT 'registered' CHECK (address_type IN ('registered','operational','billing','branch','subsidiary')),
    country TEXT NOT NULL,
    state TEXT,
    city TEXT NOT NULL,
    postal_code TEXT,
    line1 TEXT NOT NULL,
    line2 TEXT,
    is_primary INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS management_persons (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES company_entities(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Director', -- Director, CEO, CFO, COO, Signatory, UBO, Compliance_Officer
    is_ubo INTEGER DEFAULT 0,
    ownership_percentage REAL DEFAULT 0.0,
    date_of_birth TEXT,
    nationality TEXT,
    government_id_type TEXT DEFAULT 'PASSPORT',
    government_id_number TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending','in_review','verified','rejected','flagged')),
    kyc_verified_at TIMESTAMP,
    risk_score INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_verifications (
    id TEXT PRIMARY KEY,
    person_id TEXT NOT NULL REFERENCES management_persons(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'Persona', -- Persona, Sumsub, Veriff, iDenfy
    verification_type TEXT NOT NULL DEFAULT 'document' CHECK (verification_type IN ('document','liveness','biometric','sanctions','pep')),
    result TEXT NOT NULL DEFAULT 'pass' CHECK (result IN ('pass','fail','review','pending')),
    raw_response TEXT, -- JSON
    risk_score INTEGER DEFAULT 5,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyb_verifications (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES company_entities(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'Sumsub', -- Sumsub, Middesk, LexisNexis, Trulioo, Alloy
    check_type TEXT NOT NULL DEFAULT 'registry_lookup' CHECK (check_type IN ('registry_lookup','UBO_check','sanctions_screen','adverse_media','license_check')),
    result TEXT NOT NULL DEFAULT 'pass' CHECK (result IN ('pass','fail','review','pending')),
    raw_response TEXT, -- JSON
    risk_score INTEGER DEFAULT 10,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_documents (
    id TEXT PRIMARY KEY,
    entity_id TEXT REFERENCES company_entities(id) ON DELETE CASCADE,
    person_id TEXT REFERENCES management_persons(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL, -- Certificate_of_Incorporation, Articles_of_Association, Business_License, Tax_Certificate, Proof_of_Address, UBO_Declaration
    file_name TEXT,
    file_size TEXT,
    file_url TEXT NOT NULL,
    file_hash TEXT,
    uploaded_by TEXT,
    verified_by TEXT,
    verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending','verified','rejected')),
    expiry_date TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyb_compliance_profiles (
    id TEXT PRIMARY KEY,
    entity_id TEXT UNIQUE NOT NULL REFERENCES company_entities(id) ON DELETE CASCADE,
    aml_program_declared INTEGER DEFAULT 1,
    source_of_funds TEXT DEFAULT 'Commercial Revenue / Institutional Funding',
    industry_license_number TEXT,
    regulator_name TEXT,
    regulator_registration_no TEXT,
    regulatory_filings TEXT, -- JSON Array of filings
    last_audit_date TEXT,
    compliance_officer_name TEXT,
    compliance_officer_contact TEXT,
    sanctions_screening_version TEXT DEFAULT 'OFAC-EU-UN-2026.3',
    continuous_monitoring_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delegate_access (
    id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES company_entities(id) ON DELETE CASCADE,
    delegate_user_id TEXT,
    delegate_name TEXT NOT NULL,
    delegate_email TEXT NOT NULL,
    delegate_type TEXT NOT NULL DEFAULT 'lawyer' CHECK (delegate_type IN ('lawyer','consultant','auditor','dpo')),
    firm_name TEXT,
    permissions TEXT NOT NULL, -- JSON Array: ['read_profile','upload_docs','respond_regulator','file_filings']
    granted_by TEXT NOT NULL,
    granted_by_name TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
    expires_at TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id TEXT NOT NULL REFERENCES company_entities(id) ON DELETE CASCADE,
    actor_id TEXT,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL DEFAULT 'admin', -- admin, lawyer, consultant, regulator, auditor, system
    action TEXT NOT NULL,
    before_state TEXT,
    after_state TEXT,
    ip_address TEXT DEFAULT '127.0.0.1',
    tamper_hash TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
