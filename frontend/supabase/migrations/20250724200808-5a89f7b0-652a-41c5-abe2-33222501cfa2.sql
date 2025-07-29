-- Create sponsors table for organizations funding job campaigns
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  sponsor_type TEXT NOT NULL DEFAULT 'ngo', -- 'ngo', 'government', 'private', 'international'
  contact_email TEXT,
  website_url TEXT,
  regions_focus TEXT[] DEFAULT ARRAY[]::TEXT[],
  sectors_focus TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hiring campaigns table
CREATE TABLE public.hiring_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id),
  name TEXT NOT NULL,
  description TEXT,
  target_hires INTEGER NOT NULL DEFAULT 0,
  current_hires INTEGER NOT NULL DEFAULT 0,
  target_demographics JSONB DEFAULT '{}', -- {"gender": "female", "age_range": "18-35", etc}
  target_sectors TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  budget_allocated BIGINT, -- in FCFA
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  campaign_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  success_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign hires tracking table
CREATE TABLE public.campaign_hires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.hiring_campaigns(id),
  job_id UUID, -- Reference to jobs table when available
  user_id UUID, -- The hired person
  employer_name TEXT,
  job_title TEXT NOT NULL,
  sector TEXT,
  region TEXT,
  gender TEXT,
  age_group TEXT,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create regional hiring statistics table
CREATE TABLE public.regional_hiring_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hires INTEGER NOT NULL DEFAULT 0,
  total_job_posts INTEGER NOT NULL DEFAULT 0,
  top_sectors JSONB DEFAULT '[]', -- [{"sector": "IT", "count": 15}, ...]
  active_employers INTEGER NOT NULL DEFAULT 0,
  population_normalized_rate NUMERIC, -- hires per 100,000 people
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(region, period_type, period_start)
);

-- Create sponsor impact tracking table
CREATE TABLE public.sponsor_impact_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id),
  metric_type TEXT NOT NULL, -- 'total_hires', 'campaign_hires', 'sector_impact', etc
  metric_value BIGINT NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(sponsor_id, metric_type, period_start)
);

-- Create job seeker badges table
CREATE TABLE public.job_seeker_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL, -- 'campaign_hire', 'sector_expert', 'regional_champion', etc
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  campaign_id UUID REFERENCES public.hiring_campaigns(id),
  sponsor_id UUID REFERENCES public.sponsors(id),
  verification_url TEXT, -- Shareable verification link
  badge_image_url TEXT,
  earned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_shareable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_hires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_hiring_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_seeker_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public visibility
CREATE POLICY "Sponsors are publicly viewable" ON public.sponsors FOR SELECT USING (is_active = true);
CREATE POLICY "Hiring campaigns are publicly viewable" ON public.hiring_campaigns FOR SELECT USING (is_public = true);
CREATE POLICY "Regional stats are publicly viewable" ON public.regional_hiring_stats FOR SELECT USING (true);
CREATE POLICY "Public badges are viewable" ON public.job_seeker_badges FOR SELECT USING (is_public = true);

-- Admin policies
CREATE POLICY "Admins can manage sponsors" ON public.sponsors FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage campaigns" ON public.hiring_campaigns FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage campaign hires" ON public.campaign_hires FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own badges" ON public.job_seeker_badges FOR SELECT 
USING (auth.uid() = user_id);

-- Sponsor policies
CREATE POLICY "Sponsors can view their own metrics" ON public.sponsor_impact_metrics FOR SELECT 
USING (sponsor_id IN (SELECT id FROM sponsors WHERE contact_email = auth.email()));

-- Functions for updating statistics
CREATE OR REPLACE FUNCTION update_regional_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update today's stats when a new hire is recorded
  INSERT INTO public.regional_hiring_stats (
    region, period_type, period_start, period_end, total_hires
  ) VALUES (
    NEW.region, 'daily', CURRENT_DATE, CURRENT_DATE, 1
  )
  ON CONFLICT (region, period_type, period_start) 
  DO UPDATE SET total_hires = regional_hiring_stats.total_hires + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_regional_stats_trigger
  AFTER INSERT ON public.campaign_hires
  FOR EACH ROW
  EXECUTE FUNCTION update_regional_stats();

-- Function to update campaign hire count
CREATE OR REPLACE FUNCTION update_campaign_hire_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.hiring_campaigns 
    SET current_hires = current_hires + 1
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.hiring_campaigns 
    SET current_hires = current_hires - 1
    WHERE id = OLD.campaign_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_hire_count_trigger
  AFTER INSERT OR DELETE ON public.campaign_hires
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_hire_count();