-- Add missing values to existing event_status enum
ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'published';
ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'postponed';
ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'ongoing';