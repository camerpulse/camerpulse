-- Extended Senator System Functions and Trust Score Calculations

-- Functions for calculating scores and metrics
CREATE OR REPLACE FUNCTION public.calculate_senator_trust_score(p_senator_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trust_score numeric := 50.0;
  avg_rating numeric;
  misconduct_count integer;
  verification_bonus numeric := 0;
BEGIN
  -- Get average rating
  SELECT AVG(overall_rating) INTO avg_rating
  FROM senator_ratings 
  WHERE senator_id = p_senator_id;
  
  -- Get misconduct reports count
  SELECT COUNT(*) INTO misconduct_count
  FROM senator_reports 
  WHERE senator_id = p_senator_id AND status != 'dismissed';
  
  -- Base calculation
  trust_score := COALESCE(avg_rating * 20, 50);
  
  -- Verification bonus
  SELECT CASE WHEN is_verified THEN 10 ELSE 0 END INTO verification_bonus
  FROM senators WHERE id = p_senator_id;
  
  -- Apply factors
  trust_score := trust_score + verification_bonus - (misconduct_count * 5);
  
  -- Ensure bounds
  trust_score := GREATEST(0, LEAST(100, trust_score));
  
  -- Update senator record
  UPDATE senators 
  SET trust_score = trust_score 
  WHERE id = p_senator_id;
  
  RETURN trust_score;
END;
$$;

-- Function to update follower count
CREATE OR REPLACE FUNCTION public.update_senator_follower_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE senators 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.senator_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE senators 
    SET follower_count = follower_count - 1 
    WHERE id = OLD.senator_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update misconduct reports count
CREATE OR REPLACE FUNCTION public.update_senator_misconduct_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE senators 
    SET misconduct_reports_count = misconduct_reports_count + 1 
    WHERE id = NEW.senator_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE senators 
    SET misconduct_reports_count = misconduct_reports_count - 1 
    WHERE id = OLD.senator_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to calculate enhanced senator scores
CREATE OR REPLACE FUNCTION public.calculate_enhanced_senator_scores(p_senator_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  performance_score numeric := 0;
  engagement_score numeric := 0;
  transparency_score numeric := 0;
  integrity_score numeric := 0;
  overall_score numeric := 0;
  result jsonb;
BEGIN
  -- Calculate performance score (based on bills and legislative activity)
  SELECT 
    CASE 
      WHEN (bills_proposed_count + bills_passed_count) > 0 THEN
        ((bills_passed_count::numeric / NULLIF(bills_proposed_count, 0)) * 30) + 
        (LEAST(bills_proposed_count, 10) * 2) + 
        (LEAST(bills_passed_count, 10) * 5)
      ELSE 0
    END INTO performance_score
  FROM senators 
  WHERE id = p_senator_id;
  
  -- Calculate engagement score (based on ratings and interactions)
  SELECT 
    COALESCE(AVG(civic_engagement_rating), 0) * 10 +
    CASE WHEN COUNT(*) > 10 THEN 20 ELSE COUNT(*) * 2 END INTO engagement_score
  FROM senator_ratings 
  WHERE senator_id = p_senator_id;
  
  -- Calculate transparency score (based on verified ratings and profile completeness)
  SELECT 
    COALESCE(AVG(transparency_rating), 0) * 15 +
    CASE WHEN profile_completeness_score > 80 THEN 20 ELSE profile_completeness_score / 4 END INTO transparency_score
  FROM senator_ratings sr
  JOIN senators s ON s.id = sr.senator_id
  WHERE s.id = p_senator_id;
  
  -- Calculate integrity score (based on misconduct reports and verified status)
  SELECT 
    100 - (misconduct_reports_count * 10) + 
    CASE WHEN is_verified THEN 15 ELSE 0 END INTO integrity_score
  FROM senators 
  WHERE id = p_senator_id;
  
  -- Calculate overall score (weighted average)
  overall_score := (
    COALESCE(performance_score, 0) * 0.3 +
    COALESCE(engagement_score, 0) * 0.25 +
    COALESCE(transparency_score, 0) * 0.25 +
    COALESCE(integrity_score, 0) * 0.2
  );
  
  -- Ensure scores are within bounds
  performance_score := GREATEST(0, LEAST(100, COALESCE(performance_score, 0)));
  engagement_score := GREATEST(0, LEAST(100, COALESCE(engagement_score, 0)));
  transparency_score := GREATEST(0, LEAST(100, COALESCE(transparency_score, 0)));
  integrity_score := GREATEST(0, LEAST(100, COALESCE(integrity_score, 0)));
  overall_score := GREATEST(0, LEAST(100, overall_score));
  
  -- Update senator record
  UPDATE senators 
  SET 
    performance_score = performance_score,
    civic_engagement_score = engagement_score,
    transparency_score = transparency_score,
    trust_score = calculate_senator_trust_score(p_senator_id)
  WHERE id = p_senator_id;
  
  -- Return calculated scores
  result := jsonb_build_object(
    'performance_score', performance_score,
    'engagement_score', engagement_score,
    'transparency_score', transparency_score,
    'integrity_score', integrity_score,
    'overall_score', overall_score
  );
  
  RETURN result;
END;
$$;

-- Add triggers for automatic updates
DROP TRIGGER IF EXISTS senator_follower_count_trigger ON public.senator_following;
CREATE TRIGGER senator_follower_count_trigger
  AFTER INSERT OR DELETE ON public.senator_following
  FOR EACH ROW EXECUTE FUNCTION public.update_senator_follower_count();

DROP TRIGGER IF EXISTS senator_misconduct_count_trigger ON public.senator_reports;
CREATE TRIGGER senator_misconduct_count_trigger
  AFTER INSERT OR DELETE ON public.senator_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_senator_misconduct_count();

-- Function to sync senators from external source
CREATE OR REPLACE FUNCTION public.sync_senators_from_source()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sync_log_id uuid;
  result jsonb;
BEGIN
  -- Insert sync log
  INSERT INTO senator_sync_logs (sync_type, source_url, sync_status, started_at)
  VALUES ('manual_sync', 'https://senat.cm/?page_id=869', 'started', now())
  RETURNING id INTO sync_log_id;
  
  -- This function would trigger the edge function to scrape data
  -- For now, return a placeholder result
  result := jsonb_build_object(
    'sync_log_id', sync_log_id,
    'status', 'initiated',
    'message', 'Senator sync initiated. Check sync logs for progress.'
  );
  
  -- Update sync log
  UPDATE senator_sync_logs 
  SET sync_status = 'completed', completed_at = now()
  WHERE id = sync_log_id;
  
  RETURN result;
END;
$$;