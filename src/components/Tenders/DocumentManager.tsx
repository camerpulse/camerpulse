import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentManagerProps {
  bucket: string;
  folder?: string;
  onDocumentSelect?: (document: any) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  bucket,
  folder = '',
  onDocumentSelect,
  allowUpload = true,
  allowDelete = false
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, [bucket, folder]);

  const loadDocuments = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const folderPath = folder ? `${user.user.id}/${folder}` : user.user.id;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const documentsWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(`${folderPath}/${file.name}`);

          return {
            ...file,
            url: publicUrl,
            path: `${folderPath}/${file.name}`
          };
        })
      );

      setDocuments(documentsWithUrls);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(document.path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (document: any) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([document.path]);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.name !== document.name));
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Manager
        </CardTitle>
        <CardDescription>
          Manage your uploaded documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents found</p>
            {allowUpload && (
              <p className="text-sm text-muted-foreground mt-2">
                Upload documents using the file upload component above
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                {getFileIcon(document.name)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {document.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(document.metadata?.size || 0)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {document.name.split('.').pop()?.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(document.url, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadDocument(document)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {allowDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(document)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  {onDocumentSelect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDocumentSelect(document)}
                      className="h-8 w-8 p-0"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};