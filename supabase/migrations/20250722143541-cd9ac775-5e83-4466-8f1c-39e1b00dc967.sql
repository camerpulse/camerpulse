-- Enhance senators table with comprehensive profile fields
ALTER TABLE public.senators 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS political_party text,
ADD COLUMN IF NOT EXISTS career_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bills_passed jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bills_proposed_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS bills_passed_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS official_senate_url text,
ADD COLUMN IF NOT EXISTS civic_engagement_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS transparency_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_profile_update timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS data_verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS source_page_url text,
ADD COLUMN IF NOT EXISTS auto_update_enabled boolean DEFAULT true;

-- Update existing records to use name as full_name where missing
UPDATE public.senators 
SET full_name = name 
WHERE full_name IS NULL AND name IS NOT NULL;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_senators_full_name ON public.senators USING gin(to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS idx_senators_political_party ON public.senators(political_party);
CREATE INDEX IF NOT EXISTS idx_senators_region ON public.senators(region);
CREATE INDEX IF NOT EXISTS idx_senators_performance_score ON public.senators(performance_score DESC);
CREATE INDEX IF NOT EXISTS idx_senators_transparency_score ON public.senators(transparency_score DESC);

-- Create function to calculate composite performance score
CREATE OR REPLACE FUNCTION calculate_senator_performance_score(
  p_senator_id uuid
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating numeric := 0;
  engagement_score numeric := 0;
  transparency_score numeric := 0;
  bills_score numeric := 0;
  composite_score numeric := 0;
BEGIN
  -- Get average rating from senator_ratings table
  SELECT COALESCE(AVG(overall_rating), 0) 
  INTO avg_rating
  FROM senator_ratings 
  WHERE senator_id = p_senator_id;
  
  -- Get bills performance (normalized to 0-100 scale)
  SELECT LEAST(100, (bills_proposed_count + bills_passed_count * 2) * 5)
  INTO bills_score
  FROM senators 
  WHERE id = p_senator_id;
  
  -- Get engagement and transparency scores
  SELECT 
    COALESCE(civic_engagement_score, 0),
    COALESCE(transparency_score, 50)
  INTO engagement_score, transparency_score
  FROM senators 
  WHERE id = p_senator_id;
  
  -- Calculate weighted composite score
  composite_score := (
    (avg_rating * 20 * 0.3) +           -- 30% weight for user ratings
    (engagement_score * 0.25) +         -- 25% weight for civic engagement
    (transparency_score * 0.25) +       -- 25% weight for transparency
    (bills_score * 0.2)                 -- 20% weight for legislative activity
  );
  
  -- Update the senator's performance score
  UPDATE senators 
  SET performance_score = composite_score,
      last_profile_update = now()
  WHERE id = p_senator_id;
  
  RETURN composite_score;
END;
$$;

-- Create function to assign performance badges
CREATE OR REPLACE FUNCTION update_senator_badges(p_senator_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  senator_record RECORD;
  new_badges jsonb := '[]'::jsonb;
BEGIN
  -- Get senator details
  SELECT * INTO senator_record
  FROM senators 
  WHERE id = p_senator_id;
  
  -- Civic Champion badge (high engagement + good ratings)
  IF senator_record.civic_engagement_score >= 75 AND senator_record.average_rating >= 4.0 THEN
    new_badges := new_badges || '["🏅 Civic Champion"]'::jsonb;
  END IF;
  
  -- High Performer badge (top 25% performance score)
  IF senator_record.performance_score >= 75 THEN
    new_badges := new_badges || '["📊 High Performer"]'::jsonb;
  END IF;
  
  -- Legislative Leader badge (high bill activity)
  IF senator_record.bills_passed_count >= 5 OR senator_record.bills_proposed_count >= 10 THEN
    new_badges := new_badges || '["⚖️ Legislative Leader"]'::jsonb;
  END IF;
  
  -- Transparency Champion badge
  IF senator_record.transparency_score >= 80 THEN
    new_badges := new_badges || '["🔍 Transparency Champion"]'::jsonb;
  END IF;
  
  -- Low Transparency flag
  IF senator_record.transparency_score < 40 THEN
    new_badges := new_badges || '["🔒 Low Transparency"]'::jsonb;
  END IF;
  
  -- Update badges
  UPDATE senators 
  SET badges = new_badges,
      last_profile_update = now()
  WHERE id = p_senator_id;
END;
$$;

-- Create trigger to update performance scores when ratings change
CREATE OR REPLACE FUNCTION update_senator_performance_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate performance score for the affected senator
  PERFORM calculate_senator_performance_score(COALESCE(NEW.senator_id, OLD.senator_id));
  PERFORM update_senator_badges(COALESCE(NEW.senator_id, OLD.senator_id));
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to senator_ratings table
DROP TRIGGER IF EXISTS senator_performance_update_trigger ON senator_ratings;
CREATE TRIGGER senator_performance_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON senator_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_senator_performance_trigger();

-- Create scheduled update tracking table
CREATE TABLE IF NOT EXISTS public.senator_update_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  last_update_check timestamp with time zone DEFAULT now(),
  next_scheduled_update timestamp with time zone DEFAULT (now() + interval '30 days'),
  update_status text DEFAULT 'scheduled',
  senators_updated integer DEFAULT 0,
  new_senators_found integer DEFAULT 0,
  duplicates_removed integer DEFAULT 0,
  data_issues_found jsonb DEFAULT '[]'::jsonb,
  update_log jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE public.senator_update_schedule ENABLE ROW LEVEL SECURITY;

-- Create policy for update schedule
CREATE POLICY "Admins can manage update schedule" 
ON public.senator_update_schedule 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Insert initial update schedule record
INSERT INTO public.senator_update_schedule (update_status, update_log)
VALUES ('completed', '{"initial_setup": true, "senators_imported": 101}')
ON CONFLICT DO NOTHING;