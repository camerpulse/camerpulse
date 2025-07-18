-- ========================================
-- CIVIC EVENTS CORE v3 - Upgrade existing events system
-- ========================================

-- Create missing enum types (skip existing ones)
DO $$ BEGIN
  CREATE TYPE civic_event_type AS ENUM (
    'civic', 'campaign', 'education', 'protest', 'music', 
    'business', 'youth', 'community', 'government', 'religious'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN  
  CREATE TYPE organizer_type AS ENUM (
    'verified_user', 'government_institution', 'political_party', 
    'company', 'school', 'ngo', 'artist', 'event_organizer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rsvp_status AS ENUM ('interested', 'going', 'not_going');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Main events table (civic-first) - upgrade existing or create new
CREATE TABLE IF NOT EXISTS public.civic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic event info
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Timing
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  timezone TEXT DEFAULT 'Africa/Douala',
  
  -- Location
  venue_name TEXT,
  venue_address TEXT,
  region TEXT NOT NULL,
  subregion TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  google_maps_link TEXT,
  
  -- Media
  cover_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  livestream_url TEXT,
  
  -- Classification
  event_type civic_event_type NOT NULL,
  is_civic_official BOOLEAN DEFAULT FALSE,
  civic_tags TEXT[] DEFAULT '{}',
  
  -- Organizer info
  organizer_id UUID NOT NULL,
  organizer_type organizer_type NOT NULL,
  organizer_verified BOOLEAN DEFAULT FALSE,
  
  -- RSVP & Capacity
  max_attendees INTEGER,
  allow_rsvp BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  
  -- Civic Impact
  expected_officials TEXT[] DEFAULT '{}',
  expected_parties TEXT[] DEFAULT '{}',
  civic_impact_score INTEGER DEFAULT 0,
  
  -- Social features
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Status & Moderation
  status event_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'pending',
  flagged_count INTEGER DEFAULT 0,
  
  -- Metadata
  external_links JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  last_modified_by UUID
);

-- RSVPs table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES civic_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rsvp_status rsvp_status NOT NULL,
  
  -- Additional info
  notes TEXT,
  plus_ones INTEGER DEFAULT 0,
  dietary_requirements TEXT,
  contact_phone TEXT,
  
  -- Approval workflow
  approval_status TEXT DEFAULT 'approved',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(event_id, user_id)
);

-- Event organizers table
CREATE TABLE IF NOT EXISTS public.event_organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES civic_events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL,
  organizer_type organizer_type NOT NULL,
  role TEXT DEFAULT 'organizer',
  permissions JSONB DEFAULT '{"can_edit": false, "can_moderate": false}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event feedback & ratings table
CREATE TABLE IF NOT EXISTS public.event_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES civic_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Ratings (1-5)
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  organization_rating INTEGER CHECK (organization_rating BETWEEN 1 AND 5),
  venue_rating INTEGER CHECK (venue_rating BETWEEN 1 AND 5),
  content_rating INTEGER CHECK (content_rating BETWEEN 1 AND 5),
  
  -- Feedback
  feedback_text TEXT,
  would_recommend BOOLEAN,
  
  -- Civic impact feedback
  civic_impact_felt BOOLEAN,
  learned_something_new BOOLEAN,
  will_take_action BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(event_id, user_id)
);

-- Event analytics table (if not exists)
CREATE TABLE IF NOT EXISTS public.civic_event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES civic_events(id) ON DELETE CASCADE,
  
  -- Basic stats
  total_views INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_rsvps INTEGER DEFAULT 0,
  rsvp_breakdown JSONB DEFAULT '{}',
  
  -- Demographics (anonymized)
  age_breakdown JSONB DEFAULT '{}',
  region_breakdown JSONB DEFAULT '{}',
  gender_breakdown JSONB DEFAULT '{}',
  
  -- Engagement
  engagement_score DECIMAL(5,2) DEFAULT 0,
  civic_reach_score DECIMAL(5,2) DEFAULT 0,
  
  -- Tracking
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(event_id, date_recorded)
);

-- Event linked content table
CREATE TABLE IF NOT EXISTS public.event_linked_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES civic_events(id) ON DELETE CASCADE,
  
  content_type TEXT NOT NULL,
  content_id UUID,
  content_url TEXT,
  content_title TEXT,
  content_description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Event check-ins table (rename from existing if needed)
CREATE TABLE IF NOT EXISTS public.civic_event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES civic_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rsvp_id UUID REFERENCES event_rsvps(id),
  
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_in_method TEXT DEFAULT 'qr_code',
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  
  verified_by UUID,
  notes TEXT,
  
  UNIQUE(event_id, user_id)
);

-- Event reports table
CREATE TABLE IF NOT EXISTS public.event_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES civic_events(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  
  report_reason TEXT NOT NULL,
  report_category TEXT NOT NULL,
  report_details TEXT,
  
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'civic_events') THEN
    ALTER TABLE public.civic_events ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.event_feedback ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.civic_event_analytics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.event_linked_content ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.civic_event_checkins ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS Policies (only if they don't exist)

-- Events policies
DO $$ BEGIN
  CREATE POLICY "Events are viewable by everyone" ON civic_events
    FOR SELECT USING (status = 'published' OR status = 'ongoing' OR status = 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create events" ON civic_events
    FOR INSERT WITH CHECK (auth.uid() = created_by);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Organizers can update their events" ON civic_events
    FOR UPDATE USING (
      auth.uid() = created_by OR 
      EXISTS (
        SELECT 1 FROM event_organizers 
        WHERE event_id = civic_events.id 
        AND organizer_id = auth.uid() 
        AND (permissions->>'can_edit')::boolean = true
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all events" ON civic_events
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- RSVP policies
DO $$ BEGIN
  CREATE POLICY "Users can view RSVPs for events" ON event_rsvps
    FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own RSVPs" ON event_rsvps
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance (skip if exists)
CREATE INDEX IF NOT EXISTS idx_civic_events_status ON civic_events(status);
CREATE INDEX IF NOT EXISTS idx_civic_events_type ON civic_events(event_type);
CREATE INDEX IF NOT EXISTS idx_civic_events_region ON civic_events(region);
CREATE INDEX IF NOT EXISTS idx_civic_events_start_date ON civic_events(start_date);
CREATE INDEX IF NOT EXISTS idx_civic_events_organizer ON civic_events(organizer_id, organizer_type);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON event_rsvps(rsvp_status);

-- Create update triggers (only if function doesn't exist)
CREATE OR REPLACE FUNCTION update_civic_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_civic_events_updated_at ON civic_events;
CREATE TRIGGER update_civic_events_updated_at
  BEFORE UPDATE ON civic_events
  FOR EACH ROW
  EXECUTE FUNCTION update_civic_events_updated_at();

DROP TRIGGER IF EXISTS update_event_rsvps_updated_at ON event_rsvps;
CREATE TRIGGER update_event_rsvps_updated_at
  BEFORE UPDATE ON event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_civic_events_updated_at();

-- Create civic impact calculation function
CREATE OR REPLACE FUNCTION calculate_civic_impact_score(event_id UUID)
RETURNS INTEGER AS $$
DECLARE
  impact_score INTEGER := 0;
  event_record RECORD;
  rsvp_count INTEGER;
  official_count INTEGER;
BEGIN
  SELECT * INTO event_record FROM civic_events WHERE id = event_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  CASE event_record.event_type
    WHEN 'civic' THEN impact_score := impact_score + 50;
    WHEN 'government' THEN impact_score := impact_score + 40;
    WHEN 'education' THEN impact_score := impact_score + 30;
    WHEN 'campaign' THEN impact_score := impact_score + 35;
    WHEN 'protest' THEN impact_score := impact_score + 45;
    WHEN 'community' THEN impact_score := impact_score + 25;
    ELSE impact_score := impact_score + 10;
  END CASE;
  
  IF event_record.is_civic_official THEN
    impact_score := impact_score + 30;
  END IF;
  
  official_count := array_length(event_record.expected_officials, 1);
  IF official_count IS NOT NULL THEN
    impact_score := impact_score + (official_count * 5);
  END IF;
  
  official_count := array_length(event_record.expected_parties, 1);
  IF official_count IS NOT NULL THEN
    impact_score := impact_score + (official_count * 3);
  END IF;
  
  SELECT COUNT(*) INTO rsvp_count FROM event_rsvps 
  WHERE event_rsvps.event_id = calculate_civic_impact_score.event_id 
  AND rsvp_status = 'going';
  
  impact_score := impact_score + LEAST(50, rsvp_count);
  
  UPDATE civic_events SET civic_impact_score = impact_score WHERE id = event_id;
  
  RETURN impact_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create analytics update function
CREATE OR REPLACE FUNCTION update_civic_event_analytics(p_event_id UUID)
RETURNS VOID AS $$
DECLARE
  rsvp_breakdown JSONB := '{}';
  interested_count INTEGER;
  going_count INTEGER;
  not_going_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO interested_count FROM event_rsvps 
  WHERE event_id = p_event_id AND rsvp_status = 'interested';
  
  SELECT COUNT(*) INTO going_count FROM event_rsvps 
  WHERE event_id = p_event_id AND rsvp_status = 'going';
  
  SELECT COUNT(*) INTO not_going_count FROM event_rsvps 
  WHERE event_id = p_event_id AND rsvp_status = 'not_going';
  
  rsvp_breakdown := jsonb_build_object(
    'interested', interested_count,
    'going', going_count,
    'not_going', not_going_count
  );
  
  INSERT INTO civic_event_analytics (
    event_id, total_rsvps, rsvp_breakdown
  ) VALUES (
    p_event_id, 
    interested_count + going_count + not_going_count,
    rsvp_breakdown
  )
  ON CONFLICT (event_id, date_recorded) DO UPDATE SET
    total_rsvps = EXCLUDED.total_rsvps,
    rsvp_breakdown = EXCLUDED.rsvp_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;