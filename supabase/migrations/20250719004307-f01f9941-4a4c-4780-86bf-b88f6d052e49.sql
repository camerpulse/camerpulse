-- Check if badge_type enum already exists and create other missing enums
DO $$ 
BEGIN
    -- Create moderator_status enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderator_status') THEN
        CREATE TYPE public.moderator_status AS ENUM ('pending', 'approved', 'rejected', 'suspended', 'inactive');
    END IF;
    
    -- Create application_status enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE public.application_status AS ENUM ('submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected');
    END IF;
    
    -- Create submission_status enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected', 'needs_clarification');
    END IF;
    
    -- Add new values to existing app_role enum (only if they don't exist)
    BEGIN
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'village_moderator';
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'subdivision_moderator';
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'regional_moderator';
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'national_civic_lead';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;