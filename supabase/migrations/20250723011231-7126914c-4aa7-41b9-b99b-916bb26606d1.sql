-- Create email verification tokens table and user profile extensions

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'email_verification',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email verification tokens
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for email verification tokens
CREATE POLICY "Users can view their own tokens" 
ON public.email_verification_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create tokens" 
ON public.email_verification_tokens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update tokens" 
ON public.email_verification_tokens 
FOR UPDATE 
USING (true);

-- Create user profile extensions table
CREATE TABLE IF NOT EXISTS public.user_profile_extensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT,
  date_of_birth DATE,
  gender TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Cameroon',
  occupation TEXT,
  organization TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Africa/Douala',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "limited"}'::jsonb,
  account_verification_level INTEGER DEFAULT 0,
  id_document_type TEXT,
  id_document_number TEXT,
  id_document_url TEXT,
  id_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user profile extensions
ALTER TABLE public.user_profile_extensions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user profile extensions
CREATE POLICY "Users can view their own profile extensions" 
ON public.user_profile_extensions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile extensions" 
ON public.user_profile_extensions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile extensions" 
ON public.user_profile_extensions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profile extensions" 
ON public.user_profile_extensions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to automatically create profile extensions
CREATE OR REPLACE FUNCTION public.create_profile_extensions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profile_extensions (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile extensions when profile is created
DROP TRIGGER IF EXISTS create_profile_extensions_trigger ON public.profiles;
CREATE TRIGGER create_profile_extensions_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_extensions();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_profile_extensions_user_id ON public.user_profile_extensions(user_id);

-- Update trigger for user profile extensions table
CREATE OR REPLACE FUNCTION public.update_user_profile_extensions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profile_extensions_updated_at ON public.user_profile_extensions;
CREATE TRIGGER update_user_profile_extensions_updated_at
  BEFORE UPDATE ON public.user_profile_extensions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profile_extensions_updated_at();