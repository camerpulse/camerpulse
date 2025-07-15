-- Plugin Builder Tables for Ashen Debug Core

-- Table to track plugin generation requests
CREATE TABLE public.ashen_plugin_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_text TEXT NOT NULL,
  parsed_requirements JSONB NOT NULL DEFAULT '{}',
  plugin_name TEXT,
  target_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  similarity_check_results JSONB DEFAULT '{}',
  generation_logs JSONB DEFAULT '[]',
  error_details TEXT,
  estimated_complexity INTEGER DEFAULT 1,
  files_to_create TEXT[] DEFAULT ARRAY[]::TEXT[],
  tables_to_create TEXT[] DEFAULT ARRAY[]::TEXT[],
  functions_to_create TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Table to track generated plugins and their components
CREATE TABLE public.ashen_generated_plugins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.ashen_plugin_requests(id) ON DELETE CASCADE,
  plugin_name TEXT NOT NULL,
  plugin_description TEXT,
  plugin_type TEXT NOT NULL DEFAULT 'component',
  status TEXT NOT NULL DEFAULT 'active',
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  files_created JSONB DEFAULT '[]',
  tables_created TEXT[] DEFAULT ARRAY[]::TEXT[],
  functions_created TEXT[] DEFAULT ARRAY[]::TEXT[],
  routes_created TEXT[] DEFAULT ARRAY[]::TEXT[],
  rollback_data JSONB DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  is_rollback_available BOOLEAN DEFAULT true,
  rollback_timestamp TIMESTAMP WITH TIME ZONE,
  usage_stats JSONB DEFAULT '{}'
);

-- Table to track plugin generation steps and progress
CREATE TABLE public.ashen_plugin_generation_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.ashen_plugin_requests(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL, -- 'schema', 'function', 'component', 'route'
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  generated_code TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ashen_plugin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_generated_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_plugin_generation_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plugin tables
CREATE POLICY "Admins can manage plugin requests"
ON public.ashen_plugin_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage generated plugins"
ON public.ashen_generated_plugins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can view generation steps"
ON public.ashen_plugin_generation_steps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Indexes for performance
CREATE INDEX idx_plugin_requests_status ON public.ashen_plugin_requests(status);
CREATE INDEX idx_plugin_requests_created_at ON public.ashen_plugin_requests(created_at);
CREATE INDEX idx_generated_plugins_status ON public.ashen_generated_plugins(status);
CREATE INDEX idx_generation_steps_request_id ON public.ashen_plugin_generation_steps(request_id);

-- Function to analyze plugin request similarity
CREATE OR REPLACE FUNCTION public.analyze_plugin_similarity(
  p_request_text TEXT,
  p_plugin_name TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  similar_requests RECORD;
  similarity_results JSONB := '{"similar_plugins": [], "max_similarity": 0, "recommendation": "proceed"}';
  max_similarity NUMERIC := 0;
  similar_array JSONB := '[]';
BEGIN
  -- Find similar plugin requests
  FOR similar_requests IN
    SELECT 
      id,
      plugin_name,
      request_text,
      status,
      public.calculate_prompt_similarity(p_request_text, request_text) as similarity
    FROM public.ashen_plugin_requests
    WHERE status IN ('completed', 'active')
    ORDER BY similarity DESC
    LIMIT 5
  LOOP
    IF similar_requests.similarity > max_similarity THEN
      max_similarity := similar_requests.similarity;
    END IF;
    
    IF similar_requests.similarity >= 60 THEN
      similar_array := similar_array || jsonb_build_object(
        'request_id', similar_requests.id,
        'plugin_name', similar_requests.plugin_name,
        'similarity', similar_requests.similarity,
        'status', similar_requests.status
      );
    END IF;
  END LOOP;
  
  similarity_results := jsonb_build_object(
    'similar_plugins', similar_array,
    'max_similarity', max_similarity,
    'recommendation', CASE 
      WHEN max_similarity >= 85 THEN 'duplicate'
      WHEN max_similarity >= 70 THEN 'extend_existing'
      WHEN max_similarity >= 60 THEN 'review_similar'
      ELSE 'proceed'
    END
  );
  
  RETURN similarity_results;
END;
$$;

-- Function to update plugin request status
CREATE OR REPLACE FUNCTION public.update_plugin_request_status(
  p_request_id UUID,
  p_status TEXT,
  p_error_details TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ashen_plugin_requests 
  SET 
    status = p_status,
    error_details = p_error_details,
    updated_at = now()
  WHERE id = p_request_id;
  
  RETURN FOUND;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_plugin_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_plugin_requests_timestamp
  BEFORE UPDATE ON public.ashen_plugin_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plugin_timestamp();

CREATE TRIGGER update_generated_plugins_timestamp
  BEFORE UPDATE ON public.ashen_generated_plugins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plugin_timestamp();