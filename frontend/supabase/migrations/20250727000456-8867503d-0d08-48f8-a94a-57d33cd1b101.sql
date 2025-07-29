-- Audio/Video Oral Tradition Recording
CREATE TABLE IF NOT EXISTS public.oral_traditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tradition_type TEXT NOT NULL DEFAULT 'story', -- story, song, prayer, proverb, history
  language TEXT NOT NULL DEFAULT 'French',
  audio_url TEXT,
  video_url TEXT,
  transcript TEXT,
  duration_seconds INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  elder_name TEXT,
  elder_age INTEGER,
  cultural_significance TEXT,
  keywords TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT true,
  preservation_priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  verification_status TEXT DEFAULT 'pending', -- pending, verified, flagged
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Traditional Recipe Sharing
CREATE TABLE IF NOT EXISTS public.traditional_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  user_id UUID NOT NULL,
  recipe_name TEXT NOT NULL,
  description TEXT,
  origin_story TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  cooking_time_minutes INTEGER,
  serving_size INTEGER,
  difficulty_level TEXT DEFAULT 'medium', -- easy, medium, hard
  occasion TEXT[], -- wedding, funeral, festival, daily, etc.
  season TEXT[], -- dry, rainy, harmattan
  cultural_significance TEXT,
  family_lineage TEXT, -- which family/clan recipe comes from
  recipe_photos TEXT[],
  video_url TEXT,
  nutritional_notes TEXT,
  modern_adaptations TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_sacred BOOLEAN DEFAULT false, -- some recipes might be sacred/restricted
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ceremonial Calendar Tracking
CREATE TABLE IF NOT EXISTS public.ceremonial_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  user_id UUID NOT NULL,
  ceremony_name TEXT NOT NULL,
  description TEXT,
  ceremony_type TEXT NOT NULL, -- traditional, religious, seasonal, lifecycle
  event_date DATE,
  is_annual BOOLEAN DEFAULT true,
  lunar_calendar_based BOOLEAN DEFAULT false,
  duration_days INTEGER DEFAULT 1,
  preparation_days INTEGER DEFAULT 0,
  location TEXT,
  required_materials JSONB DEFAULT '[]'::jsonb,
  ritual_steps JSONB DEFAULT '[]'::jsonb,
  participants_roles JSONB DEFAULT '[]'::jsonb,
  cultural_significance TEXT,
  historical_notes TEXT,
  modern_adaptations TEXT,
  photos TEXT[],
  videos TEXT[],
  audio_recordings TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_sacred BOOLEAN DEFAULT false,
  access_restrictions TEXT, -- who can participate/view
  status TEXT DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
  attendance_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Language Preservation Tools
CREATE TABLE IF NOT EXISTS public.language_preservation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  user_id UUID NOT NULL,
  language_name TEXT NOT NULL,
  language_code TEXT, -- ISO language code if available
  entry_type TEXT NOT NULL, -- word, phrase, story, song, proverb
  local_term TEXT NOT NULL,
  pronunciation TEXT, -- phonetic transcription
  audio_pronunciation TEXT, -- audio file URL
  french_translation TEXT,
  english_translation TEXT,
  context_usage TEXT, -- when/how it's used
  grammatical_notes TEXT,
  cultural_context TEXT,
  example_sentences JSONB DEFAULT '[]'::jsonb,
  related_terms TEXT[],
  etymology TEXT, -- word origin/history
  difficulty_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  category TEXT, -- greetings, family, nature, food, etc.
  is_endangered BOOLEAN DEFAULT false,
  speaker_generation TEXT, -- elderly, middle-aged, young, children
  contributor_name TEXT,
  contributor_role TEXT, -- elder, teacher, native speaker
  verification_status TEXT DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  practice_count INTEGER DEFAULT 0, -- how many times people practiced this
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recipe ratings and reviews
CREATE TABLE IF NOT EXISTS public.recipe_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.traditional_recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  tried_recipe BOOLEAN DEFAULT true,
  modifications_made TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Language learning progress tracking
CREATE TABLE IF NOT EXISTS public.language_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  village_id UUID NOT NULL,
  language_name TEXT NOT NULL,
  entry_id UUID NOT NULL REFERENCES public.language_preservation(id) ON DELETE CASCADE,
  mastery_level TEXT DEFAULT 'learning', -- learning, practicing, mastered
  last_practiced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  practice_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_id)
);

-- Enable RLS
ALTER TABLE public.oral_traditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traditional_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceremonial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_preservation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Oral Traditions
CREATE POLICY "Public can view published oral traditions" 
ON public.oral_traditions FOR SELECT 
USING (is_public = true AND verification_status = 'verified');

CREATE POLICY "Users can create oral traditions" 
ON public.oral_traditions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oral traditions" 
ON public.oral_traditions FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for Traditional Recipes
CREATE POLICY "Public can view public recipes" 
ON public.traditional_recipes FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create recipes" 
ON public.traditional_recipes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" 
ON public.traditional_recipes FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for Ceremonial Events
CREATE POLICY "Public can view public ceremonial events" 
ON public.ceremonial_events FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create ceremonial events" 
ON public.ceremonial_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ceremonial events" 
ON public.ceremonial_events FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for Language Preservation
CREATE POLICY "Public can view language preservation entries" 
ON public.language_preservation FOR SELECT 
USING (verification_status = 'verified');

CREATE POLICY "Users can create language entries" 
ON public.language_preservation FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own language entries" 
ON public.language_preservation FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for Recipe Reviews
CREATE POLICY "Public can view recipe reviews" 
ON public.recipe_reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create recipe reviews" 
ON public.recipe_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.recipe_reviews FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for Language Learning Progress
CREATE POLICY "Users can manage their learning progress" 
ON public.language_learning_progress FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_oral_traditions_village_id ON public.oral_traditions(village_id);
CREATE INDEX idx_oral_traditions_user_id ON public.oral_traditions(user_id);
CREATE INDEX idx_oral_traditions_language ON public.oral_traditions(language);
CREATE INDEX idx_oral_traditions_tradition_type ON public.oral_traditions(tradition_type);

CREATE INDEX idx_traditional_recipes_village_id ON public.traditional_recipes(village_id);
CREATE INDEX idx_traditional_recipes_user_id ON public.traditional_recipes(user_id);
CREATE INDEX idx_traditional_recipes_occasion ON public.traditional_recipes USING GIN(occasion);

CREATE INDEX idx_ceremonial_events_village_id ON public.ceremonial_events(village_id);
CREATE INDEX idx_ceremonial_events_event_date ON public.ceremonial_events(event_date);
CREATE INDEX idx_ceremonial_events_ceremony_type ON public.ceremonial_events(ceremony_type);

CREATE INDEX idx_language_preservation_village_id ON public.language_preservation(village_id);
CREATE INDEX idx_language_preservation_language_name ON public.language_preservation(language_name);
CREATE INDEX idx_language_preservation_entry_type ON public.language_preservation(entry_type);
CREATE INDEX idx_language_preservation_category ON public.language_preservation(category);

-- Update triggers for timestamps
CREATE TRIGGER update_oral_traditions_updated_at
  BEFORE UPDATE ON public.oral_traditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_traditional_recipes_updated_at
  BEFORE UPDATE ON public.traditional_recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ceremonial_events_updated_at
  BEFORE UPDATE ON public.ceremonial_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_language_preservation_updated_at
  BEFORE UPDATE ON public.language_preservation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_language_learning_progress_updated_at
  BEFORE UPDATE ON public.language_learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();