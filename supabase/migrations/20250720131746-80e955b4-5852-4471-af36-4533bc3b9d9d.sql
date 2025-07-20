-- Create user_groups table first
CREATE TABLE public.user_groups (
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

-- Enable RLS for user_groups
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for user_groups
CREATE POLICY "Anyone can view public groups" ON public.user_groups
  FOR SELECT USING (privacy_level = 'public');
CREATE POLICY "Authenticated users can create groups" ON public.user_groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create group_memberships table
CREATE TABLE public.group_memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.user_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  status text DEFAULT 'active',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS for group_memberships
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for group_memberships
CREATE POLICY "Group members can view membership" ON public.group_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.group_memberships gm 
      WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid()
    )
  );

-- Now create community_events table
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

-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'registered',
  registration_date timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS for events
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for community events
CREATE POLICY "Anyone can view public events" ON public.community_events
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.community_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Organizers can update their events" ON public.community_events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Create policies for event registrations
CREATE POLICY "Users can view their own registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own registrations" ON public.event_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for timestamps
CREATE TRIGGER update_user_groups_updated_at BEFORE UPDATE ON public.user_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_events_updated_at BEFORE UPDATE ON public.community_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_community_events_start_time ON public.community_events(start_time);