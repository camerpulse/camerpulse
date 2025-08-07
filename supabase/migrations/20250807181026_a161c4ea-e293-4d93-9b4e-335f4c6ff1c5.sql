-- Phase 3: RLS Policies for Events and Healthcare Tables

-- Events policies (already partially exist, adding missing ones)
CREATE POLICY "Organizers can delete their events" 
ON public.events 
FOR DELETE 
USING (organizer_id = auth.uid());

-- Event ticket types policies (already exist)

-- Event speakers policies (already exist)

-- Event check-ins policies (already exist)

-- Hospitals policies (already exist)

-- Hospital ratings policies
CREATE POLICY "Hospital ratings are publicly viewable" 
ON public.hospital_ratings 
FOR SELECT 
USING (NOT is_flagged);

CREATE POLICY "Users can create hospital ratings" 
ON public.hospital_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hospital ratings" 
ON public.hospital_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Healthcare profiles policies
CREATE POLICY "Healthcare profiles are publicly viewable" 
ON public.healthcare_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own healthcare profile" 
ON public.healthcare_profiles 
FOR ALL 
USING (auth.uid() = user_id);

-- Villages and regional data policies
CREATE POLICY "Villages are publicly viewable" 
ON public.villages 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage villages" 
ON public.villages 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Village memberships policies
CREATE POLICY "Village memberships are publicly viewable" 
ON public.village_memberships 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own village memberships" 
ON public.village_memberships 
FOR ALL 
USING (auth.uid() = user_id);

-- Village ratings policies
CREATE POLICY "Village ratings are publicly viewable" 
ON public.village_ratings 
FOR SELECT 
USING (NOT is_flagged);

CREATE POLICY "Users can create village ratings" 
ON public.village_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own village ratings" 
ON public.village_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Discussion topics policies
CREATE POLICY "Discussions are publicly viewable" 
ON public.discussion_topics 
FOR SELECT 
USING (NOT is_locked);

CREATE POLICY "Users can create discussions" 
ON public.discussion_topics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions" 
ON public.discussion_topics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Discussion replies policies (already exist)

-- Civic entity reviews policies (already exist)

-- Trending topics policies (already exist)