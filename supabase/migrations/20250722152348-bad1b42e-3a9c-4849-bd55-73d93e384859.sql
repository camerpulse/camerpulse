-- STEP 2 COMPLETION: Fix remaining functions with proper types and references

-- Fix remaining functions by adding search_path using simple string replacement
DO $$
DECLARE
    func_record RECORD;
    func_def TEXT;
    fixed_count INTEGER := 0;
    
BEGIN
    RAISE NOTICE 'Completing Step 2: Fixing final functions without search_path...';
    
    -- Get the remaining functions that still need search_path
    FOR func_record IN
        SELECT 
            p.proname as function_name,
            pg_get_functiondef(p.oid) as function_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prolang = (SELECT oid FROM pg_language WHERE lanname = 'plpgsql')
        AND pg_get_functiondef(p.oid) NOT ILIKE '%SET search_path%'
        ORDER BY p.proname
    LOOP
        func_def := func_record.function_definition;
        
        -- Simple approach: replace LANGUAGE plpgsql with LANGUAGE plpgsql + SET search_path
        IF func_def ~* 'LANGUAGE plpgsql\s*SECURITY DEFINER' THEN
            func_def := regexp_replace(
                func_def,
                'LANGUAGE plpgsql\s*SECURITY DEFINER',
                E'LANGUAGE plpgsql\nSECURITY DEFINER\nSET search_path = \'\'',
                'gi'
            );
        ELSIF func_def ~* 'LANGUAGE plpgsql' THEN
            func_def := regexp_replace(
                func_def,
                'LANGUAGE plpgsql',
                E'LANGUAGE plpgsql\nSET search_path = \'\'',
                'gi'
            );
        ELSE
            RAISE NOTICE 'Skipping function % - pattern not found', func_record.function_name;
            CONTINUE;
        END IF;
        
        -- Execute the corrected function
        BEGIN
            EXECUTE func_def;
            fixed_count := fixed_count + 1;
            RAISE NOTICE 'Fixed function: %', func_record.function_name;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to fix function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'STEP 2 COMPLETION: Successfully fixed % additional functions', fixed_count;
END $$;