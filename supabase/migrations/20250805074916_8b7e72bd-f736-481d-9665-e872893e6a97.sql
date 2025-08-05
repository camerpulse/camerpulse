-- Phase 4-7: Massive System Simplification Migration
-- Remove broken AI system tables, simplify edge functions, clean up redundant configs

-- Remove complex AI intelligence tables
DROP TABLE IF EXISTS camerpulse_intelligence_learning_logs CASCADE;
DROP TABLE IF EXISTS ashen_jr_performance CASCADE;
DROP TABLE IF EXISTS ashen_simulation_results CASCADE;
DROP TABLE IF EXISTS ashen_security_logs CASCADE;
DROP TABLE IF EXISTS ashen_sync_config CASCADE;

-- Remove complex recommendation and export systems
DROP TABLE IF EXISTS recommendation_feedback CASCADE;
DROP TABLE IF EXISTS sentiment_export_requests CASCADE;

-- Remove complex copyright and violation systems
DROP TABLE IF EXISTS copyright_violations CASCADE;

-- Remove complex award and badge systems
DROP TABLE IF EXISTS award_jury CASCADE;
DROP TABLE IF EXISTS fan_badges CASCADE;
DROP TABLE IF EXISTS fan_leaderboards CASCADE;

-- Remove complex polling systems
DROP TABLE IF EXISTS poll_vote_log CASCADE;
DROP TABLE IF EXISTS poll_comment_likes CASCADE;
DROP TABLE IF EXISTS poll_template_usage CASCADE;

-- Remove complex civic systems
DROP TABLE IF EXISTS civic_alerts CASCADE;
DROP TABLE IF EXISTS claim_requests CASCADE;
DROP TABLE IF EXISTS party_claims CASCADE;

-- Remove complex system config tables
DROP TABLE IF EXISTS system_cache_config CASCADE;

-- Remove complex activity and notification systems
DROP TABLE IF EXISTS activity_annotations CASCADE;
DROP TABLE IF EXISTS artist_notifications CASCADE;

-- Remove complex feed scoring system
DROP TABLE IF EXISTS feed_content_scores CASCADE;

-- Remove complex trend detection
DROP TABLE IF EXISTS trend_detection CASCADE;

-- Remove diaspora virtual townhalls
DROP TABLE IF EXISTS diaspora_virtual_townhalls CASCADE;

-- Remove complex corruption tracking
DROP TABLE IF EXISTS corruption_case_updates CASCADE;

-- Remove complex professional profiles
DROP TABLE IF EXISTS professional_profiles CASCADE;