-- Function to generate a URL-safe slug from text
CREATE OR REPLACE FUNCTION public.generate_profile_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create base slug from input text
  base_slug := lower(trim(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure minimum length
  IF length(base_slug) < 3 THEN
    base_slug := base_slug || 'user';
  END IF;
  
  -- Ensure maximum length
  IF length(base_slug) > 30 THEN
    base_slug := left(base_slug, 30);
  END IF;
  
  -- Remove trailing dash if any
  base_slug := rtrim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness and increment if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE profile_slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter::TEXT;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Function to validate slug format
CREATE OR REPLACE FUNCTION public.validate_profile_slug(slug_input text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if slug is null or empty
  IF slug_input IS NULL OR trim(slug_input) = '' THEN
    RETURN false;
  END IF;
  
  -- Check length constraints
  IF length(slug_input) < 3 OR length(slug_input) > 30 THEN
    RETURN false;
  END IF;
  
  -- Check if slug contains only valid characters (alphanumeric and hyphens)
  IF slug_input !~ '^[a-z0-9-]+$' THEN
    RETURN false;
  END IF;
  
  -- Check if slug doesn't start or end with hyphen
  IF slug_input LIKE '-%' OR slug_input LIKE '%-' THEN
    RETURN false;
  END IF;
  
  -- Check if slug doesn't have consecutive hyphens
  IF slug_input LIKE '%---%' THEN
    RETURN false;
  END IF;
  
  -- Check if slug is not a reserved word
  IF slug_input IN ('admin', 'api', 'www', 'app', 'support', 'help', 'about', 'terms', 'privacy', 'settings', 'profile', 'user', 'login', 'signup', 'auth', 'dashboard') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to update profile slug with validation
CREATE OR REPLACE FUNCTION public.update_profile_slug(p_user_id uuid, p_new_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_profile RECORD;
  slug_exists BOOLEAN;
  result JSONB;
BEGIN
  -- Get current profile
  SELECT * INTO current_profile FROM public.profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  -- Validate slug format
  IF NOT public.validate_profile_slug(p_new_slug) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid slug format. Use 3-30 characters, lowercase letters, numbers, and hyphens only.');
  END IF;
  
  -- Check if slug already exists (excluding current user)
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE profile_slug = p_new_slug AND user_id != p_user_id
  ) INTO slug_exists;
  
  IF slug_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'This slug is already taken');
  END IF;
  
  -- Update the profile slug
  UPDATE public.profiles 
  SET profile_slug = p_new_slug, updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'slug', p_new_slug);
END;
$$;

-- Auto-generate profile slug trigger for new profiles
CREATE OR REPLACE FUNCTION public.auto_generate_profile_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only generate if profile_slug is null
  IF NEW.profile_slug IS NULL THEN
    NEW.profile_slug := public.generate_profile_slug(COALESCE(NEW.username, NEW.display_name, 'user'));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating slugs
DROP TRIGGER IF EXISTS trigger_auto_generate_profile_slug ON public.profiles;
CREATE TRIGGER trigger_auto_generate_profile_slug
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_profile_slug();