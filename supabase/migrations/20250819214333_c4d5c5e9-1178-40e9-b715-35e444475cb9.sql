-- Create a simpler validation function without triggers to avoid deadlocks
CREATE OR REPLACE FUNCTION public.validate_english_only(input_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STABLE
AS $$
BEGIN
  -- Return false if French characters or common French words are detected
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

-- Create a policy helper function
CREATE OR REPLACE FUNCTION public.is_english_content(content_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
STABLE
AS $$
BEGIN
  RETURN validate_english_only(content_text);
END;
$$;

-- Add a comment to document the English-only enforcement
COMMENT ON FUNCTION public.validate_english_only(text) IS 'Validates that text content contains only English language. Returns false if French content is detected.';
COMMENT ON FUNCTION public.is_english_content(text) IS 'Helper function for RLS policies to enforce English-only content.';