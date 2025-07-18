-- Create Villages Directory System

-- Villages table for basic village information
CREATE TABLE public.villages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_name TEXT NOT NULL,
    region TEXT NOT NULL,
    division TEXT NOT NULL,
    subdivision TEXT NOT NULL,
    year_founded INTEGER,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    traditional_languages TEXT[],
    ethnic_groups TEXT[],
    totem_symbol TEXT,
    population_estimate INTEGER,
    village_motto TEXT,
    founding_story TEXT,
    migration_legend TEXT,
    notable_events TEXT,
    oral_traditions TEXT,
    overall_rating DECIMAL(3, 2) DEFAULT 0.0,
    infrastructure_score INTEGER DEFAULT 0,
    education_score INTEGER DEFAULT 0,
    health_score INTEGER DEFAULT 0,
    peace_security_score INTEGER DEFAULT 0,
    economic_activity_score INTEGER DEFAULT 0,
    governance_score INTEGER DEFAULT 0,
    social_spirit_score INTEGER DEFAULT 0,
    diaspora_engagement_score INTEGER DEFAULT 0,
    civic_participation_score INTEGER DEFAULT 0,
    achievements_score INTEGER DEFAULT 0,
    total_ratings_count INTEGER DEFAULT 0,
    sons_daughters_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    whatsapp_link TEXT,
    facebook_link TEXT,
    community_chat_link TEXT
);

-- Village leaders table
CREATE TABLE public.village_leaders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    leader_type TEXT NOT NULL CHECK (leader_type IN ('chief', 'don', 'elder', 'council_member')),
    leader_name TEXT NOT NULL,
    photo_url TEXT,
    years_in_power INTEGER,
    start_year INTEGER,
    end_year INTEGER,
    is_current BOOLEAN DEFAULT TRUE,
    integrity_rating DECIMAL(3, 2) DEFAULT 0.0,
    accessibility_rating DECIMAL(3, 2) DEFAULT 0.0,
    development_rating DECIMAL(3, 2) DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    bio TEXT,
    achievements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Village infrastructure/projects table
CREATE TABLE public.village_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    project_name TEXT NOT NULL,
    project_type TEXT NOT NULL CHECK (project_type IN ('school', 'health_center', 'borehole', 'road', 'bridge', 'market', 'church', 'mosque', 'community_hall', 'pharmacy', 'other')),
    description TEXT,
    year_started INTEGER,
    year_completed INTEGER,
    project_status TEXT NOT NULL CHECK (project_status IN ('completed', 'ongoing', 'abandoned', 'planned')),
    funding_source TEXT,
    funding_amount BIGINT,
    photos TEXT[],
    reports_urls TEXT[],
    community_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

-- Village billionaires table
CREATE TABLE public.village_billionaires (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    billionaire_name TEXT NOT NULL,
    photo_url TEXT,
    estimated_net_worth_fcfa BIGINT,
    estimated_net_worth_usd BIGINT,
    main_sector TEXT,
    country_residence TEXT,
    known_donations TEXT,
    business_profile_link TEXT,
    social_media_links JSONB DEFAULT '{}',
    village_contributions TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

-- Village celebrities table
CREATE TABLE public.village_celebrities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    celebrity_name TEXT NOT NULL,
    photo_url TEXT,
    profession TEXT CHECK (profession IN ('actor', 'footballer', 'musician', 'influencer', 'politician', 'athlete', 'writer', 'artist', 'other')),
    highlights TEXT,
    awards TEXT[],
    social_media_links JSONB DEFAULT '{}',
    village_support_activities TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

-- Village development associations table
CREATE TABLE public.village_development_associations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    association_name TEXT NOT NULL,
    chairperson_name TEXT,
    secretary_name TEXT,
    treasurer_name TEXT,
    diaspora_wings TEXT[],
    registration_status TEXT CHECK (registration_status IN ('registered', 'pending', 'unregistered')),
    activities TEXT,
    achievements TEXT,
    contact_info JSONB DEFAULT '{}',
    bank_details JSONB DEFAULT '{}',
    momo_details JSONB DEFAULT '{}',
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

-- Village petitions table
CREATE TABLE public.village_petitions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    petition_title TEXT NOT NULL,
    petition_body TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    signatures_count INTEGER DEFAULT 0,
    petition_status TEXT NOT NULL CHECK (petition_status IN ('active', 'resolved', 'failed', 'closed')) DEFAULT 'active',
    resolution_details TEXT,
    documents_urls TEXT[],
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL
);

-- Village conflicts table
CREATE TABLE public.village_conflicts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    conflict_name TEXT NOT NULL,
    conflict_type TEXT NOT NULL,
    description TEXT NOT NULL,
    timeline_start DATE,
    timeline_end DATE,
    stakeholders TEXT[],
    current_status TEXT CHECK (current_status IN ('ongoing', 'resolved', 'escalated', 'mediation')) DEFAULT 'ongoing',
    resolution_details TEXT,
    evidence_documents TEXT[],
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID NOT NULL
);

-- Village contributions table
CREATE TABLE public.village_contributions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    contributor_name TEXT NOT NULL,
    contributor_type TEXT CHECK (contributor_type IN ('diaspora', 'philanthropist', 'elder', 'government', 'ngo', 'individual')),
    contribution_type TEXT CHECK (contribution_type IN ('financial', 'project', 'expertise', 'materials', 'land', 'other')),
    contribution_value BIGINT,
    contribution_description TEXT,
    project_sponsored TEXT,
    recognition_level TEXT CHECK (recognition_level IN ('bronze', 'silver', 'gold', 'platinum')),
    contribution_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

-- Village ratings table
CREATE TABLE public.village_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    user_id UUID NOT NULL,
    infrastructure_score INTEGER CHECK (infrastructure_score >= 0 AND infrastructure_score <= 20),
    education_score INTEGER CHECK (education_score >= 0 AND education_score <= 10),
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 10),
    peace_security_score INTEGER CHECK (peace_security_score >= 0 AND peace_security_score <= 10),
    economic_activity_score INTEGER CHECK (economic_activity_score >= 0 AND economic_activity_score <= 10),
    governance_score INTEGER CHECK (governance_score >= 0 AND governance_score <= 10),
    social_spirit_score INTEGER CHECK (social_spirit_score >= 0 AND social_spirit_score <= 10),
    diaspora_engagement_score INTEGER CHECK (diaspora_engagement_score >= 0 AND diaspora_engagement_score <= 10),
    civic_participation_score INTEGER CHECK (civic_participation_score >= 0 AND civic_participation_score <= 5),
    achievements_score INTEGER CHECK (achievements_score >= 0 AND achievements_score <= 5),
    overall_rating DECIMAL(3, 2),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(village_id, user_id)
);

-- Village photos table
CREATE TABLE public.village_photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    photo_url TEXT NOT NULL,
    photo_type TEXT CHECK (photo_type IN ('main', 'drone', 'infrastructure', 'event', 'historical', 'people')),
    caption TEXT,
    photographer_name TEXT,
    date_taken DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

-- Village memberships (users claiming to be from village)
CREATE TABLE public.village_memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    village_id UUID NOT NULL,
    user_id UUID NOT NULL,
    membership_type TEXT CHECK (membership_type IN ('son_daughter', 'resident', 'supporter', 'diaspora')) DEFAULT 'son_daughter',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(village_id, user_id)
);

-- Enable RLS
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_billionaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_development_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Villages - readable by everyone, editable by creators and admins
CREATE POLICY "Villages are viewable by everyone" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Users can create villages" ON public.villages FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their villages" ON public.villages FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all villages" ON public.villages FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village leaders - readable by everyone
CREATE POLICY "Village leaders are viewable by everyone" ON public.village_leaders FOR SELECT USING (true);
CREATE POLICY "Users can add village leaders" ON public.village_leaders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage village leaders" ON public.village_leaders FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village projects - readable by everyone
CREATE POLICY "Village projects are viewable by everyone" ON public.village_projects FOR SELECT USING (true);
CREATE POLICY "Users can add village projects" ON public.village_projects FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their projects" ON public.village_projects FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all projects" ON public.village_projects FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village billionaires - readable by everyone
CREATE POLICY "Village billionaires are viewable by everyone" ON public.village_billionaires FOR SELECT USING (true);
CREATE POLICY "Users can add billionaires" ON public.village_billionaires FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their submissions" ON public.village_billionaires FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage billionaires" ON public.village_billionaires FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village celebrities - readable by everyone
CREATE POLICY "Village celebrities are viewable by everyone" ON public.village_celebrities FOR SELECT USING (true);
CREATE POLICY "Users can add celebrities" ON public.village_celebrities FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their submissions" ON public.village_celebrities FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage celebrities" ON public.village_celebrities FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village development associations - readable by everyone
CREATE POLICY "Development associations are viewable by everyone" ON public.village_development_associations FOR SELECT USING (true);
CREATE POLICY "Users can add associations" ON public.village_development_associations FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their associations" ON public.village_development_associations FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage associations" ON public.village_development_associations FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village petitions - readable by everyone
CREATE POLICY "Village petitions are viewable by everyone" ON public.village_petitions FOR SELECT USING (true);
CREATE POLICY "Users can create petitions" ON public.village_petitions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their petitions" ON public.village_petitions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage petitions" ON public.village_petitions FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village conflicts - readable by everyone
CREATE POLICY "Village conflicts are viewable by everyone" ON public.village_conflicts FOR SELECT USING (true);
CREATE POLICY "Users can report conflicts" ON public.village_conflicts FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their conflicts" ON public.village_conflicts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage conflicts" ON public.village_conflicts FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village contributions - readable by everyone
CREATE POLICY "Village contributions are viewable by everyone" ON public.village_contributions FOR SELECT USING (true);
CREATE POLICY "Users can add contributions" ON public.village_contributions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their contributions" ON public.village_contributions FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage contributions" ON public.village_contributions FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village ratings - users can only rate once per village
CREATE POLICY "Village ratings are viewable by everyone" ON public.village_ratings FOR SELECT USING (true);
CREATE POLICY "Users can rate villages" ON public.village_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their ratings" ON public.village_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage ratings" ON public.village_ratings FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village photos - readable by everyone
CREATE POLICY "Village photos are viewable by everyone" ON public.village_photos FOR SELECT USING (true);
CREATE POLICY "Users can add photos" ON public.village_photos FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can manage photos" ON public.village_photos FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Village memberships - users can manage their own
CREATE POLICY "Village memberships are viewable by everyone" ON public.village_memberships FOR SELECT USING (true);
CREATE POLICY "Users can claim village membership" ON public.village_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their membership" ON public.village_memberships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage memberships" ON public.village_memberships FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Add foreign key constraints
ALTER TABLE public.village_leaders ADD CONSTRAINT village_leaders_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_projects ADD CONSTRAINT village_projects_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_billionaires ADD CONSTRAINT village_billionaires_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_celebrities ADD CONSTRAINT village_celebrities_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_development_associations ADD CONSTRAINT village_development_associations_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_petitions ADD CONSTRAINT village_petitions_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_conflicts ADD CONSTRAINT village_conflicts_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_contributions ADD CONSTRAINT village_contributions_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_ratings ADD CONSTRAINT village_ratings_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_photos ADD CONSTRAINT village_photos_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;
ALTER TABLE public.village_memberships ADD CONSTRAINT village_memberships_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE CASCADE;

-- Update functions for village ratings
CREATE OR REPLACE FUNCTION update_village_ratings()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.villages SET 
      infrastructure_score = (
        SELECT COALESCE(AVG(infrastructure_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      education_score = (
        SELECT COALESCE(AVG(education_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      health_score = (
        SELECT COALESCE(AVG(health_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      peace_security_score = (
        SELECT COALESCE(AVG(peace_security_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      economic_activity_score = (
        SELECT COALESCE(AVG(economic_activity_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      governance_score = (
        SELECT COALESCE(AVG(governance_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      social_spirit_score = (
        SELECT COALESCE(AVG(social_spirit_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      diaspora_engagement_score = (
        SELECT COALESCE(AVG(diaspora_engagement_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      civic_participation_score = (
        SELECT COALESCE(AVG(civic_participation_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      achievements_score = (
        SELECT COALESCE(AVG(achievements_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      overall_rating = (
        SELECT COALESCE(AVG(overall_rating), 0) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      total_ratings_count = (
        SELECT COUNT(*) 
        FROM public.village_ratings 
        WHERE village_id = NEW.village_id
      ),
      updated_at = now()
    WHERE id = NEW.village_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.villages SET 
      infrastructure_score = (
        SELECT COALESCE(AVG(infrastructure_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      education_score = (
        SELECT COALESCE(AVG(education_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      health_score = (
        SELECT COALESCE(AVG(health_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      peace_security_score = (
        SELECT COALESCE(AVG(peace_security_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      economic_activity_score = (
        SELECT COALESCE(AVG(economic_activity_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      governance_score = (
        SELECT COALESCE(AVG(governance_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      social_spirit_score = (
        SELECT COALESCE(AVG(social_spirit_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      diaspora_engagement_score = (
        SELECT COALESCE(AVG(diaspora_engagement_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      civic_participation_score = (
        SELECT COALESCE(AVG(civic_participation_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      achievements_score = (
        SELECT COALESCE(AVG(achievements_score), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      overall_rating = (
        SELECT COALESCE(AVG(overall_rating), 0) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      total_ratings_count = (
        SELECT COUNT(*) 
        FROM public.village_ratings 
        WHERE village_id = OLD.village_id
      ),
      updated_at = now()
    WHERE id = OLD.village_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for village ratings updates
CREATE TRIGGER update_village_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.village_ratings
  FOR EACH ROW EXECUTE FUNCTION update_village_ratings();

-- Update sons/daughters count from memberships
CREATE OR REPLACE FUNCTION update_village_membership_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.villages SET 
      sons_daughters_count = (
        SELECT COUNT(*) 
        FROM public.village_memberships 
        WHERE village_id = NEW.village_id
      ),
      updated_at = now()
    WHERE id = NEW.village_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.villages SET 
      sons_daughters_count = (
        SELECT COUNT(*) 
        FROM public.village_memberships 
        WHERE village_id = OLD.village_id
      ),
      updated_at = now()
    WHERE id = OLD.village_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for membership count updates
CREATE TRIGGER update_village_membership_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.village_memberships
  FOR EACH ROW EXECUTE FUNCTION update_village_membership_count();

-- Add indexes for better performance
CREATE INDEX idx_villages_region ON public.villages(region);
CREATE INDEX idx_villages_division ON public.villages(division);
CREATE INDEX idx_villages_subdivision ON public.villages(subdivision);
CREATE INDEX idx_villages_overall_rating ON public.villages(overall_rating);
CREATE INDEX idx_villages_view_count ON public.villages(view_count);
CREATE INDEX idx_villages_created_at ON public.villages(created_at);
CREATE INDEX idx_village_ratings_village_id ON public.village_ratings(village_id);
CREATE INDEX idx_village_memberships_village_id ON public.village_memberships(village_id);
CREATE INDEX idx_village_petitions_status ON public.village_petitions(petition_status);
CREATE INDEX idx_village_conflicts_status ON public.village_conflicts(current_status);