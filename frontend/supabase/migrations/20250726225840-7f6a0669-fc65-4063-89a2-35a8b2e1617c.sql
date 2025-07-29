-- Create genealogy and ancestry tracking system for villages

-- Table for storing ancestor profiles
CREATE TABLE IF NOT EXISTS village_ancestors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  village_id UUID REFERENCES villages(id),
  full_name TEXT NOT NULL,
  given_names TEXT[],
  family_name TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  birth_village_id UUID REFERENCES villages(id),
  death_village_id UUID REFERENCES villages(id),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  occupation TEXT,
  traditional_title TEXT,
  migration_story TEXT,
  notable_achievements TEXT,
  oral_stories TEXT,
  photo_urls TEXT[],
  verified_by_elders BOOLEAN DEFAULT false,
  verification_notes TEXT,
  privacy_level TEXT DEFAULT 'family' CHECK (privacy_level IN ('private', 'family', 'village', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for family relationships between ancestors
CREATE TABLE IF NOT EXISTS ancestor_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ancestor_id UUID REFERENCES village_ancestors(id) ON DELETE CASCADE,
  related_ancestor_id UUID REFERENCES village_ancestors(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild',
    'uncle', 'aunt', 'nephew', 'niece', 'cousin', 'in_law'
  )),
  marriage_date DATE,
  marriage_village_id UUID REFERENCES villages(id),
  traditional_ceremony BOOLEAN DEFAULT false,
  relationship_notes TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ancestor_id, related_ancestor_id, relationship_type)
);

-- Table for village genealogy trees
CREATE TABLE IF NOT EXISTS village_family_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
  tree_name TEXT NOT NULL,
  founding_ancestor_id UUID REFERENCES village_ancestors(id),
  tree_description TEXT,
  is_founding_lineage BOOLEAN DEFAULT false,
  tree_visibility TEXT DEFAULT 'village' CHECK (tree_visibility IN ('private', 'family', 'village', 'public')),
  created_by UUID REFERENCES auth.users(id),
  collaborators UUID[],
  tree_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for migration patterns and village connections
CREATE TABLE IF NOT EXISTS village_migration_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_village_id UUID REFERENCES villages(id),
  to_village_id UUID REFERENCES villages(id),
  migration_period_start INTEGER, -- Year
  migration_period_end INTEGER,   -- Year
  migration_reason TEXT,
  migration_season TEXT,
  migration_route TEXT,
  family_groups_involved INTEGER,
  cultural_impact TEXT,
  oral_tradition_account TEXT,
  documented_evidence TEXT[],
  pattern_frequency TEXT CHECK (pattern_frequency IN ('one_time', 'seasonal', 'periodic', 'continuous')),
  created_by UUID REFERENCES auth.users(id),
  verified_by_elders BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for connecting users to their ancestral villages
CREATE TABLE IF NOT EXISTS user_village_ancestry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
  ancestor_id UUID REFERENCES village_ancestors(id),
  connection_type TEXT CHECK (connection_type IN ('birth', 'ancestral', 'marriage', 'adoption', 'migration')),
  generation_distance INTEGER, -- How many generations back
  connection_strength TEXT DEFAULT 'direct' CHECK (connection_strength IN ('direct', 'probable', 'possible', 'disputed')),
  evidence_type TEXT[],
  connection_story TEXT,
  verified_by_community BOOLEAN DEFAULT false,
  verification_votes INTEGER DEFAULT 0,
  is_primary_village BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, village_id, ancestor_id)
);

-- Table for genealogy DNA matches (future enhancement)
CREATE TABLE IF NOT EXISTS village_genealogy_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  village_id UUID REFERENCES villages(id),
  dna_provider TEXT,
  ethnic_composition JSONB,
  genetic_village_matches UUID[],
  confidence_level NUMERIC(3,2),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('private', 'family', 'research'))
);

-- Enable RLS on all tables
ALTER TABLE village_ancestors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ancestor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_family_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_migration_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_village_ancestry ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_genealogy_dna ENABLE ROW LEVEL SECURITY;

-- RLS Policies for village_ancestors
CREATE POLICY "Users can view public and village ancestors" ON village_ancestors
  FOR SELECT USING (
    privacy_level IN ('public', 'village') OR 
    user_id = auth.uid() OR
    privacy_level = 'family' AND EXISTS (
      SELECT 1 FROM user_village_ancestry uva 
      WHERE uva.village_id = village_ancestors.village_id 
      AND uva.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ancestors" ON village_ancestors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ancestors" ON village_ancestors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their ancestors" ON village_ancestors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ancestor_relationships
CREATE POLICY "Users can view relationships for accessible ancestors" ON ancestor_relationships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM village_ancestors va WHERE va.id = ancestor_id AND 
      (va.privacy_level IN ('public', 'village') OR va.user_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM village_ancestors va WHERE va.id = related_ancestor_id AND 
      (va.privacy_level IN ('public', 'village') OR va.user_id = auth.uid()))
  );

CREATE POLICY "Users can create relationships for their ancestors" ON ancestor_relationships
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM village_ancestors va WHERE va.id = ancestor_id AND va.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM village_ancestors va WHERE va.id = related_ancestor_id AND va.user_id = auth.uid())
  );

CREATE POLICY "Users can update relationships for their ancestors" ON ancestor_relationships
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM village_ancestors va WHERE va.id = ancestor_id AND va.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM village_ancestors va WHERE va.id = related_ancestor_id AND va.user_id = auth.uid())
  );

-- RLS Policies for village_family_trees
CREATE POLICY "Users can view accessible family trees" ON village_family_trees
  FOR SELECT USING (
    tree_visibility = 'public' OR
    created_by = auth.uid() OR
    auth.uid() = ANY(collaborators) OR
    (tree_visibility = 'village' AND EXISTS (
      SELECT 1 FROM user_village_ancestry uva 
      WHERE uva.village_id = village_family_trees.village_id 
      AND uva.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create family trees" ON village_family_trees
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their family trees" ON village_family_trees
  FOR UPDATE USING (
    created_by = auth.uid() OR auth.uid() = ANY(collaborators)
  );

-- RLS Policies for village_migration_patterns
CREATE POLICY "Users can view migration patterns" ON village_migration_patterns
  FOR SELECT USING (true);

CREATE POLICY "Users can create migration patterns" ON village_migration_patterns
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their migration patterns" ON village_migration_patterns
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for user_village_ancestry
CREATE POLICY "Users can view their ancestry connections" ON user_village_ancestry
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their ancestry connections" ON user_village_ancestry
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ancestry connections" ON user_village_ancestry
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for village_genealogy_dna
CREATE POLICY "Users can view their DNA data" ON village_genealogy_dna
  FOR SELECT USING (
    auth.uid() = user_id OR
    (privacy_level = 'research' AND EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ))
  );

CREATE POLICY "Users can manage their DNA data" ON village_genealogy_dna
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_village_ancestors_village_id ON village_ancestors(village_id);
CREATE INDEX idx_village_ancestors_user_id ON village_ancestors(user_id);
CREATE INDEX idx_ancestor_relationships_ancestor_id ON ancestor_relationships(ancestor_id);
CREATE INDEX idx_ancestor_relationships_related_ancestor_id ON ancestor_relationships(related_ancestor_id);
CREATE INDEX idx_village_family_trees_village_id ON village_family_trees(village_id);
CREATE INDEX idx_user_village_ancestry_user_id ON user_village_ancestry(user_id);
CREATE INDEX idx_user_village_ancestry_village_id ON user_village_ancestry(village_id);
CREATE INDEX idx_village_migration_patterns_villages ON village_migration_patterns(from_village_id, to_village_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_village_ancestors_updated_at 
  BEFORE UPDATE ON village_ancestors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ancestor_relationships_updated_at 
  BEFORE UPDATE ON ancestor_relationships 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_village_family_trees_updated_at 
  BEFORE UPDATE ON village_family_trees 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_village_migration_patterns_updated_at 
  BEFORE UPDATE ON village_migration_patterns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_village_ancestry_updated_at 
  BEFORE UPDATE ON user_village_ancestry 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();