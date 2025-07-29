-- Create political parties table
CREATE TABLE public.political_parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  acronym TEXT,
  logo_url TEXT,
  founding_date DATE,
  headquarters_city TEXT,
  headquarters_region TEXT,
  official_website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  party_president TEXT,
  vice_president TEXT,
  secretary_general TEXT,
  treasurer TEXT,
  mps_count INTEGER DEFAULT 0,
  senators_count INTEGER DEFAULT 0,
  mayors_count INTEGER DEFAULT 0,
  mission TEXT,
  vision TEXT,
  ideology TEXT,
  political_leaning TEXT,
  historical_promises TEXT[],
  promises_fulfilled INTEGER DEFAULT 0,
  promises_failed INTEGER DEFAULT 0,
  promises_ongoing INTEGER DEFAULT 0,
  approval_rating NUMERIC DEFAULT 0,
  transparency_rating NUMERIC DEFAULT 0,
  development_rating NUMERIC DEFAULT 0,
  trust_rating NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  founded_by TEXT[],
  key_milestones JSONB,
  media_gallery TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create party ratings table
CREATE TABLE public.party_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  approval_rating INTEGER CHECK (approval_rating >= 1 AND approval_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  development_rating INTEGER CHECK (development_rating >= 1 AND development_rating <= 5),
  trust_rating INTEGER CHECK (trust_rating >= 1 AND trust_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for political parties (publicly viewable)
CREATE POLICY "Political parties are viewable by everyone" 
ON public.political_parties 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage political parties" 
ON public.political_parties 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create policies for party ratings
CREATE POLICY "Party ratings are viewable by everyone" 
ON public.party_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own party ratings" 
ON public.party_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own party ratings" 
ON public.party_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own party ratings" 
ON public.party_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_political_parties_updated_at
BEFORE UPDATE ON public.political_parties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_party_ratings_updated_at
BEFORE UPDATE ON public.party_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some demo political parties
INSERT INTO public.political_parties (
  name, acronym, founding_date, headquarters_city, headquarters_region,
  party_president, ideology, political_leaning, mission, vision,
  mps_count, senators_count, mayors_count, is_active
) VALUES 
(
  'Rassemblement Démocratique du Peuple Camerounais',
  'RDPC',
  '1985-03-24',
  'Yaoundé',
  'Centre',
  'Paul BIYA',
  'Democratic Centralism',
  'Center-Right',
  'To promote unity, progress and democracy in Cameroon',
  'A united, prosperous and democratic Cameroon',
  152, 63, 230, true
),
(
  'Social Democratic Front',
  'SDF',
  '1990-05-26',
  'Bamenda',
  'North-West',
  'Joshua OSIH',
  'Social Democracy',
  'Center-Left',
  'To establish a true democratic society based on social justice',
  'A federal, democratic and prosperous Cameroon',
  18, 7, 45, true
),
(
  'Mouvement pour la Renaissance du Cameroun',
  'MRC',
  '2012-10-14',
  'Yaoundé',
  'Centre',
  'Maurice KAMTO',
  'Liberal Democracy',
  'Center',
  'To bring about the renaissance of Cameroon through good governance',
  'An emerging, democratic and united Cameroon',
  5, 2, 12, true
),
(
  'Union Démocratique du Cameroun',
  'UDC',
  '1991-03-26',
  'Douala',
  'Littoral',
  'Adamou Ndam NJOYA',
  'Liberal Democracy',
  'Center',
  'To promote democratic values and national unity',
  'A democratic and prosperous Cameroon',
  4, 1, 8, true
),
(
  'Union Nationale pour la Démocratie et le Progrès',
  'UNDP',
  '1991-03-25',
  'Douala',
  'Littoral',
  'Maigari BELLO BOUBA',
  'Social Democracy',
  'Center-Left',
  'To build a democratic and progressive society',
  'A united, democratic and developed Cameroon',
  7, 3, 15, true
);