-- SECURITY FIXES Phase 3: Fix ALL remaining functions with search_path issues
-- This fixes ALL functions that are missing SET search_path = ''

-- Fix all remaining functions systematically - Part 1: Core functions
CREATE OR REPLACE FUNCTION public.detect_official_changes()
RETURNS TABLE(change_detected boolean, changes_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  changes_detected INTEGER := 0;
BEGIN
  -- This function would be called by the edge function
  -- For now, it returns a placeholder
  RETURN QUERY SELECT true, 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_election_forecast()
RETURNS TABLE(forecasts_created integer, regions_processed integer, parties_processed integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    forecast_count INTEGER := 0;
    region_count INTEGER := 0;
    party_count INTEGER := 0;
    region_record RECORD;
    party_record RECORD;
    demo_record RECORD;
    vote_percentage NUMERIC;
    base_percentage NUMERIC;
    trend_modifier NUMERIC;
    confidence_lower NUMERIC;
    confidence_upper NUMERIC;
    total_votes INTEGER;
BEGIN
    -- Clear existing forecasts for today
    DELETE FROM public.election_forecasts WHERE forecast_date = CURRENT_DATE;
    
    -- Define regions (Cameroon regions)
    FOR region_record IN 
        SELECT DISTINCT region FROM (
            VALUES 
                ('Adamawa'), ('Centre'), ('East'), ('Far North'), 
                ('Littoral'), ('North'), ('Northwest'), ('South'), 
                ('Southwest'), ('West')
        ) AS regions(region)
    LOOP
        region_count := region_count + 1;
        
        -- Get major political parties from polls
        FOR party_record IN
            SELECT DISTINCT 
                CASE 
                    WHEN option_text ILIKE '%CPDM%' OR option_text ILIKE '%Paul Biya%' THEN 'CPDM'
                    WHEN option_text ILIKE '%SDF%' OR option_text ILIKE '%Social Democratic%' THEN 'SDF'
                    WHEN option_text ILIKE '%UNDP%' OR option_text ILIKE '%Union Nationale%' THEN 'UNDP'
                    WHEN option_text ILIKE '%UPC%' OR option_text ILIKE '%Union des Populations%' THEN 'UPC'
                    WHEN option_text ILIKE '%MDR%' OR option_text ILIKE '%Mouvement Démocratique%' THEN 'MDR'
                    ELSE 'Other'
                END as party_name
            FROM public.poll_options po
            JOIN public.polls p ON po.poll_id = p.id
            WHERE p.poll_type = 'political'
            AND po.option_text IS NOT NULL
        LOOP
            IF party_record.party_name != 'Other' THEN
                party_count := party_count + 1;
                
                -- Calculate base percentage from recent polls
                SELECT COALESCE(AVG(
                    CASE 
                        WHEN pv.region = region_record.region THEN 
                            (po.vote_count::NUMERIC / NULLIF(p.total_votes, 0)) * 100
                        ELSE NULL
                    END
                ), 0) INTO base_percentage
                FROM public.poll_votes pv
                JOIN public.poll_options po ON pv.option_index = po.option_index AND pv.poll_id = po.poll_id
                JOIN public.polls p ON po.poll_id = p.id
                WHERE p.poll_type = 'political'
                AND p.created_at > NOW() - INTERVAL '6 months'
                AND po.option_text ILIKE '%' || party_record.party_name || '%';
                
                -- Add regional and historical trends
                trend_modifier := 
                    CASE region_record.region
                        WHEN 'Centre' THEN 1.2  -- Government stronghold
                        WHEN 'South' THEN 1.15
                        WHEN 'East' THEN 1.1
                        WHEN 'Northwest' THEN 0.7  -- Opposition regions
                        WHEN 'Southwest' THEN 0.7
                        WHEN 'Littoral' THEN 0.9   -- Mixed
                        WHEN 'West' THEN 0.85
                        ELSE 1.0
                    END;
                
                -- Apply party-specific modifiers
                IF party_record.party_name = 'CPDM' THEN
                    vote_percentage := GREATEST(15, LEAST(85, base_percentage * trend_modifier + 25));
                ELSIF party_record.party_name = 'SDF' THEN
                    vote_percentage := GREATEST(5, LEAST(45, base_percentage * (2.0 - trend_modifier) + 15));
                ELSE
                    vote_percentage := GREATEST(2, LEAST(25, base_percentage + 5));
                END IF;
                
                -- Calculate confidence intervals
                confidence_lower := GREATEST(0, vote_percentage - 8);
                confidence_upper := LEAST(100, vote_percentage + 8);
                
                -- Insert overall regional forecast
                INSERT INTO public.election_forecasts (
                    region, party_name, demographic_group,
                    predicted_vote_percentage, confidence_interval_lower, confidence_interval_upper,
                    sample_size, methodology
                ) VALUES (
                    region_record.region, party_record.party_name, 'All Demographics',
                    vote_percentage, confidence_lower, confidence_upper,
                    500 + FLOOR(RANDOM() * 1000), 'poll_aggregation_with_trends'
                );
                
                forecast_count := forecast_count + 1;
                
                -- Add demographic breakdowns
                FOR demo_record IN
                    SELECT demographic FROM (
                        VALUES ('Youth (18-35)'), ('Adults (36-55)'), ('Seniors (55+)'),
                               ('Urban'), ('Rural'), ('Educated'), ('Working Class')
                    ) AS demos(demographic)
                LOOP
                    -- Adjust percentages by demographic
                    vote_percentage := vote_percentage * (0.8 + RANDOM() * 0.4);
                    
                    INSERT INTO public.election_forecasts (
                        region, party_name, demographic_group,
                        predicted_vote_percentage, confidence_interval_lower, confidence_interval_upper,
                        sample_size, methodology
                    ) VALUES (
                        region_record.region, party_record.party_name, demo_record.demographic,
                        vote_percentage, 
                        GREATEST(0, vote_percentage - 10),
                        LEAST(100, vote_percentage + 10),
                        100 + FLOOR(RANDOM() * 300), 'demographic_modeling'
                    );
                    
                    forecast_count := forecast_count + 1;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN QUERY SELECT forecast_count, region_count, party_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_polls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete polls that have requested auto-deletion and time has passed
  DELETE FROM public.polls 
  WHERE auto_delete_at IS NOT NULL 
    AND auto_delete_at <= now();
END;
$$;