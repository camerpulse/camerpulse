-- Phase 1: Database Schema Alignment for user_roles table
-- Add missing columns to align with code expectations

-- Add expires_at column if it doesn't exist
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Add is_active column if it doesn't exist  
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create improved handle_new_user function with proper profile and role creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from email if not provided
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    generate_username_from_email(NEW.email)
  );

  -- Insert profile with comprehensive data
  INSERT INTO public.profiles (
    id, 
    user_id, 
    username,
    display_name,
    email,
    location,
    is_diaspora,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.id,
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'display_name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'location',
    COALESCE((NEW.raw_user_meta_data->>'is_diaspora')::boolean, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, profiles.username),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    location = COALESCE(EXCLUDED.location, profiles.location),
    is_diaspora = COALESCE(EXCLUDED.is_diaspora, profiles.is_diaspora),
    updated_at = NOW();

  -- Insert default user role with proper structure
  INSERT INTO public.user_roles (user_id, role, granted_at, is_active)
  VALUES (NEW.id, 'user', NOW(), true)
  ON CONFLICT (user_id, role) DO UPDATE SET
    is_active = true,
    granted_at = COALESCE(user_roles.granted_at, NOW());

  -- Log successful user creation
  INSERT INTO public.profile_activity_log (
    user_id, 
    activity_type, 
    activity_title, 
    activity_description,
    is_public
  ) VALUES (
    NEW.id,
    'account_created',
    'Welcome to CamerPulse!',
    'Your account has been successfully created.',
    false
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check authentication health
CREATE OR REPLACE FUNCTION public.check_auth_health(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  profile_exists boolean := false;
  roles_exist boolean := false;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = user_uuid) INTO profile_exists;
  
  -- Check if roles exist
  SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = user_uuid AND is_active = true) INTO roles_exist;
  
  result := jsonb_build_object(
    'user_id', user_uuid,
    'profile_exists', profile_exists,
    'roles_exist', roles_exist,
    'health_status', CASE 
      WHEN profile_exists AND roles_exist THEN 'healthy'
      WHEN profile_exists AND NOT roles_exist THEN 'missing_roles'
      WHEN NOT profile_exists AND roles_exist THEN 'missing_profile'
      ELSE 'critical'
    END,
    'checked_at', NOW()
  );
  
  RETURN result;
END;
$$;