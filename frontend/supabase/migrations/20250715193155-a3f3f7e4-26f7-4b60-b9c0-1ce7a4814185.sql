-- Prompt-Aware Intelligence & Memory Deduplication Engine

-- Table for tracking all executed prompts and their outcomes
CREATE TABLE public.ashen_prompt_trace_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id TEXT NOT NULL UNIQUE,
  prompt_title TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  prompt_phase TEXT, -- 'foundation', 'feature', 'enhancement', 'security', etc.
  prompt_author TEXT DEFAULT 'User',
  execution_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  modules_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
  routes_created TEXT[] DEFAULT ARRAY[]::TEXT[],
  files_created TEXT[] DEFAULT ARRAY[]::TEXT[],
  files_modified TEXT[] DEFAULT ARRAY[]::TEXT[],
  tables_created TEXT[] DEFAULT ARRAY[]::TEXT[],
  functions_created TEXT[] DEFAULT ARRAY[]::TEXT[],
  outcome TEXT NOT NULL DEFAULT 'pending', -- 'success', 'failed', 'skipped', 'merged'
  outcome_details TEXT,
  similarity_score NUMERIC DEFAULT 0.0,
  related_prompts TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Table for tracking code deduplication analysis
CREATE TABLE public.ashen_deduplication_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type TEXT NOT NULL, -- 'module', 'route', 'table', 'function', 'component'
  item_name TEXT NOT NULL,
  item_path TEXT,
  duplicate_items JSONB DEFAULT '[]'::JSONB, -- Array of similar items found
  similarity_percentage NUMERIC DEFAULT 0.0,
  recommendation TEXT, -- 'merge', 'delete', 'keep_separate', 'refactor'
  recommendation_reasoning TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prompt_trace_id UUID,
  FOREIGN KEY (prompt_trace_id) REFERENCES public.ashen_prompt_trace_index(id)
);

-- Table for storing prompt similarity comparisons
CREATE TABLE public.ashen_prompt_similarity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_prompt_id TEXT NOT NULL,
  target_prompt_id TEXT NOT NULL,
  similarity_score NUMERIC NOT NULL,
  common_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  diff_analysis JSONB DEFAULT '{}'::JSONB,
  comparison_result TEXT, -- 'duplicate', 'similar', 'extension', 'different'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (source_prompt_id) REFERENCES public.ashen_prompt_trace_index(prompt_id),
  FOREIGN KEY (target_prompt_id) REFERENCES public.ashen_prompt_trace_index(prompt_id)
);

-- Table for tracking prompt chain extensions and forks
CREATE TABLE public.ashen_prompt_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_prompt_id TEXT NOT NULL,
  child_prompt_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL, -- 'extension', 'fork', 'upgrade', 'refactor'
  chain_depth INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (parent_prompt_id) REFERENCES public.ashen_prompt_trace_index(prompt_id),
  FOREIGN KEY (child_prompt_id) REFERENCES public.ashen_prompt_trace_index(prompt_id)
);

-- Table for prompt knowledge base and templates
CREATE TABLE public.ashen_prompt_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_category TEXT NOT NULL, -- 'ui', 'backend', 'security', 'integration', etc.
  template_description TEXT,
  template_content TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0.0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX idx_prompt_trace_prompt_id ON public.ashen_prompt_trace_index(prompt_id);
CREATE INDEX idx_prompt_trace_phase ON public.ashen_prompt_trace_index(prompt_phase);
CREATE INDEX idx_prompt_trace_execution_date ON public.ashen_prompt_trace_index(execution_date);
CREATE INDEX idx_deduplication_type ON public.ashen_deduplication_analysis(analysis_type);
CREATE INDEX idx_deduplication_status ON public.ashen_deduplication_analysis(status);
CREATE INDEX idx_prompt_similarity_score ON public.ashen_prompt_similarity(similarity_score);
CREATE INDEX idx_prompt_chains_parent ON public.ashen_prompt_chains(parent_prompt_id);
CREATE INDEX idx_knowledge_base_category ON public.ashen_prompt_knowledge_base(template_category);

-- Enable RLS
ALTER TABLE public.ashen_prompt_trace_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_deduplication_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_prompt_similarity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_prompt_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_prompt_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies
CREATE POLICY "Admins can manage prompt trace index" ON public.ashen_prompt_trace_index
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage deduplication analysis" ON public.ashen_deduplication_analysis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage prompt similarity" ON public.ashen_prompt_similarity
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage prompt chains" ON public.ashen_prompt_chains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage knowledge base" ON public.ashen_prompt_knowledge_base
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to calculate prompt similarity
CREATE OR REPLACE FUNCTION public.calculate_prompt_similarity(
  p_source_content TEXT,
  p_target_content TEXT
) RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  source_words TEXT[];
  target_words TEXT[];
  common_words TEXT[];
  similarity_score NUMERIC := 0.0;
  source_length INTEGER;
  target_length INTEGER;
BEGIN
  -- Convert to lowercase and split into words
  source_words := string_to_array(lower(p_source_content), ' ');
  target_words := string_to_array(lower(p_target_content), ' ');
  
  source_length := array_length(source_words, 1);
  target_length := array_length(target_words, 1);
  
  -- Find common words
  SELECT array_agg(word) INTO common_words
  FROM (
    SELECT unnest(source_words) AS word
    INTERSECT
    SELECT unnest(target_words) AS word
  ) common;
  
  -- Calculate similarity based on common words
  IF source_length > 0 AND target_length > 0 THEN
    similarity_score := (array_length(common_words, 1)::NUMERIC * 2.0) / (source_length + target_length);
  END IF;
  
  RETURN COALESCE(similarity_score, 0.0) * 100;
END;
$$;

-- Function to analyze prompt before execution
CREATE OR REPLACE FUNCTION public.analyze_prompt_before_execution(
  p_prompt_content TEXT,
  p_prompt_title TEXT DEFAULT 'Untitled Prompt'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  similar_prompts RECORD;
  result JSONB := '{"similar_prompts": [], "recommendation": "proceed", "max_similarity": 0}';
  max_similarity NUMERIC := 0;
  similar_array JSONB := '[]';
BEGIN
  -- Find similar prompts
  FOR similar_prompts IN
    SELECT 
      prompt_id,
      prompt_title,
      prompt_content,
      public.calculate_prompt_similarity(p_prompt_content, prompt_content) as similarity
    FROM public.ashen_prompt_trace_index
    WHERE outcome = 'success'
    ORDER BY similarity DESC
    LIMIT 5
  LOOP
    IF similar_prompts.similarity > max_similarity THEN
      max_similarity := similar_prompts.similarity;
    END IF;
    
    IF similar_prompts.similarity >= 50 THEN
      similar_array := similar_array || jsonb_build_object(
        'prompt_id', similar_prompts.prompt_id,
        'prompt_title', similar_prompts.prompt_title,
        'similarity', similar_prompts.similarity
      );
    END IF;
  END LOOP;
  
  result := jsonb_build_object(
    'similar_prompts', similar_array,
    'max_similarity', max_similarity,
    'recommendation', CASE 
      WHEN max_similarity >= 85 THEN 'duplicate'
      WHEN max_similarity >= 70 THEN 'extend'
      WHEN max_similarity >= 50 THEN 'review'
      ELSE 'proceed'
    END
  );
  
  RETURN result;
END;
$$;

-- Function to log prompt execution
CREATE OR REPLACE FUNCTION public.log_prompt_execution(
  p_prompt_content TEXT,
  p_prompt_title TEXT,
  p_prompt_phase TEXT DEFAULT 'feature',
  p_modules_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_outcome TEXT DEFAULT 'success'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prompt_uuid UUID;
  new_prompt_id TEXT;
BEGIN
  -- Generate unique prompt ID
  new_prompt_id := 'prompt_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::int;
  
  -- Insert prompt trace
  INSERT INTO public.ashen_prompt_trace_index (
    prompt_id,
    prompt_title,
    prompt_content,
    prompt_phase,
    modules_affected,
    outcome
  ) VALUES (
    new_prompt_id,
    p_prompt_title,
    p_prompt_content,
    p_prompt_phase,
    p_modules_affected,
    p_outcome
  ) RETURNING id INTO prompt_uuid;
  
  RETURN prompt_uuid;
END;
$$;

-- Add trigger for updating timestamps
CREATE TRIGGER update_prompt_trace_timestamp
  BEFORE UPDATE ON public.ashen_prompt_trace_index
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_learning_timestamp();

CREATE TRIGGER update_deduplication_timestamp
  BEFORE UPDATE ON public.ashen_deduplication_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_learning_timestamp();

CREATE TRIGGER update_knowledge_base_timestamp
  BEFORE UPDATE ON public.ashen_prompt_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_learning_timestamp();