-- Fix critical RLS policy gaps for security
-- Add missing RLS policies for tables that have RLS enabled but no policies

-- Politicians table policies
CREATE POLICY "Politicians are viewable by everyone" 
ON public.politicians 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage politicians" 
ON public.politicians 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Add missing profile route support
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  civic_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_profiles
CREATE POLICY "Users can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();