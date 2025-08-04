-- Create storage buckets for messenger media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('messenger-media', 'messenger-media', false, 26214400, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm']);

-- Create media settings table for admin controls
CREATE TABLE IF NOT EXISTS public.messenger_media_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enable_all_attachments BOOLEAN DEFAULT true,
  enable_images_only BOOLEAN DEFAULT false,
  enable_voice_only BOOLEAN DEFAULT false,
  enable_videos BOOLEAN DEFAULT true,
  max_file_size_mb INTEGER DEFAULT 25,
  auto_delete_days INTEGER DEFAULT 30,
  enable_compression BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.messenger_media_settings (id) VALUES ('550e8400-e29b-41d4-a716-446655440000');

-- Create media metadata table to track uploads
CREATE TABLE IF NOT EXISTS public.messenger_media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  is_compressed BOOLEAN DEFAULT false,
  compression_ratio NUMERIC(5,2),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messenger media settings
ALTER TABLE public.messenger_media_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for media settings (admin only)
CREATE POLICY "Admins can manage media settings" ON public.messenger_media_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on media files
ALTER TABLE public.messenger_media_files ENABLE ROW LEVEL SECURITY;

-- Create policies for media files
CREATE POLICY "Users can view media files in their conversations" ON public.messenger_media_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = messenger_media_files.message_id 
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload media files to their conversations" ON public.messenger_media_files
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = messenger_media_files.message_id 
      AND cp.user_id = auth.uid()
    )
  );

-- Create storage policies for messenger media bucket
CREATE POLICY "Authenticated users can upload to messenger media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'messenger-media' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view media files in their conversations"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'messenger-media' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their own media files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'messenger-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to clean up expired media files
CREATE OR REPLACE FUNCTION public.cleanup_expired_media()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  expired_file RECORD;
BEGIN
  -- Get expired files
  FOR expired_file IN
    SELECT file_path, id
    FROM public.messenger_media_files
    WHERE expires_at < now()
  LOOP
    -- Delete from storage
    PERFORM storage.delete_object('messenger-media', expired_file.file_path);
    
    -- Delete metadata record
    DELETE FROM public.messenger_media_files WHERE id = expired_file.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$;

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messenger_media_settings_updated_at
  BEFORE UPDATE ON public.messenger_media_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messenger_media_files_updated_at
  BEFORE UPDATE ON public.messenger_media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();