-- Create validation function to reject French text input
CREATE OR REPLACE FUNCTION public.validate_no_french_text(input_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Return false if French characters or common French words are detected
  IF input_text ~ '[àâäéèêëîïôöùûüÿç]|(\ble\b|\bla\b|\bdes\b|\bpour\b|\bdans\b|\bavec\b|\bsur\b|\bpar\b|\bune\b|\bdu\b|\bet\b|\bou\b|\bqui\b|\bque\b|\bquoi\b|\bcomment\b|\bpourquoi\b|\bquand\b|\bbonjour\b|\bsalut\b|\bmerci\b|\bbienvenue\b|\bconnexion\b|\binscription\b|\bmot de passe\b|\bnom d''utilisateur\b|\brecherche\b|\baccueil\b|\bprofil\b|\bparamètres\b|\bdéconnexion\b|\bfrançais\b|\bfrancais\b)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create trigger function for French text validation
CREATE OR REPLACE FUNCTION public.check_no_french_content()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check text fields for French content
  IF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.display_name IS NOT NULL AND NOT validate_no_french_text(NEW.display_name) THEN
      RAISE EXCEPTION 'Only English is allowed on CamerPulse. French text detected in display name.';
    END IF;
    IF NEW.bio IS NOT NULL AND NOT validate_no_french_text(NEW.bio) THEN
      RAISE EXCEPTION 'Only English is allowed on CamerPulse. French text detected in bio.';
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'events' THEN
    IF NEW.title IS NOT NULL AND NOT validate_no_french_text(NEW.title) THEN
      RAISE EXCEPTION 'Only English is allowed on CamerPulse. French text detected in event title.';
    END IF;
    IF NEW.description IS NOT NULL AND NOT validate_no_french_text(NEW.description) THEN
      RAISE EXCEPTION 'Only English is allowed on CamerPulse. French text detected in event description.';
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'messages' THEN
    IF NEW.content IS NOT NULL AND NOT validate_no_french_text(NEW.content) THEN
      RAISE EXCEPTION 'Only English is allowed on CamerPulse. French text detected in message content.';
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'jobs' THEN
    IF NEW.title IS NOT NULL AND NOT validate_no_french_text(NEW.title) THEN
      RAISE EXCEPTION 'Only English is allowed on CamerPulse. French text detected in job title.';
    END IF;
    IF NEW.description IS NOT NULL AND NOT validate_no_french_text(NEW.description) THEN
      RAISE EXCEPTION 'Only English is allowed on CamerPulse. French text detected in job description.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for key content tables
DROP TRIGGER IF EXISTS prevent_french_content_profiles ON profiles;
CREATE TRIGGER prevent_french_content_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_no_french_content();

DROP TRIGGER IF EXISTS prevent_french_content_events ON events;
CREATE TRIGGER prevent_french_content_events
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION check_no_french_content();

DROP TRIGGER IF EXISTS prevent_french_content_messages ON messages;
CREATE TRIGGER prevent_french_content_messages
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_no_french_content();

DROP TRIGGER IF EXISTS prevent_french_content_jobs ON jobs;
CREATE TRIGGER prevent_french_content_jobs
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION check_no_french_content();