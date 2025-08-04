-- Expand National Debt Tracker with Intelligence and Monitoring Features

-- Add new columns to debt_records for enhanced tracking
ALTER TABLE public.debt_records 
ADD COLUMN IF NOT EXISTS debt_to_gdp_ratio NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS gdp_value_fcfa BIGINT,
ADD COLUMN IF NOT EXISTS population_count BIGINT,
ADD COLUMN IF NOT EXISTS monthly_change_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS ai_analysis_summary TEXT,
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'normal' CHECK (risk_level IN ('low', 'normal', 'warning', 'critical')),
ADD COLUMN IF NOT EXISTS milestone_events JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS prediction_data JSONB DEFAULT '{}';

-- Create debt thresholds and monitoring table
CREATE TABLE IF NOT EXISTS public.debt_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  threshold_name TEXT NOT NULL,
  threshold_type TEXT NOT NULL CHECK (threshold_type IN ('debt_to_gdp', 'monthly_increase', 'total_debt_fcfa', 'total_debt_usd')),
  threshold_value NUMERIC NOT NULL,
  alert_severity TEXT NOT NULL DEFAULT 'warning' CHECK (alert_severity IN ('info', 'warning', 'critical')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_channels TEXT[] DEFAULT ARRAY['dashboard', 'email'],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt alerts table
CREATE TABLE IF NOT EXISTS public.debt_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_record_id UUID REFERENCES public.debt_records(id),
  threshold_id UUID REFERENCES public.debt_thresholds(id),
  alert_type TEXT NOT NULL,
  alert_severity TEXT NOT NULL CHECK (alert_severity IN ('info', 'warning', 'critical')),
  alert_title TEXT NOT NULL,
  alert_description TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt milestones table for tracking significant events
CREATE TABLE IF NOT EXISTS public.debt_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_record_id UUID REFERENCES public.debt_records(id),
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('loan_agreement', 'repayment', 'restructuring', 'default', 'bailout', 'crisis', 'policy_change')),
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE NOT NULL,
  impact_level TEXT DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  source_document_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt predictions table for AI forecasting
CREATE TABLE IF NOT EXISTS public.debt_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_date DATE NOT NULL,
  predicted_total_debt_fcfa BIGINT,
  predicted_total_debt_usd BIGINT,
  predicted_debt_to_gdp NUMERIC(5,2),
  confidence_level NUMERIC(3,2) DEFAULT 0.75,
  prediction_model TEXT DEFAULT 'linear_regression',
  factors_considered JSONB DEFAULT '[]',
  created_by_ai BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt knowledge hub table
CREATE TABLE IF NOT EXISTS public.debt_knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL CHECK (category IN ('basics', 'analysis', 'history', 'policy', 'impact')),
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  reading_time_minutes INTEGER DEFAULT 5,
  featured_image_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create debt sentiment tracking table
CREATE TABLE IF NOT EXISTS public.debt_sentiment_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'news_media', 'government_statements')),
  sentiment_score NUMERIC(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label TEXT CHECK (sentiment_label IN ('negative', 'neutral', 'positive')),
  keyword_topic TEXT NOT NULL,
  mention_count INTEGER DEFAULT 1,
  sample_text TEXT,
  confidence_level NUMERIC(3,2) DEFAULT 0.75,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create country comparison data table
CREATE TABLE IF NOT EXISTS public.debt_country_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  total_debt_usd BIGINT,
  debt_to_gdp_ratio NUMERIC(5,2),
  population BIGINT,
  gdp_usd BIGINT,
  debt_per_capita_usd NUMERIC(10,2),
  data_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_code, year)
);

-- Create API integration logs table
CREATE TABLE IF NOT EXISTS public.debt_api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_source TEXT NOT NULL,
  endpoint_url TEXT,
  request_status TEXT NOT NULL CHECK (request_status IN ('success', 'failed', 'timeout', 'rate_limited')),
  response_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  records_updated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default debt thresholds
INSERT INTO public.debt_thresholds (threshold_name, threshold_type, threshold_value, alert_severity, notification_channels) VALUES
('Critical Debt-to-GDP Ratio', 'debt_to_gdp', 80.0, 'critical', ARRAY['dashboard', 'email']),
('Warning Debt-to-GDP Ratio', 'debt_to_gdp', 70.0, 'warning', ARRAY['dashboard']),
('High Monthly Increase', 'monthly_increase', 5.0, 'warning', ARRAY['dashboard']),
('Critical Monthly Increase', 'monthly_increase', 10.0, 'critical', ARRAY['dashboard', 'email']);

-- Insert sample knowledge articles
INSERT INTO public.debt_knowledge_articles (title, slug, content, summary, category, difficulty_level, is_published, language) VALUES
('What is National Debt?', 'what-is-national-debt', 'National debt represents the total amount of money that a country owes to creditors. This includes both domestic debt (owed to lenders within the country) and external debt (owed to foreign lenders)...', 'Learn the basics of national debt and how it affects citizens', 'basics', 'beginner', true, 'en'),
('Understanding Cameroon''s Debt History', 'cameroon-debt-history', 'Cameroon''s debt journey has been marked by significant milestones, from the structural adjustment programs of the 1990s to recent infrastructure investments...', 'A comprehensive look at how Cameroon''s debt evolved over decades', 'history', 'intermediate', true, 'en'),
('IMF vs World Bank: Different Types of Loans', 'imf-vs-world-bank-loans', 'The International Monetary Fund (IMF) and World Bank serve different purposes in international finance. While both provide loans to developing countries...', 'Understanding the difference between IMF and World Bank assistance', 'basics', 'beginner', true, 'en');

-- Insert sample country comparison data
INSERT INTO public.debt_country_comparisons (country_name, country_code, year, total_debt_usd, debt_to_gdp_ratio, population, gdp_usd, debt_per_capita_usd, data_source) VALUES
('Nigeria', 'NG', 2023, 103000000000, 37.1, 223800000, 440700000000, 460.22, 'World Bank'),
('Ghana', 'GH', 2023, 28500000000, 88.1, 33480000, 77400000000, 851.25, 'IMF'),
('Senegal', 'SN', 2023, 17200000000, 76.3, 17740000, 27640000000, 969.67, 'World Bank'),
('Ivory Coast', 'CI', 2023, 22800000000, 52.4, 28160000, 70000000000, 809.66, 'AfDB');

-- Enable RLS on new tables
ALTER TABLE public.debt_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_sentiment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_country_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_api_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Debt thresholds - admin manage, public view
CREATE POLICY "Public can view debt thresholds" ON public.debt_thresholds FOR SELECT USING (true);
CREATE POLICY "Admins can manage debt thresholds" ON public.debt_thresholds FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Debt alerts - admin manage, public view active alerts
CREATE POLICY "Public can view unacknowledged alerts" ON public.debt_alerts FOR SELECT USING (NOT is_acknowledged);
CREATE POLICY "Admins can manage debt alerts" ON public.debt_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Debt milestones - admin manage, public view
CREATE POLICY "Public can view debt milestones" ON public.debt_milestones FOR SELECT USING (true);
CREATE POLICY "Admins can manage debt milestones" ON public.debt_milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Debt predictions - admin manage, public view
CREATE POLICY "Public can view debt predictions" ON public.debt_predictions FOR SELECT USING (true);
CREATE POLICY "Admins can manage debt predictions" ON public.debt_predictions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Knowledge articles - admin manage, public view published
CREATE POLICY "Public can view published articles" ON public.debt_knowledge_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage knowledge articles" ON public.debt_knowledge_articles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Sentiment data - admin manage, public view
CREATE POLICY "Public can view sentiment data" ON public.debt_sentiment_data FOR SELECT USING (true);
CREATE POLICY "Admins can manage sentiment data" ON public.debt_sentiment_data FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Country comparisons - admin manage, public view
CREATE POLICY "Public can view country comparisons" ON public.debt_country_comparisons FOR SELECT USING (true);
CREATE POLICY "Admins can manage country comparisons" ON public.debt_country_comparisons FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- API logs - admin only
CREATE POLICY "Admins can view API logs" ON public.debt_api_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System can insert API logs" ON public.debt_api_logs FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_debt_alerts_severity ON public.debt_alerts(alert_severity);
CREATE INDEX idx_debt_alerts_acknowledged ON public.debt_alerts(is_acknowledged);
CREATE INDEX idx_debt_milestones_date ON public.debt_milestones(milestone_date);
CREATE INDEX idx_debt_milestones_type ON public.debt_milestones(milestone_type);
CREATE INDEX idx_debt_predictions_date ON public.debt_predictions(prediction_date);
CREATE INDEX idx_debt_sentiment_date ON public.debt_sentiment_data(date_recorded);
CREATE INDEX idx_debt_sentiment_platform ON public.debt_sentiment_data(platform);
CREATE INDEX idx_country_comparisons_year ON public.debt_country_comparisons(year);
CREATE INDEX idx_knowledge_articles_category ON public.debt_knowledge_articles(category);
CREATE INDEX idx_knowledge_articles_published ON public.debt_knowledge_articles(is_published);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_debt_thresholds_updated_at BEFORE UPDATE ON public.debt_thresholds FOR EACH ROW EXECUTE FUNCTION public.update_debt_updated_at();
CREATE TRIGGER update_debt_milestones_updated_at BEFORE UPDATE ON public.debt_milestones FOR EACH ROW EXECUTE FUNCTION public.update_debt_updated_at();
CREATE TRIGGER update_debt_knowledge_updated_at BEFORE UPDATE ON public.debt_knowledge_articles FOR EACH ROW EXECUTE FUNCTION public.update_debt_updated_at();
CREATE TRIGGER update_debt_country_comparisons_updated_at BEFORE UPDATE ON public.debt_country_comparisons FOR EACH ROW EXECUTE FUNCTION public.update_debt_updated_at();

-- Create function to check debt thresholds and create alerts
CREATE OR REPLACE FUNCTION public.check_debt_thresholds(p_debt_record_id UUID)
RETURNS TABLE(alerts_created INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  debt_record RECORD;
  threshold_record RECORD;
  alert_count INTEGER := 0;
BEGIN
  -- Get the debt record
  SELECT * INTO debt_record FROM public.debt_records WHERE id = p_debt_record_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0;
    RETURN;
  END IF;
  
  -- Check each active threshold
  FOR threshold_record IN 
    SELECT * FROM public.debt_thresholds WHERE is_active = true
  LOOP
    -- Check if threshold is exceeded based on type
    IF (threshold_record.threshold_type = 'debt_to_gdp' AND debt_record.debt_to_gdp_ratio >= threshold_record.threshold_value) OR
       (threshold_record.threshold_type = 'monthly_increase' AND debt_record.monthly_change_percentage >= threshold_record.threshold_value) OR
       (threshold_record.threshold_type = 'total_debt_fcfa' AND debt_record.total_debt_fcfa >= threshold_record.threshold_value) OR
       (threshold_record.threshold_type = 'total_debt_usd' AND debt_record.total_debt_usd >= threshold_record.threshold_value) THEN
      
      -- Create alert if it doesn't already exist
      INSERT INTO public.debt_alerts (
        debt_record_id, threshold_id, alert_type, alert_severity, alert_title, alert_description,
        current_value, threshold_value
      ) 
      SELECT 
        p_debt_record_id, threshold_record.id, threshold_record.threshold_type, threshold_record.alert_severity,
        'Debt Threshold Exceeded: ' || threshold_record.threshold_name,
        'Current value (' || 
        CASE 
          WHEN threshold_record.threshold_type = 'debt_to_gdp' THEN debt_record.debt_to_gdp_ratio::TEXT || '%'
          WHEN threshold_record.threshold_type = 'monthly_increase' THEN debt_record.monthly_change_percentage::TEXT || '%'
          WHEN threshold_record.threshold_type = 'total_debt_fcfa' THEN debt_record.total_debt_fcfa::TEXT || ' FCFA'
          WHEN threshold_record.threshold_type = 'total_debt_usd' THEN debt_record.total_debt_usd::TEXT || ' USD'
        END ||
        ') exceeds threshold (' || threshold_record.threshold_value::TEXT || ')',
        CASE 
          WHEN threshold_record.threshold_type = 'debt_to_gdp' THEN debt_record.debt_to_gdp_ratio
          WHEN threshold_record.threshold_type = 'monthly_increase' THEN debt_record.monthly_change_percentage
          WHEN threshold_record.threshold_type = 'total_debt_fcfa' THEN debt_record.total_debt_fcfa
          WHEN threshold_record.threshold_type = 'total_debt_usd' THEN debt_record.total_debt_usd
        END,
        threshold_record.threshold_value
      WHERE NOT EXISTS (
        SELECT 1 FROM public.debt_alerts 
        WHERE debt_record_id = p_debt_record_id 
        AND threshold_id = threshold_record.id 
        AND is_acknowledged = false
      );
      
      IF FOUND THEN
        alert_count := alert_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT alert_count;
END;
$$;

-- Create function to generate debt predictions using simple linear regression
CREATE OR REPLACE FUNCTION public.generate_debt_predictions(p_years_ahead INTEGER DEFAULT 3)
RETURNS TABLE(predictions_created INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
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