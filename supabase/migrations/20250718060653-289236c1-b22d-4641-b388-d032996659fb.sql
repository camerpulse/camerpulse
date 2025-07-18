-- Create missing enum types
DO $$ BEGIN
  CREATE TYPE civic_event_type AS ENUM (
    'civic', 'campaign', 'education', 'protest', 'music', 
    'business', 'youth', 'community', 'government', 'religious'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN  
  CREATE TYPE organizer_type AS ENUM (
    'verified_user', 'government_institution', 'political_party', 
    'company', 'school', 'ngo', 'artist', 'event_organizer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rsvp_status AS ENUM ('interested', 'going', 'not_going');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;