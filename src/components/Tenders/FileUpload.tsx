import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  bucket: string;
  folder?: string;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in MB
  onUploadComplete?: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  uploadedFile?: UploadedFile;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  folder = '',
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxFiles = 5,
  maxSize = 10, // 10MB default
  onUploadComplete,
  disabled = false
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: FileWithProgress[] = acceptedFiles.slice(0, maxFiles).map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    const startIndex = files.length;
    setFiles(prev => [...prev, ...newFiles]);

    // Upload files
    for (let i = 0; i < newFiles.length; i++) {
      const fileItem = newFiles[i];
      await uploadFile(fileItem, startIndex + i, newFiles);
    }
  }, [maxFiles, bucket, folder, files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    disabled
  });

  const uploadFile = async (fileItem: FileWithProgress, index: number, newFiles: FileWithProgress[]) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const fileExt = fileItem.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${user.user.id}/${folder}/${fileName}` : `${user.user.id}/${fileName}`;

      // Update progress to show upload started
      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { ...f, progress: 10 }
          : f
      ));

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileItem.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const uploadedFile: UploadedFile = {
        id: data.id || Date.now().toString(),
        name: fileItem.file.name,
        size: fileItem.file.size,
        type: fileItem.file.type,
        url: publicUrl,
        path: filePath
      };

      // Update file status to completed
      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { 
              ...f, 
              progress: 100, 
              status: 'completed' as const,
              uploadedFile 
            }
          : f
      ));

      toast({
        title: "Upload successful",
        description: `${fileItem.file.name} has been uploaded successfully.`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      
      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { 
              ...f, 
              status: 'error' as const,
              error: error.message 
            }
          : f
      ));

      toast({
        title: "Upload failed",
        description: `Failed to upload ${fileItem.file.name}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const removeFile = async (index: number) => {
    const fileItem = files[index];
    
    // If file was uploaded successfully, delete from storage
    if (fileItem.status === 'completed' && fileItem.uploadedFile) {
      try {
        await supabase.storage
          .from(bucket)
          .remove([fileItem.uploadedFile.path]);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const completedFiles = files
    .filter(f => f.status === 'completed' && f.uploadedFile)
    .map(f => f.uploadedFile!);

  React.useEffect(() => {
    if (completedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(completedFiles);
    }
  }, [completedFiles.length]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Accepted: PDF, Word, Images • Max {maxFiles} files • Up to {maxSize}MB each
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {files.map((fileItem, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <File className="h-5 w-5 text-muted-foreground" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileItem.file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(fileItem.file.size)}
                      </span>
                      {fileItem.status === 'completed' && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      )}
                      {fileItem.status === 'error' && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
                    
                    {fileItem.status === 'uploading' && (
                      <Progress value={fileItem.progress} className="mt-2 h-2" />
                    )}
                    
                    {fileItem.status === 'error' && fileItem.error && (
                      <p className="text-xs text-destructive mt-1">
                        {fileItem.error}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};