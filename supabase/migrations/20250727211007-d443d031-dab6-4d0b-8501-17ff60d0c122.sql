-- Create storage buckets for file sharing
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('chat-files', 'chat-files', false),
  ('voice-messages', 'voice-messages', false);

-- Create storage policies for chat files
CREATE POLICY "Users can upload chat files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view chat files they have access to" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-files' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM chat_messages cm
      WHERE cm.file_url = storage.objects.name
      AND cm.conversation_id IN (
        SELECT conversation_id FROM conversation_participants
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- Create storage policies for voice messages
CREATE POLICY "Users can upload voice messages" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'voice-messages' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view voice messages they have access to" ON storage.objects
FOR SELECT USING (
  bucket_id = 'voice-messages' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM chat_messages cm
      WHERE cm.voice_url = storage.objects.name
      AND cm.conversation_id IN (
        SELECT conversation_id FROM conversation_participants
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- Enhance chat_messages table for new features
ALTER TABLE chat_messages 
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'voice', 'encrypted')),
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size BIGINT,
ADD COLUMN file_type TEXT,
ADD COLUMN voice_url TEXT,
ADD COLUMN voice_duration INTEGER,
ADD COLUMN is_encrypted BOOLEAN DEFAULT false,
ADD COLUMN encryption_key_id TEXT,
ADD COLUMN voice_transcript TEXT;

-- Create chat_encryption_keys table for end-to-end encryption
CREATE TABLE chat_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_key TEXT NOT NULL,
  key_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id, key_version)
);

-- Enable RLS on encryption keys
ALTER TABLE chat_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Create policy for encryption keys
CREATE POLICY "Users can manage their encryption keys"
ON chat_encryption_keys
FOR ALL
USING (user_id = auth.uid());

-- Create chat_bots table for customer support bots
CREATE TABLE chat_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  bot_type TEXT NOT NULL CHECK (bot_type IN ('support', 'sales', 'general')),
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  capabilities JSONB DEFAULT '[]'::jsonb,
  response_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on chat bots
ALTER TABLE chat_bots ENABLE ROW LEVEL SECURITY;

-- Create policy for chat bots (public read for active bots)
CREATE POLICY "Active bots are publicly viewable"
ON chat_bots
FOR SELECT
USING (is_active = true);

-- Create bot_conversations table to track bot interactions
CREATE TABLE bot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES chat_bots(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  session_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on bot conversations
ALTER TABLE bot_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for bot conversations
CREATE POLICY "Users can manage their bot conversations"
ON bot_conversations
FOR ALL
USING (user_id = auth.uid());

-- Insert default customer support bot
INSERT INTO chat_bots (name, description, bot_type, system_prompt, capabilities, response_settings)
VALUES (
  'CamerPulse Support Assistant',
  'AI-powered customer support bot for marketplace assistance',
  'support',
  'You are a helpful customer support assistant for CamerPulse, a civic engagement and marketplace platform. You can help users with account issues, marketplace transactions, village information, and general platform navigation. Be friendly, professional, and concise. If you cannot help with a specific issue, direct users to contact human support.',
  '["order_tracking", "account_help", "marketplace_guidance", "platform_navigation", "faq_answers"]'::jsonb,
  '{"max_response_length": 500, "temperature": 0.7, "enable_voice": true}'::jsonb
);

-- Create updated_at trigger for chat_bots
CREATE TRIGGER update_chat_bots_updated_at
    BEFORE UPDATE ON chat_bots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create file_share_permissions table for granular file access control
CREATE TABLE file_share_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT DEFAULT 'view' CHECK (permission_type IN ('view', 'download')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on file share permissions
ALTER TABLE file_share_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for file share permissions
CREATE POLICY "Users can manage file permissions they created"
ON file_share_permissions
FOR ALL
USING (shared_by = auth.uid() OR shared_with = auth.uid());