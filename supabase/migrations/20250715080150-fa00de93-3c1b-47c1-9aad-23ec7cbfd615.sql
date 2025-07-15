-- Create subscribers table for premium membership
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscription info
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

-- Create policy for edge functions to update subscription info
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

-- Create policy for edge functions to insert subscription info
CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create messages table for private messaging
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages" ON public.messages
FOR UPDATE
USING (receiver_id = auth.uid());

-- Create demo polls for engagement
INSERT INTO public.polls (title, description, options, is_active, ends_at, creator_id) VALUES
('Who should be Cameroon''s next President in 2025?', 'Cast your vote for the candidate you believe will best lead Cameroon forward', 
 ARRAY['Paul Biya (RDPC)', 'Maurice Kamto (MRC)', 'Cabral Libii (PCRN)', 'Joshua Osih (SDF)', 'Akere Muna (Independent)', 'Other Candidate'], 
 true, NOW() + INTERVAL '90 days', '00000000-0000-0000-0000-000000000000'),

('What is the most pressing issue facing Cameroon today?', 'Help prioritize the challenges our nation needs to address urgently', 
 ARRAY['Anglophone Crisis', 'Economic Development', 'Corruption', 'Education System', 'Healthcare', 'Infrastructure'], 
 true, NOW() + INTERVAL '60 days', '00000000-0000-0000-0000-000000000000'),

('Should Cameroon adopt a federal system of government?', 'A fundamental question about our nation''s political structure', 
 ARRAY['Yes, full federalism', 'Yes, but limited federalism', 'No, maintain unitary system', 'Not sure, need more information'], 
 true, NOW() + INTERVAL '45 days', '00000000-0000-0000-0000-000000000000'),

('How should Cameroon address youth unemployment?', 'Young Cameroonians need opportunities - what''s the best approach?', 
 ARRAY['More government job programs', 'Support entrepreneurship/startups', 'Improve technical education', 'Foreign investment incentives', 'Agricultural modernization', 'All of the above'], 
 true, NOW() + INTERVAL '30 days', '00000000-0000-0000-0000-000000000000'),

('What language policy should Cameroon adopt in schools?', 'Education language policy affects our children''s future', 
 ARRAY['English and French equally', 'Prioritize French', 'Prioritize English', 'Include more local languages', 'International languages (Chinese, etc)'], 
 true, NOW() + INTERVAL '40 days', '00000000-0000-0000-0000-000000000000'),

('Should Cameroon invest more in renewable energy?', 'Environmental and economic sustainability for our future', 
 ARRAY['Yes, solar power priority', 'Yes, hydroelectric expansion', 'Yes, wind power development', 'No, focus on oil/gas', 'Mixed approach'], 
 true, NOW() + INTERVAL '50 days', '00000000-0000-0000-0000-000000000000'),

('How can Cameroon improve its international image?', 'Boosting our nation''s reputation globally', 
 ARRAY['Better governance', 'Sports achievements', 'Cultural promotion', 'Economic growth', 'Diplomatic initiatives', 'Tourism development'], 
 true, NOW() + INTERVAL '35 days', '00000000-0000-0000-0000-000000000000'),

('What should be done about Boko Haram in the Far North?', 'Security challenges require decisive action', 
 ARRAY['Increase military presence', 'Focus on development', 'Regional cooperation', 'Dialogue and negotiation', 'Combined military-development approach'], 
 true, NOW() + INTERVAL '25 days', '00000000-0000-0000-0000-000000000000'),

('Should Cameroon host the 2030 Africa Cup of Nations?', 'Major sporting event with economic implications', 
 ARRAY['Yes, excellent opportunity', 'Yes, but need better infrastructure', 'No, too expensive', 'No, focus on other priorities', 'Conditional on reforms'], 
 true, NOW() + INTERVAL '55 days', '00000000-0000-0000-0000-000000000000'),

('How should Cameroon improve healthcare access?', 'Healthcare is a fundamental right for all citizens', 
 ARRAY['Build more hospitals', 'Train more doctors', 'Improve rural healthcare', 'Digital health solutions', 'Health insurance expansion', 'All approaches needed'], 
 true, NOW() + INTERVAL '65 days', '00000000-0000-0000-0000-000000000000');

-- Add verified column to profiles for premium users
ALTER TABLE public.profiles ADD COLUMN verified BOOLEAN DEFAULT false;

-- Add trigger for updated_at on subscribers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();