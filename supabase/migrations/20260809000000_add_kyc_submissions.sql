-- Migration: Add kyc_submissions table in Postgres
-- Timestamp: 20260809000000

-- 1. Create Enum Type for KYC Submission Status
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN 
        CREATE TYPE public.kyc_status AS ENUM ('pending', 'verified', 'rejected'); 
    END IF; 
END $$;

-- 2. Create kyc_submissions Table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    status public.kyc_status NOT NULL DEFAULT 'pending',
    reviewer_note TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Create Indexes for Common Query Targets
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);

-- 5. Row Level Security Policies
CREATE POLICY "Users can view their own KYC submissions" 
    ON public.kyc_submissions FOR SELECT 
    USING (auth.uid() = user_id OR auth.is_global_admin());

CREATE POLICY "Users can insert their own KYC submissions" 
    ON public.kyc_submissions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins/regulators can update KYC submissions" 
    ON public.kyc_submissions FOR UPDATE 
    USING (auth.is_global_admin());
