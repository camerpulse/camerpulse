-- Function to calculate civic reputation score
CREATE OR REPLACE FUNCTION calculate_civic_reputation_score(
  p_entity_type civic_entity_type,
  p_entity_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transparency_score NUMERIC := 0;
  v_performance_score NUMERIC := 0;
  v_citizen_rating_score NUMERIC := 0;
  v_engagement_score NUMERIC := 0;
  v_response_speed_score NUMERIC := 0;
  v_negative_flags_penalty NUMERIC := 0;
  v_total_score NUMERIC := 0;
  v_reputation_badge reputation_badge := 'under_watch';
  v_total_ratings INTEGER := 0;
  v_average_rating NUMERIC := 0;
  v_five_star INTEGER := 0;
  v_four_star INTEGER := 0;
  v_three_star INTEGER := 0;
  v_two_star INTEGER := 0;
  v_one_star INTEGER := 0;
BEGIN
  -- Calculate rating statistics
  SELECT 
    COUNT(*),
    COALESCE(AVG(overall_rating), 0),
    COUNT(*) FILTER (WHERE overall_rating = 5),
    COUNT(*) FILTER (WHERE overall_rating = 4),
    COUNT(*) FILTER (WHERE overall_rating = 3),
    COUNT(*) FILTER (WHERE overall_rating = 2),
    COUNT(*) FILTER (WHERE overall_rating = 1)
  INTO v_total_ratings, v_average_rating, v_five_star, v_four_star, v_three_star, v_two_star, v_one_star
  FROM civic_entity_ratings 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;

  -- Calculate component scores (simplified algorithm)
  -- Transparency score (based on transparency ratings)
  SELECT COALESCE(AVG(transparency_rating) * 20, 0) INTO v_transparency_score
  FROM civic_entity_ratings 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id 
    AND transparency_rating IS NOT NULL;

  -- Performance score (based on performance ratings)
  SELECT COALESCE(AVG(performance_rating) * 20, 0) INTO v_performance_score
  FROM civic_entity_ratings 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id 
    AND performance_rating IS NOT NULL;

  -- Citizen rating score (based on overall ratings)
  v_citizen_rating_score := v_average_rating * 20;

  -- Engagement score (based on engagement ratings)
  SELECT COALESCE(AVG(engagement_rating) * 20, 0) INTO v_engagement_score
  FROM civic_entity_ratings 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id 
    AND engagement_rating IS NOT NULL;

  -- Response speed score (placeholder - could be calculated from actual response data)
  v_response_speed_score := 75; -- Default score

  -- Negative flags penalty (count of abuse reports)
  SELECT COALESCE(COUNT(*) * 5, 0) INTO v_negative_flags_penalty
  FROM civic_rating_abuse_reports r
  JOIN civic_entity_ratings er ON r.reported_rating_id = er.id
  WHERE er.entity_type = p_entity_type AND er.entity_id = p_entity_id
    AND r.status = 'confirmed';

  -- Calculate total score using weights
  v_total_score := (
    v_transparency_score * 0.25 +
    v_performance_score * 0.25 +
    v_citizen_rating_score * 0.20 +
    v_engagement_score * 0.15 +
    v_response_speed_score * 0.10
  ) - v_negative_flags_penalty;

  -- Ensure score is within bounds
  v_total_score := GREATEST(0, LEAST(100, v_total_score));

  -- Determine reputation badge
  IF v_total_score >= 85 THEN
    v_reputation_badge := 'excellent';
  ELSIF v_total_score >= 70 THEN
    v_reputation_badge := 'trusted';
  ELSIF v_total_score >= 40 THEN
    v_reputation_badge := 'under_watch';
  ELSE
    v_reputation_badge := 'flagged';
  END IF;

  -- Insert or update reputation score
  INSERT INTO civic_reputation_scores (
    entity_type, entity_id, entity_name,
    transparency_score, performance_score, citizen_rating_score,
    engagement_score, response_speed_score, negative_flags_penalty,
    total_score, reputation_badge,
    total_ratings, average_rating,
    five_star_count, four_star_count, three_star_count, two_star_count, one_star_count,
    last_calculated_at
  ) VALUES (
    p_entity_type, p_entity_id, 
    COALESCE((SELECT entity_name FROM civic_entity_ratings WHERE entity_type = p_entity_type AND entity_id = p_entity_id LIMIT 1), 'Unknown'),
    v_transparency_score, v_performance_score, v_citizen_rating_score,
    v_engagement_score, v_response_speed_score, v_negative_flags_penalty,
    v_total_score, v_reputation_badge,
    v_total_ratings, v_average_rating,
    v_five_star, v_four_star, v_three_star, v_two_star, v_one_star,
    now()
  ) 
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    transparency_score = EXCLUDED.transparency_score,
    performance_score = EXCLUDED.performance_score,
    citizen_rating_score = EXCLUDED.citizen_rating_score,
    engagement_score = EXCLUDED.engagement_score,
    response_speed_score = EXCLUDED.response_speed_score,
    negative_flags_penalty = EXCLUDED.negative_flags_penalty,
    total_score = EXCLUDED.total_score,
    reputation_badge = EXCLUDED.reputation_badge,
    total_ratings = EXCLUDED.total_ratings,
    average_rating = EXCLUDED.average_rating,
    five_star_count = EXCLUDED.five_star_count,
    four_star_count = EXCLUDED.four_star_count,
    three_star_count = EXCLUDED.three_star_count,
    two_star_count = EXCLUDED.two_star_count,
    one_star_count = EXCLUDED.one_star_count,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = now();
END;
$$;

-- Trigger function to recalculate scores when ratings change
CREATE OR REPLACE FUNCTION update_civic_reputation_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate for the affected entity
  PERFORM calculate_civic_reputation_score(
    COALESCE(NEW.entity_type, OLD.entity_type),
    COALESCE(NEW.entity_id, OLD.entity_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS civic_ratings_score_update_trigger ON civic_entity_ratings;

-- Create trigger for automatic score updates
CREATE TRIGGER civic_ratings_score_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON civic_entity_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_civic_reputation_scores();

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_civic_entity_ratings_updated_at ON civic_entity_ratings;
DROP TRIGGER IF EXISTS update_civic_reputation_scores_updated_at ON civic_reputation_scores;

-- Create updated_at triggers
CREATE TRIGGER update_civic_entity_ratings_updated_at
  BEFORE UPDATE ON civic_entity_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_civic_reputation_scores_updated_at
  BEFORE UPDATE ON civic_reputation_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();