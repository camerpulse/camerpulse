import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Play, 
  Pause, 
  Volume2,
  Image as ImageIcon,
  Video,
  FileText,
  Clock,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useMediaUpload, type MediaFile } from '@/hooks/useMediaUpload';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MediaMessageProps {
  messageId: string;
  isOwn?: boolean;
  className?: string;
}

export const MediaMessage: React.FC<MediaMessageProps> = ({
  messageId,
  isOwn = false,
  className
}) => {
  const { getMessageMedia, getMediaUrl, downloadFile } = useMediaUpload();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      setLoading(true);
      const files = await getMessageMedia(messageId);
      setMediaFiles(files);
      setLoading(false);
    };

    loadMedia();
  }, [messageId]);

  if (loading) {
    return (
      <div className={cn("/* animate-pulse - disabled */", className)}>
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (mediaFiles.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {mediaFiles.map((mediaFile) => (
        <MediaFileDisplay 
          key={mediaFile.id}
          mediaFile={mediaFile}
          isOwn={isOwn}
          onDownload={() => downloadFile(mediaFile)}
        />
      ))}
    </div>
  );
};

interface MediaFileDisplayProps {
  mediaFile: MediaFile;
  isOwn: boolean;
  onDownload: () => void;
}

const MediaFileDisplay: React.FC<MediaFileDisplayProps> = ({
  mediaFile,
  isOwn,
  onDownload
}) => {
  const { getMediaUrl } = useMediaUpload();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const mediaUrl = getMediaUrl(mediaFile.file_path);
  
  const isExpired = new Date(mediaFile.expires_at) < new Date();
  const expiresIn = formatDistanceToNow(new Date(mediaFile.expires_at), { addSuffix: true });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    switch (mediaFile.file_type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isExpired) {
    return (
      <div className={cn(
        "p-3 rounded-lg border border-dashed border-destructive/50 bg-destructive/5",
        isOwn ? "ml-8" : "mr-8"
      )}>
        <div className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">File Expired</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {mediaFile.original_filename} • Expired {expiresIn}
        </p>
      </div>
    );
  }

  // Image display
  if (mediaFile.file_type === 'image') {
    return (
      <>
        <div className={cn(
          "relative group cursor-pointer",
          isOwn ? "ml-8" : "mr-8"
        )}>
          <img
            src={mediaUrl}
            alt={mediaFile.original_filename}
            className="max-w-sm max-h-64 rounded-lg object-cover"
            onClick={() => setShowFullImage(true)}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullImage(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>

          {/* File info */}
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(mediaFile.file_size_bytes)}</span>
            <div className="flex items-center space-x-2">
              {mediaFile.is_compressed && (
                <Badge variant="secondary" className="text-xs">
                  Compressed
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onDownload} className="h-6 px-2">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Full image modal */}
        {showFullImage && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <div className="relative max-w-full max-h-full">
              <img
                src={mediaUrl}
                alt={mediaFile.original_filename}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                variant="secondary"
                className="absolute top-4 right-4"
                onClick={() => setShowFullImage(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Video display
  if (mediaFile.file_type === 'video') {
    return (
      <div className={cn(
        "space-y-2",
        isOwn ? "ml-8" : "mr-8"
      )}>
        <video
          src={mediaUrl}
          controls
          className="max-w-sm max-h-64 rounded-lg"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(mediaFile.file_size_bytes)}</span>
          <Button variant="ghost" size="sm" onClick={onDownload} className="h-6 px-2">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Audio display
  if (mediaFile.file_type === 'audio') {
    return (
      <div className={cn(
        "p-3 bg-muted rounded-lg border max-w-sm",
        isOwn ? "ml-8" : "mr-8"
      )}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">Voice Note</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(mediaFile.file_size_bytes)}
            </p>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onDownload} className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        <audio
          src={mediaUrl}
          controls
          className="w-full mt-2"
          preload="metadata"
        >
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  }

  // Generic file display
  return (
    <div className={cn(
      "p-3 bg-muted rounded-lg border max-w-sm",
      isOwn ? "ml-8" : "mr-8"
    )}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            {getFileIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{mediaFile.original_filename}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(mediaFile.file_size_bytes)}
            {mediaFile.download_count > 0 && (
              <span className="ml-2">• {mediaFile.download_count} downloads</span>
            )}
          </p>
          
          {/* Expiration warning */}
          <div className="flex items-center space-x-1 mt-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Expires {expiresIn}
            </span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onDownload} className="h-8 w-8 p-0">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};