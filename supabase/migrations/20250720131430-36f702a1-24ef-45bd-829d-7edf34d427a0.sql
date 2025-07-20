-- Phase C: Complete Feature Suite Database Schema

-- ========================================
-- 1. USER MANAGEMENT & AUTHENTICATION SYSTEM
-- ========================================

-- Enhanced user profiles with social features
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme text DEFAULT 'system',
  language text DEFAULT 'en',
  notification_frequency text DEFAULT 'daily',
  privacy_level text DEFAULT 'public',
  show_activity boolean DEFAULT true,
  show_followers boolean DEFAULT true,
  allow_messages boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User connections and social graph
CREATE TABLE IF NOT EXISTS public.user_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_type text DEFAULT 'follow',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- User activity feeds
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}',
  visibility text DEFAULT 'public',
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 2. ADVANCED CIVIC PARTICIPATION FEATURES
-- ========================================

-- Civic initiatives and community projects
CREATE TABLE IF NOT EXISTS public.civic_initiatives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  region text,
  status text DEFAULT 'active',
  goal_amount numeric,
  current_amount numeric DEFAULT 0,
  participant_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Citizen proposals and suggestions
CREATE TABLE IF NOT EXISTS public.citizen_proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  region text,
  priority_level text DEFAULT 'medium',
  status text DEFAULT 'open',
  vote_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  implementation_timeline text,
  estimated_cost numeric,
  proposed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community forums and discussions
CREATE TABLE IF NOT EXISTS public.community_forums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  region text,
  is_public boolean DEFAULT true,
  moderator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  post_count integer DEFAULT 0,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id uuid REFERENCES public.community_forums(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  is_pinned boolean DEFAULT false,
  reply_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- 3. ENHANCED SECURITY & MODERATION TOOLS
-- ========================================

-- Content moderation system
CREATE TABLE IF NOT EXISTS public.moderation_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name text NOT NULL,
  rule_type text NOT NULL,
  content_type text NOT NULL,
  severity_level text DEFAULT 'medium',
  action_type text NOT NULL,
  rule_criteria jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  action_type text NOT NULL,
  reason text,
  moderator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  auto_generated boolean DEFAULT false,
  status text DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Security audit logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  resource_type text,
  resource_id text,
  ip_address inet,
  user_agent text,
  risk_score integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- 4. GOVERNMENT SYSTEMS INTEGRATION
-- ========================================

-- Government agency connections
CREATE TABLE IF NOT EXISTS public.government_agencies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  short_name text,
  type text NOT NULL,
  region text,
  contact_email text,
  contact_phone text,
  website_url text,
  api_endpoint text,
  is_verified boolean DEFAULT false,
  integration_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Government service requests
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'submitted',
  agency_id uuid REFERENCES public.government_agencies(id) ON DELETE SET NULL,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  estimated_completion timestamptz,
  reference_number text UNIQUE,
  attachments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- 5. SOCIAL FEATURES & COMMUNITY BUILDING
-- ========================================

-- User groups and communities
CREATE TABLE IF NOT EXISTS public.user_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  group_type text DEFAULT 'public',
  category text,
  region text,
  privacy_level text DEFAULT 'public',
  member_count integer DEFAULT 0,
  post_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.user_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  status text DEFAULT 'active',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Social posts and interactions
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  post_type text DEFAULT 'text',
  media_urls text[],
  hashtags text[],
  mentions text[],
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  group_id uuid REFERENCES public.user_groups(id) ON DELETE CASCADE,
  visibility text DEFAULT 'public',
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Event system for community activities
CREATE TABLE IF NOT EXISTS public.community_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL,
  location text,
  is_virtual boolean DEFAULT false,
  virtual_link text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  registration_required boolean DEFAULT false,
  registration_deadline timestamptz,
  organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  group_id uuid REFERENCES public.user_groups(id) ON DELETE SET NULL,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'registered',
  registration_date timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ========================================
-- 6. MOBILE/PWA OPTIMIZATION TABLES
-- ========================================

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  device_type text,
  device_info jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Offline sync queue
CREATE TABLE IF NOT EXISTS public.offline_sync_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending',
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User connections policies
CREATE POLICY "Users can manage their own connections" ON public.user_connections
  FOR ALL USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- User activities policies
CREATE POLICY "Users can view public activities" ON public.user_activities
  FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own activities" ON public.user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities" ON public.user_activities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activities" ON public.user_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Civic initiatives policies
CREATE POLICY "Anyone can view civic initiatives" ON public.civic_initiatives
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create initiatives" ON public.civic_initiatives
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own initiatives" ON public.civic_initiatives
  FOR UPDATE USING (auth.uid() = created_by);

-- Citizen proposals policies
CREATE POLICY "Anyone can view proposals" ON public.citizen_proposals
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create proposals" ON public.citizen_proposals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own proposals" ON public.citizen_proposals
  FOR UPDATE USING (auth.uid() = proposed_by);

-- Community forums policies
CREATE POLICY "Anyone can view public forums" ON public.community_forums
  FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated users can create forums" ON public.community_forums
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Moderators can manage their forums" ON public.community_forums
  FOR UPDATE USING (auth.uid() = moderator_id);

-- Forum posts policies
CREATE POLICY "Anyone can view posts in public forums" ON public.forum_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_forums 
      WHERE id = forum_posts.forum_id AND is_public = true
    )
  );
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Moderation rules (admin only)
CREATE POLICY "Admins can manage moderation rules" ON public.moderation_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Service requests policies
CREATE POLICY "Users can view their own service requests" ON public.service_requests
  FOR SELECT USING (auth.uid() = submitted_by);
CREATE POLICY "Users can create service requests" ON public.service_requests
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Agencies can view assigned requests" ON public.service_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.government_agency_users 
      WHERE user_id = auth.uid() AND agency_id = service_requests.agency_id
    )
  );

-- Social features policies
CREATE POLICY "Anyone can view public groups" ON public.user_groups
  FOR SELECT USING (privacy_level = 'public');
CREATE POLICY "Authenticated users can create groups" ON public.user_groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Group members can view membership" ON public.group_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.group_memberships gm 
      WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public posts" ON public.social_posts
  FOR SELECT USING (visibility = 'public' OR auth.uid() = author_id);
CREATE POLICY "Authenticated users can create posts" ON public.social_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage their own posts" ON public.social_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Push subscriptions policies
CREATE POLICY "Users can manage their own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Offline sync policies
CREATE POLICY "Users can manage their own sync queue" ON public.offline_sync_queue
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_connections_follower ON public.user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following ON public.user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_civic_initiatives_region ON public.civic_initiatives(region);
CREATE INDEX IF NOT EXISTS idx_citizen_proposals_status ON public.citizen_proposals(status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum_id ON public.forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_author_id ON public.social_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_events_start_date ON public.community_events(start_date);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_civic_initiatives_updated_at BEFORE UPDATE ON public.civic_initiatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citizen_proposals_updated_at BEFORE UPDATE ON public.citizen_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_forums_updated_at BEFORE UPDATE ON public.community_forums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_government_agencies_updated_at BEFORE UPDATE ON public.government_agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_groups_updated_at BEFORE UPDATE ON public.user_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_events_updated_at BEFORE UPDATE ON public.community_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate reference numbers for service requests
CREATE OR REPLACE FUNCTION generate_service_request_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := 'SR-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_service_request_ref BEFORE INSERT ON public.service_requests FOR EACH ROW EXECUTE FUNCTION generate_service_request_reference();