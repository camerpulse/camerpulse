-- Create storage bucket for village photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'village-photos', 
  'village-photos', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Village Photo Albums
CREATE TABLE public.village_photo_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  album_name TEXT NOT NULL,
  description TEXT,
  cover_photo_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  photos_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Village Photos
CREATE TABLE public.village_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.village_photo_albums(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  photographer_name TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  photo_type TEXT NOT NULL DEFAULT 'general',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID NOT NULL,
  file_size BIGINT,
  image_width INTEGER,
  image_height INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Photo Likes
CREATE TABLE public.village_photo_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.village_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- Enable RLS
ALTER TABLE public.village_photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_photo_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Albums
CREATE POLICY "Albums are viewable by everyone" ON public.village_photo_albums
  FOR SELECT USING (true);

CREATE POLICY "Users can create albums" ON public.village_photo_albums
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own albums" ON public.village_photo_albums
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own albums" ON public.village_photo_albums
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for Photos
CREATE POLICY "Photos are viewable by everyone" ON public.village_photos
  FOR SELECT USING (true);

CREATE POLICY "Users can upload photos" ON public.village_photos
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own photos" ON public.village_photos
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own photos" ON public.village_photos
  FOR DELETE USING (auth.uid() = uploaded_by);

-- RLS Policies for Photo Likes
CREATE POLICY "Likes are viewable by everyone" ON public.village_photo_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.village_photo_likes
  FOR ALL USING (auth.uid() = user_id);

-- Storage Policies for village photos
CREATE POLICY "Village photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'village-photos');

CREATE POLICY "Authenticated users can upload village photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'village-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own village photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'village-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own village photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'village-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Indexes
CREATE INDEX idx_village_photo_albums_village_id ON public.village_photo_albums(village_id);
CREATE INDEX idx_village_photos_village_id ON public.village_photos(village_id);
CREATE INDEX idx_village_photos_album_id ON public.village_photos(album_id);
CREATE INDEX idx_village_photo_likes_photo_id ON public.village_photo_likes(photo_id);

-- Update triggers
CREATE TRIGGER update_village_photo_albums_updated_at
  BEFORE UPDATE ON public.village_photo_albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_village_photos_updated_at
  BEFORE UPDATE ON public.village_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update album photo counts
CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.village_photo_albums 
    SET photos_count = photos_count + 1
    WHERE id = NEW.album_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.village_photo_albums 
    SET photos_count = photos_count - 1
    WHERE id = OLD.album_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle album change
    IF OLD.album_id IS DISTINCT FROM NEW.album_id THEN
      IF OLD.album_id IS NOT NULL THEN
        UPDATE public.village_photo_albums 
        SET photos_count = photos_count - 1
        WHERE id = OLD.album_id;
      END IF;
      IF NEW.album_id IS NOT NULL THEN
        UPDATE public.village_photo_albums 
        SET photos_count = photos_count + 1
        WHERE id = NEW.album_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_album_photo_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.village_photos
  FOR EACH ROW EXECUTE FUNCTION update_album_photo_count();

-- Function to update photo likes count
CREATE OR REPLACE FUNCTION update_photo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.village_photos 
    SET likes_count = likes_count + 1
    WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.village_photos 
    SET likes_count = likes_count - 1
    WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photo_likes_count_trigger
  AFTER INSERT OR DELETE ON public.village_photo_likes
  FOR EACH ROW EXECUTE FUNCTION update_photo_likes_count();