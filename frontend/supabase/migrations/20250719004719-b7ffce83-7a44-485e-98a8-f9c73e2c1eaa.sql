-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_moderator_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_moderator_applications_updated_at ON public.moderator_applications;
CREATE TRIGGER update_moderator_applications_updated_at
    BEFORE UPDATE ON public.moderator_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_moderator_updated_at();

DROP TRIGGER IF EXISTS update_civic_moderators_updated_at ON public.civic_moderators;
CREATE TRIGGER update_civic_moderators_updated_at
    BEFORE UPDATE ON public.civic_moderators
    FOR EACH ROW
    EXECUTE FUNCTION public.update_moderator_updated_at();

DROP TRIGGER IF EXISTS update_moderation_queue_updated_at ON public.moderation_queue;
CREATE TRIGGER update_moderation_queue_updated_at
    BEFORE UPDATE ON public.moderation_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.update_moderator_updated_at();

-- Create helper functions
CREATE OR REPLACE FUNCTION public.award_moderator_badge(
    p_moderator_id UUID,
    p_badge_type badge_type,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    badge_id UUID;
BEGIN
    INSERT INTO public.moderator_badges (
        moderator_id, badge_type, description
    ) VALUES (
        p_moderator_id, p_badge_type, p_description
    ) 
    ON CONFLICT (moderator_id, badge_type) DO NOTHING
    RETURNING id INTO badge_id;
    
    RETURN badge_id;
END;
$$;

-- Function to get moderator statistics
CREATE OR REPLACE FUNCTION public.get_moderator_stats(p_moderator_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    badge_count INTEGER;
    activity_count INTEGER;
    pending_queue INTEGER;
BEGIN
    -- Get badge count
    SELECT COUNT(*) INTO badge_count
    FROM public.moderator_badges
    WHERE moderator_id = p_moderator_id;
    
    -- Get activity count (last 30 days)
    SELECT COUNT(*) INTO activity_count
    FROM public.moderator_activities
    WHERE moderator_id = p_moderator_id
    AND created_at >= now() - INTERVAL '30 days';
    
    -- Get pending queue count
    SELECT COUNT(*) INTO pending_queue
    FROM public.moderation_queue mq
    JOIN public.civic_moderators cm ON cm.id = mq.assigned_to
    WHERE cm.id = p_moderator_id
    AND mq.status = 'pending';
    
    result := jsonb_build_object(
        'badge_count', badge_count,
        'activity_count', activity_count,
        'pending_queue', pending_queue,
        'last_updated', now()
    );
    
    RETURN result;
END;
$$;

-- Function to assign moderator automatically based on region
CREATE OR REPLACE FUNCTION public.auto_assign_moderator(
    p_submission_id UUID,
    p_region TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    moderator_id UUID;
BEGIN
    -- Find the most suitable moderator for the region
    SELECT cm.id INTO moderator_id
    FROM public.civic_moderators cm
    WHERE cm.status = 'approved'
    AND p_region = ANY(cm.coverage_regions)
    AND cm.moderator_role IN ('village_moderator', 'subdivision_moderator', 'regional_moderator')
    ORDER BY 
        CASE cm.moderator_role 
            WHEN 'village_moderator' THEN 1
            WHEN 'subdivision_moderator' THEN 2
            WHEN 'regional_moderator' THEN 3
            ELSE 4
        END,
        cm.total_edits ASC -- Assign to moderator with fewer tasks
    LIMIT 1;
    
    -- Update the submission with assigned moderator
    IF moderator_id IS NOT NULL THEN
        UPDATE public.moderation_queue
        SET assigned_to = moderator_id,
            updated_at = now()
        WHERE id = p_submission_id;
    END IF;
    
    RETURN moderator_id;
END;
$$;