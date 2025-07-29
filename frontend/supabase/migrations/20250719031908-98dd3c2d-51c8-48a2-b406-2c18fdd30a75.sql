-- Create civic participation tables

-- Petitions table
CREATE TABLE public.petitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_institution TEXT NOT NULL,
  goal_signatures INTEGER NOT NULL DEFAULT 1000,
  current_signatures INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'successful', 'rejected')),
  category TEXT NOT NULL,
  location TEXT,
  creator_id UUID NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Petition signatures table
CREATE TABLE public.petition_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  comment TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(petition_id, user_id)
);

-- Polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poll_type TEXT NOT NULL DEFAULT 'single_choice' CHECK (poll_type IN ('single_choice', 'multiple_choice', 'rating', 'open_ended')),
  category TEXT NOT NULL,
  location TEXT,
  creator_id UUID NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  closes_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  total_votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Poll options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  option_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER, -- for rating polls
  comment TEXT, -- for open-ended responses
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Community forums table
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Forum topics table
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  creator_id UUID NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  creator_id UUID NOT NULL,
  is_solution BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community events table
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('meeting', 'workshop', 'volunteer', 'protest', 'celebration', 'other')),
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_attendees INTEGER,
  current_attendees INTEGER NOT NULL DEFAULT 0,
  registration_required BOOLEAN NOT NULL DEFAULT false,
  organizer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event attendees table
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  attendance_status TEXT NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'no_show', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Volunteer opportunities table
CREATE TABLE public.volunteer_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT NOT NULL,
  skills_required TEXT[] DEFAULT '{}',
  time_commitment TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  spots_available INTEGER,
  spots_filled INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Volunteer applications table
CREATE TABLE public.volunteer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  message TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(opportunity_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for petitions
CREATE POLICY "Petitions are viewable by everyone" ON public.petitions FOR SELECT USING (true);
CREATE POLICY "Users can create petitions" ON public.petitions FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own petitions" ON public.petitions FOR UPDATE USING (auth.uid() = creator_id);

-- Create policies for petition signatures
CREATE POLICY "Petition signatures are viewable by everyone" ON public.petition_signatures FOR SELECT USING (true);
CREATE POLICY "Users can sign petitions" ON public.petition_signatures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own signatures" ON public.petition_signatures FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for polls
CREATE POLICY "Polls are viewable by everyone" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON public.polls FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own polls" ON public.polls FOR UPDATE USING (auth.uid() = creator_id);

-- Create policies for poll options
CREATE POLICY "Poll options are viewable by everyone" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Poll creators can manage options" ON public.poll_options FOR ALL USING (
  EXISTS (SELECT 1 FROM public.polls WHERE polls.id = poll_options.poll_id AND polls.creator_id = auth.uid())
);

-- Create policies for poll votes
CREATE POLICY "Poll votes are viewable by everyone" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on polls" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.poll_votes FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for forum categories
CREATE POLICY "Forum categories are viewable by everyone" ON public.forum_categories FOR SELECT USING (true);

-- Create policies for forum topics
CREATE POLICY "Forum topics are viewable by everyone" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Users can create forum topics" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own topics" ON public.forum_topics FOR UPDATE USING (auth.uid() = creator_id);

-- Create policies for forum replies
CREATE POLICY "Forum replies are viewable by everyone" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Users can create forum replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = creator_id);

-- Create policies for community events
CREATE POLICY "Community events are viewable by everyone" ON public.community_events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.community_events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update their own events" ON public.community_events FOR UPDATE USING (auth.uid() = organizer_id);

-- Create policies for event attendees
CREATE POLICY "Event attendees are viewable by everyone" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can register for events" ON public.event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attendance" ON public.event_attendees FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for volunteer opportunities
CREATE POLICY "Volunteer opportunities are viewable by everyone" ON public.volunteer_opportunities FOR SELECT USING (true);
CREATE POLICY "Users can create volunteer opportunities" ON public.volunteer_opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update volunteer opportunities" ON public.volunteer_opportunities FOR UPDATE USING (true);

-- Create policies for volunteer applications
CREATE POLICY "Users can view applications for their opportunities" ON public.volunteer_applications FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.volunteer_opportunities WHERE volunteer_opportunities.id = volunteer_applications.opportunity_id)
);
CREATE POLICY "Users can apply for volunteer opportunities" ON public.volunteer_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.volunteer_applications FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_petitions_status ON public.petitions(status);
CREATE INDEX idx_petitions_category ON public.petitions(category);
CREATE INDEX idx_petitions_creator ON public.petitions(creator_id);
CREATE INDEX idx_petition_signatures_petition ON public.petition_signatures(petition_id);
CREATE INDEX idx_polls_status ON public.polls(status);
CREATE INDEX idx_polls_creator ON public.polls(creator_id);
CREATE INDEX idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX idx_forum_topics_category ON public.forum_topics(category_id);
CREATE INDEX idx_forum_replies_topic ON public.forum_replies(topic_id);
CREATE INDEX idx_events_start_time ON public.community_events(start_time);
CREATE INDEX idx_events_organizer ON public.community_events(organizer_id);
CREATE INDEX idx_volunteer_category ON public.volunteer_opportunities(category);

-- Create updated_at triggers
CREATE TRIGGER update_petitions_updated_at BEFORE UPDATE ON public.petitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.community_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_volunteer_opportunities_updated_at BEFORE UPDATE ON public.volunteer_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, icon, color, display_order) VALUES
('General Discussion', 'General topics about community and civic matters', 'MessageSquare', '#3b82f6', 1),
('Local Government', 'Discussions about local government decisions and policies', 'Building', '#10b981', 2),
('Infrastructure', 'Roads, utilities, public transportation and city planning', 'Construction', '#f59e0b', 3),
('Education', 'Schools, libraries, and educational initiatives', 'GraduationCap', '#8b5cf6', 4),
('Environment', 'Environmental issues, sustainability, and green initiatives', 'Leaf', '#22c55e', 5),
('Safety & Security', 'Public safety, crime prevention, and emergency services', 'Shield', '#ef4444', 6);

-- Function to update petition signature count
CREATE OR REPLACE FUNCTION update_petition_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.petitions 
    SET current_signatures = current_signatures + 1 
    WHERE id = NEW.petition_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.petitions 
    SET current_signatures = current_signatures - 1 
    WHERE id = OLD.petition_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for petition signature count
CREATE TRIGGER update_petition_signature_count_trigger
  AFTER INSERT OR DELETE ON public.petition_signatures
  FOR EACH ROW EXECUTE FUNCTION update_petition_signature_count();

-- Function to update poll vote count
CREATE OR REPLACE FUNCTION update_poll_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poll_options 
    SET vote_count = vote_count + 1 
    WHERE id = NEW.option_id;
    
    UPDATE public.polls 
    SET total_votes = total_votes + 1 
    WHERE id = NEW.poll_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poll_options 
    SET vote_count = vote_count - 1 
    WHERE id = OLD.option_id;
    
    UPDATE public.polls 
    SET total_votes = total_votes - 1 
    WHERE id = OLD.poll_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for poll vote count
CREATE TRIGGER update_poll_vote_count_trigger
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW EXECUTE FUNCTION update_poll_vote_count();

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_events 
    SET current_attendees = current_attendees + 1 
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_events 
    SET current_attendees = current_attendees - 1 
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for event attendee count
CREATE TRIGGER update_event_attendee_count_trigger
  AFTER INSERT OR DELETE ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION update_event_attendee_count();