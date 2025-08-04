import { useState } from 'react';
import { uploadFile, uploadEvidenceFiles, validateFileForUpload, UploadResult } from '@/utils/fileUpload';
import { toast } from 'sonner';

export interface UseFileUploadReturn {
  uploading: boolean;
  uploadFile: (file: File, bucket: string, folder?: string, userId?: string) => Promise<UploadResult>;
  uploadEvidenceFiles: (files: File[], context: 'claim' | 'report', userId: string) => Promise<UploadResult[]>;
  validateFile: (file: File) => { valid: boolean; error?: string };
  uploadProgress: number;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadFile = async (
    file: File,
    bucket: string,
    folder?: string,
    userId?: string
  ): Promise<UploadResult> => {
    // Validate file first
    const validation = validateFileForUpload(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return {
        success: false,
        error: validation.error
      };
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadFile(file, bucket, folder, userId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        toast.success('File uploaded successfully');
      } else {
        toast.error(result.error || 'Upload failed');
      }

      return result;
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      return {
        success: false,
        error: 'Upload failed'
      };
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleUploadEvidenceFiles = async (
    files: File[],
    context: 'claim' | 'report',
    userId: string
  ): Promise<UploadResult[]> => {
    // Validate all files first
    for (const file of files) {
      const validation = validateFileForUpload(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return files.map(() => ({
          success: false,
          error: validation.error
        }));
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const results = await uploadEvidenceFiles(files, context, userId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} file(s) uploaded successfully`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} file(s) failed to upload`);
      }

      return results;
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      return files.map(() => ({
        success: false,
        error: 'Upload failed'
      }));
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  return {
    uploading,
    uploadFile: handleUploadFile,
    uploadEvidenceFiles: handleUploadEvidenceFiles,
    validateFile: validateFileForUpload,
    uploadProgress
  };
};