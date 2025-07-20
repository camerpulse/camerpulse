-- Create enum types for audit registry
CREATE TYPE audit_source_type AS ENUM (
  'government_official',
  'third_party_review',
  'whistleblower_leak',
  'media_report',
  'user_submitted',
  'investigative_journalism'
);

CREATE TYPE document_authenticity_status AS ENUM (
  'verified',
  'pending_verification',
  'questionable',
  'disputed',
  'fake_flagged'
);

CREATE TYPE audit_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'flagged',
  'archived'
);

-- Main audit registry table
CREATE TABLE public.audit_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_title TEXT NOT NULL,
  entity_audited TEXT NOT NULL,
  fiscal_year TEXT,
  audit_period_start DATE,
  audit_period_end DATE,
  audit_summary TEXT,
  audit_score NUMERIC,
  source_type audit_source_type NOT NULL,
  source_organization TEXT,
  uploaded_files JSONB DEFAULT '[]'::jsonb,
  linked_projects JSONB DEFAULT '[]'::jsonb,
  linked_institutions JSONB DEFAULT '[]'::jsonb,
  document_authenticity document_authenticity_status DEFAULT 'pending_verification',
  status audit_status DEFAULT 'pending_review',
  is_anonymous_submission BOOLEAN DEFAULT false,
  is_sensitive BOOLEAN DEFAULT false,
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  region TEXT,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  flag_count INTEGER DEFAULT 0,
  watchlist_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit document files table
CREATE TABLE public.audit_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  is_primary_document BOOLEAN DEFAULT false,
  upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- User watchlists for audits
CREATE TABLE public.audit_watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, audit_id)
);

-- Audit flags and reports
CREATE TABLE public.audit_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  flagged_by UUID NOT NULL REFERENCES auth.users(id),
  flag_reason TEXT NOT NULL,
  flag_description TEXT,
  flag_status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit comments and discussions
CREATE TABLE public.audit_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.audit_comments(id),
  is_verified_expert BOOLEAN DEFAULT false,
  expert_credentials TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit analytics tracking
CREATE TABLE public.audit_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audit_registry(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'view', 'download', 'share', 'flag', 'watchlist'
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_registry
CREATE POLICY "Public can view approved audits" 
ON public.audit_registry FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can submit audits" 
ON public.audit_registry FOR INSERT 
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own pending audits" 
ON public.audit_registry FOR UPDATE 
USING (auth.uid() = submitted_by AND status = 'draft');

CREATE POLICY "Admins can manage all audits" 
ON public.audit_registry FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for audit_documents
CREATE POLICY "Documents follow audit visibility" 
ON public.audit_documents FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.audit_registry 
  WHERE id = audit_documents.audit_id AND status = 'approved'
));

CREATE POLICY "Users can upload documents to their audits" 
ON public.audit_documents FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage all documents" 
ON public.audit_documents FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for audit_watchlists
CREATE POLICY "Users can manage their own watchlists" 
ON public.audit_watchlists FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for audit_flags
CREATE POLICY "Users can flag audits" 
ON public.audit_flags FOR INSERT 
WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Users can view their own flags" 
ON public.audit_flags FOR SELECT 
USING (auth.uid() = flagged_by);

CREATE POLICY "Admins can manage all flags" 
ON public.audit_flags FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for audit_comments
CREATE POLICY "Users can view comments on approved audits" 
ON public.audit_comments FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.audit_registry 
  WHERE id = audit_comments.audit_id AND status = 'approved'
));

CREATE POLICY "Users can create comments" 
ON public.audit_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.audit_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for audit_analytics
CREATE POLICY "System can insert analytics" 
ON public.audit_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view analytics" 
ON public.audit_analytics FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_registry_updated_at
  BEFORE UPDATE ON public.audit_registry
  FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();

CREATE TRIGGER update_audit_comments_updated_at
  BEFORE UPDATE ON public.audit_comments
  FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();

-- Function to track audit interactions
CREATE OR REPLACE FUNCTION track_audit_interaction(
  p_audit_id UUID,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_analytics (
    audit_id, user_id, action_type, metadata, ip_address
  ) VALUES (
    p_audit_id, auth.uid(), p_action_type, p_metadata, inet_client_addr()
  );
  
  -- Update counters on main table
  IF p_action_type = 'view' THEN
    UPDATE public.audit_registry 
    SET view_count = view_count + 1 
    WHERE id = p_audit_id;
  ELSIF p_action_type = 'download' THEN
    UPDATE public.audit_registry 
    SET download_count = download_count + 1 
    WHERE id = p_audit_id;
  ELSIF p_action_type = 'flag' THEN
    UPDATE public.audit_registry 
    SET flag_count = flag_count + 1 
    WHERE id = p_audit_id;
  ELSIF p_action_type = 'watchlist_add' THEN
    UPDATE public.audit_registry 
    SET watchlist_count = watchlist_count + 1 
    WHERE id = p_audit_id;
  ELSIF p_action_type = 'watchlist_remove' THEN
    UPDATE public.audit_registry 
    SET watchlist_count = watchlist_count - 1 
    WHERE id = p_audit_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_statistics()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_audits INTEGER;
  approved_audits INTEGER;
  pending_audits INTEGER;
  flagged_audits INTEGER;
  total_downloads BIGINT;
  avg_audit_score NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_audits FROM public.audit_registry;
  SELECT COUNT(*) INTO approved_audits FROM public.audit_registry WHERE status = 'approved';
  SELECT COUNT(*) INTO pending_audits FROM public.audit_registry WHERE status = 'pending_review';
  SELECT COUNT(*) INTO flagged_audits FROM public.audit_registry WHERE status = 'flagged';
  SELECT COALESCE(SUM(download_count), 0) INTO total_downloads FROM public.audit_registry;
  SELECT COALESCE(AVG(audit_score), 0) INTO avg_audit_score FROM public.audit_registry WHERE audit_score IS NOT NULL;
  
  result := jsonb_build_object(
    'total_audits', total_audits,
    'approved_audits', approved_audits,
    'pending_audits', pending_audits,
    'flagged_audits', flagged_audits,
    'total_downloads', total_downloads,
    'avg_audit_score', avg_audit_score,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;