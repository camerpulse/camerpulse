-- Create institution_messages table for institutional messaging
CREATE TABLE public.institution_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'moderator', 'admin')),
  subject TEXT NOT NULL,
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'general' CHECK (message_type IN ('general', 'urgent', 'support')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  reply_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.institution_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Institution owners can view their messages" 
ON public.institution_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.institution_claims 
    WHERE institution_id = institution_messages.institution_id 
    AND user_id = auth.uid() 
    AND status = 'approved'
  )
);

CREATE POLICY "Institution owners can update their messages" 
ON public.institution_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.institution_claims 
    WHERE institution_id = institution_messages.institution_id 
    AND user_id = auth.uid() 
    AND status = 'approved'
  )
);

CREATE POLICY "Users and moderators can create messages" 
ON public.institution_messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can manage all messages" 
ON public.institution_messages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes
CREATE INDEX idx_institution_messages_institution_id ON public.institution_messages(institution_id);
CREATE INDEX idx_institution_messages_sender_id ON public.institution_messages(sender_id);
CREATE INDEX idx_institution_messages_created_at ON public.institution_messages(created_at DESC);
CREATE INDEX idx_institution_messages_is_read ON public.institution_messages(is_read);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_institution_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_institution_messages_updated_at
  BEFORE UPDATE ON public.institution_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_messages_updated_at();