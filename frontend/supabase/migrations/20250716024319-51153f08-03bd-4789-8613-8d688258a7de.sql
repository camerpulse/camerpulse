-- Create civic sentiment timeline system
CREATE TABLE public.civic_sentiment_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_type TEXT NOT NULL, -- 'politician', 'party', 'issue', 'government_branch'
  subject_id UUID NULL, -- foreign key reference if applicable
  subject_name TEXT NOT NULL, -- name of the subject being tracked
  date_recorded DATE NOT NULL,
  sentiment_score NUMERIC NOT NULL DEFAULT 0, -- -100 to +100
  emotions JSONB NOT NULL DEFAULT '{}', -- {joy: 0.2, anger: 0.5, fear: 0.1, hope: 0.1, sadness: 0.1}
  trust_ratio NUMERIC NOT NULL DEFAULT 0, -- -100 to +100
  approval_rating NUMERIC NOT NULL DEFAULT 0, -- -100 to +100
  region TEXT NULL, -- optional regional filter
  age_group TEXT NULL, -- optional age group filter
  language TEXT NULL, -- optional language filter
  data_sources JSONB NOT NULL DEFAULT '[]', -- sources of data for this entry
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sentiment spikes detection table
CREATE TABLE public.sentiment_spikes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID NOT NULL REFERENCES public.civic_sentiment_timeline(id) ON DELETE CASCADE,
  spike_type TEXT NOT NULL, -- 'positive', 'negative', 'neutral'
  spike_intensity NUMERIC NOT NULL DEFAULT 0, -- magnitude of the spike
  detected_cause TEXT NULL, -- AI-detected cause
  event_title TEXT NULL, -- title of the event causing spike
  event_source TEXT NULL, -- source of the event information
  confidence_score NUMERIC NOT NULL DEFAULT 0, -- AI confidence in the detection
  manual_annotation TEXT NULL, -- manual override/annotation
  verified_by UUID NULL, -- admin who verified the spike
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sentiment annotations table for manual annotations
CREATE TABLE public.sentiment_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID NOT NULL REFERENCES public.civic_sentiment_timeline(id) ON DELETE CASCADE,
  annotation_text TEXT NOT NULL,
  annotation_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'system', 'ai_detected'
  annotated_by UUID NOT NULL,
  annotated_by_name TEXT NOT NULL,
  annotation_date DATE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sentiment export requests table
CREATE TABLE public.sentiment_export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL,
  export_type TEXT NOT NULL, -- 'csv', 'png', 'json'
  subject_filter JSONB NOT NULL DEFAULT '{}',
  date_range JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  download_url TEXT NULL,
  export_data JSONB NULL,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_sentiment_timeline_subject ON public.civic_sentiment_timeline(subject_type, subject_name);
CREATE INDEX idx_sentiment_timeline_date ON public.civic_sentiment_timeline(date_recorded);
CREATE INDEX idx_sentiment_timeline_region ON public.civic_sentiment_timeline(region);
CREATE INDEX idx_sentiment_spikes_timeline ON public.sentiment_spikes(timeline_id);
CREATE INDEX idx_sentiment_annotations_timeline ON public.sentiment_annotations(timeline_id);

-- Enable RLS
ALTER TABLE public.civic_sentiment_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_spikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_export_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sentiment timeline
CREATE POLICY "Sentiment timeline is viewable by everyone" 
ON public.civic_sentiment_timeline 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage sentiment timeline" 
ON public.civic_sentiment_timeline 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for sentiment spikes
CREATE POLICY "Sentiment spikes are viewable by everyone" 
ON public.sentiment_spikes 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage sentiment spikes" 
ON public.sentiment_spikes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for sentiment annotations
CREATE POLICY "Public annotations are viewable by everyone" 
ON public.sentiment_annotations 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Admins can view all annotations" 
ON public.sentiment_annotations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can create annotations" 
ON public.sentiment_annotations 
FOR INSERT 
WITH CHECK (auth.uid() = annotated_by);

CREATE POLICY "Admins can manage all annotations" 
ON public.sentiment_annotations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for export requests
CREATE POLICY "Users can manage their export requests" 
ON public.sentiment_export_requests 
FOR ALL 
USING (auth.uid() = requested_by);

CREATE POLICY "Admins can view all export requests" 
ON public.sentiment_export_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create function to get sentiment timeline data
CREATE OR REPLACE FUNCTION public.get_sentiment_timeline(
  p_subject_type TEXT DEFAULT NULL,
  p_subject_name TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_age_group TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  timeline_data JSONB := '{"timeline": [], "spikes": [], "summary": {}}';
  timeline_array JSONB := '[]';
  spikes_array JSONB := '[]';
  summary_data JSONB := '{}';
  timeline_record RECORD;
  spike_record RECORD;
  avg_sentiment NUMERIC;
  total_entries INTEGER;
BEGIN
  -- Get timeline data
  FOR timeline_record IN
    SELECT 
      id, subject_type, subject_name, date_recorded,
      sentiment_score, emotions, trust_ratio, approval_rating,
      region, age_group, language
    FROM public.civic_sentiment_timeline
    WHERE 
      (p_subject_type IS NULL OR subject_type = p_subject_type)
      AND (p_subject_name IS NULL OR subject_name ILIKE '%' || p_subject_name || '%')
      AND (p_start_date IS NULL OR date_recorded >= p_start_date)
      AND (p_end_date IS NULL OR date_recorded <= p_end_date)
      AND (p_region IS NULL OR region = p_region)
      AND (p_age_group IS NULL OR age_group = p_age_group)
    ORDER BY date_recorded ASC
  LOOP
    timeline_array := timeline_array || jsonb_build_object(
      'id', timeline_record.id,
      'subject_type', timeline_record.subject_type,
      'subject_name', timeline_record.subject_name,
      'date', timeline_record.date_recorded,
      'sentiment_score', timeline_record.sentiment_score,
      'emotions', timeline_record.emotions,
      'trust_ratio', timeline_record.trust_ratio,
      'approval_rating', timeline_record.approval_rating,
      'region', timeline_record.region,
      'age_group', timeline_record.age_group
    );
  END LOOP;

  -- Get spikes data
  FOR spike_record IN
    SELECT 
      s.*, t.date_recorded, t.subject_name
    FROM public.sentiment_spikes s
    JOIN public.civic_sentiment_timeline t ON s.timeline_id = t.id
    WHERE t.id IN (
      SELECT id FROM public.civic_sentiment_timeline
      WHERE 
        (p_subject_type IS NULL OR subject_type = p_subject_type)
        AND (p_subject_name IS NULL OR subject_name ILIKE '%' || p_subject_name || '%')
        AND (p_start_date IS NULL OR date_recorded >= p_start_date)
        AND (p_end_date IS NULL OR date_recorded <= p_end_date)
        AND (p_region IS NULL OR region = p_region)
        AND (p_age_group IS NULL OR age_group = p_age_group)
    )
    ORDER BY t.date_recorded ASC
  LOOP
    spikes_array := spikes_array || jsonb_build_object(
      'id', spike_record.id,
      'date', spike_record.date_recorded,
      'subject_name', spike_record.subject_name,
      'spike_type', spike_record.spike_type,
      'spike_intensity', spike_record.spike_intensity,
      'detected_cause', spike_record.detected_cause,
      'event_title', spike_record.event_title,
      'confidence_score', spike_record.confidence_score
    );
  END LOOP;

  -- Calculate summary statistics
  SELECT 
    COALESCE(AVG(sentiment_score), 0),
    COUNT(*)
  INTO avg_sentiment, total_entries
  FROM public.civic_sentiment_timeline
  WHERE 
    (p_subject_type IS NULL OR subject_type = p_subject_type)
    AND (p_subject_name IS NULL OR subject_name ILIKE '%' || p_subject_name || '%')
    AND (p_start_date IS NULL OR date_recorded >= p_start_date)
    AND (p_end_date IS NULL OR date_recorded <= p_end_date)
    AND (p_region IS NULL OR region = p_region)
    AND (p_age_group IS NULL OR age_group = p_age_group);

  summary_data := jsonb_build_object(
    'average_sentiment', ROUND(avg_sentiment, 2),
    'total_entries', total_entries,
    'date_range', jsonb_build_object(
      'start', p_start_date,
      'end', p_end_date
    )
  );

  timeline_data := jsonb_build_object(
    'timeline', timeline_array,
    'spikes', spikes_array,
    'summary', summary_data
  );

  RETURN timeline_data;
END;
$$;

-- Create function to detect sentiment spikes
CREATE OR REPLACE FUNCTION public.detect_sentiment_spikes(
  p_timeline_id UUID,
  p_threshold NUMERIC DEFAULT 20.0
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_record RECORD;
  previous_record RECORD;
  spike_detected BOOLEAN := false;
  spike_intensity NUMERIC := 0;
  spike_type TEXT := 'neutral';
  result JSONB := '{"spike_detected": false}';
BEGIN
  -- Get current timeline record
  SELECT * INTO current_record 
  FROM public.civic_sentiment_timeline 
  WHERE id = p_timeline_id;
  
  -- Get previous record for comparison
  SELECT * INTO previous_record 
  FROM public.civic_sentiment_timeline 
  WHERE subject_type = current_record.subject_type 
    AND subject_name = current_record.subject_name
    AND date_recorded < current_record.date_recorded
    AND (current_record.region IS NULL OR region = current_record.region)
  ORDER BY date_recorded DESC 
  LIMIT 1;
  
  IF previous_record.id IS NOT NULL THEN
    spike_intensity := ABS(current_record.sentiment_score - previous_record.sentiment_score);
    
    IF spike_intensity >= p_threshold THEN
      spike_detected := true;
      spike_type := CASE 
        WHEN current_record.sentiment_score > previous_record.sentiment_score THEN 'positive'
        WHEN current_record.sentiment_score < previous_record.sentiment_score THEN 'negative'
        ELSE 'neutral'
      END;
      
      -- Insert spike record
      INSERT INTO public.sentiment_spikes (
        timeline_id, spike_type, spike_intensity, confidence_score
      ) VALUES (
        p_timeline_id, spike_type, spike_intensity, 0.8
      );
    END IF;
  END IF;
  
  result := jsonb_build_object(
    'spike_detected', spike_detected,
    'spike_type', spike_type,
    'spike_intensity', spike_intensity
  );
  
  RETURN result;
END;
$$;

-- Create trigger to auto-detect spikes
CREATE OR REPLACE FUNCTION public.trigger_spike_detection()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Detect spikes for new timeline entries
  PERFORM public.detect_sentiment_spikes(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER detect_spikes_on_timeline_insert
  AFTER INSERT ON public.civic_sentiment_timeline
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_spike_detection();

-- Create update trigger for timestamps
CREATE TRIGGER update_sentiment_timeline_updated_at
  BEFORE UPDATE ON public.civic_sentiment_timeline
  FOR EACH ROW
  EXECUTE FUNCTION public.update_engagement_updated_at();

CREATE TRIGGER update_sentiment_spikes_updated_at
  BEFORE UPDATE ON public.sentiment_spikes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_engagement_updated_at();

CREATE TRIGGER update_sentiment_annotations_updated_at
  BEFORE UPDATE ON public.sentiment_annotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_engagement_updated_at();

-- Insert sample data for demonstration
INSERT INTO public.civic_sentiment_timeline (
  subject_type, subject_name, date_recorded, sentiment_score, 
  emotions, trust_ratio, approval_rating, region
) VALUES 
  ('politician', 'Paul Biya', '2024-01-15', 25, '{"joy": 0.1, "anger": 0.4, "fear": 0.3, "hope": 0.2}', 15, 30, 'Centre'),
  ('politician', 'Paul Biya', '2024-02-15', -15, '{"joy": 0.05, "anger": 0.6, "fear": 0.25, "hope": 0.1}', -20, 10, 'Centre'),
  ('politician', 'Paul Biya', '2024-03-15', 45, '{"joy": 0.4, "anger": 0.1, "fear": 0.15, "hope": 0.35}', 40, 55, 'Centre'),
  ('party', 'RDPC', '2024-01-15', 20, '{"joy": 0.15, "anger": 0.35, "fear": 0.3, "hope": 0.2}', 10, 25, 'Centre'),
  ('party', 'RDPC', '2024-02-15', -25, '{"joy": 0.05, "anger": 0.7, "fear": 0.2, "hope": 0.05}', -30, 5, 'Centre'),
  ('party', 'RDPC', '2024-03-15', 35, '{"joy": 0.35, "anger": 0.15, "fear": 0.2, "hope": 0.3}', 30, 45, 'Centre'),
  ('issue', 'Fuel Prices', '2024-01-15', -45, '{"joy": 0.02, "anger": 0.8, "fear": 0.15, "hope": 0.03}', -50, -60, NULL),
  ('issue', 'Fuel Prices', '2024-02-15', -60, '{"joy": 0.01, "anger": 0.85, "fear": 0.12, "hope": 0.02}', -65, -70, NULL),
  ('issue', 'Fuel Prices', '2024-03-15', -30, '{"joy": 0.1, "anger": 0.6, "fear": 0.2, "hope": 0.1}', -35, -40, NULL),
  ('government_branch', 'National Assembly', '2024-01-15', 10, '{"joy": 0.1, "anger": 0.4, "fear": 0.3, "hope": 0.2}', 5, 15, NULL),
  ('government_branch', 'National Assembly', '2024-02-15', -10, '{"joy": 0.05, "anger": 0.5, "fear": 0.35, "hope": 0.1}', -15, -5, NULL),
  ('government_branch', 'National Assembly', '2024-03-15', 25, '{"joy": 0.25, "anger": 0.25, "fear": 0.25, "hope": 0.25}', 20, 30, NULL);