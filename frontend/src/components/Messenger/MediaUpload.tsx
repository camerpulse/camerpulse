import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Paperclip, 
  Image, 
  Video, 
  Mic, 
  X,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMediaUpload, type MediaSettings } from '@/hooks/useMediaUpload';
import { cn } from '@/lib/utils';

interface MediaUploadProps {
  onFileSelect: (file: File, type: string) => void;
  disabled?: boolean;
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onFileSelect,
  disabled = false,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings, fetchSettings } = useMediaUpload();
  const [selectedType, setSelectedType] = useState<string>('all');

  // Initialize settings on mount
  React.useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileSelect = (acceptedTypes: string, fileType: string) => {
    setSelectedType(fileType);
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptedTypes;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file, selectedType);
    }
    // Reset input
    event.target.value = '';
  };

  if (!settings?.enable_all_attachments) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled 
        className={cn("text-muted-foreground", className)}
      >
        <AlertCircle className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={disabled}
            className={cn("text-muted-foreground hover:text-foreground", className)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          {/* Images */}
          {(settings.enable_images_only || !settings.enable_voice_only) && (
            <DropdownMenuItem
              onClick={() => handleFileSelect('image/*', 'image')}
              className="cursor-pointer"
            >
              <Image className="h-4 w-4 mr-2 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP</p>
              </div>
            </DropdownMenuItem>
          )}

          {/* Videos */}
          {settings.enable_videos && !settings.enable_images_only && !settings.enable_voice_only && (
            <DropdownMenuItem
              onClick={() => handleFileSelect('video/*', 'video')}
              className="cursor-pointer"
            >
              <Video className="h-4 w-4 mr-2 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium">Video</p>
                <p className="text-xs text-muted-foreground">MP4, WebM</p>
              </div>
            </DropdownMenuItem>
          )}

          {/* Audio/Voice */}
          {(settings.enable_voice_only || !settings.enable_images_only) && (
            <DropdownMenuItem
              onClick={() => handleFileSelect('audio/*', 'audio')}
              className="cursor-pointer"
            >
              <Mic className="h-4 w-4 mr-2 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">Voice Note</p>
                <p className="text-xs text-muted-foreground">MP3, WAV, OGG</p>
              </div>
            </DropdownMenuItem>
          )}

          {/* All files */}
          {!settings.enable_images_only && !settings.enable_voice_only && (
            <DropdownMenuItem
              onClick={() => handleFileSelect('*/*', 'file')}
              className="cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium">Document</p>
                <p className="text-xs text-muted-foreground">Any file type</p>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

// Media preview component for uploaded files
interface MediaPreviewProps {
  file: File;
  onRemove: () => void;
  uploading?: boolean;
  uploadProgress?: number;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  file,
  onRemove,
  uploading = false,
  uploadProgress = 0
}) => {
  const [preview, setPreview] = useState<string>('');

  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (file.type.startsWith('video/')) return <Video className="h-6 w-6" />;
    if (file.type.startsWith('audio/')) return <Mic className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative p-3 bg-muted rounded-lg border">
      <div className="flex items-start space-x-3">
        {/* Preview or Icon */}
        <div className="flex-shrink-0">
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 bg-background rounded flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          
          {uploading && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={uploading}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};