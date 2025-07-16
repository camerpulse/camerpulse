-- RLS policies for poll_comments
CREATE POLICY "Users can view approved comments" ON poll_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create comments" ON poll_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON poll_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate comments" ON poll_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger for poll_comments
CREATE OR REPLACE FUNCTION update_poll_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_comments_updated_at
  BEFORE UPDATE ON poll_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_comments_updated_at();