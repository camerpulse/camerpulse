-- Enable RLS on all tables
ALTER TABLE public.moderator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderator_applications
CREATE POLICY "Users can create their own applications" 
ON public.moderator_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications" 
ON public.moderator_applications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their pending applications" 
ON public.moderator_applications FOR UPDATE 
USING (auth.uid() = user_id AND application_status = 'submitted');

CREATE POLICY "Admins can manage all applications" 
ON public.moderator_applications FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for civic_moderators
CREATE POLICY "Moderators can view their own profile" 
ON public.civic_moderators FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view active moderators" 
ON public.civic_moderators FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Admins can manage all moderators" 
ON public.civic_moderators FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderator_badges
CREATE POLICY "Public can view badges" 
ON public.moderator_badges FOR SELECT 
USING (true);

CREATE POLICY "System can award badges" 
ON public.moderator_badges FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage badges" 
ON public.moderator_badges FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderation_queue
CREATE POLICY "Users can create submissions" 
ON public.moderation_queue FOR INSERT 
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Submitters can view their submissions" 
ON public.moderation_queue FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Moderators can view assigned queue" 
ON public.moderation_queue FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.civic_moderators 
    WHERE user_id = auth.uid() AND id = assigned_to
));

CREATE POLICY "Moderators can update assigned submissions" 
ON public.moderation_queue FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.civic_moderators 
    WHERE user_id = auth.uid() AND id = assigned_to
));

CREATE POLICY "Admins can manage all queue items" 
ON public.moderation_queue FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for moderator_activities
CREATE POLICY "Moderators can view their activities" 
ON public.moderator_activities FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.civic_moderators 
    WHERE user_id = auth.uid() AND id = moderator_id
));

CREATE POLICY "System can log activities" 
ON public.moderator_activities FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all activities" 
ON public.moderator_activities FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
));