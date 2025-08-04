-- Create petition categories enum
CREATE TYPE public.petition_category AS ENUM (
  'governance', 'justice', 'education', 'health', 'agriculture', 
  'digital_rights', 'local_issues', 'corruption', 'security', 
  'environment', 'traditional_authority', 'others'
);

-- Create petition status enum
CREATE TYPE public.petition_status AS ENUM (
  'draft', 'pending_review', 'active', 'completed', 'rejected', 'archived'
);

-- Create petition target type enum
CREATE TYPE public.petition_target_type AS ENUM (
  'government_official', 'ministry', 'local_council', 'traditional_authority', 
  'institution', 'law_reform', 'general_public'
);

-- Create petitions table
CREATE TABLE public.petitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_type petition_target_type NOT NULL DEFAULT 'government_official',
  expected_outcome TEXT NOT NULL,
  action_plan TEXT,
  category petition_category NOT NULL DEFAULT 'others',
  petition_type TEXT NOT NULL DEFAULT 'general',
  
  -- Creator info
  created_by UUID NOT NULL,
  creator_name TEXT NOT NULL,
  creator_alias TEXT,
  creator_verified BOOLEAN DEFAULT false,
  
  -- Status and moderation
  status petition_status NOT NULL DEFAULT 'pending_review',
  moderation_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Geo and linking
  region TEXT,
  village_id UUID,
  institution_id UUID,
  institution_type TEXT,
  
  -- Engagement metrics
  signature_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  
  -- Media and attachments
  supporting_files JSONB DEFAULT '[]',
  cover_image_url TEXT,
  
  -- Settings
  allow_anonymous_signatures BOOLEAN DEFAULT true,
  require_phone_verification BOOLEAN DEFAULT false,
  auto_close_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Full text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || description || ' ' || COALESCE(target_entity, ''))
  ) STORED
);

-- Create petition signatures table
CREATE TABLE public.petition_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  
  -- Signer info
  user_id UUID,
  signer_name TEXT NOT NULL,
  signer_alias TEXT,
  phone_number TEXT,
  email TEXT,
  
  -- Verification
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  
  -- Engagement
  support_reason TEXT,
  is_public BOOLEAN DEFAULT true,
  
  -- Location data
  region TEXT,
  village TEXT,
  ip_address INET,
  
  -- Metadata
  signature_data JSONB DEFAULT '{}',
  device_info TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one signature per user per petition
  UNIQUE(petition_id, user_id),
  UNIQUE(petition_id, phone_number) WHERE phone_number IS NOT NULL
);

-- Create petition updates table
CREATE TABLE public.petition_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT NOT NULL DEFAULT 'general',
  
  is_official_response BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create petition comments table
CREATE TABLE public.petition_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_id UUID,
  
  commenter_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  
  parent_comment_id UUID REFERENCES public.petition_comments(id),
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create petition reactions table
CREATE TABLE public.petition_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_id UUID,
  
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('support', 'heart', 'fire', 'clap', 'thinking')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(petition_id, user_id, reaction_type)
);

-- Create indexes for performance
CREATE INDEX idx_petitions_status ON public.petitions(status);
CREATE INDEX idx_petitions_category ON public.petitions(category);
CREATE INDEX idx_petitions_created_by ON public.petitions(created_by);
CREATE INDEX idx_petitions_region ON public.petitions(region);
CREATE INDEX idx_petitions_signature_count ON public.petitions(signature_count DESC);
CREATE INDEX idx_petitions_search ON public.petitions USING GIN(search_vector);
CREATE INDEX idx_petitions_published_at ON public.petitions(published_at DESC);

CREATE INDEX idx_petition_signatures_petition_id ON public.petition_signatures(petition_id);
CREATE INDEX idx_petition_signatures_user_id ON public.petition_signatures(user_id);
CREATE INDEX idx_petition_signatures_created_at ON public.petition_signatures(created_at DESC);

CREATE INDEX idx_petition_updates_petition_id ON public.petition_updates(petition_id);
CREATE INDEX idx_petition_comments_petition_id ON public.petition_comments(petition_id);
CREATE INDEX idx_petition_reactions_petition_id ON public.petition_reactions(petition_id);

-- Enable RLS
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for petitions
CREATE POLICY "Public can view active petitions" 
ON public.petitions 
FOR SELECT 
USING (status = 'active' AND published_at IS NOT NULL);

CREATE POLICY "Users can view their own petitions" 
ON public.petitions 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create petitions" 
ON public.petitions 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own petitions" 
ON public.petitions 
FOR UPDATE 
USING (auth.uid() = created_by AND status IN ('draft', 'pending_review'));

CREATE POLICY "Admins can manage all petitions" 
ON public.petitions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- RLS Policies for signatures
CREATE POLICY "Public can view public signatures" 
ON public.petition_signatures 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own signatures" 
ON public.petition_signatures 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can sign petitions" 
ON public.petition_signatures 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Petition creators can view all signatures on their petitions" 
ON public.petition_signatures 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.petitions p
    WHERE p.id = petition_signatures.petition_id
    AND p.created_by = auth.uid()
  )
);

-- RLS Policies for updates
CREATE POLICY "Public can view petition updates" 
ON public.petition_updates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.petitions p
    WHERE p.id = petition_updates.petition_id
    AND p.status = 'active'
  )
);

CREATE POLICY "Petition creators can manage updates" 
ON public.petition_updates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.petitions p
    WHERE p.id = petition_updates.petition_id
    AND p.created_by = auth.uid()
  )
);

-- RLS Policies for comments
CREATE POLICY "Public can view approved comments" 
ON public.petition_comments 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Users can create comments" 
ON public.petition_comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can edit their own comments" 
ON public.petition_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for reactions
CREATE POLICY "Public can view reactions" 
ON public.petition_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own reactions" 
ON public.petition_reactions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION public.update_petition_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.petitions 
    SET signature_count = signature_count + 1,
        updated_at = now()
    WHERE id = NEW.petition_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.petitions 
    SET signature_count = signature_count - 1,
        updated_at = now()
    WHERE id = OLD.petition_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_petition_signature_count_trigger
  AFTER INSERT OR DELETE ON public.petition_signatures
  FOR EACH ROW EXECUTE FUNCTION public.update_petition_signature_count();

-- Update timestamp trigger for petitions
CREATE OR REPLACE FUNCTION public.update_petition_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_petition_updated_at_trigger
  BEFORE UPDATE ON public.petitions
  FOR EACH ROW EXECUTE FUNCTION public.update_petition_updated_at();