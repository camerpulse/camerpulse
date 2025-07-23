import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Trash2, Upload, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';

interface TenderDocumentManagerProps {
  tenderId: string;
  bucket: string;
  folder?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowVerification?: boolean;
}

interface DocumentWithVerification {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  created_at: string;
  verification?: {
    id: string;
    status: 'pending' | 'verified' | 'rejected';
    notes?: string;
    verified_by?: string;
    verified_at?: string;
  };
}

export const TenderDocumentManager: React.FC<TenderDocumentManagerProps> = ({
  tenderId,
  bucket,
  folder = '',
  allowUpload = true,
  allowDelete = false,
  allowVerification = false
}) => {
  const [documents, setDocuments] = useState<DocumentWithVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationNotes, setVerificationNotes] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const { uploading, uploadFile } = useFileUpload();

  useEffect(() => {
    loadDocuments();
  }, [bucket, folder, tenderId]);

  const loadDocuments = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const folderPath = folder ? `${folder}/${tenderId}` : tenderId;
      
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

          // Get verification status
          const { data: verification } = await supabase
            .from('tender_document_verification')
            .select('*')
            .eq('tender_id', tenderId)
            .eq('document_name', file.name)
            .single();

          return {
            id: file.id || crypto.randomUUID(),
            name: file.name,
            url: publicUrl,
            path: `${folderPath}/${file.name}`,
            size: file.metadata?.size || 0,
            type: file.name.split('.').pop()?.toLowerCase() || '',
            created_at: file.created_at || new Date().toISOString(),
            verification: verification ? {
              id: verification.id,
              status: verification.verification_status as 'pending' | 'verified' | 'rejected',
              notes: verification.verification_notes,
              verified_by: verification.verified_by,
              verified_at: verification.verified_at
            } : undefined
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

  const downloadDocument = async (document: DocumentWithVerification) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(document.path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
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

  const deleteDocument = async (document: DocumentWithVerification) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([document.path]);

      if (error) throw error;

      // Delete verification record if exists
      if (document.verification) {
        await supabase
          .from('tender_document_verification')
          .delete()
          .eq('id', document.verification.id);
      }

      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      
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

  const verifyDocument = async (document: DocumentWithVerification, status: 'verified' | 'rejected') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const verificationData = {
        document_id: document.id,
        tender_id: tenderId,
        verified_by: user.user.id,
        verification_status: status,
        verification_notes: verificationNotes[document.id] || '',
        verified_at: new Date().toISOString(),
        document_name: document.name,
        document_url: document.url,
        file_size: document.size,
        file_type: document.type
      };

      if (document.verification) {
        // Update existing verification
        const { error } = await supabase
          .from('tender_document_verification')
          .update(verificationData)
          .eq('id', document.verification.id);

        if (error) throw error;
      } else {
        // Create new verification record
        const { error } = await supabase
          .from('tender_document_verification')
          .insert(verificationData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Document ${status} successfully`,
      });

      loadDocuments(); // Reload to get updated verification status
    } catch (error: any) {
      console.error('Error verifying document:', error);
      toast({
        title: "Error",
        description: "Failed to verify document",
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
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  const getVerificationIcon = (status?: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVerificationBadgeVariant = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
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
          Tender Documents
        </CardTitle>
        <CardDescription>
          Manage and verify tender documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No documents found</p>
            {allowUpload && (
              <p className="text-sm text-muted-foreground mt-2">
                Upload documents using the file upload component
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(document.name)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {document.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(document.size)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {document.type.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getVerificationIcon(document.verification?.status)}
                        <Badge variant={getVerificationBadgeVariant(document.verification?.status)} className="text-xs">
                          {document.verification?.status || 'unverified'}
                        </Badge>
                      </div>
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
                  </div>
                </div>

                {allowVerification && (
                  <div className="border-t pt-3 space-y-3">
                    <Textarea
                      placeholder="Verification notes..."
                      value={verificationNotes[document.id] || ''}
                      onChange={(e) => setVerificationNotes(prev => ({
                        ...prev,
                        [document.id]: e.target.value
                      }))}
                      className="min-h-[60px]"
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => verifyDocument(document, 'verified')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => verifyDocument(document, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>

                    {document.verification?.notes && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        <strong>Notes:</strong> {document.verification.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};