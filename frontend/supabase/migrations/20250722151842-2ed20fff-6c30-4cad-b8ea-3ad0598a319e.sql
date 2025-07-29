-- STEP 2: Alternative approach to batch fix functions without search_path
-- Using pg_get_functiondef to check for search_path in function definitions

DO $$
DECLARE
    func_record RECORD;
    func_def TEXT;
    fixed_count INTEGER := 0;
    total_count INTEGER := 0;
    
BEGIN
    RAISE NOTICE 'Starting batch fix for functions without search_path...';
    
    -- Loop through all plpgsql functions in public schema
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
        ORDER BY p.proname
    LOOP
        total_count := total_count + 1;
        func_def := func_record.function_definition;
        
        -- Check if function already has search_path set
        IF func_def ~* 'SET search_path' THEN
            -- Function already has search_path, skip it
            CONTINUE;
        END IF;
        
        -- Insert SET search_path = '' after LANGUAGE plpgsql
        -- Handle various cases: LANGUAGE plpgsql, with SECURITY DEFINER, etc.
        IF func_def ~* 'LANGUAGE plpgsql\s*SECURITY DEFINER' THEN
            func_def := regexp_replace(
                func_def,
                'LANGUAGE plpgsql\s*SECURITY DEFINER',
                'LANGUAGE plpgsql' || E'\nSECURITY DEFINER' || E'\nSET search_path = ''''',
                'gi'
            );
        ELSIF func_def ~* 'LANGUAGE plpgsql\s*STABLE' THEN
            func_def := regexp_replace(
                func_def,
                'LANGUAGE plpgsql\s*STABLE',
                'LANGUAGE plpgsql' || E'\nSET search_path = ''''|| E'\nSTABLE',
                'gi'
            );
        ELSIF func_def ~* 'LANGUAGE plpgsql\s*IMMUTABLE' THEN
            func_def := regexp_replace(
                func_def,
                'LANGUAGE plpgsql\s*IMMUTABLE',
                'LANGUAGE plpgsql' || E'\nSET search_path = ''''|| E'\nIMMUTABLE',
                'gi'
            );
        ELSIF func_def ~* 'LANGUAGE plpgsql\s*VOLATILE' THEN
            func_def := regexp_replace(
                func_def,
                'LANGUAGE plpgsql\s*VOLATILE',
                'LANGUAGE plpgsql' || E'\nSET search_path = ''''|| E'\nVOLATILE',
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
            
            IF fixed_count % 20 = 0 THEN
                RAISE NOTICE 'Fixed % functions so far...', fixed_count;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to fix function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'STEP 2 COMPLETED: % out of % functions successfully updated with search_path', fixed_count, total_count;
END $$;