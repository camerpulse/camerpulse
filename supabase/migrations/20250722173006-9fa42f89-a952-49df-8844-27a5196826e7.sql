-- Complete Extended Senator System - Simple Table Creation

-- Ensure senators table has all extended fields
ALTER TABLE public.senators 
ADD COLUMN IF NOT EXISTS is_claimable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS trust_score numeric(3,1) DEFAULT 50.0,
ADD COLUMN IF NOT EXISTS misconduct_reports_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_score numeric(3,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS can_receive_messages boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS message_response_time_hours integer;

-- Create senator following table
CREATE TABLE IF NOT EXISTS public.senator_following (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled boolean DEFAULT true,
  followed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(senator_id, user_id)
);

-- Create senator claims table
CREATE TABLE IF NOT EXISTS public.senator_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_type text NOT NULL DEFAULT 'ownership',
  claim_reason text,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create senator reports table
CREATE TABLE IF NOT EXISTS public.senator_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  report_category text NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'medium',
  status text DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create senator messages table
CREATE TABLE IF NOT EXISTS public.senator_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senator_id uuid NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message_content text NOT NULL,
  message_type text DEFAULT 'inquiry',
  status text DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.senator_following ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senator_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can manage their follows" ON public.senator_following FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their claims" ON public.senator_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create claims" ON public.senator_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their reports" ON public.senator_reports FOR SELECT USING (auth.uid() = reporter_user_id);
CREATE POLICY "Users can create reports" ON public.senator_reports FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "Users can view their messages" ON public.senator_messages FOR SELECT USING (auth.uid() = sender_user_id);
CREATE POLICY "Users can send messages" ON public.senator_messages FOR INSERT WITH CHECK (auth.uid() = sender_user_id);