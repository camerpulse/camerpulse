-- STEP 2: Batch fix remaining 194 functions without search_path
-- This addresses the WARN-level function search path issues

-- Create a comprehensive function to fix all remaining functions without search_path
DO $$
DECLARE
    func_record RECORD;
    func_def TEXT;
    fixed_count INTEGER := 0;
    total_count INTEGER := 0;
    
BEGIN
    -- Count total functions that need fixing
    SELECT COUNT(*) INTO total_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plpgsql')
    AND NOT EXISTS (
        SELECT 1 FROM pg_proc_config(p.oid) 
        WHERE split_part(unnest, '=', 1) = 'search_path'
    );
    
    RAISE NOTICE 'Found % functions that need search_path fixes', total_count;
    
    -- Loop through all plpgsql functions in public schema that don't have search_path set
    FOR func_record IN
        SELECT 
            p.oid,
            p.proname as function_name,
            n.nspname as schema_name,
            pg_get_functiondef(p.oid) as function_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plpgsql')
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config(p.oid) 
            WHERE split_part(unnest, '=', 1) = 'search_path'
        )
        ORDER BY p.proname
    LOOP
        total_count := total_count + 1;
        
        -- Extract function definition and add search_path
        func_def := func_record.function_definition;
        
        -- Insert SET search_path = '' after LANGUAGE plpgsql
        -- Handle various cases: LANGUAGE plpgsql, with SECURITY DEFINER, etc.
        IF func_def ~* 'LANGUAGE plpgsql\s*SECURITY DEFINER' THEN
            func_def := regexp_replace(
                func_def,
                'LANGUAGE plpgsql\s*SECURITY DEFINER',
                'LANGUAGE plpgsql' || E'\nSECURITY DEFINER' || E'\nSET search_path = ''''',
                'gi'
            );
        ELSIF func_def ~* 'LANGUAGE plpgsql' THEN
            func_def := regexp_replace(
                func_def,
                'LANGUAGE plpgsql',
                'LANGUAGE plpgsql' || E'\nSET search_path = ''''',
                'gi'
            );
        ELSE
            -- Skip if we can't find the pattern
            RAISE NOTICE 'Skipping function % - could not find LANGUAGE plpgsql pattern', func_record.function_name;
            CONTINUE;
        END IF;
        
        -- Execute the modified function definition
        BEGIN
            EXECUTE func_def;
            fixed_count := fixed_count + 1;
            
            IF fixed_count % 10 = 0 THEN
                RAISE NOTICE 'Fixed % out of % functions...', fixed_count, total_count;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to fix function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Completed batch fix: % functions successfully updated with search_path', fixed_count;
END $$;

-- Verify the fix by checking how many functions still need search_path
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plpgsql')
    AND NOT EXISTS (
        SELECT 1 FROM pg_proc_config(p.oid) 
        WHERE split_part(unnest, '=', 1) = 'search_path'
    );
    
    RAISE NOTICE 'Verification: % functions still need search_path fixes', remaining_count;
END $$;