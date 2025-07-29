-- Create watchlist functionality (skip storage since bucket exists)
CREATE TABLE IF NOT EXISTS audit_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  audit_id UUID NOT NULL REFERENCES audit_registry(id) ON DELETE CASCADE,
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true, "sms": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, audit_id)
);

-- Enable RLS on watchlists
ALTER TABLE audit_watchlists ENABLE ROW LEVEL SECURITY;

-- Create watchlist policies
CREATE POLICY "Users can manage their own watchlists" 
ON audit_watchlists 
FOR ALL 
USING (auth.uid() = user_id);

-- Create audit notifications table
CREATE TABLE IF NOT EXISTS audit_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audit_registry(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('status_change', 'new_comment', 'document_update', 'investigation_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on notifications
ALTER TABLE audit_notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "Users can view their own notifications" 
ON audit_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON audit_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_watchlists_user_id ON audit_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_watchlists_audit_id ON audit_watchlists(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_notifications_user_id ON audit_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_notifications_audit_id ON audit_notifications(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_notifications_is_read ON audit_notifications(user_id, is_read);

-- Add watchlist count to audit registry
ALTER TABLE audit_registry ADD COLUMN IF NOT EXISTS watchlist_count INTEGER DEFAULT 0;

-- Create function to update watchlist count
CREATE OR REPLACE FUNCTION update_audit_watchlist_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE audit_registry 
    SET watchlist_count = watchlist_count + 1 
    WHERE id = NEW.audit_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE audit_registry 
    SET watchlist_count = watchlist_count - 1 
    WHERE id = OLD.audit_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for watchlist count
DROP TRIGGER IF EXISTS trigger_update_watchlist_count ON audit_watchlists;
CREATE TRIGGER trigger_update_watchlist_count
  AFTER INSERT OR DELETE ON audit_watchlists
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_watchlist_count();

-- Create function to notify watchlist users
CREATE OR REPLACE FUNCTION notify_watchlist_users(
  p_audit_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_count INTEGER := 0;
BEGIN
  INSERT INTO audit_notifications (audit_id, user_id, notification_type, title, message, metadata)
  SELECT 
    p_audit_id,
    aw.user_id,
    p_notification_type,
    p_title,
    p_message,
    p_metadata
  FROM audit_watchlists aw
  WHERE aw.audit_id = p_audit_id
    AND (aw.notification_preferences->>'in_app')::boolean = true;
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  RETURN notification_count;
END;
$$;