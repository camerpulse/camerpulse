-- Create petitions table
CREATE TABLE public.petitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  petition_text TEXT NOT NULL,
  target_recipients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  goal_signatures INTEGER NOT NULL DEFAULT 1000,
  current_signatures INTEGER NOT NULL DEFAULT 0,
  creator_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  region TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  deadline_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create petition signatures table
CREATE TABLE public.petition_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT,
  location TEXT,
  comment TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(petition_id, user_id),
  UNIQUE(petition_id, email) WHERE email IS NOT NULL
);

-- Create petition updates table
CREATE TABLE public.petition_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT NOT NULL DEFAULT 'general' CHECK (update_type IN ('general', 'milestone', 'response', 'victory')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create petition comments table
CREATE TABLE public.petition_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.petition_comments(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for petitions
CREATE POLICY "Petitions are viewable by everyone" 
ON public.petitions 
FOR SELECT 
USING (status = 'active' OR creator_id = auth.uid());

CREATE POLICY "Users can create petitions" 
ON public.petitions 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their petitions" 
ON public.petitions 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Admins can manage all petitions" 
ON public.petitions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- RLS Policies for signatures
CREATE POLICY "Signatures are viewable by everyone" 
ON public.petition_signatures 
FOR SELECT 
USING (true);

CREATE POLICY "Users can sign petitions" 
ON public.petition_signatures 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  (user_id IS NULL AND email IS NOT NULL)
);

CREATE POLICY "Users can update their signatures" 
ON public.petition_signatures 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for updates
CREATE POLICY "Updates are viewable by everyone" 
ON public.petition_updates 
FOR SELECT 
USING (true);

CREATE POLICY "Petition creators can create updates" 
ON public.petition_updates 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.petitions 
    WHERE id = petition_id AND creator_id = auth.uid()
  )
);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.petition_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can comment" 
ON public.petition_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their comments" 
ON public.petition_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments" 
ON public.petition_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update signature count
CREATE OR REPLACE FUNCTION public.update_petition_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.petitions 
    SET current_signatures = current_signatures + 1
    WHERE id = NEW.petition_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.petitions 
    SET current_signatures = current_signatures - 1
    WHERE id = OLD.petition_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for signature count
CREATE TRIGGER update_petition_signatures_trigger
  AFTER INSERT OR DELETE ON public.petition_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_petition_signature_count();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_petition_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamps
CREATE TRIGGER update_petitions_updated_at
  BEFORE UPDATE ON public.petitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_petition_timestamps();

CREATE TRIGGER update_petition_comments_updated_at
  BEFORE UPDATE ON public.petition_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_petition_timestamps();

-- Insert sample data
INSERT INTO public.petitions (
  title, description, petition_text, target_recipients, goal_signatures,
  creator_id, category, region, status, featured
) VALUES 
(
  'Improve Road Infrastructure in Douala',
  'A petition to demand better road conditions and infrastructure development in Douala city',
  'We, the residents of Douala, petition the government to prioritize road infrastructure development in our city. The current state of roads is affecting our daily lives, business activities, and overall quality of life.',
  ARRAY['Minister of Public Works', 'Governor of Littoral Region', 'Mayor of Douala'],
  5000,
  '00000000-0000-0000-0000-000000000001',
  'infrastructure',
  'Littoral',
  'active',
  true
),
(
  'Enhanced Healthcare Access for Rural Communities',
  'Petition for improved healthcare facilities and services in rural areas of Cameroon',
  'Rural communities across Cameroon lack adequate healthcare infrastructure. We petition for increased investment in rural healthcare, including mobile clinics, trained medical personnel, and essential medical supplies.',
  ARRAY['Minister of Health', 'Regional Health Delegates'],
  10000,
  '00000000-0000-0000-0000-000000000002',
  'healthcare',
  'All Regions',
  'active',
  true
);