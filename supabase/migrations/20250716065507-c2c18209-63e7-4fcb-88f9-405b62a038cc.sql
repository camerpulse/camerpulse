-- Add customization fields to polls table
ALTER TABLE public.polls 
ADD COLUMN theme_color TEXT DEFAULT 'cm-green',
ADD COLUMN banner_image_url TEXT,
ADD COLUMN anonymous_mode BOOLEAN DEFAULT false,
ADD COLUMN duration_days INTEGER DEFAULT 7;

-- Create storage bucket for poll banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('poll-banners', 'poll-banners', true);

-- Storage policies for poll banners
CREATE POLICY "Poll banners are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'poll-banners');

CREATE POLICY "Authenticated users can upload poll banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'poll-banners' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own poll banners" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'poll-banners' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own poll banners" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'poll-banners' AND auth.uid() IS NOT NULL);