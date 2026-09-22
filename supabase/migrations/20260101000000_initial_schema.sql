-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector; -- pgvector for compliance embeddings

-- 1. Tenants Table
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    region TEXT NOT NULL CHECK (region IN ('eu-central-1', 'eu-west-1')),
    state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (state IN ('ACTIVE', 'SUSPENDED', 'MAINTENANCE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Compliance Modules Catalog
CREATE TABLE public.compliance_modules (
    id TEXT PRIMARY KEY, -- e.g., 'GDPR_AUDIT', 'AI_ACT_SCREENER'
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tenant Services (Entitlements)
CREATE TABLE public.service_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL REFERENCES public.compliance_modules(id),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BETA', 'DISABLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, module_id)
);

-- 4. Audit Logs (Immutable)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL, -- references auth.users in application logic
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_impersonated BOOLEAN NOT NULL DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tenant Memberships & Global RBAC Matrix
CREATE TABLE public.tenant_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id)
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'EU_REGULATOR', 'TENANT_OWNER', 'TENANT_EDITOR', 'TENANT_AUDITOR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, user_id)
);

-- 6. Compliance Vectors (AI Integrations)
CREATE TABLE public.compliance_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL REFERENCES public.compliance_modules(id),
    clause_reference TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) ZERO LEAKAGE
-- ==========================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_vectors ENABLE ROW LEVEL SECURITY;

-- Helper Function to securely fetch User's bounded tenant IDs
CREATE OR REPLACE FUNCTION auth.get_user_tenant_ids()
RETURNS SETOF UUID AS $$
  SELECT tenant_id FROM public.tenant_memberships WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function to check Global Admin Status
CREATE OR REPLACE FUNCTION auth.is_global_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships 
    WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'EU_REGULATOR')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ==== POLICIES ====

-- Tenants Policy
CREATE POLICY "Tenants are viewable by global admins and tenant members." ON public.tenants
FOR SELECT USING (
    auth.is_global_admin() OR id IN (SELECT auth.get_user_tenant_ids())
);

-- Memberships Policy
CREATE POLICY "Users can view members of their own tenants" ON public.tenant_memberships
FOR SELECT USING (
    auth.is_global_admin() OR tenant_id IN (SELECT auth.get_user_tenant_ids())
);

-- Audit Logs Policy
CREATE POLICY "Audit logs are viewable by tenant auditors and global admins" ON public.audit_logs
FOR SELECT USING (
    auth.is_global_admin() OR tenant_id IN (SELECT auth.get_user_tenant_ids())
);

CREATE POLICY "Audit logs are append-only" ON public.audit_logs
FOR INSERT WITH CHECK (
    tenant_id IN (SELECT auth.get_user_tenant_ids())
);

-- Service Assignments Policy
CREATE POLICY "Users view services mapped to their tenant" ON public.service_assignments
FOR SELECT USING (
    auth.is_global_admin() OR tenant_id IN (SELECT auth.get_user_tenant_ids())
);

-- Compliance Vectors Policy (Strict isolation for AI Search)
CREATE POLICY "Tenant boundary for vectorized compliance data" ON public.compliance_vectors
FOR ALL USING (
    tenant_id IN (SELECT auth.get_user_tenant_ids())
);

-- Modules Policy (Global Dictionary)
CREATE POLICY "Modules catalog is universally viewable" ON public.compliance_modules
FOR SELECT USING (true);
