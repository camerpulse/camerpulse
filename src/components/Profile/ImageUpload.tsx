import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  Image as ImageIcon,
  Crown,
  Shield
} from 'lucide-react';

interface ImageUploadProps {
  type: 'avatar' | 'cover';
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string) => void;
  canUpload?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  type,
  currentImageUrl,
  onImageUpdate,
  canUpload = true,
  className = ""
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const bucketName = type === 'avatar' ? 'avatars' : 'covers';
  const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatar, 10MB for cover
  const acceptedTypes = type === 'avatar' 
    ? 'image/jpeg,image/png,image/webp,image/gif'
    : 'image/jpeg,image/png,image/webp';

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
    }

    const validTypes = acceptedTypes.split(',');
    if (!validTypes.includes(file.type)) {
      return `File type must be ${validTypes.join(', ')}`;
    }

    return null;
  };

  const uploadImage = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload images",
        variant: "destructive"
      });
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Update profile in database
      const updateField = type === 'avatar' ? 'avatar_url' : 'cover_image_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);

      toast({
        title: "Upload Successful",
        description: `${type === 'avatar' ? 'Profile picture' : 'Cover photo'} updated successfully`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeImage = async () => {
    if (!user || !currentImageUrl) return;

    setUploading(true);
    try {
      // Update profile in database
      const updateField = type === 'avatar' ? 'avatar_url' : 'cover_image_url';
      const { error } = await supabase
        .from('profiles')
        .update({ [updateField]: null })
        .eq('user_id', user.id);

      if (error) throw error;

      onImageUpdate('');

      toast({
        title: "Image Removed",
        description: `${type === 'avatar' ? 'Profile picture' : 'Cover photo'} removed successfully`,
      });

    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload && type === 'cover') {
    return (
      <Card className={`relative ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Cover Photo Restricted</h3>
              <p className="text-muted-foreground mb-4">
                Cover photos are only available for verified users and public officials
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Verification Required
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative ${className}`}>
      <CardContent className="p-4">
        <div
          className={`relative ${
            type === 'avatar' ? 'w-32 h-32 mx-auto' : 'w-full h-48'
          } ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } border-2 border-dashed rounded-lg overflow-hidden transition-colors`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {currentImageUrl ? (
            <>
              <img
                src={currentImageUrl}
                alt={type === 'avatar' ? 'Profile picture' : 'Cover photo'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={removeImage}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div 
              className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="p-4 bg-muted rounded-full mb-3">
                    {type === 'avatar' ? (
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {type === 'avatar' ? 'Add Profile Picture' : 'Add Cover Photo'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max {maxSize / (1024 * 1024)}MB • {acceptedTypes.replace(/image\//g, '').toUpperCase()}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {!currentImageUrl && !uploading && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};