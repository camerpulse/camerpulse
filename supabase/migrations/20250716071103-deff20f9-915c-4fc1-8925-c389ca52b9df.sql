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

-- RLS policies for poll_comments
CREATE POLICY "Users can view approved comments" ON poll_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create comments" ON poll_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON poll_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate comments" ON poll_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger for poll_comments
CREATE OR REPLACE FUNCTION update_poll_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_comments_updated_at
  BEFORE UPDATE ON poll_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_comments_updated_at();