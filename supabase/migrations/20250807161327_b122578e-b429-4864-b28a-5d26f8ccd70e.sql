-- Create trigger to automatically add traditional leaders when villages are registered
CREATE OR REPLACE FUNCTION create_traditional_leader_from_village()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create leader if traditional_leader_name is provided and not empty
  IF NEW.traditional_leader_name IS NOT NULL AND TRIM(NEW.traditional_leader_name) != '' THEN
    -- Check if leader with same name and village doesn't already exist
    IF NOT EXISTS (
      SELECT 1 FROM traditional_leaders 
      WHERE full_name = NEW.traditional_leader_name 
      AND village_id = NEW.id
    ) THEN
      -- Insert the traditional leader
      INSERT INTO traditional_leaders (
        full_name,
        title,
        village_id,
        region,
        division,
        subdivision,
        slug,
        status,
        is_verified,
        overall_rating,
        total_ratings
      ) VALUES (
        NEW.traditional_leader_name,
        COALESCE(NEW.traditional_leader_title, 'chief'), -- Default to 'chief' if no title specified
        NEW.id,
        NEW.region,
        NEW.division,
        NEW.subdivision,
        generate_leader_slug(NEW.traditional_leader_name, COALESCE(NEW.traditional_leader_title, 'chief'), NEW.village_name),
        'active',
        false, -- Not verified by default
        0.0,
        0
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on villages table
CREATE TRIGGER trigger_create_traditional_leader_from_village
  AFTER INSERT ON villages
  FOR EACH ROW
  EXECUTE FUNCTION create_traditional_leader_from_village();

-- Also create trigger for updates in case leader name is added later
CREATE TRIGGER trigger_update_traditional_leader_from_village
  AFTER UPDATE ON villages
  FOR EACH ROW
  WHEN (OLD.traditional_leader_name IS DISTINCT FROM NEW.traditional_leader_name)
  EXECUTE FUNCTION create_traditional_leader_from_village();