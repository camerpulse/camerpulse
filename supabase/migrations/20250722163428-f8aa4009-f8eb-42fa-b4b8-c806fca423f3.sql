-- Create audit and leaks registry system
CREATE TYPE public.audit_source_type AS ENUM (
  'government_audit', 'third_party_review', 'whistleblower_leak', 
  'media_investigation', 'user_submission', 'ngo_report'
);

CREATE TYPE public.document_status AS ENUM (
  'pending_review', 'approved', 'rejected', 'flagged', 'archived'
);

CREATE TYPE public.authenticity_rating AS ENUM (
  'unverified', 'low_confidence', 'medium_confidence', 'high_confidence', 'officially_verified'
);

-- Main audit registry table
CREATE TABLE public.audit_registry (
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
CREATE TABLE public.audit_documents (
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
CREATE TABLE public.audit_watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  notification_preferences JSONB NOT NULL DEFAULT '{"new_updates": true, "status_changes": true, "related_content": false}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, audit_id)
);

-- Audit flags and reports
CREATE TABLE public.audit_content_flags (
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
CREATE TABLE public.audit_analytics (
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
CREATE TABLE public.whistleblower_protection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  protection_level TEXT NOT NULL DEFAULT 'standard' CHECK (protection_level IN ('none', 'standard', 'high', 'maximum')),
  anonymous_id TEXT NOT NULL, -- Generated hash for tracking without revealing identity
  contact_method_encrypted TEXT, -- Encrypted contact info if provided
  additional_protection_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.audit_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whistleblower_protection ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_registry
CREATE POLICY "Public can view approved audits" 
ON public.audit_registry 
FOR SELECT 
USING (document_status = 'approved');

CREATE POLICY "Users can submit audits" 
ON public.audit_registry 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL OR is_anonymous_submission = true);

CREATE POLICY "Users can update their own pending audits" 
ON public.audit_registry 
FOR UPDATE 
USING (auth.uid() = submitted_by AND document_status = 'pending_review');

CREATE POLICY "Admins can manage all audits" 
ON public.audit_registry 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for audit_documents
CREATE POLICY "Public can view approved audit documents" 
ON public.audit_documents 
FOR SELECT 
USING (
  access_level = 'public' AND 
  EXISTS (
    SELECT 1 FROM public.audit_registry 
    WHERE id = audit_documents.audit_id AND document_status = 'approved'
  )
);

CREATE POLICY "Admins can manage all documents" 
ON public.audit_documents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for audit_watchlists
CREATE POLICY "Users can manage their own watchlists" 
ON public.audit_watchlists 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for audit_content_flags
CREATE POLICY "Users can flag content" 
ON public.audit_content_flags 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL OR is_anonymous = true);

CREATE POLICY "Users can view their own flags" 
ON public.audit_content_flags 
FOR SELECT 
USING (auth.uid() = flagged_by);

CREATE POLICY "Admins can manage all flags" 
ON public.audit_content_flags 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for audit_analytics
CREATE POLICY "Public can view analytics" 
ON public.audit_analytics 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage analytics" 
ON public.audit_analytics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for whistleblower_protection (highly restricted)
CREATE POLICY "Only admins can access whistleblower protection records" 
ON public.whistleblower_protection 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create indexes for performance
CREATE INDEX idx_audit_registry_status ON public.audit_registry(document_status);
CREATE INDEX idx_audit_registry_source_type ON public.audit_registry(source_type);
CREATE INDEX idx_audit_registry_entity ON public.audit_registry(entity_audited);
CREATE INDEX idx_audit_registry_region ON public.audit_registry(region);
CREATE INDEX idx_audit_registry_created_at ON public.audit_registry(created_at DESC);
CREATE INDEX idx_audit_registry_fiscal_year ON public.audit_registry(fiscal_year);
CREATE INDEX idx_audit_registry_tags ON public.audit_registry USING GIN(tags);

CREATE INDEX idx_audit_documents_audit_id ON public.audit_documents(audit_id);
CREATE INDEX idx_audit_documents_file_type ON public.audit_documents(file_type);

CREATE INDEX idx_audit_watchlists_user_id ON public.audit_watchlists(user_id);
CREATE INDEX idx_audit_watchlists_audit_id ON public.audit_watchlists(audit_id);

CREATE INDEX idx_audit_flags_audit_id ON public.audit_content_flags(audit_id);
CREATE INDEX idx_audit_flags_status ON public.audit_content_flags(status);

CREATE INDEX idx_audit_analytics_entity_type ON public.audit_analytics(entity_type, entity_id);
CREATE INDEX idx_audit_analytics_period ON public.audit_analytics(period_start, period_end);

-- Enable realtime for key tables
ALTER TABLE public.audit_registry REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_registry;

ALTER TABLE public.audit_watchlists REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_watchlists;

ALTER TABLE public.audit_content_flags REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_content_flags;

-- Create trigger for updated_at
CREATE TRIGGER update_audit_registry_updated_at
BEFORE UPDATE ON public.audit_registry
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();