-- Create missing events-related tables and fix the schema

-- Create event speakers table
CREATE TABLE IF NOT EXISTS public.event_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  speaker_name TEXT NOT NULL,
  speaker_title TEXT,
  speaker_bio TEXT,
  speaker_image_url TEXT,
  profile_id UUID REFERENCES auth.users(id),
  speaker_order INTEGER DEFAULT 0,
  is_keynote BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event agenda table
CREATE TABLE IF NOT EXISTS public.event_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  agenda_time TIME NOT NULL,
  agenda_title TEXT NOT NULL,
  agenda_description TEXT,
  speaker_id UUID REFERENCES public.event_speakers(id),
  duration_minutes INTEGER DEFAULT 30,
  agenda_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event live updates table
CREATE TABLE IF NOT EXISTS public.event_live_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  update_title TEXT NOT NULL,
  update_content TEXT NOT NULL,
  posted_by UUID NOT NULL REFERENCES auth.users(id),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event chat messages table
CREATE TABLE IF NOT EXISTS public.event_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message_content TEXT NOT NULL,
  reply_to_id UUID REFERENCES public.event_chat_messages(id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event certificates table
CREATE TABLE IF NOT EXISTS public.event_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  certificate_url TEXT,
  certificate_hash TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_live_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_certificates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event speakers
CREATE POLICY "Event speakers are viewable by everyone" ON public.event_speakers
FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage speakers" ON public.event_speakers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_speakers.event_id 
    AND organizer_id = auth.uid()
  )
);

-- Create RLS policies for event agenda
CREATE POLICY "Event agenda is viewable by everyone" ON public.event_agenda
FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage agenda" ON public.event_agenda
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_agenda.event_id 
    AND organizer_id = auth.uid()
  )
);

-- Create RLS policies for event live updates
CREATE POLICY "Event live updates are viewable by everyone" ON public.event_live_updates
FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage live updates" ON public.event_live_updates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_live_updates.event_id 
    AND organizer_id = auth.uid()
  )
);

-- Create RLS policies for event chat messages
CREATE POLICY "Event chat messages are viewable by event attendees" ON public.event_chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.event_rsvps 
    WHERE event_id = event_chat_messages.event_id 
    AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_chat_messages.event_id 
    AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create chat messages" ON public.event_chat_messages
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" ON public.event_chat_messages
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for event certificates
CREATE POLICY "Users can view their own certificates" ON public.event_certificates
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can issue certificates" ON public.event_certificates
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_certificates.event_id 
    AND organizer_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_speakers_event_id ON public.event_speakers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_agenda_event_id ON public.event_agenda(event_id);
CREATE INDEX IF NOT EXISTS idx_event_live_updates_event_id ON public.event_live_updates(event_id);
CREATE INDEX IF NOT EXISTS idx_event_chat_messages_event_id ON public.event_chat_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_certificates_event_id ON public.event_certificates(event_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_speakers_updated_at
  BEFORE UPDATE ON public.event_speakers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_agenda_updated_at
  BEFORE UPDATE ON public.event_agenda
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_live_updates_updated_at
  BEFORE UPDATE ON public.event_live_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_chat_messages_updated_at
  BEFORE UPDATE ON public.event_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();