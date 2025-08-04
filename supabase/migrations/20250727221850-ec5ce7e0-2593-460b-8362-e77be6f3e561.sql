-- Create tables for advanced marketplace recommendations

-- Product views tracking
CREATE TABLE IF NOT EXISTS public.product_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    session_id TEXT,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recommendation events for analytics and A/B testing
CREATE TABLE IF NOT EXISTS public.recommendation_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    recommendation_type TEXT NOT NULL,
    ab_test_group TEXT NOT NULL DEFAULT 'control',
    product_ids UUID[] NOT NULL DEFAULT '{}',
    context JSONB NOT NULL DEFAULT '{}',
    clicked_product_id UUID,
    clicked_at TIMESTAMP WITH TIME ZONE,
    converted BOOLEAN NOT NULL DEFAULT false,
    conversion_value NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User similarity scores for collaborative filtering
CREATE TABLE IF NOT EXISTS public.user_similarity_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id_1 UUID NOT NULL,
    user_id_2 UUID NOT NULL,
    similarity_score NUMERIC NOT NULL DEFAULT 0,
    similarity_type TEXT NOT NULL DEFAULT 'purchase_based',
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id_1, user_id_2, similarity_type)
);

-- Product recommendations cache
CREATE TABLE IF NOT EXISTS public.product_recommendations_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID,
    recommendation_type TEXT NOT NULL,
    recommended_products JSONB NOT NULL DEFAULT '[]',
    confidence_score NUMERIC NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B test configurations
CREATE TABLE IF NOT EXISTS public.ab_test_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    traffic_allocation JSONB NOT NULL DEFAULT '{"control": 50, "variant_a": 25, "variant_b": 25}',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    success_metrics JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_similarity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own product views" ON public.product_views
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view aggregated product views" ON public.product_views
    FOR SELECT USING (true);

CREATE POLICY "Users can create recommendation events" ON public.recommendation_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recommendation events" ON public.recommendation_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recommendation events" ON public.recommendation_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can manage similarity scores" ON public.user_similarity_scores
    FOR ALL USING (true);

CREATE POLICY "Users can view their own recommendation cache" ON public.product_recommendations_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendation cache" ON public.product_recommendations_cache
    FOR ALL USING (true);

CREATE POLICY "Admins can manage A/B test configs" ON public.ab_test_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public can view active A/B test configs" ON public.ab_test_configs
    FOR SELECT USING (is_active = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON public.product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_last_viewed ON public.product_views(last_viewed_at);

CREATE INDEX IF NOT EXISTS idx_recommendation_events_user_id ON public.recommendation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_events_type ON public.recommendation_events(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_events_ab_group ON public.recommendation_events(ab_test_group);

CREATE INDEX IF NOT EXISTS idx_user_similarity_user1 ON public.user_similarity_scores(user_id_1);
CREATE INDEX IF NOT EXISTS idx_user_similarity_user2 ON public.user_similarity_scores(user_id_2);
CREATE INDEX IF NOT EXISTS idx_user_similarity_score ON public.user_similarity_scores(similarity_score DESC);

CREATE INDEX IF NOT EXISTS idx_recommendations_cache_user ON public.product_recommendations_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_cache_expires ON public.product_recommendations_cache(expires_at);

-- Function to get similar users based on purchase patterns
CREATE OR REPLACE FUNCTION get_similar_users(target_user_id UUID, limit_users INTEGER DEFAULT 10)
RETURNS TABLE(user_id UUID, similarity_score NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN uss.user_id_1 = target_user_id THEN uss.user_id_2
            ELSE uss.user_id_1
        END as user_id,
        uss.similarity_score
    FROM user_similarity_scores uss
    WHERE (uss.user_id_1 = target_user_id OR uss.user_id_2 = target_user_id)
        AND uss.similarity_score > 0.1
    ORDER BY uss.similarity_score DESC
    LIMIT limit_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product view count
CREATE OR REPLACE FUNCTION increment_product_view(p_product_id UUID, p_user_id UUID DEFAULT NULL, p_session_id TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO product_views (user_id, product_id, session_id, view_count)
    VALUES (COALESCE(p_user_id, '00000000-0000-0000-0000-000000000000'::UUID), p_product_id, p_session_id, 1)
    ON CONFLICT (user_id, product_id) 
    DO UPDATE SET 
        view_count = product_views.view_count + 1,
        last_viewed_at = now(),
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user similarity (to be run periodically)
CREATE OR REPLACE FUNCTION calculate_user_similarities()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    other_user_record RECORD;
    common_categories INTEGER;
    total_categories INTEGER;
    similarity NUMERIC;
BEGIN
    -- Calculate similarity based on purchase categories
    FOR user_record IN 
        SELECT DISTINCT buyer_id 
        FROM marketplace_orders 
        WHERE status = 'completed' 
        AND created_at > now() - INTERVAL '6 months'
    LOOP
        FOR other_user_record IN 
            SELECT DISTINCT buyer_id 
            FROM marketplace_orders 
            WHERE status = 'completed' 
            AND buyer_id != user_record.buyer_id
            AND created_at > now() - INTERVAL '6 months'
        LOOP
            -- Calculate Jaccard similarity based on product categories
            WITH user1_categories AS (
                SELECT DISTINCT mp.category
                FROM marketplace_orders mo
                JOIN marketplace_products mp ON mo.product_id = mp.id
                WHERE mo.buyer_id = user_record.buyer_id 
                AND mo.status = 'completed'
            ),
            user2_categories AS (
                SELECT DISTINCT mp.category
                FROM marketplace_orders mo
                JOIN marketplace_products mp ON mo.product_id = mp.id
                WHERE mo.buyer_id = other_user_record.buyer_id 
                AND mo.status = 'completed'
            ),
            common AS (
                SELECT COUNT(*) as count
                FROM user1_categories u1
                INNER JOIN user2_categories u2 ON u1.category = u2.category
            ),
            total AS (
                SELECT COUNT(DISTINCT category) as count
                FROM (
                    SELECT category FROM user1_categories
                    UNION
                    SELECT category FROM user2_categories
                ) combined
            )
            SELECT common.count, total.count INTO common_categories, total_categories
            FROM common, total;
            
            IF total_categories > 0 THEN
                similarity := common_categories::NUMERIC / total_categories::NUMERIC;
                
                INSERT INTO user_similarity_scores (user_id_1, user_id_2, similarity_score, similarity_type)
                VALUES (user_record.buyer_id, other_user_record.buyer_id, similarity, 'purchase_based')
                ON CONFLICT (user_id_1, user_id_2, similarity_type)
                DO UPDATE SET 
                    similarity_score = EXCLUDED.similarity_score,
                    calculated_at = now();
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update product views updated_at
CREATE OR REPLACE FUNCTION update_product_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_views_updated_at
    BEFORE UPDATE ON product_views
    FOR EACH ROW
    EXECUTE FUNCTION update_product_views_updated_at();

-- Initial A/B test configuration
INSERT INTO ab_test_configs (test_name, description, traffic_allocation, success_metrics)
VALUES (
    'recommendation_algorithm_test',
    'Testing different recommendation algorithms',
    '{"control": 40, "personalized": 30, "trending": 30}',
    '["click_through_rate", "conversion_rate", "average_order_value"]'
) ON CONFLICT (test_name) DO NOTHING;