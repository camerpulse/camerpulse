import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface MediaSettings {
  enable_all_attachments: boolean;
  enable_images_only: boolean;
  enable_voice_only: boolean;
  enable_videos: boolean;
  max_file_size_mb: number;
  auto_delete_days: number;
  enable_compression: boolean;
}

export interface MediaFile {
  id: string;
  message_id: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number;
  mime_type: string;
  uploaded_by: string;
  is_compressed: boolean;
  compression_ratio?: number;
  expires_at: string;
  download_count: number;
  created_at: string;
}

export const useMediaUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<MediaSettings | null>(null);

  // Fetch media settings
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('messenger_media_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching media settings:', error);
      // Return default settings if fetch fails
      const defaultSettings: MediaSettings = {
        enable_all_attachments: true,
        enable_images_only: false,
        enable_voice_only: false,
        enable_videos: true,
        max_file_size_mb: 25,
        auto_delete_days: 30,
        enable_compression: true,
      };
      setSettings(defaultSettings);
      return defaultSettings;
    }
  };

  // Validate file based on settings
  const validateFile = (file: File, mediaSettings: MediaSettings): string | null => {
    if (!mediaSettings.enable_all_attachments) {
      return 'Media uploads are currently disabled.';
    }

    const maxSizeBytes = mediaSettings.max_file_size_mb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${mediaSettings.max_file_size_mb}MB limit.`;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    if (mediaSettings.enable_images_only && !isImage) {
      return 'Only image files are allowed.';
    }

    if (mediaSettings.enable_voice_only && !isAudio) {
      return 'Only audio files are allowed.';
    }

    if (!mediaSettings.enable_videos && isVideo) {
      return 'Video uploads are disabled.';
    }

    // Check allowed mime types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported.';
    }

    return null;
  };

  // Compress image if needed
  const compressImage = (file: File): Promise<{ file: File; compressionRatio: number }> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve({ file, compressionRatio: 1 });
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1080p width)
        const maxWidth = 1080;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            
            const compressionRatio = file.size / compressedFile.size;
            resolve({ file: compressedFile, compressionRatio });
          } else {
            resolve({ file, compressionRatio: 1 });
          }
        }, 'image/webp', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Upload file to storage
  const uploadFile = async (
    file: File, 
    conversationId: string, 
    messageId: string
  ): Promise<MediaFile | null> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);

    try {
      // Fetch settings
      const mediaSettings = await fetchSettings();
      
      // Validate file
      const validationError = validateFile(file, mediaSettings);
      if (validationError) {
        toast({
          title: "Upload Error",
          description: validationError,
          variant: "destructive"
        });
        return null;
      }

      let finalFile = file;
      let compressionRatio = 1;

      // Compress if enabled and it's an image
      if (mediaSettings.enable_compression && file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        finalFile = compressed.file;
        compressionRatio = compressed.compressionRatio;
      }

      // Generate file path
      const fileExt = finalFile.name.split('.').pop();
      const fileName = `${user.id}/${conversationId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('messenger-media')
        .upload(fileName, finalFile);

      if (uploadError) throw uploadError;

      // Get file type category
      let fileType = 'file';
      if (finalFile.type.startsWith('image/')) fileType = 'image';
      else if (finalFile.type.startsWith('video/')) fileType = 'video';
      else if (finalFile.type.startsWith('audio/')) fileType = 'audio';

      // Save metadata
      const { data: mediaData, error: metadataError } = await supabase
        .from('messenger_media_files')
        .insert({
          message_id: messageId,
          original_filename: file.name,
          file_path: fileName,
          file_type: fileType,
          file_size_bytes: finalFile.size,
          mime_type: finalFile.type,
          uploaded_by: user.id,
          is_compressed: compressionRatio > 1,
          compression_ratio: compressionRatio > 1 ? compressionRatio : null,
        })
        .select()
        .single();

      if (metadataError) throw metadataError;

      toast({
        title: "Success",
        description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully${compressionRatio > 1 ? ` (compressed ${Math.round((compressionRatio - 1) * 100)}%)` : ''}`
      });

      return mediaData;
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Get media file URL
  const getMediaUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('messenger-media')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  // Download file and increment counter
  const downloadFile = async (mediaFile: MediaFile) => {
    try {
      // Increment download counter
      await supabase
        .from('messenger_media_files')
        .update({ download_count: mediaFile.download_count + 1 })
        .eq('id', mediaFile.id);

      // Get file URL and trigger download
      const url = getMediaUrl(mediaFile.file_path);
      const link = document.createElement('a');
      link.href = url;
      link.download = mediaFile.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      toast({
        title: "Download Error", 
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  // Get media files for a message
  const getMessageMedia = async (messageId: string): Promise<MediaFile[]> => {
    try {
      const { data, error } = await supabase
        .from('messenger_media_files')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching message media:', error);
      return [];
    }
  };

  return {
    uploading,
    settings,
    fetchSettings,
    uploadFile,
    getMediaUrl,
    downloadFile,
    getMessageMedia,
    validateFile
  };
};