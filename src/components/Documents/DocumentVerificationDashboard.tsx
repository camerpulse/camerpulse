import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationDocument {
  id: string;
  document_name: string;
  document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_at?: string;
  created_at: string;
  tender_id: string;
  file_size?: number;
  file_type?: string;
  tender?: {
    title: string;
    published_by_company_id: string;
  };
}

export const DocumentVerificationDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_document_verification')
        .select(`
          *,
          tenders!inner(title, published_by_company_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments((data || []).map((doc: any) => ({
        ...doc,
        verification_status: doc.verification_status as 'pending' | 'verified' | 'rejected',
        tender: doc.tenders || { title: 'Unknown', published_by_company_id: '' }
      })));
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

  const updateVerificationStatus = async (docId: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tender_document_verification')
        .update({
          verification_status: status,
          verification_notes: notes,
          verified_by: user.user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Document ${status} successfully`,
      });

      loadDocuments();
    } catch (error: any) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const downloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

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

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesSearch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tender?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.verification_status === statusFilter;
      const matchesTab = currentTab === 'all' || doc.verification_status === currentTab;
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusCounts = () => {
    return {
      all: documents.length,
      pending: documents.filter(d => d.verification_status === 'pending').length,
      verified: documents.filter(d => d.verification_status === 'verified').length,
      rejected: documents.filter(d => d.verification_status === 'rejected').length
    };
  };

  const counts = getStatusCounts();
  const filteredDocuments = getFilteredDocuments();

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Verification Dashboard
          </CardTitle>
          <CardDescription>
            Review and verify tender documents submitted by companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents or tenders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="relative">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending ({counts.pending})
                {counts.pending > 0 && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="verified" className="relative">
                Verified ({counts.verified})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="relative">
                Rejected ({counts.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-6">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No documents found matching your criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{doc.document_name}</span>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(doc.verification_status)}
                                <Badge variant={getStatusBadgeVariant(doc.verification_status)}>
                                  {doc.verification_status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              <strong>Tender:</strong> {doc.tender?.title || 'Unknown'}
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Size: {formatFileSize(doc.file_size)}</span>
                              <span>Type: {doc.file_type?.toUpperCase() || 'Unknown'}</span>
                              <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                              {doc.verified_at && (
                                <span>Verified: {new Date(doc.verified_at).toLocaleDateString()}</span>
                              )}
                            </div>

                            {doc.verification_notes && (
                              <div className="text-sm bg-muted/50 p-2 rounded mt-2">
                                <strong>Notes:</strong> {doc.verification_notes}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.document_url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadDocument(doc.document_url, doc.document_name)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>

                            {doc.verification_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateVerificationStatus(doc.id, 'verified')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateVerificationStatus(doc.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};