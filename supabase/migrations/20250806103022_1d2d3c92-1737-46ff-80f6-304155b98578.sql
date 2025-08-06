-- =====================================
-- COMPREHENSIVE USER DATA MIGRATION SYSTEM
-- =====================================

-- Step 1: Create migration tracking table
CREATE TABLE IF NOT EXISTS public.user_migration_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    migration_step TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    source_table TEXT,
    target_table TEXT,
    records_processed INTEGER DEFAULT 0,
    records_migrated INTEGER DEFAULT 0,
    duplicates_found INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_details JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Step 2: Enhanced duplicate detection function
CREATE OR REPLACE FUNCTION public.detect_user_duplicates()
RETURNS TABLE(
    primary_profile_id UUID,
    duplicate_profile_ids UUID[],
    match_type TEXT,
    confidence_score NUMERIC,
    merge_strategy JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    migration_id UUID;
BEGIN
    -- Log migration start
    INSERT INTO public.user_migration_log (migration_step, status)
    VALUES ('duplicate_detection', 'running') RETURNING id INTO migration_id;

    RETURN QUERY
    WITH email_matches AS (
        -- Find exact email matches
        SELECT 
            MIN(p.id) as primary_id,
            ARRAY_AGG(p.id ORDER BY p.created_at) as all_ids,
            'email_exact' as match_type,
            1.0 as confidence,
            p.email
        FROM public.profiles p
        WHERE p.email IS NOT NULL 
        AND p.email != ''
        GROUP BY LOWER(TRIM(p.email))
        HAVING COUNT(*) > 1
    ),
    username_matches AS (
        -- Find exact username matches
        SELECT 
            MIN(p.id) as primary_id,
            ARRAY_AGG(p.id ORDER BY p.created_at) as all_ids,
            'username_exact' as match_type,
            0.9 as confidence,
            p.username
        FROM public.profiles p
        WHERE p.username IS NOT NULL 
        AND p.username != ''
        GROUP BY LOWER(TRIM(p.username))
        HAVING COUNT(*) > 1
    ),
    display_name_fuzzy AS (
        -- Find similar display names
        SELECT 
            p1.id as primary_id,
            ARRAY_AGG(p2.id) as all_ids,
            'display_name_fuzzy' as match_type,
            0.7 as confidence
        FROM public.profiles p1
        JOIN public.profiles p2 ON p1.id < p2.id
        WHERE p1.display_name IS NOT NULL 
        AND p2.display_name IS NOT NULL
        AND similarity(LOWER(p1.display_name), LOWER(p2.display_name)) > 0.8
        GROUP BY p1.id
    )
    SELECT 
        em.primary_id,
        em.all_ids[2:] as duplicate_ids,
        em.match_type,
        em.confidence,
        jsonb_build_object(
            'strategy', 'merge_profiles',
            'primary_reason', em.match_type,
            'preserve_data', true,
            'merge_social_links', true,
            'merge_skills', true
        ) as merge_strategy
    FROM email_matches em
    
    UNION ALL
    
    SELECT 
        um.primary_id,
        um.all_ids[2:] as duplicate_ids,
        um.match_type,
        um.confidence,
        jsonb_build_object(
            'strategy', 'merge_profiles',
            'primary_reason', um.match_type,
            'preserve_data', true
        ) as merge_strategy
    FROM username_matches um
    WHERE um.primary_id NOT IN (SELECT primary_id FROM email_matches)
    
    UNION ALL
    
    SELECT 
        df.primary_id,
        df.all_ids,
        df.match_type,
        df.confidence,
        jsonb_build_object(
            'strategy', 'review_required',
            'primary_reason', df.match_type,
            'manual_review', true
        ) as merge_strategy
    FROM display_name_fuzzy df
    WHERE df.primary_id NOT IN (
        SELECT primary_id FROM email_matches 
        UNION 
        SELECT primary_id FROM username_matches
    );

    -- Update migration log
    UPDATE public.user_migration_log 
    SET status = 'completed', completed_at = now()
    WHERE id = migration_id;
END;
$$;

-- Step 3: Enhanced profile merger function
CREATE OR REPLACE FUNCTION public.merge_duplicate_profiles(
    p_primary_profile_id UUID,
    p_duplicate_profile_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    migration_id UUID;
    duplicate_id UUID;
    merge_result JSONB := '{"merged_profiles": [], "errors": [], "data_preserved": {}}';
    primary_profile RECORD;
    duplicate_profile RECORD;
    merged_data JSONB := '{}';
BEGIN
    -- Log migration start
    INSERT INTO public.user_migration_log (
        migration_step, status, target_table, records_processed
    ) VALUES (
        'profile_merge', 'running', 'profiles', array_length(p_duplicate_profile_ids, 1)
    ) RETURNING id INTO migration_id;

    -- Get primary profile
    SELECT * INTO primary_profile FROM public.profiles WHERE id = p_primary_profile_id;
    
    IF NOT FOUND THEN
        merge_result := jsonb_set(merge_result, '{errors}', 
            merge_result->'errors' || '["Primary profile not found"]'::jsonb);
        RETURN merge_result;
    END IF;

    -- Process each duplicate profile
    FOREACH duplicate_id IN ARRAY p_duplicate_profile_ids LOOP
        BEGIN
            SELECT * INTO duplicate_profile FROM public.profiles WHERE id = duplicate_id;
            
            IF FOUND THEN
                -- Merge profile data intelligently
                -- Preserve non-null values from duplicates if primary has null
                merged_data := jsonb_build_object(
                    'display_name', COALESCE(primary_profile.display_name, duplicate_profile.display_name),
                    'bio', CASE 
                        WHEN primary_profile.bio IS NULL OR LENGTH(primary_profile.bio) < LENGTH(COALESCE(duplicate_profile.bio, ''))
                        THEN duplicate_profile.bio 
                        ELSE primary_profile.bio 
                    END,
                    'location', COALESCE(primary_profile.location, duplicate_profile.location),
                    'website_url', COALESCE(primary_profile.website_url, duplicate_profile.website_url),
                    'phone_number', COALESCE(primary_profile.phone_number, duplicate_profile.phone_number),
                    'skills', COALESCE(primary_profile.skills, '{}') || COALESCE(duplicate_profile.skills, '{}'),
                    'interests', COALESCE(primary_profile.interests, '{}') || COALESCE(duplicate_profile.interests, '{}'),
                    'social_links', COALESCE(primary_profile.social_links, '{}') || COALESCE(duplicate_profile.social_links, '{}')
                );

                -- Update primary profile with merged data
                UPDATE public.profiles SET
                    display_name = (merged_data->>'display_name'),
                    bio = (merged_data->>'bio'),
                    location = (merged_data->>'location'),
                    website_url = (merged_data->>'website_url'),
                    phone_number = (merged_data->>'phone_number'),
                    skills = CASE 
                        WHEN jsonb_typeof(merged_data->'skills') = 'array' 
                        THEN (merged_data->'skills')::text[]
                        ELSE COALESCE(skills, '{}')
                    END,
                    interests = CASE 
                        WHEN jsonb_typeof(merged_data->'interests') = 'array' 
                        THEN (merged_data->'interests')::text[]
                        ELSE COALESCE(interests, '{}')
                    END,
                    social_links = COALESCE(social_links, '{}') || COALESCE((merged_data->'social_links'), '{}'),
                    updated_at = now()
                WHERE id = p_primary_profile_id;

                -- Migrate module-specific profiles to point to primary profile
                -- Music profiles
                UPDATE public.music_profiles 
                SET user_id = p_primary_profile_id, profile_id = p_primary_profile_id
                WHERE user_id = duplicate_id;

                -- Job profiles  
                UPDATE public.job_profiles 
                SET user_id = p_primary_profile_id, profile_id = p_primary_profile_id
                WHERE user_id = duplicate_id;

                -- Marketplace profiles
                UPDATE public.marketplace_profiles 
                SET user_id = p_primary_profile_id, profile_id = p_primary_profile_id
                WHERE user_id = duplicate_id;

                -- Healthcare profiles
                UPDATE public.healthcare_profiles 
                SET user_id = p_primary_profile_id, profile_id = p_primary_profile_id
                WHERE user_id = duplicate_id;

                -- Village memberships
                UPDATE public.village_memberships 
                SET user_id = p_primary_profile_id
                WHERE user_id = duplicate_id;

                -- Update any content ownership
                UPDATE public.profile_posts SET user_id = p_primary_profile_id WHERE user_id = duplicate_id;
                UPDATE public.pulse_post_likes SET user_id = p_primary_profile_id WHERE user_id = duplicate_id;

                -- Delete the duplicate profile
                DELETE FROM public.profiles WHERE id = duplicate_id;

                -- Log successful merge
                merge_result := jsonb_set(merge_result, '{merged_profiles}', 
                    merge_result->'merged_profiles' || to_jsonb(duplicate_id));

            END IF;
        EXCEPTION WHEN OTHERS THEN
            merge_result := jsonb_set(merge_result, '{errors}', 
                merge_result->'errors' || to_jsonb(SQLERRM));
        END;
    END LOOP;

    -- Update migration log
    UPDATE public.user_migration_log 
    SET 
        status = 'completed', 
        completed_at = now(),
        records_migrated = jsonb_array_length(merge_result->'merged_profiles'),
        error_details = merge_result->'errors'
    WHERE id = migration_id;

    RETURN merge_result;
END;
$$;

-- Step 4: Username slug generation and cleanup function
CREATE OR REPLACE FUNCTION public.clean_and_generate_usernames()
RETURNS TABLE(
    profile_id UUID,
    old_username TEXT,
    new_username TEXT,
    slug_generated BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    migration_id UUID;
    profile_record RECORD;
    clean_username TEXT;
    base_slug TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    -- Log migration start
    INSERT INTO public.user_migration_log (migration_step, status)
    VALUES ('username_cleanup', 'running') RETURNING id INTO migration_id;

    -- Process each profile that needs username cleanup
    FOR profile_record IN 
        SELECT id, username, display_name, email 
        FROM public.profiles 
        WHERE username IS NULL 
           OR username = '' 
           OR username ~ '[^a-zA-Z0-9._-]'  -- Contains invalid characters
           OR length(username) > 50
    LOOP
        -- Generate base slug from available data
        base_slug := CASE 
            WHEN profile_record.username IS NOT NULL AND profile_record.username != '' 
            THEN public.generate_slug(profile_record.username)
            WHEN profile_record.display_name IS NOT NULL 
            THEN public.generate_slug(profile_record.display_name)
            WHEN profile_record.email IS NOT NULL 
            THEN public.generate_slug(split_part(profile_record.email, '@', 1))
            ELSE 'user'
        END;

        -- Ensure uniqueness
        final_username := base_slug;
        counter := 0;
        
        WHILE EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE username = final_username AND id != profile_record.id
        ) LOOP
            counter := counter + 1;
            final_username := base_slug || '_' || counter;
        END LOOP;

        -- Update the profile
        UPDATE public.profiles 
        SET 
            username = final_username,
            updated_at = now()
        WHERE id = profile_record.id;

        -- Return the result
        profile_id := profile_record.id;
        old_username := profile_record.username;
        new_username := final_username;
        slug_generated := TRUE;
        
        RETURN NEXT;
    END LOOP;

    -- Update migration log
    UPDATE public.user_migration_log 
    SET status = 'completed', completed_at = now()
    WHERE id = migration_id;
END;
$$;

-- Step 5: URL and permalink validation function
CREATE OR REPLACE FUNCTION public.validate_migrated_urls()
RETURNS TABLE(
    table_name TEXT,
    record_id UUID,
    url_field TEXT,
    old_url TEXT,
    new_url TEXT,
    status TEXT,
    validation_notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    migration_id UUID;
BEGIN
    -- Log migration start
    INSERT INTO public.user_migration_log (migration_step, status)
    VALUES ('url_validation', 'running') RETURNING id INTO migration_id;

    -- Validate profile URLs
    RETURN QUERY
    SELECT 
        'profiles'::TEXT as table_name,
        p.id as record_id,
        'profile_url'::TEXT as url_field,
        ('/profile/' || p.username)::TEXT as old_url,
        ('/profile/' || p.username)::TEXT as new_url,
        CASE 
            WHEN p.username IS NOT NULL AND p.username != '' THEN 'valid'
            ELSE 'invalid'
        END as status,
        CASE 
            WHEN p.username IS NULL OR p.username = '' THEN 'Missing username'
            ELSE 'Profile URL validated'
        END as validation_notes
    FROM public.profiles p;

    -- Update migration log
    UPDATE public.user_migration_log 
    SET status = 'completed', completed_at = now()
    WHERE id = migration_id;
END;
$$;

-- Step 6: Comprehensive smoke test function
CREATE OR REPLACE FUNCTION public.run_migration_smoke_tests()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_results JSONB := '{"tests": [], "summary": {"passed": 0, "failed": 0, "warnings": 0}}';
    test_result JSONB;
    total_profiles INTEGER;
    profiles_with_usernames INTEGER;
    duplicate_usernames INTEGER;
    orphaned_modules INTEGER;
BEGIN
    -- Test 1: Profile integrity
    SELECT COUNT(*) INTO total_profiles FROM public.profiles;
    SELECT COUNT(*) INTO profiles_with_usernames FROM public.profiles WHERE username IS NOT NULL AND username != '';
    
    test_result := jsonb_build_object(
        'test_name', 'profile_integrity',
        'status', CASE WHEN profiles_with_usernames = total_profiles THEN 'passed' ELSE 'failed' END,
        'details', jsonb_build_object(
            'total_profiles', total_profiles,
            'profiles_with_usernames', profiles_with_usernames,
            'missing_usernames', total_profiles - profiles_with_usernames
        )
    );
    test_results := jsonb_set(test_results, '{tests}', test_results->'tests' || test_result);

    -- Test 2: Username uniqueness
    SELECT COUNT(*) INTO duplicate_usernames 
    FROM (
        SELECT username, COUNT(*) as cnt 
        FROM public.profiles 
        WHERE username IS NOT NULL 
        GROUP BY username 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    test_result := jsonb_build_object(
        'test_name', 'username_uniqueness',
        'status', CASE WHEN duplicate_usernames = 0 THEN 'passed' ELSE 'failed' END,
        'details', jsonb_build_object('duplicate_usernames', duplicate_usernames)
    );
    test_results := jsonb_set(test_results, '{tests}', test_results->'tests' || test_result);

    -- Test 3: Module profile integrity
    SELECT COUNT(*) INTO orphaned_modules FROM (
        SELECT user_id FROM public.music_profiles WHERE user_id NOT IN (SELECT user_id FROM public.profiles)
        UNION ALL
        SELECT user_id FROM public.job_profiles WHERE user_id NOT IN (SELECT user_id FROM public.profiles)
        UNION ALL
        SELECT user_id FROM public.marketplace_profiles WHERE user_id NOT IN (SELECT user_id FROM public.profiles)
        UNION ALL
        SELECT user_id FROM public.healthcare_profiles WHERE user_id NOT IN (SELECT user_id FROM public.profiles)
    ) orphaned;
    
    test_result := jsonb_build_object(
        'test_name', 'module_profile_integrity',
        'status', CASE WHEN orphaned_modules = 0 THEN 'passed' ELSE 'warning' END,
        'details', jsonb_build_object('orphaned_modules', orphaned_modules)
    );
    test_results := jsonb_set(test_results, '{tests}', test_results->'tests' || test_result);

    -- Update summary
    test_results := jsonb_set(test_results, '{summary,passed}', 
        to_jsonb((SELECT COUNT(*) FROM jsonb_array_elements(test_results->'tests') WHERE value->>'status' = 'passed')));
    test_results := jsonb_set(test_results, '{summary,failed}', 
        to_jsonb((SELECT COUNT(*) FROM jsonb_array_elements(test_results->'tests') WHERE value->>'status' = 'failed')));
    test_results := jsonb_set(test_results, '{summary,warnings}', 
        to_jsonb((SELECT COUNT(*) FROM jsonb_array_elements(test_results->'tests') WHERE value->>'status' = 'warning')));

    RETURN test_results;
END;
$$;

-- Create indexes for better performance during migration
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_migration_log_step ON public.user_migration_log (migration_step);
CREATE INDEX IF NOT EXISTS idx_migration_log_status ON public.user_migration_log (status);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.detect_user_duplicates() TO authenticated;
GRANT EXECUTE ON FUNCTION public.merge_duplicate_profiles(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clean_and_generate_usernames() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_migrated_urls() TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_migration_smoke_tests() TO authenticated;