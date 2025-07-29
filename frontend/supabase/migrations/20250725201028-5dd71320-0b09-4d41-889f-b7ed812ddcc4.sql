-- Create storage buckets for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('covers', 'covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies for avatars (public access)
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for cover photos (restricted to verified users)
CREATE POLICY "Cover images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'covers');

-- Function to check if user can upload cover photos
CREATE OR REPLACE FUNCTION public.can_upload_cover_photo(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT verified, profile_type INTO user_profile
  FROM public.profiles
  WHERE profiles.user_id = $1;
  
  -- Allow verified users, public officials, politicians, etc.
  RETURN (
    user_profile.verified = true OR
    user_profile.profile_type IN ('politician', 'public_official', 'ministry', 'senator', 'mp', 'minister', 'judge')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE POLICY "Verified users can upload cover photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.can_upload_cover_photo(auth.uid())
);

CREATE POLICY "Verified users can update their cover photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.can_upload_cover_photo(auth.uid())
);

CREATE POLICY "Verified users can delete their cover photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.can_upload_cover_photo(auth.uid())
);

-- Create function to get profile image URLs
CREATE OR REPLACE FUNCTION public.get_profile_image_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://wsiorhtiovwcajiarydw.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = '';

-- Add function to clean up old profile images when new ones are uploaded
CREATE OR REPLACE FUNCTION public.cleanup_old_profile_image()
RETURNS TRIGGER AS $$
DECLARE
  old_file_path TEXT;
BEGIN
  -- Extract file path from old URL if it exists
  IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url LIKE '%supabase.co/storage%' THEN
    old_file_path := regexp_replace(OLD.avatar_url, '^.*/avatars/', '');
    -- Delete the old file
    PERFORM storage.objects
    FROM storage.objects 
    WHERE bucket_id = 'avatars' AND name = old_file_path;
  END IF;
  
  -- Same for cover images
  IF OLD.cover_image_url IS NOT NULL AND OLD.cover_image_url LIKE '%supabase.co/storage%' THEN
    old_file_path := regexp_replace(OLD.cover_image_url, '^.*/covers/', '');
    PERFORM storage.objects
    FROM storage.objects 
    WHERE bucket_id = 'covers' AND name = old_file_path;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger to cleanup old images
DROP TRIGGER IF EXISTS cleanup_profile_images ON public.profiles;
CREATE TRIGGER cleanup_profile_images
  BEFORE UPDATE OF avatar_url, cover_image_url ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_profile_image();