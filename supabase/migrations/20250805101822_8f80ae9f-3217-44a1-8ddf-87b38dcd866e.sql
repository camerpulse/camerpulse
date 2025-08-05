-- RLS Policies for petitions
CREATE POLICY "Petitions are viewable by everyone" 
ON public.petitions 
FOR SELECT 
USING (status = 'active' OR creator_id = auth.uid());

CREATE POLICY "Users can create petitions" 
ON public.petitions 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their petitions" 
ON public.petitions 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS Policies for signatures
CREATE POLICY "Signatures are viewable by everyone" 
ON public.petition_signatures 
FOR SELECT 
USING (true);

CREATE POLICY "Users can sign petitions" 
ON public.petition_signatures 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  (user_id IS NULL AND email IS NOT NULL)
);

CREATE POLICY "Users can update their signatures" 
ON public.petition_signatures 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for updates
CREATE POLICY "Updates are viewable by everyone" 
ON public.petition_updates 
FOR SELECT 
USING (true);

CREATE POLICY "Petition creators can create updates" 
ON public.petition_updates 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.petitions 
    WHERE id = petition_id AND creator_id = auth.uid()
  )
);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.petition_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can comment" 
ON public.petition_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their comments" 
ON public.petition_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments" 
ON public.petition_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update signature count
CREATE OR REPLACE FUNCTION public.update_petition_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.petitions 
    SET current_signatures = current_signatures + 1
    WHERE id = NEW.petition_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.petitions 
    SET current_signatures = current_signatures - 1
    WHERE id = OLD.petition_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for signature count
CREATE TRIGGER update_petition_signatures_trigger
  AFTER INSERT OR DELETE ON public.petition_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_petition_signature_count();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_petition_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamps
CREATE TRIGGER update_petitions_updated_at
  BEFORE UPDATE ON public.petitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_petition_timestamps();

CREATE TRIGGER update_petition_comments_updated_at
  BEFORE UPDATE ON public.petition_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_petition_timestamps();