-- Create village_announcements table for digital village squares
CREATE TABLE public.village_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]',
  views_count INTEGER NOT NULL DEFAULT 0,
  reactions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create village_elder_knowledge table for elder knowledge preservation
CREATE TABLE public.village_elder_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  elder_user_id UUID NOT NULL,
  submitted_by_user_id UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  knowledge_type TEXT NOT NULL DEFAULT 'oral_tradition',
  category TEXT NOT NULL DEFAULT 'general',
  language TEXT NOT NULL DEFAULT 'en',
  audio_url TEXT,
  video_url TEXT,
  images JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER NOT NULL DEFAULT 0,
  preservation_priority TEXT NOT NULL DEFAULT 'medium',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create village_cultural_heritage table for cultural preservation
CREATE TABLE public.village_cultural_heritage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  contributor_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  heritage_type TEXT NOT NULL DEFAULT 'tradition',
  category TEXT NOT NULL DEFAULT 'customs',
  historical_period TEXT,
  significance_level TEXT NOT NULL DEFAULT 'medium',
  media_urls JSONB DEFAULT '[]',
  documentation JSONB DEFAULT '{}',
  related_knowledge_ids UUID[] DEFAULT '{}',
  preservation_status TEXT NOT NULL DEFAULT 'documented',
  threats JSONB DEFAULT '[]',
  preservation_actions JSONB DEFAULT '[]',
  community_involvement TEXT,
  expert_validation JSONB DEFAULT '{}',
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create village_discussion_messages table for real-time discussions
CREATE TABLE public.village_discussion_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_message_id UUID,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '{}',
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create village_cultural_events table for cultural activities
CREATE TABLE public.village_cultural_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  organizer_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'cultural',
  cultural_significance TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  registration_required BOOLEAN NOT NULL DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'upcoming',
  media_urls JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]',
  cultural_elements JSONB DEFAULT '{}',
  elder_involvement JSONB DEFAULT '{}',
  heritage_preservation_goal TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_village_announcements_village_id ON public.village_announcements(village_id);
CREATE INDEX idx_village_announcements_created_at ON public.village_announcements(created_at DESC);
CREATE INDEX idx_village_announcements_pinned ON public.village_announcements(is_pinned, created_at DESC);

CREATE INDEX idx_village_elder_knowledge_village_id ON public.village_elder_knowledge(village_id);
CREATE INDEX idx_village_elder_knowledge_elder_id ON public.village_elder_knowledge(elder_user_id);
CREATE INDEX idx_village_elder_knowledge_category ON public.village_elder_knowledge(category);
CREATE INDEX idx_village_elder_knowledge_verification ON public.village_elder_knowledge(verification_status);

CREATE INDEX idx_village_cultural_heritage_village_id ON public.village_cultural_heritage(village_id);
CREATE INDEX idx_village_cultural_heritage_type ON public.village_cultural_heritage(heritage_type);
CREATE INDEX idx_village_cultural_heritage_featured ON public.village_cultural_heritage(is_featured, created_at DESC);

CREATE INDEX idx_village_discussion_messages_discussion_id ON public.village_discussion_messages(discussion_id);
CREATE INDEX idx_village_discussion_messages_created_at ON public.village_discussion_messages(created_at);
CREATE INDEX idx_village_discussion_messages_parent ON public.village_discussion_messages(parent_message_id);

CREATE INDEX idx_village_cultural_events_village_id ON public.village_cultural_events(village_id);
CREATE INDEX idx_village_cultural_events_start_date ON public.village_cultural_events(start_date);
CREATE INDEX idx_village_cultural_events_status ON public.village_cultural_events(status);

-- Enable Row Level Security
ALTER TABLE public.village_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_elder_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_cultural_heritage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_discussion_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_cultural_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for village_announcements
CREATE POLICY "Users can view announcements for accessible villages" 
ON public.village_announcements FOR SELECT 
USING (true);

CREATE POLICY "Village members can create announcements" 
ON public.village_announcements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own announcements" 
ON public.village_announcements FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for village_elder_knowledge
CREATE POLICY "Users can view public elder knowledge" 
ON public.village_elder_knowledge FOR SELECT 
USING (is_public = true OR auth.uid() = elder_user_id OR auth.uid() = submitted_by_user_id);

CREATE POLICY "Users can submit elder knowledge" 
ON public.village_elder_knowledge FOR INSERT 
WITH CHECK (auth.uid() = submitted_by_user_id OR auth.uid() = elder_user_id);

CREATE POLICY "Elders and submitters can update their knowledge" 
ON public.village_elder_knowledge FOR UPDATE 
USING (auth.uid() = elder_user_id OR auth.uid() = submitted_by_user_id);

-- RLS Policies for village_cultural_heritage
CREATE POLICY "Users can view public cultural heritage" 
ON public.village_cultural_heritage FOR SELECT 
USING (visibility = 'public' OR auth.uid() = contributor_user_id);

CREATE POLICY "Users can contribute cultural heritage" 
ON public.village_cultural_heritage FOR INSERT 
WITH CHECK (auth.uid() = contributor_user_id);

CREATE POLICY "Contributors can update their heritage entries" 
ON public.village_cultural_heritage FOR UPDATE 
USING (auth.uid() = contributor_user_id);

-- RLS Policies for village_discussion_messages
CREATE POLICY "Users can view discussion messages" 
ON public.village_discussion_messages FOR SELECT 
USING (true);

CREATE POLICY "Users can create discussion messages" 
ON public.village_discussion_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.village_discussion_messages FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for village_cultural_events
CREATE POLICY "Users can view public cultural events" 
ON public.village_cultural_events FOR SELECT 
USING (is_public = true OR auth.uid() = organizer_user_id);

CREATE POLICY "Users can create cultural events" 
ON public.village_cultural_events FOR INSERT 
WITH CHECK (auth.uid() = organizer_user_id);

CREATE POLICY "Organizers can update their events" 
ON public.village_cultural_events FOR UPDATE 
USING (auth.uid() = organizer_user_id);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION public.update_village_community_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_village_announcements_updated_at
  BEFORE UPDATE ON public.village_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_village_community_updated_at();

CREATE TRIGGER update_village_elder_knowledge_updated_at
  BEFORE UPDATE ON public.village_elder_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_village_community_updated_at();

CREATE TRIGGER update_village_cultural_heritage_updated_at
  BEFORE UPDATE ON public.village_cultural_heritage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_village_community_updated_at();

CREATE TRIGGER update_village_cultural_events_updated_at
  BEFORE UPDATE ON public.village_cultural_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_village_community_updated_at();