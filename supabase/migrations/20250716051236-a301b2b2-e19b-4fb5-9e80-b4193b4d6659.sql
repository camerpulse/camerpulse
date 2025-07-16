-- Create function to trigger debt data comparison
CREATE OR REPLACE FUNCTION public.compare_debt_data_changes(p_source_id UUID, p_current_result_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  previous_result RECORD;
  current_result RECORD;
  changes_detected JSONB := '{}';
  is_significant BOOLEAN := false;
  violations TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get current result
  SELECT * INTO current_result 
  FROM public.debt_scraping_results 
  WHERE id = p_current_result_id;
  
  -- Get most recent previous result for same source
  SELECT * INTO previous_result 
  FROM public.debt_scraping_results 
  WHERE source_id = p_source_id 
  AND id != p_current_result_id 
  AND status = 'success'
  ORDER BY scraping_date DESC 
  LIMIT 1;
  
  IF previous_result IS NOT NULL AND current_result IS NOT NULL THEN
    -- Compare total debt
    IF current_result.total_debt_detected IS NOT NULL AND previous_result.total_debt_detected IS NOT NULL THEN
      IF ABS(current_result.total_debt_detected - previous_result.total_debt_detected) > (previous_result.total_debt_detected * 0.05) THEN
        is_significant := true;
        changes_detected := changes_detected || jsonb_build_object(
          'debt_change', jsonb_build_object(
            'previous', previous_result.total_debt_detected,
            'current', current_result.total_debt_detected,
            'percentage_change', ((current_result.total_debt_detected - previous_result.total_debt_detected) / previous_result.total_debt_detected) * 100
          )
        );
      END IF;
    END IF;
    
    -- Check for new creditors
    IF current_result.creditors_found IS NOT NULL AND previous_result.creditors_found IS NOT NULL THEN
      IF NOT current_result.creditors_found <@ previous_result.creditors_found THEN
        is_significant := true;
        changes_detected := changes_detected || jsonb_build_object(
          'new_creditors', array(SELECT unnest(current_result.creditors_found) EXCEPT SELECT unnest(previous_result.creditors_found))
        );
      END IF;
    END IF;
    
    -- Insert comparison record
    INSERT INTO public.debt_data_comparisons (
      source_id, previous_record_id, current_record_id, 
      changes_summary, significant_changes, threshold_violations
    ) VALUES (
      p_source_id, previous_result.id, current_result.id,
      changes_detected, is_significant, violations
    );
    
    -- Update current result with change detection
    UPDATE public.debt_scraping_results 
    SET 
      changes_detected = is_significant,
      comparison_with_previous = changes_detected
    WHERE id = p_current_result_id;
  END IF;
  
  RETURN changes_detected;
END;
$$;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_debt_scraping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_debt_sources_updated_at
  BEFORE UPDATE ON public.debt_data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_debt_scraping_updated_at();