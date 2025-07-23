import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Download, 
  X, 
  Eye, 
  Search,
  Filter,
  Folder,
  File
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: 'document' | 'image' | 'video' | 'other';
  url?: string;
  thumbnailUrl?: string;
  downloadCount: number;
}

interface FileManagementSystemProps {
  tenderId?: string;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  onFileSelect?: (file: FileItem) => void;
}

export default function FileManagementSystem({ 
  tenderId,
  allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.mp4'],
  maxFileSize = 10,
  onFileSelect
}: FileManagementSystemProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Tender_Specifications.pdf',
      type: 'application/pdf',
      size: 2.5 * 1024 * 1024,
      uploadDate: '2024-01-15',
      category: 'document',
      downloadCount: 23
    },
    {
      id: '2',
      name: 'Site_Layout.jpg',
      type: 'image/jpeg',
      size: 1.2 * 1024 * 1024,
      uploadDate: '2024-01-14',
      category: 'image',
      downloadCount: 15
    }
  ]);
  
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getFileCategory = (type: string): 'document' | 'image' | 'video' | 'other' => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.includes('pdf') || type.includes('doc')) return 'document';
    return 'other';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    for (const file of selectedFiles) {
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the ${maxFileSize}MB limit.`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an allowed file type.`,
          variant: "destructive",
        });
        continue;
      }

      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }
      
      // Add file to list
      const newFile: FileItem = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        category: getFileCategory(file.type),
        url: URL.createObjectURL(file),
        downloadCount: 0
      };
      
      setFiles(prev => [newFile, ...prev]);
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileDownload = (file: FileItem) => {
    // Update download count
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, downloadCount: f.downloadCount + 1 }
        : f
    ));
    
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
    
    toast({
      title: "Download Started",
      description: `Downloading ${file.name}...`,
    });
  };

  const handleFileDelete = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File Deleted",
      description: "The file has been removed successfully.",
    });
  };

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const FileGrid = ({ files }: { files: FileItem[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="relative">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getFileIcon(file.type)}
                <Badge variant="outline" className="text-xs">
                  {file.category}
                </Badge>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePreview(file)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleFileDownload(file)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleFileDelete(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <h4 className="font-medium text-sm mb-2 truncate" title={file.name}>
              {file.name}
            </h4>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Size: {formatFileSize(file.size)}</p>
              <p>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</p>
              <p>Downloads: {file.downloadCount}</p>
            </div>
            
            {onFileSelect && (
              <Button
                size="sm"
                className="w-full mt-3"
                onClick={() => onFileSelect(file)}
              >
                Select File
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const FileList = ({ files }: { files: FileItem[] }) => (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            {getFileIcon(file.type)}
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()} • {file.downloadCount} downloads
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" onClick={() => handlePreview(file)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleFileDownload(file)}>
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleFileDelete(file.id)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            File Upload
          </CardTitle>
          <CardDescription>
            Upload documents, images, and other files. Max size: {maxFileSize}MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-foreground">
                    Click to upload files
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Allowed types: {allowedTypes.join(', ')}
                  </span>
                </Label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept={allowedTypes.join(',')}
                  onChange={handleFileUpload}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="mt-4" 
                onClick={() => fileInputRef.current?.click()}
              >
                Select Files
              </Button>
            </div>
          </div>
          
          {/* Upload Progress */}
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Folder className="w-5 h-5 mr-2" />
              File Manager ({filteredFiles.length} files)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              <Button 
                variant={selectedCategory === 'document' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('document')}
              >
                Documents
              </Button>
              <Button 
                variant={selectedCategory === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('image')}
              >
                Images
              </Button>
              <Button 
                variant={selectedCategory === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('video')}
              >
                Videos
              </Button>
            </div>
          </div>

          {/* File Display */}
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="mt-6">
              <FileGrid files={filteredFiles} />
            </TabsContent>
            <TabsContent value="list" className="mt-6">
              <FileList files={filteredFiles} />
            </TabsContent>
          </Tabs>

          {filteredFiles.length === 0 && (
            <div className="text-center py-8">
              <File className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {files.length === 0 ? 'No files uploaded yet' : 'No files match your search criteria'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{previewFile.name}</h3>
              <Button variant="ghost" onClick={() => setPreviewFile(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {previewFile.category === 'image' && previewFile.url && (
              <img 
                src={previewFile.url} 
                alt={previewFile.name}
                className="max-w-full max-h-96 object-contain"
              />
            )}
            
            {previewFile.category === 'document' && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-2">Document preview not available</p>
                <Button 
                  className="mt-4"
                  onClick={() => handleFileDownload(previewFile)}
                >
                  Download to View
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}