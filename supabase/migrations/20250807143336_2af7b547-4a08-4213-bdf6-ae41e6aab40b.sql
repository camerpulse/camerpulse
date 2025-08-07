-- Create trigger to automatically create traditional leaders when villages are registered
CREATE OR REPLACE FUNCTION public.create_village_leader()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create if village has leadership information
  IF NEW.village_chief_name IS NOT NULL OR NEW.fon_name IS NOT NULL THEN
    INSERT INTO traditional_leaders (
      full_name,
      title,
      village_id,
      region,
      division,
      subdivision,
      created_by,
      created_at
    ) VALUES (
      COALESCE(NEW.fon_name, NEW.village_chief_name, 'Unknown'),
      CASE 
        WHEN NEW.fon_name IS NOT NULL THEN 'fon'::traditional_title
        ELSE 'chief'::traditional_title
      END,
      NEW.id,
      NEW.region,
      NEW.division,
      NEW.subdivision,
      NEW.created_by,
      NEW.created_at
    ) ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for villages table
CREATE TRIGGER create_village_leader_trigger
  AFTER INSERT ON public.villages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_village_leader();