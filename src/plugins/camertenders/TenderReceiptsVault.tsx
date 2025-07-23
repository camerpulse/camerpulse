import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Check, 
  X, 
  Shield,
  Calendar,
  User,
  Filter
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReceiptDocument {
  id: string;
  tender_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
  verified_by?: string;
  verified_at?: string;
  verification_status: string;
  metadata: any;
  tender?: any;
}

export const TenderReceiptsVault: React.FC = () => {
  const [documents, setDocuments] = useState<ReceiptDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type?: string;
    status?: string;
    region?: string;
  }>({});
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedTender, setSelectedTender] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      let query = supabase
        .from('tender_receipts_vault')
        .select(`
          *,
          tender:tenders(title, region, category)
        `)
        .order('uploaded_at', { ascending: false });

      if (filter.type) {
        query = query.eq('document_type', filter.type);
      }
      if (filter.status) {
        query = query.eq('verification_status', filter.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedTender || !documentType) {
      toast({
        title: "Error",
        description: "Please select a file, tender, and document type",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Upload file to storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${selectedTender}/${documentType}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tender-receipts')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('tender-receipts')
        .getPublicUrl(filePath);

      // Insert document record
      const { error: insertError } = await supabase
        .from('tender_receipts_vault')
        .insert({
          tender_id: selectedTender,
          document_type: documentType,
          document_name: uploadFile.name,
          document_url: urlData.publicUrl,
          file_size: uploadFile.size,
          file_type: uploadFile.type,
          metadata: {
            original_name: uploadFile.name,
            upload_timestamp: new Date().toISOString()
          }
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      setUploadFile(null);
      setSelectedTender('');
      setDocumentType('');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (documentId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('tender_receipts_vault')
        .update({
          verification_status: status,
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Document ${status} successfully`,
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      verified: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bid_receipt': return <FileText className="h-4 w-4" />;
      case 'award_certificate': return <Shield className="h-4 w-4" />;
      case 'completion_certificate': return <Check className="h-4 w-4" />;
      case 'payment_receipt': return <Download className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Shield className="h-6 w-6 mr-2 text-blue-600" />
          Tender Receipts Vault
        </h2>
        <p className="text-muted-foreground">Secure document archiving for tender receipts and certificates</p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  value={filter.type || ''}
                  onValueChange={(value) => setFilter(prev => ({ ...prev, type: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="bid_receipt">Bid Receipt</SelectItem>
                    <SelectItem value="award_certificate">Award Certificate</SelectItem>
                    <SelectItem value="completion_certificate">Completion Certificate</SelectItem>
                    <SelectItem value="payment_receipt">Payment Receipt</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filter.status || ''}
                  onValueChange={(value) => setFilter(prev => ({ ...prev, status: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setFilter({})}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getTypeIcon(doc.document_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{doc.document_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Tender: {doc.tender?.title}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </span>
                          <span>
                            {Math.round(doc.file_size / 1024)} KB
                          </span>
                          <span className="capitalize">
                            {doc.document_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(doc.verification_status)}
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {doc.verification_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerification(doc.id, 'verified')}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerification(doc.id, 'rejected')}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {documents.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
              <p className="text-muted-foreground">
                No documents match your current filters.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload tender-related documents for secure archiving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select File
                </label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tender ID
                </label>
                <Input
                  placeholder="Enter tender ID"
                  value={selectedTender}
                  onChange={(e) => setSelectedTender(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Document Type
                </label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bid_receipt">Bid Receipt</SelectItem>
                    <SelectItem value="award_certificate">Award Certificate</SelectItem>
                    <SelectItem value="completion_certificate">Completion Certificate</SelectItem>
                    <SelectItem value="payment_receipt">Payment Receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleUpload}
                disabled={!uploadFile || !selectedTender || !documentType}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Document Analytics</CardTitle>
              <CardDescription>
                Overview of document storage and verification statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{documents.length}</div>
                  <div className="text-sm text-muted-foreground">Total Documents</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.verification_status === 'verified').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {documents.filter(d => d.verification_status === 'pending').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};