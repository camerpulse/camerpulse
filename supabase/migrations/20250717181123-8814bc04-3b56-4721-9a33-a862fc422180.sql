-- Cross-Platform Stats Sync, AI Copyright Detection & Notification System - Fixed

-- Platform types enum
CREATE TYPE platform_type AS ENUM (
  'spotify', 'youtube', 'apple_music', 'boomplay', 'audiomack', 'deezer', 'soundcloud', 'tiktok', 'facebook', 'instagram'
);

-- Notification types enum
CREATE TYPE notification_type AS ENUM (
  'copyright_violation', 'stream_milestone', 'viral_spike', 'award_nomination', 'tip_received', 'fan_comment', 'chart_appearance', 'platform_sync_error'
);

-- Violation status enum
CREATE TYPE violation_status AS ENUM (
  'detected', 'reported', 'whitelisted', 'resolved', 'dismissed'
);

-- Artist external platform connections
CREATE TABLE public.artist_platform_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  platform_type platform_type NOT NULL,
  platform_url TEXT NOT NULL,
  platform_username TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_frequency_hours INTEGER NOT NULL DEFAULT 24,
  api_credentials JSONB DEFAULT '{}',
  connection_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist_id, platform_type)
);

-- Platform performance data
CREATE TABLE public.platform_performance_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.artist_platform_connections(id) ON DELETE CASCADE,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  stream_count BIGINT DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  monthly_listeners INTEGER DEFAULT 0,
  top_songs JSONB DEFAULT '[]',
  top_regions JSONB DEFAULT '[]',
  chart_positions JSONB DEFAULT '[]',
  engagement_metrics JSONB DEFAULT '{}',
  revenue_data JSONB DEFAULT '{}',
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(connection_id, date_recorded)
);

-- Audio fingerprints for copyright detection
CREATE TABLE public.audio_fingerprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,
  fingerprint_data JSONB NOT NULL,
  audio_duration_seconds INTEGER,
  sample_rate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_id)
);

-- Copyright violations detected
CREATE TABLE public.copyright_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint_id UUID NOT NULL REFERENCES public.audio_fingerprints(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL,
  platform_type platform_type NOT NULL,
  violation_url TEXT NOT NULL,
  violator_username TEXT,
  violator_channel_url TEXT,
  detection_confidence NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  violation_type TEXT NOT NULL,
  violation_description TEXT,
  screenshot_url TEXT,
  video_evidence_url TEXT,
  status violation_status NOT NULL DEFAULT 'detected',
  reported_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  dmca_claim_sent BOOLEAN NOT NULL DEFAULT FALSE,
  platform_response TEXT,
  admin_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Artist notifications
CREATE TABLE public.artist_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  user_id UUID NOT NULL,
  notification_type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  priority TEXT NOT NULL DEFAULT 'medium',
  action_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  sent_via_email BOOLEAN NOT NULL DEFAULT FALSE,
  sent_via_sms BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Notification preferences
CREATE TABLE public.artist_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type notification_type NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  frequency TEXT NOT NULL DEFAULT 'immediate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist_id, notification_type)
);

-- Sync logs for debugging
CREATE TABLE public.platform_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.artist_platform_connections(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  sync_duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Performance milestones for notifications
CREATE TABLE public.performance_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  platform_type platform_type,
  milestone_type TEXT NOT NULL,
  milestone_value BIGINT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_performance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copyright_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artist_platform_connections
CREATE POLICY "Artists can manage their own platform connections"
ON public.artist_platform_connections
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all platform connections"
ON public.artist_platform_connections
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for platform_performance_data
CREATE POLICY "Artists can view their own performance data"
ON public.platform_performance_data
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.artist_platform_connections apc
  WHERE apc.id = platform_performance_data.connection_id
  AND apc.user_id = auth.uid()
));

CREATE POLICY "System can insert performance data"
ON public.platform_performance_data
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all performance data"
ON public.platform_performance_data
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for audio_fingerprints
CREATE POLICY "Artists can view their own fingerprints"
ON public.audio_fingerprints
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.music_tracks mt
  JOIN public.music_releases mr ON mt.release_id = mr.id
  JOIN public.artist_memberships am ON mr.artist_id = am.id
  WHERE mt.id = audio_fingerprints.track_id
  AND am.user_id = auth.uid()
));

CREATE POLICY "System can manage fingerprints"
ON public.audio_fingerprints
FOR ALL
USING (true);

-- RLS Policies for copyright_violations
CREATE POLICY "Artists can view their own violations"
ON public.copyright_violations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.music_tracks mt
  JOIN public.music_releases mr ON mt.release_id = mr.id
  JOIN public.artist_memberships am ON mr.artist_id = am.id
  WHERE mt.id = copyright_violations.track_id
  AND am.user_id = auth.uid()
));

CREATE POLICY "Artists can update their violation status"
ON public.copyright_violations
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.music_tracks mt
  JOIN public.music_releases mr ON mt.release_id = mr.id
  JOIN public.artist_memberships am ON mr.artist_id = am.id
  WHERE mt.id = copyright_violations.track_id
  AND am.user_id = auth.uid()
));

CREATE POLICY "System can insert violations"
ON public.copyright_violations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage all violations"
ON public.copyright_violations
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for artist_notifications
CREATE POLICY "Artists can view their own notifications"
ON public.artist_notifications
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON public.artist_notifications
FOR INSERT
WITH CHECK (true);

-- RLS Policies for artist_notification_preferences
CREATE POLICY "Artists can manage their notification preferences"
ON public.artist_notification_preferences
FOR ALL
USING (user_id = auth.uid());

-- RLS Policies for platform_sync_logs
CREATE POLICY "Artists can view their sync logs"
ON public.platform_sync_logs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.artist_platform_connections apc
  WHERE apc.id = platform_sync_logs.connection_id
  AND apc.user_id = auth.uid()
));

CREATE POLICY "Admins can view all sync logs"
ON public.platform_sync_logs
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for performance_milestones
CREATE POLICY "Artists can view their milestones"
ON public.performance_milestones
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.artist_memberships am
  WHERE am.id = performance_milestones.artist_id
  AND am.user_id = auth.uid()
));

CREATE POLICY "System can manage milestones"
ON public.performance_milestones
FOR ALL
USING (true);

-- Functions for fingerprint generation (placeholder)
CREATE OR REPLACE FUNCTION public.generate_audio_fingerprint(p_track_id UUID, p_audio_url TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  fingerprint_id UUID;
  mock_hash TEXT;
BEGIN
  -- Generate mock fingerprint hash (in real implementation, this would use AI service)
  mock_hash := md5(p_audio_url || p_track_id::text || extract(epoch from now()));
  
  INSERT INTO public.audio_fingerprints (
    track_id,
    fingerprint_hash,
    fingerprint_data,
    audio_duration_seconds
  ) VALUES (
    p_track_id,
    mock_hash,
    jsonb_build_object(
      'generated_at', now(),
      'method', 'placeholder',
      'audio_url', p_audio_url
    ),
    180 -- default 3 minutes
  ) RETURNING id INTO fingerprint_id;
  
  RETURN fingerprint_id;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_artist_notification(
  p_artist_id UUID,
  p_user_id UUID,
  p_notification_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
  pref_record RECORD;
BEGIN
  -- Check if notifications are enabled for this type
  SELECT * INTO pref_record
  FROM public.artist_notification_preferences
  WHERE artist_id = p_artist_id AND notification_type = p_notification_type;
  
  IF NOT FOUND OR pref_record.enabled THEN
    INSERT INTO public.artist_notifications (
      artist_id, user_id, notification_type, title, message, data, priority
    ) VALUES (
      p_artist_id, p_user_id, p_notification_type, p_title, p_message, p_data, p_priority
    ) RETURNING id INTO notification_id;
  END IF;
  
  RETURN notification_id;
END;
$$;

-- Function to sync platform data (placeholder)
CREATE OR REPLACE FUNCTION public.sync_platform_data(p_connection_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{"status": "initiated", "records_synced": 0}';
  connection_record RECORD;
BEGIN
  -- Get connection details
  SELECT * INTO connection_record
  FROM public.artist_platform_connections
  WHERE id = p_connection_id AND sync_enabled = true;
  
  IF NOT FOUND THEN
    RETURN '{"status": "error", "message": "Connection not found or sync disabled"}';
  END IF;
  
  -- Log sync start
  INSERT INTO public.platform_sync_logs (
    connection_id, sync_type, status, started_at
  ) VALUES (
    p_connection_id, 'manual', 'started', now()
  );
  
  -- Update last synced timestamp
  UPDATE public.artist_platform_connections
  SET last_synced_at = now()
  WHERE id = p_connection_id;
  
  result := result || jsonb_build_object(
    'connection_id', p_connection_id,
    'platform', connection_record.platform_type,
    'sync_time', now()
  );
  
  RETURN result;
END;
$$;

-- Function to check milestones
CREATE OR REPLACE FUNCTION public.check_performance_milestones(
  p_artist_id UUID,
  p_track_id UUID,
  p_platform_type platform_type,
  p_stream_count BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  milestones INTEGER[] := ARRAY[1000, 5000, 10000, 50000, 100000, 500000, 1000000];
  milestone_value INTEGER;
  notifications_created INTEGER := 0;
BEGIN
  FOREACH milestone_value IN ARRAY milestones
  LOOP
    IF p_stream_count >= milestone_value THEN
      -- Check if milestone already achieved
      IF NOT EXISTS (
        SELECT 1 FROM public.performance_milestones
        WHERE artist_id = p_artist_id
        AND track_id = p_track_id
        AND platform_type = p_platform_type
        AND milestone_type = 'streams'
        AND milestone_value = milestone_value
      ) THEN
        -- Create milestone record
        INSERT INTO public.performance_milestones (
          artist_id, track_id, platform_type, milestone_type, milestone_value
        ) VALUES (
          p_artist_id, p_track_id, p_platform_type, 'streams', milestone_value
        );
        
        notifications_created := notifications_created + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN notifications_created;
END;
$$;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_platform_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artist_platform_connections_updated_at
BEFORE UPDATE ON public.artist_platform_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_sync_timestamp();

CREATE TRIGGER update_audio_fingerprints_updated_at
BEFORE UPDATE ON public.audio_fingerprints
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_sync_timestamp();

CREATE TRIGGER update_copyright_violations_updated_at
BEFORE UPDATE ON public.copyright_violations
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_sync_timestamp();

CREATE TRIGGER update_artist_notification_preferences_updated_at
BEFORE UPDATE ON public.artist_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_sync_timestamp();

-- Indexes for performance (using unique names)
CREATE INDEX idx_platform_connections_artist_new ON public.artist_platform_connections(artist_id);
CREATE INDEX idx_platform_connections_user_new ON public.artist_platform_connections(user_id);
CREATE INDEX idx_platform_performance_connection_new ON public.platform_performance_data(connection_id);
CREATE INDEX idx_platform_performance_date_new ON public.platform_performance_data(date_recorded);
CREATE INDEX idx_fingerprints_track_new ON public.audio_fingerprints(track_id);
CREATE INDEX idx_violations_track_new ON public.copyright_violations(track_id);
CREATE INDEX idx_violations_status_new ON public.copyright_violations(status);
CREATE INDEX idx_notifications_artist_new ON public.artist_notifications(artist_id);
CREATE INDEX idx_notifications_user_new ON public.artist_notifications(user_id);
CREATE INDEX idx_notifications_unread_new ON public.artist_notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_milestones_artist_new ON public.performance_milestones(artist_id);

-- Insert default notification preferences for existing artists
INSERT INTO public.artist_notification_preferences (artist_id, user_id, notification_type)
SELECT 
  am.id,
  am.user_id,
  notification_types.type
FROM public.artist_memberships am
CROSS JOIN (
  VALUES 
    ('copyright_violation'::notification_type),
    ('stream_milestone'::notification_type),
    ('viral_spike'::notification_type),
    ('award_nomination'::notification_type),
    ('tip_received'::notification_type),
    ('fan_comment'::notification_type),
    ('chart_appearance'::notification_type)
) AS notification_types(type)
ON CONFLICT (artist_id, notification_type) DO NOTHING;