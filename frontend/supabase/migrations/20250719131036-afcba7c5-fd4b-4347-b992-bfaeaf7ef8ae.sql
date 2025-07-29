-- SECURITY FIXES Phase 3: More Critical Functions

-- Fix more authentication and data security functions
CREATE OR REPLACE FUNCTION public.execute_integration(p_integration_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  integration_record RECORD;
  result JSONB := '{"status": "initiated", "message": "Integration execution started"}';
BEGIN
  -- Get integration details
  SELECT * INTO integration_record 
  FROM public.custom_integrations 
  WHERE id = p_integration_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Integration not found or inactive: %', p_integration_id;
  END IF;
  
  -- Update execution stats
  UPDATE public.custom_integrations
  SET 
    execution_count = execution_count + 1,
    last_executed_at = now(),
    updated_at = now()
  WHERE id = p_integration_id;
  
  -- Log the execution attempt
  INSERT INTO public.integration_execution_logs (
    integration_id, execution_status, request_data, executed_at
  ) VALUES (
    p_integration_id, 'initiated', 
    jsonb_build_object(
      'endpoint', integration_record.endpoint_url,
      'method', integration_record.request_method,
      'timestamp', now()
    ), 
    now()
  );
  
  result := result || jsonb_build_object(
    'integration_id', p_integration_id,
    'integration_name', integration_record.integration_name,
    'execution_time', now()
  );
  
  RETURN result;
END;
$$;

-- Fix debt predictions function
CREATE OR REPLACE FUNCTION public.generate_debt_predictions(p_years_ahead integer DEFAULT 3)
RETURNS TABLE(predictions_created integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  prediction_count INTEGER := 0;
  year_counter INTEGER;
  latest_record RECORD;
  growth_rate_fcfa NUMERIC;
  growth_rate_usd NUMERIC;
  growth_rate_gdp NUMERIC;
  predicted_fcfa BIGINT;
  predicted_usd BIGINT;
  predicted_gdp_ratio NUMERIC;
BEGIN
  -- Get the latest debt record
  SELECT * INTO latest_record 
  FROM public.debt_records 
  ORDER BY year DESC 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0;
    RETURN;
  END IF;
  
  -- Calculate average growth rates from the last 5 years
  SELECT 
    AVG(
      CASE 
        WHEN LAG(total_debt_fcfa) OVER (ORDER BY year) IS NOT NULL 
        THEN (total_debt_fcfa::NUMERIC - LAG(total_debt_fcfa) OVER (ORDER BY year)) / LAG(total_debt_fcfa) OVER (ORDER BY year)
        ELSE 0 
      END
    ),
    AVG(
      CASE 
        WHEN LAG(total_debt_usd) OVER (ORDER BY year) IS NOT NULL 
        THEN (total_debt_usd::NUMERIC - LAG(total_debt_usd) OVER (ORDER BY year)) / LAG(total_debt_usd) OVER (ORDER BY year)
        ELSE 0 
      END
    ),
    AVG(
      CASE 
        WHEN LAG(debt_to_gdp_ratio) OVER (ORDER BY year) IS NOT NULL 
        THEN (debt_to_gdp_ratio::NUMERIC - LAG(debt_to_gdp_ratio) OVER (ORDER BY year)) / LAG(debt_to_gdp_ratio) OVER (ORDER BY year)
        ELSE 0 
      END
    )
  INTO growth_rate_fcfa, growth_rate_usd, growth_rate_gdp
  FROM public.debt_records 
  WHERE year >= latest_record.year - 5
  ORDER BY year;
  
  -- Generate predictions for future years
  FOR year_counter IN 1..p_years_ahead LOOP
    predicted_fcfa := (latest_record.total_debt_fcfa * POWER(1 + COALESCE(growth_rate_fcfa, 0.05), year_counter))::BIGINT;
    predicted_usd := (latest_record.total_debt_usd * POWER(1 + COALESCE(growth_rate_usd, 0.05), year_counter))::BIGINT;
    predicted_gdp_ratio := (latest_record.debt_to_gdp_ratio * POWER(1 + COALESCE(growth_rate_gdp, 0.03), year_counter))::NUMERIC(5,2);
    
    INSERT INTO public.debt_predictions (
      prediction_date, predicted_total_debt_fcfa, predicted_total_debt_usd, 
      predicted_debt_to_gdp, confidence_level, prediction_model, factors_considered
    ) VALUES (
      MAKE_DATE(latest_record.year + year_counter, 12, 31),
      predicted_fcfa,
      predicted_usd,
      predicted_gdp_ratio,
      GREATEST(0.5, 0.9 - (year_counter * 0.15)), -- Decreasing confidence over time
      'linear_regression',
      jsonb_build_array('historical_growth_rates', 'economic_trends')
    )
    ON CONFLICT (prediction_date) DO UPDATE SET
      predicted_total_debt_fcfa = EXCLUDED.predicted_total_debt_fcfa,
      predicted_total_debt_usd = EXCLUDED.predicted_total_debt_usd,
      predicted_debt_to_gdp = EXCLUDED.predicted_debt_to_gdp,
      confidence_level = EXCLUDED.confidence_level,
      created_at = now();
    
    prediction_count := prediction_count + 1;
  END LOOP;
  
  RETURN QUERY SELECT prediction_count;
END;
$$;

-- Fix plugin risk calculation function  
CREATE OR REPLACE FUNCTION public.calculate_plugin_risk_score(p_plugin_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  risk_score INTEGER := 0;
  conflict_count INTEGER;
  failed_tests INTEGER;
  latest_assessment RECORD;
BEGIN
  -- Get conflict count
  SELECT COUNT(*) INTO conflict_count
  FROM public.plugin_conflicts
  WHERE (plugin_a_id = p_plugin_id OR plugin_b_id = p_plugin_id)
    AND resolved_at IS NULL;
  
  -- Get failed test count
  SELECT COUNT(*) INTO failed_tests
  FROM public.plugin_stress_tests
  WHERE plugin_id = p_plugin_id
    AND test_result IN ('failed', 'error')
    AND executed_at >= NOW() - INTERVAL '7 days';
  
  -- Get latest risk assessment
  SELECT * INTO latest_assessment
  FROM public.plugin_risk_assessments
  WHERE plugin_id = p_plugin_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Calculate base risk from assessment
  IF latest_assessment.overall_risk_score IS NOT NULL THEN
    risk_score := latest_assessment.overall_risk_score;
  ELSE
    risk_score := 50; -- Default medium risk
  END IF;
  
  -- Add conflict penalty
  risk_score := risk_score + (conflict_count * 10);
  
  -- Add failed test penalty
  risk_score := risk_score + (failed_tests * 5);
  
  -- Cap at 100
  IF risk_score > 100 THEN
    risk_score := 100;
  END IF;
  
  -- Update plugin registry
  UPDATE public.plugin_registry
  SET plugin_risk_score = risk_score
  WHERE id = p_plugin_id;
  
  RETURN risk_score;
END;
$$;