-- Create missing camerpulse_intelligence_learning_logs table
CREATE TABLE public.camerpulse_intelligence_learning_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  learning_type TEXT NOT NULL,
  interaction_data JSONB DEFAULT '{}',
  feedback_score NUMERIC(3,2),
  response_quality TEXT CHECK (response_quality IN ('excellent', 'good', 'fair', 'poor')),
  processing_time_ms INTEGER,
  model_version TEXT,
  context_relevance NUMERIC(3,2),
  user_satisfaction NUMERIC(3,2),
  improvement_suggestions TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.camerpulse_intelligence_learning_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own learning logs" 
ON public.camerpulse_intelligence_learning_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning logs" 
ON public.camerpulse_intelligence_learning_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning logs" 
ON public.camerpulse_intelligence_learning_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_intelligence_learning_logs_updated_at
BEFORE UPDATE ON public.camerpulse_intelligence_learning_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_intelligence_learning_logs_user_id ON public.camerpulse_intelligence_learning_logs(user_id);
CREATE INDEX idx_intelligence_learning_logs_session_id ON public.camerpulse_intelligence_learning_logs(session_id);
CREATE INDEX idx_intelligence_learning_logs_learning_type ON public.camerpulse_intelligence_learning_logs(learning_type);
CREATE INDEX idx_intelligence_learning_logs_created_at ON public.camerpulse_intelligence_learning_logs(created_at);