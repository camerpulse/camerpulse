-- Phase 4: RLS Policies for Music, Jobs, and Admin Tables

-- Music-related tables policies
CREATE POLICY "Artist memberships are publicly viewable" 
ON public.artist_memberships 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create artist memberships" 
ON public.artist_memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist membership" 
ON public.artist_memberships 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Music releases policies
CREATE POLICY "Music releases are publicly viewable" 
ON public.music_releases 
FOR SELECT 
USING (true);

CREATE POLICY "Artists can manage their own releases" 
ON public.music_releases 
FOR ALL 
USING (artist_id IN (
  SELECT id FROM artist_memberships 
  WHERE user_id = auth.uid()
));

-- Music tracks policies
CREATE POLICY "Music tracks are publicly viewable" 
ON public.music_tracks 
FOR SELECT 
USING (true);

CREATE POLICY "Artists can manage tracks for their releases" 
ON public.music_tracks 
FOR ALL 
USING (release_id IN (
  SELECT mr.id FROM music_releases mr
  JOIN artist_memberships am ON mr.artist_id = am.id
  WHERE am.user_id = auth.uid()
));

-- Track purchases policies (already exist)

-- Music profiles policies
CREATE POLICY "Music profiles are publicly viewable" 
ON public.music_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own music profile" 
ON public.music_profiles 
FOR ALL 
USING (auth.uid() = user_id);

-- Job-related tables policies
CREATE POLICY "Jobs are publicly viewable" 
ON public.jobs 
FOR SELECT 
USING (status = 'open');

CREATE POLICY "Companies can manage their own jobs" 
ON public.jobs 
FOR ALL 
USING (posted_by = auth.uid());

-- Job applications policies
CREATE POLICY "Users can view their own job applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Companies can view applications for their jobs" 
ON public.job_applications 
FOR SELECT 
USING (job_id IN (
  SELECT id FROM jobs WHERE posted_by = auth.uid()
));

CREATE POLICY "Users can create job applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Job profiles policies
CREATE POLICY "Job profiles are publicly viewable" 
ON public.job_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own job profile" 
ON public.job_profiles 
FOR ALL 
USING (auth.uid() = user_id);

-- Job categories policies
CREATE POLICY "Job categories are publicly viewable" 
ON public.job_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage job categories" 
ON public.job_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Traditional leaders policies
CREATE POLICY "Traditional leaders are publicly viewable" 
ON public.traditional_leaders 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage traditional leaders" 
ON public.traditional_leaders 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Traditional leader ratings policies
CREATE POLICY "Leader ratings are publicly viewable" 
ON public.traditional_leader_ratings 
FOR SELECT 
USING (NOT is_flagged);

CREATE POLICY "Users can create leader ratings" 
ON public.traditional_leader_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leader ratings" 
ON public.traditional_leader_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);