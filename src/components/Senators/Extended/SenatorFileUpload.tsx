import { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/contexts/AuthContext';

interface SenatorFileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  context: 'claim' | 'report';
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const SenatorFileUpload = ({
  onFilesUploaded,
  context,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'application/pdf', '.doc,.docx,.txt'],
  className = ''
}: SenatorFileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { uploading, uploadEvidenceFiles, validateFile, uploadProgress } = useFileUpload();
  const { user } = useAuth();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!user) {
      return;
    }

    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      }
    });

    if (invalidFiles.length > 0) {
      console.error('Invalid files:', invalidFiles);
      return;
    }

    // Add files to state as uploading
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      name: file.name,
      url: '',
      size: file.size,
      type: file.type,
      status: 'uploading'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    try {
      // Upload files
      const results = await uploadEvidenceFiles(validFiles, context, user.id);
      
      // Update file statuses based on results
      setUploadedFiles(prev => 
        prev.map((file, index) => {
          const resultIndex = prev.length - validFiles.length + index;
          const result = results[resultIndex];
          
          if (result && result.success) {
            return {
              ...file,
              url: result.url || '',
              status: 'success'
            };
          } else {
            return {
              ...file,
              status: 'error',
              error: result?.error || 'Upload failed'
            };
          }
        })
      );

      // Notify parent of successful uploads
      const successfulUrls = results
        .filter(result => result.success)
        .map(result => result.url!)
        .filter(Boolean);
      
      if (successfulUrls.length > 0) {
        onFilesUploaded(successfulUrls);
      }

    } catch (error) {
      console.error('Upload error:', error);
      // Mark all as error
      setUploadedFiles(prev => 
        prev.map(file => 
          file.status === 'uploading' 
            ? { ...file, status: 'error', error: 'Upload failed' }
            : file
        )
      );
    }
  }, [user, uploadedFiles.length, maxFiles, validateFile, uploadEvidenceFiles, context, onFilesUploaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [handleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const canUploadMore = uploadedFiles.length < maxFiles && !uploading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canUploadMore && (
        <Card 
          className={`transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-dashed border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
        >
          <CardContent 
            className="p-6"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports images, PDFs, and documents (max 10MB each)
                </p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFiles.length}/{maxFiles} files uploaded
                </p>
              </div>
              <Button 
                variant="outline" 
                className="mt-4"
                disabled={uploading}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Choose Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'uploading' && (
                      <Badge variant="secondary">Uploading...</Badge>
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="ml-2 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {file.status === 'error' && file.error && (
                <p className="text-xs text-destructive mt-1">{file.error}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Upload Limits Info */}
      <div className="text-xs text-muted-foreground">
        <p>• Maximum {maxFiles} files</p>
        <p>• Each file must be under 10MB</p>
        <p>• Supported formats: Images, PDFs, Word documents, Text files</p>
      </div>
    </div>
  );
};