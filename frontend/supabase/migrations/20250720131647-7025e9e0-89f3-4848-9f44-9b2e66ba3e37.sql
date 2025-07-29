-- Create corrected community_events table with proper column names
DROP TABLE IF EXISTS public.community_events CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;

-- Event system for community activities
CREATE TABLE public.community_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL,
  location text,
  is_virtual boolean DEFAULT false,
  virtual_link text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
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

CREATE TABLE public.event_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'registered',
  registration_date timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for community events
CREATE POLICY "Anyone can view public events" ON public.community_events
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.community_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Organizers can update their events" ON public.community_events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Policies for event registrations
CREATE POLICY "Users can view their own registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own registrations" ON public.event_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index with correct column name
CREATE INDEX idx_community_events_start_time ON public.community_events(start_time);

-- Add trigger for community events
CREATE TRIGGER update_community_events_updated_at BEFORE UPDATE ON public.community_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();