import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, Eye, Download, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  category: 'project_documents' | 'investment_proof' | 'identity' | 'other';
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
}

interface FileUploadManagerProps {
  category?: string;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  onFilesUploaded?: (files: UploadedFile[]) => void;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  category = 'other',
  maxFiles = 10,
  maxFileSize = 10,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  onFilesUploaded
}) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'project_proposal.pdf',
      size: 2500000,
      type: 'application/pdf',
      url: '/placeholder-pdf.pdf',
      uploadedAt: new Date('2024-07-15'),
      category: 'project_documents',
      status: 'completed'
    },
    {
      id: '2',
      name: 'investment_receipt.jpg',
      size: 1200000,
      type: 'image/jpeg',
      url: '/placeholder-image.jpg',
      uploadedAt: new Date('2024-07-14'),
      category: 'investment_proof',
      status: 'completed'
    }
  ]);
  const [dragActive, setDragActive] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }
      if (type.includes('*')) {
        return fileType.startsWith(type.replace('*', ''));
      }
      return fileType === type;
    });

    if (!isValidType) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = Date.now().toString();
    const fileName = `${fileId}_${file.name}`;
    
    // Create initial file object
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      uploadedAt: new Date(),
      category: category as any,
      status: 'uploading',
      progress: 0
    };

    setFiles(prev => [...prev, uploadedFile]);

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
      }

      // In a real implementation, you would upload to Supabase storage:
      // const { data, error } = await supabase.storage
      //   .from('diaspora-files')
      //   .upload(fileName, file);

      // For demo purposes, we'll use a placeholder URL
      const fileUrl = URL.createObjectURL(file);

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'completed', 
          url: fileUrl,
          progress: 100 
        } : f
      ));

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully.`
      });

      return { ...uploadedFile, status: 'completed', url: fileUrl };
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error' } : f
      ));

      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive"
      });

      throw error;
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `You can only upload up to ${maxFiles} files.`,
        variant: "destructive"
      });
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Invalid Files",
        description: errors.join('\n'),
        variant: "destructive"
      });
    }

    // Upload valid files
    const uploadPromises = validFiles.map(file => uploadFile(file));
    
    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      onFilesUploaded?.(uploadedFiles);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File Removed",
      description: "File has been removed from the list."
    });
  };

  const downloadFile = (file: UploadedFile) => {
    // In a real implementation, you would get the signed URL from Supabase
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project_documents': return 'bg-blue-500';
      case 'investment_proof': return 'bg-green-500';
      case 'identity': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload up to {maxFiles} files, max {maxFileSize}MB each
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Supported formats: {allowedTypes.join(', ')}
            </p>
            <Button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = allowedTypes.join(',');
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files) {
                    handleFiles(target.files);
                  }
                };
                input.click();
              }}
            >
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <File className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(file.category)}>
                        {file.category.replace('_', ' ')}
                      </Badge>
                      {getStatusIcon(file.status)}
                      {file.status === 'completed' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <Progress value={file.progress} className="mt-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};