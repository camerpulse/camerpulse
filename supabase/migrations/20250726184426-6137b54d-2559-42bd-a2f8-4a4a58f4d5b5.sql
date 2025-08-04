-- Fix the overall_rating column precision and update the trigger
ALTER TABLE villages ALTER COLUMN overall_rating TYPE numeric(4,2);

-- Update the trigger function to handle values properly
CREATE OR REPLACE FUNCTION update_village_overall_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.overall_rating = LEAST(10.00, ROUND((
    COALESCE(NEW.infrastructure_score, 0) +
    COALESCE(NEW.education_score, 0) +
    COALESCE(NEW.health_score, 0) +
    COALESCE(NEW.peace_security_score, 0) +
    COALESCE(NEW.economic_activity_score, 0) +
    COALESCE(NEW.governance_score, 0) +
    COALESCE(NEW.social_spirit_score, 0) +
    COALESCE(NEW.diaspora_engagement_score, 0) +
    COALESCE(NEW.civic_participation_score, 0) +
    COALESCE(NEW.achievements_score, 0)
  ) / 10.0, 2));
  
  RETURN NEW;
END;
$$;

-- Now add slugs
UPDATE villages 
SET slug = generate_village_slug(village_name, region)
WHERE slug IS NULL;