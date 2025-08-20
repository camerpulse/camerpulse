-- Add SET search_path to SECURITY DEFINER functions (batch 2)
-- refresh_poll_statistics
CREATE OR REPLACE FUNCTION public.refresh_poll_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY poll_statistics;
END;
$function$;

-- clean_and_generate_usernames
CREATE OR REPLACE FUNCTION public.clean_and_generate_usernames()
RETURNS TABLE(profile_id uuid, old_username text, new_username text, slug_generated boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    migration_id UUID;
    profile_record RECORD;
    clean_username TEXT;
    base_slug TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    INSERT INTO public.user_migration_log (migration_step, status)
    VALUES ('username_cleanup', 'running') RETURNING id INTO migration_id;

    FOR profile_record IN 
        SELECT id, username, display_name, email 
        FROM public.profiles 
        WHERE username IS NULL 
           OR username = '' 
           OR username ~ '[^a-zA-Z0-9._-]'
           OR length(username) > 50
    LOOP
        base_slug := CASE 
            WHEN profile_record.username IS NOT NULL AND profile_record.username != '' 
            THEN public.generate_slug(profile_record.username)
            WHEN profile_record.display_name IS NOT NULL 
            THEN public.generate_slug(profile_record.display_name)
            WHEN profile_record.email IS NOT NULL 
            THEN public.generate_slug(split_part(profile_record.email, '@', 1))
            ELSE 'user'
        END;

        final_username := base_slug;
        counter := 0;
        
        WHILE EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE username = final_username AND id != profile_record.id
        ) LOOP
            counter := counter + 1;
            final_username := base_slug || '_' || counter;
        END LOOP;

        UPDATE public.profiles 
        SET 
            username = final_username,
            updated_at = now()
        WHERE id = profile_record.id;

        profile_id := profile_record.id;
        old_username := profile_record.username;
        new_username := final_username;
        slug_generated := TRUE;
        
        RETURN NEXT;
    END LOOP;

    UPDATE public.user_migration_log 
    SET status = 'completed', completed_at = now()
    WHERE id = migration_id;
END;
$function$;