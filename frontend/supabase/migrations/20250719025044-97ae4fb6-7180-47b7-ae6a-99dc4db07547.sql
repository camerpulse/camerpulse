-- Create enhanced search and discovery tables
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  search_query TEXT NOT NULL,
  search_type TEXT NOT NULL DEFAULT 'village_search',
  filters_applied JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type TEXT,
  search_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.content_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_name TEXT NOT NULL UNIQUE,
  tag_category TEXT NOT NULL DEFAULT 'general',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.village_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  relevance_score NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(village_id, tag_id)
);

CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  search_filters JSONB DEFAULT '{}',
  notification_enabled BOOLEAN DEFAULT false,
  last_result_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.trending_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL UNIQUE,
  search_count INTEGER DEFAULT 1,
  trend_score NUMERIC(5,2) DEFAULT 1.0,
  last_searched TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_searches ENABLE ROW LEVEL SECURITY;

-- Search analytics policies
CREATE POLICY "System can insert search analytics" ON public.search_analytics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their search analytics" ON public.search_analytics
FOR SELECT USING (user_id = auth.uid());

-- Tags policies
CREATE POLICY "Tags are viewable by everyone" ON public.content_tags
FOR SELECT USING (true);

CREATE POLICY "Village tags are viewable by everyone" ON public.village_tags
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON public.content_tags
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Saved searches policies
CREATE POLICY "Users can manage their saved searches" ON public.saved_searches
FOR ALL USING (user_id = auth.uid());

-- Trending searches policies
CREATE POLICY "Trending searches are viewable by everyone" ON public.trending_searches
FOR SELECT USING (true);

CREATE POLICY "System can update trending searches" ON public.trending_searches
FOR ALL WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_query ON public.search_analytics(search_query);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at);

CREATE INDEX idx_village_tags_village_id ON public.village_tags(village_id);
CREATE INDEX idx_village_tags_tag_id ON public.village_tags(tag_id);

CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);

-- Create full-text search function for villages
CREATE OR REPLACE FUNCTION search_villages(
  p_query TEXT,
  p_region TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_min_rating NUMERIC DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  village_name TEXT,
  region TEXT,
  division TEXT,
  subdivision TEXT,
  overall_rating NUMERIC,
  sons_daughters_count INTEGER,
  view_count INTEGER,
  is_verified BOOLEAN,
  total_ratings_count INTEGER,
  infrastructure_score INTEGER,
  education_score INTEGER,
  health_score INTEGER,
  diaspora_engagement_score INTEGER,
  relevance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.village_name,
    v.region,
    v.division,
    v.subdivision,
    v.overall_rating,
    v.sons_daughters_count,
    v.view_count,
    v.is_verified,
    v.total_ratings_count,
    v.infrastructure_score,
    v.education_score,
    v.health_score,
    v.diaspora_engagement_score,
    CASE 
      WHEN p_query IS NOT NULL AND p_query != '' THEN
        similarity(v.village_name, p_query) * 0.5 +
        similarity(v.division, p_query) * 0.3 +
        similarity(v.subdivision, p_query) * 0.2
      ELSE 1.0
    END as relevance_score
  FROM public.villages v
  WHERE 
    (p_query IS NULL OR p_query = '' OR (
      v.village_name ILIKE '%' || p_query || '%' OR
      v.division ILIKE '%' || p_query || '%' OR
      v.subdivision ILIKE '%' || p_query || '%'
    ))
    AND (p_region IS NULL OR v.region = p_region)
    AND v.overall_rating >= p_min_rating
    AND (
      array_length(p_tags, 1) IS NULL OR
      EXISTS (
        SELECT 1 FROM public.village_tags vt
        JOIN public.content_tags ct ON vt.tag_id = ct.id
        WHERE vt.village_id = v.id
        AND ct.tag_name = ANY(p_tags)
      )
    )
  ORDER BY 
    CASE WHEN p_query IS NOT NULL AND p_query != '' THEN relevance_score ELSE v.overall_rating END DESC,
    v.view_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create trending search update function
CREATE OR REPLACE FUNCTION update_trending_search(p_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.trending_searches (search_query, search_count, last_searched)
  VALUES (p_query, 1, NOW())
  ON CONFLICT (search_query) 
  DO UPDATE SET 
    search_count = trending_searches.search_count + 1,
    trend_score = trending_searches.search_count + 1,
    last_searched = NOW();
END;
$$;