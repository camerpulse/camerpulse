-- SECURITY FIXES Phase 6: Final comprehensive fix for ALL remaining functions
-- This addresses the ~200 remaining functions that need search_path security

-- Apply SET search_path = '' to ALL remaining functions by updating them
DO $$
DECLARE
    func_record RECORD;
    func_definition TEXT;
BEGIN
    -- Get all functions that don't have search_path set and fix them
    FOR func_record IN 
        SELECT 
            schemaname,
            funcname,
            funcid
        FROM pg_functions 
        WHERE schemaname = 'public'
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc p
            WHERE p.oid = funcid
            AND (p.proconfig IS NOT NULL AND 'search_path=' = ANY(p.proconfig))
        )
    LOOP
        -- Get the function definition
        SELECT pg_get_functiondef(func_record.funcid) INTO func_definition;
        
        -- Only process if it doesn't already have search_path and is not an extension function
        IF func_definition IS NOT NULL 
           AND func_definition NOT LIKE '%SET search_path%'
           AND func_definition LIKE '%LANGUAGE%plpgsql%' THEN
            
            -- Add SET search_path = '' to the function
            -- This is a safe bulk operation for all remaining functions
            func_definition := REPLACE(
                func_definition,
                'LANGUAGE plpgsql',
                'LANGUAGE plpgsql' || chr(10) || 'SET search_path = '''''
            );
            
            -- Execute the updated function definition
            EXECUTE func_definition;
        END IF;
    END LOOP;
END $$;

-- Manually fix any critical functions that might have been missed
CREATE OR REPLACE FUNCTION public.generate_track_id()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ID in format: CP-YYYY-XXXXXXXX (CamerPlay)
    new_id := 'CP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.music_tracks WHERE track_id = new_id) INTO id_exists;
    
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_play_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Update track play count
  UPDATE public.music_tracks 
  SET play_count = play_count + 1
  WHERE id = NEW.track_id;
  
  -- Update release total plays
  UPDATE public.music_releases 
  SET total_plays = total_plays + 1
  WHERE id = (SELECT release_id FROM public.music_tracks WHERE id = NEW.track_id);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_download_counts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.purchase_type = 'download' THEN
    -- Update track download count
    UPDATE public.music_tracks 
    SET download_count = download_count + 1
    WHERE id = NEW.track_id;
    
    -- Update release total downloads
    UPDATE public.music_releases 
    SET total_downloads = total_downloads + 1
    WHERE id = (SELECT release_id FROM public.music_tracks WHERE id = NEW.track_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix verification functions
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  code TEXT;
  exists_flag BOOLEAN;
BEGIN
  LOOP
    code := 'CERT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.event_certificates WHERE verification_code = code) INTO exists_flag;
    IF NOT exists_flag THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_certificate_verification_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.verification_code IS NULL THEN
    NEW.verification_code := public.generate_verification_code();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;