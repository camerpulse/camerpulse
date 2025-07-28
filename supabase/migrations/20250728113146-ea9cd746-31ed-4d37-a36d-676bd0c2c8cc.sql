-- Create label templates table
CREATE TABLE public.label_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'shipping',
  dimensions JSONB NOT NULL DEFAULT '{"width": 100, "height": 60}',
  fields JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for label templates
CREATE POLICY "Users can view their own templates" 
ON public.label_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.label_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.label_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.label_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create print history table
CREATE TABLE public.print_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.label_templates(id),
  label_data JSONB NOT NULL DEFAULT '{}',
  print_settings JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'completed',
  error_message TEXT,
  printed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.print_history ENABLE ROW LEVEL SECURITY;

-- Create policies for print history
CREATE POLICY "Users can view their own print history" 
ON public.print_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own print records" 
ON public.print_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create scan logs table
CREATE TABLE public.scan_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  scan_type TEXT NOT NULL DEFAULT 'qr_code',
  scan_data TEXT NOT NULL,
  scan_result JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for scan logs
CREATE POLICY "Users can view their own scan logs" 
ON public.scan_logs 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create scan logs" 
ON public.scan_logs 
FOR INSERT 
WITH CHECK (true);

-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_label_templates_updated_at
BEFORE UPDATE ON public.label_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for label assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('label-assets', 'label-assets', true);

-- Create storage policies for label assets
CREATE POLICY "Users can upload their own label assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'label-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own label assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'label-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own label assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'label-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own label assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'label-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create profile auto-creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();