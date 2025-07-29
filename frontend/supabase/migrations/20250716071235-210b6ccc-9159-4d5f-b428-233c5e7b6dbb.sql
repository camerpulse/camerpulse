-- Add poll moderation and party logo features
ALTER TABLE polls ADD COLUMN IF NOT EXISTS party_logos jsonb DEFAULT '{}';
ALTER TABLE polls ADD COLUMN IF NOT EXISTS moderation_enabled boolean DEFAULT false;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS requires_verification boolean DEFAULT false;

-- Create poll comments table with moderation
CREATE TABLE IF NOT EXISTS poll_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  is_moderated boolean DEFAULT false,
  moderated_by uuid REFERENCES auth.users(id),
  moderated_at timestamp with time zone,
  moderation_reason text,
  is_approved boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on poll_comments
ALTER TABLE poll_comments ENABLE ROW LEVEL SECURITY;