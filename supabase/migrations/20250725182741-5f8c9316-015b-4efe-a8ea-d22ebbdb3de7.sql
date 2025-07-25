-- Performance Optimization: Vote counting triggers and database optimizations (Fixed)

-- First, add missing columns to poll_votes table
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS hashed_ip TEXT;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create materialized view for poll statistics (caching layer)
CREATE MATERIALIZED VIEW poll_statistics AS
SELECT 
    p.id as poll_id,
    p.title,
    p.created_at,
    p.is_active,
    COUNT(pv.id) as total_votes,
    COUNT(DISTINCT pv.user_id) as unique_voters,
    COUNT(DISTINCT COALESCE(pv.session_id, pv.user_id::text)) as unique_sessions,
    COUNT(DISTINCT pv.region) as regions_count,
    AVG(CASE WHEN pv.created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as recent_engagement,
    COALESCE(p.view_count, 0) as view_count,
    CASE 
        WHEN COUNT(pv.id) > 0 THEN (COUNT(pv.id)::NUMERIC / GREATEST(COALESCE(p.view_count, 1), 1)) * 100
        ELSE 0 
    END as conversion_rate
FROM polls p
LEFT JOIN poll_votes pv ON p.id = pv.poll_id
GROUP BY p.id, p.title, p.created_at, p.is_active, p.view_count;

-- Create unique index for better performance
CREATE UNIQUE INDEX idx_poll_statistics_poll_id ON poll_statistics (poll_id);
CREATE INDEX idx_poll_statistics_active ON poll_statistics (is_active, total_votes DESC);
CREATE INDEX idx_poll_statistics_engagement ON poll_statistics (recent_engagement DESC);

-- Auto-refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_poll_statistics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY poll_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id_created_at ON poll_votes (poll_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id_poll_id ON poll_votes (user_id, poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_session_id_poll_id ON poll_votes (session_id, poll_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_poll_votes_region_created_at ON poll_votes (region, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_votes_ip_hash_created_at ON poll_votes (hashed_ip, created_at DESC) WHERE hashed_ip IS NOT NULL;

-- Composite indexes for fraud detection
CREATE INDEX IF NOT EXISTS idx_poll_votes_fraud_detection ON poll_votes (poll_id, hashed_ip, created_at) WHERE hashed_ip IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_poll_votes_device_fingerprint ON poll_votes (device_fingerprint, created_at) WHERE device_fingerprint IS NOT NULL;

-- Polls table optimizations
CREATE INDEX IF NOT EXISTS idx_polls_active_votes_count ON polls (is_active, votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_polls_creator_created_at ON polls (creator_id, created_at DESC);

-- Enhanced fraud detection tables
CREATE TABLE IF NOT EXISTS poll_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier_type TEXT NOT NULL, -- 'ip', 'user', 'session'
    identifier_value TEXT NOT NULL,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'vote', 'view', 'create'
    action_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier_type, identifier_value, poll_id, action_type, window_start)
);

CREATE INDEX idx_rate_limits_identifier ON poll_rate_limits (identifier_type, identifier_value, window_start);
CREATE INDEX idx_rate_limits_poll_action ON poll_rate_limits (poll_id, action_type, window_start);

-- CAPTCHA verification table
CREATE TABLE IF NOT EXISTS poll_captcha_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    captcha_token TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_captcha_session_poll ON poll_captcha_verifications (session_id, poll_id);
CREATE INDEX idx_captcha_expires_at ON poll_captcha_verifications (expires_at);

-- Enhanced bot detection patterns
CREATE TABLE IF NOT EXISTS poll_bot_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name TEXT NOT NULL,
    pattern_type TEXT NOT NULL, -- 'user_agent', 'timing', 'behavior', 'fingerprint'
    pattern_data JSONB NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common bot patterns
INSERT INTO poll_bot_patterns (pattern_name, pattern_type, pattern_data, risk_score) VALUES
('Common Bot User Agents', 'user_agent', '{"patterns": ["bot", "crawler", "spider", "scraper", "automated", "python-requests", "curl", "wget"]}', 85),
('Rapid Sequential Voting', 'timing', '{"max_votes_per_minute": 10, "max_votes_per_hour": 100}', 75),
('Identical Device Fingerprints', 'fingerprint', '{"min_different_ips": 3, "max_votes_per_fingerprint": 5}', 80),
('Suspicious Timing Patterns', 'behavior', '{"vote_intervals": [1, 2, 3, 5], "tolerance_seconds": 2}', 70);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier_type TEXT,
    p_identifier_value TEXT,
    p_poll_id UUID,
    p_action_type TEXT,
    p_limit_per_hour INTEGER DEFAULT 100
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current hour window
    window_start := DATE_TRUNC('hour', NOW());
    
    -- Get current count for this hour
    SELECT COALESCE(SUM(action_count), 0) INTO current_count
    FROM poll_rate_limits
    WHERE identifier_type = p_identifier_type
    AND identifier_value = p_identifier_value
    AND poll_id = p_poll_id
    AND action_type = p_action_type
    AND window_start >= DATE_TRUNC('hour', NOW());
    
    -- Check if limit exceeded
    IF current_count >= p_limit_per_hour THEN
        RETURN FALSE;
    END IF;
    
    -- Record this action
    INSERT INTO poll_rate_limits (
        identifier_type, identifier_value, poll_id, action_type, window_start
    ) VALUES (
        p_identifier_type, p_identifier_value, p_poll_id, p_action_type, window_start
    )
    ON CONFLICT (identifier_type, identifier_value, poll_id, action_type, window_start)
    DO UPDATE SET action_count = poll_rate_limits.action_count + 1;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced bot detection function
CREATE OR REPLACE FUNCTION detect_bot_behavior(
    p_user_agent TEXT,
    p_device_fingerprint TEXT,
    p_hashed_ip TEXT,
    p_poll_id UUID,
    p_session_id TEXT
) RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    pattern RECORD;
    vote_count INTEGER;
    ip_vote_count INTEGER;
    recent_votes INTEGER;
BEGIN
    -- Check user agent patterns
    FOR pattern IN 
        SELECT * FROM poll_bot_patterns 
        WHERE pattern_type = 'user_agent' AND is_active = TRUE
    LOOP
        IF p_user_agent IS NOT NULL THEN
            FOR i IN 0..jsonb_array_length(pattern.pattern_data->'patterns')-1 LOOP
                IF LOWER(p_user_agent) LIKE '%' || LOWER(pattern.pattern_data->'patterns'->>i) || '%' THEN
                    risk_score := risk_score + pattern.risk_score;
                    EXIT;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
    
    -- Check device fingerprint patterns
    IF p_device_fingerprint IS NOT NULL THEN
        SELECT COUNT(*) INTO vote_count
        FROM poll_votes
        WHERE device_fingerprint = p_device_fingerprint
        AND poll_id = p_poll_id;
        
        SELECT COUNT(DISTINCT hashed_ip) INTO ip_vote_count
        FROM poll_votes
        WHERE device_fingerprint = p_device_fingerprint;
        
        -- Same fingerprint from multiple IPs (suspicious)
        IF ip_vote_count >= 3 AND vote_count > 1 THEN
            risk_score := risk_score + 80;
        END IF;
    END IF;
    
    -- Check timing patterns
    SELECT COUNT(*) INTO recent_votes
    FROM poll_votes
    WHERE (
        (p_hashed_ip IS NOT NULL AND hashed_ip = p_hashed_ip) OR
        (p_session_id IS NOT NULL AND session_id = p_session_id)
    )
    AND poll_id = p_poll_id
    AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Rapid voting detection
    IF recent_votes > 10 THEN
        risk_score := risk_score + 75;
    ELSIF recent_votes > 5 THEN
        risk_score := risk_score + 50;
    END IF;
    
    RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;