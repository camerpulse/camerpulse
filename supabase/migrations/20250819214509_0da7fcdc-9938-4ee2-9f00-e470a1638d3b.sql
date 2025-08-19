-- Create a simpler validation function (fixed)
CREATE OR REPLACE FUNCTION public.validate_english_only(input_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Return true for null or empty strings
  IF input_text IS NULL OR input_text = '' THEN
    RETURN true;
  END IF;
  
  -- Check for French accented characters
  IF input_text ~ '[àâäéèêëîïôöùûüÿç]' THEN
    RETURN false;
  END IF;
  
  -- Check for common French words (case insensitive)
  IF input_text ~* '\y(le|la|les|des|pour|dans|avec|sur|par|une|du|de|et|ou|où|qui|que|quoi|comment|pourquoi|quand|bonjour|salut|merci|bienvenue|connexion|inscription|français|francais)\y' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add documentation
COMMENT ON FUNCTION public.validate_english_only(text) IS 'Validates that text content contains only English language. Returns false if French content is detected. Used to enforce English-only policy on CamerPulse platform.';