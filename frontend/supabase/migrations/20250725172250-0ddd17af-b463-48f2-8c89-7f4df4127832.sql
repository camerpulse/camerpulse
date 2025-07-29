-- Phase 2: Enhanced Poll System - User Voting Interface & Management
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

-- Create poll templates table
CREATE TABLE IF NOT EXISTS poll_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'civic',
  configuration JSONB DEFAULT '{}',
  style_settings JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll user interactions table
CREATE TABLE IF NOT EXISTS poll_user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'share', 'bookmark', 'report'
  interaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id, interaction_type)
);

-- Create poll bookmarks table
CREATE TABLE IF NOT EXISTS poll_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
ALTER TABLE poll_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poll_categories
CREATE POLICY "Everyone can view active categories" ON poll_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON poll_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for poll_templates  
CREATE POLICY "Everyone can view active templates" ON poll_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create templates" ON poll_templates
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own templates" ON poll_templates
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Admins can manage all templates" ON poll_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for poll_user_interactions
CREATE POLICY "Users can manage their own interactions" ON poll_user_interactions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for poll_bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON poll_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Functions for user interactions
CREATE OR REPLACE FUNCTION increment_poll_view_count(p_poll_id UUID, p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Update view count
  UPDATE polls SET view_count = view_count + 1 WHERE id = p_poll_id;
  
  -- Record user interaction if user is logged in
  IF p_user_id IS NOT NULL THEN
    INSERT INTO poll_user_interactions (poll_id, user_id, interaction_type)
    VALUES (p_poll_id, p_user_id, 'view')
    ON CONFLICT (poll_id, user_id, interaction_type) DO NOTHING;
  END IF;
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
    WHERE poll_id = p_poll_id AND user_id = p_user_id
  ) INTO bookmark_exists;
  
  IF bookmark_exists THEN
    -- Remove bookmark
    DELETE FROM poll_bookmarks 
    WHERE poll_id = p_poll_id AND user_id = p_user_id;
    
    -- Decrement bookmark count
    UPDATE polls SET bookmark_count = GREATEST(0, bookmark_count - 1) 
    WHERE id = p_poll_id;
    
    RETURN false;
  ELSE
    -- Add bookmark
    INSERT INTO poll_bookmarks (poll_id, user_id) 
    VALUES (p_poll_id, p_user_id);
    
    -- Increment bookmark count
    UPDATE polls SET bookmark_count = bookmark_count + 1 
    WHERE id = p_poll_id;
    
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_poll_status(p_poll_id UUID, p_user_id UUID)
RETURNS TABLE(
  has_voted BOOLEAN,
  voted_option_index INTEGER,
  is_bookmarked BOOLEAN,
  has_viewed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM poll_votes WHERE poll_id = p_poll_id AND user_id = p_user_id) as has_voted,
    (SELECT option_index FROM poll_votes WHERE poll_id = p_poll_id AND user_id = p_user_id LIMIT 1) as voted_option_index,
    EXISTS(SELECT 1 FROM poll_bookmarks WHERE poll_id = p_poll_id AND user_id = p_user_id) as is_bookmarked,
    EXISTS(SELECT 1 FROM poll_user_interactions WHERE poll_id = p_poll_id AND user_id = p_user_id AND interaction_type = 'view') as has_viewed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update poll category counts
CREATE OR REPLACE FUNCTION update_category_poll_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.category_id IS NOT NULL THEN
      UPDATE poll_categories SET poll_count = poll_count + 1 WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      IF OLD.category_id IS NOT NULL THEN
        UPDATE poll_categories SET poll_count = GREATEST(0, poll_count - 1) WHERE id = OLD.category_id;
      END IF;
      IF NEW.category_id IS NOT NULL THEN
        UPDATE poll_categories SET poll_count = poll_count + 1 WHERE id = NEW.category_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE poll_categories SET poll_count = GREATEST(0, poll_count - 1) WHERE id = OLD.category_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_category_poll_count ON polls;
CREATE TRIGGER trigger_update_category_poll_count
  AFTER INSERT OR UPDATE OR DELETE ON polls
  FOR EACH ROW EXECUTE FUNCTION update_category_poll_count();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_category_id ON polls(category_id);
CREATE INDEX IF NOT EXISTS idx_polls_view_count ON polls(view_count);
CREATE INDEX IF NOT EXISTS idx_poll_user_interactions_user_poll ON poll_user_interactions(user_id, poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_bookmarks_user_id ON poll_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_templates_type ON poll_templates(template_type);

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

-- Insert default templates
INSERT INTO poll_templates (name, description, template_type, configuration, style_settings) VALUES
  ('Basic Civic Poll', 'Simple poll for civic engagement', 'civic', 
   '{"maxOptions": 5, "requireAuth": true, "allowComments": true}',
   '{"theme": "government", "colorScheme": "blue", "layout": "card"}'),
  ('Yes/No Question', 'Binary choice for quick decisions', 'civic',
   '{"maxOptions": 2, "requireAuth": false, "allowComments": false}',
   '{"theme": "minimal", "colorScheme": "gray", "layout": "simple"}'),
  ('Political Survey', 'Multi-question political assessment', 'political',
   '{"maxOptions": 6, "requireAuth": true, "allowComments": true, "showResults": "after_end"}',
   '{"theme": "political", "colorScheme": "purple", "layout": "survey"}'),
  ('Community Feedback', 'Gather community opinions and feedback', 'social',
   '{"maxOptions": 4, "requireAuth": false, "allowComments": true}',
   '{"theme": "community", "colorScheme": "green", "layout": "card"}')
ON CONFLICT DO NOTHING;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE poll_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_user_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_bookmarks;