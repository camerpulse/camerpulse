-- Create Ashen Jr. Training Core tables
CREATE TABLE public.ashen_jr_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  agent_goal TEXT NOT NULL,
  agent_scope JSONB NOT NULL DEFAULT '{}',
  personality TEXT NOT NULL DEFAULT 'professional',
  knowledge_sources TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'training',
  accuracy_rating NUMERIC DEFAULT 0.0,
  memory_size INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  public_interaction_enabled BOOLEAN DEFAULT false,
  feedback_loop_enabled BOOLEAN DEFAULT true,
  training_prompt TEXT,
  system_prompt TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('training', 'active', 'paused', 'archived')),
  CONSTRAINT valid_personality CHECK (personality IN ('professional', 'neutral', 'youth_friendly', 'sarcastic', 'bold', 'friendly'))
);

-- Create agent training sessions table
CREATE TABLE public.ashen_jr_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ashen_jr_agents(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL DEFAULT 'initial',
  training_data JSONB NOT NULL DEFAULT '{}',
  training_prompt TEXT,
  training_duration_minutes INTEGER,
  performance_metrics JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_training_type CHECK (training_type IN ('initial', 'retrain', 'update', 'feedback_based')),
  CONSTRAINT valid_training_status CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- Create agent interactions table
CREATE TABLE public.ashen_jr_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ashen_jr_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  interaction_type TEXT NOT NULL DEFAULT 'chat',
  user_message TEXT NOT NULL,
  agent_response TEXT NOT NULL,
  response_accuracy NUMERIC,
  context_data JSONB DEFAULT '{}',
  source_channel TEXT DEFAULT 'admin_panel',
  feedback_rating INTEGER,
  feedback_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_interaction_type CHECK (interaction_type IN ('chat', 'query', 'analysis', 'report')),
  CONSTRAINT valid_source_channel CHECK (source_channel IN ('admin_panel', 'civic_portal', 'whatsapp', 'api')),
  CONSTRAINT valid_feedback_rating CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5))
);

-- Create agent performance metrics table
CREATE TABLE public.ashen_jr_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ashen_jr_agents(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  interactions_count INTEGER DEFAULT 0,
  accuracy_score NUMERIC DEFAULT 0.0,
  feedback_score NUMERIC DEFAULT 0.0,
  response_time_avg_ms INTEGER DEFAULT 0,
  knowledge_gaps JSONB DEFAULT '[]',
  suggested_improvements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(agent_id, metric_date)
);

-- Create agent knowledge base table
CREATE TABLE public.ashen_jr_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ashen_jr_agents(id) ON DELETE CASCADE,
  knowledge_type TEXT NOT NULL,
  knowledge_data JSONB NOT NULL,
  source_reference TEXT,
  confidence_score NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  learned_from_interaction_id UUID REFERENCES public.ashen_jr_interactions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_knowledge_type CHECK (knowledge_type IN ('fact', 'pattern', 'response_template', 'context_rule', 'correction'))
);

-- Enable RLS on all tables
ALTER TABLE public.ashen_jr_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_jr_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_jr_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_jr_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_jr_knowledge ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage Jr agents" ON public.ashen_jr_agents
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage training sessions" ON public.ashen_jr_training_sessions
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can view all interactions" ON public.ashen_jr_interactions
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Users can view their own interactions" ON public.ashen_jr_interactions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert interactions" ON public.ashen_jr_interactions
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their feedback" ON public.ashen_jr_interactions
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage performance metrics" ON public.ashen_jr_performance
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

CREATE POLICY "Admins can manage knowledge base" ON public.ashen_jr_knowledge
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create indexes for performance
CREATE INDEX idx_ashen_jr_agents_status ON public.ashen_jr_agents(status);
CREATE INDEX idx_ashen_jr_agents_public_interaction ON public.ashen_jr_agents(public_interaction_enabled) WHERE public_interaction_enabled = true;
CREATE INDEX idx_ashen_jr_training_sessions_agent_id ON public.ashen_jr_training_sessions(agent_id);
CREATE INDEX idx_ashen_jr_interactions_agent_id ON public.ashen_jr_interactions(agent_id);
CREATE INDEX idx_ashen_jr_interactions_user_id ON public.ashen_jr_interactions(user_id);
CREATE INDEX idx_ashen_jr_interactions_created_at ON public.ashen_jr_interactions(created_at);
CREATE INDEX idx_ashen_jr_performance_agent_id ON public.ashen_jr_performance(agent_id);
CREATE INDEX idx_ashen_jr_knowledge_agent_id ON public.ashen_jr_knowledge(agent_id);

-- Create triggers for updated_at
CREATE TRIGGER update_ashen_jr_agents_updated_at
  BEFORE UPDATE ON public.ashen_jr_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ashen_jr_knowledge_updated_at
  BEFORE UPDATE ON public.ashen_jr_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate agent performance
CREATE OR REPLACE FUNCTION public.calculate_agent_performance(p_agent_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  interactions_count INTEGER := 0;
  avg_accuracy NUMERIC := 0.0;
  avg_feedback NUMERIC := 0.0;
  avg_response_time INTEGER := 0;
  result JSONB;
BEGIN
  -- Get interaction statistics for the day
  SELECT 
    COUNT(*),
    COALESCE(AVG(response_accuracy), 0.0),
    COALESCE(AVG(feedback_rating), 0.0)
  INTO interactions_count, avg_accuracy, avg_feedback
  FROM public.ashen_jr_interactions
  WHERE agent_id = p_agent_id 
    AND DATE(created_at) = p_date;
  
  -- Update or insert performance record
  INSERT INTO public.ashen_jr_performance (
    agent_id, metric_date, interactions_count, 
    accuracy_score, feedback_score, response_time_avg_ms
  ) VALUES (
    p_agent_id, p_date, interactions_count,
    avg_accuracy, avg_feedback, avg_response_time
  )
  ON CONFLICT (agent_id, metric_date) 
  DO UPDATE SET
    interactions_count = EXCLUDED.interactions_count,
    accuracy_score = EXCLUDED.accuracy_score,
    feedback_score = EXCLUDED.feedback_score,
    response_time_avg_ms = EXCLUDED.response_time_avg_ms;
  
  -- Update agent accuracy rating
  UPDATE public.ashen_jr_agents
  SET 
    accuracy_rating = avg_accuracy,
    last_active = now(),
    memory_size = (
      SELECT COUNT(*) FROM public.ashen_jr_knowledge 
      WHERE agent_id = p_agent_id AND is_active = true
    )
  WHERE id = p_agent_id;
  
  result := jsonb_build_object(
    'interactions_count', interactions_count,
    'accuracy_score', avg_accuracy,
    'feedback_score', avg_feedback,
    'date', p_date
  );
  
  RETURN result;
END;
$$;

-- Create function to get agent suggestions
CREATE OR REPLACE FUNCTION public.get_agent_suggestions()
RETURNS TABLE(
  agent_id UUID,
  agent_name TEXT,
  suggestion_type TEXT,
  suggestion_message TEXT,
  priority INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Agents that need retraining (low accuracy)
  SELECT 
    a.id,
    a.agent_name,
    'retrain'::TEXT,
    'Agent accuracy is below 70%. Consider retraining with recent data.'::TEXT,
    3::INTEGER
  FROM public.ashen_jr_agents a
  WHERE a.accuracy_rating < 0.7 AND a.status = 'active'
  
  UNION ALL
  
  -- Agents that haven't been active recently
  SELECT 
    a.id,
    a.agent_name,
    'inactive'::TEXT,
    'Agent has been inactive for over 7 days. Consider pausing or updating.'::TEXT,
    2::INTEGER
  FROM public.ashen_jr_agents a
  WHERE a.last_active < NOW() - INTERVAL '7 days' AND a.status = 'active'
  
  UNION ALL
  
  -- Agents with high feedback scores that could be promoted
  SELECT 
    a.id,
    a.agent_name,
    'promote'::TEXT,
    'Agent has excellent performance. Consider expanding scope or promoting to core.'::TEXT,
    1::INTEGER
  FROM public.ashen_jr_agents a
  JOIN public.ashen_jr_performance p ON a.id = p.agent_id
  WHERE p.feedback_score > 4.5 AND a.status = 'active'
    AND p.metric_date > CURRENT_DATE - INTERVAL '30 days'
  
  ORDER BY priority DESC, agent_name;
END;
$$;

-- Insert sample Jr. agent templates
INSERT INTO public.ashen_jr_agents (
  agent_name, agent_goal, agent_scope, personality, knowledge_sources, 
  training_prompt, system_prompt, status
) VALUES 
(
  'Budget Hawk Jr.',
  'Monitor budget disbursement failures and identify financial irregularities',
  '{"regions": ["all"], "focus": "budget_analysis", "timeframe": "2020-2025"}',
  'professional',
  ARRAY['budget_data', 'complaints', 'financial_reports'],
  'Train an agent that tracks budget disbursement failures and identifies patterns of financial mismanagement across all regions.',
  'You are Budget Hawk Jr., a specialized civic AI focused on budget analysis and financial transparency. Your role is to monitor government budget disbursements, identify irregularities, and provide clear analysis of financial data. Be thorough, factual, and professional in your responses.',
  'training'
),
(
  'Promise Keeper Jr.',
  'Track political promises and measure fulfillment rates by politicians and parties',
  '{"regions": ["all"], "focus": "promise_tracking", "entities": ["politicians", "parties"]}',
  'neutral',
  ARRAY['promises', 'ratings', 'sentiment', 'elections'],
  'Create an agent that monitors political promises made during campaigns and tracks their fulfillment over time.',
  'You are Promise Keeper Jr., a civic AI dedicated to tracking political promises and their fulfillment. Your mission is to provide factual, unbiased analysis of campaign promises versus actual delivery. Be precise and evidence-based in your assessments.',
  'training'
),
(
  'Youth Engagement Jr.',
  'Answer youth electoral questions and promote civic participation among young voters',
  '{"regions": ["all"], "focus": "youth_engagement", "age_group": "18-35"}',
  'youth_friendly',
  ARRAY['elections', 'voter_registration', 'civic_education'],
  'Train an agent specifically designed to engage with young voters, answer their questions about the electoral process, and encourage civic participation.',
  'You are Youth Engagement Jr., a friendly civic AI designed to connect with young voters aged 18-35. Use accessible language, be encouraging about civic participation, and provide clear, helpful information about voting and elections. Be enthusiastic but informative.',
  'training'
);

COMMENT ON TABLE public.ashen_jr_agents IS 'Specialized AI sub-agents trained for specific civic tasks';
COMMENT ON TABLE public.ashen_jr_training_sessions IS 'Training sessions and logs for Jr. agents';
COMMENT ON TABLE public.ashen_jr_interactions IS 'Interactions between Jr. agents and users';
COMMENT ON TABLE public.ashen_jr_performance IS 'Performance metrics and analytics for Jr. agents';
COMMENT ON TABLE public.ashen_jr_knowledge IS 'Knowledge base and learning data for Jr. agents';