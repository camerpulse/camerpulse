-- Village Comments System
CREATE TABLE public.village_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.village_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Village Discussions
CREATE TABLE public.village_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Discussion Replies
CREATE TABLE public.discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL REFERENCES public.village_discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Village Events
CREATE TABLE public.village_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  event_type TEXT NOT NULL DEFAULT 'community',
  max_attendees INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event Attendees
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.village_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  attendance_status TEXT NOT NULL DEFAULT 'going',
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.village_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Comments
CREATE POLICY "Comments are viewable by everyone" ON public.village_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create comments" ON public.village_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.village_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.village_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Discussions
CREATE POLICY "Discussions are viewable by everyone" ON public.village_discussions
  FOR SELECT USING (true);

CREATE POLICY "Users can create discussions" ON public.village_discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions" ON public.village_discussions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions" ON public.village_discussions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Discussion Replies
CREATE POLICY "Replies are viewable by everyone" ON public.discussion_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can create replies" ON public.discussion_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" ON public.discussion_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" ON public.discussion_replies
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Events
CREATE POLICY "Events are viewable by everyone" ON public.village_events
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create events" ON public.village_events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own events" ON public.village_events
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own events" ON public.village_events
  FOR DELETE USING (auth.uid() = organizer_id);

-- RLS Policies for Event Attendees
CREATE POLICY "Attendees are viewable by everyone" ON public.event_attendees
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their attendance" ON public.event_attendees
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_village_comments_village_id ON public.village_comments(village_id);
CREATE INDEX idx_village_comments_parent_id ON public.village_comments(parent_comment_id);
CREATE INDEX idx_village_discussions_village_id ON public.village_discussions(village_id);
CREATE INDEX idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX idx_village_events_village_id ON public.village_events(village_id);
CREATE INDEX idx_village_events_date ON public.village_events(event_date);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_village_comments_updated_at
  BEFORE UPDATE ON public.village_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_village_discussions_updated_at
  BEFORE UPDATE ON public.village_discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
  BEFORE UPDATE ON public.discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_village_events_updated_at
  BEFORE UPDATE ON public.village_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update discussion stats
CREATE OR REPLACE FUNCTION update_discussion_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.village_discussions 
    SET replies_count = replies_count + 1,
        last_activity_at = now()
    WHERE id = NEW.discussion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.village_discussions 
    SET replies_count = replies_count - 1
    WHERE id = OLD.discussion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_discussion_reply_stats
  AFTER INSERT OR DELETE ON public.discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_discussion_stats();