-- Village-to-Village Relationships Table
CREATE TABLE public.village_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_village_id UUID NOT NULL,
  target_village_id UUID NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'sister_village', 'trade_partner', 'historical_alliance', 
    'cultural_exchange', 'marriage_alliance', 'neighboring_village',
    'diaspora_connection', 'administrative_link', 'conflict_history',
    'shared_heritage', 'migration_route', 'economic_partnership'
  )),
  relationship_status TEXT NOT NULL DEFAULT 'active' CHECK (relationship_status IN (
    'active', 'historical', 'dormant', 'disputed', 'renewed'
  )),
  established_year INTEGER,
  established_by TEXT,
  relationship_strength TEXT NOT NULL DEFAULT 'medium' CHECK (relationship_strength IN (
    'weak', 'medium', 'strong', 'very_strong'
  )),
  description TEXT,
  historical_context TEXT,
  current_activities JSONB DEFAULT '[]',
  economic_benefits JSONB DEFAULT '{}',
  cultural_exchanges JSONB DEFAULT '[]',
  shared_projects TEXT[],
  contact_frequency TEXT DEFAULT 'occasional' CHECK (contact_frequency IN (
    'daily', 'weekly', 'monthly', 'seasonal', 'yearly', 'occasional', 'rare'
  )),
  distance_km NUMERIC,
  travel_time_hours NUMERIC,
  transport_methods TEXT[],
  language_barrier_level TEXT DEFAULT 'none' CHECK (language_barrier_level IN (
    'none', 'minimal', 'moderate', 'significant', 'major'
  )),
  documentation_links TEXT[],
  photo_urls TEXT[],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_village_relationship UNIQUE (source_village_id, target_village_id, relationship_type)
);

-- Traditional Calendar Events Table
CREATE TABLE public.traditional_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'harvest_festival', 'planting_ceremony', 'cultural_festival', 
    'religious_ceremony', 'ancestor_celebration', 'market_day',
    'seasonal_celebration', 'coming_of_age', 'marriage_season',
    'rain_ceremony', 'new_year', 'traditional_sport',
    'storytelling_night', 'craft_exhibition', 'healing_ceremony'
  )),
  event_category TEXT NOT NULL DEFAULT 'cultural' CHECK (event_category IN (
    'agricultural', 'cultural', 'religious', 'social', 'economic', 'educational'
  )),
  calendar_type TEXT NOT NULL DEFAULT 'lunar' CHECK (calendar_type IN (
    'lunar', 'solar', 'agricultural', 'islamic', 'traditional_local'
  )),
  occurs_annually BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER DEFAULT 1,
  lunar_month INTEGER CHECK (lunar_month BETWEEN 1 AND 12),
  lunar_day INTEGER CHECK (lunar_day BETWEEN 1 AND 30),
  solar_month INTEGER CHECK (solar_month BETWEEN 1 AND 12),
  solar_day INTEGER CHECK (solar_day BETWEEN 1 AND 31),
  agricultural_season TEXT CHECK (agricultural_season IN (
    'dry_season', 'rainy_season', 'harmattan', 'planting_time', 'harvest_time'
  )),
  event_description TEXT NOT NULL,
  historical_significance TEXT,
  traditional_practices JSONB DEFAULT '[]',
  required_preparations JSONB DEFAULT '[]',
  participant_roles JSONB DEFAULT '{}',
  ceremonial_items JSONB DEFAULT '[]',
  traditional_foods JSONB DEFAULT '[]',
  songs_and_dances JSONB DEFAULT '[]',
  storytelling_elements JSONB DEFAULT '[]',
  dress_code TEXT,
  location_details TEXT,
  community_involvement_level TEXT DEFAULT 'high' CHECK (community_involvement_level IN (
    'low', 'medium', 'high', 'entire_community'
  )),
  is_public_event BOOLEAN NOT NULL DEFAULT true,
  visitor_policy TEXT DEFAULT 'welcome' CHECK (visitor_policy IN (
    'welcome', 'by_invitation', 'elders_permission', 'restricted', 'closed'
  )),
  economic_impact TEXT,
  modern_adaptations TEXT,
  challenges_faced TEXT,
  preservation_status TEXT DEFAULT 'active' CHECK (preservation_status IN (
    'active', 'declining', 'revived', 'modernized', 'lost'
  )),
  next_occurrence DATE,
  organizer_contact TEXT,
  photo_urls TEXT[],
  video_urls TEXT[],
  audio_recordings TEXT[],
  is_unesco_recognized BOOLEAN DEFAULT false,
  related_events UUID[],
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Calendar Event Participants Table
CREATE TABLE public.calendar_event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.traditional_calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  village_id UUID,
  participation_type TEXT NOT NULL CHECK (participation_type IN (
    'organizer', 'elder', 'performer', 'participant', 'observer', 'visitor'
  )),
  role_description TEXT,
  confirmed_attendance BOOLEAN DEFAULT false,
  attendance_year INTEGER NOT NULL,
  contribution_type TEXT CHECK (contribution_type IN (
    'performance', 'food', 'decorations', 'logistics', 'security', 'documentation'
  )),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Village Cultural Connections Table (for tracking cultural similarities and exchanges)
CREATE TABLE public.village_cultural_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_a_id UUID NOT NULL,
  village_b_id UUID NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN (
    'shared_language', 'shared_dialect', 'similar_traditions', 
    'common_ancestry', 'trade_customs', 'art_styles',
    'music_traditions', 'dance_forms', 'craft_techniques',
    'food_culture', 'architecture_style', 'governance_system'
  )),
  similarity_score NUMERIC CHECK (similarity_score BETWEEN 0 AND 100),
  description TEXT NOT NULL,
  historical_context TEXT,
  evidence_type TEXT[] DEFAULT ARRAY['oral_tradition'],
  documentation_links TEXT[],
  research_sources JSONB DEFAULT '[]',
  verified_by_scholars BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_cultural_connection UNIQUE (village_a_id, village_b_id, connection_type)
);

-- Enable RLS
ALTER TABLE public.village_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traditional_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_cultural_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for village_relationships
CREATE POLICY "Anyone can view active village relationships" 
ON public.village_relationships FOR SELECT 
USING (relationship_status = 'active' OR is_verified = true);

CREATE POLICY "Users can create village relationships" 
ON public.village_relationships FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own relationships" 
ON public.village_relationships FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for traditional_calendar_events
CREATE POLICY "Anyone can view public calendar events" 
ON public.traditional_calendar_events FOR SELECT 
USING (is_public_event = true);

CREATE POLICY "Users can create calendar events" 
ON public.traditional_calendar_events FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" 
ON public.traditional_calendar_events FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for calendar_event_participants
CREATE POLICY "Users can view event participants" 
ON public.calendar_event_participants FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.traditional_calendar_events 
    WHERE id = event_id AND is_public_event = true
  )
);

CREATE POLICY "Users can manage their own participation" 
ON public.calendar_event_participants FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for village_cultural_connections
CREATE POLICY "Anyone can view cultural connections" 
ON public.village_cultural_connections FOR SELECT 
USING (true);

CREATE POLICY "Users can create cultural connections" 
ON public.village_cultural_connections FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own connections" 
ON public.village_cultural_connections FOR UPDATE 
USING (auth.uid() = created_by);

-- Indexes for performance
CREATE INDEX idx_village_relationships_source ON public.village_relationships(source_village_id);
CREATE INDEX idx_village_relationships_target ON public.village_relationships(target_village_id);
CREATE INDEX idx_village_relationships_type ON public.village_relationships(relationship_type);
CREATE INDEX idx_calendar_events_village ON public.traditional_calendar_events(village_id);
CREATE INDEX idx_calendar_events_date ON public.traditional_calendar_events(next_occurrence);
CREATE INDEX idx_calendar_events_type ON public.traditional_calendar_events(event_type);
CREATE INDEX idx_event_participants_event ON public.calendar_event_participants(event_id);
CREATE INDEX idx_cultural_connections_villages ON public.village_cultural_connections(village_a_id, village_b_id);

-- Triggers for updated_at
CREATE TRIGGER update_village_relationships_updated_at
  BEFORE UPDATE ON public.village_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_traditional_calendar_events_updated_at
  BEFORE UPDATE ON public.traditional_calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_village_cultural_connections_updated_at
  BEFORE UPDATE ON public.village_cultural_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();