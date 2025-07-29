-- Create comprehensive civic intelligence crawler and knowledge graph tables

-- Entity types for the knowledge graph
CREATE TYPE public.civic_entity_type AS ENUM (
  'politician',
  'ministry',
  'government_agency',
  'political_party',
  'civil_society_org',
  'media_outlet',
  'election_event',
  'policy_document',
  'government_statement'
);

-- Data source types for tracking source credibility
CREATE TYPE public.source_type AS ENUM (
  'government_official',
  'parliamentary',
  'electoral_commission',
  'state_media',
  'independent_media',
  'social_media_verified',
  'civil_society',
  'international_org',
  'academic',
  'unknown'
);

-- Crawl status tracking
CREATE TYPE public.crawl_status AS ENUM (
  'scheduled',
  'running',
  'completed',
  'failed',
  'paused'
);

-- Civic Knowledge Graph - Central entity registry
CREATE TABLE public.civic_knowledge_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type public.civic_entity_type NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT[] DEFAULT ARRAY[]::TEXT[],
  canonical_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  
  -- Contact and location data
  official_website TEXT,
  official_email TEXT,
  official_phone TEXT,
  headquarters_address TEXT,
  region TEXT,
  
  -- Social media handles
  twitter_handle TEXT,
  facebook_page TEXT,
  linkedin_profile TEXT,
  youtube_channel TEXT,
  instagram_handle TEXT,
  
  -- Administrative data
  registration_number TEXT,
  establishment_date DATE,
  dissolution_date DATE,
  
  -- Verification and confidence
  verification_status TEXT DEFAULT 'unverified',
  confidence_score NUMERIC(5,2) DEFAULT 50.0,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Source tracking
  primary_source_url TEXT,
  source_type public.source_type DEFAULT 'unknown',
  auto_imported BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Entity relationships (who works for whom, party memberships, etc.)
CREATE TABLE public.civic_entity_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_entity_id UUID NOT NULL REFERENCES public.civic_knowledge_entities(id) ON DELETE CASCADE,
  to_entity_id UUID NOT NULL REFERENCES public.civic_knowledge_entities(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'works_for', 'member_of', 'leads', 'part_of', 'reports_to'
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  confidence_score NUMERIC(5,2) DEFAULT 50.0,
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(from_entity_id, to_entity_id, relationship_type)
);

-- Crawl sources configuration
CREATE TABLE public.civic_crawl_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  source_type public.source_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Crawling configuration
  crawl_frequency_hours INTEGER DEFAULT 24, -- How often to crawl
  max_pages_per_crawl INTEGER DEFAULT 100,
  crawl_selectors JSONB DEFAULT '{}', -- CSS selectors for data extraction
  rate_limit_seconds INTEGER DEFAULT 2,
  
  -- Authentication if needed
  requires_auth BOOLEAN DEFAULT false,
  auth_config JSONB DEFAULT '{}',
  
  -- Processing rules
  entity_extraction_rules JSONB DEFAULT '{}',
  content_filters JSONB DEFAULT '{}',
  
  -- Performance tracking
  last_crawl_at TIMESTAMP WITH TIME ZONE,
  last_successful_crawl_at TIMESTAMP WITH TIME ZONE,
  total_crawls INTEGER DEFAULT 0,
  total_entities_found INTEGER DEFAULT 0,
  avg_crawl_duration_seconds INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crawl sessions and status tracking
CREATE TABLE public.civic_crawl_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.civic_crawl_sources(id) ON DELETE CASCADE,
  status public.crawl_status NOT NULL DEFAULT 'scheduled',
  
  -- Session details
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Results
  pages_crawled INTEGER DEFAULT 0,
  entities_found INTEGER DEFAULT 0,
  entities_updated INTEGER DEFAULT 0,
  entities_created INTEGER DEFAULT 0,
  
  -- Error handling
  error_message TEXT,
  warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  crawler_version TEXT DEFAULT '1.0',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Raw crawled data before processing
CREATE TABLE public.civic_crawl_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.civic_crawl_sessions(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  page_title TEXT,
  raw_content TEXT,
  extracted_data JSONB DEFAULT '{}',
  content_hash TEXT, -- To detect changes
  
  -- Processing status
  processed BOOLEAN DEFAULT false,
  processing_errors TEXT[] DEFAULT ARRAY[]::TEXT[],
  entities_extracted UUID[] DEFAULT ARRAY[]::UUID[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Verification and fact-checking results
CREATE TABLE public.civic_entity_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.civic_knowledge_entities(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  
  -- Verification details
  previous_value TEXT,
  verified_value TEXT,
  verification_source TEXT NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL,
  
  -- Verification metadata
  verification_method TEXT, -- 'automated', 'manual', 'cross_reference'
  verified_by TEXT, -- System or user who performed verification
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'disputed'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- News and content monitoring
CREATE TABLE public.civic_content_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  title TEXT NOT NULL,
  content_preview TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Content analysis
  mentions_entities UUID[] DEFAULT ARRAY[]::UUID[], -- Which entities are mentioned
  sentiment_score NUMERIC(5,2),
  topic_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  importance_score NUMERIC(5,2) DEFAULT 50.0,
  
  -- Source information
  author TEXT,
  publication TEXT,
  source_type public.source_type,
  credibility_score NUMERIC(5,2) DEFAULT 50.0,
  
  -- Processing status
  processed BOOLEAN DEFAULT false,
  ai_analysis JSONB DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.civic_knowledge_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_crawl_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_crawl_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_crawl_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_entity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_content_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public readable, admin manageable
CREATE POLICY "Civic entities are publicly readable"
ON public.civic_knowledge_entities FOR SELECT USING (true);

CREATE POLICY "Admins can manage civic entities"
ON public.civic_knowledge_entities FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Entity relationships are publicly readable"
ON public.civic_entity_relationships FOR SELECT USING (true);

CREATE POLICY "Admins can manage relationships"
ON public.civic_entity_relationships FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Crawl sources are publicly readable"
ON public.civic_crawl_sources FOR SELECT USING (true);

CREATE POLICY "Admins can manage crawl sources"
ON public.civic_crawl_sources FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Crawl sessions are publicly readable"
ON public.civic_crawl_sessions FOR SELECT USING (true);

CREATE POLICY "Admins can manage crawl sessions"
ON public.civic_crawl_sessions FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Crawl data is admin only"
ON public.civic_crawl_data FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Verifications are publicly readable"
ON public.civic_entity_verifications FOR SELECT USING (true);

CREATE POLICY "Admins can manage verifications"
ON public.civic_entity_verifications FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Content monitoring is publicly readable"
ON public.civic_content_monitoring FOR SELECT USING (true);

CREATE POLICY "Admins can manage content monitoring"
ON public.civic_content_monitoring FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_civic_entities_type ON public.civic_knowledge_entities(entity_type);
CREATE INDEX idx_civic_entities_name ON public.civic_knowledge_entities USING gin(name gin_trgm_ops);
CREATE INDEX idx_civic_entities_aliases ON public.civic_knowledge_entities USING gin(aliases);
CREATE INDEX idx_civic_entities_status ON public.civic_knowledge_entities(status);
CREATE INDEX idx_civic_entities_verification ON public.civic_knowledge_entities(verification_status);

CREATE INDEX idx_entity_relationships_from ON public.civic_entity_relationships(from_entity_id);
CREATE INDEX idx_entity_relationships_to ON public.civic_entity_relationships(to_entity_id);
CREATE INDEX idx_entity_relationships_type ON public.civic_entity_relationships(relationship_type);
CREATE INDEX idx_entity_relationships_current ON public.civic_entity_relationships(is_current);

CREATE INDEX idx_crawl_sources_active ON public.civic_crawl_sources(is_active);
CREATE INDEX idx_crawl_sources_type ON public.civic_crawl_sources(source_type);
CREATE INDEX idx_crawl_sources_last_crawl ON public.civic_crawl_sources(last_crawl_at);

CREATE INDEX idx_crawl_sessions_source ON public.civic_crawl_sessions(source_id);
CREATE INDEX idx_crawl_sessions_status ON public.civic_crawl_sessions(status);
CREATE INDEX idx_crawl_sessions_started ON public.civic_crawl_sessions(started_at DESC);

CREATE INDEX idx_crawl_data_session ON public.civic_crawl_data(session_id);
CREATE INDEX idx_crawl_data_processed ON public.civic_crawl_data(processed);
CREATE INDEX idx_crawl_data_hash ON public.civic_crawl_data(content_hash);

CREATE INDEX idx_entity_verifications_entity ON public.civic_entity_verifications(entity_id);
CREATE INDEX idx_entity_verifications_status ON public.civic_entity_verifications(status);
CREATE INDEX idx_entity_verifications_verified_at ON public.civic_entity_verifications(verified_at DESC);

CREATE INDEX idx_content_monitoring_published ON public.civic_content_monitoring(published_at DESC);
CREATE INDEX idx_content_monitoring_entities ON public.civic_content_monitoring USING gin(mentions_entities);
CREATE INDEX idx_content_monitoring_topics ON public.civic_content_monitoring USING gin(topic_categories);
CREATE INDEX idx_content_monitoring_processed ON public.civic_content_monitoring(processed);

-- Add update triggers
CREATE TRIGGER update_civic_knowledge_entities_updated_at
  BEFORE UPDATE ON public.civic_knowledge_entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_entity_relationships_updated_at
  BEFORE UPDATE ON public.civic_entity_relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_crawl_sources_updated_at
  BEFORE UPDATE ON public.civic_crawl_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default crawl sources for Cameroon
INSERT INTO public.civic_crawl_sources (source_name, base_url, source_type, crawl_frequency_hours, entity_extraction_rules) VALUES
-- Government Sources
('MINAT Political Parties', 'https://minat.gov.cm/annuaires/partis-politiques/', 'government_official', 24, '{"entity_types": ["political_party"], "selectors": {".party-item": "party_data"}}'),
('PRC Cameroon', 'https://www.prc.cm/', 'government_official', 12, '{"entity_types": ["politician", "government_statement"], "selectors": {"article": "content"}}'),
('ELECAM', 'https://elecam.cm/', 'electoral_commission', 6, '{"entity_types": ["election_event", "politician"], "selectors": {".news-item": "news"}}'),
('National Assembly', 'https://www.assemblee-nationale.cm/', 'parliamentary', 24, '{"entity_types": ["politician", "policy_document"], "selectors": {".deputy": "deputy_info"}}'),
('Senate Cameroon', 'https://www.senat.cm/', 'parliamentary', 24, '{"entity_types": ["politician"], "selectors": {".senator": "senator_info"}}'),

-- Media Sources
('Cameroon Tribune', 'https://www.cameroon-tribune.cm/', 'state_media', 6, '{"entity_types": ["government_statement", "politician"], "selectors": {"article": "news_content"}}'),
('Journal du Cameroun', 'https://www.journalducameroun.com/', 'independent_media', 6, '{"entity_types": ["politician", "government_statement"], "selectors": {".post": "article_content"}}'),
('Mimi Mefo Info', 'https://mimimefoinfo.com/', 'independent_media', 6, '{"entity_types": ["politician", "civil_society_org"], "selectors": {".entry": "article_content"}}'),
('Africa News Cameroon', 'https://www.africanews.com/tag/cameroon/', 'independent_media', 12, '{"entity_types": ["politician", "government_statement"], "selectors": {".article": "news_content"}}'),

-- Ministry Websites
('Ministry of Communication', 'https://mincom.gov.cm/', 'government_official', 24, '{"entity_types": ["government_statement", "ministry"], "selectors": {".news": "official_statement"}}'),
('Ministry of Public Health', 'https://minsante.cm/', 'government_official', 24, '{"entity_types": ["ministry", "government_statement"], "selectors": {".announcement": "health_news"}}');

-- Insert some initial entities to populate the knowledge graph
INSERT INTO public.civic_knowledge_entities (entity_type, name, canonical_name, description, status, source_type) VALUES
-- Key Government Institutions
('ministry', 'Ministry of Territorial Administration', 'Ministry of Territorial Administration (MINAT)', 'Responsible for internal security, local government, and political party registration', 'active', 'government_official'),
('ministry', 'Ministry of Communication', 'Ministry of Communication (MINCOM)', 'Handles government communication and media relations', 'active', 'government_official'),
('ministry', 'Ministry of Public Health', 'Ministry of Public Health (MINSANTE)', 'National health policy and healthcare delivery', 'active', 'government_official'),
('government_agency', 'Elections Cameroon', 'Elections Cameroon (ELECAM)', 'National electoral commission responsible for organizing elections', 'active', 'electoral_commission'),
('government_agency', 'Cameroon Radio Television', 'Cameroon Radio Television (CRTV)', 'State-owned media organization', 'active', 'state_media'),

-- Key Political Parties (from existing data)
('political_party', 'Cameroon People''s Democratic Movement', 'Cameroon People''s Democratic Movement (CPDM)', 'Ruling political party of Cameroon', 'active', 'government_official'),
('political_party', 'Social Democratic Front', 'Social Democratic Front (SDF)', 'Main opposition political party', 'active', 'government_official'),

-- Key Politicians
('politician', 'Paul Biya', 'Paul Biya', 'President of the Republic of Cameroon', 'active', 'government_official'),

-- Media Outlets
('media_outlet', 'Cameroon Tribune', 'Cameroon Tribune', 'State-owned newspaper and online news portal', 'active', 'state_media'),
('media_outlet', 'Journal du Cameroun', 'Journal du Cameroun', 'Independent online news portal', 'active', 'independent_media');