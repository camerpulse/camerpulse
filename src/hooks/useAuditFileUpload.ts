import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export const useAuditFileUpload = () => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (
    files: File[], 
    auditId: string,
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<AuditDocument[]> => {
    setIsUploading(true);
    const uploadedDocs: AuditDocument[] = [];
    const progressMap = new Map<string, UploadProgress>();

    try {
      // Initialize progress tracking
      files.forEach(file => {
        const progress: UploadProgress = {
          fileName: file.name,
          progress: 0,
          status: 'uploading'
        };
        progressMap.set(file.name, progress);
      });

      setUploadProgress(Array.from(progressMap.values()));

      // Upload files sequentially to avoid overwhelming the server
      for (const file of files) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${auditId}/${Date.now()}-${file.name}`;
          
          // Update progress to show upload starting
          const currentProgress = progressMap.get(file.name)!;
          currentProgress.progress = 10;
          setUploadProgress(Array.from(progressMap.values()));
          onProgress?.(Array.from(progressMap.values()));

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('audit-documents')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw error;
          }

          // Update progress to completion
          currentProgress.progress = 100;
          currentProgress.status = 'completed';
          setUploadProgress(Array.from(progressMap.values()));
          onProgress?.(Array.from(progressMap.values()));

          // Get public URL for the uploaded file
          const { data: urlData } = supabase.storage
            .from('audit-documents')
            .getPublicUrl(fileName);

          uploadedDocs.push({
            id: data.path,
            name: file.name,
            size: file.size,
            type: file.type,
            url: urlData.publicUrl
          });

        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          
          const currentProgress = progressMap.get(file.name)!;
          currentProgress.status = 'error';
          setUploadProgress(Array.from(progressMap.values()));
          onProgress?.(Array.from(progressMap.values()));

          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
        }
      }

      return uploadedDocs;

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('audit-documents')
        .remove([filePath]);

      if (error) {
        throw error;
      }

      toast({
        title: "File Deleted",
        description: "The file has been successfully deleted."
      });

      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const downloadFile = async (filePath: string, fileName: string): Promise<void> => {
    try {
      const { data, error } = await supabase.storage
        .from('audit-documents')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${fileName}...`
      });

    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearProgress = () => {
    setUploadProgress([]);
  };

  return {
    uploadFiles,
    deleteFile,
    downloadFile,
    uploadProgress,
    isUploading,
    clearProgress
  };
};