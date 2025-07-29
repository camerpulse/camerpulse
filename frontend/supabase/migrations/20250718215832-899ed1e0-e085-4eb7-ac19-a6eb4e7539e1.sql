-- PulseProfile v4.0 Storage & Enhanced Features Setup

-- Create storage buckets for profile content
INSERT INTO storage.buckets (id, name, public) VALUES 
('profile-avatars', 'profile-avatars', true),
('profile-covers', 'profile-covers', true),
('profile-documents', 'profile-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile avatars (public access)
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for cover photos
CREATE POLICY "Cover images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-covers');

CREATE POLICY "Users can upload their own cover" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'profile-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own cover" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'profile-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own cover" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'profile-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for verification documents (private)
CREATE POLICY "Users can manage their verification documents" 
ON storage.objects FOR ALL 
USING (bucket_id = 'profile-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view verification documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-documents' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));

-- Profile Analytics table
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  views_today integer DEFAULT 0,
  views_week integer DEFAULT 0,
  views_month integer DEFAULT 0,
  total_views integer DEFAULT 0,
  last_view_date date DEFAULT CURRENT_DATE,
  engagement_score numeric DEFAULT 0.0,
  civic_score_change integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Profile Social Links table (enhanced)
CREATE TABLE IF NOT EXISTS public.profile_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  is_verified boolean DEFAULT false,
  verification_date timestamp with time zone,
  click_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(profile_id, platform)
);

-- Profile Themes table
CREATE TABLE IF NOT EXISTS public.profile_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme_name text DEFAULT 'default',
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#64748b',
  background_style text DEFAULT 'gradient',
  custom_css text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enhanced activity timeline
CREATE TABLE IF NOT EXISTS public.profile_activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_title text NOT NULL,
  activity_description text,
  activity_url text,
  activity_icon text,
  activity_data jsonb DEFAULT '{}',
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  importance_score integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Profile comparison logs
CREATE TABLE IF NOT EXISTS public.profile_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comparer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_a_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_b_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  comparison_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their analytics" ON public.profile_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "Profile social links are viewable by everyone" ON public.profile_social_links
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their social links" ON public.profile_social_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "Profile themes are viewable by everyone" ON public.profile_themes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their themes" ON public.profile_themes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "Public activity is viewable by everyone" ON public.profile_activity_feed
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can manage their activity feed" ON public.profile_activity_feed
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can view their comparisons" ON public.profile_comparisons
  FOR SELECT USING (comparer_id = auth.uid());

CREATE POLICY "Users can create comparisons" ON public.profile_comparisons
  FOR INSERT WITH CHECK (comparer_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile ON public.profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_social_links_profile ON public.profile_social_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_themes_profile ON public.profile_themes(profile_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_profile ON public.profile_activity_feed(profile_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.profile_activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_comparisons_comparer ON public.profile_comparisons(comparer_id);

-- Function to update analytics
CREATE OR REPLACE FUNCTION public.update_profile_analytics(p_profile_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profile_analytics (profile_id, views_today, views_week, views_month, total_views)
  VALUES (p_profile_id, 1, 1, 1, 1)
  ON CONFLICT (profile_id) DO UPDATE SET
    views_today = CASE 
      WHEN profile_analytics.last_view_date = CURRENT_DATE 
      THEN profile_analytics.views_today + 1 
      ELSE 1 
    END,
    views_week = profile_analytics.views_week + 1,
    views_month = profile_analytics.views_month + 1,
    total_views = profile_analytics.total_views + 1,
    last_view_date = CURRENT_DATE,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;