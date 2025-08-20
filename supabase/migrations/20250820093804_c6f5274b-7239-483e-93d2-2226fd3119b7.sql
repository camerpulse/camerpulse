-- Add SET search_path to critical SECURITY DEFINER functions (batch 1)
-- increment_poll_view_count
CREATE OR REPLACE FUNCTION public.increment_poll_view_count(p_poll_id uuid, p_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update view count
  UPDATE polls SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_poll_id;
END;
$function$;

-- toggle_poll_bookmark
CREATE OR REPLACE FUNCTION public.toggle_poll_bookmark(p_poll_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  bookmark_exists BOOLEAN;
BEGIN
  -- Check if bookmark exists
  SELECT EXISTS(
    SELECT 1 FROM poll_bookmarks 
    WHERE poll_id = p_poll_id AND user_id = p_user_id::text
  ) INTO bookmark_exists;
  
  IF bookmark_exists THEN
    -- Remove bookmark
    DELETE FROM poll_bookmarks 
    WHERE poll_id = p_poll_id AND user_id = p_user_id::text;
    
    -- Decrement bookmark count
    UPDATE polls SET bookmark_count = GREATEST(0, COALESCE(bookmark_count, 0) - 1) 
    WHERE id = p_poll_id;
    
    RETURN false;
  ELSE
    -- Add bookmark
    INSERT INTO poll_bookmarks (poll_id, user_id) 
    VALUES (p_poll_id, p_user_id::text);
    
    -- Increment bookmark count
    UPDATE polls SET bookmark_count = COALESCE(bookmark_count, 0) + 1 
    WHERE id = p_poll_id;
    
    RETURN true;
  END IF;
END;
$function$;