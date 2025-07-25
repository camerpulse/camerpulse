-- Phase 2: Enhanced Poll System - Core Tables Only
-- Create poll categories table
CREATE TABLE IF NOT EXISTS poll_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#3b82f6',
  poll_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll bookmarks table
CREATE TABLE IF NOT EXISTS poll_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Add new columns to polls table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'polls' AND column_name = 'category_id') THEN
    ALTER TABLE polls ADD COLUMN category_id UUID REFERENCES poll_categories(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'polls' AND column_name = 'view_count') THEN
    ALTER TABLE polls ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'polls' AND column_name = 'bookmark_count') THEN
    ALTER TABLE polls ADD COLUMN bookmark_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE poll_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poll_categories
CREATE POLICY "Everyone can view active categories" ON poll_categories
  FOR SELECT USING (is_active = true);

-- RLS Policies for poll_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON poll_bookmarks
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Functions for user interactions
CREATE OR REPLACE FUNCTION increment_poll_view_count(p_poll_id UUID, p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Update view count
  UPDATE polls SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_poll_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_poll_bookmark(p_poll_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  bookmark_exists BOOLEAN;
BEGIN
  -- Check if bookmark exists
  SELECT EXISTS(
    SELECT 1 FROM poll_bookmarks 
    WHERE poll_id = p_poll_id AND user_id = p_user_id::text
  ) INTO bookmark_exists;
  
  IF bookmark_exists THEN
    -- Remove bookmark
    DELETE FROM poll_bookmarks 
    WHERE poll_id = p_poll_id AND user_id = p_user_id::text;
    
    -- Decrement bookmark count
    UPDATE polls SET bookmark_count = GREATEST(0, COALESCE(bookmark_count, 0) - 1) 
    WHERE id = p_poll_id;
    
    RETURN false;
  ELSE
    -- Add bookmark
    INSERT INTO poll_bookmarks (poll_id, user_id) 
    VALUES (p_poll_id, p_user_id::text);
    
    -- Increment bookmark count
    UPDATE polls SET bookmark_count = COALESCE(bookmark_count, 0) + 1 
    WHERE id = p_poll_id;
    
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_category_id ON polls(category_id);
CREATE INDEX IF NOT EXISTS idx_polls_view_count ON polls(view_count);
CREATE INDEX IF NOT EXISTS idx_poll_bookmarks_user_id ON poll_bookmarks(user_id);

-- Insert default categories
INSERT INTO poll_categories (name, description, icon, color) VALUES
  ('Civic Affairs', 'Government, public policy, and civic engagement', 'government', '#dc2626'),
  ('Politics', 'Political parties, elections, and political discourse', 'vote', '#7c3aed'),
  ('Social Issues', 'Community concerns and social matters', 'users', '#059669'),
  ('Business & Economy', 'Economic policies, business environment', 'trending-up', '#ea580c'),
  ('Education', 'Educational policies and academic matters', 'book', '#2563eb'),
  ('Healthcare', 'Public health and healthcare policies', 'heart', '#dc2626'),
  ('Environment', 'Environmental and sustainability issues', 'leaf', '#16a34a'),
  ('Technology', 'Digital governance and tech policies', 'cpu', '#6366f1'),
  ('Culture & Arts', 'Cultural events and artistic expression', 'palette', '#db2777'),
  ('General', 'Miscellaneous and general interest polls', 'message-circle', '#64748b')
ON CONFLICT (name) DO NOTHING;