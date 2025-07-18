-- Main civic events table
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

-- Enable RLS
ALTER TABLE public.civic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;