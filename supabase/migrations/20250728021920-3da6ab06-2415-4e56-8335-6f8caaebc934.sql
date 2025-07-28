-- Create notification workflows table
CREATE TABLE IF NOT EXISTS public.notification_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- event, schedule, manual, condition
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  escalation_rules JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow executions table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.notification_workflows(id) ON DELETE CASCADE,
  trigger_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, escalated
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  execution_log JSONB DEFAULT '[]'::jsonb,
  escalation_level INTEGER DEFAULT 0,
  next_escalation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow conditions table
CREATE TABLE IF NOT EXISTS public.workflow_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.notification_workflows(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL, -- user_property, time_based, event_count, custom
  field_name TEXT NOT NULL,
  operator TEXT NOT NULL, -- equals, not_equals, greater_than, less_than, contains, in, not_in
  value JSONB NOT NULL,
  logical_operator TEXT DEFAULT 'AND', -- AND, OR
  condition_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow routing rules table
CREATE TABLE IF NOT EXISTS public.workflow_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.notification_workflows(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_channels JSONB NOT NULL DEFAULT '[]'::jsonb, -- email, sms, push, in_app
  target_users JSONB DEFAULT '[]'::jsonb,
  target_groups JSONB DEFAULT '[]'::jsonb,
  priority INTEGER DEFAULT 1,
  delay_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create escalation history table
CREATE TABLE IF NOT EXISTS public.escalation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL,
  escalated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  escalated_to JSONB NOT NULL DEFAULT '[]'::jsonb,
  escalation_reason TEXT,
  response_deadline TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_workflows
CREATE POLICY "Users can manage their workflows" ON public.notification_workflows
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all workflows" ON public.notification_workflows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view executions of their workflows" ON public.workflow_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notification_workflows nw
      WHERE nw.id = workflow_executions.workflow_id 
      AND nw.created_by = auth.uid()
    )
  );

CREATE POLICY "System can manage workflow executions" ON public.workflow_executions
  FOR ALL USING (true);

-- RLS Policies for workflow_conditions
CREATE POLICY "Users can manage conditions for their workflows" ON public.workflow_conditions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notification_workflows nw
      WHERE nw.id = workflow_conditions.workflow_id 
      AND nw.created_by = auth.uid()
    )
  );

-- RLS Policies for workflow_routing_rules
CREATE POLICY "Users can manage routing rules for their workflows" ON public.workflow_routing_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notification_workflows nw
      WHERE nw.id = workflow_routing_rules.workflow_id 
      AND nw.created_by = auth.uid()
    )
  );

-- RLS Policies for escalation_history
CREATE POLICY "Users can view escalation history for their workflows" ON public.escalation_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflow_executions we
      JOIN notification_workflows nw ON we.workflow_id = nw.id
      WHERE we.id = escalation_history.execution_id 
      AND nw.created_by = auth.uid()
    )
  );

CREATE POLICY "System can manage escalation history" ON public.escalation_history
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_workflows_trigger_type ON public.notification_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_notification_workflows_active ON public.notification_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_next_escalation ON public.workflow_executions(next_escalation_at);
CREATE INDEX IF NOT EXISTS idx_workflow_conditions_workflow_id ON public.workflow_conditions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_routing_rules_workflow_id ON public.workflow_routing_rules(workflow_id);
CREATE INDEX IF NOT EXISTS idx_escalation_history_execution_id ON public.escalation_history(execution_id);

-- Function to evaluate workflow conditions
CREATE OR REPLACE FUNCTION public.evaluate_workflow_conditions(
  p_workflow_id UUID,
  p_context_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  condition_record RECORD;
  result BOOLEAN := true;
  current_result BOOLEAN;
  logical_op TEXT := 'AND';
BEGIN
  FOR condition_record IN 
    SELECT * FROM public.workflow_conditions 
    WHERE workflow_id = p_workflow_id AND is_active = true
    ORDER BY condition_order
  LOOP
    -- Evaluate individual condition
    current_result := CASE condition_record.operator
      WHEN 'equals' THEN 
        (p_context_data->>condition_record.field_name) = (condition_record.value->>0)
      WHEN 'not_equals' THEN 
        (p_context_data->>condition_record.field_name) != (condition_record.value->>0)
      WHEN 'greater_than' THEN 
        (p_context_data->>condition_record.field_name)::numeric > (condition_record.value->>0)::numeric
      WHEN 'less_than' THEN 
        (p_context_data->>condition_record.field_name)::numeric < (condition_record.value->>0)::numeric
      WHEN 'contains' THEN 
        (p_context_data->>condition_record.field_name) ILIKE '%' || (condition_record.value->>0) || '%'
      WHEN 'in' THEN 
        (p_context_data->>condition_record.field_name) = ANY(SELECT jsonb_array_elements_text(condition_record.value))
      ELSE false
    END;
    
    -- Apply logical operator
    IF logical_op = 'AND' THEN
      result := result AND current_result;
    ELSE
      result := result OR current_result;
    END IF;
    
    logical_op := condition_record.logical_operator;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Function to execute workflow
CREATE OR REPLACE FUNCTION public.execute_workflow(
  p_workflow_id UUID,
  p_trigger_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workflow_record RECORD;
  execution_id UUID;
  conditions_met BOOLEAN;
  action_record JSONB;
  routing_rule RECORD;
BEGIN
  -- Get workflow details
  SELECT * INTO workflow_record 
  FROM public.notification_workflows 
  WHERE id = p_workflow_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow not found or inactive';
  END IF;
  
  -- Create execution record
  INSERT INTO public.workflow_executions (
    workflow_id, trigger_data, status
  ) VALUES (
    p_workflow_id, p_trigger_data, 'running'
  ) RETURNING id INTO execution_id;
  
  -- Evaluate conditions
  conditions_met := public.evaluate_workflow_conditions(p_workflow_id, p_trigger_data);
  
  IF NOT conditions_met THEN
    UPDATE public.workflow_executions 
    SET status = 'completed', completed_at = now(),
        execution_log = execution_log || jsonb_build_array(
          jsonb_build_object(
            'timestamp', now(),
            'action', 'conditions_not_met',
            'result', 'skipped'
          )
        )
    WHERE id = execution_id;
    RETURN execution_id;
  END IF;
  
  -- Execute routing rules
  FOR routing_rule IN 
    SELECT * FROM public.workflow_routing_rules 
    WHERE workflow_id = p_workflow_id AND is_active = true
    ORDER BY priority
  LOOP
    -- Process routing rule (simplified - would need more complex logic)
    UPDATE public.workflow_executions 
    SET execution_log = execution_log || jsonb_build_array(
      jsonb_build_object(
        'timestamp', now(),
        'action', 'routing_rule_executed',
        'rule_name', routing_rule.rule_name,
        'target_channels', routing_rule.target_channels
      )
    )
    WHERE id = execution_id;
  END LOOP;
  
  -- Set escalation timer if configured
  IF jsonb_array_length(workflow_record.escalation_rules) > 0 THEN
    UPDATE public.workflow_executions 
    SET next_escalation_at = now() + INTERVAL '1 hour' -- Default escalation time
    WHERE id = execution_id;
  END IF;
  
  -- Mark as completed
  UPDATE public.workflow_executions 
  SET status = 'completed', completed_at = now()
  WHERE id = execution_id;
  
  RETURN execution_id;
END;
$$;

-- Function to process escalations
CREATE OR REPLACE FUNCTION public.process_escalations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  execution_record RECORD;
  workflow_record RECORD;
  escalation_rule JSONB;
BEGIN
  FOR execution_record IN 
    SELECT * FROM public.workflow_executions 
    WHERE status = 'completed' 
    AND next_escalation_at IS NOT NULL 
    AND next_escalation_at <= now()
  LOOP
    -- Get workflow details
    SELECT * INTO workflow_record 
    FROM public.notification_workflows 
    WHERE id = execution_record.workflow_id;
    
    -- Process escalation rules
    IF jsonb_array_length(workflow_record.escalation_rules) > execution_record.escalation_level THEN
      escalation_rule := workflow_record.escalation_rules->execution_record.escalation_level;
      
      -- Create escalation history
      INSERT INTO public.escalation_history (
        execution_id, escalation_level, escalation_reason,
        escalated_to, response_deadline
      ) VALUES (
        execution_record.id, 
        execution_record.escalation_level + 1,
        'Automatic escalation - no response within time limit',
        escalation_rule->'escalated_to',
        now() + (escalation_rule->>'timeout_hours')::interval
      );
      
      -- Update execution
      UPDATE public.workflow_executions 
      SET 
        status = 'escalated',
        escalation_level = escalation_level + 1,
        next_escalation_at = CASE 
          WHEN escalation_level + 1 < jsonb_array_length(workflow_record.escalation_rules)
          THEN now() + (escalation_rule->>'timeout_hours')::interval
          ELSE NULL
        END
      WHERE id = execution_record.id;
    END IF;
  END LOOP;
END;
$$;