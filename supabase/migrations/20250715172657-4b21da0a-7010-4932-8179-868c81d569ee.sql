-- Create manual_fixes table to store admin code fixes
CREATE TABLE IF NOT EXISTS public.manual_fixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.camerpulse_activity_timeline(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  original_file_path TEXT,
  original_code_snapshot TEXT,
  fix_code TEXT NOT NULL,
  fix_mode TEXT NOT NULL CHECK (fix_mode IN ('patch', 'override', 'test')),
  fix_reason TEXT,
  fix_status TEXT NOT NULL DEFAULT 'pending' CHECK (fix_status IN ('pending', 'applied', 'rolled_back', 'failed')),
  applied_at TIMESTAMP WITH TIME ZONE,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  rollback_reason TEXT,
  syntax_validation JSONB DEFAULT '{}',
  error_prediction JSONB DEFAULT '{}',
  ai_suggestions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_fixes ENABLE ROW LEVEL SECURITY;

-- Create policies for manual_fixes
CREATE POLICY "Admins can manage manual fixes" 
ON public.manual_fixes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create manual_fix_history table for audit trail
CREATE TABLE IF NOT EXISTS public.manual_fix_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manual_fix_id UUID NOT NULL REFERENCES public.manual_fixes(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'applied', 'rolled_back', 'edited', 'deleted')),
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  change_details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_fix_history ENABLE ROW LEVEL SECURITY;

-- Create policies for manual_fix_history
CREATE POLICY "Admins can view fix history" 
ON public.manual_fix_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_manual_fixes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_manual_fixes_updated_at
  BEFORE UPDATE ON public.manual_fixes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_manual_fixes_updated_at();

-- Create function to log manual fix changes
CREATE OR REPLACE FUNCTION public.log_manual_fix_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.manual_fix_history (
      manual_fix_id, 
      action_type, 
      admin_id, 
      admin_name,
      new_status,
      change_details
    ) VALUES (
      NEW.id,
      'created',
      NEW.admin_id,
      NEW.admin_name,
      NEW.fix_status,
      jsonb_build_object('fix_mode', NEW.fix_mode, 'reason', NEW.fix_reason)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.manual_fix_history (
      manual_fix_id,
      action_type,
      admin_id,
      admin_name,
      previous_status,
      new_status,
      change_details
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.fix_status = 'applied' AND OLD.fix_status != 'applied' THEN 'applied'
        WHEN NEW.fix_status = 'rolled_back' AND OLD.fix_status != 'rolled_back' THEN 'rolled_back'
        ELSE 'edited'
      END,
      NEW.admin_id,
      NEW.admin_name,
      OLD.fix_status,
      NEW.fix_status,
      jsonb_build_object(
        'old_code', OLD.fix_code,
        'new_code', NEW.fix_code,
        'rollback_reason', NEW.rollback_reason
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.manual_fix_history (
      manual_fix_id,
      action_type,
      admin_id,
      admin_name,
      previous_status,
      change_details
    ) VALUES (
      OLD.id,
      'deleted',
      OLD.admin_id,
      OLD.admin_name,
      OLD.fix_status,
      jsonb_build_object('deleted_at', now())
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging changes
CREATE TRIGGER log_manual_fix_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.manual_fixes
  FOR EACH ROW
  EXECUTE FUNCTION public.log_manual_fix_change();

-- Create indexes for better performance
CREATE INDEX idx_manual_fixes_activity_id ON public.manual_fixes(activity_id);
CREATE INDEX idx_manual_fixes_admin_id ON public.manual_fixes(admin_id);
CREATE INDEX idx_manual_fixes_status ON public.manual_fixes(fix_status);
CREATE INDEX idx_manual_fixes_created_at ON public.manual_fixes(created_at DESC);
CREATE INDEX idx_manual_fix_history_manual_fix_id ON public.manual_fix_history(manual_fix_id);
CREATE INDEX idx_manual_fix_history_timestamp ON public.manual_fix_history(timestamp DESC);