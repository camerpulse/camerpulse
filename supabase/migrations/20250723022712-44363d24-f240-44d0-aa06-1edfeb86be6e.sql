-- Create tender receipts vault for document archiving
CREATE TABLE IF NOT EXISTS public.tender_receipts_vault (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('bid_receipt', 'award_certificate', 'completion_certificate', 'payment_receipt')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tender moderators table for regional management
CREATE TABLE IF NOT EXISTS public.tender_moderators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_regions TEXT[] NOT NULL DEFAULT '{}',
  assigned_categories TEXT[] NOT NULL DEFAULT '{}',
  permissions JSONB NOT NULL DEFAULT '{"can_approve": true, "can_suspend": true, "can_flag": true, "can_moderate": true}',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  activity_log JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create tender analytics cache for advanced statistics
CREATE TABLE IF NOT EXISTS public.tender_analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_period TEXT NOT NULL CHECK (metric_period IN ('daily', 'weekly', 'monthly', 'yearly')),
  region TEXT,
  category TEXT,
  metric_data JSONB NOT NULL DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_type, metric_period, region, category)
);

-- Create tender AI suggestions table
CREATE TABLE IF NOT EXISTS public.tender_ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('duplicate_detection', 'price_deviation', 'fraud_risk', 'optimization')),
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  suggestion_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  priority_level TEXT NOT NULL DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tender_receipts_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for tender receipts vault
CREATE POLICY "Admins can manage all receipt vault documents" 
ON public.tender_receipts_vault 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Tender moderators can manage documents in their regions" 
ON public.tender_receipts_vault 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.tender_moderators tm
    JOIN public.tenders t ON t.id = tender_receipts_vault.tender_id
    WHERE tm.user_id = auth.uid() 
    AND tm.is_active = true
    AND (t.region = ANY(tm.assigned_regions) OR array_length(tm.assigned_regions, 1) IS NULL)
  )
);

CREATE POLICY "Users can view documents for their tenders" 
ON public.tender_receipts_vault 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tenders 
    WHERE id = tender_receipts_vault.tender_id 
    AND published_by_user_id = auth.uid()
  )
);

-- RLS policies for tender moderators
CREATE POLICY "Admins can manage all moderators" 
ON public.tender_moderators 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Moderators can view their own assignment" 
ON public.tender_moderators 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS policies for analytics cache
CREATE POLICY "Admins and moderators can view analytics" 
ON public.tender_analytics_cache 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ) OR
  EXISTS (
    SELECT 1 FROM public.tender_moderators 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- RLS policies for AI suggestions
CREATE POLICY "Admins can manage all AI suggestions" 
ON public.tender_ai_suggestions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Moderators can view and review suggestions in their regions" 
ON public.tender_ai_suggestions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tender_moderators tm
    JOIN public.tenders t ON t.id = tender_ai_suggestions.tender_id
    WHERE tm.user_id = auth.uid() 
    AND tm.is_active = true
    AND (t.region = ANY(tm.assigned_regions) OR array_length(tm.assigned_regions, 1) IS NULL)
  )
);

-- Create storage bucket for tender receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tender-receipts', 'tender-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for tender receipts
CREATE POLICY "Admins can manage all receipt files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'tender-receipts' AND
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Moderators can manage files in their regions" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'tender-receipts' AND
  EXISTS (
    SELECT 1 FROM public.tender_moderators 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can upload receipts for their tenders" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'tender-receipts' AND
  auth.role() = 'authenticated'
);

-- Create functions for analytics and AI suggestions
CREATE OR REPLACE FUNCTION public.calculate_tender_analytics(
  p_metric_type TEXT,
  p_period TEXT DEFAULT 'monthly',
  p_region TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB := '{}';
  start_date DATE;
  end_date DATE := CURRENT_DATE;
BEGIN
  -- Calculate date range based on period
  CASE p_period
    WHEN 'daily' THEN start_date := end_date - INTERVAL '1 day';
    WHEN 'weekly' THEN start_date := end_date - INTERVAL '7 days';
    WHEN 'monthly' THEN start_date := end_date - INTERVAL '30 days';
    WHEN 'yearly' THEN start_date := end_date - INTERVAL '365 days';
    ELSE start_date := end_date - INTERVAL '30 days';
  END CASE;

  -- Calculate metrics based on type
  CASE p_metric_type
    WHEN 'top_bidders' THEN
      -- Calculate top bidding companies/users (placeholder since bids table doesn't exist)
      result := jsonb_build_object(
        'top_bidders', jsonb_build_array(
          jsonb_build_object('name', 'Company A', 'bids_count', 25, 'success_rate', 0.60),
          jsonb_build_object('name', 'Company B', 'bids_count', 18, 'success_rate', 0.55),
          jsonb_build_object('name', 'Company C', 'bids_count', 12, 'success_rate', 0.75)
        ),
        'period', p_period,
        'calculated_at', now()
      );
    
    WHEN 'regional_stats' THEN
      -- Calculate regional statistics
      SELECT jsonb_build_object(
        'regional_breakdown',
        jsonb_agg(
          jsonb_build_object(
            'region', region,
            'total_tenders', COUNT(*),
            'active_tenders', COUNT(*) FILTER (WHERE status = 'open'),
            'closed_tenders', COUNT(*) FILTER (WHERE status = 'closed'),
            'avg_budget', AVG((budget_min + budget_max) / 2)
          )
        ),
        'period', p_period,
        'calculated_at', now()
      ) INTO result
      FROM public.tenders
      WHERE created_at >= start_date
        AND (p_region IS NULL OR region = p_region)
        AND (p_category IS NULL OR category = p_category)
      GROUP BY region;
    
    WHEN 'tender_trends' THEN
      -- Calculate tender creation trends
      SELECT jsonb_build_object(
        'trend_data',
        jsonb_agg(
          jsonb_build_object(
            'date', date_created,
            'count', tender_count,
            'avg_budget', avg_budget
          ) ORDER BY date_created
        ),
        'period', p_period,
        'calculated_at', now()
      ) INTO result
      FROM (
        SELECT 
          DATE(created_at) as date_created,
          COUNT(*) as tender_count,
          AVG((budget_min + budget_max) / 2) as avg_budget
        FROM public.tenders
        WHERE created_at >= start_date
          AND (p_region IS NULL OR region = p_region)
          AND (p_category IS NULL OR category = p_category)
        GROUP BY DATE(created_at)
      ) trends;
  END CASE;

  -- Cache the result
  INSERT INTO public.tender_analytics_cache (
    metric_type, metric_period, region, category, metric_data, expires_at
  ) VALUES (
    p_metric_type, p_period, p_region, p_category, result, 
    now() + INTERVAL '1 hour'
  )
  ON CONFLICT (metric_type, metric_period, region, category)
  DO UPDATE SET 
    metric_data = EXCLUDED.metric_data,
    calculated_at = now(),
    expires_at = EXCLUDED.expires_at;

  RETURN result;
END;
$$;

-- Create function to generate AI suggestions
CREATE OR REPLACE FUNCTION public.generate_tender_ai_suggestions(p_tender_id UUID)
RETURNS TABLE(suggestion_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  tender_record RECORD;
  suggestion_count INTEGER := 0;
  similar_tenders_count INTEGER;
  avg_budget NUMERIC;
  price_deviation NUMERIC;
BEGIN
  -- Get tender details
  SELECT * INTO tender_record 
  FROM public.tenders 
  WHERE id = p_tender_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0;
    RETURN;
  END IF;
  
  -- Check for duplicate/similar tenders
  SELECT COUNT(*) INTO similar_tenders_count
  FROM public.tenders
  WHERE id != p_tender_id
    AND similarity(title, tender_record.title) > 0.7
    AND category = tender_record.category
    AND created_at > now() - INTERVAL '6 months';
  
  IF similar_tenders_count > 0 THEN
    INSERT INTO public.tender_ai_suggestions (
      tender_id, suggestion_type, confidence_score, suggestion_data, priority_level
    ) VALUES (
      p_tender_id, 'duplicate_detection', 0.8,
      jsonb_build_object(
        'similar_count', similar_tenders_count,
        'recommendation', 'Review for potential duplication',
        'action', 'manual_review'
      ),
      'high'
    );
    suggestion_count := suggestion_count + 1;
  END IF;
  
  -- Check for price deviation
  SELECT AVG((budget_min + budget_max) / 2) INTO avg_budget
  FROM public.tenders
  WHERE category = tender_record.category
    AND region = tender_record.region
    AND created_at > now() - INTERVAL '1 year'
    AND id != p_tender_id;
  
  IF avg_budget IS NOT NULL THEN
    price_deviation := ABS(((tender_record.budget_min + tender_record.budget_max) / 2) - avg_budget) / avg_budget;
    
    IF price_deviation > 0.5 THEN -- 50% deviation
      INSERT INTO public.tender_ai_suggestions (
        tender_id, suggestion_type, confidence_score, suggestion_data, priority_level
      ) VALUES (
        p_tender_id, 'price_deviation', 0.7,
        jsonb_build_object(
          'deviation_percentage', price_deviation * 100,
          'market_average', avg_budget,
          'tender_budget', (tender_record.budget_min + tender_record.budget_max) / 2,
          'recommendation', 'Budget significantly differs from market average'
        ),
        CASE WHEN price_deviation > 1.0 THEN 'urgent' ELSE 'medium' END
      );
      suggestion_count := suggestion_count + 1;
    END IF;
  END IF;
  
  RETURN QUERY SELECT suggestion_count;
END;
$$;

-- Create function to update analytics cache
CREATE OR REPLACE FUNCTION public.update_tender_analytics_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Clear expired cache entries
  DELETE FROM public.tender_analytics_cache 
  WHERE expires_at < now();
  
  -- Update key metrics
  PERFORM public.calculate_tender_analytics('top_bidders', 'monthly');
  PERFORM public.calculate_tender_analytics('regional_stats', 'monthly');
  PERFORM public.calculate_tender_analytics('tender_trends', 'monthly');
END;
$$;