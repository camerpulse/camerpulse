-- RLS Policies for petitions
CREATE POLICY "Public can view active petitions" 
ON public.petitions 
FOR SELECT 
USING (status = 'active' AND published_at IS NOT NULL);

CREATE POLICY "Users can view their own petitions" 
ON public.petitions 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create petitions" 
ON public.petitions 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own petitions" 
ON public.petitions 
FOR UPDATE 
USING (auth.uid() = created_by AND status IN ('draft', 'pending_review'));

CREATE POLICY "Admins can manage all petitions" 
ON public.petitions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- RLS Policies for signatures
CREATE POLICY "Public can view public signatures" 
ON public.petition_signatures 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own signatures" 
ON public.petition_signatures 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can sign petitions" 
ON public.petition_signatures 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Petition creators can view all signatures on their petitions" 
ON public.petition_signatures 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.petitions p
    WHERE p.id = petition_signatures.petition_id
    AND p.created_by = auth.uid()
  )
);

-- RLS Policies for updates
CREATE POLICY "Public can view petition updates" 
ON public.petition_updates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.petitions p
    WHERE p.id = petition_updates.petition_id
    AND p.status = 'active'
  )
);

CREATE POLICY "Petition creators can manage updates" 
ON public.petition_updates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.petitions p
    WHERE p.id = petition_updates.petition_id
    AND p.created_by = auth.uid()
  )
);

-- RLS Policies for comments
CREATE POLICY "Public can view approved comments" 
ON public.petition_comments 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Users can create comments" 
ON public.petition_comments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can edit their own comments" 
ON public.petition_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for reactions
CREATE POLICY "Public can view reactions" 
ON public.petition_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own reactions" 
ON public.petition_reactions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION public.update_petition_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.petitions 
    SET signature_count = signature_count + 1,
        updated_at = now()
    WHERE id = NEW.petition_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.petitions 
    SET signature_count = signature_count - 1,
        updated_at = now()
    WHERE id = OLD.petition_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_petition_signature_count_trigger
  AFTER INSERT OR DELETE ON public.petition_signatures
  FOR EACH ROW EXECUTE FUNCTION public.update_petition_signature_count();