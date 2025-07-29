-- Create audit and leaks registry system (avoiding existing types)

-- Check if types exist, create only if they don't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE public.document_status AS ENUM (
            'pending_review', 'approved', 'rejected', 'flagged', 'archived'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'authenticity_rating') THEN
        CREATE TYPE public.authenticity_rating AS ENUM (
            'unverified', 'low_confidence', 'medium_confidence', 'high_confidence', 'officially_verified'
        );
    END IF;
END $$;

-- Main audit registry table
CREATE TABLE IF NOT EXISTS public.audit_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_title TEXT NOT NULL CHECK (length(document_title) > 0 AND length(document_title) <= 200),
  entity_audited TEXT NOT NULL CHECK (length(entity_audited) > 0 AND length(entity_audited) <= 100),
  fiscal_year INTEGER CHECK (fiscal_year >= 1960 AND fiscal_year <= 2100),
  audit_period_start DATE,
  audit_period_end DATE,
  audit_summary TEXT CHECK (length(audit_summary) <= 2000),
  audit_score NUMERIC(5,2) CHECK (audit_score >= 0 AND audit_score <= 100),
  source_type audit_source_type NOT NULL,
  source_origin TEXT CHECK (length(source_origin) <= 500),
  document_status document_status NOT NULL DEFAULT 'pending_review',
  authenticity_rating authenticity_rating NOT NULL DEFAULT 'unverified',
  is_anonymous_submission BOOLEAN NOT NULL DEFAULT false,
  region TEXT CHECK (length(region) <= 100),
  linked_institution_id UUID,
  linked_project_ids UUID[],
  download_count INTEGER NOT NULL DEFAULT 0,
  flag_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  submitted_by UUID, -- Can be null for anonymous submissions
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document files table
CREATE TABLE IF NOT EXISTS public.audit_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL CHECK (length(file_name) > 0 AND length(file_name) <= 255),
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  file_type TEXT NOT NULL CHECK (length(file_type) <= 50),
  is_primary_document BOOLEAN NOT NULL DEFAULT false,
  encryption_key TEXT, -- For sensitive documents
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  upload_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checksum TEXT, -- For integrity verification
  access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'restricted', 'confidential'))
);

-- User watchlists for audits
CREATE TABLE IF NOT EXISTS public.audit_watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  notification_preferences JSONB NOT NULL DEFAULT '{"new_updates": true, "status_changes": true, "related_content": false}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, audit_id)
);

-- Audit flags and reports
CREATE TABLE IF NOT EXISTS public.audit_content_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES auth.users(id),
  flag_reason TEXT NOT NULL CHECK (flag_reason IN ('misinformation', 'tampering', 'inappropriate', 'spam', 'copyright', 'other')),
  flag_description TEXT CHECK (length(flag_description) <= 1000),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit analytics for dashboards
CREATE TABLE IF NOT EXISTS public.audit_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('views', 'downloads', 'flags', 'shares', 'searches')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('audit', 'entity', 'region', 'system')),
  entity_id UUID, -- Can reference audit_id or other entities
  metric_value NUMERIC NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Whistleblower protection records (encrypted)
CREATE TABLE IF NOT EXISTS public.whistleblower_protection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  protection_level TEXT NOT NULL DEFAULT 'standard' CHECK (protection_level IN ('none', 'standard', 'high', 'maximum')),
  anonymous_id TEXT NOT NULL, -- Generated hash for tracking without revealing identity
  contact_method_encrypted TEXT, -- Encrypted contact info if provided
  additional_protection_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (only if not already enabled)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'audit_registry' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.audit_registry ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS for other tables
ALTER TABLE public.audit_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whistleblower_protection ENABLE ROW LEVEL SECURITY;

-- Create policies (with IF NOT EXISTS equivalent)
DO $$
BEGIN
    -- Policies for audit_registry
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_registry' 
        AND policyname = 'Public can view approved audits'
    ) THEN
        CREATE POLICY "Public can view approved audits" 
        ON public.audit_registry 
        FOR SELECT 
        USING (document_status = 'approved');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_registry' 
        AND policyname = 'Users can submit audits'
    ) THEN
        CREATE POLICY "Users can submit audits" 
        ON public.audit_registry 
        FOR INSERT 
        WITH CHECK (auth.uid() IS NOT NULL OR is_anonymous_submission = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_registry' 
        AND policyname = 'Admins can manage all audits'
    ) THEN
        CREATE POLICY "Admins can manage all audits" 
        ON public.audit_registry 
        FOR ALL 
        USING (EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'::app_role
        ));
    END IF;
END $$;

-- Create indexes (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_audit_registry_status ON public.audit_registry(document_status);
CREATE INDEX IF NOT EXISTS idx_audit_registry_source_type ON public.audit_registry(source_type);
CREATE INDEX IF NOT EXISTS idx_audit_registry_entity ON public.audit_registry(entity_audited);
CREATE INDEX IF NOT EXISTS idx_audit_registry_created_at ON public.audit_registry(created_at DESC);

-- Enable realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'audit_registry'
    ) THEN
        ALTER TABLE public.audit_registry REPLICA IDENTITY FULL;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_registry;
    END IF;
END $$;