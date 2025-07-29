-- Plugin Marketplace and Remote Loader System

-- Plugin marketplace entries
CREATE TABLE public.plugin_marketplace (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id TEXT NOT NULL UNIQUE,
  plugin_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  detailed_description TEXT,
  version TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  author_email TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Plugin source
  source_type TEXT NOT NULL CHECK (source_type IN ('local', 'remote', 'github')),
  source_url TEXT,
  bundle_url TEXT,
  github_repo TEXT,
  
  -- Marketplace status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'deprecated')),
  is_official BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metrics
  download_count BIGINT DEFAULT 0,
  install_count BIGINT DEFAULT 0,
  rating_average NUMERIC(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  
  -- Plugin metadata
  permissions_required JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  compatibility_version TEXT,
  supported_platforms TEXT[] DEFAULT '{"web"}',
  
  -- Security
  security_scan_status TEXT DEFAULT 'pending' CHECK (security_scan_status IN ('pending', 'passed', 'failed', 'manual_review')),
  security_scan_results JSONB DEFAULT '{}',
  digital_signature TEXT,
  
  -- Publishing
  published_at TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin submissions (approval queue)
CREATE TABLE public.plugin_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id TEXT NOT NULL,
  submitter_id UUID NOT NULL REFERENCES auth.users(id),
  submitter_name TEXT NOT NULL,
  
  -- Submission data
  submission_type TEXT NOT NULL CHECK (submission_type IN ('new', 'update', 'resubmission')),
  plugin_data JSONB NOT NULL,
  source_files_url TEXT,
  manifest_data JSONB NOT NULL,
  
  -- Review process
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_changes')),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  
  -- Admin actions
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin security scans
CREATE TABLE public.plugin_security_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id TEXT NOT NULL,
  submission_id UUID REFERENCES public.plugin_submissions(id),
  scan_type TEXT NOT NULL CHECK (scan_type IN ('automated', 'manual', 'rescan')),
  
  -- Scan results
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'passed', 'failed', 'manual_review')),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Security checks
  malicious_patterns_found JSONB DEFAULT '[]',
  dependency_vulnerabilities JSONB DEFAULT '[]',
  permission_analysis JSONB DEFAULT '{}',
  code_quality_score INTEGER,
  
  -- Manual review
  requires_manual_review BOOLEAN DEFAULT false,
  manual_review_reason TEXT,
  manual_reviewer_id UUID REFERENCES auth.users(id),
  manual_review_notes TEXT,
  
  -- Scan metadata
  scan_duration_ms INTEGER,
  scanned_files TEXT[],
  scan_engine_version TEXT DEFAULT '1.0.0',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Plugin ratings and reviews
CREATE TABLE public.plugin_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Metadata
  version_reviewed TEXT,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(plugin_id, user_id)
);

-- Plugin downloads/installs tracking
CREATE TABLE public.plugin_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  download_type TEXT NOT NULL CHECK (download_type IN ('download', 'install', 'update')),
  
  -- Installation details
  installation_source TEXT CHECK (installation_source IN ('marketplace', 'direct_url', 'admin')),
  user_platform TEXT DEFAULT 'web',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Tracking
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Remote plugin cache
CREATE TABLE public.remote_plugin_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id TEXT NOT NULL UNIQUE,
  source_url TEXT NOT NULL,
  
  -- Cached data
  bundle_content BYTEA,
  manifest_data JSONB NOT NULL,
  content_hash TEXT NOT NULL,
  
  -- Cache metadata
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_validated TIMESTAMP WITH TIME ZONE,
  is_valid BOOLEAN DEFAULT true,
  
  -- Performance
  bundle_size_bytes BIGINT,
  compression_type TEXT DEFAULT 'gzip'
);

-- Plugin blocklist
CREATE TABLE public.plugin_blocklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id TEXT NOT NULL,
  blocked_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Blocking details
  block_type TEXT NOT NULL CHECK (block_type IN ('security', 'policy', 'dmca', 'spam', 'manual')),
  reason TEXT NOT NULL,
  severity TEXT DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Scope
  block_scope TEXT DEFAULT 'global' CHECK (block_scope IN ('global', 'region', 'organization')),
  affected_regions TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin developer profiles
CREATE TABLE public.plugin_developers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  
  -- Developer info
  developer_name TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  website TEXT,
  github_username TEXT,
  twitter_handle TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_partner BOOLEAN DEFAULT false,
  partner_tier TEXT CHECK (partner_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Stats
  total_plugins INTEGER DEFAULT 0,
  total_downloads BIGINT DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0.0,
  
  -- Settings
  notification_preferences JSONB DEFAULT '{"new_reviews": true, "downloads": false, "security_alerts": true}',
  revenue_share_agreement BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.plugin_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_plugin_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_developers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Plugin marketplace - public read, admin write
CREATE POLICY "Public can view approved plugins" ON public.plugin_marketplace 
FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can manage all marketplace plugins" ON public.plugin_marketplace 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "Developers can view their own plugins" ON public.plugin_marketplace 
FOR SELECT USING (auth.uid() = author_id);

-- Plugin submissions
CREATE POLICY "Users can create submissions" ON public.plugin_submissions 
FOR INSERT WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Users can view their own submissions" ON public.plugin_submissions 
FOR SELECT USING (auth.uid() = submitter_id);

CREATE POLICY "Admins can manage all submissions" ON public.plugin_submissions 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Plugin ratings
CREATE POLICY "Users can manage their own ratings" ON public.plugin_ratings 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view all ratings" ON public.plugin_ratings 
FOR SELECT USING (true);

-- Plugin downloads - admins only
CREATE POLICY "Admins can view download analytics" ON public.plugin_downloads 
FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

CREATE POLICY "System can track downloads" ON public.plugin_downloads 
FOR INSERT WITH CHECK (true);

-- Security scans - admins only
CREATE POLICY "Admins can manage security scans" ON public.plugin_security_scans 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Remote plugin cache - system use
CREATE POLICY "System can manage plugin cache" ON public.remote_plugin_cache 
FOR ALL USING (true);

-- Plugin blocklist - admins only
CREATE POLICY "Admins can manage blocklist" ON public.plugin_blocklist 
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Plugin developers
CREATE POLICY "Users can create developer profile" ON public.plugin_developers 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own developer profile" ON public.plugin_developers 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view developer profiles" ON public.plugin_developers 
FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_plugin_marketplace_status ON public.plugin_marketplace(status);
CREATE INDEX idx_plugin_marketplace_category ON public.plugin_marketplace(category);
CREATE INDEX idx_plugin_marketplace_author ON public.plugin_marketplace(author_id);
CREATE INDEX idx_plugin_marketplace_featured ON public.plugin_marketplace(is_featured) WHERE is_featured = true;
CREATE INDEX idx_plugin_submissions_status ON public.plugin_submissions(status);
CREATE INDEX idx_plugin_submissions_submitter ON public.plugin_submissions(submitter_id);
CREATE INDEX idx_plugin_ratings_plugin ON public.plugin_ratings(plugin_id);
CREATE INDEX idx_plugin_downloads_plugin ON public.plugin_downloads(plugin_id);
CREATE INDEX idx_plugin_downloads_created ON public.plugin_downloads(created_at);

-- Update triggers
CREATE TRIGGER update_plugin_marketplace_updated_at
  BEFORE UPDATE ON public.plugin_marketplace
  FOR EACH ROW
  EXECUTE FUNCTION public.update_realtime_updated_at();

CREATE TRIGGER update_plugin_submissions_updated_at
  BEFORE UPDATE ON public.plugin_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_realtime_updated_at();

CREATE TRIGGER update_plugin_developers_updated_at
  BEFORE UPDATE ON public.plugin_developers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_realtime_updated_at();