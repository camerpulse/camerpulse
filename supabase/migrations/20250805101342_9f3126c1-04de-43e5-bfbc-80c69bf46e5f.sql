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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraints for signatures
CREATE UNIQUE INDEX petition_signatures_user_unique 
ON public.petition_signatures(petition_id, user_id) 
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX petition_signatures_email_unique 
ON public.petition_signatures(petition_id, email) 
WHERE email IS NOT NULL;

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